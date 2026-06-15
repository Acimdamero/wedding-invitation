# Wedding Invitation — Erzal & Dhea

A complete, deployable digital wedding invitation website built with pure HTML, CSS, and JavaScript. Designed with a modern minimalist aesthetic, glassmorphism touches, beat-synced animations, **Three.js 3D ornamental scenes**, and smooth scroll effects.

## Features

- **3D opening scene** — "Dua Dunia, Satu Cinta" — Makkah Islamic + Sundanese rumah adat transition on envelope open
- **Site-wide 3D ornaments** — corner geometric wireframes, scroll-themed Islamic/Sunda backgrounds
- **Islamic Arab ornamental design** — arabesque patterns, mashrabiya lattice, mosque arch frames for Akad/Makkah sections
- **Sundanese wedding motifs** — janur kuning, melati garlands, rumah adat, seserahan patterns for Resepsi/Bandung sections
- **Opening cover/envelope animation** — classic Indonesian digital invite experience
- **Bilingual structure** — Indonesian & English labels throughout
- **Countdown timer** — to Akad Nikah date (13 July 2026, Makkah)
- **Couple profiles** — Erzal Maulana Sandrya & Dhea Fadhillah Ramlan
- **Love story timeline** — Instagram meet (2022) through Makkah akad (2026)
- **Event schedule** — Akad Nikah (Makkah) & Resepsi (Maxi's Resto, Bandung)
- **Photo gallery** — with lightbox viewer
- **Beat-synced animations** — rhythmic visual pulse synced to background music
- **RSVP form** — Supabase-backed attendance confirmation (with demo fallback)
- **Guest book / wishes** — Supabase-backed messages (with demo fallback)
- **Admin dashboard** — password-protected reports at `/admin/` (Supabase Auth)
- **Location section** — Google Maps embed for reception venue
- **Background music** — YouTube embed with mute/unmute toggle
- **Share buttons** — copy link, WhatsApp, native share API
- **Responsive** — mobile-first design
- **Accessible** — semantic HTML, ARIA labels, reduced-motion support
- **Open Graph meta tags** — for social sharing previews

## Project Structure

```
wedding-invitation/
├── index.html              # Main page
├── admin/                  # Client reporting dashboard (Supabase Auth)
│   ├── index.html          # Admin login
│   ├── dashboard.html      # RSVP & wishes reports
│   ├── admin.css
│   ├── admin.js
│   └── config.js           # Supabase keys (same anon key as public site)
├── supabase/
│   ├── schema.sql          # Database migration + RLS
│   └── README.md           # Supabase setup guide
├── css/
│   ├── style.css           # All styles & beat-sync animations
│   ├── scroll-animations.css
│   └── mobile.css          # Android & iOS touch/viewport overrides
├── js/
│   ├── main.js             # Interactivity & logic
│   ├── config.js           # Public Supabase config (anon key)
│   ├── rsvp.js             # RSVP submit handler
│   ├── wishes.js           # Wishes submit handler
│   ├── beat-sync.js        # BeatEngine — rhythmic pulse
│   ├── opening-3d.js       # 3D envelope opening scene (Three.js)
│   └── scene-3d.js         # Site-wide 3D background ornaments
├── assets/
│   ├── ornaments/          # SVG decorative elements (Islamic + Sunda)
│   │   └── sunda/          # Janur, melati, rumah adat, seserahan motifs
│   └── photos/             # Couple photos
├── PHOTO-SUGGESTIONS.md    # Client photo recommendations
└── README.md
```

## Customization Guide

### Couple & Events

- **Names:** Erzal Maulana Sandrya (groom), Dhea Fadhillah Ramlan (bride)
- **Akad:** 13 Juli 2026 — Makkah, Saudi Arabia
- **Resepsi:** 22 Juli 2026, 15:30–18:30 WIB — Maxi's Resto, Bandung
- **Parents (groom):** Ibu Ratna Karyati & Bapak Mamat Rahmat
- **Parents (bride):** Ibu Siti Aisah & Bapak Ramlan
- **Countdown target:** `AKAD_DATE` in `js/main.js`

### Background Music

Background music streams from **YouTube** via the [IFrame Player API](https://developers.google.com/youtube/iframe_api_reference):

- Current track: https://youtu.be/-a-vbOxM-6s (`YOUTUBE_VIDEO_ID = '-a-vbOxM-6s'`)
- Playback starts at **24 seconds** (`START_SECONDS` in `js/main.js`) to skip the intro
- Beat sync uses estimated **75 BPM** (`BEAT_BPM` in `js/main.js`)

### Photos

See [PHOTO-SUGGESTIONS.md](PHOTO-SUGGESTIONS.md) for professional shoot recommendations and technical specs.

## Local Development

```bash
cd wedding-invitation
python3 -m http.server 8080
```

Open http://localhost:8080 in your browser.

## RSVP & Wishes Database (Supabase)

Guest forms submit to **Supabase PostgreSQL** via the public anon key. An **admin dashboard** at `/admin/` lets the couple view reports after Supabase Auth login.

**Full setup:** see [supabase/README.md](supabase/README.md)

Quick checklist:

1. Create a free [Supabase](https://supabase.com) project
2. Run `supabase/schema.sql` in the SQL Editor
3. Paste **Project URL** and **anon key** into `js/config.js` and `admin/config.js`
4. Create an admin user in Supabase Auth (Authentication → Users)
5. Deploy — admin URL: https://acimdamero.github.io/erzal-dhea-wedding/admin/

Until keys are configured, forms run in **demo mode** (RSVP/wishes are not persisted).

## Mobile Testing

Test on real devices before sharing with guests:

| Check | iPhone (Safari) | Android (Chrome) |
|-------|-----------------|------------------|
| Open envelope | "Buka Undangan" visible, not cut off by home indicator | Same; address bar collapse does not clip button |
| Music | Tap open → music may autoplay; if silent, tap music button | Usually autoplays after open gesture |
| Scroll & nav | Horizontal nav scrolls; sections anchor correctly | Same |
| RSVP inputs | No unwanted zoom on focus (16px inputs) | Same |
| Gallery | 2-column grid; tap opens lightbox | Same |
| Share | Copy link + WhatsApp open correctly | WhatsApp intent works |

**Share via WhatsApp:** Open the live URL on your phone, scroll to **Share Invitation**, tap **WhatsApp**, and send to yourself or a test contact to verify the Open Graph preview.

## Live URLs

| URL | Role |
|-----|------|
| **https://acimdamero.github.io/erzal-dhea-wedding/** | **Primary — share this with guests** |
| https://erzal-dhea-wedding.vercel.app/ | Optional (deploy with `npx vercel login` then `npx vercel --prod --yes`) |

WhatsApp share message: `Wedding Invitation Erzal & Dhea` + link.

> **Redirect note:** The old URL `https://acimdamero.github.io/wedding-invitation/` no longer works after the repo rename. Use the primary URL above.

## Deployment

### Vercel (primary URL)

```bash
npx vercel --prod --yes
```

First-time setup requires one login: `npx vercel login` (browser OAuth).

Project name: `erzal-dhea-wedding` → `https://erzal-dhea-wedding.vercel.app`

### GitHub Pages (primary)

Live site: https://acimdamero.github.io/erzal-dhea-wedding/

1. Push to `main` branch
2. Settings → Pages → source: `main` / root

## 3D & Performance Notes

- **Three.js r128** loaded via CDN — no build step required
- **WebGL required** for full 3D effect; static SVG ornaments shown as fallback
- `prefers-reduced-motion`: skips 3D, shows static SVG ornaments only
- Mobile: reduced particle/geometry count, `devicePixelRatio` capped at 1.5, background 3D deferred until after envelope opens
- Screens ≤374px: site-wide 3D hidden (SVG fallback); opening 3D skipped
- 3D pauses when browser tab is hidden (`visibilitychange`) or main content scrolls off-screen
- Opening scene disposes GPU resources after envelope opens

### Section Theme Mapping

| Theme | Sections |
|-------|----------|
| Islamic (Makkah) | Hero, Countdown, Couple, Story, Events (Akad card) |
| Sundanese (Bandung) | Location, RSVP, Wishes, Share, Events (Resepsi card) |

## Beat-Sync Limitations

- YouTube IFrame API does **not** expose audio for Web Audio analysis
- Beat timing uses a **simulated clock** at 75 BPM, started when music plays
- Visual effects respect `prefers-reduced-motion`
- Auto-scroll pauses for 5 seconds after manual user scrolling

## License

Client project. Replace photos before final delivery if needed.
