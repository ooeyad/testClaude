# Standards Registry

One line per rule. Cite by ID in reviews and work-package cards. A rule that
cannot be checked against a diff does not belong here — put guidance in
`project-context/architecture.md` instead.

Status: `A` active · `P` proposed · `X` retired.

## Universal (portable to any project)

| ID | S | Rule |
|---|---|---|
| STD-01 | A | Match the surrounding file's style; do not introduce a new idiom in an existing file. |
| STD-02 | A | No new runtime dependency without an AD decision. |
| STD-03 | A | No new build step, bundler, transpiler or framework without an AD decision. |
| STD-04 | A | Public/shared function signatures are append-only: add optional parameters, never reorder or remove. |
| STD-05 | A | A change to shared behaviour requires an explicit entry in the change inventory and a named gate. |
| STD-06 | A | Dead code, commented-out code and TODOs are not committed; open a `TD-nnn` instead. |
| STD-07 | A | Names describe intent, not type or implementation. |
| STD-08 | A | Errors are handled where they can be acted on; never swallowed silently. |
| STD-09 | A | Magic numbers that a human will tune live in a named constants block with units in the comment. |
| STD-10 | A | Every work package leaves the tree runnable; no "fixed in the next package". |
| STD-11 | A | Commit subject is imperative ("Add …", "Fix …"); the body explains why, not what. |
| STD-12 | A | Branch from up-to-date `origin/main`, prefixed `feat/ fix/ docs/ refactor/ chore/`. Never commit to `main`. |
| STD-13 | A | One work package per commit, or one commit per logical step within it — never a mixed commit. |
| STD-14 | A | Documentation comments state contracts and traps, not restatements of the code. |
| STD-15 | A | No secret, token or absolute personal path in tracked files. |
| STD-16 | A | Any deviation from the approved design is recorded as `DEV-nnn` in the work-package log before proceeding. |
| STD-17 | A | Scope checks compare against `HEAD` with line endings normalised (`git diff --ignore-cr-at-eol`, `diff --strip-trailing-cr`); a raw `git diff --stat` is not evidence. |
| STD-18 | A | A data definition uses only keys its consumer actually reads. Unknown keys are silently ignored, so every new definition is checked against the consumer's key list. |

## Project-specific — phefo

| ID | S | Rule |
|---|---|---|
| STD-20 | A | Every file is `window.Phefo = window.Phefo \|\| {}; (function (P) { 'use strict'; … })(window.Phefo);` and hangs its export off `P`. |
| STD-21 | A | ES5 only: `var`, `Object.create` prototype chains. No classes, arrow functions, `let`/`const`, template literals. |
| STD-22 | A | A new file requires a `<script>` tag in the correct group in `phefo/index.html`; `js/core/game.js` stays last. |
| STD-23 | A | Nothing gameplay-related may scale off frame time; logic runs at fixed 120 Hz. |
| STD-24 | A | All input polling happens inside the fixed step, never in render code. |
| STD-25 | A | Damage goes through `P.Combat.applyDamage` / `meleeSweep` / `explode`; never touch `hp` directly. |
| STD-26 | A | New content is data (a table row, a config block, a level definition), not a new system. |
| STD-27 | A | No image, audio or font assets; art is drawn and sound is synthesized at runtime. |
| STD-28 | A | Verification is `node --check` on every script in `index.html` load order, plus a throwaway `vm` harness for behaviour. |
