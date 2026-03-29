# no-unnecessary-template-expression

![Recommended](https://img.shields.io/badge/-recommended-blue) ![Fixable](https://img.shields.io/badge/-fixable-green)

| Property | Value |
|----------|-------|
| Category | style |
| Fixable | Yes |
| Recommended | Yes |
| Deprecated | No |

## Description

Disallow unnecessary template literals. Template literals without expressions or multi-line content should be regular strings for better readability. Use template literals when you need interpolation or multi-line strings.

## How to Use

Enable this rule in your configuration:

```json
{
  "rules": {
    "no-unnecessary-template-expression": "error"
  }
}
```

This rule is auto-fixable. Run `codeforge fix --rules no-unnecessary-template-expression` to apply fixes.
