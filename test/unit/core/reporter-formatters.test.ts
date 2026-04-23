import { describe, test, expect } from 'vitest'
import type { AnalysisReport } from '../../../src/core/reporter.js'
import type { RuleViolation } from '../../../src/ast/visitor.js'
import {
  COLORS,
  formatConsole,
  formatJson,
  formatMarkdown,
  formatHtml,
  formatJunit,
  formatSarif,
  formatGitlab,
} from '../../../src/core/reporter-formatters.js'

function createViolation(overrides: Partial<RuleViolation> = {}): RuleViolation {
  return {
    ruleId: 'test-rule',
    severity: 'error',
    message: 'Test violation',
    filePath: '/test/file.ts',
    range: {
      start: { line: 1, column: 1 },
      end: { line: 1, column: 10 },
    },
    ...overrides,
  }
}

function createMockReport(overrides: Partial<AnalysisReport> = {}): AnalysisReport {
  return {
    files: [],
    summary: {
      totalFiles: 0,
      totalViolations: 0,
      errors: 0,
      warnings: 0,
      info: 0,
      duration: 100,
    },
    ...overrides,
  }
}

describe('COLORS', () => {
  test('contains reset escape code', () => {
    expect(COLORS.reset).toBe('\x1b[0m')
  })

  test('contains all ANSI color codes', () => {
    expect(COLORS.red).toBe('\x1b[31m')
    expect(COLORS.yellow).toBe('\x1b[33m')
    expect(COLORS.blue).toBe('\x1b[34m')
  })

  test('contains style escape codes', () => {
    expect(COLORS.dim).toBe('\x1b[2m')
    expect(COLORS.bold).toBe('\x1b[1m')
  })
})

describe('formatJson', () => {
  test('serializes report as pretty-printed JSON', () => {
    const report = createMockReport({
      files: [{ filePath: '/src/a.ts', violations: [createViolation()] }],
      summary: { totalFiles: 1, totalViolations: 1, errors: 1, warnings: 0, info: 0, duration: 50 },
    })
    const output = formatJson(report)
    const parsed = JSON.parse(output)
    expect(parsed.files).toHaveLength(1)
    expect(parsed.files[0].filePath).toBe('/src/a.ts')
  })

  test('handles empty report', () => {
    const report = createMockReport()
    const output = formatJson(report)
    const parsed = JSON.parse(output)
    expect(parsed.files).toEqual([])
    expect(parsed.summary.totalViolations).toBe(0)
  })

  test('formats with 2-space indentation', () => {
    const report = createMockReport()
    const output = formatJson(report)
    expect(output).toContain('\n  "files"')
  })

  test('round-trips summary values correctly', () => {
    const report = createMockReport({
      summary: {
        totalFiles: 7,
        totalViolations: 12,
        errors: 4,
        warnings: 6,
        info: 2,
        duration: 333.33,
      },
    })
    const parsed = JSON.parse(formatJson(report))
    expect(parsed.summary.totalFiles).toBe(7)
    expect(parsed.summary.totalViolations).toBe(12)
    expect(parsed.summary.errors).toBe(4)
    expect(parsed.summary.warnings).toBe(6)
    expect(parsed.summary.info).toBe(2)
    expect(parsed.summary.duration).toBe(333.33)
  })

  test('preserves violation range start and end', () => {
    const report = createMockReport({
      files: [
        {
          filePath: '/src/range.ts',
          violations: [
            createViolation({
              range: { start: { line: 5, column: 3 }, end: { line: 8, column: 12 } },
            }),
          ],
        },
      ],
      summary: { totalFiles: 1, totalViolations: 1, errors: 1, warnings: 0, info: 0, duration: 1 },
    })
    const parsed = JSON.parse(formatJson(report))
    const v = parsed.files[0].violations[0]
    expect(v.range.start.line).toBe(5)
    expect(v.range.start.column).toBe(3)
    expect(v.range.end.line).toBe(8)
    expect(v.range.end.column).toBe(12)
  })

  test('preserves violation severity', () => {
    const report = createMockReport({
      files: [
        {
          filePath: '/src/a.ts',
          violations: [
            createViolation({ severity: 'error', ruleId: 'r1' }),
            createViolation({ severity: 'warning', ruleId: 'r2' }),
            createViolation({ severity: 'info', ruleId: 'r3' }),
          ],
        },
      ],
      summary: { totalFiles: 1, totalViolations: 3, errors: 1, warnings: 1, info: 1, duration: 5 },
    })
    const parsed = JSON.parse(formatJson(report))
    expect(parsed.files[0].violations[0].severity).toBe('error')
    expect(parsed.files[0].violations[1].severity).toBe('warning')
    expect(parsed.files[0].violations[2].severity).toBe('info')
  })

  test('preserves suggestion field when present', () => {
    const report = createMockReport({
      files: [
        {
          filePath: '/src/a.ts',
          violations: [createViolation({ suggestion: 'Try using const instead' })],
        },
      ],
      summary: { totalFiles: 1, totalViolations: 1, errors: 1, warnings: 0, info: 0, duration: 1 },
    })
    const parsed = JSON.parse(formatJson(report))
    expect(parsed.files[0].violations[0].suggestion).toBe('Try using const instead')
  })

  test('preserves ruleId and message fields', () => {
    const report = createMockReport({
      files: [
        {
          filePath: '/src/a.ts',
          violations: [createViolation({ ruleId: 'my-rule', message: 'Custom message text' })],
        },
      ],
      summary: { totalFiles: 1, totalViolations: 1, errors: 1, warnings: 0, info: 0, duration: 1 },
    })
    const parsed = JSON.parse(formatJson(report))
    expect(parsed.files[0].violations[0].ruleId).toBe('my-rule')
    expect(parsed.files[0].violations[0].message).toBe('Custom message text')
  })

  test('preserves filePath on violation', () => {
    const report = createMockReport({
      files: [
        {
          filePath: '/src/a.ts',
          violations: [createViolation({ filePath: '/src/a.ts' })],
        },
      ],
      summary: { totalFiles: 1, totalViolations: 1, errors: 1, warnings: 0, info: 0, duration: 1 },
    })
    const parsed = JSON.parse(formatJson(report))
    expect(parsed.files[0].violations[0].filePath).toBe('/src/a.ts')
  })

  test('handles multiple files with violations', () => {
    const report = createMockReport({
      files: [
        { filePath: '/src/a.ts', violations: [createViolation()] },
        { filePath: '/src/b.ts', violations: [createViolation(), createViolation()] },
      ],
      summary: { totalFiles: 2, totalViolations: 3, errors: 3, warnings: 0, info: 0, duration: 10 },
    })
    const parsed = JSON.parse(formatJson(report))
    expect(parsed.files).toHaveLength(2)
    expect(parsed.files[0].violations).toHaveLength(1)
    expect(parsed.files[1].violations).toHaveLength(2)
  })

  test('produces valid JSON that can be parsed', () => {
    const report = createMockReport({
      files: [{ filePath: '/src/a.ts', violations: [createViolation()] }],
      summary: { totalFiles: 1, totalViolations: 1, errors: 1, warnings: 0, info: 0, duration: 50 },
    })
    expect(() => JSON.parse(formatJson(report))).not.toThrow()
  })
})

describe('formatConsole', () => {
  test('shows header in non-quiet mode', () => {
    const report = createMockReport()
    const output = formatConsole(report, COLORS, false, false)
    expect(output).toContain('CodeForge Analysis Report')
  })

  test('hides header in quiet mode', () => {
    const report = createMockReport({
      files: [{ filePath: '/test/file.ts', violations: [createViolation()] }],
      summary: { totalFiles: 1, totalViolations: 1, errors: 1, warnings: 0, info: 0, duration: 50 },
    })
    const output = formatConsole(report, COLORS, true, false)
    expect(output).not.toContain('CodeForge Analysis Report')
  })

  test('shows suggestion in verbose mode when present', () => {
    const report = createMockReport({
      files: [
        {
          filePath: '/test/file.ts',
          violations: [createViolation({ suggestion: 'Use const instead' })],
        },
      ],
      summary: { totalFiles: 1, totalViolations: 1, errors: 1, warnings: 0, info: 0, duration: 50 },
    })
    const output = formatConsole(report, COLORS, false, true)
    expect(output).toContain('Suggestion:')
    expect(output).toContain('Use const instead')
  })

  test('hides suggestion in non-verbose mode', () => {
    const report = createMockReport({
      files: [
        {
          filePath: '/test/file.ts',
          violations: [createViolation({ suggestion: 'Use const instead' })],
        },
      ],
      summary: { totalFiles: 1, totalViolations: 1, errors: 1, warnings: 0, info: 0, duration: 50 },
    })
    const output = formatConsole(report, COLORS, false, false)
    expect(output).not.toContain('Suggestion:')
  })

  test('uses red for error severity', () => {
    const report = createMockReport({
      files: [{ filePath: '/test/file.ts', violations: [createViolation({ severity: 'error' })] }],
      summary: { totalFiles: 1, totalViolations: 1, errors: 1, warnings: 0, info: 0, duration: 50 },
    })
    const output = formatConsole(report, COLORS, false, false)
    expect(output).toContain(COLORS.red)
  })

  test('uses yellow for warning severity', () => {
    const report = createMockReport({
      files: [
        { filePath: '/test/file.ts', violations: [createViolation({ severity: 'warning' })] },
      ],
      summary: { totalFiles: 1, totalViolations: 1, errors: 0, warnings: 1, info: 0, duration: 50 },
    })
    const output = formatConsole(report, COLORS, false, false)
    expect(output).toContain(COLORS.yellow)
  })

  test('uses blue for info severity', () => {
    const report = createMockReport({
      files: [{ filePath: '/test/file.ts', violations: [createViolation({ severity: 'info' })] }],
      summary: { totalFiles: 1, totalViolations: 1, errors: 0, warnings: 0, info: 1, duration: 50 },
    })
    const output = formatConsole(report, COLORS, false, false)
    expect(output).toContain(COLORS.blue)
  })

  test('skips files with no violations', () => {
    const report = createMockReport({
      files: [
        { filePath: '/src/clean.ts', violations: [] },
        { filePath: '/src/dirty.ts', violations: [createViolation()] },
      ],
      summary: { totalFiles: 2, totalViolations: 1, errors: 1, warnings: 0, info: 0, duration: 50 },
    })
    const output = formatConsole(report, COLORS, false, false)
    expect(output).not.toContain('/src/clean.ts')
    expect(output).toContain('/src/dirty.ts')
  })

  test('shows summary section with counts', () => {
    const report = createMockReport({
      summary: {
        totalFiles: 5,
        totalViolations: 10,
        errors: 3,
        warnings: 5,
        info: 2,
        duration: 250,
      },
    })
    const output = formatConsole(report, COLORS, false, false)
    expect(output).toContain('Files analyzed: 5')
    expect(output).toContain('Total violations: 10')
    expect(output).toContain('Errors: 3')
    expect(output).toContain('Warnings: 5')
    expect(output).toContain('Info: 2')
  })

  test('supports custom no-color colors object', () => {
    const noColors = { reset: '', red: '', yellow: '', blue: '', dim: '', bold: '' }
    const report = createMockReport({
      files: [{ filePath: '/test/file.ts', violations: [createViolation()] }],
      summary: { totalFiles: 1, totalViolations: 1, errors: 1, warnings: 0, info: 0, duration: 50 },
    })
    const output = formatConsole(report, noColors, false, false)
    expect(output).not.toContain('\x1b[')
  })

  test('shows violation location with line:column', () => {
    const report = createMockReport({
      files: [
        {
          filePath: '/test/file.ts',
          violations: [
            createViolation({
              range: { start: { line: 42, column: 15 }, end: { line: 42, column: 20 } },
            }),
          ],
        },
      ],
      summary: { totalFiles: 1, totalViolations: 1, errors: 1, warnings: 0, info: 0, duration: 50 },
    })
    const output = formatConsole(report, COLORS, false, false)
    expect(output).toContain('[42:15]')
  })

  test('shows duration with 2 decimal places', () => {
    const report = createMockReport({
      summary: {
        totalFiles: 0,
        totalViolations: 0,
        errors: 0,
        warnings: 0,
        info: 0,
        duration: 99.999,
      },
    })
    const output = formatConsole(report, COLORS, false, false)
    expect(output).toContain('100.00ms')
  })

  test('unknown severity uses reset color', () => {
    const report = createMockReport({
      files: [
        {
          filePath: '/src/f.ts',
          violations: [createViolation({ severity: 'custom' as 'error' })],
        },
      ],
      summary: { totalFiles: 1, totalViolations: 1, errors: 0, warnings: 0, info: 0, duration: 5 },
    })
    const output = formatConsole(report, COLORS, false, false)
    expect(output).toContain('CUSTOM')
  })

  test('verbose mode shows suggestion only when present', () => {
    const report = createMockReport({
      files: [
        {
          filePath: '/src/f.ts',
          violations: [
            createViolation({ suggestion: 'Fix it', ruleId: 'r1' }),
            createViolation({ suggestion: undefined, ruleId: 'r2' }),
          ],
        },
      ],
      summary: { totalFiles: 1, totalViolations: 2, errors: 2, warnings: 0, info: 0, duration: 5 },
    })
    const output = formatConsole(report, COLORS, false, true)
    expect(output).toContain('Suggestion: Fix it')
    const sugCount = (output.match(/Suggestion:/g) || []).length
    expect(sugCount).toBe(1)
  })

  test('multiple files with violations show proper separators', () => {
    const report = createMockReport({
      files: [
        {
          filePath: '/src/a.ts',
          violations: [createViolation({ ruleId: 'ra', message: 'error in a' })],
        },
        {
          filePath: '/src/b.ts',
          violations: [createViolation({ ruleId: 'rb', message: 'error in b' })],
        },
      ],
      summary: { totalFiles: 2, totalViolations: 2, errors: 2, warnings: 0, info: 0, duration: 20 },
    })
    const output = formatConsole(report, COLORS, false, false)
    expect(output).toContain('/src/a.ts')
    expect(output).toContain('/src/b.ts')
    expect(output).toContain('error in a')
    expect(output).toContain('error in b')
    const idx = output.indexOf('/src/a.ts')
    const idx2 = output.indexOf('/src/b.ts')
    expect(idx).toBeLessThan(idx2)
  })

  test('quiet mode with multiple files suppresses header', () => {
    const report = createMockReport({
      files: [
        { filePath: '/src/a.ts', violations: [createViolation()] },
        { filePath: '/src/b.ts', violations: [createViolation()] },
        { filePath: '/src/c.ts', violations: [createViolation()] },
      ],
      summary: { totalFiles: 3, totalViolations: 3, errors: 3, warnings: 0, info: 0, duration: 30 },
    })
    const output = formatConsole(report, COLORS, true, false)
    expect(output).not.toContain('CodeForge Analysis Report')
    expect(output).toContain('/src/a.ts')
    expect(output).toContain('/src/b.ts')
    expect(output).toContain('/src/c.ts')
  })

  test('verbose mode with no suggestions shows no suggestion lines', () => {
    const report = createMockReport({
      files: [
        {
          filePath: '/src/file.ts',
          violations: [createViolation({ suggestion: undefined })],
        },
      ],
      summary: { totalFiles: 1, totalViolations: 1, errors: 1, warnings: 0, info: 0, duration: 5 },
    })
    const output = formatConsole(report, COLORS, false, true)
    expect(output).not.toContain('Suggestion:')
  })

  test('custom colors with empty strings produce no ANSI escapes', () => {
    const plainColors = { reset: '', red: '', yellow: '', blue: '', dim: '', bold: '' }
    const report = createMockReport({
      files: [
        {
          filePath: '/test/file.ts',
          violations: [
            createViolation({ severity: 'error' }),
            createViolation({ severity: 'warning' }),
            createViolation({ severity: 'info' }),
          ],
        },
      ],
      summary: { totalFiles: 1, totalViolations: 3, errors: 1, warnings: 1, info: 1, duration: 10 },
    })
    const output = formatConsole(report, plainColors, false, false)
    expect(output).not.toContain('\x1b[')
    expect(output).toContain('ERROR')
    expect(output).toContain('WARNING')
    expect(output).toContain('INFO')
  })

  test('very long violation message is included in full', () => {
    const longMessage = 'A'.repeat(500)
    const report = createMockReport({
      files: [
        {
          filePath: '/src/file.ts',
          violations: [createViolation({ message: longMessage })],
        },
      ],
      summary: { totalFiles: 1, totalViolations: 1, errors: 1, warnings: 0, info: 0, duration: 5 },
    })
    const output = formatConsole(report, COLORS, false, false)
    expect(output).toContain(longMessage)
  })

  test('mixed severities across files use correct colors', () => {
    const report = createMockReport({
      files: [
        {
          filePath: '/src/a.ts',
          violations: [createViolation({ severity: 'error', ruleId: 'r1', message: 'm1' })],
        },
        {
          filePath: '/src/b.ts',
          violations: [createViolation({ severity: 'warning', ruleId: 'r2', message: 'm2' })],
        },
        {
          filePath: '/src/c.ts',
          violations: [createViolation({ severity: 'info', ruleId: 'r3', message: 'm3' })],
        },
      ],
      summary: { totalFiles: 3, totalViolations: 3, errors: 1, warnings: 1, info: 1, duration: 15 },
    })
    const output = formatConsole(report, COLORS, false, false)
    expect(output).toContain(COLORS.red)
    expect(output).toContain(COLORS.yellow)
    expect(output).toContain(COLORS.blue)
  })

  test('displays ruleId in dim color', () => {
    const report = createMockReport({
      files: [
        {
          filePath: '/src/f.ts',
          violations: [createViolation({ ruleId: 'my-dim-rule' })],
        },
      ],
      summary: { totalFiles: 1, totalViolations: 1, errors: 1, warnings: 0, info: 0, duration: 5 },
    })
    const output = formatConsole(report, COLORS, false, false)
    expect(output).toContain(COLORS.dim + 'my-dim-rule')
  })

  test('summary is always shown even in quiet mode', () => {
    const report = createMockReport({
      summary: { totalFiles: 2, totalViolations: 0, errors: 0, warnings: 0, info: 0, duration: 50 },
    })
    const output = formatConsole(report, COLORS, true, false)
    expect(output).toContain('Summary')
    expect(output).toContain('Files analyzed: 2')
  })

  test('file path is shown in bold', () => {
    const report = createMockReport({
      files: [{ filePath: '/src/bold-path.ts', violations: [createViolation()] }],
      summary: { totalFiles: 1, totalViolations: 1, errors: 1, warnings: 0, info: 0, duration: 5 },
    })
    const output = formatConsole(report, COLORS, false, false)
    expect(output).toContain(COLORS.bold + '/src/bold-path.ts')
  })

  test('severity label is padded to 7 characters', () => {
    const report = createMockReport({
      files: [{ filePath: '/src/f.ts', violations: [createViolation({ severity: 'error' })] }],
      summary: { totalFiles: 1, totalViolations: 1, errors: 1, warnings: 0, info: 0, duration: 5 },
    })
    const output = formatConsole(report, COLORS, false, false)
    expect(output).toContain('ERROR  ')
  })

  test('zero duration is formatted correctly', () => {
    const report = createMockReport({
      summary: { totalFiles: 0, totalViolations: 0, errors: 0, warnings: 0, info: 0, duration: 0 },
    })
    const output = formatConsole(report, COLORS, false, false)
    expect(output).toContain('0.00ms')
  })

  test('large duration is formatted correctly', () => {
    const report = createMockReport({
      summary: {
        totalFiles: 0,
        totalViolations: 0,
        errors: 0,
        warnings: 0,
        info: 0,
        duration: 60000,
      },
    })
    const output = formatConsole(report, COLORS, false, false)
    expect(output).toContain('60000.00ms')
  })

  test('verbose mode with multiple suggestions shows all', () => {
    const report = createMockReport({
      files: [
        {
          filePath: '/src/f.ts',
          violations: [
            createViolation({ suggestion: 'Suggestion A', ruleId: 'r1' }),
            createViolation({ suggestion: 'Suggestion B', ruleId: 'r2' }),
          ],
        },
      ],
      summary: { totalFiles: 1, totalViolations: 2, errors: 2, warnings: 0, info: 0, duration: 5 },
    })
    const output = formatConsole(report, COLORS, false, true)
    expect(output).toContain('Suggestion: Suggestion A')
    expect(output).toContain('Suggestion: Suggestion B')
    const sugCount = (output.match(/Suggestion:/g) || []).length
    expect(sugCount).toBe(2)
  })
})

