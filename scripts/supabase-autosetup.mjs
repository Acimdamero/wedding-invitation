#!/usr/bin/env node
/**
 * Fully automated Supabase setup for Erzal & Dhea wedding invitation.
 *
 * Requires SUPABASE_ACCESS_TOKEN (from https://supabase.com/dashboard/account/tokens)
 *
 * Usage:
 *   SUPABASE_ACCESS_TOKEN=sbp_... node scripts/supabase-autosetup.mjs
 *
 * Optional env:
 *   SUPABASE_DB_PASSWORD  — database password (generated if omitted)
 *   SUPABASE_ADMIN_EMAIL  — default: admin@erzal-dhea.wedding
 *   SUPABASE_ADMIN_PASSWORD — generated if omitted
 */
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const SCHEMA_PATH = path.join(ROOT, 'supabase', 'schema.sql');
const CREDENTIALS_PATH = path.join(ROOT, 'supabase', 'ADMIN-CREDENTIALS.local.md');

const PROJECT_NAME = 'erzal-dhea-wedding';
const REGION = 'ap-southeast-1';
const WEDDING_SLUG = 'erzal-dhea';

const token = process.env.SUPABASE_ACCESS_TOKEN;
if (!token) {
  console.error('Missing SUPABASE_ACCESS_TOKEN.');
  console.error('Get one at: https://supabase.com/dashboard/account/tokens');
  console.error('Then run: SUPABASE_ACCESS_TOKEN=sbp_... node scripts/supabase-autosetup.mjs');
  process.exit(1);
}

const API = 'https://api.supabase.com/v1';

function generatePassword(len = 20) {
  const chars = 'abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%';
  const bytes = crypto.randomBytes(len);
  return Array.from(bytes, (b) => chars[b % chars.length]).join('');
}

async function api(method, endpoint, body) {
  const res = await fetch(`${API}${endpoint}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }
  if (!res.ok) {
    throw new Error(`${method} ${endpoint} → ${res.status}: ${JSON.stringify(data)}`);
  }
  return data;
}

async function waitForProject(ref, maxAttempts = 60) {
  for (let i = 0; i < maxAttempts; i++) {
    const project = await api('GET', `/projects/${ref}`);
    if (project.status === 'ACTIVE_HEALTHY') return project;
    process.stdout.write(`  Waiting for project (${project.status || 'provisioning'})… ${i + 1}/${maxAttempts}\r`);
    await new Promise((r) => setTimeout(r, 5000));
  }
  throw new Error('Project did not become healthy in time');
}

async function runSql(ref, query) {
  return api('POST', `/projects/${ref}/database/query`, { query });
}

async function getApiKeys(ref) {
  const keys = await api('GET', `/projects/${ref}/api-keys`);
  const anon = keys.find((k) => k.name === 'anon')?.api_key;
  const service = keys.find((k) => k.name === 'service_role')?.api_key;
  if (!anon || !service) throw new Error('Could not fetch API keys');
  return { anon, service };
}

async function createAdminUser(supabaseUrl, serviceKey, email, password) {
  const res = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
    method: 'POST',
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password, email_confirm: true }),
  });
  const data = await res.json();
  if (!res.ok) {
    if (data?.msg?.includes('already been registered') || data?.error_code === 'email_exists') {
      console.log('  Admin user already exists — skipping create');
      return;
    }
    throw new Error(`Create admin user failed: ${JSON.stringify(data)}`);
  }
}

async function testInsert(supabaseUrl, anonKey) {
  const res = await fetch(`${supabaseUrl}/rest/v1/rsvp_responses`, {
    method: 'POST',
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({
      name: 'Setup Test',
      attendance: 'hadir',
      guest_count: 1,
      event_type: 'resepsi',
      wedding_slug: WEDDING_SLUG,
      message: 'Automated setup test — safe to delete',
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Test INSERT failed (${res.status}): ${err}`);
  }
}

