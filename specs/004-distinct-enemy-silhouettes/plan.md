# Implementation Plan: Distinct Enemy Silhouettes

**ID:** 004 · **Tier:** deep · **Spec:** `spec.md` (approved 2026-08-18)
**Design gate:** required, pending.

## Constitution Check — before Phase 0

| Article | Check | Verdict |
|---|---|---|
| IV Simplicity | Smallest change that satisfies the spec | pass — no new module; feature shapes sit beside the weapon shapes that already work this way |
| V Anti-Abstraction | One representation per concept | pass — a build is a multiplier over the one bone table, not a second table to keep in sync |
| VI Verification | Every requirement has a check | pass — including FR-012, which is measured rather than asserted |
| VII Traceability | Every DD cites what forced it | pass |
| IX Context Economy | Plan readable, detail pushed down | pass — the eight builds live in `data-model.md` |
| XI-7 Content is data | New content is data, not a system | pass — builds and feature lists are data; feature *shapes* are strokes, exactly as weapons are |
| XI-8 No assets | Drawn at runtime | pass — this feature exists because there are no sprites |
| XI-12 Append-only | No reordered or removed signature | pass — every addition is an optional trailing parameter or an optional key |

## Phase 0 — Research

Two unknowns were real and are resolved in `research.md`: what a character's drawn
height is allowed to do without disturbing combat (R-1), and whether per-character
features can be afforded at all under FR-012 (R-2).

## Phase 1 — Design

### Approach

Today one bone table draws everybody, and that is stated in the renderer as the
reason the project has no art. The change keeps that sentence true: there is
still one table, but a character may scale each bone in it, and may hang a few
extra strokes off named joints.

The load-bearing separation is **scale is size, build is shape**. A build
redistributes proportions and is then normalised back to the standing height the
character already had, so nothing about collision, reach, the health bar or the
camera moves. A creature that should be bigger still says so with `scale`, which
already drives the collision box.

That single rule is what lets an enemy be spindly, hunched, squat or long-armed
without touching a line of fighting code — and it is the reason FR-009 is a
design property here rather than something to be careful about.

### Design decisions

| ID | Decision | Forced by |
|---|---|---|
| DD-001 | The skeleton builder takes an optional bone set, defaulting to the shared table. One trailing optional parameter; every existing call is unchanged. | FR-001, XI-12 |
| DD-002 | A build is a set of **multipliers** over the shared table, never absolute lengths. One source of truth for what a body is, so a change to the base figure still reaches all eight. Absolute per-creature tables were rejected: eight copies that drift. | FR-001, V |
| DD-003 | **Standing height is normalised after a build is applied.** Proportions redistribute inside the height the character already had. This is what keeps the collision box, melee reach, the health bar and the camera exactly where they are (INV-1) and makes FR-009 structural rather than a promise. | FR-009, INV-1 |
| DD-004 | Head radius and the hip datum derive from the character's own bones, not from the module constants. Otherwise a re-proportioned figure gets someone else's head and floats or sinks. | FR-001 |
| DD-005 | Features are a per-character list of named shapes, each attached to a joint and drawn in skeleton-local space — the same pattern as weapons, in the same file, as a switch and a handful of strokes. No feature module, no per-feature file. | FR-004, IV, V |
| DD-006 | Features declare whether they sit behind or in front of the body, and draw with the far or near pass accordingly, inheriting the existing dimming. A horn in front, a tail behind, and mirroring stays free because it all happens inside the existing flip. | Edge 2, FR-010 |
| DD-007 | Idle unrest is a per-character scalar on the **existing** idle pose, not a new pose or a new vocabulary. Assumption 1 in the spec survives: motion stays shared, its amplitude does not. | FR-007 |
| DD-008 | The player takes a build through the same path as everyone else — no special case, no branch on "is the player". | FR-005, V |
| DD-009 | A character with no build draws exactly as it does today. An enemy added later, or one whose build is removed, still renders. | Edge 6, VIII |
| DD-010 | FR-012 is verified by counting canvas path operations per frame with the full final wave on screen, before and after. A budget of a few strokes per feature is set in `data-model.md` and checked, not hoped for. | FR-012 |

### Change inventory

| File | Kind | Shared contract |
|---|---|---|
| `phefo/js/render/stickman.js` | modify — optional bone set, per-character head and datum, feature drawing beside the weapon drawing | **yes** — the one skeleton both callers draw through |
| `phefo/js/render/poses.js` | modify — idle gains an optional unrest scalar | **yes** — shared pose library, additive |
| `phefo/js/entities/enemy.js` | modify — pass build, features and unrest into the draw options | no |
| `phefo/js/entities/phefo.js` | modify — the same, for the player | no |
| `phefo/js/entities/enemies/*.js` × 7 | data — each gains a build and a feature list | no |

No new file, so no `index.html` change and no load-order risk. Eleven files, but
seven of them are one data block each.

### Invariant impact

| INV | Verdict | Check that proves it |
|---|---|---|
| INV-1 | **at risk, and protected by DD-003** | Position is feet and the box is `52 × scale`. Harness: for all eight builds, drawn standing height and the lowest foot are unchanged from today within a pixel |
| INV-2 | held | Rendering only. No gameplay value moves; the fixed step is untouched |
| INV-4 | held | No new file and no new script tag |
| INV-14 | at risk | Every touched `.js` stays LF in the blob, CRLF in the working copy |
| INV-22 | held | Builds are read from `cfg`, never written to it |
| INV-23 | n/a | No damage path is touched |

### Artifacts

`research.md` (R-1, R-2) · `data-model.md` (the eight builds, the feature
vocabulary, the stroke budget) · `contracts/skeleton.md` · `quickstart.md`.

## Constitution Check — after Phase 1

| Article | Verdict |
|---|---|
| IV Simplicity | pass — no new module; the feature vocabulary reuses the weapon pattern |
| V Anti-Abstraction | pass — multipliers over one table, no parallel model |
| VI Verification | pass — every INV row and FR-012 names its check |
| VIII Reversibility | pass — DD-009 means every task leaves every character drawable |
| IX Context Economy | pass |
| XI-12 | pass |
| XII-4 | flagged — scope checks normalised (INV-14) |

## Complexity Tracking

| # | Article | Violation | Why accepted | Rejected alternative | Feature |
|---|---|---|---|---|---|
| 1 | IV | Eight characters gain data that only this feature reads | The spec asks for eight distinguishable creatures; there is no smaller number that satisfies FR-002 and FR-003 | Three shared archetypes reused across seven enemies — cheaper, and it fails FR-003 outright | 004 |

## Open question for the design gate

**None.** The one decision that could have gone either way — whether a build may
change a character's drawn height — is settled by FR-009 rather than by taste:
letting height vary would divorce the drawing from the collision box, so a
creature would be hit where it does not appear to be. DD-003 takes it off the
table, at the cost that "towering" must be expressed with `scale` and "hunched"
with posture rather than with bone length.

If that cost is unacceptable, say so now — it is the one decision that would be
expensive to revisit after the builds are drawn.
