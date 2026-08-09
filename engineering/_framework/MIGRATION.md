# Migration record — v1 ceremony tree → v2 framework

Completed 2026-08-09. The working tree now holds **the `phefo/` game and this
framework, and nothing else**.

## What was removed

Everything below was moved to `_to_delete/` at the repository root rather than
deleted, because the tool bridge to this machine cannot unlink files. **Review it,
then delete the folder yourself.** It is git-ignored.

| Moved out | Why |
|---|---|
| `engineering/opportunities/EO-001-add-ladder-climbing-enemy/` | ~878 KB of ceremony for one feature. Its decisions, design and plan are preserved in `_framework/example/`; the full text remains in git history. |
| `engineering/projects/` | A second, duplicate home for the same opportunity. Every file was zero bytes. |
| `engineering/project-context/standards/` (24 files) | All empty. Replaced by `engineering/standards.md`. |
| `engineering/project-context/{architecture,domain,execution-flows,extension-points,technical-debt}/` | All empty. Replaced by the six flat, capped context files. |
| `engineering/project-context/{context-index,module-map,system-overview}.md` | All empty. Replaced by `index.md`. |
| `engineering/_framework/framework-v2.0.tar.gz` | A snapshot that would go stale. `install.ps1` copies from the live folders instead. |

**Nothing is lost.** Every removed document is committed on `main` — see
`git log` around "Add EO-001 discovery", "Add EO-001 business understanding" and
"Adopt EO-001-add-ladder-climbing-enemy as the authoritative structure". If you
ever need the original 64 KB architecture design, it is one `git show` away.

## What replaced it

```
CLAUDE.md                     thin router — no architecture prose
.claude/commands/             10 commands: the executable lifecycle
.claude/agents/               5 roles with binding read-sets
engineering/README.md         the operating manual
engineering/standards.md      STD-01..16 universal · STD-20..28 phefo
engineering/project-context/  index · architecture · domain · flows · invariants · debt
engineering/opportunities/    empty; /eo creates the first one
engineering/_framework/       rationale · templates · schema · installer · worked example
```

## What survived from EO-001

The nineteen business decisions, ten architecture decisions, the change
inventory, the load-order constraints and the thirteen work packages — all of it
is in `_framework/example/`, at ~12 KB instead of ~878 KB. If the ladder feature
is picked up again, start from `_framework/example/decisions.md`; the decisions
are still valid, and only `WP-01` was ever implemented.

Twelve invariants extracted from that work now live permanently in
`engineering/project-context/invariants.md`, where every future opportunity gets
them for free. That transfer is the point of the whole exercise.

## A note on `git status`

Viewed from a Linux tool bridge, every `phefo/*.js` file appears wholly modified.
That is a CRLF/LF rendering artifact of the mount, not a real change — the text
is identical. On Windows, with your normal Git configuration, the tree is clean.
Commit the removals from Windows, not through the bridge.
