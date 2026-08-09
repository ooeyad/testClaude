# EO-001 — Architecture Design

**Opportunity:** EO-001 — Add Ladder-Climbing Enemy
**Lifecycle Stage:** Architecture Design
**Conversation:** CONV-003 — Architecture Design
**Role:** ROLE-002 — Solution Architect
**Baseline:** `main` @ `84257ea`
**Version:** 1.2
**Status:** 🟡 Awaiting Architecture Approval

### Revision history

| Ver | Date | Change |
|---|---|---|
| 1.0 | 2026-08-06 | Initial architecture design |
| 1.1 | 2026-08-06 | Rework in response to Architecture Review. Resolves **ARV-001** (shared-function modification contradiction), **ARV-002** (inherited runtime-state housekeeping), **ARV-003** (stable elevation detection), **ARV-004** (standards qualification). See §15. |
| 1.2 | 2026-08-06 | Minor rework. Resolves **ARV-005** (DISMOUNT physics contradiction — single explicit transition contract) and **ARV-006** (change-inventory count). See §15. |

**Inputs consumed**

| Artifact | Status |
|---|---|
| `opportunity.md` | Read |
| `project-context-review.md` (discovery, CONV-001) | Read |
| `business-understanding.md` (CONV-002, 19 decisions, BR-01…BR-18) | Read |
| `approvals/business-approval.md` | Read — 9 architecture conditions |
| `engineering/project-context/standards/**` | **Not established** — see §2.3 |

> **Scope note.** This document defines structure, interfaces, responsibilities and
> control flow. It contains no production code and creates no source files.
> Signatures and pseudocode appear only to make contracts unambiguous.

---

## 1. Architectural Objective

Add one enemy type that traverses between elevations using ladders, **without
altering the behaviour of any existing enemy**, in a codebase where all four
existing enemy types are instances of a single shared class.

The tension that defines this design: discovery identified that shared class
(`Enemy`) as the dominant technical risk (CSU §17 R1), while BR-01 and Approval
Condition 1 make preserving existing behaviour non-negotiable.

**The central architectural decision is isolation:** the new capability is added
by *extension*. Where a shared function must be touched at all, it is touched
under an explicit, enforceable backward-compatibility rule (§3) rather than an
absolute prohibition.

---

## 2. Constraints Governing the Design

### 2.1 From the Business Approval (mandatory)

| # | Condition | Addressed in |
|---|---|---|
| C-1 | Preserve the behaviour of existing enemy types | §3, §7 |
| C-2 | Avoid globally changing the 120-pixel awareness rule | §5.5 |
| C-3 | Support both ladder ascent and descent | §5.4 |
| C-4 | Prevent the enemy from becoming permanently stranded | §5.9 |
| C-5 | Preserve current combat behaviour | §5.8 |
| C-6 | Support reusable ladder definitions in level data | §5.1 |
| C-7 | Define safe behaviour at ladder entry and exit points | §5.7 |
| C-8 | Address enemy separation while climbing | §5.10 |
| C-9 | Provide a repeatable validation approach | §11 |

### 2.2 From the codebase (verified in discovery)

| Constraint | Consequence for this design |
|---|---|
| Gravity is applied unconditionally inside `moveAndCollide` (`physics.js:66`) | A climbing entity cannot simply "hold position"; §5.6 |
| Position is `x` = centre, `y` = feet | Ladder geometry is expressed in feet-space; §5.1 |
| `moveAndCollide` sets `e.groundRef` on landing, for solids **and** one-way platforms alike (`physics.js:85`), and never clears it | Provides a persistent record of the last supporting surface; §5.5 |
| Script order in `index.html` is the dependency graph | New files have mandated positions; §6.3 |
| All four enemy types share one class and one `update` | Extension over modification; §5.3 |
| `Enemy.prototype.update` performs per-step housekeeping beyond AI | Bypassing it requires an explicit housekeeping contract; §5.12 |
| No pose exists for vertical movement | New pose required; §5.11 |
| Wave completion is gated on `aliveEnemies()` | Stranding is a soft-lock risk; §5.9 |

### 2.3 Standards qualification (ARV-004)

**The project standards are not established.** All 32 files under
`engineering/project-context/` — including `standards/coding/javascript-coding-standard.md`,
`standards/architecture/*`, `standards/git/*`, `standards/testing/*` and
`standards/frontend/*` — are **0 bytes**.

Consequently:

1. **This design has not been assessed against any project standard**, because
   none exists to assess against.
2. **Architecture approval of this document must not be read as certifying
   compliance** with those standards. It certifies only that the design satisfies
   the Business Approval conditions and the business rules.
3. **`CLAUDE.md` is the provisional governing convention document.** The design
   follows the conventions it records — ES5, `window.Phefo` IIFE modules,
   prototype chains via `Object.create`, data-driven types, the `x` = centre /
   `y` = feet convention, and load-order discipline.
4. **When the standards are populated, this design must be re-assessed.** If a
   published standard contradicts a decision here, the standard prevails and this
   document requires revision. This is recorded as risk AR-7 (§12).

---

## 3. Design Principle: Backward-Compatible Extension

**Revised in v1.1 (ARV-001).** Version 1.0 stated an absolute rule — that no
existing function body may change — and then modified `P.Enemies.spawn`. That was
a genuine contradiction. The absolute rule is withdrawn and replaced with a rule
that is both honest about the modification and enforceable at review.

### 3.1 The Behavioural Backward-Compatibility Rule (BCR)

> A shared function **may** be modified if and only if all four conditions hold:
>
> **BCR-1 — Registered.** The modification appears in the Approved Shared
> Modification Register (§3.2) with an ID, before implementation begins.
>
> **BCR-2 — Observationally identical for existing callers.** For every input
> reachable by an existing caller, the function's return value, side effects,
> thrown exceptions and object identity are indistinguishable from baseline.
>
> **BCR-3 — Guarded additive control flow.** Any new branch is guarded by a
> condition that evaluates false for every existing input, so existing callers
> traverse the original path.
>
> **BCR-4 — Review-testable.** A stated static and runtime test can demonstrate
> BCR-2 (§7.2).
>
> A modification that cannot satisfy all four **must be escalated to
> architecture**, not worked around.

Changes are then classified as:

| Category | Meaning | Governed by |
|---|---|---|
| **NEW** | A new file; nothing existing reads it | — |
| **ADDITIVE** | A new key, function, or default in an existing file, unreachable by existing callers | BCR by inspection |
| **BCR-MOD** | A modification to an existing function body | **Must be registered in §3.2** |
| **DATA** | Level content only | Gameplay scope |

### 3.2 Approved Shared Modification Register (ASM)

**This register is exhaustive.** Any BCR-MOD not listed here is unapproved.

| ID | File · function | Modification | BCR-3 guard | Justification |
|---|---|---|---|---|
| **ASM-001** | `js/entities/enemy.js` · `P.Enemies.spawn` | Resolve the constructor from `cfg.ctor`, defaulting to `P.Enemy` | `cfg.ctor` is `undefined` for all four existing type definitions | §5.3 |

**ASM-001 is the only approved modification to an existing function body in this
design.** Every other change is NEW, ADDITIVE or DATA.

Baseline and proposed forms, stated precisely so review can diff against them:

```
// baseline
return new P.Enemy(x, y, cfg);

// proposed
var Ctor = cfg.ctor || P.Enemy;
return new Ctor(x, y, cfg);
```

---

## 4. Solution Overview

