// Menu sheet (every page).
(() => {
  const menu = document.getElementById('menu-btn'), sheet = document.getElementById('menu-sheet');
  if (menu && sheet) {
    const behind = document.querySelectorAll('main, .site-footer'); // inert while open
    const set = (open) => { sheet.toggleAttribute('data-open', open); menu.setAttribute('aria-expanded', String(open)); behind.forEach((el) => el.toggleAttribute('inert', open)); };
    menu.addEventListener('click', () => set(!sheet.hasAttribute('data-open')));
    const header = document.querySelector('.site-header');
    header.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && sheet.hasAttribute('data-open')) { set(false); menu.focus(); }
      if (e.key === 'Tab' && !e.shiftKey && sheet.hasAttribute('data-open') && e.target === sheet.lastElementChild) set(false);
    });
    // Focus or a click leaving the header closes the sheet, so it never hangs open over the page behind it.
    header.addEventListener('focusout', (e) => { if (e.relatedTarget && !header.contains(e.relatedTarget)) set(false); });
    document.addEventListener('click', (e) => { if (!header.contains(e.target)) set(false); });
    matchMedia('(min-width: 820px)').addEventListener('change', (e) => { if (e.matches) set(false); });
  }
})();

// Theme toggle: one button, the icon and name show the mode you will get. Saves the choice in this browser (key mg-theme).
(() => {
  const btn = document.querySelector('.theme-toggle');
  if (!btn) return;
  const root = document.documentElement;
  const label = () => { const n = root.getAttribute('data-theme') === 'light' ? 'Switch to dark mode' : 'Switch to light mode'; btn.setAttribute('aria-label', n); btn.title = n; };
  label();
  btn.addEventListener('click', () => {
    const t = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    root.setAttribute('data-theme', t);
    root.style.colorScheme = t;
    const m = document.querySelector('meta[name="theme-color"]');
    if (m) m.setAttribute('content', t === 'light' ? '#FAF8FF' : '#120B1E');
    try { localStorage.setItem('mg-theme', t); } catch { /* blocked storage: the choice lasts until reload */ }
    label();
  });
})();
