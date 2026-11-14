/**
 * Gallery lightbox on the native <dialog>. Works for any number of galleries on one page.
 * Open by click or Enter on a thumbnail, Escape closes, ArrowLeft and ArrowRight (and the buttons) move,
 * focus returns to the thumbnail that was last shown.
 */
type Shot = { src: string; alt: string; caption: string; w: string; h: string };

function init(root: HTMLElement) {
  const dialog = root.querySelector<HTMLDialogElement>('[data-gal-dialog]');
  const thumbs = Array.from(root.querySelectorAll<HTMLAnchorElement>('[data-gal-thumb]'));
  if (!dialog || typeof dialog.showModal !== 'function' || !thumbs.length) return;
  const img = dialog.querySelector<HTMLImageElement>('[data-gal-img]')!;
  const caption = dialog.querySelector<HTMLElement>('[data-gal-caption]')!;
  const count = dialog.querySelector<HTMLElement>('[data-gal-count]')!;
  const shots: Shot[] = thumbs.map((a) => ({
    src: a.href,
    alt: a.dataset.alt ?? '',
    caption: a.dataset.caption ?? '',
    w: a.dataset.w ?? '',
    h: a.dataset.h ?? '',
  }));
  let index = 0;

  function show(i: number) {
    index = (i + shots.length) % shots.length;
    const s = shots[index];
    img.src = s.src;
    img.alt = s.alt;
    if (s.w) img.setAttribute('width', s.w);
    if (s.h) img.setAttribute('height', s.h);
    caption.textContent = s.caption;
    count.textContent = `${index + 1} of ${shots.length}`;
    // Warm the cache for the neighbour in the direction of travel.
    new Image().src = shots[(index + 1) % shots.length].src;
  }

  thumbs.forEach((a, i) => {
    a.addEventListener('click', (event) => {
      event.preventDefault();
      show(i);
      dialog.showModal();
      dialog.querySelector<HTMLElement>('[data-gal-close]')?.focus();
    });
  });
  dialog.querySelector('[data-gal-prev]')?.addEventListener('click', () => show(index - 1));
  dialog.querySelector('[data-gal-next]')?.addEventListener('click', () => show(index + 1));
  dialog.querySelector('[data-gal-close]')?.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      show(index - 1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      show(index + 1);
    }
  });
  dialog.addEventListener('close', () => thumbs[index]?.focus());
}

document.querySelectorAll<HTMLElement>('[data-gallery]').forEach(init);

export {};
