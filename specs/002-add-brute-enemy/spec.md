# Feature Specification: Brute Enemy

**ID:** 002 · **Branch:** `feat/002-add-brute-enemy` · **Tier:** standard
**Created:** 2026-08-09 · **Status:** implemented, awaiting release gate
**Input:** "Add a slow, tanky, heavy-hitting enemy as a test of the standard."

## User Scenarios

### US-1 — An opponent you have to walk away from (P1)
**As a** player **I want** a melee enemy that cannot be staggered off me
**so that** I have to disengage and reposition instead of standing my ground.
**Why P1:** it is the only story; the roster's two melee types are both countered
the same way, and this adds the missing third shape.
**Acceptance:**
- **Given** I am trading hits with it **When** my attacks land
  **Then** it keeps advancing rather than being knocked away.
- **Given** it has just attacked **When** I attack during its recovery
  **Then** I get a clear, repeatable window.
- **Given** I walk away from it **When** I keep moving
  **Then** I can always outpace it.

### US-2 — It is introduced before it is dangerous (P2)
**As a** player **I want** to meet it under low pressure first **so that** I learn
its rhythm before it appears alongside other enemies.
**Why P2:** US-1 is playable without any particular placement.
**Acceptance:**
- **Given** I reach its first appearance **When** it engages
  **Then** no other enemy is engaging me at the same moment.

## Requirements

| ID | Requirement | Story |
|---|---|---|
| FR-001 | The system MUST provide a melee enemy that resists being knocked back far more than any existing type. | US-1 |
| FR-002 | The brute MUST survive noticeably more damage than any existing type. | US-1 |
| FR-003 | The brute MUST move more slowly than the player, so disengaging always works. | US-1 |
| FR-004 | The brute MUST offer the longest recovery window in the roster after it attacks. | US-1 |
| FR-005 | The brute MUST NOT guard; its threat is persistence, not a defensive window. | US-1 |
| FR-006 | The brute MUST telegraph visibly before every attack, like every other enemy. | US-1 |
| FR-007 | The brute MUST be visually the largest and clearly distinct from existing types. | US-1 |
| FR-008 | The brute MUST appear in the progression without any existing encounter being removed or moved. | US-2 |
| FR-009 | The four existing enemy types MUST behave exactly as they do today. | all |
| FR-010 | The brute MUST be reusable — placeable in any level, not only the shipped one. | all |

## Success Criteria
1. The brute survives strictly more identical hits than any existing type.
2. The same knockback impulse moves the brute markedly less than it moves the lightest existing type.
3. The brute passes through the same attack cycle as every other enemy: idle, chase, telegraph, attack, recover.
4. The four existing types are indistinguishable from their current behaviour.
5. The game loads with no new error.
6. A player can always escape the brute by walking away.

## Edge Cases
| # | Condition | Expected behaviour |
|---|---|---|
| E-1 | Several brutes in one encounter | They separate like any other enemy; no stacking into one silhouette. |
| E-2 | Brute placed where the player cannot be reached | It behaves as any enemy would — it does not gain special reach. |

## Out of Scope
A new weapon · rebalancing existing types · new poses or rendering work ·
new levels · changing how waves are triggered.

## Assumptions
| # | Assumption | If false |
|---|---|---|
| A-1 | Resistance to knockback is enough to make it feel distinct from the existing heavy type. | It reads as a palette swap; FR-001 needs a second distinguishing mechanic. |
| A-2 | Meeting it "alone" can be arranged by placement within an encounter. | FR-008 and US-2 conflict — see `analysis.md` RV-002, which found exactly this. |

## Clarifications
### Session 2026-08-09
- Q: What role does it play that the roster lacks? → A: The anvil — it cannot be staggered off you, so it must be disengaged from rather than traded with.
- Q: May existing types be rebalanced to make room? → A: No (FR-009).
- Q: Does it carry a new weapon? → A: No; a new weapon would pull in shared rendering work.
- Q: May existing encounters change? → A: Added to later ones only; nothing removed or moved (FR-008).
- Q: Does it guard? → A: No (FR-005) — guarding is the existing heavy type's identity.
- Q: How is success judged? → A: Mechanics headlessly; feel by the Project Owner at the release gate.

## Review Checklist
- [x] No `[NEEDS CLARIFICATION]` marker remains
- [x] No technology, file name, API or schema appears above
- [x] Every requirement is testable and unambiguous
- [x] Every success criterion is measurable and technology-agnostic
- [x] Every story is independently deliverable; US-1 alone is usable
- [x] Out of scope names the assumptions a reader would otherwise make
- [x] Within the standard-tier cap (100)
