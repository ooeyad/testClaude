---
description: Derive tasks.md from the plan — ordered, traceable, parallel-marked
---

Use the **planner** subagent. Requires `plan.md`, and the design gate if the tier
is deep.

## Read-set — binding
`state.json`, `plan.md`, `spec.md`, `data-model.md` and `contracts/` if they
exist, `project-context/invariants.md`, `.specify/memory/constitution.md`.

## Rules
- **Traceability (VII):** every task names the `US`/`FR` it satisfies. A task
  that satisfies nothing is deleted, not justified.
- **Reversibility (VIII):** every task leaves the tree runnable. A task that only
  compiles once a later task lands is merged into it.
- **Order within a phase:** verification artifacts first (per Article X), then
  data, then behaviour, then wiring, then content and tuning.
- **Phases:** Setup → Foundational (only what blocks *every* story; "none" is a
  valid and preferred answer) → one phase per user story in priority order →
  Polish. Each story phase ends with a **Checkpoint**: how a human confirms that
  story works, in one action.
- **`[P]`** marks tasks that touch different files with no dependency between
  them. If two `[P]` tasks can touch the same file, they are not `[P]`.
- Task count is a smell: quick 1–3 · standard 3–10 · deep 5–15. More than 15
  means the feature should be split.

## Task detail — where the token savings live
Write a **Task detail** entry for every task whose contract is not obvious from
one line. That entry must be **self-contained**: the implementer must never need
`plan.md` or `spec.md`. It carries the goal, the checkable *Done when*, the exact
files and regions it may touch, the files it must not touch **and why the
temptation exists**, the behaviours that must not change, and ≤6 notes covering
only what is *not* discoverable by reading the touched files.

Cite `FR`/`DD`/`INV` identifiers for traceability — never as required reading.

## Write
`tasks.md` (caps: quick 40 · standard 100 · deep 140) and mirror the task table
into `state.json`.

## Report
The task table, the critical path, which tasks are genuinely parallel, and the
one task most likely to go wrong.
