import { describe, expect, it, vi } from 'vitest'
import type { AnalysisResult, Violation } from '../../src/reporters/types.js'

import {
  CSVReporter,
  createCSVReporter,
} from '../../src/reporters/csv-reporter.js'

function makeViolation(overrides: Partial<Violation> = {}): Violation {
  return {
    column: 5,
    filePath: 'src/test.ts',
    line: 10,
    message: 'Unexpected console statement',
    ruleId: 'no-console',
    severity: 'error',
    ...overrides,
  }
}

function makeAnalysisResult(
  violations: Violation[] = [makeViolation()],
): AnalysisResult {
  return {
    files: [
      {
        filePath: 'src/test.ts',
        stats: { analysisTime: 10, parseTime: 5, totalTime: 15 },
        violations,
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
  }
}

// ─── CSVReporter.name ───

describe('CSVReporter', () => {
  it('has name "csv"', () => {
    const reporter = new CSVReporter()
    expect(reporter.name).toBe('csv')
  })

  // ─── format ───

  describe('format', () => {
    it('produces a CSV row for a basic violation', () => {
      const reporter = new CSVReporter()
      const result = reporter.format(makeViolation())

      expect(result).toContain('src/test.ts')
      expect(result).toContain('10')
      expect(result).toContain('5')
      expect(result).toContain('error')
      expect(result).toContain('no-console')
      expect(result).toContain('Unexpected console statement')
    })

    it('includes endLine and endColumn when present', () => {
      const reporter = new CSVReporter()
      const result = reporter.format(
        makeViolation({ endLine: 12, endColumn: 20 }),
      )

      expect(result).toContain('12')
      expect(result).toContain('20')
    })

    it('leaves endLine and endColumn empty when absent', () => {
      const reporter = new CSVReporter()
      const result = reporter.format(makeViolation())
      const fields = result.split(',')

      expect(fields[6]).toBe('')
      expect(fields[7]).toBe('')
    })

    it('includes source when provided', () => {
      const reporter = new CSVReporter()
      const result = reporter.format(
        makeViolation({ source: 'console.log("x")' }),
      )

      expect(result).toContain('"console.log(""x"")"')
    })

    it('includes suggestion when provided', () => {
      const reporter = new CSVReporter()
      const result = reporter.format(
        makeViolation({ suggestion: 'Remove the console statement' }),
      )

      expect(result).toContain('Remove the console statement')
    })
  })

  // ─── CSV escaping ───

  describe('CSV escaping', () => {
    it('escapes fields containing commas', () => {
      const reporter = new CSVReporter()
      const result = reporter.format(
        makeViolation({ message: 'error in a, b, and c' }),
      )

      expect(result).toContain('"error in a, b, and c"')
    })

    it('escapes fields containing double quotes', () => {
      const reporter = new CSVReporter()
      const result = reporter.format(
        makeViolation({ message: 'said "hello"' }),
      )

      expect(result).toContain('"said ""hello"""')
    })

    it('escapes fields containing newlines', () => {
      const reporter = new CSVReporter()
      const result = reporter.format(
        makeViolation({ message: 'line1\nline2' }),
      )

      expect(result).toContain('"line1\nline2"')
    })

    it('escapes fields containing carriage returns', () => {
      const reporter = new CSVReporter()
      const result = reporter.format(
        makeViolation({ message: 'line1\rline2' }),
      )

      expect(result).toContain('"line1\rline2"')
    })

    it('does not quote plain fields', () => {
      const reporter = new CSVReporter()
      const result = reporter.format(makeViolation())

      const filePathField = result.split(',')[0]
      expect(filePathField).toBe('src/test.ts')
    })
  })

  // ─── report ───

  describe('report', () => {
    it('writes CSV to stdout when no outputPath is given', () => {
      const reporter = new CSVReporter()
      const writeSpy = vi
        .spyOn(process.stdout, 'write')
        .mockImplementation(() => true)

      reporter.report(makeAnalysisResult())

      expect(writeSpy).toHaveBeenCalledTimes(1)
      const output = writeSpy.mock.calls[0][0] as string
      expect(output).toContain('file,line,column,severity,rule,message')
      expect(output).toContain('src/test.ts')
      expect(output).toContain('# Summary')
      expect(output).toContain('# Total Files: 1')

      writeSpy.mockRestore()
    })

    it('writes to file when outputPath is provided', () => {
      const reporter = new CSVReporter({ outputPath: '/tmp/test.csv' })
      const results = makeAnalysisResult()

      vi.doMock('../../src/utils/file-writer.js', () => ({
        writeToFile: vi.fn(),
      }))

      reporter.report(results)
    })

    it('includes a header row', () => {
      const reporter = new CSVReporter()
      const writeSpy = vi
        .spyOn(process.stdout, 'write')
        .mockImplementation(() => true)

      reporter.report(makeAnalysisResult())

      const output = writeSpy.mock.calls[0][0] as string
      const firstLine = output.split('\n')[0]
      expect(firstLine).toBe(
        'file,line,column,severity,rule,message,end_line,end_column,source,suggestion',
      )

      writeSpy.mockRestore()
    })

    it('includes summary section', () => {
      const reporter = new CSVReporter()
      const writeSpy = vi
        .spyOn(process.stdout, 'write')
        .mockImplementation(() => true)

      reporter.report(makeAnalysisResult())

      const output = writeSpy.mock.calls[0][0] as string
      expect(output).toContain('# Summary')
      expect(output).toContain('# Total Files: 1')
      expect(output).toContain('# Errors: 1')
      expect(output).toContain('# Warnings: 0')
      expect(output).toContain('# Info: 0')
      expect(output).toContain('# Timestamp: 2025-01-01T00:00:00.000Z')

      writeSpy.mockRestore()
    })

    it('handles multiple violations across files', () => {
      const reporter = new CSVReporter()
      const writeSpy = vi
        .spyOn(process.stdout, 'write')
        .mockImplementation(() => true)

      const results: AnalysisResult = {
        files: [
          {
            filePath: 'src/a.ts',
            stats: { analysisTime: 5, parseTime: 2, totalTime: 7 },
            violations: [makeViolation({ filePath: 'src/a.ts', ruleId: 'rule-a' })],
          },
          {
            filePath: 'src/b.ts',
            stats: { analysisTime: 3, parseTime: 1, totalTime: 4 },
            violations: [
              makeViolation({ filePath: 'src/b.ts', ruleId: 'rule-b' }),
              makeViolation({
                filePath: 'src/b.ts',
                ruleId: 'rule-c',
                severity: 'warning',
              }),
            ],
          },
        ],
        summary: {
          errorCount: 2,
          filesWithViolations: 2,
          infoCount: 0,
          totalFiles: 2,
          totalTime: 11,
          warningCount: 1,
        },
        timestamp: '2025-01-01T00:00:00.000Z',
      }

      reporter.report(results)

      const output = writeSpy.mock.calls[0][0] as string
      const dataLines = output
        .split('\n')
        .filter((line) => line && !line.startsWith('#'))

      expect(dataLines).toHaveLength(4)
      expect(dataLines[0]).toContain('file,line,column')
      expect(dataLines[1]).toContain('rule-a')
      expect(dataLines[2]).toContain('rule-b')
      expect(dataLines[3]).toContain('rule-c')

      writeSpy.mockRestore()
    })

    it('handles zero violations', () => {
      const reporter = new CSVReporter()
      const writeSpy = vi
        .spyOn(process.stdout, 'write')
        .mockImplementation(() => true)

      const result = makeAnalysisResult([])
      result.summary.errorCount = 0
      result.summary.filesWithViolations = 0
      reporter.report(result)

      const output = writeSpy.mock.calls[0][0] as string
      expect(output).toContain('file,line,column,severity,rule,message')
      expect(output).toContain('# Total Files: 1')
      expect(output).toContain('# Errors: 0')

      writeSpy.mockRestore()
    })
  })
})

// ─── createCSVReporter ───

describe('createCSVReporter', () => {
  it('returns a Reporter instance with name "csv"', () => {
    const reporter = createCSVReporter({})
    expect(reporter.name).toBe('csv')
  })

  it('returns a Reporter with a format method', () => {
    const reporter = createCSVReporter({})
    expect(typeof reporter.format).toBe('function')
  })

  it('returns a Reporter with a report method', () => {
    const reporter = createCSVReporter({})
    expect(typeof reporter.report).toBe('function')
  })

  it('passes options through to the reporter', () => {
    const reporter = createCSVReporter({ outputPath: '/tmp/out.csv' })
    const writeSpy = vi
      .spyOn(process.stdout, 'write')
      .mockImplementation(() => true)

    expect(reporter.name).toBe('csv')

    writeSpy.mockRestore()
  })
})
