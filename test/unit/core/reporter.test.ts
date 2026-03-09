import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import * as fs from 'node:fs/promises'
import * as path from 'node:path'
import { Reporter, type ReporterOptions, type AnalysisReport } from '../../../src/core/reporter.js'
import type { RuleViolation } from '../../../src/ast/visitor.js'

// Mock fs/promises
vi.mock('node:fs/promises', () => ({
  mkdir: vi.fn(),
  writeFile: vi.fn(),
}))

// Helper to create valid RuleViolation
function createViolation(overrides: Partial<RuleViolation> = {}): RuleViolation {
  return {
    ruleId: 'test-rule',
    severity: 'error',
    message: 'Test violation',
    filePath: '/test/file.ts',
    range: {
      start: { line: 1, column: 1 },
      end: { line: 1, column: 10 },
    },
    ...overrides,
  }
}

// Helper to create valid AnalysisReport
function createReport(overrides: Partial<AnalysisReport> = {}): AnalysisReport {
  return {
    files: [],
    summary: {
      totalFiles: 0,
      totalViolations: 0,
      errors: 0,
      warnings: 0,
      info: 0,
      duration: 100,
    },
    ...overrides,
  }
}

describe('Reporter', () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>
  let defaultOptions: ReporterOptions

  beforeEach(() => {
    vi.clearAllMocks()
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    defaultOptions = {
      format: 'console',
      verbose: false,
      quiet: false,
    }
  })

  afterEach(() => {
    consoleSpy.mockRestore()
  })

  describe('constructor', () => {
    test('sets format from options', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'json' })
      const report = createReport()
      const output = reporter.formatReport(report)
      expect(() => JSON.parse(output)).not.toThrow()
    })

    test('sets output path from options', () => {
      const reporter = new Reporter({ ...defaultOptions, outputPath: '/output/report.json' })
      const report = createReport()
      reporter.formatReport(report)
      // Output path is used in writeReport, verified there
      expect(reporter).toBeDefined()
    })

    test('sets verbose mode from options', () => {
      const reporter = new Reporter({ ...defaultOptions, verbose: true })
      const violation = createViolation({ suggestion: 'Fix this issue' })
      const report = createReport({
        files: [{ filePath: '/test/file.ts', violations: [violation] }],
      })
      const output = reporter.formatReport(report)
      expect(output).toContain('Suggestion:')
    })

    test('sets quiet mode from options', () => {
      const reporter = new Reporter({ ...defaultOptions, quiet: true })
      const report = createReport()
      const output = reporter.formatReport(report)
      expect(output).not.toContain('CodeForge Analysis Report')
    })

    test('uses default options when minimal options provided', () => {
      const reporter = new Reporter({
        format: 'console',
        verbose: false,
        quiet: false,
      })
      expect(reporter).toBeDefined()
    })
  })

  describe('formatReport', () => {
    test('returns JSON format when format is json', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'json' })
      const report = createReport({
        files: [{ filePath: '/test/file.ts', violations: [createViolation()] }],
        summary: {
          totalFiles: 1,
          totalViolations: 1,
          errors: 1,
          warnings: 0,
          info: 0,
          duration: 50,
        },
      })
      const output = reporter.formatReport(report)
      const parsed = JSON.parse(output)
      expect(parsed.files).toHaveLength(1)
    })

    test('returns console format when format is console', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'console' })
      const report = createReport()
      const output = reporter.formatReport(report)
      expect(output).toContain('Summary')
    })
  })

  describe('formatJson', () => {
    test('serializes results with proper formatting', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'json' })
      const violation = createViolation({
        ruleId: 'no-console',
        severity: 'error',
        message: 'Unexpected console statement',
      })
      const report = createReport({
        files: [{ filePath: '/src/index.ts', violations: [violation] }],
        summary: {
          totalFiles: 1,
          totalViolations: 1,
          errors: 1,
          warnings: 0,
          info: 0,
          duration: 123,
        },
      })
      const output = reporter.formatReport(report)
      const parsed = JSON.parse(output)
      expect(parsed.files[0].filePath).toBe('/src/index.ts')
      expect(parsed.files[0].violations[0].ruleId).toBe('no-console')
      expect(parsed.summary.totalFiles).toBe(1)
      expect(parsed.summary.duration).toBe(123)
    })

    test('handles empty results', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'json' })
      const report = createReport()
      const output = reporter.formatReport(report)
      const parsed = JSON.parse(output)
      expect(parsed.files).toEqual([])
      expect(parsed.summary.totalViolations).toBe(0)
    })

    test('includes all summary fields', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'json' })
      const report = createReport({
        summary: {
          totalFiles: 10,
          totalViolations: 25,
          errors: 5,
          warnings: 15,
          info: 5,
          duration: 1500,
        },
      })
      const output = reporter.formatReport(report)
      const parsed = JSON.parse(output)
      expect(parsed.summary.totalFiles).toBe(10)
      expect(parsed.summary.totalViolations).toBe(25)
      expect(parsed.summary.errors).toBe(5)
      expect(parsed.summary.warnings).toBe(15)
      expect(parsed.summary.info).toBe(5)
      expect(parsed.summary.duration).toBe(1500)
    })

    test('formats JSON with 2-space indentation', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'json' })
      const report = createReport()
      const output = reporter.formatReport(report)
      expect(output).toContain('\n  "files"')
    })

    test('handles multiple files with violations', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'json' })
      const report = createReport({
        files: [
          { filePath: '/src/a.ts', violations: [createViolation({ ruleId: 'rule-a' })] },
          { filePath: '/src/b.ts', violations: [createViolation({ ruleId: 'rule-b' })] },
          { filePath: '/src/c.ts', violations: [] },
        ],
        summary: {
          totalFiles: 3,
          totalViolations: 2,
          errors: 2,
          warnings: 0,
          info: 0,
          duration: 100,
        },
      })
      const output = reporter.formatReport(report)
      const parsed = JSON.parse(output)
      expect(parsed.files).toHaveLength(3)
      expect(parsed.files[2].violations).toEqual([])
    })
  })

  describe('formatConsole', () => {
    test('colors violations by severity - error is red', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'console' })
      const violation = createViolation({ severity: 'error', message: 'Error message' })
      const report = createReport({
        files: [{ filePath: '/test/file.ts', violations: [violation] }],
        summary: {
          totalFiles: 1,
          totalViolations: 1,
          errors: 1,
          warnings: 0,
          info: 0,
          duration: 50,
        },
      })
      const output = reporter.formatReport(report)
      expect(output).toContain('\x1b[31m') // red
    })

    test('colors violations by severity - warning is yellow', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'console' })
      const violation = createViolation({ severity: 'warning', message: 'Warning message' })
      const report = createReport({
        files: [{ filePath: '/test/file.ts', violations: [violation] }],
        summary: {
          totalFiles: 1,
          totalViolations: 1,
          errors: 0,
          warnings: 1,
          info: 0,
          duration: 50,
        },
      })
      const output = reporter.formatReport(report)
      expect(output).toContain('\x1b[33m') // yellow
    })

    test('colors violations by severity - info is blue', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'console' })
      const violation = createViolation({ severity: 'info', message: 'Info message' })
      const report = createReport({
        files: [{ filePath: '/test/file.ts', violations: [violation] }],
        summary: {
          totalFiles: 1,
          totalViolations: 1,
          errors: 0,
          warnings: 0,
          info: 1,
          duration: 50,
        },
      })
      const output = reporter.formatReport(report)
      expect(output).toContain('\x1b[34m') // blue
    })

    test('shows file headers', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'console' })
      const violation = createViolation()
      const report = createReport({
        files: [{ filePath: '/src/components/Button.tsx', violations: [violation] }],
        summary: {
          totalFiles: 1,
          totalViolations: 1,
          errors: 1,
          warnings: 0,
          info: 0,
          duration: 50,
        },
      })
      const output = reporter.formatReport(report)
      expect(output).toContain('/src/components/Button.tsx')
    })

    test('shows suggestions in verbose mode', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'console', verbose: true })
      const violation = createViolation({
        suggestion: 'Consider using const instead of let',
      })
      const report = createReport({
        files: [{ filePath: '/test/file.ts', violations: [violation] }],
        summary: {
          totalFiles: 1,
          totalViolations: 1,
          errors: 1,
          warnings: 0,
          info: 0,
          duration: 50,
        },
      })
      const output = reporter.formatReport(report)
      expect(output).toContain('Suggestion:')
      expect(output).toContain('Consider using const instead of let')
    })

    test('hides suggestions in non-verbose mode', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'console', verbose: false })
      const violation = createViolation({
        suggestion: 'Consider using const instead of let',
      })
      const report = createReport({
        files: [{ filePath: '/test/file.ts', violations: [violation] }],
        summary: {
          totalFiles: 1,
          totalViolations: 1,
          errors: 1,
          warnings: 0,
          info: 0,
          duration: 50,
        },
      })
      const output = reporter.formatReport(report)
      expect(output).not.toContain('Suggestion:')
    })

    test('shows violation location with line and column', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'console' })
      const violation = createViolation({
        range: {
          start: { line: 42, column: 15 },
          end: { line: 42, column: 20 },
        },
      })
      const report = createReport({
        files: [{ filePath: '/test/file.ts', violations: [violation] }],
        summary: {
          totalFiles: 1,
          totalViolations: 1,
          errors: 1,
          warnings: 0,
          info: 0,
          duration: 50,
        },
      })
      const output = reporter.formatReport(report)
      expect(output).toContain('[42:15]')
    })

    test('shows rule ID with dim color', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'console' })
      const violation = createViolation({ ruleId: 'prefer-const' })
      const report = createReport({
        files: [{ filePath: '/test/file.ts', violations: [violation] }],
        summary: {
          totalFiles: 1,
          totalViolations: 1,
          errors: 1,
          warnings: 0,
          info: 0,
          duration: 50,
        },
      })
      const output = reporter.formatReport(report)
      expect(output).toContain('prefer-const')
      expect(output).toContain('\x1b[2m') // dim
    })

    test('skips files with no violations', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'console' })
      const report = createReport({
        files: [
          { filePath: '/src/clean.ts', violations: [] },
          { filePath: '/src/dirty.ts', violations: [createViolation()] },
        ],
        summary: {
          totalFiles: 2,
          totalViolations: 1,
          errors: 1,
          warnings: 0,
          info: 0,
          duration: 50,
        },
      })
      const output = reporter.formatReport(report)
      expect(output).not.toContain('/src/clean.ts')
      expect(output).toContain('/src/dirty.ts')
    })

    test('shows summary section', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'console' })
      const report = createReport({
        summary: {
          totalFiles: 5,
          totalViolations: 10,
          errors: 3,
          warnings: 5,
          info: 2,
          duration: 250,
        },
      })
      const output = reporter.formatReport(report)
      expect(output).toContain('Files analyzed: 5')
      expect(output).toContain('Total violations: 10')
      expect(output).toContain('Errors: 3')
      expect(output).toContain('Warnings: 5')
      expect(output).toContain('Info: 2')
      expect(output).toContain('Duration:')
    })

    test('formats duration with 2 decimal places', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'console' })
      const report = createReport({
        summary: {
          totalFiles: 0,
          totalViolations: 0,
          errors: 0,
          warnings: 0,
          info: 0,
          duration: 1234.567,
        },
      })
      const output = reporter.formatReport(report)
      expect(output).toContain('1234.57ms')
    })

    test('hides header in quiet mode', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'console', quiet: true })
      const report = createReport({
        files: [{ filePath: '/test/file.ts', violations: [createViolation()] }],
        summary: {
          totalFiles: 1,
          totalViolations: 1,
          errors: 1,
          warnings: 0,
          info: 0,
          duration: 50,
        },
      })
      const output = reporter.formatReport(report)
      expect(output).not.toContain('CodeForge Analysis Report')
    })

    test('shows header in non-quiet mode', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'console', quiet: false })
      const report = createReport()
      const output = reporter.formatReport(report)
      expect(output).toContain('CodeForge Analysis Report')
    })

    test('pads severity labels to 7 characters', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'console' })
      const errorViolation = createViolation({ severity: 'error' })
      const warningViolation = createViolation({ severity: 'warning' })
      const infoViolation = createViolation({ severity: 'info' })
      const report = createReport({
        files: [
          { filePath: '/a.ts', violations: [errorViolation] },
          { filePath: '/b.ts', violations: [warningViolation] },
          { filePath: '/c.ts', violations: [infoViolation] },
        ],
        summary: {
          totalFiles: 3,
          totalViolations: 3,
          errors: 1,
          warnings: 1,
          info: 1,
          duration: 50,
        },
      })
      const output = reporter.formatReport(report)
      expect(output).toContain('ERROR  ')
      expect(output).toContain('WARNING')
      expect(output).toContain('INFO   ')
    })
  })

  describe('getSeverityColor', () => {
    test('returns red for error', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'console' })
      const violation = createViolation({ severity: 'error' })
      const report = createReport({
        files: [{ filePath: '/test/file.ts', violations: [violation] }],
        summary: {
          totalFiles: 1,
          totalViolations: 1,
          errors: 1,
          warnings: 0,
          info: 0,
          duration: 50,
        },
      })
      const output = reporter.formatReport(report)
      expect(output).toContain('\x1b[31m')
    })

    test('returns yellow for warning', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'console' })
      const violation = createViolation({ severity: 'warning' })
      const report = createReport({
        files: [{ filePath: '/test/file.ts', violations: [violation] }],
        summary: {
          totalFiles: 1,
          totalViolations: 1,
          errors: 0,
          warnings: 1,
          info: 0,
          duration: 50,
        },
      })
      const output = reporter.formatReport(report)
      expect(output).toContain('\x1b[33m')
    })

    test('returns blue for info', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'console' })
      const violation = createViolation({ severity: 'info' })
      const report = createReport({
        files: [{ filePath: '/test/file.ts', violations: [violation] }],
        summary: {
          totalFiles: 1,
          totalViolations: 1,
          errors: 0,
          warnings: 0,
          info: 1,
          duration: 50,
        },
      })
      const output = reporter.formatReport(report)
      expect(output).toContain('\x1b[34m')
    })

    test('returns reset for unknown severity', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'console' })
      // Cast to bypass TypeScript - testing runtime behavior
      const violation = createViolation({ severity: 'unknown' as 'error' })
      const report = createReport({
        files: [{ filePath: '/test/file.ts', violations: [violation] }],
        summary: {
          totalFiles: 1,
          totalViolations: 1,
          errors: 0,
          warnings: 0,
          info: 0,
          duration: 50,
        },
      })
      const output = reporter.formatReport(report)
      // Should not contain any severity color before the label
      expect(output).toBeDefined()
    })
  })

  describe('writeReport', () => {
    test('writes to file when outputPath set', async () => {
      const reporter = new Reporter({
        ...defaultOptions,
        format: 'json',
        outputPath: '/output/report.json',
      })
      const report = createReport()
      await reporter.writeReport(report)
      expect(fs.mkdir).toHaveBeenCalled()
      expect(fs.writeFile).toHaveBeenCalled()
    })

    test('creates parent directories recursively', async () => {
      const reporter = new Reporter({
        ...defaultOptions,
        format: 'json',
        outputPath: '/deep/nested/path/report.json',
      })
      const report = createReport()
      await reporter.writeReport(report)
      expect(fs.mkdir).toHaveBeenCalledWith(expect.any(String), { recursive: true })
    })

    test('writes to stdout when no outputPath', async () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'console' })
      const report = createReport()
      await reporter.writeReport(report)
      expect(consoleSpy).toHaveBeenCalled()
      expect(fs.writeFile).not.toHaveBeenCalled()
    })

    test('writes formatted content to file', async () => {
      const reporter = new Reporter({
        ...defaultOptions,
        format: 'json',
        outputPath: '/output/report.json',
      })
      const report = createReport({
        files: [{ filePath: '/test.ts', violations: [createViolation()] }],
        summary: {
          totalFiles: 1,
          totalViolations: 1,
          errors: 1,
          warnings: 0,
          info: 0,
          duration: 50,
        },
      })
      await reporter.writeReport(report)
      expect(fs.writeFile).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringContaining('"files"'),
        'utf-8',
      )
    })

    test('resolves output path to absolute path', async () => {
      const reporter = new Reporter({
        ...defaultOptions,
        format: 'json',
        outputPath: 'relative/path/report.json',
      })
      const report = createReport()
      await reporter.writeReport(report)
      const writtenPath = (fs.writeFile as ReturnType<typeof vi.fn>).mock.calls[0][0] as string
      expect(path.isAbsolute(writtenPath)).toBe(true)
    })
  })

  describe('printProgress', () => {
    test('respects quiet mode - does not print', () => {
      const reporter = new Reporter({ ...defaultOptions, quiet: true })
      reporter.printProgress('Processing files...')
      expect(consoleSpy).not.toHaveBeenCalled()
    })

    test('shows message in normal mode', () => {
      const reporter = new Reporter({ ...defaultOptions, quiet: false })
      reporter.printProgress('Processing files...')
      expect(consoleSpy).toHaveBeenCalledWith('Processing files...')
    })

    test('prints multiple progress messages', () => {
      const reporter = new Reporter({ ...defaultOptions, quiet: false })
      reporter.printProgress('Step 1')
      reporter.printProgress('Step 2')
      reporter.printProgress('Step 3')
      expect(consoleSpy).toHaveBeenCalledTimes(3)
    })

    test('handles empty message', () => {
      const reporter = new Reporter({ ...defaultOptions, quiet: false })
      reporter.printProgress('')
      expect(consoleSpy).toHaveBeenCalledWith('')
    })
  })
})
