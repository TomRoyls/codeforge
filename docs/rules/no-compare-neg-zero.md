# no-compare-neg-zero

![Recommended](https://img.shields.io/badge/-recommended-blue) ![Fixable](https://img.shields.io/badge/-fixable-green)

| Property | Value |
|----------|-------|
| Category | style |
| Fixable | Yes |
| Recommended | Yes |
| Deprecated | No |

## Description

Disallow comparing against -0. The comparison x === -0 (or x == -0) returns true for both 0 and -0 because JavaScript treats them as equal. Use Object.is(x, -0) to distinguish -0 from 0.

## How to Use

Enable this rule in your configuration:

```json
{
  "rules": {
    "no-compare-neg-zero": "error"
  }
}
```

This rule is auto-fixable. Run `codeforge fix --rules no-compare-neg-zero` to apply fixes.
