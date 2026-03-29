# prefer-spread

![Recommended](https://img.shields.io/badge/-recommended-blue) ![Fixable](https://img.shields.io/badge/-fixable-green)

| Property | Value |
|----------|-------|
| Category | style |
| Fixable | Yes |
| Recommended | Yes |
| Deprecated | No |

## Description

Prefer spread syntax over .apply() and .concat(). Use ...args instead of fn.apply(this, args), and [...arr1, ...arr2] instead of arr1.concat(arr2).

## How to Use

Enable this rule in your configuration:

```json
{
  "rules": {
    "prefer-spread": "error"
  }
}
```

This rule is auto-fixable. Run `codeforge fix --rules prefer-spread` to apply fixes.
