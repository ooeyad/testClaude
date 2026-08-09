# EO-002 — Add "brute" enemy type

**Tier:** standard · **Phase:** brief · **Requested by:** Project Owner · **Date:** 2026-08-09

## Problem
Melee pressure in phefo has two shapes: the knifeman (fast, fragile, overlapping
wind-ups) and the swordsman (slow, guarded, punishes trading). Both are countered
the same way — stand your ground and time the opening. Nothing in the roster
forces the player to *disengage and reposition*, so a competent player fights the
whole level from one spot.

## Requested change
- A new melee enemy, `brute`, that pressures by being unstaggerable rather than
  by out-damaging the player.
- Built entirely as data through the documented extension point — a config block
  plus a small `attack()` registered with `P.Enemies.define`.
- Placed in the existing wave progression without removing anything.
- The four existing enemy types behave exactly as they do today.

## Value
- Adds a third melee counter-play (kite and punish) to a roster that currently
  has one.
- Proves the data-driven enemy extension point end to end, which is the claim
  `project-context/architecture.md` makes but nothing has exercised since the
  original four types.
- Cheap to tune and trivially revertible — one file plus two data edits.

## Scope
**In:** a `brute` definition file · its `<script>` tag · placement in
`level01_city` waves · headless validation.
**Out:** any change to `enemy.js` or the shared state machine · a new weapon row
(`weapons.js` / `Stick.drawWeapon` stay untouched) · new poses · rebalancing the
existing four types · new levels.

## Context delta
| # | Verified fact | Where |
|---|---|---|
| F-1 | An enemy type is pure data: `P.Enemies.define(cfg)` stores it, `P.Enemies.spawn` does `new P.Enemy(x, y, cfg)`. No subclass, no registry hook needed. | `js/entities/enemy.js` |
| F-2 | The config keys `Enemy` actually reads are: `type weapon hp speed aggro scale knockScale blocks telegraph attackDur recover hitAt shotTimes color warnColor attack` (+ `ranged preferred minRange` for ranged types). | `js/entities/enemy.js` |
| F-3 | `knockScale` scales incoming knockback; the swordsman already uses 0.62. Lower means it shrugs off hits. | `js/entities/enemy.js`, `enemies/swordsman.js` |
| F-4 | `runAttack` supports multi-hit via `cfg.shotTimes`; with only `hitAt` it fires once. | `js/entities/enemy.js` |
| F-5 | `blocks: true` is what makes the swordsman a wall; it is opt-in per type. | `enemies/swordsman.js` |
| F-6 | Waves are arrays of `{type, x}` in `level01_city.js`; wave 3 already mixes swordsman + knifeman + archer. | `js/levels/level01_city.js` |
| F-7 | `Stick.draw` takes `weapon: cfg.weapon`, so reusing `sword` needs no render change. | `js/entities/enemy.js` |

**Contradicts existing context:** no. Confirms `architecture.md` §Extension points.

## Constraints
- ES5, IIFE module, no tooling, no assets (STD-20…27).
- New file requires a `<script>` tag in the entities group, after
  `js/entities/enemy.js` and before `js/levels/*` (INV-4).
- No automated test framework exists; validation is `node --check` plus a
  throwaway `vm` harness (`architecture.md` §Verification).

## Success criteria
1. `Phefo.Enemies.registry.brute` exists after load and spawns without error.
2. A spawned brute chases the player, telegraphs, attacks, and recovers.
3. It survives noticeably longer than a swordsman under identical damage.
4. Knockback moves it markedly less than it moves a knifeman.
5. The four existing types are byte-identical in definition and unchanged in play.
6. `node --check` passes for every script in `index.html` load order; the game
   boots with no new console error.

## Risks
| ID | Risk | Mitigation |
|---|---|---|
| R-1 | Script tag placed wrongly → `P.Enemies` undefined at IIFE time (INV-4). | Tag goes immediately after the other `enemies/*.js`; verified by boot. |
| R-2 | The brute reads as a swordsman palette-swap. | Distinct counter-play is the acceptance bar, not distinct stats: no guard, near-immunity to stagger, longest recovery window in the game. |
| R-3 | Wave edits change the difficulty of existing waves. | Brute is added to later waves only; no existing entry is removed or moved (BD-004). |
| R-4 | Tuning cannot be judged headlessly. | WP-03 proves mechanics; the feel is signed off by the owner at the release gate. |

## Tier rationale
3 files touched · one new file · no shared contract changed · no existing
behaviour modified · reversible · no new dependency. → **standard** (2 of 7
checklist items, both local).

## Gates required
- [x] scope  - [ ] release
