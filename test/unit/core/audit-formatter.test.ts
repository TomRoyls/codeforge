import { describe, expect, test } from 'vitest'

import type { AuditEntry, ComplianceReport } from '../../../src/core/audit-types.js'

import {
  formatAuditEntryShort,
  formatComplianceReportJSON,
  formatComplianceReportMarkdown,
} from '../../../src/core/audit-formatter.js'

function makeReport(overrides?: Partial<ComplianceReport>): ComplianceReport {
  return {
    generatedAt: '2024-06-15T12:00:00.000Z',
    period: { from: '2024-01-01T00:00:00.000Z', to: '2024-12-31T23:59:59.000Z' },
    totalRuns: 10,
    totalViolations: 45,
    errorTrend: [5, 8, 3, 12, 6, 2, 4, 1, 3, 1],
    topViolatedRules: [
      { ruleId: 'no-eval', count: 15 },
      { ruleId: 'prefer-const', count: 10 },
    ],
    topViolatedFiles: [
      { filePath: 'src/legacy.ts', count: 8 },
      { filePath: 'src/utils.ts', count: 5 },
    ],
    averageViolationsPerRun: 4.5,
    passRate: 0.6,
    ...overrides,
  }
}

function makeEntry(overrides?: Partial<AuditEntry>): AuditEntry {
  return {
    id: 'abc123',
    timestamp: '2024-06-15T12:00:00.000Z',
    command: 'analyze',
    filesAnalyzed: 10,
    filesWithViolations: 3,
    totalViolations: 5,
    errorCount: 1,
    warningCount: 2,
    infoCount: 2,
    rulesRun: ['no-eval'],
    durationMs: 150,
    exitCode: 0,
    configPath: null,
    user: null,
    ...overrides,
  }
}

describe('formatComplianceReportMarkdown', () => {
  test('contains header', () => {
    const md = formatComplianceReportMarkdown(makeReport())
    expect(md).toContain('# CodeForge Compliance Report')
  })

  test('contains generation date', () => {
    const md = formatComplianceReportMarkdown(makeReport())
    expect(md).toContain('**Generated:** 2024-06-15T12:00:00.000Z')
  })

  test('contains period', () => {
    const md = formatComplianceReportMarkdown(makeReport())
    expect(md).toContain('2024-01-01T00:00:00.000Z')
    expect(md).toContain('2024-12-31T23:59:59.000Z')
  })

  test('contains total runs', () => {
    const md = formatComplianceReportMarkdown(makeReport())
    expect(md).toContain('10')
  })

  test('contains pass rate', () => {
    const md = formatComplianceReportMarkdown(makeReport())
    expect(md).toContain('60.0%')
  })

  test('contains average violations', () => {
    const md = formatComplianceReportMarkdown(makeReport())
    expect(md).toContain('4.50')
  })

  test('has table headers for rules', () => {
    const md = formatComplianceReportMarkdown(makeReport())
    expect(md).toContain('| Rule ID | Count |')
  })

  test('has table headers for files', () => {
    const md = formatComplianceReportMarkdown(makeReport())
    expect(md).toContain('| File | Count |')
  })

  test('contains error trend', () => {
    const md = formatComplianceReportMarkdown(makeReport())
    expect(md).toContain('5, 8, 3, 12, 6, 2, 4, 1, 3, 1')
  })

  test('contains bar chart', () => {
    const md = formatComplianceReportMarkdown(makeReport())
    expect(md).toContain('\u2588')
  })

  test('with zero runs', () => {
    const report = makeReport({
      totalRuns: 0,
      totalViolations: 0,
      errorTrend: [],
      topViolatedRules: [],
      topViolatedFiles: [],
      averageViolationsPerRun: 0,
      passRate: 0,
    })
    const md = formatComplianceReportMarkdown(report)
    expect(md).toContain('No rule violations recorded.')
    expect(md).toContain('No file violations recorded.')
    expect(md).not.toContain('## Violation Distribution')
  })

  test('with single run', () => {
    const report = makeReport({
      totalRuns: 1,
      totalViolations: 3,
      errorTrend: [3],
      topViolatedRules: [{ ruleId: 'no-eval', count: 1 }],
      topViolatedFiles: [{ filePath: 'a.ts', count: 1 }],
      averageViolationsPerRun: 3,
      passRate: 0,
    })
    const md = formatComplianceReportMarkdown(report)
    expect(md).toContain('Run 1:')
    expect(md).toContain('no-eval')
    expect(md).toContain('a.ts')
  })

  test('with many runs has all run entries', () => {
    const trend = Array.from({ length: 20 }, (_, i) => i + 1)
    const report = makeReport({ errorTrend: trend, totalRuns: 20 })
    const md = formatComplianceReportMarkdown(report)
    expect(md).toContain('Run 20:')
    expect(md).toContain('Run 1:')
  })

  test('topViolatedRules rendered in order', () => {
    const report = makeReport({
      topViolatedRules: [
        { ruleId: 'rule-z', count: 30 },
        { ruleId: 'rule-a', count: 10 },
      ],
    })
    const md = formatComplianceReportMarkdown(report)
    const zPos = md.indexOf('rule-z')
    const aPos = md.indexOf('rule-a')
    expect(zPos).toBeLessThan(aPos)
  })

  test('topViolatedFiles rendered in order', () => {
    const report = makeReport({
      topViolatedFiles: [
        { filePath: 'big-file.ts', count: 50 },
        { filePath: 'small-file.ts', count: 5 },
      ],
    })
    const md = formatComplianceReportMarkdown(report)
    const bigPos = md.indexOf('big-file.ts')
    const smallPos = md.indexOf('small-file.ts')
    expect(bigPos).toBeLessThan(smallPos)
  })
})

