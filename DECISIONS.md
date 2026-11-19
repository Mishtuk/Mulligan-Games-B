# Decisions

Format: number, date, who, question, ruling, why. Newest last. Rulings win over personal taste. A rule nobody
used in two rounds gets deleted.

- **D1** (2026-11-19, owner): What carries over from the old concept site? **Ruling:** only the official logo
  (`public/img/logo/`). Everything else is new. **Why:** owner did not like the old site; wants it to read as a card shop.
- **D2** (2026-11-19, boss): Template repo? **Ruling:** read-only reference; patterns copied into this repo, never
  edited there; the kit's "send to refinement log" step is replaced by `HANDOFF.md` "Built without a pattern".
  **Why:** owner said make no edits to the template repo.
- **D3** (2026-11-19, boss): Phone, email, fees, rates? **Ruling:** marked placeholders in `src/data/*.json` until
  the owner confirms. Address 445 York Road and the hours are public store facts and are shown with a "confirm" flag
  in data. **Why:** hard rule 5 and "no guessing the client's facts".

## Decision rules
- Check here before asking. A recorded decision answers the question.
- Hard rules in `CONTEXT.md` are never traded away.
- If a reviewer's rule conflicts with a decision here, the decision wins; report the conflict to the boss.
- A decision that costs money, publishes, or contacts the client is the owner's, not the team's.
