# Portfolio repository and library comparison

Checked on 2026-11-15 by the `research` agent. Repository facts come from `gh api repos/<owner>/<repo>` and the contents API. Package facts come from `npm view`. Gzip sizes marked "BP" come from the Bundlephobia API (entry bundle of the latest version, tree-shaking not applied, so a real build can be smaller). Gzip sizes marked "live" were measured by me today by fetching the initial `<script src>` files of the public demo page and recompressing with zlib level 9, so they are approximate and count only scripts named in the first HTML. Anything I did not fetch is written "not checked".

For scale, the owner's own live home page (`https://weewzr.github.io/weewzr/`, the deployed main branch, not the feature branch) showed 1 script tag of about 1 kB gzip by the same method. The site depends on `three` 0.187.0 and Astro 7.4.8 (from its `package.json`).

## Matrix

"Astro 7 fit" means usable in a static Astro 7 site without React. "Cost" is the JS a visitor would download. A11y for the five named repositories was read from the demo's first HTML response only (all five set `lang`, all images carry `alt`, none has a skip link in that HTML); I could not test keyboard use, focus handling or reduced motion, and a code search for reduced-motion handling returned no hits in any of the five, which proves nothing either way.

| # | Repository | What / stack | Licence (SPDX as reported) | Last push | Stars | Astro 7 fit | Cost (gzip) | Complexity | Value for this site |
|---|---|---|---|---|---|---|---|---|---|
| 1 | magicuidesign/portfolio | Developer portfolio. Next.js 16.1.1, React 19, Tailwind 4, motion 12 | MIT | 2026-01-13 | 1537 | No (React, Next) | live 303 kB | Medium | Patterns only: floating dock nav, subtle blur-in |
| 2 | sabin-paudel/portfolio-template | Template. Next.js 16.1.6, React 19, framer-motion 12, Tailwind 4 | none (no licence file) | 2026-10-18 | 2 | No | live 258 kB | Low | None beyond reading |
| 3 | Naresh-Khatri/3d-portfolio | Keyboard of keycaps as skills. Next 16.2.2, R3F 9.8.1, three 0.185.1, GSAP, Lenis, motion, MDX | MIT | 2026-10-28 | 1349 | No | live 470 kB (WebGL scene loads more, not measured) | High | Idea of a single signature 3D object; not transferable |
| 4 | Maher-Elmair/3D-Portfolio | Next 16.2.10, R3F 9.6.1, drei, three, Sentry, motion | none (no licence file) | 2026-08-06 | 3 | No | live 824 kB | High | None; study only |
| 5 | shivy02/portfolio-website | Next 15.2.6, React 19, framer-motion, Tailwind 4, Vercel analytics, live widgets, Markdown blog | NOASSERTION (custom file: Apache-2.0 for code, all rights reserved for personal content) | 2026-10-05 | 11 | No | live 283 kB | Medium | Blog layout pattern only; its personal content is off limits |
| 6 | academicpages/academicpages.github.io | Jekyll academic template (publications, talks, CV) | MIT | 2026-11-12 | 17821 | No (Jekyll) | not checked | Low | Information architecture for publications and talks |
| 7 | alshedivat/al-folio | Jekyll academic theme with BibTeX, projects, news | MIT | 2026-11-13 | 16346 | No (Jekyll) | not checked | Medium | Patterns: news list, project cards, publication entries |
| 8 | HugoBlox/kit (reported name of the Wowchemy/Hugo Blox repository) | Hugo with Tailwind blocks | MIT | 2026-08-04 | 9795 | No (Hugo) | not checked | High | Block-based page composition as an idea |
| 9 | dadangnh/as-folio | Astro 6.4.8, React 19, Tailwind 4 academic theme with BibTeX | MIT | 2026-08-21 | 31 | Partly (Astro, but uses React) | not checked | Medium | Publication list pattern |
| 10 | shravanngoswamii/astro-scholar | Astro 6.4.5 academic theme | MIT | 2026-06-10 | 32 | Yes (no React in dependencies I grepped) | not checked | Low | Content layout reference |
| 11 | satnaing/astro-paper | Astro 7.4.5 blog theme, Tailwind 4, MDX, sitemap | MIT | 2026-11-13 | 5207 | Yes | not checked | Low | Accessibility and SEO practice to compare against |
| 12 | mearashadowfax/ScrewFast | Astro 7.4.7 site template, Tailwind 4, Starlight | MIT | 2026-11-14 | 1437 | Yes | not checked | Low | Not relevant (business template) |
| 13 | withastro/action | GitHub Action that builds and deploys Astro to Pages (docs name `withastro/action@v6`) | NOASSERTION (file reads MIT, 2022 The Astro Technology Company) | 2026-10-23 | 265 | Yes | zero runtime | Low | Check the site's workflow against it |
| 14 | pmndrs/react-three-fiber | React renderer for three.js (npm 9.8.2) | MIT | 2026-10-21 | 33722 | No (needs React) | BP not checked | n/a | Not usable |
| 15 | mrdoob/three.js | WebGL library (npm 0.187.0) | MIT | 2026-11-14 | 118382 | Yes (already present) | BP 186 kB (whole package) | Low | Keep as is for the starfield and any analytic 3D |
| 16 | motiondivision/motion | Animation library (npm `motion` 14.14.0) | MIT | 2026-11-13 | 35144 | Yes, vanilla API | BP 64 kB | Low | Not needed; CSS covers current motion |
| 17 | greensock/GSAP | Animation library (npm 3.15.1) | none in GitHub metadata; npm says "Standard 'no charge' license" | 2026-11-04 | 30621 | Yes | BP 27 kB | Low | Not needed; custom licence, not OSI |
| 18 | observablehq/plot | Declarative charts (npm 0.6.19) | ISC | 2026-11-05 | 5427 | Yes | BP 127 kB | Medium | Revisit only for new datasets |
| 19 | d3/d3 | Data visualisation (npm 7.9.2) | ISC | 2026-11-03 | 113918 | Yes | BP 93 kB (whole bundle) | Medium | Import single modules if ever needed |
| 20 | plotly/plotly.js | Charting (npm `plotly.js-basic-dist-min` 4.3.0) | MIT | 2026-11-13 | 18382 | Yes | BP not checked; unpacked 1.2 MB | Low | Too heavy |
| 21 | leeoniya/uPlot | Fast time-series plots (npm 1.6.32) | MIT | 2026-11-14 | 10639 | Yes | BP 22 kB | Low | Best candidate if a real plot is needed |
| 22 | vega/vega-lite | Grammar of graphics (npm 6.5.0) | BSD-3-Clause | 2026-11-13 | 5556 | Yes | BP not checked; unpacked 5.9 MB | Medium | Too heavy |
| 23 | KaTeX/KaTeX | Maths typesetting (npm 0.19.1) | MIT | 2026-11-12 | 20521 | Yes (build time possible) | BP 77 kB runtime; zero if rendered at build | Low | Revisit at build time only |
| 24 | mathjax/MathJax | Maths typesetting (npm 4.1.3) | Apache-2.0 | 2026-07-03 | 10950 | Yes | unpacked 20 MB; BP not checked | Medium | Not needed |
| 25 | mermaid-js/mermaid | Text to diagrams (npm 12.3.0) | MIT | 2026-11-14 | 91097 | Yes | BP entry 159 kB, with further lazy chunks not measured | Medium | Too heavy; draw SVG by hand |
| 26 | xyflow/xyflow | Node graph editor (npm `@xyflow/react` 12.12.1) | MIT | 2026-11-12 | 39014 | No for the React package | n/a | High | Not usable without React |
| 27 | bumbu/svg-pan-zoom | Pan and zoom for inline SVG (npm 3.6.2) | BSD-2-Clause | 2026-01-16 | 1978 | Yes | BP 7.9 kB | Low | Candidate for flow diagrams |
| 28 | anvaka/panzoom | Pan and zoom for any element (npm 9.4.4) | MIT | 2026-03-30 | 2014 | Yes | BP 6.2 kB | Low | Candidate for zoomable figures |
| 29 | openseadragon/openseadragon | Deep-zoom image viewer (npm 6.1.1) | BSD-3-Clause | 2026-11-10 | 3540 | Yes | BP 87 kB | Medium | Only for gigapixel images |
| 30 | dimsemenov/PhotoSwipe | Gallery lightbox (npm 5.4.4) | MIT | 2025-12-04 | 25303 | Yes | BP 17 kB | Low | Best candidate for the gallery |
| 31 | biati-digital/glightbox | Lightbox (npm 3.3.1) | MIT | 2025-12-02 | 2544 | Yes | BP 15 kB | Low | Simpler alternative |
| 32 | sachinchoolur/lightGallery | Gallery (npm 3.0.0) | GPL-3.0 (GitHub); npm: `(GPL-3.0-only OR LicenseRef-Commercial)` | 2026-11-04 | 7062 | Yes | BP 19 kB | Low | Avoid: copyleft or paid |
| 33 | mozilla/pdf.js | PDF renderer (npm `pdfjs-dist` 6.5.438) | Apache-2.0 | 2026-11-14 | 54132 | Yes | BP 133 kB for the main entry; worker separate, not measured | High | Not needed; pre-rendered WebP pages already planned |
| 34 | embedpdf/embed-pdf-viewer | PDF viewer (npm `@embedpdf/core` 3.2.0) | NOASSERTION; file says Apache-2.0 except `cloudpdf/server` under Fair Core License | 2026-11-14 | 4637 | Yes | not checked | Medium | Not needed |
| 35 | hakimel/reveal.js | HTML slides (npm 6.0.2) | MIT | 2026-09-30 | 72578 | Yes | BP 31 kB | Medium | Not needed; slides ship as page images |
| 36 | jonasmerlin/astro-seo | SEO tags component (npm 1.2.0) | MIT | 2026-08-28 | 1425 | Yes | zero runtime; unpacked 25 kB | Low | Optional; hand-written head is equivalent |

