# no-eval

![Recommended](https://img.shields.io/badge/-recommended-blue)
![Security](https://img.shields.io/badge/-security-red)

| Property    | Value    |
| ----------- | -------- |
| Category    | patterns |
| Fixable     | No       |
| Recommended | Yes      |
| Deprecated  | No       |

## Description

Disallow the use of `eval()` and its variants. The `eval()` function is a dangerous JavaScript feature that executes arbitrary code from a string, making it a common vector for code injection attacks. This rule also detects related dangerous functions like `Function()` constructor and `setTimeout()`/`setInterval()` with string arguments.

## Why This Rule Matters

Using `eval()` and similar functions is dangerous because:

- **Code injection vulnerability**: Arbitrary code execution from untrusted input
- **Security risks**: Malicious actors can execute harmful code through your application
- **Performance degradation**: `eval()` forces the browser to recompile the code every time
- **Debugging difficulties**: Code executed via `eval()` is harder to debug and trace
- **Optimization barriers**: JavaScript engines cannot optimize code inside `eval()`
- **CSP violations**: Many Content Security Policies explicitly block `eval()`
- **No type safety**: TypeScript cannot provide type checking for code inside `eval()`

### Security Implications

```javascript
// ❌ DANGEROUS: User input executed as code
const userInput = document.getElementById('data').value
eval(userInput) // If user sends "alert(document.cookie)", it executes!

// ❌ DANGEROUS: Function constructor with user input
const userInput = "alert('XSS')"
new Function(userInput)() // Executes arbitrary code!

// ❌ DANGEROUS: setTimeout with string argument
setTimeout("alert('XSS')", 1000) // Executes code!
```

## Dangerous Functions Detected

This rule detects the following dangerous functions:

- `eval()` - Direct code execution
- `Function()` constructor - Creates functions from strings
- `setTimeout()` - When passed a string argument
- `setInterval()` - When passed a string argument
- `execScript()` - IE-specific code execution

## Configuration Options

```json
{
  "rules": {
    "no-eval": [
      "error",
      {
        "allowIndirect": false,
        "allowFunction": false,
        "allowSetTimeout": false
      }
    ]
  }
}
```

| Option            | Type      | Default | Description                                                  |
| ----------------- | --------- | ------- | ------------------------------------------------------------ |
| `allowIndirect`   | `boolean` | `false` | Allow indirect calls like `window.eval` or `globalThis.eval` |
| `allowFunction`   | `boolean` | `false` | Allow the `Function()` constructor                           |
| `allowSetTimeout` | `boolean` | `false` | Allow `setTimeout()`/`setInterval()` with string arguments   |

### allowIndirect Option Usage

Allows indirect eval calls, which run in the global scope rather than the local scope.

```json
{
  "rules": {
    "no-eval": [
      "error",
      {
        "allowIndirect": true
      }
    ]
  }
}
```

### allowFunction Option Usage

Allows the `Function()` constructor (still dangerous, but sometimes used in specific scenarios).

```json
{
  "rules": {
    "no-eval": [
      "error",
      {
        "allowFunction": true
      }
    ]
  }
}
```

### allowSetTimeout Option Usage

Allows `setTimeout()` and `setInterval()` with string arguments.

```json
{
  "rules": {
    "no-eval": [
      "error",
      {
        "allowSetTimeout": true
      }
    ]
  }
}
```

## When to Use This Rule

**Use this rule when:**

- You want to prevent code injection vulnerabilities
- Security is a priority in your application
- You follow security best practices
- You want to comply with strict Content Security Policies
- You want to improve application performance
- You want better debuggability

**Consider disabling when:**

- You're building a code editor or REPL that needs to execute user code
- You're implementing a sandboxed code execution environment
- You're working on a build tool that generates and executes code
- You're implementing dynamic code loading in a trusted environment (with proper security measures)

## Code Examples

### ❌ Incorrect - Using eval()

```typescript
// Direct eval - most dangerous
eval('var x = 10')

// Eval with user input - security vulnerability
const userInput = getFromUser()
eval(userInput)

// Indirect eval - still dangerous
const evil = eval
evil("alert('XSS')")

// Global eval via window
window.eval("console.log('dangerous')")

// Eval in try-catch - still not safe
try {
  eval(maliciousCode)
} catch (e) {
  console.error('But the damage is done')
}
```

```typescript
// Eval with dynamic variable names
const varName = 'user' + id
eval(`var ${varName} = data`)

// Eval with computed property access
const prop = 'name'
eval(`obj.${prop} = 'value'`)
```

### ❌ Incorrect - Using Function Constructor

```typescript
// Function constructor - eval in disguise
const fn = new Function('x', 'return x * 2')
fn(10)

// Function constructor with user input
const userInput = getFromUser()
const fn = new Function(userInput)
fn()

// Function constructor returning dangerous code
const dangerous = new Function('return document.cookie')
```

### ❌ Incorrect - Using setTimeout/setInterval with Strings

```typescript
// setTimeout with string argument
setTimeout("alert('XSS')", 1000)

// setInterval with string argument
setInterval("document.body.style.color = 'red'", 1000)

// With dynamic strings
const code = "alert('" + userInput + "')"
setTimeout(code, 1000)

// Arrow function still safe (but string version is not)
setTimeout(() => console.log('safe'), 1000) // ✅ Safe
setTimeout("console.log('unsafe')", 1000) // ❌ Unsafe
```

### ✅ Correct - Safer Alternatives

```typescript
// Instead of eval with variable names
const varName = 'user' + id
// ❌ eval(`var ${varName} = data`)
// ✅ Use object/map
const variables = {}
variables[varName] = data

// Instead of eval with computed properties
const prop = 'name'
// ❌ eval(`obj.${prop} = 'value'`)
// ✅ Use bracket notation
obj[prop] = 'value'
```

```typescript
// Instead of Function constructor
// ❌ const fn = new Function("x", "return x * 2")
// ✅ Use function declaration/arrow function
const fn = (x: number) => x * 2

// Instead of eval for dynamic function calls
const fnName = 'calculate'
// ❌ eval(`${fnName}()`)
// ✅ Use object/method lookup
const functions = {
  calculate: () => {
    /* ... */
  },
}
functions[fnName]?.()
```

```typescript
// Instead of setTimeout/setInterval with strings
// ❌ setTimeout("alert('XSS')", 1000)
// ✅ Use function reference
setTimeout(() => alert('Safe'), 1000)

// ❌ setInterval("update()", 1000)
// ✅ setInterval(() => update(), 1000)

// Named function reference (even better for debugging)
function showAlert() {
  alert('Safe')
}
setTimeout(showAlert, 1000)
```

### ✅ Correct - JSON Parsing Instead of eval

```typescript
// ❌ Parsing JSON with eval
const jsonString = '{"name":"John","age":30}'
const data = eval('(' + jsonString + ')')

// ✅ Use JSON.parse
const jsonString = '{"name":"John","age":30}'
const data = JSON.parse(jsonString)

// With error handling
function safeParseJSON(json: string): any {
  try {
    return JSON.parse(json)
  } catch (e) {
    console.error('Invalid JSON:', e)
    return null
  }
}
```

### ✅ Correct - Safe Dynamic Function Creation

```typescript
// ❌ Using eval for dynamic functions
const code = 'return x + y'
const fn = eval('(function(x, y) { ' + code + ' })')

// ✅ Using factory function pattern
function createAdder(): (x: number, y: number) => number {
  return (x: number, y: number) => x + y
}

// ✅ Using function registry pattern
const operations = {
  add: (x: number, y: number) => x + y,
  subtract: (x: number, y: number) => x - y,
  multiply: (x: number, y: number) => x * y,
}

function executeOperation(name: string, x: number, y: number): number {
  const op = operations[name as keyof typeof operations]
  if (!op) {
    throw new Error(`Unknown operation: ${name}`)
  }
  return op(x, y)
}
```

## How to Fix Violations

### 1. Replace eval() with Direct Property Access

```diff
- const prop = 'name'
- eval(`obj.${prop} = 'value'`)
+ const prop = 'name'
+ obj[prop] = 'value'
```

### 2. Replace eval() with Object/Map for Dynamic Variables

```diff
- const varName = 'user' + id
- eval(`var ${varName} = data`)
+ const variables = {}
+ const varName = 'user' + id
+ variables[varName] = data
```

### 3. Replace Function Constructor with Function Declaration

```diff
- const fn = new Function("x", "return x * 2")
- fn(10)
+ const fn = (x: number) => x * 2
+ fn(10)
```

### 4. Replace eval() for JSON Parsing

```diff
- const data = eval('(' + jsonString + ')')
+ const data = JSON.parse(jsonString)
```

### 5. Replace setTimeout/setInterval String Arguments with Functions

```diff
- setTimeout("alert('XSS')", 1000)
+ setTimeout(() => alert('Safe'), 1000)
```

```diff
- setInterval("update()", 1000)
+ setInterval(() => update(), 1000)
```

### 6. Replace eval() for Dynamic Function Calls

```diff
- const fnName = 'calculate'
- eval(`${fnName}()`)
+ const functions = {
+   calculate: () => { /* ... */ }
+ }
+ functions[fnName]?.()
```

### 7. Replace eval() for Template Evaluation

```diff
- const template = 'Hello, ${name}!'
- const name = 'World'
- eval('`' + template + '`')
+ const name = 'World'
+ const result = `Hello, ${name}!`
```

## Best Practices

### When Dynamic Code Execution Is Acceptable

Dynamic code execution is acceptable in these specific scenarios:

1. **REPL/Code editors**: Applications that need to execute user-provided code in a sandbox
2. **Build tools**: Tools that generate and execute code during the build process
3. **Test runners**: Testing frameworks that need to execute dynamic test code
4. **Code generation**: Trusted code generation tools (e.g., bundlers, compilers)

**Always use sandboxing:**

```typescript
// If you must use eval, use a sandboxed environment
import { VM } from 'vm2'

const sandbox = {
  console: {
    log: (...args: any[]) => console.log('[Sandboxed]', ...args),
  },
}

const vm = new VM({ sandbox })
vm.run('console.log("Safe execution")')
```

### Prefer Built-in Methods

Instead of eval(), use JavaScript's built-in APIs:

```typescript
// Instead of eval for object property access
const obj = { name: 'John' }
const prop = 'name'
// ❌ eval(`obj.${prop}`)
// ✅ obj[prop]

// Instead of eval for math
const expression = '2 + 2'
// ❌ eval(expression)
// ✅ Use a math expression parser
import { parse, evaluate } from 'some-math-parser'
const result = evaluate(parse(expression))

// Instead of eval for template strings
const template = 'Hello, ${name}!'
const name = 'World'
// ❌ eval('`' + template + '`')
// ✅ Use template literals directly
const result = `Hello, ${name}!`
```

### Use TypeScript for Type Safety

```typescript
// Instead of eval for dynamic property access
const obj = { name: 'John', age: 30 }
const prop = 'name'
// ❌ eval(`obj.${prop}`)
// ✅ Type-safe with keyof
type Obj = typeof obj
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key]
}
const result: string = getProperty(obj, prop)
```

## Common Pitfalls

### False Security with try-catch

```javascript
// ❌ NOT SAFE: try-catch doesn't prevent execution
try {
  eval(maliciousCode) // Still executes before error!
} catch (e) {
  console.error('Too late')
}
```

### Thinking Indirect eval is Safer

```javascript
// ❌ STILL DANGEROUS: Indirect eval executes code in global scope
const fn = window.eval
fn('alert("XSS")')
```

### Dynamic Imports vs eval()

```typescript
// ❌ Using eval for dynamic imports
const moduleName = 'lodash'
eval(`import('${moduleName}').then(...)`)

// ✅ Use dynamic import (TypeScript-safe)
const moduleName = 'lodash'
import(moduleName).then(...)
```

### Misunderstanding setTimeout Safety

```typescript
// ❌ setTimeout with string is eval in disguise
setTimeout("alert('XSS')", 1000)

// ✅ setTimeout with function is safe
setTimeout(() => alert('Safe'), 1000)

// ❌ Dynamic string still dangerous
const code = "alert('" + userInput + "')"
setTimeout(code, 1000)
```

## Related Rules

- [no-implied-eval](../patterns/no-implied-eval.md) - Detect implied eval usage
- [no-script-url](../security/no-script-url.md) - Disallow javascript: URLs
- [no-new-func](../patterns/no-new-func.md) - Disallow Function constructor
- [no-unsafe-eval](../security/no-unsafe-eval.md) - Disallow unsafe eval patterns

## Further Reading

- [MDN: eval()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/eval)
- [OWASP: Code Injection](https://owasp.org/www-community/attacks/Code_Injection)
- [Content Security Policy Level 3](https://www.w3.org/TR/CSP3/)
- [The Dangers of eval() in JavaScript](https://www.acunetix.com/blog/articles/the-dangers-of-eval-in-javascript/)
- [CSP Evaluation Unsafe](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/script-src#unsafe_eval)
- [Never use eval()!](https://stackoverflow.com/questions/12224873/why-is-using-the-javascript-eval-function-a-bad-idea)

## Auto-Fix

This rule is not auto-fixable. Replacing `eval()` and related functions requires understanding the intended logic and choosing the appropriate alternative.

Use interactive mode to review violations:

```bash
codeforge analyze --rules no-eval
```

Manual review is essential because:

1. The context of each eval usage is unique
2. The appropriate alternative depends on the use case
3. Some eval usages might be intentional (e.g., in REPL tools)
4. Automated fixes could introduce subtle bugs
