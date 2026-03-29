# no-unnecessary-qualifier

![Recommended](https://img.shields.io/badge/-recommended-blue) ![Fixable](https://img.shields.io/badge/-fixable-green)

| Property | Value |
|----------|-------|
| Category | style |
| Fixable | Yes |
| Recommended | Yes |
| Deprecated | No |

## Description

Disallow unnecessary namespace qualifiers. When a member is imported directly, using the qualified form (e.g., A.B) is unnecessary. Use the unqualified name (e.g., B) instead.

## How to Use

Enable this rule in your configuration:

```json
{
  "rules": {
    "no-unnecessary-qualifier": "error"
  }
}
```

This rule is auto-fixable. Run `codeforge fix --rules no-unnecessary-qualifier` to apply fixes.
