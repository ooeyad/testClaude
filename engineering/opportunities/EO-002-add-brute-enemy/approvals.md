# EO-002 — Approvals

| Gate | Required | Status | By | Date | Conditions |
|---|---|---|---|---|---|
| scope | yes | approved | Project Owner | 2026-08-09 | C-1, C-2 |
| release | yes | pending | | | |

## Conditions
| ID | Condition | Gate | Met |
|---|---|---|---|
| C-1 | The four existing enemy types must be provably unchanged — their definition files and `enemy.js` are never opened for edit. | scope | [ ] |
| C-2 | No shared file is modified beyond one `<script>` tag in `index.html` and appended wave entries in `level01_city.js`. Any other file in `git diff --stat` fails the gate. | scope | [ ] |

## Accepted residual risks
| ID | Risk | Accepted by | Date |
|---|---|---|---|
| R-2 | The brute may still read as a swordsman variant in play; judged at the release gate. | Project Owner | 2026-08-09 |
| R-4 | Feel cannot be validated headlessly; mechanics only. | Project Owner | 2026-08-09 |
