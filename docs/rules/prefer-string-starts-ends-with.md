# prefer-string-starts-ends-with

![Recommended](https://img.shields.io/badge/-recommended-blue) ![Fixable](https://img.shields.io/badge/-fixable-green)

| Property | Value |
|----------|-------|
| Category | style |
| Fixable | Yes |
| Recommended | Yes |
| Deprecated | No |

## Description

Prefer String.startsWith() and String.endsWith() over regex or indexOf patterns for better readability.

## How to Use

Enable this rule in your configuration:

```json
{
  "rules": {
    "prefer-string-starts-ends-with": "error"
  }
}
```

This rule is auto-fixable. Run `codeforge fix --rules prefer-string-starts-ends-with` to apply fixes.
