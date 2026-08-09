# WP-01 — Technical Lead Acceptance

**Opportunity:** EO-001 — Add Ladder-Climbing Enemy
**Work Package:** WP-01 — Ladder domain model
**Lifecycle Stage:** Implementation Cycle
**Reviewed by:** ROLE-003 — Technical Team Lead
**Reviewing:** `WP-01/engineer-acknowledgement.md` (ROLE-004)
**Against:** `WP-01/kickoff.md` · Implementation Plan v1.0 · Architecture Design v1.2
**Date:** 2026-08-06
**Decision:** ✅ **Accepted — authorised to begin**

> No source code was modified in producing this acceptance.

---

## 1. Review Summary

The acknowledgement demonstrates correct understanding across all six review
dimensions. It is accepted without rework.

| Dimension | Assessment | Evidence |
|---|---|---|
| **Scope** | ✅ Correct | Identifies one pure factory with no caller; correctly defers rendering (WP-02), placement (WP-03) and world exposure (WP-05); explicitly recognises that pulling any forward would break the single-responsibility boundary |
| **Architecture** | ✅ Correct | AD-1…AD-7 restated with their *consequences*, not merely repeated. Critically, the engineer independently identified the real trap in AD-1 — that `ladder()` must not be implemented by delegating to `solid()` — which is the most plausible route to a ladder reaching `def.solids` |
| **Protected files** | ✅ Correct, and improved | Re-ordered the protected list by likelihood of accidental breach, putting members *inside the open file* first. That is where the risk actually lives, and it is a better framing than the kickoff's |
| **Validation** | ✅ Correct | All of U-1…U-4 and G1-a…G1-k captured, with G1-f, G1-g and G1-k correctly identified as the load-bearing checks — they are the evidence for AD-1 and AD-7 |
| **Assumptions** | ✅ Correct | A-1…A-6 accepted with reasoning rather than acquiescence; EA-1…EA-3 raised explicitly instead of being assumed silently. EA-3 in particular flags a divergence from the default `CLAUDE.md` flow rather than quietly following one or the other |
| **Risks** | ✅ Correct, and extended | RK-1…RK-7 accepted with a concrete guard each, plus one genuine addition the kickoff missed — see below |

### 1.1 Contributions that improved the package

Two items in the acknowledgement are better than what the kickoff provided, and
are adopted:

1. **EA-RK-1 — object-literal punctuation.** Inserting a member between
   `platform` (ends L46) and the `drawSolids` comment (L48) makes a missing or
   duplicated comma a **load-time syntax error** that takes the entire game down,
   since `index.html` loads 25 classic scripts and a parse failure in one stops
   `Phefo.Levels` from existing at all. The kickoff did not name this. It is now
   formally part of the WP-01 risk register, and it justifies the ordering
   instruction in §6 below.

2. **Q-3 — the stale module preamble.** A real documentation gap that neither the
   architecture nor the plan assigned to a package. Ruled on in §2.

### 1.2 Factual checks

Every concrete claim in the acknowledgement was verified against the repository:
`level.js` is 98 lines; `platform` ends at line 46 and the `drawSolids` comment
begins at line 48; `Levels` members are comma-terminated and blank-line
separated; `city01` has 13 solids. All correct.

---

## 2. Answers to Engineer Questions

### Q-1 — Should `ladder()` enforce or normalise the `top < bottom` invariant?

**Ruling: No enforcement. Proceed on A-1.** Your reasoning is accepted in full,
and I want to reinforce the second half of it.

A silent swap of reversed arguments would be the worse of the two options
offered: it would **mask** exactly the authoring error that WP-03's review exists
to catch, and IR-03 already identifies ladder authoring as the highest-likelihood
risk in the plan. A defensive normalisation would convert a visible, reviewable
mistake into an invisible one.

