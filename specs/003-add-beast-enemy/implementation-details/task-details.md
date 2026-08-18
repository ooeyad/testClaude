# Task details — 003 Late-Game Beast

Not auto-loaded. The implementer reads **only its own entry**, plus
`state.json`, `invariants.md` and Articles X–XII. Each entry is a contract, not a
pointer: if one of these sends you to `plan.md` or `spec.md` to do the work, the
entry is defective — say so rather than reading around it.

## Task detail

### T001 — Armour multiplier in the damage funnel
**Goal.** Let a target carry a damage multiplier, so one enemy can be near-immune
except in a window it chooses to give (FR-012, DD-002).
**Done when.** A target with `armor = 0.2` loses a fifth of the hp it otherwise
would, from every damage source in the game, and a target without the property is
damaged exactly as before.
**Touches.** `js/combat/hitbox.js`, `applyDamage` only — one multiplier applied
after the `invuln` refusal and **before** the blocking branch, plus a doc line.
**Do not touch.** `kill`, `meleeSweep`, `explode`; the temptation is to also
suppress stagger here, and stagger is the beast's own rule, not the funnel's
(T003). Do not touch any enemy file — nothing sets `armor` yet, and that is fine.
**Must not change.** The return value's meaning: `false` is "not a clean hit",
never "no damage" (INV-9). Blood, flash, hitstop, sound and `lastHitDir` must
fire on an armoured hit exactly as on a bare one.
**Notes.** ① Placement before the block branch is deliberate: an armoured
blocking target takes `amount × armor × 0.15`, both reductions composing.
② Reduced damage must still reach `Combat.kill`. ③ `armor` is a number, not a
hook — resist making it a callback.

### T002 — `cfg.sight` and `cfg.lineWidth` on the shared machine
**Goal.** Replace two hard-coded literals with config reads that default to
today's values (FR-001, FR-010, DD-007).
**Done when.** `Enemy.prototype.update` gates vertical acquisition on
`cfg.sight || 120`, `Enemy.prototype.draw` passes `cfg.lineWidth || 3.0`, and all
six existing types behave and look identically.
**Touches.** `js/entities/enemy.js` — the `canSee` expression and the `opts`
object in `draw`. Nothing else.
**Do not touch.** The `alerted` latch or the 1.4× pursuit hysteresis; they look
like part of the same problem and are not in scope. No enemy data file — none
sets either key yet.
**Must not change.** The horizontal `aggro` test. INV-7 must still hold for every
type that omits `sight`.
**Notes.** ① A large `sight` grants no ability to *reach* a raised player —
`Enemy.walk` still refuses walls and ledges. ② `lineWidth` is cosmetic; nothing
reads it back.

### T003 — The `Beast` subclass: armour window and stagger rule
**Goal.** The beast is vulnerable only while recovering from its own swing
(FR-005, FR-012, DD-001, DD-003).
**Done when.** Damage dealt while the beast is in `recover` lands in full and
staggers it; damage in any other state is scaled by its armour value and does not
stagger it, and the state machine keeps running through the hit.
**Touches.** `js/entities/beast.js`, new file. `P.Beast` constructor chaining to
`P.Enemy`, prototype from `Object.create(P.Enemy.prototype)`, and an `update`
that sets `this.armor` from `this.state`, zeroes `this.stagger` while armoured,
then delegates to `P.Enemy.prototype.update.call(this, dt, world)`.
**Do not touch.** `js/entities/enemy.js` — the temptation is to add an `armored`
state to the shared machine, which would put beast-only branches in the path six
other types run every frame. `js/entities/climber.js` is the shape to copy, not
to edit.
**Must not change.** Everything else about the beast is the parent's — chasing,
telegraphing, dying, drawing.
**Notes.** ① Delegate; never reimplement `update`. A subclass that bypasses the
parent must tick status timers itself, exactly once (INV-19) — delegating avoids
the whole trap. ② Zero the stagger *before* delegating: the parent checks
`stagger > 0` at the top and freezes for the step. ③ **Never write
`this.cfg.<anything>`.** The registry hands one config object to every instance
of a type, so that retunes every beast alive and every future one (INV-NEW-1).
④ Armour is read from the state at the top of the step; a hit landing later in
the same step uses the previous frame's value. At 120 Hz that is 8 ms — leave it.
⑤ File must be written **CRLF** (INV-14).

### T004 — The beast type definition and its sweep
**Goal.** The data block that makes the beast enormous, slow, immovable and
sword-armed, with the longest wind-up in the game (FR-001, FR-004, FR-006,
FR-013).
**Done when.** `P.Enemies.spawn('beast', x, y)` returns a `P.Beast`, and the
values in `data-model.md` § "Beast type definition" are in place.
**Touches.** `js/entities/enemies/beast.js`, new file. Config block plus a single
`attack(e, world)` resolving one heavy sword sweep through `P.Combat.meleeSweep`,
with camera shake on connection and a forward lean.
**Do not touch.** `js/combat/weapons.js` — the beast uses the existing sword, and
adding a weapon would be a new player-facing table row nobody asked for (FR-013).
No elevation logic yet; that is T008.
**Must not change.** —
**Notes.** ① `ctor: P.Beast` is read at define time, so this file must load after
`beast.js` (T005). ② Use only keys the shared machine actually reads plus the two
from T002 — unknown keys are ignored silently (XI-11). ③ Named constants carry
their units (XI-13). ④ **CRLF** (INV-14).

