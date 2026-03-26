# no-proto

![Recommended](https://img.shields.io/badge/-recommended-blue)

| Property    | Value    |
| ----------- | -------- |
| Category    | patterns |
| Fixable     | No       |
| Recommended | Yes      |
| Deprecated  | No       |

## Description

Disallow access to the `__proto__` property. The `__proto__` property is a deprecated way to access and modify an object's prototype chain directly. Using `__proto__` is dangerous because it can lead to prototype pollution attacks, unpredictable behavior, and compatibility issues across JavaScript engines. Modern JavaScript provides safer alternatives.

## Why This Rule Matters

Using the `__proto__` property is dangerous because:

- **Security vulnerabilities**: Direct prototype manipulation can lead to prototype pollution attacks
- **Deprecated feature**: `__proto__` is not part of the standard ECMAScript specification and is deprecated
- **Inconsistent behavior**: Different JavaScript engines implement `__proto__` differently
- **Performance overhead**: Accessing `__proto__` is slower than using proper methods
- **Maintenance issues**: Code using `__proto__` is harder to understand and maintain
- **Object invariants**: Modifying `__proto__` can break object invariants and type guarantees

### Security Risks

```javascript
// DANGEROUS: Prototype pollution attack vector
function merge(target, source) {
  for (const key in source) {
    target[key] = source[key]
  }
}

// An attacker can craft malicious input
const maliciousInput = JSON.parse('{"__proto__": {"isAdmin": true}}')
const user = {}

merge(user, maliciousInput)

// Now ALL objects inherit isAdmin: true!
console.log({}.isAdmin) // true - prototype pollution successful
```

## What Gets Detected

This rule detects the following patterns:

- Direct property access: `obj.__proto__`
- Computed property access: `obj['__proto__']`
- Assignment to `__proto__`: `obj.__proto__ = otherObj`
- Deletion of `__proto__`: `delete obj.__proto__`
- Spread with `__proto__`: `{...obj, __proto__: value}` (only if value is not null or Object.prototype)

## Configuration Options

```json
{
  "rules": {
    "no-proto": "error"
  }
}
```

This rule has no configuration options. It simply disallows all uses of `__proto__`.

## When to Use This Rule

**Use this rule when:**

- You want to prevent prototype pollution security vulnerabilities
- Your codebase should follow modern JavaScript/TypeScript best practices
- You need to ensure compatibility across different JavaScript engines
- You prioritize security and maintainability

**Consider disabling when:**

- You're maintaining legacy code that requires `__proto__`
- You're working in an environment where alternative methods are not available
- You have a specific, well-documented use case that cannot be achieved otherwise

## Code Examples

### ❌ Incorrect - Using **proto**

```typescript
// Direct property access
const proto = obj.__proto__
```

```typescript
// Assignment to __proto__
obj.__proto__ = newPrototype
```

```typescript
// Computed property access
const proto = obj['__proto__']
```

```typescript
// Deleting __proto__
delete obj.__proto__
```

```typescript
// Spread with __proto__
const newObj = { ...obj, __proto__: customProto }
```

```typescript
// Checking if __proto__ exists
if (obj.__proto__) {
  // ...
}
```

### ✅ Correct - Using Proper Methods

```typescript
// Use Object.getPrototypeOf() instead
const proto = Object.getPrototypeOf(obj)
```

```typescript
// Use Object.setPrototypeOf() instead (use with caution)
Object.setPrototypeOf(obj, newPrototype)
```

```typescript
// Use Object.create() for creating objects with specific prototypes
const obj = Object.create(newPrototype)
```

```typescript
// Use instanceof to check prototype chain
if (obj instanceof MyConstructor) {
  // ...
}
```

```typescript
// Use Object.getPrototypeOf() to check if prototype exists
if (Object.getPrototypeOf(obj) !== null) {
  // ...
}
```

```typescript
// Use class syntax for prototype-based inheritance
class MyClass extends BaseClass {
  // ...
}
```

```typescript
// For property existence checks, use hasOwnProperty
if (Object.prototype.hasOwnProperty.call(obj, 'key')) {
  // ...
}
```

### ✅ Correct - Common Patterns

```typescript
// Creating objects with a specific prototype
const obj = Object.create(myPrototype, {
  name: { value: 'test' },
  value: { writable: true, value: 42 },
})
```

```typescript
// Checking if an object is a prototype
const isPrototype = Object.getPrototypeOf(obj) === myPrototype
```

```typescript
// Getting the prototype chain
function getPrototypeChain(obj: any): any[] {
  const chain = []
  let current = obj
  while (current !== null) {
    chain.push(current)
    current = Object.getPrototypeOf(current)
  }
  return chain
}
```

```typescript
// Checking if an object inherits from another
function inheritsFrom(obj: any, prototype: any): boolean {
  let current = Object.getPrototypeOf(obj)
  while (current !== null) {
    if (current === prototype) return true
    current = Object.getPrototypeOf(current)
  }
  return false
}
```

```typescript
// Safely merging objects without prototype pollution
function safeMerge<T extends object>(target: T, source: Partial<T>): T {
  const result = { ...target }
  for (const key of Object.keys(source)) {
    // Only copy own enumerable properties, not __proto__
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      result[key as keyof T] = source[key] as any
    }
  }
  return result
}
```

## How to Fix Violations

### 1. Replace **proto** Access with Object.getPrototypeOf()

```diff
- const proto = obj.__proto__
+ const proto = Object.getPrototypeOf(obj)
```

```diff
- if (obj.__proto__) {
+ if (Object.getPrototypeOf(obj) !== null) {
    // ...
  }
```

### 2. Replace **proto** Assignment with Object.setPrototypeOf()

```diff
- obj.__proto__ = newPrototype
+ Object.setPrototypeOf(obj, newPrototype)
```

**Note:** `Object.setPrototypeOf()` is also potentially slow and can break optimizations. Consider using `Object.create()` instead for creating new objects.

### 3. Use Object.create() for New Objects

```diff
- const obj = {}
- obj.__proto__ = myPrototype
+ const obj = Object.create(myPrototype)
```

```diff
- const obj = { ...defaults, __proto__: myPrototype }
+ const obj = Object.create(myPrototype, { ...defaults })
```

### 4. Replace Prototype Checks with instanceof

```diff
- if (obj.__proto__ === MyClass.prototype) {
+ if (obj instanceof MyClass) {
    // ...
  }
```

### 5. Fix Prototype Pollution Vulnerabilities

```diff
  function merge(target: any, source: any): void {
    for (const key in source) {
-     target[key] = source[key]
+     // Only copy own properties, skip __proto__
+     if (Object.prototype.hasOwnProperty.call(source, key)) {
+       target[key] = source[key]
+     }
    }
  }
```

```diff
  function merge(target: any, source: any): void {
+   // Use Object.keys() which only returns own enumerable properties
    for (const key of Object.keys(source)) {
      target[key] = source[key]
    }
  }
```

### 6. Use Class Syntax Instead

```diff
- function MyClass() {}
- MyClass.prototype.method = function() {}
- const obj = {}
- obj.__proto__ = MyClass.prototype
+ class MyClass {
+   method() {}
+ }
+ const obj = new MyClass()
```

## Best Practices

### Prefer Object.create() for Prototype Setup

```typescript
// ✅ Good: Create object with specific prototype
const obj = Object.create(null) // Object with no prototype
const protoObj = Object.create(myPrototype)
```

### Be Careful with Object.setPrototypeOf()

```typescript
// ⚠️  Use with caution: Changing prototype after creation
Object.setPrototypeOf(obj, newPrototype)

// Consider creating a new object instead
const newObj = Object.assign(Object.create(newPrototype), obj)
```

### Use Class Syntax for Inheritance

```typescript
// ✅ Modern approach: Use classes
class Parent {
  method() {
    console.log('Parent method')
  }
}

class Child extends Parent {
  override method() {
    console.log('Child method')
  }
}
```

### Prevent Prototype Pollution in Data Processing

```typescript
// ✅ Safe: Process JSON input without prototype pollution
function parseJSON<T>(json: string): T {
  const obj = JSON.parse(json)
  return sanitize(obj)
}

function sanitize(obj: any): any {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  // Create a new object with null prototype to prevent pollution
  const sanitized: any = Object.create(null)

  for (const key of Object.keys(obj)) {
    // Only copy own properties
    sanitized[key] = sanitize(obj[key])
  }

  return sanitized
}
```

### Use Immutable Patterns

```typescript
// ✅ Immutable: Create new objects instead of modifying prototypes
function withPrototype<T>(obj: T, proto: object): T {
  return Object.assign(Object.create(proto), obj)
}
```

## Common Pitfalls

### Prototype Pollution in Merging Functions

```typescript
// ❌ Dangerous: Vulnerable to prototype pollution
function merge(target: any, source: any): any {
  return { ...target, ...source }
}

const malicious = JSON.parse('{"__proto__":{"polluted":true}}')
const merged = merge({}, malicious)
console.log({}.polluted) // true - polluted!

// ✅ Safe: Use Object.create(null) or sanitize
function safeMerge(target: any, source: any): any {
  const result = Object.create(null)
  for (const key of Object.keys(source)) {
    result[key] = source[key]
  }
  return Object.assign(result, target)
}
```

### Performance Issues with **proto**

```typescript
// ❌ Slow: __proto__ access is slower
function getProtoSlow(obj: any): any {
  return obj.__proto__
}

// ✅ Fast: Object.getPrototypeOf() is optimized
function getProtoFast(obj: any): any {
  return Object.getPrototypeOf(obj)
}
```

### Inconsistent Behavior Across Engines

```typescript
// ⚠️  Different browsers may handle __proto__ differently
const obj = {}
obj.__proto__ = myPrototype

// ✅ Consistent: Standard methods work everywhere
const obj2 = Object.create(myPrototype)
```

## Related Rules

- [no-implicit-globals](../patterns/no-implicit-globals.md) - Disallow implicit global variables
- [no-implied-eval](../patterns/no-implied-eval.md) - Disallow implied eval
- [security/no-prototype-pollution](../security/no-prototype-pollution.md) - Detect prototype pollution vulnerabilities

## Further Reading

- [MDN: Object.prototype.**proto**](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/proto)
- [MDN: Object.getPrototypeOf()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/getPrototypeOf)
- [MDN: Object.setPrototypeOf()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/setPrototypeOf)
- [Prototype Pollution](https://hackerone.com/reports/711839) - Security implications
- [Object Creation in JavaScript](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Objects/Object_prototypes)

## Auto-Fix

This rule is not auto-fixable. Replacing `__proto__` requires understanding the intended use case:

- For reading the prototype, use `Object.getPrototypeOf()`
- For creating objects with specific prototypes, use `Object.create()`
- For modifying prototypes, use `Object.setPrototypeOf()` (with caution)

Use interactive mode to review violations:

```bash
codeforge analyze --rules no-proto
```
