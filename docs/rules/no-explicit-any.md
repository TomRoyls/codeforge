# no-explicit-any

![Recommended](https://img.shields.io/badge/-recommended-blue) ![Fixable](https://img.shields.io/badge/-fixable-green)

| Property | Value |
|----------|-------|
| Category | style |
| Fixable | Yes |
| Recommended | Yes |
| Deprecated | No |

## Description

Disallow usage of the any type in TypeScript. Use more specific types for better type safety.

## How to Use

Enable this rule in your configuration:

```json
{
  "rules": {
    "no-explicit-any": "error"
  }
}
```

This rule is auto-fixable. Run `codeforge fix --rules no-explicit-any` to apply fixes.
