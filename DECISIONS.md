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
- **D8** (2026-11-20, boss, loop 57): Cut the client's own bio line to fit the budget? **Ruling:** no. Restored
  "Stop in and stay for a game." and set the gzip budget to 23,000. **Why:** the client's real words outrank 77 bytes;
  budgets must never remove client copy. Trim code, not the store's voice.

- **D9** (2026-11-20, boss, loop 69): The D8 +300 is no longer needed. **Ruling:** gzip budget back to the D7 line, 22,700 (Home 22,3xx). **Why:** loops 61-68 cut Home; the store's words stayed.
- **D10** (2026-11-20, boss after advisor): GitHub Pages preview approach? **Ruling:** (a) `npm run build:pages` =
  Astro build with PAGES=1 into dist-pages/, then one post-build pass rewriting only internal root paths (HTML, CSS,
  JS, XML, JSON-sourced media) to /Mulligan-Games-B/; source stays clean. (b) The normal build stays byte-identical
  (hash compare). (c) No-JS forms on Pages: method=get to a static preview-form page; JS-on: capture-phase intercept
  shows "Forms don't send in this preview", never a fake success. (d) SITE_URL on Pages =
  https://mishtuk.github.io/Mulligan-Games-B; noindex meta on every page (the real protection); _headers dropped from
  dist-pages. (e) Publish from a gh-pages branch, pushed by the boss; author rules as CONTEXT.md. **Why:** owner asked to
  see it on Pages; lowest-risk route per the advisor; never present the concept as the store's real site.
- **D11** (2026-11-20, boss after the team meeting; mediator + advisor input in docs/meeting/): (A) Instagram strip
  gets CSS-drawn thumbnails, no post words cut; a budget raise is allowed by a new entry, never a copy cut. (B) New
  releases above the want-list form on Home. (C) Amends D10(c): on the Pages build form fields lose their name
  attributes so nothing typed reaches a URL; the normal build is unchanged. **Why:** owner-requested sections must
  look as good as the ads; privacy (hard rule 5); owner wants the releases advertised high on Home.

- **D12** (2026-11-20, boss pre-ruling, applied in T2): Home gzip budget raised from 22,700 to 23,200 (measured 23,104 after the Instagram CSS art and header pill; measured +2% exceeds the +500 cap, so the cap applies). No copy cut. test/budget.test.mjs updated.- **D13** (2026-11-20, boss after advisor, docs/admin/architecture.md): Admin and self-sufficiency architecture?
  **Ruling:** accepted as written: Cloudflare Access + origin JWT check, admin at /admin/ and /admin/api/*, owners from
  a secret and staff in D1, numbered migrations, audit log with before/after, live regions filled by the Worker with
  escaped values and a static fallback, singles search at /shop/singles/, Pages demo mode in localStorage, build order
  S0-S10 with advisor review on S1, S2, S4, S5, S6 and S8. **ASSUMED until the owner answers:** singles are typed in the
  admin (no POS sync); prices show when staff enter one, else "Ask at the counter"; inbox rows kept 180 days.
  **Order (owner, 2026-11-20):** presentable first (dark mode, release panels, product detail, polish), then admin.

## Decision rules
- Check here before asking. A recorded decision answers the question.
- Hard rules in `CONTEXT.md` are never traded away.
- If a reviewer's rule conflicts with a decision here, the decision wins; report the conflict to the boss.
- A decision that costs money, publishes, or contacts the client is the owner's, not the team's.
