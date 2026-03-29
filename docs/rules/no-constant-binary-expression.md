# no-constant-binary-expression

![Recommended](https://img.shields.io/badge/-recommended-blue)

| Property | Value |
|----------|-------|
| Category | correctness |
| Fixable | No |
| Recommended | Yes |
| Deprecated | No |

## Description

Disallow comparisons with constant binary values (true/false, 0/1). These are likely mistakes where a variable was intended, the boolean literal. Use the variable directly or fix the comparison.

## How to Use

Enable this rule in your configuration:

```json
{
  "rules": {
    "no-constant-binary-expression": "error"
  }
}
```

