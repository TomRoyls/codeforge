# no-floating-promises

![Recommended](https://img.shields.io/badge/-recommended-blue)

| Property | Value |
|----------|-------|
| Category | style |
| Fixable | No |
| Recommended | Yes |
| Deprecated | No |

## Description

Require Promise-like statements to be handled appropriately. Floating Promises can cause unhandled rejections and race conditions.

## How to Use

Enable this rule in your configuration:

```json
{
  "rules": {
    "no-floating-promises": "error"
  }
}
```

