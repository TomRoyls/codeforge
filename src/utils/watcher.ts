import { EventEmitter } from 'node:events'
import * as fs from 'node:fs'
import path from 'node:path'

import { DEFAULT_DEBOUNCE_MS } from './constants.js'
import { logger } from './logger.js'

const _patternRegExpCache = new Map<string, RegExp>()

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

  private fileExists(filePath: string): Promise<boolean> {
    return new Promise((resolve) => {
      fs.access(filePath, fs.constants.F_OK, (err) => {
        resolve(!err)
      })
    })
  }

  private patternToRegExp(pattern: string): RegExp {
    let regex = _patternRegExpCache.get(pattern)
    if (!regex) {
      const regexPattern = pattern
        .replaceAll('**', '<<GLOBSTAR>>')
        .replaceAll('*', '[^/]*')
        .replaceAll('<<GLOBSTAR>>', '.*')
        .replaceAll('?', '[^/]')
        .replaceAll('.', String.raw`\.`)
      regex = new RegExp(regexPattern)
      _patternRegExpCache.set(pattern, regex)
    }
    return regex
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
    try {
      const watcher = fs.watch(
        dirPath,
        { persistent: true, recursive: true },
        (_eventType, filename) => {
          if (!filename) return
          if (typeof filename !== 'string') return

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
        },
      )

      watcher.on('error', (error) => {
        this.emit('error', error)
      })

      this.watchers.set(dirPath, watcher)
    } catch (error) {
      const code =
        error instanceof Error && 'code' in error
          ? (error as NodeJS.ErrnoException).code
          : undefined
      if (code === 'ENOENT' || code === 'EACCES') {
        // Directory doesn't exist or is inaccessible — expected behavior
      } else {
        logger.debug(
          `Failed to watch directory ${dirPath}: ${error instanceof Error ? error.message : String(error)}`,
        )
      }
    }
  }
}

let defaultWatcher: FileWatcher | null = null

export function createWatcher(options?: FileWatcherOptions): FileWatcher {
  if (defaultWatcher) {
    defaultWatcher.stop().catch((error) => {
      logger.debug('Failed to stop previous watcher:', error)
    })
  }

  defaultWatcher = new FileWatcher(options)
  return defaultWatcher
}
