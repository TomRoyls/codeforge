# no-sequences

![Recommended](https://img.shields.io/badge/-recommended-blue)

| Property    | Value    |
| ----------- | -------- |
| Category    | patterns |
| Fixable     | No       |
| Recommended | Yes      |
| Deprecated  | No       |

## Description

Disallow comma operators (`,`) in expressions. The comma operator evaluates multiple expressions and returns the result of the last one, which is often confusing and error-prone. In most cases, comma operators indicate unintended behavior, poor code readability, or missing semicolons.

## Why This Rule Matters

Using comma operators incorrectly is dangerous because:

- **Unintended behavior**: The comma operator returns only the last expression, which can lead to unexpected results
- **Silent bugs**: Typos like missing semicolons or misplaced commas can execute code incorrectly
- **Confusing precedence**: Comma operator has low precedence but behaves differently in different contexts
- **Readability issues**: Comma operators make code harder to understand and maintain
- **Misleading intent**: Developers often confuse comma operators with array or parameter commas

### Common Typos

```javascript
// TYPO: Missing semicolon - comma operator used instead
function processData(data) {
  processStep1(data)
  processStep2(data)  // This is a comma operator!
  return result
}

// TYPO: Misplaced comma in variable declaration
const x = 1, y = 2, z = function() { return 3 }, console.log('executed')  // function called immediately!

// TYPO: Comma operator in return statement
return validateInput(), processData(input), result  // Only 'result' is returned
```

## Comma Operators Detected

This rule detects the comma operator used as an expression (not in contexts where it's valid):

- `,` - Comma operator in expressions
- Comma operator in `return` statements
- Comma operator in variable initializers
- Comma operator in `if` conditions
- Comma operator in `for` loop headers (except in initialization/update parts)
- Comma operator in function call arguments
- Comma operator in array literals (multiple expressions without brackets)

**Note:** This rule does not flag:

- Parameter lists: `function foo(a, b, c) {}`
- Array literals: `[1, 2, 3]`
- Object literals: `{a: 1, b: 2}`
- Variable declarations: `const a = 1, b = 2;`
- For loop initialization/update: `for (let i = 0, j = 0; i < 10; i++, j++)`

## Configuration Options

```json
{
  "rules": {
    "no-sequences": [
      "error",
      {
        "allowInParentheses": false,
        "allowInForLoopInitialization": false,
        "allowInForLoopUpdate": false
      }
    ]
  }
}
```

| Option                         | Type      | Default | Description                                                                  |
| ------------------------------ | --------- | ------- | ---------------------------------------------------------------------------- |
| `allowInParentheses`           | `boolean` | `false` | Allow comma operators when wrapped in parentheses                            |
| `allowInForLoopInitialization` | `boolean` | `false` | Allow comma operators in for loop initialization (always allowed by default) |
| `allowInForLoopUpdate`         | `boolean` | `false` | Allow comma operators in for loop update (always allowed by default)         |

### Configuration Examples

**Default configuration (recommended):**

```json
{
  "rules": {
    "no-sequences": "error"
  }
}
```

**Allow comma operators in parentheses (for expressions like `(i++, j++)`):**

```json
{
  "rules": {
    "no-sequences": [
      "error",
      {
        "allowInParentheses": true
      }
    ]
  }
}
```

## When to Use This Rule

**Use this rule when:**

- You want to catch missing semicolons that create comma operators
- Your codebase doesn't require comma operator expressions
- You prioritize code readability and maintainability
- You work in a team where comma operator confusion could introduce bugs

**Consider disabling when:**

- Your codebase has legitimate use cases for comma operators (rare)
- You're maintaining legacy code that relies on comma operator behavior
- You specifically use comma operators for loop counter updates in parentheses

## Code Examples

### ❌ Incorrect - Using Comma Operators

```typescript
// TYPO: Missing semicolon - creates comma operator
function processData(data) {
  processStep1(data)
  processStep2(data)
  return result
}
```

```typescript
// Comma operator in return statement
function getValue() {
  return (doSideEffect(), getValue())
}
```

```typescript
// Comma operator in if condition
if ((validate(), isValid)) {
  // validate() is called but its result is ignored
}
```

```typescript
// Misplaced comma in variable declaration
const x = 1,
  y = 2,
  z = function () {
    console.log('executed')
  }
// The function is called immediately!
```

```typescript
// Comma operator in array literal (unintended)
const values = [1, 2, 3, doSomething(), 5]
// If doSomething() returns undefined, array contains [1, 2, 3, undefined, 5]
```

```typescript
// Comma operator in function call
;(someFunc(a, b, c, d), anotherFunc(e, f))
// anotherFunc() is called but its result is discarded
```

### ✅ Correct - Proper Code Structure

```typescript
// Use semicolons to separate statements
function processData(data) {
  processStep1(data)
  processStep2(data)
  return result
}
```

```typescript
// Return only one expression
function getValue() {
  doSideEffect()
  return getValue()
}
```

```typescript
// Separate statements properly
validate()
if (isValid) {
  // Process valid input
}
```

```typescript
// Use proper variable declarations
const x = 1
const y = 2
const z = function () {
  console.log('executed')
}
```

```typescript
// Use proper array syntax or explicit calls
const values = [1, 2, 3, doSomething(), 5]
// Or if you want to capture the side effect:
doSomething()
const values = [1, 2, 3, 4, 5]
```

```typescript
// Call functions separately
someFunc(a, b, c, d)
anotherFunc(e, f)
```

### ✅ Correct - For Loop (Always Allowed)

```typescript
// Comma operators in for loops are always allowed
for (let i = 0, j = 0; i < 10; i++, j++) {
  // Process with both counters
}

// Even with multiple variables
for (let i = 0, j = arr.length - 1; i < j; i++, j--) {
  // Two-pointer algorithm
}
```

### ✅ Correct - Valid Comma Usage (Not Sequences)

```typescript
// Parameter lists (always allowed)
function foo(a, b, c) {
  return a + b + c
}

// Array literals (always allowed)
const arr = [1, 2, 3, 4, 5]

// Object literals (always allowed)
const obj = { a: 1, b: 2, c: 3 }

// Multiple variable declarations (always allowed)
const x = 1,
  y = 2,
  z = 3

// Destructuring (always allowed)
const [a, b, c] = array
const { x, y, z } = object
```

## How to Fix Violations

### 1. Add Missing Semicolons

```diff
- function processData(data) {
-   processStep1(data)
-   processStep2(data)
-   return result
- }
+ function processData(data) {
+   processStep1(data);
+   processStep2(data);
+   return result;
+ }
```

### 2. Split Comma Operators into Separate Statements

```diff
- function getValue() {
-   return doSideEffect(), getValue()
- }
+ function getValue() {
+   doSideEffect();
+   return getValue();
+ }
```

### 3. Separate Function Calls

```diff
- someFunc(a, b, c, d), anotherFunc(e, f)
+ someFunc(a, b, c, d);
+ anotherFunc(e, f);
```

### 4. Fix If Conditions

```diff
- if (validate(), isValid) {
+ validate();
+ if (isValid) {
    // Code here
  }
```

### 5. Fix Variable Declarations

```diff
- const x = 1, y = 2, z = function() { console.log('executed') }
+ const x = 1;
+ const y = 2;
+ const z = function() { console.log('executed') };
```

### 6. Fix Array Literals with Side Effects

```diff
- const values = [1, 2, 3, doSomething(), 5]
+ doSomething();
+ const values = [1, 2, 3, 4, 5];
```

## Best Practices

### When Comma Operators Are Acceptable

Comma operators are acceptable only in these scenarios:

1. **For loop updates**: `for (let i = 0, j = 0; i < 10; i++, j++)`
2. **Intentional side effects**: Rare cases where you want to execute multiple expressions and use the last result
3. **IIFEs with minimal syntax**: `(a = 1, b = 2, a + b)` (but this is still discouraged)

Even in these cases, prefer explicit statements for clarity.

### Prefer Explicit Statements

Instead of comma operators, always use separate statements:

```typescript
// ❌ Avoid comma operators
function process() {
  return (step1(), step2(), step3())
}

// ✅ Use separate statements
function process() {
  step1()
  step2()
  return step3()
}
```

### Use Proper Loops

```typescript
// ❌ Avoid comma operator outside for loop header
let i = 0,
  j = 0
;(i++, j++)

// ✅ Use proper statements
let i = 0
let j = 0
i++
j++
```

## Common Pitfalls

### Missing Semicolons

```javascript
// ❌ Dangerous: Comma operator created by missing semicolon
const result = doSomething()
console.log('done')

// ✅ Add semicolon
const result = doSomething()
console.log('done')
```

### Unintended Immediate Execution

```javascript
// ❌ Dangerous: Function called immediately
const handler = function() { console.log('handler') }, console.log('initialized')

// ✅ Proper separation
const handler = function() { console.log('handler') };
console.log('initialized');
```

### Confusing Return Values

```javascript
// ❌ Confusing: Only last value is returned
return (logStep1(), logStep2(), calculateResult())

// ✅ Clear: Separate logging from return
logStep1()
logStep2()
return calculateResult()
```

### Conditional Logic with Side Effects

```javascript
// ❌ Confusing: Side effect in condition
if ((prepareData(), isValid)) {
  process()
}

// ✅ Clear: Separate preparation from condition
prepareData()
if (isValid) {
  process()
}
```

## Related Rules

- [no-multi-spaces](../style/no-multi-spaces.md) - Disallow multiple spaces
- [no-sequences](../patterns/no-sequences.md) - Disallow comma operators
- [semi](../style/semi.md) - Require or disallow semicolons
- [no-unused-expressions](../patterns/no-unused-expressions.md) - Disallow unused expressions

## Further Reading

- [MDN: Comma Operator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Comma_operator)
- [Understanding JavaScript's Comma Operator](https://www.sitepoint.com/the-comma-operator/)
- [JavaScript Operator Precedence](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Operator_precedence)

## Auto-Fix

This rule is not auto-fixable. Fixing comma operators requires understanding the intended logic and proper statement separation.

Use interactive mode to review violations:

```bash
codeforge analyze --rules no-sequences
```
