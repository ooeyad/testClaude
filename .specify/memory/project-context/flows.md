<!-- CAP 150 lines -->
# Flows — phefo

## Boot
`index.html` loads scripts in order → each IIFE registers on `window.Phefo` →
`js/core/game.js` (last) calls `Game.boot()` at parse time → boot wires
`Audio.init()` to `Input.onFirstGesture` and starts the RAF loop.

## Frame
```
requestAnimationFrame
  accumulator += realDt
  while accumulator >= 1/120:
      Game.step(1/120)          <-- ALL gameplay + ALL input polling (INV-2, INV-3)
          if world.hitstop > 0: decrement, return early     (INV-5)
          menus / pause / restart input
          player.update, enemies.update, projectiles.update, pickups.update
          collision + ground snap
          camera follow + clamp to bounds
          Input.endStep()       <-- clears wasPressed / mouse.pressed
      accumulator -= 1/120
  Game.render()                 <-- draw only; never read input here
```

## Damage
```
attacker (melee sweep | projectile hit | explosion)
  -> Combat.applyDamage(target, amount, dirX, ...)
       refuse if target.invuln > 0                       (INV-10)
       refuse if blocking frontally -> chip via Combat.kill, return false (INV-9)
       apply hp, i-frames, knockback, particles, hitstop
       on death: world.onEnemyKilled()
  return value = "was this a clean hit" -> chooses spark vs blood FX only
```

## Enemy behaviour
```
idle -> (target acquired: |player.y - this.y| < 120)  (INV-7)
  chase  -> in range -> telegraph -> attack -> recover -> chase
  target lost -> idle
```
No jump, no fall handling, no pathfinding.

## Climb (climbing enemies only)
```
Climber.update
  dead? -> detach, delegate to Enemy.update (the body falls)
  observePlayerPlane(dt)        <-- every mode, so arrival decisions are current
      player airborne -> hold the last believed plane      (INV-16)
      groundRef stable for PLANE_DWELL (0.20s) -> believe it
  mode 'ground'   -> not on the player's plane and a ladder joins both planes?
                       -> target it, mode 'approach'
                     else delegate to Enemy.update
  tickCommon(dt) exactly once   <-- detached from the parent update  (INV-19)
  mode 'approach' -> walk to the ladder; abandonable. within MOUNT_TOL -> mount
  mode 'climb'    -> physics NOT run at all                          (INV-17)
                     y += climbDir * climbSpeed * dt; committed, never re-decides
                     arrived -> clamp y to the surface, THEN moveAndCollide (INV-18)
                             -> setState('chase'), alerted = true, mode 'ground'
```

## Adding a file
1. Write it with the IIFE module contract (XI-1).
2. Add a `<script>` tag to `phefo/index.html` in the correct comment group,
   after every dependency it captures (INV-4).
3. `js/core/game.js` stays last.
4. `node --check` every script in load order.
