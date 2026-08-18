# Task log — 003 Late-Game Beast

Not auto-loaded. Evidence per Article VI: the literal command and its real output.

---

## T001 — Armour multiplier in the damage funnel · T002 — `cfg.sight` and `cfg.lineWidth`

**Date:** 2026-08-18 · **Status:** done · Run together; `[P]`, different files,
neither reads the other.

### Acknowledgement

Both tasks add an optional read with a preserving default, so the game plays
identically until something sets the new property. T001 puts a multiplier in the
one funnel every attack runs through; T002 turns two literals in the shared enemy
machine into config reads.

**Assumptions.** ① No existing entity or type sets `armor`, `sight` or
`lineWidth`. Verified — `grep -rn "armor\|\bsight\b\|lineWidth" js/` returns no
`armor` at all, no `sight` config key, and 30 `lineWidth` hits that are every one
a canvas property or the player's own draw options, never an enemy type key.
② `armor` guarded with `!= null` rather than truthiness, matching the file's
existing `knockScale == null` idiom, so an explicit `armor: 0` would mean
immunity rather than being silently ignored.

**Questions.** None blocking. **Context gaps.** None — both detail entries were
sufficient; neither `spec.md` nor `plan.md` was opened.

### Preconditions

Gates: specification and design both approved. Dependencies: none (foundational).
Working tree clean at `052f5df` before starting; no unrelated changes carried in.

### Changed

- `phefo/js/combat/hitbox.js` — one guarded multiplier plus its comment, placed
  after the `invuln` refusal and before the guard branch.
- `phefo/js/entities/enemy.js` — `cfg.sight || 120` in the `canSee` expression;
  `cfg.lineWidth || 3.0` in the `draw` options.

### Deviations

None. No file outside `Touches` was edited.

### Checks

**X-1 — syntax, in load order.**

```
$ cd phefo && for f in $(grep -o 'src="[^"]*"' index.html | sed 's/src="//;s/"//'); do
    node --check "$f" || echo "FAIL $f"; done
EXIT=0 (no FAIL lines)
```

**X-2 — behaviour, throwaway `vm` harness** (not committed, X-3):

```
T001 - armour multiplier in the damage funnel
  PASS  no armor property -> damage unchanged   hp=60
  PASS  armor 0.2 -> one fifth lands   hp=92
  PASS  armoured clean hit still returns true (INV-9)   ret=true
  PASS  armoured hit still flashes and records direction   flash=1
  PASS  armour composes with a guard (0.2 x 0.15)   hp=98.8
  PASS  blocked hit still returns false (INV-9)   ret=false
  PASS  reduced damage still routes through kill   hp=0
  PASS  i-frames still refuse before armour is read (INV-10)

T002 - cfg.sight and cfg.lineWidth on the shared machine
  PASS  INV-7 holds for knifeman (152 px up, still blind)
  PASS  INV-7 holds for swordsman (152 px up, still blind)
  PASS  INV-7 holds for gunman (152 px up, still blind)
  PASS  INV-7 holds for archer (152 px up, still blind)
  PASS  INV-7 holds for brute (152 px up, still blind)
  PASS  INV-7 holds for climber (152 px up, still blind)
  PASS  cfg.sight 240 -> the same 152 px gap is seen
  PASS  lineWidth defaults to 3.0 when unset   got=3
  PASS  cfg.lineWidth is honoured   got=4.6

17 passed, 0 failed
```

All six existing types were tested, not a sample: INV-7 is the invariant this
change is most likely to falsify, and "the ones I thought to check" is not
evidence. Probe entities were spawned at x 1300 on open road — clear of geometry,
or nothing moves and the AI reads as broken (INV-13).

**Scope (XII-4, normalised).**

```
$ git diff --ignore-cr-at-eol --stat
 phefo/js/combat/hitbox.js  | 7 +++++++
 phefo/js/entities/enemy.js | 6 ++++--
 2 files changed, 11 insertions(+), 2 deletions(-)
```

### Deliberately not done

- No beast file, no script tag, no wave change — T003 onward.
- Stagger suppression was **not** added to `applyDamage`. It is the beast's own
  rule and belongs in its own file (T003), not in the funnel.
- INV-7's wording in `invariants.md` is now imprecise for types that set `sight`.
  Left for T011, which owns the memory updates; noted here so it is not lost.
