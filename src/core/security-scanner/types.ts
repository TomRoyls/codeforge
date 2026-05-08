export type SeverityLevel = 'critical' | 'high' | 'medium' | 'low' | 'info'

export interface SecurityFix {
  description: string
  replacement: string
}

export interface SecurityFinding {
  id: string
  ruleId: string
  severity: SeverityLevel
  message: string
  file: string
  line: number
  column: number
  codeSnippet: string
  fix?: SecurityFix
}

export interface SecurityPattern {
  regex: string
  message: string
  fix?: SecurityFix
}

export interface SecurityRule {
  id: string
  name: string
  description: string
  severity: SeverityLevel
  patterns: SecurityPattern[]
}

export interface ScanResult {
  findings: SecurityFinding[]
  fileCount: number
  scanDuration: number
  ruleCount: number
}

export interface ScanConfig {
  includePatterns: string[]
  excludePatterns: string[]
  maxFindings: number
  severityThreshold: SeverityLevel
  customRules: SecurityRule[]
}

export const DEFAULT_SCAN_CONFIG: ScanConfig = {
  includePatterns: ['**/*.{ts,js,tsx,jsx}'],
  excludePatterns: ['**/node_modules/**'],
  maxFindings: 500,
  severityThreshold: 'low',
  customRules: [],
}
