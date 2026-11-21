// Release status in the store's zone; Instagram posts load only after a tap.
import { zoned } from '/Mulligan-Games-B/js/hours.js';
import { readJson } from '/Mulligan-Games-B/js/form-state.js';
import { releaseLabel, releaseChip, dateLine, isStale, isOut } from '/Mulligan-Games-B/js/releases.js';
const hours = readJson('hours-data');
if (hours) {
  const t = zoned(hours.tz).date;
  for (const el of document.querySelectorAll('[data-release]')) {
    const d = el.dataset.release, w = el.querySelector('[data-when]');
    el.hidden = isStale(d, t);
    const st = el.querySelector('[data-status]'), ch = el.querySelector('[data-chip]');
    if (st) st.textContent = releaseLabel(d, t);
    if (ch) ch.textContent = releaseChip(d, t);
    for (const s of el.querySelectorAll('[data-if]')) s.hidden = (s.dataset.if === 'out') !== isOut(d, t);
    if (w) w.textContent = dateLine(d, t);
  }
  // every release stale: no lonely "New releases" heading
  const sec = document.querySelector('.home-releases');
  if (sec) sec.hidden = ![...sec.querySelectorAll('[data-release]')].some((e) => !e.hidden);
}
for (const a of document.querySelectorAll('a[data-ig]')) {
  const b = document.createElement('button');
  b.type = 'button'; b.className = a.className; b.textContent = a.textContent;
  const li = a.closest('li');
  b.onclick = () => {
    const f = document.createElement('iframe');
    f.src = `https://www.instagram.com/p/${a.dataset.ig}/embed`; f.className = 'ig-frame'; f.referrerPolicy = 'strict-origin';
    f.title = `${li.querySelector('h3').textContent}, Instagram post`;
    f.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox');
    const x = document.createElement('button');
    x.type = 'button'; x.className = 'btn btn-ghost'; x.textContent = 'Hide this post';
    const hide = () => { f.remove(); x.remove(); b.hidden = false; b.focus(); };
    x.onclick = hide; li.onkeydown = (e) => e.key === 'Escape' && f.isConnected && hide();
    b.hidden = true; b.after(f, x); x.focus();
  };
  a.replaceWith(b);
}
