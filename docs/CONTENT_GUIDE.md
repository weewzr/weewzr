# Adding and updating content

Everything on the site comes from two places: `src/data/site.ts` (personal details, the section list, the project cards) and the Markdown files under `src/content/`. A new page is a new file. No component needs an edit for the cases below.

Read [MAINTAINING.md](MAINTAINING.md) first for how to run, check and deploy the site.

## What lives where

| Section | URL | Content files | Schema in `src/content.config.ts` |
| --- | --- | --- | --- |
| Projects | `projects/<slug>/` | entry in `projects` in `src/data/site.ts`, plus `src/content/projects/<slug>.mdx` | `projects` |
| Research and academic work | `research/<slug>/` | `src/content/research/<slug>.mdx` | `caseStudy` |
| Community engagement | `community/<slug>/` | `src/content/community/<slug>.mdx` | `caseStudy` |
| Innovation and competitions | `innovation/<slug>/` | `src/content/innovation/<slug>.mdx` | `caseStudy` |
| Technical notes | `writing/<slug>/` | `src/content/notes/<slug>.md` | `notes` |
| About and contact | `about/` | `src/data/site.ts` | none |

The file name is the URL slug: lower case, words joined by hyphens, no spaces. The home page, the section pages, the navigation and the sitemap pick up a new file on the next build.

## Rules that apply to every page

1. Every statement must be checkable against a source you can name. Give numbers with their units and say where they come from.
2. If something is not known yet, leave the field out or say that it will be added. A phase with no confirmed details is `status: upcoming` with a title and nothing else.
3. Name nobody but yourself unless that person has agreed. No student numbers and no university email addresses, anywhere, including inside PDFs and images.
4. Photographs of people are published only after permission is confirmed. Until then the gallery stays `published: false` and no image file is added to the repository.
5. Coursework is described as coursework. It is not called a publication, and a competition result is stated exactly as it was awarded.
6. There is no CV on the site. `cv` in `src/data/site.ts` is switched off; see "Publishing a CV later" at the end.

## Add a research, community or innovation page

Create `src/content/<section>/<slug>.mdx`:

```mdx
---
title: "Full title of the work"
shortTitle: "Short name for cards and breadcrumbs"
summary: "One or two sentences. Also used as the page description for search engines."
kind: "Team case study, course or organiser"
role: "Your role"                 # optional
period: "Completed November 2026"  # display text
date: 2026-11-12                   # sort key: completion date, or start date for work in progress
status: "Completed"
order: 1                           # position within the section, lowest first
tags: ["Tag one", "Tag two"]
facts:                             # key facts strip under the title
  - label: "Reference facility"
    value: "100 MW IT load"
related:                           # links to other pages of this site, written without the base path
  - label: "A related page"
    href: "projects/amcrax/"
sources:
  - label: "Where a reader can check this"
    url: "https://example.org/page"   # optional: leave out for a document shown on the page itself
---

import Figure from '../../components/case/Figure.astro';
import Callout from '../../components/case/Callout.astro';

## Overview

Body text. Each `##` heading becomes an entry in the "On this page" list.

<Figure src="research/<slug>/chart.webp" alt="What the chart shows" caption="Figure 1. Caption." width={1600} height={900} zoom />

<Callout title="Limit" tone="limit">What this work does not establish.</Callout>
```

Notes:

- Do not write a `#` heading. The layout prints the title.
- `Figure` takes a path under `public/` without the base, the real pixel `width` and `height`, and an `alt` text that says what the figure shows. `zoom` lets the reader enlarge it.
- `Callout` tones are `note`, `limit` and `source`.
- Write tables as plain Markdown tables. The page makes them scroll on small screens.
- There is no LaTeX renderer. Write equations with `<sub>` and `<sup>` and define every symbol with its unit.
- Set `draft: true` to keep a page out of the build while you write it.

### Timeline (phases and milestones)

