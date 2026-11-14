/**
 * Scroll-spy for the "On this page" list. The links work without this script; it only marks the section
 * nearest the top of the viewport with aria-current="true".
 */
const links = Array.from(document.querySelectorAll<HTMLAnchorElement>('[data-toc-link]'));
const byId = new Map<string, HTMLAnchorElement[]>();
for (const link of links) {
  const id = decodeURIComponent((link.getAttribute('href') ?? '').replace(/^#/, ''));
  if (!id) continue;
  const list = byId.get(id) ?? [];
  list.push(link);
  byId.set(id, list);
}
const targets = [...byId.keys()]
  .map((id) => document.getElementById(id))
  .filter((el): el is HTMLElement => el !== null);

function setCurrent(id: string | null) {
  for (const link of links) {
    const on = id !== null && decodeURIComponent((link.getAttribute('href') ?? '').slice(1)) === id;
    if (on) link.setAttribute('aria-current', 'true');
    else link.removeAttribute('aria-current');
  }
}

if (targets.length) {
  let ticking = false;
  const offset = () => {
    const nav = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 68;
    return nav + 24;
  };
  const update = () => {
    ticking = false;
    const line = offset();
    let current: HTMLElement | null = null;
    for (const el of targets) {
      if (el.getBoundingClientRect().top - line <= 0) current = el;
    }
    // At the very bottom of the page the last section wins even when its heading is high on screen.
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
      current = targets[targets.length - 1];
    }
    setCurrent(current ? current.id : null);
  };
  const onScroll = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  update();
}

export {};
