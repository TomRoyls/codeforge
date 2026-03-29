# no-unnecessary-string-concat

![Recommended](https://img.shields.io/badge/-recommended-blue) ![Fixable](https://img.shields.io/badge/-fixable-green)

| Property | Value |
|----------|-------|
| Category | style |
| Fixable | Yes |
| Recommended | Yes |
| Deprecated | No |

## Description

Disallow unnecessary string concatenation with empty strings. Using "".concat(str) or str.concat("") is redundant and should be simplified to just str.

## How to Use

Enable this rule in your configuration:

```json
{
  "rules": {
    "no-unnecessary-string-concat": "error"
  }
}
```

This rule is auto-fixable. Run `codeforge fix --rules no-unnecessary-string-concat` to apply fixes.
