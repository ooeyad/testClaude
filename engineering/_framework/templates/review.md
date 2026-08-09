<!-- TEMPLATE review.md · CAP 100 lines -->
# {EO-ID} — Review

**Reviewer:** {agent/human} · **Date:** {date} · **Scope:** {diff range or WP list}

## Verdict
{pass | fix-needed | reject} — {one line}

## Findings

| ID | Sev | File:line | Finding | Verdict | Action |
|---|---|---|---|---|---|
| RV-001 | high/med/low | `path:12` | {one line} | confirmed / refuted | {fix in WP-xx / accept / TD-nnn} |

### Detail (confirmed findings only)
**RV-001** — {≤5 lines: concrete failure scenario — inputs/state → wrong output.}

## Checks performed
| Check | Result |
|---|---|
| {universal gate U-1} | ✅ |
| {success criterion 3 from brief} | ✅ |
| {invariant INV-2 preserved} | ✅ |

## Not covered
{What this review did not verify, so nobody assumes it did.}
