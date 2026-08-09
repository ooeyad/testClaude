# EO-001 — Implementation Plan

**Opportunity:** EO-001 — Add Ladder-Climbing Enemy
**Lifecycle Stage:** Implementation Planning
**Conversation:** CONV-004 — Implementation Planning
**Role:** ROLE-003 — Technical Team Lead
**Repository root (game):** `phefo/`
**Baseline:** `main` @ `84257ea`
**Architecture:** v1.2 — **Approved**
**Business:** **Approved**
**Version:** 1.0
**Status:** 🟡 Awaiting Implementation Approval

> **This plan produces no code.** It defines execution order, work-package
> boundaries, validation gates and rollback. No source file is modified by this
> document, and no architectural decision is made in it.

### Path note

The runbook referenced artifacts under
`engineering/projects/phefo/opportunities/…`. **That tree does not exist.** All
artifacts were read from their actual location,
`engineering/opportunities/EO-001-add-ladder-climbing-enemy/…`, and this plan is
written there. Creating a `projects/phefo/` tree would produce a third parallel
opportunity folder; consolidating onto one was the purpose of PR #7. Migration to
that layout is available on request as a separate change.

### Inputs consumed

| Artifact | Status |
|---|---|
| `opportunity.md` | Read |
| `project-context-review.md` | Read |
| `business-understanding.md` — BR-01…BR-18, AR-1…AR-10 | Read |
| `approvals/business-approval.md` — 9 conditions | Read |
| `architecture/architecture-design.md` v1.2 — ASM-001, V-01…V-24, R-1…R-6 | Read |
| `approvals/architecture-approval.md` — 12 locked decisions, 8 conditions | Read |
| `project-context/standards/**` | **0 of 32 files populated.** No standard constrains this plan; `CLAUDE.md` is the provisional convention (architecture §2.3) |

---

## 1. Implementation Objective

Deliver the approved Architecture v1.2 as a working ladder-climbing enemy in
`phefo/`, in increments small enough that **every step is independently
reviewable, independently validated, and independently revertible**, while the
behaviour of the four existing enemy types is protected continuously rather than
only at the end.

The plan is optimised for **risk reduction, not speed**. Its central device is
ordering: every change that cannot affect existing behaviour is landed and
validated *before* the single change that could (ASM-001), and the new enemy is
proven behaviourally identical to an existing type *before* any climbing
capability is added to it.

---

## 2. Scope

| # | In scope |
|---|---|
| S-1 | Ladder domain model and authoring API in level data |
| S-2 | Ladder rendering |
| S-3 | Ladder placement in `level01_city` |
| S-4 | ASM-001 — the approved constructor hook in `P.Enemies.spawn` |
| S-5 | `World.ladders` exposure |
| S-6 | `Climber` class, its type-data block, and script load order |
| S-7 | Elevation model — supporting-surface resolution and the observed-plane filter |
| S-8 | Ladder selection and the APPROACH state |
| S-9 | Ascent — CLIMB, the exit contract, and the housekeeping contract |
| S-10 | Climb pose |
| S-11 | Descent |
| S-12 | Wave placement for the climber |
| S-13 | Tuning within Architecture §8 ranges |
| S-14 | The written validation checklist and recorded evidence |

## 3. Out of Scope

| # | Out of scope | Authority |
|---|---|---|
| X-1 | Any change to `physics.js`, `hitbox.js`, `weapons.js`, `input.js`, `camera.js`, `stickman.js`, `fx.js`, `entity.js`, `phefo.js`, `projectile.js`, `pickup.js` | Arch §6.2; Approval decision 12 |
| X-2 | Any change to the four existing `entities/enemies/*.js` | BR-01 |
| X-3 | Any shared-function modification other than ASM-001 | Approval decision 2; §128 of the approval |
| X-4 | Player climbing or any player-behaviour change | BR-03; Approval decision 10 |
| X-5 | Raising or altering the 120px awareness rule | C-2; Approval decision 7 |
| X-6 | Adding ladders to `def.solids` | Approval decision 3 |
| X-7 | New weapons or weapon-table changes | BR-18 |
| X-8 | Automated test tooling | BD-015 |
| X-9 | Populating `project-context/standards/` | Separate opportunity |
| X-10 | Any architectural decision | Approval condition 7 |

---

## 4. Implementation Strategy

### 4.1 Five sequenced principles

1. **Inert before consequential.** Everything that cannot alter existing
   behaviour (ladder model, rendering, placement) lands first. By the time
   ASM-001 is touched, the repository is already known-good with ladders present.
2. **Isolate the one risky change.** ASM-001 is a work package on its own, with
   no other change in the same commit, so it can be reviewed and reverted alone.
