# no-lonely-if

![Recommended](https://img.shields.io/badge/-recommended-blue)

| Property    | Value    |
| ----------- | -------- |
| Category    | patterns |
| Fixable     | Yes      |
| Recommended | Yes      |
| Deprecated  | No       |

## Description

Disallow `if` statements as the only statement in an `else` block. This pattern, known as "lonely if," makes code less readable and can lead to logical errors. Instead, use an `else if` chain to make the intent clearer.

## Why This Rule Matters

Using lonely `if` statements in `else` blocks is problematic because:

- **Reduced readability**: Deeply nested if-else patterns are harder to follow
- **Logical bugs**: The extra nesting can lead to confusion about execution flow
- **Maintenance issues**: Adding new conditions requires careful attention to nesting levels
- **Code bloat**: Unnecessary braces and indentation increase visual noise
- **Inconsistent patterns**: Most codebases use `else if` chains, making lonely `if` statements stand out awkwardly

### The Problem

```javascript
// ❌ Lonely if in else block
if (condition1) {
  doSomething()
} else {
  if (condition2) {
    doSomethingElse()
  }
}

// This is harder to read and maintain than:
if (condition1) {
  doSomething()
} else if (condition2) {
  doSomethingElse()
}
```

## What's Detected

This rule detects:

- `if` statements that are the only statement in an `else` block
- `if` statements with a single block statement as the entire `else` body
- Nested `if` statements that could be flattened into an `else if` chain

The rule does NOT flag:

- `if` statements that are not in `else` blocks
- `else` blocks with multiple statements
- `else if` chains (which are the recommended pattern)

## Configuration Options

```json
{
  "rules": {
    "no-lonely-if": [
      "error",
      {
        "allow-comments": true
      }
    ]
  }
}
```

| Option           | Type      | Default | Description                                       |
| ---------------- | --------- | ------- | ------------------------------------------------- |
| `allow-comments` | `boolean` | `true`  | Allow lonely if blocks that only contain comments |

### allow-comments Option

When `allow-comments` is `true`, lonely `if` blocks that contain comments explaining the logic are not flagged. This allows for explanatory comments while still encouraging the `else if` pattern.

```json
{
  "rules": {
    "no-lonely-if": [
      "error",
      {
        "allow-comments": true
      }
    ]
  }
}
```

With this configuration, the following would NOT trigger an error:

```javascript
if (condition1) {
  doSomething()
} else {
  // Special case handling for legacy data
  if (condition2) {
    doSomethingElse()
  }
}
```

## When to Use This Rule

**Use this rule when:**

- You want to maintain consistent if-else patterns across your codebase
- You prioritize code readability and maintainability
- You work in a team where clean, idiomatic JavaScript/TypeScript is valued
- You want to prevent potential logical bugs from confusing nesting

**Consider disabling when:**

- You have a specific reason to use deeply nested if-else structures (rare)
- You're dealing with legacy code where refactoring would be too risky
- You have extensive comments explaining the nested structure

## Code Examples

### ❌ Incorrect - Lonely If Statements

```typescript
// Lonely if in else block
if (error) {
  handleError(error)
} else {
  if (warning) {
    handleWarning(warning)
  }
}
```

```typescript
// Lonely if with complex logic
if (isAuthenticated) {
  grantAccess()
} else {
  if (isGuest) {
    showGuestPage()
  }
}
```

```typescript
// Multiple levels of lonely if
if (status === 'success') {
  showSuccess()
} else {
  if (status === 'error') {
    showError()
  } else {
    if (status === 'pending') {
      showPending()
    }
  }
}
```

### ✅ Correct - Using else if Chains

```typescript
// Proper else if chain
if (error) {
  handleError(error)
} else if (warning) {
  handleWarning(warning)
}
```

```typescript
// Clean else if structure
if (isAuthenticated) {
  grantAccess()
} else if (isGuest) {
  showGuestPage()
}
```

```typescript
// Flat else if chain for multiple conditions
if (status === 'success') {
  showSuccess()
} else if (status === 'error') {
  showError()
} else if (status === 'pending') {
  showPending()
}
```

### ✅ Correct - Legitimate Nested If (Not Lonely)

```typescript
// NOT lonely - else block has multiple statements
if (condition1) {
  doSomething()
} else {
  validateInput()
  if (condition2) {
    doSomethingElse()
  }
  logAction()
}
```

```typescript
// NOT lonely - no else block
if (shouldProcess) {
  processData()
}

// Separate, unrelated if statement
if (hasError) {
  logError()
}
```

## How to Fix Violations

### 1. Replace with else if

The most common fix is to flatten the structure using `else if`:

```diff
- if (condition1) {
-   doSomething();
- } else {
-   if (condition2) {
-     doSomethingElse();
-   }
- }
+ if (condition1) {
+   doSomething();
+ } else if (condition2) {
+   doSomethingElse();
+ }
```

### 2. Flatten Multiple Levels

For deeply nested lonely ifs, flatten the entire chain:

```diff
- if (status === 'success') {
-   showSuccess();
- } else {
-   if (status === 'error') {
-     showError();
-   } else {
-     if (status === 'pending') {
-       showPending();
-     }
-   }
- }
+ if (status === 'success') {
+   showSuccess();
+ } else if (status === 'error') {
+   showError();
+ } else if (status === 'pending') {
+   showPending();
+ }
```

### 3. Add Additional Statements

If you need to keep the else block for some reason, add another statement:

```diff
  if (condition1) {
    doSomething();
  } else {
+   logFallback();
    if (condition2) {
      doSomethingElse();
    }
  }
```

### 4. Use Switch Statement

For multiple conditions based on the same value, consider a switch:

```diff
- if (status === 'success') {
-   showSuccess();
- } else if (status === 'error') {
-   showError();
- } else if (status === 'pending') {
-   showPending();
- }
+ switch (status) {
+   case 'success':
+     showSuccess();
+     break;
+   case 'error':
+     showError();
+     break;
+   case 'pending':
+     showPending();
+     break;
+ }
```

## Best Practices

### Prefer Flat Control Flow

Flat control structures are easier to read and maintain:

```typescript
// ✅ Good - Flat structure
if (error) {
  handleError(error)
} else if (warning) {
  handleWarning(warning)
} else if (info) {
  handleInfo(info)
}

// ❌ Bad - Deeply nested
if (error) {
  handleError(error)
} else {
  if (warning) {
    handleWarning(warning)
  } else {
    if (info) {
      handleInfo(info)
    }
  }
}
```

### Use Guard Clauses for Early Exits

Consider using guard clauses instead of deep nesting:

```typescript
// ✅ Good - Guard clauses
function processRequest(request: Request): void {
  if (!request) {
    throw new Error('Invalid request')
  }

  if (!request.isValid()) {
    throw new Error('Invalid request data')
  }

  // Main logic here
  executeRequest(request)
}
```

### Consider Early Returns

For functions with multiple conditions, early returns can improve readability:

```typescript
// ✅ Good - Early returns
function validateUser(user: User): boolean {
  if (!user) {
    return false
  }

  if (!user.email) {
    return false
  }

  if (!user.name) {
    return false
  }

  return true
}
```

### Use Switch for Multi-Branch Conditions

When checking the same value against multiple conditions, switch statements can be clearer:

```typescript
// ✅ Good - Switch statement
function getHttpStatusText(status: number): string {
  switch (status) {
    case 200:
      return 'OK'
    case 404:
      return 'Not Found'
    case 500:
      return 'Internal Server Error'
    default:
      return 'Unknown'
  }
}
```

## Common Pitfalls

### Mixing else if with Lonely if

Be consistent in your approach:

```typescript
// ❌ Inconsistent
if (condition1) {
  doA()
} else if (condition2) {
  doB()
} else {
  if (condition3) {
    doC()
  }
}

// ✅ Consistent
if (condition1) {
  doA()
} else if (condition2) {
  doB()
} else if (condition3) {
  doC()
}
```

### Forgetting Braces in else if

Always use braces, even for single statements:

```typescript
// ❌ Bad - No braces
if (condition1) doA()
else if (condition2) doB()

// ✅ Good - With braces
if (condition1) {
  doA()
} else if (condition2) {
  doB()
}
```

### Complex Conditions

If conditions become complex, extract them:

```typescript
// ❌ Bad - Complex inline conditions
if (user && user.isActive && user.permissions && user.permissions.includes('admin')) {
  grantAdminAccess()
}

// ✅ Good - Extracted condition
const hasAdminAccess = user?.isActive && user?.permissions?.includes('admin')

if (hasAdminAccess) {
  grantAdminAccess()
}
```

## Related Rules

- [no-nested-ternary](../patterns/no-nested-ternary.md) - Disallow nested ternary expressions
- [max-depth](../complexity/max-depth.md) - Enforce a maximum depth that blocks can be nested
- [complexity](../complexity/complexity.md) - Enforce a maximum cyclomatic complexity
- [curly](../patterns/curly.md) - Enforce consistent brace style

## Further Reading

- [MDN: if...else Statement](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/if...else)
- [Clean Code: Control Flow](https://blog.codinghorror.com/flattening-arrow-code/) - Flattening code for readability
- [Refactoring: Replace Nested Conditional with Guard Clauses](https://refactoring.guru/replace-nested-conditional-with-guard-clauses)

## Auto-Fix

This rule is auto-fixable. The auto-fix will:

1. Replace lonely `if` statements with `else if` chains
2. Flatten deeply nested structures
3. Preserve all logic and comments

Run with the fix flag:

```bash
codeforge analyze --fix
```

Or for specific files:

```bash
codeforge fix src/**/*.ts --rules no-lonely-if
```

Use dry-run to preview changes:

```bash
codeforge fix src/**/*.ts --rules no-lonely-if --dry-run
```
