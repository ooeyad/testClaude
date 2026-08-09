# EO-002 — Plan

**Strategy.** The definition and its `<script>` tag ship together, because a
registered type nobody loads is dead code and an unregistered tag throws. That
one package leaves the game running with a brute that exists but never spawns —
fully playable, zero behavioural change. Placement comes second, so any tuning
argument is about a type that already demonstrably works. Validation comes last
and is headless; feel is the owner's call at the release gate.

## Work packages

| WP | Title | Touches | Deps | Refs | Status |
|---|---|---|---|---|---|
| WP-01 | Brute definition and load order | `js/entities/enemies/brute.js` (new), `index.html` | — | AD-001, AD-005, INV-4 | todo |
| WP-02 | Wave placement in `level01_city` | `js/levels/level01_city.js` | WP-01 | BD-004, BD-005, INV-7 | todo |
| WP-03 | Headless validation and evidence | none (throwaway harness outside the repo) | WP-02 | BD-007, INV-10, INV-11 | todo |

## Sequence and parallelism
Strictly sequential. WP-02 names a type that must already be registered; WP-03
measures behaviour that must already be placed. Nothing runs in parallel — the
opportunity is too small for it to pay.

## Shared-file modification map
| File | WP | Region | Rule |
|---|---|---|---|
| `phefo/index.html` | 01 | one `<script>` line after `enemies/archer.js` | no other line touched; `core/game.js` stays last |
| `phefo/js/levels/level01_city.js` | 02 | `waves` array only | `solids`, `pickups`, `bounds` and `decor` are off limits |

## Validation gates
**Universal — every package:**
- U-1 `node --check` passes for every script in `index.html` load order.
- U-2 The page loads and `Phefo.Game.boot()` completes with no thrown error.
- U-3 `git diff --stat` shows only the files in that package's `Touches`.
- U-4 The four existing enemy definitions and `enemy.js` are untouched (C-1, C-2).

**Per-package:** stated in each card's *Done when*.

## Rollback
Each package is one revertible commit. WP-01 alone is inert — a registered type
that no wave references never spawns. WP-02 alone is the only package that
changes what a player experiences, so reverting it restores the shipped game
exactly. Full abort: delete `brute.js`, drop the `<script>` line, drop two wave
entries.

## Definition of done
1. All three packages `done`, each card's log carrying a Review verdict of `pass`.
2. U-1…U-4 green on the final tree.
3. All six success criteria in `brief.md` demonstrated, with the numbers recorded.
4. No open `RV` finding of severity high.
5. Release gate packet prepared for the owner (feel is theirs to judge, R-4).

## Evidence required
`node --check` output across the full load order · harness transcript showing the
brute registering, spawning, chasing, telegraphing, attacking and recovering ·
survivability and knockback comparisons against the swordsman and knifeman ·
`git diff --stat` proving C-2.
