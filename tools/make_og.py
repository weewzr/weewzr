"""Generate public/og-image.png, the 1200x630 social preview card.

Pillow only, no network. Text content comes from the constants below, which mirror
src/data/site.ts (name and identity). No third-party artwork is used.

Run from the repository root:  python -I tools/make_og.py
"""
from __future__ import annotations

import math
import random
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageFont

W, H = 1200, 630
SS = 2  # supersampling factor: draw at 2x, then downscale for clean edges

NAME = "Wee Zhern Ray"
LINE = "Chemical Engineering @ NUS | Nuclear & Low-Carbon Energy | Process Modelling"
URL_TEXT = "weewzr.github.io/weewzr"

# Palette (mirrors src/styles/global.css)
NAVY = (6, 11, 27)
MID = (22, 28, 82)
VIOLET = (58, 30, 130)
BLUE = (59, 130, 246)
PURPLE = (124, 58, 237)
LAVENDER = (167, 139, 250)
TEXT = (241, 245, 249)
MUTED = (203, 213, 225)

FONT_DIR = Path(r"C:\Windows\Fonts")
BOLD_CANDIDATES = ["segoeuib.ttf", "arialbd.ttf"]
REGULAR_CANDIDATES = ["segoeui.ttf", "arial.ttf"]

OUT = Path(__file__).resolve().parent.parent / "public" / "og-image.png"


def load_font(candidates: list[str], size: int) -> ImageFont.FreeTypeFont:
    for name in candidates:
        path = FONT_DIR / name
        if path.exists():
            return ImageFont.truetype(str(path), size)
    raise FileNotFoundError(f"None of {candidates} found in {FONT_DIR}")


def text_width(font: ImageFont.FreeTypeFont, text: str) -> float:
    return font.getlength(text)


def gradient_background(w: int, h: int) -> Image.Image:
    """Diagonal navy -> indigo -> violet gradient, built from a rotated linear ramp."""
    diag = int(math.hypot(w, h)) + 8
    ramp = Image.linear_gradient("L").resize((diag, diag), Image.BICUBIC)
    ramp = ramp.rotate(-35, resample=Image.BICUBIC)
    left, top = (diag - w) // 2, (diag - h) // 2
    ramp = ramp.crop((left, top, left + w, top + h))
    first = ramp.point(lambda v: min(255, v * 2))
    second = ramp.point(lambda v: max(0, (v - 128) * 2))
    base = Image.new("RGB", (w, h), NAVY)
    base = Image.composite(Image.new("RGB", (w, h), MID), base, first)
    base = Image.composite(Image.new("RGB", (w, h), VIOLET), base, second)
    return base


def add_glow(img: Image.Image, center: tuple[float, float], radius: float, color: tuple[int, int, int], strength: float) -> Image.Image:
    """Blend a soft radial glow of `color` into `img`."""
    mask = Image.new("L", img.size, 0)
    d = ImageDraw.Draw(mask)
    cx, cy = center
    d.ellipse((cx - radius, cy - radius, cx + radius, cy + radius), fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(radius * 0.55))
    mask = mask.point(lambda v: int(v * strength))
    return Image.composite(Image.new("RGB", img.size, color), img, mask)


def four_point_star(cx: float, cy: float, r: float, pinch: float = 0.22) -> list[tuple[float, float]]:
    pts = []
    for i in range(8):
        ang = math.pi / 2 * (i / 2) - math.pi / 2
        rad = r if i % 2 == 0 else r * pinch
        pts.append((cx + rad * math.cos(ang), cy + rad * math.sin(ang)))
    return pts


