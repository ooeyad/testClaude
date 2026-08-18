# Task details — 004 Distinct Enemy Silhouettes

Not auto-loaded. The implementer reads **only its own entry**, plus `state.json`,
`invariants.md` and Articles X–XII. Each entry is a contract, not a pointer.

## T001 — Optional bone set, per-character head and datum, height normalisation

**Goal.** A character can be drawn with its own proportions without moving
anything the game measures (FR-001, FR-009, DD-001–DD-004).
**Done when.** The skeleton builder accepts an optional bone set as a trailing
parameter; head radius and the standing datum derive from whichever set is in
use; a figure drawn with re-proportioned bones has the same standing height and
the same foot positions as the same figure drawn without, within a pixel; and a
call that passes no bone set produces output identical to today.
**Touches.** `js/render/stickman.js` — the builder, the two places the head
radius is used, and the datum used for the standing shift. Nothing else.
**Do not touch.** `js/entities/*` — nothing supplies a bone set yet and that is
correct; this task is invisible on screen by design. Do not change the base bone
table's values: it stays the reference every build is a multiplier over.
**Must not change.** Position is feet and the collision box is `52 × scale`
(INV-1). A build must never move a foot or the top of the head. The far-limb
dimming, the draw order and the death rotation stay exactly as they are.
**Notes.** ① Normalisation is the whole task: apply the multipliers, measure the
resulting standing height, then uniformly rescale the bone set so it matches what
the character had before. Multiply-then-fit, not fit-each-bone. ② The standing
datum is currently derived from thigh and shin; a build that changes leg length
changes it, so it must be computed per character or the figure floats or sinks.
③ The head is drawn twice — the body and the white hit flash. Both read the
radius; missing the second leaves a flashing figure with a different head.
④ Keep the base table exported as it is; nothing outside the file reads it, but
nothing needs to break either. ⑤ CRLF working copy, LF blob (INV-14).

## T002 — The feature vocabulary and its two-pass drawing

**Goal.** A character can carry a few extra strokes — horns, a jaw, a hunch, a
tail, spines, a stub arm, a belly — attached to its skeleton (FR-004, DD-005,
DD-006).
**Done when.** A named feature list draws attached to the right joint, mirrors
with the body, survives every pose, and costs no more than the budget; a
character with no feature list draws exactly as before.
**Touches.** `js/render/stickman.js` — a feature-drawing routine beside the
weapon-drawing one, and two call sites in the draw path: one with the far limbs,
one with the near.
**Do not touch.** The weapon routine itself. The temptation is to generalise the
two into one shape system; they are a switch and some strokes each, and merging
them would be an abstraction with one caller (Article V).
**Must not change.** The existing draw order, the far-limb alpha, or the weapon's
position in the near hand.
**Notes.** ① Draw inside the existing transform, so mirroring and scaling are
free and a feature cannot detach. ② A feature declares behind or in front; behind
ones draw in the dimmed pass and inherit its alpha rather than setting their own.
③ Attach to a joint the builder returns, never to a screen position — that is
what keeps features attached through death and climb. ④ Budget is six stroke
operations per character; no gradient, shadow, blur, or per-frame allocation.
This runs eight times a frame at 120 Hz. ⑤ An unknown feature name must be
ignored silently, not throw — level and type data is unvalidated everywhere else.

## T003 — Idle unrest as an optional scalar

**Goal.** A creature can idle more restlessly than another without a new pose
(FR-007, DD-007).
**Done when.** The idle pose accepts an optional scalar that scales its
animation's amplitude; omitted, the pose is unchanged.
**Touches.** `js/render/poses.js` — the idle pose only.
**Do not touch.** Any other pose. Walk, telegraph, stagger and death are shared
motion and stay shared (spec Assumption 1).
**Notes.** ① Optional trailing parameter, default preserving (XI-12). ② Scale the
amplitude, not the rate: a faster idle reads as a different animation, a wider
one reads as the same creature being twitchy. ③ Nothing supplies it yet.

## T004 — Plumb build, features and unrest into drawing

**Goal.** What a character *is* reaches how it is drawn (FR-001, DD-008).
**Done when.** An enemy type's build, feature list and unrest reach the draw
call; the player's do too, by the same path; a character declaring none of them
looks exactly as it does today.
**Touches.** `js/entities/enemy.js` and `js/entities/phefo.js` — the draw options
each assembles, and the idle pose call.
**Do not touch.** Anything about updating, fighting or collision. This is three
values moving from a config block into a draw call.
**Must not change.** No branch on "is this the player" anywhere. The player is a
character with a build like any other (DD-008, Article V).
**Notes.** ① Read from the config for enemies; the player has no registry entry,
so its values are constants in its own file. ② Do not write to `cfg` (INV-22).
③ Pass through unchanged when absent, so the tree stays revertible (Article VIII).

