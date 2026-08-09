# WP-01 — Kickoff

**Opportunity:** EO-001 — Add Ladder-Climbing Enemy
**Work Package:** WP-01 — Ladder domain model
**Lifecycle Stage:** Implementation Cycle
**Issued by:** ROLE-003 — Technical Team Lead
**Issued to:** ROLE-004 — Software Engineer
**Date:** 2026-08-06
**Repository root (game):** `phefo/`
**Baseline:** `main` @ `84257ea`
**Governing artifacts:** Implementation Plan v1.0 (Approved) · Architecture Design v1.2 (Approved)
**Position in sequence:** 1 of 13 · Phase A (Inert) · **first package**
**Validation gate:** **G-01**

> **This is the first change of the implementation cycle.** It is deliberately the
> smallest and safest package in the plan: a single pure function in one file,
> with no caller and no runtime effect. If anything about the game behaves
> differently after this package, something is wrong — there is no legitimate
> behavioural change here to mistake it for.

---

## 1. Work Package Objective

Introduce the **Ladder domain model** and its authoring constructor,
`P.Levels.ladder(x, top, bottom)`, in `phefo/js/levels/level.js`.

Nothing consumes the constructor in this package. Rendering is WP-02, level
placement is WP-03, and world exposure is WP-05. The objective here is solely to
establish the data shape that every later package depends on.

**Definition of success in one line:** `Phefo.Levels.ladder` exists and returns
the approved structure, and the game is otherwise byte-for-byte the same
experience it was at `84257ea`.

---

## 2. Scope

| # | In scope |
|---|---|
| S-1 | Add a `ladder` factory to the `Levels` object in `phefo/js/levels/level.js` |
| S-2 | Return the approved structure `{ x, top, bottom }` (Architecture §5.1) |
| S-3 | Document the structure and its invariant in the file's existing comment style |

**Out of scope for this package** — each has its own package, and pulling any of
it forward breaks the single-responsibility rule the plan is built on:

| Deferred to | Item |
|---|---|
| WP-02 | `drawLadders()`, any rendering, any rail/rung geometry |
| WP-03 | Placing ladders in `level01_city.js` |
| WP-05 | `World.ladders` exposure in `game.js` |
| WP-06+ | Anything to do with the `Climber` |

---

## 3. Architecture Decisions Affecting This Work Package

These are **approved and locked**. They may not be reinterpreted during
implementation (Architecture Approval, decision list; Implementation Plan §4.3).

| # | Decision | Source | Consequence for WP-01 |
|---|---|---|---|
| AD-1 | **Ladders use a separate level-data collection and are NOT added to `solids`** | Arch Approval decision 3; Arch §5.1 | The single most important constraint in this package. `solids` is read every step by `moveAndCollide` for every entity and by `Projectile.hitSolids`; adding a ladder to it would change collision for the player and all four existing enemies |
| AD-2 | The structure is exactly `{ x, top, bottom }` | Arch §5.1 | Three fields. No width, no id, no type tag |
| AD-3 | Invariant `top < bottom` (y grows downward) | Arch §5.1 | Document it; see Q-1 on whether to enforce it |
| AD-4 | Coordinates are in **feet-space** — `top` is the y of the upper *surface*, `bottom` the y of the lower *surface* | Arch §5.1, §10.2 | These are exit positions where feet rest, not decorative extents. The comment must say so, because WP-09/WP-11 clamp to these values |
| AD-5 | The API **mirrors the existing `solid()` / `platform()` constructors** | Arch §5.1 | Same shape of function, same style, same neighbourhood in the file — discoverability by level authors is the point (BR-16, C-6) |
| AD-6 | Ladder **appearance is a rendering concern**, not a model concern | Arch §5.2 | Rail width, rung spacing and colour belong to `drawLadders` in WP-02. They must not appear in the model |
| AD-7 | Change category is **ADDITIVE** | Arch §3, §6.2 | A new function only. No existing function body may be modified. ASM-001 does **not** apply to this package and must not be touched here |

**Governing conventions** (`CLAUDE.md`, provisional per Arch §2.3 — project
standards remain unpopulated): ES5 only — `var`, no `let`/`const`, no arrow
functions, no classes, no template literals. The file is an IIFE hanging its
export off `P`. Nothing is transpiled; what is written is what the browser runs.

