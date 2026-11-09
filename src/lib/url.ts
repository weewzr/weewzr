/** Prefix a path with the site's base path (for example "/weewzr"). Leaves absolute URLs untouched. */
export function withBase(path: string): string {
  if (/^(https?:)?\/\//.test(path) || path.startsWith('mailto:') || path.startsWith('#')) return path;
  const base = import.meta.env.BASE_URL.replace(/\/+$/, '');
  return `${base}/${path.replace(/^\/+/, '')}`;
}

/** Home-page anchor that also works from other pages, for example homeAnchor('#projects'). */
export function homeAnchor(hash: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/+$/, '');
  return `${base}/${hash}`;
}
