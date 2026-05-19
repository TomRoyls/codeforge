import { describe, it, expect, vi, afterEach } from 'vitest'

import {
  buildWatchConfig,
  shouldWatch,
  createFileEvent,
  computeWatchSummary,
  debounce,
  buildFileWatcher,
  classifyChange,
  filterEvents,
  buildWatchSession,
  addEvent,
  getRecentEvents,
  type FileChangeEvent,
  type WatchConfig,
  type WatchSession,
  type WatchSummary,
} from '../src/commands/watch-live-helpers.js'

import {
  formatChangeEvent,
  formatWatchHeader,
  formatWatchSummary,
} from '../src/commands/watch-live-format-helpers.js'

import WatchLive from '../src/commands/watch-live.js'

// ─── buildWatchConfig ───────────────────────────────────

describe('buildWatchConfig', () => {
  it('should return defaults', () => {
    const config = buildWatchConfig({ path: './src' })
    expect(config.path).toBe('./src')
    expect(config.debounceMs).toBe(500)
    expect(config.recursive).toBe(true)
    expect(config.command).toBeNull()
  })

  it('should accept custom debounce', () => {
    const config = buildWatchConfig({ path: '.', debounceMs: 300 })
    expect(config.debounceMs).toBe(300)
  })

  it('should accept custom extensions', () => {
    const config = buildWatchConfig({ path: '.', extensions: ['.py'] })
    expect(config.extensions).toEqual(['.py'])
  })

  it('should accept custom ignore', () => {
    const config = buildWatchConfig({ path: '.', ignorePatterns: ['*.log'] })
    expect(config.ignorePatterns).toContain('*.log')
  })

  it('should accept command', () => {
    const config = buildWatchConfig({ path: '.', command: 'npm test' })
    expect(config.command).toBe('npm test')
  })

  it('should accept recursive flag', () => {
    const config = buildWatchConfig({ path: '.', recursive: false })
    expect(config.recursive).toBe(false)
  })
})

// ─── shouldWatch ────────────────────────────────────────

describe('shouldWatch', () => {
  function makeConfig(extensions?: string[]): WatchConfig {
    return {
      command: null,
      debounceMs: 500,
      extensions: extensions ?? ['.ts', '.tsx', '.js'],
      ignorePatterns: ['**/node_modules/**'],
      path: '.',
      recursive: true,
    }
  }

  it('should include matching extensions', () => {
    expect(shouldWatch('app.ts', makeConfig())).toBe(true)
  })

  it('should exclude non-matching extensions', () => {
    expect(shouldWatch('app.md', makeConfig())).toBe(false)
  })

  it('should exclude node_modules', () => {
    expect(shouldWatch('node_modules/app.ts', makeConfig())).toBe(false)
  })

  it('should exclude dist', () => {
    expect(shouldWatch('src/dist/app.js', makeConfig())).toBe(false)
  })

  it('should exclude .git', () => {
    expect(shouldWatch('.git/config', makeConfig())).toBe(false)
  })

  it('should include nested files', () => {
    expect(shouldWatch('src/commands/app.ts', makeConfig())).toBe(true)
  })

  it('should respect custom extensions', () => {
    expect(shouldWatch('app.py', makeConfig(['.py']))).toBe(true)
    expect(shouldWatch('app.ts', makeConfig(['.py']))).toBe(false)
  })
})

// ─── createFileEvent ────────────────────────────────────

describe('createFileEvent', () => {
  it('should create modified event', () => {
    const event = createFileEvent('app.ts', 'modified')
    expect(event.type).toBe('modified')
    expect(event.file).toBe('app.ts')
  })

  it('should create created event', () => {
    const event = createFileEvent('new.ts', 'created')
    expect(event.type).toBe('created')
  })

  it('should create deleted event', () => {
    const event = createFileEvent('old.ts', 'deleted')
    expect(event.type).toBe('deleted')
  })

  it('should include timestamp', () => {
    const event = createFileEvent('app.ts', 'modified')
    expect(event.timestamp).toBeTruthy()
  })

  it('should compute lines from content', () => {
    const event = createFileEvent('app.ts', 'modified', 'line1\nline2\nline3\n')
    expect(event.lines).toBe(4)
  })

  it('should compute size from content', () => {
    const event = createFileEvent('app.ts', 'modified', 'hello')
    expect(event.size).toBe(5)
  })

  it('should default to 0 for no content', () => {
    const event = createFileEvent('app.ts', 'modified')
    expect(event.lines).toBe(0)
    expect(event.size).toBe(0)
  })
})

