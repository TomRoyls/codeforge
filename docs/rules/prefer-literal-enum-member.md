# prefer-literal-enum-member

| Property | Value |
|----------|-------|
| Category | style |
| Fixable | No |
| Recommended | No |
| Deprecated | No |

## Description

Require enum members to be literal values. Computed values in enums can lead to unpredictable behavior and reduce type safety.

## How to Use

Enable this rule in your configuration:

```json
{
  "rules": {
    "prefer-literal-enum-member": "error"
  }
}
```

