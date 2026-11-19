// Pure hours and "today" helpers (no DOM). Shared by the browser (public/js/*.js import /js/hours.js), Astro (src/lib/hours.js
// re-exports this file) and node:test. Everything is computed in the store's time zone, never the visitor's or the machine's.
export const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const mins = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };

// "14:00" -> "2pm", "22:30" -> "10:30pm", "24:00" -> "midnight", "12:00" -> "noon"
export function fmtTime(t) {
  if (t === '24:00' || t === '00:00') return 'midnight';
  if (t === '12:00') return 'noon';
  const [h, m] = t.split(':').map(Number);
  return `${h % 12 || 12}${m ? ':' + String(m).padStart(2, '0') : ''}${h < 12 ? 'am' : 'pm'}`;
}

// "Now" as a wall clock in the store's zone: day 0=Sun..6=Sat, date YYYY-MM-DD, min = minutes since local midnight.
export function zoned(tz, now = new Date()) {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-CA', {
    timeZone: tz, hourCycle: 'h23', weekday: 'short', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
  }).formatToParts(now).map((x) => [x.type, x.value]));
  return { day: DAY_SHORT.indexOf(p.weekday), date: `${p.year}-${p.month}-${p.day}`, min: +p.hour * 60 + +p.minute };
}

// store.json hours array -> {0..6: {open, close} | null}
export function toWeek(hours) {
  const week = {};
  for (let d = 0; d < 7; d++) week[d] = null;
  for (const h of hours) week[h.day] = h.closed || !h.open ? null : { open: h.open, close: h.close };
  return week;
}

// Is the store open now, and what do we say. close "24:00" = midnight (no hours run past midnight).
export function openState(week, tz, now = new Date()) {
  const z = zoned(tz, now), h = week[z.day];
  if (h && z.min >= mins(h.open) && z.min < mins(h.close)) {
    return { open: true, day: z.day, text: `Open now, until ${fmtTime(h.close)}` };
  }
  if (h && z.min < mins(h.open)) return { open: false, day: z.day, text: `Opens today ${fmtTime(h.open)}` };
  for (let i = 1; i <= 7; i++) {
    const d = (z.day + i) % 7, n = week[d];
    if (n) return { open: false, day: z.day, text: `Opens ${DAY_SHORT[d]} ${fmtTime(n.open)}` };
  }
  return { open: false, day: z.day, text: 'Hours' };
}

// Hours row as text: "2pm to midnight" or "Closed"
export function hoursText(h) { return h ? `${fmtTime(h.open)} to ${fmtTime(h.close)}` : 'Closed'; }

const shown = (e) => e.date !== null && e.date !== undefined && !/^Unverified/i.test(e.certainty ?? '');
export const byTime = (a, b) => mins(a.time) - mins(b.time);

// Tonight's events: weekly rows for the store-zone weekday, plus dated one-offs for that date. Sorted by time.
export function eventsToday(events, tz, now = new Date()) {
  const z = zoned(tz, now);
  const weekly = events.weekly.filter((e) => e.day === z.day).map((e) => ({ ...e, label: e.format }));
  const once = events.oneoffs.filter((e) => shown(e) && e.date === z.date).map((e) => ({ ...e, label: e.title }));
  return [...weekly, ...once].sort(byTime);
}

const addDays = (date, n) => {
  const [y, m, d] = date.split('-').map(Number), t = new Date(Date.UTC(y, m - 1, d + n));
  return { date: t.toISOString().slice(0, 10), day: t.getUTCDay(), month: t.getUTCMonth(), dom: t.getUTCDate() };
};

// First event after "now" within 14 days (weekly rows repeat; dated one-offs count; unverified or undated one-offs never).
export function nextEvent(events, tz, now = new Date()) {
  const z = zoned(tz, now);
  for (let i = 0; i <= 14; i++) {
    const t = addDays(z.date, i);
    const rows = [
      ...events.weekly.filter((e) => e.day === t.day).map((e) => ({ ...e, label: e.format })),
      ...events.oneoffs.filter((e) => shown(e) && e.date === t.date).map((e) => ({ ...e, label: e.title })),
    ].filter((e) => i > 0 || mins(e.time) > z.min).sort(byTime);
    if (rows.length) {
      const e = rows[0];
      return { offset: i, date: t.date, time: e.time, label: e.label,
        text: `${DAY_SHORT[t.day]} ${MONTH_SHORT[t.month]} ${t.dom} at ${fmtTime(e.time)}: ${e.label}` };
    }
  }
  return null;
}
