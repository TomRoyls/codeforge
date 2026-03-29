# no-async-promise-executor

![Recommended](https://img.shields.io/badge/-recommended-blue) ![Fixable](https://img.shields.io/badge/-fixable-green)

| Property | Value |
|----------|-------|
| Category | style |
| Fixable | Yes |
| Recommended | Yes |
| Deprecated | No |

## Description

Disallow async functions as Promise executors. Async functions already return Promises, so wrapping them in new Promise() is redundant and can cause unhandled rejections.

## How to Use

Enable this rule in your configuration:

```json
{
  "rules": {
    "no-async-promise-executor": "error"
  }
}
```

This rule is auto-fixable. Run `codeforge fix --rules no-async-promise-executor` to apply fixes.
