// Runs in <head> before first paint: marks that JavaScript is available.
// Motion follows the device setting (prefers-reduced-motion) in CSS alone; there is no site switch.
(() => {
  document.documentElement.classList.add('js');
  try { localStorage.removeItem('motion'); } catch { /* blocked storage: nothing to clear */ }
})();