```yaml
timeline:
  - id: phase-1
    title: "Phase 1: Wish Collection"
    period: "November 2026"
    status: done            # done | active | upcoming
    summary: "One sentence."
    items:
      - date: "10 November 2026"
        label: "Venue or event"
        detail: "Optional detail"
  - id: phase-2
    title: "Phase 2"
    status: upcoming        # nothing else until it is confirmed
```

The page shows the phases as an interactive timeline and states progress in words, for example "1 of 4 phases complete". To report progress, change `status`, add `period`, `summary` and `items`, and update the `status` line and the `facts` at the top of the same file.

### Photo galleries

```yaml
galleries:
  - id: lcss-yishun
    title: "LCSS Yishun"
    date: "10 November 2026"
    published: false        # the card shows a neutral pending state and no image is referenced
    images: []
```

To publish a gallery, in this order:

1. Confirm permission for every photograph. If children or other people who have not agreed can be identified, do not publish it.
2. Export WebP files no wider than 1600 px with all metadata removed (phone photographs carry GPS coordinates). Put them in `public/<section>/<slug>/<gallery-id>/`.
3. List them under `images`, each with `src`, `alt`, `width`, `height` and an optional `caption`. Alt text describes the scene and names nobody.
4. Set `published: true`.

### Documents (reports, slides, posters, essays)

The viewer shows pre-rendered page images and links to the PDF, so it works on phones and without a PDF plug-in.

1. Make the public edition of the PDF first: remove other people's names, every student number and every email address. Check the cover page, the title slide and any appendix that lists who did what.
2. Run `python tools/make_document_pages.py <file.pdf> <slug> <document-id>`. It refuses a PDF that still contains a student number or a university email address, writes the PDF and its page images to `public/documents/<slug>/`, and prints the front matter to paste.
3. Paste the printed block under `documents`, give it a `title`, the right `kind` (`report`, `slides`, `poster`, `essay` or `summary`), an optional `description`, and a `note` that says what was removed from the public edition.

A document with `published: false` shows a neutral "held for review" card and needs no files.

## Add a project

1. Add an entry to `projects` in `src/data/site.ts` (typed by `Project`). `stage` is `live`, `released` or `planned`. A planned project has `repoUrl: null`, `siteUrl: null` and `image: null`, and its card and page then show no repository button, no site button and no screenshot.
2. For a project with something to show, add `public/projects/<slug>.webp` (1280x800) and `public/projects/<slug>-640.webp`.
3. Add `src/content/projects/<slug>.mdx`. Front matter: `title`, `summary`, `order`, `statusNote`, `roadmap` (same shape as `timeline` above), `figures` (images shown under "Screenshots and diagrams") and `sources` (each with a `label` and a `url` that points at a file or section of the public repository).
4. Use these `##` headings so the page can group them into tabs: `The problem`, `Objectives`, `Architecture`, `Approach`, `Algorithms and models`, `Verification`, `Results`, `What it does not cover`, `Technology`. The tab groups are set by `caseStudyTabs` in `src/data/site.ts`. "What it does not cover" always stays visible.

When a planned project gets a repository, set `repoUrl`, change `stage` and `status`, and move the matching roadmap milestone to `done` with its date.

## Add a technical note

Create `src/content/notes/<slug>.md` with `title`, `description`, `category`, `kind`, `date`, and `sourceUrl` with `sourceLabel`. The Research page and `writing/` list it.

## Add a section

Add an entry to `sections` in `src/data/site.ts`, add a collection to `src/content.config.ts` that uses the `caseStudy` schema, and copy `src/pages/research/` (both files) to a folder with the new name, changing the collection name inside. The navigation, home page and footer read `sections`.

## Publishing a CV later

The CV is deliberately absent. When it is ready and approved: put the PDF under `public/`, then in `src/data/site.ts` set `cv.cvPath` to its path and `cv.enabled` to `true`. The About page then shows a download button. Until then nothing about a CV is rendered, and `tools/check_structure.py` fails the build if a CV link appears.

## Before opening a pull request

```sh
npm run check
npm run build
python -I tools/check_links.py dist
python -I tools/check_structure.py dist
```

All four must pass. Then read the new page once at phone width and once at desktop width.
