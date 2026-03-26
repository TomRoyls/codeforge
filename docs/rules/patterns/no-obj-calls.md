# no-obj-calls

![Recommended](https://img.shields.io/badge/-recommended-blue)

| Property    | Value    |
| ----------- | -------- |
| Category    | patterns |
| Fixable     | Yes      |
| Recommended | Yes      |
| Deprecated  | No       |

## Description

Disallow calling global object constructors without the `new` keyword. Using constructors like `Object()`, `String()`, `Number()`, `Boolean()`, `Symbol()`, and `BigInt()` as regular functions (without `new`) is confusing and error-prone. These constructors behave differently when called as functions vs. when called with `new`.

## Why This Rule Matters

Calling object constructors without `new` is dangerous because:

- **Unexpected behavior**: Different semantics when called as function vs. constructor
- **Type coercion**: Functions perform type conversion instead of creating objects
- **Confusing code**: Difficult to distinguish intended behavior
- **Performance overhead**: Unnecessary type conversion operations
- **Subtle bugs**: `Object(null)` returns an object, but `new Object(null)` returns an empty object

### Common Confusion

```javascript
// CONFUSING: String() as function - converts to string
const str = String(123) // "123" - type conversion

// CONFUSING: new String() - creates String object
const obj = new String(123) // String {"123"} - object wrapper

// CONFUSING: These are NOT the same!
str === obj // false!
```

## Object Constructors Detected

This rule detects calls to the following constructors without `new`:

- `Object()` - Returns object from primitive or returns empty object for null/undefined
- `String()` - Converts value to primitive string
- `Number()` - Converts value to primitive number
- `Boolean()` - Converts value to primitive boolean
- `Symbol()` - Returns a new symbol (requires `new` throws error)
- `BigInt()` - Converts value to bigint

### Special Cases

`Symbol()` and `BigInt()` cannot be called with `new` - they throw a TypeError. This rule detects their usage to prevent the common mistake of trying to instantiate them with `new`.

## Configuration Options

```json
{
  "rules": {
    "no-obj-calls": [
      "error",
      {
        "allow": ["Number", "String"]
      }
    ]
  }
}
```

| Option  | Type       | Default | Description                                      |
| ------- | ---------- | ------- | ------------------------------------------------ |
| `allow` | `string[]` | `[]`    | List of constructor names to allow without `new` |

### allow Option Usage

The `allow` option permits specific constructors to be called without `new` for legitimate use cases like type conversion.

```json
{
  "rules": {
    "no-obj-calls": [
      "error",
      {
        "allow": ["Number", "String"]
      }
    ]
  }
}
```

With this configuration, `Number()` and `String()` are allowed but other object calls are still detected.

## When to Use This Rule

**Use this rule when:**

- You want to prevent confusing constructor behavior
- Your codebase doesn't need type conversion via constructors
- You prefer explicit type conversion methods
- You want to catch potential bugs from unexpected object wrapper creation

**Consider disabling when:**

- You deliberately use `Number()`, `String()` or `Boolean()` for type conversion
- You need `Object()` for creating objects from primitives
- Your codebase has specific use cases for these patterns

## Code Examples

### ❌ Incorrect - Calling Constructors Without `new`

```typescript
// CONFUSING: Object() called as function
const obj = Object({ key: 'value' })
// Creates object but behaves differently than new Object()

// CONFUSING: String() called as function (type conversion)
const str = String(42)
// Returns "42" (primitive), not String object

// CONFUSING: Number() called as function (type conversion)
const num = Number('123')
// Returns 123 (primitive), not Number object

// CONFUSING: Boolean() called as function (type conversion)
const bool = Boolean(1)
// Returns true (primitive), not Boolean object

// ERROR: Symbol() with new always throws
const sym = new Symbol('desc')
// TypeError: Symbol is not a constructor

// ERROR: BigInt() with new always throws
const big = new BigInt(123)
// TypeError: BigInt is not a constructor
```

```typescript
// Using Object() for object creation is confusing
const emptyObj = Object()
// Returns {} but not clear from code

const fromNull = Object(null)
// Returns {} - surprising behavior!
```

```typescript
// Type coercion with constructors is unclear
const parsed = Number(input.value)
// Could be parseInt, Number(), or unary plus - ambiguous
```

### ✅ Correct - Using Proper Constructors

```typescript
// Use new keyword for object creation
const obj = new Object({ key: 'value' })
// Clear intent: creating a new object

// Or use object literal (preferred)
const obj2 = { key: 'value' }
// Most common and readable approach
```

```typescript
// Use new keyword for wrapper objects
const strObj = new String('hello')
const numObj = new Number(42)
const boolObj = new Boolean(true)
// Clear intent: creating wrapper objects

// Or use primitive values directly (preferred)
const str = 'hello'
const num = 42
const bool = true
```

```typescript
// Symbol and BigInt cannot be called with new
const sym = Symbol('description')
const big = BigInt(123)
// Correct: no new keyword
```

### ✅ Correct - Type Conversion with Built-in Methods

```typescript
// Use explicit type conversion methods
const str = String(input.value) // Allowed if configured
const num = Number(input.value) // Allowed if configured
const bool = Boolean(input.value) // Allowed if configured

// Or use more explicit alternatives
const str = input.value.toString()
const num = parseInt(input.value, 10)
const bool = !!input.value
```

```typescript
// Use Object() for creating objects from primitives (if configured)
const fromPrimitive = Object(42)
// Returns Number {42} - wrapper object

const fromNull = Object(null)
// Returns {} - empty object
```

### ✅ Correct - Preferred Alternatives

```typescript
// Use object literals instead of Object()
const empty = {}
const withProps = { key: 'value' }
const fromVar = { ...source }

// Use primitive values directly
const text = 'hello'
const count = 42
const flag = true

// Use wrapper objects only when necessary
const stringObj = new String('text')
const numberObj = new Number(42)

// Use Symbol() and BigInt() without new
const sym = Symbol('id')
const big = BigInt(9007199254740991)
```

## How to Fix Violations

### 1. Add `new` to Constructor Calls

```diff
- const obj = Object({ key: 'value' })
+ const obj = new Object({ key: 'value' })
```

```diff
- const str = String('hello')
+ const str = new String('hello')
```

```diff
- const num = Number(42)
+ const num = new Number(42)
```

### 2. Use Object Literals Instead of `new Object()`

```diff
- const obj = new Object({ key: 'value' })
+ const obj = { key: 'value' }
```

```diff
- const empty = new Object()
+ const empty = {}
```

### 3. Use Primitive Values Instead of Wrapper Objects

```diff
- const str = new String('hello')
+ const str = 'hello'
```

```diff
- const num = new Number(42)
+ const num = 42
```

```diff
- const bool = new Boolean(true)
+ const bool = true
```

### 4. Use Explicit Type Conversion Methods

```diff
- const str = String(value)
+ const str = value.toString()
```

```diff
- const num = Number(value)
+ const num = parseInt(value, 10)
+ // or parseFloat(value)
```

```diff
- const bool = Boolean(value)
+ const bool = !!value
+ // or Boolean(value) if configured to allow
```

### 5. Remove `new` from `Symbol()` and `BigInt()` Calls

```diff
- const sym = new Symbol('description')
+ const sym = Symbol('description')
```

```diff
- const big = new BigInt(123)
+ const big = BigInt(123)
```

## Best Practices

### Prefer Primitives Over Wrapper Objects

JavaScript wrapper objects are rarely needed and can cause unexpected behavior:

```typescript
// ❌ Avoid: Wrapper object
const str = new String('text')

// ✅ Prefer: Primitive string
const str = 'text'

// Wrapper objects have surprising behavior
typeof new String('text') // "object" - not "string"!
new String('text') === 'text' // false - different references!

// Primitives behave as expected
typeof 'text' // "string"
'text' === 'text' // true
```

### Use Object Literals for Object Creation

Object literals are more concise and readable:

```typescript
// ❌ Verbose
const obj = new Object()
obj.key = 'value'

// ✅ Concise
const obj = { key: 'value' }

// ✅ With spread operator
const obj2 = { ...source, newKey: 'value' }
```

### Use Type Conversion Methods Judiciously

When type conversion is needed, use the most appropriate method:

```typescript
// Number conversion
Number(input) // General conversion
parseInt(input, 10) // Parse integer
parseFloat(input) + // Parse float
  input // Unary plus (compact)

// String conversion
String(input) // General conversion
input.toString() // Method call
String(input) // Explicit conversion

// Boolean conversion
Boolean(input) // Explicit
!!input // Double negation (idiomatic)
```

### When Wrapper Objects Are Necessary

Wrapper objects are only needed in specific cases:

```typescript
// When adding properties to primitives
const str = new String('text')
str.customProp = 'value' // This works

// When using specific String/Number methods on primitives
// Use temporary wrapper or call method on primitive
const substr = 'hello'.substring(1, 3) // Works on primitive
```

## Common Pitfalls

### Type Confusion

```javascript
// ❌ Confusing: String() returns primitive
const str = String(42)
typeof str // "string"

// ❌ Confusing: new String() returns object
const strObj = new String(42)
typeof strObj // "object"

// ❌ They are NOT equal
str === strObj // false!
```

### Object() Edge Cases

```javascript
// ❌ Surprising: Object(null) returns empty object
const obj1 = Object(null)
console.log(obj1) // {}

// ❌ Surprising: Object(undefined) returns empty object
const obj2 = Object(undefined)
console.log(obj2) // {}

// ❌ Expected: Object(primitive) returns wrapper
const obj3 = Object(42)
console.log(obj3) // Number {42}
```

### Symbol() and BigInt() Cannot Use `new`

```javascript
// ❌ ERROR: Symbol is not a constructor
const sym = new Symbol('desc')
// TypeError: Symbol is not a constructor

// ✅ Correct: No new keyword
const sym = Symbol('desc')

// ❌ ERROR: BigInt is not a constructor
const big = new BigInt(123)
// TypeError: BigInt is not a constructor

// ✅ Correct: No new keyword
const big = BigInt(123)
```

### Performance Implications

```javascript
// ❌ Slower: Creating wrapper objects
const str = new String('text')
const num = new Number(42)

// ✅ Faster: Using primitives
const str = 'text'
const num = 42

// Wrapper objects require additional memory and GC overhead
```

## Related Rules

- [no-new-wrappers](../patterns/no-new-wrappers.md) - Disallow `new` operators with wrapper objects
- [no-implicit-coercion](../patterns/no-implicit-coercion.md) - Disallow shorthand type conversions
- [eqeqeq](../patterns/eq-eq-eq.md) - Use strict equality (important when comparing primitives vs wrappers)

## Further Reading

- [MDN: Object() constructor](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/Object)
- [MDN: String() constructor](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/String)
- [MDN: Number() constructor](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/Number)
- [MDN: Boolean() constructor](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean/Boolean)
- [Primitives vs Objects](https://javascript.info/primitives-methods) - Understanding the difference
- [Wrapper Objects in JavaScript](https://2ality.com/2011/04/javascript-object-vs-object.html)

## Auto-Fix

This rule is auto-fixable for simple cases.

The auto-fix will:

- Add `new` keyword to constructor calls (if not `Symbol` or `BigInt`)
- Replace `new Object()` with object literals when appropriate
- Remove `new` from `Symbol()` and `BigInt()` calls

Use interactive mode to review fixes:

```bash
codeforge analyze --rules no-obj-calls
```

Apply fixes automatically:

```bash
codeforge fix --rules no-obj-calls
```
