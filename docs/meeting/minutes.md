# Team meeting, 2026-11-20: "does anything look bad?" (live Pages preview)

Called by the boss at the owner's request. Pairing rule from the kit plus the owner's addition (mediator always
available to talk to the boss; the boss has the final say).

| Seat | Input | File |
|---|---|---|
| Designer | Fresh-eyes visual review, 7 pages x 390/768/1280 on the live preview | `designer.md` |
| Coder | Technical review of the live preview (console, requests, flows, CLS, bytes) | `coder.md` |
| Mediator | Carried each side's points to the other, joint list of 15, 3 conflicts for the boss | `mediator.md` |
| Advisor | Advised the boss on rulings and an orderly work plan | `advisor.md` |
| Boss | Final rulings (below), D11 in `DECISIONS.md` | this file |

**Agreed:** no P0. Nothing broken on the live site; check-site passes all 7 paths on Pages.
**Boss rulings (final say):**
- A. Instagram strip gets drawn, CSS-only thumbnails in the release-card frame with equal heights. All post words
  stay. If Home goes over 22,700 gzip, a D-entry raises it; copy is never cut (D8).
- B. New releases moves above the want-list form on Home; the form keeps its heading and wording.
- C. Privacy: on the Pages build, form fields lose their `name` attributes so nothing typed reaches a URL or history;
  action stays the preview page. Amends D10(c). The normal build is unchanged.
- Dropped: robots/sitemap under the Pages sub-path (noindex meta is the protection), favicon note.
- Later (owner): photos, shop tabs and single prices (need a POS), publisher OK for images, walk-in tag.

**Work plan (advisor's order, accepted):**
1. T1 coder, advisor paired: strip names on Pages + test; menu `inert` while open; hold anchor -> `#req-cards`;
   slimmer preview banner.
2. T2 and T3 design work: designer specifies, mediator turns it into a coder handoff, coder builds (staggered,
   never two builds on one `dist/`). T2 Home: reorder, Instagram thumbnails, "Open now" pill inside the header at
   768, Home text sizes. T3: Shop grid + shorter shelf, One Piece tile art, Visit storefront finish and photo strip,
   Events filler, Sell step copy.
3. Gate on the normal build (check-site 7, a11y, gaps 7, budget), build:pages, advisor diff review, push gh-pages,
   verify live.
