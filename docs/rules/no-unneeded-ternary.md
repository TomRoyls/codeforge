# no-unneeded-ternary

![Recommended](https://img.shields.io/badge/-recommended-blue)

| Property | Value |
|----------|-------|
| Category | style |
| Fixable | No |
| Recommended | Yes |
| Deprecated | No |

## Description

Disallow ternary expressions that can be simplified. Ternary expressions like `x ? true : false` should use `!!x` or `Boolean(x)`, and `x ? false : true` should use `!x`. Identical branches should be simplified.

## How to Use

Enable this rule in your configuration:

```json
{
  "rules": {
    "no-unneeded-ternary": "error"
  }
}
```

