# prefer-regex-literals

![Recommended](https://img.shields.io/badge/-recommended-blue)

| Property | Value |
|----------|-------|
| Category | style |
| Fixable | No |
| Recommended | Yes |
| Deprecated | No |

## Description

Prefer regex literals over RegExp constructor. Regex literals are more readable and performant. Only use new RegExp() when the pattern is dynamic.

## How to Use

Enable this rule in your configuration:

```json
{
  "rules": {
    "prefer-regex-literals": "error"
  }
}
```

