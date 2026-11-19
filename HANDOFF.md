# Mulligan Games B handoff (always current)

**Read order for a new session:** `CONTEXT.md` -> this file -> `DECISIONS.md` -> `DESIGN.md` -> `docs/refinement-plan.md`.

- Repo: https://github.com/Mishtuk/Mulligan-Games-B (local `C:\Users\alexm\projects\Mulligan-Games-B`)
- Kit (read-only): `C:\Users\alexm\projects\Base-Website-Design-Template`
- Commit rules: see `CONTEXT.md` (Alex Mishtuk noreply, no AI attribution). Owner OK'd pushing as we go (2026-11-19). No deploys.
- Team agents: `.claude/agents/`. Research: `docs/research/`. Reviews: `docs/review/`.

## Current task
- **Task:** Stage 1 step 6: design directions | agent: designer (then advisor) | files allowed: `docs/review/directions.md`
- **Done when:** 2-3 directions, each with a case and a risk, built on `docs/research/card-shop-look.md`; advisor critique appended; boss ruling in `DECISIONS.md`.
- **Out of scope:** any site code.

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
- Stage: 1 early. Last gate passed: none.
- Last build: none. Last test run: none.
- Preview: none. Live: none.

## Now working on
- [boss] `docs/review/directions.md` via designer, 2026-11-19

## Waiting on the owner
- [ ] Phone/email to publish, photos, hosted store for singles, weekly fees, buylist rates, Discord invite (see CONTEXT open questions)
- [ ] Preview deploy to Cloudflare (later)

## Built without a pattern
- Local server `tools/serve.mjs`: static `dist/` + `_headers` + the Worker in-process with an in-memory D1 shim on `node:sqlite` (`src/worker/d1-shim.js`). Kit says "a tiny node http server" but has no file. Local checks and tests only.
- Buylist rows as parallel `item_name[]`, `item_set[]`, `item_cond[]`, `item_qty[]` fields with child table `buylist_items` (kit buylist is one textarea). `GET /api/seats` returns `{event_id: seats_left}` (kit's `/api/events` returns full rows).
- Return page from a same-origin Referer (kit uses a hidden `page` field + `PAGES` map); other origins fall back to the form's home page.
- `npm test` is `node --test "test/*.test.mjs"`: on Node 24 `node --test test/` fails (treats the folder as a module).

## Log (newest first)
- 2026-11-19 Setup from the kit; research files; plan.

## How to run
- Install: `npm install` · Dev: `npm run dev` · Build: `npm run build` · Test: `npm test`
- Browser check: `npm run build && npm run serve` then `node tools/check-site.mjs http://localhost:4321 / /events/ ...`
