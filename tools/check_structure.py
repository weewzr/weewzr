"""Structural and accessibility checks on a built site. Standard library only.

Usage:  python -I tools/check_structure.py [dist_dir]

Reads the built HTML (no browser, no JavaScript) and fails when:
  * a page has no lang, no single h1, duplicate ids, an img without alt, or a target="_blank" link without
    rel noopener,
  * a button has no text,
  * a case-study page has a tab bar whose tabs do not all point at ids that exist, or whose configuration
    names no heading present on the page (the enhancement script would then leave the bar hidden),
  * the home page project filter has a chip no project uses, or a project area with no chip.

It checks the static HTML, which is what a visitor without JavaScript receives. Behaviour with JavaScript
(arrow keys, tab switching, filtering) is covered by the browser checks described in docs/MAINTAINING.md.
"""
import json
import sys
from html.parser import HTMLParser
from pathlib import Path

dist = Path(next((a for a in sys.argv[1:] if not a.startswith("--")), "dist")).resolve()


class Page(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.lang = None
        self.h1 = 0
        self.ids = []
        self.problems = []
        self.h2_in_prose = []
        self.tab_config = None
        self.tab_buttons = []
        self.filter_chips = []
        self.item_areas = []
        self._stack = []  # open tags that matter: (tag, flag)
        self._button_text = None
        self._h2_text = None
        self._prose_depth = 0

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        cls = (a.get("class") or "").split()
        if tag == "html":
            self.lang = a.get("lang")
        if tag == "h1":
            self.h1 += 1
        if a.get("id"):
            self.ids.append(a["id"])
        if tag == "img" and "alt" not in a:
            self.problems.append(f"img without alt: {a.get('src')}")
        if tag == "img" and self._button_text is not None:
            self._button_text += a.get("alt") or ""  # an image alt text names a button
        if tag == "a" and a.get("target") == "_blank" and "noopener" not in (a.get("rel") or ""):
            self.problems.append(f"target=_blank without rel noopener: {a.get('href')}")
        if "data-config" in a and "data-case-tabs" in a:
            try:
                self.tab_config = json.loads(a["data-config"])
            except ValueError:
                self.problems.append("data-config on the case body is not valid JSON")
        if tag == "button":
            self._button_text = ""
            if "data-tab" in a:
                self.tab_buttons.append({"tab": a["data-tab"], "controls": a.get("aria-controls"), "id": a.get("id")})
            if "data-area" in a:
                self.filter_chips.append(a["data-area"])
            self._aria_label = a.get("aria-label") or a.get("aria-labelledby")
        if tag == "li" and "data-areas" in a:
            self.item_areas.append((a["data-areas"] or "").split())
        if "case-prose" in cls:
            self._prose_depth = 1
        elif self._prose_depth and tag not in ("img", "br", "hr", "input", "meta", "link"):
            self._prose_depth += 1
        if tag == "h2" and self._prose_depth == 2:
            self._h2_text = ""

    def handle_endtag(self, tag):
        if tag == "button" and self._button_text is not None:
            if not self._button_text.strip() and not getattr(self, "_aria_label", None):
                self.problems.append("button without text")
            self._button_text = None
        if tag == "h2" and self._h2_text is not None:
            self.h2_in_prose.append(self._h2_text.strip())
            self._h2_text = None
        if self._prose_depth and tag not in ("img", "br", "hr", "input", "meta", "link"):
            self._prose_depth -= 1

    def handle_data(self, data):
        if self._button_text is not None:
            self._button_text += data
        if self._h2_text is not None:
            self._h2_text += data


def check_page(path: Path, rel: str):
    p = Page()
    p.feed(path.read_text(encoding="utf-8"))
    errs = list(p.problems)
    if not p.lang:
        errs.append("html has no lang")
    if rel != "404.html" and p.h1 != 1:
        errs.append(f"expected one h1, found {p.h1}")
    dup = sorted({i for i in p.ids if p.ids.count(i) > 1})
    if dup:
        errs.append(f"duplicate ids: {dup}")

    if p.tab_buttons:
        cfg = p.tab_config or {}
        tabs = {t["id"]: t for t in cfg.get("tabs", [])}
        if len({b["tab"] for b in p.tab_buttons}) != len(p.tab_buttons):
            errs.append("duplicate tab buttons")
        if len(p.tab_buttons) < 2:
            errs.append("a tab bar needs at least two tabs")
        for b in p.tab_buttons:
            t = tabs.get(b["tab"])
            if not t:
                errs.append(f"tab {b['tab']} is not in the configuration")
                continue
            if b["controls"] != f"tab-{b['tab']}":
                errs.append(f"tab {b['tab']} has unexpected aria-controls {b['controls']}")
            pinned = set(cfg.get("pinned", []))
            present = [h for h in t["headings"] if h in p.h2_in_prose and h not in pinned]
            if not present:
                errs.append(f"tab {b['tab']} lists no heading present on the page: {t['headings']} vs {p.h2_in_prose}")
    elif p.tab_config is not None:
        errs.append("tab configuration without a tab bar")

    if p.filter_chips:
        used = {a for areas in p.item_areas for a in areas}
        chips = {c for c in p.filter_chips if c != "all"}
        if "all" not in p.filter_chips:
            errs.append("filter has no 'all' chip")
        if chips - used:
            errs.append(f"filter chips no project uses: {sorted(chips - used)}")
        if used - chips:
            errs.append(f"project areas without a chip: {sorted(used - chips)}")
    return errs, p


def main() -> int:
    pages = sorted(dist.rglob("*.html"))
    if not pages:
        print(f"no HTML found under {dist}")
        return 1
    failures = 0
    tab_pages = 0
    for page in pages:
        rel = page.relative_to(dist).as_posix()
        errs, parsed = check_page(page, rel)
        if parsed.tab_buttons:
            tab_pages += 1
        for e in errs:
            failures += 1
            print(f"{rel}: {e}")
    print(f"checked {len(pages)} pages, {tab_pages} with case-study tabs, {failures} problems")
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
