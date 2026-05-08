export interface ErrorFix {
  range: { startLine: number; startColumn: number; endLine: number; endColumn: number }
  replacement: string
  description: string
  isSafe: boolean
}

export interface ErrorEntry {
  id: string
  ruleId: string
  message: string
  severity: 'error' | 'warning' | 'info' | 'suggestion'
  filePath: string
  line: number
  column: number
  endLine?: number
  endColumn?: number
  source?: string
  fix?: ErrorFix
  tags: string[]
  timestamp: number
}

export interface ErrorGroup {
  ruleId: string
  count: number
  severity: ErrorEntry['severity']
  files: string[]
  representative: ErrorEntry
}

export interface ErrorSummary {
  total: number
  errors: number
  warnings: number
  info: number
  suggestions: number
  fixableCount: number
  filesAffected: number
  byRule: Map<string, number>
  byFile: Map<string, number>
  bySeverity: Map<string, number>
}

export interface ErrorReport {
  summary: ErrorSummary
  groups: ErrorGroup[]
  entries: ErrorEntry[]
  generatedAt: number
  format: string
}
