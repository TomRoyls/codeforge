# no-return-await

![Recommended](https://img.shields.io/badge/-recommended-blue)

| Property | Value |
|----------|-------|
| Category | style |
| Fixable | No |
| Recommended | Yes |
| Deprecated | No |

## Description

Disallow unnecessary return await. In async functions, return await is redundant and slightly slower than returning the Promise directly.

## How to Use

Enable this rule in your configuration:

```json
{
  "rules": {
    "no-return-await": "error"
  }
}
```

