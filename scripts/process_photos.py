#!/usr/bin/env python3
"""Process wedding invitation client photos — crop, color-grade, export."""

from __future__ import annotations

import math
from pathlib import Path

from PIL import Image, ImageEnhance, ImageFilter, ImageOps

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets" / "photos"
SRC = Path(
    "/Users/acim.agwengmail.com/.cursor/projects/"
    "Users-acim-agwengmail-com-Projects-wedding-invitation/assets"
)

# Source files
RESTAURANT = SRC / (
    "46e731fd-c8f3-4135-94f8-b99126668f92-"
    "994e8d56-0be2-48f6-ace2-85b3537f2fb5.png"
)
CAR_COLOR = SRC / (
    "4b375efa-0dee-45e8-98f3-17f99392c74b-"
    "3f2f2521-5f40-44a2-9ecd-c8ff0ce4d13e.png"
)
CAR_BW = SRC / (
    "1a68d124-22b0-4499-997f-c7ab67a8f21c-"
    "56319900-cab5-49af-af12-6625fc14d6c0.png"
)
TROPICAL = SRC / (
    "ff2735bd-f3bd-4cb2-a842-38580308af32-"
    "9c35aa80-6ff9-40b9-9551-a227ac6b1935.png"
)
CAR_FULL = SRC / (
    "2f3ad881-5d41-4850-8b40-1f92aa6013d8-"
    "024506f3-a0f7-4b02-9d48-721b19dafe5e.png"
)
CHILDHOOD = SRC / "image-f2a1868d-5071-4b55-b633-6e6c3424c1d0.png"

JPG_QUALITY = 85


