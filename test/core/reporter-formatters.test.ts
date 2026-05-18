import { describe, expect, it } from 'vitest'

import type { AnalysisReport } from '../../src/core/reporter.js'

import {
  COLORS,
  formatConsole,
  formatCsv,
  formatGitlab,
  formatHtml,
  formatJson,
  formatJunit,
  formatMarkdown,
  formatSarif,
  formatSonarqube,
} from '../../src/core/reporter-formatters.js'

// ─── Helpers ───

function makeViolation(overrides: Partial<{
  filePath: string
  message: string
  ruleId: string
  severity: 'error' | 'warning' | 'info'
  suggestion: string
}> = {}) {
  return {
    filePath: overrides.filePath ?? 'src/foo.ts',
    message: overrides.message ?? 'Something is wrong',
    range: {
      start: { line: 10, column: 5 },
      end: { line: 10, column: 20 },
    },
    ruleId: overrides.ruleId ?? 'no-eval',
    severity: overrides.severity ?? 'error' as const,
    ...(overrides.suggestion !== undefined ? { suggestion: overrides.suggestion } : {}),
  }
}

function makeReport(overrides: Partial<{
  files: AnalysisReport['files']
  totalFiles: number
  errors: number
  warnings: number
  info: number
}> = {}): AnalysisReport {
  return {
    files: overrides.files ?? [],
    summary: {
      totalFiles: overrides.totalFiles ?? 0,
      totalViolations: overrides.errors ?? 0 + (overrides.warnings ?? 0) + (overrides.info ?? 0),
      errors: overrides.errors ?? 0,
      warnings: overrides.warnings ?? 0,
      info: overrides.info ?? 0,
      duration: 42.5,
    },
  }
}

// ─── COLORS ───

describe('COLORS', () => {
  it('has expected color escape codes', () => {
    expect(COLORS.blue).toBe('\u001B[34m')
    expect(COLORS.bold).toBe('\u001B[1m')
    expect(COLORS.dim).toBe('\u001B[2m')
    expect(COLORS.red).toBe('\u001B[31m')
    expect(COLORS.reset).toBe('\u001B[0m')
    expect(COLORS.yellow).toBe('\u001B[33m')
  })
})

// ─── formatJunit ───

describe('formatJunit', () => {
  it('produces valid XML header', () => {
    const report = makeReport()
    const result = formatJunit(report)
    expect(result).toContain('<?xml version="1.0" encoding="UTF-8"?>')
    expect(result).toContain('<testsuit name="codeforge-analysis"')
  })

  it('includes file test suites with violations', () => {
    const report = makeReport({
      files: [{
        filePath: 'src/app.ts',
        violations: [makeViolation({ ruleId: 'no-eval' })],
      }],
    })
    const result = formatJunit(report)
    expect(result).toContain('<testsuite name="src/app.ts"')
    expect(result).toContain('no-eval')
  })

  it('skips files with no violations', () => {
    const report = makeReport({
      files: [{ filePath: 'src/clean.ts', violations: [] }],
    })
    const result = formatJunit(report)
    expect(result).not.toContain('src/clean.ts')
  })

  it('escapes XML special characters in messages', () => {
    const report = makeReport({
      files: [{
        filePath: 'src/app.ts',
        violations: [makeViolation({ message: 'Use <foo> & "bar" properly' })],
      }],
    })
    const result = formatJunit(report)
    expect(result).toContain('&lt;foo&gt;')
    expect(result).toContain('&amp;')
    expect(result).toContain('&quot;bar&quot;')
  })

  it('closes with </testsuit> root element', () => {
    const report = makeReport()
    const result = formatJunit(report)
    expect(result.trim()).toMatch(/<\/testsuit>$/)
  })
})

// ─── formatSarif ───

