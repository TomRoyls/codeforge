export interface Snapshot {
  id: string
  name: string
  content: string
  hash: string
  createdAt: number
  metadata: Record<string, unknown>
  tags: string[]
}

export interface SnapshotDiff {
  id: string
  name: string
  added: number
  removed: number
  unchanged: number
  changes: DiffLine[]
  matchPercentage: number
}

export interface DiffLine {
  type: 'add' | 'remove' | 'equal'
  content: string
  lineNumber: number
}

export interface UpdateResult {
  updated: boolean
  previousHash: string | null
  newHash: string
  created: boolean
}

export interface SnapshotReport {
  totalSnapshots: number
  matched: number
  mismatched: number
  new: number
  deleted: number
  results: SnapshotDiff[]
}
