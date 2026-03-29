# no-array-constructor

![Recommended](https://img.shields.io/badge/-recommended-blue) ![Fixable](https://img.shields.io/badge/-fixable-green)

| Property | Value |
|----------|-------|
| Category | style |
| Fixable | Yes |
| Recommended | Yes |
| Deprecated | No |

## Description

Disallow Array constructor. Use array literals [] instead of new Array() for consistency and to avoid confusing behavior with single numeric arguments.

## How to Use

Enable this rule in your configuration:

```json
{
  "rules": {
    "no-array-constructor": "error"
  }
}
```

This rule is auto-fixable. Run `codeforge fix --rules no-array-constructor` to apply fixes.
