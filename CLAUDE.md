# CLAUDE.md

Guidance for AI agents working in this repository.

## Start here

1. `.specify/SDD-STANDARD.md` — how work is done here, in one page.
2. `.specify/memory/project-context/index.md` — the map of the codebase.
3. `.specify/memory/project-context/invariants.md` — the traps. Read before
   writing any code.
4. `.specify/memory/constitution.md` — Articles X–XII, the rules for this project.
   Articles I–IX are in `constitution-universal.md` and are binding everywhere.

Do not read a feature's `spec.md` or `plan.md` unless you are in that phase.
Read-sets are declared per role in each feature's `state.json` and they are
binding (Article IX).

## How changes are made

Spec-Driven Development, following `github/spec-kit`. Every change is a numbered
feature under `specs/NNN-slug/`:

```
/speckit.specify <what>   ->  spec.md      WHAT and WHY only, no technology
/speckit.clarify          ->  resolves every [NEEDS CLARIFICATION]
        specification gate — you approve
/speckit.plan             ->  plan.md, quickstart.md (+ research, data-model, contracts)
        design gate — you approve (deep tier only)
/speckit.tasks            ->  tasks.md
/speckit.implement T00n   ->  code, one task at a time
/speckit.analyze          ->  analysis.md, including the token audit
        release gate — you approve
```

Quick-tier changes collapse to `specify → tasks → implement → analyze`.
`/speckit.constitution` builds the constitution and the project-context memory;
it runs once per repository and then only when memory has drifted.

Ad-hoc edits outside this loop are for typos and experiments, and are never
committed to `main`.

## Current features

| ID | Feature | Tier | State |
|---|---|---|---|
| 001 | Ladder-climbing enemy | deep | T001–T012 merged in PR #9; T013 (tuning, checklist, evidence) outstanding |
| 002 | Brute enemy | standard | committed (`aa0359e`); release gate pending; RV-002 open |

## Committing

Committing is the developer's call. Make the change, report it, and leave it in
the working tree until asked. That single decision then covers branch, commit,
push and pull request without further prompting. **Never commit to `main`.**

```bash
git fetch origin
git switch -c <kind>/<NNN>-<slug> origin/main     # from up-to-date main, not HEAD
git push -u origin <kind>/<NNN>-<slug>
gh pr create --base main --title "<title>" --body "<what changed and why>"
```

Kinds: `feat fix docs refactor chore perf`. Commit subjects read as instructions
("Add …", "Fix …"); the body explains why. Report the PR URL; do not merge unless
asked. If something lands on `main` by mistake, branch off the current commit,
then reset `main` back to `origin/main`.

## Repo-specific git facts

- Remote is `https://github.com/ooeyad/testClaude.git` (public).
- `gh` authenticates from the `GITHUB_TOKEN` **user environment variable**, not
  from `gh`'s `hosts.yml`. If `gh auth status` reports an invalid token, the shell
  has likely inherited a stale value from a long-running parent process — re-read
  it with `[Environment]::GetEnvironmentVariable('GITHUB_TOKEN','User')`.
- The token is fine-grained, so each operation needs its own permission: pushing
  needs **Contents: write**, `gh pr create` needs **Pull requests: write**,
  `gh repo create` needs **Administration: write**. A
  `Resource not accessible by personal access token` error is a missing
  permission, not a bad command — re-running will not help.
- This repo sets `credential.https://github.com.helper = !gh auth git-credential`
  so pushes reuse that token instead of prompting Git Credential Manager.
- `.git` is owned by `BUILTIN\Administrators`; Git rejects that as "dubious
  ownership" unless `safe.directory` covers the path. It is configured globally
  on this machine; a fresh environment needs
  `git config --global --add safe.directory D:/AI/Dev/testClaude`.
- Every `.js` file is CRLF and `index.html` is LF (INV-14). A raw
  `git diff --stat` from a tool that does not normalise reports the whole repo as
  rewritten. Use `git diff --ignore-cr-at-eol` (XII-4).
- If you reach this repo over a remote file bridge, run **no** index-writing git
  command — `status`, `add`, `commit`, `switch`, `checkout`, `stash`. The mount
  cannot unlink, so each one strands `.git/index.lock` and the developer's next
  git command fails with "Another git process seems to be running" (INV-15,
  XII-7). Read-only git — `log`, `show`, `ls-files`, `cat-file`, `diff` — is fine.

## Standing rules

- No tooling — no `package.json`, bundler, transpiler, test framework or linter —
  without an approved design decision. "Double-click the folder and it runs" is
  deliberate (XI-9).
- Cite identifiers (`INV-3`, `FR-002`, `DD-001`, `XI-2`); never restate an
  upstream document (Article VII).
- Respect the caps in `.specify/SDD-STANDARD.md`. Overflow goes to
  `implementation-details/`, which is never auto-loaded.
- Create files when they have content. Never scaffold empty ones.
