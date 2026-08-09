---
description: Break the approved design into self-contained work-package cards
---

Use the **architect** subagent. Requires the gates the tier demands.

## Read-set — binding
`state.json`, `brief.md`, `decisions.md`, `engineering/standards.md`,
`engineering/project-context/invariants.md`.

## Package rules
- **Each package leaves the tree runnable** (STD-10). No "fixed in the next one".
- One package = one coherent, reviewable change, typically 1–3 files.
- Order: data model → presentation → behaviour → placement/content → tuning.
- A file touched by two packages needs a row in the shared-file modification map
  naming which package owns which region.
- Quick tier: exactly one package, written inline in `brief.md`, no `wp/` folder.
- Standard: 3–7 packages. Deep: 5–12. More than 12 means the opportunity should
  be split.

## Write
- `plan.md` from the template — **cap 120 lines**.
- One card per package, `wp/WP-nn.md` from `wp-card.md` — **cap 120 lines each**.
- Mirror the package table into `state.json.wp`.

## The card is the contract — this is where the token savings live
A card must be **self-contained**: the engineer implementing it must never need
to open `decisions.md`, `plan.md` or the architecture. Therefore each card
carries, in its own words and in full: the goal, the checkable *Done when*, the
exact files it may touch (and which region of each), the files it must not
touch and why, the behaviours that must not change, and ≤6 notes covering only
what is **not** discoverable from reading the touched files.

Cite `AD-xx` / `INV-xx` / `STD-xx` as identifiers for traceability — but never
send the engineer to go read them.

## Report
The package table, the critical path, and which packages can run in parallel.
