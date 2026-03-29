# no-duplicate-imports

![Recommended](https://img.shields.io/badge/-recommended-blue) ![Fixable](https://img.shields.io/badge/-fixable-green)

| Property | Value |
|----------|-------|
| Category | style |
| Fixable | Yes |
| Recommended | Yes |
| Deprecated | No |

## Description

Detect duplicate imports from the same module. Multiple imports from the same module should be combined into a single import statement.

## How to Use

Enable this rule in your configuration:

```json
{
  "rules": {
    "no-duplicate-imports": "error"
  }
}
```

This rule is auto-fixable. Run `codeforge fix --rules no-duplicate-imports` to apply fixes.
