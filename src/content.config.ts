import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

/** A source a reader can open. `url` is optional for documents that are held offline. */
const source = z.object({ label: z.string(), url: z.string().url().optional() });

/** An image under /public. `src` is a path without the base, for example "research/cn5303/pfd.webp". */
const image = z.object({
  src: z.string(),
  alt: z.string(),
  caption: z.string().optional(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
});

/** One step of a roadmap or one phase of a timeline. Use `upcoming` with no detail when nothing is confirmed. */
const milestone = z.object({
  id: z.string(),
  title: z.string(),
  period: z.string().optional(),
  status: z.enum(['done', 'active', 'upcoming']),
  summary: z.string().optional(),
  items: z
    .array(z.object({ date: z.string().optional(), label: z.string(), detail: z.string().optional() }))
    .default([]),
});

/**
 * A document shown in the page viewer. Pages are pre-rendered WebP files named p-001.webp, p-002.webp, ...
 * inside `pageDir`. A document with `published: false` renders a neutral "held for review" card and none of
 * its files are referenced, so nothing has to exist under /public for it.
 */
const document = z.object({
  id: z.string(),
  title: z.string(),
  kind: z.enum(['report', 'slides', 'poster', 'essay', 'summary']),
  description: z.string().optional(),
  published: z.boolean().default(false),
  /** PDF under /public, for example "documents/thicksense/poster.pdf". */
  pdf: z.string().optional(),
  pageDir: z.string().optional(),
  pages: z.number().int().positive().optional(),
  pageWidth: z.number().int().positive().optional(),
  pageHeight: z.number().int().positive().optional(),
  /** Shown under the viewer, for example what was removed from the public edition. */
  note: z.string().optional(),
});

/** A photo gallery. `published: false` shows the session card with a neutral pending state and no images. */
const gallery = z.object({
  id: z.string(),
  title: z.string(),
  date: z.string().optional(),
  location: z.string().optional(),
  note: z.string().optional(),
  published: z.boolean().default(false),
  images: z.array(image).default([]),
});

/** Project case studies, one MDX file per project. The slug must match an entry in src/data/site.ts. */
const projects = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    order: z.number().default(0),
    /** One or two sentences on where the project stands today. */
    statusNote: z.string().optional(),
    /** Development roadmap, oldest first. */
    roadmap: z.array(milestone).default([]),
    /** Screenshots and diagrams shown below the body. */
    figures: z.array(image).default([]),
    /** Facts a reader can check, each with the repository file or section it comes from. */
    sources: z.array(z.object({ label: z.string(), url: z.string().url() })).default([]),
  }),
});

/**
 * Shared shape of the long-form case studies in the Research, Community and Innovation sections.
 * Every field that is not known is left out. Nothing here is filled with a guess.
 */
const caseStudy = z.object({
  title: z.string(),
  /** Short name for cards, breadcrumbs and navigation. */
  shortTitle: z.string(),
  /** One or two sentences. Also the meta description. */
  summary: z.string(),
  /** What kind of work this is, for example "Group case study" or "Individual review essay". */
  kind: z.string(),
  /** The owner's role, when it is worth stating. */
  role: z.string().optional(),
  /** Display text, for example "August 2026 to February 2027". */
  period: z.string(),
  /** Sort key: the completion date, or the start date for work in progress. */
  date: z.coerce.date(),
  status: z.string(),
  order: z.number().default(0),
  draft: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
  /** Key facts strip under the title. Verified values only. */
  facts: z.array(z.object({ label: z.string(), value: z.string() })).default([]),
  hero: image.optional(),
  documents: z.array(document).default([]),
  galleries: z.array(gallery).default([]),
  timeline: z.array(milestone).default([]),
  /** Links to other pages of this site. `href` is a path without the base, for example "projects/amcrax/". */
  related: z.array(z.object({ label: z.string(), href: z.string() })).default([]),
  sources: z.array(source).default([]),
});

const research = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/research' }),
  schema: caseStudy,
});

const community = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/community' }),
  schema: caseStudy,
});

const innovation = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/innovation' }),
  schema: caseStudy,
});

/** Research notes, technical articles and computational studies. */
const notes = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/notes' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    category: z.enum([
      'Nuclear Engineering',
      'Hydrogen Technologies',
      'Chemical Process Engineering',
      'Scientific Computing',
      'Sustainability',
    ]),
    kind: z.enum(['Research note', 'Technical article', 'Computational study', 'Publication']).default('Research note'),
    date: z.coerce.date(),
    draft: z.boolean().default(false),
    /** Public source the note is based on. Required so nothing is unsourced. */
    sourceUrl: z.string().url().optional(),
    sourceLabel: z.string().optional(),
    tags: z.array(z.string()).default([]),
  }),
});

export const collections = { projects, research, community, innovation, notes };
