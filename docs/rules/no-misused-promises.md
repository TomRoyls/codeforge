# no-misused-promises

![Recommended](https://img.shields.io/badge/-recommended-blue)

| Property | Value |
|----------|-------|
| Category | style |
| Fixable | No |
| Recommended | Yes |
| Deprecated | No |

## Description

Disallow Promises in places not designed to handle them, such as async callbacks passed to non-Promise-aware methods and await in non-async functions.

## How to Use

Enable this rule in your configuration:

```json
{
  "rules": {
    "no-misused-promises": "error"
  }
}
```

