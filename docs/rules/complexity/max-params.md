# max-params

![Recommended](https://img.shields.io/badge/-recommended-blue)
![Fixable](https://img.shields.io/badge/-fixable-green)

| Property    | Value      |
| ----------- | ---------- |
| Category    | complexity |
| Fixable     | Yes        |
| Recommended | Yes        |
| Deprecated  | No         |

## Description

Enforce a maximum number of parameters in function definitions. Functions with too many parameters are harder to read, test, and maintain. They often indicate that the function is doing too much or that related parameters should be grouped into an object.

## Why This Rule Matters

Functions with many parameters:

- **Reduce readability**: It becomes difficult to remember what each parameter represents
- **Increase complexity**: Callers must provide many arguments, increasing cognitive load
- **Make testing harder**: More parameter combinations to test
- **Indicate poor design**: Often suggest the function has too many responsibilities

## Configuration Options

```json
{
  "rules": {
    "max-params": ["warn", { "max": 4 }]
  }
}
```

| Option | Type     | Default | Description                          |
| ------ | -------- | ------- | ------------------------------------ |
| `max`  | `number` | `4`     | Maximum number of parameters allowed |

## When to Use This Rule

**Use this rule when:**

- You want to maintain consistent function signatures across your codebase
- You're working on a large team and want to enforce good API design
- You're refactoring legacy code to improve maintainability

**Consider disabling when:**

- Working with external libraries that have fixed function signatures
- Building specific APIs that require many parameters by design

## Code Examples

### ❌ Incorrect

```typescript
// Too many parameters - violates max-params: 4
function createUser(
  firstName: string,
  lastName: string,
  email: string,
  age: number,
  address: string,
  phone: string,
) {
  // ...
}
```

```typescript
// Constructor with too many parameters
class User {
  constructor(
    id: string,
    name: string,
    email: string,
    age: number,
    role: string,
    department: string,
  ) {
    // ...
  }
}
```

### ✅ Correct

```typescript
// Use an options object to group related parameters
interface CreateUserOptions {
  firstName: string
  lastName: string
  email: string
  age: number
  address: string
  phone: string
}

function createUser(options: CreateUserOptions) {
  const { firstName, lastName, email, age, address, phone } = options
  // ...
}
```

```typescript
// Split the function into smaller, focused functions
function createUserBaseInfo(firstName: string, lastName: string, email: string) {
  return { firstName, lastName, email }
}

function createUserContactInfo(address: string, phone: string) {
  return { address, phone }
}

function createUser(
  baseInfo: ReturnType<typeof createUserBaseInfo>,
  contactInfo: ReturnType<typeof createUserContactInfo>,
) {
  return { ...baseInfo, ...contactInfo }
}
```

```typescript
// Use default values and partial updates
interface User {
  firstName?: string
  lastName?: string
  email?: string
  // ...
}

function updateUser(user: User, updates: Partial<User>) {
  return { ...user, ...updates }
}
```

## How to Fix Violations

### 1. Use an Options Object

Group related parameters into a single object:

```diff
- function processOrder(customerId, productId, quantity, shippingAddress, billingAddress, promoCode) {
+ interface OrderOptions {
+   customerId: string;
+   productId: string;
+   quantity: number;
+   shippingAddress: string;
+   billingAddress: string;
+   promoCode?: string;
+ }
+
+ function processOrder(options: OrderOptions) {
    // ...
  }
```

**Pros:**

- Makes the API more flexible (easy to add new optional parameters)
- Self-documenting (parameter names in the interface)
- Easier to extend

**Cons:**

- Slightly more verbose to call
- May hide required parameters

### 2. Split the Function

Break down complex functions into smaller, focused ones:

```diff
- function handleUserValidation(name, email, age, address, phone, password) {
+ function validateName(name: string): boolean {
    // ...
  }
+
+ function validateEmail(email: string): boolean {
    // ...
  }
+
+ function validateAge(age: number): boolean {
    // ...
  }
+
+ function validateAddress(address: string): boolean {
    // ...
  }

  function handleUserValidation(user: User) {
    return (
      validateName(user.name) &&
      validateEmail(user.email) &&
      validateAge(user.age) &&
      validateAddress(user.address)
    );
  }
```

### 3. Use Destructuring with Defaults

When using an options object, provide sensible defaults:

```typescript
interface RequestOptions {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  headers?: Record<string, string>
  body?: unknown
  timeout?: number
  retries?: number
}

function makeRequest({
  url,
  method = 'GET',
  headers = {},
  body,
  timeout = 5000,
  retries = 3,
}: RequestOptions) {
  // ...
}
```

### 4. Consider Builder Pattern

For complex object construction:

```typescript
class UserBuilder {
  private firstName?: string
  private lastName?: string
  private email?: string
  // ...

  withFirstName(firstName: string) {
    this.firstName = firstName
    return this
  }

  withLastName(lastName: string) {
    this.lastName = lastName
    return this
  }

  withEmail(email: string) {
    this.email = email
    return this
  }

  build(): User {
    return {
      firstName: this.firstName!,
      lastName: this.lastName!,
      email: this.email!,
      // ...
    }
  }
}

const user = new UserBuilder()
  .withFirstName('John')
  .withLastName('Doe')
  .withEmail('john@example.com')
  .build()
```

## Related Rules

- [max-complexity](max-complexity.md) - Functions with many parameters often have high complexity
- [max-lines-per-function](max-lines-per-function.md) - Large parameter lists often accompany long functions
- [max-depth](max-depth.md) - Complex parameter handling may lead to deep nesting

## Further Reading

- [Clean Code: A Handbook of Agile Software Craftsmanship](https://www.amazon.com/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350882) - Robert C. Martin
- [Refactoring: Improving the Design of Existing Code](https://refactoring.com/) - Martin Fowler

## Auto-Fix

This rule is auto-fixable. Run:

```bash
codeforge fix --rules max-params
```

**Note**: Auto-fix will suggest an options object structure, but you may need to adjust the naming and organization to fit your specific use case.
