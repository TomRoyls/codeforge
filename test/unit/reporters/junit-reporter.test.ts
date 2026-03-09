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
})
