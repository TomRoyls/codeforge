# no-multi-assign

![Recommended](https://img.shields.io/badge/-recommended-blue)

| Property    | Value    |
| ----------- | -------- |
| Category    | patterns |
| Fixable     | No       |
| Recommended | Yes      |
| Deprecated  | No       |

## Description

Disallow multiple assignments in a single statement. Chained assignments like `a = b = c = 5` can be confusing and may lead to unexpected behavior. It's clearer to assign each variable separately to make the intent explicit.

## Why This Rule Matters

Using chained assignments creates confusing code because:

- **Ambiguous evaluation order**: In `a = b = c = 5`, it's not immediately clear that all variables get the same value
- **Type confusion**: When variables have different types, the result can be unexpected
- **Readability suffers**: Multiple assignments in one line are harder to read and understand
- **Debugging difficulties**: When something goes wrong, it's harder to trace which assignment caused the issue
- **Side effects**: If one of the expressions has side effects, they may not execute as expected
- **Common bug pattern**: Developers often expect different behavior than what actually happens

### Common Issues

```javascript
// ISSUE: Chained assignment can be confusing
a = b = c = 5
// All three variables become 5, but is this obvious?

// ISSUE: Different types cause unexpected results
let a: string
let b: number
let c: boolean
a = b = c = true
// All three become boolean, which might not be intended

// ISSUE: Side effects don't work as expected
let i = 0
const values = []
while (i < 3) {
  values[i] = i += 1
}
// This doesn't work as most people expect
```

## When to Use This Rule

**Use this rule when:**

- You want to prevent confusing chained assignments
- Your codebase prioritizes code clarity and maintainability
- You work in a team where explicit code is preferred
- You want to catch potential type-related bugs
- You care about code readability and debuggability

**Consider disabling when:**

- You intentionally need chained assignments for optimization (very rare)
- You're working with legacy code that heavily uses this pattern
- You're in a code golf or minification context (not production code)

## Code Examples

### ❌ Incorrect - Chained Assignments

```typescript
// Simple chained assignment
a = b = c = 5
```

```typescript
// Chained assignment with different types
let x: string
let y: number
let z: boolean
x = y = z = true
```

```typescript
// Chained assignment in initialization
const a = (b = c = [])
```

```typescript
// Chained assignment in function
function initialize() {
  return (x = y = z = 0)
}
```

```typescript
// Complex chained assignment
obj.prop = obj2.prop = obj3.prop = value
```

```typescript
// Chained assignment with side effects
let i = 0
const arr = []
arr[i] = i += 1
```

### ✅ Correct - Separate Assignments

```typescript
// Assign each variable separately
a = 5
b = 5
c = 5
```

```typescript
// Assign with explicit types
const c = true
const b = Number(c)
const a = String(b)
```

```typescript
// Initialize each variable separately
const c = []
const b = c
const a = b
```

```typescript
// Function with separate assignments
function initialize() {
  x = 0
  y = 0
  z = 0
  return z
}
```

```typescript
// Assign properties separately
obj3.prop = value
obj2.prop = obj3.prop
obj.prop = obj2.prop
```

```typescript
// Handle side effects explicitly
let i = 0
const arr = []
arr[i] = i + 1
i += 1
```

### ✅ Correct - Using Destructuring for Related Values

```typescript
// Use destructuring for related assignments
const [a, b, c] = [5, 5, 5]
```

```typescript
// Destructure with same value
const { x, y, z } = { x: 0, y: 0, z: 0 }
```

```typescript
// Destructure from function return
const { prop1, prop2, prop3 } = getProps()
```

### ✅ Correct - Using Helper Functions

```typescript
// Helper function to set multiple values
function setAllTo(value: number): number {
  return value
}

const a = setAllTo(5)
const b = setAllTo(5)
const c = setAllTo(5)
```

```typescript
// Helper to initialize multiple variables
function initializeZero(): number {
  return 0
}

const x = initializeZero()
const y = initializeZero()
const z = initializeZero()
```

## How to Fix Violations

### 1. Separate Chained Assignments

```diff
- a = b = c = 5
+ a = 5
+ b = 5
+ c = 5
```

### 2. Use Destructuring for Related Values

```diff
- a = b = c = 5
+ const [a, b, c] = [5, 5, 5]
```

### 3. Fix Type Issues

```diff
- a = b = c = true
+ const c = true
+ const b = Number(c)
+ const a = String(b)
```

### 4. Separate Side Effects

```diff
- arr[i] = i += 1
+ arr[i] = i + 1
+ i += 1
```

### 5. Handle Object Properties Separately

```diff
- obj.prop = obj2.prop = obj3.prop = value
+ obj3.prop = value
+ obj2.prop = obj3.prop
+ obj.prop = obj2.prop
```

### 6. Use Explicit Returns

```diff
- return x = y = z = 0
+ x = 0
+ y = 0
+ z = 0
+ return z
```

### 7. Initialize Constants Separately

```diff
- const a = b = c = []
+ const c = []
+ const b = c
+ const a = b
```

## Best Practices

### Be Explicit About Assignments

Always make it clear what you're assigning:

```typescript
// ✅ Explicit: Clear intent
a = 5
b = 5
c = 5

// ❌ Implicit: Unclear intent
a = b = c = 5
```

### Use Meaningful Variable Names

When assigning related values, use names that make the relationship clear:

```typescript
// ✅ Good: Clear relationship
const defaultTimeout = 5000
const retryTimeout = 5000
const connectionTimeout = 5000

// ❌ Bad: No context
a = b = c = 5000
```

### Prefer Destructuring for Related Values

When multiple variables should have the same initial value, use destructuring:

```typescript
// ✅ Good: Destructuring shows intent
const [x, y, z] = [0, 0, 0]

// ❌ Bad: Chained assignment
x = y = z = 0
```

### Avoid Side Effects in Assignments

Keep assignments simple and avoid combining them with operations:

```typescript
// ✅ Good: Separate concerns
let index = 0
arr[index] = value
index += 1

// ❌ Bad: Side effect in assignment
arr[index] = index += 1
```

### Use Helper Functions for Complex Initialization

When initializing multiple related variables, use a helper function:

```typescript
// ✅ Good: Clear initialization function
function createInitialState() {
  return { count: 0, value: '', flag: false }
}

const state1 = createInitialState()
const state2 = createInitialState()
const state3 = createInitialState()

// ❌ Bad: Chained assignment
const state1 = (state2 = state3 = createInitialState())
```

## Common Pitfalls

### Type Coercion Issues

```javascript
// ❌ Unexpected: All become boolean
let a: string
let b: number
let c: boolean
a = b = c = true

// ✅ Correct: Explicit conversions
const c = true
const b = Number(c)
const a = String(b)
```

### Reference vs Value

```javascript
// ❌ Unexpected: All point to same array reference
const a = (b = c = [])
a.push(1)
console.log(b) // [1]
console.log(c) // [1]

// ✅ Correct: Separate arrays
const c = []
const b = [...c]
const a = [...b]
```

### Side Effects in Chained Assignment

```javascript
// ❌ Unexpected: Increment happens after assignment
let i = 0
const arr = []
arr[i] = i += 1
console.log(arr) // [undefined]

// ✅ Correct: Separate operations
let i = 0
const arr = []
arr[i] = i + 1
i += 1
console.log(arr) // [1]
```

### Mutable Object References

```javascript
// ❌ Unexpected: Changes to one affect all
const obj1 = (obj2 = obj3 = { count: 0 })
obj1.count = 5
console.log(obj2.count) // 5
console.log(obj3.count) // 5

// ✅ Correct: Separate objects
const obj3 = { count: 0 }
const obj2 = { ...obj3 }
const obj1 = { ...obj2 }
```

### Chained Assignment in Return

```javascript
// ❌ Confusing: Assignment in return
function initialize() {
  return (x = y = z = 0)
}

// ✅ Clear: Assign then return
function initialize() {
  x = 0
  y = 0
  z = 0
  return z
}
```

## Related Rules

- [no-return-assign](../patterns/no-return-assign.md) - Disallow assignment in return statements
- [no-assign-in-expression](../patterns/no-assign-in-expression.md) - Disallow assignment in expressions
- [no-sequences](../patterns/no-sequences.md) - Disallow comma operator sequences
- [prefer-const](../patterns/prefer-const.md) - Prefer const declarations

## Further Reading

- [MDN: Assignment Operators](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Assignment_operators)
- [JavaScript Evaluation Order](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Operator_Precedence)
- [Clean Code: Assignment and Mutation](https://blog.cleancoder.com/uncle-bob/2017/03/03/TheLittlePrimer.html)
- [ESLint: no-multi-assign](https://eslint.org/docs/latest/rules/no-multi-assign)

## Auto-Fix

This rule is not auto-fixable. Converting chained assignments to separate assignments requires understanding the intent and context. For example, `a = b = c = 5` could mean:

1. All three should be the same value (most common)
2. All three should reference the same object (rare)
3. A specific evaluation order is required (side effects)

Use interactive mode to review violations:

```bash
codeforge analyze --rules no-multi-assign
```