def diag_gradient_fill(size: tuple[int, int], c0, c1, c2) -> Image.Image:
    """Three-stop gradient image, top-left to bottom-right, for filling text or strokes."""
    w, h = size
    ramp = Image.linear_gradient("L").resize((w, h), Image.BICUBIC)
    # Blend a horizontal ramp with the vertical one for a diagonal feel.
    horiz = Image.linear_gradient("L").rotate(90, expand=True).resize((w, h), Image.BICUBIC)
    mix = ImageChops.add(ramp.point(lambda v: v // 4), horiz.point(lambda v: v * 3 // 4))
    a = mix.point(lambda v: min(255, v * 2))
    b = mix.point(lambda v: max(0, (v - 128) * 2))
    out = Image.new("RGB", size, c0)
    out = Image.composite(Image.new("RGB", size, c1), out, a)
    out = Image.composite(Image.new("RGB", size, c2), out, b)
    return out


def main() -> None:
    w, h = W * SS, H * SS
    img = gradient_background(w, h)

    # Soft glows: blue upper right behind the mark, purple lower left.
    img = add_glow(img, (w * 0.80, h * 0.26), 330 * SS, BLUE, 0.42)
    img = add_glow(img, (w * 0.10, h * 0.95), 360 * SS, PURPLE, 0.40)
    img = add_glow(img, (w * 0.55, h * 0.55), 260 * SS, (40, 40, 140), 0.18)

    # Text layout first, so stars can avoid the text block.
    name_font = load_font(BOLD_CANDIDATES, 112 * SS)
    left = 80 * SS
    max_text_w = (W - 160) * SS

    # Subtitle: fit on one line between 34 and 27 px, otherwise wrap at " | ".
    sub_lines: list[str]
    sub_size = 34
    while sub_size >= 27:
        f = load_font(REGULAR_CANDIDATES, sub_size * SS)
        if text_width(f, LINE) <= max_text_w:
            break
        sub_size -= 1
    sub_font = load_font(REGULAR_CANDIDATES, max(sub_size, 27) * SS)
    if text_width(sub_font, LINE) <= max_text_w:
        sub_lines = [LINE]
    else:
        parts = LINE.split(" | ")
        sub_font = load_font(REGULAR_CANDIDATES, 34 * SS)
        sub_lines = [parts[0], " | ".join(parts[1:])]

    name_y = 210 * SS
    name_w = text_width(name_font, NAME)
    sub_y = 394 * SS
    sub_lh = int(sub_font.size * 1.35)
    text_box = (left - 30 * SS, name_y - 10 * SS, left + max(name_w, max_text_w) + 30 * SS, sub_y + sub_lh * len(sub_lines) + 20 * SS)

    rng = random.Random(11)
    layer = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)

    # Small stars, dimmer and fewer inside the text block.
    for _ in range(95):
        x, y = rng.uniform(0, w), rng.uniform(0, h)
        inside = text_box[0] < x < text_box[2] and text_box[1] < y < text_box[3]
        if inside and rng.random() < 0.8:
            continue
        r = rng.choice([1.0, 1.2, 1.6, 2.0, 2.6]) * SS * 0.8
        a = rng.randint(70, 200) if not inside else rng.randint(40, 90)
        tint = rng.choice([(255, 255, 255), (219, 234, 254), (221, 214, 254)])
        d.ellipse((x - r, y - r, x + r, y + r), fill=tint + (a,))

    # A handful of sparkles with a soft halo, kept clear of the text.
    sparkles = [(1135, 290, 14), (700, 85, 11), (1130, 560, 13), (95, 85, 10), (640, 575, 9), (1000, 505, 8)]
    halo = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    hd = ImageDraw.Draw(halo)
    for sx, sy, sr in sparkles:
        hd.ellipse(((sx - sr * 1.6) * SS, (sy - sr * 1.6) * SS, (sx + sr * 1.6) * SS, (sy + sr * 1.6) * SS), fill=LAVENDER + (90,))
        d.polygon(four_point_star(sx * SS, sy * SS, sr * SS), fill=(245, 243, 255, 255))
    halo = halo.filter(ImageFilter.GaussianBlur(10 * SS))

    # Orbit mark (echoes the favicon): a tilted ring with a large four-point star, upper right.
    tilt = 20  # degrees, counter-clockwise on screen
    mcx, mcy = 960 * SS, 142 * SS
    rx, ry = 200 * SS, 66 * SS
    ring_mask = Image.new("L", (w, h), 0)
    ImageDraw.Draw(ring_mask).ellipse((mcx - rx, mcy - ry, mcx + rx, mcy + ry), outline=255, width=7 * SS)
    ring_mask = ring_mask.rotate(tilt, center=(mcx, mcy), resample=Image.BICUBIC)
    box = (int(mcx - rx - 20 * SS), int(mcy - rx - 20 * SS), int(mcx + rx + 20 * SS), int(mcy + rx + 20 * SS))
    box_fill = diag_gradient_fill((box[2] - box[0], box[3] - box[1]), BLUE, PURPLE, LAVENDER)
    ring_rgb = Image.new("RGB", (w, h), BLUE)
    ring_rgb.paste(box_fill, (box[0], box[1]))
    ring_layer = ring_rgb.convert("RGBA")
    ring_layer.putalpha(ring_mask)

    star_halo = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    ImageDraw.Draw(star_halo).ellipse((mcx - 95 * SS, mcy - 95 * SS, mcx + 95 * SS, mcy + 95 * SS), fill=BLUE + (120,))
    star_halo = star_halo.filter(ImageFilter.GaussianBlur(40 * SS))
    d.polygon(four_point_star(mcx, mcy, 88 * SS, 0.2), fill=(239, 246, 255, 255))

    # A small planet riding the ring (same rotation sense as ImageDraw/rotate above).
    t = math.radians(-35)
    ex, ey = rx * math.cos(t), ry * math.sin(t)
    th = math.radians(tilt)
    px = mcx + ex * math.cos(th) + ey * math.sin(th)
    py = mcy - ex * math.sin(th) + ey * math.cos(th)
    d.ellipse((px - 10 * SS, py - 10 * SS, px + 10 * SS, py + 10 * SS), fill=LAVENDER + (255,))

    img = img.convert("RGBA")
    img = Image.alpha_composite(img, halo)
    img = Image.alpha_composite(img, star_halo)
    img = Image.alpha_composite(img, ring_layer)
    img = Image.alpha_composite(img, layer)

    # Text.
    td = ImageDraw.Draw(img)
    # Name with a soft shadow for separation from the background.
    shadow = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    ImageDraw.Draw(shadow).text((left, name_y + 4 * SS), NAME, font=name_font, fill=(3, 6, 20, 190))
    shadow = shadow.filter(ImageFilter.GaussianBlur(6 * SS))
    img = Image.alpha_composite(img, shadow)
    td = ImageDraw.Draw(img)
    td.text((left, name_y), NAME, font=name_font, fill=TEXT + (255,))

    # Gradient rule under the name.
    rule_y = 364 * SS
    rule_w = 160 * SS
    rule = diag_gradient_fill((rule_w, 6 * SS), BLUE, PURPLE, LAVENDER)
    rule_mask = Image.new("L", (rule_w, 6 * SS), 0)
    ImageDraw.Draw(rule_mask).rounded_rectangle((0, 0, rule_w - 1, 6 * SS - 1), radius=3 * SS, fill=255)
    img.paste(rule, (left, rule_y), rule_mask)

    for i, line in enumerate(sub_lines):
        td.text((left, sub_y + i * sub_lh), line, font=sub_font, fill=MUTED + (255,))

    # URL, bottom left.
    url_font = load_font(REGULAR_CANDIDATES, 26 * SS)
    td.text((left, (H - 78) * SS), URL_TEXT, font=url_font, fill=(196, 181, 253, 255))

    final = img.convert("RGB").resize((W, H), Image.LANCZOS)
    OUT.parent.mkdir(parents=True, exist_ok=True)
    final.save(OUT, "PNG", optimize=True)
    print(f"wrote {OUT} ({W}x{H}), subtitle size {sub_font.size // SS}px, {len(sub_lines)} line(s)")


if __name__ == "__main__":
    main()
