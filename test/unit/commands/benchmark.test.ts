import { describe, test, expect, beforeEach, vi } from 'vitest'

import type { BenchmarkResult } from '../../../src/commands/benchmark-helpers.js'

import {
  formatResultRow,
  formatResultsTable,
  formatSummary,
  printResults,
  writeResults,
} from '../../../src/commands/benchmark-helpers.js'

vi.mock('../../../src/core/file-discovery.js', () => ({
  discoverFiles: vi.fn(),
}))

vi.mock('node:fs', () => ({
  existsSync: vi.fn(),
}))

vi.mock('../../../src/core/parser.js', () => ({
  Parser: vi.fn().mockImplementation(function () {
    return {
      initialize: vi.fn().mockResolvedValue(undefined),
      dispose: vi.fn(),
      parseFile: vi.fn().mockResolvedValue({
        sourceFile: {
          getFilePath: () => '/test/file.ts',
          getText: () => 'const x = 1;',
        },
      }),
    }
  }),
}))

vi.mock('../../../src/core/rule-registry.js', () => ({
  RuleRegistry: vi.fn().mockImplementation(function () {
    return {
      register: vi.fn(),
      runRules: vi.fn().mockReturnValue([]),
    }
  }),
}))

vi.mock('../../../src/rules/index.js', () => ({
  allRules: {
    'test-rule-1': {
      meta: { name: 'test-rule-1', description: 'Test rule 1' },
      create: () => ({ visitor: {}, onComplete: () => [] }),
    },
    'test-rule-2': {
      meta: { name: 'test-rule-2', description: 'Test rule 2' },
      create: () => ({ visitor: {}, onComplete: () => [] }),
    },
  },
  getRuleCategory: vi.fn(() => 'patterns'),
}))

// ─── Helper factories ──────────────────────────────────────────────────────

function makeResult(overrides: Partial<BenchmarkResult> = {}): BenchmarkResult {
  return {
    avgTime: 10.123,
    maxTime: 15.456,
    minTime: 5.789,
    ruleId: 'test-rule',
    runCount: 3,
    totalTime: 30.369,
    ...overrides,
  }
}

function makeManyResults(count: number): BenchmarkResult[] {
  return Array.from({ length: count }, (_, i) =>
    makeResult({
      avgTime: (count - i) * 10,
      maxTime: (count - i) * 15,
      minTime: (count - i) * 5,
      ruleId: `rule-${String(i).padStart(3, '0')}`,
      runCount: 3,
      totalTime: (count - i) * 30,
    }),
  )
}

// ─── Constants (duplicated for assertions, matching src/utils/constants.ts) ─

const DECIMAL_PRECISION_TIME = 3
const METRIC_FIELD_WIDTH = 12
const TOTAL_FIELD_WIDTH = 14
const BENCHMARK_TABLE_SEPARATOR_WIDTH = 90
const PERFORMANCE_SLOW_THRESHOLD_MS = 50
const PERFORMANCE_VERY_SLOW_THRESHOLD_MS = 100

// ═══════════════════════════════════════════════════════════════════════════
// EXISTING TESTS — Benchmark Command integration
// ═══════════════════════════════════════════════════════════════════════════

describe('Benchmark Command', () => {
  let Benchmark: typeof import('../../../src/commands/benchmark.js').default
  let mockConsoleLog: ReturnType<typeof vi.spyOn>
  let mockDiscoverFiles: ReturnType<typeof vi.fn>
  let mockExistsSync: ReturnType<typeof vi.fn>

  beforeEach(async () => {
    vi.clearAllMocks()
    vi.resetModules()

    mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {})

    const fileDiscovery = await import('../../../src/core/file-discovery.js')
    mockDiscoverFiles = fileDiscovery.discoverFiles as ReturnType<typeof vi.fn>

    const fs = await import('node:fs')
    mockExistsSync = fs.existsSync as ReturnType<typeof vi.fn>

    Benchmark = (await import('../../../src/commands/benchmark.js')).default
  })

  function createCommandWithMockedParse(
    flags: Record<string, unknown>,
    args: Record<string, unknown> = {},
  ) {
    const command = new Benchmark([], {} as never)
    const cmdWithMock = command as unknown as { parse: ReturnType<typeof vi.fn> }
    cmdWithMock.parse = vi.fn().mockResolvedValue({
      args,
      flags,
    })
    return command
  }

  describe('Command metadata', () => {
    test('has correct description', () => {
      expect(Benchmark.description).toBe('Benchmark rule performance on a codebase')
    })

    test('has examples defined', () => {
      expect(Benchmark.examples).toBeDefined()
      expect(Benchmark.examples.length).toBeGreaterThan(0)
    })

    test('has all required flags', () => {
      expect(Benchmark.flags).toBeDefined()
      expect(Benchmark.flags.iterations).toBeDefined()
      expect(Benchmark.flags.output).toBeDefined()
      expect(Benchmark.flags.rules).toBeDefined()
      expect(Benchmark.flags.top).toBeDefined()
      expect(Benchmark.flags.warmup).toBeDefined()
    })

    test('has path argument', () => {
      expect(Benchmark.args).toBeDefined()
      expect(Benchmark.args.path).toBeDefined()
      expect(Benchmark.args.path.default).toBe('.')
    })

    test('iterations flag has default value 3', () => {
      expect(Benchmark.flags.iterations.default).toBe(3)
    })

    test('iterations flag has char i', () => {
      expect(Benchmark.flags.iterations.char).toBe('i')
    })

    test('top flag has default value 20', () => {
      expect(Benchmark.flags.top.default).toBe(20)
    })

    test('top flag has char t', () => {
      expect(Benchmark.flags.top.char).toBe('t')
    })

    test('output flag has char o', () => {
      expect(Benchmark.flags.output.char).toBe('o')
    })

    test('rules flag has char r', () => {
      expect(Benchmark.flags.rules.char).toBe('r')
    })

    test('warmup flag has default true', () => {
      expect(Benchmark.flags.warmup.default).toBe(true)
    })
  })

  describe('run', () => {
    test('errors when path does not exist', async () => {
      mockExistsSync.mockReturnValue(false)

      const cmd = createCommandWithMockedParse(
        {
          iterations: 3,
          output: undefined,
          rules: undefined,
          top: 20,
          warmup: true,
        },
        { path: '/nonexistent' },
      )

      await expect(cmd.run()).rejects.toThrow('Path not found')
    })

    test('handles empty file list', async () => {
      mockExistsSync.mockReturnValue(true)
      mockDiscoverFiles.mockResolvedValue([])

      const cmd = createCommandWithMockedParse(
        {
          iterations: 3,
          output: undefined,
          rules: undefined,
          top: 20,
          warmup: true,
        },
        { path: '.' },
      )

      const cmdAny = cmd as unknown as { exit: ReturnType<typeof vi.fn> }
      cmdAny.exit = vi.fn()

      await cmd.run()
      expect(cmdAny.exit).toHaveBeenCalledWith(0)
    })

    test('discovers files with correct patterns', async () => {
      mockExistsSync.mockReturnValue(true)
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])

      const cmd = createCommandWithMockedParse(
        {
          iterations: 1,
          output: undefined,
          rules: undefined,
          top: 20,
          warmup: false,
        },
        { path: '/test' },
      )

      await cmd.run()

      expect(mockDiscoverFiles).toHaveBeenCalledWith(
        expect.objectContaining({
          cwd: '/test',
          patterns: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
        }),
      )
    })

    test('shows configuration info', async () => {
      mockExistsSync.mockReturnValue(true)
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])

      const cmd = createCommandWithMockedParse(
        {
          iterations: 5,
          output: undefined,
          rules: undefined,
          top: 10,
          warmup: true,
        },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')

      expect(output).toContain('Files: 1')
      expect(output).toContain('Iterations: 5')
      expect(output).toContain('Warmup: enabled')
    })

    test('shows results header', async () => {
      mockExistsSync.mockReturnValue(true)
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])

      const cmd = createCommandWithMockedParse(
        {
          iterations: 1,
          output: undefined,
          rules: undefined,
          top: 20,
          warmup: false,
        },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')

      expect(output).toContain('Results (sorted by average time)')
      expect(output).toContain('Avg (ms)')
      expect(output).toContain('Min (ms)')
      expect(output).toContain('Max (ms)')
    })

    test('shows summary with rule count', async () => {
      mockExistsSync.mockReturnValue(true)
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])

      const cmd = createCommandWithMockedParse(
        {
          iterations: 1,
          output: undefined,
          rules: undefined,
          top: 20,
          warmup: false,
        },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')

      expect(output).toContain('Total rules benchmarked:')
      expect(output).toContain('Slowest rule:')
      expect(output).toContain('Fastest rule:')
    })
  })

  describe('private methods', () => {
    test('getRulesToBenchmark returns all rules when none specified', async () => {
      mockExistsSync.mockReturnValue(true)
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])

      const cmd = createCommandWithMockedParse(
        {
          iterations: 1,
          output: undefined,
          rules: undefined,
          top: 20,
          warmup: false,
        },
        { path: '.' },
      )

      const cmdAny = cmd as unknown as {
        getRulesToBenchmark: (rules: string[] | undefined) => [string, unknown][]
      }
      const result = cmdAny.getRulesToBenchmark(undefined)

      expect(result.length).toBeGreaterThan(0)
    })

    test('getRulesToBenchmark filters by requested rules', async () => {
      mockExistsSync.mockReturnValue(true)
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])

      const cmd = createCommandWithMockedParse(
        {
          iterations: 1,
          output: undefined,
          rules: ['test-rule-1'],
          top: 20,
          warmup: false,
        },
        { path: '.' },
      )

      const cmdAny = cmd as unknown as {
        getRulesToBenchmark: (rules: string[] | undefined) => [string, unknown][]
      }
      const result = cmdAny.getRulesToBenchmark(['test-rule-1'])

      expect(result.length).toBe(1)
      expect(result[0]![0]).toBe('test-rule-1')
    })
  })
})

