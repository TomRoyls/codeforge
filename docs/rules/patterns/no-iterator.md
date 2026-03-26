# no-iterator

![Recommended](https://img.shields.io/badge/-recommended-blue)

| Property    | Value    |
| ----------- | -------- |
| Category    | patterns |
| Fixable     | No       |
| Recommended | Yes      |
| Deprecated  | No       |

## Description

Disallow explicit iterator protocols and manual iteration methods. Iterators (`Symbol.iterator`, `[Symbol.iterator]()`, `for...of` loops) can introduce complexity and performance overhead. Most iteration use cases can be handled more cleanly with array methods (`map`, `filter`, `reduce`, `forEach`) or spread operators.

## Why This Rule Matters

Using iterator protocols incorrectly is problematic because:

- **Performance overhead**: Iterators create additional objects and function calls
- **Complexity**: Custom iterator logic is harder to read and maintain
- **Mutation concerns**: Iterators can lead to accidental state modification
- **Debugging difficulty**: Iterator state makes debugging more challenging
- **Type safety**: Iterator types can be more complex to handle in TypeScript
- **Error-prone**: Manual iteration is more likely to have off-by-one errors

### Common Issues

```javascript
// ISSUE: Using for...of when array methods are clearer
for (const item of items) {
  console.log(item)
}

// ISSUE: Implementing custom iterator unnecessarily
class MyCollection {
  *[Symbol.iterator]() {
    yield* this.items
  }
}
```

## Iterator Protocols Detected

This rule detects the following iterator patterns:

- `[Symbol.iterator]` - Iterator property definition
- `[Symbol.iterator]()` - Iterator method implementation
- `for...of` loops - Iteration with for-of syntax
- `for await...of` - Async iteration with for-await-of
- `next()` calls - Manual iterator next() calls
- Generator functions used for iteration (`function*`)

## Configuration Options

```json
{
  "rules": {
    "no-iterator": [
      "error",
      {
        "allow": ["forOf", "generator"]
      }
    ]
  }
}
```

| Option  | Type       | Default | Description                                                         |
| ------- | ---------- | ------- | ------------------------------------------------------------------- |
| `allow` | `string[]` | `[]`    | List of iterator patterns to allow (e.g., `["forOf", "generator"]`) |

### allow Option Usage

The `allow` option permits specific iterator patterns for legitimate use cases.

```json
{
  "rules": {
    "no-iterator": [
      "error",
      {
        "allow": ["forOf"]
      }
    ]
  }
}
```

With this configuration, `for...of` loops are allowed but explicit iterator protocols are still detected.

## When to Use This Rule

**Use this rule when:**

- You want to encourage functional programming patterns
- Your codebase primarily works with arrays and collections
- You prefer array methods over iteration loops
- You want to reduce complexity in iteration logic
- Performance is a concern (array methods are often optimized)

**Consider disabling when:**

- You're implementing custom data structures that require iteration
- You're working with third-party libraries that use iterators
- You need lazy evaluation with generators
- You're building iteration utilities for other developers

## Code Examples

### ❌ Incorrect - Using Iterator Protocols

```typescript
// Using for...of loop
for (const item of items) {
  console.log(item)
}
```

```typescript
// Implementing custom iterator
class MyCollection {
  constructor(private items: T[]) {}

  *[Symbol.iterator](): Iterator {
    for (const item of this.items) {
      yield item
    }
  }
}
```

```typescript
// Manual iterator usage
const iterator = items[Symbol.iterator]()
let result = iterator.next()

while (!result.done) {
  console.log(result.value)
  result = iterator.next()
}
```

```typescript
// Using generator for iteration
function* iterateItems(items: T[]) {
  for (const item of items) {
    yield item
  }
}
```

### ✅ Correct - Using Array Methods

```typescript
// Use forEach for side effects
items.forEach((item) => {
  console.log(item)
})
```

```typescript
// Use map for transformations
const doubled = items.map((item) => item * 2)
```

```typescript
// Use filter for selection
const evenNumbers = items.filter((item) => item % 2 === 0)
```

```typescript
// Use reduce for aggregation
const sum = items.reduce((acc, item) => acc + item, 0)
```

```typescript
// Use find for searching
const found = items.find((item) => item.id === targetId)
```

```typescript
// Use some/every for boolean checks
const hasPositive = items.some((item) => item > 0)
const allPositive = items.every((item) => item > 0)
```

### ✅ Correct - Spread Operators

```typescript
// Use spread operator to convert to array
const itemsArray = [...iterable]
```

```typescript
// Use spread for merging
const merged = [...items1, ...items2]
```

```typescript
// Use spread for function arguments
const max = Math.max(...numbers)
```

### ✅ Correct - Legitimate Iterator Usage

```json
// Configuration:
{
  "rules": {
    "no-iterator": [
      "error",
      {
        "allow": ["forOf", "generator"]
      }
    ]
  }
}
```

```typescript
// Lazy evaluation with generators
function* fibonacci() {
  let [prev, curr] = [0, 1]
  while (true) {
    yield curr
    ;[prev, curr] = [curr, prev + curr]
  }
}

// Custom iterable data structure
class Range {
  constructor(
    private start: number,
    private end: number,
  ) {}

  *[Symbol.iterator](): Iterator {
    for (let i = this.start; i <= this.end; i++) {
      yield i
    }
  }
}

// Async iteration with for-await-of
async function* fetchItems(urls: string[]) {
  for (const url of urls) {
    const response = await fetch(url)
    yield await response.json()
  }
}
```

## How to Fix Violations

### 1. Replace for...of with forEach

```diff
- for (const item of items) {
-   console.log(item);
- }
+ items.forEach((item) => {
+   console.log(item);
+ });
```

### 2. Replace for...of with map for Transformations

```diff
- const doubled: number[] = [];
- for (const item of items) {
-   doubled.push(item * 2);
- }
+ const doubled = items.map((item) => item * 2);
```

### 3. Replace for...of with filter for Selection

```diff
- const evenNumbers: number[] = [];
- for (const item of items) {
-   if (item % 2 === 0) {
-     evenNumbers.push(item);
-   }
- }
+ const evenNumbers = items.filter((item) => item % 2 === 0);
```

### 4. Replace for...of with reduce for Aggregation

```diff
- let sum = 0;
- for (const item of items) {
-   sum += item;
- }
+ const sum = items.reduce((acc, item) => acc + item, 0);
```

### 5. Replace for...of with find for Search

```diff
- let found: Item | undefined;
- for (const item of items) {
-   if (item.id === targetId) {
-     found = item;
-     break;
-   }
- }
+ const found = items.find((item) => item.id === targetId);
```

### 6. Replace Manual Iterator with Array Conversion

```diff
- const iterator = items[Symbol.iterator]();
- const result: T[] = [];
- let next = iterator.next();
- while (!next.done) {
-   result.push(next.value);
-   next = iterator.next();
- }
+ const result = [...items];
```

### 7. Replace Generator with Array for Small Collections

```diff
- function* getItems() {
-   yield 1;
-   yield 2;
-   yield 3;
- }
+ function getItems(): number[] {
+   return [1, 2, 3];
+ }
```

## Best Practices

### When Iterator Protocols Are Acceptable

Iterator protocols are acceptable in these scenarios:

1. **Lazy evaluation**: Processing large datasets without loading all data
2. **Infinite sequences**: Generating values on-demand (e.g., Fibonacci, primes)
3. **Custom data structures**: Implementing specialized collections
4. **Async iteration**: Streaming data with async generators
5. **Memory optimization**: Avoiding creating intermediate arrays

Always document why iterator protocols are necessary:

```typescript
/**
 * Generate prime numbers using the Sieve of Eratosthenes.
 * Uses a generator for lazy evaluation - generates primes
 * on-demand without storing all primes in memory.
 */
function* generatePrimes(): Generator {
  // Implementation
}
```

### Prefer Array Methods Over Iteration

Array methods provide better readability and often better performance:

```typescript
// ❌ Manual iteration with mutation
const results: number[] = []
for (const item of items) {
  if (item.isValid) {
    results.push(transform(item))
  }
}

// ✅ Functional approach
const results = items.filter((item) => item.isValid).map((item) => transform(item))
```

### Use Method Chaining for Complex Operations

```typescript
// ❌ Nested loops are hard to read
for (const user of users) {
  for (const post of user.posts) {
    if (post.published) {
      console.log(post.title)
    }
  }
}

// ✅ Flatten and filter
const publishedTitles = users
  .flatMap((user) => user.posts)
  .filter((post) => post.published)
  .map((post) => post.title)
```

## Common Pitfalls

### Premature Optimization

```typescript
// ❌ Using iterators thinking it's faster
for (const item of largeArray) {
  process(item)
}

// ✅ Modern engines optimize array methods well
largeArray.forEach((item) => process(item))
```

### Forgetting Side Effects

```typescript
// ❌ Side effects in for...of can be unclear
for (const item of items) {
  console.log(item)
  process(item)
}

// ✅ Explicit about side effects
items.forEach((item) => {
  console.log(item)
  process(item)
})
```

### Early Exit Complexity

```typescript
// ❌ Breaking out of for...of is less clear
for (const item of items) {
  if (shouldStop(item)) {
    break
  }
  process(item)
}

// ✅ Use find for early exit
const shouldProcess = items.find((item) => shouldStop(item))
if (shouldProcess) {
  process(shouldProcess)
}
```

## Related Rules

- [no-loop](../patterns/no-loop.md) - Disallow loop statements
- [prefer-array-methods](../patterns/prefer-array-methods.md) - Encourage array methods
- [no-mutation](../patterns/no-mutation.md) - Disallow mutation

## Further Reading

- [MDN: Iteration Protocols](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols)
- [MDN: Iterators and Generators](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Iterators_and_Generators)
- [Array.prototype methods](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)
- [Functional Programming in JavaScript](https://www.sitepoint.com/functional-programming-javascript/)

## Auto-Fix

This rule is not auto-fixable. Replacing iterators with array methods requires understanding the iteration logic and intended behavior.

Use interactive mode to review violations:

```bash
codeforge analyze --rules no-iterator
```
