# no-implied-eval

![Recommended](https://img.shields.io/badge/-recommended-blue)

| Property    | Value    |
| ----------- | -------- |
| Category    | patterns |
| Fixable     | No       |
| Recommended | Yes      |
| Deprecated  | No       |

## Description

Disallow the use of `setTimeout()`, `setInterval()`, and similar functions with string arguments that behave like `eval()`. Using string arguments with these functions causes the code to be parsed and executed as JavaScript, which is equivalent to using `eval()`. This practice is dangerous, hard to maintain, and can lead to security vulnerabilities.

## Why This Rule Matters

Using implied eval is dangerous because:

- **Security vulnerabilities**: String arguments can execute arbitrary code, leading to XSS attacks
- **Performance impact**: String arguments require runtime parsing, which is slower than function references
- **Maintainability issues**: Code passed as strings loses editor support (autocomplete, refactoring, type checking)
- **Debugging difficulties**: Stack traces show incorrect line numbers when using string arguments
- **Code obfuscation**: Intentional or accidental hiding of logic makes code harder to understand
- **Linting bypass**: Many linters cannot analyze code in string arguments

### Security Risks

```javascript
// ❌ DANGEROUS: User input can be executed
const userInput = 'maliciousCode()'
setTimeout(userInput, 1000)
```

```javascript
// ❌ DANGEROUS: Can lead to XSS attacks
const callback = `document.cookie="${document.cookie}"`
setInterval(callback, 1000)
```

## Implied Eval Patterns Detected

This rule detects the following patterns:

- `setTimeout` with string argument
- `setInterval` with string argument
- `setImmediate` with string argument
- `requestAnimationFrame` with string argument
- Function constructors with string body (when configured)
- `execScript` (IE-specific)

### Functions Checked

- `setTimeout(string, ...args)` - Delayed execution
- `setInterval(string, ...args)` - Repeated execution
- `setImmediate(string, ...args)` - Immediate execution (Node.js)
- `requestAnimationFrame(string)` - Animation callback (non-standard)

## Configuration Options

```json
{
  "rules": {
    "no-implied-eval": [
      "error",
      {
        "allowIndirect": false
      }
    ]
  }
}
```

| Option          | Type    | Default | Description                                        |
| --------------- | ------- | ------- | -------------------------------------------------- |
| `allowIndirect` | boolean | `false` | Allow indirect calls like `window.setTimeout(str)` |

### allowIndirect Option Usage

When `allowIndirect` is `false` (default), all calls to these functions with string arguments are detected, including indirect calls:

```javascript
// ❌ Detected (default)
setTimeout("alert('hello')", 1000)
window.setTimeout("alert('hello')", 1000)
global.setTimeout("alert('hello')", 1000)
```

When `allowIndirect` is `true`, only direct function calls are checked:

```javascript
// ❌ Still detected (direct call)
setTimeout("alert('hello')", 1000)

// ✅ Not detected (indirect call, with allowIndirect: true)
window.setTimeout("alert('hello')", 1000)
```

## When to Use This Rule

**Use this rule when:**

- You want to prevent security vulnerabilities from code injection
- Your codebase should maintain good performance characteristics
- You value code maintainability and debugging capabilities
- You work in a team that relies on editor tooling (autocomplete, refactoring)
- You want to catch accidental use of string arguments

**Consider disabling when:**

- You have a legitimate need for dynamic code execution (very rare)
- You're implementing a JavaScript REPL or interpreter
- You're working with legacy code that cannot be easily refactored

## Code Examples

### ❌ Incorrect - Using String Arguments

```typescript
// setTimeout with string argument
setTimeout("alert('hello')", 1000)

// setInterval with string argument
setInterval('updateCounter()', 1000)

// setImmediate with string argument
setImmediate('processData()')
```

```typescript
// Using template literals (still dangerous)
const code = `updateData(${userId})`
setTimeout(code, 1000)

// Using string concatenation
setTimeout("updateUser('" + userId + "')", 1000)
```

```typescript
// Indirect calls are also detected
window.setTimeout("alert('hello')", 1000)
global.setTimeout('updateData()', 1000)
```

```typescript
// Complex expressions in strings
setTimeout(`document.getElementById('${elementId}').classList.add('active')`, 1000)
```

### ✅ Correct - Using Function References

```typescript
// Pass a function reference to setTimeout
setTimeout(() => alert('hello'), 1000)

// Pass a function reference to setInterval
setInterval(updateCounter, 1000)

// Pass a function reference to setImmediate
setImmediate(processData)
```

```typescript
// Use named functions
function showAlert() {
  alert('hello')
}
setTimeout(showAlert, 1000)
```

```typescript
// Use arrow functions for parameters
const userId = 123
setTimeout(() => updateData(userId), 1000)

// Pass multiple parameters
setTimeout(updateData, 1000, userId, timestamp)
```

```typescript
// Use bound functions
const boundUpdate = updateData.bind(null, userId)
setTimeout(boundUpdate, 1000)
```

### ✅ Correct - Dynamic Function Creation

```typescript
// Create function from string using Function constructor (if truly needed)
const code = 'return a + b'
const adder = new Function('a', 'b', code)
// This is still eval-like, but more explicit

// Better: use proper function
const adder = (a: number, b: number) => a + b
```

```typescript
// For dynamic handlers, use a map of functions
const handlers = {
  update: updateUser,
  delete: deleteUser,
  fetch: fetchData,
}

const handlerName = 'update'
setTimeout(handlers[handlerName], 1000)
```

```typescript
// For conditional logic, use switch/if statements
function executeAction(action: string) {
  switch (action) {
    case 'update':
      updateUser()
      break
    case 'delete':
      deleteUser()
      break
  }
}

setTimeout(() => executeAction('update'), 1000)
```

## How to Fix Violations

### 1. Convert String to Function Reference

```diff
- setTimeout("alert('hello')", 1000)
+ setTimeout(() => alert('hello'), 1000)
```

```diff
- setInterval("updateCounter()", 1000)
+ setInterval(updateCounter, 1000)
```

### 2. Pass Parameters to Function Reference

```diff
- setTimeout("updateData(123)", 1000)
+ setTimeout(() => updateData(123), 1000)

// Or pass additional arguments directly
- setTimeout("updateData(123, 'test')", 1000)
+ setTimeout(updateData, 1000, 123, 'test')
```

### 3. Use Function Map for Dynamic Handlers

```diff
- const handlerName = "updateUser"
- setTimeout(handlerName, 1000)

+ const handlers = {
+   "updateUser": () => updateUser(),
+   "deleteUser": () => deleteUser()
+ }
+ const handlerName = "updateUser"
+ setTimeout(handlers[handlerName], 1000)
```

### 4. Convert Template Literal to Arrow Function

```diff
- setTimeout(`document.getElementById('${id}').remove()`, 1000)

+ setTimeout(() => {
+   const element = document.getElementById(id)
+   element?.remove()
+ }, 1000)
```

### 5. Replace String Concatenation with Proper Parameters

```diff
- setTimeout("updateUser('" + userId + "', '" + name + "')", 1000)

+ setTimeout(() => updateUser(userId, name), 1000)
```

## Best Practices

### Always Prefer Function References

Function references are more efficient, type-safe, and maintainable:

```typescript
// ✅ Good: Function reference
setTimeout(updateUser, 1000)

// ✅ Good: Arrow function with parameters
setTimeout(() => updateUser(userId), 1000)

// ❌ Bad: String argument
setTimeout('updateUser()', 1000)
```

### Use Named Functions for Complex Logic

```typescript
// Define complex logic as a named function
function performCleanup() {
  const elements = document.querySelectorAll('.outdated')
  elements.forEach((el) => el.remove())
  console.log(`Cleaned up ${elements.length} elements`)
}

// Pass the function reference
setTimeout(performCleanup, 1000)
```

### Leverage Type Safety with TypeScript

```typescript
// Define type-safe handlers
type Handler = () => void

const handlers: Record<string, Handler> = {
  fetchData: () => fetchData(),
  updateUI: () => updateUI(),
}

function executeHandler(name: string): void {
  const handler = handlers[name]
  if (handler) {
    setTimeout(handler, 1000)
  }
}
```

### Use Bound Functions for Fixed Context

```typescript
class DataManager {
  private userId: string

  constructor(userId: string) {
    this.userId = userId
  }

  loadData() {
    console.log(`Loading data for ${this.userId}`)
  }

  scheduleLoad() {
    // Bind to preserve 'this' context
    setTimeout(this.loadData.bind(this), 1000)
  }
}
```

## Common Pitfalls

### Incorrect Parameter Passing

```javascript
// ❌ WRONG: String cannot pass parameters
setTimeout('updateData(123)', 1000)

// ✅ RIGHT: Use arrow function to pass parameters
setTimeout(() => updateData(123), 1000)

// ✅ ALSO RIGHT: Pass parameters as additional arguments
setTimeout(updateData, 1000, 123)
```

### This Context Loss

```javascript
// ❌ WRONG: Loses 'this' context
class Component {
  handleClick() {
    console.log(this)
  }

  mount() {
    setTimeout(this.handleClick, 1000) // 'this' is undefined
  }
}

// ✅ RIGHT: Bind the context
class Component {
  handleClick() {
    console.log(this)
  }

  mount() {
    setTimeout(this.handleClick.bind(this), 1000)
  }
}

// ✅ ALSO RIGHT: Use arrow function
class Component {
  handleClick = () => {
    console.log(this)
  }

  mount() {
    setTimeout(this.handleClick, 1000)
  }
}
```

### Dynamic Code Generation

```javascript
// ❌ WRONG: Generating code strings is dangerous
const operations = {
  "add": "a + b",
  "subtract": "a - b"
}

function calculate(op: string, a: number, b: number) {
  const code = `return ${operations[op]}`
  const func = new Function("a", "b", code)
  return func(a, b)
}

// ✅ RIGHT: Use proper functions
const operations = {
  "add": (a: number, b: number) => a + b,
  "subtract": (a: number, b: number) => a - b
}

function calculate(op: string, a: number, b: number) {
  const func = operations[op]
  if (!func) throw new Error(`Unknown operation: ${op}`)
  return func(a, b)
}
```

## Related Rules

- [no-eval](../security/no-eval.md) - Disallow the use of eval()
- [no-new-func](../security/no-new-func.md) - Disallow Function constructors
- [no-script-url](../security/no-script-url.md) - Disallow javascript: URLs
- [no-inline-comments](../patterns/no-inline-comments.md) - Maintain code clarity

## Further Reading

- [MDN: setTimeout()](https://developer.mozilla.org/en-US/docs/Web/API/setTimeout)
- [MDN: Security considerations](https://developer.mozilla.org/en-US/docs/Web/Security)
- [OWASP: Code Injection](https://owasp.org/www-community/attacks/Code_Injection)
- [JavaScript eval: Why it's evil](https://stackoverflow.com/questions/12201070/why-is-using-javascript-eval-function-a-bad-idea)

## Auto-Fix

This rule is not auto-fixable. Replacing string arguments with function references requires understanding the intended logic and parameter passing.

Use interactive mode to review violations:

```bash
codeforge analyze --rules no-implied-eval
```
