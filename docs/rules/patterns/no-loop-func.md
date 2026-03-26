# no-loop-func

![Recommended](https://img.shields.io/badge/-recommended-blue)

| Property    | Value    |
| ----------- | -------- |
| Category    | patterns |
| Fixable     | No       |
| Recommended | Yes      |
| Deprecated  | No       |

## Description

Disallow function definitions inside loops. Creating functions inside loops can cause performance issues and unexpected behavior due to closures capturing loop variables. This rule detects function expressions, arrow functions, and function declarations defined within loop bodies.

## Why This Rule Matters

Creating functions inside loops is problematic because:

- **Performance overhead**: A new function object is created on every iteration, causing unnecessary memory allocation and garbage collection pressure
- **Closure traps**: Functions close over loop variables, leading to classic bugs where all callbacks share the same final value
- **Readability issues**: The logic is harder to understand and debug
- **Unexpected behavior**: Developers may not realize each iteration creates a new function
- **Memory leaks**: If functions are stored or bound to event listeners, they won't be garbage collected properly

### Common Bugs

```javascript
// BUG: All callbacks use the LAST value of i
for (let i = 0; i < 5; i++) {
  setTimeout(function () {
    console.log(i) // Logs 5, 5, 5, 5, 5 (if var was used)
  }, 100)
}

// BUG: Functions capturing the same variable reference
for (let i = 0; i < 5; i++) {
  buttons[i].onclick = function () {
    console.log(i) // With let, works correctly. With var, all show 5
  }
}
```

## Loop Types Detected

This rule detects function definitions inside these loop constructs:

- `for` loops
- `for...in` loops
- `for...of` loops
- `while` loops
- `do...while` loops

## Function Types Detected

This rule detects these function definitions inside loops:

- **Function expressions**: `function() { ... }`
- **Arrow functions**: `() => { ... }`
- **Function declarations**: `function name() { ... }`
- **Method definitions**: `{ method() { ... } }` in object literals
- **Generator functions**: `function*() { ... }`
- **Async functions**: `async function() { ... }`
- **Async arrow functions**: `async () => { ... }`

## Configuration Options

```json
{
  "rules": {
    "no-loop-func": [
      "error",
      {
        "allow": ["arrow"]
      }
    ]
  }
}
```

| Option  | Type       | Default | Description                                                      |
| ------- | ---------- | ------- | ---------------------------------------------------------------- |
| `allow` | `string[]` | `[]`    | List of function types to allow (e.g., `["arrow", "generator"]`) |

### allow Option Usage

The `allow` option permits specific function types that are known to be safe:

```json
{
  "rules": {
    "no-loop-func": [
      "error",
      {
        "allow": ["arrow"]
      }
    ]
  }
}
```

With this configuration, arrow functions are allowed but regular function expressions are still detected.

## When to Use This Rule

**Use this rule when:**

- You want to prevent performance issues from creating many function objects
- You want to avoid closure-related bugs with loop variables
- Your team may not be aware of closure variable capture behavior
- You're writing code that runs frequently or in performance-critical contexts
- You want to improve code readability and maintainability

**Consider disabling when:**

- You're using modern JavaScript (`let`/`const`) which avoids closure bugs
- The performance impact is negligible for small loops
- You're intentionally creating closures (e.g., for event handlers)
- The logic requires function-specific per-iteration state

## Code Examples

### ❌ Incorrect - Function Definitions in Loops

```typescript
// Function expression in for loop
for (let i = 0; i < 10; i++) {
  setTimeout(function () {
    console.log(i)
  }, 100 * i)
}
```

```typescript
// Arrow function in for loop
for (const item of items) {
  const handler = () => process(item)
  handlers.push(handler)
}
```

```typescript
// Function declaration in for loop (rare but possible)
for (let i = 0; i < 5; i++) {
  function logIndex() {
    console.log(i)
  }
  logIndex()
}
```

```typescript
// Async arrow function in while loop
while (shouldContinue) {
  await fetch(url).then(async (response) => {
    const data = await response.json()
    process(data)
  })
}
```

```typescript
// Generator function in for loop
for (const x of range) {
  function* generateValues() {
    yield x
  }
}
```

```typescript
// Method definition in for loop (object literal)
for (let i = 0; i < 3; i++) {
  const obj = {
    getValue() {
      return i
    },
  }
  objects.push(obj)
}
```

```typescript
// Multiple functions in same loop
for (let i = 0; i < 100; i++) {
  const validator = (x: number) => x > i
  const transformer = (x: number) => x + i
  pipeline.push({ validate: validator, transform: transformer })
}
```

```typescript
// Nested loops with functions
for (let i = 0; i < 10; i++) {
  for (let j = 0; j < 10; j++) {
    const adder = (x: number) => x + i + j
    results.push(adder(x))
  }
}
```

### ✅ Correct - Define Functions Outside Loops

```typescript
// Define function outside loop, pass values as parameters
function logValue(value: number) {
  console.log(value)
}

for (let i = 0; i < 10; i++) {
  setTimeout(() => logValue(i), 100 * i)
}
```

```typescript
// Pre-define handlers, bind them in loop
function createHandler(item: string) {
  return () => process(item)
}

for (const item of items) {
  handlers.push(createHandler(item))
}
```

```typescript
// Use Array methods instead of loops
items.forEach((item) => {
  process(item)
})

// Or with filter/map/reduce
const processed = items.map((item) => transform(item))
```

```typescript
// For async operations, use for...of with await
for (const item of items) {
  await fetch(url).then((response) => response.json())
}
```

```typescript
// Use loop-friendly patterns
function createValidator(threshold: number) {
  return (value: number) => value > threshold
}

for (let i = 0; i < 100; i++) {
  pipeline.push({
    validate: createValidator(i),
    transform: (x) => x + i,
  })
}
```

### ✅ Correct - Legitimate Loop Functions (with allow)

```json
// Configuration:
{
  "rules": {
    "no-loop-func": [
      "error",
      {
        "allow": ["arrow"]
      }
    ]
  }
}
```

```typescript
// Arrow functions for simple inline operations
// Allowed because they don't create closure traps with let/const
for (const user of users) {
  const mapped = users.map((u) => u.id)
  process(mapped)
}

// Array methods are safe
for (const item of items) {
  const filtered = item.subitems.filter((x) => x.active)
  results.push(filtered)
}
```

```typescript
// Event handlers in modern JS (let/const avoid bugs)
for (let i = 0; i < buttons.length; i++) {
  // Safe: let creates fresh binding each iteration
  buttons[i].addEventListener('click', () => {
    console.log(`Button ${i} clicked`)
  })
}
```

## How to Fix Violations

### 1. Extract Function Outside Loop

```diff
- for (let i = 0; i < 10; i++) {
-   setTimeout(function() {
-     console.log(i)
-   }, 100 * i)
- }
+
+ function logValue(value: number) {
+   console.log(value)
+ }
+
+ for (let i = 0; i < 10; i++) {
+   setTimeout(() => logValue(i), 100 * i)
+ }
```

### 2. Use Factory Function Pattern

```diff
- for (const item of items) {
-   handlers.push(function() {
-     process(item)
-   })
- }
+
+ function createHandler(item: string) {
+   return function() {
+     process(item)
+   }
+ }
+
+ for (const item of items) {
+   handlers.push(createHandler(item))
+ }
```

### 3. Replace Loop with Array Methods

```diff
- const results = []
- for (const item of items) {
-   results.push(transform(item))
- }
+
+ const results = items.map(transform)
```

```diff
- const filtered = []
- for (const item of items) {
-   if (item.active) {
-     filtered.push(item)
-   }
- }
+
+ const filtered = items.filter((item) => item.active)
```

### 4. Use forEach Instead of for Loop

```diff
- for (const user of users) {
-   console.log(user.name)
-   processUser(user)
- }
+
+ users.forEach((user) => {
+   console.log(user.name)
+   processUser(user)
+ })
```

### 5. Handle Event Listeners with Data Attributes

```diff
- for (let i = 0; i < buttons.length; i++) {
-   buttons[i].onclick = function() {
-     handleClick(i)
-   }
- }
+
+ for (let i = 0; i < buttons.length; i++) {
+   buttons[i].dataset.index = String(i)
+   buttons[i].onclick = function() {
+     handleClick(parseInt(this.dataset.index!))
+   }
+ }
```

## Best Practices

### When Loop Functions Are Acceptable

Loop functions are acceptable in these scenarios:

1. **Arrow functions with let/const**: Modern JavaScript avoids closure bugs
2. **Small loops**: Performance impact is negligible for <100 iterations
3. **Array methods**: `forEach`, `map`, `filter`, etc., are designed for this
4. **Unique closure requirements**: When you need per-iteration state capture

Always prefer functional approaches when possible:

```typescript
// Prefer functional style
const results = items
  .filter((item) => item.active)
  .map((item) => transform(item))
  .reduce((acc, item) => ({ ...acc, [item.id]: item }), {})
```

### Performance Considerations

Creating functions in loops can impact performance:

```typescript
// ❌ Bad: Creates 10,000 function objects
for (let i = 0; i < 10000; i++) {
  items.push({
    getValue: () => i,
  })
}

// ✅ Good: Creates 1 function, reuses with parameters
function getValueCreator(base: number) {
  return () => base
}

for (let i = 0; i < 10000; i++) {
  items.push({
    getValue: getValueCreator(i),
  })
}
```

### Use Higher-Order Functions

Instead of inline functions, use reusable higher-order functions:

```typescript
// Create reusable predicate functions
const isGreaterThan = (threshold: number) => (value: number) => value > threshold
const isLessThan = (threshold: number) => (value: number) => value < threshold

// Apply in loops without creating new functions
for (let threshold of thresholds) {
  const filtered = items.filter(isGreaterThan(threshold))
  results.push(filtered)
}
```

## Common Pitfalls

### Closure with var

```javascript
// ❌ BUG: All callbacks log 5
for (var i = 0; i < 5; i++) {
  setTimeout(function () {
    console.log(i)
  }, 100)
}

// ❌ STILL BUG: Arrow doesn't fix var
for (var i = 0; i < 5; i++) {
  setTimeout(() => console.log(i), 100)
}

// ✅ Fixed: Use let or const
for (let i = 0; i < 5; i++) {
  setTimeout(() => console.log(i), 100)
}
```

### Memory Leaks in Event Listeners

```typescript
// ❌ BAD: Functions won't be garbage collected
for (const button of buttons) {
  button.addEventListener('click', () => handleClick())
}

// ✅ GOOD: Keep reference to clean up later
const listeners: Array<() => void> = []

for (const button of buttons) {
  const handler = () => handleClick()
  button.addEventListener('click', handler)
  listeners.push(handler)
}

// Later cleanup
buttons.forEach((button, index) => {
  button.removeEventListener('click', listeners[index])
})
```

### Unexpected Performance Impact

```typescript
// ❌ SLOW: Creating 10,000 functions
for (let i = 0; i < 10000; i++) {
  const processor = (x: number) => x * 2
  results.push(processor(i))
}

// ✅ FAST: Reuse single function
const processor = (x: number) => x * 2

for (let i = 0; i < 10000; i++) {
  results.push(processor(i))
}
```

## Related Rules

- [no-callback-in-promise](../security/no-callback-in-promise.md) - Avoid mixing callbacks and promises
- [no-async-in-loops](../performance/no-async-in-loops.md) - Careful with async operations in loops
- [prefer-for-of](../patterns/prefer-for-of.md) - Prefer for...of over traditional for loops
- [prefer-array-callbacks](../patterns/prefer-array-callbacks.md) - Prefer array methods over loops

## Further Reading

- [MDN: Closures](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures)
- [JavaScript Closure Traps](https://stackoverflow.com/questions/750486/javascript-closure-inside-loops-simple-practical-example)
- [Why Creating Functions in Loops is Bad](https://eslint.org/docs/latest/rules/no-loop-func)
- [JavaScript Performance: Functions and Closures](https://web.dev/fast-async/)

## Auto-Fix

This rule is not auto-fixable. Extracting functions requires understanding the intended logic and may change the behavior.

Use interactive mode to review violations:

```bash
codeforge analyze --rules no-loop-func
```
