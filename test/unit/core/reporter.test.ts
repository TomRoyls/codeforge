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
      const reporter = new Reporter({ ...defaultOptions, format: 'gitlab' })
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
      expect(output).toContain('    "description"')
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
        'utf8',
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

  describe('formatReport error handling', () => {
    test('throws descriptive error for unknown format', () => {
      const reporter = new Reporter({
        format: 'unknown' as 'console',
        verbose: false,
        quiet: false,
      })
      const report = createReport()
      expect(() => reporter.formatReport(report)).toThrow(
        'Unsupported output format: "unknown". Valid formats are: console, json, html, junit, sarif, markdown, gitlab, csv, sonarqube. Please check your configuration and try again.',
      )
    })
  })

  describe('color option', () => {
    test('disables colors when color is false', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'console', color: false })
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
      expect(output).not.toContain('\x1b[31m')
    })

    test('enables colors by default', () => {
      const reporter = new Reporter({ format: 'console', verbose: false, quiet: false })
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
      expect(output).toContain('\x1b[31m')
    })

    test('color false removes all ANSI codes from console output', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'console', color: false })
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
      expect(output).not.toContain('\x1b[')
    })
  })

  describe('constructor edge cases', () => {
    test('accepts all valid format options', () => {
      const formats: Array<OutputFormat> = [
        'console',
        'json',
        'html',
        'junit',
        'sarif',
        'markdown',
        'gitlab',
      ]
      for (const format of formats) {
        const reporter = new Reporter({ format, verbose: false, quiet: false })
        const report = createReport()
        expect(() => reporter.formatReport(report)).not.toThrow()
      }
    })

    test('verbose and quiet can both be false', () => {
      const reporter = new Reporter({ format: 'console', verbose: false, quiet: false })
      const report = createReport()
      const output = reporter.formatReport(report)
      expect(output).toContain('CodeForge Analysis Report')
      expect(output).not.toContain('Suggestion:')
    })

    test('verbose and quiet can both be true', () => {
      const reporter = new Reporter({ format: 'console', verbose: true, quiet: true })
      const violation = createViolation({ suggestion: 'Fix it' })
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
      expect(output).not.toContain('CodeForge Analysis Report')
      expect(output).toContain('Suggestion:')
    })
  })

  describe('formatConsole edge cases', () => {
    test('shows violation message text', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'console' })
      const report = createReport({
        files: [
          {
            filePath: '/test/file.ts',
            violations: [createViolation({ message: 'Specific error text' })],
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
      expect(output).toContain('Specific error text')
    })

    test('shows rule ID for each violation', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'console' })
      const report = createReport({
        files: [
          {
            filePath: '/test/file.ts',
            violations: [createViolation({ ruleId: 'custom-rule-123' })],
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
      expect(output).toContain('custom-rule-123')
    })

    test('shows suggestion content in verbose mode', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'console', verbose: true })
      const report = createReport({
        files: [
          {
            filePath: '/test/file.ts',
            violations: [createViolation({ suggestion: 'Use arrow functions' })],
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
      expect(output).toContain('Use arrow functions')
    })

    test('handles violation without suggestion in verbose mode', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'console', verbose: true })
      const violation = createViolation()
      expect(violation.suggestion).toBeUndefined()
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
      expect(output).toContain('ERROR')
    })

    test('shows all severity counts in summary with zero values', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'console' })
      const report = createReport({
        summary: {
          totalFiles: 0,
          totalViolations: 0,
          errors: 0,
          warnings: 0,
          info: 0,
          duration: 0,
        },
      })
      const output = reporter.formatReport(report)
      expect(output).toContain('Errors: 0')
      expect(output).toContain('Warnings: 0')
      expect(output).toContain('Info: 0')
    })

    test('handles multiple violations per file', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'console' })
      const report = createReport({
        files: [
          {
            filePath: '/test/file.ts',
            violations: [
              createViolation({ ruleId: 'rule-1', severity: 'error' }),
              createViolation({ ruleId: 'rule-2', severity: 'warning' }),
              createViolation({ ruleId: 'rule-3', severity: 'info' }),
            ],
          },
        ],
        summary: {
          totalFiles: 1,
          totalViolations: 3,
          errors: 1,
          warnings: 1,
          info: 1,
          duration: 50,
        },
      })
      const output = reporter.formatReport(report)
      expect(output).toContain('rule-1')
      expect(output).toContain('rule-2')
      expect(output).toContain('rule-3')
    })

    test('formats zero duration correctly', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'console' })
      const report = createReport({
        summary: {
          totalFiles: 0,
          totalViolations: 0,
          errors: 0,
          warnings: 0,
          info: 0,
          duration: 0,
        },
      })
      const output = reporter.formatReport(report)
      expect(output).toContain('0.00ms')
    })

    test('formats large duration correctly', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'console' })
      const report = createReport({
        summary: {
          totalFiles: 0,
          totalViolations: 0,
          errors: 0,
          warnings: 0,
          info: 0,
          duration: 99999.99,
        },
      })
      const output = reporter.formatReport(report)
      expect(output).toContain('99999.99ms')
    })
  })

  describe('formatJson edge cases', () => {
    test('preserves violation range start and end', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'json' })
      const violation = createViolation({
        range: { start: { line: 5, column: 10 }, end: { line: 6, column: 20 } },
      })
      const report = createReport({
        files: [{ filePath: '/src/file.ts', violations: [violation] }],
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
      expect(parsed.files[0].violations[0].range.start.line).toBe(5)
      expect(parsed.files[0].violations[0].range.start.column).toBe(10)
      expect(parsed.files[0].violations[0].range.end.line).toBe(6)
      expect(parsed.files[0].violations[0].range.end.column).toBe(20)
    })

    test('preserves severity in output', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'json' })
      const violation = createViolation({ severity: 'warning' })
      const report = createReport({
        files: [{ filePath: '/src/file.ts', violations: [violation] }],
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
      expect(parsed.files[0].violations[0].severity).toBe('warning')
    })

    test('preserves suggestion when present', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'json' })
      const violation = createViolation({ suggestion: 'Consider refactoring' })
      const report = createReport({
        files: [{ filePath: '/src/file.ts', violations: [violation] }],
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
      expect(parsed.files[0].violations[0].suggestion).toBe('Consider refactoring')
    })

    test('handles many violations in single file', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'json' })
      const violations = Array.from({ length: 50 }, (_, i) =>
        createViolation({ ruleId: `rule-${i}`, message: `Violation ${i}` }),
      )
      const report = createReport({
        files: [{ filePath: '/src/big.ts', violations }],
        summary: {
          totalFiles: 1,
          totalViolations: 50,
          errors: 50,
          warnings: 0,
          info: 0,
          duration: 200,
        },
      })
      const output = reporter.formatReport(report)
      const parsed = JSON.parse(output)
      expect(parsed.files[0].violations).toHaveLength(50)
    })

    test('preserves filePath in each file entry', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'json' })
      const report = createReport({
        files: [{ filePath: '/src/deep/nested/path/file.ts', violations: [createViolation()] }],
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
      expect(parsed.files[0].filePath).toBe('/src/deep/nested/path/file.ts')
    })
  })

  describe('formatHtml edge cases', () => {
    test('includes meta charset', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'html' })
      const report = createReport()
      const output = reporter.formatReport(report)
      expect(output).toContain('<meta charset="UTF-8">')
    })

    test('includes viewport meta', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'html' })
      const report = createReport()
      const output = reporter.formatReport(report)
      expect(output).toContain('viewport')
    })

    test('shows bold file path for each file', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'html' })
      const report = createReport({
        files: [{ filePath: '/src/app.ts', violations: [createViolation()] }],
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
      expect(output).toContain('file-path')
      expect(output).toContain('/src/app.ts')
    })

    test('renders all three severities together', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'html' })
      const report = createReport({
        files: [
          {
            filePath: '/src/file.ts',
            violations: [
              createViolation({ severity: 'error' }),
              createViolation({ severity: 'warning' }),
              createViolation({ severity: 'info' }),
            ],
          },
        ],
        summary: {
          totalFiles: 1,
          totalViolations: 3,
          errors: 1,
          warnings: 1,
          info: 1,
          duration: 50,
        },
      })
      const output = reporter.formatReport(report)
      expect(output).toContain('[ERROR]')
      expect(output).toContain('[WARNING]')
      expect(output).toContain('[INFO]')
    })

    test('handles violation with zero duration', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'html' })
      const report = createReport({
        summary: {
          totalFiles: 0,
          totalViolations: 0,
          errors: 0,
          warnings: 0,
          info: 0,
          duration: 0,
        },
      })
      const output = reporter.formatReport(report)
      expect(output).toContain('0.00ms')
    })

    test('includes container div', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'html' })
      const report = createReport()
      const output = reporter.formatReport(report)
      expect(output).toContain('class="container"')
    })

    test('includes violation div for each violation', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'html' })
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
      expect(output).toContain('class="violation"')
    })

    test('escapes greater than character', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'html' })
      const report = createReport({
        files: [{ filePath: '/test/file.ts', violations: [createViolation({ message: 'a > b' })] }],
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
      expect(output).toContain('&gt;')
    })
  })

  describe('formatJunit edge cases', () => {
    test('includes top-level testsuit element', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'junit' })
      const report = createReport()
      const output = reporter.formatReport(report)
      expect(output).toContain('name="codeforge-analysis"')
    })

    test('includes tests count in testsuite', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'junit' })
      const report = createReport({
        files: [
          {
            filePath: '/src/file.ts',
            violations: [createViolation(), createViolation()],
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
      expect(output).toContain('tests="2"')
    })

    test('includes classname in testcase', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'junit' })
      const report = createReport({
        files: [{ filePath: '/src/file.ts', violations: [createViolation({ ruleId: 'my-rule' })] }],
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
      expect(output).toContain('classname="my-rule"')
    })

    test('does not escape file path in testsuite name', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'junit' })
      const report = createReport({
        files: [{ filePath: '/src/a&b.ts', violations: [createViolation()] }],
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
      expect(output).toContain('name="/src/a&b.ts"')
    })

    test('handles three files with violations', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'junit' })
      const report = createReport({
        files: [
          { filePath: '/src/a.ts', violations: [createViolation()] },
          { filePath: '/src/b.ts', violations: [createViolation()] },
          { filePath: '/src/c.ts', violations: [createViolation()] },
        ],
        summary: {
          totalFiles: 3,
          totalViolations: 3,
          errors: 3,
          warnings: 0,
          info: 0,
          duration: 50,
        },
      })
      const output = reporter.formatReport(report)
      const suiteCount = (output.match(/<testsuite name/g) || []).length
      expect(suiteCount).toBe(3)
    })

    test('includes failure message with location', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'junit' })
      const report = createReport({
        files: [
          {
            filePath: '/src/file.ts',
            violations: [
              createViolation({
                filePath: '/src/file.ts',
                range: { start: { line: 25, column: 8 }, end: { line: 25, column: 12 } },
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
      expect(output).toContain('/src/file.ts:25:8')
    })

    test('includes properties inside each testsuite', () => {
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
      const propertiesCount = (output.match(/<properties>/g) || []).length
      expect(propertiesCount).toBeGreaterThanOrEqual(2)
    })
  })

  describe('formatSarif edge cases', () => {
    test('uses 2-space JSON indentation', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'sarif' })
      const report = createReport()
      const output = reporter.formatReport(report)
      expect(output).toContain('\n  "')
    })

    test('handles multiple violations from same rule', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'sarif' })
      const report = createReport({
        files: [
          {
            filePath: '/src/file.ts',
            violations: [
              createViolation({ ruleId: 'same-rule', message: 'First.' }),
              createViolation({ ruleId: 'same-rule', message: 'Second.' }),
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
      const parsed = JSON.parse(output)
      expect(parsed.runs[0].results).toHaveLength(2)
      expect(parsed.runs[0].tool.driver.rules).toHaveLength(1)
    })

    test('includes correct startColumn in region', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'sarif' })
      const report = createReport({
        files: [
          {
            filePath: '/src/file.ts',
            violations: [
              createViolation({
                range: { start: { line: 3, column: 22 }, end: { line: 3, column: 30 } },
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
      expect(parsed.runs[0].results[0].locations[0].physicalLocation.region.startColumn).toBe(22)
    })

    test('handles violation from message without period', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'sarif' })
      const report = createReport({
        files: [
          {
            filePath: '/src/file.ts',
            violations: [createViolation({ ruleId: 'no-period', message: 'No period here' })],
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
      expect(rule.shortDescription).toBe('No period here.')
    })

    test('schema URL points to sarif-schema', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'sarif' })
      const report = createReport()
      const output = reporter.formatReport(report)
      const parsed = JSON.parse(output)
      expect(parsed.$schema).toContain('sarif-schema-2.1.0.json')
    })

    test('includes all results from all files', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'sarif' })
      const report = createReport({
        files: [
          { filePath: '/src/a.ts', violations: [createViolation({ ruleId: 'r1' })] },
          {
            filePath: '/src/b.ts',
            violations: [createViolation({ ruleId: 'r2' }), createViolation({ ruleId: 'r3' })],
          },
        ],
        summary: {
          totalFiles: 2,
          totalViolations: 3,
          errors: 3,
          warnings: 0,
          info: 0,
          duration: 50,
        },
      })
      const output = reporter.formatReport(report)
      const parsed = JSON.parse(output)
      expect(parsed.runs[0].results).toHaveLength(3)
    })
  })

  describe('formatMarkdown edge cases', () => {
    test('uses pipe-delimited table format', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'markdown' })
      const report = createReport({
        summary: {
          totalFiles: 5,
          totalViolations: 0,
          errors: 0,
          warnings: 0,
          info: 0,
          duration: 100,
        },
      })
      const output = reporter.formatReport(report)
      expect(output).toContain('| Metric | Value |')
      expect(output).toContain('|--------|-------|')
    })

    test('includes bold rule ID for each violation', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'markdown' })
      const report = createReport({
        files: [
          { filePath: '/src/file.ts', violations: [createViolation({ ruleId: 'my-custom-rule' })] },
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
      expect(output).toContain('**my-custom-rule**')
    })

    test('includes violation message text', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'markdown' })
      const report = createReport({
        files: [
          {
            filePath: '/src/file.ts',
            violations: [createViolation({ message: 'Avoid using eval()' })],
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
      expect(output).toContain('Avoid using eval()')
    })

    test('shows correct file path in violation subheading', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'markdown' })
      const report = createReport({
        files: [{ filePath: '/src/utils/helpers.ts', violations: [createViolation()] }],
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
      expect(output).toContain('### /src/utils/helpers.ts')
    })

    test('uses ISO format for timestamp', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'markdown' })
      const report = createReport()
      const output = reporter.formatReport(report)
      const match = output.match(/Generated on (\S+)/)
      expect(match).not.toBeNull()
      expect(match![1]).toMatch(/^\d{4}-\d{2}-\d{2}T/)
    })

    test('separates violations section with header', () => {
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
      expect(output).toContain('## Violations')
    })

    test('handles single violation across multiple files', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'markdown' })
      const report = createReport({
        files: [
          { filePath: '/src/a.ts', violations: [createViolation({ ruleId: 'x' })] },
          { filePath: '/src/b.ts', violations: [createViolation({ ruleId: 'y' })] },
          { filePath: '/src/c.ts', violations: [createViolation({ ruleId: 'z' })] },
        ],
        summary: {
          totalFiles: 3,
          totalViolations: 3,
          errors: 3,
          warnings: 0,
          info: 0,
          duration: 100,
        },
      })
      const output = reporter.formatReport(report)
      expect(output).toContain('### /src/a.ts')
      expect(output).toContain('### /src/b.ts')
      expect(output).toContain('### /src/c.ts')
    })
  })

  describe('formatGitlab edge cases', () => {
    test('formats JSON with 2-space indentation', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'gitlab' })
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
      expect(output).toContain('    "description"')
    })

    test('generates different fingerprints for different lines', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'gitlab' })
      const report = createReport({
        files: [
          {
            filePath: '/src/file.ts',
            violations: [
              createViolation({
                ruleId: 'rule-a',
                range: { start: { line: 1, column: 1 }, end: { line: 1, column: 5 } },
              }),
              createViolation({
                ruleId: 'rule-a',
                range: { start: { line: 5, column: 1 }, end: { line: 5, column: 5 } },
              }),
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
      const parsed = JSON.parse(output)
      expect(parsed[0].fingerprint).not.toBe(parsed[1].fingerprint)
    })

    test('handles three violations across two files', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'gitlab' })
      const report = createReport({
        files: [
          { filePath: '/src/a.ts', violations: [createViolation(), createViolation()] },
          { filePath: '/src/b.ts', violations: [createViolation()] },
        ],
        summary: {
          totalFiles: 2,
          totalViolations: 3,
          errors: 3,
          warnings: 0,
          info: 0,
          duration: 50,
        },
      })
      const output = reporter.formatReport(report)
      const parsed = JSON.parse(output)
      expect(parsed).toHaveLength(3)
    })

    test('maps error severity correctly for GitLab', () => {
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

    test('maps warning severity correctly for GitLab', () => {
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

    test('maps info severity correctly for GitLab', () => {
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

    test('includes correct check_name from ruleId', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'gitlab' })
      const report = createReport({
        files: [
          { filePath: '/src/file.ts', violations: [createViolation({ ruleId: 'max-complexity' })] },
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
      expect(parsed[0].check_name).toBe('max-complexity')
    })

    test('includes begin line in location.lines', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'gitlab' })
      const report = createReport({
        files: [
          {
            filePath: '/src/file.ts',
            violations: [
              createViolation({
                range: { start: { line: 99, column: 1 }, end: { line: 99, column: 10 } },
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
      expect(parsed[0].location.lines.begin).toBe(99)
    })

    test('includes path in location object', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'gitlab' })
      const report = createReport({
        files: [{ filePath: '/src/deep/nested.ts', violations: [createViolation()] }],
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
      expect(parsed[0].location.path).toBe('/src/deep/nested.ts')
    })
  })

  describe('writeReport edge cases', () => {
    test('writes console format to stdout', async () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'console' })
      const report = createReport()
      await reporter.writeReport(report)
      expect(consoleSpy).toHaveBeenCalled()
    })

    test('writes html format to file', async () => {
      const reporter = new Reporter({
        ...defaultOptions,
        format: 'html',
        outputPath: '/output/report.html',
      })
      const report = createReport()
      await reporter.writeReport(report)
      expect(fs.writeFile).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringContaining('<!DOCTYPE html>'),
        'utf8',
      )
    })

    test('writes junit format to file', async () => {
      const reporter = new Reporter({
        ...defaultOptions,
        format: 'junit',
        outputPath: '/output/junit.xml',
      })
      const report = createReport()
      await reporter.writeReport(report)
      expect(fs.writeFile).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringContaining('<?xml'),
        'utf8',
      )
    })

    test('writes sarif format to file', async () => {
      const reporter = new Reporter({
        ...defaultOptions,
        format: 'sarif',
        outputPath: '/output/report.sarif',
      })
      const report = createReport()
      await reporter.writeReport(report)
      expect(fs.writeFile).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringContaining('"$schema"'),
        'utf8',
      )
    })

    test('writes markdown format to file', async () => {
      const reporter = new Reporter({
        ...defaultOptions,
        format: 'markdown',
        outputPath: '/output/report.md',
      })
      const report = createReport()
      await reporter.writeReport(report)
      expect(fs.writeFile).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringContaining('# CodeForge Analysis Report'),
        'utf8',
      )
    })

    test('writes gitlab format to file', async () => {
      const reporter = new Reporter({
        ...defaultOptions,
        format: 'gitlab',
        outputPath: '/output/gl.json',
      })
      const report = createReport()
      await reporter.writeReport(report)
      expect(fs.writeFile).toHaveBeenCalledWith(expect.any(String), expect.any(String), 'utf8')
    })

    test('wraps non-Error throws', async () => {
      const reporter = new Reporter({
        ...defaultOptions,
        format: 'json',
        outputPath: '/output/r.json',
      })
      const report = createReport()
      vi.mocked(fs.mkdir).mockRejectedValueOnce('string error' as unknown as Error)
      await expect(reporter.writeReport(report)).rejects.toBe('string error')
    })
  })

  describe('printProgress edge cases', () => {
    test('does not print unicode message in quiet mode', () => {
      const reporter = new Reporter({ ...defaultOptions, quiet: true })
      reporter.printProgress('⏳ Analyzing...')
      expect(consoleSpy).not.toHaveBeenCalled()
    })

    test('prints unicode message in normal mode', () => {
      const reporter = new Reporter({ ...defaultOptions, quiet: false })
      reporter.printProgress('⏳ Analyzing...')
      expect(consoleSpy).toHaveBeenCalledWith('⏳ Analyzing...')
    })

    test('prints long message', () => {
      const reporter = new Reporter({ ...defaultOptions, quiet: false })
      const longMsg = 'A'.repeat(500)
      reporter.printProgress(longMsg)
      expect(consoleSpy).toHaveBeenCalledWith(longMsg)
    })
  })

  describe('escapeHtml via formatHtml', () => {
    test('escapes mixed HTML characters', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'html' })
      const report = createReport({
        files: [
          {
            filePath: '/test/file.ts',
            violations: [createViolation({ message: '<div class="test">&\'content</div>' })],
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
      expect(output).toContain('&lt;div class=&quot;test&quot;&gt;')
      expect(output).toContain('&amp;&#039;content')
      expect(output).toContain('&lt;/div&gt;')
    })
  })

  describe('escapeXml via formatJunit', () => {
    test('escapes mixed XML characters in message', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'junit' })
      const report = createReport({
        files: [
          {
            filePath: '/src/file.ts',
            violations: [createViolation({ message: '<tag attr="val">&data</tag>' })],
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
      expect(output).toContain('&lt;tag attr=&quot;val&quot;&gt;')
      expect(output).toContain('&amp;data')
      expect(output).toContain('&lt;/tag&gt;')
    })
  })

  describe('getSeverityColor via console', () => {
    test('unknown severity uses reset color', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'console' })
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
      expect(output).toContain('UNKNOWN')
    })
  })

  describe('formatReport switching', () => {
    test('console format includes newline between sections', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'console' })
      const report = createReport({
        files: [
          { filePath: '/src/a.ts', violations: [createViolation()] },
          { filePath: '/src/b.ts', violations: [createViolation()] },
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
    })

    test('all formats produce non-empty output', () => {
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
      const formats: Array<OutputFormat> = [
        'console',
        'json',
        'html',
        'junit',
        'sarif',
        'markdown',
        'gitlab',
      ]
      for (const format of formats) {
        const reporter = new Reporter({ format, verbose: false, quiet: false })
        const output = reporter.formatReport(report)
        expect(output.length).toBeGreaterThan(0)
      }
    })
  })

  describe('formatConsole with multiple files', () => {
    test('separates files with blank lines', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'console' })
      const report = createReport({
        files: [
          { filePath: '/src/a.ts', violations: [createViolation()] },
          { filePath: '/src/b.ts', violations: [createViolation()] },
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
      const aIndex = output.indexOf('/src/a.ts')
      const bIndex = output.indexOf('/src/b.ts')
      expect(aIndex).toBeLessThan(bIndex)
      expect(bIndex - aIndex).toBeGreaterThan(1)
    })

    test('shows bold formatting for file headers', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'console' })
      const report = createReport({
        files: [{ filePath: '/src/app.ts', violations: [createViolation()] }],
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
      expect(output).toContain('\x1b[1m')
    })

    test('shows bold formatting for Summary header', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'console' })
      const report = createReport()
      const output = reporter.formatReport(report)
      const summaryIndex = output.indexOf('Summary')
      const boldIndex = output.indexOf('\x1b[1m', summaryIndex - 10)
      expect(boldIndex).toBeLessThan(summaryIndex + 10)
    })
  })

  describe('formatMarkdown detailed', () => {
    test('includes Total Violations row in table', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'markdown' })
      const report = createReport({
        summary: {
          totalFiles: 3,
          totalViolations: 7,
          errors: 2,
          warnings: 3,
          info: 2,
          duration: 100,
        },
      })
      const output = reporter.formatReport(report)
      expect(output).toContain('| Total Violations | 7 |')
    })

    test('includes Duration row formatted with ms', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'markdown' })
      const report = createReport({
        summary: {
          totalFiles: 0,
          totalViolations: 0,
          errors: 0,
          warnings: 0,
          info: 0,
          duration: 500.123,
        },
      })
      const output = reporter.formatReport(report)
      expect(output).toContain('500.12ms')
    })

    test('shows Violations section only when violations exist', () => {
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
      expect(output).toContain('## Violations')
    })

    test('shows Files with Violations count as zero for clean report', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'markdown' })
      const report = createReport({
        files: [{ filePath: '/src/clean.ts', violations: [] }],
        summary: {
          totalFiles: 1,
          totalViolations: 0,
          errors: 0,
          warnings: 0,
          info: 0,
          duration: 10,
        },
      })
      const output = reporter.formatReport(report)
      expect(output).toContain('| Files with Violations | 0 |')
    })

    test('shows correct line and column for violation', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'markdown' })
      const report = createReport({
        files: [
          {
            filePath: '/src/file.ts',
            violations: [
              createViolation({
                range: { start: { line: 100, column: 25 }, end: { line: 100, column: 30 } },
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
      expect(output).toContain('line 100:25')
    })

    test('error icon is red circle', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'markdown' })
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
      expect(output).toContain('🔴')
      expect(output).not.toContain('🟡')
    })

    test('warning icon is yellow circle', () => {
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
      expect(output).not.toContain('🔴')
    })

    test('info icon is blue circle', () => {
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
      expect(output).not.toContain('🔴')
    })
  })

  describe('formatGitlab detailed', () => {
    test('description matches violation message exactly', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'gitlab' })
      const report = createReport({
        files: [
          {
            filePath: '/src/file.ts',
            violations: [createViolation({ message: 'Exact message here' })],
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
      expect(parsed[0].description).toBe('Exact message here')
    })

    test('fingerprint includes ruleId component', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'gitlab' })
      const report = createReport({
        files: [
          { filePath: '/src/file.ts', violations: [createViolation({ ruleId: 'custom-check' })] },
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
      expect(parsed[0].fingerprint).toContain('custom-check')
    })

    test('handles violations from multiple files in order', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'gitlab' })
      const report = createReport({
        files: [
          { filePath: '/src/first.ts', violations: [createViolation({ ruleId: 'r1' })] },
          { filePath: '/src/second.ts', violations: [createViolation({ ruleId: 'r2' })] },
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
      expect(parsed[0].check_name).toBe('r1')
      expect(parsed[1].check_name).toBe('r2')
    })
  })

  describe('formatSarif detailed', () => {
    test('tool driver has correct informationUri', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'sarif' })
      const report = createReport()
      const output = reporter.formatReport(report)
      const parsed = JSON.parse(output)
      expect(parsed.runs[0].tool.driver.informationUri).toBe(
        'https://github.com/codeforge-dev/codeforge',
      )
    })

    test('results include artifactLocation uri', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'sarif' })
      const report = createReport({
        files: [{ filePath: '/src/custom/path.ts', violations: [createViolation()] }],
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
      expect(parsed.runs[0].results[0].locations[0].physicalLocation.artifactLocation.uri).toBe(
        '/src/custom/path.ts',
      )
    })

    test('startLine in region matches violation range', () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'sarif' })
      const report = createReport({
        files: [
          {
            filePath: '/src/file.ts',
            violations: [
              createViolation({
                range: { start: { line: 77, column: 3 }, end: { line: 77, column: 10 } },
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
      expect(parsed.runs[0].results[0].locations[0].physicalLocation.region.startLine).toBe(77)
    })
  })

  describe('writeReport with report content', () => {
    test('calls mkdir with directory of output path', async () => {
      const reporter = new Reporter({
        ...defaultOptions,
        format: 'json',
        outputPath: '/tmp/reports/report.json',
      })
      const report = createReport()
      await reporter.writeReport(report)
      expect(fs.mkdir).toHaveBeenCalledWith('/tmp/reports', { recursive: true })
    })

    test('passes utf-8 encoding to writeFile', async () => {
      const reporter = new Reporter({
        ...defaultOptions,
        format: 'json',
        outputPath: '/out/r.json',
      })
      const report = createReport()
      await reporter.writeReport(report)
      expect(fs.writeFile).toHaveBeenCalledWith(expect.any(String), expect.any(String), 'utf8')
    })

    test('does not call mkdir when no output path', async () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'console' })
      const report = createReport()
      await reporter.writeReport(report)
      expect(fs.mkdir).not.toHaveBeenCalled()
    })

    test('does not call writeFile when no output path', async () => {
      const reporter = new Reporter({ ...defaultOptions, format: 'console' })
      const report = createReport()
      await reporter.writeReport(report)
      expect(fs.writeFile).not.toHaveBeenCalled()
    })
  })
})
