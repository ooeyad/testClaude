<!-- SPEC TEMPLATE · Article III: WHAT and WHY only — no technology, no file
     names, no APIs. Article II: mark every ambiguity, never assume.
     CAP: quick 50 · standard 100 · deep 120 lines. -->
# Feature Specification: {NAME}

**ID:** {NNN} · **Branch:** `{kind}/{NNN}-{slug}` · **Tier:** quick | standard | deep
**Created:** {date} · **Status:** draft | clarified | approved
**Input:** "{the user's original request, verbatim}"

## User Scenarios

<!-- Each story is independently testable and independently deliverable. P1 alone
     must be a usable slice. If a story cannot ship without another, they are one
     story. Justify every priority. -->

### US-1 — {title} (P1)
**As a** {who} **I want** {what} **so that** {why}.
**Why P1:** {one line}
**Acceptance:**
- **Given** {state} **When** {action} **Then** {observable outcome}
- **Given** … **When** … **Then** …

### US-2 — {title} (P2)
…

## Requirements

<!-- Each requirement is testable, unambiguous, and free of technology.
     "The system MUST …" — behaviour, not mechanism. -->

| ID | Requirement | Story |
|---|---|---|
| FR-001 | The system MUST {behaviour}. | US-1 |
| FR-002 | The system MUST NOT {behaviour}, so that {existing guarantee} holds. | US-1 |

### Key entities
<!-- Only if the feature introduces or changes domain concepts. Names and
     relationships, no schemas — schemas are data-model.md. -->
| Entity | Meaning | Relates to |
|---|---|---|

## Success Criteria

<!-- Measurable and technology-agnostic. A criterion a human can check in one
     action. "Fast" is not a criterion; "under 2 seconds at the 95th percentile"
     is. Avoid naming any implementation. -->
1. {measurable outcome}

## Edge Cases
| # | Condition | Expected behaviour |
|---|---|---|

## Out of Scope
<!-- The things a reader would otherwise assume are included. -->

## Assumptions
<!-- What is taken as true without verifying, and what breaks if it is false. -->
| # | Assumption | If false |
|---|---|---|

## Clarifications
<!-- Filled by /speckit.clarify. Every resolved [NEEDS CLARIFICATION] lands here
     with its answer. The marker is then deleted from the body. -->
### Session {date}
- Q: {question} → A: {answer}

## Review Checklist
<!-- Gate for /speckit.plan. All must be ticked; an unticked box blocks planning. -->
- [ ] No `[NEEDS CLARIFICATION]` marker remains
- [ ] No technology, file name, API or schema appears anywhere above (Article III)
- [ ] Every requirement is testable and unambiguous
- [ ] Every success criterion is measurable and technology-agnostic
- [ ] Every story is independently deliverable, and P1 alone is usable
- [ ] Out of scope names the assumptions a reader would otherwise make
- [ ] Within the tier's line cap
