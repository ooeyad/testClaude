# EO-001 — Decisions

## A. Business decisions

| ID | Decision | Status | Answer |
|---|---|---|---|
| BD-001 | Whose behaviour may change? | 🟢 | Only the new climber. The four existing types are untouched. |
| BD-002 | May the player climb ladders too? | 🟢 | No. Ladders are enemy infrastructure; the player keeps jumping. |
| BD-003 | Primary success measure? | 🟢 | Enemy variety and perceived intelligence, not raw difficulty. |
| BD-004 | Always pursue upward? | 🟢 | Only when a ladder is reasonably close to its current position. |
| BD-005 | Attack while climbing? | 🟢 | No. No attacking at any point while on the ladder. |
| BD-006 | Vulnerable while climbing? | 🟢 | Fully vulnerable; falls to the ground when killed mid-climb. |
| BD-007 | Descend as well as ascend? | 🟢 | Yes, two-way. Climbs back down when the player returns to ground. |
| BD-008 | Player changes level mid-climb? | 🟢 | A climb, once started, always completes. Re-evaluate after. |
| BD-009 | Are ladders visible to the player? | 🟢 | Yes — drawn unmistakably as ladders. |
| BD-010 | Visually distinct? | 🟢 | Own colour, slightly smaller and lighter build. |
| BD-011 | Threat profile? | 🟢 | Fast, fragile melee; knife-armed. |
| BD-012 | Where in the wave progression? | 🟢 | Alone in a mid wave first, then reused under pressure. |
| BD-013 | Fairness guardrail for ladder-top camping? | 🟢 | None. Camping the top is an acceptable player tactic. |
| BD-014 | How is success judged? | 🟢 | The climber visibly and legibly reaches the player. Owner's judgement. |
| BD-015 | Acceptable validation? | 🟢 | A written, repeatable manual checklist, played and recorded. |
| BD-016 | One level, or reusable? | 🟢 | Reusable — ladders are a general level-authoring feature. |
| BD-017 | Schedule? | 🟢 | Single complete increment, no fixed deadline. |
| BD-018 | Who signs off? | 🟢 | The Project Owner, all gates. |
| BD-019 | May existing waves change? | 🟢 | The climber is added on top; later waves get harder, none are removed. |

### Rationale (non-obvious only)
**BD-002** — Giving the player ladders would change the movement vocabulary of the
whole game and invalidate every level's difficulty tuning. Enemy-only keeps the
blast radius inside this opportunity.
**BD-005 / BD-006** — Together these make the ladder a commitment: the climber is
a defenceless target for the duration, which is what makes ladder-top camping
(BD-013) a fair tactic rather than an exploit to patch.
**BD-008** — "Always completes" avoids an entire class of oscillation bugs at the
cost of the climber occasionally arriving somewhere pointless. Cheap trade.

## B. Architecture decisions

| ID | Decision | Status | Choice | Refs |
|---|---|---|---|---|
| AD-001 | Where does climbing live? | 🟢 | A new `Climber` that extends `P.Enemy` and delegates ground combat, death and rendering to it. | BD-001 |
| AD-002 | How is a custom constructor selected? | 🟢 | `Enemy.spawn` resolves `cfg.ctor \|\| P.Enemy`. **The only shared modification in the design (ASM-001).** | BD-001 |
| AD-003 | How are ladders modelled? | 🟢 | Level data: a `ladder()` constructor in `levels/level.js`, exposed as `World.ladders` (defaults to `[]`). | BD-016 |
| AD-004 | How is elevation determined? | 🟢 | Read `player.groundRef`, which physics already maintains. No new floor concept. | F-5 |
| AD-005 | Movement while attached? | 🟢 | Kinematic — the climber is detached from gravity and ground snapping for the duration. | R-1, INV-1 |
| AD-006 | Climb state machine? | 🟢 | Owned entirely by `Climber`: approach → mount → climb → dismount. `Enemy`'s five states are untouched. | BD-001 |
| AD-007 | Entry and exit safety? | 🟢 | Explicit preconditions on mount and dismount; a blocked exit aborts rather than strands. | R-3 |
| AD-008 | Combat while attached? | 🟢 | No combat code changes at all. Damage flows through `Combat.applyDamage` unmodified. | BD-005, BD-006, STD-25 |
| AD-009 | Inherited runtime state while detached? | 🟢 | A housekeeping contract: the climber explicitly maintains the `Enemy` fields it is not otherwise updating. | R-4 |
| AD-010 | Rendering? | 🟢 | A `climb(phase)` pose added to `render/poses.js` — a new table key unreachable by existing types. | BD-010 |

