# prefer-prototype-methods

![Recommended](https://img.shields.io/badge/-recommended-blue) ![Fixable](https://img.shields.io/badge/-fixable-green)

| Property | Value |
|----------|-------|
| Category | style |
| Fixable | Yes |
| Recommended | Yes |
| Deprecated | No |

## Description

Prefer modern alternatives over prototype method calls. Use spread syntax instead of Array.prototype.slice.call(), and Object.hasOwn() instead of Object.prototype.hasOwnProperty.call().

## How to Use

Enable this rule in your configuration:

```json
{
  "rules": {
    "prefer-prototype-methods": "error"
  }
}
```

This rule is auto-fixable. Run `codeforge fix --rules prefer-prototype-methods` to apply fixes.
