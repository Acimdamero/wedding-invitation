# Deployment Guide — Erzal & Dhea Wedding Invitation

## Primary share URL

**https://erzal-dhea-wedding.vercel.app**

Share this link with guests (no `acimdamero` in the URL).

Backup: https://acimdamero.github.io/erzal-dhea-wedding/

---

## One-command deploy (Vercel)

```bash
cd wedding-invitation
npx vercel login          # once only — browser OAuth
npx vercel --prod --yes --name erzal-dhea-wedding
```

Expected output URL: `https://erzal-dhea-wedding.vercel.app`

## Alternative: Netlify

If Vercel fails:

```bash
npx netlify login         # once only
npx netlify deploy --prod --dir=. --site-name=erzal-dhea-wedding
```

Target: `https://erzal-dhea-wedding.netlify.app`

After Netlify deploy, update `canonicalUrl` in `js/config.js` and `og:url` in `index.html`.

---

## GitHub Pages (backup)

Push to `main` — auto-deploys to:

https://acimdamero.github.io/erzal-dhea-wedding/

Settings → Pages → source: `main` / root.

---

## Supabase (RSVP & Wishes)

RSVP and guest book need a Supabase project. **~3 minutes in the dashboard:**

1. Open https://supabase.com → **New project** (region: Singapore)
2. **SQL Editor** → paste all of `supabase/schema.sql` → **Run**
3. **Settings → API** → copy Project URL + anon key
4. Paste into `js/config.js` and `admin/config.js`
5. **Authentication → Users → Add user** (admin email + password, enable Auto Confirm)
6. Redeploy or push to GitHub

Full copy-paste steps: [scripts/setup-supabase.md](scripts/setup-supabase.md)

Admin dashboard: `https://erzal-dhea-wedding.vercel.app/admin/`

---

## Verify after deploy

- [ ] Open invitation — Masjidil Haram background visible
- [ ] No couple photos / gallery hidden
- [ ] Music starts at ~24s after "Buka Undangan"
- [ ] Share → WhatsApp shows correct title and URL
- [ ] Submit test RSVP (or confirm demo mode if Supabase not configured)
- [ ] Admin login at `/admin/`
