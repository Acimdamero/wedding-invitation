# Supabase Setup — 5 Minutes

Enable live RSVP and wishes for **Erzal & Dhea** (`wedding_slug: erzal-dhea`).

## Step 1 — Create project (1 min)

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Click **New project**
3. Name: `erzal-dhea-wedding`
4. Database password: choose a strong password (save it)
5. Region: **Southeast Asia (Singapore)** recommended
6. Click **Create new project** — wait ~60 seconds

## Step 2 — Run SQL schema (1 min)

1. Dashboard → **SQL Editor** → **New query**
2. Open `supabase/schema.sql` from this repo
3. Copy **entire file** → paste into editor
4. Click **Run** (or Cmd/Ctrl + Enter)
5. Confirm: **Table Editor** shows `rsvp_responses` and `wishes`

## Step 3 — Copy API keys (30 sec)

1. **Project Settings** (gear) → **API**
2. Copy:
   - **Project URL** → e.g. `https://abcdefgh.supabase.co`
   - **anon public** key → long JWT string

## Step 4 — Update config files (30 sec)

Edit **`js/config.js`**:

```js
window.WEDDING_CONFIG = {
  slug: 'erzal-dhea',
  canonicalUrl: 'https://erzal-dhea-wedding.vercel.app/',
  PHOTOS_ENABLED: false,
  supabaseUrl: 'https://YOUR_PROJECT_REF.supabase.co',
  supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
};
```

Edit **`admin/config.js`** with the **same** URL and anon key:

```js
window.ADMIN_CONFIG = {
  slug: 'erzal-dhea',
  supabaseUrl: 'https://YOUR_PROJECT_REF.supabase.co',
  supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  siteUrl: '../index.html',
};
```

> The anon key is safe in public repos — RLS blocks guests from reading data.

## Step 5 — Create admin user (1 min)

1. **Authentication** → **Users** → **Add user** → **Create new user**
2. Email: e.g. `admin@yourdomain.com`
3. Password: strong password for the couple
4. Enable **Auto Confirm User**
5. Click **Create user**

## Step 6 — Deploy & test (1 min)

```bash
git add js/config.js admin/config.js
git commit -m "Configure Supabase for RSVP and wishes"
git push origin main
```

Or redeploy Vercel if using Vercel-only deploy.

**Test:**

1. Open invitation → submit RSVP + wish
2. Open `/admin/` → log in → verify data in dashboard
3. Or check **Table Editor** in Supabase

## Troubleshooting

| Issue | Fix |
|-------|-----|
| "Mode demo" on forms | `supabaseUrl` / `supabaseAnonKey` still have placeholders |
| Insert fails | Re-run `schema.sql`; check RLS policies exist |
| Admin can't see data | Log in first; verify user is **confirmed** |
| CORS error | Wrong project URL in config |

## Optional: one-command automation

If you have a [Supabase access token](https://supabase.com/dashboard/account/tokens):

```bash
SUPABASE_ACCESS_TOKEN=sbp_... node scripts/supabase-autosetup.mjs
```

This creates the project, runs `schema.sql`, creates an admin user, updates config files, and tests INSERT.

**Interactive (paste URL + anon key):**

```bash
./scripts/supabase-quick-setup.sh
# or
node scripts/apply-config.js https://YOUR_REF.supabase.co eyJhbG...
```

Admin credentials are saved to `supabase/ADMIN-CREDENTIALS.local.md` (gitignored).

## Optional CLI (if installed)

```bash
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

Most users can skip CLI — SQL Editor is faster for this static site.
