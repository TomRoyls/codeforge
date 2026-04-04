# no-unsafe-member-access

![Recommended](https://img.shields.io/badge/-recommended-blue)

| Property | Value |
|----------|-------|
| Category | security |
| Fixable | No |
| Recommended | Yes |
| Deprecated | No |

## Description

Disallow unsafe member access on values that are explicitly cast as any.

## How to Use

Enable this rule in your configuration:

```json
{
  "rules": {
    "no-unsafe-member-access": "error"
  }
}
```

