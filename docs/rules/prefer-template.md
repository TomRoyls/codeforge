# prefer-template

![Recommended](https://img.shields.io/badge/-recommended-blue) ![Fixable](https://img.shields.io/badge/-fixable-green)

| Property | Value |
|----------|-------|
| Category | style |
| Fixable | Yes |
| Recommended | Yes |
| Deprecated | No |

## Description

Prefer template literals over string concatenation. Use backticks (`Hello ${name}`) instead of + operator ("Hello " + name) for better readability.

## How to Use

Enable this rule in your configuration:

```json
{
  "rules": {
    "prefer-template": "error"
  }
}
```

This rule is auto-fixable. Run `codeforge fix --rules prefer-template` to apply fixes.
