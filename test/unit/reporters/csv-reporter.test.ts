import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { CSVReporter, createCSVReporter } from '../../../src/reporters/csv-reporter.js'
import type { AnalysisResult, Violation } from '../../../src/reporters/types.js'

function createMockViolation(overrides: Partial<Violation> = {}): Violation {
  return {
    filePath: '/src/test.ts',
    line: 1,
    column: 1,
    severity: 'error',
    ruleId: 'test-rule',
    message: 'Test violation',
    ...overrides,
  }
}

function createMockResult(violations: Violation[] = []): AnalysisResult {
  return {
    files: violations.map((v) => ({
      filePath: v.filePath,
      stats: {
        analysisTime: 1,
        parseTime: 1,
        totalTime: 2,
      },
      violations: [v],
    })),
    summary: {
      totalFiles: violations.length,
      filesWithViolations: violations.length,
      errorCount: violations.filter((v) => v.severity === 'error').length,
      warningCount: violations.filter((v) => v.severity === 'warning').length,
      infoCount: violations.filter((v) => v.severity === 'info').length,
      totalTime: 100,
    },
    timestamp: '2026-03-17T00:00:00.000Z',
    version: '1.0.0',
  }
}

describe('CSVReporter', () => {
  describe('constructor', () => {
    test('creates reporter with default options', () => {
      const reporter = new CSVReporter({})
      expect(reporter.name).toBe('csv')
    })

    test('creates reporter with output path', () => {
      const reporter = new CSVReporter({ outputPath: '/tmp/output.csv' })
      expect(reporter.name).toBe('csv')
    })
  })

  describe('format', () => {
    test('formats single violation', () => {
      const reporter = new CSVReporter({})
      const violation = createMockViolation()
      const formatted = reporter.format(violation)
      expect(formatted).toContain('/src/test.ts')
      expect(formatted).toContain('1')
      expect(formatted).toContain('error')
      expect(formatted).toContain('test-rule')
      expect(formatted).toContain('Test violation')
    })

    test('escapes fields with commas', () => {
      const reporter = new CSVReporter({})
      const violation = createMockViolation({
        message: 'Error, with comma',
      })
      const formatted = reporter.format(violation)
      expect(formatted).toContain('"Error, with comma"')
    })

    test('escapes fields with quotes', () => {
      const reporter = new CSVReporter({})
      const violation = createMockViolation({
        message: 'Error "quoted" text',
      })
      const formatted = reporter.format(violation)
      expect(formatted).toContain('"Error ""quoted"" text"')
    })

    test('handles null values', () => {
      const reporter = new CSVReporter({})
      const violation = createMockViolation({
        source: undefined,
        suggestion: undefined,
      })
      const formatted = reporter.format(violation)
      expect(formatted).toBeDefined()
    })
  })

  describe('report', () => {
    let consoleSpy: ReturnType<typeof vi.spyOn>

    beforeEach(() => {
      consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    })

    afterEach(() => {
      consoleSpy.mockRestore()
    })

    test('reports multiple violations', () => {
      const reporter = new CSVReporter({})
      const violations = [
        createMockViolation({ line: 1, message: 'First error' }),
        createMockViolation({ line: 2, message: 'Second error' }),
      ]
      const result = createMockResult(violations)
      reporter.report(result)
      expect(consoleSpy).toHaveBeenCalled()
      const output = consoleSpy.mock.calls[0][0]
      expect(output).toContain('file,line,column')
      expect(output).toContain('First error')
      expect(output).toContain('Second error')
      expect(output).toContain('# Summary')
    })

    test('includes summary section', () => {
      const reporter = new CSVReporter({})
      const result = createMockResult([
        createMockViolation({ severity: 'error' }),
        createMockViolation({ severity: 'warning' }),
        createMockViolation({ severity: 'info' }),
      ])
      reporter.report(result)
      const output = consoleSpy.mock.calls[0][0]
      expect(output).toContain('# Errors: 1')
      expect(output).toContain('# Warnings: 1')
      expect(output).toContain('# Info: 1')
      expect(output).toContain('# Total Time:')
    })
  })

  describe('createCSVReporter', () => {
    test('creates reporter instance', () => {
      const reporter = createCSVReporter({})
      expect(reporter).toBeInstanceOf(CSVReporter)
      expect(reporter.name).toBe('csv')
    })

    test('passes options to reporter', () => {
      const reporter = createCSVReporter({ outputPath: '/tmp/test.csv' })
      expect(reporter).toBeInstanceOf(CSVReporter)
    })
  })
})