```
                    ┌──────────────────────────────┐
   level data ─────▶│  def.ladders[]  (NEW model)  │
                    └──────────────┬───────────────┘
                                   │ read-only
        ┌──────────────────────────┼──────────────────────────┐
        ▼                          ▼                          ▼
┌───────────────┐        ┌──────────────────┐       ┌──────────────────────┐
│ Levels        │        │  World           │       │  Climber (NEW)       │
│ .ladder()     │        │  .ladders        │       │  extends Enemy       │
│ .drawLadders()│        │  (ADDITIVE)      │       │                      │
│ (ADDITIVE)    │        └──────────────────┘       │ ┌──────────────────┐ │
└───────────────┘                                   │ │ Elevation model  │ │
                                                    │ │  (§5.5)          │ │
┌────────────────────────────┐                      │ ├──────────────────┤ │
│ Enemy.spawn  [ASM-001]     │──── constructs ─────▶│ │ Climb machine    │ │
│ cfg.ctor || P.Enemy        │                      │ │  (§5.4)          │ │
└────────────────────────────┘                      │ ├──────────────────┤ │
                                                    │ │ Housekeeping     │ │
┌────────────────────────────┐                      │ │  contract (§5.12)│ │
│ Enemy.prototype            │◀─── delegates ───────│ └──────────────────┘ │
│ (UNCHANGED — 4 types)      │  death, ground AI,   └──────────────────────┘
│ update chase walk separate │  combat, rendering
│ runAttack pose draw        │
└────────────────────────────┘
```

The `Climber` owns climbing, elevation reasoning and its own housekeeping while
detached. `Enemy` remains the authority for ground combat, death and rendering,
and the `Climber` **delegates** to it — which is what keeps the two behaviourally
identical once the climber is on the ground.

---

## 5. Component Design

### 5.1 Ladder Model — `NEW data model`, `ADDITIVE` to `levels/level.js`

**Decision: ladders are NOT solids and are NOT added to `def.solids`.**

`solids` is read every step by `moveAndCollide` for every entity and by
`Projectile.hitSolids`. Adding any element would change collision for the player,
all four existing enemies and every projectile — violating C-1 and C-5. Ladders
live in a **separate, parallel collection that no existing system reads**.

```
Ladder := {
  x:      number   // horizontal centre
  top:    number   // y of the UPPER surface — feet rest here on arrival
  bottom: number   // y of the LOWER surface — feet rest here at the base
}
// Invariant: top < bottom   (y grows downward)
```

**Authoring API**, mirroring the existing `solid()` / `platform()` constructors:

```
P.Levels.ladder(x, top, bottom) -> Ladder
```

Level definitions gain one optional key, `ladders: [ … ]`. Absent means none, so
every level without ladders is unaffected (C-6).

### 5.2 Ladder Rendering — `ADDITIVE` to `levels/level.js` and `core/game.js`

`P.Levels.drawLadders(ctx, def, cam)` draws two rails and evenly spaced rungs in
world space, culled by the same x-range test `drawSolids` already uses. Called
from `World.draw` immediately after `drawSolids` and before pickups, so ladders
sit behind every actor. Drawn plainly and unmistakably as a ladder (BR-04).

No CSS is involved — the stylesheet is page layout only and the DOM is a single
canvas (amendment A-2).

### 5.3 Climber Class — `NEW` file `entities/climber.js`

**Decision: `Climber` is a subclass of `Enemy`, not a fifth `cfg` block.**

```
function Climber(x, y, cfg)                        // Enemy.call(this, x, y, cfg)
Climber.prototype = Object.create(Enemy.prototype)
Climber.prototype.constructor = Climber
```

matching the `Object.create` idiom already used by `Player`, `Enemy`, `Projectile`
and `Pickup`.

**Placement.** The class lives in `entities/climber.js`, beside `enemy.js`,
because `entities/enemies/*.js` is by convention **data only**. The climber's data
block lives in `entities/enemies/climber.js` alongside its peers.

**Construction mechanism — deliberately retained (ARV-001).** `P.Enemies.spawn`
is the single construction point for every enemy, reached from `World.spawnWave`.
A subclass cannot be instantiated without it participating. The `cfg.ctor` hook
(**ASM-001**) is retained in preference to the alternatives:

| Option | Assessment |
|---|---|
| **Retain `cfg.ctor`** *(chosen)* | One line, explicit, greppable, declared in the type's own data block, and provably inert (§7.2). Registered as ASM-001. |
| Wrap/patch `P.Enemies.spawn` from `climber.js` at load time | Leaves `enemy.js` byte-identical, but replaces a shared function at runtime — behaviour then depends on load order and is invisible to anyone reading `enemy.js`. **Rejected: less reviewable and more fragile than the change it avoids.** |
| Bypass `spawn` — construct climbers in `World.spawnWave` | Moves the modification into `game.js` and special-cases one type in the wave loader. **Rejected: worse placement, same modification.** |
| Separate registry and spawn path for climbers | Two construction paths to keep in sync; duplicates wave-spawn logic. **Rejected.** |

### 5.4 Climb State Machine — `NEW`, owned entirely by `Climber`

The parent's five states (`idle → chase → telegraph → attack → recover`) are
untouched and continue to be driven by `Enemy.prototype.update`. The climber adds
an orthogonal mode that suspends delegation while active.

```
        ┌─────────────────────────────────────────────────────────┐
        │  GROUND MODE — delegated to Enemy.prototype.update      │
        │  idle · chase · telegraph · attack · recover            │
        │  (120px awareness rule applies here, unchanged)         │
        └───────────────────────────┬─────────────────────────────┘
                stable plane differs (§5.5) AND connecting
                ladder within cfg.ladderRange AND self grounded
                                    ▼
                        ┌───────────────────────┐
                        │      APPROACH         │  walk to ladder base
                        │  housekeeping: FULL   │  physics: YES
                        │  re-evaluated each    │  separation: YES
                        │  step; abandonable    │  attacking: NO
                        └───────────┬───────────┘
                     grounded AND |x − ladder.x| ≤ MOUNT_TOL
                                    ▼
                        ┌───────────────────────┐
                        │       CLIMB           │  COMMITTED (BR-08)
                        │  ATTACHED · kinematic │  physics: NO
                        │  no reassessment      │  separation: NO
                        │  vulnerable (BR-05)   │  attacking: NO
                        └───────────┬───────────┘
                         reached the target end of the ladder
                         │  within the SAME step (§5.7.1):
                         │   1. clamp y to the endpoint
                         │   2. clear ladder attachment
                         │   3. enter DISMOUNT
                                    ▼
                        ┌───────────────────────┐
                        │      DISMOUNT         │  exactly one step
                        │  DETACHED · dynamic   │  physics: YES (resumed)
                        │  verify footing       │  separation: NO
                        │  setState('chase')    │  attacking: NO
                        └───────────┬───────────┘
                                    ▼
                        back to GROUND MODE  (delegated to Enemy)
```

**DISMOUNT is a one-step transition, not a residency state.** It runs normal
physics; `CLIMB` does not. Housekeeping is executed **exactly once** across the
whole transition because it is performed at the top of `Climber.update`, before
any mode is dispatched (§5.12.1).

`APPROACH` is deliberately **not** committed — if the player's stable plane
returns to the climber's own, it abandons and resumes normal combat. Only `CLIMB`
is committed, which is exactly what BR-08 requires and no more.

Descent uses the identical machine with the direction inverted (C-3); there is no
separate descent path to keep in sync.

### 5.5 Elevation Model and Ladder Selection — `NEW`, inside `Climber`

**Rewritten in v1.1 (ARV-003).** Version 1.0 compared `player.y` directly against
ladder endpoints. That is unstable: a player jumping from the ground passes
through platform-height coordinates every jump, which could trigger a false climb;
and a player standing on a platform who jumps would momentarily stop matching,
aborting a legitimate approach. Elevation is now derived from a **supporting
surface**, never from an instantaneous `y`.

#### 5.5.1 Supporting surface as the definition of elevation

`moveAndCollide` records `e.groundRef = t` on every landing (`physics.js:85`) and
**never clears it**. That branch is reached for solids and one-way platforms
alike — the one-way guards sit above it and only decide *whether* a landing
happens, not how it is recorded.

