import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import { ConsoleReporter } from '../../../src/reporters/console-reporter.js'
import type {
  AnalysisResult,
  Violation,
  FileAnalysisResult,
  ReporterOptions,
} from '../../../src/reporters/types.js'

// ANSI codes for color testing
const ANSI = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
}

// Helper to create mock violation
function createMockViolation(overrides: Partial<Violation> = {}): Violation {
  return {
    ruleId: 'test-rule',
    severity: 'error',
    message: 'Test violation message',
    filePath: 'test.ts',
    line: 10,
    column: 5,
    ...overrides,
  }
}

// Helper to create mock file result
function createMockFileResult(
  filePath: string,
  violations: Violation[] = [],
  stats: FileAnalysisResult['stats'] = { parseTime: 10, analysisTime: 20, totalTime: 30 },
): FileAnalysisResult {
  return {
    filePath,
    violations,
    stats,
  }
}

// Helper to create mock summary
function createMockSummary(
  overrides: Partial<AnalysisResult['summary']> = {},
): AnalysisResult['summary'] {
  return {
    totalFiles: 1,
    filesWithViolations: 0,
    errorCount: 0,
    warningCount: 0,
    infoCount: 0,
    totalTime: 50,
    ...overrides,
  }
}

// Helper to get logged output as string array
function getOutput(spy: ReturnType<typeof vi.spyOn>): string[] {
  return spy.mock.calls.map((call) => call[0]) as string[]
}

// Helper to check if text appears in logged output
function hasText(spy: ReturnType<typeof vi.spyOn>, text: string): boolean {
  return getOutput(spy).some((c) => typeof c === 'string' && c.includes(text))
}

// Helper to create mock analysis result
function createMockAnalysisResult(overrides: Partial<AnalysisResult> = {}): AnalysisResult {
  return {
    files: [],
    summary: {
      totalFiles: 0,
      filesWithViolations: 0,
      errorCount: 0,
      warningCount: 0,
      infoCount: 0,
      totalTime: 100,
    },
    timestamp: '2024-01-15T10:00:00.000Z',
    ...overrides,
  }
}

