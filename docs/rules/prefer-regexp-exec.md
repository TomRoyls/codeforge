# prefer-regexp-exec

![Recommended](https://img.shields.io/badge/-recommended-blue) ![Fixable](https://img.shields.io/badge/-fixable-green)

| Property | Value |
|----------|-------|
| Category | style |
| Fixable | Yes |
| Recommended | Yes |
| Deprecated | No |

## Description

Prefer RegExp.exec() or String.matchAll() over String.match() with global flag. Using str.match(/regex/g) can lead to bugs with stateful regex lastIndex, and str.matchAll(regex) or regex.exec(str) in a loop are more explicit.

## How to Use

Enable this rule in your configuration:

```json
{
  "rules": {
    "prefer-regexp-exec": "error"
  }
}
```

This rule is auto-fixable. Run `codeforge fix --rules prefer-regexp-exec` to apply fixes.
