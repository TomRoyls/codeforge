# restrict-template-expressions

![Recommended](https://img.shields.io/badge/-recommended-blue)

| Property | Value |
|----------|-------|
| Category | style |
| Fixable | No |
| Recommended | Yes |
| Deprecated | No |

## Description

Restrict template expressions to specific types. Prevents accidental string coercion of non-string values which can lead to unexpected output.

## How to Use

Enable this rule in your configuration:

```json
{
  "rules": {
    "restrict-template-expressions": "error"
  }
}
```

