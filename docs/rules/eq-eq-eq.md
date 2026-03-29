# eq-eq-eq

![Recommended](https://img.shields.io/badge/-recommended-blue) ![Fixable](https://img.shields.io/badge/-fixable-green)

| Property | Value |
|----------|-------|
| Category | style |
| Fixable | Yes |
| Recommended | Yes |
| Deprecated | No |

## Description

Require strict equality operators (=== and !==) instead of loose equality operators (== and !=). Loose equality can lead to unexpected type coercion.

## How to Use

Enable this rule in your configuration:

```json
{
  "rules": {
    "eq-eq-eq": "error"
  }
}
```

This rule is auto-fixable. Run `codeforge fix --rules eq-eq-eq` to apply fixes.
