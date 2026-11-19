// Visit page: mark today's row in the hours table (store time zone, not the visitor's).
import { zoned } from '/js/hours.js';

const read = (id) => { try { return JSON.parse(document.getElementById(id)?.textContent ?? 'null'); } catch { return null; } };
const data = read('hours-data');

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
