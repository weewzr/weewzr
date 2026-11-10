# Maintaining the site

This repository, `weewzr/weewzr`, does two jobs. Its `README.md` and `assets/readme/` are the GitHub profile page. The rest is an Astro site that GitHub Actions builds and serves at <https://weewzr.github.io/weewzr/>. Everything below refers to files that exist in this repository.

## Run it locally

Requirements: Node 22.23.4 or newer (`package.json` `engines`; `.nvmrc` pins major version 22 for CI).

```sh
npm ci            # install exactly what package-lock.json lists
npm run dev       # http://localhost:4321/weewzr/ (the dev server also uses the base path)
npm run check     # astro check: types and templates, run by CI before every build
npm run build     # static output in ./dist
npm run preview   # serve ./dist
python -I tools/check_links.py dist            # every internal link, asset and #fragment in the build
python -I tools/check_links.py dist --external # also request every external URL
python -I tools/check_structure.py dist        # static HTML checks: tab bar, filter chips, ids, alt text, rel noopener
```

The Python tools need Pillow (tested with Pillow 11.1.0 on Python 3.10). `tools/make_mascot.py` also needs numpy (tested with 2.2.1). Install them in a project-local virtual environment (`python -m venv .venv`, which `.gitignore` already excludes). Nothing in the site build depends on Python.

## Where things live

| What | Where |
| --- | --- |
| Personal info, links, nav, skills, projects, mascot settings | `src/data/site.ts` (single source of truth) |
| Page sections | `src/components/` (Hero, About, ResearchInterests, Skills, FeaturedProjects, ResearchWriting, Contact) |
| Layout, SEO tags, global shell | `src/layouts/BaseLayout.astro`, `src/components/SEO.astro` |
| Colours, spacing, helper classes | `src/styles/global.css` (CSS variables on `:root`) |
| Project case-study pages | `src/pages/projects/[slug].astro`, optional MDX in `src/content/projects/` |
| Case-study tabs | `caseStudyTabs` and `caseStudyPinned` in `src/data/site.ts`, `src/scripts/case-tabs.js`, tab styles in `src/pages/projects/[slug].astro` |
| Project filter and area badges | `areas` on each project in `src/data/site.ts`, `src/components/FeaturedProjects.astro` (chips and script), `src/components/ProjectCard.astro` (badges) |
| Research notes | `src/content/notes/*.md` or `*.mdx`; the index and note pages are in `src/pages/writing/` |
| Starfield background | `src/components/Starfield.astro` and `src/scripts/starfield.ts` (Three.js, loaded lazily) |
| Content schemas | `src/content.config.ts` |
| Not-found page | `src/pages/404.astro` |
| Images and static files | `public/` (copied unchanged to the site root) |
| Deployment | `.github/workflows/deploy.yml` |
| Licences and credits | `LICENSE`, `docs/CREDITS.md` |

Always build internal links and asset paths with `withBase()` or `homeAnchor()` from `src/lib/url.ts`. A bare `/path` breaks because the site lives under `/weewzr`.

## Update personal information

Edit `src/data/site.ts` and nothing else. Components read from it.

- `site`: name, title, description, headline, identity line, canonical `url`, `ogImage`.
- `social`: GitHub, LinkedIn, website and email. Set `email` to `''` to hide it. The email address is public on purpose.
- `nav`, `education`, `aboutParagraphs`, `affiliations`, `researchInterests`, `skills`.

Keep every statement checkable. List a tool under `skills` only if a public repository or the owner supports it, and do not add proficiency levels. After a change that affects the profile page, update `README.md` by hand, because it is plain Markdown and does not read `site.ts`.

If `site.title`, the identity line or the name changes, regenerate the social card (see below).

## Add a project

1. Add an entry to `projects` in `src/data/site.ts` (fields are typed by `Project`). Use a short lower-case `slug`. Set `areas` to ids from `researchInterests` (for example `['nuclear', 'scicomp']`); the filter chips and the badges on the card come from them, so no component needs an edit.
2. Add the preview image as `public/projects/<slug>.webp` at 1280x800, plus `public/projects/<slug>-640.webp` at 640 wide. The cards and case-study page use the 640 file as the small `srcset` candidate. `tools/make_project_images.py` produces both sizes from real project material in `_work/`; that folder is git-ignored, so keep the source figures there or produce the two WebP files yourself.
3. Optional: add `src/content/projects/<slug>.mdx` for a long-form case study. The file name must match the slug. Front matter fields are `title`, `summary`, `order` and `sources` (a list of `label` and `url`). Without the file, the case-study page is still built from the data entry.
4. Optional: add a `###` section for the project under Featured Projects in `README.md`, following the existing project sections.

