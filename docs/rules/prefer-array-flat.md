# prefer-array-flat

![Recommended](https://img.shields.io/badge/-recommended-blue) ![Fixable](https://img.shields.io/badge/-fixable-green)

| Property | Value |
|----------|-------|
| Category | style |
| Fixable | Yes |
| Recommended | Yes |
| Deprecated | No |

## Description

Prefer Array.flat() over manual flattening patterns. Use arr.flat() instead of reduce with concat or nested for loops.

## How to Use

Enable this rule in your configuration:

```json
{
  "rules": {
    "prefer-array-flat": "error"
  }
}
```

This rule is auto-fixable. Run `codeforge fix --rules prefer-array-flat` to apply fixes.
