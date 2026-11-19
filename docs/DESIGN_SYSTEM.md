# Design system

One visual and editorial language for the portfolio site, the GitHub profile README and the project READMEs. The site carries the full visual system. READMEs carry the editorial rules and a small subset of the visual ones, because GitHub strips `style` and `class`.

## 1. Principles

1. Content first. A reader should find what a project computes, how it was checked and where it stops within one screen.
2. One accent. Blue marks links, focus and the single primary action in a view. Cyan is a secondary data colour. Everything else is neutral.
3. Borders before shadows. Surfaces are separated by a 1 px hairline. Nothing glows.
4. Left aligned. Headings, text and cards share one left edge. Centred text is reserved for figure captions.
5. Motion only confirms an action. Colour and opacity may change over 150 ms. Nothing moves on scroll.

## 2. Colour

Contrast ratios are WCAG 2.1 values computed from the hex codes (script in the audit notes). Text needs 4.5:1, large text and UI boundaries 3:1.

### Light theme

| Token | Hex | Use | Contrast |
| --- | --- | --- | --- |
| `--bg` | `#ffffff` | page | |
| `--bg-subtle` | `#f4f7fa` | bands, code, table header | |
| `--border` | `#d5dde6` | hairlines, card edges | decorative |
| `--border-strong` | `#8794a3` | inputs, control edges | 3.09 on bg |
| `--text` | `#101a2b` | body and headings | 17.43 on bg |
| `--text-muted` | `#4b5b6f` | captions, metadata | 6.94 on bg |
| `--accent` | `#1d4fd7` | links, primary button fill, focus ring | 6.66 on bg |
| `--accent-hover` | `#173ea8` | hover and active | 9.17 on bg |
| `--accent-bg` | `#e9f1fe` | selected filter, tinted note | accent on it 5.86 |
| `--cyan` | `#0b6b85` | secondary data colour, status "live" | 6.08 on bg |
| `--cyan-bg` | `#e3f4f8` | tint behind cyan text | cyan on it 5.37 |
| `--navy` | `#0b1f3a` | footer band, README banner | white on it > 15 |

### Dark theme

| Token | Hex | Use | Contrast |
| --- | --- | --- | --- |
| `--bg` | `#0b1320` | page | |
| `--bg-subtle` | `#101b2d` | bands, code | |
| `--surface` | `#132036` | cards, menus | |
| `--border` | `#263750` | hairlines | decorative |
| `--border-strong` | `#5b6f8a` | control edges | 3.62 on bg |
| `--text` | `#e7edf4` | body and headings | 15.79 on bg |
| `--text-muted` | `#a3b2c5` | captions, metadata | 8.63 on bg |
| `--accent` | `#78aeff` | links, focus ring | 8.24 on bg |
| `--accent-hover` | `#a3c8ff` | hover | 10.87 on bg |
| `--accent-solid` | `#2f6fed` | primary button fill | white on it 4.55 |
| `--accent-bg` | `#152a4d` | selected filter | accent on it 6.32 |
| `--cyan` | `#67d3e3` | secondary data colour | 10.64 on bg |

Rules: no purple, violet or pink anywhere. No gradient text. Gradients are allowed only inside figures that come from a project (plots, process diagrams).

## 3. Typography

| Role | Family | Size | Weight | Line height |
| --- | --- | --- | --- | --- |
| Page title (h1) | Inter | clamp(2rem, 1.6rem + 1.6vw, 2.75rem) | 650 | 1.15 |
| Section title (h2) | Inter | clamp(1.5rem, 1.35rem + 0.6vw, 1.75rem) | 650 | 1.25 |
| Card or sub-section title (h3) | Inter | 1.125rem | 600 | 1.35 |
| Lead | Inter | 1.125rem | 400 | 1.6 |
| Body | Inter | 1rem | 400 | 1.65 |
| Small, captions | Inter | 0.875rem | 400 | 1.5 |
| Code, numeric data, units | JetBrains Mono | 0.9em | 400 | inherit |

- One sans family for headings and body. Space Grotesk is retired.
- Tracking: -0.02em on h1, -0.01em on h2, 0 elsewhere.
- Headings are sentence case and left aligned.
- Prose measure is 68ch at most.
- Uppercase letter-spaced mono labels are not used as section eyebrows. Mono is for code, values and units.
- Bold marks a term on first definition or a key number. It is not used for emphasis in running text.

## 4. Spacing and layout

- Scale (px): 4, 8, 12, 16, 24, 32, 48, 64, 96. No value outside the scale.
- Container: 1120 px maximum with 16 px side gutters on phones and 24 px from 640 px.
- Section rhythm: 64 px between sections on phones, 96 px from 1024 px. A heading sits 24 px above its content.
- Card padding: 24 px (16 px on phones). Gap between cards: 24 px.
- Grids: one column below 640 px, two from 640 px, three only when every item has the same structure and similar length. Cards in a row stretch to equal height and pin their link row to the bottom.
- Images keep their intrinsic aspect ratio, sit in a 1 px bordered frame and never crop a diagram.

## 5. Radius, borders and elevation

| Token | Value | Use |
| --- | --- | --- |
| `--radius-sm` | 4 px | tags, inline code, small badges |
| `--radius` | 8 px | buttons, inputs, cards, images |
| `--radius-lg` | 12 px | large media frames, dialogs |
| full | 9999 px | avatar and status dot only |

- Resting cards have a border and no shadow.
- `--shadow-sm: 0 1px 2px rgb(16 26 43 / 0.06)` for menus and the sticky header once the page has scrolled.
- No glow, no backdrop blur on content cards, no coloured shadow.

## 6. Interaction and motion