3. **Prove equivalence before adding capability.** The `Climber` first ships as a
   pure delegating subclass that fights exactly like a knifeman. If that is
   indistinguishable from an existing enemy, subclassing and ASM-001 are both
   validated before a single line of climbing logic exists.
4. **One architectural area per package.** No package touches level data *and*
   enemy behaviour, or rendering *and* physics-adjacent logic.
5. **Continuous protection of existing behaviour.** Gate G-x after every package
   re-checks the four existing types. Regression is detected at the package that
   caused it, not at the end.

### 4.2 Branch and commit model

Reconciles the runbook's "small incremental commits" with the `CLAUDE.md`
workflow (a commit request implies branch → commit → push → PR):

- **One feature branch** for the whole opportunity: `feat/eo-001-ladder-climbing-enemy`, cut from `origin/main`.
- **One commit per work package**, subject-line prefixed `EO-001 WP-nn:`.
- **One pull request** at the end, whose commit history is the audit trail — each
  work package individually reviewable and individually revertible.

Rationale: a PR per package would produce 13 PRs against a 5-file change set and
obscure rather than aid review; a single squashed commit would destroy
revertibility. One branch, thirteen commits, one PR preserves both.

### 4.3 Stop conditions

Implementation halts immediately and returns to Architecture if any of these
occur (Approval condition 7):

| # | Stop condition |
|---|---|
| ST-1 | A shared-function modification beyond ASM-001 appears necessary |
| ST-2 | A file outside the approved change inventory must be modified |
| ST-3 | Any of review tests R-1…R-5 fails |
| ST-4 | An existing enemy type behaves differently at any gate |
| ST-5 | An architecture assumption proves false — notably that `groundRef` persists and is set identically for solids and one-way platforms |
| ST-6 | The exit contract cannot be honoured in the order specified (clamp → detach → physics) |

**No architectural decision may be taken to work around a stop condition.**

---

## 5. Implementation Order

Ordered by *risk exposure*, lowest first. The column that matters is "Can this
affect existing behaviour?" — every **No** is landed before the single **Yes**.

| Order | WP | Area | Category | Can affect existing behaviour? |
|---|---|---|---|---|
| 1 | WP-01 | Level authoring | ADDITIVE | No — new function, no caller |
| 2 | WP-02 | Rendering | ADDITIVE | No — draws nothing without data |
| 3 | WP-03 | Level data | DATA | No — ladders are inert scenery |
| 4 | WP-04 | Shared construction | **BCR-MOD** | **Yes — the only such package** |
| 5 | WP-05 | World plumbing | ADDITIVE | No — defaulted field |
| 6 | WP-06 | New entity type | NEW | No — new type, not yet placed in waves |
| 7 | WP-07 | Climber internals | NEW | No |
| 8 | WP-08 | Climber internals | NEW | No |
| 9 | WP-09 | Climber internals | NEW | No |
| 10 | WP-10 | Rendering | ADDITIVE | No — new pose key |
| 11 | WP-11 | Climber internals | NEW | No |
| 12 | WP-12 | Level data | DATA | Gameplay only — wave difficulty |
| 13 | WP-13 | Tuning & evidence | DATA / docs | No |

---

## 6. Work Packages

### WP-01 — Ladder domain model

| | |
|---|---|
| **Purpose** | Introduce the `Ladder` structure and the `P.Levels.ladder(x, top, bottom)` authoring constructor, mirroring the existing `solid()` / `platform()` API. Nothing consumes it yet. |
| **Files affected** | `phefo/js/levels/level.js` *(ADDITIVE)* |
| **Complexity** | **Low** — one pure function returning an object literal |
| **Dependencies** | None. First package. |
| **Risks** | Negligible. The only meaningful error would be adding the ladder to `solids`, which Approval decision 3 forbids and G-01 checks. |
| **Expected output** | `Phefo.Levels.ladder` exists and returns `{x, top, bottom}`. Game behaviour bit-for-bit unchanged. |
| **Validation checkpoint** | **G-01** |

### WP-02 — Ladder rendering

| | |
|---|---|
| **Purpose** | Add `P.Levels.drawLadders(ctx, def, cam)` and call it from `World.draw` immediately after `drawSolids`, before pickups. |
| **Files affected** | `phefo/js/levels/level.js` *(ADDITIVE)*, `phefo/js/core/game.js` *(ADDITIVE — one call)* |
| **Complexity** | **Low–Medium** — canvas drawing plus one correctly-placed call |
| **Dependencies** | WP-01 |
| **Risks** | Draw-order error placing ladders over actors; missing x-range culling; the call site being placed outside the camera transform, which would render ladders in screen space. |
| **Expected output** | With no ladder data, the call is a no-op and the game is visually identical. |
| **Validation checkpoint** | **G-02** |

### WP-03 — Ladder placement in `level01_city`

