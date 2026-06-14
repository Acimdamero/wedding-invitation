# Photo Editing Notes — Budi & Sari Wedding Invitation

Processed from 6 client source images. Warm color grading applied site-wide to match the cream/sage/gold palette (`#f7f5f0`, `#8b9a7e`, `#c4a882`).

## Source → Output Mapping

| Output | Source | Crop & Adjustments | Site Usage |
|--------|--------|-------------------|------------|
| `hero.jpg` | Tropical villa (#4) | 16:9 landscape, couple centered; warm grade + soft vignette + slight darken for text overlay | Hero background |
| `og.jpg` | Tropical villa (#4) | 1200×630 social crop, warm grade | Open Graph / share preview |
| `groom.jpg` | Restaurant collage top (#1) | Split collage; 1:1 crop on groom (right side); removed busy table foreground | Couple section — Budi |
| `bride.jpg` | Tropical villa (#4) | 1:1 crop on bride (left side), upper body | Couple section — Sari |
| `story.jpg` | Car trunk color (#2) | 4:5 portrait; trimmed sky/pavement dead space | *(replaced by childhood.jpg in Love Story)* |
| `childhood.jpg` | Childhood collage (#6) | 4:5 portrait; top 8% cropped (Pinterest watermark); warm grade | Love Story section banner — "Our Beginning" |
| `gallery-07.jpg` | Childhood collage (#6) | 1:1 center crop on heart collage; warm grade | Gallery |
| `gallery-01.jpg` | Tropical villa (#4) | 1:1 couple portrait | Gallery |
| `gallery-02.jpg` | Car trunk color (#2) | 1:1, couple on trunk | Gallery |
| `gallery-03.jpg` | Car B&W (#3) | 1:1; warm cream/charcoal duotone (sage `#2c3328` → cream `#e8d5b5`) | Gallery |
| `gallery-04.jpg` | Restaurant top (#1) | 1:1; tighter crop, table minimized | Gallery |
| `gallery-05.jpg` | Restaurant bottom (#1) | 1:1; candid moment (groom smiling at bride) | Gallery |
| `gallery-06.jpg` | Full car scene (#5) | 1:1; cropped right edge to remove parking sign; trimmed pavement/sky | Gallery |

WebP versions (`.webp`) of each file are also exported for optional `<picture>` use.

## Per-Photo Editing Decisions

### 1. Restaurant collage (stacked duo)
- **Split** into top and bottom frames at midpoint (576×512 each).
- **Cropped** each frame to 1:1 focusing on faces/upper body; removed speckled mosaic table foreground.
- **Graded** with warm tone, lifted shadows, reduced saturation on harsh flash whites.
- Top frame → groom profile + gallery-04; bottom frame → gallery-05 (more romantic candid).

### 2. Car trunk — color
- **Cropped** to remove overexposed sky and excess hexagonal pavement.
- **Graded** warm with soft contrast for lifestyle/romantic feel.
- Used for story banner and gallery-02.

### 3. Car trunk — B&W
- **Same crop** as color variant for consistency.
- **Converted** to warm duotone instead of cold B&W — matches invitation palette better than pure monochrome.

### 4. Tropical villa (best overall)
- **Hero**: wide 16:9 on couple + palm/villa backdrop; darkened slightly for hero text readability.
- **Bride profile**: 1:1 on woman; coordinated black/cream outfit reads elegant on site.
- **Gallery-01**: full couple square crop.

### 5. Full car scene with parking sign
- **Cropped** left-of-center to exclude blue "P AREA PARKIR" sign on right.
- **Trimmed** dead sky and foreground pavement.
- License plate remains visible at this crop — consider a tighter crop or retouch if client prefers.

### 6. Childhood collage (heart scrapbook)
- **Cropped** top ~8% to remove Pinterest watermark attribution.
- **Graded** with warm tone (strength 1.05) to harmonize with site palette.
- 4:5 export → `childhood.jpg` for Love Story banner; 1:1 center crop → `gallery-07.jpg`.

## Photos Not Skipped

All 6 source images were used. The restaurant collage yielded 2 usable frames from 1 file.

## Re-processing

Run from project root:

```bash
python3 scripts/process_photos.py
```

## Suggestions for Client — Final Photo Shoot

For production-ready wedding invitation photos, recommend the couple provide:

1. **Formal portraits** — groom in suit/ beskap, bride in kebaya or white gown; neutral or garden background; golden hour light.
2. **Coordinated casual** — like the tropical villa shoot (black + cream worked well); avoid busy tabletops and flash-heavy indoor shots.
3. **Hero / cover** — wide landscape of couple outdoors, faces visible, soft background blur; shoot during golden hour for natural warmth.
4. **Individual headshots** — square-friendly, shoulders up, matching color grade; avoid caps/hats for groom formal section (or provide separate formal headshot).
5. **Gallery set** — 6–12 images, mix of candid and posed; consistent editing style; minimize distractions (signs, license plates, cluttered backgrounds).
6. **Resolution** — minimum 2000px on long edge; RAW or high-quality JPEG preferred.

---

*Demo names Budi & Sari retained per template. Replace with actual couple names when going live.*
