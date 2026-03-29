# max-file-size

![Recommended](https://img.shields.io/badge/-recommended-blue)

| Property | Value |
|----------|-------|
| Category | style |
| Fixable | No |
| Recommended | Yes |
| Deprecated | No |

## Description

Enforce a maximum file size. Large files are harder to understand and maintain. Consider splitting large files into smaller, focused modules.

## How to Use

Enable this rule in your configuration:

```json
{
  "rules": {
    "max-file-size": "error"
  }
}
```

