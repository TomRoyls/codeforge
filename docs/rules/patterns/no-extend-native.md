# no-extend-native

![Recommended](https://img.shields.io/badge/-recommended-blue)

| Property    | Value    |
| ----------- | -------- |
| Category    | patterns |
| Fixable     | No       |
| Recommended | Yes      |
| Deprecated  | No       |

## Description

Disallow extending native objects like `Array`, `String`, `Object`, etc. Modifying native prototypes is a dangerous practice that can lead to name collisions, unexpected behavior, and compatibility issues. Extensions added to global objects affect all code in the application, including third-party libraries.

## Why This Rule Matters

Extending native prototypes is dangerous because:

- **Name collisions**: Future JavaScript versions or other libraries may add methods with the same names
- **Global pollution**: Changes affect all code in your application, including third-party libraries
- **Unexpected behavior**: Code that relies on standard behavior may break
- **Maintainability issues**: Other developers may not expect custom methods on built-in types
- **Testing complexity**: Mocking or testing becomes more difficult
- **Security risks**: Prototype pollution can lead to security vulnerabilities

### Real-World Example of Name Collision

```javascript
// Your code extends Array.prototype with 'first' method
Array.prototype.first = function () {
  return this[0]
}

// Later, JavaScript or a library adds 'first' with different behavior
// Now all your code using .first() is broken!
```

## Detects Extensions To

This rule detects extensions to the following native constructors:

- `Object.prototype`
- `Array.prototype`
- `String.prototype`
- `Number.prototype`
- `Boolean.prototype`
- `Function.prototype`
- `Date.prototype`
- `RegExp.prototype`
- `Error.prototype`
- `Promise.prototype`
- `Map.prototype`
- `Set.prototype`
- `WeakMap.prototype`
- `WeakSet.prototype`
- `Symbol.prototype`
- `BigInt.prototype`
- `ArrayBuffer.prototype`
- `DataView.prototype`
- `TypedArray.prototype` (Int8Array, Uint8Array, etc.)

## Configuration Options

```json
{
  "rules": {
    "no-extend-native": [
      "error",
      {
        "exceptions": []
      }
    ]
  }
}
```

| Option       | Type       | Default | Description                                                        |
| ------------ | ---------- | ------- | ------------------------------------------------------------------ |
| `exceptions` | `string[]` | `[]`    | List of native prototypes that can be extended (e.g., `["Array"]`) |

### exceptions Option Usage

The `exceptions` option permits extending specific native prototypes when necessary.

```json
{
  "rules": {
    "no-extend-native": [
      "error",
      {
        "exceptions": ["String"]
      }
    ]
  }
}
```

**Warning**: Use exceptions sparingly and document the justification thoroughly.

## When to Use This Rule

**Use this rule when:**

- You want to prevent prototype pollution
- You prioritize code maintainability and compatibility
- You work with third-party libraries
- You want to avoid future JavaScript version conflicts
- You care about code testability and predictability

**Consider disabling when:**

- You're implementing a polyfill for missing features (use a polyfill library instead)
- You're working in a controlled environment with no third-party dependencies
- You absolutely need to extend a native prototype (consider alternatives first)

## Code Examples

### ❌ Incorrect - Extending Native Prototypes

```typescript
// Extending Array.prototype
Array.prototype.first = function () {
  return this[0]
}

// Using the custom method
const numbers = [1, 2, 3]
const first = numbers.first() // Violation
```

```typescript
// Extending String.prototype
String.prototype.capitalize = function () {
  return this.charAt(0).toUpperCase() + this.slice(1)
}

// Using the custom method
const message = 'hello'
const result = message.capitalize() // Violation
```

```typescript
// Extending Object.prototype
Object.prototype.isEmpty = function () {
  return Object.keys(this).length === 0
}

// Using the custom method
const obj = {}
const empty = obj.isEmpty() // Violation
```

```typescript
// Extending multiple prototypes
Array.prototype.last = function () {
  return this[this.length - 1]
}

String.prototype.reverse = function () {
  return this.split('').reverse().join('')
}

Number.prototype.toCurrency = function () {
  return '$' + this.toFixed(2)
}
```

### ✅ Correct - Using Utility Functions

```typescript
// Create utility functions instead
function first<T>(array: T[]): T | undefined {
  return array[0]
}

// Use the utility function
const numbers = [1, 2, 3]
const firstElement = first(numbers)
```

```typescript
// Create utility module
export class StringUtils {
  static capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }

  static reverse(str: string): string {
    return str.split('').reverse().join('')
  }

  static truncate(str: string, length: number): string {
    return str.length > length ? str.slice(0, length) + '...' : str
  }
}

// Use the utility class
const message = 'hello'
const capitalized = StringUtils.capitalize(message)
```

```typescript
// Create object utilities
export const ObjectUtils = {
  isEmpty(obj: object): boolean {
    return Object.keys(obj).length === 0
  },

  deepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj))
  },

  merge<T extends object>(target: T, source: Partial<T>): T {
    return { ...target, ...source }
  },
}

// Use the utility object
const obj = {}
const empty = ObjectUtils.isEmpty(obj)
```

### ✅ Correct - Using Custom Classes

```typescript
// Create a custom class with the methods you need
class EnhancedArray<T> {
  private items: T[]

  constructor(items: T[] = []) {
    this.items = items
  }

  first(): T | undefined {
    return this.items[0]
  }

  last(): T | undefined {
    return this.items[this.items.length - 1]
  }

  getItems(): T[] {
    return [...this.items]
  }
}

// Use the custom class
const numbers = new EnhancedArray([1, 2, 3])
const first = numbers.first()
```

```typescript
// Create a custom string wrapper
class SmartString {
  private value: string

  constructor(value: string) {
    this.value = value
  }

  capitalize(): this {
    this.value = this.value.charAt(0).toUpperCase() + this.value.slice(1)
    return this
  }

  reverse(): this {
    this.value = this.value.split('').reverse().join('')
    return this
  }

  toString(): string {
    return this.value
  }
}

// Use the custom wrapper
const message = new SmartString('hello').capitalize().reverse()
```

### ✅ Correct - Using Composition Over Extension

```typescript
// Create a helper module that takes the object as a parameter
export const ArrayHelpers = {
  first<T>(arr: T[]): T | undefined {
    return arr[0]
  },

  last<T>(arr: T[]): T | undefined {
    return arr[arr.length - 1]
  },

  unique<T>(arr: T[]): T[] {
    return Array.from(new Set(arr))
  },
}

// Use the helpers
const numbers = [1, 2, 3, 2, 1]
const first = ArrayHelpers.first(numbers)
const unique = ArrayHelpers.unique(numbers)
```

### ✅ Correct - Using Extensions for Specific Types

```typescript
// Create type-safe utilities for specific types
interface ArrayUtils {
  first<T>(arr: readonly T[]): T | undefined
  last<T>(arr: readonly T[]): T | undefined
  chunk<T>(arr: T[], size: number): T[][]
}

export const arrayUtils: ArrayUtils = {
  first(arr) {
    return arr[0]
  },

  last(arr) {
    return arr[arr.length - 1]
  },

  chunk(arr, size) {
    const result: any[] = []
    for (let i = 0; i < arr.length; i += size) {
      result.push(arr.slice(i, i + size))
    }
    return result
  },
}
```

## How to Fix Violations

### 1. Replace Prototype Extension with Utility Function

```diff
- Array.prototype.first = function() {
-   return this[0];
- }
+ export function first<T>(array: T[]): T | undefined {
+   return array[0];
+ }

// Usage
- const result = myArray.first();
+ const result = first(myArray);
```

### 2. Create a Utility Module

```diff
- String.prototype.capitalize = function() {
-   return this.charAt(0).toUpperCase() + this.slice(1);
- }
- String.prototype.reverse = function() {
-   return this.split('').reverse().join('');
- }
+ export class StringUtils {
+   static capitalize(str: string): string {
+     return str.charAt(0).toUpperCase() + str.slice(1);
+   }
+   static reverse(str: string): string {
+     return str.split('').reverse().join('');
+   }
+ }

// Usage
- const result = "hello".capitalize().reverse();
+ const result = StringUtils.reverse(StringUtils.capitalize("hello"));
```

### 3. Use Custom Classes or Wrappers

```diff
- Object.prototype.isEmpty = function() {
-   return Object.keys(this).length === 0;
- }
+ class EnhancedObject {
+   constructor(private data: object) {}
+   isEmpty(): boolean {
+     return Object.keys(this.data).length === 0;
+   }
+   getData(): object {
+     return this.data;
+   }
+ }

// Usage
- const obj = {};
- const empty = obj.isEmpty();
+ const wrapper = new EnhancedObject({});
+ const empty = wrapper.isEmpty();
```

### 4. Use Higher-Order Functions

```diff
- Number.prototype.toCurrency = function() {
-   return '$' + this.toFixed(2);
- }
+ export const toCurrency = (num: number): string => {
+   return '$' + num.toFixed(2);
+ };

// Usage
- const price = (100).toCurrency();
+ const price = toCurrency(100);
```

### 5. Chain Multiple Utility Functions

```diff
// Multiple prototype extensions
- String.prototype.capitalize = function() { /* ... */ }
- String.prototype.truncate = function(len) { /* ... */ }
- String.prototype.stripHtml = function() { /* ... */ }

// Usage
- const result = "hello".capitalize().truncate(10).stripHtml();
+ // Chain utility functions
+ import { capitalize, truncate, stripHtml } from './string-utils';
+ const result = stripHtml(truncate(capitalize("hello"), 10));
```

## Best Practices

### When You Might Consider Extensions (With Caution)

1. **Polyfills**: Only when adding missing standard methods, but use established polyfill libraries instead
2. **Isolated environments**: When you have complete control over all code (rare in practice)
3. **Performance-critical code**: Only after proving that alternatives are significantly slower

Even in these cases, prefer established solutions:

```typescript
// ❌ Don't write your own polyfill
if (!Array.prototype.includes) {
  Array.prototype.includes = function (searchElement: any): boolean {
    // Implementation...
  }
}

// ✅ Use a polyfill library
import 'core-js/es/array/includes'
```

### Use TypeScript's Declaration Merging Wisely

TypeScript allows extending types without runtime modifications:

```typescript
// This is safe - only type-level extension
declare global {
  interface Array<T> {
    // Type-only extension
    toSorted(): T[]
  }
}

// Runtime implementation (safe if not on prototype)
export const arrayExtensions = {
  toSorted<T>(arr: T[]): T[] {
    return [...arr].sort()
  },
}
```

### Prefer Composition Over Inheritance

```typescript
// ❌ Bad: Extending Array
class MyArray<T> extends Array<T> {
  customMethod() {
    // ...
  }
}

// ✅ Good: Composition with Array
class MyCollection<T> {
  constructor(private items: T[] = []) {}

  add(item: T): void {
    this.items.push(item)
  }

  customMethod() {
    // ...
  }

  toArray(): T[] {
    return [...this.items]
  }
}
```

### Document Utilities Thoroughly

````typescript
/**
 * Utility functions for array operations.
 * These functions are pure and don't modify the original array.
 *
 * @example
 * ```ts
 * import { first, last } from './array-utils';
 * const result = first([1, 2, 3]); // 1
 * ```
 */
export const ArrayUtils = {
  /**
   * Returns the first element of an array.
   * @param array - The input array
   * @returns The first element or undefined if array is empty
   */
  first<T>(array: readonly T[]): T | undefined {
    return array[0]
  },
}
````

## Common Pitfalls

### For...in Loops with Extended Prototypes

```javascript
// ❌ Dangerous: For...in will include prototype properties
Array.prototype.customMethod = function () {}

const arr = [1, 2, 3]
for (const key in arr) {
  console.log(key) // "0", "1", "2", "customMethod"!
}

// ✅ Safe: Use for...of or forEach instead
for (const value of arr) {
  console.log(value) // 1, 2, 3
}

arr.forEach((value, index) => {
  console.log(index, value)
})
```

### Prototype Pollution Attacks

```javascript
// ❌ Vulnerable to prototype pollution
function merge(target, source) {
  for (const key in source) {
    target[key] = source[key] // Can pollute Object.prototype!
  }
  return target
}

// ✅ Safe: Use Object.assign or spread
const merged = { ...target, ...source }
```

### Breaking Object.hasOwnProperty

```javascript
// ❌ Breaks hasOwnProperty if extended
Object.prototype.hasCustomProperty = function () {}

const obj = {}
obj.hasOwnProperty('key') // Error: Not a function!

// ✅ Use Object.prototype.hasOwnProperty.call
Object.prototype.hasOwnProperty.call(obj, 'key')
```

## Related Rules

- [no-class-assign](../patterns/no-class-assign.md) - Prevent reassigning class names
- [no-prototype-builtins](../patterns/no-prototype-builtins.md) - Prefer calling methods on instances
- [no-new-native-nonconstructor](../patterns/no-new-native-nonconstructor.md) - Don't use new with non-constructor builtins

## Further Reading

- [MDN: Object.prototype](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/prototype)
- [JavaScript: The Good Parts - Appendix A: Awful Parts](https://www.oreilly.com/library/view/javascript-the-good/9780596517748/)
- [Why Extending Built-ins is a Bad Practice](https://stackoverflow.com/questions/14034135/why-is-extending-native-objects-a-bad-practice)
- [Prototype Pollution in JavaScript](https://owasp.org/www-community/vulnerabilities/Prototype_Pollution)
- [JavaScript Core Polyfills](https://github.com/zloirock/core-js)

## Auto-Fix

This rule is not auto-fixable. Replacing prototype extensions requires understanding the intended use and choosing the appropriate alternative pattern.

Use interactive mode to review violations:

```bash
codeforge analyze --rules no-extend-native
```
