import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

/** Case-study pages, one MDX file per project, slug must match src/data/site.ts. */
const projects = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    order: z.number().default(0),
    /** Facts a reader can check, each with the repository file or section it comes from. */
    sources: z.array(z.object({ label: z.string(), url: z.string().url() })).default([]),
  }),
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

export const collections = { projects, notes };
