# Design: Manager area ("Back office")
Owner 2026-11-20: managers sign in and make minute changes to events, sales and shop items, and see logs, without a developer. Users: busy non-technical staff, phone at the counter or laptop. Hard rules 1, 2, 3, 13 apply (escaped output, prepared statements, a test per form). Dark and light follow `docs/meeting/spec-dark.md`.

## Look
Same tokens and fonts as the site (Titan One for page titles only, Atkinson body, Space Mono for numbers and ids). Calmer: `--bg` ground, `--card` panels, 2px `--line` borders (not 3), 3px shadow only on the primary button, 4px radius, 16px minimum text, 56px rows, 12px gutters. Logo top left on its sign plate, mono tab "BACK OFFICE" so it never reads as the public site. No images, no theme colours, no motion or transitions; toasts and dialogs appear instantly.

## Shell
- 390: top bar (logo, title, "Me" menu) and a fixed bottom nav of 5: Today, Events, Shop, Inbox, More (Sales, Sealed, Log, Sign out). 48px+ targets, label under icon, `aria-current="page"`. Page padding-bottom clears the nav.
- 1280: left rail 220px with all 7 sections, content max 1040px, "View site" opens the public site in a new tab.
- Skip link, one `h1` per screen, landmarks, 3px focus ring.

## Demo mode banner (GitHub Pages preview)
Sticky top bar, sky fill, `--line` bottom border, never dismissible: "DEMO MODE - changes stay in this browser. Nothing here goes to the live site." plus "Reset demo data" (confirm dialog). Sign-in shows the same words above the form and the hint "Demo sign-in: any name, password demo". Data lives in localStorage; the Log still works. Real mode shows no banner. Root has `data-mode="demo|live"` for tests.

## Sign in
Email and password, labelled, show-password toggle. Error: "That email or password is not right" (never says which). Lockout notice after 5 tries. "Forgot password: ask the owner" in v1. 8h idle timeout with a plain notice; unsaved forms keep a draft.

## Screens
1. **Dashboard (Today)**: date and open hours; "Tonight" list (time, game, seats `6/8`, waitlist, Edit); "New in inbox" count cards (Want lists, Holds, Buylists, Sign-ups, Messages), each a link; Quick actions as big buttons: Add a single, Add an event, Add a sale, Open inbox; last 5 log lines.
2. **Events**: grouped by week, sticky week header, Wed-first like the site (Mon/Tue show "Closed"). Row: time, game, title, seats, status chip (Open, Full, Waitlist n, Cancelled). Buttons: Add one-off event, Add weekly night. Form: game, title, date or weekday, start and end time, fee, details, seats (number or "no limit"), waitlist on/off, "Show on site". Row actions: Edit, Duplicate, Cancel. Cancel dialog: "Cancel Commander Night on Fri Nov 21? 6 people signed up. You will see their names to contact." Default focus "Keep it". The cancelled event stays with a "Cancelled" chip, Undo for 30s, then "Restore". Weekly night: weekday, time, "repeats until" (default 12 weeks); on save, "just this one / all future". Sign-ups list: remove, promote from waitlist, "Copy list".
3. **Shop items**: search plus filters (game, in stock, sold out). Fast add: Game (remembers last), Name, Set, Condition (NM/LP/MP/HP/DMG real radios), Price, Qty (stepper), optional photo. "Save and add another" (primary) keeps Game, Set, Condition and clears Name and Price; "Save". Bulk: "Add many" is a 5-row table on laptop, repeated cards on phone, plus a paste-from-spreadsheet box that previews rows before saving. List row: name, set, cond, price, qty, "Sold out" toggle (one tap, Undo toast), "Remove" (confirm).
4. **Sealed and preorders**: by release. Product, game, release date, price, limit per person, status (Preorder, In stock, Sold out), "Hold one" on/off. Mirrors `releases.json`; shows a preview of the public status line.
5. **Sales and promos**: title, details (500 chars with counter), start date, end date, Active toggle. Chip: Scheduled, Live, Ended. Preview card as on the site. Overlap with another live sale warns, never blocks.
6. **Inbox**: tabs Want lists, Holds, Buylists, Sign-ups, Messages with counts. Row: who, what, when, contact (tap to call or email). Detail: Mark done (primary), Reply, Note. Filter New / Done / All. Done items sink, never vanish; Undo 30s.
7. **Log**: table at 1280, cards at 390. When (local), Who, What ("Changed price of Sol Ring from $2 to $3"), Where. Filters: person, area, date range; default Today; "Load 50 more". Read-only, no delete; sign-ins and failed sign-ins included. Empty: "Nothing logged for these filters."

