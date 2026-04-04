# no-iterator

![Recommended](https://img.shields.io/badge/-recommended-blue)

| Property | Value |
|----------|-------|
| Category | style |
| Fixable | No |
| Recommended | Yes |
| Deprecated | No |

## Description

Disallow use of __iterator__, __defineIterator__, __defineSetter__, and custom iterator symbol patterns. These are non-standard or deprecated features.

## How to Use

Enable this rule in your configuration:

```json
{
  "rules": {
    "no-iterator": "error"
  }
}
```

