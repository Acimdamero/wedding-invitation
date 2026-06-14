# Wedding Invitation — Budi & Sari

A complete, deployable digital wedding invitation website built with pure HTML, CSS, and JavaScript. Designed with a modern minimalist aesthetic, glassmorphism touches, and smooth animations inspired by Indonesian digital invitation trends.

## Features

- **Opening cover/envelope animation** — classic Indonesian digital invite experience
- **Bilingual structure** — Indonesian & English labels throughout
- **Countdown timer** — to wedding date (22 July 2026)
- **Couple profiles** — with placeholder photo slots
- **Love story timeline** — scroll-reveal animations
- **Event schedule** — Akad Nikah & Resepsi cards
- **Photo gallery** — with lightbox viewer
- **RSVP form** — frontend demo (no backend)
- **Guest book / wishes** — UI-only, adds messages locally
- **Location section** — Google Maps embed placeholder
- **Background music** — with mute/unmute toggle (autoplay handled gracefully)
- **Share buttons** — copy link, WhatsApp, native share API
- **Responsive** — mobile-first design
- **Accessible** — semantic HTML, ARIA labels, reduced-motion support
- **Open Graph meta tags** — for social sharing previews

## Project Structure

```
wedding-invitation/
├── index.html          # Main page
├── css/
│   └── style.css       # All styles & animations
├── js/
│   └── main.js         # Interactivity & logic
├── assets/
│   └── favicon.svg     # Favicon placeholder
└── README.md           # This file
```

## Customization Guide

### Replace Placeholder Content

1. **Couple names** — search/replace `Budi`, `Sari`, `Budi Santoso`, `Sari Wulandari` in `index.html`
2. **Wedding date** — update in `index.html` and `js/main.js` (`WEDDING_DATE` constant)
3. **Photos** — replace Unsplash URLs in `index.html` (marked with `PLACEHOLDER` comments):
   - Hero cover background
   - Groom & bride profile photos
   - Gallery images (6 slots)
4. **Location** — update venue name, address, and Google Maps embed URL
5. **Music** — update `YOUTUBE_VIDEO_ID` in `js/main.js` with the client's YouTube video ID

### Background Music

Background music streams from **YouTube** via the [IFrame Player API](https://developers.google.com/youtube/iframe_api_reference) (hidden player, audio only):

- Current track: https://youtu.be/bLmDVZRhhRE (`YOUTUBE_VIDEO_ID = 'bLmDVZRhhRE'` in `js/main.js`)
- Playback starts after the guest taps **Buka Undangan** (user gesture required for autoplay)
- Loop is enabled via `loop: 1` and matching `playlist` parameter
- Play/pause is controlled by the floating music toggle button

To change the song, replace the video ID in `js/main.js`:

```javascript
const YOUTUBE_VIDEO_ID = 'your-video-id-here';
```

**Note:** Do not download or rip YouTube audio — use the embed API only. Some videos may block embedding; test the chosen URL before going live.

### Image Placeholders

Current images are from [Unsplash](https://unsplash.com) (free to use). Replace with client photos before going live.

## Local Development

No build step required. Serve the folder with any static file server:

```bash
# Option 1: Python
cd wedding-invitation
python3 -m http.server 8080

# Option 2: Node.js (npx)
npx serve .

# Option 3: PHP
php -S localhost:8080
```

Open http://localhost:8080 in your browser.

## Deployment

### Vercel

```bash
npm i -g vercel
cd wedding-invitation
vercel
```

Or connect your GitHub repo at [vercel.com](https://vercel.com) — no framework config needed for static sites.

### GitHub Pages

1. Push the `wedding-invitation` folder to a GitHub repository
2. Go to **Settings → Pages**
3. Set source to `main` branch, root `/` folder
4. Your site will be live at `https://<username>.github.io/<repo>/`

### Netlify

1. Drag and drop the `wedding-invitation` folder at [app.netlify.com/drop](https://app.netlify.com/drop)
2. Or connect a Git repo and set publish directory to `.`

## Limitations

- **Music autoplay**: Browsers block autoplay until user interaction. Music starts after tapping "Buka Undangan"; a play button is shown if autoplay fails.
- **YouTube embed**: Requires internet connection. Some videos restrict embedding or may show ads. Playback depends on YouTube's availability in the guest's region.
- **Mobile autoplay**: iOS Safari may require an additional tap on the music toggle. YouTube playback on mobile can be less reliable than native `<audio>`.
- **RSVP & wishes**: Frontend-only demo — data is not persisted. Connect to a backend (Google Sheets, Formspree, Firebase, etc.) for production.
- **Gallery images**: Loaded from Unsplash CDN — requires internet connection. Replace with local assets for offline use.
- **Google Maps**: Embedded map for Maxi's Resto, Bandung (Jl. Gunung Agung No.8).

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Android)

## License

Demo/template project. Replace all placeholder content, images, and music before client delivery.
