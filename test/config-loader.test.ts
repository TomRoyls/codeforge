import { describe, it, expect } from 'vitest'
import {
  ConfigLoader,
  DEFAULT_LOADER_CONFIG,
} from '../src/core/config-loader/config-loader.js'
import type {
  ConfigSource,
  ConfigEntry,
  LoaderConfig,
} from '../src/core/config-loader/types.js'

// ─── Constructor ───────────────────────────────────────────────────
describe('ConfigLoader constructor', () => {
  it('uses DEFAULT_LOADER_CONFIG when no options given', () => {
    const loader = new ConfigLoader()
    expect(loader.getStatistics()).toEqual({
      totalKeys: 0,
      totalSources: 0,
      overrideCount: 0,
      sourceBreakdown: {},
    })
  })

  it('accepts partial options overriding defaults', () => {
    const loader = new ConfigLoader({ envPrefix: 'APP_' })
    const src: ConfigSource = {
      type: 'env',
      data: { APP_HOST: 'localhost', OTHER: 'ignored' },
      priority: 0,
    }
    loader.addSource(src)
    loader.load()
    expect(loader.get('HOST')).toBe('localhost')
    expect(loader.has('OTHER')).toBe(false)
  })

  it('accepts mergeStrategy option', () => {
    const loader = new ConfigLoader({ mergeStrategy: 'replace' })
    loader.addSource({ type: 'object', data: { a: 1 }, priority: 0 })
    loader.addSource({ type: 'object', data: { b: 2 }, priority: 1 })
    loader.load()
    expect(loader.get('a')).toBeUndefined()
    expect(loader.get('b')).toBe(2)
  })
})

// ─── DEFAULT_LOADER_CONFIG ─────────────────────────────────────────
describe('DEFAULT_LOADER_CONFIG', () => {
  it('has correct defaults', () => {
    expect(DEFAULT_LOADER_CONFIG).toEqual({
      mergeStrategy: 'deep',
      envPrefix: '',
      separators: ['_'],
    })
  })
})

// ─── addSource / removeSource / getSources ─────────────────────────
describe('source management', () => {
  it('addSource returns unique ids', () => {
    const loader = new ConfigLoader()
    const id1 = loader.addSource({ type: 'object', data: {}, priority: 0 })
    const id2 = loader.addSource({ type: 'object', data: {}, priority: 1 })
    expect(id1).not.toBe(id2)
    expect(typeof id1).toBe('string')
    expect(id1).toMatch(/^source_\d+$/)
  })

  it('getSources returns sorted by priority', () => {
    const loader = new ConfigLoader()
    loader.addSource({ type: 'object', data: { a: 1 }, priority: 5 })
    loader.addSource({ type: 'object', data: { b: 2 }, priority: 1 })
    loader.addSource({ type: 'object', data: { c: 3 }, priority: 3 })
    const sources = loader.getSources()
    expect(sources.map((s) => s.priority)).toEqual([1, 3, 5])
  })

  it('removeSource removes a source', () => {
    const loader = new ConfigLoader()
    const id = loader.addSource({ type: 'object', data: { x: 1 }, priority: 0 })
    loader.removeSource(id)
    expect(loader.getSources()).toHaveLength(0)
  })

  it('removeSource with nonexistent id does nothing', () => {
    const loader = new ConfigLoader()
    loader.addSource({ type: 'object', data: {}, priority: 0 })
    loader.removeSource('nonexistent')
    expect(loader.getSources()).toHaveLength(1)
  })
})

