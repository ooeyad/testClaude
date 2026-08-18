# Tasks — 003 Late-Game Beast

**Tier:** deep · 11 tasks · design gate approved 2026-08-18 (FR-011 option A).
One task per commit (XII-2). Every task leaves the tree runnable.

Each task's contract lives in `implementation-details/task-details.md`, one
self-contained entry per task. It is not auto-loaded; the implementer opens its
own entry and nothing else.

## Phase 0 — Foundational

The two shared-contract changes. Nothing sets either property yet, so both land
with zero observable change to the game.

| # | Task | Files | Satisfies |
|---|---|---|---|
| T001 [P] | Armour multiplier in the damage funnel | `js/combat/hitbox.js` | FR-012, DD-002 |
| T002 [P] | `cfg.sight` and `cfg.lineWidth` on the shared machine | `js/entities/enemy.js` | FR-001, FR-010, DD-007 |

## Phase 1 — US-1: the final wave has a headliner (P1)

| # | Task | Files | Satisfies |
|---|---|---|---|
| T003 | The `Beast` subclass: armour window and stagger rule | `js/entities/beast.js` (new) | FR-005, FR-012, DD-001, DD-003 |
| T004 | The beast type definition and its sweep | `js/entities/enemies/beast.js` (new) | FR-001, FR-004, FR-006, FR-013 |
| T005 | Load both files in dependency order | `phefo/index.html` | INV-4, XI-3 |
| T006 | Re-author the final wave | `js/levels/level01_city.js` | FR-002, FR-003, FR-007, DD-010 |

**Checkpoint 1** — clear to the final wave in a browser. A beast twice anyone's
size arrives with five escorts; swinging at it mid-approach barely marks it;
swinging during its recovery takes a visible bite.

## Phase 2 — US-2: the fight changes as the beast weakens (P2)

| # | Task | Files | Satisfies |
|---|---|---|---|
| T007 | The wounded turn at half health | `js/entities/beast.js` | FR-008, FR-009, DD-004, DD-005 |

**Checkpoint 2** — take it to half health: it reels, changes colour, and comes
back with a shorter wind-up and a tighter window.

## Phase 3 — US-3: high ground is not a hiding place (P3)

| # | Task | Files | Satisfies |
|---|---|---|---|
| T008 | The ground slam, and choosing it by elevation | `js/entities/enemies/beast.js` | FR-010, DD-006, DD-008 |

**Checkpoint 3** — stand on the fire escape above it. It slams the road and the
blast reaches you; a knifeman in the same spot still ignores you.

## Phase 4 — Polish

| # | Task | Files | Satisfies |
|---|---|---|---|
| T009 [P] | Death emphasis | `js/entities/beast.js` | FR-014 |
| T010 | Tuning pass, played not reasoned about | `js/entities/enemies/beast.js` | SC-1…SC-6 |
| T011 [P] | Memory updates — INV-7 amended, the shared-`cfg` invariant, TD-006 | `.specify/memory/project-context/*` | IX, XII |

## Order

T001 and T002 are genuinely parallel — different files, neither reads the other.
T003 → T004 → T005 → T006 is strictly sequential: the data file names `P.Beast`
at define time, the script tags 404 without the files, and the wave throws on an
unknown type. T009 and T011 are parallel with everything after Checkpoint 3.

T010 ends at the release gate, not before: feel and difficulty are the Project
Owner's to judge by playing, and no headless check substitutes for that.

## Verification

Per Article X, every task records the literal command and its real output:
`node --check` in load order, plus the throwaway `vm` harness for QS-1…QS-6 in
`quickstart.md`. The harness is never committed (X-3).