Use only numbers and claims that appear in the project's public repository, and say which repository file they come from. Never describe private repositories.

## Case-study tabs and the project filter

Both features are progressive enhancement. The built HTML is complete without JavaScript.

**Tabs.** A case-study page groups its `##` sections into Overview, Methods, Results and Verification. `caseStudyTabs` in `src/data/site.ts` lists, for each tab, the exact heading texts it collects. `caseStudyPinned` lists headings that always stay below the tabs; "What it does not cover" is pinned so that limits are never behind a click. A heading in neither list also stays below the tabs. The page renders the tab bar from the headings of the compiled MDX, hidden by CSS. `src/scripts/case-tabs.js` is inlined after the content, moves the sections into panels before the first paint, and reveals the bar as a WAI-ARIA tablist (arrow keys, Home, End, roving tabindex; a link or address that names a heading inside another panel opens that panel). A project with fewer than two matching sections gets no tabs. Without JavaScript every section is shown in authored order and the bar is hidden. Printing or saving as PDF includes every panel: the script unhides them on `beforeprint` and restores the active one on `afterprint` (a print stylesheet cannot do this, because the Tailwind preflight `[hidden]` rule is important and layered). When the MDX headings change, update the lists in `site.ts`; `tools/check_structure.py` fails if a tab names no heading that exists on the page.

**Filter.** The Projects section shows one chip per research area that at least one project uses, plus "All projects". The chips are toggle buttons (`aria-pressed`) with a polite status line. The chip labels are the `short` field of `researchInterests`. The filter only sets `hidden` on list items, so the full list is in the HTML. The chips are hidden until the `js` class set by `BaseLayout.astro` is present.

## Publish STRATO's website later

In `src/data/site.ts`, find the `strato` entry and make two edits:

```ts
siteUrl: 'https://weewzr.github.io/STRATO/',   // was null
comingSoon: false,                              // was true
```

`futureSiteUrl` can stay as it is. In `README.md`, replace "Website coming soon" in the STRATO section with a link. The live-site button appears on the card and on the case-study page after the next deploy. Check the URL answers first with `python -I tools/check_links.py dist --external`.

## Add research notes

Create `src/content/notes/<slug>.md` (or `.mdx`). The file name without its extension becomes the page address, `/weewzr/writing/<slug>/`, and the Writing section on the home page groups notes by category. Required front matter, as defined in `src/content.config.ts`:

```yaml
---
title: "Note title"
description: "One or two sentences used in listings and search results."
category: "Nuclear Engineering"   # one of the five categories below
kind: "Research note"             # Research note | Technical article | Computational study | Publication
date: 2026-11-10
draft: false                      # true hides the note from the build
sourceUrl: "https://..."          # optional but expected: the public source the note rests on
sourceLabel: "Short label for the source"
tags: ["Tag one", "Tag two"]
---
```

Allowed categories: Nuclear Engineering, Hydrogen Technologies, Chemical Process Engineering, Scientific Computing, Sustainability. To add a category, change both `noteCategories` in `src/data/site.ts` and the `z.enum` in `src/content.config.ts`, which must stay in step.

Write in plain, precise prose. Quote a number only if it is in the cited source, and say what the work does not cover.

## Swap or disable the Perry artwork

Perry the Platypus and the Phineas and Ferb artwork belong to Disney (see `LICENSE` and `docs/CREDITS.md`).

- Disable: set `mascot.enabled` to `false` in `src/data/site.ts`. Every placement then renders `public/mascot/silhouette.svg`, and the footer credit line is hidden because it is no longer needed.
- Swap: replace the files in `public/mascot/` and update `mascot.assets` (paths, `width`, `height`) in `site.ts`. Each placement needs a `.webp` and a `.png` fallback. Update `mascot.credit` if the artwork changes.
- Remove completely: set `enabled` to `false`, delete `public/mascot/*` except `silhouette.svg`, delete `assets/readme/perry.png`, and remove the Perry line and image from `README.md`. Honour any takedown request promptly.

