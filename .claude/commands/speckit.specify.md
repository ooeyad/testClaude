---
description: Turn a feature description into spec.md — WHAT and WHY only
argument-hint: <feature description>
---

Create a specification for: **$ARGUMENTS**

## Read-set — binding
`.specify/memory/constitution.md`, `.specify/memory/project-context/index.md`,
`.specify/memory/project-context/invariants.md`. Nothing else yet.

## 1. Allocate
Run `.specify/scripts/powershell/create-feature.ps1 -Name "<slug>"` (or the
equivalent by hand): next free `NNN`, create `specs/NNN-slug/`, derive the branch
name. Do not create the branch or any file the tier does not require.

## 2. Ask — at most 6 questions, in one message
Only what neither the code nor the constitution answers: the problem in their
words · what "done" looks like to them · what is explicitly out of scope · hard
constraints · who approves · urgency. Never ask a design question here.

## 3. Verify against the code — bounded
≤10 file reads, confirming the facts the spec depends on. If a fact contradicts
`project-context/`, say so explicitly: that is a finding, not a footnote, and it
may mean memory is stale.

## 4. Propose the tier
Answer each aloud, one line: more than 2 files? · a new module or file? · a
shared contract or public signature changed? · behaviour of an existing feature
changed? · irreversible or data-affecting? · a new dependency or build step? ·
security or privacy surface?

0 yes → **quick** · 1–3 yes, all local → **standard** · any shared-contract,
irreversible or security yes → **deep**.

State the tier, the items that forced it, the artifact set it implies, and the
token budget (quick 15k · standard 80k · deep 250k). **Ask the human to confirm.**

## 5. Write `spec.md`
From `.specify/templates/spec-template.md`. Caps: quick 50 · standard 100 · deep 120.

**Article III is the discipline here.** No technology, no file name, no function
name, no API, no schema. If you catch yourself writing one, the sentence belongs
in `plan.md`.

**Article II is the other.** Where the input does not determine an answer, write
`[NEEDS CLARIFICATION: the specific question]`. Do not resolve it by picking the
most likely option — that is precisely the failure this marker exists to prevent.
Aim the markers at decisions a human's preference settles, not at facts you could
have read from the code.

Also write `state.json` from the template: id, slug, tier, tierReason, phase
`specify`, gates per tier, the artifact set, read-sets, budget.

## 6. Report
Tier and budget · the count of `[NEEDS CLARIFICATION]` markers · the three facts
that most shape the work · next command (`/speckit.clarify` if any marker
remains, otherwise `/speckit.plan`).
