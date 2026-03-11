import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import * as fs from 'fs'
import * as path from 'path'
import { MarkdownReporter } from '../../../src/reporters/markdown-reporter.js'
import type { AnalysisResult, FileAnalysisResult, Violation } from '../../../src/reporters/types.js'

vi.mock('fs')
vi.mock('path')

function createMockViolation(overrides: Partial<Violation> = {}): Violation {
  return {
    column: 5,
    filePath: 'test.ts',
    line: 10,
    message: 'Test violation',
    ruleId: 'test-rule',
    severity: 'error',
    ...overrides,
  }
}

function createMockFileResult(filePath: string, violations: Violation[] = []): FileAnalysisResult {
  return {
    filePath,
    stats: { analysisTime: 20, parseTime: 10, totalTime: 30 },
    violations,
  }
}

function createMockAnalysisResult(overrides: Partial<AnalysisResult> = {}): AnalysisResult {
  return {
    files: [],
    summary: {
      errorCount: 0,
      filesWithViolations: 0,
      infoCount: 0,
      totalFiles: 0,
      totalTime: 100,
      warningCount: 0,
    },
    timestamp: '2024-01-15T10:00:00.000Z',
    ...overrides,
  }
}

describe('MarkdownReporter', () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(() => {
    consoleSpy.mockRestore()
  })

  describe('constructor', () => {
    test('should initialize with default options', () => {
      const reporter = new MarkdownReporter()
      expect(reporter.name).toBe('markdown')
    })

    test('should accept includeSource option', () => {
      const reporter = new MarkdownReporter({ includeSource: true })
      expect(reporter.name).toBe('markdown')
    })

    test('should accept outputPath option', () => {
      const reporter = new MarkdownReporter({ outputPath: './report.md' })
      expect(reporter.name).toBe('markdown')
    })
  })

  describe('format', () => {
    test('should format violation as markdown string', () => {
      const reporter = new MarkdownReporter()
      const violation = createMockViolation()
      const output = reporter.format(violation)
      expect(output).toContain('🔴 **test-rule** at test.ts:10:5')
      expect(output).toContain('Test violation')
    })

    test('should use correct severity badges', () => {
      const reporter = new MarkdownReporter()

      const errorOutput = reporter.format(createMockViolation({ severity: 'error' }))
      expect(errorOutput).toContain('🔴')

      const warningOutput = reporter.format(createMockViolation({ severity: 'warning' }))
      expect(warningOutput).toContain('🟡')

      const infoOutput = reporter.format(createMockViolation({ severity: 'info' }))
      expect(infoOutput).toContain('🔵')
    })
  })

  describe('report', () => {
    test('should output markdown to console', () => {
      const reporter = new MarkdownReporter()
      const results = createMockAnalysisResult()
      reporter.report(results)
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).toContain('# CodeForge Analysis Report')
    })

    test('should include summary section', () => {
      const reporter = new MarkdownReporter()
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [createMockViolation()])],
        summary: {
          errorCount: 1,
          filesWithViolations: 1,
          infoCount: 0,
          totalFiles: 1,
          totalTime: 50,
          warningCount: 0,
        },
      })
      reporter.report(results)
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).toContain('## Summary')
      expect(output).toContain('| Total Files Analyzed | 1 |')
      expect(output).toContain('| 🔴 Errors | 1 |')
    })

    test('should include violations by file', () => {
      const reporter = new MarkdownReporter()
      const results = createMockAnalysisResult({
        files: [
          createMockFileResult('src/test.ts', [createMockViolation({ message: 'Custom error' })]),
        ],
        summary: {
          errorCount: 1,
          filesWithViolations: 1,
          infoCount: 0,
          totalFiles: 1,
          totalTime: 50,
          warningCount: 0,
        },
      })
      reporter.report(results)
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).toContain('### 📄 `src/test.ts`')
      expect(output).toContain('1 violation(s)')
      expect(output).toContain('Custom error')
    })

    test('should show no violations message when clean', () => {
      const reporter = new MarkdownReporter()
      const results = createMockAnalysisResult({
        files: [createMockFileResult('clean.ts', [])],
        summary: {
          errorCount: 0,
          filesWithViolations: 0,
          infoCount: 0,
          totalFiles: 1,
          totalTime: 50,
          warningCount: 0,
        },
      })
      reporter.report(results)
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).toContain('✅ No violations found!')
    })
  })

  describe('format with source', () => {
    test('should include code snippet when source is provided', () => {
      const reporter = new MarkdownReporter()
      const violation = createMockViolation({
        source: 'line1\nline2\nline3\nline4\nline5\nline6\nline7',
        line: 4,
      })
      const output = reporter.format(violation)
      expect(output).toContain('```')
      expect(output).toContain('>')
    })

    test('should handle source at beginning of file', () => {
      const reporter = new MarkdownReporter()
      const violation = createMockViolation({
        source: 'first line\nsecond line',
        line: 1,
      })
      const output = reporter.format(violation)
      expect(output).toContain('```')
    })

    test('should handle source at end of file', () => {
      const reporter = new MarkdownReporter()
      const violation = createMockViolation({
        source: 'line1\nline2\nline3',
        line: 3,
      })
      const output = reporter.format(violation)
      expect(output).toContain('```')
    })
  })

  describe('format with suggestion', () => {
    test('should include suggestion when provided', () => {
      const reporter = new MarkdownReporter()
      const violation = createMockViolation({
        suggestion: 'Consider using const instead',
      })
      const output = reporter.format(violation)
      expect(output).toContain('💡 Suggestion:')
      expect(output).toContain('Consider using const instead')
    })

    test('should escape markdown in suggestion', () => {
      const reporter = new MarkdownReporter()
      const violation = createMockViolation({
        suggestion: 'Use `code` and **bold**',
      })
      const output = reporter.format(violation)
      expect(output).toContain('\\`code\\`')
      expect(output).toContain('\\*\\*bold\\*\\*')
    })
  })

  describe('includeSource option', () => {
    test('should include source snippets section when includeSource is true', () => {
      const reporter = new MarkdownReporter({ includeSource: true })
      const results = createMockAnalysisResult({
        files: [
          createMockFileResult('test.ts', [
            createMockViolation({
              source: 'const x = 1;\nconst y = 2;',
              line: 1,
            }),
          ]),
        ],
        summary: {
          errorCount: 1,
          filesWithViolations: 1,
          infoCount: 0,
          totalFiles: 1,
          totalTime: 50,
          warningCount: 0,
        },
      })
      reporter.report(results)
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).toContain('## Code Snippets')
      expect(output).toContain('#### test.ts:1')
    })

    test('should not include source snippets section when includeSource is false', () => {
      const reporter = new MarkdownReporter({ includeSource: false })
      const results = createMockAnalysisResult({
        files: [
          createMockFileResult('test.ts', [
            createMockViolation({
              source: 'const x = 1;',
              line: 1,
            }),
          ]),
        ],
        summary: {
          errorCount: 1,
          filesWithViolations: 1,
          infoCount: 0,
          totalFiles: 1,
          totalTime: 50,
          warningCount: 0,
        },
      })
      reporter.report(results)
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).not.toContain('## Code Snippets')
    })

    test('should return empty string when no files have source', () => {
      const reporter = new MarkdownReporter({ includeSource: true })
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [createMockViolation()])],
        summary: {
          errorCount: 1,
          filesWithViolations: 1,
          infoCount: 0,
          totalFiles: 1,
          totalTime: 50,
          warningCount: 0,
        },
      })
      reporter.report(results)
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).not.toContain('## Code Snippets')
    })

    test('should handle multiple violations with source', () => {
      const reporter = new MarkdownReporter({ includeSource: true })
      const results = createMockAnalysisResult({
        files: [
          createMockFileResult('test.ts', [
            createMockViolation({ source: 'line1', line: 1 }),
            createMockViolation({ source: 'line5', line: 5 }),
          ]),
        ],
        summary: {
          errorCount: 2,
          filesWithViolations: 1,
          infoCount: 0,
          totalFiles: 1,
          totalTime: 50,
          warningCount: 0,
        },
      })
      reporter.report(results)
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).toContain('#### test.ts:1')
      expect(output).toContain('#### test.ts:5')
    })
  })

  describe('violations with suggestions', () => {
    test('should include suggestions in violations table', () => {
      const reporter = new MarkdownReporter()
      const results = createMockAnalysisResult({
        files: [
          createMockFileResult('test.ts', [
            createMockViolation({
              ruleId: 'prefer-const',
              suggestion: 'Use const instead of let',
            }),
          ]),
        ],
        summary: {
          errorCount: 1,
          filesWithViolations: 1,
          infoCount: 0,
          totalFiles: 1,
          totalTime: 50,
          warningCount: 0,
        },
      })
      reporter.report(results)
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).toContain('💡 **prefer-const**:')
      expect(output).toContain('Use const instead of let')
    })

    test('should handle multiple suggestions', () => {
      const reporter = new MarkdownReporter()
      const results = createMockAnalysisResult({
        files: [
          createMockFileResult('test.ts', [
            createMockViolation({ ruleId: 'rule1', suggestion: 'Suggestion 1' }),
            createMockViolation({ ruleId: 'rule2', suggestion: 'Suggestion 2' }),
          ]),
        ],
        summary: {
          errorCount: 2,
          filesWithViolations: 1,
          infoCount: 0,
          totalFiles: 1,
          totalTime: 50,
          warningCount: 0,
        },
      })
      reporter.report(results)
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).toContain('💡 **rule1**:')
      expect(output).toContain('💡 **rule2**:')
    })

    test('should escape markdown in violation suggestions', () => {
      const reporter = new MarkdownReporter()
      const results = createMockAnalysisResult({
        files: [
          createMockFileResult('test.ts', [
            createMockViolation({
              suggestion: 'Use `<script>` carefully',
            }),
          ]),
        ],
        summary: {
          errorCount: 1,
          filesWithViolations: 1,
          infoCount: 0,
          totalFiles: 1,
          totalTime: 50,
          warningCount: 0,
        },
      })
      reporter.report(results)
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).toContain('\\<script\\>')
    })
  })

  describe('footer', () => {
    test('should include version in footer', () => {
      const reporter = new MarkdownReporter()
      const results = createMockAnalysisResult({
        files: [],
        summary: {
          errorCount: 0,
          filesWithViolations: 0,
          infoCount: 0,
          totalFiles: 0,
          totalTime: 50,
          warningCount: 0,
        },
        version: '1.2.3',
      })
      reporter.report(results)
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).toContain('v1.2.3')
    })

    test('should use default version when not provided', () => {
      const reporter = new MarkdownReporter()
      const results = createMockAnalysisResult()
      reporter.report(results)
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).toContain('v0.1.0')
    })
  })

  describe('report to file', () => {
    let fsExistsSyncMock: ReturnType<typeof vi.fn>
    let fsMkdirSyncMock: ReturnType<typeof vi.fn>
    let fsWriteFileSyncMock: ReturnType<typeof vi.fn>

    beforeEach(() => {
      fsExistsSyncMock = vi.mocked(fs.existsSync)
      fsMkdirSyncMock = vi.mocked(fs.mkdirSync)
      fsWriteFileSyncMock = vi.mocked(fs.writeFileSync)
    })

    test('should write to file when outputPath is provided', () => {
      const reporter = new MarkdownReporter({ outputPath: './report.md' })
      const results = createMockAnalysisResult()
      fsExistsSyncMock.mockReturnValue(true)
      reporter.report(results)
      expect(fsWriteFileSyncMock).toHaveBeenCalled()
    })

    test('should create directory if it does not exist', () => {
      const reporter = new MarkdownReporter({ outputPath: './reports/nested/report.md' })
      const results = createMockAnalysisResult()
      fsExistsSyncMock.mockReturnValue(false)
      vi.mocked(path.dirname).mockReturnValue('./reports/nested')
      reporter.report(results)
      expect(fsMkdirSyncMock).toHaveBeenCalledWith('./reports/nested', { recursive: true })
    })
  })
})
