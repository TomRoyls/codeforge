# no-bitwise

![Recommended](https://img.shields.io/badge/-recommended-blue)

| Property    | Value    |
| ----------- | -------- |
| Category    | patterns |
| Fixable     | No       |
| Recommended | Yes      |
| Deprecated  | No       |

## Description

Disallow bitwise operators (&, |, ^, ~, >>>, etc.). Bitwise operators are often mistaken for logical operators (& vs &&, | vs ||) and can indicate typos. In most JavaScript code, bitwise operations are rarely needed and using them accidentally is a common source of bugs.

## Why This Rule Matters

Using bitwise operators incorrectly is dangerous because:

- **Common typos**: `&` instead of `&&`, `|` instead of `||` are frequent mistakes
- **Silent failures**: Bitwise operations return numbers, not booleans, causing unexpected type coercion
- **Confusing behavior**: Bitwise operators convert operands to 32-bit integers
- **Readability issues**: Most developers don't regularly use bitwise operations
- **Unexpected results**: `1 & 2 === 0` when you might expect `true`

### Common Typos

```javascript
// TYPO: Using & instead of &&
if (isValid & isActive) {
  // This is a bitwise AND!
  // May never execute due to unexpected result
}

// TYPO: Using | instead of ||
if (hasError | isWarning) {
  // This is a bitwise OR!
  // May execute unexpectedly
}
```

## Bitwise Operators Detected

This rule detects the following bitwise operators:

- `&` - Bitwise AND
- `|` - Bitwise OR
- `^` - Bitwise XOR
- `~` - Bitwise NOT
- `<<` - Left shift
- `>>` - Right shift
- `>>>` - Unsigned right shift
- `&=` - Bitwise AND assignment
- `|=` - Bitwise OR assignment
- `^=` - Bitwise XOR assignment
- `<<=` - Left shift assignment
- `>>=` - Right shift assignment
- `>>>=` - Unsigned right shift assignment

## Configuration Options

```json
{
  "rules": {
    "no-bitwise": [
      "error",
      {
        "allow": ["<<", ">>", ">>>"]
      }
    ]
  }
}
```

| Option  | Type       | Default | Description                                               |
| ------- | ---------- | ------- | --------------------------------------------------------- |
| `allow` | `string[]` | `[]`    | List of bitwise operators to allow (e.g., `["<<", ">>"]`) |

### allow Option Usage

The `allow` option permits specific bitwise operators for legitimate use cases like bit manipulation or optimization.

```json
{
  "rules": {
    "no-bitwise": [
      "error",
      {
        "allow": ["<<", ">>", ">>>"]
      }
    ]
  }
}
```

With this configuration, shift operators are allowed but other bitwise operators are still detected.

## When to Use This Rule

**Use this rule when:**

- You want to catch common typos with `&` vs `&&` and `|` vs `||`
- Your codebase doesn't require bit manipulation operations
- You prioritize code readability and maintainability
- You work in a team where not everyone is familiar with bitwise operations

**Consider disabling when:**

- Your codebase specifically requires bit manipulation (e.g., encoding/decoding, hashing)
- You're working on performance-critical code that uses bitwise optimizations
- You're implementing algorithms that require bit-level operations

## Code Examples

### ❌ Incorrect - Using Bitwise Operators

```typescript
// TYPO: Using & instead of &&
if (isValid & isActive) {
  // This is a bitwise AND - returns 0 or 1, not a boolean!
}

// TYPO: Using | instead of ||
if (hasError | isWarning) {
  // This is a bitwise OR - returns a number, not a boolean!
}

// Bitwise NOT can be confusing
const inverted = ~flags
```

```typescript
// Bitwise XOR is rarely needed in application code
const toggle = value ^ 1
```

```typescript
// Bitwise assignment operators
flags |= FLAG_ENABLED
flags &= ~FLAG_DISABLED
```

### ✅ Correct - Using Logical Operators

```typescript
// Use logical AND for boolean operations
if (isValid && isActive) {
  // Correctly evaluates to a boolean
}

// Use logical OR for boolean operations
if (hasError || isWarning) {
  // Correctly evaluates to a boolean
}
```

```typescript
// For toggling, use proper boolean operations
const toggle = !value
```

```typescript
// For flags, consider using Set/Map or proper objects
flags.add(FLAG_ENABLED)
flags.delete(FLAG_DISABLED)
```

### ✅ Correct - Legitimate Bitwise Operations

```json
// Configuration:
{
  "rules": {
    "no-bitwise": [
      "error",
      {
        "allow": ["<<", ">>", ">>>", "&", "|", "^"]
      }
    ]
  }
}
```

```typescript
// Bit manipulation is sometimes necessary
function setBit(value: number, bit: number): number {
  return value | (1 << bit)
}

function clearBit(value: number, bit: number): number {
  return value & ~(1 << bit)
}

function toggleBit(value: number, bit: number): number {
  return value ^ (1 << bit)
}

function hasBit(value: number, bit: number): boolean {
  return (value & (1 << bit)) !== 0
}
```

```typescript
// Color manipulation (common use case)
function rgbToHex(r: number, g: number, b: number): number {
  return (r << 16) | (g << 8) | b
}

function hexToRgb(hex: number): { r: number; g: number; b: number } {
  return {
    r: (hex >> 16) & 0xff,
    g: (hex >> 8) & 0xff,
    b: hex & 0xff,
  }
}
```

## How to Fix Violations

### 1. Replace & with &&

```diff
- if (isValid & isActive) {
+ if (isValid && isActive) {
    // Code here
  }
```

### 2. Replace | with ||

```diff
- if (hasError | isWarning) {
+ if (hasError || isWarning) {
    // Code here
  }
```

### 3. Replace Bitwise Operations with Built-in Methods

```diff
- const hasPermission = permissions & READ_ACCESS
+ const hasPermission = permissions.includes(READ_ACCESS)
```

```diff
- const isPowerOfTwo = (n & (n - 1)) === 0
+ const isPowerOfTwo = Number.isPowerOfTwo?.(n) ?? checkPowerOfTwo(n)
```

### 4. Use Proper Set Operations

```diff
- const combined = flags | newFlags
+ const combined = new Set([...flags, ...newFlags])
```

```diff
- const common = flags & otherFlags
+ const common = new Set([...flags].filter(x => otherFlags.has(x)))
```

### 5. Use Type Guards Instead of Bitwise Checks

```diff
- const isObject = type & TYPE_OBJECT
+ const isObject = type === TYPE_OBJECT
```

## Best Practices

### When Bitwise Operations Are Acceptable

Bitwise operations are acceptable in these scenarios:

1. **Color/Encoding manipulation**: Working with RGB, RGBA values
2. **Bit flags**: Managing compact boolean states
3. **Performance optimization**: Where proven to be faster
4. **Cryptographic operations**: Hashing, encryption algorithms
5. **Binary protocols**: Working with low-level data formats

Always document why bitwise operations are necessary:

```typescript
/**
 * Set bit flags efficiently.
 * Uses bitwise operations because we need compact storage
 * for 32 boolean flags in a single number.
 */
function setFlag(flags: number, flag: number): number {
  return flags | flag
}
```

### Prefer Higher-Level Abstractions

Instead of raw bitwise operations, consider:

```typescript
// Instead of raw bit manipulation:
class BitFlags {
  private flags = 0

  set(flag: number): void {
    this.flags |= flag
  }

  clear(flag: number): void {
    this.flags &= ~flag
  }

  has(flag: number): boolean {
    return (this.flags & flag) !== 0
  }
}
```

## Common Pitfalls

### Type Coversion

```javascript
// ❌ Unexpected: Bitwise AND returns 0 or 1
const result = true & false // returns 0, not false

// ❌ Unexpected: Bitwise OR returns 0 or 1
const result = true | false // returns 1, not true

// ✅ Use logical operators
const result = true && false // returns false
const result = true || false // returns true
```

### Operator Precedence

```javascript
// ❌ Confusing behavior
if (a & (b === 0)) {
  // Evaluated as: a & (b === 0)
  // ...
}

// ✅ Use parentheses for clarity
if ((a & b) === 0) {
  // ...
}
```

## Related Rules

- [eqeqeq](../patterns/eq-eq-eq.md) - Use strict equality
- [no-implicit-coercion](../patterns/no-implicit-coercion.md) - Disallow type coercion
- [no-extra-boolean-cast](../patterns/no-extra-boolean-cast.md) - Disallow unnecessary boolean casts

## Further Reading

- [MDN: Bitwise Operators](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Bitwise_Operators)
- [Bitwise Operators in JavaScript](https://www.youtube.com/watch?v=1f0hz0gKQdI) - Explained clearly
- [When to Use Bitwise Operations](https://stackoverflow.com/questions/337420/why-are-bitwise-operations-useful)

## Auto-Fix

This rule is not auto-fixable. Replacing bitwise operators requires understanding the intended logic.

Use interactive mode to review violations:

```bash
codeforge analyze --rules no-bitwise
```
