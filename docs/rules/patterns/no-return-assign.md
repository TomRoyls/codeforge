# no-return-assign

![Recommended](https://img.shields.io/badge/-recommended-blue)

| Property    | Value    |
| ----------- | -------- |
| Category    | patterns |
| Fixable     | No       |
| Recommended | Yes      |
| Deprecated  | No       |

## Description

Disallow assignment operators in return statements. Return statements like `return a = b` are confusing - it's unclear whether you intended to assign a value or make a comparison. Always perform assignments before returning the result.

## Why This Rule Matters

Using assignments in return statements creates confusing code because:

- **Ambiguous intent**: `return a = b` makes readers wonder if you meant `return a === b` (comparison)
- **Unexpected side effects**: The assignment happens but the returned value might not match expectations
- **Debugging difficulties**: Side effects in return statements are hard to trace
- **Readability suffers**: Return statements should be clean and predictable
- **Common mistake pattern**: Typing `=` instead of `===` or `==` in conditionals

### Common Mistakes

```javascript
// MISTAKE: Assignment in return statement
return (user = getUser())
// Did you mean to assign or just return getUser()?
```

```javascript
// MISTAKE: Could be a typo for comparison
return (x = y)
// Did you mean return x === y?
```

## When to Use This Rule

**Use this rule when:**

- You want to prevent confusing return statements
- Your codebase prioritizes code clarity and maintainability
- You work in a team where clear intent matters
- You want to catch potential typos like `return a = b` instead of `return a === b`

**Consider disabling when:**

- You intentionally need assignment in return (rare)
- You're working with legacy code that heavily uses this pattern

## Code Examples

### ❌ Incorrect - Assignment in Return Statements

```typescript
// Assignment in return statement
return (user = getUser())
```

```typescript
// Assignment with comparison intent?
return (x = y)
```

```typescript
// Multiple assignments in return
return ((a = 1), (b = 2))
```

### ✅ Correct - Assignment Before Return

```typescript
// Assign then return
const user = getUser()
return user
```

```typescript
// Just return directly
return getUser()
```

```typescript
// Comparison in return
return x === y
```

```typescript
// Multiple assignments before return
const a = 1
const b = 2
return a + b
```

### ✅ Correct - Conditional Assignment Before Return

```typescript
// Conditional assignment then return
const value = shouldUseDefault ? defaultValue : computedValue
return value
```

```typescript
// Inline conditional
return shouldUseDefault ? defaultValue : computedValue
```

## How to Fix Violations

### 1. Separate Assignment and Return

```diff
- return user = getUser()
+ const user = getUser()
+ return user
```

### 2. Remove Unnecessary Assignment

```diff
- return value = getComputedValue()
+ return getComputedValue()
```

### 3. Fix Comparison Typos

```diff
- return x = y
+ return x === y
```

```diff
- return status = SUCCESS
+ return status === SUCCESS
```

### 4. Use Inline Conditional

```diff
- return result = isValid ? true : false
+ return isValid
```

```diff
- return value = shouldCompute ? compute() : null
+ return shouldCompute ? compute() : null
```

### 5. Handle Multiple Assignments

```diff
- return a = 1, b = 2
+ const a = 1
+ const b = 2
+ return [a, b]
```

## Best Practices

### Write Clear Return Statements

Return statements should be simple and predictable:

```typescript
// ✅ Clear: Direct return
return getValue()

// ✅ Clear: Named variable
const value = getValue()
return value

// ✅ Clear: Conditional
return isValid ? successValue : failureValue

// ❌ Confusing: Assignment in return
return (value = getValue())
```

### Separate Concerns

Assignments and returns should happen at different times:

```typescript
// ✅ Good: Assign, then use
function getUser() {
  const user = fetchUser()
  return user
}

// ✅ Good: Return directly
function getUser() {
  return fetchUser()
}

// ❌ Bad: Mix assignment and return
function getUser() {
  return (user = fetchUser())
}
```

### Avoid Side Effects in Returns

Return statements should not have side effects:

```typescript
// ❌ Bad: Side effect in return
return (cache[key] = computeValue())

// ✅ Good: Separate side effect from return
cache[key] = computeValue()
return cache[key]
```

### Use Descriptive Variable Names

When you need to assign before returning, use clear names:

```typescript
// ✅ Good: Clear intent
const authenticatedUser = authenticate(credentials)
return authenticatedUser

// ❌ Bad: Unclear intent
return (u = auth(c))
```

## Common Pitfalls

### Typos for Comparison

```javascript
// ❌ Common typo: Using = instead of ===
function isEqual(a, b) {
  return (a = b) // Always returns b!
}

// ✅ Correct: Using comparison
function isEqual(a, b) {
  return a === b
}
```

### Unnecessary Assignment

```javascript
// ❌ Unnecessary assignment
function getValue() {
  return (result = expensiveComputation())
}

// ✅ Direct return
function getValue() {
  return expensiveComputation()
}
```

### Side Effects in Returns

```javascript
// ❌ Hard to debug side effect
function getUser(id) {
  return (currentUser = loadUser(id))
}

// ✅ Separate concerns
function getUser(id) {
  const user = loadUser(id)
  currentUser = user
  return user
}
```

### Chained Assignments

```javascript
// ❌ Confusing chained assignment
return (a = b = c = 1)

// ✅ Clear separate assignments
const c = 1
const b = c
const a = b
return a
```

## Related Rules

- [no-assign-in-expression](../patterns/no-assign-in-expression.md) - Disallow assignment in expressions
- [no-sequences](../patterns/no-sequences.md) - Disallow comma operator sequences
- [no-unused-vars](../patterns/no-unused-vars.md) - Disallow unused variables

## Further Reading

- [MDN: Assignment Operators](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Assignment_operators)
- [Clean Code: Meaningful Names](https://blog.cleancoder.com/uncle-bob/2008/09/29/TheLittlePrimer.html)
- [JavaScript Style Guide](https://github.com/airbnb/javascript#functions--return-instruction)

## Auto-Fix

This rule is not auto-fixable. Determining whether `return a = b` should be `return a === b` or requires separating the assignment requires understanding the intended logic.

Use interactive mode to review violations:

```bash
codeforge analyze --rules no-return-assign
```
