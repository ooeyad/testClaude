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
| INV-11 | ~~`Input.CONFIRM` includes `Space`.~~ **RETIRED 2026-08-09** — `CONFIRM` is `['Enter']` only since commit `87de5bf`. Kept so existing citations resolve; do not re-add the trap. | `js/core/input.js:136` | none any more. A harness may safely simulate a jump. |
| INV-12 | Solids are plain world-space rects `{x, y, w, h, oneWay?}`. There is no level-specific collision code anywhere. | `js/core/physics.js`, `js/levels/level.js` | Adding per-level collision breaks the one-collision-model property that makes levels pure data. |
| INV-13 | An entity spawned overlapping a solid can never walk out of it. `moveAndCollide` sets `hitWall`, and `Enemy.walk` refuses to move into a wall — so the enemy sits in `chase` forever with `vx` damped to zero. | `js/core/physics.js`, `js/entities/enemy.js` | Reads exactly like an AI bug. Bites twice: a wave entry placed inside geometry (the crates at x 430–534, the block at 980–1108) ships an inert enemy, and a test harness spawning at a "round number" x debugs a problem that does not exist. |
| INV-14 | Every `.js` file in the repo is CRLF; `index.html` is LF. | `file phefo/js/**` | Any tool that does not normalise line endings reports all 21 `phefo` files as wholly rewritten. `git diff --stat` is then useless as a scope check — use `git diff --ignore-cr-at-eol` and `diff --strip-trailing-cr` against `HEAD` instead. A new `.js` file written with LF will show as a whole-file change forever. |

| INV-15 | A remote file bridge onto this repo cannot unlink files. Any git command that refreshes or writes the index leaves `.git/index.lock` behind, and the next git command dies with "Another git process seems to be running". | observed 2026-08-09: `git status --porcelain` over the bridge left a 0-byte lock with no operation in progress | Reads as a crashed editor or a second git process, so the time goes into hunting one that does not exist. Fix: delete `.git/index.lock` from the host. Prevention: XII-7. |
| INV-16 | `groundRef` is the surface an entity **last stood on**. Physics sets it on every landing, for solids and one-way platforms alike, and never clears it — so an airborne entity still carries the plane it came from. | `js/core/physics.js:85` | Using raw `y` for elevation makes a jump read as a change of level, and a climber would start up a ladder every time the player hopped on the spot. It also flips the instant you clip a platform corner, which is why `Climber` debounces it for `PLANE_DWELL` (0.20 s) before believing it. |
| INV-17 | While attached to a ladder the climber runs **no physics at all** — `moveAndCollide` is not called. | `js/entities/climber.js` `updateClimb` | Zeroing gravity is not enough: collision resolution would still snap the climber onto the first one-way platform whose plane the ladder crosses, and those are exactly the surfaces a ladder must pass through. |
| INV-18 | On dismount, `y` must be clamped to the destination surface **before** `moveAndCollide` runs. | `js/entities/climber.js` `updateClimb` | `moveAndCollide` captures `wasBottom` on entry and uses it in the one-way guard. Resuming physics first leaves `wasBottom` mid-ladder, the platform refuses the landing, and the climber drops straight back down. |
| INV-19 | A subclass that bypasses `Enemy.prototype.update` must call `tickCommon(dt)` itself — exactly once per step, before dispatching its own modes. | `js/entities/climber.js` `update` | Miss it and every status timer silently freezes: i-frames, stagger, flash, block stun. Call it twice (once per mode branch) and a step that crosses two modes ticks them double. |
| INV-20 | Ladders are **never** solids and never go in `def.solids`. They live in `def.ladders`, exposed as `world.ladders`. | `js/levels/level.js`, `js/core/game.js:28` | `def.solids` is read every step by physics for every entity and by every projectile. A ladder in it changes collision for the player and all five other enemy types. |
| INV-21 | A ladder is only selected when **both** ends sit within `Climber.LEVEL_TOL` (24 px) of the planes they claim to join. | `js/entities/climber.js` `pickLadder` | Nothing validates this at authoring time. A ladder whose top lands somewhere other than where the player stands is silently invisible to the AI — the climber simply never uses it, which reads as a broken AI rather than mis-authored level data. |

## The `world` contract

A single `World` object is passed to every `update(dt, world)` and most draw
calls. Anything living in a level must fit this surface:

`solids` · `player` · `enemies` · `projectiles` · `pickups` · `camera` ·
`bounds` · `groundY` · `hitstop` · `spawnProjectile()` · `allCharacters()` ·
`aliveEnemies()` · `onEnemyKilled()` · `notify()`

Extending it is a shared-contract change: it requires a `DD` decision and the
design gate.
