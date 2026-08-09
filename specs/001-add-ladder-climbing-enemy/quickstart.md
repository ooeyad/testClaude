# Quickstart: Ladder-Climbing Enemy

**Spec:** `spec.md` · **Validates:** SC-1 … SC-6

## Setup
```bash
python -m http.server 8123 --bind 127.0.0.1   # from the repo root
# http://127.0.0.1:8123/phefo/index.html
```

## Scenarios

### QS-1 — It comes up after you  *(SC-1, US-1)*
1. Reach the wave containing a climber.
2. Climb onto a platform that a ladder serves and stand still.

**Expect:** the climber walks to the ladder, ascends, steps off at the top and
attacks you.
**Fails if:** it stands below and waits, or it arrives but does not attack — the
second means the housekeeping contract (DD-009) is incomplete.

### QS-2 — Killable all the way up  *(SC-2, FR-004)*
1. Attack the climber while it is part-way up.

**Expect:** it takes damage normally; killing it drops it to the ground.
**Fails if:** hits are ignored while attached, or it dies stuck in mid-air.

### QS-3 — No attacks while attached  *(FR-003)*
1. Stand at the top of the ladder as it climbs. **Expect:** no attack until both
   feet are on the upper surface.

### QS-4 — It never strands itself  *(SC-3, FR-006)*
1. Stand exactly on the ladder exit so the arrival point is blocked.

**Expect:** it aborts and behaves as an ordinary enemy. **Fails if:** it freezes,
vibrates, or ends up inside the geometry.

### QS-5 — It follows you down  *(FR-007, US-2)*
1. Once it has arrived, drop to the road. **Expect:** it descends and resumes
   pursuit.

### QS-6 — A traversal completes  *(FR-008, E-1)*
1. Drop down while it is half-way up. **Expect:** it finishes the climb, then
   decides again — not a mid-ladder reversal.

### QS-7 — Nothing else changed  *(SC-5, FR-011)*
1. Play waves 1 and 2, which contain no climber.

**Expect:** identical to before. **Fails if:** any existing enemy hesitates,
re-targets differently, or changes attack timing.

## Automated checks
```bash
cd phefo && for f in $(grep -o 'src="[^"]*"' index.html | sed 's/src="//;s/"//'); do
  node --check "$f" || echo "FAIL $f"; done      # expect: no FAIL
```

## Not covered here
Feel and difficulty — the release gate, played by the Project Owner.
Multi-climber interaction on one ladder. Rendering fidelity of the climb pose.
