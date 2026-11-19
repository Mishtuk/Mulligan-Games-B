// Open chip: "Open now, until 10pm" / "Opens Wed 2pm", from the hours JSON in the page, in the store's time zone.
import { toWeek, openState } from '/js/hours.js';

const data = document.getElementById('hours-data');
if (data) {
  try {
    const { tz, hours } = JSON.parse(data.textContent), week = toWeek(hours);
    const run = () => {
      const s = openState(week, tz);
      for (const chip of document.querySelectorAll('[data-open-chip]')) {
        chip.classList.toggle('is-open', s.open);
        chip.querySelector('.chip-text').textContent = s.text;
        chip.removeAttribute('data-off');
      }
    };
    run();
    document.addEventListener('visibilitychange', () => { if (!document.hidden) run(); });
  } catch { /* leave the "Hours" link */ }
}
