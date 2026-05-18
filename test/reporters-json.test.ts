import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { JSONReporter } from '../src/reporters/json-reporter.js'
import type { JsonOutput, JsonFileResult, JsonViolation } from '../src/reporters/json-reporter.js'
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

// ─── JSONReporter class ───────────────────────────────

describe('JSONReporter', () => {
  // ─── Construction ───────────────────────────────────

  describe('construction', () => {
    it('has name "json"', () => {
      const reporter = new JSONReporter()
      expect(reporter.name).toBe('json')
    })

    it('defaults pretty to false', () => {
      const reporter = new JSONReporter()
      expect(reporter).toBeInstanceOf(JSONReporter)
    })

    it('stores pretty option', () => {
      const reporter = new JSONReporter({ pretty: true })
      expect(reporter).toBeInstanceOf(JSONReporter)
    })

    it('stores outputPath option', () => {
      const reporter = new JSONReporter({ outputPath: '/tmp/out.json' })
      expect(reporter).toBeInstanceOf(JSONReporter)
    })

    it('accepts empty options', () => {
      const reporter = new JSONReporter({})
      expect(reporter.name).toBe('json')
    })
  })

  // ─── format ─────────────────────────────────────────

  describe('format', () => {
    it('returns valid JSON string', () => {
      const reporter = new JSONReporter()
      const result = reporter.format(makeViolation())
      expect(() => JSON.parse(result)).not.toThrow()
    })

    it('includes location with file path', () => {
      const reporter = new JSONReporter()
      const result = reporter.format(makeViolation())
      const parsed = JSON.parse(result) as JsonViolation
      expect(parsed.location.file).toBe('src/index.ts')
    })

    it('includes location with line number', () => {
      const reporter = new JSONReporter()
      const result = reporter.format(makeViolation())
      const parsed = JSON.parse(result) as JsonViolation
      expect(parsed.location.line).toBe(5)
    })

    it('includes location with column number', () => {
      const reporter = new JSONReporter()
      const result = reporter.format(makeViolation())
      const parsed = JSON.parse(result) as JsonViolation
      expect(parsed.location.column).toBe(10)
    })

    it('includes message', () => {
      const reporter = new JSONReporter()
      const result = reporter.format(makeViolation())
      const parsed = JSON.parse(result) as JsonViolation
      expect(parsed.message).toBe('Unexpected console statement')
    })

    it('includes ruleId', () => {
      const reporter = new JSONReporter()
      const result = reporter.format(makeViolation())
      const parsed = JSON.parse(result) as JsonViolation
      expect(parsed.ruleId).toBe('no-console')
    })

    it('includes severity', () => {
      const reporter = new JSONReporter()
      const result = reporter.format(makeViolation())
      const parsed = JSON.parse(result) as JsonViolation
      expect(parsed.severity).toBe('error')
    })

    it('includes endLine when present', () => {
      const reporter = new JSONReporter()
      const result = reporter.format(makeViolation({ endLine: 8 }))
      const parsed = JSON.parse(result) as JsonViolation
      expect(parsed.location.endLine).toBe(8)
    })

    it('includes endColumn when present', () => {
      const reporter = new JSONReporter()
      const result = reporter.format(makeViolation({ endColumn: 15 }))
      const parsed = JSON.parse(result) as JsonViolation
      expect(parsed.location.endColumn).toBe(15)
    })

    it('includes source when present', () => {
      const reporter = new JSONReporter()
      const result = reporter.format(makeViolation({ source: 'console.log()' }))
      const parsed = JSON.parse(result) as JsonViolation
      expect(parsed.source).toBe('console.log()')
    })

    it('includes suggestion when present', () => {
      const reporter = new JSONReporter()
      const result = reporter.format(makeViolation({ suggestion: 'Remove it' }))
      const parsed = JSON.parse(result) as JsonViolation
      expect(parsed.suggestion).toBe('Remove it')
    })

    it('includes meta when present', () => {
      const reporter = new JSONReporter()
      const meta = { fixable: true, category: 'style' }
      const result = reporter.format(makeViolation({ meta }))
      const parsed = JSON.parse(result) as JsonViolation
      expect(parsed.meta).toEqual(meta)
    })

    it('omits endLine when not present', () => {
      const reporter = new JSONReporter()
      const result = reporter.format(makeViolation())
      const parsed = JSON.parse(result) as JsonViolation
      expect(parsed.location.endLine).toBeUndefined()
    })

    it('handles warning severity', () => {
      const reporter = new JSONReporter()
      const result = reporter.format(makeViolation({ severity: 'warning' }))
      const parsed = JSON.parse(result) as JsonViolation
      expect(parsed.severity).toBe('warning')
    })

    it('handles info severity', () => {
      const reporter = new JSONReporter()
      const result = reporter.format(makeViolation({ severity: 'info' }))
      const parsed = JSON.parse(result) as JsonViolation
      expect(parsed.severity).toBe('info')
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

    it('writes JSON to stdout when no outputPath', () => {
      const reporter = new JSONReporter()
      reporter.report(makeAnalysisResult())
      expect(stdoutSpy).toHaveBeenCalledTimes(1)
    })

    it('outputs valid JSON', () => {
      const reporter = new JSONReporter()
      reporter.report(makeAnalysisResult())
      const output = stdoutSpy.mock.calls[0]![0] as string
      expect(() => JSON.parse(output)).not.toThrow()
    })

    it('includes files array in output', () => {
      const reporter = new JSONReporter()
      reporter.report(makeAnalysisResult())
      const output = stdoutSpy.mock.calls[0]![0] as string
      const parsed = JSON.parse(output) as JsonOutput
      expect(parsed.files).toBeInstanceOf(Array)
      expect(parsed.files.length).toBe(1)
    })

    it('includes summary in output', () => {
      const reporter = new JSONReporter()
      reporter.report(makeAnalysisResult())
      const output = stdoutSpy.mock.calls[0]![0] as string
      const parsed = JSON.parse(output) as JsonOutput
      expect(parsed.summary).toEqual({
        errorCount: 1,
        filesWithViolations: 1,
        infoCount: 0,
        totalFiles: 1,
        totalTime: 15,
        warningCount: 0,
      })
    })

    it('includes timestamp in output', () => {
      const reporter = new JSONReporter()
      reporter.report(makeAnalysisResult())
      const output = stdoutSpy.mock.calls[0]![0] as string
      const parsed = JSON.parse(output) as JsonOutput
      expect(parsed.timestamp).toBe('2025-01-01T00:00:00.000Z')
    })

    it('uses version from results when available', () => {
      const reporter = new JSONReporter()
      reporter.report(makeAnalysisResult({ version: '2.5.0' }))
      const output = stdoutSpy.mock.calls[0]![0] as string
      const parsed = JSON.parse(output) as JsonOutput
      expect(parsed.version).toBe('2.5.0')
    })

    it('defaults version to 1.0.0 when not provided', () => {
      const reporter = new JSONReporter()
      reporter.report(makeAnalysisResult())
      const output = stdoutSpy.mock.calls[0]![0] as string
      const parsed = JSON.parse(output) as JsonOutput
      expect(parsed.version).toBe('1.0.0')
    })

    it('formats compact JSON when pretty is false', () => {
      const reporter = new JSONReporter({ pretty: false })
      reporter.report(makeAnalysisResult())
      const output = stdoutSpy.mock.calls[0]![0] as string
      expect(output).not.toContain('\n  ')
    })

    it('formats pretty JSON when pretty is true', () => {
      const reporter = new JSONReporter({ pretty: true })
      reporter.report(makeAnalysisResult())
      const output = stdoutSpy.mock.calls[0]![0] as string
      expect(output).toContain('\n  ')
    })

    it('includes file path in each file result', () => {
      const reporter = new JSONReporter()
      reporter.report(makeAnalysisResult())
      const output = stdoutSpy.mock.calls[0]![0] as string
      const parsed = JSON.parse(output) as JsonOutput
      expect(parsed.files[0]!.filePath).toBe('src/index.ts')
    })

    it('includes stats in each file result', () => {
      const reporter = new JSONReporter()
      reporter.report(makeAnalysisResult())
      const output = stdoutSpy.mock.calls[0]![0] as string
      const parsed = JSON.parse(output) as JsonOutput
      expect(parsed.files[0]!.stats).toEqual({
        analysisTime: 10,
        parseTime: 5,
        totalTime: 15,
      })
    })

    it('transforms violations with location structure', () => {
      const reporter = new JSONReporter()
      reporter.report(makeAnalysisResult())
      const output = stdoutSpy.mock.calls[0]![0] as string
      const parsed = JSON.parse(output) as JsonOutput
      const v = parsed.files[0]!.violations[0]!
      expect(v.location.file).toBe('src/index.ts')
      expect(v.location.line).toBe(5)
      expect(v.location.column).toBe(10)
    })

    it('handles multiple files', () => {
      const reporter = new JSONReporter()
      reporter.report(
        makeAnalysisResult({
          files: [
            {
              filePath: 'src/a.ts',
              stats: { analysisTime: 1, parseTime: 1, totalTime: 2 },
              violations: [makeViolation({ filePath: 'src/a.ts' })],
            },
            {
              filePath: 'src/b.ts',
              stats: { analysisTime: 2, parseTime: 1, totalTime: 3 },
              violations: [makeViolation({ filePath: 'src/b.ts', ruleId: 'other-rule' })],
            },
          ],
          summary: {
            errorCount: 2,
            filesWithViolations: 2,
            infoCount: 0,
            totalFiles: 2,
            totalTime: 5,
            warningCount: 0,
          },
        }),
      )
      const output = stdoutSpy.mock.calls[0]![0] as string
      const parsed = JSON.parse(output) as JsonOutput
      expect(parsed.files.length).toBe(2)
    })

    it('handles file with no violations', () => {
      const reporter = new JSONReporter()
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
      const parsed = JSON.parse(output) as JsonOutput
      expect(parsed.files[0]!.violations).toEqual([])
    })

    it('does not write to stdout when outputPath is set', () => {
      const reporter = new JSONReporter({ outputPath: '/tmp/test.json' })
      reporter.report(makeAnalysisResult())
      expect(stdoutSpy).not.toHaveBeenCalled()
    })

    it('appends newline to stdout output', () => {
      const reporter = new JSONReporter()
      reporter.report(makeAnalysisResult())
      const output = stdoutSpy.mock.calls[0]![0] as string
      expect(output.endsWith('\n')).toBe(true)
    })
  })

  // ─── JsonOutput interface ───────────────────────────

  describe('JsonOutput interface', () => {
    let stdoutSpy: ReturnType<typeof vi.spyOn>

    beforeEach(() => {
      stdoutSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true)
    })

    afterEach(() => {
      stdoutSpy.mockRestore()
    })

    it('has correct structure', () => {
      const reporter = new JSONReporter()
      reporter.report(makeAnalysisResult())
      const output = stdoutSpy.mock.calls[0]![0] as string
      const parsed = JSON.parse(output) as JsonOutput
      expect(parsed).toHaveProperty('files')
      expect(parsed).toHaveProperty('summary')
      expect(parsed).toHaveProperty('timestamp')
      expect(parsed).toHaveProperty('version')
    })
  })

  // ─── JsonFileResult interface ───────────────────────

  describe('JsonFileResult structure', () => {
    let stdoutSpy: ReturnType<typeof vi.spyOn>

    beforeEach(() => {
      stdoutSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true)
    })

    afterEach(() => {
      stdoutSpy.mockRestore()
    })

    it('contains filePath, stats, and violations', () => {
      const reporter = new JSONReporter()
      reporter.report(makeAnalysisResult())
      const output = stdoutSpy.mock.calls[0]![0] as string
      const parsed = JSON.parse(output) as JsonOutput
      const file = parsed.files[0]! as JsonFileResult
      expect(file.filePath).toBe('src/index.ts')
      expect(file.stats).toBeDefined()
      expect(file.violations).toBeInstanceOf(Array)
    })
  })

  // ─── JsonViolation interface ────────────────────────

  describe('JsonViolation structure', () => {
    it('contains location, message, ruleId, severity', () => {
      const reporter = new JSONReporter()
      const result = reporter.format(makeViolation())
      const parsed = JSON.parse(result) as JsonViolation
      expect(parsed).toHaveProperty('location')
      expect(parsed).toHaveProperty('message')
      expect(parsed).toHaveProperty('ruleId')
      expect(parsed).toHaveProperty('severity')
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
      const reporter = new JSONReporter()
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
      const parsed = JSON.parse(output) as JsonOutput
      expect(parsed.files).toEqual([])
    })

    it('handles violation with unicode message', () => {
      const reporter = new JSONReporter()
      const result = reporter.format(makeViolation({ message: '日本語テスト 🎉' }))
      const parsed = JSON.parse(result) as JsonViolation
      expect(parsed.message).toBe('日本語テスト 🎉')
    })

    it('handles violation with very long filePath', () => {
      const longPath = 'src/'.repeat(100) + 'file.ts'
      const reporter = new JSONReporter()
      const result = reporter.format(makeViolation({ filePath: longPath }))
      const parsed = JSON.parse(result) as JsonViolation
      expect(parsed.location.file).toBe(longPath)
    })

    it('handles violation with all optional fields present', () => {
      const reporter = new JSONReporter()
      const result = reporter.format(
        makeViolation({
          endColumn: 20,
          endLine: 10,
          meta: { foo: 'bar' },
          source: 'src code',
          suggestion: 'fix it',
        }),
      )
      const parsed = JSON.parse(result) as JsonViolation
      expect(parsed.location.endLine).toBe(10)
      expect(parsed.location.endColumn).toBe(20)
      expect(parsed.meta).toEqual({ foo: 'bar' })
      expect(parsed.source).toBe('src code')
      expect(parsed.suggestion).toBe('fix it')
    })

    it('handles multiple violations across multiple files', () => {
      const reporter = new JSONReporter()
      reporter.report(
        makeAnalysisResult({
          files: [
            {
              filePath: 'a.ts',
              stats: { analysisTime: 1, parseTime: 1, totalTime: 2 },
              violations: [
                makeViolation({ filePath: 'a.ts', ruleId: 'r1', severity: 'error' }),
                makeViolation({ filePath: 'a.ts', ruleId: 'r2', severity: 'warning' }),
              ],
            },
            {
              filePath: 'b.ts',
              stats: { analysisTime: 1, parseTime: 1, totalTime: 2 },
              violations: [
                makeViolation({ filePath: 'b.ts', ruleId: 'r3', severity: 'info' }),
              ],
            },
          ],
          summary: {
            errorCount: 1,
            filesWithViolations: 2,
            infoCount: 1,
            totalFiles: 2,
            totalTime: 4,
            warningCount: 1,
          },
        }),
      )
      const output = stdoutSpy.mock.calls[0]![0] as string
      const parsed = JSON.parse(output) as JsonOutput
      expect(parsed.files[0]!.violations.length).toBe(2)
      expect(parsed.files[1]!.violations.length).toBe(1)
    })
  })
})
