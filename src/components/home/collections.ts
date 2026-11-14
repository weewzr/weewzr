import { getCollection, type CollectionEntry } from 'astro:content';

export type WorkName = 'research' | 'community' | 'innovation';
export type WorkEntry = CollectionEntry<WorkName>;

/** Published entries of a case-study collection, sorted by `order`, then newest first, then title. */
export async function getWork(name: WorkName): Promise<WorkEntry[]> {
  const entries = (await getCollection(name)) as WorkEntry[];
  return entries
    .filter(({ data }) => !data.draft)
    .sort(
      (a, b) =>
        a.data.order - b.data.order ||
        b.data.date.valueOf() - a.data.date.valueOf() ||
        a.data.title.localeCompare(b.data.title),
    );
}
