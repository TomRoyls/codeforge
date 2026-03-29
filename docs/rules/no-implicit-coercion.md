# no-implicit-coercion

![Recommended](https://img.shields.io/badge/-recommended-blue) ![Fixable](https://img.shields.io/badge/-fixable-green)

| Property | Value |
|----------|-------|
| Category | style |
| Fixable | Yes |
| Recommended | Yes |
| Deprecated | No |

## Description

Disallow implicit type coercion. Use explicit conversion functions like Number(), String(), and Boolean() instead of shorthand patterns like +x, x + "", and !!x for better readability.

## How to Use

Enable this rule in your configuration:

```json
{
  "rules": {
    "no-implicit-coercion": "error"
  }
}
```

This rule is auto-fixable. Run `codeforge fix --rules no-implicit-coercion` to apply fixes.
