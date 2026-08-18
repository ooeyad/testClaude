# Research — 004 Distinct Enemy Silhouettes

Two unknowns that would have changed the design if they had resolved the other
way.

## R-1 — What is a character's drawn height allowed to do?

**Question.** FR-001 wants bodies to differ in build. FR-009 forbids any change to
fighting behaviour, reach, hit response or collision. Can a build make a creature
taller?

**Finding.** No, not without breaking the second one. A character's collision box
is `52 × scale` tall and is computed from `scale` alone — the drawing never
enters into it. Melee selects targets by distance to a target's *centre*, which
is derived from that same box height, and the health bar is positioned from it
too. So a build that draws 20 % taller than its box produces a creature that is
struck where it does not appear to be, has its health bar across its face, and
whose reach no longer matches its arms.

**Consequence.** DD-003: a build redistributes proportions and is normalised back
to the height the character already had. Shape and size become separate knobs —
`scale` is the one that moves the box, and it already exists. The cost is that
"towering" is a `scale` decision and "hunched" has to come from posture rather
than from shorter legs.

## R-2 — Can per-character features be afforded at all?

**Question.** FR-012 allows no visible cost with the full final wave on screen.
Features are extra drawing on every character every frame. Is the budget there?

**Finding.** The existing figure costs on the order of a dozen path operations —
eight limb strokes, a torso, a filled head, plus a weapon of a few strokes and
roughly the same again when the white hit flash is active. Weapons already prove
the pattern is affordable: every armed character in a six-enemy wave draws one
every frame today, and the game holds.

A feature built to the same budget — a handful of strokes, no gradients, no
per-frame allocation, no shadow or blur — is the same order of cost as the weapon
already in that character's hand. The one thing that would not be affordable is
per-feature state or anything that allocates, because it runs eight times a frame.

**Consequence.** DD-005 puts feature shapes beside weapon shapes, drawn the same
way, and `data-model.md` sets an explicit stroke budget per feature. DD-010 makes
FR-012 a measurement — path operations per frame with the final wave on screen,
before and after — rather than a claim. If a build cannot be drawn inside the
budget, the build changes, not the budget.
