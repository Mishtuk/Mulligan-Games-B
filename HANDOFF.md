# Mulligan Games B handoff (always current)

**Read order for a new session:** `CONTEXT.md` -> this file -> `DECISIONS.md` -> `DESIGN.md` -> `docs/refinement-plan.md`.

- Repo: https://github.com/Mishtuk/Mulligan-Games-B (local `C:\Users\alexm\projects\Mulligan-Games-B`)
- Kit (read-only): `C:\Users\alexm\projects\Base-Website-Design-Template`
- Commit rules: see `CONTEXT.md` (Alex Mishtuk noreply, no AI attribution). Owner OK'd pushing as we go (2026-11-19). No deploys.
- Team agents: `.claude/agents/`. Research: `docs/research/`. Reviews: `docs/review/`.

## Current task
- **Task:** Phase 3 refinement loops (docs/refinement-plan.md, standing brief docs/loop-brief.md) | one agent per loop | boss commits + pushes per loop
- **Done when:** 50 loops logged in docs/refinement-log.md, tests green, check-site exit 0 on all 7 paths.
- **Out of scope:** deploy, contacting the store, editing the kit.

## Plan (roadmap)
**Phase 1, early (gate G1)**
1. Set up repo from the kit: agents, CONTEXT, HANDOFF, DECISIONS, .gitignore, `downloads/` (done).
2. Research: `card-shops.md`, `mulligan-games.md` (+ refresh), `card-shop-look.md`, `schedule-draft.json` (done).
3. Directions: designer proposes 2-3, advisor critiques, boss picks (D-number).
4. Stack: Astro static output + Cloudflare Workers static assets + one form Worker (D1 for event sign-ups,
   buylist and card requests). Preview only. Plain `node --test` for tests, kit `tools/check-site.mjs` for the browser check.

**Phase 2, middle (gate G2)**
5. `DESIGN.md` from the chosen direction (designer): tokens with contrast pairs, type, the 5:7 pocket component,
   the Home idea element, every page top to bottom, states, motion.
6. Scaffold (coder): Astro, layout, header/footer, motion switch, view transition, fonts, `_headers` CSP, logo, test runner.
7. Pages, one slice per brief (coder): Home -> Events (+ sign-up) -> Shop (singles search / card request, sealed,
   preorders) -> Sell to us (buylist slip) -> Visit (hours, map, house rules, contact) -> 404 + privacy.
8. Worker: `/api/signup`, `/api/buylist`, `/api/request`, `/api/contact`; D1 schema with placeholder rows; tests
   (valid, empty, hostile input, 303 redirects).
9. Checks: build, tests, `check-site.mjs` on every page, screenshots 390/1280 Motion on/off; designer review (rubric /40 + /20).

**Phase 3, refinement: 50 loops** (`docs/refinement-plan.md`, log in `docs/refinement-log.md`). One agent run per
loop, lens rotation, every 10th loop an Opus review that re-scores and sets the next ten. Commit and push per loop.

**Phase 4, late (owner)** Real photos, phone/email, fees, hosted store, Discord; then preview deploy with the owner's OK.

## Status
- Stage: 3 refinement (first build done 2026-11-19). Gates: G1 passed (owner brief + D4/D5).
- Last build: pass 2026-11-19. Last test run: 91/91. check-site: 7/7 paths pass.
- Preview: none. Live: none.

## Now working on
- [boss] refinement loop 1

## Waiting on the owner
- [ ] Phone/email to publish, photos, hosted store for singles, weekly fees, buylist rates, Discord invite (see CONTEXT open questions)
- [ ] Preview deploy to Cloudflare (later)

## Built without a pattern
- Local server `tools/serve.mjs`: static `dist/` + `_headers` + the Worker in-process with an in-memory D1 shim on `node:sqlite` (`src/worker/d1-shim.js`). Kit says "a tiny node http server" but has no file. Local checks and tests only.
- Buylist rows as parallel `item_name[]`, `item_set[]`, `item_cond[]`, `item_qty[]` fields with child table `buylist_items` (kit buylist is one textarea). `GET /api/seats` returns `{event_id: seats_left}` (kit's `/api/events` returns full rows).
- Return page from a same-origin Referer (kit uses a hidden `page` field + `PAGES` map); other origins fall back to the form's home page.
- `npm test` is `node --test "test/*.test.mjs"`: on Node 24 `node --test test/` fails (treats the folder as a module).
- Shared hours/today logic lives in `public/js/hours.js` (browser ES module); `src/lib/hours.js` re-exports it so Astro and `node --test` use the same file.
- Tonight strip: all nights server-rendered inside a closed `<details>`; `public/js/today.js` opens it and shows only today (store zone). No-JS keeps the details plus a "This week" link.
- Open chip, today highlights and request-form messages are plain external scripts reading `<script type="application/json">` blocks (CSP-safe).

- Events build-time .ics endpoint (`src/pages/events/[id].ics.js`, helpers `src/lib/events.js`) from the kit ics-feed pattern adapted to static output: weekly rows use RRULE:FREQ=WEEKLY, no DTEND (data has no end times). Sign-up select hard-codes the D1 seed placeholders in `SIGNUP_EVENTS` (a test compares it to schema.sql). Events weekly sheet renders weekdays and JS adds dates/Tonight.

- Buylist slip rows (server-rendered 5, JS add/remove, parallel item_*[] fields) in public/js/sell-rows.js; condition guide as a container-query-stacking table; Toploader/Slab CSS placeholders; privacy page text (no kit pattern).

## Log (newest first)
- Loop 02 (Events): sheet rotates from today (JS) and ships Wed..Tue; closed days one line; sign-up select and D1 seed generated by `node tools/seed-events.mjs [date]` from events.json (writes schema.sql block + src/data/signup-events.json; re-run weekly). 94 tests green.
- 2026-11-19 Loop 1 Home (coder): logo CSS crop, binder Wed-first, pocket title clamp, hero/Tonight rebalanced at 1280, shorter binder note; +1 test (92). Not committed.
- 2026-11-19 Slice C (coder): Shop, Sell, Visit, 404, Privacy built (pages, shop/sell/visit/pages.css, Slab/ConditionGuide/Toploader/HoursTable, sell-rows/visit-hours/visit-contact JS, test/pages-c.test.mjs). Not committed.
- 2026-11-19 Slice B (coder): Events page (filter chips, pairings sheet, special nights, sign-up, .ics per night, events.js/events.css, test/events.test.mjs). Not committed.
- 2026-11-19 Slice A (coder): foundation + Home built (layout, global/home CSS, Pocket/BinderWeek/TonightStrip/OpenChip, data JSON, fonts, logo, hours.js + tests). Not committed.- 2026-11-19 Setup from the kit; research files; plan.

## How to run
- Install: `npm install` · Dev: `npm run dev` · Build: `npm run build` · Test: `npm test`
- Browser check: `npm run build && npm run serve` then `node tools/check-site.mjs http://localhost:4321 / /events/ ...`
