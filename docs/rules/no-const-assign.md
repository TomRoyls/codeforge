# no-const-assign

![Recommended](https://img.shields.io/badge/-recommended-blue) ![Fixable](https://img.shields.io/badge/-fixable-green)

| Property | Value |
|----------|-------|
| Category | style |
| Fixable | Yes |
| Recommended | Yes |
| Deprecated | No |

## Description

Report when a const variable is reassigned. Const variables cannot be reassigned after declaration.

## How to Use

Enable this rule in your configuration:

```json
{
  "rules": {
    "no-const-assign": "error"
  }
}
```

This rule is auto-fixable. Run `codeforge fix --rules no-const-assign` to apply fixes.
