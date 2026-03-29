# prefer-object-spread

![Recommended](https://img.shields.io/badge/-recommended-blue) ![Fixable](https://img.shields.io/badge/-fixable-green)

| Property | Value |
|----------|-------|
| Category | performance |
| Fixable | Yes |
| Recommended | Yes |
| Deprecated | No |

## Description

Enforce using object spread syntax ({ ...source }) instead of Object.assign({}, source) for immutable object operations. Object spread is more concise, readable, and provides better type inference in TypeScript.

## How to Use

Enable this rule in your configuration:

```json
{
  "rules": {
    "prefer-object-spread": "error"
  }
}
```

This rule is auto-fixable. Run `codeforge fix --rules prefer-object-spread` to apply fixes.
