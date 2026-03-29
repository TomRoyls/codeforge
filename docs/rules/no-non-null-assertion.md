# no-non-null-assertion

![Recommended](https://img.shields.io/badge/-recommended-blue) ![Fixable](https://img.shields.io/badge/-fixable-green)

| Property | Value |
|----------|-------|
| Category | style |
| Fixable | Yes |
| Recommended | Yes |
| Deprecated | No |

## Description

Disallow the use of non-null assertion operator (!). Using this operator can lead to runtime errors if the value is actually null or undefined.

## How to Use

Enable this rule in your configuration:

```json
{
  "rules": {
    "no-non-null-assertion": "error"
  }
}
```

This rule is auto-fixable. Run `codeforge fix --rules no-non-null-assertion` to apply fixes.
