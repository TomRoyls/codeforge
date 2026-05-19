import { describe, expect, it } from 'vitest'

import Check from '../src/commands/check.js'
import type { CheckResult, HealthCheckResult } from '../src/commands/check-helpers.js'
import {
  checkComplexity,
  checkDocCoverage,
  checkDuplicates,
  checkTodos,
  checkUnusedExports,
  runHealthCheck,
} from '../src/commands/check-helpers.js'
import { formatCheckJson, formatCheckTable, formatScoreBar, getStatusIcon } from '../src/commands/check-format-helpers.js'

// ─── Test data factories

function makeCheckResult(overrides: Partial<CheckResult> = {}): CheckResult {
  return {
    details: [],
    message: 'OK',
    name: 'test',
    score: 100,
    status: 'pass',
    ...overrides,
  }
}

function makeHealthCheckResult(overrides: Partial<HealthCheckResult> = {}): HealthCheckResult {
  return {
    checks: [makeCheckResult()],
    failedChecks: 0,
    overallScore: 100,
    overallStatus: 'pass',
    passedChecks: 1,
    summary: 'Health score: 100/100 (1 passed, 0 warnings, 0 failed)',
    warnChecks: 0,
    ...overrides,
  }
}

// ─── Command metadata

describe('Check command - static metadata', () => {
  it('has a description', () => {
    expect(Check.description).toBe('Run a comprehensive codebase health check')
  })

  it('has examples array', () => {
    expect(Array.isArray(Check.examples)).toBe(true)
    expect(Check.examples.length).toBeGreaterThanOrEqual(4)
  })

  it('has path arg as optional', () => {
    expect(Check.args.path).toBeDefined()
    expect(Check.args.path.required).toBe(false)
  })

  it('defaults path to "."', () => {
    expect(Check.args.path.default).toBe('.')
  })
})

describe('Check command - flags', () => {
  it('has format flag with options', () => {
    expect(Check.flags.format.options).toContain('json')
    expect(Check.flags.format.options).toContain('table')
  })

  it('defaults format to table', () => {
    expect(Check.flags.format.default).toBe('table')
  })

  it('has output flag', () => {
    expect(Check.flags.output).toBeDefined()
  })

  it('has threshold flag defaulting to 70', () => {
    expect(Check.flags.threshold.default).toBe(70)
  })

  it('has checks flag with options', () => {
    expect(Check.flags.checks.options).toContain('all')
    expect(Check.flags.checks.options).toContain('todos')
    expect(Check.flags.checks.options).toContain('complexity')
  })

  it('has verbose flag defaulting to false', () => {
    expect(Check.flags.verbose.default).toBe(false)
  })

  it('defaults checks to all', () => {
    expect(Check.flags.checks.default).toBe('all')
  })
})

describe('Check command - class structure', () => {
  it('exports a default class', () => {
    expect(Check).toBeDefined()
    expect(typeof Check).toBe('function')
  })

  it('has a run method', () => {
    expect(typeof Check.prototype.run).toBe('function')
  })
})

// ─── checkTodos

