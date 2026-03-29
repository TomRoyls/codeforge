# prefer-ternary-operator

![Fixable](https://img.shields.io/badge/-fixable-green)

| Property | Value |
|----------|-------|
| Category | style |
| Fixable | Yes |
| Recommended | No |
| Deprecated | No |

## Description

Suggest using ternary operator instead of verbose if-else for simple assignments. Using ternary operator makes the code more concise and readable for simple conditional assignments.

## How to Use

Enable this rule in your configuration:

```json
{
  "rules": {
    "prefer-ternary-operator": "error"
  }
}
```

This rule is auto-fixable. Run `codeforge fix --rules prefer-ternary-operator` to apply fixes.
