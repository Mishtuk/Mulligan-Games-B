# Loop 30 review (boss, lens 10): loops 21-29

Shots here: `before-*` / `after-*` (7 paths at 390 and 1280, Motion on; Home 390 Motion off), `e2e-*` (5 forms posted
through the browser: JS good, JS bad email, JS off good, JS off bad), `after-play-*` (game cards at 320 and 390).
Runs (port 4380): build clean and `git status` clean after it; `npm test` 129/129; check-site PASS 7 paths; `npm run a11y` PASS.

## Loop 20's checks, run
- Forms: all 5 (Home/Shop want list, Events seat, Sell buylist, Visit contact) show a focused result in all 4 modes.
  JS: success panel, form hidden; bad email: error summary takes focus. JS off: `?sent=x#x-ok` / `?x=error#x-err` panel.
- Seed ids: `tools/seed-events.mjs` for 11-19, 11-20, 11-26 gives one id per night (9 shared nights between 11-19 and
  11-26, same ids); built Events select ids equal the 11-19 seed exactly. Tree clean after a build.
- 1280 dead space: mostly gone (Home want list, Shop guide pair, Visit). Left: Home Sealed box has an empty third
  slot, Shop Sealed band has a ~380px gap before Preorders, Visit 445 placard and Maps button sit ~550px apart, Events ends 352px early.
- Game labels: NOT readable at 390. "Warhamme / r and / tabletop" broke mid-word (3 columns, 87.8px for a 92px word,
  link had `overflow-wrap: anywhere`). Fixed below.

## Score (independent; loops 21-29 self-estimated 26-28)
Note: loop 20's table adds to 24, not 25. Baseline is 24.
| Axis | Found | After | Evidence |
|---|---|---|---|
| Card-shop identity | 4 | 4 | Every page has its shop object: hand, binder week, 7 game backs that now differ, singles case, box and pack on a shelf, pre-order slip, buylist receipt, We buy cards sign, clipboard, pairings sheet, 445 placard, misprint. No photos yet, and the singles case is 16 anonymous ASK cards. A 5 needs photos (owner). |
| Main actions | 4 | 4 | Events, Shop and Visit one tap away; Tonight above the fold at 390. Fee chips crowd Tonight: "Magic Academy: Deck Building" wraps to 4 lines beside an "Ask at the counter" chip. |
| Content truth | 4 | 4 | No invented facts; the unknowns rule is tested. An unknown fee shows 3 ways: "Ask at the counter" chip (Home), "Fee: ask at the counter" (special nights), "–" plus a legend sentence (Events). |
| A11y + motion | 4 | 5 | Found: the mid-word label break, and the loop-23 sticky Events column (1435px tall, stuck in a 900-1200px window) kept the Hold my seat button off screen for 200-400px of extra scroll. Both fixed. Check-site, a11y and the JS-off run pass. |
| Craft | 4 | 4 | Up from 3: 390 is tidy on every page and 1280 rhythm is much better. Gaps listed above stay. Home 390 Binder spends ~400px on two "Closed" pockets. |
| Code | 4 | 4 | CSS split checked by coverage script (`.work/cov30.mjs`): every class used on a page is defined in a CSS file that page loads, and no rule block loads twice. Deploy guard and JS-off run hold. `shop.css` is loaded by Visit and Sell too (misnamed). The sticky rule shipped on a wrong height assumption. |
| **Total** | **24** | **25/30** | |

## Riskiest changes, verified
- Loop 29 CSS split: OK (7 built pages checked; classes added by JS are defined in global).
- Loop 29 check-site skip (`r.top < header bottom`): keep, it is narrow enough. Header text is already skipped as
  "boxed" (the header has a background). Scroll steps are 0.75 x viewport, so text skipped under the 64px header was
  fully in view one step earlier (true for any element under ~150px tall). It cannot hide a real ground failure.
- Loop 28 unknowns rule (`test/voice.test.mjs`): holds over dist. The regex `counter(?!\b)` is odd but harmless. The rule says which words to use, not
  whether to show a chip at all. That is what made the chips (see Content truth).
- Loop 23 sticky Events column: UNDONE (events.css). The column is taller than every tested viewport, so sticking it only delayed the form.

## Fixed or undone this loop
- Home game labels: `.play-grid .pocket-title a` no longer breaks words; label .8rem under 600px (.85rem above), so
  "Warhammer / and / tabletop" breaks at word ends at 390 and fits on 2 lines at 320 (`after-play-*`).
- Events: sticky side column rule removed.

## Owner's ask: does each page read as a card shop? (single biggest gap / simplify)
- Home: yes. Gap: no photo of the room or the case. Simplify: fee chips on Tonight and Binder; Sunday's "Ask at the counter" chip takes 3 lines.
- Events: yes (pairings sheet, clipboard). Gap: rows are a plain table repeated 6 times with its header. Simplify: "–" fee chips and their legend.
- Shop: half. The case says "ASK" 16 times and nothing about what is in it. Simplify: the condition guide is open on Shop
  (about 1100px at 390) and folded on Sell. Show it the same way on both.
- Sell: yes, the strongest page. Simplify: the steps and the sign repeat "we check every card" and the rates line.
- Visit: yes (placard, taped hours, notice board). Gap: no storefront. Simplify: the footer repeats "Visit us" and the address on the Visit page.
- Accretion: yes, some. Small chips and footnotes added one loop at a time (fee chips, dash legend, "Same nights every week",
  duplicate facts). Loops 31-39 should cut more than they add.

## Priority list, loops 31-39 (simplify and finish, no new objects)
- 31 Home: show a fee chip only when the fee is known (Tonight + Binder); Sealed box at 1280 without the empty third slot (or Sell beside it fills the row); 390 Binder: Mon/Tue closed pockets shorter.
- 32 Events: cut "–" chips and the legend sentence; one header row for the sheet, not one per day; special-night fee chip on one line or gone.
- 33 Shop: shelf tags on the case rows (game names as text) so the case says what is in it; condition guide folded like Sell (one component, one state); close the Sealed band gap at 1280.
- 34 Sell: each fact once (steps vs sign); no additions.
- 35 Visit + chrome: Open in Maps beside the placard at 1280; drop the footer address block on /visit/ (like footer hours); 390 gap under "Open now".
- 36 A11y: add a "no word broken mid-word in pocket titles at 320/390/430" check to `npm run a11y`; JS-off waitlist panel at 200% x 390.
- 37 Identity: designer subtract pass (any object that carries no information goes); plan at most 2 marked photo slots (`patterns/ph.md`) for when the owner sends photos.
- 38 Copy: one way to show an unknown fee site-wide (none, plus one quiet line); remove duplicate lines found in 31-35.
- 39 Code: rename `shop.css` to what it is (shared forms/sheet styles); tidy the voice regex; dead-CSS sweep after 31-38; re-measure gzip.

## Loop 40 (review) should check
JS and JS-off results on all 5 forms (run); no word broken mid-word in any label at 320-430; no unknown-fee chip
left; Shop guide state matches Sell; count of small chips/footnotes per page is lower than now; 1280 gaps listed
above closed; independent score target craft 5 (from shots) or a named reason it cannot be.
