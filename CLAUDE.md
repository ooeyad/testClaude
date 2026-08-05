# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Change workflow — a commit means branch, push, PR

Committing is the developer's call. Do not commit after every edit; make the changes, report what changed, and leave them in the working tree until asked.

When the developer does decide to commit, that single decision covers the whole sequence — branch, commit, push, open the pull request — carried out without further prompting. Never commit directly to `main`.

1. **Branch from up-to-date `main`**, not from whatever is currently checked out:
   ```bash
   git fetch origin
   git switch -c <branch-name> origin/main
   ```
2. **Name the branch from the request**, kebab-case, prefixed by the kind of change: `feat/`, `fix/`, `docs/`, `refactor/`, `chore/`. Describe the change, not the files — `fix/enemy-height-aggro-gap`, `feat/archer-ballistic-aim`, `docs/claude-md`.
3. **Commit** with a subject line that reads as an instruction ("Add …", "Fix …"), and a body explaining *why* when it is not obvious.
4. **Push and open the PR**:
   ```bash
   git push -u origin <branch-name>
   gh pr create --base main --title "<title>" --body "<what changed and why>"
   ```
5. Report the PR URL back. Do not merge it unless asked.

If a change is already committed on `main` by mistake, move it: branch off the current commit, then reset `main` back to `origin/main`.

### Repo-specific facts for the above

- Remote is `https://github.com/ooeyad/testClaude.git` (public).
- `gh` authenticates from the `GITHUB_TOKEN` user environment variable, not from `gh`'s own `hosts.yml`. If `gh auth status` reports an invalid token, the shell has likely inherited a stale value from a long-running parent process — re-read it with `[Environment]::GetEnvironmentVariable('GITHUB_TOKEN','User')`.
- The token is fine-grained, so each operation needs its own permission: pushing needs **Contents: write**, `gh pr create` needs **Pull requests: write**, and `gh repo create` needs **Administration: write**. A `Resource not accessible by personal access token` error is a missing permission on the token, not a bad command — the fix is in the token's settings, and re-running will not help.
- This repo sets a local credential helper (`credential.https://github.com.helper = !gh auth git-credential`) so pushes reuse that token instead of prompting Git Credential Manager.
- `.git` here is owned by `BUILTIN\Administrators`. Git rejects that as "dubious ownership" unless `safe.directory` covers the path; it is already configured globally on this machine, but a fresh environment will need `git config --global --add safe.directory D:/AI/Dev/testClaude`.

## Repository shape

Two unrelated, dependency-free browser projects share this repo:

- `phefo/` — a canvas action game (the substantial codebase)
- `tic-tac-toe.html` — a single self-contained file

There is no `package.json`, no build step, no bundler, no test framework, and no linter config. Nothing is transpiled; the `.js` files on disk are exactly what the browser executes. Do not introduce tooling unless asked — the "double-click a folder and it runs" property is deliberate and is why the game synthesizes its audio and draws its art at runtime instead of loading assets.

## Running

Both projects use classic `<script>` tags with no `fetch`/`import`, so `file://` works. A static server is still the cleaner path:

```bash
python -m http.server 8123 --bind 127.0.0.1   # from the repo root
# http://127.0.0.1:8123/phefo/index.html
# http://127.0.0.1:8123/tic-tac-toe.html
```

Syntax-check every script the game actually loads, in load order:

```bash
cd phefo && for f in $(grep -o 'src="[^"]*"' index.html | sed 's/src="//;s/"//'); do
  node --check "$f" || echo "FAIL $f"
done
```

### Testing phefo without a browser

There is no committed test suite. Parsing cleanly proves very little here, so the way to actually verify a change is a throwaway Node harness: create a `vm` context whose `window` is the sandbox itself, stub `document.getElementById('screen')` with a fake canvas whose `getContext` returns a Proxy that no-ops every method (special-casing `createLinearGradient`/`createRadialGradient` to return `{addColorStop(){}}`), then `vm.runInContext` each `src` from `index.html` in order. `Phefo.Game.boot()` runs on load, after which you can drive `Game.step(1/120)` in a loop, poke `Phefo.Input._pressed` / `Input.mouse` to simulate input, and call `Game.render()` to exercise the draw paths.

Two traps when writing such a harness: `Input.CONFIRM` includes `Space`, so a simulated jump silently restarts the run from a victory/game-over screen; and `Combat.applyDamage` refuses hits when `target.invuln > 0` or when the target is blocking frontally, so deterministic scripted kills need `invuln = 0`, `blocking = false`, and `dirX = target.facing`.

## phefo architecture

### Module and load-order convention

Every file is `window.Phefo = window.Phefo || {}; (function (P) { 'use strict'; ... })(window.Phefo);` and hangs its export off `P`. ES5 throughout — `var`, `Object.create` prototype chains, no classes or arrow functions. Match this; it is consistent across every file.

