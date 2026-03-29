# no-unnecessary-slice

![Recommended](https://img.shields.io/badge/-recommended-blue) ![Fixable](https://img.shields.io/badge/-fixable-green)

| Property | Value |
|----------|-------|
| Category | style |
| Fixable | Yes |
| Recommended | Yes |
| Deprecated | No |

## Description

Disallow unnecessary array.slice() calls. Calling .slice(0), .slice(undefined), or .slice() without arguments creates unnecessary overhead. Remove the slice call or use spread syntax if a shallow copy is needed.

## How to Use

Enable this rule in your configuration:

```json
{
  "rules": {
    "no-unnecessary-slice": "error"
  }
}
```

This rule is auto-fixable. Run `codeforge fix --rules no-unnecessary-slice` to apply fixes.
