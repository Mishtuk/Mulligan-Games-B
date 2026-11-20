// Shop Sealed (out) and Preorders (coming) in the store's zone, as Home does: on a build older than today a set that is out
// moves from Preorders to Sealed (date line, hold line and drawn shape follow) and a set 90 days past release hides.
import { zoned } from '/Mulligan-Games-B/js/hours.js';
import { readJson } from '/Mulligan-Games-B/js/form-state.js';
import { shownReleases, dateLine, isOut } from '/Mulligan-Games-B/js/releases.js';
const hours = readJson('hours-data');
const lists = { out: document.querySelector('#sealed ul'), soon: document.querySelector('#preorders ul') };
if (hours && lists.out && lists.soon) {
  const t = zoned(hours.tz).date, pockets = [...document.querySelectorAll('#stock [data-release]')];
  for (const el of pockets) el.hidden = true; // stale sets stay hidden
  for (const { el, releaseDate: d } of shownReleases(pockets.map((el) => ({ el, releaseDate: el.dataset.release })), t)) {
    const out = isOut(d, t), a = el.querySelector('[data-hold]');
    el.hidden = false;
    el.classList.toggle('pocket-sealed', out); el.classList.toggle('pocket-preorder', !out);
    el.querySelector('.box-sil')?.classList.toggle('is-pack', !out);
    el.querySelector('[data-when]').textContent = dateLine(d, t);
    a.dataset.line = out ? a.dataset.lineOut : a.dataset.lineSoon;
    lists[out ? 'out' : 'soon'].append(el); // shownReleases order: newest out first, then soonest coming
  }
  for (const ul of Object.values(lists)) { // an emptied column shows its "Nothing ... yet" line
    const any = pockets.some((el) => el.parentNode === ul && !el.hidden);
    ul.hidden = !any; ul.nextElementSibling.hidden = any;
  }
}
