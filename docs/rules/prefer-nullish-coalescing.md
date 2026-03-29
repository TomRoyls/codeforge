# prefer-nullish-coalescing

![Recommended](https://img.shields.io/badge/-recommended-blue) ![Fixable](https://img.shields.io/badge/-fixable-green)

| Property | Value |
|----------|-------|
| Category | style |
| Fixable | Yes |
| Recommended | Yes |
| Deprecated | No |

## Description

Suggest using the nullish coalescing operator (`??`) instead of `||` for null/undefined checks. The `??` operator only falls through on null/undefined, whereas `||` also falls through on falsy values like 0, '', and false.

## How to Use

Enable this rule in your configuration:

```json
{
  "rules": {
    "prefer-nullish-coalescing": "error"
  }
}
```

This rule is auto-fixable. Run `codeforge fix --rules prefer-nullish-coalescing` to apply fixes.
