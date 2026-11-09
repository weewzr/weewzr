# Credits and licences

## Licence of this repository

The source code, configuration and written content of this repository are released under the MIT licence, copyright 2026 Wee Zhern Ray. The full text is in [`LICENSE`](../LICENSE).

The licence has one explicit exclusion.

### Perry the Platypus and Phineas and Ferb artwork

Perry the Platypus and Phineas and Ferb are the property of Disney. The Perry images in `public/mascot/` (every file except the original `silhouette.svg` placeholder) and the file `assets/readme/perry.png` were supplied by the site owner as an unofficial fan tribute. They are not covered by the MIT licence, no licence to them is granted here, and the site and profile have no affiliation with or endorsement from Disney. The artwork can be removed on request from the rights holder. The site shows this credit in its footer, and one switch in `src/data/site.ts` (`mascot.enabled`) replaces every placement with a neutral silhouette. See [`MAINTAINING.md`](./MAINTAINING.md).

## Design inspiration

The layout and mood were shaped by looking at the public portfolio templates below, all released under the MIT licence. They were used for ideas only (a starfield backdrop, glass panels, spacing, a central data file, project cards, a writing section). No code, markup or assets were copied from them; every component here was written for this site.

| Template | Author | Idea taken |
| --- | --- | --- |
| [astro-darkness](https://github.com/kpab/astro-darkness) | kpab | Starfield backdrop and glass panels |
| [dark-minimal](https://github.com/Gothsec/dark-minimal) | Gothsec | Restraint and spacing on dark backgrounds |
| [starfolio](https://github.com/webrating/starfolio) | webrating | One central data file feeding the whole site |
| [devportfolio](https://github.com/RyanFitzgerald/devportfolio) | Ryan Fitzgerald | Project card structure |
| [astrofy](https://github.com/manuelernestog/astrofy) | Manuel Ernesto Garcia | Writing and notes section |

## GitHub profile README

The profile page (`README.md` with `assets/readme/`) follows the structure GitHub documents for profile READMEs, in which a repository named after the account shows its README on the profile. The banner and divider graphics are original SVG files made for this repository. The contribution summary image is served by [GitHub Readme Streak Stats](https://github.com/DenverCoder1/github-readme-streak-stats) by Jonah Lawrence (MIT), which receives only the public account name `weewzr` when the image loads.

## Dependencies

Direct production dependencies, with the versions installed when this page was written (read from each package's `package.json` in `node_modules`):

| Package | Version | Licence | Role |
| --- | --- | --- | --- |
| astro | 7.4.8 | MIT | Static site framework |
| @astrojs/mdx | 8.1.3 | MIT | MDX support for case studies and notes |
| @astrojs/sitemap | 3.7.4 | MIT | Generates `sitemap-index.xml` |
| tailwindcss | 4.3.5 | MIT | Utility CSS and design tokens |
| @tailwindcss/vite | 4.3.5 | MIT | Tailwind plugin for the build |
| three | 0.187.0 | MIT | Three.js, for the starfield canvas |
| @fontsource-variable/space-grotesk | 5.3.0 | OFL-1.1 | Space Grotesk, headings |
| @fontsource-variable/inter | 5.3.0 | OFL-1.1 | Inter, body text |
| @fontsource-variable/jetbrains-mono | 5.3.0 | OFL-1.1 | JetBrains Mono, technical text |

Development-only tools: `@astrojs/check` (MIT), `@types/three` (MIT) and `typescript` (Apache-2.0).

The fonts are self-hosted: the built site contains their `woff2` files. The copyright lines and the SIL Open Font License 1.1 text that go with them are reproduced in [`THIRD_PARTY_NOTICES.md`](../THIRD_PARTY_NOTICES.md).

### Whole production tree

`npm ls --omit=dev --all` lists 213 installed packages besides this project. By declared licence they are: 177 MIT, 9 ISC, 8 BSD-2-Clause, 4 Apache-2.0, 3 BlueOak-1.0.0, 3 BSD-3-Clause, 3 OFL-1.1 (the fonts above), 2 MPL-2.0, 2 CC0-1.0, 1 0BSD and 1 Apache-2.0 AND LGPL-3.0-or-later. The two MPL-2.0 packages are the platform builds of `lightningcss`, which Tailwind uses to process CSS. The LGPL entry is `@img/sharp-win32-x64`, the Windows binary package of `sharp`, an optional image library that bundles libvips. The lockfile lists the matching libvips packages (LGPL-3.0-or-later) for other platforms. These are build-time tools and none of them is part of the published files. No package in the tree is licensed under the GPL or AGPL.

### Audit

`npm audit --omit=dev` was run on 2026-11-10 against the installed lockfile and reported `found 0 vulnerabilities`. The result describes that date and the registry data at that time. Rerun it before relying on it.

## Project preview images

The images in `public/projects/` are real project material and carry no invented content: a screenshot of the live KASCO app, the process flow figure from the NUS-H2 repository and the TRISO cross-section figure from the STRATO documentation. Each of those repositories is public and MIT-licensed.

## Affiliations

The units and people named on the site (listed in `affiliations` in `src/data/site.ts`) are named with the owner's permission, and the site does not speak on their behalf.
