# no-labels

![Recommended](https://img.shields.io/badge/-recommended-blue)

| Property    | Value    |
| ----------- | -------- |
| Category    | patterns |
| Fixable     | No       |
| Recommended | Yes      |
| Deprecated  | No       |

## Description

Disallow labeled statements and labeled `break`/`continue`. Labeled statements in JavaScript are rarely needed in modern code and can lead to confusing control flow. They make code harder to read, understand, and maintain, especially for developers unfamiliar with this feature.

## Why This Rule Matters

Using labeled statements is problematic because:

- **Readability issues**: Labels are an obscure feature that many developers don't encounter regularly
- **Maintenance burden**: Code with labels is harder to refactor and modify
- **Confusing control flow**: Labels make the flow of execution less obvious
- **Modern alternatives**: Better patterns exist for managing nested loops and complex control structures
- **Error-prone**: It's easy to misuse labels, leading to unexpected behavior
- **Tooling limitations**: Some static analysis tools struggle with labeled code

### Common Problems with Labels

```javascript
// Labels make it hard to follow execution flow
outer: for (let i = 0; i < 10; i++) {
  for (let j = 0; j < 10; j++) {
    if (shouldBreak) {
      break outer // Where does this go?
    }
  }
}

// Labels can be confusing when multiple exist
start: while (condition1) {
  middle: while (condition2) {
    if (specialCase) {
      break start // Which loop does this break?
    }
  }
}
```

## Labeled Statements Detected

This rule detects the following labeled statements:

- Labeled `for` loops
- Labeled `while` loops
- Labeled `do...while` loops
- Labeled `for...in` loops
- Labeled `for...of` loops
- Labeled `if` statements
- Labeled `switch` statements
- Labeled blocks (using `{}`)
- Labeled `break` statements
- Labeled `continue` statements

## Configuration Options

```json
{
  "rules": {
    "no-labels": [
      "error",
      {
        "allowLoops": false,
        "allowSwitch": false
      }
    ]
  }
}
```

| Option        | Type    | Default | Description                                  |
| ------------- | ------- | ------- | -------------------------------------------- |
| `allowLoops`  | boolean | `false` | Allow labeled loops (for, while, do...while) |
| `allowSwitch` | boolean | `false` | Allow labeled switch statements              |

### allowLoops Option Usage

The `allowLoops` option permits labeled loops for legitimate use cases like breaking out of nested loops.

```json
{
  "rules": {
    "no-labels": [
      "error",
      {
        "allowLoops": true
      }
    ]
  }
}
```

With this configuration, labeled loops are allowed but other labeled statements (like `switch` or `if`) are still detected.

### allowSwitch Option Usage

The `allowSwitch` option permits labeled switch statements, which some developers use for state machines.

```json
{
  "rules": {
    "no-labels": [
      "error",
      {
        "allowSwitch": true
      }
    ]
  }
}
```

## When to Use This Rule

**Use this rule when:**

- You want to enforce modern JavaScript/TypeScript coding practices
- Your codebase doesn't require labeled statements
- You prioritize code readability and maintainability
- You work in a team where not everyone is familiar with labels
- You want to prevent potential misuse of labels

**Consider disabling when:**

- Your codebase specifically uses labeled loops for breaking out of deeply nested structures
- You're implementing a state machine that benefits from labeled switches
- You're working with algorithms that require labeled control flow
- You have legacy code that relies on labels and refactoring is not feasible

## Code Examples

### ❌ Incorrect - Using Labeled Statements

```typescript
// Labeled for loop
outer: for (let i = 0; i < rows; i++) {
  for (let j = 0; j < cols; j++) {
    if (found) break outer
  }
}
```

```typescript
// Labeled while loop
search: while (hasMoreItems()) {
  const item = getNextItem()
  if (item.matches()) {
    break search
  }
}
```

```typescript
// Labeled do...while loop
process: do {
  const result = processItem()
  if (result === 'complete') break process
} while (hasMore)
```

```typescript
// Labeled continue
outer: for (let i = 0; i < 10; i++) {
  for (let j = 0; j < 10; j++) {
    if (shouldSkip) continue outer
  }
}
```

```typescript
// Labeled switch statement
state: switch (currentState) {
  case 'loading':
    if (error) break state
    break
  case 'complete':
    processResult()
    break
}
```

```typescript
// Labeled block
cleanup: {
  try {
    doWork()
  } catch (error) {
    logError(error)
    break cleanup
  }
  finalize()
}
```

### ✅ Correct - Using Alternatives to Labels

```typescript
// Use a flag variable instead of labeled break
let found = false
for (let i = 0; i < rows && !found; i++) {
  for (let j = 0; j < cols && !found; j++) {
    if (foundItem(i, j)) {
      found = true
    }
  }
}
```

```typescript
// Use a function to return early
function searchItem(): Item | null {
  while (hasMoreItems()) {
    const item = getNextItem()
    if (item.matches()) {
      return item
    }
  }
  return null
}
```

```typescript
// Use a function with early return for do...while
function processItems(): void {
  while (hasMore) {
    const result = processItem()
    if (result === 'complete') {
      return
    }
  }
}
```

```typescript
// Use separate conditions instead of labeled continue
for (let i = 0; i < 10; i++) {
  let shouldSkipInner = false
  for (let j = 0; j < 10; j++) {
    if (shouldSkip(j)) {
      shouldSkipInner = true
      break
    }
  }
  if (shouldSkipInner) continue
  // Process i
}
```

```typescript
// Use a state machine object with methods instead of labeled switch
class StateMachine {
  handleLoading(): void {
    if (error) {
      this.transitionTo('error')
      return
    }
    this.transitionTo('complete')
  }

  handleComplete(): void {
    processResult()
  }

  transitionTo(state: string): void {
    this.currentState = state
  }
}
```

```typescript
// Use try/catch with finally instead of labeled block
try {
  doWork()
} catch (error) {
  logError(error)
  throw error
} finally {
  finalize()
}
```

### ✅ Correct - Legitimate Use of Labeled Loops

```json
// Configuration:
{
  "rules": {
    "no-labels": [
      "error",
      {
        "allowLoops": true
      }
    ]
  }
}
```

```typescript
// Breaking out of deeply nested loops is a valid use case
function findPair(matrix: number[][], target: number): [number, number] | null {
  outer: for (let i = 0; i < matrix.length; i++) {
    for (let j = 0; j < matrix[i].length; j++) {
      if (matrix[i][j] === target) {
        return [i, j]
      }
      if (matrix[i][j] > target) {
        break outer // Optimization: break outer since row is sorted
      }
    }
  }
  return null
}
```

```typescript
// Continuing outer loop can be useful in nested iterations
function processMatrix(matrix: number[][]): void {
  outer: for (let i = 0; i < matrix.length; i++) {
    for (let j = 0; j < matrix[i].length; j++) {
      if (matrix[i][j] === null) {
        continue outer // Skip entire row if null found
      }
      processValue(matrix[i][j])
    }
  }
}
```

## How to Fix Violations

### 1. Replace Labeled Loop with Flag Variable

```diff
- outer: for (let i = 0; i < rows; i++) {
-   for (let j = 0; j < cols; j++) {
-     if (found) break outer
-   }
- }
+ let found = false
+ for (let i = 0; i < rows && !found; i++) {
+   for (let j = 0; j < cols && !found; j++) {
+     if (foundItem()) {
+       found = true
+     }
+   }
+ }
```

### 2. Extract Nested Loop to a Function

```diff
- outer: for (let i = 0; i < items.length; i++) {
-   for (let j = 0; j < items[i].subItems.length; j++) {
-     if (items[i].subItems[j].matches()) {
-       break outer
-     }
-   }
- }
+ function findMatchingItem(items: Item[]): Item | null {
+   for (let i = 0; i < items.length; i++) {
+     for (let j = 0; j < items[i].subItems.length; j++) {
+       if (items[i].subItems[j].matches()) {
+         return items[i].subItems[j]
+       }
+     }
+   }
+   return null
+ }
+
+ const item = findMatchingItem(items)
```

### 3. Use Early Return in Functions

```diff
- search: while (hasMoreItems()) {
-   const item = getNextItem()
-   if (item.matches()) {
-     break search
-   }
- }
- return null
+ while (hasMoreItems()) {
+   const item = getNextItem()
+   if (item.matches()) {
+     return item
+   }
+ }
+ return null
```

### 4. Replace Labeled Continue with Inner Break

```diff
- outer: for (let i = 0; i < 10; i++) {
-   for (let j = 0; j < 10; j++) {
-     if (shouldSkip) continue outer
-     process(i, j)
-   }
- }
+ for (let i = 0; i < 10; i++) {
+   let shouldSkipRow = false
+   for (let j = 0; j < 10; j++) {
+     if (shouldSkip) {
+       shouldSkipRow = true
+       break
+     }
+     process(i, j)
+   }
+   if (shouldSkipRow) continue
+ }
```

### 5. Replace Labeled Switch with State Machine

```diff
- state: switch (currentState) {
-   case 'loading':
-     if (error) break state
-     break
-   case 'complete':
-     processResult()
-     break
- }
+ function handleState(): void {
+   switch (currentState) {
+     case 'loading':
+       if (error) {
+         return
+       }
+       currentState = 'complete'
+       handleState() // Recursive call to process next state
+       break
+     case 'complete':
+       processResult()
+       break
+   }
+ }
```

### 6. Replace Labeled Block with try/catch/finally

```diff
- cleanup: {
-   try {
-     doWork()
-   } catch (error) {
-     logError(error)
-     break cleanup
-   }
-   finalize()
- }
+ try {
+   doWork()
+ } catch (error) {
+   logError(error)
+   throw error
+ } finally {
+   finalize()
+ }
```

## Best Practices

### When Labeled Statements Might Be Acceptable

Labeled statements are occasionally acceptable in these scenarios:

1. **Breaking out of deeply nested loops**: When flag variables would make code more confusing
2. **Performance-critical code**: Where avoiding function calls provides measurable benefit
3. **Algorithm implementations**: When algorithms naturally use labeled control flow
4. **Legacy code**: When refactoring is not practical

Always document why labeled statements are necessary:

```typescript
/**
 * Search a sorted matrix for the target value.
 * Uses labeled break to optimize by skipping entire rows
 * when we know the value cannot be present (rows are sorted).
 */
function findInMatrix(matrix: number[][], target: number): boolean {
  outer: for (let i = 0; i < matrix.length; i++) {
    for (let j = 0; j < matrix[i].length; j++) {
      if (matrix[i][j] === target) {
        return true
      }
      if (matrix[i][j] > target) {
        break outer // Row is sorted, can skip rest
      }
    }
  }
  return false
}
```

### Prefer Higher-Level Abstractions

Instead of raw labeled statements, consider these approaches:

```typescript
// Use array methods instead of nested loops
const found = matrix.some((row) => row.some((item) => item.matches()))

// Use recursion for complex nested logic
function searchTree(node: Node): Node | null {
  if (node.matches()) {
    return node
  }
  for (const child of node.children) {
    const result = searchTree(child)
    if (result) {
      return result
    }
  }
  return null
}

// Use generators for iteration
function* iterateMatrix(matrix: number[][]): Generator<number> {
  for (const row of matrix) {
    for (const value of row) {
      yield value
    }
  }
}

for (const value of iterateMatrix(matrix)) {
  if (value === target) {
    break
  }
}
```

## Common Pitfalls

### Confusing Control Flow

```javascript
// ❌ Hard to follow: Multiple labels and breaks
outer: for (let i = 0; i < 10; i++) {
  middle: for (let j = 0; j < 10; j++) {
    if (condition1) break outer
    if (condition2) break middle
    if (condition3) continue outer
  }
}

// ✅ Clearer: Use functions or flag variables
function processMatrix(): void {
  for (let i = 0; i < 10; i++) {
    if (condition1) return
    for (let j = 0; j < 10; j++) {
      if (condition2) break
      if (condition3) continue
      process(i, j)
    }
  }
}
```

### Unused Labels

```javascript
// ❌ Label defined but never used
start: for (let i = 0; i < 10; i++) {
  console.log(i)
}

// ✅ Remove unused label
for (let i = 0; i < 10; i++) {
  console.log(i)
}
```

### Labels that Shadow Variables

```javascript
// ❌ Confusing: Label name matches variable name
loop: for (let loop = 0; loop < 10; loop++) {
  if (condition) break loop
  const loop = getValue() // Error: variable already declared
}

// ✅ Use different names
outer: for (let i = 0; i < 10; i++) {
  if (condition) break outer
  const value = getValue()
}
```

## Related Rules

- [no-loop-func](../patterns/no-loop-func.md) - Disallow functions in loops
- [no-return-await](../patterns/no-return-await.md) - Disallow unnecessary return await
- [prefer-const](../patterns/prefer-const.md) - Prefer const declarations

## Further Reading

- [MDN: Labeled Statements](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/label)
- [2ality: Labeled Breaks and Continues](http://2ality.com/2013/06/break-and-continue.html)
- [JavaScript.info: Break and Continue](https://javascript.info/while-for#break-continue)
- [Refactoring: Replace Nested Conditional with Guard Clauses](https://refactoring.gcatalog/replace-nested-conditional-with-guard-clauses/)

## Auto-Fix

This rule is not auto-fixable. Replacing labeled statements requires understanding the intended control flow and choosing the appropriate alternative pattern.

Use interactive mode to review violations:

```bash
codeforge analyze --rules no-labels
```
