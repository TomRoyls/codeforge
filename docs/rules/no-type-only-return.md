# no-type-only-return

![Recommended](https://img.shields.io/badge/-recommended-blue)

| Property | Value |
|----------|-------|
| Category | style |
| Fixable | No |
| Recommended | Yes |
| Deprecated | No |

## Description

Disallow functions that have a return type annotation but return nothing or undefined. This often indicates a bug where the return value was forgotten.

## How to Use

Enable this rule in your configuration:

```json
{
  "rules": {
    "no-type-only-return": "error"
  }
}
```

