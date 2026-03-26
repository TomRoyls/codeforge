# max-lines

![Fixable](https://img.shields.io/badge/-fixable-green)

| Property    | Value      |
| ----------- | ---------- |
| Category    | complexity |
| Fixable     | Yes        |
| Recommended | No         |
| Deprecated  | No         |

## Description

Enforce a maximum number of lines per file. Long files can be difficult to navigate, understand, and maintain. They often indicate that the file has too many responsibilities and should be split into smaller, focused modules.

## Why This Rule Matters

Long files:

- **Reduce navigability**: Harder to find and understand code
- **Increase coupling**: Many responsibilities in one place
- **Make testing difficult**: More code to test in one place
- **Indicate poor separation of concerns**: Often suggest the file does too much

## Configuration Options

```json
{
  "rules": {
    "max-lines": [
      "warn",
      {
        "max": 300,
        "skipBlankLines": true,
        "skipComments": true
      }
    ]
  }
}
```

| Option           | Type      | Default | Description                              |
| ---------------- | --------- | ------- | ---------------------------------------- |
| `max`            | `number`  | `300`   | Maximum number of lines allowed per file |
| `skipBlankLines` | `boolean` | `true`  | Skip blank lines when counting           |
| `skipComments`   | `boolean` | `true`  | Skip comment lines when counting         |

## When to Use This Rule

**Use this rule when:**

- Establishing file size standards for a project
- Preventing file bloat over time
- Code reviewing for file organization

**Consider disabling when:**

- Generated code files (e.g., auto-generated GraphQL types)
- Configuration or data files where length is intentional
- Legacy code that cannot be immediately refactored

## Code Examples

### ❌ Incorrect - Too Long

```typescript
// File: utils.ts - 800+ lines
// This file contains many unrelated utilities

export function capitalize(str: string): string {
  /* ... */
}
export function lowercase(str: string): string {
  /* ... */
}
export function uppercase(str: string): string {
  /* ... */
}
export function truncate(str: string, len: number): string {
  /* ... */
}
export function pad(str: string, len: number): string {
  /* ... */
}
export function isEmpty(str: string): boolean {
  /* ... */
}
export function isNotEmpty(str: string): boolean {
  /* ... */
}
export function contains(str: string, search: string): boolean {
  /* ... */
}
export function startsWith(str: string, prefix: string): boolean {
  /* ... */
}
export function endsWith(str: string, suffix: string): boolean {
  /* ... */
}
// ... 50 more string utilities
```

### ✅ Correct - Split by Concern

```typescript
// File: string/capitalize.ts
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

// File: string/pad.ts
export function pad(str: string, len: number): string {
  return str.padStart(len, ' ')
}

// File: string/isEmpty.ts
export function isEmpty(str: string): boolean {
  return str.length === 0
}

// File: string/contains.ts
export function contains(str: string, search: string): boolean {
  return str.includes(search)
}
// ... each utility in its own file
```

## How to Fix Violations

### 1. Split by Functionality

Group related functions into separate files:

```diff
- // File: api.ts (500+ lines)
- export async function fetchUser(id: string) { /* ... */ }
- export async function fetchUsers() { /* ... */ }
- export async function createUser(user: User) { /* ... */ }
- export async function updateUser(id: string, user: User) { /* ... */ }
- export async function deleteUser(id: string) { /* ... */ }
- export async function fetchOrders(userId: string) { /* ... */ }
- export async function fetchOrder(id: string) { /* ... */ }
- export async function createOrder(order: Order) { /* ... */ }
- // ... many more API functions

+ // File: api/users.ts
+ export async function fetchUser(id: string) { /* ... */ }
+ export async function fetchUsers() { /* ... */ }
+ export async function createUser(user: User) { /* ... */ }
+ export async function updateUser(id: string, user: User) { /* ... */ }
+ export async function deleteUser(id: string) { /* ... */ }
+
+ // File: api/orders.ts
+ export async function fetchOrders(userId: string) { /* ... */ }
+ export async function fetchOrder(id: string) { /* ... */ }
+ export async function createOrder(order: Order) { /* ... */ }
```

### 2. Use Barrel Exports

Create an index file to group related modules:

```typescript
// File: string/index.ts
export * from './capitalize.js'
export * from './pad.js'
export * from './isEmpty.js'
export * from './contains.js'
// ... all string utilities

// Consumers can still import from one place
import { capitalize, pad, isEmpty, contains } from './string/index.js'
```

### 3. Extract Components

Split large component files into smaller components:

```diff
- // File: UserProfile.tsx (400+ lines)
- export function UserProfile({ user }: Props) {
-   return (
-     <div className="profile">
-       <Avatar user={user} />
-       <UserInfo user={user} />
-       <UserStats user={user} />
-       <UserActivity user={user} />
-       <UserSettings user={user} />
-       <UserMessages user={user} />
-       {/* ... more components inline */}
-     </div>
-   );
- }

+ // File: UserProfile.tsx
+ import { Avatar } from './Avatar.js';
+ import { UserInfo } from './UserInfo.js';
+ import { UserStats } from './UserStats.js';
+ import { UserActivity } from './UserActivity.js';
+ import { UserSettings } from './UserSettings.js';
+ import { UserMessages } from './UserMessages.js';
+
+ export function UserProfile({ user }: Props) {
+   return (
+     <div className="profile">
+       <Avatar user={user} />
+       <UserInfo user={user} />
+       <UserStats user={user} />
+       <UserActivity user={user} />
+       <UserSettings user={user} />
+       <UserMessages user={user} />
+     </div>
+   );
+ }
```

### 4. Extract Constants

Move constants to separate files:

```diff
- // File: config.ts (200+ lines)
- export const API_URL = 'https://api.example.com';
- export const MAX_RETRIES = 3;
- export const TIMEOUT = 5000;
- export const ERROR_MESSAGES = { /* ... */ };
- export const VALIDATION_RULES = { /* ... */ };
- export const ROUTES = { /* ... */ };
- export const PERMISSIONS = { /* ... */ };
- // ... many more constants

+ // File: config/api.ts
+ export const API_URL = 'https://api.example.com';
+ export const MAX_RETRIES = 3;
+ export const TIMEOUT = 5000;
+
+ // File: config/errors.ts
+ export const ERROR_MESSAGES = { /* ... */ };
+
+ // File: config/validation.ts
+ export const VALIDATION_RULES = { /* ... */ };
+
+ // File: config/routes.ts
+ export const ROUTES = { /* ... */ };
+
+ // File: config/index.ts
+ export * from './api.js';
+ export * from './errors.js';
+ export * from './validation.js';
+ export * from './routes.js';
```

## Related Rules

- [max-lines-per-function](max-lines-per-function.md) - Control function size within files
- [max-complexity](max-complexity.md) - Long files often contain complex functions

## Auto-Fix

This rule is not auto-fixable. File splitting requires understanding of the code's purpose and relationships. Use:

```bash
codeforge analyze --rules max-lines
```

## Further Reading

- [The Art of Readable Code](https://www.amazon.com/Art-Readable-Code-Simple-Effective/dp/0371948414) - Dustin Boswell & Trevor Foucher
- [Clean Architecture: A Craftsman's Guide to Software Structure and Design](https://www.amazon.com/Clean-Architecture-Craftsmans-Software-Structure/dp/0134494164) - Robert C. Martin
