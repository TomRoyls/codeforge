import * as crypto from 'node:crypto'

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { GitLabReporter } from '../src/reporters/gitlab-reporter.js'
import type { GitLabCodeQualityViolation, GitLabSeverity } from '../src/reporters/gitlab-reporter.js'
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

function computeFingerprint(v: Violation): string {
  const input = `${v.filePath}:${v.line}:${v.column}:${v.ruleId}`
  return crypto.createHash('md5').update(input).digest('hex')
}

// ─── GitLabReporter class ─────────────────────────────

describe('GitLabReporter', () => {
  // ─── Construction ───────────────────────────────────

  describe('construction', () => {
    it('has name "gitlab"', () => {
      const reporter = new GitLabReporter()
      expect(reporter.name).toBe('gitlab')
    })

    it('accepts empty options', () => {
      const reporter = new GitLabReporter({})
      expect(reporter.name).toBe('gitlab')
    })

    it('stores pretty option', () => {
      const reporter = new GitLabReporter({ pretty: true })
      expect(reporter).toBeInstanceOf(GitLabReporter)
    })

    it('stores outputPath option', () => {
      const reporter = new GitLabReporter({ outputPath: '/tmp/gl.json' })
      expect(reporter).toBeInstanceOf(GitLabReporter)
    })

    it('works with default options', () => {
      const reporter = new GitLabReporter()
      expect(reporter).toBeInstanceOf(GitLabReporter)
    })
  })

  // ─── format ─────────────────────────────────────────

  describe('format', () => {
    it('returns valid JSON string', () => {
      const reporter = new GitLabReporter()
      const result = reporter.format(makeViolation())
      expect(() => JSON.parse(result)).not.toThrow()
    })

    it('includes description (message)', () => {
      const reporter = new GitLabReporter()
      const result = reporter.format(makeViolation())
      const parsed = JSON.parse(result) as GitLabCodeQualityViolation
      expect(parsed.description).toBe('Unexpected console statement')
    })

    it('includes fingerprint', () => {
      const reporter = new GitLabReporter()
      const violation = makeViolation()
      const result = reporter.format(violation)
      const parsed = JSON.parse(result) as GitLabCodeQualityViolation
      expect(parsed.fingerprint).toBe(computeFingerprint(violation))
    })

    it('generates deterministic fingerprint (MD5 of filePath:line:column:ruleId)', () => {
      const reporter = new GitLabReporter()
      const violation = makeViolation({
        filePath: 'src/app.ts',
        line: 42,
        column: 7,
        ruleId: 'my-rule',
      })
      const result = reporter.format(violation)
      const parsed = JSON.parse(result) as GitLabCodeQualityViolation
      const expected = computeFingerprint(violation)
      expect(parsed.fingerprint).toBe(expected)
    })

    it('includes location with path', () => {
      const reporter = new GitLabReporter()
      const result = reporter.format(makeViolation())
      const parsed = JSON.parse(result) as GitLabCodeQualityViolation
      expect(parsed.location.path).toBe('src/index.ts')
    })

    it('includes location with line begin', () => {
      const reporter = new GitLabReporter()
      const result = reporter.format(makeViolation({ line: 42 }))
      const parsed = JSON.parse(result) as GitLabCodeQualityViolation
      expect(parsed.location.lines.begin).toBe(42)
    })

    it('maps error severity to major', () => {
      const reporter = new GitLabReporter()
      const result = reporter.format(makeViolation({ severity: 'error' }))
      const parsed = JSON.parse(result) as GitLabCodeQualityViolation
      expect(parsed.severity).toBe('major')
    })

    it('maps warning severity to minor', () => {
      const reporter = new GitLabReporter()
      const result = reporter.format(makeViolation({ severity: 'warning' }))
      const parsed = JSON.parse(result) as GitLabCodeQualityViolation
      expect(parsed.severity).toBe('minor')
    })

    it('maps info severity to info', () => {
      const reporter = new GitLabReporter()
      const result = reporter.format(makeViolation({ severity: 'info' }))
      const parsed = JSON.parse(result) as GitLabCodeQualityViolation
      expect(parsed.severity).toBe('info')
    })

    it('includes content body when source is present', () => {
      const reporter = new GitLabReporter()
      const result = reporter.format(makeViolation({ source: 'console.log("x")' }))
      const parsed = JSON.parse(result) as GitLabCodeQualityViolation
      expect(parsed.content).toBeDefined()
      expect(parsed.content!.body).toBe('console.log("x")')
    })

    it('does not include content when source is absent', () => {
      const reporter = new GitLabReporter()
      const result = reporter.format(makeViolation())
      const parsed = JSON.parse(result) as GitLabCodeQualityViolation
      expect(parsed.content).toBeUndefined()
    })

    it('produces unique fingerprints for different violations', () => {
      const reporter = new GitLabReporter()
      const v1 = makeViolation({ ruleId: 'rule-a', line: 1 })
      const v2 = makeViolation({ ruleId: 'rule-b', line: 2 })
      const r1 = JSON.parse(reporter.format(v1)) as GitLabCodeQualityViolation
      const r2 = JSON.parse(reporter.format(v2)) as GitLabCodeQualityViolation
      expect(r1.fingerprint).not.toBe(r2.fingerprint)
    })

    it('produces same fingerprint for identical violations', () => {
      const reporter = new GitLabReporter()
      const v = makeViolation({ ruleId: 'same-rule', line: 3, column: 5 })
      const r1 = JSON.parse(reporter.format(v)) as GitLabCodeQualityViolation
      const r2 = JSON.parse(reporter.format(v)) as GitLabCodeQualityViolation
      expect(r1.fingerprint).toBe(r2.fingerprint)
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
      const reporter = new GitLabReporter()
      reporter.report(makeAnalysisResult())
      expect(stdoutSpy).toHaveBeenCalledTimes(1)
    })

    it('does not write to stdout when outputPath is set', () => {
      const reporter = new GitLabReporter({ outputPath: '/tmp/gl.json' })
      reporter.report(makeAnalysisResult())
      expect(stdoutSpy).not.toHaveBeenCalled()
    })

    it('outputs valid JSON array', () => {
      const reporter = new GitLabReporter()
      reporter.report(makeAnalysisResult())
      const output = stdoutSpy.mock.calls[0]![0] as string
      expect(() => JSON.parse(output)).not.toThrow()
      const parsed = JSON.parse(output)
      expect(parsed).toBeInstanceOf(Array)
    })

    it('outputs one entry per violation', () => {
      const reporter = new GitLabReporter()
      reporter.report(makeAnalysisResult())
      const output = stdoutSpy.mock.calls[0]![0] as string
      const parsed = JSON.parse(output) as GitLabCodeQualityViolation[]
      expect(parsed.length).toBe(1)
    })

    it('handles multiple files with violations', () => {
      const reporter = new GitLabReporter()
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
              violations: [
                makeViolation({ filePath: 'src/b.ts', ruleId: 'r2' }),
                makeViolation({ filePath: 'src/b.ts', ruleId: 'r3', line: 20 }),
              ],
            },
          ],
          summary: {
            errorCount: 3,
            filesWithViolations: 2,
            infoCount: 0,
            totalFiles: 2,
            totalTime: 4,
            warningCount: 0,
          },
        }),
      )
      const output = stdoutSpy.mock.calls[0]![0] as string
      const parsed = JSON.parse(output) as GitLabCodeQualityViolation[]
      expect(parsed.length).toBe(3)
    })

    it('handles multiple violations per file', () => {
      const reporter = new GitLabReporter()
      reporter.report(
        makeAnalysisResult({
          files: [
            {
              filePath: 'src/index.ts',
              stats: { analysisTime: 10, parseTime: 5, totalTime: 15 },
              violations: [
                makeViolation({ ruleId: 'r1', line: 1 }),
                makeViolation({ ruleId: 'r2', line: 2 }),
                makeViolation({ ruleId: 'r3', line: 3 }),
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
      const parsed = JSON.parse(output) as GitLabCodeQualityViolation[]
      expect(parsed.length).toBe(3)
    })

    it('handles empty files array', () => {
      const reporter = new GitLabReporter()
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
      const parsed = JSON.parse(output) as GitLabCodeQualityViolation[]
      expect(parsed).toEqual([])
    })

    it('handles file with no violations', () => {
      const reporter = new GitLabReporter()
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
      const parsed = JSON.parse(output) as GitLabCodeQualityViolation[]
      expect(parsed).toEqual([])
    })

    it('formats compact JSON when pretty is false', () => {
      const reporter = new GitLabReporter({ pretty: false })
      reporter.report(makeAnalysisResult())
      const output = stdoutSpy.mock.calls[0]![0] as string
      expect(output).not.toContain('\n  ')
    })

    it('formats pretty JSON when pretty is true', () => {
      const reporter = new GitLabReporter({ pretty: true })
      reporter.report(makeAnalysisResult())
      const output = stdoutSpy.mock.calls[0]![0] as string
      expect(output).toContain('\n  ')
    })

    it('appends newline to stdout output', () => {
      const reporter = new GitLabReporter()
      reporter.report(makeAnalysisResult())
      const output = stdoutSpy.mock.calls[0]![0] as string
      expect(output.endsWith('\n')).toBe(true)
    })

    it('includes all required fields in each violation', () => {
      const reporter = new GitLabReporter()
      reporter.report(makeAnalysisResult())
      const output = stdoutSpy.mock.calls[0]![0] as string
      const parsed = JSON.parse(output) as GitLabCodeQualityViolation[]
      const v = parsed[0]!
      expect(v).toHaveProperty('description')
      expect(v).toHaveProperty('fingerprint')
      expect(v).toHaveProperty('location')
      expect(v).toHaveProperty('severity')
    })
  })

  // ─── Fingerprint generation ─────────────────────────

  describe('fingerprint generation', () => {
    it('produces 32-character hex string (MD5)', () => {
      const reporter = new GitLabReporter()
      const result = reporter.format(makeViolation())
      const parsed = JSON.parse(result) as GitLabCodeQualityViolation
      expect(parsed.fingerprint).toMatch(/^[0-9a-f]{32}$/)
    })

    it('changes when filePath changes', () => {
      const reporter = new GitLabReporter()
      const r1 = JSON.parse(reporter.format(makeViolation({ filePath: 'a.ts' }))) as GitLabCodeQualityViolation
      const r2 = JSON.parse(reporter.format(makeViolation({ filePath: 'b.ts' }))) as GitLabCodeQualityViolation
      expect(r1.fingerprint).not.toBe(r2.fingerprint)
    })

    it('changes when line changes', () => {
      const reporter = new GitLabReporter()
      const r1 = JSON.parse(reporter.format(makeViolation({ line: 1 }))) as GitLabCodeQualityViolation
      const r2 = JSON.parse(reporter.format(makeViolation({ line: 2 }))) as GitLabCodeQualityViolation
      expect(r1.fingerprint).not.toBe(r2.fingerprint)
    })

    it('changes when column changes', () => {
      const reporter = new GitLabReporter()
      const r1 = JSON.parse(reporter.format(makeViolation({ column: 1 }))) as GitLabCodeQualityViolation
      const r2 = JSON.parse(reporter.format(makeViolation({ column: 2 }))) as GitLabCodeQualityViolation
      expect(r1.fingerprint).not.toBe(r2.fingerprint)
    })

    it('changes when ruleId changes', () => {
      const reporter = new GitLabReporter()
      const r1 = JSON.parse(reporter.format(makeViolation({ ruleId: 'rule-a' }))) as GitLabCodeQualityViolation
      const r2 = JSON.parse(reporter.format(makeViolation({ ruleId: 'rule-b' }))) as GitLabCodeQualityViolation
      expect(r1.fingerprint).not.toBe(r2.fingerprint)
    })
  })

  // ─── GitLab types ───────────────────────────────────

  describe('GitLab types', () => {
    it('GitLabSeverity has correct values', () => {
      const severities: GitLabSeverity[] = ['blocker', 'critical', 'info', 'major', 'minor']
      expect(severities).toHaveLength(5)
    })

    it('GitLabCodeQualityViolation has correct shape', () => {
      const v: GitLabCodeQualityViolation = {
        description: 'test',
        fingerprint: 'abc123',
        location: {
          lines: { begin: 1 },
          path: 'test.ts',
        },
        severity: 'major',
      }
      expect(v.description).toBe('test')
      expect(v.location.path).toBe('test.ts')
    })
  })

  // ─── Edge cases ─────────────────────────────────────

  describe('edge cases', () => {
    it('handles violation with unicode message', () => {
      const reporter = new GitLabReporter()
      const result = reporter.format(makeViolation({ message: 'エラー 🚨' }))
      const parsed = JSON.parse(result) as GitLabCodeQualityViolation
      expect(parsed.description).toBe('エラー 🚨')
    })

    it('handles violation with line 1', () => {
      const reporter = new GitLabReporter()
      const result = reporter.format(makeViolation({ line: 1 }))
      const parsed = JSON.parse(result) as GitLabCodeQualityViolation
      expect(parsed.location.lines.begin).toBe(1)
    })

    it('handles violation with large line number', () => {
      const reporter = new GitLabReporter()
      const result = reporter.format(makeViolation({ line: 99999 }))
      const parsed = JSON.parse(result) as GitLabCodeQualityViolation
      expect(parsed.location.lines.begin).toBe(99999)
    })

    it('handles violation with empty message', () => {
      const reporter = new GitLabReporter()
      const result = reporter.format(makeViolation({ message: '' }))
      const parsed = JSON.parse(result) as GitLabCodeQualityViolation
      expect(parsed.description).toBe('')
    })

    it('handles file path with special characters', () => {
      const reporter = new GitLabReporter()
      const result = reporter.format(makeViolation({ filePath: 'path/with spaces/and-dashes.ts' }))
      const parsed = JSON.parse(result) as GitLabCodeQualityViolation
      expect(parsed.location.path).toBe('path/with spaces/and-dashes.ts')
    })

    it('handles source with multi-line content', () => {
      const reporter = new GitLabReporter()
      const result = reporter.format(
        makeViolation({ source: 'line1\nline2\nline3' }),
      )
      const parsed = JSON.parse(result) as GitLabCodeQualityViolation
      expect(parsed.content!.body).toBe('line1\nline2\nline3')
    })

    it('handles mixed severities across violations', () => {
      const reporter = new GitLabReporter()
      let stdoutSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true)
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
      const parsed = JSON.parse(output) as GitLabCodeQualityViolation[]
      expect(parsed[0]!.severity).toBe('major')
      expect(parsed[1]!.severity).toBe('minor')
      expect(parsed[2]!.severity).toBe('info')
      stdoutSpy.mockRestore()
    })
  })
})
