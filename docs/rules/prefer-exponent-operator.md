# prefer-exponent-operator

![Fixable](https://img.shields.io/badge/-fixable-green)

| Property | Value |
|----------|-------|
| Category | style |
| Fixable | Yes |
| Recommended | No |
| Deprecated | No |

## Description

Enforce using the exponent operator (**) instead of Math.pow()

## How to Use

Enable this rule in your configuration:

```json
{
  "rules": {
    "prefer-exponent-operator": "error"
  }
}
```

This rule is auto-fixable. Run `codeforge fix --rules prefer-exponent-operator` to apply fixes.
