# Copy deck: visual batch (writer, 2026-11-20)
For the coder. Limits are characters at 390px. "Alt" = accessible name. Prices: product pages show NO publisher MSRP (D13); every price line is "Ask at the counter". Nothing below is invented; sources are product-contents.json, releases.json, events.json, instagram.md.

## 1. Theme toggle (theme-toggle button, spec-dark.md)
| Slot | Text | Why |
|---|---|---|
| T1 name, dark mode on (sun icon) | "Switch to light mode" (20) | Names the action; no aria-pressed (audit 20, R18) |
| T2 name, light mode on (moon icon) | "Switch to dark mode" (19) | Same |
| T3 title attribute | same string as the name | Mouse tooltip; keep in sync on click |
| T4 privacy line | see U16 | Storage is now real |
Icons are aria-hidden. No visible text.

## 2. Top release panel (above "Pull up a chair", tab strip)
Panel is `role="region" aria-label="New releases"` (label 12). Tabs: short, one line each, 48px targets; tab name = the label (add hidden "release" only if the coder uses role=tab; otherwise plain buttons with aria-current).
| Slot | Text (limit) |
|---|---|
| P0 section label | "New this month" (15). Short: "New releases" |
| Tab labels | "Star Trek" (9), "Delta Reign" (11), "One Piece" (9), "Riftbound" (9), "Hololive" (8). Order by date, Star Trek first. |
Per tab: headline (max 28), one line (max 60), CTA (max 24), status chip (max 20).
| Release | Headline | One line | CTA | Status |
|---|---|---|---|---|
| mtg-star-trek | "Star Trek has landed" | "Magic's new set, with Commander decks." | "Hold a box for me" | "Out now, Nov 13" |
| pokemon-delta-reign | "Mega Evolution: Delta Reign" (27) | "The new Pokemon set, in store." | "Hold a box for me" | "Out now, Nov 6" |
| one-piece-st37-38 | "Two new starter decks" | "ST-37 and ST-38, 51 cards each." | "Hold a deck for me" | "In store Dec 18" |
| riftbound-legacy | "Riftbound: Legacy" | "The 2027 opener, with Pre-Rift events." | "Hold a box for me" | "In store Jan 29" |
| hololive-volume-vortex | "Hololive: Volume Vortex" (23) | "BIG3 on the packaging." | "Hold a pack for me" | "In store Mar 19" |
Star Trek CTA on the panel keeps the glossary line "Get Star Trek: hold one for me" (30) where room allows; use "Hold a box for me" otherwise. Pokemon cannot say "box" for all products: unit stays "box" per releases.json. CTA links to /shop/<release-id>/ (visible link text only, no hold prefill). "Hold a pack" is a glossary addition (Hololive is a pack).

## 3. Rotation controls (lower New releases, spec-rotation.md)
| Slot | Text | Limit |
|---|---|---|
| R1 pause button | "Pause" (visible + icon) | 5 |
| R2 play button | "Play" | 4 |
| R3 prev, name | "Previous release" (visible icon only) | 16 |
| R4 next, name | "Next release" | 12 |
| R5 position | "2 of 5" (pattern "N of M") | 6 |
| R6 dot name | "Show release 2: Star Trek" | 28 |
| R7 slide label | "2 of 5: Star Trek" | 24 |
| R8 polite announcement, manual change only | "2 of 5: Star Trek" (same as R7, read once, never on auto-advance) | 24 |
| R9 reduced-motion note | "Auto-play is off (your device setting)" | 38 |
Replaces spec text "Previous ad / Next ad / Show ad": the store calls these releases (glossary: one noun per thing).