Not found: `withastro/astro-themes`, `ElMassimo/astro-sitemap` and `jonasmerlin/astro-seo-meta` returned HTTP 404 and are excluded. The first and third were guesses at names, not confirmed projects.

## Notes

**Repositories 1 to 5.** None can be adopted. All five are React and Next.js, and the measured first-load scripts (258 to 824 kB gzip) are far above the 1 kB measured on this site's home page. Design was judged from one first-viewport screenshot each, taken during entrance animation, so I make no finer claim. Repository 2 has no licence file (checked: the root listing has no LICENSE), so it is all rights reserved. Repository 4 also has no licence file, and its demo HTML carries 13 `h1` elements, which is an accessibility defect in that page. Repository 3 is MIT and its idea (one 3D object as the identity) conflicts with this site, which already has a starfield. Repository 5 is mixed: the code is Apache-2.0 and a NOTICE file must be preserved on redistribution, while its personal content (name, biography, photographs) is reserved. Repository 1 is MIT; a floating dock navigation is a pattern I could write in 30 lines of CSS.

**Academic templates (6 to 10).** al-folio and academicpages are the reference for what supervisors expect: publications, talks, news. The Astro ones are small projects with few stars, so they are references and not dependencies. as-folio needs React, so it does not fit.

**Libraries.** The only entries that fit both the licence and the size bar are PhotoSwipe (17 kB gzip BP), panzoom (6.2 kB) and svg-pan-zoom (7.9 kB). The redesign already plans hand-written lightbox and zoomable figures with small vanilla scripts; the numbers say a library would add 6 to 17 kB for features a 2 to 4 kB script can cover, unless touch gestures and keyboard behaviour turn out costly to build and test.

