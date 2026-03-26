# no-eval

![Recommended](https://img.shields.io/badge/-recommended-blue)
![Fixable](https://img.shields.io/badge/-fixable-green)

| Property    | Value    |
| ----------- | -------- |
| Category    | security |
| Fixable     | Yes      |
| Recommended | Yes      |
| Deprecated  | No       |

## Description

Disallow use of `eval()` and similar dangerous functions. These functions can execute arbitrary code strings, which poses serious security risks and can lead to code injection vulnerabilities. They also make code harder to optimize and debug.

## Why This Rule Matters

Using `eval()` and similar functions is dangerous because:

- **Security vulnerability**: Arbitrary code execution enables injection attacks
- **Performance impact**: Evaluated code cannot be optimized by the JavaScript engine
- **Debugging difficulty**: Evaluated code doesn't show up in stack traces
- **Maintenance issues**: Hard to understand what code will be executed

### Dangerous Functions

- `eval()` - Executes code from a string
- `Function()` constructor - Creates functions from strings
- `setTimeout()` / `setInterval()` with string arguments - Equivalent to eval
- `setImmediate()` with string arguments - Equivalent to eval
- `execScript()` (IE) - Legacy eval equivalent

## Configuration Options

```json
{
  "rules": {
    "no-eval": [
      "error",
      {
        "allowIndirect": false,
        "allowWith": false
      }
    ]
  }
}
```

| Option          | Type      | Default | Description                                     |
| --------------- | --------- | ------- | ----------------------------------------------- |
| `allowIndirect` | `boolean` | `false` | Allow indirect eval calls (e.g., `global.eval`) |
| `allowWith`     | `boolean` | `false` | Allow `with` statements (deprecated feature)    |

## When to Use This Rule

**Always use this rule** - there are virtually no valid use cases for `eval()` in modern JavaScript.

**Consider `allowIndirect` when:**

- Working with legacy code that uses indirect eval patterns
- Implementing sandboxed evaluation environments (rare, requires expertise)

## Code Examples

### ❌ Incorrect - Using eval()

```typescript
// Direct eval - extremely dangerous
function calculate(expression: string) {
  return eval(expression) // Code injection vulnerability!
}

// User input: "__proto__.constructor='alert(1)'" // Executes arbitrary code
```

```typescript
// Function constructor - equivalent to eval
const result = new Function('a', 'b', 'return a + b')(x, y)
```

```typescript
// setTimeout with string - equivalent to eval
setTimeout('console.log("Hello")', 1000) // Vulnerable!
```

```typescript
// With statement - deprecated and dangerous
with (obj) {
  eval('prop = value') // Can access obj properties
}
```

### ✅ Correct - Safe Alternatives

```typescript
// Use mathematical expressions instead of eval
function calculate(a: number, b: number): number {
  return a + b
}

// Call the function directly
calculate(x, y)
```

```typescript
// Use Function.call() or Function.apply() for dynamic function calls
const func = window[functionName]
func.call(null, arg1, arg2)
```

```typescript
// Use setTimeout with a function reference
setTimeout(() => {
  console.log('Hello')
}, 1000)
```

```typescript
// Use object property access safely
function getProperty(obj: Record<string, unknown>, prop: string): unknown {
  return obj[prop]
}
```

```typescript
// For parsing JSON, use JSON.parse()
const data = JSON.parse(jsonString)
```

```typescript
// For accessing object properties, use bracket notation
const prop = 'name'
const value = obj[prop]
```

## Common Attack Vectors

### 1. Code Injection

```typescript
// Vulnerable
function getUserData(userId: string) {
  const userData = eval(`userData_${userId}`) // User-controlled!
  return userData
}

// Attack: getUserData("__proto__.constructor='alert(1)'" // Executes alert(1)
```

### 2. XSS via eval

```typescript
// Vulnerable
function renderTemplate(template: string, data: Record<string, string>) {
  for (const [key, value] of Object.entries(data)) {
    template = template.replace(`{${key}}`, value)
  }
  return eval(`\`${template}\``) // XSS vulnerability!
}

// Attack: template = "${alert('XSS')}" // Executes arbitrary JavaScript
```

### 3. Prototype Pollution

```typescript
// Vulnerable
function merge(config: string, defaults: Record<string, unknown>) {
  eval(`config = ${config}`) // Can pollute prototypes
  return { ...defaults, ...config }
}

// Attack: config = "__proto__.isAdmin=true" // Sets isAdmin on Object.prototype
```

## How to Fix Violations

### 1. Replace eval() with Direct Function Calls

```diff
- function add(a: number, b: number): number {
-   return eval(`a + b`);
+ function add(a: number, b: number): number {
+   return a + b;
```

### 2. Use JSON.parse() Instead of eval

```diff
- function parseConfig(jsonString: string): Record<string, unknown> {
-   return eval(`(${jsonString})`);
+ function parseConfig(jsonString: string): Record<string, unknown> {
+   return JSON.parse(jsonString);
```

### 3. Use setTimeout with Functions

```diff
- setTimeout('doSomething()', 1000);
+ setTimeout(() => doSomething(), 1000);
```

### 4. Use Property Access Safely

```diff
- const prop = 'name';
- const value = eval(`obj.${prop}`);
+ const prop = 'name';
+ const value = obj[prop];
```

### 5. Use Function.apply() Instead of eval

```diff
- const result = eval(`${fnName}(${args.join(',')})`);
+ const fn = window[fnName];
+ const result = fn.apply(null, args);
```

### 6. For Dynamic Module Loading

```diff
- function loadModule(moduleName: string): unknown {
-   return eval(`require('${moduleName}')`);
+ async function loadModule(moduleName: string): Promise<unknown> {
+   return import(moduleName);
```

## Safe Use Cases

There are very few safe use cases for eval. If you must use it, ensure:

1. **No user input**: Never eval user-controlled strings
2. **Sandboxed environment**: Execute in a restricted context
3. **Explicit allow list**: Only eval from known, trusted sources
4. **Code review**: Extra scrutiny and security review

### Example of (Almost) Safe eval

```typescript
// Still not recommended, but safer than most uses
function evaluateTrustedMath(expr: string): number {
  // Only allows specific math operations
  const allowed = /^[0-9+\-*/().\s]+$/

  if (!allowed.test(expr)) {
    throw new Error('Invalid expression')
  }

  // Still dangerous - avoid if possible
  return eval(expr)
}

// Better alternative: Use a proper math expression parser
```

## Related Rules

- [no-implied-eval](../patterns/no-implied-eval.md) - Detect indirect eval patterns
- [no-dynamic-delete](no-dynamic-delete.md) - Prevent dynamic property deletion
- [no-new-native-nonconstructor](../patterns/no-new-native-nonconstructor.md) - Detect other unsafe patterns

## Further Reading

- [Never use eval()!](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/eval#never_use_eval)
- [OWASP: Code Injection](https://owasp.org/www-community/attacks/code_injection)
- [JavaScript Security](https://www.youtube.com/watch?v=Rk1p6f6qyI) - Daniel Shiffman

## Auto-Fix

This rule is not fully auto-fixable. Replacing `eval()` requires understanding the context and intent. Use:

```bash
codeforge analyze --rules no-eval
```
