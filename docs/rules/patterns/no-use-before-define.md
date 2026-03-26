# no-use-before-define

![Recommended](https://img.shields.io/badge/-recommended-blue)

| Property    | Value    |
| ----------- | -------- |
| Category    | patterns |
| Fixable     | No       |
| Recommended | Yes      |
| Deprecated  | No       |

## Description

Disallow the use of variables or functions before they are declared. Using identifiers before their declaration can lead to confusing behavior due to hoisting, making code harder to read and maintain.

## Why This Rule Matters

Using variables before declaration is problematic because:

- **Hoisting confusion**: `var` declarations are hoisted to the top of their scope, making code execute differently than it appears
- **Temporal Dead Zone (TDZ)**: `let` and `const` variables cannot be accessed before declaration, throwing `ReferenceError`
- **Function hoisting differences**: Function declarations are hoisted, but function expressions and arrow functions are not
- **Readability issues**: Code should read from top to bottom in execution order
- **Maintenance difficulties**: Developers expect declarations to appear before usage

### Hoisting Behavior Differences

```javascript
// ❌ VAR: Hoisted with undefined value
console.log(myVar) // undefined (no error!)
var myVar = 'value'

// ❌ LET/CONST: Temporal Dead Zone - throws error
console.log(myLet) // ReferenceError: Cannot access 'myLet' before initialization
let myLet = 'value'

// ✅ Function declaration: Hoisted fully
console.log(myFunction()) // 'Hello'
function myFunction() {
  return 'Hello'
}

// ❌ Function expression: Not hoisted
console.log(myArrow()) // ReferenceError: Cannot access 'myArrow' before initialization
const myArrow = () => 'Hello'
```

## What This Rule Detects

This rule detects:

- **Variable usage before declaration**: Using `let`, `const`, or `var` before their declaration
- **Function expression usage**: Using arrow functions or function expressions before declaration
- **Class usage**: Using class instances before class declaration
- **Type usage**: Using TypeScript types before declaration

## Configuration Options

```json
{
  "rules": {
    "no-use-before-define": [
      "error",
      {
        "variables": true,
        "functions": true,
        "classes": true,
        "ignoreTypeReferences": false,
        "allowConst": false
      }
    ]
  }
}
```

| Option                 | Type      | Default | Description                                              |
| ---------------------- | --------- | ------- | -------------------------------------------------------- |
| `variables`            | `boolean` | `true`  | Disallow variable usage before declaration               |
| `functions`            | `boolean` | `true`  | Disallow function usage before declaration               |
| `classes`              | `boolean` | `true`  | Disallow class usage before declaration                  |
| `ignoreTypeReferences` | `boolean` | `false` | Ignore TypeScript type references                        |
| `allowConst`           | `boolean` | `false` | Allow usage of `const` before declaration (for hoisting) |

### Option Usage Examples

**Only check variables, ignore functions:**

```json
{
  "rules": {
    "no-use-before-define": [
      "error",
      {
        "variables": true,
        "functions": false,
        "classes": true
      }
    ]
  }
}
```

**Ignore type references in TypeScript:**

```json
{
  "rules": {
    "no-use-before-define": [
      "error",
      {
        "ignoreTypeReferences": true
      }
    ]
  }
}
```

## When to Use This Rule

**Use this rule when:**

- You want to prevent confusing hoisting behavior
- Your codebase follows top-to-bottom execution patterns
- You want to catch temporal dead zone errors early
- You work with a team that values code readability

**Consider disabling when:**

- Your codebase relies on function hoisting patterns
- You're implementing recursive algorithms that need hoisting
- You're working with legacy code that uses var extensively

## Code Examples

### ❌ Incorrect - Using Before Declaration

```typescript
// Using variable before declaration
console.log(message) // ReferenceError
const message = 'Hello, World!'
```

```typescript
// Using arrow function before declaration
greet() // ReferenceError
const greet = () => {
  console.log('Hello')
}
```

```typescript
// Using class before declaration
const user = new User() // ReferenceError
class User {
  constructor(private name: string) {}
}
```

```typescript
// Using function expression before declaration
calculate() // ReferenceError
const calculate = function () {
  return 42
}
```

```typescript
// Using variable in another declaration before its own declaration
const double = value * 2 // ReferenceError
const value = 10
```

```typescript
// Using type in function signature before type declaration
function createUser(user: User): void {
  // Error if ignoreTypeReferences is false
  console.log(user)
}

interface User {
  name: string
}
```

### ✅ Correct - Declare Before Use

```typescript
// Declare before use
const message = 'Hello, World!'
console.log(message)
```

```typescript
// Use function declarations (hoisted)
function greet() {
  console.log('Hello')
}
greet()
```

```typescript
// Declare class before instantiation
class User {
  constructor(private name: string) {}
}
const user = new User('John')
```

```typescript
// Declare before using in other declarations
const value = 10
const double = value * 2
```

```typescript
// Declare type before use
interface User {
  name: string
}

function createUser(user: User): void {
  console.log(user)
}
```

### ✅ Correct - Function Declarations (Hoisted)

```typescript
// Function declarations are hoisted
console.log(sum(5, 3)) // 8 - This works!

function sum(a: number, b: number): number {
  return a + b
}
```

```typescript
// Recursive functions benefit from hoisting
console.log(factorial(5)) // 120

function factorial(n: number): number {
  if (n <= 1) return 1
  return n * factorial(n - 1)
}
```

### ✅ Correct - With ignoreTypeReferences

```json
{
  "rules": {
    "no-use-before-define": [
      "error",
      {
        "ignoreTypeReferences": true
      }
    ]
  }
}
```

```typescript
// Type references are allowed
function process(data: UserData): void {
  console.log(data)
}

interface UserData {
  id: number
  value: string
}
```

## How to Fix Violations

### 1. Move Declaration Before Usage

```diff
- console.log(message);
- const message = 'Hello';

+ const message = 'Hello';
+ console.log(message);
```

```diff
- greet();
- const greet = () => console.log('Hello');

+ const greet = () => console.log('Hello');
+ greet();
```

### 2. Use Function Declarations Instead of Expressions

```diff
- const sum = (a: number, b: number) => a + b;
- console.log(sum(1, 2));

+ function sum(a: number, b: number) {
+   return a + b;
+ }
+ console.log(sum(1, 2));
```

### 3. Reorder Dependent Declarations

```diff
- const doubled = value * 2;
- const value = 10;

+ const value = 10;
+ const doubled = value * 2;
```

### 4. Extract Types to Separate File

```diff
  // utils.ts
- function process(data: Data) {
+ import { Data } from './types';
+
+ function process(data: Data) {
    return data;
  }

- interface Data {
-   value: string;
- }
```

```typescript
// types.ts
export interface Data {
  value: string
}
```

### 5. Use Type Guards for Conditional Usage

```diff
- if (typeof value === 'string') {
-   console.log(value.toUpperCase());
- }
- const value: string | number = getValue();

+ const value: string | number = getValue();
+ if (typeof value === 'string') {
+   console.log(value.toUpperCase());
+ }
```

## Best Practices

### Declaration Order

Organize code in this order:

1. Imports
2. Type definitions/interfaces
3. Constants
4. Functions (declarations first, then expressions)
5. Classes
6. Main execution logic

```typescript
// ✅ Recommended order
import { something } from './module'

interface Options {
  name: string
}

const MAX_SIZE = 100

// Function declarations (can reference each other)
function helper() {
  return 'helper'
}

function main() {
  return helper()
}

class Processor {
  process() {
    return main()
  }
}

// Initialize
const processor = new Processor()
```

### Use Function Declarations for Recursive Functions

```typescript
// ✅ Good - Function declaration works for recursion
function fibonacci(n: number): number {
  if (n <= 1) return n
  return fibonacci(n - 1) + fibonacci(n - 2)
}

// ❌ Avoid - Function expression with recursion needs careful ordering
const factorial = function (n: number): number {
  if (n <= 1) return 1
  return n * factorial(n - 1) // Works, but less clear
}
```

### Separate Type Definitions

```typescript
// types.ts - All type definitions
export interface User {
  id: number
  name: string
}

export interface Config {
  debug: boolean
  version: string
}

// utils.ts - Import types
import { User, Config } from './types'

export function createUser(config: Config): User {
  return {
    id: 1,
    name: 'User',
  }
}
```

### Use Default Exports Carefully

```typescript
// ✅ Good - Named exports are clearer
export const CONSTANT_VALUE = 42

export function helper() {
  return CONSTANT_VALUE
}

// ❌ Avoid - Default exports can cause confusion
export default function () {
  return CONSTANT_VALUE
}
```

## Common Pitfalls

### Temporal Dead Zone (TDZ)

```javascript
// ❌ TDZ Error
{
  console.log(x) // ReferenceError: Cannot access 'x' before initialization
  let x = 5
}

// ❌ TDZ Error in default parameters
function foo(value = x) {
  // ReferenceError
  console.log(value)
}
let x = 10
```

```javascript
// ✅ Correct
{
  let x = 5
  console.log(x) // 5
}

// ✅ Correct default parameter
function foo(value = 10) {
  console.log(value)
}
let x = 10
```

### Function Expressions vs Declarations

```javascript
// ❌ Function expression - not hoisted
console.log(add(1, 2)) // ReferenceError
const add = (a, b) => a + b

// ✅ Function declaration - hoisted
console.log(subtract(5, 3)) // 2
function subtract(a, b) {
  return a - b
}
```

### Class Hoisting

```javascript
// ❌ Classes are NOT hoisted
const instance = new MyClass() // ReferenceError
class MyClass {
  constructor() {}
}

// ✅ Correct order
class MyClass {
  constructor() {}
}
const instance = new MyClass()
```

### Variable Shadowing

```javascript
// ❌ Confusing shadowing
const x = 10
function example() {
  console.log(x) // undefined
  var x = 20
}

// ✅ Clear scoping
const x = 10
function example() {
  const y = 20 // Different variable
  console.log(x)
  console.log(y)
}
```

### TypeScript Type References

```typescript
// ❌ Error when ignoreTypeReferences is false
function validate(data: ValidationResult) {
  // Error
  return data.isValid
}

interface ValidationResult {
  isValid: boolean
}

// ✅ Correct order or enable ignoreTypeReferences
interface ValidationResult {
  isValid: boolean
}

function validate(data: ValidationResult) {
  return data.isValid
}
```

## Related Rules

- [no-var](../patterns/no-var.md) - Disallow `var` to prevent hoisting issues
- [no-undef](../patterns/no-undef.md) - Disallow use of undeclared variables
- [prefer-const](../patterns/prefer-const.md) - Use `const` for variables that are not reassigned
- [no-shadow](../patterns/no-shadow.md) - Disallow variable declarations that shadow others

## Further Reading

- [MDN: Hoisting](https://developer.mozilla.org/en-US/docs/Glossary/Hoisting)
- [MDN: let and Temporal Dead Zone](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/let#temporal_dead_zone_tdz)
- [TypeScript Handbook: Variable Declarations](https://www.typescriptlang.org/docs/handbook/variable-declarations.html)
- [Understanding Hoisting in JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Grammar_and_types#hoisting)

## Auto-Fix

This rule is not auto-fixable. Reordering code requires understanding the intended logic and dependencies between statements.

Use interactive mode to review violations:

```bash
codeforge analyze --rules no-use-before-define
```
