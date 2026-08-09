<!-- TASKS TEMPLATE · Every task cites the requirement it satisfies (Article VII)
     and is independently revertible (Article VIII).
     Format: `- [ ] T00n [P?] [US-n] Description — files — check`
     `[P]` = safe to run in parallel: different files, no dependency.
     CAP: quick 40 · standard 100 · deep 140 lines. -->
# Tasks: {NAME}

**Plan:** `plan.md` · **Tier:** {tier}
**Total:** {n} tasks · **Parallelizable:** {n}

## Phase 1 — Setup
- [ ] T001 {project init / branch / nothing to do} — {files} — {check}

## Phase 2 — Foundational
<!-- Only work that BLOCKS every user story. If nothing blocks, say "none" and
     delete the phase. Do not invent scaffolding to fill it. -->
- [ ] T002 {…} — {files} — {check}

## Phase 3 — US-1 {title} (P1)
<!-- After this phase the P1 story is complete, testable and shippable on its own. -->
- [ ] T003 [P] [US-1] {…} — `{file}` — {literal command → expected result}
- [ ] T004 [US-1] {…} — `{file}` — {check}

**Checkpoint:** {how a human confirms US-1 works, in one action}

## Phase 4 — US-2 {title} (P2)
- [ ] T005 [P] [US-2] {…} — `{file}` — {check}

**Checkpoint:** {…}

## Phase N — Polish
- [ ] T00n {docs, tuning, evidence} — {files} — {check}

## Task detail
<!-- Only for tasks whose contract is not obvious from one line. Each entry is
     SELF-CONTAINED: the implementer must not need plan.md or spec.md.
     Cite IDs for traceability, never as required reading. -->

### T003
**Goal.** {one sentence}
**Done when.** {2–4 checkable items}
**Touches.** `{path}` — {which region}
**Forbidden.** `{path}` — {why} · {and why the temptation exists}
**Must not change.** {observable behaviour + the check that proves it}
**Notes.** {≤6 bullets, ONLY what is not discoverable by reading the touched files}

## Dependencies
```
T001 → T002 → { T003 T004 } → T005
```

## Parallel execution
{Which tasks may run together, and the file-overlap argument for why that is safe.}
