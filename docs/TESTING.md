# CodeForge Testing Guide

This guide explains how to test CodeForge, write tests for new features, and maintain test quality.

## Table of Contents

- [Testing Philosophy](#testing-philosophy)
- [Test Structure](#test-structure)
- [Running Tests](#running-tests)
- [Writing Tests](#writing-tests)
- [Test Coverage](#test-coverage)
- [Mocking and Fixtures](#mocking-and-fixtures)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## Testing Philosophy

CodeForge follows a comprehensive testing strategy to ensure code quality and reliability:

- **Unit Tests**: Test individual functions, classes, and modules in isolation
- **Integration Tests**: Test interactions between multiple components
- **Performance Tests**: Benchmark critical paths to ensure acceptable performance
- **Coverage Threshold**: 85% minimum code coverage

### Testing Stack

- **Test Framework**: [Vitest](https://vitest.dev/) - Fast, Vite-native test runner
- **Assertions**: Vitest's built-in `expect` (Chai-compatible)
- **Mocking**: Vitest's built-in mocking (`vi.fn()`, `vi.spyOn()`)
- **Coverage**: Vitest's coverage provider (Istanbul/c8 compatible)

## Test Structure

### Directory Layout

```
test/
├── unit/              # Unit tests
│   ├── commands/       # Command tests
│   ├── rules/          # Rule implementation tests
│   ├── cache/          # Cache system tests
│   └── utils/          # Utility function tests
├── integration/        # Integration tests
│   ├── cli/            # CLI workflow tests
│   └── plugins/        # Plugin system tests
└── fixtures/           # Test fixtures and sample files
    ├── projects/       # Sample project structures
    └── files/          # Sample code files
```

### Test File Naming

- Unit tests: `*.test.ts`
- Integration tests: `*.integration.test.ts`
- Fixtures: `*.fixture.ts`

### Test Organization

Tests mirror the source code structure:

```
src/commands/analyze.ts       → test/unit/commands/analyze.test.ts
src/rules/no-any.ts           → test/unit/rules/no-any.test.ts
src/cache/parse-cache.ts      → test/unit/cache/parse-cache.test.ts
```

## Running Tests

### All Tests

```bash
npm test
```

### Specific Test Files

```bash
# Run a single test file
npm test test/unit/commands/analyze.test.ts

# Run tests matching a pattern
npm test --grep "no-any"
```

### Watch Mode

```bash
# Run tests in watch mode during development
npm run test:watch
```

### Coverage Report

```bash
# Generate coverage report
npm run test:coverage

# Coverage report location: coverage/index.html
```

### CI Mode

```bash
# Run tests in CI (no watch, coverage report)
npm test --run
```

## Writing Tests

### Basic Test Structure

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { MyModule } from '../../../src/modules/my-module'

describe('MyModule', () => {
  let module: MyModule

  beforeEach(() => {
    module = new MyModule()
  })

  afterEach(() => {
    module?.cleanup()
  })

  it('should do something specific', () => {
    const result = module.doSomething('input')
    expect(result).toBe('expected output')
  })

  it('should handle edge cases', () => {
    expect(() => module.doSomething(null)).toThrow()
  })
})
```

### Testing Commands

```typescript
import { describe, it, expect, vi } from 'vitest'
import { AnalyzeCommand } from '../../../src/commands/analyze'
import { mockFS } from '../../helpers/fs-mock'

describe('AnalyzeCommand', () => {
  let command: AnalyzeCommand

  beforeEach(() => {
    command = new AnalyzeCommand([], {} as Config)
    vi.mock('fs', () => mockFS)
  })

  it('should analyze TypeScript files', async () => {
    const result = await command.run()
    expect(result).toBeDefined()
    expect(result.violations).toBeInstanceOf(Array)
  })

  it('should respect ignore patterns', async () => {
    const result = await command.run(['--ignore', '**/*.test.ts'])
    expect(result.filesAnalyzed).toBeGreaterThan(0)
  })
})
```

### Testing Rules

```typescript
import { describe, it, expect } from 'vitest'
import { NoAnyRule } from '../../../src/rules/no-any'
import { parseCode } from '../../helpers/parser'

describe('NoAnyRule', () => {
  const rule = new NoAnyRule()

  it('should detect any type usage', () => {
    const code = `
      const value: any = getValue();
    `
    const ast = parseCode(code)
    const violations = rule.check(ast)

    expect(violations).toHaveLength(1)
    expect(violations[0].ruleId).toBe('no-any')
    expect(violations[0].message).toContain('any')
  })

  it('should not flag properly typed code', () => {
    const code = `
      const value: string = getValue();
    `
    const ast = parseCode(code)
    const violations = rule.check(ast)

    expect(violations).toHaveLength(0)
  })
})
```

### Testing Cache

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { ParseCache } from '../../../src/cache/parse-cache'
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'

describe('ParseCache', () => {
  let cache: ParseCache
  const tempDir = path.join(os.tmpdir(), 'codeforge-test')

  beforeEach(() => {
    cache = new ParseCache(tempDir)
  })

  afterEach(async () => {
    await cache.clear()
    fs.rmSync(tempDir, { recursive: true, force: true })
  })

  it('should cache parsed ASTs', async () => {
    const filePath = '/test/file.ts'
    const ast = { type: 'Program', body: [] }

    await cache.set(filePath, ast)
    const cached = await cache.get(filePath)

    expect(cached).toEqual(ast)
  })

  it('should invalidate cache on file change', async () => {
    const filePath = '/test/file.ts'
    const ast1 = { type: 'Program', body: [] }
    const ast2 = { type: 'Program', body: [{ type: 'Expression' }] }

    await cache.set(filePath, ast1)
    await cache.set(filePath, ast2)

    const cached = await cache.get(filePath)
    expect(cached).toEqual(ast2)
  })
})
```

## Test Coverage

### Coverage Threshold

CodeForge requires **85% minimum coverage**. The build will fail if coverage drops below this threshold.

### Coverage Commands

```bash
# Check current coverage
npm run test:coverage

# View detailed coverage report
open coverage/index.html
```

### Coverage Goals

- **Critical paths**: 100% coverage (rules, core utilities)
- **Commands**: 80%+ coverage (happy path + error cases)
- **Utilities**: 90%+ coverage (well-tested helpers)
- **Integration**: 70%+ coverage (complex workflows)

## Mocking and Fixtures

### Mocking File System

```typescript
import { vi } from 'vitest'

export const mockFS = {
  existsSync: vi.fn((path: string) => true),
  readFileSync: vi.fn((path: string) => 'mock file content'),
  writeFileSync: vi.fn(),
  readdirSync: vi.fn(() => ['file1.ts', 'file2.ts']),
  statSync: vi.fn(() => ({ size: 1024, mtime: new Date() })),
}
```

### Mocking Config

```typescript
import { vi } from 'vitest'
import { Config } from '../../../src/types'

export function createMockConfig(overrides: Partial<Config> = {}): Config {
  return {
    files: ['src/**/*.ts'],
    ignore: ['node_modules', 'dist'],
    rules: {
      'no-any': 'error',
      'prefer-const': 'warning',
    },
    ...overrides,
  }
}
```

### Test Fixtures

```typescript
// test/fixtures/files/sample-class.ts
export class SampleClass {
  private value: string

  constructor(value: string) {
    this.value = value
  }

  getValue(): string {
    return this.value
  }

  setValue(newValue: string): void {
    this.value = newValue
  }
}
```

## Best Practices

### 1. Test Behavior, Not Implementation

```typescript
// ❌ Bad: Testing implementation details
it('should use internal cache', () => {
  expect(analyzer.cache).toBeDefined()
})

// ✅ Good: Testing observable behavior
it('should cache analysis results', async () => {
  await analyzer.run()
  const firstRun = analyzer.getDuration()

  await analyzer.run()
  const secondRun = analyzer.getDuration()

  expect(secondRun).toBeLessThan(firstRun)
})
```

### 2. Use Descriptive Test Names

```typescript
// ❌ Bad
it('should work', () => {})

// ✅ Good
it('should return violations sorted by severity when format is console', () => {})
```

### 3. Test Edge Cases

```typescript
describe('parameter validation', () => {
  it('should reject negative concurrency', () => {
    expect(() => new Analyzer({ concurrency: -1 })).toThrow()
  })

  it('should reject empty file patterns', () => {
    expect(() => new Analyzer({ files: [] })).toThrow()
  })

  it('should handle very large files', async () => {
    const largeFile = generateLargeFile(10000)
    const result = await analyzer.analyze(largeFile)
    expect(result).toBeDefined()
  })
})
```

### 4. Isolate Tests

```typescript
describe('isolated test', () => {
  let originalEnv: string | undefined

  beforeEach(() => {
    originalEnv = process.env.NODE_ENV
  })

  afterEach(() => {
    process.env.NODE_ENV = originalEnv
  })

  it('should respect NODE_ENV', () => {
    process.env.NODE_ENV = 'test'
    expect(getEnvironment()).toBe('test')
  })
})
```

### 5. Clean Up Resources

```typescript
describe('file operations', () => {
  let tempFiles: string[] = []

  afterEach(() => {
    // Clean up any created files
    tempFiles.forEach((file) => {
      try {
        fs.unlinkSync(file)
      } catch {}
    })
    tempFiles = []
  })

  it('should create temp file', () => {
    const file = createTempFile('content')
    tempFiles.push(file)
    expect(fs.existsSync(file)).toBe(true)
  })
})
```

## Troubleshooting

### Common Issues

#### 1. Tests Pass Locally but Fail in CI

**Problem**: Tests that rely on timing, file system state, or environment variables may fail in CI.

**Solution**:

```typescript
// Use fake timers
vi.useFakeTimers()

// Mock environment variables
process.env.CI = 'true'

// Use in-memory file system
vi.mock('fs', () => mockFS)
```

#### 2. Flaky Tests

**Problem**: Tests sometimes pass, sometimes fail without code changes.

**Solution**:

- Ensure proper cleanup in `afterEach`
- Avoid shared state between tests
- Mock external dependencies (time, random, network)
- Use deterministic test data

```typescript
// ✅ Good: Deterministic test
it('should generate consistent IDs', () => {
  vi.spyOn(Math, 'random').mockReturnValue(0.5)
  const id1 = generateId()
  const id2 = generateId()
  expect(id1).toBe(id2)
})
```

#### 3. Slow Tests

**Problem**: Test suite takes too long to run.

**Solution**:

- Use `vi.mock` to avoid heavy computations
- Parallelize independent tests with `describe.concurrent`
- Skip integration tests in unit test runs

```typescript
// Run tests in parallel
describe.concurrent('parallel tests', () => {
  it('test 1', async () => {
    /* ... */
  })
  it('test 2', async () => {
    /* ... */
  })
})
```

#### 4. Memory Leaks in Tests

**Problem**: Tests consume too much memory or don't release resources.

**Solution**:

```typescript
describe('resource management', () => {
  let resources: Resource[] = []

  afterEach(() => {
    // Release all resources
    resources.forEach((r) => r.dispose())
    resources = []
  })

  it('should manage resources', () => {
    const resource = acquireResource()
    resources.push(resource)
    expect(resource.isActive()).toBe(true)
  })
})
```

### Debug Failed Tests

```bash
# Run with verbose output
npm test --reporter=verbose

# Run specific test with console logs
npm test test/unit/commands/analyze.test.ts --console

# Debug with Node debugger
node --inspect-brk node_modules/.bin/vitest run test/unit/commands/analyze.test.ts
```

## Contributing Tests

When adding new features, please include:

1. **Unit tests** for new functions/classes
2. **Integration tests** for new commands/workflows
3. **Fixtures** for complex test scenarios
4. **Updated coverage** - maintain 85%+ threshold

### Test Checklist

- [ ] Tests pass locally
- [ ] Tests pass in CI
- [ ] Coverage meets threshold
- [ ] No flaky behavior (run 3+ times)
- [ ] Proper cleanup in `afterEach`
- [ ] Mocked external dependencies
- [ ] Descriptive test names
- [ ] Edge cases covered

## Additional Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Best Practices](https://testingjavascript.com/)
- [Effective Mocking](https://vitest.dev/guide/mocking.html)
- [Coverage Configuration](https://vitest.dev/config/coverage.html)
