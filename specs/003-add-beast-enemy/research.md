# Research — 003 Late-Game Beast

Three unknowns that would have changed the design if they had resolved the other
way. Each was settled by reading the code named beside it.

## R-1 — Can the damage funnel express resistance without a new system?

**Question.** FR-012 needs the beast to shrug off attacks outside one window.
Does anything already do that?

**Finding.** `Combat.applyDamage` owns four levers and none of them fit:
`invuln` refuses the hit before any feedback is produced; `blocking` is close —
15 % chip damage and sparks — but sets `blockStun` on the target, and the shared
machine freezes on `blockStun > 0`, so a flurry would hold the beast still;
`knockScale` moves the body without protecting it; `onHurt` is called *after*
`hp` is already decremented, so it can only refund.

**Consequence.** Resistance has to be a multiplier applied before the subtraction
— DD-002. One line, but in the funnel every attack in the game runs through,
which is what makes this feature deep-tier.

## R-2 — Does an existing attack primitive reach platform height?

**Question.** FR-010 needs the beast to threaten a player above it without
climbing. Building a vertical attack from scratch would be a new system.

**Finding.** `Combat.explode(x, y, radius, damage, faction, world)` selects
targets by distance from a centre with linear falloff, and performs **no
line-of-sight or solid test**. The level's raised surfaces sit 128–196 px above
the road. A slam centred on the beast's feet with a radius in that range reaches
a player standing on any of them.

**Consequence.** DD-006. The primitive was written for a bomber that does not
exist yet; this is its first caller. Falloff means the top of the walkway is the
weakest place to be hit, not a safe one — which is the trade FR-010 asks for.

## R-3 — What stops an enemy pursuing across the level?

**Question.** FR-011 says the player must not be able to end the fight by walking
away. What actually blocks pursuit today?

**Finding.** `Enemy.walk` returns without moving when `hitWall === dir`, and
`Physics.moveAndCollide` sets `hitWall` on any horizontal collision. The road
carries five solids 46–118 px tall. **No enemy in the game can pass any of
them** — this is existing behaviour, not something the beast introduces, and it
means the player can already stall every melee type behind cover.

**Consequence.** FR-011 cannot be met literally without changing shared physics.
The plan's open question puts the choice to the Project Owner, and Complexity
Tracking row 2 records the residual either way.
