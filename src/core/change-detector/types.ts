export interface FileEntry {
  path: string
  hash: string
  size: number
  lastModified: number
}

export type ChangeType = 'added' | 'removed' | 'modified' | 'unchanged'

export interface FileChange {
  path: string
  changeType: ChangeType
  oldHash?: string
  newHash?: string
  oldSize?: number
  newSize?: number
}

export interface ChangeSummary {
  added: number
  removed: number
  modified: number
  unchanged: number
  total: number
}

export interface ChangeReport {
  changes: FileChange[]
  summary: ChangeSummary
}

export interface DetectorConfig {
  algorithm: 'simple' | 'djb2' | 'fnv1a'
  includeUnchanged: boolean
}

export const DEFAULT_DETECTOR_CONFIG: DetectorConfig = {
  algorithm: 'djb2',
  includeUnchanged: false,
}
