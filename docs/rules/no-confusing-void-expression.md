# no-confusing-void-expression

![Recommended](https://img.shields.io/badge/-recommended-blue)

| Property | Value |
|----------|-------|
| Category | style |
| Fixable | No |
| Recommended | Yes |
| Deprecated | No |

## Description

Disallow void expressions used in confusing ways. Void expressions always evaluate to undefined, which can be confusing when used in return statements, template literals, or arithmetic operations.

## How to Use

Enable this rule in your configuration:

```json
{
  "rules": {
    "no-confusing-void-expression": "error"
  }
}
```

