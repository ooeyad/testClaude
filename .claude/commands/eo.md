---
description: Start a new Engineering Opportunity — brief, tier proposal, state.json
argument-hint: <short title of the change>
---

Start Engineering Opportunity: **$ARGUMENTS**

## Read first (nothing else)
`engineering/project-context/index.md`, `engineering/project-context/invariants.md`,
`engineering/README.md`.

## 1. Allocate
Next free `EO-nnn` under `engineering/opportunities/`. Slug = kebab-case title.
Create `engineering/opportunities/EO-nnn-<slug>/`.

## 2. Ask the human — at most 6 questions, one message, multiple choice where possible
Ask only what you cannot determine from code or context. Typically:
problem in their words · what "done" looks like to them · anything explicitly out
of scope · hard constraints · who approves · urgency.
Do **not** ask questions the code answers. Do **not** ask design questions here.

## 3. Verify against the code
Spend a bounded pass (≤10 file reads) confirming the facts the brief will assert.
Record each as `F-n` with `path:line`. If a fact contradicts
`project-context/`, say so explicitly — that is a finding, not a footnote.

## 4. Propose the tier
Walk this checklist out loud, one line per answer:

- more than 2 files? · a new module or file? · a shared contract or public
  signature changed? · behaviour of existing features changed? · irreversible or
  data-affecting? · a new dependency or build step? · security/privacy surface?

0 yes → **quick** · 1–3 yes, all local → **standard** · any shared-contract,
irreversible, or security yes → **deep**.

State the tier, the items that forced it, and the token budget
(quick 15k / standard 80k / deep 250k). **Ask the human to confirm before writing.**

## 5. Write
- `brief.md` from `engineering/_framework/templates/brief.md` — **cap 50 lines
  for quick tier, 100 for standard and deep**.
- `state.json` from the template: id, slug, title, tier, tierReason, phase
  `brief`, gates per tier (quick: release · standard: scope + release · deep:
  scope + design + release), `context` read-sets, `updated`.
- `approvals.md` with the gate rows, all pending.

Create nothing else. No empty directories, no placeholder files.

## 6. Report
Tier, budget, the 3 facts that most shape the work, open questions, and the next
command (`/clarify` for standard/deep, `/plan` for quick).
