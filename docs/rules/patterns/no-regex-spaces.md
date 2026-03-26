# no-regex-spaces

![Recommended](https://img.shields.io/badge/-recommended-blue)

| Property    | Value    |
| ----------- | -------- |
| Category    | patterns |
| Fixable     | No       |
| Recommended | Yes      |
| Deprecated  | No       |

## Description

Disallow literal space characters in regular expressions. Literal spaces in regex patterns can be confusing and often indicate intent to match any whitespace, not just actual space characters. Using `\s` or explicit quantifiers makes the pattern clearer and more maintainable.

## Why This Rule Matters

Using literal spaces in regex patterns is problematic because:

- **Ambiguous intent**: A single space could mean "match a space" or "match any whitespace" (developer confusion)
- **Invisible character**: Spaces in regex patterns are hard to see and easy to miss in code reviews
- **Maintenance issues**: Other developers may not realize the space is intentional
- **Pattern brittleness**: Literal spaces only match space characters (U+0020), not tabs, newlines, or other whitespace
- **Code readability**: `\s` or `[ ]` is more explicit about the matching intent

### Common Confusions

```javascript
// CONFUSION: Is this intentional or a typo?
const pattern = /hello world/

// INTENDED: Match any whitespace between words
const pattern = /hello\s+world/

// CONFUSION: Hard to see the space here
const pattern = /regex pattern/
```

## Regex Patterns Detected

This rule detects the following patterns:

- Literal space characters (` `) in regex patterns
- Spaces in character classes without explicit documentation
- Multiple consecutive spaces (potential tab-to-space conversion issues)
- Spaces at the beginning or end of patterns (trailing/leading whitespace)

## Configuration Options

```json
{
  "rules": {
    "no-regex-spaces": [
      "error",
      {
        "allowSingle": false,
        "allowInCharacterClass": false
      }
    ]
  }
}
```

| Option                  | Type      | Default | Description                                                                     |
| ----------------------- | --------- | ------- | ------------------------------------------------------------------------------- |
| `allowSingle`           | `boolean` | `false` | Allow single space characters (useful when you truly want to match only spaces) |
| `allowInCharacterClass` | `boolean` | `false` | Allow spaces in character classes (e.g., `[ a-z]`)                              |

### allowSingle Option Usage

The `allowSingle` option permits explicit single space characters when you truly only want to match space characters and not other whitespace.

```json
{
  "rules": {
    "no-regex-spaces": [
      "error",
      {
        "allowSingle": true
      }
    ]
  }
}
```

### allowInCharacterClass Option Usage

The `allowInCharacterClass` option allows spaces within character classes, which is sometimes done for readability.

```json
{
  "rules": {
    "no-regex-spaces": [
      "error",
      {
        "allowInCharacterClass": true
      }
    ]
  }
}
```

With this configuration, patterns like `[a-z ]` (lowercase letters or space) are allowed.

## When to Use This Rule

**Use this rule when:**

- You want to catch ambiguous whitespace matching in regex patterns
- Your team prefers explicit regex patterns with `\s` or character classes
- You want to prevent bugs from confusing literal spaces with `\s`
- You're working in a codebase where readability is a priority

**Consider disabling when:**

- Your codebase has many regex patterns intentionally matching only space characters
- You're maintaining legacy code with existing literal space patterns
- You're implementing parsers that require exact space matching

## Code Examples

### ❌ Incorrect - Using Literal Spaces

```typescript
// AMBIGUOUS: Single space - does it mean space or whitespace?
const pattern = /hello world/

// AMBIGUOUS: Multiple spaces - hard to see how many
const pattern = /name:  value/

// INVISIBLE: Space at end - easy to miss
const pattern = /prefix /

// INVISIBLE: Space at beginning - hard to notice
const pattern = / suffix/

// CONFUSING: Space in character class - is it intentional?
const pattern = /[a-z ]/
```

```typescript
// Hard to maintain: Multiple spaces with unclear intent
const pattern = /key  =  value/

// Trailing spaces can cause unexpected matches
const pattern = /test pattern  /

// Leading spaces can cause issues in multiline matching
const pattern = /^  indented/
```

### ✅ Correct - Using Whitespace Classes

```typescript
// EXPLICIT: Match any whitespace (space, tab, newline)
const pattern = /hello\s+world/

// EXPLICIT: Match exactly one space character
const pattern = /hello[ ]world/

// EXPLICIT: Match multiple spaces with quantifier
const pattern = /name:\s{2}value/

// EXPLICIT: Match space or tab
const pattern = /[ \t]/

// EXPLICIT: Match only space characters (when truly needed)
const pattern = /hello\x20world/
```

```typescript
// Clear intent with quantifiers
const pattern = /key\s*=\s*value/

// Use character class for specific whitespace
const pattern = /[\r\n]+/

// Explicit space matching with escape
const pattern = /prefix[ ]*/

// Avoid trailing/leading spaces with anchors
const pattern = /^test pattern$/
```

### ✅ Correct - Legitimate Space Usage

```json
// Configuration:
{
  "rules": {
    "no-regex-spaces": [
      "error",
      {
        "allowSingle": true,
        "allowInCharacterClass": true
      }
    ]
  }
}
```

```typescript
// When you truly only want to match space characters (not tabs/newlines)
function parseKeyValuePair(line: string): { key: string; value: string } | null {
  const match = line.match(/^(\w+)[ ]+([^\n]+)$/)
  if (match) {
    return { key: match[1], value: match[2] }
  }
  return null
}

// Space in character class for specific allowed characters
const allowedChars = /[a-zA-Z0-9 ]/

// Multiple spaces for specific formatting
const indentedLinePattern = /^  .*$/
```

```typescript
// Date formatting requiring spaces (not other whitespace)
const datePattern = /^\d{4} \d{2} \d{2}$/ // YYYY MM DD

// CSV pattern with space separator
const csvPattern = /^(\w+)(, (\w+))*$/

// Fixed-width column parsing
const columnPattern = /^.{10} .{10} .{10}$/
```

## How to Fix Violations

### 1. Replace Single Space with \s for Any Whitespace

```diff
- const pattern = /hello world/
+ const pattern = /hello\s+world/
```

### 2. Use Explicit Space Character Class

```diff
- const pattern = /hello world/
+ const pattern = /hello[ ]+world/
```

### 3. Replace Multiple Spaces with Quantifier

```diff
- const pattern = /key  =  value/
+ const pattern = /key\s*=\s*value/
```

### 4. Use Explicit Whescape Sequence for Space

```diff
- const pattern = /hello world/
+ const pattern = /hello\x20world/
```

### 5. Remove Trailing/Leading Spaces

```diff
- const pattern = /prefix /
+ const pattern = /prefix/

- const pattern = / suffix/
+ const pattern = /suffix/
```

### 6. Use Character Class for Specific Whitespace

```diff
- const pattern = /line1\nline2/ // if space meant tab
+ const pattern = /line1[\n\t]line2/
```

### 7. Document Intentional Space Usage

```diff
- const pattern = /key  value/
+ const pattern = /key  value/ // Intentional double space between key and value
```

## Best Practices

### When Literal Spaces Are Acceptable

Literal spaces are acceptable in these scenarios:

1. **Fixed-width formats**: Parsing data with exact spacing requirements
2. **Legacy data formats**: Maintaining compatibility with existing systems
3. **Specific character requirements**: When you truly only want space characters
4. **Visual formatting**: Patterns that mirror specific text formatting

Always document why literal spaces are necessary:

```typescript
/**
 * Parse fixed-width log format.
 * Uses literal spaces because log format requires exact spacing
 * between timestamp, level, and message components.
 * Format: "YYYY-MM-DD HH:MM:SS LEVEL Message"
 */
const logPattern = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2} \w{4,5} .*$/
```

### Prefer Explicit Whitespace Classes

Instead of ambiguous spaces, consider:

```typescript
// Instead of ambiguous single space:
- const pattern = /name value/

// Use whitespace class for flexibility:
+ const pattern = /name\s+value/

// Or be explicit about space only:
+ const pattern = /name[ ]+value/
```

### Use Escape Sequences for Clarity

```typescript
// Instead of invisible spaces:
- const pattern = /a  b  c/

// Use escape sequences:
+ const pattern = /a\x20{2}b\x20{2}c/

// Or character class with quantifier:
+ const pattern = /a[ ]{2}b[ ]{2}c/
```

### Avoid Invisible Characters

```typescript
// ❌ Hard to see spaces
const pattern = /prefix  middle  suffix/

// ✅ More visible
const pattern = /prefix\s+middle\s+suffix/

// ❌ Trailing space is invisible
const pattern = /prefix /

// ✅ Explicit quantifier
const pattern = /prefix\s*/
```

## Common Pitfalls

### Confusing Space with Whitespace

```javascript
// ❌ Literal space only matches U+0020
const pattern = /hello world/
// Matches: "hello world"
// Does NOT match: "hello\tworld", "hello\nworld", "hello  world"

// ✅ Use \s for any whitespace
const pattern = /hello\s+world/
// Matches: "hello world", "hello\tworld", "hello\nworld", "hello  world"
```

### Hard-to-Detect Trailing Spaces

```javascript
// ❌ Trailing space is invisible in code
const pattern = /test pattern /

// ✅ Use anchors or explicit quantifiers
const pattern = /test pattern\s*/
const pattern = /^test pattern$/
```

### Space Count Ambiguity

```javascript
// ❌ Hard to count spaces
const pattern = /key    value/ // 4 spaces?

// ✅ Explicit quantifier
const pattern = /key\s{4}value/

// ✅ Clear character class
const pattern = /key[ ]{4}value/
```

### Character Class Confusion

```javascript
// ❌ Ambiguous: Is the space intentional?
const pattern = /[a-z ]/

// ✅ Document intent
const pattern = /[a-z ]/ // Allow lowercase letters and space

// ✅ Use proper escape if needed
const pattern = /[a-z\x20]/
```

### Multiline Pattern Issues

```javascript
// ❌ Literal space doesn't match tab in multiline
const pattern = /^  / // Two spaces

// ✅ Be explicit about whitespace
const pattern = /^\s{2}/ // Any two whitespace characters

// ✅ Or specify exact characters
const pattern = /^[\t ]{2}/ // Tab or space
```

## Related Rules

- [no-control-regex](../patterns/no-control-regex.md) - Disallow control characters in regex
- [prefer-regex-literals](../patterns/prefer-regex-literals.md) - Prefer regex literals over RegExp constructor
- [no-invalid-regexp](../patterns/no-invalid-regexp.md) - Disallow invalid regex strings

## Further Reading

- [MDN: Character Classes](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions/Character_Classes) - Understanding character classes in regex
- [MDN: Quantifiers](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions/Quantifiers) - Using quantifiers properly
- [Regular Expressions 101](https://regex101.com/) - Interactive regex tester and debugger
- [Why \s is Better Than Literal Space](https://stackoverflow.com/questions/5319698/why-use-s-instead-of-literal-space-in-regex) - StackOverflow discussion

## Auto-Fix

This rule is not auto-fixable. Replacing literal spaces requires understanding the intended matching behavior.

Use interactive mode to review violations:

```bash
codeforge analyze --rules no-regex-spaces
```
