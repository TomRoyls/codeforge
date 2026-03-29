# no-simplifiable-pattern

![Recommended](https://img.shields.io/badge/-recommended-blue) ![Fixable](https://img.shields.io/badge/-fixable-green)

| Property | Value |
|----------|-------|
| Category | style |
| Fixable | Yes |
| Recommended | Yes |
| Deprecated | No |

## Description

Disallow ternary expressions that can be simplified to a boolean conversion or negation.

## How to Use

Enable this rule in your configuration:

```json
{
  "rules": {
    "no-simplifiable-pattern": "error"
  }
}
```

This rule is auto-fixable. Run `codeforge fix --rules no-simplifiable-pattern` to apply fixes.
