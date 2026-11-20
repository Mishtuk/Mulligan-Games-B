// Release status in the store's zone; Instagram posts load only after a tap.
import { zoned } from '/js/hours.js';
import { readJson } from '/js/form-state.js';
import { releaseLabel, isStale, isOut, fmtDate } from '/js/releases.js';
const hours = readJson('hours-data');
if (hours) {
  const t = zoned(hours.tz).date;
  for (const el of document.querySelectorAll('[data-release]')) {
    const d = el.dataset.release, w = el.querySelector('[data-when]');
    el.hidden = isStale(d, t);
    el.querySelector('[data-status]').textContent = releaseLabel(d, t);
    for (const s of el.querySelectorAll('[data-if]')) s.hidden = (s.dataset.if === 'out') !== isOut(d, t);
    if (w) { w.hidden = !isOut(d, t); w.textContent = ` · Released ${fmtDate(d, t)}`; }
  }
}
for (const a of document.querySelectorAll('a[data-ig]')) {
  const b = document.createElement('button');
  b.type = 'button'; b.className = a.className; b.textContent = a.textContent;
  b.onclick = () => {
    const f = document.createElement('iframe');
    f.src = `https://www.instagram.com/p/${a.dataset.ig}/embed`; f.loading = 'lazy'; f.className = 'ig-frame';
    f.title = `Instagram post: ${a.dataset.title}`;
    f.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox');
    b.replaceWith(f); f.focus();
  };
  a.replaceWith(b);
}
