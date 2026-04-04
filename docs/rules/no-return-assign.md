# no-return-assign

![Recommended](https://img.shields.io/badge/-recommended-blue)

| Property | Value |
|----------|-------|
| Category | style |
| Fixable | No |
| Recommended | Yes |
| Deprecated | No |

## Description

Disallow assignment operators in return statements. Return statements like `return a = b` are confusing - did you mean to assign or compare? Always assign before returning.

## How to Use

Enable this rule in your configuration:

```json
{
  "rules": {
    "no-return-assign": "error"
  }
}
```

