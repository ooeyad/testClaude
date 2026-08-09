# Implementation Plan: Ladder-Climbing Enemy

**Spec:** `spec.md` · **Tier:** deep · **Date:** 2026-08-07
**Branch:** `feat/001-add-ladder-climbing-enemy` — merged in PR #9 · **Status:** T001–T012 shipped

## Technical Context
| | |
|---|---|
| Language / version | ES5, browser, no transpiler (XI-2) |
| Dependencies | none, and none may be added (XI-9) |
| Storage | n/a |
| Testing | Article X — `node --check` in load order, plus a throwaway `vm` harness |
| Target platform | any modern browser, `file://` or a static server |
| Project type | single |
| Performance goals | fixed 120 Hz logic must not regress (XI-4) |
| Constraints | no assets, no tooling, existing enemy behaviour frozen (FR-011) |

## Constitution Check — before Phase 0
| Gate | Article | Pass? | Evidence |
|---|---|---|---|
| Simplicity | IV | yes | One new entity type reusing the existing enemy state machine; no new subsystem beyond the climb machine itself |
| Anti-abstraction | V | yes | `Climber` extends `Enemy` and delegates; no parallel model |
| Verification | VI | yes | Article X harness plus a manual checklist (spec Clarifications) |
| Context economy | IX | yes | Memory already carries the enemy, physics and level facts |
| Technology | XI | yes | ES5, IIFE, data-registered type, no assets, no tooling |

## Phase 0 — Research
Resolved: there is no ladder in any form, no climb/jump/fall state on enemies, no
pathfinding of any kind, and a "level" is a flat array of rectangles with no floor
concept. One genuinely useful finding: physics already maintains `player.groundRef`,
which serves as an elevation reference without inventing a floor model.

## Phase 1 — Design

**Approach.** A `Climber` extends `Enemy` and owns climbing, elevation reasoning
and its own housekeeping while detached from the ground. `Enemy` remains the
authority for ground combat, death and rendering, and `Climber` delegates to it —
which is what keeps the two behaviourally identical once the climber has arrived.
Ladders are level data, never solids: `def.solids` is read every step by physics
for every entity and by projectiles, so a ladder in it would change collision for
the player and all four existing types.

**Outputs produced:**
- [x] `data-model.md` — the ladder entity and the climb state machine
- [ ] `contracts/` — not applicable; nothing external calls into this
- [x] `quickstart.md`

### Design decisions
| ID | Decision | Choice | Forced by | Rejected |
|---|---|---|---|---|
| DD-001 | Where does climbing live? | A `Climber` extending `Enemy`, delegating ground behaviour | FR-011 | A climb state inside the shared machine — would touch all four types |
| DD-002 | How is a custom constructor selected? | `Enemy.spawn` resolves `cfg.ctor \|\| P.Enemy`. **The only shared modification in the design.** | DD-001 | A registry or factory — more machinery, same result |
| DD-003 | How are ladders modelled? | Level data: a `ladder()` constructor, exposed as `World.ladders`, defaulting to `[]` | FR-010, INV-12 | A solid with a flag — would alter collision for every entity |
| DD-004 | How is elevation determined? | Read `player.groundRef`, already maintained by physics | FR-001 | A modelled floor/storey system — a whole subsystem for one question |
| DD-005 | Movement while attached? | Kinematic; detached from gravity and ground snapping for the duration | INV-1, INV-12 | Special-casing gravity per entity |
| DD-006 | Climb state machine | Owned entirely by `Climber`: approach → mount → climb → dismount | FR-005, FR-011 | Extending `Enemy`'s five states |
| DD-007 | Entry and exit safety | Explicit preconditions; a blocked exit aborts rather than strands | FR-006 | Retry loops, which produce visible dithering |
| DD-008 | Combat while attached | No combat code changes at all | FR-003, FR-004, XI-6 | An "is climbing" check inside the damage funnel |
| DD-009 | Inherited state while detached | An explicit housekeeping contract for the `Enemy` fields the climber stops updating | FR-005 | Hoping the defaults hold — they do not |
| DD-010 | Rendering | A `climb(phase)` pose: a new table key unreachable by existing types | FR-009 | A second skeleton |

