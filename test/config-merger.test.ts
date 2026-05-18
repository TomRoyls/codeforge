import { describe, it, expect } from 'vitest'
import { ConfigMerger } from '../src/core/config-merger/config-merger.js'
import type {
  MergeOptions,
  MergeResult,
  MergeConflict,
  MergeStats,
  ConfigLayer,
} from '../src/core/config-merger/types.js'

// ─── Constructor ───────────────────────────────────────────────────
describe('ConfigMerger constructor', () => {
  it('uses default options when none given', () => {
    const merger = new ConfigMerger()
    const opts = merger.getOptions()
    expect(opts.strategy).toBe('deep')
    expect(opts.arrays).toBe('replace')
    expect(opts.ignoreKeys).toEqual([])
    expect(opts.priority).toBe('right')
  })

  it('accepts partial options', () => {
    const merger = new ConfigMerger({ strategy: 'shallow', priority: 'left' })
    const opts = merger.getOptions()
    expect(opts.strategy).toBe('shallow')
    expect(opts.priority).toBe('left')
    expect(opts.arrays).toBe('replace') // default preserved
  })

  it('getOptions returns a copy', () => {
    const merger = new ConfigMerger()
    const opts = merger.getOptions()
    opts.strategy = 'replace'
    expect(merger.getOptions().strategy).toBe('deep')
  })
})

// ─── merge (deep strategy) ─────────────────────────────────────────
describe('merge with deep strategy', () => {
  it('merges flat objects', () => {
    const merger = new ConfigMerger({ strategy: 'deep' })
    const result = merger.merge({ a: 1, b: 2 }, { b: 3, c: 4 })
    expect(result.merged).toEqual({ a: 1, b: 3, c: 4 })
  })

  it('deep merges nested objects', () => {
    const merger = new ConfigMerger({ strategy: 'deep' })
    const result = merger.merge(
      { db: { host: 'localhost', port: 5432 } },
      { db: { port: 3306, user: 'admin' } },
    )
    expect(result.merged).toEqual({ db: { host: 'localhost', port: 3306, user: 'admin' } })
  })

  it('records conflicts for overwritten values', () => {
    const merger = new ConfigMerger({ strategy: 'deep' })
    const result = merger.merge({ a: 1 }, { a: 2 })
    expect(result.conflicts).toHaveLength(1)
    expect(result.conflicts[0]!.leftValue).toBe(1)
    expect(result.conflicts[0]!.rightValue).toBe(2)
    expect(result.conflicts[0]!.resolved).toBe(2)
  })

  it('no conflicts for new keys', () => {
    const merger = new ConfigMerger({ strategy: 'deep' })
    const result = merger.merge({}, { a: 1, b: 2 })
    expect(result.conflicts).toHaveLength(0)
  })

  it('no conflicts for identical values', () => {
    const merger = new ConfigMerger({ strategy: 'deep' })
    const result = merger.merge({ a: 1 }, { a: 1 })
    expect(result.conflicts).toHaveLength(0)
  })

  it('respects ignoreKeys', () => {
    const merger = new ConfigMerger({ strategy: 'deep', ignoreKeys: ['secret'] })
    const result = merger.merge({ secret: 'old', a: 1 }, { secret: 'new', b: 2 })
    expect(result.merged.secret).toBe('old')
    expect(result.merged.a).toBe(1)
    expect(result.merged.b).toBe(2)
  })

  it('replaces arrays by default (arrays: replace)', () => {
    const merger = new ConfigMerger({ strategy: 'deep', arrays: 'replace' })
    const result = merger.merge({ items: [1, 2, 3] }, { items: [4, 5] })
    expect(result.merged.items).toEqual([4, 5])
  })

  it('deep merges arrays when arrays: deep', () => {
    const merger = new ConfigMerger({ strategy: 'deep', arrays: 'deep' })
    const result = merger.merge(
      { items: [{ a: 1 }, { b: 2 }] },
      { items: [{ a: 10 }, { c: 3 }, { d: 4 }] },
    )
    expect(result.merged.items).toEqual([{ a: 10 }, { b: 2, c: 3 }, { d: 4 }])
  })

  it('left priority resolves conflicts to left value', () => {
    const merger = new ConfigMerger({ strategy: 'deep', priority: 'left' })
    const result = merger.merge({ x: 'left' }, { x: 'right' })
    expect(result.conflicts[0]!.resolved).toBe('left')
    expect(result.merged.x).toBe('left')
  })

  it('handles deeply nested conflicts', () => {
    const merger = new ConfigMerger({ strategy: 'deep' })
    const result = merger.merge(
      { a: { b: { c: 1 } } },
      { a: { b: { c: 2 } } },
    )
    expect(result.conflicts).toHaveLength(1)
    expect(result.conflicts[0]!.path).toEqual(['a', 'b', 'c'])
  })
})

