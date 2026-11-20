// Motion switch and Menu sheet (every page).
(() => {
  const root = document.documentElement, btn = document.getElementById('motion');
  const rq = matchMedia('(prefers-reduced-motion: reduce)');
  const saved = () => { try { return localStorage.getItem('motion'); } catch { return null; } };
  if (btn) {
    const sync = () => {
      const device = rq.matches, on = !device && root.dataset.motion === 'on';
      btn.textContent = `Motion: ${on ? 'on' : 'off'}`;
      if (device) { const s = document.createElement('span'); s.className = 'vh'; s.textContent = ' (device setting)'; btn.append(s); }
      btn.setAttribute('aria-pressed', String(on));
      btn.disabled = device;
      dispatchEvent(new Event('motionchange'));
    };
    btn.addEventListener('click', () => {
      root.dataset.motion = root.dataset.motion === 'on' ? 'off' : 'on';
      try { localStorage.setItem('motion', root.dataset.motion); } catch { /* storage blocked */ }
      sync();
    });
    rq.addEventListener('change', () => { root.dataset.motion = rq.matches || saved() === 'off' ? 'off' : 'on'; sync(); });
    sync();
  }

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