describe('checkTodos', () => {
  it('returns score 100 and pass for no todos', () => {
    const result = checkTodos('const x = 1;')
    expect(result.score).toBe(100)
    expect(result.status).toBe('pass')
  })

  it('returns score 80 and pass for few todos', () => {
    const content = Array.from({ length: 5 }, (_, i) => `// TODO: fix ${i}`).join('\n')
    const result = checkTodos(content)
    expect(result.score).toBe(80)
    expect(result.status).toBe('pass')
  })

  it('returns score 60 and warn for 10-24 todos', () => {
    const content = Array.from({ length: 15 }, (_, i) => `// TODO: fix ${i}`).join('\n')
    const result = checkTodos(content)
    expect(result.score).toBe(60)
    expect(result.status).toBe('warn')
  })

  it('returns score 40 and fail for 25-49 todos', () => {
    const content = Array.from({ length: 30 }, (_, i) => `// TODO: fix ${i}`).join('\n')
    const result = checkTodos(content)
    expect(result.score).toBe(40)
    expect(result.status).toBe('fail')
  })

  it('returns score 20 for 50+ todos', () => {
    const content = Array.from({ length: 55 }, (_, i) => `// TODO: fix ${i}`).join('\n')
    const result = checkTodos(content)
    expect(result.score).toBe(20)
    expect(result.status).toBe('fail')
  })

  it('counts mixed TODO/FIXME/HACK', () => {
    const content = '// TODO: fix\n// FIXME: broken\n// HACK: workaround'
    const result = checkTodos(content)
    expect(result.details).toContain('1 TODO comments')
    expect(result.details).toContain('1 FIXME comments')
    expect(result.details).toContain('1 HACK comments')
  })

  it('handles empty content', () => {
    const result = checkTodos('')
    expect(result.score).toBe(100)
    expect(result.status).toBe('pass')
  })

  it('finds block comment TODOs', () => {
    const content = '/* TODO: this is in a block */'
    const result = checkTodos(content)
    expect(result.score).toBe(80)
  })
})

// ─── checkComplexity

describe('checkComplexity', () => {
  it('returns high score for simple code', () => {
    const content = 'function simple() { return 1; }'
    const result = checkComplexity(content, 'test.ts')
    expect(result.score).toBe(100)
    expect(result.status).toBe('pass')
  })

  it('returns lower score for complex code', () => {
    const content = `function complex(x) {
      if (x > 0) {
        for (let i = 0; i < x; i++) {
          if (i % 2 === 0) {
            try { if (i && x) { } } catch (e) { }
          } else if (i || x) {
            for (let j = 0; j < i; j++) { if (j && j) {} }
          }
        }
      } else if (x < 0) {
        while (x < 0) { x++; if (x && x) {} }
      } else {
        switch(x) { case 0: break; case 1: break; default: break; }
      }
    }`
    const result = checkComplexity(content, 'test.ts')
    expect(result.score).toBeLessThan(100)
  })

  it('returns score 100 for no functions', () => {
    const content = 'const x = 1;'
    const result = checkComplexity(content, 'test.ts')
    expect(result.score).toBe(100)
    expect(result.status).toBe('pass')
  })

  it('has correct name', () => {
    const content = 'const x = 1;'
    const result = checkComplexity(content, 'test.ts')
    expect(result.name).toBe('complexity')
  })

  it('handles arrow functions', () => {
    const content = 'const add = (a, b) => a + b;'
    const result = checkComplexity(content, 'test.ts')
    expect(result.name).toBe('complexity')
  })
})

// ─── checkDocCoverage

describe('checkDocCoverage', () => {
  it('returns score 100 for all documented', () => {
    const content = `/**
 * Adds two numbers.
 */
export function add(a: number, b: number): number {
  return a + b;
}`
    const result = checkDocCoverage(content, 'test.ts')
    expect(result.score).toBe(100)
    expect(result.status).toBe('pass')
  })

  it('returns score 0 for none documented', () => {
    const content = `export function add(a: number, b: number): number {
  return a + b;
}
export function sub(a: number, b: number): number {
  return a - b;
}`
    const result = checkDocCoverage(content, 'test.ts')
    expect(result.score).toBe(0)
    expect(result.status).toBe('fail')
  })

  it('returns proportional score for partial coverage', () => {
    const content = `/**
 * Doc'd.
 */
export function foo() {}

export function bar() {}`
    const result = checkDocCoverage(content, 'test.ts')
    expect(result.score).toBe(50)
    expect(result.status).toBe('fail')
  })

  it('returns score 100 for no exports', () => {
    const content = 'const x = 1;'
    const result = checkDocCoverage(content, 'test.ts')
    expect(result.score).toBe(100)
    expect(result.status).toBe('pass')
  })

  it('detects export class', () => {
    const content = 'export class MyClass {}'
    const result = checkDocCoverage(content, 'test.ts')
    expect(result.score).toBe(0)
  })

  it('detects export interface', () => {
    const content = 'export interface MyInterface {}'
    const result = checkDocCoverage(content, 'test.ts')
    expect(result.score).toBe(0)
  })

  it('detects export type', () => {
    const content = 'export type MyType = string;'
    const result = checkDocCoverage(content, 'test.ts')
    expect(result.score).toBe(0)
  })

  it('detects single-line JSDoc', () => {
    const content = `/** Doc */
export function foo() {}`
    const result = checkDocCoverage(content, 'test.ts')
    expect(result.score).toBe(100)
  })
})

