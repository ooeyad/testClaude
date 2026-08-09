<!-- DATA MODEL TEMPLATE · Only when the feature adds or changes domain data.
     CAP 100 lines. Entities and relationships — not storage mechanics unless the
     storage IS the decision. -->
# Data Model: {NAME}

**Plan:** `plan.md`

## Entities
### {Entity}
**Meaning:** {one line — the domain concept, not the record}
**Owned by:** `{module}`
**Lifecycle:** {created when · mutated when · destroyed when}

| Field | Type | Required | Meaning / units | Constraint |
|---|---|---|---|---|

**Invariants:** {rules that must hold at all times, and what enforces them}

## Relationships
```
{Entity} 1 ──< {Entity}
```

## Validation rules
| # | Rule | Enforced where | On violation |
|---|---|---|---|

## State transitions
<!-- Only for entities with a lifecycle worth drawing. -->
```
{state} --{event}--> {state}
```

## Compatibility
{What existing data or callers this must not break, and why it does not.}