// ─── merge (shallow strategy) ──────────────────────────────────────
describe('merge with shallow strategy', () => {
  it('replaces top-level values', () => {
    const merger = new ConfigMerger({ strategy: 'shallow' })
    const result = merger.merge(
      { db: { host: 'localhost', port: 5432 } },
      { db: { user: 'admin' } },
    )
    expect(result.merged.db).toEqual({ user: 'admin' })
  })

  it('only records top-level conflicts', () => {
    const merger = new ConfigMerger({ strategy: 'shallow' })
    const result = merger.merge({ a: 1 }, { a: 2 })
    expect(result.conflicts).toHaveLength(1)
    expect(result.conflicts[0]!.path).toEqual(['a'])
  })
})

// ─── merge (replace strategy) ──────────────────────────────────────
describe('merge with replace strategy', () => {
  it('replaces entire left with right', () => {
    const merger = new ConfigMerger({ strategy: 'replace' })
    const result = merger.merge({ a: 1, b: 2 }, { c: 3 })
    expect(result.merged).toEqual({ c: 3 })
  })

  it('respects ignoreKeys', () => {
    const merger = new ConfigMerger({ strategy: 'replace', ignoreKeys: ['c'] })
    const result = merger.merge({ a: 1 }, { b: 2, c: 3 })
    expect(result.merged).toEqual({ b: 2 })
  })

  it('no conflicts recorded for replace', () => {
    const merger = new ConfigMerger({ strategy: 'replace' })
    const result = merger.merge({ a: 1 }, { b: 2 })
    expect(result.conflicts).toHaveLength(0)
  })
})

// ─── mergeAll ──────────────────────────────────────────────────────
describe('mergeAll', () => {
  it('merges multiple configs sequentially', () => {
    const merger = new ConfigMerger({ strategy: 'deep' })
    const result = merger.mergeAll([{ a: 1 }, { b: 2 }, { a: 10, c: 3 }])
    expect(result.merged).toEqual({ a: 10, b: 2, c: 3 })
  })

  it('returns empty for empty array', () => {
    const merger = new ConfigMerger()
    const result = merger.mergeAll([])
    expect(result.merged).toEqual({})
    expect(result.stats.totalKeys).toBe(0)
  })

  it('returns single config as-is', () => {
    const merger = new ConfigMerger()
    const result = merger.mergeAll([{ a: 1 }])
    expect(result.merged).toEqual({ a: 1 })
  })
})

// ─── Layers ────────────────────────────────────────────────────────
describe('layers', () => {
  it('addLayer / getLayers', () => {
    const merger = new ConfigMerger()
    merger.addLayer({ name: 'base', config: { a: 1 }, priority: 0, source: 'file' })
    merger.addLayer({ name: 'env', config: { b: 2 }, priority: 10, source: 'env' })
    const layers = merger.getLayers()
    expect(layers.map((l) => l.name)).toEqual(['base', 'env'])
  })

  it('removeLayer by name', () => {
    const merger = new ConfigMerger()
    merger.addLayer({ name: 'base', config: {}, priority: 0, source: 'test' })
    merger.addLayer({ name: 'env', config: {}, priority: 1, source: 'test' })
    merger.removeLayer('base')
    expect(merger.getLayers()).toHaveLength(1)
    expect(merger.getLayers()[0]!.name).toBe('env')
  })

  it('mergeLayers merges sorted by priority', () => {
    const merger = new ConfigMerger({ strategy: 'deep' })
    merger.addLayer({ name: 'high', config: { x: 'high' }, priority: 10, source: 'env' })
    merger.addLayer({ name: 'low', config: { x: 'low', y: 1 }, priority: 0, source: 'file' })
    const result = merger.mergeLayers()
    expect(result.merged).toEqual({ x: 'high', y: 1 })
  })

  it('mergeLayers empty returns empty', () => {
    const merger = new ConfigMerger()
    const result = merger.mergeLayers()
    expect(result.merged).toEqual({})
  })
})

// ─── deepMerge / shallowMerge / replaceMerge ───────────────────────
describe('convenience merge methods', () => {
  it('deepMerge returns merged object', () => {
    const merger = new ConfigMerger()
    const result = merger.deepMerge(
      { a: { x: 1 } },
      { a: { y: 2 } },
    )
    expect(result).toEqual({ a: { x: 1, y: 2 } })
  })

  it('shallowMerge replaces top-level keys', () => {
    const merger = new ConfigMerger()
    const result = merger.shallowMerge(
      { a: { x: 1 } },
      { a: { y: 2 } },
    )
    expect(result).toEqual({ a: { y: 2 } })
  })

  it('replaceMerge returns copy of right', () => {
    const merger = new ConfigMerger()
    const result = merger.replaceMerge({ a: 1 }, { b: 2 })
    expect(result).toEqual({ b: 2 })
  })
})

