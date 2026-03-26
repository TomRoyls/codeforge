# no-unsafe-negation

![Recommended](https://img.shields.io/badge/-recommended-blue)

| Property    | Value    |
| ----------- | -------- |
| Category    | patterns |
| Fixable     | Yes      |
| Recommended | Yes      |
| Deprecated  | No       |

## Description

Disallow unsafe negation of the left operand in relational operators (`in`, `instanceof`). Negating the left operand of these operators can lead to confusing and unexpected behavior because the negation applies before the operator, which is rarely the intended logic and often results in code that is difficult to understand and maintain.

## Why This Rule Matters

Using unsafe negation is dangerous because:

- **Confusing precedence**: The negation operator (`!`) has higher precedence than `in` and `instanceof`, leading to unexpected evaluation order
- **Logic errors**: Developers often intend to negate the result of the operation, not the left operand
- **Readability issues**: Negated operands are hard to parse mentally and can obscure the actual intent
- **Silent bugs**: The code may execute but produce incorrect results without throwing errors
- **Maintenance burden**: Future developers may misinterpret the intended logic

### Common Mistakes

```javascript
// MISTAKE: Negating left operand of 'in' operator
// This is NOT "key is NOT in object"
if ((!key) in object) {
  // This evaluates as (!key) in object
  // Usually not what the developer intended
}

// INTENDED: Check if key is NOT in object
if (!(key in object)) {
  // Correctly negates the entire expression
}

// MISTAKE: Negating left operand of 'instanceof' operator
if ((!value) instanceof MyClass) {
  // This evaluates as (!value) instanceof MyClass
  // Almost certainly not what the developer wanted
}

// INTENDED: Check if value is NOT an instance
if (!(value instanceof MyClass)) {
  // Correctly negates the instanceof check
}
```

## Operators Affected

This rule detects unsafe negation with the following relational operators:

- `in` - Check if property exists in object
- `instanceof` - Check if object is instance of constructor

## Configuration Options

```json
{
  "rules": {
    "no-unsafe-negation": ["error"]
  }
}
```

This rule has no additional configuration options.

## When to Use This Rule

**Use this rule when:**

- You want to catch subtle logic errors with negation and relational operators
- Your codebase prioritizes clarity and readability
- You want to prevent common mistakes with operator precedence
- You work in a team setting where clear code is essential

**Consider disabling when:**

- You have rare, intentional use cases that genuinely require negating the left operand (extremely uncommon)
- You're working on code that has been thoroughly tested and reviewed

## Code Examples

### ❌ Incorrect - Unsafe Negation

```typescript
// Negating left operand of 'in' operator
if ((!key) in object) {
  // ERROR: Evaluates as (!key) in object
  // This is almost certainly a mistake
}

// Negating left operand of 'instanceof' operator
if ((!value) instanceof MyClass) {
  // ERROR: Evaluates as (!value) instanceof MyClass
  // Always returns false for non-null values
}

// Negating left operand in complex expressions
if ((!prop) in obj && isValid) {
  // ERROR: Evaluates as ((!prop) in obj) && isValid
  // Confusing and likely unintended
}

// Negating left operand in negated condition
if (!((!prop) in obj)) {
  // ERROR: Double negation that doesn't negate the 'in' operation
  // Evaluates as !((!prop) in obj)
}
```

```typescript
// Unsafe negation with string literals
if ((!'name') in user) {
  // ERROR: Evaluates as (!'name') in user
  // Always returns false
}
```

### ✅ Correct - Proper Negation

```typescript
// Correctly negate the entire 'in' expression
if (!(key in object)) {
  // CORRECT: Check if key is NOT in object
}

// Correctly negate the entire 'instanceof' expression
if (!(value instanceof MyClass)) {
  // CORRECT: Check if value is NOT an instance
}

// Negate the entire complex expression
if (!(prop in obj && isValid)) {
  // CORRECT: Negates the entire logical expression
}

// Use De Morgan's laws for complex negations
if (!(prop1 in obj || prop2 in obj)) {
  // CORRECT: Equivalent to (prop1 not in obj) AND (prop2 not in obj)
}
```

```typescript
// Extract the check into a variable for clarity
const hasProperty = key in object
if (!hasProperty) {
  // CORRECT: Clear and unambiguous
}

// Use a helper function for repeated checks
function hasProperty(obj: object, key: string): boolean {
  return key in obj
}

if (!hasProperty(user, 'name')) {
  // CORRECT: Clear intent, reusable
}
```

```typescript
// For multiple property checks, use an object check
function hasAllProperties(obj: object, keys: string[]): boolean {
  return keys.every((key) => key in obj)
}

if (!hasAllProperties(user, ['name', 'email', 'age'])) {
  // CORRECT: Clear intent for multiple properties
}
```

### ✅ Correct - Alternative Patterns

```typescript
// Use hasOwnProperty for property checks
if (!Object.prototype.hasOwnProperty.call(user, 'name')) {
  // CORRECT: Explicit property ownership check
}

// Use Object.hasOwn (modern alternative)
if (!Object.hasOwn(user, 'name')) {
  // CORRECT: Modern, explicit property check
}

// Check for undefined (when appropriate)
if (user.name === undefined) {
  // CORRECT: Direct value check
}
```

```typescript
// For null/undefined checks
if (value == null) {
  // CORRECT: Checks for both null and undefined
}

// For type guards
function isMyClass(value: unknown): value is MyClass {
  return value instanceof MyClass
}

if (!isMyClass(value)) {
  // CORRECT: Clear type guard with negation
}
```

## How to Fix Violations

### 1. Add Parentheses Around Entire Expression

```diff
- if (!key in object) {
+ if (!(key in object)) {
    // Code here
  }
```

```diff
- if (!value instanceof MyClass) {
+ if (!(value instanceof MyClass)) {
    // Code here
  }
```

### 2. Extract Check to Variable

```diff
- if (!key in object) {
+ const hasKey = key in object
+ if (!hasKey) {
    // Code here
  }
```

### 3. Use Helper Function

```diff
- if (!'name' in user) {
+ function hasProperty(obj: object, key: string): boolean {
+   return key in obj
+ }
+
+ if (!hasProperty(user, 'name')) {
    // Code here
  }
```

### 4. Use Object.hasOwn for Property Checks

```diff
- if (!key in object) {
+ if (!Object.hasOwn(object, key)) {
    // Code here
  }
```

### 5. Apply De Morgan's Laws for Complex Negations

```diff
- if (!(prop1 in obj || prop2 in obj)) {
+ if (!(prop1 in obj) && !(prop2 in obj)) {
    // More explicit and clear
  }
```

## Best Practices

### Prefer Explicit Negation

Always negate the entire expression rather than individual operands:

```typescript
// ❌ Confusing
if ((!key) in obj) {
}

// ✅ Clear
if (!(key in obj)) {
}
```

### Use Helper Functions for Clarity

Extract complex checks into well-named helper functions:

```typescript
function hasProperty(obj: object, key: string): boolean {
  return key in obj
}

function hasAllProperties(obj: object, keys: string[]): boolean {
  return keys.every((key) => key in obj)
}

// Usage
if (!hasProperty(user, 'email')) {
  // Send notification
}

if (!hasAllProperties(user, ['name', 'email', 'age'])) {
  // Validation failed
}
```

### Prefer Type Guards for instanceof

Use type guard functions when working with instanceof:

```typescript
function isMyClass(value: unknown): value is MyClass {
  return value instanceof MyClass
}

if (!isMyClass(value)) {
  // Handle non-MyClass values
}
```

### Consider Alternative Approaches

For property checks, consider alternatives that may be more appropriate:

```typescript
// Instead of: if (!(key in object))
// Use: if (object[key] === undefined)
// When you specifically care about the value being undefined

// Use: if (!Object.hasOwn(object, key))
// When you want to check own properties specifically
```

## Common Pitfalls

### Operator Precedence Confusion

```javascript
// ❌ Common mistake: Thinking !key in object means "key not in object"
if ((!key) in object) {
  // This actually evaluates as: (!key) in object
  // Since !key returns a boolean, this is almost always false
}

// ✅ Correct: Negate the entire expression
if (!(key in object)) {
  // This correctly checks if key is NOT in object
}
```

### instanceof with Negated Operands

```javascript
// ❌ Common mistake: Always returns false for non-null values
if ((!value) instanceof MyClass) {
  // Evaluates as (!value) instanceof MyClass
  // Since !value is a boolean, and booleans are not instances of MyClass
  // This is always false (except when value is null)
}

// ✅ Correct: Negate the instanceof check
if (!(value instanceof MyClass)) {
  // This correctly checks if value is NOT an instance of MyClass
}
```

### Chained Logical Operations

```javascript
// ❌ Confusing: Hard to understand the intent
if ((!key1) in obj && (!key2) in obj) {
  // Evaluates as: ((!key1) in obj) && ((!key2) in obj)
  // Almost certainly not intended
}

// ✅ Clear: Extract checks for clarity
const hasKey1 = key1 in obj
const hasKey2 = key2 in obj
if (!hasKey1 && !hasKey2) {
  // Clear and understandable
}
```

### String Literals

```javascript
// ❌ Always false: Negating a string literal returns false
if ((!'name') in user) {
  // Evaluates as: (!'name') in user
  // Since !'name' is false, this is: false in user
  // Which is always false
}

// ✅ Correct: Properly check property
if (!('name' in user)) {
  // This correctly checks if 'name' is NOT a property of user
}
```

## Related Rules

- [no-bitwise](./no-bitwise.md) - Disallow bitwise operators that can be confused with logical operators
- [eqeqeq](../patterns/eq-eq-eq.md) - Require use of === and !==
- [no-implicit-coercion](../patterns/no-implicit-coercion.md) - Disallow type coercion
- [no-extra-boolean-cast](../patterns/no-extra-boolean-cast.md) - Disallow unnecessary boolean casts

## Further Reading

- [MDN: in Operator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/in)
- [MDN: instanceof Operator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/instanceof)
- [Operator Precedence](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Operator_Precedence)
- [De Morgan's Laws](https://en.wikipedia.org/wiki/De_Morgan%27s_laws)

## Auto-Fix

This rule is auto-fixable. The fix adds parentheses around the entire expression to negate it correctly.

Example auto-fix:

```diff
- if (!key in object) {
+ if (!(key in object)) {
    // Code here
  }
```

Use the fix command to automatically apply corrections:

```bash
codeforge fix --rules no-unsafe-negation
```

Or review fixes interactively:

```bash
codeforge analyze --rules no-unsafe-negation --fix
```
