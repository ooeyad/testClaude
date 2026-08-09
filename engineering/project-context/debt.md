<!-- CAP 80 lines -->
# Technical Debt — phefo

| ID | Debt | Cost of leaving it | Trigger to fix | Opened |
|---|---|---|---|---|
| TD-001 | Enemy vertical awareness is a hard 120 px gate (INV-7), which makes every platform in `level01_city` a safe zone. | Elevated play space is inert; any "enemies should follow upward" feature must deal with this first. | Next opportunity touching enemy targeting. | 2026-08-09 |
| TD-002 | No committed test harness. Every verification rebuilds the `vm` sandbox from scratch. | Repeated setup cost and inconsistent coverage per change. | When a second opportunity needs behavioural proof. | 2026-08-09 |
| TD-003 | `Combat.applyDamage`'s return value means "clean hit", not "damage dealt" (INV-9) — a name that invites misuse. | Every new caller is a latent bug. | Any refactor of `js/combat/hitbox.js`. | 2026-08-09 |
| TD-004 | An uncommitted `Levels.ladder(x, top, bottom)` sits in `js/levels/level.js` — EO-001 residue, called by nothing, with a comment citing an architecture document no longer in the tree. | Any `git add -A` sweeps it into an unrelated PR; it read as a scope breach during EO-002 review (RV-001). | Before the next commit touching `phefo/`. Revert it, or land it as its own EO-001 residue commit. | 2026-08-09 |
