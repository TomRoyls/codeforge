# no-unnecessary-type-assertion

![Fixable](https://img.shields.io/badge/-fixable-green)

| Property | Value |
|----------|-------|
| Category | style |
| Fixable | Yes |
| Recommended | No |
| Deprecated | No |

## Description

Disallow type assertions that are redundant because TypeScript can already infer the same type

## How to Use

Enable this rule in your configuration:

```json
{
  "rules": {
    "no-unnecessary-type-assertion": "error"
  }
}
```

This rule is auto-fixable. Run `codeforge fix --rules no-unnecessary-type-assertion` to apply fixes.
