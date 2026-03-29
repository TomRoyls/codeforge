# no-multi-spaces

![Fixable](https://img.shields.io/badge/-fixable-green)

| Property | Value |
|----------|-------|
| Category | style |
| Fixable | Yes |
| Recommended | No |
| Deprecated | No |

## Description

Disallow multiple spaces except for indentation. Multiple spaces can be confusing and may indicate errors.

## How to Use

Enable this rule in your configuration:

```json
{
  "rules": {
    "no-multi-spaces": "error"
  }
}
```

This rule is auto-fixable. Run `codeforge fix --rules no-multi-spaces` to apply fixes.