Two consequences the design relies on:

1. **`groundRef` already persists as "the last surface I stood on"**, so an
   airborne entity retains its last plane with no new state and, critically, **no
   modification to `Player`** (BR-03, C-1).
2. **Ground and one-way platforms are identified identically** — both are simply
   supporting rects. The design must not special-case `oneWay` when reasoning
   about elevation, which is what keeps ground level and fire escapes consistent.

```
supportOf(entity)  := entity.groundRef            // may be undefined before first landing
planeYOf(entity)   := supportOf(entity) ? supportOf(entity).y : UNKNOWN
samePlane(a, b)    := supportOf(a) === supportOf(b)                       // identity, exact
                   OR |planeYOf(a) − planeYOf(b)| <= LEVEL_TOL            // co-planar rects
```

Identity is tested first and is exact: every entity standing on the road shares
the one road rect. The tolerance test is the fallback for two distinct rects whose
surfaces are level with each other.

#### 5.5.2 Stability — the observed-plane filter

`groundRef` alone still changes the instant a player clips a platform corner. The
climber therefore maintains its **own** observation of the player's plane, with a
dwell requirement. No field is added to `Player`.

```
per step, in the Climber:
  if player.onGround and supportOf(player) !== observedSupport:
        candidateSupport := supportOf(player) ; candidateT := 0
  else if player.onGround and supportOf(player) === candidateSupport:
        candidateT += dt
        if candidateT >= PLANE_DWELL:  observedSupport := candidateSupport
  // while the player is airborne, observedSupport is left untouched
```

`observedSupport` is the **stable player plane** used for every decision below.
A player who is jumping, falling, or momentarily brushing a surface cannot move
it. `PLANE_DWELL` (~0.2 s) is the sole debounce.

The climber's own elevation needs no filter: it is grounded whenever a climb
decision is taken, so `supportOf(self)` is current by construction.

#### 5.5.3 Selection rule

Evaluated **only** in ground mode, and only when the climber is grounded:

```
if observedSupport is UNKNOWN            -> delegate to Enemy   (player never landed yet)
if samePlane(self, observedSupport)      -> delegate to Enemy   (120px rule applies, C-2)
else
  playerPlaneY := observedSupport.y
  selfPlaneY   := planeYOf(self)
  candidates := ladders where
        |ladder.x − self.x| <= cfg.ladderRange                            (BR-10)
    AND ( ascent : |ladder.bottom − selfPlaneY|   <= LEVEL_TOL
                AND |ladder.top    − playerPlaneY| <= LEVEL_TOL
        | descent: |ladder.top     − selfPlaneY|   <= LEVEL_TOL
                AND |ladder.bottom − playerPlaneY| <= LEVEL_TOL )
  choose nearest by |ladder.x − self.x|
  none -> delegate to Enemy   (ordinary ground enemy, BR-10)
```

Both endpoints are checked against **stable planes**, so a climber never mounts a
ladder that does not actually connect its own surface to the player's.

#### 5.5.4 APPROACH begin and abandon conditions

| Transition | Condition |
|---|---|
| **Begin APPROACH** | Ground mode · self grounded · not dead · `observedSupport` known and differs from self's plane · a connecting ladder within `ladderRange` |
| **Continue** | Above still true; walk toward `ladder.x` using the parent's `walk` |
| **Abandon** | `observedSupport` becomes co-planar with self · **or** the chosen ladder no longer connects the two stable planes · **or** the player is dead · **or** the climber is no longer grounded (knocked airborne) |
| **Commit to CLIMB** | Self grounded · `\|x − ladder.x\| <= MOUNT_TOL` · correct end of the ladder for the direction of travel |

Abandonment applies to `APPROACH` only. **`CLIMB` is never abandoned** (BR-08).

#### 5.5.5 Why airborne movement cannot cause a false selection

| Scenario | Outcome |
|---|---|
| Player jumps on the ground | `groundRef` stays the road; `observedSupport` unchanged; no climb triggered |
| Player jumps while on a platform | `observedSupport` stays the platform; an approach in progress continues |
| Player clips a platform corner for a few frames | Dwell not met; `observedSupport` unchanged |
| Player lands on a platform and stays | After `PLANE_DWELL`, plane updates; approach may begin |
| Player falls off a platform to the ground | Plane updates only once landed and dwelt; the climber then descends (BR-09) |
| Player never landed since spawn | `observedSupport` UNKNOWN; climber behaves as an ordinary ground enemy |

**C-2 is satisfied structurally.** The 120px rule at `enemy.js:84` lives inside
`Enemy.prototype.update`, which the climber does not call while evaluating a
climb — the line is neither read nor modified. On the player's plane the climber
delegates, and the 120px rule applies to it exactly as to every other enemy.

### 5.6 Movement and Physics During Climb — `NEW`, inside `Climber`

**Decision: while attached, `moveAndCollide` is not called at all.** The climber
is kinematic.

```
x  := ladder.x                    (snapped on mount, held thereafter)
y  += ±cfg.climbSpeed * dt
vx := 0 ; vy := 0
onGround := false
```

**Why not `gravityScale = 0`?** Discovery flagged `gravityScale` as an unused seam
and it was the obvious candidate. Rejected: zeroing gravity still leaves
`moveAndCollide` resolving collisions, which would snap the climber onto the first
one-way platform plane it crosses — precisely the surfaces a ladder must pass
through. Not running physics is strictly stronger, and leaves `gravityScale` at
its default for every entity so nothing else can be perturbed.

**Consequence:** during a climb the climber passes through one-way platforms
freely. Intended, and why §10 forbids ladders intersecting solid geometry.

### 5.7 Entry and Exit Safety — `NEW` (C-7)

**Mount.** Requires `onGround`, alignment within `MOUNT_TOL`, and the correct
plane. On mount, `x` is **snapped** to `ladder.x` in one assignment — snapping
rather than easing removes any possibility of an approach oscillating around the
ladder without ever satisfying the tolerance. `groundRef` is left intact (it is
the record of the plane departed from) and `onGround` is set false.

#### 5.7.1 The exit contract (ARV-005)

**Single normative sequence.** There is exactly one way a climber leaves a ladder,
and both endpoints use it. Steps 1–4 occur in the step that detects the endpoint;
step 5 is the same step's physics pass.

| # | Action | Mode after |
|---|---|---|
| 0 | **Housekeeping already performed once** at the top of `Climber.update`, before mode dispatch (§5.12.1) | — |
| 1 | **Endpoint reached** — ascending `y <= ladder.top`, or descending `y >= ladder.bottom` | CLIMB |
| 2 | **Clamp** `y` to the endpoint exactly (`ladder.top` or `ladder.bottom`) | CLIMB |
| 3 | **Clear ladder attachment** — drop the ladder reference and the direction of travel | — |
| 4 | **Enter DISMOUNT** | DISMOUNT |
| 5 | **Resume normal physics** — `Physics.moveAndCollide(self, world.solids, dt)` runs for this step | DISMOUNT |
| 6 | **Verify footing** — `Physics.groundBelow(x, y + 2, solids, 12)` | DISMOUNT |
| 7 | **Return to ground mode** — `setState('chase')`, `alerted = true` | GROUND |

Feet land exactly on the surface the endpoint denotes — which is what
`Ladder.top` and `Ladder.bottom` mean (§5.1). Because attachment is cleared at
step 3 *before* physics runs at step 5, there is no step in which the entity is
both attached and dynamic.

**Why clamping must precede physics (step 2 before step 5).** `moveAndCollide`
captures `wasBottom = e.y` on entry and uses it in the one-way guard
`if (wasBottom > t.y + 1) continue`. Clamping first sets `y` exactly to the
platform's surface, so `wasBottom === t.y`, the guard does not skip, and the
climber lands on the platform it just arrived at. Resuming physics *before*
clamping would leave `wasBottom` mid-ladder — below the platform — and the guard
would reject the landing, dropping the climber back down. The ordering is
load-bearing, not stylistic.

