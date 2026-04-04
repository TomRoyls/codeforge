# prefer-for-of

![Fixable](https://img.shields.io/badge/-fixable-green)

| Property | Value |
|----------|-------|
| Category | style |
| Fixable | Yes |
| Recommended | No |
| Deprecated | No |

## Description

Prefer for-of loop over for loop with index when only iterating values

## How to Use

Enable this rule in your configuration:

```json
{
  "rules": {
    "prefer-for-of": "error"
  }
}
```

This rule is auto-fixable. Run `codeforge fix --rules prefer-for-of` to apply fixes.
