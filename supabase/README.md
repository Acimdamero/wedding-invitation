# Supabase Setup — Wedding RSVP & Wishes

Database backend for **Erzal & Dhea** wedding invitation (`wedding_slug: erzal-dhea`).

Works with static hosting (GitHub Pages) — no server required.

## Architecture

```
Guest browser (index.html)
    │  anon key + INSERT
    ▼
Supabase PostgreSQL
    ├── rsvp_responses
    └── wishes

Admin browser (admin/dashboard.html)
    │  anon key + Supabase Auth session
    ▼
Supabase PostgreSQL (SELECT via RLS for authenticated role)
```

**Security model:**

| Action | Who | How |
|--------|-----|-----|
| Submit RSVP | Public guests | `anon` role — INSERT allowed |
| Submit wish | Public guests | `anon` role — INSERT allowed |
| Read reports | Admin only | `authenticated` role — SELECT allowed |
| Service role key | Never in frontend | Keep in Supabase dashboard only |

## Step 1 — Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign in (free tier is sufficient).
2. Click **New project**.
3. Choose organization, name (e.g. `erzal-dhea-wedding`), database password, and region (Singapore recommended for Indonesia).
4. Wait for the project to finish provisioning.

## Step 2 — Run Database Schema

1. In Supabase Dashboard → **SQL Editor** → **New query**.
2. Copy the entire contents of [`schema.sql`](./schema.sql).
3. Click **Run**.
4. Verify in **Table Editor** that `rsvp_responses` and `wishes` tables exist.

## Step 3 — Get API Keys

1. Dashboard → **Project Settings** → **API**.
2. Copy:
   - **Project URL** → `supabaseUrl`
   - **anon public** key → `supabaseAnonKey`

> Never commit or expose the **service_role** key in GitHub or client-side code.

## Step 4 — Configure the Website

Edit `js/config.js` in the project root:

```js
window.WEDDING_CONFIG = {
  slug: 'erzal-dhea',
  supabaseUrl: 'https://YOUR_PROJECT.supabase.co',
  supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
};
```

Edit `admin/config.js` with the **same** URL and anon key:

```js
window.ADMIN_CONFIG = {
  slug: 'erzal-dhea',
  supabaseUrl: 'https://YOUR_PROJECT.supabase.co',
  supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  siteUrl: '../index.html',
};
```

## Step 5 — Create Admin User

1. Supabase Dashboard → **Authentication** → **Users** → **Add user** → **Create new user**.
2. Enter email and password (e.g. `admin@erzal-dhea.com` — use a real email you control).
3. Enable **Auto Confirm User** so login works immediately.
4. Share credentials securely with the couple / wedding organizer.

Admin login URL after deploy:

**https://acimdamero.github.io/erzal-dhea-wedding/admin/**

## Step 6 — Test Locally

```bash
cd wedding-invitation
python3 -m http.server 8080
```

1. Open http://localhost:8080 — submit RSVP and a wish.
2. Open http://localhost:8080/admin/ — log in and verify data appears.
3. Check Supabase **Table Editor** if data is missing (RLS or config issue).

## Step 7 — Deploy

Push to GitHub `main` branch. GitHub Pages serves both the invitation and admin:

- Invitation: `https://acimdamero.github.io/erzal-dhea-wedding/`
- Admin: `https://acimdamero.github.io/erzal-dhea-wedding/admin/`

## Tables Reference

### `rsvp_responses`

| Column | Type | Notes |
|--------|------|-------|
| `name` | text | Required |
| `phone` | text | Optional |
| `attendance` | text | `hadir`, `tidak_hadir`, `ragu` |
| `guest_count` | int | Default 1, max 20 |
| `message` | text | Optional short note |
| `event_type` | text | Default `resepsi` |
| `wedding_slug` | text | Default `erzal-dhea` |

### `wishes`

| Column | Type | Notes |
|--------|------|-------|
| `name` | text | Required |
| `message` | text | Required |
| `wedding_slug` | text | Default `erzal-dhea` |

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Form shows "Mode demo" | Fill in `js/config.js` with real Supabase URL and anon key |
| RSVP insert fails | Re-run `schema.sql`; check RLS policies exist |
| Admin can't load data | Ensure admin user is logged in; verify `auth_select_*` policies |
| Admin login fails | Confirm user exists and is confirmed in Supabase Auth |
| CORS errors | Supabase handles CORS; verify project URL is correct |

## Security Notes

- The **anon key** is designed to be public; RLS policies protect your data.
- Guests can only **insert** — they cannot read other guests' RSVPs or wishes.
- Only **authenticated** admin users can **select** (read) data.
- Change the admin password after first login if using a temporary one.
- Consider restricting SELECT policies to `wedding_slug = 'erzal-dhea'` (see commented section in `schema.sql`).
- Do not add public SELECT policies unless you want wishes visible to all visitors.

## Optional Enhancements

- Enable **Realtime** on tables for live admin dashboard updates.
- Add email notifications via Supabase Edge Functions on new RSVP.
- Use separate `wedding_slug` values if reusing this project for other couples.
