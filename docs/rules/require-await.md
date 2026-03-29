# require-await

![Recommended](https://img.shields.io/badge/-recommended-blue) ![Fixable](https://img.shields.io/badge/-fixable-green)

| Property | Value |
|----------|-------|
| Category | style |
| Fixable | Yes |
| Recommended | Yes |
| Deprecated | No |

## Description

Require async functions to contain await expressions. An async function without await is usually a mistake or unnecessary async overhead.

## How to Use

Enable this rule in your configuration:

```json
{
  "rules": {
    "require-await": "error"
  }
}
```

This rule is auto-fixable. Run `codeforge fix --rules require-await` to apply fixes.
