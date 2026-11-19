"""Generate public/og-image.png, the 1200x630 social preview card.

Pillow only, no network. Text content comes from the constants below, which mirror
src/data/site.ts (name and identity). No third-party artwork is used.

The card is flat: a navy field, the name, a short blue rule, one descriptor line and the site
address. Colours are the tokens in src/styles/global.css. There are no gradients and no glows.

Run from the repository root:  python -I tools/make_og.py
"""
from __future__ import annotations

import math
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

W, H = 1200, 630
SS = 2  # supersampling factor: draw at 2x, then downscale for clean edges

NAME = "Wee Zhern Ray"
LINE = "Chemical Engineering @ NUS | Nuclear & Low-Carbon Energy | Process Modelling"
URL_TEXT = "weewzr.github.io/weewzr"

# Palette (mirrors src/styles/global.css)
NAVY = (0x0B, 0x1F, 0x3A)  # --navy
ACCENT = (0x78, 0xAE, 0xFF)  # --accent, dark theme
CYAN = (0x67, 0xD3, 0xE3)  # --cyan, dark theme
TEXT = (0xFF, 0xFF, 0xFF)
MUTED = (0xA3, 0xB2, 0xC5)  # --text-muted, dark theme
LINE_COLOUR = (0x26, 0x37, 0x50)  # --border, dark theme

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


def four_point_star(cx: float, cy: float, r: float, pinch: float = 0.22) -> list[tuple[float, float]]:
    pts = []
    for i in range(8):
        ang = math.pi / 2 * (i / 2) - math.pi / 2
        rad = r if i % 2 == 0 else r * pinch
        pts.append((cx + rad * math.cos(ang), cy + rad * math.sin(ang)))
    return pts


def main() -> None:
    w, h = W * SS, H * SS
    img = Image.new("RGB", (w, h), NAVY)
    d = ImageDraw.Draw(img)
    left = 80 * SS
    max_text_w = (W - 160) * SS

    # Mark (echoes the favicon): a tilted ring with a four-point star, upper right. Flat colours.
    mcx, mcy = 1030 * SS, 150 * SS
    rx, ry = 120 * SS, 42 * SS
    ring = Image.new("L", (w, h), 0)
    ImageDraw.Draw(ring).ellipse((mcx - rx, mcy - ry, mcx + rx, mcy + ry), outline=255, width=5 * SS)
    ring = ring.rotate(20, center=(mcx, mcy), resample=Image.BICUBIC)
    img.paste(Image.new("RGB", (w, h), ACCENT), (0, 0), ring)
    d = ImageDraw.Draw(img)
    d.polygon(four_point_star(mcx, mcy, 52 * SS, 0.2), fill=TEXT)

    # Name.
    name_font = load_font(BOLD_CANDIDATES, 104 * SS)
    name_y = 220 * SS
    d.text((left, name_y), NAME, font=name_font, fill=TEXT)

    # Short solid rule under the name.
    rule_y = 368 * SS
    d.rectangle((left, rule_y, left + 96 * SS, rule_y + 4 * SS), fill=ACCENT)

    # Descriptor: one line between 32 and 26 px, otherwise wrapped at the first " | ".
    size = 32
    while size > 26 and load_font(REGULAR_CANDIDATES, size * SS).getlength(LINE) > max_text_w:
        size -= 1
    sub_font = load_font(REGULAR_CANDIDATES, size * SS)
    if sub_font.getlength(LINE) <= max_text_w:
        sub_lines = [LINE]
    else:
        parts = LINE.split(" | ")
        sub_lines = [parts[0], " | ".join(parts[1:])]
    sub_y = 400 * SS
    sub_lh = int(sub_font.size * 1.4)
    for i, line in enumerate(sub_lines):
        d.text((left, sub_y + i * sub_lh), line, font=sub_font, fill=MUTED)

    # Hairline and site address, bottom left.
    d.rectangle((left, (H - 112) * SS, (W - 80) * SS, (H - 112) * SS + SS), fill=LINE_COLOUR)
    url_font = load_font(REGULAR_CANDIDATES, 26 * SS)
    d.text((left, (H - 86) * SS), URL_TEXT, font=url_font, fill=CYAN)

    final = img.resize((W, H), Image.LANCZOS)
    OUT.parent.mkdir(parents=True, exist_ok=True)
    final.save(OUT, "PNG", optimize=True)
    print(f"wrote {OUT} ({W}x{H}), descriptor {sub_font.size // SS}px, {len(sub_lines)} line(s)")


if __name__ == "__main__":
    main()
