# Loop 7 design review (card-shop identity and visual craft)

Shots: `before-*` and `after-*` in this folder, 390 and 1280, full page. Heuristics are Nielsen 0-4 x10 (/40); audit is /20
(type, colour, spacing/rhythm, card-shop identity, consistency, 0-4 each). Scores are before -> after.

| Page | Heuristics /40 | Audit /20 | Reads as a card shop at a glance? |
|---|---|---|---|
| Home | 34 -> 34 | 13 -> 17 | Before: yes at the top (binder week), then six same-looking boxes. After: purple playmat band under the game chips, airy Sell. |
| Events | 35 | 17 | Yes. Taped pairings sheet is the strongest object on the site. Sign-up form is a plain sky box. |
| Shop | 33 -> 33 | 12 -> 16 | Before: no, a form in a box. After: booster-crimp ridge band for Sealed, unboxed Preorders. Condition guide slabs carry it. |
| Sell | 34 | 17 | Yes. Receipt slip with dashed tears. Right rail is two same boxes. |
| Visit | 33 -> 34 | 12 -> 17 | Before: no, four stacked boxes. After: sky address band, taped hours sheet, unboxed house rules. |
| Privacy | 33 | 14 | Plain on purpose (legal). Fine. |
| 404 | 30 | 12 | Copy is on voice ("Misprint."), the dashed closed pocket is the only object and reads as an empty rectangle. |

## Issues, ranked
- P1 Section rhythm: Home had 7 bordered boxes with a tab, Visit 4, Shop 3. Fixed (see below).
- P1 Visit led with hours/address in identical boxes and no object; Home "Visit us" box repeats the footer address and hours. Visit fixed; Home block left (P2).
- P1 Tab numbers "01 / ..." ran out of order (Visit 04 sat beside 01) and echoed the h2 under them: noise. Cut everywhere.
- P2 `src/pages/index.astro:~118` Home Visit box duplicates footer address + hours. Merge into the Sell block or drop the address, keep the "Plan your visit" button.
- P2 `src/pages/404.astro:16` closed pocket is a small dashed box. Make it a sleeve with a misprint card (tilted 2deg, static).
- P2 `src/pages/sell/index.astro` right rail: How we pay + Condition rules are two matching boxes; make How we pay a sticker note, not a box.
- P2 Events sign-up form (`events/index.astro`, sky box) could be a booster-pack ticket stub; skipped.
- P3 Footer stripe repeats the hazard tape on every page; fine as a signature, do not add more.
- P3 Binder pockets at 390 are small text (0.8rem) in "+3 more nights"; check at 200% zoom was done in loop 6.

## AI template tells
- Same bordered box + tab + H2 + short paragraph repeated down the page (Home, Visit, Shop). Fixed partly: bands and unboxed sections now interrupt it.
- H2 repeating the tab label directly beneath it. Numbers cut; tabs now only on dense boxes.
- Uniform section gap (`--section`) everywhere: still uniform. Next loop vary it (tighter inside a group).
- Generic copy: "Questions about stock, preorders, events or your data" and "Come in, find a table, stay for a game" are fine but soft; no invented facts, so keep.
- Two-up buttons "Open in Maps / Plan your visit" on Home sit beside the identical footer link.

## Fixes made (5)
1. `src/styles/global.css` new `.band`, `.band-mat`, `.band-crimp`, `.airy`, `main{overflow-x:clip}` (full-bleed via pseudo-element, tokens only, no motion).
2. Home: "What we play" is a full-bleed purple playmat band with the game pockets on it; "Sell to us" is unboxed (`index.astro`, `home.css`).
3. Shop: Sealed is a sky band with a ridged booster-crimp edge; Preorders is unboxed (`shop/index.astro`, `shop.css`).
4. Visit: address is a full-bleed sky band with Open in Maps beside it; Hours is a taped pairings sheet (tape moved from events.css to global.css); house rules unboxed (`visit/index.astro`, `visit.css`).
5. Cut: the "01 / " numbering on every tab (all pages) and the tabs on every section turned into a band or airy block.

Check: build clean, 103 tests pass, check-site exits 0 (no overflow 320-1600). `main{overflow-x:clip}` hides any sideways overflow
inside main from the document scrollWidth, so a future overflow bug would clip silently: keep an eye on it.
Not touched: Events, Sell, Privacy, 404, Worker, data.
