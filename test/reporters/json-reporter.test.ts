import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { JSONReporter } from '../../src/reporters/json-reporter.js'
import type { JsonViolation } from '../../src/reporters/json-reporter.js'
import type { AnalysisResult, Violation } from '../../src/reporters/types.js'

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

// ─── JSONReporter.name ────────────────────────────────

describe('JSONReporter', () => {
  it('has name "json"', () => {
    const reporter = new JSONReporter()
    expect(reporter.name).toBe('json')
  })

  // ─── format ─────────────────────────────────────────

  describe('format', () => {
    it('produces valid JSON string', () => {
      const reporter = new JSONReporter()
      const output = reporter.format(makeViolation())
      expect(() => JSON.parse(output)).not.toThrow()
    })

    it('includes location.file from violation filePath', () => {
      const reporter = new JSONReporter()
      const output = reporter.format(makeViolation({ filePath: 'src/app.ts' }))
      const parsed = JSON.parse(output) as JsonViolation
      expect(parsed.location.file).toBe('src/app.ts')
    })

    it('includes location.line from violation line', () => {
      const reporter = new JSONReporter()
      const output = reporter.format(makeViolation({ line: 42 }))
      const parsed = JSON.parse(output) as JsonViolation
      expect(parsed.location.line).toBe(42)
    })

    it('includes location.column from violation column', () => {
      const reporter = new JSONReporter()
      const output = reporter.format(makeViolation({ column: 7 }))
      const parsed = JSON.parse(output) as JsonViolation
      expect(parsed.location.column).toBe(7)
    })

    it('includes message from violation', () => {
      const reporter = new JSONReporter()
      const output = reporter.format(makeViolation({ message: 'Use const instead' }))
      const parsed = JSON.parse(output) as JsonViolation
      expect(parsed.message).toBe('Use const instead')
    })

    it('includes ruleId from violation', () => {
      const reporter = new JSONReporter()
      const output = reporter.format(makeViolation({ ruleId: 'prefer-const' }))
      const parsed = JSON.parse(output) as JsonViolation
      expect(parsed.ruleId).toBe('prefer-const')
    })

    it('includes severity from violation', () => {
      const reporter = new JSONReporter()
      const output = reporter.format(makeViolation({ severity: 'warning' }))
      const parsed = JSON.parse(output) as JsonViolation
      expect(parsed.severity).toBe('warning')
    })

    it('includes optional endLine in location when present', () => {
      const reporter = new JSONReporter()
      const output = reporter.format(makeViolation({ endLine: 12 }))
      const parsed = JSON.parse(output) as JsonViolation
      expect(parsed.location.endLine).toBe(12)
    })

    it('includes optional endColumn in location when present', () => {
      const reporter = new JSONReporter()
      const output = reporter.format(makeViolation({ endColumn: 25 }))
      const parsed = JSON.parse(output) as JsonViolation
      expect(parsed.location.endColumn).toBe(25)
    })

    it('omits endLine from location when not provided', () => {
      const reporter = new JSONReporter()
      const output = reporter.format(makeViolation())
      const parsed = JSON.parse(output) as JsonViolation
      expect(parsed.location.endLine).toBeUndefined()
    })

    it('omits endColumn from location when not provided', () => {
      const reporter = new JSONReporter()
      const output = reporter.format(makeViolation())
      const parsed = JSON.parse(output) as JsonViolation
      expect(parsed.location.endColumn).toBeUndefined()
    })

    it('includes source when present', () => {
      const reporter = new JSONReporter()
      const output = reporter.format(makeViolation({ source: 'console.log("x")' }))
      const parsed = JSON.parse(output) as JsonViolation
      expect(parsed.source).toBe('console.log("x")')
    })

    it('includes suggestion when present', () => {
      const reporter = new JSONReporter()
      const output = reporter.format(makeViolation({ suggestion: 'Remove console.log' }))
      const parsed = JSON.parse(output) as JsonViolation
      expect(parsed.suggestion).toBe('Remove console.log')
    })

    it('includes meta when present', () => {
      const reporter = new JSONReporter()
      const meta = { fixable: true, category: 'best-practices' }
      const output = reporter.format(makeViolation({ meta }))
      const parsed = JSON.parse(output) as JsonViolation
      expect(parsed.meta).toEqual(meta)
    })

    it('handles all three severity levels', () => {
      const reporter = new JSONReporter()
      for (const severity of ['error', 'warning', 'info'] as const) {
        const output = reporter.format(makeViolation({ severity }))
        const parsed = JSON.parse(output) as JsonViolation
        expect(parsed.severity).toBe(severity)
      }
    })

    it('has correct top-level structure in format output', () => {
      const reporter = new JSONReporter()
      const output = reporter.format(makeViolation())
      const parsed = JSON.parse(output) as JsonViolation
      expect(parsed).toHaveProperty('location')
      expect(parsed).toHaveProperty('message')
      expect(parsed).toHaveProperty('ruleId')
      expect(parsed).toHaveProperty('severity')
      expect(parsed.location).toHaveProperty('file')
      expect(parsed.location).toHaveProperty('line')
      expect(parsed.location).toHaveProperty('column')
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

    it('writes JSON to stdout when no outputPath is set', () => {
      const reporter = new JSONReporter()
      reporter.report(makeAnalysisResult())
      expect(stdoutSpy).toHaveBeenCalledTimes(1)
      const output = stdoutSpy.mock.calls[0]![0] as string
      expect(() => JSON.parse(output)).not.toThrow()
    })

    it('outputs valid JSON with correct top-level structure', () => {
      const reporter = new JSONReporter()
      reporter.report(makeAnalysisResult())
      const output = stdoutSpy.mock.calls[0]![0] as string
      const parsed = JSON.parse(output)
      expect(parsed).toHaveProperty('files')
      expect(parsed).toHaveProperty('summary')
      expect(parsed).toHaveProperty('timestamp')
      expect(parsed).toHaveProperty('version')
    })

    it('includes summary from analysis result', () => {
      const reporter = new JSONReporter()
      reporter.report(makeAnalysisResult())
      const output = stdoutSpy.mock.calls[0]![0] as string
      const parsed = JSON.parse(output)
      expect(parsed.summary).toEqual({
        errorCount: 1,
        filesWithViolations: 1,
        infoCount: 0,
        totalFiles: 1,
        totalTime: 15,
        warningCount: 0,
      })
    })

    it('includes timestamp from analysis result', () => {
      const reporter = new JSONReporter()
      reporter.report(makeAnalysisResult())
      const output = stdoutSpy.mock.calls[0]![0] as string
      const parsed = JSON.parse(output)
      expect(parsed.timestamp).toBe('2025-01-01T00:00:00.000Z')
    })

    it('uses version from results when provided', () => {
      const reporter = new JSONReporter()
      reporter.report(makeAnalysisResult({ version: '3.2.1' }))
      const output = stdoutSpy.mock.calls[0]![0] as string
      const parsed = JSON.parse(output)
      expect(parsed.version).toBe('3.2.1')
    })

    it('defaults version to 1.0.0 when not provided', () => {
      const reporter = new JSONReporter()
      reporter.report(makeAnalysisResult())
      const output = stdoutSpy.mock.calls[0]![0] as string
      const parsed = JSON.parse(output)
      expect(parsed.version).toBe('1.0.0')
    })

    it('formats compact JSON by default', () => {
      const reporter = new JSONReporter()
      reporter.report(makeAnalysisResult())
      const output = stdoutSpy.mock.calls[0]![0] as string
      expect(output).not.toContain('\n  ')
    })

    it('formats pretty JSON when pretty option is true', () => {
      const reporter = new JSONReporter({ pretty: true })
      reporter.report(makeAnalysisResult())
      const output = stdoutSpy.mock.calls[0]![0] as string
      expect(output).toContain('\n  ')
    })

    it('appends newline to stdout output', () => {
      const reporter = new JSONReporter()
      reporter.report(makeAnalysisResult())
      const output = stdoutSpy.mock.calls[0]![0] as string
      expect(output.endsWith('\n')).toBe(true)
    })

    it('does not write to stdout when outputPath is set', () => {
      const reporter = new JSONReporter({ outputPath: '/tmp/test-report.json' })
      reporter.report(makeAnalysisResult())
      expect(stdoutSpy).not.toHaveBeenCalled()
    })

    it('transforms file results with filePath and stats', () => {
      const reporter = new JSONReporter()
      reporter.report(makeAnalysisResult())
      const output = stdoutSpy.mock.calls[0]![0] as string
      const parsed = JSON.parse(output)
      expect(parsed.files[0].filePath).toBe('src/index.ts')
      expect(parsed.files[0].stats).toEqual({
        analysisTime: 10,
        parseTime: 5,
        totalTime: 15,
      })
    })

    it('transforms violations with location structure in report output', () => {
      const reporter = new JSONReporter()
      reporter.report(makeAnalysisResult())
      const output = stdoutSpy.mock.calls[0]![0] as string
      const parsed = JSON.parse(output)
      const v = parsed.files[0].violations[0]
      expect(v.location.file).toBe('src/index.ts')
      expect(v.location.line).toBe(5)
      expect(v.location.column).toBe(10)
      expect(v.message).toBe('Unexpected console statement')
      expect(v.ruleId).toBe('no-console')
      expect(v.severity).toBe('error')
    })

    it('handles multiple files with multiple violations', () => {
      const reporter = new JSONReporter()
      reporter.report(
        makeAnalysisResult({
          files: [
            {
              filePath: 'src/a.ts',
              stats: { analysisTime: 1, parseTime: 1, totalTime: 2 },
              violations: [
                makeViolation({ filePath: 'src/a.ts', ruleId: 'r1' }),
                makeViolation({ filePath: 'src/a.ts', ruleId: 'r2', severity: 'warning' }),
              ],
            },
            {
              filePath: 'src/b.ts',
              stats: { analysisTime: 2, parseTime: 1, totalTime: 3 },
              violations: [
                makeViolation({ filePath: 'src/b.ts', ruleId: 'r3', severity: 'info' }),
              ],
            },
          ],
          summary: {
            errorCount: 1,
            filesWithViolations: 2,
            infoCount: 1,
            totalFiles: 2,
            totalTime: 5,
            warningCount: 1,
          },
        }),
      )
      const output = stdoutSpy.mock.calls[0]![0] as string
      const parsed = JSON.parse(output)
      expect(parsed.files.length).toBe(2)
      expect(parsed.files[0].violations.length).toBe(2)
      expect(parsed.files[1].violations.length).toBe(1)
    })

    it('handles file with zero violations', () => {
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
      const parsed = JSON.parse(output)
      expect(parsed.files[0].violations).toEqual([])
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
      const parsed = JSON.parse(output)
      expect(parsed.files).toEqual([])
    })
  })

  // ─── Construction ───────────────────────────────────

  describe('construction', () => {
    it('accepts empty options object', () => {
      const reporter = new JSONReporter({})
      expect(reporter.name).toBe('json')
    })

    it('accepts no options', () => {
      const reporter = new JSONReporter()
      expect(reporter.name).toBe('json')
    })
  })
})
