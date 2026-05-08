import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { EventBus } from '../../src/core/watcher/event-bus.js'
import { ChangeDetector } from '../../src/core/watcher/change-detector.js'
import { WatcherEngine } from '../../src/core/watcher/watcher-engine.js'
import type { Subscription, FileChangeEvent, FileState } from '../../src/core/watcher/types.js'
import { DEFAULT_WATCHER_CONFIG } from '../../src/core/watcher/types.js'

describe('EventBus', () => {
  let bus: EventBus

  beforeEach(() => {
    bus = new EventBus()
  })

  describe('on', () => {
    it('should register a subscription and return it', () => {
      const handler = vi.fn()
      const sub = bus.on('test', handler)
      expect(sub.id).toBe('sub_1')
      expect(sub.event).toBe('test')
      expect(sub.once).toBe(false)
    })

    it('should register multiple subscriptions with incrementing ids', () => {
      const sub1 = bus.on('a', vi.fn())
      const sub2 = bus.on('b', vi.fn())
      expect(sub1.id).toBe('sub_1')
      expect(sub2.id).toBe('sub_2')
    })

    it('should allow registering multiple handlers for the same event', () => {
      const h1 = vi.fn()
      const h2 = vi.fn()
      bus.on('test', h1)
      bus.on('test', h2)
      bus.emit('test', 'data')
      expect(h1).toHaveBeenCalledWith('data')
      expect(h2).toHaveBeenCalledWith('data')
    })
  })

  describe('once', () => {
    it('should register a once subscription', () => {
      const handler = vi.fn()
      const sub = bus.once('test', handler)
      expect(sub.once).toBe(true)
    })

    it('should invoke handler only once then remove it', () => {
      const handler = vi.fn()
      bus.once('test', handler)
      bus.emit('test', 'first')
      bus.emit('test', 'second')
      expect(handler).toHaveBeenCalledTimes(1)
      expect(handler).toHaveBeenCalledWith('first')
    })

    it('should not interfere with persistent subscriptions', () => {
      const onceHandler = vi.fn()
      const persistHandler = vi.fn()
      bus.once('test', onceHandler)
      bus.on('test', persistHandler)
      bus.emit('test', 1)
      bus.emit('test', 2)
      expect(onceHandler).toHaveBeenCalledTimes(1)
      expect(persistHandler).toHaveBeenCalledTimes(2)
    })
  })

  describe('off', () => {
    it('should remove a subscription and return true', () => {
      const sub = bus.on('test', vi.fn())
      expect(bus.off(sub.id)).toBe(true)
    })

    it('should return false for unknown subscription id', () => {
      expect(bus.off('nonexistent')).toBe(false)
    })

    it('should prevent handler from being called after removal', () => {
      const handler = vi.fn()
      const sub = bus.on('test', handler)
      bus.off(sub.id)
      bus.emit('test', 'data')
      expect(handler).not.toHaveBeenCalled()
    })

    it('should not affect other subscriptions when removing one', () => {
      const h1 = vi.fn()
      const h2 = vi.fn()
      const sub1 = bus.on('test', h1)
      bus.on('test', h2)
      bus.off(sub1.id)
      bus.emit('test', 'data')
      expect(h1).not.toHaveBeenCalled()
      expect(h2).toHaveBeenCalledWith('data')
    })
  })

  describe('emit', () => {
    it('should call all handlers for the matching event', () => {
      const handler = vi.fn()
      bus.on('change', handler)
      bus.emit('change', { type: 'add' })
      expect(handler).toHaveBeenCalledWith({ type: 'add' })
    })

    it('should not call handlers for different events', () => {
      const handler = vi.fn()
      bus.on('change', handler)
      bus.emit('other', 'data')
      expect(handler).not.toHaveBeenCalled()
    })

    it('should handle emitting with no subscribers', () => {
      expect(() => bus.emit('unclaimed', 'data')).not.toThrow()
    })

    it('should pass data to all matching handlers', () => {
      const results: unknown[] = []
      bus.on('test', (d) => results.push(d))
      bus.on('test', (d) => results.push(d))
      bus.emit('test', 42)
      expect(results).toEqual([42, 42])
    })
  })

  describe('getSubscriptions', () => {
    it('should return all subscriptions when no event filter', () => {
      bus.on('a', vi.fn())
      bus.on('b', vi.fn())
      expect(bus.getSubscriptions()).toHaveLength(2)
    })

    it('should filter subscriptions by event name', () => {
      bus.on('a', vi.fn())
      bus.on('b', vi.fn())
      bus.on('a', vi.fn())
      expect(bus.getSubscriptions('a')).toHaveLength(2)
      expect(bus.getSubscriptions('b')).toHaveLength(1)
    })

    it('should return empty array for event with no subscriptions', () => {
      expect(bus.getSubscriptions('none')).toEqual([])
    })

    it('should return empty array after clear', () => {
      bus.on('test', vi.fn())
      bus.clear()
      expect(bus.getSubscriptions()).toEqual([])
    })
  })

  describe('clear', () => {
    it('should remove all subscriptions', () => {
      bus.on('a', vi.fn())
      bus.on('b', vi.fn())
      bus.on('c', vi.fn())
      bus.clear()
      expect(bus.getSubscriptions()).toHaveLength(0)
    })
  })

  describe('listenerCount', () => {
    it('should return 0 for event with no listeners', () => {
      expect(bus.listenerCount('none')).toBe(0)
    })

    it('should count listeners for a specific event', () => {
      bus.on('test', vi.fn())
      bus.on('test', vi.fn())
      bus.on('other', vi.fn())
      expect(bus.listenerCount('test')).toBe(2)
    })

    it('should update count after removing a subscription', () => {
      const sub = bus.on('test', vi.fn())
      bus.off(sub.id)
      expect(bus.listenerCount('test')).toBe(0)
    })

    it('should not count once subscriptions that have fired', () => {
      bus.once('test', vi.fn())
      bus.emit('test', null)
      expect(bus.listenerCount('test')).toBe(0)
    })
  })
})

