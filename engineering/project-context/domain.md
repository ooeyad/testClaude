<!-- CAP 120 lines -->
# Domain — phefo

| Term | Meaning | Lives in |
|---|---|---|
| Phefo | the player character | `js/entities/phefo.js` |
| Entity | anything with position, size and an `update(dt, world)` | `js/entities/entity.js` |
| Character | player or enemy — anything that can take damage | `world.allCharacters()` |
| Enemy type | a config block + `attack()` registered via `P.Enemies.define`; currently knifeman, swordsman, archer, gunman | `js/entities/enemies/` |
| Solid | a world-space rect `{x, y, w, h, oneWay?}`. The only collision primitive. | `js/levels/*` |
| One-way | a solid passable from below | `js/core/physics.js` |
| Level | data: `solids`, `playerStart`, `bounds`, `pickups`, `waves`, `decor` | `js/levels/` |
| Wave | a batch of enemy spawns released on a condition | level data |
| World | the single object passed to every update and most draws (see `invariants.md`) | `js/core/game.js` |
| Hitstop | a few frames where the whole world freezes on a connecting hit | `world.hitstop` |
| Telegraph | the visible wind-up state before every enemy attack | `js/entities/enemy.js` |
| i-frames | `target.invuln > 0` — damage is refused | `js/combat/hitbox.js` |
| Chip damage | damage that lands through a block, via `Combat.kill` | `js/combat/hitbox.js` |
| Pose | a bag of joint angles resolved by forward kinematics at draw time | `js/render/poses.js` |
| Projectile kind | a row in `KINDS`; `grav` controls arc | `js/entities/projectile.js` |

## Not in the domain
There is no floor/storey concept, no ladder, no navigation graph, no pathfinding,
no sprite, no asset pipeline, and no notion of "level" beyond a flat array of
rectangles. Anything that assumes these exists is being introduced, not reused.
