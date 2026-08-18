# Contract — the shared skeleton gains per-character build

**File:** `phefo/js/render/stickman.js` · **Callers:** the player and the enemy
base, and nothing else. **Kind:** one optional trailing parameter and three
optional draw options. No signature is reordered or removed (XI-12).

## The changes

| | |
|---|---|
| `build(pose)` | gains an optional bone set. Omitted ⇒ the shared table, byte-identical output. |
| `draw` options | gains `build`, `features`, both optional. Omitted ⇒ today's figure exactly. |
| head and datum | derived from the character's own bones instead of the module constants. With no build, those *are* the module constants. |
| feature shapes | a new drawing routine beside the weapon one, same shape: a switch on a name, a handful of strokes in local space. |

## What callers may rely on

| Guarantee | |
|---|---|
| Default | A character with no `build` and no `features` draws exactly as it does today, to the pixel. This is what makes every task in this feature independently revertible (Article VIII). |
| Height | A build never changes drawn standing height or foot position. Proportions redistribute inside the height the character already had, so the collision box, melee reach, the health bar and the camera are untouched (DD-003, INV-1). |
| Size | Size remains `scale`'s job. `scale` drives the collision box; `build` never does. |
| Mirroring | Features are drawn inside the existing facing flip, so they mirror for free and cannot detach. |
| Depth | A feature declares behind or in front and inherits the existing far-limb dimming. It may not invent its own alpha. |
| Poses | Every feature stays attached through all eleven poses, death and climb included, because it hangs off a joint rather than off a screen position. |
| Cost | Features are strokes. No gradient, no shadow, no blur, and no allocation per frame — this runs eight times a frame (FR-012). |

## What it must not become

The bone set is numbers. It is not a place for behaviour, not a callback, and not
a per-character drawing hook: the moment a creature wants its *own drawing code*
rather than its own numbers, the answer is a feature in the shared vocabulary,
not an escape hatch here. One skeleton is the property that keeps this project
free of art, and it is worth more than any single creature.