---

## 4. Files Allowed to Change

**Exactly one file.**

| # | File | Category | Permitted change |
|---|---|---|---|
| 1 | `phefo/js/levels/level.js` | ADDITIVE | Add one new member function to the `Levels` object, plus its comment |

`git diff --name-only origin/main` at the end of this package must list **this
file and nothing else**.

**Placement guidance.** The `Levels` object currently exposes, in order:
`define` (L21), `get` (L27), `first` (L33), `solid` (L36), `platform` (L44),
`drawSolids` (L55) — 98 lines total. Add `ladder` **immediately after
`platform`**, keeping the three authoring constructors together and ahead of the
rendering function.

---

## 5. Files Explicitly Protected

Nothing in this list may be modified in WP-01. Touching any of it is stop
condition **ST-2** (Implementation Plan §4.3) — halt and escalate.

### 5.1 Owned by a later package — do not pre-empt

| File | Owning package |
|---|---|
| `phefo/js/levels/level01_city.js` | WP-03 (ladder placement), WP-12 (waves) |
| `phefo/js/core/game.js` | WP-02 (draw call), WP-05 (`World.ladders`) |
| `phefo/js/entities/enemy.js` | WP-04 — **ASM-001 only**, and only in that package |
| `phefo/js/render/poses.js` | WP-10 (climb pose) |
| `phefo/index.html` | WP-06 (script tags) |

### 5.2 Never modified by this opportunity

`physics.js` · `hitbox.js` · `weapons.js` · `input.js` · `camera.js` ·
`util.js` · `audio.js` · `stickman.js` · `fx.js` · `backdrop.js` · `entity.js` ·
`phefo.js` · `projectile.js` · `pickup.js` · `hud.js` · `menus.js` · all four
existing `entities/enemies/*.js` · `css/style.css`

### 5.3 Protected *within* the file being changed

Existing members of `level.js` are protected even though the file is open:

| Member | Status |
|---|---|
| `define`, `get`, `first` | Must not change |
| `solid`, `platform` | Must not change — their signatures and returned shapes are relied on by `level01_city.js` |
| `drawSolids` | Must not change — WP-02 will add a *separate* `drawLadders`, not extend this |
| The `THEMES`-style module preamble and IIFE wrapper | Must not change |

### 5.4 No new files

WP-01 creates **no** files. The two new files in this opportunity
(`entities/climber.js`, `entities/enemies/climber.js`) belong to WP-06.

---

## 6. Risks

| # | Risk | Severity | How it shows up | Guard |
|---|---|---|---|---|
| RK-1 | **A ladder is added to `def.solids`**, or `ladder()` is implemented by delegating to `solid()` | **Critical** | Collision changes for the player and every existing enemy; violates AD-1 and Approval decision 3 | G-01 asserts the solids array is unchanged and contains no ladder-shaped object |
| RK-2 | An existing function in `level.js` is modified while the file is open | High | Would be an unregistered shared-function change (ST-1) | §5.3; `git diff` review at G-01 |
| RK-3 | **Scope creep into rendering** — adding `drawLadders`, or drawing code, "while we're here" | Medium | Breaks single-responsibility; makes G-02 unverifiable | §2 deferral table; diff review |
| RK-4 | A width/appearance field is added to the model | Medium | Contradicts AD-2 and AD-6; leaks a rendering concern into level data | G-01 asserts exactly three fields |
| RK-5 | ES6 syntax is used (`const`, arrow function, shorthand) | Medium | No transpiler exists; may still run, but breaks the file's convention and `CLAUDE.md` | Read the surrounding code before writing |
| RK-6 | `top`/`bottom` are documented as decorative extents rather than exit surfaces | Medium | Latent — surfaces as mis-clamping in WP-09/WP-11, far from its cause | AD-4; comment wording reviewed at G-01 |
| RK-7 | The change is committed together with any other package | Low | Destroys per-package revertibility (Plan §10) | One commit, `EO-001 WP-01: …` |

**Note on residual risk AR-1** (ladder authoring errors): it is *not* triggered by
this package — no ladder is authored here. WP-03 owns it. Do not attempt to guard
against it by adding validation to the model without raising Q-1 first.

