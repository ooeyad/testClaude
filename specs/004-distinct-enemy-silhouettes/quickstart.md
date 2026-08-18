# Quickstart — 004 Distinct Enemy Silhouettes

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

No new file, so no load-order risk this time (INV-4).

## Behaviour, via the throwaway harness (Article X-2)

Build the `vm` sandbox per `project-context/architecture.md`. This feature is
rendering, so the harness stubs the canvas context with a **recording** proxy
that counts path operations instead of a no-op one, and reads back the joint
positions the skeleton builder returns.

| QS | Scenario | Passes when |
|---|---|---|
| QS-1 | Draw every character with its build, and again with the build removed | Standing height and both foot positions are identical to within a pixel — the guarantee the whole feature rests on (DD-003, INV-1) |
| QS-2 | Compare each of the eight builds against every other | No two produce the same set of joint positions; the closest pair is still separated by more than a stroke width (FR-002, FR-003) |
| QS-3 | Drive one character through all eleven poses, plus death and climb | Every feature stays attached to its joint in every pose (Edge 3) |
| QS-4 | Draw a character facing each way | Features mirror with the body and none renders on the wrong side (Edge 2) |
| QS-5 | Count path operations for the full final wave, before and after | Within the budget in `data-model.md`; no character exceeds six stroke operations of features (FR-012, DD-010) |
| QS-6 | Draw a character with no build and no features | Byte-identical joint output to today, proving every task is revertible (DD-009, Article VIII) |
| QS-7 | Step a full wave and compare fight outcomes with and without builds | Identical damage, timing and deaths — appearance only (FR-009) |

## By hand, in the browser

The parts no check can settle, and the release gate is where they are settled:

- Does the street stop looking like a fight against copies of you (SC-5)?
- Sorted by eye with no labels, do the brute and beast land as threatening and the knifeman and climber as ridiculous (SC-2)?
- In the six-enemy final wave, can you still tell instantly who is winding up (SC-4)?

## Scope check

```bash
git diff --ignore-cr-at-eol --stat        # never a bare git diff --stat (INV-14, XII-4)
```
