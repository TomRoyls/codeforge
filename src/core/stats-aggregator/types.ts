export interface FileStats {
  filePath: string
  linesOfCode: number
  commentLines: number
  blankLines: number
  totalLines: number
  functions: number
  classes: number
  imports: number
  exports: number
  complexity: number
  language: string
  timestamp: number
}

export interface ProjectStats {
  totalFiles: number
  totalLinesOfCode: number
  totalCommentLines: number
  totalBlankLines: number
  averageComplexity: number
  averageFileLength: number
  languages: Map<string, number>
  topComplexFiles: FileStats[]
  timestamp: number
}

export interface StatsSnapshot {
  id: string
  timestamp: number
  projectStats: ProjectStats
  fileStats: FileStats[]
}

export interface TrendPoint {
  timestamp: number
  value: number
  label: string
}

export interface TrendAnalysis {
  metric: string
  points: TrendPoint[]
  direction: 'increasing' | 'decreasing' | 'stable'
  changeRate: number
}

export interface StatsReport {
  project: ProjectStats
  files: FileStats[]
  trends: TrendAnalysis[]
  generatedAt: number
}

export interface Distribution {
  min: number
  max: number
  mean: number
  median: number
  p90: number
  p95: number
  p99: number
}

export interface SnapshotDiff {
  added: number
  removed: number
  changed: FileStats[]
}
