export interface ComplexityMetrics {
  filePath: string
  cyclomaticComplexity: number
  cognitiveComplexity: number
  linesOfCode: number
  linesOfCodeEffective: number
  functionCount: number
  maxNestingDepth: number
  maintainabilityIndex: number
  timestamp: number
}

export interface TrendSummary {
  totalFiles: number
  avgCyclomatic: number
  avgCognitive: number
  avgMaintainability: number
  totalLOC: number
  totalEffectiveLOC: number
  totalFunctions: number
  maxComplexityFile: string
  complexityDistribution: Record<string, number>
}

export interface TrendSnapshot {
  id: string
  timestamp: number
  commitHash?: string
  branch?: string
  metrics: ComplexityMetrics[]
  summary: TrendSummary
}

export interface TrendDataPoint {
  timestamp: number
  value: number
  label?: string
}

export interface TrendAnalysis {
  direction: 'improving' | 'degrading' | 'stable'
  changePercent: number
  dataPoints: TrendDataPoint[]
  anomalies: TrendAnomaly[]
  forecast: TrendDataPoint[]
}

export interface TrendAnomaly {
  timestamp: number
  metric: string
  expectedValue: number
  actualValue: number
  deviation: number
}

export interface ComplexityThresholds {
  low: number
  medium: number
  high: number
}

export interface TrendConfig {
  storagePath: string
  maxSnapshots: number
  thresholds: ComplexityThresholds
}

export interface MetricComparison {
  metric: string
  previous: number
  current: number
  change: number
  changePercent: number
  direction: 'improving' | 'degrading' | 'stable'
}

export interface FileTrend {
  filePath: string
  previousComplexity: number
  currentComplexity: number
  change: number
  direction: 'improving' | 'degrading' | 'stable'
}

export const DEFAULT_THRESHOLDS: ComplexityThresholds = {
  low: 10,
  medium: 20,
  high: 30,
}

export const DEFAULT_CONFIG: TrendConfig = {
  storagePath: '.codeforge/trends',
  maxSnapshots: 100,
  thresholds: DEFAULT_THRESHOLDS,
}
