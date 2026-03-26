# no-unneeded-ternary

![Recommended](https://img.shields.io/badge/-recommended-blue)

| Property    | Value    |
| ----------- | -------- |
| Category    | patterns |
| Fixable     | Yes      |
| Recommended | Yes      |
| Deprecated  | No       |

## Description

Disallow ternary operators when simpler and more readable alternatives exist. This rule detects ternary expressions that can be simplified to more straightforward code, improving readability and reducing cognitive complexity.

## Why This Rule Matters

Unnecessary ternary operators are problematic because:

- **Reduced readability**: Simple conditions expressed as ternaries are harder to read than direct assignments
- **Code bloat**: Ternaries add visual noise without adding value
- **Cognitive overhead**: Readers must mentally parse three expressions when one or two would suffice
- **Type confusion**: Ternaries can introduce unexpected type behavior
- **Maintenance burden**: Overly complex ternaries are difficult to modify and debug

### Common Anti-Patterns

```javascript
// UNNEEDED: Can be simplified to direct assignment
const result = condition ? true : false

// UNNEEDED: Can use boolean negation
const isActive = condition ? false : true

// UNNEEDED: Can use direct comparison
const isEqual = value === target ? true : false
```

## Unneeded Ternary Patterns

This rule detects the following unneeded ternary patterns:

### Boolean Literal Patterns

- `condition ? true : false` - Simplifies to `Boolean(condition)` or `!!condition`
- `condition ? false : true` - Simplifies to `!condition`

### Comparison Patterns

- `value === literal ? true : false` - Simplifies to `value === literal`
- `value !== literal ? true : false` - Simplifies to `value !== literal`

### Redundant Value Patterns

- `condition ? value : value` - Simplifies to `value`
- `condition ? value : null` with default - Consider nullish coalescing or logical OR

### Nested Simple Ternaries

- `condition ? (nestedCond ? a : b) : c` - Can often be simplified with if/else

## Configuration Options

```json
{
  "rules": {
    "no-unneeded-ternary": [
      "error",
      {
        "allowBooleanExpressions": false,
        "allowComparisons": true
      }
    ]
  }
}
```

| Option                    | Type      | Default | Description                                                                |
| ------------------------- | --------- | ------- | -------------------------------------------------------------------------- |
| `allowBooleanExpressions` | `boolean` | `false` | Allow ternaries that evaluate to true/false with boolean expressions       |
| `allowComparisons`        | `boolean` | `true`  | Allow ternaries that wrap comparison expressions                           |
| `maxNestingDepth`         | `number`  | `1`     | Maximum nesting depth before flagging (0 to disable, 1 to flag all nested) |

### allowBooleanExpressions Option

When set to `true`, this option allows ternary expressions that produce boolean values from boolean operands:

```typescript
// Allowed with allowBooleanExpressions: true
const result = isValid ? true : false
```

This option is useful if you prefer to explicitly convert boolean values for type safety.

### allowComparisons Option

When set to `true` (default), this option allows ternary expressions that wrap comparison operators:

```typescript
// Allowed by default
const isEqual = value === 5 ? true : false

// Can be simplified, but sometimes kept for explicit boolean conversion
```

Set to `false` to enforce simplification of all comparison-based ternaries.

### maxNestingDepth Option

Controls how many levels of nesting are allowed before flagging:

```typescript
// maxNestingDepth: 1 (default) - flags all nested ternaries
const result = a ? (b ? c : d) : e // ❌ Flagged

// maxNestingDepth: 2 - allows one level of nesting
const result = a ? (b ? c : d) : e // ✅ Allowed
const result = a ? (b ? (c ? d : e) : f) : g // ❌ Flagged
```

## When to Use This Rule

**Use this rule when:**

- You want to enforce simpler, more readable code
- Your team prefers explicit boolean operations over ternaries
- You want to reduce code complexity and cognitive overhead
- You're working in a codebase with readability as a priority

**Consider disabling when:**

- You need consistent type conversion (e.g., ensuring boolean return types)
- Your codebase has a specific pattern of using ternaries for conditional logic
- You're working on performance-critical code where ternary branching is measurable
- You have team conventions that favor ternary expressions

## Code Examples

### ❌ Incorrect - Unneeded Ternary with Boolean Literals

```typescript
// UNNEEDED: Can be simplified to direct boolean
const isValid = check() ? true : false

// UNNEEDED: Can be simplified to negation
const isDisabled = isEnabled ? false : true

// UNNEEDED: Can use Boolean() constructor
const hasValue = input ? true : false
```

```typescript
// UNNEEDED: Nested boolean ternary
const result = a ? (b ? true : false) : true
```

### ❌ Incorrect - Unneeded Ternary with Comparisons

```typescript
// UNNEEDED: Comparison already returns boolean
const isEqual = x === y ? true : false

// UNNEEDED: Comparison already returns boolean
const isNotEqual = x !== y ? true : false

// UNNEEDED: Comparison already returns boolean
const isGreaterThan = x > y ? true : false
```

### ❌ Incorrect - Redundant Value Ternary

```typescript
// UNNEEDED: Both branches return the same value
const result = condition ? DEFAULT_VALUE : DEFAULT_VALUE

// UNNEEDED: Can use logical operator or nullish coalescing
const value = condition ? value : null
```

### ❌ Incorrect - Overly Nested Ternaries

```typescript
// UNNEEDED: Too much nesting, hard to read
const result = condition1 ? (condition2 ? (condition3 ? value1 : value2) : value3) : value4
```

### ✅ Correct - Simplified Boolean Expressions

```typescript
// Use direct boolean
const isValid = check()

// Use negation
const isDisabled = !isEnabled

// Use Boolean() constructor
const hasValue = Boolean(input)
```

```typescript
// Use !! for double negation
const isValid = !!check()
```

### ✅ Correct - Simplified Comparisons

```typescript
// Comparison already returns boolean
const isEqual = x === y

const isNotEqual = x !== y

const isGreaterThan = x > y
```

### ✅ Correct - Proper Use of Ternary

```typescript
// Ternary is appropriate for different values
const greeting = time < 12 ? 'Good morning' : 'Good afternoon'

// Ternary is appropriate for conditional logic
const status = isActive ? 'active' : 'inactive'

// Ternary is appropriate for default values
const value = user.name ?? 'Anonymous'
```

### ✅ Correct - Using Logical Operators

```typescript
// Use logical OR for default values
const name = userName ?? 'Guest'

// Use logical AND for conditional values
const displayName = isLoggedIn && userName

// Use nullish coalescing for null/undefined handling
const count = items?.length ?? 0
```

### ✅ Correct - If/Else for Complex Logic

```typescript
// Use if/else for multi-step logic
let result: string
if (condition1) {
  result = computeFirst()
} else if (condition2) {
  result = computeSecond()
} else {
  result = computeDefault()
}
```

## How to Fix Violations

### 1. Replace Boolean Ternary with Direct Expression

```diff
- const isValid = check() ? true : false
+ const isValid = check()
```

### 2. Replace Negation Ternary with Not Operator

```diff
- const isDisabled = isEnabled ? false : true
+ const isDisabled = !isEnabled
```

### 3. Use Boolean Constructor for Type Coercion

```diff
- const hasValue = input ? true : false
+ const hasValue = Boolean(input)
```

```diff
- const isTruthy = value ? true : false
+ const isTruthy = !!value
```

### 4. Remove Comparison Ternary

```diff
- const isEqual = x === y ? true : false
+ const isEqual = x === y
```

```diff
- const isNotEqual = x !== y ? true : false
+ const isNotEqual = x !== y
```

### 5. Use Nullish Coalescing for Default Values

```diff
- const name = userName ? userName : 'Anonymous'
+ const name = userName ?? 'Anonymous'
```

```diff
- const count = items ? items.length : 0
+ const count = items?.length ?? 0
```

### 6. Replace Nested Ternary with If/Else

```diff
- const result = a ? (b ? c : d) : e
+ let result
+ if (a) {
+   result = b ? c : d
+ } else {
+   result = e
+ }
```

Or better, break it down further:

```diff
- const result = a ? (b ? c : d) : e
+ let result
+ if (a && b) {
+   result = c
+ } else if (a) {
+   result = d
+ } else {
+   result = e
+ }
```

### 7. Extract Complex Ternary to Function

```diff
- const result = condition ? (a ? b : c) : (d ? e : f)
+ function getResult(): string {
+   if (condition) {
+     return a ? b : c
+   }
+   return d ? e : f
+ }
+
+ const result = getResult()
```

## Best Practices

### When Ternaries Are Appropriate

Ternary operators are appropriate in these scenarios:

1. **Simple conditional assignment**: Choosing between two values based on a condition
2. **Inline expressions**: Used in JSX or template literals
3. **One-line conditionals**: When if/else would be too verbose
4. **Return statements**: Early returns with conditional logic

```typescript
// ✅ Good: Simple value selection
const icon = type === 'success' ? 'check' : 'xmark'

// ✅ Good: JSX conditional rendering
<div>{isLoading ? <Spinner /> : <Content />}</div>

// ✅ Good: Conditional return
return isValid ? data : null

// ✅ Good: One-liner in function body
const result = value > 0 ? Math.sqrt(value) : 0
```

### Prefer Readability Over Conciseness

Always prioritize code that is easy to understand:

```typescript
// ❌ Hard to read
const result = a ? (b ? c : d ? e : f) : g

// ✅ Clear and maintainable
if (a && b) {
  return c
} else if (a && d) {
  return e
} else if (a) {
  return f
}
return g
```

### Use Descriptive Variable Names

When using ternaries, choose names that make the condition clear:

```typescript
// ❌ Unclear condition
const result = flag ? x : y

// ✅ Self-documenting
const shouldUsePrimary = isUserLoggedIn ? primaryTheme : guestTheme
```

### Consider Early Returns

For complex conditional logic, early returns can be clearer:

```typescript
// ❌ Complex ternary nesting
const result = a ? (b ? c : d ? e : f) : g

// ✅ Clear early returns
function getResult(): string {
  if (!a) return g
  if (b) return c
  if (d) return e
  return f
}
```

## Common Pitfalls

### Type Inference Issues

```typescript
// ❌ Unexpected: Ternary can create wider union types
const result = condition ? 'yes' : 123 // string | number

// ✅ Explicit type when needed
const result: string = condition ? 'yes' : 'no'
```

### Operator Precedence

```typescript
// ❌ Confusing: Operator precedence can create unexpected results
const value = a || b ? c : d // Evaluated as (a || b) ? c : d

// ✅ Use parentheses for clarity
const value = a || (b ? c : d) // Clear intent
```

### Side Effects in Ternary

```typescript
// ❌ Bad: Side effects in ternary expressions
const result = (isValid = check()) ? value1 : value2

// ✅ Good: Separate side effects
const isValid = check()
const result = isValid ? value1 : value2
```

### Overly Long Ternaries

```typescript
// ❌ Hard to read: Long ternary
const message =
  user && user.profile && user.profile.settings
    ? user.profile.settings.customMessage
    : 'Default message'

// ✅ Clear: Use optional chaining and nullish coalescing
const message = user?.profile?.settings?.customMessage ?? 'Default message'
```

## Related Rules

- [no-sequences](../patterns/no-sequences.md) - Disallow comma operators
- [no-mixed-operators](../patterns/no-mixed-operators.md) - Enforce grouping operators
- [complexity](../complexity/max-complexity.md) - Limit cyclomatic complexity

## Further Reading

- [MDN: Conditional (Ternary) Operator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Conditional_operator)
- [Ternary Operator vs If/Else](https://stackoverflow.com/questions/4404924/is-there-any-difference-between-a-if-else-and-a-ternary-operator)
- [Clean Code: Writing Code for Humans](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-code.html)

## Auto-Fix

This rule is auto-fixable. The fixer will:

1. Replace `condition ? true : false` with `Boolean(condition)` or `!!condition`
2. Replace `condition ? false : true` with `!condition`
3. Remove ternary wrapping around comparison operators
4. Suggest using nullish coalescing for default value patterns
5. For nested ternaries, suggest converting to if/else statements

Apply auto-fix:

```bash
codeforge analyze --rules no-unneeded-ternary --fix
```

Preview fixes without modifying files:

```bash
codeforge analyze --rules no-unneeded-ternary --fix --dry-run
```

Use interactive mode to review each fix:

```bash
codeforge interactive --rules no-unneeded-ternary
```
