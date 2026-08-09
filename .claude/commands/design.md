---
description: Produce architecture decisions and the change inventory (architect role)
---

Use the **architect** subagent. Requires gate `scope` = approved; if it is not,
stop and say so.

## Read-set — binding
`state.json`, `brief.md`, `decisions.md`, `engineering/project-context/*`,
`engineering/standards.md`, plus **only** the code files named in the brief's
context delta. Additional code reads are allowed but each must be justified in
one line in the report.

## Produce — into `decisions.md`, sections B–F
- **AD register.** One row per decision that constrains implementation. Each cites
  the `BD`/`INV`/`STD` it derives from. Rationale ≤6 lines, only where non-obvious.
- **Change inventory.** Every file: new / additive / modify, one line of what
  changes, and whether it touches a shared contract. Totals at the bottom.
- **Invariant impact.** For every `INV` in `project-context/invariants.md` that
  the change comes near: preserved or changed, and the check that proves it.
  A changed invariant requires an explicit `AD` and is called out at the gate.
- **Behavioural compatibility rule.** What must observably not change, and the
  test that demonstrates it.
- **Tuning parameters.** Named constants with units and the reason for the value.

## Discipline
- Prefer the smallest change that fits existing extension points
  (`project-context/architecture.md`). Adding a system where data would do is a
  design defect, not a judgement call.
- Rejected alternatives go to `_appendix/alternatives.md` — one paragraph each,
  never in `decisions.md`.
- Resolved review findings are archived to `_appendix/`, never carried inline.
- Cap: `decisions.md` ≤200 lines total.

## Report
The 3 decisions with the widest blast radius, every shared-contract change, every
invariant at risk, and what you would drop if the budget were halved.
Then: `/gate design`.
