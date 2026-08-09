# Engineering — how work gets done here

Every non-trivial change is an **Engineering Opportunity (EO)** that moves through
a fixed loop. The loop is executable: each step is a slash command, each role is a
subagent with a fixed read-set. You approve at gates; the agent never crosses a
gate on its own.

## The loop

| Step | Command | Produces | Role |
|---|---|---|---|
| 1 | `/eo <title>` | `brief.md`, `state.json`, tier proposal | — |
| 2 | `/ctx` | `project-context/*` (once per repo, then on drift) | scribe |
| 3 | `/clarify` | `decisions.md` — BD register | analyst |
| 4 | `/gate scope` | signature in `approvals.md` | you |
| 5 | `/design` | `decisions.md` — AD register + change inventory | architect |
| 6 | `/gate design` | signature | you |
| 7 | `/plan` | `plan.md` + `wp/WP-xx.md` cards | architect |
| 8 | `/wp <id>` | implementation + append-only log in the card | engineer |
| 9 | `/review [id]` | `review.md` — RV findings | reviewer |
| 10 | `/gate release` | signature | you |
| 11 | `/ship` | branch, commit, push, PR | — |
| 12 | `/close` | `close.md` + delta into `project-context/` | scribe |

**Quick tier:** `/eo` → `/wp 01` → `/gate release` → `/ship`.

## Tiers

The agent proposes a tier with its reasoning; you confirm. Recorded in
`state.json`. Escalation mid-flight is allowed and logged. De-escalation is not.

- **Quick** — ≤2 files, reversible, no new module, no shared-contract change.
  One doc, one gate, one work package.
- **Standard** — new capability using existing patterns, ≤10 files.
  Brief + decisions + plan + cards. Gates: scope, release.
- **Deep** — new subsystem, shared or behavioural contract change, irreversible,
  cross-cutting, or security/data impact. Adds design phase and independent
  review. Gates: scope, design, release.

## The rules that keep it cheap

1. **Cite, never restate.** Downstream documents reference `BD-003`, `AD-005`,
   `INV-2`, `STD-12`. Copying upstream text is a defect.
2. **Read-sets are binding.** Each role opens only what `state.json.context`
   lists for it. Need more? Record a `CTX-GAP` in the card and stop.
3. **Caps are hard.** brief 50 (quick) / 100 (standard, deep) · decisions 200 ·
   plan 120 · WP card 120 · review 100 · close 80 lines. Overflow goes to
   `_appendix/`, never auto-loaded.
4. **Logs append.** Never rewrite an earlier log section; add a new dated one.
5. **No empty files.** Create a file when it has content.
6. **Deltas at close.** Only changed project-context facts are written back.

## Stop conditions

The agent halts and asks when:

- a required gate is not approved;
- a change would touch a file outside the card's `Touches` list;
- an `INV-xx` invariant would change behaviour;
- an assumption cannot be verified from code;
- the read-set is insufficient (`CTX-GAP`);
- more than 5 open questions accumulate on one card.

## ID namespaces

`EO-nnn` opportunity · `BD-nnn` business decision · `AD-nnn` architecture
decision · `WP-nn` work package · `INV-nn` invariant · `STD-nn` standard ·
`RV-nnn` review finding · `TD-nnn` technical debt · `DEV-nnn` deviation.

## Files you will actually read

`state.json` (status at a glance) · `plan.md` (what is left) · the WP card you
care about · `review.md`. Everything else exists for traceability.

## Worked example

`_framework/example/` is the real EO-001 (ladder-climbing enemy) written in this
format — brief, 19 business decisions, architecture decisions, change inventory,
plan, and one work-package card. Read it once to see the shapes. It is reference
only and is never loaded during an opportunity.
