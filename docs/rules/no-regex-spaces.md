# no-regex-spaces

![Recommended](https://img.shields.io/badge/-recommended-blue) ![Fixable](https://img.shields.io/badge/-fixable-green)

| Property | Value |
|----------|-------|
| Category | patterns |
| Fixable | Yes |
| Recommended | Yes |
| Deprecated | No |

## Description

Disallow multiple consecutive spaces in regular expressions. Use \s+ or {N} quantifier instead for clarity.

## How to Use

Enable this rule in your configuration:

```json
{
  "rules": {
    "no-regex-spaces": "error"
  }
}
```

This rule is auto-fixable. Run `codeforge fix --rules no-regex-spaces` to apply fixes.
