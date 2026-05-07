import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import * as fs from 'fs'
import * as path from 'path'
import { SonarQubeReporter } from '../../../src/reporters/sonarqube-reporter.js'
import type { AnalysisResult, FileAnalysisResult, Violation } from '../../../src/reporters/types.js'

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

describe('SonarQubeReporter', () => {
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
      const reporter = new SonarQubeReporter()
      expect(reporter.name).toBe('sonarqube')
    })

    test('should accept outputPath option', () => {
      const reporter = new SonarQubeReporter({ outputPath: './sonarqube-report.json' })
      expect(reporter.name).toBe('sonarqube')
    })

    test('should handle empty options object', () => {
      const reporter = new SonarQubeReporter({})
      expect(reporter.name).toBe('sonarqube')
    })

    test('should accept pretty option', () => {
      const reporter = new SonarQubeReporter({ pretty: true })
      expect(reporter.name).toBe('sonarqube')
    })

    test('should accept both pretty and outputPath options', () => {
      const reporter = new SonarQubeReporter({ pretty: true, outputPath: './out.json' })
      expect(reporter.name).toBe('sonarqube')
    })

    test('should ignore unknown options without error', () => {
      const reporter = new SonarQubeReporter({ verbose: true, quiet: false })
      expect(reporter.name).toBe('sonarqube')
    })
  })

  describe('format', () => {
    test('should format violation as SonarQube issue JSON', () => {
      const reporter = new SonarQubeReporter()
      const violation = createMockViolation()
      const output = reporter.format(violation)
      const parsed = JSON.parse(output)
      expect(parsed.engineId).toBe('CodeForge')
      expect(parsed.ruleId).toBe('test-rule')
      expect(parsed.primaryLocation).toBeDefined()
    })

    test('should produce valid JSON', () => {
      const reporter = new SonarQubeReporter()
      const violation = createMockViolation()
      const output = reporter.format(violation)
      expect(() => JSON.parse(output)).not.toThrow()
    })

    test('should return string from format', () => {
      const reporter = new SonarQubeReporter()
      const violation = createMockViolation()
      const output = reporter.format(violation)
      expect(typeof output).toBe('string')
    })

    test('should produce JSON that is a single object not an array', () => {
      const reporter = new SonarQubeReporter()
      const violation = createMockViolation()
      const output = reporter.format(violation)
      const parsed = JSON.parse(output)
      expect(Array.isArray(parsed)).toBe(false)
      expect(typeof parsed).toBe('object')
    })

    test('should have required top-level keys', () => {
      const reporter = new SonarQubeReporter()
      const violation = createMockViolation()
      const output = reporter.format(violation)
      const parsed = JSON.parse(output)
      expect(parsed).toHaveProperty('engineId')
      expect(parsed).toHaveProperty('ruleId')
      expect(parsed).toHaveProperty('primaryLocation')
      expect(parsed).toHaveProperty('type')
      expect(parsed).toHaveProperty('severity')
    })

    test('should have exactly five top-level keys', () => {
      const reporter = new SonarQubeReporter()
      const violation = createMockViolation()
      const output = reporter.format(violation)
      const parsed = JSON.parse(output)
      const keys = Object.keys(parsed)
      expect(keys).toHaveLength(5)
    })

    test('should set engineId to CodeForge', () => {
      const reporter = new SonarQubeReporter()
      const violation = createMockViolation()
      const output = reporter.format(violation)
      const parsed = JSON.parse(output)
      expect(parsed.engineId).toBe('CodeForge')
    })

    test('should use violation ruleId', () => {
      const reporter = new SonarQubeReporter()
      const violation = createMockViolation({ ruleId: 'no-eval' })
      const output = reporter.format(violation)
      const parsed = JSON.parse(output)
      expect(parsed.ruleId).toBe('no-eval')
    })

    test('should use violation message in primaryLocation', () => {
      const reporter = new SonarQubeReporter()
      const violation = createMockViolation({ message: 'Unexpected eval() usage' })
      const output = reporter.format(violation)
      const parsed = JSON.parse(output)
      expect(parsed.primaryLocation.message).toBe('Unexpected eval() usage')
    })

    test('should use violation filePath in primaryLocation', () => {
      const reporter = new SonarQubeReporter()
      const violation = createMockViolation({ filePath: 'src/index.ts' })
      const output = reporter.format(violation)
      const parsed = JSON.parse(output)
      expect(parsed.primaryLocation.filePath).toBe('src/index.ts')
    })

    test('should not include effortMinutes in output', () => {
      const reporter = new SonarQubeReporter()
      const violation = createMockViolation()
      const output = reporter.format(violation)
      const parsed = JSON.parse(output)
      expect(parsed).not.toHaveProperty('effortMinutes')
    })
  })

  describe('column 0-based conversion', () => {
    test('should subtract 1 from column for startColumn', () => {
      const reporter = new SonarQubeReporter()
      const violation = createMockViolation({ column: 5 })
      const output = reporter.format(violation)
      const parsed = JSON.parse(output)
      expect(parsed.primaryLocation.textRange.startColumn).toBe(4)
    })

    test('should subtract 1 from column for endColumn when no endColumn provided', () => {
      const reporter = new SonarQubeReporter()
      const violation = createMockViolation({ column: 5 })
      const output = reporter.format(violation)
      const parsed = JSON.parse(output)
      expect(parsed.primaryLocation.textRange.endColumn).toBe(4)
    })

    test('should subtract 1 from endColumn when provided', () => {
      const reporter = new SonarQubeReporter()
      const violation = createMockViolation({ column: 5, endColumn: 15 })
      const output = reporter.format(violation)
      const parsed = JSON.parse(output)
      expect(parsed.primaryLocation.textRange.startColumn).toBe(4)
      expect(parsed.primaryLocation.textRange.endColumn).toBe(14)
    })

    test('should handle column 1 becoming 0', () => {
      const reporter = new SonarQubeReporter()
      const violation = createMockViolation({ column: 1 })
      const output = reporter.format(violation)
      const parsed = JSON.parse(output)
      expect(parsed.primaryLocation.textRange.startColumn).toBe(0)
    })

    test('should not modify line numbers (lines are 1-based in both)', () => {
      const reporter = new SonarQubeReporter()
      const violation = createMockViolation({ line: 10 })
      const output = reporter.format(violation)
      const parsed = JSON.parse(output)
      expect(parsed.primaryLocation.textRange.startLine).toBe(10)
      expect(parsed.primaryLocation.textRange.endLine).toBe(10)
    })
  })

  describe('end line/column handling', () => {
    test('should use endLine when provided', () => {
      const reporter = new SonarQubeReporter()
      const violation = createMockViolation({ line: 10, endLine: 12 })
      const output = reporter.format(violation)
      const parsed = JSON.parse(output)
      expect(parsed.primaryLocation.textRange.endLine).toBe(12)
    })

    test('should use start line as endLine when not provided', () => {
      const reporter = new SonarQubeReporter()
      const violation = createMockViolation({ line: 10 })
      const output = reporter.format(violation)
      const parsed = JSON.parse(output)
      expect(parsed.primaryLocation.textRange.endLine).toBe(10)
    })

    test('should use startColumn as endColumn (adjusted) when endColumn not provided', () => {
      const reporter = new SonarQubeReporter()
      const violation = createMockViolation({ column: 5 })
      const output = reporter.format(violation)
      const parsed = JSON.parse(output)
      expect(parsed.primaryLocation.textRange.startColumn).toBe(4)
      expect(parsed.primaryLocation.textRange.endColumn).toBe(4)
    })

    test('should handle full range with endLine and endColumn', () => {
      const reporter = new SonarQubeReporter()
      const violation = createMockViolation({ line: 10, column: 5, endLine: 10, endColumn: 15 })
      const output = reporter.format(violation)
      const parsed = JSON.parse(output)
      expect(parsed.primaryLocation.textRange).toEqual({
        startLine: 10,
        startColumn: 4,
        endLine: 10,
        endColumn: 14,
      })
    })

    test('should always include all four textRange fields', () => {
      const reporter = new SonarQubeReporter()
      const violation = createMockViolation()
      const output = reporter.format(violation)
      const parsed = JSON.parse(output)
      expect(parsed.primaryLocation.textRange).toHaveProperty('startLine')
      expect(parsed.primaryLocation.textRange).toHaveProperty('startColumn')
      expect(parsed.primaryLocation.textRange).toHaveProperty('endLine')
      expect(parsed.primaryLocation.textRange).toHaveProperty('endColumn')
    })
  })

  describe('severity mapping', () => {
    test('should map error to CRITICAL', () => {
      const reporter = new SonarQubeReporter()
      const parsed = JSON.parse(reporter.format(createMockViolation({ severity: 'error' })))
      expect(parsed.severity).toBe('CRITICAL')
    })

    test('should map warning to MAJOR', () => {
      const reporter = new SonarQubeReporter()
      const parsed = JSON.parse(reporter.format(createMockViolation({ severity: 'warning' })))
      expect(parsed.severity).toBe('MAJOR')
    })

    test('should map info to MINOR', () => {
      const reporter = new SonarQubeReporter()
      const parsed = JSON.parse(reporter.format(createMockViolation({ severity: 'info' })))
      expect(parsed.severity).toBe('MINOR')
    })

    test('should produce only valid SonarQube severity values', () => {
      const reporter = new SonarQubeReporter()
      const validSeverities = ['BLOCKER', 'CRITICAL', 'INFO', 'MAJOR', 'MINOR']
      for (const sev of ['error', 'warning', 'info'] as const) {
        const parsed = JSON.parse(reporter.format(createMockViolation({ severity: sev })))
        expect(validSeverities).toContain(parsed.severity)
      }
    })

    test('should map severity independently of message content', () => {
      const reporter = new SonarQubeReporter()
      const parsed = JSON.parse(
        reporter.format(createMockViolation({ severity: 'error', message: 'This is just info' })),
      )
      expect(parsed.severity).toBe('CRITICAL')
    })

    test('should map severity independently of ruleId', () => {
      const reporter = new SonarQubeReporter()
      const parsed = JSON.parse(
        reporter.format(createMockViolation({ severity: 'warning', ruleId: 'critical-rule' })),
      )
      expect(parsed.severity).toBe('MAJOR')
    })

    test('should map multiple error violations to CRITICAL', () => {
      const reporter = new SonarQubeReporter()
      for (let i = 0; i < 5; i++) {
        const parsed = JSON.parse(
          reporter.format(createMockViolation({ severity: 'error', ruleId: `rule-${i}` })),
        )
        expect(parsed.severity).toBe('CRITICAL')
      }
    })
  })

  describe('type mapping', () => {
    test('should map error to BUG', () => {
      const reporter = new SonarQubeReporter()
      const parsed = JSON.parse(reporter.format(createMockViolation({ severity: 'error' })))
      expect(parsed.type).toBe('BUG')
    })

    test('should map warning to CODE_SMELL', () => {
      const reporter = new SonarQubeReporter()
      const parsed = JSON.parse(reporter.format(createMockViolation({ severity: 'warning' })))
      expect(parsed.type).toBe('CODE_SMELL')
    })

    test('should map info to CODE_SMELL', () => {
      const reporter = new SonarQubeReporter()
      const parsed = JSON.parse(reporter.format(createMockViolation({ severity: 'info' })))
      expect(parsed.type).toBe('CODE_SMELL')
    })

    test('should produce only valid SonarQube type values', () => {
      const reporter = new SonarQubeReporter()
      const validTypes = ['BUG', 'CODE_SMELL', 'SECURITY_HOTSPOT', 'VULNERABILITY']
      for (const sev of ['error', 'warning', 'info'] as const) {
        const parsed = JSON.parse(reporter.format(createMockViolation({ severity: sev })))
        expect(validTypes).toContain(parsed.type)
      }
    })

    test('should map type independently of message content', () => {
      const reporter = new SonarQubeReporter()
      const parsed = JSON.parse(
        reporter.format(createMockViolation({ severity: 'error', message: 'Code smell detected' })),
      )
      expect(parsed.type).toBe('BUG')
    })
  })

  describe('file path preservation', () => {
    test('should preserve relative file paths', () => {
      const reporter = new SonarQubeReporter()
      const paths = [
        'a.ts',
        'src/a.ts',
        'src/deep/nested/file.ts',
        './relative.ts',
        '/absolute/path.ts',
      ]
      for (const fp of paths) {
        const parsed = JSON.parse(reporter.format(createMockViolation({ filePath: fp })))
        expect(parsed.primaryLocation.filePath).toBe(fp)
      }
    })

    test('should preserve file path with extension', () => {
      const reporter = new SonarQubeReporter()
      const parsed = JSON.parse(reporter.format(createMockViolation({ filePath: 'component.tsx' })))
      expect(parsed.primaryLocation.filePath).toBe('component.tsx')
    })

    test('should preserve file path without extension', () => {
      const reporter = new SonarQubeReporter()
      const parsed = JSON.parse(reporter.format(createMockViolation({ filePath: 'Makefile' })))
      expect(parsed.primaryLocation.filePath).toBe('Makefile')
    })

    test('should handle unicode in file path', () => {
      const reporter = new SonarQubeReporter()
      const parsed = JSON.parse(reporter.format(createMockViolation({ filePath: 'src/文件/测试.ts' })))
      expect(parsed.primaryLocation.filePath).toBe('src/文件/测试.ts')
    })
  })

  describe('missing suggestion field', () => {
    test('should not include suggestion in output', () => {
      const reporter = new SonarQubeReporter()
      const violation = createMockViolation({ suggestion: 'Use const instead' })
      const output = reporter.format(violation)
      const parsed = JSON.parse(output)
      expect(parsed).not.toHaveProperty('suggestion')
    })

    test('should not include suggestion even when undefined', () => {
      const reporter = new SonarQubeReporter()
      const violation = createMockViolation()
      const output = reporter.format(violation)
      const parsed = JSON.parse(output)
      expect(parsed).not.toHaveProperty('suggestion')
    })
  })

  describe('report to console', () => {
    test('should output SonarQube report JSON', () => {
      const reporter = new SonarQubeReporter()
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
      expect(output.issues).toBeDefined()
      expect(output.issues).toHaveLength(1)
    })

    test('should write to stdout with newline', () => {
      const reporter = new SonarQubeReporter()
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [createMockViolation()])],
      })
      reporter.report(results)
      const written = consoleSpy.mock.calls[0][0] as string
      expect(written.endsWith('\n')).toBe(true)
    })

    test('should not write to file when no outputPath', () => {
      const reporter = new SonarQubeReporter()
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [createMockViolation()])],
      })
      reporter.report(results)
      expect(fsWriteFileSyncMock).not.toHaveBeenCalled()
    })

    test('should output compact JSON by default', () => {
      const reporter = new SonarQubeReporter()
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [createMockViolation()])],
      })
      reporter.report(results)
      const output = (consoleSpy.mock.calls[0][0] as string).replace(/\n$/, '')
      expect(output).not.toContain('\n  ')
    })

    test('should include all violations in issues array', () => {
      const reporter = new SonarQubeReporter()
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
      expect(output.issues).toHaveLength(3)
    })

    test('should include all required fields in each issue', () => {
      const reporter = new SonarQubeReporter()
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
      const issue = output.issues[0]
      expect(issue.engineId).toBeDefined()
      expect(issue.ruleId).toBeDefined()
      expect(issue.primaryLocation).toBeDefined()
      expect(issue.type).toBeDefined()
      expect(issue.severity).toBeDefined()
    })

    test('should handle severity and type mapping for all levels', () => {
      const reporter = new SonarQubeReporter()
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
      expect(output.issues[0].severity).toBe('CRITICAL')
      expect(output.issues[0].type).toBe('BUG')
      expect(output.issues[1].severity).toBe('MAJOR')
      expect(output.issues[1].type).toBe('CODE_SMELL')
      expect(output.issues[2].severity).toBe('MINOR')
      expect(output.issues[2].type).toBe('CODE_SMELL')
    })

    test('should call stdout.write exactly once', () => {
      const reporter = new SonarQubeReporter()
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [createMockViolation()])],
      })
      reporter.report(results)
      expect(consoleSpy).toHaveBeenCalledTimes(1)
    })

    test('should output valid JSON from report', () => {
      const reporter = new SonarQubeReporter()
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
  })

  describe('report to file', () => {
    test('should write to file when outputPath is provided', () => {
      const reporter = new SonarQubeReporter({ outputPath: './sonarqube-report.json' })
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
      const reporter = new SonarQubeReporter({ outputPath: './reports/nested/sonarqube-report.json' })
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
      const reporter = new SonarQubeReporter({ outputPath: './reports/sonarqube-report.json' })
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
      const reporter = new SonarQubeReporter({ outputPath: './sonarqube-report.json' })
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
      expect(parsed.issues[0].ruleId).toBe('my-rule')
      expect(parsed.issues[0].engineId).toBe('CodeForge')
    })

    test('should write SonarQube report object to file', () => {
      const reporter = new SonarQubeReporter({ outputPath: './sonarqube-report.json' })
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
      expect(parsed).toHaveProperty('issues')
      expect(Array.isArray(parsed.issues)).toBe(true)
    })

    test('should not write to stdout when writing to file', () => {
      const reporter = new SonarQubeReporter({ outputPath: './sonarqube-report.json' })
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [createMockViolation()])],
      })
      fsExistsSyncMock.mockReturnValue(true)
      reporter.report(results)
      expect(consoleSpy).not.toHaveBeenCalled()
    })

    test('should write pretty JSON to file when pretty is true', () => {
      const reporter = new SonarQubeReporter({ outputPath: './out.json', pretty: true })
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [createMockViolation()])],
      })
      fsExistsSyncMock.mockReturnValue(true)
      reporter.report(results)
      const written = fsWriteFileSyncMock.mock.calls[0][1] as string
      expect(written).toContain('\n  ')
    })

    test('should write compact JSON to file when pretty is false', () => {
      const reporter = new SonarQubeReporter({ outputPath: './out.json', pretty: false })
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [createMockViolation()])],
      })
      fsExistsSyncMock.mockReturnValue(true)
      reporter.report(results)
      const written = fsWriteFileSyncMock.mock.calls[0][1] as string
      expect(written).not.toContain('\n  ')
    })

    test('should write all violations from all files', () => {
      const reporter = new SonarQubeReporter({ outputPath: './out.json' })
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
      expect(JSON.parse(written).issues).toHaveLength(3)
    })
  })

  describe('empty results', () => {
    test('should output empty issues array when no violations', () => {
      const reporter = new SonarQubeReporter()
      const results = createMockAnalysisResult({ files: [] })
      reporter.report(results)
      const output = JSON.parse((consoleSpy.mock.calls[0][0] as string).replace(/\n$/, ''))
      expect(output.issues).toEqual([])
    })

    test('should write empty issues array to file', () => {
      const reporter = new SonarQubeReporter({ outputPath: './out.json' })
      const results = createMockAnalysisResult({ files: [] })
      fsExistsSyncMock.mockReturnValue(true)
      reporter.report(results)
      const written = fsWriteFileSyncMock.mock.calls[0][1] as string
      expect(JSON.parse(written)).toEqual({ issues: [] })
    })

    test('should handle files with empty violations array', () => {
      const reporter = new SonarQubeReporter()
      const results = createMockAnalysisResult({
        files: [
          createMockFileResult('a.ts', []),
          createMockFileResult('b.ts', []),
        ],
      })
      reporter.report(results)
      const output = JSON.parse((consoleSpy.mock.calls[0][0] as string).replace(/\n$/, ''))
      expect(output.issues).toEqual([])
    })
  })

  describe('multiple violations across multiple files', () => {
    test('should include violations from all files in order', () => {
      const reporter = new SonarQubeReporter()
      const results = createMockAnalysisResult({
        files: [
          createMockFileResult('a.ts', [
            createMockViolation({ filePath: 'a.ts', ruleId: 'r1' }),
            createMockViolation({ filePath: 'a.ts', ruleId: 'r2' }),
          ]),
          createMockFileResult('b.ts', [createMockViolation({ filePath: 'b.ts', ruleId: 'r3' })]),
          createMockFileResult('c.ts', [createMockViolation({ filePath: 'c.ts', ruleId: 'r4' })]),
        ],
      })
      reporter.report(results)
      const output = JSON.parse((consoleSpy.mock.calls[0][0] as string).replace(/\n$/, ''))
      expect(output.issues).toHaveLength(4)
      expect(output.issues[0].primaryLocation.filePath).toBe('a.ts')
      expect(output.issues[0].ruleId).toBe('r1')
      expect(output.issues[1].primaryLocation.filePath).toBe('a.ts')
      expect(output.issues[1].ruleId).toBe('r2')
      expect(output.issues[2].primaryLocation.filePath).toBe('b.ts')
      expect(output.issues[3].primaryLocation.filePath).toBe('c.ts')
    })

    test('should handle file with multiple violations of different severities', () => {
      const reporter = new SonarQubeReporter()
      const violations = [
        createMockViolation({ line: 1, ruleId: 'r1', severity: 'error' }),
        createMockViolation({ line: 5, ruleId: 'r2', severity: 'warning' }),
        createMockViolation({ line: 10, ruleId: 'r3', severity: 'info' }),
      ]
      const results = createMockAnalysisResult({
        files: [createMockFileResult('multi.ts', violations)],
      })
      reporter.report(results)
      const output = JSON.parse((consoleSpy.mock.calls[0][0] as string).replace(/\n$/, ''))
      expect(output.issues).toHaveLength(3)
      expect(output.issues[0].severity).toBe('CRITICAL')
      expect(output.issues[0].type).toBe('BUG')
      expect(output.issues[1].severity).toBe('MAJOR')
      expect(output.issues[1].type).toBe('CODE_SMELL')
      expect(output.issues[2].severity).toBe('MINOR')
      expect(output.issues[2].type).toBe('CODE_SMELL')
    })
  })

  describe('pretty output', () => {
    test('should produce indented JSON when pretty is true', () => {
      const reporter = new SonarQubeReporter({ pretty: true })
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [createMockViolation()])],
      })
      reporter.report(results)
      const output = (consoleSpy.mock.calls[0][0] as string).replace(/\n$/, '')
      expect(output).toContain('  "issues"')
      expect(output).toContain('    "engineId"')
    })

    test('should produce indented JSON to file when pretty is true', () => {
      const reporter = new SonarQubeReporter({ pretty: true, outputPath: './out.json' })
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [createMockViolation()])],
      })
      fsExistsSyncMock.mockReturnValue(true)
      reporter.report(results)
      const written = fsWriteFileSyncMock.mock.calls[0][1] as string
      expect(written).toContain('  "issues"')
    })

    test('should produce single-line JSON when pretty is false', () => {
      const reporter = new SonarQubeReporter({ pretty: false })
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [createMockViolation()])],
      })
      reporter.report(results)
      const output = (consoleSpy.mock.calls[0][0] as string).replace(/\n$/, '')
      const lines = output.split('\n')
      expect(lines.length).toBe(1)
    })

    test('should use 2-space indentation in pretty mode', () => {
      const reporter = new SonarQubeReporter({ pretty: true })
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [createMockViolation()])],
      })
      reporter.report(results)
      const output = (consoleSpy.mock.calls[0][0] as string).replace(/\n$/, '')
      expect(output).toContain('    "engineId"')
      expect(output).toContain('    "ruleId"')
    })

    test('pretty output should still be valid JSON', () => {
      const reporter = new SonarQubeReporter({ pretty: true })
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [createMockViolation()])],
      })
      reporter.report(results)
      const output = (consoleSpy.mock.calls[0][0] as string).replace(/\n$/, '')
      expect(() => JSON.parse(output)).not.toThrow()
    })

    test('should set pretty to false by default', () => {
      const reporter = new SonarQubeReporter()
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [createMockViolation()])],
      })
      reporter.report(results)
      const output = (consoleSpy.mock.calls[0][0] as string).replace(/\n$/, '')
      expect(output).not.toContain('\n  ')
    })
  })

  describe('edge cases', () => {
    test('should handle violation without optional fields', () => {
      const reporter = new SonarQubeReporter()
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
      expect(parsed.engineId).toBe('CodeForge')
      expect(parsed.ruleId).toBe('minimal')
      expect(parsed.primaryLocation.message).toBe('Minimal violation')
      expect(parsed.primaryLocation.textRange.startColumn).toBe(0)
    })

    test('should handle special characters in violation message', () => {
      const reporter = new SonarQubeReporter()
      const violation = createMockViolation({
        message: 'Error: "quotes" and \'apostrophes\' with \n newlines \t tabs',
      })
      const output = reporter.format(violation)
      expect(() => JSON.parse(output)).not.toThrow()
    })

    test('should handle deeply nested output path', () => {
      const reporter = new SonarQubeReporter({
        outputPath: './reports/2024/01/15/deep/nested/sonarqube-report.json',
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

    test('should handle violation with meta field', () => {
      const reporter = new SonarQubeReporter()
      const violation = createMockViolation({ meta: { category: 'security' } })
      const output = reporter.format(violation)
      const parsed = JSON.parse(output)
      expect(parsed).not.toHaveProperty('meta')
    })
  })
})
