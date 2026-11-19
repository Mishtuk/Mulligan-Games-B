// "Today" in the store's time zone: Tonight strip, binder pocket, hours list, Visit block.
import { toWeek, zoned, eventsToday, nextEvent, hoursText, DAYS } from '/js/hours.js';
import { readJson } from '/js/form-state.js';

const hoursData = readJson('hours-data'), eventsData = readJson('events-data');

function run() {
  if (!hoursData) return;
  const tz = hoursData.tz, week = toWeek(hoursData.hours), z = zoned(tz);

  // Binder pockets
  for (const p of document.querySelectorAll('[data-pocket-day]')) {
    const today = Number(p.dataset.pocketDay) === z.day;
    p.toggleAttribute('data-today', today);
    p.querySelector('.pocket-flag')?.toggleAttribute('hidden', !today);
  }

  // Hours list rows
  for (const row of document.querySelectorAll('.hours [data-day]')) {
    if (Number(row.dataset.day) === z.day) row.setAttribute('aria-current', 'date'); else row.removeAttribute('aria-current');
  }

  // Visit block "today" line
  for (const el of document.querySelectorAll('[data-today-hours]')) {
    el.textContent = `${DAYS[z.day]}: ${hoursText(week[z.day])}`;
  }

  // Tonight strip
  const box = document.querySelector('[data-tonight]');
  if (box && eventsData) {
    const rows = eventsToday(eventsData, tz);
    const all = box.querySelector('details');
    if (all) { all.open = true; }
    const lab = box.querySelector('[data-day-label]');
    lab.textContent = DAYS[z.day]; lab.hidden = false;
    const ids = new Set(rows.map((r) => r.id));
    for (const li of box.querySelectorAll('[data-event-id]')) li.hidden = !ids.has(li.dataset.eventId);
    for (const g of box.querySelectorAll('[data-day-group]')) g.hidden = !g.querySelector('[data-event-id]:not([hidden])');
    const empty = box.querySelector('[data-empty]');
    if (empty) {
      empty.hidden = rows.length > 0;
      if (!rows.length) {
        const n = nextEvent(eventsData, tz);
        empty.querySelector('[data-next]').textContent = n ? `Next up: ${n.text}.` : 'Ask at the counter.';
      }
    }
    box.dataset.ready = '';
  }
}
run();
document.addEventListener('visibilitychange', () => { if (!document.hidden) run(); });
