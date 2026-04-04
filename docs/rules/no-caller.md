# no-caller

![Recommended](https://img.shields.io/badge/-recommended-blue)

| Property | Value |
|----------|-------|
| Category | security |
| Fixable | No |
| Recommended | Yes |
| Deprecated | No |

## Description

Disallow the use of arguments.caller and arguments.callee. These are non-standard, deprecated, and pose security risks by exposing call stacks.

## How to Use

Enable this rule in your configuration:

```json
{
  "rules": {
    "no-caller": "error"
  }
}
```

