---
description: Adversarial review of a work package or the whole opportunity
argument-hint: [nn | blank for whole EO]
---

Review $ARGUMENTS. Use the **reviewer** subagent. You did not write this code and
you are not trying to be agreeable.

## Read-set — binding
The card(s), `brief.md` §Success criteria, `plan.md` §Validation gates,
`engineering/project-context/invariants.md`, `engineering/standards.md`, and the
**diff**. Take the diff with line endings normalised — `git diff --ignore-cr-at-eol`,
or `diff --strip-trailing-cr` against `git show HEAD:<path>` (STD-17). A raw
`git diff --stat` can report every file in the repo as rewritten and is not
evidence of scope. Read full files only where the diff is not self-explanatory.

## Method
1. **Verify the claims.** For every *Done when* and every check the engineer says
   passed, re-run it or find the evidence. A claim without evidence is a finding.
2. **Attack the invariants.** For each `INV` near the change, construct a
   concrete scenario that would break it. If you cannot construct one, say so.
3. **Scope.** Anything changed outside the card's `Touches` is a finding,
   regardless of quality.
4. **Standards.** Cite `STD-xx` by ID; a rule you cannot check against the diff
   is not a finding.
5. **Refute your own findings before reporting.** For each candidate, argue the
   opposite. Report only what survives, marked `confirmed`; report the rest as
   `refuted` with one line, so nobody re-raises it.

Every confirmed finding needs a **concrete failure scenario**: inputs or state →
wrong output. "This could be fragile" is not a finding.

## Write
`review.md` — cap 100 lines. Severity high / med / low. State explicitly what
you did **not** verify.

## Report
Verdict, confirmed findings ranked by severity, and — if clean — the single
thing most likely to be wrong that neither of us can check.