describe('ChangeDetector', () => {
  let detector: ChangeDetector

  beforeEach(() => {
    detector = new ChangeDetector()
  })

  describe('computeHash', () => {
    it('should return a string hash', () => {
      const hash = detector.computeHash('hello')
      expect(typeof hash).toBe('string')
    })

    it('should return consistent hash for the same content', () => {
      const h1 = detector.computeHash('test content')
      const h2 = detector.computeHash('test content')
      expect(h1).toBe(h2)
    })

    it('should return different hashes for different content', () => {
      const h1 = detector.computeHash('content A')
      const h2 = detector.computeHash('content B')
      expect(h1).not.toBe(h2)
    })

    it('should handle empty string', () => {
      const hash = detector.computeHash('')
      expect(typeof hash).toBe('string')
    })
  })

  describe('getFileState', () => {
    it('should return a FileState with correct properties', () => {
      const state = detector.getFileState('/path/to/file.ts', 'content')
      expect(state.filePath).toBe('/path/to/file.ts')
      expect(state.exists).toBe(true)
      expect(state.size).toBe(7)
      expect(state.hash).toBe(detector.computeHash('content'))
      expect(state.lastModified).toBeGreaterThan(0)
    })

    it('should compute size correctly', () => {
      const state = detector.getFileState('f', 'abc')
      expect(state.size).toBe(3)
    })

    it('should set exists to true', () => {
      const state = detector.getFileState('f', '')
      expect(state.exists).toBe(true)
    })
  })

  describe('detectChange', () => {
    it('should return add event when no previous state exists', () => {
      const event = detector.detectChange('/file.ts', null, 'content')
      expect(event).not.toBeNull()
      expect(event!.type).toBe('add')
      expect(event!.filePath).toBe('/file.ts')
      expect(event!.content).toBe('content')
    })

    it('should return add event when previous state has exists=false', () => {
      const state: FileState = {
        filePath: '/file.ts',
        hash: 'abc',
        lastModified: 1000,
        size: 5,
        exists: false,
      }
      const event = detector.detectChange('/file.ts', state, 'new content')
      expect(event!.type).toBe('add')
    })

    it('should return null when content has not changed', () => {
      const content = 'same content'
      const state = detector.getFileState('/file.ts', content)
      const event = detector.detectChange('/file.ts', state, content)
      expect(event).toBeNull()
    })

    it('should return change event when content differs', () => {
      const state = detector.getFileState('/file.ts', 'old content')
      const event = detector.detectChange('/file.ts', state, 'new content')
      expect(event).not.toBeNull()
      expect(event!.type).toBe('change')
      expect(event!.filePath).toBe('/file.ts')
      expect(event!.content).toBe('new content')
      expect(event!.oldContent).toBe(state.hash)
    })

    it('should include timestamp in the event', () => {
      const event = detector.detectChange('/file.ts', null, 'content')
      expect(event!.timestamp).toBeGreaterThan(0)
    })
  })

  describe('batchDetect', () => {
    it('should detect new files', () => {
      const files = new Map<string, string>()
      files.set('/new.ts', 'content')
      const previous = new Map<string, FileState>()
      const events = detector.batchDetect(files, previous)
      expect(events).toHaveLength(1)
      expect(events[0]!.type).toBe('add')
    })

    it('should detect changed files', () => {
      const state = detector.getFileState('/file.ts', 'old')
      const files = new Map<string, string>()
      files.set('/file.ts', 'new')
      const previous = new Map<string, FileState>()
      previous.set('/file.ts', state)
      const events = detector.batchDetect(files, previous)
      expect(events).toHaveLength(1)
      expect(events[0]!.type).toBe('change')
    })

    it('should detect deleted files', () => {
      const state = detector.getFileState('/file.ts', 'content')
      const files = new Map<string, string>()
      const previous = new Map<string, FileState>()
      previous.set('/file.ts', state)
      const events = detector.batchDetect(files, previous)
      expect(events).toHaveLength(1)
      expect(events[0]!.type).toBe('unlink')
    })

    it('should return empty array when nothing changed', () => {
      const content = 'same'
      const state = detector.getFileState('/file.ts', content)
      const files = new Map<string, string>()
      files.set('/file.ts', content)
      const previous = new Map<string, FileState>()
      previous.set('/file.ts', state)
      const events = detector.batchDetect(files, previous)
      expect(events).toHaveLength(0)
    })

    it('should handle mixed add, change, and delete', () => {
      const state1 = detector.getFileState('/changed.ts', 'old')
      const state2 = detector.getFileState('/deleted.ts', 'bye')
      const files = new Map<string, string>()
      files.set('/changed.ts', 'new')
      files.set('/added.ts', 'fresh')
      const previous = new Map<string, FileState>()
      previous.set('/changed.ts', state1)
      previous.set('/deleted.ts', state2)
      const events = detector.batchDetect(files, previous)
      expect(events).toHaveLength(3)
      const types = events.map((e) => e.type).sort()
      expect(types).toContain('add')
      expect(types).toContain('change')
      expect(types).toContain('unlink')
    })

    it('should not detect unlink for previously non-existent files', () => {
      const state: FileState = {
        filePath: '/ghost.ts',
        hash: 'abc',
        lastModified: 1000,
        size: 3,
        exists: false,
      }
      const files = new Map<string, string>()
      const previous = new Map<string, FileState>()
      previous.set('/ghost.ts', state)
      const events = detector.batchDetect(files, previous)
      expect(events).toHaveLength(0)
    })
  })

  describe('classifyChange', () => {
    it('should classify add as major', () => {
      const event: FileChangeEvent = { type: 'add', filePath: '/f.ts', timestamp: 0 }
      expect(detector.classifyChange(event)).toBe('major')
    })

    it('should classify unlink as major', () => {
      const event: FileChangeEvent = { type: 'unlink', filePath: '/f.ts', timestamp: 0 }
      expect(detector.classifyChange(event)).toBe('major')
    })

    it('should classify addDir as major', () => {
      const event: FileChangeEvent = { type: 'addDir', filePath: '/dir', timestamp: 0 }
      expect(detector.classifyChange(event)).toBe('major')
    })

    it('should classify unlinkDir as major', () => {
      const event: FileChangeEvent = { type: 'unlinkDir', filePath: '/dir', timestamp: 0 }
      expect(detector.classifyChange(event)).toBe('major')
    })

    it('should classify change as minor', () => {
      const event: FileChangeEvent = {
        type: 'change',
        filePath: '/f.ts',
        timestamp: 0,
        content: 'new',
        oldContent: 'old',
      }
      expect(detector.classifyChange(event)).toBe('minor')
    })

    it('should classify change without content details as minor', () => {
      const event: FileChangeEvent = { type: 'change', filePath: '/f.ts', timestamp: 0 }
      expect(detector.classifyChange(event)).toBe('minor')
    })
  })
})

