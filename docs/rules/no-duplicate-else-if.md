# no-duplicate-else-if

![Recommended](https://img.shields.io/badge/-recommended-blue)

| Property | Value |
|----------|-------|
| Category | style |
| Fixable | No |
| Recommended | Yes |
| Deprecated | No |

## Description

Disallow duplicate conditions in if-else chains. Duplicate conditions in if-else chains are usually a bug as only the first matching branch will be executed.

## How to Use

Enable this rule in your configuration:

```json
{
  "rules": {
    "no-duplicate-else-if": "error"
  }
}
```

