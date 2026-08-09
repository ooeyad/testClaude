# Tasks: Ladder-Climbing Enemy

**Plan:** `plan.md` · **Tier:** deep
**Total:** 13 tasks · **Parallelizable:** 4 · **Status:** T001–T012 shipped (PR #9); T013 outstanding

## Phase 1 — Setup
None. No project init, no dependency, no scaffolding (XI-9).

## Phase 2 — Foundational
<!-- Blocks every story: the ladder must exist as data before anything reads it,
     and the spawn hook must exist before a Climber can be registered. -->
- [x] T001 [P] Ladder domain model — `js/levels/level.js` — `node --check`; `Levels.ladder(x,top,bottom)` returns the literal
- [x] T002 [P] Spawn resolves `cfg.ctor || P.Enemy` — `js/entities/enemy.js` — harness: all four types still construct `P.Enemy`
- [x] T003 World exposes `ladders`, defaulting to `[]` — `js/core/game.js` — harness: `world.ladders` is `[]` on a level with none

## Phase 3 — US-1 Elevated ground stops being safe (P1)
- [x] T004 [P] Ladder rendering — `js/levels/level.js` — a level with a ladder draws it; one with none draws nothing
- [x] T005 [P] Ladder placement in the shipped level — `js/levels/level01_city.js` — mount and exit both clear of solids (INV-13)
- [x] T006 Climber skeleton, registration and load order — `js/entities/climber.js`, `js/entities/enemies/climber.js`, `index.html` — `node --check` in load order; `registry.climber` exists
- [x] T007 Elevation model — `js/entities/climber.js` — harness: reports "target is higher" only when it is
- [x] T008 Ladder selection and approach — `js/entities/climber.js` — harness: walks to a near ladder, ignores a far one (FR-002)
- [x] T009 Ascent, exit contract and housekeeping — `js/entities/climber.js` — harness: arrives on the upper surface, never stuck (FR-005, FR-006)
- [x] T010 Climb pose — `js/render/poses.js`, `js/entities/climber.js` — renders without error; existing poses untouched

**Checkpoint:** place a climber below a platform, stand on it — it arrives and fights.

## Phase 4 — US-2 The climber comes back down (P2)
- [x] T011 Descent — `js/entities/climber.js` — harness: descends when the target drops (FR-007); a started traversal completes (FR-008)

**Checkpoint:** drop to the road — it follows you down.

## Phase 5 — US-3 Routes are legible (P3)
- [x] T012 Wave placement — `js/levels/level01_city.js` — alone in a mid wave, then under pressure

**Checkpoint:** play the level; the ladder reads as a ladder before anything uses it.

## Phase 6 — Polish
- [ ] T013 Tuning, manual checklist and evidence — `js/entities/enemies/climber.js` — the checklist played and recorded

## Task detail

### T002 — Spawn resolves `cfg.ctor || P.Enemy`
**Goal.** Let a definition supply its own constructor, changing nothing for a
definition that does not.
**Done when.** `Enemy.spawn` constructs `cfg.ctor` when present and `P.Enemy`
otherwise · the four existing types still construct `P.Enemy` · `node --check`
passes in load order · `git diff` (CR-normalised, XII-4) shows one file.
**Touches.** `phefo/js/entities/enemy.js` — **only** the `spawn` function.
**Forbidden.** The state machine, `update`, `walk`, `separate`, `runAttack`,
`pose`, `draw`, and the 120 px targeting gate — this task changes construction
and nothing else. Every other file, especially `entities/climber.js` (T006).
**Must not change.** Behaviour of the four existing types — proven structurally:
none defines `ctor`, so only the fallback branch is ever taken.
**Notes.**
- This is the **only** approved shared modification in the design (DD-002).
  Everything else is a new file, a new key or new data. A second one returns the
  feature to the design gate.
- Plain `cfg.ctor || P.Enemy`. No registry, no factory, no type switch — the value
  of DD-002 is that it is inert and readable in one line.
- Reference `P.Enemy` at call time, not IIFE time, so no load-order constraint is
  added (INV-4).
- The rest of `spawn` must operate on the instance exactly as before.

### T009 — Ascent, exit contract and housekeeping
**Goal.** The climber travels the ladder and arrives able to fight.
**Done when.** It reaches the upper surface and resumes ordinary behaviour ·
a blocked exit aborts rather than strands (FR-006) · it is damageable throughout
and falls when killed (FR-004) · it never attacks while attached (FR-003).
**Touches.** `phefo/js/entities/climber.js` only.
**Forbidden.** `physics.js` and `hitbox.js` — the climber detaches from physics
rather than physics learning about ladders (DD-005, DD-008). `poses.js` is T010.
**Must not change.** INV-1's coordinate convention; INV-12's single collision model.
**Notes.**
- While detached the climber stops going through the ground path, so the `Enemy`
  fields it no longer updates go stale — facing, timers, target state. DD-009's
  housekeeping contract exists because this was discovered, not predicted.
- Speed is px per fixed step. Anything frame-scaled violates XI-4 and INV-2.
- Arrival must clamp feet to the surface `top`, not merely stop vertical motion.

## Shipped commits
| Task | Commit | Task | Commit |
|---|---|---|---|
| T001 | `f46acd2` | T007 | `5d8833e` |
| T002 | `781547a` | T008 / T009 | `e71d964` |
| T003 | `fc0a152` | T010 / T011 | `0f31eda` |
| T004 | `fa80174` | T012 | `b5eeb58` |
| T005 | `450a4fe` | T013 | **not done** |
| T006 | `7d45538` | | |

T013 (tuning, manual checklist and evidence) has no commit. The quickstart
scenarios are therefore unplayed on record — that is the outstanding work, and
the reason this feature's release gate is still open.

## Dependencies
```
T001 ─┐
T002 ─┼→ T006 → T007 → T008 → T009 → T011
T003 ─┘                         └→ T010
T004 → T005 → T012 → T013
```

## Parallel execution
T001, T002 and T003 touch three different files with no dependency and may run
together. T004 and T005 may run together with them. Everything from T006 onward
is a single chain through `climber.js` and must be sequential — one capability
per task, appended, never revising an earlier task's function without recording
a deviation.
