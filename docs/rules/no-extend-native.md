# no-extend-native

![Recommended](https://img.shields.io/badge/-recommended-blue)

| Property | Value |
|----------|-------|
| Category | security |
| Fixable | No |
| Recommended | Yes |
| Deprecated | No |

## Description

Disallow extending native objects. Modifying prototypes of built-in objects can cause unexpected behavior and conflicts with other code.

## How to Use

Enable this rule in your configuration:

```json
{
  "rules": {
    "no-extend-native": "error"
  }
}
```

