# no-unsafe-declaration-merging

![Recommended](https://img.shields.io/badge/-recommended-blue)

| Property | Value |
|----------|-------|
| Category | style |
| Fixable | No |
| Recommended | Yes |
| Deprecated | No |

## Description

Disallow unsafe declaration merging between classes, interfaces, and functions. Declaration merging can lead to confusing code and unexpected type behavior.

## How to Use

Enable this rule in your configuration:

```json
{
  "rules": {
    "no-unsafe-declaration-merging": "error"
  }
}
```

