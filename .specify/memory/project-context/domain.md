<!-- CAP 120 lines -->
# Domain — phefo

| Term | Meaning | Lives in |
|---|---|---|
| Phefo | the player character | `js/entities/phefo.js` |
| Entity | anything with position, size and an `update(dt, world)` | `js/entities/entity.js` |
| Character | player or enemy — anything that can take damage | `world.allCharacters()` |
| Enemy type | a config block + `attack()` registered via `P.Enemies.define`; currently knifeman, swordsman, archer, gunman, brute, climber, beast. **One cfg object per type, shared by every spawn** — see INV-22 | `js/entities/enemies/` |
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
| Build | multipliers over the shared bone table, normalised back to standing height. **Shape, never size** — size is `scale` | `js/render/stickman.js`, per character |
| Feature | a few strokes hung off a joint — horns, jaw, hunch, tail, spines, stub, belly, antenna. Declares behind or in front | `js/render/stickman.js` |
| Unrest | per-character multiplier on the idle animation's amplitude; 1 is calm | `js/render/poses.js` |
| Projectile kind | a row in `KINDS`; `grav` controls arc | `js/entities/projectile.js` |
| Ladder | a vertical route `{x, top, bottom}` between two surfaces, usable only by climbing enemies. Never a solid. | `js/levels/level.js`, `def.ladders` |
| Climber | the one enemy that traverses ladders; a subclass of `Enemy` that delegates all ground behaviour to it | `js/entities/climber.js` |
| Beast | the final wave's boss; a subclass of `Enemy` owning only its vulnerability window and its turn at half health | `js/entities/beast.js` |
| Armour | `target.armor`, a damage multiplier read in the funnel. Absent on everything but the beast | `js/combat/hitbox.js` |
| Window | the beast's `recover` state — the only time it takes full damage or can be interrupted | `js/entities/beast.js` |
| Slam | a ground attack resolved through `Combat.explode`; radial, ignores solids, so it answers high ground without climbing | `js/entities/enemies/beast.js` |
| Plane | the surface an entity last stood on (`groundRef`), used as its elevation — never raw `y` | `js/core/physics.js`, INV-16 |
| Climb mode | `ground` → `approach` → `climb` → `dismount`; only `climb` is attached and only `climb` suppresses physics | `js/entities/climber.js` |

## Not in the domain
There is no floor/storey concept, no navigation graph, no pathfinding,
no sprite, no asset pipeline, and no notion of "level" beyond a flat array of
rectangles. Anything that assumes these exists is being introduced, not reused.
