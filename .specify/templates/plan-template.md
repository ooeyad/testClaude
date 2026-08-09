<!-- PLAN TEMPLATE · This is where HOW lives. Stays high-level and readable:
     code samples, detailed algorithms and long derivations go to
     `implementation-details/` and are not loaded by default (Article IX).
     CAP: standard 120 · deep 150 lines. -->
# Implementation Plan: {NAME}

**Spec:** `spec.md` · **Tier:** {tier} · **Date:** {date}
**Branch:** `{kind}/{NNN}-{slug}`

## Technical Context
| | |
|---|---|
| Language / version | {or NEEDS CLARIFICATION} |
| Dependencies | {existing only, unless an AD adds one} |
| Storage | {n/a} |
| Testing | {per Article X} |
| Target platform | |
| Project type | single / web / mobile+api |
| Performance goals | {or n/a} |
| Constraints | {from the project constitution} |

## Constitution Check — before Phase 0
<!-- Article IV, V, VI, IX. Answer each with yes/no and one line of evidence.
     A "no" is not a blocker — it is a Complexity Tracking entry. -->
| Gate | Article | Pass? | Evidence |
|---|---|---|---|
| Simplicity — smallest change, no speculative generality | IV | | |
| Anti-abstraction — framework used directly, one representation | V | | |
| Verification — every requirement has a runnable check | VI | | |
| Context economy — artifacts within caps, memory reused not rebuilt | IX | | |
| {project article} | X–XII | | |

## Phase 0 — Research  *(deep tier only; output `research.md`)*
{What is genuinely unknown and must be resolved before design. If nothing is
unknown, say so in one line and skip the file — an empty research.md is worse
than none.}

## Phase 1 — Design
**Approach.** {5–15 lines. The shape of the solution and why this one.}

**Outputs produced:**
- [ ] `data-model.md` — {only if the feature adds or changes domain data}
- [ ] `contracts/` — {only if it adds or changes an interface others call}
- [ ] `quickstart.md` — the validation scenarios a human will actually run

### Design decisions
| ID | Decision | Choice | Forced by | Rejected |
|---|---|---|---|---|
| DD-001 | {question} | {one line} | FR-001, INV-2 | {alternative, one line} |

### Change inventory
| File | Kind | What changes | Shared? | Refs |
|---|---|---|---|---|
| `{path}` | new / additive / modify / data | {one line} | no / **yes — gate** | DD-001 |

**Totals:** {n} new, {n} additive, {n} modify. **Shared-contract changes:** {n}.
**Not modified:** {the files a reader would expect to see and will not}

### Invariant impact
| INV | Preserved / Changed | How proven |
|---|---|---|

## Constitution Check — after Phase 1
<!-- Re-run the same table. Design is where violations actually appear. -->
| Gate | Article | Pass? | Evidence |
|---|---|---|---|

## Complexity Tracking
<!-- Only rows where a Constitution Check said no. Empty is the goal. Each row is
     also copied into the project constitution's permanent register. -->
| Article | Violation | Why necessary | Simpler alternative rejected because |
|---|---|---|---|

## Project Structure
```
{only the paths this feature touches or creates}
```

## Progress
- [ ] Phase 0 complete (or explicitly skipped)
- [ ] Phase 1 complete
- [ ] Constitution Check passed, or violations recorded
- [ ] Design gate approved *(deep tier)*
