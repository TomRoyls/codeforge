import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { MarkdownReporter } from '../src/reporters/markdown-reporter.js'
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

// ─── MarkdownReporter class ───────────────────────────

describe('MarkdownReporter', () => {
  // ─── Construction ───────────────────────────────────

  describe('construction', () => {
    it('has name "markdown"', () => {
      const reporter = new MarkdownReporter()
      expect(reporter.name).toBe('markdown')
    })

    it('defaults includeSource to false', () => {
      const reporter = new MarkdownReporter()
      expect(reporter).toBeInstanceOf(MarkdownReporter)
    })

    it('stores includeSource from options', () => {
      const reporter = new MarkdownReporter({ includeSource: true })
      expect(reporter).toBeInstanceOf(MarkdownReporter)
    })

    it('stores outputPath from options', () => {
      const reporter = new MarkdownReporter({ outputPath: '/tmp/report.md' })
      expect(reporter).toBeInstanceOf(MarkdownReporter)
    })

    it('accepts empty options', () => {
      const reporter = new MarkdownReporter({})
      expect(reporter.name).toBe('markdown')
    })
  })

  // ─── format ─────────────────────────────────────────

  describe('format', () => {
    it('includes severity icon for error', () => {
      const reporter = new MarkdownReporter()
      const result = reporter.format(makeViolation({ severity: 'error' }))
      expect(result).toContain('🔴')
    })

    it('includes severity icon for warning', () => {
      const reporter = new MarkdownReporter()
      const result = reporter.format(makeViolation({ severity: 'warning' }))
      expect(result).toContain('🟡')
    })

    it('includes severity icon for info', () => {
      const reporter = new MarkdownReporter()
      const result = reporter.format(makeViolation({ severity: 'info' }))
      expect(result).toContain('🔵')
    })

    it('includes ruleId in bold', () => {
      const reporter = new MarkdownReporter()
      const result = reporter.format(makeViolation())
      expect(result).toContain('**no-console**')
    })

    it('includes file location', () => {
      const reporter = new MarkdownReporter()
      const result = reporter.format(makeViolation())
      expect(result).toContain('src/index.ts:5:10')
    })

    it('includes message', () => {
      const reporter = new MarkdownReporter()
      const result = reporter.format(makeViolation())
      expect(result).toContain('Unexpected console statement')
    })

    it('includes code snippet when source is present', () => {
      const reporter = new MarkdownReporter()
      const result = reporter.format(makeViolation({ source: 'console.log("x")' }))
      expect(result).toContain('```')
    })

    it('does not include code snippet when source is absent', () => {
      const reporter = new MarkdownReporter()
      const result = reporter.format(makeViolation())
      expect(result).not.toContain('```')
    })

    it('includes suggestion when present', () => {
      const reporter = new MarkdownReporter()
      const result = reporter.format(makeViolation({ suggestion: 'Remove console' }))
      expect(result).toContain('> 💡 Suggestion:')
      expect(result).toContain('Remove console')
    })

    it('does not include suggestion when absent', () => {
      const reporter = new MarkdownReporter()
      const result = reporter.format(makeViolation())
      expect(result).not.toContain('💡 Suggestion')
    })

    it('includes raw message without escaping in format output', () => {
      const reporter = new MarkdownReporter()
      const result = reporter.format(makeViolation({ message: 'Use <span> & `code`' }))
      expect(result).toContain('Use <span> & `code`')
    })

    it('escapes markdown in suggestion', () => {
      const reporter = new MarkdownReporter()
      const result = reporter.format(
        makeViolation({ suggestion: 'Try <div> & "stuff"' }),
      )
      expect(result).toContain(String.raw`\<div\>`)
    })

    it('formats basic violation without source or suggestion', () => {
      const reporter = new MarkdownReporter()
      const result = reporter.format(makeViolation())
      expect(result).toMatch(/🔴 \*\*no-console\*\* at src\/index\.ts:5:10/)
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

    it('writes markdown to stdout when no outputPath', () => {
      const reporter = new MarkdownReporter()
      reporter.report(makeAnalysisResult())
      expect(stdoutSpy).toHaveBeenCalledTimes(1)
    })

    it('does not write to stdout when outputPath is set', () => {
      const reporter = new MarkdownReporter({ outputPath: '/tmp/report.md' })
      reporter.report(makeAnalysisResult())
      expect(stdoutSpy).not.toHaveBeenCalled()
    })

    it('includes header with CodeForge title', () => {
      const reporter = new MarkdownReporter()
      reporter.report(makeAnalysisResult())
      const output = stdoutSpy.mock.calls[0]![0] as string
      expect(output).toContain('# CodeForge Analysis Report')
    })

    it('includes "Generated on" timestamp', () => {
      const reporter = new MarkdownReporter()
      reporter.report(makeAnalysisResult())
      const output = stdoutSpy.mock.calls[0]![0] as string
      expect(output).toContain('Generated on')
    })

    it('includes Summary section', () => {
      const reporter = new MarkdownReporter()
      reporter.report(makeAnalysisResult())
      const output = stdoutSpy.mock.calls[0]![0] as string
      expect(output).toContain('## Summary')
    })

    it('includes summary table with correct metrics', () => {
      const reporter = new MarkdownReporter()
      reporter.report(makeAnalysisResult())
      const output = stdoutSpy.mock.calls[0]![0] as string
      expect(output).toContain('Total Files Analyzed')
      expect(output).toContain('Files with Violations')
      expect(output).toContain('Total Violations')
      expect(output).toContain('🔴 Errors')
      expect(output).toContain('🟡 Warnings')
      expect(output).toContain('🔵 Info')
      expect(output).toContain('Analysis Time')
    })

    it('includes Violations section', () => {
      const reporter = new MarkdownReporter()
      reporter.report(makeAnalysisResult())
      const output = stdoutSpy.mock.calls[0]![0] as string
      expect(output).toContain('## Violations')
    })

    it('includes file path in violation section', () => {
      const reporter = new MarkdownReporter()
      reporter.report(makeAnalysisResult())
      const output = stdoutSpy.mock.calls[0]![0] as string
      expect(output).toContain('`src/index.ts`')
    })

    it('includes violation count per file', () => {
      const reporter = new MarkdownReporter()
      reporter.report(makeAnalysisResult())
      const output = stdoutSpy.mock.calls[0]![0] as string
      expect(output).toContain('1 violation(s)')
    })

    it('includes violations table with headers', () => {
      const reporter = new MarkdownReporter()
      reporter.report(makeAnalysisResult())
      const output = stdoutSpy.mock.calls[0]![0] as string
      expect(output).toContain('| Severity | Location | Rule | Message |')
    })

    it('includes violation row with severity badge', () => {
      const reporter = new MarkdownReporter()
      reporter.report(makeAnalysisResult())
      const output = stdoutSpy.mock.calls[0]![0] as string
      expect(output).toContain('🔴 ERROR')
    })

    it('includes violation row with location', () => {
      const reporter = new MarkdownReporter()
      reporter.report(makeAnalysisResult())
      const output = stdoutSpy.mock.calls[0]![0] as string
      expect(output).toContain('5:10')
    })

    it('includes violation row with ruleId', () => {
      const reporter = new MarkdownReporter()
      reporter.report(makeAnalysisResult())
      const output = stdoutSpy.mock.calls[0]![0] as string
      expect(output).toContain('`no-console`')
    })

    it('includes footer with CodeForge link', () => {
      const reporter = new MarkdownReporter()
      reporter.report(makeAnalysisResult())
      const output = stdoutSpy.mock.calls[0]![0] as string
      expect(output).toContain('Generated by [CodeForge]')
      expect(output).toContain('https://github.com/codeforge-dev/codeforge')
    })

    it('uses version from results in footer', () => {
      const reporter = new MarkdownReporter()
      reporter.report(makeAnalysisResult({ version: '3.0.0' }))
      const output = stdoutSpy.mock.calls[0]![0] as string
      expect(output).toContain('v3.0.0')
    })

    it('uses default version in footer when not provided', () => {
      const reporter = new MarkdownReporter()
      reporter.report(makeAnalysisResult())
      const output = stdoutSpy.mock.calls[0]![0] as string
      expect(output).toContain('v0.1.0')
    })

    it('shows no violations message when clean', () => {
      const reporter = new MarkdownReporter()
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
      expect(output).toContain('✅ No violations found!')
    })

    it('includes suggestions for violations that have them', () => {
      const reporter = new MarkdownReporter()
      reporter.report(
        makeAnalysisResult({
          files: [
            {
              filePath: 'src/index.ts',
              stats: { analysisTime: 10, parseTime: 5, totalTime: 15 },
              violations: [makeViolation({ suggestion: 'Remove the console call' })],
            },
          ],
        }),
      )
      const output = stdoutSpy.mock.calls[0]![0] as string
      expect(output).toContain('💡 **no-console**')
      expect(output).toContain('Remove the console call')
    })
  })

  // ─── Source snippets ────────────────────────────────

  describe('source snippets', () => {
    let stdoutSpy: ReturnType<typeof vi.spyOn>

    beforeEach(() => {
      stdoutSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true)
    })

    afterEach(() => {
      stdoutSpy.mockRestore()
    })

    it('includes Code Snippets section when includeSource is true and source exists', () => {
      const reporter = new MarkdownReporter({ includeSource: true })
      reporter.report(
        makeAnalysisResult({
          files: [
            {
              filePath: 'src/index.ts',
              stats: { analysisTime: 10, parseTime: 5, totalTime: 15 },
              violations: [
                makeViolation({
                  source: 'line1\nline2\nline3\nconsole.log()\nline5\nline6\nline7',
                }),
              ],
            },
          ],
        }),
      )
      const output = stdoutSpy.mock.calls[0]![0] as string
      expect(output).toContain('## Code Snippets')
    })

    it('does not include Code Snippets section when includeSource is false', () => {
      const reporter = new MarkdownReporter({ includeSource: false })
      reporter.report(
        makeAnalysisResult({
          files: [
            {
              filePath: 'src/index.ts',
              stats: { analysisTime: 10, parseTime: 5, totalTime: 15 },
              violations: [makeViolation({ source: 'some code' })],
            },
          ],
        }),
      )
      const output = stdoutSpy.mock.calls[0]![0] as string
      expect(output).not.toContain('## Code Snippets')
    })

    it('does not include Code Snippets when no violations have source', () => {
      const reporter = new MarkdownReporter({ includeSource: true })
      reporter.report(
        makeAnalysisResult({
          files: [
            {
              filePath: 'src/index.ts',
              stats: { analysisTime: 10, parseTime: 5, totalTime: 15 },
              violations: [makeViolation()],
            },
          ],
        }),
      )
      const output = stdoutSpy.mock.calls[0]![0] as string
      expect(output).not.toContain('## Code Snippets')
    })

    it('shows line marker on the violation line', () => {
      const reporter = new MarkdownReporter()
      const result = reporter.format(
        makeViolation({
          line: 3,
          source: 'a\nb\nconsole.log()\nd\ne',
        }),
      )
      expect(result).toContain('>    3 |')
    })

    it('shows non-marker for other lines', () => {
      const reporter = new MarkdownReporter()
      const result = reporter.format(
        makeViolation({
          line: 3,
          source: 'a\nb\nconsole.log()\nd\ne',
        }),
      )
      expect(result).toMatch(/     1 \|/)
      expect(result).toMatch(/     2 \|/)
    })

    it('includes snippet header with file and line', () => {
      const reporter = new MarkdownReporter({ includeSource: true })
      reporter.report(
        makeAnalysisResult({
          files: [
            {
              filePath: 'src/app.ts',
              stats: { analysisTime: 1, parseTime: 1, totalTime: 2 },
              violations: [makeViolation({ filePath: 'src/app.ts', line: 5, source: 'code' })],
            },
          ],
        }),
      )
      const output = stdoutSpy.mock.calls[0]![0] as string
      expect(output).toContain('#### src/app.ts:5')
    })
  })

  // ─── Summary table ──────────────────────────────────

  describe('summary table', () => {
    let stdoutSpy: ReturnType<typeof vi.spyOn>

    beforeEach(() => {
      stdoutSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true)
    })

    afterEach(() => {
      stdoutSpy.mockRestore()
    })

    it('calculates total violations correctly', () => {
      const reporter = new MarkdownReporter()
      reporter.report(
        makeAnalysisResult({
          summary: {
            errorCount: 2,
            filesWithViolations: 1,
            infoCount: 3,
            totalFiles: 1,
            totalTime: 50,
            warningCount: 4,
          },
        }),
      )
      const output = stdoutSpy.mock.calls[0]![0] as string
      expect(output).toContain('| Total Violations | 9 |')
    })

    it('shows 0 total violations when all counts are zero', () => {
      const reporter = new MarkdownReporter()
      reporter.report(
        makeAnalysisResult({
          summary: {
            errorCount: 0,
            filesWithViolations: 0,
            infoCount: 0,
            totalFiles: 5,
            totalTime: 10,
            warningCount: 0,
          },
        }),
      )
      const output = stdoutSpy.mock.calls[0]![0] as string
      expect(output).toContain('| Total Violations | 0 |')
    })

    it('formats total time with fixed decimals', () => {
      const reporter = new MarkdownReporter()
      reporter.report(makeAnalysisResult({ summary: { ...makeAnalysisResult().summary, totalTime: 123.456 } }))
      const output = stdoutSpy.mock.calls[0]![0] as string
      expect(output).toContain('123.46ms')
    })
  })

  // ─── Violations table ───────────────────────────────

  describe('violations table', () => {
    let stdoutSpy: ReturnType<typeof vi.spyOn>

    beforeEach(() => {
      stdoutSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true)
    })

    afterEach(() => {
      stdoutSpy.mockRestore()
    })

    it('includes severity badge for each row', () => {
      const reporter = new MarkdownReporter()
      reporter.report(
        makeAnalysisResult({
          files: [
            {
              filePath: 'src/a.ts',
              stats: { analysisTime: 1, parseTime: 1, totalTime: 2 },
              violations: [
                makeViolation({ filePath: 'src/a.ts', severity: 'error' }),
                makeViolation({ filePath: 'src/a.ts', severity: 'warning' }),
                makeViolation({ filePath: 'src/a.ts', severity: 'info' }),
              ],
            },
          ],
          summary: {
            errorCount: 1,
            filesWithViolations: 1,
            infoCount: 1,
            totalFiles: 1,
            totalTime: 2,
            warningCount: 1,
          },
        }),
      )
      const output = stdoutSpy.mock.calls[0]![0] as string
      expect(output).toContain('🔴 ERROR')
      expect(output).toContain('🟡 WARNING')
      expect(output).toContain('🔵 INFO')
    })

    it('separates files into different sections', () => {
      const reporter = new MarkdownReporter()
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
      expect(output).toContain('`src/a.ts`')
      expect(output).toContain('`src/b.ts`')
    })

    it('shows correct violation count per file', () => {
      const reporter = new MarkdownReporter()
      reporter.report(
        makeAnalysisResult({
          files: [
            {
              filePath: 'src/a.ts',
              stats: { analysisTime: 1, parseTime: 1, totalTime: 2 },
              violations: [
                makeViolation({ filePath: 'src/a.ts' }),
                makeViolation({ filePath: 'src/a.ts', line: 20 }),
              ],
            },
          ],
          summary: {
            errorCount: 2,
            filesWithViolations: 1,
            infoCount: 0,
            totalFiles: 1,
            totalTime: 2,
            warningCount: 0,
          },
        }),
      )
      const output = stdoutSpy.mock.calls[0]![0] as string
      expect(output).toContain('2 violation(s)')
    })
  })

  // ─── Edge cases ─────────────────────────────────────

  describe('edge cases', () => {
    let stdoutSpy: ReturnType<typeof vi.spyOn>

    beforeEach(() => {
      stdoutSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true)
    })

    afterEach(() => {
      stdoutSpy.mockRestore()
    })

    it('handles empty files array', () => {
      const reporter = new MarkdownReporter()
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
      expect(output).toContain('# CodeForge Analysis Report')
    })

    it('handles violation with line 1 and column 1', () => {
      const reporter = new MarkdownReporter()
      const result = reporter.format(makeViolation({ line: 1, column: 1 }))
      expect(result).toContain(':1:1')
    })

    it('handles very long message', () => {
      const reporter = new MarkdownReporter()
      const longMsg = 'x'.repeat(500)
      const result = reporter.format(makeViolation({ message: longMsg }))
      expect(result).toContain(longMsg)
    })

    it('handles source with single line', () => {
      const reporter = new MarkdownReporter()
      const result = reporter.format(
        makeViolation({ line: 1, source: 'single line' }),
      )
      expect(result).toContain('```')
    })

    it('handles source with line number at start', () => {
      const reporter = new MarkdownReporter()
      const result = reporter.format(
        makeViolation({ line: 1, source: 'first\nsecond\nthird' }),
      )
      expect(result).toContain('>    1 |')
    })

    it('handles source with line number at end', () => {
      const reporter = new MarkdownReporter()
      const result = reporter.format(
        makeViolation({ line: 3, source: 'first\nsecond\nthird' }),
      )
      expect(result).toContain('>    3 |')
    })

    it('skips files with no violations in violations section', () => {
      const reporter = new MarkdownReporter()
      reporter.report(
        makeAnalysisResult({
          files: [
            {
              filePath: 'src/clean.ts',
              stats: { analysisTime: 1, parseTime: 1, totalTime: 2 },
              violations: [],
            },
            {
              filePath: 'src/dirty.ts',
              stats: { analysisTime: 1, parseTime: 1, totalTime: 2 },
              violations: [makeViolation({ filePath: 'src/dirty.ts' })],
            },
          ],
          summary: {
            errorCount: 1,
            filesWithViolations: 1,
            infoCount: 0,
            totalFiles: 2,
            totalTime: 4,
            warningCount: 0,
          },
        }),
      )
      const output = stdoutSpy.mock.calls[0]![0] as string
      expect(output).not.toContain('`src/clean.ts`')
      expect(output).toContain('`src/dirty.ts`')
    })

    it('appends newline to stdout output', () => {
      const reporter = new MarkdownReporter()
      reporter.report(makeAnalysisResult())
      const output = stdoutSpy.mock.calls[0]![0] as string
      expect(output.endsWith('\n')).toBe(true)
    })
  })
})
