# no-caller

![Recommended](https://img.shields.io/badge/-recommended-blue)

| Property    | Value    |
| ----------- | -------- |
| Category    | security |
| Fixable     | No       |
| Recommended | Yes      |
| Deprecated  | No       |

## Description

Disallow use of arguments.caller and arguments.callee. These are non-standard, deprecated, and pose security risks by exposing call stacks.

## Why This Rule Matters

Using arguments.caller and arguments.callee is dangerous because:

- **Security vulnerabilities**: These properties expose the call stack, allowing potential attackers to analyze your code structure
- **Deprecated features**: Both arguments.caller and arguments.callee are non-standard and deprecated in strict mode
- **Performance issues**: Accessing the call stack is expensive and can slow down your application
- **Strict mode incompatibility**: Using these properties throws errors in strict mode
- **Code obfuscation**: These properties make it harder for JavaScript engines to optimize code

### Security Implications

```javascript
// DANGEROUS: Exposes call stack information
function sensitiveOperation() {
  if (arguments.caller) {
    // Attacker can see who called this function
    // May reveal sensitive application logic
  }
}

// DANGEROUS: Recursively calling via callee
function recurse() {
  // This creates security risks and prevents optimization
  arguments.callee()
}
```

## Forbidden Patterns

This rule detects the following patterns:

- `arguments.caller` - Accesses the function that called the current function
- `arguments['caller']` - Computed access to caller property
- `arguments.callee` - References the currently executing function
- `arguments['callee']` - Computed access to callee property

## When to Use This Rule

**Use this rule when:**

- You care about security and want to prevent call stack exposure
- Your codebase uses strict mode
- You want to ensure your code can be optimized by JavaScript engines
- You follow modern JavaScript best practices
- You're writing code for security-sensitive applications

**This rule is always recommended** because there is no legitimate use case for arguments.caller or arguments.callee in modern JavaScript.

## Code Examples

### ❌ Incorrect - Using Forbidden Properties

```typescript
// Accessing arguments.caller exposes call stack
function processData() {
  const caller = arguments.caller
  // This is a security risk!
}
```

```typescript
// Accessing arguments.callee is deprecated
function recurse(count: number) {
  if (count > 0) {
    arguments.callee(count - 1)
  }
  // Should use named function instead
}
```

```typescript
// Computed access is also detected
function insecureFunction() {
  const caller = arguments['caller']
  // Still a security vulnerability
}
```

```typescript
// Using arguments.callee to reference self
const obj = {
  method: function () {
    setTimeout(function () {
      arguments.callee.call(obj)
    }, 100)
  },
}
```

### ✅ Correct - Using Named Functions and Proper Patterns

```typescript
// Use named function for recursion
function recurse(count: number): void {
  if (count > 0) {
    recurse(count - 1)
  }
}
```

```typescript
// Use arrow functions for preserving context
const obj = {
  method: function () {
    setTimeout(() => {
      this.method()
    }, 100)
  },
}
```

```typescript
// Store function reference explicitly
const handler = function () {
  // Do work
  setTimeout(handler, 1000)
}
```

```typescript
// Use .bind() when you need to preserve context
function processData() {
  setTimeout(this.onComplete.bind(this), 100)
}
```

### ✅ Correct - Modern Async Patterns

```typescript
// Use async/await instead of recursion with callee
async function processItems(items: string[]): Promise<void> {
  for (const item of items) {
    await processItem(item)
  }
}

async function processItem(item: string): Promise<void> {
  // Process single item
}
```

```typescript
// Use Promise utilities for recursive patterns
async function retry<T>(fn: () => Promise<T>, retries: number = 3): Promise<T> {
  try {
    return await fn()
  } catch (error) {
    if (retries <= 0) throw error
    return retry(fn, retries - 1)
  }
}
```

## How to Fix Violations

### 1. Replace arguments.callee with Named Functions

```diff
- function recurse(count: number) {
-   if (count > 0) {
-     arguments.callee(count - 1)
-   }
- }
+ function recurse(count: number) {
+   if (count > 0) {
+     recurse(count - 1)
+   }
+ }
```

### 2. Use Arrow Functions to Preserve Context

```diff
- const obj = {
-   method: function () {
-     setTimeout(function () {
-       arguments.callee.call(obj)
-     }, 100)
-   }
- }
+ const obj = {
+   method: function () {
+     setTimeout(() => {
+       this.method()
+     }, 100)
+   }
+ }
```

### 3. Store Function Reference Explicitly

```diff
  function setup() {
-   setTimeout(function () {
-     process(arguments.callee)
-   }, 1000)
+   const handler = function () {
+     process(handler)
+   }
+   setTimeout(handler, 1000)
  }
```

### 4. Use .bind() for Context Preservation

```diff
- const handler = function () {
-   setTimeout(arguments.callee.bind(this), 100)
- }
+ const handler = function () {
+   setTimeout(handler.bind(this), 100)
+ }
```

### 5. Remove arguments.caller Access

```diff
  function validateOperation() {
-   if (arguments.caller && arguments.caller.name === 'dangerous') {
-     throw new Error('Invalid caller')
-   }
+   // Use proper input validation instead
+   if (!isValidOperation()) {
+     throw new Error('Invalid operation')
+   }
  }
```

### 6. Convert Recursion to Iteration

```diff
- function walkTree(node) {
-   if (node) {
-     process(node)
-     arguments.callee(node.left)
-     arguments.callee(node.right)
-   }
- }
+ function walkTree(node) {
+   const stack = [node]
+   while (stack.length > 0) {
+     const current = stack.pop()
+     if (current) {
+       process(current)
+       stack.push(current.left, current.right)
+     }
+   }
+ }
```

## Best Practices

### Prefer Named Functions

Always use named functions when you need to reference the function itself:

```typescript
// Good: Named function can reference itself by name
function factorial(n: number): number {
  return n <= 1 ? 1 : n * factorial(n - 1)
}

// Good: Arrow functions for callbacks
const handler = () => {
  // Handler logic
}
setTimeout(handler, 1000)
```

### Use Modern Async Patterns

Replace recursive patterns with async/await or Promise utilities:

```typescript
// Good: Async/await for sequential processing
async function processFiles(files: string[]): Promise<void> {
  for (const file of files) {
    await processFile(file)
  }
}

// Good: Promise utilities
async function withRetry<T>(fn: () => Promise<T>, options: { maxRetries: number }): Promise<T> {
  let lastError: Error
  for (let i = 0; i < options.maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error
    }
  }
  throw lastError!
}
```

### Avoid Call Stack Inspection

Never rely on inspecting the call stack for logic:

```typescript
// Bad: Checking who called the function
function processPayment() {
  const caller = arguments.caller
  if (caller?.name === 'test') {
    // Allow test bypass
  }
}

// Good: Use proper authorization
function processPayment(user: User) {
  if (!user.canMakePayments()) {
    throw new Error('Unauthorized')
  }
}
```

### Use Strict Mode

Always enable strict mode to catch these errors at development time:

```typescript
'use strict'

// This will throw an error if you try to use arguments.callee
function forbidden() {
  arguments.callee() // TypeError
}
```

## Common Pitfalls

### Accidental arguments Object Usage

```javascript
// ❌ DANGER: Still accessing forbidden properties
function legacyFunc() {
  const args = arguments
  // Later code might access args.caller
  return someInternalLogic(args)
}

// ✅ SAFE: Convert to array or use rest parameters
function modernFunc(...args: unknown[]) {
  return someInternalLogic(args)
}
```

### Library Code Migration

```javascript
// ❌ OLD: Using arguments.callee for recursion
$.fn.plugin = function () {
  return this.each(function () {
    $(this).plugin('action', arguments.callee)
  })
}

// ✅ NEW: Use named function or arrow function
$.fn.plugin = function () {
  const process = (elem: Element) => {
    $(elem).plugin('action', process)
  }
  return this.each(process)
}
```

### Event Handler Patterns

```javascript
// ❌ DANGER: Using callee for recursive event handling
button.addEventListener('click', function handler() {
  if (shouldRetry) {
    setTimeout(function () {
      arguments.callee()
    }, 1000)
  }
})

// ✅ SAFE: Store reference or use arrow function
button.addEventListener('click', function handler() {
  if (shouldRetry) {
    setTimeout(() => {
      handler()
    }, 1000)
  }
})
```

## Related Rules

- [no-eval](../security/no-eval.md) - Disallow eval() for security
- [no-implied-eval](../security/no-implied-eval.md) - Disallow setTimeout/setInterval with string arguments
- [no-new-func](../security/no-new-func.md) - Disallow Function constructor

## Further Reading

- [MDN: arguments.callee](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/arguments/callee)
- [MDN: Strict Mode](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode)
- [Why arguments.callee is deprecated](https://stackoverflow.com/questions/103598/why-was-the-arguments-callee-caller-property-removed-from-es5-strict-mode)
- [JavaScript Optimization Best Practices](https://web.dev/fast/#avoid-modifying-or-extending-built-in-prototypes)

## Auto-Fix

This rule is not auto-fixable. Replacing arguments.caller and arguments.callee requires understanding the intended logic and choosing the appropriate modern pattern.

Use interactive mode to review violations:

```bash
codeforge analyze --rules no-caller
```
