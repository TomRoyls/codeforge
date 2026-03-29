# prefer-object-has-own

![Recommended](https://img.shields.io/badge/-recommended-blue)

| Property | Value |
|----------|-------|
| Category | style |
| Fixable | No |
| Recommended | Yes |
| Deprecated | No |

## Description

Prefer Object.hasOwn() over hasOwnProperty() and propertyIsEnumerable() for safer property checking. Use Object.hasOwn(obj, prop) instead of obj.hasOwnProperty(prop) or Object.prototype.hasOwnProperty.call(obj, prop).

## How to Use

Enable this rule in your configuration:

```json
{
  "rules": {
    "prefer-object-has-own": "error"
  }
}
```

