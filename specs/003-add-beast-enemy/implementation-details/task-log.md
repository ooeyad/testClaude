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

### Deliberately not done (T001/T002)

- No beast file, no script tag, no wave change — T003 onward.
- Stagger suppression was **not** added to `applyDamage`. It is the beast's own
  rule and belongs in its own file (T003), not in the funnel.
- INV-7's wording in `invariants.md` is now imprecise for types that set `sight`.
  Left for T011, which owns the memory updates; noted here so it is not lost.

---

## T003 · T004 · T005 · T006 — the P1 slice

**Date:** 2026-08-18 · **Status:** done · Commits `352beeb`, `03e6556`,
`55b5f70`, `ef6982f` — one per task (XII-2), each leaving the tree runnable.

### Acknowledgement

The subclass owns the vulnerability window and nothing else; the type definition
is data; the script tags are load order; the wave is level data.

**Assumptions.** ① `this.armor = 1` for "unprotected" rather than deleting the
property — a no-op multiply, and it keeps the field a number in every state.
② Zeroing stagger only while armoured, so the window is also the only place the
beast can be interrupted. **Questions.** None blocking. **Context gaps.** None.

### Changed

- `phefo/js/entities/beast.js` — new. `P.Beast`, armour window on `state ===
  'recover'`, stagger cleared while armoured, then delegates to the parent.
- `phefo/js/entities/enemies/beast.js` — new. The type definition and one sword
  sweep. Elevation branching is T008.
- `phefo/index.html` — two script tags, subclass first.
- `phefo/js/levels/level01_city.js` — the final wave entry only.

### Deviations

**One value corrected against `data-model.md` before wiring.** `telegraph` was
first written 0.58, which is the *wounded* value (0.80 × 0.72) and would have
tied the brute rather than being the longest wind-up in the game. Corrected to
0.80 before any check was run.

**One documented instruction was wrong and was not followed.** The task details
for T003/T004 say new `.js` files "must be written CRLF (INV-14)". The repository
*stores* LF — `git show HEAD:phefo/js/entities/climber.js` has 0 CR bytes against
251 LF — and `core.autocrlf=true` produces the CRLF working copies INV-14
describes. Files were written LF and the working copies normalised to CRLF, so
both the blob and the working tree match every other file. INV-14's wording
should say which side it means; noted for T011.

### Checks

**X-1 — syntax, in load order:** `PARSE OK`, no FAIL lines. Load order confirmed:
`entities/climber.js` 40, `entities/beast.js` 41, `enemies/climber.js` 47,
`enemies/beast.js` 48, `core/game.js` 59 (last).

**X-2 — behaviour, throwaway `vm` harness** (not committed, X-3):

```
T005 - wiring
  PASS  P.Beast exists and the type resolves to it
  PASS  spawn("beast") builds a Beast, not a plain Enemy
  PASS  body is the biggest in the game   h=111.8
T003 - the window
  PASS  armoured hit is heavily reduced   took 6.12 of 34
  PASS  hit in the window lands in full   took 34
  PASS  the window is worth several times a mistimed swing   5.6x
  PASS  armoured hit does not stagger it   stagger=0
  PASS  and does not knock it out of its wind-up   state=telegraph
  PASS  a hit in the window does stagger it   stagger=0.24
  PASS  status timers tick once per step, not twice (INV-19)   invuln=0.9000
  PASS  nothing wrote to the shared cfg object (INV-NEW-1)
T004 - it fights
  PASS  it winds up and swings at a player in reach   after 86 steps
  PASS  the swing hurt the player   player hp=0
  PASS  the sword can reach a standing player at its preferred range (44 px)
        connects at gaps: 30, 40, 44 px
T006 - the final wave
  PASS  the last wave contains exactly one beast
  PASS  no brute in the last wave
  PASS  escorts are all existing types
  PASS  earlier waves untouched: wave 4 still has its brute
  PASS  no spawn is wedged in geometry (INV-13)   all six moved or engaged

19 passed, 0 failed
```

The first run of that harness failed on "the swing hurt the player". The harness
was wrong, not the code — it stopped stepping at the first frame of `attack`,
before `hitAt` at 0.22 s could arrive. Recorded because a check that was fixed
until it passed is worth being explicit about.

### Flagged for T010 — the reach margin is thin

The beast closes to `reach × 0.82` = 44.3 px and its sword connects there, but
the probe shows it connects at 30, 40 and 44 px and **not at 50**. At scale 2.15
the chest origin sits 69 px up while a standing player's centre is 26 px up, so
the swing arrives steeply and the band where it lands is about 14 px wide. It
works, and it has almost no margin: separation shove, a player stepping back
during the 0.80 s wind-up, or any later change to `scale` could put the beast
into swinging at air. Tuning candidates are the sword's reach for this type, the
preferred-range multiplier, or `scale`. Not touched here — T004's values came
from the approved design, and tuning is T010's job.

### Deliberately not done

- No slam and no elevation branching — T008. Until then a player on a fire escape
  is safe, which is FR-010 unmet by design at this point in the sequence.
- No wounded stage — T007. The beast currently fights the same at 5 % as at 100 %.
