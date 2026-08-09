---
description: Record a human approval gate
argument-hint: scope | design | release | <custom>
---

Record gate **$ARGUMENTS**.

## 1. Present the decision packet — this and nothing more
- What is being approved, in 3 lines.
- The decisions the human is signing off (`BD`/`AD` IDs with their one-line answers).
- Shared-contract changes and invariants at risk.
- Residual risks, each with the consequence if it lands.
- Open questions still unanswered.
- What becomes hard to reverse after this gate.

Keep it under 40 lines. Do not paste the source documents; the human can open
them. If you cannot summarise it in 40 lines, the phase is not finished.

## 2. Ask
Approve / approve with conditions / reject. Conditions are recorded as `C-n` in
`approvals.md` and are **binding** — every later card that touches a condition
must cite it.

## 3. Write
`approvals.md`: status, who, date, condition IDs.
`state.json`: `gates.$ARGUMENTS` = status/by/at/conditions; advance `phase`.

## Rules
- Never mark a gate approved without an explicit human answer in this session.
- Never proceed past a `pending` or `rejected` required gate.
- A rejected gate returns the opportunity to the previous phase; say which.