**Footing verification (step 6).** Uses the same probe `Enemy.walk` already
relies on. If no surface is found, nothing special happens: the climber is
already dynamic, so it simply falls — recoverable and visually sensible, rather
than stuck. The probe result is therefore diagnostic, not corrective.

**Interruption.** Damage does not interrupt a climb (BR-08). Full semantics for
damage, stagger, block and death while attached are specified in §5.8 and §5.12.

### 5.8 Combat Integration and Damage While Attached — `no combat code changes` (C-5)

Discovery verified that combat inspects only position, facing, faction, `invuln`
and `blocking`, and never consults movement state (CSU §8). A climbing enemy is
therefore damageable through the entire climb with **no combat code involved** —
BR-05 is satisfied by the existing architecture, not by new logic.

**Behaviour when acted upon while attached (ARV-002):**

| Event | Effect while attached | Rationale |
|---|---|---|
| **Damaged** | `hp` reduced, `flash` set, `lastHitDir` set — all by unmodified `Combat.applyDamage`. Climb continues. | BR-05 vulnerability preserved; BR-08 commitment |
| **Knockback** | `applyDamage` writes `vx`; the climber zeroes `vx`/`vy` every climb step, so knockback has no positional effect. `x` remains `ladder.x`. | Prevents being shoved off the ladder into an inconsistent state |
| **Staggered** | `stagger` is set by combat and **decays normally** via `tickCommon` (§5.12). It does **not** interrupt or slow the climb. | BR-08; a stagger that stopped a climb would recreate the stuck-on-ladder state C-7 exists to prevent |
| **Blocked** | Cannot occur. The block branch requires `target.blocking === true`; the climber's `cfg` defines no `blocks`, and `blocking` is forced `false` every step while attached (§5.12). | Removes an unreachable state rather than leaving it ambiguous |
| **Invulnerability** | `invuln` is never set by climbing and decays normally via `tickCommon`. | Vulnerability preserved (BR-05) |
| **Killed** | Detach first, then delegate: clear attachment, restore `onGround = false`, then `Enemy.prototype.update` runs its dead branch — damping `vx`, calling `moveAndCollide`, removing after 4.2 s. The body falls and dies on the ground. | BR-06, with no new death code |

**Not attacking while climbing (BR-07)** is achieved by omission: `cfg.attack` is
only ever invoked from `Enemy.prototype.runAttack` inside the `attack` state,
which is unreachable while attached.

The climber uses the existing `knife` weapon (BR-11, BR-18) — no weapon table
change.

### 5.9 Stranding Prevention — `NEW` (C-4)

Guaranteed **structurally by symmetry**. The selection rule (§5.5.3) is
direction-agnostic: a climber standing on a platform whose target's stable plane
is below evaluates the same rule and descends. There is no state from which a
climber can perceive a reachable target and lack the route it just used.

Residual case: climber on a platform, player alive on the ground and beyond
`cfg.aggro`. The climber idles. **This is not new** — every existing enemy idles
when the player is distant, and wave completion has always required the player to
approach. Not a new soft-lock, and every platform in the shipped level is
reachable by jumping.

### 5.10 Separation Handling — `NEW`, by omission (C-8)

`Enemy.prototype.separate` (`enemy.js:187-197`) modifies **only `this.vx`** — the
vx of the enemy doing the separating. Two mitigations follow:

1. **The climber is never pushed while attached.** `separate` is called from
   `Enemy.prototype.update`, which the climber does not invoke while attached, and
   its `x` is held at `ladder.x` regardless.
2. **Other enemies self-disqualify.** Their guard `|o.y − this.y| > 34` skips any
   entity more than 34 px away vertically, so a climber above that height is
   invisible to their separation pass. Below it, the climber behaves as a normal
   grounded enemy — which is correct.

During `APPROACH` the climber **does** separate normally, since it is an ordinary
grounded enemy at that point. No change to `separate` is required or proposed.

### 5.11 Pose and Rendering — `ADDITIVE` to `render/poses.js`, override in `Climber`

`Poses.climb(phase)` is added as a new key — additive, and unreachable by existing
types since `Enemy.prototype.pose` never requests it.

`Climber.prototype.pose` returns the climb pose while attached and otherwise
`Enemy.prototype.pose.call(this, world)`, so ground appearance is literally the
parent's.

Two existing mechanisms do the right thing unchanged: `onGround` is false while
attached, so `Enemy.prototype.draw` passes `groundLock: false` and draws no
contact shadow. Visual identity (BR-12) uses the existing per-type `cfg.color`,
`cfg.warnColor` and `cfg.scale`.

`climbPhase` — a Climber-owned animation clock — drives the pose and is advanced
only while attached (§5.12).

### 5.12 Inherited Runtime-State Housekeeping — `NEW` contract (ARV-002)

**Added in v1.1.** `Enemy.prototype.update` performs per-step housekeeping in
addition to AI. Because the climber bypasses it while attached, that housekeeping
must be specified rather than assumed, or status values silently freeze.

#### 5.12.1 The two housekeeping modes

**Corrected in v1.2 (ARV-005).** Version 1.1 grouped DISMOUNT with CLIMB as
physics-off, contradicting the state diagram. The two are now separated: the
distinction that matters is **attached vs detached**, and DISMOUNT is detached.

| Mode | Attachment | Ground AI | Attacking | Separation | Physics | Housekeeping |
|---|---|---|---|---|---|---|
| **GROUND MODE** | Detached | ✅ | ✅ | ✅ | ✅ dynamic | By `Enemy.prototype.update` |
| **APPROACH** | Detached | ❌ self-steered | ❌ | ✅ | ✅ dynamic | By the climber, once per step |
| **CLIMB** | **Attached** | ❌ | ❌ | ❌ | ❌ **kinematic** | By the climber, once per step |
| **DISMOUNT** | Detached | ❌ | ❌ | ❌ | ✅ **dynamic (resumed)** | By the climber, once per step |

- **APPROACH** runs physics and separation because the climber is an ordinary
  grounded enemy at that point; it simply steers itself instead of using `chase`.
- **CLIMB** is the only mode that suppresses physics, and the only mode in which
  the entity is attached to a ladder.
- **DISMOUNT** lasts exactly one step, runs physics, and ends in GROUND MODE.

**Housekeeping is performed exactly once per step, at the top of
`Climber.update`, before any mode is dispatched.** This is what guarantees the
"exactly once during the transition" requirement: a step that begins in CLIMB and
ends in DISMOUNT still performs housekeeping once, because it is not tied to the
mode.

#### 5.12.2 Per-field contract

Every field inherited from `Entity` and `Enemy`, and what happens to it in
APPROACH / CLIMB / DISMOUNT. **The climber calls `this.tickCommon(dt)` on every
step of every climb state** — this is the mechanism for the first five rows.