## 4. Product detail pages /shop/<release-id>/
Common slots (limits 390). Title <= 60, description <= 155.
| Slot | Text |
|---|---|
| D1 hero status, out | "Out now. In store since <Mon D>" |
| D2 hero status, coming | "In store <Mon D>. Prerelease <Mon D>" (only if prereleaseDate; else drop clause) |
| D3 box heading | "What's in the box" |
| D4 empty contents | "Contents not announced yet" (use when a product has no row or a row says "contents not stated") |
| D5 price line | "Price: ask at the counter" -> use "Ask at the counter" as the value, label "Price" |
| D6 hold CTA | "Hold one for me" (+ hidden " <set name>"); decks: "Hold a deck for me" |
| D7 hold help | "Hold one, then pick it up at 445 York Road. Nothing is charged online." (<= 70) |
| D8 credit | "Image: <releases.json credit>" + "Source: <publisher page>" link (hidden suffix "opens another site") |
| D9 not affiliated | footer line already sitewide, keep |
| D10 events tie-in | releases with a one-off whose `release` matches: "Celebrating this set: <title>, <Day Mon D>, <time>." Only mtg-star-trek has one: "Celebrating this set: Star Trek Commander Party, Sat Nov 21, 2pm." Link "See it on game night" (events page). Other releases: render nothing. |
| D11 uncertain row | Show Confirmed rows only. Riftbound rows marked "Likely" (champion decks, vault bundle, pre-rift kit) are NOT shown; if the page has no Confirmed rows left it shows D4 once. |
Status is computed from releaseDate vs today (today 2026-11-20): Star Trek, Delta Reign out; Delta Reign Build & Battle Box "Out now" (Nov 20). One Piece, Riftbound, Hololive coming.

| Release | Title (<=60) | Meta description (<=155) | H1 | Summary (paraphrase of setSummary) |
|---|---|---|---|---|
| mtg-star-trek | "Star Trek Magic set | Mulligan Games" (37) | "Star Trek for Magic is out now at Mulligan Games in Warminster. See what is in each box and hold one." (101) | "Star Trek" | "Sixty years of crews, adversaries and starships come to Magic, with new cards and mechanics. Released Nov 13; prerelease ran Nov 6 to 12." |
| pokemon-delta-reign | "Mega Evolution: Delta Reign | Mulligan Games" (44) | "Mega Evolution: Delta Reign is out now. See what is in each box and hold one at Mulligan Games in Warminster." (110) | "Mega Evolution: Delta Reign" | "A Mega Evolution series set of over 135 cards, released Nov 6, built around Pokemon ex and Trainer cards." |
| one-piece-st37-38 | "One Piece starter decks ST-37, ST-38 | Mulligan Games" (53) | "Two One Piece starter decks land Dec 18. See what is in each and hold one at Mulligan Games in Warminster." (106) | "Starter decks ST-37 and ST-38" | "ST-37 is a Red/Blue deck of fast, repeated attacks; ST-38 is a Blue/Black Baroque Works deck about cycling your hand. Cards are tournament legal 7 days after release." |
| riftbound-legacy | "Riftbound Legacy | Mulligan Games" (35) | "Riftbound Legacy arrives Jan 29. See what we know about the set and hold one at Mulligan Games in Warminster." (109) | "Riftbound: Legacy" | "Riftbound's 2027 opener has 239 cards, 93 of them Showcase. Pre-Rift events run Jan 22 to 28." |
| hololive-volume-vortex | "Hololive Volume Vortex | Mulligan Games" (40) | "Hololive Volume Vortex arrives Mar 19. See the set and hold a pack at Mulligan Games in Warminster." (99) | "Volume Vortex" | "Released Mar 19, with BIG3 (Oozora Subaru, Shirogane Noel, Yukihana Lamy) on the packaging, new color variations and cards for existing decks." |
Removed from summaries: "Previews begin at Convergence Fest, Dec 13-15" (keep only if wanted; it is sourced). Riftbound summary says "93 of them Showcase" as the publisher does.

