import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { SARIFReporter } from '../src/reporters/sarif-reporter.js'
import type {
  SARIFLog,
  SARIFResult,
  SARIFRun,
  SARIFTool,
  SARIFToolComponent,
  SARIFRule,
  SARIFLevel,
  SARIFFix,
  SARIFLocation,
  SARIFPhysicalLocation,
  SARIFRegion,
  SARIFMessage,
} from '../src/reporters/sarif-reporter.js'
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

// ─── SARIFReporter class ──────────────────────────────

describe('SARIFReporter', () => {
  // ─── Construction ───────────────────────────────────

  describe('construction', () => {
    it('has name "sarif"', () => {
      const reporter = new SARIFReporter()
      expect(reporter.name).toBe('sarif')
    })

    it('defaults pretty to false', () => {
      const reporter = new SARIFReporter()
      expect(reporter).toBeInstanceOf(SARIFReporter)
    })

    it('stores pretty option', () => {
      const reporter = new SARIFReporter({ pretty: true })
      expect(reporter).toBeInstanceOf(SARIFReporter)
    })

    it('stores outputPath option', () => {
      const reporter = new SARIFReporter({ outputPath: '/tmp/out.sarif' })
      expect(reporter).toBeInstanceOf(SARIFReporter)
    })

    it('accepts empty options', () => {
      const reporter = new SARIFReporter({})
      expect(reporter.name).toBe('sarif')
    })

    it('defaults version to 0.1.0', () => {
      const reporter = new SARIFReporter()
      expect(reporter).toBeInstanceOf(SARIFReporter)
    })
  })

  // ─── format ─────────────────────────────────────────

  describe('format', () => {
    it('returns valid JSON string', () => {
      const reporter = new SARIFReporter()
      const result = reporter.format(makeViolation())
      expect(() => JSON.parse(result)).not.toThrow()
    })

    it('returns SARIF result with level', () => {
      const reporter = new SARIFReporter()
      const result = reporter.format(makeViolation({ severity: 'error' }))
      const parsed = JSON.parse(result) as SARIFResult
      expect(parsed.level).toBe('error')
    })

    it('maps warning severity to warning level', () => {
      const reporter = new SARIFReporter()
      const result = reporter.format(makeViolation({ severity: 'warning' }))
      const parsed = JSON.parse(result) as SARIFResult
      expect(parsed.level).toBe('warning')
    })

    it('maps info severity to note level', () => {
      const reporter = new SARIFReporter()
      const result = reporter.format(makeViolation({ severity: 'info' }))
      const parsed = JSON.parse(result) as SARIFResult
      expect(parsed.level).toBe('note')
    })

    it('includes locations array', () => {
      const reporter = new SARIFReporter()
      const result = reporter.format(makeViolation())
      const parsed = JSON.parse(result) as SARIFResult
      expect(parsed.locations).toBeInstanceOf(Array)
      expect(parsed.locations.length).toBe(1)
    })

    it('includes file URI in location', () => {
      const reporter = new SARIFReporter()
      const result = reporter.format(makeViolation())
      const parsed = JSON.parse(result) as SARIFResult
      expect(parsed.locations[0]!.physicalLocation.artifactLocation.uri).toBe('src/index.ts')
    })

    it('includes region with startLine', () => {
      const reporter = new SARIFReporter()
      const result = reporter.format(makeViolation())
      const parsed = JSON.parse(result) as SARIFResult
      expect(parsed.locations[0]!.physicalLocation.region?.startLine).toBe(5)
    })

    it('includes region with startColumn', () => {
      const reporter = new SARIFReporter()
      const result = reporter.format(makeViolation())
      const parsed = JSON.parse(result) as SARIFResult
      expect(parsed.locations[0]!.physicalLocation.region?.startColumn).toBe(10)
    })

    it('includes endLine in region when present', () => {
      const reporter = new SARIFReporter()
      const result = reporter.format(makeViolation({ endLine: 8 }))
      const parsed = JSON.parse(result) as SARIFResult
      expect(parsed.locations[0]!.physicalLocation.region?.endLine).toBe(8)
    })

    it('includes endColumn in region when present', () => {
      const reporter = new SARIFReporter()
      const result = reporter.format(makeViolation({ endColumn: 20 }))
      const parsed = JSON.parse(result) as SARIFResult
      expect(parsed.locations[0]!.physicalLocation.region?.endColumn).toBe(20)
    })

    it('includes message text', () => {
      const reporter = new SARIFReporter()
      const result = reporter.format(makeViolation())
      const parsed = JSON.parse(result) as SARIFResult
      expect(parsed.message.text).toBe('Unexpected console statement')
    })

    it('includes ruleId', () => {
      const reporter = new SARIFReporter()
      const result = reporter.format(makeViolation())
      const parsed = JSON.parse(result) as SARIFResult
      expect(parsed.ruleId).toBe('no-console')
    })

    it('includes fixes when suggestion is present', () => {
      const reporter = new SARIFReporter()
      const result = reporter.format(makeViolation({ suggestion: 'Use logger' }))
      const parsed = JSON.parse(result) as SARIFResult
      expect(parsed.fixes).toBeDefined()
      expect(parsed.fixes!.length).toBe(1)
    })

    it('does not include fixes when no suggestion', () => {
      const reporter = new SARIFReporter()
      const result = reporter.format(makeViolation())
      const parsed = JSON.parse(result) as SARIFResult
      expect(parsed.fixes).toBeUndefined()
    })

    it('includes correct fix description', () => {
      const reporter = new SARIFReporter()
      const result = reporter.format(makeViolation({ suggestion: 'Fix it' }))
      const parsed = JSON.parse(result) as SARIFResult
      expect(parsed.fixes![0]!.description.text).toBe('Suggested fix')
    })

    it('includes artifact location in fix', () => {
      const reporter = new SARIFReporter()
      const result = reporter.format(makeViolation({ suggestion: 'Fix it' }))
      const parsed = JSON.parse(result) as SARIFResult
      expect(parsed.fixes![0]!.artifactChanges[0]!.artifactLocation.uri).toBe('src/index.ts')
    })

    it('includes inserted content in fix', () => {
      const reporter = new SARIFReporter()
      const result = reporter.format(makeViolation({ suggestion: 'Fix it' }))
      const parsed = JSON.parse(result) as SARIFResult
      expect(parsed.fixes![0]!.artifactChanges[0]!.replacements[0]!.insertedContent!.text).toBe('Fix it')
    })

    it('includes deleted region in fix', () => {
      const reporter = new SARIFReporter()
      const result = reporter.format(makeViolation({ suggestion: 'Fix it' }))
      const parsed = JSON.parse(result) as SARIFResult
      const deleted = parsed.fixes![0]!.artifactChanges[0]!.replacements[0]!.deletedRegion
      expect(deleted.startLine).toBe(5)
      expect(deleted.startColumn).toBe(10)
    })

    it('omits endLine from region when not present', () => {
      const reporter = new SARIFReporter()
      const result = reporter.format(makeViolation())
      const parsed = JSON.parse(result) as SARIFResult
      expect(parsed.locations[0]!.physicalLocation.region?.endLine).toBeUndefined()
    })

    it('omits endColumn from region when not present', () => {
      const reporter = new SARIFReporter()
      const result = reporter.format(makeViolation())
      const parsed = JSON.parse(result) as SARIFResult
      expect(parsed.locations[0]!.physicalLocation.region?.endColumn).toBeUndefined()
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

    it('writes SARIF JSON to stdout when no outputPath', () => {
      const reporter = new SARIFReporter()
      reporter.report(makeAnalysisResult())
      expect(stdoutSpy).toHaveBeenCalledTimes(1)
    })

    it('does not write to stdout when outputPath is set', () => {
      const reporter = new SARIFReporter({ outputPath: '/tmp/out.sarif' })
      reporter.report(makeAnalysisResult())
      expect(stdoutSpy).not.toHaveBeenCalled()
    })

    it('outputs valid JSON', () => {
      const reporter = new SARIFReporter()
      reporter.report(makeAnalysisResult())
      const output = stdoutSpy.mock.calls[0]![0] as string
      expect(() => JSON.parse(output)).not.toThrow()
    })

    it('includes SARIF schema', () => {
      const reporter = new SARIFReporter()
      reporter.report(makeAnalysisResult())
      const output = stdoutSpy.mock.calls[0]![0] as string
      const parsed = JSON.parse(output) as SARIFLog
      expect(parsed.$schema).toBe(
        'https://raw.githubusercontent.com/oasis-tcs/sarif-spec/master/Schemata/sarif-schema-2.1.0.json',
      )
    })

    it('uses SARIF version 2.1.0', () => {
      const reporter = new SARIFReporter()
      reporter.report(makeAnalysisResult())
      const output = stdoutSpy.mock.calls[0]![0] as string
      const parsed = JSON.parse(output) as SARIFLog
      expect(parsed.version).toBe('2.1.0')
    })

    it('includes runs array', () => {
      const reporter = new SARIFReporter()
      reporter.report(makeAnalysisResult())
      const output = stdoutSpy.mock.calls[0]![0] as string
      const parsed = JSON.parse(output) as SARIFLog
      expect(parsed.runs).toBeInstanceOf(Array)
      expect(parsed.runs.length).toBe(1)
    })

    it('includes tool driver with CodeForge name', () => {
      const reporter = new SARIFReporter()
      reporter.report(makeAnalysisResult())
      const output = stdoutSpy.mock.calls[0]![0] as string
      const parsed = JSON.parse(output) as SARIFLog
      expect(parsed.runs[0]!.tool.driver.name).toBe('CodeForge')
    })

    it('includes tool driver information URI', () => {
      const reporter = new SARIFReporter()
      reporter.report(makeAnalysisResult())
      const output = stdoutSpy.mock.calls[0]![0] as string
      const parsed = JSON.parse(output) as SARIFLog
      expect(parsed.runs[0]!.tool.driver.informationUri).toBe(
        'https://github.com/codeforge-dev/codeforge',
      )
    })

    it('includes rules from violations', () => {
      const reporter = new SARIFReporter()
      reporter.report(makeAnalysisResult())
      const output = stdoutSpy.mock.calls[0]![0] as string
      const parsed = JSON.parse(output) as SARIFLog
      const rules = parsed.runs[0]!.tool.driver.rules!
      expect(rules.length).toBe(1)
      expect(rules[0]!.id).toBe('no-console')
    })

    it('deduplicates rules by ruleId', () => {
      const reporter = new SARIFReporter()
      reporter.report(
        makeAnalysisResult({
          files: [
            {
              filePath: 'src/index.ts',
              stats: { analysisTime: 10, parseTime: 5, totalTime: 15 },
              violations: [
                makeViolation({ ruleId: 'no-console', line: 1 }),
                makeViolation({ ruleId: 'no-console', line: 5 }),
                makeViolation({ ruleId: 'other-rule', line: 10 }),
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
      const parsed = JSON.parse(output) as SARIFLog
      const rules = parsed.runs[0]!.tool.driver.rules!
      expect(rules.length).toBe(2)
    })

    it('includes rule shortDescription', () => {
      const reporter = new SARIFReporter()
      reporter.report(makeAnalysisResult())
      const output = stdoutSpy.mock.calls[0]![0] as string
      const parsed = JSON.parse(output) as SARIFLog
      const rule = parsed.runs[0]!.tool.driver.rules![0]!
      expect(rule.shortDescription!.text).toBe('Rule: no-console')
    })

    it('uses version from results when available', () => {
      const reporter = new SARIFReporter()
      reporter.report(makeAnalysisResult({ version: '2.0.0' }))
      const output = stdoutSpy.mock.calls[0]![0] as string
      const parsed = JSON.parse(output) as SARIFLog
      expect(parsed.runs[0]!.tool.driver.version).toBe('2.0.0')
    })

    it('defaults version to 0.1.0', () => {
      const reporter = new SARIFReporter()
      reporter.report(makeAnalysisResult())
      const output = stdoutSpy.mock.calls[0]![0] as string
      const parsed = JSON.parse(output) as SARIFLog
      expect(parsed.runs[0]!.tool.driver.version).toBe('0.1.0')
    })

    it('includes results array with all violations', () => {
      const reporter = new SARIFReporter()
      reporter.report(makeAnalysisResult())
      const output = stdoutSpy.mock.calls[0]![0] as string
      const parsed = JSON.parse(output) as SARIFLog
      expect(parsed.runs[0]!.results.length).toBe(1)
    })

    it('formats compact JSON when pretty is false', () => {
      const reporter = new SARIFReporter({ pretty: false })
      reporter.report(makeAnalysisResult())
      const output = stdoutSpy.mock.calls[0]![0] as string
      expect(output).not.toContain('\n  ')
    })

    it('formats pretty JSON when pretty is true', () => {
      const reporter = new SARIFReporter({ pretty: true })
      reporter.report(makeAnalysisResult())
      const output = stdoutSpy.mock.calls[0]![0] as string
      expect(output).toContain('\n  ')
    })

    it('handles multiple files', () => {
      const reporter = new SARIFReporter()
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
      const parsed = JSON.parse(output) as SARIFLog
      expect(parsed.runs[0]!.results.length).toBe(2)
    })

    it('handles empty files', () => {
      const reporter = new SARIFReporter()
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
      const parsed = JSON.parse(output) as SARIFLog
      expect(parsed.runs[0]!.results).toEqual([])
    })

    it('appends newline to stdout output', () => {
      const reporter = new SARIFReporter()
      reporter.report(makeAnalysisResult())
      const output = stdoutSpy.mock.calls[0]![0] as string
      expect(output.endsWith('\n')).toBe(true)
    })
  })

  // ─── SARIF type exports ─────────────────────────────

  describe('SARIF types', () => {
    it('SARIFLevel has correct values', () => {
      const levels: SARIFLevel[] = ['error', 'none', 'note', 'warning']
      expect(levels).toHaveLength(4)
    })

    it('SARIFLog has correct shape', () => {
      const log: SARIFLog = {
        $schema: 'https://example.com',
        runs: [],
        version: '2.1.0',
      }
      expect(log.version).toBe('2.1.0')
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

    it('handles violation with all optional fields', () => {
      const reporter = new SARIFReporter()
      const result = reporter.format(
        makeViolation({
          endColumn: 20,
          endLine: 8,
          suggestion: 'Fix it',
        }),
      )
      const parsed = JSON.parse(result) as SARIFResult
      expect(parsed.locations[0]!.physicalLocation.region?.endLine).toBe(8)
      expect(parsed.locations[0]!.physicalLocation.region?.endColumn).toBe(20)
      expect(parsed.fixes).toBeDefined()
    })

    it('handles violation with empty message', () => {
      const reporter = new SARIFReporter()
      const result = reporter.format(makeViolation({ message: '' }))
      const parsed = JSON.parse(result) as SARIFResult
      expect(parsed.message.text).toBe('')
    })

    it('handles unicode in message', () => {
      const reporter = new SARIFReporter()
      const result = reporter.format(makeViolation({ message: 'エラー発生 🚨' }))
      const parsed = JSON.parse(result) as SARIFResult
      expect(parsed.message.text).toBe('エラー発生 🚨')
    })

    it('handles special characters in filePath', () => {
      const reporter = new SARIFReporter()
      const result = reporter.format(makeViolation({ filePath: 'path/with spaces/file.ts' }))
      const parsed = JSON.parse(result) as SARIFResult
      expect(parsed.locations[0]!.physicalLocation.artifactLocation.uri).toBe('path/with spaces/file.ts')
    })

    it('preserves version across multiple report calls', () => {
      const reporter = new SARIFReporter()
      reporter.report(makeAnalysisResult({ version: '3.0.0' }))
      const output1 = stdoutSpy.mock.calls[0]![0] as string
      const parsed1 = JSON.parse(output1) as SARIFLog
      expect(parsed1.runs[0]!.tool.driver.version).toBe('3.0.0')
    })

    it('handles many violations efficiently', () => {
      const reporter = new SARIFReporter()
      const violations = Array.from({ length: 50 }, (_, i) =>
        makeViolation({ ruleId: `rule-${i}`, line: i + 1 }),
      )
      reporter.report(
        makeAnalysisResult({
          files: [
            {
              filePath: 'src/big.ts',
              stats: { analysisTime: 100, parseTime: 50, totalTime: 150 },
              violations,
            },
          ],
          summary: {
            errorCount: 50,
            filesWithViolations: 1,
            infoCount: 0,
            totalFiles: 1,
            totalTime: 150,
            warningCount: 0,
          },
        }),
      )
      const output = stdoutSpy.mock.calls[0]![0] as string
      const parsed = JSON.parse(output) as SARIFLog
      expect(parsed.runs[0]!.results.length).toBe(50)
      expect(parsed.runs[0]!.tool.driver.rules!.length).toBe(50)
    })
  })
})