// ─── checkDuplicates

describe('checkDuplicates', () => {
  it('returns score 100 for no duplicates', () => {
    const lines = ['const alpha = 1;', 'const bravo = 2;', 'const charlie = 3;']
    const result = checkDuplicates(lines)
    expect(result.score).toBe(100)
    expect(result.status).toBe('pass')
  })

  it('returns lower score for some duplicates', () => {
    const lines = [
      'const alpha = 1;',
      'const bravo = 2;',
      'const alpha = 1;',
      'const alpha = 1;',
      'const bravo = 2;',
      'const charlie = 3;',
      'const delta = 4;',
    ]
    const result = checkDuplicates(lines)
    expect(result.score).toBeLessThan(100)
  })

  it('returns score 20 for all same lines', () => {
    const lines = Array.from({ length: 10 }, () => 'const duplicated line here for testing;')
    const result = checkDuplicates(lines)
    expect(result.score).toBe(20)
    expect(result.status).toBe('fail')
  })

  it('handles empty content', () => {
    const result = checkDuplicates([])
    expect(result.score).toBe(100)
    expect(result.status).toBe('pass')
  })

  it('skips short lines', () => {
    const lines = ['short', 'short', 'also short']
    const result = checkDuplicates(lines)
    expect(result.score).toBe(100)
  })

  it('skips comment-only lines', () => {
    const lines = ['// this is a comment line that is long enough', '// this is a comment line that is long enough']
    const result = checkDuplicates(lines)
    expect(result.score).toBe(100)
  })

  it('has correct name', () => {
    const result = checkDuplicates(['const x = 12345;'])
    expect(result.name).toBe('dupes')
  })
})

// ─── checkUnusedExports

describe('checkUnusedExports', () => {
  it('returns score 100 when all used', () => {
    const content = `export const foo = 1;\nimport { foo } from './test';`
    const result = checkUnusedExports({ content, filePath: 'test.ts' })
    expect(result.score).toBe(100)
    expect(result.status).toBe('pass')
  })

  it('returns lower score for unused exports', () => {
    const content = `export const foo = 1;\nexport const bar = 2;\nimport { foo } from './test';`
    const result = checkUnusedExports({ content, filePath: 'test.ts' })
    expect(result.score).toBeLessThan(100)
  })

  it('returns score 20 for all unused', () => {
    const content = `export const foo = 1;\nexport const bar = 2;\nexport const baz = 3;`
    const result = checkUnusedExports({ content, filePath: 'test.ts' })
    expect(result.score).toBe(20)
    expect(result.status).toBe('fail')
  })

  it('returns score 100 for no exports', () => {
    const content = 'const x = 1;'
    const result = checkUnusedExports({ content, filePath: 'test.ts' })
    expect(result.score).toBe(100)
    expect(result.status).toBe('pass')
  })

  it('handles dynamic imports as used', () => {
    const content = `export const foo = 1;\nimport('./test');`
    const result = checkUnusedExports({ content, filePath: 'test.ts' })
    expect(result.score).toBe(100)
  })

  it('has correct name', () => {
    const result = checkUnusedExports({ content: 'const x = 1;', filePath: 'test.ts' })
    expect(result.name).toBe('unused')
  })
})

// ─── runHealthCheck

