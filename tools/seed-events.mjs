// Prints the D1 seed for sign-up nights (4 weeks from a date) from src/data/events.json. It writes no files: the
// Events page builds the same list itself, and the ids come from each night, so a seed run on deploy day matches it.
// Usage: node tools/seed-events.mjs [YYYY-MM-DD] > .work/seed.sql   (default: today in America/New_York), then
//        wrangler d1 execute mulligan --remote --file .work/seed.sql   (INSERT OR IGNORE: safe to re-run, keeps sign-ups).
import fs from 'node:fs';
import { zoned } from '../src/lib/hours.js';
import { seedEvents, seedSql, TZ } from '../src/lib/seed-events.js';

const from = process.argv[2] ?? zoned(TZ).date;
if (!/^\d{4}-\d{2}-\d{2}$/.test(from)) throw new Error('date must be YYYY-MM-DD');
const events = JSON.parse(fs.readFileSync(new URL('../src/data/events.json', import.meta.url), 'utf8'));
process.stdout.write(seedSql(seedEvents(events.weekly, from), from) + '\n');
