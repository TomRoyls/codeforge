# prefer-const

![Recommended](https://img.shields.io/badge/-recommended-blue) ![Fixable](https://img.shields.io/badge/-fixable-green)

| Property | Value |
|----------|-------|
| Category | style |
| Fixable | Yes |
| Recommended | Yes |
| Deprecated | No |

## Description

Require const declarations for variables that are never reassigned. Using const makes code more predictable and signals intent more clearly.

## How to Use

Enable this rule in your configuration:

```json
{
  "rules": {
    "prefer-const": "error"
  }
}
```

This rule is auto-fixable. Run `codeforge fix --rules prefer-const` to apply fixes.