// ─── computeWatchSummary ────────────────────────────────

describe('computeWatchSummary', () => {
  function makeEvent(file: string, type: FileChangeEvent['type']): FileChangeEvent {
    return { file, lines: 0, size: 0, timestamp: new Date().toISOString(), type }
  }

  function makeSession(events: FileChangeEvent[]): WatchSession {
    return {
      config: buildWatchConfig({ path: '.' }),
      events,
      filesWatched: 10,
      startTime: new Date(Date.now() - 60000).toISOString(),
      totalEvents: events.length,
    }
  }

  it('should count by type', () => {
    const session = makeSession([
      makeEvent('a.ts', 'created'),
      makeEvent('b.ts', 'modified'),
      makeEvent('c.ts', 'deleted'),
    ])
    const summary = computeWatchSummary(session)
    expect(summary.eventsByType.created).toBe(1)
    expect(summary.eventsByType.modified).toBe(1)
    expect(summary.eventsByType.deleted).toBe(1)
  })

  it('should count by extension', () => {
    const session = makeSession([
      makeEvent('a.ts', 'modified'),
      makeEvent('b.js', 'modified'),
    ])
    const summary = computeWatchSummary(session)
    expect(summary.eventsByExtension['.ts']).toBe(1)
    expect(summary.eventsByExtension['.js']).toBe(1)
  })

  it('should find top changed files', () => {
    const session = makeSession([
      makeEvent('a.ts', 'modified'),
      makeEvent('a.ts', 'modified'),
      makeEvent('b.ts', 'modified'),
    ])
    const summary = computeWatchSummary(session)
    expect(summary.topChangedFiles[0].file).toBe('a.ts')
    expect(summary.topChangedFiles[0].changes).toBe(2)
  })

  it('should compute events per minute', () => {
    const session = makeSession([
      makeEvent('a.ts', 'modified'),
      makeEvent('b.ts', 'modified'),
    ])
    const summary = computeWatchSummary(session)
    expect(summary.eventsPerMinute).toBeGreaterThanOrEqual(0)
  })

  it('should handle empty events', () => {
    const session = makeSession([])
    const summary = computeWatchSummary(session)
    expect(summary.eventsByType.created).toBe(0)
    expect(summary.topChangedFiles).toHaveLength(0)
  })

  it('should limit top files to 10', () => {
    const events = Array.from({ length: 15 }, (_, i) => makeEvent(`${i}.ts`, 'modified'))
    const session = makeSession(events)
    const summary = computeWatchSummary(session)
    expect(summary.topChangedFiles.length).toBeLessThanOrEqual(10)
  })
})

// ─── debounce ───────────────────────────────────────────

