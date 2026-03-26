# no-compare-neg-zero

![Recommended](https://img.shields.io/badge/-recommended-blue)

| Property    | Value    |
| ----------- | -------- |
| Category    | patterns |
| Fixable     | No       |
| Recommended | Yes      |
| Deprecated  | No       |

## Description

Disallow comparisons to negative zero (`-0`). In JavaScript and TypeScript, regular zero (`0`) and negative zero (`-0`) are considered equal in standard comparisons, but using negative zero explicitly in comparisons is confusing and often indicates a mistake or misunderstanding of JavaScript's zero semantics.

## Why This Rule Matters

Comparing to negative zero is problematic because:

- **Confusing behavior**: `0 === -0` returns `true`, but `Object.is(0, -0)` returns `false`
- **Unintended usage**: Most developers don't need negative zero comparisons in application code
- **Code clarity**: Using `-0` in comparisons is rare and surprising to readers
- **Potential bugs**: Misunderstanding zero semantics can lead to unexpected logic errors
- **Inconsistent comparisons**: Standard equality checks don't distinguish between `0` and `-0`

### The Zero Confusion

```javascript
// These are confusingly equivalent
0 === -0 // true
0 == -0 // true
0 < -0 // false
0 > -0 // false

// Only Object.is can distinguish them
Object.is(0, -0) // false
Object.is(-0, -0) // true
```

## Comparison Patterns Detected

This rule detects the following comparison patterns with `-0`:

- `x === -0` - Strict equality comparison
- `x !== -0` - Strict inequality comparison
- `x == -0` - Loose equality comparison
- `x != -0` - Loose inequality comparison
- `x < -0` - Less than comparison
- `x <= -0` - Less than or equal comparison
- `x > -0` - Greater than comparison
- `x >= -0` - Greater than or equal comparison
- `-0 === x` - Strict equality (reversed)
- `-0 !== x` - Strict inequality (reversed)
- `-0 == x` - Loose equality (reversed)
- `-0 != x` - Loose inequality (reversed)
- `-0 < x` - Less than (reversed)
- `-0 <= x` - Less than or equal (reversed)
- `-0 > x` - Greater than (reversed)
- `-0 >= x` - Greater than or equal (reversed)

## Configuration Options

```json
{
  "rules": {
    "no-compare-neg-zero": [
      "error",
      {
        "allowObjectIs": false
      }
    ]
  }
}
```

| Option          | Type    | Default | Description                                  |
| --------------- | ------- | ------- | -------------------------------------------- |
| `allowObjectIs` | boolean | `false` | Allow `Object.is(x, -0)` for explicit checks |

### allowObjectIs Option Usage

The `allowObjectIs` option permits explicit negative zero checks using `Object.is()`, which is the only way to distinguish between `0` and `-0` in JavaScript.

```json
{
  "rules": {
    "no-compare-neg-zero": [
      "error",
      {
        "allowObjectIs": true
      }
    ]
  }
}
```

With this configuration, you can use `Object.is()` to explicitly check for negative zero when needed (e.g., in mathematical operations where sign preservation matters).

## When to Use This Rule

**Use this rule when:**

- You want to catch confusing comparisons with negative zero
- Your codebase doesn't require sign-preserving zero semantics
- You prioritize code clarity and reduce confusion about zero comparisons
- You work with developers who may not understand JavaScript's zero behavior

**Consider disabling when:**

- Your codebase specifically requires distinguishing between `0` and `-0`
- You're implementing mathematical algorithms that depend on signed zeros
- You're working with floating-point operations where sign preservation is critical
- You're implementing serialization/deserialization that preserves zero sign

## Code Examples

### ❌ Incorrect - Comparing to Negative Zero

```typescript
// STRICT EQUALITY - Confusing because 0 === -0
if (value === -0) {
  // This comparison is misleading
  // Both 0 and -0 will pass this check
}

if (value !== -0) {
  // This won't distinguish 0 from -0
}

// LOOSE EQUALITY - Also confusing
if (value == -0) {
  // Type coercion with -0 is unnecessary
}

// INEQUALITY COMPARISONS - Always evaluate to false for regular zeros
if (value < -0) {
  // This will never be true for regular zero values
}

if (value > -0) {
  // This will never be true for regular zero values
}

// REVERSED COMPARISONS - Same issues
if (-0 === value) {
  // Just as confusing as the forward comparison
}

if (-0 < value) {
  // Rarely makes sense
}
```

### ✅ Correct - Use Regular Zero

```typescript
// Use regular zero for comparison
if (value === 0) {
  // Clear and unambiguous
}

if (value !== 0) {
  // Clear and unambiguous
}

// Use standard zero for inequality
if (value < 0) {
  // Clear: value is negative
}

if (value > 0) {
  // Clear: value is positive
}

if (value >= 0) {
  // Clear: value is non-negative
}

if (value <= 0) {
  // Clear: value is non-positive
}
```

### ✅ Correct - Explicit Negative Zero Check (when needed)

```json
// Configuration:
{
  "rules": {
    "no-compare-neg-zero": [
      "error",
      {
        "allowObjectIs": true
      }
    ]
  }
}
```

```typescript
// Use Object.is() when you explicitly need to check for negative zero
if (Object.is(value, -0)) {
  // Explicitly checking for negative zero
  // Only -0 will pass this check, not regular 0
}

// When you need to distinguish between 0 and -0
function serializeNumber(value: number): string {
  if (Object.is(value, -0)) {
    return '-0'
  }
  return String(value)
}

// In mathematical operations where zero sign matters
function preserveSign(value: number): number {
  if (Object.is(value, -0)) {
    return -0
  }
  return value
}
```

### ✅ Correct - Avoid Zero Ambiguity

```typescript
// Use explicit checks for different cases
function formatNumber(value: number): string {
  if (value > 0) {
    return `Positive: ${value}`
  }
  if (value < 0) {
    return `Negative: ${value}`
  }
  // Handle zero case separately
  return 'Zero'
}

// Use type guards for more precise checks
function isPositiveZero(value: number): boolean {
  return value === 0 && 1 / value === Infinity
}

function isNegativeZero(value: number): boolean {
  return value === 0 && 1 / value === -Infinity
}

// Use these for explicit zero type checking
if (isPositiveZero(value)) {
  // Handle positive zero
} else if (isNegativeZero(value)) {
  // Handle negative zero
}
```

## How to Fix Violations

### 1. Replace -0 with 0

```diff
- if (value === -0) {
+ if (value === 0) {
    // Handle zero case
  }
```

### 2. Use Explicit Checks for Negative Zero

```diff
- if (value === -0) {
+ if (Object.is(value, -0)) {
    // Handle negative zero explicitly
  }
```

### 3. Remove Redundant Checks

```diff
- if (value >= -0 && value <= 0) {
+ if (value >= 0 && value <= 0) {
    // Just check against regular zero
  }
```

### 4. Use Proper Inequality Operators

```diff
- if (value > -0) {
+ if (value > 0) {
    // Check for positive values
  }

- if (value < -0) {
+ if (value < 0) {
    // Check for negative values
  }
```

### 5. Simplify Zero Range Checks

```diff
- if (value >= -0 && value <= 0) {
+ if (value === 0) {
    // Simplified zero check
  }
```

## Best Practices

### When Negative Zero is Acceptable

Negative zero distinctions are acceptable in these scenarios:

1. **Mathematical operations**: Sign preservation in calculations
2. **Serialization/deserialization**: Maintaining zero sign in data formats
3. **Floating-point algorithms**: Precision-critical computations
4. **Scientific computing**: Direction-aware calculations

Always document why negative zero is necessary:

```typescript
/**
 * Serializes a number, preserving the sign of zero.
 * Uses Object.is() because some data formats distinguish
 * between 0 and -0 for direction/flow representation.
 */
function serializeWithSign(value: number): string {
  if (Object.is(value, -0)) {
    return '-0'
  }
  return String(value)
}
```

### Prefer Explicit Zero Type Guards

Instead of relying on `-0` comparisons, create helper functions:

```typescript
// Helper functions for zero type checking
const isPositiveZero = (value: number): boolean => {
  return value === 0 && 1 / value === Infinity
}

const isNegativeZero = (value: number): boolean => {
  return value === 0 && 1 / value === -Infinity
}

const isZero = (value: number): boolean => {
  return value === 0 && !isNegativeZero(value)
}

// Use in code
function handleNumber(value: number) {
  if (isPositiveZero(value)) {
    console.log('Positive zero')
  } else if (isNegativeZero(value)) {
    console.log('Negative zero')
  } else if (value > 0) {
    console.log('Positive number')
  } else {
    console.log('Negative number')
  }
}
```

## Common Pitfalls

### Confusion About Zero Equality

```javascript
// ❌ Misunderstanding: Trying to distinguish 0 and -0
if (value === -0) {
  // This won't work as expected!
  // Both 0 and -0 will pass this check
}

// ❌ Misunderstanding: Using inequality to distinguish
if (value < -0 || value > -0) {
  // This won't distinguish either
  // Both 0 and -0 evaluate as equal
}

// ✅ Use Object.is() when you need to distinguish
if (Object.is(value, -0)) {
  // Only -0 will pass this check
}
```

### Division by Zero Trick

```javascript
// ❌ Common trick that's confusing
if (value === 0 && 1 / value === -Infinity) {
  // This works but is hard to understand
}

// ✅ Extract to a well-named function
function isNegativeZero(value: number): boolean {
  return value === 0 && 1 / value === -Infinity
}

if (isNegativeZero(value)) {
  // Much clearer intent
}
```

### Implicit Sign Operations

```javascript
// ❌ Confusing: Implicit sign from operations
function getSign(value: number): number {
  return value >= -0 ? 1 : -1
  // What does -0 mean here?
}

// ✅ Be explicit about intent
function getSign(value: number): number {
  if (value > 0) return 1
  if (value < 0) return -1
  return 0
}
```

## Related Rules

- [eqeqeq](../patterns/eq-eq-eq.md) - Use strict equality
- [no-implicit-coercion](../patterns/no-implicit-coercion.md) - Disallow type coercion
- [no-compare-nan](../patterns/no-compare-nan.md) - Disallow comparisons with NaN

## Further Reading

- [MDN: Signed Zero](https://en.wikipedia.org/wiki/Signed_zero)
- [MDN: Object.is()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is)
- [JavaScript's Two Zeros](https://2ality.com/2012/03/signedzero.html)
- [IEEE 754: Signed Zero](https://en.wikipedia.org/wiki/Signed_zero)

## Auto-Fix

This rule is not auto-fixable. The fix depends on the intent of the comparison:

- Replace `-0` with `0` for standard comparisons
- Use `Object.is(x, -0)` if negative zero distinction is needed
- Remove unnecessary comparisons entirely

Use interactive mode to review violations:

```bash
codeforge analyze --rules no-compare-neg-zero
```
