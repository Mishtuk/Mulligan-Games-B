# Instagram and event promotions (researched 2026-11-20)

Method: Instagram profile via WebFetch gave 12 post links (Oct 12 to Nov 19 2026) but no captions. Captions came from each post's public embed page (`/p/<code>/embed/captioned/`), read as text only. No images downloaded. Post dates are from the profile listing (not verified in embeds). Images were not read, so carousels/posters may hold details the captions lack.

## Promoted now
- Pauper Championship ($15, $500 SC guaranteed) and Legacy Championship ($30, $1,000 SC guaranteed), announced in https://www.instagram.com/p/Df7WioalHyN/ (Nov 19). TopDeck pages show no date: ask owner.
- Championship Series 2027 cEDH, first Sunday monthly (Dec 6, Jan 3, Feb 7, Mar 7...): https://www.instagram.com/p/DfkGcTCjf6u/ ; source https://topdeck.gg/circuit/mulligan-games-championship-series-2027
- Weekly calendar on Wizards locator (Draft FNM $20, Draft $20, Standard Showdown $10, Pauper $10, Pre-Modern $10, Magic Academy, Star Trek Commander Party Nov 21, D&D Encounters Celebration Nov 28). Note locator lists the address as 455 York Rd; TopDeck and CONTEXT say 445.
- Stock: "Look what showed up!" (Nov 12, product unknown), "Eb- 05 is here!" (Oct 30).

## Past or cancelled
- RCQ cancelled for Sunday after Nov 18 post. 4th anniversary (10% off, raffle, door prizes) mid Oct. Precon event round time edit (80 min per round), https://www.instagram.com/p/DefCT2iocj4/ .
- Not decoded (no caption): DfxYEv5DfAx (Nov 15), DfQNi_Wjcoj (Nov 2), DejssTln2_i (Oct 16).

## Not found
No preorder or prerelease posts in the last 6 weeks. No sale beyond anniversary 10%.

## Blocked
- TopDeck hub page: events load by script, empty to WebFetch; used event/circuit pages instead.
- Instagram profile captions blocked; embeds worked. Headless Chrome not needed.

Embed usable: all post URLs in instagram-draft.json. Pricing is public on TopDeck/locator; CONTEXT rule 5 says no pricing in the public repo, so owner should OK fees before publishing.

## Placeholder thumbnails (2026-11-20, owner override of rule 13)
Source: each post's public embed page `https://www.instagram.com/p/<code>/embed/` (fetched with curl; image URL on the scontent CDN). Originals in downloads/media/instagram (local only); processed WebP 480/960 + JPEG 960 in public/media/instagram, each under 120 KB. Recorded as `image` objects in src/data/instagram.json, all `placeholder: true`. **Placeholder: confirm permission with the store before launch.**
- ig-championships: https://www.instagram.com/p/Df7WioalHyN/ . Green flyer, 960x621 (about 3:2). Shows Pauper Championship Feb 20, Legacy Championship Mar 14, 11am open / 12pm start, TopDeck QR codes, 445 York Road. No people. The flyer gives the dates (instagram.json has date null): confirm with the store.
- ig-series (cEDH): the post DfkGcTCjf6u is a photo of a person holding the championship belt (face identifiable), so SKIPPED. Used instead https://www.instagram.com/p/DfxYEv5DfAx/ (Nov 15), red "Sunday @ Mulligan Games, Free Play All Day, cEDH 2pm" flyer, 960x540 (16:9), card art cutouts only, no customers.
- Not used: DefCT2iocj4 (4 Year Anniversary flyer, Oct 18, past event; no people; available if wanted).
