---
description: Run one work package end to end (engineer role)
argument-hint: <nn>  e.g. 03
---

Run work package **WP-$ARGUMENTS**. Use the **engineer** subagent.

## Read-set — binding, in this order
1. `state.json` (status, deps)
2. `wp/WP-$ARGUMENTS.md` — the card
3. `engineering/project-context/invariants.md`
4. `engineering/standards.md`
5. **Only** the code files listed in the card's `Touches`, plus files they
   directly depend on for a signature you must match.

Opening `decisions.md`, `plan.md` or the architecture design is a process
failure. If the card is insufficient, record `CTX-GAP` and stop.

## Sequence

**a. Ack.** Append an `Ack` section to the card's log: your understanding in two
lines, assumptions (≤5), questions (≤5, each marked blocking or not), and any
`CTX-GAP`. If anything blocks — set card and `state.json` status to `blocked`,
report, and stop. Do not guess.

**b. Check preconditions.** Dependencies `done`; required gates approved;
working tree clean enough that your diff will be legible.

**c. Implement.** Only the files in `Touches`, only the named regions. Match the
surrounding style (STD-01). If you find yourself wanting to fix an adjacent
thing — do not; record it as `TD-nnn` in the log.

**d. Self-check.** Run the universal gates from `plan.md` (they are quoted in the
card) and each *Done when* item. Record the exact command and its result. When a
check is "only my files changed", normalise line endings first (STD-17) — a raw
`git diff --stat` can list the whole repo and prove nothing.

**e. Log.** Append the `Done` section: files changed one line each, deviations
as `DEV-nnn` with the reason, checks and results, and what you deliberately did
not do. Set card status to `review`, update `state.json`.

## Stop conditions
Touching a file outside `Touches` · changing an `INV` behaviour · an assumption
you cannot verify in code · >5 open questions · a *Done when* you cannot check.
Stop, log, ask. Never widen scope silently.

## Report
≤10 lines: what changed, deviations, check results, next package.
