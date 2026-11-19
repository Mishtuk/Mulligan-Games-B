# Loop 37 inventory: drawn objects on all 7 paths (subtract pass)

Rule: an object stays only if it carries information or says "card shop". Shots: `before-*` / `after-*` (390 and 1280).

| Path | Object | Carries | Verdict |
|---|---|---|---|
| All | Hazard stripe above the footer (orange/dark) | Nothing; hazard tape is not a card-shop thing | CUT (footer keeps its top border) |
| All | Open chip dot | Open or closed, with text | keep |
| Home | Hand of 3 card backs in the hero | Nothing, but it is the shop's one hero object | keep |
| Home | Binder rings, pockets, Closed pockets | The week, as a binder | keep |
| Home | 7 game sleeves (own pattern per game) | Which game, beside its label | keep |
| Home | Box and pack silhouettes (Sealed, Preorders) | Box vs pack, beside its label | keep |
| Home | Slab (Sell) | Cash or credit, what to bring | keep |
| Home | Band crimp strip, purple mat band | Mat = play area | keep |
| Events | Pairings sheet + 2 tape pieces | The posted schedule | keep |
| Events | Sheet header row (Time, Game, Format, Fee, Seat) | Column names | keep |
| Events | Date tickets (special nights) | Date | keep |
| Events | Clipboard clip + ruled paper | Sign-up sheet | keep |
| Shop | Case: 2 shelves of card backs | Where singles live, shelf tags say which games | keep |
| Shop | 16 "ASK" price stickers under the case cards | The same "ask" 16 times; the note above already says it | CUT |
| Shop | Crimp strip over Sealed, box and pack on a shelf line | Sealed product, booster pack | keep |
| Shop | Preorder slip (dashed) | What a preorder needs | keep |
| Shop | Condition guide fold | Grades | keep |
| Sell | Step stubs 1-2-3 | Order of steps | keep |
| Sell | Buylist receipt, tear lines | The form as a slip | keep |
| Sell | "We buy cards" sign | Terms | keep |
| Sell | 2 tape pieces on that sign | Nothing (the sign is already a sign) | CUT |
| Visit | 445 placard | The address | keep |
| Visit | 2 tape pieces on the Hours card | Nothing; the table carries the info | CUT |
| Visit | House rules notice, 2 tape pieces | Rules, notice board | keep |
| Privacy | none (text page) | | n/a |
| 404 | Misprint card | The joke explains the page | keep |

Net: 1 stripe + 16 stickers + 4 tape pieces removed. Footer CSS gained a margin; `.stripe`, `.price` rules deleted.

# Photo slots (2, planned and built)

| Slot | Page | Why here | Where | `store.json` field |
|---|---|---|---|---|
| Storefront | Visit | A visitor needs to know which door | Right of the 445 placard (1280, no extra height: page 1709 -> 1689 px); under Open in Maps at 390 (+~130px) | `photos.storefront` |
| Play room | Events | Shows what a night looks like | Under "Ask us" in the side column (fills the 190px free at 1280; after the clipboard at 390) | `photos.playRoom` |

Component: `src/components/Photo.astro`. Null renders a marked placeholder ("Photo coming: the play room"); set renders `<img>` with width, height, alt, optional srcset and sizes. Never a person.

# Score vs loop 30 (25/30), strict

Identity 4 -> 4. Fewer decorations and two honest photo slots, but a 5 still needs the owner's real photos.
Main actions 4, Content truth 4, A11y 5, Craft 4 (Home/Shop 1280 gaps from loop 30 not re-measured here), Code 4 (Photo.astro is one small component; test added). Total 25/30, unchanged; no score moved without evidence.
