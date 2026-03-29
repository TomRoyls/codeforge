# no-void

![Recommended](https://img.shields.io/badge/-recommended-blue) ![Fixable](https://img.shields.io/badge/-fixable-green)

| Property | Value |
|----------|-------|
| Category | style |
| Fixable | Yes |
| Recommended | Yes |
| Deprecated | No |

## Description

Disallow the void operator. The void operator evaluates an expression and returns undefined. It is often confusing and rarely necessary.

## How to Use

Enable this rule in your configuration:

```json
{
  "rules": {
    "no-void": "error"
  }
}
```

This rule is auto-fixable. Run `codeforge fix --rules no-void` to apply fixes.
