# no-circular-deps

![Recommended](https://img.shields.io/badge/-recommended-blue)
![Fixable](https://img.shields.io/badge/-fixable-green)

| Property    | Value        |
| ----------- | ------------ |
| Category    | dependencies |
| Fixable     | Yes          |
| Recommended | Yes          |
| Deprecated  | No           |

## Description

Disallow circular dependencies between modules. Circular dependencies occur when Module A imports Module B, and Module B (directly or indirectly) imports Module A. This creates a dependency cycle that can lead to runtime issues, make code harder to understand, and cause problems with bundlers and tree-shaking.

## Why This Rule Matters

Circular dependencies:

- **Cause runtime errors**: Modules may be accessed before they're fully initialized
- **Make testing difficult**: Hard to test modules in isolation
- **Break tree-shaking**: Bundlers cannot properly optimize circular dependencies
- **Increase complexity**: Harder to understand the actual flow of dependencies
- **Cause undefined errors**: Values may be undefined when accessed due to initialization order

## Types of Circular Dependencies

### Direct Circular Dependency

```typescript
// moduleA.ts
import { foo } from './moduleB.js'
export function bar() {
  return foo()
}

// moduleB.ts
import { bar } from './moduleA.js'
export function foo() {
  return bar()
}
```

### Indirect Circular Dependency

```typescript
// moduleA.ts
import { something } from './moduleB.js'
export const valueA = 'A'

// moduleB.ts
import { other } from './moduleC.js'
export const valueB = 'B'

// moduleC.ts
import { valueA } from './moduleA.js' // Creates cycle: A -> B -> C -> A
export const valueC = 'C'
```

## Configuration Options

```json
{
  "rules": {
    "no-circular-deps": [
      "error",
      {
        "maxDepth": 50,
        "ignoreTypeOnly": false,
        "exclude": ["**/types/**/*.ts"]
      }
    ]
  }
}
```

| Option           | Type       | Default | Description                                       |
| ---------------- | ---------- | ------- | ------------------------------------------------- |
| `maxDepth`       | `number`   | `50`    | Maximum depth to search for circular dependencies |
| `ignoreTypeOnly` | `boolean`  | `false` | Ignore type-only imports                          |
| `exclude`        | `string[]` | `[]`    | Glob patterns of files to exclude from analysis   |

## When to Use This Rule

**Use this rule when:**

- Working on any JavaScript/TypeScript project
- Building modular applications
- Using build tools that perform tree-shaking

**Consider configuring `ignoreTypeOnly` when:**

- Using TypeScript type definitions heavily
- Working with shared types files

## Code Examples

### ❌ Incorrect - Circular Dependency

```typescript
// models/user.ts
import { Order } from './order.js'

export class User {
  orders: Order[] = []
}

// models/order.ts
import { User } from './user.js'

export class Order {
  user?: User
}
```

### ✅ Correct - Separate Concerns

```typescript
// models/user.ts
import type { Order } from './order.js'

export class User {
  orders: Order[] = []
}

// models/order.ts
import type { User } from './user.js'

export class Order {
  user?: User
}

// Use type-only imports to break the cycle
```

### ✅ Correct - Extract Shared Types

```typescript
// types/index.ts
export interface User {
  id: string
  name: string
}

export interface Order {
  id: string
  userId: string
}

// models/user.ts
import type { User, Order } from '../types/index.js'

export class UserEntity implements User {
  id: string
  name: string

  getOrders(): Order[] {
    // Implementation
    return []
  }
}

// models/order.ts
import type { User, Order } from '../types/index.js'

export class OrderEntity implements Order {
  id: string
  userId: string

  getUser(): User {
    // Implementation
    return {} as User
  }
}
```

### ✅ Correct - Use Dependency Injection

```typescript
// services/user.service.ts
import type { OrderService } from './order.service.js'

export class UserService {
  constructor(private orderService: OrderService) {}

  getUserOrders(userId: string) {
    return this.orderService.getOrdersByUser(userId)
  }
}

// services/order.service.ts
import type { UserService } from './user.service.js'

export class OrderService {
  constructor(private userService: UserService) {}

  getOrderUser(orderId: string) {
    return this.userService.getUserByOrder(orderId)
  }
}

// Main application injects both services, breaking the cycle
```

### ✅ Correct - Event-Driven Architecture

```typescript
// events/user.events.ts
export interface UserCreatedEvent {
  userId: string
  userName: string
}

export interface OrderCreatedEvent {
  orderId: string
  userId: string
}

// services/user.service.ts
import { EventEmitter } from './event-emitter.js'
import type { UserCreatedEvent } from '../events/user.events.js'

export class UserService {
  constructor(private events: EventEmitter) {}

  createUser(name: string) {
    const userId = generateId()
    this.events.emit<UserCreatedEvent>('user:created', { userId, name })
    return userId
  }
}

// services/order.service.ts
import { EventEmitter } from './event-emitter.js'
import type { UserCreatedEvent, OrderCreatedEvent } from '../events/user.events.js'

export class OrderService {
  constructor(private events: EventEmitter) {
    this.events.on<UserCreatedEvent>('user:created', (event) => {
      // React to user creation without directly importing UserService
      this.createInitialOrder(event.userId)
    })
  }

  private createInitialOrder(userId: string) {
    const orderId = generateId()
    this.events.emit<OrderCreatedEvent>('order:created', { orderId, userId })
  }
}
```

## How to Fix Violations

### 1. Use Type-Only Imports

Change value imports to type-only imports where possible:

```diff
- // user.ts
- import { Order } from './order.js';
+ // user.ts
+ import type { Order } from './order.js';

  export class User {
    orders: Order[] = [];
  }
```

### 2. Extract Shared Types/Interfaces

Move shared types to a separate file:

```diff
- // user.ts
- export interface User {
-   id: string;
-   orders: Order[];
- }
-
- // order.ts
- export interface Order {
-   id: string;
-   user: User;
- }

+ // types.ts
+ export interface User {
+   id: string;
+   orders: Order[];
+ }
+
+ export interface Order {
+   id: string;
+   userId: string;  // Use ID reference instead of full object
+ }
+
+ // user.ts
+ import type { User } from './types.js';
+
+ // order.ts
+ import type { Order } from './types.js';
```

### 3. Use Dependency Injection

Inject dependencies instead of importing them:

```diff
- // service.ts
- import { Repository } from './repository.js';
-
- export class Service {
-   private repository = new Repository();
-
-   getData() {
-     return this.repository.findAll();
-   }
- }

+ // service.ts
+ export class Service {
+   constructor(private repository: Repository) {}
+
+   getData() {
+     return this.repository.findAll();
+   }
+ }
+
+ // main.ts
+ import { Repository } from './repository.js';
+ import { Service } from './service.js';
+
+ const repository = new Repository();
+ const service = new Service(repository);
```

### 4. Restructure Module Boundaries

Reorganize modules to have clear dependency directions:

```diff
- // domain/user/entities/user.entity.ts
- import { Order } from '../../order/entities/order.entity.js';
-
- export class UserEntity {
-   orders: Order[];
- }

+ // shared/types.ts
+ export interface User {
+   id: string;
+ }
+
+ export interface Order {
+   id: string;
+   userId: string;
+ }
+
+ // domain/user/entities/user.entity.ts
+ import type { Order } from '../../../shared/types.js';
+
+ export class UserEntity implements User {
+   id: string;
+   orders: Order[];
+ }
```

### 5. Use Events/Message Bus

Decouple modules using events:

```diff
- // moduleA.ts
- import { moduleB } from './moduleB.js';
-
- export function doSomething() {
-   // Direct call creates cycle
-   moduleB.somethingElse();
- }

+ // events.ts
+ export const eventBus = new EventEmitter();
+
+ // moduleA.ts
+ export function doSomething() {
+   eventBus.emit('something', { data: 'value' });
+ }
+
+ // moduleB.ts
+ eventBus.on('something', (event) => {
+   // Handle event without importing moduleA
+ });
```

## Detecting Circular Dependencies

Manual detection techniques:

### 1. Dependency Graph Visualization

Use tools like `madge` or `dependency-cruiser`:

```bash
npx madge --image dep-graph.svg src/
npx depcruise --include-only "^src" --output-type json src/ > deps.json
```

### 2. Static Analysis

Run this rule on your codebase:

```bash
codeforge analyze --rules no-circular-deps
```

## Related Rules

- [no-unused-exports](no-unused-exports.md) - Remove unused exports to simplify dependency graph
- [consistent-imports](consistent-imports.md) - Keep imports organized to spot issues easier
- [no-barrel-imports](no-barrel-imports.md) - Avoid barrel files that can cause cycles

## Further Reading

- [Managing Dependencies in JavaScript Applications](https://www.youtube.com/watch?v=KzWscGNF5wU) - Kyle Simpson
- [Circular Dependencies](https://stackoverflow.com/questions/10472597/how-to-avoid-circular-dependencies-between-files-in-node-js) - Stack Overflow

## Auto-Fix

This rule is not auto-fixable. Breaking circular dependencies requires understanding the architecture and intent. Use:

```bash
codeforge analyze --rules no-circular-deps
```
