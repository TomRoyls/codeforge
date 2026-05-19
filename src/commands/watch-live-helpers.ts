import { basename, extname } from 'node:path'

// ─── Interfaces ──────────────────────────────────────────

export interface WatchConfig {
  path: string
  extensions: string[]
  ignorePatterns: string[]
  debounceMs: number
  command: string | null
  recursive: boolean
}

export interface FileChangeEvent {
  file: string
  type: 'created' | 'modified' | 'deleted'
  timestamp: string
  size: number
  lines: number
}

export interface WatchSession {
  config: WatchConfig
  events: FileChangeEvent[]
  startTime: string
  totalEvents: number
  filesWatched: number
}

export interface WatchSummary {
  session: WatchSession
  topChangedFiles: { file: string; changes: number }[]
  eventsByType: { created: number; modified: number; deleted: number }
  eventsByExtension: Record<string, number>
  eventsPerMinute: number
}

// ─── buildWatchConfig ───────────────────────────────────

/**
 * Build a WatchConfig from partial options.
 *
 * @example
 * ```ts
 * const config = buildWatchConfig({ path: './src', debounceMs: 300 })
 * config.recursive // true
 * ```
 */
export function buildWatchConfig(options: Partial<WatchConfig> & { path: string }): WatchConfig {
  return {
    command: options.command ?? null,
    debounceMs: options.debounceMs ?? 500,
    extensions: options.extensions ?? ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs'],
    ignorePatterns: options.ignorePatterns ?? ['**/node_modules/**', '**/dist/**', '**/.git/**'],
    path: options.path,
    recursive: options.recursive ?? true,
  }
}

// ─── shouldWatch ────────────────────────────────────────

/**
 * Check if a file should be watched based on config.
 *
 * @example
 * ```ts
 * shouldWatch('app.ts', config) // true
 * shouldWatch('app.md', config) // false
 * ```
 */
export function shouldWatch(filePath: string, config: WatchConfig): boolean {
  const ext = extname(filePath)
  if (!config.extensions.includes(ext)) return false

  for (const pattern of config.ignorePatterns) {
    const glob = pattern.replace(/\*\*/g, '').replace(/\*/g, '').replace(/\//g, '')
    if (glob && filePath.includes(glob)) return false
  }

  const ignoreDirs = ['node_modules', 'dist', '.git', 'coverage', '__pycache__']
  for (const dir of ignoreDirs) {
    if (filePath.includes(`/${dir}/`) || filePath.includes(`\\${dir}\\`)) return false
  }

  return true
}

// ─── createFileEvent ────────────────────────────────────

/**
 * Create a FileChangeEvent from a file path and event type.
 *
 * @example
 * ```ts
 * createFileEvent('src/app.ts', 'modified')
 * ```
 */
export function createFileEvent(
  filePath: string,
  eventType: FileChangeEvent['type'],
  content?: string,
): FileChangeEvent {
  const lines = content ? content.split('\n').length : 0
  const size = content ? content.length : 0

  return {
    file: filePath,
    lines,
    size,
    timestamp: new Date().toISOString(),
    type: eventType,
  }
}

// ─── computeWatchSummary ────────────────────────────────

/**
 * Compute summary statistics from a watch session.
 *
 * @example
 * ```ts
 * const summary = computeWatchSummary(session)
 * summary.eventsByType.modified // 5
 * ```
 */
export function computeWatchSummary(session: WatchSession): WatchSummary {
  const eventsByType = { created: 0, deleted: 0, modified: 0 }
  const eventsByExtension: Record<string, number> = {}
  const fileChanges = new Map<string, number>()

  for (const event of session.events) {
    eventsByType[event.type]++

    const ext = extname(event.file)
    eventsByExtension[ext] = (eventsByExtension[ext] ?? 0) + 1

    const current = fileChanges.get(event.file) ?? 0
    fileChanges.set(event.file, current + 1)
  }

  const sorted = [...fileChanges.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([file, changes]) => ({ changes, file }))

  const startTime = new Date(session.startTime).getTime()
  const elapsed = Date.now() - startTime
  const minutes = elapsed / 60000
  const eventsPerMinute = minutes > 0 ? Math.round((session.totalEvents / minutes) * 10) / 10 : 0

  return {
    eventsByExtension,
    eventsByType,
    eventsPerMinute,
    session,
    topChangedFiles: sorted,
  }
}

// ─── debounce ───────────────────────────────────────────

/**
 * Create a debounced version of a function.
 *
 * @example
 * ```ts
 * const debounced = debounce((f: string) => events.push(f), 300)
 * ```
 */
export function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number,
): { (args: Parameters<T>): void; cancel: () => void } {
  let timer: ReturnType<typeof setTimeout> | null = null

  const debounced = (...args: Parameters<T>) => {
    if (timer !== null) clearTimeout(timer)
    timer = setTimeout(() => {
      fn(...args)
      timer = null
    }, delay)
  }

  debounced.cancel = () => {
    if (timer !== null) {
      clearTimeout(timer)
      timer = null
    }
  }

  return debounced
}

