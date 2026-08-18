# Feature Specification: Late-Game Beast

**ID:** 003 · **Branch:** `feat/003-add-beast-enemy` · **Tier:** deep
**Created:** 2026-08-18 · **Status:** approved
**Input:** "add a new enemy at later levels which is hard to beat, it is really a big beast"

## User Scenarios

### US-1 — The final wave has a headliner (P1)
**As a** player **I want** the last wave to be anchored by a single enormous
opponent fought alongside escorts **so that** the level ends in a climax instead
of one more crowd.
**Why P1:** A beast that arrives in the final wave and is genuinely dangerous is
already playable on its own; stages and elevation only sharpen it.
**Acceptance:**
- **Given** the earlier waves are cleared **When** the final wave begins **Then** one beast arrives with escorts, visibly larger than every other enemy.
- **Given** the beast is alive **When** the player trades blows with it head-on **Then** the player loses that exchange.
- **Given** the beast is defeated and no escorts remain **When** the wave ends **Then** the level completes as it does today.

### US-2 — The fight changes as the beast weakens (P2)
**As a** player **I want** the beast to fight differently as I wear it down **so
that** the encounter has rules of its own rather than being a bigger version of
an enemy I already know.
**Why P2:** Builds on US-1; without US-1 there is nothing to change.
**Acceptance:**
- **Given** the beast has taken heavy damage **When** it crosses into a new stage **Then** the change is signalled by something seen or heard before it takes effect.
- **Given** the beast has changed stage **When** it next attacks **Then** at least one thing about its threat differs from the previous stage.

### US-3 — High ground is not a hiding place (P3)
**As a** player **I want** retreating to a raised surface to cost me something
**so that** the climax cannot be won by standing somewhere the enemy ignores.
**Why P3:** Valuable but not required for the fight to ship; it closes an escape
the current enemies all leave open.
**Acceptance:**
- **Given** the beast is alive **When** the player stays on a raised surface **Then** the player is still under threat and cannot win from there without engaging.

## Requirements

| ID | Requirement | Story |
|---|---|---|
| FR-001 | The system MUST add one new enemy kind, the beast, distinguishable at a glance from every existing enemy. | US-1 |
| FR-002 | The beast MUST appear only in the final wave, and only one MUST be present at a time. | US-1 |
| FR-003 | The system MUST NOT change the composition, pacing or difficulty of any earlier wave. | US-1 |
| FR-004 | The beast MUST withstand substantially more sustained attack than any existing enemy. | US-1 |
| FR-005 | The beast MUST NOT be reliably interrupted, staggered or pushed back by ordinary attacks. | US-1 |
| FR-006 | The beast MUST warn the player before every attack, with enough time to react. | US-1 |
| FR-007 | A fixed group of escorts MUST arrive alongside the beast and MUST NOT be replaced or reinforced. Defeating an escort MUST be permanent progress. | US-1 |
| FR-008 | The beast MUST fight in exactly two stages — whole, then wounded once about half its health is gone. Wounded MUST be the more dangerous of the two, and the opening of FR-012 MUST be harder to take there without disappearing. | US-2 |
| FR-009 | Every stage change MUST be signalled before its effects apply. | US-2 |
| FR-010 | The beast MUST be able to threaten a player standing on a raised surface without leaving the ground itself. High ground MUST remain a trade — safer from escorts, still exposed to the beast — never a refuge. | US-3 |
| FR-011 | The beast MUST pursue the player anywhere in the level; the player MUST NOT be able to end the fight by walking away. | US-3 |
| FR-012 | The beast MUST resist attack except during an opening it exposes through its own behaviour; the player MUST be able to recognise that opening by observation alone, and taking it MUST be the reliable way to win. | US-1 |
| FR-013 | The fight MUST be winnable with the abilities and pickups the player already has. The system MUST NOT add any new player weapon, move or pickup. | US-1 |
| FR-014 | The beast's defeat MUST be unmistakable — the player MUST NOT be left unsure whether it is still alive. | US-1 |

### Key entities
| Entity | Meaning | Relates to |
|---|---|---|
| Beast | The final wave's headline opponent: outsized, durable, and fought once per level | final wave, escorts |
| Stage | A phase of the beast's fight, entered as it loses health, with its own threat | Beast |
| Escort | An ordinary enemy fighting alongside the beast, splitting the player's attention | Beast, final wave |

## Success Criteria

1. A player who clears the earlier waves reliably loses their first attempt at the beast, and wins within three to five attempts.
2. Under continuous unanswered attack, the beast takes at least three times as long to defeat as the most durable existing enemy.
3. A playthrough of the earlier waves is observably identical to today's.
4. The beast is identifiable as a distinct enemy from a single still frame, without comparing it to anything else.
5. Every beast attack gives at least as much warning as the most telegraphed existing attack in the game.
6. Playing the final wave, the Project Owner judges it the hardest fight in the level.

## Edge Cases
| # | Condition | Expected behaviour |
|---|---|---|
| 1 | The player stays on a raised surface for the whole wave | Covered by FR-010; not a stalemate either way |
| 2 | The player is defeated mid-fight | The encounter restarts whole — the beast carries no damage from the failed attempt |
| 3 | Escorts crowd the same ground as the beast | The beast is never blocked, trapped or slowed by its own escorts |
| 4 | The player retreats to the far end of the level | The beast follows; distance alone never ends the fight (FR-011) |
| 5 | The beast reaches the level boundary | It cannot be pinned against the edge and killed without risk |
| 6 | A stage change and a killing blow land in the same moment | The fight ends; no stage change is signalled after death |
| 7 | The player defeats the beast but escorts remain | The wave continues normally until the last escort falls |

## Out of Scope
- Every wave before the final one — explicitly confirmed untouched.
- A second level. This level remains the whole game.
- Reworking, rebalancing or retiring any existing enemy kind.
- Any new outcome after the level is cleared, beyond what already happens.

## Assumptions
| # | Assumption | If false |
|---|---|---|
| 1 | Escorts are drawn from the enemy kinds that already exist | A second new enemy enters scope |
| 2 | Defeating the beast clears the final wave through the path that already ends the level | A victory presentation enters scope |
| 3 | The level's existing layout gives the fight enough room | Level geometry changes enter scope, which the owner did not rule out |

## Clarifications
### Session 2026-08-18
- Q: Raised surfaces — does the beast follow the player up? → A: No. It threatens high ground from the ground; it never climbs (FR-010).
- Q: Is there a counter the player must discover? → A: Yes — one learnable opening the beast exposes itself; recognisable by observation, and the reliable route to a win (FR-012).
- Q: How many stages, and which way does it turn? → A: Two — whole, then wounded at about half health; wounded is more dangerous and its opening is harder but never absent (FR-008).
- Q: May the player be given a new tool for the fight? → A: No. Winnable with the existing moveset and pickups only (FR-013).
- Q: How do escorts arrive? → A: One fixed group with the beast, never reinforced; kills are permanent progress (FR-007).
- Q: Attempts before a first win? → A: The first attempt is a loss; the win lands within three to five (SC-1).

## Review Checklist
- [x] No `[NEEDS CLARIFICATION]` marker remains
- [x] No technology, file name, API or schema appears anywhere above (Article III)
- [x] Every requirement is testable and unambiguous
- [x] Every success criterion is measurable and technology-agnostic
- [x] Every story is independently deliverable, and P1 alone is usable
- [x] Out of scope names the assumptions a reader would otherwise make
- [x] Within the tier's line cap