### Rebuild the cut-outs

`tools/make_mascot.py` removes the white background from the owner's original JPG files and writes the WebP and PNG sets into `public/mascot/`. The originals are a few files in a folder on the owner's computer (the `SRC` constant at the top of the script) and are not in this repository, so the script cannot run elsewhere without them. Edit the `JOBS` list to change which source file, output name or crop is used.

## Generated images

| Output | Script | Notes |
| --- | --- | --- |
| `public/og-image.png` (1200x630) | `python -I tools/make_og.py` | Pillow only; uses Segoe UI from `C:\Windows\Fonts`, falling back to Arial. Text constants sit at the top of the file. No third-party artwork. |
| `public/projects/*.webp` | `python -I tools/make_project_images.py` | Needs the source figures in `_work/` and Microsoft Edge for the NUS-H2 SVG. |
| `public/mascot/*` | `python tools/make_mascot.py` | See above. |
| `public/favicon.svg` | edited by hand | A 32 by 32 SVG; check it at 16 px after any change. |

## How deployment works

`.github/workflows/deploy.yml` runs on every push to `main` and can be started manually from the Actions tab (Deploy to GitHub Pages, Run workflow).

1. The `build` job checks out the code, installs the newest Node 22.x with the npm cache, runs `npm ci`, `npm run check` and `npm run build`, then runs `tools/check_links.py` and `tools/check_structure.py` on `./dist` and uploads it as the Pages artifact. If `astro check`, the build or either checker fails, nothing is deployed and the live site stays as it was.
2. The `deploy` job publishes that artifact to the `github-pages` environment with `actions/deploy-pages`.
3. A `pages` concurrency group stops two deployments from overlapping. A running deployment is never cancelled.

One-time repository setting: Settings, Pages, Build and deployment, Source = GitHub Actions. Without it the deploy job fails because Pages is not enabled for the repository.

`site: 'https://weewzr.github.io'` and `base: '/weewzr'` in `astro.config.mjs` set the canonical URLs, the sitemap and every internal link. `trailingSlash` is `'always'`. `public/robots.txt` points to `sitemap-index.xml`; note that crawlers only read `robots.txt` at the host root (`https://weewzr.github.io/robots.txt`), so while the site lives under `/weewzr` the file is a reference copy. Submit `https://weewzr.github.io/weewzr/sitemap-index.xml` in Google Search Console and Bing Webmaster Tools if you want the site indexed promptly.

## Move to a root URL later

The profile README must stay in the `weewzr/weewzr` repository, so a root URL needs a second repository named `weewzr.github.io`.

1. Create `weewzr/weewzr.github.io` and copy the site source into it (everything except `README.md` and `assets/readme/`, which stay here as the profile page).
2. In `astro.config.mjs` set `base: '/'` and leave `site` as it is.
3. Search for the old path and update it: `site.url` and `social.website` in `src/data/site.ts`, the `Sitemap:` line in `public/robots.txt`, `BASE` in `tools/check_links.py`, `URL_TEXT` in `tools/make_og.py` (then rerun it), the links in `README.md`, and the credits URL in `src/components/Footer.astro`.
4. Enable Pages with Source = GitHub Actions in the new repository, push, and confirm the deploy.
5. In this repository, either remove `.github/workflows/deploy.yml` and disable Pages, or leave a short note on the profile page pointing to the new address. The project sites at `weewzr.github.io/KASCO/`, `/NUSH2/` and `/STRATO/` are separate repositories and are not affected.

`withBase()` and `homeAnchor()` read the base path from the Astro config, so components need no change.

## Before pushing

Run `npm run check`, `npm run build`, `python -I tools/check_links.py dist` and `python -I tools/check_structure.py dist`. Search the changes for tokens, private repository names and any personal detail that is not already in `src/data/site.ts`.

## Astryx evaluation

Astryx (`@astryxdesign/core` 0.7.11, MIT, Beta) was evaluated on 2026-11-10 on the branch `feat/astryx-portfolio`. The outcome is that no Astryx component ships. This section records the evidence and what was built in its place, so the decision can be revisited.

### Original architecture