function patchConfigFiles(supabaseUrl, anonKey) {
  for (const file of ['js/config.js', 'admin/config.js']) {
    const full = path.join(ROOT, file);
    let src = fs.readFileSync(full, 'utf8');
    src = src.replace(/supabaseUrl:\s*'[^']*'/, `supabaseUrl: '${supabaseUrl}'`);
    src = src.replace(/supabaseAnonKey:\s*'[^']*'/, `supabaseAnonKey: '${anonKey}'`);
    fs.writeFileSync(full, src);
    console.log(`  Updated ${file}`);
  }
}

function writeCredentials({ supabaseUrl, projectRef, adminEmail, adminPassword, dbPassword }) {
  const md = `# Admin credentials — LOCAL ONLY (not committed)

Generated: ${new Date().toISOString()}

| Field | Value |
|-------|-------|
| Project | ${PROJECT_NAME} |
| Project ref | \`${projectRef}\` |
| Dashboard | https://supabase.com/dashboard/project/${projectRef} |
| API URL | ${supabaseUrl} |
| DB password | \`${dbPassword}\` |
| Admin email | \`${adminEmail}\` |
| Admin password | \`${adminPassword}\` |
| Admin login | https://erzal-dhea-wedding.vercel.app/admin/ |

> Store this file safely. It is listed in .gitignore.
`;
  fs.writeFileSync(CREDENTIALS_PATH, md);
  console.log(`  Wrote ${path.relative(ROOT, CREDENTIALS_PATH)}`);
}

async function main() {
  console.log('=== Supabase auto-setup: Erzal & Dhea wedding ===\n');

  const dbPassword = process.env.SUPABASE_DB_PASSWORD || generatePassword(24);
  const adminEmail = process.env.SUPABASE_ADMIN_EMAIL || 'admin@erzal-dhea.wedding';
  const adminPassword = process.env.SUPABASE_ADMIN_PASSWORD || generatePassword(16);

  // Reuse existing project if present
  const projects = await api('GET', '/projects');
  let project = projects.find((p) => p.name === PROJECT_NAME);

  if (project) {
    console.log(`Found existing project: ${project.name} (${project.id})`);
  } else {
    const orgs = await api('GET', '/organizations');
    if (!orgs.length) throw new Error('No Supabase organizations found on this account');
    const orgId = orgs[0].id;
    console.log(`Creating project "${PROJECT_NAME}" in org ${orgs[0].name}…`);
    project = await api('POST', '/projects', {
      organization_id: orgId,
      name: PROJECT_NAME,
      database_password: dbPassword,
      region: REGION,
    });
    console.log(`  Created project ref: ${project.id}`);
  }

  const ref = project.id;
  await waitForProject(ref);
  console.log('\nProject is healthy.');

  const supabaseUrl = `https://${ref}.supabase.co`;
  console.log('Running schema.sql…');
  const schema = fs.readFileSync(SCHEMA_PATH, 'utf8');
  await runSql(ref, schema);
  console.log('  Schema applied.');

  console.log('Fetching API keys…');
  const { anon, service } = await getApiKeys(ref);

  console.log('Creating admin user…');
  await createAdminUser(supabaseUrl, service, adminEmail, adminPassword);

  console.log('Updating config files…');
  patchConfigFiles(supabaseUrl, anon);

  console.log('Testing INSERT via REST API…');
  await testInsert(supabaseUrl, anon);
  console.log('  Test INSERT succeeded.');

  writeCredentials({ supabaseUrl, projectRef: ref, adminEmail, adminPassword, dbPassword });

  console.log('\n=== Setup complete ===');
  console.log(`Project URL: ${supabaseUrl}`);
  console.log(`Admin login: https://erzal-dhea-wedding.vercel.app/admin/`);
  console.log(`Credentials: supabase/ADMIN-CREDENTIALS.local.md (local only)`);
  console.log('\nDeploy:');
  console.log('  git add js/config.js admin/config.js');
  console.log('  git commit -m "Configure Supabase for RSVP and wishes"');
  console.log('  git push origin main');
}

main().catch((err) => {
  console.error('\nSetup failed:', err.message);
  process.exit(1);
});
