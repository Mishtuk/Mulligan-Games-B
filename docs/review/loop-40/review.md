# Loop 40 review (boss, lens 10): loops 31-39

Shots here: `before-*` / `after-*` (7 paths at 390 and 1280, Motion on; Home 390 Motion off), `events-pokemon-1280.png`
(the filter dead end found), `photo-fake-*` (photo slot <img> branch). Port 4340. Scripts `.work/*40*.mjs`.
Runs: build clean; `npm test` 137 -> 138; check-site PASS 7 paths (before and after); `npm run a11y` PASS (after).

## Loop 30's checks, run
- Forms: all 5 forms (Home/Shop want list, Events seat, Sell buylist, Visit contact) x 4 modes (JS good, JS bad email,
  JS off good, JS off bad) = 20 runs, each ends on a focused result panel (`.work/e2e40.mjs`).
- Mid-word breaks 320-430: none (the a11y check loop 36 added passes). Unknown-fee chips: none in pages or .ics (test + shots).
- Shop guide = Sell guide: one component, both closed ("Show condition guide"). Pass.
- Accretion (`.work/count40.mjs`, loop 30 build vs now, footer excluded): chips Home 24 -> 11, Events 17 -> 7, others equal;
  words Home 474 -> 421, Events 689 -> 616, Sell 396 -> 321, Shop 342 -> 328, Visit 201 -> 194. Notes: Events 12 -> 6 after this loop (words 586), others flat.
- 1280 gaps: Home empty sealed slot closed; Visit Maps now beside the placard but the photo box sits ~250px away at the far
  right; Shop Sealed/Preorders leave the right third empty and an 88px blank strip sits between the band and the footer.
- Craft 5: not reached. Named reasons under Craft.

## Score (independent, from shots and runs; loops 31-39 self-estimated 25-30)
| Axis | Found | After | Evidence |
|---|---|---|---|
| Card-shop identity | 4 | 4 | Hand, binder page, 7 game sleeves, case with shelf tags, box + pack, preorder slip, buylist receipt, We buy cards sign, pairings sheet, clipboard, 445 placard, misprint. No photo; the case is 16 anonymous backs in mixed patterns. 5 needs photos. |
| Main actions | 4 | 4 | Events / Shop / Visit in the nav and hero, Tonight above the fold at 390, Hold a seat jumps to the form. "Find a card" is still a want list (no stock search until the owner picks a hosted store). |
| Content truth | 4 | 5 | Found: Home sleeves link to `?game=pokemon` (also One Piece, Hololive, Riftbound): the sheet showed its header row over 7 "No nights for this game on X" lines (`events-pokemon-1280.png`). Fixed. No invented fact; unknown fee shows as nothing everywhere (test). |
| A11y + motion | 5 | 5 | check-site + a11y pass. AX tree: 5 tables, 25 column headers, 13 row headers, the visible header row not exposed. Found and fixed: hidden thead names were upper-cased by dead CSS; Sell sticky column hid its guide bar in windows under ~580px. |
| Craft | 4 | 4 | 390 tidy everywhere. Events Format now one line ("Commander Open Play" was 2). Left: Home 1280 binder rows have ~60px gaps and uneven pocket heights; Home 390 48px blank above the hero; Shop 1280 right third empty + 88px blank strip; Visit band middle gap. |
| Code | 4 | 4 | CSS coverage: nothing missing, no rule loaded twice on 7 pages (rename held). Found: loop 39 raised the gzip budget 19,200 -> 19,550 with no page over it (reverted, rule says trim first); dead `.pairings thead th` block; day-none markup. |
| **Total** | **25** | **26/30** | |

## Riskiest changes, verified
- Loop 32 hidden thead + visible header: header x matches every row's cells (+-2px) at 800, 900, 1024, 1100, 1280, 1440,
  1600 x filters all/magic/pokemon/tabletop/dnd/one-piece (`.work/hdr40.mjs`). Screen readers get real per-table headers.
- Loop 35/36 sticky Sell column with `:has()`: sticky only with the guide folded (open -> static). At 1280x500 the column
  (474px + 88px top) overflowed the window and hid the guide bar. Now also needs `min-height: 38rem`; a11y checks 500/700/800.
