<!-- TEMPLATE brief.md · CAP 50 lines (quick) / 100 lines (standard, deep) · replaces opportunity.md -->
# {EO-ID} — {Title}

**Tier:** quick | standard | deep · **Phase:** brief · **Requested by:** {who} · **Date:** {date}

## Problem
{2–4 sentences. The user-visible or business problem. No solution.}

## Requested change
{3–6 bullets, observable behaviour only. No design.}

## Value
{2–4 bullets. Why this is worth doing.}

## Scope
**In:** {bullets}
**Out:** {bullets — the things a reader would wrongly assume are included}

## Context delta
<!-- Facts verified against code NOW that are not already in project-context/.
     Cap 15 lines. If a fact is durable, it belongs in project-context/, not here. -->
| # | Verified fact | Where |
|---|---|---|
| F-1 | {fact} | `path:line` |

**Contradicts existing context:** {none | INV-xx / architecture.md §n — and how}

## Constraints
{bullets. Only real ones. "None known" is a valid and preferred answer.}

## Success criteria
<!-- Each must be checkable by a human in one action. Cap 8. -->
1. {…}

## Risks
| ID | Risk | Mitigation |
|---|---|---|
| R-1 | {…} | {…} |

## Tier rationale
{Which checklist items forced this tier. One line each.}

## Gates required
- [ ] scope  - [ ] design  - [ ] release  - [ ] {security | data | other, only if real}

## Open questions
<!-- Only questions that BLOCK the next phase. Answered ones move to decisions.md
     and are deleted here. Cap 8. -->
1. {…}
