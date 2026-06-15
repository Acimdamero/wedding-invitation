#!/usr/bin/env python3
"""Generate 1200x630 Open Graph image matching the envelope cover aesthetic."""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parent.parent
ASSETS = ROOT / "assets"
OUT_JPG = ASSETS / "og-invite.jpg"
OUT_WEBP = ASSETS / "og-invite.webp"
BG_PATH = ASSETS / "backgrounds" / "masjidil-haram.jpg"
FONTS_DIR = ROOT / "scripts" / "fonts"

WIDTH, HEIGHT = 1200, 630

# Site palette
CREAM = (245, 240, 232)
ENVELOPE_BODY_TOP = (240, 235, 227)
ENVELOPE_BODY_BOTTOM = (224, 217, 206)
FLAP_TOP = (216, 208, 196)
FLAP_BOTTOM = (200, 192, 180)
GOLD = (201, 169, 98)
SAGE = (139, 154, 126)
TEXT_DARK = (44, 51, 40)
TEXT_MUTED = (107, 107, 107)


def download_fonts():
    FONTS_DIR.mkdir(parents=True, exist_ok=True)
    serif = FONTS_DIR / "CormorantGaramond-Regular.ttf"
    sans = FONTS_DIR / "Jost-Regular.ttf"
    sans_medium = FONTS_DIR / "Jost-Medium.ttf"
    if not serif.exists() or not sans.exists():
        import urllib.request

        urls = {
            serif: "https://fonts.gstatic.com/s/cormorantgaramond/v21/co3umX5slCNuHLi8bLeY9MK7whWMhyjypVO7abI26QOD_v86GnM.ttf",
            sans: "https://fonts.gstatic.com/s/jost/v20/92zPtBhPNqw79Ij1E865zBUv7myjJQVG.ttf",
            sans_medium: "https://fonts.gstatic.com/s/jost/v20/92zPtBhPNqw79Ij1E865zBUv7myRJQVG.ttf",
        }
        for path, url in urls.items():
            if not path.exists():
                print(f"Downloading {path.name}...")
                urllib.request.urlretrieve(url, path)
    return serif, sans, sans_medium


def crop_cover(img: Image.Image, target_w: int, target_h: int) -> Image.Image:
    src_w, src_h = img.size
    target_ratio = target_w / target_h
    src_ratio = src_w / src_h
    if src_ratio > target_ratio:
        new_w = int(src_h * target_ratio)
        left = (src_w - new_w) // 2
        box = (left, 0, left + new_w, src_h)
    else:
        new_h = int(src_w / target_ratio)
        top = (src_h - new_h) // 2
        box = (0, top, src_w, top + new_h)
    return img.crop(box).resize((target_w, target_h), Image.Resampling.LANCZOS)


def draw_vertical_gradient(draw, box, top_color, bottom_color):
    x0, y0, x1, y1 = box
    height = y1 - y0
    for y in range(height):
        t = y / max(height - 1, 1)
        r = int(top_color[0] + (bottom_color[0] - top_color[0]) * t)
        g = int(top_color[1] + (bottom_color[1] - top_color[1]) * t)
        b = int(top_color[2] + (bottom_color[2] - top_color[2]) * t)
        draw.line([(x0, y0 + y), (x1, y0 + y)], fill=(r, g, b))


