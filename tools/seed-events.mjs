// Regenerates the D1 event seed in schema.sql and src/data/signup-events.json from src/data/events.json (one source of truth).
// Usage: node tools/seed-events.mjs [YYYY-MM-DD]   (default: today in America/New_York). Re-run weekly before seeding D1.
import fs from 'node:fs';
import { zoned } from '../src/lib/hours.js';
import { seedEvents, seedSql, TZ } from '../src/lib/seed-events.js';

const url = (p) => new URL(`../${p}`, import.meta.url);
const from = process.argv[2] ?? zoned(TZ).date;
if (!/^\d{4}-\d{2}-\d{2}$/.test(from)) throw new Error('date must be YYYY-MM-DD');
const events = JSON.parse(fs.readFileSync(url('src/data/events.json'), 'utf8'));
const rows = seedEvents(events.weekly, from);
const sql = fs.readFileSync(url('schema.sql'), 'utf8');
const re = /-- BEGIN seed-events[\s\S]*?-- END seed-events/;
if (!re.test(sql)) throw new Error('schema.sql has no seed-events markers');
fs.writeFileSync(url('schema.sql'), sql.replace(re, () => seedSql(rows, from)));
fs.writeFileSync(url('src/data/signup-events.json'), JSON.stringify({ from, events: rows.map(({ id, title, date, time, seats }) => ({ id, title, date, time, seats })) }, null, 2) + '\n');
console.log(`seeded ${rows.length} events from ${from}`);
