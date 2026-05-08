import { describe, it, expect, vi, beforeEach } from 'vitest'
import { FileWatcher } from '../../src/core/file-watcher/file-watcher.js'
import { DEFAULT_WATCH_CONFIG } from '../../src/core/file-watcher/types.js'

describe('FileWatcher', () => {
  let watcher: FileWatcher

  beforeEach(() => {
    watcher = new FileWatcher()
  })

  describe('Construction', () => {
    it('should use default config when none provided', () => {
      const w = new FileWatcher()
      expect(w.getState()).toBe('idle')
    })

    it('should accept custom config', () => {
      const w = new FileWatcher({ interval: 500, debounceMs: 200 })
      expect(w.getState()).toBe('idle')
    })

    it('should merge partial config with defaults', () => {
      const w = new FileWatcher({ interval: 2000 })
      expect(w.getState()).toBe('idle')
    })
  })

  describe('Watch/Unwatch', () => {
    it('should add paths to watch list', () => {
      const added = watcher.watch(['/src/a.ts', '/src/b.ts'])
      expect(added).toEqual(['/src/a.ts', '/src/b.ts'])
    })

    it('should return empty array when adding duplicates', () => {
      watcher.watch(['/src/a.ts'])
      const added = watcher.watch(['/src/a.ts'])
      expect(added).toEqual([])
    })

    it('should add only new paths when mix of new and existing', () => {
      watcher.watch(['/src/a.ts'])
      const added = watcher.watch(['/src/a.ts', '/src/b.ts'])
      expect(added).toEqual(['/src/b.ts'])
    })

    it('should remove paths from watch list', () => {
      watcher.watch(['/src/a.ts', '/src/b.ts'])
      const removed = watcher.unwatch(['/src/a.ts'])
      expect(removed).toEqual(['/src/a.ts'])
    })

    it('should return empty array when removing non-existent paths', () => {
      const removed = watcher.unwatch(['/src/missing.ts'])
      expect(removed).toEqual([])
    })

    it('should return all watched paths', () => {
      watcher.watch(['/src/a.ts', '/src/b.ts', '/src/c.ts'])
      expect(watcher.getWatchedPaths()).toEqual(['/src/a.ts', '/src/b.ts', '/src/c.ts'])
    })

    it('should return empty array when no paths watched', () => {
      expect(watcher.getWatchedPaths()).toEqual([])
    })

    it('should reflect removed paths in getWatchedPaths', () => {
      watcher.watch(['/src/a.ts', '/src/b.ts'])
      watcher.unwatch(['/src/a.ts'])
      expect(watcher.getWatchedPaths()).toEqual(['/src/b.ts'])
    })
  })

  describe('Tick', () => {
    it('should detect new file as create event', () => {
      watcher.watch(['/src/a.ts'])
      const events = watcher.tick({
        '/src/a.ts': { modified: 1000, size: 50, exists: true },
      })
      expect(events).toHaveLength(1)
      expect(events[0]!.type).toBe('create')
      expect(events[0]!.path).toBe('/src/a.ts')
    })

    it('should detect modified file as modify event', () => {
      watcher.watch(['/src/a.ts'])
      watcher.tick({ '/src/a.ts': { modified: 1000, size: 50, exists: true } })
      const events = watcher.tick({
        '/src/a.ts': { modified: 2000, size: 60, exists: true },
      })
      expect(events).toHaveLength(1)
      expect(events[0]!.type).toBe('modify')
    })

    it('should detect deleted file as delete event', () => {
      watcher.watch(['/src/a.ts'])
      watcher.tick({ '/src/a.ts': { modified: 1000, size: 50, exists: true } })
      const events = watcher.tick({ '/src/a.ts': { exists: false } })
      expect(events).toHaveLength(1)
      expect(events[0]!.type).toBe('delete')
    })

    it('should return no events when no changes', () => {
      watcher.watch(['/src/a.ts'])
      watcher.tick({ '/src/a.ts': { modified: 1000, size: 50, exists: true } })
      const events = watcher.tick({ '/src/a.ts': { modified: 1000, size: 50, exists: true } })
      expect(events).toHaveLength(0)
    })

    it('should detect deletion when path missing from fileChanges', () => {
      watcher.watch(['/src/a.ts'])
      watcher.tick({ '/src/a.ts': { modified: 1000, size: 50, exists: true } })
      const events = watcher.tick({})
      expect(events).toHaveLength(1)
      expect(events[0]!.type).toBe('delete')
    })

    it('should detect multiple changes in one tick', () => {
      watcher.watch(['/src/a.ts', '/src/b.ts'])
      watcher.tick({
        '/src/a.ts': { modified: 1000, size: 50, exists: true },
        '/src/b.ts': { modified: 1000, size: 30, exists: true },
      })
      const events = watcher.tick({
        '/src/a.ts': { modified: 2000, size: 60, exists: true },
        '/src/b.ts': { modified: 2000, size: 40, exists: true },
      })
      expect(events).toHaveLength(2)
    })

    it('should detect new file not in watch list as create', () => {
      watcher.watch(['/src/a.ts'])
      watcher.tick({ '/src/a.ts': { modified: 1000, size: 50, exists: true } })
      const events = watcher.tick({
        '/src/a.ts': { modified: 1000, size: 50, exists: true },
        '/src/new.ts': { modified: 1500, size: 20, exists: true },
      })
      expect(events).toHaveLength(1)
      expect(events[0]!.path).toBe('/src/new.ts')
      expect(events[0]!.type).toBe('create')
    })

    it('should include timestamps in events', () => {
      vi.useFakeTimers()
      const now = Date.now()
      watcher.watch(['/src/a.ts'])
      const events = watcher.tick({ '/src/a.ts': { modified: 1000, size: 50, exists: true } })
      expect(events[0]!.timestamp).toBeGreaterThanOrEqual(now)
      vi.useRealTimers()
    })
  })

  describe('Listeners', () => {
    it('should add and call listener via on', () => {
      watcher.watch(['/src/a.ts'])
      const listener = vi.fn()
      watcher.on(listener)
      watcher.tick({ '/src/a.ts': { modified: 1000, size: 50, exists: true } })
      expect(listener).toHaveBeenCalledTimes(1)
    })

    it('should remove listener via off', () => {
      watcher.watch(['/src/a.ts'])
      const listener = vi.fn()
      watcher.on(listener)
      watcher.off(listener)
      watcher.tick({ '/src/a.ts': { modified: 1000, size: 50, exists: true } })
      expect(listener).not.toHaveBeenCalled()
    })

    it('should call multiple listeners', () => {
      watcher.watch(['/src/a.ts'])
      const listener1 = vi.fn()
      const listener2 = vi.fn()
      watcher.on(listener1)
      watcher.on(listener2)
      watcher.tick({ '/src/a.ts': { modified: 1000, size: 50, exists: true } })
      expect(listener1).toHaveBeenCalledTimes(1)
      expect(listener2).toHaveBeenCalledTimes(1)
    })

    it('should auto-remove once listener after first event', () => {
      watcher.watch(['/src/a.ts'])
      const listener = vi.fn()
      watcher.once(listener)
      watcher.tick({ '/src/a.ts': { modified: 1000, size: 50, exists: true } })
      expect(listener).toHaveBeenCalledTimes(1)
      watcher.tick({ '/src/a.ts': { modified: 2000, size: 60, exists: true } })
      expect(listener).toHaveBeenCalledTimes(1)
    })

    it('should return unsubscribe function from on', () => {
      watcher.watch(['/src/a.ts'])
      const listener = vi.fn()
      const unsub = watcher.on(listener)
      unsub()
      watcher.tick({ '/src/a.ts': { modified: 1000, size: 50, exists: true } })
      expect(listener).not.toHaveBeenCalled()
    })

    it('should pass correct event to listener', () => {
      watcher.watch(['/src/a.ts'])
      const listener = vi.fn()
      watcher.on(listener)
      watcher.tick({ '/src/a.ts': { modified: 1000, size: 50, exists: true } })
      const event = listener.mock.calls[0]![0]
      expect(event.type).toBe('create')
      expect(event.path).toBe('/src/a.ts')
      expect(typeof event.timestamp).toBe('number')
    })

    it('should handle tick with no listeners without error', () => {
      watcher.watch(['/src/a.ts'])
      const events = watcher.tick({ '/src/a.ts': { modified: 1000, size: 50, exists: true } })
      expect(events).toHaveLength(1)
    })
  })

  describe('State management', () => {
    it('should start in idle state', () => {
      expect(watcher.getState()).toBe('idle')
    })

    it('should transition to watching on start', () => {
      watcher.start()
      expect(watcher.getState()).toBe('watching')
    })

    it('should transition to paused on pause', () => {
      watcher.start()
      watcher.pause()
      expect(watcher.getState()).toBe('paused')
    })

    it('should transition from paused to watching on resume', () => {
      watcher.start()
      watcher.pause()
      watcher.resume()
      expect(watcher.getState()).toBe('watching')
    })

    it('should transition to stopped on stop', () => {
      watcher.start()
      watcher.stop()
      expect(watcher.getState()).toBe('stopped')
    })

    it('should clear entries on stop', () => {
      watcher.watch(['/src/a.ts', '/src/b.ts'])
      watcher.start()
      watcher.stop()
      expect(watcher.getWatchedPaths()).toEqual([])
    })

    it('should allow idle to watching transition', () => {
      watcher.start()
      expect(watcher.getState()).toBe('watching')
    })

    it('should allow watching to paused transition', () => {
      watcher.start()
      watcher.pause()
      expect(watcher.getState()).toBe('paused')
    })

    it('should allow paused to watching transition', () => {
      watcher.start()
      watcher.pause()
      watcher.resume()
      expect(watcher.getState()).toBe('watching')
    })
  })

  describe('Ignore patterns', () => {
    it('should ignore exact match path', () => {
      const w = new FileWatcher({ ignorePatterns: ['/src/ignore.ts'] })
      expect(w.shouldIgnore('/src/ignore.ts')).toBe(true)
    })

    it('should not ignore non-matching path', () => {
      const w = new FileWatcher({ ignorePatterns: ['/src/ignore.ts'] })
      expect(w.shouldIgnore('/src/other.ts')).toBe(false)
    })

    it('should ignore glob pattern with *', () => {
      const w = new FileWatcher({ ignorePatterns: ['*.log'] })
      expect(w.shouldIgnore('debug.log')).toBe(true)
      expect(w.shouldIgnore('error.log')).toBe(true)
    })

    it('should not match partial glob', () => {
      const w = new FileWatcher({ ignorePatterns: ['*.log'] })
      expect(w.shouldIgnore('debug.log.txt')).toBe(false)
    })

    it('should handle directory glob patterns', () => {
      const w = new FileWatcher({ ignorePatterns: ['node_modules/*'] })
      expect(w.shouldIgnore('node_modules/package.json')).toBe(true)
      expect(w.shouldIgnore('src/node_modules/package.json')).toBe(false)
    })

    it('should return false with no patterns', () => {
      expect(watcher.shouldIgnore('/src/anything.ts')).toBe(false)
    })

    it('should handle multiple patterns', () => {
      const w = new FileWatcher({ ignorePatterns: ['*.log', '*.tmp', '/dist/*'] })
      expect(w.shouldIgnore('debug.log')).toBe(true)
      expect(w.shouldIgnore('temp.tmp')).toBe(true)
      expect(w.shouldIgnore('/dist/bundle.js')).toBe(true)
      expect(w.shouldIgnore('/src/main.ts')).toBe(false)
    })

    it('should skip ignored paths in tick', () => {
      const w = new FileWatcher({ ignorePatterns: ['/src/ignore.ts'] })
      w.watch(['/src/a.ts', '/src/ignore.ts'])
      const events = w.tick({
        '/src/a.ts': { modified: 1000, size: 50, exists: true },
        '/src/ignore.ts': { modified: 1000, size: 50, exists: true },
      })
      expect(events).toHaveLength(1)
      expect(events[0]!.path).toBe('/src/a.ts')
    })
  })

  describe('Debounce', () => {
    it('should combine events for same path keeping last', () => {
      const events = [
        { type: 'create' as const, path: '/src/a.ts', timestamp: 1000 },
        { type: 'modify' as const, path: '/src/a.ts', timestamp: 2000 },
      ]
      const debounced = watcher.debounce(events)
      expect(debounced).toHaveLength(1)
      expect(debounced[0]!.type).toBe('modify')
    })

    it('should not combine events for different paths', () => {
      const events = [
        { type: 'create' as const, path: '/src/a.ts', timestamp: 1000 },
        { type: 'create' as const, path: '/src/b.ts', timestamp: 1000 },
      ]
      const debounced = watcher.debounce(events)
      expect(debounced).toHaveLength(2)
    })

    it('should keep latest timestamp for same path', () => {
      const events = [
        { type: 'create' as const, path: '/src/a.ts', timestamp: 3000 },
        { type: 'modify' as const, path: '/src/a.ts', timestamp: 1000 },
      ]
      const debounced = watcher.debounce(events)
      expect(debounced).toHaveLength(1)
      expect(debounced[0]!.timestamp).toBe(3000)
    })

    it('should return empty array for no events', () => {
      const debounced = watcher.debounce([])
      expect(debounced).toHaveLength(0)
    })

    it('should handle three events for same path', () => {
      const events = [
        { type: 'create' as const, path: '/src/a.ts', timestamp: 1000 },
        { type: 'modify' as const, path: '/src/a.ts', timestamp: 2000 },
        { type: 'delete' as const, path: '/src/a.ts', timestamp: 3000 },
      ]
      const debounced = watcher.debounce(events)
      expect(debounced).toHaveLength(1)
      expect(debounced[0]!.type).toBe('delete')
    })

    it('should handle mixed same and different paths', () => {
      const events = [
        { type: 'create' as const, path: '/src/a.ts', timestamp: 1000 },
        { type: 'modify' as const, path: '/src/a.ts', timestamp: 2000 },
        { type: 'create' as const, path: '/src/b.ts', timestamp: 1500 },
      ]
      const debounced = watcher.debounce(events)
      expect(debounced).toHaveLength(2)
    })
  })

  describe('DiffEntries', () => {
    it('should detect create event for new entry', () => {
      const oldEntries = new Map<string, { path: string; lastModified: number; size: number; exists: boolean }>()
      const newSnapshot = new Map<string, { path: string; lastModified: number; size: number; exists: boolean }>()
      newSnapshot.set('/src/a.ts', { path: '/src/a.ts', lastModified: 1000, size: 50, exists: true })

      const events = watcher.diffEntries(oldEntries, newSnapshot)
      expect(events).toHaveLength(1)
      expect(events[0]!.type).toBe('create')
    })

    it('should detect modify event for changed entry', () => {
      const oldEntries = new Map<string, { path: string; lastModified: number; size: number; exists: boolean }>()
      oldEntries.set('/src/a.ts', { path: '/src/a.ts', lastModified: 1000, size: 50, exists: true })
      const newSnapshot = new Map<string, { path: string; lastModified: number; size: number; exists: boolean }>()
      newSnapshot.set('/src/a.ts', { path: '/src/a.ts', lastModified: 2000, size: 60, exists: true })

      const events = watcher.diffEntries(oldEntries, newSnapshot)
      expect(events).toHaveLength(1)
      expect(events[0]!.type).toBe('modify')
    })

    it('should detect delete event for removed entry', () => {
      const oldEntries = new Map<string, { path: string; lastModified: number; size: number; exists: boolean }>()
      oldEntries.set('/src/a.ts', { path: '/src/a.ts', lastModified: 1000, size: 50, exists: true })
      const newSnapshot = new Map<string, { path: string; lastModified: number; size: number; exists: boolean }>()

      const events = watcher.diffEntries(oldEntries, newSnapshot)
      expect(events).toHaveLength(1)
      expect(events[0]!.type).toBe('delete')
    })

    it('should detect delete when exists changes to false', () => {
      const oldEntries = new Map<string, { path: string; lastModified: number; size: number; exists: boolean }>()
      oldEntries.set('/src/a.ts', { path: '/src/a.ts', lastModified: 1000, size: 50, exists: true })
      const newSnapshot = new Map<string, { path: string; lastModified: number; size: number; exists: boolean }>()
      newSnapshot.set('/src/a.ts', { path: '/src/a.ts', lastModified: 1000, size: 50, exists: false })

      const events = watcher.diffEntries(oldEntries, newSnapshot)
      expect(events).toHaveLength(1)
      expect(events[0]!.type).toBe('delete')
    })

    it('should return no events for identical snapshots', () => {
      const oldEntries = new Map<string, { path: string; lastModified: number; size: number; exists: boolean }>()
      oldEntries.set('/src/a.ts', { path: '/src/a.ts', lastModified: 1000, size: 50, exists: true })
      const newSnapshot = new Map<string, { path: string; lastModified: number; size: number; exists: boolean }>()
      newSnapshot.set('/src/a.ts', { path: '/src/a.ts', lastModified: 1000, size: 50, exists: true })

      const events = watcher.diffEntries(oldEntries, newSnapshot)
      expect(events).toHaveLength(0)
    })

    it('should detect create for entry transitioning from non-existent to existent', () => {
      const oldEntries = new Map<string, { path: string; lastModified: number; size: number; exists: boolean }>()
      oldEntries.set('/src/a.ts', { path: '/src/a.ts', lastModified: 0, size: 0, exists: false })
      const newSnapshot = new Map<string, { path: string; lastModified: number; size: number; exists: boolean }>()
      newSnapshot.set('/src/a.ts', { path: '/src/a.ts', lastModified: 1000, size: 50, exists: true })

      const events = watcher.diffEntries(oldEntries, newSnapshot)
      expect(events).toHaveLength(1)
      expect(events[0]!.type).toBe('create')
    })

    it('should handle multiple diffs', () => {
      const oldEntries = new Map<string, { path: string; lastModified: number; size: number; exists: boolean }>()
      oldEntries.set('/src/a.ts', { path: '/src/a.ts', lastModified: 1000, size: 50, exists: true })
      oldEntries.set('/src/b.ts', { path: '/src/b.ts', lastModified: 1000, size: 30, exists: true })
      const newSnapshot = new Map<string, { path: string; lastModified: number; size: number; exists: boolean }>()
      newSnapshot.set('/src/a.ts', { path: '/src/a.ts', lastModified: 2000, size: 60, exists: true })
      newSnapshot.set('/src/c.ts', { path: '/src/c.ts', lastModified: 1500, size: 20, exists: true })

      const events = watcher.diffEntries(oldEntries, newSnapshot)
      expect(events).toHaveLength(3)
    })
  })

  describe('Statistics', () => {
    it('should track watched paths count', () => {
      watcher.watch(['/src/a.ts', '/src/b.ts'])
      expect(watcher.getStatistics().watchedPaths).toBe(2)
    })

    it('should track total events', () => {
      watcher.watch(['/src/a.ts'])
      watcher.tick({ '/src/a.ts': { modified: 1000, size: 50, exists: true } })
      watcher.tick({ '/src/a.ts': { modified: 2000, size: 60, exists: true } })
      expect(watcher.getStatistics().totalEvents).toBe(2)
    })

    it('should track listeners count', () => {
      const listener1 = vi.fn()
      const listener2 = vi.fn()
      watcher.on(listener1)
      watcher.on(listener2)
      expect(watcher.getStatistics().listeners).toBe(2)
    })

    it('should include once listeners in count', () => {
      const listener = vi.fn()
      watcher.once(listener)
      expect(watcher.getStatistics().listeners).toBe(1)
    })

    it('should update listeners count after removal', () => {
      const listener = vi.fn()
      watcher.on(listener)
      watcher.off(listener)
      expect(watcher.getStatistics().listeners).toBe(0)
    })

    it('should return zero for initial statistics', () => {
      const stats = watcher.getStatistics()
      expect(stats.watchedPaths).toBe(0)
      expect(stats.totalEvents).toBe(0)
      expect(stats.listeners).toBe(0)
    })
  })

  describe('getSnapshot', () => {
    it('should return copy of current entries', () => {
      watcher.watch(['/src/a.ts'])
      const snapshot = watcher.getSnapshot()
      expect(snapshot).not.toBe(watcher.getSnapshot())
      expect(snapshot.size).toBe(1)
    })

    it('should reflect current state after tick', () => {
      watcher.watch(['/src/a.ts'])
      watcher.tick({ '/src/a.ts': { modified: 1000, size: 50, exists: true } })
      const snapshot = watcher.getSnapshot()
      const entry = snapshot.get('/src/a.ts')
      expect(entry!.exists).toBe(true)
      expect(entry!.lastModified).toBe(1000)
      expect(entry!.size).toBe(50)
    })

    it('should return empty map when no entries', () => {
      const snapshot = watcher.getSnapshot()
      expect(snapshot.size).toBe(0)
    })
  })

  describe('Edge cases', () => {
    it('should handle empty watch list tick', () => {
      const events = watcher.tick({ '/src/a.ts': { modified: 1000, size: 50, exists: true } })
      expect(events).toHaveLength(1)
    })

    it('should handle tick with empty fileChanges', () => {
      watcher.watch(['/src/a.ts'])
      const events = watcher.tick({})
      expect(events).toHaveLength(0)
    })

    it('should handle tick with no listeners', () => {
      watcher.watch(['/src/a.ts'])
      const events = watcher.tick({ '/src/a.ts': { modified: 1000, size: 50, exists: true } })
      expect(events).toHaveLength(1)
    })

    it('should handle size-only change as modify', () => {
      watcher.watch(['/src/a.ts'])
      watcher.tick({ '/src/a.ts': { modified: 1000, size: 50, exists: true } })
      const events = watcher.tick({ '/src/a.ts': { modified: 1000, size: 60, exists: true } })
      expect(events).toHaveLength(1)
      expect(events[0]!.type).toBe('modify')
    })

    it('should handle file re-creation after deletion', () => {
      watcher.watch(['/src/a.ts'])
      watcher.tick({ '/src/a.ts': { modified: 1000, size: 50, exists: true } })
      watcher.tick({ '/src/a.ts': { exists: false } })
      const events = watcher.tick({ '/src/a.ts': { modified: 2000, size: 30, exists: true } })
      expect(events).toHaveLength(1)
      expect(events[0]!.type).toBe('create')
    })

    it('should handle watch with empty array', () => {
      const added = watcher.watch([])
      expect(added).toEqual([])
    })

    it('should handle unwatch with empty array', () => {
      const removed = watcher.unwatch([])
      expect(removed).toEqual([])
    })
  })

  describe('Additional edge cases', () => {
    it('should handle consecutive stop calls', () => {
      watcher.start()
      watcher.stop()
      watcher.stop()
      expect(watcher.getState()).toBe('stopped')
    })

    it('should handle resume without prior pause', () => {
      watcher.start()
      watcher.resume()
      expect(watcher.getState()).toBe('watching')
    })

    it('should handle pause from idle state', () => {
      watcher.pause()
      expect(watcher.getState()).toBe('paused')
    })

    it('should detect modify via timestamp-only change', () => {
      watcher.watch(['/src/a.ts'])
      watcher.tick({ '/src/a.ts': { modified: 1000, size: 50, exists: true } })
      const events = watcher.tick({ '/src/a.ts': { modified: 2000, size: 50, exists: true } })
      expect(events).toHaveLength(1)
      expect(events[0]!.type).toBe('modify')
    })

    it('should not emit event for already-deleted file missing from changes', () => {
      watcher.watch(['/src/a.ts'])
      watcher.tick({})
      const events = watcher.tick({})
      expect(events).toHaveLength(0)
    })

    it('should handle unwatch then re-watch same path', () => {
      watcher.watch(['/src/a.ts'])
      watcher.tick({ '/src/a.ts': { modified: 1000, size: 50, exists: true } })
      watcher.unwatch(['/src/a.ts'])
      watcher.watch(['/src/a.ts'])
      const events = watcher.tick({ '/src/a.ts': { modified: 2000, size: 60, exists: true } })
      expect(events).toHaveLength(1)
      expect(events[0]!.type).toBe('create')
    })

    it('should handle multiple once listeners independently', () => {
      watcher.watch(['/src/a.ts', '/src/b.ts'])
      const onceA = vi.fn()
      const onceB = vi.fn()
      watcher.once(onceA)
      watcher.once(onceB)
      watcher.tick({ '/src/a.ts': { modified: 1000, size: 50, exists: true } })
      expect(onceA).toHaveBeenCalledTimes(1)
      expect(onceB).toHaveBeenCalledTimes(1)
    })

    it('should handle once listener followed by regular listener', () => {
      watcher.watch(['/src/a.ts'])
      const onceListener = vi.fn()
      const regularListener = vi.fn()
      watcher.once(onceListener)
      watcher.on(regularListener)
      watcher.tick({ '/src/a.ts': { modified: 1000, size: 50, exists: true } })
      watcher.tick({ '/src/a.ts': { modified: 2000, size: 60, exists: true } })
      expect(onceListener).toHaveBeenCalledTimes(1)
      expect(regularListener).toHaveBeenCalledTimes(2)
    })

    it('should handle unsubscribe after event already fired', () => {
      watcher.watch(['/src/a.ts'])
      const listener = vi.fn()
      const unsub = watcher.on(listener)
      watcher.tick({ '/src/a.ts': { modified: 1000, size: 50, exists: true } })
      unsub()
      watcher.tick({ '/src/a.ts': { modified: 2000, size: 60, exists: true } })
      expect(listener).toHaveBeenCalledTimes(1)
    })

    it('should track event count accurately across operations', () => {
      watcher.watch(['/src/a.ts', '/src/b.ts'])
      watcher.tick({
        '/src/a.ts': { modified: 1000, size: 50, exists: true },
        '/src/b.ts': { modified: 1000, size: 30, exists: true },
      })
      watcher.tick({ '/src/a.ts': { modified: 2000, size: 60, exists: true } })
      watcher.tick({ '/src/b.ts': { exists: false } })
      expect(watcher.getStatistics().totalEvents).toBe(5)
    })

    it('should handle wildcard in middle of pattern', () => {
      const w = new FileWatcher({ ignorePatterns: ['/src/*/test.ts'] })
      expect(w.shouldIgnore('/src/foo/test.ts')).toBe(true)
      expect(w.shouldIgnore('/src/bar/test.ts')).toBe(true)
      expect(w.shouldIgnore('/src/foo/other.ts')).toBe(false)
    })
  })
})

describe('DEFAULT_WATCH_CONFIG', () => {
  it('should have correct default values', () => {
    expect(DEFAULT_WATCH_CONFIG.interval).toBe(1000)
    expect(DEFAULT_WATCH_CONFIG.ignorePatterns).toEqual([])
    expect(DEFAULT_WATCH_CONFIG.debounceMs).toBe(100)
    expect(DEFAULT_WATCH_CONFIG.persistent).toBe(false)
  })
})
