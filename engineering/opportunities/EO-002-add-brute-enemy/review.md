# EO-002 — Review

**Reviewer:** reviewer subagent · **Date:** 2026-08-09 · **Scope:** WP-01…03, full diff vs `HEAD`

## Verdict
**fix-needed** — the brute itself is clean; the tree it sits in is not, and one
wave-placement assumption does not survive contact with how waves spawn.

## Findings

| ID | Sev | File:line | Finding | Verdict | Action |
|---|---|---|---|---|---|
| RV-001 | med | `phefo/js/levels/level.js:44-64` | An uncommitted `ladder()` function from the abandoned EO-001 WP-01 is sitting in the working tree and would be swept into any EO-002 commit. | confirmed | Owner decides before `/ship`: revert it, or commit it separately as EO-001 residue. Not EO-002's to delete. |
| RV-002 | med | `phefo/js/levels/level01_city.js` wave 3 | BD-005's "introduce it alone" does not hold. Waves spawn at fixed x regardless of where the player is standing. | confirmed | Owner's call at the release gate — accept, or move the wave-3 brute. One-line change either way. |
| RV-003 | low | `phefo/js/entities/enemies/brute.js` | Survivability was measured against raw damage; the swordsman's guard means real-play time-to-kill is closer than 5 vs 3 suggests. | confirmed | No action. Recorded so the 5:3 number is not quoted as a play-balance fact. |

### Detail
**RV-001** — `git diff` under `phefo/` lists four paths, but only three are
EO-002's. `level.js` carries an unreferenced `ladder(x, top, bottom)` whose
comment cites "the EO-001 architecture §10" — a document that is no longer in the
tree. Failure scenario: `/ship` runs `git add -A`, and a PR titled "Add brute
enemy" silently ships a dead ladder API plus a comment pointing at a missing
document. Condition C-2 catches it only because the check was run manually.

**RV-002** — Concrete scenario: the player clears wave 2 by killing the gunman at
x 1360 and is standing near it. Wave 3 spawns: swordsman at 900, knifeman at
1180 and archer at 1700 are all inside their aggro and engage at once; the brute
at 380 is ~1000px away, well outside its 380 aggro, so it idles. The player
fights the wave the brute was meant to introduce, and meets the brute last —
alone, but as a mop-up, with the lesson inverted. The 520px clearance WP-02
engineered is real but irrelevant, because it assumed the player approaches from
the left.

**RV-003** — `blocks: true` turns a frontal hit on the swordsman into ~15% damage.
The harness reset `blocking = false` every hit (correctly — INV-10 — otherwise
nothing lands), so 5 vs 3 measures raw HP, not survivability in a fight.

### Refuted, so nobody re-raises it
- *"The 130px lunge plus `knockScale 0.28` could shove the brute through geometry."*
  Refuted: the lunge only adds to `vx`; `moveAndCollide` resolves X and Y
  separately and sets `hitWall`, and the brute's own `walk` refuses to step into
  a wall. Its mass affects incoming knockback, not collision.
- *"`warnColor #f0663a` also tints the health bar, so the wind-up cue is diluted."*
  Refuted: `drawHealth` only runs once the brute is damaged, and the wind-up tint
  applies to the whole 1.24-scale body. Different surfaces, no conflict.

## Checks performed
| Check | Result |
|---|---|
| U-1 `node --check`, 26 scripts in load order | ✅ |
| U-2 boot completes, no thrown error | ✅ |
| U-3 diff confined to the packages' `Touches` | ⚠️ see RV-001 |
| U-4 / C-1 `enemy.js` + four `enemies/*.js` identical to `HEAD` | ✅ |
| C-2 no shared file beyond the script tag and wave entries | ✅ for EO-002's own changes |
| Success criteria 1, 2, 4, 6 (`brief.md`) | ✅ measured |
| Criterion 3 (survives longer) | ✅ raw HP; qualified by RV-003 |
| Criterion 5 (existing types unchanged) | ✅ structurally and by content hash |
| INV-2, INV-4, INV-7, INV-9, INV-10 | ✅ preserved as claimed in `decisions.md` §D |

## Not covered
Feel, pacing and difficulty — unjudgeable headlessly (R-4), and the reason the
release gate exists. Rendering was never drawn: the harness no-ops every canvas
call, so "the brute looks like a brute at 1.24 scale" is untested. Multi-brute
interaction through `separate()` was not exercised. Audio was stubbed, so the
sword sound on a brute swing is assumed, not heard.
