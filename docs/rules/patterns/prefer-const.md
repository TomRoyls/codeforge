# prefer-const

![Recommended](https://img.shields.io/badge/-recommended-blue)

| Property    | Value    |
| ----------- | -------- |
| Category    | patterns |
| Fixable     | Yes      |
| Recommended | Yes      |
| Deprecated  | No       |

## Description

Require const declarations for variables that are never reassigned. Using const makes code more predictable and signals intent more clearly. Variables declared with let or var that are never modified after declaration should use const to make their immutability explicit.

## Why This Rule Matters

Using const for variables that are never reassigned is important because:

- **Code clarity**: const clearly signals that a variable won't change, making code easier to understand
- **Prevent bugs**: Accidental reassignments are caught by the TypeScript/JavaScript compiler
- **Better performance**: Engines can optimize const variables more aggressively
- **Intent signaling**: Shows other developers that this value is meant to be immutable
- **Predictability**: Reduces cognitive load when reading code by eliminating mutation concerns

### Common Benefits

```javascript
// Clear intent - this value won't change
const MAX_ITEMS = 100

// Prevent accidental mutations
const API_BASE = 'https://api.example.com'
// API_BASE = 'https://other.com' // TypeScript error!
```

## Detection Logic

This rule detects variables that:

1. Are declared with `let` or `var`
2. Are never reassigned in their scope
3. Are never modified with update operators (`++`, `--`)
4. Don't appear on the left side of assignment expressions

### What Gets Detected

```javascript
// let with no reassignments
let name = 'John'

// var with no reassignments
var count = 0

// Destructuring with let (when options allow)
let { a, b } = data
```

### What Doesn't Get Detected

```javascript
// const is already correct
const PI = 3.14159

// let with reassignment
let counter = 0
counter++

// let with assignment
let total = 0
total = calculateTotal()

// Update expressions
let index = 0
index++
```

## Configuration Options

```json
{
  "rules": {
    "prefer-const": [
      "warn",
      {
        "destructuring": "any",
        "ignoreReadBeforeAssign": false,
        "ignoreDestructuring": false
      }
    ]
  }
}
```

| Option                   | Type      | Default | Description                                               |
| ------------------------ | --------- | ------- | --------------------------------------------------------- |
| `destructuring`          | `string`  | `any`   | `"all"` or `"any"` - when to check destructuring patterns |
| `ignoreReadBeforeAssign` | `boolean` | `false` | Ignore variables read before being assigned               |
| `ignoreDestructuring`    | `boolean` | `false` | Ignore destructuring patterns entirely                    |

### destructuring Option

Controls when destructuring patterns are checked:

- `any`: Report if any destructured property is not reassigned (default)
- `all`: Report only if all destructured properties are not reassigned

```javascript
// With "destructuring": "any"
let { a, b } = data // Reports if either a or b is not reassigned

// With "destructuring": "all"
let { a, b } = data // Reports only if both a and b are not reassigned
```

### ignoreReadBeforeAssign Option

When true, ignores variables that are read before being assigned. This is useful for patterns where a variable is declared, read, then assigned:

```javascript
let value
console.log(value)
value = 10 // Not flagged with ignoreReadBeforeAssign: true
```

### ignoreDestructuring Option

When true, completely ignores destructuring patterns:

```json
{
  "prefer-const": ["warn", { "ignoreDestructuring": true }]
}
```

```javascript
// Not flagged with ignoreDestructuring: true
let { name, age } = getUser()
```

## When to Use This Rule

**Use this rule when:**

- You want to enforce immutability where possible
- You're working in a TypeScript project where type safety is important
- You want to catch potential bugs from accidental mutations
- You want to make code intent clearer and more explicit
- You're building libraries or modules where APIs should be stable

**Consider disabling when:**

- You're working with code that intentionally uses mutable patterns
- You're in the middle of a refactoring where variables will be reassigned
- You're writing performance-critical code where let is necessary
- You're working with code that requires initialization before assignment

## Code Examples

### ❌ Incorrect - Using let Without Reassignment

```typescript
// Variable declared with let but never reassigned
let maxItems = 100
console.log(maxItems)

// Variable declared with var but never reassigned
var apiKey = 'secret-key'
fetch(apiKey)

// Destructuring with let - properties not reassigned
let { name, age } = user
console.log(name, age)
```

```typescript
// Multiple declarations in one statement
let a = 1,
  b = 2,
  c = 3
console.log(a, b, c)
```

```typescript
// For loop variable - not reassigned after declaration
let i = 0
for (i = 0; i < 10; i++) {
  console.log(i)
}
// i is not reassigned after the loop ends
```

### ✅ Correct - Using const for Immutability

```typescript
// Use const for variables that don't change
const maxItems = 100
console.log(maxItems)

const apiKey = 'secret-key'
fetch(apiKey)

// Use const with destructuring when not reassigned
const { name, age } = user
console.log(name, age)
```

```typescript
// Multiple const declarations
const a = 1
const b = 2
const c = 3
console.log(a, b, c)
```

```typescript
// For loop - let is appropriate when reassigned
for (let i = 0; i < 10; i++) {
  console.log(i)
}
```

### ✅ Correct - Using let When Reassignment is Needed

```typescript
// Counter that needs to be incremented
let counter = 0
counter++

// Accumulator that gets updated
let total = 0
total = calculateTotal()

// Flag that can change state
let isActive = false
isActive = checkStatus()
```

```typescript
// Conditional assignment
let value
if (condition) {
  value = 'yes'
} else {
  value = 'no'
}
```

```typescript
// Loop with reassignment
let items = []
for (const item of data) {
  items.push(item)
}
```

### ✅ Correct - Destructuring with Reassignment

```typescript
// Destructured properties that get reassigned
let { count, total } = stats
count++
total = calculateNewTotal()
```

```typescript
// Only some properties reassigned
let { name, age } = user
age = user.age + 1 // Only age is reassigned
```

## How to Fix Violations

### 1. Replace let with const

```diff
- let maxItems = 100
+ const maxItems = 100
```

### 2. Replace var with const

```diff
- var apiKey = 'secret-key'
+ const apiKey = 'secret-key'
```

### 3. Fix Destructuring Patterns

```diff
- let { name, age } = user
+ const { name, age } = user
```

### 4. Fix Multiple Declarations

```diff
- let a = 1, b = 2, c = 3
+ const a = 1
+ const b = 2
+ const c = 3
```

### 5. Consider let for Reassignment

If you need reassignment, keep the variable as let but ensure it's actually used:

```typescript
// ❌ Don't fix if reassignment is needed
let counter = 0
counter++

// ✅ But make sure reassignment is intentional and documented
// Counter tracks active connections
let counter = 0
counter++
```

## Best Practices

### When to Use const

Use const in these scenarios:

1. **Configuration values**: Constants that don't change
2. **Mathematical constants**: PI, conversion factors, etc.
3. **API endpoints**: URLs that shouldn't change
4. **Function references**: When storing function references
5. **Immutable data**: Data that should not be mutated

```typescript
const CONFIG = {
  apiUrl: 'https://api.example.com',
  timeout: 5000,
  retries: 3,
}

const toRadians = (degrees: number) => (degrees * Math.PI) / 180
```

### When to Use let

Use let when:

1. **Loop counters**: Variables that change in loops
2. **Accumulators**: Running totals or collections
3. **Conditional initialization**: Variables assigned conditionally
4. **State management**: Values that represent mutable state
5. **Counters and flags**: Values that track or signal changes

```typescript
// Loop counter
for (let i = 0; i < 10; i++) {
  // i is reassigned each iteration
}

// Accumulator
let total = 0
for (const num of numbers) {
  total += num
}

// Conditional initialization
let result
if (condition) {
  result = 'yes'
} else {
  result = 'no'
}
```

### Document Intent

When using let, document why mutability is needed:

```typescript
// Counter must be mutable to track active requests
let activeRequests = 0
activeRequests++
```

### Use Default Values

Prefer default values over let when possible:

```typescript
// ❌ Unnecessary let
let name = user.name || 'Anonymous'

// ✅ Use const with default value
const name = user.name || 'Anonymous'

// ❌ Unnecessary let
let config = options || {}

// ✅ Use const with default value
const config = options || {}
```

## Common Pitfalls

### Forgetting Destructuring

```javascript
// ❌ Forgetting that destructured variables can be reassigned
let { x, y } = point
x = 10 // This is reassigned, so let is correct

// ✅ Check if any property is reassigned
let { x, y } = point
// If neither x nor y is reassigned, use const
const { x, y } = point
```

### Initialization Before Assignment

```javascript
// ❌ This pattern may trigger the rule
let value
// value is read later
value = 10

// ✅ Use ignoreReadBeforeAssign option
let value
value = 10
```

### Loop Variables

```javascript
// ❌ Loop variable after loop ends
let i = 0
for (i = 0; i < 10; i++) {
  console.log(i)
}
// i is not reassigned after the loop

// ✅ Let is still appropriate here because i was reassigned in the loop
let i = 0
for (i = 0; i < 10; i++) {
  console.log(i)
}
```

## Related Rules

- [no-var](../patterns/no-var.md) - Require let or const instead of var
- [no-const-assign](../patterns/no-const-assign.md) - Disallow reassigning const variables
- [prefer-const](../patterns/prefer-const.md) - Require const for variables that are not reassigned
- [no-param-reassign](../patterns/no-param-reassign.md) - Disallow reassigning function parameters

## Further Reading

- [MDN: const](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/const)
- [MDN: let](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/let)
- [Exploring JavaScript's const keyword](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/const#differences_between_var_and_letconst)
- [Understanding Immutability in JavaScript](https://www.freecodecamp.org/news/immutability-in-javascript/)

## Auto-Fix

This rule is auto-fixable. The fix replaces `let` or `var` with `const` when the variable is never reassigned.

Apply fixes automatically:

```bash
codeforge analyze --fix --rules prefer-const

# Or in interactive mode
codeforge interactive
```

**Note**: The auto-fix respects the rule configuration options. Destructuring patterns are handled according to the `destructuring` option, and patterns with `ignoreReadBeforeAssign` or `ignoreDestructuring` are not fixed.
