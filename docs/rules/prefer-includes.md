# prefer-includes

![Recommended](https://img.shields.io/badge/-recommended-blue)

| Property | Value |
|----------|-------|
| Category | style |
| Fixable | No |
| Recommended | Yes |
| Deprecated | No |

## Description

Prefer .includes() over .indexOf() comparisons for better readability. Use array.includes(x) instead of array.indexOf(x) >= 0.

## How to Use

Enable this rule in your configuration:

```json
{
  "rules": {
    "prefer-includes": "error"
  }
}
```

