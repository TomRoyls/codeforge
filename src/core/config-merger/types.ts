export type ConfigValue =
  | string
  | number
  | boolean
  | null
  | ConfigValue[]
  | { [key: string]: ConfigValue }

export type MergeStrategy = 'deep' | 'shallow' | 'replace'

export interface MergeOptions {
  strategy: MergeStrategy
  arrays: MergeStrategy
  ignoreKeys: string[]
  priority: 'left' | 'right'
}

export interface MergeConflict {
  path: string[]
  leftValue: ConfigValue
  rightValue: ConfigValue
  resolved: ConfigValue
  strategy: string
}

export interface MergeResult {
  merged: Record<string, ConfigValue>
  conflicts: MergeConflict[]
  stats: MergeStats
}

export interface MergeStats {
  totalKeys: number
  addedKeys: number
  removedKeys: number
  modifiedKeys: number
  unchangedKeys: number
}

export interface ConfigLayer {
  name: string
  config: Record<string, ConfigValue>
  priority: number
  source: string
}