| | |
|---|---|
| **Purpose** | Author the level's ladders per Architecture §10 — ladders become visible, still with no behaviour attached. |
| **Files affected** | `phefo/js/levels/level01_city.js` *(DATA)* |
| **Complexity** | **Medium** — geometry judgement against seven authoring rules |
| **Dependencies** | WP-01, WP-02 |
| **Risks** | The highest-yield risk in the plan. Rule violations (intersecting a solid, endpoints not on real surfaces, `x` flush with a platform edge) produce symptoms that look like code defects later. AR-1. |
| **Expected output** | Ladders visible in-game, correctly aligned to platform and road surfaces. All existing behaviour unchanged — they are scenery at this point. |
| **Validation checkpoint** | **G-03** |

### WP-04 — ASM-001 constructor hook

| | |
|---|---|
| **Purpose** | Apply the single approved shared-function modification: `P.Enemies.spawn` resolves `cfg.ctor \|\| P.Enemy`. |
| **Files affected** | `phefo/js/entities/enemy.js` *(**BCR-MOD — ASM-001**)* |
| **Complexity** | **Low** to write, **highest scrutiny** to review |
| **Dependencies** | None technically — deliberately sequenced here so it lands alone, into a repository already validated with ladders present |
| **Risks** | The only change in the plan that can affect existing enemy construction. Mitigated by isolation (nothing else in the commit) and by review tests R-1…R-4. AR-4. |
| **Expected output** | Diff is exactly one hunk matching the Architecture §3.2 specimen. No new type exists yet, so `cfg.ctor` is `undefined` for every registry entry and behaviour is provably unchanged. |
| **Validation checkpoint** | **G-04 — the strictest gate in the plan** |

### WP-05 — World ladder exposure

| | |
|---|---|
| **Purpose** | `World.ladders = def.ladders \|\| []`, giving the climber a read path to ladder data. |
| **Files affected** | `phefo/js/core/game.js` *(ADDITIVE)* |
| **Complexity** | **Low** |
| **Dependencies** | WP-01 |
| **Risks** | Omitting the `\|\| []` default would break any level without ladders. |
| **Expected output** | `world.ladders` is an array; populated for `city01`, `[]` elsewhere. No behaviour change. |
| **Validation checkpoint** | **G-05** |

### WP-06 — Climber skeleton, registration and load order

| | |
|---|---|
| **Purpose** | The equivalence milestone. Create `Climber` as a pure delegating subclass of `Enemy` — **no climbing logic** — plus its type-data block and script tags. It must fight exactly like a knifeman. |
| **Files affected** | `phefo/js/entities/climber.js` *(NEW)*, `phefo/js/entities/enemies/climber.js` *(NEW)*, `phefo/index.html` *(ADDITIVE — 2 script tags)* |
| **Complexity** | **Medium** — prototype wiring and load-order discipline |
| **Dependencies** | WP-04 (ASM-001 must exist for `cfg.ctor` to be honoured) |
| **Risks** | Load-order error captures `undefined` at IIFE time and fails later with a misleading error (Arch §6.3). Prototype misconfiguration (`constructor` not reset) would break R-4-style identity reasoning for the new type. |
| **Expected output** | A climber can be spawned manually (`Phefo.Enemies.spawn('climber', x, y)`) and is behaviourally indistinguishable from a knifeman. Not yet in any wave. |
| **Validation checkpoint** | **G-06** |

### WP-07 — Elevation model

| | |
|---|---|
| **Purpose** | Implement supporting-surface elevation and the observed-plane filter (`observedSupport`, `candidateSupport`, `candidateT`, `PLANE_DWELL`) per Architecture §5.5.1–5.5.2. **Observation only — no behaviour change.** |
| **Files affected** | `phefo/js/entities/climber.js` *(NEW)* |
| **Complexity** | **Medium–High** — the subtlest logic in the plan |
| **Dependencies** | WP-05, WP-06 |
| **Risks** | Depends on the architecture assumption that `groundRef` persists and is set identically for solids and one-way platforms — **ST-5**. Using raw `y` anywhere here reintroduces ARV-003. `groundRef` is `undefined` before first landing (AR-10) and must be handled as UNKNOWN. |
| **Expected output** | The climber tracks a stable player plane, observable via console inspection. It still behaves exactly as in WP-06. |
| **Validation checkpoint** | **G-07** |

### WP-08 — Ladder selection and APPROACH

