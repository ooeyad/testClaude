# WP-01 — Engineer Acknowledgement

**Opportunity:** EO-001 — Add Ladder-Climbing Enemy
**Work Package:** WP-01 — Ladder domain model
**Lifecycle Stage:** Implementation Cycle
**Role:** ROLE-004 — Software Engineer
**Acknowledging:** `WP-01/kickoff.md`, issued by ROLE-003
**Date:** 2026-08-06
**Repository root (game):** `phefo/`
**Baseline:** `main` @ `84257ea`
**Validation gate:** G-01

**Artifacts read:** `WP-01/kickoff.md` · `implementation/implementation-plan.md` v1.0 · `architecture/architecture-design.md` v1.2
**Source inspected (read-only):** `phefo/js/levels/level.js` (98 lines) · `phefo/js/levels/level01_city.js` (baseline counts)

> **No source code has been modified in producing this acknowledgement.**

---

## 1. Summary of My Understanding

I am to add **one pure factory function** to a single existing file, and nothing
else.

`P.Levels.ladder(x, top, bottom)` returns `{ x: x, top: top, bottom: bottom }`.
It has **no caller** anywhere in the codebase after this package. Rendering
(WP-02), level placement (WP-03) and world exposure (WP-05) each belong to a
later package, and pulling any of them forward would break the single-
responsibility boundary the plan is built on.

I understand the reason this package exists and why it is first. It is the
smallest possible change that establishes a data contract six later packages
depend on — WP-02 draws it, WP-03 authors with it, WP-05 exposes it, and WP-08,
WP-09 and WP-11 rely on the meaning of `top` and `bottom` to select ladders and
clamp on exit. Getting the field names and their semantics right now avoids
re-work across all of them.

I also understand the diagnostic value of this package being inert: **there is no
legitimate behavioural change in WP-01.** If the game behaves differently after
my change, that is a defect, not a feature — there is nothing here to mistake it
for.

I have read the file I will change and located the insertion point precisely:
between `platform` (ends `phefo/js/levels/level.js:46`) and the `drawSolids`
documentation block (begins line 48). The `Levels` object members are separated
by a blank line and terminated with a comma, and the file is ES5 throughout with
`/** … */` explanatory comments.

---

## 2. Work Package Objective

| | |
|---|---|
| **Objective** | Introduce the Ladder domain model and its authoring constructor `P.Levels.ladder(x, top, bottom)` in `phefo/js/levels/level.js` |
| **Category** | ADDITIVE — a new function only |
| **Success** | `Phefo.Levels.ladder` exists and returns the approved three-field structure, and the game is otherwise the same experience it was at `84257ea` |
| **Not the objective** | Rendering, placement, world wiring, or anything to do with the `Climber` |

---

## 3. Files I Am Permitted to Modify

**Exactly one.**

| # | File | Permitted change |
|---|---|---|
| 1 | `phefo/js/levels/level.js` | Add one new member function to the `Levels` object, immediately after `platform`, with its documentation comment |

I understand that `git diff --name-only origin/main` must list this file and
nothing else at the end of the package.

