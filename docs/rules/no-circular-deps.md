# no-circular-deps

![Recommended](https://img.shields.io/badge/-recommended-blue) ![Fixable](https://img.shields.io/badge/-fixable-green)

| Property | Value |
|----------|-------|
| Category | style |
| Fixable | Yes |
| Recommended | Yes |
| Deprecated | No |

## Description

Disallow circular dependencies between modules. Circular dependencies can lead to runtime issues, make code harder to understand, and can cause problems with bundlers and tree-shaking.

## How to Use

Enable this rule in your configuration:

```json
{
  "rules": {
    "no-circular-deps": "error"
  }
}
```

This rule is auto-fixable. Run `codeforge fix --rules no-circular-deps` to apply fixes.
