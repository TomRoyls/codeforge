# no-unused-expressions

![Recommended](https://img.shields.io/badge/-recommended-blue)

| Property    | Value    |
| ----------- | -------- |
| Category    | patterns |
| Fixable     | No       |
| Recommended | Yes      |
| Deprecated  | No       |

## Description

Disallow unused expressions - statements that have no effect on program state. These are typically programming mistakes where developers intended to do something but wrote an expression that has no side effects.

## Why This Rule Matters

Unused expressions are problematic because:

- **Programming errors**: Often indicate a typo or misunderstanding
- **Dead code**: Code that has no effect wastes resources
- **Confusing**: Makes code harder to understand
- **Maintenance burden**: Future developers may waste time understanding useless code

### Common Mistakes

```javascript
// BAD: Comparison instead of assignment
x === 0 // Did you mean x = 0?

// BAD: Logical operators with no effect
a && b() // Did you mean if (a) b()?

// BAD: Arithmetic with no effect
x + 1 // Result is discarded

// BAD: String concatenation
'a' + 'b' // Result is discarded
```

## When Not To Use This Rule

You may want to disable this rule if:

1. You use short-circuit evaluation intentionally for side effects
2. You have a specific pattern that relies on expression evaluation
3. You're writing documentation or example code

## Configuration Options

This rule has no configuration options.

### Default Configuration

```json
{
  "rules": {
    "no-unused-expressions": "warn"
  }
}
```

## Examples

### Incorrect

```javascript
// Comparison that has no effect
x === 0

// Logical operators without side effects
a || b

// Arithmetic operations
x + y

// String operations
'hello' + ' world'

// Ternary with no side effects
condition
  ? a
  : b(
      // Sequence expressions (except the last one)
      a,
      b,
    )
```

### Correct

```javascript
// Assignment has side effects
x = 0

// Function calls have side effects
doSomething()

// Increment/decrement operators
x++

// Delete operator
delete obj.prop

// In conditionals
if (x === 0) {
  doSomething()
}

// As part of other statements
const result = x + y
console.log(a || b)
```

## Expressions with Side Effects

These expressions are allowed because they have side effects:

- **Assignment**: `=`, `+=`, `-=`, `*=`, `/=`, etc.
- **Update**: `++`, `--` (prefix and postfix)
- **Delete**: `delete obj.prop`
- **Function calls**: `fn()`, `obj.method()`
- **Constructor calls**: `new Class()`
- **Await**: `await promise`
- **Yield**: `yield value`

## Expressions Without Side Effects

These expressions are flagged when used as statements:

- **Comparisons**: `===`, `!==`, `<`, `>`, `<=`, `>=`
- **Arithmetic**: `+`, `-`, `*`, `/`, `%`, `**`
- **Logical**: `&&`, `||`, `??`
- **Bitwise**: `&`, `|`, `^`, `~`, `<<`, `>>`, `>>>`
- **String**: Template literals, concatenation
- **Identifiers**: Just variable names without assignment

## Best Practices

1. **Use if statements** for conditional logic
2. **Assign to variables** if you need the result
3. **Call functions** if you want side effects
4. **Remove dead code** entirely

## Related Rules

- [no-unused-vars](./no-unused-vars.md) - Disallow unused variables
- [no-sequences](./no-sequences.md) - Disallow comma operators
- [eqeqeq](./eqeqeq.md) - Require strict equality
