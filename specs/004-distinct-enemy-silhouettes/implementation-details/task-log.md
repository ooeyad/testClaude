# Task log — 004 Distinct Enemy Silhouettes

Not auto-loaded. Evidence per Article VI: the literal command and its real output.

## T001–T009, T011

**Date:** 2026-08-18 · T010 remains open — it is the half only looking can settle.

### Changed

- `render/stickman.js` — optional bone set, per-character head and datum, height
  normalisation, the eight-feature vocabulary and its two-pass drawing.
- `render/poses.js` — idle gains an optional unrest scalar.
- `entities/enemy.js`, `entities/phefo.js` — plumbing, and Phefo's own build.
- `entities/enemies/*.js` × 7 — one appearance block each.
- `project-context/architecture.md`, `domain.md` — build, features, unrest.

### Checks

`node --check` in load order: `PARSE OK`. Two harnesses, 38 + 16 = **54 checks,
0 failures**, plus **003's full 57-check regression re-run green** — which is how
FR-009 ("appearance only") is evidenced rather than asserted.

```
        phefo      build yes  features [-]
        knifeman   build yes  features [antenna,tail]
        swordsman  build yes  features [jaw]
        gunman     build yes  features [jaw,spines]
        archer     build yes  features [spines,tail]
        brute      build yes  features [hunch,horns]
        climber    build yes  features [antenna,stub]
        beast      build yes  features [horns,jaw,hunch,spines]
  PASS  every character in the game has a build   8 characters
  PASS  only Phefo carries no features, by design (FR-002)
  PASS  <all eight> keeps standing height   worst delta 0.00549 px
  PASS  the closest pair still differs by more than a stroke width
        phefo vs swordsman = 3.44 px
  PASS  the whole wave costs under 6 extra ops per character
        93 path ops undressed -> 106 dressed, +13 across 7 figures
  PASS  the beast is still 104 px and still armoured   h=104 armor=0.18
  PASS  no build leaked into a fighting value
  PASS  all eleven poses draw with every feature attached   11 poses ok
  PASS  both facings draw the same feature strokes   17 vs 17
  PASS  an unknown feature name is ignored, not thrown
```

The final harness reads each build back out of the draw options the character
actually assembles, rather than from a copy of `data-model.md` — a copy would
only prove the spec agrees with itself.

### Deviations

None from the design. DD-003 held exactly: extended height is preserved to
7.11e-15 px and the worst posed residual across the shipped cast is 0.005 px.

### Three verification mistakes, all mine, none in the code

① Checked foot position **in pelvis space**, which *must* move when leg length
changes — `groundLock` re-pins the sole, and that re-pinning is the mechanism.
② Then measured to the head **centre** rather than the crown; the two differ by
the head radius, which is precisely what a build varies. Phefo's apparent
"0.448 px error" was exactly `0.08 × 5.2`. ③ On the strength of ②, nearly wrote a
2 % height residual into `contracts/skeleton.md` as an accepted design bound —
which would have enshrined a measurement bug as a limitation. The real figure is
0.005 px, and no such bound exists.

### One process failure

The first three commits (T001–T003) were made on `feat/003-add-beast-enemy` and
pushed into PR #12, because the branch was never switched. Moved to
`feat/004-distinct-enemy-silhouettes`; 003 was reset and force-pushed with lease
back to its own fifteen commits. PR #12 verified clean afterwards. XII-1 says one
branch per feature and nothing enforced it.

### Still open

**T010.** Every number was chosen by reasoning about what reads as creepy. None
of it has been looked at. Expect several to be wrong.