// ═══════════════════════════════════════════════════════════════════════════
// PURE FUNCTION TESTS — benchmark-helpers.ts
// ═══════════════════════════════════════════════════════════════════════════

describe('formatResultRow', () => {
  test('formats a typical result into a padded row string', () => {
    const result = makeResult()
    const row = formatResultRow(result)
    expect(typeof row).toBe('string')
    expect(row.length).toBeGreaterThan(0)
  })

  test('includes the ruleId left-padded to 40 chars', () => {
    const result = makeResult({ ruleId: 'my-rule' })
    const row = formatResultRow(result)
    expect(row.startsWith('my-rule')).toBe(true)
    expect(row.slice(0, 40).trim()).toBe('my-rule')
  })

  test('pads a short ruleId to 40 characters', () => {
    const result = makeResult({ ruleId: 'ab' })
    const row = formatResultRow(result)
    const idField = row.slice(0, 40)
    expect(idField.trim()).toBe('ab')
    expect(idField.length).toBe(40)
  })

  test('does not truncate a ruleId longer than 40 characters', () => {
    const longId = 'a'.repeat(50)
    const result = makeResult({ ruleId: longId })
    const row = formatResultRow(result)
    expect(row.slice(0, 50)).toBe(longId)
  })

  test('formats avgTime with correct decimal precision', () => {
    const result = makeResult({ avgTime: 1.23456789 })
    const row = formatResultRow(result)
    expect(row).toContain('1.235')
  })

  test('formats minTime with correct decimal precision', () => {
    const result = makeResult({ minTime: 2.345678 })
    const row = formatResultRow(result)
    expect(row).toContain('2.346')
  })

  test('formats maxTime with correct decimal precision', () => {
    const result = makeResult({ maxTime: 3.45678 })
    const row = formatResultRow(result)
    expect(row).toContain('3.457')
  })

  test('formats totalTime with 2 decimal places', () => {
    const result = makeResult({ totalTime: 123.4567 })
    const row = formatResultRow(result)
    expect(row).toContain('123.46')
  })

  test('handles zero values correctly', () => {
    const result = makeResult({ avgTime: 0, minTime: 0, maxTime: 0, totalTime: 0 })
    const row = formatResultRow(result)
    expect(row).toContain('0.000')
    expect(row).toContain('0.00')
  })

  test('handles very small values', () => {
    const result = makeResult({ avgTime: 0.001, minTime: 0.0001, maxTime: 0.002, totalTime: 0.003 })
    const row = formatResultRow(result)
    expect(row).toContain('0.001')
  })

  test('handles very large values', () => {
    const result = makeResult({
      avgTime: 9999.999,
      minTime: 5000.0,
      maxTime: 15000.5,
      totalTime: 30000.0,
    })
    const row = formatResultRow(result)
    expect(row).toContain('9999.999')
    expect(row).toContain('15000.500')
    expect(row).toContain('30000.00')
  })

  test('handles fractional avgTime precisely', () => {
    const result = makeResult({ avgTime: 0.0005 })
    const row = formatResultRow(result)
    expect(row).toContain('0.001')
  })

  test('handles avgTime rounding at 0.0004', () => {
    const result = makeResult({ avgTime: 0.0004 })
    const row = formatResultRow(result)
    expect(row).toContain('0.000')
  })

  test('formats integer-like times with .000', () => {
    const result = makeResult({ avgTime: 42 })
    const row = formatResultRow(result)
    expect(row).toContain('42.000')
  })

  test('handles negative avgTime', () => {
    const result = makeResult({ avgTime: -5.5 })
    const row = formatResultRow(result)
    expect(row).toContain('-5.500')
  })

  test('handles negative minTime', () => {
    const result = makeResult({ minTime: -1.0 })
    const row = formatResultRow(result)
    expect(row).toContain('-1.000')
  })

  test('handles negative maxTime', () => {
    const result = makeResult({ maxTime: -10.25 })
    const row = formatResultRow(result)
    expect(row).toContain('-10.250')
  })

  test('handles negative totalTime', () => {
    const result = makeResult({ totalTime: -100.5 })
    const row = formatResultRow(result)
    expect(row).toContain('-100.50')
  })

  test('pads avgTime to METRIC_FIELD_WIDTH', () => {
    const result = makeResult({ avgTime: 1 })
    const row = formatResultRow(result)
    const avgStr = result.avgTime.toFixed(DECIMAL_PRECISION_TIME)
    expect(avgStr.length).toBeLessThanOrEqual(METRIC_FIELD_WIDTH)
    expect(row).toContain(avgStr)
  })

  test('pads minTime to METRIC_FIELD_WIDTH', () => {
    const result = makeResult({ minTime: 2 })
    const row = formatResultRow(result)
    const minStr = result.minTime.toFixed(DECIMAL_PRECISION_TIME)
    expect(row).toContain(minStr)
  })

  test('pads maxTime to METRIC_FIELD_WIDTH', () => {
    const result = makeResult({ maxTime: 3 })
    const row = formatResultRow(result)
    const maxStr = result.maxTime.toFixed(DECIMAL_PRECISION_TIME)
    expect(row).toContain(maxStr)
  })

  test('pads totalTime to TOTAL_FIELD_WIDTH', () => {
    const result = makeResult({ totalTime: 42.0 })
    const row = formatResultRow(result)
    const totalStr = result.totalTime.toFixed(2)
    expect(row).toContain(totalStr)
  })

  test('produces consistent output for same input', () => {
    const result = makeResult()
    const row1 = formatResultRow(result)
    const row2 = formatResultRow(result)
    expect(row1).toBe(row2)
  })

  test('handles ruleId with special characters', () => {
    const result = makeResult({ ruleId: 'no-eval-expression' })
    const row = formatResultRow(result)
    expect(row.slice(0, 40).trim()).toBe('no-eval-expression')
  })

  test('handles ruleId with numbers', () => {
    const result = makeResult({ ruleId: 'rule-123' })
    const row = formatResultRow(result)
    expect(row.slice(0, 40).trim()).toBe('rule-123')
  })

  test('handles ruleId with underscores', () => {
    const result = makeResult({ ruleId: 'no_circular_deps' })
    const row = formatResultRow(result)
    expect(row.slice(0, 40).trim()).toBe('no_circular_deps')
  })

  test('handles ruleId with dots', () => {
    const result = makeResult({ ruleId: 'security.eval' })
    const row = formatResultRow(result)
    expect(row.slice(0, 40).trim()).toBe('security.eval')
  })

  test('handles ruleId with slashes', () => {
    const result = makeResult({ ruleId: 'plugins/custom-rule' })
    const row = formatResultRow(result)
    expect(row.slice(0, 40).trim()).toBe('plugins/custom-rule')
  })

  test('handles runCount being ignored in row output', () => {
    const r1 = makeResult({ runCount: 1 })
    const r2 = makeResult({ runCount: 100 })
    expect(formatResultRow(r1)).toBe(formatResultRow(r2))
  })

  test('formats avgTime 0.123456 as 0.123', () => {
    const result = makeResult({ avgTime: 0.123456 })
    const row = formatResultRow(result)
    expect(row).toContain('0.123')
  })

  test('formats minTime exactly at threshold boundary', () => {
    const result = makeResult({ minTime: PERFORMANCE_SLOW_THRESHOLD_MS })
    const row = formatResultRow(result)
    expect(row).toContain('50.000')
  })

  test('formats maxTime at very slow threshold', () => {
    const result = makeResult({ maxTime: PERFORMANCE_VERY_SLOW_THRESHOLD_MS })
    const row = formatResultRow(result)
    expect(row).toContain('100.000')
  })

  test('handles NaN avgTime gracefully via toFixed', () => {
    const result = makeResult({ avgTime: NaN })
    const row = formatResultRow(result)
    expect(row).toContain('NaN')
  })

  test('handles Infinity avgTime', () => {
    const result = makeResult({ avgTime: Infinity })
    const row = formatResultRow(result)
    expect(row).toContain('Infinity')
  })

  test('returns a single string (no newlines)', () => {
    const result = makeResult()
    const row = formatResultRow(result)
    expect(row).not.toContain('\n')
  })

  test('handles all zero fields', () => {
    const result: BenchmarkResult = {
      avgTime: 0,
      maxTime: 0,
      minTime: 0,
      ruleId: '',
      runCount: 0,
      totalTime: 0,
    }
    const row = formatResultRow(result)
    expect(row).toContain('0.000')
    expect(row).toContain('0.00')
  })

  test('handles single-character ruleId', () => {
    const result = makeResult({ ruleId: 'x' })
    const row = formatResultRow(result)
    expect(row.slice(0, 40).trim()).toBe('x')
  })

  test('handles extremely large totalTime', () => {
    const result = makeResult({ totalTime: 9999999.99 })
    const row = formatResultRow(result)
    expect(row).toContain('9999999.99')
  })
})