## Forms and feedback
- Visible labels above fields, hint text under, required written "(required)". Inline validation on blur and submit; error text with icon tied by `aria-describedby`, field `aria-invalid`; on submit an error summary with links takes focus. Price accepts "3", "3.5", "$3.50" and shows `$3.50`.
- Destructive: native `<dialog>` confirm naming the item (focus trap, Esc closes), or act then Undo toast. Never both for the same action.
- Toasts: bottom-left (above the nav at 390), `role="status"`, stay 10s, pause on hover and focus, have Dismiss and Undo, and are never the only record (Log has it). Errors use `role="alert"` and stay until dismissed.
- States per list: loading (static "Loading events..." text, no spinner), empty (a sentence and the add button), error ("Could not load. [Try again]", old data kept), saving ("Saving..." disabled button, then "Saved").
- Unsaved-changes prompt on leaving a dirty form; double submit blocked.
- Roles v1: Manager (everything); Owner also manages users.

## Accessibility
Keyboard order matches visual order; tables use `<th scope>`; status is word plus icon, never colour alone; 4.5:1 text, 3:1 borders; 200% zoom without horizontal scroll; no auto-refresh; steppers are number inputs with buttons.

## Wireframes
### Dashboard 390
```
+--------------------------------+
|DEMO MODE - changes stay in this|
|browser.            [Reset demo]|
+--------------------------------+
|[logo] Today            [Me v]  |
| Thu Nov 20 - open 12-9         |
| TONIGHT                        |
| 6:00 Commander   6/8  [Edit]   |
| 7:00 Pokemon     3/12 [Edit]   |
| NEW IN INBOX                   |
| [Holds 3 ] [Want lists 2]      |
| [Sign-ups 5] [Messages 1]      |
| QUICK ACTIONS                  |
| [ + Add a single            ]  |
| [ + Add an event            ]  |
| [ + Add a sale              ]  |
| LATEST CHANGES                 |
| Sam - Price of Sol Ring - 2:14 |
+--------------------------------+
|Today|Events|Shop|Inbox|More   |
+--------------------------------+
```
### Dashboard 1280
```
+DEMO MODE - changes stay in this browser. Nothing goes to the live site.   [Reset]+
|BACK OFFICE |Today  Thu Nov 20                                   Sam v  View site|
| Today      |+-Tonight-------------+ +-New in inbox---------+ +-Quick actions---+|
| Events     || 6:00 Commander 6/8 E| |Holds 3  Want lists 2 | |[+ Add a single] ||
| Shop       || 7:00 Pokemon  3/12 E| |Sign-ups 5 Messages 1 | |[+ Add an event] ||
| Sealed     |+---------------------+ +----------------------+ |[+ Add a sale]   ||
| Sales      |+-Latest changes (Log)--------------------------+ +-----------------+|
| Inbox (11) || 2:14p Sam  Shop   Price of Sol Ring $2 -> $3  |                    |
| Log        |+-----------------------------------------------+                    |
+------------+---------------------------------------------------------------------+
```
### Events editor 390 / 1280
```
390                              1280
+------------------------+       +-Events > Edit---------------------------------+
|< Events   Edit event   |       |Game [Magic v]      Title [Commander Night   ] |
|Game (required)         |       |Date [Fri Nov 21]  Start [6:00p] End [9:00p]   |
|[Magic              v]  |       |Fee [$5]  Seats [8] [x] Waitlist  [x] On site  |
|Title (required)        |       |Details [............................]         |
|[Commander Night    ]   |       |Sign-ups (6)  Ana  Ben  Cy  ... [Remove]       |
|Date  [Fri Nov 21   ]   |       |[Save]  [Duplicate]             [Cancel event] |
|Start [6:00p] End[9:00p]|       +------------------------------------------------+
|Fee [$5] Seats [-][8][+]|
|[x] Waitlist [x] On site|
|Details [.............] |
|Sign-ups (6) >          |
|[ Save                ] |
|[Duplicate][Cancel event]|
+------------------------+
```
### Shop item editor 390 / 1280
```
390                              1280
+------------------------+       +-Shop > Add a single---------------------------+
|< Shop    Add a single  |       |Game [Magic v]   Set [Bloomburrow  ]           |
|Game  [Magic        v]  |       |Name [Sol Ring            ]  Photo [Add]       |
|Name  [Sol Ring     ]   |       |Condition (o)NM ( )LP ( )MP ( )HP ( )DMG       |
|Set   [Commander Ms ]   |       |Price [$3.50]   Qty [-][1][+]  [ ] Sold out    |
|Condition               |       |[Save and add another]  [Save]  [Add many ->]  |
|(o)NM ( )LP ( )MP ( )HP |       +-Last added: Lightning Bolt NM $1.50 x4 [Undo]+
|Price [$3.50]           |
|Qty  [-][ 1 ][+]        |
|[Save and add another]  |
|[Save]    [Add many]    |
+------------------------+
```
