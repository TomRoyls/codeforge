export interface FileInfo {
  path: string
  extension: string
  lines: number
  size: number
  language: string
}

export interface ProjectStats {
  totalFiles: number
  totalLines: number
  totalSize: number
  languages: Record<string, number>
  extensions: Record<string, number>
  avgFileSize: number
  avgFileLines: number
}

export interface ComplexityMetrics {
  cyclomaticComplexity: number
  linesOfCode: number
  commentLines: number
  blankLines: number
  functions: number
  classes: number
  imports: number
  exports: number
  maintainabilityIndex: number
}

export interface DependencyMetrics {
  totalDependencies: number
  externalDependencies: number
  internalDependencies: number
  circularDependencies: number
  dependencyDepth: number
}

export interface HealthIssue {
  category: string
  severity: 'error' | 'warning' | 'info'
  message: string
}

export interface ProjectHealth {
  score: number
  grade: 'A' | 'B' | 'C' | 'D' | 'F'
  issues: HealthIssue[]
  suggestions: string[]
}

export interface AnalysisResult {
  stats: ProjectStats
  complexity: ComplexityMetrics
  dependencies: DependencyMetrics
  health: ProjectHealth
  timestamp: number
}
