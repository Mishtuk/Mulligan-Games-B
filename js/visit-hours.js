// Visit page: mark today's row in the hours table (store time zone, not the visitor's).
import { zoned } from '/Mulligan-Games-B/js/hours.js';
import { readJson } from '/Mulligan-Games-B/js/form-state.js';

const data = readJson('hours-data');

function run() {
  if (!data) return;
  const today = zoned(data.tz).day;
  for (const row of document.querySelectorAll('.hours-table [data-day]')) {
    const is = Number(row.dataset.day) === today;
    if (is) row.setAttribute('aria-current', 'date'); else row.removeAttribute('aria-current');
    row.querySelector('.today-chip')?.toggleAttribute('hidden', !is);
  }
}
run();
document.addEventListener('visibilitychange', () => { if (!document.hidden) run(); });