| Field | Owner | While APPROACH / CLIMB / DISMOUNT | Why |
|---|---|---|---|
| `animT` | Entity | **Advances** via `tickCommon` | Idle/breathing clocks must not stall |
| `flash` | Entity | **Decays** via `tickCommon` | Hit flash must fade, or a struck climber glows permanently |
| `stagger` | Entity | **Decays** via `tickCommon`; no motion effect while attached | BR-08 — must expire, must not interrupt |
| `invuln` | Entity | **Decays** via `tickCommon`; never set by climbing | Preserves vulnerability (BR-05) |
| `blockStun` | Entity | **Decays** via `tickCommon` | Prevents a permanently frozen value |
| `hitWall` | Entity | **Reset to 0** each step by `tickCommon` | Stale wall contact would corrupt the next `walk` |
| `recoil` | Enemy | **Decays** — climber mirrors the parent's `recoil -= dt * 7` | Unused by a melee type, but must not freeze non-zero |
| `blocking` | Entity | **Forced `false`** every step while attached | Removes the block branch in `applyDamage` (§5.8) and prevents a stale guard |
| `deathT` | Entity | **Not advanced by the climber.** On death the climber detaches and delegates; the parent's dead branch advances it | Single owner for death timing (BR-06) |
| `dead`, `remove` | Entity | Written only by `Combat.kill` and the parent's dead branch | No new death paths |
| `vx`, `vy` | Entity | APPROACH: normal physics. CLIMB: **zeroed each step**. DISMOUNT: **left at 0 and handed to physics**, which applies gravity from rest | Neutralises knockback while attached (§5.8); a clean hand-back on exit |
| `onGround` | Entity | APPROACH: set by physics. CLIMB: **forced `false`**. DISMOUNT: **set by resumed physics** — normally `true`, having been clamped onto the endpoint surface | Drives `groundLock` and shadow (§5.11) |
| `groundRef` | Physics | **Left intact** while attached — it records the plane departed from (§5.5.1). Updated by physics during DISMOUNT when the climber settles on the endpoint surface | Elevation must stay resolvable throughout the climb |
| `dropThrough` | Entity | Never written by the climber; **cleared to 0 on mount**. Decays normally again once physics resumes at DISMOUNT | Physics is the only decayer, and it does not run during CLIMB |
| `gravityScale` | Entity | **Never written** — stays 1 | §5.6 |
| `stateT`, `fired` | Enemy | **Frozen** while attached; **reset on return to ground mode** via `setState('chase')` | Prevents a stale timer resuming a half-finished attack |
| `state` | Enemy | Frozen while attached; set to `'chase'` on dismount | Clean re-entry |
| `alerted` | Enemy | **Set `true` on dismount** | It climbed *because* it detected the player; it must engage on arrival, not re-acquire |
| `stride` | Entity | **Frozen** while attached | Matches a standing enemy, which also does not advance it; the walk cycle resumes seamlessly |
| `aim`, `strafeT`, `strafeDir` | Enemy | Frozen; unused by a melee type | No observable effect |
| `jitter`, `knockScale`, `facing` | Enemy/Entity | Unchanged; `facing` set toward the ladder on mount | — |
| `climbPhase` *(new)* | Climber | Advances only while attached | Drives `Poses.climb` (§5.11) |
| `observedSupport`, `candidateSupport`, `candidateT` *(new)* | Climber | Advance in **all** modes | The plane filter must keep observing during a climb so the post-arrival decision is current (§5.5.2) |

#### 5.12.3 Invariants

1. **No inherited timer is ever frozen while non-zero and behaviourally
   significant.** `flash`, `stagger`, `invuln`, `blockStun` and `recoil` all decay
   in every mode.
2. **No status field is left stale on re-entry to ground mode.** `stateT`, `fired`
   and `state` are reset by `setState('chase')` at DISMOUNT.
3. **Vulnerability is never suppressed.** `invuln` is never written by climbing;
   `blocking` is forced false.
4. **Death has exactly one owner** — the parent's dead branch, reached by
   detaching first.
5. **Housekeeping runs exactly once per step, in every mode** (ARV-005). It is
   performed at the top of `Climber.update` before mode dispatch, so a step that
   crosses a mode boundary — notably CLIMB → DISMOUNT — neither skips it nor
   performs it twice.
6. **The entity is never simultaneously attached and dynamic.** Attachment is
   cleared before physics resumes (§5.7.1 steps 3 and 5), so no step can apply
   both kinematic positioning and collision resolution.

---

## 6. Change Inventory

### 6.1 New files (2)

| File | Contents | Category |
|---|---|---|
| `phefo/js/entities/climber.js` | `Climber` class — climb machine, elevation model, kinematic movement, entry/exit, housekeeping contract | NEW |
| `phefo/js/entities/enemies/climber.js` | `P.Enemies.define({ type:'climber', ctor:P.Climber, … })` — data only, matching peers | NEW |

### 6.2 Modified files (6)

| File | Change | Category | Basis |
|---|---|---|---|
| `js/entities/enemy.js` | `spawn` resolves `cfg.ctor \|\| P.Enemy` | **BCR-MOD — ASM-001** | §3.2; inertness proof §7.2 |
| `js/levels/level.js` | `ladder()` constructor + `drawLadders()` | ADDITIVE | New functions; no existing caller |
| `js/render/poses.js` | `climb(phase)` pose | ADDITIVE | New table key; unreachable by existing types |
| `js/core/game.js` | `World.ladders = def.ladders \|\| []`; one `drawLadders` call in `World.draw` | ADDITIVE | Defaults to empty; draw call is a no-op with none |
| `js/levels/level01_city.js` | `ladders: […]`, wave composition | DATA | Gameplay content |
| `phefo/index.html` | 2 `<script>` tags | ADDITIVE | Order mandated in §6.3 |

**Exactly one BCR-MOD exists in this design (ASM-001).**

**Not modified:** `js/core/physics.js`, `js/combat/hitbox.js`, `js/combat/weapons.js`,
`js/core/input.js`, `js/core/camera.js`, `js/render/stickman.js`, `js/render/fx.js`,
`js/entities/entity.js`, `js/entities/phefo.js`, `js/entities/projectile.js`,
`js/entities/pickup.js`, and all four existing `entities/enemies/*.js`.

**`Player` is not modified.** The elevation model reads `player.groundRef`, which
physics already maintains (§5.5.1).

### 6.2.1 Inventory totals (ARV-006)

Reconciliation, so heading counts and table rows cannot drift apart again.

| Measure | Count | Composition |
|---|---|---|
| New files (§6.1) | **2** | `entities/climber.js`, `entities/enemies/climber.js` |
| Modified files (§6.2) | **6** | `enemy.js`, `level.js`, `poses.js`, `game.js`, `level01_city.js`, `index.html` |
| **Total files touched** | **8** | 2 new + 6 modified |
| By category | | BCR-MOD **1** (`enemy.js`, ASM-001) · ADDITIVE **4** (`level.js`, `poses.js`, `game.js`, `index.html`) · DATA **1** (`level01_city.js`) · NEW **2** |
| Approved shared modifications (§3.2) | **1** | ASM-001 only |

`index.html` is counted as a modified file. It is ADDITIVE — two `<script>` tags
appended within the existing entities block (§6.3) — but it is an existing file
and must appear in the modified total.

### 6.3 Script load order (mandatory)

| File | Must load after | Because |
|---|---|---|
| `js/entities/climber.js` | `js/entities/enemy.js` | Extends `P.Enemy`, read at IIFE time |
| `js/entities/enemies/climber.js` | `js/entities/climber.js` | Its `cfg.ctor` references `P.Climber` at definition time |

Both sit inside the existing `<!-- entities -->` block, after `enemy.js` and
before `<!-- levels -->`.

---

## 7. How "Existing Enemies Unchanged" Is Proven

### 7.1 Structural guarantees

1. **One registered modification.** Only ASM-001 alters an existing function body,
   and it is declared in §3.2 before implementation.
2. **BCR-3 guard holds.** No existing enemy `cfg` defines `ctor`, so `cfg.ctor`
   is `undefined` and `Ctor` resolves to `P.Enemy` — the original expression.
3. **Ladders are invisible to existing systems.** Not in `solids`, so physics,
   projectiles and every existing entity cannot observe them.
4. **All other shared changes are ADDITIVE** — new functions, a new pose key, a
   new defaulted world field — unreachable by existing callers.

### 7.2 Review tests (BCR-4)

Concrete checks that make the claim falsifiable. No tooling required; the runtime
checks run in the browser console.