| | |
|---|---|
| **Purpose** | Implement the selection rule (Arch §5.5.3) and the APPROACH state with its begin/continue/abandon conditions (§5.5.4). The climber walks to a ladder base and stops. **It does not mount.** |
| **Files affected** | `phefo/js/entities/climber.js` *(NEW)* |
| **Complexity** | **Medium** |
| **Dependencies** | WP-07 |
| **Risks** | Both ladder endpoints must be checked or the climber will approach ladders that do not reach the player. APPROACH must remain abandonable (only CLIMB is committed). Separation and physics must still run in APPROACH — it is an ordinary grounded enemy at this point. |
| **Expected output** | With the player on a platform, a climber walks to the ladder base and waits there. With the player on its own plane it fights normally. |
| **Validation checkpoint** | **G-08** |

### WP-09 — Ascent: CLIMB, exit contract and housekeeping

| | |
|---|---|
| **Purpose** | The core package. Kinematic ascent (§5.6), the seven-step exit contract (§5.7.1) and the full housekeeping contract (§5.12). Grouped because a climb with no exit is not a testable increment. |
| **Files affected** | `phefo/js/entities/climber.js` *(NEW)* |
| **Complexity** | **High** — the highest in the plan |
| **Dependencies** | WP-08 |
| **Risks** | Physics must not run while attached. **Clamp must precede the physics pass** or `wasBottom` leaves the one-way guard rejecting the landing and the climber drops back down — ST-6. Housekeeping must run exactly once per step, at the top of `update`, before mode dispatch, or a step crossing CLIMB → DISMOUNT skips or doubles it. Missing `tickCommon` freezes `flash`, `stagger`, `invuln`, `blockStun`. |
| **Expected output** | A climber ascends, arrives with feet on the platform, resumes normal combat immediately, and remains vulnerable and non-attacking throughout. |
| **Validation checkpoint** | **G-09 — the widest gate** |

### WP-10 — Climb pose

| | |
|---|---|
| **Purpose** | Add `Poses.climb(phase)` and override `Climber.prototype.pose` to use it while attached, delegating to the parent otherwise. |
| **Files affected** | `phefo/js/render/poses.js` *(ADDITIVE)*, `phefo/js/entities/climber.js` *(NEW)* |
| **Complexity** | **Medium** — joint angles are iterative to get right |
| **Dependencies** | WP-09 |
| **Risks** | Cosmetic only. The override must delegate on the ground path or ground appearance diverges from the parent. |
| **Expected output** | A climbing figure reads as climbing rather than falling. No shadow while attached (`onGround` false). |
| **Validation checkpoint** | **G-10** |

### WP-11 — Descent

| | |
|---|---|
| **Purpose** | Enable the inverted direction through the same machine — no separate descent path. |
| **Files affected** | `phefo/js/entities/climber.js` *(NEW)* |
| **Complexity** | **Medium** |
| **Dependencies** | WP-09 |
| **Risks** | Approaching a ladder top requires standing on the platform, and `Enemy.walk` refuses to step where its probe finds no ground — a ladder too close to an edge is unapproachable from above (Arch §10.3). Descent completes the stranding guarantee (C-4); without it the climber can strand and block wave completion. |
| **Expected output** | The climber descends when the player returns to ground and resumes pursuit. It cannot be stranded. |
| **Validation checkpoint** | **G-11** |

### WP-12 — Wave placement

| | |
|---|---|
| **Purpose** | Introduce the climber alone in a middle wave, then add it to later waves (BR-13, BR-14, BD-012, BD-019). |
| **Files affected** | `phefo/js/levels/level01_city.js` *(DATA)* |
| **Complexity** | **Low** to write, **Medium** to balance |
| **Dependencies** | WP-11 |
| **Risks** | Later waves become harder by design; the final wave must remain winnable (BR-15). The introduction encounter must occur within range of a visible ladder or the teaching moment does not happen (Arch §10.7). |
| **Expected output** | Climber introduced alone in a mid wave and added to later waves. |
| **Validation checkpoint** | **G-12** |

### WP-13 — Tuning, checklist and evidence

| | |
|---|---|
| **Purpose** | Tune within Architecture §8 ranges, author the validation checklist from V-01…V-24, execute it, and record evidence. |
| **Files affected** | `phefo/js/entities/enemies/climber.js` *(DATA — cfg values)*, `engineering/.../evidence/*` *(docs)* |
| **Complexity** | **Medium** — judgement, not code |
| **Dependencies** | WP-12 |
| **Risks** | Tuning drifting outside approved ranges without recording it (Approval condition 6). Skipping V-12. |
| **Expected output** | A completed, recorded checklist and final tuning values. |
| **Validation checkpoint** | **G-13 — full checklist** |

---

## 7. Shared File Modifications

Every **existing** file this implementation may modify. Any file not listed here
is out of scope (X-1, X-2; Approval decision 12).

