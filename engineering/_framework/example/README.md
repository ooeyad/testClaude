# Worked example — EO-001, Add Ladder-Climbing Enemy

This is the real EO-001 from this repository, rewritten in the v2 format. It is
**reference only** — never auto-loaded, never part of an active opportunity.

Read it to see the shape of a **deep**-tier opportunity: what a brief contains,
how 19 business decisions fit in one table, what a change inventory looks like,
and — most importantly — what a self-contained work-package card looks like
(`wp/WP-04.md`, the one shared-contract change in the whole design).

## Why it exists

The original EO-001 produced ~878 KB of documents. Everything below is the same
decisions, the same design and the same traceability in **~12 KB**. Nothing that
constrains implementation was dropped; what was dropped was restatement,
resolved-finding history, per-role ceremony, and prose around tables.

| Original | Bytes | Here |
|---|---:|---|
| `opportunity.md` | 9,020 | `brief.md` |
| `business-understanding.md` | 38,283 | `decisions.md` §A |
| `project-context-review.md` | 42,095 | `engineering/project-context/*` (permanent, repo-wide) |
| `architecture-design.md` | 64,551 | `decisions.md` §B–F |
| `implementation-plan.md` | 40,445 | `plan.md` |
| 3 approval documents | 14,541 | `approvals.md` (a table) |
| WP-01 × 4 files | 51,461 | one card, ≤120 lines |

The feature was never implemented past WP-01. If you pick it up again, start
from `decisions.md` — the decisions are all still valid.
