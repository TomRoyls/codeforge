# no-lonely-if

![Recommended](https://img.shields.io/badge/-recommended-blue) ![Fixable](https://img.shields.io/badge/-fixable-green)

| Property | Value |
|----------|-------|
| Category | style |
| Fixable | Yes |
| Recommended | Yes |
| Deprecated | No |

## Description

Disallow if statements as the only statement in an else block. Use 'else if' instead for better readability.

## How to Use

Enable this rule in your configuration:

```json
{
  "rules": {
    "no-lonely-if": "error"
  }
}
```

This rule is auto-fixable. Run `codeforge fix --rules no-lonely-if` to apply fixes.
