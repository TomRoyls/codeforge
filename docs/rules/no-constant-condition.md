# no-constant-condition

![Recommended](https://img.shields.io/badge/-recommended-blue) ![Fixable](https://img.shields.io/badge/-fixable-green)

| Property | Value |
|----------|-------|
| Category | style |
| Fixable | Yes |
| Recommended | Yes |
| Deprecated | No |

## Description

Disallow constant conditions in control flow statements. Conditions that always evaluate to the same value are likely mistakes.

## How to Use

Enable this rule in your configuration:

```json
{
  "rules": {
    "no-constant-condition": "error"
  }
}
```

This rule is auto-fixable. Run `codeforge fix --rules no-constant-condition` to apply fixes.
