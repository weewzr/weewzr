"""Build the 16:10 project preview images in public/projects/.

Only real project material is used, never an invented screenshot:
  kasco.webp   _work/kasco.png (screenshot of the live KASCO app), resized to 16:10 only.
  nush2.webp   public/projects/nush2/process-flow.webp (the process-flow figure from the NUS-H2
               repository, as published in the case study), placed unmodified on a flat paper panel.
  strato.webp  public/projects/strato/triso-cross-section.webp (figure from the STRATO documentation, as
               published in the case study), placed unmodified on the same kind of panel.
  The AmCraX images are screen captures made separately (see docs/CREDITS.md); this script does not
  touch them.

Each image is written at 1280x800 and as a 640px-wide variant (name-640.webp) for srcset.

Run from the repository root:  python -I tools/make_project_images.py
Requires Pillow. The KASCO image needs the screenshot in _work/ (kept outside git); without it the
committed kasco images are kept and a message says so. render_svg() needs Microsoft Edge and is kept
for figures that exist only as SVG.
"""
from __future__ import annotations

import subprocess
import sys
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
WORK = ROOT / "_work"
SCRATCH = WORK / "projects-ui"
OUT = ROOT / "public" / "projects"

W, H = 1280, 800  # 16:10
SMALL_W = 640
PANEL = (0xEF, 0xEB, 0xE2)  # --bg-subtle (light theme) in src/styles/global.css
EDGE_CANDIDATES = [
    Path(r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"),
    Path(r"C:\Program Files\Microsoft\Edge\Application\msedge.exe"),
]
WEBP_QUALITY = 82
MAX_BYTES = 150 * 1024


def save_webp(img: Image.Image, stem: str) -> None:
    """Write stem.webp at W x H and stem-640.webp at SMALL_W, lowering quality if above the size budget."""
    OUT.mkdir(parents=True, exist_ok=True)
    img = img.convert("RGB")
    assert img.size == (W, H), img.size
    small = img.resize((SMALL_W, SMALL_W * H // W), Image.LANCZOS)
    for name, im in ((f"{stem}.webp", img), (f"{stem}-640.webp", small)):
        path = OUT / name
        quality = WEBP_QUALITY
        while True:
            im.save(path, "WEBP", quality=quality, method=6)
            if path.stat().st_size <= MAX_BYTES or quality <= 55:
                break
            quality -= 6
        print(f"wrote {path.relative_to(ROOT)}  {im.size[0]}x{im.size[1]}  {path.stat().st_size / 1024:.1f} KB  q{quality}")


def panel_background(width: int, height: int) -> Image.Image:
    """Flat paper panel. No gradient and no glow, so the figure is the only thing with colour."""
    return Image.new("RGB", (width, height), PANEL)


def place_on_panel(figure: Image.Image, max_w: int, max_h: int, radius: int = 8) -> Image.Image:
    """Centre an unmodified figure (only scaled) on the paper panel as a white card with 8px corners."""
    fig = figure.convert("RGB")
    scale = min(max_w / fig.width, max_h / fig.height)
    new_size = (round(fig.width * scale), round(fig.height * scale))
    fig = fig.resize(new_size, Image.LANCZOS)
    canvas = panel_background(W, H).convert("RGBA")
    x, y = (W - new_size[0]) // 2, (H - new_size[1]) // 2
    mask = Image.new("L", new_size, 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, new_size[0] - 1, new_size[1] - 1), radius, fill=255)
    canvas.paste(fig, (x, y), mask)
    return canvas.convert("RGB")


def make_kasco() -> None:
    """The source is already a 1440x900 (16:10) screenshot; resize only."""
    if not (WORK / "kasco.png").exists():
        print("skipped kasco.webp: _work/kasco.png is not present, the committed images are kept")
        return
    src = Image.open(WORK / "kasco.png").convert("RGB")
    # Crop to exactly 16:10 if the source ever changes, then resize. No other edits.
    target = W / H
    if abs(src.width / src.height - target) > 1e-3:
        if src.width / src.height > target:
            new_w = round(src.height * target)
            left = (src.width - new_w) // 2
            src = src.crop((left, 0, left + new_w, src.height))
        else:
            new_h = round(src.width / target)
            src = src.crop((0, 0, src.width, new_h))
    save_webp(src.resize((W, H), Image.LANCZOS), "kasco")


def render_svg(svg: Path, png: Path, width: int, height: int, scale: int = 2) -> None:
    """Render an SVG to PNG with Edge headless at the given device scale factor."""
    edge = next((p for p in EDGE_CANDIDATES if p.exists()), None)
    if edge is None:
        sys.exit("Microsoft Edge not found and no cached render exists at " + str(png))
    SCRATCH.mkdir(parents=True, exist_ok=True)
    html = SCRATCH / "render.html"
    html.write_text(
        '<!doctype html><meta charset="utf-8"><style>html,body{margin:0;background:#fff}'
        f'img{{display:block;width:{width}px;height:{height}px}}</style><img src="{svg.as_uri()}" alt="">',
        encoding="utf-8",
    )
    cmd = [
        str(edge), "--headless=new", "--disable-gpu", "--hide-scrollbars",
        f"--user-data-dir={SCRATCH / 'edge-profile'}",  # own profile so a running Edge does not interfere
        f"--force-device-scale-factor={scale}", f"--window-size={width},{height + 120}",
        "--virtual-time-budget=4000", f"--screenshot={png}", html.as_uri(),
    ]
    for _ in range(3):  # headless Edge occasionally exits without writing the file
        png.unlink(missing_ok=True)
        subprocess.run(cmd, capture_output=True, timeout=90)
        if png.exists():
            return
    sys.exit("Edge did not write " + str(png))


def make_nush2() -> None:
    fig = Image.open(OUT / "nush2" / "process-flow.webp")
    pad = 30
    save_webp(place_on_panel(fig, W - 2 * pad, H - 2 * pad), "nush2")


def make_strato() -> None:
    fig = Image.open(OUT / "strato" / "triso-cross-section.webp")
    if fig.mode == "RGBA":  # opaque white in the source, flatten on white to be safe
        flat = Image.new("RGB", fig.size, (255, 255, 255))
        flat.paste(fig, mask=fig.getchannel("A"))
        fig = flat
    pad = 40
    save_webp(place_on_panel(fig, W - 2 * pad, H - 2 * pad), "strato")


if __name__ == "__main__":
    make_kasco()
    make_nush2()
    make_strato()
