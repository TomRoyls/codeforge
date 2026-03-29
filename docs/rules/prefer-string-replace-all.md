# prefer-string-replace-all

| Property | Value |
|----------|-------|
| Category | style |
| Fixable | No |
| Recommended | No |
| Deprecated | No |

## Description

Prefer String.prototype.replaceAll() over .replace() with a global regex. replaceAll() is more readable and explicit about replacing all occurrences.

## How to Use

Enable this rule in your configuration:

```json
{
  "rules": {
    "prefer-string-replace-all": "error"
  }
}
```

