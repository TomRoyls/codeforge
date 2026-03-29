# prefer-at-method

![Recommended](https://img.shields.io/badge/-recommended-blue) ![Fixable](https://img.shields.io/badge/-fixable-green)

| Property | Value |
|----------|-------|
| Category | style |
| Fixable | Yes |
| Recommended | Yes |
| Deprecated | No |

## Description

Prefer .at() method for negative indexing. Use arr.at(-1) instead of arr[arr.length - 1] for better readability.

## How to Use

Enable this rule in your configuration:

```json
{
  "rules": {
    "prefer-at-method": "error"
  }
}
```

This rule is auto-fixable. Run `codeforge fix --rules prefer-at-method` to apply fixes.
