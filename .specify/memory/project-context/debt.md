<!-- CAP 80 lines -->
# Technical Debt — phefo

| ID | Debt | Cost of leaving it | Trigger to fix | Opened |
|---|---|---|---|---|
| TD-001 | The 120 px vertical awareness gate (INV-7) still applies to the four base types. Feature 001 routed around it with the climber's own elevation model rather than raising it. | Platforms remain safe from knifeman, swordsman, gunman and archer; every future "follow me up" behaviour re-solves it per type. | A feature that needs a base type to engage across height. | 2026-08-09 |
| TD-002 | No committed test harness. Every verification rebuilds the `vm` sandbox from scratch. | Repeated setup cost and inconsistent coverage per change. | When a second feature needs behavioural proof. | 2026-08-09 |
| TD-003 | `Combat.applyDamage`'s return value means "clean hit", not "damage dealt" (INV-9) — a name that invites misuse. | Every new caller is a latent bug. | Any refactor of `js/combat/hitbox.js`. | 2026-08-09 |
| TD-005 | `Levels.ladder`'s doc comment cites "the level-authoring rules in the EO-001 architecture (§10)" — a document that no longer exists. The rules now live in `project-context/architecture.md` §Ladder authoring rules. | A reader follows a dead reference and concludes the rules were lost. | Next feature touching `js/levels/level.js`. | 2026-08-09 |
| ~~TD-004~~ | ~~Uncommitted `Levels.ladder()` residue.~~ **RESOLVED 2026-08-09** — it was feature 001's T001, and feature 001 shipped: commits `f46acd2`…`b5eeb58`, merged in PR #9. | — | closed | 2026-08-09 |
