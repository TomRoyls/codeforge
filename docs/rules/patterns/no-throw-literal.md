# no-throw-literal

![Recommended](https://img.shields.io/badge/-recommended-blue)

| Property    | Value    |
| ----------- | -------- |
| Category    | patterns |
| Fixable     | No       |
| Recommended | Yes      |
| Deprecated  | No       |

## Description

Disallow throwing literals or non-Error objects. Only Error objects and subclasses should be thrown for proper stack traces and error handling. Throwing literals like strings, numbers, or plain objects loses stack trace information and makes debugging difficult.

## Why This Rule Matters

Throwing literals instead of Error objects creates several debugging problems:

- **Lost stack traces**: Literals don't capture where the error occurred, making it nearly impossible to debug
- **Inconsistent error handling**: Error handlers expect Error objects with specific properties like `message`, `stack`, and `name`
- **Broken tooling**: Debuggers, logging systems, and error monitoring tools depend on Error objects
- **Type safety issues**: TypeScript cannot properly type-check thrown literals
- **Poor error propagation**: Error boundaries and catch blocks cannot properly categorize or handle errors

### Debugging Nightmare

```javascript
// ❌ Throwing a string - NO STACK TRACE!
throw 'Invalid configuration'

// When this crashes, you have NO idea where it came from:
// Error: Invalid configuration
//     at eval (eval at <anonymous> (unknown))
//     at Object.<anonymous> (unknown)

// ❌ Throwing a number - meaningless error
throw 404

// ❌ Throwing an object - still no stack trace
throw { code: 'ERR_INVALID', message: 'Something went wrong' }
```

### The Stack Trace Problem

When you throw a literal, JavaScript wraps it but doesn't capture the original stack:

```javascript
// ✅ Proper Error with full stack trace
throw new Error('Invalid configuration')

// Result:
// Error: Invalid configuration
//     at validateConfig (config.js:15:11)
//     at initialize (index.js:42:5)
//     at processTicksAndRejections (internal/process/task_queues.js:95:5)
```

## Invalid Throw Types

This rule detects and prevents throwing these literal types:

- `StringLiteral` - e.g., `'error message'`
- `NumericLiteral` - e.g., `404`, `500`
- `BooleanLiteral` - e.g., `false`, `true`
- `NullLiteral` - e.g., `null`
- `BigIntLiteral` - e.g., `100n`
- `RegExpLiteral` - e.g., `/error/`
- `TemplateLiteral` - e.g., `` `Error: ${msg}` ``
- `ObjectExpression` - e.g., `{ code: 400 }`
- `ArrayExpression` - e.g., `['error']`
- `ThisExpression` - e.g., `this`

## Valid Throw Types

These throw types are allowed as they can evaluate to Error objects:

- `NewExpression` - e.g., `new Error()`, `new CustomError()`
- `Identifier` - e.g., `throw err` (where `err` is an Error object)
- `CallExpression` - e.g., `throw createError()`
- `MemberExpression` - e.g., `throw this.error`
- `ConditionalExpression` - e.g., `throw condition ? err1 : err2`
- `LogicalExpression` - e.g., `throw err || new Error()`
- `BinaryExpression` - e.g., (allowed if evaluates to Error)

## When to Use This Rule

**Use this rule when:**

- You need reliable error debugging with stack traces
- You use error monitoring tools (Sentry, Rollbar, etc.)
- You want proper TypeScript error handling
- You care about developer experience and maintainability
- You use error boundaries or global error handlers

**Never disable this rule because:**

- There is no valid reason to throw literals in production code
- The convenience of throwing literals is not worth the debugging pain
- Error objects are the standard JavaScript error handling mechanism
- All modern JavaScript tooling expects Error objects

## Code Examples

### ❌ Incorrect - Throwing Literals

```typescript
// Throwing a string literal - loses stack trace!
throw 'Invalid input'

// Throwing a template literal - same problem
throw `Error: ${errorMessage}`

// Throwing a number - meaningless
throw 404

// Throwing a boolean - confusing
throw false

// Throwing null - unhelpful
throw null

// Throwing a plain object - no stack trace
throw { message: 'Something went wrong', code: 500 }

// Throwing an array - bizarre
throw ['error', 'occurred']
```

### ✅ Correct - Throwing Error Objects

```typescript
// Throw Error with message and stack trace
throw new Error('Invalid input')

// Throw with interpolated message - still an Error
throw new Error(`Error: ${errorMessage}`)

// Throw custom error class
throw new ValidationError('Invalid input')

// Throw pre-created error object
throw this.error

// Throw error from factory function
throw createError('Something went wrong')

// Conditional error throwing
throw condition ? new Error('Condition failed') : new Error('Unknown error')

// Fallback to Error if error is undefined
throw error || new Error('Unknown error')
```

```typescript
// Create custom error classes for better error handling
class ValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

class NetworkError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(message)
    this.name = 'NetworkError'
  }
}

// Use custom errors for specific scenarios
throw new ValidationError('Email is required')
throw new NetworkError('Service unavailable', 503)
```

```typescript
// Error factory function
function createError(code: string, details?: unknown): Error {
  const error = new Error(`Error code: ${code}`)
  error.name = 'CustomError'
  ;(error as any).code = code
  ;(error as any).details = details
  return error
}

throw createError('VALIDATION_FAILED', { field: 'email' })
```

### ✅ Correct - Error Object Variables

```typescript
// Throwing an Error object from a variable
const error = new Error('Something went wrong')
throw error

// Throwing an error passed as parameter
function handleError(error: Error) {
  throw error
}

// Throwing an error from a catch block
try {
  riskyOperation()
} catch (e) {
  // Re-throwing the error preserves stack trace
  throw e
}
```

## How to Fix Violations

### 1. Replace String Literal with Error

```diff
- throw 'Invalid input'
+ throw new Error('Invalid input')
```

### 2. Replace Template Literal with Error

```diff
- throw `Error: ${errorMessage}`
+ throw new Error(`Error: ${errorMessage}`)
```

### 3. Replace Number with Error

```diff
- throw 404
+ throw new NotFoundError('Resource not found')
```

### 4. Replace Plain Object with Error Class

```diff
- throw { code: 'VALIDATION_ERROR', message: 'Invalid email' }
+ throw new ValidationError('Invalid email')
```

### 5. Replace Boolean with Error

```diff
- throw false
+ throw new Error('Operation failed')
```

### 6. Replace Null with Error

```diff
- throw null
+ throw new Error('Unexpected null value')
```

### 7. Create Custom Error Classes

```diff
- throw { type: 'ValidationError', field: 'email' }
+ class ValidationError extends Error {
+   constructor(message: string, public field: string) {
+     super(message)
+     this.name = 'ValidationError'
+   }
+ }
+ throw new ValidationError('Invalid email', 'email')
```

### 8. Replace ThisExpression with Error

```diff
- throw this
+ throw new Error('Invalid state')
```

## Best Practices

### Always Throw Error Objects

Never throw anything that isn't an Error object or subclass:

```typescript
// ✅ Always do this
throw new Error('Something went wrong')

// ❌ Never do this
throw 'Something went wrong'
throw { message: 'Something went wrong' }
throw 500
```

### Create Custom Error Classes

For better error handling, create custom error classes:

```typescript
// Base custom error class
class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 500,
  ) {
    super(message)
    this.name = 'AppError'
  }
}

// Specific error types
class ValidationError extends AppError {
  constructor(
    message: string,
    public readonly field?: string,
  ) {
    super(message, 'VALIDATION_ERROR', 400)
    this.name = 'ValidationError'
  }
}

class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 'NOT_FOUND', 404)
    this.name = 'NotFoundError'
  }
}

// Usage
throw new ValidationError('Email is required', 'email')
throw new NotFoundError('User')
```

### Include Context in Errors

Add relevant information to your errors:

```typescript
class DatabaseError extends Error {
  constructor(
    message: string,
    public readonly query: string,
    public readonly params?: unknown[],
  ) {
    super(message)
    this.name = 'DatabaseError'
  }
}

throw new DatabaseError('Failed to insert user', query, params)
```

### Preserve Stack Traces

When re-throwing errors, preserve the original stack trace:

```typescript
try {
  await fetchUser(id)
} catch (error) {
  // ✅ Good: re-throw preserves stack trace
  throw error

  // ✅ Good: wrap with new error but preserve cause
  throw new Error(`Failed to fetch user ${id}`, { cause: error })

  // ❌ Bad: loses original stack trace
  throw new Error(`Failed: ${error.message}`)
}
```

### Use Error Codes

Add error codes for programmatic error handling:

```typescript
class ApiError extends Error {
  constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// In error handler
if (error instanceof ApiError) {
  if (error.code === 'RATE_LIMIT_EXCEEDED') {
    // Handle rate limiting
  }
}
```

## Common Pitfalls

### Losing Stack Trace on Re-throw

```javascript
// ❌ Bad: loses original stack trace
try {
  riskyOperation()
} catch (error) {
  throw new Error(`Operation failed: ${error.message}`)
}

// ✅ Good: preserves stack trace
try {
  riskyOperation()
} catch (error) {
  throw error
}

// ✅ Good: wraps error with new Error using cause
try {
  riskyOperation()
} catch (error) {
  throw new Error('Operation failed', { cause: error })
}
```

### Throwing Non-Error Expressions

```javascript
// ❌ Bad: this might evaluate to a literal
throw errorMessage

// ✅ Good: explicitly create Error
throw new Error(errorMessage || 'Unknown error')
```

### Using Throw for Control Flow

```javascript
// ❌ Bad: using throw for normal control flow
try {
  if (shouldContinue) {
    throw 'continue'
  }
  // normal code
} catch (e) {
  if (e === 'continue') {
    // handle continue
  }
}

// ✅ Good: use proper control flow
if (shouldContinue) {
  // handle continue
} else {
  // normal code
}
```

## Related Rules

- [no-throw-callback](../patterns/no-throw-callback.md) - Disallow throwing errors in callback functions
- [prefer-promise-reject-errors](../patterns/prefer-promise-reject-errors.md) - Reject promises with Error objects
- [no-empty-catch](../patterns/no-empty-catch.md) - Disallow empty catch blocks

## Further Reading

- [MDN: Error](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error)
- [Throwing Errors in JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/throw)
- [Custom Error Classes in TypeScript](https://dev.to/bjornsundin/custom-error-classes-in-typescript-3j99)
- [Error Handling Best Practices](https://www.joyent.com/node-js/production/design/errors)

## Auto-Fix

This rule is not auto-fixable. Converting literals to Error objects requires understanding the intended error type and message.

Use interactive mode to review violations:

```bash
codeforge analyze --rules no-throw-literal
```
