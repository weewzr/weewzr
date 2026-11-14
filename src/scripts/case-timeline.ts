/**
 * Timeline disclosure. Without this script every phase is expanded. With it, on wide screens the rail
 * buttons expand and collapse their phase (WAI-ARIA disclosure); on narrow screens every phase stays
 * expanded and the rail is hidden by CSS. Arrow keys, Home and End move between rail buttons.
 */
function init(root: HTMLElement) {
  const buttons = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-tl-btn]'));
  const panels = buttons.map((b) => document.getElementById(b.getAttribute('aria-controls') ?? ''));
  if (!buttons.length || panels.some((p) => p === null)) return;
  const items = panels as HTMLElement[];
  const mq = window.matchMedia('(min-width: 900px)');
  const open = new Set<number>([Number(root.dataset.firstOpen ?? 0)]);

  function render() {
    const wide = mq.matches;
    buttons.forEach((btn, i) => {
      const show = !wide || open.has(i);
      btn.setAttribute('aria-expanded', String(show));
      items[i].hidden = !show;
    });
  }

  buttons.forEach((btn, i) => {
    btn.addEventListener('click', () => {
      if (open.has(i)) open.delete(i);
      else open.add(i);
      render();
    });
    btn.addEventListener('keydown', (event) => {
      const last = buttons.length - 1;
      let next = -1;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = i === last ? 0 : i + 1;
      else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = i === 0 ? last : i - 1;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = last;
      if (next < 0) return;
      event.preventDefault();
      buttons[next].focus();
    });
  });

  // Printing: show every phase, then restore.
  window.addEventListener('beforeprint', () => items.forEach((p) => (p.hidden = false)));
  window.addEventListener('afterprint', render);
  mq.addEventListener('change', render);

  // A link or address that names a phase opens it.
  const fromHash = () => {
    const id = decodeURIComponent(location.hash.slice(1));
    const i = items.findIndex((p) => p.id === id);
    if (i >= 0) {
      open.add(i);
      render();
    }
  };
  window.addEventListener('hashchange', fromHash);

  render();
  fromHash();
}

document.querySelectorAll<HTMLElement>('[data-timeline]').forEach(init);

export {};
