import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { fold, icsText, eventIcs, nextWeekday, upcomingOneoffs, gameId, signupLabel, dateParts, upcomingSignup } from '../src/lib/events.js';

import { seedEvents, seedSql, localToUtc } from '../src/lib/seed-events.js';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const events = JSON.parse(read('src/data/events.json'));
const unfold = (s) => s.replace(/\r\n /g, '');
// 2026-11-19 20:00 New York (Thursday, EST) = 2026-11-20 01:00 UTC. Fixed "now" so no test depends on the machine clock or zone.
const NOW = Date.UTC(2026, 10, 20, 1, 0, 0);

test('ics text escaping: backslash, semicolon, comma, newline; control characters dropped', () => {
  assert.equal(icsText('a,b;c\\d\ne'), 'a\\,b\\;c\\\\d\\n' + 'e');
  assert.equal(icsText('x\u0000y\u0007z'), 'xyz');
});

test('ics folding: 75 octets, UTF-8 never split, unfold restores', () => {
  const long = 'SUMMARY:' + 'café ☃ '.repeat(30);
  const out = fold(long);
  for (const l of out.split('\r\n')) assert.ok(new TextEncoder().encode(l).length <= 75, l);
  assert.ok(out.includes('\r\n '));
  assert.equal(unfold(out), long);
  assert.equal(fold('SHORT:line'), 'SHORT:line');
});

test('weekly .ics: CRLF only, final CRLF, 75 octets, TZID + VTIMEZONE, RRULE weekly, balanced', () => {
  const e = events.weekly.find((x) => x.id === 'fri-1900-draft-fnm');
  const s = eventIcs(e, { now: NOW, place: '445 York Road, Warminster, PA 18974' });
  assert.ok(s.endsWith('\r\n'));
  assert.doesNotMatch(s.replace(/\r\n/g, ''), /[\r\n]/);
  for (const l of s.split('\r\n')) assert.ok(new TextEncoder().encode(l).length <= 75);
  const u = unfold(s);
  assert.match(u, /^BEGIN:VCALENDAR\r\nVERSION:2\.0\r\n/);
  assert.match(u, /BEGIN:VTIMEZONE\r\nTZID:America\/New_York\r\n/);
  assert.match(u, /DTSTART;TZID=America\/New_York:20261120T190000\r\n/); // next Friday after Thu 19 Nov
  assert.match(u, /RRULE:FREQ=WEEKLY\r\n/);
  assert.ok(u.includes('LOCATION:445 York Road\\, Warminster\\, PA 18974\r\n'));
  assert.match(u, /SUMMARY:Draft FNM \(Magic\)\r\n/);
  assert.doesNotMatch(u, /DTEND/);
  const n = (re) => (u.match(re) ?? []).length;
  assert.equal(n(/^BEGIN:/gm), n(/^END:/gm));
});

test('one-off .ics: fixed date, no RRULE in the event', () => {
  const e = events.oneoffs.find((x) => x.date === '2026-11-21');
  const u = unfold(eventIcs(e, { now: NOW }));
  assert.match(u, /DTSTART;TZID=America\/New_York:20261121T140000/);
  const ev = u.slice(u.indexOf('BEGIN:VEVENT'));
  assert.doesNotMatch(ev, /RRULE/);
});

test('hostile title cannot add properties', () => {
  const u = unfold(eventIcs({ id: 'x', date: '2026-12-01', time: '19:00', title: 'A\r\nATTENDEE:mailto:x@y.z\r\nEND:VEVENT', game: 'Magic', fee: 5, certainty: 'Confirmed' }, { now: NOW }));
  assert.doesNotMatch(u, /^ATTENDEE:/m);
  assert.equal((u.match(/^END:VEVENT/gm) ?? []).length, 1);
});

test('next weekday is computed in the store zone', () => {
  assert.equal(nextWeekday(4, 'America/New_York', NOW), '2026-11-19'); // Thursday evening in NY is still Thursday, though UTC says Friday
  assert.equal(nextWeekday(1, 'America/New_York', NOW), '2026-11-23');
});

test('every shown event has an .ics route id, ids are url-safe', () => {
  for (const e of [...events.weekly, ...events.oneoffs.filter((x) => x.date)]) assert.match(e.id, /^[a-z0-9-]+$/);
});

test('special nights: past and undated dropped, Unverified hidden', () => {
  assert.deepEqual(upcomingOneoffs(events.oneoffs, '2026-11-22').map((e) => e.date), ['2026-11-28']);
  assert.equal(upcomingOneoffs(events.oneoffs, '2026-11-01').length, 2);
  assert.equal(upcomingOneoffs(events.oneoffs, '2030-01-01').length, 0);
});

test('game ids match games.json; dateParts', () => {
  const ids = JSON.parse(read('src/data/games.json')).map((g) => g.id);
  for (const e of [...events.weekly, ...events.oneoffs]) assert.ok(ids.includes(gameId(e.game)), e.game);
  assert.deepEqual(dateParts('2026-11-21'), { dom: '21', mon: 'Nov', dow: 'Sat' });
});

