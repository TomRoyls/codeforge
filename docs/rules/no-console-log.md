# no-console-log

![Recommended](https://img.shields.io/badge/-recommended-blue) ![Fixable](https://img.shields.io/badge/-fixable-green)

| Property | Value |
|----------|-------|
| Category | style |
| Fixable | Yes |
| Recommended | Yes |
| Deprecated | No |

## Description

Disallow console.log and similar console methods in production code. Use a proper logging library instead.

## How to Use

Enable this rule in your configuration:

```json
{
  "rules": {
    "no-console-log": "error"
  }
}
```

This rule is auto-fixable. Run `codeforge fix --rules no-console-log` to apply fixes.
