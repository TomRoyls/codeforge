# no-else-return

![Recommended](https://img.shields.io/badge/-recommended-blue) ![Fixable](https://img.shields.io/badge/-fixable-green)

| Property | Value |
|----------|-------|
| Category | style |
| Fixable | Yes |
| Recommended | Yes |
| Deprecated | No |

## Description

Disallow unnecessary else blocks after return statements. If a block contains a return, the else block can be removed and its body unindented.

## How to Use

Enable this rule in your configuration:

```json
{
  "rules": {
    "no-else-return": "error"
  }
}
```

This rule is auto-fixable. Run `codeforge fix --rules no-else-return` to apply fixes.
