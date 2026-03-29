# curly

![Recommended](https://img.shields.io/badge/-recommended-blue) ![Fixable](https://img.shields.io/badge/-fixable-green)

| Property | Value |
|----------|-------|
| Category | style |
| Fixable | Yes |
| Recommended | Yes |
| Deprecated | No |

## Description

Require curly braces for all control statements (if, for, while, do, with) for better code readability and maintainability.

## How to Use

Enable this rule in your configuration:

```json
{
  "rules": {
    "curly": "error"
  }
}
```

This rule is auto-fixable. Run `codeforge fix --rules curly` to apply fixes.
