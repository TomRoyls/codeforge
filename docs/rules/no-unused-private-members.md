# no-unused-private-members

![Recommended](https://img.shields.io/badge/-recommended-blue)

| Property | Value |
|----------|-------|
| Category | style |
| Fixable | No |
| Recommended | Yes |
| Deprecated | No |

## Description

Disallow unused private class members. Private properties and methods that are declared but never used within the class may indicate dead code or incomplete implementation.

## How to Use

Enable this rule in your configuration:

```json
{
  "rules": {
    "no-unused-private-members": "error"
  }
}
```

