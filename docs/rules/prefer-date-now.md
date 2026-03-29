# prefer-date-now

![Recommended](https://img.shields.io/badge/-recommended-blue) ![Fixable](https://img.shields.io/badge/-fixable-green)

| Property | Value |
|----------|-------|
| Category | style |
| Fixable | Yes |
| Recommended | Yes |
| Deprecated | No |

## Description

Prefer Date.now() over new Date().getTime(). Date.now() is more concise and avoids creating an unnecessary Date object.

## How to Use

Enable this rule in your configuration:

```json
{
  "rules": {
    "prefer-date-now": "error"
  }
}
```

This rule is auto-fixable. Run `codeforge fix --rules prefer-date-now` to apply fixes.
