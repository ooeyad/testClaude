<!-- TEMPLATE plan.md · CAP 120 lines · replaces implementation-plan.md -->
# {EO-ID} — Plan

**Strategy:** {3–5 lines. The ordering principle — e.g. "data model first, then
rendering, then behaviour; every package leaves the game runnable."}

## Work packages

| WP | Title | Touches | Deps | Refs | Status |
|---|---|---|---|---|---|
| WP-01 | {title} | `path` | — | AD-001 | todo |

## Sequence and parallelism
{Which packages may run in parallel; which are strictly ordered and why.}

## Shared-file modification map
<!-- Every file touched by more than one package: which package owns which region.
     This is what prevents packages from clobbering each other. -->
| File | WP | Region / function | Rule |
|---|---|---|---|

## Validation gates
**Universal (every WP):**
- U-1 {e.g. every script passes `node --check` in load order}
- U-2 {e.g. no new console errors on boot}
- U-3 {e.g. existing behaviour X unchanged}
- U-4 {scope: only this package's `Touches` differ from `HEAD`, line endings normalised — STD-17}

**Per-package:** stated in each card's *Done when*.

## Rollback
{Per-package revertibility in one line each, or the single rule that covers all.}

## Definition of done
1. Every WP `done`, every card log has a Review section with verdict `pass`.
2. All universal gates green.
3. Success criteria in `brief.md` demonstrated.
4. `review.md` has no open `RV` finding of severity high.
5. `close.md` written and project-context delta applied.

## Evidence required
{Bullets. Only artifacts a human would actually look at.}
