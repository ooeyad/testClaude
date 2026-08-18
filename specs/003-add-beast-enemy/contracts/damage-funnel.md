# Contract — `Combat.applyDamage` gains `target.armor`

**File:** `phefo/js/combat/hitbox.js` · **Callers:** every attack in the game.
**Kind:** additive property read. No signature changes (XI-12).

## The change

One multiplier, applied after the `invuln` refusal and **before** the blocking
branch, so it composes with a guard rather than replacing it:

> If the target carries an `armor` value, incoming `amount` is scaled by it.

## What callers may rely on

| Guarantee | |
|---|---|
| Default | A target without `armor` is damaged exactly as before. No existing entity sets it. |
| Return value | Unchanged in meaning — `false` still means "not a clean hit", never "no damage" (INV-9). An armoured hit that lands cleanly still returns `true`. |
| Composition | An armoured target that is also blocking takes `amount × armor × 0.15`. Both reductions apply; neither is a special case of the other. |
| Death | Reduced damage still routes through `Combat.kill`, so chip and armour can both finish a target. |
| Feedback | Untouched. Blood, flash, hitstop, sound and `lastHitDir` fire on an armoured hit exactly as on a bare one — the player must see that the hit landed and was shrugged off, which is the whole reason `invuln` was rejected (R-1). |
| Stagger | **Not** affected here. Whether a hit staggers stays the funnel's existing rule; the beast suppresses its own stagger in its own file (DD-003). |

## What it must not become

`armor` is a number on the target, read once. It is not a hook, not a callback,
and not a place to put per-type combat rules — the moment a second type wants
different resistance behaviour rather than a different number, that belongs in
that type's file, not here.
