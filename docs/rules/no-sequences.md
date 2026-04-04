# no-sequences

![Recommended](https://img.shields.io/badge/-recommended-blue)

| Property | Value |
|----------|-------|
| Category | style |
| Fixable | No |
| Recommended | Yes |
| Deprecated | No |

## Description

Disallow the use of the comma operator. Sequence expressions using the comma operator can be confusing and lead to subtle bugs.

## How to Use

Enable this rule in your configuration:

```json
{
  "rules": {
    "no-sequences": "error"
  }
}
```

