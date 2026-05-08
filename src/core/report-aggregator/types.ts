export interface AnalysisFinding {
  id: string
  ruleId: string
  severity: 'error' | 'warning' | 'info'
  message: string
  file: string
  line: number
  column: number
}

export interface AnalysisReport {
  source: string
  timestamp: number
  findings: AnalysisFinding[]
  metrics: Record<string, number>
}

export interface AggregatedReport {
  sources: string[]
  totalFindings: number
  findings: AnalysisFinding[]
  bySeverity: Record<string, number>
  byRule: Record<string, number>
  byFile: Record<string, number>
  mergedMetrics: Record<string, number>
  duplicatesRemoved: number
}

export interface AggregatorConfig {
  deduplicate: boolean
  dedupKey: (f: AnalysisFinding) => string
  sortBy: ('severity' | 'file' | 'line')[]
}
