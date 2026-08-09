# Implementation Plan: Brute Enemy

**Spec:** `spec.md` · **Tier:** standard · **Date:** 2026-08-09
**Branch:** `feat/002-add-brute-enemy`

## Technical Context
| | |
|---|---|
| Language / version | ES5, browser, no transpiler (XI-2) |
| Dependencies | none |
| Storage | n/a |
| Testing | Article X — `node --check` in load order, plus a `vm` harness |
| Target platform | any modern browser |
| Project type | single |
| Performance goals | none beyond XI-4 |
| Constraints | no new weapon, no shared code changes, existing types frozen |

## Constitution Check — before Phase 0
| Gate | Article | Pass? | Evidence |
|---|---|---|---|
| Simplicity | IV | yes | One data file through the documented extension point |
| Anti-abstraction | V | yes | Nothing wrapped; the existing state machine is used as-is |
| Verification | VI | yes | Every FR maps to a harness check or a quickstart scenario |
| Context economy | IX | yes | Memory already carries the enemy and level facts |
| Technology | XI | yes | ES5, IIFE, data-registered type, existing weapon reused |

## Phase 0 — Research
Skipped. Nothing was genuinely unknown: the enemy extension point, the config keys
the shared machine reads, and the level's encounter data were all already recorded
in memory. Writing a `research.md` would have restated them.

## Phase 1 — Design

**Approach.** The brute is entirely data. The shared enemy machine already exposes
every behaviour the spec asks for as a config key — the identity mechanic (FR-001)
is `knockScale`, which scales incoming knockback and which nothing in the roster
pushes: the light type sits at 1.15, the heavy at 0.62. At 0.28 the brute keeps
walking through hits, which changes what the player must *do*, not merely how long
they must do it. No shared code is touched at all.

**Outputs produced:**
- [ ] `data-model.md` — not applicable; no new domain data, only a definition
- [ ] `contracts/` — not applicable
- [x] `quickstart.md`

### Design decisions
| ID | Decision | Choice | Forced by | Rejected |
|---|---|---|---|---|
| DD-001 | Where does the brute live? | One new definition file matching its four peers | FR-010, XI-7 | A subclass — nothing needs one |
| DD-002 | Is the shared machine modified? | No. Every behaviour the spec needs already exists as a config key. | FR-009 | Adding a "heavy" flag |
| DD-003 | How is "unstaggerable" expressed? | `knockScale: 0.28`, further than any existing type | FR-001 | New physics for mass |
| DD-004 | Single or multi-hit swing? | Single. A second hit would eat the recovery window FR-004 depends on. | FR-004 | A two-hit flurry |
| DD-005 | Weapon | Reuse the existing heavy melee weapon | out of scope | A new weapon row — pulls in shared rendering |
| DD-006 | Load order | Tag after the other type definitions: after the file defining the registry, before the level files that name types | INV-4 | Anywhere else |
| DD-007 | Rendering | None. Existing skeleton, larger scale, own colours. | FR-007 | A second skeleton |

**DD-002 is the point of the exercise.** If a new enemy required touching shared
code, the architecture's "adding content means adding data" claim would be false.
It does not.

### Change inventory
| File | Kind | What changes | Shared? | Refs |
|---|---|---|---|---|
| `phefo/js/entities/enemies/brute.js` | new | the definition — config block + `attack()` | no | DD-001 |
| `phefo/index.html` | additive | one `<script>` tag after the other definitions | no | DD-006 |
| `phefo/js/levels/level01_city.js` | data | one brute in wave 3, one in wave 5 | no | FR-008 |

**Totals:** 1 new, 1 additive, 1 data. **Shared-contract changes: 0.**
**Not modified:** `enemy.js`, `weapons.js`, `hitbox.js`, `physics.js`, `poses.js`,
`stickman.js`, `game.js`, and all four existing `enemies/*.js`.

### Invariant impact
| INV | Verdict | How proven |
|---|---|---|
| INV-2 fixed 120 Hz | preserved | All timings are seconds against `stateT`, advanced inside the fixed step |
| INV-4 load order | preserved | Tag after the registry's source, before the level files. A wrong slot throws at define time, so boot proves it |
| INV-7 120 px awareness gate | preserved | Untouched; the brute inherits it, which is why it is placed on the road |
| INV-9 / INV-10 damage semantics | preserved | The attack calls the shared melee helper; `hp` is never touched (XI-6) |
| INV-13 spawn clear of geometry | applies | Both placements verified clear of solids |
| INV-1, INV-5, INV-6, INV-12 | untouched | No physics, no world-array retention, no collision code |

## Constitution Check — after Phase 1
| Gate | Article | Pass? | Evidence |
|---|---|---|---|
| Simplicity | IV | yes | 3 files, zero shared changes |
| Anti-abstraction | V | yes | No wrapper, no parallel model |
| Verification | VI | yes | 12 harness assertions plus 7 quickstart scenarios |
| Context economy | IX | yes | All artifacts within cap; no research or data-model written |
| Technology | XI | yes | Verified against the consumer's key list (XI-11) |

## Complexity Tracking
| Article | Violation | Why necessary | Simpler alternative rejected because |
|---|---|---|---|
| — | none | | |

## Project Structure
```
phefo/
  index.html                      (+1 script tag)
  js/entities/enemies/brute.js    (new)
  js/levels/level01_city.js       (data: waves 3 and 5)
```

## Progress
- [x] Phase 0 explicitly skipped
- [x] Phase 1 complete
- [x] Constitution Check passed, no violations
- [x] Specification gate approved — 2026-08-09, Project Owner
