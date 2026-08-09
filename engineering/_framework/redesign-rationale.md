# AI-Coding Framework — Redesign Rationale

**Status:** proposal, v2.0 · **Author:** Claude · **Date:** 2026-08-09
**Applies to:** every project, not just this repo.

---

## 1. What was measured

EO-001 (`add-ladder-climbing-enemy`) is one enemy type added to a ~110 KB
dependency-free canvas game. The real code delta is on the order of **10–15 KB
across ~8 files**. The process around it produced:

| Artifact | Bytes |
|---|---:|
| `business-understanding.md` | 38,283 |
| `project-context-review.md` | 42,095 |
| `architecture/architecture-design.md` | 64,551 |
| `implementation/implementation-plan.md` | 40,445 |
| `opportunity.md` | 9,020 |
| 3 approval documents | 14,541 |
| **Phase documents subtotal** | **208,935** |
| WP-01 only: kickoff + engineer-acknowledgement + implementation + tech-lead-acceptance | 51,461 |
| **Projected 13 work packages at WP-01's rate** | **~669,000** |
| **Total written for one feature** | **~878,000 bytes ≈ 220,000 tokens** |

That figure counts each document **once**. It ignores re-reads: the current
process has no read-set discipline, so a work-package cycle typically re-loads
the architecture design (≈17 k tokens) and the implementation plan (≈11 k
tokens) again. Realistic end-to-end cost for EO-001 is **500 k–1 M tokens**, for
a change a competent engineer would land in an afternoon.

Alongside that, the tree contains **~90 zero-byte files** (24 empty standards
files, 65 pre-created per-WP evidence stubs, an emptied `_legacy/` folder), and
**two parallel homes** for the same opportunity —
`engineering/opportunities/EO-001/` and
`engineering/projects/phefo/opportunities/EO-001/`.

---

## 2. Diagnosis — six root causes