Contents lists: render `contents[]` strings verbatim, one list per product, heading = product `name`. Confirmed rows only (all of Star Trek, Delta Reign, One Piece, Hololive; Riftbound: boosters/displays and PG2). Per-line gaps:
- Hololive: the third line "packs per box and cards per pack not stated on the page" shows as "Packs per box and cards per pack: not announced yet".
- Riftbound boosters: second line "Pack and display counts not stated" shows as "Pack and display counts: not announced yet".
- Riftbound Legacy Champion Decks, Vault Bundle, Pre-Rift Kits: Likely, hidden (D11); show D4 under a single "Also coming" note: "More Legacy products: contents not announced yet."
- Do not print msrpUsd anywhere (D13).

## 5. Instagram cards with images
| Slot | Text | Limit |
|---|---|---|
| I1 alt, championships | "Mulligan Games flyer: Not-So-Pauper Championship Feb 20 and Old Heads Legacy Championship Mar 14. Doors 11am, start 12pm. Register on TopDeck.gg. 445 York Road, Warminster." | 180 (decorative detail ok at 390; alt has no limit) |
| I2 alt, Sunday cEDH | "Mulligan Games Sunday flyer: free play all day, cEDH starts at 2pm." | 70 |
| I3 credit | "Photo: @mulligangames on Instagram" | 36 |
| I4 placeholder flag (admin/dev only, not public) | "Placeholder: confirm permission with the store" | - |
| I5 fee chip | Keep "$15 or $30 entry" ONLY on ig-championships. Source: the Nov 19 post's own caption (docs/research/instagram.md: Pauper $15, Legacy $30), not the flyer image, which instagram.md describes without fees. It is the store's own public statement, so it is sourced; CONTEXT open question still asks the owner to confirm. If the owner says no, set `fee` to null and the chip disappears. Chip text per event, if room: "Pauper $15 · Legacy $30" (23). Do not show the SC guarantees ($500, $1,000). | 24 |
| I6 championships date line | "Feb 20 and Mar 14. Confirm with the store." (flyer dates; data has null) | 42 |
| I7 championships title | "Pauper and Legacy Championships" -> keep; ad line "Pre-register on TopDeck" (audit 6) | 24 |
| I8 series line | "Points from each Sunday add up over the series." (audit 7) | 48 |
| I9 series note | one "Dates: confirm with the store." per card, none on the post | 30 |

## 6. The 20 audit fixes (final lines; item -> text)
1. "Nothing was sent. Check the highlighted fields and send it again, or ask at the counter." (no "please")
2. "Open seats: ask at the counter" (30)
3. "12 cards listed" / "1 card listed"
4. "50 cards is the limit. Send this list, then start another." (58)
5. Star Trek types line: "Play Boosters and Commander decks" (releases.md confirms Play Booster; TRK/TRC dropped)
6. Instagram championships: heading action "Pre-register on TopDeck"; fee chip per I5
7. "Points from each Sunday add up over the series."
8. Series card: "Monthly cEDH, first Sunday." plus one "Dates: confirm with the store."
9. "Want Star Trek held? Type "Hold: Star Trek" in the cards box below."
10. "No sealed product listed yet. Ask at the counter." and "No preorders listed yet. Ask at the counter."
11. Want-list label: "Anything else"
12. "Seat sign-up is not open for these nights. Just turn up, or ask at the counter."
13. Busy button: "Sending" (7), result in the status line
14. "Today's hours: confirm with the store."
15. Privacy heads: "What we keep" / "What we never do" / "Your choices"
16. Privacy line (now true): "Your light or dark choice is saved in your browser. Nothing else is."
17. Footer nav aria-label: "Find us online"
18. "No special nights booked yet. See the weekly game nights above." (all games); "No special Magic nights booked yet." (per game)
19. Honeypot label: "Leave this empty (spam check)", and keep it out of the accessibility tree if the coder can
20. Theme toggle names: T1 and T2 above, no aria-pressed

## DESIGN.md section 7 glossary changes (applied)
Error line without "Please"; "Open seats: ask at the counter"; theme toggle names; "release" as the noun for panel controls; "Hold a pack for me" for Hololive; product pages show "Ask at the counter" for price (D13).