An assertion is less harmful but still wrong here: it would make `ladder()` the
only constructor in the file that validates, breaking the symmetry with `solid()`
and `platform()` that AD-5 requires, for a constraint that Architecture §10
already assigns to authoring review.

Return a plain object literal. The invariant is documented, not enforced.

### Q-2 — Should the comment cross-reference the Architecture §10 authoring rules?

**Ruling: Yes — a pointer, not a copy.** Your instinct is right; the WP-03 author
is the next person to read that comment.

One refinement, and it matters: **reference §10, do not restate its rules.**
Reproducing "no intersecting solids", "≥14px inset from a platform edge" and the
rest in a code comment creates a second source of truth that will drift from the
architecture the first time a rule is tuned. A single sentence directing the
reader to the authoring rules is sufficient and stays correct.

### Q-3 — Which package updates the stale module preamble?

**Ruling: WP-02.** Good catch — this was an unassigned gap, not a matter of
opinion, and you were right to raise it rather than fix it unasked.

The reasoning:

- The preamble (L8–15) describes a level as "plain data: solids, a spawn point,
  camera bounds and a list of waves". It becomes incomplete the moment a level
  definition carries a `ladders` key — which is **WP-03**.
- But WP-03's file allowlist is `level01_city.js` only, and WP-05's is `game.js`
  only. **Neither package is permitted to touch `level.js`,** so neither can fix
  it without an allowlist change.
- **WP-02 already has `level.js` in its allowlist** (it adds `drawLadders`), and
  by then the ladder concept exists in that file. Updating the preamble there
  requires no allowlist change and lands before the staleness becomes real.

This is a plan-level sequencing clarification, not an architecture change: a
comment edit has no observable behaviour, so BCR is not engaged and no
architecture rework is required. It will be written into the WP-02 kickoff so it
is not lost.

**For WP-01: leave the preamble untouched**, exactly as the kickoff instructs.

### Q-4 — Confirming no PR after WP-01

**Confirmed. EA-3 is correct.** One pull request covers the whole opportunity and
is opened after G-13, per Plan §4.2. Do not open a PR after WP-01 or after any
individual package.

One clarification the plan left implicit: **pushing the feature branch between
packages is permitted and encouraged.** A push is not a pull request. Pushing
after each package protects the work against local loss and lets me review
progress without waiting for the end. Only PR creation is deferred.

---

## 3. Accepted Assumptions

All assumptions are accepted as stated. Recorded here so they are binding for the
package rather than conversational.

| # | Assumption | Status |
|---|---|---|
| A-1 | No input validation in `ladder()` | ✅ Accepted — reinforced in Q-1 |
| A-2 | No width field | ✅ Accepted |
| A-3 | Comment style follows the `platform` block's explanatory voice | ✅ Accepted |
| A-4 | No `ladders` key handling in `level.js` | ✅ Accepted |
| A-5 | No export or manifest change | ✅ Accepted |
| A-6 | Parameter order `(x, top, bottom)` is locked | ✅ Accepted — architecture-locked, not negotiable |
| EA-1 | "No new files" means no new **source** files; the four WP artifacts are still required | ✅ Accepted — the kickoff was imprecise; see §4 |
| EA-2 | Creating the feature branch is part of WP-01 and is not a source modification | ✅ Accepted |
| EA-3 | No PR after WP-01; one PR at the end | ✅ Accepted — confirmed in Q-4 |
| EA-RK-1 | Object-literal punctuation is a load-time failure mode | ✅ Accepted and **adopted into the risk register** |

---

## 4. Corrections

Two corrections. Both are to my own kickoff, not to the engineer's understanding.

### C-1 — Kickoff §5.4 wording was imprecise

§5.4 states "WP-01 creates **no** files", while §11 requires four engineering
artifacts. Read literally the two contradict.

**Correction: §5.4 applies to source files under `phefo/` only.** The engineer's
interpretation (EA-1) is correct. Engineering documents under `engineering/` are
required deliverables of every work package and are never counted against a
package's source-file allowlist. The same reading applies to every subsequent
work package.

