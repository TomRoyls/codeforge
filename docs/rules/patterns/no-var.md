# no-var

![Recommended](https://img.shields.io/badge/-recommended-blue)

| Property    | Value    |
| ----------- | -------- |
| Category    | patterns |
| Fixable     | No       |
| Recommended | Yes      |
| Deprecated  | No       |

## Description

Disallow the use of `var` declarations. Use `let` or `const` instead.

## Why This Rule Matters

Using `var` is problematic because:

- **Function-scoped**: `var` declarations are function-scoped, not block-scoped, leading to unexpected behavior
- **Hoisting**: `var` declarations are hoisted to the top of their scope, which can cause confusion
- **Re-declaration**: `var` allows re-declaration of variables in the same scope, which can mask bugs
- **No TDZ**: `var` has no Temporal Dead Zone, allowing access before declaration

### Block Scope vs Function Scope

```javascript
// BAD: var is function-scoped
function example() {
  if (true) {
    var x = 1
  }
  console.log(x) // 1 - x leaks outside the block!
}

// GOOD: let/const are block-scoped
function example() {
  if (true) {
    const x = 1
  }
  console.log(x) // ReferenceError: x is not defined
}
```

### Hoisting Issues

```javascript
// BAD: var is hoisted
console.log(x) // undefined (not an error!)
var x = 1

// GOOD: const/let have Temporal Dead Zone
console.log(y) // ReferenceError: Cannot access 'y' before initialization
const y = 1
```

### Re-declaration Problems

```javascript
// BAD: var allows re-declaration
var name = 'Alice'
var name = 'Bob' // No error, silently overwrites!

// GOOD: const/let prevent re-declaration
let name = 'Alice'
let name = 'Bob' // SyntaxError: Identifier 'name' has already been declared
```

## When Not To Use This Rule

If you need to maintain compatibility with very old JavaScript environments that don't support `let` and `const` (ES5 and below), you may need to disable this rule. However, most modern build tools can transpile `let` and `const` to `var` automatically.

## Configuration Options

This rule has no configuration options.

### Default Configuration

```json
{
  "rules": {
    "no-var": "error"
  }
}
```

## Examples

### Incorrect

```javascript
var x = 1
var y = 2,
  z = 3
var foo = 'bar'
```

### Correct

```javascript
let x = 1
const y = 2,
  z = 3
const foo = 'bar'
```

## Best Practices

1. **Prefer `const` by default**: Use `const` for variables that don't get reassigned
2. **Use `let` only when needed**: Use `let` only when you need to reassign the variable
3. **Never use `var`**: Modern JavaScript provides better alternatives

## Migration Guide

To migrate existing code:

1. Replace `var` with `const` for variables that are never reassigned
2. Replace `var` with `let` for variables that are reassigned
3. Check for any code that relies on `var` hoisting or function-scoping behavior

## Related Rules

- [prefer-const](./prefer-const.md) - Prefer `const` over `let` for variables that are never reassigned
- [no-use-before-define](./no-use-before-define.md) - Disallow use of variables before they are defined
