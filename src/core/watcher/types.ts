export interface WatcherConfig {
  paths: string[]
  ignorePatterns: string[]
  debounceMs: number
  persistent: boolean
  ignoreInitial: boolean
}

export interface FileChangeEvent {
  type: 'add' | 'change' | 'unlink' | 'addDir' | 'unlinkDir'
  filePath: string
  timestamp: number
  content?: string
  oldContent?: string
}

export interface FileState {
  filePath: string
  hash: string
  lastModified: number
  size: number
  exists: boolean
}

export interface WatcherStats {
  filesWatched: number
  dirsWatched: number
  eventsProcessed: number
  startTime: number
  uptime: number
}

export type EventHandler<T = unknown> = (event: T) => void

export interface Subscription {
  id: string
  event: string
  handler: EventHandler
  once: boolean
}

export const DEFAULT_WATCHER_CONFIG: WatcherConfig = {
  paths: [],
  ignorePatterns: ['node_modules/**', '.git/**', 'dist/**'],
  debounceMs: 100,
  persistent: true,
  ignoreInitial: true,
}
