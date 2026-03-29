# prefer-function-type

![Fixable](https://img.shields.io/badge/-fixable-green)

| Property | Value |
|----------|-------|
| Category | style |
| Fixable | Yes |
| Recommended | No |
| Deprecated | No |

## Description

Prefer function type over interface with a single call signature. Function types are more concise and idiomatic for callable types.

## How to Use

Enable this rule in your configuration:

```json
{
  "rules": {
    "prefer-function-type": "error"
  }
}
```

This rule is auto-fixable. Run `codeforge fix --rules prefer-function-type` to apply fixes.
