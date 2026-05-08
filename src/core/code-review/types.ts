export interface DiffChange {
  type: 'add' | 'delete' | 'normal'
  content: string
  lineNumber: number
}

export interface DiffHunk {
  oldStart: number
  oldLines: number
  newStart: number
  newLines: number
  content: string
  changes: DiffChange[]
}

export interface DiffFile {
  path: string
  status: 'added' | 'modified' | 'deleted' | 'renamed'
  additions: number
  deletions: number
  hunks: DiffHunk[]
}

export interface ReviewComment {
  filePath: string
  line: number
  side: 'LEFT' | 'RIGHT'
  message: string
  severity: 'blocker' | 'critical' | 'major' | 'minor' | 'info'
  category: string
  suggestion?: string
  ruleId?: string
}

export interface ReviewSummary {
  totalComments: number
  blockerCount: number
  criticalCount: number
  majorCount: number
  minorCount: number
  infoCount: number
  filesReviewed: number
  filesWithIssues: number
  categories: Record<string, number>
}

export interface ReviewResult {
  comments: ReviewComment[]
  summary: ReviewSummary
  score: number
  approved: boolean
}

export interface ReviewConfig {
  maxComments: number
  minSeverity: 'blocker' | 'critical' | 'major' | 'minor' | 'info'
  enabledCategories: string[]
  ignorePatterns: string[]
  approvalThreshold: number
}

export interface ReviewContext {
  filePath: string
  hunk: DiffHunk
  allChanges: DiffChange[]
  fileContent?: string
}

export interface ReviewRule {
  id: string
  name: string
  category: string
  severity: ReviewComment['severity']
  evaluate: (change: DiffChange, context: ReviewContext) => ReviewComment | null
}

export interface GitHubComment {
  path: string
  position: number
  body: string
  side: 'LEFT' | 'RIGHT'
  line: number
}

export const SEVERITY_LEVELS: Record<ReviewComment['severity'], number> = {
  blocker: 0,
  critical: 1,
  major: 2,
  minor: 3,
  info: 4,
}

export const DEFAULT_CONFIG: ReviewConfig = {
  maxComments: 50,
  minSeverity: 'info',
  enabledCategories: [],
  ignorePatterns: [],
  approvalThreshold: 0.8,
}
