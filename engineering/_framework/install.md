# Installing this framework in another project

The framework is four things: commands, agents, templates, and a context folder.
Nothing in it is specific to this repository except
`engineering/project-context/*`, `engineering/standards.md` §"Project-specific",
and the git facts in `CLAUDE.md`.

## Manual install

```
cp -r .claude/commands   <target>/.claude/commands
cp -r .claude/agents     <target>/.claude/agents
cp -r engineering/_framework <target>/engineering/_framework
cp    engineering/README.md  <target>/engineering/README.md
cp    engineering/standards.md <target>/engineering/standards.md   # then delete the project-specific table
mkdir -p <target>/engineering/opportunities
```

Or run `install.ps1 -Target <path>` from this folder.

## Then, in the target project

1. Copy `engineering/_framework/CLAUDE.proposed.md` to `CLAUDE.md` and replace
   the repo-specific git section with that project's facts.
2. Run `/ctx`. This is the one expensive step — it reads the codebase and writes
   `engineering/project-context/*`. Budget 30–60k tokens once; every later
   opportunity reads it instead of rediscovering the code.
3. Review `invariants.md` yourself. You know traps the agent cannot infer; adding
   them here is the single highest-leverage edit in the whole system.
4. Trim `standards.md` to rules that are real for that project, and add the
   project-specific table.
5. Run `/eo <first change>`.

## Keeping it in sync across projects

Treat `engineering/_framework/`, `.claude/commands/` and `.claude/agents/` as the
shared standard: improve them in one repo, copy to the others. Everything under
`engineering/project-context/`, `engineering/opportunities/` and the
project-specific standards table is per-repo and never copied.

The signal that the standard needs a change is a `close.md` process note
repeating across projects.
