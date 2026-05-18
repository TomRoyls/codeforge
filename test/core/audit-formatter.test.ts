import { describe, expect, it } from 'vitest'

import {
  formatAuditEntryShort,
  formatComplianceReportJSON,
  formatComplianceReportMarkdown,
} from '../../src/core/audit-formatter.js'

import type { AuditEntry, ComplianceReport } from '../../src/core/audit-types.js'

// ─── Helpers ───

function makeReport(overrides: Partial<ComplianceReport> = {}): ComplianceReport {
  return {
    averageViolationsPerRun: 5.5,
    errorTrend: [3, 5, 2],
    generatedAt: '2025-01-01',
    passRate: 0.85,
    period: { from: '2025-01-01', to: '2025-01-31' },
    topViolatedFiles: [{ filePath: 'src/a.ts', count: 10 }],
    topViolatedRules: [{ ruleId: 'no-console', count: 5 }],
    totalRuns: 10,
    totalViolations: 55,
    ...overrides,
  }
}

function makeEntry(overrides: Partial<AuditEntry> = {}): AuditEntry {
  return {
    command: 'analyze',
    configPath: null,
    durationMs: 100,
    errorCount: 2,
    exitCode: 0,
    filesAnalyzed: 50,
    filesWithViolations: 10,
    id: 'abc123',
    infoCount: 5,
    rulesRun: ['no-console', 'max-params'],
    timestamp: '2025-01-01T00:00:00.000Z',
    totalViolations: 8,
    user: 'testuser',
    warningCount: 1,
    ...overrides,
  }
}

// ─── formatComplianceReportMarkdown ───

describe('formatComplianceReportMarkdown', () => {
  it('includes header', () => {
    const output = formatComplianceReportMarkdown(makeReport())
    expect(output).toContain('# CodeForge Compliance Report')
  })

  it('includes period', () => {
    const output = formatComplianceReportMarkdown(makeReport())
    expect(output).toContain('2025-01-01')
    expect(output).toContain('2025-01-31')
  })

  it('includes summary table', () => {
    const output = formatComplianceReportMarkdown(makeReport())
    expect(output).toContain('Total Runs')
    expect(output).toContain('Total Violations')
    expect(output).toContain('Pass Rate')
  })

  it('includes top violated rules', () => {
    const output = formatComplianceReportMarkdown(makeReport())
    expect(output).toContain('no-console')
  })

  it('handles empty rules', () => {
    const output = formatComplianceReportMarkdown(makeReport({ topViolatedRules: [] }))
    expect(output).toContain('No rule violations')
  })

  it('includes top violated files', () => {
    const output = formatComplianceReportMarkdown(makeReport())
    expect(output).toContain('src/a.ts')
  })

  it('handles empty files', () => {
    const output = formatComplianceReportMarkdown(makeReport({ topViolatedFiles: [] }))
    expect(output).toContain('No file violations')
  })

  it('includes error trend', () => {
    const output = formatComplianceReportMarkdown(makeReport())
    expect(output).toContain('3, 5, 2')
  })

  it('includes violation distribution bars', () => {
    const output = formatComplianceReportMarkdown(makeReport())
    expect(output).toContain('Run 1:')
    expect(output).toContain('Run 2:')
  })
})

// ─── formatComplianceReportJSON ───

describe('formatComplianceReportJSON', () => {
  it('returns valid JSON', () => {
    const output = formatComplianceReportJSON(makeReport())
    const parsed = JSON.parse(output)
    expect(parsed.totalRuns).toBe(10)
  })

  it('includes all fields', () => {
    const output = formatComplianceReportJSON(makeReport())
    const parsed = JSON.parse(output)
    expect(parsed.generatedAt).toBe('2025-01-01')
    expect(parsed.period).toBeDefined()
  })
})

// ─── formatAuditEntryShort ───

describe('formatAuditEntryShort', () => {
  it('formats entry as single line', () => {
    const entry = makeEntry()
    const output = formatAuditEntryShort(entry)
    expect(output).toContain('analyze')
    expect(output).toContain('50 files')
    expect(output).toContain('8 violations')
    expect(output).toContain('2 errors')
    expect(output).toContain('1 warnings')
    expect(output).toContain('exit 0')
  })

  it('includes timestamp', () => {
    const entry = makeEntry()
    const output = formatAuditEntryShort(entry)
    expect(output).toContain('2025-01-01')
  })
})
