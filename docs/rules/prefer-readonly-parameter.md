# prefer-readonly-parameter

![Fixable](https://img.shields.io/badge/-fixable-green)

| Property | Value |
|----------|-------|
| Category | style |
| Fixable | Yes |
| Recommended | No |
| Deprecated | No |

## Description

Suggest using readonly for array/object parameters that are not modified within the function.

## How to Use

Enable this rule in your configuration:

```json
{
  "rules": {
    "prefer-readonly-parameter": "error"
  }
}
```

This rule is auto-fixable. Run `codeforge fix --rules prefer-readonly-parameter` to apply fixes.
