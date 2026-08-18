# Data Model — 004 Distinct Enemy Silhouettes

Starting values. The Project Owner settles how they read at the release gate.

## A build

Multipliers over the shared bone table (DD-002). Every key optional, every
default 1, so an omitted key means "as the base figure". Normalised back to
standing height after application (DD-003), so these change *shape only*.

| Key | Scales |
|---|---|
| `torso` | pelvis-to-chest |
| `neck` | chest-to-neck |
| `head` | head radius |
| `arm` | upper arm and forearm together |
| `forearm` | forearm alone, on top of `arm` |
| `leg` | thigh and shin together |
| `shin` | shin alone, on top of `leg` |
| `width` | stroke weight, relative to the character's own |

## The feature vocabulary

Each is a handful of strokes in skeleton-local space, attached to a joint, and
declares whether it sits behind or in front of the body (DD-006).

| Feature | Attaches to | Reads as | Strokes |
|---|---|---|---|
| `horns` | head | dread | 2 |
| `antenna` | head | comic | 2 |
| `jaw` | head | dread — a head too long for its face | 2 |
| `hunch` | chest | dread | 1 arc |
| `tail` | pelvis, behind | either, by length | 2 |
| `spines` | torso, behind | dread | 3 |
| `stub` | chest, behind | comic — a third arm too small to matter | 2 |
| `belly` | pelvis | comic | 1 arc |

**Budget (FR-012, DD-010):** no character may exceed **6 stroke operations** of
features. No gradients, no shadow, no blur, and nothing allocated per frame — it
runs eight times a frame at 120 Hz.

## The cast

`unrest` scales the existing idle animation's amplitude (DD-007). 1 is today.

| Character | Build | Features | Unrest | Reads as |
|---|---|---|---|---|
| **Phefo** | `arm 0.95, leg 1.05, head 0.92` | none | 1.0 | Upright, clean, slightly long-legged. The reference: the only figure with nothing hanging off it, which is what makes everything else read as *other* (FR-002, FR-005) |
| **knifeman** | `arm 1.15, leg 0.85, head 0.8, width 0.85` | `antenna`, `tail` (short) | 1.6 | Comic. Scrawny, small-headed, over-long arms, never still (FR-008) |
| **climber** | `arm 1.35, forearm 1.15, leg 0.8, head 0.75` | `antenna`, `stub` | 1.9 | Comic. All arms and no legs, twitching — a thing built for ladders and embarrassed on the ground (FR-008) |
| **swordsman** | `torso 1.1, arm 1.05, leg 1.05, head 0.9` | `jaw` | 1.0 | Composed and slightly wrong. The disciplined one, so the least distorted enemy |
| **gunman** | `arm 1.1, leg 0.95, head 0.85, width 0.9` | `jaw`, `spines` | 1.2 | Lean, hunched over its aim |
| **archer** | `arm 1.2, forearm 1.1, leg 1.1, head 0.8` | `spines`, `tail` | 1.1 | Long and spidery, built around the draw |
| **brute** | `torso 1.2, arm 1.15, leg 0.8, head 0.75, width 1.25` | `hunch`, `horns` | 1.3 | Dread. Huge torso on short legs, head too small for the body (FR-006) |
| **beast** | `torso 1.25, arm 1.3, forearm 1.15, leg 0.75, head 0.7, width 1.15` | `horns`, `jaw`, `hunch`, `spines` | 1.5 | Dread, and the most distorted thing in the game — knuckles near the ground, head almost lost between its shoulders (FR-006). It already stands 104 px; the build is what makes that height frightening rather than merely large |

## Why these read apart (FR-003)

Told by shape alone, with colour removed and all drawn at one size:

- **Leg length** splits the cast in two: brute and beast are squat, archer and Phefo are long.
- **Arm length** splits it the other way: climber and beast are knuckle-draggers, swordsman is nearly neutral.
- **Head size** runs from Phefo's 0.92 down to the beast's 0.7, and a small head on a wide torso is the single strongest dread cue available without art.
- **Features** disambiguate the pairs that remain close — climber and knifeman are both scrawny and comic, so one gets a third arm and the other a tail.

## What no build may do

Change drawn standing height, foot position, stroke count beyond the budget, or
anything read by combat. Height is `scale`'s job and `scale` is not part of this
feature (FR-009).
