# no-new-wrappers

![Recommended](https://img.shields.io/badge/-recommended-blue)

| Property | Value |
|----------|-------|
| Category | style |
| Fixable | No |
| Recommended | Yes |
| Deprecated | No |

## Description

Disallow new String(), new Number(), new Boolean(), new Symbol(), and new BigInt(). These create object wrappers instead of primitives, which can lead to unexpected behavior.

## How to Use

Enable this rule in your configuration:

```json
{
  "rules": {
    "no-new-wrappers": "error"
  }
}
```

