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
node tools/check-site.mjs http://localhost:PORT / /events/ /shop/ /sell/ /visit/ /privacy/ /nope   # overflow, motion, ids, focus, contrast, console/CSP (needs the server running)
npm run a11y         # browser check at 320-1280, 200% zoom, JS off, hold flow, submits every form (starts its own server; stop yours first)
npm run gaps         # dead-space and column-hole check at 5 widths on the given paths (default /; `npm run gaps -- / /shop/`); `npm run gaps:selftest`
npm run check:all    # all of the above in order with timeouts (build, test, check-site on 7 paths, a11y, gaps) and one PASS/FAIL summary; exit 0 = all green
npm run build:deploy # production build: refuses a placeholder SITE_URL or an empty Turnstile key
```
check-site, a11y and gaps drive a local Chrome or Edge (set `CHROME` to a path if neither is found). A build older than your edits is stale: tests and checks read `dist/`, so run `npm run build` first (check:all does).

## Releases data upkeep (`src/data/releases.json`)
Home New releases, Shop Sealed (out) and Shop Preorders (coming) all read this one file. Only rows with `"certainty": "Confirmed"` show (a date on an ad is stated as fact). To add a set: copy a row and set `id`, `game`, `gameId` (a value from `games.json`), `name`, `releaseDate` (YYYY-MM-DD), `types` (what it is, for the hold line), `theme`, `unit` ("box" or "deck"), `credit` and `sourceUrl` (publisher page), `certainty`; add the source and terms to `docs/research/releases.md`. To retire a set: delete its row (or do nothing: it hides itself 90 days after `releaseDate`); old `?hold=<id>` links still land on the want list with a generic line. Never add a price or a stock claim.
Image: use the publisher's own art or product shot only. Save widths to `public/media/releases/` as WebP plus a JPEG fallback (key art 480 and 960 wide, a product shot 240 to 480; keep each file under about 30 KB; `sharp` is already in `node_modules`: `node -e "require('sharp')('in.png').resize(960).webp({quality:78}).toFile('public/media/releases/x-960.webp')"`). In the row, `image` / `product` take `webp: [[url, width], ...]`, `jpg`, `width`, `height` and an `alt`; `credit` is shown once under the Shop pockets. Then `npm run build && npm test` (tests check credit, sizes, lazy loading and the one-image-per-ad rules).

## Stale builds and data
Nothing is fetched at run time except Cloudflare's Turnstile script and, after a tap, one Instagram post. Sets, nights and the sign-up seed are baked in at build: a site that is not rebuilt keeps its last list (in the browser, Home's New releases and the Shop pockets still flip Coming to Out now, a Shop pocket moves from Preorders to Sealed, and sets hide 90 days after release; the nights sheet rotates to today), and Events sign-ups stop matching D1 after about 3 weeks, so re-run the seed (above) when you rebuild.

## Docs
`CONTEXT.md` (rules, owner instructions), `DECISIONS.md`, `DESIGN.md` (tokens, components, pages),
`HANDOFF.md` (current state), `docs/refinement-plan.md` and `docs/refinement-log.md` (the refinement loops),
`docs/loop-brief.md`, `docs/review/` (reviews and screenshots), `docs/research/`.

## Owner launch checklist
None of these can be guessed; the build never invents them. Data first, deploy last.
- [ ] **Domain**: set `SITE_URL` in `src/lib/site.js` (now the placeholder `https://mulligangames.example`; feeds canonical, sitemap, robots, og:image, JSON-LD). `npm run build:deploy` refuses the placeholder (and a missing Turnstile site key, below).
- [ ] **Photos**: storefront and play room, no people, by [docs/photo-swap.md](docs/photo-swap.md) into `src/data/store.json` `photos.*`. A null photo shows a marked "Photo coming" box on `npm run build` and nothing at all on `build:deploy`.
- [ ] **Phone and email** (`store.json` `phone`, `email`) or confirm "form only"; **Discord** invite (`discord`; two were found, confirm which).
- [ ] **Weekly nights, times and fees** (`src/data/events.json`; a null `fee` shows nothing; add Pokemon, One Piece, Hololive, Riftbound nights if they run). **Buylist rates** and store-credit bonus (or keep "Rates are set at the counter"); a hosted store for singles, if any.
- [ ] **Cloudflare**: account, then `wrangler d1 create mulligan` and put the id in `wrangler.jsonc`; `wrangler d1 execute mulligan --remote --file schema.sql`; seed nights with `node tools/seed-events.mjs > .work/seed.sql` then `wrangler d1 execute mulligan --remote --file .work/seed.sql` (safe to re-run; rebuild and re-seed at least every 3 weeks).
- [ ] **Turnstile** (spam check on the 5 forms): create a widget in Cloudflare for the real domain, put its public **site key** in `src/lib/site.js` (`SITE_KEY`, or the `TURNSTILE_SITE_KEY` env var at build) and run `wrangler secret put TURNSTILE_SECRET`. With a key, each form gets the widget (invisible unless Cloudflare asks) and the page loads Cloudflare's script (CSP already allows it); without one, nothing renders. `npm run build:deploy` refuses an empty or test site key; the Worker refuses posts without a token once the secret is set.
- [ ] **Publisher images and stock**: OK to show the publisher images (Wizards, Pokemon, Bandai, Cover) credited on the site, and which sets the store really stocks and takes holds and preorders on. Only those belong in `src/data/releases.json`.
- [ ] **Instagram card facts**: the $15 / $30 championship fees and the cEDH dates (Dec 6, Jan 3, Feb 7, Mar 7) in `src/data/instagram.json` come from the store's own posts; confirm they are right. The embed loads instagram.com only after a visitor taps "Show this post" (the privacy page says so).
- [ ] **Hold requests**: a hold on Shop or Home arrives as a want-list row in D1 ("Hold: <set> (...)"). Who reads these and how fast? The page promises "We will email you back".
- [ ] **Releases upkeep (monthly)**: see below. Rebuild and redeploy at least monthly; new sets appear only after you add them and rebuild.
- [ ] **Who reads sign-ups and messages** (D1 rows) and how; deleting data on request (the privacy page promises it).
- [ ] **Build and deploy**: `npm run check:all` (build, tests, check-site, a11y, gaps; it rebuilds `dist/`, so run it first), then `npm run build:deploy`, then a preview deploy and the live site, each only with the owner's OK.
