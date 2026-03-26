# no-explicit-any

![Recommended](https://img.shields.io/badge/-recommended-blue)

| Property    | Value    |
| ----------- | -------- |
| Category    | patterns |
| Fixable     | Yes      |
| Recommended | Yes      |
| Deprecated  | No       |

## Description

Disallow usage of the `any` type in TypeScript. The `any` type disables type checking and defeats TypeScript's main purpose. Using `any` allows TypeScript to opt-out of type checking, which can lead to runtime errors that TypeScript would normally catch.

## Why This Rule Matters

Using the `any` type is problematic because:

- **Lost type safety**: TypeScript won't catch type-related errors when `any` is used
- **Silent failures**: Mistakes in property names or function calls won't be caught at compile time
- **Broken autocomplete**: IDEs can't provide accurate suggestions for `any` types
- **Code maintainability**: Other developers can't understand the expected types without reading the code
- **False confidence**: Code appears type-safe but actually bypasses all type checking
- **Refactoring difficulty**: Renaming properties or changing function signatures won't be caught

### Type Safety Examples

```typescript
// ❌ With any type - no compile-time errors
const data: any = getUser()

// Typos won't be caught
data.userNamee // typo - no error!

// Wrong property access
data.user.age // data.user might not exist - no error!

// Wrong function arguments
data.saveUser(123) // saveUser might expect a User object - no error!
```

```typescript
// ✅ With specific types - compile-time errors
interface User {
  username: string
  age: number
}

const data: User = getUser()

// Typos are caught
data.userNamee // Error: Property 'userNamee' does not exist

// Wrong property access is caught
data.user.age // Error: Property 'user' does not exist

// Wrong function arguments are caught
data.saveUser(123) // Error: Argument of type 'number' is not assignable to parameter of type 'User'
```

## Configuration Options

```json
{
  "rules": {
    "no-explicit-any": [
      "error",
      {
        "allowInGenericArrays": false,
        "allowAsTypeAssertion": false
      }
    ]
  }
}
```

| Option                 | Type      | Default | Description                                           |
| ---------------------- | --------- | ------- | ----------------------------------------------------- |
| `allowInGenericArrays` | `boolean` | `false` | Allow `any[]` as array element type                   |
| `allowAsTypeAssertion` | `boolean` | `false` | Allow type assertions to `any` (e.g., `value as any`) |

### allowInGenericArrays Option

The `allowInGenericArrays` option permits arrays with `any` as their element type.

```json
{
  "rules": {
    "no-explicit-any": [
      "error",
      {
        "allowInGenericArrays": true
      }
    ]
  }
}
```

With this configuration, `any[]` arrays are allowed but standalone `any` types are still detected.

### allowAsTypeAssertion Option

The `allowAsTypeAssertion` option permits type assertions to `any`.

```json
{
  "rules": {
    "no-explicit-any": [
      "error",
      {
        "allowAsTypeAssertion": true
      }
    ]
  }
}
```

With this configuration, type assertions like `value as any` or `<any>value` are allowed but other uses of `any` are still detected.

## When to Use This Rule

**Use this rule when:**

- You want to enforce type safety across your codebase
- You're working with a team where consistent type discipline matters
- You want to catch potential runtime errors at compile time
- You want to improve IDE autocomplete and refactoring capabilities
- You're maintaining a large TypeScript codebase

**Consider disabling when:**

- Migrating JavaScript to TypeScript incrementally
- Working with legacy code that lacks type definitions
- Developing with libraries that have poor or missing type definitions
- Prototyping code where exact types are not yet known
- Working with third-party APIs that don't provide proper types

## Code Examples

### ❌ Incorrect - Using any Type

```typescript
// Direct any type
const data: any = fetchData()
```

```typescript
// Function parameters with any
function process(input: any): void {
  // Lost type safety
}
```

```typescript
// Return type any
function getData(): any {
  return { value: 123 }
}
```

```typescript
// Array of any
const items: any[] = [1, 'two', { three: 3 }]
```

```typescript
// Type assertion to any
const value = something as any
```

```typescript
// Type assertion with angle brackets
const value = <any>something
```

### ✅ Correct - Using Specific Types

```typescript
// Define a proper interface
interface User {
  id: string
  name: string
  email: string
}

const data: User = fetchData()
```

```typescript
// Function with typed parameters
function process(input: string, options: Record<string, unknown>): void {
  // Type safety maintained
}
```

```typescript
// Return typed data
function getData(): { value: number } {
  return { value: 123 }
}
```

```typescript
// Use union types for multiple types
const items: (string | number | { three: number })[] = [1, 'two', { three: 3 }]
```

```typescript
// Use unknown instead of any for truly unknown data
function parseJSON(json: string): unknown {
  return JSON.parse(json)
}
```

```typescript
// Use type guards with unknown
function isUser(data: unknown): data is User {
  return typeof data === 'object' && data !== null && 'id' in data
}
```

### ✅ Correct - Using unknown and Type Guards

```typescript
// unknown is safer than any
function processData(data: unknown) {
  if (typeof data === 'string') {
    // TypeScript knows data is string here
    console.log(data.toUpperCase())
  }
}
```

```typescript
// Type guard for custom types
interface ApiResponse {
  status: number
  data: unknown
}

function isSuccess(response: unknown): response is ApiResponse & { status: 200 } {
  return (
    typeof response === 'object' &&
    response !== null &&
    'status' in response &&
    'data' in response &&
    (response as ApiResponse).status === 200
  )
}
```

## How to Fix Violations

### 1. Replace any with Specific Types

```diff
- const user: any = getUser()
+ interface User {
+   id: string
+   name: string
+ }
+ const user: User = getUser()
```

### 2. Replace any with unknown for Unknown Data

```diff
- function parseData(json: string): any {
+ function parseData(json: string): unknown {
    return JSON.parse(json)
  }
```

### 3. Use Union Types for Multiple Possible Types

```diff
- function getValue(key: string): any {
+ function getValue(key: string): string | number | boolean {
    // implementation
  }
```

### 4. Use Generics for Reusable Functions

```diff
- function first(items: any[]): any {
+ function first<T>(items: T[]): T | undefined {
    return items[0]
  }
```

### 5. Replace any[] with Typed Arrays

```diff
- const numbers: any[] = [1, 2, 3]
+ const numbers: number[] = [1, 2, 3]
```

```diff
- const items: any[] = fetchData()
+ interface Item {
+   id: string
+   name: string
+ }
+ const items: Item[] = fetchData()
```

### 6. Use Type Assertions Instead of any

```diff
- const value = data as any
+ const value = data as ExpectedType
```

### 7. Use Type Guards for Runtime Validation

```diff
- function process(data: any) {
-   console.log(data.value)
+ function process(data: unknown) {
+   if (typeof data === 'object' && data !== null && 'value' in data) {
+     console.log((data as { value: string }).value)
+   }
  }
```

## Best Practices

### When unknown Is Better Than any

Use `unknown` instead of `any` when you truly don't know the type:

1. **Unknown data sources**: JSON parsing, API responses
2. **Migration scenarios**: Gradually improving types
3. **Runtime validation**: Using type guards to narrow types
4. **Generic libraries**: Working with user-provided data

```typescript
// ✅ Better: unknown requires type narrowing
function handleInput(input: unknown) {
  if (typeof input === 'string') {
    // TypeScript knows input is string here
    return input.toUpperCase()
  }
  throw new Error('Expected string')
}
```

### Using Type Guards

Type guards help narrow down `unknown` types safely:

```typescript
interface User {
  id: string
  name: string
}

function isUser(value: unknown): value is User {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'name' in value &&
    typeof value.id === 'string' &&
    typeof value.name === 'string'
  )
}

function process(value: unknown) {
  if (isUser(value)) {
    // TypeScript knows value is User here
    console.log(value.name)
  }
}
```

### Generics Over any

Use generics for reusable, type-safe functions:

```typescript
// ❌ Bad: any loses type information
function first(arr: any[]): any {
  return arr[0]
}

// ✅ Good: generics preserve type information
function first<T>(arr: T[]): T | undefined {
  return arr[0]
}

const users = [{ name: 'Alice' }, { name: 'Bob' }]
const user = first(users) // Type is { name: string } | undefined
```

### Documenting Temporarily Acceptable Uses

If you must use `any`, document why:

```typescript
// TODO: Replace with proper types when library provides them
// See: https://github.com/library/issues/123
function thirdPartyIntegration(options: any): void {
  // implementation
}
```

## Common Pitfalls

### Assuming any Is Safe for Migration

```typescript
// ❌ Bad approach: Add any everywhere to "fix" errors
const data: any = legacyCode()
data.someMethod() // No error, but might crash at runtime

// ✅ Better approach: Gradually improve types
interface LegacyData {
  someMethod(): void
}
const data: Partial<LegacyData> & Record<string, unknown> = legacyCode()
if ('someMethod' in data && typeof data.someMethod === 'function') {
  data.someMethod()
}
```

### Using any for "Convenience"

```typescript
// ❌ Bad: any is not a shortcut
function log(data: any) {
  console.log(data) // Loses type safety
}

// ✅ Better: Use generics
function log<T>(data: T): T {
  console.log(data)
  return data // Still returns the same type
}
```

### Forgetting Type Guards with unknown

```typescript
// ❌ Bad: Using unknown directly
function process(data: unknown) {
  console.log(data.value) // Error: Property 'value' does not exist on type 'unknown'
}

// ✅ Good: Use type guards
function process(data: unknown) {
  if (typeof data === 'object' && data !== null && 'value' in data) {
    console.log((data as { value: unknown }).value)
  }
}
```

## Related Rules

- [no-implicit-any](../patterns/no-implicit-any.md) - Disallow implicit any types
- [consistent-type-assertions](../patterns/consistent-type-assertions.md) - Enforce consistent type assertion style
- [no-unsafe-assignment](../patterns/no-unsafe-assignment.md) - Disallow assigning any to typed variables

## Further Reading

- [TypeScript: any vs unknown](https://www.typescriptlang.org/docs/handbook/2/functions.html#any)
- [Type Guards and Differentiating Types](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates)
- [Why TypeScript's `any` is dangerous](https://www.totaltypescript.com/tips/dont-use-the-any-type-in-typescript)

## Auto-Fix

This rule is partially auto-fixable. It can replace `any` with `unknown`, but you should review these changes to ensure they're appropriate for your codebase.

The auto-fix will:

- Replace `any` with `unknown` in type annotations
- Not fix `any[]` arrays when `allowInGenericArrays` is false (requires manual type specification)
- Not fix type assertions to `any` when `allowAsTypeAssertion` is false (requires manual review)

Use interactive mode to review fixes:

```bash
codeforge analyze --rules no-explicit-any --fix
```
