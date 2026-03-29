# prefer-numeric-literals

![Fixable](https://img.shields.io/badge/-fixable-green)

| Property | Value |
|----------|-------|
| Category | style |
| Fixable | Yes |
| Recommended | No |
| Deprecated | No |

## Description

Prefer numeric literals over parseInt with specific radix values. Use 0b... for binary (radix 2), 0o... for octal (radix 8), or 0x... for hexadecimal (radix 16).

## How to Use

Enable this rule in your configuration:

```json
{
  "rules": {
    "prefer-numeric-literals": "error"
  }
}
```

This rule is auto-fixable. Run `codeforge fix --rules prefer-numeric-literals` to apply fixes.
