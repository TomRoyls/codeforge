# prefer-number-properties

![Recommended](https://img.shields.io/badge/-recommended-blue)

| Property | Value |
|----------|-------|
| Category | style |
| Fixable | No |
| Recommended | Yes |
| Deprecated | No |

## Description

Prefer Number.isNaN() and Number.isFinite() over isNaN(), isFinite(), and direct NaN/Infinity comparisons. The global isNaN() coerces values, while Number.isNaN() does not. Direct comparisons with NaN always return false.

## How to Use

Enable this rule in your configuration:

```json
{
  "rules": {
    "prefer-number-properties": "error"
  }
}
```

