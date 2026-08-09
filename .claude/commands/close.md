---
description: Fold what was learned back into project-context and archive the EO
---

Close the active opportunity. Use the **scribe** subagent.

## 1. Extract the knowledge delta
Read the work-package logs, `review.md` and the final diff. Ask, for each:

- Did we discover a fact that would have saved time if it had been in
  `project-context/`? → new or amended entry.
- Did something mislead us? → a new `INV-xx`. **This is the highest-value output
  of the whole framework.** An opportunity that produced no `INV` either changed
  nothing interesting or the lesson was missed.
- Did we repeatedly correct the same class of mistake? → a new `STD-xx`.
- Did the architecture actually change? → amend `architecture.md`.
- Did we knowingly leave something worse? → `TD-nnn` in `debt.md`.

## 2. Write `close.md`
From the template, cap 80 lines: the delta table (apply each row, then tick it),
new debt, process notes, and the cost table. Process notes feed the next tier
decision — say plainly what made this cheap or expensive.

## 3. Apply and archive
- Apply each delta row to `project-context/*` / `standards.md`. Respect caps: if
  a file would exceed its cap, cut something stale rather than growing it.
- Move resolved findings, rejected alternatives and superseded drafts to
  `_appendix/`.
- Delete zero-byte files under the opportunity.
- `state.json`: `phase = closed`, `updated`.

## Report
New `INV`/`STD`/`TD` entries, the cost table, and one sentence on what to do
differently next time.
