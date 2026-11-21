// Product page: the status line is built at deploy time; this refreshes it in the store's zone (same words as src/lib/product.js productStatus).
import { zoned } from '/js/hours.js';
import { readJson } from '/js/form-state.js';
import { fmtDate, isOut } from '/js/releases.js';
const hours = readJson('hours-data'), el = document.querySelector('[data-status-line]');
if (hours && el) {
  const t = zoned(hours.tz).date, d = el.dataset.release, p = el.dataset.prerelease;
  el.textContent = isOut(d, t) ? `Out now. In store since ${fmtDate(d, t)}` : `In store ${fmtDate(d, t)}${p ? `. Prerelease ${fmtDate(p, t)}` : ''}`;
}
