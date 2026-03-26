# max-complexity

![Recommended](https://img.shields.io/badge/-recommended-blue)
![Fixable](https://img.shields.io/badge/-fixable-green)

| Property    | Value      |
| ----------- | ---------- |
| Category    | complexity |
| Fixable     | Yes        |
| Recommended | Yes        |
| Deprecated  | No         |

## Description

Enforce a maximum cyclomatic complexity threshold for functions. Cyclomatic complexity measures the number of linearly independent paths through a program's source code. Higher complexity indicates more decision points and generally harder to understand, test, and maintain code.

## What is Cyclomatic Complexity?

Cyclomatic complexity is calculated by counting the number of decision points in your code:

- `if` statements
- `while`, `do`, `for` loops
- `case` statements (in `switch`)
- Conditional (ternary) expressions
- Logical operators (`&&`, `||`)

Each decision point increases complexity by 1. The base complexity of a function is 1.

### Example Calculation

```typescript
function example(x: number, y: number): number {
  if (x > 0) {
    // +1 complexity
    if (y > 0) {
      // +1 complexity
      return x + y
    } else {
      // +1 complexity
      return x - y
    }
  }
  return 0 // Base = 1
}
// Total complexity: 1 (base) + 3 (decisions) = 4
```

## Why This Rule Matters

High cyclomatic complexity:

- **Increases cognitive load**: Harder to understand what the function does
- **Makes testing difficult**: More code paths to test and cover
- **Increases bug risk**: More complex functions have higher defect rates
- **Reduces maintainability**: Changes are riskier and harder to validate

### Complexity Guidelines

| Complexity Level | Interpretation          | Recommendation                   |
| ---------------- | ----------------------- | -------------------------------- |
| 1-10             | Simple, well-structured | ✅ Acceptable for most functions |
| 11-20            | Moderate complexity     | ⚠️ Consider refactoring          |
| 21-50            | High complexity         | ❌ Should be refactored          |
| 50+              | Very high complexity    | 🚨 Must be refactored            |

## Configuration Options

```json
{
  "rules": {
    "max-complexity": ["warn", { "max": 10 }]
  }
}
```

| Option | Type     | Default | Description                           |
| ------ | -------- | ------- | ------------------------------------- |
| `max`  | `number` | `10`    | Maximum cyclomatic complexity allowed |

## When to Use This Rule

**Use this rule when:**

- Maintaining a large codebase with multiple contributors
- Building critical systems where reliability is paramount
- Onboarding new developers who need to understand code quickly
- Working in environments with high code review standards

**Consider disabling when:**

- Auto-generated code where complexity is not under direct control
- Performance-critical sections where function extraction is too costly
- Legacy code that cannot be immediately refactored (use warnings)

## Code Examples

### ❌ Incorrect - High Complexity

```typescript
// Complexity: 12 - Too many decision points
function processOrder(order: Order): OrderStatus {
  if (!order) {
    // +1
    return OrderStatus.Invalid
  }

  if (!order.items || order.items.length === 0) {
    // +1
    return OrderStatus.Empty
  }

  if (order.type === 'digital') {
    // +1
    if (order.value > 100) {
      // +1
      if (order.verified) {
        // +1
        return OrderStatus.Approved
      } else {
        // +1
        return OrderStatus.PendingVerification
      }
    }
  } else if (order.type === 'physical') {
    // +1
    if (order.shipping) {
      // +1
      if (order.shipping.express) {
        // +1
        return OrderStatus.ExpressShipping
      } else {
        // +1
        return OrderStatus.StandardShipping
      }
    }
  } else {
    // +1
    return OrderStatus.UnsupportedType
  }

  if (order.discount) {
    // +1
    return OrderStatus.DiscountApplied
  }

  return OrderStatus.Processed // Base = 1
}
```

### ✅ Correct - Refactored

```typescript
// Extract validation logic
function validateOrder(order: Order): OrderStatus | null {
  if (!order) return OrderStatus.Invalid
  if (!order.items || order.items.length === 0) return OrderStatus.Empty
  return null
}

// Extract type-specific processing
function processDigitalOrder(order: Order): OrderStatus {
  if (order.value > 100) {
    return order.verified ? OrderStatus.Approved : OrderStatus.PendingVerification
  }
  return OrderStatus.Processed
}

function processPhysicalOrder(order: Order): OrderStatus {
  if (!order.shipping) return OrderStatus.Processed
  return order.shipping.express ? OrderStatus.ExpressShipping : OrderStatus.StandardShipping
}

// Main orchestrator - Complexity: 5
function processOrder(order: Order): OrderStatus {
  const validationError = validateOrder(order)
  if (validationError) return validationError

  switch (order.type) {
    case 'digital':
      return processDigitalOrder(order)
    case 'physical':
      return processPhysicalOrder(order)
    default:
      return OrderStatus.UnsupportedType
  }
}
```

## How to Fix Violations

### 1. Extract Helper Functions

Break down complex logic into smaller, well-named functions:

```diff
- function processUser(user: User): string {
-   if (user.age < 18) {
-     if (user.country === 'US') {
-       return 'Minor - US';
-     } else {
-       return 'Minor - International';
-     }
-   } else if (user.age >= 65) {
-     if (user.country === 'US') {
-       return 'Senior - US';
-     } else {
-       return 'Senior - International';
-     }
-   } else {
-     if (user.country === 'US') {
-       return 'Adult - US';
-     } else {
-       return 'Adult - International';
-     }
-   }
- }

+ function isMinor(age: number): boolean {
+   return age < 18;
+ }
+
+ function isSenior(age: number): boolean {
+   return age >= 65;
+ }
+
+ function getLocationCategory(country: string): string {
+   return country === 'US' ? 'US' : 'International';
+ }
+
+ function processUser(user: User): string {
+   const ageCategory = isMinor(user.age) ? 'Minor'
+                    : isSenior(user.age) ? 'Senior'
+                    : 'Adult';
+   const locationCategory = getLocationCategory(user.country);
+   return `${ageCategory} - ${locationCategory}`;
+ }
```

### 2. Use Guard Clauses

Replace nested conditions with early returns:

```diff
- function processPayment(payment: Payment): PaymentStatus {
-   if (payment.valid) {
-     if (payment.amount > 0) {
-       if (payment.currency === 'USD') {
-         // Process payment
-         return PaymentStatus.Success;
-       } else {
-         return PaymentStatus.InvalidCurrency;
-       }
-     } else {
-       return PaymentStatus.InvalidAmount;
-     }
-   } else {
-     return PaymentStatus.Invalid;
-   }
- }

+ function processPayment(payment: Payment): PaymentStatus {
+   if (!payment.valid) return PaymentStatus.Invalid;
+   if (payment.amount <= 0) return PaymentStatus.InvalidAmount;
+   if (payment.currency !== 'USD') return PaymentStatus.InvalidCurrency;
+
+   // Process payment
+   return PaymentStatus.Success;
+ }
```

### 3. Use Strategy Pattern

Replace complex conditional logic with strategy objects:

```diff
- function calculateTax(order: Order): number {
-   if (order.country === 'US') {
-     if (order.state === 'CA') {
-       return order.amount * 0.0725;
-     } else if (order.state === 'NY') {
-       return order.amount * 0.08875;
-     } else if (order.state === 'TX') {
-       return order.amount * 0.0625;
-     }
-     // ... more states
-   } else if (order.country === 'CA') {
-     return order.amount * 0.05;
-   } else if (order.country === 'UK') {
-     return order.amount * 0.20;
-   }
-   // ... more countries
-   return order.amount * 0;
- }

+ const taxCalculators = {
+   US: {
+     CA: (amount: number) => amount * 0.0725,
+     NY: (amount: number) => amount * 0.08875,
+     TX: (amount: number) => amount * 0.0625,
+     // ... more states
+   },
+   CA: { default: (amount: number) => amount * 0.05 },
+   UK: { default: (amount: number) => amount * 0.20 },
+ } as const;
+
+ function calculateTax(order: Order): number {
+   const calculator = taxCalculators[order.country]?.[order.state]
+                       ?? taxCalculators[order.country]?.default
+                       ?? taxCalculators.US.default;
+   return calculator(order.amount);
+ }
```

### 4. Use Polymorphism

Replace type checking with polymorphic behavior:

```diff
- function processShape(shape: Shape): number {
-   if (shape.type === 'circle') {
-     return Math.PI * shape.radius ** 2;
-   } else if (shape.type === 'rectangle') {
-     return shape.width * shape.height;
-   } else if (shape.type === 'triangle') {
-     return 0.5 * shape.base * shape.height;
-   }
-   return 0;
- }

+ abstract class Shape {
+   abstract calculateArea(): number;
+ }
+
+ class Circle extends Shape {
+   constructor(public radius: number) {}
+   calculateArea(): number {
+     return Math.PI * this.radius ** 2;
+   }
+ }
+
+ class Rectangle extends Shape {
+   constructor(public width: number, public height: number) {}
+   calculateArea(): number {
+     return this.width * this.height;
+   }
+ }
+
+ class Triangle extends Shape {
+   constructor(public base: number, public height: number) {}
+   calculateArea(): number {
+     return 0.5 * this.base * this.height;
+   }
+ }
+
+ function processShape(shape: Shape): number {
+   return shape.calculateArea();
+ }
```

### 5. Simplify Boolean Expressions

Use early returns and logical simplifications:

```diff
- function isValidUser(user: User): boolean {
-   if (user.email && user.password) {
-     if (user.age >= 18) {
-       if (user.verified) {
-         return true;
-       } else {
-         return false;
-       }
-     } else {
-       return false;
+ function isValidUser(user: User): boolean {
+   return !!(
+     user.email &&
+     user.password &&
+     user.age >= 18 &&
+     user.verified
    );
  }
-   return false;
- }
```

## Related Rules

- [max-params](max-params.md) - Functions with many parameters often have high complexity
- [max-lines-per-function](max-lines-per-function.md) - Complex functions are often long
- [max-depth](max-depth.md) - Deep nesting often correlates with high complexity

## Further Reading

- [Cyclomatic Complexity](https://en.wikipedia.org/wiki/Cyclomatic_complexity) - Wikipedia
- [A Complexity Measure](https://www.mccabe.com/pdf/mccabe-nistructuredtesting.pdf) - Thomas J. McCabe (1976)
- [Clean Code: A Handbook of Agile Software Craftsmanship](https://www.amazon.com/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350882) - Robert C. Martin

## Auto-Fix

This rule is not fully auto-fixable, but can provide suggestions. Use:

```bash
codeforge analyze --rules max-complexity
```

Manual refactoring is recommended to ensure proper code organization and maintainability.
