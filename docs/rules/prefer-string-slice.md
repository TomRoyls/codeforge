# prefer-string-slice

![Recommended](https://img.shields.io/badge/-recommended-blue)

| Property | Value |
|----------|-------|
| Category | style |
| Fixable | No |
| Recommended | Yes |
| Deprecated | No |

## Description

Prefer String.slice() over substring() and substr(). slice() is more consistent and supports negative indices for counting from the end of the string.

## How to Use

Enable this rule in your configuration:

```json
{
  "rules": {
    "prefer-string-slice": "error"
  }
}
```

