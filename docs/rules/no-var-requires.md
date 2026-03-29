# no-var-requires

![Recommended](https://img.shields.io/badge/-recommended-blue)

| Property | Value |
|----------|-------|
| Category | style |
| Fixable | No |
| Recommended | Yes |
| Deprecated | No |

## Description

Disallow require statements using var. Use ES6 import statements instead for better static analysis and tree shaking.

## How to Use

Enable this rule in your configuration:

```json
{
  "rules": {
    "no-var-requires": "error"
  }
}
```