describe('runHealthCheck', () => {
  it('returns pass when all checks pass', async () => {
    const mockDiscover = async () => [
      { absolutePath: '/test/a.ts', path: 'a.ts' },
    ]
    const mockReadFile = async () => 'const x = 1;'

    const result = await runHealthCheck('/test', { checks: 'all', threshold: 70 }, mockDiscover, mockReadFile)
    expect(result.overallScore).toBe(100)
    expect(result.overallStatus).toBe('pass')
  })

  it('returns fail for low scores with high threshold', async () => {
    const manyTodos = Array.from({ length: 50 }, (_, i) => `// TODO: ${i}`).join('\n')
    const mockDiscover = async () => [
      { absolutePath: '/test/a.ts', path: 'a.ts' },
    ]
    const mockReadFile = async () => manyTodos

    const result = await runHealthCheck('/test', { checks: 'all', threshold: 100 }, mockDiscover, mockReadFile)
    expect(result.overallScore).toBeLessThan(100)
    expect(result.overallStatus).toBe('fail')
  })

  it('handles no files', async () => {
    const mockDiscover = async () => []
    const mockReadFile = async () => ''

    const result = await runHealthCheck('/test', { checks: 'all', threshold: 70 }, mockDiscover, mockReadFile)
    expect(result.overallScore).toBe(100)
    expect(result.checks).toHaveLength(0)
  })

  it('filters checks with --checks flag', async () => {
    const mockDiscover = async () => [
      { absolutePath: '/test/a.ts', path: 'a.ts' },
    ]
    const mockReadFile = async () => 'const x = 1;'

    const result = await runHealthCheck('/test', { checks: 'todos', threshold: 70 }, mockDiscover, mockReadFile)
    expect(result.checks).toHaveLength(1)
    expect(result.checks[0]!.name).toBe('todos')
  })

  it('counts passed, warned, and failed checks', async () => {
    const result = await runHealthCheck(
      '/test',
      { checks: 'todos', threshold: 70 },
      async () => [{ absolutePath: '/test/a.ts', path: 'a.ts' }],
      async () => '// TODO: fix',
    )
    expect(result.passedChecks + result.warnChecks + result.failedChecks).toBe(result.checks.length)
  })

  it('produces a summary string', async () => {
    const mockDiscover = async () => [
      { absolutePath: '/test/a.ts', path: 'a.ts' },
    ]
    const mockReadFile = async () => 'const x = 1;'

    const result = await runHealthCheck('/test', { checks: 'all', threshold: 70 }, mockDiscover, mockReadFile)
    expect(result.summary).toContain('Health score')
    expect(result.summary).toContain('/100')
  })

  it('handles file read errors gracefully', async () => {
    const mockDiscover = async () => [
      { absolutePath: '/test/a.ts', path: 'a.ts' },
    ]
    const mockReadFile = async () => {
      throw new Error('read error')
    }

    const result = await runHealthCheck('/test', { checks: 'all', threshold: 70 }, mockDiscover, mockReadFile)
    expect(result.overallScore).toBe(100)
    expect(result.checks).toHaveLength(0)
  })
})

// ─── formatScoreBar

describe('formatScoreBar', () => {
  it('renders full bar for 100', () => {
    const bar = formatScoreBar(100)
    expect(bar).toContain('██████████')
    expect(bar).toContain('100/100')
  })

  it('renders empty bar for 0', () => {
    const bar = formatScoreBar(0)
    expect(bar).toContain('░░░░░░░░░░')
    expect(bar).toContain('0/100')
  })

  it('renders partial bar for 80', () => {
    const bar = formatScoreBar(80)
    expect(bar).toContain('█')
    expect(bar).toContain('░')
    expect(bar).toContain('80/100')
  })

  it('wraps in brackets', () => {
    const bar = formatScoreBar(50)
    expect(bar.startsWith('[')).toBe(true)
    expect(bar.includes(']')).toBe(true)
  })
})

// ─── getStatusIcon