def crop_box_aspect(
    width: int, height: int, target_w: int, target_h: int, cx: float, cy: float
) -> tuple[int, int, int, int]:
    """Return crop box (left, top, right, bottom) centered at cx, cy (0–1)."""
    target_ratio = target_w / target_h
    img_ratio = width / height

    if img_ratio > target_ratio:
        crop_h = height
        crop_w = int(height * target_ratio)
    else:
        crop_w = width
        crop_h = int(width / target_ratio)

    center_x = int(width * cx)
    center_y = int(height * cy)
    left = max(0, min(width - crop_w, center_x - crop_w // 2))
    top = max(0, min(height - crop_h, center_y - crop_h // 2))
    return (left, top, left + crop_w, top + crop_h)


def warm_grade(img: Image.Image, strength: float = 1.0) -> Image.Image:
    """Warm romantic color grade: lifted shadows, soft contrast, muted saturation."""
    if img.mode != "RGB":
        img = img.convert("RGB")

    # Slight warmth via channel blend
    r, g, b = img.split()
    r = r.point(lambda x: min(255, int(x * (1.0 + 0.06 * strength))))
    g = g.point(lambda x: min(255, int(x * (1.0 + 0.02 * strength))))
    b = b.point(lambda x: max(0, int(x * (1.0 - 0.04 * strength))))
    img = Image.merge("RGB", (r, g, b))

    # Lift shadows — blend with lightly brightened copy
    bright = ImageEnhance.Brightness(img).enhance(1.08)
    img = Image.blend(img, bright, 0.22 * strength)

    img = ImageEnhance.Color(img).enhance(0.88 - 0.08 * (1 - strength))
    img = ImageEnhance.Contrast(img).enhance(0.94)
    img = ImageEnhance.Brightness(img).enhance(1.03)

    return img


def warm_duotone(img: Image.Image) -> Image.Image:
    """Convert B&W to warm cream/charcoal duotone matching site palette."""
    gray = img.convert("L")
    # Shadow: sage-charcoal #2c3328, highlight: cream #e8d5b5
    shadow = (44, 51, 40)
    highlight = (232, 213, 181)
    out = Image.new("RGB", gray.size)
    px = out.load()
    gp = gray.load()
    for y in range(gray.height):
        for x in range(gray.width):
            t = gp[x, y] / 255.0
            t = t**0.92  # soften contrast
            r = int(shadow[0] * (1 - t) + highlight[0] * t)
            g = int(shadow[1] * (1 - t) + highlight[1] * t)
            b = int(shadow[2] * (1 - t) + highlight[2] * t)
            px[x, y] = (r, g, b)
    return out


def vignette(img: Image.Image, strength: float = 0.35) -> Image.Image:
    """Soft radial vignette (computed at reduced size for speed)."""
    w, h = img.size
    sw, sh = max(64, w // 8), max(64, h // 8)
    small = Image.new("L", (sw, sh))
    px = small.load()
    cx, cy = sw / 2, sh / 2
    max_d = math.hypot(cx, cy)
    for y in range(sh):
        for x in range(sw):
            d = math.hypot(x - cx, y - cy) / max_d
            px[x, y] = int(min(255, (d**1.6) * 255 * strength * 1.4))
    mask = small.resize((w, h), Image.Resampling.BILINEAR)
    dark = Image.new("RGB", (w, h), (20, 24, 18))
    return Image.composite(dark, img, mask)


def darken_for_hero(img: Image.Image) -> Image.Image:
    """Slightly darken hero for text overlay readability."""
    img = ImageEnhance.Brightness(img).enhance(0.88)
    img = ImageEnhance.Contrast(img).enhance(0.96)
    return vignette(img, 0.28)


def resize_to(img: Image.Image, target_w: int, target_h: int) -> Image.Image:
    return img.resize((target_w, target_h), Image.Resampling.LANCZOS)


def save_jpg(img: Image.Image, path: Path, quality: int = JPG_QUALITY) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    if img.mode == "RGBA":
        img = img.convert("RGB")
    img.save(path, "JPEG", quality=quality, optimize=True, progressive=True)


def save_webp(img: Image.Image, path: Path, quality: int = 82) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    if img.mode == "RGBA":
        img = img.convert("RGB")
    img.save(path, "WEBP", quality=quality, method=4)


def process_and_save(
    img: Image.Image,
    name: str,
    box: tuple[int, int, int, int] | None,
    out_w: int,
    out_h: int,
    grade: str = "warm",
    extra=None,
) -> None:
    if box:
        img = img.crop(box)
    img = resize_to(img, out_w, out_h)
    if grade == "warm":
        img = warm_grade(img)
    elif grade == "warm_duotone":
        img = warm_duotone(img)
    elif grade == "hero":
        img = warm_grade(img, 1.1)
        img = darken_for_hero(img)
    if extra:
        img = extra(img)
    save_jpg(img, ASSETS / f"{name}.jpg")
    save_webp(img, ASSETS / f"{name}.webp")


def split_restaurant(path: Path) -> tuple[Image.Image, Image.Image]:
    im = Image.open(path).convert("RGB")
    w, h = im.size
    mid = h // 2
    top = im.crop((0, 0, w, mid))
    bottom = im.crop((0, mid, w, h))
    return top, bottom


def main() -> None:
    ASSETS.mkdir(parents=True, exist_ok=True)

    tropical = Image.open(TROPICAL).convert("RGB")
    tw, th = tropical.size

    # --- Hero: tropical villa, 16:9 wide crop on couple ---
    hero_box = crop_box_aspect(tw, th, 16, 9, cx=0.50, cy=0.38)
    process_and_save(tropical, "hero", hero_box, 1920, 1080, grade="hero")

    # --- OG image: 1200x630 from same source ---
    og_box = crop_box_aspect(tw, th, 1200, 630, cx=0.50, cy=0.36)
    process_and_save(tropical, "og", og_box, 1200, 630, grade="warm")

    # --- Groom: restaurant top frame, 1:1 on man's face/upper body ---
    rest_top, rest_bottom = split_restaurant(RESTAURANT)
    rw, rh = rest_top.size
    groom_box = crop_box_aspect(rw, rh, 1, 1, cx=0.62, cy=0.32)
    process_and_save(rest_top, "groom", groom_box, 800, 800, grade="warm")

    # --- Bride: tropical villa woman, 1:1 ---
    bride_box = crop_box_aspect(tw, th, 1, 1, cx=0.38, cy=0.28)
    process_and_save(tropical, "bride", bride_box, 800, 800, grade="warm")

    # --- Story: car trunk color, romantic 4:5 crop ---
    car = Image.open(CAR_COLOR).convert("RGB")
    cw, ch = car.size
    story_box = crop_box_aspect(cw, ch, 4, 5, cx=0.50, cy=0.42)
    process_and_save(car, "story", story_box, 1000, 1250, grade="warm")

    # --- Gallery 01: tropical couple 1:1 ---
    g1_box = crop_box_aspect(tw, th, 1, 1, cx=0.50, cy=0.35)
    process_and_save(tropical, "gallery-01", g1_box, 900, 900, grade="warm")

    # --- Gallery 02: car color trunk 1:1 ---
    g2_box = crop_box_aspect(cw, ch, 1, 1, cx=0.50, cy=0.40)
    process_and_save(car, "gallery-02", g2_box, 900, 900, grade="warm")

    # --- Gallery 03: car B&W warm duotone ---
    car_bw = Image.open(CAR_BW).convert("RGB")
    g3_box = crop_box_aspect(cw, ch, 1, 1, cx=0.52, cy=0.38)
    process_and_save(car_bw, "gallery-03", g3_box, 900, 900, grade="warm_duotone")

    # --- Gallery 04: restaurant top (groom leaning) 1:1 ---
    g4_box = crop_box_aspect(rw, rh, 1, 1, cx=0.50, cy=0.30)
    process_and_save(rest_top, "gallery-04", g4_box, 900, 900, grade="warm")

    # --- Gallery 05: restaurant bottom (candid smile) 1:1 ---
    g5_box = crop_box_aspect(rw, rh, 1, 1, cx=0.48, cy=0.30)
    process_and_save(rest_bottom, "gallery-05", g5_box, 900, 900, grade="warm")

    # --- Gallery 06: full car scene, crop out parking sign ---
    car_full = Image.open(CAR_FULL).convert("RGB")
    fw, fh = car_full.size
    # Crop right edge (sign) and reduce sky/pavement
    g6_box = crop_box_aspect(fw, fh, 1, 1, cx=0.42, cy=0.44)
    process_and_save(car_full, "gallery-06", g6_box, 900, 900, grade="warm")

    # --- Childhood collage: Love Story banner + gallery ---
    childhood = Image.open(CHILDHOOD).convert("RGB")
    chw, chh = childhood.size
    top_crop = int(chh * 0.08)
    childhood = childhood.crop((0, top_crop, chw, chh))
    chw, chh = childhood.size
    childhood_story_box = crop_box_aspect(chw, chh, 4, 5, cx=0.50, cy=0.48)
    process_and_save(
        childhood, "childhood", childhood_story_box, 1000, 1250, grade="warm"
    )
    g7_box = crop_box_aspect(chw, chh, 1, 1, cx=0.50, cy=0.45)
    process_and_save(childhood, "gallery-07", g7_box, 900, 900, grade="warm")

    # Print summary
    print("\nCreated files:")
    for p in sorted(ASSETS.glob("*")):
        if p.suffix.lower() in (".jpg", ".webp"):
            with Image.open(p) as im:
                size_kb = p.stat().st_size / 1024
                print(f"  {p.name:20s}  {im.size[0]}x{im.size[1]}  {size_kb:.0f} KB")


if __name__ == "__main__":
    main()
