import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { SonarQubeReporter } from '../src/reporters/sonarqube-reporter.js'
import type {
  SonarQubeIssue,
  SonarQubeReport,
  SonarQubeSeverity,
  SonarQubeType,
  SonarQubeTextRange,
  SonarQubePrimaryLocation,
} from '../src/reporters/sonarqube-reporter.js'
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

// ─── mapSeverity (via format) ─────────────────────────

describe('mapSeverity via format', () => {
  it('maps error to CRITICAL', () => {
    const reporter = new SonarQubeReporter()
    const result = reporter.format(makeViolation({ severity: 'error' }))
    const parsed = JSON.parse(result) as SonarQubeIssue
    expect(parsed.severity).toBe('CRITICAL')
  })

  it('maps warning to MAJOR', () => {
    const reporter = new SonarQubeReporter()
    const result = reporter.format(makeViolation({ severity: 'warning' }))
    const parsed = JSON.parse(result) as SonarQubeIssue
    expect(parsed.severity).toBe('MAJOR')
  })

  it('maps info to MINOR', () => {
    const reporter = new SonarQubeReporter()
    const result = reporter.format(makeViolation({ severity: 'info' }))
    const parsed = JSON.parse(result) as SonarQubeIssue
    expect(parsed.severity).toBe('MINOR')
  })
})

// ─── mapType (via format) ─────────────────────────────

describe('mapType via format', () => {
  it('maps error to BUG', () => {
    const reporter = new SonarQubeReporter()
    const result = reporter.format(makeViolation({ severity: 'error' }))
    const parsed = JSON.parse(result) as SonarQubeIssue
    expect(parsed.type).toBe('BUG')
  })

  it('maps warning to CODE_SMELL', () => {
    const reporter = new SonarQubeReporter()
    const result = reporter.format(makeViolation({ severity: 'warning' }))
    const parsed = JSON.parse(result) as SonarQubeIssue
    expect(parsed.type).toBe('CODE_SMELL')
  })

  it('maps info to CODE_SMELL', () => {
    const reporter = new SonarQubeReporter()
    const result = reporter.format(makeViolation({ severity: 'info' }))
    const parsed = JSON.parse(result) as SonarQubeIssue
    expect(parsed.type).toBe('CODE_SMELL')
  })
})

// ─── SonarQubeReporter class ──────────────────────────

