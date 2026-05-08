export type ConfigValue =
  | string
  | number
  | boolean
  | null
  | ConfigValue[]
  | { [key: string]: ConfigValue }

export interface ConfigSnapshot {
  timestamp: number
  config: Record<string, ConfigValue>
  version: string
  source: string
}

export type ChangeType = 'added' | 'removed' | 'modified'

export interface ConfigDiffEntry {
  path: string[]
  oldValue: ConfigValue
  newValue: ConfigValue
  changeType: ChangeType
}

export interface DiffSummary {
  added: number
  removed: number
  modified: number
  unchanged: number
}

export interface ConfigDiffResult {
  entries: ConfigDiffEntry[]
  summary: DiffSummary
}

export interface DiffOptions {
  ignorePaths: string[]
  includeUnchanged: boolean
  normalizeValues: boolean
}
