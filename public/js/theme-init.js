// Runs in <head> before first paint (external, blocking, no inline script): dark is the default; a saved choice wins.
// Storage is in try/catch, so if it is blocked the page just stays dark. CSS reads data-theme for colours and color-scheme.
(() => {
  let t = 'dark';
  try { const s = localStorage.getItem('mg-theme'); if (s === 'light' || s === 'dark') t = s; } catch { /* blocked storage: stay dark */ }
  const d = document.documentElement;
  d.setAttribute('data-theme', t);
  d.style.colorScheme = t;
  const m = document.querySelector('meta[name="theme-color"]');
  if (m) m.setAttribute('content', t === 'light' ? '#FAF8FF' : '#120B1E');
})();