describe('getStatusIcon', () => {
  it('returns ✓ for pass', () => {
    expect(getStatusIcon('pass')).toBe('✓')
  })

  it('returns ⚠ for warn', () => {
    expect(getStatusIcon('warn')).toBe('⚠')
  })

  it('returns ✗ for fail', () => {
    expect(getStatusIcon('fail')).toBe('✗')
  })
})

// ─── formatCheckTable

describe('formatCheckTable', () => {
  it('contains overall score header', () => {
    const result = makeHealthCheckResult()
    const output = formatCheckTable(result, false)
    expect(output).toContain('Health Check')
  })

  it('contains check names', () => {
    const result = makeHealthCheckResult({
      checks: [makeCheckResult({ name: 'todos', score: 100, status: 'pass' })],
    })
    const output = formatCheckTable(result, false)
    expect(output).toContain('todos')
  })

  it('shows details in verbose mode', () => {
    const result = makeHealthCheckResult({
      checks: [makeCheckResult({ name: 'todos', details: ['5 TODOs found'] })],
    })
    const output = formatCheckTable(result, true)
    expect(output).toContain('5 TODOs found')
  })

  it('hides details in non-verbose mode', () => {
    const result = makeHealthCheckResult({
      checks: [makeCheckResult({ name: 'todos', details: ['5 TODOs found'] })],
    })
    const output = formatCheckTable(result, false)
    expect(output).not.toContain('5 TODOs found')
  })

  it('shows summary line', () => {
    const result = makeHealthCheckResult({
      passedChecks: 3,
      warnChecks: 1,
      failedChecks: 0,
    })
    const output = formatCheckTable(result, false)
    expect(output).toContain('3 passed')
    expect(output).toContain('1 warnings')
  })

  it('handles all statuses', () => {
    const result = makeHealthCheckResult({
      checks: [
        makeCheckResult({ name: 'a', status: 'pass', score: 100 }),
        makeCheckResult({ name: 'b', status: 'warn', score: 60 }),
        makeCheckResult({ name: 'c', status: 'fail', score: 20 }),
      ],
      failedChecks: 1,
      overallScore: 60,
      overallStatus: 'warn',
      passedChecks: 1,
      warnChecks: 1,
    })
    const output = formatCheckTable(result, false)
    expect(output).toContain('✓')
    expect(output).toContain('⚠')
    expect(output).toContain('✗')
  })
})

// ─── formatCheckJson

describe('formatCheckJson', () => {
  it('produces valid JSON', () => {
    const result = makeHealthCheckResult()
    const output = formatCheckJson(result)
    const parsed = JSON.parse(output)
    expect(parsed).toBeDefined()
  })

  it('contains checks array', () => {
    const result = makeHealthCheckResult()
    const output = formatCheckJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.checks).toBeDefined()
    expect(Array.isArray(parsed.checks)).toBe(true)
  })

  it('contains overallScore', () => {
    const result = makeHealthCheckResult({ overallScore: 85 })
    const output = formatCheckJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.overallScore).toBe(85)
  })

  it('contains overallStatus', () => {
    const result = makeHealthCheckResult({ overallStatus: 'warn' })
    const output = formatCheckJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.overallStatus).toBe('warn')
  })

  it('contains summary', () => {
    const result = makeHealthCheckResult({ summary: 'Test summary' })
    const output = formatCheckJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.summary).toBe('Test summary')
  })

  it('preserves check details', () => {
    const result = makeHealthCheckResult({
      checks: [makeCheckResult({ name: 'todos', details: ['5 TODOs'] })],
    })
    const output = formatCheckJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.checks[0].details).toContain('5 TODOs')
  })

  it('handles empty checks', () => {
    const result = makeHealthCheckResult({
      checks: [],
      failedChecks: 0,
      overallScore: 100,
      overallStatus: 'pass',
      passedChecks: 0,
      summary: 'No files found',
      warnChecks: 0,
    })
    const output = formatCheckJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.checks).toHaveLength(0)
    expect(parsed.overallScore).toBe(100)
  })
})
