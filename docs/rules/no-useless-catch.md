# no-useless-catch

![Recommended](https://img.shields.io/badge/-recommended-blue)

| Property | Value |
|----------|-------|
| Category | correctness |
| Fixable | No |
| Recommended | Yes |
| Deprecated | No |

## Description

Disallow useless catch clauses that only rethrow the caught error unchanged

## How to Use

Enable this rule in your configuration:

```json
{
  "rules": {
    "no-useless-catch": "error"
  }
}
```

