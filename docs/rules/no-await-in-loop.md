# no-await-in-loop

![Recommended](https://img.shields.io/badge/-recommended-blue) ![Fixable](https://img.shields.io/badge/-fixable-green)

| Property | Value |
|----------|-------|
| Category | performance |
| Fixable | Yes |
| Recommended | Yes |
| Deprecated | No |

## Description

Disallow await inside of loops for better performance

## How to Use

Enable this rule in your configuration:

```json
{
  "rules": {
    "no-await-in-loop": "error"
  }
}
```

This rule is auto-fixable. Run `codeforge fix --rules no-await-in-loop` to apply fixes.
