# Feature Specification: Distinct Enemy Silhouettes

**ID:** 004 · **Branch:** `feat/004-distinct-enemy-silhouettes` · **Tier:** deep
**Created:** 2026-08-18 · **Status:** approved
**Input:** "now just make the enemies look different than the player, enemies should look creepy, or some of them funny"

## User Scenarios

### US-1 — Nothing on the street looks like you (P1)
**As a** player **I want** every enemy to read as a different creature from the
one I control **so that** the street feels populated rather than mirrored.
**Why P1:** The whole ask in one line. Every other story sharpens it, and none of
them makes sense until an enemy stops looking like a recoloured Phefo.
**Acceptance:**
- **Given** any enemy stands beside the player **When** both are still **Then** they differ in build, not only in colour and size.
- **Given** a single motionless frame with colour removed **When** the player is picked out **Then** it can be done from shape alone.

### US-2 — The dangerous ones are unsettling (P2)
**As a** player **I want** the heavy enemies to look wrong in a way I feel before
I can name **so that** dread arrives ahead of the fight.
**Why P2:** Needs US-1's per-creature build to exist first. Ships on its own once
it does, and is the half of the tone the input asked for first.
**Acceptance:**
- **Given** the heaviest enemy enters view **When** the player has never seen it before **Then** its build alone reads as threatening, before it attacks.
- **Given** an unsettling enemy is idle **When** it is doing nothing at all **Then** it still does not look at rest.

### US-3 — The weak ones are funny (P3)
**As a** player **I want** the feeblest enemies to be faintly ridiculous **so
that** the roster has range and the heavies land harder by contrast.
**Why P3:** Independently deliverable and the first thing to cut under pressure —
comedy is the flavour, dread is the point.
**Acceptance:**
- **Given** a weak enemy is walking **When** it is watched for a few seconds **Then** something about how it is built or moves is comic rather than frightening.
- **Given** a weak and a heavy enemy are on screen together **When** both are idle **Then** they read as belonging to different registers.

## Requirements

| ID | Requirement | Story |
|---|---|---|
| FR-001 | Every character MUST be able to differ from every other in build — the proportions of the body itself — and not only in colour, size and weapon. | US-1 |
| FR-002 | The player MUST be visually distinguishable from every enemy by shape alone, with colour removed. | US-1 |
| FR-003 | Each of the seven enemy kinds MUST be distinguishable from every other enemy kind by shape alone. | US-1 |
| FR-004 | A character MUST be able to carry additions beyond the basic body — growths, extra or missing parts, a misshapen head. | US-1 |
| FR-005 | The player MUST also be revised, so the contrast is deliberate on both sides rather than a side effect of changing everything else. | US-1 |
| FR-006 | The heavy enemies MUST read as threatening from build alone, before they act. | US-2 |
| FR-007 | An unsettling enemy MUST NOT look at rest while idle. | US-2 |
| FR-008 | The feeblest enemies MUST read as comic rather than threatening. | US-3 |
| FR-009 | The system MUST NOT change any character's fighting behaviour, reach, timing, hit response or collision. Appearance only. | all |
| FR-010 | Every character MUST remain readable at a glance in a crowd of six, mid-fight. | US-1 |
| FR-011 | The visible warning before an attack, the hit reaction and the death MUST remain as legible on every new build as they are today. | all |
| FR-012 | With the full final wave on screen, the game MUST feel exactly as smooth as it does today. No visible cost is acceptable, so the cost of every addition MUST be measured rather than assumed. | all |

### Key entities
| Entity | Meaning | Relates to |
|---|---|---|
| Build | A character's proportions — how long, thick, tall or squat its parts are | every character |
| Feature | An addition beyond the basic body: a growth, an extra or missing part, a misshapen head | Build |
| Register | Whether a creature is played for dread or for laughs | enemy kind |

## Success Criteria

1. With colour removed and every figure drawn at one size, all eight characters are told apart from a single still frame.
2. A viewer shown only the heaviest and the feeblest enemy, idle, sorts them into threatening and ridiculous without being told the categories exist.
3. A playthrough of every wave shows no change to any fight's difficulty, timing or outcome.
4. In the six-enemy final wave, the enemy about to attack is identified as quickly as it is today.
5. The Project Owner, watching the street, judges that it no longer looks like a fight against copies of the player.

## Edge Cases
| # | Condition | Expected behaviour |
|---|---|---|
| 1 | A character is scaled far up or down | Its build and features scale with it and stay in proportion |
| 2 | A character faces the other way | Features follow it; nothing detaches or renders behind the body wrongly |
| 3 | A character is staggered, blocking, climbing or dying | Features stay attached through every pose, including death |
| 4 | Two enemies of the same kind stand together | They read as the same creature, not as two individuals |
| 5 | A character is at the edge of the screen or behind another | Features never make it ambiguous which creature is which |
| 6 | An enemy kind added later defines no build | It falls back to something sensible rather than failing to draw |

## Out of Scope
- Any change to how any character fights, moves, aims, takes damage or dies.
- Art assets of any kind. Everything remains drawn at runtime (XI-8).
- New enemy kinds. This dresses the seven that exist.
- Levels, backdrop, weapons, pickups, HUD and menus.
- Colour as the means of distinction — colour may still differ, but it may not be what carries FR-002 or FR-003.

## Assumptions
| # | Assumption | If false |
|---|---|---|
| 1 | Every character can keep sharing one movement vocabulary; only the body drawn on it changes | Per-creature motion enters scope and the feature roughly doubles |
| 2 | Seven enemy kinds and one player is the whole cast | Any kind added mid-flight needs a build of its own |
| 3 | The current fight reads well and only the bodies are at fault | A readability problem blamed on shape is really a colour or motion problem |

## Clarifications
### Session 2026-08-18
- Q: What is this mainly for? → A: Personality and mood — the street should feel populated by things, not by copies of the player. Readability is a constraint (FR-010), not the goal.
- Q: Which are funny rather than creepy? → A: The weak ones. Comedy where the threat is low, dread where it is high (US-2, US-3).
- Q: Does the player change too? → A: Yes — Phefo is revised so the contrast is deliberate on both sides (FR-005).
- Q: How far from the current figure may enemies go? → A: Proportions **and** additions to the silhouette. Not free rein: they stay recognisably the same drawing (FR-001, FR-004).
- Q: What frame-rate cost is acceptable with a full wave on screen? → A: None visible. Cost is measured, not assumed (FR-012).

## Review Checklist
- [x] No `[NEEDS CLARIFICATION]` marker remains
- [x] No technology, file name, API or schema appears anywhere above (Article III)
- [x] Every requirement is testable and unambiguous
- [x] Every success criterion is measurable and technology-agnostic
- [x] Every story is independently deliverable, and P1 alone is usable
- [x] Out of scope names the assumptions a reader would otherwise make
- [x] Within the tier's line cap