| ID | Type | Test | Pass condition |
|---|---|---|---|
| **R-1** | Static | Diff `js/entities/enemy.js` against baseline `84257ea` | Exactly one changed hunk, textually matching the ASM-001 specimen in §3.2 |
| **R-2** | Static | Diff every other existing file | Only additions — no changed line inside any pre-existing function body |
| **R-3** | Runtime | `['knifeman','swordsman','gunman','archer'].every(t => !('ctor' in Phefo.Enemies.registry[t]))` | `true` — the BCR-3 guard is intact |
| **R-4** | Runtime | For each of the four types, spawn one and check `Object.getPrototypeOf(e) === Phefo.Enemy.prototype && e.constructor === Phefo.Enemy` | `true` — construction is identical, not merely similar |
| **R-5** | Runtime | `Phefo.Enemies.registry.climber.ctor === Phefo.Climber` | `true` — the hook is used only by the new type |
| **R-6** | Observational | Validation checkpoint V-12 (§11) | All four types behave as before |

R-4 is the direct answer to "how review proves existing enemy construction remains
identical": it asserts prototype and constructor **identity**, which would fail
immediately if ASM-001 ever resolved to anything other than `P.Enemy` for an
existing type.

---

## 8. Data and Tuning Parameters

All tunables are `cfg` data or named constants, consistent with the codebase's
data-driven type model.

| Parameter | Purpose | Proposed | Basis |
|---|---|---|---|
| `cfg.climbSpeed` | Vertical px/s while attached | ~90 | Slower than its ~130 ground speed; the climb should read as committed and punishable (BD-006) |
| `cfg.ladderRange` | "Reasonably close" (BR-10) | ~240 | Below existing aggro ranges (400–680) so it never out-reaches its own awareness |
| `LEVEL_TOL` | Plane-matching tolerance | ~24 px | Above foot-snap jitter, far below the 128 px platform separation |
| `MOUNT_TOL` | Alignment needed to mount | ~8 px | Comfortably wider than one step at ground speed |
| `PLANE_DWELL` | Grounded time before a plane change is accepted (§5.5.2) | ~0.20 s | Longer than a corner clip; shorter than a deliberate landing |
| `cfg.hp` | Fragility (BR-11) | ~34 | Below knifeman's 42 |
| `cfg.speed` | Ground speed | ~132 | Marginally above knifeman's 124 — agile |
| `cfg.scale` | Smaller build (BR-12) | ~0.90 | Below knifeman's 0.97 |
| `cfg.weapon` | (BR-11, BR-18) | `'knife'` | Existing weapon, unchanged |

Starting points for tuning during validation, not acceptance criteria.

---

## 9. Alternatives Considered and Rejected

| # | Alternative | Why rejected |
|---|---|---|
| A-1 | Add climb states to `Enemy.prototype.update` | Contradicts C-1. Every existing type would execute the new branches every step; "unchanged" would rest on testing rather than structure. CSU R1 realised. |
| A-2 | Ladders as one-way solids in `def.solids` | Reuses existing collision, but `solids` is read by every entity and projectile — changes physics for the player and all existing enemies. Violates C-1, C-5. |
| A-3 | `gravityScale = 0` while climbing | Leaves `moveAndCollide` resolving collisions, snapping the climber onto the one-way platforms a ladder must pass through. §5.6. |
| A-4 | Raise the 120px limit with a per-type opt-out | Inverts the risk — existing types would depend on the opt-out being correct. C-2 forbids it. |
| A-5 | General pathfinding / navigation graph | Out of scope in the Opportunity and unjustified: BR-10 confines the climber to a nearby ladder. |
| A-6 | A separate top-level entity type, not an `Enemy` | Loses combat, death, wave counting and rendering, all of which must behave identically (C-5, BR-01). |
| A-7 | Interrupt the climb on damage | Contradicts BR-08 and reintroduces the stuck-mid-ladder state C-4/C-7 exist to prevent. |
| **A-8** | **Patch `P.Enemies.spawn` from `climber.js` at load time** | Avoids editing `enemy.js`, but replaces a shared function at runtime: behaviour becomes load-order dependent and invisible to a reader of `enemy.js`. **Less reviewable than the one-line change it avoids.** (ARV-001) |
| **A-9** | **Compare raw `player.y` to ladder endpoints for elevation** | v1.0's approach. Unstable: a player jumping on the ground crosses platform-height coordinates every jump, and a player jumping *on* a platform momentarily leaves its plane. Causes false selection and spurious abandonment. Replaced by the supporting-surface model. (ARV-003) |
| **A-10** | **Add a `lastSupport` field to `Player`** | Would give a stable plane, but modifies player code for an enemy feature. Unnecessary — `groundRef` already persists (§5.5.1). (ARV-003) |

---

## 10. Level Authoring Rules

Rules an author must observe, arising from the decision to leave collision
untouched.

1. **A ladder must not intersect any non-one-way solid.** Climbers pass through
   geometry while attached; a ladder crossing a solid block would let one climb
   through a wall.
2. **`top` must equal the y of the upper surface** and `bottom` the y of the lower
   surface. These are exit positions, not decorative extents.
3. **`x` must be inset from a platform edge by ≥ 14 px.** `Enemy.walk` refuses to
   step where its probe (half-width + 7 px) finds no ground, so a ladder flush
   with an edge is unapproachable from above and descent would never trigger.
4. **Both endpoints must coincide with a real supporting surface** within
   `LEVEL_TOL`, since elevation is resolved from supporting surfaces (§5.5).
5. **Plane separation must exceed `LEVEL_TOL`** (~24 px) or the two ends are
   treated as the same level.
6. **A ladder is only useful within `ladderRange`** of where climbers spawn or
   fight (BR-10, BD-012).
7. **The introduction wave must place a climber within range of a visible ladder**
   (BD-012) or the teaching encounter will not occur.

---

## 11. Validation Approach (C-9)

BD-015 fixed validation as a recorded manual checklist; no test tooling is
introduced. Architecture contributes the observable checkpoints.

| # | Check | Traces to |
|---|---|---|
| V-01 | Climber approaches a ladder and mounts without stalling near it | §5.7, C-7 |
| V-02 | Ascends at a steady speed, arriving with feet on the surface | §5.6, §5.7 |
| V-03 | Descends when the player returns to ground | BR-09, C-3 |
| V-04 | Killed mid-climb, it detaches and falls to the ground | BR-06, §5.8 |
| V-05 | Never attacks while attached | BR-07 |
| V-06 | A climb completes even if the player leaves mid-climb | BR-08 |
| V-07 | Damage mid-climb does **not** interrupt or displace it | §5.8 |
| V-08 | Never becomes stuck at either ladder end | C-4, C-7 |
| V-09 | Crowded at a ladder base, climbers do not jitter or displace a climbing one | C-8, §5.10 |
| V-10 | Ignores a ladder that does not reach the player's plane | §5.5.3 |
| V-11 | Behaves as an ordinary ground enemy with no ladder in range | BR-10 |
| V-12 | **Each of the four existing types observed behaving as before** | **BR-01, C-1** |
| V-13 | Final wave, with the climber added, is completed successfully | BR-15 |
| V-14 | No new console errors | SC-11 |
| **V-15** | **Player jumping repeatedly on the ground never triggers a climb** | §5.5.5, ARV-003 |
| **V-16** | **Player jumping while on a platform does not abort an approach or climb** | §5.5.5, ARV-003 |
| **V-17** | **Player brushing a platform edge briefly does not trigger a climb** | `PLANE_DWELL`, ARV-003 |
| **V-18** | **A climber struck mid-climb flashes and the flash fades** (no permanent glow) | §5.12.2, ARV-002 |
| **V-19** | **A climber staggered mid-climb continues climbing, and stagger expires** | §5.12.2, ARV-002 |
| **V-20** | **After dismount the climber engages immediately** — no idle pause, no half-finished attack | §5.12.2 `stateT`/`alerted`, ARV-002 |
| **V-21** | **Knockback during a climb does not displace it from the ladder** | §5.8, ARV-002 |
| **V-22** | **Review tests R-1…R-5 pass** | §7.2, ARV-001 |
| **V-23** | **On reaching either endpoint the climber settles cleanly** — feet on the surface, gravity resumed, no hover and no sink | §5.7.1, ARV-005 |
| **V-24** | **A climber dismounting onto a one-way platform stays on it** and does not fall through as physics resumes | §5.7.1, ARV-005 |

