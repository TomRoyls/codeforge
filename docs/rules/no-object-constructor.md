# no-object-constructor

![Recommended](https://img.shields.io/badge/-recommended-blue) ![Fixable](https://img.shields.io/badge/-fixable-green)

| Property | Value |
|----------|-------|
| Category | style |
| Fixable | Yes |
| Recommended | Yes |
| Deprecated | No |

## Description

Disallow Object constructors. Using new Object() is redundant; use object literals {} instead for better readability and conciseness.

## How to Use

Enable this rule in your configuration:

```json
{
  "rules": {
    "no-object-constructor": "error"
  }
}
```

This rule is auto-fixable. Run `codeforge fix --rules no-object-constructor` to apply fixes.
