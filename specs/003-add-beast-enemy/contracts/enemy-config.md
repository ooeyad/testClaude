# Contract — the shared enemy machine gains two optional config keys

**File:** `phefo/js/entities/enemy.js` · **Consumers:** every type in
`js/entities/enemies/`. **Kind:** two additive reads with preserving defaults.

## `cfg.sight` — vertical awareness, px, default 120

The hard-coded 120 px gate in `Enemy.prototype.update` becomes
`cfg.sight || 120`. Nothing else about target acquisition changes: the
horizontal `aggro` test, the `alerted` latch and the 1.4× pursuit hysteresis are
untouched.

| Guarantee | |
|---|---|
| Existing types | All six omit the key and behave identically. INV-7 remains true of them, and TD-001 remains open for them. |
| INV-7 | Amended from "enemies never engage across a height gap" to "…beyond their `sight`, which defaults to 120". The invariant must be reworded when this ships, not silently falsified. |
| Not a licence | A large `sight` does not give an enemy any way to *reach* a raised player. It only lets it acquire one. Pursuit is still bounded by `Enemy.walk`, which refuses walls and ledges (R-3). |

## `cfg.lineWidth` — skeleton stroke, px, default 3.0

`Enemy.prototype.draw` passes `cfg.lineWidth || 3.0` instead of the literal.
Cosmetic only; nothing reads it back.

## `cfg` identity — a trap, not a change

`P.Enemies.registry[type]` holds **one** config object, and `P.Enemies.spawn`
hands that same object to every instance of the type. `this.cfg` is therefore
shared state: writing `this.cfg.telegraph` retunes every beast alive and every
one that spawns afterwards, for the rest of the session.

Per-instance tuning goes on the instance. The shared machine already provides
`this.jitter` for exactly this, applied to `telegraph` and `recover` (DD-005).
This is INV-NEW-1 in the plan and must be added to `invariants.md` when the
feature ships.