def draw_envelope(base: Image.Image, cx: int, cy: int, env_w: int, env_h: int):
  """Draw cream envelope with card text centered on base image."""
  x0 = cx - env_w // 2
  y0 = cy - env_h // 2
  x1 = x0 + env_w
  y1 = y0 + env_h

  shadow = Image.new("RGBA", base.size, (0, 0, 0, 0))
  shadow_draw = ImageDraw.Draw(shadow)
  shadow_draw.rounded_rectangle(
      (x0 + 8, y0 + 14, x1 + 8, y1 + 14),
      radius=6,
      fill=(44, 51, 40, 55),
  )
  shadow = shadow.filter(ImageFilter.GaussianBlur(12))
  base.alpha_composite(shadow)

  layer = Image.new("RGBA", base.size, (0, 0, 0, 0))
  draw = ImageDraw.Draw(layer)

  # Bottom flap (behind body)
  bottom_flap_h = int(env_h * 0.28)
  draw.polygon(
      [
          (x0, y1),
          (cx, y1 - bottom_flap_h),
          (x1, y1),
      ],
      fill=(*FLAP_BOTTOM, 255),
  )

  # Envelope body
  body_layer = Image.new("RGBA", (env_w, env_h), (0, 0, 0, 0))
  body_draw = ImageDraw.Draw(body_layer)
  draw_vertical_gradient(body_draw, (0, 0, env_w, env_h), ENVELOPE_BODY_TOP, ENVELOPE_BODY_BOTTOM)
  body_layer = body_layer.filter(ImageFilter.GaussianBlur(0.3))
  layer.paste(body_layer, (x0, y0), body_layer)
  draw.rounded_rectangle((x0, y0, x1, y1), radius=4, outline=(196, 168, 130, 40), width=1)

  # Top flap
  top_flap_h = int(env_h * 0.5)
  draw.polygon(
      [
          (x0, y0),
          (cx, y0 + top_flap_h),
          (x1, y0),
      ],
      fill=(*FLAP_TOP, 255),
  )
  draw.line([(x0, y0), (cx, y0 + top_flap_h)], fill=(180, 172, 160, 120), width=1)
  draw.line([(x1, y0), (cx, y0 + top_flap_h)], fill=(180, 172, 160, 120), width=1)

  # Gold accent line on flap fold
  draw.line([(x0 + 12, y0 + 4), (x1 - 12, y0 + 4)], fill=(*GOLD, 80), width=1)

  base.alpha_composite(layer)

  # Card text area
  serif, sans, sans_medium = download_fonts()
  text_draw = ImageDraw.Draw(base)

  label_font = ImageFont.truetype(str(sans), 18)
  names_font = ImageFont.truetype(str(serif), 62)
  amp_font = ImageFont.truetype(str(serif), 58)
  date_font = ImageFont.truetype(str(sans_medium if sans_medium.exists() else sans), 22)

  card_cy = cy + 8
  label_y = card_cy - 52
  names_y = card_cy + 2
  date_y = card_cy + 72

  label = "WEDDING INVITATION"
  label_bbox = text_draw.textbbox((0, 0), label, font=label_font)
  label_w = label_bbox[2] - label_bbox[0]
  text_draw.text((cx - label_w // 2, label_y), label, fill=TEXT_MUTED, font=label_font)

  name_left = "Erzal"
  amp = "&"
  name_right = "Dhea"

  left_bbox = text_draw.textbbox((0, 0), name_left, font=names_font)
  amp_bbox = text_draw.textbbox((0, 0), amp, font=amp_font)
  right_bbox = text_draw.textbbox((0, 0), name_right, font=names_font)
  gap = 14
  total_w = (left_bbox[2] - left_bbox[0]) + gap + (amp_bbox[2] - amp_bbox[0]) + gap + (right_bbox[2] - right_bbox[0])
  start_x = cx - total_w // 2

  text_draw.text((start_x, names_y), name_left, fill=TEXT_DARK, font=names_font)
  amp_x = start_x + (left_bbox[2] - left_bbox[0]) + gap
  text_draw.text((amp_x, names_y + 4), amp, fill=GOLD, font=amp_font)
  right_x = amp_x + (amp_bbox[2] - amp_bbox[0]) + gap
  text_draw.text((right_x, names_y), name_right, fill=TEXT_DARK, font=names_font)

  date_text = "13 & 22 Juli 2026"
  date_bbox = text_draw.textbbox((0, 0), date_text, font=date_font)
  date_w = date_bbox[2] - date_bbox[0]
  text_draw.text((cx - date_w // 2, date_y), date_text, fill=SAGE, font=date_font)

  # Subtle gold corner accents on envelope
  accent_len = 28
  accent_draw = ImageDraw.Draw(base)
  for corner in ((x0 + 6, y0 + 6), (x1 - 6, y0 + 6)):
    accent_draw.ellipse(
        (corner[0] - 3, corner[1] - 3, corner[0] + 3, corner[1] + 3),
        fill=(*GOLD, 140),
    )


def build_background() -> Image.Image:
  """Blurred masjid photo + sage/cream gradient — sacred mood without people."""
  bg = Image.open(BG_PATH).convert("RGB")
  bg = crop_cover(bg, WIDTH, HEIGHT)
  # Heavy blur: pilgrims and Kaaba become abstract color fields
  bg = bg.filter(ImageFilter.GaussianBlur(radius=50))

  base = bg.convert("RGBA")

  # Sage-to-cream vertical gradient overlay (~75% opacity)
  gradient = Image.new("RGBA", (WIDTH, HEIGHT))
  gradient_draw = ImageDraw.Draw(gradient)
  top_color = (52, 62, 48)      # dark sage
  bottom_color = (72, 78, 62)   # warm sage
  for y in range(HEIGHT):
    t = y / max(HEIGHT - 1, 1)
    r = int(top_color[0] + (bottom_color[0] - top_color[0]) * t)
    g = int(top_color[1] + (bottom_color[1] - top_color[1]) * t)
    b = int(top_color[2] + (bottom_color[2] - top_color[2]) * t)
    alpha = int(175 + (185 - 175) * t)  # 68–72% overlay
    gradient_draw.line([(0, y), (WIDTH, y)], fill=(r, g, b, alpha))
  base = Image.alpha_composite(base, gradient)

  # Subtle edge vignette (dark sage, gold-tinted center preserved)
  vig_mask = Image.new("L", (WIDTH, HEIGHT), 0)
  vig_draw = ImageDraw.Draw(vig_mask)
  cx, cy = WIDTH // 2, HEIGHT // 2
  max_r = int(((WIDTH / 2) ** 2 + (HEIGHT / 2) ** 2) ** 0.5)
  for r in range(max_r, 0, -8):
    alpha = int(200 * max(0, (r / max_r - 0.45) / 0.55) ** 1.5)
    vig_draw.ellipse((cx - r, cy - r, cx + r, cy + r), fill=alpha)
  vig_mask = vig_mask.filter(ImageFilter.GaussianBlur(18))
  vig_layer = Image.new("RGBA", (WIDTH, HEIGHT), (26, 36, 24, 0))
  vig_layer.putalpha(vig_mask)
  base = Image.alpha_composite(base, vig_layer)

  # Sage/gold radial glows (matches site cover__bg)
  glow = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
  glow_draw = ImageDraw.Draw(glow)
  glow_draw.ellipse((-80, 80, 520, 520), fill=(139, 154, 126, 32))
  glow_draw.ellipse((700, -40, 1280, 340), fill=(196, 168, 130, 40))
  glow = glow.filter(ImageFilter.GaussianBlur(40))
  base = Image.alpha_composite(base, glow)

  # Cream wash for envelope readability
  wash = Image.new("RGBA", (WIDTH, HEIGHT), (247, 245, 240, 55))
  base = Image.alpha_composite(base, wash)
  return base


def main():
  print("Building OG image...")
  img = build_background()
  draw_envelope(img, WIDTH // 2, HEIGHT // 2 - 10, 520, 340)

  rgb = img.convert("RGB")
  rgb.save(OUT_JPG, "JPEG", quality=88, optimize=True, progressive=True)
  rgb.save(OUT_WEBP, "WEBP", quality=85, method=6)

  jpg_size = OUT_JPG.stat().st_size
  w, h = rgb.size
  print(f"Saved {OUT_JPG} ({w}x{h}, {jpg_size / 1024:.1f} KB)")
  print(f"Saved {OUT_WEBP}")


if __name__ == "__main__":
  main()
