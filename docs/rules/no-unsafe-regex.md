# no-unsafe-regex

![Recommended](https://img.shields.io/badge/-recommended-blue)

| Property | Value |
|----------|-------|
| Category | security |
| Fixable | No |
| Recommended | Yes |
| Deprecated | No |

## Description

Detect potentially unsafe regular expression patterns that can cause ReDoS (catastrophic backtracking), injection vulnerabilities, or security issues.

## How to Use

Enable this rule in your configuration:

```json
{
  "rules": {
    "no-unsafe-regex": "error"
  }
}
```

