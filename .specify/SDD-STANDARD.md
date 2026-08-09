# Spec-Driven Development — the standard we run

Based on **GitHub spec-kit** (`github/spec-kit`, `spec-driven.md`). Same artifact
names, same command names, same phase model, so the published standard, its CLI
and anyone else's spec-kit knowledge all apply here. Two things are added on top:
a **two-layer constitution**, because spec-kit's articles assume a library/CLI/TDD
project, and a **context-economy layer** (tiers, caps, read-sets, `state.json`),
because unbounded artifact generation is the failure mode we actually hit.

## The loop

| # | Command | Produces | Role |
|---|---|---|---|
| 0 | `/speckit.constitution` | `.specify/memory/constitution.md` + `project-context/*` | scribe work, once per repo |
| 1 | `/speckit.specify <what>` | `specs/NNN-slug/spec.md`, `state.json` | specifier |
| 2 | `/speckit.clarify` | resolves every `[NEEDS CLARIFICATION]` | specifier |
| — | **Specification gate** | human approval | you |
| 3 | `/speckit.plan` | `plan.md` (+ `research.md`, `data-model.md`, `contracts/`, `quickstart.md`) | planner |
| — | **Design gate** *(deep only)* | human approval | you |
| 4 | `/speckit.tasks` | `tasks.md` | planner |
| 5 | `/speckit.implement <T00n>` | code + task log | implementer |
| 6 | `/speckit.analyze` | `analysis.md` incl. token audit | analyzer |
| — | **Release gate** | human approval | you |

Quick tier collapses to: `/speckit.specify` → `/speckit.tasks` → `/speckit.implement` → `/speckit.analyze`.

## Tiers — ceremony proportional to risk

Proposed by the agent from an explicit checklist, confirmed by you, recorded in
`state.json`. **Escalation mid-flight is allowed and logged; de-escalation is not.**

| | **Quick** | **Standard** | **Deep** |
|---|---|---|---|
| Trigger | ≤2 files, reversible, no new module, no shared contract, no new dependency | new capability on existing patterns, ≤10 files, ≤1 shared contract | new subsystem, shared or behavioural contract change, irreversible, security or data impact |
| Artifacts | `spec` `tasks` `state` | + `plan` `quickstart` (+`data-model` if data changes) | + `research` `contracts/` `checklists/` |
| Gates | release | specification, release | specification, design, release |
| Tasks | 1–3 | 3–10 | 5–15 |
| Budget | 15k tokens | 80k | 250k |

## Caps

`spec` 50/100/120 by tier · `plan` 120/150 · `tasks` 40/100/140 · `research` 80 ·
`data-model` 100 · `quickstart` 60 · `checklist` 50 · `analysis` 100.
Memory: `index` 80 · `architecture` 200 · `domain` 120 · `flows` 150 ·
`invariants` 120 · `debt` 80 · `constitution` 120.

Overflow goes to `implementation-details/` or an appendix, which is never loaded
by default. `check-prereqs.ps1` fails a gate on an over-cap artifact.

## Read-sets

Binding, declared in `state.json`. A role opens nothing outside its set; when it
needs more it writes `[CONTEXT GAP: what was missing]` and stops.

| Role | Reads | Target |
|---|---|---|
| specifier | `spec.md`, constitution, memory index + invariants | 5k |
| planner | + `plan.md`, memory `architecture`/`domain`, named code files | 15k |
| implementer | `state.json`, the task detail, invariants, Articles X–XII, only `Touches` files | 8k |
| analyzer | all artifacts + the diff | 10k |

**The load-bearing rule:** a task detail is a *contract, not a pointer*. The
implementer must never need `spec.md` or `plan.md`. Every `[CONTEXT GAP]` in a
finished feature means a task detail failed that test — which is why
`/speckit.analyze` reports them as a headline number.

## Identifier namespaces

`NNN` feature · `US-n` user story · `FR-nnn` functional requirement ·
`SC-n` success criterion · `DD-nnn` design decision · `T00n` task ·
`INV-nn` invariant · `TD-nnn` technical debt · `QS-n` quickstart scenario ·
`CL-nnn` checklist finding.

Downstream artifacts cite identifiers. Restating upstream prose is a defect
(Article VII) — it is also where the token cost came from last time.

## Stop conditions

The agent halts and asks when: a required gate is unapproved · a
`[NEEDS CLARIFICATION]` marker survives into planning · a change would touch a
file outside the task's `Touches` · an `INV` behaviour would change · an
assumption cannot be verified from code · a read-set is insufficient · more than
5 open questions accumulate on one task.

## Installing in a new repo

1. Copy `.specify/` and `.claude/` in. Do not copy `specs/`.
2. Run `/speckit.constitution` — write Articles X–XII from that codebase, not from
   a template. An article you cannot point at code to justify is a guess.
3. Run `/speckit.constitution --context` — builds `project-context/`. Budget
   30–60k tokens once; every later feature reads it instead of rediscovering.
4. Review `invariants.md` yourself. You know traps the agent cannot infer.
5. `/speckit.specify <first change>`.

## A note on the CRLF trap

Any tool that does not normalise line endings can report an entire repository as
rewritten, which makes `git diff --stat` useless as a scope check. Use
`git diff --ignore-cr-at-eol`, or `diff --strip-trailing-cr` against
`git show HEAD:<path>`. `measure-context.ps1` already normalises.
