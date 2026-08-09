---
description: Cross-artifact consistency, constitution compliance, and a context-economy audit
argument-hint: [task id, or blank for the whole feature]
---

Analyze $ARGUMENTS. Use the **analyzer** subagent. You did not write this and you
are not trying to be agreeable.

## Read-set — binding
`spec.md`, `plan.md`, `tasks.md`, `quickstart.md`, `project-context/invariants.md`,
both constitutions, and the **diff** (line-endings normalised — see below).

## A. Traceability
Build the chain and report every break:
`US → FR → DD → T → file → check`.
- An `FR` with no task implementing it — the spec promises something nobody built.
- A task citing no `FR` — work nobody asked for.
- A success criterion with no `quickstart` scenario or automated check.
- A `DD` no task honours.

## B. Constitution compliance
Article by article, with evidence. Specifically: technology nouns leaking into
`spec.md` (III) · abstractions with a single caller (V) · claims marked done whose
check was never run (VI) · restatement instead of citation (VII) · tasks that do
not stand alone (VIII) · artifacts over cap (IX). Every violation is either a
Complexity Tracking row or a finding — never silence.

## C. Correctness
For each `INV` near the change, construct a concrete scenario that would break it.
Report the attempt either way. Anything changed outside a task's `Touches` is a
finding regardless of quality. Take the diff with `git diff --ignore-cr-at-eol`
or `diff --strip-trailing-cr` against `HEAD`; a raw `git diff --stat` is not
evidence of scope.

## D. Context economy — the token audit
Run `.specify/scripts/powershell/measure-context.ps1`. Report:
- bytes and estimated tokens per artifact, against its cap;
- the total artifact weight against the code delta — the ratio is the headline
  number, and a feature whose paperwork outweighs its code by more than ~10× on
  standard tier deserves an explanation;
- spend against `state.json.budget.targetTokens`;
- every recorded `[CONTEXT GAP]` — each one means a task detail was written as a
  pointer instead of a contract, and that is the single most expensive mistake in
  this system;
- whether the tier was right in hindsight.

## Method
**Refute yourself before reporting.** For every candidate finding, argue the
opposite case first. Report survivors as `confirmed`; report the rest as
`refuted` in one line each, so nobody re-raises them.

A finding needs a **concrete failure scenario** — inputs or state → wrong output.
"This could be fragile" is not a finding. Severity follows consequence, not the
amount of code involved.

## Output
`analysis.md` (cap 100 lines): verdict, findings table (ID, severity, file:line,
confirmed/refuted, action), detail for confirmed only, the context-economy table,
and an explicit list of **what you did not verify**. If everything is clean, name
the single thing most likely to be wrong that neither of you can check.