describe('formatSarif', () => {
  it('produces valid SARIF JSON', () => {
    const report = makeReport({
      files: [{
        filePath: 'src/app.ts',
        violations: [makeViolation()],
      }],
    })
    const result = formatSarif(report)
    const parsed = JSON.parse(result) as Record<string, unknown>
    expect(parsed.version).toBe('2.1.0')
    expect(parsed.$schema).toContain('sarif-schema-2.1.0.json')
  })

  it('maps error severity to error level', () => {
    const report = makeReport({
      files: [{
        filePath: 'src/app.ts',
        violations: [makeViolation({ severity: 'error' })],
      }],
    })
    const result = JSON.parse(formatSarif(report)) as any
    expect(result.runs[0].results[0].level).toBe('error')
  })

  it('maps warning severity to warning level', () => {
    const report = makeReport({
      files: [{
        filePath: 'src/app.ts',
        violations: [makeViolation({ severity: 'warning' })],
      }],
    })
    const result = JSON.parse(formatSarif(report)) as any
    expect(result.runs[0].results[0].level).toBe('warning')
  })

  it('maps info severity to note level', () => {
    const report = makeReport({
      files: [{
        filePath: 'src/app.ts',
        violations: [makeViolation({ severity: 'info' })],
      }],
    })
    const result = JSON.parse(formatSarif(report)) as any
    expect(result.runs[0].results[0].level).toBe('note')
  })

  it('extracts unique rules', () => {
    const report = makeReport({
      files: [{
        filePath: 'src/app.ts',
        violations: [
          makeViolation({ ruleId: 'no-eval' }),
          makeViolation({ ruleId: 'no-eval' }),
          makeViolation({ ruleId: 'max-params' }),
        ],
      }],
    })
    const result = JSON.parse(formatSarif(report)) as any
    const rules = result.runs[0].tool.driver.rules
    expect(rules).toHaveLength(2)
  })

  it('returns empty results for no violations', () => {
    const report = makeReport()
    const result = JSON.parse(formatSarif(report)) as any
    expect(result.runs[0].results).toEqual([])
  })
})

// ─── formatMarkdown ───

describe('formatMarkdown', () => {
  it('includes report header', () => {
    const report = makeReport()
    const result = formatMarkdown(report)
    expect(result).toContain('# CodeForge Analysis Report')
  })

  it('includes summary table', () => {
    const report = makeReport({ totalFiles: 5, errors: 1, warnings: 2, info: 3 })
    const result = formatMarkdown(report)
    expect(result).toContain('Total Files Analyzed')
    expect(result).toContain('5')
    expect(result).toContain('Errors')
    expect(result).toContain('1')
  })

  it('shows violation details with severity icons', () => {
    const report = makeReport({
      files: [{
        filePath: 'src/app.ts',
        violations: [
          makeViolation({ severity: 'error', message: 'Bad code' }),
          makeViolation({ severity: 'warning', message: 'Meh code' }),
          makeViolation({ severity: 'info', message: 'FYI code' }),
        ],
      }],
    })
    const result = formatMarkdown(report)
    expect(result).toContain('🔴')
    expect(result).toContain('🟡')
    expect(result).toContain('🔵')
  })

  it('shows no violations message when clean', () => {
    const report = makeReport({ files: [{ filePath: 'src/clean.ts', violations: [] }] })
    const result = formatMarkdown(report)
    expect(result).toContain('✅ No violations found!')
  })

  it('includes footer', () => {
    const report = makeReport()
    const result = formatMarkdown(report)
    expect(result).toContain('Generated by [CodeForge]')
  })
})

// ─── formatGitlab ───

describe('formatGitlab', () => {
  it('produces valid JSON array', () => {
    const report = makeReport({
      files: [{
        filePath: 'src/app.ts',
        violations: [makeViolation()],
      }],
    })
    const result = JSON.parse(formatGitlab(report)) as any[]
    expect(Array.isArray(result)).toBe(true)
    expect(result).toHaveLength(1)
  })

  it('maps error severity to critical', () => {
    const report = makeReport({
      files: [{
        filePath: 'src/app.ts',
        violations: [makeViolation({ severity: 'error' })],
      }],
    })
    const result = JSON.parse(formatGitlab(report)) as any[]
    expect(result[0].severity).toBe('critical')
  })

  it('maps warning severity to major', () => {
    const report = makeReport({
      files: [{
        filePath: 'src/app.ts',
        violations: [makeViolation({ severity: 'warning' })],
      }],
    })
    const result = JSON.parse(formatGitlab(report)) as any[]
    expect(result[0].severity).toBe('major')
  })

  it('maps info severity to minor', () => {
    const report = makeReport({
      files: [{
        filePath: 'src/app.ts',
        violations: [makeViolation({ severity: 'info' })],
      }],
    })
    const result = JSON.parse(formatGitlab(report)) as any[]
    expect(result[0].severity).toBe('minor')
  })

  it('includes fingerprint with file:rule:line', () => {
    const report = makeReport({
      files: [{
        filePath: 'src/app.ts',
        violations: [makeViolation({ ruleId: 'no-eval' })],
      }],
    })
    const result = JSON.parse(formatGitlab(report)) as any[]
    expect(result[0].fingerprint).toContain('src/app.ts')
    expect(result[0].fingerprint).toContain('no-eval')
  })

  it('returns empty array for no violations', () => {
    const report = makeReport()
    const result = JSON.parse(formatGitlab(report)) as any[]
    expect(result).toEqual([])
  })
})