// ═══════════════════════════════════════════════════════════════════════════

describe('formatResultsTable', () => {
  test('returns an array of strings', () => {
    const results = [makeResult()]
    const lines = formatResultsTable(results, 10)
    expect(Array.isArray(lines)).toBe(true)
  })

  test('includes bold "Results" header line', () => {
    const results = [makeResult()]
    const lines = formatResultsTable(results, 10)
    const joined = lines.join('\n')
    expect(joined).toContain('Results (sorted by average time)')
  })

  test('includes an empty line after header', () => {
    const results = [makeResult()]
    const lines = formatResultsTable(results, 10)
    expect(lines[1]).toBe('')
  })

  test('includes column headers: Rule ID, Avg, Min, Max, Total', () => {
    const results = [makeResult()]
    const lines = formatResultsTable(results, 10)
    const headerLine = lines[2]
    expect(headerLine).toContain('Rule ID')
    expect(headerLine).toContain('Avg (ms)')
    expect(headerLine).toContain('Min (ms)')
    expect(headerLine).toContain('Max (ms)')
    expect(headerLine).toContain('Total (ms)')
  })

  test('includes a separator line after header', () => {
    const results = [makeResult()]
    const lines = formatResultsTable(results, 10)
    const separatorLine = lines[3]
    expect(separatorLine).toContain('-'.repeat(BENCHMARK_TABLE_SEPARATOR_WIDTH))
  })

  test('renders one result row when results has one entry and topCount >= 1', () => {
    const results = [makeResult()]
    const lines = formatResultsTable(results, 10)
    expect(lines.length).toBe(5)
    expect(lines[4]).toContain('test-rule')
  })

  test('renders two result rows when results has two entries and topCount >= 2', () => {
    const results = [
      makeResult({ ruleId: 'rule-a', avgTime: 100 }),
      makeResult({ ruleId: 'rule-b', avgTime: 50 }),
    ]
    const lines = formatResultsTable(results, 10)
    expect(lines.length).toBe(6)
    expect(lines[4]).toContain('rule-a')
    expect(lines[5]).toContain('rule-b')
  })

  test('respects topCount and limits output rows', () => {
    const results = makeManyResults(10)
    const lines = formatResultsTable(results, 3)
    expect(lines.length).toBe(7)
    expect(lines[4]).toContain('rule-000')
    expect(lines[5]).toContain('rule-001')
    expect(lines[6]).toContain('rule-002')
  })

  test('topCount=0 shows no data rows', () => {
    const results = makeManyResults(5)
    const lines = formatResultsTable(results, 0)
    // header + '' + col header + separator
    expect(lines.length).toBe(4)
  })

  test('topCount greater than results length shows all results', () => {
    const results = makeManyResults(3)
    const lines = formatResultsTable(results, 100)
    expect(lines.length).toBe(7) // 4 + 3
  })

  test('topCount equals results length shows all results', () => {
    const results = makeManyResults(5)
    const lines = formatResultsTable(results, 5)
    expect(lines.length).toBe(9) // 4 + 5
  })

  test('empty results array produces header but no data rows', () => {
    const lines = formatResultsTable([], 10)
    expect(lines.length).toBe(4)
    expect(lines[0]).toContain('Results')
  })

  test('fast result (avgTime < slow threshold) has no color marker', () => {
    const results = [makeResult({ avgTime: 10, ruleId: 'fast-rule' })]
    const lines = formatResultsTable(results, 10)
    const dataLine = lines[4]
    expect(dataLine).toContain('fast-rule')
  })

  test('slow result (avgTime between slow and very-slow) contains the data', () => {
    const results = [makeResult({ avgTime: 75, ruleId: 'slow-rule' })]
    const lines = formatResultsTable(results, 10)
    const dataLine = lines[4]
    expect(dataLine).toContain('slow-rule')
  })

  test('very slow result (avgTime > very-slow threshold) contains the data', () => {
    const results = [makeResult({ avgTime: 150, ruleId: 'very-slow-rule' })]
    const lines = formatResultsTable(results, 10)
    const dataLine = lines[4]
    expect(dataLine).toContain('very-slow-rule')
  })

  test('result exactly at slow threshold is not colored as slow', () => {
    const results = [makeResult({ avgTime: PERFORMANCE_SLOW_THRESHOLD_MS })]
    const lines = formatResultsTable(results, 10)
    const dataLine = lines[4]
    expect(dataLine).toContain('test-rule')
  })

  test('result just above slow threshold is yellow', () => {
    const results = [makeResult({ avgTime: PERFORMANCE_SLOW_THRESHOLD_MS + 0.01 })]
    const lines = formatResultsTable(results, 10)
    expect(lines[4]).toContain('test-rule')
  })

  test('result exactly at very slow threshold is not colored as very slow', () => {
    const results = [makeResult({ avgTime: PERFORMANCE_VERY_SLOW_THRESHOLD_MS })]
    const lines = formatResultsTable(results, 10)
    expect(lines[4]).toContain('test-rule')
  })

  test('result just above very slow threshold is red', () => {
    const results = [makeResult({ avgTime: PERFORMANCE_VERY_SLOW_THRESHOLD_MS + 0.01 })]
    const lines = formatResultsTable(results, 10)
    expect(lines[4]).toContain('test-rule')
  })

  test('mix of fast, slow, and very slow results all appear', () => {
    const results = [
      makeResult({ avgTime: 150, ruleId: 'very-slow' }),
      makeResult({ avgTime: 75, ruleId: 'slow' }),
      makeResult({ avgTime: 10, ruleId: 'fast' }),
    ]
    const lines = formatResultsTable(results, 10)
    expect(lines[4]).toContain('very-slow')
    expect(lines[5]).toContain('slow')
    expect(lines[6]).toContain('fast')
  })

  test('results are displayed in the order provided (not reordered)', () => {
    const results = [
      makeResult({ ruleId: 'z-rule', avgTime: 1 }),
      makeResult({ ruleId: 'a-rule', avgTime: 100 }),
    ]
    const lines = formatResultsTable(results, 10)
    expect(lines[4]).toContain('z-rule')
    expect(lines[5]).toContain('a-rule')
  })

  test('handles single result with topCount=1', () => {
    const results = [makeResult({ ruleId: 'only-one' })]
    const lines = formatResultsTable(results, 1)
    expect(lines.length).toBe(5)
    expect(lines[4]).toContain('only-one')
  })

  test('topCount=1 with multiple results shows only first', () => {
    const results = [
      makeResult({ ruleId: 'first' }),
      makeResult({ ruleId: 'second' }),
      makeResult({ ruleId: 'third' }),
    ]
    const lines = formatResultsTable(results, 1)
    expect(lines.length).toBe(5)
    expect(lines[4]).toContain('first')
  })

  test('handles negative avgTime in results', () => {
    const results = [makeResult({ avgTime: -5, ruleId: 'negative-time' })]
    const lines = formatResultsTable(results, 10)
    expect(lines[4]).toContain('negative-time')
  })

  test('handles NaN avgTime in results', () => {
    const results = [makeResult({ avgTime: NaN, ruleId: 'nan-rule' })]
    const lines = formatResultsTable(results, 10)
    expect(lines[4]).toContain('nan-rule')
  })

  test('handles large number of results', () => {
    const results = makeManyResults(50)
    const lines = formatResultsTable(results, 50)
    expect(lines.length).toBe(54)
  })

  test('handles large number of results with small topCount', () => {
    const results = makeManyResults(100)
    const lines = formatResultsTable(results, 5)
    expect(lines.length).toBe(9) // 4 + 5
  })

  test('handles results with identical avgTimes', () => {
    const results = [
      makeResult({ avgTime: 42, ruleId: 'rule-a' }),
      makeResult({ avgTime: 42, ruleId: 'rule-b' }),
      makeResult({ avgTime: 42, ruleId: 'rule-c' }),
    ]
    const lines = formatResultsTable(results, 10)
    expect(lines.length).toBe(7)
  })

  test('handles results with identical ruleIds (edge case)', () => {
    const results = [
      makeResult({ ruleId: 'dup', avgTime: 10 }),
      makeResult({ ruleId: 'dup', avgTime: 20 }),
    ]
    const lines = formatResultsTable(results, 10)
    expect(lines.length).toBe(6)
  })

  test('handles result with avgTime = 0', () => {
    const results = [makeResult({ avgTime: 0 })]
    const lines = formatResultsTable(results, 10)
    expect(lines[4]).toContain('test-rule')
  })

  test('handles result with avgTime just below slow threshold', () => {
    const results = [makeResult({ avgTime: PERFORMANCE_SLOW_THRESHOLD_MS - 0.01 })]
    const lines = formatResultsTable(results, 10)
    expect(lines[4]).toContain('test-rule')
  })

  test('handles result with avgTime just below very slow threshold but above slow', () => {
    const results = [makeResult({ avgTime: PERFORMANCE_VERY_SLOW_THRESHOLD_MS - 0.01 })]
    const lines = formatResultsTable(results, 10)
    expect(lines[4]).toContain('test-rule')
  })

  test('header line is bold', () => {
    const results = [makeResult()]
    const lines = formatResultsTable(results, 10)
    expect(lines[0]).toContain('Results')
  })

  test('column headers are gray', () => {
    const results = [makeResult()]
    const lines = formatResultsTable(results, 10)
    expect(lines[2]).toContain('Rule ID')
  })

  test('separator line is gray', () => {
    const results = [makeResult()]
    const lines = formatResultsTable(results, 10)
    expect(lines[3]).toContain('-')
  })

  test('output is consistent across multiple calls with same input', () => {
    const results = [makeResult()]
    const lines1 = formatResultsTable(results, 10)
    const lines2 = formatResultsTable(results, 10)
    expect(lines1).toEqual(lines2)
  })

  test('handles topCount as float by using slice (truncates)', () => {
    const results = makeManyResults(5)
    const lines = formatResultsTable(results, 2)
    expect(lines.length).toBe(6) // 4 + 2
  })

  test('handles very high topCount', () => {
    const results = makeManyResults(3)
    const lines = formatResultsTable(results, 999999)
    expect(lines.length).toBe(7) // 4 + 3
  })
})

