# Tasks: Brute Enemy

**Plan:** `plan.md` · **Tier:** standard
**Total:** 3 tasks · **Parallelizable:** 0 · **Status:** done, awaiting release gate

## Phase 1–2 — Setup and Foundational
None. No project init (XI-9); nothing blocks the single user story.

## Phase 3 — US-1 An opponent you have to walk away from (P1)
- [x] T001 [US-1] Brute definition and load order — `js/entities/enemies/brute.js` (new), `index.html` — `node --check` in load order; registry entry spawns with the specified profile
- [x] T002 [US-1] Encounter placement — `js/levels/level01_city.js` — one brute in wave 3 and one in wave 5; every existing entry unchanged

**Checkpoint:** reach wave 3 — it engages, shrugs off hits, and can be escaped.
## Phase 4 — Polish
- [x] T003 Headless validation and evidence — no repository file — the full check set below, recorded

## Task detail

### T001 — Brute definition and load order
**Goal.** Register the brute as pure data, loaded in the one slot that satisfies
both ordering constraints, while no encounter references it yet.
**Done when.** The new file matches its peers in shape — one definition call and
nothing else · one `<script>` tag added, no other line changed · after boot the
registry entry spawns with the agreed profile · `node --check` passes across the
load order · the game boots clean · CR-normalised diff shows exactly two paths.
**Touches.** `phefo/js/entities/enemies/brute.js` (new) · `phefo/index.html`
(one added line only).
**Forbidden.** The shared enemy file — everything needed is already a config key
there, and editing it fails FR-009. The four existing definitions. The weapon
table and stick-figure renderer — no new weapon. The level file — that is T002.
**Must not change.** Behaviour of the four existing types — structurally: their
files are never opened, the shared file is never opened, and a new registry key is
unreachable by any existing encounter entry.
**Notes.**
- **The exact config keys the shared machine reads** — anything else is silently
  ignored, so do not invent one: `type weapon hp speed aggro scale knockScale
  blocks telegraph attackDur recover hitAt shotTimes color warnColor attack`
  (plus `ranged preferred minRange` for ranged types, which this is not). Verify
  no unknown key is present before calling the task done (XI-11).
- **Fixed profile:** hp 150 · speed 78 · aggro 380 · scale 1.24 · knockScale 0.28
  · telegraph 0.58 · attackDur 0.50 · recover 0.70 · hitAt 0.20. Do **not** set
  `blocks` — its absence is the design (FR-005). Do **not** set `shotTimes` — a
  second hit would eat the recovery window FR-004 rests on.
- Colours: heavier and cooler body than the existing heavy type, hotter warn
  colour, so the wind-up reads at a glance on the largest silhouette.
- The attack mirrors the existing heavy type's structure, with a heavier camera
  shake and committed step. Never touch `hp` directly (XI-6).
- Load order is load-bearing (INV-4): the registry is created by the shared enemy
  file and read at IIFE time, and level files name types — so the tag goes after
  the other definitions, and `js/core/game.js` stays last. ES5 only (XI-2);
  match the peers' comment style — the role, not the code.

### T002 — Encounter placement
**Goal.** Put the brute into the progression so it is met alone before it is met
under pressure, altering no existing encounter.
**Done when.** Waves 3 and 5 each gain exactly one entry · every existing entry
keeps its type and position · both brutes stand on the road, vertical coordinate
omitted as every existing entry omits it · CR-normalised diff shows one path,
added lines only.
**Touches.** `phefo/js/levels/level01_city.js` — the encounter array **only**.
**Forbidden.** Geometry, pickups, camera bounds, start position, timing and the
level's decorative hook. Every other file.
**Must not change.** The difficulty of waves 1, 2 and 4 — untouched entirely.
**Notes.**
- **INV-7 is why the vertical coordinate is omitted.** Enemies only acquire a
  target within 120 px of their own height, and every raised surface here sits
  128–196 px above the road, so a brute placed on one would stand inert forever.
  A comment already records this trap for another enemy — do not add a second.
- **INV-13:** keep both placements clear of the solid geometry at x 430–534 and
  980–1108, or the brute spawns embedded and never moves.
- Existing entries sit 150–400 px apart across x 0…2700. Place the wave-3 brute
  far enough from its wave-mates that only one engages at a time, and the wave-5
  brute where it blocks the approach to the ranged pair.

### T003 — Headless validation and evidence
**Goal.** Prove the mechanics, and prove nothing else changed.
**Done when.** `node --check` recorded for the whole load order · a transcript
showing the full attack cycle · hits-to-kill recorded against both existing melee
types · knockback recorded against the lightest type · the shared enemy file and
all four existing definitions confirmed identical to `HEAD`, line endings
normalised (XII-4).
**Touches.** No repository file. The harness is throwaway (X-3).
**Forbidden.** Committing the harness, adding a test framework or dependency
(XI-9), and tuning any value to make a check pass — a failing check is a finding.
**Notes.**
- Build it per Article X, whose traps all apply: INV-10 (reset `invuln`,
  `blocking`, `dirX` or damage silently does not land — you will conclude the
  brute is invincible), the recursively-callable audio stub, and INV-13.
- Step at exactly 1/120; at 1/60 a 0.58 s telegraph spans a different number of
  frames and the transcript lies (INV-2).
- Compare against **both** existing melee types — survivability against the heavy,
  knockback against the light. One comparison proves less than it appears to.

## Dependencies
```
T001 → T002 → T003
```

## Parallel execution
None — T002 needs the type registered, T003 needs it placed.
