# EO-002 — Decisions

## A. Business decisions

| ID | Decision | Status | Answer |
|---|---|---|---|
| BD-001 | What role does the brute play that the roster lacks? | 🟢 | The anvil: it cannot be staggered off you, so it must be disengaged from rather than traded with. |
| BD-002 | May existing enemy types be rebalanced to make room? | 🟢 | No. The four existing types are untouched. |
| BD-003 | Does it carry a new weapon? | 🟢 | No. It reuses `sword`; a new weapon row would drag in `weapons.js` and `Stick.drawWeapon`. |
| BD-004 | May existing waves change? | 🟢 | Added to later waves only. Nothing is removed or repositioned. |
| BD-005 | Where does it first appear? | 🟢 | Alone in wave 3, so its behaviour is legible before it appears under pressure in wave 5. |
| BD-006 | Does it block like the swordsman? | 🟢 | No. Guarding is the swordsman's identity; sharing it would make the brute a palette swap. |
| BD-007 | How is "it works" judged? | 🟢 | Mechanics headlessly (WP-03); feel by the owner playing waves 3 and 5 at the release gate. |
| BD-008 | Reusable, or level-specific? | 🟢 | Reusable — it is a registered type, placeable in any level's waves. |

### Rationale (non-obvious only)
**BD-001** — "More HP" is not a role. The distinguishing mechanic is `knockScale`,
which already exists and which nothing in the roster pushes: the knifeman is
knocked around (1.15), the swordsman resists (0.62). At 0.28 the brute keeps
walking through hits, which changes what the player must *do*, not just how long
they must do it for.
**BD-003** — Tempting, but a weapon row costs `weapons.js` plus shapes in
`Stick.drawWeapon` — shared render code, and a different tier. The role is
carried by the stat profile, not the blade.

## B. Architecture decisions

| ID | Decision | Status | Choice | Refs |
|---|---|---|---|---|
| AD-001 | Where does the brute live? | 🟢 | One new file, `js/entities/enemies/brute.js`, matching its four peers exactly: an IIFE calling `P.Enemies.define`. No new system, no subclass. | F-1, STD-26 |
| AD-002 | Is `enemy.js` modified? | 🟢 | No. Every behaviour needed already exists as a config key (F-2). This opportunity touches no shared code. | BD-002 |
| AD-003 | How is "unstaggerable" expressed? | 🟢 | `knockScale: 0.28` — the existing incoming-knockback scale, pushed further than any current type. | F-3, BD-001 |
| AD-004 | Single or multi-hit swing? | 🟢 | Single, via `hitAt`. `shotTimes` (F-4) is available but a second hit would compress the recovery window, which is the counter-play. | BD-001 |
| AD-005 | Where does the `<script>` tag go? | 🟢 | Immediately after `enemies/archer.js`, inside the entities group — after `enemy.js` (which defines `P.Enemies`) and before `levels/*` (which name types). | INV-4 |
| AD-006 | Rendering? | 🟢 | None. Existing skeleton, existing sword shape, larger `scale`, own `color`/`warnColor`. | F-7 |

### Rationale (non-obvious only)
**AD-002** — Worth stating explicitly because it is the whole point of the test:
if a new enemy required touching `enemy.js`, the architecture's "adding content
means adding data" claim would be false. It does not.
**AD-004** — The brute's fairness rests entirely on its 0.70 s recovery being the
longest opening in the game. A second hit inside `attackDur` would eat into that
and turn "kite and punish" back into "trade and lose".

## C. Change inventory

| File | Kind | What changes | Shared? | Refs |
|---|---|---|---|---|
| `phefo/js/entities/enemies/brute.js` | new | the `brute` definition — config block + `attack()` | no | AD-001 |
| `phefo/index.html` | additive | one `<script>` tag after `enemies/archer.js` | no | AD-005 |
| `phefo/js/levels/level01_city.js` | data | one brute in wave 3, one in wave 5 | no | BD-004, BD-005 |

**Totals:** 1 new, 1 additive, 1 data. **Shared-contract changes: 0.**

**Explicitly not modified:** `enemy.js`, `weapons.js`, `hitbox.js`, `physics.js`,
`poses.js`, `stickman.js`, `game.js`, and all four existing `enemies/*.js`.

## D. Invariant impact

| INV | Verdict | How proven |
|---|---|---|
| INV-4 (load order) | preserved | Tag sits after `enemy.js` (source of `P.Enemies`) and before `levels/*`; `game.js` stays last. Boot proves it — a wrong slot throws at define time. |
| INV-2 (fixed 120 Hz) | preserved | Every brute timing is in seconds against `stateT`, which `Enemy` advances by `dt` inside the fixed step. Nothing reads frame time. |
| INV-7 (120 px awareness gate) | preserved | Untouched. The brute inherits it, so it is placed on the road like every other type — see the existing comment in `level01_city.js`. |
| INV-9 / INV-10 (damage semantics) | preserved | The attack calls `P.Combat.meleeSweep`; no `hp` is touched directly (STD-25). |
| INV-1, INV-5, INV-6, INV-12 | untouched | No physics, no world-array retention, no collision code involved. |

## E. Behavioural compatibility rule
The four existing types must be observably identical. Proof is structural: their
definition files are not opened, `enemy.js` is not opened, and the only shared
files touched are an additive `<script>` tag and two appended wave entries. A
diff showing any other file is a gate failure, not a judgement call.

## F. Tuning parameters
| Name | Value | Unit | Why this value |
|---|---|---|---|
| `hp` | 150 | — | 1.63× the swordsman (92). Survives a full sword combo plus change. |
| `speed` | 78 | px/s | Below the swordsman (92): the player can always walk away. That is the counter-play. |
| `knockScale` | 0.28 | × | The identity stat. Knifeman 1.15, swordsman 0.62; 0.28 reads as "barely flinches". |
| `scale` | 1.24 | × | Largest silhouette in the game (swordsman 1.09) — the visual promise of the stat block. |
| `telegraph` | 0.58 | s | Longest wind-up; the swing must be dodgeable on sight. |
| `attackDur` / `hitAt` | 0.50 / 0.20 | s | Hit lands 40 % into the swing, matching the swordsman's rhythm. |
| `recover` | 0.70 | s | The longest opening in the game — the whole fairness argument (AD-004). |
| `aggro` | 380 | px | Slightly shorter than the swordsman's 400; it commits later. |

## G. Deferred
| ID | Deferred because | Revisit when |
|---|---|---|
| — | A dedicated heavy weapon (club/hammer) would need `weapons.js` + `Stick.drawWeapon` — a shared-render change, different tier. | Someone wants a second unarmed or blunt type; do it as its own opportunity. |