// ─── formatJson ───

describe('formatJson', () => {
  it('serializes the full report as JSON', () => {
    const report = makeReport({
      files: [{
        filePath: 'src/app.ts',
        violations: [makeViolation()],
      }],
    })
    const result = JSON.parse(formatJson(report)) as AnalysisReport
    expect(result.files).toHaveLength(1)
    expect(result.files[0]!.filePath).toBe('src/app.ts')
  })
})

// ─── formatCsv ───

describe('formatCsv', () => {
  it('has correct header row', () => {
    const report = makeReport()
    const result = formatCsv(report)
    const firstLine = result.split('\n')[0]!
    expect(firstLine).toBe('filePath,line,column,endLine,endColumn,severity,ruleId,message,suggestion')
  })

  it('includes violation data rows', () => {
    const report = makeReport({
      files: [{
        filePath: 'src/app.ts',
        violations: [makeViolation({ ruleId: 'no-eval', severity: 'error' })],
      }],
    })
    const result = formatCsv(report)
    const lines = result.split('\n')
    expect(lines).toHaveLength(2)
    expect(lines[1]).toContain('src/app.ts')
    expect(lines[1]).toContain('no-eval')
    expect(lines[1]).toContain('error')
  })

  it('escapes fields with commas', () => {
    const report = makeReport({
      files: [{
        filePath: 'src/app.ts',
        violations: [makeViolation({ message: 'has, comma' })],
      }],
    })
    const result = formatCsv(report)
    expect(result).toContain('"has, comma"')
  })

  it('escapes fields with double quotes', () => {
    const report = makeReport({
      files: [{
        filePath: 'src/app.ts',
        violations: [makeViolation({ message: 'has "quotes"' })],
      }],
    })
    const result = formatCsv(report)
    expect(result).toContain('"has ""quotes"""')
  })

  it('handles suggestion field', () => {
    const report = makeReport({
      files: [{
        filePath: 'src/app.ts',
        violations: [makeViolation({ suggestion: 'Use const instead' })],
      }],
    })
    const result = formatCsv(report)
    expect(result).toContain('Use const instead')
  })

  it('empty suggestion produces empty field', () => {
    const report = makeReport({
      files: [{
        filePath: 'src/app.ts',
        violations: [makeViolation()],
      }],
    })
    const result = formatCsv(report)
    const lines = result.split('\n')
    const fields = lines[1]!.split(',')
    expect(fields[fields.length - 1]).toBe('')
  })
})

// ─── formatSonarqube ───

describe('formatSonarqube', () => {
  it('produces JSON with issues array', () => {
    const report = makeReport({
      files: [{
        filePath: 'src/app.ts',
        violations: [makeViolation()],
      }],
    })
    const result = JSON.parse(formatSonarqube(report)) as any
    expect(result.issues).toHaveLength(1)
  })

  it('maps error severity to CRITICAL', () => {
    const report = makeReport({
      files: [{
        filePath: 'src/app.ts',
        violations: [makeViolation({ severity: 'error' })],
      }],
    })
    const result = JSON.parse(formatSonarqube(report)) as any
    expect(result.issues[0].severity).toBe('CRITICAL')
  })

  it('maps warning severity to MAJOR', () => {
    const report = makeReport({
      files: [{
        filePath: 'src/app.ts',
        violations: [makeViolation({ severity: 'warning' })],
      }],
    })
    const result = JSON.parse(formatSonarqube(report)) as any
    expect(result.issues[0].severity).toBe('MAJOR')
  })

  it('maps info severity to MINOR', () => {
    const report = makeReport({
      files: [{
        filePath: 'src/app.ts',
        violations: [makeViolation({ severity: 'info' })],
      }],
    })
    const result = JSON.parse(formatSonarqube(report)) as any
    expect(result.issues[0].severity).toBe('MINOR')
  })

  it('maps error type to BUG', () => {
    const report = makeReport({
      files: [{
        filePath: 'src/app.ts',
        violations: [makeViolation({ severity: 'error' })],
      }],
    })
    const result = JSON.parse(formatSonarqube(report)) as any
    expect(result.issues[0].type).toBe('BUG')
  })

  it('maps non-error type to CODE_SMELL', () => {
    const report = makeReport({
      files: [{
        filePath: 'src/app.ts',
        violations: [makeViolation({ severity: 'warning' })],
      }],
    })
    const result = JSON.parse(formatSonarqube(report)) as any
    expect(result.issues[0].type).toBe('CODE_SMELL')
  })

  it('includes engineId as CodeForge', () => {
    const report = makeReport({
      files: [{
        filePath: 'src/app.ts',
        violations: [makeViolation()],
      }],
    })
    const result = JSON.parse(formatSonarqube(report)) as any
    expect(result.issues[0].engineId).toBe('CodeForge')
  })

  it('returns empty issues for no violations', () => {
    const report = makeReport()
    const result = JSON.parse(formatSonarqube(report)) as any
    expect(result.issues).toEqual([])
  })
})

