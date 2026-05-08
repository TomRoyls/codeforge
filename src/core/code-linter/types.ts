export type LintSeverity = 'error' | 'warning' | 'info'

export interface LintRule {
  id: string
  description: string
  severity: LintSeverity
  check: (line: string, lineNumber: number) => LintViolation[]
}

export interface LintViolation {
  ruleId: string
  message: string
  line: number
  column: number
  severity: LintSeverity
  fix?: string
}

export interface LintResult {
  violations: LintViolation[]
  errorCount: number
  warningCount: number
  infoCount: number
  totalLines: number
}

export interface LintConfig {
  rules: LintRule[]
  maxViolations: number
  ignorePatterns: string[]
  failOnWarnings: boolean
}
