export interface SnapshotEntry {
  key: string
  value: unknown
  timestamp: number
  tags: string[]
}

export interface AnalysisSnapshot {
  id: string
  timestamp: number
  entries: Map<string, SnapshotEntry>
  metadata: Record<string, string>
}

export interface DiffEntry {
  key: string
  changeType: 'added' | 'removed' | 'modified' | 'unchanged'
  oldValue: unknown
  newValue: unknown
}

export interface ComparisonResult {
  snapshotA: string
  snapshotB: string
  diffs: DiffEntry[]
  summary: ComparisonSummary
}

export interface ComparisonSummary {
  totalKeys: number
  added: number
  removed: number
  modified: number
  unchanged: number
  changePercent: number
}

export type TrendDirection = 'improving' | 'degrading' | 'stable'

export interface TrendAnalysis {
  metric: string
  direction: TrendDirection
  changeRate: number
  dataPoints: number
}