describe('WatcherEngine', () => {
  let engine: WatcherEngine

  beforeEach(() => {
    vi.useFakeTimers()
    engine = new WatcherEngine({ debounceMs: 0 })
  })

  afterEach(() => {
    engine.stop()
    vi.useRealTimers()
  })

  describe('constructor', () => {
    it('should create engine with default config', () => {
      const e = new WatcherEngine()
      expect(e.isRunning()).toBe(false)
    })

    it('should accept partial config', () => {
      const e = new WatcherEngine({ debounceMs: 200 })
      expect(e.isRunning()).toBe(false)
    })

    it('should register initial paths from config', () => {
      const e = new WatcherEngine({ paths: ['/src', '/lib'] })
      expect(e.getWatchedPaths()).toEqual(['/src', '/lib'])
    })
  })

  describe('start/stop', () => {
    it('should start the watcher', () => {
      engine.start()
      expect(engine.isRunning()).toBe(true)
    })

    it('should not double-start', () => {
      engine.start()
      engine.start()
      expect(engine.isRunning()).toBe(true)
    })

    it('should stop the watcher', () => {
      engine.start()
      engine.stop()
      expect(engine.isRunning()).toBe(false)
    })

    it('should not double-stop', () => {
      engine.start()
      engine.stop()
      engine.stop()
      expect(engine.isRunning()).toBe(false)
    })

    it('should emit start event', () => {
      const handler = vi.fn()
      engine.on('start', handler)
      engine.start()
      expect(handler).toHaveBeenCalledTimes(1)
    })

    it('should emit stop event', () => {
      const handler = vi.fn()
      engine.on('stop', handler)
      engine.start()
      engine.stop()
      expect(handler).toHaveBeenCalledTimes(1)
    })
  })

  describe('addPath/removePath', () => {
    it('should add a path', () => {
      engine.addPath('/src')
      expect(engine.getWatchedPaths()).toContain('/src')
    })

    it('should not duplicate paths', () => {
      engine.addPath('/src')
      engine.addPath('/src')
      expect(engine.getWatchedPaths().filter((p) => p === '/src')).toHaveLength(1)
    })

    it('should remove a path', () => {
      engine.addPath('/src')
      engine.removePath('/src')
      expect(engine.getWatchedPaths()).not.toContain('/src')
    })

    it('should emit pathAdded event when running', () => {
      const handler = vi.fn()
      engine.on('pathAdded', handler)
      engine.start()
      engine.addPath('/new')
      expect(handler).toHaveBeenCalledTimes(1)
    })

    it('should not emit pathAdded when not running', () => {
      const handler = vi.fn()
      engine.on('pathAdded', handler)
      engine.addPath('/new')
      expect(handler).not.toHaveBeenCalled()
    })

    it('should emit pathRemoved event when running', () => {
      const handler = vi.fn()
      engine.on('pathRemoved', handler)
      engine.addPath('/src')
      engine.start()
      engine.removePath('/src')
      expect(handler).toHaveBeenCalledTimes(1)
    })

    it('should clear file content when path is removed', () => {
      engine.start()
      engine.addPath('/src')
      engine.simulateFileChange('/src', 'content')
      vi.advanceTimersByTime(1)
      engine.removePath('/src')
      expect(engine.getFileContent('/src')).toBeUndefined()
    })
  })

  describe('getStats', () => {
    it('should return initial stats when not started', () => {
      const stats = engine.getStats()
      expect(stats.filesWatched).toBe(0)
      expect(stats.dirsWatched).toBe(0)
      expect(stats.eventsProcessed).toBe(0)
      expect(stats.uptime).toBe(0)
    })

    it('should track uptime when running', () => {
      engine.start()
      vi.advanceTimersByTime(5000)
      const stats = engine.getStats()
      expect(stats.uptime).toBe(5000)
    })

    it('should track eventsProcessed', () => {
      engine.start()
      engine.simulateFileChange('/file.ts', 'content')
      vi.advanceTimersByTime(1)
      expect(engine.getStats().eventsProcessed).toBe(1)
    })

    it('should report uptime 0 after stop', () => {
      engine.start()
      vi.advanceTimersByTime(5000)
      engine.stop()
      expect(engine.getStats().uptime).toBe(0)
    })

    it('should track startTime', () => {
      const before = Date.now()
      engine.start()
      const stats = engine.getStats()
      expect(stats.startTime).toBeGreaterThanOrEqual(before)
    })

    it('should track filesWatched', () => {
      engine.start()
      engine.simulateFileChange('/a.ts', 'a')
      engine.simulateFileChange('/b.ts', 'b')
      vi.advanceTimersByTime(1)
      expect(engine.getStats().filesWatched).toBe(2)
    })
  })

  describe('shouldIgnore', () => {
    it('should ignore node_modules', () => {
      expect(engine.shouldIgnore('node_modules/package/index.js')).toBe(true)
    })

    it('should ignore .git directory', () => {
      expect(engine.shouldIgnore('.git/HEAD')).toBe(true)
    })

    it('should ignore dist directory', () => {
      expect(engine.shouldIgnore('dist/output.js')).toBe(true)
    })

    it('should not ignore source files', () => {
      expect(engine.shouldIgnore('src/index.ts')).toBe(false)
    })

    it('should use custom ignore patterns', () => {
      const e = new WatcherEngine({ ignorePatterns: ['*.log'] })
      expect(e.shouldIgnore('debug.log')).toBe(true)
      expect(e.shouldIgnore('src/main.ts')).toBe(false)
    })
  })

  describe('simulateFileChange', () => {
    it('should not process changes when stopped', () => {
      const handler = vi.fn()
      engine.on('change', handler)
      engine.simulateFileChange('/file.ts', 'content')
      expect(handler).not.toHaveBeenCalled()
    })

    it('should emit add event for new file', () => {
      const handler = vi.fn()
      engine.on('change', handler)
      engine.start()
      engine.simulateFileChange('/file.ts', 'hello')
      vi.advanceTimersByTime(1)
      expect(handler).toHaveBeenCalledTimes(1)
      const event = handler.mock.calls[0]![0] as FileChangeEvent
      expect(event.type).toBe('add')
      expect(event.filePath).toBe('/file.ts')
    })

    it('should emit change event for modified file', () => {
      const handler = vi.fn()
      engine.on('change', handler)
      engine.start()
      engine.simulateFileChange('/file.ts', 'first')
      vi.advanceTimersByTime(1)
      engine.simulateFileChange('/file.ts', 'second')
      vi.advanceTimersByTime(1)
      expect(handler).toHaveBeenCalledTimes(2)
      const event = handler.mock.calls[1]![0] as FileChangeEvent
      expect(event.type).toBe('change')
    })

    it('should ignore files matching ignore patterns', () => {
      const handler = vi.fn()
      engine.on('change', handler)
      engine.start()
      engine.simulateFileChange('node_modules/pkg/index.js', 'content')
      vi.advanceTimersByTime(1)
      expect(handler).not.toHaveBeenCalled()
    })

    it('should store file content', () => {
      engine.start()
      engine.simulateFileChange('/file.ts', 'content')
      vi.advanceTimersByTime(1)
      expect(engine.getFileContent('/file.ts')).toBe('content')
    })

    it('should not emit event for unchanged content', () => {
      const handler = vi.fn()
      engine.on('change', handler)
      engine.start()
      engine.simulateFileChange('/file.ts', 'same')
      vi.advanceTimersByTime(1)
      engine.simulateFileChange('/file.ts', 'same')
      vi.advanceTimersByTime(1)
      expect(handler).toHaveBeenCalledTimes(1)
    })
  })

  describe('simulateFileDelete', () => {
    it('should emit unlink event', () => {
      const handler = vi.fn()
      engine.on('change', handler)
      engine.start()
      engine.simulateFileChange('/file.ts', 'content')
      vi.advanceTimersByTime(1)
      engine.simulateFileDelete('/file.ts')
      expect(handler).toHaveBeenCalledTimes(2)
      const event = handler.mock.calls[1]![0] as FileChangeEvent
      expect(event.type).toBe('unlink')
    })

    it('should remove file content', () => {
      engine.start()
      engine.simulateFileChange('/file.ts', 'content')
      vi.advanceTimersByTime(1)
      engine.simulateFileDelete('/file.ts')
      expect(engine.getFileContent('/file.ts')).toBeUndefined()
    })

    it('should not delete when not running', () => {
      const handler = vi.fn()
      engine.on('change', handler)
      engine.simulateFileDelete('/file.ts')
      expect(handler).not.toHaveBeenCalled()
    })

    it('should increment eventsProcessed', () => {
      engine.start()
      engine.simulateFileChange('/f.ts', 'c')
      vi.advanceTimersByTime(1)
      engine.simulateFileDelete('/f.ts')
      expect(engine.getStats().eventsProcessed).toBe(2)
    })
  })

  describe('simulateDirAdd/simulateDirRemove', () => {
    it('should emit addDir event', () => {
      const handler = vi.fn()
      engine.on('change', handler)
      engine.start()
      engine.simulateDirAdd('/new-dir')
      expect(handler).toHaveBeenCalledTimes(1)
      const event = handler.mock.calls[0]![0] as FileChangeEvent
      expect(event.type).toBe('addDir')
      expect(event.filePath).toBe('/new-dir')
    })

    it('should emit unlinkDir event', () => {
      const handler = vi.fn()
      engine.on('change', handler)
      engine.start()
      engine.simulateDirRemove('/old-dir')
      expect(handler).toHaveBeenCalledTimes(1)
      const event = handler.mock.calls[0]![0] as FileChangeEvent
      expect(event.type).toBe('unlinkDir')
    })

    it('should ignore dirs matching patterns', () => {
      const handler = vi.fn()
      engine.on('change', handler)
      engine.start()
      engine.simulateDirAdd('node_modules/pkg')
      expect(handler).not.toHaveBeenCalled()
    })

    it('should not emit when not running', () => {
      const handler = vi.fn()
      engine.on('change', handler)
      engine.simulateDirAdd('/dir')
      expect(handler).not.toHaveBeenCalled()
    })
  })

  describe('debouncing', () => {
    it('should debounce rapid changes', () => {
      const debouncedEngine = new WatcherEngine({ debounceMs: 50 })
      const handler = vi.fn()
      debouncedEngine.on('change', handler)
      debouncedEngine.start()
      debouncedEngine.simulateFileChange('/file.ts', 'v1')
      debouncedEngine.simulateFileChange('/file.ts', 'v2')
      debouncedEngine.simulateFileChange('/file.ts', 'v3')
      expect(handler).not.toHaveBeenCalled()
      vi.advanceTimersByTime(60)
      expect(handler).toHaveBeenCalledTimes(1)
      debouncedEngine.stop()
    })

    it('should use latest content after debounce', () => {
      const debouncedEngine = new WatcherEngine({ debounceMs: 50 })
      const handler = vi.fn()
      debouncedEngine.on('change', handler)
      debouncedEngine.start()
      debouncedEngine.simulateFileChange('/file.ts', 'first')
      debouncedEngine.simulateFileChange('/file.ts', 'second')
      vi.advanceTimersByTime(60)
      expect(handler).toHaveBeenCalledTimes(1)
      expect(debouncedEngine.getFileContent('/file.ts')).toBe('second')
      debouncedEngine.stop()
    })
  })

  describe('on/once/off delegation', () => {
    it('should delegate on to eventBus', () => {
      const handler = vi.fn()
      engine.on('test', handler)
      engine.start()
      engine.stop()
      expect(handler).not.toHaveBeenCalled()
    })

    it('should delegate once to eventBus', () => {
      const handler = vi.fn()
      engine.once('start', handler)
      engine.start()
      expect(handler).toHaveBeenCalledTimes(1)
    })

    it('should delegate off to eventBus', () => {
      const handler = vi.fn()
      const sub = engine.on('start', handler)
      engine.off(sub.id)
      engine.start()
      expect(handler).not.toHaveBeenCalled()
    })
  })
})

