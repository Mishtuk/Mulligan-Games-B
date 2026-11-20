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
- Last build: pass 2026-11-19 (loop 40). Last test run: 138/138. check-site: 7/7 paths pass. npm run a11y: pass.
- Preview: none. Live: none.

## Now working on
- RESUME HERE: loop 48 of 50. Loops 1-47 done.
- [boss] refinement loop 41 (Home): see docs/review/loop-40/review.md priority list (41-49 aimed at launch quality) and its owner launch checklist

## Waiting on the owner
- **To set before launch:** `SITE_URL` in `src/lib/site.js` is the placeholder https://mulligangames.example (canonical, sitemap, robots, og:image, JSON-LD). Replace with the real domain.
- [ ] Phone/email to publish, photos, hosted store for singles, weekly fees, buylist rates, Discord invite (see CONTEXT open questions)
- [ ] Preview deploy to Cloudflare (later)

## Photo slots (swap steps)
Full shot list, sizes, file names and exact JSON: [docs/photo-swap.md](docs/photo-swap.md).
Two marked placeholders show "Photo coming: ..." until the owner sends photos. To swap one: put the file in `public/img/` (real photo, no people unless they consented), then in `src/data/store.json` set `photos.storefront` (Visit) or `photos.playRoom` (Events) from `null` to `{ "src": "/img/x-800.jpg", "alt": "what is in it", "width": 800, "height": 400, "srcset": "/img/x-400.jpg 400w, /img/x-800.jpg 800w", "sizes": "(min-width: 700px) 16rem, 100vw" }`. Use a 2:1 crop. Rebuild; `npm test` checks width, height and alt are set. Before launch no `class="ph"` may remain (grep dist). Placeholder CSS: `.ph` in global.css; component `src/components/Photo.astro`.

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
- Loop 47 (Identity, designer): all 7 paths x 2 widths + Home Motion off looked at. 3 fixes: Events Game col 15% (Tabletop no longer touches Format), Hold a seat column so Add to calendar links align, Home 1280 request band 3rem below Tonight. docs/photo-swap.md written (linked from README, HANDOFF). Shots docs/review/loop-47/. 138 tests, check-site PASS, a11y PASS.
- Loop 46 (A11y): Events filter now speaks: always-present `#ev-status` (role=status, .vh) says "3 Magic nights this week" / "No Riftbound nights listed" (filled 250ms after load); a11y-check asserts, per game, the status text and that hidden days, rows and tickets are absent from the AX tree. 200% at 1280 on Events and Sell looked at, clean. Cut: role=status on the visible no-results box and an empty fragment. 138 tests, check-site and a11y pass. Shots docs/review/loop-46/.
- Loop 45 (Visit + chrome): Visit band 900+ = placard + Maps left, 2:1 photo slot right (30rem); 404 loses Shop button; header/footer identical on 7 paths except Visit props. Shots docs/review/loop-45/. 138 tests, check-site PASS, a11y PASS.
- Loop 44 (Sell): LINES total empty until a card has a name (tested `totalText`, aria-live on the `<p>`); Shop Sealed shelf art tightened at 1280; no other page needs the footer-after-band rule. 138 tests, check-site and a11y pass. Shots `docs/review/loop-44/`.
- Loop 43 (Shop): case rows patterned by shelf-tag games (sleeve.css g-* on cback), Sealed/Preorders two equal columns at 1280, footer gap after the last band removed, cut cback v2. Shots docs/review/loop-43/.
- Loop 42 (Events): Game cell sleeve swatch via shared `src/styles/sleeve.css` (Home + Events); 390 sheet 2103 -> 1905px (lone Add to calendar on the game line, smaller; closed days tighter); cut Events lead 2nd sentence. Budget unchanged (Events gz 18,816). 138 tests, check-site and a11y pass. Shots `docs/review/loop-42/`.
- Loop 41 (Home): Binder week is an even 3x3 page at 1280 (equal 206px pockets, 12px gaps, closed Mon/Tue full size); 390 hero 44px higher (stale margin override fixed); cut dead flex rules. 138 tests, check-site and a11y pass. Next: loop 42 Events.
- Loop 40 (Review of 31-39): independent 25 found -> 26/30. Forms 5 x 4 modes pass; header row aligned 800-1600 in all filters; photo <img> branch proven with a fake store.json (restored). Fixed: game filters with no nights (Pokemon etc.) hide the sheet and say so, empty days hide; Events columns 8/12/30/9/41 + stack at 42.5rem (no Seat or fee-sticker wrap); Sell sticky only in windows >= 38rem tall; gzip budget back to 19,200; dead thead CSS cut. 138 tests. Priorities 41-49 + owner launch checklist in docs/review/loop-40/review.md.
- Loop 39 (Code): shop.css -> shared.css (imports updated, no rule lost or doubled); dead-CSS sweep found nothing to cut; voice regex tidied; budget 19,550 gz / 132,100 raw (heaviest Home 18,616 gz, Events 125,812 raw); README.md added; cut dead `joinNames`. 137 tests.
- Loop 38 (Copy, 25 -> 25.5 est.): unknown fee shows nothing site-wide (.ics too, dist test); duplicate lines varied; Shop shelf line cut; Events photo placeholder hidden under 52rem; DESIGN.md updated for loop 37. 137 tests, check-site, a11y pass.
- Loop 37 (Identity, designer): subtract pass cut footer stripe, 16 ASK stickers, 4 tape pieces (inventory in docs/review/loop-37/inventory.md). 2 photo slots (Visit storefront, Events play room). 134 tests, check-site, a11y pass.
- Loop 36 (A11y, 29.5 -> 30 est.): `npm run a11y` now checks no word is broken mid-word in pocket titles and short labels at 320/390/430 (Range rects per word); it found "Wednesday" (binder at 320, font .9 -> .8rem) and "(NM–DMG)" (cut from the guide summary). Waitlist panel copy shortened (one link line), so the JS-off panel check is strict again (fully in view at 200% x 390). Sell side column sticky only while the guide is folded (:has), tested at 1280x700 and 1280x800. Shots in docs/review/loop-36/.
- Loop 35 (Visit + chrome): Open in Maps beside the placard at 1280; footer Visit us column dropped on /visit/ (Base footVisit prop); smaller gap under the Open-now strip at 390 (page-head); Sell right column (sign + guide) sticky at 1280, guide now sits before the slip in DOM/390 order; cut Visit lede 2nd sentence. Tests 133. Shots docs/review/loop-35/.
- Loop 34 (Sell): each fact once across steps, sign and sent panel; cut lede and What-we-look-at card; Shop want list two-column at 1100px+. Tests 132, a11y pass.
- Loop 33 (Shop): shelf tags on case rows with visible caption, ConditionGuide folded on both Shop and Sell (one component), Sealed gap at 1280 closed, 132 tests, a11y + check-site pass. Shots docs/review/loop-33/.
- Loop 32 (Events): fee shown only when known (no "–" chips, no legend sentence, special-night chip gone when unknown); one visible header row for the pairings sheet (aria-hidden div) while each day keeps its own table with a visually hidden thead + colgroup for column widths; cut "Same nights every week." Test added (131). Shots docs/review/loop-32/.
- Loop 31 (Home): fee chips only when fee known (Tonight, Binder, Sealed); Sealed grid auto-fit (no empty slot); closed pockets compact at 390; cut Sealed foot chips; 130 tests.
- 2026-11-19 loop 30 (boss review of 21-29): independent 24 -> 25/30 (loop 20's table summed to 24, not 25). All 5 forms run in 4 modes (JS/JS-off x good/bad) show a focused result; seed ids stable across 3 dates and equal to the build; tree clean after build; CSS split verified (no missing or duplicate rules per page); check-site header skip kept (narrow, proven safe). Fixed: Home game label broke mid-word at 390 ("Warhamme r"); undone: loop-23 sticky Events column (taller than the viewport, only delayed the sign-up form). Tests 129, check-site 0, a11y pass. Priorities 31-39 in docs/review/loop-30/review.md.
- 2026-11-19 loop 29 (Code): `npm run a11y` now runs the JS-off form run (5 forms posted good and bad, 11 :target panels, 100% and 200% text; proven to fail with a bad scroll-padding); global.css split per page (Pocket -> pocket.css, home/shop/visit-only rules to their page files; 14 full-page shots byte-identical): Sell gzip 18,582 -> 17,927, Events 18,832 -> 18,177 (budget still 19,200); `npm run build:deploy` / DEPLOY=1 fails on placeholder SITE_URL (test/deploy.test.mjs); the 'What we play' contrast flake was the sticky header's Menu button passing over the heading at one scroll step, not a layout fault: check-site (our copy) now skips text under a sticky/fixed header. Tests 129.
- 2026-11-19 loop 28 (Copy): unknowns rule in DESIGN.md glossary (confirm with the store = facts we may have wrong; ask at the counter = settled in person), applied site-wide, test/voice.test.mjs over dist/; Shop/Visit leads in shop words; Events rows pair Hold a seat + Add to calendar (Cap column folded into Format), 1280 end blank 470 -> 352px. Tests 127, a11y and check-site pass, Sell gzip 18,582.
- Loop 27 (designer): 1280 dead space removed on Home, Shop, Visit (notes in docs/review/loop-27/notes.md); case light bar cut; Events end gap (470px) left.
- Loop 26 (A11y, 25 -> 26 est.): no body text under .8rem on any path (check now in `npm run a11y`); JS-off panels at 200% land at 32px not 160px (`html:not(.js)` scroll-padding); Visit 1280 hours | contact, House rules full width in 2 columns; cut duplicate reply line in contact success panel. Shots: docs/review/loop-26/.
- Loop 25 (Visit + chrome, 27 -> 28 est.): Address is a street-number placard (445 in Titan One, road and town beside it) with a primary Open in Maps button; contact box shorter (lede, 3-row textarea); Motion button hidden under html:not(.js); Sell fold summary "Show condition guide (NM–DMG)" one line. Cut the "Parking: ask us" line. Shots: docs/review/loop-25.
- Loop 24 (Sell): leftover Shop-only rules moved into shop-only.css (Sell gzip 18,582 -> 18,407, then 18,561 with the new card); 1280 right column fills with a "What we look at" card (corners, edges, surface, centring) above the condition fold; fold summary in body type; LINES total uses full width. Cut: dead .sub rule, "Same guide on the Shop page" link. Shots docs/review/loop-24.
- Loop 23 (Shop): Sealed band draws box + pack on a shelf edge (reuses .box-sil), one "Sealed" heading; Preorders is a mono pre-order slip (release date, deposit, no invented facts); Events right column sticky at 1280 when viewport >= 56rem tall; Shop-only CSS split to shop-only.css (Sell gzip back under budget). Cut: "On the shelf" h3. Shots docs/review/loop-23.
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
- Deploy build: `npm run build:deploy` (same as `DEPLOY=1 npm run build`) fails while `SITE_URL` in `src/lib/site.js` is a placeholder (http, localhost, .example/.test, example.com); plain `npm run build` still works for preview. Use `build:deploy` for anything that ships.
- A11y: `npm run a11y` also posts all 5 forms with scripts off (good and bad email) and loads all 11 result panels at 100% and 200% text (about 90 s).
- Browser check: `npm run build && npm run serve` then `node tools/check-site.mjs http://localhost:4321 / /events/ ...`