A static Astro 7.4.8 site with base `/weewzr` and `trailingSlash: 'always'`, MDX content collections, Tailwind 4 (used for preflight and font tokens), TypeScript, and a lazily loaded Three.js starfield. There is no UI framework and no client-side state beyond DOM attributes and CSS classes. All text comes from `src/data/site.ts` and the content collections. The client scripts are the navigation disclosure and scroll spy, the Perry console and bubbles, the e-mail assembly, scroll reveal and the starfield. Design tokens live in `:root` in `src/styles/global.css`.

### Proof of concept

Commit `4b63aff` adds one Astryx `TabList` island (React 19 through `@astrojs/react`, `client:visible`) on an unlinked page, with the Celestial palette mapped onto the neutral theme. It was built with the production Astro build and compared with the KASCO case-study page, which has the same layout and no island. Method: cold page loads with puppeteer-core and Microsoft Edge at 390 px width, bytes taken from the files in `dist` compressed with gzip level 9, five loads per CPU setting for the interactive time, and Lighthouse 13.6.0 mobile with two runs per page. Both pages load the lazy starfield chunk, which is why the JavaScript baseline is not zero.

| Measure | Without island | With one TabList island |
| --- | --- | --- |
| JavaScript, gzip | 133,427 B | 270,874 B |
| CSS, gzip | 13,277 B | 54,352 B |
| Tabs interactive, median of 5 (normal CPU, 4x slowdown) | not applicable | 383 ms, 3,433 ms |
| Lighthouse mobile cumulative layout shift, 2 runs | 0.0003, 0.0003 | 0.171, 0.164 |

Integration findings:

- `astryx.css` is one file of about 269 kB raw (39.9 kB gzip) that every island pulls in, whichever component it uses. The whole site's CSS is 91 kB raw.
- Astryx's `Theme` wrapper uses `display: contents`. Astro's `client:visible` observes the island's first child with an `IntersectionObserver`, which never fires for an element without a box, so the island stayed unhydrated until a plain `div` was placed around it.
- The Astryx layer order (`@layer reset, theme, base, astryx-base, astryx-theme, components, utilities;`) has to come before the Tailwind import in `global.css`. The Astryx docs warn that a later `@layer` line silently inverts the cascade.
- Server rendering works: the tab buttons are in the static HTML with the correct ARIA attributes. Before hydration they do nothing, so extra work would be needed to keep the page honest without JavaScript.

Decision: the tab strip and the chip filter cost under 2 kB of script per page (gzip) with the existing stack. About 180 kB gzip of extra transfer and a 3.4 s wait on a throttled phone, to switch four panels, is not justified. The island was removed in the next commit, and `git show 4b63aff` reproduces it.

### Theming decisions

The mapping tested in the proof of concept is kept here for a future attempt. Astryx's neutral theme sets its tokens inside `@layer astryx-theme` under `@scope ([data-astryx-theme="neutral"])`. Unlayered rules on `[data-astryx-theme]` beat them without `!important`. Variables set: `--font-family-body`, `--font-family-heading` and `--font-family-code` (to the site's Inter, Space Grotesk and JetBrains Mono), `--color-background-body` (transparent, so the starfield shows), `--color-background-surface`, `--color-background-card`, `--color-background-muted`, `--color-background-popover`, `--color-text-primary`, `--color-text-secondary`, `--color-text-accent`, `--color-border`, `--color-border-emphasized`, `--color-accent`, `--color-accent-muted`, `--color-on-accent` and `--color-icon-accent`. A screenshot of the result showed Inter text, the dark glass surface and a lavender selected-tab indicator, so the identity can be carried across. The file was `src/styles/astryx-celestial.css` in `4b63aff`.

### What was built instead

- Case-study tabs (Overview, Methods, Results, Verification) with a pinned limits section. See "Case-study tabs and the project filter" above.
- A project filter and area badges, driven by `areas` in `src/data/site.ts`.
- `tools/check_structure.py` and a CI step that runs it and `tools/check_links.py` after the build.
- A preload of the Latin font subsets was tried and reverted. See the limitations below.

### Astryx components adopted

None.

### Components deliberately not migrated

