# Quickstart — 003 Late-Game Beast

```bash
python -m http.server 8123 --bind 127.0.0.1   # from repo root
# http://127.0.0.1:8123/phefo/index.html
```

## Syntax, in load order (Article X-1)

```bash
cd phefo && for f in $(grep -o 'src="[^"]*"' index.html | sed 's/src="//;s/"//'); do
  node --check "$f" || echo "FAIL $f"
done
```

`js/entities/beast.js` must appear **before** `js/entities/enemies/beast.js`;
the data file reads `P.Beast` at define time (INV-4). A wrong order does not
fail here — it fails at boot with `ctor` undefined.

## Behaviour, via the throwaway harness (Article X-2)

Build the `vm` sandbox per `project-context/architecture.md`, then drive
`enemy.update(dt, world)` directly. Spawn clear of geometry (INV-13) and reset
`invuln = 0`, `blocking = false`, `dirX = target.facing` (INV-10).

| QS | Scenario | Passes when |
|---|---|---|
| QS-1 | Damage a beast held in `chase`, then the same damage held in `recover` | The second hit removes several times the hp of the first, and both produce blood and a `true` return |
| QS-2 | Land a hit while armoured | `stagger` stays 0 and the state machine keeps running; land one in the opening and it staggers |
| QS-3 | Damage past half health | It enters `recover`, colour flips, and the next wind-up is measurably shorter than the first |
| QS-4 | Spawn two beasts, wound one | The second's `telegraph`, `recover` and `armor` are untouched — proves nothing wrote to the shared `cfg` (INV-NEW-1) |
| QS-5 | Put the player on the walkway 196 px up, beast on the road | The beast acquires and slams; the player takes reduced damage. Then repeat with a knifeman — it must still stand inert (INV-7 holds for existing types) |
| QS-6 | Step the loaded world through the final wave spawn | Every spawn moves within a second — none is wedged in geometry (INV-13) |

## By hand, in the browser

Clear to the final wave. The fight is the only thing to judge here, and the
release gate is where it is judged (SC-1, SC-6): the first attempt should be a
loss, the win should arrive within three to five, and mashing the beast outside
its recovery should feel like hitting a wall — visibly landing, barely counting.

## Scope check

```bash
git diff --ignore-cr-at-eol --stat        # never a bare git diff --stat (INV-14, XII-4)
```

Both new `.js` files must be written CRLF, or they read as wholly rewritten
forever.
