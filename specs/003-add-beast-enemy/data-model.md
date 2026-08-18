# Data Model — 003 Late-Game Beast

Starting values, not final ones. Feel and difficulty are the Project Owner's to
settle at the release gate; everything below is chosen to make the first playable
version honest, and every number carries its unit.

## New optional config keys on an enemy type

Read by the shared machine, absent on all six existing types, each with a
default that preserves today's behaviour exactly.

| Key | Unit | Default | Meaning |
|---|---|---|---|
| `sight` | px | 120 | Vertical distance within which this type can acquire the player (was the hard-coded gate — INV-7) |
| `lineWidth` | px | 3.0 | Stroke weight of the skeleton, so a large body does not read as thin wire |
| `ctor` | — | `P.Enemy` | Already exists; the beast is its second user |

## New optional property on any character

| Property | Unit | Default | Meaning |
|---|---|---|---|
| `armor` | multiplier | absent = 1 | Scales incoming damage in `Combat.applyDamage` before the block branch |

## Beast type definition

| Key | Value | Why |
|---|---|---|
| `type` | `'beast'` | |
| `ctor` | `P.Beast` | DD-001 |
| `weapon` | `'sword'` | Reuses the existing table — no weapon change, and 34 damage kills a full-health player in three (FR-013) |
| `hp` | 420 | ~2.8× the brute. With the armour window this is 6–8 clean cycles, not 12 swings |
| `speed` | 66 px/s | Slower than the brute's 78. It should never win a footrace, only the fight |
| `aggro` | 900 px | It commits from across the arena (FR-011) |
| `sight` | 240 px | Clears the 196 px walkway, so a player who is already up there is still seen (FR-010) |
| `scale` | 2.15 | Body 112 px against the brute's 64. Distinguishable in a still frame (SC-4) |
| `lineWidth` | 4.6 px | |
| `knockScale` | 0.05 | Effectively immovable (FR-005) |
| `telegraph` | 0.80 s | The longest wind-up in the game — the warning FR-006 requires |
| `attackDur` | 0.55 s | Not jittered, so the swing itself reads the same in both stages |
| `recover` | 0.95 s | **The opening.** ~2 sword hits wide |
| `hitAt` | 0.22 s | |
| `color` | `#6b4a3a` | |
| `warnColor` | `#e08a3a` | |

`w` is deliberately left at the shared 19 px. The brute at scale 1.24 does the
same; scaling the collision box would change what geometry stops the body and
put INV-13 back in play for no gain the player can see.

## Stages

| | whole | wounded |
|---|---|---|
| Entered at | spawn | hp ≤ 50 % of max |
| `armor` outside the opening | 0.18 | 0.10 |
| `jitter` | 1.00 | 0.72 → wind-up 0.58 s, opening 0.68 s |
| `armor` during `recover` | 1.00 | 1.00 — the opening never closes (FR-008) |
| Slam radius | 230 px | 275 px |
| Slam damage | 26 at centre | 34 at centre |
| Colour | `#6b4a3a` | `#8a3b2c` |

**The turn** (FR-009): crossing half health forces `recover` immediately, with a
shake, a roar and the colour change. The player is handed one free window as the
signal; the faster timings apply from the cycle after it.

## Attacks

One `attack()`, branching on the player's elevation (DD-008).

| | Chosen when | Resolved through |
|---|---|---|
| Sweep | player within 40 px of the beast's own footing | `Combat.meleeSweep` with the sword, plus a lean that carries the body forward |
| Slam | player is above that, or out of sword reach | `Combat.explode` centred on the beast's feet — radial, no line-of-sight test, falloff makes the top of a platform the weakest place to stand, not a safe one |

## Final wave

The fight is authored into the road segment between the concrete block (ends
1108) and the low block (starts 1660) — 552 px of open road, with the two fire
escapes and one ladder above it, which is what makes FR-010 mean anything. Every
x below is clear of geometry (INV-13).

| Spawn | x | Note |
|---|---|---|
| beast | 1380 | Mid-segment, clear of both platform footprints |
| swordsman | 1200 | |
| gunman | 1250 | |
| swordsman | 1600 | |
| climber | 1450 | Contests the high ground the slam is aimed at |
| archer | 1900 | East of the low block, shooting across it |

Six spawns, as today. The brute is dropped from this wave: two enormous slow
melee bodies read as one idea, and the beast is that idea done properly. No
earlier wave changes (FR-003).
