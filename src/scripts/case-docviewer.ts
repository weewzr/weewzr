/**
 * Page-image document viewer. Every viewer on the page is set up independently from its own data
 * attributes; nothing here relies on ids. Without this script the page shows page 1 and the PDF links.
 */
const ZOOM_MIN = 0.5;
const ZOOM_MAX = 4;
const ZOOM_STEP = 0.25;

function init(root: HTMLElement) {
  const dir = root.dataset.dir ?? '';
  const total = Number(root.dataset.pages ?? 0);
  const title = root.dataset.title ?? 'Document';
  const frame = root.querySelector<HTMLElement>('[data-dv-frame]');
  const img = root.querySelector<HTMLImageElement>('[data-dv-img]');
  const status = root.querySelector<HTMLElement>('[data-dv-status]');
  if (!dir || !total || !frame || !img || !status) return;

  const prev = root.querySelector<HTMLButtonElement>('[data-dv-prev]');
  const next = root.querySelector<HTMLButtonElement>('[data-dv-next]');
  const input = root.querySelector<HTMLInputElement>('[data-dv-input]');
  const fit = root.querySelector<HTMLButtonElement>('[data-dv-fit]');
  const zoomIn = root.querySelector<HTMLButtonElement>('[data-dv-zoom-in]');
  const zoomOut = root.querySelector<HTMLButtonElement>('[data-dv-zoom-out]');
  const zoomLabel = root.querySelector<HTMLElement>('[data-dv-zoom-label]');
  const full = root.querySelector<HTMLButtonElement>('[data-dv-full]');

  let page = 1;
  let zoom = 1;

  const url = (n: number) => `${dir}/p-${String(n).padStart(3, '0')}.webp`;

  function applyZoom() {
    img!.style.width = `${zoom * 100}%`;
    if (zoomLabel) zoomLabel.textContent = `${Math.round(zoom * 100)}%`;
    if (zoomIn) zoomIn.disabled = zoom >= ZOOM_MAX;
    if (zoomOut) zoomOut.disabled = zoom <= ZOOM_MIN;
  }

  function goTo(n: number) {
    const target = Math.min(total, Math.max(1, Math.round(n)));
    if (Number.isNaN(target)) return;
    const changed = target !== page;
    page = target;
    if (changed) {
      img!.src = url(page);
      frame!.scrollTop = 0;
    }
    img!.alt = `${title}, page ${page} of ${total}`;
    if (input) input.value = String(page);
    if (prev) prev.disabled = page <= 1;
    if (next) next.disabled = page >= total;
    status!.textContent = `Page ${page} of ${total}`;
    // Preload only the next page.
    if (page < total) new Image().src = url(page + 1);
  }

  img.addEventListener('error', () => {
    status.textContent = `Page ${page} of ${total} could not be loaded.`;
  });

  prev?.addEventListener('click', () => goTo(page - 1));
  next?.addEventListener('click', () => goTo(page + 1));
  input?.addEventListener('change', () => {
    const n = Number(input.value);
    if (Number.isFinite(n) && input.value !== '') goTo(n);
    else input.value = String(page);
  });
  input?.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') input.dispatchEvent(new Event('change'));
  });

  fit?.addEventListener('click', () => {
    zoom = 1;
    applyZoom();
    frame.scrollLeft = 0;
    frame.scrollTop = 0;
  });
  zoomIn?.addEventListener('click', () => {
    zoom = Math.min(ZOOM_MAX, zoom + ZOOM_STEP);
    applyZoom();
  });
  zoomOut?.addEventListener('click', () => {
    zoom = Math.max(ZOOM_MIN, zoom - ZOOM_STEP);
    applyZoom();
  });

  // Fullscreen only where the browser supports it.
  if (full && document.fullscreenEnabled && typeof root.requestFullscreen === 'function') {
    full.hidden = false;
    full.addEventListener('click', () => {
      if (document.fullscreenElement === root) void document.exitFullscreen();
      else void root.requestFullscreen().catch(() => {});
    });
    document.addEventListener('fullscreenchange', () => {
      full.textContent = document.fullscreenElement === root ? 'Exit fullscreen' : 'Fullscreen';
    });
  }

  root.addEventListener('keydown', (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const t = event.target as HTMLElement;
    if (t instanceof HTMLInputElement || t instanceof HTMLTextAreaElement || t instanceof HTMLSelectElement) return;
    let handled = true;
    switch (event.key) {
      case 'ArrowLeft':
      case 'PageUp':
        goTo(page - 1);
        break;
      case 'ArrowRight':
      case 'PageDown':
        goTo(page + 1);
        break;
      case 'Home':
        goTo(1);
        break;
      case 'End':
        goTo(total);
        break;
      default:
        handled = false;
    }
    if (handled) event.preventDefault();
  });

  applyZoom();
  goTo(1);
}

document.querySelectorAll<HTMLElement>('[data-docviewer]').forEach(init);

export {};
