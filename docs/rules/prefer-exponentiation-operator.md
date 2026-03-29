# prefer-exponentiation-operator

![Recommended](https://img.shields.io/badge/-recommended-blue) ![Fixable](https://img.shields.io/badge/-fixable-green)

| Property | Value |
|----------|-------|
| Category | style |
| Fixable | Yes |
| Recommended | Yes |
| Deprecated | No |

## Description

Prefer the exponentiation operator (**) over Math.pow() for better readability. The ** operator is more concise and clearer for exponentiation operations.

## How to Use

Enable this rule in your configuration:

```json
{
  "rules": {
    "prefer-exponentiation-operator": "error"
  }
}
```

This rule is auto-fixable. Run `codeforge fix --rules prefer-exponentiation-operator` to apply fixes.
