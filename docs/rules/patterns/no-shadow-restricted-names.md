# no-shadow-restricted-names

![Recommended](https://img.shields.io/badge/-recommended-blue)

| Property    | Value    |
| ----------- | -------- |
| Category    | patterns |
| Fixable     | No       |
| Recommended | Yes      |
| Deprecated  | No       |

## Description

Disallow identifiers from shadowing restricted names. This rule prevents variable and function declarations from using names that are globally available in JavaScript, such as `undefined`, `NaN`, `Infinity`, `eval`, and `arguments`. Shadowing these names can lead to confusing bugs where the original global properties become inaccessible within the shadowing scope.

## Why This Rule Matters

Shadowing restricted names is dangerous because:

- **Loss of global access**: Once shadowed, you lose access to the original global property in that scope
- **Unexpected behavior**: Code expecting the global property will instead use your local variable
- **Maintenance issues**: Other developers may not realize the name has been shadowed
- **Debugging difficulty**: Shadowing makes it harder to track down issues related to these special names
- **Scope confusion**: Creates ambiguity about which identifier is being referenced

### Real-World Impact

```javascript
// ❌ Shadowing undefined breaks type checking
function isDefined(value) {
  const undefined = null // BAD: Now 'undefined' refers to null, not the global
  return value !== undefined
}

// The above will return true for any value, including undefined itself!
```

## Restricted Names

This rule disallows the following restricted global names:

| Name        | Purpose                                    |
| ----------- | ------------------------------------------ |
| `undefined` | Represents the primitive value `undefined` |
| `NaN`       | Represents "Not-a-Number" value            |
| `Infinity`  | Represents positive Infinity               |
| `eval`      | Evaluates JavaScript code strings          |
| `arguments` | Contains function arguments                |

## Configuration Options

This rule does not support any configuration options.

## When to Use This Rule

**Use this rule always:**

- You want to prevent accidental shadowing of JavaScript globals
- You maintain code clarity and predictability
- You want to catch potential bugs early
- You work in a team and want consistent coding standards

**Never disable this rule:**

There is virtually no legitimate reason to shadow these global properties. If you need to store values related to these concepts, use a different name.

## Code Examples

### ❌ Incorrect - Shadowing Restricted Names

```typescript
// Shadowing undefined
const undefined = null

// Shadowing NaN
const NaN = 0

// Shadowing Infinity
const Infinity = Number.MAX_VALUE

// Shadowing eval
const eval = (code: string) => console.log(code)

// Shadowing arguments
const arguments = ['arg1', 'arg2']
```

```typescript
// Function declarations shadowing restricted names
function undefined() {
  return 'shadowed'
}

function NaN() {
  return 'not a number'
}

function Infinity() {
  return 'finite'
}

function eval(code: string) {
  return code
}

function arguments() {
  return []
}
```

```typescript
// Shadowing in function scope
function processData(data: any) {
  const undefined = data

  if (undefined === null) {
    // This logic is broken - 'undefined' is not the global
  }
}
```

### ✅ Correct - Using Alternative Names

```typescript
// Use descriptive names instead
const isUndefined = value === undefined
const notANumber = Number.isNaN(value)
const maxFiniteValue = Number.MAX_VALUE
const evaluateCode = (code: string) => eval(code)
const functionArgs = ['arg1', 'arg2']
```

```typescript
// Function declarations with appropriate names
function getUndefinedValue() {
  return undefined
}

function getNaN() {
  return NaN
}

function getInfinity() {
  return Infinity
}

function safeEvaluate(code: string) {
  return eval(code)
}

function getArguments() {
  return arguments
}
```

```typescript
// Use proper variable names
function processData(data: unknown) {
  const isValueUndefined = data === undefined

  if (isValueUndefined) {
    // Correct logic - not shadowing the global
  }
}
```

### ✅ Correct - Accessing Global Properties

```typescript
// You can still access the global properties
function checkUndefined(value: unknown): boolean {
  return value === undefined // This references the global undefined
}

function checkNaN(value: number): boolean {
  return Number.isNaN(value) // Using global NaN internally
}

function getInfiniteValue(): number {
  return Infinity // References the global Infinity
}

function evaluateExpression(expression: string): any {
  return eval(expression) // References the global eval
}

function getArgumentsCount(): number {
  return arguments.length // References the global arguments
}
```

## How to Fix Violations

### 1. Rename Variables

```diff
- const undefined = null
+ const isUndefined = value === undefined
```

```diff
- const NaN = 0
+ const isNaNValue = Number.isNaN(value)
```

```diff
- const Infinity = Number.MAX_VALUE
+ const maxValue = Number.MAX_VALUE
```

### 2. Rename Functions

```diff
- function undefined() { ... }
+ function getUndefined() { ... }
```

```diff
- function eval(code: string) { ... }
+ function evaluate(code: string) { ... }
```

### 3. Use More Descriptive Names

```diff
- const arguments = process.argv.slice(2)
+ const commandLineArgs = process.argv.slice(2)
```

```diff
- const eval = () => { /* ... */ }
+ const execute = () => { /* ... */ }
```

### 4. Remove Shadowing When Accidental

```diff
function calculate(value: number) {
-  const undefined = value
   if (value === undefined) {
     // ...
   }
}
```

## Common Pitfalls

### Accidental Shadowing in Destructuring

```javascript
// ❌ Bad: Shadowing undefined in destructuring
const { undefined } = { undefined: 'shadowed' }

// ✅ Good: Use a different name
const { undefined: shadowedUndefined } = { undefined: 'shadowed' }
```

### Shadowing in Function Parameters

```javascript
// ❌ Bad: Shadowing arguments
function logArgs(arguments: string[]) {
  console.log(arguments)
}

// ✅ Good: Use a different parameter name
function logArgs(args: string[]) {
  console.log(args)
}
```

### Shadowing in Loop Variables

```javascript
// ❌ Bad: Shadowing in for loops
for (let undefined = 0; undefined < 10; undefined++) {
  // ...
}

// ✅ Good: Use appropriate variable name
for (let i = 0; i < 10; i++) {
  // ...
}
```

## Best Practices

### Choose Descriptive Alternative Names

Instead of shadowing restricted names, choose names that clearly express your intent:

```typescript
// Instead of 'undefined'
const isValueUndefined = true
const hasUndefinedValue = true
const defaultValue = 'default'

// Instead of 'NaN'
const isNaNResult = true
const invalidNumberValue = NaN

// Instead of 'Infinity'
const infiniteLimit = Infinity
const unboundedValue = Infinity

// Instead of 'eval'
const evaluateExpression = (code: string) => eval(code)
const runCode = (code: string) => eval(code)

// Instead of 'arguments'
const functionArguments = ['arg1', 'arg2']
const params = ['arg1', 'arg2']
```

### Use Built-in Methods When Available

```typescript
// Instead of: const NaN = Number.isNaN(value)
// Use: Number.isNaN(value)
const isValueNaN = Number.isNaN(value)

// Instead of: const Infinity = Number.POSITIVE_INFINITY
// Use: Number.POSITIVE_INFINITY
const positiveInfinity = Number.POSITIVE_INFINITY
```

## Edge Cases

### Safe Usage in Nested Scopes

While shadowing is discouraged, it's important to understand the scoping rules:

```typescript
const globalUndefined = undefined // ✅ OK: Using global, not shadowing

function outerFunction() {
  const undefined = 'shadowed' // ❌ BAD: Shadowing

  function innerFunction() {
    console.log(undefined) // 'shadowed' - the outer undefined
  }
}
```

### Accessing the Original Global

If you accidentally shadow a global, you can still access the original:

```typescript
const undefined = 'shadowed'

// You can still access the original global:
const originalUndefined = globalThis.undefined // or just (0, eval)('undefined')
```

However, this pattern is confusing and should be avoided. Instead, rename your variable.

## Related Rules

- [no-eval](./no-eval.md) - Disallow the use of eval
- [no-implicit-globals](./no-implicit-globals.md) - Disallow implicit globals
- [no-global-assign](./no-global-assign.md) - Disallow assignments to native objects
- [no-obj-calls](./no-obj-calls.md) - Disallow calling global object properties as functions

## Further Reading

- [MDN: Global Properties](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects)
- [MDN: undefined](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/undefined)
- [MDN: NaN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/NaN)
- [MDN: Infinity](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Infinity)
- [MDN: eval()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/eval)
- [MDN: arguments object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/arguments)
- [JavaScript Variable Shadowing](https://medium.com/@prashantramnyc/javascript-scope-and-variable-shadowing-692e3d79d23d)

## Auto-Fix

This rule is not auto-fixable. Fixing shadowing requires choosing appropriate alternative names based on context and intent.

Use interactive mode to review violations:

```bash
codeforge analyze --rules no-shadow-restricted-names
```