// ─── load (deep merge) ─────────────────────────────────────────────
describe('load with deep merge', () => {
  it('merges single object source', () => {
    const loader = new ConfigLoader()
    loader.addSource({ type: 'object', data: { host: 'localhost', port: 3000 }, priority: 0 })
    loader.load()
    expect(loader.get('host')).toBe('localhost')
    expect(loader.get('port')).toBe(3000)
  })

  it('deep merges nested objects', () => {
    const loader = new ConfigLoader()
    loader.addSource({
      type: 'object',
      data: { db: { host: 'localhost', port: 5432 } },
      priority: 0,
    })
    loader.addSource({
      type: 'object',
      data: { db: { port: 3306, user: 'admin' } },
      priority: 1,
    })
    loader.load()
    expect(loader.get('db')).toEqual({ host: 'localhost', port: 3306, user: 'admin' })
  })

  it('higher priority source overrides lower', () => {
    const loader = new ConfigLoader()
    loader.addSource({ type: 'object', data: { a: 'low' }, priority: 0 })
    loader.addSource({ type: 'object', data: { a: 'high' }, priority: 1 })
    loader.load()
    expect(loader.get('a')).toBe('high')
  })

  it('tracks overrides', () => {
    const loader = new ConfigLoader()
    loader.addSource({ type: 'object', data: { x: 1 }, priority: 0 })
    loader.addSource({ type: 'object', data: { x: 2 }, priority: 1 })
    loader.load()
    const overrides = loader.getOverrides()
    expect(overrides).toHaveLength(1)
    expect(overrides[0]!.key).toBe('x')
    expect(overrides[0]!.value).toBe(1)
    expect(overrides[0]!.overridden).toBe(true)
  })

  it('load with no sources produces empty config', () => {
    const loader = new ConfigLoader()
    loader.load()
    expect(loader.getAll()).toEqual({})
  })

  it('load is idempotent when called twice', () => {
    const loader = new ConfigLoader()
    loader.addSource({ type: 'object', data: { a: 1 }, priority: 0 })
    loader.load()
    loader.load()
    expect(loader.get('a')).toBe(1)
  })
})

// ─── load (shallow merge) ──────────────────────────────────────────
describe('load with shallow merge', () => {
  it('replaces top-level keys from later source', () => {
    const loader = new ConfigLoader({ mergeStrategy: 'shallow' })
    loader.addSource({
      type: 'object',
      data: { db: { host: 'localhost', port: 5432 } },
      priority: 0,
    })
    loader.addSource({
      type: 'object',
      data: { db: { user: 'admin' } },
      priority: 1,
    })
    loader.load()
    expect(loader.get('db')).toEqual({ user: 'admin' })
  })
})

// ─── load (replace merge) ──────────────────────────────────────────
describe('load with replace merge', () => {
  it('completely replaces config with latest source', () => {
    const loader = new ConfigLoader({ mergeStrategy: 'replace' })
    loader.addSource({ type: 'object', data: { a: 1, b: 2 }, priority: 0 })
    loader.addSource({ type: 'object', data: { c: 3 }, priority: 1 })
    loader.load()
    expect(loader.get('a')).toBeUndefined()
    expect(loader.get('b')).toBeUndefined()
    expect(loader.get('c')).toBe(3)
  })

  it('marks all previous entries as overridden', () => {
    const loader = new ConfigLoader({ mergeStrategy: 'replace' })
    loader.addSource({ type: 'object', data: { x: 1, y: 2 }, priority: 0 })
    loader.addSource({ type: 'object', data: { z: 3 }, priority: 1 })
    loader.load()
    const overrides = loader.getOverrides()
    expect(overrides.length).toBeGreaterThanOrEqual(2)
    expect(overrides.every((o) => o.overridden)).toBe(true)
  })
})

// ─── JSON source type ──────────────────────────────────────────────
describe('json source type', () => {
  it('parses string values as JSON', () => {
    const loader = new ConfigLoader()
    loader.addSource({
      type: 'json',
      data: { config: '{"host":"localhost","port":3000}' },
      priority: 0,
    })
    loader.load()
    expect(loader.get('config')).toEqual({ host: 'localhost', port: 3000 })
  })

  it('leaves non-JSON strings as-is', () => {
    const loader = new ConfigLoader()
    loader.addSource({
      type: 'json',
      data: { name: 'not-json' },
      priority: 0,
    })
    loader.load()
    expect(loader.get('name')).toBe('not-json')
  })

  it('passes non-string values through', () => {
    const loader = new ConfigLoader()
    loader.addSource({
      type: 'json',
      data: { count: 42, flag: true },
      priority: 0,
    })
    loader.load()
    expect(loader.get('count')).toBe(42)
    expect(loader.get('flag')).toBe(true)
  })
})

