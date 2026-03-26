# max-lines-per-function

![Recommended](https://img.shields.io/badge/-recommended-blue)
![Fixable](https://img.shields.io/badge/-fixable-green)

| Property    | Value      |
| ----------- | ---------- |
| Category    | complexity |
| Fixable     | Yes        |
| Recommended | Yes        |
| Deprecated  | No         |

## Description

Enforce a maximum number of lines per function. Long functions are harder to understand, test, and maintain. They often have multiple responsibilities and should be broken down into smaller, focused functions.

## Why This Rule Matters

Long functions:

- **Reduce readability**: Harder to understand what the function does
- **Make testing difficult**: More scenarios to test
- **Increase bug risk**: Long functions have higher defect rates
- **Violate Single Responsibility Principle**: Often do too many things

### Length Guidelines

| Lines  | Interpretation  | Recommendation            |
| ------ | --------------- | ------------------------- |
| 1-20   | Short, focused  | ✅ Ideal                  |
| 21-50  | Moderate length | ⚠️ Acceptable but monitor |
| 51-100 | Long            | ❌ Consider refactoring   |
| 100+   | Very long       | 🚨 Should be refactored   |

## Configuration Options

```json
{
  "rules": {
    "max-lines-per-function": [
      "warn",
      {
        "max": 50,
        "skipBlankLines": true,
        "skipComments": true
      }
    ]
  }
}
```

| Option           | Type      | Default | Description                                  |
| ---------------- | --------- | ------- | -------------------------------------------- |
| `max`            | `number`  | `50`    | Maximum number of lines allowed per function |
| `skipBlankLines` | `boolean` | `true`  | Skip blank lines when counting               |
| `skipComments`   | `boolean` | `true`  | Skip comment lines when counting             |

## When to Use This Rule

**Use this rule when:**

- Enforcing code quality standards
- Code reviewing for function size
- Preventing function bloat

**Consider disabling when:**

- Auto-generated code
- Performance-critical sections where function calls are too costly
- Legacy code that can't be immediately refactored

## Code Examples

### ❌ Incorrect - Too Long

```typescript
// 120+ lines - Too long
function processOrder(order: Order): OrderResult {
  // Validate order
  if (!order) {
    return { success: false, error: 'Invalid order' }
  }
  if (!order.items || order.items.length === 0) {
    return { success: false, error: 'No items' }
  }
  if (!order.customer) {
    return { success: false, error: 'No customer' }
  }

  // Calculate totals
  let subtotal = 0
  for (const item of order.items) {
    subtotal += item.price * item.quantity
  }
  const tax = subtotal * 0.1
  const shipping = order.type === 'express' ? 15 : 5
  const total = subtotal + tax + shipping

  // Check inventory
  const inventoryStatus = await checkInventory(order.items)
  if (!inventoryStatus.available) {
    return { success: false, error: 'Items not available' }
  }

  // Process payment
  const paymentResult = await processPayment({
    amount: total,
    method: order.paymentMethod,
    customer: order.customer,
  })
  if (!paymentResult.success) {
    return { success: false, error: paymentResult.error }
  }

  // Create shipment
  const shipment = await createShipment({
    items: order.items,
    address: order.shippingAddress,
    method: order.type,
  })

  // Send confirmation
  await sendEmail({
    to: order.customer.email,
    subject: 'Order Confirmation',
    body: `Your order ${order.id} has been received.`,
  })

  // Update database
  await updateOrder(order.id, {
    status: 'processed',
    total,
    shipmentId: shipment.id,
  })

  return { success: true, orderId: order.id }
}
```

### ✅ Correct - Refactored

```typescript
// Each function under 50 lines

function validateOrder(order: Order): ValidationResult {
  if (!order) return { valid: false, error: 'Invalid order' }
  if (!order.items || order.items.length === 0) {
    return { valid: false, error: 'No items' }
  }
  if (!order.customer) return { valid: false, error: 'No customer' }

  return { valid: true }
}

function calculateOrderTotals(items: OrderItem[], type: string): OrderTotals {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const tax = subtotal * 0.1
  const shipping = type === 'express' ? 15 : 5
  return { subtotal, tax, shipping, total: subtotal + tax + shipping }
}

async function verifyInventory(items: OrderItem[]): Promise<InventoryStatus> {
  return await checkInventory(items)
}

async function processOrderPayment(
  total: number,
  method: string,
  customer: Customer,
): Promise<PaymentResult> {
  return await processPayment({ amount: total, method, customer })
}

async function createOrderShipment(
  items: OrderItem[],
  address: Address,
  type: string,
): Promise<Shipment> {
  return await createShipment({ items, address, method: type })
}

async function sendOrderConfirmation(orderId: string, email: string): Promise<void> {
  await sendEmail({
    to: email,
    subject: 'Order Confirmation',
    body: `Your order ${orderId} has been received.`,
  })
}

async function updateOrderStatus(
  orderId: string,
  status: string,
  totals: OrderTotals,
  shipmentId: string,
): Promise<void> {
  await updateOrder(orderId, { status, totals, shipmentId })
}

// Main orchestrator - clear and under 50 lines
async function processOrder(order: Order): Promise<OrderResult> {
  const validation = validateOrder(order)
  if (!validation.valid) {
    return { success: false, error: validation.error }
  }

  const totals = calculateOrderTotals(order.items, order.type)

  const inventory = await verifyInventory(order.items)
  if (!inventory.available) {
    return { success: false, error: 'Items not available' }
  }

  const payment = await processOrderPayment(totals.total, order.paymentMethod, order.customer)
  if (!payment.success) {
    return { success: false, error: payment.error }
  }

  const shipment = await createOrderShipment(order.items, order.shippingAddress, order.type)

  await sendOrderConfirmation(order.id, order.customer.email)

  await updateOrderStatus(order.id, 'processed', totals, shipment.id)

  return { success: true, orderId: order.id }
}
```

## How to Fix Violations

### 1. Extract Helper Functions

Move repeated or complex logic to separate functions:

```diff
- function validateUser(user: User): boolean {
-   if (!user) return false;
-   if (!user.email) return false;
-   if (!user.email.includes('@')) return false;
-   if (!user.password) return false;
-   if (user.password.length < 8) return false;
-   if (!/[A-Z]/.test(user.password)) return false;
-   if (!/[0-9]/.test(user.password)) return false;
-   if (user.age < 18) return false;
-   if (!user.name) return false;
-   return true;
- }

+ function isValidEmail(email: string): boolean {
+   return email.includes('@');
+ }
+
+ function isValidPassword(password: string): boolean {
+   return password.length >= 8 &&
+          /[A-Z]/.test(password) &&
+          /[0-9]/.test(password);
+ }
+
+ function isAdult(age: number): boolean {
+   return age >= 18;
+ }
+
+ function validateUser(user: User): boolean {
+   if (!user) return false;
+   if (!user.email || !isValidEmail(user.email)) return false;
+   if (!user.password || !isValidPassword(user.password)) return false;
+   if (!isAdult(user.age)) return false;
+   return !!user.name;
+ }
```

### 2. Use Early Returns

Replace nested conditions with early returns:

```diff
- function processRequest(request: Request): Response {
-   if (request.valid) {
-     if (request.authenticated) {
-       if (request.authorized) {
-         // Process request
-         return { status: 200, data: processData(request.data) };
-       } else {
-         return { status: 403, error: 'Forbidden' };
-       }
-     } else {
-       return { status: 401, error: 'Unauthorized' };
-     }
-   } else {
-     return { status: 400, error: 'Bad request' };
-   }
- }

+ function processRequest(request: Request): Response {
+   if (!request.valid) return { status: 400, error: 'Bad request' };
+   if (!request.authenticated) return { status: 401, error: 'Unauthorized' };
+   if (!request.authorized) return { status: 403, error: 'Forbidden' };
+
+   return { status: 200, data: processData(request.data) };
+ }
```

### 3. Extract Conditional Logic

Move complex conditionals to named functions:

```diff
- function getDiscount(user: User, product: Product): number {
-   if (user.vip) {
-     if (product.premium) {
-       return 0.25;
-     } else if (product.sale) {
-       return 0.20;
-     } else {
-       return 0.15;
-     }
-   } else {
-     if (product.premium) {
-       return 0.10;
+ function calculateVipDiscount(product: Product): number {
+   if (product.premium) return 0.25;
+   if (product.sale) return 0.20;
+   return 0.15;
+ }
+
+ function calculateRegularDiscount(product: Product): number {
+   if (product.premium) return 0.10;
+   if (product.sale) return 0.05;
+   return 0;
+ }
+
+ function getDiscount(user: User, product: Product): number {
+   return user.vip
+     ? calculateVipDiscount(product)
+     : calculateRegularDiscount(product);
+ }
```

### 4. Use Strategy Pattern

Replace long switch/if chains with strategy objects:

```diff
- function formatDate(date: Date, format: string): string {
-   if (format === 'short') {
-     const day = date.getDate();
-     const month = date.getMonth() + 1;
-     const year = date.getFullYear();
-     return `${month}/${day}/${year}`;
-   } else if (format === 'long') {
-     const months = ['January', 'February', 'March', 'April', 'May', 'June',
-                    'July', 'August', 'September', 'October', 'November', 'December'];
-     const monthName = months[date.getMonth()];
-     const day = date.getDate();
-     const year = date.getFullYear();
-     return `${monthName} ${day}, ${year}`;
-   } else if (format === 'iso') {
-     const iso = date.toISOString();
-     return iso.split('T')[0];
-   } else if (format === 'time') {
-     const hours = date.getHours();
-     const minutes = date.getMinutes();
-     return `${hours}:${minutes}`;
-   }
-   return date.toString();
- }

+ const formatters = {
+   short: (date: Date) => {
+     const day = date.getDate();
+     const month = date.getMonth() + 1;
+     const year = date.getFullYear();
+     return `${month}/${day}/${year}`;
+   },
+   long: (date: Date) => {
+     const months = ['January', 'February', 'March', 'April', 'May', 'June',
+                    'July', 'August', 'September', 'October', 'November', 'December'];
+     return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
+   },
+   iso: (date: Date) => date.toISOString().split('T')[0],
+   time: (date: Date) => `${date.getHours()}:${date.getMinutes()}`,
+ };
+
+ function formatDate(date: Date, format: keyof typeof formatters): string {
+   const formatter = formatters[format] || ((d: Date) => d.toString());
+   return formatter(date);
+ }
```

## Related Rules

- [max-complexity](max-complexity.md) - Long functions often have high complexity
- [max-depth](max-depth.md) - Long functions often contain deep nesting
- [max-params](max-params.md) - Complex parameter handling can lead to long functions

## Auto-Fix

This rule is not auto-fixable. Function extraction requires understanding of the function's purpose. Use:

```bash
codeforge analyze --rules max-lines-per-function
```
