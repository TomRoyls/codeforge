import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import * as fs from 'fs'
import * as path from 'path'
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

describe('GitLabReporter', () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>
  let fsExistsSyncMock: ReturnType<typeof vi.fn>
  let fsMkdirSyncMock: ReturnType<typeof vi.fn>
  let fsWriteFileSyncMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
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
      const output = JSON.parse(consoleSpy.mock.calls[0][0] as string)
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
      const output = JSON.parse(consoleSpy.mock.calls[0][0] as string)
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
      const output = JSON.parse(consoleSpy.mock.calls[0][0] as string)
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
      const output = JSON.parse(consoleSpy.mock.calls[0][0] as string)
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
      const output = JSON.parse(consoleSpy.mock.calls[0][0] as string)
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
      const output = JSON.parse(consoleSpy.mock.calls[0][0] as string)
      expect(output[0].location.lines.begin).toBe(42)
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
      const output = JSON.parse(consoleSpy.mock.calls[0][0] as string)
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
  })
})
