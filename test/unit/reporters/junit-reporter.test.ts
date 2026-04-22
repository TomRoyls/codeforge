import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import * as fs from 'fs'
import * as path from 'path'
import { JUnitReporter } from '../../../src/reporters/junit-reporter.js'
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

describe('JUnitReporter', () => {
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
      const reporter = new JUnitReporter()
      expect(reporter.name).toBe('junit')
    })

    test('should accept outputPath option', () => {
      const reporter = new JUnitReporter({ outputPath: './junit.xml' })
      expect(reporter.name).toBe('junit')
    })

    test('should handle empty options object', () => {
      const reporter = new JUnitReporter({})
      expect(reporter.name).toBe('junit')
    })
  })

  describe('format', () => {
    test('should format violation as string', () => {
      const reporter = new JUnitReporter()
      const violation = createMockViolation()
      const output = reporter.format(violation)
      expect(output).toContain('[ERROR]')
      expect(output).toContain('test.ts')
      expect(output).toContain('10:5')
      expect(output).toContain('Test violation message')
    })

    test('should format warning severity', () => {
      const reporter = new JUnitReporter()
      const violation = createMockViolation({ severity: 'warning' })
      const output = reporter.format(violation)
      expect(output).toContain('[WARNING]')
    })

    test('should format info severity', () => {
      const reporter = new JUnitReporter()
      const violation = createMockViolation({ severity: 'info' })
      const output = reporter.format(violation)
      expect(output).toContain('[INFO]')
    })

    test('should include ruleId in formatted output', () => {
      const reporter = new JUnitReporter()
      const violation = createMockViolation({ ruleId: 'my-custom-rule' })
      const output = reporter.format(violation)
      expect(output).toContain('my-custom-rule')
    })
  })

  describe('report to console', () => {
    test('should output XML to console when no outputPath', () => {
      const reporter = new JUnitReporter()
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
      expect(output).toContain('<?xml version="1.0" encoding="UTF-8"?>')
      expect(output).toContain('<testsuites')
      expect(output).toContain('</testsuites>')
    })

    test('should include testsuites element', () => {
      const reporter = new JUnitReporter()
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
      expect(output).toContain('<testsuites')
      expect(output).toContain('name="CodeForge Analysis"')
    })

    test('should include summary counts in testsuites', () => {
      const reporter = new JUnitReporter()
      const results = createMockAnalysisResult({
        files: [],
        summary: {
          totalFiles: 5,
          filesWithViolations: 2,
          errorCount: 3,
          warningCount: 2,
          infoCount: 1,
          totalTime: 500,
        },
      })
      reporter.report(results)
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).toContain('tests="6"')
      expect(output).toContain('errors="3"')
      expect(output).toContain('failures="3"')
    })

    test('should include timestamp in testsuite', () => {
      const reporter = new JUnitReporter()
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [])],
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
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).toContain('timestamp=')
      expect(output).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
    })

    test('should include time attribute', () => {
      const reporter = new JUnitReporter()
      const results = createMockAnalysisResult({
        files: [],
        summary: {
          totalFiles: 0,
          filesWithViolations: 0,
          errorCount: 0,
          warningCount: 0,
          infoCount: 0,
          totalTime: 1500,
        },
      })
      reporter.report(results)
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).toContain('time="1.500"')
    })

    test('should create testsuite for each file', () => {
      const reporter = new JUnitReporter()
      const results = createMockAnalysisResult({
        files: [createMockFileResult('file1.ts', []), createMockFileResult('file2.ts', [])],
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
      const output = consoleSpy.mock.calls[0][0] as string
      const testsuiteMatches = output.match(/<testsuite\s/g)
      expect(testsuiteMatches).toHaveLength(2)
      expect(output).toContain('name="file1.ts"')
      expect(output).toContain('name="file2.ts"')
    })
  })

  describe('testcase generation', () => {
    test('should create testcase for error severity', () => {
      const reporter = new JUnitReporter()
      const results = createMockAnalysisResult({
        files: [
          createMockFileResult('test.ts', [
            createMockViolation({ severity: 'error', message: 'Error message' }),
          ]),
        ],
        summary: {
          totalFiles: 1,
          filesWithViolations: 1,
          errorCount: 1,
          warningCount: 0,
          infoCount: 0,
          totalTime: 30,
        },
      })
      reporter.report(results)
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).toContain('<testcase')
      expect(output).toContain('<error')
      expect(output).toContain('message="Error message"')
    })

    test('should create testcase with failure for warning severity', () => {
      const reporter = new JUnitReporter()
      const results = createMockAnalysisResult({
        files: [
          createMockFileResult('test.ts', [
            createMockViolation({ severity: 'warning', message: 'Warning message' }),
          ]),
        ],
        summary: {
          totalFiles: 1,
          filesWithViolations: 1,
          errorCount: 0,
          warningCount: 1,
          infoCount: 0,
          totalTime: 30,
        },
      })
      reporter.report(results)
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).toContain('<testcase')
      expect(output).toContain('<failure')
      expect(output).toContain('message="Warning message"')
      expect(output).toContain('type="warning"')
    })

    test('should create testcase with failure for info severity', () => {
      const reporter = new JUnitReporter()
      const results = createMockAnalysisResult({
        files: [
          createMockFileResult('test.ts', [
            createMockViolation({ severity: 'info', message: 'Info message' }),
          ]),
        ],
        summary: {
          totalFiles: 1,
          filesWithViolations: 1,
          errorCount: 0,
          warningCount: 0,
          infoCount: 1,
          totalTime: 30,
        },
      })
      reporter.report(results)
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).toContain('<testcase')
      expect(output).toContain('<failure')
      expect(output).toContain('message="Info message"')
      expect(output).toContain('type="info"')
    })

    test('should include location in error element', () => {
      const reporter = new JUnitReporter()
      const results = createMockAnalysisResult({
        files: [
          createMockFileResult('src/app.ts', [
            createMockViolation({ severity: 'error', line: 42, column: 10 }),
          ]),
        ],
        summary: {
          totalFiles: 1,
          filesWithViolations: 1,
          errorCount: 1,
          warningCount: 0,
          infoCount: 0,
          totalTime: 30,
        },
      })
      reporter.report(results)
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).toContain('Location: src/app.ts:42:10')
    })

    test('should include source when provided', () => {
      const reporter = new JUnitReporter()
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [createMockViolation({ source: 'const x = 1;' })])],
        summary: {
          totalFiles: 1,
          filesWithViolations: 1,
          errorCount: 1,
          warningCount: 0,
          infoCount: 0,
          totalTime: 30,
        },
      })
      reporter.report(results)
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).toContain('Source:')
      expect(output).toContain('const x = 1;')
    })

    test('should include suggestion when provided', () => {
      const reporter = new JUnitReporter()
      const results = createMockAnalysisResult({
        files: [
          createMockFileResult('test.ts', [
            createMockViolation({ suggestion: 'Use const instead' }),
          ]),
        ],
        summary: {
          totalFiles: 1,
          filesWithViolations: 1,
          errorCount: 1,
          warningCount: 0,
          infoCount: 0,
          totalTime: 30,
        },
      })
      reporter.report(results)
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).toContain('Suggestion:')
      expect(output).toContain('Use const instead')
    })

    test('should include ruleId in testcase name', () => {
      const reporter = new JUnitReporter()
      const results = createMockAnalysisResult({
        files: [
          createMockFileResult('test.ts', [createMockViolation({ ruleId: 'no-unused-vars' })]),
        ],
        summary: {
          totalFiles: 1,
          filesWithViolations: 1,
          errorCount: 1,
          warningCount: 0,
          infoCount: 0,
          totalTime: 30,
        },
      })
      reporter.report(results)
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).toContain('name="no-unused-vars')
    })

    test('should include filepath in classname', () => {
      const reporter = new JUnitReporter()
      const results = createMockAnalysisResult({
        files: [createMockFileResult('src/utils.ts', [createMockViolation()])],
        summary: {
          totalFiles: 1,
          filesWithViolations: 1,
          errorCount: 1,
          warningCount: 0,
          infoCount: 0,
          totalTime: 30,
        },
      })
      reporter.report(results)
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).toContain('classname="src/utils.ts"')
    })
  })

  describe('XML escaping', () => {
    test('should escape ampersand in message', () => {
      const reporter = new JUnitReporter()
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [createMockViolation({ message: 'A & B' })])],
        summary: {
          totalFiles: 1,
          filesWithViolations: 1,
          errorCount: 1,
          warningCount: 0,
          infoCount: 0,
          totalTime: 30,
        },
      })
      reporter.report(results)
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).toContain('message="A &amp; B"')
      expect(output).not.toContain('message="A & B"')
    })

    test('should escape less than symbol', () => {
      const reporter = new JUnitReporter()
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [createMockViolation({ message: 'a < b' })])],
        summary: {
          totalFiles: 1,
          filesWithViolations: 1,
          errorCount: 1,
          warningCount: 0,
          infoCount: 0,
          totalTime: 30,
        },
      })
      reporter.report(results)
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).toContain('a &lt; b')
    })

    test('should escape greater than symbol', () => {
      const reporter = new JUnitReporter()
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [createMockViolation({ message: 'a > b' })])],
        summary: {
          totalFiles: 1,
          filesWithViolations: 1,
          errorCount: 1,
          warningCount: 0,
          infoCount: 0,
          totalTime: 30,
        },
      })
      reporter.report(results)
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).toContain('a &gt; b')
    })

    test('should escape quotes in message', () => {
      const reporter = new JUnitReporter()
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [createMockViolation({ message: 'Say "hello"' })])],
        summary: {
          totalFiles: 1,
          filesWithViolations: 1,
          errorCount: 1,
          warningCount: 0,
          infoCount: 0,
          totalTime: 30,
        },
      })
      reporter.report(results)
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).toContain('Say &quot;hello&quot;')
    })

    test('should escape apostrophes', () => {
      const reporter = new JUnitReporter()
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [createMockViolation({ message: "It's me" })])],
        summary: {
          totalFiles: 1,
          filesWithViolations: 1,
          errorCount: 1,
          warningCount: 0,
          infoCount: 0,
          totalTime: 30,
        },
      })
      reporter.report(results)
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).toContain('It&apos;s me')
    })

    test('should escape filepath with special characters', () => {
      const reporter = new JUnitReporter()
      const results = createMockAnalysisResult({
        files: [createMockFileResult('src/file & test.ts', [createMockViolation()])],
        summary: {
          totalFiles: 1,
          filesWithViolations: 1,
          errorCount: 1,
          warningCount: 0,
          infoCount: 0,
          totalTime: 30,
        },
      })
      reporter.report(results)
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).toContain('name="src/file &amp; test.ts"')
    })
  })

  describe('report to file', () => {
    test('should write to file when outputPath is provided', () => {
      const reporter = new JUnitReporter({ outputPath: './junit.xml' })
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
      const reporter = new JUnitReporter({ outputPath: './reports/nested/junit.xml' })
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
      const reporter = new JUnitReporter({ outputPath: './reports/junit.xml' })
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

    test('should use utf-8 encoding', () => {
      const reporter = new JUnitReporter({ outputPath: './junit.xml' })
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
      expect(fsWriteFileSyncMock).toHaveBeenCalledWith('./junit.xml', expect.any(String), 'utf8')
    })

    test('should write valid XML to file', () => {
      const reporter = new JUnitReporter({ outputPath: './junit.xml' })
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [createMockViolation()])],
        summary: {
          totalFiles: 1,
          filesWithViolations: 1,
          errorCount: 1,
          warningCount: 0,
          infoCount: 0,
          totalTime: 30,
        },
      })
      fsExistsSyncMock.mockReturnValue(true)
      reporter.report(results)
      const writtenContent = fsWriteFileSyncMock.mock.calls[0][1] as string
      expect(writtenContent).toContain('<?xml version="1.0" encoding="UTF-8"?>')
      expect(writtenContent).toContain('<testsuites')
      expect(writtenContent).toContain('</testsuites>')
    })
  })

  describe('multiple files and violations', () => {
    test('should handle multiple files with multiple violations', () => {
      const reporter = new JUnitReporter()
      const results = createMockAnalysisResult({
        files: [
          createMockFileResult('a.ts', [
            createMockViolation({ ruleId: 'rule1', severity: 'error' }),
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
      const output = consoleSpy.mock.calls[0][0] as string
      const testsuiteMatches = output.match(/<testsuite\s/g)
      expect(testsuiteMatches).toHaveLength(2)
      const testcaseMatches = output.match(/<testcase/g)
      expect(testcaseMatches).toHaveLength(3)
    })

    test('should handle file with no violations', () => {
      const reporter = new JUnitReporter()
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
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).toContain('name="clean.ts"')
      expect(output).toContain('tests="0"')
      const testcaseMatches = output.match(/<testcase/g)
      expect(testcaseMatches).toBeNull()
    })
  })

  describe('edge cases', () => {
    test('should handle empty analysis result', () => {
      const reporter = new JUnitReporter()
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
      expect(output).toContain('<?xml version="1.0" encoding="UTF-8"?>')
      expect(output).toContain('tests="0"')
      expect(output).toContain('errors="0"')
      expect(output).toContain('failures="0"')
    })

    test('should handle deeply nested file path', () => {
      const reporter = new JUnitReporter({
        outputPath: './reports/2024/01/15/deep/nested/junit.xml',
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

    test('should handle unicode in file path', () => {
      const reporter = new JUnitReporter()
      const results = createMockAnalysisResult({
        files: [createMockFileResult('src/文件/测试.ts', [createMockViolation()])],
        summary: {
          totalFiles: 1,
          filesWithViolations: 1,
          errorCount: 1,
          warningCount: 0,
          infoCount: 0,
          totalTime: 30,
        },
      })
      reporter.report(results)
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).toContain('src/文件/测试.ts')
    })

    test('should handle violation without optional fields', () => {
      const reporter = new JUnitReporter()
      const minimalViolation: Violation = {
        ruleId: 'minimal',
        severity: 'error',
        message: 'Minimal violation',
        filePath: 'test.ts',
        line: 1,
        column: 1,
      }
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [minimalViolation])],
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
      expect(output).toContain('Location: test.ts:1:1')
      expect(output).not.toContain('Source:')
      expect(output).not.toContain('Suggestion:')
    })

    test('should handle large message with newlines and tabs', () => {
      const reporter = new JUnitReporter()
      const results = createMockAnalysisResult({
        files: [
          createMockFileResult('test.ts', [
            createMockViolation({ message: 'Line 1\nLine 2\tIndented' }),
          ]),
        ],
        summary: {
          totalFiles: 1,
          filesWithViolations: 1,
          errorCount: 1,
          warningCount: 0,
          infoCount: 0,
          totalTime: 30,
        },
      })
      reporter.report(results)
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).toContain('message="Line 1')
      expect(output).toContain('Line 2')
    })
  })

  describe('format method extended', () => {
    test('should format violation with uppercase ERROR for error severity', () => {
      const reporter = new JUnitReporter()
      const output = reporter.format(createMockViolation({ severity: 'error' }))
      expect(output).toContain('[ERROR]')
    })

    test('should format violation with uppercase WARNING for warning severity', () => {
      const reporter = new JUnitReporter()
      const output = reporter.format(createMockViolation({ severity: 'warning' }))
      expect(output).toContain('[WARNING]')
    })

    test('should format violation with uppercase INFO for info severity', () => {
      const reporter = new JUnitReporter()
      const output = reporter.format(createMockViolation({ severity: 'info' }))
      expect(output).toContain('[INFO]')
    })

    test('should format with correct file path', () => {
      const reporter = new JUnitReporter()
      const output = reporter.format(createMockViolation({ filePath: 'src/deep/file.ts' }))
      expect(output).toContain('src/deep/file.ts:')
    })

    test('should format with correct line and column', () => {
      const reporter = new JUnitReporter()
      const output = reporter.format(createMockViolation({ line: 99, column: 42 }))
      expect(output).toContain('99:42')
    })

    test('should format with line 1 column 1', () => {
      const reporter = new JUnitReporter()
      const output = reporter.format(createMockViolation({ line: 1, column: 1 }))
      expect(output).toContain('1:1')
    })

    test('should format with ruleId in brackets', () => {
      const reporter = new JUnitReporter()
      const output = reporter.format(createMockViolation({ ruleId: 'my-rule' }))
      expect(output).toContain('[my-rule]')
    })

    test('should format with message at the end', () => {
      const reporter = new JUnitReporter()
      const output = reporter.format(createMockViolation({ message: 'Something broke' }))
      expect(output).toContain('Something broke')
    })

    test('should format long ruleId', () => {
      const reporter = new JUnitReporter()
      const output = reporter.format(
        createMockViolation({ ruleId: 'very-long-rule-name-with-many-hyphens' }),
      )
      expect(output).toContain('[very-long-rule-name-with-many-hyphens]')
    })

    test('should format with special characters in message', () => {
      const reporter = new JUnitReporter()
      const output = reporter.format(createMockViolation({ message: 'Use <T> instead of "any"' }))
      expect(output).toContain('Use <T> instead of "any"')
    })

    test('should format with unicode file path', () => {
      const reporter = new JUnitReporter()
      const output = reporter.format(createMockViolation({ filePath: 'src/üñíçödé.ts' }))
      expect(output).toContain('src/üñíçödé.ts')
    })

    test('should format with empty message', () => {
      const reporter = new JUnitReporter()
      const output = reporter.format(createMockViolation({ message: '' }))
      expect(output).toContain('[ERROR]')
      expect(output).toContain('test.ts')
    })

    test('should format with empty ruleId', () => {
      const reporter = new JUnitReporter()
      const output = reporter.format(createMockViolation({ ruleId: '' }))
      expect(output).toContain('[]')
    })

    test('should format with large line number', () => {
      const reporter = new JUnitReporter()
      const output = reporter.format(createMockViolation({ line: 99999 }))
      expect(output).toContain('99999')
    })

    test('should format with large column number', () => {
      const reporter = new JUnitReporter()
      const output = reporter.format(createMockViolation({ column: 500 }))
      expect(output).toContain('500')
    })

    test('should format output contains all components', () => {
      const reporter = new JUnitReporter()
      const v = createMockViolation({
        severity: 'error',
        ruleId: 'no-console',
        filePath: 'app.ts',
        line: 10,
        column: 5,
        message: 'Do not use console',
      })
      const output = reporter.format(v)
      expect(output).toBe('[ERROR] [no-console] app.ts:10:5 Do not use console')
    })
  })

  describe('constructor extended', () => {
    test('should create reporter without arguments', () => {
      const reporter = new JUnitReporter()
      expect(reporter).toBeDefined()
      expect(reporter.name).toBe('junit')
    })

    test('should accept undefined options', () => {
      const reporter = new JUnitReporter(undefined)
      expect(reporter.name).toBe('junit')
    })

    test('should accept options with color property', () => {
      const reporter = new JUnitReporter({ color: true })
      expect(reporter.name).toBe('junit')
    })

    test('should accept options with verbose property', () => {
      const reporter = new JUnitReporter({ verbose: true })
      expect(reporter.name).toBe('junit')
    })

    test('should accept options with quiet property', () => {
      const reporter = new JUnitReporter({ quiet: true })
      expect(reporter.name).toBe('junit')
    })

    test('should accept options with pretty property', () => {
      const reporter = new JUnitReporter({ pretty: true })
      expect(reporter.name).toBe('junit')
    })

    test('should accept options with includeSource property', () => {
      const reporter = new JUnitReporter({ includeSource: true })
      expect(reporter.name).toBe('junit')
    })

    test('should accept options with errorsOnly property', () => {
      const reporter = new JUnitReporter({ errorsOnly: true })
      expect(reporter.name).toBe('junit')
    })

    test('should accept multiple options at once', () => {
      const reporter = new JUnitReporter({ outputPath: 'out.xml', verbose: true, color: false })
      expect(reporter.name).toBe('junit')
    })
  })

  describe('report console output extended', () => {
    test('should produce XML with XML declaration', () => {
      const reporter = new JUnitReporter()
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
      expect(output).toContain('<?xml version="1.0" encoding="UTF-8"?>')
    })

    test('should produce testsuites with name attribute', () => {
      const reporter = new JUnitReporter()
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
      expect(output).toContain('name="CodeForge Analysis"')
    })

    test('should output newline after XML when writing to console', () => {
      const reporter = new JUnitReporter()
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
      expect(output.endsWith('\n')).toBe(true)
    })

    test('should compute tests from error + warning + info counts', () => {
      const reporter = new JUnitReporter()
      const results = createMockAnalysisResult({
        files: [],
        summary: {
          totalFiles: 10,
          filesWithViolations: 3,
          errorCount: 5,
          warningCount: 3,
          infoCount: 2,
          totalTime: 100,
        },
      })
      reporter.report(results)
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).toContain('tests="10"')
    })

    test('should compute failures from warning + info counts', () => {
      const reporter = new JUnitReporter()
      const results = createMockAnalysisResult({
        files: [],
        summary: {
          totalFiles: 10,
          filesWithViolations: 3,
          errorCount: 5,
          warningCount: 3,
          infoCount: 2,
          totalTime: 100,
        },
      })
      reporter.report(results)
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).toContain('failures="5"')
    })

    test('should set errors attribute to errorCount', () => {
      const reporter = new JUnitReporter()
      const results = createMockAnalysisResult({
        files: [],
        summary: {
          totalFiles: 10,
          filesWithViolations: 3,
          errorCount: 7,
          warningCount: 2,
          infoCount: 1,
          totalTime: 100,
        },
      })
      reporter.report(results)
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).toContain('errors="7"')
    })

    test('should format zero totalTime as 0.000', () => {
      const reporter = new JUnitReporter()
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
      expect(output).toContain('time="0.000"')
    })

    test('should format totalTime less than 1 second', () => {
      const reporter = new JUnitReporter()
      const results = createMockAnalysisResult({
        files: [],
        summary: {
          totalFiles: 0,
          filesWithViolations: 0,
          errorCount: 0,
          warningCount: 0,
          infoCount: 0,
          totalTime: 250,
        },
      })
      reporter.report(results)
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).toContain('time="0.250"')
    })

    test('should format large totalTime', () => {
      const reporter = new JUnitReporter()
      const results = createMockAnalysisResult({
        files: [],
        summary: {
          totalFiles: 0,
          filesWithViolations: 0,
          errorCount: 0,
          warningCount: 0,
          infoCount: 0,
          totalTime: 60000,
        },
      })
      reporter.report(results)
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).toContain('time="60.000"')
    })

    test('should close testsuites element', () => {
      const reporter = new JUnitReporter()
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
      expect(output).toContain('</testsuites>')
    })

    test('should produce well-formed XML structure for empty results', () => {
      const reporter = new JUnitReporter()
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
      expect(output).toMatch(/<\?xml[^?]*\?>\n<testsuites[^>]*>\n<\/testsuites>\n?$/)
    })

    test('should call console once per report call', () => {
      const reporter = new JUnitReporter()
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
      expect(consoleSpy).toHaveBeenCalledTimes(1)
    })

    test('should support multiple report calls', () => {
      const reporter = new JUnitReporter()
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
      reporter.report(results)
      expect(consoleSpy).toHaveBeenCalledTimes(2)
    })
  })

  describe('testsuite generation', () => {
    test('should include testsuite with file name', () => {
      const reporter = new JUnitReporter()
      const results = createMockAnalysisResult({
        files: [createMockFileResult('my-file.ts', [])],
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
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).toContain('name="my-file.ts"')
    })

    test('should include tests count in testsuite matching violations count', () => {
      const reporter = new JUnitReporter()
      const results = createMockAnalysisResult({
        files: [
          createMockFileResult('test.ts', [
            createMockViolation(),
            createMockViolation({ severity: 'warning' }),
            createMockViolation({ severity: 'info' }),
          ]),
        ],
        summary: {
          totalFiles: 1,
          filesWithViolations: 1,
          errorCount: 1,
          warningCount: 1,
          infoCount: 1,
          totalTime: 30,
        },
      })
      reporter.report(results)
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).toContain('tests="3"')
    })

    test('should include failures count in testsuite', () => {
      const reporter = new JUnitReporter()
      const results = createMockAnalysisResult({
        files: [
          createMockFileResult('test.ts', [
            createMockViolation({ severity: 'warning' }),
            createMockViolation({ severity: 'info' }),
          ]),
        ],
        summary: {
          totalFiles: 1,
          filesWithViolations: 1,
          errorCount: 0,
          warningCount: 1,
          infoCount: 1,
          totalTime: 30,
        },
      })
      reporter.report(results)
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).toContain('failures="2"')
    })

    test('should include errors count in testsuite', () => {
      const reporter = new JUnitReporter()
      const results = createMockAnalysisResult({
        files: [
          createMockFileResult('test.ts', [
            createMockViolation({ severity: 'error' }),
            createMockViolation({ severity: 'error' }),
          ]),
        ],
        summary: {
          totalFiles: 1,
          filesWithViolations: 1,
          errorCount: 2,
          warningCount: 0,
          infoCount: 0,
          totalTime: 30,
        },
      })
      reporter.report(results)
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).toContain('errors="2"')
    })

    test('should include time in testsuite from file stats', () => {
      const reporter = new JUnitReporter()
      const results = createMockAnalysisResult({
        files: [
          createMockFileResult('test.ts', [], {
            parseTime: 50,
            analysisTime: 100,
            totalTime: 150,
          }),
        ],
        summary: {
          totalFiles: 1,
          filesWithViolations: 0,
          errorCount: 0,
          warningCount: 0,
          infoCount: 0,
          totalTime: 150,
        },
      })
      reporter.report(results)
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).toContain('time="0.150"')
    })

    test('should include timestamp in testsuite', () => {
      const reporter = new JUnitReporter()
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [])],
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
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).toMatch(/timestamp="\d{4}-\d{2}-\d{2}T/)
    })

    test('should close testsuite element', () => {
      const reporter = new JUnitReporter()
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [])],
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
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).toContain('</testsuite>')
    })

    test('should produce separate testsuites for each file', () => {
      const reporter = new JUnitReporter()
      const results = createMockAnalysisResult({
        files: [
          createMockFileResult('a.ts', []),
          createMockFileResult('b.ts', []),
          createMockFileResult('c.ts', []),
        ],
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
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).toContain('name="a.ts"')
      expect(output).toContain('name="b.ts"')
      expect(output).toContain('name="c.ts"')
    })

    test('should handle file with zero time stats', () => {
      const reporter = new JUnitReporter()
      const results = createMockAnalysisResult({
        files: [
          createMockFileResult('test.ts', [], { parseTime: 0, analysisTime: 0, totalTime: 0 }),
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
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).toContain('time="0.000"')
    })
  })

  describe('testcase generation extended', () => {
    test('should generate testcase name from ruleId and message', () => {
      const reporter = new JUnitReporter()
      const results = createMockAnalysisResult({
        files: [
          createMockFileResult('test.ts', [
            createMockViolation({ ruleId: 'no-console', message: 'Unexpected console' }),
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
      reporter.report(results)
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).toContain('name="no-console: Unexpected console"')
    })

    test('should close testcase element', () => {
      const reporter = new JUnitReporter()
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
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).toContain('</testcase>')
    })

    test('should include error type as ruleId for error severity', () => {
      const reporter = new JUnitReporter()
      const results = createMockAnalysisResult({
        files: [
          createMockFileResult('test.ts', [
            createMockViolation({ ruleId: 'custom-rule', severity: 'error' }),
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
      reporter.report(results)
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).toContain('type="custom-rule"')
    })

    test('should include failure type as severity for warning', () => {
      const reporter = new JUnitReporter()
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [createMockViolation({ severity: 'warning' })])],
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
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).toContain('type="warning"')
    })

    test('should include failure type as severity for info', () => {
      const reporter = new JUnitReporter()
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [createMockViolation({ severity: 'info' })])],
        summary: {
          totalFiles: 1,
          filesWithViolations: 1,
          errorCount: 0,
          warningCount: 0,
          infoCount: 1,
          totalTime: 10,
        },
      })
      reporter.report(results)
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).toContain('type="info"')
    })

    test('should include location in failure element', () => {
      const reporter = new JUnitReporter()
      const results = createMockAnalysisResult({
        files: [
          createMockFileResult('src/app.ts', [
            createMockViolation({ severity: 'warning', line: 42, column: 10 }),
          ]),
        ],
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
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).toContain('Location: src/app.ts:42:10')
    })

    test('should include source in failure element when provided', () => {
      const reporter = new JUnitReporter()
      const results = createMockAnalysisResult({
        files: [
          createMockFileResult('test.ts', [
            createMockViolation({
              severity: 'warning',
              source: 'let x = 1;',
            }),
          ]),
        ],
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
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).toContain('Source:')
      expect(output).toContain('let x = 1;')
    })

    test('should include suggestion in failure element when provided', () => {
      const reporter = new JUnitReporter()
      const results = createMockAnalysisResult({
        files: [
          createMockFileResult('test.ts', [
            createMockViolation({
              severity: 'info',
              suggestion: 'Consider refactoring',
            }),
          ]),
        ],
        summary: {
          totalFiles: 1,
          filesWithViolations: 1,
          errorCount: 0,
          warningCount: 0,
          infoCount: 1,
          totalTime: 10,
        },
      })
      reporter.report(results)
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).toContain('Suggestion:')
      expect(output).toContain('Consider refactoring')
    })

    test('should include both source and suggestion when both provided', () => {
      const reporter = new JUnitReporter()
      const results = createMockAnalysisResult({
        files: [
          createMockFileResult('test.ts', [
            createMockViolation({
              source: 'var x = 1;',
              suggestion: 'Use let or const',
            }),
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
      reporter.report(results)
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).toContain('Source:')
      expect(output).toContain('var x = 1;')
      expect(output).toContain('Suggestion:')
      expect(output).toContain('Use let or const')
    })

    test('should generate multiple testcases for multiple violations', () => {
      const reporter = new JUnitReporter()
      const violations = Array.from({ length: 5 }, (_, i) =>
        createMockViolation({ ruleId: `rule-${i}` }),
      )
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', violations)],
        summary: {
          totalFiles: 1,
          filesWithViolations: 1,
          errorCount: 5,
          warningCount: 0,
          infoCount: 0,
          totalTime: 10,
        },
      })
      reporter.report(results)
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).toContain('name="rule-0')
      expect(output).toContain('name="rule-1')
      expect(output).toContain('name="rule-2')
      expect(output).toContain('name="rule-3')
      expect(output).toContain('name="rule-4')
    })

    test('should close error element', () => {
      const reporter = new JUnitReporter()
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [createMockViolation({ severity: 'error' })])],
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
      expect(output).toContain('</error>')
    })

    test('should close failure element', () => {
      const reporter = new JUnitReporter()
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [createMockViolation({ severity: 'warning' })])],
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
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).toContain('</failure>')
    })

    test('should use classname matching file path', () => {
      const reporter = new JUnitReporter()
      const results = createMockAnalysisResult({
        files: [createMockFileResult('deep/nested/path/file.ts', [createMockViolation()])],
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
      expect(output).toContain('classname="deep/nested/path/file.ts"')
    })
  })

  describe('XML escaping extended', () => {
    test('should escape multiple ampersands', () => {
      const reporter = new JUnitReporter()
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [createMockViolation({ message: 'A & B & C' })])],
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
      expect(output).toContain('A &amp; B &amp; C')
    })

    test('should escape combination of special characters', () => {
      const reporter = new JUnitReporter()
      const results = createMockAnalysisResult({
        files: [
          createMockFileResult('test.ts', [
            createMockViolation({ message: 'if (a < b && c > d) "yes"' }),
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
      reporter.report(results)
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).toContain('&lt;')
      expect(output).toContain('&amp;')
      expect(output).toContain('&gt;')
      expect(output).toContain('&quot;')
    })

    test('should escape special characters in source field', () => {
      const reporter = new JUnitReporter()
      const results = createMockAnalysisResult({
        files: [
          createMockFileResult('test.ts', [
            createMockViolation({ source: 'if (x < 10 && y > 5)' }),
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
      reporter.report(results)
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).toContain('if (x &lt; 10 &amp;&amp; y &gt; 5)')
    })

    test('should escape special characters in suggestion field', () => {
      const reporter = new JUnitReporter()
      const results = createMockAnalysisResult({
        files: [
          createMockFileResult('test.ts', [
            createMockViolation({ suggestion: 'Use <T> instead of "any"' }),
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
      reporter.report(results)
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).toContain('&lt;T&gt;')
      expect(output).toContain('&quot;any&quot;')
    })

    test('should escape special characters in ruleId for testcase name', () => {
      const reporter = new JUnitReporter()
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [createMockViolation({ ruleId: 'rule<&>' })])],
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
      expect(output).toContain('rule&lt;&amp;&gt;')
    })

    test('should escape special characters in file path in classname', () => {
      const reporter = new JUnitReporter()
      const results = createMockAnalysisResult({
        files: [createMockFileResult('path/to & from/file.ts', [createMockViolation()])],
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
      expect(output).toContain('classname="path/to &amp; from/file.ts"')
    })

    test('should escape apostrophe in file path', () => {
      const reporter = new JUnitReporter()
      const results = createMockAnalysisResult({
        files: [createMockFileResult("owner's-file.ts", [createMockViolation()])],
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
      expect(output).toContain('owner&apos;s-file.ts')
    })

    test('should escape quotes in file path for testsuite name', () => {
      const reporter = new JUnitReporter()
      const results = createMockAnalysisResult({
        files: [createMockFileResult('file "named".ts', [createMockViolation()])],
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
      expect(output).toContain('name="file &quot;named&quot;.ts"')
    })

    test('should not alter plain text without special chars', () => {
      const reporter = new JUnitReporter()
      const results = createMockAnalysisResult({
        files: [
          createMockFileResult('plain-file.ts', [
            createMockViolation({ message: 'Simple message' }),
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
      reporter.report(results)
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).toContain('message="Simple message"')
    })
  })

  describe('report to file extended', () => {
    test('should not call console when outputPath is set', () => {
      const reporter = new JUnitReporter({ outputPath: './output.xml' })
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

    test('should write file to specified path', () => {
      const reporter = new JUnitReporter({ outputPath: './custom-report.xml' })
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
        './custom-report.xml',
        expect.any(String),
        'utf8',
      )
    })

    test('should write XML declaration to file', () => {
      const reporter = new JUnitReporter({ outputPath: './junit.xml' })
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
      expect(writtenContent).toContain('<?xml version="1.0" encoding="UTF-8"?>')
    })

    test('should write violations content to file', () => {
      const reporter = new JUnitReporter({ outputPath: './junit.xml' })
      const results = createMockAnalysisResult({
        files: [
          createMockFileResult('src/main.ts', [
            createMockViolation({ ruleId: 'no-unused-vars', severity: 'error' }),
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
      const writtenContent = fsWriteFileSyncMock.mock.calls[0][1] as string
      expect(writtenContent).toContain('no-unused-vars')
      expect(writtenContent).toContain('<error')
    })

    test('should create nested directory structure', () => {
      const reporter = new JUnitReporter({ outputPath: './a/b/c/report.xml' })
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
      vi.mocked(path.dirname).mockReturnValue('./a/b/c')
      reporter.report(results)
      expect(fsMkdirSyncMock).toHaveBeenCalledWith('./a/b/c', { recursive: true })
    })

    test('should write file with violations data', () => {
      const reporter = new JUnitReporter({ outputPath: './report.xml' })
      const results = createMockAnalysisResult({
        files: [
          createMockFileResult('test.ts', [
            createMockViolation({ severity: 'error', message: 'Test error' }),
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
      const writtenContent = fsWriteFileSyncMock.mock.calls[0][1] as string
      expect(writtenContent).toContain('message="Test error"')
    })

    test('should write file with warning data', () => {
      const reporter = new JUnitReporter({ outputPath: './report.xml' })
      const results = createMockAnalysisResult({
        files: [
          createMockFileResult('test.ts', [
            createMockViolation({ severity: 'warning', message: 'Test warning' }),
          ]),
        ],
        summary: {
          totalFiles: 1,
          filesWithViolations: 1,
          errorCount: 0,
          warningCount: 1,
          infoCount: 0,
          totalTime: 10,
        },
      })
      fsExistsSyncMock.mockReturnValue(true)
      reporter.report(results)
      const writtenContent = fsWriteFileSyncMock.mock.calls[0][1] as string
      expect(writtenContent).toContain('type="warning"')
    })
  })

  describe('multiple files and violations extended', () => {
    test('should handle 10 files', () => {
      const reporter = new JUnitReporter()
      const files = Array.from({ length: 10 }, (_, i) =>
        createMockFileResult(`file${i}.ts`, [createMockViolation()]),
      )
      const results = createMockAnalysisResult({
        files,
        summary: {
          totalFiles: 10,
          filesWithViolations: 10,
          errorCount: 10,
          warningCount: 0,
          infoCount: 0,
          totalTime: 100,
        },
      })
      reporter.report(results)
      const output = consoleSpy.mock.calls[0][0] as string
      const testsuiteMatches = output.match(/<testsuite\s/g)
      expect(testsuiteMatches).toHaveLength(10)
    })

    test('should handle file with many violations', () => {
      const reporter = new JUnitReporter()
      const violations = Array.from({ length: 20 }, (_, i) =>
        createMockViolation({ ruleId: `rule-${i}` }),
      )
      const results = createMockAnalysisResult({
        files: [createMockFileResult('big.ts', violations)],
        summary: {
          totalFiles: 1,
          filesWithViolations: 1,
          errorCount: 20,
          warningCount: 0,
          infoCount: 0,
          totalTime: 100,
        },
      })
      reporter.report(results)
      const output = consoleSpy.mock.calls[0][0] as string
      const testcaseMatches = output.match(/<testcase/g)
      expect(testcaseMatches).toHaveLength(20)
    })

    test('should handle mixed severities across files', () => {
      const reporter = new JUnitReporter()
      const results = createMockAnalysisResult({
        files: [
          createMockFileResult('errors.ts', [
            createMockViolation({ severity: 'error' }),
            createMockViolation({ severity: 'error' }),
          ]),
          createMockFileResult('warnings.ts', [createMockViolation({ severity: 'warning' })]),
          createMockFileResult('mixed.ts', [
            createMockViolation({ severity: 'error' }),
            createMockViolation({ severity: 'warning' }),
            createMockViolation({ severity: 'info' }),
          ]),
        ],
        summary: {
          totalFiles: 3,
          filesWithViolations: 3,
          errorCount: 3,
          warningCount: 2,
          infoCount: 1,
          totalTime: 100,
        },
      })
      reporter.report(results)
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).toContain('tests="6"')
      expect(output).toContain('failures="3"')
      expect(output).toContain('errors="3"')
    })

    test('should handle files with no violations among files with violations', () => {
      const reporter = new JUnitReporter()
      const results = createMockAnalysisResult({
        files: [
          createMockFileResult('clean.ts', []),
          createMockFileResult('dirty.ts', [createMockViolation()]),
          createMockFileResult('also-clean.ts', []),
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
      const output = consoleSpy.mock.calls[0][0] as string
      const testsuiteMatches = output.match(/<testsuite\s/g)
      expect(testsuiteMatches).toHaveLength(3)
    })

    test('should handle same file name in different paths', () => {
      const reporter = new JUnitReporter()
      const results = createMockAnalysisResult({
        files: [
          createMockFileResult('src/index.ts', [createMockViolation()]),
          createMockFileResult('test/index.ts', [createMockViolation()]),
        ],
        summary: {
          totalFiles: 2,
          filesWithViolations: 2,
          errorCount: 2,
          warningCount: 0,
          infoCount: 0,
          totalTime: 20,
        },
      })
      reporter.report(results)
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).toContain('classname="src/index.ts"')
      expect(output).toContain('classname="test/index.ts"')
    })

    test('should handle single file with all three severity types', () => {
      const reporter = new JUnitReporter()
      const results = createMockAnalysisResult({
        files: [
          createMockFileResult('mixed.ts', [
            createMockViolation({ severity: 'error', message: 'Error' }),
            createMockViolation({ severity: 'warning', message: 'Warning' }),
            createMockViolation({ severity: 'info', message: 'Info' }),
          ]),
        ],
        summary: {
          totalFiles: 1,
          filesWithViolations: 1,
          errorCount: 1,
          warningCount: 1,
          infoCount: 1,
          totalTime: 30,
        },
      })
      reporter.report(results)
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).toContain('<error')
      expect(output).toContain('<failure')
      expect(output).toContain('message="Error"')
      expect(output).toContain('message="Warning"')
      expect(output).toContain('message="Info"')
    })
  })

  describe('violation optional fields', () => {
    test('should handle violation with endLine', () => {
      const reporter = new JUnitReporter()
      const violation: Violation = {
        ruleId: 'test',
        severity: 'error',
        message: 'Multi-line issue',
        filePath: 'test.ts',
        line: 10,
        column: 5,
        endLine: 15,
      }
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
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).toContain('Location: test.ts:10:5')
    })

    test('should handle violation with endColumn', () => {
      const reporter = new JUnitReporter()
      const violation: Violation = {
        ruleId: 'test',
        severity: 'error',
        message: 'Range issue',
        filePath: 'test.ts',
        line: 10,
        column: 5,
        endColumn: 20,
      }
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
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).toContain('Location: test.ts:10:5')
    })

    test('should handle violation with endLine and endColumn', () => {
      const reporter = new JUnitReporter()
      const violation: Violation = {
        ruleId: 'range-rule',
        severity: 'error',
        message: 'Range',
        filePath: 'test.ts',
        line: 10,
        column: 5,
        endLine: 15,
        endColumn: 20,
      }
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
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).toContain('Location: test.ts:10:5')
    })

    test('should handle violation with meta field', () => {
      const reporter = new JUnitReporter()
      const violation: Violation = {
        ruleId: 'test',
        severity: 'error',
        message: 'With meta',
        filePath: 'test.ts',
        line: 1,
        column: 1,
        meta: { complexity: 15, category: 'complexity' },
      }
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
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).toContain('Location: test.ts:1:1')
    })

    test('should handle violation with multi-line source', () => {
      const reporter = new JUnitReporter()
      const results = createMockAnalysisResult({
        files: [
          createMockFileResult('test.ts', [
            createMockViolation({
              source: 'line 1\nline 2\nline 3',
            }),
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
      reporter.report(results)
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).toContain('Source:')
      expect(output).toContain('line 1')
      expect(output).toContain('line 2')
      expect(output).toContain('line 3')
    })

    test('should handle violation with source containing special chars', () => {
      const reporter = new JUnitReporter()
      const results = createMockAnalysisResult({
        files: [
          createMockFileResult('test.ts', [
            createMockViolation({
              source: 'if (a < b && c > d) return "yes"',
            }),
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
      reporter.report(results)
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).toContain('if (a &lt; b &amp;&amp; c &gt; d) return &quot;yes&quot;')
    })

    test('should handle violation with suggestion containing special chars', () => {
      const reporter = new JUnitReporter()
      const results = createMockAnalysisResult({
        files: [
          createMockFileResult('test.ts', [
            createMockViolation({
              suggestion: 'Replace "x" with <y>',
            }),
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
      reporter.report(results)
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).toContain('Replace &quot;x&quot; with &lt;y&gt;')
    })
  })

  describe('analysis result variations', () => {
    test('should handle result with version field', () => {
      const reporter = new JUnitReporter()
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
        version: '1.0.0',
      })
      reporter.report(results)
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).toContain('<?xml version="1.0" encoding="UTF-8"?>')
    })

    test('should handle result with different timestamp', () => {
      const reporter = new JUnitReporter()
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
        timestamp: '2025-06-30T23:59:59.999Z',
      })
      reporter.report(results)
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).toContain('<?xml')
    })

    test('should handle only error violations', () => {
      const reporter = new JUnitReporter()
      const results = createMockAnalysisResult({
        files: [
          createMockFileResult('test.ts', [
            createMockViolation({ severity: 'error' }),
            createMockViolation({ severity: 'error' }),
          ]),
        ],
        summary: {
          totalFiles: 1,
          filesWithViolations: 1,
          errorCount: 2,
          warningCount: 0,
          infoCount: 0,
          totalTime: 10,
        },
      })
      reporter.report(results)
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).toContain('errors="2"')
      expect(output).toContain('failures="0"')
    })

    test('should handle only warning violations', () => {
      const reporter = new JUnitReporter()
      const results = createMockAnalysisResult({
        files: [
          createMockFileResult('test.ts', [
            createMockViolation({ severity: 'warning' }),
            createMockViolation({ severity: 'warning' }),
          ]),
        ],
        summary: {
          totalFiles: 1,
          filesWithViolations: 1,
          errorCount: 0,
          warningCount: 2,
          infoCount: 0,
          totalTime: 10,
        },
      })
      reporter.report(results)
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).toContain('errors="0"')
      expect(output).toContain('failures="2"')
    })

    test('should handle only info violations', () => {
      const reporter = new JUnitReporter()
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [createMockViolation({ severity: 'info' })])],
        summary: {
          totalFiles: 1,
          filesWithViolations: 1,
          errorCount: 0,
          warningCount: 0,
          infoCount: 1,
          totalTime: 10,
        },
      })
      reporter.report(results)
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).toContain('errors="0"')
      expect(output).toContain('failures="1"')
    })

    test('should handle large totalFiles with no violations', () => {
      const reporter = new JUnitReporter()
      const files = Array.from({ length: 50 }, (_, i) => createMockFileResult(`file${i}.ts`, []))
      const results = createMockAnalysisResult({
        files,
        summary: {
          totalFiles: 50,
          filesWithViolations: 0,
          errorCount: 0,
          warningCount: 0,
          infoCount: 0,
          totalTime: 500,
        },
      })
      reporter.report(results)
      const output = consoleSpy.mock.calls[0][0] as string
      const testsuiteMatches = output.match(/<testsuite\s/g)
      expect(testsuiteMatches).toHaveLength(50)
      expect(output).toContain('tests="0"')
    })

    test('should handle file with very large stats time', () => {
      const reporter = new JUnitReporter()
      const results = createMockAnalysisResult({
        files: [
          createMockFileResult('slow.ts', [createMockViolation()], {
            parseTime: 5000,
            analysisTime: 10000,
            totalTime: 15000,
          }),
        ],
        summary: {
          totalFiles: 1,
          filesWithViolations: 1,
          errorCount: 1,
          warningCount: 0,
          infoCount: 0,
          totalTime: 15000,
        },
      })
      reporter.report(results)
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).toContain('time="15.000"')
    })
  })

  describe('Reporter interface compliance', () => {
    test('should have name property', () => {
      const reporter = new JUnitReporter()
      expect(reporter).toHaveProperty('name')
      expect(typeof reporter.name).toBe('string')
    })

    test('should have format method', () => {
      const reporter = new JUnitReporter()
      expect(typeof reporter.format).toBe('function')
    })

    test('should have report method', () => {
      const reporter = new JUnitReporter()
      expect(typeof reporter.report).toBe('function')
    })

    test('should return string from format', () => {
      const reporter = new JUnitReporter()
      const result = reporter.format(createMockViolation())
      expect(typeof result).toBe('string')
    })

    test('should not return undefined from format', () => {
      const reporter = new JUnitReporter()
      const result = reporter.format(createMockViolation())
      expect(result).toBeDefined()
    })

    test('should not throw on report with valid input', () => {
      const reporter = new JUnitReporter()
      const results = createMockAnalysisResult()
      expect(() => reporter.report(results)).not.toThrow()
    })

    test('should not throw on report with empty files', () => {
      const reporter = new JUnitReporter()
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
      expect(() => reporter.report(results)).not.toThrow()
    })

    test('should have name property that is a string', () => {
      const reporter = new JUnitReporter()
      expect(reporter.name).toBe('junit')
      expect(typeof reporter.name).toBe('string')
    })
  })

  describe('helper function createMockViolation', () => {
    test('should create violation with default values', () => {
      const v = createMockViolation()
      expect(v.ruleId).toBe('test-rule')
      expect(v.severity).toBe('error')
      expect(v.message).toBe('Test violation message')
      expect(v.filePath).toBe('test.ts')
      expect(v.line).toBe(10)
      expect(v.column).toBe(5)
    })

    test('should override default values', () => {
      const v = createMockViolation({ ruleId: 'custom', line: 100 })
      expect(v.ruleId).toBe('custom')
      expect(v.line).toBe(100)
      expect(v.column).toBe(5)
    })
  })

  describe('helper function createMockFileResult', () => {
    test('should create file result with defaults', () => {
      const r = createMockFileResult('test.ts')
      expect(r.filePath).toBe('test.ts')
      expect(r.violations).toEqual([])
      expect(r.stats.totalTime).toBe(30)
    })

    test('should accept custom violations', () => {
      const v = createMockViolation()
      const r = createMockFileResult('test.ts', [v])
      expect(r.violations).toHaveLength(1)
      expect(r.violations[0]).toBe(v)
    })

    test('should accept custom stats', () => {
      const r = createMockFileResult('test.ts', [], {
        parseTime: 100,
        analysisTime: 200,
        totalTime: 300,
      })
      expect(r.stats.parseTime).toBe(100)
      expect(r.stats.analysisTime).toBe(200)
      expect(r.stats.totalTime).toBe(300)
    })
  })

  describe('helper function createMockAnalysisResult', () => {
    test('should create result with default values', () => {
      const r = createMockAnalysisResult()
      expect(r.files).toEqual([])
      expect(r.summary.totalFiles).toBe(0)
      expect(r.summary.errorCount).toBe(0)
      expect(r.summary.warningCount).toBe(0)
      expect(r.summary.infoCount).toBe(0)
      expect(r.timestamp).toBe('2024-01-15T10:00:00.000Z')
    })

    test('should override values', () => {
      const r = createMockAnalysisResult({
        summary: {
          totalFiles: 5,
          filesWithViolations: 2,
          errorCount: 3,
          warningCount: 1,
          infoCount: 0,
          totalTime: 200,
        },
      })
      expect(r.summary.totalFiles).toBe(5)
      expect(r.summary.errorCount).toBe(3)
    })
  })

  describe('XML structure validation', () => {
    test('should produce valid XML hierarchy', () => {
      const reporter = new JUnitReporter()
      const results = createMockAnalysisResult({
        files: [
          createMockFileResult('test.ts', [
            createMockViolation({ severity: 'error' }),
            createMockViolation({ severity: 'warning' }),
          ]),
        ],
        summary: {
          totalFiles: 1,
          filesWithViolations: 1,
          errorCount: 1,
          warningCount: 1,
          infoCount: 0,
          totalTime: 20,
        },
      })
      reporter.report(results)
      const output = consoleSpy.mock.calls[0][0] as string
      const xmlEnd = output.indexOf('>') + 1
      const bodyStart = output.indexOf('<testsuites')
      expect(bodyStart).toBeLessThan(output.indexOf('</testsuites>'))
      expect(output.indexOf('<testsuite')).toBeLessThan(output.indexOf('</testsuite>'))
      expect(output.indexOf('<testcase')).toBeLessThan(output.indexOf('</testcase>'))
    })

    test('should nest testcases inside testsuite', () => {
      const reporter = new JUnitReporter()
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
      const output = consoleSpy.mock.calls[0][0] as string
      const testsuiteStart = output.indexOf('<testsuite')
      const testsuiteEnd = output.indexOf('</testsuite>')
      const testcaseStart = output.indexOf('<testcase')
      expect(testcaseStart).toBeGreaterThan(testsuiteStart)
      expect(testcaseStart).toBeLessThan(testsuiteEnd)
    })

    test('should nest error/failure inside testcase', () => {
      const reporter = new JUnitReporter()
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [createMockViolation({ severity: 'error' })])],
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
      const testcaseStart = output.indexOf('<testcase')
      const testcaseEnd = output.indexOf('</testcase>')
      const errorStart = output.indexOf('<error')
      expect(errorStart).toBeGreaterThan(testcaseStart)
      expect(errorStart).toBeLessThan(testcaseEnd)
    })

    test('should produce self-contained XML document', () => {
      const reporter = new JUnitReporter()
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
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output.startsWith('<?xml')).toBe(true)
      expect(output.trim()).toMatch(/<\/testsuites>$/)
    })

    test('should use consistent indentation', () => {
      const reporter = new JUnitReporter()
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
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).toContain('  <testsuite')
      expect(output).toContain('    <testcase')
    })
  })

  describe('edge cases extended', () => {
    test('should handle file path with spaces', () => {
      const reporter = new JUnitReporter()
      const results = createMockAnalysisResult({
        files: [createMockFileResult('my project/src/main.ts', [createMockViolation()])],
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
      expect(output).toContain('name="my project/src/main.ts"')
    })

    test('should handle file path with dots', () => {
      const reporter = new JUnitReporter()
      const results = createMockAnalysisResult({
        files: [createMockFileResult('./src/../lib/file.ts', [createMockViolation()])],
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
      expect(output).toContain('./src/../lib/file.ts')
    })

    test('should handle Windows-style file path', () => {
      const reporter = new JUnitReporter()
      const results = createMockAnalysisResult({
        files: [createMockFileResult('src\\lib\\file.ts', [createMockViolation()])],
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
      expect(output).toContain('src\\lib\\file.ts')
    })

    test('should handle very long violation message', () => {
      const reporter = new JUnitReporter()
      const longMsg = 'A'.repeat(500)
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [createMockViolation({ message: longMsg })])],
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
      expect(output).toContain(`message="${longMsg}"`)
    })

    test('should handle very long ruleId', () => {
      const reporter = new JUnitReporter()
      const longRuleId = 'x'.repeat(200)
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [createMockViolation({ ruleId: longRuleId })])],
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
      expect(output).toContain(longRuleId)
    })

    test('should handle file with only extension', () => {
      const reporter = new JUnitReporter()
      const results = createMockAnalysisResult({
        files: [createMockFileResult('.hidden', [createMockViolation()])],
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
      expect(output).toContain('name=".hidden"')
    })

    test('should handle empty summary with files', () => {
      const reporter = new JUnitReporter()
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [])],
        summary: {
          totalFiles: 1,
          filesWithViolations: 0,
          errorCount: 0,
          warningCount: 0,
          infoCount: 0,
          totalTime: 5,
        },
      })
      reporter.report(results)
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).toContain('</testsuites>')
    })

    test('should handle reporter with outputPath but no file writes on console report', () => {
      const reporter = new JUnitReporter()
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
      expect(fsWriteFileSyncMock).not.toHaveBeenCalled()
    })

    test('should handle violation at line 0', () => {
      const reporter = new JUnitReporter()
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [createMockViolation({ line: 0, column: 0 })])],
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
      expect(output).toContain('Location: test.ts:0:0')
    })

    test('should handle violation with very high line number', () => {
      const reporter = new JUnitReporter()
      const results = createMockAnalysisResult({
        files: [
          createMockFileResult('test.ts', [createMockViolation({ line: 100000, column: 999 })]),
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
      reporter.report(results)
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).toContain('100000:999')
    })
  })

  describe('format method additional', () => {
    test('should format with different file extensions', () => {
      const reporter = new JUnitReporter()
      expect(reporter.format(createMockViolation({ filePath: 'app.js' }))).toContain('app.js')
      expect(reporter.format(createMockViolation({ filePath: 'app.tsx' }))).toContain('app.tsx')
      expect(reporter.format(createMockViolation({ filePath: 'app.py' }))).toContain('app.py')
    })

    test('should return non-empty string for all severities', () => {
      const reporter = new JUnitReporter()
      for (const severity of ['error', 'warning', 'info'] as const) {
        const result = reporter.format(createMockViolation({ severity }))
        expect(result.length).toBeGreaterThan(0)
      }
    })

    test('should preserve message content exactly', () => {
      const reporter = new JUnitReporter()
      const msg = 'Avoid using eval() in production code'
      expect(reporter.format(createMockViolation({ message: msg }))).toContain(msg)
    })

    test('should include all parts in correct order', () => {
      const reporter = new JUnitReporter()
      const output = reporter.format(
        createMockViolation({
          severity: 'warning',
          ruleId: 'no-console',
          filePath: 'index.ts',
          line: 5,
          column: 3,
          message: 'No console',
        }),
      )
      const severityIdx = output.indexOf('[WARNING]')
      const ruleIdx = output.indexOf('[no-console]')
      const fileIdx = output.indexOf('index.ts:')
      const msgIdx = output.indexOf('No console')
      expect(severityIdx).toBeLessThan(ruleIdx)
      expect(ruleIdx).toBeLessThan(fileIdx)
      expect(fileIdx).toBeLessThan(msgIdx)
    })
  })

  describe('report additional coverage', () => {
    test('should produce output for single error violation', () => {
      const reporter = new JUnitReporter()
      const results = createMockAnalysisResult({
        files: [
          createMockFileResult('single.ts', [
            createMockViolation({ severity: 'error', ruleId: 'e1', message: 'err' }),
          ]),
        ],
        summary: {
          totalFiles: 1,
          filesWithViolations: 1,
          errorCount: 1,
          warningCount: 0,
          infoCount: 0,
          totalTime: 5,
        },
      })
      reporter.report(results)
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).toContain('tests="1"')
      expect(output).toContain('errors="1"')
      expect(output).toContain('failures="0"')
    })

    test('should produce output for single warning violation', () => {
      const reporter = new JUnitReporter()
      const results = createMockAnalysisResult({
        files: [
          createMockFileResult('single.ts', [
            createMockViolation({ severity: 'warning', ruleId: 'w1', message: 'warn' }),
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
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).toContain('failures="1"')
      expect(output).toContain('errors="0"')
    })

    test('should produce output for single info violation', () => {
      const reporter = new JUnitReporter()
      const results = createMockAnalysisResult({
        files: [
          createMockFileResult('single.ts', [
            createMockViolation({ severity: 'info', ruleId: 'i1', message: 'info msg' }),
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
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).toContain('failures="1"')
    })

    test('should handle totalTime of 1ms', () => {
      const reporter = new JUnitReporter()
      const results = createMockAnalysisResult({
        files: [],
        summary: {
          totalFiles: 0,
          filesWithViolations: 0,
          errorCount: 0,
          warningCount: 0,
          infoCount: 0,
          totalTime: 1,
        },
      })
      reporter.report(results)
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).toContain('time="0.001"')
    })

    test('should handle totalTime of 1234ms', () => {
      const reporter = new JUnitReporter()
      const results = createMockAnalysisResult({
        files: [],
        summary: {
          totalFiles: 0,
          filesWithViolations: 0,
          errorCount: 0,
          warningCount: 0,
          infoCount: 0,
          totalTime: 1234,
        },
      })
      reporter.report(results)
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).toContain('time="1.234"')
    })

    test('should produce XML that starts with declaration', () => {
      const reporter = new JUnitReporter()
      const results = createMockAnalysisResult({
        files: [createMockFileResult('f.ts', [createMockViolation()])],
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
      expect(output.indexOf('<?xml')).toBe(0)
    })

    test('should include all files in order', () => {
      const reporter = new JUnitReporter()
      const results = createMockAnalysisResult({
        files: [
          createMockFileResult('first.ts', [createMockViolation()]),
          createMockFileResult('second.ts', [createMockViolation()]),
          createMockFileResult('third.ts', [createMockViolation()]),
        ],
        summary: {
          totalFiles: 3,
          filesWithViolations: 3,
          errorCount: 3,
          warningCount: 0,
          infoCount: 0,
          totalTime: 30,
        },
      })
      reporter.report(results)
      const output = consoleSpy.mock.calls[0][0] as string
      const firstIdx = output.indexOf('name="first.ts"')
      const secondIdx = output.indexOf('name="second.ts"')
      const thirdIdx = output.indexOf('name="third.ts"')
      expect(firstIdx).toBeLessThan(secondIdx)
      expect(secondIdx).toBeLessThan(thirdIdx)
    })

    test('should include location with escaped special chars in filepath', () => {
      const reporter = new JUnitReporter()
      const results = createMockAnalysisResult({
        files: [createMockFileResult('a&b.ts', [createMockViolation({ line: 1, column: 1 })])],
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
      expect(output).toContain('Location: a&amp;b.ts:1:1')
    })

    test('should not include Source when source is undefined', () => {
      const reporter = new JUnitReporter()
      const v: Violation = {
        ruleId: 'r',
        severity: 'error',
        message: 'm',
        filePath: 'f.ts',
        line: 1,
        column: 1,
      }
      const results = createMockAnalysisResult({
        files: [createMockFileResult('f.ts', [v])],
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
      expect(output).not.toContain('Source:')
    })

    test('should not include Suggestion when suggestion is undefined', () => {
      const reporter = new JUnitReporter()
      const v: Violation = {
        ruleId: 'r',
        severity: 'error',
        message: 'm',
        filePath: 'f.ts',
        line: 1,
        column: 1,
      }
      const results = createMockAnalysisResult({
        files: [createMockFileResult('f.ts', [v])],
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
      expect(output).not.toContain('Suggestion:')
    })

    test('should include testsuites with correct total test count', () => {
      const reporter = new JUnitReporter()
      const results = createMockAnalysisResult({
        files: [],
        summary: {
          totalFiles: 0,
          filesWithViolations: 0,
          errorCount: 10,
          warningCount: 20,
          infoCount: 30,
          totalTime: 100,
        },
      })
      reporter.report(results)
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).toContain('tests="60"')
    })

    test('should handle file with violations ordered correctly', () => {
      const reporter = new JUnitReporter()
      const results = createMockAnalysisResult({
        files: [
          createMockFileResult('test.ts', [
            createMockViolation({ ruleId: 'first-rule' }),
            createMockViolation({ ruleId: 'second-rule' }),
            createMockViolation({ ruleId: 'third-rule' }),
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
      const output = consoleSpy.mock.calls[0][0] as string
      const firstIdx = output.indexOf('first-rule')
      const secondIdx = output.indexOf('second-rule')
      const thirdIdx = output.indexOf('third-rule')
      expect(firstIdx).toBeLessThan(secondIdx)
      expect(secondIdx).toBeLessThan(thirdIdx)
    })

    test('should handle empty string filePath', () => {
      const reporter = new JUnitReporter()
      const results = createMockAnalysisResult({
        files: [createMockFileResult('', [createMockViolation()])],
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
      expect(output).toContain('classname=""')
    })

    test('should handle file stats with sub-millisecond represented as zero', () => {
      const reporter = new JUnitReporter()
      const results = createMockAnalysisResult({
        files: [
          createMockFileResult('fast.ts', [], { parseTime: 0, analysisTime: 0, totalTime: 0 }),
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
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).toContain('time="0.000"')
    })

    test('should include testsuite with errors=0 for clean file', () => {
      const reporter = new JUnitReporter()
      const results = createMockAnalysisResult({
        files: [createMockFileResult('clean.ts', [])],
        summary: {
          totalFiles: 1,
          filesWithViolations: 0,
          errorCount: 0,
          warningCount: 0,
          infoCount: 0,
          totalTime: 5,
        },
      })
      reporter.report(results)
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).toContain('tests="0"')
      expect(output).toContain('errors="0"')
      expect(output).toContain('failures="0"')
    })

    test('should handle report called then called again with different data', () => {
      const reporter = new JUnitReporter()
      const results1 = createMockAnalysisResult({
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
      const results2 = createMockAnalysisResult({
        files: [createMockFileResult('b.ts', [createMockViolation({ severity: 'warning' })])],
        summary: {
          totalFiles: 1,
          filesWithViolations: 1,
          errorCount: 0,
          warningCount: 1,
          infoCount: 0,
          totalTime: 10,
        },
      })
      reporter.report(results1)
      reporter.report(results2)
      const output1 = consoleSpy.mock.calls[0][0] as string
      const output2 = consoleSpy.mock.calls[1][0] as string
      expect(output1).toContain('name="a.ts"')
      expect(output2).toContain('name="b.ts"')
      expect(output2).toContain('type="warning"')
    })

    test('should escape all five XML special characters in one message', () => {
      const reporter = new JUnitReporter()
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [createMockViolation({ message: '<>&"\'' })])],
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
      expect(output).toContain('&lt;&gt;&amp;&quot;&apos;')
    })

    test('should handle violation with source but no suggestion for warning', () => {
      const reporter = new JUnitReporter()
      const results = createMockAnalysisResult({
        files: [
          createMockFileResult('test.ts', [
            createMockViolation({ severity: 'warning', source: 'x = 1' }),
          ]),
        ],
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
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).toContain('Source:')
      expect(output).toContain('x = 1')
      expect(output).not.toContain('Suggestion:')
    })

    test('should handle violation with suggestion but no source for info', () => {
      const reporter = new JUnitReporter()
      const results = createMockAnalysisResult({
        files: [
          createMockFileResult('test.ts', [
            createMockViolation({ severity: 'info', suggestion: 'Fix this' }),
          ]),
        ],
        summary: {
          totalFiles: 1,
          filesWithViolations: 1,
          errorCount: 0,
          warningCount: 0,
          infoCount: 1,
          totalTime: 10,
        },
      })
      reporter.report(results)
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).toContain('Suggestion:')
      expect(output).toContain('Fix this')
      expect(output).not.toContain('Source:')
    })

    test('should handle file path with hash character', () => {
      const reporter = new JUnitReporter()
      const results = createMockAnalysisResult({
        files: [createMockFileResult('src/#utils/file.ts', [createMockViolation()])],
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
      expect(output).toContain('src/#utils/file.ts')
    })

    test('should handle file path with parentheses', () => {
      const reporter = new JUnitReporter()
      const results = createMockAnalysisResult({
        files: [createMockFileResult('src/(legacy)/file.ts', [createMockViolation()])],
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
      expect(output).toContain('src/(legacy)/file.ts')
    })

    test('should produce testsuites with zero counts when no violations', () => {
      const reporter = new JUnitReporter()
      const results = createMockAnalysisResult({
        files: [createMockFileResult('a.ts', []), createMockFileResult('b.ts', [])],
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
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).toContain('tests="0"')
      expect(output).toContain('errors="0"')
      expect(output).toContain('failures="0"')
    })

    test('should handle source with XML special characters for warning', () => {
      const reporter = new JUnitReporter()
      const results = createMockAnalysisResult({
        files: [
          createMockFileResult('test.ts', [
            createMockViolation({
              severity: 'warning',
              source: 'if (a < b && c > "d") return \'e\'',
            }),
          ]),
        ],
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
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).toContain('&lt;')
      expect(output).toContain('&amp;')
      expect(output).toContain('&gt;')
      expect(output).toContain('&quot;')
      expect(output).toContain('&apos;')
    })

    test('should handle suggestion with XML special characters for warning', () => {
      const reporter = new JUnitReporter()
      const results = createMockAnalysisResult({
        files: [
          createMockFileResult('test.ts', [
            createMockViolation({
              severity: 'warning',
              suggestion: 'Use <strict> & "proper" types',
            }),
          ]),
        ],
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
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).toContain('Use &lt;strict&gt; &amp; &quot;proper&quot; types')
    })

    test('should handle absolute file path', () => {
      const reporter = new JUnitReporter()
      const results = createMockAnalysisResult({
        files: [createMockFileResult('/home/user/project/src/file.ts', [createMockViolation()])],
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
      expect(output).toContain('/home/user/project/src/file.ts')
    })

    test('should handle format with all optional fields', () => {
      const reporter = new JUnitReporter()
      const v: Violation = {
        ruleId: 'complex',
        severity: 'error',
        message: 'Complex violation',
        filePath: 'complex.ts',
        line: 50,
        column: 10,
        endLine: 55,
        endColumn: 20,
        source: 'const x = 1',
        suggestion: 'Use let',
        meta: { extra: true },
      }
      const output = reporter.format(v)
      expect(output).toContain('[ERROR]')
      expect(output).toContain('[complex]')
      expect(output).toContain('complex.ts:50:10')
      expect(output).toContain('Complex violation')
    })

    test('should handle format with column 1', () => {
      const reporter = new JUnitReporter()
      const output = reporter.format(createMockViolation({ line: 5, column: 1 }))
      expect(output).toContain('5:1')
    })

    test('should handle format returning exact expected string', () => {
      const reporter = new JUnitReporter()
      const v = createMockViolation({
        severity: 'info',
        ruleId: 'prefer-const',
        filePath: 'index.ts',
        line: 3,
        column: 7,
        message: 'Use const',
      })
      expect(reporter.format(v)).toBe('[INFO] [prefer-const] index.ts:3:7 Use const')
    })

    test('should handle report with file path containing only filename', () => {
      const reporter = new JUnitReporter()
      const results = createMockAnalysisResult({
        files: [createMockFileResult('file.ts', [createMockViolation()])],
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
      expect(output).toContain('name="file.ts"')
      expect(output).toContain('classname="file.ts"')
    })

    test('should handle deeply nested file path in classname', () => {
      const reporter = new JUnitReporter()
      const results = createMockAnalysisResult({
        files: [createMockFileResult('a/b/c/d/e/f/g/file.ts', [createMockViolation()])],
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
      expect(output).toContain('classname="a/b/c/d/e/f/g/file.ts"')
    })

    test('should handle violation with source on info severity', () => {
      const reporter = new JUnitReporter()
      const results = createMockAnalysisResult({
        files: [
          createMockFileResult('test.ts', [
            createMockViolation({ severity: 'info', source: 'debugger;' }),
          ]),
        ],
        summary: {
          totalFiles: 1,
          filesWithViolations: 1,
          errorCount: 0,
          warningCount: 0,
          infoCount: 1,
          totalTime: 10,
        },
      })
      reporter.report(results)
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).toContain('Source:')
      expect(output).toContain('debugger;')
    })
  })
})
