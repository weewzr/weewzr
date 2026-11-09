"""Validate links and assets in a built site.

Usage:  python -I tools/check_links.py [dist_dir] [--external]

Checks every href/src/srcset in the built HTML:
  * internal links resolve to a file in dist (the /weewzr base path is stripped),
  * #fragments exist as ids in the target page,
  * with --external, every external URL answers with a 2xx/3xx status.
"""
import re
import sys
from concurrent.futures import ThreadPoolExecutor
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urldefrag, urlparse
from urllib.request import Request, urlopen

BASE = "/weewzr"
dist = Path(next((a for a in sys.argv[1:] if not a.startswith("--")), "dist")).resolve()
check_external = "--external" in sys.argv


class Collector(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links, self.ids = [], set()

    def handle_starttag(self, tag, attrs):
        d = dict(attrs)
        if d.get("id"):
            self.ids.add(d["id"])
        for key in ("href", "src", "poster"):
            if d.get(key):
                self.links.append((tag, key, d[key]))
        if d.get("srcset"):
            for part in d["srcset"].split(","):
                u = part.strip().split(" ")[0]
                if u:
                    self.links.append((tag, "srcset", u))
        if tag == "meta" and d.get("property") in ("og:image", "og:url") and d.get("content"):
            self.links.append((tag, d["property"], d["content"]))


pages = {}
for f in dist.rglob("*.html"):
    c = Collector()
    c.feed(f.read_text(encoding="utf-8", errors="replace"))
    pages[f] = c

errors, externals = [], {}


def resolve(url_path: str):
    p = unquote(url_path)
    if p.startswith(BASE):
        p = p[len(BASE):]
    p = p.lstrip("/")
    t = dist / p
    if t.is_dir():
        t = t / "index.html"
    elif not t.exists() and (dist / (p + ".html")).exists():
        t = dist / (p + ".html")
    return t


for f, c in pages.items():
    rel = f.relative_to(dist)
    for tag, key, url in c.links:
        if url.startswith(("mailto:", "tel:", "data:", "javascript:")):
            continue
        if re.match(r"^https?://", url):
            u = urlparse(url)
            if u.netloc == "weewzr.github.io" and u.path.startswith(BASE):
                url = u.path + (("#" + u.fragment) if u.fragment else "")
            else:
                externals.setdefault(urldefrag(url)[0], []).append(str(rel))
                continue
        if url.startswith("//"):
            externals.setdefault("https:" + url, []).append(str(rel))
            continue
        path, frag = urldefrag(url)
        if path == "":
            target = f
        elif path.startswith("/"):
            if not path.startswith(BASE + "/") and path != BASE:
                errors.append(f"{rel}: root-relative link without base path -> {url}")
                continue
            target = resolve(path)
        else:
            target = resolve(str((f.parent / path).relative_to(dist)).replace("\\", "/"))
        if not target.exists():
            errors.append(f"{rel}: missing target for {key} {url}")
            continue
        if frag and target.suffix == ".html":
            tp = pages.get(target)
            if tp is not None and frag not in tp.ids:
                errors.append(f"{rel}: missing fragment #{frag} in {target.relative_to(dist)}")

print(f"pages: {len(pages)}  external urls: {len(externals)}")

if check_external:
    def probe(u):
        for method in ("HEAD", "GET"):
            try:
                req = Request(u, method=method, headers={"User-Agent": "Mozilla/5.0 link-check"})
                with urlopen(req, timeout=20) as r:
                    return u, r.status
            except Exception as e:  # noqa: BLE001
                err = getattr(e, "code", str(e))
                last = err
        return u, last

    with ThreadPoolExecutor(8) as ex:
        for u, status in ex.map(probe, sorted(externals)):
            ok = isinstance(status, int) and 200 <= status < 400
            print(("ok   " if ok else "FAIL ") + str(status) + " " + u)
            if not ok:
                errors.append(f"external {status}: {u} (used in {externals[u][0]})")

if errors:
    print("\nERRORS:")
    for e in errors:
        print(" -", e)
    sys.exit(1)
print("all internal links and assets resolve")
