# no-underscore-dangle

![Recommended](https://img.shields.io/badge/-recommended-blue)

| Property    | Value    |
| ----------- | -------- |
| Category    | patterns |
| Fixable     | No       |
| Recommended | Yes      |
| Deprecated  | No       |

## Description

Disallow dangling underscores in variable names. Dangling underscores (leading or trailing underscores) are often used to indicate private or protected members in JavaScript, but this convention is not part of the language and can lead to confusion. TypeScript provides better alternatives through access modifiers and module scoping.

## Why This Rule Matters

Using dangling underscores incorrectly is problematic because:

- **Not a language feature**: JavaScript/TypeScript doesn't enforce privacy with underscores
- **False sense of security**: Underscores suggest privacy but don't actually provide it
- **Naming conflicts**: Can conflict with generated names (minifiers, transpilers)
- **Inconsistent conventions**: Teams may use different underscore patterns
- **Readability issues**: Makes code harder to read without clear semantics
- **TypeScript alternatives**: Better built-in ways to express intent (private, #private, modules)

### Common Misconceptions

```javascript
// MISCONCEPTION: Underscores don't make variables private!
class User {
  constructor(name) {
    this._name = name // Still accessible from anywhere!
  }
}

const user = new User('Alice')
console.log(user._name) // ✓ Accessible (not private)
```

## Underscore Patterns Detected

This rule detects the following underscore patterns:

- Leading underscores: `_privateVar`
- Trailing underscores: `privateVar_`
- Multiple leading underscores: `__privateVar__`
- Mixed patterns: `_var_`, `__var`, `var__`

## Configuration Options

```json
{
  "rules": {
    "no-underscore-dangle": [
      "error",
      {
        "allow": ["_id", "__typename"],
        "allowAfterThis": false,
        "allowAfterSuper": false,
        "enforceInMethodNames": false
      }
    ]
  }
}
```

| Option                 | Type       | Default | Description                                                                  |
| ---------------------- | ---------- | ------- | ---------------------------------------------------------------------------- |
| `allow`                | `string[]` | `[]`    | List of specific identifier patterns to allow (e.g., `["_id", "__dirname"]`) |
| `allowAfterThis`       | `boolean`  | `false` | Allow underscores in properties accessed via `this._privateVar`              |
| `allowAfterSuper`      | `boolean`  | `false` | Allow underscores in properties accessed via `super._privateVar`             |
| `enforceInMethodNames` | `boolean`  | `false` | Apply rule to method names in addition to variable names                     |

### allow Option Usage

The `allow` option permits specific identifiers for legitimate use cases like database IDs or framework conventions.

```json
{
  "rules": {
    "no-underscore-dangle": [
      "error",
      {
        "allow": ["_id", "__dirname", "__filename", "__typename"]
      }
    ]
  }
}
```

With this configuration, these specific identifiers are allowed but other underscore patterns are still detected.

### allowAfterThis Option

Allow underscores in properties accessed via `this`:

```json
{
  "rules": {
    "no-underscore-dangle": [
      "error",
      {
        "allowAfterThis": true
      }
    ]
  }
}
```

This allows `this._privateVar` but still prevents `_privateVar` standalone.

### allowAfterSuper Option

Allow underscores in properties accessed via `super`:

```json
{
  "rules": {
    "no-underscore-dangle": [
      "error",
      {
        "allowAfterSuper": true
      }
    ]
  }
}
```

This allows `super._protectedVar` in derived classes.

## When to Use This Rule

**Use this rule when:**

- You want to enforce consistent naming conventions
- Your codebase uses TypeScript access modifiers for true privacy
- You want to avoid the false sense of security from underscore conventions
- You're working in a team that follows modern JavaScript/TypeScript practices
- You want to improve code readability and maintainability

**Consider disabling when:**

- You're working with legacy code that heavily uses underscore conventions
- You're following a framework's specific naming conventions (e.g., Backbone.js)
- You need to work with third-party libraries that use underscore patterns
- You're in a migration phase and need gradual adoption

## Code Examples

### ❌ Incorrect - Using Dangling Underscores

```typescript
// Leading underscore for pseudo-private members
class UserService {
  private _users: User[] = []
  private _currentUser: User | null = null

  addUser(user: User): void {
    this._users.push(user)
  }
}
```

```typescript
// Trailing underscore to avoid naming conflicts
let count_ = 0
let index_ = 0

function processItem(item: Item): void {
  count_++
  index_++
}
```

```typescript
// Double underscores for "super private"
class Config {
  private __settings: Record<string, any> = {}
  private __initialized: boolean = false

  init(): void {
    this.__initialized = true
  }
}
```

```typescript
// Function parameters with underscores
function getUserById_(_id: string): User {
  return database.findUser(_id)
}
```

### ✅ Correct - Using Proper Naming and TypeScript Features

```typescript
// Use TypeScript's private keyword for true privacy
class UserService {
  private users: User[] = []
  private currentUser: User | null = null

  addUser(user: User): void {
    this.users.push(user)
  }
}

// Note: users is truly private and inaccessible outside this class
```

```typescript
// Use explicit names instead of trailing underscores
let count = 0
let index = 0

function processItem(item: Item): void {
  count++
  index++
}
```

```typescript
// Use meaningful names instead of underscores
class Config {
  private settings: Record<string, any> = {}
  private initialized: boolean = false

  init(): void {
    this.initialized = true
  }
}
```

```typescript
// Use meaningful parameter names
function getUserById(id: string): User {
  return database.findUser(id)
}
```

### ✅ Correct - Using Private Class Fields (ES2022)

```typescript
// Use #private fields for truly private members
class UserService {
  #users: User[] = []
  #currentUser: User | null = null

  addUser(user: User): void {
    this.#users.push(user)
  }

  getCurrentUser(): User | null {
    return this.#currentUser
  }
}

// #users and #currentUser are truly private and cannot be accessed from outside
```

### ✅ Correct - Using Module Scoping

```typescript
// Use module scoping for private data
// internal.ts
const internalCache = new Map<string, any>()
const internalConfig: Record<string, any> = {}

export function getInternal(key: string): any {
  return internalCache.get(key)
}

// internalCache and internalConfig are private to this module
// and cannot be accessed from outside
```

### ✅ Correct - Legitimate Use Cases with Configuration

```json
// Configuration:
{
  "rules": {
    "no-underscore-dangle": [
      "error",
      {
        "allow": ["_id", "__typename", "__dirname", "__filename"]
      }
    ]
  }
}
```

```typescript
// Database IDs (MongoDB convention)
interface UserDocument {
  _id: string
  name: string
  email: string
}

// GraphQL Apollo Client
const query = gql`
  query GetUser {
    user {
      __typename
      id
      name
    }
  }
`

// Node.js globals
const currentPath = __dirname
const currentFile = __filename
```

```json
// Configuration:
{
  "rules": {
    "no-underscore-dangle": [
      "error",
      {
        "allowAfterThis": true
      }
    ]
  }
}
```

```typescript
// Legacy code with this._privateVar pattern
class Component {
  private _state: any = {}
  private _props: any = {}

  constructor(props: any) {
    this._props = props
    this._initialize()
  }

  private _initialize(): void {
    this._state = { initialized: true }
  }
}

// Allowed because allowAfterThis is true
```

## How to Fix Violations

### 1. Remove Underscores from Variable Names

```diff
- private _users: User[] = []
+ private users: User[] = []
```

```diff
- let count_ = 0
+ let count = 0
```

### 2. Use TypeScript's private Keyword

```diff
class UserService {
-  _users: User[] = []
-  _currentUser: User | null = null
+  private users: User[] = []
+  private currentUser: User | null = null
}
```

### 3. Use Private Class Fields (#)

```diff
class UserService {
-  private _users: User[] = []
-  private _currentUser: User | null = null
+  #users: User[] = []
+  #currentUser: User | null = null

  addUser(user: User): void {
-    this._users.push(user)
+    this.#users.push(user)
  }
}
```

### 4. Use Meaningful Names Instead of Trailing Underscores

```diff
- let count_ = 0
+ let totalCount = 0

- function processItem_(item: Item): void {
+ function processItemInternal(item: Item): void {
```

### 5. Use Module Scoping

```diff
- class Cache {
-  private _data: Map<string, any> = new Map()
- }
+ // cache.ts
+ const data: Map<string, any> = new Map()
+
+ export function get(key: string): any {
+   return data.get(key)
+ }
```

### 6. Use Getter/Setter Methods

```diff
class Component {
-  private _value: number = 0
+  #value: number = 0

-  getValue(): number {
-    return this._value
+  get value(): number {
+    return this.#value
  }

-  setValue(value: number): void {
-    this._value = value
+  set value(value: number) {
+    this.#value = value
  }
}
```

## Best Practices

### When Underscores Are Acceptable

Underscore patterns are acceptable in these scenarios:

1. **Database conventions**: MongoDB `_id` field
2. **Framework conventions**: GraphQL `__typename`, Node.js `__dirname`, `__filename`
3. **Legacy code**: When working with established codebases
4. **External libraries**: When matching third-party API patterns

Always configure exceptions explicitly:

```json
{
  "rules": {
    "no-underscore-dangle": [
      "error",
      {
        "allow": ["_id", "__typename", "__dirname", "__filename"]
      }
    ]
  }
}
```

### Prefer TypeScript Language Features

Instead of underscore conventions, use:

```typescript
// ✅ Private keyword (compile-time privacy)
class Service {
  private cache: Map<string, any> = new Map()
}

// ✅ Private field (runtime privacy, ES2022)
class Service {
  #cache: Map<string, any> = new Map()
}

// ✅ Module scoping (truly private)
const cache = new Map<string, any>()
export { cache } // Only export what's needed
```

### Naming Patterns

Use clear, descriptive names:

```typescript
// ❌ Avoid: Underscore for internal
class Component {
  private _renderInternal(): void {}
}

// ✅ Better: Explicit internal naming
class Component {
  private renderInternal(): void {}
}

// ❌ Avoid: Trailing underscore
let count_ = 0

// ✅ Better: More specific name
let iterationCount = 0
```

## Common Pitfalls

### False Sense of Privacy

```javascript
// ❌ Misconception: Underscores don't make properties private
class User {
  constructor(name) {
    this._name = name  // Still accessible from anywhere!
  }
}

const user = new User('Alice')
console.log(user._name)  // ✓ Accessible (not private)

// ✅ Use TypeScript's private keyword
class User {
  private name: string

  constructor(name: string) {
    this.name = name
  }
}

const user = new User('Alice')
console.log(user.name)  // ✗ TypeScript error: Property 'name' is private
```

### Minification Conflicts

```javascript
// ❌ Risk: Minifiers might avoid names with underscores
const _value = computeValue()

// ✅ Better: Use descriptive names that minifiers can optimize
const computedValue = computeValue()
```

### Inconsistent Patterns

```javascript
// ❌ Inconsistent: Mixed underscore patterns
class Service {
  private _users = []
  private config_ = {}
  private __settings = {}
}

// ✅ Consistent: No underscores, all private
class Service {
  private users = []
  private config = {}
  private settings = {}
}
```

## Related Rules

- [no-underscore-dangle](../patterns/no-underscore-dangle.md) - This rule
- [camelcase](../patterns/camelcase.md) - Enforce camelCase naming convention
- [no-unused-vars](../patterns/no-unused-vars.md) - Disallow unused variables
- [class-methods-use-this](../patterns/class-methods-use-this.md) - Enforce class methods to use this

## Further Reading

- [TypeScript Handbook: Classes](https://www.typescriptlang.org/docs/handbook/2/classes.html#private-members)
- [MDN: Private class features](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_class_fields)
- [Why Underscore Prefix is Bad](https://github.com/airbnb/javascript/issues/794) - Discussion on underscore conventions
- [JavaScript Private Class Fields](https://2ality.com/2017/07/class-fields.html) - In-depth guide to #private fields

## Auto-Fix

This rule is not auto-fixable. Removing underscores requires understanding the naming intent and may require refactoring.

Use interactive mode to review violations:

```bash
codeforge analyze --rules no-underscore-dangle
```
