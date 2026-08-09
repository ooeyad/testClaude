# EO-001 — Implementation Plan Approval

## Approval Information

**Engineering Opportunity:** EO-001 — Add Ladder-Climbing Enemy  
**Artifact Reviewed:** `implementation/implementation-plan.md`  
**Plan Version:** 1.0  
**Architecture Baseline:** Architecture Design v1.2 (Approved)  
**Repository Baseline:** `main` @ `84257ea`  
**Repository Root (game):** `phefo/`  
**Review Date:** 2026-08-06  
**Reviewed By:** Project Owner  
**Review Point:** H-01 — Implementation Plan approval

---

## Review Scope

The review covered:

- Implementation objective, scope and out-of-scope boundaries
- Implementation strategy and sequencing rationale
- Work-package decomposition and single-responsibility boundaries
- Ordering by risk exposure
- Isolation of the single approved shared-function modification
- Shared file modifications and new files against the approved change inventory
- Branch and commit model
- Implementation sequence
- Rollback strategy and per-package revertibility
- Implementation risks and mitigations
- Validation gates and regression protection
- Definition of Done
- Evidence requirements
- Human review points and escalation
- Recommended implementation roadmap

---

## Approval Checklist

- [x] The plan implements Architecture Design v1.2 without adding architectural decisions.
- [x] All 13 work packages have a single responsibility.
- [x] No work package modifies more than one architectural area.
- [x] Work is ordered by risk exposure, lowest first.
- [x] **ASM-001 is isolated in its own work package (WP-04) with no other change in the commit.**
- [x] Every change that cannot affect existing behaviour lands and is validated before ASM-001.
- [x] Behavioural equivalence of the new type is proven (WP-06 / G-06) before any climbing capability is added.
- [x] The shared file list matches the approved change inventory — 6 modified, 2 new, 8 total.
- [x] No file outside the approved inventory is scheduled for modification.
- [x] Descent is scheduled within the same increment and is not deferrable.
- [x] A validation gate follows every work package.
- [x] Every gate defines both what must be verified and what must not change.
- [x] Existing enemy behaviour is protected continuously, not only at the end.
- [x] Universal invariants U-1…U-4 are re-checked at all 13 gates.
- [x] Rollback is defined per work package, including non-obvious dependencies.
- [x] Stop conditions ST-1…ST-6 are defined and require escalation rather than workaround.
- [x] Evidence requirements E-01…E-07 are specified.
- [x] Human review points are identified, with H-02 and H-07 mandatory.
- [x] Definition of Done is complete and verifiable.
- [x] The plan generates no production code.

---

## Approved Plan Elements

The following are approved and must be followed during the Implementation Cycle:

1. The 13 work packages WP-01 … WP-13, in the order given in §9.
2. The five sequencing principles in §4.1, in particular *inert before consequential* and *prove equivalence before adding capability*.
3. The branch and commit model in §4.2 — one feature branch `feat/eo-001-ladder-climbing-enemy`, one commit per work package, one pull request.
4. The validation gates G-01 … G-13 in §12, including the universal invariants U-1 … U-4.
5. The rollback strategy in §10, including the recorded WP-04 / WP-06 revert dependency.
6. The evidence set E-01 … E-07 in §14.
7. The human review points H-01 … H-08 in §15.
8. The Definition of Done D-01 … D-13 in §13.

---

## Conditions for the Implementation Cycle

Implementation must:

1. Follow Implementation Plan v1.0 and Architecture Design v1.2.
2. Modify only the six approved existing files and create only the two approved new files.
3. Introduce no shared-function modification other than ASM-001.
4. Commit one work package at a time, with the WP-04 commit containing nothing but the ASM-001 change.
5. Pass the validation gate for a work package before beginning the next.
6. Re-check the universal invariants U-1 … U-4 at every gate.
7. Preserve existing enemy behaviour continuously; treat any difference at any gate as a stop condition.
8. Halt and escalate to Architecture Design on any stop condition ST-1 … ST-6, without applying a workaround.
9. Make no architectural decision during implementation.
10. Record deviations, failed assumptions and tuning changes as they occur.
11. Produce all required evidence, including the existing-enemy regression record.
12. Obtain the mandatory human reviews at H-02 (after G-04) and H-07 (after G-13) before proceeding past those points.

---

## Noted Observations

Recorded at approval, not blocking:

1. **Artifact path.** The runbook referenced `engineering/projects/phefo/opportunities/…`, which does not exist. The plan was correctly written to the actual location, `engineering/opportunities/EO-001-add-ladder-climbing-enemy/`. Creating the alternative tree was rightly avoided, as it would have produced a third parallel opportunity folder. Any migration to a `projects/phefo/` layout is a separate change.
2. **Standards remain unestablished.** All 32 files under `engineering/project-context/` are empty. Consistent with the Architecture Approval qualification, `CLAUDE.md` remains the provisional governing convention, and this approval does not certify compliance with future standards.
3. **Highest-likelihood implementation risk is authoring, not coding.** IR-03 — ladder placement violating the Architecture §10 rules — produces symptoms that resemble code defects. Validating geometry at G-03, before any behaviour exists, is accepted as the correct mitigation.
4. **WP-04 is not independently revertible after WP-06.** Reverting ASM-001 while the climber type is registered causes the climber to construct silently as a plain `Enemy`. The plan records this and requires reverting WP-06 first.

---

## Residual Risks Accepted

- Ladder authoring errors may cause incorrect traversal behaviour (IR-03).
- Kinematic climbing bypasses collision while attached.
- Housekeeping behaviour is partially mirrored from the parent implementation.
- Initial tuning values require gameplay validation (IR-09).
- Validation is manual; the existing-enemy guarantee rests on human observation (IR-01, D-04).
- Later waves become measurably harder by design (IR-10).
- Future engineering standards may require architecture and plan reassessment.

---

## Decision

- [x] Approved
- [ ] Rework Required
- [ ] Rejected

---

## Authorisation to Proceed

The Implementation Cycle is authorised to begin at **WP-01 — Ladder domain model**.

Work may proceed without further approval up to **H-02**, the mandatory human review at gate **G-04**, immediately after the ASM-001 work package. Implementation must pause there for review of R-1 … R-4 before WP-05 begins.

---

## Approval Statement

I approve Implementation Plan version 1.0 as the execution baseline for the EO-001 Implementation Cycle.

**Approved By:** Project Owner  
**Approval Date:** 2026-08-06
