# prefer-optional-chain

![Recommended](https://img.shields.io/badge/-recommended-blue) ![Fixable](https://img.shields.io/badge/-fixable-green)

| Property | Value |
|----------|-------|
| Category | performance |
| Fixable | Yes |
| Recommended | Yes |
| Deprecated | No |

## Description

Enforce using optional chain operator (?.) instead of chained && checks for property access and method calls. Optional chaining is more concise and readable.

## How to Use

Enable this rule in your configuration:

```json
{
  "rules": {
    "prefer-optional-chain": "error"
  }
}
```

This rule is auto-fixable. Run `codeforge fix --rules prefer-optional-chain` to apply fixes.
