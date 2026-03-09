import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { MarkdownReporter } from '../../../src/reporters/markdown-reporter.js'
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

describe('MarkdownReporter', () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(() => {
    consoleSpy.mockRestore()
  })

  describe('constructor', () => {
    test('should initialize with default options', () => {
      const reporter = new MarkdownReporter()
      expect(reporter.name).toBe('markdown')
    })

    test('should accept includeSource option', () => {
      const reporter = new MarkdownReporter({ includeSource: true })
      expect(reporter.name).toBe('markdown')
    })

    test('should accept outputPath option', () => {
      const reporter = new MarkdownReporter({ outputPath: './report.md' })
      expect(reporter.name).toBe('markdown')
    })
  })

  describe('format', () => {
    test('should format violation as markdown string', () => {
      const reporter = new MarkdownReporter()
      const violation = createMockViolation()
      const output = reporter.format(violation)
      expect(output).toContain('🔴 **test-rule** at test.ts:10:5')
      expect(output).toContain('Test violation')
    })

    test('should use correct severity badges', () => {
      const reporter = new MarkdownReporter()

      const errorOutput = reporter.format(createMockViolation({ severity: 'error' }))
      expect(errorOutput).toContain('🔴')

      const warningOutput = reporter.format(createMockViolation({ severity: 'warning' }))
      expect(warningOutput).toContain('🟡')

      const infoOutput = reporter.format(createMockViolation({ severity: 'info' }))
      expect(infoOutput).toContain('🔵')
    })
  })

  describe('report', () => {
    test('should output markdown to console', () => {
      const reporter = new MarkdownReporter()
      const results = createMockAnalysisResult()
      reporter.report(results)
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).toContain('# CodeForge Analysis Report')
    })

    test('should include summary section', () => {
      const reporter = new MarkdownReporter()
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
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).toContain('## Summary')
      expect(output).toContain('| Total Files Analyzed | 1 |')
      expect(output).toContain('| 🔴 Errors | 1 |')
    })

    test('should include violations by file', () => {
      const reporter = new MarkdownReporter()
      const results = createMockAnalysisResult({
        files: [
          createMockFileResult('src/test.ts', [createMockViolation({ message: 'Custom error' })]),
        ],
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
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).toContain('### 📄 `src/test.ts`')
      expect(output).toContain('1 violation(s)')
      expect(output).toContain('Custom error')
    })

    test('should show no violations message when clean', () => {
      const reporter = new MarkdownReporter()
      const results = createMockAnalysisResult({
        files: [createMockFileResult('clean.ts', [])],
        summary: {
          errorCount: 0,
          filesWithViolations: 0,
          infoCount: 0,
          totalFiles: 1,
          totalTime: 50,
          warningCount: 0,
        },
      })
      reporter.report(results)
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).toContain('✅ No violations found!')
    })
  })
})
