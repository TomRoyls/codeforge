# no-array-destructuring

| Property | Value |
|----------|-------|
| Category | performance |
| Fixable | No |
| Recommended | No |
| Deprecated | No |

## Description

Avoid spread operator on arrays in array literals for better performance with large arrays. Use arr.concat() or arr.slice() instead of [...arr] for copying arrays.

## How to Use

Enable this rule in your configuration:

```json
{
  "rules": {
    "no-array-destructuring": "error"
  }
}
```

