# EO-001 — Add Ladder-Climbing Enemy

**Tier:** deep · **Phase:** plan · **Requested by:** Project Owner · **Date:** 2026-08-06

## Problem
Every platform in `level01_city` sits 128–196 px above the road, and enemies only
acquire a target within 120 px of vertical separation (INV-7). Standing on any
platform therefore makes the player invisible to all four enemy types. Elevated
ground is a safe zone, and enemy movement has no vertical dimension at all.

## Requested change
- A new enemy type that reaches the player on an upper platform by climbing a ladder.
- Ladders become a placeable level feature.
- The climber approaches, mounts, climbs, dismounts and resumes normal combat.
- Existing enemies keep behaving exactly as they do today.

## Value
- Removes the safe-zone exploit without nerfing anything.
- Adds vertical movement as a reusable capability for future enemy types.
- Raises perceived enemy intelligence, which is the stated success measure (BD-003).

## Scope
**In:** ladder data model and rendering · a `climber` enemy type · ascent and
descent · entry/exit safety · placement in `level01_city` · a manual validation
checklist.
**Out:** player ladder use (BD-002) · general pathfinding · changes to the four
existing enemy types (BD-001) · new weapons · redesign of the level system.

## Context delta
| # | Verified fact | Where |
|---|---|---|
| F-1 | No ladder exists in any form — not as entity, solid, or level data. | repo-wide |
| F-2 | Vertical movement is jumping only; there is no climb, jump or fall state on enemies. | `js/entities/enemy.js` |
| F-3 | There is no navigation or pathfinding of any kind. | repo-wide |
| F-4 | A "level" is a flat array of rectangles; there is no floor or storey concept. | `js/levels/level.js` |
| F-5 | Physics already maintains `player.groundRef` — usable as an elevation reference. | `js/core/physics.js` |
| F-6 | No tests, runner, linter or CI exist. | repo-wide |

**Contradicts existing context:** no. Confirms INV-7 and TD-001.

## Constraints
- ES5, IIFE modules, no tooling, no assets (STD-20…27).
- Existing enemy behaviour must be provably unchanged (BD-001).
- Validation is manual; there is no test framework to lean on (BD-015, F-6).

## Success criteria
1. The climber locates a nearby ladder, mounts, ascends and dismounts without sticking.
2. It resumes normal chase/attack behaviour on the upper platform.
3. It descends when the player returns to the ground.
4. It takes damage normally throughout the climb and falls on death.
5. The four existing enemy types behave identically to before, demonstrably.
6. No new console errors; every script passes `node --check` in load order.

## Risks
| ID | Risk | Mitigation |
|---|---|---|
| R-1 | Climbing conflicts with gravity and ground snapping (INV-1). | Kinematic movement while attached; physics untouched. |
| R-2 | The shared `Enemy.spawn` change leaks into the four existing types. | Single `cfg.ctor \|\| P.Enemy` fallback; inertness proof required (AD-002). |
| R-3 | The enemy strands itself at a blocked ladder top. | Explicit entry/exit safety rules (AD-007). |
| R-4 | Inherited runtime state goes stale while detached from the ground. | Housekeeping contract (AD-009). |

## Tier rationale
Shared contract changed (`Enemy.spawn`) · new subsystem (climb state machine) ·
behaviour of an existing shared class extended · 8 files touched. → **deep**.

## Gates required
- [x] scope  - [x] design  - [ ] release