### Change inventory
| File | Kind | What changes | Shared? | Refs |
|---|---|---|---|---|
| `phefo/js/entities/climber.js` | new | climb machine, elevation model, kinematics, entry/exit, housekeeping | no | DD-001 |
| `phefo/js/entities/enemies/climber.js` | new | the type definition — data only | no | DD-001 |
| `phefo/js/entities/enemy.js` | modify | `spawn` resolves `cfg.ctor \|\| P.Enemy` | **yes — gate** | DD-002 |
| `phefo/js/levels/level.js` | additive | `ladder()` constructor, `drawLadders()` | no | DD-003 |
| `phefo/js/render/poses.js` | additive | `climb(phase)` pose | no | DD-010 |
| `phefo/js/core/game.js` | additive | `World.ladders = def.ladders \|\| []`, one draw call | no | DD-003 |
| `phefo/js/levels/level01_city.js` | data | ladder placement, wave composition | no | US-3 |
| `phefo/index.html` | additive | 2 `<script>` tags, order mandated | no | INV-4 |

**Totals:** 2 new, 4 additive, 1 data, 1 modify. **Shared-contract changes: 1** (DD-002).
**Not modified:** `physics.js`, `hitbox.js`, `weapons.js`, `input.js`, `camera.js`,
`stickman.js`, `fx.js`, `entity.js`, `phefo.js`, `projectile.js`, `pickup.js`, and
all four existing `entities/enemies/*.js`.

**Load order (INV-4):** `entities/climber.js` after `entities/enemy.js` (extends
`P.Enemy` at IIFE time); `entities/enemies/climber.js` after `entities/climber.js`
(its `cfg.ctor` reads `P.Climber` at definition time).

### Invariant impact
| INV | Verdict | How proven |
|---|---|---|
| INV-1 centre/feet coords | preserved | Kinematic movement writes the same convention; AABB unchanged |
| INV-2 fixed 120 Hz | preserved | Climb speed is px per fixed step, never frame-scaled |
| INV-4 load order | preserved | Two tags in mandated slots; `game.js` stays last |
| INV-7 120 px awareness gate | **changed, for the climber only** | The climber uses its own elevation model (DD-004). `Enemy.update`'s gate is untouched — that is the proof the four types keep the old behaviour |
| INV-9 / INV-10 damage semantics | preserved | No combat code changes (DD-008) |
| INV-12 one collision model | preserved | Ladders are not solids (DD-003); the climber detaches rather than special-casing physics |
| INV-13 spawn clear of geometry | applies | Ladder placement must not put a mount point inside a solid |

## Constitution Check — after Phase 1
| Gate | Article | Pass? | Evidence |
|---|---|---|---|
| Simplicity | IV | yes | 8 files, one shared modification, no new subsystem beyond the climb machine |
| Anti-abstraction | V | yes | `Climber` has one caller path and delegates rather than wrapping |
| Verification | VI | yes | Every FR maps to a quickstart scenario or a harness check |
| Context economy | IX | yes | All artifacts within cap |
| Technology | XI | yes | No tooling, no assets, no dependency |

## Complexity Tracking
| Article | Violation | Why necessary | Simpler alternative rejected because |
|---|---|---|---|
| — | none | | |

DD-002 modifies shared code but is not a violation: it is additive in effect —
inert for every definition that supplies no `ctor`, which is all four existing types.

## Project Structure
```
phefo/
  index.html                       (+2 script tags)
  js/entities/climber.js           (new)
  js/entities/enemies/climber.js   (new)
  js/entities/enemy.js             (spawn only)
  js/levels/level.js               (+ladder, +drawLadders)
  js/levels/level01_city.js        (data)
  js/core/game.js                  (+World.ladders, +draw call)
  js/render/poses.js               (+climb pose)
```

## Progress
- [x] Phase 0 complete
- [x] Phase 1 complete
- [x] Constitution Check passed, no violations
- [x] Design gate approved — 2026-08-07, Project Owner
