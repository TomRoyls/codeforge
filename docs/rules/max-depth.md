# max-depth

![Recommended](https://img.shields.io/badge/-recommended-blue) ![Fixable](https://img.shields.io/badge/-fixable-green)

| Property | Value |
|----------|-------|
| Category | complexity |
| Fixable | Yes |
| Recommended | Yes |
| Deprecated | No |

## Description

Enforce a maximum nesting depth for code blocks

## How to Use

Enable this rule in your configuration:

```json
{
  "rules": {
    "max-depth": "error"
  }
}
```

This rule is auto-fixable. Run `codeforge fix --rules max-depth` to apply fixes.
