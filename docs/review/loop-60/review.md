# Loop 60 review (boss, lens 10): loops 51-59

Shots: 7 paths x 390/768/1024/1280/1600 Motion on (`<page>-<w>.png`), `home-390-motionoff.png` (same 6,712px layout, 564 px differ:
the switch label), `ig-after-click-390.png`, `after-*.png` (this loop's fixes). All 36 looked at in segments. Port 4360.
Scripts `.work/shots60.mjs`, `slice60.mjs`, `scrim60.mjs`, `ig60.mjs`, `rel60.mjs`, `word60.mjs`, `crop60.mjs`.
Runs: build clean; `npm test` 169/169; check-site PASS 7 paths; `npm run gaps` 0 on 7 x 5; `npm run a11y` PASS (server stopped).

## Risky 51-59 changes, verified
- **gaps exemption (55):** was NOT narrow. It exempted every unboxed child of `.wrap` (Home tonight/binder/releases/ig, Events
  layout, Sell/Visit/Privacy grids, 404 misprint), not just page titles. Narrowed to `header` blocks that hold the h1; gate still 0.
- **Scrim probe (56):** real. Text made transparent, pixels behind each `.rel` text box sampled. Proof: with the Star Trek scrim
  removed it fails 7 nodes at 390 and 1280 (2.3:1 headline); as built 50 nodes, 0 fails.
- **Instagram iframe (59):** works after a real mouse click: 0 third-party requests before, then one instagram.com iframe
  (sandbox `allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox`, `referrerpolicy=strict-origin`)
  shows the store's own championship poster; focus on Hide; Escape removes it and focus returns to Show.
- **D8 budget:** right in principle (client words never cut), loose in amount: +300 gzip for a 77-byte line, and the D7 headroom
  had already gone to ad CSS in 53-57. Home now 22,919 / 23,000 (81 left after this loop's +56). No further raise: loop 69 trims.
- **Release status:** boundaries correct in the store zone (out on the release day itself, gone after 90 days, year shown only when
  it differs; 2026-12-18 One Piece flips to Out now). Gap: with a stale build, if every ad goes stale the client leaves an empty
  "New releases" heading (first possible 2027-06-18). Truth lapse found: Delta Reign shipped as "Likely" with a definite date.

## Fixed this loop
1. Home Sell slab at 768: "Your cards" stacked one letter per line (7fr/5fr duo, slab kept `auto` mono column). Slab now stacks by
   container query (`.sell` under 22rem); a11y word probe now covers `.slab > *` at 768 and 1024 too (proved: catches the old CSS).
2. Instagram row 768-1600: cards ended 180px apart. Cards stretch, buttons share one baseline; an open post sets the row to start.
3. Delta Reign date verified (Bulbapedia, Siliconera, GamesRadar: Nov 6, 2026) -> Confirmed; ads now ship Confirmed rows only (test).
4. gaps.mjs exemption narrowed (above). Nothing undone.

## Owner feature verdict
Reads as real release advertising: Star Trek is a themed deep-space banner with official key art, owner's line "Star Trek has landed
at Mulligan.", products line and an honest "Pick up Star Trek at the counter"; standard sets are generic to their game (Pokemon
stripe, Riftbound navy/gold, Hololive pastel, One Piece drawn map), each with one date and a credit. Weak spots: every CTA lands on
the generic Visit contact form (no hold request), the Star Trek art shows no box or pack (product shots are allowed by rule 12),
Riftbound uses roadmap art, and "Look what showed up" carries no information. **Home is too long:** 390 went 4,520 -> 6,712px,
1280 2,674 -> 3,957px; the want list (a main action) now sits under two marketing sections, and the Sealed/preorders box repeats
the release ads with a tiny generic drawing.

## Score (independent; loops 51-59 self-scored 27-28)
| Axis | 50 | 60 | Evidence | 5 is reachable? |
|---|---|---|---|---|
| Identity | 4 | 4.5 | Home now carries real set imagery and the store's own Instagram promos; Events has the Star Trek party. Left: "Photo coming" slots on Visit/Events, Shop Sealed/Preorders slip says "Ask for the release date" while the site knows the dates, Home Sealed box is a flat rectangle, Privacy plain boxes. | Yes, without photos, if every page carries a card object with real information and no slot reads as missing (see below). Photos remain the strongest route. |
| Main actions | 4 | 4 | One tap from every page; Tonight above the fold; Hold a seat. Release CTAs end on a generic contact form; Find a card is a want list (no stock search). | Yes: bar allows "best possible request flow". |
| Content truth | 5 | 5 | After fix 3. Fees on Instagram cards are the store's own posts; unclear dates say "confirm with the store". | Held. |
| A11y + motion | 5 | 5 | check-site, a11y (incl. scrim, word probe now 768/1024), Escape/focus on posts, Motion off identical. | Held. |
| Craft | 4 | 4.5 | gaps gate 0 on 35 combos; this loop's two fixes. Left: Home 1024 want list (labels wrap 2 lines, Game field 30px lower, button wraps); Home 768 Sealed box 150px belly beside Sell; Sell 768 buylist box 43px short of the page edge; What we play leaves ~75px at 1280; Events 1024 ~100px hole left column. | Yes, all CSS. |
| Code | 5 | 5 | 169 tests, gates green, voice-test regex bug fixed (59), images sized and tested. Budget headroom 81 bytes. | Held if 69 trims. |
| **Total** | **27** | **28/30** | | |

## Exactly what makes each a 5
- **Identity (reachable):** (a) Shop Sealed/Preorders become one drawn object per release from `releases.json` (preorder slip with
  real set names and dates, same data as Home); (b) Home Sealed/preorders box goes (the release ads are the sealed shelf) or shows
  the out-now sets; (c) Star Trek ad shows the official box/pack product image from the WotC product page (rule 12, credited);
  (d) photo slots: placeholders stay honest, but each sits beside a drawn object so the page reads complete without the photo.
  Owner photos would still lift it most; without them the reviewer accepts a complete drawn family plus official product shots.
- **Actions (reachable):** every release CTA opens a hold request with the set prefilled (want-list form with `?game=&cards=`,
  same Worker, prepared statements, a test), the success panel says what happens next; Home want list back above the marketing
  sections or one tap from the hero; a "hold for me" flow that works with scripts off.
- **Craft (reachable):** fix the five defects above; `npm run gaps` gains an unequal-card-row check for nested grids (catches
  ragged rows like the Instagram one); pixel look at every page at 5 widths.

## Priorities 61-69 (aim: 29.5+)
- **61 Home:** cut length to <= 5,600px at 390: drop the Sealed/preorders box (fold into New releases), cut the "Look what showed up"
  card or give it real content, want list directly after Binder week or Tonight; fix 1024 want-list label wrap. Gaps 0.
- **62 Events:** Special nights link to the release they celebrate (Star Trek party -> ad); fix the 1024 left-column hole.
- **63 Shop:** Sealed + Preorders driven by `releases.json` (real sets, dates, status), each with "Hold one for me" -> prefilled request.
- **64 Sell:** 768 buylist edge; Home Sell slab look at 768/1024 after loop 60's stack.
- **65 Visit + chrome:** photo slots sit beside a drawn object (Visit: placard + storefront sign; Events: table drawing), no slot alone.
- **66 A11y:** prefilled request flow by keyboard, JS off and at 200%; empty "New releases" heading never shown when all stale.
- **67 Identity (designer):** Star Trek product shot (box/pack, official), Riftbound Legacy product art if published; object family audit.
- **68 Copy:** CTA bank for hold requests; One Piece "Out now" line should not say "pack" for decks.
- **69 Code:** trim Home CSS to <= 22,700 gzip (D7 line) before anything else; gaps nested-row check; client hides the section when
  every ad is stale (test); request prefill params escaped and tested.

## Loop 70 must check
Fresh 7 x 5 shots plus Motion off; Home height at 390; every release CTA ends in a stored hold request (JS on/off); Shop shows the
same sets as Home; budget <= 22,700 without a raise; gaps (with nested-row check), a11y, check-site all green; no Likely row ships.