| # | File | WP | Category | ASM reference | Nature of change |
|---|---|---|---|---|---|
| 1 | `phefo/js/entities/enemy.js` | WP-04 | **BCR-MOD** | **ASM-001** | `spawn` resolves `cfg.ctor \|\| P.Enemy` — the sole approved shared-function body change |
| 2 | `phefo/js/levels/level.js` | WP-01, WP-02 | ADDITIVE | — | New `ladder()` and `drawLadders()` functions |
| 3 | `phefo/js/core/game.js` | WP-02, WP-05 | ADDITIVE | — | `World.ladders` default; one `drawLadders` call |
| 4 | `phefo/js/render/poses.js` | WP-10 | ADDITIVE | — | New `climb(phase)` table key |
| 5 | `phefo/js/levels/level01_city.js` | WP-03, WP-12 | DATA | — | Ladder placement; wave composition |
| 6 | `phefo/index.html` | WP-06 | ADDITIVE | — | Two `<script>` tags in the entities block |

**Total modified files: 6.** Exactly one is a BCR-MOD (ASM-001). Matches
Architecture §6.2.1.

**Explicitly not modified:** `physics.js`, `hitbox.js`, `weapons.js`, `input.js`,
`camera.js`, `stickman.js`, `fx.js`, `entity.js`, `phefo.js`, `projectile.js`,
`pickup.js`, and all four existing `entities/enemies/*.js`.

---

## 8. New Files

| # | File | WP | Contents |
|---|---|---|---|
| 1 | `phefo/js/entities/climber.js` | WP-06 … WP-11 | `Climber` class — subclass, elevation model, climb machine, kinematic movement, exit contract, housekeeping, pose override |
| 2 | `phefo/js/entities/enemies/climber.js` | WP-06, WP-13 | `P.Enemies.define({ type:'climber', ctor:P.Climber, … })` — data only, matching peer files |

**Total new files: 2. Total files touched: 8.** Matches Architecture §6.2.1.

**Load order** (Architecture §6.3, mandatory): `entities/climber.js` after
`entities/enemy.js`; `entities/enemies/climber.js` after `entities/climber.js`.
Both inside the existing `<!-- entities -->` block, before `<!-- levels -->`.

---

## 9. Implementation Sequence

Exact execution order. Each row is one commit; each gate must pass before the
next package begins.

```
 0.  git fetch origin
     git switch -c feat/eo-001-ladder-climbing-enemy origin/main
 ─────────────────────────────────────────────────────────────────────────
 1.  WP-01  Ladder domain model              level.js                → G-01
 2.  WP-02  Ladder rendering                 level.js, game.js       → G-02
 3.  WP-03  Ladder placement                 level01_city.js         → G-03
 4.  WP-04  ASM-001 constructor hook         enemy.js                → G-04  ◀ isolated
 5.  WP-05  World ladder exposure            game.js                 → G-05
 6.  WP-06  Climber skeleton + registration  climber.js ×2, index.html → G-06 ◀ equivalence
 7.  WP-07  Elevation model                  climber.js              → G-07
 8.  WP-08  Ladder selection + APPROACH      climber.js              → G-08
 9.  WP-09  Ascent: CLIMB + exit + keeping   climber.js              → G-09 ◀ core
10.  WP-10  Climb pose                       poses.js, climber.js    → G-10
11.  WP-11  Descent                          climber.js              → G-11
12.  WP-12  Wave placement                   level01_city.js         → G-12
13.  WP-13  Tuning, checklist, evidence      enemies/climber.js, evidence/ → G-13
 ─────────────────────────────────────────────────────────────────────────
14.  Push branch; open one PR; human review (§15); merge on approval
```

Commit subjects: `EO-001 WP-nn: <purpose>`. WP-04's commit must contain **nothing
but** the ASM-001 hunk.

---

## 10. Rollback Strategy

### 10.1 Principles

- **Package-level revert.** One commit per package means `git revert <sha>`
  undoes exactly one responsibility.
- **No force-push on the feature branch** while review is in progress — history is
  the audit trail.
- **Nothing reaches `main` until the whole plan passes**, so `main` is never in a
  partially implemented state.

### 10.2 Per-package revertibility

| WP | Independently revertible? | Note |
|---|---|---|
| WP-01 | ✅ | Nothing depends on it until WP-02 |
| WP-02 | ✅ | Reverts to no ladder rendering |
| WP-03 | ✅ | Data only; ladders disappear |
| WP-04 | ⚠️ **Only before WP-06** | After WP-06 the climber's `cfg.ctor` is ignored and it silently constructs as a plain `Enemy` — a **silent** failure. Revert WP-06 first, or revert both together |
| WP-05 | ⚠️ Only before WP-07 | The climber reads `world.ladders` |
| WP-06 | ✅ | Removes the type; the ASM-001 hook becomes inert again |
| WP-07…WP-11 | ✅ in reverse order | Each builds on the previous; revert LIFO |
| WP-12 | ✅ | Data only; the climber leaves the waves |
| WP-13 | ✅ | Tuning and documents |

