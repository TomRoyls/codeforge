# no-implicit-coercion

![Recommended](https://img.shields.io/badge/-recommended-blue)

| Property    | Value    |
| ----------- | -------- |
| Category    | patterns |
| Fixable     | No       |
| Recommended | Yes      |
| Deprecated  | No       |

## Description

Disallow implicit type coercion in JavaScript/TypeScript code. Implicit coercion occurs when JavaScript automatically converts values between types, often leading to unexpected behavior and bugs. This rule encourages explicit type conversions for better code clarity and predictability.

## Why This Rule Matters

Implicit type coercion is dangerous because:

- **Unpredictable behavior**: Values can change types unexpectedly during operations
- **False positives/negatives**: Truthy/falsy checks may not work as intended
- **Code readability**: Other developers may not expect implicit conversions
- **Debugging difficulty**: Type-related bugs can be hard to track down
- **Type safety**: TypeScript users expect explicit type handling

### Common Coercion Issues

```javascript
// ISSUE: Using + for string concatenation with numbers
const result = '10' + 5 // Returns "105", not 15

// ISSUE: Loose equality checks
if (value == '0') {
  // Matches 0, "0", false, and more
}

// ISSUE: Implicit boolean conversion
if (user.id) {
  // Fails for id: 0 (valid ID)
}
```

## Coercion Patterns Detected

This rule detects the following implicit coercion patterns:

- **Loose equality**: `==` and `!=` operators
- **Unary operators**: `+` (numeric conversion), `-` (negation)
- **Bitwise NOT**: `~` (converts to 32-bit integer)
- **Arithmetic with mixed types**: `*`, `/`, `%` with non-numeric values
- **Implicit boolean contexts**: Using values in boolean contexts without explicit conversion

## Configuration Options

```json
{
  "rules": {
    "no-implicit-coercion": [
      "error",
      {
        "allow": ["+", "-", "bitwise"],
        "disallow": ["==", "!="]
      }
    ]
  }
}
```

| Option     | Type       | Default | Description                                                             |
| ---------- | ---------- | ------- | ----------------------------------------------------------------------- |
| `allow`    | `string[]` | `[]`    | List of coercion patterns to allow (e.g., `["+", "-"]`)                 |
| `disallow` | `string[]` | `[]`    | List of specific coercion patterns to disallow (overrides allow option) |

### allow Option Usage

The `allow` option permits specific coercion patterns for legitimate use cases.

```json
{
  "rules": {
    "no-implicit-coercion": [
      "error",
      {
        "allow": ["bitwise"]
      }
    ]
  }
}
```

With this configuration, bitwise NOT operations are allowed but other coercion patterns are still detected.

## When to Use This Rule

**Use this rule when:**

- You want to enforce explicit type conversions
- Your codebase uses TypeScript and wants type safety
- You work in a team with varying JavaScript expertise
- You prioritize code clarity and maintainability
- You want to catch bugs related to unexpected type conversions

**Consider disabling when:**

- Your codebase heavily relies on JavaScript's coercion features
- You're working with legacy code that uses coercion patterns
- You're implementing algorithms that intentionally use implicit coercion

## Code Examples

### ❌ Incorrect - Using Implicit Coercion

```typescript
// Loose equality can match multiple types
if (value == 0) {
  // Matches 0, "0", false, null, undefined, []
}

// String concatenation with numbers
const total = '10' + 5 // Returns "105"

// Implicit boolean conversion
if (user.id) {
  // Fails for id: 0 (which is a valid ID)
}

// Unary plus for numeric conversion
const num = +'42' // Converts "42" to number implicitly
```

```typescript
// Arithmetic with mixed types
const result = '5' * 2 // Returns 10 (implicit coercion)

// Implicit boolean in conditional
const isActive = activeCount ? true : false // Unnecessary ternary
```

```typescript
// Implicit coercion in comparisons
if (items.length != 0) {
  // Use !== for strict comparison
}

// Implicit coercion in bitwise operations
const isValid = ~flags
```

### ✅ Correct - Using Explicit Conversions

```typescript
// Use strict equality for type-safe comparisons
if (value === 0) {
  // Only matches the number 0
}

// Explicit number conversion
const total = Number('10') + 5 // Returns 15
const count = parseInt('42', 10) // Explicit parsing

// Explicit boolean conversion
if (user.id !== undefined && user.id !== null) {
  // Clear intent: check for valid ID
}

// Use explicit checks instead of boolean conversion
if (user.id !== 0) {
  // Explicitly check for non-zero ID
}
```

```typescript
// Explicit type conversion for arithmetic
const result = Number('5') * 2 // Clear intent

// Use Boolean() for explicit conversion
const isActive = Boolean(activeCount)
```

```typescript
// Use strict equality operators
if (items.length !== 0) {
  // Clear intent
}

// Use explicit boolean conversion
const isValid = Boolean(flags)
```

### ✅ Correct - Legitimate Coercion Use Cases

```json
// Configuration:
{
  "rules": {
    "no-implicit-coercion": [
      "error",
      {
        "allow": ["bitwise"]
      }
    ]
  }
}
```

```typescript
// Bitwise operations require coercion (allowed)
function hasFlag(value: number, flag: number): boolean {
  return (value & flag) !== 0
}

// Type guards with explicit checks
function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !Number.isNaN(value)
}

// Safe string to number conversion
function toNumber(value: string, fallback: number = 0): number {
  const num = Number(value)
  return Number.isNaN(num) ? fallback : num
}
```

```typescript
// Explicit type conversion for API responses
interface User {
  id: string
  age: string
  score: string
}

function parseUser(data: unknown): User {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid user data')
  }

  const user = data as Record<string, unknown>
  return {
    id: String(user.id ?? ''),
    age: Number(user.age ?? 0),
    score: Number(user.score ?? 0),
  }
}
```

## How to Fix Violations

### 1. Replace Loose Equality with Strict Equality

```diff
- if (value == 0) {
+ if (value === 0) {
    // Code here
  }
```

```diff
- if (status != "active") {
+ if (status !== "active") {
    // Code here
  }
```

### 2. Use Explicit Number Conversion

```diff
- const num = +"42"
+ const num = Number("42")

- const count = parseInt(str)
+ const count = parseInt(str, 10)
```

```diff
- const result = "10" + 5
+ const result = Number("10") + 5
```

### 3. Use Explicit Boolean Conversion

```diff
- if (user.id) {
+ if (user.id !== undefined && user.id !== null) {
    // Code here
  }

- const isActive = !!count
+ const isActive = Boolean(count)
```

```diff
- if (items.length) {
+ if (items.length > 0) {
    // Code here
  }
```

### 4. Use Explicit Type Checking

```diff
- if (typeof value === "string" || value) {
+ if (typeof value === "string" || typeof value === "number") {
    // Code here
  }

- const isValid = flags ? true : false
+ const isValid = Boolean(flags)
```

### 5. Replace Implicit Arithmetic with Explicit Conversion

```diff
- const result = "5" * 2
+ const result = Number("5") * 2

- const total = value + ""
+ const total = String(value)
```

## Best Practices

### When Explicit Conversion is Necessary

Explicit conversion is necessary in these scenarios:

1. **API responses**: Parsing external data that may be in string format
2. **User input**: Handling form data that's always strings
3. **Configuration**: Reading config values from JSON or environment
4. **Legacy code**: Interfacing with older code that uses loose typing
5. **Type assertions**: Making TypeScript understand runtime types

Always document why conversions are necessary:

```typescript
/**
 * Convert user input to number with fallback.
 * Input comes from HTML forms and is always a string.
 */
function parseAge(input: string): number {
  const age = parseInt(input, 10)
  return Number.isNaN(age) ? 0 : age
}
```

### Prefer Built-in Type Conversion Methods

Instead of implicit coercion, use:

```typescript
// Number conversion
Number(value)
parseInt(str, 10)
parseFloat(str)

// String conversion
String(value)
value.toString()

// Boolean conversion
Boolean(value)
```

### Use Type Guards for Complex Checks

```typescript
function isNotNullish<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined
}

function isString(value: unknown): value is string {
  return typeof value === 'string'
}

function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !Number.isNaN(value)
}
```

## Common Pitfalls

### Loose Equality Pitfalls

```javascript
// ❌ Unexpected: Multiple values match
0 == '0' // true
0 == false // true
'' == false // true
null == undefined // true

// ✅ Use strict equality
0 === '0' // false
0 === false // false
'' === false // false
null === undefined // false
```

### String Concatenation Pitfalls

```javascript
// ❌ Unexpected: String concatenation instead of addition
'10' + 5 // "105"
'10' - 5 // 5 (subtraction coerces to number)

// ✅ Use explicit conversion
Number('10') + 5 // 15
parseInt('10', 10) + 5 // 15
```

### Boolean Conversion Pitfalls

```javascript
// ❌ Unexpected: Values considered falsy
if (0) {
  /* never runs */
}
if ('') {
  /* never runs */
}
if (null) {
  /* never runs */
}
if (undefined) {
  /* never runs */
}
if (NaN) {
  /* never runs */
}

// ✅ Use explicit checks
if (value !== 0) {
  /* explicit */
}
if (value !== '') {
  /* explicit */
}
if (value !== null) {
  /* explicit */
}
```

### Array Conversion Pitfalls

```javascript
// ❌ Unexpected: Arrays converted differently
[] == 0    // true
[] == ""   // true
[1] == 1   // true

// ✅ Use explicit array checks
Array.isArray(value)
Array.isArray(value) && value.length > 0
```

## Related Rules

- [eqeqeq](../patterns/eq-eq-eq.md) - Use strict equality
- [no-bitwise](../patterns/no-bitwise.md) - Disallow bitwise operators
- [no-extra-boolean-cast](../patterns/no-extra-boolean-cast.md) - Disallow unnecessary boolean casts

## Further Reading

- [MDN: Equality Comparisons and Sameness](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Equality_comparisons_and_sameness)
- [TypeScript: Type Assertions](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#type-assertions)
- [JavaScript Type Coercion Explained](https://www.freecodecamp.org/news/js-type-coercion-explained-27ba3d9a2839/)

## Auto-Fix

This rule is not auto-fixable. Replacing implicit coercion requires understanding the intended logic and choosing appropriate explicit conversions.

Use interactive mode to review violations:

```bash
codeforge analyze --rules no-implicit-coercion
```
