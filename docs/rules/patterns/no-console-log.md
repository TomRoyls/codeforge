# no-console-log

![Recommended](https://img.shields.io/badge/-recommended-blue)

| Property    | Value    |
| ----------- | -------- |
| Category    | patterns |
| Fixable     | Yes      |
| Recommended | Yes      |
| Deprecated  | No       |

## Description

Disallow console.log and similar console methods in production code. Use a proper logging library instead. Console methods are useful for debugging during development but should not be present in production builds where they can expose sensitive information and impact performance.

## Why This Rule Matters

Leaving console statements in production code causes issues:

- **Security risks**: Console methods can expose sensitive data to browser consoles
- **Performance impact**: Console calls add overhead even when the console is closed
- **Information leakage**: Debug logs may reveal internal implementation details
- **Inconsistent logging**: Ad-hoc console calls create inconsistent logging patterns
- **Browser differences**: Some browsers handle console methods differently in production

### Production Risks

```javascript
// SECURITY: Exposing user data
console.log('User token:', user.authToken)

// SECURITY: Revealing internal state
console.debug('Database connection:', db.connectionString)

// SECURITY: Logging sensitive business logic
console.info('Payment processed:', paymentDetails)
```

## Console Methods Detected

This rule detects the following console methods:

- `log` - General purpose logging
- `warn` - Warning messages
- `error` - Error messages
- `info` - Informational messages
- `debug` - Debug messages
- `trace` - Stack trace
- `table` - Tabular data display
- `dir` - Object inspection
- `time` - Timer start
- `timeEnd` - Timer end
- `group` - Start a message group
- `groupEnd` - End a message group
- `clear` - Clear the console
- `count` - Counter
- `countReset` - Reset counter
- `assert` - Assertion
- `profile` - Start profiling
- `profileEnd` - End profiling
- `timestamp` - Add timestamp

## Configuration Options

```json
{
  "rules": {
    "no-console-log": [
      "error",
      {
        "allow": ["warn", "error"]
      }
    ]
  }
}
```

| Option  | Type       | Default | Description                                                  |
| ------- | ---------- | ------- | ------------------------------------------------------------ |
| `allow` | `string[]` | `[]`    | List of console methods to allow (e.g., `["warn", "error"]`) |

### allow Option Usage

The `allow` option permits specific console methods for legitimate use cases like error handling or critical warnings.

```json
{
  "rules": {
    "no-console-log": [
      "error",
      {
        "allow": ["warn", "error"]
      }
    ]
  }
}
```

With this configuration, `console.warn()` and `console.error()` are allowed but other console methods are still detected.

## When to Use This Rule

**Use this rule when:**

- You want to ensure no debug statements ship to production
- You need consistent logging across your application
- You want to prevent accidental information leakage
- You're building applications with security requirements
- You use a proper logging library instead of console methods

**Consider disabling when:**

- You're building a development-only tool or utility
- You need console output for debugging in production
- Your application relies on console methods for user feedback

## Code Examples

### ❌ Incorrect - Using Console Methods

```typescript
// Development debug statement
console.log('User logged in:', user)

// Debug output
console.debug('API response:', data)

// Info message
console.info('Processing payment:', amount)

// Warning (unless allowed)
console.warn('Deprecated feature used:', feature)

// Error (unless allowed)
console.error('Failed to load:', error)
```

```typescript
// Timer usage
console.time('fetch')
// ...
console.timeEnd('fetch')

// Console table
console.table(users)

// Object inspection
console.dir(config)

// Stack trace
console.trace('Here we are')
```

```typescript
// Console groups
console.group('Processing...')
console.log('Step 1')
console.log('Step 2')
console.groupEnd()

// Assertions
console.assert(condition, 'Condition failed')
```

### ✅ Correct - Using a Logging Library

```typescript
import { logger } from './logger'

// Use proper logging instead
logger.info('User logged in:', user)

// Structured logging
logger.info('Payment processed', {
  userId: user.id,
  amount: payment.amount,
  currency: payment.currency,
})

// Error logging with context
logger.error('Failed to load data', {
  error: error.message,
  stack: error.stack,
  url: request.url,
})
```

```typescript
// Different log levels
logger.debug('Processing request', { requestId })
logger.info('User action completed', { action, userId })
logger.warn('Rate limit approaching', { current, limit })
logger.error('Database connection failed', { host, port, error })
```

### ✅ Correct - Using Allowed Console Methods

```json
// Configuration:
{
  "rules": {
    "no-console-log": [
      "error",
      {
        "allow": ["error"]
      }
    ]
  }
}
```

```typescript
// Only console.error is allowed
console.error('Critical error occurred:', error)

// This would still be flagged
console.log('Debug info:', data)

// This would still be flagged
console.warn('Warning message')
```

## How to Fix Violations

### 1. Replace console.log with Logger

```diff
- console.log('User logged in:', user)
+ logger.info('User logged in:', { userId: user.id, timestamp: Date.now() })
```

### 2. Replace console.error with Error Handler

```diff
- console.error('Failed to fetch:', error)
+ logger.error('Failed to fetch data', {
+   error: error.message,
+   stack: error.stack,
+   url: fetchUrl,
+ })
```

### 3. Replace console.warn with Warning Logger

```diff
- console.warn('Deprecated API used:', methodName)
+ logger.warn('Deprecated API call detected', {
+   method: methodName,
+   alternative: 'newMethod',
+ })
```

### 4. Replace console.debug with Debug Logger

```diff
- console.debug('Processing request:', request)
+ logger.debug('Request processing', {
+   id: request.id,
+   method: request.method,
+   path: request.path,
+ })
```

### 5. Remove Debug Statements Entirely

```diff
- console.time('operation')
- // operation code
- console.timeEnd('operation')
```

```diff
- console.table(data)
+ // Use proper data visualization instead
+ renderDataTable(data)
```

### 6. Replace console.assert with Proper Validation

```diff
- console.assert(condition, 'Condition failed')
+ if (!condition) {
+   throw new Error('Condition failed')
+ }
```

## Best Practices

### Structured Logging

Use structured logging with consistent fields:

```typescript
// Good: Structured logging
logger.info('User action', {
  event: 'click',
  userId: user.id,
  button: 'submit',
  timestamp: Date.now(),
  page: '/checkout',
})

logger.error('Payment failed', {
  userId: user.id,
  amount: payment.amount,
  error: error.message,
  gateway: payment.gateway,
  attempt: 1,
})
```

### Log Levels

Use appropriate log levels:

```typescript
// DEBUG: Detailed information for diagnostics
logger.debug('Cache state', { keys: cache.keys(), size: cache.size })

// INFO: General informational messages
logger.info('User signed up', { userId: user.id, email: user.email })

// WARN: Warning situations that might need attention
logger.warn('Response time above threshold', { duration: 2500, threshold: 2000 })

// ERROR: Error events that might still allow the application to continue
logger.error('Database query failed', { query, error: error.message })

// FATAL: Very severe error events that will presumably lead to application abort
logger.fatal('Cannot connect to database', { host, port, error })
```

### Logging in Different Environments

Configure logging based on environment:

```typescript
const logger = createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  transports: [
    new transports.Console({
      format: format.combine(format.timestamp(), format.json()),
    }),
    new transports.File({ filename: 'combined.log' }),
    new transports.File({ filename: 'error.log', level: 'error' }),
  ],
})
```

### Remove Console Statements in Build Process

Remove console statements from production builds:

```javascript
// webpack.config.js
const TerserPlugin = require('terser-webpack-plugin')

module.exports = {
  optimization: {
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: true,
          },
        },
      }),
    ],
  },
}
```

```javascript
// vite.config.ts
import { defineConfig } from 'vite'
import esbuild from 'rollup-plugin-esbuild'

export default defineConfig({
  esbuild: {
    drop: isProduction ? ['console', 'debugger'] : [],
  },
})
```

## Common Pitfalls

### Logging Sensitive Data

```typescript
// ❌ Exposing sensitive data
console.log('User:', user)
console.log('Payment:', creditCard)

// ✅ Sanitize or exclude sensitive fields
logger.info('User action', {
  userId: user.id,
  action: 'checkout',
  // Don't log: password, token, credit card number
})
```

### Excessive Logging

```typescript
// ❌ Logging inside loops
for (const item of items) {
  console.log('Processing:', item)
}

// ✅ Log summary
logger.info('Processing batch', { count: items.length })
```

### Logging Without Context

```typescript
// ❌ Insufficient context
console.log('Error occurred')
console.error(error)

// ✅ Include relevant context
logger.error('Database connection failed', {
  error: error.message,
  host: dbConfig.host,
  port: dbConfig.port,
  database: dbConfig.name,
  retries: 3,
})
```

### Using Console for Business Logic

```typescript
// ❌ Using console for flow control
console.log('Step 1 complete')
doStep1()
console.log('Step 2 complete')
doStep2()

// ✅ Use proper control flow and logging
try {
  doStep1()
  logger.debug('Step 1 completed')
  doStep2()
  logger.debug('Step 2 completed')
} catch (error) {
  logger.error('Processing failed', { step: currentStep, error })
}
```

## Related Rules

- [no-alert](../security/no-alert.md) - Disallow use of alert()
- [no-debugger](../patterns/no-debugger.md) - Disallow use of debugger
- [no-eval](../security/no-eval.md) - Disallow use of eval()

## Further Reading

- [MDN: Console object](https://developer.mozilla.org/en-US/docs/Web/API/console)
- [Winston Logging Library](https://github.com/winstonjs/winston)
- [Pino Logging Library](https://github.com/pinojs/pino)
- [Console API Best Practices](https://alistapart.com/article/improving-debugging-in-javascript-with-console-and-friends/)

## Auto-Fix

This rule is auto-fixable. The fix removes the console statement entirely.

Apply auto-fix:

```bash
codeforge analyze --rules no-console-log --fix
```

Alternatively, use the fix command:

```bash
codeforge fix --rules no-console-log
```

**Note**: Auto-fix removes console statements without replacement. Review changes carefully and ensure proper logging is implemented.
