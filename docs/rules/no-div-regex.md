# no-div-regex

![Recommended](https://img.shields.io/badge/-recommended-blue)

| Property | Value |
|----------|-------|
| Category | style |
| Fixable | No |
| Recommended | Yes |
| Deprecated | No |

## Description

Disallow ambiguous regex notation (= /foo/). The = operator can be confused with division. Use RegExp() or explicit comparison.

## How to Use

Enable this rule in your configuration:

```json
{
  "rules": {
    "no-div-regex": "error"
  }
}
```

