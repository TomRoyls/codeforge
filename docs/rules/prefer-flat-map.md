# prefer-flat-map

![Fixable](https://img.shields.io/badge/-fixable-green)

| Property | Value |
|----------|-------|
| Category | style |
| Fixable | Yes |
| Recommended | No |
| Deprecated | No |

## Description

Enforce using .flat() instead of .reduce((acc, val) => acc.concat(val), []) for flattening arrays

## How to Use

Enable this rule in your configuration:

```json
{
  "rules": {
    "prefer-flat-map": "error"
  }
}
```

This rule is auto-fixable. Run `codeforge fix --rules prefer-flat-map` to apply fixes.
