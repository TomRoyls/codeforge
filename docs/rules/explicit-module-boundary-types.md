# explicit-module-boundary-types

![Recommended](https://img.shields.io/badge/-recommended-blue)

| Property | Value |
|----------|-------|
| Category | style |
| Fixable | No |
| Recommended | Yes |
| Deprecated | No |

## Description

Require explicit return types on exported functions. Explicit return types on module boundaries improve API documentation and help catch type errors at compile time.

## How to Use

Enable this rule in your configuration:

```json
{
  "rules": {
    "explicit-module-boundary-types": "error"
  }
}
```