// ─── formatHtml ───

describe('formatHtml', () => {
  it('produces valid HTML structure', () => {
    const report = makeReport()
    const result = formatHtml(report)
    expect(result).toContain('<!DOCTYPE html>')
    expect(result).toContain('<html lang="en">')
    expect(result).toContain('</html>')
  })

  it('includes summary metrics', () => {
    const report = makeReport({ totalFiles: 10, errors: 3, warnings: 5, info: 2 })
    const result = formatHtml(report)
    expect(result).toContain('Files: 10')
    expect(result).toContain('Errors: 3')
    expect(result).toContain('Warnings: 5')
    expect(result).toContain('Info: 2')
  })

  it('shows violation details with severity class', () => {
    const report = makeReport({
      files: [{
        filePath: 'src/app.ts',
        violations: [makeViolation({ severity: 'error', message: 'Bad stuff' })],
      }],
    })
    const result = formatHtml(report)
    expect(result).toContain('class="error"')
    expect(result).toContain('[ERROR]')
    expect(result).toContain('Bad stuff')
  })

  it('skips files with no violations', () => {
    const report = makeReport({
      files: [{ filePath: 'src/clean.ts', violations: [] }],
    })
    const result = formatHtml(report)
    expect(result).not.toContain('src/clean.ts')
  })

  it('escapes HTML special characters', () => {
    const report = makeReport({
      files: [{
        filePath: 'src/app.ts',
        violations: [makeViolation({ message: '<script>alert("xss")</script>' })],
      }],
    })
    const result = formatHtml(report)
    expect(result).toContain('&lt;script&gt;')
    expect(result).not.toContain('<script>')
  })
})

// ─── formatConsole ───

describe('formatConsole', () => {
  const noColors = {
    blue: '', bold: '', dim: '', red: '', reset: '', yellow: '',
  }

  it('shows header when not quiet', () => {
    const report = makeReport()
    const result = formatConsole(report, noColors, false, false)
    expect(result).toContain('CodeForge Analysis Report')
  })

  it('hides header when quiet', () => {
    const report = makeReport()
    const result = formatConsole(report, noColors, true, false)
    expect(result).not.toContain('CodeForge Analysis Report')
  })

  it('shows file paths with violations', () => {
    const report = makeReport({
      files: [{
        filePath: 'src/app.ts',
        violations: [makeViolation()],
      }],
    })
    const result = formatConsole(report, noColors, false, false)
    expect(result).toContain('src/app.ts')
  })

  it('shows severity labels', () => {
    const report = makeReport({
      files: [{
        filePath: 'src/app.ts',
        violations: [
          makeViolation({ severity: 'error' }),
          makeViolation({ severity: 'warning' }),
          makeViolation({ severity: 'info' }),
        ],
      }],
    })
    const result = formatConsole(report, noColors, false, false)
    expect(result).toContain('ERROR')
    expect(result).toContain('WARNING')
    expect(result).toContain('INFO')
  })

  it('shows suggestion in verbose mode', () => {
    const report = makeReport({
      files: [{
        filePath: 'src/app.ts',
        violations: [makeViolation({ suggestion: 'Fix it now' })],
      }],
    })
    const result = formatConsole(report, noColors, false, true)
    expect(result).toContain('Suggestion: Fix it now')
  })

  it('hides suggestion in non-verbose mode', () => {
    const report = makeReport({
      files: [{
        filePath: 'src/app.ts',
        violations: [makeViolation({ suggestion: 'Fix it now' })],
      }],
    })
    const result = formatConsole(report, noColors, false, false)
    expect(result).not.toContain('Suggestion:')
  })

  it('includes summary section', () => {
    const report = makeReport({ totalFiles: 5, errors: 1, warnings: 2, info: 3 })
    const result = formatConsole(report, noColors, false, false)
    expect(result).toContain('Summary')
    expect(result).toContain('Files analyzed: 5')
    expect(result).toContain('Errors: 1')
  })
})
