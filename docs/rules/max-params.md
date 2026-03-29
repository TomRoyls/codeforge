# max-params

![Recommended](https://img.shields.io/badge/-recommended-blue) ![Fixable](https://img.shields.io/badge/-fixable-green)

| Property | Value |
|----------|-------|
| Category | complexity |
| Fixable | Yes |
| Recommended | Yes |
| Deprecated | No |

## Description

Enforce a maximum number of parameters in function definitions

## How to Use

Enable this rule in your configuration:

```json
{
  "rules": {
    "max-params": "error"
  }
}
```

This rule is auto-fixable. Run `codeforge fix --rules max-params` to apply fixes.
