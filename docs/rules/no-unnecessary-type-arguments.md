# no-unnecessary-type-arguments

![Recommended](https://img.shields.io/badge/-recommended-blue)

| Property | Value |
|----------|-------|
| Category | style |
| Fixable | No |
| Recommended | Yes |
| Deprecated | No |

## Description

Disallow explicit type arguments that can be inferred by TypeScript. Explicit type arguments are unnecessary when TypeScript can infer them from the context.

## How to Use

Enable this rule in your configuration:

```json
{
  "rules": {
    "no-unnecessary-type-arguments": "error"
  }
}
```

