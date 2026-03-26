# require-unicode-regexp

![Recommended](https://img.shields.io/badge/-recommended-blue)

| Property    | Value    |
| ----------- | -------- |
| Category    | patterns |
| Fixable     | Yes      |
| Recommended | Yes      |
| Deprecated  | No       |

## Description

Require the `u` flag on regular expressions that match Unicode characters. Modern JavaScript has comprehensive Unicode support, but regular expressions must opt into this behavior using the `u` flag. Without it, many Unicode features work incorrectly or not at all.

## Why This Rule Matters

Using regular expressions without the `u` flag causes problems with Unicode text:

- **Surrogate pair handling**: Characters like emojis (💚) are stored as two code units (surrogate pairs) without `u`, causing them to be treated as two separate characters
- **Incorrect string length**: `"😀".length` is `2` without `u`, which breaks regex quantifiers like `.{1}` matching the entire emoji
- **Unicode escape sequences**: Escapes like `\u{1F600}` only work with the `u` flag
- **Unicode property escapes**: `\p{Emoji}`, `\p{Script=Latin}` require the `u` flag
- **Case insensitivity**: Case folding with `i` flag doesn't work correctly for Unicode without `u`
- **Code point vs code unit confusion**: Regex matches code units (16-bit) by default, not full code points

### Common Issues

```javascript
// PROBLEM: Emoji matches incorrectly without u flag
const emoji = '💚'
emoji.match(/./g)  // Returns ['\ud83d', '\udc9a'] (two chars!)
emoji.match(/./gu) // Returns ['💚'] (one char!)

// PROBLEM: Quantifiers don't match full Unicode characters
'Hello 😀'.match(/.{1}/g)  // Returns ['H', 'e', 'l', 'l', 'o', ' ', '\ud83d']
'Hello 😀'.match(/.{1}/gu) // Returns ['H', 'e', 'l', 'l', 'o', ' ', '😀']

// PROBLEM: Unicode escape sequences don't work
/\u{1F600}/.test('😀')  // SyntaxError or false (depending on environment)
/\u{1F600}/u.test('😀') // true

// PROBLEM: Unicode property escapes require u flag
/\p{Emoji}/u.test('😀')  // true
/\p{Emoji}/.test('😀')   // Error or doesn't work
```

## When This Rule Triggers

This rule triggers when a regular expression contains:

- **Emoji characters**: Any character outside the Basic Multilingual Plane (BMP)
- **Unicode escape sequences**: `\u{XXXXXX}` syntax
- **Extended Unicode characters**: Characters with code points > 0xFFFF
- **Surrogate pairs**: Any character composed of two code units

The rule detects these patterns statically and requires the `u` flag when Unicode is likely needed.

## Configuration Options

```json
{
  "rules": {
    "require-unicode-regexp": [
      "error",
      {
        "strict": false,
        "minCodePoint": 128
      }
    ]
  }
}
```

| Option         | Type      | Default | Description                                                                          |
| -------------- | --------- | ------- | ------------------------------------------------------------------------------------ |
| `strict`       | `boolean` | `false` | If true, require `u` flag on ALL regex patterns (not just those detected as Unicode) |
| `minCodePoint` | `number`  | `128`   | Minimum Unicode code point that triggers the rule (ASCII range 0-127 is exempt)      |

### strict Option Usage

When `strict` is enabled, all regular expressions must use the `u` flag:

```json
{
  "rules": {
    "require-unicode-regexp": [
      "error",
      {
        "strict": true
      }
    ]
  }
}
```

This mode ensures Unicode safety across the entire codebase but may be overly restrictive for simple ASCII-only patterns.

### minCodePoint Option Usage

Adjust the threshold for when the `u` flag is required:

```json
{
  "rules": {
    "require-unicode-regexp": [
      "error",
      {
        "minCodePoint": 256
      }
    ]
  }
}
```

With `minCodePoint: 256`, characters in the range 128-255 (Latin-1 Supplement) are exempt from the rule.

## When to Use This Rule

**Use this rule when:**

- Your application handles international text or user-generated content
- You work with emojis, symbols, or non-Latin scripts (Cyrillic, Arabic, Chinese, etc.)
- You parse or validate strings that may contain Unicode characters
- You care about correctness in multi-language applications
- You want to avoid subtle bugs with Unicode string manipulation

**Consider disabling when:**

- Your codebase exclusively processes ASCII data (e.g., URLs, identifiers, protocol parsing)
- Performance is critical and you know all input is ASCII
- You're working with legacy code that predates ES6 Unicode support

## Code Examples

### ❌ Incorrect - Missing u Flag with Unicode

```typescript
// PROBLEM: Regex without u flag doesn't handle emojis correctly
const emojiRegex = /😀/
const result = 'Hello 😀'.match(emojiRegex)
// Matches incorrectly, may fail or match surrogate pairs

// PROBLEM: Quantifier doesn't match full emoji
const truncateRegex = /^.{1,20}$/
truncateRegex.test('Hello 😀') // false (length is 13 code units!)
```

```typescript
// PROBLEM: Unicode escape doesn't work
const smileyRegex = /\u{1F600}/
const result = smileyRegex.test('😀')
// SyntaxError or false depending on JavaScript engine
```

```typescript
// PROBLEM: Unicode property escapes don't work
const emojiRegex = /\p{Emoji}/
const result = emojiRegex.test('😀')
// Error: Invalid escape or doesn't match

// PROBLEM: Case insensitivity doesn't work for Unicode
const caseInsensitive = /straße/i
const result = caseInsensitive.test('Straße')
// false (should be true with u flag)
```

```typescript
// PROBLEM: Character class doesn't match full Unicode range
const letterRegex = /[A-Za-z]/
letterRegex.test('é') // false (should be true for accented letters)
letterRegex.test('α') // false (Greek letters)
```

### ✅ Correct - Using u Flag

```typescript
// CORRECT: Add u flag for Unicode support
const emojiRegex = /😀/u
const result = 'Hello 😀'.match(emojiRegex)
// Correctly matches the emoji

// CORRECT: Quantifier counts code points, not code units
const truncateRegex = /^.{1,20}$/u
truncateRegex.test('Hello 😀') // true (length is 6 code points!)
```

```typescript
// CORRECT: Unicode escape sequences work with u flag
const smileyRegex = /\u{1F600}/u
const result = smileyRegex.test('😀')
// true
```

```typescript
// CORRECT: Unicode property escapes require u flag
const emojiRegex = /\p{Emoji}/u
const result = emojiRegex.test('😀')
// true

// CORRECT: Case insensitivity works correctly
const caseInsensitive = /straße/iu
const result = caseInsensitive.test('Straße')
// true
```

```typescript
// CORRECT: Use Unicode property escapes for international letters
const letterRegex = /\p{L}/u
letterRegex.test('é') // true
letterRegex.test('α') // true
letterRegex.test('中') // true
```

```typescript
// CORRECT: Match specific Unicode scripts
const latinRegex = /\p{Script=Latin}/u
const cyrillicRegex = /\p{Script=Cyrillic}/u
const arabicRegex = /\p{Script=Arabic}/u

latinRegex.test('Hello') // true
cyrillicRegex.test('Привет') // true
arabicRegex.test('مرحبا') // true
```

### ✅ Correct - ASCII-Only Patterns

```typescript
// CORRECT: ASCII-only patterns don't need u flag (if strict: false)
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
const urlRegex = /^https?:\/\/[^\s/$.?#].[^\s]*$/

// These are fine because they only match ASCII characters
emailRegex.test('user@example.com') // true
urlRegex.test('https://example.com') // true
```

```typescript
// CORRECT: Explicitly disable for specific ASCII-only regexes
// Disable this rule with // eslint-disable-next-line for ASCII patterns
const hexColorRegex = /#([0-9a-fA-F]{3}){1,2}/
hexColorRegex.test('#ff5733') // true
```

### ✅ Correct - Advanced Unicode Features

```typescript
// CORRECT: Combine Unicode properties with u flag
const emojiOnlyRegex = /^\p{Emoji}+$/u
emojiOnlyRegex.test('😀😁😂') // true
emojiOnlyRegex.test('Hello') // false

// CORRECT: Negative Unicode property escapes
const noEmojiRegex = /^\P{Emoji}+$/u
noEmojiRegex.test('Hello') // true
noEmojiRegex.test('Hello 😀') // false
```

```typescript
// CORRECT: Match specific Unicode categories
const whitespaceRegex = /\p{White_Space}/u
const currencyRegex = /\p{Sc}/u // Currency symbols
const mathRegex = /\p{Sm}/u // Math symbols

whitespaceRegex.test('\u{2003}') // true (EM SPACE)
currencyRegex.test('$') // true
mathRegex.test('∑') // true
```

```typescript
// CORRECT: Use character class subtraction with Unicode properties
const asciiLetterRegex = /[\p{L}--A-Za-z]/u
// Matches letters that are NOT ASCII (A-Za-z)
asciiLetterRegex.test('é') // true
asciiLetterRegex.test('a') // false
```

## How to Fix Violations

### 1. Add u Flag to Regex

```diff
- const emojiRegex = /😀/
+ const emojiRegex = /😀/u
```

```diff
- const truncateRegex = /^.{1,20}$/
+ const truncateRegex = /^.{1,20}$/u
```

### 2. Add u Flag to Regex with Other Flags

```diff
- const caseInsensitive = /straße/i
+ const caseInsensitive = /straße/iu
```

```diff
- const globalEmoji = /😀/g
+ const globalEmoji = /😀/gu
```

### 3. Use Unicode Property Escapes

```diff
- const letterRegex = /[A-Za-z]/
+ const letterRegex = /\p{L}/u
```

```diff
- const digitRegex = /[0-9]/
+ const digitRegex = /\p{Nd}/u
```

### 4. Use Unicode Escape Sequences

```diff
- const smileyRegex = /😀/
+ const smileyRegex = /\u{1F600}/u
```

### 5. Convert Character Classes to Unicode Properties

```diff
- const whitespaceRegex = /\s/
+ const whitespaceRegex = /\p{White_Space}/u
```

```diff
- const wordCharRegex = /\w/
+ const wordCharRegex = /[\p{L}\p{Nd}]/u
```

### 6. Disable Rule for ASCII-Only Regexes

```typescript
// eslint-disable-next-line codeforge/require-unicode-regexp
const hexRegex = /#([0-9a-fA-F]{3}){1,2}/
```

```typescript
// eslint-disable-next-line codeforge/require-unicode-regexp
const urlRegex = /^https?:\/\/[^\s/$.?#].[^\s]*$/
```

## Best Practices

### Always Use u Flag for User Input

When processing user input or text from external sources:

```typescript
// ✅ GOOD: Use u flag for user input
function validateUsername(username: string): boolean {
  // Match any Unicode letter or number
  const usernameRegex = /^[\p{L}\p{Nd}_]{3,20}$/u
  return usernameRegex.test(username)
}

validateUsername('用户名') // true
validateUsername('john_doe') // true
validateUsername('José123') // true
```

### Use Unicode Properties for Internationalization

```typescript
// ✅ GOOD: Use Unicode properties for i18n
function containsCJK(text: string): boolean {
  const cjkRegex = /\p{Script=Han}|\p{Script=Hiragana}|\p{Script=Katakana}|\p{Script=Hangul}/u
  return cjkRegex.test(text)
}

containsCJK('Hello') // false
containsCJK('こんにちは') // true
containsCJK('안녕하세요') // true
containsCJK('你好') // true
```

### Handle Emoji in Text Processing

```typescript
// ✅ GOOD: Proper emoji handling with u flag
function truncateText(text: string, maxLength: number): string {
  // Count actual characters (code points), not code units
  const truncatedRegex = new RegExp(`^.{1,${maxLength}}`, 'u')
  const match = text.match(truncatedRegex)
  return match ? match[0] : text
}

truncateText('Hello 😀 world 🌍', 10) // 'Hello 😀 w'
```

### Use Case Folding for Case-Insensitive Matching

```typescript
// ✅ GOOD: Proper Unicode case-insensitive matching
function caseInsensitiveSearch(text: string, query: string): boolean {
  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const searchRegex = new RegExp(escapedQuery, 'iu')
  return searchRegex.test(text)
}

caseInsensitiveSearch('Straße', 'STRASSE') // true
caseInsensitiveSearch('Élan', 'éLAN') // true
caseInsensitiveSearch('İstanbul', 'istanbul') // true
```

### Validate Unicode Text Correctly

```typescript
// ✅ GOOD: Validate names with Unicode support
function isValidName(name: string): boolean {
  // Allow letters from any script, spaces, hyphens, apostrophes
  const nameRegex = /^[\p{L}\p{M}\s'-]+$/u
  return nameRegex.test(name) && name.length >= 2
}

isValidName('José García') // true
isValidName('Александр') // true
isValidName('山田 太郎') // true
isValidName('مرحبا') // true
isValidName("O'Reilly") // true
```

## Common Pitfalls

### String Length Mismatch

```javascript
// ❌ PROBLEM: String length counts code units, not characters
'💚'.length // 2 (surrogate pair)

// ✅ SOLUTION: Use spread operator or Array.from with u flag regex
[...'💚'].length // 1
Array.from('💚').length // 1

// Or use regex with u flag for counting
const emojiCount = '💚😀😁'.match(/./gu)?.length ?? 0 // 3
```

### Array Access on Unicode Strings

```javascript
// ❌ PROBLEM: Array access splits surrogate pairs
const text = '💚'
text[0] // '\ud83d' (first surrogate)
text[1] // '\udc9a' (second surrogate)

// ✅ SOLUTION: Use spread operator with regex
const chars = [...'💚']
chars[0] // '💚' (full emoji)
```

### split() Behavior with Unicode

```javascript
// ❌ PROBLEM: split() on empty string splits surrogate pairs
'💚😀'.split('') // ['\ud83d', '\udc9a', '\ud83d', '\ude00']

// ✅ SOLUTION: Use regex with u flag
'💚😀'.split(/(?=.)/gu) // ['💚', '😀']

// Or use spread operator
[...'💚😀'] // ['💚', '😀']
```

### String Methods Without Unicode Awareness

```javascript
// ❌ PROBLEM: toUpperCase doesn't handle all Unicode
'ß'.toUpperCase() // 'SS' (German sharp s)
'İ'.toLowerCase() // 'i\u{307}' (Turkish dotted I)

// ✅ SOLUTION: Use locale-specific methods or regex with u flag
'ß'.toLocaleUpperCase('de-DE') // 'SS'
'İ'.toLocaleLowerCase('tr-TR') // 'i'
```

### Incorrect Character Classes

```javascript
// ❌ PROBLEM: \w doesn't match non-ASCII word characters
/\w/.test('é')   // false
/\w/.test('α')   // false
/\w/.test('中')  // false

// ✅ SOLUTION: Use Unicode property escapes
/\p{L}/u.test('é')   // true
/\p{L}/u.test('α')   // true
/\p{L}/u.test('中')  // true
```

### Regex Backreferences and Surrogate Pairs

```javascript
// ❌ PROBLEM: Backreferences may fail with surrogate pairs
const duplicateRegex = /(.)\1/
duplicateRegex.test('💚💚') // false (each 💚 is 2 code units!)

// ✅ SOLUTION: Use u flag for code point matching
const duplicateRegexU = /(.)\1/u
duplicateRegexU.test('💚💚') // true
```

## Performance Considerations

### u Flag Performance

The `u` flag has minimal performance impact in modern JavaScript engines:

```typescript
// Modern engines optimize u flag well
const withU = /test/u
const withoutU = /test/

// Performance difference is negligible for most use cases
```

### When to Avoid u Flag

Consider NOT using the `u` flag only when:

- You know input is strictly ASCII
- Performance is critical and regex is in a hot path
- You're working with legacy browsers that don't support ES6

```typescript
// ✅ OK: ASCII-only validation in performance-critical code
// eslint-disable-next-line codeforge/require-unicode-regexp
const hexColorRegex = /^#([0-9a-fA-F]{3}){1,2}$/
```

## Related Rules

- [prefer-regex-literals](../patterns/prefer-regex-literals.md) - Use regex literals over RegExp constructor
- [no-invalid-regexp](../patterns/no-invalid-regexp.md) - Disallow invalid regular expressions
- [no-control-regex](../patterns/no-control-regex.md) - Disallow control characters in regex
- [no-regex-spaces](../patterns/no-regex-spaces.md) - Disallow multiple spaces in regex

## Further Reading

- [MDN: RegExp.prototype.unicode](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/unicode) - The u flag
- [MDN: Unicode Property Escapes](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Regular_expressions/Unicode_character_class_escape) - Using \p and \P
- [JavaScript has a Unicode problem](https://mathiasbynens.be/notes/javascript-unicode) - Understanding Unicode in JS
- [ES6 Unicode Regular Expressions](https://flaviocopes.com/javascript-unicode-regex/) - Practical guide
- [What every JavaScript developer should know about Unicode](https://nickmccurdy.com/blog/2019/what-every-javascript-developer-should-know-about-unicode/) - Comprehensive overview

## Auto-Fix

This rule is **auto-fixable**. The auto-fix will:

1. **Add the `u` flag** to regular expressions that contain Unicode characters
2. **Preserve existing flags** (adds `u` alongside `g`, `i`, `m`, etc.)
3. **Skip auto-fix** for ASCII-only patterns when `strict: false`

Example auto-fix behavior:

```diff
- const emojiRegex = /😀/
+ const emojiRegex = /😀/u
```

```diff
- const globalEmoji = /😀/g
+ const globalEmoji = /😀/gu
```

```diff
- const caseInsensitive = /straße/i
+ const caseInsensitive = /straße/iu
```

**Note**: Auto-fix only adds the `u` flag. It does not convert character classes to Unicode properties or make other semantic changes to the regex pattern.

Apply auto-fix:

```bash
codeforge fix --rules require-unicode-regexp
```

Or use interactive mode to review changes:

```bash
codeforge interactive --rules require-unicode-regexp
```
