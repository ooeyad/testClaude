# Quickstart: Brute Enemy

**Spec:** `spec.md` · **Validates:** SC-1 … SC-6

## Setup
```bash
python -m http.server 8123 --bind 127.0.0.1   # from the repo root
# http://127.0.0.1:8123/phefo/index.html
```

## Scenarios

### QS-1 — It walks through your hits  *(SC-2, FR-001)*
1. Reach wave 3 and engage the largest enemy. 2. Attack it repeatedly.

**Expect:** it barely flinches and keeps closing.
**Fails if:** it is knocked back like the other melee types — then the identity
mechanic is not doing its job and FR-001 is unmet.

### QS-2 — The recovery window is real  *(SC-1, FR-004)*
1. Let it swing and miss. 2. Attack immediately afterwards.

**Expect:** a clear, repeatable opening — the longest in the roster.
**Fails if:** it recovers fast enough to punish you for taking the opening.

### QS-3 — You can always leave  *(SC-6, FR-003)*
1. Walk away from it in a straight line.

**Expect:** you outpace it. **Fails if:** it keeps up — disengaging is the
counter-play, and without it the fight has no answer.

### QS-4 — It telegraphs  *(FR-006)*
1. Watch it wind up. **Expect:** a visible wind-up with a colour change, like
   every other enemy.

### QS-5 — It does not guard  *(FR-005)*
1. Attack it head-on while it is winding up. **Expect:** full damage and sparks
   only from other sources — it has no block.

### QS-6 — Met alone first  *(US-2, FR-008)*
1. Reach wave 3 by the normal route.

**Expect:** you fight it before another enemy engages.
**Known issue:** `analysis.md` RV-002 — this depends on where you were standing
when the wave began. Confirm or reject it here; it is a release-gate decision.

### QS-7 — Nothing else changed  *(SC-4, FR-009)*
1. Play waves 1, 2 and 4, which contain no brute.

**Expect:** identical to before.

## Automated checks
```bash
cd phefo && for f in $(grep -o 'src="[^"]*"' index.html | sed 's/src="//;s/"//'); do
  node --check "$f" || echo "FAIL $f"; done      # expect: no FAIL
```

## Not covered here
Feel, pacing and difficulty — the release gate. Rendering was never drawn: the
harness no-ops every canvas call. Multi-brute interaction (E-1) was not exercised.
