# no-bitwise

![Recommended](https://img.shields.io/badge/-recommended-blue)

| Property | Value |
|----------|-------|
| Category | style |
| Fixable | No |
| Recommended | Yes |
| Deprecated | No |

## Description

Disallow bitwise operators (&, |, ^, ~, >>>, etc.). Bitwise operators are often mistaken for logical operators (& vs &&, | vs ||) and can indicate typos.

## How to Use

Enable this rule in your configuration:

```json
{
  "rules": {
    "no-bitwise": "error"
  }
}
```