---

## 7. Dependencies

### 7.1 Upstream

| Dependency | Status |
|---|---|
| Business Approval | ✅ Approved |
| Architecture Approval (v1.2) | ✅ Approved |
| Implementation Plan Approval (H-01) | ✅ Approved — authorised to begin at WP-01 |
| Preceding work packages | **None — WP-01 is first** |

### 7.2 Environment

| Item | Requirement |
|---|---|
| Branch | `feat/eo-001-ladder-climbing-enemy`, cut from `origin/main` (Plan §4.2). **Create it as the first action of this package** if it does not exist |
| Baseline | `main` @ `84257ea` |
| Running the game | Static server from the repository root, e.g. `python -m http.server 8123 --bind 127.0.0.1`, then `http://127.0.0.1:8123/phefo/index.html`. `file://` also works — no modules or `fetch` are used |

### 7.3 Downstream — what depends on getting this right

| Package | Depends on |
|---|---|
| WP-02 | The structure, to draw it |
| WP-03 | The constructor, to author with |
| WP-05 | The structure, to expose |
| WP-08, WP-09, WP-11 | `top`/`bottom` semantics, to select ladders and clamp on exit |

The field names and their meaning are the contract for six later packages.
Changing them later is a re-work of all of them.

---

## 8. Validation That Must Pass Before WP-01 Is Complete

**Gate G-01**, plus the universal invariants checked at every gate.

### 8.1 Universal invariants (U-1 … U-4, Plan §12)

| # | Check | Method |
|---|---|---|
| U-1 | No new console errors | Load the game, open DevTools console, play one wave |
| U-2 | `git diff --name-only origin/main` lists only `phefo/js/levels/level.js` | Command |
| U-3 | No file outside the approved inventory modified | Same command |
| U-4 | Player moves, jumps, drops through platforms, attacks, reloads as before | Play |

### 8.2 G-01 — verify

| # | Check | Expected |
|---|---|---|
| G1-a | Syntax | `node --check phefo/js/levels/level.js` passes |
| G1-b | Constructor exists | `typeof Phefo.Levels.ladder === 'function'` → `true` |
| G1-c | Returns the approved shape | `Phefo.Levels.ladder(100, -152, 0)` → `{x:100, top:-152, bottom:0}` |
| G1-d | Exactly three fields | `Object.keys(Phefo.Levels.ladder(0,-1,0)).sort().join()` → `bottom,top,x` |
| G1-e | Peers unaffected | `Phefo.Levels.solid(0,0,10,10)` → `{x:0,y:0,w:10,h:10}`; `Phefo.Levels.platform(0,0,10)` → `{x:0,y:0,w:10,h:10,oneWay:true}` |

### 8.3 G-01 — must not change

| # | Check | Expected |
|---|---|---|
| G1-f | **No ladder reached `solids`** | `Phefo.Levels.first().solids.length` → **13** (baseline for `city01`) |
| G1-g | **No solid carries ladder fields** | `Phefo.Levels.first().solids.some(function(s){return 'top' in s || 'bottom' in s;})` → `false` |
| G1-h | Level registry intact | `Phefo.Levels.order` → `['city01']`; `Phefo.Levels.first().id` → `'city01'` |
| G1-i | Game is visually identical | Play waves 1–2. Road, platforms, fire escapes, decor unchanged. **No ladder is visible** — none is authored until WP-03 |
| G1-j | Existing enemies unchanged | Knifeman and gunman observed behaving as before (continuous protection, BR-01) |
| G1-k | Diff is additive only | `git diff phefo/js/levels/level.js` shows **added lines only** — no line inside `define`, `get`, `first`, `solid`, `platform` or `drawSolids` altered |

**G1-f, G1-g and G1-k are the load-bearing checks.** They are the evidence that
AD-1 and AD-7 were honoured.

---

## 9. Acceptance Criteria

WP-01 is complete when **all** hold:

