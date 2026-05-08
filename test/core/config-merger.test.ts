import { describe, it, expect } from 'vitest'
import { ConfigMerger } from '../../src/core/config-merger/config-merger.js'
import type { ConfigLayer, MergeOptions } from '../../src/core/config-merger/types.js'

describe('ConfigMerger', () => {
  describe('Construction', () => {
    it('should create with default options', () => {
      const merger = new ConfigMerger()
      const opts = merger.getOptions()
      expect(opts.strategy).toBe('deep')
      expect(opts.arrays).toBe('replace')
      expect(opts.ignoreKeys).toEqual([])
      expect(opts.priority).toBe('right')
    })

    it('should create with custom options', () => {
      const merger = new ConfigMerger({
        strategy: 'shallow',
        arrays: 'deep',
        ignoreKeys: ['id'],
        priority: 'left',
      })
      const opts = merger.getOptions()
      expect(opts.strategy).toBe('shallow')
      expect(opts.arrays).toBe('deep')
      expect(opts.ignoreKeys).toEqual(['id'])
      expect(opts.priority).toBe('left')
    })

    it('should return a copy of options', () => {
      const merger = new ConfigMerger()
      const opts = merger.getOptions()
      opts.strategy = 'replace'
      expect(merger.getOptions().strategy).toBe('deep')
    })
  })

  describe('Deep merge', () => {
    it('should merge flat objects', () => {
      const merger = new ConfigMerger()
      const result = merger.merge({ a: 1 }, { b: 2 })
      expect(result.merged).toEqual({ a: 1, b: 2 })
    })

    it('should recursively merge nested objects', () => {
      const merger = new ConfigMerger()
      const result = merger.merge(
        { db: { host: 'localhost', port: 5432 } },
        { db: { port: 3306, user: 'admin' } },
      )
      expect(result.merged).toEqual({
        db: { host: 'localhost', port: 3306, user: 'admin' },
      })
    })

    it('should replace arrays by default', () => {
      const merger = new ConfigMerger()
      const result = merger.merge(
        { items: [1, 2, 3] },
        { items: [4, 5] },
      )
      expect(result.merged).toEqual({ items: [4, 5] })
    })

    it('should deeply merge arrays when arrays option is deep', () => {
      const merger = new ConfigMerger({ arrays: 'deep' })
      const result = merger.merge(
        { items: [{ a: 1 }, { b: 2 }] },
        { items: [{ a: 10 }, { c: 3 }] },
      )
      expect(result.merged).toEqual({ items: [{ a: 10 }, { b: 2, c: 3 }] })
    })

    it('should handle null values', () => {
      const merger = new ConfigMerger()
      const result = merger.merge({ a: null }, { b: null })
      expect(result.merged).toEqual({ a: null, b: null })
    })

    it('should handle null overwriting value', () => {
      const merger = new ConfigMerger()
      const result = merger.merge({ a: 'hello' }, { a: null })
      expect(result.merged).toEqual({ a: null })
    })

    it('should handle mixed types', () => {
      const merger = new ConfigMerger()
      const result = merger.merge(
        { key: 'string' },
        { key: { nested: true } },
      )
      expect(result.merged).toEqual({ key: { nested: true } })
    })

    it('should handle empty objects', () => {
      const merger = new ConfigMerger()
      const result = merger.merge({}, { a: 1 })
      expect(result.merged).toEqual({ a: 1 })
    })

    it('should handle merging into empty object', () => {
      const merger = new ConfigMerger()
      const result = merger.merge({ a: 1 }, {})
      expect(result.merged).toEqual({ a: 1 })
    })

    it('should merge deeply nested objects', () => {
      const merger = new ConfigMerger()
      const result = merger.merge(
        { a: { b: { c: { d: 1 } } } },
        { a: { b: { c: { e: 2 } } } },
      )
      expect(result.merged).toEqual({ a: { b: { c: { d: 1, e: 2 } } } })
    })

    it('should not mutate input objects', () => {
      const merger = new ConfigMerger()
      const left = { a: 1, b: { c: 2 } }
      const right = { b: { d: 3 } }
      merger.merge(left, right)
      expect(left).toEqual({ a: 1, b: { c: 2 } })
      expect(right).toEqual({ b: { d: 3 } })
    })
  })

  describe('Shallow merge', () => {
    it('should only merge top-level keys', () => {
      const merger = new ConfigMerger({ strategy: 'shallow' })
      const result = merger.merge(
        { db: { host: 'localhost', port: 5432 } },
        { db: { port: 3306 } },
      )
      expect(result.merged).toEqual({ db: { port: 3306 } })
    })

    it('should override top-level values', () => {
      const merger = new ConfigMerger({ strategy: 'shallow' })
      const result = merger.merge({ a: 1, b: 2 }, { b: 99 })
      expect(result.merged).toEqual({ a: 1, b: 99 })
    })

    it('should preserve non-overlapping keys', () => {
      const merger = new ConfigMerger({ strategy: 'shallow' })
      const result = merger.merge({ a: 1 }, { b: 2, c: 3 })
      expect(result.merged).toEqual({ a: 1, b: 2, c: 3 })
    })
  })

  describe('Replace merge', () => {
    it('should completely replace left with right', () => {
      const merger = new ConfigMerger({ strategy: 'replace' })
      const result = merger.merge(
        { a: 1, b: 2, c: 3 },
        { d: 4 },
      )
      expect(result.merged).toEqual({ d: 4 })
    })

    it('should ignore left entirely', () => {
      const merger = new ConfigMerger({ strategy: 'replace' })
      const result = merger.merge(
        { deeply: { nested: { value: 'old' } } },
        { simple: 'new' },
      )
      expect(result.merged).toEqual({ simple: 'new' })
      expect('deeply' in result.merged).toBe(false)
    })
  })

  describe('mergeAll', () => {
    it('should merge 3+ configs left-to-right', () => {
      const merger = new ConfigMerger()
      const result = merger.mergeAll([
        { a: 1 },
        { b: 2 },
        { c: 3, a: 10 },
      ])
      expect(result.merged).toEqual({ a: 10, b: 2, c: 3 })
    })

    it('should handle single config', () => {
      const merger = new ConfigMerger()
      const result = merger.mergeAll([{ a: 1, b: 2 }])
      expect(result.merged).toEqual({ a: 1, b: 2 })
    })

    it('should handle empty array', () => {
      const merger = new ConfigMerger()
      const result = merger.mergeAll([])
      expect(result.merged).toEqual({})
      expect(result.stats.totalKeys).toBe(0)
    })

    it('should merge 5 configs progressively', () => {
      const merger = new ConfigMerger()
      const result = merger.mergeAll([
        { a: 1 },
        { b: 2 },
        { c: 3 },
        { d: 4 },
        { e: 5 },
      ])
      expect(result.merged).toEqual({ a: 1, b: 2, c: 3, d: 4, e: 5 })
    })
  })

  describe('Layer management', () => {
    it('should add a layer', () => {
      const merger = new ConfigMerger()
      merger.addLayer({ name: 'defaults', config: { a: 1 }, priority: 1, source: 'file' })
      const layers = merger.getLayers()
      expect(layers).toHaveLength(1)
      expect(layers[0]?.name).toBe('defaults')
    })

    it('should remove a layer by name', () => {
      const merger = new ConfigMerger()
      merger.addLayer({ name: 'defaults', config: { a: 1 }, priority: 1, source: 'file' })
      merger.addLayer({ name: 'env', config: { b: 2 }, priority: 10, source: 'env' })
      merger.removeLayer('defaults')
      const layers = merger.getLayers()
      expect(layers).toHaveLength(1)
      expect(layers[0]?.name).toBe('env')
    })

    it('should merge layers by priority', () => {
      const merger = new ConfigMerger()
      merger.addLayer({ name: 'env', config: { port: 8080 }, priority: 10, source: 'env' })
      merger.addLayer({ name: 'defaults', config: { port: 3000, host: 'localhost' }, priority: 1, source: 'file' })
      const result = merger.mergeLayers()
      expect(result.merged).toEqual({ port: 8080, host: 'localhost' })
    })

    it('should sort layers by priority', () => {
      const merger = new ConfigMerger()
      merger.addLayer({ name: 'high', config: {}, priority: 100, source: 'cli' })
      merger.addLayer({ name: 'low', config: {}, priority: 1, source: 'file' })
      merger.addLayer({ name: 'mid', config: {}, priority: 50, source: 'env' })
      const layers = merger.getLayers()
      expect(layers.map((l) => l.name)).toEqual(['low', 'mid', 'high'])
    })

    it('should return empty array when no layers', () => {
      const merger = new ConfigMerger()
      expect(merger.getLayers()).toEqual([])
    })

    it('should merge empty layers', () => {
      const merger = new ConfigMerger()
      const result = merger.mergeLayers()
      expect(result.merged).toEqual({})
    })

    it('should not affect layers when removing non-existent name', () => {
      const merger = new ConfigMerger()
      merger.addLayer({ name: 'a', config: { x: 1 }, priority: 1, source: 'file' })
      merger.removeLayer('nonexistent')
      expect(merger.getLayers()).toHaveLength(1)
    })
  })

  describe('Path operations', () => {
    describe('getPathValue', () => {
      it('should get top-level value', () => {
        const merger = new ConfigMerger()
        expect(merger.getPathValue({ a: 1 }, 'a')).toBe(1)
      })

      it('should get nested value', () => {
        const merger = new ConfigMerger()
        expect(
          merger.getPathValue({ a: { b: { c: 42 } } }, 'a.b.c'),
        ).toBe(42)
      })

      it('should return undefined for missing path', () => {
        const merger = new ConfigMerger()
        expect(merger.getPathValue({ a: 1 }, 'b')).toBeUndefined()
      })

      it('should return undefined for partial missing path', () => {
        const merger = new ConfigMerger()
        expect(merger.getPathValue({ a: { b: 1 } }, 'a.c')).toBeUndefined()
      })

      it('should return undefined for null intermediate', () => {
        const merger = new ConfigMerger()
        expect(merger.getPathValue({ a: null }, 'a.b')).toBeUndefined()
      })

      it('should access array indices', () => {
        const merger = new ConfigMerger()
        expect(merger.getPathValue({ items: [10, 20, 30] }, 'items.1')).toBe(20)
      })

      it('should return undefined for out-of-bounds array index', () => {
        const merger = new ConfigMerger()
        expect(merger.getPathValue({ items: [1] }, 'items.5')).toBeUndefined()
      })

      it('should handle deeply nested array access', () => {
        const merger = new ConfigMerger()
        expect(
          merger.getPathValue({ a: { items: [{ b: 42 }] } }, 'a.items.0.b'),
        ).toBe(42)
      })

      it('should return the whole array when path points to array key', () => {
        const merger = new ConfigMerger()
        expect(merger.getPathValue({ items: [1, 2, 3] }, 'items')).toEqual([1, 2, 3])
      })
    })

    describe('setPathValue', () => {
      it('should set top-level value', () => {
        const merger = new ConfigMerger()
        const result = merger.setPathValue({}, 'key', 'value')
        expect(result).toEqual({ key: 'value' })
      })

      it('should create nested path', () => {
        const merger = new ConfigMerger()
        const result = merger.setPathValue({}, 'a.b.c', 42)
        expect(result).toEqual({ a: { b: { c: 42 } } })
      })

      it('should overwrite existing value', () => {
        const merger = new ConfigMerger()
        const result = merger.setPathValue({ key: 'old' }, 'key', 'new')
        expect(result).toEqual({ key: 'new' })
      })

      it('should not mutate original object', () => {
        const merger = new ConfigMerger()
        const original = { a: { b: 1 } }
        const result = merger.setPathValue(original, 'a.c', 2)
        expect(original).toEqual({ a: { b: 1 } })
        expect(result).toEqual({ a: { b: 1, c: 2 } })
      })

      it('should overwrite non-object intermediate with object', () => {
        const merger = new ConfigMerger()
        const result = merger.setPathValue({ a: 'flat' }, 'a.b', 'nested')
        expect(result).toEqual({ a: { b: 'nested' } })
      })
    })
  })

  describe('Diff', () => {
    it('should return zero stats for identical configs', () => {
      const merger = new ConfigMerger()
      const stats = merger.getDiff({ a: 1, b: 2 }, { a: 1, b: 2 })
      expect(stats.totalKeys).toBe(2)
      expect(stats.unchangedKeys).toBe(2)
      expect(stats.modifiedKeys).toBe(0)
      expect(stats.addedKeys).toBe(0)
      expect(stats.removedKeys).toBe(0)
    })

    it('should detect added keys', () => {
      const merger = new ConfigMerger()
      const stats = merger.getDiff({ a: 1 }, { a: 1, b: 2, c: 3 })
      expect(stats.addedKeys).toBe(2)
      expect(stats.totalKeys).toBe(3)
    })

    it('should detect removed keys', () => {
      const merger = new ConfigMerger()
      const stats = merger.getDiff({ a: 1, b: 2, c: 3 }, { a: 1 })
      expect(stats.removedKeys).toBe(2)
    })

    it('should detect modified keys', () => {
      const merger = new ConfigMerger()
      const stats = merger.getDiff({ a: 1, b: 2 }, { a: 1, b: 99 })
      expect(stats.modifiedKeys).toBe(1)
      expect(stats.unchangedKeys).toBe(1)
    })

    it('should compute accurate stats', () => {
      const merger = new ConfigMerger()
      const stats = merger.getDiff(
        { a: 1, b: 2, c: 3 },
        { a: 1, b: 20, d: 4 },
      )
      expect(stats.totalKeys).toBe(4)
      expect(stats.unchangedKeys).toBe(1)
      expect(stats.modifiedKeys).toBe(1)
      expect(stats.addedKeys).toBe(1)
      expect(stats.removedKeys).toBe(1)
    })

    it('should handle both empty', () => {
      const merger = new ConfigMerger()
      const stats = merger.getDiff({}, {})
      expect(stats.totalKeys).toBe(0)
      expect(stats.addedKeys).toBe(0)
      expect(stats.removedKeys).toBe(0)
    })
  })

  describe('Conflicts', () => {
    it('should detect conflicts during merge', () => {
      const merger = new ConfigMerger()
      const result = merger.merge({ a: 1 }, { a: 2 })
      expect(result.conflicts).toHaveLength(1)
      expect(result.conflicts[0]?.path).toEqual(['a'])
      expect(result.conflicts[0]?.leftValue).toBe(1)
      expect(result.conflicts[0]?.rightValue).toBe(2)
    })

    it('should record resolved value in conflicts', () => {
      const merger = new ConfigMerger()
      const result = merger.merge({ a: 1 }, { a: 2 })
      expect(result.conflicts[0]?.resolved).toBe(2)
    })

    it('should record strategy used', () => {
      const merger = new ConfigMerger()
      const result = merger.merge({ a: 1 }, { a: 2 })
      expect(result.conflicts[0]?.strategy).toBe('deep')
    })

    it('should use left priority for conflict resolution', () => {
      const merger = new ConfigMerger({ priority: 'left' })
      const result = merger.merge({ a: 1 }, { a: 2 })
      expect(result.conflicts[0]?.resolved).toBe(1)
      expect(result.merged.a).toBe(1)
    })

    it('should detect nested conflicts', () => {
      const merger = new ConfigMerger()
      const result = merger.merge(
        { db: { host: 'localhost' } },
        { db: { host: 'example.com' } },
      )
      expect(result.conflicts).toHaveLength(1)
      expect(result.conflicts[0]?.path).toEqual(['db', 'host'])
    })

    it('should track conflicts from last merge via getConflicts', () => {
      const merger = new ConfigMerger()
      merger.merge({ a: 1 }, { a: 2 })
      const conflicts = merger.getConflicts()
      expect(conflicts).toHaveLength(1)
    })

    it('should reset conflicts on new merge', () => {
      const merger = new ConfigMerger()
      merger.merge({ a: 1 }, { a: 2 })
      merger.merge({ x: 1 }, { x: 1 })
      expect(merger.getConflicts()).toHaveLength(0)
    })
  })

  describe('Ignore keys', () => {
    it('should ignore specified keys during merge', () => {
      const merger = new ConfigMerger({ ignoreKeys: ['id', 'version'] })
      const result = merger.merge(
        { id: 1, version: '1.0', name: 'old' },
        { id: 2, version: '2.0', name: 'new' },
      )
      expect(result.merged.id).toBe(1)
      expect(result.merged.version).toBe('1.0')
      expect(result.merged.name).toBe('new')
    })

    it('should partially ignore keys', () => {
      const merger = new ConfigMerger({ ignoreKeys: ['id'] })
      const result = merger.merge(
        { id: 1, name: 'old' },
        { id: 2, name: 'new' },
      )
      expect(result.merged.id).toBe(1)
      expect(result.merged.name).toBe('new')
    })

    it('should handle ignore with no matching keys', () => {
      const merger = new ConfigMerger({ ignoreKeys: ['z'] })
      const result = merger.merge({ a: 1 }, { b: 2 })
      expect(result.merged).toEqual({ a: 1, b: 2 })
    })
  })

  describe('Edge cases', () => {
    it('should handle both empty objects', () => {
      const merger = new ConfigMerger()
      const result = merger.merge({}, {})
      expect(result.merged).toEqual({})
      expect(result.conflicts).toHaveLength(0)
      expect(result.stats.totalKeys).toBe(0)
    })

    it('should handle one empty object (left)', () => {
      const merger = new ConfigMerger()
      const result = merger.merge({}, { a: 1, b: 'hello' })
      expect(result.merged).toEqual({ a: 1, b: 'hello' })
    })

    it('should handle one empty object (right)', () => {
      const merger = new ConfigMerger()
      const result = merger.merge({ a: 1, b: 'hello' }, {})
      expect(result.merged).toEqual({ a: 1, b: 'hello' })
    })

    it('should handle null values in both', () => {
      const merger = new ConfigMerger()
      const result = merger.merge({ a: null }, { a: null })
      expect(result.merged).toEqual({ a: null })
      expect(result.conflicts).toHaveLength(0)
    })

    it('should handle boolean values', () => {
      const merger = new ConfigMerger()
      const result = merger.merge({ flag: false }, { flag: true })
      expect(result.merged.flag).toBe(true)
    })

    it('should handle numeric values', () => {
      const merger = new ConfigMerger()
      const result = merger.merge({ count: 0 }, { count: 42 })
      expect(result.merged.count).toBe(42)
    })

    it('should handle very deep nesting', () => {
      const merger = new ConfigMerger()
      const deep: Record<string, ConfigValue> = { value: 'deep' }
      for (let i = 0; i < 20; i++) {
        const wrapper: Record<string, ConfigValue> = {}
        wrapper[`level${i}`] = deep
      }
      const left: Record<string, ConfigValue> = {}
      let current: Record<string, ConfigValue> = left
      for (let i = 0; i < 20; i++) {
        current[`level${i}`] = {}
        current = current[`level${i}`] as Record<string, ConfigValue>
      }
      current['value'] = 'original'
      const right: Record<string, ConfigValue> = {}
      let currentR: Record<string, ConfigValue> = right
      for (let i = 0; i < 20; i++) {
        currentR[`level${i}`] = {}
        currentR = currentR[`level${i}`] as Record<string, ConfigValue>
      }
      currentR['value'] = 'updated'
      const result = merger.merge(left, right)
      let check: Record<string, ConfigValue> = result.merged
      for (let i = 0; i < 20; i++) {
        check = check[`level${i}`] as Record<string, ConfigValue>
      }
      expect(check['value']).toBe('updated')
    })

    it('should handle object replaced by primitive', () => {
      const merger = new ConfigMerger()
      const result = merger.merge(
        { key: { nested: true } },
        { key: 'simple' },
      )
      expect(result.merged.key).toBe('simple')
    })

    it('should handle primitive replaced by object', () => {
      const merger = new ConfigMerger()
      const result = merger.merge(
        { key: 'simple' },
        { key: { nested: true } },
      )
      expect(result.merged).toEqual({ key: { nested: true } })
    })
  })

  describe('Reset', () => {
    it('should clear layers and conflicts', () => {
      const merger = new ConfigMerger()
      merger.addLayer({ name: 'test', config: { a: 1 }, priority: 1, source: 'file' })
      merger.merge({ x: 1 }, { x: 2 })
      merger.reset()
      expect(merger.getLayers()).toEqual([])
      expect(merger.getConflicts()).toEqual([])
    })
  })

  describe('shallowMerge', () => {
    it('should merge top-level only', () => {
      const merger = new ConfigMerger()
      const result = merger.shallowMerge({ a: 1, b: { c: 2 } }, { b: { d: 3 } })
      expect(result).toEqual({ a: 1, b: { d: 3 } })
    })
  })

  describe('replaceMerge', () => {
    it('should return right completely', () => {
      const merger = new ConfigMerger()
      const result = merger.replaceMerge({ a: 1, b: 2 }, { c: 3 })
      expect(result).toEqual({ c: 3 })
    })
  })

  describe('deepMerge direct', () => {
    it('should deep merge without tracking conflicts', () => {
      const merger = new ConfigMerger()
      const result = merger.deepMerge(
        { a: { b: 1 } },
        { a: { c: 2 } },
      )
      expect(result).toEqual({ a: { b: 1, c: 2 } })
      expect(merger.getConflicts()).toEqual([])
    })
  })

  describe('Additional coverage', () => {
    it('should handle array replaced by object', () => {
      const merger = new ConfigMerger()
      const result = merger.merge(
        { items: [1, 2, 3] },
        { items: { count: 3 } },
      )
      expect(result.merged).toEqual({ items: { count: 3 } })
    })

    it('should handle object replaced by array', () => {
      const merger = new ConfigMerger()
      const result = merger.merge(
        { items: { a: 1 } },
        { items: [1, 2] },
      )
      expect(result.merged).toEqual({ items: [1, 2] })
    })

    it('should handle string vs number conflict', () => {
      const merger = new ConfigMerger()
      const result = merger.merge({ port: '3000' }, { port: 3000 })
      expect(result.merged.port).toBe(3000)
      expect(result.conflicts).toHaveLength(1)
    })

    it('should handle multiple conflicts in one merge', () => {
      const merger = new ConfigMerger()
      const result = merger.merge(
        { a: 1, b: 'old', c: true },
        { a: 2, b: 'new', c: false },
      )
      expect(result.conflicts).toHaveLength(3)
    })

    it('should handle shallow merge with conflicts at top level only', () => {
      const merger = new ConfigMerger({ strategy: 'shallow' })
      const result = merger.merge(
        { a: { x: 1 }, b: 2 },
        { a: { y: 3 }, b: 3 },
      )
      expect(result.conflicts).toHaveLength(2)
    })

    it('should ignore keys in shallow merge', () => {
      const merger = new ConfigMerger({ strategy: 'shallow', ignoreKeys: ['keep'] })
      const result = merger.merge(
        { keep: 'original', change: 'old' },
        { keep: 'ignored', change: 'new' },
      )
      expect(result.merged.keep).toBe('original')
      expect(result.merged.change).toBe('new')
    })

    it('should handle mergeAll with overlapping deep keys', () => {
      const merger = new ConfigMerger()
      const result = merger.mergeAll([
        { db: { host: 'localhost', port: 5432 } },
        { db: { port: 3306, user: 'root' } },
        { db: { password: 'secret' } },
      ])
      expect(result.merged).toEqual({
        db: { host: 'localhost', port: 3306, user: 'root', password: 'secret' },
      })
    })

    it('should handle layers with same priority', () => {
      const merger = new ConfigMerger()
      merger.addLayer({ name: 'a', config: { x: 1 }, priority: 5, source: 'file' })
      merger.addLayer({ name: 'b', config: { y: 2 }, priority: 5, source: 'file' })
      const result = merger.mergeLayers()
      expect(result.merged).toEqual({ x: 1, y: 2 })
    })

    it('should add many layers and merge correctly', () => {
      const merger = new ConfigMerger()
      merger.addLayer({ name: 'base', config: { a: 1, b: 2, c: 3 }, priority: 1, source: 'file' })
      merger.addLayer({ name: 'env', config: { b: 20, d: 4 }, priority: 10, source: 'env' })
      merger.addLayer({ name: 'cli', config: { c: 30 }, priority: 100, source: 'cli' })
      const result = merger.mergeLayers()
      expect(result.merged).toEqual({ a: 1, b: 20, c: 30, d: 4 })
    })

    it('should handle getPathValue with empty string key', () => {
      const merger = new ConfigMerger()
      expect(merger.getPathValue({ '': 'empty' }, '')).toBe('empty')
    })

    it('should handle setPathValue setting array value', () => {
      const merger = new ConfigMerger()
      const result = merger.setPathValue({ items: [1, 2] }, 'items', [3, 4, 5])
      expect(result).toEqual({ items: [3, 4, 5] })
    })

    it('should track stats correctly for mergeAll', () => {
      const merger = new ConfigMerger()
      const result = merger.mergeAll([{ a: 1 }, { b: 2 }, { a: 10, b: 20 }])
      expect(result.stats.modifiedKeys).toBe(2)
    })

    it('should handle null in nested path', () => {
      const merger = new ConfigMerger()
      const result = merger.merge(
        { a: null },
        { b: 'value' },
      )
      expect(result.merged).toEqual({ a: null, b: 'value' })
    })

    it('should handle replace merge with empty right', () => {
      const merger = new ConfigMerger({ strategy: 'replace' })
      const result = merger.merge({ a: 1, b: 2 }, {})
      expect(result.merged).toEqual({})
    })
  })
})