**The `<script>` order in `phefo/index.html` is the dependency graph and is load-bearing.** Files capture their dependencies into locals at IIFE-execution time (`var U = P.util;`, `var In = P.Input;`, `P.Projectile.KINDS.arrow.grav`), so a file placed before its dependency captures `undefined` and fails later with a confusing error rather than at load. Adding a file means adding a `<script>` tag in the correct slot; the comment groups in `index.html` (core → render → combat → entities → levels → ui → boot) reflect real constraints, and `js/core/game.js` must stay last because it calls `Game.boot()` at parse time.

### Coordinate convention

Entity position is `(x = horizontal centre, y = feet)`, so the AABB is `[x - w/2, y - h]` to `[x + w/2, y]`. Physics ground-snapping, the stick figure (which builds upward from the pelvis), shadows and camera targeting all assume this. Solids are plain world-space rects `{x, y, w, h, oneWay?}` — there is no level-specific collision code anywhere.

### The loop, and where input must be read

`js/core/game.js` runs logic at a fixed 120 Hz via an accumulator, with rendering decoupled. Melee windows are as short as 90 ms, so nothing gameplay-related may scale off frame time.

`Input.endStep()` clears edge-triggered state (`wasPressed`, `mouse.pressed`) once per logic step. **All input polling therefore has to happen inside the fixed step** — `Game.step` handles menu/pause/restart input for exactly this reason. Reading a press from render code will either miss it or see it twice.

`world.hitstop` freezes the entire world for a few frames on a connecting hit; `World.step` returns early while it is non-zero.

### The `world` contract

A single `World` object (in `game.js`) is passed to every `update(dt, world)` and most draw calls. Anything new that lives in the level must fit this surface: `solids`, `player`, `enemies`, `projectiles`, `pickups`, `camera`, `bounds`, `groundY`, `hitstop`, plus `spawnProjectile()`, `allCharacters()`, `aliveEnemies()`, `onEnemyKilled()` and `notify()`. `allCharacters()` returns a scratch array rebuilt once per step — do not retain it across steps.

### Data-driven content

Adding content should mean adding data, not systems:

- **Weapons** are rows in the table in `js/combat/weapons.js` plus a few strokes in `Stick.drawWeapon`.
- **Enemies** share one state machine in `js/entities/enemy.js` (`idle → chase → telegraph → attack → recover`). A type is a config block plus a small `attack(e, world, shotIndex)` function passed to `P.Enemies.define`; `js/entities/enemies/*.js` are all data. The `telegraph` state is deliberate — a visible wind-up before every attack is what makes a crowd readable.
- **Levels** are data registered with `P.Levels.define` (`js/levels/level01_city.js` is the worked example): solids, `playerStart`, camera `bounds`, `pickups`, `waves`, and an optional `decor(ctx, cam)` hook.
- **Projectiles** are entries in `KINDS` in `js/entities/projectile.js`; `grav: 0` gives a flat bullet, anything higher arcs.

### Rendering

There are no sprites and no image files. Every character — player and all enemies — is the same skeleton in `js/render/stickman.js`, differing only by scale, colour and weapon. A pose is a bag of joint **angles** (`js/render/poses.js`); `Stick.build` turns angles into points by forward kinematics at draw time. Near limbs draw over the torso, far limbs draw behind and dimmed.

`js/core/audio.js` synthesizes every sound with WebAudio at runtime. Browsers block `AudioContext` until a gesture, so `Audio.init()` is deferred through `Input.onFirstGesture`, wired up in `Game.boot`.

### Damage

Everything damaging funnels through `P.Combat.applyDamage` (`js/combat/hitbox.js`), which owns blocking, i-frames, knockback, particles, hitstop and death. New attacks should call it (or `meleeSweep`/`explode`) rather than touching `hp` directly, or they will skip all of that.

## Known quirks in existing code

These are real and were confirmed by running the game; they look like bugs and will mislead you:

- **Enemies never engage across a height gap.** `Enemy.update` requires `Math.abs(player.y - this.y) < 120` to acquire a target, so an enemy placed on a high platform will stand there inert. Level `waves` entries must keep enemies within ~120px of the player's plane; `js/levels/level01_city.js` has a comment where this bit.
- **Level `bounds.maxY` is tuned, not arbitrary.** In `level01_city.js` it is chosen so the camera's vertical clamp is active while the player stands on the road, which lines the road up with the base of the backdrop skyline (`viewH * 0.80`). Changing `maxY` decouples the playfield from the horizon.
- **A blocked hit returns `false` from `applyDamage` but still deals damage.** The return value means "was this a clean hit", and callers use it to pick spark-coloured impact FX over blood — it is not a did-any-damage-land flag. Chip damage goes through `Combat.kill`, so a guard can be broken through.

## tic-tac-toe.html

Self-contained: inline `<style>` and `<script>`, no external references, no shared code with `phefo/`. Marks are SVG paths drawn with a stroke animation. Three modes selected by `data-mode` buttons — `human`, `casual`, and `perfect` (full minimax); `casual` deliberately plays imperfectly. Light/dark is driven by `:root[data-theme]`.
