# no-useless-fallback-in-spread

![Recommended](https://img.shields.io/badge/-recommended-blue) ![Fixable](https://img.shields.io/badge/-fixable-green)

| Property | Value |
|----------|-------|
| Category | style |
| Fixable | Yes |
| Recommended | Yes |
| Deprecated | No |

## Description

Detect useless fallbacks in spread patterns. Spreading undefined/null is safe and adds no properties, so `{ ...obj || {} }` is redundant and can be simplified to `{ ...obj }`.

## How to Use

Enable this rule in your configuration:

```json
{
  "rules": {
    "no-useless-fallback-in-spread": "error"
  }
}
```

This rule is auto-fixable. Run `codeforge fix --rules no-useless-fallback-in-spread` to apply fixes.