### 10.3 Full abort

`git switch main && git branch -D feat/eo-001-ladder-climbing-enemy`. Because
`main` is untouched throughout, abort is total and costless at any point.

### 10.4 Emergency criterion

If any gate shows an existing enemy behaving differently and the cause is not
identified within one package's work, **revert to the last passing gate** rather
than debugging forward. Existing behaviour is the protected asset (BR-01).

---

## 11. Risk During Implementation

| # | Risk | Likelihood | Impact | Mitigation | Owner |
|---|---|---|---|---|---|
| IR-01 | ASM-001 alters existing construction | Low | **Critical** | Isolated in WP-04; R-1…R-4 at G-04; revert is one commit | Implementer |
| IR-02 | Load-order error causes a late, misleading failure | Medium | High | Arch §6.3 order mandated; G-06 checks `Phefo.Climber` is defined at load | Implementer |
| IR-03 | Ladder authored against §10 rules; symptoms look like code defects | **High** | Medium | §10 rules restated in WP-03; G-03 inspects geometry before any behaviour exists | Implementer |
| IR-04 | `groundRef` assumption false (ST-5) | Low | **Critical** | Verified in discovery (`physics.js:85`, set for solids and one-way alike, never cleared); re-verified at G-07; **stop and escalate** if false | Tech Lead |
| IR-05 | Clamp/physics ordering inverted at dismount | Medium | High | Called out in WP-09; V-24 detects it; ST-6 | Implementer |
| IR-06 | Housekeeping missed → frozen `flash`/`stagger`/`invuln` | Medium | Medium | Per-field contract Arch §5.12.2; V-18…V-21 at G-09 | Implementer |
| IR-07 | Climber strands and blocks wave completion | Low | High | Descent (WP-11) is mandatory and may not be deferred (BR-17); G-11 | Tech Lead |
| IR-08 | Scope creep into an unapproved file | Medium | High | §7 list is exhaustive; every gate re-checks `git diff --name-only`; ST-2 | Reviewer |
| IR-09 | Tuning drifts outside Architecture §8 ranges silently | Medium | Low | Approval condition 6 requires recording; G-13 | Implementer |
| IR-10 | Final wave becomes unwinnable | Medium | Medium | BR-15; V-13 at G-12 | Tech Lead |
| IR-11 | An architectural decision is taken during implementation | Low | **Critical** | Approval condition 7; stop conditions §4.3; §15 escalation | Tech Lead |

---

## 12. Validation Gates

Every gate has two halves. **Verify** is what must be observed to pass.
**Must not change** is the regression surface — checked at *every* gate, because
existing behaviour is protected continuously, not at the end.

**Universal invariants — re-checked at every gate G-01…G-13:**

| # | Invariant |
|---|---|
| U-1 | The game loads with **no new console errors** |
| U-2 | `git diff --name-only origin/main` lists **only** files from §7 and §8 |
| U-3 | No file outside the approved inventory is modified (ST-2) |
| U-4 | The player moves, jumps, drops through platforms, attacks and reloads as before |

