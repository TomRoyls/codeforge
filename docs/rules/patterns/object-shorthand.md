# object-shorthand

![Recommended](https://img.shields.io/badge/-recommended-blue)

| Property    | Value    |
| ----------- | -------- |
| Category    | patterns |
| Fixable     | No       |
| Recommended | Yes      |
| Deprecated  | No       |

## Description

Require object literal shorthand for methods. Instead of `{ method: function() {} }`, use `{ method() { } }` for cleaner, more concise code.

## Why This Rule Matters

Using the ES6 object method shorthand improves your code because:

- **Cleaner syntax**: Shorthand removes redundant `function` keywords and colons
- **Better readability**: Less visual noise makes object definitions easier to scan
- **Modern JavaScript**: Shorthand is standard practice in modern codebases
- **Consistency**: Encourages using modern ES6+ features throughout your code
- **Conciseness**: Reduces code length without sacrificing clarity

### Verbosity Comparison

```javascript
// VERBOSE: Old-style function syntax
const obj = {
  init: function () {
    // ...
  },
  cleanup: function () {
    // ...
  },
  process: function () {
    // ...
  },
}

// CLEAN: ES6 method shorthand
const obj = {
  init() {
    // ...
  },
  cleanup() {
    // ...
  },
  process() {
    // ...
  },
}
```

## When to Use This Rule

**Use this rule when:**

- You want to maintain modern, consistent code style
- Your codebase targets ES6+ environments
- You prioritize clean, readable code
- You're working with object literals containing methods

**Consider disabling when:**

- You need to support very old browsers (IE11 or earlier)
- You're working with legacy code that can't be modernized
- You have specific technical requirements preventing ES6 syntax

## Code Examples

### ❌ Incorrect - Using Function Expression Syntax

```typescript
// Using verbose function syntax
const user = {
  name: 'John',
  greet: function () {
    return `Hello, ${this.name}`
  },
}
```

```typescript
// Multiple methods with function expressions
const calculator = {
  add: function (a: number, b: number): number {
    return a + b
  },
  subtract: function (a: number, b: number): number {
    return a - b
  },
  multiply: function (a: number, b: number): number {
    return a * b
  },
}
```

```typescript
// Method with TypeScript types
const service = {
  fetchData: async function (url: string): Promise<Data> {
    const response = await fetch(url)
    return response.json()
  },
}
```

```typescript
// Class-like object with functions
const person = {
  name: 'Jane',
  age: 30,
  getName: function (): string {
    return this.name
  },
  getAge: function (): number {
    return this.age
  },
}
```

### ✅ Correct - Using Method Shorthand

```typescript
// Using ES6 method shorthand
const user = {
  name: 'John',
  greet() {
    return `Hello, ${this.name}`
  },
}
```

```typescript
// Multiple methods with shorthand
const calculator = {
  add(a: number, b: number): number {
    return a + b
  },
  subtract(a: number, b: number): number {
    return a - b
  },
  multiply(a: number, b: number): number {
    return a * b
  },
}
```

```typescript
// Async method with shorthand
const service = {
  async fetchData(url: string): Promise<Data> {
    const response = await fetch(url)
    return response.json()
  },
}
```

```typescript
// Class-like object with shorthand methods
const person = {
  name: 'Jane',
  age: 30,
  getName(): string {
    return this.name
  },
  getAge(): number {
    return this.age
  },
}
```

### ✅ Correct - When Shorthand Doesn't Apply

```typescript
// Arrow functions are okay (they preserve `this` from outer scope)
const button = {
  label: 'Click me',
  onClick: () => {
    console.log('Button clicked')
  },
}
```

```typescript
// Property values that are not functions
const config = {
  name: 'my-app',
  version: '1.0.0',
  enabled: true,
}
```

```typescript
// Getters and setters are already in shorthand form
const obj = {
  _value: 0,
  get value(): number {
    return this._value
  },
  set value(val: number) {
    this._value = val
  },
}
```

## How to Fix Violations

### 1. Replace Function Expression with Method Shorthand

```diff
- const obj = {
-   method: function() {
+ const obj = {
+   method() {
      // Code here
-   }
+   }
  }
```

### 2. Convert Methods with Parameters

```diff
- const calculator = {
-   add: function(a: number, b: number): number {
+ const calculator = {
+   add(a: number, b: number): number {
      return a + b
-   }
+   }
  }
```

### 3. Convert Async Methods

```diff
- const api = {
-   fetchData: async function(url: string): Promise<any> {
+ const api = {
+   async fetchData(url: string): Promise<any> {
      const response = await fetch(url)
      return response.json()
-   }
+   }
  }
```

### 4. Convert Methods in Class-like Objects

```diff
- const person = {
-   getName: function(): string {
+ const person = {
+   getName(): string {
      return this.name
-   }
+   }
  }
```

### 5. Convert Multiple Methods at Once

```diff
  const controller = {
-   init: function() {
+   init() {
      this.setup()
-   },
-   setup: function() {
+   },
+   setup() {
      // Setup code
-   },
-   destroy: function() {
+   },
+   destroy() {
      // Cleanup code
    }
  }
```

## Best Practices

### Prefer Shorthand for Object Methods

Always use method shorthand when defining functions in object literals. This is the modern standard:

```typescript
// ✅ Good
const myModule = {
  init() {
    // Initialization
  },
  start() {
    // Start processing
  },
  stop() {
    // Stop processing
  },
}

// ❌ Avoid
const myModule = {
  init: function () {
    // Initialization
  },
  start: function () {
    // Start processing
  },
  stop: function () {
    // Stop processing
  },
}
```

### Use Arrow Functions When You Need Lexical `this`

Shorthand methods use the object's `this`. If you need lexical scoping from the outer context, use arrow functions:

```typescript
class Component {
  private id = 123

  getConfig() {
    return {
      // Arrow function preserves `this` from Component instance
      getId: () => this.id,

      // Shorthand method uses object as `this`
      getValue() {
        return 'value'
      },
    }
  }
}
```

### Keep Consistent Style Within an Object

Don't mix shorthand and verbose syntax in the same object:

```typescript
// ✅ Good - All methods use shorthand
const service = {
  init() {
    /* ... */
  },
  process() {
    /* ... */
  },
  cleanup() {
    /* ... */
  },
}

// ❌ Bad - Inconsistent style
const service = {
  init() {
    /* ... */
  },
  process: function () {
    /* ... */
  }, // Inconsistent
  cleanup() {
    /* ... */
  },
}
```

### Use Descriptive Method Names

Method shorthand makes it easier to focus on what methods do, so choose clear names:

```typescript
// ✅ Good - Clear, descriptive names
const userManager = {
  createUser() {
    /* ... */
  },
  deleteUser() {
    /* ... */
  },
  updateUser() {
    /* ... */
  },
}

// ❌ Bad - Unclear abbreviations
const userManager = {
  crtUsr() {
    /* ... */
  },
  delUsr() {
    /* ... */
  },
  updUsr() {
    /* ... */
  },
}
```

## Common Pitfalls

### Arrow Functions vs Method Shorthand

```javascript
// ❌ Arrow function in object (this refers to outer scope)
const obj = {
  name: 'Test',
  getValue: () => {
    return this.name // `this` is not the object!
  },
}

// ✅ Method shorthand (this refers to the object)
const obj = {
  name: 'Test',
  getValue() {
    return this.name // `this` is the object
  },
}
```

### Bound Methods

```javascript
// ⚠️ Shorthand methods can't be bound with .bind()
const obj = {
  value: 42,
  getValue() {
    return this.value
  },
}

// ✅ Use arrow function if you need to bind
const obj = {
  value: 42,
  getValue: function () {
    return this.value
  },
}

const bound = obj.getValue.bind(obj) // Works with function expression
```

### Property vs Method Shorthand

```javascript
// ✅ Property shorthand for values (ES6)
const name = 'John'
const age = 30

const person = { name, age } // Property shorthand

// ✅ Method shorthand for functions
const person = {
  name: 'John',
  greet() {
    // Method shorthand
    return `Hello, ${this.name}`
  },
}
```

## Related Rules

- [no-var](../patterns/no-var.md) - Use `const` and `let` instead of `var`
- [prefer-arrow-callback](../patterns/prefer-arrow-callback.md) - Prefer arrow functions for callbacks
- [prefer-const](../patterns/prefer-const.md) - Prefer `const` when a variable is not reassigned
- [object-curly-spacing](../styling/object-curly-spacing.md) - Enforce consistent spacing in object literals

## Further Reading

- [MDN: Method Definitions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Method_definitions)
- [ES6 Object Literal Extensions](https://es6-features.org/#Object-Literal-Extensions)
- [JavaScript Object Methods](https://www.javascripttutorial.net/object/javascript-object-methods/)

## Auto-Fix

This rule is not auto-fixable. Converting function expressions to method shorthand requires understanding the context to ensure proper `this` binding.

Use interactive mode to review violations:

```bash
codeforge analyze --rules object-shorthand
```
