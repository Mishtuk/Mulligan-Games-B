// Runs in <head> before first paint: sets the Motion state on <html> and marks that JavaScript is available.
(() => {
  const root = document.documentElement;
  root.classList.add('js');
  let saved = null;
  try { saved = localStorage.getItem('motion'); } catch { /* blocked storage: follow the device */ }
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  root.dataset.motion = reduce || saved === 'off' ? 'off' : 'on';
})();
