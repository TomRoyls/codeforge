# no-return-or-await

![Recommended](https://img.shields.io/badge/-recommended-blue)

| Property | Value |
|----------|-------|
| Category | performance |
| Fixable | No |
| Recommended | Yes |
| Deprecated | No |

## Description

Disallow async functions that never use await or return. Async functions should perform asynchronous operations.

## How to Use

Enable this rule in your configuration:

```json
{
  "rules": {
    "no-return-or-await": "error"
  }
}
```