// ─── ENV source type ───────────────────────────────────────────────
describe('env source type', () => {
  it('parses boolean strings', () => {
    const loader = new ConfigLoader()
    loader.addSource({
      type: 'env',
      data: { DEBUG: 'true', VERBOSE: 'false' },
      priority: 0,
    })
    loader.load()
    expect(loader.get('DEBUG')).toBe(true)
    expect(loader.get('VERBOSE')).toBe(false)
  })

  it('parses integer strings', () => {
    const loader = new ConfigLoader()
    loader.addSource({
      type: 'env',
      data: { PORT: '3000', NEG: '-42' },
      priority: 0,
    })
    loader.load()
    expect(loader.get('PORT')).toBe(3000)
    expect(loader.get('NEG')).toBe(-42)
  })

  it('parses float strings', () => {
    const loader = new ConfigLoader()
    loader.addSource({
      type: 'env',
      data: { RATE: '3.14', TEMP: '-0.5' },
      priority: 0,
    })
    loader.load()
    expect(loader.get('RATE')).toBe(3.14)
    expect(loader.get('TEMP')).toBe(-0.5)
  })

  it('leaves other strings as-is', () => {
    const loader = new ConfigLoader()
    loader.addSource({
      type: 'env',
      data: { HOST: 'localhost' },
      priority: 0,
    })
    loader.load()
    expect(loader.get('HOST')).toBe('localhost')
  })

  it('converts separators to dots', () => {
    const loader = new ConfigLoader({ separators: ['_'] })
    loader.addSource({
      type: 'env',
      data: { DB_HOST: 'localhost', DB_PORT: '5432' },
      priority: 0,
    })
    loader.load()
    expect(loader.get('DB.HOST')).toBe('localhost')
    expect(loader.get('DB.PORT')).toBe(5432)
  })

  it('filters by envPrefix', () => {
    const loader = new ConfigLoader({ envPrefix: 'APP_' })
    loader.addSource({
      type: 'env',
      data: { APP_HOST: 'localhost', OTHER: 'ignored' },
      priority: 0,
    })
    loader.load()
    expect(loader.get('HOST')).toBe('localhost')
    expect(loader.has('OTHER')).toBe(false)
  })

  it('builds nested objects from dot-separated keys', () => {
    const loader = new ConfigLoader({ separators: ['_'] })
    loader.addSource({
      type: 'env',
      data: { SERVER_HOST_NAME: 'prod' },
      priority: 0,
    })
    loader.load()
    expect(loader.get('SERVER.HOST.NAME')).toBe('prod')
  })
})

// ─── get / set / has ───────────────────────────────────────────────
describe('get / set / has', () => {
  it('get returns undefined for missing key', () => {
    const loader = new ConfigLoader()
    expect(loader.get('missing')).toBeUndefined()
  })

  it('get returns nested value with dot notation', () => {
    const loader = new ConfigLoader()
    loader.addSource({
      type: 'object',
      data: { db: { host: 'localhost', creds: { user: 'admin' } } },
      priority: 0,
    })
    loader.load()
    expect(loader.get('db.host')).toBe('localhost')
    expect(loader.get('db.creds.user')).toBe('admin')
  })

  it('set creates nested values', () => {
    const loader = new ConfigLoader()
    loader.set('a.b.c', 42)
    expect(loader.get('a.b.c')).toBe(42)
  })

  it('set overwrites existing value', () => {
    const loader = new ConfigLoader()
    loader.addSource({ type: 'object', data: { x: 1 }, priority: 0 })
    loader.load()
    loader.set('x', 99)
    expect(loader.get('x')).toBe(99)
  })

  it('set records manual source', () => {
    const loader = new ConfigLoader()
    loader.set('key', 'val')
    const stats = loader.getStatistics()
    expect(stats.sourceBreakdown['manual']).toBe(1)
  })

  it('has returns true for existing key', () => {
    const loader = new ConfigLoader()
    loader.addSource({ type: 'object', data: { a: 1 }, priority: 0 })
    loader.load()
    expect(loader.has('a')).toBe(true)
  })

  it('has returns false for missing key', () => {
    const loader = new ConfigLoader()
    expect(loader.has('missing')).toBe(false)
  })

  it('has returns true for nested key', () => {
    const loader = new ConfigLoader()
    loader.addSource({ type: 'object', data: { a: { b: { c: 1 } } }, priority: 0 })
    loader.load()
    expect(loader.has('a.b.c')).toBe(true)
    expect(loader.has('a.b')).toBe(true)
    expect(loader.has('a.x')).toBe(false)
  })
})

