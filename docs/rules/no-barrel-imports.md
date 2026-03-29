# no-barrel-imports

![Fixable](https://img.shields.io/badge/-fixable-green)

| Property | Value |
|----------|-------|
| Category | style |
| Fixable | Yes |
| Recommended | No |
| Deprecated | No |

## Description

Disallow imports from barrel files (index.ts/index.js). Importing from barrel files can cause performance issues, circular dependencies, and make the dependency graph harder to understand.

## How to Use

Enable this rule in your configuration:

```json
{
  "rules": {
    "no-barrel-imports": "error"
  }
}
```

This rule is auto-fixable. Run `codeforge fix --rules no-barrel-imports` to apply fixes.
