# Feature Specification: Ladder-Climbing Enemy

**ID:** 001 · **Branch:** `feat/001-add-ladder-climbing-enemy` · **Tier:** deep
**Created:** 2026-08-06 · **Status:** implemented and merged (PR #9); T013 outstanding
**Input:** "Introduce a new enemy type that can use a ladder to climb from a lower game level or platform to an upper level."

## User Scenarios

### US-1 — Elevated ground stops being safe (P1)
**As a** player **I want** enemies that can follow me onto raised ground **so that**
standing on a platform is a tactical choice rather than a way to opt out of the fight.
**Why P1:** this is the whole point; every other story is texture on top of it.
**Acceptance:**
- **Given** I am standing on a raised surface and an enemy is below me
  **When** a route upward exists near that enemy
  **Then** it travels to the route, ascends, arrives beside me and fights normally.
- **Given** an enemy is part-way up **When** I attack it **Then** it takes damage
  normally and, if killed, falls to the ground.
- **Given** an enemy is part-way up **When** it is on the route **Then** it does
  not attack until it has arrived.

### US-2 — The climber comes back down (P2)
**As a** player **I want** the enemy to descend when I return to ground level
**so that** I cannot shake it off by simply dropping down.
**Why P2:** US-1 ships and is playable without descent; this closes the loop.
**Acceptance:**
- **Given** a climber has arrived above and I drop to the ground
  **When** a route down is available **Then** it descends and resumes pursuit.
- **Given** a climber is mid-route **When** I change level **Then** it completes
  the traversal it started before re-deciding.

### US-3 — Routes are legible to the player (P3)
**As a** player **I want** to see where enemies can climb **so that** I can
anticipate the threat instead of being surprised by it.
**Why P3:** playable without it, but the feature reads as arbitrary if the route
is invisible.
**Acceptance:**
- **Given** a level contains a climbing route **When** it is on screen
  **Then** it is unmistakably drawn as a climbable route.

## Requirements

| ID | Requirement | Story |
|---|---|---|
| FR-001 | The system MUST provide an enemy type that can reach a target on a higher surface. | US-1 |
| FR-002 | The climbing enemy MUST use a route only when one is near its current position. | US-1 |
| FR-003 | The climbing enemy MUST NOT attack at any point while on a route. | US-1 |
| FR-004 | The climbing enemy MUST take damage normally throughout a traversal, and fall to the ground if killed. | US-1 |
| FR-005 | The climbing enemy MUST arrive on the upper surface and resume normal pursuit and combat. | US-1 |
| FR-006 | The climbing enemy MUST NOT become stuck entering or leaving a route, and MUST abort rather than strand itself when an exit is blocked. | US-1 |
| FR-007 | The climbing enemy MUST descend as well as ascend. | US-2 |
| FR-008 | A traversal, once started, MUST complete before the enemy re-decides. | US-2 |
| FR-009 | Routes MUST be visually unmistakable. | US-3 |
| FR-010 | Routes MUST be placeable by a level author in any level, not only the shipped one. | US-3 |
| FR-011 | The four existing enemy types MUST behave exactly as they do today. | all |
| FR-012 | The player MUST NOT gain the ability to climb. | all |

### Key entities
| Entity | Meaning | Relates to |
|---|---|---|
| Climbing route | A vertical connection between two surfaces where an enemy's feet may rest at each end. | Level, Climbing enemy |
| Climbing enemy | An enemy that can traverse a climbing route; otherwise an ordinary enemy. | Climbing route |

## Success Criteria
1. An enemy placed below a raised surface reaches a player standing on it, unaided, within one encounter.
2. The enemy is killable at every moment of the traversal, and its death is visible.
3. The enemy never ends a traversal in a position from which it cannot move.
4. A player who camps the top of a route can kill climbers as they arrive — this is an accepted tactic, not a defect.
5. The four existing enemy types are indistinguishable from their current behaviour when no climbing enemy is present.
6. A level author can add a route to any level using level data alone.

## Edge Cases
| # | Condition | Expected behaviour |
|---|---|---|
| E-1 | Player leaves the upper surface mid-traversal | The traversal completes, then the enemy re-decides (FR-008). |
| E-2 | The exit is blocked | The enemy aborts rather than stranding itself (FR-006). |
| E-3 | Several routes are available | It uses one that is near it (FR-002); which one is not specified. |
| E-4 | The enemy is killed mid-traversal | It falls to the ground (FR-004). |

## Out of Scope
Player climbing (FR-012) · general pathfinding · rebalancing the four existing
types · new weapons · redesigning the level system · raising the vertical
awareness limit for enemies generally (that is TD-001, a separate feature).

## Assumptions
| # | Assumption | If false |
|---|---|---|
| A-1 | A near-enough route always exists where designers place climbers. | Climbers idle; FR-002 needs a fallback behaviour. |
| A-2 | Camping a route exit is acceptable play, not an exploit. | FR-006 and the arrival behaviour need a fairness guardrail. |

## Clarifications
### Session 2026-08-06
- Q: Whose behaviour may change? → A: Only the new climbing enemy (FR-011).
- Q: Should the player climb too? → A: No; routes are enemy infrastructure (FR-012).
- Q: Attack while on a route? → A: No (FR-003).
- Q: Vulnerable while on a route? → A: Fully, and it falls when killed (FR-004).
- Q: Descend as well? → A: Yes (FR-007).
- Q: Player changes level mid-traversal? → A: Traversal always completes (FR-008).
- Q: Ladder-top camping — guardrail needed? → A: No; it is acceptable play.
- Q: Visually distinct enemy? → A: Own colour, slightly smaller and lighter build.
- Q: Threat profile? → A: Fast, fragile melee; knife-armed.
- Q: Wave placement? → A: Alone in a mid wave first, then reused under pressure.
- Q: Reusable or one level? → A: Reusable level-authoring feature (FR-010).
- Q: Validation, given no tests? → A: A written manual checklist, played and recorded.

## Review Checklist
- [x] No `[NEEDS CLARIFICATION]` marker remains
- [x] No technology, file name, API or schema appears above
- [x] Every requirement is testable and unambiguous
- [x] Every success criterion is measurable and technology-agnostic
- [x] Every story is independently deliverable; US-1 alone is usable
- [x] Out of scope names the assumptions a reader would otherwise make
- [x] Within the deep-tier cap (120)