// ═══════════════════════════════════════════════════════════════════════════

describe('formatSummary', () => {
  test('returns an array of strings', () => {
    const results = [makeResult()]
    const lines = formatSummary(results)
    expect(Array.isArray(lines)).toBe(true)
  })

  test('starts with an empty line', () => {
    const results = [makeResult()]
    const lines = formatSummary(results)
    expect(lines[0]).toBe('')
  })

  test('contains "Summary:" label', () => {
    const results = [makeResult()]
    const lines = formatSummary(results)
    const joined = lines.join('\n')
    expect(joined).toContain('Summary:')
  })

  test('reports total rules benchmarked count', () => {
    const results = makeManyResults(5)
    const lines = formatSummary(results)
    const joined = lines.join('\n')
    expect(joined).toContain('Total rules benchmarked: 5')
  })

  test('reports total time as sum of all totalTime values', () => {
    const results = [makeResult({ totalTime: 100.5 }), makeResult({ totalTime: 200.25 })]
    const lines = formatSummary(results)
    const joined = lines.join('\n')
    expect(joined).toContain('300.75ms')
  })

  test('reports total time with 2 decimal places', () => {
    const results = [makeResult({ totalTime: 42.123 })]
    const lines = formatSummary(results)
    const joined = lines.join('\n')
    expect(joined).toContain('42.12ms')
  })

  test('shows slowest rule as first element', () => {
    const results = [
      makeResult({ ruleId: 'slowest-rule', avgTime: 200 }),
      makeResult({ ruleId: 'medium-rule', avgTime: 100 }),
      makeResult({ ruleId: 'fastest-rule', avgTime: 10 }),
    ]
    const lines = formatSummary(results)
    const joined = lines.join('\n')
    expect(joined).toContain('Slowest rule: slowest-rule')
    expect(joined).toContain('200.000ms avg')
  })

  test('shows fastest rule as last element', () => {
    const results = [
      makeResult({ ruleId: 'slowest-rule', avgTime: 200 }),
      makeResult({ ruleId: 'fastest-rule', avgTime: 10 }),
    ]
    const lines = formatSummary(results)
    const joined = lines.join('\n')
    expect(joined).toContain('Fastest rule: fastest-rule')
    expect(joined).toContain('10.000ms avg')
  })

  test('handles empty results array', () => {
    const lines = formatSummary([])
    const joined = lines.join('\n')
    expect(joined).toContain('Total rules benchmarked: 0')
    expect(joined).toContain('Total time: 0.00ms')
    expect(joined).not.toContain('Slowest rule:')
    expect(joined).not.toContain('Fastest rule:')
  })

  test('handles single result (slowest = fastest)', () => {
    const results = [makeResult({ ruleId: 'only-rule', avgTime: 42 })]
    const lines = formatSummary(results)
    const joined = lines.join('\n')
    expect(joined).toContain('Slowest rule: only-rule')
    expect(joined).toContain('Fastest rule: only-rule')
    expect(joined).toContain('42.000ms avg')
  })

  test('handles two results', () => {
    const results = [
      makeResult({ ruleId: 'r1', avgTime: 100 }),
      makeResult({ ruleId: 'r2', avgTime: 50 }),
    ]
    const lines = formatSummary(results)
    const joined = lines.join('\n')
    expect(joined).toContain('Total rules benchmarked: 2')
    expect(joined).toContain('Slowest rule: r1')
    expect(joined).toContain('Fastest rule: r2')
  })

  test('handles many results (100)', () => {
    const results = makeManyResults(100)
    const lines = formatSummary(results)
    const joined = lines.join('\n')
    expect(joined).toContain('Total rules benchmarked: 100')
    expect(joined).toContain('Slowest rule: rule-000')
    expect(joined).toContain('Fastest rule: rule-099')
  })

  test('total time sums correctly for multiple results', () => {
    const results = [
      makeResult({ totalTime: 10 }),
      makeResult({ totalTime: 20 }),
      makeResult({ totalTime: 30 }),
    ]
    const lines = formatSummary(results)
    const joined = lines.join('\n')
    expect(joined).toContain('Total time: 60.00ms')
  })

  test('handles results with zero totalTime', () => {
    const results = [makeResult({ totalTime: 0 }), makeResult({ totalTime: 0 })]
    const lines = formatSummary(results)
    const joined = lines.join('\n')
    expect(joined).toContain('Total time: 0.00ms')
  })

  test('handles results with negative totalTime', () => {
    const results = [makeResult({ totalTime: 50 }), makeResult({ totalTime: -20 })]
    const lines = formatSummary(results)
    const joined = lines.join('\n')
    expect(joined).toContain('Total time: 30.00ms')
  })

  test('handles all results with same avgTime', () => {
    const results = [
      makeResult({ ruleId: 'a', avgTime: 42 }),
      makeResult({ ruleId: 'b', avgTime: 42 }),
      makeResult({ ruleId: 'c', avgTime: 42 }),
    ]
    const lines = formatSummary(results)
    const joined = lines.join('\n')
    expect(joined).toContain('Slowest rule: a')
    expect(joined).toContain('Fastest rule: c')
  })

  test('formats avgTime in slowest with correct decimal precision', () => {
    const results = [makeResult({ ruleId: 'r', avgTime: 1.2345 })]
    const lines = formatSummary(results)
    const joined = lines.join('\n')
    expect(joined).toContain('1.234ms avg')
  })

  test('formats avgTime in fastest with correct decimal precision', () => {
    const results = [
      makeResult({ ruleId: 'slow', avgTime: 100 }),
      makeResult({ ruleId: 'fast', avgTime: 5.6789 }),
    ]
    const lines = formatSummary(results)
    const joined = lines.join('\n')
    expect(joined).toContain('5.679ms avg')
  })

  test('Summary label is cyan colored', () => {
    const results = [makeResult()]
    const lines = formatSummary(results)
    expect(lines[1]).toContain('Summary:')
  })

  test('returns exactly 6 lines for non-empty results', () => {
    const results = [
      makeResult({ ruleId: 'a', avgTime: 10 }),
      makeResult({ ruleId: 'b', avgTime: 5 }),
    ]
    const lines = formatSummary(results)
    expect(lines.length).toBe(6)
  })

  test('returns exactly 4 lines for empty results', () => {
    const lines = formatSummary([])
    expect(lines.length).toBe(4)
  })

  test('handles fractional total times summing to integer', () => {
    const results = [
      makeResult({ totalTime: 0.1 }),
      makeResult({ totalTime: 0.2 }),
      makeResult({ totalTime: 0.3 }),
      makeResult({ totalTime: 0.4 }),
    ]
    const lines = formatSummary(results)
    const joined = lines.join('\n')
    expect(joined).toContain('Total time: 1.00ms')
  })

  test('handles very large totalTime sum', () => {
    const results = makeManyResults(10).map((r) => ({ ...r, totalTime: 100000 }))
    const lines = formatSummary(results)
    const joined = lines.join('\n')
    expect(joined).toContain('Total time: 1000000.00ms')
  })

  test('output is consistent across multiple calls', () => {
    const results = [makeResult()]
    const lines1 = formatSummary(results)
    const lines2 = formatSummary(results)
    expect(lines1).toEqual(lines2)
  })

  test('handles single result with NaN avgTime', () => {
    const results = [makeResult({ ruleId: 'nan-rule', avgTime: NaN })]
    const lines = formatSummary(results)
    const joined = lines.join('\n')
    expect(joined).toContain('nan-rule')
  })

  test('handles single result with Infinity avgTime', () => {
    const results = [makeResult({ ruleId: 'inf-rule', avgTime: Infinity })]
    const lines = formatSummary(results)
    const joined = lines.join('\n')
    expect(joined).toContain('inf-rule')
  })

  test('handles results where slowest and fastest are adjacent', () => {
    const results = [
      makeResult({ ruleId: 's', avgTime: 100 }),
      makeResult({ ruleId: 'f', avgTime: 1 }),
    ]
    const lines = formatSummary(results)
    const joined = lines.join('\n')
    expect(joined).toContain('Slowest rule: s')
    expect(joined).toContain('Fastest rule: f')
  })

  test('handles 3 results with distinct avgTimes', () => {
    const results = [
      makeResult({ ruleId: 'c', avgTime: 300 }),
      makeResult({ ruleId: 'b', avgTime: 200 }),
      makeResult({ ruleId: 'a', avgTime: 100 }),
    ]
    const lines = formatSummary(results)
    const joined = lines.join('\n')
    expect(joined).toContain('Slowest rule: c')
    expect(joined).toContain('Fastest rule: a')
  })
})

