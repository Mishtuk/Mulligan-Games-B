# Loop 80 final review (boss, lens 10): loops 71-79 and the whole site

Shots here: 7 paths x 390/768/1024/1280/1600 (`<page>-<w>.png`, final build), `home-390-motionoff.png` (same 5,543px as Motion on),
`stale-build-shop-1280.png` (a Nov 1 build opened on Nov 20), `shop-stock-*.png`, `visit-band-*.png`, `slices/` (crops and montages).
All looked at. Scripts `.work/*80.mjs` (shots, hold + D1 row dump, JS-off landing, stale build, pocket rows, Visit band, footer end).

## Runs
- `npm run check:all` as found: **5/5 PASS** (build, test 179, check-site 7 paths, a11y, gaps 7 paths). After this loop's fixes: 5/5 PASS, 183 tests.
- Loop 70 "Loop 80 must check", run: every hold CTA (5 Home ads + 10 Shop links) with JS on: 15/15 prefilled set + game, focus, status
  line, D1 row read back with the right game and line. JS off: lands on the per-set line in view; 15/15 rows stored once the visitor
  types (game stays on Magic unless picked: the line now says which game to choose). Shop pockets styled and aligned at 320-1600.
  Star Trek CTA "Get Star Trek: hold one for me". gaps 0 (incl. one-column holes), a11y, check-site green. Home 22,593 gzip
  (budget 22,700, D9; 107 left). Home 390 5,543px (<= 5,600). 5/5 releases Confirmed, no Likely/Unverified in dist. Every page links
  Events, Shop, Sell, Visit, Privacy in the nav/footer; logo goes Home.

## Fixed this loop
1. **Stale Shop (loop 79 note):** new `public/js/shop-live.js` reuses Home's release logic (`shownReleases`, `isOut`, `dateLine`): a pocket
   built as "coming" that is out moves from Preorders to Sealed (newest first), its date line, hold line and drawn shape follow, sets 90+
   days past release hide, an emptied column shows its "Nothing ... yet" line. Runs before `hold.js`, so a prefill uses the right line.
   Proved in Chrome with a Nov 1 build opened on Nov 20 (Star Trek and Delta Reign moved to Sealed, "(sealed product)" prefilled) and by
   3 fake-DOM tests (fail with the move removed). `SITE_NOW` now also fixes the Shop build date (as Home).
2. JS-off hold line names the game for non-Magic sets ("... and choose Pokemon as the game."), test.
3. Shop pockets share title/art/text/foot rows (CSS subgrid): a 3-line title pushed its art 40px below its neighbour's; drawn packs and
   product shots now one 4:3 window. Measured: every row's art, foot and bottom equal at 320/390/768/1024/1280/1600. Credit line centred.
4. Visit band at 1000+: the storefront fills the band beside the placard (a 330px empty gap sat between them at 1280; now 36px).

## Score (independent, strict; loops 71-79 self-scored 29-29.5)
| Axis | 70 | 80 | Evidence |
|---|---|---|---|
| Identity | 4.5 | 4.5 | Binder week, themed release ads with official art, toploader-family pockets with 3 official product shots, singles case, buylist slip + We buy cards sign, clipboard, pairings sheet, 445 placard + storefront, misprint 404. Left: no real photos (Visit/Events show drawn stand-ins and, on preview builds, "Photo coming"), Riftbound and Hololive pockets are drawn packs (no publisher shot exists yet), Privacy is still mostly labelled boxes. |
| Actions | 4.5 | 5 | Events, Shop, Visit one tap from every page; Tonight above the fold at 390; every release CTA ends in a stored request (JS on and off, 30/30 rows); empty game chips say what is on instead + Ask us; Shop columns now right on any day. Live stock search is owner-blocked; the request flow is the best one possible without it. |
| Truth | 5 | 5 | Confirmed rows only, fees only where the store posted them, "confirm with the store" lines, no jargon in dist. |
| A11y + motion | 5 | 5 | check-site and a11y (320-1280, 200%, JS off, hold flow, forms) green; Motion off shot identical in layout. |
| Craft | 4.5 | 5 | Loop 70's three defects closed (Sell hole, Home 1024 button, Sell box), plus pocket rows and Visit band this loop; gaps 0 on 7 paths x 5 widths; no gap over 120px seen in 36 shots. Nits under the bar: Home 390 Riftbound ad ~60px empty foot (equal-height cards), Star Trek pocket title bar has spare sky (the price of aligned art). |
| Code | 5 | 5 | 183 tests, check:all one command, budget held without cutting words, no HTML sinks, audit 0 (79). |
| **Total** | **28.5** | **29.5/30** | |

**Owner's target (29.5+): met.** 30 needs identity 5, which needs the owner: real storefront and play-room photos (and ideally the singles
case), plus publisher product shots for Riftbound and Hololive once they exist.

## The journey (independent scores)
Loop 10: 23 · 20: 25 · 30: 25 · 40: 26 · 50: 27 · 60: 28 · 70: 28.5 · 80: 29.5 /30. Self-scores ran 0.5-7 points high; every review
re-scored from shots and runs, and two found real breakage the self-scores missed (loop 20 sign-up, loop 70 unstyled Shop pockets).

## Strongest
- It reads as a card shop: binder week on Home, pocket and toploader family, buylist receipt, pairings sheet, all drawn with tokens.
- Owner asks delivered: release ads with official art that sell ("Get Star Trek: hold one for me"), the store's own Instagram posts,
  click-to-load only. Holds work end to end with scripts on and off.
- Safety rails: no invented facts (tests over dist), strict CSP with no inline code, deploy build refuses every placeholder,
  one `npm run check:all` gate.

## Left, and who can close it
| Item | Who |
|---|---|
| Photos (storefront, play room) for identity 5 | Owner |
| Hosted store / POS for a real singles search | Owner |
| Phone, email, Discord; weekly fees; buylist rates; Pokemon/One Piece/Riftbound/Hololive nights | Owner (store) |
| Which sets the store stocks and takes holds on; OK for publisher images; Instagram card facts | Owner (store) |
| Domain, Cloudflare account, D1, Turnstile key + secret; who reads rows; deploy OK | Owner |
| Riftbound / Hololive product shots when publishers post them; Home gzip has 107 bytes left | Team (next data refresh) |

## Owner launch checklist (same as README "Owner launch checklist")
- [ ] Domain -> `SITE_URL` in `src/lib/site.js`.
- [ ] Photos by `docs/photo-swap.md` -> `store.json photos.*`.
- [ ] Phone and email (or "form only"); Discord invite (one of the two found).
- [ ] Weekly nights, times and fees; buylist rates / store-credit bonus; hosted store for singles, if any.
- [ ] Cloudflare: account, `wrangler d1 create mulligan` + id in `wrangler.jsonc`, schema, seed nights (re-seed every 3 weeks).
- [ ] Turnstile: widget for the domain, site key in `src/lib/site.js`, `wrangler secret put TURNSTILE_SECRET`.
- [ ] Publisher images OK, and which sets the store stocks / takes holds and preorders on (only those in `releases.json`).
- [ ] Instagram card facts: $15 / $30 championship fees and cEDH dates (Dec 6, Jan 3, Feb 7, Mar 7).
- [ ] Hold requests arrive as want-list rows: who reads them and how fast ("We will email you back").
- [ ] Releases upkeep: add new sets and rebuild at least monthly.
- [ ] Who reads sign-ups and messages (D1 rows), and deleting data on request.
- [ ] `npm run check:all`, then `npm run build:deploy` (last, it is the build that ships), then preview and live deploy, each only with the owner's OK.
