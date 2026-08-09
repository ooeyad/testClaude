# Analysis: Brute Enemy

**Analyzer:** analyzer · **Date:** 2026-08-09 · **Scope:** T001–T003, full diff vs `HEAD`

## Verdict
**fix-needed** — one placement assumption does not survive contact with how
encounters are triggered (RV-002). RV-001 has since resolved itself: the residue
it flagged was feature 001's work, and 001 shipped in PR #9.

## A. Traceability
`US → FR → DD → T → file → check` is complete. Every FR maps to a task and to a
check; every task cites its FR; every success criterion has a quickstart scenario
or a harness assertion. No orphan tasks, no unimplemented requirements.

## B. Constitution compliance
| Article | Result |
|---|---|
| III — no technology in the spec | pass |
| IV — simplicity | pass; 3 files, zero shared changes |
| V — anti-abstraction | pass |
| VI — verification before done | pass; every claim carries its command and output |
| VII — traceability | pass |
| VIII — reversibility | pass; each task is one revertible commit |
| IX — context economy | pass; no artifact over cap, no `[CONTEXT GAP]` recorded |
| X — verification regime | pass; syntax and harness both run |
| XI-11 — only keys the consumer reads | pass; asserted explicitly |

## C. Findings
| ID | Sev | File | Finding | Verdict | Action |
|---|---|---|---|---|---|
| ~~RV-001~~ | med | `js/levels/level.js` | An uncommitted `ladder()` from feature 001's T001 sat in the working tree. | **resolved 2026-08-09** | It was legitimate feature-001 work; 001 shipped in PR #9 (`f46acd2`…`b5eeb58`). |
| RV-002 | med | `js/levels/level01_city.js` | US-2's "met alone" does not hold. Encounters spawn at fixed positions regardless of where the player is standing. | confirmed | Owner's call at the release gate. One-line change either way. |
| RV-003 | low | `js/entities/enemies/brute.js` | Survivability was measured against raw damage; the existing heavy type guards, so real-play time-to-kill is closer than 5 vs 3 suggests. | confirmed | No action. Recorded so 5:3 is not quoted as a balance fact. |

**RV-001 detail.** Superseded — see the verdict.

**RV-002 detail.** Clear wave 2 near its last enemy and stay there. Wave 3 spawns:
three of its four members are within their engagement range and come at once,
while the brute is roughly 1000 px away, outside its own range, and idles. You
fight the wave the brute was meant to introduce and meet it last, as mop-up —
the lesson inverted. The clearance T002 engineered is real but assumes you
approach from one side.

**Refuted, so nobody re-raises them.**
- *"The committed step plus low knockback resistance could shove it through
  geometry."* The step only adds horizontal velocity; collision resolves per axis
  and the walk refuses to step into a wall. Mass affects incoming knockback only.
- *"The warn colour also tints the health bar, diluting the wind-up cue."* The bar
  only appears once damaged, and the wind-up tints the whole body. Different
  surfaces.

## D. Context economy
| Measure | Value |
|---|---|
| Artifacts | 6 files, ~30 KB (~7.5k tokens) |
| Code delta | 1,449 bytes + 3 lines, across 3 files |
| Doc : code | ~20× — high for standard tier, but see below |
| Budget | 80k tokens |
| `[CONTEXT GAP]` recorded | none — every task detail was sufficient |
| Over cap | none |

The ratio is inflated by a deliberately small feature; the absolute number is what
matters, and 30 KB against feature 001's original ~878 KB is the real comparison.
Tier was right: no pressure at any point to escalate.

## Checks performed
| Check | Result |
|---|---|
| `node --check`, 26 scripts in load order | ✅ |
| Boot completes, no thrown error | ✅ |
| Attack cycle: idle → chase → telegraph → attack → recover | ✅ |
| Hits to kill: brute 5 · heavy 3 · light 2 | ✅ SC-1 |
| Knockback from an identical impulse: brute 67.2 · heavy 148.8 · light 276 | ✅ SC-2 |
| Shared enemy file + four existing definitions identical to `HEAD` | ✅ SC-4 |
| Encounter data: one brute in wave 3, one in wave 5; sizes 2,3,4,4,5 | ✅ FR-008 |
| Both brutes spawn on the road, inside the awareness band | ✅ INV-7 |

## What was not verified
Feel, pacing and difficulty — unjudgeable headlessly, and the reason the release
gate exists. Rendering was never drawn. Multi-brute interaction (E-1). Audio was
stubbed, so the swing sound is assumed, not heard.