| Gate | Verify | Must not change |
|---|---|---|
| **G-01** | `Phefo.Levels.ladder(0,-100,0)` returns `{x,top,bottom}`; `Phefo.Levels.solid` and `.platform` unaffected | Nothing observable. `def.solids` contains no ladder. Game visually identical |
| **G-02** | Game renders identically with no ladder data; the `drawLadders` call sits inside the camera transform, after `drawSolids`, before pickups | Draw order of solids, pickups, enemies, player, projectiles, FX |
| **G-03** | Ladders visible and correctly placed; each satisfies Arch §10 rules 1–5; endpoints coincide with real surfaces | **All gameplay.** Ladders are scenery — all four enemy types, player traversal and combat identical |
| **G-04** | **R-1** `enemy.js` diff is exactly one hunk matching Arch §3.2 · **R-2** no other existing function body changed · **R-3** no existing cfg defines `ctor` · **R-4** all four types spawn with `Object.getPrototypeOf(e) === Phefo.Enemy.prototype` and `e.constructor === Phefo.Enemy` | **Existing enemy construction and behaviour — the strictest check in the plan.** Play a full wave of each of the four types |
| **G-05** | `world.ladders` is an array, populated for `city01`; a level without `ladders` yields `[]` | Wave spawning, `World.draw`, `World.step` ordering |
| **G-06** | `Phefo.Climber` defined at load; `Phefo.Enemies.registry.climber.ctor === Phefo.Climber`; **R-5** passes; a manually spawned climber chases, telegraphs, attacks, staggers and dies **exactly like a knifeman** | Existing types. The climber is not yet in any wave, so shipped waves are unchanged |
| **G-07** | Console inspection shows a stable observed plane; it does **not** change while the player is airborne; it updates only after `PLANE_DWELL` on a new surface | Climber behaviour — still identical to WP-06. No movement change |
| **G-08** | Player on a platform → climber walks to the ladder base and stops. Player on its plane → normal combat. Ladder that does not connect the planes → ignored (**V-10**). No ladder in range → ordinary ground enemy (**V-11**) | Existing types; player behaviour; the climber's ground combat |
| **G-09** | **V-01, V-02, V-05, V-06, V-07, V-08, V-18…V-21, V-23, V-24** — ascends, arrives feet-on-surface, never attacks while attached, climb completes if the player leaves, damage does not interrupt or displace, flash fades, stagger expires, engages immediately on arrival, dismount onto a one-way platform does not fall through | Existing types. Physics for every other entity. Combat rules |
| **G-10** | Climbing figure reads as climbing; no contact shadow while attached; ground appearance identical to the parent | Every other pose — idle, walk, run, air, slash, shoot, telegraph, stagger, block, death |
| **G-11** | **V-03** descends when the player returns to ground; **V-04** killed mid-climb it falls and dies on the ground; **V-08** never stuck at either end; cannot be stranded | Ascent behaviour from G-09 |
| **G-12** | **V-13** final wave completed successfully; introduction wave places a climber within range of a visible ladder; **V-09** climbers crowded at a base do not jitter | Waves 1–3 composition where unchanged; existing enemy counts elsewhere |
| **G-13** | **Full checklist V-01…V-24 executed and recorded**, including **V-12** (all four existing types observed unchanged) and **V-22** (R-1…R-5) | Everything. This is the final regression sweep |

---

## 13. Definition of Done

EO-001 implementation is done when **all** hold:

| # | Criterion | Evidence |
|---|---|---|
| D-01 | All 13 work packages complete, each its own commit | Branch history |
| D-02 | All gates G-01…G-13 passed | Gate record |
| D-03 | V-01…V-24 executed and recorded | Checklist |
| D-04 | **V-12 executed** — four existing types observed unchanged | Checklist |
| D-05 | **R-1…R-5 pass** | Review-test record |
| D-06 | Only the 6 modified + 2 new files touched | `git diff --name-only` |
| D-07 | ASM-001 is the only shared-function body change | `enemy.js` diff |
| D-08 | Final wave winnable with the climber added (BR-15) | Checklist V-13 |
| D-09 | No new console errors (SC-11) | Checklist V-14 |
| D-10 | Tuning values recorded, with deviations from Arch §8 noted | Evidence |
| D-11 | Deviations and failed assumptions recorded (Approval condition 6) | Evidence |
| D-12 | No architectural decision taken during implementation | Tech Lead attestation |
| D-13 | Single PR opened with per-package history | PR link |

---

## 14. Evidence Required

Recorded under `engineering/opportunities/EO-001-add-ladder-climbing-enemy/evidence/`.

| # | Artefact | Content | Produced at |
|---|---|---|---|
| E-01 | `validation-checklist.md` | V-01…V-24 as executable manual steps, with pass/fail and observations | Authored WP-13; drafted from WP-09 |
| E-02 | `review-tests.md` | R-1…R-5 with commands, expected and actual results | G-04, re-run at G-13 |
| E-03 | `gate-record.md` | One row per gate: date, result, observations, deviations | Every gate |
| E-04 | `tuning-record.md` | Final `cfg` values vs Arch §8 proposals, with rationale for any deviation | WP-13 |
| E-05 | `existing-enemy-regression.md` | Per-type observation for knifeman, swordsman, gunman, archer | G-04, G-06, G-13 |
| E-06 | `deviations.md` | Any assumption that proved false, any stop condition triggered, resolution | As encountered |
| E-07 | `change-inventory-actual.md` | `git diff --name-only origin/main` vs the approved inventory | Before PR |

E-05 is the evidentiary answer to BR-01 and Approval condition 4, and mitigates
business-accepted risk AR-7 (manual observation is the only proof).

---

## 15. Human Review Points

| # | Point | When | Reviewer | Decision |
|---|---|---|---|---|
| H-01 | **Plan approval** | Before WP-01 | Project Owner / Eng Lead | Approve · Rework |
| H-02 | **ASM-001 review** | At G-04, before WP-05 | Eng Lead | Confirm R-1…R-4; the one mandatory human gate mid-flight |
| H-03 | **Equivalence review** | At G-06 | Eng Lead | Confirm the climber is indistinguishable from a knifeman |
| H-04 | **Ladder authoring review** | At G-03 | Project Owner | Confirm placement and §10 compliance |
| H-05 | **Core behaviour review** | At G-09 | Project Owner | Confirm ascent reads correctly; judge "looks broken" (BD-014) |
| H-06 | **Balance review** | At G-12 | Project Owner | Confirm the final wave is winnable and difficulty acceptable (BR-15, BD-019) |
| H-07 | **Final acceptance** | At G-13, before PR merge | Project Owner | Grant release approval; all four gates in `opportunity.md` |
| H-08 | **Escalation** | Any stop condition (§4.3) | Tech Lead → Architecture | Return to Architecture Design; **no workaround** |

