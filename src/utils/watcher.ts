import { EventEmitter } from 'node:events'
import * as fs from 'node:fs'
import path from 'node:path'

import { DEFAULT_DEBOUNCE_MS } from './constants.js'

export interface FileWatcherOptions {
  /** Debounce time in milliseconds (default: 300) */
  debounceMs?: number
  /** File extensions to watch (e.g., ['.ts', '.js']) */
  extensions?: string[]
  /** Patterns to ignore */
  ignorePatterns?: string[]
}

export interface WatcherEvent {
  /** Absolute path to the file that changed */
  filePath: string
  /** Type of change */
  type: 'add' | 'change' | 'unlink'
}

/**
 * FileWatcher monitors directories for file changes using Node.js built-in fs.watch.
 * Supports recursive watching, debouncing, and event-based notifications.
 */
// eslint-disable-next-line unicorn/prefer-event-target
export class FileWatcher extends EventEmitter {
  private debounceMs: number
  private debounceTimers: Map<string, NodeJS.Timeout> = new Map()
  private extensions: Set<string>
  private ignorePatterns: RegExp[]
  private isWatching = false
  private watchers: Map<string, fs.FSWatcher> = new Map()

  constructor(options: FileWatcherOptions = {}) {
    super()
    this.debounceMs = options.debounceMs ?? DEFAULT_DEBOUNCE_MS
    this.extensions = new Set(options.extensions ?? [])
    this.ignorePatterns = (options.ignorePatterns ?? []).map((p) => this.patternToRegExp(p))
  }

  /**
   * Check if the watcher is currently active
   */
  isActive(): boolean {
    return this.isWatching
  }

  async stop(): Promise<void> {
    for (const timer of this.debounceTimers.values()) {
      clearTimeout(timer)
    }

    this.debounceTimers.clear()

    for (const watcher of this.watchers.values()) {
      watcher.close()
    }

    this.watchers.clear()
    this.isWatching = false
  }

  async watch(directory: string): Promise<void> {
    if (this.isWatching) {
      await this.stop()
    }

    const absolutePath = path.resolve(directory)
    await this.watchDirectory(absolutePath)
    this.isWatching = true
  }

  private debounce(key: string, callback: () => void): void {
    const existingTimer = this.debounceTimers.get(key)
    if (existingTimer) {
      clearTimeout(existingTimer)
    }

    const timer = setTimeout(() => {
      this.debounceTimers.delete(key)
      callback()
    }, this.debounceMs)

    this.debounceTimers.set(key, timer)
  }

  private async fileExists(filePath: string): Promise<boolean> {
    return new Promise((resolve) => {
      fs.access(filePath, fs.constants.F_OK, (err) => {
        resolve(!err)
      })
    })
  }

  private handleChange(dirPath: string, filename: null | string): void {
    if (!filename) return

    const filePath = path.join(dirPath, filename)

    if (this.shouldIgnore(filePath)) {
      return
    }

    if (this.extensions.size > 0) {
      const ext = path.extname(filePath)
      if (!this.extensions.has(ext)) {
        return
      }
    }

    this.debounce(filePath, async () => {
      const exists = await this.fileExists(filePath)
      const type: WatcherEvent['type'] = exists ? 'change' : 'unlink'

      this.emit('change', {
        filePath,
        type,
      } as WatcherEvent)
    })
  }

  private async isDirectory(filePath: string): Promise<boolean> {
    return new Promise((resolve) => {
      fs.stat(filePath, (err, stats) => {
        if (err) {
          resolve(false)
        } else {
          resolve(stats.isDirectory())
        }
      })
    })
  }

  private patternToRegExp(pattern: string): RegExp {
    const regexPattern = pattern
      .replaceAll('**', '<<GLOBSTAR>>')
      .replaceAll('*', '[^/]*')
      .replaceAll('<<GLOBSTAR>>', '.*')
      .replaceAll('?', '[^/]')
      .replaceAll('.', String.raw`\.`)
    return new RegExp(regexPattern)
  }

  private async readDirSafe(dirPath: string): Promise<string[]> {
    return new Promise((resolve) => {
      fs.readdir(dirPath, (err, files) => {
        if (err) {
          resolve([])
        } else {
          resolve(files)
        }
      })
    })
  }

  private shouldIgnore(filePath: string): boolean {
    const relativePath = filePath
    for (const pattern of this.ignorePatterns) {
      if (pattern.test(relativePath)) {
        return true
      }
    }

    return false
  }

  private async watchDirectory(dirPath: string): Promise<void> {
    if (this.shouldIgnore(dirPath)) {
      return
    }

    try {
      const watcher = fs.watch(
        dirPath,
        { persistent: true, recursive: false },
        (_eventType, filename) => {
          this.handleChange(dirPath, filename)
        },
      )

      watcher.on('error', (error) => {
        this.emit('error', error)
      })

      this.watchers.set(dirPath, watcher)

      const entries = await this.readDirSafe(dirPath)
      await Promise.all(
        entries.map(async (entry) => {
          const fullPath = path.join(dirPath, entry)
          if (await this.isDirectory(fullPath)) {
            await this.watchDirectory(fullPath)
          }
        }),
      )
    } catch {
      // Directory might not exist, be inaccessible, or watching may have been stopped
      // This is expected behavior - not all directories are watchable
    }
  }
}

let defaultWatcher: FileWatcher | null = null

export function createWatcher(options?: FileWatcherOptions): FileWatcher {
  if (defaultWatcher) {
    defaultWatcher.stop().catch((error) => {
      console.debug('Failed to stop previous watcher:', error)
    })
  }

  defaultWatcher = new FileWatcher(options)
  return defaultWatcher
}

export function getDefaultWatcher(): FileWatcher | null {
  return defaultWatcher
}

/**
 * Reset the default watcher (useful for testing)
 */
export function resetDefaultWatcher(): void {
  if (defaultWatcher) {
    defaultWatcher.stop().catch((error) => {
      console.debug('Failed to stop watcher during reset:', error)
    })
  }
  defaultWatcher = null
}