**V-12 must never be skipped.** It is the only observational evidence for the
central promise, and BD-015 already records manual observation as its weakest
point (AR-7 in `business-understanding.md`).

---

## 12. Residual Risks

| # | Risk | Severity | Treatment |
|---|---|---|---|
| AR-1 | Ladder authored against the §10 rules misbehaves in ways that look like code defects | Medium | §10 rules explicit; V-01/V-08 exercise them |
| AR-2 | Kinematic movement bypasses collision, so a climber overlaps geometry mid-climb | Low | Intended; bounded by §10.1 |
| AR-3 | Damage not interrupting a climb may read as unresponsive | Low | Required by BR-08; V-07/V-19 make it a deliberate observation |
| AR-4 | ASM-001, though inert, is a shared-file modification | Low | BCR-registered; R-1/R-3/R-4 prove inertness |
| AR-5 | Tuning values in §8 are unvalidated estimates | Medium | Tuned during validation; not acceptance criteria |
| AR-6 | The climber fights identically to a knifeman once grounded | Accepted | Business-accepted (AR-5, `business-understanding.md`) |
| **AR-7** | **Standards are empty; this design is unassessed against them.** A future published standard may contradict it | Medium | §2.3; re-assessment required when standards are populated |
| **AR-8** | **The housekeeping contract (§5.12) is duplicated logic** — `tickCommon`, `recoil` decay and `blocking` reset are mirrored from the parent. Future changes to the parent's housekeeping would not propagate | Medium | Accepted deliberately: the alternative is modifying `Enemy.prototype.update` (A-1). §5.12.3 invariants define what must hold; V-18…V-21 test it |
| **AR-9** | **`PLANE_DWELL` adds latency** — a climber reacts up to ~0.2 s after the player settles on a new plane | Low | Deliberate; far below the time to walk to a ladder |
| **AR-10** | **`groundRef` is `undefined` before an entity's first landing** | Low | Handled explicitly: UNKNOWN plane → delegate to ordinary ground behaviour (§5.5.3) |

---

## 13. Traceability

### 13.1 Business rules

| Rule | Design element |
|---|---|
| BR-01 Existing enemies unchanged | §3, §7 |
| BR-02 Only the new type perceives upward | §5.5 |
| BR-03 Player cannot climb | No player code touched; §6.2 |
| BR-04 Ladders drawn plainly | §5.2 |
| BR-05 Damageable throughout | §5.8, §5.12 |
| BR-06 Falls when killed mid-climb | §5.8 |
| BR-07 Never attacks on a ladder | §5.8 |
| BR-08 A climb always completes | §5.4, §5.8 |
| BR-09 Two-way, never stranded | §5.4, §5.9 |
| BR-10 Only a nearby ladder | §5.5.3 |
| BR-11 Fast, fragile, knife | §8 |
| BR-12 Visually distinct | §5.11, §8 |
| BR-13 / BR-14 Wave placement | §6.2 DATA |
| BR-15 Final wave winnable | V-13 |
| BR-16 Reusable ladders | §5.1, §10 |
| BR-17 Ascent and descent together | §5.4 |
| BR-18 No new weapon | §8 |

### 13.2 Review findings

| Finding | Resolution | Sections |
|---|---|---|
| ARV-001 | Absolute rule withdrawn; BCR + ASM register introduced; `cfg.ctor` deliberately retained with alternatives assessed; identity review tests defined | §3, §5.3, §6.2, §7, §9 A-8 |
| ARV-002 | Housekeeping contract with per-field table, two modes, invariants, and full damaged/staggered/blocked/killed semantics | §5.8, §5.12, V-18…V-21, AR-8 |
| ARV-003 | Elevation resolved from supporting surfaces with a dwell filter; airborne cases tabulated; begin/abandon conditions defined; one-way and solid treated identically | §5.5, §9 A-9/A-10, V-15…V-17, AR-9/AR-10 |
| ARV-004 | Standards recorded as not established; approval scope qualified; `CLAUDE.md` named provisional | §2.3, AR-7 |
| ARV-005 | Single exit contract; DISMOUNT separated from CLIMB as detached-and-dynamic; housekeeping fixed at once per step, before mode dispatch | §5.4, §5.7.1, §5.12.1, §5.12.2, §5.12.3 inv. 5–6, V-23/V-24 |
| ARV-006 | Modified-file count corrected to 6; totals reconciliation table added | §6.2, §6.2.1 |

**All 18 business rules, all 9 approval conditions, and all 6 review findings are
addressed.**

---

## 14. Handed to Implementation

Decided here; not to be revisited during implementation:

- Subclass over shared-class modification (§5.3, A-1)
- `cfg.ctor` construction hook as the sole BCR-MOD (§3.2, ASM-001)
- Ladders outside `solids` (§5.1, A-2)
- Kinematic climbing, physics not run (§5.6, A-3)
- Elevation from supporting surfaces, never raw `y` (§5.5, A-9)
- The housekeeping contract and its invariants (§5.12)
- Delegation for death, combat and ground rendering (§5.8, §5.11)
- The change inventory and load order (§6)

Left to implementation:

1. Final tuning values within §8 ranges.
2. Rung spacing and rail styling for `drawLadders`.
3. Joint angles for `Poses.climb`.
4. Ladder placement in `level01_city`, per §10.
5. Exact wave composition, per BR-13/BR-14.
6. The written checklist derived from §11.

**Escalate to architecture** if implementation finds it needs a shared-function
modification that is not ASM-001, or one that cannot satisfy BCR-1…BCR-4. Adding
to the ASM register is an architecture decision, not an implementation one.

---

## 15. Architecture Review Resolution

### ARV-001 — Shared-function modification contradiction ✅ Resolved

| Requirement | Resolution |
|---|---|
| Retain or replace the mechanism deliberately | **Retained.** `cfg.ctor` is kept, with four alternatives assessed in §5.3 — including patching `spawn` at load time (§9 A-8), rejected as less reviewable than the change it avoids |
| Identify every approved shared-function modification explicitly | **§3.2 Approved Shared Modification Register.** Exactly one entry, ASM-001, with baseline and proposed forms quoted. The register is declared exhaustive |
| Replace the absolute rule with an enforceable backward-compatibility rule | **§3.1 BCR** — four conditions: registered, observationally identical for existing callers, guarded additive control flow, review-testable. The v1.0 "no function body changes" rule is withdrawn |
| Explain how review proves existing enemy construction remains identical | **§7.2 review tests R-1…R-6.** R-4 asserts prototype and constructor **identity** for all four existing types; R-3 asserts the BCR-3 guard is intact; R-1 bounds the diff to one hunk |

The contradiction is removed: the design no longer claims zero function-body
changes. It claims exactly one, registered and provably inert.

### ARV-002 — Inherited runtime-state housekeeping ✅ Resolved

