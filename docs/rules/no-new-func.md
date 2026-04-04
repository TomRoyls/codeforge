# no-new-func

![Recommended](https://img.shields.io/badge/-recommended-blue)

| Property | Value |
|----------|-------|
| Category | security |
| Fixable | No |
| Recommended | Yes |
| Deprecated | No |

## Description

Disallow new Function() and Function() calls. Creating functions at runtime from strings is a security risk similar to eval().

## How to Use

Enable this rule in your configuration:

```json
{
  "rules": {
    "no-new-func": "error"
  }
}
```