| Component | Astryx candidate | Reason it stays as it is |
| --- | --- | --- |
| Navigation, mobile menu | TopNav, MobileNav | The existing disclosure passes the keyboard checks (Enter opens, Tab enters the panel, Escape closes and returns focus) and works without JavaScript. A React island would lose that. |
| Perry hero, console, bubbles | Tooltip, Collapsible | The artwork and its behaviour must stay unchanged. Bubbles already show on focus and close on Escape. |
| Starfield | none | Visual identity. In local Lighthouse runs, blocking its chunk did not lower total blocking time (median 2,705 ms blocked against 2,031 ms with it), so it is not the cause of the main-thread time. |
| Case-study prose and tables | Markdown, Table | Static Markdown rendered at build time. A React renderer adds cost and rewrite risk for no gain. |
| Buttons, chips, glass cards, breadcrumbs | Button, Badge, Card, Breadcrumbs | Hand-written CSS with a consistent focus ring. Astryx would need a theme to look the same and ships its CSS to every island. |
| Base layout, SEO | none | Astro layouts and static metadata, with no UI to improve. |
| Tabs, filter | TabList, SegmentedControl | Measured above, then rebuilt with HTML and under 2 kB of script per page (gzip). |

### Dependencies

None added. `package.json` and `package-lock.json` are identical to `main`. The proof of concept added `@astrojs/react` 7.1.5, `react` and `react-dom` 19.3.1, `@astryxdesign/core` 0.7.11, `@astryxdesign/theme-neutral` 0.7.11 and `@stylexjs/stylex` 0.19.1 as exact pins, and the next commit removed them.

### Before and after

Baseline is `main` at `beec215`. After is the head of this branch. Sizes come from `npm run build` output compressed with gzip level 9.

| Measure | Before | After |
| --- | --- | --- |
| JavaScript, 2 files, raw / gzip | 540,251 / 132,835 B | 540,251 / 132,835 B |
| CSS, 5 files, raw / gzip | 91,346 / 22,514 B | 93,423 / 22,895 B |
| HTML, 9 pages, raw / gzip | 339,604 / 75,388 B | 362,665 / 82,690 B |
| Case-study layout shift, 4 loads each, both widths | 0.0002 to 0.0009 (STRATO at 1440 px: 0.179 to 0.19) | unchanged |

The HTML growth comes mostly from the tab script (4.8 kB raw, 1.7 kB gzip) inlined into each of the three case-study pages, plus the filter chips and the area badges on the home page. The script is inline so the tabs form before the first paint. Minifying it would save roughly 2 kB raw per page.

Lighthouse 13.6.0 (Edge, headless, local static server, performance category), baseline and branch loaded in rotating order in the same session. Values are the individual runs, with the median in brackets.

| Page and device | Metric | Baseline `main` | This branch |
| --- | --- | --- | --- |
| Home, desktop (3 runs) | Performance score | 100, 99, 80 (99) | 100, 97, 100 (100) |
| | Total blocking time, ms | 54, 103, 422 (103) | 38, 140, 32 (38) |
| | First contentful paint, ms | 418, 428, 446 (428) | 408, 434, 427 (427) |
| | Largest contentful paint, ms | 592, 602, 611 (602) | 593, 595, 605 (595) |
| Case study (KASCO), mobile (2 runs) | Performance score | 81, 92 | 84, 74 |
| | Total blocking time, ms | 797, 334 | 605, 1,370 |
| | Largest contentful paint, ms | 1,211, 1,214 | 1,368, 1,380 |

The runs overlap, so the data show no regression and no gain in blocking time, and with two to three runs per cell they cannot show a small one. The KASCO mobile largest contentful paint is about 160 ms later on the branch in both runs; the page gained the tab bar markup and 2 kB of gzip HTML, and the cause was not isolated. Accessibility, best-practices and SEO scores were 100 in every run of the earlier 24-run comparison (baseline against a build that also had the font preload), for the home page, the KASCO case study and the STRATO case study, on both device types.

### Accessibility

- Tabs follow the WAI-ARIA tabs pattern: `role="tablist"`, `role="tab"` and `role="tabpanel"`, `aria-selected`, `aria-controls`, `aria-labelledby`, roving `tabindex`, automatic activation, Left and Right with wrap-around, Home and End. The panel is a tab stop (`tabindex="0"`) because its first element is a heading. The global focus ring applies, and each tab is at least 44 px high.
- Without JavaScript the tab bar is hidden and every section is visible in authored order. The limits section is pinned below the tabs in both modes. A link or address that names a heading in another panel opens that panel.
- The filter chips are buttons with `aria-pressed` and a polite status line that reports how many projects are shown, with the same 44 px minimum height. After filtering, the left and right image alternation is recomputed.
- Colour contrast is still reported as incomplete by axe for text over gradients and the canvas, as in the baseline. The new controls use light text on dark glass, and the selected state is white on a purple tint; this was judged by eye against the palette and not computed.

