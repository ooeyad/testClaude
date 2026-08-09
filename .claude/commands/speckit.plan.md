---
description: Produce plan.md and the tier's design artifacts, with Constitution Checks
---

Use the **planner** subagent. Requires the specification gate approved and **zero**
`[NEEDS CLARIFICATION]` markers in `spec.md` (Article II). If either fails, stop
and say which.

## Read-set — binding
`state.json`, `spec.md`, both constitution files, `project-context/*`, and only
the code files named in the spec's verified facts. Further code reads are
allowed; justify each in one line in your report.

## Sequence

**Constitution Check — before Phase 0.** Fill the table in `plan.md`: Simplicity
(IV), Anti-Abstraction (V), Verification (VI), Context Economy (IX), plus the
project articles. A "no" is not a blocker — it is a Complexity Tracking row.
A "no" you cannot justify is a design you should change.

**Phase 0 — Research.** *Deep tier only.* Resolve genuine unknowns into
`research.md`. If nothing is genuinely unknown, write one line saying so and skip
the file. An empty `research.md` is worse than none.

**Phase 1 — Design.** Write the approach, the `DD` decision register, the change
inventory (every file: new / additive / modify / data, and whether it touches a
shared contract), and the invariant impact table — every `INV` near the change
gets a verdict and the check that proves it. Then produce only the artifacts the
feature actually needs: `data-model.md` if domain data changes, `contracts/` if
an interface others call changes, `quickstart.md` always.

**Constitution Check — after Phase 1.** Re-run the table. Design is where
violations actually surface; the first check is optimism, this one is evidence.

## Discipline
- Article IV: the smallest change that satisfies the spec. Where the codebase has
  an extension point, use it. Adding a system where data would do is a defect.
- Article IX: `plan.md` stays high-level and readable. Code samples, detailed
  algorithms and long derivations go to `implementation-details/`, which is not
  loaded by default. Rejected alternatives get one line each, not a section.
- Every `DD` cites the `FR` or `INV` that forced it (Article VII).

## Report
The decisions with the widest blast radius · every shared-contract change · every
invariant at risk · every Complexity Tracking row · what you would drop if the
budget were halved. Then `/speckit.tasks`, or the design gate if the tier is deep.
