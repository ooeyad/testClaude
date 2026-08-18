# Tasks — 004 Distinct Enemy Silhouettes

**Tier:** deep · 11 tasks · design gate approved 2026-08-18.
One task per commit (XII-2). Every task leaves the tree runnable, and until a
character is given a build it draws exactly as it does today (DD-009).

Each task's contract lives in `implementation-details/task-details.md`, one
self-contained entry per task, not auto-loaded.

## Phase 0 — Foundational

The renderer learns to do this. Nothing on screen changes: no character has a
build yet, so all three land invisibly.

| # | Task | Files | Satisfies |
|---|---|---|---|
| T001 | Optional bone set, per-character head and datum, height normalisation | `js/render/stickman.js` | FR-001, FR-009, DD-001, DD-002, DD-003, DD-004 |
| T002 | The feature vocabulary and its two-pass drawing | `js/render/stickman.js` | FR-004, DD-005, DD-006 |
| T003 [P] | Idle unrest as an optional scalar | `js/render/poses.js` | FR-007, DD-007 |

## Phase 1 — US-1: nothing on the street looks like you (P1)

| # | Task | Files | Satisfies |
|---|---|---|---|
| T004 | Plumb build, features and unrest from a character into its drawing | `js/entities/enemy.js`, `js/entities/phefo.js` | FR-001, DD-008 |
| T005 | Phefo's own build — the reference everything is read against | `js/entities/phefo.js` | FR-002, FR-005 |
| T006 | Builds for the composed three: swordsman, gunman, archer | `js/entities/enemies/{swordsman,gunman,archer}.js` | FR-003 |

**Checkpoint 1** — stand next to any of the three. They differ in build, not just
colour, and with colour ignored you can still pick yourself out.

## Phase 2 — US-2: the dangerous ones are unsettling (P2)

| # | Task | Files | Satisfies |
|---|---|---|---|
| T007 | The heavies: brute and beast — squat, small-headed, horned, hunched | `js/entities/enemies/{brute,beast}.js` | FR-006, FR-007 |

**Checkpoint 2** — the beast enters the final wave. Its build alone should read as
threatening before it swings, and it should not look at rest while idle.

## Phase 3 — US-3: the weak ones are funny (P3)

| # | Task | Files | Satisfies |
|---|---|---|---|
| T008 | The feeble two: knifeman and climber — scrawny, twitchy, faintly absurd | `js/entities/enemies/{knifeman,climber}.js` | FR-008 |

**Checkpoint 3** — a knifeman and the beast idle side by side read as belonging to
different registers, with no explanation offered.

## Phase 4 — Polish

| # | Task | Files | Satisfies |
|---|---|---|---|
| T009 | Measure the cost with the full final wave on screen | none — measurement only | FR-012, DD-010 |
| T010 | Tuning pass, looked at rather than reasoned about | the eight build blocks | SC-1…SC-5 |
| T011 [P] | Memory updates | `.specify/memory/project-context/*` | IX |

## Order

T001 → T002 are sequential (same file, T002 needs the bone set). T003 is parallel
with both. T004 needs T001–T003; T005–T008 need T004 and are then parallel with
one another, though each is its own commit. T009 needs the full cast, so it comes
after T008. T011 is parallel with everything after T008.

T010 ends at the release gate. Whether a small head on a wide torso actually
reads as frightening is a thing only the Project Owner looking at it can settle.

## Verification

Per Article X, every task records the literal command and its real output:
`node --check` in load order, plus the `vm` harness for QS-1…QS-7 in
`quickstart.md`. This feature's harness stubs the canvas with a **recording**
proxy that counts path operations, because FR-012 is a measurement (DD-010).
The harness is never committed (X-3).

**QS-1 is the one that matters.** Every build drawn with and without, standing
height and both feet identical within a pixel. It is the check that keeps the
collision box, melee reach and the health bar exactly where they are, and it runs
on every task from T005 onward.
