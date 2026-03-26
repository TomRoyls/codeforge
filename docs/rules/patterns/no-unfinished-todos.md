# no-unfinished-todos

| Property    | Value    |
| ----------- | -------- |
| Category    | patterns |
| Fixable     | No       |
| Recommended | No       |
| Deprecated  | No       |

## Description

Detect unfinished TODO, FIXME, HACK, and XXX comments that should be addressed. These comments indicate work that needs to be completed, bugs that need fixing, or code that needs improvement. Left unaddressed, they can accumulate into technical debt and mask potential issues.

## Why This Rule Matters

Unfinished TODO and similar comments can lead to:

- **Technical debt accumulation**: Unfinished work accumulates over time
- **Masked issues**: Potential bugs or poor implementations remain hidden
- **Confusion for new developers**: unclear if comments are stale or still relevant
- **Reduced code quality**: Temporary solutions become permanent
- **Poor maintainability**: Future changes may be hindered by incomplete work

### Default Terms

By default, this rule detects comments containing:

- `TODO` - Tasks to be completed
- `FIXME` - Bugs or issues that need fixing
- `HACK` - Temporary or non-standard solutions
- `XXX` - Warning or significant issue to address

## Configuration Options

```json
{
  "rules": {
    "no-unfinished-todos": [
      "warn",
      {
        "terms": ["TODO", "FIXME", "HACK", "XXX"],
        "allowPatterns": ["@ignore", "won't fix", "intentional"]
      }
    ]
  }
}
```

| Option          | Type       | Default                            | Description                                         |
| --------------- | ---------- | ---------------------------------- | --------------------------------------------------- |
| `terms`         | `string[]` | `["TODO", "FIXME", "HACK", "XXX"]` | Terms to search for in comments                     |
| `allowPatterns` | `string[]` | `[]`                               | Regex patterns that allow matching comments to pass |

### allowPatterns Usage

The `allowPatterns` option allows you to specify regex patterns that, if matched, will prevent the rule from reporting on a comment. This is useful for marking intentional or documented unfinished items.

```json
{
  "rules": {
    "no-unfinished-todos": [
      "warn",
      {
        "terms": ["TODO", "FIXME"],
        "allowPatterns": ["@ignore", "tracked in issue \\d+", "intentional"]
      }
    ]
  }
}
```

With this configuration, comments like these would be allowed:

- `// TODO: Add feature X @ignore`
- `// FIXME: This is tracked in issue 123`
- `// HACK: This is intentional`

## When to Use This Rule

**Use this rule when:**

- You want to maintain awareness of unfinished work in your codebase
- You're actively reducing technical debt
- You have a process for regularly addressing TODO comments
- You're onboarding new developers and want to surface incomplete work
- You're preparing for a release and want to ensure no known issues remain

**Consider disabling when:**

- You're in a rapid prototyping phase with intentional incomplete work
- You have a separate issue tracking system that you prefer
- Your project is archived or in maintenance mode

## Code Examples

### ❌ Incorrect - Unfinished TODO Comments

```typescript
// TODO: Implement error handling
function processData(data: string) {
  return JSON.parse(data)
}
```

```typescript
// FIXME: This doesn't handle edge cases
async function fetchUsers() {
  const response = await fetch('/api/users')
  return response.json()
}
```

```typescript
// HACK: Quick workaround for performance issue
function optimizeCache(data: any) {
  // Force type coercion to bypass type checker
  return data as unknown as Record<string, any>
}
```

```typescript
// XXX: This is a security risk, needs proper validation
function executeCommand(cmd: string) {
  return exec(cmd)
}
```

### ✅ Correct - Addressed or Documented Work

```typescript
// Implemented error handling with try-catch
function processData(data: string): any {
  try {
    return JSON.parse(data)
  } catch (error) {
    console.error('Failed to parse data:', error)
    throw new Error('Invalid JSON data')
  }
}
```

```typescript
// Edge cases handled with proper validation
async function fetchUsers(): Promise<User[]> {
  const response = await fetch('/api/users')

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  const data = await response.json()

  // Validate response structure
  if (!Array.isArray(data)) {
    throw new Error('Invalid response format')
  }

  return data
}
```

