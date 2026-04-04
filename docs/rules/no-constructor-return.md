# no-constructor-return

![Recommended](https://img.shields.io/badge/-recommended-blue)

| Property | Value |
|----------|-------|
| Category | patterns |
| Fixable | No |
| Recommended | Yes |
| Deprecated | No |

## Description

Disallow returning values from constructors. Constructors should only initialize the object, not return values.

## How to Use

Enable this rule in your configuration:

```json
{
  "rules": {
    "no-constructor-return": "error"
  }
}
```