### C-2 — Q-2 scope refinement

The kickoff offered Q-2 as an open choice without stating a constraint on *how*
the reference should be written. **Correction: reference Architecture §10; do not
reproduce its rules in the comment.** Rationale in §2, Q-2.

**No corrections to the engineer's understanding were necessary.** Scope,
architecture, protected files, validation, assumptions and risks were all
understood correctly.

---

## 5. Authorization to Begin WP-01

**WP-01 is authorised to begin immediately.**

| Item | Value |
|---|---|
| Authorised by | ROLE-003 — Technical Team Lead, under Implementation Plan Approval (H-01) |
| Branch | `feat/eo-001-ladder-climbing-enemy`, cut from `origin/main` |
| File permitted to change | `phefo/js/levels/level.js` — and nothing else |
| Commit | One commit, subject `EO-001 WP-01: ladder domain model` |
| Gate | G-01 must pass before WP-02 begins |
| Next human review point | **H-02 at G-04** — none falls between WP-01 and WP-02 |

Proceed on assumptions A-1…A-6 and EA-1…EA-3, and on the rulings in §2. No
further approval is required to complete WP-01 and continue into WP-02.

**Halt immediately and escalate (H-08)** if any of ST-1…ST-6 is met — in
particular if completing this package appears to require modifying any existing
function or any file beyond `level.js`.

---

## 6. Additional Implementation Notes

Practical guidance. None of this changes scope; it reflects what the review
surfaced.

### 6.1 Validation ordering — run `node --check` first

Because of EA-RK-1, sequence your validation so a punctuation error is caught in
one second rather than as a blank canvas in a browser:

```
1.  node --check phefo/js/levels/level.js      (G1-a)   ← always first
2.  load the game, console open                 (U-1)
3.  console assertions                          (G1-b … G1-h)
4.  play waves 1–2                              (G1-i, G1-j, U-4)
5.  git diff --name-only origin/main            (U-2, U-3)
6.  git diff phefo/js/levels/level.js           (G1-k)
```

A parse failure in any of the 25 classic scripts stops `Phefo.Levels` from
existing at all, so a browser symptom would be a blank canvas with a console
error — informative, but slower and easier to misread than a parse check.

### 6.2 Write the literal explicitly

ES5, no shorthand: `return { x: x, top: top, bottom: bottom };`. Property
shorthand (`{ x, top, bottom }`) is ES6 and would break the file's convention
even though modern browsers accept it. Nothing here is transpiled.

### 6.3 Do not add `ladders: []` to any level definition "for completeness"

`level01_city.js` is outside this package's allowlist, and an empty `ladders`
array there would be a WP-03 change landing in WP-01. Absent means none —
`World` will default it in WP-05.

### 6.4 Resist the adjacent function

`drawSolids` sits immediately below your insertion point. WP-02 adds a
**separate** `drawLadders`; it does not extend `drawSolids`. Do not begin it.

### 6.5 Record deviations as they occur

If anything diverges from this package as specified — including adopting a
defensive check after all, or discovering the preamble must change sooner —
record it in `implementation/evidence/architectural-deviations.md` at the moment
it happens, not retrospectively (Implementation Approval condition 10).

### 6.6 What "done" looks like

AC-1…AC-12 in the kickoff, with `WP-01/validation.md` recording the G-01 results
and `WP-01/evidence.md` carrying the diff summary and console output. G1-f, G1-g
and G1-k are non-negotiable: they are the entire evidentiary basis for the claim
that no ladder can reach `def.solids` and that no existing function changed.

---

**Decision:** ✅ **Accepted — WP-01 authorised to begin**
**Reviewed by:** ROLE-003 — Technical Team Lead
**Date:** 2026-08-06
**Next artifact:** `WP-01/implementation.md` (ROLE-004)