### Rationale (non-obvious only)
**AD-002** — Every alternative (a registry, a factory, a spawn hook) is more
machinery for the same result. A single `||` fallback is inert for the four
existing types, which is what makes the "existing enemies unchanged" claim
provable structurally rather than by testing.
**AD-005** — Reusing physics for climbing would mean special-casing gravity per
entity, which breaks the one-collision-model property (INV-12). Detaching is
narrower and reversible.
**AD-009** — This is the subtle one. `Enemy` assumes it is on the ground; a
subclass that stops calling the ground path silently inherits stale facing,
timers and target state. The contract makes the obligation explicit instead of
leaving it to be discovered as a bug.

## C. Change inventory

| File | Kind | What changes | Shared? | Refs |
|---|---|---|---|---|
| `phefo/js/entities/climber.js` | new | climb machine, elevation model, kinematics, entry/exit, housekeeping | no | AD-001 |
| `phefo/js/entities/enemies/climber.js` | new | `P.Enemies.define({type:'climber', ctor:P.Climber, …})` — data only | no | AD-001 |
| `phefo/js/entities/enemy.js` | modify | `spawn` resolves `cfg.ctor \|\| P.Enemy` | **yes — ASM-001** | AD-002 |
| `phefo/js/levels/level.js` | additive | `ladder()` constructor, `drawLadders()` | no | AD-003 |
| `phefo/js/render/poses.js` | additive | `climb(phase)` pose | no | AD-010 |
| `phefo/js/core/game.js` | additive | `World.ladders = def.ladders \|\| []`; one `drawLadders` call | no | AD-003 |
| `phefo/js/levels/level01_city.js` | data | ladder placement, wave composition | no | BD-012, BD-019 |
| `phefo/index.html` | additive | 2 `<script>` tags, order mandated | no | INV-4 |

**Totals:** 2 new, 4 additive, 1 data, 1 modify. **Shared-contract changes: 1 (ASM-001).**

**Explicitly not modified:** `physics.js`, `hitbox.js`, `weapons.js`, `input.js`,
`camera.js`, `stickman.js`, `fx.js`, `entity.js`, `phefo.js`, `projectile.js`,
`pickup.js`, and all four existing `entities/enemies/*.js`.

**Load order (mandatory, INV-4):** `entities/climber.js` after `entities/enemy.js`
(extends `P.Enemy` at IIFE time); `entities/enemies/climber.js` after
`entities/climber.js` (its `cfg.ctor` reads `P.Climber` at definition time).

## D. Invariant impact

| INV | Verdict | How proven |
|---|---|---|
| INV-1 (centre/feet coords) | preserved | Kinematic movement writes the same `(x, y)` convention; AABB unchanged. |
| INV-2 (fixed 120 Hz) | preserved | Climb speed is px per fixed step, never scaled by frame time. |
| INV-4 (load order) | preserved | Two tags in mandated positions; `game.js` stays last. |
| INV-7 (120 px awareness gate) | **changed, for the climber only** | The climber uses its own elevation model (AD-004). `Enemy.update`'s gate is untouched, so the four existing types keep the old behaviour — that is the proof. |
| INV-9 / INV-10 (damage semantics) | preserved | No combat code changes (AD-008). |
| INV-12 (one collision model) | preserved | No level-specific or entity-specific collision added; the climber detaches rather than special-casing physics. |

## E. Behavioural compatibility rule
The four existing enemy types must be **observably identical** before and after.
Proof is structural first — `cfg.ctor || P.Enemy` is inert when `ctor` is absent,
and every other change is a new key, a new function, or new data — and confirmed
by replaying the existing waves with no climber present and comparing behaviour.

## F. Tuning parameters
| Name | Unit | Where | Why |
|---|---|---|---|
| climb speed | px per fixed step | `climber.js` | Slower than walking; the climb must read as a commitment (BD-005). |
| ladder proximity | px | `climber.js` | "Reasonably close" from BD-004; tuned so the climber does not cross the level to reach a ladder. |
| climber scale / colour | — | `enemies/climber.js` | Visual distinction (BD-010). |
| climber hp / damage | — | `enemies/climber.js` | Fast and fragile (BD-011). |

## G. Deferred
| ID | Deferred because | Revisit when |
|---|---|---|
| — | Raising INV-7 for all enemy types was out of scope (BD-001). | A future opportunity targets enemy targeting generally — see TD-001. |
