# max-lines-per-function

![Recommended](https://img.shields.io/badge/-recommended-blue) ![Fixable](https://img.shields.io/badge/-fixable-green)

| Property | Value |
|----------|-------|
| Category | complexity |
| Fixable | Yes |
| Recommended | Yes |
| Deprecated | No |

## Description

Enforce a maximum number of lines per function

## How to Use

Enable this rule in your configuration:

```json
{
  "rules": {
    "max-lines-per-function": "error"
  }
}
```

This rule is auto-fixable. Run `codeforge fix --rules max-lines-per-function` to apply fixes.
