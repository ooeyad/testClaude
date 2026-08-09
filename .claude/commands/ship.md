---
description: Branch, commit, push and open the PR for the opportunity
---

Ship the active opportunity. Requires gate `release` = approved and every work
package `done` with a `pass` review verdict.

## Preconditions — verify, do not assume
- `state.json`: all `wp[].status == done`, `gates.release.status == approved`.
- Every binding condition `C-n` in `approvals.md` ticked.
- No open `RV` finding of severity high.
- Universal validation gates re-run now, on the final tree, and green.

If any fail: stop, list what failed, do not push.

## Sequence
```bash
git fetch origin
git switch -c <branch> origin/main          # branch from up-to-date main, never from HEAD
```
Branch name: `<kind>/<eo-id>-<slug>`, kind ∈ feat|fix|docs|refactor|chore (STD-12).

Commit per work package where the history is still separable, otherwise one
commit. Subject imperative; body says **why** (STD-11, STD-13).

```bash
git push -u origin <branch>
gh pr create --base main --title "<title>" --body "<what changed and why>"
```

PR body: the brief's problem in 3 lines, the change inventory totals, the
success criteria with evidence, invariants proven preserved, residual risks, and
links to the review. Do not merge unless asked.

## After
Record the PR URL in `state.json` and `close.md`. Report the URL. Then: `/close`.

## Repo notes
Read `CLAUDE.md` for this repo's git and auth specifics before running anything.
