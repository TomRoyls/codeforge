# prefer-arrow-callback

![Recommended](https://img.shields.io/badge/-recommended-blue)

| Property    | Value    |
| ----------- | -------- |
| Category    | patterns |
| Fixable     | No       |
| Recommended | Yes      |
| Deprecated  | No       |

## Description

Prefer arrow functions over regular function expressions for callbacks. Arrow functions provide a more concise syntax and lexically bind `this`, making them safer to use in callbacks.

## Why This Rule Matters

Using arrow functions for callbacks is beneficial because:

- **Concise syntax**: Arrow functions are shorter and more readable
- **Lexical `this`**: Arrow functions inherit `this` from the enclosing scope, avoiding common pitfalls
- **Consistency**: Using arrow functions consistently improves code readability
- **Modern best practice**: Arrow functions are the preferred way to write callbacks in modern JavaScript/TypeScript

### Lexical `this` Benefits

```javascript
// BAD: Regular function loses `this` context
class Counter {
  constructor() {
    this.count = 0
  }

  start() {
    setInterval(function () {
      this.count++ // ERROR: `this` is undefined!
      console.log(this.count)
    }, 1000)
  }
}

// GOOD: Arrow function preserves `this` context
class Counter {
  constructor() {
    this.count = 0
  }

  start() {
    setInterval(() => {
      this.count++ // Works! `this` refers to the Counter instance
      console.log(this.count)
    }, 1000)
  }
}
```

## When Not To Use This Rule

You may want to disable this rule if:

1. You need `arguments` object (arrow functions don't have it)
2. You need a dynamic `this` context
3. You're using `new` keyword (arrow functions can't be constructors)
4. You need method definitions in object literals (use shorthand methods instead)

## Configuration Options

This rule has no configuration options.

### Default Configuration

```json
{
  "rules": {
    "prefer-arrow-callback": "warn"
  }
}
```

## Examples

### Incorrect

```javascript
// Regular function expression as callback
array.map(function (x) {
  return x * 2
})

// Regular function with explicit return
array.filter(function (x) {
  if (x > 0) {
    return true
  }
  return false
})

// Regular function in setTimeout
setTimeout(function () {
  console.log('done')
}, 1000)

// Regular function in event handler
element.addEventListener('click', function (event) {
  event.preventDefault()
})
```

### Correct

```javascript
// Arrow function as callback
array.map((x) => x * 2)

// Arrow function with implicit return
array.filter((x) => x > 0)

// Arrow function in setTimeout
setTimeout(() => {
  console.log('done')
}, 1000)

// Arrow function in event handler
element.addEventListener('click', (event) => {
  event.preventDefault()
})
```

## Best Practices

1. **Use implicit returns** when the function body is a single expression
2. **Parenthesize parameters** when you have multiple parameters or no parameters
3. **Use block syntax** when you need multiple statements or explicit return
4. **Be consistent** - use arrow functions for all callbacks in a file

## Related Rules

- [prefer-const](./prefer-const.md) - Prefer `const` over `let` for variables that are never reassigned
- [no-var](./no-var.md) - Disallow the use of `var` declarations
- [func-style](./func-style.md) - Enforce consistent function style
