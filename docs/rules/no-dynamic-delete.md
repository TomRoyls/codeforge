# no-dynamic-delete

| Property | Value |
|----------|-------|
| Category | security |
| Fixable | No |
| Recommended | No |
| Deprecated | No |

## Description

Disallow dynamic property deletion (delete obj[dynamicKey]). Dynamic deletion can bypass security checks, indicate poor design, and make code harder to analyze. Use static property deletion or Map/Set instead.

## How to Use

Enable this rule in your configuration:

```json
{
  "rules": {
    "no-dynamic-delete": "error"
  }
}
```

