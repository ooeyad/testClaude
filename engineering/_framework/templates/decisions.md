<!-- TEMPLATE decisions.md · CAP 200 lines · replaces business-understanding.md + architecture-design.md -->
# {EO-ID} — Decisions

Status: 🔴 open · 🟢 decided · ⚪ deferred. Rationale is one paragraph, max.
Anything longer goes to `_appendix/`.

## A. Business decisions (analyst)

| ID | Decision | Status | Answer |
|---|---|---|---|
| BD-001 | {question} | 🟢 | {one line} |

### Rationale (only where the answer is non-obvious)
**BD-001** — {≤4 lines. Why this and not the alternative.}

## B. Architecture decisions (architect) — standard/deep only

| ID | Decision | Status | Choice | Refs |
|---|---|---|---|---|
| AD-001 | {question} | 🟢 | {one line} | BD-003, INV-2 |

### Rationale (only where the answer is non-obvious)
**AD-001** — {≤6 lines. Chosen option, the one rejected, and the deciding factor.}
Rejected alternatives in full → `_appendix/alternatives.md`.

## C. Change inventory — deep only

| File | Kind | What changes | Shared? | Refs |
|---|---|---|---|---|
| `path` | new / additive / modify | {one line} | no / **yes — gate** | AD-002 |

**Totals:** {n} new, {n} additive, {n} modified. **Shared-contract changes:** {n}.

## D. Invariant impact

| INV | Preserved / Changed | How proven |
|---|---|---|
| INV-3 | preserved | {check that demonstrates it} |

## E. Behavioural compatibility rule
{One paragraph: what must observably not change, and the test that proves it.
Omit for quick tier.}

## F. Tuning parameters
| Name | Value | Unit | Where | Why this value |
|---|---|---|---|---|

## G. Deferred
| ID | Deferred because | Revisit when |
|---|---|---|
