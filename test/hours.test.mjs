import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { fmtTime, zoned, toWeek, openState, hoursText, eventsToday, nextEvent } from '../src/lib/hours.js';

const store = JSON.parse(fs.readFileSync(new URL('../src/data/store.json', import.meta.url), 'utf8'));
const events = JSON.parse(fs.readFileSync(new URL('../src/data/events.json', import.meta.url), 'utf8'));
const TZ = store.timezone, week = toWeek(store.hours);
// Winter (EST, UTC-5): 2026-11-20 is a Friday. at() takes the New York wall clock.
const at = (date, hm) => new Date(`${date}T${hm}:00-05:00`);

test('fmtTime', () => {
  assert.equal(fmtTime('14:00'), '2pm');
  assert.equal(fmtTime('22:00'), '10pm');
  assert.equal(fmtTime('24:00'), 'midnight');
  assert.equal(fmtTime('12:00'), 'noon');
  assert.equal(fmtTime('13:30'), '1:30pm');
});

test('zoned uses the store zone, not UTC', () => {
  // 2026-11-21 02:30 UTC is still Friday 9:30pm in New York.
  const z = zoned(TZ, new Date('2026-11-21T02:30:00Z'));
  assert.deepEqual(z, { day: 5, date: '2026-11-20', min: 21 * 60 + 30 });
});

test('zoned across DST: summer is UTC-4', () => {
  const z = zoned(TZ, new Date('2026-07-04T03:30:00Z')); // Fri Jul 3, 11:30pm EDT
  assert.equal(z.date, '2026-07-03');
  assert.equal(z.min, 23 * 60 + 30);
});

test('open on a weekday evening', () => {
  assert.deepEqual(openState(week, TZ, at('2026-11-18', '20:00')), { open: true, day: 3, text: 'Open now, until 10pm' });
});

test('Friday closes at 24:00: open at 23:59, Saturday 00:00 is the new day and not open until 2pm', () => {
  assert.equal(openState(week, TZ, at('2026-11-20', '23:59')).text, 'Open now, until midnight');
  const s = openState(week, TZ, at('2026-11-21', '00:00'));
  assert.equal(s.open, false);
  assert.equal(s.text, 'Opens today 2pm');
});

test('before opening and just after closing', () => {
  assert.equal(openState(week, TZ, at('2026-11-18', '13:59')).text, 'Opens today 2pm');
  assert.equal(openState(week, TZ, at('2026-11-18', '14:00')).open, true);
  assert.equal(openState(week, TZ, at('2026-11-18', '22:00')).open, false);
  assert.equal(openState(week, TZ, at('2026-11-18', '22:00')).text, 'Opens Thu 2pm');
});

test('closed days point to the next open day', () => {
  assert.equal(openState(week, TZ, at('2026-11-16', '15:00')).text, 'Opens Wed 2pm'); // Monday
  assert.equal(openState(week, TZ, at('2026-11-17', '23:00')).text, 'Opens Wed 2pm'); // Tuesday
  assert.equal(openState(week, TZ, at('2026-11-22', '22:30')).text, 'Opens Wed 2pm'); // Sunday after close
});

test('visitor in another zone still gets the store clock', () => {
  // 2026-11-18 20:00 EST = 2026-11-19 09:00 in Tokyo; the answer must be about Wednesday in New York.
  assert.equal(openState(week, TZ, new Date('2026-11-19T01:00:00Z')).text, 'Open now, until 10pm');
});

test('hoursText', () => {
  assert.equal(hoursText(week[5]), '2pm to midnight');
  assert.equal(hoursText(week[1]), 'Closed');
  assert.equal(hoursText(week[0]), '1pm to 10pm');
});

test('eventsToday: Friday rows, sorted, plus a dated one-off', () => {
  const fri = eventsToday(events, TZ, at('2026-11-20', '12:00'));
  assert.deepEqual(fri.map((e) => e.time), ['17:00', '19:00']);
  const sat = eventsToday(events, TZ, at('2026-11-21', '09:00'));
  assert.deepEqual(sat.map((e) => e.label), ['Commander Open Play', 'Star Trek Commander Party', 'Draft']);
});

test('eventsToday: closed day is empty; unverified one-off never shown', () => {
  assert.deepEqual(eventsToday(events, TZ, at('2026-11-16', '12:00')), []);
  const all = [];
  for (let i = 0; i < 14; i++) all.push(...eventsToday(events, TZ, new Date(at('2026-11-16', '12:00').getTime() + i * 86400000)));
  assert.ok(!all.some((e) => /Skirmish/.test(e.label)));
});

test('nextEvent from a quiet Tuesday night', () => {
  const n = nextEvent(events, TZ, at('2026-11-17', '20:00'));
  assert.equal(n.date, '2026-11-18');
  assert.equal(n.text, 'Wed Nov 18 at 2pm: Commander Open Play');
});

test('nextEvent later the same day skips events already started', () => {
  const n = nextEvent(events, TZ, at('2026-11-20', '18:00'));
  assert.equal(n.offset, 0);
  assert.equal(n.time, '19:00');
});

test('nextEvent after the last Sunday event rolls past closed Mon/Tue', () => {
  const n = nextEvent(events, TZ, at('2026-11-22', '17:00'));
  assert.equal(n.date, '2026-11-25');
});

test('nextEvent with no events at all is null', () => {
  assert.equal(nextEvent({ weekly: [], oneoffs: [] }, TZ, at('2026-11-18', '12:00')), null);
});