test('sign-up select mirrors the D1 seed in schema.sql (both generated from events.json); form uses the Worker field names', () => {
  const sql = read('schema.sql'), signup = JSON.parse(read('src/data/signup-events.json'));
  const rows = seedEvents(events.weekly, signup.from);
  assert.ok(sql.includes(seedSql(rows, signup.from)), 'schema.sql seed is stale: run node tools/seed-events.mjs ' + signup.from);
  assert.deepEqual(signup.events, rows.map(({ id, title, date, time, seats }) => ({ id, title, date, time, seats })));
  assert.deepEqual([...new Set(rows.map((r) => r.title + ' ' + r.seats))].sort(), ['Draft 16', 'Draft FNM 28', 'Pauper Night 28']);
  assert.equal(rows.length, 12);
  assert.deepEqual(rows.map((r) => r.id), rows.map((_, i) => i + 1));
  assert.equal(signupLabel(signup.events[0]), 'Draft FNM, Fri Nov 20, 7pm');
  assert.match(read('src/pages/events/index.astro'), /nights\.map/);
  const page = read('src/pages/events/index.astro');
  assert.match(page, /action="\/api\/signup"/);
  for (const n of ['name="event_id"', 'name="name"', 'name="email"', 'name="players_note"', 'name="website"']) assert.ok(page.includes(n), n);
  assert.match(page, /id="signup"/);
  assert.doesNotMatch(page, /<script(?![^>]*(src=|application\/json))[^>]*>/);
});

test('events page: day ids, Likely note, age line, no inline handlers; css has no colour literals', () => {
  const page = read('src/pages/events/index.astro');
  assert.match(page, /id=\{x\.slug\}/);
  assert.match(page, /Nights and fees come from public listings\. Confirm with the store\./);
  assert.match(page, /Bring a grown-up \(confirm with the store\)/);
  assert.doesNotMatch(page, /<[a-z][^>]*\son[a-z]+\s*=/i);
  assert.doesNotMatch(read('src/styles/events.css').replace(/:root\s*\{[^}]*\}/, ''), /#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(/);
  const js = read('public/js/events.js');
  assert.match(js, /from '\/js\/hours\.js'/);
});

test('built output (when dist exists): every day section and one .ics per weekly row', { skip: !fs.existsSync(path.join(root, 'dist/events/index.html')) }, () => {
  const html = read('dist/events/index.html');
  for (const d of ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']) assert.match(html, new RegExp(`id="${d}"`));
  for (const e of events.weekly) assert.ok(fs.existsSync(path.join(root, `dist/events/${e.id}.ics`)), e.id);
  assert.doesNotMatch(html, /Second Saturday Summoner/);
});

test('seed times: New York wall clock to UTC across winter and summer', () => {
  assert.equal(localToUtc('2026-11-20', '19:00'), '2026-11-21 00:00');
  assert.equal(localToUtc('2026-07-10', '19:00'), '2026-07-10 23:00');
  assert.equal(localToUtc('2026-03-08', '19:00'), '2026-03-08 23:00');
});

test('pairings sheet ships Wed..Tue and the script rotates from today; closed days are one line', () => {
  const page = read('src/pages/events/index.astro'), js = read('public/js/events.js');
  assert.match(page, /const order = \[3, 4, 5, 6, 0, 1, 2\]/);
  assert.match(page, /day-closed/);
  assert.match(js, /dataset\.ahead/);
});

test('sign-up never offers past nights: filtered at build (America/New_York) and in the browser, honest empty state', () => {
  const nights = JSON.parse(read('src/data/signup-events.json')).events;
  const first = nights[0].date, last = nights.at(-1).date;
  assert.equal(upcomingSignup(nights, first).length, nights.length);
  assert.equal(upcomingSignup(nights, '2026-11-21').every((e) => e.date >= '2026-11-21'), true);
  assert.ok(upcomingSignup(nights, '2026-11-21').length < nights.length);
  assert.deepEqual(upcomingSignup(nights, last).map((e) => e.date), [last]); // the night itself is still offered
  assert.deepEqual(upcomingSignup(nights, '2099-01-01'), []); // every seeded night stale: nothing offered
  const page = read('src/pages/events/index.astro'), js = read('public/js/events.js');
  assert.match(page, /upcomingSignup\(signup\.events, zoned\(store\.timezone\)\.date\)/);
  assert.match(page, /Sign-ups for the next nights open soon\. Just turn up, or ask at the counter\./);
  assert.match(page, /data-date=\{e\.date\}/);
  assert.match(js, /o\.dataset\.date < today/);
  assert.match(js, /zoned\(tz\)\.date/);
  assert.match(page, /hidden=\{nights\.length === 0\}/);
});

test('sign-up sheet is a clipboard: clip, SIGN-UP SHEET mono label, still a labelled form; day anchors re-scroll after the reorder', () => {
  const page = read('src/pages/events/index.astro'), css = read('src/styles/events.css'), js = read('public/js/events.js');
  assert.match(page, /class="clip" aria-hidden="true"/);
  assert.match(page, /class="sheet-label mono">Sign-up sheet</);
  assert.match(page, /<label for="su-name">/);
  assert.doesNotMatch(css.slice(css.indexOf('/* sign-up')), /animation|transition/);
  assert.match(css, /\.day \{[^}]*scroll-margin-top: .5rem/);
  assert.match(js, /scrollIntoView\(\)/);
});
