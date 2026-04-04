# no-useless-concat

![Recommended](https://img.shields.io/badge/-recommended-blue)

| Property | Value |
|----------|-------|
| Category | patterns |
| Fixable | No |
| Recommended | Yes |
| Deprecated | No |

## Description

Disallow useless string concatenation with empty strings. Concatenating with an empty string is unnecessary and can be removed.

## How to Use

Enable this rule in your configuration:

```json
{
  "rules": {
    "no-useless-concat": "error"
  }
}
```

