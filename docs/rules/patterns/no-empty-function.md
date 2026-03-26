# no-empty-function

![Recommended](https://img.shields.io/badge/-recommended-blue)

| Property    | Value    |
| ----------- | -------- |
| Category    | patterns |
| Fixable     | No       |
| Recommended | Yes      |
| Deprecated  | No       |

## Description

Disallow empty function bodies. Empty functions indicate missing implementation, placeholder code, or logic that should be removed or properly implemented. While there are rare cases where empty functions are intentional (e.g., polymorphism overrides), they often signal incomplete or incorrect code.

## Why This Rule Matters

Empty functions are problematic because:

- **Missing logic**: Functions with no body often indicate incomplete implementation
- **Silent failures**: Callbacks that do nothing can hide errors or unexpected behavior
- **Debugging difficulty**: Empty functions make it harder to trace execution flow
- **Code smell**: Suggests placeholder code that was never completed
- **Dead code**: May indicate functions that should be removed entirely
- **Maintenance burden**: Confuses developers about intended behavior

### Common Scenarios

```typescript
// PLACEHOLDER: Function with TODO comment
function processData(data: string): void {
  // TODO: implement later
}

// OVERRIDE: Empty override of parent method
class Child extends Parent {
  override doSomething(): void {
    // Empty override - why?
  }
}

// CALLBACK: Empty event handler
button.onClick(() => {
  // Do nothing - is this intentional?
})

// PROMISE: Empty promise handler
fetch(url).then(() => {
  // Empty then handler - what happens on success?
})
```

## Empty Function Detection

This rule detects empty function bodies in various contexts:

- Function declarations
- Function expressions
- Arrow functions
- Method declarations
- Constructor bodies
- Getter/setter methods
- Callback functions
- Promise handlers (then/catch/finally)
- Event handlers

## Configuration Options

```json
{
  "rules": {
    "no-empty-function": [
      "error",
      {
        "allow": ["arrow-functions", "catch-clause"],
        "ignoreComments": true
      }
    ]
  }
}
```

| Option           | Type       | Default | Description                                                    |
| ---------------- | ---------- | ------- | -------------------------------------------------------------- |
| `allow`          | `string[]` | `[]`    | Function types to allow (e.g., `["arrow-functions", "catch"]`) |
| `ignoreComments` | `boolean`  | `false` | Ignore empty functions if they contain only comments           |

### allow Option Usage

The `allow` option permits specific function types where empty functions might be acceptable.

```json
{
  "rules": {
    "no-empty-function": [
      "error",
      {
        "allow": ["arrow-functions", "catch-clause"]
      }
    ]
  }
}
```

With this configuration, empty arrow functions and catch clause handlers are allowed but other empty functions are still detected.

### ignoreComments Option Usage

When `ignoreComments` is set to `true`, functions that contain only comments are not flagged.

```json
{
  "rules": {
    "no-empty-function": [
      "error",
      {
        "ignoreComments": true
      }
    ]
  }
}
```

## When to Use This Rule

**Use this rule when:**

- You want to catch incomplete implementations
- Your codebase should not have placeholder functions
- You want to improve code quality and maintainability
- You work in a team where empty functions indicate bugs

**Consider disabling when:**

- You have legitimate use cases for empty polymorphic overrides
- You're using empty functions as no-op callbacks intentionally
- Your framework requires empty function implementations

## Code Examples

### ❌ Incorrect - Empty Functions

```typescript
// Empty function declaration
function processData(data: string): void {}

// Empty method
class MyClass {
  handleClick(): void {}
}

// Empty constructor
class MyClass {
  constructor() {}
}

// Empty callback
button.onClick(() => {})

// Empty promise handler
fetch(url).then(() => {})

// Empty catch handler
try {
  doSomething()
} catch (error) {}
```

```typescript
// Empty arrow function
const noop = () => {}

// Empty async function
async function fetchData(): Promise<void> {}

// Empty setter
class MyClass {
  private _value: number = 0
  set value(v: number) {}
}
```

### ✅ Correct - Functions with Implementation

```typescript
// Function with implementation
function processData(data: string): void {
  console.log('Processing:', data)
}

// Method with implementation
class MyClass {
  handleClick(): void {
    this.logClick()
  }

  private logClick(): void {
    console.log('Button clicked')
  }
}

// Constructor with implementation
class MyClass {
  private value: number
  constructor(initialValue: number) {
    this.value = initialValue
  }
}

// Callback with implementation
button.onClick(() => {
  console.log('Button was clicked')
})

// Promise handler with implementation
fetch(url).then((response) => {
  console.log('Request succeeded:', response.status)
})

// Catch handler with implementation
try {
  doSomething()
} catch (error) {
  console.error('Error occurred:', error)
}
```

### ✅ Correct - Legitimate Empty Functions (with allow option)

```json
// Configuration:
{
  "rules": {
    "no-empty-function": [
      "error",
      {
        "allow": ["arrow-functions", "catch-clause"]
      }
    ]
  }
}
```

```typescript
// Empty arrow function allowed (e.g., no-op callback)
const noop = () => {}

// Empty catch clause allowed (intentionally suppress errors)
try {
  doSomething()
} catch (error) {
  // Intentionally suppress errors
}

// Empty override for polymorphic behavior
class Child extends Parent {
  override doSomething(): void {
    // Parent implementation is sufficient
    // Empty override to mark as handled
  }
}
```

```typescript
// Empty function with ignoreComments: true
function processData(data: string): void {
  // TODO: Implement this later
}
```

## How to Fix Violations

### 1. Implement the Function Body

```diff
- function processData(data: string): void {
+ function processData(data: string): void {
+   console.log('Processing:', data)
+ }
```

### 2. Remove Unused Functions

```diff
- function unusedFunction(): void {
- }
```

### 3. Add Comment and Configure Allow List

```diff
- function doNothing(): void {
- }

+ // Configuration: { "allow": ["arrow-functions"] }
+ const doNothing = () => {
+   // Intentional no-op
+ }
```

### 4. Throw Error in Abstract Methods

```diff
- abstract class Base {
-   abstract process(): void
- }

+ abstract class Base {
+   process(): void {
+     throw new Error('Method not implemented')
+   }
+ }
```

### 5. Implement Proper Error Handling

```diff
- try {
-   doSomething()
- } catch (error) {
- }

+ try {
+   doSomething()
+ } catch (error) {
+   console.error('Operation failed:', error)
+   throw error // Re-throw or handle
+ }
```

### 6. Add Meaningful Default Behavior

```diff
- class Component {
-   onMount(): void {
-   }
+   class Component {
+   onMount(): void {
+     console.log('Component mounted')
+   }
+ }
```

### 7. Use Default Parameter Instead of Empty Function

```diff
- function execute(callback: () => void): void {
-   callback()
- }

- execute(() => {
- })

+ function execute(callback: () => void = () => console.log('Default callback')): void {
+   callback()
+ }
```

## Best Practices

### When Empty Functions Are Acceptable

Empty functions are acceptable in these scenarios:

1. **Polymorphic overrides**: When parent implementation is sufficient
2. **No-op callbacks**: When you explicitly want no action
3. **Interface compliance**: When implementing required methods
4. **Error suppression**: When intentionally handling errors silently

Always document why empty functions are necessary:

```typescript
/**
 * Empty override because parent implementation is sufficient.
 * Override exists to mark this class as handling the method.
 */
class Child extends Parent {
  override doSomething(): void {
    // Parent implementation is sufficient
  }
}

/**
 * No-op callback used when we want to ignore certain events.
 */
const noop = () => {
  // Intentionally do nothing
}
```

### Prefer Explicit Intent Over Empty Bodies

Instead of empty functions, consider:

```typescript
// ❌ Empty function
function handleEvent(): void {}

// ✅ Explicit placeholder
function handleEvent(): void {
  throw new Error('Not implemented')
}

// ❌ Empty callback
button.onClick(() => {})

// ✅ Explicit no-op callback
button.onClick(noop)

// Declare the no-op function once
const noop = () => {
  // Intentional no-op
}
```

### Use Comments with ignoreComments Option

If you need to allow empty functions with comments, enable the option:

```json
{
  "rules": {
    "no-empty-function": [
      "error",
      {
        "ignoreComments": true
      }
    ]
  }
}
```

```typescript
// This is allowed because it has a comment
function processData(data: string): void {
  // TODO: Implement this in the next sprint
}
```

## Common Pitfalls

### Placeholder Code

```typescript
// ❌ Bad: Empty function with TODO comment
function processData(data: string): void {
  // TODO: implement
}

// ✅ Better: Throw error to catch usage
function processData(data: string): void {
  throw new Error('processData is not implemented yet')
}

// ✅ Or create a stub implementation
function processData(data: string): void {
  console.warn('processData called but not fully implemented')
}
```

### Empty Error Handlers

```typescript
// ❌ Bad: Silent error handling
try {
  riskyOperation()
} catch (error) {
  // Empty - hides errors
}

// ✅ Better: At least log the error
try {
  riskyOperation()
} catch (error) {
  console.error('Operation failed:', error)
}

// ✅ Or use typed error handling
try {
  riskyOperation()
} catch (error) {
  // Intentionally ignore specific errors
  if (error instanceof IgnorableError) {
    return
  }
  throw error
}
```

### Empty Overrides

```typescript
// ❌ Bad: Why is this empty?
class Child extends Parent {
  override init(): void {}
}

// ✅ Better: Explain why
class Child extends Parent {
  override init(): void {
    // Parent initialization is sufficient
    // Override exists to mark initialization as handled
    super.init()
  }
}
```

### Empty Promise Handlers

```typescript
// ❌ Bad: What happens on success?
fetch(url).then(() => {})

// ✅ Better: Handle or comment
fetch(url)
  .then(() => {
    // Successfully fetched, no action needed
  })
  .catch((error) => {
    console.error('Fetch failed:', error)
  })
```

## Related Rules

- [no-unused-vars](../patterns/no-unused-vars.md) - Detect unused variables
- [no-console](../patterns/no-console.md) - Disallow console statements
- [prefer-const](../patterns/prefer-const.md) - Prefer const over let
- [no-throw-literal](../patterns/no-throw-literal.md) - Throw Error objects only

## Further Reading

- [MDN: Functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions)
- [Clean Code: Empty Functions](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-code.html)
- [When to Use Empty Functions](https://stackoverflow.com/questions/6607748/is-it-bad-practice-to-have-empty-functions)

## Auto-Fix

This rule is not auto-fixable. Fixing empty functions requires understanding the intended behavior and context.

Use interactive mode to review violations:

```bash
codeforge analyze --rules no-empty-function
```
