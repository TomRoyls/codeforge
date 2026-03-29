# no-unused-exports

![Recommended](https://img.shields.io/badge/-recommended-blue) ![Fixable](https://img.shields.io/badge/-fixable-green)

| Property | Value |
|----------|-------|
| Category | style |
| Fixable | Yes |
| Recommended | Yes |
| Deprecated | No |

## Description

Disallow exports that are never imported by other modules. Unused exports indicate dead code or missing documentation.

## How to Use

Enable this rule in your configuration:

```json
{
  "rules": {
    "no-unused-exports": "error"
  }
}
```

This rule is auto-fixable. Run `codeforge fix --rules no-unused-exports` to apply fixes.
