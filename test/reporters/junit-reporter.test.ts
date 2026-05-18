import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { JUnitReporter } from '../../src/reporters/junit-reporter.js'
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

// ─── JUnitReporter.name ───────────────────────────────

describe('JUnitReporter', () => {
  it('has name "junit"', () => {
    const reporter = new JUnitReporter()
    expect(reporter.name).toBe('junit')
  })

  // ─── format ─────────────────────────────────────────

  describe('format', () => {
    it('produces a non-empty string', () => {
      const reporter = new JUnitReporter()
      const output = reporter.format(makeViolation())
      expect(typeof output).toBe('string')
      expect(output.length).toBeGreaterThan(0)
    })

    it('includes [ERROR] for error severity', () => {
      const reporter = new JUnitReporter()
      const output = reporter.format(makeViolation({ severity: 'error' }))
      expect(output).toContain('[ERROR]')
    })

    it('includes [WARNING] for warning severity', () => {
      const reporter = new JUnitReporter()
      const output = reporter.format(makeViolation({ severity: 'warning' }))
      expect(output).toContain('[WARNING]')
    })

    it('includes [INFO] for info severity', () => {
      const reporter = new JUnitReporter()
      const output = reporter.format(makeViolation({ severity: 'info' }))
      expect(output).toContain('[INFO]')
    })

    it('includes ruleId in brackets', () => {
      const reporter = new JUnitReporter()
      const output = reporter.format(makeViolation({ ruleId: 'prefer-const' }))
      expect(output).toContain('[prefer-const]')
    })

    it('includes filePath:line:column', () => {
      const reporter = new JUnitReporter()
      const output = reporter.format(makeViolation({ filePath: 'src/app.ts', line: 42, column: 7 }))
      expect(output).toContain('src/app.ts:42:7')
    })

    it('includes message text', () => {
      const reporter = new JUnitReporter()
      const output = reporter.format(makeViolation({ message: 'Use const instead' }))
      expect(output).toContain('Use const instead')
    })

    it('formats correctly with all fields combined', () => {
      const reporter = new JUnitReporter()
      const violation = makeViolation({
        severity: 'warning',
        ruleId: 'max-params',
        filePath: 'lib/utils.ts',
        line: 15,
        column: 3,
        message: 'Too many parameters',
      })
      const output = reporter.format(violation)
      expect(output).toBe('[WARNING] [max-params] lib/utils.ts:15:3 Too many parameters')
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

    it('writes XML to stdout when no outputPath is set', () => {
      const reporter = new JUnitReporter()
      reporter.report(makeAnalysisResult())
      expect(stdoutSpy).toHaveBeenCalledTimes(1)
      const output = stdoutSpy.mock.calls[0]![0] as string
      expect(output.length).toBeGreaterThan(0)
    })

    it('outputs XML declaration', () => {
      const reporter = new JUnitReporter()
      reporter.report(makeAnalysisResult())
      const output = stdoutSpy.mock.calls[0]![0] as string
      expect(output).toContain('<?xml version="1.0" encoding="UTF-8"?>')
    })

    it('outputs testsuites root element', () => {
      const reporter = new JUnitReporter()
      reporter.report(makeAnalysisResult())
      const output = stdoutSpy.mock.calls[0]![0] as string
      expect(output).toContain('<testsuites')
      expect(output).toContain('</testsuites>')
    })

    it('includes testsuites name as "CodeForge Analysis"', () => {
      const reporter = new JUnitReporter()
      reporter.report(makeAnalysisResult())
      const output = stdoutSpy.mock.calls[0]![0] as string
      expect(output).toContain('name="CodeForge Analysis"')
    })

    it('outputs testsuite per file', () => {
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

    it('outputs testcase per violation', () => {
      const reporter = new JUnitReporter()
      reporter.report(makeAnalysisResult())
      const output = stdoutSpy.mock.calls[0]![0] as string
      expect(output).toContain('<testcase')
      expect(output).toContain('</testcase>')
    })

    it('uses <error> element for error severity violations', () => {
      const reporter = new JUnitReporter()
      reporter.report(makeAnalysisResult())
      const output = stdoutSpy.mock.calls[0]![0] as string
      expect(output).toContain('<error')
      expect(output).toContain('</error>')
    })

    it('uses <failure> element for warning severity violations', () => {
      const reporter = new JUnitReporter()
      reporter.report(
        makeAnalysisResult({
          files: [
            {
              filePath: 'src/a.ts',
              stats: { analysisTime: 1, parseTime: 1, totalTime: 2 },
              violations: [makeViolation({ filePath: 'src/a.ts', severity: 'warning' })],
            },
          ],
          summary: {
            errorCount: 0,
            filesWithViolations: 1,
            infoCount: 0,
            totalFiles: 1,
            totalTime: 2,
            warningCount: 1,
          },
        }),
      )
      const output = stdoutSpy.mock.calls[0]![0] as string
      expect(output).toContain('<failure')
      expect(output).toContain('</failure>')
    })

    it('uses <failure> element for info severity violations', () => {
      const reporter = new JUnitReporter()
      reporter.report(
        makeAnalysisResult({
          files: [
            {
              filePath: 'src/a.ts',
              stats: { analysisTime: 1, parseTime: 1, totalTime: 2 },
              violations: [makeViolation({ filePath: 'src/a.ts', severity: 'info' })],
            },
          ],
          summary: {
            errorCount: 0,
            filesWithViolations: 1,
            infoCount: 1,
            totalFiles: 1,
            totalTime: 2,
            warningCount: 0,
          },
        }),
      )
      const output = stdoutSpy.mock.calls[0]![0] as string
      expect(output).toContain('<failure')
      expect(output).toContain('</failure>')
    })

    it('includes violation message in testcase', () => {
      const reporter = new JUnitReporter()
      reporter.report(
        makeAnalysisResult({
          files: [
            {
              filePath: 'src/a.ts',
              stats: { analysisTime: 1, parseTime: 1, totalTime: 2 },
              violations: [
                makeViolation({ filePath: 'src/a.ts', message: 'Avoid eval usage' }),
              ],
            },
          ],
          summary: {
            errorCount: 1,
            filesWithViolations: 1,
            infoCount: 0,
            totalFiles: 1,
            totalTime: 2,
            warningCount: 0,
          },
        }),
      )
      const output = stdoutSpy.mock.calls[0]![0] as string
      expect(output).toContain('Avoid eval usage')
    })

    it('includes ruleId as error type', () => {
      const reporter = new JUnitReporter()
      reporter.report(
        makeAnalysisResult({
          files: [
            {
              filePath: 'src/a.ts',
              stats: { analysisTime: 1, parseTime: 1, totalTime: 2 },
              violations: [
                makeViolation({ filePath: 'src/a.ts', ruleId: 'no-eval' }),
              ],
            },
          ],
          summary: {
            errorCount: 1,
            filesWithViolations: 1,
            infoCount: 0,
            totalFiles: 1,
            totalTime: 2,
            warningCount: 0,
          },
        }),
      )
      const output = stdoutSpy.mock.calls[0]![0] as string
      expect(output).toContain('type="no-eval"')
    })

    it('includes location with filePath:line:column', () => {
      const reporter = new JUnitReporter()
      reporter.report(makeAnalysisResult())
      const output = stdoutSpy.mock.calls[0]![0] as string
      expect(output).toContain('src/index.ts:5:10')
    })

    it('includes source when present', () => {
      const reporter = new JUnitReporter()
      reporter.report(
        makeAnalysisResult({
          files: [
            {
              filePath: 'src/a.ts',
              stats: { analysisTime: 1, parseTime: 1, totalTime: 2 },
              violations: [
                makeViolation({ filePath: 'src/a.ts', source: 'console.log("x")' }),
              ],
            },
          ],
          summary: {
            errorCount: 1,
            filesWithViolations: 1,
            infoCount: 0,
            totalFiles: 1,
            totalTime: 2,
            warningCount: 0,
          },
        }),
      )
      const output = stdoutSpy.mock.calls[0]![0] as string
      expect(output).toContain('Source:')
      expect(output).toContain('console.log(&quot;x&quot;)')
    })

    it('includes suggestion when present', () => {
      const reporter = new JUnitReporter()
      reporter.report(
        makeAnalysisResult({
          files: [
            {
              filePath: 'src/a.ts',
              stats: { analysisTime: 1, parseTime: 1, totalTime: 2 },
              violations: [
                makeViolation({ filePath: 'src/a.ts', suggestion: 'Remove console.log' }),
              ],
            },
          ],
          summary: {
            errorCount: 1,
            filesWithViolations: 1,
            infoCount: 0,
            totalFiles: 1,
            totalTime: 2,
            warningCount: 0,
          },
        }),
      )
      const output = stdoutSpy.mock.calls[0]![0] as string
      expect(output).toContain('Suggestion: Remove console.log')
    })

    it('escapes XML special characters in messages', () => {
      const reporter = new JUnitReporter()
      reporter.report(
        makeAnalysisResult({
          files: [
            {
              filePath: 'src/a.ts',
              stats: { analysisTime: 1, parseTime: 1, totalTime: 2 },
              violations: [
                makeViolation({
                  filePath: 'src/a.ts',
                  message: 'Use <strict> & "quotes"',
                }),
              ],
            },
          ],
          summary: {
            errorCount: 1,
            filesWithViolations: 1,
            infoCount: 0,
            totalFiles: 1,
            totalTime: 2,
            warningCount: 0,
          },
        }),
      )
      const output = stdoutSpy.mock.calls[0]![0] as string
      expect(output).toContain('&lt;strict&gt;')
      expect(output).toContain('&amp;')
      expect(output).toContain('&quot;quotes&quot;')
    })

    it('handles multiple files with multiple violations', () => {
      const reporter = new JUnitReporter()
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
      const testsuiteMatches = output.match(/<testsuite\n/g)
      expect(testsuiteMatches?.length).toBe(2)
      const testcaseMatches = output.match(/<testcase/g)
      expect(testcaseMatches?.length).toBe(3)
    })

    it('appends newline to stdout output', () => {
      const reporter = new JUnitReporter()
      reporter.report(makeAnalysisResult())
      const output = stdoutSpy.mock.calls[0]![0] as string
      expect(output.endsWith('\n')).toBe(true)
    })

    it('does not write to stdout when outputPath is set', () => {
      const reporter = new JUnitReporter({ outputPath: '/tmp/test-report.xml' })
      reporter.report(makeAnalysisResult())
      expect(stdoutSpy).not.toHaveBeenCalled()
    })

    it('sets tests count from summary in testsuites element', () => {
      const reporter = new JUnitReporter()
      reporter.report(makeAnalysisResult())
      const output = stdoutSpy.mock.calls[0]![0] as string
      expect(output).toContain('tests="1"')
    })

    it('sets errors count from summary errorCount', () => {
      const reporter = new JUnitReporter()
      reporter.report(makeAnalysisResult())
      const output = stdoutSpy.mock.calls[0]![0] as string
      expect(output).toContain('errors="1"')
    })
  })

  // ─── Construction ───────────────────────────────────

  describe('construction', () => {
    it('accepts empty options object', () => {
      const reporter = new JUnitReporter({})
      expect(reporter.name).toBe('junit')
    })

    it('accepts no options', () => {
      const reporter = new JUnitReporter()
      expect(reporter.name).toBe('junit')
    })
  })
})
