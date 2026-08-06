# EO-001 — Business Approval

## Approval Information

**Engineering Opportunity:** EO-001 — Add Ladder-Climbing Enemy
**Artifact Reviewed:** `business-understanding.md`
**Artifact Version:** 1.0
**Review Date:** 2026-08-06
**Reviewed By:** Project Owner

---

## Review Checklist

* [x] The required gameplay behavior is accurately described.
* [x] Existing enemy behavior must remain unchanged.
* [x] The player cannot use ladders.
* [x] The new enemy can climb upward and downward.
* [x] The enemy cannot attack while climbing.
* [x] The enemy remains vulnerable while climbing.
* [x] A climb always completes once started.
* [x] The enemy uses a knife and has a fast, fragile profile.
* [x] The enemy is visually distinct.
* [x] Ladders are reusable level-authoring objects.
* [x] Manual validation is acceptable.
* [x] Business risks and accepted trade-offs are understood.
* [x] The amendments to the original Engineering Opportunity are accepted.

---

## Approved Amendments

The following amendments are approved:

1. Making elevated platforms universally unsafe is not a pass/fail criterion.
2. The feature is considered successful when the new enemy visibly and sensibly moves between elevations.
3. Existing enemy awareness and behavior must remain unchanged.
4. The `phefo/js/levels/` module is included in scope.
5. The enemy uses ladders only when one is reasonably close.
6. Validation will use a repeatable manual gameplay checklist.
7. The complete capability, including ascent and descent, will ship as one increment.

---

## Decision

* [x] Approved
* [ ] Rework Required
* [ ] Rejected

---

## Conditions

Architecture must:

* Preserve the behavior of existing enemy types.
* Avoid globally changing the current 120-pixel awareness rule.
* Support both ladder ascent and descent.
* Prevent the enemy from becoming permanently stranded.
* Preserve current combat behavior.
* Support reusable ladder definitions in level data.
* Define safe behavior at ladder entry and exit points.
* Address enemy separation while climbing.
* Provide a repeatable validation approach.

---

## Approval Statement

I approve the Business Understanding as the baseline for Architecture Design.

**Approved By:** Project Owner
**Approval Date:** 2026-08-06
