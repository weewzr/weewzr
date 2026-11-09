"""Cut the white background out of the three Perry source images and write web-ready WebP/PNG files.

The source JPGs are supplied by the site owner and are not stored in this repository.
The artwork belongs to Disney; see docs/CREDITS.md.

Run:  MASCOT_SRC=<folder with the source JPGs> python tools/make_mascot.py
(default folder: _work/mascot-src, which is git-ignored)
"""
import os
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

SRC = Path(os.environ.get("MASCOT_SRC", Path(__file__).resolve().parent.parent / "_work" / "mascot-src"))
OUT = Path(__file__).resolve().parent.parent / "public" / "mascot"
OUT.mkdir(parents=True, exist_ok=True)

MARK = (255, 0, 255)

JOBS = [
    # (source file, output stem, target height px, optional crop box as fractions l,t,r,b)
    ("Phineas And Ferb, Invention, Sibling, Fun, Summer PNG.jpg", "perry-agent-standing", 760, None),
    ("Perry The Platypus Png, Transparent Png , Transparent Png Image - PNGitem.jpg", "perry-agent-crouch", 520, None),
    ("Perry The Platypus Phineas Flynn Ferb Fletcher Child PNG.jpg", "perry-walk", 420, None),
    ("Phineas And Ferb, Invention, Sibling, Fun, Summer PNG.jpg", "perry-agent-head", 360, (0.26, 0.0, 0.88, 0.47)),
]


def cut(img: Image.Image) -> Image.Image:
    """Key out the background: neutral light pixels (white and the grey squares of a baked-in
    checkerboard) that are connected to the image border. Black outlines stop the fill, so eye
    whites and other enclosed light areas survive."""
    import numpy as np

    rgb = img.convert("RGB")
    w, h = rgb.size
    a = np.asarray(rgb).astype(int)
    mn, mx = a.min(axis=2), a.max(axis=2)
    cand = (mn > 165) & ((mx - mn) < 30)
    # Connected-component fill from the border, in numpy (4-neighbour propagation).
    bg = np.zeros_like(cand)
    bg[0, :], bg[-1, :], bg[:, 0], bg[:, -1] = cand[0, :], cand[-1, :], cand[:, 0], cand[:, -1]
    while True:
        grown = bg.copy()
        grown[1:, :] |= bg[:-1, :]
        grown[:-1, :] |= bg[1:, :]
        grown[:, 1:] |= bg[:, :-1]
        grown[:, :-1] |= bg[:, 1:]
        grown &= cand
        if grown.sum() == bg.sum():
            break
        bg = grown
    alpha = Image.fromarray(np.where(bg, 0, 255).astype("uint8"), "L")
    # Pull the edge in a touch to hide the JPEG halo, then soften it.
    alpha = alpha.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.9))
    out = rgb.convert("RGBA")
    out.putalpha(alpha)
    return out


def main() -> None:
    for fname, stem, target_h, crop in JOBS:
        src = Image.open(SRC / fname)
        cut_img = cut(src)
        if crop:
            w, h = cut_img.size
            cut_img = cut_img.crop((int(crop[0] * w), int(crop[1] * h), int(crop[2] * w), int(crop[3] * h)))
        bbox = cut_img.getchannel("A").point(lambda v: 255 if v > 8 else 0).getbbox()
        if bbox:
            cut_img = cut_img.crop(bbox)
        scale = target_h / cut_img.height
        cut_img = cut_img.resize((max(1, round(cut_img.width * scale)), target_h), Image.LANCZOS)
        cut_img.save(OUT / f"{stem}.webp", "WEBP", quality=88, method=6)
        cut_img.save(OUT / f"{stem}.png", "PNG", optimize=True)
        print(stem, cut_img.size)


if __name__ == "__main__":
    main()
