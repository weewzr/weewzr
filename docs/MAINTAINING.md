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

1. Add an entry to `projects` in `src/data/site.ts` (fields are typed by `Project`). Use a short lower-case `slug`.
2. Add the preview image as `public/projects/<slug>.webp` at 1280x800, plus `public/projects/<slug>-640.webp` at 640 wide. The cards and case-study page use the 640 file as the small `srcset` candidate. `tools/make_project_images.py` produces both sizes from real project material in `_work/`; that folder is git-ignored, so keep the source figures there or produce the two WebP files yourself.
3. Optional: add `src/content/projects/<slug>.mdx` for a long-form case study. The file name must match the slug. Front matter fields are `title`, `summary`, `order` and `sources` (a list of `label` and `url`). Without the file, the case-study page is still built from the data entry.
4. Optional: add a row to the project table in `README.md`.

Use only numbers and claims that appear in the project's public repository, and say which repository file they come from. Never describe private repositories.

## Publish STRATO's website later

In `src/data/site.ts`, find the `strato` entry and make two edits:

```ts
siteUrl: 'https://weewzr.github.io/STRATO/',   // was null
comingSoon: false,                              // was true
```

`futureSiteUrl` can stay as it is. In `README.md`, replace "Website coming soon" in the STRATO row with a link. The live-site button appears on the card and on the case-study page after the next deploy. Check the URL answers first with `python -I tools/check_links.py dist --external`.

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

1. The `build` job checks out the code, installs the newest Node 22.x with the npm cache, runs `npm ci`, `npm run check` and `npm run build`, then uploads `./dist` as the Pages artifact. If `astro check` or the build fails, nothing is deployed and the live site stays as it was.
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

Run `npm run check`, `npm run build` and `python -I tools/check_links.py dist`. Search the changes for tokens, private repository names and any personal detail that is not already in `src/data/site.ts`.
