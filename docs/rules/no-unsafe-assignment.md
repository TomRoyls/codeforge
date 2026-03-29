# no-unsafe-assignment

![Recommended](https://img.shields.io/badge/-recommended-blue)

| Property | Value |
|----------|-------|
| Category | style |
| Fixable | No |
| Recommended | Yes |
| Deprecated | No |

## Description

Disallow assigning values with `any` type to variables with specific types. This prevents unsafe type assignments that bypass type safety.

## How to Use

Enable this rule in your configuration:

```json
{
  "rules": {
    "no-unsafe-assignment": "error"
  }
}
```