describe('Default config', () => {
  it('should have correct default ignore patterns', () => {
    expect(DEFAULT_WATCHER_CONFIG.ignorePatterns).toContain('node_modules/**')
    expect(DEFAULT_WATCHER_CONFIG.ignorePatterns).toContain('.git/**')
    expect(DEFAULT_WATCHER_CONFIG.ignorePatterns).toContain('dist/**')
  })

  it('should have correct default debounce', () => {
    expect(DEFAULT_WATCHER_CONFIG.debounceMs).toBe(100)
  })

  it('should have correct default persistent', () => {
    expect(DEFAULT_WATCHER_CONFIG.persistent).toBe(true)
  })

  it('should have correct default ignoreInitial', () => {
    expect(DEFAULT_WATCHER_CONFIG.ignoreInitial).toBe(true)
  })
})

describe('Edge cases', () => {
  let engine: WatcherEngine

  beforeEach(() => {
    vi.useFakeTimers()
    engine = new WatcherEngine({ debounceMs: 0 })
  })

  afterEach(() => {
    engine.stop()
    vi.useRealTimers()
  })

  it('should handle empty ignore patterns', () => {
    const e = new WatcherEngine({ ignorePatterns: [] })
    expect(e.shouldIgnore('anything')).toBe(false)
  })

  it('should handle removing a non-existent path', () => {
    expect(() => engine.removePath('/nonexistent')).not.toThrow()
  })

  it('should handle deleting a file that was never tracked', () => {
    const handler = vi.fn()
    engine.on('change', handler)
    engine.start()
    engine.simulateFileDelete('/phantom.ts')
    expect(handler).toHaveBeenCalledTimes(1)
    const event = handler.mock.calls[0]![0] as FileChangeEvent
    expect(event.type).toBe('unlink')
  })

  it('should handle multiple rapid start/stop cycles', () => {
    const handler = vi.fn()
    engine.on('start', handler)
    engine.start()
    engine.stop()
    engine.start()
    engine.stop()
    expect(handler).toHaveBeenCalledTimes(2)
  })

  it('should correctly count watched paths', () => {
    engine.addPath('/a')
    engine.addPath('/b')
    engine.addPath('/c')
    expect(engine.getWatchedPaths()).toHaveLength(3)
  })

  it('should handle wildcard patterns in shouldIgnore', () => {
    const e = new WatcherEngine({ ignorePatterns: ['*.log', 'temp_*'] })
    expect(e.shouldIgnore('debug.log')).toBe(true)
    expect(e.shouldIgnore('temp_file.txt')).toBe(true)
    expect(e.shouldIgnore('main.ts')).toBe(false)
  })

  it('should clear debounce timers on stop', () => {
    const debouncedEngine = new WatcherEngine({ debounceMs: 100 })
    const handler = vi.fn()
    debouncedEngine.on('change', handler)
    debouncedEngine.start()
    debouncedEngine.simulateFileChange('/file.ts', 'content')
    debouncedEngine.stop()
    vi.advanceTimersByTime(200)
    expect(handler).not.toHaveBeenCalled()
  })

  it('should handle hash collision detection correctly', () => {
    const detector = new ChangeDetector()
    const state = detector.getFileState('/file.ts', 'abc')
    const sameEvent = detector.detectChange('/file.ts', state, 'abc')
    expect(sameEvent).toBeNull()
  })

  it('should compute different hashes for similar content', () => {
    const detector = new ChangeDetector()
    const h1 = detector.computeHash('hello world')
    const h2 = detector.computeHash('hello worle')
    expect(h1).not.toBe(h2)
  })
})
