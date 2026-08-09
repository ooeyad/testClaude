<!-- PROPOSED replacement for the repo root CLAUDE.md.
     Review, then move to ./CLAUDE.md. The architecture and quirks prose that was
     here now lives in engineering/project-context/, where it is versioned,
     capped, reused by every opportunity, and loaded only when relevant. -->
# CLAUDE.md

Guidance for AI agents working in this repository.

## Start here

1. `engineering/project-context/index.md` — the map. Always read it.
2. `engineering/project-context/invariants.md` — the traps. Read before writing code.
3. `engineering/README.md` — how work is organised, and the commands that run it.

Do not read an opportunity's design documents unless you are in that phase.

## How changes are made

Every non-trivial change is an Engineering Opportunity run through the loop in
`engineering/README.md`: `/eo` → `/clarify` → `/gate scope` → `/design` →
`/gate design` → `/plan` → `/wp nn` → `/review` → `/gate release` → `/ship` →
`/close`. Quick-tier changes are `/eo` → `/wp 01` → `/gate release` → `/ship`.

Ad-hoc edits outside the loop are for typos and experiments only, and are never
committed to `main`.

## Committing — one decision covers the whole sequence

Committing is the developer's call. Do not commit after every edit; make the
changes, report what changed, and leave them in the working tree until asked.

When the developer does decide to commit, that single decision covers branch,
commit, push and pull request, carried out without further prompting.
**Never commit directly to `main`.**

```bash
git fetch origin
git switch -c <branch-name> origin/main        # from up-to-date main, not from HEAD
git push -u origin <branch-name>
gh pr create --base main --title "<title>" --body "<what changed and why>"
```

Branch names are kebab-case, prefixed `feat/ fix/ docs/ refactor/ chore/`, and
describe the change rather than the files — `fix/enemy-height-aggro-gap`,
`feat/archer-ballistic-aim`. Commit subjects read as instructions ("Add …",
"Fix …"); the body explains *why*. Report the PR URL; do not merge unless asked.

If a change was committed to `main` by mistake, branch off the current commit,
then reset `main` back to `origin/main`.

## Repo-specific git facts

- Remote is `https://github.com/ooeyad/testClaude.git` (public).
- `gh` authenticates from the `GITHUB_TOKEN` **user environment variable**, not
  from `gh`'s `hosts.yml`. If `gh auth status` reports an invalid token, the
  shell has likely inherited a stale value from a long-running parent process —
  re-read it with `[Environment]::GetEnvironmentVariable('GITHUB_TOKEN','User')`.
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

## Standing rules

- Do not introduce tooling — no `package.json`, bundler, transpiler, test
  framework or linter — without an approved architecture decision. The
  "double-click a folder and it runs" property is deliberate.
- Cite IDs (`INV-3`, `STD-21`, `AD-002`); never restate upstream documents.
- Respect the caps in `engineering/README.md`. Overflow goes to `_appendix/`.
- Create files when they have content. Never scaffold empty ones.
