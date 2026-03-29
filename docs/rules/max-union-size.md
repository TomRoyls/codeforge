# max-union-size

![Recommended](https://img.shields.io/badge/-recommended-blue)

| Property | Value |
|----------|-------|
| Category | style |
| Fixable | No |
| Recommended | Yes |
| Deprecated | No |

## Description

Enforce a maximum number of types in a union type. Large unions can indicate poor type design and make code harder to understand.

## How to Use

Enable this rule in your configuration:

```json
{
  "rules": {
    "max-union-size": "error"
  }
}
```

