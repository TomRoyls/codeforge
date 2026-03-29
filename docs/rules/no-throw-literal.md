# no-throw-literal

![Recommended](https://img.shields.io/badge/-recommended-blue)

| Property | Value |
|----------|-------|
| Category | correctness |
| Fixable | No |
| Recommended | Yes |
| Deprecated | No |

## Description

Disallow throwing literals as exceptions. Only Error objects should be thrown for proper error handling and stack traces.

## How to Use

Enable this rule in your configuration:

```json
{
  "rules": {
    "no-throw-literal": "error"
  }
}
```

