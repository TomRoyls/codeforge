export interface QualityDimension {
  id: string
  name: string
  weight: number
  maxScore: number
  description: string
}

export interface DimensionScore {
  dimension: QualityDimension
  score: number
  maxScore: number
  percentage: number
  grade: 'A' | 'B' | 'C' | 'D' | 'F'
  findings: DimensionFinding[]
}

export interface DimensionFinding {
  type: 'positive' | 'negative' | 'neutral'
  message: string
  impact: number
  filePath?: string
  line?: number
}

export interface QualityScore {
  overall: number
  maxScore: number
  percentage: number
  grade: 'A' | 'B' | 'C' | 'D' | 'F'
  dimensions: DimensionScore[]
  timestamp: number
  filePath?: string
  metadata: Record<string, unknown>
}

export interface QualitySnapshot {
  id: string
  score: QualityScore
  filePath?: string
  createdAt: number
  tags: string[]
  branch?: string
  commit?: string
}

export interface QualityTrend {
  snapshots: QualitySnapshot[]
  direction: 'improving' | 'declining' | 'stable'
  changeRate: number
  period: { from: number; to: number }
  averageScore: number
  bestScore: number
  worstScore: number
}

export interface QualityReport {
  score: QualityScore
  recommendations: QualityRecommendation[]
  trends?: QualityTrend
}

export interface QualityRecommendation {
  dimension: string
  priority: 'critical' | 'high' | 'medium' | 'low'
  message: string
  impact: number
  effort: number
  suggestion: string
}

export const QUALITY_DIMENSIONS: QualityDimension[] = [
  { id: 'complexity', name: 'Code Complexity', weight: 20, maxScore: 100, description: 'Cyclomatic and cognitive complexity metrics' },
  { id: 'type-safety', name: 'Type Safety', weight: 20, maxScore: 100, description: 'TypeScript type coverage and any usage' },
  { id: 'security', name: 'Security', weight: 25, maxScore: 100, description: 'Security vulnerability detection' },
  { id: 'maintainability', name: 'Maintainability', weight: 15, maxScore: 100, description: 'Code structure and dependency health' },
  { id: 'performance', name: 'Performance', weight: 10, maxScore: 100, description: 'Performance anti-patterns' },
  { id: 'testing', name: 'Test Quality', weight: 10, maxScore: 100, description: 'Test coverage and quality metrics' },
]

export const GRADE_THRESHOLDS: Record<string, number> = {
  A: 90,
  B: 75,
  C: 60,
  D: 40,
  F: 0,
}
