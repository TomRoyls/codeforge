# no-same-side-conditions

![Recommended](https://img.shields.io/badge/-recommended-blue) ![Fixable](https://img.shields.io/badge/-fixable-green)

| Property | Value |
|----------|-------|
| Category | style |
| Fixable | Yes |
| Recommended | Yes |
| Deprecated | No |

## Description

Disallow conditions where both sides of a logical operator are the same. Expressions like `a && a` or `a || a` are redundant.

## How to Use

Enable this rule in your configuration:

```json
{
  "rules": {
    "no-same-side-conditions": "error"
  }
}
```

This rule is auto-fixable. Run `codeforge fix --rules no-same-side-conditions` to apply fixes.
