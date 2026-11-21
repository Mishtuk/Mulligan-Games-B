# Writing for the web: research for the Mulligan writer (checked 2026-11-20)

Method: each page below was fetched on 2026-11-20 and summarised in my own words (short quotes only). Blocked, noted and skipped: Shopify Polaris and Material 3 content pages (redirect, no body text; Shopify's app content guide used instead), NN/g microcopy and local-business pages (404), TCGplayer (empty body). Reading level target from sources: grade 7 or below, sentences under 25 words.

## 1. Web and UX writing fundamentals
1. NN/g, How users read on the web. https://www.nngroup.com/articles/how-users-read-on-the-web/ (checked 2026-11-20). 79% always scan; concise text scored 58% better, scannable 47%, objective language 27%; "marketese" hurts trust. So we should lead with the answer, one idea per block, and cut promo words.
2. NN/g, UX writing study guide. https://www.nngroup.com/articles/ux-writing-study-guide/ (checked 2026-11-20). Know who reads, plain language, a set tone, no jargon unless readers use it. So we should use card-shop words (binder, sleeves, Top 8) because our readers say them.
3. GOV.UK A to Z style guide. https://guidance.publishing.service.gov.uk/writing-to-gov-uk-standards/style-guides/a-to-z-style-guide/ (checked 2026-11-20). Plain English, active voice, sentence-case headings, link text starts with the key words, check sentences over 25 words. So we should write headings and buttons in sentence case and split long lines.
4. Mailchimp content style guide, voice and tone. https://styleguide.mailchimp.com/voice-and-tone/ (checked 2026-11-20). Voice constant, tone adapts to the reader's mood; clarity beats jokes; dry humour only when natural. So we should keep one voice and go plainer for errors and money.
5. Google developer style, tone. https://developers.google.com/style/tone (checked 2026-11-20). Friendly like a knowledgeable friend, not casual; no exclamation marks, filler ("please note"), or "simply/easy". So we should drop "Please" from steps and never call anything easy.
6. Microsoft style guide, simple and human. https://learn.microsoft.com/en-us/style-guide/brand-voice-above-all-simple-human (checked 2026-11-20). Warm, crisp, ready to lend a hand; scan first, read second; prune every excess word. So we should open each block with the key takeaway.
7. Shopify app content guide. https://shopify.dev/docs/apps/design/content (checked 2026-11-20). Buttons start with a strong verb; one term per action; about grade 7. So we should keep the glossary strict (one noun, one verb per thing).
8. Digital.gov plain language. https://digital.gov/guides/plain-language (checked 2026-11-20). Write for the specific audience and test it. So we should read copy as a 12-year-old and as a parent would.
9. NN/g ten usability heuristics. https://www.nngroup.com/articles/ten-usability-heuristics/ (checked 2026-11-20). Real-world words; always an exit and undo; errors name the problem and the fix. So we should say "card", not "item", and give a "Back to game nights" way out.

## 2. Microcopy: buttons, labels, hints, errors, empty states, confirmations
10. GOV.UK button. https://design-system.service.gov.uk/components/button/ (checked 2026-11-20). Sentence case, describe the action; "Save and continue" when it saves. So we should keep "Send my ..." buttons and never "Submit".
11. GOV.UK text input. https://design-system.service.gov.uk/components/text-input/ (checked 2026-11-20). Visible label above, no colon; hint is one short sentence, no full stop, no links. So we should keep hints short and not link inside them.
12. GOV.UK error message. https://design-system.service.gov.uk/components/error-message/ (checked 2026-11-20). Say what went wrong and how to fix it; avoid "please", "sorry", "invalid", "oops"; same wording at the field and in the summary; do not repeat the hint. So we should write one error per case, reusing the label's words (and drop "Please" from our current error line).
13. NN/g error message guidelines. https://www.nngroup.com/articles/error-message-guidelines/ (checked 2026-11-20). Specific, kind, no blame; keep what the user typed; do not flag too early. So we should say "Check your email", never "You entered".
14. GOV.UK confirmation pages. https://design-system.service.gov.uk/patterns/confirmation-pages/ (checked 2026-11-20). Confirm the outcome, then say what happens next and when. So we should follow "Got it. X sent." with who replies and how.
15. NN/g empty states. https://www.nngroup.com/articles/empty-state-interface-design/ (checked 2026-11-20). A blank panel looks broken; say what goes here and offer a next step. So every empty state ends with one action ("Nothing booked tonight. See this week.").
16. Atlassian designing messages. https://atlassian.design/foundations/content/designing-messages/ (checked 2026-11-20). Match the message to the need: error = fix it, warning = heads-up, flag = brief confirmation, inline near the content. So we should pick the lightest message that works and place it by the field.

## 3. Retail, ad and release copy
17. Wizards, Magic Star Trek product page. https://magic.wizards.com/en/products/star-trek (checked 2026-11-20). One short benefit line per product ("The best way to build your Star Trek deck."), contents folded into the blurb ("six Borderless Scene cards"), date on its own line. So we should write one honest line per product and name what is inside with counts.
18. Card Kingdom, Star Trek Play Booster Box. https://www.cardkingdom.com/mtg-sealed/star-trek-play-booster-box (checked 2026-11-20). Title = set + product type; contents as numbers (30 packs, 14 cards each); "rarity and distribution may vary". So we should list contents the same way only where releases.md confirms them, and keep "Add to cart" out.
19. Our CTA bank, docs/research/release-ads.md (2026-11-20). Date on its own uppercase line, text beside the image, badge in words. So we should keep CTAs that hold or point to the counter, never checkout.
20. Wizards section heads such as "THE SHIP IS YOURS, CAPTAIN" (same page as 17). Themed hype suits a publisher. So we should borrow theme words (warp, starbase) in small doses, and avoid all caps and heads starting "The" + a word (rule 8).

## 4. Local small-business voice
21. The store's own words, docs/research/mulligan-games.md and instagram.md (2026-11-20). "The friendly local game store! Always ready to get people engaged in the hobby!", "Stop in and stay for a game.", "Look what showed up!", "Free Play All Day". So we should sound like the counter: specific nights, times and what to bring, keeping the warmth and dropping the exclamation marks.
22. NN/g credibility point (source 1). Checkable facts build trust more than boasting. So we should name the street, nights and formats, and flag anything unsure with "Confirm with the store".

## 5. Accessibility in writing
23. W3C WCAG technique G53, link purpose in context. https://www.w3.org/WAI/WCAG22/Techniques/general/G53 (checked 2026-11-20). Link text plus its sentence must say where it goes; no bare URLs; put context before the link. So we should avoid "click here", and give repeated links like "Hold one for me" a hidden suffix naming the set.
24. W3C images decision tree. https://www.w3.org/WAI/tutorials/images/decision-tree/ (checked 2026-11-20). Decorative alt=""; functional alt names the action; informative alt gives the meaning. So we should describe what a product image shows in one phrase and leave flourishes empty.
25. W3C APG button pattern. https://www.w3.org/WAI/ARIA/apg/patterns/button/ (checked 2026-11-20). A toggle's label must not change with its state when aria-pressed is used; or change the label and drop aria-pressed. So the sun/moon button is named "Dark mode" with aria-pressed, or "Switch to light mode" / "Switch to dark mode" without it, never both.
26. MDN aria-live. https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-live (checked 2026-11-20). Polite for status, assertive only when urgent; short messages inserted into an empty region. So we should announce "Buylist sent." politely and never loop "Sending...".

## 6. Admin and back-office text for non-technical staff
27. NN/g confirmation dialogs. https://www.nngroup.com/articles/confirmation-dialog/ (checked 2026-11-20). Confirm only serious acts; name the item; outcome buttons ("Delete file" / "Keep file"); undo beats confirmation. So we should write "Delete Draft FNM, Fri Nov 27?" with "Delete event" and "Keep event", and offer Undo after small edits.
28. Shopify app content guide (source 7). So admin uses "Add event", "Save changes", "Hide from site" in the same words on every screen.
29. NN/g heuristics (source 9). Every screen needs a visible way back. So admin shows "Saved. Undo" for a few seconds after a small edit.
30. Log entries (my conclusion from 27 to 29, no source). Managers read "Nov 20, 3:42pm, Sam hid Draft FNM from the site", not "UPDATE events". So we should log who, what, which item and when, in store words.

## Rules for Mulligan (testable)
1. First sentence of any block carries the main fact (night, time, set, action).
2. Sentences 20 words or fewer; paragraphs 3 lines or fewer at 390px.
3. Headings and buttons in sentence case, no ending full stop, never "The" + a word.
4. No exclamation marks on the site or in admin.
5. Banned: elevate, seamless, journey, unleash, world-class, one-stop shop, "click here", simply, easy, oops, sorry.
6. Buttons are verb + object and say what happens next ("Hold my seat", "Send my want list"); never "Submit", "OK", "Yes".
7. One noun and one verb per thing, from the DESIGN.md glossary.
8. Errors say what to do and never blame: no "please", "invalid", "you must", "you entered".
9. The same error text shows at the field and in the summary.
10. Hints are one short sentence with no link; labels have no colon.
11. Success is "Got it. X sent." plus who replies and how.
12. Every empty state names what goes there and ends with one next step.
13. Unknown facts use only "Confirm with the store" or "Ask at the counter".
14. No price, fee, date, stock, rating or quote unless confirmed in research; no cart words (add to cart, checkout, in stock).
15. Product lines give contents with counts only where releases.md confirms them; "pack" only for a pack, else "deck" or "box".
16. A date sits on its own line with a status word ("Out now", "In store Dec 18"), never colour alone.
17. Link text makes sense alone; repeated links carry a hidden suffix naming the item.
18. Every icon-only control has an accessible name that says the action; a toggle's name does not flip while aria-pressed is set.
19. Informative images get a one-phrase alt of what is shown; decorative images get alt="".
20. Status messages use a polite live region, one short sentence, never repeated.
21. Admin: destructive prompts name the item and use outcome buttons; small edits show "Saved. Undo".
22. Admin log lines read who + did what + to which item + when, in store words.
23. Prefer store words (binder, sleeves, pairings, Top 8, at the counter) to generic ones (item, product, user).
24. Each slot has a character limit at 390px and a short variant; never cut owner or store words to fit.
25. Meta titles under 60 characters, descriptions under 155, unique per page.

## Voice chart (from the store's real phrases)
| We are | We are not |
|---|---|
| Friendly and local: "The friendly local game store", "Stop in and stay for a game." | Corporate: "Welcome to our premier destination" |
| Specific: "Wednesday game nights, 7pm, Standard Showdown" | Vague: "Events for everyone" |
| Happy to teach: "New to a game? Just say so." | Gatekeeping or jargon-heavy |
| Dry and short: "Misprint." "Nothing booked tonight." | Pun-stuffed, all caps, hype |
| Honest about unknowns: "Rates are set at the counter." "Confirm with the store." | Guessing prices, dates or stock |
| Warm, like a counter chat: "Look what showed up." | Exclamation-heavy: "Come Join us for our 5k!" |
| In person first: "Hold one for me", "bring the cards in" | Online-store: "Add to cart", "Checkout" |