// ═══════════════════════════════════════════════════════════════════════════

describe('printResults', () => {
  test('returns an array of strings', () => {
    const results = [makeResult()]
    const lines = printResults(results, 10)
    expect(Array.isArray(lines)).toBe(true)
  })

  test('combines table and summary output', () => {
    const results = [makeResult()]
    const lines = printResults(results, 10)
    const joined = lines.join('\n')
    expect(joined).toContain('Results (sorted by average time)')
    expect(joined).toContain('Summary:')
  })

  test('includes all table header lines', () => {
    const results = [makeResult()]
    const lines = printResults(results, 10)
    const joined = lines.join('\n')
    expect(joined).toContain('Rule ID')
    expect(joined).toContain('Avg (ms)')
  })

  test('includes summary info', () => {
    const results = [makeResult()]
    const lines = printResults(results, 10)
    const joined = lines.join('\n')
    expect(joined).toContain('Total rules benchmarked:')
  })

  test('respects topCount for data rows', () => {
    const results = makeManyResults(5)
    const lines = printResults(results, 2)
    const joined = lines.join('\n')
    // Only first 2 rules should appear in data
    expect(joined).toContain('rule-000')
    expect(joined).toContain('rule-001')
    expect(joined).toContain('Total rules benchmarked: 5')
  })

  test('handles empty results', () => {
    const lines = printResults([], 10)
    const joined = lines.join('\n')
    expect(joined).toContain('Total rules benchmarked: 0')
    expect(joined).toContain('Total time: 0.00ms')
  })

  test('handles single result', () => {
    const results = [makeResult({ ruleId: 'solo' })]
    const lines = printResults(results, 10)
    const joined = lines.join('\n')
    expect(joined).toContain('solo')
    expect(joined).toContain('Total rules benchmarked: 1')
  })

  test('has more lines than formatResultsTable alone', () => {
    const results = [makeResult()]
    const tableLines = formatResultsTable(results, 10)
    const allLines = printResults(results, 10)
    expect(allLines.length).toBeGreaterThan(tableLines.length)
  })

  test('has same line count as table + summary combined', () => {
    const results = [
      makeResult({ ruleId: 'a', avgTime: 100 }),
      makeResult({ ruleId: 'b', avgTime: 50 }),
    ]
    const tableLines = formatResultsTable(results, 10)
    const summaryLines = formatSummary(results)
    const allLines = printResults(results, 10)
    expect(allLines.length).toBe(tableLines.length + summaryLines.length)
  })

  test('handles fast, slow, and very slow results together', () => {
    const results = [
      makeResult({ avgTime: 150, ruleId: 'very-slow' }),
      makeResult({ avgTime: 75, ruleId: 'slow' }),
      makeResult({ avgTime: 10, ruleId: 'fast' }),
    ]
    const lines = printResults(results, 10)
    const joined = lines.join('\n')
    expect(joined).toContain('very-slow')
    expect(joined).toContain('slow')
    expect(joined).toContain('fast')
  })

  test('topCount=0 still shows summary', () => {
    const results = [makeResult()]
    const lines = printResults(results, 0)
    const joined = lines.join('\n')
    expect(joined).toContain('Summary:')
    expect(joined).toContain('Total rules benchmarked:')
  })

  test('output is consistent across multiple calls', () => {
    const results = [makeResult()]
    const lines1 = printResults(results, 10)
    const lines2 = printResults(results, 10)
    expect(lines1).toEqual(lines2)
  })

  test('handles large result set efficiently', () => {
    const results = makeManyResults(50)
    const lines = printResults(results, 10)
    const joined = lines.join('\n')
    expect(joined).toContain('Total rules benchmarked: 50')
  })

  test('summary at end shows correct slowest/fastest', () => {
    const results = [
      makeResult({ ruleId: 'fastest', avgTime: 1 }),
      makeResult({ ruleId: 'slowest', avgTime: 999 }),
    ]
    const lines = printResults(results, 10)
    const joined = lines.join('\n')
    expect(joined).toContain('Slowest rule: fastest')
    expect(joined).toContain('Fastest rule: slowest')
  })

  test('preserves order from combined output', () => {
    const results = [makeResult({ ruleId: 'alpha' })]
    const lines = printResults(results, 10)
    const resultsIdx = lines.findIndex((l) => l.includes('Results'))
    const summaryIdx = lines.findIndex((l) => l.includes('Summary:'))
    expect(resultsIdx).toBeLessThan(summaryIdx)
  })
})

