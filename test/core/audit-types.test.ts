import { describe, expect, it } from 'vitest'

import {
  DEFAULT_AUDIT_CONFIG,
  type AuditConfig,
  type AuditEntry,
  type AuditLog,
  type ComplianceReport,
} from '../../src/core/audit-types.js'

// ─── DEFAULT_AUDIT_CONFIG ───

describe('DEFAULT_AUDIT_CONFIG', () => {
  it('has enabled set to true', () => {
    expect(DEFAULT_AUDIT_CONFIG.enabled).toBe(true)
  })

  it('has logDir set to .codeforge/audit', () => {
    expect(DEFAULT_AUDIT_CONFIG.logDir).toBe('.codeforge/audit')
  })

  it('has maxEntries set to 1000', () => {
    expect(DEFAULT_AUDIT_CONFIG.maxEntries).toBe(1000)
  })

  it('has exactly 3 properties', () => {
    expect(Object.keys(DEFAULT_AUDIT_CONFIG)).toHaveLength(3)
  })
})

// ─── Type Shape Tests ───

describe('AuditConfig type', () => {
  it('accepts valid config', () => {
    const config: AuditConfig = {
      enabled: false,
      logDir: '/tmp/audit',
      maxEntries: 500,
    }
    expect(config.enabled).toBe(false)
    expect(config.logDir).toBe('/tmp/audit')
    expect(config.maxEntries).toBe(500)
  })
})

describe('AuditEntry type', () => {
  it('accepts valid entry with all fields', () => {
    const entry: AuditEntry = {
      id: 'test-1',
      timestamp: '2025-01-01T00:00:00Z',
      command: 'analyze',
      filesAnalyzed: 10,
      filesWithViolations: 3,
      totalViolations: 7,
      errorCount: 2,
      warningCount: 3,
      infoCount: 2,
      rulesRun: ['no-eval', 'max-params'],
      durationMs: 1500,
      exitCode: 0,
      configPath: '.codeforgerc.json',
      user: 'testuser',
    }
    expect(entry.id).toBe('test-1')
    expect(entry.totalViolations).toBe(7)
    expect(entry.rulesRun).toHaveLength(2)
    expect(entry.configPath).toBe('.codeforgerc.json')
  })

  it('accepts entry with null configPath and user', () => {
    const entry: AuditEntry = {
      id: 'test-2',
      timestamp: '2025-01-01T00:00:00Z',
      command: 'analyze',
      filesAnalyzed: 0,
      filesWithViolations: 0,
      totalViolations: 0,
      errorCount: 0,
      warningCount: 0,
      infoCount: 0,
      rulesRun: [],
      durationMs: 0,
      exitCode: 1,
      configPath: null,
      user: null,
    }
    expect(entry.configPath).toBeNull()
    expect(entry.user).toBeNull()
  })
})

describe('AuditLog type', () => {
  it('accepts valid log with version 1', () => {
    const log: AuditLog = {
      version: 1,
      entries: [],
    }
    expect(log.version).toBe(1)
    expect(log.entries).toEqual([])
  })
})

describe('ComplianceReport type', () => {
  it('accepts valid report', () => {
    const report: ComplianceReport = {
      generatedAt: '2025-01-01T00:00:00Z',
      period: { from: '2025-01-01', to: '2025-01-31' },
      totalRuns: 10,
      totalViolations: 50,
      errorTrend: [5, 3, 7, 2],
      topViolatedRules: [{ ruleId: 'no-eval', count: 15 }],
      topViolatedFiles: [{ filePath: 'src/index.ts', count: 10 }],
      averageViolationsPerRun: 5,
      passRate: 0.8,
    }
    expect(report.totalRuns).toBe(10)
    expect(report.topViolatedRules).toHaveLength(1)
    expect(report.passRate).toBeCloseTo(0.8)
  })
})
