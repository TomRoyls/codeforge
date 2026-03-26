# sort-keys

![Recommended](https://img.shields.io/badge/-recommended-blue)

| Property    | Value    |
| ----------- | -------- |
| Category    | patterns |
| Fixable     | Yes      |
| Recommended | Yes      |
| Deprecated  | No       |

## Description

Enforce sorted object keys for consistency and readability. This rule ensures that object properties are declared in a consistent alphabetical order, making code easier to read, navigate, and maintain. Sorted keys reduce merge conflicts and help developers quickly locate properties within large objects.

## Why This Rule Matters

Maintaining sorted object keys is important because:

- **Consistency**: Uniform key ordering across your codebase creates a predictable pattern
- **Readability**: Alphabetically sorted keys are easier to scan and locate
- **Reduced merge conflicts**: When multiple developers add properties, sorted keys minimize conflicts
- **Reduced cognitive load**: Developers don't need to mentally parse different orderings
- **Better code reviews**: Changes to object definitions are more obvious and easier to review
- **Prevention of duplicate keys**: Duplicate properties are more likely to be caught when keys are sorted

### Merge Conflict Example

```typescript
// Developer A adds:
const config = {
  apiUrl: 'https://api.example.com',
  timeout: 5000,
  debug: false,
}

// Developer B adds:
const config = {
  apiUrl: 'https://api.example.com',
  debug: false,
  cache: true, // New property
}

// ❌ Merge conflict! Both modified the same area differently
```

With sorted keys, both developers would add properties at the end or in sorted order, reducing conflicts.

## Configuration Options

```json
{
  "rules": {
    "sort-keys": [
      "error",
      {
        "type": "asc",
        "caseSensitive": true,
        "natural": false,
        "minKeys": 2
      }
    ]
  }
}
```

| Option          | Type      | Default | Description                                                              |
| --------------- | --------- | ------- | ------------------------------------------------------------------------ |
| `type`          | `string`  | `"asc"` | Sort order: `"asc"` (ascending) or `"desc"` (descending)                 |
| `caseSensitive` | `boolean` | `true`  | Whether to consider case when sorting                                    |
| `natural`       | `boolean` | `false` | Use natural sort order (e.g., "item10" after "item2") instead of lexical |
| `minKeys`       | `number`  | `2`     | Minimum number of keys before sorting is enforced (0 = always enforce)   |

### type Option

Controls the sort order direction:

```json
{
  "rules": {
    "sort-keys": ["error", { "type": "asc" }]
  }
}
```

**Ascending (asc)**: A to Z

```typescript
const obj = {
  a: 1,
  b: 2,
  c: 3,
}
```

**Descending (desc)**: Z to A

```typescript
const obj = {
  c: 3,
  b: 2,
  a: 1,
}
```

### caseSensitive Option

Controls whether letter case affects sorting:

```json
{
  "rules": {
    "sort-keys": ["error", { "caseSensitive": true }]
  }
}
```

**caseSensitive: true**

```typescript
// Uppercase comes before lowercase
const obj = {
  API_URL: '...',
  apiUrl: '...', // Different from API_URL
  debug: false,
}
```

**caseSensitive: false**

```typescript
// Case-insensitive sorting
const obj = {
  API_URL: '...',
  apiUrl: '...', // Same as API_URL for sorting
  debug: false,
}
```

### natural Option

Use natural sort order for better numeric handling:

```json
{
  "rules": {
    "sort-keys": ["error", { "natural": true }]
  }
}
```

**natural: false (lexical sort)**

```typescript
const obj = {
  item1: 'a',
  item10: 'b', // Comes before item2!
  item2: 'c',
}
```

**natural: true (natural sort)**

```typescript
const obj = {
  item1: 'a',
  item2: 'c', // Correct order
  item10: 'b',
}
```

### minKeys Option

Minimum number of keys before sorting is enforced:

```json
{
  "rules": {
    "sort-keys": ["error", { "minKeys": 2 }]
  }
}
```

```typescript
// ✅ Not enforced: Only 1 key
const obj = { zebra: 1 }

// ❌ Enforced: 2 or more keys
const obj = { zebra: 1, apple: 2 }
```

Set to `0` to always enforce sorting, even on single-key objects.

## When to Use This Rule

**Use this rule when:**

- You work in a team with multiple developers
- Your codebase has many object definitions with multiple properties
- You want to reduce merge conflicts in configuration files
- Consistency and readability are priorities for your team
- You maintain large objects (e.g., configuration objects, API payloads)

**Consider disabling when:**

- Key order is semantically meaningful (e.g., JSON protocols requiring specific order)
- You're working with existing codebases where changing key order would cause massive diffs
- You're generating objects dynamically where sorting isn't practical
- You're working with data structures where key order affects functionality

## Code Examples

### ❌ Incorrect - Unsorted Object Keys

```typescript
// Keys not in alphabetical order
const user = {
  email: 'user@example.com',
  name: 'John Doe',
  age: 30,
  id: 123,
}
```

```typescript
// Mixed case and unsorted
const config = {
  Debug: false,
  apiKey: 'abc123',
  maxRetries: 3,
  apiUrl: 'https://api.example.com',
}
```

```typescript
// Nested objects with unsorted keys
const settings = {
  database: {
    port: 5432,
    host: 'localhost',
    name: 'mydb',
  },
  server: {
    timeout: 5000,
    port: 8080,
  },
}
```

```typescript
// Array of objects with unsorted keys
const users = [
  { id: 1, name: 'Alice', email: 'alice@example.com' },
  { email: 'bob@example.com', id: 2, name: 'Bob' },
]
```

```typescript
// Computed properties mixed with regular properties
const obj = {
  b: 2,
  [dynamicKey]: 3,
  a: 1,
}
```

### ✅ Correct - Sorted Object Keys

```typescript
// Keys in alphabetical order
const user = {
  age: 30,
  email: 'user@example.com',
  id: 123,
  name: 'John Doe',
}
```

```typescript
// Case-sensitive sorted (uppercase first, then lowercase)
const config = {
  Debug: false,
  apiKey: 'abc123',
  apiUrl: 'https://api.example.com',
  maxRetries: 3,
}
```

```typescript
// Nested objects with sorted keys
const settings = {
  database: {
    host: 'localhost',
    name: 'mydb',
    port: 5432,
  },
  server: {
    port: 8080,
    timeout: 5000,
  },
}
```

```typescript
// Array of objects with sorted keys
const users = [
  { email: 'alice@example.com', id: 1, name: 'Alice' },
  { email: 'bob@example.com', id: 2, name: 'Bob' },
]
```

```typescript
// Computed properties come after regular properties (TypeScript convention)
const obj = {
  a: 1,
  b: 2,
  [dynamicKey]: 3,
}
```

### ✅ Correct - Small Objects (when minKeys > 1)

```json
// Configuration: { "minKeys": 3 }
```

```typescript
// ✅ Not enforced: Only 2 keys
const config = { zebra: 1, apple: 2 }

// ❌ Enforced: 3 or more keys
const config = { zebra: 1, apple: 2, banana: 3 }
```

### ✅ Correct - Sorted with Descending Order

```json
// Configuration: { "type": "desc" }
```

```typescript
// Keys in descending alphabetical order
const user = {
  name: 'John Doe',
  id: 123,
  email: 'user@example.com',
  age: 30,
}
```

### ✅ Correct - Natural Sort Order

```json
// Configuration: { "natural": true }
```

```typescript
// Natural numeric ordering
const items = {
  item1: 'first',
  item2: 'second',
  item10: 'tenth',
  item20: 'twentieth',
}
```

## How to Fix Violations

### 1. Auto-Fix with CodeForge

```bash
# Automatically fix all sort-keys violations
codeforge fix --rules sort-keys

# Preview fixes without applying
codeforge fix --rules sort-keys --dry-run
```

### 2. Manual Reordering

```diff
- const config = {
-   timeout: 5000,
-   apiUrl: 'https://api.example.com',
-   debug: false,
- }
+ const config = {
+   apiUrl: 'https://api.example.com',
+   debug: false,
+   timeout: 5000,
+ }
```

### 3. Fix Nested Objects

```diff
  const settings = {
    database: {
-     port: 5432,
-     host: 'localhost',
-     name: 'mydb',
+     host: 'localhost',
+     name: 'mydb',
+     port: 5432,
    },
    server: {
-     timeout: 5000,
-     port: 8080,
+     port: 8080,
+     timeout: 5000,
    },
  }
```

### 4. Fix Computed Properties

Computed properties are typically placed after regular properties:

```diff
  const obj = {
-   b: 2,
-   [dynamicKey]: 3,
-   a: 1,
+   a: 1,
+   b: 2,
+   [dynamicKey]: 3,
  }
```

### 5. Fix Case Sensitivity Issues

```diff
- const config = {
-   apiKey: 'abc',
-   API_URL: 'https://api.example.com',
-   debug: false,
- }
+ const config = {
+   API_URL: 'https://api.example.com',
+   apiKey: 'abc',
+   debug: false,
+ }
```

## Best Practices

### Enforce Sorting Gradually

For existing codebases with many violations:

```json
// Start with lenient configuration
{
  "rules": {
    "sort-keys": ["warn", { "minKeys": 5 }]
  }
}
```

Gradually tighten the rules:

1. Start with `minKeys: 5` and warn level
2. Reduce to `minKeys: 3` after addressing violations
3. Set to `minKeys: 2` for most objects
4. Set to `minKeys: 0` for complete coverage
5. Change warn level to error

### Use Prettier Together

Prettier also has key sorting. Configure them consistently:

```json
// .prettierrc
{
  "trailingComma": "es5",
  "singleQuote": true
}
```

```json
// .codeforgerc.json
{
  "rules": {
    "sort-keys": ["error"]
  }
}
```

### Document Exceptions

When you need to disable the rule for specific objects:

```typescript
/* eslint-disable sort-keys */
const apiResponse = {
  // This order matches the API specification
  status: 200,
  data: { ... },
  message: 'Success',
}
/* eslint-enable sort-keys */
```

Or disable inline:

```typescript
const apiResponse = {
  // sort-keys-disable-line
  status: 200,
  data: { ... },
  message: 'Success',
}
```

### Consider Semantic Order

Sometimes semantic order is more important than alphabetical:

```typescript
// Semantic order (ID comes first, then descriptive fields)
const user = {
  id: 123,
  name: 'John',
  email: 'john@example.com',
}

// If you need semantic ordering, consider disabling the rule
// or using a different strategy
```

### Use TypeScript Interfaces for Structure

Combine key sorting with TypeScript interfaces:

```typescript
interface UserConfig {
  apiUrl: string
  cacheEnabled: boolean
  debug: boolean
  maxRetries: number
  timeout: number
}

// Keys match interface property order
const config: UserConfig = {
  apiUrl: 'https://api.example.com',
  cacheEnabled: true,
  debug: false,
  maxRetries: 3,
  timeout: 5000,
}
```

## Common Pitfalls

### Computed Properties Position

```typescript
// ⚠️ Computed properties before regular keys
const obj = {
  [computedKey]: 'value',
  a: 1,
  b: 2,
}

// ✅ Computed properties after regular keys
const obj = {
  a: 1,
  b: 2,
  [computedKey]: 'value',
}
```

### Method Shorthands vs Computed Properties

```typescript
// ⚠️ Mixed ordering
const obj = {
  [computed]: 'value',
  method() {},
  a: 1,
}

// ✅ Regular properties, then methods, then computed
const obj = {
  a: 1,
  method() {},
  [computed]: 'value',
}
```

### Case Sensitivity Confusion

```typescript
// ⚠️ 'API' vs 'api' - different sorting depending on caseSensitive
const obj = {
  API_URL: '...',
  apiVersion: '1.0',
  apiKey: '...',
}

// With caseSensitive: false, this becomes:
const obj = {
  API_URL: '...',
  apiKey: '...',
  apiVersion: '1.0',
}
```

### Large Objects Become Overwhelming

```typescript
// Even sorted, very large objects are hard to read
const config = {
  a: 1,
  b: 2,
  c: 3,
  // ... 50 more properties ...
  z: 26,
}

// Consider splitting into nested objects
const config = {
  api: {
    url: '...',
    version: '1.0',
  },
  database: {
    host: 'localhost',
    port: 5432,
  },
  // ...
}
```

## Related Rules

- [object-shorthand](./object-shorthand.md) - Use shorthand notation for object properties
- [no-dupe-keys](./no-dupe-keys.md) - Disallow duplicate keys in object literals
- [no-prototype-builtins](./no-prototype-builtins.md) - Disallow direct use of Object.prototype methods

## Further Reading

- [ESLint: sort-keys](https://eslint.org/docs/latest/rules/sort-keys) - Original ESLint rule documentation
- [Prettier: Object Property Sorting](https://prettier.io/docs/en/options.html#trailing-commas) - Prettier's approach to formatting
- [Effective TypeScript: Interfaces](https://effectivetypescript.com/2020/03/23/restrict-object-literal/) - Object literal best practices
- [Clean Code: Meaningful Names](https://blog.cleancoder.com/uncle-bob/2019/05/05/ThesesOnDesign.html) - Importance of naming conventions

## Auto-Fix

This rule is **auto-fixable**. CodeForge can automatically reorder object keys to comply with the configured sort order.

```bash
# Automatically fix all sort-keys violations
codeforge fix --rules sort-keys

# Run in interactive mode to review each fix
codeforge interactive --rules sort-keys

# Preview fixes without modifying files
codeforge fix --rules sort-keys --dry-run
```

The auto-fix respects all configuration options:

- Maintains your specified sort order (asc/desc)
- Respects case sensitivity settings
- Handles natural sort order correctly
- Only fixes objects with `minKeys` or more properties
- Preserves computed properties in their conventional position

For large codebases, consider enabling the rule with warnings first, then gradually transitioning to error level after fixing existing violations.
