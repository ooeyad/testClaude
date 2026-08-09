---
description: Build or refresh engineering/project-context/ from the code
argument-hint: [area to refresh, or blank for all]
---

Refresh project context$ARGUMENTS. Use the **scribe** subagent.

This runs once per repo, then only when context has drifted from reality. It is
the most reused artifact in the framework — every future opportunity reads it
instead of rediscovering the codebase.

## Rules
- **Caps are hard:** index 80 · architecture 200 · domain 120 · flows 150 ·
  invariants 120 · debt 80 lines. Over cap ⇒ cut, do not append.
- Every claim is verified against code and carries `path` (and `:line` where it
  is a specific fact). No inference presented as fact.
- **`invariants.md` is the priority.** An `INV` qualifies only if it is (a) not
  obvious from reading the code and (b) will cause wrong code if unknown. A
  restatement of what a function does is not an invariant. Aim for 8–15 entries
  covering: coordinate conventions, timing/ordering constraints, load-order
  coupling, return values that do not mean what they look like, hard-coded
  thresholds that gate behaviour, and tuned constants that look arbitrary.
- Refreshing means **diffing**, not rewriting: show what changed and why.
- Anything project-specific and enforceable becomes an `STD-xx` in
  `engineering/standards.md` instead.

## Output
The changed files, plus a summary listing new/changed/removed `INV` and `STD`
entries. If a previously stated fact turned out to be wrong, say so loudly.
