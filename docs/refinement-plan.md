# Refinement plan: 50 loops on the website

Owner, 2026-11-19: after the first build, run about 50 refinement loops on the site. Modelled on the kit's
`process/refinement-plan.md` (read-only there), adapted from refining a kit to refining a website.

## Rules
- **One loop = one agent run** (Sonnet; Opus for the review loops). The main session (boss) briefs, checks the
  result against the brief, runs build + tests + `tools/check-site.mjs`, commits and pushes as the owner's author.
- Each loop finishes its refinement; the next loop looks over the previous one and refines it further.
- **Never break**: hard rules in `CONTEXT.md`, every page one click from the nav, tests green, check-site exit 0.
- **Better, not bigger**: a loop may add, but must also cut. No feature the brief or the owner didn't ask for.
- **No invented facts**: fees, phone, rates stay placeholders unless research confirms them (`docs/research/`).
- **Log every loop** in `docs/refinement-log.md`: loop, lens, score before -> after, what changed, issues handed on.
- Stop when usage gets close to the limit: log, commit, push; the next session resumes at the next loop number.

## Score (0-5 each; total /30)
Card-shop identity (does it read as a card shop at a glance) · main actions (events, find a card, visit: one tap,
obvious) · content truth (real facts, honest placeholders) · accessibility and motion safety (needs a check-site run
for >4) · craft (layout, type, spacing at 390 and 1280) · code (clean, tested, secure, fast).

## Phase 2: loops 51-80 (owner, 2026-11-20: "do 30 more loops until the score is 30 out of 30, or at least 29.5")
Start: 27/30 at loop 50 (identity 4, actions 4, truth 5, a11y 5, craft 4, code 5). Bar for a 5, judged by the
review loops (60, 70, 80) from fresh shots and runs:
- **Identity 5:** every page reads as this card shop at a glance at 390 and 1280, with one strong card object per page
  carrying real information, a consistent object family and no generic boxes left. Real photos help most; until
  the owner sends them, the drawn objects and slots must look intended, not missing.
- **Main actions 5:** events, find a card and visit are one tap from every page, and each ends in a useful result.
  "Find a card" hands off to a real stock search if one is verified (`docs/research/online-store.md`); otherwise the
  want list must be the best possible request flow.
- **Craft 5:** no dead space over 120px inside main at 390/768/1024/1280/1600, aligned edges and a consistent
  rhythm, measured by script, plus a pixel look at every page.
- Truth, a11y and code stay at 5: every loop keeps all gates green.
Review loops write the remaining gap per axis and the next nine loops' priorities. A score is never raised without
evidence, and never by inventing facts or loosening a check.

## Lenses (loop n uses lens ((n-1) mod 10) + 1)
1. Home: hero, the binder-week idea element, tonight strip, order of sections.
2. Events: schedule, one-offs, event card, sign-up form, empty states, .ics.
3. Shop: singles search / card request, sealed, preorders, condition guide.
4. Sell to us: buylist slip, rates placeholders, credit vs cash, condition rules.
5. Visit + chrome: hours/open-now, map, house rules, header, footer, 404, privacy.
6. Accessibility and motion: check-site, keyboard, 200% zoom, screen-reader names, reduced motion.
7. Card-shop identity and visual craft: designer screenshot review at 390/1280, fix the top defects.
8. Copy and voice: friendly, local, short; WORLD nouns; no template slogans; headings rule.
9. Code, security, performance, SEO: Worker tests, CSP, image sizes, JSON-LD, sitemap, Lighthouse-style budget.
10. **Review of the previous nine loops** (Opus): re-score, undo regressions, set the next ten loops' priorities.
