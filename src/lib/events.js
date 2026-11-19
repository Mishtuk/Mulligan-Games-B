// Pure helpers for the Events page and its .ics files. No DOM, no Astro. Times are the store's wall clock (America/New_York).
import { zoned, DAY_SHORT, fmtTime } from './hours.js';

// events.json "game" labels -> games.json ids (the filter chips and the ?game= links use the ids).
const GAME_IDS = { Magic: 'magic', Pokemon: 'pokemon', 'One Piece': 'one-piece', Riftbound: 'riftbound', Hololive: 'hololive', Tabletop: 'tabletop', 'D&D': 'dnd' };
export const gameId = (name) => GAME_IDS[name] ?? 'other';

// Rows we may show: Unverified rows never appear.
export const isShown = (e) => !/^Unverified/i.test(e.certainty ?? '');
export const isLikely = (e) => /^Likely/i.test(e.certainty ?? '');

// Dated one-offs that are not before `today` (YYYY-MM-DD, store zone), soonest first.
export const upcomingOneoffs = (oneoffs, today) =>
  oneoffs.filter((e) => e.date && isShown(e) && e.date >= today).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));

// Sign-up nights that are not before `today` (YYYY-MM-DD, store zone). The seed is made by hand (tools/seed-events.mjs), so a stale
// build must never offer nights that have passed.
export const upcomingSignup = (nights, today) => nights.filter((e) => e.date >= today);

// ---- iCalendar (RFC 5545) ----
export const TZID = 'America/New_York';
const VTIMEZONE = ['BEGIN:VTIMEZONE', `TZID:${TZID}`,
  'BEGIN:DAYLIGHT', 'TZOFFSETFROM:-0500', 'TZOFFSETTO:-0400', 'TZNAME:EDT', 'DTSTART:19700308T020000', 'RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU', 'END:DAYLIGHT',
  'BEGIN:STANDARD', 'TZOFFSETFROM:-0400', 'TZOFFSETTO:-0500', 'TZNAME:EST', 'DTSTART:19701101T020000', 'RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU', 'END:STANDARD',
  'END:VTIMEZONE'];

// TEXT value: backslash, semicolon, comma escaped; newline -> \n; other control characters dropped (also the injection defence).
export const icsText = (s) => String(s ?? '').replace(/\r\n|\r|\n/g, '\n').replace(/[\u0000-\u0009\u000b-\u001f\u007f]/g, '')
  .replace(/[\\;,]/g, '\\$&').replace(/\n/g, '\\n');

// Fold at 75 octets (bytes), never inside a UTF-8 sequence; a continuation line starts with one space (which counts as an octet).
export function fold(line) {
  const enc = new TextEncoder(), out = [];
  let cur = '', n = 0, max = 75;
  for (const ch of line) {
    const w = enc.encode(ch).length;
    if (n + w > max) { out.push(cur); cur = ''; n = 0; max = 74; }
    cur += ch; n += w;
  }
  out.push(cur);
  return out.join('\r\n ');
}

const compact = (d) => d.replaceAll('-', '');
const local = (date, time) => `${compact(date)}T${time.replace(':', '')}00`;
const stamp = (now) => new Date(now).toISOString().replace(/[-:]|\.\d{3}/g, '');
const plus = (date, n) => { const [y, m, d] = date.split('-').map(Number); return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10); };

// First date on or after the store-zone date of `now` that falls on weekday `day` (0=Sun).
export function nextWeekday(day, tz, now) {
  const z = zoned(tz, new Date(now));
  return plus(z.date, (day - z.day + 7) % 7);
}

// One event -> a full VCALENDAR text. Weekly rows repeat with RRULE:FREQ=WEEKLY; one-offs do not. No DTEND: the data has no end times
// and we do not invent them.
export function eventIcs(e, { now = Date.now(), tz = TZID, place = '', host = 'mulligan-games' } = {}) {
  const weekly = e.day !== undefined && !e.date;
  const date = weekly ? nextWeekday(e.day, tz, now) : e.date;
  const title = weekly ? e.format : e.title;
  const note = [e.fee === null || e.fee === undefined ? 'Fee: ask the store.' : `Fee: $${e.fee}.`,
    isLikely(e) ? 'Listed publicly, not yet confirmed. Confirm with the store.' : ''].filter(Boolean).join(' ');
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', `PRODID:-//${icsText(host)}//game nights//EN`, 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', ...VTIMEZONE,
    'BEGIN:VEVENT', `UID:${icsText(e.id)}@${host}`, `DTSTAMP:${stamp(now)}`, `DTSTART;TZID=${TZID}:${local(date, e.time)}`,
    ...(weekly ? ['RRULE:FREQ=WEEKLY'] : []),
    `SUMMARY:${icsText(`${title} (${e.game})`)}`, ...(place ? [`LOCATION:${icsText(place)}`] : []),
    `DESCRIPTION:${icsText(note)}`, 'END:VEVENT', 'END:VCALENDAR'];
  return lines.map(fold).join('\r\n') + '\r\n';
}

// Label parts for one-off date blocks, from a YYYY-MM-DD string (no time zone maths needed).
export function dateParts(date) {
  const [y, m, d] = date.split('-').map(Number), t = new Date(Date.UTC(y, m - 1, d));
  return { dom: String(d), mon: t.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' }), dow: DAY_SHORT[t.getUTCDay()] };
}

// Sign-up <option> text: "Draft FNM, Fri Nov 20, 7pm". Rows come from src/data/signup-events.json (tools/seed-events.mjs), same ids as the D1 seed.
export function signupLabel(e) {
  const p = dateParts(e.date);
  return `${e.title}, ${p.dow} ${p.mon} ${p.dom}, ${fmtTime(e.time)}`;
}
