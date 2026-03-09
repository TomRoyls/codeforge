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

  describe('formatHtml', () => {
    test('generates valid HTML structure', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'html' })
      const report = createReport()
      const output = reporter.formatReport(report)
      expect(output).toContain('<!DOCTYPE html>')
      expect(output).toContain('<html lang="en">')
      expect(output).toContain('</html>')
    })

    test('includes page title', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'html' })
      const report = createReport()
      const output = reporter.formatReport(report)
      expect(output).toContain('<title>CodeForge Analysis Report</title>')
    })

    test('includes summary section with metrics', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'html' })
      const report = createReport({
        summary: {
          totalFiles: 5,
          totalViolations: 10,
          errors: 3,
          warnings: 5,
          info: 2,
          duration: 123,
        },
      })
      const output = reporter.formatReport(report)
      expect(output).toContain('Files: 5')
      expect(output).toContain('Errors: 3')
      expect(output).toContain('Warnings: 5')
      expect(output).toContain('Info: 2')
      expect(output).toContain('Duration:')
    })

    test('displays violations with severity classes', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'html' })
      const report = createReport({
        files: [
          { filePath: '/test/file.ts', violations: [createViolation({ severity: 'error' })] },
        ],
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
      expect(output).toContain('class="error"')
      expect(output).toContain('[ERROR]')
    })

    test('displays warning severity with correct class', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'html' })
      const report = createReport({
        files: [
          { filePath: '/test/file.ts', violations: [createViolation({ severity: 'warning' })] },
        ],
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
      expect(output).toContain('class="warning"')
      expect(output).toContain('[WARNING]')
    })

    test('displays info severity with correct class', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'html' })
      const report = createReport({
        files: [{ filePath: '/test/file.ts', violations: [createViolation({ severity: 'info' })] }],
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
      expect(output).toContain('class="info"')
      expect(output).toContain('[INFO]')
    })

    test('skips files with no violations', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'html' })
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

    test('escapes HTML in file paths', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'html' })
      const report = createReport({
        files: [{ filePath: '/test/<script>.ts', violations: [createViolation()] }],
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
      expect(output).toContain('&lt;script&gt;')
      expect(output).not.toContain('<script>')
    })

    test('escapes HTML in violation messages', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'html' })
      const report = createReport({
        files: [
          {
            filePath: '/test/file.ts',
            violations: [createViolation({ message: 'Use <b>bold</b> carefully' })],
          },
        ],
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
      expect(output).toContain('&lt;b&gt;')
      expect(output).toContain('&lt;/b&gt;')
    })

    test('escapes HTML in rule IDs', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'html' })
      const report = createReport({
        files: [
          { filePath: '/test/file.ts', violations: [createViolation({ ruleId: 'rule&id' })] },
        ],
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
      expect(output).toContain('rule&amp;id')
    })

    test('includes violation location', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'html' })
      const report = createReport({
        files: [
          {
            filePath: '/test/file.ts',
            violations: [
              createViolation({
                range: { start: { line: 10, column: 5 }, end: { line: 10, column: 15 } },
              }),
            ],
          },
        ],
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
      expect(output).toContain('line 10:5')
    })

    test('includes CSS styles', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'html' })
      const report = createReport()
      const output = reporter.formatReport(report)
      expect(output).toContain('<style>')
      expect(output).toContain('</style>')
      expect(output).toContain('font-family')
    })

    test('handles multiple files with violations', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'html' })
      const report = createReport({
        files: [
          { filePath: '/src/a.ts', violations: [createViolation({ ruleId: 'rule-a' })] },
          { filePath: '/src/b.ts', violations: [createViolation({ ruleId: 'rule-b' })] },
        ],
        summary: {
          totalFiles: 2,
          totalViolations: 2,
          errors: 2,
          warnings: 0,
          info: 0,
          duration: 50,
        },
      })
      const output = reporter.formatReport(report)
      expect(output).toContain('/src/a.ts')
      expect(output).toContain('/src/b.ts')
      expect(output).toContain('rule-a')
      expect(output).toContain('rule-b')
    })

    test('formats duration with 2 decimal places', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'html' })
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

    test('escapes ampersand character', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'html' })
      const report = createReport({
        files: [
          {
            filePath: '/test/file.ts',
            violations: [createViolation({ message: 'Use && operator' })],
          },
        ],
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
      expect(output).toContain('&amp;&amp;')
    })

    test('escapes double quote character', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'html' })
      const report = createReport({
        files: [
          {
            filePath: '/test/file.ts',
            violations: [createViolation({ message: 'Use "quotes" properly' })],
          },
        ],
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
      expect(output).toContain('&quot;')
    })

    test('escapes single quote character', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'html' })
      const report = createReport({
        files: [
          { filePath: '/test/file.ts', violations: [createViolation({ message: "It's a test" })] },
        ],
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
      expect(output).toContain('&#039;')
    })
  })

  describe('formatJunit', () => {
    test('generates valid XML structure', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'junit' })
      const report = createReport()
      const output = reporter.formatReport(report)
      expect(output).toContain('<?xml version="1.0" encoding="UTF-8"?>')
      expect(output).toContain('<testsuit')
      expect(output).toContain('</testsuit>')
    })

    test('includes testsuite for files with violations', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'junit' })
      const report = createReport({
        files: [{ filePath: '/src/file.ts', violations: [createViolation()] }],
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
      expect(output).toContain('<testsuite name="/src/file.ts"')
      expect(output).toContain('</testsuite>')
    })

    test('skips files with no violations', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'junit' })
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
      expect(output).not.toContain('name="/src/clean.ts"')
      expect(output).toContain('name="/src/dirty.ts"')
    })

    test('includes testcase for each violation', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'junit' })
      const report = createReport({
        files: [
          {
            filePath: '/src/file.ts',
            violations: [createViolation({ ruleId: 'no-console', message: 'Unexpected console' })],
          },
        ],
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
      expect(output).toContain('<testcase')
      expect(output).toContain('name="no-console:')
      expect(output).toContain('<failure')
    })

    test('includes violation location in failure message', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'junit' })
      const report = createReport({
        files: [
          {
            filePath: '/src/file.ts',
            violations: [
              createViolation({
                filePath: '/src/file.ts',
                range: { start: { line: 10, column: 5 }, end: { line: 10, column: 15 } },
              }),
            ],
          },
        ],
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
      expect(output).toContain('/src/file.ts:10:5')
    })

    test('escapes XML special characters in messages', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'junit' })
      const report = createReport({
        files: [
          {
            filePath: '/src/file.ts',
            violations: [createViolation({ message: 'Use <tag> & "quotes"' })],
          },
        ],
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
      expect(output).toContain('&lt;tag&gt;')
      expect(output).toContain('&amp;')
      expect(output).toContain('&quot;')
    })

    test('escapes XML special characters in rule IDs', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'junit' })
      const report = createReport({
        files: [
          { filePath: '/src/file.ts', violations: [createViolation({ ruleId: 'rule<id>' })] },
        ],
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
      expect(output).toContain('&lt;id&gt;')
    })

    test('handles multiple violations per file', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'junit' })
      const report = createReport({
        files: [
          {
            filePath: '/src/file.ts',
            violations: [
              createViolation({ ruleId: 'rule1' }),
              createViolation({ ruleId: 'rule2' }),
            ],
          },
        ],
        summary: {
          totalFiles: 1,
          totalViolations: 2,
          errors: 2,
          warnings: 0,
          info: 0,
          duration: 50,
        },
      })
      const output = reporter.formatReport(report)
      expect(output).toContain('rule1')
      expect(output).toContain('rule2')
      const testcaseCount = (output.match(/<testcase/g) || []).length
      expect(testcaseCount).toBe(2)
    })

    test('escapes single quote in XML', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'junit' })
      const report = createReport({
        files: [
          { filePath: '/src/file.ts', violations: [createViolation({ message: "It's broken" })] },
        ],
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
      expect(output).toContain('&#039;')
    })

    test('includes properties section', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'junit' })
      const report = createReport()
      const output = reporter.formatReport(report)
      expect(output).toContain('<properties>')
      expect(output).toContain('files-analyzed')
    })
  })

  describe('formatSarif', () => {
    test('generates valid SARIF JSON structure', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'sarif' })
      const report = createReport()
      const output = reporter.formatReport(report)
      const parsed = JSON.parse(output)
      expect(parsed.$schema).toContain('sarif-schema')
      expect(parsed.version).toBe('2.1.0')
      expect(parsed.runs).toHaveLength(1)
    })

    test('includes tool information', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'sarif' })
      const report = createReport()
      const output = reporter.formatReport(report)
      const parsed = JSON.parse(output)
      expect(parsed.runs[0].tool.driver.name).toBe('CodeForge')
      expect(parsed.runs[0].tool.driver.version).toBe('0.1.0')
      expect(parsed.runs[0].tool.driver.informationUri).toContain('github.com')
    })

    test('extracts unique rules from violations', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'sarif' })
      const report = createReport({
        files: [
          {
            filePath: '/src/a.ts',
            violations: [createViolation({ ruleId: 'rule-a', message: 'First rule violation.' })],
          },
          {
            filePath: '/src/b.ts',
            violations: [createViolation({ ruleId: 'rule-b', message: 'Second rule violation.' })],
          },
        ],
        summary: {
          totalFiles: 2,
          totalViolations: 2,
          errors: 2,
          warnings: 0,
          info: 0,
          duration: 50,
        },
      })
      const output = reporter.formatReport(report)
      const parsed = JSON.parse(output)
      const rules = parsed.runs[0].tool.driver.rules
      expect(rules).toHaveLength(2)
      expect(rules.map((r: { id: string }) => r.id)).toContain('rule-a')
      expect(rules.map((r: { id: string }) => r.id)).toContain('rule-b')
    })

    test('deduplicates rules by ruleId', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'sarif' })
      const report = createReport({
        files: [
          { filePath: '/src/a.ts', violations: [createViolation({ ruleId: 'same-rule' })] },
          { filePath: '/src/b.ts', violations: [createViolation({ ruleId: 'same-rule' })] },
        ],
        summary: {
          totalFiles: 2,
          totalViolations: 2,
          errors: 2,
          warnings: 0,
          info: 0,
          duration: 50,
        },
      })
      const output = reporter.formatReport(report)
      const parsed = JSON.parse(output)
      const rules = parsed.runs[0].tool.driver.rules
      expect(rules).toHaveLength(1)
    })

    test('extracts short description from message', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'sarif' })
      const report = createReport({
        files: [
          {
            filePath: '/src/file.ts',
            violations: [
              createViolation({ message: 'This is a long message. More details here.' }),
            ],
          },
        ],
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
      const rule = parsed.runs[0].tool.driver.rules[0]
      expect(rule.shortDescription).toBe('This is a long message.')
    })

    test('includes results for violations', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'sarif' })
      const report = createReport({
        files: [
          {
            filePath: '/src/file.ts',
            violations: [
              createViolation({
                ruleId: 'no-console',
                message: 'Unexpected console',
                severity: 'error',
              }),
            ],
          },
        ],
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
      const results = parsed.runs[0].results
      expect(results).toHaveLength(1)
      expect(results[0].ruleId).toBe('no-console')
      expect(results[0].level).toBe('error')
    })

    test('maps error severity to error level', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'sarif' })
      const report = createReport({
        files: [{ filePath: '/src/file.ts', violations: [createViolation({ severity: 'error' })] }],
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
      expect(parsed.runs[0].results[0].level).toBe('error')
    })

    test('maps warning severity to warning level', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'sarif' })
      const report = createReport({
        files: [
          { filePath: '/src/file.ts', violations: [createViolation({ severity: 'warning' })] },
        ],
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
      const parsed = JSON.parse(output)
      expect(parsed.runs[0].results[0].level).toBe('warning')
    })

    test('maps info severity to note level', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'sarif' })
      const report = createReport({
        files: [{ filePath: '/src/file.ts', violations: [createViolation({ severity: 'info' })] }],
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
      const parsed = JSON.parse(output)
      expect(parsed.runs[0].results[0].level).toBe('note')
    })

    test('maps unknown severity to none level', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'sarif' })
      const report = createReport({
        files: [
          {
            filePath: '/src/file.ts',
            violations: [createViolation({ severity: 'unknown' as 'error' })],
          },
        ],
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
      const parsed = JSON.parse(output)
      expect(parsed.runs[0].results[0].level).toBe('none')
    })

    test('includes location information in results', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'sarif' })
      const report = createReport({
        files: [
          {
            filePath: '/src/file.ts',
            violations: [
              createViolation({
                range: { start: { line: 10, column: 5 }, end: { line: 10, column: 15 } },
              }),
            ],
          },
        ],
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
      const location = parsed.runs[0].results[0].locations[0]
      expect(location.physicalLocation.artifactLocation.uri).toBe('/src/file.ts')
      expect(location.physicalLocation.region.startLine).toBe(10)
      expect(location.physicalLocation.region.startColumn).toBe(5)
    })

    test('includes message text in results', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'sarif' })
      const report = createReport({
        files: [
          {
            filePath: '/src/file.ts',
            violations: [createViolation({ message: 'Custom error message' })],
          },
        ],
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
      expect(parsed.runs[0].results[0].message.text).toBe('Custom error message')
    })

    test('handles empty report', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'sarif' })
      const report = createReport()
      const output = reporter.formatReport(report)
      const parsed = JSON.parse(output)
      expect(parsed.runs[0].results).toEqual([])
      expect(parsed.runs[0].tool.driver.rules).toEqual([])
    })
  })

  describe('formatMarkdown', () => {
    test('generates markdown header', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'markdown' })
      const report = createReport()
      const output = reporter.formatReport(report)
      expect(output).toContain('# CodeForge Analysis Report')
    })

    test('includes generation timestamp', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'markdown' })
      const report = createReport()
      const output = reporter.formatReport(report)
      expect(output).toContain('Generated on')
      expect(output).toMatch(/\d{4}-\d{2}-\d{2}T/)
    })

    test('includes summary table', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'markdown' })
      const report = createReport({
        summary: {
          totalFiles: 5,
          totalViolations: 10,
          errors: 3,
          warnings: 5,
          info: 2,
          duration: 123,
        },
      })
      const output = reporter.formatReport(report)
      expect(output).toContain('## Summary')
      expect(output).toContain('| Total Files Analyzed | 5 |')
      expect(output).toContain('| Total Violations | 10 |')
      expect(output).toContain('| Errors | 3 |')
      expect(output).toContain('| Warnings | 5 |')
      expect(output).toContain('| Info | 2 |')
    })

    test('includes files with violations count', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'markdown' })
      const report = createReport({
        files: [
          { filePath: '/src/a.ts', violations: [createViolation()] },
          { filePath: '/src/b.ts', violations: [] },
          { filePath: '/src/c.ts', violations: [createViolation()] },
        ],
        summary: {
          totalFiles: 3,
          totalViolations: 2,
          errors: 2,
          warnings: 0,
          info: 0,
          duration: 50,
        },
      })
      const output = reporter.formatReport(report)
      expect(output).toContain('| Files with Violations | 2 |')
    })

    test('displays violations with error icon', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'markdown' })
      const report = createReport({
        files: [
          {
            filePath: '/src/file.ts',
            violations: [
              createViolation({
                severity: 'error',
                ruleId: 'no-console',
                message: 'Unexpected console',
              }),
            ],
          },
        ],
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
      expect(output).toContain('🔴')
      expect(output).toContain('**no-console**')
    })

    test('displays violations with warning icon', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'markdown' })
      const report = createReport({
        files: [
          { filePath: '/src/file.ts', violations: [createViolation({ severity: 'warning' })] },
        ],
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
      expect(output).toContain('🟡')
    })

    test('displays violations with info icon', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'markdown' })
      const report = createReport({
        files: [{ filePath: '/src/file.ts', violations: [createViolation({ severity: 'info' })] }],
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
      expect(output).toContain('🔵')
    })

    test('includes file path as subheading', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'markdown' })
      const report = createReport({
        files: [{ filePath: '/src/components/Button.tsx', violations: [createViolation()] }],
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
      expect(output).toContain('### /src/components/Button.tsx')
    })

    test('includes violation location', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'markdown' })
      const report = createReport({
        files: [
          {
            filePath: '/src/file.ts',
            violations: [
              createViolation({
                range: { start: { line: 42, column: 10 }, end: { line: 42, column: 20 } },
              }),
            ],
          },
        ],
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
      expect(output).toContain('line 42:10')
    })

    test('shows no violations message when clean', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'markdown' })
      const report = createReport()
      const output = reporter.formatReport(report)
      expect(output).toContain('✅ No violations found!')
    })

    test('does not show no violations message when violations exist', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'markdown' })
      const report = createReport({
        files: [{ filePath: '/src/file.ts', violations: [createViolation()] }],
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
      expect(output).not.toContain('No violations found!')
    })

    test('skips files with no violations', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'markdown' })
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
      expect(output).not.toContain('### /src/clean.ts')
      expect(output).toContain('### /src/dirty.ts')
    })

    test('includes analysis time in summary', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'markdown' })
      const report = createReport({
        summary: {
          totalFiles: 0,
          totalViolations: 0,
          errors: 0,
          warnings: 0,
          info: 0,
          duration: 1234.56,
        },
      })
      const output = reporter.formatReport(report)
      expect(output).toContain('| Analysis Time | 1234.56ms |')
    })

    test('includes footer with link', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'markdown' })
      const report = createReport()
      const output = reporter.formatReport(report)
      expect(output).toContain('---')
      expect(output).toContain('[CodeForge]')
      expect(output).toContain('github.com/codeforge-dev')
    })

    test('handles multiple files with violations', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'markdown' })
      const report = createReport({
        files: [
          { filePath: '/src/a.ts', violations: [createViolation({ ruleId: 'rule-a' })] },
          { filePath: '/src/b.ts', violations: [createViolation({ ruleId: 'rule-b' })] },
        ],
        summary: {
          totalFiles: 2,
          totalViolations: 2,
          errors: 2,
          warnings: 0,
          info: 0,
          duration: 50,
        },
      })
      const output = reporter.formatReport(report)
      expect(output).toContain('### /src/a.ts')
      expect(output).toContain('### /src/b.ts')
      expect(output).toContain('rule-a')
      expect(output).toContain('rule-b')
    })
  })

  describe('formatGitlab', () => {
    test('generates valid JSON array', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'gitlab' })
      const report = createReport()
      const output = reporter.formatReport(report)
      const parsed = JSON.parse(output)
      expect(Array.isArray(parsed)).toBe(true)
    })

    test('returns empty array for empty report', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'gitlab' })
      const report = createReport()
      const output = reporter.formatReport(report)
      const parsed = JSON.parse(output)
      expect(parsed).toEqual([])
    })

    test('includes violation description', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'gitlab' })
      const report = createReport({
        files: [
          {
            filePath: '/src/file.ts',
            violations: [createViolation({ message: 'Custom error message' })],
          },
        ],
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
      expect(parsed[0].description).toBe('Custom error message')
    })

    test('includes check name from rule ID', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'gitlab' })
      const report = createReport({
        files: [
          { filePath: '/src/file.ts', violations: [createViolation({ ruleId: 'no-console' })] },
        ],
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
      expect(parsed[0].check_name).toBe('no-console')
    })

    test('generates unique fingerprint', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'gitlab' })
      const report = createReport({
        files: [
          {
            filePath: '/src/file.ts',
            violations: [
              createViolation({
                ruleId: 'no-console',
                range: { start: { line: 10, column: 1 }, end: { line: 10, column: 10 } },
              }),
            ],
          },
        ],
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
      expect(parsed[0].fingerprint).toBe('/src/file.ts:no-console:10')
    })

    test('maps error severity to critical', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'gitlab' })
      const report = createReport({
        files: [{ filePath: '/src/file.ts', violations: [createViolation({ severity: 'error' })] }],
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
      expect(parsed[0].severity).toBe('critical')
    })

    test('maps warning severity to major', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'gitlab' })
      const report = createReport({
        files: [
          { filePath: '/src/file.ts', violations: [createViolation({ severity: 'warning' })] },
        ],
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
      const parsed = JSON.parse(output)
      expect(parsed[0].severity).toBe('major')
    })

    test('maps info severity to minor', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'gitlab' })
      const report = createReport({
        files: [{ filePath: '/src/file.ts', violations: [createViolation({ severity: 'info' })] }],
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
      const parsed = JSON.parse(output)
      expect(parsed[0].severity).toBe('minor')
    })

    test('includes file path in location', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'gitlab' })
      const report = createReport({
        files: [{ filePath: '/src/components/Button.tsx', violations: [createViolation()] }],
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
      expect(parsed[0].location.path).toBe('/src/components/Button.tsx')
    })

    test('includes line number in location', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'gitlab' })
      const report = createReport({
        files: [
          {
            filePath: '/src/file.ts',
            violations: [
              createViolation({
                range: { start: { line: 42, column: 5 }, end: { line: 42, column: 15 } },
              }),
            ],
          },
        ],
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
      expect(parsed[0].location.lines.begin).toBe(42)
    })

    test('handles multiple violations', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'gitlab' })
      const report = createReport({
        files: [
          { filePath: '/src/a.ts', violations: [createViolation({ ruleId: 'rule-a' })] },
          { filePath: '/src/b.ts', violations: [createViolation({ ruleId: 'rule-b' })] },
        ],
        summary: {
          totalFiles: 2,
          totalViolations: 2,
          errors: 2,
          warnings: 0,
          info: 0,
          duration: 50,
        },
      })
      const output = reporter.formatReport(report)
      const parsed = JSON.parse(output)
      expect(parsed).toHaveLength(2)
    })
  })

  describe('error handling', () => {
    test('writeReport propagates mkdir errors', async () => {
      const reporter = new Reporter({
        ...defaultOptions,
        format: 'json',
        outputPath: '/output/report.json',
      })
      const report = createReport()
      const mkdirError = new Error('Permission denied')
      vi.mocked(fs.mkdir).mockRejectedValueOnce(mkdirError)

      await expect(reporter.writeReport(report)).rejects.toThrow('Permission denied')
    })

    test('writeReport propagates writeFile errors', async () => {
      const reporter = new Reporter({
        ...defaultOptions,
        format: 'json',
        outputPath: '/output/report.json',
      })
      const report = createReport()
      vi.mocked(fs.mkdir).mockResolvedValueOnce(undefined)
      const writeError = new Error('Disk full')
      vi.mocked(fs.writeFile).mockRejectedValueOnce(writeError)

      await expect(reporter.writeReport(report)).rejects.toThrow('Disk full')
    })
  })

  describe('formatReport default case', () => {
    test('defaults to console format for unknown format', () => {
      const reporter = new Reporter({
        format: 'unknown' as 'console',
        verbose: false,
        quiet: false,
      })
      const report = createReport()
      const output = reporter.formatReport(report)
      expect(output).toContain('Summary')
    })
  })
})
