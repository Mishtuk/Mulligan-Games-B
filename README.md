# Mulligan Games website (alt build "B")

A small, fast website for Mulligan Games, a card and tabletop game shop: what is on
tonight, events with sign-up, the shop shelf and card requests, selling cards to the store, and how to visit.
Preview only: nothing is deployed or live.

## Stack
- Astro 7, static output in `dist/` (7 pages, no framework JS; small browser modules in `public/js/`).
- Cloudflare Workers static assets plus one form Worker (`src/worker.js`) with D1 (`schema.sql`) for sign-ups,
  buylist, card requests and contact. Strict CSP in `public/_headers` (no inline scripts or styles).
- Styles in `src/styles/` (tokens in `global.css`, one file per page, `shared.css` for the page head and condition guide).
- Plain `node --test` tests; Node 24+.

## Run, test, check
```
npm install
npm run dev          # Astro dev server
npm run build        # static build into dist/
npm test             # unit and built-page tests (build first; some skip without dist/)
npm run serve        # dist/ + Worker + in-memory D1 at http://localhost:4321 (PORT=... to change)
npm run a11y         # browser check at 320-1280 wide, submits every form (stop any local server first)
node tools/check-site.mjs http://localhost:PORT / /events/ /shop/ /sell/ /visit/ /privacy/ /nope
```

## Docs
`CONTEXT.md` (rules, owner instructions), `DECISIONS.md`, `DESIGN.md` (tokens, components, pages),
`HANDOFF.md` (current state), `docs/refinement-plan.md` and `docs/refinement-log.md` (the 50 refinement loops),
`docs/loop-brief.md`, `docs/review/` (reviews and screenshots), `docs/research/`.

## Owner launch checklist
None of these can be guessed; the build never invents them. Data first, deploy last.
- [ ] **Domain**: set `SITE_URL` in `src/lib/site.js` (now the placeholder `https://mulligangames.example`; feeds canonical, sitemap, robots, og:image, JSON-LD). `npm run build:deploy` refuses the placeholder.
- [ ] **Photos**: storefront and play room, no people, by [docs/photo-swap.md](docs/photo-swap.md) into `src/data/store.json` `photos.*`. A null photo shows a marked "Photo coming" box on `npm run build` and nothing at all on `build:deploy`.
- [ ] **Phone and email** (`store.json` `phone`, `email`) or confirm "form only"; **Discord** invite (`discord`; two were found, confirm which).
- [ ] **Weekly nights, times and fees** (`src/data/events.json`; a null `fee` shows nothing; add Pokemon, One Piece, Hololive, Riftbound nights if they run). **Buylist rates** and store-credit bonus (or keep "Rates are set at the counter"); a hosted store for singles, if any.
- [ ] **Cloudflare**: account, then `wrangler d1 create mulligan` and put the id in `wrangler.jsonc`; `wrangler d1 execute mulligan --remote --file schema.sql`; seed nights with `node tools/seed-events.mjs > .work/seed.sql` then `wrangler d1 execute mulligan --remote --file .work/seed.sql` (safe to re-run; rebuild and re-seed at least every 3 weeks).
- [ ] **Turnstile**: create a widget and run `wrangler secret put TURNSTILE_SECRET` (the Worker only passes a missing secret in local mode). The pages carry no widget site key yet: add it with the owner before launch.
- [ ] **Who reads sign-ups and messages** (D1 rows) and how; deleting data on request (the privacy page promises it).
- [ ] **Build and deploy**: `npm run build:deploy`, then `npm test` and `npm run a11y`, then a preview deploy and the live site, each only with the owner's OK.
