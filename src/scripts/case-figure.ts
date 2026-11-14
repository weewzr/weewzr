/**
 * Zoomable figures. Progressive enhancement: without this script a zoomable figure is a link to the full image.
 * One delegated listener serves every figure on the page.
 */
const opened = new WeakMap<HTMLDialogElement, HTMLElement>();

document.addEventListener('click', (event) => {
  const target = event.target as Element | null;
  if (!target) return;

  const open = target.closest<HTMLAnchorElement>('[data-fig-open]');
  if (open) {
    const dialog = open.closest('[data-figure]')?.querySelector<HTMLDialogElement>('[data-fig-dialog]');
    if (dialog && typeof dialog.showModal === 'function') {
      event.preventDefault();
      opened.set(dialog, open);
      dialog.showModal();
      dialog.querySelector<HTMLElement>('[data-fig-close]')?.focus();
    }
    return;
  }

  const close = target.closest('[data-fig-close]');
  if (close) {
    close.closest<HTMLDialogElement>('dialog')?.close();
    return;
  }

  // Click on the backdrop (the dialog element itself) closes it.
  if (target instanceof HTMLDialogElement && target.hasAttribute('data-fig-dialog')) target.close();
});

// The close event fires for Escape, the button and the backdrop: return focus to the opener.
document.addEventListener(
  'close',
  (event) => {
    const dialog = event.target;
    if (!(dialog instanceof HTMLDialogElement) || !dialog.hasAttribute('data-fig-dialog')) return;
    opened.get(dialog)?.focus();
  },
  true,
);

export {};
