<!-- ALWAYS LOADED. CAP 80 lines. This is the only context file guaranteed to be
     in every agent's read-set. It is a map, not a description. -->
# Project Context — Index

**Repo:** testClaude · **Projects:** `phefo/` — dependency-free canvas action game
**Updated:** 2026-08-09 · **Refresh with:** `/speckit.constitution --context`

## Where things are

| Area | Path | Read when |
|---|---|---|
| Game entry + script load order | `phefo/index.html` | adding any file |
| Loop, world object, boot | `phefo/js/core/game.js` | anything touching update/render order |
| Physics, camera, input, audio, util | `phefo/js/core/` | movement, collision, timing |
| Damage, weapons | `phefo/js/combat/` | anything that deals or takes damage |
| Entities (player, enemy, projectile, pickup) | `phefo/js/entities/` | new actor or behaviour |
| Enemy type definitions (data) | `phefo/js/entities/enemies/` | new enemy |
| `Enemy` subclasses — ladder traversal, boss window | `phefo/js/entities/climber.js`, `beast.js` | elevation, climbing, subclassing `Enemy` |
| Levels (data) | `phefo/js/levels/` | geometry, spawns, waves |
| Stick figure, poses, FX, backdrop | `phefo/js/render/` | anything visual |
| HUD, menus | `phefo/js/ui/` | screens |

## Context files

| File | Contains | Cap |
|---|---|---|
| `architecture.md` | structure, module contract, the `world` surface, extension points | 200 |
| `domain.md` | the nouns and their meaning | 120 |
| `flows.md` | the loop, damage, spawn, input flows step by step | 150 |
| `invariants.md` | **INV-xx — traps that will mislead you.** Read this first. | 120 |
| `debt.md` | TD-xx known debt | 80 |
| `../constitution.md` | Articles X–XII — this project's rules | 120 |

## Hard facts

- No `package.json`, no build, no bundler, no test framework, no linter, no CI.
  The `.js` on disk is exactly what the browser runs. **Do not add tooling.**
- No image/audio/font assets. Art is drawn and sound is synthesized at runtime.
  This is why "double-click the folder and it runs" holds.
- ES5 only, IIFE-per-file hanging exports off `window.Phefo`.
- `<script>` order in `phefo/index.html` **is** the dependency graph.
- Verify with `node --check` per script in load order + a throwaway `vm` harness.

## Run

```bash
python -m http.server 8123 --bind 127.0.0.1   # from repo root
# http://127.0.0.1:8123/phefo/index.html
```