// ─── buildFileWatcher ───────────────────────────────────

/**
 * Build a watcher description (not actual fs.watch).
 *
 * @example
 * ```ts
 * const desc = buildFileWatcher(config)
 * desc.watching // true
 * ```
 */
export function buildFileWatcher(config: WatchConfig): {
  config: WatchConfig
  watching: boolean
  startedAt: string
} {
  return {
    config,
    startedAt: new Date().toISOString(),
    watching: true,
  }
}

// ─── classifyChange ─────────────────────────────────────

/**
 * Classify a file change event type from fs.watch event name.
 *
 * @example
 * ```ts
 * classifyChange('rename') // 'deleted'
 * classifyChange('change') // 'modified'
 * ```
 */
export function classifyChange(fsEvent: string): FileChangeEvent['type'] {
  if (fsEvent === 'rename') return 'deleted'
  if (fsEvent === 'change') return 'modified'
  return 'modified'
}

// ─── filterEvents ───────────────────────────────────────

/**
 * Filter events by type or extension.
 *
 * @example
 * ```ts
 * filterEvents(events, { type: 'modified' })
 * ```
 */
export function filterEvents(
  events: FileChangeEvent[],
  filter: { type?: FileChangeEvent['type']; extension?: string },
): FileChangeEvent[] {
  return events.filter((e) => {
    if (filter.type && e.type !== filter.type) return false
    if (filter.extension && extname(e.file) !== filter.extension) return false
    return true
  })
}

// ─── buildWatchSession ──────────────────────────────────

/**
 * Create an initial watch session.
 *
 * @example
 * ```ts
 * const session = buildWatchSession(config)
 * session.totalEvents // 0
 * ```
 */
export function buildWatchSession(config: WatchConfig, filesWatched: number): WatchSession {
  return {
    config,
    events: [],
    filesWatched,
    startTime: new Date().toISOString(),
    totalEvents: 0,
  }
}

// ─── addEvent ───────────────────────────────────────────

/**
 * Add an event to a watch session, returning a new session.
 *
 * @example
 * ```ts
 * const updated = addEvent(session, event)
 * updated.totalEvents // 1
 * ```
 */
export function addEvent(session: WatchSession, event: FileChangeEvent): WatchSession {
  return {
    ...session,
    events: [...session.events, event],
    totalEvents: session.totalEvents + 1,
  }
}

// ─── getRecentEvents ────────────────────────────────────

/**
 * Get the N most recent events from a session.
 *
 * @example
 * ```ts
 * getRecentEvents(session, 5)
 * ```
 */
export function getRecentEvents(session: WatchSession, count: number): FileChangeEvent[] {
  return session.events.slice(-count)
}
