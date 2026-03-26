# no-useless-concat

![Recommended](https://img.shields.io/badge/-recommended-blue)

| Property    | Value    |
| ----------- | -------- |
| Category    | patterns |
| Fixable     | Yes      |
| Recommended | Yes      |
| Deprecated  | No       |

## Description

Disallow useless concatenation of literals. String concatenation with two or more literals can be safely merged into a single literal string, improving both readability and minor performance benefits.

## Why This Rule Matters

Using useless concatenation is problematic because:

- **Readability**: Single literals are easier to read and understand
- **Performance**: Concatenating multiple literals adds unnecessary overhead
- **Maintainability**: Harder to update or translate strings when split across multiple parts
- **Code bloat**: Adds unnecessary syntax noise
- **Best practices**: Modern JavaScript favors template literals or single string literals

### Common Cases of Useless Concatenation

```javascript
// ❌ Useless: Two string literals concatenated
const message = 'Hello ' + 'World!'

// ❌ Useless: Multiple literals in a row
const path = '/usr' + '/local' + '/bin'

// ❌ Useless: Numbers and strings that could be literals
const value = 42 + ' is the answer'
```

## Concatenation Patterns Detected

This rule detects the following useless concatenation patterns:

- **String + String**: `"foo" + "bar"`
- **Number + Number**: `1 + 2` (when not part of an expression)
- **String + Number**: `"age: " + 25`
- **Multiple literals**: `"a" + "b" + "c" + "d"`
- **Empty strings**: `"" + "text"` or `"text" + ""`

## Configuration Options

```json
{
  "rules": {
    "no-useless-concat": [
      "error",
      {
        "allowBinary": false,
        "allowMixed": false
      }
    ]
  }
}
```

| Option        | Type      | Default | Description                                             |
| ------------- | --------- | ------- | ------------------------------------------------------- |
| `allowBinary` | `boolean` | `false` | Allow binary operations between numbers (e.g., `1 + 2`) |
| `allowMixed`  | `boolean` | `false` | Allow mixed type concatenation (e.g., `"age: " + 25`)   |

### allowBinary Option

The `allowBinary` option permits numeric binary operations:

```json
{
  "rules": {
    "no-useless-concat": [
      "error",
      {
        "allowBinary": true
      }
    ]
  }
}
```

With this configuration, numeric additions are allowed:

```typescript
// ✅ Allowed with allowBinary: true
const sum = 1 + 2
const total = 10 + 20 + 30
```

### allowMixed Option

The `allowMixed` option permits mixing string and number types:

```json
{
  "rules": {
    "no-useless-concat": [
      "error",
      {
        "allowMixed": true
      }
    ]
  }
}
```

With this configuration, type mixing is allowed:

```typescript
// ✅ Allowed with allowMixed: true
const age = 'age: ' + 25
const version = 'v' + 1 + '.' + 2 + '.' + 3
```

## When to Use This Rule

**Use this rule when:**

- You want to improve code readability by eliminating unnecessary concatenation
- You prefer single string literals over multiple concatenated literals
- You're refactoring legacy code to use modern JavaScript patterns
- You want to catch accidentally split strings

**Consider disabling when:**

- You need to keep long strings on multiple lines for readability
- You're using concatenation for intentional formatting purposes
- You have code generators that produce concatenated literals

## Code Examples

### ❌ Incorrect - Useless Concatenation

```typescript
// String literals that could be merged
const message = 'Hello ' + 'World!'
const greeting = 'Good ' + 'morning!'

// Multiple string literals
const path = '/usr' + '/local' + '/bin'
const url = 'https://' + 'example.com'

// Empty string concatenation
const text = '' + 'content'
const suffix = 'prefix' + ''

// Numbers that could be literals
const value = 1 + 2 + 3
const hex = '0x' + 'FF'

// Mixed types that could be literals
const version = 'v' + '1' + '.' + '0'
```

```typescript
// Multiple lines with unnecessary concatenation
const longText = 'This is a long string ' + 'that is split across ' + 'multiple lines'
```

### ✅ Correct - Single Literals

```typescript
// Use single string literals
const message = 'Hello World!'
const greeting = 'Good morning!'

// Combine path segments
const path = '/usr/local/bin'
const url = 'https://example.com'

// Remove empty strings
const text = 'content'
const suffix = 'prefix'

// Use number literals directly
const value = 6
const hex = '0xFF'

// Combine version into single string
const version = 'v1.0'
```

```typescript
// For long strings, use template literals
const longText = `This is a long string that is split across multiple lines`

// Or use single literal with line continuation (with proper escaping)
const longText = 'This is a long string ' + 'that uses intentional line breaks'
```

### ✅ Correct - Legitimate Concatenation

```json
// Configuration to allow mixed types:
{
  "rules": {
    "no-useless-concat": [
      "error",
      {
        "allowMixed": true
      }
    ]
  }
}
```

```typescript
// Dynamic concatenation with variables
const name = 'Alice'
const greeting = 'Hello, ' + name + '!'

// Template literals (preferred)
const greeting = `Hello, ${name}!`

// Conditional concatenation
const prefix = isDebug ? '[DEBUG] ' : ''
const message = prefix + 'Processing complete'
```

```typescript
// Building strings in loops
let result = ''
for (const item of items) {
  result += item.name + ', '
}

// Better: Use array.join
const result = items.map((item) => item.name).join(', ')
```

### ✅ Correct - Binary Operations (with allowBinary)

```json
// Configuration:
{
  "rules": {
    "no-useless-concat": [
      "error",
      {
        "allowBinary": true
      }
    ]
  }
}
```

```typescript
// Mathematical operations
const sum = 1 + 2 + 3
const coordinates = x + y + z

// Expression evaluation
const value = (10 + 20) * 2
```

## How to Fix Violations

### 1. Merge String Literals

```diff
- const message = "Hello " + "World!"
+ const message = "Hello World!"
```

```diff
- const path = "/usr" + "/local" + "/bin"
+ const path = "/usr/local/bin"
```

### 2. Use Template Literals

```diff
- const greeting = "Hello, " + name + "!"
+ const greeting = `Hello, ${name}!`
```

```diff
- const url = protocol + "://" + domain + path
+ const url = `${protocol}://${domain}${path}`
```

### 3. Remove Empty Strings

```diff
- const text = "" + "content"
+ const text = "content"
```

```diff
- const suffix = "prefix" + ""
+ const suffix = "prefix"
```

### 4. Combine Numeric Literals

```diff
- const value = 1 + 2 + 3
+ const value = 6
```

```diff
- const version = "v" + "1" + "." + "0"
+ const version = "v1.0"
```

### 5. Use Array.join for Multiple Parts

```diff
- const result = item1 + ", " + item2 + ", " + item3
+ const result = [item1, item2, item3].join(", ")
```

## Best Practices

### Prefer Template Literals

Template literals are more readable and flexible:

```typescript
// ❌ Old-style concatenation
const message = 'Hello, ' + name + '! You have ' + count + ' messages.'

// ✅ Template literal
const message = `Hello, ${name}! You have ${count} messages.`
```

### Use Array.join for Repeated Concatenation

When building strings in loops, use `join`:

```typescript
// ❌ Inefficient concatenation in loop
let result = ''
for (const item of items) {
  result += item + ', '
}

// ✅ Efficient array.join
const result = items.map((item) => item).join(', ')
```

### Break Long Lines Intentionally

For very long strings, break them intentionally:

```typescript
// ✅ Intentional line breaks
const longText =
  `This is a very long string that needs ` +
  `to be broken across multiple lines for readability ` +
  `but is still logically a single message`
```

### Use Constants for Repeated Strings

```typescript
// ✅ Define constants
const SEPARATOR = ', '
const NEWLINE = '\n'

const output = [name, age, email].join(SEPARATOR)
```

## Common Pitfalls

### Unintended Line Breaks

```typescript
// ❌ Accidentally split string
const message = 'Error: ' + 'Something went wrong'

// This is flagged, but might be intentional
// for formatting purposes
```

### Type Coercion

```typescript
// ❌ Unexpected: Number to string coercion
const result = 'Value: ' + 42 // "Value: 42"
const sum = 'Total: ' + 10 + 20 // "Total: 1020" (not "Total: 30")

// ✅ Use template literals for clarity
const result = `Value: ${42}`
const sum = `Total: ${10 + 20}`
```

### Performance Considerations

While the performance difference is minimal, concatenating literals does create temporary strings:

```typescript
// ❌ Creates intermediate strings
const path = '/usr' + '/local' + '/bin'

// ✅ No intermediate strings
const path = '/usr/local/bin'
```

## Related Rules

- [prefer-template](../patterns/prefer-template.md) - Prefer template literals over string concatenation
- [no-useless-constructor](../patterns/no-useless-constructor.md) - Disallow unnecessary constructors
- [no-unneeded-ternary](../patterns/no-unneeded-ternary.md) - Disallow ternary operators when simpler alternatives exist

## Further Reading

- [MDN: Template Literals](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals)
- [JavaScript String Concatenation Performance](https://jsperf.com/string-concatenation-performance)
- [When to Use Template Literals vs Concatenation](https://2ality.com/2015/01/template-strings.html)

## Auto-Fix

This rule is auto-fixable. CodeForge will automatically merge concatenated literals into single literals.

```bash
# Auto-fix all useless concatenations
codeforge fix --rules no-useless-concat

# Preview fixes without modifying files
codeforge fix --rules no-useless-concat --dry-run
```

The auto-fix will:

1. Merge consecutive string literals into a single literal
2. Remove empty string concatenations
3. Combine numeric literals where possible
4. Preserve whitespace and formatting

For complex cases with mixed types, use the `allowMixed` option to enable more flexible auto-fixing.
