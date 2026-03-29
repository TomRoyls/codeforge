# max-complexity

![Recommended](https://img.shields.io/badge/-recommended-blue) ![Fixable](https://img.shields.io/badge/-fixable-green)

| Property | Value |
|----------|-------|
| Category | complexity |
| Fixable | Yes |
| Recommended | Yes |
| Deprecated | No |

## Description

Enforce a maximum cyclomatic complexity threshold for functions

## How to Use

Enable this rule in your configuration:

```json
{
  "rules": {
    "max-complexity": "error"
  }
}
```

This rule is auto-fixable. Run `codeforge fix --rules max-complexity` to apply fixes.
