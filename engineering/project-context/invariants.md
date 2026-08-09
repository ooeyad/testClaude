<!-- CAP 120 lines. Highest value-per-token file in the repo.
     An INV is a fact that (a) is not obvious from reading the code, and
     (b) will cause an agent to write wrong code if it does not know it.
     Every entry must be verified, with the code location that proves it. -->
# Invariants and Traps — phefo

| ID | Invariant | Proof | Consequence if ignored |
|---|---|---|---|
| INV-1 | Entity position is `(x = horizontal centre, y = feet)`. The AABB is `[x-w/2, y-h]` → `[x+w/2, y]`. | `js/core/physics.js`, `js/render/stickman.js` | Ground snapping, shadows, camera targeting and the stick figure all break at once. |
| INV-2 | Logic runs at a fixed 120 Hz accumulator; rendering is decoupled. Melee windows are as short as 90 ms. | `js/core/game.js` | Anything gameplay-related scaled off frame time silently changes combat feel and breaks at other refresh rates. |
| INV-3 | `Input.endStep()` clears edge-triggered state once per logic step, so **all** input polling must happen inside the fixed step. | `js/core/input.js`, `Game.step` | A press read from render code is missed or double-counted. |
| INV-4 | The `<script>` order in `phefo/index.html` is the dependency graph. Files capture dependencies into locals at IIFE-execution time (`var U = P.util;`). `js/core/game.js` must stay last — it calls `Game.boot()` at parse time. | `phefo/index.html` | A file placed before its dependency captures `undefined` and fails later with a confusing error, not at load. |
| INV-5 | `world.hitstop` freezes the whole world for a few frames on a connecting hit; `World.step` returns early while non-zero. | `js/core/game.js` | New per-step logic placed after the early return silently never runs during hitstop. |
| INV-6 | `world.allCharacters()` returns a scratch array rebuilt once per step. | `js/core/game.js` | Retaining it across steps yields stale entities. |
| INV-7 | **Enemies never engage across a height gap.** `Enemy.update` requires `Math.abs(player.y - this.y) < 120` to acquire a target. | `js/entities/enemy.js` | An enemy on a platform stands inert. Every platform in `level01_city` sits 128–196 px above the road, so standing on any platform currently hides the player from all four enemy types. |
| INV-8 | `level01_city.bounds.maxY` is tuned, not arbitrary: it keeps the camera's vertical clamp active while the player stands on the road, aligning the road with the backdrop skyline at `viewH * 0.80`. | `js/levels/level01_city.js` | Changing it decouples the playfield from the horizon. |
| INV-9 | `Combat.applyDamage` returning `false` means "not a clean hit" — **not** "no damage". Blocked hits still deal chip damage via `Combat.kill`; callers use the return value only to pick spark vs blood FX. | `js/combat/hitbox.js` | Guard logic built on the return value silently makes blocks invincible or double-applies damage. |
| INV-10 | `applyDamage` refuses hits when `target.invuln > 0` or the target blocks frontally. Deterministic scripted kills in a test harness need `invuln = 0`, `blocking = false`, `dirX = target.facing`. | `js/combat/hitbox.js` | Test harnesses appear to prove behaviour that never executed. |
| INV-11 | `Input.CONFIRM` includes `Space`. | `js/core/input.js` | In a harness, a simulated jump restarts the run from a victory/game-over screen. |
| INV-12 | Solids are plain world-space rects `{x, y, w, h, oneWay?}`. There is no level-specific collision code anywhere. | `js/core/physics.js`, `js/levels/level.js` | Adding per-level collision breaks the one-collision-model property that makes levels pure data. |
| INV-13 | An entity spawned overlapping a solid can never walk out of it. `moveAndCollide` sets `hitWall`, and `Enemy.walk` refuses to move into a wall — so the enemy sits in `chase` forever with `vx` damped to zero. | `js/core/physics.js`, `js/entities/enemy.js` | Reads exactly like an AI bug. Bites twice: a wave entry placed inside geometry (the crates at x 430–534, the block at 980–1108) ships an inert enemy, and a test harness spawning at a "round number" x debugs a problem that does not exist. |
| INV-14 | Every `.js` file in the repo is CRLF; `index.html` is LF. | `file phefo/js/**` | Any tool that does not normalise line endings reports all 21 `phefo` files as wholly rewritten. `git diff --stat` is then useless as a scope check — use `git diff --ignore-cr-at-eol` and `diff --strip-trailing-cr` against `HEAD` instead. A new `.js` file written with LF will show as a whole-file change forever. |

## The `world` contract

A single `World` object is passed to every `update(dt, world)` and most draw
calls. Anything living in a level must fit this surface:

`solids` · `player` · `enemies` · `projectiles` · `pickups` · `camera` ·
`bounds` · `groundY` · `hitstop` · `spawnProjectile()` · `allCharacters()` ·
`aliveEnemies()` · `onEnemyKilled()` · `notify()`

Extending it is a shared-contract change: it requires an `AD` decision and the
design gate.
