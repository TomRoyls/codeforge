# no-async-without-await

![Fixable](https://img.shields.io/badge/-fixable-green)

| Property | Value |
|----------|-------|
| Category | style |
| Fixable | Yes |
| Recommended | No |
| Deprecated | No |

## Description

Disallow async functions that lack await expressions. Async functions without await are usually unnecessary and add overhead.

## How to Use

Enable this rule in your configuration:

```json
{
  "rules": {
    "no-async-without-await": "error"
  }
}
```

This rule is auto-fixable. Run `codeforge fix --rules no-async-without-await` to apply fixes.
