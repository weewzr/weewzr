"""Render a PDF into the page images the document viewer shows, and print the front matter for it.

Usage:
    python tools/make_document_pages.py <file.pdf> <section-slug> <document-id> [--max-px 1400] [--quality 72]

Example:
    python tools/make_document_pages.py ../my-report.pdf cn5303-low-carbon-data-centre report

Writes:
    public/documents/<section-slug>/<document-id>.pdf           (a copy of the PDF, metadata cleared)
    public/documents/<section-slug>/<document-id>/p-001.webp    (one WebP per page)

Before running it, make sure the PDF is the edition you want the public to see. This script refuses a PDF
whose text contains a student number or a university email address, because those must never be published.
It cannot check for other people's names: remove those from the PDF first.

Needs PyMuPDF and Pillow (see tools/requirements.txt). Nothing in the site build depends on Python.
"""
import argparse
import re
import shutil
import sys
from pathlib import Path

import pymupdf
from PIL import Image

REPO = Path(__file__).resolve().parent.parent
BLOCKED = [
    (re.compile(r"\bA\d{7}[A-Z]\b"), "a student number"),
    (re.compile(r"[\w.]+@u\.nus\.edu", re.I), "a university email address"),
]


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("pdf", type=Path)
    ap.add_argument("slug")
    ap.add_argument("doc_id")
    ap.add_argument("--max-px", type=int, default=1400, help="longest side of each page image in pixels")
    ap.add_argument("--quality", type=int, default=72)
    args = ap.parse_args()

    doc = pymupdf.open(args.pdf)
    for i, page in enumerate(doc, 1):
        text = page.get_text()
        for pattern, what in BLOCKED:
            if pattern.search(text):
                print(f"refused: page {i} contains {what}. Remove it from the PDF and run again.")
                return 1

    out_dir = REPO / "public" / "documents" / args.slug
    pages_dir = out_dir / args.doc_id
    if pages_dir.exists():
        shutil.rmtree(pages_dir)
    pages_dir.mkdir(parents=True)

    doc.set_metadata({})
    doc.del_xml_metadata()
    pdf_out = out_dir / f"{args.doc_id}.pdf"
    doc.save(pdf_out, garbage=4, deflate=True)

    first = None
    for i, page in enumerate(doc, 1):
        zoom = args.max_px / max(page.rect.width, page.rect.height)
        pix = page.get_pixmap(matrix=pymupdf.Matrix(zoom, zoom), colorspace=pymupdf.csRGB, alpha=False)
        im = Image.frombytes("RGB", (pix.width, pix.height), pix.samples)
        im.save(pages_dir / f"p-{i:03d}.webp", "WEBP", quality=args.quality, method=6)
        first = first or im.size

    rel = f"documents/{args.slug}"
    print(f"wrote {pdf_out.relative_to(REPO)} and {doc.page_count} page image(s)\n")
    print("Front matter for the entry's `documents` list:\n")
    print(f"  - id: {args.doc_id}")
    print('    title: "..."')
    print("    kind: report   # report | slides | poster | essay | summary")
    print("    published: true")
    print(f'    pdf: "{rel}/{args.doc_id}.pdf"')
    print(f'    pageDir: "{rel}/{args.doc_id}"')
    print(f"    pages: {doc.page_count}")
    print(f"    pageWidth: {first[0]}")
    print(f"    pageHeight: {first[1]}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
