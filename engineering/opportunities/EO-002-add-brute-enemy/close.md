# EO-002 — Close (knowledge delta)

**Status:** delta applied ahead of the release gate, at the owner's request. The
opportunity itself is **still open** — gate `release` is pending and RV-001/RV-002
are unresolved. This file will gain its PR link and cost table at `/ship`.

## Knowledge delta
| Target | Change | Applied |
|---|---|---|
| `project-context/invariants.md` | + **INV-13** — an entity spawned overlapping a solid can never walk out; `hitWall` plus `Enemy.walk`'s refusal leave it in `chase` forever. Reads as an AI bug. | [x] |
| `project-context/invariants.md` | + **INV-14** — `.js` is CRLF, `index.html` is LF; unnormalised tools report all 21 `phefo` files as rewritten, so `git diff --stat` is not a scope check. | [x] |
| `project-context/architecture.md` | §Verification — harness traps expanded from 2 to 4: the `AudioContext` stub must be **recursively callable** (a flat proxy dies on `osc.frequency.setValueAtTime`, reached via `Audio.play` on every hit), and `P.Game.world` is a fully loaded world so `enemy.update(dt, world)` isolates the AI better than `World.step`. | [x] |
| `project-context/debt.md` | + **TD-004** — the uncommitted EO-001 `ladder()` residue in `level.js` (RV-001). | [x] |
| `engineering/standards.md` | + **STD-17** — scope checks are CR-normalised, always. | [x] |
| `engineering/standards.md` | + **STD-18** — a data definition uses only keys its consumer reads; unknown keys are silently ignored, so check against the consumer's key list. | [x] |
| `_framework/templates/brief.md`, `README.md`, `commands/eo.md` | brief cap split: 50 lines quick, 100 standard/deep. EO-002's brief hit 78 of 80. | [x] |
| `commands/review.md`, `commands/wp.md`, `templates/plan.md` | diff discipline per STD-17; plan template gains a U-4 scope gate. | [x] |

## New debt
| ID | Debt | Cost of leaving it | Trigger to fix |
|---|---|---|---|
| TD-004 | EO-001 `ladder()` residue in `level.js`. | Sweeps into the next unrelated PR. | Before the next commit touching `phefo/`. |

## Process notes
- **The self-contained card held.** WP-01 was implemented without opening
  `enemy.js` — the card's key list was sufficient, and a harness assertion then
  proved the list complete. That is the mechanism the whole framework rests on,
  and it worked on first use.
- **`invariants.md` paid for itself three times in one opportunity**: INV-4
  placed the script tag, INV-7 explains the omitted `y`, INV-10 stopped the
  harness concluding the brute was invincible. INV-13 and INV-14 were each
  discovered by losing a cycle to them — both are now free for everyone after.
- **The expensive part was validation, not decisions.** Brief through plan cost
  little; two harness bugs cost the most. A committed harness (TD-002) would
  have removed almost all of it — that is now the highest-value debt in the repo.
- **Tier was right.** Standard, 3 packages, 56 KB of documents against EO-001's
  ~878 KB for a comparable change. No pressure at any point to escalate.

## Cost
| Metric | Value |
|---|---|
| Tier | standard (budget 80k) |
| Work packages | 3, all done |
| Files changed | 3 (1 new, 1 additive line, 2 data lines) |
| Documents | 56 KB across 10 files |
| Code delta | 1,449 bytes + 3 lines |
| Findings | 3 (2 medium, 1 low), 2 refuted |

## Archive
Nothing archived — no document exceeded its cap and no finding was superseded.