**Engineering documents are not source files.** I will produce
`WP-01/implementation.md`, `self-review.md`, `validation.md` and `evidence.md`
under `engineering/`, per kickoff §11. I read kickoff §5.4 ("WP-01 creates no
files") as applying to **source** files under `phefo/`, consistent with §11
requiring those four artifacts. Recorded as assumption **EA-1** below.

---

## 4. Files I Must Not Modify

I have read and accept the full protected list in kickoff §5. Restating what I
will actively guard against, in order of how likely I am to hit it:

### 4.1 Highest risk — inside the file I have open

| Member of `level.js` | Status |
|---|---|
| `registry`, `order` | Must not change |
| `define`, `get`, `first` | Must not change |
| `solid`, `platform` | Must not change — `level01_city.js` depends on their exact returned shapes |
| `drawSolids` | Must not change — WP-02 adds a **separate** `drawLadders`, it does not extend this |
| Module preamble comment (lines 8–15), IIFE wrapper, `'use strict'`, `var U = P.util` | Must not change (see Q-3) |

### 4.2 Owned by a later package

`level01_city.js` (WP-03, WP-12) · `game.js` (WP-02, WP-05) · `enemy.js` (WP-04,
ASM-001 only) · `poses.js` (WP-10) · `index.html` (WP-06)

### 4.3 Never modified by this opportunity

`physics.js` · `hitbox.js` · `weapons.js` · `input.js` · `camera.js` ·
`util.js` · `audio.js` · `stickman.js` · `fx.js` · `backdrop.js` · `entity.js` ·
`phefo.js` · `projectile.js` · `pickup.js` · `hud.js` · `menus.js` · all four
existing `entities/enemies/*.js` · `css/style.css`

**I will create no new source files.** The two new source files in this
opportunity belong to WP-06.

---

## 5. Architecture Constraints I Must Obey

Approved and locked. I understand I may not reinterpret these, and that if any
appears wrong I must stop rather than adapt it.

| # | Constraint | My understanding of the consequence |
|---|---|---|
| AD-1 | **Ladders are NOT solids and must never reach `def.solids`** | The constraint I treat as inviolable. `solids` is read every step by `moveAndCollide` for every entity and by `Projectile.hitSolids`; a ladder in that array would change collision for the player and all four existing enemies. I will not implement `ladder()` by delegating to `solid()`, and I will not add a `ladders` array to any level definition in this package |
| AD-2 | Structure is exactly `{ x, top, bottom }` | Three fields. No width, no id, no type tag, no extras |
| AD-3 | Invariant `top < bottom` (y grows downward) | Documented, not enforced at runtime — see A-1 / Q-1 |
| AD-4 | `top` and `bottom` are **surfaces where feet rest**, in feet-space | These are exit positions that WP-09 and WP-11 clamp to. My comment must say this explicitly, because a loose wording here surfaces as mis-clamping eight packages later, far from its cause |
| AD-5 | The API mirrors `solid()` / `platform()` | Same function shape, same placement neighbourhood, same comment voice — discoverability by level authors is the point (BR-16, C-6) |
| AD-6 | Appearance is a rendering concern | Rail width, rung spacing and colour are constants inside `drawLadders` in WP-02, not fields on the model |
| AD-7 | Category is ADDITIVE | A new function only. No existing function body may be modified. **ASM-001 does not apply to this package** and I will not touch `enemy.js` |

**Conventions** (`CLAUDE.md`, provisional — project standards remain unpopulated,
0 of 32): ES5 only. `var`, not `let`/`const`. No arrow functions, no classes, no
shorthand properties, no template literals. Nothing is transpiled — what I write
is what the browser executes.

---

## 6. Validation I Must Perform

I will execute and record all of the following before declaring WP-01 complete.

### 6.1 Universal invariants (U-1 … U-4)

| # | Check | Method |
|---|---|---|
| U-1 | No new console errors | Load the game, DevTools console open, play one wave |
| U-2 | Diff lists only `phefo/js/levels/level.js` | `git diff --name-only origin/main` |
| U-3 | No file outside the approved inventory modified | Same command |
| U-4 | Player moves, jumps, drops through platforms, attacks, reloads as before | Play |

### 6.2 G-01 — verify

| # | Check | Expected |
|---|---|---|
| G1-a | `node --check phefo/js/levels/level.js` | Passes |
| G1-b | `typeof Phefo.Levels.ladder === 'function'` | `true` |
| G1-c | `Phefo.Levels.ladder(100, -152, 0)` | `{x:100, top:-152, bottom:0}` |
| G1-d | `Object.keys(Phefo.Levels.ladder(0,-1,0)).sort().join()` | `bottom,top,x` |
| G1-e | `Phefo.Levels.solid(0,0,10,10)` / `Phefo.Levels.platform(0,0,10)` | `{x:0,y:0,w:10,h:10}` / `{x:0,y:0,w:10,h:10,oneWay:true}` |

### 6.3 G-01 — must not change

| # | Check | Expected |
|---|---|---|
| G1-f | `Phefo.Levels.first().solids.length` | **13** |
| G1-g | `Phefo.Levels.first().solids.some(function(s){return 'top' in s \|\| 'bottom' in s;})` | `false` |
| G1-h | `Phefo.Levels.order` / `Phefo.Levels.first().id` | `['city01']` / `'city01'` |
| G1-i | Play waves 1–2 | Visually identical; **no ladder visible** — none is authored until WP-03 |
| G1-j | Observe knifeman and gunman | Behaving as before (continuous protection, BR-01) |
| G1-k | `git diff phefo/js/levels/level.js` | **Added lines only** — no line inside `define`, `get`, `first`, `solid`, `platform` or `drawSolids` altered |

I understand **G1-f, G1-g and G1-k are the load-bearing checks** — they are the
evidence that AD-1 and AD-7 were honoured, and I will not treat the package as
complete without them passing.

### 6.4 Recording

Results go to `WP-01/validation.md`; observations and diff summary to
`WP-01/evidence.md`. Any deviation goes to
`implementation/evidence/architectural-deviations.md` **as it occurs**, not
retrospectively.

---

## 7. Risks I Will Monitor

Accepted from kickoff §6, with how I will actively guard each:

| # | Risk | My guard |
|---|---|---|
| RK-1 | A ladder reaches `def.solids`, or `ladder()` delegates to `solid()` | Write `ladder()` as an independent object literal. Verify with G1-f and G1-g before claiming completion |
| RK-2 | An existing function in `level.js` is modified while the file is open | Review `git diff` line by line before committing; confirm additions only (G1-k) |
| RK-3 | Scope creep into rendering | I will not write `drawLadders` or any canvas code in this package, even though the rendering function will sit directly below my addition |
| RK-4 | A width or appearance field is added | Three fields exactly; G1-d asserts it |
| RK-5 | ES6 syntax used | I have read the surrounding code; I will match `var` / `function` style |
| RK-6 | `top`/`bottom` documented as decorative extents | Comment will state they are the surfaces where feet rest, per AD-4 |
| RK-7 | Committed together with another package | One commit, subject `EO-001 WP-01: ladder domain model`, containing only this change |

**Additional risk I will watch, not in the kickoff:**

| # | Risk | Guard |
|---|---|---|
| EA-RK-1 | Object-literal punctuation. Inserting a member between `platform` (line 46) and the `drawSolids` comment (line 48) requires the comma after `platform`'s closing brace to remain and my own member to be comma-terminated. A missing comma is a **load-time syntax error** that would take the whole game down, not a subtle bug | `node --check` (G1-a) before loading the game; this is why G1-a runs first |

**Stop conditions.** I will halt immediately and escalate (H-08) on any of
ST-1 … ST-6 — in particular if implementing this package appears to require
modifying any existing function, or any file beyond `level.js`.

---

## 8. Questions and Ambiguities

### 8.1 Assumptions from the kickoff — accepted

| # | Assumption | My position |
|---|---|---|
| A-1 | No input validation; `ladder()` returns a plain literal, as `solid()` and `platform()` do | **Accepted.** Consistent with both neighbours, which validate nothing. The invariant is an authoring rule enforced by review at WP-03 |
| A-2 | No width field | **Accepted.** Appearance belongs to WP-02 |
| A-3 | Comment style matches the file — `/** … */`, explaining *why* | **Accepted.** I will follow the `platform` comment's voice rather than the terser `/** Solid rect. */` |
| A-4 | No `ladders` key handling in `level.js` | **Accepted.** Defaulting an absent array is `World`'s job in WP-05 |
| A-5 | No export or manifest change | **Accepted.** `P.Levels` is already the export |
| A-6 | Parameter order `(x, top, bottom)` | **Accepted as locked.** I will not vary it |

### 8.2 My own assumptions, recorded

| # | Assumption | Basis |
|---|---|---|
| **EA-1** | "WP-01 creates no files" (§5.4) refers to **source** files under `phefo/`. I will still create the four engineering artifacts required by §11 | §5.4 and §11 are otherwise contradictory; §11 explicitly names artifacts I must produce |
| **EA-2** | Creating the branch `feat/eo-001-ladder-climbing-enemy` is part of this package and is not a source modification | Kickoff §7.2 instructs it as the first action |
| **EA-3** | I will **not** open a pull request after WP-01. Per Plan §4.2 there is one PR for the whole opportunity, at the end | This differs from the default `CLAUDE.md` flow, where a commit request implies branch → commit → push → PR. Plan §4.2 supersedes it for this opportunity and states the rationale. Confirming rather than assuming silently — see Q-4 |

### 8.3 Open questions

**None are blocking.** I can implement WP-01 correctly today on the stated
assumptions. Each is recorded so the answer is deliberate rather than incidental.

| # | Question | My proposed course | Blocking? |
|---|---|---|---|
| **Q-1** *(from kickoff)* | Should `ladder()` assert or normalise the `top < bottom` invariant, e.g. by swapping reversed arguments? | Proceed on **A-1 — no enforcement**. Adding a silent swap would hide authoring errors that WP-03 review is meant to catch, and an assert would be the only runtime validation in a file whose other two constructors have none | No |
| **Q-2** *(from kickoff)* | Should the comment cross-reference the Architecture §10 authoring rules (no intersecting solids, ≥14px inset from a platform edge)? | **Yes — I will include a brief pointer.** The WP-03 author is the next person to read this comment, and §10 compliance is the highest-likelihood risk in the whole plan (IR-03). A one-line reference costs nothing | No |
| **Q-3** *(new)* | The module preamble (lines 8–15) defines a level as "plain data: solids, a spawn point, camera bounds and a list of waves". Once `ladders` becomes a level-definition key it will be incomplete. Kickoff §5.3 protects the preamble, so I will not touch it in WP-01 — but **which package should update it, WP-03 (first real `ladders` key) or WP-05 (world exposure)?** | Leave untouched in WP-01, as instructed. Raising so it is assigned rather than forgotten | No |
| **Q-4** *(new)* | Confirming EA-3: no PR is opened after WP-01; one PR covers the opportunity at the end | Proceed on Plan §4.2 | No |

---

## 9. Confirmation of Readiness

| # | Statement | Status |
|---|---|---|
| 1 | I have read `WP-01/kickoff.md`, the Implementation Plan v1.0 and Architecture Design v1.2 | ✅ |
| 2 | I have inspected `phefo/js/levels/level.js` read-only and located the exact insertion point | ✅ |
| 3 | I understand the objective and that it is deliberately inert | ✅ |
| 4 | I understand exactly one source file may change | ✅ |
| 5 | I understand the protected files, including members *within* the file I am editing | ✅ |
| 6 | I understand and accept architecture constraints AD-1 … AD-7 as locked | ✅ |
| 7 | I understand the validation I must perform and record | ✅ |
| 8 | I understand the risks and how I will guard each | ✅ |
| 9 | I will make no architectural decision; I will stop and escalate instead | ✅ |
| 10 | I have no blocking questions | ✅ |

**I am ready to implement WP-01.**

I am proceeding on assumptions A-1 … A-6 and EA-1 … EA-3, and on my proposed
course for Q-1 and Q-2. Q-3 and Q-4 are raised for assignment and confirmation
and do not gate this package.

**I have not implemented any code.** No source file has been modified. The next
artifact I produce will be `WP-01/implementation.md`, only after this
acknowledgement is accepted or its questions answered.

---

**Status:** 🟢 Acknowledged — ready to implement, awaiting go-ahead
**Role:** ROLE-004 — Software Engineer
**Date:** 2026-08-06
