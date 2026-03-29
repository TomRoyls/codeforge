# no-magic-numbers

![Fixable](https://img.shields.io/badge/-fixable-green)

| Property | Value |
|----------|-------|
| Category | style |
| Fixable | Yes |
| Recommended | No |
| Deprecated | No |

## Description

Disallow magic numbers that should be named constants

## How to Use

Enable this rule in your configuration:

```json
{
  "rules": {
    "no-magic-numbers": "error"
  }
}
```

This rule is auto-fixable. Run `codeforge fix --rules no-magic-numbers` to apply fixes.
