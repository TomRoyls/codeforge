import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import * as fs from 'fs'
import * as path from 'path'
import * as crypto from 'crypto'
import { GitLabReporter } from '../../../src/reporters/gitlab-reporter.js'
import type { AnalysisResult, Violation, FileAnalysisResult } from '../../../src/reporters/types.js'

vi.mock('fs')
vi.mock('path')

function createMockViolation(overrides: Partial<Violation> = {}): Violation {
  return {
    ruleId: 'test-rule',
    severity: 'error',
    message: 'Test violation message',
    filePath: 'test.ts',
    line: 10,
    column: 5,
    ...overrides,
  }
}

function createMockFileResult(
  filePath: string,
  violations: Violation[] = [],
  stats: FileAnalysisResult['stats'] = { parseTime: 10, analysisTime: 20, totalTime: 30 },
): FileAnalysisResult {
  return {
    filePath,
    violations,
    stats,
  }
}

function createMockAnalysisResult(overrides: Partial<AnalysisResult> = {}): AnalysisResult {
  return {
    files: [],
    summary: {
      totalFiles: 0,
      filesWithViolations: 0,
      errorCount: 0,
      warningCount: 0,
      infoCount: 0,
      totalTime: 100,
    },
    timestamp: '2024-01-15T10:00:00.000Z',
    ...overrides,
  }
}

function computeExpectedFingerprint(violation: Violation): string {
  const input = `${violation.filePath}:${violation.line}:${violation.column}:${violation.ruleId}`
  return crypto.createHash('md5').update(input).digest('hex')
}

