import { describe, it, expect } from 'vitest'
import { ConfigLoader } from '../../src/core/config-loader/config-loader.js'
import { DEFAULT_LOADER_CONFIG } from '../../src/core/config-loader/types.js'
import type { ConfigSource, ConfigEntry, ConfigSnapshot } from '../../src/core/config-loader/types.js'

describe('ConfigLoader', () => {
  describe('Construction', () => {
    it('should create with default config', () => {
      const loader = new ConfigLoader()
      expect(loader).toBeInstanceOf(ConfigLoader)
    })

    it('should create with custom options', () => {
      const loader = new ConfigLoader({
        mergeStrategy: 'shallow',
        envPrefix: 'APP_',
        separators: ['__'],
      })
      expect(loader).toBeInstanceOf(ConfigLoader)
    })

    it('should export DEFAULT_LOADER_CONFIG', () => {
      expect(DEFAULT_LOADER_CONFIG.mergeStrategy).toBe('deep')
      expect(DEFAULT_LOADER_CONFIG.envPrefix).toBe('')
      expect(DEFAULT_LOADER_CONFIG.separators).toEqual(['_'])
    })
  })

  describe('Source management', () => {
    it('should add a source and return an id', () => {
      const loader = new ConfigLoader()
      const id = loader.addSource({
        type: 'object',
        data: { a: 1 },
        priority: 1,
      })
      expect(typeof id).toBe('string')
      expect(id).toBeTruthy()
    })

    it('should return sources sorted by priority', () => {
      const loader = new ConfigLoader()
      loader.addSource({ type: 'object', data: { b: 2 }, priority: 10 })
      loader.addSource({ type: 'object', data: { a: 1 }, priority: 1 })
      loader.addSource({ type: 'object', data: { c: 3 }, priority: 5 })
      const sources = loader.getSources()
      expect(sources.map((s) => s.priority)).toEqual([1, 5, 10])
    })

    it('should remove a source by id', () => {
      const loader = new ConfigLoader()
      const id = loader.addSource({
        type: 'object',
        data: { a: 1 },
        priority: 1,
      })
      loader.removeSource(id)
      expect(loader.getSources()).toHaveLength(0)
    })

    it('should return empty array when no sources', () => {
      const loader = new ConfigLoader()
      expect(loader.getSources()).toEqual([])
    })

    it('should generate unique ids for multiple sources', () => {
      const loader = new ConfigLoader()
      const id1 = loader.addSource({ type: 'object', data: {}, priority: 1 })
      const id2 = loader.addSource({ type: 'object', data: {}, priority: 2 })
      expect(id1).not.toBe(id2)
    })

    it('should not affect other sources when removing one', () => {
      const loader = new ConfigLoader()
      const id1 = loader.addSource({ type: 'object', data: { a: 1 }, priority: 1 })
      const id2 = loader.addSource({ type: 'object', data: { b: 2 }, priority: 2 })
      loader.removeSource(id1)
      const sources = loader.getSources()
      expect(sources).toHaveLength(1)
      expect(sources[0]?.data).toEqual({ b: 2 })
    })
  })

  describe('Loading from objects', () => {
    it('should load flat object config', () => {
      const loader = new ConfigLoader()
      loader.addSource({
        type: 'object',
        data: { host: 'localhost', port: 3000 },
        priority: 1,
      })
      loader.load()
      expect(loader.get('host')).toBe('localhost')
      expect(loader.get('port')).toBe(3000)
    })

    it('should load nested object config', () => {
      const loader = new ConfigLoader()
      loader.addSource({
        type: 'object',
        data: { database: { host: 'localhost', port: 5432 } },
        priority: 1,
      })
      loader.load()
      expect(loader.get('database.host')).toBe('localhost')
      expect(loader.get('database.port')).toBe(5432)
    })

    it('should load deeply nested config', () => {
      const loader = new ConfigLoader()
      loader.addSource({
        type: 'object',
        data: { a: { b: { c: { d: 'deep' } } } },
        priority: 1,
      })
      loader.load()
      expect(loader.get('a.b.c.d')).toBe('deep')
    })

    it('should load config with array values', () => {
      const loader = new ConfigLoader()
      loader.addSource({
        type: 'object',
        data: { items: [1, 2, 3] },
        priority: 1,
      })
      loader.load()
      expect(loader.get('items')).toEqual([1, 2, 3])
    })

    it('should load config with null values', () => {
      const loader = new ConfigLoader()
      loader.addSource({
        type: 'object',
        data: { key: null },
        priority: 1,
      })
      loader.load()
      expect(loader.get('key')).toBeNull()
    })

    it('should load config with boolean values', () => {
      const loader = new ConfigLoader()
      loader.addSource({
        type: 'object',
        data: { debug: true, verbose: false },
        priority: 1,
      })
      loader.load()
      expect(loader.get('debug')).toBe(true)
      expect(loader.get('verbose')).toBe(false)
    })
  })

  describe('JSON parsing', () => {
    it('should parse JSON string values from json source', () => {
      const loader = new ConfigLoader()
      loader.addSource({
        type: 'json',
        data: { settings: '{"theme":"dark","fontSize":14}' },
        priority: 1,
      })
      loader.load()
      expect(loader.get('settings')).toEqual({ theme: 'dark', fontSize: 14 })
    })

    it('should parse JSON array string values', () => {
      const loader = new ConfigLoader()
      loader.addSource({
        type: 'json',
        data: { tags: '["a","b","c"]' },
        priority: 1,
      })
      loader.load()
      expect(loader.get('tags')).toEqual(['a', 'b', 'c'])
    })

    it('should keep non-JSON string values as-is', () => {
      const loader = new ConfigLoader()
      loader.addSource({
        type: 'json',
        data: { name: 'plain string' },
        priority: 1,
      })
      loader.load()
      expect(loader.get('name')).toBe('plain string')
    })

    it('should keep non-string values as-is in json source', () => {
      const loader = new ConfigLoader()
      loader.addSource({
        type: 'json',
        data: { count: 42, active: true },
        priority: 1,
      })
      loader.load()
      expect(loader.get('count')).toBe(42)
      expect(loader.get('active')).toBe(true)
    })

    it('should handle invalid JSON strings gracefully', () => {
      const loader = new ConfigLoader()
      loader.addSource({
        type: 'json',
        data: { bad: '{not valid json' },
        priority: 1,
      })
      loader.load()
      expect(loader.get('bad')).toBe('{not valid json')
    })

    it('should parse nested JSON into accessible keys', () => {
      const loader = new ConfigLoader()
      loader.addSource({
        type: 'json',
        data: { db: '{"host":"localhost","port":5432}' },
        priority: 1,
      })
      loader.load()
      expect(loader.get('db.host')).toBe('localhost')
      expect(loader.get('db.port')).toBe(5432)
    })
  })

  describe('Env-style loading', () => {
    it('should load env-style key-value pairs', () => {
      const loader = new ConfigLoader({ envPrefix: 'APP_' })
      loader.addSource({
        type: 'env',
        data: { APP_HOST: 'localhost', APP_PORT: '3000' },
        priority: 1,
      })
      loader.load()
      expect(loader.get('HOST')).toBe('localhost')
      expect(loader.get('PORT')).toBe(3000)
    })

    it('should filter keys by env prefix', () => {
      const loader = new ConfigLoader({ envPrefix: 'APP_' })
      loader.addSource({
        type: 'env',
        data: { APP_HOST: 'localhost', OTHER_KEY: 'ignored' },
        priority: 1,
      })
      loader.load()
      expect(loader.get('HOST')).toBe('localhost')
      expect(loader.has('OTHER.KEY')).toBe(false)
    })

    it('should use separators to create nested keys', () => {
      const loader = new ConfigLoader({ separators: ['__'] })
      loader.addSource({
        type: 'env',
        data: { DB__HOST: 'localhost', DB__PORT: '5432' },
        priority: 1,
      })
      loader.load()
      expect(loader.get('DB.HOST')).toBe('localhost')
      expect(loader.get('DB.PORT')).toBe(5432)
    })

    it('should coerce boolean strings', () => {
      const loader = new ConfigLoader({ envPrefix: '' })
      loader.addSource({
        type: 'env',
        data: { DEBUG: 'true', VERBOSE: 'false' },
        priority: 1,
      })
      loader.load()
      expect(loader.get('DEBUG')).toBe(true)
      expect(loader.get('VERBOSE')).toBe(false)
    })

    it('should coerce numeric strings', () => {
      const loader = new ConfigLoader({ envPrefix: '' })
      loader.addSource({
        type: 'env',
        data: { PORT: '3000', TIMEOUT: '30' },
        priority: 1,
      })
      loader.load()
      expect(loader.get('PORT')).toBe(3000)
      expect(loader.get('TIMEOUT')).toBe(30)
    })

    it('should coerce float strings', () => {
      const loader = new ConfigLoader({ envPrefix: '' })
      loader.addSource({
        type: 'env',
        data: { RATE: '3.14' },
        priority: 1,
      })
      loader.load()
      expect(loader.get('RATE')).toBe(3.14)
    })

    it('should handle empty prefix', () => {
      const loader = new ConfigLoader({ envPrefix: '' })
      loader.addSource({
        type: 'env',
        data: { KEY: 'value' },
        priority: 1,
      })
      loader.load()
      expect(loader.get('KEY')).toBe('value')
    })
  })

  describe('Priority merging', () => {
    it('should merge two sources with higher priority winning', () => {
      const loader = new ConfigLoader()
      loader.addSource({
        type: 'object',
        data: { host: 'localhost', port: 3000 },
        priority: 1,
      })
      loader.addSource({
        type: 'object',
        data: { host: 'example.com' },
        priority: 10,
      })
      loader.load()
      expect(loader.get('host')).toBe('example.com')
      expect(loader.get('port')).toBe(3000)
    })

    it('should deep merge nested objects from multiple sources', () => {
      const loader = new ConfigLoader()
      loader.addSource({
        type: 'object',
        data: { db: { host: 'localhost', port: 5432 } },
        priority: 1,
      })
      loader.addSource({
        type: 'object',
        data: { db: { port: 3306, user: 'admin' } },
        priority: 10,
      })
      loader.load()
      expect(loader.get('db.host')).toBe('localhost')
      expect(loader.get('db.port')).toBe(3306)
      expect(loader.get('db.user')).toBe('admin')
    })

    it('should handle three sources with different priorities', () => {
      const loader = new ConfigLoader()
      loader.addSource({
        type: 'object',
        data: { a: 1, b: 1, c: 1 },
        priority: 1,
      })
      loader.addSource({
        type: 'object',
        data: { b: 2, c: 2 },
        priority: 5,
      })
      loader.addSource({
        type: 'object',
        data: { c: 3 },
        priority: 10,
      })
      loader.load()
      expect(loader.get('a')).toBe(1)
      expect(loader.get('b')).toBe(2)
      expect(loader.get('c')).toBe(3)
    })

    it('should handle sources with same priority', () => {
      const loader = new ConfigLoader()
      loader.addSource({
        type: 'object',
        data: { a: 1 },
        priority: 5,
      })
      loader.addSource({
        type: 'object',
        data: { b: 2 },
        priority: 5,
      })
      loader.load()
      expect(loader.get('a')).toBe(1)
      expect(loader.get('b')).toBe(2)
    })

    it('should merge mixed source types by priority', () => {
      const loader = new ConfigLoader({ envPrefix: 'APP_' })
      loader.addSource({
        type: 'object',
        data: { HOST: 'localhost', PORT: 3000 },
        priority: 1,
      })
      loader.addSource({
        type: 'env',
        data: { APP_HOST: 'production.com' },
        priority: 10,
      })
      loader.load()
      expect(loader.get('HOST')).toBe('production.com')
      expect(loader.get('PORT')).toBe(3000)
    })

    it('should allow reloading after source changes', () => {
      const loader = new ConfigLoader()
      const id = loader.addSource({
        type: 'object',
        data: { key: 'old' },
        priority: 1,
      })
      loader.load()
      expect(loader.get('key')).toBe('old')
      loader.removeSource(id)
      loader.addSource({
        type: 'object',
        data: { key: 'new' },
        priority: 1,
      })
      loader.load()
      expect(loader.get('key')).toBe('new')
    })
  })

  describe('Dot notation access', () => {
    it('should access top-level keys', () => {
      const loader = new ConfigLoader()
      loader.addSource({
        type: 'object',
        data: { name: 'test' },
        priority: 1,
      })
      loader.load()
      expect(loader.get('name')).toBe('test')
    })

    it('should access nested keys with dot notation', () => {
      const loader = new ConfigLoader()
      loader.addSource({
        type: 'object',
        data: { server: { db: { host: 'localhost' } } },
        priority: 1,
      })
      loader.load()
      expect(loader.get('server.db.host')).toBe('localhost')
    })

    it('should return undefined for missing top-level keys', () => {
      const loader = new ConfigLoader()
      loader.addSource({ type: 'object', data: { a: 1 }, priority: 1 })
      loader.load()
      expect(loader.get('missing')).toBeUndefined()
    })

    it('should return undefined for missing nested keys', () => {
      const loader = new ConfigLoader()
      loader.addSource({
        type: 'object',
        data: { a: { b: 1 } },
        priority: 1,
      })
      loader.load()
      expect(loader.get('a.c')).toBeUndefined()
    })

    it('should return undefined for path through non-object', () => {
      const loader = new ConfigLoader()
      loader.addSource({
        type: 'object',
        data: { a: 'string' },
        priority: 1,
      })
      loader.load()
      expect(loader.get('a.b')).toBeUndefined()
    })

    it('should access entire nested objects', () => {
      const loader = new ConfigLoader()
      loader.addSource({
        type: 'object',
        data: { db: { host: 'localhost', port: 5432 } },
        priority: 1,
      })
      loader.load()
      expect(loader.get('db')).toEqual({ host: 'localhost', port: 5432 })
    })
  })

  describe('get method', () => {
    it('should return values from loaded config', () => {
      const loader = new ConfigLoader()
      loader.addSource({
        type: 'object',
        data: { key: 'value' },
        priority: 1,
      })
      loader.load()
      expect(loader.get('key')).toBe('value')
    })

    it('should return undefined before load', () => {
      const loader = new ConfigLoader()
      loader.addSource({
        type: 'object',
        data: { key: 'value' },
        priority: 1,
      })
      expect(loader.get('key')).toBeUndefined()
    })

    it('should return undefined for empty config', () => {
      const loader = new ConfigLoader()
      loader.load()
      expect(loader.get('anything')).toBeUndefined()
    })

    it('should handle numeric keys', () => {
      const loader = new ConfigLoader()
      loader.addSource({
        type: 'object',
        data: { port: 3000 },
        priority: 1,
      })
      loader.load()
      expect(loader.get('port')).toBe(3000)
    })
  })

  describe('set method', () => {
    it('should set a top-level value', () => {
      const loader = new ConfigLoader()
      loader.load()
      loader.set('key', 'value')
      expect(loader.get('key')).toBe('value')
    })

    it('should set a nested value', () => {
      const loader = new ConfigLoader()
      loader.load()
      loader.set('db.host', 'localhost')
      expect(loader.get('db.host')).toBe('localhost')
    })

    it('should create intermediate objects when setting nested values', () => {
      const loader = new ConfigLoader()
      loader.load()
      loader.set('a.b.c', 'deep')
      expect(loader.get('a.b.c')).toBe('deep')
    })

    it('should overwrite existing values', () => {
      const loader = new ConfigLoader()
      loader.addSource({
        type: 'object',
        data: { key: 'old' },
        priority: 1,
      })
      loader.load()
      loader.set('key', 'new')
      expect(loader.get('key')).toBe('new')
    })

    it('should track set values as manual entries', () => {
      const loader = new ConfigLoader()
      loader.load()
      loader.set('manual', true)
      const snapshot = loader.getSnapshot()
      const entry = snapshot.entries.find((e) => e.key === 'manual')
      expect(entry?.source).toBe('manual')
    })
  })

  describe('has method', () => {
    it('should return true for existing keys', () => {
      const loader = new ConfigLoader()
      loader.addSource({
        type: 'object',
        data: { key: 'value' },
        priority: 1,
      })
      loader.load()
      expect(loader.has('key')).toBe(true)
    })

    it('should return false for missing keys', () => {
      const loader = new ConfigLoader()
      loader.addSource({
        type: 'object',
        data: { key: 'value' },
        priority: 1,
      })
      loader.load()
      expect(loader.has('missing')).toBe(false)
    })

    it('should return true for nested existing keys', () => {
      const loader = new ConfigLoader()
      loader.addSource({
        type: 'object',
        data: { a: { b: 1 } },
        priority: 1,
      })
      loader.load()
      expect(loader.has('a.b')).toBe(true)
    })

    it('should return false for missing nested keys', () => {
      const loader = new ConfigLoader()
      loader.addSource({
        type: 'object',
        data: { a: { b: 1 } },
        priority: 1,
      })
      loader.load()
      expect(loader.has('a.c')).toBe(false)
    })

    it('should return false before load', () => {
      const loader = new ConfigLoader()
      loader.addSource({
        type: 'object',
        data: { key: 'value' },
        priority: 1,
      })
      expect(loader.has('key')).toBe(false)
    })
  })

  describe('getAll method', () => {
    it('should return all config values', () => {
      const loader = new ConfigLoader()
      loader.addSource({
        type: 'object',
        data: { a: 1, b: 2, c: 3 },
        priority: 1,
      })
      loader.load()
      expect(loader.getAll()).toEqual({ a: 1, b: 2, c: 3 })
    })

    it('should return empty object for no config', () => {
      const loader = new ConfigLoader()
      loader.load()
      expect(loader.getAll()).toEqual({})
    })

    it('should return a shallow copy', () => {
      const loader = new ConfigLoader()
      loader.addSource({
        type: 'object',
        data: { key: 'value' },
        priority: 1,
      })
      loader.load()
      const all = loader.getAll()
      all['key'] = 'modified'
      expect(loader.get('key')).toBe('value')
    })
  })

  describe('Snapshot creation', () => {
    it('should create a snapshot with entries', () => {
      const loader = new ConfigLoader()
      loader.addSource({
        type: 'object',
        data: { a: 1, b: 2 },
        priority: 1,
      })
      loader.load()
      const snapshot = loader.getSnapshot()
      expect(snapshot.entries).toHaveLength(2)
    })

    it('should include timestamp in snapshot', () => {
      const loader = new ConfigLoader()
      loader.load()
      const snapshot = loader.getSnapshot()
      expect(snapshot.timestamp).toBeInstanceOf(Date)
    })

    it('should include version in snapshot', () => {
      const loader = new ConfigLoader()
      loader.load()
      const snapshot = loader.getSnapshot()
      expect(typeof snapshot.version).toBe('string')
    })

    it('should increment version on each load', () => {
      const loader = new ConfigLoader()
      loader.load()
      expect(loader.getSnapshot().version).toBe('1')
      loader.load()
      expect(loader.getSnapshot().version).toBe('2')
    })

    it('should have correct entry structure', () => {
      const loader = new ConfigLoader()
      loader.addSource({
        type: 'object',
        data: { key: 'value' },
        priority: 1,
      })
      loader.load()
      const entry = loader.getSnapshot().entries[0]
      expect(entry).toBeDefined()
      expect(entry?.key).toBe('key')
      expect(entry?.value).toBe('value')
      expect(typeof entry?.source).toBe('string')
      expect(entry?.overridden).toBe(false)
    })
  })

  describe('Override tracking', () => {
    it('should track overridden entries', () => {
      const loader = new ConfigLoader()
      loader.addSource({
        type: 'object',
        data: { host: 'localhost' },
        priority: 1,
      })
      loader.addSource({
        type: 'object',
        data: { host: 'example.com' },
        priority: 10,
      })
      loader.load()
      const overrides = loader.getOverrides()
      expect(overrides).toHaveLength(1)
      expect(overrides[0]?.value).toBe('localhost')
      expect(overrides[0]?.overridden).toBe(true)
    })

    it('should track multiple overrides', () => {
      const loader = new ConfigLoader()
      loader.addSource({
        type: 'object',
        data: { a: 1, b: 2 },
        priority: 1,
      })
      loader.addSource({
        type: 'object',
        data: { a: 10, b: 20 },
        priority: 10,
      })
      loader.load()
      const overrides = loader.getOverrides()
      expect(overrides).toHaveLength(2)
    })

    it('should not track overrides for non-overlapping keys', () => {
      const loader = new ConfigLoader()
      loader.addSource({
        type: 'object',
        data: { a: 1 },
        priority: 1,
      })
      loader.addSource({
        type: 'object',
        data: { b: 2 },
        priority: 10,
      })
      loader.load()
      expect(loader.getOverrides()).toHaveLength(0)
    })

    it('should track overrides across three sources', () => {
      const loader = new ConfigLoader()
      loader.addSource({
        type: 'object',
        data: { key: 'v1' },
        priority: 1,
      })
      loader.addSource({
        type: 'object',
        data: { key: 'v2' },
        priority: 5,
      })
      loader.addSource({
        type: 'object',
        data: { key: 'v3' },
        priority: 10,
      })
      loader.load()
      const overrides = loader.getOverrides()
      expect(overrides).toHaveLength(2)
    })

    it('should track nested key overrides', () => {
      const loader = new ConfigLoader()
      loader.addSource({
        type: 'object',
        data: { db: { host: 'localhost' } },
        priority: 1,
      })
      loader.addSource({
        type: 'object',
        data: { db: { host: 'example.com' } },
        priority: 10,
      })
      loader.load()
      const overrides = loader.getOverrides()
      expect(overrides).toHaveLength(1)
      expect(overrides[0]?.key).toBe('db.host')
    })

    it('should return empty array when no overrides', () => {
      const loader = new ConfigLoader()
      loader.addSource({
        type: 'object',
        data: { a: 1 },
        priority: 1,
      })
      loader.load()
      expect(loader.getOverrides()).toEqual([])
    })
  })

  describe('Statistics', () => {
    it('should return correct total keys', () => {
      const loader = new ConfigLoader()
      loader.addSource({
        type: 'object',
        data: { a: 1, b: 2, c: 3 },
        priority: 1,
      })
      loader.load()
      const stats = loader.getStatistics()
      expect(stats.totalKeys).toBe(3)
    })

    it('should return correct total sources', () => {
      const loader = new ConfigLoader()
      loader.addSource({ type: 'object', data: { a: 1 }, priority: 1 })
      loader.addSource({ type: 'object', data: { b: 2 }, priority: 2 })
      loader.load()
      const stats = loader.getStatistics()
      expect(stats.totalSources).toBe(2)
    })

    it('should return correct override count', () => {
      const loader = new ConfigLoader()
      loader.addSource({ type: 'object', data: { a: 1, b: 2 }, priority: 1 })
      loader.addSource({ type: 'object', data: { a: 10 }, priority: 10 })
      loader.load()
      const stats = loader.getStatistics()
      expect(stats.overrideCount).toBe(1)
    })

    it('should return source breakdown', () => {
      const loader = new ConfigLoader()
      const id1 = loader.addSource({
        type: 'object',
        data: { a: 1 },
        priority: 1,
      })
      loader.load()
      const stats = loader.getStatistics()
      expect(stats.sourceBreakdown[id1]).toBe(1)
    })

    it('should handle empty loader statistics', () => {
      const loader = new ConfigLoader()
      loader.load()
      const stats = loader.getStatistics()
      expect(stats.totalKeys).toBe(0)
      expect(stats.totalSources).toBe(0)
      expect(stats.overrideCount).toBe(0)
    })
  })

  describe('resolve method', () => {
    it('should resolve key from highest priority source', () => {
      const loader = new ConfigLoader()
      loader.addSource({
        type: 'object',
        data: { host: 'localhost' },
        priority: 1,
      })
      loader.addSource({
        type: 'object',
        data: { host: 'production.com' },
        priority: 10,
      })
      expect(loader.resolve('host')).toBe('production.com')
    })

    it('should resolve from lower priority if higher does not have key', () => {
      const loader = new ConfigLoader()
      loader.addSource({
        type: 'object',
        data: { host: 'localhost', port: 3000 },
        priority: 1,
      })
      loader.addSource({
        type: 'object',
        data: { host: 'production.com' },
        priority: 10,
      })
      expect(loader.resolve('port')).toBe(3000)
    })

    it('should return undefined for missing key', () => {
      const loader = new ConfigLoader()
      loader.addSource({
        type: 'object',
        data: { a: 1 },
        priority: 1,
      })
      expect(loader.resolve('missing')).toBeUndefined()
    })

    it('should work without calling load', () => {
      const loader = new ConfigLoader()
      loader.addSource({
        type: 'object',
        data: { key: 'value' },
        priority: 1,
      })
      expect(loader.resolve('key')).toBe('value')
    })

    it('should resolve nested keys from sources', () => {
      const loader = new ConfigLoader()
      loader.addSource({
        type: 'object',
        data: { db: { host: 'localhost' } },
        priority: 1,
      })
      expect(loader.resolve('db.host')).toBe('localhost')
    })
  })

  describe('Config options', () => {
    it('should use deep merge strategy by default', () => {
      const loader = new ConfigLoader()
      loader.addSource({
        type: 'object',
        data: { db: { host: 'localhost', port: 5432 } },
        priority: 1,
      })
      loader.addSource({
        type: 'object',
        data: { db: { port: 3306 } },
        priority: 10,
      })
      loader.load()
      expect(loader.get('db.host')).toBe('localhost')
      expect(loader.get('db.port')).toBe(3306)
    })

    it('should use shallow merge strategy', () => {
      const loader = new ConfigLoader({ mergeStrategy: 'shallow' })
      loader.addSource({
        type: 'object',
        data: { db: { host: 'localhost', port: 5432 } },
        priority: 1,
      })
      loader.addSource({
        type: 'object',
        data: { db: { port: 3306 } },
        priority: 10,
      })
      loader.load()
      expect(loader.get('db')).toEqual({ port: 3306 })
    })

    it('should use replace merge strategy', () => {
      const loader = new ConfigLoader({ mergeStrategy: 'replace' })
      loader.addSource({
        type: 'object',
        data: { a: 1, b: 2 },
        priority: 1,
      })
      loader.addSource({
        type: 'object',
        data: { c: 3 },
        priority: 10,
      })
      loader.load()
      expect(loader.get('a')).toBeUndefined()
      expect(loader.get('b')).toBeUndefined()
      expect(loader.get('c')).toBe(3)
    })

    it('should apply env prefix filtering', () => {
      const loader = new ConfigLoader({ envPrefix: 'MYAPP_' })
      loader.addSource({
        type: 'env',
        data: { MYAPP_HOST: 'localhost', OTHER: 'ignored' },
        priority: 1,
      })
      loader.load()
      expect(loader.get('HOST')).toBe('localhost')
      expect(loader.has('OTHER')).toBe(false)
    })

    it('should apply custom separators', () => {
      const loader = new ConfigLoader({ separators: ['__'] })
      loader.addSource({
        type: 'env',
        data: { SERVER__HOST: 'localhost' },
        priority: 1,
      })
      loader.load()
      expect(loader.get('SERVER.HOST')).toBe('localhost')
    })
  })

  describe('Clear and reset', () => {
    it('should clear all state', () => {
      const loader = new ConfigLoader()
      loader.addSource({
        type: 'object',
        data: { a: 1 },
        priority: 1,
      })
      loader.load()
      loader.clear()
      expect(loader.getSources()).toHaveLength(0)
      expect(loader.getAll()).toEqual({})
    })

    it('should clear overrides', () => {
      const loader = new ConfigLoader()
      loader.addSource({ type: 'object', data: { a: 1 }, priority: 1 })
      loader.addSource({ type: 'object', data: { a: 2 }, priority: 10 })
      loader.load()
      loader.clear()
      expect(loader.getOverrides()).toEqual([])
    })

    it('should clear statistics', () => {
      const loader = new ConfigLoader()
      loader.addSource({
        type: 'object',
        data: { a: 1, b: 2 },
        priority: 1,
      })
      loader.load()
      loader.clear()
      const stats = loader.getStatistics()
      expect(stats.totalKeys).toBe(0)
      expect(stats.totalSources).toBe(0)
    })

    it('should allow adding sources after clear', () => {
      const loader = new ConfigLoader()
      loader.addSource({ type: 'object', data: { a: 1 }, priority: 1 })
      loader.load()
      loader.clear()
      loader.addSource({ type: 'object', data: { b: 2 }, priority: 1 })
      loader.load()
      expect(loader.get('b')).toBe(2)
    })
  })

  describe('Edge cases', () => {
    it('should handle empty config', () => {
      const loader = new ConfigLoader()
      loader.load()
      expect(loader.getAll()).toEqual({})
      expect(loader.get('anything')).toBeUndefined()
    })

    it('should handle missing keys', () => {
      const loader = new ConfigLoader()
      loader.addSource({
        type: 'object',
        data: { a: 1 },
        priority: 1,
      })
      loader.load()
      expect(loader.get('nonexistent')).toBeUndefined()
      expect(loader.has('nonexistent')).toBe(false)
    })

    it('should handle invalid JSON gracefully', () => {
      const loader = new ConfigLoader()
      loader.addSource({
        type: 'json',
        data: { valid: '{"a":1}', invalid: '{broken', alsoInvalid: 'not json at all' },
        priority: 1,
      })
      loader.load()
      expect(loader.get('valid')).toEqual({ a: 1 })
      expect(loader.get('invalid')).toBe('{broken')
      expect(loader.get('alsoInvalid')).toBe('not json at all')
    })

    it('should handle conflicting sources with same key and priority', () => {
      const loader = new ConfigLoader()
      loader.addSource({
        type: 'object',
        data: { key: 'first' },
        priority: 5,
      })
      loader.addSource({
        type: 'object',
        data: { key: 'second' },
        priority: 5,
      })
      loader.load()
      expect(loader.get('key')).toBe('second')
    })

    it('should handle deep nesting in config', () => {
      const loader = new ConfigLoader()
      loader.addSource({
        type: 'object',
        data: { a: { b: { c: { d: { e: 'deep' } } } } },
        priority: 1,
      })
      loader.load()
      expect(loader.get('a.b.c.d.e')).toBe('deep')
    })

    it('should handle empty data in source', () => {
      const loader = new ConfigLoader()
      loader.addSource({
        type: 'object',
        data: {},
        priority: 1,
      })
      loader.load()
      expect(loader.getAll()).toEqual({})
    })

    it('should handle removeSource with non-existent id', () => {
      const loader = new ConfigLoader()
      loader.addSource({ type: 'object', data: { a: 1 }, priority: 1 })
      loader.removeSource('nonexistent')
      expect(loader.getSources()).toHaveLength(1)
    })

    it('should handle load called multiple times', () => {
      const loader = new ConfigLoader()
      loader.addSource({
        type: 'object',
        data: { key: 'value' },
        priority: 1,
      })
      loader.load()
      loader.load()
      expect(loader.get('key')).toBe('value')
    })

    it('should handle null values in nested paths', () => {
      const loader = new ConfigLoader()
      loader.addSource({
        type: 'object',
        data: { a: null },
        priority: 1,
      })
      loader.load()
      expect(loader.get('a')).toBeNull()
      expect(loader.get('a.b')).toBeUndefined()
    })

    it('should handle mixed types for same key across sources', () => {
      const loader = new ConfigLoader()
      loader.addSource({
        type: 'object',
        data: { key: 'string' },
        priority: 1,
      })
      loader.addSource({
        type: 'object',
        data: { key: { nested: true } },
        priority: 10,
      })
      loader.load()
      expect(loader.get('key')).toEqual({ nested: true })
    })
  })
})
