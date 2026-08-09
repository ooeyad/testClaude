# EO-001 — Plan

**Strategy.** Data model before anything that consumes it; make ladders visible
before anything walks on them; build the climber inert, then give it behaviour
one capability at a time; place it in the level last; tune last of all. Every
package leaves the game runnable and playable — a half-built climber is simply
an enemy that never mounts (STD-10).

## Work packages

| WP | Title | Touches | Deps | Refs | Status |
|---|---|---|---|---|---|
| WP-01 | Ladder domain model | `levels/level.js` | — | AD-003 | done |
| WP-02 | Ladder rendering | `levels/level.js` | 01 | AD-003 | todo |
| WP-03 | Ladder placement in `level01_city` | `levels/level01_city.js` | 02 | BD-009 | todo |
| WP-04 | ASM-001 constructor hook | `entities/enemy.js` | — | AD-002 | todo |
| WP-05 | World ladder exposure | `core/game.js` | 01 | AD-003 | todo |
| WP-06 | Climber skeleton, registration, load order | `entities/climber.js`, `entities/enemies/climber.js`, `index.html` | 04 | AD-001, INV-4 | todo |
| WP-07 | Elevation model | `entities/climber.js` | 06 | AD-004 | todo |
| WP-08 | Ladder selection and APPROACH | `entities/climber.js` | 05, 07 | AD-006, BD-004 | todo |
| WP-09 | Ascent: CLIMB, exit contract, housekeeping | `entities/climber.js` | 08 | AD-005, AD-007, AD-009 | todo |
| WP-10 | Climb pose | `render/poses.js`, `entities/climber.js` | 09 | AD-010 | todo |
| WP-11 | Descent | `entities/climber.js` | 09 | BD-007 | todo |
| WP-12 | Wave placement | `levels/level01_city.js` | 11 | BD-012, BD-019 | todo |
| WP-13 | Tuning, checklist and evidence | `entities/enemies/climber.js` | 12 | BD-011, BD-015 | todo |

## Sequence and parallelism
Two independent chains meet at WP-06: the **ladder chain** (01 → 02 → 03, plus 05)
and the **spawn chain** (04). After WP-06 the climber chain is strictly ordered
(07 → 08 → 09 → 11), with WP-10 able to run alongside WP-11. WP-12 and WP-13 are
gameplay content and must come last, because tuning before the behaviour is
complete tunes the wrong thing.

## Shared-file modification map
| File | WP | Region | Rule |
|---|---|---|---|
| `levels/level.js` | 01 | new `ladder()` | WP-02 must not touch it |
| `levels/level.js` | 02 | new `drawLadders()` | WP-01 must not pre-empt it |
| `levels/level01_city.js` | 03 | `ladders:` array | geometry only |
| `levels/level01_city.js` | 12 | `waves` | composition only; must not touch `ladders` |
| `entities/climber.js` | 06–11 | one capability per package, appended | never revise an earlier package's function without a `DEV` |

## Validation gates
**Universal — every package:**
- U-1 `node --check` passes for every script in `index.html` load order.
- U-2 The game boots with no new console error.
- U-3 The four existing enemy types behave identically (BCR, `decisions.md` §E).
- U-4 No file outside the package's `Touches` list appears in `git diff --stat`.

**Per-package:** stated in each card's *Done when*.

## Rollback
Every package is a single revertible commit. WP-01…05 are additive and inert
until WP-06 lands, so the whole ladder chain can ship without the climber
existing. WP-04 (ASM-001) is inert while no definition supplies `ctor`. Full
abort = revert the branch; nothing outside `phefo/` is touched.

## Definition of done
1. Every WP `done`, each card's log carrying a Review section with verdict `pass`.
2. U-1…U-4 green on the final tree.
3. All six success criteria in `brief.md` demonstrated and recorded.
4. No open `RV` finding of severity high.
5. `close.md` written and the project-context delta applied.

## Evidence required
The manual checklist from BD-015, played and recorded · `node --check` output ·
a before/after comparison of the existing waves with no climber present (U-3).
