# no-loop-func

![Recommended](https://img.shields.io/badge/-recommended-blue)

| Property | Value |
|----------|-------|
| Category | style |
| Fixable | No |
| Recommended | Yes |
| Deprecated | No |

## Description

Disallow function declarations inside loops. Functions created inside loops capture loop variables and can lead to unexpected behavior. Move the function outside the loop or use let/const for the loop variable.

## How to Use

Enable this rule in your configuration:

```json
{
  "rules": {
    "no-loop-func": "error"
  }
}
```

