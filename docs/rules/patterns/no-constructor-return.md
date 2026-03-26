# no-constructor-return

![Recommended](https://img.shields.io/badge/-recommended-blue)

| Property    | Value    |
| ----------- | -------- |
| Category    | patterns |
| Fixable     | No       |
| Recommended | Yes      |
| Deprecated  | No       |

## Description

Disallow returning values from constructors. Constructors should only initialize object instances, not return values. When a constructor returns a value, it replaces the newly created instance, which leads to unexpected behavior and makes the code harder to understand and maintain.

## Why This Rule Matters

Returning values from constructors is problematic because:

- **Unexpected behavior**: The returned value replaces the new instance, breaking object creation expectations
- **Confusion for developers**: Most developers expect constructors to initialize and return the instance
- **Type safety violations**: TypeScript types may not match the actual returned value
- **Debugging difficulties**: The constructor's behavior becomes non-intuitive and harder to trace
- **Maintenance issues**: Other developers may not realize the constructor returns something else

### What Happens When You Return from a Constructor

```javascript
// When you return an object, it REPLACES the new instance
class Example {
  constructor() {
    this.value = 'initialized'
    return { different: 'object' } // This replaces 'this'!
  }
}

const instance = new Example()
// instance is { different: 'object' }, not { value: 'initialized' }
```

```javascript
// When you return a primitive, it's ignored (but confusing)
class Example {
  constructor() {
    return 'ignored'
  }
}

const instance = new Example()
// instance is the normal object, but the return is confusing
```

## Constructor Return Behavior

This rule detects return statements in constructors. Here's how constructor returns work:

- **Return object**: The returned object replaces the new instance
- **Return primitive**: The return is ignored, the new instance is used
- **No return (implicit)**: The new instance is returned normally
- **Return this (explicit)**: Explicitly returns the new instance (still unnecessary)

## Configuration Options

This rule has no configuration options. It flags any return statement in a constructor.

```json
{
  "rules": {
    "no-constructor-return": "error"
  }
}
```

## When to Use This Rule

**Use this rule when:**

- You want to ensure constructors follow standard object creation patterns
- Your codebase should maintain predictable constructor behavior
- You want to avoid confusion around what constructors return
- You prioritize code clarity and maintainability
- You work in a team where constructor behavior should be consistent

**Consider disabling when:**

- You have a legitimate use case for returning different objects from constructors (rare)
- You're implementing specific factory patterns using constructors (consider using factory functions instead)

## Code Examples

### ❌ Incorrect - Returning Values from Constructor

```typescript
// Returning an object replaces the new instance
class User {
  constructor(data: { name: string }) {
    return { ...data, isAdmin: false } // This replaces 'this'!
  }
}

const user = new User({ name: 'Alice' })
// user is { name: 'Alice', isAdmin: false }, not a User instance
// user instanceof User is false!
```

```typescript
// Returning a primitive is confusing and unnecessary
class Counter {
  private count = 0

  constructor(initialValue: number) {
    this.count = initialValue
    return this.count // Confusing! Return is ignored for primitives
  }
}
```

```typescript
// Explicitly returning 'this' is unnecessary
class Database {
  constructor(connection: string) {
    this.connection = connection
    return this // Unnecessary - constructor does this implicitly
  }
}
```

```typescript
// Conditional returns create unpredictable behavior
class Factory {
  constructor(type: 'a' | 'b') {
    if (type === 'a') {
      return { type: 'a' } // Returns this object instead of Factory instance
    }
    return { type: 'b' } // Returns this object instead of Factory instance
  }
}
```

### ✅ Correct - Standard Constructor Initialization

```typescript
// Just initialize properties, don't return
class User {
  name: string
  isAdmin: boolean

  constructor(data: { name: string }) {
    this.name = data.name
    this.isAdmin = false
  }
}

const user = new User({ name: 'Alice' })
// user is a User instance with initialized properties
// user instanceof User is true
```

```typescript
// Use factory functions for returning different objects
function createUser(type: 'admin' | 'user', name: string) {
  const base = { name, createdAt: new Date() }

  if (type === 'admin') {
    return { ...base, isAdmin: true, permissions: ['all'] }
  }

  return { ...base, isAdmin: false, permissions: ['read'] }
}

const admin = createUser('admin', 'Alice')
const user = createUser('user', 'Bob')
```

```typescript
// Use static factory methods for complex object creation
class User {
  private constructor(
    public name: string,
    public isAdmin: boolean,
  ) {}

  static createAdmin(name: string): User {
    return new User(name, true)
  }

  static createUser(name: string): User {
    return new User(name, false)
  }
}

const admin = User.createAdmin('Alice')
const user = User.createUser('Bob')
```

```typescript
// Normal constructor without returns
class Database {
  private connection: string

  constructor(connection: string) {
    this.connection = connection
  }

  connect() {
    console.log(`Connecting to ${this.connection}`)
  }
}

const db = new Database('localhost')
db.connect() // Works as expected
```

### ✅ Correct - Factory Pattern Implementation

```typescript
// Factory function instead of constructor with return
interface Shape {
  area(): number
}

class Circle implements Shape {
  constructor(private radius: number) {}

  area(): number {
    return Math.PI * this.radius * this.radius
  }
}

class Rectangle implements Shape {
  constructor(
    private width: number,
    private height: number,
  ) {}

  area(): number {
    return this.width * this.height
  }
}

function createShape(type: 'circle' | 'rectangle', params: any): Shape {
  if (type === 'circle') {
    return new Circle(params.radius)
  }
  return new Rectangle(params.width, params.height)
}

const circle = createShape('circle', { radius: 5 })
const rectangle = createShape('rectangle', { width: 4, height: 6 })
```

```typescript
// Abstract factory pattern
interface Database {
  connect(): void
  query(sql: string): any
}

class MySQL implements Database {
  connect() {}
  query(sql: string) {}
}

class PostgreSQL implements Database {
  connect() {}
  query(sql: string) {}
}

class DatabaseFactory {
  static create(type: 'mysql' | 'postgresql'): Database {
    switch (type) {
      case 'mysql':
        return new MySQL()
      case 'postgresql':
        return new PostgreSQL()
      default:
        throw new Error('Unknown database type')
    }
  }
}

const db = DatabaseFactory.create('mysql')
```

## How to Fix Violations

### 1. Remove Return Statements

```diff
- class User {
-   constructor(data: { name: string }) {
-     return { ...data, isAdmin: false }
-   }
- }
+ class User {
+   name: string
+   isAdmin: boolean
+
+   constructor(data: { name: string }) {
+     this.name = data.name
+     this.isAdmin = false
+   }
+ }
```

### 2. Use Factory Functions

```diff
- class Factory {
-   constructor(type: 'a' | 'b') {
-     if (type === 'a') {
-       return { type: 'a' }
-     }
-     return { type: 'b' }
-   }
- }
+ function createFactory(type: 'a' | 'b') {
+   if (type === 'a') {
+     return { type: 'a' }
+   }
+   return { type: 'b' }
+ }
+
+ const instance = createFactory('a')
```

### 3. Use Static Factory Methods

```diff
- class User {
-   constructor(type: 'admin' | 'regular', name: string) {
-     if (type === 'admin') {
-       return { name, isAdmin: true }
-     }
-     return { name, isAdmin: false }
-   }
- }
+ class User {
+   private constructor(public name: string, public isAdmin: boolean) {}
+
+   static createAdmin(name: string): User {
+     return new User(name, true)
+   }
+
+   static createRegular(name: string): User {
+     return new User(name, false)
+   }
+ }
+
+ const admin = User.createAdmin('Alice')
+ const regular = User.createRegular('Bob')
```

### 4. Remove Unnecessary Return This

```diff
- class Example {
-   constructor(value: string) {
-     this.value = value
-     return this
-   }
- }
+ class Example {
+   constructor(public value: string) {}
+ }
```

### 5. Use Builder Pattern for Complex Construction

```diff
- class ComplexObject {
-   constructor(config: Partial<Config>) {
-     if (config.shouldFail) {
-       return { error: 'Cannot create' }
-     }
-     this.config = config
-   }
- }
+
+ class ComplexObject {
+   private config: Config
+
+   private constructor(config: Config) {
+     this.config = config
+   }
+
+   static builder() {
+     return new ComplexObjectBuilder()
+   }
+ }
+
+ class ComplexObjectBuilder {
+   private config: Partial<Config> = {}
+
+   withConfig(config: Partial<Config>) {
+     this.config = { ...this.config, ...config }
+     return this
+   }
+
+   build(): ComplexObject | { error: string } {
+     if (this.config.shouldFail) {
+       return { error: 'Cannot create' }
+     }
+     return new ComplexObject(this.config as Config)
+   }
+ }
```

## Best Practices

### When to Use Factory Functions vs Constructors

**Use constructors when:**

- Creating a simple instance of a class
- The object type is always the same
- No conditional logic is needed for object creation
- You want to use `instanceof` checks

**Use factory functions when:**

- You need to return different types of objects
- You have complex creation logic
- You need to return objects that aren't instances of the class
- You want to separate creation from initialization

### Static Factory Methods Pattern

Static factory methods provide better control over object creation:

```typescript
class DateParser {
  private constructor(private date: Date) {}

  // Named constructors make intent clear
  static fromISO(isoString: string): DateParser {
    return new DateParser(new Date(isoString))
  }

  static fromTimestamp(timestamp: number): DateParser {
    return new DateParser(new Date(timestamp))
  }

  static now(): DateParser {
    return new DateParser(new Date())
  }

  format(): string {
    return this.date.toISOString()
  }
}

// Clear intent through named methods
const fromISO = DateParser.fromISO('2024-01-01')
const fromTimestamp = DateParser.fromTimestamp(1704067200000)
const now = DateParser.now()
```

### Builder Pattern for Complex Objects

The builder pattern handles complex construction without constructor returns:

```typescript
class QueryBuilder {
  private select: string[] = []
  private where: string[] = []
  private orderBy?: string

  select(fields: string[]): this {
    this.select = fields
    return this
  }

  where(condition: string): this {
    this.where.push(condition)
    return this
  }

  sort(field: string): this {
    this.orderBy = field
    return this
  }

  build(): Query {
    return new Query({
      select: this.select,
      where: this.where,
      orderBy: this.orderBy,
    })
  }
}

const query = new QueryBuilder()
  .select(['id', 'name'])
  .where('status = "active"')
  .sort('created_at')
  .build()
```

## Common Pitfalls

### Losing instanceof Checks

```typescript
// ❌ Losing instanceof due to constructor return
class User {
  constructor(data: any) {
    return { ...data } // This replaces the instance!
  }
}

const user = new User({ name: 'Alice' })
console.log(user instanceof User) // false!
```

```typescript
// ✅ Correct - instanceof works as expected
class User {
  constructor(public name: string) {}
}

const user = new User('Alice')
console.log(user instanceof User) // true
```

### Method Access Issues

```typescript
// ❌ Methods don't exist on returned object
class User {
  constructor(data: any) {
    return { ...data } // Returns plain object
  }

  greet() {
    return `Hello, ${this.name}`
  }
}

const user = new User({ name: 'Alice' })
user.greet() // Error: user.greet is not a function
```

```typescript
// ✅ Correct - methods work properly
class User {
  constructor(public name: string) {}

  greet() {
    return `Hello, ${this.name}`
  }
}

const user = new User('Alice')
user.greet() // "Hello, Alice"
```

### Inheritance Breaks

```typescript
// ❌ Constructor return breaks inheritance
class Parent {
  constructor() {
    return { custom: 'object' }
  }
}

class Child extends Parent {
  constructor() {
    super()
    this.childProperty = 'value' // Error! 'this' is the custom object
  }
}
```

```typescript
// ✅ Correct - Inheritance works as expected
class Parent {
  constructor() {
    this.parentProperty = 'value'
  }
}

class Child extends Parent {
  constructor() {
    super()
    this.childProperty = 'value' // Works!
  }
}
```

## Related Rules

- [no-new](../patterns/no-new.md) - Disallow the use of `new` operator
- [class-methods-use-this](../patterns/class-methods-use-this.md) - Enforce class methods use `this`
- [prefer-arrow-functions](../patterns/prefer-arrow-functions.md) - Prefer arrow functions over function expressions

## Further Reading

- [MDN: Classes](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes)
- [Effective TypeScript: Item 8 - Understand How Object Construction Works](https://effectivetypescript.com/2020/03/23/item-8-avoid-new-keyword/)
- [JavaScript Constructor Return Behavior](https://2ality.com/2014/12/constructor-return.html)
- [Factory Pattern in JavaScript](https://addyosmani.com/resources/essentialjsdesignpatterns/book/#factorypatternjavascript)

## Auto-Fix

This rule is not auto-fixable. Fixing constructor returns requires understanding the intended logic and choosing the appropriate refactoring approach (factory function, static method, or simple removal).

Use interactive mode to review violations:

```bash
codeforge analyze --rules no-constructor-return
```
