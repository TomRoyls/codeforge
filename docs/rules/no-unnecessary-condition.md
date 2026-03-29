# no-unnecessary-condition

![Recommended](https://img.shields.io/badge/-recommended-blue)

| Property | Value |
|----------|-------|
| Category | style |
| Fixable | No |
| Recommended | Yes |
| Deprecated | No |

## Description

Disallow conditions that are always truthy or always falsy. These conditions are unnecessary and likely indicate a mistake.

## How to Use

Enable this rule in your configuration:

```json
{
  "rules": {
    "no-unnecessary-condition": "error"
  }
}
```

