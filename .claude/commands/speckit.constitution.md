---
description: Create or amend the project constitution, and build the project-context memory
argument-hint: [--context to rebuild memory only]
---

Articles I–IX are universal and live in `.specify/memory/constitution-universal.md`.
They are **binding and never edited here**. This command owns Articles X and
upward, and the memory that makes every later feature cheap.

## If the project constitution does not exist
Read `.specify/memory/constitution-universal.md`, then determine from the codebase:

- **Article X — Verification Regime.** What actually proves a change works *here*?
  A test runner, a type check, a headless harness, a manual checklist. Article VI
  demands verification exists; this is where you say what it is. Write the literal
  commands, so a task's check can be copy-pasted from it. If the project has no
  test framework, say so plainly and define the substitute — do not import
  Test-First from a template it does not fit.
- **Article XI — Technology Constraints.** The rules that make new code look like
  it belongs. Language level, module convention, what may never be introduced.
- **Article XII — Delivery Constraints.** Branching, commits, PRs, approvals.
- **Human Gates.** Who decides, and at which of the three gates.

Propose the articles, show your evidence for each, and **ask before writing**.
An article you cannot point at code to justify is a guess — leave it out.

## `--context` — build or refresh memory
Write `.specify/memory/project-context/`: `index.md`, `architecture.md`,
`domain.md`, `flows.md`, `invariants.md`, `debt.md`.

**Caps are hard:** 80 · 200 · 120 · 150 · 120 · 80 lines. At the cap you cut
something stale; you never append past it.

**`invariants.md` is the priority.** An `INV` qualifies only if it is (a) not
obvious from reading the code and (b) will cause wrong code if unknown. Aim for
8–15 entries covering coordinate and unit conventions, ordering and timing
constraints, load or initialisation coupling, return values that do not mean what
they look like, thresholds that silently gate behaviour, and constants that look
arbitrary but are tuned. A restatement of what a function does is not an
invariant. Every entry carries the code location that proves it.

**`domain.md` must include what does NOT exist.** A feature assuming a concept the
codebase lacks is being introduced, not reused — and that changes its tier.

Refreshing means **diffing**, not rewriting. Report new / changed / removed
entries. If a previously recorded fact is now wrong, say so loudly: a stale
invariant is worse than a missing one.

## Amending
Changing Articles X+ is ordinary: edit, bump the version, note the date.
Changing Articles I–IX requires an explicit human decision recorded in the
project constitution's Universal Amendments table.

## Report
The articles by number with one line each, the count of `INV` entries, and the
three facts most likely to save the next feature time.