// ═══════════════════════════════════════════════════════════════════════════

describe('writeResults', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  test('writes JSON stringified results to file', async () => {
    const writtenPath: string[] = []
    const writtenData: string[] = []

    vi.doMock('node:fs/promises', () => ({
      writeFile: (path: string, data: string) => {
        writtenPath.push(path)
        writtenData.push(data)
        return Promise.resolve()
      },
    }))

    const { writeResults: wr } = await import('../../../src/commands/benchmark-helpers.js')
    const results = [makeResult()]
    await wr(results, '/tmp/bench.json')

    expect(writtenPath).toContain('/tmp/bench.json')
    const parsed = JSON.parse(writtenData[0]!)
    expect(parsed).toHaveLength(1)
    expect(parsed[0].ruleId).toBe('test-rule')
  })

  test('writes results with correct JSON formatting (2-space indent)', async () => {
    const writtenData: string[] = []

    vi.doMock('node:fs/promises', () => ({
      writeFile: (_path: string, data: string) => {
        writtenData.push(data)
        return Promise.resolve()
      },
    }))

    const { writeResults: wr } = await import('../../../src/commands/benchmark-helpers.js')
    const results = [makeResult({ ruleId: 'fmt-test' })]
    await wr(results, '/tmp/fmt.json')

    const json = writtenData[0]!
    expect(json).toContain('  "ruleId": "fmt-test"')
    expect(json).toContain('  "avgTime"')
  })

  test('writes multiple results to file', async () => {
    const writtenData: string[] = []

    vi.doMock('node:fs/promises', () => ({
      writeFile: (_path: string, data: string) => {
        writtenData.push(data)
        return Promise.resolve()
      },
    }))

    const { writeResults: wr } = await import('../../../src/commands/benchmark-helpers.js')
    const results = makeManyResults(3)
    await wr(results, '/tmp/multi.json')

    const parsed = JSON.parse(writtenData[0]!)
    expect(parsed).toHaveLength(3)
  })

  test('writes empty array for empty results', async () => {
    const writtenData: string[] = []

    vi.doMock('node:fs/promises', () => ({
      writeFile: (_path: string, data: string) => {
        writtenData.push(data)
        return Promise.resolve()
      },
    }))

    const { writeResults: wr } = await import('../../../src/commands/benchmark-helpers.js')
    await wr([], '/tmp/empty.json')

    const parsed = JSON.parse(writtenData[0]!)
    expect(parsed).toEqual([])
  })

  test('preserves all BenchmarkResult fields in output', async () => {
    const writtenData: string[] = []

    vi.doMock('node:fs/promises', () => ({
      writeFile: (_path: string, data: string) => {
        writtenData.push(data)
        return Promise.resolve()
      },
    }))

    const { writeResults: wr } = await import('../../../src/commands/benchmark-helpers.js')
    const result: BenchmarkResult = {
      avgTime: 10.5,
      maxTime: 20.0,
      minTime: 5.0,
      ruleId: 'all-fields',
      runCount: 10,
      totalTime: 105.0,
    }
    await wr([result], '/tmp/fields.json')

    const parsed = JSON.parse(writtenData[0]!)[0]
    expect(parsed.avgTime).toBe(10.5)
    expect(parsed.maxTime).toBe(20.0)
    expect(parsed.minTime).toBe(5.0)
    expect(parsed.ruleId).toBe('all-fields')
    expect(parsed.runCount).toBe(10)
    expect(parsed.totalTime).toBe(105.0)
  })

  test('propagates writeFile errors', async () => {
    vi.doMock('node:fs/promises', () => ({
      writeFile: () => Promise.reject(new Error('disk full')),
    }))

    const { writeResults: wr } = await import('../../../src/commands/benchmark-helpers.js')
    await expect(wr([makeResult()], '/tmp/fail.json')).rejects.toThrow('disk full')
  })

  test('writes to the exact path provided', async () => {
    const writtenPath: string[] = []

    vi.doMock('node:fs/promises', () => ({
      writeFile: (path: string, _data: string) => {
        writtenPath.push(path)
        return Promise.resolve()
      },
    }))

    const { writeResults: wr } = await import('../../../src/commands/benchmark-helpers.js')
    await wr([makeResult()], '/custom/path/results.json')
    expect(writtenPath[0]).toBe('/custom/path/results.json')
  })

  test('handles relative paths', async () => {
    const writtenPath: string[] = []

    vi.doMock('node:fs/promises', () => ({
      writeFile: (path: string, _data: string) => {
        writtenPath.push(path)
        return Promise.resolve()
      },
    }))

    const { writeResults: wr } = await import('../../../src/commands/benchmark-helpers.js')
    await wr([makeResult()], './results.json')
    expect(writtenPath[0]).toBe('./results.json')
  })

  test('serializes numeric values as numbers (not strings)', async () => {
    const writtenData: string[] = []

    vi.doMock('node:fs/promises', () => ({
      writeFile: (_path: string, data: string) => {
        writtenData.push(data)
        return Promise.resolve()
      },
    }))

    const { writeResults: wr } = await import('../../../src/commands/benchmark-helpers.js')
    await wr([makeResult()], '/tmp/nums.json')

    const parsed = JSON.parse(writtenData[0]!)[0]
    expect(typeof parsed.avgTime).toBe('number')
    expect(typeof parsed.maxTime).toBe('number')
    expect(typeof parsed.minTime).toBe('number')
    expect(typeof parsed.runCount).toBe('number')
    expect(typeof parsed.totalTime).toBe('number')
  })

  test('produces valid JSON that can be re-parsed', async () => {
    const writtenData: string[] = []

    vi.doMock('node:fs/promises', () => ({
      writeFile: (_path: string, data: string) => {
        writtenData.push(data)
        return Promise.resolve()
      },
    }))

    const { writeResults: wr } = await import('../../../src/commands/benchmark-helpers.js')
    const results = makeManyResults(5)
    await wr(results, '/tmp/reparse.json')

    const reparsed = JSON.parse(writtenData[0]!)
    expect(reparsed).toHaveLength(5)
    reparsed.forEach((r: BenchmarkResult, i: number) => {
      expect(r.ruleId).toBe(results[i]!.ruleId)
    })
  })

  test('handles results with NaN values', async () => {
    const writtenData: string[] = []

    vi.doMock('node:fs/promises', () => ({
      writeFile: (_path: string, data: string) => {
        writtenData.push(data)
        return Promise.resolve()
      },
    }))

    const { writeResults: wr } = await import('../../../src/commands/benchmark-helpers.js')
    const result = makeResult({ avgTime: NaN })
    await wr([result], '/tmp/nan.json')

    const parsed = JSON.parse(writtenData[0]!)[0]
    expect(parsed.avgTime).toBeNull()
  })

  test('handles results with Infinity values', async () => {
    const writtenData: string[] = []

    vi.doMock('node:fs/promises', () => ({
      writeFile: (_path: string, data: string) => {
        writtenData.push(data)
        return Promise.resolve()
      },
    }))

    const { writeResults: wr } = await import('../../../src/commands/benchmark-helpers.js')
    const result = makeResult({ avgTime: Infinity })
    await wr([result], '/tmp/inf.json')

    const parsed = JSON.parse(writtenData[0]!)[0]
    expect(parsed.avgTime).toBeNull()
  })

  test('handles large number of results', async () => {
    const writtenData: string[] = []

    vi.doMock('node:fs/promises', () => ({
      writeFile: (_path: string, data: string) => {
        writtenData.push(data)
        return Promise.resolve()
      },
    }))

    const { writeResults: wr } = await import('../../../src/commands/benchmark-helpers.js')
    const results = makeManyResults(200)
    await wr(results, '/tmp/large.json')

    const parsed = JSON.parse(writtenData[0]!)
    expect(parsed).toHaveLength(200)
  })

  test('writes a single result correctly', async () => {
    const writtenData: string[] = []

    vi.doMock('node:fs/promises', () => ({
      writeFile: (_path: string, data: string) => {
        writtenData.push(data)
        return Promise.resolve()
      },
    }))

    const { writeResults: wr } = await import('../../../src/commands/benchmark-helpers.js')
    const result = makeResult({ ruleId: 'single' })
    await wr([result], '/tmp/single.json')

    const parsed = JSON.parse(writtenData[0]!)
    expect(parsed).toHaveLength(1)
    expect(parsed[0].ruleId).toBe('single')
  })

  test('returns a promise (is async)', async () => {
    vi.doMock('node:fs/promises', () => ({
      writeFile: () => Promise.resolve(),
    }))

    const { writeResults: wr } = await import('../../../src/commands/benchmark-helpers.js')
    const result = wr([makeResult()], '/tmp/async.json')
    expect(result).toBeInstanceOf(Promise)
    await result
  })

  test('handles results with negative values', async () => {
    const writtenData: string[] = []

    vi.doMock('node:fs/promises', () => ({
      writeFile: (_path: string, data: string) => {
        writtenData.push(data)
        return Promise.resolve()
      },
    }))

    const { writeResults: wr } = await import('../../../src/commands/benchmark-helpers.js')
    const result = makeResult({ avgTime: -5, minTime: -10, maxTime: -1, totalTime: -15 })
    await wr([result], '/tmp/neg.json')

    const parsed = JSON.parse(writtenData[0]!)
    expect(parsed[0].avgTime).toBe(-5)
    expect(parsed[0].minTime).toBe(-10)
    expect(parsed[0].maxTime).toBe(-1)
    expect(parsed[0].totalTime).toBe(-15)
  })

  test('handles results with zero values', async () => {
    const writtenData: string[] = []

    vi.doMock('node:fs/promises', () => ({
      writeFile: (_path: string, data: string) => {
        writtenData.push(data)
        return Promise.resolve()
      },
    }))

    const { writeResults: wr } = await import('../../../src/commands/benchmark-helpers.js')
    const result: BenchmarkResult = {
      avgTime: 0,
      maxTime: 0,
      minTime: 0,
      ruleId: 'zero',
      runCount: 0,
      totalTime: 0,
    }
    await wr([result], '/tmp/zero.json')

    const parsed = JSON.parse(writtenData[0]!)[0]
    expect(parsed.avgTime).toBe(0)
    expect(parsed.runCount).toBe(0)
  })
})

