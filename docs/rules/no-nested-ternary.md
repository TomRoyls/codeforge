# no-nested-ternary

![Recommended](https://img.shields.io/badge/-recommended-blue) ![Fixable](https://img.shields.io/badge/-fixable-green)

| Property | Value |
|----------|-------|
| Category | style |
| Fixable | Yes |
| Recommended | Yes |
| Deprecated | No |

## Description

Do not nest ternary expressions. Use if-else or switch statements instead.

## How to Use

Enable this rule in your configuration:

```json
{
  "rules": {
    "no-nested-ternary": "error"
  }
}
```

This rule is auto-fixable. Run `codeforge fix --rules no-nested-ternary` to apply fixes.
