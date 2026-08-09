<!-- TEMPLATE wp/WP-nn.md · CAP 120 lines
     Replaces kickoff.md + engineer-acknowledgement.md + implementation.md +
     self-review.md + technical-lead-acceptance.md.
     THIS FILE IS SELF-CONTAINED: the engineer must not need any other document. -->
# WP-{nn} — {Title}

**Status:** todo | doing | blocked | review | done · **Depends:** {WP-xx | —}
**Refs:** {AD-002, BD-005, INV-3, STD-21}

## Contract

**Goal.** {One sentence.}

**Done when.**
1. {checkable}
2. {checkable}

**Touches.** `path` (new) · `path` (edit: only `functionName`)
**Forbidden.** `path` — {why} · `path` — {owned by WP-07}

**Must not change.** {Observable behaviours that must be identical after this
package, and the check that proves each. Cite INV-xx where one applies.}

## Notes
<!-- Max 6 bullets. ONLY things not discoverable by reading the touched files.
     Traps, conventions, the exact reason a naive implementation is wrong.
     Do not restate the architecture document. -->
- {…}

## Log — append only

### Ack — {date}
**Understanding:** {2 lines, in the engineer's own words.}
**Assumptions:** A-1 {…} (max 5)
**Questions:** Q-1 {…} — *blocking? yes/no* (max 5; >5 or any blocker ⇒ status `blocked`)
**CTX-GAP:** {none | what was missing from this card}

### Answers — {date}
Q-1 → {answer}

### Done — {date}
**Changed:** `path` — {one line each}
**Deviations:** {none | DEV-nnn: what and why}
**Checks:** {command} → {result}
**Not done deliberately:** {things a reviewer might expect but that belong elsewhere}

### Review — {date}
**Verdict:** pass | fix-needed
**Findings:** RV-nnn {severity} — {≤3 lines} → {action}