- Loop 39 rename `shop.css` -> `shared.css`: coverage script clean; no stale import or doc pointer that matters.
- Loop 37 photo slots: built with fake photos in store.json -> `<img>` with src, alt, width, height (+srcset/sizes),
  no "Photo coming", pages-c test passes; store.json restored (no diff). Note: the Visit slot renders 256x94 at 1280, a thumbnail.
- Loop 37 cuts (footer hazard stripe, 16 ASK stickers, 4 tape pieces): no identity lost; each carried no information.

## Fixed or undone this loop
- Events filter: a day with no shown rows hides; a game with no nights hides the whole sheet (header row too) and says
  "No Pokemon nights on our list yet." (the footnote under it already says "Confirm with the store") Cut the day-none lines. Test added.
- Events columns 10/12/25/9/44 -> 8/12/30/9/41 and stacking at 42.5rem (was 40rem): no Seat wrap, no "$1/0" sticker wrap,
  Format on one line, checked 700-1600. Dead `.pairings thead th` rule cut.
- Sell sticky side column only in windows >= 38rem tall (a11y case added at 1280x500).
- Budget gzip back to 19,200.

## Owner's ask ("make it more reflect a card shop"): one change per page for the final stretch
- Home: make Binder week a true 9-pocket page at 1280 (it already has 9 pockets): equal 5:7 pockets, no row gaps.
- Events: each row's Game cell carries that game's sleeve swatch (the Home g-* pattern), so the sheet reads by game.
- Shop: case rows use the sleeve patterns of the games on their shelf tag, not a random mix.
- Sell: none needed (strongest page). Customer confusion only: "LINES: 0" next to an empty first row.
- Visit: when the storefront photo arrives it should lead the band (wide), not sit as a 256px thumbnail.
- Confusing to a real customer: "Photo coming" boxes on a live site; chips for games with no listed nights (now explained);
  no phone or email anywhere (form only); Discord missing. All owner items except the photo-box rule (loop 49).

## Priority list, loops 41-49 (launch quality; cut more than add)
- 41 Home: Binder week as an even 9-pocket page at 1280 (equal heights, no row gaps); trim the 48px above the hero at 390.
- 42 Events: game sleeve swatch in the Game cell (reuse g-*, aria-hidden); 390 sheet shorter (closed days, Add to calendar weight).
- 43 Shop: case rows patterned by their shelf tag's games; fill or close the 1280 right third of Sealed/Preorders; remove the 88px strip above the footer.
- 44 Sell: "LINES" total only once a card name is typed; no other additions.
- 45 Visit + chrome: Visit band at 1280 without the middle gap (placard + Maps left, photo slot right sized for a 2:1 photo); 404/privacy one pass.
- 46 A11y: screen-reader pass of the Events filter states (status message announced, hidden days gone from the AX tree); 200% at 1280 on Events/Sell.
- 47 Identity: designer pass on 41-43 shots only; no new objects. Prepare swap notes for the 2 photos.
- 48 Copy: final read of every page aloud; one fact once; headings rule; the Confirm/Ask glossary.
- 49 Code: `build:deploy` refuses a placeholder photo or renders nothing for a null photo (no "Photo coming" on a live site), plus test; re-measure budget; dead-CSS sweep.

## Loop 50 (final review) must check
All 5 forms in 4 modes (run); filter states incl. games with no nights; header alignment 800-1600; craft 5 or named
reason; fresh shots of all 7 paths both widths + Motion off; accretion count lower than loop 40's; `git status` clean after build.
Launch-readiness checklist for the owner (none of these can be guessed by the team):
- [ ] Real domain -> `SITE_URL` in `src/lib/site.js` (`build:deploy` refuses the placeholder).
- [ ] Photos: storefront and play room (no people without consent) -> `store.json photos.*` (swap steps in HANDOFF).
- [ ] Phone and email to publish (or confirm "form only"); Discord invite (one of the two found).
- [ ] Weekly nights, times and fees confirmed (Pokemon, One Piece, Hololive, Riftbound nights to add if they run).
- [ ] Buylist rates / store-credit bonus (or keep "Rates are set at the counter"); hosted store for singles, if any.
- [ ] Who reads form sign-ups and messages (D1 rows), and how; deleting data on request (privacy page promises it).
- [ ] Cloudflare account + D1 database for the Worker; OK to deploy a preview, then the live site.
