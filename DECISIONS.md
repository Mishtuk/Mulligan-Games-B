# Decisions

Format: number, date, who, question, ruling, why. Newest last. Rulings win over personal taste. A rule nobody
used in two rounds gets deleted.

- **D1** (2026-11-19, owner): What carries over from the old concept site? **Ruling:** only the official logo
  (`public/img/logo/`). Everything else is new. **Why:** owner did not like the old site; wants it to read as a card shop.
- **D2** (2026-11-19, boss): Template repo? **Ruling:** read-only reference; patterns copied into this repo, never
  edited there; the kit's "send to refinement log" step is replaced by `HANDOFF.md` "Built without a pattern".
  **Why:** owner said make no edits to the template repo.
- **D3** (2026-11-19, boss): Phone, email, fees, rates? **Ruling:** marked placeholders in `src/data/*.json` until
  the owner confirms. Address 445 York Road and the hours are public store facts and are shown with a "confirm" flag
  in data. **Why:** hard rule 5 and "no guessing the client's facts".
- **D4** (2026-11-19, boss after designer + advisor): Which direction? **Ruling:** direction A "Pairings Wall" skin
  (3px ink borders, hard purple shadows from the logo outline, sky tint, orange fills) with two borrowed moves: C's
  binder-week page as the Home IDEA (5:7 pockets, ring holes, a pocket above the fold at 390) and B's toploader as the
  Shop page featured single. Pairings sheet becomes the Events page table. Advisor conditions in
  `docs/review/directions.md` bind DESIGN.md (4-6px radius, display face with more game-shop character than Space
  Grotesk tested beside the logo, one hazard stripe per page max, Home and Events from one events data file).
  **Why:** strongest card objects for a phone, carries the logo, cheapest to build, nothing like the rejected old look.
- **D5** (2026-11-19, boss): Stack? **Ruling:** Astro static build to `dist/`, Cloudflare Workers static assets with one
  Worker (`src/worker.js`) for `/api/*` forms and D1; tests with `node --test`; no deploy without the owner.
  **Why:** kit default (quick-site "Astro for more than one page"); five pages share a layout.
- **D6** (2026-11-19, boss, loop 3): Toploader featured single on Shop with no real card? **Ruling:** removed until the
  owner sends a real card photo; per-game "Ask in store" pockets replaced by one "On the shelf" panel; product pockets
  render only from products.json rows. **Why:** empty placeholders read as a template, not a shop (D4 marked it optional).
  DESIGN.md to be brought in line at loop 10.
- **D7** (2026-11-20, boss, loop 52): Page-weight budget after the owner-requested New releases and Instagram
  sections? **Ruling:** raise to 143,000 raw / 22,700 gzip (about 5% above Home at 21,651 gzip). **Why:** an owner
  feature, measured cost (~3.3k gzip), no slack left to trim. Future raises need a new entry here.

## Decision rules
- Check here before asking. A recorded decision answers the question.
- Hard rules in `CONTEXT.md` are never traded away.
- If a reviewer's rule conflicts with a decision here, the decision wins; report the conflict to the boss.
- A decision that costs money, publishes, or contacts the client is the owner's, not the team's.
