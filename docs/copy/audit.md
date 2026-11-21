# Copy audit: weakest 20 lines (2026-11-20)

Method: ran `npm run build`, read all visible text in dist/*.html (7 pages) plus strings inserted by public/js/*.js. Nothing edited. "R#" = rule number in `docs/research/web-writing.md` (Rules for Mulligan). Limits are for the coder's slots at 390px. No theme toggle exists in dist yet, so its label is covered in item 20.

| # | Slot (file, where) | Current | Better | Why |
|---|---|---|---|---|
| 1 | index.html, want-list error line | "Nothing was sent. Please check the fields and send it again, or ask at the counter." | "Nothing was sent. Check the highlighted fields and send it again, or ask at the counter." | R8: no "please"; "fields" is vague. Events and Sell already say which fields. |
| 2 | events.js:92, seat count slot | "Seats: ask at the counter" | "Open seats: ask at the counter" (max 30 chars) | R13 and the glossary list "Seats: ask" as a banned bare form; name what is unknown. |
| 3 | sell-rows.js:11, row total | "lines: 12" | "12 cards listed" (singular "1 card listed") | R23: lower-case "lines" is code talk; the store says cards. |
| 4 | sell-rows.js:35, add-row button when full | "Limit of 50 lines" | "50 cards is the limit. Send this list, then start another." (max 60) | R8, R12: states the limit and the next step. |
| 5 | index.html, Star Trek card sub line | "Main set (TRK) and Commander decks (TRC)" | "Play Boosters and Commander decks" (only if releases.md confirms) | R1, R23: set codes are publisher jargon most parents do not know. |
| 6 | index.html, Instagram card chip and title | "Sign up for a championship" + "$15 or $30 entry" | "Championships: pre-register on TopDeck" and drop the fee chip until confirmed | R14, R13: glossary says an unknown fee shows nothing; heading should say where the action is. |
| 7 | index.html, Instagram card | "Circuit points count toward next year's invitational." | Cut, or "Points from each Sunday add up over the series." | R14: invitational is not confirmed anywhere in research. |
| 8 | index.html, monthly series card | "Monthly cEDH. Dates: confirm with the store." then again "Dates: confirm with the store." on the cEDH post | Keep it once per card: "Monthly cEDH, first Sunday." + one "Dates: confirm with the store." | R13 repeats on one screen; the second one also contradicts the visible dates "Dec 6 · Jan 3". |
| 9 | shop/index.html, hold help (5 lines) | "Holding Star Trek? Write "Hold: Star Trek" in the cards box below." | "Want Star Trek held? Type "Hold: Star Trek" in the cards box below." | R6, R7: "Holding" reads as the store holding; glossary verb is "hold ... for me". |
| 10 | shop/index.html, sealed empty state | "Nothing out yet. Ask at the counter." and "Nothing announced yet. Ask at the counter." | "No sealed product listed yet. Ask at the counter." and "No preorders listed yet. Ask at the counter." | R12: two near-identical lines that never say which list is empty. |
| 11 | index.html, want-list form label | "Something else" | "Anything else" (matches Sell and Events) | R7: one label per field type across forms. |
| 12 | events/index.html, no-sign-up note | "Sign-ups for the next nights open soon. Just turn up, or ask at the counter." | "Seat sign-up is not open for these nights. Just turn up, or ask at the counter." | R14: "open soon" promises a date we do not have. |
| 13 | form-state.js:26, busy button text | "Sending..." | "Sending" then the status line announces the result (max 12) | R20: ellipsis reads as "dot dot dot" in some screen readers and says nothing about what is sent. |
| 14 | today.js:44, fallback line | "Confirm with the store." (alone) | "Today's hours: confirm with the store." | R1, R13: bare line has no subject out of context. |
| 15 | privacy/index.html, three heads | "Kept" / "Never" / "Yours" | "What we keep" / "What we never do" / "Your choices" | R1, R3: one-word heads do not scan on their own (Never: "Never what?"). |
| 16 | privacy/index.html, browser line | "Nothing is saved in your browser." | Rewrite once the theme toggle ships: "Your light or dark choice is saved in your browser. Nothing else is." | R14 truthfulness: a stored theme preference makes the current line false. |
| 17 | all pages, footer nav label | aria-label "Footer: find us online" | "Find us online" (links keep "(opens another site)") | R18: landmark names should not repeat the landmark type. |
| 18 | events.js:65, filter empty | "No special nights on the calendar yet." (all) vs "No Magic special nights booked." | "No special nights booked yet. See the weekly game nights above." for all games, "No special Magic nights booked yet." per game | R12: no next step; "No Magic special nights" is awkward. |
| 19 | events/index.html, honeypot label | "Leave this empty" | "Leave this empty (spam check)" or hide from the accessibility tree | R18: a screen reader user hears an order with no reason and may think it is a field to fill. |
| 20 | theme toggle (not built yet; for the coder) | none | Name "Dark mode" with aria-pressed, or "Switch to light mode" and "Switch to dark mode" with no aria-pressed; never both | R18: sun/moon icons need a text name that does not flip with state. |

## Also fine (keep): "Pull up a chair.", "Misprint.", "A guide, not a promise.", "Hours and nights can change. Confirm with the store.", "Hold for X filled in. Add your name and email."
