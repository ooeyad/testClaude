# What changed, coming from the EO framework

Same discipline, standard names. Everything validated on EO-002 survives; the
vocabulary is now spec-kit's, so it is a standard you adopt rather than one we
invented.

| EO framework | SDD (spec-kit) | Note |
|---|---|---|
| `engineering/opportunities/EO-nnn-slug/` | `specs/NNN-slug/` | spec-kit convention |
| `brief.md` | `spec.md` | **Stricter.** Article III bans technology from the spec entirely; the EO brief allowed it. Verified facts move to `plan.md`'s Technical Context. |
| `decisions.md` §A (BD) | `spec.md` Clarifications + Assumptions | Business decisions are now spec content, not a parallel register |
| `decisions.md` §B–F (AD) | `plan.md` — `DD` register, change inventory, invariant impact | Unchanged in substance |
| `plan.md` (WP table) | `tasks.md` | Adds `[P]` parallel markers, `[US-n]` story labels, `T00n` IDs |
| WP card | a `tasks.md` line + its **Task detail** entry | Same self-contained-contract rule, one file instead of many |
| `review.md` | `analysis.md` | Adds traceability and constitution passes, plus the token audit |
| `approvals.md` | `state.json.gates` + the constitution's gate table | One less file |
| `standards.md` (STD-xx) | constitution Articles X–XII | **Merged.** In SDD the constitution *is* the standards; a separate registry duplicated it |
| `project-context/` | `.specify/memory/project-context/` | Unchanged — this was the biggest win and it stays |
| tiers, caps, read-sets, `state.json` | unchanged | Our layer, kept whole |
| — | `constitution-universal.md`, Constitution Checks, `[NEEDS CLARIFICATION]`, Complexity Tracking, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`, checklists | New from spec-kit |

## What genuinely improves

- **`[NEEDS CLARIFICATION]` beats an open-questions list.** The marker sits at the
  point of ambiguity and mechanically blocks planning; `check-prereqs.ps1` counts
  them. EO-002's open questions were a section nobody was forced to read.
- **Article III forces the WHAT/HOW split.** EO-002's brief named files and config
  keys, which meant the spec had to change whenever the design did.
- **Constitution Checks run twice** — before Phase 0 and after Phase 1. The second
  is where violations actually surface; we had no equivalent.
- **Complexity Tracking makes debt a decision.** Previously an unusual choice was
  argued once in prose and then invisible.
- **`quickstart.md` gives the release gate something concrete.** EO-002 stopped at
  that gate with "go play waves 3 and 5" — a quickstart is that, written down and
  repeatable.

## What we keep that spec-kit does not have

- **Tiers.** Spec-kit produces the full artifact set every time. A two-line change
  does not need `research.md`.
- **Caps and read-sets.** The mechanism that made EO-002 cost 56 KB where EO-001
  cost 878 KB.
- **`project-context/` memory.** Spec-kit re-derives codebase knowledge per
  feature; we pay for it once.
- **The token audit** in `/speckit.analyze`, and `measure-context.ps1` behind it.
