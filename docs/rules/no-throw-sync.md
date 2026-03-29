# no-throw-sync

![Recommended](https://img.shields.io/badge/-recommended-blue)

| Property | Value |
|----------|-------|
| Category | style |
| Fixable | No |
| Recommended | Yes |
| Deprecated | No |

## Description

Disallow throwing synchronous errors in async functions. Use Promise.reject() or return a rejected Promise for consistent async error handling.

## How to Use

Enable this rule in your configuration:

```json
{
  "rules": {
    "no-throw-sync": "error"
  }
}
```

