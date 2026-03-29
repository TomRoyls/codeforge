# no-eval

![Recommended](https://img.shields.io/badge/-recommended-blue) ![Fixable](https://img.shields.io/badge/-fixable-green)

| Property | Value |
|----------|-------|
| Category | security |
| Fixable | Yes |
| Recommended | Yes |
| Deprecated | No |

## Description

Disallow the use of eval() and similar methods which can execute arbitrary code strings. These functions pose security risks and can lead to code injection vulnerabilities.

## How to Use

Enable this rule in your configuration:

```json
{
  "rules": {
    "no-eval": "error"
  }
}
```

This rule is auto-fixable. Run `codeforge fix --rules no-eval` to apply fixes.
