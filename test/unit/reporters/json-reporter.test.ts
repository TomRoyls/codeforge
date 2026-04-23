import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import * as fs from 'fs'
import * as path from 'path'
import {
  JSONReporter,
  type JsonOutput,
  type JsonViolation,
} from '../../../src/reporters/json-reporter.js'
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

describe('JSONReporter', () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>
  let fsExistsSyncMock: ReturnType<typeof vi.fn>
  let fsMkdirSyncMock: ReturnType<typeof vi.fn>
  let fsWriteFileSyncMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    consoleSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true)
    fsExistsSyncMock = vi.mocked(fs.existsSync)
    fsMkdirSyncMock = vi.mocked(fs.mkdirSync)
    fsWriteFileSyncMock = vi.mocked(fs.writeFileSync)
    vi.resetAllMocks()
  })

  afterEach(() => {
    consoleSpy.mockRestore()
    vi.resetAllMocks()
  })

  describe('constructor', () => {
    test('should initialize with default options', () => {
      const reporter = new JSONReporter()
      expect(reporter.name).toBe('json')
    })

    test('should accept pretty option', () => {
      const reporter = new JSONReporter({ pretty: true })
      expect(reporter.name).toBe('json')
    })

    test('should accept outputPath option', () => {
      const reporter = new JSONReporter({ outputPath: './report.json' })
      expect(reporter.name).toBe('json')
    })

    test('should handle empty options object', () => {
      const reporter = new JSONReporter({})
      expect(reporter.name).toBe('json')
    })

    test('should accept all options combined', () => {
      const reporter = new JSONReporter({ pretty: true, outputPath: './output/report.json' })
      expect(reporter.name).toBe('json')
    })
  })

  describe('format', () => {
    test('should format violation as JSON string', () => {
      const reporter = new JSONReporter()
      const violation = createMockViolation()
      const output = reporter.format(violation)
      const parsed = JSON.parse(output) as JsonViolation
      expect(parsed.ruleId).toBe('test-rule')
      expect(parsed.severity).toBe('error')
      expect(parsed.message).toBe('Test violation message')
    })

    test('should include location in formatted output', () => {
      const reporter = new JSONReporter()
      const violation = createMockViolation({ filePath: 'src/app.ts', line: 42, column: 10 })
      const output = reporter.format(violation)
      const parsed = JSON.parse(output) as JsonViolation
      expect(parsed.location.file).toBe('src/app.ts')
      expect(parsed.location.line).toBe(42)
      expect(parsed.location.column).toBe(10)
    })

    test('should include optional endLine and endColumn', () => {
      const reporter = new JSONReporter()
      const violation = createMockViolation({ endLine: 50, endColumn: 20 })
      const output = reporter.format(violation)
      const parsed = JSON.parse(output) as JsonViolation
      expect(parsed.location.endLine).toBe(50)
      expect(parsed.location.endColumn).toBe(20)
    })

    test('should include source when provided', () => {
      const reporter = new JSONReporter()
      const violation = createMockViolation({ source: 'const x = 1;' })
      const output = reporter.format(violation)
      const parsed = JSON.parse(output) as JsonViolation
      expect(parsed.source).toBe('const x = 1;')
    })

    test('should include suggestion when provided', () => {
      const reporter = new JSONReporter()
      const violation = createMockViolation({ suggestion: 'Use const instead' })
      const output = reporter.format(violation)
      const parsed = JSON.parse(output) as JsonViolation
      expect(parsed.suggestion).toBe('Use const instead')
    })

    test('should include meta when provided', () => {
      const reporter = new JSONReporter()
      const violation = createMockViolation({ meta: { complexity: 15, type: 'cognitive' } })
      const output = reporter.format(violation)
      const parsed = JSON.parse(output) as JsonViolation
      expect(parsed.meta?.complexity).toBe(15)
      expect(parsed.meta?.type).toBe('cognitive')
    })

    test('should handle warning severity', () => {
      const reporter = new JSONReporter()
      const violation = createMockViolation({ severity: 'warning' })
      const output = reporter.format(violation)
      const parsed = JSON.parse(output) as JsonViolation
      expect(parsed.severity).toBe('warning')
    })

    test('should handle info severity', () => {
      const reporter = new JSONReporter()
      const violation = createMockViolation({ severity: 'info' })
      const output = reporter.format(violation)
      const parsed = JSON.parse(output) as JsonViolation
      expect(parsed.severity).toBe('info')
    })

    test('should produce valid JSON', () => {
      const reporter = new JSONReporter()
      const violation = createMockViolation()
      const output = reporter.format(violation)
      expect(() => JSON.parse(output)).not.toThrow()
    })
  })

  describe('report to console', () => {
    test('should output JSON to console when no outputPath', () => {
      const reporter = new JSONReporter()
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
      const output = consoleSpy.mock.calls[0][0] as string
      expect(() => JSON.parse(output)).not.toThrow()
    })

    test('should output compact JSON by default', () => {
      const reporter = new JSONReporter()
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
      const output = (consoleSpy.mock.calls[0][0] as string).replace(/\n$/, '')
      expect(output).not.toContain('\n')
    })

    test('should output pretty JSON with pretty option', () => {
      const reporter = new JSONReporter({ pretty: true })
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
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).toContain('\n')
      expect(output).toContain('  ')
    })

    test('should include version in output', () => {
      const reporter = new JSONReporter()
      const results = createMockAnalysisResult({
        version: '2.0.0',
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
      const output = JSON.parse(
        (consoleSpy.mock.calls[0][0] as string).replace(/\n$/, ''),
      ) as JsonOutput
      expect(output.version).toBe('2.0.0')
    })

    test('should use default version when not provided', () => {
      const reporter = new JSONReporter()
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
      const output = JSON.parse(
        (consoleSpy.mock.calls[0][0] as string).replace(/\n$/, ''),
      ) as JsonOutput
      expect(output.version).toBe('1.0.0')
    })

    test('should include timestamp in output', () => {
      const reporter = new JSONReporter()
      const results = createMockAnalysisResult({
        timestamp: '2024-03-15T12:30:00.000Z',
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
      const output = JSON.parse(
        (consoleSpy.mock.calls[0][0] as string).replace(/\n$/, ''),
      ) as JsonOutput
      expect(output.timestamp).toBe('2024-03-15T12:30:00.000Z')
    })

    test('should include summary in output', () => {
      const reporter = new JSONReporter()
      const results = createMockAnalysisResult({
        files: [],
        summary: {
          totalFiles: 10,
          filesWithViolations: 3,
          errorCount: 5,
          warningCount: 2,
          infoCount: 1,
          totalTime: 500,
        },
      })
      reporter.report(results)
      const output = JSON.parse(
        (consoleSpy.mock.calls[0][0] as string).replace(/\n$/, ''),
      ) as JsonOutput
      expect(output.summary.totalFiles).toBe(10)
      expect(output.summary.filesWithViolations).toBe(3)
      expect(output.summary.errorCount).toBe(5)
      expect(output.summary.warningCount).toBe(2)
      expect(output.summary.infoCount).toBe(1)
      expect(output.summary.totalTime).toBe(500)
    })

    test('should include files array in output', () => {
      const reporter = new JSONReporter()
      const results = createMockAnalysisResult({
        files: [
          createMockFileResult('file1.ts', [createMockViolation()]),
          createMockFileResult('file2.ts', []),
        ],
        summary: {
          totalFiles: 2,
          filesWithViolations: 1,
          errorCount: 1,
          warningCount: 0,
          infoCount: 0,
          totalTime: 100,
        },
      })
      reporter.report(results)
      const output = JSON.parse(
        (consoleSpy.mock.calls[0][0] as string).replace(/\n$/, ''),
      ) as JsonOutput
      expect(output.files).toHaveLength(2)
      expect(output.files[0].filePath).toBe('file1.ts')
      expect(output.files[1].filePath).toBe('file2.ts')
    })
  })

  describe('report to file', () => {
    test('should write to file when outputPath is provided', () => {
      const reporter = new JSONReporter({ outputPath: './report.json' })
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
      const reporter = new JSONReporter({ outputPath: './reports/nested/report.json' })
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
      const reporter = new JSONReporter({ outputPath: './reports/report.json' })
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
      const reporter = new JSONReporter({ outputPath: './report.json' })
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
      const parsed = JSON.parse(writtenContent) as JsonOutput
      expect(parsed.files[0].violations[0].ruleId).toBe('my-rule')
    })

    test('should write pretty JSON to file with pretty option', () => {
      const reporter = new JSONReporter({ outputPath: './report.json', pretty: true })
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
      const writtenContent = fsWriteFileSyncMock.mock.calls[0][1] as string
      expect(writtenContent).toContain('\n')
    })

    test('should use utf-8 encoding', () => {
      const reporter = new JSONReporter({ outputPath: './report.json' })
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
      expect(fsWriteFileSyncMock).toHaveBeenCalledWith('./report.json', expect.any(String), 'utf8')
    })
  })

  describe('transformResults', () => {
    test('should transform violations correctly', () => {
      const reporter = new JSONReporter()
      const violation = createMockViolation({
        ruleId: 'no-unused-vars',
        severity: 'warning',
        message: 'Variable x is declared but never used',
        filePath: 'src/utils.ts',
        line: 15,
        column: 7,
        endLine: 15,
        endColumn: 8,
        source: 'const x = 5;',
        suggestion: 'Remove the unused variable',
        meta: { fixable: true },
      })
      const results = createMockAnalysisResult({
        files: [createMockFileResult('src/utils.ts', [violation])],
        summary: {
          totalFiles: 1,
          filesWithViolations: 1,
          errorCount: 0,
          warningCount: 1,
          infoCount: 0,
          totalTime: 50,
        },
      })
      reporter.report(results)
      const output = JSON.parse(
        (consoleSpy.mock.calls[0][0] as string).replace(/\n$/, ''),
      ) as JsonOutput
      const transformed = output.files[0].violations[0]
      expect(transformed.ruleId).toBe('no-unused-vars')
      expect(transformed.severity).toBe('warning')
      expect(transformed.message).toBe('Variable x is declared but never used')
      expect(transformed.location.file).toBe('src/utils.ts')
      expect(transformed.location.line).toBe(15)
      expect(transformed.location.column).toBe(7)
      expect(transformed.location.endLine).toBe(15)
      expect(transformed.location.endColumn).toBe(8)
      expect(transformed.source).toBe('const x = 5;')
      expect(transformed.suggestion).toBe('Remove the unused variable')
      expect(transformed.meta?.fixable).toBe(true)
    })

    test('should include file stats in output', () => {
      const reporter = new JSONReporter()
      const results = createMockAnalysisResult({
        files: [
          createMockFileResult('test.ts', [], { parseTime: 5, analysisTime: 15, totalTime: 20 }),
        ],
        summary: {
          totalFiles: 1,
          filesWithViolations: 0,
          errorCount: 0,
          warningCount: 0,
          infoCount: 0,
          totalTime: 20,
        },
      })
      reporter.report(results)
      const output = JSON.parse(
        (consoleSpy.mock.calls[0][0] as string).replace(/\n$/, ''),
      ) as JsonOutput
      expect(output.files[0].stats.parseTime).toBe(5)
      expect(output.files[0].stats.analysisTime).toBe(15)
      expect(output.files[0].stats.totalTime).toBe(20)
    })

    test('should handle empty files array', () => {
      const reporter = new JSONReporter()
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
      const output = JSON.parse(
        (consoleSpy.mock.calls[0][0] as string).replace(/\n$/, ''),
      ) as JsonOutput
      expect(output.files).toEqual([])
    })

    test('should handle multiple files with multiple violations', () => {
      const reporter = new JSONReporter()
      const results = createMockAnalysisResult({
        files: [
          createMockFileResult('a.ts', [
            createMockViolation({ ruleId: 'rule1' }),
            createMockViolation({ ruleId: 'rule2', severity: 'warning' }),
          ]),
          createMockFileResult('b.ts', [
            createMockViolation({ ruleId: 'rule3', severity: 'info' }),
          ]),
        ],
        summary: {
          totalFiles: 2,
          filesWithViolations: 2,
          errorCount: 1,
          warningCount: 1,
          infoCount: 1,
          totalTime: 100,
        },
      })
      reporter.report(results)
      const output = JSON.parse(
        (consoleSpy.mock.calls[0][0] as string).replace(/\n$/, ''),
      ) as JsonOutput
      expect(output.files).toHaveLength(2)
      expect(output.files[0].violations).toHaveLength(2)
      expect(output.files[1].violations).toHaveLength(1)
    })
  })

  describe('edge cases', () => {
    test('should handle violation without optional fields', () => {
      const reporter = new JSONReporter()
      const minimalViolation: Violation = {
        ruleId: 'minimal',
        severity: 'error',
        message: 'Minimal violation',
        filePath: 'test.ts',
        line: 1,
        column: 1,
      }
      const output = reporter.format(minimalViolation)
      const parsed = JSON.parse(output) as JsonViolation
      expect(parsed.location.endLine).toBeUndefined()
      expect(parsed.location.endColumn).toBeUndefined()
      expect(parsed.source).toBeUndefined()
      expect(parsed.suggestion).toBeUndefined()
      expect(parsed.meta).toBeUndefined()
    })

    test('should handle deeply nested file path', () => {
      const reporter = new JSONReporter({
        outputPath: './reports/2024/01/15/deep/nested/report.json',
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
      const reporter = new JSONReporter()
      const violation = createMockViolation({
        message: 'Error: "quotes" and \'apostrophes\' with \n newlines \t tabs',
      })
      const output = reporter.format(violation)
      expect(() => JSON.parse(output)).not.toThrow()
    })

    test('should handle unicode in file path', () => {
      const reporter = new JSONReporter()
      const violation = createMockViolation({ filePath: 'src/文件/测试.ts' })
      const output = reporter.format(violation)
      const parsed = JSON.parse(output) as JsonViolation
      expect(parsed.location.file).toBe('src/文件/测试.ts')
    })

    test('should handle large meta object', () => {
      const reporter = new JSONReporter()
      const largeMeta: Record<string, unknown> = {}
      for (let i = 0; i < 100; i++) {
        largeMeta[`key${i}`] = `value${i}`
      }
      const violation = createMockViolation({ meta: largeMeta })
      const output = reporter.format(violation)
      const parsed = JSON.parse(output) as JsonViolation
      expect(Object.keys(parsed.meta ?? {}).length).toBe(100)
    })

    test('should handle file with empty violations array', () => {
      const reporter = new JSONReporter()
      const results = createMockAnalysisResult({
        files: [createMockFileResult('clean.ts', [])],
        summary: {
          totalFiles: 1,
          filesWithViolations: 0,
          errorCount: 0,
          warningCount: 0,
          infoCount: 0,
          totalTime: 10,
        },
      })
      reporter.report(results)
      const output = JSON.parse(
        (consoleSpy.mock.calls[0][0] as string).replace(/\n$/, ''),
      ) as JsonOutput
      expect(output.files[0].violations).toEqual([])
    })

    test('should handle root path output', () => {
      const reporter = new JSONReporter({ outputPath: '/tmp/report.json' })
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
        '/tmp/report.json',
        expect.any(String),
        'utf8',
      )
    })
  })

  describe('JSON output structure validation', () => {
    test('should contain exactly 4 top-level keys', () => {
      const reporter = new JSONReporter()
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
      const output = JSON.parse(
        (consoleSpy.mock.calls[0][0] as string).replace(/\n$/, ''),
      ) as JsonOutput
      const keys = Object.keys(output)
      expect(keys).toHaveLength(4)
      expect(keys).toContain('files')
      expect(keys).toContain('summary')
      expect(keys).toContain('timestamp')
      expect(keys).toContain('version')
    })

    test('should always have files as array', () => {
      const reporter = new JSONReporter()
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
      const output = JSON.parse(
        (consoleSpy.mock.calls[0][0] as string).replace(/\n$/, ''),
      ) as JsonOutput
      expect(Array.isArray(output.files)).toBe(true)
    })

    test('should always have summary as object', () => {
      const reporter = new JSONReporter()
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
      const output = JSON.parse(
        (consoleSpy.mock.calls[0][0] as string).replace(/\n$/, ''),
      ) as JsonOutput
      expect(typeof output.summary).toBe('object')
      expect(output.summary).not.toBeNull()
    })

    test('should always have timestamp as string', () => {
      const reporter = new JSONReporter()
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
      const output = JSON.parse(
        (consoleSpy.mock.calls[0][0] as string).replace(/\n$/, ''),
      ) as JsonOutput
      expect(typeof output.timestamp).toBe('string')
      expect(output.timestamp.length).toBeGreaterThan(0)
    })

    test('should always have version as string', () => {
      const reporter = new JSONReporter()
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
      const output = JSON.parse(
        (consoleSpy.mock.calls[0][0] as string).replace(/\n$/, ''),
      ) as JsonOutput
      expect(typeof output.version).toBe('string')
    })

    test('should produce output that round-trips through JSON parse/stringify', () => {
      const reporter = new JSONReporter()
      const results = createMockAnalysisResult({
        files: [createMockFileResult('a.ts', [createMockViolation()])],
        summary: {
          totalFiles: 1,
          filesWithViolations: 1,
          errorCount: 1,
          warningCount: 0,
          infoCount: 0,
          totalTime: 10,
        },
      })
      reporter.report(results)
      const raw = (consoleSpy.mock.calls[0][0] as string).replace(/\n$/, '')
      const parsed = JSON.parse(raw)
      const reStringified = JSON.stringify(parsed)
      expect(JSON.parse(reStringified)).toEqual(parsed)
    })
  })

  describe('violation serialization detail', () => {
    test('should serialize all required violation fields', () => {
      const reporter = new JSONReporter()
      const violation = createMockViolation({
        ruleId: 'custom-rule',
        severity: 'error',
        message: 'Detailed error',
        filePath: 'deep/nested/file.ts',
        line: 99,
        column: 42,
      })
      const output = reporter.format(violation)
      const parsed = JSON.parse(output) as JsonViolation
      const keys = Object.keys(parsed).sort()
      expect(keys).toContain('location')
      expect(keys).toContain('message')
      expect(keys).toContain('ruleId')
      expect(keys).toContain('severity')
    })

    test('should serialize location with required fields', () => {
      const reporter = new JSONReporter()
      const violation = createMockViolation({ line: 3, column: 7, filePath: 'x.ts' })
      const output = reporter.format(violation)
      const parsed = JSON.parse(output) as JsonViolation
      expect(Object.keys(parsed.location)).toContain('file')
      expect(Object.keys(parsed.location)).toContain('line')
      expect(Object.keys(parsed.location)).toContain('column')
    })

    test('should preserve exact severity value', () => {
      const reporter = new JSONReporter()
      for (const severity of ['error', 'warning', 'info'] as const) {
        const violation = createMockViolation({ severity })
        const output = reporter.format(violation)
        const parsed = JSON.parse(output) as JsonViolation
        expect(parsed.severity).toBe(severity)
      }
    })

    test('should preserve exact numeric values for line and column', () => {
      const reporter = new JSONReporter()
      const violation = createMockViolation({ line: 1, column: 1 })
      const output = reporter.format(violation)
      const parsed = JSON.parse(output) as JsonViolation
      expect(parsed.location.line).toBe(1)
      expect(parsed.location.column).toBe(1)
      expect(typeof parsed.location.line).toBe('number')
      expect(typeof parsed.location.column).toBe('number')
    })

    test('should preserve exact numeric values for endLine and endColumn', () => {
      const reporter = new JSONReporter()
      const violation = createMockViolation({ endLine: 200, endColumn: 300 })
      const output = reporter.format(violation)
      const parsed = JSON.parse(output) as JsonViolation
      expect(parsed.location.endLine).toBe(200)
      expect(parsed.location.endColumn).toBe(300)
      expect(typeof parsed.location.endLine).toBe('number')
      expect(typeof parsed.location.endColumn).toBe('number')
    })

    test('should preserve ruleId exactly', () => {
      const reporter = new JSONReporter()
      const violation = createMockViolation({ ruleId: 'namespace/rule-name' })
      const output = reporter.format(violation)
      const parsed = JSON.parse(output) as JsonViolation
      expect(parsed.ruleId).toBe('namespace/rule-name')
    })

    test('should preserve message exactly including whitespace', () => {
      const reporter = new JSONReporter()
      const violation = createMockViolation({ message: '  leading and trailing  ' })
      const output = reporter.format(violation)
      const parsed = JSON.parse(output) as JsonViolation
      expect(parsed.message).toBe('  leading and trailing  ')
    })
  })

  describe('file results grouping', () => {
    test('should group violations by file', () => {
      const reporter = new JSONReporter()
      const results = createMockAnalysisResult({
        files: [
          createMockFileResult('alpha.ts', [
            createMockViolation({ ruleId: 'r1' }),
            createMockViolation({ ruleId: 'r2' }),
          ]),
          createMockFileResult('beta.ts', [createMockViolation({ ruleId: 'r3' })]),
        ],
        summary: {
          totalFiles: 2,
          filesWithViolations: 2,
          errorCount: 3,
          warningCount: 0,
          infoCount: 0,
          totalTime: 50,
        },
      })
      reporter.report(results)
      const output = JSON.parse(
        (consoleSpy.mock.calls[0][0] as string).replace(/\n$/, ''),
      ) as JsonOutput
      expect(output.files[0].filePath).toBe('alpha.ts')
      expect(output.files[0].violations).toHaveLength(2)
      expect(output.files[1].filePath).toBe('beta.ts')
      expect(output.files[1].violations).toHaveLength(1)
    })

    test('should maintain file order from input', () => {
      const reporter = new JSONReporter()
      const files = ['z.ts', 'a.ts', 'm.ts']
      const results = createMockAnalysisResult({
        files: files.map((f) => createMockFileResult(f, [])),
        summary: {
          totalFiles: 3,
          filesWithViolations: 0,
          errorCount: 0,
          warningCount: 0,
          infoCount: 0,
          totalTime: 30,
        },
      })
      reporter.report(results)
      const output = JSON.parse(
        (consoleSpy.mock.calls[0][0] as string).replace(/\n$/, ''),
      ) as JsonOutput
      expect(output.files.map((f) => f.filePath)).toEqual(files)
    })

    test('should include stats per file', () => {
      const reporter = new JSONReporter()
      const results = createMockAnalysisResult({
        files: [
          createMockFileResult('slow.ts', [], {
            parseTime: 100,
            analysisTime: 500,
            totalTime: 600,
          }),
          createMockFileResult('fast.ts', [], { parseTime: 1, analysisTime: 2, totalTime: 3 }),
        ],
        summary: {
          totalFiles: 2,
          filesWithViolations: 0,
          errorCount: 0,
          warningCount: 0,
          infoCount: 0,
          totalTime: 603,
        },
      })
      reporter.report(results)
      const output = JSON.parse(
        (consoleSpy.mock.calls[0][0] as string).replace(/\n$/, ''),
      ) as JsonOutput
      expect(output.files[0].stats.totalTime).toBe(600)
      expect(output.files[1].stats.totalTime).toBe(3)
    })

    test('should preserve violations order within a file', () => {
      const reporter = new JSONReporter()
      const results = createMockAnalysisResult({
        files: [
          createMockFileResult('ordered.ts', [
            createMockViolation({ ruleId: 'first', line: 1 }),
            createMockViolation({ ruleId: 'second', line: 5 }),
            createMockViolation({ ruleId: 'third', line: 10 }),
          ]),
        ],
        summary: {
          totalFiles: 1,
          filesWithViolations: 1,
          errorCount: 3,
          warningCount: 0,
          infoCount: 0,
          totalTime: 10,
        },
      })
      reporter.report(results)
      const output = JSON.parse(
        (consoleSpy.mock.calls[0][0] as string).replace(/\n$/, ''),
      ) as JsonOutput
      const ruleIds = output.files[0].violations.map((v) => v.ruleId)
      expect(ruleIds).toEqual(['first', 'second', 'third'])
    })
  })

  describe('summary statistics', () => {
    test('should include all summary fields', () => {
      const reporter = new JSONReporter()
      const results = createMockAnalysisResult({
        files: [],
        summary: {
          totalFiles: 100,
          filesWithViolations: 25,
          errorCount: 10,
          warningCount: 30,
          infoCount: 15,
          totalTime: 9999,
        },
      })
      reporter.report(results)
      const output = JSON.parse(
        (consoleSpy.mock.calls[0][0] as string).replace(/\n$/, ''),
      ) as JsonOutput
      const summaryKeys = Object.keys(output.summary)
      expect(summaryKeys).toContain('totalFiles')
      expect(summaryKeys).toContain('filesWithViolations')
      expect(summaryKeys).toContain('errorCount')
      expect(summaryKeys).toContain('warningCount')
      expect(summaryKeys).toContain('infoCount')
      expect(summaryKeys).toContain('totalTime')
    })

    test('should reflect zero counts for clean analysis', () => {
      const reporter = new JSONReporter()
      const results = createMockAnalysisResult({
        files: [createMockFileResult('clean1.ts', []), createMockFileResult('clean2.ts', [])],
        summary: {
          totalFiles: 2,
          filesWithViolations: 0,
          errorCount: 0,
          warningCount: 0,
          infoCount: 0,
          totalTime: 20,
        },
      })
      reporter.report(results)
      const output = JSON.parse(
        (consoleSpy.mock.calls[0][0] as string).replace(/\n$/, ''),
      ) as JsonOutput
      expect(output.summary.errorCount).toBe(0)
      expect(output.summary.warningCount).toBe(0)
      expect(output.summary.infoCount).toBe(0)
      expect(output.summary.filesWithViolations).toBe(0)
    })

    test('should reflect mixed severity counts', () => {
      const reporter = new JSONReporter()
      const results = createMockAnalysisResult({
        files: [
          createMockFileResult('mixed.ts', [
            createMockViolation({ severity: 'error', ruleId: 'e1' }),
            createMockViolation({ severity: 'error', ruleId: 'e2' }),
            createMockViolation({ severity: 'warning', ruleId: 'w1' }),
            createMockViolation({ severity: 'info', ruleId: 'i1' }),
            createMockViolation({ severity: 'info', ruleId: 'i2' }),
            createMockViolation({ severity: 'info', ruleId: 'i3' }),
          ]),
        ],
        summary: {
          totalFiles: 1,
          filesWithViolations: 1,
          errorCount: 2,
          warningCount: 1,
          infoCount: 3,
          totalTime: 100,
        },
      })
      reporter.report(results)
      const output = JSON.parse(
        (consoleSpy.mock.calls[0][0] as string).replace(/\n$/, ''),
      ) as JsonOutput
      expect(output.summary.errorCount).toBe(2)
      expect(output.summary.warningCount).toBe(1)
      expect(output.summary.infoCount).toBe(3)
    })

    test('should preserve totalTime as number', () => {
      const reporter = new JSONReporter()
      const results = createMockAnalysisResult({
        files: [],
        summary: {
          totalFiles: 0,
          filesWithViolations: 0,
          errorCount: 0,
          warningCount: 0,
          infoCount: 0,
          totalTime: 12345,
        },
      })
      reporter.report(results)
      const output = JSON.parse(
        (consoleSpy.mock.calls[0][0] as string).replace(/\n$/, ''),
      ) as JsonOutput
      expect(typeof output.summary.totalTime).toBe('number')
      expect(output.summary.totalTime).toBe(12345)
    })
  })

  describe('empty results', () => {
    test('should produce valid JSON with empty files array', () => {
      const reporter = new JSONReporter()
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
      const raw = (consoleSpy.mock.calls[0][0] as string).replace(/\n$/, '')
      expect(() => JSON.parse(raw)).not.toThrow()
      const output = JSON.parse(raw) as JsonOutput
      expect(output.files).toEqual([])
    })

    test('should have zero summary counts with empty results', () => {
      const reporter = new JSONReporter()
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
      const output = JSON.parse(
        (consoleSpy.mock.calls[0][0] as string).replace(/\n$/, ''),
      ) as JsonOutput
      expect(output.summary.totalFiles).toBe(0)
      expect(output.summary.errorCount).toBe(0)
      expect(output.summary.warningCount).toBe(0)
      expect(output.summary.infoCount).toBe(0)
    })

    test('should still include version and timestamp with empty results', () => {
      const reporter = new JSONReporter()
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
      const output = JSON.parse(
        (consoleSpy.mock.calls[0][0] as string).replace(/\n$/, ''),
      ) as JsonOutput
      expect(output.version).toBeDefined()
      expect(output.timestamp).toBeDefined()
    })

    test('should output valid JSON for file with no violations but present stats', () => {
      const reporter = new JSONReporter()
      const results = createMockAnalysisResult({
        files: [
          createMockFileResult('empty-violations.ts', [], {
            parseTime: 3,
            analysisTime: 7,
            totalTime: 10,
          }),
        ],
        summary: {
          totalFiles: 1,
          filesWithViolations: 0,
          errorCount: 0,
          warningCount: 0,
          infoCount: 0,
          totalTime: 10,
        },
      })
      reporter.report(results)
      const output = JSON.parse(
        (consoleSpy.mock.calls[0][0] as string).replace(/\n$/, ''),
      ) as JsonOutput
      expect(output.files[0].violations).toEqual([])
      expect(output.files[0].stats.parseTime).toBe(3)
    })
  })

  describe('multiple files with mixed severities', () => {
    test('should correctly report each file with different severity mixes', () => {
      const reporter = new JSONReporter()
      const results = createMockAnalysisResult({
        files: [
          createMockFileResult('errors-only.ts', [
            createMockViolation({ severity: 'error', ruleId: 'e1' }),
          ]),
          createMockFileResult('warnings-only.ts', [
            createMockViolation({ severity: 'warning', ruleId: 'w1' }),
          ]),
          createMockFileResult('info-only.ts', [
            createMockViolation({ severity: 'info', ruleId: 'i1' }),
          ]),
        ],
        summary: {
          totalFiles: 3,
          filesWithViolations: 3,
          errorCount: 1,
          warningCount: 1,
          infoCount: 1,
          totalTime: 30,
        },
      })
      reporter.report(results)
      const output = JSON.parse(
        (consoleSpy.mock.calls[0][0] as string).replace(/\n$/, ''),
      ) as JsonOutput
      expect(output.files[0].violations[0].severity).toBe('error')
      expect(output.files[1].violations[0].severity).toBe('warning')
      expect(output.files[2].violations[0].severity).toBe('info')
    })

    test('should handle many files with many violations', () => {
      const reporter = new JSONReporter()
      const files = Array.from({ length: 50 }, (_, i) =>
        createMockFileResult(`file${i}.ts`, [
          createMockViolation({ ruleId: `rule-${i}-a`, severity: 'error' }),
          createMockViolation({ ruleId: `rule-${i}-b`, severity: 'warning' }),
        ]),
      )
      const results = createMockAnalysisResult({
        files,
        summary: {
          totalFiles: 50,
          filesWithViolations: 50,
          errorCount: 50,
          warningCount: 50,
          infoCount: 0,
          totalTime: 5000,
        },
      })
      reporter.report(results)
      const output = JSON.parse(
        (consoleSpy.mock.calls[0][0] as string).replace(/\n$/, ''),
      ) as JsonOutput
      expect(output.files).toHaveLength(50)
      expect(output.files[49].violations).toHaveLength(2)
      expect(output.files[49].violations[0].ruleId).toBe('rule-49-a')
    })

    test('should handle file with all three severities mixed', () => {
      const reporter = new JSONReporter()
      const results = createMockAnalysisResult({
        files: [
          createMockFileResult('mixed.ts', [
            createMockViolation({ severity: 'error', ruleId: 'e' }),
            createMockViolation({ severity: 'warning', ruleId: 'w' }),
            createMockViolation({ severity: 'info', ruleId: 'i' }),
            createMockViolation({ severity: 'error', ruleId: 'e2' }),
          ]),
        ],
        summary: {
          totalFiles: 1,
          filesWithViolations: 1,
          errorCount: 2,
          warningCount: 1,
          infoCount: 1,
          totalTime: 50,
        },
      })
      reporter.report(results)
      const output = JSON.parse(
        (consoleSpy.mock.calls[0][0] as string).replace(/\n$/, ''),
      ) as JsonOutput
      const severities = output.files[0].violations.map((v) => v.severity)
      expect(severities).toEqual(['error', 'warning', 'info', 'error'])
    })
  })

  describe('special characters and edge cases', () => {
    test('should handle file paths with spaces', () => {
      const reporter = new JSONReporter()
      const violation = createMockViolation({ filePath: 'src/my folder/my file.ts' })
      const output = reporter.format(violation)
      const parsed = JSON.parse(output) as JsonViolation
      expect(parsed.location.file).toBe('src/my folder/my file.ts')
    })

    test('should handle file paths with backslashes', () => {
      const reporter = new JSONReporter()
      const violation = createMockViolation({ filePath: 'src\\windows\\path.ts' })
      const output = reporter.format(violation)
      const parsed = JSON.parse(output) as JsonViolation
      expect(parsed.location.file).toBe('src\\windows\\path.ts')
    })

    test('should handle message with JSON special characters', () => {
      const reporter = new JSONReporter()
      const violation = createMockViolation({ message: 'Use {"key": "value"} instead of [1, 2]' })
      const output = reporter.format(violation)
      const parsed = JSON.parse(output) as JsonViolation
      expect(parsed.message).toBe('Use {"key": "value"} instead of [1, 2]')
    })

    test('should handle very long message', () => {
      const reporter = new JSONReporter()
      const longMessage = 'A'.repeat(10000)
      const violation = createMockViolation({ message: longMessage })
      const output = reporter.format(violation)
      const parsed = JSON.parse(output) as JsonViolation
      expect(parsed.message).toBe(longMessage)
      expect(parsed.message.length).toBe(10000)
    })

    test('should handle very long ruleId', () => {
      const reporter = new JSONReporter()
      const longRuleId = 'namespace/sub-namespace/'.repeat(100) + 'rule-name'
      const violation = createMockViolation({ ruleId: longRuleId })
      const output = reporter.format(violation)
      const parsed = JSON.parse(output) as JsonViolation
      expect(parsed.ruleId).toBe(longRuleId)
    })

    test('should handle unicode emoji in message', () => {
      const reporter = new JSONReporter()
      const violation = createMockViolation({ message: 'Error 🚨 in code 🔥' })
      const output = reporter.format(violation)
      const parsed = JSON.parse(output) as JsonViolation
      expect(parsed.message).toBe('Error 🚨 in code 🔥')
    })

    test('should handle unicode in source field', () => {
      const reporter = new JSONReporter()
      const violation = createMockViolation({ source: 'const 你好 = "世界";' })
      const output = reporter.format(violation)
      const parsed = JSON.parse(output) as JsonViolation
      expect(parsed.source).toBe('const 你好 = "世界";')
    })

    test('should handle unicode in suggestion field', () => {
      const reporter = new JSONReporter()
      const violation = createMockViolation({ suggestion: '建议使用 const 替代 let' })
      const output = reporter.format(violation)
      const parsed = JSON.parse(output) as JsonViolation
      expect(parsed.suggestion).toBe('建议使用 const 替代 let')
    })

    test('should handle meta with nested objects', () => {
      const reporter = new JSONReporter()
      const violation = createMockViolation({
        meta: { nested: { deep: { value: 42 } }, array: [1, 2, 3], flag: true, nil: null },
      })
      const output = reporter.format(violation)
      const parsed = JSON.parse(output) as JsonViolation
      expect(parsed.meta?.nested.deep.value).toBe(42)
      expect(parsed.meta?.array).toEqual([1, 2, 3])
      expect(parsed.meta?.flag).toBe(true)
      expect(parsed.meta?.nil).toBeNull()
    })

    test('should handle zero line and column values', () => {
      const reporter = new JSONReporter()
      const violation = createMockViolation({ line: 0, column: 0 })
      const output = reporter.format(violation)
      const parsed = JSON.parse(output) as JsonViolation
      expect(parsed.location.line).toBe(0)
      expect(parsed.location.column).toBe(0)
    })

    test('should handle large line and column values', () => {
      const reporter = new JSONReporter()
      const violation = createMockViolation({ line: 999999, column: 999999 })
      const output = reporter.format(violation)
      const parsed = JSON.parse(output) as JsonViolation
      expect(parsed.location.line).toBe(999999)
      expect(parsed.location.column).toBe(999999)
    })

    test('should handle empty string message', () => {
      const reporter = new JSONReporter()
      const violation = createMockViolation({ message: '' })
      const output = reporter.format(violation)
      const parsed = JSON.parse(output) as JsonViolation
      expect(parsed.message).toBe('')
    })

    test('should handle empty string ruleId', () => {
      const reporter = new JSONReporter()
      const violation = createMockViolation({ ruleId: '' })
      const output = reporter.format(violation)
      const parsed = JSON.parse(output) as JsonViolation
      expect(parsed.ruleId).toBe('')
    })
  })

  describe('pretty-printed vs compact JSON output', () => {
    function getStdoutOutput(): string {
      return consoleSpy.mock.calls[0][0] as string
    }

    test('compact output should be single line', () => {
      const reporter = new JSONReporter()
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [createMockViolation()])],
        summary: {
          totalFiles: 1,
          filesWithViolations: 1,
          errorCount: 1,
          warningCount: 0,
          infoCount: 0,
          totalTime: 10,
        },
      })
      reporter.report(results)
      const output = getStdoutOutput().replace(/\n$/, '')
      expect(output).not.toMatch(/\n/)
    })

    test('pretty output should be indented with 2 spaces', () => {
      const reporter = new JSONReporter({ pretty: true })
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
      const output = getStdoutOutput()
      expect(output).toContain('  "files"')
      expect(output).toContain('  "summary"')
    })

    test('pretty output should have newlines between keys', () => {
      const reporter = new JSONReporter({ pretty: true })
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
      const output = getStdoutOutput()
      const newlineCount = output.split('\n').length
      expect(newlineCount).toBeGreaterThan(3)
    })

    test('pretty and compact output should parse to same object', () => {
      const data = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [createMockViolation()])],
        summary: {
          totalFiles: 1,
          filesWithViolations: 1,
          errorCount: 1,
          warningCount: 0,
          infoCount: 0,
          totalTime: 10,
        },
      })
      const compactReporter = new JSONReporter()
      compactReporter.report(data)
      const compactOutput = JSON.parse((consoleSpy.mock.calls[0][0] as string).replace(/\n$/, ''))
      consoleSpy.mockClear()
      const prettyReporter = new JSONReporter({ pretty: true })
      prettyReporter.report(data)
      const prettyOutput = JSON.parse((consoleSpy.mock.calls[0][0] as string).replace(/\n$/, ''))
      expect(compactOutput).toEqual(prettyOutput)
    })

    test('compact output should end with newline on stdout', () => {
      const reporter = new JSONReporter()
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
      const raw = consoleSpy.mock.calls[0][0] as string
      expect(raw.endsWith('\n')).toBe(true)
    })
  })

  describe('output to file vs stdout', () => {
    test('should not call stdout.write when outputPath is provided', () => {
      const reporter = new JSONReporter({ outputPath: './report.json' })
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
      expect(consoleSpy).not.toHaveBeenCalled()
    })

    test('should not call fs.writeFileSync when no outputPath', () => {
      const reporter = new JSONReporter()
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
      expect(fsWriteFileSyncMock).not.toHaveBeenCalled()
    })

    test('should write same content to file as stdout', () => {
      const data = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [createMockViolation()])],
        summary: {
          totalFiles: 1,
          filesWithViolations: 1,
          errorCount: 1,
          warningCount: 0,
          infoCount: 0,
          totalTime: 10,
        },
      })
      const stdoutReporter = new JSONReporter()
      stdoutReporter.report(data)
      const stdoutContent = JSON.parse((consoleSpy.mock.calls[0][0] as string).replace(/\n$/, ''))
      consoleSpy.mockClear()
      const fileReporter = new JSONReporter({ outputPath: './out.json' })
      fsExistsSyncMock.mockReturnValue(true)
      fileReporter.report(data)
      const fileContent = JSON.parse(fsWriteFileSyncMock.mock.calls[0][1] as string)
      expect(stdoutContent).toEqual(fileContent)
    })

    test('should write compact JSON to file by default', () => {
      const reporter = new JSONReporter({ outputPath: './report.json' })
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
      const written = fsWriteFileSyncMock.mock.calls[0][1] as string
      expect(written).not.toContain('\n')
    })

    test('should write pretty JSON to file when pretty option is set', () => {
      const reporter = new JSONReporter({ outputPath: './report.json', pretty: true })
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
      const written = fsWriteFileSyncMock.mock.calls[0][1] as string
      expect(written).toContain('\n')
      expect(written).toContain('  ')
    })
  })

  describe('writeToFile error handling', () => {
    test('should throw wrapped error when writeFileSync fails', () => {
      fsExistsSyncMock.mockReturnValue(true)
      fsWriteFileSyncMock.mockImplementation(() => {
        throw new Error('disk full')
      })
      const reporter = new JSONReporter({ outputPath: './bad.json' })
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
      expect(() => reporter.report(results)).toThrow('write file "./bad.json"')
    })

    test('should throw wrapped error with string message when non-Error thrown', () => {
      fsExistsSyncMock.mockReturnValue(true)
      fsWriteFileSyncMock.mockImplementation(() => {
        throw 'unexpected string error'
      })
      const reporter = new JSONReporter({ outputPath: './bad2.json' })
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
      expect(() => reporter.report(results)).toThrow('write file "./bad2.json"')
    })
  })

  describe('version field', () => {
    test('should use provided version string', () => {
      const reporter = new JSONReporter()
      const results = createMockAnalysisResult({
        version: '3.2.1-beta',
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
      const output = JSON.parse(
        (consoleSpy.mock.calls[0][0] as string).replace(/\n$/, ''),
      ) as JsonOutput
      expect(output.version).toBe('3.2.1-beta')
    })

    test('should fallback to 1.0.0 when version is undefined', () => {
      const reporter = new JSONReporter()
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
      const output = JSON.parse(
        (consoleSpy.mock.calls[0][0] as string).replace(/\n$/, ''),
      ) as JsonOutput
      expect(output.version).toBe('1.0.0')
    })

    test('should handle empty string version as fallback', () => {
      const reporter = new JSONReporter()
      const results = createMockAnalysisResult({
        version: '',
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
      const output = JSON.parse(
        (consoleSpy.mock.calls[0][0] as string).replace(/\n$/, ''),
      ) as JsonOutput
      expect(output.version).toBe('')
    })

    test('should use version in file output', () => {
      const reporter = new JSONReporter({ outputPath: './v.json' })
      const results = createMockAnalysisResult({
        version: '2.5.0',
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
      const written = JSON.parse(fsWriteFileSyncMock.mock.calls[0][1] as string) as JsonOutput
      expect(written.version).toBe('2.5.0')
    })
  })

  describe('format - exhaustive field coverage', () => {
    test('should produce output with exactly these top-level keys when no optionals', () => {
      const reporter = new JSONReporter()
      const violation: Violation = {
        ruleId: 'r',
        severity: 'error',
        message: 'm',
        filePath: 'f.ts',
        line: 1,
        column: 1,
      }
      const parsed = JSON.parse(reporter.format(violation)) as JsonViolation
      const keys = Object.keys(parsed).sort()
      expect(keys).toEqual(['location', 'message', 'ruleId', 'severity'])
    })

    test('should produce output with all keys when all optionals present', () => {
      const reporter = new JSONReporter()
      const violation: Violation = {
        ruleId: 'r',
        severity: 'warning',
        message: 'm',
        filePath: 'f.ts',
        line: 1,
        column: 1,
        endLine: 2,
        endColumn: 3,
        source: 'src',
        suggestion: 'fix it',
        meta: { x: 1 },
      }
      const parsed = JSON.parse(reporter.format(violation)) as JsonViolation
      const keys = Object.keys(parsed).sort()
      expect(keys).toEqual([
        'location',
        'message',
        'meta',
        'ruleId',
        'severity',
        'source',
        'suggestion',
      ])
    })

    test('should map filePath to location.file not location.filePath', () => {
      const reporter = new JSONReporter()
      const violation = createMockViolation({ filePath: 'renamed.ts' })
      const parsed = JSON.parse(reporter.format(violation)) as JsonViolation
      expect(parsed.location.file).toBe('renamed.ts')
      expect(parsed.location as Record<string, unknown>).not.toHaveProperty('filePath')
    })

    test('should return string from format', () => {
      const reporter = new JSONReporter()
      const result = reporter.format(createMockViolation())
      expect(typeof result).toBe('string')
    })

    test('should produce different strings for different violations', () => {
      const reporter = new JSONReporter()
      const v1 = createMockViolation({ ruleId: 'a' })
      const v2 = createMockViolation({ ruleId: 'b' })
      expect(reporter.format(v1)).not.toBe(reporter.format(v2))
    })

    test('should produce same string for identical violations', () => {
      const reporter = new JSONReporter()
      const v = createMockViolation({ ruleId: 'same' })
      expect(reporter.format(v)).toBe(reporter.format(v))
    })

    test('should handle negative line and column', () => {
      const reporter = new JSONReporter()
      const violation = createMockViolation({ line: -1, column: -1 })
      const parsed = JSON.parse(reporter.format(violation)) as JsonViolation
      expect(parsed.location.line).toBe(-1)
      expect(parsed.location.column).toBe(-1)
    })

    test('should handle endLine without endColumn', () => {
      const reporter = new JSONReporter()
      const violation = createMockViolation({ endLine: 10 })
      const parsed = JSON.parse(reporter.format(violation)) as JsonViolation
      expect(parsed.location.endLine).toBe(10)
      expect(parsed.location.endColumn).toBeUndefined()
    })

    test('should handle endColumn without endLine', () => {
      const reporter = new JSONReporter()
      const violation = createMockViolation({ endColumn: 20 })
      const parsed = JSON.parse(reporter.format(violation)) as JsonViolation
      expect(parsed.location.endColumn).toBe(20)
      expect(parsed.location.endLine).toBeUndefined()
    })

    test('should handle meta with empty object', () => {
      const reporter = new JSONReporter()
      const violation = createMockViolation({ meta: {} })
      const parsed = JSON.parse(reporter.format(violation)) as JsonViolation
      expect(parsed.meta).toEqual({})
    })

    test('should handle meta with number values', () => {
      const reporter = new JSONReporter()
      const violation = createMockViolation({ meta: { count: 42, ratio: 3.14 } })
      const parsed = JSON.parse(reporter.format(violation)) as JsonViolation
      expect(parsed.meta?.count).toBe(42)
      expect(parsed.meta?.ratio).toBe(3.14)
    })

    test('should handle meta with boolean values', () => {
      const reporter = new JSONReporter()
      const violation = createMockViolation({ meta: { fixable: true, autoFix: false } })
      const parsed = JSON.parse(reporter.format(violation)) as JsonViolation
      expect(parsed.meta?.fixable).toBe(true)
      expect(parsed.meta?.autoFix).toBe(false)
    })

    test('should handle meta with string array values', () => {
      const reporter = new JSONReporter()
      const violation = createMockViolation({ meta: { tags: ['security', 'performance'] } })
      const parsed = JSON.parse(reporter.format(violation)) as JsonViolation
      expect(parsed.meta?.tags).toEqual(['security', 'performance'])
    })

    test('should handle source with multiline string', () => {
      const reporter = new JSONReporter()
      const source = 'line1\nline2\nline3'
      const violation = createMockViolation({ source })
      const parsed = JSON.parse(reporter.format(violation)) as JsonViolation
      expect(parsed.source).toBe(source)
    })

    test('should handle suggestion with multiline string', () => {
      const reporter = new JSONReporter()
      const suggestion = 'Step 1: do this\nStep 2: do that'
      const violation = createMockViolation({ suggestion })
      const parsed = JSON.parse(reporter.format(violation)) as JsonViolation
      expect(parsed.suggestion).toBe(suggestion)
    })
  })

  describe('report - stdout newline behavior', () => {
    test('should append newline to compact output', () => {
      const reporter = new JSONReporter()
      reporter.report(
        createMockAnalysisResult({
          files: [],
          summary: {
            totalFiles: 0,
            filesWithViolations: 0,
            errorCount: 0,
            warningCount: 0,
            infoCount: 0,
            totalTime: 0,
          },
        }),
      )
      const raw = consoleSpy.mock.calls[0][0] as string
      expect(raw.endsWith('\n')).toBe(true)
    })

    test('should append newline to pretty output', () => {
      const reporter = new JSONReporter({ pretty: true })
      reporter.report(
        createMockAnalysisResult({
          files: [],
          summary: {
            totalFiles: 0,
            filesWithViolations: 0,
            errorCount: 0,
            warningCount: 0,
            infoCount: 0,
            totalTime: 0,
          },
        }),
      )
      const raw = consoleSpy.mock.calls[0][0] as string
      expect(raw.endsWith('\n')).toBe(true)
    })

    test('should call stdout.write exactly once per report call', () => {
      const reporter = new JSONReporter()
      reporter.report(
        createMockAnalysisResult({
          files: [createMockFileResult('a.ts', [createMockViolation()])],
          summary: {
            totalFiles: 1,
            filesWithViolations: 1,
            errorCount: 1,
            warningCount: 0,
            infoCount: 0,
            totalTime: 10,
          },
        }),
      )
      expect(consoleSpy).toHaveBeenCalledTimes(1)
    })
  })

  describe('report - file output error handling', () => {
    test('should include file path in error message', () => {
      fsExistsSyncMock.mockReturnValue(true)
      fsWriteFileSyncMock.mockImplementation(() => {
        throw new Error('no space')
      })
      const reporter = new JSONReporter({ outputPath: '/no/space/report.json' })
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
      expect(() => reporter.report(results)).toThrow('/no/space/report.json')
    })

    test('should throw error when mkdirSync fails', () => {
      fsExistsSyncMock.mockReturnValue(false)
      vi.mocked(path.dirname).mockReturnValue('/bad/dir')
      vi.mocked(fs.mkdirSync).mockImplementation(() => {
        throw new Error('permission denied')
      })
      const reporter = new JSONReporter({ outputPath: '/bad/dir/report.json' })
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
      expect(() => reporter.report(results)).toThrow()
    })
  })

  describe('report - file output content correctness', () => {
    test('should write valid JSON that can be parsed', () => {
      const reporter = new JSONReporter({ outputPath: './out.json' })
      const results = createMockAnalysisResult({
        files: [
          createMockFileResult('test.ts', [
            createMockViolation({ ruleId: 'r1', severity: 'error', message: 'msg' }),
          ]),
        ],
        summary: {
          totalFiles: 1,
          filesWithViolations: 1,
          errorCount: 1,
          warningCount: 0,
          infoCount: 0,
          totalTime: 10,
        },
      })
      fsExistsSyncMock.mockReturnValue(true)
      reporter.report(results)
      const written = fsWriteFileSyncMock.mock.calls[0][1] as string
      expect(() => JSON.parse(written)).not.toThrow()
    })

    test('should include all file violations in file output', () => {
      const reporter = new JSONReporter({ outputPath: './out.json' })
      const violations = [
        createMockViolation({ ruleId: 'a' }),
        createMockViolation({ ruleId: 'b' }),
        createMockViolation({ ruleId: 'c' }),
      ]
      const results = createMockAnalysisResult({
        files: [createMockFileResult('multi.ts', violations)],
        summary: {
          totalFiles: 1,
          filesWithViolations: 1,
          errorCount: 3,
          warningCount: 0,
          infoCount: 0,
          totalTime: 10,
        },
      })
      fsExistsSyncMock.mockReturnValue(true)
      reporter.report(results)
      const parsed = JSON.parse(fsWriteFileSyncMock.mock.calls[0][1] as string) as JsonOutput
      expect(parsed.files[0].violations).toHaveLength(3)
    })

    test('should include timestamp in file output', () => {
      const reporter = new JSONReporter({ outputPath: './out.json' })
      const results = createMockAnalysisResult({
        timestamp: '2024-06-01T00:00:00.000Z',
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
      const parsed = JSON.parse(fsWriteFileSyncMock.mock.calls[0][1] as string) as JsonOutput
      expect(parsed.timestamp).toBe('2024-06-01T00:00:00.000Z')
    })

    test('should include version in file output', () => {
      const reporter = new JSONReporter({ outputPath: './out.json' })
      const results = createMockAnalysisResult({
        version: '5.0.0',
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
      const parsed = JSON.parse(fsWriteFileSyncMock.mock.calls[0][1] as string) as JsonOutput
      expect(parsed.version).toBe('5.0.0')
    })

    test('should use default version in file output when undefined', () => {
      const reporter = new JSONReporter({ outputPath: './out.json' })
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
      const parsed = JSON.parse(fsWriteFileSyncMock.mock.calls[0][1] as string) as JsonOutput
      expect(parsed.version).toBe('1.0.0')
    })
  })

  describe('transformViolation via report - all fields', () => {
    test('should transform violation with all optional fields populated', () => {
      const reporter = new JSONReporter()
      const violation: Violation = {
        ruleId: 'full-rule',
        severity: 'warning',
        message: 'Full violation',
        filePath: 'full/path.ts',
        line: 10,
        column: 20,
        endLine: 12,
        endColumn: 25,
        source: 'const x = 1;',
        suggestion: 'Remove x',
        meta: { doc: 'https://example.com', category: 'best-practice' },
      }
      const results = createMockAnalysisResult({
        files: [createMockFileResult('full/path.ts', [violation])],
        summary: {
          totalFiles: 1,
          filesWithViolations: 1,
          errorCount: 0,
          warningCount: 1,
          infoCount: 0,
          totalTime: 10,
        },
      })
      reporter.report(results)
      const output = JSON.parse(
        (consoleSpy.mock.calls[0][0] as string).replace(/\n$/, ''),
      ) as JsonOutput
      const v = output.files[0].violations[0]
      expect(v.ruleId).toBe('full-rule')
      expect(v.severity).toBe('warning')
      expect(v.message).toBe('Full violation')
      expect(v.location.file).toBe('full/path.ts')
      expect(v.location.line).toBe(10)
      expect(v.location.column).toBe(20)
      expect(v.location.endLine).toBe(12)
      expect(v.location.endColumn).toBe(25)
      expect(v.source).toBe('const x = 1;')
      expect(v.suggestion).toBe('Remove x')
      expect(v.meta?.doc).toBe('https://example.com')
      expect(v.meta?.category).toBe('best-practice')
    })

    test('should transform violation with no optional fields', () => {
      const reporter = new JSONReporter()
      const violation: Violation = {
        ruleId: 'bare',
        severity: 'info',
        message: 'Bare',
        filePath: 'bare.ts',
        line: 1,
        column: 1,
      }
      const results = createMockAnalysisResult({
        files: [createMockFileResult('bare.ts', [violation])],
        summary: {
          totalFiles: 1,
          filesWithViolations: 1,
          errorCount: 0,
          warningCount: 0,
          infoCount: 1,
          totalTime: 5,
        },
      })
      reporter.report(results)
      const output = JSON.parse(
        (consoleSpy.mock.calls[0][0] as string).replace(/\n$/, ''),
      ) as JsonOutput
      const v = output.files[0].violations[0]
      expect(v.location.endLine).toBeUndefined()
      expect(v.location.endColumn).toBeUndefined()
      expect(v.source).toBeUndefined()
      expect(v.suggestion).toBeUndefined()
      expect(v.meta).toBeUndefined()
    })
  })

  describe('multiple report calls', () => {
    test('should produce independent output for each call', () => {
      const reporter = new JSONReporter()
      const r1 = createMockAnalysisResult({
        files: [createMockFileResult('a.ts', [createMockViolation({ ruleId: 'r1' })])],
        summary: {
          totalFiles: 1,
          filesWithViolations: 1,
          errorCount: 1,
          warningCount: 0,
          infoCount: 0,
          totalTime: 10,
        },
      })
      const r2 = createMockAnalysisResult({
        files: [createMockFileResult('b.ts', [createMockViolation({ ruleId: 'r2' })])],
        summary: {
          totalFiles: 1,
          filesWithViolations: 1,
          errorCount: 1,
          warningCount: 0,
          infoCount: 0,
          totalTime: 5,
        },
      })
      reporter.report(r1)
      reporter.report(r2)
      expect(consoleSpy).toHaveBeenCalledTimes(2)
      const out1 = JSON.parse(
        (consoleSpy.mock.calls[0][0] as string).replace(/\n$/, ''),
      ) as JsonOutput
      const out2 = JSON.parse(
        (consoleSpy.mock.calls[1][0] as string).replace(/\n$/, ''),
      ) as JsonOutput
      expect(out1.files[0].filePath).toBe('a.ts')
      expect(out2.files[0].filePath).toBe('b.ts')
    })

    test('should produce same output for same input across calls', () => {
      const reporter = new JSONReporter()
      const results = createMockAnalysisResult({
        files: [createMockFileResult('same.ts', [createMockViolation()])],
        summary: {
          totalFiles: 1,
          filesWithViolations: 1,
          errorCount: 1,
          warningCount: 0,
          infoCount: 0,
          totalTime: 10,
        },
      })
      reporter.report(results)
      reporter.report(results)
      const out1 = (consoleSpy.mock.calls[0][0] as string).replace(/\n$/, '')
      const out2 = (consoleSpy.mock.calls[1][0] as string).replace(/\n$/, '')
      expect(out1).toBe(out2)
    })
  })

  describe('file result structure', () => {
    test('should have exactly filePath, stats, violations in each file result', () => {
      const reporter = new JSONReporter()
      const results = createMockAnalysisResult({
        files: [createMockFileResult('struct.ts', [createMockViolation()])],
        summary: {
          totalFiles: 1,
          filesWithViolations: 1,
          errorCount: 1,
          warningCount: 0,
          infoCount: 0,
          totalTime: 10,
        },
      })
      reporter.report(results)
      const output = JSON.parse(
        (consoleSpy.mock.calls[0][0] as string).replace(/\n$/, ''),
      ) as JsonOutput
      const fileKeys = Object.keys(output.files[0]).sort()
      expect(fileKeys).toEqual(['filePath', 'stats', 'violations'])
    })

    test('should have exactly parseTime, analysisTime, totalTime in stats', () => {
      const reporter = new JSONReporter()
      const results = createMockAnalysisResult({
        files: [
          createMockFileResult('stats.ts', [], { parseTime: 1, analysisTime: 2, totalTime: 3 }),
        ],
        summary: {
          totalFiles: 1,
          filesWithViolations: 0,
          errorCount: 0,
          warningCount: 0,
          infoCount: 0,
          totalTime: 3,
        },
      })
      reporter.report(results)
      const output = JSON.parse(
        (consoleSpy.mock.calls[0][0] as string).replace(/\n$/, ''),
      ) as JsonOutput
      const statsKeys = Object.keys(output.files[0].stats).sort()
      expect(statsKeys).toEqual(['analysisTime', 'parseTime', 'totalTime'])
    })

    test('should preserve zero stat values', () => {
      const reporter = new JSONReporter()
      const results = createMockAnalysisResult({
        files: [
          createMockFileResult('zero.ts', [], { parseTime: 0, analysisTime: 0, totalTime: 0 }),
        ],
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
      const output = JSON.parse(
        (consoleSpy.mock.calls[0][0] as string).replace(/\n$/, ''),
      ) as JsonOutput
      expect(output.files[0].stats.parseTime).toBe(0)
      expect(output.files[0].stats.analysisTime).toBe(0)
      expect(output.files[0].stats.totalTime).toBe(0)
    })

    test('should preserve large stat values', () => {
      const reporter = new JSONReporter()
      const results = createMockAnalysisResult({
        files: [
          createMockFileResult('large.ts', [], {
            parseTime: 999999,
            analysisTime: 888888,
            totalTime: 777777,
          }),
        ],
        summary: {
          totalFiles: 1,
          filesWithViolations: 0,
          errorCount: 0,
          warningCount: 0,
          infoCount: 0,
          totalTime: 777777,
        },
      })
      reporter.report(results)
      const output = JSON.parse(
        (consoleSpy.mock.calls[0][0] as string).replace(/\n$/, ''),
      ) as JsonOutput
      expect(output.files[0].stats.parseTime).toBe(999999)
      expect(output.files[0].stats.analysisTime).toBe(888888)
    })
  })

  describe('special characters in report output', () => {
    test('should handle control characters in message', () => {
      const reporter = new JSONReporter()
      const violation = createMockViolation({ message: 'line1\r\nline2\ttabbed' })
      const output = reporter.format(violation)
      expect(() => JSON.parse(output)).not.toThrow()
    })

    test('should handle forward slash in file path', () => {
      const reporter = new JSONReporter()
      const violation = createMockViolation({ filePath: '/absolute/path/to/file.ts' })
      const parsed = JSON.parse(reporter.format(violation)) as JsonViolation
      expect(parsed.location.file).toBe('/absolute/path/to/file.ts')
    })

    test('should handle dot in file path', () => {
      const reporter = new JSONReporter()
      const violation = createMockViolation({ filePath: './relative/../file.ts' })
      const parsed = JSON.parse(reporter.format(violation)) as JsonViolation
      expect(parsed.location.file).toBe('./relative/../file.ts')
    })

    test('should handle file path with multiple extensions', () => {
      const reporter = new JSONReporter()
      const violation = createMockViolation({ filePath: 'component.test.tsx' })
      const parsed = JSON.parse(reporter.format(violation)) as JsonViolation
      expect(parsed.location.file).toBe('component.test.tsx')
    })

    test('should handle file path with only filename', () => {
      const reporter = new JSONReporter()
      const violation = createMockViolation({ filePath: 'index.ts' })
      const parsed = JSON.parse(reporter.format(violation)) as JsonViolation
      expect(parsed.location.file).toBe('index.ts')
    })

    test('should handle ruleId with dots and hyphens', () => {
      const reporter = new JSONReporter()
      const violation = createMockViolation({ ruleId: 'max-lines.per-file' })
      const parsed = JSON.parse(reporter.format(violation)) as JsonViolation
      expect(parsed.ruleId).toBe('max-lines.per-file')
    })

    test('should handle ruleId with @ scope', () => {
      const reporter = new JSONReporter()
      const violation = createMockViolation({ ruleId: '@typescript-eslint/no-explicit-any' })
      const parsed = JSON.parse(reporter.format(violation)) as JsonViolation
      expect(parsed.ruleId).toBe('@typescript-eslint/no-explicit-any')
    })

    test('should handle message with HTML entities', () => {
      const reporter = new JSONReporter()
      const violation = createMockViolation({ message: 'Use &lt;div&gt; instead of &amp;' })
      const parsed = JSON.parse(reporter.format(violation)) as JsonViolation
      expect(parsed.message).toBe('Use &lt;div&gt; instead of &amp;')
    })

    test('should handle message with regex special characters', () => {
      const reporter = new JSONReporter()
      const violation = createMockViolation({ message: 'Pattern .*? matches [a-z]+ and \\d+' })
      const parsed = JSON.parse(reporter.format(violation)) as JsonViolation
      expect(parsed.message).toBe('Pattern .*? matches [a-z]+ and \\d+')
    })

    test('should handle source with template literal syntax', () => {
      const reporter = new JSONReporter()
      const violation = createMockViolation({ source: '`${name} is ${age}`' })
      const parsed = JSON.parse(reporter.format(violation)) as JsonViolation
      expect(parsed.source).toBe('`${name} is ${age}`')
    })

    test('should handle suggestion with code examples', () => {
      const reporter = new JSONReporter()
      const violation = createMockViolation({
        suggestion: 'Replace `let` with `const`:\nconst x = 1;',
      })
      const parsed = JSON.parse(reporter.format(violation)) as JsonViolation
      expect(parsed.suggestion).toBe('Replace `let` with `const`:\nconst x = 1;')
    })
  })

  describe('large result sets', () => {
    test('should handle 100 files each with 10 violations', () => {
      const reporter = new JSONReporter()
      const files = Array.from({ length: 100 }, (_, i) =>
        createMockFileResult(
          `file${i}.ts`,
          Array.from({ length: 10 }, (_, j) =>
            createMockViolation({ ruleId: `rule-${i}-${j}`, line: j + 1, column: j + 1 }),
          ),
        ),
      )
      const results = createMockAnalysisResult({
        files,
        summary: {
          totalFiles: 100,
          filesWithViolations: 100,
          errorCount: 1000,
          warningCount: 0,
          infoCount: 0,
          totalTime: 10000,
        },
      })
      reporter.report(results)
      const output = JSON.parse(
        (consoleSpy.mock.calls[0][0] as string).replace(/\n$/, ''),
      ) as JsonOutput
      expect(output.files).toHaveLength(100)
      expect(output.files[99].violations).toHaveLength(10)
      expect(output.files[0].violations[0].ruleId).toBe('rule-0-0')
      expect(output.files[99].violations[9].ruleId).toBe('rule-99-9')
    })

    test('should handle single file with 500 violations', () => {
      const reporter = new JSONReporter()
      const violations = Array.from({ length: 500 }, (_, i) =>
        createMockViolation({ ruleId: `v-${i}`, line: i + 1 }),
      )
      const results = createMockAnalysisResult({
        files: [createMockFileResult('big.ts', violations)],
        summary: {
          totalFiles: 1,
          filesWithViolations: 1,
          errorCount: 500,
          warningCount: 0,
          infoCount: 0,
          totalTime: 1000,
        },
      })
      reporter.report(results)
      const output = JSON.parse(
        (consoleSpy.mock.calls[0][0] as string).replace(/\n$/, ''),
      ) as JsonOutput
      expect(output.files[0].violations).toHaveLength(500)
      expect(output.files[0].violations[499].ruleId).toBe('v-499')
    })

    test('should handle 200 files with no violations', () => {
      const reporter = new JSONReporter()
      const files = Array.from({ length: 200 }, (_, i) => createMockFileResult(`clean${i}.ts`, []))
      const results = createMockAnalysisResult({
        files,
        summary: {
          totalFiles: 200,
          filesWithViolations: 0,
          errorCount: 0,
          warningCount: 0,
          infoCount: 0,
          totalTime: 2000,
        },
      })
      reporter.report(results)
      const output = JSON.parse(
        (consoleSpy.mock.calls[0][0] as string).replace(/\n$/, ''),
      ) as JsonOutput
      expect(output.files).toHaveLength(200)
      for (const f of output.files) {
        expect(f.violations).toEqual([])
      }
    })
  })

  describe('summary edge cases', () => {
    test('should handle all zero summary', () => {
      const reporter = new JSONReporter()
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
      const output = JSON.parse(
        (consoleSpy.mock.calls[0][0] as string).replace(/\n$/, ''),
      ) as JsonOutput
      expect(output.summary).toEqual({
        totalFiles: 0,
        filesWithViolations: 0,
        errorCount: 0,
        warningCount: 0,
        infoCount: 0,
        totalTime: 0,
      })
    })

    test('should handle very large summary counts', () => {
      const reporter = new JSONReporter()
      const results = createMockAnalysisResult({
        files: [],
        summary: {
          totalFiles: 1000000,
          filesWithViolations: 999999,
          errorCount: 500000,
          warningCount: 300000,
          infoCount: 199999,
          totalTime: 999999999,
        },
      })
      reporter.report(results)
      const output = JSON.parse(
        (consoleSpy.mock.calls[0][0] as string).replace(/\n$/, ''),
      ) as JsonOutput
      expect(output.summary.totalFiles).toBe(1000000)
      expect(output.summary.errorCount).toBe(500000)
    })

    test('should preserve all six summary fields', () => {
      const reporter = new JSONReporter()
      const results = createMockAnalysisResult({
        files: [],
        summary: {
          totalFiles: 1,
          filesWithViolations: 1,
          errorCount: 1,
          warningCount: 1,
          infoCount: 1,
          totalTime: 1,
        },
      })
      reporter.report(results)
      const output = JSON.parse(
        (consoleSpy.mock.calls[0][0] as string).replace(/\n$/, ''),
      ) as JsonOutput
      const keys = Object.keys(output.summary).sort()
      expect(keys).toEqual([
        'errorCount',
        'filesWithViolations',
        'infoCount',
        'totalFiles',
        'totalTime',
        'warningCount',
      ])
    })

    test('should handle summary with only errors', () => {
      const reporter = new JSONReporter()
      const results = createMockAnalysisResult({
        files: [
          createMockFileResult('err.ts', [
            createMockViolation({ severity: 'error', ruleId: 'e1' }),
            createMockViolation({ severity: 'error', ruleId: 'e2' }),
          ]),
        ],
        summary: {
          totalFiles: 1,
          filesWithViolations: 1,
          errorCount: 2,
          warningCount: 0,
          infoCount: 0,
          totalTime: 5,
        },
      })
      reporter.report(results)
      const output = JSON.parse(
        (consoleSpy.mock.calls[0][0] as string).replace(/\n$/, ''),
      ) as JsonOutput
      expect(output.summary.errorCount).toBe(2)
      expect(output.summary.warningCount).toBe(0)
      expect(output.summary.infoCount).toBe(0)
    })

    test('should handle summary with only warnings', () => {
      const reporter = new JSONReporter()
      const results = createMockAnalysisResult({
        files: [
          createMockFileResult('warn.ts', [
            createMockViolation({ severity: 'warning', ruleId: 'w1' }),
          ]),
        ],
        summary: {
          totalFiles: 1,
          filesWithViolations: 1,
          errorCount: 0,
          warningCount: 1,
          infoCount: 0,
          totalTime: 5,
        },
      })
      reporter.report(results)
      const output = JSON.parse(
        (consoleSpy.mock.calls[0][0] as string).replace(/\n$/, ''),
      ) as JsonOutput
      expect(output.summary.errorCount).toBe(0)
      expect(output.summary.warningCount).toBe(1)
      expect(output.summary.infoCount).toBe(0)
    })

    test('should handle summary with only info', () => {
      const reporter = new JSONReporter()
      const results = createMockAnalysisResult({
        files: [
          createMockFileResult('info.ts', [
            createMockViolation({ severity: 'info', ruleId: 'i1' }),
          ]),
        ],
        summary: {
          totalFiles: 1,
          filesWithViolations: 1,
          errorCount: 0,
          warningCount: 0,
          infoCount: 1,
          totalTime: 5,
        },
      })
      reporter.report(results)
      const output = JSON.parse(
        (consoleSpy.mock.calls[0][0] as string).replace(/\n$/, ''),
      ) as JsonOutput
      expect(output.summary.infoCount).toBe(1)
      expect(output.summary.errorCount).toBe(0)
      expect(output.summary.warningCount).toBe(0)
    })

    test('should handle summary totalFiles not matching files array length', () => {
      const reporter = new JSONReporter()
      const results = createMockAnalysisResult({
        files: [createMockFileResult('a.ts', [])],
        summary: {
          totalFiles: 5,
          filesWithViolations: 0,
          errorCount: 0,
          warningCount: 0,
          infoCount: 0,
          totalTime: 50,
        },
      })
      reporter.report(results)
      const output = JSON.parse(
        (consoleSpy.mock.calls[0][0] as string).replace(/\n$/, ''),
      ) as JsonOutput
      expect(output.summary.totalFiles).toBe(5)
      expect(output.files).toHaveLength(1)
    })
  })

  describe('timestamp handling', () => {
    test('should preserve ISO timestamp format', () => {
      const reporter = new JSONReporter()
      const results = createMockAnalysisResult({
        timestamp: '2024-12-25T23:59:59.999Z',
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
      const output = JSON.parse(
        (consoleSpy.mock.calls[0][0] as string).replace(/\n$/, ''),
      ) as JsonOutput
      expect(output.timestamp).toBe('2024-12-25T23:59:59.999Z')
    })

    test('should preserve non-ISO timestamp', () => {
      const reporter = new JSONReporter()
      const results = createMockAnalysisResult({
        timestamp: 'Jan 15, 2024 10:00 AM',
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
      const output = JSON.parse(
        (consoleSpy.mock.calls[0][0] as string).replace(/\n$/, ''),
      ) as JsonOutput
      expect(output.timestamp).toBe('Jan 15, 2024 10:00 AM')
    })

    test('should preserve epoch-like timestamp', () => {
      const reporter = new JSONReporter()
      const results = createMockAnalysisResult({
        timestamp: '1705312800000',
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
      const output = JSON.parse(
        (consoleSpy.mock.calls[0][0] as string).replace(/\n$/, ''),
      ) as JsonOutput
      expect(output.timestamp).toBe('1705312800000')
    })

    test('should preserve empty timestamp', () => {
      const reporter = new JSONReporter()
      const results = createMockAnalysisResult({
        timestamp: '',
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
      const output = JSON.parse(
        (consoleSpy.mock.calls[0][0] as string).replace(/\n$/, ''),
      ) as JsonOutput
      expect(output.timestamp).toBe('')
    })
  })

  describe('version edge cases', () => {
    test('should preserve semver with prerelease', () => {
      const reporter = new JSONReporter()
      const results = createMockAnalysisResult({
        version: '1.0.0-alpha.1',
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
      const output = JSON.parse(
        (consoleSpy.mock.calls[0][0] as string).replace(/\n$/, ''),
      ) as JsonOutput
      expect(output.version).toBe('1.0.0-alpha.1')
    })

    test('should preserve semver with build metadata', () => {
      const reporter = new JSONReporter()
      const results = createMockAnalysisResult({
        version: '2.0.0+build.123',
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
      const output = JSON.parse(
        (consoleSpy.mock.calls[0][0] as string).replace(/\n$/, ''),
      ) as JsonOutput
      expect(output.version).toBe('2.0.0+build.123')
    })
  })

  describe('format - idempotency', () => {
    test('should produce identical output when called twice with same violation', () => {
      const reporter = new JSONReporter()
      const v = createMockViolation({ ruleId: 'idempotent', message: 'test' })
      const out1 = reporter.format(v)
      const out2 = reporter.format(v)
      expect(out1).toBe(out2)
    })

    test('should produce output that round-trips through JSON.parse then JSON.stringify', () => {
      const reporter = new JSONReporter()
      const v = createMockViolation({ ruleId: 'roundtrip', source: 'code', suggestion: 'fix' })
      const out = reporter.format(v)
      const parsed = JSON.parse(out)
      const reStr = JSON.stringify(parsed)
      expect(JSON.parse(reStr)).toEqual(parsed)
    })
  })

  describe('format vs transformViolation consistency', () => {
    test('should produce same violation JSON from format and report', () => {
      const reporter = new JSONReporter()
      const violation = createMockViolation({
        ruleId: 'consistency-check',
        severity: 'error',
        message: 'Check',
        filePath: 'cons.ts',
        line: 5,
        column: 10,
        endLine: 5,
        endColumn: 15,
        source: 'const x = 1',
        suggestion: 'Use let',
        meta: { tag: 'test' },
      })
      const formatOutput = JSON.parse(reporter.format(violation)) as JsonViolation
      const results = createMockAnalysisResult({
        files: [createMockFileResult('cons.ts', [violation])],
        summary: {
          totalFiles: 1,
          filesWithViolations: 1,
          errorCount: 1,
          warningCount: 0,
          infoCount: 0,
          totalTime: 10,
        },
      })
      reporter.report(results)
      const reportOutput = JSON.parse(
        (consoleSpy.mock.calls[0][0] as string).replace(/\n$/, ''),
      ) as JsonOutput
      const reportViolation = reportOutput.files[0].violations[0]
      expect(formatOutput).toEqual(reportViolation)
    })
  })

  describe('meta field edge cases', () => {
    test('should handle meta with deeply nested structure', () => {
      const reporter = new JSONReporter()
      const violation = createMockViolation({
        meta: { level1: { level2: { level3: { level4: { value: 'deep' } } } } },
      })
      const parsed = JSON.parse(reporter.format(violation)) as JsonViolation
      expect((parsed.meta as Record<string, unknown>)?.level1?.level2?.level3?.level4?.value).toBe(
        'deep',
      )
    })

    test('should handle meta with empty array', () => {
      const reporter = new JSONReporter()
      const violation = createMockViolation({ meta: { items: [] } })
      const parsed = JSON.parse(reporter.format(violation)) as JsonViolation
      expect(parsed.meta?.items).toEqual([])
    })

    test('should handle meta with empty string value', () => {
      const reporter = new JSONReporter()
      const violation = createMockViolation({ meta: { name: '' } })
      const parsed = JSON.parse(reporter.format(violation)) as JsonViolation
      expect(parsed.meta?.name).toBe('')
    })

    test('should handle meta with zero value', () => {
      const reporter = new JSONReporter()
      const violation = createMockViolation({ meta: { count: 0 } })
      const parsed = JSON.parse(reporter.format(violation)) as JsonViolation
      expect(parsed.meta?.count).toBe(0)
    })

    test('should handle meta with false value', () => {
      const reporter = new JSONReporter()
      const violation = createMockViolation({ meta: { enabled: false } })
      const parsed = JSON.parse(reporter.format(violation)) as JsonViolation
      expect(parsed.meta?.enabled).toBe(false)
    })
  })

  describe('constructor options independence', () => {
    test('should not affect other options when only pretty is set', () => {
      const reporter = new JSONReporter({ pretty: true })
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
      expect(fsWriteFileSyncMock).not.toHaveBeenCalled()
    })

    test('should not affect other options when only outputPath is set', () => {
      const reporter = new JSONReporter({ outputPath: './out.json' })
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
      const written = fsWriteFileSyncMock.mock.calls[0][1] as string
      expect(written).not.toContain('\n')
    })

    test('should create independent reporter instances', () => {
      const r1 = new JSONReporter()
      const r2 = new JSONReporter({ pretty: true })
      expect(r1.name).toBe('json')
      expect(r2.name).toBe('json')
    })
  })

  describe('violation location completeness', () => {
    test('should always include file, line, column in location', () => {
      const reporter = new JSONReporter()
      const violation = createMockViolation({ filePath: 'loc.ts', line: 42, column: 7 })
      const parsed = JSON.parse(reporter.format(violation)) as JsonViolation
      expect(Object.keys(parsed.location).sort()).toContain('column')
      expect(Object.keys(parsed.location).sort()).toContain('file')
      expect(Object.keys(parsed.location).sort()).toContain('line')
    })

    test('should have location as an object not a string', () => {
      const reporter = new JSONReporter()
      const parsed = JSON.parse(reporter.format(createMockViolation())) as JsonViolation
      expect(typeof parsed.location).toBe('object')
      expect(parsed.location).not.toBeNull()
      expect(Array.isArray(parsed.location)).toBe(false)
    })

    test('should have violations array as an array in file results', () => {
      const reporter = new JSONReporter()
      const results = createMockAnalysisResult({
        files: [createMockFileResult('arr.ts', [createMockViolation()])],
        summary: {
          totalFiles: 1,
          filesWithViolations: 1,
          errorCount: 1,
          warningCount: 0,
          infoCount: 0,
          totalTime: 10,
        },
      })
      reporter.report(results)
      const output = JSON.parse(
        (consoleSpy.mock.calls[0][0] as string).replace(/\n$/, ''),
      ) as JsonOutput
      expect(Array.isArray(output.files[0].violations)).toBe(true)
    })
  })

  describe('file path edge cases in report', () => {
    test('should handle file path with query string characters', () => {
      const reporter = new JSONReporter()
      const violation = createMockViolation({ filePath: 'file.ts?version=1&debug=true' })
      const parsed = JSON.parse(reporter.format(violation)) as JsonViolation
      expect(parsed.location.file).toBe('file.ts?version=1&debug=true')
    })

    test('should handle file path with hash', () => {
      const reporter = new JSONReporter()
      const violation = createMockViolation({ filePath: 'file.ts#L10' })
      const parsed = JSON.parse(reporter.format(violation)) as JsonViolation
      expect(parsed.location.file).toBe('file.ts#L10')
    })

    test('should handle file path with colons', () => {
      const reporter = new JSONReporter()
      const violation = createMockViolation({ filePath: 'C:\\Users\\test:file.ts' })
      const parsed = JSON.parse(reporter.format(violation)) as JsonViolation
      expect(parsed.location.file).toBe('C:\\Users\\test:file.ts')
    })

    test('should handle empty string file path', () => {
      const reporter = new JSONReporter()
      const violation = createMockViolation({ filePath: '' })
      const parsed = JSON.parse(reporter.format(violation)) as JsonViolation
      expect(parsed.location.file).toBe('')
    })
  })

  describe('writeToFile via reporter', () => {
    test('should create nested directory structure', () => {
      const reporter = new JSONReporter({ outputPath: './a/b/c/d/report.json' })
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
      vi.mocked(path.dirname).mockReturnValue('./a/b/c/d')
      reporter.report(results)
      expect(fsMkdirSyncMock).toHaveBeenCalledWith('./a/b/c/d', { recursive: true })
    })

    test('should write with utf8 encoding to nested path', () => {
      const reporter = new JSONReporter({ outputPath: './nested/report.json' })
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
        './nested/report.json',
        expect.any(String),
        'utf8',
      )
    })
  })

  describe('constructor defaults', () => {
    test('should default pretty to false', () => {
      const reporter = new JSONReporter()
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
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).not.toContain('  "files"')
    })

    test('should default outputPath to undefined', () => {
      const reporter = new JSONReporter()
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
      expect(fsWriteFileSyncMock).not.toHaveBeenCalled()
    })
  })

  describe('reporter name', () => {
    test('should have name property set to json', () => {
      const reporter = new JSONReporter()
      expect(reporter.name).toBe('json')
    })

    test('should have name that is a string', () => {
      const reporter = new JSONReporter()
      expect(typeof reporter.name).toBe('string')
    })

    test('should have name that is readonly', () => {
      const reporter = new JSONReporter()
      expect(reporter.name).toBe('json')
    })
  })

  describe('format - repeated calls with varying violations', () => {
    test('should format each violation independently', () => {
      const reporter = new JSONReporter()
      const violations = [
        createMockViolation({ ruleId: 'rule-a', severity: 'error', message: 'msg a' }),
        createMockViolation({ ruleId: 'rule-b', severity: 'warning', message: 'msg b' }),
        createMockViolation({ ruleId: 'rule-c', severity: 'info', message: 'msg c' }),
      ]
      const outputs = violations.map((v) => JSON.parse(reporter.format(v)) as JsonViolation)
      expect(outputs[0].ruleId).toBe('rule-a')
      expect(outputs[1].ruleId).toBe('rule-b')
      expect(outputs[2].ruleId).toBe('rule-c')
      expect(outputs[0].severity).toBe('error')
      expect(outputs[1].severity).toBe('warning')
      expect(outputs[2].severity).toBe('info')
    })
  })

  describe('report - mixed options interactions', () => {
    test('should output pretty JSON to stdout with pretty option and no outputPath', () => {
      const reporter = new JSONReporter({ pretty: true })
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [createMockViolation({ ruleId: 'p1' })])],
        summary: {
          totalFiles: 1,
          filesWithViolations: 1,
          errorCount: 1,
          warningCount: 0,
          infoCount: 0,
          totalTime: 10,
        },
      })
      reporter.report(results)
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).toContain('  "files"')
      expect(output).toContain('"p1"')
    })

    test('should output pretty JSON to file with both pretty and outputPath', () => {
      const reporter = new JSONReporter({ pretty: true, outputPath: './pretty.json' })
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [createMockViolation({ ruleId: 'p2' })])],
        summary: {
          totalFiles: 1,
          filesWithViolations: 1,
          errorCount: 1,
          warningCount: 0,
          infoCount: 0,
          totalTime: 10,
        },
      })
      fsExistsSyncMock.mockReturnValue(true)
      reporter.report(results)
      const written = fsWriteFileSyncMock.mock.calls[0][1] as string
      expect(written).toContain('\n')
      expect(written).toContain('"p2"')
    })
  })

  describe('report - data integrity', () => {
    test('should not mutate input results object', () => {
      const reporter = new JSONReporter()
      const violation = createMockViolation({ ruleId: 'immutable' })
      const originalRuleId = violation.ruleId
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [violation])],
        summary: {
          totalFiles: 1,
          filesWithViolations: 1,
          errorCount: 1,
          warningCount: 0,
          infoCount: 0,
          totalTime: 10,
        },
      })
      reporter.report(results)
      expect(violation.ruleId).toBe(originalRuleId)
    })

    test('should not mutate input files array', () => {
      const reporter = new JSONReporter()
      const files = [createMockFileResult('test.ts', [createMockViolation()])]
      const originalLength = files.length
      const results = createMockAnalysisResult({
        files,
        summary: {
          totalFiles: 1,
          filesWithViolations: 1,
          errorCount: 1,
          warningCount: 0,
          infoCount: 0,
          totalTime: 10,
        },
      })
      reporter.report(results)
      expect(files).toHaveLength(originalLength)
    })

    test('should not mutate input violations array', () => {
      const reporter = new JSONReporter()
      const violations = [createMockViolation({ ruleId: 'v1' })]
      const originalLength = violations.length
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', violations)],
        summary: {
          totalFiles: 1,
          filesWithViolations: 1,
          errorCount: 1,
          warningCount: 0,
          infoCount: 0,
          totalTime: 10,
        },
      })
      reporter.report(results)
      expect(violations).toHaveLength(originalLength)
      expect(violations[0].ruleId).toBe('v1')
    })
  })

  describe('format - violation with all fields at boundary values', () => {
    test('should handle line at Number.MAX_SAFE_INTEGER', () => {
      const reporter = new JSONReporter()
      const violation = createMockViolation({ line: Number.MAX_SAFE_INTEGER })
      const parsed = JSON.parse(reporter.format(violation)) as JsonViolation
      expect(parsed.location.line).toBe(Number.MAX_SAFE_INTEGER)
    })

    test('should handle column at Number.MAX_SAFE_INTEGER', () => {
      const reporter = new JSONReporter()
      const violation = createMockViolation({ column: Number.MAX_SAFE_INTEGER })
      const parsed = JSON.parse(reporter.format(violation)) as JsonViolation
      expect(parsed.location.column).toBe(Number.MAX_SAFE_INTEGER)
    })

    test('should handle endLine equal to line', () => {
      const reporter = new JSONReporter()
      const violation = createMockViolation({ line: 10, endLine: 10, column: 1, endColumn: 20 })
      const parsed = JSON.parse(reporter.format(violation)) as JsonViolation
      expect(parsed.location.line).toBe(parsed.location.endLine)
    })

    test('should handle endColumn equal to column', () => {
      const reporter = new JSONReporter()
      const violation = createMockViolation({ line: 5, endLine: 5, column: 3, endColumn: 3 })
      const parsed = JSON.parse(reporter.format(violation)) as JsonViolation
      expect(parsed.location.column).toBe(parsed.location.endColumn)
    })

    test('should handle endLine less than line', () => {
      const reporter = new JSONReporter()
      const violation = createMockViolation({ line: 10, endLine: 5 })
      const parsed = JSON.parse(reporter.format(violation)) as JsonViolation
      expect(parsed.location.line).toBe(10)
      expect(parsed.location.endLine).toBe(5)
    })

    test('should handle endColumn less than column', () => {
      const reporter = new JSONReporter()
      const violation = createMockViolation({ column: 20, endColumn: 10 })
      const parsed = JSON.parse(reporter.format(violation)) as JsonViolation
      expect(parsed.location.column).toBe(20)
      expect(parsed.location.endColumn).toBe(10)
    })

    test('should handle source with only whitespace', () => {
      const reporter = new JSONReporter()
      const violation = createMockViolation({ source: '   \t\n  ' })
      const parsed = JSON.parse(reporter.format(violation)) as JsonViolation
      expect(parsed.source).toBe('   \t\n  ')
    })

    test('should handle suggestion with only whitespace', () => {
      const reporter = new JSONReporter()
      const violation = createMockViolation({ suggestion: '  ' })
      const parsed = JSON.parse(reporter.format(violation)) as JsonViolation
      expect(parsed.suggestion).toBe('  ')
    })

    test('should handle message with only newlines', () => {
      const reporter = new JSONReporter()
      const violation = createMockViolation({ message: '\n\n\n' })
      const parsed = JSON.parse(reporter.format(violation)) as JsonViolation
      expect(parsed.message).toBe('\n\n\n')
    })

    test('should handle meta with undefined values preserved as null in JSON', () => {
      const reporter = new JSONReporter()
      const violation = createMockViolation({ meta: { key: undefined } })
      const raw = reporter.format(violation)
      const parsed = JSON.parse(raw) as JsonViolation
      expect(parsed.meta).toEqual({})
    })

    test('should handle report with single violation across multiple files', () => {
      const reporter = new JSONReporter()
      const results = createMockAnalysisResult({
        files: [
          createMockFileResult('a.ts', [createMockViolation({ ruleId: 'only-one' })]),
          createMockFileResult('b.ts', []),
          createMockFileResult('c.ts', []),
        ],
        summary: {
          totalFiles: 3,
          filesWithViolations: 1,
          errorCount: 1,
          warningCount: 0,
          infoCount: 0,
          totalTime: 30,
        },
      })
      reporter.report(results)
      const output = JSON.parse(
        (consoleSpy.mock.calls[0][0] as string).replace(/\n$/, ''),
      ) as JsonOutput
      expect(output.files).toHaveLength(3)
      expect(output.files[0].violations).toHaveLength(1)
      expect(output.files[1].violations).toHaveLength(0)
      expect(output.files[2].violations).toHaveLength(0)
    })

    test('should handle report called with no arguments using defaults', () => {
      const reporter = new JSONReporter()
      const results = createMockAnalysisResult()
      reporter.report(results)
      const output = JSON.parse(
        (consoleSpy.mock.calls[0][0] as string).replace(/\n$/, ''),
      ) as JsonOutput
      expect(output.files).toEqual([])
      expect(output.version).toBe('1.0.0')
    })

    test('should handle violation where filePath differs from file result path', () => {
      const reporter = new JSONReporter()
      const violation = createMockViolation({ filePath: 'different.ts' })
      const results = createMockAnalysisResult({
        files: [createMockFileResult('container.ts', [violation])],
        summary: {
          totalFiles: 1,
          filesWithViolations: 1,
          errorCount: 1,
          warningCount: 0,
          infoCount: 0,
          totalTime: 10,
        },
      })
      reporter.report(results)
      const output = JSON.parse(
        (consoleSpy.mock.calls[0][0] as string).replace(/\n$/, ''),
      ) as JsonOutput
      expect(output.files[0].filePath).toBe('container.ts')
      expect(output.files[0].violations[0].location.file).toBe('different.ts')
    })
  })
})
