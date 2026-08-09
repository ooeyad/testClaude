# EO-001 — archived v1 lifecycle record

The full document set produced for **EO-001 — Add Ladder-Climbing Enemy** under
the original ceremony-heavy process, before the v2 framework replaced it.

Kept because four of these documents existed **nowhere else**. They were
committed as zero-byte placeholders and filled in afterwards, so `git show`
returns empty for them; the migration record's claim that "every removed document
is committed on `main`" was accurate for three files and wrong for the rest:

| Document | Recoverable from git history? |
|---|---|
| `architecture/architecture-design.md` (v1.2) | ❌ 0 bytes on `main` |
| `implementation/implementation-plan.md` | ❌ 0 bytes on `main` |
| `approvals/architecture-approval.md` | ❌ 0 bytes on `main` |
| `approvals/implementation-approval.md` | ❌ never committed |
| `implementation/work-packages/WP-01/*` (4 files) | ❌ never committed |
| `opportunity.md` · `business-understanding.md` · `project-context-review.md` · `approvals/business-approval.md` | ✅ already in history |

## Why keep it

The implemented feature is on `main` (PR #9). What is *not* reconstructable from
the code is the reasoning: why ladders are deliberately not solids, why climbing
bypasses physics rather than zeroing gravity, why elevation is resolved from a
supporting surface instead of a `y` coordinate, and why the exit contract clamps
before resuming physics. Those decisions are recorded here with the alternatives
that were rejected and the reasons.

`architecture-design.md` also carries the six architecture review findings and
their resolutions, which is the clearest record of how the design changed under
review.

## What this is not

Not live process. The current framework is `engineering/README.md` and
`engineering/_framework/`. Nothing here should be followed as procedure — it is a
record of one completed opportunity, retained for its reasoning.

Empty scaffolding files (230 of them) and four binary snapshot tarballs were not
archived.
