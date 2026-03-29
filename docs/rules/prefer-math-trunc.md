# prefer-math-trunc

| Property | Value |
|----------|-------|
| Category | performance |
| Fixable | No |
| Recommended | No |
| Deprecated | No |

## Description

Prefer Math.trunc() over bitwise operations (| 0, >> 0) for truncating numbers. Math.trunc() is more readable, handles large numbers correctly, and is explicit about intent.

## How to Use

Enable this rule in your configuration:

```json
{
  "rules": {
    "prefer-math-trunc": "error"
  }
}
```

