# Loop 50 final review (boss, lens 10): loops 41-49 and the whole site

Shots here: 7 paths at 390 and 1280 (Motion on), `home-390-motionoff.png`, `events-pokemon-390.png`, `events-magic-1280.png`,
`e2e-*` (forms). Port 4350. Scripts `.work/*50*.mjs`, `.work/ts50*.mjs` (live Turnstile check).
Runs: build clean; `npm test` 141 -> 147; check-site PASS 7 paths; `npm run a11y` PASS; `npm run build:deploy` refuses
(placeholder SITE_URL and empty Turnstile key, both named); `git status` after build shows only this loop's edits.

## Launch blocker fixed: Turnstile on the 5 forms
- One public setting, `TURNSTILE_SITE_KEY` (`SITE_KEY` in `src/lib/site.js`; a build-time env var wins). New
  `src/components/Turnstile.astro` before each submit button: `.cf-turnstile` (compact, interaction-only: invisible unless
  Cloudflare asks, 150px wide when it does, so 320px holds), a noscript line, and api.js once per form page.
- No key (local): nothing renders, no external script on any page (test), the Worker's LOCAL pass-through still works.
- `build:deploy` refuses an empty, test or malformed site key (test). CSP already allowed challenges.cloudflare.com in
  script-src, frame-src and connect-src (test).
- Live check with Cloudflare's test key in Chrome at 320 and 1280 on all 5 forms: 0 CSP violations, token
  `XXXX.DUMMY.TOKEN.XXXX` filled, no sideways scroll, the post carried `cf-turnstile-response` and showed the success panel.
  Worker test: the token goes to siteverify with the secret; good passes, bad fails.
- Privacy page names Cloudflare Turnstile only when a key is set (it would otherwise say all assets are first-party).

## Loop 40's checks, run
- Forms: 5 forms x 4 modes (JS good/bad, JS off good/bad) = 20/20 end on a focused result panel (`e2e-*`).
- Filter states: 42 width x filter runs (800-1600 x all/magic/pokemon/tabletop/dnd/one-piece): header row matches every row
  (+-2px), 0 misaligned; Pokemon/One Piece/D&D hide the whole sheet with one line; a11y reads `#ev-status` per game.
- Accretion vs loop 40's build (rebuilt from 3a4bf79): words Home 421 -> 419, Events 586 -> 570, Shop 328 -> 313,
  Sell 321 -> 319, Visit 202 -> 200; chips and notes equal (11/7/5/2/2, 4/6/6/8/4). Lower overall, nothing added.
- Fresh shots: all 15 looked at. 390 tidy on every path; no mid-word breaks (a11y check).
- Craft 5: not reached; named reasons below.

## Score (independent, from shots and runs; loops 41-49 self-estimated 26.5-28)
| Axis | 40 | 50 | Evidence |
|---|---|---|---|
| Card-shop identity | 4 | 4 | Hand, even 3x3 binder, sleeve swatches in the Events Game column, case rows patterned by shelf tag, box + pack, preorder slip, buylist receipt, We buy cards sign, clipboard, 445 placard, misprint. 5 needs real photos. |
| Main actions | 4 | 4 | Events / Shop / Visit in nav and hero, Tonight above the fold at 390, Hold a seat in its own column. "Find a card" is still a want list: no stock search until a hosted store exists. |
| Content truth | 5 | 5 | No invented fact; unknown fees show nothing; unsourced age and deposit lines cut (48); no "Photo coming" on a deploy build (49); privacy now honest about Turnstile. |
| A11y + motion | 5 | 5 | check-site and a11y pass (320-1280, 200%, JS off, AX tree per filter); filter result announced (46); Motion off shot identical in layout. |
| Craft | 4 | 4 | Loop 40's four gaps closed (binder gaps, 390 hero gap, Shop right third + strip, Visit band gap). Left: Home 1280 Sealed and preorders box leaves its right third empty while Sell to us beside it ends halfway; Shop 1280 Sealed shelf art sits in half its column. |
| Code | 4 | 5 | Launch blocker closed with tests in both modes and a live browser run; deploy guard covers domain, key and photos; gzip under the 19,200 budget; npm audit 0 (49); dead-CSS sweep clean. |
| **Total** | **26** | **27/30** | |

## The journey (independent scores)
Loop 10: 23 · loop 20: 25 · loop 30: 25 · loop 40: 26 · loop 50: 27 /30. Self-scores ran 2-7 points high every decade;
each review re-scored from shots and runs.

## Strongest
- Events: a real pairings sheet with per-game swatches, honest empty states, sign-up with seats/waitlist, .ics per night.
- Sell: buylist slip that reads like a counter receipt, works with scripts off, stores rows by prepared statements.
- Safety rails: no invented facts (tests over dist), strict CSP with no inline code, deploy build refuses every placeholder.

## Gaps only the owner can close
- Photos (storefront, play room): identity 5 and the Visit/Events slots.
- A hosted store / POS for a real "Find a card" search.
- Phone, email, Discord; weekly fees; buylist rates; which nights run for Pokemon, One Piece, Hololive, Riftbound.
- Cloudflare account, D1, Turnstile key + secret: the Worker has never run on a real account. Sign-up nights need a re-seed
  at least every 3 weeks (README). With Turnstile on, a visitor with scripts off cannot send a form (the noscript line says so).

## Owner launch checklist (same as README "Owner launch checklist")
- [ ] Domain -> `SITE_URL` in `src/lib/site.js`.
- [ ] Photos by `docs/photo-swap.md` -> `store.json photos.*`.
- [ ] Phone and email (or "form only"); Discord invite (one of the two found).
- [ ] Weekly nights, times and fees; buylist rates / store-credit bonus; hosted store for singles, if any.
- [ ] Cloudflare: account, `wrangler d1 create mulligan` + id in `wrangler.jsonc`, schema, seed nights.
- [ ] Turnstile: widget for the domain, site key in `src/lib/site.js`, `wrangler secret put TURNSTILE_SECRET`.
- [ ] Who reads sign-ups and messages (D1 rows), and deleting data on request.
- [ ] `npm run build:deploy`, `npm test`, `npm run a11y`, then preview and live deploy, each only with the owner's OK.
