export type DiffType = 'added' | 'removed' | 'unchanged' | 'modified'

export interface DiffLine {
  type: DiffType
  content: string
  oldLineNumber?: number
  newLineNumber?: number
}

export interface DiffHunk {
  oldStart: number
  oldCount: number
  newStart: number
  newCount: number
  lines: DiffLine[]
  header: string
}

export interface DiffStats {
  additions: number
  deletions: number
  modifications: number
  unchanged: number
  totalLines: number
  changePercent: number
}

export interface DiffResult {
  hunks: DiffHunk[]
  oldContent: string
  newContent: string
  stats: DiffStats
  path?: string
}

export interface PatchOptions {
  contextLines: number
  ignoreWhitespace: boolean
  ignoreCase: boolean
  maxLineLength: number
}

export interface ApplyResult {
  success: boolean
  applied: boolean
  rejects: number
  conflicts: string[]
}

export const DEFAULT_PATCH_OPTIONS: PatchOptions = {
  contextLines: 3,
  ignoreWhitespace: false,
  ignoreCase: false,
  maxLineLength: 1000,
}