describe('formatComplianceReportJSON', () => {
  test('produces valid JSON', () => {
    const json = formatComplianceReportJSON(makeReport())
    expect(() => JSON.parse(json)).not.toThrow()
  })

  test('has all required fields', () => {
    const json = formatComplianceReportJSON(makeReport())
    const parsed = JSON.parse(json) as ComplianceReport
    expect(parsed).toHaveProperty('generatedAt')
    expect(parsed).toHaveProperty('period')
    expect(parsed).toHaveProperty('totalRuns')
    expect(parsed).toHaveProperty('totalViolations')
    expect(parsed).toHaveProperty('errorTrend')
    expect(parsed).toHaveProperty('topViolatedRules')
    expect(parsed).toHaveProperty('topViolatedFiles')
    expect(parsed).toHaveProperty('averageViolationsPerRun')
    expect(parsed).toHaveProperty('passRate')
  })

  test('uses 2-space indent', () => {
    const json = formatComplianceReportJSON(makeReport())
    expect(json).toContain('  "generatedAt"')
  })

  test('preserves numeric values', () => {
    const json = formatComplianceReportJSON(makeReport())
    const parsed = JSON.parse(json) as ComplianceReport
    expect(parsed.totalRuns).toBe(10)
    expect(parsed.passRate).toBe(0.6)
  })
})

describe('formatAuditEntryShort', () => {
  test('is single line', () => {
    const result = formatAuditEntryShort(makeEntry())
    expect(result).not.toContain('\n')
  })

  test('contains command name', () => {
    const result = formatAuditEntryShort(makeEntry({ command: 'lint' }))
    expect(result).toContain('lint')
  })

  test('contains file count', () => {
    const result = formatAuditEntryShort(makeEntry({ filesAnalyzed: 42 }))
    expect(result).toContain('42 files')
  })

  test('contains violation count', () => {
    const result = formatAuditEntryShort(makeEntry({ totalViolations: 7 }))
    expect(result).toContain('7 violations')
  })

  test('contains error and warning counts', () => {
    const result = formatAuditEntryShort(makeEntry({ errorCount: 3, warningCount: 5 }))
    expect(result).toContain('3 errors')
    expect(result).toContain('5 warnings')
  })

  test('contains exit code', () => {
    const result = formatAuditEntryShort(makeEntry({ exitCode: 1 }))
    expect(result).toContain('exit 1')
  })

  test('contains timestamp', () => {
    const result = formatAuditEntryShort(makeEntry())
    expect(result).toContain('[2024-06-15T12:00:00.000Z]')
  })
})
