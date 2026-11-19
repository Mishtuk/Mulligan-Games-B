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
- Last build: pass 2026-11-19 (loop 20). Last test run: 126/126. check-site: 7/7 paths pass. npm run a11y: pass.
- Preview: none. Live: none.

## Now working on
- RESUME HERE: loop 23 of 50 (Shop). Loops 1-22 done. Priorities: docs/review/loop-20/review.md.
- [boss] refinement loop 21 (Home): see docs/review/loop-20/review.md priority list

## Waiting on the owner
- **To set before launch:** `SITE_URL` in `src/lib/site.js` is the placeholder https://mulligangames.example (canonical, sitemap, robots, og:image, JSON-LD). Replace with the real domain.
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
- Loop 22 (Events): 1280 now chips on top, sheet left, special nights + clipboard stacked right (no gap); one Today marker per day (row Tonight chips cut); Home 320 Sell slab stacks, Preorders title no longer breaks; shots docs/review/loop-22.
- Loop 21 (Home): want list one compact block at 1280; per-game card backs (.g-<id>) and .85rem labels; dead Home CSS cut; shots docs/review/loop-21. Open: 320 Sell slab and Preorders title wrap.
- Loop 20 (boss review of 11-19): independent 22 -> 25/30. Fixed loop-19 regression (Events sign-up check threw ReferenceError `err`, no error summary); results now show with scripts off (Worker redirects to #form-ok|-wait|-err, CSS :target); no-JS header no longer sticky; seed ruling: no prebuild, positional ids replaced by stable ids, INSERT OR IGNORE, no seed in schema.sql, signup-events.json removed; `npm run a11y` now runs every form. 126 tests, check-site 0, a11y passed. Priorities 21-29 in docs/review/loop-20/review.md.
- Loop 19 (code): prebuild seeds sign-up events from the build date; nested-interactive test over dist/; shared public/js/form-state.js; budget re-measured (gzip headroom 0.6%, trim before raising); dead CSS/tokens/functions cut. 125 tests, check-site 0, a11y passed.
- Loop 18 (copy and voice): glossary in DESIGN.md s7; one name per thing across 7 paths; "ask at the counter", "Hold a seat", store credit; form success/error copy unified; Sell guide summary has a Show/Hide + affordance; Home sealed pockets link to contact. 123 tests, check-site 0, a11y passed.
- Loop 17 (identity + craft): design review docs/review/loop-17/. Header switches to Menu by `@container page (min-width: 52rem)` (body is the container); hero hand bigger; object family unified (sleeve stripes, --shadow-sm, radii); Home Sealed + Sell side by side at 1100px+; cut Shop case glare. 123 tests, check-site and a11y pass.
- Loop 16 (a11y + motion): `npm run a11y` (tools/a11y-check.mjs, tools/cdp.mjs) added; fixed 200% overflow of the condition guide slab, stacked duplicate slots in the Shop case, Events pairings stack now a rem container query. Screenshots in docs/review/loop-16/.
- 2026-11-19 loop 15 (Visit + chrome): `.sign` moved to global.css (+ `.sign-sky`), Visit house rules are a taped sign; Base prop `footHours="link"` drops the footer hours list on /visit/; 404 is a drawn misprinted card; Privacy has section dividers and 62ch; hours header right-aligned. 123 tests, check-site PASS.
- Loop 14 (Sell): counter sign + 3 receipt stubs + folded condition guide; cut How we pay box. Shots in docs/review/loop-14/.
- (loop 13, Shop) Drawn singles case (.case in shop.css, shared .cback in global.css used by Home hero too); want list + condition guide in .shop-duo; guide compact (2 cols); scroll-margin removed on Shop sections. 121 tests, check-site PASS (port 4313), shots in docs/review/loop-13/.
- Loop 12 (Events): clipboard sign-up sheet; stale seed nights filtered at build and in JS with an honest empty state (+2 tests, 121 total); compact pairings rows at 390; day anchor scroll fixed after reorder; Home Monthly/Open play links fixed; sign-up tab cut. Shots in docs/review/loop-12/.
- Loop 11 (Home): want-list box 5fr/7fr two-column at 1100+; hero card-back fan (.hand); play grid = mini sleeved cards (.sleeve); Stop in box cut. Shots docs/review/loop-11/.
- Loop 10 (boss review): independent score 23/30 (identity 3, actions 4, truth 4, a11y 5 with runs, craft 3, code 4). Worker 411 replaced by streaming byte cap (readCapped, tested); DESIGN.md updated; booster box/pack CSS art on Home and Shop pockets; repeated tabs cut; Sell rail aligned. 119 tests, check-site 7/7. Priorities for 11-20 in docs/review/loop-10/review.md. Not committed.
- Loop 09 (code/security/SEO/perf): bands bleed with 100cqw (main is a size container), clip removed; sitemap.xml + robots.txt endpoints, canonical/OG/Twitter, JSON-LD openingHoursSpecification; page-weight budget test; CSP has no unsafe-inline (stylesheets no longer inlined); worker: Origin check, content-type 415, content-length 411, Referer allow-list per form. 119 tests green.
- Loop 8 (copy and voice): bio line on Home, Home Visit box shrunk to one line, honest Sell slab, button and success wording, unique meta on all pages + test/meta.test.mjs. 104 tests green.
- Loop 7 (Card-shop identity): .band/.band-mat/.band-crimp/.airy in global.css (main overflow-x:clip); Home playmat band + unboxed Sell; Shop crimp band + unboxed Preorders; Visit address band, taped hours sheet, unboxed rules; tab numbers cut. Review and shots in docs/review/loop-07/. Next: Home Visit box duplicates footer, 404 pocket, Sell right rail.
- Loop 6 (Accessibility and motion): 200% text fixed on Events and Sell (container queries in rem), menu sheet closes on focus or click out, shared public/js/form-check.js (summary, aria-describedby, focus) on Home, Shop, Sell, Visit, pocket link names, role=group cut from buylist rows; test/a11y.test.mjs (+7, 103). CDP checks in .work/ (zoom, menu, motion, forms, landmarks). Shots in docs/review/loop-06. Not committed.
- Loop 5 (Visit + chrome): jargon removed from all built HTML (test/no-jargon.test.mjs), footer tightened to 3 blocks, Visit page gets Bring line and primary Maps button, chip strip slimmed. Screenshots docs/review/loop-05/.
- Loop 04 (Sell): slip starts at one row with JS (public/js/sell-rows.js trims the 3 server rows, Remove hidden on a single row, showRemove tested); receipt header, "lines: N" foot, one-line rows at >=820; store credit folded into How we pay; two-column at >=1180. 95 tests. Not committed.
- Loop 03 (Shop): sealed/preorders render pockets only when products.json has rows (src/lib/shop.js), else one "On the shelf" panel + preorder note; want-list worked example; toploader placeholder removed; chip anchors scroll-margin. 95 tests green.
- Loop 02 (Events): sheet rotates from today (JS) and ships Wed..Tue; closed days one line; sign-up select and D1 seed generated by `node tools/seed-events.mjs [date]` from events.json (writes schema.sql block + src/data/signup-events.json; re-run weekly). 94 tests green.
- 2026-11-19 Loop 1 Home (coder): logo CSS crop, binder Wed-first, pocket title clamp, hero/Tonight rebalanced at 1280, shorter binder note; +1 test (92). Not committed.
- 2026-11-19 Slice C (coder): Shop, Sell, Visit, 404, Privacy built (pages, shop/sell/visit/pages.css, Slab/ConditionGuide/Toploader/HoursTable, sell-rows/visit-hours/visit-contact JS, test/pages-c.test.mjs). Not committed.
- 2026-11-19 Slice B (coder): Events page (filter chips, pairings sheet, special nights, sign-up, .ics per night, events.js/events.css, test/events.test.mjs). Not committed.
- 2026-11-19 Slice A (coder): foundation + Home built (layout, global/home CSS, Pocket/BinderWeek/TonightStrip/OpenChip, data JSON, fonts, logo, hours.js + tests). Not committed.- 2026-11-19 Setup from the kit; research files; plan.

## How to run
- Install: `npm install` · Dev: `npm run dev` · Build: `npm run build` · Test: `npm test`
- Sign-up nights: the Events page builds its list from `events.json` (4 weeks from the build date, `seedEvents` in `src/lib/seed-events.js`); the build writes no tracked files. ids come from each night (YYYYMMDDHHMM*10+slot), so build and seed agree whatever day each ran. On deploy day: `node tools/seed-events.mjs > .work/seed.sql` then `wrangler d1 execute mulligan --remote --file .work/seed.sql` (INSERT OR IGNORE: safe to re-run, keeps sign-ups). Rebuild and re-seed at least every 3 weeks. `schema.sql` is tables only; `tools/serve.mjs` seeds the local D1 itself.
- Browser check: `npm run build && npm run serve` then `node tools/check-site.mjs http://localhost:4321 / /events/ ...`
