# Universal Constitution — Articles I–IX

**Layer 1 of 2. Copied unchanged into every project. Never edited per project.**
Project-specific articles live in `constitution.md` as Articles X and upward.

These articles govern how specifications become code. They are not style advice:
a violation is a defect, and the only legitimate response to one is an entry in
the Complexity Tracking section of `plan.md` naming the article, the reason, and
the alternative that was rejected.

---

## Article I — Specification Before Code
Implementation begins only from an approved `spec.md`. The specification is the
source; code is its expression in a particular language. Maintaining software
means evolving the specification; a bug is a specification that produced the
wrong code.

**Enforceable:** no task in `tasks.md` may exist without a requirement ID it
satisfies. No commit touching product code may precede an approved spec.

## Article II — Explicit Uncertainty
When the input does not determine an answer, the answer is
`[NEEDS CLARIFICATION: the specific question]`. Never a plausible assumption.

**Enforceable:** a spec containing an unresolved marker cannot enter `/speckit.plan`.
Resolved markers are replaced by the decision and recorded in Clarifications.

## Article III — WHAT and WHY, Never HOW
A specification names user-visible behaviour and the reason for it. It contains
no technology, no file names, no function names, no APIs, no schemas. Those
belong to `plan.md`, which is free to change without the spec changing.

**Enforceable:** any technology noun in `spec.md` is a finding.

## Article IV — Simplicity
The smallest change that satisfies the specification. No speculative generality,
no "we might need", no abstraction introduced for a single caller. Where the
codebase already has an extension point, use it.

**Enforceable:** a new module, layer, indirection or dependency requires a
Complexity Tracking entry.

## Article V — Anti-Abstraction
Use the framework, library and codebase directly rather than wrapping them. One
representation per concept — no parallel model that must be kept in sync.

**Enforceable:** a wrapper whose only caller is this feature is a finding.

## Article VI — Verification Before Done
Every requirement carries a stated check, and the check is executed and its real
output recorded before the requirement is called satisfied. The *form* of
verification is project-defined (Article X) — but its existence is not optional,
and a claim without evidence is a defect regardless of whether it is true.

**Enforceable:** a task marked done whose check was not run is reopened.

## Article VII — Traceability by Identifier
Every task cites the requirement it satisfies; every requirement cites the user
story; every design decision cites the requirement that forced it. Downstream
artifacts reference identifiers — they never restate upstream prose.

**Enforceable:** restating an upstream artifact's content is a finding, not a
convenience. Identifier namespaces are listed in `SDD-STANDARD.md`.

## Article VIII — Reversibility
Every task is independently revertible and leaves the tree runnable. No "this is
broken until the next task lands".

**Enforceable:** a task that requires a later task to compile or run must be
merged into that task.

## Article IX — Context Economy
Context is a budget, not a convenience. Each role reads only its declared
read-set. Every artifact has a line cap; overflow moves to an appendix that is
not loaded by default. Durable facts about the codebase live once in
`.specify/memory/project-context/` and are read by every feature — never
rediscovered per feature.

**Enforceable:** opening a file outside your read-set is a process failure —
record `[CONTEXT GAP: what was missing]` in the artifact and stop. An artifact
over its cap is trimmed before the next gate, not after.

---

## Amendment
These nine articles change only by explicit human decision, recorded with a date
and a reason in the project's `constitution.md` under "Universal Amendments".
Adding project articles (X and upward) is not an amendment and needs no such
record.
