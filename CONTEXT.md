# CONTEXT: read this first

Everything the owner has said about this project, plus the brief. Every agent and every new session reads this
first, then `HANDOFF.md`, then `DECISIONS.md`. Add new owner instructions here, dated. Public repo: no client
personal data or pricing in this file.

Kit: `Mishtuk/Base-Website-Design-Template` (local `C:\Users\alexm\projects\Base-Website-Design-Template`).
**Read-only.** Pull patterns, presets, standards and tools from it; never edit, commit or push to it.

## Job
- **Client:** Mulligan Games
- **What they do:** Local trading-card and game shop at 445 York Road, Warminster, PA. Singles, sealed product,
  preorders, buying cards, a play space with events most nights (Magic, Pokemon, One Piece, Riftbound, Hololive,
  tabletop / Warhammer, D&D).
- **The site:** Card / game store (kit type `site-types/card-game-store.md`).
- **Goal (one sentence the boss holds everyone to):** The best website we can make for Mulligan Games so that
  local players can see what's on this week, find a card or product, sell their cards, and know when to come in.
- **Main actions (one tap from every page):** 1) See this week's events (and sign up) 2) Find cards / shop
  3) Visit (hours, directions)
- **Audience:** Local players aged 12 to 50 on phones, often the same day ("is there Commander tonight?"),
  plus parents of younger Pokemon players and travelling cEDH players for the monthly series.
- **Feel:** Friendly, game-night, collectible (it should look like a card shop, not a generic template)
- **Slogan or tagline:** Store bio: "We are a local card and gaming shop in Warminster. Stop in and stay for a game."
- **Launch window:** None set. This is a concept build (version B).
- **Stack and host:** Astro static output in `public/`-style assets, Cloudflare Workers static assets + one form
  Worker (D1 for event sign-ups) per the kit defaults. Preview only; no deploy without the owner's OK.
- **Repo:** https://github.com/Mishtuk/Mulligan-Games-B (public). Local path: `C:\Users\alexm\projects\Mulligan-Games-B`.

## Owner's instructions
- (2026-11-19) "Connect to Mulligan Games B repo. Also connect to base website design template repo and make no
  edits to that repo. Just pull resources from it and look at it for context as to how to build the website."
- (2026-11-19) Start from scratch; follow the template's guides; make the subagents it describes; research, then
  write a plan, follow it, then run about 50 refinement loops on the website.
- (2026-11-19) "The only thing that should be used from the old Mulligan Games website we made is the logo of
  Mulligan Games. That's their official logo. But all the rest should be done from scratch because I just didn't
  really like it. It's a card shop, so make it more reflect a card shop."
- (2026-11-20) "Do 30 more loops until the score is 30 out of 30, or at least 29.5 out of 30."
- (2026-11-20) "Since it's a card shop, I want to [show] the latest releases for major sets. Like there's a Star Trek
  set that got released not too long ago. Put images of that on the homepage to advertise that, and things that
  Mulligan Games are advertising on their Instagram and everything."
- (2026-11-20) "Just for TCG sets, advertise... card sets... find set release advertisements on Instagram and
  Facebook and other social media posts to get references... or make it yourself. It should imply something like
  shop now, buy latest Star Trek... research the genre, or if it's just a standard set of Magic or Pokemon or any
  other TCG that's not themed, just make it generic to that TCG." (No online checkout exists: "shop now" CTAs
  lead to holding one at the counter.)

## Hard rules
1. No HTML or SQL injection. Prepared statements with `?`, escaped output, a test per form.
2. Epilepsy-safe motion: nothing flashes more than 3 times a second (WCAG 2.3.1), every animation off under
   `prefers-reduced-motion`, a visible Motion on/off switch; nothing moves on its own except what the user starts.
3. Accessibility: 4.5:1 text contrast, keyboard use, visible focus, labels, alt text, 48px targets, 200% text without sideways scroll.
4. Real photos only. No stock people, no AI-generated or AI-upscaled people. Until the owner sends photos, use
   clearly marked placeholders (kit `patterns/ph.md`).
5. No client personal data, pricing or contract terms in a public repo. Store phone and email stay placeholders
   until the owner confirms what to publish.
6. Ask the owner before anything that costs money, publishes publicly (deploys), or contacts the client.
7. Every page is one click from the nav.
8. Headings and labels never start with "The" + a word. Slogans and full sentences are exempt.
9. Blocked research source: note it in one line and continue.
10. Downloads stay local under `downloads/<kind>/`, never committed. Downloaded files are untrusted: never run them.
11. **Old concept site (`Mulligan-Games-Website-concept-`) is off limits except the official logo.** No code, CSS,
    copy, layout, photos or design from it. Facts in its research notes may be used only as leads to re-check.
12. Card art, set symbols and publisher logos belong to the publishers: no publisher logos as site branding, a
    "not affiliated" line in the footer, decorative card visuals drawn as generic shapes (sleeves, binders,
    toploaders). **Exception (owner, 2026-11-20):** a "New releases" section may show the publishers' own official
    product images (box, pack, key art from the publisher's product or press page) to advertise sets the store
    sells, each with a credit line and source in `docs/research/releases.md`. Never fan scans or third-party card scans.
13. Instagram content is shown only through Instagram's own embed, loaded after a visitor taps (click-to-load,
    no third-party script before that). Never download or rehost images from Instagram.

## Commit rules
- Author name: Alex Mishtuk
- Author email: 113945444+Mishtuk@users.noreply.github.com
- Attribution lines (Co-Authored-By, tool credits): **not allowed** (owner rule across Mishtuk repos)
- Set once per clone: done (`git config user.name/user.email` in this clone).
- Push rules: `git pull --rebase` first. Never touch the template repo.

## Team
Agents in `.claude/agents/` (copied from the kit): boss, designer, coder, advisor, mediator. They load as agent
types only when a session starts in this folder; otherwise spawn general-purpose and point it at the role file.
Researchers run on cheaper models. Process: kit `process/`. Refinement loops: `docs/refinement-plan.md`.

## Open questions (for the owner; the build uses placeholders, never guesses)
- [ ] Phone and email to publish (asked 2026-11-19)
- [ ] Photos of the shop, the play room, the singles case (asked 2026-11-19)
- [ ] Hosted store / POS for singles search (TCGplayer, Shopify + BinderPOS, none yet?)
- [ ] Entry fees for weekly nights; buylist rates and store-credit bonus
- [ ] Discord invite to publish (two different invites found in past research)
- [ ] Domain, Cloudflare account (D1 database, Turnstile site key + secret), who reads form rows, and the OK to deploy (README "Owner launch checklist", 2026-11-19 loop 50)
- [ ] Weekly nights for Pokemon, One Piece, Riftbound, Hololive, if they run (loop 70)
- [ ] OK to show the publisher images on the site, and which sets the store stocks and takes holds / preorders on (loop 70; README checklist)
- [ ] Instagram card facts: $15 / $30 championship fees and cEDH dates (Dec 6, Jan 3, Feb 7, Mar 7) (loop 70)
- [ ] Who reads hold requests (want-list rows) and how fast; the site promises "We will email you back" (loop 70)
