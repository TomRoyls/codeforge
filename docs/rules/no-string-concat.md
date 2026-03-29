# no-string-concat

![Recommended](https://img.shields.io/badge/-recommended-blue)

| Property | Value |
|----------|-------|
| Category | style |
| Fixable | No |
| Recommended | Yes |
| Deprecated | No |

## Description

Disallow string concatenation with the + operator. Use template literals or array join() for better readability, especially with multiple strings.

## How to Use

Enable this rule in your configuration:

```json
{
  "rules": {
    "no-string-concat": "error"
  }
}
```

