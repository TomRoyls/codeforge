# no-unsafe-type-assertion

![Recommended](https://img.shields.io/badge/-recommended-blue)

| Property | Value |
|----------|-------|
| Category | security |
| Fixable | No |
| Recommended | Yes |
| Deprecated | No |

## Description

Warn on unsafe type assertions (casting to/from any, unknown, or unrelated types). Type assertions bypass TypeScript safety checks and can hide type errors.

## How to Use

Enable this rule in your configuration:

```json
{
  "rules": {
    "no-unsafe-type-assertion": "error"
  }
}
```

