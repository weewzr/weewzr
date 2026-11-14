/**
 * Helpers shared by the case-study components and the dynamic routes.
 * Types come from the content schema, so a change there shows up here.
 */
import type { CollectionEntry } from 'astro:content';
import { site } from '../data/site';
import type { Section } from '../data/site';
import { withBase } from './url';

export type CaseData = CollectionEntry<'research'>['data'];
export type CaseEntry = CollectionEntry<'research'> | CollectionEntry<'community'> | CollectionEntry<'innovation'>;
export type Milestone = CaseData['timeline'][number];
export type CaseDocument = CaseData['documents'][number];
export type CaseGallery = CaseData['galleries'][number];
export type CaseImage = NonNullable<CaseData['hero']>;
export type CaseFact = CaseData['facts'][number];

export const milestoneStatusText: Record<Milestone['status'], string> = {
  done: 'Completed',
  active: 'In progress',
  upcoming: 'Upcoming',
};

/** Plain-text progress such as "1 of 4 phases complete. Phase 2 is in progress." Never a percentage. */
export function progressText(items: readonly Milestone[], noun = 'phase'): string {
  const total = items.length;
  const done = items.filter((m) => m.status === 'done').length;
  const plural = total === 1 ? noun : `${noun}s`;
  let text = `${done} of ${total} ${plural} complete.`;
  const activeIndex = items.findIndex((m) => m.status === 'active');
  if (activeIndex >= 0) text += ` ${noun[0].toUpperCase()}${noun.slice(1)} ${activeIndex + 1} is in progress.`;
  return text;
}

/** Lower-case ASCII slug for ids. */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Order used on the section pages and by the previous/next pager: `order` first, then newest `date`. */
export function sortEntries<T extends CaseEntry>(entries: readonly T[]): T[] {
  return [...entries].sort(
    (a, b) => a.data.order - b.data.order || b.data.date.getTime() - a.data.date.getTime(),
  );
}

/** Previous and next neighbours, cyclic. With two entries only "next" is returned, as on the project pages. */
export function neighbours<T>(list: readonly T[], index: number): { prev: T | null; next: T | null } {
  const n = list.length;
  return {
    prev: n > 2 ? list[(index - 1 + n) % n] : null,
    next: n > 1 ? list[(index + 1) % n] : null,
  };
}

/** Absolute public URL of a page path such as "research/slug/". */
export function absoluteUrl(path: string): string {
  const base = site.url.endsWith('/') ? site.url : `${site.url}/`;
  return new URL(path.replace(/^\//, ''), base).href;
}

/** Article plus BreadcrumbList JSON-LD. Only fields that are true of the page are included. */
export function caseJsonLd(entry: CaseEntry, section: Section, path: string): Record<string, unknown> {
  const d = entry.data;
  const url = absoluteUrl(path);
  const article: Record<string, unknown> = {
    '@type': 'Article',
    '@id': `${url}#article`,
    headline: d.title,
    description: d.summary,
    url,
    mainEntityOfPage: url,
    inLanguage: 'en',
    author: { '@type': 'Person', name: site.name, url: site.url },
    isPartOf: { '@type': 'WebSite', name: site.name, url: site.url },
  };
  if (d.tags.length) article.keywords = d.tags.join(', ');
  if (d.hero) article.image = absoluteUrl(d.hero.src);
  return {
    '@context': 'https://schema.org',
    '@graph': [
      article,
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: absoluteUrl('') },
          { '@type': 'ListItem', position: 2, name: section.label, item: absoluteUrl(section.path) },
          { '@type': 'ListItem', position: 3, name: d.shortTitle, item: url },
        ],
      },
    ],
  };
}

/** Path of page n of a published document, for example "documents/x/p-004.webp" (before withBase). */
export function pagePath(pageDir: string, n: number): string {
  return `${pageDir.replace(/\/+$/, '')}/p-${String(n).padStart(3, '0')}.webp`;
}

export { withBase };
