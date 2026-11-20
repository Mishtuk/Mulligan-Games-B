# Loop 70 review (boss, lens 10): loops 61-69

Shots: 7 paths x 390/768/1024/1280/1600 Motion on (`<page>-<w>.png`, final state), `home-390-motionoff.png` (same 5,543px; 1,159 px
differ, all in y 6-53 = the switch label), `before-shop-*.png` / `before-home-*.png` (as found), `nojs-*.png`. All looked at.
Ports 4370 (site) + 4371 (site + a row dump of the in-memory D1, scratch copy of serve.mjs, deleted). Scripts `.work/shots70.mjs`,
`slice70.mjs`, `hold70.mjs`, `nojs70.mjs`, `btn70.mjs`, `trek70.mjs`, `shop70.mjs`, `gz70.mjs`.
Runs (final): build clean; `npm test` 178/178; check-site PASS 7 paths; gaps 0 on 7 x 5 + selftest; `npm run a11y` PASS (server stopped).

## Loop 60 "Loop 70 must check", run
| Check | Result |
|---|---|
| Home 390 <= 5,600px | 5,488 as found, 5,543 after fix 3 below. 1280 3,514. Pass. |
| Every release CTA ends in a stored hold request, JS on | 15/15 links (5 Home ads + 10 Shop links) -> prefilled set + game, focus on the field, status line, submit -> D1 row read back with the right game and line. Pass. |
| Same, JS off | Lands in view on the empty request form, game "Magic", no mention of the set; a row is stored only if the visitor types the set. No-JS success panel shows by `:target`. **Partial: hand to 73.** |
| Shop shows the same sets as Home | Same 5 ids, same dates (Sealed = out, Preorders = coming). Pass. |
| Budget <= 22,700 gzip, no raise | Home 22,495 (was 22,283 at 69; +212 = this loop's CSS move + inset rule + CTA). 205 left. Pass. |
| gaps (nested rows), a11y, check-site | Green. But gaps is blind to one-column holes (Sell 1280, below) and did not see unstyled pockets. |
| No Likely row ships | 5/5 releases Confirmed; no "Likely/Unverified" in any built page. Pass. |

## Judged (owner words)
- **Star Trek ad still sells?** No, it had gone soft: "Star Trek has landed at Mulligan." over a bare "Hold one for me" (one of what?).
  Owner asked for "shop now, buy latest Star Trek". **Fixed:** featured CTA now "Get Star Trek: hold one for me" (`cta` in releases.json,
  one line at 320-1600, honest: still the hold flow, no checkout words; voice + releases tests assert it; DESIGN glossary updated).
- **What we play cut (61): keep it cut.** Weekly nights are all Magic + one Tabletop night; the band's links to Pokemon, One Piece,
  Riftbound, Hololive sent people to "No <game> nights listed." The release ads now carry the other games on Home with real sets.

## Found and fixed this loop
1. **Shop Sealed/Preorders pockets unstyled since loop 63** (7 loops, self-scored craft up meanwhile): the pocket core rules lived in
   home.css, so Shop pockets had no title bar, no padding, buttons flush to the border (`before-shop-1280.png`). Moved to
   pocket.css (loaded by Pocket.astro); Home pixel-identical apart from the CTA. New test: every page with a pocket loads
   `.pocket-title/body/foot` (proved: fails on the old CSS).
2. Shop pockets: buttons now fill the foot at every width (were 155 vs 192px side by side), rows end together (were ragged by up to
   55px), 768 stacks Sealed over Preorders with 3 pockets a row (side by side they were 125px wide, buttons and dates wrapped).
3. Home 390 Star Trek headline ran into the Bundle inset ("TREK" under the box): headline starts below the inset under 720px
   (glyph rects measured 320-1280: no overlap). Nothing undone.

## Score (independent; loops 61-69 self-scored 28.5-29.5)
| Axis | 60 | 70 | Evidence |
|---|---|---|---|
| Identity | 4.5 | 4.5 | Home: binder, themed release ads with official art + product shot, store's own posts. Shop pockets read as cards only after fix 1. Left: 4 of 5 Shop pockets are a generic drawn box/pack (official product shots allowed, rule 12), Riftbound still roadmap art, Privacy is plain boxes. |
| Actions | 4 | 4.5 | Hold flow real end to end (15/15 stored, JS on); want list right after the binder; one tap to all three actions. Left: JS-off hold loses the set; Events game chips for 4 games end in "No <game> nights listed." with no next step. |
| Truth | 5 | 5 | Confirmed rows only; fees only where the store posted them; "confirm with the store" lines. |
| A11y + motion | 5 | 5 | check-site, a11y (hold flow keyboard/JS off/200%), Motion off identical layout. |
| Craft | 4.5 | 4.5 | Fixes 1-3. Left: Sell 1280/1600 aside ends ~385px above the slip (one-column hole gaps cannot see); Home 1024 "Send my want list" wraps to 2 lines (flagged at 60, still there); Home Sell box at 1280+ leaves the button floating top-right over empty space. |
| Code | 5 | 5 | 178 tests, budget held, nested-row gaps check; pocket-CSS test closes the hole that let fix 1 slip. |
| **Total** | **28** | **28.5/30** | Before this loop's fixes the site was really 28 (craft 4: broken Shop pockets). |

## Gap to 5, honestly
- **Identity (reachable, no owner):** official product shots for the other 4 Shop pockets and Home cards where the publisher has one
  (Pokemon ETB, One Piece deck box, Riftbound Legacy booster, Hololive pack), credited in releases.md; Privacy gets one paper object
  (a receipt-style "what we keep" slip, same family as the buylist). Real shop photos would lift it further: owner-blocked, not required.
- **Actions (reachable):** JS-off hold keeps the set; Events chips with no nights say what to do. Live stock search: owner-blocked
  (no hosted store), and the bar accepts the best request flow.
- **Craft (reachable, CSS):** the three defects above + a gaps check for one-column holes (column bottoms in a 2-column grid > 120px apart).

## Priorities 71-79 (aim 29.5; each loop keeps all gates green, Home <= 22,700 gzip, Home 390 <= 5,600px)
- **71 Home:** 1024 want-list button on one line (labels/columns, not font size); Sell box at 1280/1600 sits as one row (slab grows or
  button joins the slab foot), no floating button. Shots 5 widths.
- **72 Events:** chips for games with no nights: the empty state says what is on instead + "Ask us" link (no new facts); 1280
  right/left column ends within 120px.
- **73 Shop:** JS-off hold: hold links go to `#hold-<id>`; per-set `:target` line in the request section ("Hold for <set>: write the
  set name below" or better), hidden when hold.js runs; update the a11y gate's JS-off target check. Re-run `.work/hold70.mjs` JS off.
- **74 Sell:** 1280/1600 aside hole: move the 1-2-3 steps into the aside under "We buy cards" (or make the aside sticky + fill), page
  shorter, gaps 0.
- **75 Visit + chrome:** 404 top gap at 390 (~90px above the card); Visit hero left column vs storefront top edges align.
- **76 A11y:** a11y gate for the 73 JS-off flow; `tools/gaps.mjs` one-column-hole check with selftest (catches Sell 1280 before 74's fix).
- **77 Identity (designer):** official product shots for Pokemon, One Piece, Riftbound, Hololive (product pages only, credited, sized
  like the Star Trek bundle, <30 KB each); Privacy paper object.
- **78 Copy:** DESIGN.md Pocket section still says products.json / "Ask in store" (stale since 63); copy sheet for 70-77 changes.
- **79 Code:** budget after 77's images (images are not in the gzip budget, but check lazy + sizes tests); dead CSS sweep; README launch
  checklist delta below written in.

## Loop 80 (final) must check
Fresh 7 x 5 shots + Motion off and the JS-off shots; `.work/hold70.mjs` (all CTAs, JS on and off, rows read back); Shop pockets
styled at 5 widths; Star Trek CTA wording; gaps (with the new column check), a11y, check-site, tests, budget <= 22,700, Home 390
<= 5,600; no Likely row; every page one click from the nav. Score from evidence only.
**Owner launch checklist delta since loop 50** (README not yet updated): (1) OK to show publisher images for the 5 sets, and which
sets the store really stocks / takes holds and preorders on; (2) Instagram card facts: $15/$30 championship fees and the cEDH dates
(Dec 6, Jan 3, Feb 7, Mar 7); (3) hold requests arrive as want-list rows: who reads them and how fast ("We will email you back");
(4) refresh `releases.json` with new sets and rebuild at least monthly (status flips client-side; stale sets hide); (5) the Instagram
embed loads instagram.com only after a tap (privacy page says so); (6) weekly nights for Pokemon/One Piece/Riftbound/Hololive if they run.
