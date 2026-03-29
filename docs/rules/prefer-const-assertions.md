# prefer-const-assertions

![Fixable](https://img.shields.io/badge/-fixable-green)

| Property | Value |
|----------|-------|
| Category | style |
| Fixable | Yes |
| Recommended | No |
| Deprecated | No |

## Description

Enforce using const assertions for better type inference on objects and array literals

## How to Use

Enable this rule in your configuration:

```json
{
  "rules": {
    "prefer-const-assertions": "error"
  }
}
```

This rule is auto-fixable. Run `codeforge fix --rules prefer-const-assertions` to apply fixes.
