# no-thenable

![Recommended](https://img.shields.io/badge/-recommended-blue)

| Property    | Value    |
| ----------- | -------- |
| Category    | patterns |
| Fixable     | No       |
| Recommended | Yes      |
| Deprecated  | No       |

## Description

Disallow use of the `.then()` method. Prefer async/await syntax for better readability and error handling. The `.then()` method is a callback-based pattern for handling promises, while async/await provides a more synchronous-looking approach that is easier to read and maintain.

## Why This Rule Matters

Using `.then()` instead of async/await is problematic because:

- **Callback hell**: Chaining multiple `.then()` calls creates deep nesting and hard-to-read code
- **Error handling**: Adding `.catch()` at the end makes it harder to handle errors in the right scope
- **Variable scope**: Variables defined in one `.then()` callback are not available in subsequent callbacks
- **Debugging difficulty**: Stack traces are harder to follow with chained promises
- **Less readable**: Code flows less naturally compared to synchronous-looking async/await

### Common Issues with .then()

```javascript
// HARD TO READ: Deep nesting
fetchUser(id).then((user) => {
  return fetchPosts(user.id).then((posts) => {
    return fetchComments(posts.map((p) => p.id)).then((comments) => {
      return { user, posts, comments }
    })
  })
})

// ERROR HANDLING: Errors are handled at the end
fetchUser(id)
  .then((user) => {
    processUser(user)
  })
  .catch((error) => {
    // Hard to know which operation failed
    handleError(error)
  })

// VARIABLE SCOPE: user and posts are not available here
fetchUser(id)
  .then((user) => {
    return fetchPosts(user.id)
  })
  .then((posts) => {
    // user is out of scope here!
  })
```

## Patterns Detected

This rule detects the following pattern:

- `.then()` - Promise `.then()` method calls

## Configuration Options

```json
{
  "rules": {
    "no-thenable": "error"
  }
}
```

This rule does not accept any configuration options.

## When to Use This Rule

**Use this rule when:**

- You want to enforce modern async/await syntax across your codebase
- You prioritize code readability and maintainability
- You work in a team where async/await is the preferred pattern
- You want to avoid callback hell and promise chaining complexity

**Consider disabling when:**

- You are maintaining legacy code that extensively uses `.then()`
- You are working with third-party libraries that require callback-based APIs
- You need to support very old JavaScript environments that don't support async/await

## Code Examples

### ❌ Incorrect - Using .then()

```typescript
// Basic .then() usage
fetchUser(id).then((user) => {
  console.log(user)
})

// Chained .then() calls
fetchUser(id)
  .then((user) => {
    return fetchPosts(user.id)
  })
  .then((posts) => {
    console.log(posts)
  })
  .catch((error) => {
    console.error(error)
  })
```

```typescript
// Multiple .then() callbacks
doSomething()
  .then((result1) => {
    console.log(result1)
    return doSomethingElse()
  })
  .then((result2) => {
    console.log(result2)
  })
  .then((result3) => {
    console.log(result3)
  })
```

```typescript
// .then() with error handling
fetchData()
  .then((data) => {
    processData(data)
  })
  .catch((error) => {
    handleError(error)
  })
```

### ✅ Correct - Using async/await

```typescript
// Use async/await for better readability
async function getUser(id: string) {
  const user = await fetchUser(id)
  console.log(user)
}
```

```typescript
// Sequential operations are much clearer
async function getUserPosts(id: string) {
  try {
    const user = await fetchUser(id)
    const posts = await fetchPosts(user.id)
    console.log(posts)
  } catch (error) {
    console.error(error)
  }
}
```

```typescript
// Multiple sequential operations
async function runSequence() {
  const result1 = await doSomething()
  console.log(result1)

  const result2 = await doSomethingElse()
  console.log(result2)

  const result3 = await doAnotherThing()
  console.log(result3)
}
```

### ✅ Correct - Using async/await with Error Handling

```typescript
// Error handling is clearer with try/catch
async function fetchAndProcessData() {
  try {
    const data = await fetchData()
    processData(data)
  } catch (error) {
    handleError(error)
  }
}
```

```typescript
// Handle different error types specifically
async function fetchWithSpecificErrorHandling() {
  try {
    const data = await fetchData()
    processData(data)
  } catch (error) {
    if (error instanceof NetworkError) {
      handleNetworkError(error)
    } else if (error instanceof ValidationError) {
      handleValidationError(error)
    } else {
      handleUnknownError(error)
    }
  }
}
```

### ✅ Correct - Parallel Operations

```typescript
// Use Promise.all() with async/await for parallel operations
async function fetchUserData(id: string) {
  const [user, posts, comments] = await Promise.all([
    fetchUser(id),
    fetchPosts(id),
    fetchComments(id),
  ])

  return { user, posts, comments }
}
```

```typescript
// Promise.allSettled() for partial success handling
async function fetchMultipleItems(ids: string[]) {
  const results = await Promise.allSettled(ids.map((id) => fetchItem(id)))

  return results
}
```

## How to Fix Violations

### 1. Convert .then() to async/await

```diff
- fetchUser(id).then(user => {
-   console.log(user)
- })
+ async function getUser(id: string) {
+   const user = await fetchUser(id)
+   console.log(user)
+ }
```

### 2. Convert Chained .then() to Sequential await

```diff
- fetchUser(id)
-   .then(user => {
-     return fetchPosts(user.id)
-   })
-   .then(posts => {
-     console.log(posts)
-   })
+ async function getUserPosts(id: string) {
+   const user = await fetchUser(id)
+   const posts = await fetchPosts(user.id)
+   console.log(posts)
+ }
```

### 3. Add Error Handling with try/catch

```diff
- fetchData()
-   .then(data => {
-     processData(data)
-   })
-   .catch(error => {
-     handleError(error)
-   })
+ async function fetchAndProcessData() {
+   try {
+     const data = await fetchData()
+     processData(data)
+   } catch (error) {
+     handleError(error)
+   }
+ }
```

### 4. Convert Deep Nesting to Sequential Code

```diff
- fetchUser(id)
-   .then(user => {
-     return fetchPosts(user.id)
-       .then(posts => {
-         return fetchComments(posts.map(p => p.id))
-           .then(comments => {
-             return { user, posts, comments }
-           })
-       })
-   })
+ async function fetchUserData(id: string) {
+   const user = await fetchUser(id)
+   const posts = await fetchPosts(user.id)
+   const comments = await fetchComments(posts.map(p => p.id))
+   return { user, posts, comments }
+ }
```

### 5. Use Promise.all() for Parallel Operations

```diff
- fetchUser(id)
-   .then(user => {
-     return Promise.all([
-       fetchPosts(user.id),
-       fetchComments(user.id),
-     ])
-   })
-   .then(([posts, comments]) => {
-     console.log(posts, comments)
-   })
+ async function fetchUserRelatedData(id: string) {
+   const user = await fetchUser(id)
+   const [posts, comments] = await Promise.all([
+     fetchPosts(user.id),
+     fetchComments(user.id),
+   ])
+   console.log(posts, comments)
+ }
```

## Best Practices

### Error Handling

Always use try/catch blocks with async/await:

```typescript
// ✅ Good: Explicit error handling
async function fetchData() {
  try {
    const result = await apiCall()
    return result
  } catch (error) {
    logger.error('Failed to fetch data', error)
    throw error
  }
}

// ❌ Bad: No error handling
async function fetchData() {
  const result = await apiCall()
  return result
}
```

### Parallel Operations

Use Promise.all() for parallel async operations:

```typescript
// ✅ Good: Parallel execution
async function fetchAllData() {
  const [users, posts, comments] = await Promise.all([fetchUsers(), fetchPosts(), fetchComments()])
  return { users, posts, comments }
}

// ❌ Bad: Sequential execution when parallel is possible
async function fetchAllData() {
  const users = await fetchUsers()
  const posts = await fetchPosts()
  const comments = await fetchComments()
  return { users, posts, comments }
}
```

### Error Boundaries

Consider error boundaries for better error management:

```typescript
// Handle errors at appropriate levels
async function processUser(id: string) {
  try {
    const user = await fetchUser(id)
    await validateUser(user)
    await saveUser(user)
  } catch (error) {
    if (error instanceof ValidationError) {
      logger.warn('Validation failed', error)
      return null
    }
    throw error
  }
}
```

### Cleanup with finally

Use finally blocks for cleanup operations:

```typescript
async function processWithResource() {
  const resource = acquireResource()

  try {
    await processWith(resource)
  } catch (error) {
    logger.error('Processing failed', error)
    throw error
  } finally {
    resource.release()
  }
}
```

## Common Pitfalls

### Forgetting await

```javascript
// ❌ Wrong: Forgetting await
async function processUser(id: string) {
  const user = fetchUser(id)
  console.log(user) // This logs a Promise, not the user!
}

// ✅ Correct: Using await
async function processUser(id: string) {
  const user = await fetchUser(id)
  console.log(user)
}
```

### Mixing .then() and async/await

```javascript
// ❌ Confusing: Mixing patterns
async function processUser(id: string) {
  const user = await fetchUser(id).then(u => u.id)
  const posts = await fetchPosts(user.id).then(p => p.data)
  return { user, posts }
}

// ✅ Clear: Consistent async/await
async function processUser(id: string) {
  const user = await fetchUser(id)
  const posts = await fetchPosts(user.id)
  return { user, posts }
}
```

### Missing Error Handling

```javascript
// ❌ Risky: No error handling
async function processData() {
  const data = await fetchData()
  return processData(data)
}

// ✅ Safe: Proper error handling
async function processData() {
  try {
    const data = await fetchData()
    return processData(data)
  } catch (error) {
    logger.error('Failed to process data', error)
    throw error
  }
}
```

### Sequential vs Parallel

```javascript
// ❌ Slow: Sequential execution when parallel is possible
async function loadPageData() {
  const user = await fetchUser()
  const posts = await fetchPosts()
  const comments = await fetchComments()
  return { user, posts, comments }
}

// ✅ Fast: Parallel execution
async function loadPageData() {
  const [user, posts, comments] = await Promise.all([fetchUser(), fetchPosts(), fetchComments()])
  return { user, posts, comments }
}
```

## Related Rules

- [no-promise-executor-return](../patterns/no-promise-executor-return.md) - Disallow returning values from Promise executor functions
- [prefer-promise-reject-errors](../patterns/prefer-promise-reject-errors.md) - Prefer rejecting with Error objects
- [no-misused-promises](../patterns/no-misused-promises.md) - Disallow common promise anti-patterns

## Further Reading

- [MDN: async function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function)
- [MDN: await](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/await)
- [Promise.all()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all)
- [Async/Await Best Practices](https://zellwk.com/blog/async-await-best-practices/)
- [Understanding Async/Await](https://javascript.info/async-await)

## Auto-Fix

This rule is not auto-fixable. Converting `.then()` to async/await requires understanding the control flow and ensuring proper error handling.

Use interactive mode to review violations:

```bash
codeforge analyze --rules no-thenable
```
