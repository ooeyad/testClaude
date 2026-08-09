# EO-001 — Architecture Approval

## Approval Information

**Engineering Opportunity:** EO-001 — Add Ladder-Climbing Enemy  
**Artifact Reviewed:** `architecture/architecture-design.md`  
**Architecture Version:** 1.2  
**Baseline:** `main` @ `84257ea`  
**Review Date:** 2026-08-06  
**Reviewed By:** Project Owner / Human Engineering Lead  

---

## Review Scope

The review covered:

- Business-rule traceability
- Existing enemy backward compatibility
- Ladder domain model
- Climber capability isolation
- Elevation detection
- Ascent and descent behavior
- Physics and collision integration
- Runtime-state housekeeping
- Combat and death behavior
- Entry and exit safety
- Rendering and load order
- Change inventory
- Validation strategy
- Residual risks

---

## Approval Checklist

- [x] All 18 approved business rules are addressed.
- [x] All nine Business Approval conditions are addressed.
- [x] All six Architecture Review findings are resolved.
- [x] Existing enemy behavior is protected through backward-compatible extension.
- [x] ASM-001 is the only approved modification to an existing shared function body.
- [x] Ladders remain outside the shared collision model.
- [x] Climbing behavior is isolated within the new `Climber` type.
- [x] Elevation is based on stable supporting surfaces rather than transient coordinates.
- [x] Both ascent and descent are supported.
- [x] A climb remains committed once started.
- [x] The enemy remains vulnerable while climbing.
- [x] Death during climbing returns to the existing death and physics behavior.
- [x] DISMOUNT resumes physics using one explicit transition contract.
- [x] Runtime-state housekeeping is defined for every climbing mode.
- [x] Existing combat, player, and physics modules remain unchanged.
- [x] Script load-order requirements are defined.
- [x] Manual validation checkpoints are complete and traceable.
- [x] Residual risks are documented and accepted.

---

## Approved Architectural Decisions

The following decisions are approved and must not be changed during implementation without architecture rework:

1. The new enemy will be implemented as a `Climber` subclass of `Enemy`.
2. `P.Enemies.spawn` may be modified only through ASM-001.
3. Ladders will use a separate level-data collection and will not be added to `solids`.
4. Climbing will be kinematic and will bypass normal physics only while attached.
5. DISMOUNT will clear attachment and resume physics immediately.
6. Elevation will be resolved from supporting surfaces and a stable observed-plane filter.
7. The shared 120-pixel awareness rule will remain unchanged.
8. Existing enemy behavior and construction must remain observationally identical.
9. Combat, damage, and death will reuse existing systems.
10. Existing player behavior will remain unchanged.
11. The new enemy will use existing knife combat behavior.
12. The implementation may touch only the files listed in the approved change inventory unless re-approved.

---

## Approved Shared Modification Register

| ID | File | Function | Approved Change |
|---|---|---|---|
| ASM-001 | `phefo/js/entities/enemy.js` | `P.Enemies.spawn` | Resolve constructor using `cfg.ctor || P.Enemy` |

No other modification to an existing shared function body is approved.

---

## Standards Qualification

Project engineering standards are not yet established.

This approval confirms that Architecture Design version 1.2:

- Satisfies the approved business rules.
- Satisfies the Business Approval conditions.
- Follows the provisional conventions defined in `CLAUDE.md`.

This approval does not certify compliance with future project standards. The architecture must be reassessed if future standards conflict with an approved design decision.

---

## Residual Risks Accepted

The following documented risks are accepted:

- Ladder authoring errors may cause incorrect traversal behavior.
- Kinematic climbing bypasses collision while attached.
- Housekeeping behavior is partially mirrored from the parent implementation.
- Initial tuning values require gameplay validation.
- The project currently relies on manual validation.
- Future engineering standards may require architecture reassessment.

---

## Decision

- [x] Approved
- [ ] Rework Required
- [ ] Rejected

---

## Conditions for Implementation

Implementation must:

1. Follow Architecture Design version 1.2.
2. Modify only the approved files.
3. Introduce no unregistered shared-function modification.
4. Preserve all existing enemy behavior.
5. Execute the implementation in small reviewable increments.
6. Record deviations, failed assumptions, and tuning changes.
7. Stop and return to Architecture Design if an unapproved architectural change becomes necessary.
8. Produce Implementation Evidence and validation results.

---

## Approval Statement

I approve Architecture Design version 1.2 as the baseline for Implementation Planning and the Implementation Cycle.

**Approved By:** Project Owner / Human Engineering Lead  
**Approval Date:** 2026-08-06