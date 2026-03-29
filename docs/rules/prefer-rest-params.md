# prefer-rest-params

![Recommended](https://img.shields.io/badge/-recommended-blue) ![Fixable](https://img.shields.io/badge/-fixable-green)

| Property | Value |
|----------|-------|
| Category | style |
| Fixable | Yes |
| Recommended | Yes |
| Deprecated | No |

## Description

Prefer rest parameters (...args) instead of the arguments object. Rest parameters provide better readability and work with arrow functions.

## How to Use

Enable this rule in your configuration:

```json
{
  "rules": {
    "prefer-rest-params": "error"
  }
}
```

This rule is auto-fixable. Run `codeforge fix --rules prefer-rest-params` to apply fixes.
