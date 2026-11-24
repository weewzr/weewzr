# Design system

This document has two parts.

- **Part A, shared core** (sections A1 to A13), is the rule set for all five of the owner's sites: this portfolio, STRATO, NUS-H2, AmCraX and KASCO, and for their READMEs. It fixes the logic (scales, breakpoints, focus, motion, accessibility, figures, tables, mathematics, code, writing) and leaves each site its own colours, typefaces and density.
- **Part B, portfolio identity** (sections B1 to B9), is the look of this site, <https://weewzr.github.io/weewzr/>.

Each repository carries a copy of [`src/styles/tokens.core.css`](../src/styles/tokens.core.css), the tokens Part A names, and a short identity sheet of its own. There is no shared component library and no shared npm package: the stacks differ (Astro, React with Vite, vanilla JavaScript with WebAssembly), and the Astryx evaluation recorded in `docs/MAINTAINING.md` measured what a shared component runtime costs.

Core version: **1.0.0**, 2026-11-24. The same version string heads every copy of `tokens.core.css`. A change to Part A or to the token file raises the version: patch for wording, minor for a new token or rule, major for a changed value.

---

# Part A. Shared core

## A1. Principles

1. Content first. A reader finds what a project computes, how it was checked and where it stops within one screen.
2. One accent per site. It marks links, focus-adjacent states and the single primary action in a view. Status colours are reserved for status.
3. Borders before shadows. Surfaces are separated by a 1 px hairline. Nothing glows.
4. Left aligned. Headings, text and cards share one left edge. Centred text is for figure captions only.
5. Every number carries its unit, its case and its provenance (A8).
6. Motion explains or confirms. It never decorates (A6).

## A2. Type-scale logic