| # | Criterion |
|---|---|
| AC-1 | `P.Levels.ladder(x, top, bottom)` exists and returns `{x, top, bottom}` |
| AC-2 | The returned object has exactly three fields |
| AC-3 | The function is placed immediately after `platform` in the `Levels` object |
| AC-4 | A comment documents the structure, the `top < bottom` invariant, and that `top`/`bottom` are **surfaces where feet rest** |
| AC-5 | Written in ES5, matching the file's existing style |
| AC-6 | No existing function in `level.js` is modified |
| AC-7 | No file other than `phefo/js/levels/level.js` is modified |
| AC-8 | No new file is created |
| AC-9 | Ladders are not present in, and cannot reach, `def.solids` |
| AC-10 | All of G-01 (§8.2, §8.3) and U-1…U-4 pass |
| AC-11 | Committed as a single commit, subject `EO-001 WP-01: ladder domain model` |
| AC-12 | `validation.md` for WP-01 records the G-01 results |

---

## 10. Questions and Assumptions for the Software Engineer

Assumptions the Tech Lead has made on your behalf. **Proceed on these unless you
disagree** — if you do, raise it before writing code rather than deciding
unilaterally (Approval condition 9: no architectural decisions during
implementation).

| # | Assumption | Rationale | If you disagree |
|---|---|---|---|
| A-1 | **No input validation.** `ladder()` returns a plain object literal without checking `top < bottom`, exactly as `solid()` and `platform()` perform no validation | Consistency with the file's existing constructors; the invariant is an authoring rule enforced by review at WP-03 (Arch §10), not at runtime | Raise Q-1 |
| A-2 | **No width field.** Rail width and rung spacing are constants inside `drawLadders` in WP-02 | AD-2, AD-6 — the model is level data, not appearance | Raise before implementing |
| A-3 | **Comment style matches the file** — a `/** … */` block in the same explanatory voice as the existing `platform` comment, saying *why* rather than restating the signature | `CLAUDE.md`; the file's existing convention | Use judgement |
| A-4 | **No `ladders` key handling in `level.js`.** Defaulting an absent `ladders` array is `World`'s job in WP-05 | Separation of concerns; Arch §6.2 assigns it to `game.js` | Raise before implementing |
| A-5 | **No export or manifest change.** `P.Levels` is already the module's export; adding a member is sufficient | The file's IIFE pattern | — |
| A-6 | **Parameter order is `(x, top, bottom)`** exactly as Architecture §5.1 specifies | Locked by approved architecture | **Cannot be changed** without architecture rework |

### Open questions

| # | Question | Raise to | Blocking? |
|---|---|---|---|
| Q-1 | Should `ladder()` assert or normalise the `top < bottom` invariant — for example by swapping reversed arguments? Architecture states the invariant but does not require enforcement. A-1 assumes no enforcement, matching `solid()`/`platform()` | Tech Lead | **No** — proceed on A-1; a defensive check would be a small deviation to record, not a stop condition |
| Q-2 | Should the ladder comment cross-reference the §10 authoring rules that constrain placement (no intersecting solids, ≥14px inset from a platform edge)? | Tech Lead | No — recommended but optional; it would help the WP-03 author |

### Standing instructions

1. **Do not create new files.**
2. **Do not modify any file in §5.**
3. **Do not make architectural decisions.** If the approved design appears wrong
   or unimplementable, **stop** and escalate (H-08) rather than adapting it.
4. **One commit for this package**, containing only this change.
5. **Record deviations** in `implementation/evidence/architectural-deviations.md`
   as they occur, not retrospectively (Approval condition 10).
6. If any of ST-1 … ST-6 (Plan §4.3) is met, **halt immediately**.

---

## 11. Handover

**Next artifacts for this package**, produced by ROLE-004:

| Artifact | Content |
|---|---|
| `WP-01/implementation.md` | What was changed and why |
| `WP-01/self-review.md` | Self-review against AC-1…AC-12 |
| `WP-01/validation.md` | G-01 and U-1…U-4 results, recorded |
| `WP-01/evidence.md` | Console output, diff summary, observations |

**On completion:** proceed to **WP-02 — Ladder rendering**. No human review point
falls between WP-01 and WP-02; the next mandatory human gate is **H-02** at G-04,
after ASM-001.

---

**Status:** 🟢 Ready for implementation
**Authorised by:** Implementation Plan Approval (H-01), 2026-08-06
**No source code was modified in producing this kickoff.**
