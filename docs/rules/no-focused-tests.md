# no-focused-tests

![Recommended](https://img.shields.io/badge/-recommended-blue)

| Property | Value |
|----------|-------|
| Category | style |
| Fixable | No |
| Recommended | Yes |
| Deprecated | No |

## Description

Detect focused tests (.only() calls) that can mask failures in CI by running only a subset of tests

## How to Use

Enable this rule in your configuration:

```json
{
  "rules": {
    "no-focused-tests": "error"
  }
}
```