| Requirement | Resolution |
|---|---|
| Define how inherited state advances in APPROACH / CLIMB / DISMOUNT | **§5.12.2** — a per-field table covering every field on `Entity` and `Enemy`, plus the three new Climber fields |
| Cover invulnerability, flash, stagger, block stun, death timing, animation timing, blocking, recoil, all timers | All present in §5.12.2. `tickCommon` is called every step of every climb state, which handles `animT`, `flash`, `stagger`, `invuln`, `blockStun`, `hitWall`; `recoil` is mirrored; `blocking` is forced false; `deathT` is owned solely by the parent's dead branch |
| Do not call ground AI, attacking, separation or physics while climbing | **§5.12.1 mode table.** DETACHED runs none of them. APPROACH deliberately keeps physics and separation, since the climber is an ordinary grounded enemy then |
| Prevent stale or permanently frozen values | **§5.12.3 invariants 1–2.** Every behaviourally significant timer decays in all modes; `stateT`, `fired` and `state` are reset via `setState('chase')` on dismount; `alerted` is set true so it engages immediately |
| Preserve vulnerability during climbing | **Invariant 3.** `invuln` is never written by climbing; `blocking` forced false, making the block branch unreachable |
| Explain damaged / staggered / blocked / killed while attached | **§5.8 table** — six rows covering damage, knockback, stagger, block, invulnerability and death, each with rationale |

New validation checkpoints V-18…V-21 test the observable consequences. Residual
risk AR-8 records the duplication this contract introduces, and why it is
preferred to modifying the parent.

### ARV-003 — Stable elevation detection ✅ Resolved

| Requirement | Resolution |
|---|---|
| Base elevation on a supporting surface, not transient y | **§5.5.1.** Elevation is `groundRef.y` — the surface last stood on. Raw `y` is never used for elevation |
| How the player's elevation is determined | **§5.5.1–5.5.2.** From `player.groundRef`, filtered through the climber's own `observedSupport` with a `PLANE_DWELL` requirement. **No field is added to `Player`** (§9 A-10) |
| How the climber's elevation is determined | **§5.5.2.** From its own `groundRef`; no filter needed, as it is grounded whenever a climb decision is taken |
| Behaviour while the player is jumping or falling | **§5.5.5** — six scenarios tabulated. `observedSupport` is untouched while airborne, so jumping neither triggers nor aborts anything |
| When APPROACH begins or is abandoned | **§5.5.4** — explicit begin, continue, abandon and commit conditions. Abandonment applies to APPROACH only; CLIMB is never abandoned (BR-08) |
| How false selection from airborne movement is prevented | **§5.5.5.** `groundRef` does not change mid-air, and `PLANE_DWELL` absorbs momentary contacts. V-15…V-17 test all three cases |
| How ground and one-way platforms are identified consistently | **§5.5.1.** `moveAndCollide` sets `groundRef` in the shared landing branch for both kinds; the one-way guards decide only *whether* a landing occurs. The design must not special-case `oneWay` when reasoning about elevation |

### ARV-004 — Standards qualification ✅ Resolved

| Requirement | Resolution |
|---|---|
| Record that standards files are empty | **§2.3** — all 32 files under `engineering/project-context/` are 0 bytes, stated in the inputs table and in its own constraints section |
| Approval must not imply standards compliance | **§2.3 point 2** — approval certifies only satisfaction of the Business Approval conditions and business rules, explicitly not standards compliance |
| `CLAUDE.md` remains the provisional governing convention | **§2.3 point 3**, with the conventions it supplies enumerated. Point 4 requires re-assessment once standards are populated; tracked as risk AR-7 |

### ARV-005 — DISMOUNT physics contradiction ✅ Resolved

Version 1.1 said DISMOUNT resumed physics in the state diagram (§5.4) while the
housekeeping mode table (§5.12.1) grouped it with CLIMB as physics-off. The
contradiction is removed by recognising that the meaningful distinction is
**attached vs detached**, not climb vs ground: **CLIMB is the only attached,
kinematic mode; DISMOUNT is detached and dynamic.**

| Required element of the contract | Where it is now stated |
|---|---|
| CLIMB remains kinematic and does not run physics | §5.4 diagram, §5.12.1 (CLIMB is the only ❌ physics row) |
| On reaching an endpoint, clamp the entity to the endpoint | §5.7.1 step 2 |
| Clear ladder attachment | §5.7.1 step 3 |
| Enter DISMOUNT | §5.7.1 step 4 |
| Resume normal physics during DISMOUNT | §5.7.1 step 5; §5.12.1 DISMOUNT row marked ✅ dynamic |
| Verify footing | §5.7.1 step 6 |
| Return to ground mode using `setState('chase')` | §5.7.1 step 7 |
| Housekeeping executed exactly once during the transition | §5.12.1 — performed at the top of `Climber.update` before mode dispatch; §5.12.3 invariant 5 |

**Artefacts updated:**

| Artefact | Change |
|---|---|
| State diagram (§5.4) | DISMOUNT now shows *DETACHED · dynamic · physics: YES*; the CLIMB → DISMOUNT edge lists the three same-step actions; a note records that DISMOUNT is a one-step transition |
| Housekeeping mode table (§5.12.1) | Split into four rows with an explicit **Attachment** column; DISMOUNT separated from CLIMB |
| Per-field contract (§5.12.2) | `vx`/`vy`, `onGround`, `groundRef` and `dropThrough` rows rewritten to distinguish CLIMB from DISMOUNT |
| Entry/exit safety (§5.7) | New §5.7.1 normative seven-step exit contract, covering both endpoints |
| Invariants (§5.12.3) | Added inv. 5 (housekeeping exactly once per step) and inv. 6 (never simultaneously attached and dynamic) |
| Validation (§11) | Added **V-23** (clean settle at either endpoint) and **V-24** (dismount onto a one-way platform does not fall through) |

**A correctness argument surfaced while resolving this.** The clamp must precede
the physics pass. `moveAndCollide` captures `wasBottom = e.y` on entry and uses it
in the one-way guard `if (wasBottom > t.y + 1) continue`. Clamping first makes
`wasBottom === t.y`, so the landing is accepted; resuming physics before clamping
would leave `wasBottom` mid-ladder and the guard would reject the landing,
dropping the climber back down. The step ordering in §5.7.1 is therefore
load-bearing, and V-24 exists to confirm it empirically.

### ARV-006 — Change inventory count ✅ Resolved

§6.2 was titled *Modified files (5)* while listing six rows. Corrected to **6**.

All inventory totals were then re-counted against the tables rather than assumed:

| Measure | Stated | Verified |
|---|---|---|
| New files (§6.1) | 2 | ✅ 2 rows |
| Modified files (§6.2) | ~~5~~ → **6** | ✅ 6 rows — `enemy.js`, `level.js`, `poses.js`, `game.js`, `level01_city.js`, `index.html` |
| Total files touched | — | **8** (2 + 6) |
| BCR-MOD entries (§3.2) | 1 | ✅ ASM-001 only |

A new **§6.2.1 Inventory totals** table records the reconciliation, including a
category breakdown (1 BCR-MOD · 4 ADDITIVE · 1 DATA · 2 NEW) and an explicit note
that `index.html` counts as modified even though its change is additive. The
miscount arose in v1.0 when `index.html` was listed without being counted; the
totals table exists so the two cannot drift apart again.

### Summary

| Finding | Raised in | Status |
|---|---|---|
| ARV-001 Shared-function modification contradiction | Review of v1.0 | ✅ Resolved in v1.1 |
| ARV-002 Inherited runtime-state housekeeping | Review of v1.0 | ✅ Resolved in v1.1 |
| ARV-003 Stable elevation detection | Review of v1.0 | ✅ Resolved in v1.1 |
| ARV-004 Standards qualification | Review of v1.0 | ✅ Resolved in v1.1 |
| ARV-005 DISMOUNT physics contradiction | Review of v1.1 | ✅ Resolved in v1.2 |
| ARV-006 Change inventory count | Review of v1.1 | ✅ Resolved in v1.2 |

**All six review findings are resolved.** No application source code was modified
in producing this revision.

---

**Status:** 🟡 Awaiting Architecture Approval
**Next:** `approvals/architecture-approval.md`, then Implementation Planning.
