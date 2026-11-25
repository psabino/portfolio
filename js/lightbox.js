// Tap/click to view an image full screen.
//
// Any content image shown noticeably smaller than its real resolution becomes
// zoomable (cursor: zoom-in). That's mostly diagrams and screenshots on phones;
// heroes, logos, thumbnails and icons are left alone. In the viewer, tapping
// the image switches between "fit to screen" and a zoomed, scrollable view.

const SKIP = '.hero, header, footer, .role-card, .more-projects, .project-card, .deliverables, .article-thumb, .tool-icons, .social-row';
const ZOOM_THRESHOLD = 1.25; // real width must be at least 25% larger than shown

const dialog = document.createElement('dialog');
dialog.className = 'lightbox';
dialog.setAttribute('aria-label', 'Image viewer');
dialog.innerHTML = `
  <button class="lightbox-close" type="button" aria-label="Close">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
  </button>
  <div class="lightbox-stage"><img class="lightbox-img" alt="" /></div>`;
document.body.append(dialog);

const stage = dialog.querySelector('.lightbox-stage');
const big = dialog.querySelector('.lightbox-img');

const open = img => {
  big.src = img.currentSrc || img.src;
  big.alt = img.alt;
  // Zoomed view: the image's real size on a 2x screen, at least twice the viewport
  big.style.setProperty('--zoom-width', `${Math.max(img.naturalWidth / 2, innerWidth * 2)}px`);
  dialog.classList.remove('is-zoomed');
  dialog.showModal();
  stage.scrollTo(0, 0);
};

big.addEventListener('click', e => {
  // Keep the tapped spot under the finger when zooming in
  const r = big.getBoundingClientRect();
  const fx = (e.clientX - r.left) / r.width, fy = (e.clientY - r.top) / r.height;
  dialog.classList.toggle('is-zoomed');
  if (dialog.classList.contains('is-zoomed')) {
    stage.scrollTo(fx * big.offsetWidth - innerWidth / 2, fy * big.offsetHeight - innerHeight / 2);
  }
});
dialog.querySelector('.lightbox-close').addEventListener('click', () => dialog.close());
// A click on the dark area (the stage itself, not the image) closes the viewer
stage.addEventListener('click', e => { if (e.target === stage) dialog.close(); });
dialog.addEventListener('close', () => big.removeAttribute('src'));

// Mark images that benefit from zooming; re-check when the layout width changes
const candidates = [...document.querySelectorAll('img')].filter(img => !img.closest(SKIP));
const update = img => {
  const shown = img.getBoundingClientRect().width;
  const zoomable = shown > 0 && img.naturalWidth > shown * ZOOM_THRESHOLD;
  img.classList.toggle('zoomable', zoomable);
  if (zoomable) {
    img.setAttribute('role', 'button');
    img.tabIndex = 0;
    img.setAttribute('aria-label', `Enlarge image${img.alt ? ': ' + img.alt : ''}`);
  } else if (img.hasAttribute('role')) {
    img.removeAttribute('role'); img.removeAttribute('tabindex'); img.removeAttribute('aria-label');
  }
};
candidates.forEach(img => {
  if (img.complete) update(img); else img.addEventListener('load', () => update(img), { once: true });
  img.addEventListener('click', () => { if (img.classList.contains('zoomable')) open(img); });
  img.addEventListener('keydown', e => {
    if (img.classList.contains('zoomable') && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); open(img); }
  });
});
let lastWidth = innerWidth;
addEventListener('resize', () => {
  if (innerWidth === lastWidth) return; // ignore mobile address-bar height changes
  lastWidth = innerWidth;
  candidates.forEach(update);
});
