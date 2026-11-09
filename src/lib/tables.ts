/**
 * Helpers that wrap Markdown tables in a keyboard-focusable scroll region with a unique
 * accessible name, so wide tables scroll sideways on phones without breaking reflow.
 */

/** Accessible name built from the table's own column headings, so each region is unique. */
export function tableLabel(innerHtml: string): string {
  const heads = [...innerHtml.matchAll(/<th[^>]*>([\s\S]*?)<\/th>/g)]
    .map((m) => m[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .slice(0, 4);
  return heads.length
    ? `Table with columns ${heads.join(', ')}. Scrolls sideways on narrow screens.`
    : 'Table. Scrolls sideways on narrow screens.';
}

const escapeAttr = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;');

/** For HTML strings rendered from Markdown (the notes pages). */
export function wrapTables(html: string): string {
  return html.replace(
    /<table>([\s\S]*?)<\/table>/g,
    (_m, inner: string) =>
      `<div class="table-scroll" role="region" tabindex="0" aria-label="${escapeAttr(tableLabel(inner))}"><table>${inner}</table></div>`,
  );
}
