# no-thenable

![Recommended](https://img.shields.io/badge/-recommended-blue)

| Property | Value |
|----------|-------|
| Category | patterns |
| Fixable | No |
| Recommended | Yes |
| Deprecated | No |

## Description

Disallow use of .then() method. Prefer async/await syntax for better readability and error handling.

## How to Use

Enable this rule in your configuration:

```json
{
  "rules": {
    "no-thenable": "error"
  }
}
```