**D1 — Restatement instead of reference.** `kickoff.md` restates the
architecture decisions; `engineer-acknowledgement.md` restates the kickoff
("Files I Am Permitted to Modify", "Files I Must Not Modify", "Validation I Must
Perform" — all three already exist verbatim in the kickoff);
`technical-lead-acceptance.md` restates both and adds answers. The same content
is written **three times per work package**. This alone is ~60 % of the document
mass.

**D2 — No machine-readable state.** Progress lives inside prose
(`**Status:** ✅ Complete — 19 business decisions resolved`). To answer "where am
I and what do I read next", an agent must open several large documents. Every
session pays a rediscovery tax.

**D3 — No read-set discipline.** Nothing says which documents a given role may
open. The default becomes "read everything", so the engineer implementing a
20-line data function loads a 64 KB architecture design.

**D4 — The process is not encoded.** `.claude/` contains only
`settings.local.json`. There are no slash commands and no agent definitions, so
the entire lifecycle is re-derived from chat prompts on every run. That is why
the structure drifted mid-flight (`_legacy/`, the duplicated project tree) and
why role behaviour is inconsistent between phases.

**D5 — Unbounded documents.** No length caps. `architecture-design.md` carries
six *already-resolved* review findings inline (§15, ~110 lines) — history that
must be paid for on every future read.

**D6 — Ceremony scaled to the process, not to the risk.** A one-line tuning
change and a new subsystem both travel the full six-gate path. Empty stub files
create the appearance of coverage without content, and cost tokens to enumerate
and open.

**What is genuinely good and is kept:** ID'd decision registers (`BD-xx`),
explicit human gates, "verified facts vs assumptions" separation, protected-file
lists per work package, and the traceability tables. The discipline is right;
the *encoding* is expensive.

---

## 3. Design principles

| # | Principle | Mechanism |
|---|---|---|
| P1 | One fact, one home | Everything downstream cites an ID (`BD-003`, `AD-005`, `INV-2`, `STD-12`). Restating upstream text is a defect. |
| P2 | Machine-readable spine | `state.json` per opportunity: tier, phase, gates, WP table, per-role read-sets. Read first, ~250 tokens, answers "where am I / what do I open". |
| P3 | Context budgets | Each role has a declared read-set and a token budget. A role may not open a file outside its set; it records a `CTX-GAP` and asks instead. |
| P4 | Ceremony proportional to risk | Three tiers — Quick / Standard / Deep — chosen by an explicit checklist and confirmed by the human. |
| P5 | Hard caps + appendices | Every template has a line cap (brief 50 quick / 100 otherwise; decisions 200; plan 120; card 120; review 100; close 80). Overflow moves to `_appendix/`, which is never auto-loaded. |
| P6 | Self-contained work-package cards | One file per WP holds the contract *and* the append-only log. The engineer never opens the architecture document. |
| P7 | Deltas, not regeneration | At close, only the *changed* project-context facts are written back. |
| P8 | Encode the process | Slash commands + role subagents. The lifecycle is executable, not remembered. |
| P9 | No empty scaffolding | Files are created when they have content. Directory structure is not a substitute for work. |
| P10 | Invariants are the highest-value tokens | The "known quirks" list is what actually prevents wrong code. It gets its own always-loaded file. |

---

## 4. The tier model

Tier is proposed by the agent from a checklist, confirmed by the human, recorded
in `state.json`. **Escalation mid-flight is allowed and logged; de-escalation is
not.**

| | **Quick** | **Standard** | **Deep** |
|---|---|---|---|
| Trigger | ≤2 files, reversible, no new module, no shared-contract change, no new dependency | new capability using existing patterns; ≤10 files; ≤1 shared contract touched | new subsystem, shared/behavioural contract change, irreversible or cross-cutting, security/data-model impact |
| Documents | `brief.md` only | `brief` + `decisions` + `plan` + WP cards | + design section + `review.md` |
| Human gates | release | scope, release | scope, design, release |
| Work packages | 1, inline in the brief | 3–7 cards | 5–12 cards |
| Independent review | self-check | reviewer on the diff | reviewer per WP + final |
| Budget target | ≤15 k tokens | ≤80 k tokens | ≤250 k tokens |

EO-001 is a **Deep** change (it modifies shared enemy/level contracts). Under
this framework its projected cost is ~120–180 k tokens against the ~500 k–1 M it
actually consumed — and a typical Standard feature drops by roughly an order of
magnitude.

---

## 5. Target structure

```
CLAUDE.md                        # thin router, <=120 lines — no architecture prose
.claude/
  commands/   eo ctx clarify design plan wp review gate ship close
  agents/     analyst architect engineer reviewer scribe
engineering/
  README.md                      # how to run the loop (human-facing, 1 page)
  standards.md                   # STD-xx, one line per rule
  project-context/
    index.md                     # ALWAYS loaded. Map + pointers. <=80 lines
    architecture.md              # <=200
    domain.md                    # <=120
    flows.md                     # <=150
    invariants.md                # INV-xx traps that mislead an agent. <=120
    debt.md                      # <=80
  opportunities/
    EO-001-slug/
      state.json                 # the spine
      brief.md                   # <=80   (replaces opportunity.md)
      decisions.md               # BD-xx + AD-xx registers <=200
      plan.md                    # WP table + sequence <=120
      approvals.md               # one signature table <=40  (replaces 4 files)
      wp/WP-01.md                # contract + append-only log <=120 each
      review.md                  # RV-xx findings <=100
      close.md                   # knowledge delta <=80
      evidence/                  # only real artifacts, created on demand
      _appendix/                 # overflow, never auto-loaded
  _framework/                    # the portable standard itself
```

### What each replacement collapses

| Old | New | Saving |
|---|---|---|
| `opportunity.md` (9 KB, 20 open questions restated later) | `brief.md` ≤100 lines | ~75 % |
| `project-context-review.md` (42 KB, per-opportunity) | permanent `project-context/*` + a ≤30-line delta in the brief | ~85 %, and it is reused by every future opportunity instead of rewritten |
| `business-understanding.md` (38 KB prose around 19 decisions) | `decisions.md` BD table + one paragraph per decided item | ~80 % |
| `architecture-design.md` (64 KB, incl. resolved-findings history) | AD register + change inventory; rejected alternatives and resolved findings → `_appendix/` | ~70 % |
| 4 approval files (14.5 KB) | `approvals.md` signature table + gate records in `state.json` | ~90 % |
| 4 files per WP (51 KB for WP-01) | one WP card ≤120 lines | ~92 % |
| 24 empty standards files | `standards.md`, one line per rule | n/a — they were empty |
| 65 empty evidence stubs | created on demand | n/a |

---

## 6. The vibe-coding loop (what you actually type)

```
/eo   Add ladder-climbing enemy        -> brief + tier proposal + state.json
/ctx                                   -> refresh project-context (once per repo, then on drift)
/clarify                               -> BD register, one question at a time
/gate scope                            -> you approve
/design                                -> AD register + change inventory   (Deep only)
/gate design                           -> you approve
/plan                                  -> WP cards
/wp 01 ... /wp 13                      -> each: ack -> implement -> self-check -> log
/review                                -> adversarial pass on the diff
/gate release                          -> you approve
/ship                                  -> branch, commit, push, PR
/close                                 -> knowledge delta into project-context
```

Quick tier is `/eo` → `/wp 01` → `/gate release` → `/ship`.

**Stop conditions (all tiers).** The agent halts and asks when: a gate is
unapproved, a WP would touch a file outside its `Touches` list, an invariant
(`INV-xx`) would change behaviour, an assumption cannot be verified from code, or
the WP card's read-set is insufficient (`CTX-GAP`).

---

## 7. Why this stays cheap over time

- `project-context/` is written **once per repo** and updated by delta. Today it
  is rewritten per opportunity (42 KB each time).
- Resolved findings and rejected alternatives are archived to `_appendix/`, so
  document weight does not grow monotonically.
- `state.json` makes resumption O(1): a new session reads ~250 tokens and knows
  the next action.
- Caps are enforced by the commands, so drift cannot creep back in silently.
