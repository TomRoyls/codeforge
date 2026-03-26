# no-nested-ternary

![Recommended](https://img.shields.io/badge/-recommended-blue)

| Property    | Value    |
| ----------- | -------- |
| Category    | patterns |
| Fixable     | No       |
| Recommended | Yes      |
| Deprecated  | No       |

## Description

Disallow nested ternary operators (conditional operator `? :` used within another ternary operator). Nested ternary operators make code difficult to read, understand, and maintain. They often result in complex one-liners that hide logic flow and increase cognitive load for developers.

## Why This Rule Matters

Using nested ternary operators is problematic because:

- **Reduced readability**: Nested ternaries create code that reads like a puzzle rather than a clear statement
- **Hidden logic flow**: Multiple conditions on a single line make it hard to follow the execution path
- **Increased cognitive load**: Developers must mentally parse and evaluate multiple conditions simultaneously
- **Maintenance difficulty**: Small changes to the logic become error-prone
- **Debugging challenges**: Setting breakpoints and stepping through nested ternaries is difficult
- **Type safety issues**: Nested ternaries can create complex type inference problems in TypeScript
- **Team readability**: Not all developers parse ternary operators equally well

### Nested Ternary Readability Issues

```javascript
// ❌ Hard to read - three levels of nesting
const result = isValid ? (isUser ? (isAdmin ? 'admin' : 'user') : 'guest') : 'invalid'

// ✅ Clear - explicit if/else structure
let result
if (isValid) {
  if (isUser) {
    result = isAdmin ? 'admin' : 'user'
  } else {
    result = 'guest'
  }
} else {
  result = 'invalid'
}
```

## Nested Ternary Detection

This rule detects ternary operators that contain other ternary operators in either the consequent (truthy branch) or alternate (falsy branch):

```javascript
// Detects: ternary inside ternary consequent
condition1 ? (condition2 ? value1 : value2) : value3

// Detects: ternary inside ternary alternate
condition1 ? value1 : condition2 ? value2 : value3

// Detects: deeply nested (multiple levels)
cond1 ? (cond2 ? (cond3 ? val1 : val2) : val3) : val4
```

## Configuration Options

```json
{
  "rules": {
    "no-nested-ternary": [
      "error",
      {
        "maxDepth": 2
      }
    ]
  }
}
```

| Option     | Type     | Default | Description                                                                    |
| ---------- | -------- | ------- | ------------------------------------------------------------------------------ |
| `maxDepth` | `number` | `1`     | Maximum allowed nesting depth (1 means no nesting allowed, 2 allows one level) |

### maxDepth Option Usage

The `maxDepth` option allows you to configure how deep nesting can go before triggering a violation.

```json
{
  "rules": {
    "no-nested-ternary": [
      "error",
      {
        "maxDepth": 2
      }
    ]
  }
}
```

With this configuration:

- `depth = 1`: `cond ? val1 : val2` ✅ Allowed (no nesting)
- `depth = 2`: `cond1 ? (cond2 ? val1 : val2) : val3` ✅ Allowed (one level nested)
- `depth = 3`: `cond1 ? (cond2 ? (cond3 ? val1 : val2) : val3) : val4` ❌ Error (two levels nested)

## When to Use This Rule

**Use this rule when:**

- You prioritize code readability and maintainability
- Your team prefers explicit control flow statements
- You want to reduce cognitive load for code reviewers
- You're working on a codebase with varying developer experience levels
- You care about long-term code maintenance

**Consider disabling when:**

- You have a strong, consistent coding style that embraces ternaries
- Your team is experienced with and comfortable with nested ternaries
- You're working on performance-critical code where ternary optimization matters
- You're writing code golf or competitive programming solutions

## Code Examples

### ❌ Incorrect - Nested Ternary Operators

```typescript
// Level 2 nesting
const result = isValid ? (isUser ? 'user' : 'guest') : 'invalid'
```

```typescript
// Level 3 nesting - very hard to read
const status = isAdmin
  ? isActive
    ? isVerified
      ? 'active-admin'
      : 'unverified-admin'
    : 'inactive-admin'
  : 'user'
```

```typescript
// Multiple nested ternaries in one line
const priority = isUrgent ? (isHighPriority ? 1 : 2) : isMediumPriority ? 3 : isLowPriority ? 4 : 5
```

```typescript
// Nested ternary with complex expressions
const value = check1() ? (check2() ? (check3() ? result1 : result2) : result3) : result4
```

```typescript
// Nested ternary in object property
const config = {
  level: isProduction ? (isStaging ? 2 : 3) : 1,
  enabled: isEnabled ? true : false,
}
```

### ✅ Correct - Using if/else Statements

```typescript
// Clear if/else chain
let result
if (isValid) {
  if (isUser) {
    result = 'user'
  } else {
    result = 'guest'
  }
} else {
  result = 'invalid'
}
```

```typescript
// Early return pattern
function getStatus(): string {
  if (!isProduction) {
    return 'user'
  }

  if (!isActive) {
    return 'inactive-admin'
  }

  return isVerified ? 'active-admin' : 'unverified-admin'
}
```

```typescript
// Guard clauses pattern
function getPriority(): number {
  if (isUrgent) {
    return isHighPriority ? 1 : 2
  }

  if (isMediumPriority) {
    return 3
  }

  if (isLowPriority) {
    return 4
  }

  return 5
}
```

```typescript
// Switch statement for multiple conditions
function getLevel(): number {
  if (!isProduction) {
    return 1
  }

  if (!isStaging) {
    return 3
  }

  return 2
}
```

### ✅ Correct - Single Ternary (Not Nested)

```typescript
// Single-level ternary is fine
const result = isValid ? 'valid' : 'invalid'
```

```typescript
// Single ternary with complex condition is acceptable
const status = isAdmin && isActive ? 'active-admin' : 'user'
```

```typescript
// Multiple ternaries on separate lines are not nested
const value1 = condition1 ? result1 : result2
const value2 = condition2 ? result3 : result4
```

```typescript
// Early returns prevent nesting
function getValue(): string {
  if (!isValid) return 'invalid'
  if (!isUser) return 'guest'
  return 'user'
}
```

### ✅ Correct - With maxDepth: 2

```json
// Configuration:
{
  "rules": {
    "no-nested-ternary": [
      "error",
      {
        "maxDepth": 2
      }
    ]
  }
}
```

```typescript
// One level of nesting is allowed
const result = isValid ? (isUser ? 'user' : 'guest') : 'invalid'
```

```typescript
// But two levels are not allowed
const status = isAdmin ? (isActive ? (isVerified ? 'verified' : 'unverified') : 'inactive') : 'user'
// ❌ Error: Nesting depth 3 exceeds maxDepth 2
```

## How to Fix Violations

### 1. Replace with if/else Statement

```diff
- const result = isValid ? (isUser ? 'user' : 'guest') : 'invalid'
+ let result
+ if (isValid) {
+   result = isUser ? 'user' : 'guest'
+ } else {
+   result = 'invalid'
+ }
```

### 2. Use Early Returns

```diff
- const result = isValid ? (isUser ? 'user' : 'guest') : 'invalid'
+ function getResult(): string {
+   if (!isValid) return 'invalid'
+   return isUser ? 'user' : 'guest'
+ }
+ const result = getResult()
```

### 3. Extract to Separate Function

```diff
- const priority = isUrgent ? (isHighPriority ? 1 : 2) : 3
+ function getUrgentPriority(): number {
+   return isHighPriority ? 1 : 2
+ }
+ const priority = isUrgent ? getUrgentPriority() : 3
```

### 4. Use Switch Statement

```diff
- const level = isProduction ? (isStaging ? 2 : 3) : 1
+ function getLevel(): number {
+   if (!isProduction) return 1
+   return isStaging ? 2 : 3
+ }
+ const level = getLevel()
```

### 5. Break into Multiple Assignments

```diff
- const result = cond1 ? (cond2 ? (cond3 ? val1 : val2) : val3) : val4
+ const innerResult = cond2 ? (cond3 ? val1 : val2) : val3
+ const result = cond1 ? innerResult : val4
```

### 6. Use Object Lookup (When Applicable)

```diff
- const value = type === 'admin' ? (isAdmin ? 1 : 2) : 3
+ const priorityMap = {
+   admin: isAdmin ? 1 : 2,
+   default: 3
+ }
+ const value = priorityMap[type] || priorityMap.default
```

## Best Practices

### When Single Ternaries Are Acceptable

Single-level ternary operators are appropriate when:

1. **Simple condition**: The condition is straightforward and easy to understand
2. **Clear assignment**: It's assigning a value based on a boolean condition
3. **No nesting**: No other ternary operator is involved
4. **Readability**: The code remains readable and doesn't require mental gymnastics

```typescript
// ✅ Good: Simple, clear ternary
const isValid = value !== null ? true : false

// ✅ Good: Default value pattern
const name = providedName ?? 'default'

// ✅ Good: Coalescing for optional values
const timeout = config.timeout ?? 3000
```

### Prefer Guard Clauses

Guard clauses make early exits explicit and reduce nesting:

```typescript
// ❌ Bad: Nested conditionals
function process(value: unknown): string {
  if (value !== null) {
    if (typeof value === 'string') {
      return value.toUpperCase()
    }
  }
  return ''
}

// ✅ Good: Guard clauses
function process(value: unknown): string {
  if (value === null) return ''
  if (typeof value !== 'string') return ''
  return value.toUpperCase()
}
```

### Extract Complex Logic to Functions

When logic becomes complex, extract it:

```typescript
// ❌ Bad: Complex nested ternary
const discount = isPremium
  ? isNewCustomer
    ? 20
    : isLoyaltyMember
      ? 15
      : 10
  : isNewCustomer
    ? 5
    : 0

// ✅ Good: Extracted function
function calculateDiscount(
  isPremium: boolean,
  isNewCustomer: boolean,
  isLoyaltyMember: boolean,
): number {
  if (!isPremium) {
    return isNewCustomer ? 5 : 0
  }

  if (isNewCustomer) {
    return 20
  }

  return isLoyaltyMember ? 15 : 10
}

const discount = calculateDiscount(isPremium, isNewCustomer, isLoyaltyMember)
```

### Use Type Guards for Complex Conditions

TypeScript type guards can simplify complex conditionals:

```typescript
// ❌ Bad: Nested ternaries with type checking
const value = isString(input) ? (input.length > 0 ? input : 'default') : 'not-a-string'

// ✅ Good: Type guard with early return
function processValue(input: unknown): string {
  if (typeof input !== 'string') {
    return 'not-a-string'
  }
  return input.length > 0 ? input : 'default'
}
```

### Consider Using Strategy Pattern

For complex conditional logic, consider the strategy pattern:

```typescript
// ❌ Bad: Deeply nested ternary logic
const action =
  userType === 'admin'
    ? actionType === 'delete'
      ? deleteAdmin
      : editAdmin
    : actionType === 'delete'
      ? deleteUser
      : editUser

// ✅ Good: Strategy pattern
interface ActionStrategy {
  delete: () => void
  edit: () => void
}

const adminStrategy: ActionStrategy = {
  delete: deleteAdmin,
  edit: editAdmin,
}

const userStrategy: ActionStrategy = {
  delete: deleteUser,
  edit: editUser,
}

function executeAction(userType: string, actionType: string): void {
  const strategy = userType === 'admin' ? adminStrategy : userStrategy
  actionType === 'delete' ? strategy.delete() : strategy.edit()
}
```

## Common Pitfalls

### Assuming Ternaries Are Always More Concise

```typescript
// ❌ Bad: Ternary is not more readable here
const result = condition1 ? (condition2 ? (condition3 ? value1 : value2) : value3) : value4

// ✅ Good: if/else is clearer
let result
if (condition1) {
  if (condition2) {
    result = condition3 ? value1 : value2
  } else {
    result = value3
  }
} else {
  result = value4
}
```

### Forgetting About Operator Precedence

```typescript
// ❌ Bad: Unclear precedence
const value = a ? b : c ? d : e

// Is this: a ? b : (c ? d : e)
// Or: (a ? b : c) ? d : e

// ✅ Good: Explicit parentheses if nesting is necessary
const value = a ? (b ? c : d) : e
// But still, avoid nesting!
```

### Using Ternaries for Side Effects

```typescript
// ❌ Bad: Ternary with side effects in branches
const result = isValid ? (console.log('valid'), 'valid') : (console.log('invalid'), 'invalid')

// ✅ Good: Use if/else for side effects
let result
if (isValid) {
  console.log('valid')
  result = 'valid'
} else {
  console.log('invalid')
  result = 'invalid'
}
```

### Complex Expressions in Conditions

```typescript
// ❌ Bad: Complex nested ternaries with complex conditions
const result = check1() || check2() ? (check3() && check4() ? value1 : value2) : value3

// ✅ Good: Break down into separate steps
const shouldUseBranch1 = check1() || check2()
const shouldUseValue1 = check3() && check4()

let result
if (shouldUseBranch1) {
  result = shouldUseValue1 ? value1 : value2
} else {
  result = value3
}
```

### TypeScript Type Inference Issues

```typescript
// ❌ Bad: Nested ternaries can create complex types
const value = condition1 ? (condition2 ? 'string1' : 123) : condition3 ? true : null
// Type: string | number | boolean | null

// ✅ Good: Explicit typing and separate logic
function getValue(): string | number | boolean | null {
  if (!condition1) {
    return condition3 ? true : null
  }
  return condition2 ? 'string1' : 123
}

const value = getValue()
```

## Related Rules

- [no-bitwise](../patterns/no-bitwise.md) - Disallow bitwise operators
- [no-implicit-coercion](../patterns/no-implicit-coercion.md) - Disallow type coercion
- [prefer-const](../patterns/prefer-const.md) - Prefer const over let when possible
- [no-magic-numbers](../patterns/no-magic-numbers.md) - Disallow magic numbers

## Further Reading

- [MDN: Conditional (Ternary) Operator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Conditional_operator)
- [Refactoring: Replace Nested Conditional with Guard Clauses](https://refactoring.guru/replace-nested-conditional-with-guard-clauses)
- [Clean Code: Use Guard Clauses Instead of Nested If Statements](https://martinfowler.com/bliki/ReturnNull.html)
- [The Ternary Operator: Use It Sparingly](https://medium.com/@yosef/ternary-operators-in-javascript-when-to-use-them-when-to-avoid-them-dc950d78e9a4)
- [Understanding JavaScript's Ternary Operator](https://www.freecodecamp.org/news/javascript-ternary-operator/)

## Auto-Fix

This rule is not auto-fixable. Replacing nested ternary operators requires understanding the intended logic and choosing the appropriate refactoring strategy.

Use interactive mode to review violations:

```bash
codeforge analyze --rules no-nested-ternary
```

The interactive mode will guide you through fixing each violation with suggested refactoring approaches.
