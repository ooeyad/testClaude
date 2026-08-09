---
description: Execute one task (or a parallel group) from tasks.md
argument-hint: <task id, e.g. T003 — or "next", or a [P] group>
---

Execute **$ARGUMENTS**. Use the **implementer** subagent.

## Read-set — binding, in this order
1. `state.json` — status and dependencies
2. `tasks.md` — the task line and its **Task detail** entry
3. `.specify/memory/project-context/invariants.md`
4. `.specify/memory/constitution.md` — Articles X–XII
5. **Only** the files the task's `Touches` lists, plus any file you must read to
   match a signature you are calling.

Opening `spec.md`, `plan.md`, `research.md` or `data-model.md` is a process
failure (Article IX). The task detail is meant to be sufficient. If it is not,
that is a defect in the task, not a reason to read more: record
`[CONTEXT GAP: what was missing]` in the task log and stop.

## Sequence
1. **Acknowledge.** Append to the task's log: your understanding in two lines,
   assumptions (≤5), questions (≤5, each marked blocking or not), and any context
   gap. Any blocker ⇒ status `blocked`, report, stop. Never guess past a blocker.
2. **Check preconditions.** Dependencies done; required gates approved; the
   working tree clean enough that your diff will be legible. If the tree already
   carries unrelated changes, say so before adding to them.
3. **Implement.** Only the listed files, only the named regions, matching the
   surrounding style exactly (Article XI).
4. **Verify.** Run the task's check and the project's verification regime
   (Article X). Record the literal command and its real output. A check you did
   not run is not a check, and Article VI makes an unevidenced claim a defect.
5. **Log.** Append: files changed one line each, deviations with reasons, checks
   and results, and what you deliberately did not do.

## Scope checks
When confirming "only my files changed", normalise line endings first —
`git diff --ignore-cr-at-eol`, or `diff --strip-trailing-cr` against
`git show HEAD:<path>`. A raw `git diff --stat` can report an entire repository
as rewritten and proves nothing.

## Hard stops
A change would touch a file outside `Touches` · an `INV` behaviour would change ·
an assumption you cannot verify in code · a *Done when* you cannot check · more
than 5 open questions · the adjacent bug you noticed (record it as `TD-nnn`; do
not fix it).

Stop, log, ask. Scope never widens silently.

## Report
≤10 lines: what changed, deviations, check results, next task.
