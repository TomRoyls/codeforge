# no-new-wrappers

![Recommended](https://img.shields.io/badge/-recommended-blue)

| Property    | Value    |
| ----------- | -------- |
| Category    | patterns |
| Fixable     | No       |
| Recommended | Yes      |
| Deprecated  | No       |

## Description

Disallow `new String()`, `new Number()`, `new Boolean()`, `new Symbol()`, and `new BigInt()`. These constructors create object wrappers instead of primitives, which can lead to unexpected behavior and type confusion bugs.

## Why This Rule Matters

Using wrapper constructors is dangerous because:

- **Type confusion bugs**: `new String('hello')` is an object, not a string. This breaks type checks and equality comparisons
- **Unexpected behavior**: Objects behave differently from primitives when compared or used in operations
- **Performance overhead**: Creating wrapper objects is slower and consumes more memory than using primitives
- **Confusing debugging**: `typeof new String('x')` returns `'object'`, not `'string'`
- **Breaks APIs**: Many APIs expect primitives and may not handle wrapper objects correctly

### Common Type Confusion Bugs

```javascript
// TYPE ERROR: Object vs primitive
const a = new String('hello')
const b = 'hello'
console.log(a === b) // false! Not equal
console.log(typeof a) // 'object', not 'string'

// TYPE ERROR: Unexpected behavior in conditionals
if (new Boolean(false)) {
  // This executes! The object is truthy even though it wraps false
}

// TYPE ERROR: Breaks algorithms
const set = new Set()
set.add(new String('key'))
set.has('key') // false! The object wrapper is not found
```

## Wrapper Types Detected

This rule detects the following wrapper constructors:

- `new String()` - String object wrapper
- `new Number()` - Number object wrapper
- `new Boolean()` - Boolean object wrapper
- `new Symbol()` - Symbol object wrapper (not constructible, but flagged for consistency)
- `new BigInt()` - BigInt object wrapper (not constructible, but flagged for consistency)

## When to Use This Rule

**Use this rule when:**

- You want to prevent type confusion bugs from wrapper objects
- Your codebase relies on consistent primitive types
- You work with APIs that expect primitives
- You want to improve performance and reduce memory usage
- You prioritize code clarity and predictability

**Consider disabling when:**

- You're working with legacy code that intentionally uses wrapper objects
- You need specific wrapper object methods (rare case)

## Code Examples

### ❌ Incorrect - Using Wrapper Constructors

```typescript
// Creates a String object, not a string primitive
const name = new String('Alice')
console.log(typeof name) // 'object'

// Creates a Number object, not a number primitive
const count = new Number(42)
console.log(typeof count) // 'object'

// Creates a Boolean object, not a boolean primitive
const isValid = new Boolean(true)
console.log(typeof isValid) // 'object'
```

```typescript
// Symbol and BigInt wrappers are not even constructible
const sym = new Symbol('description') // TypeError
const big = new BigInt(123) // TypeError
```

```typescript
// Wrapper objects break equality checks
const a = new String('test')
const b = 'test'
console.log(a === b) // false!
console.log(a == b) // true (due to coercion), but confusing
```

### ✅ Correct - Using Primitives and Literals

```typescript
// Use string literals for strings
const name = 'Alice'
console.log(typeof name) // 'string'

// Use number literals for numbers
const count = 42
console.log(typeof count) // 'number'

// Use boolean literals for booleans
const isValid = true
console.log(typeof isValid) // 'boolean'
```

```typescript
// Use Symbol() function for symbols
const sym = Symbol('description')
console.log(typeof sym) // 'symbol'

// Use BigInt() function for bigints
const big = BigInt(123)
console.log(typeof big) // 'bigint'
```

```typescript
// Wrapper constructor functions (without new) work correctly
const str = String('hello') // Returns primitive string
const num = Number('42') // Returns primitive number
const bool = Boolean('yes') // Returns primitive boolean

console.log(typeof str) // 'string'
console.log(typeof num) // 'number'
console.log(typeof bool) // 'boolean'
```

### ✅ Correct - Using Type Coercion Functions

```typescript
// Convert values to primitives using constructor functions
const fromString = Number('123') // Returns 123 (number)
const fromNumber = String(123) // Returns '123' (string)
const fromBool = Number(true) // Returns 1 (number)

console.log(typeof fromString) // 'number'
console.log(typeof fromNumber) // 'string'
console.log(typeof fromBool) // 'number'
```

## How to Fix Violations

### 1. Replace new String() with String Literal

```diff
- const name = new String('Alice')
+ const name = 'Alice'
```

### 2. Replace new Number() with Number Literal

```diff
- const count = new Number(42)
+ const count = 42
```

### 3. Replace new Boolean() with Boolean Literal

```diff
- const isValid = new Boolean(true)
+ const isValid = true
```

### 4. Replace new Symbol() with Symbol() Function

```diff
- const sym = new Symbol('description')
+ const sym = Symbol('description')
```

### 5. Replace new BigInt() with BigInt() Function

```diff
- const big = new BigInt(123)
+ const big = BigInt(123)
```

### 6. Use Constructor Functions for Conversion

```diff
- const num = new Number(str)
+ const num = Number(str)
```

```diff
- const str = new String(num)
+ const str = String(num)
```

### 7. Fix Conditional Logic

```diff
- if (new Boolean(someValue)) {
+ if (Boolean(someValue)) {
    // This now correctly evaluates based on someValue's truthiness
  }
```

## Best Practices

### Prefer Primitive Types

Always use primitive types instead of wrapper objects:

```typescript
// ✅ Good: Primitives
const text = 'hello'
const amount = 100
const flag = true
const id = Symbol('unique')
const huge = BigInt(9007199254740991)

// ❌ Bad: Wrapper objects
const text = new String('hello')
const amount = new Number(100)
const flag = new Boolean(true)
```

### Use Type Coercion Functions

When converting types, use constructor functions without `new`:

```typescript
// ✅ Good: Constructor functions
const num = Number('42')
const str = String(42)
const bool = Boolean('yes')

// ❌ Bad: Wrapper constructors
const num = new Number('42')
const str = new String(42)
const bool = new Boolean('yes')
```

### Understand Object vs Primitive Behavior

Objects and primitives behave differently:

```typescript
// Objects are always truthy
if (new Boolean(false)) {
  console.log('This executes!')
}

// Primitives have actual boolean values
if (false) {
  console.log('This does not execute')
}
```

```typescript
// Object identity comparison
const a = new String('x')
const b = new String('x')
console.log(a === b) // false! Different objects

// Primitive value comparison
const a = 'x'
const b = 'x'
console.log(a === b) // true! Same value
```

## Common Pitfalls

### Typeof Confusion

```javascript
// ❌ Unexpected: typeof returns 'object'
const wrapper = new String('hello')
console.log(typeof wrapper) // 'object'

// ✅ Expected: typeof returns correct type
const primitive = 'hello'
console.log(typeof primitive) // 'string'
```

### Equality Comparison

```javascript
// ❌ Unexpected: Wrapper objects are not equal to primitives
const wrapper = new String('test')
const primitive = 'test'
console.log(wrapper === primitive) // false

// ✅ Expected: Primitives compare by value
const a = 'test'
const b = 'test'
console.log(a === b) // true
```

### Truthiness

```javascript
// ❌ Unexpected: Objects are always truthy
const wrapper = new Boolean(false)
if (wrapper) {
  console.log('This executes!') // Always runs
}

// ✅ Expected: Primitives have actual boolean values
const primitive = false
if (primitive) {
  console.log('This does not execute')
}
```

### Set and Map Lookups

```javascript
// ❌ Unexpected: Wrapper object not found
const set = new Set()
set.add('key')
console.log(set.has(new String('key'))) // false

// ✅ Expected: Primitive found
const set = new Set()
set.add('key')
console.log(set.has('key')) // true
```

## Related Rules

- [no-implicit-coercion](../patterns/no-implicit-coercion.md) - Disallow implicit type coercion
- [eqeqeq](../patterns/eq-eq-eq.md) - Use strict equality
- [no-extra-boolean-cast](../patterns/no-extra-boolean-cast.md) - Disallow unnecessary boolean casts

## Further Reading

- [MDN: String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
- [MDN: Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)
- [MDN: Boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)
- [MDN: Symbol](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol)
- [MDN: BigInt](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt)
- [Primitive vs Reference Values in JavaScript](https://www.javascripttutorial.net/javascript-primitive-vs-reference-values/)

## Auto-Fix

This rule is not auto-fixable. Replacing wrapper constructors requires understanding whether the code intentionally created an object or should use a primitive.

Use interactive mode to review violations:

```bash
codeforge analyze --rules no-new-wrappers
```