// ─── getDiff ───────────────────────────────────────────────────────
describe('getDiff', () => {
  it('computes stats for two configs', () => {
    const merger = new ConfigMerger()
    const stats = merger.getDiff({ a: 1, b: 2 }, { b: 2, c: 3 })
    expect(stats.addedKeys).toBe(1)
    expect(stats.removedKeys).toBe(1)
    expect(stats.unchangedKeys).toBe(1)
    expect(stats.modifiedKeys).toBe(0)
  })

  it('detects modified keys', () => {
    const merger = new ConfigMerger()
    const stats = merger.getDiff({ a: 1 }, { a: 2 })
    expect(stats.modifiedKeys).toBe(1)
    expect(stats.unchangedKeys).toBe(0)
  })
})

// ─── getPathValue / setPathValue ───────────────────────────────────
describe('getPathValue', () => {
  it('gets top-level value', () => {
    const merger = new ConfigMerger()
    expect(merger.getPathValue({ a: 1, b: 2 }, 'a')).toBe(1)
  })

  it('gets nested value', () => {
    const merger = new ConfigMerger()
    expect(merger.getPathValue({ a: { b: { c: 42 } } }, 'a.b.c')).toBe(42)
  })

  it('gets array element by index', () => {
    const merger = new ConfigMerger()
    expect(merger.getPathValue({ items: [10, 20, 30] }, 'items.1')).toBe(20)
  })

  it('returns undefined for missing path', () => {
    const merger = new ConfigMerger()
    expect(merger.getPathValue({ a: 1 }, 'b')).toBeUndefined()
    expect(merger.getPathValue({ a: { b: 1 } }, 'a.c')).toBeUndefined()
  })

  it('returns undefined for out-of-bounds array index', () => {
    const merger = new ConfigMerger()
    expect(merger.getPathValue({ items: [1] }, 'items.5')).toBeUndefined()
  })

  it('returns undefined for null/undefined intermediate', () => {
    const merger = new ConfigMerger()
    expect(merger.getPathValue({ a: null } as Record<string, unknown>, 'a.b')).toBeUndefined()
  })
})

describe('setPathValue', () => {
  it('sets top-level value', () => {
    const merger = new ConfigMerger()
    const result = merger.setPathValue({ a: 1 }, 'b', 2)
    expect(result).toEqual({ a: 1, b: 2 })
  })

  it('sets nested value creating intermediate objects', () => {
    const merger = new ConfigMerger()
    const result = merger.setPathValue({}, 'a.b.c', 42)
    expect(result).toEqual({ a: { b: { c: 42 } } })
  })

  it('does not mutate original', () => {
    const merger = new ConfigMerger()
    const original = { a: { b: 1 } }
    merger.setPathValue(original, 'a.c', 2)
    expect(original).toEqual({ a: { b: 1 } })
  })

  it('overwrites existing value', () => {
    const merger = new ConfigMerger()
    const result = merger.setPathValue({ a: 1 }, 'a', 99)
    expect(result).toEqual({ a: 99 })
  })
})

// ─── getConflicts ──────────────────────────────────────────────────
describe('getConflicts', () => {
  it('returns conflicts from last merge', () => {
    const merger = new ConfigMerger({ strategy: 'deep' })
    merger.merge({ a: 1 }, { a: 2 })
    const conflicts = merger.getConflicts()
    expect(conflicts).toHaveLength(1)
  })

  it('resets on new merge', () => {
    const merger = new ConfigMerger({ strategy: 'deep' })
    merger.merge({ a: 1 }, { a: 2 })
    merger.merge({ x: 1 }, { y: 2 })
    expect(merger.getConflicts()).toHaveLength(0)
  })
})

// ─── reset ─────────────────────────────────────────────────────────
describe('reset', () => {
  it('clears layers and conflicts', () => {
    const merger = new ConfigMerger()
    merger.addLayer({ name: 'test', config: {}, priority: 0, source: 'test' })
    merger.merge({ a: 1 }, { a: 2 })
    merger.reset()
    expect(merger.getLayers()).toHaveLength(0)
    expect(merger.getConflicts()).toHaveLength(0)
  })
})

// ─── Stats ─────────────────────────────────────────────────────────
describe('merge stats', () => {
  it('computes correct stats for simple merge', () => {
    const merger = new ConfigMerger()
    const result = merger.merge(
      { a: 1, b: 2, c: 3 },
      { b: 2, c: 30, d: 4 },
    )
    expect(result.stats).toMatchObject({
      addedKeys: 1,
      modifiedKeys: 1,
      unchangedKeys: 1,
      removedKeys: 1,
    })
  })

  it('removedKeys counts keys only in left', () => {
    const merger = new ConfigMerger()
    const result = merger.merge({ a: 1, b: 2 }, { b: 2 })
    expect(result.stats.removedKeys).toBe(1)
    expect(result.stats.unchangedKeys).toBe(1)
  })

  it('totalKeys reflects merged object', () => {
    const merger = new ConfigMerger()
    const result = merger.merge({ a: 1 }, { b: 2, c: 3 })
    expect(result.stats.totalKeys).toBe(3)
  })
})
