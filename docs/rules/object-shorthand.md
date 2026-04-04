# object-shorthand

![Recommended](https://img.shields.io/badge/-recommended-blue)

| Property | Value |
|----------|-------|
| Category | style |
| Fixable | No |
| Recommended | Yes |
| Deprecated | No |

## Description

Require object literal shorthand for methods. Instead of { method: function() {} }, use { method() { } } for cleaner, more concise code.

## How to Use

Enable this rule in your configuration:

```json
{
  "rules": {
    "object-shorthand": "error"
  }
}
```

