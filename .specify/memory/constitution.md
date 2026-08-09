# Project Constitution — phefo

**Version:** 1.0.0 · **Ratified:** 2026-08-09 · **Last amended:** 2026-08-09
**Inherits:** `constitution-universal.md` Articles I–IX (binding, unmodified).

phefo is a dependency-free browser action game: classic `<script>` tags, ES5, no
build, no bundler, no test framework, no assets. "Double-click the folder and it
runs" is a deliberate property, and most of what follows exists to protect it.

---

## Article X — Verification Regime

There is no test framework and none may be added (XI-9). Article VI still binds,
so verification here is two things, both recorded with their literal output:

**X-1 — Syntax, in load order.** Parsing proves little on its own, but a file in
the wrong slot fails at load, so this catches wiring mistakes:
```bash
cd phefo && for f in $(grep -o 'src="[^"]*"' index.html | sed 's/src="//;s/"//'); do
  node --check "$f" || echo "FAIL $f"
done
```

**X-2 — Behaviour, via a throwaway harness.** A `vm` context whose `window` is
the sandbox itself; `document.getElementById('screen')` stubbed with a fake canvas
whose `getContext` returns a Proxy that no-ops every method, special-casing
`createLinearGradient`/`createRadialGradient` to return `{addColorStop(){}}`;
then `vm.runInContext` each `src` from `index.html` in order. `Game.boot()` runs
on load; drive it with `Game.step(1/120)`.

Three traps, each confirmed the hard way — see `project-context/invariants.md`:
INV-10 (reset `invuln`, `blocking`, `dirX` or damage silently does not land) ·
the `AudioContext` stub must be **recursively callable** · INV-13 (spawn clear
of geometry or nothing moves).

**X-3 — The harness is never committed** (XI-9). `P.Game.world` is already a
fully loaded world; driving `entity.update(dt, world)` directly isolates
behaviour better than `World.step`, which also ticks waves.

**Evidence per task:** the literal command and its real output. A check that was
not run is not a check (Article VI).

## Article XI — Technology Constraints

| # | Rule |
|---|---|
| XI-1 | Every file is `window.Phefo = window.Phefo \|\| {}; (function (P) { 'use strict'; … })(window.Phefo);` and hangs its export off `P`. |
| XI-2 | ES5 only: `var`, `Object.create` prototype chains. No classes, arrow functions, `let`/`const`, template literals, default parameters. |
| XI-3 | A new file requires a `<script>` tag in the correct group in `phefo/index.html`; `js/core/game.js` stays last (INV-4). |
| XI-4 | Nothing gameplay-related may scale off frame time; logic runs at a fixed 120 Hz (INV-2). |
| XI-5 | All input polling happens inside the fixed step, never in render code (INV-3). |
| XI-6 | Damage goes through `P.Combat.applyDamage` / `meleeSweep` / `explode`. Never touch `hp` directly. |
| XI-7 | New content is data — a table row, a config block, a level definition — not a new system. |
| XI-8 | No image, audio or font assets. Art is drawn and sound synthesized at runtime. |
| XI-9 | No `package.json`, bundler, transpiler, linter, test framework, CI or runtime dependency. |
| XI-10 | Match the surrounding file's style; never introduce a new idiom into an existing file. |
| XI-11 | A data definition uses only keys its consumer actually reads — unknown keys are silently ignored, so check against the consumer's key list. |
| XI-12 | Shared function signatures are append-only: add optional parameters, never reorder or remove. |
| XI-13 | Named constants carry their units in a comment. Values a human will tune live together. |
| XI-14 | Doc comments state contracts and traps, never restate the code. |
| XI-15 | No dead code, commented-out code or TODOs. Open a `TD-nnn` in `project-context/debt.md` instead. |

## Article XII — Delivery Constraints

| # | Rule |
|---|---|
| XII-1 | Branch from up-to-date `origin/main` as `<kind>/<NNN>-<slug>`, kind ∈ feat fix docs refactor chore perf. Never commit to `main`. |
| XII-2 | One task per commit, or one commit per logical step within it. Never a mixed commit. |
| XII-3 | Commit subject imperative ("Add …", "Fix …"); the body explains why. |
| XII-4 | Scope checks are line-ending normalised — `git diff --ignore-cr-at-eol`, or `diff --strip-trailing-cr` against `git show HEAD:<path>`. A raw `git diff --stat` reports the whole repo as rewritten here (INV-14) and is not evidence. |
| XII-5 | No secret, token or absolute personal path in a tracked file. |
| XII-6 | Committing is the developer's call. Make the change, report it, leave it in the working tree until asked. That one decision then covers branch, commit, push and PR without further prompting. |
| XII-7 | Never run an index-writing git command through a remote file bridge — `status`, `add`, `commit`, `switch`, `checkout`, `stash`. The mount cannot unlink, so each one strands a `.git/index.lock` and the next real git command fails (INV-15). Read-only git — `log`, `show`, `ls-files`, `cat-file`, `rev-parse`, `diff` — is safe. |

---

## Human Gates

| Gate | When | Who | Required for |
|---|---|---|---|
| Specification | after `/speckit.clarify`, before `/speckit.plan` | Project Owner | standard, deep |
| Design | after `/speckit.plan` Phase 1, before `/speckit.tasks` | Project Owner | deep |
| Release | after `/speckit.analyze`, before merge | Project Owner | all tiers |

Feel, pacing and difficulty are judged by the Project Owner playing the game.
No headless check substitutes for that, and the release gate exists to say so.

## Complexity Tracking

| # | Article | Violation | Why accepted | Rejected alternative | Feature |
|---|---|---|---|---|---|
| — | — | none yet | | | |

## Universal Amendments

| Date | Article | Change | Reason | Approved by |
|---|---|---|---|---|
| — | — | none | | |
