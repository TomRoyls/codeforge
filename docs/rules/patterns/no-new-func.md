# no-new-func

![Recommended](https://img.shields.io/badge/-recommended-blue)

| Property    | Value    |
| ----------- | -------- |
| Category    | security |
| Fixable     | No       |
| Recommended | Yes      |
| Deprecated  | No       |

## Description

Disallow `new Function()` and `Function()` calls. Creating functions at runtime from strings is a security risk similar to `eval()`. The Function constructor allows dynamic code execution from strings, making your application vulnerable to code injection attacks.

## Why This Rule Matters

Using the Function constructor is dangerous because:

- **Code injection attacks**: Malicious code can be injected if the string contains user input
- **XSS vulnerabilities**: Unsanitized user data can be executed as JavaScript
- **Security bypasses**: Can execute code that bypasses Content Security Policy (CSP) restrictions
- **Debugging difficulties**: Dynamically created functions are harder to debug and trace
- **Performance impact**: Functions created at runtime cannot be optimized by the JavaScript engine
- **Code obfuscation**: Makes code harder to understand and maintain

### Security Vulnerabilities

```javascript
// DANGEROUS: User input directly used in Function constructor
const userInput = getValueFromRequest()
const dynamicFunc = new Function('return ' + userInput)
// An attacker could pass: "alert('XSS')" or worse

// DANGEROUS: Direct call to Function constructor
const evil = Function('console.log(process.env)')
// Can access sensitive information
```

## When to Use This Rule

**Use this rule when:**

- You want to prevent code injection vulnerabilities
- Your application handles user input or data from external sources
- You need to enforce security best practices
- You work in a team that needs to maintain secure coding standards

**Consider disabling when:**

- You are building a code execution sandbox specifically designed to run untrusted code
- You are implementing a dynamic evaluation feature with strict input validation and sandboxing
- You have comprehensive security reviews and mitigations in place

## Code Examples

### ❌ Incorrect - Using Function Constructor

```typescript
// Creating function from string
const add = new Function('a', 'b', 'return a + b')

// Direct call to Function constructor
const multiply = Function('a', 'b', 'return a * b')

// Using Function with user input (very dangerous!)
const userInput = getUserInput()
const dynamicFunc = new Function('x', 'return x + ' + userInput)
```

```typescript
// Function with complex body
const process = new Function(
  'data',
  `
  const result = data.map(item => item.value)
  return result.filter(Boolean)
`,
)
```

```typescript
// Using Function to bypass restrictions
const getSecret = Function('return process.env.SECRET_KEY')
```

### ✅ Correct - Using Function Declarations

```typescript
// Use regular function declarations
function add(a: number, b: number): number {
  return a + b
}

// Use arrow functions
const multiply = (a: number, b: number): number => a * b

// Use function expressions
const process = function <T>(data: Array<{ value: T }>): Array<T> {
  const result = data.map((item) => item.value)
  return result.filter(Boolean)
}
```

```typescript
// For dynamic behavior, use conditional logic
function createOperation(type: string): (a: number, b: number) => number {
  if (type === 'add') {
    return (a, b) => a + b
  }
  if (type === 'multiply') {
    return (a, b) => a * b
  }
  throw new Error(`Unknown operation: ${type}`)
}

// Instead of: new Function('return a + b')
// Use: createOperation('add')
```

```typescript
// For configuration-based behavior, use maps or objects
const operations: Record<string, (a: number, b: number) => number> = {
  add: (a, b) => a + b,
  subtract: (a, b) => a - b,
  multiply: (a, b) => a * b,
  divide: (a, b) => (b !== 0 ? a / b : NaN),
}

function getOperation(type: string): (a: number, b: number) => number {
  const operation = operations[type]
  if (!operation) {
    throw new Error(`Unknown operation: ${type}`)
  }
  return operation
}
```

### ✅ Correct - Safe Alternatives for Dynamic Code

```typescript
// Use object lookups instead of dynamic function creation
const validators = {
  email: (value: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
  phone: (value: string): boolean => /^\d{10}$/.test(value),
  zip: (value: string): boolean => /^\d{5}$/.test(value),
}

function validate(type: string, value: string): boolean {
  const validator = validators[type as keyof typeof validators]
  if (!validator) {
    throw new Error(`Unknown validator: ${type}`)
  }
  return validator(value)
}
```

```typescript
// Use strategy pattern for dynamic behavior
interface Strategy {
  execute(data: unknown): unknown
}

class JsonStrategy implements Strategy {
  execute(data: unknown): unknown {
    return JSON.stringify(data)
  }
}

class CsvStrategy implements Strategy {
  execute(data: unknown): unknown {
    // CSV formatting logic
    return data
  }
}

function createFormatter(format: 'json' | 'csv'): Strategy {
  const strategies = {
    json: new JsonStrategy(),
    csv: new CsvStrategy(),
  }
  return strategies[format]
}
```

## How to Fix Violations

### 1. Replace new Function with Regular Functions

```diff
- const add = new Function('a', 'b', 'return a + b')
+ function add(a: number, b: number): number {
+   return a + b
+ }
```

```diff
- const multiply = Function('a', 'b', 'return a * b')
+ const multiply = (a: number, b: number): number => a * b
```

### 2. Replace Dynamic Function Creation with Maps/Objects

```diff
- const operation = new Function('a', 'b', body)
+ const operations: Record<string, (a: number, b: number) => number> = {
+   add: (a, b) => a + b,
+   subtract: (a, b) => a - b,
+ }
+ const operation = operations[type]
```

### 3. Use Strategy Pattern Instead of Dynamic Code

```diff
- const handler = new Function('event', body)
+ interface Handler {
+   handle(event: Event): void
+ }
+
+ const handler: Handler = {
+   handle(event: Event): void {
+     // Implementation
+   }
+ }
```

### 4. Use Template Literals Instead of Function Bodies (When Safe)

```diff
- const template = new Function('data', `return ${dynamicTemplate}`)
+ function createTemplate(data: Record<string, unknown>): string {
+   const template = data.template
+   // Safe interpolation with proper escaping
+   return interpolate(template, data.values)
+ }
```

### 5. Use eval Alternatives for Parsing

```diff
- const parsed = new Function(`return ${jsonString}`)()
+ const parsed = JSON.parse(jsonString)
```

```diff
- const calculated = new Function(`return ${expression}`)()
+ const calculated = safeEvaluate(expression)
+ // Use a proper expression parser library instead
```

## Best Practices

### Avoid All Dynamic Code Execution

Never create functions from strings at runtime, regardless of the source:

```typescript
// ❌ Never do this
const func = new Function('return 42')

// ❌ Even with "safe" strings
const func = new Function('a', 'b', 'return a + b')

// ❌ Even in tests
const testFunc = new Function('expect', `expect(${assertion})`)
```

### Use Safe Alternatives

For common use cases, use established libraries and patterns:

```typescript
// For expression evaluation, use math-expression-evaluator
import { evaluate } from 'math-expression-evaluator'
const result = evaluate('2 + 3 * 4')

// For JSON parsing, use JSON.parse
const data = JSON.parse(jsonString)

// For template rendering, use mustache, handlebars, or similar
import Handlebars from 'handlebars'
const template = Handlebars.compile('{{name}}')
const result = template({ name: 'World' })
```

### Implement Proper Input Validation

When you need dynamic behavior:

```typescript
// Whitelist allowed operations
const allowedOperations = ['add', 'subtract', 'multiply', 'divide']

function getOperation(name: string): Operation | never {
  if (!allowedOperations.includes(name)) {
    throw new Error(`Operation "${name}" is not allowed`)
  }
  return operations[name]
}
```

### Document Why You Need Dynamic Behavior

If you absolutely need dynamic code execution:

```typescript
/**
 * DANGER: This function creates functions from strings.
 * Used only for implementing a REPL (Read-Eval-Print Loop)
 * with strict sandboxing and input validation.
 *
 * All user input is sanitized before reaching this function.
 * This function runs in a worker process with restricted permissions.
 *
 * @see SECURITY_REVIEW.md for details on sandboxing implementation
 */
function createReplFunction(code: string): Function {
  // Extensive validation and sandboxing here
  return new Function(code) // eslint-disable-line no-new-func
}
```

### Use TypeScript Instead of Runtime Type Checking

```typescript
// ❌ Using Function for runtime type checking
const checker = new Function('value', `return typeof value === '${typeName}'`)

// ✅ Use TypeScript type guards
function isType<T>(value: unknown, typeGuard: (value: unknown) => value is T): value is T {
  return typeGuard(value)
}
```

## Common Pitfalls

### False Sense of Security

```typescript
// ❌ DANGEROUS: Even "safe" strings can be manipulated
const template = 'return "' + userInput + '"'
const func = new Function(template)

// ✅ Use proper templating with escaping
const template = escapeHtml(userInput)
```

### Trusting Internal Sources

```typescript
// ❌ Even internal strings can be a problem
const code = databaseConfig.calculation
const func = new Function(code)

// ✅ Store validated function references instead
const functions: Record<string, Function> = {
  calculateDiscount: (price: number) => price * 0.9,
}
```

### Thinking Function is Safer Than eval

```typescript
// ❌ Both are equally dangerous
const evil1 = eval(userInput)
const evil2 = new Function(userInput)

// ✅ Neither should be used with untrusted input
```

### CSP Evasion

```typescript
// ❌ Function constructor can bypass CSP in some cases
const func = new Function('fetch', 'return fetch("https://evil.com")')

// ✅ Proper CSP compliance means no dynamic code execution
```

## Related Rules

- [no-eval](../security/no-eval.md) - Disallow eval() calls
- [no-implied-eval](../security/no-implied-eval.md) - Disallow setTimeout/setInterval with string arguments
- [no-script-url](../security/no-script-url.md) - Disallow javascript: URLs

## Further Reading

- [MDN: Function constructor](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function)
- [OWASP: Code Injection](https://owasp.org/www-community/attacks/Code_Injection)
- [CSP Specification](https://www.w3.org/TR/CSP/)
- [Security Risks of eval](https://www.acunetix.com/blog/articles/eval-and-javascript-code-insecurity/)

## Auto-Fix

This rule is not auto-fixable. Replacing `new Function()` requires understanding the intended logic and selecting an appropriate safe alternative.

Use interactive mode to review violations:

```bash
codeforge analyze --rules no-new-func
```
