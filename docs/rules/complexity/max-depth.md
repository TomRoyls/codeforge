# max-depth

![Recommended](https://img.shields.io/badge/-recommended-blue)
![Fixable](https://img.shields.io/badge/-fixable-green)

| Property    | Value      |
| ----------- | ---------- |
| Category    | complexity |
| Fixable     | Yes        |
| Recommended | Yes        |
| Deprecated  | No         |

## Description

Enforce a maximum nesting depth for code blocks. Deep nesting makes code difficult to read, understand, and maintain. It often indicates that code could be simplified or refactored into smaller functions.

## Why This Rule Matters

Deep nesting:

- **Reduces readability**: Developers must mentally track many levels of indentation
- **Increases cognitive load**: Harder to understand the flow of execution
- **Makes testing difficult**: Deeply nested paths are harder to test in isolation
- **Indicates poor structure**: Often suggests opportunities for extraction or early returns

### Depth Guidelines

| Depth Level | Interpretation    | Recommendation          |
| ----------- | ----------------- | ----------------------- |
| 1-3         | Good nesting      | ✅ Acceptable           |
| 4-5         | Moderate nesting  | ⚠️ Consider refactoring |
| 6+          | Excessive nesting | ❌ Should be refactored |

## Configuration Options

```json
{
  "rules": {
    "max-depth": ["warn", { "max": 4 }]
  }
}
```

| Option | Type     | Default | Description                   |
| ------ | -------- | ------- | ----------------------------- |
| `max`  | `number` | `4`     | Maximum nesting depth allowed |

## When to Use This Rule

**Use this rule when:**

- Maintaining code readability standards
- Onboarding new team members
- Code reviewing for maintainability

**Consider disabling when:**

- Auto-generated code
- Specific algorithms that inherently require deep nesting

## Code Examples

### ❌ Incorrect - Deep Nesting

```typescript
// Depth: 6 - Too deeply nested
function processUsers(users: User[]) {
  if (users.length > 0) {
    // Depth 1
    for (const user of users) {
      // Depth 2
      if (user.active) {
        // Depth 3
        if (user.permissions.includes('admin')) {
          // Depth 4
          for (const action of user.actions) {
            // Depth 5
            if (action.type === 'critical') {
              // Depth 6
              processCriticalAction(action)
            }
          }
        }
      }
    }
  }
}
```

```typescript
// Nested ternary expressions
function getStatus(value: number): string {
  return value > 100 ? (value > 200 ? (value > 300 ? 'Critical' : 'High') : 'Medium') : 'Low'
} // Depth: 4
```

### ✅ Correct - Refactored

```typescript
// Use early returns to reduce nesting
function processUsers(users: User[]) {
  if (users.length === 0) {
    return
  }

  for (const user of users) {
    if (!user.active) continue

    if (user.permissions.includes('admin')) {
      processAdminActions(user)
    }
  }
}

function processAdminActions(user: User): void {
  for (const action of user.actions) {
    if (action.type === 'critical') {
      processCriticalAction(action)
    }
  }
}
```

```typescript
// Extract nested conditions into helper functions
function getStatus(value: number): string {
  if (value > 300) return 'Critical'
  if (value > 200) return 'High'
  if (value > 100) return 'Medium'
  return 'Low'
}
```

## How to Fix Violations

### 1. Use Guard Clauses

Replace nested conditions with early returns:

```diff
- function validateUser(user: User): boolean {
-   if (user) {
-     if (user.email) {
-       if (user.age >= 18) {
-         if (user.verified) {
-           return true;
-         }
-       }
-     }
-   }
-   return false;
- }

+ function validateUser(user: User): boolean {
+   if (!user) return false;
+   if (!user.email) return false;
+   if (user.age < 18) return false;
+   return user.verified;
+ }
```

### 2. Extract Nested Logic

Move deeply nested code into separate functions:

```diff
- function processData(data: Data[]): Result[] {
-   const results: Result[] = [];
-   for (const item of data) {
-     if (item.valid) {
-       if (item.type === 'A') {
-         if (item.priority > 5) {
-           if (item.urgent) {
-             results.push(processUrgentA(item));
-           } else {
-             results.push(processNormalA(item));
-           }
-         }
-       }
-     }
-   }
-   return results;
- }

+ function processItem(item: Data): Result | null {
+   if (!item.valid) return null;
+   if (item.type !== 'A') return null;
+   if (item.priority <= 5) return null;
+
+   return item.urgent
+     ? processUrgentA(item)
+     : processNormalA(item);
+ }
+
+ function processData(data: Data[]): Result[] {
+   const results: Result[] = [];
+   for (const item of data) {
+     const result = processItem(item);
+     if (result) results.push(result);
+   }
+   return results;
+ }
```

### 3. Use Early Continues in Loops

Replace nested if statements with continue:

```diff
- function processItems(items: Item[]): void {
-   for (const item of items) {
-     if (item.active) {
-       if (item.visible) {
-         if (item.accessible) {
-           process(item);
-         }
-       }
-     }
-   }
- }

+ function processItems(items: Item[]): void {
+   for (const item of items) {
+     if (!item.active) continue;
+     if (!item.visible) continue;
+     if (!item.accessible) continue;
+
+     process(item);
+   }
+ }
```

### 4. Flatten Switch Statements

Use early returns instead of nested cases:

```diff
- function handleEvent(event: Event): void {
-   switch (event.type) {
-     case 'click':
-       if (event.target) {
-         if (event.target.button === 0) {
-           handleClick(event);
-         }
-       }
-       break;
-     case 'keydown':
-       if (event.key) {
-         if (event.key === 'Enter') {
-           handleEnter(event);
-         }
-       }
-       break;
-   }
- }

+ function handleEvent(event: Event): void {
+   if (!event.target) return;
+
+   switch (event.type) {
+     case 'click':
+       if (event.target.button === 0) handleClick(event);
+       break;
+     case 'keydown':
+       if (event.key === 'Enter') handleEnter(event);
+       break;
+   }
+ }
```

### 5. Use Array Methods

Replace nested loops with higher-order functions:

```diff
- function getActiveAdminUsers(users: User[]): User[] {
-   const activeAdmins: User[] = [];
-   for (const user of users) {
-     if (user.active) {
-       for (const permission of user.permissions) {
-         if (permission === 'admin') {
-           activeAdmins.push(user);
-           break;
-         }
-       }
-     }
-   }
-   return activeAdmins;
- }

+ function getActiveAdminUsers(users: User[]): User[] {
+   return users.filter(user =>
+     user.active && user.permissions.includes('admin')
+   );
+ }
```

## Related Rules

- [max-complexity](max-complexity.md) - Deep nesting often correlates with high complexity
- [max-lines-per-function](max-lines-per-function.md) - Deeply nested code often appears in long functions
- [max-params](max-params.md) - Complex parameter handling may lead to deep nesting

## Auto-Fix

This rule is not fully auto-fixable. Use:

```bash
codeforge analyze --rules max-depth
```

Manual refactoring is required to properly structure the code.
