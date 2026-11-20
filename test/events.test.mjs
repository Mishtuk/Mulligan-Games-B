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

test('sign-up list and D1 seed come from one function: stable ids, INSERT OR IGNORE, no seed in schema.sql; form uses the Worker field names', () => {
  const fixed = seedEvents(events.weekly, '2026-11-19');
  assert.deepEqual([...new Set(fixed.map((r) => r.title + ' ' + r.seats))].sort(), ['Draft 16', 'Draft FNM 28', 'Pauper Night 28']);
  assert.equal(fixed.length, 12);
  assert.equal(fixed[0].id, 202611201900 * 10); // Fri Nov 20, 7pm, first slot
  assert.equal(new Set(fixed.map((r) => r.id)).size, fixed.length);
  assert.ok(fixed.every((r) => Number.isSafeInteger(r.id) && r.id < 1e13), 'ids fit the Worker int check');
  // A build or seed made a week later gives the same id to every night both lists share (the bug positional ids had).
  const later = seedEvents(events.weekly, '2026-11-26');
  for (const r of later) { const same = fixed.find((f) => f.date === r.date && f.time === r.time && f.title === r.title); if (same) assert.equal(r.id, same.id); }
  assert.match(seedSql(fixed, '2026-11-19'), /^-- BEGIN.*\nINSERT OR IGNORE INTO events /);
  assert.doesNotMatch(read('schema.sql'), /INSERT INTO events|BEGIN seed-events/);
  assert.equal(JSON.parse(read('package.json')).scripts.prebuild, undefined, 'build writes no tracked files');
  assert.equal(signupLabel({ title: fixed[0].title, date: fixed[0].date, time: fixed[0].time }), 'Draft FNM, Fri Nov 20, 7pm');
  const page = read('src/pages/events/index.astro');
  assert.match(page, /seedEvents\(events\.weekly, zoned\(store\.timezone\)\.date\)/);
  assert.match(page, /nights\.map/);
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

test('Events shows a fee only when known: no dash chip, no legend, one visible header row', () => {
  const page = read('src/pages/events/index.astro');
  assert.doesNotMatch(page, /A dash in Fee|Fee: ask at the counter|aria-hidden="true">–/);
  assert.equal((page.match(/e\.fee !== null &&/g) || []).length, 2);
  assert.match(page, /class="sheet-head mono" aria-hidden="true"/);
  assert.match(page, /<thead role="rowgroup" class="vh">/);
});

// Loop 40: a filter with no nights (Pokemon, One Piece...) used to show the header row over seven "No nights" lines.
test('filtered sheet: empty days hide, a game with no nights hides the whole sheet (header row included)', () => {
  const page = read('src/pages/events/index.astro'), js = read('public/js/events.js');
  assert.doesNotMatch(page, /day-none|No nights for this game/);
  assert.match(js, /sec\.hidden = g !== 'all' && shown === 0;/);
  assert.match(js, /sheet\.hidden = g !== 'all' && weekly === 0;/);
  assert.ok(read('src/pages/events/index.astro').indexOf('class="sheet-head') > page.indexOf('<div class="sheet">'), 'header row lives inside .sheet so it hides with it');
});

test('pairings sheet ships Wed..Tue and the script rotates from today; closed days are one line', () => {
  const page = read('src/pages/events/index.astro'), js = read('public/js/events.js');
  assert.match(page, /const order = \[3, 4, 5, 6, 0, 1, 2\]/);
  assert.match(page, /day-closed/);
  assert.match(js, /dataset\.ahead/);
});

test('sign-up never offers past nights: filtered at build (America/New_York) and in the browser, honest empty state', () => {
  const nights = seedEvents(events.weekly, '2026-11-19');
  const first = nights[0].date, last = nights.at(-1).date;
  assert.equal(upcomingSignup(nights, first).length, nights.length);
  assert.equal(upcomingSignup(nights, '2026-11-21').every((e) => e.date >= '2026-11-21'), true);
  assert.ok(upcomingSignup(nights, '2026-11-21').length < nights.length);
  assert.deepEqual(upcomingSignup(nights, last).map((e) => e.date), [last]); // the night itself is still offered
  assert.deepEqual(upcomingSignup(nights, '2099-01-01'), []); // every seeded night stale: nothing offered
  const page = read('src/pages/events/index.astro'), js = read('public/js/events.js');
  assert.match(page, /upcomingSignup\(seedEvents\(events\.weekly, zoned\(store\.timezone\)\.date\), zoned\(store\.timezone\)\.date\)/);
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

test('seed generator is deterministic for a date', () => {
  const a = seedEvents(events.weekly, '2026-11-19'), b = seedEvents(events.weekly, '2026-11-19');
  assert.deepEqual(a, b);
  assert.equal(seedSql(a, '2026-11-19'), seedSql(b, '2026-11-19'));
  assert.notDeepEqual(a.map((r) => r.date), seedEvents(events.weekly, '2026-12-03').map((r) => r.date));
});

test('.ics for an unknown fee has no fee line; a known fee keeps "Fee: $N."', () => {
  const base = { id: 'x', date: '2026-12-01', time: '19:00', title: 'A', game: 'Magic', certainty: 'Confirmed' };
  assert.doesNotMatch(unfold(eventIcs({ ...base, fee: null }, { now: NOW })), /Fee/);
  assert.match(unfold(eventIcs({ ...base, fee: 5 }, { now: NOW })), /DESCRIPTION:Fee: \$5\./);
});
