# no-shadow

![Recommended](https://img.shields.io/badge/-recommended-blue)

| Property | Value |
|----------|-------|
| Category | style |
| Fixable | No |
| Recommended | Yes |
| Deprecated | No |

## Description

Disallow variable shadowing. Variable shadowing can lead to confusion and bugs when an outer scope variable becomes inaccessible.

## How to Use

Enable this rule in your configuration:

```json
{
  "rules": {
    "no-shadow": "error"
  }
}
```

