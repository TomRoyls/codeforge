import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { JUnitReporter } from '../src/reporters/junit-reporter.js'
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

// ─── JUnitReporter class ──────────────────────────────

describe('JUnitReporter', () => {
  // ─── Construction ───────────────────────────────────

  describe('construction', () => {
    it('has name "junit"', () => {
      const reporter = new JUnitReporter()
      expect(reporter.name).toBe('junit')
    })

    it('accepts empty options', () => {
      const reporter = new JUnitReporter({})
      expect(reporter.name).toBe('junit')
    })

    it('stores outputPath from options', () => {
      const reporter = new JUnitReporter({ outputPath: '/tmp/junit.xml' })
      expect(reporter).toBeInstanceOf(JUnitReporter)
    })

    it('works with default options', () => {
      const reporter = new JUnitReporter()
      expect(reporter).toBeInstanceOf(JUnitReporter)
    })
  })

  // ─── format ─────────────────────────────────────────

  describe('format', () => {
    it('formats violation with severity uppercase', () => {
      const reporter = new JUnitReporter()
      const result = reporter.format(makeViolation({ severity: 'error' }))
      expect(result).toContain('[ERROR]')
    })

    it('formats violation with ruleId', () => {
      const reporter = new JUnitReporter()
      const result = reporter.format(makeViolation())
      expect(result).toContain('[no-console]')
    })

    it('formats violation with file location', () => {
      const reporter = new JUnitReporter()
      const result = reporter.format(makeViolation())
      expect(result).toContain('src/index.ts:5:10')
    })

    it('formats violation with message', () => {
      const reporter = new JUnitReporter()
      const result = reporter.format(makeViolation())
      expect(result).toContain('Unexpected console statement')
    })

    it('formats warning severity correctly', () => {
      const reporter = new JUnitReporter()
      const result = reporter.format(makeViolation({ severity: 'warning' }))
      expect(result).toContain('[WARNING]')
    })

    it('formats info severity correctly', () => {
      const reporter = new JUnitReporter()
      const result = reporter.format(makeViolation({ severity: 'info' }))
      expect(result).toContain('[INFO]')
    })

    it('formats complete violation string', () => {
      const reporter = new JUnitReporter()
      const result = reporter.format(makeViolation())
      expect(result).toBe('[ERROR] [no-console] src/index.ts:5:10 Unexpected console statement')
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

    it('writes XML to stdout when no outputPath', () => {
      const reporter = new JUnitReporter()
      reporter.report(makeAnalysisResult())
      expect(stdoutSpy).toHaveBeenCalledTimes(1)
    })

    it('does not write to stdout when outputPath is set', () => {
      const reporter = new JUnitReporter({ outputPath: '/tmp/junit.xml' })
      reporter.report(makeAnalysisResult())
      expect(stdoutSpy).not.toHaveBeenCalled()
    })

    it('starts with XML declaration', () => {
      const reporter = new JUnitReporter()
      reporter.report(makeAnalysisResult())
      const output = stdoutSpy.mock.calls[0]![0] as string
      expect(output.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true)
    })

    it('contains testsuites root element', () => {
      const reporter = new JUnitReporter()
      reporter.report(makeAnalysisResult())
      const output = stdoutSpy.mock.calls[0]![0] as string
      expect(output).toContain('<testsuites')
      expect(output).toContain('</testsuites>')
    })

    it('includes CodeForge Analysis as name', () => {
      const reporter = new JUnitReporter()
      reporter.report(makeAnalysisResult())
      const output = stdoutSpy.mock.calls[0]![0] as string
      expect(output).toContain('name="CodeForge Analysis"')
    })

    it('includes total test count in testsuites', () => {
      const reporter = new JUnitReporter()
      reporter.report(makeAnalysisResult())
      const output = stdoutSpy.mock.calls[0]![0] as string
      expect(output).toContain('tests="1"')
    })

    it('includes failure count in testsuites', () => {
      const reporter = new JUnitReporter()
      reporter.report(makeAnalysisResult())
      const output = stdoutSpy.mock.calls[0]![0] as string
      expect(output).toContain('failures="0"')
    })

    it('includes error count in testsuites', () => {
      const reporter = new JUnitReporter()
      reporter.report(makeAnalysisResult())
      const output = stdoutSpy.mock.calls[0]![0] as string
      expect(output).toContain('errors="1"')
    })

    it('includes time in testsuites', () => {
      const reporter = new JUnitReporter()
      reporter.report(makeAnalysisResult())
      const output = stdoutSpy.mock.calls[0]![0] as string
      expect(output).toContain('time="0.015"')
    })

    it('contains testsuite for each file', () => {
      const reporter = new JUnitReporter()
      reporter.report(makeAnalysisResult())
      const output = stdoutSpy.mock.calls[0]![0] as string
      expect(output).toContain('<testsuite')
      expect(output).toContain('</testsuite>')
    })

    it('includes file path as testsuite name', () => {
      const reporter = new JUnitReporter()
      reporter.report(makeAnalysisResult())
      const output = stdoutSpy.mock.calls[0]![0] as string
      expect(output).toContain('name="src/index.ts"')
    })

    it('includes testcase for each violation', () => {
      const reporter = new JUnitReporter()
      reporter.report(makeAnalysisResult())
      const output = stdoutSpy.mock.calls[0]![0] as string
      expect(output).toContain('<testcase')
      expect(output).toContain('</testcase>')
    })

    it('uses <error> tag for error severity', () => {
      const reporter = new JUnitReporter()
      reporter.report(makeAnalysisResult())
      const output = stdoutSpy.mock.calls[0]![0] as string
      expect(output).toContain('<error')
      expect(output).toContain('</error>')
    })

    it('uses <failure> tag for warning severity', () => {
      const reporter = new JUnitReporter()
      reporter.report(
        makeAnalysisResult({
          files: [
            {
              filePath: 'src/index.ts',
              stats: { analysisTime: 10, parseTime: 5, totalTime: 15 },
              violations: [makeViolation({ severity: 'warning' })],
            },
          ],
          summary: {
            errorCount: 0,
            filesWithViolations: 1,
            infoCount: 0,
            totalFiles: 1,
            totalTime: 15,
            warningCount: 1,
          },
        }),
      )
      const output = stdoutSpy.mock.calls[0]![0] as string
      expect(output).toContain('<failure')
      expect(output).toContain('</failure>')
    })

    it('uses <failure> tag for info severity', () => {
      const reporter = new JUnitReporter()
      reporter.report(
        makeAnalysisResult({
          files: [
            {
              filePath: 'src/index.ts',
              stats: { analysisTime: 10, parseTime: 5, totalTime: 15 },
              violations: [makeViolation({ severity: 'info' })],
            },
          ],
          summary: {
            errorCount: 0,
            filesWithViolations: 1,
            infoCount: 1,
            totalFiles: 1,
            totalTime: 15,
            warningCount: 0,
          },
        }),
      )
      const output = stdoutSpy.mock.calls[0]![0] as string
      expect(output).toContain('<failure')
    })

    it('includes violation message in testcase', () => {
      const reporter = new JUnitReporter()
      reporter.report(makeAnalysisResult())
      const output = stdoutSpy.mock.calls[0]![0] as string
      expect(output).toContain('message="Unexpected console statement"')
    })

    it('includes ruleId as type in error tag', () => {
      const reporter = new JUnitReporter()
      reporter.report(makeAnalysisResult())
      const output = stdoutSpy.mock.calls[0]![0] as string
      expect(output).toContain('type="no-console"')
    })

    it('includes location in error body', () => {
      const reporter = new JUnitReporter()
      reporter.report(makeAnalysisResult())
      const output = stdoutSpy.mock.calls[0]![0] as string
      expect(output).toContain('Location: src/index.ts:5:10')
    })

    it('includes source when present', () => {
      const reporter = new JUnitReporter()
      reporter.report(
        makeAnalysisResult({
          files: [
            {
              filePath: 'src/index.ts',
              stats: { analysisTime: 10, parseTime: 5, totalTime: 15 },
              violations: [makeViolation({ source: 'console.log()' })],
            },
          ],
        }),
      )
      const output = stdoutSpy.mock.calls[0]![0] as string
      expect(output).toContain('Source:')
      expect(output).toContain('console.log()')
    })

    it('includes suggestion when present', () => {
      const reporter = new JUnitReporter()
      reporter.report(
        makeAnalysisResult({
          files: [
            {
              filePath: 'src/index.ts',
              stats: { analysisTime: 10, parseTime: 5, totalTime: 15 },
              violations: [makeViolation({ suggestion: 'Remove it' })],
            },
          ],
        }),
      )
      const output = stdoutSpy.mock.calls[0]![0] as string
      expect(output).toContain('Suggestion: Remove it')
    })

    it('escapes XML special characters in messages', () => {
      const reporter = new JUnitReporter()
      reporter.report(
        makeAnalysisResult({
          files: [
            {
              filePath: 'src/index.ts',
              stats: { analysisTime: 10, parseTime: 5, totalTime: 15 },
              violations: [makeViolation({ message: 'Use &lt; instead of <' })],
            },
          ],
        }),
      )
      const output = stdoutSpy.mock.calls[0]![0] as string
      expect(output).toContain('&amp;lt;')
    })

    it('escapes XML in file paths', () => {
      const reporter = new JUnitReporter()
      reporter.report(
        makeAnalysisResult({
          files: [
            {
              filePath: 'src/a&b.ts',
              stats: { analysisTime: 10, parseTime: 5, totalTime: 15 },
              violations: [makeViolation({ filePath: 'src/a&b.ts' })],
            },
          ],
        }),
      )
      const output = stdoutSpy.mock.calls[0]![0] as string
      expect(output).toContain('src/a&amp;b.ts')
    })

    it('includes timestamp in testsuite', () => {
      const reporter = new JUnitReporter()
      reporter.report(makeAnalysisResult())
      const output = stdoutSpy.mock.calls[0]![0] as string
      expect(output).toContain('timestamp="')
    })

    it('includes time in testsuite from file stats', () => {
      const reporter = new JUnitReporter()
      reporter.report(makeAnalysisResult())
      const output = stdoutSpy.mock.calls[0]![0] as string
      expect(output).toMatch(/time="0\.015"/)
    })

    it('handles multiple files', () => {
      const reporter = new JUnitReporter()
      reporter.report(
        makeAnalysisResult({
          files: [
            {
              filePath: 'src/a.ts',
              stats: { analysisTime: 1, parseTime: 1, totalTime: 2 },
              violations: [makeViolation({ filePath: 'src/a.ts', ruleId: 'r1' })],
            },
            {
              filePath: 'src/b.ts',
              stats: { analysisTime: 1, parseTime: 1, totalTime: 2 },
              violations: [makeViolation({ filePath: 'src/b.ts', ruleId: 'r2' })],
            },
          ],
          summary: {
            errorCount: 2,
            filesWithViolations: 2,
            infoCount: 0,
            totalFiles: 2,
            totalTime: 4,
            warningCount: 0,
          },
        }),
      )
      const output = stdoutSpy.mock.calls[0]![0] as string
      expect(output).toContain('name="src/a.ts"')
      expect(output).toContain('name="src/b.ts"')
    })

    it('handles multiple violations in a file', () => {
      const reporter = new JUnitReporter()
      reporter.report(
        makeAnalysisResult({
          files: [
            {
              filePath: 'src/index.ts',
              stats: { analysisTime: 10, parseTime: 5, totalTime: 15 },
              violations: [
                makeViolation({ ruleId: 'r1', line: 1 }),
                makeViolation({ ruleId: 'r2', line: 2 }),
              ],
            },
          ],
          summary: {
            errorCount: 2,
            filesWithViolations: 1,
            infoCount: 0,
            totalFiles: 1,
            totalTime: 15,
            warningCount: 0,
          },
        }),
      )
      const output = stdoutSpy.mock.calls[0]![0] as string
      expect(output).toContain('type="r1"')
      expect(output).toContain('type="r2"')
    })

    it('calculates failures and errors correctly for mixed severities', () => {
      const reporter = new JUnitReporter()
      reporter.report(
        makeAnalysisResult({
          files: [
            {
              filePath: 'src/index.ts',
              stats: { analysisTime: 10, parseTime: 5, totalTime: 15 },
              violations: [
                makeViolation({ severity: 'error' }),
                makeViolation({ severity: 'warning' }),
                makeViolation({ severity: 'info' }),
              ],
            },
          ],
          summary: {
            errorCount: 1,
            filesWithViolations: 1,
            infoCount: 1,
            totalFiles: 1,
            totalTime: 15,
            warningCount: 1,
          },
        }),
      )
      const output = stdoutSpy.mock.calls[0]![0] as string
      expect(output).toContain('errors="1"')
      expect(output).toContain('failures="2"')
    })

    it('computes test suite failure count as warning + info', () => {
      const reporter = new JUnitReporter()
      reporter.report(
        makeAnalysisResult({
          files: [
            {
              filePath: 'src/index.ts',
              stats: { analysisTime: 10, parseTime: 5, totalTime: 15 },
              violations: [
                makeViolation({ severity: 'warning' }),
                makeViolation({ severity: 'info' }),
              ],
            },
          ],
          summary: {
            errorCount: 0,
            filesWithViolations: 1,
            infoCount: 1,
            totalFiles: 1,
            totalTime: 15,
            warningCount: 1,
          },
        }),
      )
      const output = stdoutSpy.mock.calls[0]![0] as string
      const suiteMatch = output.match(/<testsuite[\s\S]*?failures="(\d+)"/)
      expect(suiteMatch![1]).toBe('2')
    })

    it('includes tests count matching violations in testsuite', () => {
      const reporter = new JUnitReporter()
      reporter.report(
        makeAnalysisResult({
          files: [
            {
              filePath: 'src/index.ts',
              stats: { analysisTime: 10, parseTime: 5, totalTime: 15 },
              violations: [
                makeViolation({ ruleId: 'r1' }),
                makeViolation({ ruleId: 'r2' }),
                makeViolation({ ruleId: 'r3' }),
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
      const suiteMatch = output.match(/<testsuite[\s\S]*?tests="(\d+)"/)
      expect(suiteMatch![1]).toBe('3')
    })

    it('includes testcase name with ruleId and message', () => {
      const reporter = new JUnitReporter()
      reporter.report(makeAnalysisResult())
      const output = stdoutSpy.mock.calls[0]![0] as string
      expect(output).toContain('name="no-console: Unexpected console statement"')
    })

    it('includes classname with file path', () => {
      const reporter = new JUnitReporter()
      reporter.report(makeAnalysisResult())
      const output = stdoutSpy.mock.calls[0]![0] as string
      expect(output).toContain('classname="src/index.ts"')
    })

    it('uses severity as type in failure tag for warnings', () => {
      const reporter = new JUnitReporter()
      reporter.report(
        makeAnalysisResult({
          files: [
            {
              filePath: 'src/index.ts',
              stats: { analysisTime: 10, parseTime: 5, totalTime: 15 },
              violations: [makeViolation({ severity: 'warning' })],
            },
          ],
          summary: {
            errorCount: 0,
            filesWithViolations: 1,
            infoCount: 0,
            totalFiles: 1,
            totalTime: 15,
            warningCount: 1,
          },
        }),
      )
      const output = stdoutSpy.mock.calls[0]![0] as string
      expect(output).toContain('type="warning"')
    })

    it('appends newline to stdout output', () => {
      const reporter = new JUnitReporter()
      reporter.report(makeAnalysisResult())
      const output = stdoutSpy.mock.calls[0]![0] as string
      expect(output.endsWith('\n')).toBe(true)
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
      const reporter = new JUnitReporter()
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
      expect(output).toContain('<?xml version="1.0"')
      expect(output).toContain('</testsuites>')
    })

    it('handles file with no violations', () => {
      const reporter = new JUnitReporter()
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
      expect(output).toContain('tests="0"')
      expect(output).toContain('errors="0"')
      expect(output).toContain('failures="0"')
    })

    it('handles violation with quotes in message', () => {
      const reporter = new JUnitReporter()
      reporter.report(
        makeAnalysisResult({
          files: [
            {
              filePath: 'src/index.ts',
              stats: { analysisTime: 10, parseTime: 5, totalTime: 15 },
              violations: [makeViolation({ message: 'Don\'t use "eval"' })],
            },
          ],
        }),
      )
      const output = stdoutSpy.mock.calls[0]![0] as string
      expect(output).toContain('&quot;eval&quot;')
      expect(output).toContain('&apos;')
    })

    it('handles zero total time', () => {
      const reporter = new JUnitReporter()
      reporter.report(
        makeAnalysisResult({
          summary: {
            ...makeAnalysisResult().summary,
            totalTime: 0,
          },
        }),
      )
      const output = stdoutSpy.mock.calls[0]![0] as string
      expect(output).toContain('time="0.000"')
    })
  })
})
