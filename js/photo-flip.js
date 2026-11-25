// Keeps the Work ↔ About profile photo flip (css/style.css, PAGE TRANSITIONS)
// from playing before the new picture has loaded. Without this, a slow or
// uncached image flips in as an empty card and then fades in, which looks like
// a plain cross-fade. Loaded in <head> on both pages so the listener is in
// place before the first frame.

const MAX_WAIT = 1000; // ms; after this, play anyway

addEventListener('pagereveal', e => {
  const vt = e.viewTransition;
  if (!vt) return;
  vt.ready.then(() => {
    const img = document.querySelector('.about-photo img');
    if (!img || img.complete) return;
    // Freeze the whole transition (the old page stays on screen) until the
    // image is ready, then let it run from the start
    const anims = document.getAnimations().filter(a => a.effect?.pseudoElement?.startsWith('::view-transition'));
    anims.forEach(a => a.pause());
    const ready = img.decode().catch(() => {});
    const timeout = new Promise(r => setTimeout(r, MAX_WAIT));
    Promise.race([ready, timeout]).then(() => anims.forEach(a => a.play()));
  }, () => {});
});
