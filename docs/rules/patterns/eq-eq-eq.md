# eq-eq-eq

![Recommended](https://img.shields.io/badge/-recommended-blue)

| Property    | Value    |
| ----------- | -------- |
| Category    | patterns |
| Fixable     | Yes      |
| Recommended | Yes      |
| Deprecated  | No       |

## Description

Require strict equality operators (=== and !==) instead of loose equality operators (== and !=). Loose equality can lead to unexpected type coercion.

## Why This Rule Matters

Using loose equality operators is dangerous because:

- **Type coercion surprises**: JavaScript performs implicit type conversions that can lead to unexpected results
- **Inconsistent behavior**: Different types are converted in different ways depending on the operator
- **Hard-to-find bugs**: Coercion bugs can be subtle and difficult to debug
- **Unintended truthy/falsy matches**: Values like `0`, `''`, `[]`, and `undefined` may match unexpectedly
- **Code clarity**: Strict equality makes your intent explicit

### Common Coercion Surprises

```javascript
// SURPRISE: Loose equality matches different types
0 == ''          // true (number coerced to string, or string to number)
0 == '0'         // true (both coerced to number)
null == undefined // true (special case in JS)
[] == ''         // true (array coerced to string, then compared)
[] == 0          // true (array coerced to number)
[1] == 1        // true (array coerced to string, then to number)
[1,2] == '1,2'  // true (array coerced to comma-separated string)
```

## Loose Equality Operators Detected

This rule detects the following loose equality operators:

- `==` - Loose equality
- `!=` - Loose inequality

Note: The rule makes an exception for `null == null` comparisons, which are sometimes used intentionally.

## When to Use This Rule

**Use this rule when:**

- You want to prevent type coercion bugs
- Your codebase uses TypeScript or strict JavaScript
- You value code predictability and clarity
- You work in a team where developers may not be familiar with JavaScript's coercion rules

**Consider disabling when:**

- You need to compare values of different types intentionally
- You're working with legacy code that relies on coercion
- You're writing code specifically designed to handle type coercion

## Code Examples

### ❌ Incorrect - Using Loose Equality

```typescript
// Using loose equality - can cause unexpected type coercion
if (userCount == 0) {
  // What if userCount is '0'? Or []? Or ''?
  // All would match due to coercion
}

if (value == null) {
  // This matches both null AND undefined due to coercion
}

if (options.enabled == true) {
  // 'enabled' could be truthy string "yes" or non-zero number
}
```

```typescript
// Loose inequality
if (statusCode != 200) {
  // May catch more than you expect due to coercion
}

if (input != '') {
  // Empty array [] would not be caught (coerces to '')
}
```

### ✅ Correct - Using Strict Equality

```typescript
// Use strict equality for predictable comparisons
if (userCount === 0) {
  // Only matches the number 0
}

if (value === null) {
  // Only matches null, not undefined
}

if (options.enabled === true) {
  // Only matches the boolean true, not truthy values
}
```

```typescript
// Check for null OR undefined explicitly
if (value == null) {
  // Sometimes acceptable when you want both
}

// Or be explicit:
if (value === null || value === undefined) {
  // Clearer intent
}
```

### ✅ Correct - Explicit Type Conversion

```typescript
// When comparing different types, convert explicitly
if (Number(userCount) === 0) {
  // Clear intent: convert to number, then compare
}

if (String(statusCode) === '200') {
  // Clear intent: convert to string, then compare
}

// Check for truthy values explicitly
if (Boolean(options.enabled) === true) {
  // Or simply:
  if (options.enabled) {
    // ...
  }
}
```

## How to Fix Violations

### 1. Replace == with ===

```diff
- if (userCount == 0) {
+ if (userCount === 0) {
    // Code here
  }
```

### 2. Replace != with !==

```diff
- if (statusCode != 200) {
+ if (statusCode !== 200) {
    // Code here
  }
```

### 3. Check for Both null and undefined

```diff
- if (value == null) {
+ if (value === null || value === undefined) {
    // Code here
  }
```

### 4. Convert Types Explicitly When Needed

```diff
- if (input == '0') {
+ if (String(input) === '0') {
    // Code here
  }
```

```diff
- if (count == 10) {
+ if (Number(count) === 10) {
    // Code here
  }
```

### 5. Use Boolean() for Truthy Checks

```diff
- if (enabled == true) {
+ if (Boolean(enabled) === true) {
    // Or simpler:
+ if (enabled) {
    // Code here
  }
}
```

## Best Practices

### When Loose Equality Is Acceptable

Loose equality is acceptable in these scenarios:

1. **Checking for null OR undefined**: `if (value == null)`
2. **Intentional type coercion**: When you explicitly want coercion
3. **Legacy code compatibility**: When working with old codebases

Always document why loose equality is necessary:

```typescript
/**
 * Check if value is null or undefined.
 * Uses loose equality (==) as an intentional shortcut.
 */
function isNil(value: unknown): boolean {
  return value == null
}
```

### Prefer Explicit Comparisons

Instead of relying on coercion, be explicit:

```typescript
// Bad: Relies on coercion
if (items.length == 0) {
  /* ... */
}

// Good: Explicit and clear
if (items.length === 0) {
  /* ... */
}

// Bad: Confusing with loose equality
if (status == 'active') {
  /* ... */
}

// Good: Strict comparison
if (status === 'active') {
  /* ... */
}
```

### Use TypeScript Type Guards

In TypeScript, use type guards instead of equality checks where possible:

```typescript
// Bad: Type narrowing with equality
function processValue(value: string | number) {
  if (typeof value === 'string' && value == '') {
    // ...
  }
}

// Good: Use type guards
function processValue(value: string | number) {
  if (typeof value === 'string' && value === '') {
    // ...
  }
}
```

## Common Pitfalls

### Type Coercion Surprises

```javascript
// ❌ Unexpected: Different types match with loose equality
0 == ''           // true (surprising!)
0 == '0'          // true (both coerce to number)
null == undefined  // true (special case)
[] == ''          // true (array to string coercion)
[] == 0           // true (array to number coercion)
[1] == 1          // true (array to string to number)
false == 0        // true (boolean to number)

// ✅ Use strict equality for predictable results
0 === ''           // false (different types)
0 === '0'          // false (different types)
null === undefined  // false (different types)
[] === ''          // false (different types)
[] === 0           // false (different types)
false === 0        // false (different types)
```

### Checking for Empty Values

```javascript
// ❌ Loose equality fails for empty arrays
const isEmpty = value == '' // [] would match!

// ✅ Be explicit about what you're checking
const isEmpty = value === '' || Array.isArray(value) && value.length === 0

// Or use type-specific checks
function isEmpty(value: unknown): boolean {
  if (typeof value === 'string') return value === ''
  if (Array.isArray(value)) return value.length === 0
  return false
}
```

### Comparing with null/undefined

```javascript
// ❌ Confusing: Does this check null, undefined, or both?
if (value == null) {
  /* ... */
}

// ✅ Be explicit
if (value === null || value === undefined) {
  /* ... */
}

// ✅ Or use optional chaining and nullish coalescing
const result = value ?? defaultValue
```

## Related Rules

- [no-implicit-coercion](../patterns/no-implicit-coercion.md) - Disallow type coercion in general
- [no-extra-boolean-cast](../patterns/no-extra-boolean-cast.md) - Disallow unnecessary boolean casts
- [strict-type-predicates](../patterns/strict-type-predicates.md) - Enforce strict type predicates

## Further Reading

- [MDN: Equality Comparisons and Sameness](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Equality_comparisons_and_sameness)
- [JavaScript Equality Table](https://dorey.github.io/JavaScript-Equality-Table/) - Visual comparison of all equality cases
- [Understanding JavaScript's == vs ===](https://stackoverflow.com/questions/359494/which-equals-operator-vs-should-be-used-in-javascript-comparisons)

## Auto-Fix

This rule is auto-fixable. CodeForge can automatically replace loose equality operators with strict equality operators.

```bash
codeforge analyze --fix
```

Note: While auto-fix is available, review the changes to ensure they align with your intent, especially when comparing against `null` (since loose equality checks for both `null` and `undefined`).
