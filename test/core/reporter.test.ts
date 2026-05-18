import { describe, expect, it } from 'vitest'

import type { AnalysisReport, ReporterOptions } from '../../src/core/reporter.js'

import { Reporter } from '../../src/core/reporter.js'

// ─── Helpers ───

function makeViolation(overrides: Record<string, unknown> = {}) {
  return {
    filePath: overrides.filePath ?? 'src/foo.ts',
    message: overrides.message ?? 'Something is wrong',
    range: {
      start: { line: 10, column: 5 },
      end: { line: 10, column: 20 },
    },
    ruleId: overrides.ruleId ?? 'no-eval',
    severity: overrides.severity ?? 'error',
    ...(overrides.suggestion ? { suggestion: overrides.suggestion } : {}),
  }
}

function makeReport(overrides: Partial<AnalysisReport> = {}): AnalysisReport {
  return {
    files: overrides.files ?? [],
    summary: overrides.summary ?? {
      totalFiles: 0,
      totalViolations: 0,
      errors: 0,
      warnings: 0,
      info: 0,
      duration: 42.5,
    },
  }
}

function makeOptions(overrides: Partial<ReporterOptions> = {}): ReporterOptions {
  return {
    format: overrides.format ?? 'console',
    quiet: overrides.quite ?? false,
    verbose: overrides.verbose ?? false,
    ...overrides,
  }
}

// ─── formatReport dispatch ───

describe('Reporter.formatReport', () => {
  it('dispatches to console format', () => {
    const reporter = new Reporter(makeOptions({ format: 'console' }))
    const report = makeReport()
    const result = reporter.formatReport(report)
    expect(result).toContain('CodeForge Analysis Report')
  })

  it('dispatches to json format', () => {
    const reporter = new Reporter(makeOptions({ format: 'json' }))
    const report = makeReport({
      files: [{ filePath: 'src/a.ts', violations: [] }],
    })
    const result = reporter.formatReport(report)
    const parsed = JSON.parse(result) as AnalysisReport
    expect(parsed.files).toHaveLength(1)
  })

  it('dispatches to csv format', () => {
    const reporter = new Reporter(makeOptions({ format: 'csv' }))
    const report = makeReport()
    const result = reporter.formatReport(report)
    expect(result).toContain('filePath,line,column')
  })

  it('dispatches to junit format', () => {
    const reporter = new Reporter(makeOptions({ format: 'junit' }))
    const report = makeReport()
    const result = reporter.formatReport(report)
    expect(result).toContain('<?xml version')
  })

  it('dispatches to sarif format', () => {
    const reporter = new Reporter(makeOptions({ format: 'sarif' }))
    const report = makeReport()
    const result = reporter.formatReport(report)
    const parsed = JSON.parse(result) as Record<string, unknown>
    expect(parsed.version).toBe('2.1.0')
  })

  it('dispatches to gitlab format', () => {
    const reporter = new Reporter(makeOptions({ format: 'gitlab' }))
    const report = makeReport()
    const result = reporter.formatReport(report)
    expect(JSON.parse(result)).toEqual([])
  })

  it('dispatches to html format', () => {
    const reporter = new Reporter(makeOptions({ format: 'html' }))
    const report = makeReport()
    const result = reporter.formatReport(report)
    expect(result).toContain('<!DOCTYPE html>')
  })

  it('dispatches to markdown format', () => {
    const reporter = new Reporter(makeOptions({ format: 'markdown' }))
    const report = makeReport()
    const result = reporter.formatReport(report)
    expect(result).toContain('# CodeForge Analysis Report')
  })

  it('dispatches to sonarqube format', () => {
    const reporter = new Reporter(makeOptions({ format: 'sonarqube' }))
    const report = makeReport()
    const result = reporter.formatReport(report)
    const parsed = JSON.parse(result) as Record<string, unknown>
    expect(parsed).toHaveProperty('issues')
  })

  it('throws for unsupported format', () => {
    const reporter = new Reporter(makeOptions({ format: 'yaml' as any }))
    expect(() => reporter.formatReport(makeReport())).toThrow('Unsupported output format')
  })
})

// ─── color handling ───

describe('Reporter color handling', () => {
  it('produces output without colors when color is false', () => {
    const reporter = new Reporter(makeOptions({ format: 'console', color: false }))
    const report = makeReport({
      files: [{
        filePath: 'src/app.ts',
        violations: [makeViolation()],
      }],
    })
    const result = reporter.formatReport(report)
    expect(result).not.toContain('\u001B[')
  })

  it('produces output with colors by default', () => {
    const reporter = new Reporter(makeOptions({ format: 'console' }))
    const report = makeReport({
      files: [{
        filePath: 'src/app.ts',
        violations: [makeViolation()],
      }],
    })
    const result = reporter.formatReport(report)
    expect(result).toContain('\u001B[')
  })
})

// ─── writeReport ───

describe('Reporter.writeReport', () => {
  it('writes report to file', async () => {
    const tmpFile = `/tmp/codeforge-report-${Date.now()}.txt`
    const reporter = new Reporter(makeOptions({ format: 'json', outputPath: tmpFile }))
    const report = makeReport({
      files: [{ filePath: 'src/a.ts', violations: [] }],
    })
    await reporter.writeReport(report)
    const { readFile, unlink } = await import('node:fs/promises')
    const content = await readFile(tmpFile, 'utf-8')
    expect(content).toContain('src/a.ts')
    await unlink(tmpFile)
  })
})

// ─── quiet mode ───

describe('Reporter quiet mode', () => {
  it('omits header in console format when quiet', () => {
    const reporter = new Reporter(makeOptions({ format: 'console', quiet: true }))
    const report = makeReport()
    const result = reporter.formatReport(report)
    expect(result).not.toContain('CodeForge Analysis Report')
  })

  it('still shows summary when quiet', () => {
    const reporter = new Reporter(makeOptions({ format: 'console', quiet: true }))
    const report = makeReport()
    const result = reporter.formatReport(report)
    expect(result).toContain('Summary')
  })
})