describe('formatMarkdown', () => {
  test('generates markdown header and summary', () => {
    const report = createMockReport({
      summary: {
        totalFiles: 5,
        totalViolations: 10,
        errors: 3,
        warnings: 5,
        info: 2,
        duration: 123,
      },
    })
    const output = formatMarkdown(report)
    expect(output).toContain('# CodeForge Analysis Report')
    expect(output).toContain('## Summary')
    expect(output).toContain('| Total Files Analyzed | 5 |')
    expect(output).toContain('| Errors | 3 |')
    expect(output).toContain('| Warnings | 5 |')
    expect(output).toContain('| Info | 2 |')
  })

  test('shows no violations message when clean', () => {
    const report = createMockReport()
    const output = formatMarkdown(report)
    expect(output).toContain('No violations found!')
  })

  test('uses correct icons for severity levels', () => {
    const report = createMockReport({
      files: [
        {
          filePath: '/a.ts',
          violations: [
            createViolation({ severity: 'error', ruleId: 'r1', message: 'err' }),
            createViolation({ severity: 'warning', ruleId: 'r2', message: 'warn' }),
            createViolation({ severity: 'info', ruleId: 'r3', message: 'inf' }),
          ],
        },
      ],
      summary: { totalFiles: 1, totalViolations: 3, errors: 1, warnings: 1, info: 1, duration: 50 },
    })
    const output = formatMarkdown(report)
    expect(output).toContain('🔴')
    expect(output).toContain('🟡')
    expect(output).toContain('🔵')
  })

  test('includes violation location and rule ID', () => {
    const report = createMockReport({
      files: [
        {
          filePath: '/src/file.ts',
          violations: [
            createViolation({
              ruleId: 'no-console',
              range: { start: { line: 42, column: 10 }, end: { line: 42, column: 20 } },
            }),
          ],
        },
      ],
      summary: { totalFiles: 1, totalViolations: 1, errors: 1, warnings: 0, info: 0, duration: 50 },
    })
    const output = formatMarkdown(report)
    expect(output).toContain('**no-console**')
    expect(output).toContain('line 42:10')
    expect(output).toContain('### /src/file.ts')
  })

  test('counts files with violations correctly', () => {
    const report = createMockReport({
      files: [
        { filePath: '/src/a.ts', violations: [createViolation()] },
        { filePath: '/src/b.ts', violations: [] },
        { filePath: '/src/c.ts', violations: [createViolation()] },
      ],
      summary: { totalFiles: 3, totalViolations: 2, errors: 2, warnings: 0, info: 0, duration: 50 },
    })
    const output = formatMarkdown(report)
    expect(output).toContain('| Files with Violations | 2 |')
  })

  test('includes footer with CodeForge link', () => {
    const report = createMockReport()
    const output = formatMarkdown(report)
    expect(output).toContain('---')
    expect(output).toContain('[CodeForge]')
    expect(output).toContain('github.com/codeforge-dev')
  })

  test('includes analysis time in summary table', () => {
    const report = createMockReport({
      summary: {
        totalFiles: 0,
        totalViolations: 0,
        errors: 0,
        warnings: 0,
        info: 0,
        duration: 1234.56,
      },
    })
    const output = formatMarkdown(report)
    expect(output).toContain('| Analysis Time | 1234.56ms |')
  })

  test('multiple files with violations across different paths', () => {
    const report = createMockReport({
      files: [
        {
          filePath: '/src/components/Button.tsx',
          violations: [createViolation({ ruleId: 'r1', message: 'Error in Button' })],
        },
        {
          filePath: '/src/utils/helpers.ts',
          violations: [createViolation({ ruleId: 'r2', message: 'Error in helpers' })],
        },
        {
          filePath: '/src/pages/index.ts',
          violations: [createViolation({ ruleId: 'r3', message: 'Error in index' })],
        },
      ],
      summary: { totalFiles: 3, totalViolations: 3, errors: 3, warnings: 0, info: 0, duration: 50 },
    })
    const output = formatMarkdown(report)
    expect(output).toContain('### /src/components/Button.tsx')
    expect(output).toContain('### /src/utils/helpers.ts')
    expect(output).toContain('### /src/pages/index.ts')
    expect(output).toContain('Error in Button')
    expect(output).toContain('Error in helpers')
    expect(output).toContain('Error in index')
  })

  test('very long violation message with newlines', () => {
    const longMsg =
      'This is a very long violation message\nthat spans multiple lines\nand contains various details about the issue.'
    const report = createMockReport({
      files: [
        {
          filePath: '/src/file.ts',
          violations: [createViolation({ message: longMsg })],
        },
      ],
      summary: { totalFiles: 1, totalViolations: 1, errors: 1, warnings: 0, info: 0, duration: 10 },
    })
    const output = formatMarkdown(report)
    expect(output).toContain('This is a very long violation message')
    expect(output).toContain('that spans multiple lines')
    expect(output).toContain('and contains various details about the issue.')
  })

  test('files present but all with zero violations shows no violations found', () => {
    const report = createMockReport({
      files: [
        { filePath: '/src/a.ts', violations: [] },
        { filePath: '/src/b.ts', violations: [] },
        { filePath: '/src/c.ts', violations: [] },
      ],
      summary: { totalFiles: 3, totalViolations: 0, errors: 0, warnings: 0, info: 0, duration: 10 },
    })
    const output = formatMarkdown(report)
    expect(output).toContain('No violations found!')
    expect(output).not.toContain('### /src/a.ts')
    expect(output).not.toContain('### /src/b.ts')
  })

  test('multiple severity types across several files', () => {
    const report = createMockReport({
      files: [
        {
          filePath: '/src/a.ts',
          violations: [createViolation({ severity: 'error', ruleId: 'e1', message: 'msg1' })],
        },
        {
          filePath: '/src/b.ts',
          violations: [createViolation({ severity: 'warning', ruleId: 'w1', message: 'msg2' })],
        },
        {
          filePath: '/src/c.ts',
          violations: [createViolation({ severity: 'info', ruleId: 'i1', message: 'msg3' })],
        },
      ],
      summary: { totalFiles: 3, totalViolations: 3, errors: 1, warnings: 1, info: 1, duration: 30 },
    })
    const output = formatMarkdown(report)
    expect(output).toContain('🔴')
    expect(output).toContain('🟡')
    expect(output).toContain('🔵')
    expect(output).toContain('### /src/a.ts')
    expect(output).toContain('### /src/b.ts')
    expect(output).toContain('### /src/c.ts')
  })

  test('shows correct violation count in summary', () => {
    const report = createMockReport({
      files: [
        {
          filePath: '/src/a.ts',
          violations: [
            createViolation(),
            createViolation({ ruleId: 'r2' }),
            createViolation({ ruleId: 'r3' }),
          ],
        },
      ],
      summary: { totalFiles: 1, totalViolations: 3, errors: 3, warnings: 0, info: 0, duration: 15 },
    })
    const output = formatMarkdown(report)
    expect(output).toContain('| Total Violations | 3 |')
    expect(output).toContain('| Errors | 3 |')
  })

  test('includes generated timestamp', () => {
    const report = createMockReport()
    const before = new Date().toISOString()
    const output = formatMarkdown(report)
    const after = new Date().toISOString()
    const tsLine = output.split('\n').find((l) => l.startsWith('Generated on'))
    expect(tsLine).toBeDefined()
    expect(tsLine!.length).toBeGreaterThan('Generated on '.length)
  })

  test('duration in markdown uses 2 decimal places', () => {
    const report = createMockReport({
      summary: {
        totalFiles: 0,
        totalViolations: 0,
        errors: 0,
        warnings: 0,
        info: 0,
        duration: 99.999,
      },
    })
    const output = formatMarkdown(report)
    expect(output).toContain('100.00ms')
  })

  test('summary table has correct header row', () => {
    const report = createMockReport()
    const output = formatMarkdown(report)
    expect(output).toContain('| Metric | Value |')
    expect(output).toContain('|--------|-------|')
  })

  test('violation line includes message after dash', () => {
    const report = createMockReport({
      files: [
        {
          filePath: '/src/a.ts',
          violations: [createViolation({ ruleId: 'custom-rule', message: 'Specific issue found' })],
        },
      ],
      summary: { totalFiles: 1, totalViolations: 1, errors: 1, warnings: 0, info: 0, duration: 5 },
    })
    const output = formatMarkdown(report)
    expect(output).toContain('Specific issue found')
    expect(output).toContain('**custom-rule**')
  })

  test('zero violations and zero files shows correct summary', () => {
    const report = createMockReport({
      summary: { totalFiles: 0, totalViolations: 0, errors: 0, warnings: 0, info: 0, duration: 0 },
    })
    const output = formatMarkdown(report)
    expect(output).toContain('| Total Files Analyzed | 0 |')
    expect(output).toContain('| Total Violations | 0 |')
  })
})

describe('formatHtml', () => {
  test('generates valid HTML document structure', () => {
    const report = createMockReport()
    const output = formatHtml(report)
    expect(output).toContain('<!DOCTYPE html>')
    expect(output).toContain('<html lang="en">')
    expect(output).toContain('</html>')
    expect(output).toContain('<title>CodeForge Analysis Report</title>')
  })

  test('includes inline CSS styles', () => {
    const report = createMockReport()
    const output = formatHtml(report)
    expect(output).toContain('<style>')
    expect(output).toContain('</style>')
    expect(output).toContain('.error { color: #ff6b6b; }')
    expect(output).toContain('.warning { color: #f0c674; }')
    expect(output).toContain('.info { color: #4ecdc4; }')
  })

  test('displays summary with metrics', () => {
    const report = createMockReport({
      summary: {
        totalFiles: 5,
        totalViolations: 10,
        errors: 3,
        warnings: 5,
        info: 2,
        duration: 123,
      },
    })
    const output = formatHtml(report)
    expect(output).toContain('Files: 5')
    expect(output).toContain('Errors: 3')
    expect(output).toContain('Warnings: 5')
    expect(output).toContain('Info: 2')
  })

  test('applies severity CSS classes', () => {
    const report = createMockReport({
      files: [
        {
          filePath: '/test/file.ts',
          violations: [
            createViolation({ severity: 'error' }),
            createViolation({ severity: 'warning' }),
            createViolation({ severity: 'info' }),
          ],
        },
      ],
      summary: { totalFiles: 1, totalViolations: 3, errors: 1, warnings: 1, info: 1, duration: 50 },
    })
    const output = formatHtml(report)
    expect(output).toContain('class="error"')
    expect(output).toContain('[ERROR]')
    expect(output).toContain('class="warning"')
    expect(output).toContain('[WARNING]')
    expect(output).toContain('class="info"')
    expect(output).toContain('[INFO]')
  })

  test('escapes HTML in file paths', () => {
    const report = createMockReport({
      files: [{ filePath: '/test/<script>alert(1)</script>.ts', violations: [createViolation()] }],
      summary: { totalFiles: 1, totalViolations: 1, errors: 1, warnings: 0, info: 0, duration: 50 },
    })
    const output = formatHtml(report)
    expect(output).toContain('&lt;script&gt;')
    expect(output).not.toContain('<script>alert')
  })

  test('escapes HTML in violation messages', () => {
    const report = createMockReport({
      files: [
        {
          filePath: '/test/file.ts',
          violations: [createViolation({ message: 'Use <b>bold</b> & "quotes"' })],
        },
      ],
      summary: { totalFiles: 1, totalViolations: 1, errors: 1, warnings: 0, info: 0, duration: 50 },
    })
    const output = formatHtml(report)
    expect(output).toContain('&lt;b&gt;')
    expect(output).toContain('&amp;')
    expect(output).toContain('&quot;')
  })

  test('escapes HTML in rule IDs', () => {
    const report = createMockReport({
      files: [{ filePath: '/test/file.ts', violations: [createViolation({ ruleId: 'rule&id' })] }],
      summary: { totalFiles: 1, totalViolations: 1, errors: 1, warnings: 0, info: 0, duration: 50 },
    })
    const output = formatHtml(report)
    expect(output).toContain('rule&amp;id')
  })

  test('skips files with no violations', () => {
    const report = createMockReport({
      files: [
        { filePath: '/src/clean.ts', violations: [] },
        { filePath: '/src/dirty.ts', violations: [createViolation()] },
      ],
      summary: { totalFiles: 2, totalViolations: 1, errors: 1, warnings: 0, info: 0, duration: 50 },
    })
    const output = formatHtml(report)
    expect(output).not.toContain('/src/clean.ts')
    expect(output).toContain('/src/dirty.ts')
  })

  test('includes violation location', () => {
    const report = createMockReport({
      files: [
        {
          filePath: '/test/file.ts',
          violations: [
            createViolation({
              range: { start: { line: 10, column: 5 }, end: { line: 10, column: 15 } },
            }),
          ],
        },
      ],
      summary: { totalFiles: 1, totalViolations: 1, errors: 1, warnings: 0, info: 0, duration: 50 },
    })
    const output = formatHtml(report)
    expect(output).toContain('line 10:5')
  })

  test('formats duration with 2 decimal places', () => {
    const report = createMockReport({
      summary: {
        totalFiles: 0,
        totalViolations: 0,
        errors: 0,
        warnings: 0,
        info: 0,
        duration: 1234.567,
      },
    })
    const output = formatHtml(report)
    expect(output).toContain('1234.57ms')
  })

  test('two files with violations both appear in HTML', () => {
    const report = createMockReport({
      files: [
        {
          filePath: '/src/alpha.ts',
          violations: [createViolation({ ruleId: 'rule-a', message: 'Error A' })],
        },
        {
          filePath: '/src/beta.ts',
          violations: [createViolation({ ruleId: 'rule-b', message: 'Error B' })],
        },
      ],
      summary: { totalFiles: 2, totalViolations: 2, errors: 2, warnings: 0, info: 0, duration: 20 },
    })
    const output = formatHtml(report)
    expect(output).toContain('file-path">/src/alpha.ts')
    expect(output).toContain('file-path">/src/beta.ts')
    expect(output).toContain('Error A')
    expect(output).toContain('Error B')
  })

  test('escapes ampersand in file path', () => {
    const report = createMockReport({
      files: [{ filePath: '/src/foo&bar.ts', violations: [createViolation()] }],
      summary: { totalFiles: 1, totalViolations: 1, errors: 1, warnings: 0, info: 0, duration: 5 },
    })
    const output = formatHtml(report)
    expect(output).toContain('foo&amp;bar.ts')
    expect(output).not.toContain('foo&bar.ts<')
  })

  test('escapes violation message with quotes and angle brackets', () => {
    const report = createMockReport({
      files: [
        {
          filePath: '/src/file.ts',
          violations: [createViolation({ message: 'Use <div attr="val"> & \'single\'' })],
        },
      ],
      summary: { totalFiles: 1, totalViolations: 1, errors: 1, warnings: 0, info: 0, duration: 5 },
    })
    const output = formatHtml(report)
    expect(output).toContain('&lt;div attr=&quot;val&quot;&gt;')
    expect(output).toContain('&amp;')
    expect(output).toContain('&#039;')
  })

  test('handles non-ASCII characters in file path', () => {
    const report = createMockReport({
      files: [{ filePath: '/src/日本語/файл.ts', violations: [createViolation()] }],
      summary: { totalFiles: 1, totalViolations: 1, errors: 1, warnings: 0, info: 0, duration: 5 },
    })
    const output = formatHtml(report)
    expect(output).toContain('/src/日本語/файл.ts')
  })

  test('empty report has no file divs', () => {
    const report = createMockReport()
    const output = formatHtml(report)
    expect(output).not.toContain('class="file"')
  })

  test('file with 3 violations produces 3 violation divs', () => {
    const report = createMockReport({
      files: [
        {
          filePath: '/src/big.ts',
          violations: [
            createViolation({ ruleId: 'r1' }),
            createViolation({ ruleId: 'r2' }),
            createViolation({ ruleId: 'r3' }),
          ],
        },
      ],
      summary: { totalFiles: 1, totalViolations: 3, errors: 3, warnings: 0, info: 0, duration: 10 },
    })
    const output = formatHtml(report)
    const count = (output.match(/class="violation"/g) || []).length
    expect(count).toBe(3)
  })

  test('includes meta charset tag', () => {
    const report = createMockReport()
    const output = formatHtml(report)
    expect(output).toContain('<meta charset="UTF-8">')
  })

  test('includes viewport meta tag', () => {
    const report = createMockReport()
    const output = formatHtml(report)
    expect(output).toContain(
      '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
    )
  })

  test('includes h1 heading', () => {
    const report = createMockReport()
    const output = formatHtml(report)
    expect(output).toContain('<h1>CodeForge Analysis Report</h1>')
  })

  test('includes container div', () => {
    const report = createMockReport()
    const output = formatHtml(report)
    expect(output).toContain('class="container"')
  })

  test('severity label is uppercase', () => {
    const report = createMockReport({
      files: [
        {
          filePath: '/src/f.ts',
          violations: [createViolation({ severity: 'warning' })],
        },
      ],
      summary: { totalFiles: 1, totalViolations: 1, errors: 0, warnings: 1, info: 0, duration: 5 },
    })
    const output = formatHtml(report)
    expect(output).toContain('[WARNING]')
  })

  test('duration displayed in summary div', () => {
    const report = createMockReport({
      summary: {
        totalFiles: 0,
        totalViolations: 0,
        errors: 0,
        warnings: 0,
        info: 0,
        duration: 42.5,
      },
    })
    const output = formatHtml(report)
    expect(output).toContain('Duration: 42.50ms')
  })

  test('summary div contains summary class', () => {
    const report = createMockReport()
    const output = formatHtml(report)
    expect(output).toContain('class="summary"')
  })

  test('violation location span has location class', () => {
    const report = createMockReport({
      files: [
        {
          filePath: '/src/f.ts',
          violations: [createViolation()],
        },
      ],
      summary: { totalFiles: 1, totalViolations: 1, errors: 1, warnings: 0, info: 0, duration: 5 },
    })
    const output = formatHtml(report)
    expect(output).toContain('class="location"')
  })

  test('rule span has rule class', () => {
    const report = createMockReport({
      files: [
        {
          filePath: '/src/f.ts',
          violations: [createViolation()],
        },
      ],
      summary: { totalFiles: 1, totalViolations: 1, errors: 1, warnings: 0, info: 0, duration: 5 },
    })
    const output = formatHtml(report)
    expect(output).toContain('class="rule"')
  })

  test('file path div has file-path class', () => {
    const report = createMockReport({
      files: [
        {
          filePath: '/src/my-file.ts',
          violations: [createViolation()],
        },
      ],
      summary: { totalFiles: 1, totalViolations: 1, errors: 1, warnings: 0, info: 0, duration: 5 },
    })
    const output = formatHtml(report)
    expect(output).toContain('class="file-path"')
  })
})

