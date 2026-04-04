# prefer-promise-reject-errors

![Recommended](https://img.shields.io/badge/-recommended-blue)

| Property | Value |
|----------|-------|
| Category | patterns |
| Fixable | No |
| Recommended | Yes |
| Deprecated | No |

## Description

Prefer using reject() in Promise executors to handle errors properly. Executors with only resolve() may swallow errors.

## How to Use

Enable this rule in your configuration:

```json
{
  "rules": {
    "prefer-promise-reject-errors": "error"
  }
}
```

