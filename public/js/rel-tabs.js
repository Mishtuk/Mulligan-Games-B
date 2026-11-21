// Home: top release tabs (no timer) and the New releases rotation. Rules live in rel-logic.js. Stale releases (home-live.js sets hidden on them first) are removed before init.
import { ROTATE_MS, step, tabKey, shouldRun, startsPaused, slideLabel, dotLabel } from '/js/rel-logic.js';

const top = document.querySelector('.top-rel'), sec = document.querySelector('.home-releases');
for (const el of document.querySelectorAll('.top-rel [data-release][hidden], .rel-slide[hidden]')) {
  top?.querySelector(`[data-tab="${el.dataset.panel}"]`)?.closest('li')?.remove();
  el.remove();
}

// 1. Tabs: links become roving-tabindex tabs; arrows, Home and End select (panels are static, so selecting is free).
if (top) {
  const list = top.querySelector('.tr-tabs'), tabs = [...top.querySelectorAll('[data-tab]')], panels = tabs.map((t) => top.querySelector(`[data-panel="${t.dataset.tab}"]`));
  if (!tabs.length) top.hidden = true;
  else {
    list.setAttribute('role', 'tablist');
    list.querySelectorAll('li').forEach((li) => li.setAttribute('role', 'presentation'));
    const pick = (i, focus) => {
      tabs.forEach((t, k) => { t.setAttribute('aria-selected', String(k === i)); t.tabIndex = k === i ? 0 : -1; panels[k].toggleAttribute('data-active', k === i); });
      if (focus) tabs[i].focus();
      tabs[i].scrollIntoView?.({ block: 'nearest', inline: 'nearest' });
    };
    tabs.forEach((t, k) => {
      t.setAttribute('role', 'tab'); t.setAttribute('aria-controls', panels[k].id);
      panels[k].setAttribute('role', 'tabpanel'); panels[k].setAttribute('aria-labelledby', t.id);
      t.addEventListener('click', (e) => { e.preventDefault(); pick(k, false); });
    });
    list.addEventListener('keydown', (e) => {
      const i = tabs.indexOf(document.activeElement), j = i < 0 ? null : tabKey(e.key, i, tabs.length);
      if (j !== null) { e.preventDefault(); pick(j, true); }
    });
    pick(0, false);
  }
}

// 2. Rotation
const car = sec?.querySelector('.rel-car');
if (car) {
  const slides = [...car.querySelectorAll('.rel-slide')], n = slides.length;
  const track = car.querySelector('.rel-track'), pp = car.querySelector('.rel-pp'), pos = car.querySelector('.rel-pos');
  const dotsUl = car.querySelector('.rel-dots'), dots = [...dotsUl.querySelectorAll('button')];
  dots.slice(n).forEach((d) => d.closest('li').remove());
  const mq = matchMedia('(prefers-reduced-motion: reduce)');
  const s = { i: 0, paused: startsPaused(mq.matches), hover: false, focus: false, hidden: document.hidden, reduced: mq.matches };
  let timer = null;
  const show = (i, manual) => {
    s.i = i;
    track.setAttribute('aria-live', manual ? 'polite' : 'off'); // announced once, only for a visitor's own change
    slides.forEach((el, k) => {
      const on = k === i;
      el.toggleAttribute('data-active', on); el.toggleAttribute('inert', !on);
      if (on) el.removeAttribute('aria-hidden'); else el.setAttribute('aria-hidden', 'true');
      el.setAttribute('aria-label', slideLabel(k, n, el.dataset.name));
    });
    dots.slice(0, n).forEach((d, k) => { d.setAttribute('aria-label', dotLabel(k, slides[k].dataset.name)); k === i ? d.setAttribute('aria-current', 'true') : d.removeAttribute('aria-current'); });
    pos.textContent = `${i + 1} of ${n}`;
  };
  const tick = () => { clearInterval(timer); timer = shouldRun({ ...s, n }) ? setInterval(() => show(step(s.i, n), false), ROTATE_MS) : null; };
  const label = () => { pp.textContent = s.paused ? 'Play' : 'Pause'; pp.dataset.state = s.paused ? 'play' : 'pause'; pp.disabled = s.reduced; };
  const go = (i) => { show(i, true); tick(); };
  car.querySelector('.rel-prev').onclick = () => go(step(s.i, n, -1));
  car.querySelector('.rel-next').onclick = () => go(step(s.i, n, 1));
  dots.slice(0, n).forEach((d, k) => { d.onclick = () => go(k); });
  pp.onclick = () => { s.paused = !s.paused; label(); tick(); };
  car.addEventListener('pointerenter', (e) => { if (e.pointerType !== 'touch') { s.hover = true; tick(); } });
  car.addEventListener('pointerleave', () => { s.hover = false; tick(); });
  sec.addEventListener('focusin', () => { s.focus = true; tick(); });
  sec.addEventListener('focusout', (e) => { if (!sec.contains(e.relatedTarget)) { s.focus = false; tick(); } });
  document.addEventListener('visibilitychange', () => { s.hidden = document.hidden; tick(); });
  mq.addEventListener('change', () => { s.reduced = mq.matches; if (s.reduced) s.paused = true; label(); tick(); });
  if (n < 2) car.querySelector('.rel-ctl').hidden = true;
  show(0, false); label(); tick();
}