Measured with axe-core 4.14.0 (tags `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa` and `best-practice`), puppeteer-core and Microsoft Edge: all 9 pages at 1440x900 and 390x844, with and without `prefers-reduced-motion` (36 runs), gave 0 violations and no horizontal overflow, the same as the baseline. A separate run found 0 violations on the home page with the Nuclear filter active at 1440 px, and on each case study in each of its four tab states (12 runs). The keyboard walk of the home page visits 61 tab stops against 55 in the baseline, the six extra being the filter chips. The mobile menu (Enter opens, Tab enters the panel, Escape closes and returns focus to the toggle), the Perry console and the Perry bubble (shows on keyboard focus, hides on Escape) behave as they did before.

### Tests run

All builds went to a directory outside the repository through `ASTRO_OUT_DIR` and `ASTRO_CACHE_DIR`.

| Command | Result |
| --- | --- |
| `npx astro check` | 0 errors, 0 warnings, 3 hints (the same three as on `main`: two deprecated Zod `.url()` calls and one unused constant) |
| `npm run build` | exit 0, 9 pages |
| `python -I tools/check_links.py <dist>` | all internal links, assets and fragments resolve (33 external URLs not requested) |
| `python -I tools/check_structure.py <dist>` | 9 pages, 3 with tabs, 0 problems; a copy with four injected faults reported 4 |
| Content comparison against a snapshot of the `main` build | no word removed on any page; the only words added are the four tab labels on each case study and the filter labels on the home page; 20 public files byte-identical (SHA-256); element ids only added |
| Tab behaviour script (puppeteer-core, Edge) | 137 of 138 checks: no-JavaScript view, ARIA wiring, mouse, arrow keys, Home, End, wrap-around, Tab into the panel, deep links to a heading and to a panel, layout shift, overflow, console errors, at 1440 and 390 px. The one failing check is the layout shift limit of 0.02 on the STRATO page at 1440 px (0.19), which is also 0.18 to 0.19 on `main` (see the limitations) |
| Filter behaviour script | 42 of 42 checks: chips built from data, filtering, status text, image alternation, Enter and Space, focus ring, no-JavaScript view, axe in the filtered state |
| axe-core, keyboard and bubble scripts | see Accessibility |
| Lighthouse 13.6.0, Edge, 2 runs per page and form factor, baseline and branch interleaved | see Before and after |

### Known limitations and maintenance

- The Astryx version tested is 0.7.11 (Beta). Revisit it if the site gains forms, dialogs or data tables, and check then whether its CSS has been split per component. Rebuild the proof of concept from `4b63aff` and compare it with the table above.
- The tab and filter behaviour checks are puppeteer scripts that live outside the repository, because they need a browser and `puppeteer-core`. In the repository, `tools/check_structure.py` covers the static HTML only.
- The tabs are built in the browser by an inline script, not by a Markdown plugin. Astro 7 runs Markdown through Satteri by default, and `markdown.rehypePlugins` needs the unified processor installed for the whole site. If that processor is adopted later, a rehype plugin could build the panels at build time and `case-tabs.js` would only handle behaviour.
- The area tags in `src/data/site.ts` are editorial. They follow the wording of the research interest summaries and project descriptions. The `safety` area has no project yet, so it has no chip.
- The filter keeps no state in the address bar. Tab changes do update the hash (`#tab-results`).
- The STRATO case study at 1440 px has one layout shift of about 0.18 to 0.21, present on `main` before this work. It happens about 290 ms after navigation, when the web fonts replace the fallback faces and a line of the header text wraps differently. Preloading the Latin subsets of Space Grotesk, Inter and JetBrains Mono (all three were needed) brought it to 0 on every case study at both widths, but Lighthouse blocking time rose on all six page and device combinations in a 24-run comparison (for example home on mobile 1,896 ms to 3,387 ms) and stayed near the baseline when the preload was left out of a second, rotated comparison. The preload was reverted (see the commit history). A fallback `@font-face` with matched `size-adjust` metrics is the next thing to try.
- Lighthouse scores on this shared machine vary by 10 points or more between runs of the same page, so only same-session A/B runs are compared and small differences should not be read as real.