describe('debounce', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('should delay function call', () => {
    vi.useFakeTimers()
    const fn = vi.fn()
    const debounced = debounce(fn, 100)
    debounced()
    expect(fn).not.toHaveBeenCalled()
    vi.advanceTimersByTime(100)
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('should reset timer on subsequent calls', () => {
    vi.useFakeTimers()
    const fn = vi.fn()
    const debounced = debounce(fn, 100)
    debounced()
    vi.advanceTimersByTime(50)
    debounced()
    vi.advanceTimersByTime(50)
    expect(fn).not.toHaveBeenCalled()
    vi.advanceTimersByTime(50)
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('should support cancel', () => {
    vi.useFakeTimers()
    const fn = vi.fn()
    const debounced = debounce(fn, 100)
    debounced()
    debounced.cancel()
    vi.advanceTimersByTime(200)
    expect(fn).not.toHaveBeenCalled()
  })
})

// ─── buildFileWatcher ───────────────────────────────────

describe('buildFileWatcher', () => {
  it('should return watcher description', () => {
    const config = buildWatchConfig({ path: './src' })
    const watcher = buildFileWatcher(config)
    expect(watcher.watching).toBe(true)
    expect(watcher.config).toBe(config)
    expect(watcher.startedAt).toBeTruthy()
  })
})

// ─── classifyChange ─────────────────────────────────────

describe('classifyChange', () => {
  it('should map rename to deleted', () => {
    expect(classifyChange('rename')).toBe('deleted')
  })

  it('should map change to modified', () => {
    expect(classifyChange('change')).toBe('modified')
  })

  it('should default to modified', () => {
    expect(classifyChange('unknown')).toBe('modified')
  })
})

// ─── filterEvents ───────────────────────────────────────

describe('filterEvents', () => {
  function makeEvent(file: string, type: FileChangeEvent['type']): FileChangeEvent {
    return { file, lines: 0, size: 0, timestamp: '', type }
  }

  it('should filter by type', () => {
    const events = [makeEvent('a.ts', 'modified'), makeEvent('b.ts', 'created')]
    expect(filterEvents(events, { type: 'modified' })).toHaveLength(1)
  })

  it('should filter by extension', () => {
    const events = [makeEvent('a.ts', 'modified'), makeEvent('b.js', 'modified')]
    expect(filterEvents(events, { extension: '.ts' })).toHaveLength(1)
  })

  it('should return all with no filter', () => {
    const events = [makeEvent('a.ts', 'modified'), makeEvent('b.js', 'created')]
    expect(filterEvents(events, {})).toHaveLength(2)
  })

  it('should combine type and extension', () => {
    const events = [
      makeEvent('a.ts', 'modified'),
      makeEvent('b.ts', 'created'),
      makeEvent('c.js', 'modified'),
    ]
    expect(filterEvents(events, { type: 'modified', extension: '.ts' })).toHaveLength(1)
  })
})

// ─── buildWatchSession ──────────────────────────────────

describe('buildWatchSession', () => {
  it('should create empty session', () => {
    const config = buildWatchConfig({ path: '.' })
    const session = buildWatchSession(config, 5)
    expect(session.events).toHaveLength(0)
    expect(session.totalEvents).toBe(0)
    expect(session.filesWatched).toBe(5)
  })

  it('should include config', () => {
    const config = buildWatchConfig({ path: './src' })
    const session = buildWatchSession(config, 0)
    expect(session.config.path).toBe('./src')
  })
})

// ─── addEvent ───────────────────────────────────────────

describe('addEvent', () => {
  it('should add event to session', () => {
    const config = buildWatchConfig({ path: '.' })
    const session = buildWatchSession(config, 0)
    const event = createFileEvent('a.ts', 'modified')
    const updated = addEvent(session, event)
    expect(updated.totalEvents).toBe(1)
    expect(updated.events).toHaveLength(1)
  })

  it('should not mutate original', () => {
    const config = buildWatchConfig({ path: '.' })
    const session = buildWatchSession(config, 0)
    const event = createFileEvent('a.ts', 'modified')
    addEvent(session, event)
    expect(session.totalEvents).toBe(0)
  })
})

// ─── getRecentEvents ────────────────────────────────────

describe('getRecentEvents', () => {
  it('should return last N events', () => {
    const config = buildWatchConfig({ path: '.' })
    let session = buildWatchSession(config, 0)
    for (let i = 0; i < 10; i++) {
      session = addEvent(session, createFileEvent(`${i}.ts`, 'modified'))
    }
    const recent = getRecentEvents(session, 3)
    expect(recent).toHaveLength(3)
    expect(recent[0].file).toBe('7.ts')
  })

  it('should return all if fewer than count', () => {
    const config = buildWatchConfig({ path: '.' })
    const session = buildWatchSession(config, 0)
    const recent = getRecentEvents(session, 5)
    expect(recent).toHaveLength(0)
  })
})

// ─── formatChangeEvent ──────────────────────────────────

describe('formatChangeEvent', () => {
  it('should format modified event', () => {
    const event = createFileEvent('app.ts', 'modified')
    expect(formatChangeEvent(event)).toContain('app.ts')
  })

  it('should format created event', () => {
    const event = createFileEvent('new.ts', 'created')
    expect(formatChangeEvent(event)).toContain('new.ts')
  })

  it('should format deleted event', () => {
    const event = createFileEvent('old.ts', 'deleted')
    expect(formatChangeEvent(event)).toContain('old.ts')
  })

  it('should include timestamp', () => {
    const event: FileChangeEvent = {
      file: 'a.ts', lines: 0, size: 0,
      timestamp: '2024-01-01T12:30:45.000Z', type: 'modified',
    }
    expect(formatChangeEvent(event)).toContain('12:30:45')
  })
})

// ─── formatWatchHeader ──────────────────────────────────

describe('formatWatchHeader', () => {
  it('should contain Watching header', () => {
    const config = buildWatchConfig({ path: './src' })
    expect(formatWatchHeader(config)).toContain('Watching')
  })

  it('should show path', () => {
    const config = buildWatchConfig({ path: './src' })
    expect(formatWatchHeader(config)).toContain('./src')
  })

  it('should show debounce', () => {
    const config = buildWatchConfig({ path: '.', debounceMs: 300 })
    expect(formatWatchHeader(config)).toContain('300')
  })

  it('should show command when present', () => {
    const config = buildWatchConfig({ path: '.', command: 'npm test' })
    expect(formatWatchHeader(config)).toContain('npm test')
  })

  it('should show Ctrl+C hint', () => {
    const config = buildWatchConfig({ path: '.' })
    expect(formatWatchHeader(config)).toContain('Ctrl+C')
  })
})

// ─── formatWatchSummary ─────────────────────────────────

describe('formatWatchSummary', () => {
  function makeSummary(): WatchSummary {
    const config = buildWatchConfig({ path: '.' })
    const session: WatchSession = {
      config,
      events: [
        { file: 'a.ts', lines: 0, size: 0, timestamp: new Date().toISOString(), type: 'modified' },
        { file: 'b.js', lines: 0, size: 0, timestamp: new Date().toISOString(), type: 'created' },
      ],
      filesWatched: 5,
      startTime: new Date(Date.now() - 60000).toISOString(),
      totalEvents: 2,
    }
    return computeWatchSummary(session)
  }

  it('should contain Summary header', () => {
    expect(formatWatchSummary(makeSummary())).toContain('Summary')
  })

  it('should show event counts by type', () => {
    expect(formatWatchSummary(makeSummary())).toContain('Created')
    expect(formatWatchSummary(makeSummary())).toContain('Modified')
    expect(formatWatchSummary(makeSummary())).toContain('Deleted')
  })

  it('should show top changed files', () => {
    expect(formatWatchSummary(makeSummary())).toContain('Top Changed')
  })

  it('should show by extension', () => {
    expect(formatWatchSummary(makeSummary())).toContain('By Extension')
  })

  it('should show events per minute', () => {
    expect(formatWatchSummary(makeSummary())).toContain('/min')
  })

  it('should handle empty summary', () => {
    const config = buildWatchConfig({ path: '.' })
    const session: WatchSession = {
      config, events: [], filesWatched: 0,
      startTime: new Date().toISOString(), totalEvents: 0,
    }
    const summary = computeWatchSummary(session)
    expect(formatWatchSummary(summary)).toContain('Summary')
  })
})

// ─── Command metadata ───────────────────────────────────

describe('WatchLive command', () => {
  it('should have correct description', () => {
    expect(WatchLive.description).toContain('onitor')
  })

  it('should have path arg', () => {
    expect(WatchLive.args.path).toBeDefined()
  })

  it('should have debounce flag', () => {
    expect(WatchLive.flags.debounce).toBeDefined()
  })

  it('should have ext flag', () => {
    expect(WatchLive.flags.ext).toBeDefined()
  })

  it('should have ignore flag', () => {
    expect(WatchLive.flags.ignore).toBeDefined()
  })

  it('should have command flag', () => {
    expect(WatchLive.flags.command).toBeDefined()
  })

  it('should have verbose flag', () => {
    expect(WatchLive.flags.verbose).toBeDefined()
  })

  it('should have examples', () => {
    expect(WatchLive.examples.length).toBeGreaterThan(0)
  })
})
