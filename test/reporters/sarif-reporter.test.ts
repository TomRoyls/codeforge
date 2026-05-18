import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { SARIFReporter } from '../../src/reporters/sarif-reporter.js'
import type { SARIFResult } from '../../src/reporters/sarif-reporter.js'
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

// ─── SARIFReporter.name ───────────────────────────────

describe('SARIFReporter', () => {
  it('has name "sarif"', () => {
    const reporter = new SARIFReporter()
    expect(reporter.name).toBe('sarif')
  })

  // ─── format ─────────────────────────────────────────

  describe('format', () => {
    it('produces valid JSON string', () => {
      const reporter = new SARIFReporter()
      const output = reporter.format(makeViolation())
      expect(() => JSON.parse(output)).not.toThrow()
    })

    it('maps severity "error" to SARIF level "error"', () => {
      const reporter = new SARIFReporter()
      const output = reporter.format(makeViolation({ severity: 'error' }))
      const parsed = JSON.parse(output) as SARIFResult
      expect(parsed.level).toBe('error')
    })

    it('maps severity "warning" to SARIF level "warning"', () => {
      const reporter = new SARIFReporter()
      const output = reporter.format(makeViolation({ severity: 'warning' }))
      const parsed = JSON.parse(output) as SARIFResult
      expect(parsed.level).toBe('warning')
    })

    it('maps severity "info" to SARIF level "note"', () => {
      const reporter = new SARIFReporter()
      const output = reporter.format(makeViolation({ severity: 'info' }))
      const parsed = JSON.parse(output) as SARIFResult
      expect(parsed.level).toBe('note')
    })

    it('includes locations[0].physicalLocation.artifactLocation.uri from filePath', () => {
      const reporter = new SARIFReporter()
      const output = reporter.format(makeViolation({ filePath: 'src/app.ts' }))
      const parsed = JSON.parse(output) as SARIFResult
      expect(parsed.locations[0].physicalLocation.artifactLocation.uri).toBe('src/app.ts')
    })

    it('includes message.text from violation message', () => {
      const reporter = new SARIFReporter()
      const output = reporter.format(makeViolation({ message: 'Use const instead' }))
      const parsed = JSON.parse(output) as SARIFResult
      expect(parsed.message.text).toBe('Use const instead')
    })

    it('includes ruleId from violation', () => {
      const reporter = new SARIFReporter()
      const output = reporter.format(makeViolation({ ruleId: 'prefer-const' }))
      const parsed = JSON.parse(output) as SARIFResult
      expect(parsed.ruleId).toBe('prefer-const')
    })

    it('includes region with startLine and startColumn', () => {
      const reporter = new SARIFReporter()
      const output = reporter.format(makeViolation({ line: 42, column: 7 }))
      const parsed = JSON.parse(output) as SARIFResult
      const region = parsed.locations[0].physicalLocation.region
      expect(region?.startLine).toBe(42)
      expect(region?.startColumn).toBe(7)
    })

    it('omits fixes when no suggestion is provided', () => {
      const reporter = new SARIFReporter()
      const output = reporter.format(makeViolation())
      const parsed = JSON.parse(output) as SARIFResult
      expect(parsed.fixes).toBeUndefined()
    })

    it('includes fixes array when suggestion is present', () => {
      const reporter = new SARIFReporter()
      const output = reporter.format(
        makeViolation({ suggestion: 'Remove the console statement' }),
      )
      const parsed = JSON.parse(output) as SARIFResult
      expect(parsed.fixes).toBeDefined()
      expect(Array.isArray(parsed.fixes)).toBe(true)
      expect(parsed.fixes!.length).toBe(1)
    })

    it('includes insertedContent with suggestion text in fix', () => {
      const reporter = new SARIFReporter()
      const output = reporter.format(
        makeViolation({ suggestion: 'Use const instead of let' }),
      )
      const parsed = JSON.parse(output) as SARIFResult
      const replacement = parsed.fixes![0]!.artifactChanges[0]!.replacements[0]!
      expect(replacement.insertedContent?.text).toBe('Use const instead of let')
    })

    it('includes fix description as "Suggested fix"', () => {
      const reporter = new SARIFReporter()
      const output = reporter.format(makeViolation({ suggestion: 'Fix it' }))
      const parsed = JSON.parse(output) as SARIFResult
      expect(parsed.fixes![0]!.description.text).toBe('Suggested fix')
    })

    it('includes fix artifactLocation uri matching violation filePath', () => {
      const reporter = new SARIFReporter()
      const output = reporter.format(
        makeViolation({ filePath: 'lib/utils.ts', suggestion: 'Fix it' }),
      )
      const parsed = JSON.parse(output) as SARIFResult
      expect(parsed.fixes![0]!.artifactChanges[0]!.artifactLocation.uri).toBe('lib/utils.ts')
    })

    it('omits endLine from region when not provided', () => {
      const reporter = new SARIFReporter()
      const output = reporter.format(makeViolation())
      const parsed = JSON.parse(output) as SARIFResult
      const region = parsed.locations[0].physicalLocation.region!
      expect(region.endLine).toBeUndefined()
    })

    it('omits endColumn from region when not provided', () => {
      const reporter = new SARIFReporter()
      const output = reporter.format(makeViolation())
      const parsed = JSON.parse(output) as SARIFResult
      const region = parsed.locations[0].physicalLocation.region!
      expect(region.endColumn).toBeUndefined()
    })

    it('includes endLine in region when provided', () => {
      const reporter = new SARIFReporter()
      const output = reporter.format(makeViolation({ endLine: 12 }))
      const parsed = JSON.parse(output) as SARIFResult
      const region = parsed.locations[0].physicalLocation.region!
      expect(region.endLine).toBe(12)
    })

    it('includes endColumn in region when provided', () => {
      const reporter = new SARIFReporter()
      const output = reporter.format(makeViolation({ endColumn: 25 }))
      const parsed = JSON.parse(output) as SARIFResult
      const region = parsed.locations[0].physicalLocation.region!
      expect(region.endColumn).toBe(25)
    })

    it('includes both endLine and endColumn when both provided', () => {
      const reporter = new SARIFReporter()
      const output = reporter.format(makeViolation({ endLine: 20, endColumn: 30 }))
      const parsed = JSON.parse(output) as SARIFResult
      const region = parsed.locations[0].physicalLocation.region!
      expect(region.endLine).toBe(20)
      expect(region.endColumn).toBe(30)
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
      const reporter = new SARIFReporter()
      reporter.report(makeAnalysisResult())
      expect(stdoutSpy).toHaveBeenCalledTimes(1)
      const output = stdoutSpy.mock.calls[0]![0] as string
      expect(() => JSON.parse(output)).not.toThrow()
    })

    it('outputs valid SARIF with $schema, version, and runs', () => {
      const reporter = new SARIFReporter()
      reporter.report(makeAnalysisResult())
      const output = stdoutSpy.mock.calls[0]![0] as string
      const parsed = JSON.parse(output)
      expect(parsed.$schema).toBe(
        'https://raw.githubusercontent.com/oasis-tcs/sarif-spec/master/Schemata/sarif-schema-2.1.0.json',
      )
      expect(parsed.version).toBe('2.1.0')
      expect(Array.isArray(parsed.runs)).toBe(true)
    })

    it('includes tool driver with name "CodeForge"', () => {
      const reporter = new SARIFReporter()
      reporter.report(makeAnalysisResult())
      const output = stdoutSpy.mock.calls[0]![0] as string
      const parsed = JSON.parse(output)
      expect(parsed.runs[0].tool.driver.name).toBe('CodeForge')
    })

    it('defaults tool driver version to "0.1.0"', () => {
      const reporter = new SARIFReporter()
      reporter.report(makeAnalysisResult())
      const output = stdoutSpy.mock.calls[0]![0] as string
      const parsed = JSON.parse(output)
      expect(parsed.runs[0].tool.driver.version).toBe('0.1.0')
    })

    it('uses version from results when provided', () => {
      const reporter = new SARIFReporter()
      reporter.report(makeAnalysisResult({ version: '3.2.1' }))
      const output = stdoutSpy.mock.calls[0]![0] as string
      const parsed = JSON.parse(output)
      expect(parsed.runs[0].tool.driver.version).toBe('3.2.1')
    })

    it('includes rules from violations in tool driver', () => {
      const reporter = new SARIFReporter()
      reporter.report(makeAnalysisResult())
      const output = stdoutSpy.mock.calls[0]![0] as string
      const parsed = JSON.parse(output)
      const rules = parsed.runs[0].tool.driver.rules
      expect(Array.isArray(rules)).toBe(true)
      expect(rules.length).toBe(1)
      expect(rules[0].id).toBe('no-console')
    })

    it('deduplicates rules by ruleId', () => {
      const reporter = new SARIFReporter()
      reporter.report(
        makeAnalysisResult({
          files: [
            {
              filePath: 'src/a.ts',
              stats: { analysisTime: 1, parseTime: 1, totalTime: 2 },
              violations: [
                makeViolation({ filePath: 'src/a.ts', ruleId: 'no-console' }),
                makeViolation({ filePath: 'src/a.ts', ruleId: 'no-console' }),
              ],
            },
          ],
          summary: {
            errorCount: 2,
            filesWithViolations: 1,
            infoCount: 0,
            totalFiles: 1,
            totalTime: 4,
            warningCount: 0,
          },
        }),
      )
      const output = stdoutSpy.mock.calls[0]![0] as string
      const parsed = JSON.parse(output)
      const rules = parsed.runs[0].tool.driver.rules
      expect(rules.length).toBe(1)
    })

    it('collects multiple distinct rules', () => {
      const reporter = new SARIFReporter()
      reporter.report(
        makeAnalysisResult({
          files: [
            {
              filePath: 'src/a.ts',
              stats: { analysisTime: 1, parseTime: 1, totalTime: 2 },
              violations: [
                makeViolation({ filePath: 'src/a.ts', ruleId: 'no-console' }),
                makeViolation({ filePath: 'src/a.ts', ruleId: 'prefer-const', severity: 'warning' }),
              ],
            },
          ],
          summary: {
            errorCount: 1,
            filesWithViolations: 1,
            infoCount: 0,
            totalFiles: 1,
            totalTime: 2,
            warningCount: 1,
          },
        }),
      )
      const output = stdoutSpy.mock.calls[0]![0] as string
      const parsed = JSON.parse(output)
      const rules = parsed.runs[0].tool.driver.rules
      expect(rules.length).toBe(2)
      const ids = rules.map((r: { id: string }) => r.id)
      expect(ids).toContain('no-console')
      expect(ids).toContain('prefer-const')
    })

    it('transforms all violations into results', () => {
      const reporter = new SARIFReporter()
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
      expect(parsed.runs[0].results.length).toBe(3)
    })

    it('formats compact JSON by default', () => {
      const reporter = new SARIFReporter()
      reporter.report(makeAnalysisResult())
      const output = stdoutSpy.mock.calls[0]![0] as string
      expect(output).not.toContain('\n  ')
    })

    it('formats pretty JSON when pretty option is true', () => {
      const reporter = new SARIFReporter({ pretty: true })
      reporter.report(makeAnalysisResult())
      const output = stdoutSpy.mock.calls[0]![0] as string
      expect(output).toContain('\n  ')
    })

    it('appends newline to stdout output', () => {
      const reporter = new SARIFReporter()
      reporter.report(makeAnalysisResult())
      const output = stdoutSpy.mock.calls[0]![0] as string
      expect(output.endsWith('\n')).toBe(true)
    })

    it('does not write to stdout when outputPath is set', () => {
      const reporter = new SARIFReporter({ outputPath: '/tmp/test-report.sarif' })
      reporter.report(makeAnalysisResult())
      expect(stdoutSpy).not.toHaveBeenCalled()
    })
  })

  // ─── Construction ───────────────────────────────────

  describe('construction', () => {
    it('accepts empty options object', () => {
      const reporter = new SARIFReporter({})
      expect(reporter.name).toBe('sarif')
    })

    it('accepts no options', () => {
      const reporter = new SARIFReporter()
      expect(reporter.name).toBe('sarif')
    })
  })
})
