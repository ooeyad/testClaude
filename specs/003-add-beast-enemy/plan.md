# Implementation Plan: Late-Game Beast

**ID:** 003 · **Tier:** deep · **Spec:** `spec.md` (approved 2026-08-18)
**Design gate:** required, pending.

## Constitution Check — before Phase 0

| Article | Check | Verdict |
|---|---|---|
| IV Simplicity | Smallest change that satisfies the spec | pass — one thin subclass, two data files, one line in the damage funnel |
| V Anti-Abstraction | No layer that only forwards | pass — no new system; `Combat.explode` and the shared state machine are reused as-is |
| VI Verification | Every claim has a check | pass — `node --check` in load order plus a `vm` harness per Article X |
| IX Context Economy | Plan stays readable, detail pushed down | pass — tuning values live in `data-model.md`, not here |
| XI-7 Content is data | New content is a table, not a system | **partial** — FR-008 and FR-012 need per-step state a config block cannot hold; see DD-001 |
| XI-6 Damage funnel | Never touch `hp` directly | pass — DD-002 extends the funnel rather than bypassing it |
| XI-12 Append-only signatures | No reorder or removal | pass — every addition is an optional key with a preserving default |

## Phase 0 — Research

Three unknowns were genuine and are resolved in `research.md`: whether the shared
damage funnel can express resistance without a new system (R-1), whether an
existing attack primitive reaches platform height (R-2), and what stops an enemy
pursuing across the level (R-3). R-3 is the reason FR-011 cannot be met in full;
see DD-009 and the open question.

## Phase 1 — Design

### Approach

The beast is the brute's opposite number. The brute punishes standing near it and
is beaten by patience; the beast cannot be beaten by patience at all, because
attacking it outside one window barely scratches it. The fight is: survive the
wind-up, take the recovery, back off, repeat — with the window shrinking once it
is wounded, and with high ground bought at the price of a slam that reaches up.

Everything about chasing, telegraphing, staggering, dying and drawing stays the
parent's. The subclass owns exactly two things the shared machine cannot express:
**when the beast is vulnerable**, and **the turn at half health**.

### Design decisions

| ID | Decision | Forced by |
|---|---|---|
| DD-001 | A thin `Beast` subclass named through `ctor:`, delegating to `P.Enemy.prototype.update`. The armour window and the stage turn are per-step, per-instance state; a config block holds neither. Same extension point as `P.Climber`, and the six existing types run code this file never touches. | FR-008, FR-012, XI-7 |
| DD-002 | Resistance is `target.armor`, a damage multiplier read once in `Combat.applyDamage` before the blocking branch. Absent on every existing entity, so nothing else changes. Rejected: holding `invuln` (refuses the hit outright — no blood, no sound, reads as a broken hitbox); refunding hp inside `onHurt` (works, and lies about what happened); raising `blocking` (chip damage is right, but `blockStun` would lock the beast solid under a flurry). | FR-012 |
| DD-003 | The opening is the existing `recover` state: armour lifts to full damage there and nowhere else, and stagger is zeroed while armoured — so the beast can be interrupted only in the window it already gave you. Stagger suppression lives in the subclass, not the funnel, because it is this type's rule and not a general one. | FR-005, FR-012 |
| DD-004 | The turn at half health rides the existing `onHurt` hook. The subclass re-tunes **the instance** — never `this.cfg`, which is the one object the registry hands to every spawn of the type (INV-NEW-1). | FR-008 |
| DD-005 | Wounded timings ride `this.jitter`, the per-instance multiplier the machine already applies to `telegraph` and `recover`. Lowering it shortens the wind-up and the window together, which is exactly the wounded turn. `attackDur` is deliberately not jittered, so the swing itself stays readable. | FR-008, FR-009 |
| DD-006 | High ground is answered by a ground slam resolved through `Combat.explode` — radial, no line-of-sight test, so it reaches a player on a platform 128–196 px up. The beast never climbs and never leaves the road. | FR-010 |
| DD-007 | Vertical awareness becomes `cfg.sight`, defaulting to the current 120 px. One expression in the shared machine; every existing type keeps its exact behaviour. Rejected: latching `alerted` from inside the subclass — same effect, but it reaches behind the state machine instead of through it. Partially discharges TD-001 by giving the codebase the knob; the base types keep the old value. | FR-010 |
| DD-008 | One `attack()` picks slam or sweep from the player's elevation. Two attacks, one wind-up, one set of timings — the stance is the warning either way (FR-006), and a second timing triple would mean new states. | FR-006, FR-010 |
| DD-009 | No boss bar in the HUD. `Enemy.drawHealth` already scales with the body, so the beast's bar is more than twice any other. FR-014 is met by death FX, not by chrome. This removes the UI contract change the specification gate flagged as likely. | IV, FR-014 |
| DD-010 | The final wave is re-authored as beast plus a fixed escort group, every spawn x clear of geometry (INV-13). Escort *types* are unchanged and no earlier wave is touched. | FR-002, FR-003, FR-007 |

