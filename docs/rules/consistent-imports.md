# consistent-imports

![Fixable](https://img.shields.io/badge/-fixable-green)

| Property | Value |
|----------|-------|
| Category | style |
| Fixable | Yes |
| Recommended | No |
| Deprecated | No |

## Description

Enforce consistent import style across the codebase. Choose between default imports, namespace imports, or named imports.

## How to Use

Enable this rule in your configuration:

```json
{
  "rules": {
    "consistent-imports": "error"
  }
}
```

This rule is auto-fixable. Run `codeforge fix --rules consistent-imports` to apply fixes.
