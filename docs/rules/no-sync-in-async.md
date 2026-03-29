# no-sync-in-async

![Recommended](https://img.shields.io/badge/-recommended-blue) ![Fixable](https://img.shields.io/badge/-fixable-green)

| Property | Value |
|----------|-------|
| Category | performance |
| Fixable | Yes |
| Recommended | Yes |
| Deprecated | No |

## Description

Disallow synchronous operations in async functions for better performance

## How to Use

Enable this rule in your configuration:

```json
{
  "rules": {
    "no-sync-in-async": "error"
  }
}
```

This rule is auto-fixable. Run `codeforge fix --rules no-sync-in-async` to apply fixes.
