---
description: Resolve business decisions into the BD register (analyst role)
---

Use the **analyst** subagent on the active opportunity (highest `EO-nnn` whose
`state.json.phase` is not `closed`, unless I name one).

## Read-set — binding
`state.json`, `brief.md`, `engineering/project-context/index.md`. Nothing else.
If you need a code fact, say which and stop; do not go read the codebase.

## Method
1. List the decisions that must be made **before design can start**. A decision
   qualifies only if a human's preference determines it. Anything the code
   answers is not a business decision — it belongs in the brief's context delta.
2. Ask **one question at a time**, with 2–4 concrete options and your
   recommendation plus its consequence. Never ask two questions in one message.
3. After each answer, append to the `BD` table in `decisions.md` immediately.
4. Stop when every `BD` is 🟢 decided or ⚪ deferred with a revisit trigger.

## Forbidden
Design, file names, function names, data structures, implementation approach.
If a question can only be answered by choosing an implementation, it is an `AD`
— move it to `/design`.

## Write
`decisions.md` section A only. Cap: whole file ≤200 lines. Rationale only where
the answer is non-obvious, ≤4 lines. Update `state.json` phase and
`openQuestions`. Then: `/gate scope`.