## Decisions

**Patterns worth taking (re-implemented in the site's own components).**
- From al-folio and academicpages: a publications-and-talks style index with year groupings, if the Research section grows to need it.
- From magicuidesign/portfolio: a compact floating navigation on small screens, written as plain CSS with a 44 px minimum target.
- From astro-paper: compare the site's skip link, heading order and sitemap setup with its practice.

**Libraries to adopt now.** None. Justification: the site's own JS is about 1 kB on the deployed home page, the Astryx test cost 75 to 215 kB for one island, and the nearest candidate (PhotoSwipe, 17 kB BP) replaces something already designed as a small script. No measured benefit exists yet.

**Revisit later, with a condition.**
- PhotoSwipe or panzoom: if the hand-written lightbox or figure zoom fails keyboard, focus-trap or pinch testing and fixing it costs more than the library size. Measure the built page before and after.
- uPlot (22 kB BP): if a project page needs a real interactive plot of a data series, and a static SVG cannot show it.
- KaTeX at build time: only if equations become frequent, and only as a build-time step that ships no JS. This needs the owner's agreement because the brief says there is no LaTeX renderer.
- `withastro/action`: compare the current workflow against the documented one at the next deploy change.

**Must not be done.**
- Cloning a whole template (this includes the five named repositories).
- Copying anyone's personal content, text or photographs (explicitly reserved in repository 5).
- Copying code from repositories 2 and 4 (no licence file), or from any repository whose licence I did not read.
- Adding lightGallery (copyleft or commercial), or GSAP without reading its licence in full (I read only the npm licence field).
- Adding React to the site for any single widget.

## Licence obligations

If nothing is copied, no third-party notice is needed for this work. Studying a repository and writing an original component from a described pattern creates no obligation. If any MIT, ISC, BSD or Apache-2.0 code or package is later added, keep its copyright and licence text (and the NOTICE file for Apache-2.0) in the repository or in the shipped bundle's licence comments. Code from a repository with no licence file cannot be used at all.
