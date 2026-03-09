import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { SARIFReporter } from '../../../src/reporters/sarif-reporter.js'
import type { AnalysisResult, FileAnalysisResult, Violation } from '../../../src/reporters/types.js'

function createMockViolation(overrides: Partial<Violation> = {}): Violation {
  return {
    column: 5,
    filePath: 'test.ts',
    line: 10,
    message: 'Test violation',
    ruleId: 'test-rule',
    severity: 'error',
    ...overrides,
  }
}

function createMockFileResult(filePath: string, violations: Violation[] = []): FileAnalysisResult {
  return {
    filePath,
    stats: { analysisTime: 20, parseTime: 10, totalTime: 30 },
    violations,
  }
}

function createMockAnalysisResult(overrides: Partial<AnalysisResult> = {}): AnalysisResult {
  return {
    files: [],
    summary: {
      errorCount: 0,
      filesWithViolations: 0,
      infoCount: 0,
      totalFiles: 0,
      totalTime: 100,
      warningCount: 0,
    },
    timestamp: '2024-01-15T10:00:00.000Z',
    ...overrides,
  }
}

describe('SARIFReporter', () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(() => {
    consoleSpy.mockRestore()
  })

  describe('constructor', () => {
    test('should initialize with default options', () => {
      const reporter = new SARIFReporter()
      expect(reporter.name).toBe('sarif')
    })

    test('should accept pretty option', () => {
      const reporter = new SARIFReporter({ pretty: true })
      expect(reporter.name).toBe('sarif')
    })
  })

  describe('format', () => {
    test('should format violation as JSON string', () => {
      const reporter = new SARIFReporter()
      const violation = createMockViolation()
      const output = reporter.format(violation)
      const parsed = JSON.parse(output)
      expect(parsed.ruleId).toBe('test-rule')
      expect(parsed.level).toBe('error')
    })

    test('should map severity correctly', () => {
      const reporter = new SARIFReporter()

      const errorOutput = JSON.parse(reporter.format(createMockViolation({ severity: 'error' })))
      expect(errorOutput.level).toBe('error')

      const warningOutput = JSON.parse(
        reporter.format(createMockViolation({ severity: 'warning' })),
      )
      expect(warningOutput.level).toBe('warning')

      const infoOutput = JSON.parse(reporter.format(createMockViolation({ severity: 'info' })))
      expect(infoOutput.level).toBe('note')
    })

    test('should include location', () => {
      const reporter = new SARIFReporter()
      const violation = createMockViolation({ filePath: 'src/app.ts', line: 42 })
      const output = reporter.format(violation)
      const parsed = JSON.parse(output)
      expect(parsed.locations[0].physicalLocation.artifactLocation.uri).toBe('src/app.ts')
      expect(parsed.locations[0].physicalLocation.region.startLine).toBe(42)
    })

    test('should include fixes when suggestion provided', () => {
      const reporter = new SARIFReporter()
      const violation = createMockViolation({ suggestion: 'Fix suggestion' })
      const output = reporter.format(violation)
      const parsed = JSON.parse(output)
      expect(parsed.fixes).toBeDefined()
      expect(parsed.fixes).toHaveLength(1)
    })
  })

  describe('report', () => {
    test('should output SARIF format', () => {
      const reporter = new SARIFReporter()
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [createMockViolation()])],
        summary: {
          errorCount: 1,
          filesWithViolations: 1,
          infoCount: 0,
          totalFiles: 1,
          totalTime: 50,
          warningCount: 0,
        },
      })
      reporter.report(results)
      const output = JSON.parse(consoleSpy.mock.calls[0][0] as string)
      expect(output.$schema).toContain('sarif-schema-2.1.0')
      expect(output.version).toBe('2.1.0')
      expect(output.runs).toHaveLength(1)
    })

    test('should include tool information', () => {
      const reporter = new SARIFReporter()
      const results = createMockAnalysisResult()
      reporter.report(results)
      const output = JSON.parse(consoleSpy.mock.calls[0][0] as string)
      expect(output.runs[0].tool.driver.name).toBe('CodeForge')
    })
  })
})
