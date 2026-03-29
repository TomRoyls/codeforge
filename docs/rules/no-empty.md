# no-empty

![Recommended](https://img.shields.io/badge/-recommended-blue) ![Fixable](https://img.shields.io/badge/-fixable-green)

| Property | Value |
|----------|-------|
| Category | style |
| Fixable | Yes |
| Recommended | Yes |
| Deprecated | No |

## Description

Disallow empty block statements. Empty blocks can be confusing and along indicate incomplete code.

## How to Use

Enable this rule in your configuration:

```json
{
  "rules": {
    "no-empty": "error"
  }
}
```

This rule is auto-fixable. Run `codeforge fix --rules no-empty` to apply fixes.
