#!/usr/bin/env node
/**
 * Apply Supabase URL + anon key to js/config.js and admin/config.js
 * Usage: node scripts/apply-config.js <SUPABASE_URL> <ANON_KEY>
 */
'use strict';

const fs = require('fs');
const path = require('path');

const [url, anonKey] = process.argv.slice(2);

if (!url || !anonKey) {
  console.error('Usage: node scripts/apply-config.js <SUPABASE_URL> <ANON_KEY>');
  console.error('Example: node scripts/apply-config.js https://abcdefgh.supabase.co eyJhbG...');
  process.exit(1);
}

if (!url.startsWith('https://') || !url.includes('.supabase.co')) {
  console.error('Error: URL must look like https://YOUR_REF.supabase.co');
  process.exit(1);
}

if (!anonKey.startsWith('eyJ')) {
  console.error('Error: anon key should be a JWT starting with eyJ');
  process.exit(1);
}

const root = path.join(__dirname, '..');

function patchConfig(filePath, urlKey, anonKeyName) {
  const full = path.join(root, filePath);
  let src = fs.readFileSync(full, 'utf8');
  src = src.replace(
    new RegExp(`${urlKey}:\\s*'[^']*'`),
    `${urlKey}: '${url}'`
  );
  src = src.replace(
    new RegExp(`${anonKeyName}:\\s*'[^']*'`),
    `${anonKeyName}: '${anonKey}'`
  );
  fs.writeFileSync(full, src);
  console.log(`Updated ${filePath}`);
}

patchConfig('js/config.js', 'supabaseUrl', 'supabaseAnonKey');
patchConfig('admin/config.js', 'supabaseUrl', 'supabaseAnonKey');

console.log('\nDone. Next:');
console.log('  git add js/config.js admin/config.js');
console.log('  git commit -m "Configure Supabase for RSVP and wishes"');
console.log('  git push origin main');