### T005 — Load both files in dependency order
**Goal.** Wire the two new files into the one file that *is* the dependency graph.
**Done when.** `js/entities/beast.js` appears immediately after
`js/entities/climber.js`, and `js/entities/enemies/beast.js` in the enemies
group; the page boots with no console error.
**Touches.** `phefo/index.html` only.
**Notes.** ① Wrong order does not fail at parse — it fails at boot with `ctor`
undefined (INV-4). ② `js/core/game.js` stays last. ③ `index.html` is LF while
every `.js` is CRLF; do not let an editor normalise the file (INV-14).

### T006 — Re-author the final wave
**Goal.** The beast headlines the last wave with a fixed escort group, in the one
road segment where the fight works (FR-002, FR-003, FR-007, DD-010).
**Done when.** The final wave entry matches `data-model.md` § "Final wave" — six
spawns, beast at 1380, the brute dropped — and every earlier wave is byte-identical.
**Touches.** `js/levels/level01_city.js`, the last entry of `waves` only.
**Do not touch.** `solids`, `ladders`, `pickups`, `bounds` — option (A) at the
design gate accepted the level as it stands; changing geometry to help the beast
was explicitly deferred.
**Must not change.** Waves one to five, in any respect (FR-003).
**Notes.** ① Every spawn x must be clear of the solids list — an entity spawned
inside geometry can never walk out and reads exactly like an AI bug (INV-13).
② The chosen segment runs 1108–1660; a spawn outside it cannot reach the fight.
③ The comments on the existing wave entries explain why each enemy sits where it
does — keep that standard.

### T007 — The wounded turn at half health
**Goal.** Crossing half health visibly changes the fight (FR-008, FR-009, DD-004,
DD-005).
**Done when.** At `hp ≤ hpMax / 2` the beast enters `recover` immediately with a
shake, a sound and a colour change, and from the following cycle its wind-up and
its opening are shorter; the turn happens once and never repeats.
**Touches.** `js/entities/beast.js` — an `onHurt` method and the instance fields
it sets.
**Do not touch.** `js/combat/hitbox.js`; `onHurt` is already called there and
needs nothing added. Do not add a stage state to the shared machine.
**Must not change.** The opening must still open in the wounded stage — harder to
take, never absent (FR-008).
**Notes.** ① `onHurt` is called *after* hp is decremented, so test the new value.
② Per-instance tuning only: change `this.jitter`, never `this.cfg` (INV-NEW-1).
The machine already multiplies `telegraph` and `recover` by `jitter` — and not
`attackDur`, which is why the swing stays readable. ③ Forcing `recover` is what
makes the turn a signal rather than an ambush: the player is handed one window as
the announcement. ④ Guard against re-entry; damage arrives many times per second.

### T008 — The ground slam, and choosing it by elevation
**Goal.** A player on high ground is threatened without the beast ever climbing
(FR-010, DD-006, DD-008).
**Done when.** With the player on a raised surface the beast slams the road and
the blast reaches them with falloff; with the player at its own footing it
sweeps; `sight` lets it acquire a player who was already up there.
**Touches.** `js/entities/enemies/beast.js` — the `attack` function and the slam
constants.
**Do not touch.** `js/combat/hitbox.js` — `Combat.explode` already does radial
damage with falloff and needs nothing. Do not add a second telegraph or a second
set of timings; one wind-up covers both attacks.
**Must not change.** The sweep from T004 stays the answer at close range.
**Notes.** ① `explode` performs no line-of-sight or solid test — that is what
lets a road-level blast reach a walkway 196 px up. ② It measures to each target's
*centre*, roughly 18 px above the feet; size the radius against the platform
height plus that. ③ It damages only the opposing faction, so escorts are safe.
④ It already plays its own sound, FX and camera shake.

### T009 — Death emphasis
**Goal.** The beast's death is unmistakable (FR-014).
**Done when.** Killing it produces markedly more than a normal enemy's death —
shake and FX scaled to the body — and the level still completes normally.
**Touches.** `js/entities/beast.js` — an `onDeath` that delegates to
`P.Enemy.prototype.onDeath` and adds to it.
**Notes.** ① Delegating matters: the parent's `onDeath` is what calls
`world.onEnemyKilled`, and the wave never ends without it.

### T010 — Tuning pass against SC-1…SC-6
**Goal.** The numbers, played rather than reasoned about.
**Done when.** The Project Owner has played the final wave and the first attempt
is a loss, the win arrives within three to five, and mashing outside the opening
reads as hitting a wall.
**Touches.** `js/entities/enemies/beast.js` values only.
**Notes.** ① Feel is the Project Owner's call and no headless check substitutes
for it — this task ends at the release gate, not before. ② Record the literal
harness commands and their real output as the evidence for Article VI.

### T011 — Memory updates
**Goal.** Leave the map matching the territory.
**Done when.** `invariants.md` has INV-7 amended to "…beyond their `sight`, which
defaults to 120" and a new invariant for the shared `cfg` object; `debt.md` opens
TD-006 for the deferred `stepUp`; `domain.md` and `index.md` name the beast among
the enemy types.
**Touches.** `.specify/memory/project-context/invariants.md`, `debt.md`,
`domain.md`, `index.md`.
**Notes.** ① `domain.md` still lists four enemy types and `invariants.md` still
says "four"/"five other" — both were stale before this feature; fix them while
here. ② Respect the caps: invariants 120, domain 120, debt 80, index 80.
