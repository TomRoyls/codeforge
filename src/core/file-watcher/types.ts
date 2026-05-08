export interface WatchEvent {
  type: 'create' | 'modify' | 'delete'
  path: string
  timestamp: number
}

export type WatchListener = (event: WatchEvent) => void

export interface WatchConfig {
  interval: number
  ignorePatterns: string[]
  debounceMs: number
  persistent: boolean
}

export interface FileEntry {
  path: string
  lastModified: number
  size: number
  exists: boolean
}

export type WatcherState = 'idle' | 'watching' | 'paused' | 'stopped'

export const DEFAULT_WATCH_CONFIG: WatchConfig = {
  interval: 1000,
  ignorePatterns: [],
  debounceMs: 100,
  persistent: false,
}