Faces are chosen per site (Part B and each site's identity sheet). The logic is shared:

- One modular scale with a ratio between 1.2 and 1.25, at most six text steps above the caption size, written as rem on a 16 px root. Every `font-size` in a stylesheet traces to a token.
- At most three families per site: one for headings, one for reading text, one monospace for data and code.
- Body text 16 to 18 px with a line height of 1.5 to 1.7. Prose measure at most 68ch (`--measure`).
- Minimum text size 13 px (`--text-min`), minimum chart tick label 12 px (`--tick-min`).
- Numbers in tables and live readouts use `font-variant-numeric: tabular-nums` or a monospace face.
- Headings are sentence case. Uppercase letter-spaced labels are not used as eyebrows.
- Bold marks a term on first definition or a key number, not emphasis in running text.
- Web fonts are self-hosted, carry an open licence that allows redistribution (SIL OFL 1.1 or similar), and are loaded with a metric-matched fallback (`size-adjust`, `ascent-override`, `descent-override`) so that the swap does not move the layout. A site may use system fonts only (NUS-H2 does, by rule).

## A3. Spacing and layout

- Spacing scale: 4, 8, 12, 16, 24, 32, 48, 64, 96 px, tokens `--space-1` to `--space-9`. No value outside the scale.
- Side gutter 16 px on phones, 24 px from 640 px. A page never scrolls sideways at 320 px and above.
- Section rhythm: 64 px between sections on phones, 96 px from 1024 px. A heading sits closer to its content than to the previous section.
- Radii: `--radius-sm` 4 px (tags, inline code), `--radius` 8 px (buttons, inputs, cards, images), `--radius-lg` 12 px (dialogs, large media). Full rounding only for status dots and avatars.

## A4. Breakpoints

| Name | Min width | Typical change |
| --- | --- | --- |
| sm | 640 px | side gutter 24 px, two-column grids |
| md | 768 px | tables shown in full where they fit |
| lg | 1024 px | margin column on long pages, desktop navigation |
| xl | 1280 px | wide figures |

CSS custom properties cannot be used inside media queries, so these are written as numbers with a comment. A site may keep a documented exception (STRATO keeps its binding 768 and 1200 px).

## A5. Accessibility

Target: WCAG 2.2 level AA.

- Text contrast at least 4.5:1, large text and UI boundaries (control edges, focus ring, chart marks that carry meaning) at least 3:1, in every colour mode a site offers. Each site records the computed ratio of every token pair it introduces.
- Focus: `outline: var(--focus-width) solid <focus colour>; outline-offset: var(--focus-offset)` on `:focus-visible`, on every interactive element. Never removed without a visible replacement.
- Touch targets at least 44 by 44 px (`--touch-min`) on touch layouts.
- A skip link to `main`, one `h1` per page, landmarks (`header`, `nav` with a label, `main`, `footer`), no skipped heading levels inside a section.
- Status is never shown by colour alone: a word, a shape or a pattern goes with it.
- Every image has `alt`; decorative images have `alt=""`. Charts follow A8.
- `prefers-reduced-motion: reduce` sets every transition and animation to 0 ms and stops autoplay.
- Controls work with the keyboard only. Disclosure menus open with Enter or Space and close with Escape, returning focus to their button.
- No single-key shortcuts unless they can be switched off (WCAG 2.1.4). A command palette (Ctrl or Cmd + K, WAI-ARIA combobox) is allowed only on a site with ten or more destinations and is never the only way to reach a page. Of the five sites, only AmCraX has one.

## A6. Motion

- Tokens: `--dur-fast` 120 ms (hover, press), `--dur-base` 150 ms (colour and opacity changes), `--dur-explain` 250 ms (an explanatory figure step).
- Interface motion changes colour and opacity only. Transforms are allowed in explanatory figures, and an animated figure has a visible pause control.
- Nothing moves on scroll. No typing effects, looping decoration or parallax.

## A7. Colour roles

Colours are named by role, not by hue: `--bg`, `--bg-subtle`, `--surface`, `--border`, `--border-strong`, `--text`, `--text-muted`, `--accent`, `--accent-hover`, `--accent-bg`, `--on-accent`, `--focus`. Each site sets these in its own token file for each colour mode it offers. Gradients are not used for page backgrounds, text or to encode a data value; they may appear only inside a figure that a project produced.

## A8. Charts and scientific figures

1. **Title and basis.** The title states the quantity. The subtitle states basis, case and unit, for example "Levelised cost of hydrogen, unified reference scenario, USD/kg H2".
2. **Axes.** Every axis has a title with its unit in parentheses or after a comma, in SI or the domain unit (degC, bar, kmol/h, S$/t CO2e). Log axes show powers of ten (10<sup>-4</sup>), never "1e-4". Ticks at least 12 px. Bar charts start at zero. No dual y-axes; use two panels.
3. **Legends.** Label lines directly where possible; otherwise the legend sits above the plot in series order. A series is never identified by colour alone: add line style or marker shape.
4. **Caption.** A figure number and one sentence on what to read from the figure, then a source line naming the data file or commit (for example `results/simulations/baseline.json @ 70993a5`) and the model or engine version (for example `STRATO v1.0.1`).
5. **Provenance marking.** Every figure and headline number says what kind of value it is:

   | Kind | Meaning | Encoding |
   | --- | --- | --- |
   | Computed | produced by the project's code for the stated inputs | solid line |
   | Precomputed | computed earlier and stored; shown without rerunning | solid line, "Precomputed" in the caption |
   | Measured or literature | from an experiment or a publication | markers only, error bars where reported |
   | Assumed or extrapolated | an input or a value outside the checked range | dashed line, labelled in the legend |
   | Illustrative | explains a shape, not a result | grey with hatching and the word "Illustrative" |

   Verification (code against code or against an exact solution) and validation (code against measurement) are named as such and are never placed in one chart without labels. A verification result is never described as validation.
6. **Uncertainty.** A shaded band at 20% opacity or error bars, with the meaning stated (for example "Sobol 95% interval").
7. **Colour.** Categorical series use the Okabe-Ito palette, tokens `--cvd-1` to `--cvd-7`. On light backgrounds blue, vermillion, bluish green and reddish purple may be lines; orange, sky blue and yellow fall below 3:1 on white and are fills with a darker outline only. Sequential data use cividis (viridis as an option); diverging data use a colour-blind-safe ColorBrewer scheme (PuOr or BrBG). Never rainbow or jet. A site's own semantic colours (AmCraX species and provenance, KASCO evidence labels) keep their meaning across that site.
8. **Text alternative.** A chart has `role="img"` and an accessible name that states the finding, plus its data as a table (in a toggle or `<details>`) and a CSV download where the data is public. Chart text is real text, not raster.
9. **Raster figures** from Python or Aspen Plus need text at least 12 px at the displayed size; otherwise crop or regenerate them. Generated figures come from scripts in the project repository and are never redrawn by hand.
10. **Numbers in text** carry the same significant figures as their table, a space before the unit, and the case name next to any headline number.
11. **Model-version label.** Any page that shows computed numbers states the model or engine version and the commit or release they came from.

## A9. Tables

- Horizontal hairlines only; the header row on `--bg-subtle`.
- Numbers right aligned in tabular figures; units in the header, not in every cell.
- A wide table scrolls sideways inside its own focusable, labelled box (`role="region"`, `tabindex="0"`, `aria-label`) and never widens the page.
- Prose is not put in tables.

## A10. Mathematics

- Inline Unicode or HTML (`<sub>`, `<sup>`) for the occasional formula.
- Typeset mathematics uses KaTeX, pre-rendered at build time where the stack allows, at `font-size: 1.1em`. Display equations are numbered on the right, in brackets, and referred to as "Equation (n)".
- Symbols in italic, units and function names in roman type, a space between a value and its unit.

## A11. Code blocks

- Monospace text on `--bg-subtle` with a 1 px border and `--radius`. No syntax colouring, so a block reads in every colour mode.
- Fences name their language. Commands are one per line and run as written from the repository root. Units go in comments.

## A12. README conventions (GitHub Markdown)

Structure for a project README, adapted per repository. Sections with nothing true to say are left out.

1. `# Name: what it is` and one paragraph that states the problem, the method and the status.
2. A figure or screenshot, or a link to the live app.
3. Motivation or scope, short.
4. Model and method: governing equations, discretisation, boundary conditions, assumptions, units.
5. Install, then Run, as copyable commands with pinned versions.
6. Results or outputs, with the command that reproduces them.
7. Verification and validation, reporting measured values only.
8. Limitations.
9. Repository layout, documentation links.
10. References, citation, licence.

Markdown rules:

- Sentence case headings. One `#` per file. No heading level is skipped.
- No decorative dividers, banner art, typing animations, visitor counters or stat cards. At most three badges (CI, release, licence) and only where they report something real.
- Images use relative paths, an `alt` text that describes the content, and `width` no larger than 720. Light and dark variants use `<picture>` with `prefers-color-scheme`.
- Equations use `$...$` and `$$...$$`. Units are written with the value, in SI unless the source uses another unit.
- Tables are for parameters and results.
- Development logs, tool evaluations and audit trails live under `docs/`, linked from the README.
- British spelling (optimiser, licence as a noun, modelling).

## A13. Writing rules

Adapted from blader/humanizer, conorbronsdon/avoid-ai-writing, hardikpandya/stop-slop and AIScientists-Dev/academic-humanizer. The purpose is clarity. A rewrite never adds a fact, a number or a claim that the repository does not already support.

- Say what the thing is and does with "is" and "has". Avoid "serves as", "boasts", "showcases", "leverages".
- No promotional or inflated wording: robust, seamless, powerful, cutting-edge, comprehensive, pivotal, "paves the way".
- No em dashes. Use a comma, a colon or two sentences.
- No "not X but Y" constructions.
- No lists of three built for rhythm. List the items that exist.
- No one-line closers that restate the paragraph.
- No stacked connectives (Moreover, Furthermore, Additionally).
- Claims match evidence: "agrees with the series solution to 1e-6" only if that number is in the repository's outputs. Otherwise describe the check without a number.
- Hedges stay where the uncertainty is real (synthetic parameters, unvalidated inputs).
- First person is fine on the profile and the site. Project READMEs describe the software.
- Keep the author's own sentences where they are already plain. Edit, do not regenerate.

Canonical names:

| Short name | Full name | First-line context |
| --- | --- | --- |
| STRATO | Spherical TRISO Analysis and Transport Operations | fission-product diffusion in a TRISO coated fuel particle |
| KASCO | Kalimantan SAF Supply Chain Optimiser | sustainable aviation fuel network planning tool |
| NUS-H2 | Nuclear-upgraded steam methane reforming with carbon capture for low-carbon hydrogen in Singapore | process and techno-economic study with a browser simulator |
| AmCraX | Ammonia cracking simulation and optimisation platform | Aspen Plus flowsheet with independent Python models and a browser simulator |

Research interests, in this order and wording everywhere: nuclear engineering and energy systems; hydrogen and low-carbon technologies; chemical process modelling and simulation; techno-economic analysis; process safety and sustainability; scientific computing and numerical methods.

## How the five sites differ

| | Portfolio | STRATO | NUS-H2 | AmCraX | KASCO |
| --- | --- | --- | --- | --- | --- |
| Default mode | light paper, follows the system setting; flat dark variant | follows the system; light and dark | light only | dark navy; light variant | dark only |
| Typefaces | Newsreader headings, Inter text, JetBrains Mono | Literata, IBM Plex Sans and Mono, KaTeX | system fonts only | its own self-hosted faces | its own stack |
| Accent | brick | slate blue; cividis for fields | violet | sky and orange | teal |
| Density | low, reading | medium, tool with documents | high, data sheet | high, console | high, dashboard |

---

# Part B. Portfolio identity: "editorial notebook"

A research notebook set like a well-made journal: warm paper, a serif voice for headings, Inter for reading and data, and each project shown by its own figure and a verified result. The home page is an index of real work, not a pitch.

## B1. Colour

Light is the default when the system asks for light or states no preference; the dark variant follows `prefers-color-scheme: dark`. The header button sets `data-theme` on `<html>` and the choice is remembered in the browser. Both modes are flat: there is no gradient and no texture.

Contrast is the WCAG 2.x ratio computed from the hex codes (relative luminance), against the page background unless stated.

| Token | Light | Ratio | Dark | Ratio | Use |
| --- | --- | --- | --- | --- | --- |
| `--bg` | `#f7f5f0` | | `#14130f` | | page |
| `--bg-subtle` | `#efebe2` | | `#1a1915` | | table header, code, footer band |
| `--surface` | `#ffffff` | | `#1d1c18` | | cards, menus |
| `--border` | `#d9d4c8` | decorative | `#34312a` | decorative | hairlines |
| `--border-strong` | `#8a8478` | 3.41 (3.72 on surface) | `#77715f` | 3.82 (3.50 on surface) | control edges |
| `--text` | `#1b1a17` | 15.97 (17.40 on surface, 14.63 on subtle) | `#ece8df` | 15.20 (13.95 on surface, 14.39 on subtle) | body and headings |
| `--text-muted` | `#5a564d` | 6.71 (7.31 on surface, 6.14 on subtle) | `#a8a296` | 7.32 (6.72 on surface, 6.93 on subtle) | captions, metadata |
| `--accent` | `#a1301c` | 6.52 (7.11 on surface, 5.97 on subtle) | `#e8836a` | 6.98 (6.40 on surface, 6.61 on subtle) | links, current page, primary button |
| `--accent-hover` | `#7d2414` | 9.03 | `#f2a691` | 9.42 | hover and active |
| `--accent-bg` | `#f6e6e1` | accent on it 5.86 | `#3a2219` | accent on it 5.54 | selected filter |
| `--on-accent` | `#ffffff` | 7.11 on accent | `#14130f` | 6.98 on accent | text on the primary button |
| `--focus` | `#1f5fbf` | 5.59 (6.09 on surface) | `#8fb4ff` | 8.98 (8.23 on surface) | focus ring |
| `--st-live` | `#2f6b3a` | 5.87 | `#86c08f` | 8.81 | status dot "live" |

The focus ring is blue, not brick, so that it stays distinct from links and the current-page mark. Status dots always sit next to their word.

## B2. Typography

Scale ratio about 1.25, rem on a 16 px root.

| Role | Face | Size | Line height | Notes |
| --- | --- | --- | --- | --- |
| Home statement | Newsreader 500 | clamp(1.75rem, 1.4rem + 1.2vw, 2.25rem) | 1.15 | one factual sentence; -0.01em |
| Page title (h1) | Newsreader 500 | clamp(2rem, 1.7rem + 1.3vw, 2.625rem) | 1.15 | |
| Section title (h2) | Newsreader 500 | clamp(1.5rem, 1.3rem + 0.8vw, 1.75rem) | 1.25 | |
| Sub-section (h3) | Inter 600 | 1.125rem | 1.35 | |
| Lead | Inter 400 | 1.1875rem | 1.55 | |
| Body | Inter 400 | 1.0625rem | 1.65 | measure 68ch |
| Small, caption | Inter 400 | 0.875rem | 1.5 | |
| Meta label | Inter 500 | 0.8125rem | 1.4 | sentence case |
| Data, code, units | JetBrains Mono 400 | 0.875em | inherit | tabular by construction |

- Newsreader is used at 24 px and above only. Numbers stay in Inter (with `tabular-nums` in tables) or JetBrains Mono.
- All three faces are self-hosted from Fontsource packages, latin and latin-ext subsets (plus greek for JetBrains Mono only; Greek letters in Inter text use the fallback face, see B8), with metric-matched local fallbacks (`Newsreader fallback` from Georgia, `Inter fallback` from Arial, `JetBrains Mono fallback` from Consolas or Courier New). The repository measured a layout shift of 0.18 to 0.21 from font swap on the STRATO page before these fallbacks existed (`docs/MAINTAINING.md`).
- Space Grotesk is retired.

## B3. Layout

- Container 1120 px. Case-study prose 68ch. The navigation collapses into the phone menu below 1024 px.
- Home: statement with the Perry mascot beside it (owner decision, 24 November 2026), project rows, contact. Section pages: page hero (breadcrumb, h1, lead), then content.

## B4. Navigation

Top bar, labelled "Primary", with three labelled groups: **Work** (Projects, Research, Writing), **Beyond the lab** (Community, Innovation) and **Profile** (About). On wide screens the groups are separated by a hairline and each carries its label for screen readers; in the phone menu the labels are visible. Current page: brick underline and `aria-current`. The colour-mode toggle and the GitHub and LinkedIn icons sit at the right. No command palette.

## B5. Components

- **Project row** (home): a figure from the project's own output, the name and one sentence on what it computes, a status dot with its word, one verified result with its unit and provenance label, and one link row (Case study, Live site, Code). Area tags are plain text separated by middle dots; technology tags are small outlined tags.
- **Card** (one system): 1 px `--border`, `--radius`, `--surface` fill, no shadow, no hover lift. Padding 24 px (16 px on phones). The whole card is one link through its title; hover and focus change the border colour only.
- **Buttons**: one primary per view (accent fill, `--on-accent` text, 40 px high, 44 px on touch); secondary is an outline in `--border-strong`.
- **Status**: a 6 px dot plus its word ("Live site", "Released", "Planned"). "Website coming soon" is plain muted text, never a button shape.
- **Callout**: 1 px border with a 3 px accent rule on the left.
- **Tables, code, maths, figures**: as in A8 to A11.
- **Perry the Platypus** (owner's fan tribute, see `NOTICE.md`): stands beside the statement on the home page (owner decision, 24 November 2026) and appears small on About and on the 404 page. No speech bubbles, no console, no motion.

## B6. Interaction

- Project filter on the Projects page: toggle buttons with `aria-pressed` and a polite status line that states how many projects match.
- Case-study tabs (WAI-ARIA tabs), figure zoom, gallery and document viewer as before.
- Transitions are colour and opacity over `--dur-base`; under reduced motion they are 0 ms.

## B7. Icons

- Lucide geometry: 24 px grid, 2 px stroke, round caps and joins, `currentColor`, inline SVG through `Icon.astro`.
- 16 px inline with text, 20 px in buttons and navigation. An icon goes with a label, except the GitHub and LinkedIn marks, which carry an `aria-label`.
- No emoji in headings, lists or badges.

## B8. Recorded differences from design direction A

Part B follows direction A of the Stage A design review (2026-11-24), with these deliberate differences. Each one can be revisited; none is an oversight.

| Direction A | This site | Reason |
| --- | --- | --- |
| Home statement 36 to 52 px | 28 to 36 px (`--fs-statement`), measure 42ch | The owner's chosen statement is one long sentence (28 words). At the larger sizes it pushes the first project row below the fold of a 1440 x 900 window; at 36 px it takes four lines and the first row's figure and checked result stay visible. |
| Container 1200 px | 1120 px (`--maxw`), the width the site already used | At 1120 px the text column of a project row (7 of 12 columns) is already close to the 68ch measure; a wider container would add empty margin, not readable width. |
| Case-study pages with a 220 px margin column | No margin column; the existing tabbed layout with "On this page" contents and a facts block at the top | The case studies kept their tested tab, contents and figure components in the redesign. A margin column is an open item, not a rejected one. |
| Cards only for galleries and documents | Bordered cards also for the About research interests, the Writing note list and "Selected work" | Each of these is a list of separately linked items with a short description; the card gives each item one clear hover and focus target. Plain rows would also work. |
| Ledger columns Date, Type, Title, Project, Format/size, mono dates | Title, Type, Date or status, Format, grouped by section; dates in Inter with tabular figures | Projects have a status (for example "Live site"), not a date, so the column holds either. The section group rows replace a Project column. Numbers in running tables stay in Inter (B2). |
| Greek subsets for the body face | No Inter greek subset; Greek letters fall back to `Inter fallback` (Arial) and then the system sans-serif | Keeps every page under the 150 kB font budget. The Inter greek subset (19 kB) took the CN5303, CN5190 and NUS-H2 pages to about 162 kB. JetBrains Mono keeps its small greek subset. |

## B9. Where the rules come from

Values were read from each project's source on 2026-11-19 and the Stage A design review of 2026-11-24. They were used as reference points. No code or component was copied.

| Source | What was adopted |
| --- | --- |
| [shadcn/ui](https://github.com/shadcn-ui/ui) | Every radius derives from one base value; cards are a hairline border with almost no shadow; a short ladder of surfaces. |
| [Tailwind CSS](https://github.com/tailwindlabs/tailwindcss) | 4 px spacing grid; 150 ms ease for transitions. |
| [Tailwind Typography](https://github.com/tailwindlabs/tailwindcss-typography) | Prose measure near 65ch; more space above a heading than below it; tables with horizontal hairlines only. |
| [Lucide](https://github.com/lucide-icons/lucide) | 24 px grid, 2 px stroke, `currentColor`, inline SVG with no runtime package. |
| [Primer](https://github.com/primer/primitives) | Small radii for controls with 12 px reserved for large surfaces; all motion gated on reduced motion. |
| [Radix Themes and Colors](https://github.com/radix-ui/themes) | Colour tokens named by role; ARIA patterns for tabs and disclosure. |
| [github/markup](https://github.com/github/markup) and GitHub Docs | Which HTML survives in a README. |
| [Okabe and Ito, "Color Universal Design"](https://jfly.uni-koeln.de/color/) | The categorical palette in A8. |
| Our World in Data, Distill, OpenMC documentation | Chart titles with unit and basis, labelled controls with live values, numbered equations (A8, A10). |
| maggieappleton.com, colah.github.io, gwern.net | A factual one-sentence home statement, figure-led project rows, metadata lines with honest status (Part B). |
| [blader/humanizer](https://github.com/blader/humanizer), [conorbronsdon/avoid-ai-writing](https://github.com/conorbronsdon/avoid-ai-writing), [hardikpandya/stop-slop](https://github.com/hardikpandya/stop-slop), [AIScientists-Dev/academic-humanizer](https://github.com/AIScientists-Dev/academic-humanizer) | The writing rules in A13. They are used for clarity and for matching claims to evidence. They are not used to hide how a text was written. |