// ─── getAll ─────────────────────────────────────────────────────────
describe('getAll', () => {
  it('returns a copy of config', () => {
    const loader = new ConfigLoader()
    loader.addSource({ type: 'object', data: { a: 1 }, priority: 0 })
    loader.load()
    const all = loader.getAll()
    expect(all).toEqual({ a: 1 })
    all.a = 999
    expect(loader.get('a')).toBe(1)
  })
})

// ─── getSnapshot ───────────────────────────────────────────────────
describe('getSnapshot', () => {
  it('returns snapshot with entries, timestamp, version', () => {
    const loader = new ConfigLoader()
    loader.addSource({ type: 'object', data: { x: 1 }, priority: 0 })
    loader.load()
    const snap = loader.getSnapshot()
    expect(snap.entries).toHaveLength(1)
    expect(snap.timestamp).toBeInstanceOf(Date)
    expect(snap.version).toBe('1')
  })

  it('version increments with each load', () => {
    const loader = new ConfigLoader()
    loader.addSource({ type: 'object', data: {}, priority: 0 })
    loader.load()
    loader.load()
    loader.load()
    expect(loader.getSnapshot().version).toBe('3')
  })
})

// ─── resolve ───────────────────────────────────────────────────────
describe('resolve', () => {
  it('resolves from highest priority source', () => {
    const loader = new ConfigLoader()
    loader.addSource({ type: 'object', data: { x: 'low' }, priority: 0 })
    loader.addSource({ type: 'object', data: { x: 'high' }, priority: 10 })
    loader.addSource({ type: 'object', data: { x: 'mid' }, priority: 5 })
    expect(loader.resolve('x')).toBe('high')
  })

  it('returns undefined if no source has the key', () => {
    const loader = new ConfigLoader()
    loader.addSource({ type: 'object', data: { a: 1 }, priority: 0 })
    expect(loader.resolve('missing')).toBeUndefined()
  })

  it('resolves from nested paths', () => {
    const loader = new ConfigLoader()
    loader.addSource({
      type: 'object',
      data: { db: { host: 'localhost' } },
      priority: 0,
    })
    expect(loader.resolve('db.host')).toBe('localhost')
  })
})

// ─── getStatistics ─────────────────────────────────────────────────
describe('getStatistics', () => {
  it('returns correct stats for loaded config', () => {
    const loader = new ConfigLoader()
    loader.addSource({ type: 'object', data: { a: 1, b: 2 }, priority: 0 })
    loader.addSource({ type: 'object', data: { c: 3 }, priority: 1 })
    loader.load()
    const stats = loader.getStatistics()
    expect(stats.totalKeys).toBe(3)
    expect(stats.totalSources).toBe(2)
    expect(stats.overrideCount).toBe(0)
  })

  it('tracks override count', () => {
    const loader = new ConfigLoader()
    loader.addSource({ type: 'object', data: { x: 1 }, priority: 0 })
    loader.addSource({ type: 'object', data: { x: 2 }, priority: 1 })
    loader.load()
    expect(loader.getStatistics().overrideCount).toBe(1)
  })

  it('tracks source breakdown', () => {
    const loader = new ConfigLoader()
    const id = loader.addSource({ type: 'object', data: { a: 1, b: 2 }, priority: 0 })
    loader.load()
    const stats = loader.getStatistics()
    expect(stats.sourceBreakdown[id]).toBe(2)
  })
})

// ─── clear ─────────────────────────────────────────────────────────
describe('clear', () => {
  it('resets everything', () => {
    const loader = new ConfigLoader()
    loader.addSource({ type: 'object', data: { a: 1 }, priority: 0 })
    loader.load()
    loader.clear()
    expect(loader.getStatistics()).toEqual({
      totalKeys: 0,
      totalSources: 0,
      overrideCount: 0,
      sourceBreakdown: {},
    })
    expect(loader.getAll()).toEqual({})
  })

  it('allows adding sources after clear', () => {
    const loader = new ConfigLoader()
    loader.addSource({ type: 'object', data: { a: 1 }, priority: 0 })
    loader.load()
    loader.clear()
    const id = loader.addSource({ type: 'object', data: { b: 2 }, priority: 0 })
    expect(id).toBe('source_0')
    loader.load()
    expect(loader.get('b')).toBe(2)
  })
})
