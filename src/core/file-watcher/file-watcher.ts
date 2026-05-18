import type { WatchConfig, WatchEvent, WatchListener, FileEntry, WatcherState } from './types.js'
import { DEFAULT_WATCH_CONFIG } from './types.js'

const ignorePatternCache = new Map<string, RegExp>()

export class FileWatcher {
  private config: WatchConfig
  private state: WatcherState = 'idle'
  private entries: Map<string, FileEntry> = new Map()
  private listeners: WatchListener[] = []
  private onceListeners: WatchListener[] = []
  private eventCount: number = 0

  constructor(config?: Partial<WatchConfig>) {
    this.config = { ...DEFAULT_WATCH_CONFIG, ...config }
  }

  watch(paths: string[]): string[] {
    const added: string[] = []
    for (const path of paths) {
      if (!this.entries.has(path)) {
        this.entries.set(path, {
          path,
          lastModified: 0,
          size: 0,
          exists: false,
        })
        added.push(path)
      }
    }
    return added
  }

  unwatch(paths: string[]): string[] {
    const removed: string[] = []
    for (const path of paths) {
      if (this.entries.has(path)) {
        this.entries.delete(path)
        removed.push(path)
      }
    }
    return removed
  }

  getWatchedPaths(): string[] {
    return [...this.entries.keys()]
  }

  tick(fileChanges: Record<string, { modified?: number; size?: number; exists?: boolean }>): WatchEvent[] {
    const events: WatchEvent[] = []
    const timestamp = Date.now()

    for (const [path, entry] of this.entries) {
      if (this.shouldIgnore(path)) {
        continue
      }

      const change = fileChanges[path]
      if (change === undefined) {
        if (entry.exists) {
          const event: WatchEvent = { type: 'delete', path, timestamp }
          events.push(event)
          entry.exists = false
          this.eventCount++
        }
        continue
      }

      const newExists = change.exists ?? true
      const newModified = change.modified ?? entry.lastModified
      const newSize = change.size ?? entry.size

      if (!entry.exists && newExists) {
        const event: WatchEvent = { type: 'create', path, timestamp }
        events.push(event)
        entry.exists = true
        entry.lastModified = newModified
        entry.size = newSize
        this.eventCount++
      } else if (entry.exists && !newExists) {
        const event: WatchEvent = { type: 'delete', path, timestamp }
        events.push(event)
        entry.exists = false
        this.eventCount++
      } else if (entry.exists && newExists) {
        if (newModified !== entry.lastModified || newSize !== entry.size) {
          const event: WatchEvent = { type: 'modify', path, timestamp }
          events.push(event)
          entry.lastModified = newModified
          entry.size = newSize
          this.eventCount++
        }
      }
    }

    for (const [path, change] of Object.entries(fileChanges)) {
      if (!this.entries.has(path) && !this.shouldIgnore(path)) {
        const newExists = change.exists ?? true
        if (newExists) {
          const event: WatchEvent = { type: 'create', path, timestamp }
          events.push(event)
          this.entries.set(path, {
            path,
            lastModified: change.modified ?? 0,
            size: change.size ?? 0,
            exists: true,
          })
          this.eventCount++
        }
      }
    }

    const debounced = this.debounce(events)
    for (const event of debounced) {
      this.emit(event)
    }

    return debounced
  }

  on(listener: WatchListener): () => void {
    this.listeners.push(listener)
    return () => {
      const idx = this.listeners.indexOf(listener)
      if (idx !== -1) {
        this.listeners.splice(idx, 1)
      }
    }
  }

  off(listener: WatchListener): void {
    const idx = this.listeners.indexOf(listener)
    if (idx !== -1) {
      this.listeners.splice(idx, 1)
    }
  }

  once(listener: WatchListener): void {
    this.onceListeners.push(listener)
  }

  start(): void {
    this.state = 'watching'
  }

  stop(): void {
    this.state = 'stopped'
    this.entries.clear()
  }

  pause(): void {
    this.state = 'paused'
  }

  resume(): void {
    this.state = 'watching'
  }

  getState(): WatcherState {
    return this.state
  }

  getSnapshot(): Map<string, FileEntry> {
    return new Map(this.entries)
  }

  shouldIgnore(path: string): boolean {
    for (const pattern of this.config.ignorePatterns) {
      if (pattern.includes('*')) {
        let regex = ignorePatternCache.get(pattern)
        if (!regex) {
          regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$')
          ignorePatternCache.set(pattern, regex)
        }
        if (regex.test(path)) {
          return true
        }
      } else {
        if (path === pattern) {
          return true
        }
      }
    }
    return false
  }

  debounce(events: WatchEvent[]): WatchEvent[] {
    const latestByPath = new Map<string, WatchEvent>()
    for (const event of events) {
      const existing = latestByPath.get(event.path)
      if (existing === undefined || event.timestamp >= existing.timestamp) {
        latestByPath.set(event.path, event)
      }
    }
    return [...latestByPath.values()]
  }

  diffEntries(
    oldEntries: Map<string, FileEntry>,
    newSnapshot: Map<string, FileEntry>
  ): WatchEvent[] {
    const events: WatchEvent[] = []
    const timestamp = Date.now()

    for (const [path, newEntry] of newSnapshot) {
      const oldEntry = oldEntries.get(path)
      if (oldEntry === undefined) {
        if (newEntry.exists) {
          events.push({ type: 'create', path, timestamp })
        }
      } else {
        if (oldEntry.exists && !newEntry.exists) {
          events.push({ type: 'delete', path, timestamp })
        } else if (!oldEntry.exists && newEntry.exists) {
          events.push({ type: 'create', path, timestamp })
        } else if (oldEntry.exists && newEntry.exists) {
          if (oldEntry.lastModified !== newEntry.lastModified || oldEntry.size !== newEntry.size) {
            events.push({ type: 'modify', path, timestamp })
          }
        }
      }
    }

    for (const [path, oldEntry] of oldEntries) {
      if (!newSnapshot.has(path) && oldEntry.exists) {
        events.push({ type: 'delete', path, timestamp })
      }
    }

    return events
  }

  getStatistics(): { watchedPaths: number; totalEvents: number; listeners: number } {
    return {
      watchedPaths: this.entries.size,
      totalEvents: this.eventCount,
      listeners: this.listeners.length + this.onceListeners.length,
    }
  }

  private emit(event: WatchEvent): void {
    const regularListeners = [...this.listeners]
    for (const listener of regularListeners) {
      listener(event)
    }

    const once = [...this.onceListeners]
    this.onceListeners = []
    for (const listener of once) {
      listener(event)
    }
  }
}
