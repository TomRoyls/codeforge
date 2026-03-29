# no-loss-of-precision

![Recommended](https://img.shields.io/badge/-recommended-blue)

| Property | Value |
|----------|-------|
| Category | style |
| Fixable | No |
| Recommended | Yes |
| Deprecated | No |

## Description

Disallow floating-point arithmetic that may lose precision. JavaScript uses IEEE 754 floating-point numbers, which can produce unexpected results (e.g., 0.1 + 0.2 !== 0.3). Consider using integer arithmetic, a precision library, or rounding.

## How to Use

Enable this rule in your configuration:

```json
{
  "rules": {
    "no-loss-of-precision": "error"
  }
}
```

