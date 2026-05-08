export type Severity = 'off' | 'warn' | 'error' | 'info'

export interface RuleV2 {
  id: string
  name: string
  description: string
  category: 'correctness' | 'performance' | 'security' | 'style' | 'complexity'
  severity: Severity
  enabled: boolean
  tags: string[]
  dependencies: string[]
  conflicts: string[]
  fixable: boolean
  deprecated: boolean
  replacedBy?: string
  options: Record<string, unknown>
}

export interface RuleGroup {
  name: string
  rules: string[]
  description: string
  enabled: boolean
}

export interface RuleOverride {
  ruleId: string
  severity?: Severity
  enabled?: boolean
  options?: Record<string, unknown>
  files?: string[]
}

export interface RuleSet {
  name: string
  description: string
  rules: Map<string, Partial<RuleV2>>
  extends?: string[]
}

export interface RuleViolation {
  ruleId: string
  severity: Severity
  message: string
  filePath: string
  line: number
  column: number
  fix?: string
}

export interface EngineResult {
  violations: RuleViolation[]
  rulesApplied: string[]
  rulesSkipped: string[]
  duration: number
  stats: { errors: number; warnings: number; info: number }
}
