import { existsSync, watch } from 'node:fs'
import path from 'node:path'

import type { ModuleCache } from './module-cache.js'

type ReloadCallback = (filePath: string, module: unknown) => void
type ErrorCallback = (filePath: string, error: Error) => void

interface WatcherEntry {
  debounceTimer: ReturnType<typeof setTimeout> | null
  watcher: ReturnType<typeof watch>
}

export class PluginHotReloader {
  private debounceMs: number
  private cache: ModuleCache
  private watchers = new Map<string, WatcherEntry>()
  private reloadCallbacks: ReloadCallback[] = []
  private errorCallbacks: ErrorCallback[] = []

  constructor(cache: ModuleCache, options?: { debounceMs?: number }) {
    this.cache = cache
    this.debounceMs = options?.debounceMs ?? 100
  }

  public get watchedPaths(): string[] {
    return [...this.watchers.keys()]
  }

  public watch(pluginPaths: string[]): void {
    for (const raw of pluginPaths) {
      const resolved = path.resolve(raw)
      if (this.watchers.has(resolved)) continue

      const fsWatcher = watch(resolved, (eventType) => {
        if (eventType === 'rename' && !existsSync(resolved)) {
          this.unwatch(resolved)
          return
        }

        const entry = this.watchers.get(resolved)
        if (!entry) return

        if (entry.debounceTimer !== null) {
          clearTimeout(entry.debounceTimer)
        }

        entry.debounceTimer = setTimeout(() => {
          void this.handleReload(resolved)
        }, this.debounceMs)
      })

      this.watchers.set(resolved, { debounceTimer: null, watcher: fsWatcher })
    }
  }

  public unwatch(pluginPath: string): void {
    const resolved = path.resolve(pluginPath)
    const entry = this.watchers.get(resolved)
    if (!entry) return
    if (entry.debounceTimer !== null) clearTimeout(entry.debounceTimer)
    entry.watcher.close()
    this.watchers.delete(resolved)
  }

  public stop(): void {
    for (const [resolved, entry] of this.watchers) {
      if (entry.debounceTimer !== null) clearTimeout(entry.debounceTimer)
      entry.watcher.close()
      this.watchers.delete(resolved)
    }
  }

  public onReload(callback: ReloadCallback): void {
    this.reloadCallbacks.push(callback)
  }

  public onError(callback: ErrorCallback): void {
    this.errorCallbacks.push(callback)
  }

  private async handleReload(resolvedPath: string): Promise<void> {
    try {
      const reloaded = await this.cache.reload(resolvedPath)
      for (const cb of this.reloadCallbacks) {
        cb(resolvedPath, reloaded)
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err))
      for (const cb of this.errorCallbacks) {
        cb(resolvedPath, error)
      }
    }
  }
}
