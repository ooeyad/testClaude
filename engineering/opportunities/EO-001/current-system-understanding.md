# EO-001 — Current System Understanding

**Opportunity:** EO-001 — Add Ladder-Climbing Enemy
**Conversation:** CONV-001 — Discovery Conversation
**Instruction:** INST-001 — Analyze Existing System
**Role:** ROLE-002 — Solution Architect
**Date:** 2026-08-06
**Repository state analysed:** `main` @ `dcaebbe`
**Status:** Discovery complete — no architecture or implementation proposed

> **Method note.** Every claim below marked *Verified* was read directly from the
> files cited at the line numbers given, in the working tree at commit `dcaebbe`.
> Claims that could not be established from source are stated as *Assumption* or
> raised in §16–§18. No source file was modified during this analysis.

---

## 0. Correction to the Opportunity's stated paths

**Verified.** The paths named in `opportunity.md` §Current Situation and
§Known Dependencies do not exist at those locations. The real paths are:

| Stated in opportunity.md | Actual path |
|---|---|
| `js/combat` | `phefo/js/combat` |
| `js/core` | `phefo/js/core` |
| `js/entities` | `phefo/js/entities` |
| `js/render` | `phefo/js/render` |
| `index.html` | `phefo/index.html` |
| `style.css` | `phefo/css/style.css` |

The game lives entirely under `phefo/`. All paths in this report are given
relative to the repository root. Two further modules exist that the Opportunity
does not mention and which are directly relevant: **`phefo/js/levels/`** (level
and platform data — the single most relevant module for this change) and
**`phefo/js/ui/`**.

---

## 1. Project Structure Summary

**Verified.** The repository contains one application and one documentation tree.

```
phefo/
├── index.html                  25 classic <script> tags, no modules, no bundler
├── css/style.css               41 lines, page layout only
└── js/
    ├── core/    util, input, audio, physics, camera, game
    ├── render/  poses, stickman, fx, backdrop
    ├── combat/  weapons, hitbox
    ├── entities/ entity, projectile, pickup, phefo, enemy
    │   └── enemies/ knifeman, swordsman, gunman, archer
    ├── levels/  level, level01_city
    └── ui/      hud, menus
engineering/opportunities/EO-001/   this discovery tree
CLAUDE.md
```

**Verified — architectural conventions:**

- Every file is an IIFE hanging exports off a single global namespace:
  `window.Phefo = window.Phefo || {}; (function (P) { 'use strict'; … })(window.Phefo);`
- ES5 throughout — `var`, `Object.create` prototype chains, no classes, no
  arrow functions, no `import`/`export`, no `fetch`.
- **Script order in `phefo/index.html` is the dependency graph and is
  load-bearing.** Files capture dependencies into locals at IIFE-execution time
  (e.g. `var U = P.util;` at `phefo/js/entities/enemy.js:6`,
  `P.Projectile.KINDS.arrow.grav` at `phefo/js/entities/enemies/archer.js:7`).
  A `<script>` tag placed before its dependency captures `undefined` and fails
  later with a misleading error rather than at load time.
- **No build step, no bundler, no transpilation, no package manager.** The `.js`
  files on disk are exactly what the browser executes.
- **No sprite or audio assets exist.** All art is drawn procedurally to canvas;
  all sound is synthesised at runtime via WebAudio (`phefo/js/core/audio.js`).

