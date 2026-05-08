import type { WatcherConfig, WatcherStats } from './types.js'
import { DEFAULT_WATCHER_CONFIG } from './types.js'
import { EventBus } from './event-bus.js'
import { ChangeDetector } from './change-detector.js'

export class WatcherEngine {
  private config: WatcherConfig
  private running: boolean = false
  private watchedPaths: Set<string> = new Set()
  private fileContents: Map<string, string> = new Map()
  private eventBus: EventBus
  private changeDetector: ChangeDetector
  private startTime: number = 0
  private eventsProcessed: number = 0
  private debounceTimers: Map<string, ReturnType<typeof setTimeout>> = new Map()

  constructor(config?: Partial<WatcherConfig>) {
    this.config = { ...DEFAULT_WATCHER_CONFIG, ...config }
    this.eventBus = new EventBus()
    this.changeDetector = new ChangeDetector()

    for (const p of this.config.paths) {
      this.watchedPaths.add(p)
    }
  }

  start(): void {
    if (this.running) return
    this.running = true
    this.startTime = Date.now()
    this.eventBus.emit('start', { timestamp: this.startTime })
  }

  stop(): void {
    if (!this.running) return
    this.running = false
    this.eventBus.emit('stop', { timestamp: Date.now() })
    for (const timer of this.debounceTimers.values()) {
      clearTimeout(timer)
    }
    this.debounceTimers.clear()
  }

  isRunning(): boolean {
    return this.running
  }

  addPath(path: string): void {
    this.watchedPaths.add(path)
    if (this.running) {
      this.eventBus.emit('pathAdded', { path, timestamp: Date.now() })
    }
  }

  removePath(path: string): void {
    const existed = this.watchedPaths.has(path)
    this.watchedPaths.delete(path)
    this.fileContents.delete(path)
    if (this.running && existed) {
      this.eventBus.emit('pathRemoved', { path, timestamp: Date.now() })
    }
  }

  getWatchedPaths(): string[] {
    return Array.from(this.watchedPaths)
  }

  getStats(): WatcherStats {
    const now = Date.now()
    return {
      filesWatched: this.fileContents.size,
      dirsWatched: this.watchedPaths.size,
      eventsProcessed: this.eventsProcessed,
      startTime: this.startTime,
      uptime: this.running ? now - this.startTime : 0,
    }
  }

  shouldIgnore(filePath: string): boolean {
    for (const pattern of this.config.ignorePatterns) {
      const normalized = pattern.replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*')
      const regex = new RegExp(normalized)
      if (regex.test(filePath)) {
        return true
      }
    }
    return false
  }

  simulateFileChange(filePath: string, content: string): void {
    if (!this.running) return
    if (this.shouldIgnore(filePath)) return

    if (this.config.debounceMs > 0) {
      const existing = this.debounceTimers.get(filePath)
      if (existing) {
        clearTimeout(existing)
      }

      const timer = setTimeout(() => {
        this.debounceTimers.delete(filePath)
        this.processFileChange(filePath, content)
      }, this.config.debounceMs)

      this.debounceTimers.set(filePath, timer)
    } else {
      this.processFileChange(filePath, content)
    }
  }

  simulateFileDelete(filePath: string): void {
    if (!this.running) return
    if (this.shouldIgnore(filePath)) return

    const previousContent = this.fileContents.get(filePath)
    this.fileContents.delete(filePath)
    this.eventsProcessed++

    this.eventBus.emit('change', {
      type: 'unlink',
      filePath,
      timestamp: Date.now(),
      oldContent: previousContent,
    })
  }

  simulateDirAdd(dirPath: string): void {
    if (!this.running) return
    if (this.shouldIgnore(dirPath)) return

    this.eventsProcessed++
    this.eventBus.emit('change', {
      type: 'addDir',
      filePath: dirPath,
      timestamp: Date.now(),
    })
  }

  simulateDirRemove(dirPath: string): void {
    if (!this.running) return
    if (this.shouldIgnore(dirPath)) return

    this.eventsProcessed++
    this.eventBus.emit('change', {
      type: 'unlinkDir',
      filePath: dirPath,
      timestamp: Date.now(),
    })
  }

  on(event: string, handler: (data: unknown) => void) {
    return this.eventBus.on(event, handler)
  }

  once(event: string, handler: (data: unknown) => void) {
    return this.eventBus.once(event, handler)
  }

  off(subscriptionId: string): boolean {
    return this.eventBus.off(subscriptionId)
  }

  getFileContent(filePath: string): string | undefined {
    return this.fileContents.get(filePath)
  }

  private processFileChange(filePath: string, content: string): void {
    const previousContent = this.fileContents.get(filePath)
    const state = previousContent !== undefined
      ? this.changeDetector.getFileState(filePath, previousContent)
      : null

    const event = this.changeDetector.detectChange(filePath, state, content)
    if (event === null) return

    this.fileContents.set(filePath, content)
    this.eventsProcessed++
    this.eventBus.emit('change', event)
  }
}
