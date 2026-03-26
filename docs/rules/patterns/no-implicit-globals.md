# no-implicit-globals

![Recommended](https://img.shields.io/badge/-recommended-blue)

| Property    | Value    |
| ----------- | -------- |
| Category    | patterns |
| Fixable     | Yes      |
| Recommended | Yes      |
| Deprecated  | No       |

## Description

Disallow implicit global variables (variables declared without `var`, `let`, or `const`). Implicit globals are created when assigning to a variable that hasn't been explicitly declared. These variables become properties of the global object and can cause difficult-to-debug issues, especially in larger codebases or when using modules.

## Why This Rule Matters

Implicit global variables are dangerous because:

- **Accidental globals**: Typos or missing declarations create unwanted globals that persist across scopes
- **Leakage**: Globals created in one function can affect unrelated code
- **Hard to debug**: Implicit globals don't show up in standard local variable inspection
- **Module conflicts**: When multiple scripts run, implicit globals can create naming collisions
- **Testing issues**: Implicit globals can make tests interfere with each other
- **Memory leaks**: Implicit globals are never garbage collected
- **ES modules incompatible**: In ES modules, implicit assignments create errors instead of globals

### Common Issues

```javascript
// TYPO: Missing 'const' declaration
function process() {
  counter = 0 // Creates global 'counter'!
  // ...
}

// TYPO: Misspelled variable name
const status = 'active'
statu = 'inactive' // Creates global 'statu'!
```

## Implicit Globals Detected

This rule detects the following patterns:

- Direct assignment to undeclared variable: `x = 1`
- Assignment in nested scopes without declaration
- Implicit globals in functions
- Implicit globals in loops
- Implicit globals in conditional blocks

## Configuration Options

```json
{
  "rules": {
    "no-implicit-globals": [
      "error",
      {
        "allow": ["window", "document", "navigator"]
      }
    ]
  }
}
```

| Option  | Type       | Default | Description                                                             |
| ------- | ---------- | ------- | ----------------------------------------------------------------------- |
| `allow` | `string[]` | `[]`    | List of global variable names to allow (e.g., `["window", "document"]`) |

### allow Option Usage

The `allow` option permits specific global variables that are intentionally used (e.g., browser APIs, environment variables).

```json
{
  "rules": {
    "no-implicit-globals": [
      "error",
      {
        "allow": ["window", "document", "navigator", "localStorage", "sessionStorage"]
      }
    ]
  }
}
```

With this configuration, common browser APIs are allowed but other implicit globals are still detected.

## When to Use This Rule

**Use this rule when:**

- You want to catch accidental global variable creation
- Your codebase uses ES modules or TypeScript
- You work with a team where not everyone is aware of implicit globals
- You run tests in shared environments
- You want to prevent memory leaks from persistent globals
- You prioritize code maintainability and debugging

**Consider disabling when:**

- You're migrating legacy code that heavily relies on implicit globals
- You're working with legacy libraries that intentionally create globals
- You're writing code for a very specific environment (e.g., browser extensions) where explicit declaration patterns are different

## Code Examples

### ❌ Incorrect - Implicit Globals

```typescript
// Missing 'const' keyword
function processData() {
  result = calculateValue() // Creates global 'result'
  return result
}
```

```typescript
// Typo in variable name
const userStatus = 'active'
userStaus = 'inactive' // Creates global 'userStaus'
```

```typescript
// Implicit global in loop
function processItems(items: string[]) {
  for (item of items) {
    // Creates global 'item'
    console.log(item)
  }
}
```

```typescript
// Implicit global in condition
function checkValue(value: number) {
  if (value > 10) {
    isValid = true // Creates global 'isValid'
  }
}
```

```typescript
// Missing declaration in class
class MyClass {
  processData() {
    cache = {} // Creates global 'cache'
  }
}
```

```typescript
// Implicit global in try-catch
function fetchData() {
  try {
    data = await fetch() // Creates global 'data'
  } catch (error) {
    console.error(error)
  }
}
```

### ✅ Correct - Explicit Declarations

```typescript
// Properly declared with 'const'
function processData() {
  const result = calculateValue()
  return result
}
```

```typescript
// Fixed typo
const userStatus = 'active'
const userStaus = 'inactive' // Explicitly declared
```

```typescript
// Proper loop variable declaration
function processItems(items: string[]) {
  for (const item of items) {
    console.log(item)
  }
}
```

```typescript
// Declare variable before conditional
function checkValue(value: number) {
  let isValid = false
  if (value > 10) {
    isValid = true
  }
  return isValid
}
```

```typescript
// Class property
class MyClass {
  private cache = {}

  processData() {
    this.cache = {}
  }
}
```

```typescript
// Proper scoping
async function fetchData() {
  try {
    const data = await fetch()
    return data
  } catch (error) {
    console.error(error)
    throw error
  }
}
```

### ✅ Correct - Allowed Globals

```json
// Configuration:
{
  "rules": {
    "no-implicit-globals": [
      "error",
      {
        "allow": ["window", "document", "navigator", "localStorage"]
      }
    ]
  }
}
```

```typescript
// Browser APIs are allowed
function setup() {
  window.addEventListener('load', () => {
    console.log('Page loaded')
  })

  document.title = 'My App'
  navigator.sendBeacon('/log', 'init')
  localStorage.setItem('visited', 'true')
}
```

```typescript
// Environment variables are allowed
function getConfig() {
  const env = process.env.NODE_ENV
  return env
}
```

## How to Fix Violations

### 1. Add `const` or `let` Declaration

```diff
- function processData() {
-   result = calculateValue()
+ function processData() {
+   const result = calculateValue()
    return result
  }
```

### 2. Fix Typos

```diff
- const userStatus = 'active'
- userStaus = 'inactive'
+ const userStatus = 'active'
+ const userStaus = 'inactive'  // Explicitly declared
```

### 3. Declare Loop Variables

```diff
- for (item of items) {
+ for (const item of items) {
    console.log(item)
  }
```

### 4. Declare Variables Before Conditions

```diff
- function checkValue(value: number) {
-   if (value > 10) {
-     isValid = true
+ function checkValue(value: number) {
+   let isValid = false
+   if (value > 10) {
+     isValid = true
    }
    return isValid
  }
```

### 5. Use Class Properties

```diff
- class MyClass {
-   processData() {
-     cache = {}
+ class MyClass {
+   private cache: Record<string, any> = {}
+
+   processData() {
+     this.cache = {}
    }
  }
```

### 6. Proper Scoping in Try-Catch

```diff
- async function fetchData() {
+ async function fetchData() {
+   let data: any
    try {
-     data = await fetch()
+     data = await fetch()
      return data
    } catch (error) {
      console.error(error)
      throw error
    }
  }
```

## Best Practices

### Use `const` by Default

Always use `const` when the variable doesn't need to be reassigned:

```typescript
// ✅ Good: Use const for immutable values
const API_URL = 'https://api.example.com'
const MAX_RETRIES = 3
const TIMEOUT = 5000
```

### Use `let` for Reassignment

Use `let` only when you need to reassign the variable:

```typescript
// ✅ Good: Use let for reassignment
let counter = 0
for (let i = 0; i < 10; i++) {
  counter += i
}
```

### Avoid Global State

Prefer explicit parameter passing over globals:

```typescript
// ❌ Bad: Global state
let config = {}

function setConfig(c: any) {
  config = c
}

function getConfig() {
  return config
}

// ✅ Good: Explicit parameter passing
function withConfig<T>(config: any, fn: (c: any) => T): T {
  return fn(config)
}
```

### Use TypeScript to Prevent Implicit Globals

TypeScript's `noImplicitAny` and strict mode help catch these issues:

```json
{
  "compilerOptions": {
    "noImplicitAny": true,
    "strict": true
  }
}
```

### Declare Globals Properly

If you need global variables (e.g., for browser APIs), declare them explicitly:

```typescript
// In a .d.ts file
declare global {
  interface Window {
    myCustomGlobal: string
  }
}

// Now you can use it
window.myCustomGlobal = 'value'
```

## Common Pitfalls

### Shadowing Global Variables

```javascript
// ❌ Confusing: Shadowing global 'window'
function processWindow(window: any) {
  window = {}  // Reassigns parameter, not global
}

// ✅ Clear: Use different name
function processWindow(windowData: any) {
  windowData = {}
}
```

### Assuming Block Scope

```javascript
// ❌ Wrong: 'var' is function-scoped, not block-scoped
function process() {
  if (true) {
    var x = 1 // Accessible outside the if block
  }
  console.log(x) // Works (might be unexpected)
}

// ✅ Good: Use 'const' or 'let' for block scope
function process() {
  if (true) {
    const x = 1 // Block-scoped
  }
  console.log(x) // Error: x is not defined
}
```

### Temporal Dead Zone

```javascript
// ❌ Error: Cannot access before declaration
function process() {
  console.log(x) // ReferenceError
  const x = 1
}

// ✅ Good: Declare before use
function process() {
  const x = 1
  console.log(x)
}
```

## Related Rules

- [no-var](../patterns/no-var.md) - Disallow var, use const/let instead
- [no-undef](../patterns/no-undef.md) - Disallow the use of undeclared variables
- [no-implicit-coercion](../patterns/no-implicit-coercion.md) - Disallow type coercion
- [prefer-const](../patterns/prefer-const.md) - Prefer const over let

## Further Reading

- [MDN: var](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/var)
- [MDN: let](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/let)
- [MDN: const](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/const)
- [Understanding Scope in JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Grammar_and_types#Declarations)
- [ES Modules vs Global Variables](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)

## Auto-Fix

This rule is auto-fixable. The auto-fix will:

1. Add `const` before simple assignments where the value is not reassigned
2. Add `let` before assignments where the value might be reassigned
3. Preserve existing comments and formatting

To apply automatic fixes:

```bash
codeforge analyze --fix --rules no-implicit-globals
```

For a dry-run preview:

```bash
codeforge analyze --fix --dry-run --rules no-implicit-globals
```

**Note**: The auto-fix may not always choose between `const` and `let` correctly. Always review the changes before committing.