```typescript
// Replaced with proper type-safe solution
interface CacheData {
  id: string
  value: unknown
  timestamp: number
}

function optimizeCache(data: unknown): CacheData {
  if (isValidCacheData(data)) {
    return data
  }
  throw new Error('Invalid cache data')
}
```

```typescript
// Tracked in external issue system - referenced in code
// See issue #456 for security audit findings
function executeCommand(cmd: string): Promise<string> {
  // Implementation pending security review
  throw new Error('Command execution disabled pending security review (issue #456)')
}
```

### ✅ Correct - Using allowPatterns

```json
// Configuration:
{
  "rules": {
    "no-unfinished-todos": [
      "warn",
      {
        "allowPatterns": ["@wontfix", "intentional", "tracked in #[0-9]+"]
      }
    ]
  }
}
```

```typescript
// TODO: Add feature X @wontfix
// Reason: Feature deprecated, will be removed in v2.0
```

```typescript
// HACK: This is intentional workaround
// Will be replaced when upstream library is updated
```

```typescript
// FIXME: Edge case tracked in #123
function legacySupport() {
  // Temporary fix until library update
}
```

## How to Address Violations

### 1. Complete the Work

Address the TODO or FIXME by implementing the missing functionality:

```diff
- // TODO: Add input validation
+ function sanitizeInput(input: string): string {
+   if (typeof input !== 'string') {
+     throw new TypeError('Input must be a string')
+   }
+   return input.trim()
+ }
```

### 2. Remove Stale Comments

If the work is already complete, remove the comment:

```diff
- // TODO: This was fixed in PR #456
function processPayment(payment: Payment) {
  // Implementation already complete
}
```

### 3. Replace with Issue Reference

Link to external issue tracking instead of leaving TODO in code:

```diff
- // TODO: Implement OAuth2 support
+ // OAuth2 support tracked in issue #123
+ // Current implementation uses basic auth only
```

### 4. Document Why It's Not Fixed

If there's a deliberate decision not to fix something, document it:

```diff
- // FIXME: This is slow
+ // Performance Note: This is intentionally slow for security reasons
+ // See security/architecture.md for rationale
```

### 5. Mark as Intentional with allowPatterns

Use `allowPatterns` to mark intentionally unfinished items:

```typescript
// TODO: Feature not supported in current version @debt
// Will be implemented in v2.0 roadmap
```

## Best Practices

### Maintain a TODO Process

1. **Regular Reviews**: Schedule time to review and address TODO comments
2. **Issue Tracking**: Link code comments to external issues
3. **Prioritization**: Mark urgency levels (e.g., `TODO[CRITICAL]`, `TODO[LOW]`)
4. **Staleness Detection**: Remove TODOs that are no longer relevant

### Comment Convention

```typescript
// TODO[CRITICAL]: Add error handling
// TODO[HIGH]: Improve performance
// TODO[LOW]: Add optional feature

// FIXME: This is broken - tracked in #123
// HACK: Temporary workaround - see issue #456
// XXX: Security concern - addressed in PR #789
```

### Alternatives to Code Comments

Consider using issue tracking systems instead of code comments:

```typescript
// Instead of:
// TODO: Add caching

// Use:
// Add reference to issue and remove comment
```

## Related Rules

- [no-console](../security/no-console.md) - Remove debug console statements
- [no-debugger](../security/no-debugger.md) - Remove debugger statements
- [no-alert](../security/no-alert.md) - Remove alert() calls

## Further Reading

- [Technical Debt: The Unspoken Killer of Software Projects](https://www.atlassian.com/agile/project-management/technical-debt)
- [Don't Leave Broken Windows](https://www.artima.com/intv/fixit.html) - Andrew Hunt & David Thomas
- [The Pragmatic Programmer](https://pragprog.com/titles/tpp20/) - Andrew Hunt & David Thomas

## Auto-Fix

This rule is not auto-fixable. Removing TODO and similar comments requires understanding the intent and context of each comment.

Use interactive mode to review and decide how to handle each violation:

```bash
codeforge analyze --rules no-unfinished-todos
```
