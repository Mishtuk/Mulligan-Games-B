# Standing brief for every refinement loop (boss)

You are running ONE refinement loop on the Mulligan Games website. The boss tells you the loop number, lens and
priorities. Everything else is here.

## Read first (only these)
1. `CONTEXT.md` (hard rules, owner instructions), `DECISIONS.md`, `DESIGN.md` (sections that touch your lens).
2. `docs/refinement-plan.md` (score, lenses), the last 3 rows of `docs/refinement-log.md`.
3. The code for your lens only. Role file: `.claude/agents/coder.md` (or `designer.md` for lens 7, `boss.md` for lens 10).
Kit `C:\Users\alexm\projects\Base-Website-Design-Template` is READ-ONLY reference. Never open `Mulligan-Games-Website-concept-`.

## Do
1. Score the site before (six 0-5 scores, plan's rubric) from screenshots and code, not memory.
2. Pick the 2-4 changes with the biggest gain inside your lens (the boss's priorities first). Small, surgical diffs.
   A loop also cuts: remove something redundant, wordy or fussy when you see it.
3. Never invent facts: no prices, fees, phone, rates, reviews, people. Public pages never show research jargon
   ("Likely", "Unverified", "455 on Wizards"); uncertain facts get one quiet "Confirm with the store" line.
4. Keep: hard rules, tokens only (no colour literals outside `:root`), motion gated by the switch and reduced motion,
   no inline scripts (CSP), headings never "The" + word, every page one click from the nav, 48px targets.

## Check (all required before you report)
- `npm run build` clean and `npm test` green (add or update a test for any logic you touch).
- `npm run build && PORT=43NN node tools/serve.mjs` (NN = loop number, so ports never clash), then
  `MSYS_NO_PATHCONV=1 node tools/check-site.mjs http://localhost:43NN / /events/ /shop/ /sell/ /visit/ /privacy/ /nope` exits 0.
- Screenshots of the pages you changed at 390x844 and 1280x800 (scripts in `.work/`), into `docs/review/loop-NN/`.
  LOOK at them before and after. Stop the server (kill only your own PID).
- Append one row to `docs/refinement-log.md`: `| NN | lens | before -> after /30 | what changed (1-2 lines) | handed on (1 line) |`.
- Add a line to `HANDOFF.md` "Log" (newest first). Do not commit; the boss commits and pushes.

## Report (max 8 lines)
Score before -> after, changes, test count, check-site result, screenshot folder, what you did not check, one
suggestion for the next loop.
