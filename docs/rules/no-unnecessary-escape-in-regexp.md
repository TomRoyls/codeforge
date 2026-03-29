# no-unnecessary-escape-in-regexp

![Recommended](https://img.shields.io/badge/-recommended-blue) ![Fixable](https://img.shields.io/badge/-fixable-green)

| Property | Value |
|----------|-------|
| Category | style |
| Fixable | Yes |
| Recommended | Yes |
| Deprecated | No |

## Description

Disallow unnecessary escape characters in regular expressions. Escaping characters that don't need to be escaped makes the pattern harder to read.

## How to Use

Enable this rule in your configuration:

```json
{
  "rules": {
    "no-unnecessary-escape-in-regexp": "error"
  }
}
```

This rule is auto-fixable. Run `codeforge fix --rules no-unnecessary-escape-in-regexp` to apply fixes.
