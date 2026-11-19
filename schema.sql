-- D1 schema. Run: wrangler d1 execute mulligan --remote --file schema.sql
-- starts_at is UTC 'YYYY-MM-DD HH:MM'. Seats left is computed, never stored.
CREATE TABLE events (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  game TEXT NOT NULL DEFAULT '',
  starts_at TEXT NOT NULL,
  seats INTEGER,
  fee_cents INTEGER,
  cancelled INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE registrations (
  id INTEGER PRIMARY KEY,
  event_id INTEGER NOT NULL REFERENCES events(id),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  players_note TEXT NOT NULL DEFAULT '',
  waitlist INTEGER NOT NULL DEFAULT 0,
  created TEXT DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (event_id, email)
);
CREATE TABLE buylists (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  payout TEXT NOT NULL,
  note TEXT NOT NULL DEFAULT '',
  created TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE buylist_items (
  id INTEGER PRIMARY KEY,
  buylist_id INTEGER NOT NULL REFERENCES buylists(id),
  item_name TEXT NOT NULL,
  item_set TEXT NOT NULL DEFAULT '',
  item_cond TEXT NOT NULL,
  qty INTEGER NOT NULL
);
CREATE TABLE requests (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  game TEXT NOT NULL,
  cards TEXT NOT NULL,
  created TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE contacts (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  created TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Placeholder events (dates are relative so they stay upcoming; fees unknown, left NULL until the owner confirms).
INSERT INTO events (title, game, starts_at, seats, fee_cents) VALUES
  ('Commander Night (placeholder)', 'magic', strftime('%Y-%m-%d 22:00', 'now', '+2 days'), NULL, NULL),
  ('Pokemon League (placeholder)', 'pokemon', strftime('%Y-%m-%d 21:00', 'now', '+3 days'), 12, NULL),
  ('Riftbound Skirmish (placeholder)', 'riftbound', strftime('%Y-%m-%d 23:00', 'now', '+5 days'), 8, NULL);
