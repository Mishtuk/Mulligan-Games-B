# Mediator ruling sheet (meeting, 2026-11-20)
Inputs: designer.md, coder.md, CONTEXT.md, DECISIONS.md D4/D6/D8/D10, loop-brief rule 5. The boss has the final say on everything below.
Rule used for every ruling: serve the goal (see events, find a card, sell, know when to come in), never cut the store's words, New releases or the Instagram strip (improve them only), no invented facts, no new cost to the owner.

## Ranked joint list
1. **No-JS form GET leaks typed data into the URL (coder P2).** Visitor sees nothing odd, but a name/email/card list typed with JS off lands in the address bar, history and GitHub's request logs; the page says "nothing was sent", which is not quite true. Coder change: in the build:pages post-build pass strip `name=` from inputs/selects/textareas (or `fieldset disabled`), keep action=preview-form.html. Designer: agrees, no visual change. **FIX NOW, coder-led.** This amends D10(c): needs a D11 line. Real build unaffected (POST to Worker). It is the only item I treat as a rule problem (hard rule 5 spirit, privacy).
2. **Instagram strip is two text boxes, unequal heights (designer P1).** Coder: add a drawn thumbnail inside each card (src/components Instagram section + CSS), same frame as release cards, `align-items: stretch`, chip row `margin-top:auto`. Rule 13 holds: drawn shapes only, no Instagram images. Coder agrees, cheap. Also fold in coder P3 "Date: confirm with the store" -> one quiet "Confirm with the store" line (jargon rule, brief rule 3). **FIX NOW, designer-led (thumbnail art) with coder wiring; keep every word of the posts.**
3. **768 header: Open-now pill strays above the H1 (designer P1).** Coder: at the phone-mode breakpoint put the pill inside the header (short "Open now") or in the Menu sheet. Visitor: stray line looks like a leftover. Coder agrees; touches the header, so run a11y. **FIX NOW, both** (designer picks in-bar vs sheet, coder builds).
4. **Menu does not inert the page or lock scroll (coder P2).** Visitor: keyboard users Tab into hidden-behind content; hard rule 3. Designer has no view; only possible visual change is none. Fix: site.js sets `inert` on main/footer while open. **FIX NOW, coder-led**, a11y gate.
5. **Shop 1280: Sealed/Preorders narrow and centred, singles shelf a wall of 16 card backs (designer P1).** Coder: one shared 4-up grid left-aligned for Sealed+Preorders; shrink shelf to fewer rows. Conflict-lite: designer's "game tabs" and "what a single costs" need real data (D6, rule 5). **FIX NOW the grid and the shelf height, designer-led; LATER the tabs/prices (owner: POS choice, photos).**
6. **Home 390: want-list form sits above New releases (designer P2).** Coder: reorder sections in index.astro. Owner asked for releases on the homepage, so moving them up improves them. Coder agrees, trivial. **FIX NOW, coder-led.** (See conflict B.)
7. **Mixed real art and flat One Piece placeholder tile (designer P2).** Coder: can only swap in art already in docs/research/releases.md with credit (rule 12 exception); otherwise drawn pack for that tile. Cannot invent art. **FIX NOW if a sourced image exists, else consistent drawn pack; LATER owner OK on publisher images (open question).**
8. **Home 1280 hero dead space / binder text ~11px (designer P2); Sell 768 step copy 12px (P3).** Coder: raise to 13-14px in tokens, trim hero min-height. Small text also touches rule 3. **FIX NOW, designer-led, coder applies.**
9. **Visit 1280: blank storefront drawing, clipped Photo-coming stripe, tilted rules sheet (designer P2 x2).** Coder: drop rotate to 0, equal-height rows, solid label on placeholder, add a sign to the drawing. No facts needed. **FIX NOW, designer-led.**
10. **Events 1280: long right column with filler drawing (designer P2).** Coder: remove the drawn table, keep one Photo-coming. Cuts only filler, not store words. **FIX NOW, coder-led** (or sticky clipboard, designer's choice).
11. **Sell CLS 0.034 (coder P3).** Visitor: slight jump. Under 0.1 "good". **LATER / next loop**, trace with a layout-shift observer first; do not guess.
12. **Preview banner 28px (designer P3).** Visitor: more room on phones. Coder: one CSS rule, keep non-dismissible (D10 honesty). **FIX NOW, tiny.**
13. **Hold anchor points at a zero-height line (coder P3).** Visitor with JS off lands mid-form. Fix: target #req-cards. **FIX NOW, coder-led, one line.**
14. **Footer chips, Walk-in tag, 404 card alignment (designer P3).** Cosmetic; do after the above if time. **FIX NOW only if cheap; else LATER.** Walk-in tag adds a claim: only on rows the data says are walk-in, else DROP.
15. **robots/sitemap under subpath; favicon.ico 404 (coder P3).** Harmless, noindex is the protection (D10d). **DROP.**

## Conflicts for the boss
**A. Instagram strip content vs. budget.** Designer wants thumbnails; coder worries about the D7/D9 22,700 gzip line (Home ~22,3xx, ~350 B slack). Designer: drawn inline SVG/CSS shapes, reuse the release-card frame, so a few hundred bytes. Coder: any real SVG will pass the line. Mediator: allow CSS-only shapes; if over, boss raises the budget with a D11 entry (as D7 did for an owner feature). Never trim the posts' words (D8).
**B. Section order on Home.** Designer: releases before want-list form. Coder: the form sits near Binder week for task flow (find a card). Mediator: move releases up, keep the form's own heading and wording; boss may prefer collapsing the form to one line instead.
**C. GET fallback.** D10(c) was deliberate; the coder offers keep-as-is. Mediator recommends the strip-names fix, since it costs nothing and the preview's own line says nothing was sent.

## Needs the owner (LATER)
Photos (Visit, Events, shop), POS/singles search + prices (shop tabs), OK on publisher images, which games run weekly nights, Instagram dates/fees.

## Order of work
Coder first: 1, 4, 13, 12, 6 (small, no design input). Then mediated pair: 3, 2, 5, 8, 9, 10. Full gate before commit (check-site 7 paths, a11y, gaps). Not checked by me: I relied on the two review docs, not a fresh look at every shot.