describe('ConsoleReporter', () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(() => {
    consoleSpy.mockRestore()
    vi.clearAllMocks()
  })

  describe('constructor', () => {
    test('should initialize with default options', () => {
      const reporter = new ConsoleReporter()
      expect(reporter.name).toBe('console')
    })

    test('should accept color option as true', () => {
      const reporter = new ConsoleReporter({ color: true })
      const violation = createMockViolation()
      const output = reporter.format(violation)
      expect(output).toContain(ANSI.red)
    })

    test('should accept color option as false', () => {
      const reporter = new ConsoleReporter({ color: false })
      const violation = createMockViolation()
      const output = reporter.format(violation)
      expect(output).not.toContain(ANSI.red)
    })

    test('should accept quiet option', () => {
      const reporter = new ConsoleReporter({ quiet: true, color: false })
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [createMockViolation()])],
        summary: {
          totalFiles: 1,
          filesWithViolations: 1,
          errorCount: 1,
          warningCount: 0,
          infoCount: 0,
          totalTime: 50,
        },
      })
      reporter.report(results)
      expect(consoleSpy).toHaveBeenCalled()
    })

    test('should accept verbose option', () => {
      const reporter = new ConsoleReporter({ verbose: true, color: false })
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [createMockViolation()])],
        summary: {
          totalFiles: 1,
          filesWithViolations: 1,
          errorCount: 1,
          warningCount: 0,
          infoCount: 0,
          totalTime: 50,
        },
      })
      reporter.report(results)
      expect(consoleSpy).toHaveBeenCalled()
    })

    test('should accept includeSource option', () => {
      const reporter = new ConsoleReporter({ includeSource: false, color: false })
      const violationWithSource = createMockViolation({ source: 'const x = 1;' })
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [violationWithSource])],
        summary: {
          totalFiles: 1,
          filesWithViolations: 1,
          errorCount: 1,
          warningCount: 0,
          infoCount: 0,
          totalTime: 50,
        },
      })
      reporter.report(results)
      const calls = consoleSpy.mock.calls.map((call) => call[0]) as string[]
      expect(calls.some((c) => c.includes('const x = 1;'))).toBe(false)
    })

    test('should handle empty options object', () => {
      const reporter = new ConsoleReporter({})
      expect(reporter.name).toBe('console')
    })
  })

  describe('format', () => {
    test('should format error violation with color', () => {
      const reporter = new ConsoleReporter({ color: true })
      const violation = createMockViolation({ severity: 'error' })
      const output = reporter.format(violation)
      expect(output).toContain('✖')
      expect(output).toContain('ERROR')
      expect(output).toContain('test-rule')
      expect(output).toContain('test.ts:10:5')
    })

    test('should format warning violation with color', () => {
      const reporter = new ConsoleReporter({ color: true })
      const violation = createMockViolation({ severity: 'warning' })
      const output = reporter.format(violation)
      expect(output).toContain('⚠')
      expect(output).toContain('WARNING')
      expect(output).toContain(ANSI.yellow)
    })

    test('should format info violation with color', () => {
      const reporter = new ConsoleReporter({ color: true })
      const violation = createMockViolation({ severity: 'info' })
      const output = reporter.format(violation)
      expect(output).toContain('ℹ')
      expect(output).toContain('INFO')
      expect(output).toContain(ANSI.blue)
    })

    test('should format violation without color', () => {
      const reporter = new ConsoleReporter({ color: false })
      const violation = createMockViolation()
      const output = reporter.format(violation)
      expect(output).toContain('✖')
      expect(output).toContain('ERROR')
      expect(output).not.toContain(ANSI.red)
    })

    test('should include all violation details', () => {
      const reporter = new ConsoleReporter({ color: false })
      const violation = createMockViolation({
        ruleId: 'my-custom-rule',
        message: 'Variable must be declared before use',
        filePath: 'src/utils/helper.ts',
        line: 42,
        column: 15,
      })
      const output = reporter.format(violation)
      expect(output).toContain('my-custom-rule')
      expect(output).toContain('Variable must be declared before use')
      expect(output).toContain('src/utils/helper.ts:42:15')
    })
  })

  describe('report', () => {
    test('should print "No files analyzed" when files array is empty', () => {
      const reporter = new ConsoleReporter({ color: false })
      const results = createMockAnalysisResult({ files: [] })
      reporter.report(results)
      expect(consoleSpy).toHaveBeenCalled()
      const calls = consoleSpy.mock.calls.map((call) => call[0]) as string[]
      expect(calls.some((c) => c.includes('No files analyzed'))).toBe(true)
    })

    test('should report errors in full mode', () => {
      const reporter = new ConsoleReporter({ color: false })
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [createMockViolation()])],
        summary: {
          totalFiles: 1,
          filesWithViolations: 1,
          errorCount: 1,
          warningCount: 0,
          infoCount: 0,
          totalTime: 50,
        },
      })
      reporter.report(results)
      expect(consoleSpy).toHaveBeenCalled()
      const calls = consoleSpy.mock.calls.map((call) => call[0]) as string[]
      expect(calls.some((c) => c.includes('test.ts'))).toBe(true)
    })

    test('should report only errors in quiet mode', () => {
      const reporter = new ConsoleReporter({ quiet: true, color: false })
      const results = createMockAnalysisResult({
        files: [
          createMockFileResult('test.ts', [
            createMockViolation({ severity: 'error' }),
            createMockViolation({ severity: 'warning', ruleId: 'warn-rule' }),
          ]),
        ],
        summary: {
          totalFiles: 1,
          filesWithViolations: 1,
          errorCount: 1,
          warningCount: 1,
          infoCount: 0,
          totalTime: 50,
        },
      })
      reporter.report(results)
      const calls = consoleSpy.mock.calls.map((call) => call[0]) as string[]
      const errorCalls = calls.filter((c) => c.includes('ERROR'))
      const warningCalls = calls.filter((c) => c.includes('warn-rule'))
      expect(errorCalls.length).toBeGreaterThan(0)
      expect(warningCalls.length).toBe(0)
    })

    test('should print source snippet when includeSource is true', () => {
      const reporter = new ConsoleReporter({ includeSource: true, color: false })
      const violationWithSource = createMockViolation({ source: 'const x = 1;' })
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [violationWithSource])],
        summary: {
          totalFiles: 1,
          filesWithViolations: 1,
          errorCount: 1,
          warningCount: 0,
          infoCount: 0,
          totalTime: 50,
        },
      })
      reporter.report(results)
      const calls = consoleSpy.mock.calls.map((call) => call[0]) as string[]
      expect(calls.some((c) => typeof c === 'string' && c.includes('const x = 1;'))).toBe(true)
    })

    test('should print suggestion when available', () => {
      const reporter = new ConsoleReporter({ color: false })
      const violationWithSuggestion = createMockViolation({
        suggestion: 'Consider using const instead',
      })
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [violationWithSuggestion])],
        summary: {
          totalFiles: 1,
          filesWithViolations: 1,
          errorCount: 1,
          warningCount: 0,
          infoCount: 0,
          totalTime: 50,
        },
      })
      reporter.report(results)
      const calls = consoleSpy.mock.calls.map((call) => call[0]) as string[]
      expect(calls.some((c) => typeof c === 'string' && c.includes('Suggestion:'))).toBe(true)
      expect(
        calls.some((c) => typeof c === 'string' && c.includes('Consider using const instead')),
      ).toBe(true)
    })

    test('should print verbose info when verbose mode is enabled', () => {
      const reporter = new ConsoleReporter({ verbose: true, color: false })
      const results = createMockAnalysisResult({
        files: [
          createMockFileResult('test.ts', [createMockViolation()], {
            parseTime: 5,
            analysisTime: 10,
            totalTime: 15,
          }),
        ],
        summary: {
          totalFiles: 1,
          filesWithViolations: 1,
          errorCount: 1,
          warningCount: 0,
          infoCount: 0,
          totalTime: 50,
        },
      })
      reporter.report(results)
      const calls = consoleSpy.mock.calls.map((call) => call[0]) as string[]
      expect(calls.some((c) => typeof c === 'string' && c.includes('--- Details ---'))).toBe(true)
      expect(calls.some((c) => typeof c === 'string' && c.includes('parse: 5ms'))).toBe(true)
    })

    test('should handle multiple files with violations', () => {
      const reporter = new ConsoleReporter({ color: false })
      const results = createMockAnalysisResult({
        files: [
          createMockFileResult('file1.ts', [createMockViolation({ ruleId: 'rule1' })]),
          createMockFileResult('file2.ts', [createMockViolation({ ruleId: 'rule2' })]),
        ],
        summary: {
          totalFiles: 2,
          filesWithViolations: 2,
          errorCount: 2,
          warningCount: 0,
          infoCount: 0,
          totalTime: 100,
        },
      })
      reporter.report(results)
      const calls = consoleSpy.mock.calls.map((call) => call[0]) as string[]
      expect(calls.some((c) => typeof c === 'string' && c.includes('file1.ts'))).toBe(true)
      expect(calls.some((c) => typeof c === 'string' && c.includes('file2.ts'))).toBe(true)
    })

    test('should skip files without violations in full mode', () => {
      const reporter = new ConsoleReporter({ color: false })
      const results = createMockAnalysisResult({
        files: [
          createMockFileResult('clean.ts', []),
          createMockFileResult('dirty.ts', [createMockViolation()]),
        ],
        summary: {
          totalFiles: 2,
          filesWithViolations: 1,
          errorCount: 1,
          warningCount: 0,
          infoCount: 0,
          totalTime: 100,
        },
      })
      reporter.report(results)
      const calls = consoleSpy.mock.calls.map((call) => call[0]) as string[]
      expect(calls.some((c) => typeof c === 'string' && c.includes('clean.ts'))).toBe(false)
      expect(calls.some((c) => typeof c === 'string' && c.includes('dirty.ts'))).toBe(true)
    })
  })

  describe('summary output', () => {
    test('should display errors in summary', () => {
      const reporter = new ConsoleReporter({ color: false })
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [createMockViolation({ severity: 'error' })])],
        summary: {
          totalFiles: 1,
          filesWithViolations: 1,
          errorCount: 2,
          warningCount: 0,
          infoCount: 0,
          totalTime: 50,
        },
      })
      reporter.report(results)
      const calls = consoleSpy.mock.calls.map((call) => call[0]) as string[]
      expect(calls.some((c) => typeof c === 'string' && c.includes('2 errors'))).toBe(true)
    })

    test('should display warnings in summary', () => {
      const reporter = new ConsoleReporter({ color: false })
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [createMockViolation({ severity: 'warning' })])],
        summary: {
          totalFiles: 1,
          filesWithViolations: 1,
          errorCount: 0,
          warningCount: 3,
          infoCount: 0,
          totalTime: 50,
        },
      })
      reporter.report(results)
      const calls = consoleSpy.mock.calls.map((call) => call[0]) as string[]
      expect(calls.some((c) => typeof c === 'string' && c.includes('3 warnings'))).toBe(true)
    })

    test('should display info in summary', () => {
      const reporter = new ConsoleReporter({ color: false })
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [createMockViolation({ severity: 'info' })])],
        summary: {
          totalFiles: 1,
          filesWithViolations: 1,
          errorCount: 0,
          warningCount: 0,
          infoCount: 5,
          totalTime: 50,
        },
      })
      reporter.report(results)
      const calls = consoleSpy.mock.calls.map((call) => call[0]) as string[]
      expect(calls.some((c) => typeof c === 'string' && c.includes('5 info'))).toBe(true)
    })

    test('should display "No problems found" when no violations', () => {
      const reporter = new ConsoleReporter({ color: false })
      const results = createMockAnalysisResult({
        files: [createMockFileResult('clean.ts', [])],
        summary: {
          totalFiles: 1,
          filesWithViolations: 0,
          errorCount: 0,
          warningCount: 0,
          infoCount: 0,
          totalTime: 50,
        },
      })
      reporter.report(results)
      const calls = consoleSpy.mock.calls.map((call) => call[0]) as string[]
      expect(calls.some((c) => typeof c === 'string' && c.includes('No problems found'))).toBe(true)
    })

    test('should display singular form for single error', () => {
      const reporter = new ConsoleReporter({ color: false })
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [createMockViolation({ severity: 'error' })])],
        summary: {
          totalFiles: 1,
          filesWithViolations: 1,
          errorCount: 1,
          warningCount: 0,
          infoCount: 0,
          totalTime: 50,
        },
      })
      reporter.report(results)
      const calls = consoleSpy.mock.calls.map((call) => call[0]) as string[]
      expect(calls.some((c) => typeof c === 'string' && c.includes('1 error'))).toBe(true)
      expect(calls.some((c) => typeof c === 'string' && c.includes('1 errors'))).toBe(false)
    })

    test('should display file count in summary', () => {
      const reporter = new ConsoleReporter({ color: false })
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [])],
        summary: {
          totalFiles: 5,
          filesWithViolations: 0,
          errorCount: 0,
          warningCount: 0,
          infoCount: 0,
          totalTime: 50,
        },
      })
      reporter.report(results)
      const calls = consoleSpy.mock.calls.map((call) => call[0]) as string[]
      expect(calls.some((c) => typeof c === 'string' && c.includes('5 files analyzed'))).toBe(true)
    })

    test('should display singular file count', () => {
      const reporter = new ConsoleReporter({ color: false })
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [])],
        summary: {
          totalFiles: 1,
          filesWithViolations: 0,
          errorCount: 0,
          warningCount: 0,
          infoCount: 0,
          totalTime: 50,
        },
      })
      reporter.report(results)
      const calls = consoleSpy.mock.calls.map((call) => call[0]) as string[]
      expect(calls.some((c) => typeof c === 'string' && c.includes('1 file analyzed'))).toBe(true)
    })
  })

  describe('time formatting', () => {
    test('should display time in milliseconds for short durations', () => {
      const reporter = new ConsoleReporter({ color: false })
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [])],
        summary: {
          totalFiles: 1,
          filesWithViolations: 0,
          errorCount: 0,
          warningCount: 0,
          infoCount: 0,
          totalTime: 500,
        },
      })
      reporter.report(results)
      const calls = consoleSpy.mock.calls.map((call) => call[0]) as string[]
      expect(calls.some((c) => typeof c === 'string' && c.includes('500ms'))).toBe(true)
    })

    test('should display time in seconds for longer durations', () => {
      const reporter = new ConsoleReporter({ color: false })
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [])],
        summary: {
          totalFiles: 1,
          filesWithViolations: 0,
          errorCount: 0,
          warningCount: 0,
          infoCount: 0,
          totalTime: 2500,
        },
      })
      reporter.report(results)
      const calls = consoleSpy.mock.calls.map((call) => call[0]) as string[]
      expect(calls.some((c) => typeof c === 'string' && c.includes('2.50s'))).toBe(true)
    })
  })

  describe('color output', () => {
    test('should colorize file headers in color mode', () => {
      const reporter = new ConsoleReporter({ color: true })
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [createMockViolation()])],
        summary: {
          totalFiles: 1,
          filesWithViolations: 1,
          errorCount: 1,
          warningCount: 0,
          infoCount: 0,
          totalTime: 50,
        },
      })
      reporter.report(results)
      const calls = consoleSpy.mock.calls.map((call) => call[0]) as string[]
      expect(
        calls.some((c) => typeof c === 'string' && c.includes(ANSI.cyan) && c.includes('test.ts')),
      ).toBe(true)
    })

    test('should colorize summary errors in color mode', () => {
      const reporter = new ConsoleReporter({ color: true })
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [createMockViolation({ severity: 'error' })])],
        summary: {
          totalFiles: 1,
          filesWithViolations: 1,
          errorCount: 1,
          warningCount: 0,
          infoCount: 0,
          totalTime: 50,
        },
      })
      reporter.report(results)
      const calls = consoleSpy.mock.calls.map((call) => call[0]) as string[]
      expect(
        calls.some((c) => typeof c === 'string' && c.includes(ANSI.red) && c.includes('1 error')),
      ).toBe(true)
    })

    test('should colorize summary warnings in color mode', () => {
      const reporter = new ConsoleReporter({ color: true })
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [createMockViolation({ severity: 'warning' })])],
        summary: {
          totalFiles: 1,
          filesWithViolations: 1,
          errorCount: 0,
          warningCount: 1,
          infoCount: 0,
          totalTime: 50,
        },
      })
      reporter.report(results)
      const calls = consoleSpy.mock.calls.map((call) => call[0]) as string[]
      expect(
        calls.some(
          (c) => typeof c === 'string' && c.includes(ANSI.yellow) && c.includes('1 warning'),
        ),
      ).toBe(true)
    })

    test('should colorize "No problems found" in green', () => {
      const reporter = new ConsoleReporter({ color: true })
      const results = createMockAnalysisResult({
        files: [createMockFileResult('clean.ts', [])],
        summary: {
          totalFiles: 1,
          filesWithViolations: 0,
          errorCount: 0,
          warningCount: 0,
          infoCount: 0,
          totalTime: 50,
        },
      })
      reporter.report(results)
      const calls = consoleSpy.mock.calls.map((call) => call[0]) as string[]
      expect(
        calls.some(
          (c) => typeof c === 'string' && c.includes(ANSI.green) && c.includes('No problems found'),
        ),
      ).toBe(true)
    })
  })

  describe('edge cases', () => {
    test('should handle violation with endLine and endColumn', () => {
      const reporter = new ConsoleReporter({ color: false })
      const violation = createMockViolation({ endLine: 15, endColumn: 10 })
      const output = reporter.format(violation)
      expect(output).toContain('test.ts:10:5')
    })

    test('should handle multi-line source code', () => {
      const reporter = new ConsoleReporter({ includeSource: true, color: false })
      const multiLineSource = 'line1\nline2\nline3\nline4\nline5'
      const violationWithSource = createMockViolation({ source: multiLineSource })
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [violationWithSource])],
        summary: {
          totalFiles: 1,
          filesWithViolations: 1,
          errorCount: 1,
          warningCount: 0,
          infoCount: 0,
          totalTime: 50,
        },
      })
      reporter.report(results)
      const calls = consoleSpy.mock.calls.map((call) => call[0]) as string[]
      expect(calls.some((c) => typeof c === 'string' && c.includes('line1'))).toBe(true)
      expect(calls.some((c) => typeof c === 'string' && c.includes('line2'))).toBe(true)
      expect(calls.some((c) => typeof c === 'string' && c.includes('line3'))).toBe(true)
    })

    test('should handle empty source string', () => {
      const reporter = new ConsoleReporter({ includeSource: true, color: false })
      const violationWithEmptySource = createMockViolation({ source: '' })
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [violationWithEmptySource])],
        summary: {
          totalFiles: 1,
          filesWithViolations: 1,
          errorCount: 1,
          warningCount: 0,
          infoCount: 0,
          totalTime: 50,
        },
      })
      reporter.report(results)
      expect(consoleSpy).toHaveBeenCalled()
    })

    test('should handle undefined source', () => {
      const reporter = new ConsoleReporter({ includeSource: true, color: false })
      const violationWithoutSource = createMockViolation()
      delete (violationWithoutSource as Partial<Violation>).source
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [violationWithoutSource])],
        summary: {
          totalFiles: 1,
          filesWithViolations: 1,
          errorCount: 1,
          warningCount: 0,
          infoCount: 0,
          totalTime: 50,
        },
      })
      reporter.report(results)
      expect(consoleSpy).toHaveBeenCalled()
    })

    test('should handle violation with meta data', () => {
      const reporter = new ConsoleReporter({ color: false })
      const violationWithMeta = createMockViolation({ meta: { complexity: 15 } })
      const output = reporter.format(violationWithMeta)
      expect(output).toContain('Test violation message')
    })

    test('should handle large number of files', () => {
      const reporter = new ConsoleReporter({ color: false })
      const files: FileAnalysisResult[] = []
      for (let i = 0; i < 100; i++) {
        files.push(
          createMockFileResult(`file${i}.ts`, [createMockViolation({ ruleId: `rule${i}` })]),
        )
      }
      const results = createMockAnalysisResult({
        files,
        summary: {
          totalFiles: 100,
          filesWithViolations: 100,
          errorCount: 100,
          warningCount: 0,
          infoCount: 0,
          totalTime: 1000,
        },
      })
      reporter.report(results)
      expect(consoleSpy).toHaveBeenCalled()
      const calls = consoleSpy.mock.calls.map((call) => call[0]) as string[]
      expect(calls.some((c) => typeof c === 'string' && c.includes('100 files'))).toBe(true)
    })

    test('should handle violation at column 1', () => {
      const reporter = new ConsoleReporter({ color: false, includeSource: true })
      const violationAtCol1 = createMockViolation({ column: 1, source: 'const x = 1;' })
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [violationAtCol1])],
        summary: {
          totalFiles: 1,
          filesWithViolations: 1,
          errorCount: 1,
          warningCount: 0,
          infoCount: 0,
          totalTime: 50,
        },
      })
      reporter.report(results)
      expect(consoleSpy).toHaveBeenCalled()
    })
  })

  describe('format output structure', () => {
    test('should start with severity icon in no-color mode', () => {
      const reporter = new ConsoleReporter({ color: false })
      const output = reporter.format(createMockViolation({ severity: 'error' }))
      expect(output.startsWith('✖')).toBe(true)
    })

    test('should contain file location as filePath:line:column', () => {
      const reporter = new ConsoleReporter({ color: false })
      const output = reporter.format(
        createMockViolation({ filePath: 'src/app.ts', line: 42, column: 10 }),
      )
      expect(output).toContain('src/app.ts:42:10')
    })

    test('should uppercase severity text', () => {
      const reporter = new ConsoleReporter({ color: false })
      expect(reporter.format(createMockViolation({ severity: 'error' }))).toContain('ERROR')
      expect(reporter.format(createMockViolation({ severity: 'warning' }))).toContain('WARNING')
      expect(reporter.format(createMockViolation({ severity: 'info' }))).toContain('INFO')
    })

    test('should contain violation message in output', () => {
      const reporter = new ConsoleReporter({ color: false })
      expect(reporter.format(createMockViolation({ message: 'Use const instead' }))).toContain(
        'Use const instead',
      )
    })

    test('should wrap ruleId in square brackets', () => {
      const reporter = new ConsoleReporter({ color: false })
      expect(reporter.format(createMockViolation({ ruleId: 'prefer-const' }))).toContain(
        '[prefer-const]',
      )
    })

    test('should use error icon for error severity', () => {
      const reporter = new ConsoleReporter({ color: false })
      expect(reporter.format(createMockViolation({ severity: 'error' }))).toContain('✖')
    })

    test('should use warning icon for warning severity', () => {
      const reporter = new ConsoleReporter({ color: false })
      expect(reporter.format(createMockViolation({ severity: 'warning' }))).toContain('⚠')
    })

    test('should use info icon for info severity', () => {
      const reporter = new ConsoleReporter({ color: false })
      expect(reporter.format(createMockViolation({ severity: 'info' }))).toContain('ℹ')
    })

    test('should apply bold to location with color enabled', () => {
      const reporter = new ConsoleReporter({ color: true })
      expect(reporter.format(createMockViolation())).toContain(ANSI.bold)
    })

    test('should apply red to error format with color', () => {
      const reporter = new ConsoleReporter({ color: true })
      expect(reporter.format(createMockViolation({ severity: 'error' }))).toContain(ANSI.red)
    })

    test('should apply yellow to warning format with color', () => {
      const reporter = new ConsoleReporter({ color: true })
      expect(reporter.format(createMockViolation({ severity: 'warning' }))).toContain(ANSI.yellow)
    })

    test('should apply blue to info format with color', () => {
      const reporter = new ConsoleReporter({ color: true })
      expect(reporter.format(createMockViolation({ severity: 'info' }))).toContain(ANSI.blue)
    })
  })

  describe('format with various inputs', () => {
    test('should handle empty message string', () => {
      const reporter = new ConsoleReporter({ color: false })
      const output = reporter.format(createMockViolation({ message: '' }))
      expect(output).toContain('ERROR')
      expect(output).toContain('[test-rule]')
    })

    test('should handle single-character message', () => {
      const reporter = new ConsoleReporter({ color: false })
      expect(reporter.format(createMockViolation({ message: 'X' }))).toContain('X')
    })

    test('should handle message with backticks and quotes', () => {
      const reporter = new ConsoleReporter({ color: false })
      const msg = 'Use `const` instead of "let"'
      expect(reporter.format(createMockViolation({ message: msg }))).toContain(msg)
    })

    test('should handle message with colons', () => {
      const reporter = new ConsoleReporter({ color: false })
      const msg = 'Error: something failed'
      expect(reporter.format(createMockViolation({ message: msg }))).toContain(msg)
    })

    test('should handle rule ID with hyphens and numbers', () => {
      const reporter = new ConsoleReporter({ color: false })
      expect(reporter.format(createMockViolation({ ruleId: 'max-params-2' }))).toContain(
        '[max-params-2]',
      )
    })

    test('should handle rule ID with namespace slash', () => {
      const reporter = new ConsoleReporter({ color: false })
      expect(reporter.format(createMockViolation({ ruleId: 'security/no-eval' }))).toContain(
        '[security/no-eval]',
      )
    })

    test('should handle long nested file path', () => {
      const reporter = new ConsoleReporter({ color: false })
      const path = 'src/modules/auth/controllers/user/profile.ts'
      expect(reporter.format(createMockViolation({ filePath: path }))).toContain(path)
    })

    test('should handle file path with spaces', () => {
      const reporter = new ConsoleReporter({ color: false })
      expect(reporter.format(createMockViolation({ filePath: 'my app/src/index.ts' }))).toContain(
        'my app/src/index.ts',
      )
    })

    test('should handle line number 1', () => {
      const reporter = new ConsoleReporter({ color: false })
      expect(reporter.format(createMockViolation({ line: 1 }))).toContain(':1:')
    })

    test('should handle large line number', () => {
      const reporter = new ConsoleReporter({ color: false })
      expect(reporter.format(createMockViolation({ line: 99999 }))).toContain(':99999:')
    })

    test('should handle column number 1', () => {
      const reporter = new ConsoleReporter({ color: false })
      const output = reporter.format(createMockViolation({ column: 1 }))
      expect(output).toContain(':1')
    })

    test('should handle large column number', () => {
      const reporter = new ConsoleReporter({ color: false })
      expect(reporter.format(createMockViolation({ column: 500 }))).toContain(':500')
    })

    test('should handle message with Unicode characters', () => {
      const reporter = new ConsoleReporter({ color: false })
      expect(reporter.format(createMockViolation({ message: 'Variable 变量 unused' }))).toContain(
        'Variable 变量 unused',
      )
    })

    test('should handle message with parentheses', () => {
      const reporter = new ConsoleReporter({ color: false })
      const msg = 'Unexpected token ('
      expect(reporter.format(createMockViolation({ message: msg }))).toContain(msg)
    })

    test('should handle violation with all optional fields', () => {
      const reporter = new ConsoleReporter({ color: false })
      const output = reporter.format(
        createMockViolation({
          endLine: 20,
          endColumn: 15,
          source: 'const x = 1;',
          suggestion: 'Use let',
          meta: { complexity: 10 },
        }),
      )
      expect(output).toContain('ERROR')
      expect(output).toContain('[test-rule]')
      expect(output).toContain('Test violation message')
    })
  })

  describe('report full mode details', () => {
    test('should print file header for file with violations', () => {
      const reporter = new ConsoleReporter({ color: false })
      reporter.report(
        createMockAnalysisResult({
          files: [createMockFileResult('app.ts', [createMockViolation()])],
          summary: createMockSummary({ filesWithViolations: 1, errorCount: 1 }),
        }),
      )
      expect(hasText(consoleSpy, 'app.ts')).toBe(true)
    })

    test('should separate file sections with blank line', () => {
      const reporter = new ConsoleReporter({ color: false })
      reporter.report(
        createMockAnalysisResult({
          files: [
            createMockFileResult('a.ts', [createMockViolation({ ruleId: 'r1' })]),
            createMockFileResult('b.ts', [createMockViolation({ ruleId: 'r2' })]),
          ],
          summary: createMockSummary({
            totalFiles: 2,
            filesWithViolations: 2,
            errorCount: 2,
          }),
        }),
      )
      expect(hasText(consoleSpy, 'a.ts')).toBe(true)
      expect(hasText(consoleSpy, 'b.ts')).toBe(true)
      expect(hasText(consoleSpy, 'r1')).toBe(true)
      expect(hasText(consoleSpy, 'r2')).toBe(true)
    })

    test('should print formatted violation for each violation', () => {
      const reporter = new ConsoleReporter({ color: false })
      reporter.report(
        createMockAnalysisResult({
          files: [
            createMockFileResult('test.ts', [
              createMockViolation({ ruleId: 'rule-a' }),
              createMockViolation({ ruleId: 'rule-b' }),
            ]),
          ],
          summary: createMockSummary({ filesWithViolations: 1, errorCount: 2 }),
        }),
      )
      expect(hasText(consoleSpy, 'rule-a')).toBe(true)
      expect(hasText(consoleSpy, 'rule-b')).toBe(true)
    })

    test('should print source snippet when includeSource is true and source exists', () => {
      const reporter = new ConsoleReporter({ includeSource: true, color: false })
      reporter.report(
        createMockAnalysisResult({
          files: [createMockFileResult('test.ts', [createMockViolation({ source: 'let x = 1;' })])],
          summary: createMockSummary({ filesWithViolations: 1, errorCount: 1 }),
        }),
      )
      expect(hasText(consoleSpy, 'let x = 1;')).toBe(true)
    })

    test('should not print source snippet when violation has no source', () => {
      const reporter = new ConsoleReporter({ includeSource: true, color: false })
      reporter.report(
        createMockAnalysisResult({
          files: [createMockFileResult('test.ts', [createMockViolation()])],
          summary: createMockSummary({ filesWithViolations: 1, errorCount: 1 }),
        }),
      )
      expect(hasText(consoleSpy, ' | ')).toBe(false)
    })

    test('should not print source snippet when includeSource is false', () => {
      const reporter = new ConsoleReporter({ includeSource: false, color: false })
      reporter.report(
        createMockAnalysisResult({
          files: [createMockFileResult('test.ts', [createMockViolation({ source: 'let x = 1;' })])],
          summary: createMockSummary({ filesWithViolations: 1, errorCount: 1 }),
        }),
      )
      expect(hasText(consoleSpy, 'let x = 1;')).toBe(false)
    })

    test('should print suggestion when violation has one', () => {
      const reporter = new ConsoleReporter({ color: false })
      reporter.report(
        createMockAnalysisResult({
          files: [
            createMockFileResult('test.ts', [createMockViolation({ suggestion: 'Use const' })]),
          ],
          summary: createMockSummary({ filesWithViolations: 1, errorCount: 1 }),
        }),
      )
      expect(hasText(consoleSpy, 'Suggestion:')).toBe(true)
      expect(hasText(consoleSpy, 'Use const')).toBe(true)
    })

    test('should not print suggestion when violation has none', () => {
      const reporter = new ConsoleReporter({ color: false })
      reporter.report(
        createMockAnalysisResult({
          files: [createMockFileResult('test.ts', [createMockViolation()])],
          summary: createMockSummary({ filesWithViolations: 1, errorCount: 1 }),
        }),
      )
      expect(hasText(consoleSpy, 'Suggestion:')).toBe(false)
    })

    test('should print both source and suggestion for same violation', () => {
      const reporter = new ConsoleReporter({ color: false, includeSource: true })
      reporter.report(
        createMockAnalysisResult({
          files: [
            createMockFileResult('test.ts', [
              createMockViolation({
                source: 'let x = 1;',
                suggestion: 'Use const',
              }),
            ]),
          ],
          summary: createMockSummary({ filesWithViolations: 1, errorCount: 1 }),
        }),
      )
      expect(hasText(consoleSpy, 'let x = 1;')).toBe(true)
      expect(hasText(consoleSpy, 'Suggestion:')).toBe(true)
    })

    test('should print summary at the end', () => {
      const reporter = new ConsoleReporter({ color: false })
      reporter.report(
        createMockAnalysisResult({
          files: [createMockFileResult('test.ts', [createMockViolation()])],
          summary: createMockSummary({ filesWithViolations: 1, errorCount: 1 }),
        }),
      )
      expect(hasText(consoleSpy, '1 error')).toBe(true)
      expect(hasText(consoleSpy, 'analyzed in')).toBe(true)
    })

    test('should handle file with only warnings', () => {
      const reporter = new ConsoleReporter({ color: false })
      reporter.report(
        createMockAnalysisResult({
          files: [createMockFileResult('test.ts', [createMockViolation({ severity: 'warning' })])],
          summary: createMockSummary({ filesWithViolations: 1, warningCount: 1 }),
        }),
      )
      expect(hasText(consoleSpy, 'test.ts')).toBe(true)
      expect(hasText(consoleSpy, 'WARNING')).toBe(true)
    })

    test('should handle file with only info violations', () => {
      const reporter = new ConsoleReporter({ color: false })
      reporter.report(
        createMockAnalysisResult({
          files: [createMockFileResult('test.ts', [createMockViolation({ severity: 'info' })])],
          summary: createMockSummary({ filesWithViolations: 1, infoCount: 1 }),
        }),
      )
      expect(hasText(consoleSpy, 'test.ts')).toBe(true)
      expect(hasText(consoleSpy, 'INFO')).toBe(true)
    })

    test('should handle file with mixed severities', () => {
      const reporter = new ConsoleReporter({ color: false })
      reporter.report(
        createMockAnalysisResult({
          files: [
            createMockFileResult('test.ts', [
              createMockViolation({ severity: 'error', ruleId: 'err' }),
              createMockViolation({ severity: 'warning', ruleId: 'wrn' }),
              createMockViolation({ severity: 'info', ruleId: 'inf' }),
            ]),
          ],
          summary: createMockSummary({
            filesWithViolations: 1,
            errorCount: 1,
            warningCount: 1,
            infoCount: 1,
          }),
        }),
      )
      expect(hasText(consoleSpy, 'err')).toBe(true)
      expect(hasText(consoleSpy, 'wrn')).toBe(true)
      expect(hasText(consoleSpy, 'inf')).toBe(true)
    })

    test('should not print source for empty source string', () => {
      const reporter = new ConsoleReporter({ includeSource: true, color: false })
      reporter.report(
        createMockAnalysisResult({
          files: [createMockFileResult('test.ts', [createMockViolation({ source: '' })])],
          summary: createMockSummary({ filesWithViolations: 1, errorCount: 1 }),
        }),
      )
      expect(hasText(consoleSpy, ' | ')).toBe(false)
    })

    test('should handle includeSource false with verbose true', () => {
      const reporter = new ConsoleReporter({
        includeSource: false,
        verbose: true,
        color: false,
      })
      reporter.report(
        createMockAnalysisResult({
          files: [
            createMockFileResult('test.ts', [createMockViolation({ source: 'code' })], {
              parseTime: 5,
              analysisTime: 10,
              totalTime: 15,
            }),
          ],
          summary: createMockSummary({ filesWithViolations: 1, errorCount: 1 }),
        }),
      )
      expect(hasText(consoleSpy, 'code')).toBe(false)
      expect(hasText(consoleSpy, 'parse: 5ms')).toBe(true)
    })

    test('should handle multiple violations each with source and suggestion', () => {
      const reporter = new ConsoleReporter({ includeSource: true, color: false })
      reporter.report(
        createMockAnalysisResult({
          files: [
            createMockFileResult('test.ts', [
              createMockViolation({
                ruleId: 'r1',
                source: 'line one',
                suggestion: 'Fix one',
              }),
              createMockViolation({
                ruleId: 'r2',
                source: 'line two',
                suggestion: 'Fix two',
              }),
            ]),
          ],
          summary: createMockSummary({ filesWithViolations: 1, errorCount: 2 }),
        }),
      )
      expect(hasText(consoleSpy, 'line one')).toBe(true)
      expect(hasText(consoleSpy, 'line two')).toBe(true)
      expect(hasText(consoleSpy, 'Fix one')).toBe(true)
      expect(hasText(consoleSpy, 'Fix two')).toBe(true)
    })

    test('should skip files without violations', () => {
      const reporter = new ConsoleReporter({ color: false })
      reporter.report(
        createMockAnalysisResult({
          files: [
            createMockFileResult('clean.ts', []),
            createMockFileResult('dirty.ts', [createMockViolation()]),
          ],
          summary: createMockSummary({
            totalFiles: 2,
            filesWithViolations: 1,
            errorCount: 1,
          }),
        }),
      )
      expect(hasText(consoleSpy, 'clean.ts')).toBe(false)
      expect(hasText(consoleSpy, 'dirty.ts')).toBe(true)
    })
  })

  describe('report quiet mode details', () => {
    test('should print only error violations', () => {
      const reporter = new ConsoleReporter({ quiet: true, color: false })
      reporter.report(
        createMockAnalysisResult({
          files: [
            createMockFileResult('test.ts', [
              createMockViolation({ severity: 'error', ruleId: 'err-rule' }),
            ]),
          ],
          summary: createMockSummary({ filesWithViolations: 1, errorCount: 1 }),
        }),
      )
      expect(hasText(consoleSpy, 'err-rule')).toBe(true)
    })

    test('should skip warning violations in quiet mode', () => {
      const reporter = new ConsoleReporter({ quiet: true, color: false })
      reporter.report(
        createMockAnalysisResult({
          files: [
            createMockFileResult('test.ts', [
              createMockViolation({ severity: 'warning', ruleId: 'wrn-rule' }),
            ]),
          ],
          summary: createMockSummary({ filesWithViolations: 1, warningCount: 1 }),
        }),
      )
      expect(hasText(consoleSpy, 'wrn-rule')).toBe(false)
    })

    test('should skip info violations in quiet mode', () => {
      const reporter = new ConsoleReporter({ quiet: true, color: false })
      reporter.report(
        createMockAnalysisResult({
          files: [
            createMockFileResult('test.ts', [
              createMockViolation({ severity: 'info', ruleId: 'inf-rule' }),
            ]),
          ],
          summary: createMockSummary({ filesWithViolations: 1, infoCount: 1 }),
        }),
      )
      expect(hasText(consoleSpy, 'inf-rule')).toBe(false)
    })

    test('should print summary when errors exist', () => {
      const reporter = new ConsoleReporter({ quiet: true, color: false })
      reporter.report(
        createMockAnalysisResult({
          files: [createMockFileResult('test.ts', [createMockViolation({ severity: 'error' })])],
          summary: createMockSummary({ filesWithViolations: 1, errorCount: 1 }),
        }),
      )
      expect(hasText(consoleSpy, '1 error')).toBe(true)
    })

    test('should not print summary when no errors in quiet mode', () => {
      const reporter = new ConsoleReporter({ quiet: true, color: false })
      reporter.report(
        createMockAnalysisResult({
          files: [createMockFileResult('test.ts', [createMockViolation({ severity: 'warning' })])],
          summary: createMockSummary({ filesWithViolations: 1, warningCount: 1 }),
        }),
      )
      expect(consoleSpy).not.toHaveBeenCalled()
    })

    test('should not print file headers in quiet mode', () => {
      const reporter = new ConsoleReporter({ quiet: true, color: false })
      reporter.report(
        createMockAnalysisResult({
          files: [createMockFileResult('myfile.ts', [createMockViolation({ severity: 'error' })])],
          summary: createMockSummary({ filesWithViolations: 1, errorCount: 1 }),
        }),
      )
      const calls = getOutput(consoleSpy)
      const headerCall = calls.find(
        (c) => typeof c === 'string' && c.includes('myfile.ts') && !c.includes(':'),
      )
      expect(headerCall).toBeUndefined()
    })

    test('should not print source snippets in quiet mode', () => {
      const reporter = new ConsoleReporter({
        quiet: true,
        color: false,
        includeSource: true,
      })
      reporter.report(
        createMockAnalysisResult({
          files: [
            createMockFileResult('test.ts', [
              createMockViolation({ severity: 'error', source: 'const x = 1;' }),
            ]),
          ],
          summary: createMockSummary({ filesWithViolations: 1, errorCount: 1 }),
        }),
      )
      expect(hasText(consoleSpy, 'const x = 1;')).toBe(false)
    })

    test('should not print suggestions in quiet mode', () => {
      const reporter = new ConsoleReporter({ quiet: true, color: false })
      reporter.report(
        createMockAnalysisResult({
          files: [
            createMockFileResult('test.ts', [
              createMockViolation({
                severity: 'error',
                suggestion: 'Fix this',
              }),
            ]),
          ],
          summary: createMockSummary({ filesWithViolations: 1, errorCount: 1 }),
        }),
      )
      expect(hasText(consoleSpy, 'Suggestion:')).toBe(false)
    })

    test('should handle errors in multiple files', () => {
      const reporter = new ConsoleReporter({ quiet: true, color: false })
      reporter.report(
        createMockAnalysisResult({
          files: [
            createMockFileResult('a.ts', [
              createMockViolation({ severity: 'error', ruleId: 'err-a' }),
            ]),
            createMockFileResult('b.ts', [
              createMockViolation({ severity: 'error', ruleId: 'err-b' }),
            ]),
          ],
          summary: createMockSummary({
            totalFiles: 2,
            filesWithViolations: 2,
            errorCount: 2,
          }),
        }),
      )
      expect(hasText(consoleSpy, 'err-a')).toBe(true)
      expect(hasText(consoleSpy, 'err-b')).toBe(true)
    })

    test('should handle file with only warnings and info in quiet mode', () => {
      const reporter = new ConsoleReporter({ quiet: true, color: false })
      reporter.report(
        createMockAnalysisResult({
          files: [
            createMockFileResult('test.ts', [
              createMockViolation({ severity: 'warning' }),
              createMockViolation({ severity: 'info' }),
            ]),
          ],
          summary: createMockSummary({
            filesWithViolations: 1,
            warningCount: 1,
            infoCount: 1,
          }),
        }),
      )
      expect(consoleSpy).not.toHaveBeenCalled()
    })

    test('should print only errors from mixed severities in quiet mode', () => {
      const reporter = new ConsoleReporter({ quiet: true, color: false })
      reporter.report(
        createMockAnalysisResult({
          files: [
            createMockFileResult('test.ts', [
              createMockViolation({ severity: 'error', ruleId: 'the-error' }),
              createMockViolation({ severity: 'warning', ruleId: 'the-warning' }),
              createMockViolation({ severity: 'info', ruleId: 'the-info' }),
            ]),
          ],
          summary: createMockSummary({
            filesWithViolations: 1,
            errorCount: 1,
            warningCount: 1,
            infoCount: 1,
          }),
        }),
      )
      expect(hasText(consoleSpy, 'the-error')).toBe(true)
      expect(hasText(consoleSpy, 'the-warning')).toBe(false)
      expect(hasText(consoleSpy, 'the-info')).toBe(false)
    })

    test('should format error output in quiet mode with color', () => {
      const reporter = new ConsoleReporter({ quiet: true, color: true })
      reporter.report(
        createMockAnalysisResult({
          files: [createMockFileResult('test.ts', [createMockViolation({ severity: 'error' })])],
          summary: createMockSummary({ filesWithViolations: 1, errorCount: 1 }),
        }),
      )
      const calls = getOutput(consoleSpy)
      const errorCall = calls.find((c) => typeof c === 'string' && c.includes('ERROR'))
      expect(errorCall).toBeDefined()
    })

    test('should handle no violations at all in quiet mode', () => {
      const reporter = new ConsoleReporter({ quiet: true, color: false })
      reporter.report(
        createMockAnalysisResult({
          files: [createMockFileResult('test.ts', [])],
          summary: createMockSummary({ totalFiles: 1 }),
        }),
      )
      expect(consoleSpy).not.toHaveBeenCalled()
    })

    test('should print blank line before summary when errors exist', () => {
      const reporter = new ConsoleReporter({ quiet: true, color: false })
      reporter.report(
        createMockAnalysisResult({
          files: [createMockFileResult('test.ts', [createMockViolation({ severity: 'error' })])],
          summary: createMockSummary({ filesWithViolations: 1, errorCount: 1 }),
        }),
      )
      const calls = getOutput(consoleSpy)
      const errorCall = calls.find((c) => typeof c === 'string' && c.includes('ERROR'))
      const summaryCall = calls.find((c) => typeof c === 'string' && c.includes('1 error'))
      expect(errorCall).toBeDefined()
      expect(summaryCall).toBeDefined()
    })
  })

  describe('report verbose mode details', () => {
    test('should print --- Details --- header', () => {
      const reporter = new ConsoleReporter({ verbose: true, color: false })
      reporter.report(
        createMockAnalysisResult({
          files: [
            createMockFileResult('test.ts', [createMockViolation()], {
              parseTime: 5,
              analysisTime: 10,
              totalTime: 15,
            }),
          ],
          summary: createMockSummary({ filesWithViolations: 1, errorCount: 1 }),
        }),
      )
      expect(hasText(consoleSpy, '--- Details ---')).toBe(true)
    })

    test('should show file path in verbose details', () => {
      const reporter = new ConsoleReporter({ verbose: true, color: false })
      reporter.report(
        createMockAnalysisResult({
          files: [
            createMockFileResult('src/app.ts', [createMockViolation()], {
              parseTime: 5,
              analysisTime: 10,
              totalTime: 15,
            }),
          ],
          summary: createMockSummary({ filesWithViolations: 1, errorCount: 1 }),
        }),
      )
      const calls = getOutput(consoleSpy)
      const detailCall = calls.find(
        (c) => typeof c === 'string' && c.includes('src/app.ts') && c.includes('violation'),
      )
      expect(detailCall).toBeDefined()
    })

    test('should show violation count per file in verbose', () => {
      const reporter = new ConsoleReporter({ verbose: true, color: false })
      reporter.report(
        createMockAnalysisResult({
          files: [
            createMockFileResult(
              'test.ts',
              [createMockViolation(), createMockViolation({ ruleId: 'r2' })],
              { parseTime: 5, analysisTime: 10, totalTime: 15 },
            ),
          ],
          summary: createMockSummary({ filesWithViolations: 1, errorCount: 2 }),
        }),
      )
      expect(hasText(consoleSpy, '2 violation')).toBe(true)
    })

    test('should show parse time per file in verbose', () => {
      const reporter = new ConsoleReporter({ verbose: true, color: false })
      reporter.report(
        createMockAnalysisResult({
          files: [
            createMockFileResult('test.ts', [createMockViolation()], {
              parseTime: 7,
              analysisTime: 10,
              totalTime: 17,
            }),
          ],
          summary: createMockSummary({ filesWithViolations: 1, errorCount: 1 }),
        }),
      )
      expect(hasText(consoleSpy, 'parse: 7ms')).toBe(true)
    })

    test('should show analysis time per file in verbose', () => {
      const reporter = new ConsoleReporter({ verbose: true, color: false })
      reporter.report(
        createMockAnalysisResult({
          files: [
            createMockFileResult('test.ts', [createMockViolation()], {
              parseTime: 5,
              analysisTime: 12,
              totalTime: 17,
            }),
          ],
          summary: createMockSummary({ filesWithViolations: 1, errorCount: 1 }),
        }),
      )
      expect(hasText(consoleSpy, 'analysis: 12ms')).toBe(true)
    })

    test('should skip files without violations in verbose details', () => {
      const reporter = new ConsoleReporter({ verbose: true, color: false })
      reporter.report(
        createMockAnalysisResult({
          files: [
            createMockFileResult('clean.ts', [], {
              parseTime: 5,
              analysisTime: 10,
              totalTime: 15,
            }),
            createMockFileResult('dirty.ts', [createMockViolation()], {
              parseTime: 3,
              analysisTime: 8,
              totalTime: 11,
            }),
          ],
          summary: createMockSummary({
            totalFiles: 2,
            filesWithViolations: 1,
            errorCount: 1,
          }),
        }),
      )
      const calls = getOutput(consoleSpy)
      const cleanDetail = calls.find(
        (c) => typeof c === 'string' && c.includes('clean.ts') && c.includes('violation'),
      )
      expect(cleanDetail).toBeUndefined()
    })

    test('should print verbose details after summary', () => {
      const reporter = new ConsoleReporter({ verbose: true, color: false })
      reporter.report(
        createMockAnalysisResult({
          files: [
            createMockFileResult('test.ts', [createMockViolation()], {
              parseTime: 5,
              analysisTime: 10,
              totalTime: 15,
            }),
          ],
          summary: createMockSummary({ filesWithViolations: 1, errorCount: 1 }),
        }),
      )
      const calls = getOutput(consoleSpy)
      const summaryIdx = calls.findIndex((c) => typeof c === 'string' && c.includes('1 error'))
      const detailsIdx = calls.findIndex(
        (c) => typeof c === 'string' && c.includes('--- Details ---'),
      )
      expect(summaryIdx).toBeGreaterThan(-1)
      expect(detailsIdx).toBeGreaterThan(summaryIdx)
    })

    test('should handle multiple files with violations in verbose', () => {
      const reporter = new ConsoleReporter({ verbose: true, color: false })
      reporter.report(
        createMockAnalysisResult({
          files: [
            createMockFileResult('a.ts', [createMockViolation()], {
              parseTime: 1,
              analysisTime: 2,
              totalTime: 3,
            }),
            createMockFileResult('b.ts', [createMockViolation()], {
              parseTime: 4,
              analysisTime: 5,
              totalTime: 9,
            }),
          ],
          summary: createMockSummary({
            totalFiles: 2,
            filesWithViolations: 2,
            errorCount: 2,
          }),
        }),
      )
      expect(hasText(consoleSpy, 'a.ts')).toBe(true)
      expect(hasText(consoleSpy, 'b.ts')).toBe(true)
      expect(hasText(consoleSpy, 'parse: 1ms')).toBe(true)
      expect(hasText(consoleSpy, 'parse: 4ms')).toBe(true)
    })

    test('should apply dim styling to verbose details with color', () => {
      const reporter = new ConsoleReporter({ verbose: true, color: true })
      reporter.report(
        createMockAnalysisResult({
          files: [
            createMockFileResult('test.ts', [createMockViolation()], {
              parseTime: 5,
              analysisTime: 10,
              totalTime: 15,
            }),
          ],
          summary: createMockSummary({ filesWithViolations: 1, errorCount: 1 }),
        }),
      )
      const calls = getOutput(consoleSpy)
      const detailCall = calls.find((c) => typeof c === 'string' && c.includes('--- Details ---'))
      expect(detailCall).toBeDefined()
      expect(typeof detailCall === 'string' && detailCall.includes(ANSI.dim)).toBe(true)
    })

    test('should not apply dim styling without color', () => {
      const reporter = new ConsoleReporter({ verbose: true, color: false })
      reporter.report(
        createMockAnalysisResult({
          files: [
            createMockFileResult('test.ts', [createMockViolation()], {
              parseTime: 5,
              analysisTime: 10,
              totalTime: 15,
            }),
          ],
          summary: createMockSummary({ filesWithViolations: 1, errorCount: 1 }),
        }),
      )
      const noColorReporter = new ConsoleReporter({ verbose: true, color: false })
      const plainDetail = noColorReporter.format(createMockViolation())
      expect(plainDetail.includes(ANSI.dim)).toBe(false)
    })

    test('should prioritize quiet over verbose when both true', () => {
      const reporter = new ConsoleReporter({ quiet: true, verbose: true, color: false })
      reporter.report(
        createMockAnalysisResult({
          files: [
            createMockFileResult('test.ts', [createMockViolation()], {
              parseTime: 5,
              analysisTime: 10,
              totalTime: 15,
            }),
          ],
          summary: createMockSummary({ filesWithViolations: 1, errorCount: 1 }),
        }),
      )
      expect(hasText(consoleSpy, '--- Details ---')).toBe(false)
    })
  })

  describe('source snippet rendering', () => {
    test('should show source line with line number prefix', () => {
      const reporter = new ConsoleReporter({ includeSource: true, color: false })
      reporter.report(
        createMockAnalysisResult({
          files: [
            createMockFileResult('test.ts', [
              createMockViolation({ source: 'code here', line: 10 }),
            ]),
          ],
          summary: createMockSummary({ filesWithViolations: 1, errorCount: 1 }),
        }),
      )
      expect(hasText(consoleSpy, 'code here')).toBe(true)
    })

    test('should show pipe separator after line number', () => {
      const reporter = new ConsoleReporter({ includeSource: true, color: false })
      reporter.report(
        createMockAnalysisResult({
          files: [
            createMockFileResult('test.ts', [createMockViolation({ source: 'code', line: 5 })]),
          ],
          summary: createMockSummary({ filesWithViolations: 1, errorCount: 1 }),
        }),
      )
      expect(hasText(consoleSpy, ' | ')).toBe(true)
    })

    test('should show pointer character below source', () => {
      const reporter = new ConsoleReporter({ includeSource: true, color: false })
      reporter.report(
        createMockAnalysisResult({
          files: [
            createMockFileResult('test.ts', [
              createMockViolation({ source: 'code', line: 5, column: 3 }),
            ]),
          ],
          summary: createMockSummary({ filesWithViolations: 1, errorCount: 1 }),
        }),
      )
      expect(hasText(consoleSpy, '^')).toBe(true)
    })

    test('should position pointer at correct column offset', () => {
      const reporter = new ConsoleReporter({ includeSource: true, color: false })
      reporter.report(
        createMockAnalysisResult({
          files: [
            createMockFileResult('test.ts', [
              createMockViolation({ source: 'abcdef', line: 1, column: 4 }),
            ]),
          ],
          summary: createMockSummary({ filesWithViolations: 1, errorCount: 1 }),
        }),
      )
      const calls = getOutput(consoleSpy)
      const pointerCall = calls.find(
        (c) => typeof c === 'string' && c.includes('^') && !c.includes('ERROR'),
      )
      expect(pointerCall).toBeDefined()
    })

    test('should limit source to 3 lines maximum', () => {
      const reporter = new ConsoleReporter({ includeSource: true, color: false })
      const source = 'line1\nline2\nline3\nline4\nline5'
      reporter.report(
        createMockAnalysisResult({
          files: [createMockFileResult('test.ts', [createMockViolation({ source, line: 1 })])],
          summary: createMockSummary({ filesWithViolations: 1, errorCount: 1 }),
        }),
      )
      expect(hasText(consoleSpy, 'line1')).toBe(true)
      expect(hasText(consoleSpy, 'line2')).toBe(true)
      expect(hasText(consoleSpy, 'line3')).toBe(true)
      expect(hasText(consoleSpy, 'line4')).toBe(false)
      expect(hasText(consoleSpy, 'line5')).toBe(false)
    })

    test('should show all lines for 1-line source', () => {
      const reporter = new ConsoleReporter({ includeSource: true, color: false })
      reporter.report(
        createMockAnalysisResult({
          files: [
            createMockFileResult('test.ts', [
              createMockViolation({ source: 'only line', line: 1 }),
            ]),
          ],
          summary: createMockSummary({ filesWithViolations: 1, errorCount: 1 }),
        }),
      )
      expect(hasText(consoleSpy, 'only line')).toBe(true)
    })

    test('should show all lines for 2-line source', () => {
      const reporter = new ConsoleReporter({ includeSource: true, color: false })
      reporter.report(
        createMockAnalysisResult({
          files: [
            createMockFileResult('test.ts', [
              createMockViolation({ source: 'first\nsecond', line: 1 }),
            ]),
          ],
          summary: createMockSummary({ filesWithViolations: 1, errorCount: 1 }),
        }),
      )
      expect(hasText(consoleSpy, 'first')).toBe(true)
      expect(hasText(consoleSpy, 'second')).toBe(true)
    })

    test('should show all lines for exactly 3-line source', () => {
      const reporter = new ConsoleReporter({ includeSource: true, color: false })
      reporter.report(
        createMockAnalysisResult({
          files: [
            createMockFileResult('test.ts', [createMockViolation({ source: 'a\nb\nc', line: 1 })]),
          ],
          summary: createMockSummary({ filesWithViolations: 1, errorCount: 1 }),
        }),
      )
      const calls = getOutput(consoleSpy).filter((c) => typeof c === 'string' && c.includes(' | '))
      expect(calls.length).toBeGreaterThanOrEqual(3)
    })

    test('should colorize line number in gray with color enabled', () => {
      const reporter = new ConsoleReporter({ includeSource: true, color: true })
      reporter.report(
        createMockAnalysisResult({
          files: [
            createMockFileResult('test.ts', [createMockViolation({ source: 'code', line: 5 })]),
          ],
          summary: createMockSummary({ filesWithViolations: 1, errorCount: 1 }),
        }),
      )
      const calls = getOutput(consoleSpy)
      const sourceLine = calls.find(
        (c) => typeof c === 'string' && c.includes('code') && c.includes(' | '),
      )
      expect(sourceLine).toBeDefined()
      expect(typeof sourceLine === 'string' && sourceLine.includes(ANSI.gray)).toBe(true)
    })

    test('should not colorize line number without color', () => {
      const reporter = new ConsoleReporter({ includeSource: true, color: false })
      reporter.report(
        createMockAnalysisResult({
          files: [
            createMockFileResult('test.ts', [createMockViolation({ source: 'code', line: 5 })]),
          ],
          summary: createMockSummary({ filesWithViolations: 1, errorCount: 1 }),
        }),
      )
      const calls = getOutput(consoleSpy)
      const sourceLine = calls.find(
        (c) => typeof c === 'string' && c.includes('code') && c.includes(' | '),
      )
      expect(sourceLine).toBeDefined()
      expect(typeof sourceLine === 'string' && sourceLine.includes(ANSI.gray)).toBe(false)
    })

    test('should colorize pointer in red with color enabled', () => {
      const reporter = new ConsoleReporter({ includeSource: true, color: true })
      reporter.report(
        createMockAnalysisResult({
          files: [
            createMockFileResult('test.ts', [
              createMockViolation({ source: 'code', line: 5, column: 2 }),
            ]),
          ],
          summary: createMockSummary({ filesWithViolations: 1, errorCount: 1 }),
        }),
      )
      const calls = getOutput(consoleSpy)
      const pointerCall = calls.find(
        (c) => typeof c === 'string' && c.includes('^') && !c.includes('ERROR'),
      )
      expect(pointerCall).toBeDefined()
      expect(typeof pointerCall === 'string' && pointerCall.includes(ANSI.red)).toBe(true)
    })

    test('should not colorize pointer without color', () => {
      const reporter = new ConsoleReporter({ includeSource: true, color: false })
      reporter.report(
        createMockAnalysisResult({
          files: [
            createMockFileResult('test.ts', [
              createMockViolation({ source: 'code', line: 5, column: 2 }),
            ]),
          ],
          summary: createMockSummary({ filesWithViolations: 1, errorCount: 1 }),
        }),
      )
      const calls = getOutput(consoleSpy)
      const pointerCall = calls.find(
        (c) => typeof c === 'string' && c.includes('^') && !c.includes('ERROR'),
      )
      expect(pointerCall).toBeDefined()
      expect(typeof pointerCall === 'string' && pointerCall.includes(ANSI.red)).toBe(false)
    })

    test('should pad line number to 4 characters', () => {
      const reporter = new ConsoleReporter({ includeSource: true, color: false })
      reporter.report(
        createMockAnalysisResult({
          files: [
            createMockFileResult('test.ts', [createMockViolation({ source: 'code', line: 5 })]),
          ],
          summary: createMockSummary({ filesWithViolations: 1, errorCount: 1 }),
        }),
      )
      expect(hasText(consoleSpy, '   5 |')).toBe(true)
    })
  })

  describe('suggestion rendering', () => {
    test('should print suggestion with prefix', () => {
      const reporter = new ConsoleReporter({ color: false })
      reporter.report(
        createMockAnalysisResult({
          files: [
            createMockFileResult('test.ts', [createMockViolation({ suggestion: 'Use const' })]),
          ],
          summary: createMockSummary({ filesWithViolations: 1, errorCount: 1 }),
        }),
      )
      expect(hasText(consoleSpy, 'Suggestion:')).toBe(true)
      expect(hasText(consoleSpy, 'Use const')).toBe(true)
    })

    test('should apply dim styling with color enabled', () => {
      const reporter = new ConsoleReporter({ color: true })
      reporter.report(
        createMockAnalysisResult({
          files: [
            createMockFileResult('test.ts', [createMockViolation({ suggestion: 'Use const' })]),
          ],
          summary: createMockSummary({ filesWithViolations: 1, errorCount: 1 }),
        }),
      )
      const calls = getOutput(consoleSpy)
      const suggCall = calls.find((c) => typeof c === 'string' && c.includes('Suggestion:'))
      expect(suggCall).toBeDefined()
      expect(typeof suggCall === 'string' && suggCall.includes(ANSI.dim)).toBe(true)
    })

    test('should print plain text without color', () => {
      const reporter = new ConsoleReporter({ color: false })
      const output = reporter.format(createMockViolation({ suggestion: 'Use const' }))
      expect(output).not.toContain(ANSI.dim)
      expect(output).not.toContain(ANSI.red)
    })

    test('should handle suggestion with special characters', () => {
      const reporter = new ConsoleReporter({ color: false })
      reporter.report(
        createMockAnalysisResult({
          files: [
            createMockFileResult('test.ts', [
              createMockViolation({ suggestion: 'Use `const` instead of "let"' }),
            ]),
          ],
          summary: createMockSummary({ filesWithViolations: 1, errorCount: 1 }),
        }),
      )
      expect(hasText(consoleSpy, 'Use `const` instead of "let"')).toBe(true)
    })

    test('should handle long suggestion text', () => {
      const reporter = new ConsoleReporter({ color: false })
      const longSuggestion =
        'Consider refactoring this function to reduce complexity by extracting helper methods for each distinct responsibility'
      reporter.report(
        createMockAnalysisResult({
          files: [
            createMockFileResult('test.ts', [createMockViolation({ suggestion: longSuggestion })]),
          ],
          summary: createMockSummary({ filesWithViolations: 1, errorCount: 1 }),
        }),
      )
      expect(hasText(consoleSpy, longSuggestion)).toBe(true)
    })

    test('should print suggestion after source snippet', () => {
      const reporter = new ConsoleReporter({ includeSource: true, color: false })
      reporter.report(
        createMockAnalysisResult({
          files: [
            createMockFileResult('test.ts', [
              createMockViolation({
                source: 'let x = 1;',
                suggestion: 'Use const',
                line: 1,
              }),
            ]),
          ],
          summary: createMockSummary({ filesWithViolations: 1, errorCount: 1 }),
        }),
      )
      const calls = getOutput(consoleSpy)
      const sourceIdx = calls.findIndex((c) => typeof c === 'string' && c.includes('let x = 1;'))
      const suggIdx = calls.findIndex((c) => typeof c === 'string' && c.includes('Suggestion:'))
      expect(sourceIdx).toBeGreaterThan(-1)
      expect(suggIdx).toBeGreaterThan(sourceIdx)
    })

    test('should handle multiple violations with different suggestions', () => {
      const reporter = new ConsoleReporter({ color: false })
      reporter.report(
        createMockAnalysisResult({
          files: [
            createMockFileResult('test.ts', [
              createMockViolation({ ruleId: 'r1', suggestion: 'Fix A' }),
              createMockViolation({ ruleId: 'r2', suggestion: 'Fix B' }),
            ]),
          ],
          summary: createMockSummary({ filesWithViolations: 1, errorCount: 2 }),
        }),
      )
      expect(hasText(consoleSpy, 'Fix A')).toBe(true)
      expect(hasText(consoleSpy, 'Fix B')).toBe(true)
    })

    test('should not print when suggestion is not present', () => {
      const reporter = new ConsoleReporter({ color: false })
      reporter.report(
        createMockAnalysisResult({
          files: [createMockFileResult('test.ts', [createMockViolation()])],
          summary: createMockSummary({ filesWithViolations: 1, errorCount: 1 }),
        }),
      )
      expect(hasText(consoleSpy, 'Suggestion:')).toBe(false)
    })

    test('should handle suggestion with code examples', () => {
      const reporter = new ConsoleReporter({ color: false })
      const suggestion = 'Replace with: const x = y ?? defaultValue'
      reporter.report(
        createMockAnalysisResult({
          files: [createMockFileResult('test.ts', [createMockViolation({ suggestion })])],
          summary: createMockSummary({ filesWithViolations: 1, errorCount: 1 }),
        }),
      )
      expect(hasText(consoleSpy, suggestion)).toBe(true)
    })
  })

  describe('summary detailed formatting', () => {
    test('should show error count with icon', () => {
      const reporter = new ConsoleReporter({ color: false })
      reporter.report(
        createMockAnalysisResult({
          files: [createMockFileResult('test.ts', [createMockViolation()])],
          summary: createMockSummary({ filesWithViolations: 1, errorCount: 3 }),
        }),
      )
      expect(hasText(consoleSpy, '✖ 3 errors')).toBe(true)
    })

    test('should show warning count with icon', () => {
      const reporter = new ConsoleReporter({ color: false })
      reporter.report(
        createMockAnalysisResult({
          files: [createMockFileResult('test.ts', [createMockViolation({ severity: 'warning' })])],
          summary: createMockSummary({ filesWithViolations: 1, warningCount: 2 }),
        }),
      )
      expect(hasText(consoleSpy, '⚠ 2 warnings')).toBe(true)
    })

    test('should show info count with icon', () => {
      const reporter = new ConsoleReporter({ color: false })
      reporter.report(
        createMockAnalysisResult({
          files: [createMockFileResult('test.ts', [createMockViolation({ severity: 'info' })])],
          summary: createMockSummary({ filesWithViolations: 1, infoCount: 4 }),
        }),
      )
      expect(hasText(consoleSpy, 'ℹ 4 info')).toBe(true)
    })

    test('should use singular "error" for count of 1', () => {
      const reporter = new ConsoleReporter({ color: false })
      reporter.report(
        createMockAnalysisResult({
          files: [createMockFileResult('test.ts', [createMockViolation()])],
          summary: createMockSummary({ filesWithViolations: 1, errorCount: 1 }),
        }),
      )
      expect(hasText(consoleSpy, '1 error')).toBe(true)
      expect(hasText(consoleSpy, '1 errors')).toBe(false)
    })

    test('should use plural "errors" for count of 2', () => {
      const reporter = new ConsoleReporter({ color: false })
      reporter.report(
        createMockAnalysisResult({
          files: [createMockFileResult('test.ts', [createMockViolation()])],
          summary: createMockSummary({ filesWithViolations: 1, errorCount: 2 }),
        }),
      )
      expect(hasText(consoleSpy, '2 errors')).toBe(true)
    })

    test('should use singular "warning" for count of 1', () => {
      const reporter = new ConsoleReporter({ color: false })
      reporter.report(
        createMockAnalysisResult({
          files: [createMockFileResult('test.ts', [createMockViolation({ severity: 'warning' })])],
          summary: createMockSummary({ filesWithViolations: 1, warningCount: 1 }),
        }),
      )
      expect(hasText(consoleSpy, '1 warning')).toBe(true)
      expect(hasText(consoleSpy, '1 warnings')).toBe(false)
    })

    test('should use plural "warnings" for count of 2', () => {
      const reporter = new ConsoleReporter({ color: false })
      reporter.report(
        createMockAnalysisResult({
          files: [createMockFileResult('test.ts', [createMockViolation({ severity: 'warning' })])],
          summary: createMockSummary({ filesWithViolations: 1, warningCount: 2 }),
        }),
      )
      expect(hasText(consoleSpy, '2 warnings')).toBe(true)
    })

    test('should always show "info" regardless of count', () => {
      const reporter = new ConsoleReporter({ color: false })
      reporter.report(
        createMockAnalysisResult({
          files: [createMockFileResult('test.ts', [createMockViolation({ severity: 'info' })])],
          summary: createMockSummary({ filesWithViolations: 1, infoCount: 1 }),
        }),
      )
      expect(hasText(consoleSpy, '1 info')).toBe(true)
    })

    test('should show "No problems found" when all counts zero', () => {
      const reporter = new ConsoleReporter({ color: false })
      reporter.report(
        createMockAnalysisResult({
          files: [createMockFileResult('test.ts', [])],
          summary: createMockSummary({ totalFiles: 1 }),
        }),
      )
      expect(hasText(consoleSpy, 'No problems found')).toBe(true)
    })

    test('should show checkmark icon for no problems', () => {
      const reporter = new ConsoleReporter({ color: false })
      reporter.report(
        createMockAnalysisResult({
          files: [createMockFileResult('test.ts', [])],
          summary: createMockSummary({ totalFiles: 1 }),
        }),
      )
      expect(hasText(consoleSpy, '✓')).toBe(true)
    })

    test('should show file count in summary', () => {
      const reporter = new ConsoleReporter({ color: false })
      reporter.report(
        createMockAnalysisResult({
          files: [createMockFileResult('test.ts', [])],
          summary: createMockSummary({ totalFiles: 7 }),
        }),
      )
      expect(hasText(consoleSpy, '7 files analyzed')).toBe(true)
    })

    test('should use singular "file" for 1 file', () => {
      const reporter = new ConsoleReporter({ color: false })
      reporter.report(
        createMockAnalysisResult({
          files: [createMockFileResult('test.ts', [])],
          summary: createMockSummary({ totalFiles: 1 }),
        }),
      )
      expect(hasText(consoleSpy, '1 file analyzed')).toBe(true)
    })

    test('should use plural "files" for 2+ files', () => {
      const reporter = new ConsoleReporter({ color: false })
      reporter.report(
        createMockAnalysisResult({
          files: [createMockFileResult('test.ts', [])],
          summary: createMockSummary({ totalFiles: 3 }),
        }),
      )
      expect(hasText(consoleSpy, '3 files analyzed')).toBe(true)
    })

    test('should show total time in summary', () => {
      const reporter = new ConsoleReporter({ color: false })
      reporter.report(
        createMockAnalysisResult({
          files: [createMockFileResult('test.ts', [])],
          summary: createMockSummary({ totalFiles: 1, totalTime: 200 }),
        }),
      )
      expect(hasText(consoleSpy, '200ms')).toBe(true)
    })

    test('should show mixed error and warning counts', () => {
      const reporter = new ConsoleReporter({ color: false })
      reporter.report(
        createMockAnalysisResult({
          files: [createMockFileResult('test.ts', [createMockViolation()])],
          summary: createMockSummary({
            filesWithViolations: 1,
            errorCount: 2,
            warningCount: 3,
          }),
        }),
      )
      expect(hasText(consoleSpy, '2 errors')).toBe(true)
      expect(hasText(consoleSpy, '3 warnings')).toBe(true)
    })

    test('should show mixed error and info counts', () => {
      const reporter = new ConsoleReporter({ color: false })
      reporter.report(
        createMockAnalysisResult({
          files: [createMockFileResult('test.ts', [createMockViolation()])],
          summary: createMockSummary({
            filesWithViolations: 1,
            errorCount: 1,
            infoCount: 5,
          }),
        }),
      )
      expect(hasText(consoleSpy, '1 error')).toBe(true)
      expect(hasText(consoleSpy, '5 info')).toBe(true)
    })

    test('should not show error count when zero', () => {
      const reporter = new ConsoleReporter({ color: false })
      reporter.report(
        createMockAnalysisResult({
          files: [createMockFileResult('test.ts', [createMockViolation({ severity: 'warning' })])],
          summary: createMockSummary({ filesWithViolations: 1, warningCount: 1 }),
        }),
      )
      expect(hasText(consoleSpy, '0 error')).toBe(false)
    })
  })

  describe('time formatting in reports', () => {
    test('should display 0ms for zero time', () => {
      const reporter = new ConsoleReporter({ color: false })
      reporter.report(
        createMockAnalysisResult({
          files: [createMockFileResult('test.ts', [])],
          summary: createMockSummary({ totalFiles: 1, totalTime: 0 }),
        }),
      )
      expect(hasText(consoleSpy, '0ms')).toBe(true)
    })

    test('should display 1ms for 1 millisecond', () => {
      const reporter = new ConsoleReporter({ color: false })
      reporter.report(
        createMockAnalysisResult({
          files: [createMockFileResult('test.ts', [])],
          summary: createMockSummary({ totalFiles: 1, totalTime: 1 }),
        }),
      )
      expect(hasText(consoleSpy, '1ms')).toBe(true)
    })

    test('should display 999ms for just under threshold', () => {
      const reporter = new ConsoleReporter({ color: false })
      reporter.report(
        createMockAnalysisResult({
          files: [createMockFileResult('test.ts', [])],
          summary: createMockSummary({ totalFiles: 1, totalTime: 999 }),
        }),
      )
      expect(hasText(consoleSpy, '999ms')).toBe(true)
    })

    test('should display 1.00s for exactly 1 second', () => {
      const reporter = new ConsoleReporter({ color: false })
      reporter.report(
        createMockAnalysisResult({
          files: [createMockFileResult('test.ts', [])],
          summary: createMockSummary({ totalFiles: 1, totalTime: 1000 }),
        }),
      )
      expect(hasText(consoleSpy, '1.00s')).toBe(true)
    })

    test('should display 1.50s for 1500ms', () => {
      const reporter = new ConsoleReporter({ color: false })
      reporter.report(
        createMockAnalysisResult({
          files: [createMockFileResult('test.ts', [])],
          summary: createMockSummary({ totalFiles: 1, totalTime: 1500 }),
        }),
      )
      expect(hasText(consoleSpy, '1.50s')).toBe(true)
    })

    test('should display 10.00s for 10 seconds', () => {
      const reporter = new ConsoleReporter({ color: false })
      reporter.report(
        createMockAnalysisResult({
          files: [createMockFileResult('test.ts', [])],
          summary: createMockSummary({ totalFiles: 1, totalTime: 10000 }),
        }),
      )
      expect(hasText(consoleSpy, '10.00s')).toBe(true)
    })

    test('should display 60.00s for 1 minute', () => {
      const reporter = new ConsoleReporter({ color: false })
      reporter.report(
        createMockAnalysisResult({
          files: [createMockFileResult('test.ts', [])],
          summary: createMockSummary({ totalFiles: 1, totalTime: 60000 }),
        }),
      )
      expect(hasText(consoleSpy, '60.00s')).toBe(true)
    })

    test('should display 500ms for 500ms', () => {
      const reporter = new ConsoleReporter({ color: false })
      reporter.report(
        createMockAnalysisResult({
          files: [createMockFileResult('test.ts', [])],
          summary: createMockSummary({ totalFiles: 1, totalTime: 500 }),
        }),
      )
      expect(hasText(consoleSpy, '500ms')).toBe(true)
    })

    test('should display 1.23s for 1234ms', () => {
      const reporter = new ConsoleReporter({ color: false })
      reporter.report(
        createMockAnalysisResult({
          files: [createMockFileResult('test.ts', [])],
          summary: createMockSummary({ totalFiles: 1, totalTime: 1234 }),
        }),
      )
      expect(hasText(consoleSpy, '1.23s')).toBe(true)
    })

    test('should display 100.00s for 100 seconds', () => {
      const reporter = new ConsoleReporter({ color: false })
      reporter.report(
        createMockAnalysisResult({
          files: [createMockFileResult('test.ts', [])],
          summary: createMockSummary({ totalFiles: 1, totalTime: 100000 }),
        }),
      )
      expect(hasText(consoleSpy, '100.00s')).toBe(true)
    })
  })

  describe('color mode specifics', () => {
    test('should apply cyan and bold to file headers', () => {
      const reporter = new ConsoleReporter({ color: true })
      reporter.report(
        createMockAnalysisResult({
          files: [createMockFileResult('app.ts', [createMockViolation()])],
          summary: createMockSummary({ filesWithViolations: 1, errorCount: 1 }),
        }),
      )
      const calls = getOutput(consoleSpy)
      const headerCall = calls.find(
        (c) =>
          typeof c === 'string' &&
          c.includes(ANSI.cyan) &&
          c.includes(ANSI.bold) &&
          c.includes('app.ts'),
      )
      expect(headerCall).toBeDefined()
    })

    test('should apply red to error counts in summary', () => {
      const reporter = new ConsoleReporter({ color: true })
      reporter.report(
        createMockAnalysisResult({
          files: [createMockFileResult('test.ts', [createMockViolation()])],
          summary: createMockSummary({ filesWithViolations: 1, errorCount: 1 }),
        }),
      )
      const calls = getOutput(consoleSpy)
      const errorSummary = calls.find(
        (c) => typeof c === 'string' && c.includes(ANSI.red) && c.includes('1 error'),
      )
      expect(errorSummary).toBeDefined()
    })

    test('should apply yellow to warning counts in summary', () => {
      const reporter = new ConsoleReporter({ color: true })
      reporter.report(
        createMockAnalysisResult({
          files: [createMockFileResult('test.ts', [createMockViolation({ severity: 'warning' })])],
          summary: createMockSummary({ filesWithViolations: 1, warningCount: 1 }),
        }),
      )
      const calls = getOutput(consoleSpy)
      const warnSummary = calls.find(
        (c) => typeof c === 'string' && c.includes(ANSI.yellow) && c.includes('1 warning'),
      )
      expect(warnSummary).toBeDefined()
    })

    test('should apply blue to info counts in summary', () => {
      const reporter = new ConsoleReporter({ color: true })
      reporter.report(
        createMockAnalysisResult({
          files: [createMockFileResult('test.ts', [createMockViolation({ severity: 'info' })])],
          summary: createMockSummary({ filesWithViolations: 1, infoCount: 1 }),
        }),
      )
      const calls = getOutput(consoleSpy)
      const infoSummary = calls.find(
        (c) => typeof c === 'string' && c.includes(ANSI.blue) && c.includes('1 info'),
      )
      expect(infoSummary).toBeDefined()
    })

    test('should apply green to no-problems message', () => {
      const reporter = new ConsoleReporter({ color: true })
      reporter.report(
        createMockAnalysisResult({
          files: [createMockFileResult('test.ts', [])],
          summary: createMockSummary({ totalFiles: 1 }),
        }),
      )
      const calls = getOutput(consoleSpy)
      const noProblems = calls.find(
        (c) => typeof c === 'string' && c.includes(ANSI.green) && c.includes('No problems found'),
      )
      expect(noProblems).toBeDefined()
    })

    test('should apply gray to file count line', () => {
      const reporter = new ConsoleReporter({ color: true })
      reporter.report(
        createMockAnalysisResult({
          files: [createMockFileResult('test.ts', [])],
          summary: createMockSummary({ totalFiles: 1 }),
        }),
      )
      const calls = getOutput(consoleSpy)
      const fileLine = calls.find(
        (c) =>
          typeof c === 'string' &&
          c.includes(ANSI.gray) &&
          c.includes('file') &&
          c.includes('analyzed'),
      )
      expect(fileLine).toBeDefined()
    })

    test('should produce no reporter ANSI codes when color is false', () => {
      const reporter = new ConsoleReporter({ color: false })
      const output = reporter.format(createMockViolation())
      expect(output).not.toContain(ANSI.red)
      expect(output).not.toContain(ANSI.green)
      expect(output).not.toContain(ANSI.yellow)
      expect(output).not.toContain(ANSI.blue)
      expect(output).not.toContain(ANSI.cyan)
      expect(output).not.toContain(ANSI.bold)
    })

    test('should include reset after colored severity in format', () => {
      const reporter = new ConsoleReporter({ color: true })
      const output = reporter.format(createMockViolation({ severity: 'error' }))
      expect(output).toContain(ANSI.reset)
    })

    test('should apply correct severity color to formatted violation', () => {
      const reporter = new ConsoleReporter({ color: true })
      const errOutput = reporter.format(createMockViolation({ severity: 'error' }))
      const warnOutput = reporter.format(createMockViolation({ severity: 'warning' }))
      const infoOutput = reporter.format(createMockViolation({ severity: 'info' }))
      expect(errOutput).toContain(ANSI.red)
      expect(warnOutput).toContain(ANSI.yellow)
      expect(infoOutput).toContain(ANSI.blue)
    })

    test('should colorize verbose details with dim', () => {
      const reporter = new ConsoleReporter({ verbose: true, color: true })
      reporter.report(
        createMockAnalysisResult({
          files: [
            createMockFileResult('test.ts', [createMockViolation()], {
              parseTime: 5,
              analysisTime: 10,
              totalTime: 15,
            }),
          ],
          summary: createMockSummary({ filesWithViolations: 1, errorCount: 1 }),
        }),
      )
      const calls = getOutput(consoleSpy)
      const detailLine = calls.find((c) => typeof c === 'string' && c.includes('parse: 5ms'))
      expect(detailLine).toBeDefined()
      expect(typeof detailLine === 'string' && detailLine.includes(ANSI.dim)).toBe(true)
    })

    test('should apply bold to location in colored format output', () => {
      const reporter = new ConsoleReporter({ color: true })
      const output = reporter.format(createMockViolation({ filePath: 'f.ts', line: 1, column: 1 }))
      const locationInOutput = output.includes(ANSI.bold + 'f.ts:1:1')
      expect(locationInOutput).toBe(true)
    })
  })

  describe('violation sorting by severity', () => {
    test('should sort info before warning in same file', () => {
      const reporter = new ConsoleReporter({ color: false })
      reporter.report(
        createMockAnalysisResult({
          files: [
            createMockFileResult('test.ts', [
              createMockViolation({ severity: 'warning', ruleId: 'wrn' }),
              createMockViolation({ severity: 'info', ruleId: 'inf' }),
            ]),
          ],
          summary: createMockSummary({
            filesWithViolations: 1,
            warningCount: 1,
            infoCount: 1,
          }),
        }),
      )
      const calls = getOutput(consoleSpy)
      const infoIdx = calls.findIndex(
        (c) => typeof c === 'string' && c.includes('inf') && c.includes('INFO'),
      )
      const warnIdx = calls.findIndex(
        (c) => typeof c === 'string' && c.includes('wrn') && c.includes('WARNING'),
      )
      expect(infoIdx).toBeGreaterThan(-1)
      expect(warnIdx).toBeGreaterThan(-1)
      expect(infoIdx).toBeLessThan(warnIdx)
    })

    test('should sort info before error in same file', () => {
      const reporter = new ConsoleReporter({ color: false })
      reporter.report(
        createMockAnalysisResult({
          files: [
            createMockFileResult('test.ts', [
              createMockViolation({ severity: 'error', ruleId: 'err' }),
              createMockViolation({ severity: 'info', ruleId: 'inf' }),
            ]),
          ],
          summary: createMockSummary({
            filesWithViolations: 1,
            errorCount: 1,
            infoCount: 1,
          }),
        }),
      )
      const calls = getOutput(consoleSpy)
      const infoIdx = calls.findIndex(
        (c) => typeof c === 'string' && c.includes('inf') && c.includes('INFO'),
      )
      const errIdx = calls.findIndex(
        (c) => typeof c === 'string' && c.includes('err') && c.includes('ERROR'),
      )
      expect(infoIdx).toBeGreaterThan(-1)
      expect(errIdx).toBeGreaterThan(-1)
      expect(infoIdx).toBeLessThan(errIdx)
    })

    test('should sort warning before error in same file', () => {
      const reporter = new ConsoleReporter({ color: false })
      reporter.report(
        createMockAnalysisResult({
          files: [
            createMockFileResult('test.ts', [
              createMockViolation({ severity: 'error', ruleId: 'err' }),
              createMockViolation({ severity: 'warning', ruleId: 'wrn' }),
            ]),
          ],
          summary: createMockSummary({
            filesWithViolations: 1,
            errorCount: 1,
            warningCount: 1,
          }),
        }),
      )
      const calls = getOutput(consoleSpy)
      const warnIdx = calls.findIndex(
        (c) => typeof c === 'string' && c.includes('wrn') && c.includes('WARNING'),
      )
      const errIdx = calls.findIndex(
        (c) => typeof c === 'string' && c.includes('err') && c.includes('ERROR'),
      )
      expect(warnIdx).toBeGreaterThan(-1)
      expect(errIdx).toBeGreaterThan(-1)
      expect(warnIdx).toBeLessThan(errIdx)
    })

    test('should sort all three severities correctly', () => {
      const reporter = new ConsoleReporter({ color: false })
      reporter.report(
        createMockAnalysisResult({
          files: [
            createMockFileResult('test.ts', [
              createMockViolation({ severity: 'error', ruleId: 'err' }),
              createMockViolation({ severity: 'info', ruleId: 'inf' }),
              createMockViolation({ severity: 'warning', ruleId: 'wrn' }),
            ]),
          ],
          summary: createMockSummary({
            filesWithViolations: 1,
            errorCount: 1,
            warningCount: 1,
            infoCount: 1,
          }),
        }),
      )
      const calls = getOutput(consoleSpy)
      const infoIdx = calls.findIndex(
        (c) => typeof c === 'string' && c.includes('inf') && c.includes('INFO'),
      )
      const warnIdx = calls.findIndex(
        (c) => typeof c === 'string' && c.includes('wrn') && c.includes('WARNING'),
      )
      const errIdx = calls.findIndex(
        (c) => typeof c === 'string' && c.includes('err') && c.includes('ERROR'),
      )
      expect(infoIdx).toBeLessThan(warnIdx)
      expect(warnIdx).toBeLessThan(errIdx)
    })

    test('should group multiple errors together', () => {
      const reporter = new ConsoleReporter({ color: false })
      reporter.report(
        createMockAnalysisResult({
          files: [
            createMockFileResult('test.ts', [
              createMockViolation({ severity: 'error', ruleId: 'e1' }),
              createMockViolation({ severity: 'warning', ruleId: 'w1' }),
              createMockViolation({ severity: 'error', ruleId: 'e2' }),
            ]),
          ],
          summary: createMockSummary({
            filesWithViolations: 1,
            errorCount: 2,
            warningCount: 1,
          }),
        }),
      )
      const calls = getOutput(consoleSpy)
      const e1Idx = calls.findIndex((c) => typeof c === 'string' && c.includes('e1'))
      const w1Idx = calls.findIndex((c) => typeof c === 'string' && c.includes('w1'))
      const e2Idx = calls.findIndex((c) => typeof c === 'string' && c.includes('e2'))
      expect(w1Idx).toBeLessThan(e1Idx)
      expect(w1Idx).toBeLessThan(e2Idx)
    })

    test('should group multiple warnings together', () => {
      const reporter = new ConsoleReporter({ color: false })
      reporter.report(
        createMockAnalysisResult({
          files: [
            createMockFileResult('test.ts', [
              createMockViolation({ severity: 'warning', ruleId: 'w1' }),
              createMockViolation({ severity: 'info', ruleId: 'i1' }),
              createMockViolation({ severity: 'warning', ruleId: 'w2' }),
            ]),
          ],
          summary: createMockSummary({
            filesWithViolations: 1,
            warningCount: 2,
            infoCount: 1,
          }),
        }),
      )
      const calls = getOutput(consoleSpy)
      const w1Idx = calls.findIndex((c) => typeof c === 'string' && c.includes('w1'))
      const i1Idx = calls.findIndex((c) => typeof c === 'string' && c.includes('i1'))
      const w2Idx = calls.findIndex((c) => typeof c === 'string' && c.includes('w2'))
      expect(i1Idx).toBeLessThan(w1Idx)
      expect(i1Idx).toBeLessThan(w2Idx)
    })

    test('should preserve all violations after sorting', () => {
      const reporter = new ConsoleReporter({ color: false })
      reporter.report(
        createMockAnalysisResult({
          files: [
            createMockFileResult('test.ts', [
              createMockViolation({ severity: 'error', ruleId: 'r1' }),
              createMockViolation({ severity: 'warning', ruleId: 'r2' }),
              createMockViolation({ severity: 'info', ruleId: 'r3' }),
            ]),
          ],
          summary: createMockSummary({
            filesWithViolations: 1,
            errorCount: 1,
            warningCount: 1,
            infoCount: 1,
          }),
        }),
      )
      expect(hasText(consoleSpy, 'r1')).toBe(true)
      expect(hasText(consoleSpy, 'r2')).toBe(true)
      expect(hasText(consoleSpy, 'r3')).toBe(true)
    })
  })

  describe('reporter reusability', () => {
    test('should produce same output on repeated calls', () => {
      const reporter = new ConsoleReporter({ color: false })
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [createMockViolation()])],
        summary: createMockSummary({ filesWithViolations: 1, errorCount: 1 }),
      })
      reporter.report(results)
      const firstCallCount = consoleSpy.mock.calls.length
      reporter.report(results)
      expect(consoleSpy.mock.calls.length).toBe(firstCallCount * 2)
    })

    test('should handle different results on different calls', () => {
      const reporter = new ConsoleReporter({ color: false })
      const result1 = createMockAnalysisResult({
        files: [createMockFileResult('a.ts', [createMockViolation({ ruleId: 'r1' })])],
        summary: createMockSummary({ filesWithViolations: 1, errorCount: 1 }),
      })
      const result2 = createMockAnalysisResult({
        files: [createMockFileResult('b.ts', [createMockViolation({ ruleId: 'r2' })])],
        summary: createMockSummary({ filesWithViolations: 1, errorCount: 1 }),
      })
      reporter.report(result1)
      expect(hasText(consoleSpy, 'r1')).toBe(true)
      reporter.report(result2)
      expect(hasText(consoleSpy, 'r2')).toBe(true)
    })

    test('should allow format calls between reports', () => {
      const reporter = new ConsoleReporter({ color: false })
      const formatted = reporter.format(createMockViolation())
      expect(formatted).toContain('ERROR')
      reporter.report(
        createMockAnalysisResult({
          files: [createMockFileResult('test.ts', [createMockViolation()])],
          summary: createMockSummary({ filesWithViolations: 1, errorCount: 1 }),
        }),
      )
      expect(hasText(consoleSpy, 'ERROR')).toBe(true)
    })

    test('should handle report called with empty results then with data', () => {
      const reporter = new ConsoleReporter({ color: false })
      reporter.report(createMockAnalysisResult({ files: [] }))
      expect(hasText(consoleSpy, 'No files analyzed')).toBe(true)
      reporter.report(
        createMockAnalysisResult({
          files: [createMockFileResult('test.ts', [createMockViolation()])],
          summary: createMockSummary({ filesWithViolations: 1, errorCount: 1 }),
        }),
      )
      expect(hasText(consoleSpy, 'test.ts')).toBe(true)
    })

    test('should not accumulate state between reports', () => {
      const reporter = new ConsoleReporter({ color: false })
      reporter.report(
        createMockAnalysisResult({
          files: [createMockFileResult('a.ts', [createMockViolation({ ruleId: 'rule-a' })])],
          summary: createMockSummary({ filesWithViolations: 1, errorCount: 1 }),
        }),
      )
      const callCountAfterFirst = consoleSpy.mock.calls.length
      reporter.report(
        createMockAnalysisResult({
          files: [createMockFileResult('b.ts', [createMockViolation({ ruleId: 'rule-b' })])],
          summary: createMockSummary({ filesWithViolations: 1, errorCount: 1 }),
        }),
      )
      expect(consoleSpy.mock.calls.length).toBe(callCountAfterFirst * 2)
    })
  })

  describe('file path variations', () => {
    test('should handle Unix-style absolute path', () => {
      const reporter = new ConsoleReporter({ color: false })
      const output = reporter.format(
        createMockViolation({ filePath: '/home/user/project/src/app.ts' }),
      )
      expect(output).toContain('/home/user/project/src/app.ts')
    })

    test('should handle relative path with parent directory', () => {
      const reporter = new ConsoleReporter({ color: false })
      const output = reporter.format(createMockViolation({ filePath: '../shared/utils.ts' }))
      expect(output).toContain('../shared/utils.ts')
    })

    test('should handle file with multiple extensions', () => {
      const reporter = new ConsoleReporter({ color: false })
      const output = reporter.format(createMockViolation({ filePath: 'config.spec.ts' }))
      expect(output).toContain('config.spec.ts')
    })

    test('should handle single-component file name', () => {
      const reporter = new ConsoleReporter({ color: false })
      const output = reporter.format(createMockViolation({ filePath: 'index.ts' }))
      expect(output).toContain('index.ts')
    })

    test('should handle path with dots in directory name', () => {
      const reporter = new ConsoleReporter({ color: false })
      const output = reporter.format(createMockViolation({ filePath: 'src/v2.0/app.ts' }))
      expect(output).toContain('src/v2.0/app.ts')
    })

    test('should display path in file header during report', () => {
      const reporter = new ConsoleReporter({ color: false })
      reporter.report(
        createMockAnalysisResult({
          files: [createMockFileResult('deep/nested/path/file.ts', [createMockViolation()])],
          summary: createMockSummary({ filesWithViolations: 1, errorCount: 1 }),
        }),
      )
      expect(hasText(consoleSpy, 'deep/nested/path/file.ts')).toBe(true)
    })

    test('should include path in formatted violation', () => {
      const reporter = new ConsoleReporter({ color: false })
      const output = reporter.format(createMockViolation({ filePath: 'components/Button.tsx' }))
      expect(output).toContain('components/Button.tsx')
    })

    test('should handle path with underscores and hyphens', () => {
      const reporter = new ConsoleReporter({ color: false })
      const output = reporter.format(
        createMockViolation({ filePath: 'src/my-component/_utils.ts' }),
      )
      expect(output).toContain('src/my-component/_utils.ts')
    })
  })

  describe('violation message variations', () => {
    test('should handle empty message in format', () => {
      const reporter = new ConsoleReporter({ color: false })
      const output = reporter.format(createMockViolation({ message: '' }))
      expect(output).toContain('ERROR')
      expect(output).toContain('[test-rule]')
    })

    test('should handle single-character message in format', () => {
      const reporter = new ConsoleReporter({ color: false })
      const output = reporter.format(createMockViolation({ message: '!' }))
      expect(output).toContain('!')
    })

    test('should handle message with colons in format', () => {
      const reporter = new ConsoleReporter({ color: false })
      const output = reporter.format(createMockViolation({ message: 'Missing: semicolon' }))
      expect(output).toContain('Missing: semicolon')
    })

    test('should handle message with square brackets in format', () => {
      const reporter = new ConsoleReporter({ color: false })
      const output = reporter.format(createMockViolation({ message: 'Array [0] is out of bounds' }))
      expect(output).toContain('Array [0] is out of bounds')
    })

    test('should handle message with parentheses in format', () => {
      const reporter = new ConsoleReporter({ color: false })
      const output = reporter.format(createMockViolation({ message: 'Call foo() without check' }))
      expect(output).toContain('Call foo() without check')
    })

    test('should handle message with Unicode characters in format', () => {
      const reporter = new ConsoleReporter({ color: false })
      const output = reporter.format(createMockViolation({ message: 'Trailing comma 末尾' }))
      expect(output).toContain('Trailing comma 末尾')
    })

    test('should handle very long message in format', () => {
      const reporter = new ConsoleReporter({ color: false })
      const longMsg =
        'This is a very long violation message that describes in detail what went wrong with the code and provides extensive context about the issue'
      const output = reporter.format(createMockViolation({ message: longMsg }))
      expect(output).toContain(longMsg)
    })

    test('should handle message with multiple sentences in format', () => {
      const reporter = new ConsoleReporter({ color: false })
      const output = reporter.format(
        createMockViolation({
          message: 'Variable is unused. Consider removing it.',
        }),
      )
      expect(output).toContain('Variable is unused. Consider removing it.')
    })
  })

  describe('additional edge cases', () => {
    test('should handle report with only clean files', () => {
      const reporter = new ConsoleReporter({ color: false })
      reporter.report(
        createMockAnalysisResult({
          files: [createMockFileResult('a.ts', []), createMockFileResult('b.ts', [])],
          summary: createMockSummary({ totalFiles: 2 }),
        }),
      )
      expect(hasText(consoleSpy, 'No problems found')).toBe(true)
      expect(hasText(consoleSpy, '2 files analyzed')).toBe(true)
    })

    test('should handle zero total time', () => {
      const reporter = new ConsoleReporter({ color: false })
      const output = reporter.format(createMockViolation({ message: 'test' }))
      expect(output).toContain('test')
    })

    test('should handle violation at end of file', () => {
      const reporter = new ConsoleReporter({ color: false })
      const output = reporter.format(createMockViolation({ line: 500, column: 80 }))
      expect(output).toContain(':500:80')
    })

    test('should handle timestamp field in results', () => {
      const reporter = new ConsoleReporter({ color: false })
      reporter.report(
        createMockAnalysisResult({
          files: [createMockFileResult('test.ts', [createMockViolation()])],
          summary: createMockSummary({ filesWithViolations: 1, errorCount: 1 }),
          timestamp: '2024-06-15T14:30:00.000Z',
        }),
      )
      expect(consoleSpy).toHaveBeenCalled()
    })

    test('should handle version field in results', () => {
      const reporter = new ConsoleReporter({ color: false })
      reporter.report(
        createMockAnalysisResult({
          files: [createMockFileResult('test.ts', [])],
          version: '2.0.0',
        }),
      )
      expect(consoleSpy).toHaveBeenCalled()
    })

    test('should produce consistent output across multiple format calls', () => {
      const reporter = new ConsoleReporter({ color: false })
      const violation = createMockViolation({ ruleId: 'consistent-rule' })
      const out1 = reporter.format(violation)
      const out2 = reporter.format(violation)
      const out3 = reporter.format(violation)
      expect(out1).toBe(out2)
      expect(out2).toBe(out3)
    })

    test('should handle report after report with no state corruption', () => {
      const reporter = new ConsoleReporter({ color: false })
      reporter.report(
        createMockAnalysisResult({
          files: [createMockFileResult('err.ts', [createMockViolation({ severity: 'error' })])],
          summary: createMockSummary({ filesWithViolations: 1, errorCount: 1 }),
        }),
      )
      consoleSpy.mockClear()
      reporter.report(
        createMockAnalysisResult({
          files: [createMockFileResult('clean.ts', [])],
          summary: createMockSummary({ totalFiles: 1 }),
        }),
      )
      expect(hasText(consoleSpy, 'err.ts')).toBe(false)
      expect(hasText(consoleSpy, 'No problems found')).toBe(true)
    })
  })
})