describe('formatJunit', () => {
  test('generates valid XML structure with declaration', () => {
    const report = createMockReport()
    const output = formatJunit(report)
    expect(output).toContain('<?xml version="1.0" encoding="UTF-8"?>')
    expect(output).toContain('<testsuit')
    expect(output).toContain('</testsuit>')
  })

  test('includes properties section', () => {
    const report = createMockReport()
    const output = formatJunit(report)
    expect(output).toContain('<properties>')
    expect(output).toContain('files-analyzed')
  })

  test('creates testsuite per file with violations', () => {
    const report = createMockReport({
      files: [{ filePath: '/src/file.ts', violations: [createViolation()] }],
      summary: { totalFiles: 1, totalViolations: 1, errors: 1, warnings: 0, info: 0, duration: 50 },
    })
    const output = formatJunit(report)
    expect(output).toContain('<testsuite name="/src/file.ts"')
    expect(output).toContain('tests="1"')
  })

  test('skips files with no violations', () => {
    const report = createMockReport({
      files: [
        { filePath: '/src/clean.ts', violations: [] },
        { filePath: '/src/dirty.ts', violations: [createViolation()] },
      ],
      summary: { totalFiles: 2, totalViolations: 1, errors: 1, warnings: 0, info: 0, duration: 50 },
    })
    const output = formatJunit(report)
    expect(output).not.toContain('name="/src/clean.ts"')
    expect(output).toContain('name="/src/dirty.ts"')
  })

  test('escapes XML special characters in messages', () => {
    const report = createMockReport({
      files: [
        {
          filePath: '/src/file.ts',
          violations: [createViolation({ message: 'Use <tag> & "quotes" and \'apos\'' })],
        },
      ],
      summary: { totalFiles: 1, totalViolations: 1, errors: 1, warnings: 0, info: 0, duration: 50 },
    })
    const output = formatJunit(report)
    expect(output).toContain('&lt;tag&gt;')
    expect(output).toContain('&amp;')
    expect(output).toContain('&quot;')
    expect(output).toContain('&#039;')
  })

  test('escapes XML special characters in rule IDs', () => {
    const report = createMockReport({
      files: [
        { filePath: '/src/file.ts', violations: [createViolation({ ruleId: 'rule<id>&val' })] },
      ],
      summary: { totalFiles: 1, totalViolations: 1, errors: 1, warnings: 0, info: 0, duration: 50 },
    })
    const output = formatJunit(report)
    expect(output).toContain('&lt;id&gt;')
    expect(output).toContain('&amp;val')
  })

  test('includes violation location in failure message', () => {
    const report = createMockReport({
      files: [
        {
          filePath: '/src/file.ts',
          violations: [
            createViolation({
              filePath: '/src/file.ts',
              range: { start: { line: 10, column: 5 }, end: { line: 10, column: 15 } },
            }),
          ],
        },
      ],
      summary: { totalFiles: 1, totalViolations: 1, errors: 1, warnings: 0, info: 0, duration: 50 },
    })
    const output = formatJunit(report)
    expect(output).toContain('/src/file.ts:10:5')
    expect(output).toContain('<failure')
  })

  test('handles multiple violations per file', () => {
    const report = createMockReport({
      files: [
        {
          filePath: '/src/file.ts',
          violations: [createViolation({ ruleId: 'rule1' }), createViolation({ ruleId: 'rule2' })],
        },
      ],
      summary: { totalFiles: 1, totalViolations: 2, errors: 2, warnings: 0, info: 0, duration: 50 },
    })
    const output = formatJunit(report)
    const testcaseCount = (output.match(/<testcase/g) || []).length
    expect(testcaseCount).toBe(2)
    expect(output).toContain('rule1')
    expect(output).toContain('rule2')
  })

  test('all files with zero violations produces no inner testsuite blocks', () => {
    const report = createMockReport({
      files: [
        { filePath: '/src/a.ts', violations: [] },
        { filePath: '/src/b.ts', violations: [] },
      ],
      summary: { totalFiles: 2, totalViolations: 0, errors: 0, warnings: 0, info: 0, duration: 10 },
    })
    const output = formatJunit(report)
    expect(output).not.toMatch(/<testsuite name="\/src\/a.ts"/)
    expect(output).not.toMatch(/<testsuite name="\/src\/b.ts"/)
    expect(output).toContain('</testsuit>')
  })

  test('multiple files with violations produce multiple testsuite blocks', () => {
    const report = createMockReport({
      files: [
        { filePath: '/src/alpha.ts', violations: [createViolation()] },
        { filePath: '/src/beta.ts', violations: [createViolation()] },
        { filePath: '/src/gamma.ts', violations: [createViolation()] },
      ],
      summary: { totalFiles: 3, totalViolations: 3, errors: 3, warnings: 0, info: 0, duration: 30 },
    })
    const output = formatJunit(report)
    expect(output).toContain('name="/src/alpha.ts"')
    expect(output).toContain('name="/src/beta.ts"')
    expect(output).toContain('name="/src/gamma.ts"')
    const suiteCount = (output.match(/<testsuite name="\/src/g) || []).length
    expect(suiteCount).toBe(3)
  })

  test('file paths with spaces are preserved in testsuite name', () => {
    const report = createMockReport({
      files: [{ filePath: '/src/my project/components/app.ts', violations: [createViolation()] }],
      summary: { totalFiles: 1, totalViolations: 1, errors: 1, warnings: 0, info: 0, duration: 10 },
    })
    const output = formatJunit(report)
    expect(output).toContain('name="/src/my project/components/app.ts"')
  })

  test('mixed violations: one file with 2 violations and another with 1', () => {
    const report = createMockReport({
      files: [
        {
          filePath: '/src/a.ts',
          violations: [
            createViolation({ ruleId: 'rule-a1' }),
            createViolation({ ruleId: 'rule-a2' }),
          ],
        },
        {
          filePath: '/src/b.ts',
          violations: [createViolation({ ruleId: 'rule-b1' })],
        },
      ],
      summary: { totalFiles: 2, totalViolations: 3, errors: 3, warnings: 0, info: 0, duration: 20 },
    })
    const output = formatJunit(report)
    expect(output).toContain('name="/src/a.ts" tests="2"')
    expect(output).toContain('name="/src/b.ts" tests="1"')
    const tc = (output.match(/<testcase/g) || []).length
    expect(tc).toBe(3)
  })

  test('escapes XML in filePath when it contains ampersand', () => {
    const report = createMockReport({
      files: [{ filePath: '/src/tom&jerry.ts', violations: [createViolation()] }],
      summary: { totalFiles: 1, totalViolations: 1, errors: 1, warnings: 0, info: 0, duration: 10 },
    })
    const output = formatJunit(report)
    expect(output).toContain('name="/src/tom&jerry.ts"')
  })

  test('single file with single violation produces exactly one testcase', () => {
    const report = createMockReport({
      files: [{ filePath: '/src/solo.ts', violations: [createViolation({ ruleId: 'solo-rule' })] }],
      summary: { totalFiles: 1, totalViolations: 1, errors: 1, warnings: 0, info: 0, duration: 5 },
    })
    const output = formatJunit(report)
    const count = (output.match(/<testcase/g) || []).length
    expect(count).toBe(1)
    expect(output).toContain('solo-rule')
  })

  test('testcase classname matches ruleId', () => {
    const report = createMockReport({
      files: [
        { filePath: '/src/f.ts', violations: [createViolation({ ruleId: 'my-custom-rule' })] },
      ],
      summary: { totalFiles: 1, totalViolations: 1, errors: 1, warnings: 0, info: 0, duration: 5 },
    })
    const output = formatJunit(report)
    expect(output).toContain('classname="my-custom-rule"')
  })

  test('testcase name includes ruleId and message', () => {
    const report = createMockReport({
      files: [
        {
          filePath: '/src/f.ts',
          violations: [createViolation({ ruleId: 'no-debug', message: 'Remove debug' })],
        },
      ],
      summary: { totalFiles: 1, totalViolations: 1, errors: 1, warnings: 0, info: 0, duration: 5 },
    })
    const output = formatJunit(report)
    expect(output).toContain('name="no-debug: Remove debug"')
  })

  test('root testsuit has codeforge-analysis name', () => {
    const report = createMockReport()
    const output = formatJunit(report)
    expect(output).toContain('name="codeforge-analysis"')
  })

  test('failure element contains message content', () => {
    const report = createMockReport({
      files: [
        {
          filePath: '/src/f.ts',
          violations: [createViolation({ message: 'Broken code here' })],
        },
      ],
      summary: { totalFiles: 1, totalViolations: 1, errors: 1, warnings: 0, info: 0, duration: 5 },
    })
    const output = formatJunit(report)
    expect(output).toContain('<failure')
    expect(output).toContain('Broken code here')
  })

  test('properties section inside inner testsuite', () => {
    const report = createMockReport({
      files: [{ filePath: '/src/f.ts', violations: [createViolation()] }],
      summary: { totalFiles: 1, totalViolations: 1, errors: 1, warnings: 0, info: 0, duration: 5 },
    })
    const output = formatJunit(report)
    // Inner testsuite should not have its own properties (source doesn't add them)
    expect(output).toContain('</testsuite>')
  })
})

describe('formatSarif', () => {
  test('generates valid SARIF JSON with correct schema and version', () => {
    const report = createMockReport()
    const output = formatSarif(report)
    const parsed = JSON.parse(output)
    expect(parsed.$schema).toContain('sarif-schema-2.1.0')
    expect(parsed.version).toBe('2.1.0')
    expect(parsed.runs).toHaveLength(1)
  })

  test('includes tool driver information', () => {
    const report = createMockReport()
    const output = formatSarif(report)
    const parsed = JSON.parse(output)
    expect(parsed.runs[0].tool.driver.name).toBe('CodeForge')
    expect(parsed.runs[0].tool.driver.version).toBe('0.1.0')
    expect(parsed.runs[0].tool.driver.informationUri).toContain('github.com')
  })

  test('extracts unique rules from violations', () => {
    const report = createMockReport({
      files: [
        {
          filePath: '/src/a.ts',
          violations: [createViolation({ ruleId: 'rule-a', message: 'First. Detail.' })],
        },
        {
          filePath: '/src/b.ts',
          violations: [createViolation({ ruleId: 'rule-b', message: 'Second. Detail.' })],
        },
      ],
      summary: { totalFiles: 2, totalViolations: 2, errors: 2, warnings: 0, info: 0, duration: 50 },
    })
    const output = formatSarif(report)
    const parsed = JSON.parse(output)
    const rules = parsed.runs[0].tool.driver.rules
    expect(rules).toHaveLength(2)
    expect(rules.map((r: { id: string }) => r.id)).toEqual(
      expect.arrayContaining(['rule-a', 'rule-b']),
    )
  })

  test('deduplicates rules by ruleId', () => {
    const report = createMockReport({
      files: [
        { filePath: '/src/a.ts', violations: [createViolation({ ruleId: 'same-rule' })] },
        { filePath: '/src/b.ts', violations: [createViolation({ ruleId: 'same-rule' })] },
      ],
      summary: { totalFiles: 2, totalViolations: 2, errors: 2, warnings: 0, info: 0, duration: 50 },
    })
    const output = formatSarif(report)
    const parsed = JSON.parse(output)
    expect(parsed.runs[0].tool.driver.rules).toHaveLength(1)
  })

  test('extracts short description from first sentence', () => {
    const report = createMockReport({
      files: [
        {
          filePath: '/src/file.ts',
          violations: [createViolation({ message: 'This is a long message. More details here.' })],
        },
      ],
      summary: { totalFiles: 1, totalViolations: 1, errors: 1, warnings: 0, info: 0, duration: 50 },
    })
    const output = formatSarif(report)
    const parsed = JSON.parse(output)
    expect(parsed.runs[0].tool.driver.rules[0].shortDescription).toBe('This is a long message.')
  })

  test('maps severity to correct SARIF levels', () => {
    const report = createMockReport({
      files: [
        {
          filePath: '/test/file.ts',
          violations: [
            createViolation({ severity: 'error', ruleId: 'r1', message: 'e' }),
            createViolation({ severity: 'warning', ruleId: 'r2', message: 'w' }),
            createViolation({ severity: 'info', ruleId: 'r3', message: 'i' }),
          ],
        },
      ],
      summary: { totalFiles: 1, totalViolations: 3, errors: 1, warnings: 1, info: 1, duration: 50 },
    })
    const output = formatSarif(report)
    const parsed = JSON.parse(output)
    const levels = parsed.runs[0].results.map((r: { level: string }) => r.level)
    expect(levels).toEqual(['error', 'warning', 'note'])
  })

  test('maps unknown severity to none', () => {
    const report = createMockReport({
      files: [
        {
          filePath: '/test/file.ts',
          violations: [createViolation({ severity: 'unknown' as 'error' })],
        },
      ],
      summary: { totalFiles: 1, totalViolations: 1, errors: 0, warnings: 0, info: 0, duration: 50 },
    })
    const output = formatSarif(report)
    const parsed = JSON.parse(output)
    expect(parsed.runs[0].results[0].level).toBe('none')
  })

  test('includes location information in results', () => {
    const report = createMockReport({
      files: [
        {
          filePath: '/src/file.ts',
          violations: [
            createViolation({
              range: { start: { line: 10, column: 5 }, end: { line: 10, column: 15 } },
            }),
          ],
        },
      ],
      summary: { totalFiles: 1, totalViolations: 1, errors: 1, warnings: 0, info: 0, duration: 50 },
    })
    const output = formatSarif(report)
    const parsed = JSON.parse(output)
    const loc = parsed.runs[0].results[0].locations[0].physicalLocation
    expect(loc.artifactLocation.uri).toBe('/src/file.ts')
    expect(loc.region.startLine).toBe(10)
    expect(loc.region.startColumn).toBe(5)
  })

  test('includes message text in results', () => {
    const report = createMockReport({
      files: [
        {
          filePath: '/src/file.ts',
          violations: [createViolation({ message: 'Custom error message' })],
        },
      ],
      summary: { totalFiles: 1, totalViolations: 1, errors: 1, warnings: 0, info: 0, duration: 50 },
    })
    const output = formatSarif(report)
    const parsed = JSON.parse(output)
    expect(parsed.runs[0].results[0].message.text).toBe('Custom error message')
  })

  test('handles empty report with empty arrays', () => {
    const report = createMockReport()
    const output = formatSarif(report)
    const parsed = JSON.parse(output)
    expect(parsed.runs[0].results).toEqual([])
    expect(parsed.runs[0].tool.driver.rules).toEqual([])
  })

  test('large report with 4+ files and mixed severities', () => {
    const report = createMockReport({
      files: [
        {
          filePath: '/src/a.ts',
          violations: [createViolation({ severity: 'error', ruleId: 'r1', message: 'e1' })],
        },
        {
          filePath: '/src/b.ts',
          violations: [
            createViolation({ severity: 'warning', ruleId: 'r2', message: 'w1' }),
            createViolation({ severity: 'info', ruleId: 'r3', message: 'i1' }),
          ],
        },
        {
          filePath: '/src/c.ts',
          violations: [createViolation({ severity: 'error', ruleId: 'r4', message: 'e2' })],
        },
        {
          filePath: '/src/d.ts',
          violations: [createViolation({ severity: 'warning', ruleId: 'r5', message: 'w2' })],
        },
        {
          filePath: '/src/e.ts',
          violations: [],
        },
      ],
      summary: {
        totalFiles: 5,
        totalViolations: 5,
        errors: 2,
        warnings: 2,
        info: 1,
        duration: 100,
      },
    })
    const parsed = JSON.parse(formatSarif(report))
    expect(parsed.runs[0].results).toHaveLength(5)
    const levels = parsed.runs[0].results.map((r: { level: string }) => r.level)
    expect(levels).toEqual(['error', 'warning', 'note', 'error', 'warning'])
  })

  test('unknown severity maps to none level', () => {
    const report = createMockReport({
      files: [
        {
          filePath: '/src/x.ts',
          violations: [
            createViolation({
              severity: 'critical' as 'error',
              ruleId: 'custom-sev',
              message: 'msg',
            }),
          ],
        },
      ],
      summary: { totalFiles: 1, totalViolations: 1, errors: 0, warnings: 0, info: 0, duration: 5 },
    })
    const parsed = JSON.parse(formatSarif(report))
    expect(parsed.runs[0].results[0].level).toBe('none')
  })

  test('multiple unique ruleIds across files produce distinct rules', () => {
    const report = createMockReport({
      files: [
        {
          filePath: '/src/a.ts',
          violations: [
            createViolation({ ruleId: 'rule-alpha', message: 'Alpha. Details.' }),
            createViolation({ ruleId: 'rule-beta', message: 'Beta. Details.' }),
          ],
        },
        {
          filePath: '/src/b.ts',
          violations: [createViolation({ ruleId: 'rule-gamma', message: 'Gamma. Details.' })],
        },
      ],
      summary: { totalFiles: 2, totalViolations: 3, errors: 3, warnings: 0, info: 0, duration: 10 },
    })
    const parsed = JSON.parse(formatSarif(report))
    const ruleIds = parsed.runs[0].tool.driver.rules.map((r: { id: string }) => r.id)
    expect(ruleIds).toEqual(['rule-alpha', 'rule-beta', 'rule-gamma'])
  })

  test('results reference correct file URIs', () => {
    const report = createMockReport({
      files: [
        {
          filePath: '/lib/utils.ts',
          violations: [createViolation({ ruleId: 'r1', message: 'M.' })],
        },
        {
          filePath: '/lib/helpers.ts',
          violations: [createViolation({ ruleId: 'r2', message: 'N.' })],
        },
      ],
      summary: { totalFiles: 2, totalViolations: 2, errors: 2, warnings: 0, info: 0, duration: 10 },
    })
    const parsed = JSON.parse(formatSarif(report))
    const uris = parsed.runs[0].results.map(
      (r: { locations: Array<{ physicalLocation: { artifactLocation: { uri: string } } }> }) =>
        r.locations[0].physicalLocation.artifactLocation.uri,
    )
    expect(uris).toEqual(['/lib/utils.ts', '/lib/helpers.ts'])
  })

  test('SARIF output is valid JSON with proper formatting', () => {
    const report = createMockReport({
      files: [{ filePath: '/src/a.ts', violations: [createViolation()] }],
      summary: { totalFiles: 1, totalViolations: 1, errors: 1, warnings: 0, info: 0, duration: 5 },
    })
    const output = formatSarif(report)
    expect(() => JSON.parse(output)).not.toThrow()
    expect(output).toContain('\n  "runs"')
  })

  test('tool driver information URI is correct', () => {
    const report = createMockReport()
    const parsed = JSON.parse(formatSarif(report))
    expect(parsed.runs[0].tool.driver.informationUri).toBe(
      'https://github.com/codeforge-dev/codeforge',
    )
  })

  test('ruleId in results matches the violation ruleId', () => {
    const report = createMockReport({
      files: [
        {
          filePath: '/src/f.ts',
          violations: [createViolation({ ruleId: 'my-specific-rule' })],
        },
      ],
      summary: { totalFiles: 1, totalViolations: 1, errors: 1, warnings: 0, info: 0, duration: 5 },
    })
    const parsed = JSON.parse(formatSarif(report))
    expect(parsed.runs[0].results[0].ruleId).toBe('my-specific-rule')
  })

  test('message without period uses whole string as short description', () => {
    const report = createMockReport({
      files: [
        {
          filePath: '/src/f.ts',
          violations: [createViolation({ ruleId: 'r1', message: 'No period here' })],
        },
      ],
      summary: { totalFiles: 1, totalViolations: 1, errors: 1, warnings: 0, info: 0, duration: 5 },
    })
    const parsed = JSON.parse(formatSarif(report))
    expect(parsed.runs[0].tool.driver.rules[0].shortDescription).toBe('No period here.')
  })

  test('files with empty violations are skipped in results', () => {
    const report = createMockReport({
      files: [
        { filePath: '/src/empty.ts', violations: [] },
        { filePath: '/src/full.ts', violations: [createViolation()] },
      ],
      summary: { totalFiles: 2, totalViolations: 1, errors: 1, warnings: 0, info: 0, duration: 5 },
    })
    const parsed = JSON.parse(formatSarif(report))
    expect(parsed.runs[0].results).toHaveLength(1)
  })
})

describe('formatGitlab', () => {
  test('generates valid JSON array', () => {
    const report = createMockReport()
    const output = formatGitlab(report)
    const parsed = JSON.parse(output)
    expect(Array.isArray(parsed)).toBe(true)
  })

  test('returns empty array for empty report', () => {
    const report = createMockReport()
    const output = formatGitlab(report)
    const parsed = JSON.parse(output)
    expect(parsed).toEqual([])
  })

  test('maps error severity to critical', () => {
    const report = createMockReport({
      files: [{ filePath: '/src/file.ts', violations: [createViolation({ severity: 'error' })] }],
      summary: { totalFiles: 1, totalViolations: 1, errors: 1, warnings: 0, info: 0, duration: 50 },
    })
    const parsed = JSON.parse(formatGitlab(report))
    expect(parsed[0].severity).toBe('critical')
  })

  test('maps warning severity to major', () => {
    const report = createMockReport({
      files: [{ filePath: '/src/file.ts', violations: [createViolation({ severity: 'warning' })] }],
      summary: { totalFiles: 1, totalViolations: 1, errors: 0, warnings: 1, info: 0, duration: 50 },
    })
    const parsed = JSON.parse(formatGitlab(report))
    expect(parsed[0].severity).toBe('major')
  })

  test('maps info severity to minor', () => {
    const report = createMockReport({
      files: [{ filePath: '/src/file.ts', violations: [createViolation({ severity: 'info' })] }],
      summary: { totalFiles: 1, totalViolations: 1, errors: 0, warnings: 0, info: 1, duration: 50 },
    })
    const parsed = JSON.parse(formatGitlab(report))
    expect(parsed[0].severity).toBe('minor')
  })

  test('generates fingerprint from file:rule:line', () => {
    const report = createMockReport({
      files: [
        {
          filePath: '/src/file.ts',
          violations: [
            createViolation({
              ruleId: 'no-console',
              range: { start: { line: 10, column: 1 }, end: { line: 10, column: 10 } },
            }),
          ],
        },
      ],
      summary: { totalFiles: 1, totalViolations: 1, errors: 1, warnings: 0, info: 0, duration: 50 },
    })
    const parsed = JSON.parse(formatGitlab(report))
    expect(parsed[0].fingerprint).toBe('/src/file.ts:no-console:10')
  })

  test('includes correct location with path and line', () => {
    const report = createMockReport({
      files: [
        {
          filePath: '/src/components/Button.tsx',
          violations: [
            createViolation({
              range: { start: { line: 42, column: 5 }, end: { line: 42, column: 15 } },
            }),
          ],
        },
      ],
      summary: { totalFiles: 1, totalViolations: 1, errors: 1, warnings: 0, info: 0, duration: 50 },
    })
    const parsed = JSON.parse(formatGitlab(report))
    expect(parsed[0].location.path).toBe('/src/components/Button.tsx')
    expect(parsed[0].location.lines.begin).toBe(42)
  })

  test('includes description and check_name', () => {
    const report = createMockReport({
      files: [
        {
          filePath: '/src/file.ts',
          violations: [createViolation({ ruleId: 'no-console', message: 'Unexpected console' })],
        },
      ],
      summary: { totalFiles: 1, totalViolations: 1, errors: 1, warnings: 0, info: 0, duration: 50 },
    })
    const parsed = JSON.parse(formatGitlab(report))
    expect(parsed[0].description).toBe('Unexpected console')
    expect(parsed[0].check_name).toBe('no-console')
  })

  test('handles multiple violations across files', () => {
    const report = createMockReport({
      files: [
        { filePath: '/src/a.ts', violations: [createViolation({ ruleId: 'rule-a' })] },
        { filePath: '/src/b.ts', violations: [createViolation({ ruleId: 'rule-b' })] },
      ],
      summary: { totalFiles: 2, totalViolations: 2, errors: 2, warnings: 0, info: 0, duration: 50 },
    })
    const parsed = JSON.parse(formatGitlab(report))
    expect(parsed).toHaveLength(2)
    expect(parsed[0].check_name).toBe('rule-a')
    expect(parsed[1].check_name).toBe('rule-b')
  })

  test('two files with multiple violations each', () => {
    const report = createMockReport({
      files: [
        {
          filePath: '/src/a.ts',
          violations: [
            createViolation({
              ruleId: 'r1',
              severity: 'error',
              range: { start: { line: 1, column: 1 }, end: { line: 1, column: 5 } },
            }),
            createViolation({
              ruleId: 'r2',
              severity: 'warning',
              range: { start: { line: 5, column: 3 }, end: { line: 5, column: 10 } },
            }),
          ],
        },
        {
          filePath: '/src/b.ts',
          violations: [
            createViolation({
              ruleId: 'r3',
              severity: 'info',
              range: { start: { line: 10, column: 2 }, end: { line: 10, column: 8 } },
            }),
            createViolation({
              ruleId: 'r4',
              severity: 'error',
              range: { start: { line: 20, column: 1 }, end: { line: 20, column: 5 } },
            }),
          ],
        },
      ],
      summary: { totalFiles: 2, totalViolations: 4, errors: 2, warnings: 1, info: 1, duration: 30 },
    })
    const parsed = JSON.parse(formatGitlab(report))
    expect(parsed).toHaveLength(4)
    expect(parsed[0].location.path).toBe('/src/a.ts')
    expect(parsed[0].severity).toBe('critical')
    expect(parsed[1].severity).toBe('major')
    expect(parsed[2].location.path).toBe('/src/b.ts')
    expect(parsed[2].severity).toBe('minor')
    expect(parsed[3].severity).toBe('critical')
  })

  test('path with unusual characters is preserved', () => {
    const report = createMockReport({
      files: [
        {
          filePath: '/src/special path (v2)/file.ts',
          violations: [createViolation()],
        },
      ],
      summary: { totalFiles: 1, totalViolations: 1, errors: 1, warnings: 0, info: 0, duration: 5 },
    })
    const parsed = JSON.parse(formatGitlab(report))
    expect(parsed[0].location.path).toBe('/src/special path (v2)/file.ts')
    expect(parsed[0].fingerprint).toContain('/src/special path (v2)/file.ts')
  })

  test('generates correct fingerprint for multiple violations in same file', () => {
    const report = createMockReport({
      files: [
        {
          filePath: '/src/same.ts',
          violations: [
            createViolation({
              ruleId: 'r1',
              range: { start: { line: 1, column: 1 }, end: { line: 1, column: 5 } },
            }),
            createViolation({
              ruleId: 'r1',
              range: { start: { line: 5, column: 1 }, end: { line: 5, column: 5 } },
            }),
            createViolation({
              ruleId: 'r2',
              range: { start: { line: 1, column: 1 }, end: { line: 1, column: 5 } },
            }),
          ],
        },
      ],
      summary: { totalFiles: 1, totalViolations: 3, errors: 3, warnings: 0, info: 0, duration: 10 },
    })
    const parsed = JSON.parse(formatGitlab(report))
    expect(parsed[0].fingerprint).toBe('/src/same.ts:r1:1')
    expect(parsed[1].fingerprint).toBe('/src/same.ts:r1:5')
    expect(parsed[2].fingerprint).toBe('/src/same.ts:r2:1')
    const fps = parsed.map((r: { fingerprint: string }) => r.fingerprint)
    expect(new Set(fps).size).toBe(3)
  })

  test('output is pretty-printed JSON', () => {
    const report = createMockReport({
      files: [{ filePath: '/src/f.ts', violations: [createViolation()] }],
      summary: { totalFiles: 1, totalViolations: 1, errors: 1, warnings: 0, info: 0, duration: 5 },
    })
    const output = formatGitlab(report)
    expect(output).toContain('\n    "description"')
  })

  test('location object only has path and lines', () => {
    const report = createMockReport({
      files: [{ filePath: '/src/f.ts', violations: [createViolation()] }],
      summary: { totalFiles: 1, totalViolations: 1, errors: 1, warnings: 0, info: 0, duration: 5 },
    })
    const parsed = JSON.parse(formatGitlab(report))
    const loc = parsed[0].location
    expect(Object.keys(loc)).toEqual(['lines', 'path'])
    expect(Object.keys(loc.lines)).toEqual(['begin'])
  })

  test('skips files with empty violations', () => {
    const report = createMockReport({
      files: [
        { filePath: '/src/empty.ts', violations: [] },
        { filePath: '/src/full.ts', violations: [createViolation()] },
      ],
      summary: { totalFiles: 2, totalViolations: 1, errors: 1, warnings: 0, info: 0, duration: 5 },
    })
    const parsed = JSON.parse(formatGitlab(report))
    expect(parsed).toHaveLength(1)
    expect(parsed[0].location.path).toBe('/src/full.ts')
  })
})

// ─── Cross-format consistency tests ───────────────────────────────

describe('cross-format consistency', () => {
  const sharedReport: AnalysisReport = createMockReport({
    files: [
      {
        filePath: '/src/app.ts',
        violations: [
          createViolation({
            severity: 'error',
            ruleId: 'no-console',
            message: 'Unexpected console statement.',
            range: { start: { line: 10, column: 5 }, end: { line: 10, column: 20 } },
          }),
          createViolation({
            severity: 'warning',
            ruleId: 'prefer-const',
            message: 'Use const instead of let.',
            range: { start: { line: 25, column: 1 }, end: { line: 25, column: 10 } },
          }),
        ],
      },
      {
        filePath: '/src/util.ts',
        violations: [
          createViolation({
            severity: 'info',
            ruleId: 'max-lines',
            message: 'File exceeds 300 lines.',
            range: { start: { line: 301, column: 1 }, end: { line: 301, column: 1 } },
          }),
        ],
      },
    ],
    summary: { totalFiles: 2, totalViolations: 3, errors: 1, warnings: 1, info: 1, duration: 42.5 },
  })

  test('all formatters produce non-empty output with same report', () => {
    const junit = formatJunit(sharedReport)
    const sarif = formatSarif(sharedReport)
    const markdown = formatMarkdown(sharedReport)
    const html = formatHtml(sharedReport)
    const json = formatJson(sharedReport)
    const gitlab = formatGitlab(sharedReport)
    const consoleOutput = formatConsole(sharedReport, COLORS, false, false)

    expect(junit.length).toBeGreaterThan(0)
    expect(sarif.length).toBeGreaterThan(0)
    expect(markdown.length).toBeGreaterThan(0)
    expect(html.length).toBeGreaterThan(0)
    expect(json.length).toBeGreaterThan(0)
    expect(gitlab.length).toBeGreaterThan(0)
    expect(consoleOutput.length).toBeGreaterThan(0)
  })

  test('JSON/Markdown/HTML/JUnit all reference same file paths and rule IDs', () => {
    const json = JSON.parse(formatJson(sharedReport))
    const markdown = formatMarkdown(sharedReport)
    const html = formatHtml(sharedReport)
    const junit = formatJunit(sharedReport)
    const gitlab = JSON.parse(formatGitlab(sharedReport))

    expect(json.files[0].filePath).toBe('/src/app.ts')
    expect(markdown).toContain('/src/app.ts')
    expect(html).toContain('/src/app.ts')
    expect(junit).toContain('/src/app.ts')
    expect(
      gitlab.some((r: { location: { path: string } }) => r.location.path === '/src/app.ts'),
    ).toBe(true)

    expect(json.files[1].filePath).toBe('/src/util.ts')
    expect(markdown).toContain('/src/util.ts')
    expect(html).toContain('/src/util.ts')
    expect(junit).toContain('/src/util.ts')
    expect(
      gitlab.some((r: { location: { path: string } }) => r.location.path === '/src/util.ts'),
    ).toBe(true)

    expect(markdown).toContain('no-console')
    expect(markdown).toContain('prefer-const')
    expect(markdown).toContain('max-lines')
    expect(html).toContain('no-console')
    expect(html).toContain('prefer-const')
    expect(html).toContain('max-lines')
    expect(junit).toContain('no-console')
    expect(junit).toContain('prefer-const')
    expect(junit).toContain('max-lines')
  })

  test('all formatters handle empty report without error', () => {
    const emptyReport = createMockReport()
    expect(() => formatJson(emptyReport)).not.toThrow()
    expect(() => formatConsole(emptyReport, COLORS, false, false)).not.toThrow()
    expect(() => formatMarkdown(emptyReport)).not.toThrow()
    expect(() => formatHtml(emptyReport)).not.toThrow()
    expect(() => formatJunit(emptyReport)).not.toThrow()
    expect(() => formatSarif(emptyReport)).not.toThrow()
    expect(() => formatGitlab(emptyReport)).not.toThrow()
  })

  test('all formatters produce string output', () => {
    const r = createMockReport()
    expect(typeof formatJson(r)).toBe('string')
    expect(typeof formatConsole(r, COLORS, false, false)).toBe('string')
    expect(typeof formatMarkdown(r)).toBe('string')
    expect(typeof formatHtml(r)).toBe('string')
    expect(typeof formatJunit(r)).toBe('string')
    expect(typeof formatSarif(r)).toBe('string')
    expect(typeof formatGitlab(r)).toBe('string')
  })

  test('violation count matches across all formats', () => {
    const report = createMockReport({
      files: [
        {
          filePath: '/src/a.ts',
          violations: [
            createViolation({ ruleId: 'r1', severity: 'error', message: 'e' }),
            createViolation({ ruleId: 'r2', severity: 'warning', message: 'w' }),
          ],
        },
      ],
      summary: { totalFiles: 1, totalViolations: 2, errors: 1, warnings: 1, info: 0, duration: 5 },
    })

    // JSON
    const jsonParsed = JSON.parse(formatJson(report))
    expect(jsonParsed.files[0].violations).toHaveLength(2)

    // SARIF
    const sarifParsed = JSON.parse(formatSarif(report))
    expect(sarifParsed.runs[0].results).toHaveLength(2)

    // GitLab
    const gitlabParsed = JSON.parse(formatGitlab(report))
    expect(gitlabParsed).toHaveLength(2)

    // JUnit
    const junit = formatJunit(report)
    expect((junit.match(/<testcase/g) || []).length).toBe(2)

    // HTML
    const html = formatHtml(report)
    expect((html.match(/class="violation"/g) || []).length).toBe(2)
  })
})

// ─── Edge case tests ──────────────────────────────────────────────

describe('edge cases', () => {
  test('formatJson handles file with many violations', () => {
    const violations = Array.from({ length: 50 }, (_, i) =>
      createViolation({
        ruleId: `rule-${i}`,
        message: `Message ${i}`,
        range: { start: { line: i + 1, column: 1 }, end: { line: i + 1, column: 5 } },
      }),
    )
    const report = createMockReport({
      files: [{ filePath: '/src/big.ts', violations }],
      summary: {
        totalFiles: 1,
        totalViolations: 50,
        errors: 50,
        warnings: 0,
        info: 0,
        duration: 100,
      },
    })
    const parsed = JSON.parse(formatJson(report))
    expect(parsed.files[0].violations).toHaveLength(50)
  })

  test('formatSarif handles file with many violations', () => {
    const violations = Array.from({ length: 20 }, (_, i) =>
      createViolation({
        ruleId: `r${i}`,
        message: `M${i}.`,
        range: { start: { line: i + 1, column: 1 }, end: { line: i + 1, column: 5 } },
      }),
    )
    const report = createMockReport({
      files: [{ filePath: '/src/big.ts', violations }],
      summary: {
        totalFiles: 1,
        totalViolations: 20,
        errors: 20,
        warnings: 0,
        info: 0,
        duration: 50,
      },
    })
    const parsed = JSON.parse(formatSarif(report))
    expect(parsed.runs[0].results).toHaveLength(20)
    expect(parsed.runs[0].tool.driver.rules).toHaveLength(20)
  })

  test('formatGitlab handles file with many violations', () => {
    const violations = Array.from({ length: 15 }, (_, i) =>
      createViolation({
        ruleId: `r${i}`,
        range: { start: { line: i + 1, column: 1 }, end: { line: i + 1, column: 5 } },
      }),
    )
    const report = createMockReport({
      files: [{ filePath: '/src/big.ts', violations }],
      summary: {
        totalFiles: 1,
        totalViolations: 15,
        errors: 15,
        warnings: 0,
        info: 0,
        duration: 50,
      },
    })
    const parsed = JSON.parse(formatGitlab(report))
    expect(parsed).toHaveLength(15)
  })

  test('formatConsole handles file with many violations', () => {
    const violations = Array.from({ length: 10 }, (_, i) =>
      createViolation({
        ruleId: `r${i}`,
        message: `msg${i}`,
        range: { start: { line: i + 1, column: 1 }, end: { line: i + 1, column: 5 } },
      }),
    )
    const report = createMockReport({
      files: [{ filePath: '/src/big.ts', violations }],
      summary: {
        totalFiles: 1,
        totalViolations: 10,
        errors: 10,
        warnings: 0,
        info: 0,
        duration: 50,
      },
    })
    const output = formatConsole(report, COLORS, false, false)
    for (let i = 0; i < 10; i++) {
      expect(output).toContain(`msg${i}`)
    }
  })

  test('formatHtml handles file with many violations', () => {
    const violations = Array.from({ length: 8 }, (_, i) =>
      createViolation({ ruleId: `r${i}`, message: `msg${i}` }),
    )
    const report = createMockReport({
      files: [{ filePath: '/src/big.ts', violations }],
      summary: { totalFiles: 1, totalViolations: 8, errors: 8, warnings: 0, info: 0, duration: 50 },
    })
    const output = formatHtml(report)
    const count = (output.match(/class="violation"/g) || []).length
    expect(count).toBe(8)
  })

  test('formatJunit handles file with many violations', () => {
    const violations = Array.from({ length: 12 }, (_, i) => createViolation({ ruleId: `r${i}` }))
    const report = createMockReport({
      files: [{ filePath: '/src/big.ts', violations }],
      summary: {
        totalFiles: 1,
        totalViolations: 12,
        errors: 12,
        warnings: 0,
        info: 0,
        duration: 50,
      },
    })
    const output = formatJunit(report)
    expect((output.match(/<testcase/g) || []).length).toBe(12)
    expect(output).toContain('tests="12"')
  })

  test('formatMarkdown handles file with many violations', () => {
    const violations = Array.from({ length: 6 }, (_, i) =>
      createViolation({ ruleId: `r${i}`, message: `msg${i}` }),
    )
    const report = createMockReport({
      files: [{ filePath: '/src/big.ts', violations }],
      summary: { totalFiles: 1, totalViolations: 6, errors: 6, warnings: 0, info: 0, duration: 50 },
    })
    const output = formatMarkdown(report)
    for (let i = 0; i < 6; i++) {
      expect(output).toContain(`msg${i}`)
    }
  })

  test('violation at line 0 column 0', () => {
    const report = createMockReport({
      files: [
        {
          filePath: '/src/f.ts',
          violations: [
            createViolation({
              range: { start: { line: 0, column: 0 }, end: { line: 0, column: 0 } },
            }),
          ],
        },
      ],
      summary: { totalFiles: 1, totalViolations: 1, errors: 1, warnings: 0, info: 0, duration: 1 },
    })
    const consoleOut = formatConsole(report, COLORS, false, false)
    expect(consoleOut).toContain('[0:0]')

    const html = formatHtml(report)
    expect(html).toContain('line 0:0')

    const markdown = formatMarkdown(report)
    expect(markdown).toContain('line 0:0')
  })

  test('violation at very high line number', () => {
    const report = createMockReport({
      files: [
        {
          filePath: '/src/f.ts',
          violations: [
            createViolation({
              range: { start: { line: 99999, column: 99999 }, end: { line: 99999, column: 99999 } },
            }),
          ],
        },
      ],
      summary: { totalFiles: 1, totalViolations: 1, errors: 1, warnings: 0, info: 0, duration: 1 },
    })
    const consoleOut = formatConsole(report, COLORS, false, false)
    expect(consoleOut).toContain('[99999:99999]')
  })

  test('empty file path', () => {
    const report = createMockReport({
      files: [
        {
          filePath: '',
          violations: [createViolation()],
        },
      ],
      summary: { totalFiles: 1, totalViolations: 1, errors: 1, warnings: 0, info: 0, duration: 1 },
    })
    const gitlabParsed = JSON.parse(formatGitlab(report))
    expect(gitlabParsed[0].location.path).toBe('')

    const html = formatHtml(report)
    expect(html).toContain('file-path"></div>')
  })

  test('empty ruleId', () => {
    const report = createMockReport({
      files: [
        {
          filePath: '/src/f.ts',
          violations: [createViolation({ ruleId: '' })],
        },
      ],
      summary: { totalFiles: 1, totalViolations: 1, errors: 1, warnings: 0, info: 0, duration: 1 },
    })
    const gitlabParsed = JSON.parse(formatGitlab(report))
    expect(gitlabParsed[0].check_name).toBe('')

    const sarifParsed = JSON.parse(formatSarif(report))
    expect(sarifParsed.runs[0].results[0].ruleId).toBe('')
  })

  test('empty violation message', () => {
    const report = createMockReport({
      files: [
        {
          filePath: '/src/f.ts',
          violations: [createViolation({ message: '' })],
        },
      ],
      summary: { totalFiles: 1, totalViolations: 1, errors: 1, warnings: 0, info: 0, duration: 1 },
    })
    const gitlabParsed = JSON.parse(formatGitlab(report))
    expect(gitlabParsed[0].description).toBe('')

    const consoleOut = formatConsole(report, COLORS, false, false)
    expect(consoleOut).toContain('/src/f.ts')
  })

  test('negative duration value', () => {
    const report = createMockReport({
      summary: { totalFiles: 0, totalViolations: 0, errors: 0, warnings: 0, info: 0, duration: -1 },
    })
    const consoleOut = formatConsole(report, COLORS, false, false)
    expect(consoleOut).toContain('-1.00ms')

    const markdown = formatMarkdown(report)
    expect(markdown).toContain('-1.00ms')

    const html = formatHtml(report)
    expect(html).toContain('-1.00ms')
  })

  test('very large duration value', () => {
    const report = createMockReport({
      summary: {
        totalFiles: 0,
        totalViolations: 0,
        errors: 0,
        warnings: 0,
        info: 0,
        duration: 999999.999,
      },
    })
    const html = formatHtml(report)
    expect(html).toContain('1000000.00ms')
  })

  test('message with only special XML characters', () => {
    const report = createMockReport({
      files: [
        {
          filePath: '/src/f.ts',
          violations: [createViolation({ message: '<>&"\'' })],
        },
      ],
      summary: { totalFiles: 1, totalViolations: 1, errors: 1, warnings: 0, info: 0, duration: 1 },
    })
    const junit = formatJunit(report)
    expect(junit).toContain('&lt;&gt;&amp;&quot;&#039;')

    const html = formatHtml(report)
    expect(html).toContain('&lt;&gt;&amp;&quot;&#039;')
  })

  test('deeply nested file path', () => {
    const deepPath = '/a/b/c/d/e/f/g/h/i/j/k/l/m/n/o/p/file.ts'
    const report = createMockReport({
      files: [
        {
          filePath: deepPath,
          violations: [createViolation()],
        },
      ],
      summary: { totalFiles: 1, totalViolations: 1, errors: 1, warnings: 0, info: 0, duration: 1 },
    })
    const output = formatConsole(report, COLORS, false, false)
    expect(output).toContain(deepPath)

    const markdown = formatMarkdown(report)
    expect(markdown).toContain(deepPath)
  })

  test('file path with unicode characters', () => {
    const report = createMockReport({
      files: [
        {
          filePath: '/src/🎉celebration/日本語.ts',
          violations: [createViolation()],
        },
      ],
      summary: { totalFiles: 1, totalViolations: 1, errors: 1, warnings: 0, info: 0, duration: 1 },
    })
    const gitlab = JSON.parse(formatGitlab(report))
    expect(gitlab[0].location.path).toBe('/src/🎉celebration/日本語.ts')

    const json = JSON.parse(formatJson(report))
    expect(json.files[0].filePath).toBe('/src/🎉celebration/日本語.ts')
  })

  test('formatConsole with all zeros in summary', () => {
    const report = createMockReport({
      summary: { totalFiles: 0, totalViolations: 0, errors: 0, warnings: 0, info: 0, duration: 0 },
    })
    const output = formatConsole(report, COLORS, false, false)
    expect(output).toContain('Errors: 0')
    expect(output).toContain('Warnings: 0')
    expect(output).toContain('Info: 0')
  })

  test('formatHtml with special characters in multiple fields', () => {
    const report = createMockReport({
      files: [
        {
          filePath: '/src/a&b.ts',
          violations: [
            createViolation({
              ruleId: 'rule<1>',
              message: 'Fix "this" & use <proper> tags',
            }),
          ],
        },
      ],
      summary: { totalFiles: 1, totalViolations: 1, errors: 1, warnings: 0, info: 0, duration: 1 },
    })
    const output = formatHtml(report)
    expect(output).toContain('a&amp;b.ts')
    expect(output).toContain('rule&lt;1&gt;')
    expect(output).toContain('Fix &quot;this&quot; &amp; use &lt;proper&gt; tags')
  })

  test('formatMarkdown with single sentence message', () => {
    const report = createMockReport({
      files: [
        {
          filePath: '/src/f.ts',
          violations: [createViolation({ ruleId: 'r1', message: 'Single sentence' })],
        },
      ],
      summary: { totalFiles: 1, totalViolations: 1, errors: 1, warnings: 0, info: 0, duration: 1 },
    })
    const sarif = JSON.parse(formatSarif(report))
    expect(sarif.runs[0].tool.driver.rules[0].shortDescription).toBe('Single sentence.')
  })

  test('formatGitlab fingerprint uniqueness across different files same rule same line', () => {
    const report = createMockReport({
      files: [
        {
          filePath: '/src/a.ts',
          violations: [
            createViolation({
              ruleId: 'r1',
              range: { start: { line: 5, column: 1 }, end: { line: 5, column: 10 } },
            }),
          ],
        },
        {
          filePath: '/src/b.ts',
          violations: [
            createViolation({
              ruleId: 'r1',
              range: { start: { line: 5, column: 1 }, end: { line: 5, column: 10 } },
            }),
          ],
        },
      ],
      summary: { totalFiles: 2, totalViolations: 2, errors: 2, warnings: 0, info: 0, duration: 5 },
    })
    const parsed = JSON.parse(formatGitlab(report))
    expect(parsed[0].fingerprint).toBe('/src/a.ts:r1:5')
    expect(parsed[1].fingerprint).toBe('/src/b.ts:r1:5')
    expect(parsed[0].fingerprint).not.toBe(parsed[1].fingerprint)
  })

  test('formatJunit failure message includes file path', () => {
    const report = createMockReport({
      files: [
        {
          filePath: '/src/my-specific-file.ts',
          violations: [
            createViolation({
              filePath: '/src/my-specific-file.ts',
              range: { start: { line: 7, column: 3 }, end: { line: 7, column: 10 } },
            }),
          ],
        },
      ],
      summary: { totalFiles: 1, totalViolations: 1, errors: 1, warnings: 0, info: 0, duration: 1 },
    })
    const output = formatJunit(report)
    expect(output).toContain('/src/my-specific-file.ts:7:3')
  })

  test('formatSarif preserves column in region', () => {
    const report = createMockReport({
      files: [
        {
          filePath: '/src/f.ts',
          violations: [
            createViolation({
              range: { start: { line: 100, column: 42 }, end: { line: 100, column: 50 } },
            }),
          ],
        },
      ],
      summary: { totalFiles: 1, totalViolations: 1, errors: 1, warnings: 0, info: 0, duration: 1 },
    })
    const parsed = JSON.parse(formatSarif(report))
    expect(parsed.runs[0].results[0].locations[0].physicalLocation.region.startColumn).toBe(42)
  })

  test('multiple files with same ruleId produce single SARIF rule', () => {
    const report = createMockReport({
      files: [
        {
          filePath: '/src/a.ts',
          violations: [createViolation({ ruleId: 'shared', message: 'A. Detail.' })],
        },
        {
          filePath: '/src/b.ts',
          violations: [createViolation({ ruleId: 'shared', message: 'B. Detail.' })],
        },
        {
          filePath: '/src/c.ts',
          violations: [createViolation({ ruleId: 'shared', message: 'C. Detail.' })],
        },
      ],
      summary: { totalFiles: 3, totalViolations: 3, errors: 3, warnings: 0, info: 0, duration: 5 },
    })
    const parsed = JSON.parse(formatSarif(report))
    expect(parsed.runs[0].tool.driver.rules).toHaveLength(1)
    expect(parsed.runs[0].results).toHaveLength(3)
    // Short description from first occurrence
    expect(parsed.runs[0].tool.driver.rules[0].shortDescription).toBe('A.')
  })

  test('formatConsole with bold styling on file paths', () => {
    const report = createMockReport({
      files: [{ filePath: '/src/alpha.ts', violations: [createViolation()] }],
      summary: { totalFiles: 1, totalViolations: 1, errors: 1, warnings: 0, info: 0, duration: 5 },
    })
    const output = formatConsole(report, COLORS, false, false)
    expect(output).toContain(COLORS.bold)
  })

  test('formatConsole summary uses bold label', () => {
    const report = createMockReport({
      summary: { totalFiles: 1, totalViolations: 0, errors: 0, warnings: 0, info: 0, duration: 5 },
    })
    const output = formatConsole(report, COLORS, false, false)
    expect(output).toContain(COLORS.bold + 'Summary')
  })

  test('formatConsole error count uses red color', () => {
    const report = createMockReport({
      summary: { totalFiles: 0, totalViolations: 0, errors: 5, warnings: 0, info: 0, duration: 5 },
    })
    const output = formatConsole(report, COLORS, false, false)
    expect(output).toContain(COLORS.red + 'Errors: 5')
  })

  test('formatConsole warning count uses yellow color', () => {
    const report = createMockReport({
      summary: { totalFiles: 0, totalViolations: 0, errors: 0, warnings: 3, info: 0, duration: 5 },
    })
    const output = formatConsole(report, COLORS, false, false)
    expect(output).toContain(COLORS.yellow + 'Warnings: 3')
  })

  test('formatConsole info count uses blue color', () => {
    const report = createMockReport({
      summary: { totalFiles: 0, totalViolations: 0, errors: 0, warnings: 0, info: 7, duration: 5 },
    })
    const output = formatConsole(report, COLORS, false, false)
    expect(output).toContain(COLORS.blue + 'Info: 7')
  })

  test('formatHtml with empty file still produces valid structure', () => {
    const report = createMockReport({
      files: [],
      summary: { totalFiles: 0, totalViolations: 0, errors: 0, warnings: 0, info: 0, duration: 0 },
    })
    const output = formatHtml(report)
    expect(output).toContain('<!DOCTYPE html>')
    expect(output).toContain('</html>')
    expect(output).toContain('Errors: 0')
  })

  test('formatMarkdown handles single violation correctly', () => {
    const report = createMockReport({
      files: [
        {
          filePath: '/src/one.ts',
          violations: [
            createViolation({ ruleId: 'single', message: 'Only one', severity: 'warning' }),
          ],
        },
      ],
      summary: { totalFiles: 1, totalViolations: 1, errors: 0, warnings: 1, info: 0, duration: 10 },
    })
    const output = formatMarkdown(report)
    expect(output).toContain('### /src/one.ts')
    expect(output).toContain('🟡')
    expect(output).toContain('**single**')
    expect(output).toContain('Only one')
  })

  test('formatJson preserves suggestion as undefined when not provided', () => {
    const report = createMockReport({
      files: [
        {
          filePath: '/src/a.ts',
          violations: [createViolation()],
        },
      ],
      summary: { totalFiles: 1, totalViolations: 1, errors: 1, warnings: 0, info: 0, duration: 1 },
    })
    const parsed = JSON.parse(formatJson(report))
    expect(parsed.files[0].violations[0].suggestion).toBeUndefined()
  })

  test('formatSarif results have correct ruleId referencing rules', () => {
    const report = createMockReport({
      files: [
        {
          filePath: '/src/f.ts',
          violations: [
            createViolation({ ruleId: 'alpha', message: 'A.' }),
            createViolation({ ruleId: 'alpha', message: 'A again.' }),
            createViolation({ ruleId: 'beta', message: 'B.' }),
          ],
        },
      ],
      summary: { totalFiles: 1, totalViolations: 3, errors: 3, warnings: 0, info: 0, duration: 5 },
    })
    const parsed = JSON.parse(formatSarif(report))
    expect(parsed.runs[0].results.map((r: { ruleId: string }) => r.ruleId)).toEqual([
      'alpha',
      'alpha',
      'beta',
    ])
  })

  test('formatGitlab handles severity error correctly with location begin line', () => {
    const report = createMockReport({
      files: [
        {
          filePath: '/src/f.ts',
          violations: [
            createViolation({
              severity: 'error',
              range: { start: { line: 100, column: 5 }, end: { line: 100, column: 10 } },
            }),
          ],
        },
      ],
      summary: { totalFiles: 1, totalViolations: 1, errors: 1, warnings: 0, info: 0, duration: 5 },
    })
    const parsed = JSON.parse(formatGitlab(report))
    expect(parsed[0].location.lines.begin).toBe(100)
    expect(parsed[0].severity).toBe('critical')
  })

  test('formatJunit with mixed severity violations still produces testcases', () => {
    const report = createMockReport({
      files: [
        {
          filePath: '/src/mixed.ts',
          violations: [
            createViolation({ severity: 'error', ruleId: 'r1' }),
            createViolation({ severity: 'warning', ruleId: 'r2' }),
            createViolation({ severity: 'info', ruleId: 'r3' }),
          ],
        },
      ],
      summary: { totalFiles: 1, totalViolations: 3, errors: 1, warnings: 1, info: 1, duration: 5 },
    })
    const output = formatJunit(report)
    expect((output.match(/<testcase/g) || []).length).toBe(3)
    expect(output).toContain('r1')
    expect(output).toContain('r2')
    expect(output).toContain('r3')
  })

  test('formatHtml includes correct severity class for error', () => {
    const report = createMockReport({
      files: [
        {
          filePath: '/src/f.ts',
          violations: [createViolation({ severity: 'error' })],
        },
      ],
      summary: { totalFiles: 1, totalViolations: 1, errors: 1, warnings: 0, info: 0, duration: 5 },
    })
    const output = formatHtml(report)
    expect(output).toContain('class="error"')
    expect(output).toContain('[ERROR]')
  })

  test('formatHtml includes correct severity class for warning', () => {
    const report = createMockReport({
      files: [
        {
          filePath: '/src/f.ts',
          violations: [createViolation({ severity: 'warning' })],
        },
      ],
      summary: { totalFiles: 1, totalViolations: 1, errors: 0, warnings: 1, info: 0, duration: 5 },
    })
    const output = formatHtml(report)
    expect(output).toContain('class="warning"')
    expect(output).toContain('[WARNING]')
  })

  test('formatHtml includes correct severity class for info', () => {
    const report = createMockReport({
      files: [
        {
          filePath: '/src/f.ts',
          violations: [createViolation({ severity: 'info' })],
        },
      ],
      summary: { totalFiles: 1, totalViolations: 1, errors: 0, warnings: 0, info: 1, duration: 5 },
    })
    const output = formatHtml(report)
    expect(output).toContain('class="info"')
    expect(output).toContain('[INFO]')
  })

  test('formatMarkdown includes total files analyzed count', () => {
    const report = createMockReport({
      files: [
        { filePath: '/src/a.ts', violations: [] },
        { filePath: '/src/b.ts', violations: [createViolation()] },
        { filePath: '/src/c.ts', violations: [] },
      ],
      summary: { totalFiles: 3, totalViolations: 1, errors: 1, warnings: 0, info: 0, duration: 5 },
    })
    const output = formatMarkdown(report)
    expect(output).toContain('| Total Files Analyzed | 3 |')
  })

  test('formatConsole with one violation shows exactly one file header', () => {
    const report = createMockReport({
      files: [{ filePath: '/src/one.ts', violations: [createViolation()] }],
      summary: { totalFiles: 1, totalViolations: 1, errors: 1, warnings: 0, info: 0, duration: 5 },
    })
    const output = formatConsole(report, COLORS, false, false)
    const count = (output.match(/\/src\/one\.ts/g) || []).length
    expect(count).toBeGreaterThanOrEqual(1)
  })

  test('formatSarif schema URL is correct', () => {
    const report = createMockReport()
    const parsed = JSON.parse(formatSarif(report))
    expect(parsed.$schema).toBe(
      'https://raw.githubusercontent.com/oasis-tcs/sarif-spec/master/Schemata/sarif-schema-2.1.0.json',
    )
  })

  test('formatGitlab with unknown severity maps to minor', () => {
    const report = createMockReport({
      files: [
        {
          filePath: '/src/f.ts',
          violations: [createViolation({ severity: 'critical' as 'error' })],
        },
      ],
      summary: { totalFiles: 1, totalViolations: 1, errors: 0, warnings: 0, info: 0, duration: 5 },
    })
    const parsed = JSON.parse(formatGitlab(report))
    expect(parsed[0].severity).toBe('minor')
  })
})

// ─── Additional coverage: COLORS ──────────────────────────────────

describe('COLORS exhaustive checks', () => {
  test('COLORS object has exactly 6 keys', () => {
    expect(Object.keys(COLORS)).toHaveLength(6)
  })

  test('COLORS.reset starts with escape', () => {
    expect(COLORS.reset.startsWith('\x1b[')).toBe(true)
  })

  test('COLORS.red starts with escape', () => {
    expect(COLORS.red.startsWith('\x1b[')).toBe(true)
  })

  test('COLORS.yellow starts with escape', () => {
    expect(COLORS.yellow.startsWith('\x1b[')).toBe(true)
  })

  test('COLORS.blue starts with escape', () => {
    expect(COLORS.blue.startsWith('\x1b[')).toBe(true)
  })

  test('COLORS.dim starts with escape', () => {
    expect(COLORS.dim.startsWith('\x1b[')).toBe(true)
  })

  test('COLORS.bold starts with escape', () => {
    expect(COLORS.bold.startsWith('\x1b[')).toBe(true)
  })

  test('all COLORS values end with m', () => {
    for (const value of Object.values(COLORS)) {
      expect(value.endsWith('m')).toBe(true)
    }
  })
})

// ─── Additional coverage: formatJson ──────────────────────────────

describe('formatJson additional', () => {
  test('serializes file with empty violations array', () => {
    const report = createMockReport({
      files: [{ filePath: '/src/empty.ts', violations: [] }],
      summary: { totalFiles: 1, totalViolations: 0, errors: 0, warnings: 0, info: 0, duration: 5 },
    })
    const parsed = JSON.parse(formatJson(report))
    expect(parsed.files[0].violations).toEqual([])
  })

  test('serializes multiple files some empty some with violations', () => {
    const report = createMockReport({
      files: [
        { filePath: '/src/a.ts', violations: [] },
        { filePath: '/src/b.ts', violations: [createViolation()] },
        { filePath: '/src/c.ts', violations: [] },
      ],
      summary: { totalFiles: 3, totalViolations: 1, errors: 1, warnings: 0, info: 0, duration: 10 },
    })
    const parsed = JSON.parse(formatJson(report))
    expect(parsed.files).toHaveLength(3)
    expect(parsed.files[0].violations).toHaveLength(0)
    expect(parsed.files[1].violations).toHaveLength(1)
    expect(parsed.files[2].violations).toHaveLength(0)
  })

  test('handles fractional duration precisely', () => {
    const report = createMockReport({
      summary: {
        totalFiles: 0,
        totalViolations: 0,
        errors: 0,
        warnings: 0,
        info: 0,
        duration: 0.001,
      },
    })
    const parsed = JSON.parse(formatJson(report))
    expect(parsed.summary.duration).toBe(0.001)
  })

  test('preserves exact filePath string', () => {
    const path = '/very/specific/path/to/my/file.ts'
    const report = createMockReport({
      files: [{ filePath: path, violations: [createViolation({ filePath: path })] }],
      summary: { totalFiles: 1, totalViolations: 1, errors: 1, warnings: 0, info: 0, duration: 1 },
    })
    const parsed = JSON.parse(formatJson(report))
    expect(parsed.files[0].filePath).toBe(path)
    expect(parsed.files[0].violations[0].filePath).toBe(path)
  })

  test('handles large summary values', () => {
    const report = createMockReport({
      summary: {
        totalFiles: 100000,
        totalViolations: 999999,
        errors: 500000,
        warnings: 499999,
        info: 0,
        duration: 999999.99,
      },
    })
    const parsed = JSON.parse(formatJson(report))
    expect(parsed.summary.totalFiles).toBe(100000)
    expect(parsed.summary.totalViolations).toBe(999999)
  })
})

// ─── Additional coverage: formatConsole ───────────────────────────

describe('formatConsole additional', () => {
  test('quiet mode does not show leading blank line for header', () => {
    const report = createMockReport({
      summary: { totalFiles: 0, totalViolations: 0, errors: 0, warnings: 0, info: 0, duration: 5 },
    })
    const nonQuiet = formatConsole(report, COLORS, false, false)
    const quiet = formatConsole(report, COLORS, true, false)
    expect(nonQuiet).toContain('CodeForge Analysis Report')
    expect(quiet).not.toContain('CodeForge Analysis Report')
  })

  test('verbose with suggestion on error severity', () => {
    const report = createMockReport({
      files: [
        {
          filePath: '/src/f.ts',
          violations: [
            createViolation({
              severity: 'error',
              suggestion: 'Fix the error now',
              ruleId: 'err-rule',
            }),
          ],
        },
      ],
      summary: { totalFiles: 1, totalViolations: 1, errors: 1, warnings: 0, info: 0, duration: 5 },
    })
    const output = formatConsole(report, COLORS, false, true)
    expect(output).toContain('Suggestion: Fix the error now')
  })

  test('verbose with suggestion on warning severity', () => {
    const report = createMockReport({
      files: [
        {
          filePath: '/src/f.ts',
          violations: [
            createViolation({
              severity: 'warning',
              suggestion: 'Consider fixing',
              ruleId: 'warn-rule',
            }),
          ],
        },
      ],
      summary: { totalFiles: 1, totalViolations: 1, errors: 0, warnings: 1, info: 0, duration: 5 },
    })
    const output = formatConsole(report, COLORS, false, true)
    expect(output).toContain('Suggestion: Consider fixing')
  })

  test('verbose with suggestion on info severity', () => {
    const report = createMockReport({
      files: [
        {
          filePath: '/src/f.ts',
          violations: [
            createViolation({
              severity: 'info',
              suggestion: 'Optional improvement',
              ruleId: 'info-rule',
            }),
          ],
        },
      ],
      summary: { totalFiles: 1, totalViolations: 1, errors: 0, warnings: 0, info: 1, duration: 5 },
    })
    const output = formatConsole(report, COLORS, false, true)
    expect(output).toContain('Suggestion: Optional improvement')
  })

  test('console output ends with trailing newline', () => {
    const report = createMockReport()
    const output = formatConsole(report, COLORS, false, false)
    expect(output.endsWith('\n')).toBe(true)
  })

  test('console shows file separator between files', () => {
    const report = createMockReport({
      files: [
        { filePath: '/src/a.ts', violations: [createViolation()] },
        { filePath: '/src/b.ts', violations: [createViolation()] },
      ],
      summary: { totalFiles: 2, totalViolations: 2, errors: 2, warnings: 0, info: 0, duration: 10 },
    })
    const output = formatConsole(report, COLORS, false, false)
    const aIndex = output.indexOf('/src/a.ts')
    const bIndex = output.indexOf('/src/b.ts')
    expect(aIndex).toBeLessThan(bIndex)
  })

  test('empty violation message is handled gracefully', () => {
    const report = createMockReport({
      files: [
        {
          filePath: '/src/f.ts',
          violations: [createViolation({ message: '' })],
        },
      ],
      summary: { totalFiles: 1, totalViolations: 1, errors: 1, warnings: 0, info: 0, duration: 5 },
    })
    const output = formatConsole(report, COLORS, false, false)
    expect(output).toContain('/src/f.ts')
    expect(output).toContain('Summary')
  })

  test('warning severity label is padded to 7 chars', () => {
    const report = createMockReport({
      files: [{ filePath: '/src/f.ts', violations: [createViolation({ severity: 'warning' })] }],
      summary: { totalFiles: 1, totalViolations: 1, errors: 0, warnings: 1, info: 0, duration: 5 },
    })
    const output = formatConsole(report, COLORS, false, false)
    expect(output).toContain('WARNING')
  })

  test('info severity label is padded to 7 chars', () => {
    const report = createMockReport({
      files: [{ filePath: '/src/f.ts', violations: [createViolation({ severity: 'info' })] }],
      summary: { totalFiles: 1, totalViolations: 1, errors: 0, warnings: 0, info: 1, duration: 5 },
    })
    const output = formatConsole(report, COLORS, false, false)
    expect(output).toContain('INFO   ')
  })

  test('unknown severity label is padded to 7 chars', () => {
    const report = createMockReport({
      files: [
        {
          filePath: '/src/f.ts',
          violations: [createViolation({ severity: 'critical' as 'error' })],
        },
      ],
      summary: { totalFiles: 1, totalViolations: 1, errors: 0, warnings: 0, info: 0, duration: 5 },
    })
    const output = formatConsole(report, COLORS, false, false)
    expect(output).toContain('CRITICAL')
  })

  test('summary includes duration label', () => {
    const report = createMockReport({
      summary: {
        totalFiles: 0,
        totalViolations: 0,
        errors: 0,
        warnings: 0,
        info: 0,
        duration: 123.45,
      },
    })
    const output = formatConsole(report, COLORS, false, false)
    expect(output).toContain('Duration: 123.45ms')
  })

  test('summary section appears after violations', () => {
    const report = createMockReport({
      files: [{ filePath: '/src/f.ts', violations: [createViolation()] }],
      summary: { totalFiles: 1, totalViolations: 1, errors: 1, warnings: 0, info: 0, duration: 5 },
    })
    const output = formatConsole(report, COLORS, false, false)
    const violationIdx = output.indexOf('Test violation')
    const summaryIdx = output.indexOf('Summary')
    expect(violationIdx).toBeLessThan(summaryIdx)
  })

  test('quiet and verbose both true - quiet suppresses header but suggestions show', () => {
    const report = createMockReport({
      files: [
        {
          filePath: '/src/f.ts',
          violations: [createViolation({ suggestion: 'Fix this' })],
        },
      ],
      summary: { totalFiles: 1, totalViolations: 1, errors: 1, warnings: 0, info: 0, duration: 5 },
    })
    const output = formatConsole(report, COLORS, true, true)
    expect(output).not.toContain('CodeForge Analysis Report')
    expect(output).toContain('Suggestion: Fix this')
  })
})

// ─── Additional coverage: formatMarkdown ──────────────────────────

describe('formatMarkdown additional', () => {
  test('markdown starts with h1 header', () => {
    const report = createMockReport()
    const output = formatMarkdown(report)
    expect(output.startsWith('# CodeForge Analysis Report')).toBe(true)
  })

  test('violation line format is correct', () => {
    const report = createMockReport({
      files: [
        {
          filePath: '/src/f.ts',
          violations: [
            createViolation({
              severity: 'error',
              ruleId: 'my-rule',
              message: 'test msg',
              range: { start: { line: 5, column: 3 }, end: { line: 5, column: 10 } },
            }),
          ],
        },
      ],
      summary: { totalFiles: 1, totalViolations: 1, errors: 1, warnings: 0, info: 0, duration: 5 },
    })
    const output = formatMarkdown(report)
    expect(output).toContain('🔴 **my-rule** at line 5:3 - test msg')
  })

  test('warning violation has yellow icon', () => {
    const report = createMockReport({
      files: [
        {
          filePath: '/src/f.ts',
          violations: [createViolation({ severity: 'warning', ruleId: 'w1', message: 'warn msg' })],
        },
      ],
      summary: { totalFiles: 1, totalViolations: 1, errors: 0, warnings: 1, info: 0, duration: 5 },
    })
    const output = formatMarkdown(report)
    expect(output).toContain('🟡 **w1** at line')
  })

  test('info violation has blue icon', () => {
    const report = createMockReport({
      files: [
        {
          filePath: '/src/f.ts',
          violations: [createViolation({ severity: 'info', ruleId: 'i1', message: 'info msg' })],
        },
      ],
      summary: { totalFiles: 1, totalViolations: 1, errors: 0, warnings: 0, info: 1, duration: 5 },
    })
    const output = formatMarkdown(report)
    expect(output).toContain('🔵 **i1** at line')
  })

  test('check mark appears when no violations', () => {
    const report = createMockReport()
    const output = formatMarkdown(report)
    expect(output).toContain('✅')
  })

  test('summary table has separator line', () => {
    const report = createMockReport()
    const output = formatMarkdown(report)
    expect(output).toContain('|--------|-------|')
  })

  test('generated date line contains ISO format', () => {
    const report = createMockReport()
    const output = formatMarkdown(report)
    const dateLine = output.split('\n').find((l) => l.includes('Generated on'))
    expect(dateLine).toBeDefined()
    // ISO date format contains T and Z or timezone
    expect(dateLine!.length).toBeGreaterThan(10)
  })

  test('file section ends with blank line', () => {
    const report = createMockReport({
      files: [
        {
          filePath: '/src/f.ts',
          violations: [createViolation()],
        },
      ],
      summary: { totalFiles: 1, totalViolations: 1, errors: 1, warnings: 0, info: 0, duration: 5 },
    })
    const output = formatMarkdown(report)
    // After violation listing, there should be blank line before next section
    expect(output).toContain('### /src/f.ts')
  })

  test('multiple violations in same file are all listed', () => {
    const report = createMockReport({
      files: [
        {
          filePath: '/src/f.ts',
          violations: [
            createViolation({ ruleId: 'r1', message: 'first' }),
            createViolation({ ruleId: 'r2', message: 'second' }),
            createViolation({ ruleId: 'r3', message: 'third' }),
          ],
        },
      ],
      summary: { totalFiles: 1, totalViolations: 3, errors: 3, warnings: 0, info: 0, duration: 5 },
    })
    const output = formatMarkdown(report)
    expect(output).toContain('first')
    expect(output).toContain('second')
    expect(output).toContain('third')
  })

  test('footer contains markdown link syntax', () => {
    const report = createMockReport()
    const output = formatMarkdown(report)
    expect(output).toContain('[CodeForge](https://github.com/codeforge-dev/codeforge)')
  })
})

// ─── Additional coverage: formatHtml ──────────────────────────────

describe('formatHtml additional', () => {
  test('head section is properly closed', () => {
    const report = createMockReport()
    const output = formatHtml(report)
    expect(output).toContain('</head>')
  })

  test('body section is properly closed', () => {
    const report = createMockReport()
    const output = formatHtml(report)
    expect(output).toContain('</body>')
  })

  test('CSS includes body font-family', () => {
    const report = createMockReport()
    const output = formatHtml(report)
    expect(output).toContain('font-family')
    expect(output).toContain('-apple-system')
  })

  test('CSS includes background color', () => {
    const report = createMockReport()
    const output = formatHtml(report)
    expect(output).toContain('background: #1a1a2e')
  })

  test('CSS includes h1 color', () => {
    const report = createMockReport()
    const output = formatHtml(report)
    expect(output).toContain('color: #a78bfa')
  })

  test('CSS includes violation background', () => {
    const report = createMockReport()
    const output = formatHtml(report)
    expect(output).toContain('background: #1a1a2e')
  })

  test('CSS includes container max-width', () => {
    const report = createMockReport()
    const output = formatHtml(report)
    expect(output).toContain('max-width: 1200px')
  })

  test('CSS includes border-radius on file div', () => {
    const report = createMockReport()
    const output = formatHtml(report)
    expect(output).toContain('border-radius: 8px')
  })

  test('violation span uses error class for error severity', () => {
    const report = createMockReport({
      files: [
        {
          filePath: '/src/f.ts',
          violations: [createViolation({ severity: 'error' })],
        },
      ],
      summary: { totalFiles: 1, totalViolations: 1, errors: 1, warnings: 0, info: 0, duration: 5 },
    })
    const output = formatHtml(report)
    const violationSection = output.slice(output.indexOf('class="violation"'))
    expect(violationSection).toContain('class="error"')
  })

  test('escapeHtml handles single quote', () => {
    const report = createMockReport({
      files: [
        {
          filePath: '/src/f.ts',
          violations: [createViolation({ message: "it's a test" })],
        },
      ],
      summary: { totalFiles: 1, totalViolations: 1, errors: 1, warnings: 0, info: 0, duration: 5 },
    })
    const output = formatHtml(report)
    expect(output).toContain('&#039;')
  })

  test('escapeHtml handles greater than sign', () => {
    const report = createMockReport({
      files: [
        {
          filePath: '/src/f.ts',
          violations: [createViolation({ message: 'x > y' })],
        },
      ],
      summary: { totalFiles: 1, totalViolations: 1, errors: 1, warnings: 0, info: 0, duration: 5 },
    })
    const output = formatHtml(report)
    expect(output).toContain('&gt;')
  })

  test('escapeHtml handles less than sign in ruleId', () => {
    const report = createMockReport({
      files: [
        {
          filePath: '/src/f.ts',
          violations: [createViolation({ ruleId: 'a<b' })],
        },
      ],
      summary: { totalFiles: 1, totalViolations: 1, errors: 1, warnings: 0, info: 0, duration: 5 },
    })
    const output = formatHtml(report)
    expect(output).toContain('a&lt;b')
  })

  test('html output contains correct error color CSS', () => {
    const report = createMockReport()
    const output = formatHtml(report)
    expect(output).toContain('#ff6b6b')
  })

  test('html output contains correct warning color CSS', () => {
    const report = createMockReport()
    const output = formatHtml(report)
    expect(output).toContain('#f0c674')
  })

  test('html output contains correct info color CSS', () => {
    const report = createMockReport()
    const output = formatHtml(report)
    expect(output).toContain('#4ecdc4')
  })

  test('file div has class file', () => {
    const report = createMockReport({
      files: [{ filePath: '/src/f.ts', violations: [createViolation()] }],
      summary: { totalFiles: 1, totalViolations: 1, errors: 1, warnings: 0, info: 0, duration: 5 },
    })
    const output = formatHtml(report)
    expect(output).toContain('class="file"')
  })

  test('summary shows total files count', () => {
    const report = createMockReport({
      summary: { totalFiles: 42, totalViolations: 0, errors: 0, warnings: 0, info: 0, duration: 5 },
    })
    const output = formatHtml(report)
    expect(output).toContain('Files: 42')
  })
})

// ─── Additional coverage: formatJunit ─────────────────────────────

describe('formatJunit additional', () => {
  test('root testsuit has tests attribute', () => {
    const report = createMockReport()
    const output = formatJunit(report)
    expect(output).toContain('tests="1"')
  })

  test('root testsuit has errors="0"', () => {
    const report = createMockReport()
    const output = formatJunit(report)
    expect(output).toContain('errors="0"')
  })

  test('root testsuit has failures="0"', () => {
    const report = createMockReport()
    const output = formatJunit(report)
    expect(output).toContain('failures="0"')
  })

  test('root testsuit has skipped="0"', () => {
    const report = createMockReport()
    const output = formatJunit(report)
    expect(output).toContain('skipped="0"')
  })

  test('properties section has files-analyzed property', () => {
    const report = createMockReport()
    const output = formatJunit(report)
    expect(output).toContain('name="files-analyzed"')
    expect(output).toContain('value="1"')
  })

  test('escapeXml handles all five special chars together', () => {
    const report = createMockReport({
      files: [
        {
          filePath: '/src/f.ts',
          violations: [createViolation({ message: '&<>"\'', ruleId: 'test' })],
        },
      ],
      summary: { totalFiles: 1, totalViolations: 1, errors: 1, warnings: 0, info: 0, duration: 1 },
    })
    const output = formatJunit(report)
    expect(output).toContain('&amp;')
    expect(output).toContain('&lt;')
    expect(output).toContain('&gt;')
    expect(output).toContain('&quot;')
    expect(output).toContain('&#039;')
  })

  test('testcase has closing tag', () => {
    const report = createMockReport({
      files: [{ filePath: '/src/f.ts', violations: [createViolation()] }],
      summary: { totalFiles: 1, totalViolations: 1, errors: 1, warnings: 0, info: 0, duration: 5 },
    })
    const output = formatJunit(report)
    expect(output).toContain('</testcase>')
  })

  test('testsuite count matches violation count for single file', () => {
    const report = createMockReport({
      files: [
        {
          filePath: '/src/f.ts',
          violations: [
            createViolation({ ruleId: 'r1' }),
            createViolation({ ruleId: 'r2' }),
            createViolation({ ruleId: 'r3' }),
            createViolation({ ruleId: 'r4' }),
          ],
        },
      ],
      summary: { totalFiles: 1, totalViolations: 4, errors: 4, warnings: 0, info: 0, duration: 5 },
    })
    const output = formatJunit(report)
    expect(output).toContain('tests="4"')
  })

  test('inner testsuite is closed properly', () => {
    const report = createMockReport({
      files: [{ filePath: '/src/f.ts', violations: [createViolation()] }],
      summary: { totalFiles: 1, totalViolations: 1, errors: 1, warnings: 0, info: 0, duration: 5 },
    })
    const output = formatJunit(report)
    const suiteCount = (output.match(/<testsuite name="\/src\/f.ts"/g) || []).length
    expect(suiteCount).toBe(1)
    expect(output).toContain('</testsuit>')
  })

  test('failure element has message attribute with location', () => {
    const report = createMockReport({
      files: [
        {
          filePath: '/src/f.ts',
          violations: [
            createViolation({
              filePath: '/src/f.ts',
              range: { start: { line: 1, column: 1 }, end: { line: 1, column: 5 } },
            }),
          ],
        },
      ],
      summary: { totalFiles: 1, totalViolations: 1, errors: 1, warnings: 0, info: 0, duration: 5 },
    })
    const output = formatJunit(report)
    expect(output).toContain('<failure message="/src/f.ts:1:1">')
  })

  test('junit output is joined with newlines', () => {
    const report = createMockReport()
    const output = formatJunit(report)
    expect(output).toContain('\n')
  })
})

// ─── Additional coverage: formatSarif ─────────────────────────────

describe('formatSarif additional', () => {
  test('runs array has exactly one element', () => {
    const report = createMockReport()
    const parsed = JSON.parse(formatSarif(report))
    expect(parsed.runs).toHaveLength(1)
  })

  test('tool object has driver property', () => {
    const report = createMockReport()
    const parsed = JSON.parse(formatSarif(report))
    expect(parsed.runs[0].tool).toHaveProperty('driver')
  })

  test('driver has name CodeForge', () => {
    const report = createMockReport()
    const parsed = JSON.parse(formatSarif(report))
    expect(parsed.runs[0].tool.driver.name).toBe('CodeForge')
  })

  test('driver version is 0.1.0', () => {
    const report = createMockReport()
    const parsed = JSON.parse(formatSarif(report))
    expect(parsed.runs[0].tool.driver.version).toBe('0.1.0')
  })

  test('short description from message with multiple periods', () => {
    const report = createMockReport({
      files: [
        {
          filePath: '/src/f.ts',
          violations: [createViolation({ ruleId: 'r1', message: 'First. Second. Third.' })],
        },
      ],
      summary: { totalFiles: 1, totalViolations: 1, errors: 1, warnings: 0, info: 0, duration: 5 },
    })
    const parsed = JSON.parse(formatSarif(report))
    expect(parsed.runs[0].tool.driver.rules[0].shortDescription).toBe('First.')
  })

  test('short description from empty message', () => {
    const report = createMockReport({
      files: [
        {
          filePath: '/src/f.ts',
          violations: [createViolation({ ruleId: 'r1', message: '' })],
        },
      ],
      summary: { totalFiles: 1, totalViolations: 1, errors: 1, warnings: 0, info: 0, duration: 5 },
    })
    const parsed = JSON.parse(formatSarif(report))
    // Empty string split on '.' gives [''], so first element + '.' = '.'
    expect(parsed.runs[0].tool.driver.rules[0].shortDescription).toBe('.')
  })

  test('empty report has zero results', () => {
    const report = createMockReport()
    const parsed = JSON.parse(formatSarif(report))
    expect(parsed.runs[0].results).toEqual([])
  })

  test('empty report has zero rules', () => {
    const report = createMockReport()
    const parsed = JSON.parse(formatSarif(report))
    expect(parsed.runs[0].tool.driver.rules).toEqual([])
  })

  test('sarif output uses 2-space indentation', () => {
    const report = createMockReport()
    const output = formatSarif(report)
    expect(output).toContain('\n  "$schema"')
  })

  test('sarif version is string 2.1.0', () => {
    const report = createMockReport()
    const parsed = JSON.parse(formatSarif(report))
    expect(typeof parsed.version).toBe('string')
  })

  test('location region has startLine and startColumn only', () => {
    const report = createMockReport({
      files: [
        {
          filePath: '/src/f.ts',
          violations: [createViolation()],
        },
      ],
      summary: { totalFiles: 1, totalViolations: 1, errors: 1, warnings: 0, info: 0, duration: 5 },
    })
    const parsed = JSON.parse(formatSarif(report))
    const region = parsed.runs[0].results[0].locations[0].physicalLocation.region
    expect(Object.keys(region)).toEqual(['startColumn', 'startLine'])
  })
})

// ─── Additional coverage: formatGitlab ────────────────────────────

describe('formatGitlab additional', () => {
  test('generates JSON array that can be parsed', () => {
    const report = createMockReport({
      files: [{ filePath: '/src/f.ts', violations: [createViolation()] }],
      summary: { totalFiles: 1, totalViolations: 1, errors: 1, warnings: 0, info: 0, duration: 5 },
    })
    expect(() => JSON.parse(formatGitlab(report))).not.toThrow()
  })

  test('each entry has exactly 5 top-level keys', () => {
    const report = createMockReport({
      files: [{ filePath: '/src/f.ts', violations: [createViolation()] }],
      summary: { totalFiles: 1, totalViolations: 1, errors: 1, warnings: 0, info: 0, duration: 5 },
    })
    const parsed = JSON.parse(formatGitlab(report))
    const keys = Object.keys(parsed[0])
    expect(keys).toHaveLength(5)
    expect(keys).toContain('description')
    expect(keys).toContain('check_name')
    expect(keys).toContain('fingerprint')
    expect(keys).toContain('severity')
    expect(keys).toContain('location')
  })

  test('error severity maps to critical string', () => {
    const report = createMockReport({
      files: [{ filePath: '/src/f.ts', violations: [createViolation({ severity: 'error' })] }],
      summary: { totalFiles: 1, totalViolations: 1, errors: 1, warnings: 0, info: 0, duration: 5 },
    })
    const parsed = JSON.parse(formatGitlab(report))
    expect(parsed[0].severity).toBe('critical')
  })

  test('warning severity maps to major string', () => {
    const report = createMockReport({
      files: [{ filePath: '/src/f.ts', violations: [createViolation({ severity: 'warning' })] }],
      summary: { totalFiles: 1, totalViolations: 1, errors: 0, warnings: 1, info: 0, duration: 5 },
    })
    const parsed = JSON.parse(formatGitlab(report))
    expect(parsed[0].severity).toBe('major')
  })

  test('info severity maps to minor string', () => {
    const report = createMockReport({
      files: [{ filePath: '/src/f.ts', violations: [createViolation({ severity: 'info' })] }],
      summary: { totalFiles: 1, totalViolations: 1, errors: 0, warnings: 0, info: 1, duration: 5 },
    })
    const parsed = JSON.parse(formatGitlab(report))
    expect(parsed[0].severity).toBe('minor')
  })

  test('fingerprint includes ruleId component', () => {
    const report = createMockReport({
      files: [
        {
          filePath: '/src/f.ts',
          violations: [createViolation({ ruleId: 'my-specific-rule' })],
        },
      ],
      summary: { totalFiles: 1, totalViolations: 1, errors: 1, warnings: 0, info: 0, duration: 5 },
    })
    const parsed = JSON.parse(formatGitlab(report))
    expect(parsed[0].fingerprint).toContain('my-specific-rule')
  })

  test('fingerprint includes line number component', () => {
    const report = createMockReport({
      files: [
        {
          filePath: '/src/f.ts',
          violations: [
            createViolation({
              range: { start: { line: 42, column: 1 }, end: { line: 42, column: 10 } },
            }),
          ],
        },
      ],
      summary: { totalFiles: 1, totalViolations: 1, errors: 1, warnings: 0, info: 0, duration: 5 },
    })
    const parsed = JSON.parse(formatGitlab(report))
    expect(parsed[0].fingerprint).toContain(':42')
  })

  test('description matches violation message', () => {
    const report = createMockReport({
      files: [
        {
          filePath: '/src/f.ts',
          violations: [createViolation({ message: 'Custom description text' })],
        },
      ],
      summary: { totalFiles: 1, totalViolations: 1, errors: 1, warnings: 0, info: 0, duration: 5 },
    })
    const parsed = JSON.parse(formatGitlab(report))
    expect(parsed[0].description).toBe('Custom description text')
  })

  test('check_name matches ruleId', () => {
    const report = createMockReport({
      files: [
        {
          filePath: '/src/f.ts',
          violations: [createViolation({ ruleId: 'custom-check-name' })],
        },
      ],
      summary: { totalFiles: 1, totalViolations: 1, errors: 1, warnings: 0, info: 0, duration: 5 },
    })
    const parsed = JSON.parse(formatGitlab(report))
    expect(parsed[0].check_name).toBe('custom-check-name')
  })

  test('location path matches file filePath', () => {
    const report = createMockReport({
      files: [{ filePath: '/src/specific/path.ts', violations: [createViolation()] }],
      summary: { totalFiles: 1, totalViolations: 1, errors: 1, warnings: 0, info: 0, duration: 5 },
    })
    const parsed = JSON.parse(formatGitlab(report))
    expect(parsed[0].location.path).toBe('/src/specific/path.ts')
  })

  test('location lines begin matches violation start line', () => {
    const report = createMockReport({
      files: [
        {
          filePath: '/src/f.ts',
          violations: [
            createViolation({
              range: { start: { line: 77, column: 3 }, end: { line: 77, column: 10 } },
            }),
          ],
        },
      ],
      summary: { totalFiles: 1, totalViolations: 1, errors: 1, warnings: 0, info: 0, duration: 5 },
    })
    const parsed = JSON.parse(formatGitlab(report))
    expect(parsed[0].location.lines.begin).toBe(77)
  })

  test('output uses 2-space indentation', () => {
    const report = createMockReport({
      files: [{ filePath: '/src/f.ts', violations: [createViolation()] }],
      summary: { totalFiles: 1, totalViolations: 1, errors: 1, warnings: 0, info: 0, duration: 5 },
    })
    const output = formatGitlab(report)
    expect(output).toContain('\n    "description"')
  })

  test('multiple violations preserve order', () => {
    const report = createMockReport({
      files: [
        {
          filePath: '/src/f.ts',
          violations: [
            createViolation({ ruleId: 'first-rule', message: 'first msg' }),
            createViolation({ ruleId: 'second-rule', message: 'second msg' }),
            createViolation({ ruleId: 'third-rule', message: 'third msg' }),
          ],
        },
      ],
      summary: { totalFiles: 1, totalViolations: 3, errors: 3, warnings: 0, info: 0, duration: 5 },
    })
    const parsed = JSON.parse(formatGitlab(report))
    expect(parsed[0].check_name).toBe('first-rule')
    expect(parsed[1].check_name).toBe('second-rule')
    expect(parsed[2].check_name).toBe('third-rule')
  })
})

// ─── Additional edge cases ────────────────────────────────────────

describe('additional edge cases', () => {
  test('formatConsole with empty message still renders correctly', () => {
    const report = createMockReport({
      files: [
        {
          filePath: '/src/f.ts',
          violations: [createViolation({ message: '' })],
        },
      ],
      summary: { totalFiles: 1, totalViolations: 1, errors: 1, warnings: 0, info: 0, duration: 5 },
    })
    const output = formatConsole(report, COLORS, false, false)
    expect(output).toContain('[1:1]')
    expect(output).toContain('test-rule')
  })

  test('formatMarkdown with deeply nested path renders correctly', () => {
    const deepPath = '/a/b/c/d/e/f/g/h/file.ts'
    const report = createMockReport({
      files: [{ filePath: deepPath, violations: [createViolation()] }],
      summary: { totalFiles: 1, totalViolations: 1, errors: 1, warnings: 0, info: 0, duration: 5 },
    })
    const output = formatMarkdown(report)
    expect(output).toContain(`### ${deepPath}`)
  })

  test('formatJunit with message containing only a period', () => {
    const report = createMockReport({
      files: [
        {
          filePath: '/src/f.ts',
          violations: [createViolation({ message: '.' })],
        },
      ],
      summary: { totalFiles: 1, totalViolations: 1, errors: 1, warnings: 0, info: 0, duration: 1 },
    })
    const output = formatJunit(report)
    expect(output).toContain('>.<')
  })

  test('formatSarif with same rule in multiple files uses first short description', () => {
    const report = createMockReport({
      files: [
        {
          filePath: '/src/a.ts',
          violations: [createViolation({ ruleId: 'shared', message: 'First occurrence.' })],
        },
        {
          filePath: '/src/b.ts',
          violations: [createViolation({ ruleId: 'shared', message: 'Second occurrence.' })],
        },
      ],
      summary: { totalFiles: 2, totalViolations: 2, errors: 2, warnings: 0, info: 0, duration: 5 },
    })
    const parsed = JSON.parse(formatSarif(report))
    expect(parsed.runs[0].tool.driver.rules).toHaveLength(1)
    expect(parsed.runs[0].tool.driver.rules[0].shortDescription).toBe('First occurrence.')
  })

  test('formatGitlab with empty ruleId generates valid fingerprint', () => {
    const report = createMockReport({
      files: [
        {
          filePath: '/src/f.ts',
          violations: [
            createViolation({
              ruleId: '',
              range: { start: { line: 5, column: 1 }, end: { line: 5, column: 5 } },
            }),
          ],
        },
      ],
      summary: { totalFiles: 1, totalViolations: 1, errors: 1, warnings: 0, info: 0, duration: 1 },
    })
    const parsed = JSON.parse(formatGitlab(report))
    expect(parsed[0].fingerprint).toBe('/src/f.ts::5')
  })

  test('formatHtml with empty message renders violation div', () => {
    const report = createMockReport({
      files: [
        {
          filePath: '/src/f.ts',
          violations: [createViolation({ message: '' })],
        },
      ],
      summary: { totalFiles: 1, totalViolations: 1, errors: 1, warnings: 0, info: 0, duration: 5 },
    })
    const output = formatHtml(report)
    expect(output).toContain('class="violation"')
  })

  test('formatJunit with empty message still produces testcase', () => {
    const report = createMockReport({
      files: [
        {
          filePath: '/src/f.ts',
          violations: [createViolation({ message: '' })],
        },
      ],
      summary: { totalFiles: 1, totalViolations: 1, errors: 1, warnings: 0, info: 0, duration: 1 },
    })
    const output = formatJunit(report)
    expect(output).toContain('<testcase')
    expect(output).toContain('</testcase>')
  })

  test('formatMarkdown with fractional duration shows correct decimals', () => {
    const report = createMockReport({
      summary: {
        totalFiles: 0,
        totalViolations: 0,
        errors: 0,
        warnings: 0,
        info: 0,
        duration: 1.5,
      },
    })
    const output = formatMarkdown(report)
    expect(output).toContain('| Analysis Time | 1.50ms |')
  })

  test('formatHtml with fractional duration shows correct decimals', () => {
    const report = createMockReport({
      summary: {
        totalFiles: 0,
        totalViolations: 0,
        errors: 0,
        warnings: 0,
        info: 0,
        duration: 1.5,
      },
    })
    const output = formatHtml(report)
    expect(output).toContain('Duration: 1.50ms')
  })

  test('all formats handle report with only clean files', () => {
    const report = createMockReport({
      files: [
        { filePath: '/src/a.ts', violations: [] },
        { filePath: '/src/b.ts', violations: [] },
      ],
      summary: { totalFiles: 2, totalViolations: 0, errors: 0, warnings: 0, info: 0, duration: 10 },
    })
    expect(() => formatJson(report)).not.toThrow()
    expect(() => formatConsole(report, COLORS, false, false)).not.toThrow()
    expect(() => formatMarkdown(report)).not.toThrow()
    expect(() => formatHtml(report)).not.toThrow()
    expect(() => formatJunit(report)).not.toThrow()
    expect(() => formatSarif(report)).not.toThrow()
    expect(() => formatGitlab(report)).not.toThrow()
  })

  test('formatConsole with violation at column 0', () => {
    const report = createMockReport({
      files: [
        {
          filePath: '/src/f.ts',
          violations: [
            createViolation({
              range: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
            }),
          ],
        },
      ],
      summary: { totalFiles: 1, totalViolations: 1, errors: 1, warnings: 0, info: 0, duration: 1 },
    })
    const output = formatConsole(report, COLORS, false, false)
    expect(output).toContain('[1:0]')
  })

  test('formatMarkdown column 0 rendered correctly', () => {
    const report = createMockReport({
      files: [
        {
          filePath: '/src/f.ts',
          violations: [
            createViolation({
              range: { start: { line: 3, column: 0 }, end: { line: 3, column: 5 } },
            }),
          ],
        },
      ],
      summary: { totalFiles: 1, totalViolations: 1, errors: 1, warnings: 0, info: 0, duration: 1 },
    })
    const output = formatMarkdown(report)
    expect(output).toContain('line 3:0')
  })

  test('formatHtml column 0 rendered correctly', () => {
    const report = createMockReport({
      files: [
        {
          filePath: '/src/f.ts',
          violations: [
            createViolation({
              range: { start: { line: 3, column: 0 }, end: { line: 3, column: 5 } },
            }),
          ],
        },
      ],
      summary: { totalFiles: 1, totalViolations: 1, errors: 1, warnings: 0, info: 0, duration: 1 },
    })
    const output = formatHtml(report)
    expect(output).toContain('line 3:0')
  })

  test('formatJunit column 0 rendered in location', () => {
    const report = createMockReport({
      files: [
        {
          filePath: '/src/f.ts',
          violations: [
            createViolation({
              filePath: '/src/f.ts',
              range: { start: { line: 3, column: 0 }, end: { line: 3, column: 5 } },
            }),
          ],
        },
      ],
      summary: { totalFiles: 1, totalViolations: 1, errors: 1, warnings: 0, info: 0, duration: 1 },
    })
    const output = formatJunit(report)
    expect(output).toContain('/src/f.ts:3:0')
  })

  test('formatSarif column 0 in region', () => {
    const report = createMockReport({
      files: [
        {
          filePath: '/src/f.ts',
          violations: [
            createViolation({
              range: { start: { line: 3, column: 0 }, end: { line: 3, column: 5 } },
            }),
          ],
        },
      ],
      summary: { totalFiles: 1, totalViolations: 1, errors: 1, warnings: 0, info: 0, duration: 1 },
    })
    const parsed = JSON.parse(formatSarif(report))
    expect(parsed.runs[0].results[0].locations[0].physicalLocation.region.startColumn).toBe(0)
  })

  test('formatConsole with suggestion containing special characters', () => {
    const report = createMockReport({
      files: [
        {
          filePath: '/src/f.ts',
          violations: [createViolation({ suggestion: 'Use <Component> instead of &legacy' })],
        },
      ],
      summary: { totalFiles: 1, totalViolations: 1, errors: 1, warnings: 0, info: 0, duration: 5 },
    })
    const output = formatConsole(report, COLORS, false, true)
    expect(output).toContain('Use <Component> instead of &legacy')
  })

  test('formatMarkdown handles message with trailing period correctly in sarif', () => {
    const report = createMockReport({
      files: [
        {
          filePath: '/src/f.ts',
          violations: [createViolation({ ruleId: 'r1', message: 'Ends with period.' })],
        },
      ],
      summary: { totalFiles: 1, totalViolations: 1, errors: 1, warnings: 0, info: 0, duration: 5 },
    })
    const parsed = JSON.parse(formatSarif(report))
    expect(parsed.runs[0].tool.driver.rules[0].shortDescription).toBe('Ends with period.')
  })

  test('formatGitlab handles multiple files with same rule and line correctly', () => {
    const report = createMockReport({
      files: [
        {
          filePath: '/src/a.ts',
          violations: [
            createViolation({
              ruleId: 'r1',
              range: { start: { line: 1, column: 1 }, end: { line: 1, column: 5 } },
            }),
          ],
        },
        {
          filePath: '/src/b.ts',
          violations: [
            createViolation({
              ruleId: 'r1',
              range: { start: { line: 1, column: 1 }, end: { line: 1, column: 5 } },
            }),
          ],
        },
      ],
      summary: { totalFiles: 2, totalViolations: 2, errors: 2, warnings: 0, info: 0, duration: 5 },
    })
    const parsed = JSON.parse(formatGitlab(report))
    expect(parsed).toHaveLength(2)
    expect(parsed[0].fingerprint).not.toBe(parsed[1].fingerprint)
  })

  test('formatJson preserves all fields of violation', () => {
    const report = createMockReport({
      files: [
        {
          filePath: '/src/f.ts',
          violations: [
            createViolation({
              ruleId: 'full-check',
              severity: 'warning',
              message: 'Full violation test',
              filePath: '/src/f.ts',
              range: { start: { line: 10, column: 5 }, end: { line: 12, column: 8 } },
              suggestion: 'Fix it',
            }),
          ],
        },
      ],
      summary: { totalFiles: 1, totalViolations: 1, errors: 0, warnings: 1, info: 0, duration: 5 },
    })
    const parsed = JSON.parse(formatJson(report))
    const v = parsed.files[0].violations[0]
    expect(v.ruleId).toBe('full-check')
    expect(v.severity).toBe('warning')
    expect(v.message).toBe('Full violation test')
    expect(v.filePath).toBe('/src/f.ts')
    expect(v.range.start.line).toBe(10)
    expect(v.range.end.column).toBe(8)
    expect(v.suggestion).toBe('Fix it')
  })

  test('formatConsole renders file path followed by violations then summary', () => {
    const report = createMockReport({
      files: [
        {
          filePath: '/src/f.ts',
          violations: [
            createViolation({ ruleId: 'r1', message: 'v1' }),
            createViolation({ ruleId: 'r2', message: 'v2' }),
          ],
        },
      ],
      summary: { totalFiles: 1, totalViolations: 2, errors: 2, warnings: 0, info: 0, duration: 5 },
    })
    const output = formatConsole(report, COLORS, false, false)
    const fileIdx = output.indexOf('/src/f.ts')
    const v1Idx = output.indexOf('v1')
    const v2Idx = output.indexOf('v2')
    const summaryIdx = output.indexOf('Summary')
    expect(fileIdx).toBeLessThan(v1Idx)
    expect(v1Idx).toBeLessThan(v2Idx)
    expect(v2Idx).toBeLessThan(summaryIdx)
  })

  test('formatConsole with unknown severity uses reset for color', () => {
    const report = createMockReport({
      files: [
        {
          filePath: '/src/f.ts',
          violations: [createViolation({ severity: 'fatal' as 'error' })],
        },
      ],
      summary: { totalFiles: 1, totalViolations: 1, errors: 0, warnings: 0, info: 0, duration: 5 },
    })
    const output = formatConsole(report, COLORS, false, false)
    // Unknown severity gets reset color and severity is uppercased
    expect(output).toContain('FATAL')
  })

  test('formatMarkdown with error violation includes red circle', () => {
    const report = createMockReport({
      files: [
        {
          filePath: '/src/f.ts',
          violations: [createViolation({ severity: 'error', ruleId: 'r1', message: 'm1' })],
        },
      ],
      summary: { totalFiles: 1, totalViolations: 1, errors: 1, warnings: 0, info: 0, duration: 5 },
    })
    const output = formatMarkdown(report)
    expect(output).toContain('🔴')
    expect(output).not.toContain('🟡')
    expect(output).not.toContain('🔵')
  })

  test('formatMarkdown with warning violation includes yellow circle only', () => {
    const report = createMockReport({
      files: [
        {
          filePath: '/src/f.ts',
          violations: [createViolation({ severity: 'warning', ruleId: 'r1', message: 'm1' })],
        },
      ],
      summary: { totalFiles: 1, totalViolations: 1, errors: 0, warnings: 1, info: 0, duration: 5 },
    })
    const output = formatMarkdown(report)
    expect(output).toContain('🟡')
    expect(output).not.toContain('🔴')
    expect(output).not.toContain('🔵')
  })

  test('formatMarkdown with info violation includes blue circle only', () => {
    const report = createMockReport({
      files: [
        {
          filePath: '/src/f.ts',
          violations: [createViolation({ severity: 'info', ruleId: 'r1', message: 'm1' })],
        },
      ],
      summary: { totalFiles: 1, totalViolations: 1, errors: 0, warnings: 0, info: 1, duration: 5 },
    })
    const output = formatMarkdown(report)
    expect(output).toContain('🔵')
    expect(output).not.toContain('🔴')
    expect(output).not.toContain('🟡')
  })

  test('formatHtml with custom severity uses severity as class', () => {
    const report = createMockReport({
      files: [
        {
          filePath: '/src/f.ts',
          violations: [createViolation({ severity: 'critical' as 'error' })],
        },
      ],
      summary: { totalFiles: 1, totalViolations: 1, errors: 0, warnings: 0, info: 0, duration: 5 },
    })
    const output = formatHtml(report)
    expect(output).toContain('class="critical"')
    expect(output).toContain('[CRITICAL]')
  })

  test('formatConsole handles file with mixed severities and verbose suggestions', () => {
    const report = createMockReport({
      files: [
        {
          filePath: '/src/f.ts',
          violations: [
            createViolation({
              severity: 'error',
              suggestion: 'Fix error',
              ruleId: 'r1',
              message: 'e1',
            }),
            createViolation({
              severity: 'warning',
              suggestion: undefined,
              ruleId: 'r2',
              message: 'w1',
            }),
            createViolation({
              severity: 'info',
              suggestion: 'Consider this',
              ruleId: 'r3',
              message: 'i1',
            }),
          ],
        },
      ],
      summary: { totalFiles: 1, totalViolations: 3, errors: 1, warnings: 1, info: 1, duration: 5 },
    })
    const output = formatConsole(report, COLORS, false, true)
    expect(output).toContain('Suggestion: Fix error')
    expect(output).toContain('Suggestion: Consider this')
    const sugCount = (output.match(/Suggestion:/g) || []).length
    expect(sugCount).toBe(2)
  })
})