## T005 — Phefo's own build

**Goal.** The player is deliberately shaped, not the default (FR-002, FR-005).
**Done when.** Phefo draws with the build in `data-model.md`, is distinguishable
from every enemy by shape alone with colour removed, and its standing height and
feet are unchanged.
**Touches.** `js/entities/phefo.js` — its build constants only.
**Do not touch.** The player's collision box, speed, reach or any timing. Nothing
about how Phefo plays changes because of how Phefo looks (FR-009).
**Notes.** ① Phefo is the only figure with nothing hanging off it. That absence
is the design — it is what makes everything else read as *other*. Do not give the
player a feature "for balance". ② Verify against QS-1 before moving on: the
player is the one character where a height change would be felt immediately.

## T006 — Builds for swordsman, gunman, archer

**Goal.** The composed middle of the roster reads apart (FR-003).
**Done when.** All three carry their builds and features from `data-model.md`,
and no two characters in the game produce the same joint positions.
**Touches.** `js/entities/enemies/swordsman.js`, `gunman.js`, `archer.js` — one
data block each.
**Do not touch.** Any fighting value in those files — hp, speed, reach, timings,
aggro. Appearance keys only.
**Notes.** ① The swordsman is deliberately the least distorted enemy: it is the
disciplined one, and something has to be near-neutral or "distorted" stops
meaning anything. ② Use only keys the renderer reads; unknown ones are ignored
silently (XI-11).

## T007 — The heavies: brute and beast

**Goal.** The two dangerous ones read as threatening from build alone (FR-006,
FR-007).
**Done when.** Both carry their builds, features and unrest; the beast is the
most distorted figure in the game; neither looks at rest while idle.
**Touches.** `js/entities/enemies/brute.js`, `beast.js` — appearance keys only.
**Do not touch.** The beast's `scale`, which is held at 2.00 by measurement, not
taste — its sword stops connecting above that (TD-007). Height is `scale`'s job
and `scale` is not this feature's (DD-003).
**Notes.** ① A small head on a wide torso is the strongest dread cue available
without art; it is doing more work here than the horns. ② The beast is already
104 px tall — the build is what makes that height frightening rather than merely
large.

## T008 — The feeble two: knifeman and climber

**Goal.** The weakest enemies are funny (FR-008).
**Done when.** Both carry their builds, features and unrest, and read as comic
beside a heavy.
**Touches.** `js/entities/enemies/knifeman.js`, `climber.js` — appearance only.
**Notes.** ① These two are the closest pair in the cast — both scrawny, both
comic — so the features are what separate them: one gets a useless third arm, the
other a tail. Check them against each other, not only against the heavies.
② Comedy here is proportion, not motion: over-long arms on short legs, a head too
small, and a restless idle.

## T009 — Measure the cost

**Goal.** FR-012 is a measurement, not a claim (DD-010).
**Done when.** Path operations per frame are counted with the full final wave on
screen, with builds and features on and off, and the difference is inside the
budget with no character over six stroke operations of features.
**Touches.** Nothing in the repo — harness only, never committed (X-3).
**Notes.** ① If a build cannot be drawn inside the budget, the build changes, not
the budget. ② Count operations, not wall-clock: a headless proxy has no useful
timing, and operation count is what actually scales with the cast.

## T010 — Tuning pass

**Goal.** The numbers, looked at rather than reasoned about.
**Done when.** The Project Owner has watched the street and judges SC-1…SC-5 met.
**Touches.** The eight build blocks.
**Notes.** ① Every number in `data-model.md` was chosen by reasoning about what
reads as creepy. None of it has been seen. Expect several to be wrong.
② Record the literal harness output as evidence for Article VI.

## T011 — Memory updates

**Goal.** Leave the map matching the territory.
**Done when.** `architecture.md`'s rendering section no longer says characters
differ "only by scale, colour and weapon" — that sentence becomes false the
moment T005 lands; `domain.md` carries build, feature and unrest as nouns.
**Touches.** `.specify/memory/project-context/architecture.md`, `domain.md`.
**Notes.** ① Caps: architecture 200, domain 120. ② The claim that one skeleton is
why the project has no art is still true and should stay — it is now one skeleton
with per-character proportions, which is a stronger version of the same point.