- Transitions: `150ms ease` on `color`, `background-color`, `border-color`, `opacity`. No hover translate or scale.
- Focus: `outline: 2px solid var(--accent); outline-offset: 2px` on `:focus-visible`.
- Targets are at least 44 x 44 px on touch layouts.
- `prefers-reduced-motion: reduce` removes every transition and smooth scroll.
- No scroll-triggered reveal, no typing effect, no looping animation.

## 7. Icons

- Lucide geometry: 24 px grid, 2 px stroke, round caps and joins, `currentColor`.
- Rendered at 16 px inline with text and 20 px in buttons and navigation.
- Inline SVG through the existing `Icon.astro`. No icon font, no runtime package.
- An icon accompanies a label. It does not replace one, except for the GitHub and LinkedIn marks, which carry an `aria-label`.
- No emoji in headings, lists or badges.

## 8. Components

- Button, primary: solid accent fill, white text, 8 px radius, 40 px high. One per view.
- Button, secondary: 1 px `--border-strong`, text colour, transparent fill.
- Link: accent colour, underlined in prose, underline on hover in navigation.
- Tag: plain small text in a 4 px radius outline. A card shows at most five.
- Status: a 6 px dot plus text ("Live", "Released", "Planned"). Colour never carries the status alone.
- Project card: title, one sentence saying what it was built for and what it computes, up to three facts, tags, links. Image on top at a fixed aspect ratio where one exists.
- Table: horizontal hairlines only, header row on `--bg-subtle`, numbers right aligned in mono, units in the header.
- Callout: 1 px border with a 3 px accent rule on the left. No fill gradient.
- Perry console: a terminal-style panel that stays dark in both colour modes. It carries its own five colours (the dark-theme values) as local variables in `PerryConsole.astro`. Perry figures may tilt or hop once on hover or click, for 300 ms at most, and only when the visitor has not asked for reduced motion. This is the only place a transform is animated.
- Code blocks: plain mono text on `--bg-subtle` with a 1 px border. No syntax colouring, so the same block reads in both colour modes.

## 9. README conventions (GitHub Markdown)

Structure for a project README, adapted per repository. Sections that have nothing true to say are left out.

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
- Code fences name their language. Commands are one per line and run as written from the repository root.
- Tables are for parameters and results. Prose is not put in tables.
- Development logs, tool evaluations and audit trails live under `docs/`, linked from the README.
- British spelling (optimiser, licence as a noun, modelling), matching the existing text.

## 10. Writing rules

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

## 11. Canonical names

| Short name | Full name | First-line context |
| --- | --- | --- |
| STRATO | Spherical TRISO Analysis and Transport Operations | fission-product diffusion in a TRISO coated fuel particle |
| KASCO | Kalimantan SAF Supply Chain Optimiser | sustainable aviation fuel network planning tool |
| NUS-H2 | Nuclear-upgraded steam methane reforming with carbon capture for low-carbon hydrogen in Singapore | process and techno-economic study with a browser simulator |

Research interests, in this order and wording everywhere: nuclear engineering and energy systems; hydrogen and low-carbon technologies; chemical process modelling and simulation; techno-economic analysis; process safety and sustainability; scientific computing and numerical methods.

## 12. Where the rules come from

Values were read from each project's source on 2026-11-19. They were used as reference points. No code or component was copied.

| Source | What was adopted |
| --- | --- |
| [shadcn/ui](https://github.com/shadcn-ui/ui) | Every radius derives from one base value; cards are a hairline border with almost no shadow; a short ladder of surfaces (page, subtle, card). |
| [Tailwind CSS](https://github.com/tailwindlabs/tailwindcss) | 4 px spacing grid; 150 ms ease for transitions; shadows no stronger than the `sm` step. |
| [Tailwind Typography](https://github.com/tailwindlabs/tailwindcss-typography) | Prose measure near 65ch; more space above a heading than below it; tables with horizontal hairlines only. |
| [Lucide](https://github.com/lucide-icons/lucide) | 24 px grid, 2 px stroke, `currentColor`, inline SVG with no runtime package. |
| [Primer](https://github.com/primer/primitives) | Small radii for controls with 12 px reserved for large surfaces; near-invisible resting elevation; all motion gated on reduced-motion. |
| [Radix Themes and Colors](https://github.com/radix-ui/themes) | Colour tokens named by role (background, border, solid, text); tracking tightens as type grows; ARIA patterns for tabs and disclosure. |
| [github/markup](https://github.com/github/markup) and GitHub Docs | Which HTML survives in a README (`img width`, `picture`, `details`, `sub`), and that `style` and `class` are stripped. |
| [Best-README-Template](https://github.com/othneildrew/Best-README-Template), [awesome-readme](https://github.com/matiassingers/awesome-readme) | Section order for a project README, trimmed to what a solo research code needs. |
| [awesome-github-profile-readme](https://github.com/abhisheknaiidu/awesome-github-profile-readme) | A text-first profile: who, projects, tools, links. No stat cards or animations. |
| [openmc](https://github.com/openmc-dev/openmc), [PyBaMM](https://github.com/pybamm-team/PyBaMM), [dolfinx](https://github.com/FEniCS/dolfinx) | Scientific READMEs stay short and point to fuller documents. |
| [blader/humanizer](https://github.com/blader/humanizer), [conorbronsdon/avoid-ai-writing](https://github.com/conorbronsdon/avoid-ai-writing), [hardikpandya/stop-slop](https://github.com/hardikpandya/stop-slop), [AIScientists-Dev/academic-humanizer](https://github.com/AIScientists-Dev/academic-humanizer) | The writing rules in section 10. They are used for clarity and for matching claims to evidence. They are not used to hide how a text was written. |
