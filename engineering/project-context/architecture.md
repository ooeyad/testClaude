<!-- CAP 200 lines -->
# Architecture — phefo

## Shape
One project, no dependencies, no build. `phefo/index.html` loads every `.js`
with classic `<script>` tags in dependency order (core → render → combat →
entities → levels → ui → boot). `file://` works; a static server is cleaner.

## Module contract
```js
window.Phefo = window.Phefo || {};
(function (P) { 'use strict';
  var U = P.util;              // dependencies captured at IIFE-execution time
  P.Thing = { /* export */ };
})(window.Phefo);
```
ES5 throughout — `var`, `Object.create` prototype chains, no classes, no arrow
functions. This is consistent across every file; match it (STD-20, STD-21).

## Layers

| Layer | Files | Responsibility |
|---|---|---|
| core | `game.js` `physics.js` `input.js` `camera.js` `audio.js` `util.js` | fixed-step loop, the `world` object, collision, input edges, camera clamp, synthesized audio |
| render | `stickman.js` `poses.js` `fx.js` `backdrop.js` | one skeleton for every character; poses are joint angles resolved by forward kinematics at draw time |
| combat | `hitbox.js` `weapons.js` | the single damage funnel; weapon table |
| entities | `entity.js` `phefo.js` `enemy.js` `projectile.js` `pickup.js` `enemies/*` | actors; `enemies/*` are data, not systems |
| levels | `level.js` `level01_city.js` | level registry; levels are pure data |
| ui | `hud.js` `menus.js` | screens |

## Extension points — add data, not systems

| To add | Do this | Not this |
|---|---|---|
| A weapon | a row in the table in `js/combat/weapons.js` + a few strokes in `Stick.drawWeapon` | a weapon class |
| An enemy type | a config block + a small `attack(e, world, shotIndex)` passed to `P.Enemies.define`, as a file in `js/entities/enemies/` | a new state machine |
| A level | data registered with `P.Levels.define`: `solids`, `playerStart`, camera `bounds`, `pickups`, `waves`, optional `decor(ctx, cam)` | level-specific collision or update code |
| A projectile | an entry in `KINDS` in `js/entities/projectile.js` (`grav: 0` = flat bullet, higher = arc) | a projectile subclass |

Enemies share one state machine in `js/entities/enemy.js`:
`idle → chase → telegraph → attack → recover`. The `telegraph` state is
deliberate — a visible wind-up before every attack is what makes a crowd
readable. There is no jump, fall or climb state, and no pathfinding of any kind.

## Rendering
No sprites, no image files. Player and every enemy are the same skeleton
(`js/render/stickman.js`), differing only by scale, colour and weapon. A pose is
a bag of joint **angles** (`js/render/poses.js`); `Stick.build` turns angles into
points by forward kinematics at draw time. Near limbs draw over the torso, far
limbs behind and dimmed.

`js/core/audio.js` synthesizes every sound with WebAudio at runtime. Browsers
block `AudioContext` until a gesture, so `Audio.init()` is deferred through
`Input.onFirstGesture`, wired in `Game.boot`.

## Damage
Everything damaging funnels through `P.Combat.applyDamage` (`js/combat/hitbox.js`),
which owns blocking, i-frames, knockback, particles, hitstop and death. New
attacks call it, or `meleeSweep` / `explode` — never touch `hp` directly (STD-25).

## Verification
There is no committed test suite; parsing proves very little.

1. Syntax, in load order:
   ```bash
   cd phefo && for f in $(grep -o 'src="[^"]*"' index.html | sed 's/src="//;s/"//'); do
     node --check "$f" || echo "FAIL $f"
   done
   ```
2. Behaviour: a throwaway Node harness — a `vm` context whose `window` is the
   sandbox itself; stub `document.getElementById('screen')` with a fake canvas
   whose `getContext` returns a Proxy that no-ops every method (special-case
   `createLinearGradient` / `createRadialGradient` to return `{addColorStop(){}}`);
   `vm.runInContext` each `src` from `index.html` in order. `Phefo.Game.boot()`
   runs on load; then drive `Game.step(1/120)`, poke `Phefo.Input._pressed` /
   `Input.mouse`, and call `Game.render()` to exercise draw paths.
   Four traps when writing the harness — all confirmed the hard way:
   - **INV-10** — reset `invuln = 0`, `blocking = false`, `dirX = target.facing`,
     or scripted damage silently does not land.
   - **INV-11** — `Input.CONFIRM` includes `Space`; a simulated jump restarts the
     run from a victory or game-over screen.
   - **The `AudioContext` stub must be recursively callable.** A flat no-op proxy
     dies on `osc.frequency.setValueAtTime(...)`, which `Combat.applyDamage`
     reaches through `Audio.play` on *every* hit. Return a proxy whose every
     property access yields another callable proxy.
   - **INV-13** — spawn test entities clear of level geometry, or they never move.
     `P.Game.world` is a fully loaded `World`; driving `enemy.update(dt, world)`
     directly isolates the AI better than `World.step`, which also ticks waves.
