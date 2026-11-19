// Tiny in-memory stand-in for D1 (prepare().bind().run()/first()/all()) on node:sqlite. Local server and tests only.
import { DatabaseSync } from 'node:sqlite';

export function makeD1(schemaSql) {
  const db = new DatabaseSync(':memory:');
  db.exec('PRAGMA foreign_keys = ON');
  if (schemaSql) db.exec(schemaSql);
  const stmt = (sql, args = []) => ({
    bind: (...a) => stmt(sql, a),
    async run() {
      const r = db.prepare(sql).run(...args);
      return { success: true, meta: { changes: Number(r.changes), last_row_id: Number(r.lastInsertRowid) } };
    },
    async first() {
      const row = db.prepare(sql).get(...args);
      return row ? { ...row } : null;
    },
    async all() {
      return { results: db.prepare(sql).all(...args).map((r) => ({ ...r })) };
    },
  });
  return { prepare: (sql) => stmt(sql), raw: db };
}
