# no-deprecated-api

![Recommended](https://img.shields.io/badge/-recommended-blue) ![Fixable](https://img.shields.io/badge/-fixable-green)

| Property | Value |
|----------|-------|
| Category | security |
| Fixable | Yes |
| Recommended | Yes |
| Deprecated | No |

## Description

Disallow the use of deprecated APIs. Using deprecated APIs may cause issues when upgrading runtime environments.

## How to Use

Enable this rule in your configuration:

```json
{
  "rules": {
    "no-deprecated-api": "error"
  }
}
```

This rule is auto-fixable. Run `codeforge fix --rules no-deprecated-api` to apply fixes.
