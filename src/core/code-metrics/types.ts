export interface CodeFile {
  path: string
  content: string
  language: string
}

export interface LineRatio {
  codeToComment: number
  codeToTotal: number
  commentToTotal: number
}

export interface LineMetrics {
  total: number
  code: number
  comment: number
  blank: number
  mixed: number
  ratio: LineRatio
}

export interface ComplexityMetrics {
  cyclomatic: number
  cognitive: number
  nesting: number
  branches: number
  functions: number
}

export interface MaintainabilityMetrics {
  mi: number
  grade: 'A' | 'B' | 'C' | 'D' | 'F'
  halsteadVolume: number
  halsteadDifficulty: number
}

export interface DuplicationMetrics {
  duplicatedLines: number
  duplicatedBlocks: number
  duplicationPercentage: number
}

export interface MetricResult {
  path: string
  lines: LineMetrics
  complexity: ComplexityMetrics
  maintainability: MaintainabilityMetrics
  duplication: DuplicationMetrics
}

export interface MetricTotals {
  lines: number
  codeLines: number
  commentLines: number
  blankLines: number
  functions: number
  complexity: number
  duplicatedLines: number
}

export interface MetricAverages {
  avgComplexity: number
  avgLinesPerFile: number
  avgMaintainability: number
  avgDuplication: number
}

export interface AggregateMetrics {
  files: number
  totals: MetricTotals
  averages: MetricAverages
  byLanguage: Record<string, MetricAverages>
}
