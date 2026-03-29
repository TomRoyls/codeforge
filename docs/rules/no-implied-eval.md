# no-implied-eval

![Recommended](https://img.shields.io/badge/-recommended-blue)

| Property | Value |
|----------|-------|
| Category | security |
| Fixable | No |
| Recommended | Yes |
| Deprecated | No |

## Description

Disallow implied eval via setTimeout/setInterval/execScript with string arguments. Using strings as the first argument to setTimeout/setInterval/execScript is equivalent to using eval, which poses security risks.

## How to Use

Enable this rule in your configuration:

```json
{
  "rules": {
    "no-implied-eval": "error"
  }
}
```