### Change inventory

| File | Kind | Shared contract |
|---|---|---|
| `phefo/js/combat/hitbox.js` | modify — one multiplier plus its doc line | **yes** — the damage funnel every attack in the game runs through |
| `phefo/js/entities/enemy.js` | modify — `cfg.sight` default 120, `cfg.lineWidth` default 3.0 | **yes** — the shared state machine; both additive with preserving defaults |
| `phefo/js/entities/beast.js` | new — the subclass | no |
| `phefo/js/entities/enemies/beast.js` | new — the type definition and its `attack()` | no |
| `phefo/index.html` | additive — two `<script>` tags, subclass before its data file | no, but INV-4 |
| `phefo/js/levels/level01_city.js` | data — the final wave entry only | no |

### Invariant impact

| INV | Verdict | Check that proves it |
|---|---|---|
| INV-2 | held | No new value scales off frame time; the harness drives `Game.step(1/120)` |
| INV-4 | at risk | `beast.js` must precede `enemies/beast.js`, which reads `P.Beast` at define time — exactly the climber's ordering. Proven by load-order `node --check` plus a boot that does not throw |
| INV-5 | held | All new logic is inside `entity.update`, which `World.step` already skips during hitstop |
| INV-7 | **amended** | The 120 px gate becomes the default, not the rule. Harness: the five existing types still ignore a player 152 px up; the beast does not |
| INV-9 | held | `armor` scales `amount` only. The return value keeps meaning "clean hit" — verified by a blocked, armoured hit still returning false |
| INV-10 | held | Harness must still zero `invuln`, clear `blocking`, set `dirX` — and now also drive the beast into `recover` to land a full hit |
| INV-13 | at risk | Every new spawn x checked against the solids list before the wave is committed |
| INV-14 | at risk | Both new `.js` files must be written CRLF or they read as wholly rewritten forever |
| INV-19 | held | The subclass calls through to `P.Enemy.prototype.update`, so `tickCommon` runs exactly once |
| INV-NEW-1 | **new** | `P.Enemies.registry[type]` hands the *same* cfg object to every spawn. Writing `this.cfg.x` retunes every instance of the type, alive and future. Harness: two beasts, wound one, assert the other's timings are untouched |

### Artifacts

`research.md` (R-1…R-3) · `data-model.md` (config keys and starting values) ·
`contracts/damage-funnel.md`, `contracts/enemy-config.md` · `quickstart.md`.

## Constitution Check — after Phase 1

| Article | Verdict |
|---|---|
| IV Simplicity | pass — two new files, three one-line reads in shared code, no new system |
| V Anti-Abstraction | pass |
| VI Verification | pass — every INV row above names its check |
| IX Context Economy | pass |
| XI-6 / XI-7 | one accepted violation, recorded below |
| XI-12 | pass — `armor`, `sight` and `lineWidth` are optional with preserving defaults |
| XII-4 | flagged — scope checks must use `git diff --ignore-cr-at-eol` (INV-14) |

## Complexity Tracking

| # | Article | Violation | Why accepted | Rejected alternative | Feature |
|---|---|---|---|---|---|
| 1 | XI-7 | The beast is a subclass, not purely data | FR-008 and FR-012 need per-step, per-instance state; a config block cannot hold a vulnerability window | Adding `armored` and `wounded` states to the shared machine — would put beast-only branches in the path all six other types run every frame | 003 |
| 2 | FR-011 | Met on open ground, not literally everywhere | See the open question — a full fix is a change to shared physics | Per-type step-over logic in the subclass — the same fix, hidden where nobody would look for it | 003 |

## Resolved at the design gate — 2026-08-18

**FR-011 — the beast can be walled off.** `Enemy.walk` refuses to step into a
wall, so the road's tall blocks stop the beast exactly as they stop the other
five melee types today (R-3). A player who retreats behind the concrete block is
pursued only as far as the slam reaches.

**Decision (A), Project Owner.** Accept the limit. The fight is authored into the
open segment between the concrete block and the low block, where the slam has
raised surfaces to deny, and no shared physics changes. The residual stands:
retreat to another road segment and the beast holds its ground. Recorded as
Complexity Tracking row 2.

Rejected: an optional `stepUp` height in `moveAndCollide`. It is the right
long-term answer and the wrong thing to smuggle into this feature — it changes
the code path every entity and every projectile runs, and it belongs to its own.
Opened as TD-006 when this ships.
