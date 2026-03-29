# prefer-enum-initializers

| Property | Value |
|----------|-------|
| Category | style |
| Fixable | No |
| Recommended | No |
| Deprecated | No |

## Description

Require all enum members to have explicit values. Explicit values make the code more predictable and prevent accidental value changes when members are added or reordered.

## How to Use

Enable this rule in your configuration:

```json
{
  "rules": {
    "prefer-enum-initializers": "error"
  }
}
```