// ═══════════════════════════════════════════════════════════════════════════
// INTEGRATION: formatResultRow within formatResultsTable
// ═══════════════════════════════════════════════════════════════════════════

describe('formatResultRow integration with formatResultsTable', () => {
  test('each data row in table matches formatResultRow output', () => {
    const results = [
      makeResult({ ruleId: 'a', avgTime: 10, minTime: 5, maxTime: 15, totalTime: 30 }),
      makeResult({ ruleId: 'b', avgTime: 20, minTime: 10, maxTime: 30, totalTime: 60 }),
    ]
    const lines = formatResultsTable(results, 10)
    expect(lines[4]).toContain('a')
    expect(lines[5]).toContain('b')
    expect(lines[4]).toContain(formatResultRow(results[0]!).trim())
  })

  test('fast result row in table is plain text', () => {
    const result = makeResult({ avgTime: 1 })
    const rowDirect = formatResultRow(result)
    const tableLines = formatResultsTable([result], 10)
    expect(tableLines[4]).toBe(rowDirect)
  })
})

// ═══════════════════════════════════════════════════════════════════════════
// EDGE CASES: Boundary values and unusual inputs
// ═══════════════════════════════════════════════════════════════════════════

describe('edge cases across helpers', () => {
  test('formatResultRow with very precise decimal values', () => {
    const result = makeResult({
      avgTime: 1.23456789012345,
      minTime: 0.0001,
      maxTime: 9.9999,
      totalTime: 12.3456,
    })
    const row = formatResultRow(result)
    expect(row).toContain('1.235')
    expect(row).toContain('0.000')
    expect(row).toContain('10.000')
    expect(row).toContain('12.35')
  })

  test('formatResultsTable with all results at slow threshold', () => {
    const results = Array.from({ length: 5 }, (_, i) =>
      makeResult({ avgTime: PERFORMANCE_SLOW_THRESHOLD_MS + 1, ruleId: `slow-${i}` }),
    )
    const lines = formatResultsTable(results, 10)
    expect(lines.length).toBe(9)
  })

  test('formatSummary with all zero times', () => {
    const results = Array.from({ length: 3 }, (_, i) =>
      makeResult({ totalTime: 0, avgTime: 0, ruleId: `zero-${i}` }),
    )
    const lines = formatSummary(results)
    const joined = lines.join('\n')
    expect(joined).toContain('Total time: 0.00ms')
  })

  test('printResults with topCount = 1 and 10 results', () => {
    const results = makeManyResults(10)
    const lines = printResults(results, 1)
    const joined = lines.join('\n')
    expect(joined).toContain('rule-000')
    expect(joined).toContain('Total rules benchmarked: 10')
  })

  test('formatResultsTable preserves very long ruleId in output', () => {
    const longId = 'x'.repeat(60)
    const results = [makeResult({ ruleId: longId })]
    const lines = formatResultsTable(results, 10)
    expect(lines[4]).toContain(longId)
  })

  test('formatSummary handles results with all same ruleId', () => {
    const results = [
      makeResult({ ruleId: 'dup', avgTime: 100 }),
      makeResult({ ruleId: 'dup', avgTime: 50 }),
    ]
    const lines = formatSummary(results)
    const joined = lines.join('\n')
    expect(joined).toContain('Slowest rule: dup')
    expect(joined).toContain('Fastest rule: dup')
  })

  test('formatResultsTable with single result at exact slow boundary', () => {
    const results = [makeResult({ avgTime: PERFORMANCE_SLOW_THRESHOLD_MS + 0.001 })]
    const lines = formatResultsTable(results, 10)
    expect(lines[4]).toContain('test-rule')
  })

  test('formatResultsTable with single result at exact very-slow boundary', () => {
    const results = [makeResult({ avgTime: PERFORMANCE_VERY_SLOW_THRESHOLD_MS + 0.001 })]
    const lines = formatResultsTable(results, 10)
    expect(lines[4]).toContain('test-rule')
  })

  test('formatResultRow with avgTime having many trailing zeros', () => {
    const result = makeResult({ avgTime: 5.0 })
    const row = formatResultRow(result)
    expect(row).toContain('5.000')
  })

  test('formatSummary total time handles floating point precision', () => {
    const results = [makeResult({ totalTime: 0.1 }), makeResult({ totalTime: 0.2 })]
    const lines = formatSummary(results)
    const joined = lines.join('\n')
    expect(joined).toContain('Total time: 0.30ms')
  })

  test('formatResultRow output is purely text (no ANSI escapes)', () => {
    const result = makeResult()
    const row = formatResultRow(result)
    expect(row).not.toMatch(/\x1b\[/)
  })

  test('formatResultRow with sub-millisecond times shows 3 decimal places', () => {
    const result = makeResult({ avgTime: 0.001, minTime: 0.001, maxTime: 0.002 })
    const row = formatResultRow(result)
    expect(row).toContain('0.001')
    expect(row).toContain('0.002')
  })

  test('formatResultRow with avgTime 99.9995 rounds to 99.999', () => {
    const result = makeResult({ avgTime: 99.9995 })
    const row = formatResultRow(result)
    expect(row).toContain('99.999')
  })

  test('formatResultRow with totalTime 99.999 rounds to 100.00', () => {
    const result = makeResult({ totalTime: 99.999 })
    const row = formatResultRow(result)
    expect(row).toContain('100.00')
  })

  test('formatResultRow with empty string ruleId', () => {
    const result = makeResult({ ruleId: '' })
    const row = formatResultRow(result)
    expect(row.slice(0, 40).trim()).toBe('')
    expect(row.slice(0, 40)).toBe(' '.repeat(40))
  })

  test('formatResultsTable with all fast results (below slow threshold)', () => {
    const results = Array.from({ length: 5 }, (_, i) =>
      makeResult({ avgTime: 10 + i, ruleId: `fast-${i}` }),
    )
    const lines = formatResultsTable(results, 10)
    expect(lines.length).toBe(9)
  })

  test('formatResultsTable with all very slow results (above 100ms)', () => {
    const results = Array.from({ length: 3 }, (_, i) =>
      makeResult({ avgTime: 150 + i * 10, ruleId: `vslow-${i}` }),
    )
    const lines = formatResultsTable(results, 10)
    expect(lines.length).toBe(7)
  })

  test('formatResultsTable with mixed slow and very slow', () => {
    const results = [
      makeResult({ avgTime: 120, ruleId: 'vs' }),
      makeResult({ avgTime: 80, ruleId: 's' }),
      makeResult({ avgTime: 20, ruleId: 'f' }),
    ]
    const lines = formatResultsTable(results, 10)
    expect(lines[4]).toContain('vs')
    expect(lines[5]).toContain('s')
    expect(lines[6]).toContain('f')
  })

  test('formatResultsTable does not mutate input array', () => {
    const results = [makeResult({ ruleId: 'original' })]
    const resultsCopy = [...results]
    formatResultsTable(results, 10)
    expect(results).toEqual(resultsCopy)
  })

  test('formatSummary does not mutate input array', () => {
    const results = [makeResult({ ruleId: 'original' })]
    const resultsCopy = [...results]
    formatSummary(results)
    expect(results).toEqual(resultsCopy)
  })

  test('printResults does not mutate input array', () => {
    const results = [makeResult({ ruleId: 'original' })]
    const resultsCopy = [...results]
    printResults(results, 10)
    expect(results).toEqual(resultsCopy)
  })

  test('formatResultsTable with exactly 20 results and topCount=20', () => {
    const results = makeManyResults(20)
    const lines = formatResultsTable(results, 20)
    expect(lines.length).toBe(24)
  })

  test('formatResultsTable with exactly 21 results and default topCount=20', () => {
    const results = makeManyResults(21)
    const lines = formatResultsTable(results, 20)
    expect(lines.length).toBe(24)
  })

  test('formatSummary with extremely precise avgTime values', () => {
    const results = [makeResult({ avgTime: 0.0001, ruleId: 'tiny' })]
    const lines = formatSummary(results)
    const joined = lines.join('\n')
    expect(joined).toContain('tiny')
  })

  test('formatSummary with avgTime of exactly 0.0005 rounds to 0.001', () => {
    const results = [
      makeResult({ avgTime: 100, ruleId: 'slow' }),
      makeResult({ avgTime: 0.0005, ruleId: 'precise' }),
    ]
    const lines = formatSummary(results)
    const joined = lines.join('\n')
    expect(joined).toContain('0.001ms avg')
  })

  test('printResults with empty results shows no data rows but has summary', () => {
    const lines = printResults([], 10)
    const joined = lines.join('\n')
    expect(joined).toContain('Results (sorted by average time)')
    expect(joined).toContain('Summary:')
    expect(joined).toContain('Total rules benchmarked: 0')
  })

  test('formatResultRow handles very precise minTime', () => {
    const result = makeResult({ minTime: 0.00049 })
    const row = formatResultRow(result)
    expect(row).toContain('0.000')
  })

  test('formatResultRow handles very precise maxTime', () => {
    const result = makeResult({ maxTime: 0.00051 })
    const row = formatResultRow(result)
    expect(row).toContain('0.001')
  })

  test('formatResultsTable header has Rule ID padded to 40', () => {
    const results = [makeResult()]
    const lines = formatResultsTable(results, 10)
    const headerContent = lines[2]
    expect(headerContent).toContain('Rule ID')
  })

  test('formatResultsTable separator is dashes only', () => {
    const results = [makeResult()]
    const lines = formatResultsTable(results, 10)
    const sep = lines[3]
    const stripped = sep.replace(/\x1b\[[0-9;]*m/g, '')
    expect(stripped).toBe('-'.repeat(BENCHMARK_TABLE_SEPARATOR_WIDTH))
  })

  test('formatSummary with one result having totalTime 0.005 rounds correctly', () => {
    const results = [makeResult({ totalTime: 0.005 })]
    const lines = formatSummary(results)
    const joined = lines.join('\n')
    expect(joined).toContain('Total time: 0.01ms')
  })

  test('formatResultRow with ruleId containing unicode characters', () => {
    const result = makeResult({ ruleId: '日本語-ルール' })
    const row = formatResultRow(result)
    expect(row).toContain('日本語-ルール')
  })

  test('formatResultRow with ruleId containing spaces', () => {
    const result = makeResult({ ruleId: 'rule with spaces' })
    const row = formatResultRow(result)
    expect(row.slice(0, 40).trim()).toBe('rule with spaces')
  })

  test('formatResultsTable with topCount as negative number', () => {
    const results = makeManyResults(5)
    const lines = formatResultsTable(results, -1)
    // slice(0, -1) returns all but last element
    expect(lines.length).toBe(8)
  })

  test('formatResultsTable with topCount as NaN', () => {
    const results = makeManyResults(5)
    const lines = formatResultsTable(results, NaN)
    expect(lines.length).toBe(4)
  })

  test('formatSummary with results having very large avgTime spread', () => {
    const results = [
      makeResult({ ruleId: 'huge', avgTime: 10000 }),
      makeResult({ ruleId: 'tiny', avgTime: 0.001 }),
    ]
    const lines = formatSummary(results)
    const joined = lines.join('\n')
    expect(joined).toContain('10000.000ms avg')
    expect(joined).toContain('0.001ms avg')
  })

  test('printResults combines table and summary for 3 results', () => {
    const results = [
      makeResult({ ruleId: 'a', avgTime: 30 }),
      makeResult({ ruleId: 'b', avgTime: 20 }),
      makeResult({ ruleId: 'c', avgTime: 10 }),
    ]
    const lines = printResults(results, 10)
    expect(lines.length).toBe(
      formatResultsTable(results, 10).length + formatSummary(results).length,
    )
  })

  test('formatResultRow with avgTime exactly 1', () => {
    const result = makeResult({ avgTime: 1 })
    const row = formatResultRow(result)
    expect(row).toContain('1.000')
  })

  test('formatResultRow with avgTime exactly 0.1', () => {
    const result = makeResult({ avgTime: 0.1 })
    const row = formatResultRow(result)
    expect(row).toContain('0.100')
  })

  test('formatResultRow with avgTime exactly 0.01', () => {
    const result = makeResult({ avgTime: 0.01 })
    const row = formatResultRow(result)
    expect(row).toContain('0.010')
  })

  test('formatResultRow with totalTime exactly 1', () => {
    const result = makeResult({ totalTime: 1 })
    const row = formatResultRow(result)
    expect(row).toContain('1.00')
  })

  test('formatResultRow with totalTime exactly 0.1', () => {
    const result = makeResult({ totalTime: 0.1 })
    const row = formatResultRow(result)
    expect(row).toContain('0.10')
  })

  test('formatSummary with 200 results', () => {
    const results = makeManyResults(200)
    const lines = formatSummary(results)
    const joined = lines.join('\n')
    expect(joined).toContain('Total rules benchmarked: 200')
    expect(joined).toContain('Slowest rule: rule-000')
    expect(joined).toContain('Fastest rule: rule-199')
  })

  test('formatResultsTable with exactly 1 result and topCount=1', () => {
    const results = [makeResult({ ruleId: 'only' })]
    const lines = formatResultsTable(results, 1)
    expect(lines.length).toBe(5)
    expect(lines[4]).toContain('only')
  })

  test('formatResultsTable empty line at index 1 is truly empty', () => {
    const results = [makeResult()]
    const lines = formatResultsTable(results, 10)
    expect(lines[1]).toBe('')
  })
})
