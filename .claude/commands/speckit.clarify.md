---
description: Resolve every [NEEDS CLARIFICATION] marker, one question at a time
---

Use the **specifier** subagent on the active feature.

## Read-set — binding
`state.json`, `spec.md`, `.specify/memory/project-context/index.md`. Nothing else.
Needing a code fact means the marker was aimed wrong — say which, and stop.

## Method
1. List every `[NEEDS CLARIFICATION]` marker in `spec.md`, in priority order:
   the ones that would change the shape of the solution first.
2. Ask **one question per message**, with 2–4 concrete options, your
   recommendation, and the consequence of each. Never a bare open question, never
   two questions at once.
3. After each answer: append to `## Clarifications` as `Q: … → A: …`, rewrite the
   affected requirement to state the decision, and **delete the marker**.
4. Stop when zero markers remain, or the human explicitly defers one — a deferred
   marker moves to Assumptions with its failure mode stated.

## Forbidden
Design, technology, file names, data structures, approach. A question that can
only be answered by choosing an implementation is not a clarification — it is a
design decision, and it belongs to `/speckit.plan` as a `DD`.

## Done
Update `state.json` (`clarifications.open`, `phase`). Then the **specification
gate**: present a packet under 40 lines — what is being approved, the decisions
signed off, what becomes hard to reverse — and ask. Never mark a gate approved
without an explicit human answer in this session.
