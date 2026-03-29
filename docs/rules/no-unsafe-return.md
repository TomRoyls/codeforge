# no-unsafe-return

![Recommended](https://img.shields.io/badge/-recommended-blue)

| Property | Value |
|----------|-------|
| Category | security |
| Fixable | No |
| Recommended | Yes |
| Deprecated | No |

## Description

Disallow unsafe return of values that bypass type safety. Returning any or unknown typed values without proper type narrowing can introduce runtime errors.

## How to Use

Enable this rule in your configuration:

```json
{
  "rules": {
    "no-unsafe-return": "error"
  }
}
```