describe('SonarQubeReporter', () => {
  // ─── Construction ───────────────────────────────────

  describe('construction', () => {
    it('has name "sonarqube"', () => {
      const reporter = new SonarQubeReporter()
      expect(reporter.name).toBe('sonarqube')
    })

    it('accepts empty options', () => {
      const reporter = new SonarQubeReporter({})
      expect(reporter.name).toBe('sonarqube')
    })

    it('stores pretty option', () => {
      const reporter = new SonarQubeReporter({ pretty: true })
      expect(reporter).toBeInstanceOf(SonarQubeReporter)
    })

    it('stores outputPath option', () => {
      const reporter = new SonarQubeReporter({ outputPath: '/tmp/sonar.json' })
      expect(reporter).toBeInstanceOf(SonarQubeReporter)
    })

    it('works with default options', () => {
      const reporter = new SonarQubeReporter()
      expect(reporter).toBeInstanceOf(SonarQubeReporter)
    })
  })

  // ─── format ─────────────────────────────────────────

  describe('format', () => {
    it('returns valid JSON string', () => {
      const reporter = new SonarQubeReporter()
      const result = reporter.format(makeViolation())
      expect(() => JSON.parse(result)).not.toThrow()
    })

    it('includes engineId as CodeForge', () => {
      const reporter = new SonarQubeReporter()
      const result = reporter.format(makeViolation())
      const parsed = JSON.parse(result) as SonarQubeIssue
      expect(parsed.engineId).toBe('CodeForge')
    })

    it('includes ruleId', () => {
      const reporter = new SonarQubeReporter()
      const result = reporter.format(makeViolation())
      const parsed = JSON.parse(result) as SonarQubeIssue
      expect(parsed.ruleId).toBe('no-console')
    })

    it('includes severity as mapped value', () => {
      const reporter = new SonarQubeReporter()
      const result = reporter.format(makeViolation({ severity: 'error' }))
      const parsed = JSON.parse(result) as SonarQubeIssue
      expect(parsed.severity).toBe('CRITICAL')
    })

    it('includes type as mapped value', () => {
      const reporter = new SonarQubeReporter()
      const result = reporter.format(makeViolation({ severity: 'error' }))
      const parsed = JSON.parse(result) as SonarQubeIssue
      expect(parsed.type).toBe('BUG')
    })

    it('includes primaryLocation with filePath', () => {
      const reporter = new SonarQubeReporter()
      const result = reporter.format(makeViolation())
      const parsed = JSON.parse(result) as SonarQubeIssue
      expect(parsed.primaryLocation.filePath).toBe('src/index.ts')
    })

    it('includes primaryLocation with message', () => {
      const reporter = new SonarQubeReporter()
      const result = reporter.format(makeViolation())
      const parsed = JSON.parse(result) as SonarQubeIssue
      expect(parsed.primaryLocation.message).toBe('Unexpected console statement')
    })

    it('converts column to 0-indexed (subtracts 1)', () => {
      const reporter = new SonarQubeReporter()
      const result = reporter.format(makeViolation({ column: 10 }))
      const parsed = JSON.parse(result) as SonarQubeIssue
      expect(parsed.primaryLocation.textRange.startColumn).toBe(9)
    })

    it('keeps line as 1-indexed', () => {
      const reporter = new SonarQubeReporter()
      const result = reporter.format(makeViolation({ line: 5 }))
      const parsed = JSON.parse(result) as SonarQubeIssue
      expect(parsed.primaryLocation.textRange.startLine).toBe(5)
    })

    it('uses endLine from violation when present', () => {
      const reporter = new SonarQubeReporter()
      const result = reporter.format(makeViolation({ endLine: 8 }))
      const parsed = JSON.parse(result) as SonarQubeIssue
      expect(parsed.primaryLocation.textRange.endLine).toBe(8)
    })

    it('defaults endLine to line when not present', () => {
      const reporter = new SonarQubeReporter()
      const result = reporter.format(makeViolation({ line: 5 }))
      const parsed = JSON.parse(result) as SonarQubeIssue
      expect(parsed.primaryLocation.textRange.endLine).toBe(5)
    })

    it('uses endColumn from violation when present (0-indexed)', () => {
      const reporter = new SonarQubeReporter()
      const result = reporter.format(makeViolation({ endColumn: 20 }))
      const parsed = JSON.parse(result) as SonarQubeIssue
      expect(parsed.primaryLocation.textRange.endColumn).toBe(19)
    })

    it('defaults endColumn to column-1 when not present', () => {
      const reporter = new SonarQubeReporter()
      const result = reporter.format(makeViolation({ column: 10 }))
      const parsed = JSON.parse(result) as SonarQubeIssue
      expect(parsed.primaryLocation.textRange.endColumn).toBe(9)
    })

    it('maps warning severity to MAJOR', () => {
      const reporter = new SonarQubeReporter()
      const result = reporter.format(makeViolation({ severity: 'warning' }))
      const parsed = JSON.parse(result) as SonarQubeIssue
      expect(parsed.severity).toBe('MAJOR')
    })

    it('maps warning type to CODE_SMELL', () => {
      const reporter = new SonarQubeReporter()
      const result = reporter.format(makeViolation({ severity: 'warning' }))
      const parsed = JSON.parse(result) as SonarQubeIssue
      expect(parsed.type).toBe('CODE_SMELL')
    })

    it('maps info severity to MINOR', () => {
      const reporter = new SonarQubeReporter()
      const result = reporter.format(makeViolation({ severity: 'info' }))
      const parsed = JSON.parse(result) as SonarQubeIssue
      expect(parsed.severity).toBe('MINOR')
    })

    it('maps info type to CODE_SMELL', () => {
      const reporter = new SonarQubeReporter()
      const result = reporter.format(makeViolation({ severity: 'info' }))
      const parsed = JSON.parse(result) as SonarQubeIssue
      expect(parsed.type).toBe('CODE_SMELL')
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
      const reporter = new SonarQubeReporter()
      reporter.report(makeAnalysisResult())
      expect(stdoutSpy).toHaveBeenCalledTimes(1)
    })

    it('does not write to stdout when outputPath is set', () => {
      const reporter = new SonarQubeReporter({ outputPath: '/tmp/sonar.json' })
      reporter.report(makeAnalysisResult())
      expect(stdoutSpy).not.toHaveBeenCalled()
    })

    it('outputs valid JSON', () => {
      const reporter = new SonarQubeReporter()
      reporter.report(makeAnalysisResult())
      const output = stdoutSpy.mock.calls[0]![0] as string
      expect(() => JSON.parse(output)).not.toThrow()
    })

    it('outputs object with issues array', () => {
      const reporter = new SonarQubeReporter()
      reporter.report(makeAnalysisResult())
      const output = stdoutSpy.mock.calls[0]![0] as string
      const parsed = JSON.parse(output) as SonarQubeReport
      expect(parsed.issues).toBeInstanceOf(Array)
    })

    it('includes one issue per violation', () => {
      const reporter = new SonarQubeReporter()
      reporter.report(makeAnalysisResult())
      const output = stdoutSpy.mock.calls[0]![0] as string
      const parsed = JSON.parse(output) as SonarQubeReport
      expect(parsed.issues.length).toBe(1)
    })

    it('handles multiple files with violations', () => {
      const reporter = new SonarQubeReporter()
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
      const parsed = JSON.parse(output) as SonarQubeReport
      expect(parsed.issues.length).toBe(2)
    })

    it('handles multiple violations per file', () => {
      const reporter = new SonarQubeReporter()
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
      const parsed = JSON.parse(output) as SonarQubeReport
      expect(parsed.issues.length).toBe(3)
    })

    it('handles empty files array', () => {
      const reporter = new SonarQubeReporter()
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
      const parsed = JSON.parse(output) as SonarQubeReport
      expect(parsed.issues).toEqual([])
    })

    it('formats compact JSON when pretty is false', () => {
      const reporter = new SonarQubeReporter({ pretty: false })
      reporter.report(makeAnalysisResult())
      const output = stdoutSpy.mock.calls[0]![0] as string
      expect(output).not.toContain('\n  ')
    })

    it('formats pretty JSON when pretty is true', () => {
      const reporter = new SonarQubeReporter({ pretty: true })
      reporter.report(makeAnalysisResult())
      const output = stdoutSpy.mock.calls[0]![0] as string
      expect(output).toContain('\n  ')
    })

    it('appends newline to stdout output', () => {
      const reporter = new SonarQubeReporter()
      reporter.report(makeAnalysisResult())
      const output = stdoutSpy.mock.calls[0]![0] as string
      expect(output.endsWith('\n')).toBe(true)
    })

    it('includes correct issue structure', () => {
      const reporter = new SonarQubeReporter()
      reporter.report(makeAnalysisResult())
      const output = stdoutSpy.mock.calls[0]![0] as string
      const parsed = JSON.parse(output) as SonarQubeReport
      const issue = parsed.issues[0]!
      expect(issue).toHaveProperty('engineId')
      expect(issue).toHaveProperty('ruleId')
      expect(issue).toHaveProperty('severity')
      expect(issue).toHaveProperty('type')
      expect(issue).toHaveProperty('primaryLocation')
    })
  })

  // ─── SonarQube types ────────────────────────────────

  describe('SonarQube types', () => {
    it('SonarQubeSeverity has correct values', () => {
      const severities: SonarQubeSeverity[] = ['BLOCKER', 'CRITICAL', 'INFO', 'MAJOR', 'MINOR']
      expect(severities).toHaveLength(5)
    })

    it('SonarQubeType has correct values', () => {
      const types: SonarQubeType[] = ['BUG', 'CODE_SMELL', 'SECURITY_HOTSPOT', 'VULNERABILITY']
      expect(types).toHaveLength(4)
    })

    it('SonarQubeTextRange has correct shape', () => {
      const range: SonarQubeTextRange = {
        endColumn: 15,
        endLine: 5,
        startColumn: 9,
        startLine: 5,
      }
      expect(range.startColumn).toBe(9)
      expect(range.endColumn).toBe(15)
    })
  })

  // ─── Edge cases ─────────────────────────────────────

  describe('edge cases', () => {
    it('handles violation with column 1 (0-indexed to 0)', () => {
      const reporter = new SonarQubeReporter()
      const result = reporter.format(makeViolation({ column: 1 }))
      const parsed = JSON.parse(result) as SonarQubeIssue
      expect(parsed.primaryLocation.textRange.startColumn).toBe(0)
    })

    it('handles violation with unicode message', () => {
      const reporter = new SonarQubeReporter()
      const result = reporter.format(makeViolation({ message: 'エラー 🚨' }))
      const parsed = JSON.parse(result) as SonarQubeIssue
      expect(parsed.primaryLocation.message).toBe('エラー 🚨')
    })

    it('handles violation with large line number', () => {
      const reporter = new SonarQubeReporter()
      const result = reporter.format(makeViolation({ line: 99999 }))
      const parsed = JSON.parse(result) as SonarQubeIssue
      expect(parsed.primaryLocation.textRange.startLine).toBe(99999)
    })

    it('handles file with no violations', () => {
      const reporter = new SonarQubeReporter()
      let stdoutSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true)
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
      const parsed = JSON.parse(output) as SonarQubeReport
      expect(parsed.issues).toEqual([])
      stdoutSpy.mockRestore()
    })
  })
})
