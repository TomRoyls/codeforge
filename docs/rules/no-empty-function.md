# no-empty-function

![Recommended](https://img.shields.io/badge/-recommended-blue)

| Property | Value |
|----------|-------|
| Category | correctness |
| Fixable | No |
| Recommended | Yes |
| Deprecated | No |

## Description

Disallow empty functions. Empty functions may indicate missing implementation or unintended behavior. Consider adding a comment if the empty body is deliberate.

## How to Use

Enable this rule in your configuration:

```json
{
  "rules": {
    "no-empty-function": "error"
  }
}
```

