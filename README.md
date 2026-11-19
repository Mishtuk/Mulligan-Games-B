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

## Owner to-dos before launch
- Set `SITE_URL` in `src/lib/site.js` (now the placeholder `https://mulligangames.example`; used by canonical, sitemap, robots, og:image, JSON-LD).
- Send real photos (two marked slots: Visit storefront, Events play room; see "Photo slots" in `HANDOFF.md`).
- Give the phone number and email to publish, weekly fees, buylist rates, Discord invite.
- Seeding D1 (`tools/seed-events.mjs`) and any Cloudflare deploy need the owner's OK first.
