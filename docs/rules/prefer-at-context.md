# prefer-at-context

![Recommended](https://img.shields.io/badge/-recommended-blue) ![Fixable](https://img.shields.io/badge/-fixable-green)

| Property | Value |
|----------|-------|
| Category | style |
| Fixable | Yes |
| Recommended | Yes |
| Deprecated | No |

## Description

Prefer arrow functions over .bind(this) for preserving context. Arrow functions automatically capture `this` from the enclosing scope, making the code cleaner and more readable.

## How to Use

Enable this rule in your configuration:

```json
{
  "rules": {
    "prefer-at-context": "error"
  }
}
```

This rule is auto-fixable. Run `codeforge fix --rules prefer-at-context` to apply fixes.
