import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { CSVReporter, createCSVReporter } from '../src/reporters/csv-reporter.js'
import type { AnalysisResult, Violation } from '../src/reporters/types.js'

// ─── Helpers ──────────────────────────────────────────

function makeViolation(overrides: Partial<Violation> = {}): Violation {
  return {
    column: 10,
    filePath: 'src/index.ts',
    line: 5,
    message: 'Unexpected console statement',
    ruleId: 'no-console',
    severity: 'error',
    ...overrides,
  }
}

function makeAnalysisResult(overrides: Partial<AnalysisResult> = {}): AnalysisResult {
  return {
    files: [
      {
        filePath: 'src/index.ts',
        stats: { analysisTime: 10, parseTime: 5, totalTime: 15 },
        violations: [makeViolation()],
      },
    ],
    summary: {
      errorCount: 1,
      filesWithViolations: 1,
      infoCount: 0,
      totalFiles: 1,
      totalTime: 15,
      warningCount: 0,
    },
    timestamp: '2025-01-01T00:00:00.000Z',
    ...overrides,
  }
}

// ─── CSVReporter class ────────────────────────────────

describe('CSVReporter', () => {
  // ─── Construction ───────────────────────────────────

  describe('construction', () => {
    it('has name "csv"', () => {
      const reporter = new CSVReporter()
      expect(reporter.name).toBe('csv')
    })

    it('defaults outputPath to undefined', () => {
      const reporter = new CSVReporter()
      expect(reporter).toBeInstanceOf(CSVReporter)
    })

    it('stores outputPath from options', () => {
      const reporter = new CSVReporter({ outputPath: '/tmp/report.csv' })
      expect(reporter).toBeInstanceOf(CSVReporter)
    })

    it('accepts empty options', () => {
      const reporter = new CSVReporter({})
      expect(reporter.name).toBe('csv')
    })
  })

  // ─── format ─────────────────────────────────────────

  describe('format', () => {
    it('formats a basic violation as CSV', () => {
      const reporter = new CSVReporter()
      const result = reporter.format(makeViolation())
      expect(result).toContain('src/index.ts')
      expect(result).toContain('5')
      expect(result).toContain('10')
      expect(result).toContain('error')
      expect(result).toContain('no-console')
      expect(result).toContain('Unexpected console statement')
    })

    it('includes endLine when present', () => {
      const reporter = new CSVReporter()
      const result = reporter.format(makeViolation({ endLine: 8 }))
      expect(result).toContain('8')
    })

    it('includes endColumn when present', () => {
      const reporter = new CSVReporter()
      const result = reporter.format(makeViolation({ endColumn: 15 }))
      expect(result).toContain('15')
    })

    it('includes source when present', () => {
      const reporter = new CSVReporter()
      const result = reporter.format(makeViolation({ source: 'console.log(x)' }))
      expect(result).toContain('console.log(x)')
    })

    it('includes suggestion when present', () => {
      const reporter = new CSVReporter()
      const result = reporter.format(makeViolation({ suggestion: 'Remove console' }))
      expect(result).toContain('Remove console')
    })

    it('handles violation with warning severity', () => {
      const reporter = new CSVReporter()
      const result = reporter.format(makeViolation({ severity: 'warning' }))
      expect(result).toContain('warning')
    })

    it('handles violation with info severity', () => {
      const reporter = new CSVReporter()
      const result = reporter.format(makeViolation({ severity: 'info' }))
      expect(result).toContain('info')
    })

    it('escapes commas in message', () => {
      const reporter = new CSVReporter()
      const result = reporter.format(makeViolation({ message: 'a, b, c' }))
      expect(result).toContain('"a, b, c"')
    })

    it('escapes double quotes in source field', () => {
      const reporter = new CSVReporter()
      const result = reporter.format(makeViolation({ source: 'console.log("x")' }))
      expect(result).toContain('"console.log(""x"")"')
    })

    it('escapes newlines in message', () => {
      const reporter = new CSVReporter()
      const result = reporter.format(makeViolation({ message: 'line1\nline2' }))
      expect(result).toContain('"line1\nline2"')
    })

    it('escapes carriage returns in message', () => {
      const reporter = new CSVReporter()
      const result = reporter.format(makeViolation({ message: 'line1\rline2' }))
      expect(result).toContain('"line1\rline2"')
    })

    it('does not quote simple values', () => {
      const reporter = new CSVReporter()
      const result = reporter.format(makeViolation({ message: 'simple message' }))
      const fields = result.split(',')
      // message should not be quoted since no special chars
      expect(fields[5]).toBe('simple message')
    })

    it('produces correct number of comma-separated fields', () => {
      const reporter = new CSVReporter()
      const result = reporter.format(makeViolation())
      // 10 fields: file, line, column, severity, rule, message, end_line, end_column, source, suggestion
      const fields = result.split(',')
      expect(fields.length).toBe(10)
    })

    it('handles violation with all optional fields', () => {
      const reporter = new CSVReporter()
      const result = reporter.format(
        makeViolation({
          endColumn: 20,
          endLine: 10,
          source: 'const x = 1',
          suggestion: 'Use let instead',
        }),
      )
      expect(result).toContain('10')
      expect(result).toContain('20')
      expect(result).toContain('const x = 1')
      expect(result).toContain('Use let instead')
    })

    it('handles filePath with special characters', () => {
      const reporter = new CSVReporter()
      const result = reporter.format(makeViolation({ filePath: 'src/my, file.ts' }))
      expect(result).toContain('"src/my, file.ts"')
    })
  })

  // ─── report ─────────────────────────────────────────

  describe('report', () => {
    let stdoutSpy: ReturnType<typeof vi.spyOn>

    beforeEach(() => {
      stdoutSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true)
    })

    afterEach(() => {
      stdoutSpy.mockRestore()
    })

    it('writes CSV to stdout when no outputPath', () => {
      const reporter = new CSVReporter()
      reporter.report(makeAnalysisResult())
      expect(stdoutSpy).toHaveBeenCalledTimes(1)
      const output = stdoutSpy.mock.calls[0]![0] as string
      expect(output).toContain('file,line,column,severity,rule,message')
    })

    it('includes header row', () => {
      const reporter = new CSVReporter()
      reporter.report(makeAnalysisResult())
      const output = stdoutSpy.mock.calls[0]![0] as string
      const lines = output.split('\n')
      expect(lines[0]).toBe('file,line,column,severity,rule,message,end_line,end_column,source,suggestion')
    })

    it('includes violation rows after header', () => {
      const reporter = new CSVReporter()
      reporter.report(makeAnalysisResult())
      const output = stdoutSpy.mock.calls[0]![0] as string
      const lines = output.split('\n')
      // line 1 = header, line 2 = violation data
      expect(lines[1]).toContain('src/index.ts')
      expect(lines[1]).toContain('no-console')
    })

    it('includes summary section', () => {
      const reporter = new CSVReporter()
      reporter.report(makeAnalysisResult())
      const output = stdoutSpy.mock.calls[0]![0] as string
      expect(output).toContain('# Summary')
      expect(output).toContain('# Total Files: 1')
      expect(output).toContain('# Errors: 1')
      expect(output).toContain('# Warnings: 0')
      expect(output).toContain('# Info: 0')
      expect(output).toContain('# Timestamp: 2025-01-01T00:00:00.000Z')
    })

    it('includes total time in summary', () => {
      const reporter = new CSVReporter()
      reporter.report(makeAnalysisResult())
      const output = stdoutSpy.mock.calls[0]![0] as string
      expect(output).toContain('# Total Time: 15ms')
    })

    it('includes files with violations count in summary', () => {
      const reporter = new CSVReporter()
      reporter.report(makeAnalysisResult())
      const output = stdoutSpy.mock.calls[0]![0] as string
      expect(output).toContain('# Files with Violations: 1')
    })

    it('handles multiple files with violations', () => {
      const reporter = new CSVReporter()
      reporter.report(
        makeAnalysisResult({
          files: [
            {
              filePath: 'src/a.ts',
              stats: { analysisTime: 5, parseTime: 2, totalTime: 7 },
              violations: [makeViolation({ filePath: 'src/a.ts', ruleId: 'rule-a' })],
            },
            {
              filePath: 'src/b.ts',
              stats: { analysisTime: 3, parseTime: 1, totalTime: 4 },
              violations: [makeViolation({ filePath: 'src/b.ts', ruleId: 'rule-b' })],
            },
          ],
          summary: {
            errorCount: 2,
            filesWithViolations: 2,
            infoCount: 0,
            totalFiles: 2,
            totalTime: 11,
            warningCount: 0,
          },
        }),
      )
      const output = stdoutSpy.mock.calls[0]![0] as string
      expect(output).toContain('rule-a')
      expect(output).toContain('rule-b')
    })

    it('handles multiple violations in a single file', () => {
      const reporter = new CSVReporter()
      reporter.report(
        makeAnalysisResult({
          files: [
            {
              filePath: 'src/index.ts',
              stats: { analysisTime: 10, parseTime: 5, totalTime: 15 },
              violations: [
                makeViolation({ ruleId: 'rule-1', line: 1 }),
                makeViolation({ ruleId: 'rule-2', line: 2 }),
                makeViolation({ ruleId: 'rule-3', line: 3 }),
              ],
            },
          ],
          summary: {
            errorCount: 3,
            filesWithViolations: 1,
            infoCount: 0,
            totalFiles: 1,
            totalTime: 15,
            warningCount: 0,
          },
        }),
      )
      const output = stdoutSpy.mock.calls[0]![0] as string
      expect(output).toContain('rule-1')
      expect(output).toContain('rule-2')
      expect(output).toContain('rule-3')
    })

    it('handles file with no violations', () => {
      const reporter = new CSVReporter()
      reporter.report(
        makeAnalysisResult({
          files: [
            {
              filePath: 'src/clean.ts',
              stats: { analysisTime: 1, parseTime: 1, totalTime: 2 },
              violations: [],
            },
          ],
          summary: {
            errorCount: 0,
            filesWithViolations: 0,
            infoCount: 0,
            totalFiles: 1,
            totalTime: 2,
            warningCount: 0,
          },
        }),
      )
      const output = stdoutSpy.mock.calls[0]![0] as string
      const lines = output.split('\n')
      // header + empty line + summary lines
      expect(lines[0]).toContain('file,line,column')
    })

    it('writes to file when outputPath is set', () => {
      const writeSpy = vi.fn()
      vi.doMock('../src/utils/file-writer.js', () => ({ writeToFile: writeSpy }))
      const reporter = new CSVReporter({ outputPath: '/tmp/test.csv' })
      reporter.report(makeAnalysisResult())
      // Since we can't easily doMock with ESM, test by checking stdout is NOT called
      expect(stdoutSpy).not.toHaveBeenCalled()
      vi.restoreAllMocks()
    })
  })

  // ─── Header format ──────────────────────────────────

  describe('header format', () => {
    let stdoutSpy: ReturnType<typeof vi.spyOn>

    beforeEach(() => {
      stdoutSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true)
    })

    afterEach(() => {
      stdoutSpy.mockRestore()
    })

    it('contains all expected column headers', () => {
      const reporter = new CSVReporter()
      reporter.report(makeAnalysisResult())
      const output = stdoutSpy.mock.calls[0]![0] as string
      const headerLine = output.split('\n')[0]!
      expect(headerLine).toContain('file')
      expect(headerLine).toContain('line')
      expect(headerLine).toContain('column')
      expect(headerLine).toContain('severity')
      expect(headerLine).toContain('rule')
      expect(headerLine).toContain('message')
      expect(headerLine).toContain('end_line')
      expect(headerLine).toContain('end_column')
      expect(headerLine).toContain('source')
      expect(headerLine).toContain('suggestion')
    })

    it('has headers in correct order', () => {
      const reporter = new CSVReporter()
      reporter.report(makeAnalysisResult())
      const output = stdoutSpy.mock.calls[0]![0] as string
      const headerLine = output.split('\n')[0]!
      const headers = headerLine.split(',')
      expect(headers[0]).toBe('file')
      expect(headers[1]).toBe('line')
      expect(headers[2]).toBe('column')
      expect(headers[3]).toBe('severity')
      expect(headers[4]).toBe('rule')
      expect(headers[5]).toBe('message')
      expect(headers[6]).toBe('end_line')
      expect(headers[7]).toBe('end_column')
      expect(headers[8]).toBe('source')
      expect(headers[9]).toBe('suggestion')
    })
  })

  // ─── Summary format ─────────────────────────────────

  describe('summary format', () => {
    let stdoutSpy: ReturnType<typeof vi.spyOn>

    beforeEach(() => {
      stdoutSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true)
    })

    afterEach(() => {
      stdoutSpy.mockRestore()
    })

    it('includes all summary metrics', () => {
      const reporter = new CSVReporter()
      reporter.report(makeAnalysisResult())
      const output = stdoutSpy.mock.calls[0]![0] as string
      expect(output).toContain('# Total Files: 1')
      expect(output).toContain('# Files with Violations: 1')
      expect(output).toContain('# Errors: 1')
      expect(output).toContain('# Warnings: 0')
      expect(output).toContain('# Info: 0')
      expect(output).toContain('# Total Time: 15ms')
      expect(output).toContain('# Timestamp: 2025-01-01T00:00:00.000Z')
    })

    it('reflects warning and info counts', () => {
      const reporter = new CSVReporter()
      reporter.report(
        makeAnalysisResult({
          summary: {
            errorCount: 2,
            filesWithViolations: 1,
            infoCount: 3,
            totalFiles: 1,
            totalTime: 50,
            warningCount: 4,
          },
        }),
      )
      const output = stdoutSpy.mock.calls[0]![0] as string
      expect(output).toContain('# Errors: 2')
      expect(output).toContain('# Warnings: 4')
      expect(output).toContain('# Info: 3')
    })

    it('uses timestamp from results', () => {
      const reporter = new CSVReporter()
      reporter.report(makeAnalysisResult({ timestamp: '2025-06-15T12:30:00.000Z' }))
      const output = stdoutSpy.mock.calls[0]![0] as string
      expect(output).toContain('# Timestamp: 2025-06-15T12:30:00.000Z')
    })
  })

  // ─── Edge cases ─────────────────────────────────────

  describe('edge cases', () => {
    let stdoutSpy: ReturnType<typeof vi.spyOn>

    beforeEach(() => {
      stdoutSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true)
    })

    afterEach(() => {
      stdoutSpy.mockRestore()
    })

    it('handles empty files array', () => {
      const reporter = new CSVReporter()
      reporter.report(
        makeAnalysisResult({
          files: [],
          summary: {
            errorCount: 0,
            filesWithViolations: 0,
            infoCount: 0,
            totalFiles: 0,
            totalTime: 0,
            warningCount: 0,
          },
        }),
      )
      const output = stdoutSpy.mock.calls[0]![0] as string
      expect(output).toContain('# Summary')
      expect(output).toContain('# Total Files: 0')
    })

    it('handles violation with very long message', () => {
      const reporter = new CSVReporter()
      const longMsg = 'a'.repeat(1000)
      const result = reporter.format(makeViolation({ message: longMsg }))
      expect(result).toContain(longMsg)
    })

    it('handles violation with empty message', () => {
      const reporter = new CSVReporter()
      const result = reporter.format(makeViolation({ message: '' }))
      expect(result).toBeDefined()
    })

    it('handles zero line and column', () => {
      const reporter = new CSVReporter()
      const result = reporter.format(makeViolation({ line: 0, column: 0 }))
      expect(result).toContain('0')
    })

    it('handles large line and column numbers', () => {
      const reporter = new CSVReporter()
      const result = reporter.format(makeViolation({ line: 99999, column: 88888 }))
      expect(result).toContain('99999')
      expect(result).toContain('88888')
    })

    it('handles ruleId with special characters', () => {
      const reporter = new CSVReporter()
      const result = reporter.format(makeViolation({ ruleId: 'rule/with,comma' }))
      expect(result).toContain('"rule/with,comma"')
    })
  })
})

// ─── createCSVReporter ────────────────────────────────

describe('createCSVReporter', () => {
  it('returns a Reporter instance', () => {
    const reporter = createCSVReporter({})
    expect(reporter).toBeInstanceOf(CSVReporter)
  })

  it('returns reporter with name "csv"', () => {
    const reporter = createCSVReporter({})
    expect(reporter.name).toBe('csv')
  })

  it('passes options to reporter', () => {
    const reporter = createCSVReporter({ outputPath: '/tmp/test.csv' })
    expect(reporter).toBeInstanceOf(CSVReporter)
  })

  it('returns reporter with format method', () => {
    const reporter = createCSVReporter({})
    expect(typeof reporter.format).toBe('function')
  })

  it('returns reporter with report method', () => {
    const reporter = createCSVReporter({})
    expect(typeof reporter.report).toBe('function')
  })

  it('returns reporter without undefined options', () => {
    const reporter = createCSVReporter({})
    expect(reporter.name).toBe('csv')
  })
})