**Verified — `phefo/css/style.css` contains no game visuals.** Its only rules
are `*`/`html, body`/`#stage`/`#screen`/`noscript` (lines 1, 3, 10, 18, 25, 34) —
box-sizing, centring, a 16:9 stage, and canvas sizing. Contrary to
`opportunity.md` §Known Dependencies ("Ladder and enemy presentation in
`style.css`"), **no enemy, ladder, or entity presentation can be expressed in
CSS**; everything visible in the playfield is canvas drawing code.

**Verified — the DOM surface is a single canvas.** `phefo/index.html:11-13` is a
`<div id="stage">` containing `<canvas id="screen" width="960" height="540">`.
There are no per-entity DOM elements. Any ladder must therefore be a world-space
data object drawn to canvas, not an element.

---

## 2. Current Game Loop

**Verified.** Two nested loops, in `phefo/js/core/game.js`.

**Outer (display-rate), `Game.frame` — `game.js:270`:**

1. `elapsed = min(MAX_FRAME, now - last)` where `MAX_FRAME = 0.25` (`game.js:17`)
   — after a tab-out the backlog is dropped rather than caught up.
2. Accumulate `elapsed`; while `acc >= STEP`, call `Game.step(STEP)`.
3. Call `Game.render()` once.
4. `requestAnimationFrame` the next frame.

**Fixed logic step, `STEP = 1/120` (`game.js:16`), `Game.step` — `game.js:292`:**

A state machine over `title | playing | paused | gameover | victory`. In
`playing` it calls `World.step(dt)`, then checks the end conditions
(`player.dead && deadT > 1.5` → `gameover`; `phase === 'done' && doneT > 1.4` →
`victory`). **Every step ends with `Input.endStep()` (`game.js:319`).**

**Verified — a hard constraint on all input handling.** `Input.endStep`
(`phefo/js/core/input.js:107`) clears edge-triggered state (`_pressed`,
`_released`, `mouse.pressed`) once per *logic* step. All input polling must
therefore occur inside the fixed step; reading a press from render code would
either miss it or observe it twice.

**Verified — `World.step` — `game.js:110`, in this exact order:**

1. **Hitstop early-return** (`game.js:113-116`) — if `this.hitstop > 0`, decrement
   and `return`. The entire world freezes: no entity updates, no physics, no
   particles, no camera. Set by combat on a connecting hit.
2. `refreshCharacters()` — rebuilds the `_chars` scratch array (player + enemies).
3. Tick `notice.life`, and `deadT` if the player is dead.
4. `player.update(dt, this)`.
5. **`enemies[i].update(dt, this)`** for each enemy, in array order.
6. `projectiles[i].update(dt, this)`.
7. `pickups[i].update(dt, this)`.
8. `prune()` each of the three lists (`game.js:210`) — compacts out `remove === true`.
9. `FX.update(dt, groundY)`.
10. `camera.follow(player, dt)`.
11. `tickWaves(dt)`.

**Verified — rendering is fully decoupled** (`Game.render` — `game.js:327`) and
performs no simulation. It sets the DPR transform, clears, calls `World.draw`,
then HUD and menus.

---

## 3. Existing Enemy Model

**Verified — there is exactly one enemy class.** `phefo/js/entities/enemy.js:19`
defines `function Enemy(x, y, cfg)`, prototype-chained to `Entity`
(`enemy.js:45-46`). **All four enemy types are the same class**, differing only
by the `cfg` data object they are constructed with. There are no per-type
subclasses.

**Verified — the type registry** (`enemy.js:283-291`):

```js
P.Enemies = { registry: {} };
P.Enemies.define = function (cfg) { P.Enemies.registry[cfg.type] = cfg; };
P.Enemies.spawn  = function (type, x, y) { … return new P.Enemy(x, y, cfg); };
```

**Verified — the four registered types**, each a single `P.Enemies.define({…})`
call in its own file:

| Type | File | `ranged` | `blocks` | hp | speed | aggro |
|---|---|---|---|---|---|---|
| knifeman | `phefo/js/entities/enemies/knifeman.js` | no | no | 42 | 124 | 430 |
| swordsman | `phefo/js/entities/enemies/swordsman.js` | no | **yes** | 92 | 92 | 400 |
| gunman | `phefo/js/entities/enemies/gunman.js` | **yes** | no | 52 | 108 | 560 |
| archer | `phefo/js/entities/enemies/archer.js` | **yes** | no | 46 | 100 | 680 |

**Verified — the `cfg` contract** consumed by `Enemy.prototype`: `type`, `weapon`,
`hp`, `speed`, `aggro`, `scale`, `knockScale`, `telegraph`, `attackDur`,
`recover`, `hitAt` **or** `shotTimes[]`, `color`, `warnColor`, `attack(e, world, shotIndex)`,
and for ranged types `ranged`, `preferred`, `minRange`; optionally `blocks`.

**Verified — instance state** set in the constructor (`enemy.js:19-43`):
`state`, `stateT`, `fired`, `aim`, `recoil`, `stride`, `alerted`, `strafeT`,
`strafeDir`, `jitter` (a per-instance 0.85–1.15 timing multiplier so a pack does
not act in lockstep), `facing`.

**Verified — inherited from `Entity`** (`phefo/js/entities/entity.js:10-42`):
`x, y, vx, vy, w, h, facing, onGround, gravityScale, dropThrough, hitWall, hp,
hpMax, faction, dead, remove, deathT, flash, stagger, invuln, blocking,
blockStun, knockScale, lastHitDir, animT, stride`.

**Verified — the state machine** (`Enemy.prototype.update` — `enemy.js:56-132`)
has exactly five states, dispatched by `switch (this.state)` at `enemy.js:94`:

```
idle → chase → telegraph → attack → recover → chase | idle
```

`setState(s)` (`enemy.js:50`) resets `stateT` and `fired`. There is **no jump
state, no fall state, no climb state, and no navigation state.**

---

## 4. Enemy Movement and Targeting Flow

### 4.1 Targeting

**Verified — `enemy.js:80-89`:**

```js
var pl = world.player;
var d = pl.x - this.x;
var ad = Math.abs(d);
var dir = d >= 0 ? 1 : -1;
var canSee = !pl.dead && Math.abs(pl.y - this.y) < 120 && ad < cfg.aggro;
if (canSee) this.alerted = true;
var engaged = this.alerted && !pl.dead && ad < cfg.aggro * 1.4;
```

**This is the single most consequential finding for EO-001.** Targeting is:

- **A hard vertical gate of 120 world pixels.** An enemy cannot acquire a target
  whose `y` differs by 120px or more — it never becomes `alerted`, never becomes
  `engaged`, and remains in `idle` indefinitely. A player standing on an upper
  platform is *invisible* to enemies below.
- **Direct, not searched.** There is exactly one target (`world.player`); there
  is no target-selection, line-of-sight, or visibility system.
- **Latching.** Once `alerted` is set it is never cleared, and pursuit continues
  to `aggro * 1.4`.
- The literal `120` is a magic number appearing once, at `enemy.js:84`.

**Verified consequence in shipped level data:** `phefo/js/levels/level01_city.js:81-83`
carries an in-source comment recording that a wave-5 archer had to be moved off
the high walkway to the road precisely because of this gate — it "would never
open fire" when perched.

### 4.2 Movement

**Verified — `Enemy.prototype.chase` — `enemy.js:135-162`.** Two regimes:

- **Melee** (`!cfg.ranged`): if `ad > weapon.reach * 0.82`, `walk` toward the
  player; otherwise damp `vx` and `setState('telegraph')`.
- **Ranged**: if `ad > preferred + 40` advance; if `ad < minRange` walk *away*
  (kiting); otherwise strafe (`strafeDir` flipping on a 0.6–1.5s timer) at 0.45
  speed and, after `stateT > 0.15`, `setState('telegraph')`.

**Verified — `Enemy.prototype.walk` — `enemy.js:165-175`, quoted in full:**

```js
Enemy.prototype.walk = function (dt, world, dir, speedScale) {
  var sp = this.cfg.speed * (speedScale || 1);
  var probeX = this.x + dir * (this.w * 0.5 + 7);
  var ground = P.Physics.groundBelow(probeX, this.y + 2, world.solids, 12);
  if (!ground || this.hitWall === dir) {
    this.vx -= this.vx * Math.min(1, dt * 8);
    return;
  }
  this.vx = U.approach(this.vx, dir * sp, 1500 * dt);
};
```

**Verified implications:**

- Movement is **purely horizontal**. `walk` writes only `vx`.
- An enemy **refuses to leave solid ground** — it probes 7px beyond its own
  half-width and stops if no ground is found within 12px below. This is a ledge
  guard, and it means an enemy will halt at the foot of any gap or the base of
  any vertical feature rather than commit to it.
- It also stops when `hitWall === dir` (wall contact set by
  `Physics.moveAndCollide`, `physics.js:59-60`).

**Verified — enemies have no vertical agency whatsoever.** A grep of
`phefo/js/entities/enemy.js` for `vy` returns exactly one occurrence — a *read*
at `enemy.js:225` (`Po.air(this.vy)` for pose selection). **`Enemy.prototype`
never assigns `vy`, never sets `dropThrough`, and never sets `onGround`.** The
only vertical motion an enemy can experience is gravity applied by
`Physics.moveAndCollide`. Enemies cannot jump, cannot descend deliberately, and
cannot pass through one-way platforms.

**Verified — `Enemy.prototype.separate` — `enemy.js:187-197`.** Every enemy, every
step, scans **all** other enemies and applies a mutual horizontal push of
`±260 * dt` when within 20px horizontally and 34px vertically. It is unconditional
on state — it runs before the state switch (`enemy.js:69`) for any non-staggered
enemy.

### 4.3 Absence of navigation

**Verified.** There is no pathfinding, no navigation mesh, no waypoint graph, no
route planning, and no concept of reachability anywhere in the repository. Enemy
movement is a per-step reactive decision based solely on `player.x - this.x` and
a one-probe ground test.

---

## 5. Platform and Level Model

**Verified — levels are plain data** registered through `P.Levels.define`
(`phefo/js/levels/level.js:21`), retrieved by `get`/`first` (`level.js:27, 33`).
One level is defined: `city01` in `phefo/js/levels/level01_city.js`.

**Verified — the level definition keys** (`level01_city.js:22-90`): `id`, `name`,
`theme`, `seed`, `groundY`, `bounds {minX, maxX, minY, maxY}`, `playerStart`,
`waveDelay`, `solidColor`, `edgeColor`, `solids[]`, `pickups[]`, `waves[]`,
`decor(ctx, cam)`.

**Verified — the entire world geometry is a flat array of axis-aligned rects.**
There is no tile map, no grid, no layer concept, and **no first-class notion of
a "level" or "floor" in the vertical sense**. `solids` is a flat list; "upper
level" is an emergent property of geometry, not a modelled concept.

Two constructors only (`level.js:36-46`):

```js
solid: function (x, y, w, h)  { return { x: x, y: y, w: w, h: h }; }
platform: function (x, y, w)  { return { x: x, y: y, w: w, h: 10, oneWay: true }; }
```

**Verified — the shipped geometry** (`level01_city.js:39-56`): a road slab, two
bounding walls, and 9 features — 4 solid blocks/crates and **5 one-way
platforms** at `y = -152, -186, -128, -196` and one at `-150`. The highest
walkway is `platform(1850, -196, 210)`.

**Verified — the vertical gap problem is concrete.** With the road at `y = 0`,
every one-way platform in the level sits between 128 and 196 px above it. The
targeting gate in §4.1 is 120px. **Every elevated surface in the shipped level is
outside enemy perception range from the road.**

**Verified — `bounds` is load-bearing in two unrelated systems**: camera clamping
(`game.js:34`, via `Camera.setBounds`) and projectile culling
(`phefo/js/entities/projectile.js:86`). `CLAUDE.md` records that `bounds.maxY` is
tuned so the camera clamp aligns the road with the backdrop skyline.

---

## 6. Gravity and Collision Model

**Verified — `phefo/js/core/physics.js`.**

**Position convention (`physics.js:8-12`):** an entity's `(x, y)` is
**`x` = horizontal centre, `y` = feet**. Its AABB is therefore
`[x - w/2, y - h]` → `[x + w/2, y]` (`Physics.box` — `physics.js:18`). This
convention is shared by physics, the stick-figure renderer (which builds upward
from the pelvis), shadows, and camera targeting.

**Gravity (`physics.js:15-16, 66`):**

```js
GRAVITY: 2000,  MAX_FALL: 1250
e.vy = Math.min(e.vy + this.GRAVITY * dt * (e.gravityScale == null ? 1 : e.gravityScale), this.MAX_FALL);
```

Gravity is applied **unconditionally inside `moveAndCollide`** — there is no
"grounded" or "flying" exemption, and no way to skip it other than the
per-entity `gravityScale` multiplier.

**Verified — `gravityScale` is an existing, unused seam.** It is initialised to
`1` at `phefo/js/entities/entity.js:20` and read at `physics.js:66`. A repo-wide
grep finds **no other reader or writer** — no entity ever changes it. It is a
per-entity gravity multiplier that exists and works but is currently inert.

**Collision — `Physics.moveAndCollide` (`physics.js:49-94`), axis-separated:**

1. `e.x += e.vx * dt`; test all solids; on overlap, snap out horizontally, zero
   `vx`, and record `e.hitWall = ±1` (`physics.js:53-64`). **One-way platforms are
   skipped entirely on the X axis** (`physics.js:57`).
2. Apply gravity, `e.y += e.vy * dt`, test all solids again (`physics.js:66-91`).
   - **One-way rule (`physics.js:74-79`):** land only when falling (`vy >= 0`),
     only when the entity's previous bottom was at or above the platform top
     (`wasBottom > t.y + 1` → skip), and only when `e.dropThrough <= 0`.
   - Landing sets `e.y = t.y`, `vy = 0`, `onGround = true`, `groundRef = t`.
   - Head-bump when `vy < 0` sets `e.y = t.y + t.h + e.h`, `vy = 0`.
3. `e.dropThrough` decays by `dt` (`physics.js:93`).

**Verified — collision is brute-force O(entities × solids)** with no spatial
index, run every entity every step.

**Verified — `dropThrough` is player-only.** It is initialised on `Entity`
(`entity.js:21`), decremented in physics, and **set in exactly one place**:
`phefo/js/entities/phefo.js:131-132`, on the player's Down+Jump input. No enemy
code path sets it.

**Verified — helper primitives available:** `overlaps` (box vs rect, `physics.js:22`),
`rectsOverlap` (`:26`), `pointInRect` (`:30`), and `groundBelow(px, py, solids, depth)`
(`:35`), which returns the first solid whose span contains `px` within `depth`
below `py`.

---

## 7. Existing Ladder Model

**Verified — no ladder exists in any form.**

A case-insensitive repository-wide search for
`ladder|climb|rung|stair|vine|rope|elevat|lift` across all files returns, in
application source, exactly two matches — **both incidental prose in comments**:

- `phefo/js/levels/level01_city.js:11` — "cover and **climb**able ledges" (a
  descriptive comment about the level's design intent).
- `phefo/js/entities/enemies/archer.js:24` — "**lift** the aim by the drop" (a
  comment about ballistic aiming).

Every other match is inside `engineering/opportunities/EO-001/opportunity.md`
itself or `CLAUDE.md`.

**Therefore, definitively:**

- There is **no ladder entity, class, type, or constructor.**
- There is **no ladder representation in level data** — `P.Levels` exposes only
  `solid` and `platform` (`level.js:36, 44`).
- There is **no climbing state** on any entity.
- There is **no climb pose** — `phefo/js/render/poses.js` defines exactly ten
  poses: `idle, walk, run, air, slash, shoot, telegraph, stagger, block, death`
  (lines 37, 57, 72, 88, 109, 137, 149, 166, 183, 197).
- There is **no ladder rendering** — `P.Levels.drawSolids` (`level.js:55`) draws
  only two shapes: filled slabs for solids, and a plate-with-brackets for
  `oneWay` platforms (`level.js:64-84`).
- **The player cannot climb.** `Player.prototype.update`
  (`phefo/js/entities/phefo.js:76-180`) implements horizontal movement, jump with
  coyote time and jump buffering, variable jump height, and drop-through — and
  nothing else. There is no vertical-input movement mode.

**Answering `opportunity.md` Open Questions 1–3 definitively: no, ladders do not
exist; there is no representation to describe; and no, the player cannot climb.**
Vertical traversal for the player is achieved solely by **jumping** (`JUMP_V = -655`,
`phefo.js:14`) onto one-way platforms.

---

## 8. Combat Integration

**Verified — all damage funnels through one function**, `P.Combat.applyDamage`
(`phefo/js/combat/hitbox.js:62-116`), which owns i-frames, blocking, knockback,
particles, hitstop, and death.

**Order of checks (`hitbox.js:67-79`):**

1. `if (target.dead || target.remove) return false;`
2. `if (target.invuln > 0) return false;`
3. **Block branch** — if `target.blocking && opts.dirX === -target.facing`: scale
   damage to 15%, set `blockStun = 0.28`, spawn sparks, play `block`, apply 25%
   knockback, subtract the chip damage, and `return false`. The `false` return
   means *deflected*, not *no damage* — callers use it to select spark-coloured
   impact FX over blood (`projectile.js:138`).
4. Otherwise: subtract damage, set `flash`/`lastHitDir`, apply knockback (and
   `vy = -110` for grounded melee targets, `hitbox.js:99`), call `onHurt`, spawn
   blood, set hitstop (0.055 melee / 0.03 ranged).
5. `hp <= 0` → `Combat.kill` (`hitbox.js:118`) → sets `dead`, `deathT = 0`, calls
   `onDeath(opts)`. Otherwise sets `stagger` (0.24 melee / 0.14 ranged).

**Verified — targeting/filtering is faction- and geometry-based only.**
`meleeSweep` (`hitbox.js:26-56`) resolves a swing as a **cone**: within
`weapon.reach + t.w * 0.45` of the attacker's chest origin **and** within
`weapon.arc / 2` of the swing angle. Filters are `t !== attacker`, `!t.dead`,
`!t.remove`, and `t.faction !== attacker.faction`.

**Verified — combat is entirely stateless with respect to entity movement mode.**
No combat code inspects `onGround`, `vy`, or any state name. Damage depends only
on position, facing, faction, `invuln`, and `blocking`.

**Verified — how enemies attack.** `Enemy.prototype.runAttack` (`enemy.js:177-184`)
fires `cfg.attack(this, world, this.fired)` at scheduled offsets within the
`attack` state — `cfg.shotTimes[]` for ranged types, or a single `cfg.hitAt`.
Melee `attack` functions call `P.Combat.meleeSweep(e, [world.player], w, angle, world)`
(e.g. `knifeman.js:38`); ranged ones construct a `P.Projectile` and call
`world.spawnProjectile` (e.g. `gunman.js:47`).

**Verified — interruption.** `enemy.js:72-78`: if `stagger > 0 || blockStun > 0`,
a `telegraph` is downgraded to `recover`, `vx` is damped, and the function
**returns early after `moveAndCollide`** — bypassing the entire state switch.

---

## 9. Rendering Integration

**Verified — draw order**, `World.draw` (`game.js:172-208`):

1. `backdrop.draw(...)` — parallax sky/skyline, screen-space.
2. `ctx.save(); camera.apply(ctx);` — world space begins (`camera.js:67`).
3. `P.Levels.drawSolids(ctx, def, cam)` — level geometry **and** `def.decor`.
4. Pickups (culled by `cam.visible`).
5. **Dead enemies**, then **living enemies** — deliberately separated
   (`game.js:189-196`) so corpses never obscure an active threat.
6. Player.
7. Projectiles.
8. `FX.draw(ctx)` — particles.
9. `ctx.restore();` — then HUD and menus in screen space.

**Verified — every character is one procedural skeleton.**
`P.Stick.draw(ctx, x, y, pose, opts)` (`phefo/js/render/stickman.js:115`) consumes
a **pose = a bag of joint angles** and resolves it to points via forward
kinematics (`build`, `stickman.js:30`). `opts` carries `facing`, `scale`, `color`,
`lineWidth`, `groundLock`, `weapon`, `weaponAngle`, `weaponState`, `flash`, `alpha`.

**Verified — `Enemy.prototype.pose(world)` (`enemy.js:211-228`) maps state → pose**,
in priority order: `dead → death`, `stagger → stagger`, `blocking → block`,
`telegraph → telegraph`, `attack → slash|shoot`, `!onGround → air`,
`|vx| > 12 → walk`, else `idle`. **A state with no matching pose would fall
through to `air` (when airborne) or `idle`.**

**Verified — `groundLock`** (`stickman.js:124-126`): when set, the figure is
shifted so its lowest foot sits exactly at `y`; otherwise it hangs from a nominal
hip height. Enemies pass `groundLock: this.onGround && !this.dead`
(`enemy.js:245`).

**Verified — the warning tint.** `Enemy.prototype.draw` (`enemy.js:236-238`)
switches to `cfg.warnColor` once a telegraph passes 45% — the readability cue for
incoming attacks.

**Verified — ranged arm override** (`enemy.js:253-261`): for ranged types in
`telegraph`/`attack`/`chase`, the near arm is overridden to track
`aimAtPlayer(world)` via `Stick.aimToShoulder`, independent of the leg pose.

---

## 10. Enemy Creation and Spawning Flow

**Verified — the full chain:**

1. **Definition (load time).** Each `phefo/js/entities/enemies/*.js` calls
   `P.Enemies.define({ type: …, … })`, keyed by `cfg.type` (`enemy.js:285`).
2. **Level data.** `level01_city.js:59-88` declares `waves[]` — an array of arrays
   of `{ type, x, y? }`.
3. **Wave spawn.** `World.prototype.spawnWave(i)` (`game.js:66-76`) iterates the
   wave and calls `P.Enemies.spawn(s.type, s.x, s.y == null ? this.groundY : s.y)`,
   then sets initial `facing` toward the player and pushes to `world.enemies`.
4. **Construction.** `P.Enemies.spawn` (`enemy.js:287`) looks up the registry and
   returns `new P.Enemy(x, y, cfg)`, **throwing `Unknown enemy type: …` if the
   type is unregistered.**
5. **Wave progression.** `World.tickWaves` (`game.js:140-165`): when
   `aliveEnemies() === 0` the phase becomes `clear` for `waveDelay` seconds
   (dropping a medkit via `dropReward`, `game.js:167`), then the next wave spawns;
   after the last wave, `phase = 'done'` → victory.
6. **Removal.** A dead enemy sets `remove = true` 4.2s after death
   (`enemy.js:64`); `prune` (`game.js:210`) compacts the array.

**Verified — `aliveEnemies()` counts `!e.dead` (`game.js:78-82`).** Wave
progression is gated entirely on this count.

**Verified — registering a new type requires exactly two things:** a new file
calling `P.Enemies.define`, and a `<script>` tag in `phefo/index.html` placed
**after** `js/entities/enemy.js` (which creates `P.Enemies`) and after any module
the file dereferences at load time.

---

## 11. Existing Tests or Validation Mechanisms

**Verified — there is no automated test suite, and no test tooling of any kind.**
A repository-wide search for `*test*`, `*spec*`, `package.json`, `*.config.*`,
and `Makefile` returns **nothing**. There is no test runner, no assertion
library, no linter configuration, and no CI workflow (no `.github/` directory
exists).

**Verified — the only validation affordances that exist:**

- **Syntax checking**: `node --check` over each `src` in `index.html`.
  `CLAUDE.md` documents a shell loop for this.
- **A documented headless harness *technique*** (`CLAUDE.md`, §"Testing phefo
  without a browser"): construct a `vm` context whose `window` is the sandbox,
  stub `document.getElementById('screen')` with a fake canvas returning a
  no-op Proxy context, load each `src` in order, then drive `Game.step(1/120)`
  and poke `Input._pressed`. **This harness is described but not committed** —
  no such file exists in the repository.
- **Manual play** via a static server, or `file://` (no `fetch`/modules are used).

**This directly answers `opportunity.md` Open Question 20: automated testing is
not available in the repository.** Validation must be either manual gameplay or a
harness that would have to be written.

---

## 12. Potentially Affected Components

Ordered by assessed likelihood of being touched. **This is an impact map, not a
design.**

| Component | Path | Why implicated |
|---|---|---|
| Enemy state machine | `js/entities/enemy.js:56-132` | Shared by all four types; any new state or movement mode lands here |
| Enemy targeting gate | `js/entities/enemy.js:84` | The 120px vertical limit blocks upper-level detection outright |
| Enemy movement | `js/entities/enemy.js:135-175` | `chase`/`walk` are horizontal-only and refuse to leave ground |
| Enemy separation | `js/entities/enemy.js:187-197` | Unconditional horizontal shove; interacts with any fixed-position movement |
| Physics integration | `js/core/physics.js:49-94` | Gravity is unconditional; one-way rules govern platform entry/exit |
| Level data model | `js/levels/level.js:36-46` | Only `solid` and `platform` constructors exist |
| Level geometry | `js/levels/level01_city.js:39-56` | Where any ladder would have to be placed |
| Level rendering | `js/levels/level.js:55-88` | Draws solids and platforms; nothing else |
| Enemy pose mapping | `js/entities/enemy.js:211-228` | No pose exists for a new movement mode |
| Pose library | `js/render/poses.js` | Ten poses, none vertical |
| Wave spawning | `js/core/game.js:66-76` | Where a new type would be placed in level data |
| Wave completion | `js/core/game.js:78-82, 140-165` | Gated on `aliveEnemies()` |
| Script load order | `phefo/index.html:17-54` | A new file must be inserted at the correct position |
| World draw order | `js/core/game.js:172-208` | Any new world object needs a draw slot |

**Verified — likely *not* affected:** `js/combat/*` (combat is movement-agnostic —
§8), `js/core/audio.js`, `js/core/camera.js`, `js/ui/*`, `js/render/backdrop.js`,
and `phefo/css/style.css` (no game visuals live in CSS — §1).

---

## 13. Reusable Existing Patterns

**Verified — patterns already in the codebase that a climbing enemy could build on.
Listing these is not a design proposal.**

1. **Data-driven enemy types.** `P.Enemies.define` + a `cfg` block + a small
   `attack` function. `enemy.js:12-17` states the intent explicitly: "add a
   bomber means writing data plus a small attack function — never a new state
   machine."
2. **`gravityScale` (`entity.js:20`, read at `physics.js:66`).** An existing,
   working, currently-unused per-entity gravity multiplier.
3. **The five-state machine with `setState`/`stateT`** (`enemy.js:50-132`) — a
   working precedent for adding phases with timers.
4. **`Physics.groundBelow`** (`physics.js:35`) — an existing point-probe against
   the solids list, already used for ledge detection.
5. **`Physics.pointInRect` / `overlaps` / `rectsOverlap`** (`physics.js:22-33`) —
   existing overlap primitives that need no new geometry code.
6. **One-way platform semantics** (`physics.js:74-79`) — an existing mechanism for
   passing through a surface upward but landing on it downward.
7. **`dropThrough` as a timed physics override** (`entity.js:21`, `phefo.js:132`) —
   an existing precedent for temporarily suspending a collision rule.
8. **Level data extensibility.** `L.define({…})` accepts arbitrary keys, and
   `def.decor(ctx, cam)` (`level.js:86`) is an existing per-level render hook.
9. **Pose-as-angles rendering** (`poses.js`, `stickman.js:30`) — new poses are
   data, requiring no new rendering machinery.
10. **`cfg.scale` / `cfg.color` / `cfg.warnColor`** — visual differentiation of a
    new type without new art.
11. **Per-instance `jitter`** (`enemy.js:41`) — an existing de-synchronisation
    idiom for packs.

---

## 14. Verified Facts

Each was read directly from the cited source at commit `dcaebbe`.

1. **No ladders exist** anywhere in the repository, in any representation. (§7)
2. **The player cannot climb**; vertical traversal is jumping only. (`phefo.js:76-180`)
3. **Enemies cannot perceive a target ≥120px above or below them.** (`enemy.js:84`)
4. **Every elevated surface in the shipped level (128–196px up) is outside that gate.** (`level01_city.js:39-56`)
5. **`Enemy.prototype` never writes `vy`, `dropThrough`, or `onGround`** — enemies have no vertical agency. (grep of `enemy.js`)
6. **`Enemy.walk` actively refuses to step off ground**, via a `groundBelow` probe. (`enemy.js:165-175`)
7. **All four enemy types are one class** driven by data; there are no subclasses. (`enemy.js:19, 283-291`)
8. **The state machine has five states**; none relate to vertical movement. (`enemy.js:94-125`)
9. **Gravity is unconditional** inside `moveAndCollide`, modulated only by `gravityScale`. (`physics.js:66`)
10. **`gravityScale` exists, works, and is written by nothing.** (`entity.js:20`)
11. **Position convention is `x` = centre, `y` = feet.** (`physics.js:8-12`)
12. **Collision is axis-separated (X then Y), brute-force, no spatial index.** (`physics.js:49-94`)
13. **One-way platforms are skipped entirely on the X axis.** (`physics.js:57`)
14. **`dropThrough` is set only by the player.** (`phefo.js:131-132`)
15. **World geometry is a flat array of AABB rects**; there is no tile map, grid, or modelled "floor". (`level01_city.js:39`)
16. **Combat never inspects movement state** — damage is position/facing/faction/i-frame based only. (`hitbox.js:26-116`)
17. **All damage funnels through `Combat.applyDamage`**, with death via `Combat.kill`. (`hitbox.js:62, 118`)
18. **No sprites exist**; all characters are one procedural skeleton posed by joint angles. (`stickman.js:30-200`)
19. **Ten poses exist**; none is vertical. (`poses.js`)
20. **CSS contains no game visuals** — five layout rules only. (`css/style.css`)
21. **The DOM is a single canvas**; there are no per-entity elements. (`index.html:11-13`)
22. **Logic runs at a fixed 120 Hz** with an accumulator; render is decoupled. (`game.js:16, 270`)
23. **Hitstop freezes the entire world** via an early return. (`game.js:113-116`)
24. **Input edge-state is cleared once per logic step**, forcing all polling into the step. (`input.js:107`, `game.js:319`)
25. **`separate()` applies an unconditional horizontal shove between nearby enemies.** (`enemy.js:187-197`)
26. **Wave progression is gated on `aliveEnemies()`.** (`game.js:78, 140-165`)
27. **Spawning throws on an unregistered type.** (`enemy.js:289`)
28. **No automated tests, test runner, linter, CI, or `package.json` exist.** (repo scan)
29. **Script order in `index.html` is the dependency graph**, load-bearing due to load-time capture. (`enemy.js:6`, `archer.js:7`)
30. **The Opportunity's stated module paths are wrong** — everything lives under `phefo/`. (§0)

---

## 15. Assumptions

Clearly flagged as **not verified**.

1. **Assumption.** "Upper level" in the Opportunity means a one-way platform of
   the kind in `level01_city.js`. The repository has no other elevated surface
   type, but the Opportunity never defines the term.
2. **Assumption.** The 120px gate at `enemy.js:84` was intended as a
   cheap line-of-sight proxy rather than a deliberate design rule. The in-source
   comment at `level01_city.js:81-83` treats it as a constraint to work around,
   not a rule to preserve — but no requirement states either way.
3. **Assumption.** `level01_city` is the only level that must be supported.
   `P.Levels` supports a registry of many (`level.js:18-33`) and `first()` is what
   `Game.boot` uses (`game.js:243`), but only one is defined today.
4. **Assumption.** The absence of any `climb` handling means no hidden or partial
   ladder support exists in an unloaded file. All 25 loaded scripts were searched;
   no unloaded `.js` files exist in `phefo/`.
5. **Assumption.** Performance headroom exists for additional per-step scanning.
   Collision is already O(entities × solids) with no index, and this has not been
   profiled.
6. **Unverified in this session.** I did not visually observe the rendered game
   while producing this report. Rendering claims are derived from source reading.
   (Earlier in the project's history the game was confirmed to boot and run to
   completion headlessly, but that is not evidence for this analysis.)

---

## 16. Engineering Context Gaps

Information that could **not** be determined from the repository and is needed
before design.

1. **No definition of "level" or "floor" exists in code.** Any requirement phrased
   in terms of levels needs translation into the flat-rect model.
2. **No ladder geometry, placement, or authoring convention exists** — there is
   nothing to extend, so representation is an open design question.
3. **No precedent for an entity that is exempt from gravity.** `gravityScale`
   exists but has never been exercised; its behaviour under collision is untested.
4. **No precedent for vertical movement of any kind**, for player or enemy.
5. **Unknown whether the 120px targeting gate may be changed.** It is shared by all
   four enemy types; altering it changes existing enemy behaviour, which
   `opportunity.md` §Known Constraints forbids without explicit approval.
6. **No validation baseline exists.** With no tests, "existing enemies continue
   functioning without regression" (Success Criterion 10) has no mechanical
   definition today.
7. **No performance budget or profiling data.**
8. **No documented level-authoring workflow** for designers referenced in
   `opportunity.md` §Affected Users.

---

## 17. Initial Technical Risks

**Risks only — no mitigations proposed, per INST-001.**

| # | Risk | Evidence | Severity |
|---|---|---|---|
| R1 | **Single shared `Enemy` class.** All four types run the same `update`. Adding states or movement modes to it touches every existing enemy, in tension with the constraint that existing enemies keep behaving as they do. | `enemy.js:19, 56-132` | **High** |
| R2 | **Targeting gate blocks the core requirement.** An enemy cannot detect a player on any elevated surface in the shipped level, so "detect target on an upper level" (Success Criterion 2) cannot be met without touching shared targeting code. | `enemy.js:84` vs `level01_city.js:45-53` | **High** |
| R3 | **Enemies have no vertical agency at all.** No `vy` write, no `dropThrough`, and `walk` refuses to leave ground. Vertical movement is not a tuning change but a new capability. | `enemy.js` grep; `enemy.js:165-175` | **High** |
| R4 | **Unconditional gravity.** Applied inside `moveAndCollide` with no state exemption; any hold-position-on-a-ladder behaviour contends with it every step. | `physics.js:66` | **High** |
| R5 | **`separate()` shoves enemies horizontally regardless of state**, and runs before the state switch. A climbing enemy could be pushed off alignment by any nearby enemy. | `enemy.js:69, 187-197` | **Medium-High** |
| R6 | **Wave completion could soft-lock.** Progression is gated on `aliveEnemies()`; an enemy stuck mid-traversal never dies, so the wave never completes and the game cannot be finished. | `game.js:78, 140-165` | **Medium-High** |
| R7 | **No regression safety net.** No tests exist, so breakage in shared enemy code would surface only through manual play. | repo scan | **Medium-High** |
| R8 | **One-way platforms are invisible to X-axis collision**, so horizontal position is unconstrained while passing a platform's vertical span. | `physics.js:57` | **Medium** |
| R9 | **No pose exists for vertical movement**; unmapped states silently fall through to `air` or `idle` rather than failing loudly. | `enemy.js:211-228`, `poses.js` | **Medium** |
| R10 | **Load-order fragility.** A new script in the wrong position captures `undefined` at load time and fails later with a misleading error. | `enemy.js:6`, `archer.js:7` | **Medium** |
| R11 | **`bounds` is dual-purpose** (camera clamp + projectile culling) and `bounds.maxY` is deliberately tuned to align the road with the skyline; level edits risk unrelated visual regressions. | `game.js:34`, `projectile.js:86`, `CLAUDE.md` | **Low-Medium** |
| R12 | **`groundLock` foot-pinning** assumes a grounded figure; its behaviour for a figure held at an arbitrary height is unexercised. | `stickman.js:124-126` | **Low-Medium** |
| R13 | **Brute-force collision with no spatial index**; added per-step scanning compounds an already O(n×m) cost that has never been profiled. | `physics.js:49-94` | **Low** |
| R14 | **Enemy list order is significant** — enemies update in array order and `separate` reads the live list mid-iteration. | `game.js:126`, `enemy.js:188` | **Low** |

---

## 18. Questions Requiring Human Clarification

Grouped by who can answer. Questions answerable from the repository have been
answered above and are **not** repeated here.

### 18.1 Product / design decisions (cannot be derived from code)

1. **May the shared 120px targeting gate (`enemy.js:84`) be changed?** If not,
   Success Criterion 2 is unreachable without a per-type override. This is the
   single most blocking question. (Relates to R2.)
2. **Is changing shared `Enemy` behaviour acceptable if all four existing types
   are verified unchanged in play, or must existing code paths be literally
   untouched?** §Known Constraints says existing enemies must keep behaving as
   they do; the two readings imply very different approaches. (R1)
3. **Should ladders be placed only in `level01_city`, or is a general authoring
   capability expected for future levels?** (§16.2)
4. **Should the player also be able to climb?** `opportunity.md` scopes only the
   enemy, but a ladder the player cannot use is a visible asymmetry.
5. Opportunity Open Questions **8–19** remain open and are design decisions:
   always pursue upward; predefined ladders only; attack while climbing;
   damageable while climbing; behaviour when the player changes level mid-climb;
   multiple-ladder selection; visual distinctiveness; weapon loadout; climb speed;
   descending; blocked destination; non-vertical ladders.

### 18.2 Acceptance and validation

6. **How is "no regression" to be demonstrated** given there are no tests?
   (Success Criterion 10, R7.) Is a committed headless harness acceptable
   scope, or is manual validation expected?
7. **What defines "stuck"** for Success Criterion 6, in observable terms?
8. **What is the expected behaviour if a climbing enemy blocks wave completion?**
   (R6.)

### 18.3 Scope boundaries

9. **Is modifying `phefo/js/core/physics.js` in scope?** §Out of Scope excludes
   "replacing the current movement or collision engine", but gravity behaviour
   during climbing lives there. Extension versus replacement needs a ruling. (R4)
10. **Is modifying `phefo/js/levels/level01_city.js` in scope?** It is not listed
    in §Known Dependencies, yet any ladder must be placed there.
11. **Is `separate()` allowed to be made state-aware?** It is shared by all
    enemies. (R5)

---

## Discovery Status

**CONV-001 complete.** No architecture, design, or implementation has been
proposed, and no source file was modified. Question 18.1.1 (the targeting gate)
and 18.1.2 (the meaning of "existing enemies unchanged") are assessed as blocking
for the next conversation, since both determine whether the change can be
confined to new files or must alter shared enemy code.
