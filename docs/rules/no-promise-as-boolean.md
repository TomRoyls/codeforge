# no-promise-as-boolean

![Recommended](https://img.shields.io/badge/-recommended-blue)

| Property | Value |
|----------|-------|
| Category | style |
| Fixable | No |
| Recommended | Yes |
| Deprecated | No |

## Description

Disallow Promises in boolean contexts. Promises are always truthy, so using them in if statements, &&, ||, or ! conditions is almost always a bug. Use await or .then() to resolve the Promise first.

## How to Use

Enable this rule in your configuration:

```json
{
  "rules": {
    "no-promise-as-boolean": "error"
  }
}
```

