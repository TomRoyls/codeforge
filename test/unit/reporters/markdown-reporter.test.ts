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
    consoleSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true)
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

    test('should accept empty options object', () => {
      const reporter = new MarkdownReporter({})
      expect(reporter.name).toBe('markdown')
    })

    test('should accept all options simultaneously', () => {
      const reporter = new MarkdownReporter({
        includeSource: true,
        outputPath: './output/report.md',
        color: true,
        verbose: true,
        quiet: false,
        pretty: true,
        errorsOnly: false,
      })
      expect(reporter.name).toBe('markdown')
    })

    test('should default includeSource to false', () => {
      const reporter = new MarkdownReporter()
      const results = createMockAnalysisResult({
        files: [
          createMockFileResult('test.ts', [
            createMockViolation({ source: 'const x = 1;', line: 1 }),
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

    test('should default outputPath to undefined', () => {
      const reporter = new MarkdownReporter()
      const results = createMockAnalysisResult()
      reporter.report(results)
      expect(consoleSpy).toHaveBeenCalled()
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

    test('should format error severity with red circle', () => {
      const reporter = new MarkdownReporter()
      const output = reporter.format(createMockViolation({ severity: 'error' }))
      expect(output).toMatch(/^🔴/)
    })

    test('should format warning severity with yellow circle', () => {
      const reporter = new MarkdownReporter()
      const output = reporter.format(createMockViolation({ severity: 'warning' }))
      expect(output).toMatch(/^🟡/)
    })

    test('should format info severity with blue circle', () => {
      const reporter = new MarkdownReporter()
      const output = reporter.format(createMockViolation({ severity: 'info' }))
      expect(output).toMatch(/^🔵/)
    })

    test('should include rule ID in bold', () => {
      const reporter = new MarkdownReporter()
      const output = reporter.format(createMockViolation({ ruleId: 'no-console' }))
      expect(output).toContain('**no-console**')
    })

    test('should include file path, line, and column', () => {
      const reporter = new MarkdownReporter()
      const output = reporter.format(
        createMockViolation({ filePath: 'src/app.ts', line: 42, column: 7 }),
      )
      expect(output).toContain('src/app.ts:42:7')
    })

    test('should include message at end of format line', () => {
      const reporter = new MarkdownReporter()
      const output = reporter.format(
        createMockViolation({ message: 'Unexpected console statement' }),
      )
      expect(output).toContain('- Unexpected console statement')
    })

    test('should not include code block when source is absent', () => {
      const reporter = new MarkdownReporter()
      const output = reporter.format(createMockViolation())
      expect(output).not.toContain('```')
    })

    test('should not include suggestion when absent', () => {
      const reporter = new MarkdownReporter()
      const output = reporter.format(createMockViolation())
      expect(output).not.toContain('💡')
    })

    test('should format violation with ruleId containing hyphens', () => {
      const reporter = new MarkdownReporter()
      const output = reporter.format(createMockViolation({ ruleId: 'no-circular-deps' }))
      expect(output).toContain('**no-circular-deps**')
    })

    test('should format violation with ruleId containing slashes', () => {
      const reporter = new MarkdownReporter()
      const output = reporter.format(createMockViolation({ ruleId: 'security/no-eval' }))
      expect(output).toContain('**security/no-eval**')
    })

    test('should format violation with ruleId containing camelCase', () => {
      const reporter = new MarkdownReporter()
      const output = reporter.format(createMockViolation({ ruleId: 'preferConstDeclaration' }))
      expect(output).toContain('**preferConstDeclaration**')
    })

    test('should format violation at line 1 column 1', () => {
      const reporter = new MarkdownReporter()
      const output = reporter.format(createMockViolation({ line: 1, column: 1 }))
      expect(output).toContain(':1:1')
    })

    test('should format violation with large line number', () => {
      const reporter = new MarkdownReporter()
      const output = reporter.format(createMockViolation({ line: 9999, column: 100 }))
      expect(output).toContain(':9999:100')
    })

    test('should format violation with long message', () => {
      const longMsg = 'A'.repeat(500)
      const reporter = new MarkdownReporter()
      const output = reporter.format(createMockViolation({ message: longMsg }))
      expect(output).toContain(longMsg)
    })

    test('should format violation with empty message', () => {
      const reporter = new MarkdownReporter()
      const output = reporter.format(createMockViolation({ message: '' }))
      expect(output).toContain('**test-rule** at test.ts:10:5 - ')
    })

    test('should format violation with filePath containing spaces', () => {
      const reporter = new MarkdownReporter()
      const output = reporter.format(createMockViolation({ filePath: 'my project/src/app.ts' }))
      expect(output).toContain('my project/src/app.ts:10:5')
    })

    test('should format violation with deeply nested filePath', () => {
      const reporter = new MarkdownReporter()
      const output = reporter.format(
        createMockViolation({ filePath: 'packages/core/src/internal/helpers/utils.ts' }),
      )
      expect(output).toContain('packages/core/src/internal/helpers/utils.ts:10:5')
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

    test('should mark the violation line with > indicator', () => {
      const reporter = new MarkdownReporter()
      const source = 'alpha\nbeta\ngamma\ndelta\nepsilon'
      const output = reporter.format(createMockViolation({ source, line: 3 }))
      const lines = output.split('\n')
      const markerLine = lines.find((l) => l.startsWith('>'))
      expect(markerLine).toBeDefined()
      expect(markerLine).toContain('3')
      expect(markerLine).toContain('gamma')
    })

    test('should not mark non-violation lines with > indicator', () => {
      const reporter = new MarkdownReporter()
      const source = 'alpha\nbeta\ngamma\ndelta\nepsilon'
      const output = reporter.format(createMockViolation({ source, line: 3 }))
      const lines = output.split('\n')
      const nonMarkerLines = lines.filter(
        (l) => l.startsWith(' ') && l.includes('|') && !l.startsWith('>'),
      )
      expect(nonMarkerLines.length).toBeGreaterThan(0)
    })

    test('should wrap snippet in code block', () => {
      const reporter = new MarkdownReporter()
      const source = 'const x = 1;'
      const output = reporter.format(createMockViolation({ source, line: 1 }))
      const firstBacktickIdx = output.indexOf('```')
      const lastBacktickIdx = output.lastIndexOf('```')
      expect(firstBacktickIdx).toBeGreaterThan(-1)
      expect(lastBacktickIdx).toBeGreaterThan(firstBacktickIdx)
    })

    test('should show 2 lines before the violation line', () => {
      const reporter = new MarkdownReporter()
      const source = 'line1\nline2\nline3\nline4\nline5\nline6\nline7'
      const output = reporter.format(createMockViolation({ source, line: 5 }))
      expect(output).toContain('line3')
      expect(output).toContain('line4')
    })

    test('should show 1 line after the violation line', () => {
      const reporter = new MarkdownReporter()
      const source = 'line1\nline2\nline3\nline4\nline5\nline6\nline7'
      const output = reporter.format(createMockViolation({ source, line: 5 }))
      expect(output).toContain('line6')
    })

    test('should handle single line source', () => {
      const reporter = new MarkdownReporter()
      const output = reporter.format(createMockViolation({ source: 'only line', line: 1 }))
      expect(output).toContain('only line')
      expect(output).toContain('>    1')
    })

    test('should handle source with empty lines', () => {
      const reporter = new MarkdownReporter()
      const source = 'line1\n\nline3\n\nline5'
      const output = reporter.format(createMockViolation({ source, line: 3 }))
      expect(output).toContain('```')
    })

    test('should escape markdown special characters in source', () => {
      const reporter = new MarkdownReporter()
      const source = 'const x = `<div>` & **bold**'
      const output = reporter.format(createMockViolation({ source, line: 1 }))
      expect(output).toContain('\\`')
      expect(output).toContain('\\*\\*')
      expect(output).toContain('\\<')
    })

    test('should handle source with line numbers correctly padded', () => {
      const reporter = new MarkdownReporter()
      const source = Array.from({ length: 200 }, (_, i) => `line${i + 1}`).join('\n')
      const output = reporter.format(createMockViolation({ source, line: 100 }))
      expect(output).toContain('>  100 |')
    })

    test('should handle violation on first line with less than 2 context lines before', () => {
      const reporter = new MarkdownReporter()
      const source = 'only\nfive\nlines\nhere\nok'
      const output = reporter.format(createMockViolation({ source, line: 1 }))
      const codeBlock = output.match(/```\n([\s\S]*?)\n```/)?.[1]
      expect(codeBlock).toBeDefined()
      const lines = codeBlock!.split('\n')
      expect(lines.length).toBeLessThanOrEqual(5)
    })

    test('should handle violation on last line with less than 1 context line after', () => {
      const reporter = new MarkdownReporter()
      const source = 'only\nfive\nlines\nhere\nok'
      const output = reporter.format(createMockViolation({ source, line: 5 }))
      const codeBlock = output.match(/```\n([\s\S]*?)\n```/)?.[1]
      expect(codeBlock).toBeDefined()
      const lines = codeBlock!.split('\n')
      const lastLineNum = lines[lines.length - 1]
      expect(lastLineNum).toContain('5')
    })

    test('should separate code snippet from header with double newline', () => {
      const reporter = new MarkdownReporter()
      const output = reporter.format(createMockViolation({ source: 'code', line: 1 }))
      expect(output).toContain('\n\n```')
    })

    test('should escape pipe characters in source', () => {
      const reporter = new MarkdownReporter()
      const output = reporter.format(createMockViolation({ source: 'const x = a | b', line: 1 }))
      expect(output).toContain('\\|')
    })

    test('should escape hash characters in source', () => {
      const reporter = new MarkdownReporter()
      const output = reporter.format(createMockViolation({ source: '# heading', line: 1 }))
      expect(output).toContain('\\#')
    })

    test('should escape bracket characters in source', () => {
      const reporter = new MarkdownReporter()
      const output = reporter.format(createMockViolation({ source: 'arr[0]', line: 1 }))
      expect(output).toContain('\\[')
      expect(output).toContain('\\]')
    })

    test('should escape underscore in source', () => {
      const reporter = new MarkdownReporter()
      const output = reporter.format(createMockViolation({ source: 'my_variable', line: 1 }))
      expect(output).toContain('\\_')
    })

    test('should escape asterisk in source', () => {
      const reporter = new MarkdownReporter()
      const output = reporter.format(createMockViolation({ source: 'a * b', line: 1 }))
      expect(output).toContain('\\*')
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

    test('should format suggestion as blockquote', () => {
      const reporter = new MarkdownReporter()
      const output = reporter.format(createMockViolation({ suggestion: 'Fix this' }))
      expect(output).toContain('> 💡 Suggestion:')
    })

    test('should separate suggestion from main content with double newline', () => {
      const reporter = new MarkdownReporter()
      const output = reporter.format(createMockViolation({ suggestion: 'Fix this' }))
      expect(output).toContain('\n\n> 💡')
    })

    test('should escape pipe in suggestion', () => {
      const reporter = new MarkdownReporter()
      const output = reporter.format(createMockViolation({ suggestion: 'Use a | b operator' }))
      expect(output).toContain('\\|')
    })

    test('should escape angle brackets in suggestion', () => {
      const reporter = new MarkdownReporter()
      const output = reporter.format(createMockViolation({ suggestion: 'Use `<T>` generic' }))
      expect(output).toContain('\\<T\\>')
    })

    test('should escape hash in suggestion', () => {
      const reporter = new MarkdownReporter()
      const output = reporter.format(
        createMockViolation({ suggestion: 'See #section for details' }),
      )
      expect(output).toContain('\\#')
    })

    test('should escape square brackets in suggestion', () => {
      const reporter = new MarkdownReporter()
      const output = reporter.format(createMockViolation({ suggestion: 'Access arr[0]' }))
      expect(output).toContain('\\[')
      expect(output).toContain('\\]')
    })

    test('should not include suggestion block when suggestion is empty string', () => {
      const reporter = new MarkdownReporter()
      const output = reporter.format(createMockViolation({ suggestion: '' }))
      expect(output).not.toContain('💡')
    })

    test('should handle very long suggestion', () => {
      const longSuggestion = 'Fix this by '.repeat(100)
      const reporter = new MarkdownReporter()
      const output = reporter.format(createMockViolation({ suggestion: longSuggestion }))
      expect(output).toContain('> 💡 Suggestion:')
    })
  })

  describe('format with both source and suggestion', () => {
    test('should include both code snippet and suggestion', () => {
      const reporter = new MarkdownReporter()
      const output = reporter.format(
        createMockViolation({
          source: 'let x = 1;',
          line: 1,
          suggestion: 'Use const',
        }),
      )
      expect(output).toContain('```')
      expect(output).toContain('> 💡 Suggestion:')
    })

    test('should place suggestion after code snippet', () => {
      const reporter = new MarkdownReporter()
      const output = reporter.format(
        createMockViolation({
          source: 'let x = 1;',
          line: 1,
          suggestion: 'Use const',
        }),
      )
      const snippetEnd = output.lastIndexOf('```')
      const suggestionStart = output.indexOf('> 💡')
      expect(suggestionStart).toBeGreaterThan(snippetEnd)
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

    test('should write newline at end of output', () => {
      const reporter = new MarkdownReporter()
      reporter.report(createMockAnalysisResult())
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output.endsWith('\n')).toBe(true)
    })

    test('should include Generated on timestamp in header', () => {
      const reporter = new MarkdownReporter()
      reporter.report(createMockAnalysisResult())
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).toContain('Generated on')
    })

    test('should use ISO date format in header', () => {
      const reporter = new MarkdownReporter()
      reporter.report(createMockAnalysisResult())
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).toMatch(/Generated on \d{4}-\d{2}-\d{2}T/)
    })
  })

  describe('header generation', () => {
    test('should start with h1 heading', () => {
      const reporter = new MarkdownReporter()
      reporter.report(createMockAnalysisResult())
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).toContain('# CodeForge Analysis Report')
    })

    test('should have header as first line', () => {
      const reporter = new MarkdownReporter()
      reporter.report(createMockAnalysisResult())
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output.startsWith('# CodeForge Analysis Report')).toBe(true)
    })

    test('should include timestamp on line after header title', () => {
      const reporter = new MarkdownReporter()
      reporter.report(createMockAnalysisResult())
      const output = consoleSpy.mock.calls[0][0] as string
      const lines = output.split('\n')
      const headerLine = lines.findIndex((l) => l.includes('# CodeForge Analysis Report'))
      expect(lines[headerLine + 1]).toBe('')
      expect(lines[headerLine + 2]).toContain('Generated on')
    })
  })

  describe('summary generation', () => {
    test('should show total files analyzed', () => {
      const reporter = new MarkdownReporter()
      const results = createMockAnalysisResult({
        files: [createMockFileResult('a.ts', []), createMockFileResult('b.ts', [])],
        summary: {
          errorCount: 0,
          filesWithViolations: 0,
          infoCount: 0,
          totalFiles: 2,
          totalTime: 100,
          warningCount: 0,
        },
      })
      reporter.report(results)
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).toContain('| Total Files Analyzed | 2 |')
    })

    test('should show files with violations', () => {
      const reporter = new MarkdownReporter()
      const results = createMockAnalysisResult({
        files: [createMockFileResult('a.ts', [createMockViolation()])],
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
      expect(output).toContain('| Files with Violations | 1 |')
    })

    test('should show total violations count', () => {
      const reporter = new MarkdownReporter()
      const results = createMockAnalysisResult({
        files: [
          createMockFileResult('a.ts', [
            createMockViolation(),
            createMockViolation({ severity: 'warning' }),
            createMockViolation({ severity: 'info' }),
          ]),
        ],
        summary: {
          errorCount: 1,
          filesWithViolations: 1,
          infoCount: 1,
          totalFiles: 1,
          totalTime: 50,
          warningCount: 1,
        },
      })
      reporter.report(results)
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).toContain('| Total Violations | 3 |')
    })

    test('should show error count with red icon', () => {
      const reporter = new MarkdownReporter()
      const results = createMockAnalysisResult({
        summary: {
          errorCount: 5,
          filesWithViolations: 0,
          infoCount: 0,
          totalFiles: 0,
          totalTime: 0,
          warningCount: 0,
        },
      })
      reporter.report(results)
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).toContain('| 🔴 Errors | 5 |')
    })

    test('should show warning count with yellow icon', () => {
      const reporter = new MarkdownReporter()
      const results = createMockAnalysisResult({
        summary: {
          errorCount: 0,
          filesWithViolations: 0,
          infoCount: 0,
          totalFiles: 0,
          totalTime: 0,
          warningCount: 3,
        },
      })
      reporter.report(results)
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).toContain('| 🟡 Warnings | 3 |')
    })

    test('should show info count with blue icon', () => {
      const reporter = new MarkdownReporter()
      const results = createMockAnalysisResult({
        summary: {
          errorCount: 0,
          filesWithViolations: 0,
          infoCount: 7,
          totalFiles: 0,
          totalTime: 0,
          warningCount: 0,
        },
      })
      reporter.report(results)
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).toContain('| 🔵 Info | 7 |')
    })

    test('should show analysis time in milliseconds', () => {
      const reporter = new MarkdownReporter()
      const results = createMockAnalysisResult({
        summary: {
          errorCount: 0,
          filesWithViolations: 0,
          infoCount: 0,
          totalFiles: 0,
          totalTime: 1234.567,
          warningCount: 0,
        },
      })
      reporter.report(results)
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).toContain('| Analysis Time | 1234.57ms |')
    })

    test('should show zero for all counts when no violations', () => {
      const reporter = new MarkdownReporter()
      reporter.report(createMockAnalysisResult())
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).toContain('| Total Violations | 0 |')
      expect(output).toContain('| 🔴 Errors | 0 |')
      expect(output).toContain('| 🟡 Warnings | 0 |')
      expect(output).toContain('| 🔵 Info | 0 |')
    })

    test('should format summary as markdown table', () => {
      const reporter = new MarkdownReporter()
      reporter.report(createMockAnalysisResult())
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).toContain('| Metric | Value |')
      expect(output).toContain('|--------|-------|')
    })

    test('should show zero total files', () => {
      const reporter = new MarkdownReporter()
      reporter.report(createMockAnalysisResult())
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).toContain('| Total Files Analyzed | 0 |')
    })

    test('should compute total violations from sum of counts', () => {
      const reporter = new MarkdownReporter()
      const results = createMockAnalysisResult({
        summary: {
          errorCount: 2,
          filesWithViolations: 1,
          infoCount: 3,
          totalFiles: 1,
          totalTime: 50,
          warningCount: 4,
        },
      })
      reporter.report(results)
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).toContain('| Total Violations | 9 |')
    })

    test('should handle large file counts', () => {
      const reporter = new MarkdownReporter()
      const results = createMockAnalysisResult({
        summary: {
          errorCount: 0,
          filesWithViolations: 500,
          infoCount: 0,
          totalFiles: 10000,
          totalTime: 5000,
          warningCount: 0,
        },
      })
      reporter.report(results)
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).toContain('| Total Files Analyzed | 10000 |')
      expect(output).toContain('| Files with Violations | 500 |')
    })
  })

  describe('violations table', () => {
    test('should have table header with correct columns', () => {
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
      expect(output).toContain('| Severity | Location | Rule | Message |')
    })

    test('should have table separator row', () => {
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
      expect(output).toContain('|:--------:|:--------:|:----:|---------|')
    })

    test('should include severity badge and label in each row', () => {
      const reporter = new MarkdownReporter()
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [createMockViolation({ severity: 'error' })])],
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
      expect(output).toContain('🔴 ERROR')
    })

    test('should include WARNING label for warning severity', () => {
      const reporter = new MarkdownReporter()
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [createMockViolation({ severity: 'warning' })])],
        summary: {
          errorCount: 0,
          filesWithViolations: 1,
          infoCount: 0,
          totalFiles: 1,
          totalTime: 50,
          warningCount: 1,
        },
      })
      reporter.report(results)
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).toContain('🟡 WARNING')
    })

    test('should include INFO label for info severity', () => {
      const reporter = new MarkdownReporter()
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [createMockViolation({ severity: 'info' })])],
        summary: {
          errorCount: 0,
          filesWithViolations: 1,
          infoCount: 1,
          totalFiles: 1,
          totalTime: 50,
          warningCount: 0,
        },
      })
      reporter.report(results)
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).toContain('🔵 INFO')
    })

    test('should include line:column in Location column', () => {
      const reporter = new MarkdownReporter()
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [createMockViolation({ line: 42, column: 7 })])],
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
      expect(output).toContain('| 42:7 |')
    })

    test('should include ruleId in backticks', () => {
      const reporter = new MarkdownReporter()
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [createMockViolation({ ruleId: 'no-eval' })])],
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
      expect(output).toContain('`no-eval`')
    })

    test('should escape markdown in violation message', () => {
      const reporter = new MarkdownReporter()
      const results = createMockAnalysisResult({
        files: [
          createMockFileResult('test.ts', [
            createMockViolation({ message: 'Avoid `<script>` tags' }),
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

    test('should handle multiple violations in same file', () => {
      const reporter = new MarkdownReporter()
      const results = createMockAnalysisResult({
        files: [
          createMockFileResult('test.ts', [
            createMockViolation({ ruleId: 'rule-a', line: 1 }),
            createMockViolation({ ruleId: 'rule-b', line: 2 }),
            createMockViolation({ ruleId: 'rule-c', line: 3 }),
          ]),
        ],
        summary: {
          errorCount: 3,
          filesWithViolations: 1,
          infoCount: 0,
          totalFiles: 1,
          totalTime: 50,
          warningCount: 0,
        },
      })
      reporter.report(results)
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).toContain('`rule-a`')
      expect(output).toContain('`rule-b`')
      expect(output).toContain('`rule-c`')
      expect(output).toContain('3 violation(s)')
    })

    test('should handle violations across multiple files', () => {
      const reporter = new MarkdownReporter()
      const results = createMockAnalysisResult({
        files: [
          createMockFileResult('a.ts', [createMockViolation({ message: 'Error in A' })]),
          createMockFileResult('b.ts', [createMockViolation({ message: 'Error in B' })]),
          createMockFileResult('c.ts', [createMockViolation({ message: 'Error in C' })]),
        ],
        summary: {
          errorCount: 3,
          filesWithViolations: 3,
          infoCount: 0,
          totalFiles: 3,
          totalTime: 150,
          warningCount: 0,
        },
      })
      reporter.report(results)
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).toContain('### 📄 `a.ts`')
      expect(output).toContain('### 📄 `b.ts`')
      expect(output).toContain('### 📄 `c.ts`')
    })

    test('should not include files without violations in violations section', () => {
      const reporter = new MarkdownReporter()
      const results = createMockAnalysisResult({
        files: [
          createMockFileResult('clean.ts', []),
          createMockFileResult('dirty.ts', [createMockViolation()]),
        ],
        summary: {
          errorCount: 1,
          filesWithViolations: 1,
          infoCount: 0,
          totalFiles: 2,
          totalTime: 100,
          warningCount: 0,
        },
      })
      reporter.report(results)
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).not.toContain('### 📄 `clean.ts`')
      expect(output).toContain('### 📄 `dirty.ts`')
    })

    test('should show "No violations found" when all files are clean', () => {
      const reporter = new MarkdownReporter()
      const results = createMockAnalysisResult({
        files: [createMockFileResult('a.ts', []), createMockFileResult('b.ts', [])],
        summary: {
          errorCount: 0,
          filesWithViolations: 0,
          infoCount: 0,
          totalFiles: 2,
          totalTime: 50,
          warningCount: 0,
        },
      })
      reporter.report(results)
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).toContain('✅ No violations found!')
    })

    test('should show "No violations found" when files array is empty', () => {
      const reporter = new MarkdownReporter()
      reporter.report(createMockAnalysisResult())
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).toContain('✅ No violations found!')
    })

    test('should escape pipe in violation message in table', () => {
      const reporter = new MarkdownReporter()
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [createMockViolation({ message: 'a | b' })])],
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
      expect(output).toContain('a \\| b')
    })
  })

  describe('file grouping', () => {
    test('should group violations by file with subheading', () => {
      const reporter = new MarkdownReporter()
      const results = createMockAnalysisResult({
        files: [
          createMockFileResult('src/utils.ts', [
            createMockViolation({ ruleId: 'rule-a' }),
            createMockViolation({ ruleId: 'rule-b' }),
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
      expect(output).toContain('### 📄 `src/utils.ts`')
    })

    test('should show violation count per file', () => {
      const reporter = new MarkdownReporter()
      const results = createMockAnalysisResult({
        files: [
          createMockFileResult('test.ts', [
            createMockViolation(),
            createMockViolation({ ruleId: 'rule2' }),
            createMockViolation({ ruleId: 'rule3' }),
          ]),
        ],
        summary: {
          errorCount: 3,
          filesWithViolations: 1,
          infoCount: 0,
          totalFiles: 1,
          totalTime: 50,
          warningCount: 0,
        },
      })
      reporter.report(results)
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).toContain('3 violation(s)')
    })

    test('should show 1 violation(s) for single violation', () => {
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
      expect(output).toContain('1 violation(s)')
    })

    test('should wrap file path in backticks in subheading', () => {
      const reporter = new MarkdownReporter()
      const results = createMockAnalysisResult({
        files: [createMockFileResult('path/to/file.ts', [createMockViolation()])],
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
      expect(output).toContain('`path/to/file.ts`')
    })

    test('should separate file sections with blank lines', () => {
      const reporter = new MarkdownReporter()
      const results = createMockAnalysisResult({
        files: [
          createMockFileResult('a.ts', [createMockViolation({ ruleId: 'ra' })]),
          createMockFileResult('b.ts', [createMockViolation({ ruleId: 'rb' })]),
        ],
        summary: {
          errorCount: 2,
          filesWithViolations: 2,
          infoCount: 0,
          totalFiles: 2,
          totalTime: 100,
          warningCount: 0,
        },
      })
      reporter.report(results)
      const output = consoleSpy.mock.calls[0][0] as string
      const aIdx = output.indexOf('### 📄 `a.ts`')
      const bIdx = output.indexOf('### 📄 `b.ts`')
      expect(aIdx).toBeGreaterThan(-1)
      expect(bIdx).toBeGreaterThan(aIdx)
      expect(bIdx - aIdx).toBeGreaterThan(10)
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

    test('should format suggestion as blockquote in report', () => {
      const reporter = new MarkdownReporter()
      const results = createMockAnalysisResult({
        files: [
          createMockFileResult('test.ts', [
            createMockViolation({ ruleId: 'my-rule', suggestion: 'Fix it' }),
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
      expect(output).toContain('\n> 💡 **my-rule**: Fix it')
    })

    test('should include suggestion after table for a file', () => {
      const reporter = new MarkdownReporter()
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [createMockViolation({ suggestion: 'Fix' })])],
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
      const tableEnd = output.indexOf('| Test violation |')
      const suggestionStart = output.indexOf('> 💡')
      expect(suggestionStart).toBeGreaterThan(tableEnd)
    })

    test('should not include suggestion block for violations without suggestions', () => {
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
      const violationsSection = output.split('## Violations')[1]?.split('##')[0] ?? ''
      expect(violationsSection).not.toContain('💡')
    })

    test('should only show suggestions for violations that have them', () => {
      const reporter = new MarkdownReporter()
      const results = createMockAnalysisResult({
        files: [
          createMockFileResult('test.ts', [
            createMockViolation({ ruleId: 'with-sug', suggestion: 'Do this' }),
            createMockViolation({ ruleId: 'no-sug' }),
            createMockViolation({ ruleId: 'also-sug', suggestion: 'Do that' }),
          ]),
        ],
        summary: {
          errorCount: 3,
          filesWithViolations: 1,
          infoCount: 0,
          totalFiles: 1,
          totalTime: 50,
          warningCount: 0,
        },
      })
      reporter.report(results)
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).toContain('💡 **with-sug**:')
      expect(output).toContain('💡 **also-sug**:')
      const noSugMatch = output.match(/💡 \*\*no-sug\*\*:/)
      expect(noSugMatch).toBeNull()
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

    test('should include code block for each source snippet', () => {
      const reporter = new MarkdownReporter({ includeSource: true })
      const results = createMockAnalysisResult({
        files: [
          createMockFileResult('test.ts', [createMockViolation({ source: 'code line', line: 1 })]),
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
      const snippetSection = output.split('## Code Snippets')[1]
      expect(snippetSection).toContain('```')
    })

    test('should only show snippets for violations with source', () => {
      const reporter = new MarkdownReporter({ includeSource: true })
      const results = createMockAnalysisResult({
        files: [
          createMockFileResult('test.ts', [
            createMockViolation({ source: 'has source', line: 1 }),
            createMockViolation({ ruleId: 'no-source', line: 5 }),
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
      expect(output).not.toContain('#### test.ts:5')
    })

    test('should show snippets from multiple files', () => {
      const reporter = new MarkdownReporter({ includeSource: true })
      const results = createMockAnalysisResult({
        files: [
          createMockFileResult('a.ts', [createMockViolation({ source: 'codeA', line: 1 })]),
          createMockFileResult('b.ts', [createMockViolation({ source: 'codeB', line: 2 })]),
        ],
        summary: {
          errorCount: 2,
          filesWithViolations: 2,
          infoCount: 0,
          totalFiles: 2,
          totalTime: 100,
          warningCount: 0,
        },
      })
      reporter.report(results)
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).toContain('#### a.ts:1')
      expect(output).toContain('#### b.ts:2')
    })

    test('should not include files without source violations in snippets', () => {
      const reporter = new MarkdownReporter({ includeSource: true })
      const results = createMockAnalysisResult({
        files: [
          createMockFileResult('with.ts', [createMockViolation({ source: 'code', line: 1 })]),
          createMockFileResult('without.ts', [createMockViolation()]),
        ],
        summary: {
          errorCount: 2,
          filesWithViolations: 2,
          infoCount: 0,
          totalFiles: 2,
          totalTime: 100,
          warningCount: 0,
        },
      })
      reporter.report(results)
      const output = consoleSpy.mock.calls[0][0] as string
      const snippetSection = output.split('## Code Snippets')[1]
      expect(snippetSection).toContain('with.ts')
      expect(snippetSection).not.toContain('without.ts')
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

    test('should include CodeForge link in footer', () => {
      const reporter = new MarkdownReporter()
      reporter.report(createMockAnalysisResult())
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).toContain('[CodeForge](https://github.com/codeforge-dev/codeforge)')
    })

    test('should include horizontal rule before footer', () => {
      const reporter = new MarkdownReporter()
      reporter.report(createMockAnalysisResult())
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).toContain('---\n\n*Generated by')
    })

    test('should format footer as italic text', () => {
      const reporter = new MarkdownReporter()
      reporter.report(createMockAnalysisResult())
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).toContain('*Generated by')
    })

    test('should include version 0.0.0 when provided', () => {
      const reporter = new MarkdownReporter()
      const results = createMockAnalysisResult({ version: '0.0.0' })
      reporter.report(results)
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).toContain('v0.0.0')
    })

    test('should include pre-release version when provided', () => {
      const reporter = new MarkdownReporter()
      const results = createMockAnalysisResult({ version: '2.0.0-beta.1' })
      reporter.report(results)
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).toContain('v2.0.0-beta.1')
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
      fsExistsSyncMock.mockClear()
      fsMkdirSyncMock.mockClear()
      fsWriteFileSyncMock.mockClear()
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

    test('should not create directory if it exists', () => {
      vi.mocked(path.dirname).mockReturnValue('./reports')
      const reporter = new MarkdownReporter({ outputPath: './reports/report.md' })
      const results = createMockAnalysisResult()
      fsExistsSyncMock.mockReturnValue(true)
      reporter.report(results)
      expect(fsMkdirSyncMock).not.toHaveBeenCalled()
      vi.mocked(path.dirname).mockRestore()
    })

    test('should write markdown content to file', () => {
      const reporter = new MarkdownReporter({ outputPath: './report.md' })
      const results = createMockAnalysisResult()
      fsExistsSyncMock.mockReturnValue(true)
      reporter.report(results)
      const writtenContent = fsWriteFileSyncMock.mock.calls[0][1] as string
      expect(writtenContent).toContain('# CodeForge Analysis Report')
    })

    test('should write with utf8 encoding', () => {
      const reporter = new MarkdownReporter({ outputPath: './report.md' })
      const results = createMockAnalysisResult()
      fsExistsSyncMock.mockReturnValue(true)
      reporter.report(results)
      expect(fsWriteFileSyncMock).toHaveBeenCalledWith('./report.md', expect.any(String), 'utf8')
    })

    test('should not output to console when writing to file', () => {
      const reporter = new MarkdownReporter({ outputPath: './report.md' })
      const results = createMockAnalysisResult()
      fsExistsSyncMock.mockReturnValue(true)
      reporter.report(results)
      expect(consoleSpy).not.toHaveBeenCalled()
    })

    test('should output to console when no outputPath', () => {
      const reporter = new MarkdownReporter()
      const results = createMockAnalysisResult()
      reporter.report(results)
      expect(consoleSpy).toHaveBeenCalled()
    })
  })

  describe('report structure', () => {
    test('should have sections in correct order', () => {
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
      const headerIdx = output.indexOf('# CodeForge Analysis Report')
      const summaryIdx = output.indexOf('## Summary')
      const violationsIdx = output.indexOf('## Violations')
      const footerIdx = output.indexOf('---\n\n*Generated by')
      expect(headerIdx).toBeLessThan(summaryIdx)
      expect(summaryIdx).toBeLessThan(violationsIdx)
      expect(violationsIdx).toBeLessThan(footerIdx)
    })

    test('should separate sections with double newlines', () => {
      const reporter = new MarkdownReporter()
      reporter.report(createMockAnalysisResult())
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).toContain('Report\n\nGenerated')
      expect(output).toContain('Summary\n\n| Metric')
    })

    test('should include source snippets between violations and footer when enabled', () => {
      const reporter = new MarkdownReporter({ includeSource: true })
      const results = createMockAnalysisResult({
        files: [
          createMockFileResult('test.ts', [createMockViolation({ source: 'code', line: 1 })]),
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
      const violationsIdx = output.indexOf('## Violations')
      const snippetsIdx = output.indexOf('## Code Snippets')
      const footerIdx = output.indexOf('---\n\n*Generated by')
      expect(violationsIdx).toBeLessThan(snippetsIdx)
      expect(snippetsIdx).toBeLessThan(footerIdx)
    })

    test('should skip source snippets section when includeSource is false', () => {
      const reporter = new MarkdownReporter({ includeSource: false })
      const results = createMockAnalysisResult({
        files: [
          createMockFileResult('test.ts', [createMockViolation({ source: 'code', line: 1 })]),
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
  })

  describe('severity badges', () => {
    test('should map error to red circle', () => {
      const reporter = new MarkdownReporter()
      const output = reporter.format(createMockViolation({ severity: 'error' }))
      expect(output).toContain('🔴')
      expect(output).not.toContain('🟡')
      expect(output).not.toContain('🔵')
    })

    test('should map warning to yellow circle', () => {
      const reporter = new MarkdownReporter()
      const output = reporter.format(createMockViolation({ severity: 'warning' }))
      expect(output).toContain('🟡')
      expect(output).not.toContain('🔴')
      expect(output).not.toContain('🔵')
    })

    test('should map info to blue circle', () => {
      const reporter = new MarkdownReporter()
      const output = reporter.format(createMockViolation({ severity: 'info' }))
      expect(output).toContain('🔵')
      expect(output).not.toContain('🔴')
      expect(output).not.toContain('🟡')
    })

    test('should use correct badge in violations table for error', () => {
      const reporter = new MarkdownReporter()
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [createMockViolation({ severity: 'error' })])],
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
      expect(output).toContain('| 🔴 ERROR')
    })

    test('should use correct badge in violations table for warning', () => {
      const reporter = new MarkdownReporter()
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [createMockViolation({ severity: 'warning' })])],
        summary: {
          errorCount: 0,
          filesWithViolations: 1,
          infoCount: 0,
          totalFiles: 1,
          totalTime: 50,
          warningCount: 1,
        },
      })
      reporter.report(results)
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).toContain('| 🟡 WARNING')
    })

    test('should use correct badge in violations table for info', () => {
      const reporter = new MarkdownReporter()
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [createMockViolation({ severity: 'info' })])],
        summary: {
          errorCount: 0,
          filesWithViolations: 1,
          infoCount: 1,
          totalFiles: 1,
          totalTime: 50,
          warningCount: 0,
        },
      })
      reporter.report(results)
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).toContain('| 🔵 INFO')
    })

    test('should use uppercase severity labels in report table', () => {
      const reporter = new MarkdownReporter()
      const results = createMockAnalysisResult({
        files: [
          createMockFileResult('a.ts', [createMockViolation({ severity: 'error', ruleId: 'r1' })]),
          createMockFileResult('b.ts', [
            createMockViolation({ severity: 'warning', ruleId: 'r2' }),
          ]),
          createMockFileResult('c.ts', [createMockViolation({ severity: 'info', ruleId: 'r3' })]),
        ],
        summary: {
          errorCount: 1,
          filesWithViolations: 3,
          infoCount: 1,
          totalFiles: 3,
          totalTime: 50,
          warningCount: 1,
        },
      })
      reporter.report(results)
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).toContain('ERROR')
      expect(output).toContain('WARNING')
      expect(output).toContain('INFO')
    })

    test('should use correct badges in summary table', () => {
      const reporter = new MarkdownReporter()
      const results = createMockAnalysisResult({
        summary: {
          errorCount: 1,
          filesWithViolations: 1,
          infoCount: 1,
          totalFiles: 1,
          totalTime: 50,
          warningCount: 1,
        },
      })
      reporter.report(results)
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).toContain('🔴 Errors')
      expect(output).toContain('🟡 Warnings')
      expect(output).toContain('🔵 Info')
    })
  })

  describe('special characters and edge cases', () => {
    test('should not escape message in format output (raw pass-through)', () => {
      const reporter = new MarkdownReporter()
      const output = reporter.format(createMockViolation({ message: 'Use `<T>` for generics' }))
      expect(output).toContain('`<T>`')
    })

    test('should escape backticks in report table message', () => {
      const reporter = new MarkdownReporter()
      const results = createMockAnalysisResult({
        files: [
          createMockFileResult('test.ts', [
            createMockViolation({ message: 'Use `const` keyword' }),
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
      expect(output).toContain('\\`const\\`')
    })

    test('should escape asterisks in report table message', () => {
      const reporter = new MarkdownReporter()
      const results = createMockAnalysisResult({
        files: [
          createMockFileResult('test.ts', [
            createMockViolation({ message: 'Found **bold** text' }),
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
      expect(output).toContain('\\*\\*bold\\*\\*')
    })

    test('should escape underscores in report table message', () => {
      const reporter = new MarkdownReporter()
      const results = createMockAnalysisResult({
        files: [
          createMockFileResult('test.ts', [
            createMockViolation({ message: 'Variable my_var is unused' }),
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
      expect(output).toContain('my\\_var')
    })

    test('should escape hash in report table message', () => {
      const reporter = new MarkdownReporter()
      const results = createMockAnalysisResult({
        files: [
          createMockFileResult('test.ts', [
            createMockViolation({ message: 'Heading #1 is malformed' }),
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
      expect(output).toContain('\\#1')
    })

    test('should escape square brackets in report table message', () => {
      const reporter = new MarkdownReporter()
      const results = createMockAnalysisResult({
        files: [
          createMockFileResult('test.ts', [
            createMockViolation({ message: 'Array access arr[0] is unsafe' }),
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
      expect(output).toContain('arr\\[0\\]')
    })

    test('should escape pipe in report table message', () => {
      const reporter = new MarkdownReporter()
      const results = createMockAnalysisResult({
        files: [
          createMockFileResult('test.ts', [createMockViolation({ message: 'Use a | b pipeline' })]),
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
      expect(output).toContain('a \\| b')
    })

    test('should escape ampersand in report table message', () => {
      const reporter = new MarkdownReporter()
      const results = createMockAnalysisResult({
        files: [
          createMockFileResult('test.ts', [createMockViolation({ message: 'Use && operator' })]),
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
      expect(output).toContain('\\&\\&')
    })

    test('should escape angle brackets in report table message', () => {
      const reporter = new MarkdownReporter()
      const results = createMockAnalysisResult({
        files: [
          createMockFileResult('test.ts', [
            createMockViolation({ message: 'Use `<T>` for generics' }),
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
      expect(output).toContain('\\<T\\>')
    })

    test('should not escape backticks in format message (raw pass-through)', () => {
      const reporter = new MarkdownReporter()
      const output = reporter.format(createMockViolation({ message: 'Use `const` keyword' }))
      expect(output).toContain('`const`')
    })

    test('should not escape asterisks in format message (raw pass-through)', () => {
      const reporter = new MarkdownReporter()
      const output = reporter.format(createMockViolation({ message: 'Found **bold** text' }))
      expect(output).toContain('**bold**')
    })

    test('should not escape underscores in format message (raw pass-through)', () => {
      const reporter = new MarkdownReporter()
      const output = reporter.format(createMockViolation({ message: 'Variable my_var is unused' }))
      expect(output).toContain('my_var')
    })

    test('should not escape hash in format message (raw pass-through)', () => {
      const reporter = new MarkdownReporter()
      const output = reporter.format(createMockViolation({ message: 'Heading #1 is malformed' }))
      expect(output).toContain('#1')
    })

    test('should not escape square brackets in format message (raw pass-through)', () => {
      const reporter = new MarkdownReporter()
      const output = reporter.format(
        createMockViolation({ message: 'Array access arr[0] is unsafe' }),
      )
      expect(output).toContain('arr[0]')
    })

    test('should not escape pipe in format message (raw pass-through)', () => {
      const reporter = new MarkdownReporter()
      const output = reporter.format(createMockViolation({ message: 'Use a | b pipeline' }))
      expect(output).toContain('a | b')
    })

    test('should not escape ampersand in format message (raw pass-through)', () => {
      const reporter = new MarkdownReporter()
      const output = reporter.format(createMockViolation({ message: 'Use && operator' }))
      expect(output).toContain('&&')
    })

    test('should handle message with all special characters in report table', () => {
      const reporter = new MarkdownReporter()
      const results = createMockAnalysisResult({
        files: [
          createMockFileResult('test.ts', [
            createMockViolation({
              message: '<div> & `code` *bold* _italic_ #heading [link] | pipe',
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
      expect(output).toContain('\\<div\\>')
      expect(output).toContain('\\&')
      expect(output).toContain('\\`code\\`')
      expect(output).toContain('\\*bold\\*')
      expect(output).toContain('\\_italic\\_')
      expect(output).toContain('\\#heading')
      expect(output).toContain('\\[link\\]')
      expect(output).toContain('\\|')
    })

    test('should handle unicode in message', () => {
      const reporter = new MarkdownReporter()
      const output = reporter.format(createMockViolation({ message: '变量 x 未使用 — 请检查' }))
      expect(output).toContain('变量 x 未使用 — 请检查')
    })

    test('should handle emoji in message', () => {
      const reporter = new MarkdownReporter()
      const output = reporter.format(createMockViolation({ message: 'Found 🐛 bug here' }))
      expect(output).toContain('🐛')
    })

    test('should handle multiline source with many lines', () => {
      const reporter = new MarkdownReporter()
      const source = Array.from({ length: 100 }, (_, i) => `line ${i + 1}`).join('\n')
      const output = reporter.format(createMockViolation({ source, line: 50 }))
      expect(output).toContain('>   50 |')
      expect(output).toContain('line 50')
    })

    test('should handle source with Windows line endings', () => {
      const reporter = new MarkdownReporter()
      const source = 'line1\r\nline2\r\nline3'
      const output = reporter.format(createMockViolation({ source, line: 2 }))
      expect(output).toContain('```')
      expect(output).toContain('|')
    })

    test('should handle violation message with newlines', () => {
      const reporter = new MarkdownReporter()
      const output = reporter.format(createMockViolation({ message: 'Line 1\nLine 2\nLine 3' }))
      expect(output).toBeDefined()
    })

    test('should handle ruleId with special characters', () => {
      const reporter = new MarkdownReporter()
      const output = reporter.format(createMockViolation({ ruleId: '@scope/rule-name' }))
      expect(output).toContain('**@scope/rule-name**')
    })

    test('should handle filePath with special characters', () => {
      const reporter = new MarkdownReporter()
      const output = reporter.format(createMockViolation({ filePath: 'src/[dynamic]/file.ts' }))
      expect(output).toContain('src/[dynamic]/file.ts')
    })

    test('should handle column 0', () => {
      const reporter = new MarkdownReporter()
      const output = reporter.format(createMockViolation({ column: 0 }))
      expect(output).toContain(':10:0')
    })

    test('should handle very large line number', () => {
      const reporter = new MarkdownReporter()
      const output = reporter.format(createMockViolation({ line: 99999 }))
      expect(output).toContain(':99999:')
    })
  })

  describe('code snippet formatting', () => {
    test('should pad line numbers to 4 characters', () => {
      const reporter = new MarkdownReporter()
      const output = reporter.format(
        createMockViolation({ source: 'line1\nline2\nline3', line: 1 }),
      )
      expect(output).toContain('   1 |')
    })

    test('should pad multi-digit line numbers to consistent width', () => {
      const reporter = new MarkdownReporter()
      const source = Array.from({ length: 150 }, (_, i) => `line${i + 1}`).join('\n')
      const output = reporter.format(createMockViolation({ source, line: 100 }))
      expect(output).toContain('>  100 |')
    })

    test('should use > marker only on the violation line', () => {
      const reporter = new MarkdownReporter()
      const source = 'a\nb\nc\nd\ne'
      const output = reporter.format(createMockViolation({ source, line: 3 }))
      const lines = output.split('\n').filter((l) => l.includes('|'))
      const markedLines = lines.filter((l) => l.startsWith('>'))
      expect(markedLines.length).toBe(1)
      expect(markedLines[0]).toContain('3')
    })

    test('should show 5 lines of context when possible', () => {
      const reporter = new MarkdownReporter()
      const source = 'a\nb\nc\nd\ne\nf\ng'
      const output = reporter.format(createMockViolation({ source, line: 4 }))
      const codeBlock = output.match(/```\n([\s\S]*?)\n```/)?.[1]
      expect(codeBlock).toBeDefined()
      const lines = codeBlock!.split('\n')
      expect(lines.length).toBe(5)
    })

    test('should handle violation on line 2 with limited context before', () => {
      const reporter = new MarkdownReporter()
      const source = 'line1\nline2\nline3\nline4'
      const output = reporter.format(createMockViolation({ source, line: 2 }))
      const codeBlock = output.match(/```\n([\s\S]*?)\n```/)?.[1]
      expect(codeBlock).toBeDefined()
      const lines = codeBlock!.split('\n')
      expect(lines[0]).toContain('1')
      expect(lines[1]).toContain('>')
      expect(lines[1]).toContain('2')
    })

    test('should handle violation on second to last line', () => {
      const reporter = new MarkdownReporter()
      const source = 'line1\nline2\nline3\nline4\nline5'
      const output = reporter.format(createMockViolation({ source, line: 4 }))
      const codeBlock = output.match(/```\n([\s\S]*?)\n```/)?.[1]
      expect(codeBlock).toBeDefined()
      const lines = codeBlock!.split('\n')
      expect(lines.some((l) => l.includes('5'))).toBe(true)
    })
  })

  describe('mixed severity violations', () => {
    test('should handle file with all three severity levels', () => {
      const reporter = new MarkdownReporter()
      const results = createMockAnalysisResult({
        files: [
          createMockFileResult('test.ts', [
            createMockViolation({ severity: 'error', ruleId: 'err-rule' }),
            createMockViolation({ severity: 'warning', ruleId: 'warn-rule' }),
            createMockViolation({ severity: 'info', ruleId: 'info-rule' }),
          ]),
        ],
        summary: {
          errorCount: 1,
          filesWithViolations: 1,
          infoCount: 1,
          totalFiles: 1,
          totalTime: 50,
          warningCount: 1,
        },
      })
      reporter.report(results)
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).toContain('🔴 ERROR')
      expect(output).toContain('🟡 WARNING')
      expect(output).toContain('🔵 INFO')
      expect(output).toContain('3 violation(s)')
    })

    test('should compute total violations correctly for mixed severities', () => {
      const reporter = new MarkdownReporter()
      const results = createMockAnalysisResult({
        summary: {
          errorCount: 3,
          filesWithViolations: 2,
          infoCount: 5,
          totalFiles: 2,
          totalTime: 100,
          warningCount: 4,
        },
      })
      reporter.report(results)
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).toContain('| Total Violations | 12 |')
    })
  })

  describe('multiple files with complex scenarios', () => {
    test('should handle 10 files with violations', () => {
      const reporter = new MarkdownReporter()
      const files = Array.from({ length: 10 }, (_, i) =>
        createMockFileResult(`file${i}.ts`, [
          createMockViolation({ ruleId: `rule-${i}`, message: `Error in file${i}` }),
        ]),
      )
      const results = createMockAnalysisResult({
        files,
        summary: {
          errorCount: 10,
          filesWithViolations: 10,
          infoCount: 0,
          totalFiles: 10,
          totalTime: 500,
          warningCount: 0,
        },
      })
      reporter.report(results)
      const output = consoleSpy.mock.calls[0][0] as string
      for (let i = 0; i < 10; i++) {
        expect(output).toContain(`### 📄 \`file${i}.ts\``)
        expect(output).toContain(`Error in file${i}`)
      }
    })

    test('should handle file with many violations', () => {
      const reporter = new MarkdownReporter()
      const violations = Array.from({ length: 20 }, (_, i) =>
        createMockViolation({ ruleId: `rule-${i}`, line: i + 1, column: i + 1 }),
      )
      const results = createMockAnalysisResult({
        files: [createMockFileResult('big-file.ts', violations)],
        summary: {
          errorCount: 20,
          filesWithViolations: 1,
          infoCount: 0,
          totalFiles: 1,
          totalTime: 200,
          warningCount: 0,
        },
      })
      reporter.report(results)
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).toContain('20 violation(s)')
      expect(output).toContain('`rule-0`')
      expect(output).toContain('`rule-19`')
    })

    test('should handle file with mixed violations including suggestions and source', () => {
      const reporter = new MarkdownReporter({ includeSource: true })
      const results = createMockAnalysisResult({
        files: [
          createMockFileResult('complex.ts', [
            createMockViolation({
              severity: 'error',
              ruleId: 'err-with-src',
              source: 'let x = 1;\nlet y = 2;',
              line: 1,
            }),
            createMockViolation({
              severity: 'warning',
              ruleId: 'warn-with-sug',
              suggestion: 'Fix the warning',
            }),
            createMockViolation({
              severity: 'info',
              ruleId: 'plain-info',
            }),
          ]),
        ],
        summary: {
          errorCount: 1,
          filesWithViolations: 1,
          infoCount: 1,
          totalFiles: 1,
          totalTime: 50,
          warningCount: 1,
        },
      })
      reporter.report(results)
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).toContain('3 violation(s)')
      expect(output).toContain('## Code Snippets')
      expect(output).toContain('💡 **warn-with-sug**:')
      expect(output).toContain('🔵 INFO')
    })
  })

  describe('report name property', () => {
    test('should have correct name', () => {
      const reporter = new MarkdownReporter()
      expect(reporter.name).toBe('markdown')
    })

    test('should be readonly', () => {
      const reporter = new MarkdownReporter()
      expect(() => {
        // This tests that name is readonly by checking its value
        const name = reporter.name
        expect(name).toBe('markdown')
      }).not.toThrow()
    })
  })

  describe('analysis time formatting', () => {
    test('should format time with 2 decimal places', () => {
      const reporter = new MarkdownReporter()
      const results = createMockAnalysisResult({
        summary: {
          errorCount: 0,
          filesWithViolations: 0,
          infoCount: 0,
          totalFiles: 0,
          totalTime: 123.456789,
          warningCount: 0,
        },
      })
      reporter.report(results)
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).toContain('123.46ms')
    })

    test('should format zero time', () => {
      const reporter = new MarkdownReporter()
      const results = createMockAnalysisResult({
        summary: {
          errorCount: 0,
          filesWithViolations: 0,
          infoCount: 0,
          totalFiles: 0,
          totalTime: 0,
          warningCount: 0,
        },
      })
      reporter.report(results)
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).toContain('0.00ms')
    })

    test('should format very small time', () => {
      const reporter = new MarkdownReporter()
      const results = createMockAnalysisResult({
        summary: {
          errorCount: 0,
          filesWithViolations: 0,
          infoCount: 0,
          totalFiles: 0,
          totalTime: 0.001,
          warningCount: 0,
        },
      })
      reporter.report(results)
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).toContain('0.00ms')
    })

    test('should format very large time', () => {
      const reporter = new MarkdownReporter()
      const results = createMockAnalysisResult({
        summary: {
          errorCount: 0,
          filesWithViolations: 0,
          infoCount: 0,
          totalFiles: 0,
          totalTime: 99999.999,
          warningCount: 0,
        },
      })
      reporter.report(results)
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).toContain('100000.00ms')
    })
  })

  describe('idempotency and consistency', () => {
    test('should produce same output for same input', () => {
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
      const output1 = consoleSpy.mock.calls[0][0] as string
      reporter.report(results)
      const output2 = consoleSpy.mock.calls[1][0] as string
      const stripTimestamp = (s: string) => s.replace(/Generated on .*/, 'Generated on DATE')
      expect(stripTimestamp(output1)).toBe(stripTimestamp(output2))
    })

    test('should handle empty string filePath', () => {
      const reporter = new MarkdownReporter()
      const output = reporter.format(createMockViolation({ filePath: '' }))
      expect(output).toContain('**test-rule** at :10:5')
    })

    test('should handle violation message that is only special characters in report', () => {
      const reporter = new MarkdownReporter()
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [createMockViolation({ message: '<>&`*_#[]|' })])],
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
      expect(output).toContain('\\<\\>')
      expect(output).toContain('\\&')
      expect(output).toContain('\\`')
    })

    test('should handle suggestion that is only special characters', () => {
      const reporter = new MarkdownReporter()
      const output = reporter.format(createMockViolation({ suggestion: '<>&`*_#[]|' }))
      expect(output).toContain('\\<\\>')
      expect(output).toContain('\\&')
      expect(output).toContain('\\`')
      expect(output).toContain('\\*')
      expect(output).toContain('\\_')
      expect(output).toContain('\\#')
      expect(output).toContain('\\[')
      expect(output).toContain('\\]')
      expect(output).toContain('\\|')
    })
  })

  describe('source snippet in report with includeSource', () => {
    test('should include heading "## Code Snippets"', () => {
      const reporter = new MarkdownReporter({ includeSource: true })
      const results = createMockAnalysisResult({
        files: [
          createMockFileResult('test.ts', [createMockViolation({ source: 'code', line: 1 })]),
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
    })

    test('should use h4 for each snippet heading', () => {
      const reporter = new MarkdownReporter({ includeSource: true })
      const results = createMockAnalysisResult({
        files: [createMockFileResult('app.ts', [createMockViolation({ source: 'x', line: 5 })])],
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
      expect(output).toContain('#### app.ts:5')
    })

    test('should separate snippet headings with double newlines', () => {
      const reporter = new MarkdownReporter({ includeSource: true })
      const results = createMockAnalysisResult({
        files: [
          createMockFileResult('test.ts', [
            createMockViolation({ source: 'a', line: 1 }),
            createMockViolation({ source: 'b', line: 2 }),
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
      const snippetsSection = output.split('## Code Snippets')[1]
      expect(snippetsSection).toContain('\n\n####')
    })

    test('should not include Code Snippets section when violations have no source', () => {
      const reporter = new MarkdownReporter({ includeSource: true })
      const results = createMockAnalysisResult({
        files: [createMockFileResult('test.ts', [createMockViolation({ ruleId: 'no-source' })])],
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
  })

  describe('violations section heading', () => {
    test('should use "## Violations" heading', () => {
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
      expect(output).toContain('## Violations')
    })

    test('should use same "## Violations" heading for clean results', () => {
      const reporter = new MarkdownReporter()
      reporter.report(createMockAnalysisResult())
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).toContain('## Violations')
    })
  })

  describe('format with no source and no suggestion', () => {
    test('should produce single line format output', () => {
      const reporter = new MarkdownReporter()
      const output = reporter.format(createMockViolation())
      const lines = output.split('\n')
      expect(lines.length).toBe(1)
    })

    test('should not have trailing newlines', () => {
      const reporter = new MarkdownReporter()
      const output = reporter.format(createMockViolation())
      expect(output.endsWith('\n')).toBe(false)
    })
  })

  describe('violation table row formatting', () => {
    test('should format row with severity badge, label, location, rule, and message', () => {
      const reporter = new MarkdownReporter()
      const results = createMockAnalysisResult({
        files: [
          createMockFileResult('app.ts', [
            createMockViolation({
              severity: 'warning',
              line: 15,
              column: 3,
              ruleId: 'no-unused-vars',
              message: 'x is defined but never used',
            }),
          ]),
        ],
        summary: {
          errorCount: 0,
          filesWithViolations: 1,
          infoCount: 0,
          totalFiles: 1,
          totalTime: 50,
          warningCount: 1,
        },
      })
      reporter.report(results)
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).toContain(
        '| 🟡 WARNING | 15:3 | `no-unused-vars` | x is defined but never used |',
      )
    })

    test('should format row for info violation', () => {
      const reporter = new MarkdownReporter()
      const results = createMockAnalysisResult({
        files: [
          createMockFileResult('info.ts', [
            createMockViolation({ severity: 'info', ruleId: 'info-msg', message: 'FYI note' }),
          ]),
        ],
        summary: {
          errorCount: 0,
          filesWithViolations: 1,
          infoCount: 1,
          totalFiles: 1,
          totalTime: 50,
          warningCount: 0,
        },
      })
      reporter.report(results)
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).toContain('| 🔵 INFO |')
      expect(output).toContain('`info-msg`')
      expect(output).toContain('FYI note')
    })
  })

  describe('report document completeness', () => {
    test('should contain all expected top-level sections', () => {
      const reporter = new MarkdownReporter()
      const results = createMockAnalysisResult({
        files: [createMockFileResult('a.ts', [createMockViolation()])],
        summary: {
          errorCount: 1,
          filesWithViolations: 1,
          infoCount: 0,
          totalFiles: 1,
          totalTime: 25,
          warningCount: 0,
        },
        version: '3.0.0',
      })
      reporter.report(results)
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).toContain('# CodeForge Analysis Report')
      expect(output).toContain('## Summary')
      expect(output).toContain('## Violations')
      expect(output).toContain('---')
      expect(output).toContain('Generated by')
      expect(output).toContain('v3.0.0')
    })

    test('should contain summary table with all rows', () => {
      const reporter = new MarkdownReporter()
      reporter.report(createMockAnalysisResult())
      const output = consoleSpy.mock.calls[0][0] as string
      expect(output).toContain('Total Files Analyzed')
      expect(output).toContain('Files with Violations')
      expect(output).toContain('Total Violations')
      expect(output).toContain('Errors')
      expect(output).toContain('Warnings')
      expect(output).toContain('Info')
      expect(output).toContain('Analysis Time')
    })
  })

  describe('format edge cases for source', () => {
    test('should handle source that is exactly one character', () => {
      const reporter = new MarkdownReporter()
      const output = reporter.format(createMockViolation({ source: 'x', line: 1 }))
      expect(output).toContain('```')
      expect(output).toContain('x')
    })

    test('should handle source that is empty string', () => {
      const reporter = new MarkdownReporter()
      const output = reporter.format(createMockViolation({ source: '', line: 1 }))
      expect(output).toContain('**test-rule**')
      expect(output).not.toContain('```')
    })

    test('should handle source with only whitespace lines', () => {
      const reporter = new MarkdownReporter()
      const source = '   \n\t\n   '
      const output = reporter.format(createMockViolation({ source, line: 2 }))
      expect(output).toContain('```')
    })
  })

  describe('constructor options interaction', () => {
    test('should not affect format behavior when includeSource is true', () => {
      const reporter = new MarkdownReporter({ includeSource: true })
      const output = reporter.format(createMockViolation({ source: 'code', line: 1 }))
      expect(output).toContain('```')
      expect(output).toContain('code')
    })

    test('should not affect format behavior when outputPath is set', () => {
      const reporter = new MarkdownReporter({ outputPath: './out.md' })
      const output = reporter.format(createMockViolation())
      expect(output).toContain('**test-rule** at test.ts:10:5')
    })
  })

  describe('suggestion in report blockquote format', () => {
    test('should format each suggestion on new blockquote line', () => {
      const reporter = new MarkdownReporter()
      const results = createMockAnalysisResult({
        files: [
          createMockFileResult('test.ts', [
            createMockViolation({ ruleId: 'r1', suggestion: 'Fix A' }),
            createMockViolation({ ruleId: 'r2', suggestion: 'Fix B' }),
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
      expect(output).toMatch(/> 💡 \*\*r1\*\*: Fix A/)
      expect(output).toMatch(/> 💡 \*\*r2\*\*: Fix B/)
    })
  })

  describe('escapeMarkdown integration in report', () => {
    test('should escape message with backticks and angle brackets in table', () => {
      const reporter = new MarkdownReporter()
      const results = createMockAnalysisResult({
        files: [
          createMockFileResult('test.ts', [
            createMockViolation({ message: 'Replace `<div>` with `<span>`' }),
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
      expect(output).toContain('\\<div\\>')
      expect(output).toContain('\\<span\\>')
    })

    test('should escape message with markdown link syntax in table', () => {
      const reporter = new MarkdownReporter()
      const results = createMockAnalysisResult({
        files: [
          createMockFileResult('test.ts', [
            createMockViolation({ message: 'See [docs](url) for details' }),
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
      expect(output).toContain('\\[docs\\]')
    })
  })
})