describe('GitLabReporter', () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>
  let fsExistsSyncMock: ReturnType<typeof vi.fn>
  let fsMkdirSyncMock: ReturnType<typeof vi.fn>
  let fsWriteFileSyncMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    consoleSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true)
    fsExistsSyncMock = vi.mocked(fs.existsSync)
    fsMkdirSyncMock = vi.mocked(fs.mkdirSync)
    fsWriteFileSyncMock = vi.mocked(fs.writeFileSync)
    vi.clearAllMocks()
  })

  afterEach(() => {
    consoleSpy.mockRestore()
    vi.clearAllMocks()
  })

  describe('constructor', () => {
    test('should initialize with default options', () => {
      const reporter = new GitLabReporter()
      expect(reporter.name).toBe('gitlab')
    })

    test('should accept outputPath option', () => {
      const reporter = new GitLabReporter({ outputPath: './gitlab-report.json' })
      expect(reporter.name).toBe('gitlab')
    })

    test('should handle empty options object', () => {
      const reporter = new GitLabReporter({})
      expect(reporter.name).toBe('gitlab')
    })

    test('should accept pretty option', () => {
      const reporter = new GitLabReporter({ pretty: true })
      expect(reporter.name).toBe('gitlab')
    })

    test('should accept both pretty and outputPath options', () => {
      const reporter = new GitLabReporter({ pretty: true, outputPath: './out.json' })
      expect(reporter.name).toBe('gitlab')
    })

    test('should set pretty to false by default', () => {
      const reporter = new GitLabReporter()
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [createMockViolation()])],
      })
      reporter.report(results)
      const output = (consoleSpy.mock.calls[0][0] as string).replace(/\n$/, '')
      expect(output).not.toContain('\n  ')
    })

    test('should ignore unknown options without error', () => {
      const reporter = new GitLabReporter({ verbose: true, quiet: false })
      expect(reporter.name).toBe('gitlab')
    })
  })

  describe('format', () => {
    test('should format violation as GitLab Code Quality JSON', () => {
      const reporter = new GitLabReporter()
      const violation = createMockViolation()
      const output = reporter.format(violation)
      const parsed = JSON.parse(output)
      expect(parsed.description).toBe('Test violation message')
      expect(parsed.fingerprint).toBeDefined()
      expect(parsed.location).toBeDefined()
    })

    test('should map error severity to major', () => {
      const reporter = new GitLabReporter()
      const violation = createMockViolation({ severity: 'error' })
      const output = reporter.format(violation)
      const parsed = JSON.parse(output)
      expect(parsed.severity).toBe('major')
    })

    test('should map warning severity to minor', () => {
      const reporter = new GitLabReporter()
      const violation = createMockViolation({ severity: 'warning' })
      const output = reporter.format(violation)
      const parsed = JSON.parse(output)
      expect(parsed.severity).toBe('minor')
    })

    test('should map info severity to info', () => {
      const reporter = new GitLabReporter()
      const violation = createMockViolation({ severity: 'info' })
      const output = reporter.format(violation)
      const parsed = JSON.parse(output)
      expect(parsed.severity).toBe('info')
    })

    test('should include location structure', () => {
      const reporter = new GitLabReporter()
      const violation = createMockViolation({ filePath: 'src/app.ts', line: 42, column: 10 })
      const output = reporter.format(violation)
      const parsed = JSON.parse(output)
      expect(parsed.location.path).toBe('src/app.ts')
      expect(parsed.location.lines.begin).toBe(42)
    })

    test('should generate consistent fingerprint for same violation', () => {
      const reporter = new GitLabReporter()
      const violation = createMockViolation({
        ruleId: 'test-rule',
        filePath: 'test.ts',
        line: 10,
        message: 'Test message',
      })
      const output1 = reporter.format(violation)
      const output2 = reporter.format(violation)
      const parsed1 = JSON.parse(output1)
      const parsed2 = JSON.parse(output2)
      expect(parsed1.fingerprint).toBe(parsed2.fingerprint)
    })

    test('should include ruleId in fingerprint', () => {
      const reporter = new GitLabReporter()
      const violation1 = createMockViolation({ ruleId: 'rule1', line: 10 })
      const violation2 = createMockViolation({ ruleId: 'rule2', line: 10 })
      const output1 = reporter.format(violation1)
      const output2 = reporter.format(violation2)
      const parsed1 = JSON.parse(output1)
      const parsed2 = JSON.parse(output2)
      expect(parsed1.fingerprint).not.toBe(parsed2.fingerprint)
    })

    test('should produce valid JSON', () => {
      const reporter = new GitLabReporter()
      const violation = createMockViolation()
      const output = reporter.format(violation)
      expect(() => JSON.parse(output)).not.toThrow()
    })

    test('should include content when source is provided', () => {
      const reporter = new GitLabReporter()
      const violation = createMockViolation({ source: 'const x = eval(input)' })
      const output = reporter.format(violation)
      const parsed = JSON.parse(output)
      expect(parsed.content).toBeDefined()
      expect(parsed.content.body).toBe('const x = eval(input)')
    })

    test('should not include content when source is undefined', () => {
      const reporter = new GitLabReporter()
      const violation = createMockViolation()
      const output = reporter.format(violation)
      const parsed = JSON.parse(output)
      expect(parsed.content).toBeUndefined()
    })

    test('should not include content when source is empty string', () => {
      const reporter = new GitLabReporter()
      const violation = createMockViolation({ source: '' })
      const output = reporter.format(violation)
      const parsed = JSON.parse(output)
      expect(parsed.content).toBeUndefined()
    })

    test('should use violation message as description', () => {
      const reporter = new GitLabReporter()
      const violation = createMockViolation({ message: 'Custom error description' })
      const output = reporter.format(violation)
      const parsed = JSON.parse(output)
      expect(parsed.description).toBe('Custom error description')
    })

    test('should preserve violation filePath in location.path', () => {
      const reporter = new GitLabReporter()
      const violation = createMockViolation({ filePath: 'deeply/nested/path/to/file.ts' })
      const output = reporter.format(violation)
      const parsed = JSON.parse(output)
      expect(parsed.location.path).toBe('deeply/nested/path/to/file.ts')
    })

    test('should preserve violation line in location.lines.begin', () => {
      const reporter = new GitLabReporter()
      const violation = createMockViolation({ line: 999 })
      const output = reporter.format(violation)
      const parsed = JSON.parse(output)
      expect(parsed.location.lines.begin).toBe(999)
    })

    test('should return string from format', () => {
      const reporter = new GitLabReporter()
      const violation = createMockViolation()
      const output = reporter.format(violation)
      expect(typeof output).toBe('string')
    })

    test('should produce JSON that is a single object not an array', () => {
      const reporter = new GitLabReporter()
      const violation = createMockViolation()
      const output = reporter.format(violation)
      const parsed = JSON.parse(output)
      expect(Array.isArray(parsed)).toBe(false)
      expect(typeof parsed).toBe('object')
    })

    test('should have exactly four top-level keys when no source', () => {
      const reporter = new GitLabReporter()
      const violation = createMockViolation()
      const output = reporter.format(violation)
      const parsed = JSON.parse(output)
      const keys = Object.keys(parsed)
      expect(keys).toHaveLength(4)
      expect(keys).toContain('description')
      expect(keys).toContain('fingerprint')
      expect(keys).toContain('location')
      expect(keys).toContain('severity')
    })

    test('should have exactly five top-level keys when source is present', () => {
      const reporter = new GitLabReporter()
      const violation = createMockViolation({ source: 'some code' })
      const output = reporter.format(violation)
      const parsed = JSON.parse(output)
      const keys = Object.keys(parsed)
      expect(keys).toHaveLength(5)
      expect(keys).toContain('content')
    })

    test('should have correct location structure with lines.begin and path', () => {
      const reporter = new GitLabReporter()
      const violation = createMockViolation({ filePath: 'a.ts', line: 5 })
      const output = reporter.format(violation)
      const parsed = JSON.parse(output)
      expect(parsed.location).toEqual({
        lines: { begin: 5 },
        path: 'a.ts',
      })
    })

    test('should have content.body as a string when source is provided', () => {
      const reporter = new GitLabReporter()
      const violation = createMockViolation({ source: 'x = 1' })
      const output = reporter.format(violation)
      const parsed = JSON.parse(output)
      expect(typeof parsed.content.body).toBe('string')
    })
  })

  describe('severity mapping', () => {
    test('should map error to major', () => {
      const reporter = new GitLabReporter()
      const parsed = JSON.parse(reporter.format(createMockViolation({ severity: 'error' })))
      expect(parsed.severity).toBe('major')
    })

    test('should map warning to minor', () => {
      const reporter = new GitLabReporter()
      const parsed = JSON.parse(reporter.format(createMockViolation({ severity: 'warning' })))
      expect(parsed.severity).toBe('minor')
    })

    test('should map info to info', () => {
      const reporter = new GitLabReporter()
      const parsed = JSON.parse(reporter.format(createMockViolation({ severity: 'info' })))
      expect(parsed.severity).toBe('info')
    })

    test('should produce only valid GitLab severity values', () => {
      const reporter = new GitLabReporter()
      const validSeverities = ['blocker', 'critical', 'info', 'major', 'minor']
      for (const sev of ['error', 'warning', 'info'] as const) {
        const parsed = JSON.parse(reporter.format(createMockViolation({ severity: sev })))
        expect(validSeverities).toContain(parsed.severity)
      }
    })

    test('should not produce blocker severity for any input', () => {
      const reporter = new GitLabReporter()
      for (const sev of ['error', 'warning', 'info'] as const) {
        const parsed = JSON.parse(reporter.format(createMockViolation({ severity: sev })))
        expect(parsed.severity).not.toBe('blocker')
      }
    })

    test('should not produce critical severity for any input', () => {
      const reporter = new GitLabReporter()
      for (const sev of ['error', 'warning', 'info'] as const) {
        const parsed = JSON.parse(reporter.format(createMockViolation({ severity: sev })))
        expect(parsed.severity).not.toBe('critical')
      }
    })

    test('should map multiple error violations to major', () => {
      const reporter = new GitLabReporter()
      for (let i = 0; i < 5; i++) {
        const parsed = JSON.parse(
          reporter.format(createMockViolation({ severity: 'error', ruleId: `rule-${i}` })),
        )
        expect(parsed.severity).toBe('major')
      }
    })

    test('should map multiple warning violations to minor', () => {
      const reporter = new GitLabReporter()
      for (let i = 0; i < 5; i++) {
        const parsed = JSON.parse(
          reporter.format(createMockViolation({ severity: 'warning', ruleId: `rule-${i}` })),
        )
        expect(parsed.severity).toBe('minor')
      }
    })

    test('should map multiple info violations to info', () => {
      const reporter = new GitLabReporter()
      for (let i = 0; i < 5; i++) {
        const parsed = JSON.parse(
          reporter.format(createMockViolation({ severity: 'info', ruleId: `rule-${i}` })),
        )
        expect(parsed.severity).toBe('info')
      }
    })

    test('should map severity independently of message content', () => {
      const reporter = new GitLabReporter()
      const parsed = JSON.parse(
        reporter.format(createMockViolation({ severity: 'error', message: 'This is just info' })),
      )
      expect(parsed.severity).toBe('major')
    })

    test('should map severity independently of ruleId', () => {
      const reporter = new GitLabReporter()
      const parsed = JSON.parse(
        reporter.format(createMockViolation({ severity: 'warning', ruleId: 'critical-rule' })),
      )
      expect(parsed.severity).toBe('minor')
    })
  })

  describe('fingerprint generation', () => {
    test('should generate consistent fingerprint for identical violations', () => {
      const reporter = new GitLabReporter()
      const violation = createMockViolation({
        ruleId: 'test-rule',
        filePath: 'test.ts',
        line: 10,
        message: 'Test message',
      })
      const fingerprint1 = JSON.parse(reporter.format(violation)).fingerprint
      const fingerprint2 = JSON.parse(reporter.format(violation)).fingerprint
      expect(fingerprint1).toBe(fingerprint2)
    })

    test('should generate different fingerprints for different rules', () => {
      const reporter = new GitLabReporter()
      const violation1 = createMockViolation({ ruleId: 'rule1' })
      const violation2 = createMockViolation({ ruleId: 'rule2' })
      const fingerprint1 = JSON.parse(reporter.format(violation1)).fingerprint
      const fingerprint2 = JSON.parse(reporter.format(violation2)).fingerprint
      expect(fingerprint1).not.toBe(fingerprint2)
    })

    test('should generate different fingerprints for different files', () => {
      const reporter = new GitLabReporter()
      const violation1 = createMockViolation({ filePath: 'file1.ts' })
      const violation2 = createMockViolation({ filePath: 'file2.ts' })
      const fingerprint1 = JSON.parse(reporter.format(violation1)).fingerprint
      const fingerprint2 = JSON.parse(reporter.format(violation2)).fingerprint
      expect(fingerprint1).not.toBe(fingerprint2)
    })

    test('should generate different fingerprints for different lines', () => {
      const reporter = new GitLabReporter()
      const violation1 = createMockViolation({ line: 10 })
      const violation2 = createMockViolation({ line: 20 })
      const fingerprint1 = JSON.parse(reporter.format(violation1)).fingerprint
      const fingerprint2 = JSON.parse(reporter.format(violation2)).fingerprint
      expect(fingerprint1).not.toBe(fingerprint2)
    })

    test('should generate different fingerprints for different columns', () => {
      const reporter = new GitLabReporter()
      const violation1 = createMockViolation({ column: 1 })
      const violation2 = createMockViolation({ column: 2 })
      const fingerprint1 = JSON.parse(reporter.format(violation1)).fingerprint
      const fingerprint2 = JSON.parse(reporter.format(violation2)).fingerprint
      expect(fingerprint1).not.toBe(fingerprint2)
    })

    test('should produce a 32-character hex string fingerprint', () => {
      const reporter = new GitLabReporter()
      const violation = createMockViolation()
      const parsed = JSON.parse(reporter.format(violation))
      expect(parsed.fingerprint).toMatch(/^[0-9a-f]{32}$/)
    })

    test('should match expected MD5 hash computed manually', () => {
      const reporter = new GitLabReporter()
      const violation = createMockViolation({
        filePath: 'test.ts',
        line: 10,
        column: 5,
        ruleId: 'test-rule',
      })
      const parsed = JSON.parse(reporter.format(violation))
      const expected = computeExpectedFingerprint(violation)
      expect(parsed.fingerprint).toBe(expected)
    })

    test('should not change fingerprint when message changes', () => {
      const reporter = new GitLabReporter()
      const base = { filePath: 'test.ts', line: 10, column: 5, ruleId: 'rule' }
      const v1 = createMockViolation({ ...base, message: 'Message A' })
      const v2 = createMockViolation({ ...base, message: 'Message B' })
      const fp1 = JSON.parse(reporter.format(v1)).fingerprint
      const fp2 = JSON.parse(reporter.format(v2)).fingerprint
      expect(fp1).toBe(fp2)
    })

    test('should not change fingerprint when severity changes', () => {
      const reporter = new GitLabReporter()
      const base = { filePath: 'test.ts', line: 10, column: 5, ruleId: 'rule' }
      const v1 = createMockViolation({ ...base, severity: 'error' })
      const v2 = createMockViolation({ ...base, severity: 'warning' })
      const fp1 = JSON.parse(reporter.format(v1)).fingerprint
      const fp2 = JSON.parse(reporter.format(v2)).fingerprint
      expect(fp1).toBe(fp2)
    })

    test('should not change fingerprint when source changes', () => {
      const reporter = new GitLabReporter()
      const base = { filePath: 'test.ts', line: 10, column: 5, ruleId: 'rule' }
      const v1 = createMockViolation({ ...base, source: 'code a' })
      const v2 = createMockViolation({ ...base, source: 'code b' })
      const fp1 = JSON.parse(reporter.format(v1)).fingerprint
      const fp2 = JSON.parse(reporter.format(v2)).fingerprint
      expect(fp1).toBe(fp2)
    })

    test('should change fingerprint when only filePath differs', () => {
      const reporter = new GitLabReporter()
      const v1 = createMockViolation({ filePath: 'a.ts', line: 1, column: 1, ruleId: 'r' })
      const v2 = createMockViolation({ filePath: 'b.ts', line: 1, column: 1, ruleId: 'r' })
      expect(JSON.parse(reporter.format(v1)).fingerprint).not.toBe(
        JSON.parse(reporter.format(v2)).fingerprint,
      )
    })

    test('should change fingerprint when only line differs', () => {
      const reporter = new GitLabReporter()
      const v1 = createMockViolation({ filePath: 'a.ts', line: 1, column: 1, ruleId: 'r' })
      const v2 = createMockViolation({ filePath: 'a.ts', line: 2, column: 1, ruleId: 'r' })
      expect(JSON.parse(reporter.format(v1)).fingerprint).not.toBe(
        JSON.parse(reporter.format(v2)).fingerprint,
      )
    })

    test('should change fingerprint when only column differs', () => {
      const reporter = new GitLabReporter()
      const v1 = createMockViolation({ filePath: 'a.ts', line: 1, column: 1, ruleId: 'r' })
      const v2 = createMockViolation({ filePath: 'a.ts', line: 1, column: 2, ruleId: 'r' })
      expect(JSON.parse(reporter.format(v1)).fingerprint).not.toBe(
        JSON.parse(reporter.format(v2)).fingerprint,
      )
    })

    test('should change fingerprint when only ruleId differs', () => {
      const reporter = new GitLabReporter()
      const v1 = createMockViolation({ filePath: 'a.ts', line: 1, column: 1, ruleId: 'r1' })
      const v2 = createMockViolation({ filePath: 'a.ts', line: 1, column: 1, ruleId: 'r2' })
      expect(JSON.parse(reporter.format(v1)).fingerprint).not.toBe(
        JSON.parse(reporter.format(v2)).fingerprint,
      )
    })

    test('should be deterministic across multiple format calls', () => {
      const reporter = new GitLabReporter()
      const violation = createMockViolation({
        filePath: 'z.ts',
        line: 99,
        column: 7,
        ruleId: 'z-rule',
      })
      const fingerprints = new Set<string>()
      for (let i = 0; i < 10; i++) {
        fingerprints.add(JSON.parse(reporter.format(violation)).fingerprint)
      }
      expect(fingerprints.size).toBe(1)
    })
  })

  describe('content field', () => {
    test('should include content when source is provided', () => {
      const reporter = new GitLabReporter()
      const violation = createMockViolation({ source: 'const x = 1' })
      const parsed = JSON.parse(reporter.format(violation))
      expect(parsed.content).toEqual({ body: 'const x = 1' })
    })

    test('should not include content.body when source is empty', () => {
      const reporter = new GitLabReporter()
      const violation = createMockViolation({ source: '' })
      const parsed = JSON.parse(reporter.format(violation))
      expect(parsed.content).toBeUndefined()
    })

    test('should not include content when source is undefined', () => {
      const reporter = new GitLabReporter()
      const violation = createMockViolation()
      const parsed = JSON.parse(reporter.format(violation))
      expect(parsed.content).toBeUndefined()
    })

    test('should handle multi-line source code', () => {
      const reporter = new GitLabReporter()
      const source = 'function foo() {\n  return 42;\n}'
      const violation = createMockViolation({ source })
      const parsed = JSON.parse(reporter.format(violation))
      expect(parsed.content.body).toBe(source)
    })

    test('should handle source with special JSON characters', () => {
      const reporter = new GitLabReporter()
      const source = '{"key": "value", "nested": {"a": 1}}'
      const violation = createMockViolation({ source })
      const output = reporter.format(violation)
      const parsed = JSON.parse(output)
      expect(parsed.content.body).toBe(source)
    })

    test('should handle source with quotes and backslashes', () => {
      const reporter = new GitLabReporter()
      const source = 'const s = "hello\\nworld"'
      const violation = createMockViolation({ source })
      const output = reporter.format(violation)
      const parsed = JSON.parse(output)
      expect(parsed.content.body).toBe(source)
    })

    test('should handle source with unicode characters', () => {
      const reporter = new GitLabReporter()
      const source = '// 日本語のコメント'
      const violation = createMockViolation({ source })
      const parsed = JSON.parse(reporter.format(violation))
      expect(parsed.content.body).toBe(source)
    })

    test('should handle source with HTML-like content', () => {
      const reporter = new GitLabReporter()
      const source = '<div class="foo">bar</div>'
      const violation = createMockViolation({ source })
      const parsed = JSON.parse(reporter.format(violation))
      expect(parsed.content.body).toBe(source)
    })

    test('should handle very long source content', () => {
      const reporter = new GitLabReporter()
      const source = 'x'.repeat(10000)
      const violation = createMockViolation({ source })
      const parsed = JSON.parse(reporter.format(violation))
      expect(parsed.content.body).toBe(source)
      expect(parsed.content.body).toHaveLength(10000)
    })

    test('should include content alongside other required fields', () => {
      const reporter = new GitLabReporter()
      const violation = createMockViolation({ source: 'code' })
      const parsed = JSON.parse(reporter.format(violation))
      expect(parsed.description).toBeDefined()
      expect(parsed.fingerprint).toBeDefined()
      expect(parsed.location).toBeDefined()
      expect(parsed.severity).toBeDefined()
      expect(parsed.content).toBeDefined()
    })
  })

  describe('location structure', () => {
    test('should contain path property', () => {
      const reporter = new GitLabReporter()
      const parsed = JSON.parse(reporter.format(createMockViolation({ filePath: 'src/main.ts' })))
      expect(parsed.location).toHaveProperty('path')
    })

    test('should contain lines property', () => {
      const reporter = new GitLabReporter()
      const parsed = JSON.parse(reporter.format(createMockViolation({ line: 1 })))
      expect(parsed.location).toHaveProperty('lines')
    })

    test('should contain lines.begin property', () => {
      const reporter = new GitLabReporter()
      const parsed = JSON.parse(reporter.format(createMockViolation({ line: 25 })))
      expect(parsed.location.lines).toHaveProperty('begin')
    })

    test('should reflect exact filePath from violation', () => {
      const reporter = new GitLabReporter()
      const paths = [
        'a.ts',
        'src/a.ts',
        'src/deep/nested/file.ts',
        './relative.ts',
        '/absolute/path.ts',
      ]
      for (const fp of paths) {
        const parsed = JSON.parse(reporter.format(createMockViolation({ filePath: fp })))
        expect(parsed.location.path).toBe(fp)
      }
    })

    test('should reflect exact line number from violation', () => {
      const reporter = new GitLabReporter()
      const lines = [1, 10, 100, 9999, 1_000_000]
      for (const line of lines) {
        const parsed = JSON.parse(reporter.format(createMockViolation({ line })))
        expect(parsed.location.lines.begin).toBe(line)
      }
    })

    test('should preserve file path with extension', () => {
      const reporter = new GitLabReporter()
      const parsed = JSON.parse(reporter.format(createMockViolation({ filePath: 'component.tsx' })))
      expect(parsed.location.path).toBe('component.tsx')
    })

    test('should preserve file path without extension', () => {
      const reporter = new GitLabReporter()
      const parsed = JSON.parse(reporter.format(createMockViolation({ filePath: 'Makefile' })))
      expect(parsed.location.path).toBe('Makefile')
    })

    test('should handle line number 1', () => {
      const reporter = new GitLabReporter()
      const parsed = JSON.parse(reporter.format(createMockViolation({ line: 1 })))
      expect(parsed.location.lines.begin).toBe(1)
    })

    test('should handle very large line number', () => {
      const reporter = new GitLabReporter()
      const parsed = JSON.parse(reporter.format(createMockViolation({ line: 999999 })))
      expect(parsed.location.lines.begin).toBe(999999)
    })

    test('should not include column in location output', () => {
      const reporter = new GitLabReporter()
      const parsed = JSON.parse(reporter.format(createMockViolation({ column: 42 })))
      expect(parsed.location.lines).not.toHaveProperty('end')
      expect(parsed.location.lines).not.toHaveProperty('column')
    })

    test('should not include endLine or endColumn in output', () => {
      const reporter = new GitLabReporter()
      const violation = createMockViolation({ endLine: 20, endColumn: 30 })
      const parsed = JSON.parse(reporter.format(violation))
      expect(parsed.location).not.toHaveProperty('endLine')
      expect(parsed.location).not.toHaveProperty('endColumn')
    })
  })

  describe('description field', () => {
    test('should use violation message as description', () => {
      const reporter = new GitLabReporter()
      const parsed = JSON.parse(
        reporter.format(createMockViolation({ message: 'Unexpected token' })),
      )
      expect(parsed.description).toBe('Unexpected token')
    })

    test('should handle empty message', () => {
      const reporter = new GitLabReporter()
      const parsed = JSON.parse(reporter.format(createMockViolation({ message: '' })))
      expect(parsed.description).toBe('')
    })

    test('should handle message with special characters', () => {
      const reporter = new GitLabReporter()
      const msg = 'Error: "quotes" and \'apostrophes\''
      const parsed = JSON.parse(reporter.format(createMockViolation({ message: msg })))
      expect(parsed.description).toBe(msg)
    })

    test('should handle message with newlines', () => {
      const reporter = new GitLabReporter()
      const msg = 'Line 1\nLine 2\nLine 3'
      const output = reporter.format(createMockViolation({ message: msg }))
      const parsed = JSON.parse(output)
      expect(parsed.description).toBe(msg)
    })

    test('should handle message with tabs', () => {
      const reporter = new GitLabReporter()
      const msg = 'Column 1\tColumn 2'
      const parsed = JSON.parse(reporter.format(createMockViolation({ message: msg })))
      expect(parsed.description).toBe(msg)
    })

    test('should handle message with unicode', () => {
      const reporter = new GitLabReporter()
      const msg = 'エラー: 無効な構文'
      const parsed = JSON.parse(reporter.format(createMockViolation({ message: msg })))
      expect(parsed.description).toBe(msg)
    })

    test('should handle message with emoji', () => {
      const reporter = new GitLabReporter()
      const msg = '🚨 Critical error found!'
      const output = reporter.format(createMockViolation({ message: msg }))
      const parsed = JSON.parse(output)
      expect(parsed.description).toBe(msg)
    })

    test('should handle very long message', () => {
      const reporter = new GitLabReporter()
      const msg = 'A'.repeat(5000)
      const parsed = JSON.parse(reporter.format(createMockViolation({ message: msg })))
      expect(parsed.description).toBe(msg)
      expect(parsed.description).toHaveLength(5000)
    })

    test('should handle message that looks like JSON', () => {
      const reporter = new GitLabReporter()
      const msg = '{"error": "something went wrong"}'
      const output = reporter.format(createMockViolation({ message: msg }))
      const parsed = JSON.parse(output)
      expect(parsed.description).toBe(msg)
    })

    test('should handle message with backslashes', () => {
      const reporter = new GitLabReporter()
      const msg = 'Path: C:\\Users\\dev\\project'
      const output = reporter.format(createMockViolation({ message: msg }))
      const parsed = JSON.parse(output)
      expect(parsed.description).toBe(msg)
    })
  })

  describe('report to console', () => {
    test('should output GitLab Code Quality JSON array', () => {
      const reporter = new GitLabReporter()
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [createMockViolation()])],
        summary: {
          totalFiles: 1,
          filesWithViolations: 1,
          errorCount: 1,
          warningCount: 0,
          infoCount: 0,
          totalTime: 50,
        },
      })
      reporter.report(results)
      expect(consoleSpy).toHaveBeenCalled()
      const output = JSON.parse((consoleSpy.mock.calls[0][0] as string).replace(/\n$/, ''))
      expect(Array.isArray(output)).toBe(true)
      expect(output).toHaveLength(1)
    })

    test('should include all violations in output array', () => {
      const reporter = new GitLabReporter()
      const results = createMockAnalysisResult({
        files: [
          createMockFileResult('a.ts', [
            createMockViolation({ ruleId: 'rule1' }),
            createMockViolation({ ruleId: 'rule2' }),
          ]),
          createMockFileResult('b.ts', [createMockViolation({ ruleId: 'rule3' })]),
        ],
        summary: {
          totalFiles: 2,
          filesWithViolations: 2,
          errorCount: 3,
          warningCount: 0,
          infoCount: 0,
          totalTime: 100,
        },
      })
      reporter.report(results)
      const output = JSON.parse((consoleSpy.mock.calls[0][0] as string).replace(/\n$/, ''))
      expect(output).toHaveLength(3)
    })

    test('should include all required fields in each issue', () => {
      const reporter = new GitLabReporter()
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [createMockViolation()])],
        summary: {
          totalFiles: 1,
          filesWithViolations: 1,
          errorCount: 1,
          warningCount: 0,
          infoCount: 0,
          totalTime: 50,
        },
      })
      reporter.report(results)
      const output = JSON.parse((consoleSpy.mock.calls[0][0] as string).replace(/\n$/, ''))
      const issue = output[0]
      expect(issue.description).toBeDefined()
      expect(issue.fingerprint).toBeDefined()
      expect(issue.location).toBeDefined()
      expect(issue.severity).toBeDefined()
    })

    test('should handle severity mapping for all levels', () => {
      const reporter = new GitLabReporter()
      const results = createMockAnalysisResult({
        files: [
          createMockFileResult('a.ts', [
            createMockViolation({ ruleId: 'rule1', severity: 'error' }),
            createMockViolation({ ruleId: 'rule2', severity: 'warning' }),
            createMockViolation({ ruleId: 'rule3', severity: 'info' }),
          ]),
        ],
        summary: {
          totalFiles: 1,
          filesWithViolations: 1,
          errorCount: 1,
          warningCount: 1,
          infoCount: 1,
          totalTime: 100,
        },
      })
      reporter.report(results)
      const output = JSON.parse((consoleSpy.mock.calls[0][0] as string).replace(/\n$/, ''))
      expect(output[0].severity).toBe('major')
      expect(output[1].severity).toBe('minor')
      expect(output[2].severity).toBe('info')
    })

    test('should include file path in location', () => {
      const reporter = new GitLabReporter()
      const results = createMockAnalysisResult({
        files: [
          createMockFileResult('src/app.ts', [createMockViolation({ filePath: 'src/app.ts' })]),
        ],
        summary: {
          totalFiles: 1,
          filesWithViolations: 1,
          errorCount: 1,
          warningCount: 0,
          infoCount: 0,
          totalTime: 50,
        },
      })
      reporter.report(results)
      const output = JSON.parse((consoleSpy.mock.calls[0][0] as string).replace(/\n$/, ''))
      expect(output[0].location.path).toBe('src/app.ts')
    })

    test('should include line number in location', () => {
      const reporter = new GitLabReporter()
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [createMockViolation({ line: 42 })])],
        summary: {
          totalFiles: 1,
          filesWithViolations: 1,
          errorCount: 1,
          warningCount: 0,
          infoCount: 0,
          totalTime: 50,
        },
      })
      reporter.report(results)
      const output = JSON.parse((consoleSpy.mock.calls[0][0] as string).replace(/\n$/, ''))
      expect(output[0].location.lines.begin).toBe(42)
    })

    test('should write to stdout with newline', () => {
      const reporter = new GitLabReporter()
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [createMockViolation()])],
      })
      reporter.report(results)
      const written = consoleSpy.mock.calls[0][0] as string
      expect(written.endsWith('\n')).toBe(true)
    })

    test('should not write to file when no outputPath', () => {
      const reporter = new GitLabReporter()
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [createMockViolation()])],
      })
      reporter.report(results)
      expect(fsWriteFileSyncMock).not.toHaveBeenCalled()
    })

    test('should output compact JSON by default', () => {
      const reporter = new GitLabReporter()
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [createMockViolation()])],
      })
      reporter.report(results)
      const output = (consoleSpy.mock.calls[0][0] as string).replace(/\n$/, '')
      expect(output).not.toContain('\n  ')
      expect(output).toContain('{"description"')
    })

    test('should output pretty JSON when pretty option is true', () => {
      const reporter = new GitLabReporter({ pretty: true })
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [createMockViolation()])],
      })
      reporter.report(results)
      const output = (consoleSpy.mock.calls[0][0] as string).replace(/\n$/, '')
      expect(output).toContain('\n  ')
    })

    test('should handle multiple files with violations', () => {
      const reporter = new GitLabReporter()
      const results = createMockAnalysisResult({
        files: [
          createMockFileResult('a.ts', [createMockViolation({ filePath: 'a.ts', ruleId: 'r1' })]),
          createMockFileResult('b.ts', [createMockViolation({ filePath: 'b.ts', ruleId: 'r2' })]),
          createMockFileResult('c.ts', [createMockViolation({ filePath: 'c.ts', ruleId: 'r3' })]),
        ],
      })
      reporter.report(results)
      const output = JSON.parse((consoleSpy.mock.calls[0][0] as string).replace(/\n$/, ''))
      expect(output).toHaveLength(3)
      expect(output[0].location.path).toBe('a.ts')
      expect(output[1].location.path).toBe('b.ts')
      expect(output[2].location.path).toBe('c.ts')
    })

    test('should handle file with multiple violations', () => {
      const reporter = new GitLabReporter()
      const violations = [
        createMockViolation({ line: 1, ruleId: 'r1' }),
        createMockViolation({ line: 5, ruleId: 'r2' }),
        createMockViolation({ line: 10, ruleId: 'r3' }),
      ]
      const results = createMockAnalysisResult({
        files: [createMockFileResult('multi.ts', violations)],
      })
      reporter.report(results)
      const output = JSON.parse((consoleSpy.mock.calls[0][0] as string).replace(/\n$/, ''))
      expect(output).toHaveLength(3)
      expect(output[0].location.lines.begin).toBe(1)
      expect(output[1].location.lines.begin).toBe(5)
      expect(output[2].location.lines.begin).toBe(10)
    })

    test('should output valid JSON from report', () => {
      const reporter = new GitLabReporter()
      const results = createMockAnalysisResult({
        files: [
          createMockFileResult('test.ts', [
            createMockViolation({ message: 'Test "quotes" and \\backslashes\\' }),
          ]),
        ],
      })
      reporter.report(results)
      const raw = (consoleSpy.mock.calls[0][0] as string).replace(/\n$/, '')
      expect(() => JSON.parse(raw)).not.toThrow()
    })

    test('should call stdout.write exactly once', () => {
      const reporter = new GitLabReporter()
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [createMockViolation()])],
      })
      reporter.report(results)
      expect(consoleSpy).toHaveBeenCalledTimes(1)
    })
  })

  describe('report to file', () => {
    test('should write to file when outputPath is provided', () => {
      const reporter = new GitLabReporter({ outputPath: './gitlab-report.json' })
      const results = createMockAnalysisResult({
        files: [],
        summary: {
          totalFiles: 0,
          filesWithViolations: 0,
          errorCount: 0,
          warningCount: 0,
          infoCount: 0,
          totalTime: 0,
        },
      })
      fsExistsSyncMock.mockReturnValue(true)
      reporter.report(results)
      expect(fsWriteFileSyncMock).toHaveBeenCalled()
    })

    test('should create directory if it does not exist', () => {
      const reporter = new GitLabReporter({ outputPath: './reports/nested/gitlab-report.json' })
      const results = createMockAnalysisResult({
        files: [],
        summary: {
          totalFiles: 0,
          filesWithViolations: 0,
          errorCount: 0,
          warningCount: 0,
          infoCount: 0,
          totalTime: 0,
        },
      })
      fsExistsSyncMock.mockReturnValue(false)
      vi.mocked(path.dirname).mockReturnValue('./reports/nested')
      reporter.report(results)
      expect(fsMkdirSyncMock).toHaveBeenCalledWith('./reports/nested', { recursive: true })
    })

    test('should not create directory if it exists', () => {
      const reporter = new GitLabReporter({ outputPath: './reports/gitlab-report.json' })
      const results = createMockAnalysisResult({
        files: [],
        summary: {
          totalFiles: 0,
          filesWithViolations: 0,
          errorCount: 0,
          warningCount: 0,
          infoCount: 0,
          totalTime: 0,
        },
      })
      fsExistsSyncMock.mockReturnValue(true)
      vi.mocked(path.dirname).mockReturnValue('./reports')
      reporter.report(results)
      expect(fsMkdirSyncMock).not.toHaveBeenCalled()
    })

    test('should write correct content to file', () => {
      const reporter = new GitLabReporter({ outputPath: './gitlab-report.json' })
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [createMockViolation({ ruleId: 'my-rule' })])],
        summary: {
          totalFiles: 1,
          filesWithViolations: 1,
          errorCount: 1,
          warningCount: 0,
          infoCount: 0,
          totalTime: 50,
        },
      })
      fsExistsSyncMock.mockReturnValue(true)
      reporter.report(results)
      const writtenContent = fsWriteFileSyncMock.mock.calls[0][1] as string
      const parsed = JSON.parse(writtenContent)
      expect(parsed[0].description).toContain('Test violation message')
      expect(parsed[0].fingerprint).toBeDefined()
    })

    test('should write JSON array to file', () => {
      const reporter = new GitLabReporter({ outputPath: './gitlab-report.json' })
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [createMockViolation()])],
        summary: {
          totalFiles: 1,
          filesWithViolations: 1,
          errorCount: 1,
          warningCount: 0,
          infoCount: 0,
          totalTime: 50,
        },
      })
      fsExistsSyncMock.mockReturnValue(true)
      reporter.report(results)
      const writtenContent = fsWriteFileSyncMock.mock.calls[0][1] as string
      const parsed = JSON.parse(writtenContent)
      expect(Array.isArray(parsed)).toBe(true)
    })

    test('should use utf-8 encoding', () => {
      const reporter = new GitLabReporter({ outputPath: './gitlab-report.json' })
      const results = createMockAnalysisResult({
        files: [],
        summary: {
          totalFiles: 0,
          filesWithViolations: 0,
          errorCount: 0,
          warningCount: 0,
          infoCount: 0,
          totalTime: 0,
        },
      })
      fsExistsSyncMock.mockReturnValue(true)
      reporter.report(results)
      expect(fsWriteFileSyncMock).toHaveBeenCalledWith(
        './gitlab-report.json',
        expect.any(String),
        'utf8',
      )
    })

    test('should not write to stdout when writing to file', () => {
      const reporter = new GitLabReporter({ outputPath: './gitlab-report.json' })
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [createMockViolation()])],
      })
      fsExistsSyncMock.mockReturnValue(true)
      reporter.report(results)
      expect(consoleSpy).not.toHaveBeenCalled()
    })

    test('should write pretty JSON to file when pretty is true', () => {
      const reporter = new GitLabReporter({ outputPath: './out.json', pretty: true })
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [createMockViolation()])],
      })
      fsExistsSyncMock.mockReturnValue(true)
      reporter.report(results)
      const written = fsWriteFileSyncMock.mock.calls[0][1] as string
      expect(written).toContain('\n  ')
    })

    test('should write compact JSON to file when pretty is false', () => {
      const reporter = new GitLabReporter({ outputPath: './out.json', pretty: false })
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [createMockViolation()])],
      })
      fsExistsSyncMock.mockReturnValue(true)
      reporter.report(results)
      const written = fsWriteFileSyncMock.mock.calls[0][1] as string
      expect(written).not.toContain('\n  ')
    })

    test('should write compact JSON to file by default', () => {
      const reporter = new GitLabReporter({ outputPath: './out.json' })
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [createMockViolation()])],
      })
      fsExistsSyncMock.mockReturnValue(true)
      reporter.report(results)
      const written = fsWriteFileSyncMock.mock.calls[0][1] as string
      expect(written).not.toContain('\n  ')
    })

    test('should write empty array to file when no violations', () => {
      const reporter = new GitLabReporter({ outputPath: './out.json' })
      const results = createMockAnalysisResult({ files: [] })
      fsExistsSyncMock.mockReturnValue(true)
      reporter.report(results)
      const written = fsWriteFileSyncMock.mock.calls[0][1] as string
      expect(JSON.parse(written)).toEqual([])
    })

    test('should write all violations from all files', () => {
      const reporter = new GitLabReporter({ outputPath: './out.json' })
      const results = createMockAnalysisResult({
        files: [
          createMockFileResult('a.ts', [
            createMockViolation({ ruleId: 'r1' }),
            createMockViolation({ ruleId: 'r2' }),
          ]),
          createMockFileResult('b.ts', [createMockViolation({ ruleId: 'r3' })]),
        ],
      })
      fsExistsSyncMock.mockReturnValue(true)
      reporter.report(results)
      const written = fsWriteFileSyncMock.mock.calls[0][1] as string
      expect(JSON.parse(written)).toHaveLength(3)
    })
  })

  describe('pretty output', () => {
    test('should produce indented JSON when pretty is true', () => {
      const reporter = new GitLabReporter({ pretty: true })
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [createMockViolation()])],
      })
      reporter.report(results)
      const output = (consoleSpy.mock.calls[0][0] as string).replace(/\n$/, '')
      expect(output).toContain('  "description"')
      expect(output).toContain('  "fingerprint"')
    })

    test('should produce indented JSON to file when pretty is true', () => {
      const reporter = new GitLabReporter({ pretty: true, outputPath: './out.json' })
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [createMockViolation()])],
      })
      fsExistsSyncMock.mockReturnValue(true)
      reporter.report(results)
      const written = fsWriteFileSyncMock.mock.calls[0][1] as string
      expect(written).toContain('  "description"')
    })

    test('should produce single-line JSON when pretty is false', () => {
      const reporter = new GitLabReporter({ pretty: false })
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [createMockViolation()])],
      })
      reporter.report(results)
      const output = (consoleSpy.mock.calls[0][0] as string).replace(/\n$/, '')
      const lines = output.split('\n')
      expect(lines.length).toBe(1)
    })

    test('should use 2-space indentation in pretty mode', () => {
      const reporter = new GitLabReporter({ pretty: true })
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [createMockViolation()])],
      })
      reporter.report(results)
      const output = (consoleSpy.mock.calls[0][0] as string).replace(/\n$/, '')
      expect(output).toContain('    "begin"')
      expect(output).toContain('    "path"')
    })

    test('pretty output should still be valid JSON', () => {
      const reporter = new GitLabReporter({ pretty: true })
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [createMockViolation({ source: 'code' })])],
      })
      reporter.report(results)
      const output = (consoleSpy.mock.calls[0][0] as string).replace(/\n$/, '')
      expect(() => JSON.parse(output)).not.toThrow()
    })
  })

  describe('edge cases', () => {
    test('should handle violation without optional fields', () => {
      const reporter = new GitLabReporter()
      const minimalViolation: Violation = {
        ruleId: 'minimal',
        severity: 'error',
        message: 'Minimal violation',
        filePath: 'test.ts',
        line: 1,
        column: 1,
      }
      const output = reporter.format(minimalViolation)
      const parsed = JSON.parse(output)
      expect(parsed.description).toBe('Minimal violation')
      expect(parsed.location).toBeDefined()
      expect(parsed.fingerprint).toBeDefined()
    })

    test('should handle deeply nested file path', () => {
      const reporter = new GitLabReporter({
        outputPath: './reports/2024/01/15/deep/nested/gitlab-report.json',
      })
      const results = createMockAnalysisResult({
        files: [],
        summary: {
          totalFiles: 0,
          filesWithViolations: 0,
          errorCount: 0,
          warningCount: 0,
          infoCount: 0,
          totalTime: 0,
        },
      })
      fsExistsSyncMock.mockReturnValue(false)
      vi.mocked(path.dirname).mockReturnValue('./reports/2024/01/15/deep/nested')
      reporter.report(results)
      expect(fsMkdirSyncMock).toHaveBeenCalled()
    })

    test('should handle special characters in violation message', () => {
      const reporter = new GitLabReporter()
      const violation = createMockViolation({
        message: 'Error: "quotes" and \'apostrophes\' with \n newlines \t tabs',
      })
      const output = reporter.format(violation)
      expect(() => JSON.parse(output)).not.toThrow()
    })

    test('should handle unicode in file path', () => {
      const reporter = new GitLabReporter()
      const violation = createMockViolation({ filePath: 'src/文件/测试.ts' })
      const output = reporter.format(violation)
      const parsed = JSON.parse(output)
      expect(parsed.location.path).toBe('src/文件/测试.ts')
    })

    test('should handle empty files array', () => {
      const reporter = new GitLabReporter()
      const results = createMockAnalysisResult({
        files: [],
        summary: {
          totalFiles: 0,
          filesWithViolations: 0,
          errorCount: 0,
          warningCount: 0,
          infoCount: 0,
          totalTime: 0,
        },
      })
      reporter.report(results)
      const output = JSON.parse((consoleSpy.mock.calls[0][0] as string).replace(/\n$/, ''))
      expect(output).toEqual([])
    })

    test('should handle root path output', () => {
      const reporter = new GitLabReporter({ outputPath: '/tmp/gitlab-report.json' })
      const results = createMockAnalysisResult({
        files: [],
        summary: {
          totalFiles: 0,
          filesWithViolations: 0,
          errorCount: 0,
          warningCount: 0,
          infoCount: 0,
          totalTime: 0,
        },
      })
      fsExistsSyncMock.mockReturnValue(true)
      vi.mocked(path.dirname).mockReturnValue('/tmp')
      reporter.report(results)
      expect(fsWriteFileSyncMock).toHaveBeenCalledWith(
        '/tmp/gitlab-report.json',
        expect.any(String),
        'utf8',
      )
    })

    test('should handle file with violations but empty summary counts', () => {
      const reporter = new GitLabReporter()
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [createMockViolation()])],
        summary: {
          totalFiles: 1,
          filesWithViolations: 0,
          errorCount: 0,
          warningCount: 0,
          infoCount: 0,
          totalTime: 0,
        },
      })
      reporter.report(results)
      const output = JSON.parse((consoleSpy.mock.calls[0][0] as string).replace(/\n$/, ''))
      expect(output).toHaveLength(1)
    })

    test('should handle violation with endLine and endColumn', () => {
      const reporter = new GitLabReporter()
      const violation = createMockViolation({ endLine: 20, endColumn: 15 })
      const output = reporter.format(violation)
      const parsed = JSON.parse(output)
      expect(parsed.location.lines.begin).toBe(10)
    })

    test('should handle violation with meta field', () => {
      const reporter = new GitLabReporter()
      const violation = createMockViolation({
        meta: { complexity: 5, category: 'complexity' },
      })
      const output = reporter.format(violation)
      const parsed = JSON.parse(output)
      expect(parsed.description).toBe('Test violation message')
    })

    test('should handle violation with suggestion field', () => {
      const reporter = new GitLabReporter()
      const violation = createMockViolation({
        suggestion: 'Consider using const instead of let',
      })
      const output = reporter.format(violation)
      const parsed = JSON.parse(output)
      expect(parsed.description).toBe('Test violation message')
    })

    test('should handle line number 0', () => {
      const reporter = new GitLabReporter()
      const violation = createMockViolation({ line: 0 })
      const parsed = JSON.parse(reporter.format(violation))
      expect(parsed.location.lines.begin).toBe(0)
    })

    test('should handle column number 0', () => {
      const reporter = new GitLabReporter()
      const violation = createMockViolation({ column: 0 })
      const fingerprint = computeExpectedFingerprint(violation)
      const parsed = JSON.parse(reporter.format(violation))
      expect(parsed.fingerprint).toBe(fingerprint)
    })

    test('should handle file result with empty violations array', () => {
      const reporter = new GitLabReporter()
      const results = createMockAnalysisResult({
        files: [createMockFileResult('empty.ts', [])],
      })
      reporter.report(results)
      const output = JSON.parse((consoleSpy.mock.calls[0][0] as string).replace(/\n$/, ''))
      expect(output).toEqual([])
    })

    test('should handle multiple file results some with no violations', () => {
      const reporter = new GitLabReporter()
      const results = createMockAnalysisResult({
        files: [
          createMockFileResult('a.ts', [createMockViolation({ ruleId: 'r1' })]),
          createMockFileResult('b.ts', []),
          createMockFileResult('c.ts', [createMockViolation({ ruleId: 'r2' })]),
        ],
      })
      reporter.report(results)
      const output = JSON.parse((consoleSpy.mock.calls[0][0] as string).replace(/\n$/, ''))
      expect(output).toHaveLength(2)
    })

    test('should handle violation with dot in filePath', () => {
      const reporter = new GitLabReporter()
      const violation = createMockViolation({ filePath: './src/../lib/file.ts' })
      const parsed = JSON.parse(reporter.format(violation))
      expect(parsed.location.path).toBe('./src/../lib/file.ts')
    })

    test('should handle violation with absolute path', () => {
      const reporter = new GitLabReporter()
      const violation = createMockViolation({ filePath: '/home/user/project/src/index.ts' })
      const parsed = JSON.parse(reporter.format(violation))
      expect(parsed.location.path).toBe('/home/user/project/src/index.ts')
    })

    test('should handle violation with Windows-style path', () => {
      const reporter = new GitLabReporter()
      const violation = createMockViolation({ filePath: 'C:\\Users\\dev\\project\\src\\index.ts' })
      const parsed = JSON.parse(reporter.format(violation))
      expect(parsed.location.path).toBe('C:\\Users\\dev\\project\\src\\index.ts')
    })

    test('should handle ruleId with slashes', () => {
      const reporter = new GitLabReporter()
      const violation = createMockViolation({ ruleId: 'import/no-cycle' })
      const parsed = JSON.parse(reporter.format(violation))
      expect(parsed.fingerprint).toBeDefined()
    })

    test('should handle ruleId with @ prefix', () => {
      const reporter = new GitLabReporter()
      const violation = createMockViolation({ ruleId: '@typescript-eslint/no-explicit-any' })
      const parsed = JSON.parse(reporter.format(violation))
      expect(parsed.fingerprint).toBeDefined()
    })

    test('should handle ruleId with special characters', () => {
      const reporter = new GitLabReporter()
      const violation = createMockViolation({ ruleId: 'no-eval' })
      const parsed = JSON.parse(reporter.format(violation))
      expect(parsed.fingerprint).toBeDefined()
    })

    test('should produce unique fingerprints for 100 violations', () => {
      const reporter = new GitLabReporter()
      const fingerprints = new Set<string>()
      for (let i = 0; i < 100; i++) {
        const violation = createMockViolation({
          filePath: `file${i}.ts`,
          line: i + 1,
          column: 1,
          ruleId: 'test-rule',
        })
        fingerprints.add(JSON.parse(reporter.format(violation)).fingerprint)
      }
      expect(fingerprints.size).toBe(100)
    })

    test('should handle report called multiple times', () => {
      const reporter = new GitLabReporter()
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [createMockViolation()])],
      })
      reporter.report(results)
      reporter.report(results)
      reporter.report(results)
      expect(consoleSpy).toHaveBeenCalledTimes(3)
    })

    test('should handle violation with very long ruleId', () => {
      const reporter = new GitLabReporter()
      const longRuleId = 'a'.repeat(500)
      const violation = createMockViolation({ ruleId: longRuleId })
      const parsed = JSON.parse(reporter.format(violation))
      expect(parsed.fingerprint).toBeDefined()
      expect(parsed.fingerprint).toHaveLength(32)
    })

    test('should handle violation with very long filePath', () => {
      const reporter = new GitLabReporter()
      const longPath = 'src/'.repeat(100) + 'file.ts'
      const violation = createMockViolation({ filePath: longPath })
      const parsed = JSON.parse(reporter.format(violation))
      expect(parsed.location.path).toBe(longPath)
    })
  })

  describe('GitLab Code Quality JSON schema compliance', () => {
    test('should output a JSON array at top level', () => {
      const reporter = new GitLabReporter()
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [createMockViolation()])],
      })
      reporter.report(results)
      const output = JSON.parse((consoleSpy.mock.calls[0][0] as string).replace(/\n$/, ''))
      expect(Array.isArray(output)).toBe(true)
    })

    test('should have description as string in each issue', () => {
      const reporter = new GitLabReporter()
      const parsed = JSON.parse(reporter.format(createMockViolation()))
      expect(typeof parsed.description).toBe('string')
    })

    test('should have fingerprint as string in each issue', () => {
      const reporter = new GitLabReporter()
      const parsed = JSON.parse(reporter.format(createMockViolation()))
      expect(typeof parsed.fingerprint).toBe('string')
    })

    test('should have severity as string in each issue', () => {
      const reporter = new GitLabReporter()
      const parsed = JSON.parse(reporter.format(createMockViolation()))
      expect(typeof parsed.severity).toBe('string')
    })

    test('should have location as object in each issue', () => {
      const reporter = new GitLabReporter()
      const parsed = JSON.parse(reporter.format(createMockViolation()))
      expect(typeof parsed.location).toBe('object')
      expect(parsed.location).not.toBeNull()
    })

    test('should have location.path as string', () => {
      const reporter = new GitLabReporter()
      const parsed = JSON.parse(reporter.format(createMockViolation()))
      expect(typeof parsed.location.path).toBe('string')
    })

    test('should have location.lines as object', () => {
      const reporter = new GitLabReporter()
      const parsed = JSON.parse(reporter.format(createMockViolation()))
      expect(typeof parsed.location.lines).toBe('object')
    })

    test('should have location.lines.begin as number', () => {
      const reporter = new GitLabReporter()
      const parsed = JSON.parse(reporter.format(createMockViolation()))
      expect(typeof parsed.location.lines.begin).toBe('number')
    })

    test('should have content as object with body when source present', () => {
      const reporter = new GitLabReporter()
      const parsed = JSON.parse(reporter.format(createMockViolation({ source: 'code' })))
      expect(typeof parsed.content).toBe('object')
      expect(typeof parsed.content.body).toBe('string')
    })

    test('should not include extra properties in output', () => {
      const reporter = new GitLabReporter()
      const violation = createMockViolation()
      const parsed = JSON.parse(reporter.format(violation))
      const allowedKeys = ['description', 'fingerprint', 'location', 'severity']
      const actualKeys = Object.keys(parsed)
      for (const key of actualKeys) {
        expect(allowedKeys).toContain(key)
      }
    })

    test('should not include ruleId directly in output', () => {
      const reporter = new GitLabReporter()
      const parsed = JSON.parse(reporter.format(createMockViolation({ ruleId: 'my-rule' })))
      expect(parsed).not.toHaveProperty('ruleId')
    })

    test('should not include column in output', () => {
      const reporter = new GitLabReporter()
      const parsed = JSON.parse(reporter.format(createMockViolation({ column: 42 })))
      expect(parsed).not.toHaveProperty('column')
      expect(parsed.location).not.toHaveProperty('column')
    })

    test('should not include severity from input in output', () => {
      const reporter = new GitLabReporter()
      const parsed = JSON.parse(reporter.format(createMockViolation({ severity: 'error' })))
      expect(parsed.severity).not.toBe('error')
    })

    test('should not include meta from violation in output', () => {
      const reporter = new GitLabReporter()
      const violation = createMockViolation({ meta: { foo: 'bar' } })
      const parsed = JSON.parse(reporter.format(violation))
      expect(parsed).not.toHaveProperty('meta')
    })

    test('should not include suggestion from violation in output', () => {
      const reporter = new GitLabReporter()
      const violation = createMockViolation({ suggestion: 'fix it' })
      const parsed = JSON.parse(reporter.format(violation))
      expect(parsed).not.toHaveProperty('suggestion')
    })

    test('should not include endLine or endColumn in location output', () => {
      const reporter = new GitLabReporter()
      const violation = createMockViolation({ endLine: 50, endColumn: 10 })
      const parsed = JSON.parse(reporter.format(violation))
      expect(parsed.location).not.toHaveProperty('endLine')
      expect(parsed.location).not.toHaveProperty('endColumn')
      expect(parsed.location.lines).not.toHaveProperty('end')
    })
  })

  describe('reporter interface compliance', () => {
    test('should have name property', () => {
      const reporter = new GitLabReporter()
      expect(reporter).toHaveProperty('name')
    })

    test('should have format method', () => {
      const reporter = new GitLabReporter()
      expect(typeof reporter.format).toBe('function')
    })

    test('should have report method', () => {
      const reporter = new GitLabReporter()
      expect(typeof reporter.report).toBe('function')
    })

    test('format should accept a Violation and return string', () => {
      const reporter = new GitLabReporter()
      const result = reporter.format(createMockViolation())
      expect(typeof result).toBe('string')
    })

    test('report should accept an AnalysisResult and return void', () => {
      const reporter = new GitLabReporter()
      const result = reporter.report(createMockAnalysisResult())
      expect(result).toBeUndefined()
    })

    test('name should be declared as readonly', () => {
      const reporter = new GitLabReporter()
      expect(reporter.name).toBe('gitlab')
    })
  })

  describe('concurrent and repeated operations', () => {
    test('should produce same output for repeated format calls', () => {
      const reporter = new GitLabReporter()
      const violation = createMockViolation()
      const results = Array.from({ length: 5 }, () => reporter.format(violation))
      const unique = new Set(results)
      expect(unique.size).toBe(1)
    })

    test('should handle report after format without interference', () => {
      const reporter = new GitLabReporter()
      reporter.format(createMockViolation({ ruleId: 'fmt-rule' }))
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [createMockViolation({ ruleId: 'rpt-rule' })])],
      })
      reporter.report(results)
      const output = JSON.parse((consoleSpy.mock.calls[0][0] as string).replace(/\n$/, ''))
      expect(output[0].description).toBe('Test violation message')
    })

    test('should handle format after report without interference', () => {
      const reporter = new GitLabReporter()
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [createMockViolation()])],
      })
      reporter.report(results)
      const formatted = JSON.parse(reporter.format(createMockViolation({ ruleId: 'post-rule' })))
      expect(formatted.description).toBe('Test violation message')
    })

    test('should handle creating multiple reporter instances', () => {
      const r1 = new GitLabReporter()
      const r2 = new GitLabReporter({ pretty: true })
      const r3 = new GitLabReporter({ outputPath: './out.json' })
      expect(r1.name).toBe('gitlab')
      expect(r2.name).toBe('gitlab')
      expect(r3.name).toBe('gitlab')
    })

    test('should handle independent reporter instances with different options', () => {
      const compact = new GitLabReporter({ pretty: false })
      const pretty = new GitLabReporter({ pretty: true })
      const violation = createMockViolation()
      const compactOut = compact.format(violation)
      const prettyOut = pretty.format(violation)
      expect(compactOut).not.toContain('\n  ')
      expect(compactOut).toBe(prettyOut)
    })
  })

  describe('mixed severity scenarios', () => {
    test('should correctly map a mix of severities in report output', () => {
      const reporter = new GitLabReporter()
      const violations = [
        createMockViolation({ ruleId: 'e1', severity: 'error', line: 1 }),
        createMockViolation({ ruleId: 'w1', severity: 'warning', line: 2 }),
        createMockViolation({ ruleId: 'i1', severity: 'info', line: 3 }),
        createMockViolation({ ruleId: 'e2', severity: 'error', line: 4 }),
        createMockViolation({ ruleId: 'w2', severity: 'warning', line: 5 }),
      ]
      const results = createMockAnalysisResult({
        files: [createMockFileResult('mixed.ts', violations)],
      })
      reporter.report(results)
      const output = JSON.parse((consoleSpy.mock.calls[0][0] as string).replace(/\n$/, ''))
      expect(output[0].severity).toBe('major')
      expect(output[1].severity).toBe('minor')
      expect(output[2].severity).toBe('info')
      expect(output[3].severity).toBe('major')
      expect(output[4].severity).toBe('minor')
    })

    test('should preserve violation order in report output', () => {
      const reporter = new GitLabReporter()
      const violations = [
        createMockViolation({ ruleId: 'first', line: 1 }),
        createMockViolation({ ruleId: 'second', line: 2 }),
        createMockViolation({ ruleId: 'third', line: 3 }),
      ]
      const results = createMockAnalysisResult({
        files: [createMockFileResult('ordered.ts', violations)],
      })
      reporter.report(results)
      const output = JSON.parse((consoleSpy.mock.calls[0][0] as string).replace(/\n$/, ''))
      expect(output[0].location.lines.begin).toBe(1)
      expect(output[1].location.lines.begin).toBe(2)
      expect(output[2].location.lines.begin).toBe(3)
    })

    test('should preserve file order in report output', () => {
      const reporter = new GitLabReporter()
      const results = createMockAnalysisResult({
        files: [
          createMockFileResult('aaa.ts', [createMockViolation({ filePath: 'aaa.ts' })]),
          createMockFileResult('bbb.ts', [createMockViolation({ filePath: 'bbb.ts' })]),
          createMockFileResult('ccc.ts', [createMockViolation({ filePath: 'ccc.ts' })]),
        ],
      })
      reporter.report(results)
      const output = JSON.parse((consoleSpy.mock.calls[0][0] as string).replace(/\n$/, ''))
      expect(output[0].location.path).toBe('aaa.ts')
      expect(output[1].location.path).toBe('bbb.ts')
      expect(output[2].location.path).toBe('ccc.ts')
    })

    test('should interleave violations from multiple files in file order', () => {
      const reporter = new GitLabReporter()
      const results = createMockAnalysisResult({
        files: [
          createMockFileResult('a.ts', [
            createMockViolation({ ruleId: 'a1' }),
            createMockViolation({ ruleId: 'a2' }),
          ]),
          createMockFileResult('b.ts', [createMockViolation({ ruleId: 'b1' })]),
        ],
      })
      reporter.report(results)
      const output = JSON.parse((consoleSpy.mock.calls[0][0] as string).replace(/\n$/, ''))
      expect(output[0].fingerprint).toBeDefined()
      expect(output[1].fingerprint).toBeDefined()
      expect(output[2].fingerprint).toBeDefined()
      const fps = output.map((v: { fingerprint: string }) => v.fingerprint)
      expect(new Set(fps).size).toBe(3)
    })
  })

  describe('real-world violation scenarios', () => {
    test('should handle no-console rule violation', () => {
      const reporter = new GitLabReporter()
      const violation = createMockViolation({
        ruleId: 'no-console',
        severity: 'warning',
        message: 'Unexpected console statement.',
        filePath: 'src/utils/logger.ts',
        line: 15,
        column: 1,
        source: 'console.log("debug")',
      })
      const parsed = JSON.parse(reporter.format(violation))
      expect(parsed.description).toBe('Unexpected console statement.')
      expect(parsed.severity).toBe('minor')
      expect(parsed.content.body).toBe('console.log("debug")')
    })

    test('should handle no-eval rule violation', () => {
      const reporter = new GitLabReporter()
      const violation = createMockViolation({
        ruleId: 'no-eval',
        severity: 'error',
        message: 'eval can be harmful.',
        filePath: 'src/parse.ts',
        line: 42,
        column: 12,
        source: 'eval(userInput)',
      })
      const parsed = JSON.parse(reporter.format(violation))
      expect(parsed.severity).toBe('major')
      expect(parsed.content.body).toBe('eval(userInput)')
    })

    test('should handle max-params rule violation', () => {
      const reporter = new GitLabReporter()
      const violation = createMockViolation({
        ruleId: 'max-params',
        severity: 'warning',
        message: 'Too many parameters (4). Maximum allowed is 3.',
        filePath: 'src/services/user.ts',
        line: 25,
        column: 1,
      })
      const parsed = JSON.parse(reporter.format(violation))
      expect(parsed.description).toBe('Too many parameters (4). Maximum allowed is 3.')
      expect(parsed.severity).toBe('minor')
      expect(parsed.content).toBeUndefined()
    })

    test('should handle complexity rule violation', () => {
      const reporter = new GitLabReporter()
      const violation = createMockViolation({
        ruleId: 'complexity',
        severity: 'warning',
        message: 'Function has a complexity of 15. Maximum is 10.',
        filePath: 'src/core/engine.ts',
        line: 100,
        column: 1,
      })
      const parsed = JSON.parse(reporter.format(violation))
      expect(parsed.description).toContain('complexity of 15')
    })

    test('should handle security rule violation', () => {
      const reporter = new GitLabReporter()
      const violation = createMockViolation({
        ruleId: 'no-unsafe-regex',
        severity: 'error',
        message: 'Unsafe regular expression found.',
        filePath: 'src/validators/input.ts',
        line: 8,
        column: 20,
        source: '/(a+)+/.test(input)',
      })
      const parsed = JSON.parse(reporter.format(violation))
      expect(parsed.severity).toBe('major')
    })

    test('should handle import-related violation', () => {
      const reporter = new GitLabReporter()
      const violation = createMockViolation({
        ruleId: 'import/no-cycle',
        severity: 'warning',
        message: 'Dependency cycle detected.',
        filePath: 'src/modules/a.ts',
        line: 1,
        column: 1,
      })
      const parsed = JSON.parse(reporter.format(violation))
      expect(parsed.location.path).toBe('src/modules/a.ts')
    })

    test('should handle typescript-eslint rule violation', () => {
      const reporter = new GitLabReporter()
      const violation = createMockViolation({
        ruleId: '@typescript-eslint/no-explicit-any',
        severity: 'error',
        message: 'Unexpected any. Specify a different type.',
        filePath: 'src/types/helpers.ts',
        line: 30,
        column: 15,
      })
      const parsed = JSON.parse(reporter.format(violation))
      expect(parsed.fingerprint).toBeDefined()
    })

    test('should handle info-level todo comment violation', () => {
      const reporter = new GitLabReporter()
      const violation = createMockViolation({
        ruleId: 'no-todo',
        severity: 'info',
        message: 'TODO comment found.',
        filePath: 'src/features/auth.ts',
        line: 55,
        column: 3,
        source: '// TODO: implement proper validation',
      })
      const parsed = JSON.parse(reporter.format(violation))
      expect(parsed.severity).toBe('info')
      expect(parsed.content.body).toContain('TODO')
    })
  })

  describe('file result handling', () => {
    test('should process files with different stats objects', () => {
      const reporter = new GitLabReporter()
      const results = createMockAnalysisResult({
        files: [
          createMockFileResult('a.ts', [createMockViolation()], {
            parseTime: 1,
            analysisTime: 2,
            totalTime: 3,
          }),
          createMockFileResult('b.ts', [createMockViolation()], {
            parseTime: 100,
            analysisTime: 200,
            totalTime: 300,
          }),
        ],
      })
      reporter.report(results)
      const output = JSON.parse((consoleSpy.mock.calls[0][0] as string).replace(/\n$/, ''))
      expect(output).toHaveLength(2)
    })

    test('should ignore stats when producing output', () => {
      const reporter = new GitLabReporter()
      const results = createMockAnalysisResult({
        files: [
          createMockFileResult('test.ts', [createMockViolation()], {
            parseTime: 999,
            analysisTime: 999,
            totalTime: 999,
          }),
        ],
      })
      reporter.report(results)
      const output = JSON.parse((consoleSpy.mock.calls[0][0] as string).replace(/\n$/, ''))
      expect(output[0].description).toBe('Test violation message')
    })

    test('should process file with single violation', () => {
      const reporter = new GitLabReporter()
      const results = createMockAnalysisResult({
        files: [createMockFileResult('single.ts', [createMockViolation({ ruleId: 'only-one' })])],
      })
      reporter.report(results)
      const output = JSON.parse((consoleSpy.mock.calls[0][0] as string).replace(/\n$/, ''))
      expect(output).toHaveLength(1)
    })

    test('should process file with many violations', () => {
      const reporter = new GitLabReporter()
      const violations = Array.from({ length: 50 }, (_, i) =>
        createMockViolation({ ruleId: `rule-${i}`, line: i + 1 }),
      )
      const results = createMockAnalysisResult({
        files: [createMockFileResult('many.ts', violations)],
      })
      reporter.report(results)
      const output = JSON.parse((consoleSpy.mock.calls[0][0] as string).replace(/\n$/, ''))
      expect(output).toHaveLength(50)
    })

    test('should handle 10 files each with 5 violations', () => {
      const reporter = new GitLabReporter()
      const files = Array.from({ length: 10 }, (_, i) =>
        createMockFileResult(
          `file${i}.ts`,
          Array.from({ length: 5 }, (_, j) =>
            createMockViolation({ ruleId: `r${i}-${j}`, line: j + 1, filePath: `file${i}.ts` }),
          ),
        ),
      )
      const results = createMockAnalysisResult({ files })
      reporter.report(results)
      const output = JSON.parse((consoleSpy.mock.calls[0][0] as string).replace(/\n$/, ''))
      expect(output).toHaveLength(50)
    })
  })

  describe('fingerprint determinism across sessions', () => {
    test('should produce same fingerprint with new reporter instance', () => {
      const violation = createMockViolation({
        filePath: 'stable.ts',
        line: 5,
        column: 3,
        ruleId: 'stable-rule',
      })
      const r1 = new GitLabReporter()
      const r2 = new GitLabReporter()
      const fp1 = JSON.parse(r1.format(violation)).fingerprint
      const fp2 = JSON.parse(r2.format(violation)).fingerprint
      expect(fp1).toBe(fp2)
    })

    test('should produce same fingerprint regardless of constructor options', () => {
      const violation = createMockViolation({ filePath: 'a.ts', line: 1, column: 1, ruleId: 'r' })
      const r1 = new GitLabReporter()
      const r2 = new GitLabReporter({ pretty: true, outputPath: '/dev/null' })
      const fp1 = JSON.parse(r1.format(violation)).fingerprint
      const fp2 = JSON.parse(r2.format(violation)).fingerprint
      expect(fp1).toBe(fp2)
    })

    test('should produce known MD5 for specific input', () => {
      const violation = createMockViolation({ filePath: 'a.ts', line: 1, column: 1, ruleId: 'r' })
      const input = 'a.ts:1:1:r'
      const expected = crypto.createHash('md5').update(input).digest('hex')
      const parsed = JSON.parse(new GitLabReporter().format(violation))
      expect(parsed.fingerprint).toBe(expected)
    })

    test('should produce different fingerprints for same line in different files', () => {
      const reporter = new GitLabReporter()
      const base = { line: 10, column: 5, ruleId: 'same-rule' }
      const fp1 = JSON.parse(
        reporter.format(createMockViolation({ ...base, filePath: 'x.ts' })),
      ).fingerprint
      const fp2 = JSON.parse(
        reporter.format(createMockViolation({ ...base, filePath: 'y.ts' })),
      ).fingerprint
      expect(fp1).not.toBe(fp2)
    })

    test('should produce different fingerprints for same file different columns', () => {
      const reporter = new GitLabReporter()
      const base = { filePath: 'same.ts', line: 10, ruleId: 'same-rule' }
      const fp1 = JSON.parse(
        reporter.format(createMockViolation({ ...base, column: 1 })),
      ).fingerprint
      const fp2 = JSON.parse(
        reporter.format(createMockViolation({ ...base, column: 2 })),
      ).fingerprint
      expect(fp1).not.toBe(fp2)
    })
  })

  describe('output format validation', () => {
    test('should produce parseable JSON for error severity', () => {
      const reporter = new GitLabReporter()
      const output = reporter.format(createMockViolation({ severity: 'error' }))
      expect(() => JSON.parse(output)).not.toThrow()
    })

    test('should produce parseable JSON for warning severity', () => {
      const reporter = new GitLabReporter()
      const output = reporter.format(createMockViolation({ severity: 'warning' }))
      expect(() => JSON.parse(output)).not.toThrow()
    })

    test('should produce parseable JSON for info severity', () => {
      const reporter = new GitLabReporter()
      const output = reporter.format(createMockViolation({ severity: 'info' }))
      expect(() => JSON.parse(output)).not.toThrow()
    })

    test('should produce parseable JSON for violation with source', () => {
      const reporter = new GitLabReporter()
      const output = reporter.format(createMockViolation({ source: 'x = 1' }))
      expect(() => JSON.parse(output)).not.toThrow()
    })

    test('should produce parseable JSON for violation without source', () => {
      const reporter = new GitLabReporter()
      const output = reporter.format(createMockViolation())
      expect(() => JSON.parse(output)).not.toThrow()
    })

    test('should produce parseable report output', () => {
      const reporter = new GitLabReporter()
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [createMockViolation()])],
      })
      reporter.report(results)
      const raw = (consoleSpy.mock.calls[0][0] as string).replace(/\n$/, '')
      expect(() => JSON.parse(raw)).not.toThrow()
    })

    test('should produce parseable pretty report output', () => {
      const reporter = new GitLabReporter({ pretty: true })
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [createMockViolation()])],
      })
      reporter.report(results)
      const raw = (consoleSpy.mock.calls[0][0] as string).replace(/\n$/, '')
      expect(() => JSON.parse(raw)).not.toThrow()
    })

    test('should produce parseable file output', () => {
      const reporter = new GitLabReporter({ outputPath: './out.json' })
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [createMockViolation()])],
      })
      fsExistsSyncMock.mockReturnValue(true)
      reporter.report(results)
      const written = fsWriteFileSyncMock.mock.calls[0][1] as string
      expect(() => JSON.parse(written)).not.toThrow()
    })
  })

  describe('summary and timestamp handling', () => {
    test('should ignore summary when producing output', () => {
      const reporter = new GitLabReporter()
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [createMockViolation()])],
        summary: {
          totalFiles: 999,
          filesWithViolations: 999,
          errorCount: 999,
          warningCount: 999,
          infoCount: 999,
          totalTime: 999,
        },
      })
      reporter.report(results)
      const output = JSON.parse((consoleSpy.mock.calls[0][0] as string).replace(/\n$/, ''))
      expect(output).toHaveLength(1)
      expect(output[0].description).toBe('Test violation message')
    })

    test('should ignore timestamp when producing output', () => {
      const reporter = new GitLabReporter()
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [createMockViolation()])],
        timestamp: '2099-12-31T23:59:59.000Z',
      })
      reporter.report(results)
      const output = JSON.parse((consoleSpy.mock.calls[0][0] as string).replace(/\n$/, ''))
      expect(output[0]).not.toHaveProperty('timestamp')
    })

    test('should ignore version when producing output', () => {
      const reporter = new GitLabReporter()
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [createMockViolation()])],
        version: '99.0.0',
      })
      reporter.report(results)
      const output = JSON.parse((consoleSpy.mock.calls[0][0] as string).replace(/\n$/, ''))
      expect(output[0]).not.toHaveProperty('version')
    })

    test('should handle zero totalFiles with violations present', () => {
      const reporter = new GitLabReporter()
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [createMockViolation()])],
        summary: {
          totalFiles: 0,
          filesWithViolations: 0,
          errorCount: 0,
          warningCount: 0,
          infoCount: 0,
          totalTime: 0,
        },
      })
      reporter.report(results)
      const output = JSON.parse((consoleSpy.mock.calls[0][0] as string).replace(/\n$/, ''))
      expect(output).toHaveLength(1)
    })
  })

  describe('source code content edge cases', () => {
    test('should handle source with only whitespace', () => {
      const reporter = new GitLabReporter()
      const violation = createMockViolation({ source: '   ' })
      const parsed = JSON.parse(reporter.format(violation))
      expect(parsed.content.body).toBe('   ')
    })

    test('should handle source with null bytes', () => {
      const reporter = new GitLabReporter()
      const violation = createMockViolation({ source: 'before\0after' })
      const output = reporter.format(violation)
      const parsed = JSON.parse(output)
      expect(parsed.content.body).toBe('before\0after')
    })

    test('should handle source with CRLF line endings', () => {
      const reporter = new GitLabReporter()
      const source = 'line1\r\nline2\r\nline3'
      const violation = createMockViolation({ source })
      const parsed = JSON.parse(reporter.format(violation))
      expect(parsed.content.body).toBe(source)
    })

    test('should handle source with mixed indentation', () => {
      const reporter = new GitLabReporter()
      const source = '\t  \t code'
      const violation = createMockViolation({ source })
      const parsed = JSON.parse(reporter.format(violation))
      expect(parsed.content.body).toBe(source)
    })
  })
})
