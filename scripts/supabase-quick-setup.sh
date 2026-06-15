#!/usr/bin/env bash
# Interactive Supabase setup — prompts for credentials and updates config files.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "=== Supabase Quick Setup — Erzal & Dhea Wedding ==="
echo ""
echo "If you don't have a project yet:"
echo "  1. Open https://supabase.com/dashboard/new/new-project"
echo "  2. Name: erzal-dhea-wedding | Region: Southeast Asia (Singapore)"
echo "  3. SQL Editor → paste supabase/schema.sql → Run"
echo "  4. Settings → API → copy Project URL and anon public key"
echo ""

read -rp "Supabase Project URL (https://xxxxx.supabase.co): " SUPABASE_URL
read -rp "Supabase anon public key (eyJ...): " SUPABASE_ANON_KEY

if [[ -z "$SUPABASE_URL" || -z "$SUPABASE_ANON_KEY" ]]; then
  echo "Error: both values are required." >&2
  exit 1
fi

node scripts/apply-config.js "$SUPABASE_URL" "$SUPABASE_ANON_KEY"

echo ""
echo "Testing connection…"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
  -X POST "${SUPABASE_URL}/rest/v1/rsvp_responses" \
  -H "apikey: ${SUPABASE_ANON_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_ANON_KEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=minimal" \
  -d '{"name":"CLI Test","attendance":"hadir","guest_count":1,"event_type":"resepsi","wedding_slug":"erzal-dhea"}')

if [[ "$HTTP_CODE" == "201" ]]; then
  echo "✓ Test INSERT succeeded (HTTP 201)"
else
  echo "⚠ Test INSERT returned HTTP $HTTP_CODE"
  echo "  If 404/42P01: run supabase/schema.sql in SQL Editor first"
  echo "  If 401: check anon key"
fi

echo ""
read -rp "Create admin user now? Requires service_role key (y/N): " CREATE_ADMIN
if [[ "${CREATE_ADMIN,,}" == "y" ]]; then
  read -rp "Admin email [admin@erzal-dhea.wedding]: " ADMIN_EMAIL
  ADMIN_EMAIL="${ADMIN_EMAIL:-admin@erzal-dhea.wedding}"
  read -rsp "Admin password (min 6 chars): " ADMIN_PASSWORD
  echo ""
  read -rsp "Service role key (Settings → API → service_role): " SERVICE_KEY
  echo ""

  HTTP_CODE=$(curl -s -o /tmp/supabase-admin-resp.json -w "%{http_code}" \
    -X POST "${SUPABASE_URL}/auth/v1/admin/users" \
    -H "apikey: ${SERVICE_KEY}" \
    -H "Authorization: Bearer ${SERVICE_KEY}" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"${ADMIN_EMAIL}\",\"password\":\"${ADMIN_PASSWORD}\",\"email_confirm\":true}")

  if [[ "$HTTP_CODE" == "200" || "$HTTP_CODE" == "201" ]]; then
    echo "✓ Admin user created: ${ADMIN_EMAIL}"
    CREDS_FILE="supabase/ADMIN-CREDENTIALS.local.md"
    cat > "$CREDS_FILE" <<EOF
# Admin credentials — LOCAL ONLY (not committed)

| Field | Value |
|-------|-------|
| Admin email | \`${ADMIN_EMAIL}\` |
| Admin password | \`${ADMIN_PASSWORD}\` |
| Admin login | https://erzal-dhea-wedding.vercel.app/admin/ |
EOF
    echo "  Saved to ${CREDS_FILE}"
  else
    echo "⚠ Admin user creation failed (HTTP $HTTP_CODE):"
    cat /tmp/supabase-admin-resp.json
  fi
fi

echo ""
echo "Done. Commit and deploy when ready."
