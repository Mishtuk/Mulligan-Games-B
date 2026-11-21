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
