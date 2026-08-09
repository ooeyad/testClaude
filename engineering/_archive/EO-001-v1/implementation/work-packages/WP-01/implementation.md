# WP-01 — Implementation

**Opportunity:** EO-001 — Add Ladder-Climbing Enemy
**Work Package:** WP-01 — Ladder domain model
**Lifecycle Stage:** Implementation Cycle
**Role:** ROLE-004 — Software Engineer
**Date:** 2026-08-06
**Authorised by:** `WP-01/technical-lead-acceptance.md` — Accepted, 2026-08-06
**Branch:** `feat/eo-001-ladder-climbing-enemy` (cut from `origin/main` @ `84257ea`)
**Status:** ⚪ Implemented — **not yet self-reviewed, not yet validated**

> Self-review and the G-01 validation gate have **not** been performed and are
> not claimed anywhere in this document. They are the next two steps.

---

## 1. What Was Done

One change, in one file.

Added the `ladder` factory to the `Levels` object in
`phefo/js/levels/level.js`, immediately after `platform` and before the
`drawSolids` documentation block, per kickoff §4.

```
phefo/js/levels/level.js   +19 / −0     (additions only)
```

The function returns the approved three-field structure and has **no caller
anywhere in the codebase**. Nothing reads it until WP-02.

### 1.1 The function

```js
ladder: function (x, top, bottom) {
  return { x: x, top: top, bottom: bottom };
}
```

- ES5: `function` expression, `var`-era style, explicit property assignment.
- **No property shorthand** — `{ x: x, top: top, bottom: bottom }`, not
  `{ x, top, bottom }`, per acceptance §6.2. Nothing is transpiled here.
- No validation, no normalisation, no defaulting — a plain object literal, exactly
  as `solid()` and `platform()` are written (A-1, Q-1 ruling).
- Comma-terminated, matching every other member of the object literal.

### 1.2 The documentation comment

A `/** … */` block in the file's existing explanatory voice, covering the three
things the architecture requires a future reader to know:

| Requirement | How it is stated |
|---|---|
| **AD-1** — ladders are not solids | States it is *deliberately* not a solid and never placed in `def.solids`, and says **why**: that array is read every step by Physics for every entity and by projectiles, so a ladder in it would change collision for the player and every existing enemy |
| **AD-4** — endpoint semantics | States `top` and `bottom` are the y of the surfaces where **feet rest**, "not decorative extents — a climber is clamped to them on arrival" |
| **AD-3** — the invariant | States `top` is the smaller value, because y grows downward |
| **Q-2 ruling** | Points to the EO-001 architecture §10 for placement rules and says they are deliberately not enforced here — **a pointer, not a copy**, so no second source of truth is created |

---

## 2. How This Follows the Kickoff and Architecture

| Constraint | Compliance |
|---|---|
| AD-1 — never reaches `def.solids` | The function builds an independent object literal. It does **not** call or delegate to `solid()`. No `ladders` array was added to any level definition |
| AD-2 — exactly `{ x, top, bottom }` | Three properties, no width, no id, no type tag |
| AD-3 — invariant `top < bottom` | Documented, not enforced (Q-1 ruling) |
| AD-4 — feet-space exit surfaces | Stated explicitly in the comment |
| AD-5 — mirrors `solid()` / `platform()` | Same function shape, same placement neighbourhood, same comment voice |
| AD-6 — appearance is a rendering concern | No width, spacing or colour anywhere in the model |
| AD-7 — ADDITIVE | Diff is 19 insertions, **0 deletions**. No existing function body touched |
| Parameter order `(x, top, bottom)` | As locked by architecture (A-6) |
| ES5 conventions | `function`, explicit properties, no `const`/`let`, no arrow function, no shorthand |
| Placement | Immediately after `platform`, before `drawSolids` |

---

## 3. What Was Deliberately Not Done

Each of these was available and adjacent; none belongs to this package.

| Not done | Belongs to | Note |
|---|---|---|
| `drawLadders()` or any canvas code | WP-02 | `drawSolids` sits directly below the insertion point (acceptance §6.4). Not begun |
| Extending `drawSolids` to handle ladders | WP-02 | Architecture requires a *separate* function, not an extension |
| Placing any ladder in `level01_city.js` | WP-03 | Outside this package's allowlist |
| Adding `ladders: []` to a level definition "for completeness" | WP-03 / WP-05 | Explicitly warned against in acceptance §6.3. Absent means none; `World` defaults it in WP-05 |
| `World.ladders` exposure | WP-05 | `game.js` not touched |
| Updating the module preamble (L8–15) to mention ladders | **WP-02** | Assigned by the Q-3 ruling. Left untouched here, as instructed |
| Any validation of the invariant | — | Q-1 ruling: no enforcement |

---

## 4. Files Changed

| # | File | Category | Lines | Nature |
|---|---|---|---|---|
| 1 | `phefo/js/levels/level.js` | ADDITIVE | +19 / −0 | One new object member with its comment |

`git diff --name-only origin/main -- phefo/` reports **`phefo/js/levels/level.js`
and nothing else.**

**No new source file was created.** No file in the protected list (kickoff §5) was
opened for modification. `enemy.js` was not touched — ASM-001 is WP-04 and does
not apply to this package.

---

## 5. Checks Performed During Implementation

**Only one, and it is not part of the G-01 gate.**

| Check | Result | Why it was run now |
|---|---|---|
| `node --check phefo/js/levels/level.js` | ✅ Parses | Acceptance §6.1 and risk EA-RK-1: inserting a member between two existing ones makes a comma error a **load-time parse failure** that would stop `Phefo.Levels` from existing at all. Handing over a file that does not parse would waste the validation step |

I also observed, incidentally, that the diff is 19 insertions and 0 deletions.

**Explicitly not performed, and not claimed:**

- ❌ Self-review against AC-1…AC-12
- ❌ G-01 gate — none of G1-a…G1-k executed or recorded
- ❌ Universal invariants U-1…U-4
- ❌ Game not loaded; no console assertions; no gameplay observation
- ❌ Existing-enemy observation (G1-j)
- ❌ Line-by-line diff review (G1-k)
- ❌ No commit made — see §6

---

## 6. Current State

| Item | State |
|---|---|
| Branch | `feat/eo-001-ladder-climbing-enemy`, tracking `origin/main` |
| Working tree (`phefo/`) | One modified file, uncommitted |
| Commit | **Not made.** AC-11 requires one commit for this package; I am holding it until the G-01 gate passes, so a failing gate does not require a revert |
| Push | Not pushed |
| Pull request | None — one PR covers the opportunity at the end (EA-3, Q-4 ruling) |

---

## 7. Deviations

**None.** No deviation from the kickoff, the acceptance rulings or Architecture
v1.2 was required. `implementation/evidence/architectural-deviations.md` has
nothing to record for WP-01.

No architectural decision was made. No stop condition (ST-1…ST-6) was met.

---

## 8. Next Steps

In order, and not started:

1. **Self-review** against AC-1…AC-12 → `WP-01/self-review.md`
2. **Validation** — G-01 and U-1…U-4 in the order given in acceptance §6.1 → `WP-01/validation.md`
3. **Evidence** — diff summary and console output → `WP-01/evidence.md`
4. **Commit** once G-01 passes: `EO-001 WP-01: ladder domain model`
5. **WP-02** only after the gate passes. Not begun.

---

**Status:** ⚪ Implemented — awaiting self-review
**Role:** ROLE-004 — Software Engineer
**Date:** 2026-08-06