**H-02 and H-07 are mandatory.** The rest may be batched at the reviewer's
discretion, but H-05 and H-06 require someone to actually play the game — no
inspection substitutes for them (BD-014, BD-015).

---

## 16. Recommended Implementation Roadmap

```
                    ┌──────────────────────────────────────┐
                    │  H-01  Implementation Plan approval   │
                    └───────────────────┬──────────────────┘
                                        ▼
        branch: feat/eo-001-ladder-climbing-enemy from origin/main
                                        ▼
   ╔════════════ PHASE A — INERT (cannot affect existing behaviour) ═══════════╗
   ║   WP-01  Ladder domain model                                              ║
   ║      ↓                                                                    ║
   ║   Validation G-01                                                         ║
   ║      ↓                                                                    ║
   ║   WP-02  Ladder rendering                                                 ║
   ║      ↓                                                                    ║
   ║   Validation G-02                                                         ║
   ║      ↓                                                                    ║
   ║   WP-03  Ladder placement                        ◀── H-04                 ║
   ║      ↓                                                                    ║
   ║   Validation G-03                                                         ║
   ╚═══════════════════════════════════╤═══════════════════════════════════════╝
                                       ▼
   ╔══════════ PHASE B — THE ONE RISKY CHANGE, ISOLATED ═══════════════════════╗
   ║   WP-04  ASM-001 constructor hook   ◀── the only BCR-MOD                  ║
   ║      ↓                                                                    ║
   ║   Validation G-04   R-1 R-2 R-3 R-4   ◀── H-02  MANDATORY HUMAN GATE      ║
   ╚═══════════════════════════════════╤═══════════════════════════════════════╝
                                       ▼
   ╔══════════ PHASE C — EQUIVALENCE BEFORE CAPABILITY ════════════════════════╗
   ║   WP-05  World ladder exposure                                            ║
   ║      ↓                                                                    ║
   ║   Validation G-05                                                         ║
   ║      ↓                                                                    ║
   ║   WP-06  Climber skeleton + registration        ◀── H-03                  ║
   ║      ↓                                                                    ║
   ║   Validation G-06   climber ≡ knifeman                                    ║
   ╚═══════════════════════════════════╤═══════════════════════════════════════╝
                                       ▼
   ╔══════════ PHASE D — CAPABILITY, ONE LAYER AT A TIME ══════════════════════╗
   ║   WP-07  Elevation model                                                  ║
   ║      ↓                                                                    ║
   ║   Validation G-07                                                         ║
   ║      ↓                                                                    ║
   ║   WP-08  Ladder selection + APPROACH                                      ║
   ║      ↓                                                                    ║
   ║   Validation G-08                                                         ║
   ║      ↓                                                                    ║
   ║   WP-09  Ascent: CLIMB + exit + housekeeping     ◀── H-05                 ║
   ║      ↓                                                                    ║
   ║   Validation G-09                                                         ║
   ║      ↓                                                                    ║
   ║   WP-10  Climb pose                                                       ║
   ║      ↓                                                                    ║
   ║   Validation G-10                                                         ║
   ║      ↓                                                                    ║
   ║   WP-11  Descent            ◀── completes the stranding guarantee         ║
   ║      ↓                                                                    ║
   ║   Validation G-11                                                         ║
   ╚═══════════════════════════════════╤═══════════════════════════════════════╝
                                       ▼
   ╔══════════ PHASE E — INTEGRATION, BALANCE, EVIDENCE ═══════════════════════╗
   ║   WP-12  Wave placement                          ◀── H-06                 ║
   ║      ↓                                                                    ║
   ║   Validation G-12                                                         ║
   ║      ↓                                                                    ║
   ║   WP-13  Tuning, checklist, evidence                                      ║
   ║      ↓                                                                    ║
   ║   Validation G-13   full V-01…V-24 sweep         ◀── H-07  MANDATORY      ║
   ╚═══════════════════════════════════╤═══════════════════════════════════════╝
                                       ▼
                      Push · one PR · review · merge to main
```

**Any stop condition (§4.3) at any point → H-08 → return to Architecture Design.**

---

**Status:** 🟡 Awaiting Implementation Approval
**Next:** implementation approval (H-01), then the Implementation Cycle beginning at WP-01.
**No production code was generated in producing this plan.**
