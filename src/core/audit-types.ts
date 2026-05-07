export interface AuditEntry {
  id: string
  timestamp: string
  command: string
  filesAnalyzed: number
  filesWithViolations: number
  totalViolations: number
  errorCount: number
  warningCount: number
  infoCount: number
  rulesRun: string[]
  durationMs: number
  exitCode: number
  configPath: string | null
  user: string | null
}

export interface AuditLog {
  version: 1
  entries: AuditEntry[]
}

export interface ComplianceReport {
  generatedAt: string
  period: { from: string; to: string }
  totalRuns: number
  totalViolations: number
  errorTrend: number[]
  topViolatedRules: Array<{ ruleId: string; count: number }>
  topViolatedFiles: Array<{ filePath: string; count: number }>
  averageViolationsPerRun: number
  passRate: number
}

export interface AuditConfig {
  enabled: boolean
  logDir: string
  maxEntries: number
}

export const DEFAULT_AUDIT_CONFIG: AuditConfig = {
  enabled: true,
  logDir: '.codeforge/audit',
  maxEntries: 1000,
}
