# no-negated-condition

![Recommended](https://img.shields.io/badge/-recommended-blue)

| Property    | Value    |
| ----------- | -------- |
| Category    | patterns |
| Fixable     | Yes      |
| Recommended | Yes      |
| Deprecated  | No       |

## Description

Disallow negated conditions in control flow statements. Negated conditions make code harder to read and understand because they require mental gymnastics to reverse the logic. This rule encourages writing positive, direct conditions that clearly express the intended behavior.

## Why This Rule Matters

Using negated conditions is problematic because:

- **Cognitive load**: Readers must mentally reverse the logic to understand what's happening
- **Double negatives**: `!isNotDisabled` becomes confusing and error-prone
- **Reduced readability**: Positive statements are generally easier to comprehend
- **Maintenance burden**: Understanding the intended behavior takes longer
- **Error-prone**: It's easy to miss the negation operator, leading to bugs

### Common Issues

```typescript
// CONFUSING: Double negation
if (!user.isActive !== false) {
  // What does this actually mean?
}

// CONFUSING: Negated complex condition
if (!(data.length > 0 && data.isValid)) {
  // Must parse entire condition then reverse it
}

// CONFUSING: Multiple negations
if (!(!isValid || !hasPermission)) {
  // Mental gymnastics required
}
```

## Negated Conditions Detected

This rule detects negated conditions in:

- `if` statements
- `while` loops
- `do-while` loops
- `for` loops (condition part)
- ternary operators
- logical expressions within boolean contexts

## Configuration Options

```json
{
  "rules": {
    "no-negated-condition": [
      "error",
      {
        "allow": ["assert", "guard"]
      }
    ]
  }
}
```

| Option  | Type       | Default | Description                                             |
| ------- | ---------- | ------- | ------------------------------------------------------- |
| `allow` | `string[]` | `[]`    | List of patterns to allow (e.g., `["assert", "guard"]`) |

### allow Option Usage

The `allow` option permits negated conditions in specific contexts where they're idiomatic.

```json
{
  "rules": {
    "no-negated-condition": [
      "error",
      {
        "allow": ["assert", "guard", "throw"]
      }
    ]
  }
}
```

With this configuration, negated conditions in assertions and guard clauses are allowed.

## When to Use This Rule

**Use this rule when:**

- You want to improve code readability and maintainability
- Your team follows positive condition conventions
- You're working on a codebase where clarity is a priority
- You want to reduce cognitive load for code reviewers

**Consider disabling when:**

- Your codebase has established patterns using guard clauses with negation
- You're working with legacy code that extensively uses negated conditions
- Performance-critical sections where negation is intentionally used

## Code Examples

### ❌ Incorrect - Using Negated Conditions

```typescript
// Negated condition in if statement
if (!user.isActive) {
  return 'User is inactive'
}

// Negated complex condition
if (!(data.length > 0 && data.isValid)) {
  return 'Invalid data'
}

// Negated condition in while loop
while (!queue.isEmpty()) {
  processItem(queue.dequeue())
}

// Negated condition in ternary
const result = !isValid ? 'error' : 'success'

// Double negation
if (!(!user.hasPermission && user.isAdmin)) {
  return 'Access denied'
}

// Negated method call
if (!data.includes('key')) {
  return 'Not found'
}
```

### ✅ Correct - Using Positive Conditions

```typescript
// Positive condition in if statement
if (user.isInactive) {
  return 'User is inactive'
}

// Positive complex condition
if (data.length === 0 || !data.isValid) {
  return 'Invalid data'
}

// Positive condition in while loop
while (queue.hasItems()) {
  processItem(queue.dequeue())
}

// Positive condition in ternary
const result = isValid ? 'success' : 'error'

// Positive condition (no double negation)
if (user.hasPermission || user.isAdmin) {
  return 'Access granted'
}

// Positive condition
if (!data.has('key')) {
  return 'Not found'
}
```

### ✅ Correct - Legitimate Uses (with allow option)

```json
// Configuration:
{
  "rules": {
    "no-negated-condition": [
      "error",
      {
        "allow": ["guard", "throw"]
      }
    ]
  }
}
```

```typescript
// Guard clauses are acceptable
function processData(data: Data): Result {
  if (!data) throw new Error('No data provided')
  if (!data.isValid) throw new Error('Invalid data')
  if (!data.hasItems()) return { success: false }

  // Main logic here
  return { success: true, data: data.items }
}

// Assertion patterns
function assert(condition: boolean, message: string): asserts condition {
  if (!condition) throw new AssertionError(message)
}

// Early returns in guard clauses
function authenticate(user: User): Session {
  if (!user.isAuthenticated) return null
  if (!user.isActive) return null
  if (!user.hasPermission) return null

  return new Session(user)
}
```

## How to Fix Violations

### 1. Reverse the Logic

```diff
- if (!user.isActive) {
+ if (user.isInactive) {
    return 'User is inactive'
  }
```

```diff
- if (!isValid) {
+ if (isInvalid) {
    handleError()
  }
```

### 2. Use De Morgan's Laws for Complex Conditions

```diff
- if (!(data.length > 0 && data.isValid)) {
+ if (data.length === 0 || !data.isValid) {
    return 'Invalid data'
  }
```

```diff
- if (!(hasPermission || isAdmin)) {
+ if (!hasPermission && !isAdmin) {
    return 'Access denied'
  }
```

### 3. Extract to Variables with Positive Names

```diff
- if (!(!isValid || !hasPermission)) {
+ const canAccess = isValid && hasPermission
+ if (canAccess) {
    return 'Access granted'
  }
```

```diff
- if (!(data.length > 0 && data.isValid && data.isComplete)) {
+ const isValidData = data.length > 0 && data.isValid && data.isComplete
+ if (!isValidData) {
    return 'Invalid data'
  }
```

### 4. Use Guard Clauses (when allowed)

```diff
- if (data.isValid) {
-   // Main logic
- } else {
-   return 'Invalid data'
- }
+ if (!data.isValid) return 'Invalid data'
+ // Main logic
```

### 5. Rename Methods to be Positive

```diff
- if (!data.isEmpty()) {
-   processData(data)
- }
+ if (data.hasItems()) {
+   processData(data)
+ }
```

```diff
- if (!user.isNotAdmin()) {
-   grantAccess()
- }
+ if (user.isAdmin()) {
+   grantAccess()
+ }
```

## Best Practices

### Prefer Positive Conditions

Always write conditions that express what should happen, not what shouldn't:

```typescript
// ✅ Good: Positive condition
if (user.isActive) {
  processUser(user)
}

// ❌ Bad: Negative condition
if (!user.isInactive) {
  processUser(user)
}
```

### Use Guard Clauses Strategically

Guard clauses with negation can improve readability when they handle edge cases early:

```typescript
// ✅ Acceptable: Guard clause pattern
function process(data: Data): Result {
  if (!data) return { error: 'No data' }
  if (!data.isValid) return { error: 'Invalid' }
  if (!data.hasItems()) return { error: 'Empty' }

  // Main processing logic here - all conditions positive
  return { success: true, items: data.items }
}
```

### Extract Complex Conditions

When conditions become complex, extract them to well-named variables:

```typescript
// ✅ Good: Extracted condition
const isValidUser = user.isActive && user.hasPermission && user.isVerified

if (isValidUser) {
  processUser(user)
}
```

### Use Predicate Methods

Create methods that return boolean with clear, positive names:

```typescript
// ✅ Good: Positive predicate method
class DataValidator {
  isValid(data: Data): boolean {
    return data.length > 0 && this.validateStructure(data)
  }

  canProcess(data: Data): boolean {
    return this.isValid(data) && data.hasItems()
  }
}
```

### Use Early Returns Wisely

Early returns can simplify complex nested conditions:

```typescript
// ✅ Good: Early return pattern
function processData(data: Data): Result {
  if (!data) return { error: 'No data' }
  if (!data.isValid) return { error: 'Invalid' }

  // Happy path - all positive conditions
  return { success: true, data: processValidData(data) }
}
```

## Common Pitfalls

### Double Negations

```typescript
// ❌ Confusing: Double negation
if (!user.isNotAdmin) {
  grantAccess()
}

// ✅ Clear: Positive condition
if (user.isAdmin) {
  grantAccess()
}
```

### Negated Method Names

```typescript
// ❌ Confusing: Negated method call with negated method name
if (!user.isNotAuthenticated) {
  process()
}

// ✅ Clear: Positive method name and condition
if (user.isAuthenticated) {
  process()
}
```

### Negated Complex Expressions

```typescript
// ❌ Confusing: Negated complex condition
if (!(a && b) || !(c || d)) {
  process()
}

// ✅ Clear: Positive conditions
if (!a || !b || (!c && !d)) {
  process()
}
```

### Mixing Negation Styles

```typescript
// ❌ Inconsistent: Mixed negation styles
if ((user.isActive && !user.isBlocked) || !user.isSuspended) {
  process()
}

// ✅ Consistent: All positive
if (user.isActive && user.isNotBlocked && user.isNotSuspended) {
  process()
}
```

## Related Rules

- [no-implicit-coercion](../patterns/no-implicit-coercion.md) - Disallow type coercion
- [no-extra-boolean-cast](../patterns/no-extra-boolean-cast.md) - Disallow unnecessary boolean casts
- [no-nested-ternary](../patterns/no-nested-ternary.md) - Disallow nested ternary operators
- [complexity](../complexity/max-complexity.md) - Limit cyclomatic complexity

## Further Reading

- [Clean Code: Negate Conditions](https://blog.codinghorror.com/coding-horror-style-rules/) - Discussion on code readability
- [Refactoring: Replace Negative with Positive Condition](https://refactoring.com/catalog/replaceNegativeWithPositiveCondition.html) - Refactoring technique
- [Guard Clauses](https://refactoring.com/catalog/replaceNestedConditionalWithGuardClauses.html) - When negation is acceptable
- [De Morgan's Laws](https://en.wikipedia.org/wiki/De_Morgan%27s_laws) - Logic transformation rules

## Auto-Fix

This rule is partially auto-fixable. Simple negations can be automatically reversed, but complex negations may require manual review.

Use interactive mode to review violations:

```bash
codeforge analyze --rules no-negated-condition

# Automatically fix simple cases
codeforge fix --rules no-negated-condition

# Review all fixes before applying
codeforge interactive --rules no-negated-condition
```
