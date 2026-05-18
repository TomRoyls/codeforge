import { describe, it, expect } from 'vitest'
import { BitmapIndex } from '../src/core/bitmap-index/bitmap-index.js'

// ── Constructor ──────────────────────────────────────────────────────────────

describe('BitmapIndex constructor', () => {
  it('creates an instance with zero records', () => {
    const idx = new BitmapIndex(0)
    expect(idx.getNumRecords()).toBe(0)
  })

  it('creates an instance with a positive integer', () => {
    const idx = new BitmapIndex(100)
    expect(idx.getNumRecords()).toBe(100)
  })

  it('throws on negative number', () => {
    expect(() => new BitmapIndex(-1)).toThrow(RangeError)
  })

  it('throws on non-integer', () => {
    expect(() => new BitmapIndex(3.5)).toThrow(RangeError)
  })

  it('throws on NaN', () => {
    expect(() => new BitmapIndex(NaN)).toThrow(RangeError)
  })
})

// ── addField ─────────────────────────────────────────────────────────────────

describe('addField', () => {
  it('adds a field and it appears in getFields', () => {
    const idx = new BitmapIndex(64)
    idx.addField('color', 3)
    expect(idx.getFields()).toEqual(['color'])
  })

  it('adds multiple fields', () => {
    const idx = new BitmapIndex(64)
    idx.addField('color', 3)
    idx.addField('size', 5)
    expect(idx.getFields()).toEqual(['color', 'size'])
  })

  it('throws when adding a duplicate field name', () => {
    const idx = new BitmapIndex(64)
    idx.addField('color', 3)
    expect(() => idx.addField('color', 3)).toThrow(/already exists/)
  })

  it('throws on empty string field name', () => {
    const idx = new BitmapIndex(64)
    expect(() => idx.addField('', 3)).toThrow(/non-empty string/)
  })

  it('throws on cardinality 0', () => {
    const idx = new BitmapIndex(64)
    expect(() => idx.addField('x', 0)).toThrow(RangeError)
  })

  it('throws on negative cardinality', () => {
    const idx = new BitmapIndex(64)
    expect(() => idx.addField('x', -2)).toThrow(RangeError)
  })

  it('throws on non-integer cardinality', () => {
    const idx = new BitmapIndex(64)
    expect(() => idx.addField('x', 2.5)).toThrow(RangeError)
  })
})

// ── set / get ────────────────────────────────────────────────────────────────

describe('set and get', () => {
  it('sets and gets a value for a record', () => {
    const idx = new BitmapIndex(32)
    idx.addField('status', 3)
    idx.set('status', 0, 1)
    expect(idx.get('status', 0)).toBe(1)
  })

  it('returns -1 for an unset record', () => {
    const idx = new BitmapIndex(32)
    idx.addField('status', 3)
    expect(idx.get('status', 5)).toBe(-1)
  })

  it('overwrites a previous value', () => {
    const idx = new BitmapIndex(32)
    idx.addField('status', 3)
    idx.set('status', 0, 1)
    idx.set('status', 0, 2)
    expect(idx.get('status', 0)).toBe(2)
  })

  it('works with indices spanning multiple words (>32 records)', () => {
    const idx = new BitmapIndex(100)
    idx.addField('tag', 4)
    idx.set('tag', 64, 3)
    expect(idx.get('tag', 64)).toBe(3)
    idx.set('tag', 33, 1)
    expect(idx.get('tag', 33)).toBe(1)
  })

  it('throws on out-of-range record index', () => {
    const idx = new BitmapIndex(10)
    idx.addField('f', 2)
    expect(() => idx.set('f', 10, 0)).toThrow(RangeError)
    expect(() => idx.set('f', -1, 0)).toThrow(RangeError)
  })

  it('throws on out-of-range value', () => {
    const idx = new BitmapIndex(10)
    idx.addField('f', 3)
    expect(() => idx.set('f', 0, 3)).toThrow(RangeError)
    expect(() => idx.set('f', 0, -1)).toThrow(RangeError)
  })

  it('throws on unknown field name', () => {
    const idx = new BitmapIndex(10)
    expect(() => idx.set('missing', 0, 0)).toThrow(/not found/)
    expect(() => idx.get('missing', 0)).toThrow(/not found/)
  })
})

// ── queryEquals ──────────────────────────────────────────────────────────────

describe('queryEquals', () => {
  it('returns indices matching an exact value', () => {
    const idx = new BitmapIndex(10)
    idx.addField('color', 3)
    idx.set('color', 0, 0)
    idx.set('color', 1, 1)
    idx.set('color', 2, 0)
    idx.set('color', 3, 2)
    expect(idx.queryEquals('color', 0)).toEqual([0, 2])
  })

  it('returns empty array when no records match', () => {
    const idx = new BitmapIndex(10)
    idx.addField('color', 3)
    idx.set('color', 0, 1)
    expect(idx.queryEquals('color', 0)).toEqual([])
  })

  it('throws on out-of-range value', () => {
    const idx = new BitmapIndex(10)
    idx.addField('f', 3)
    expect(() => idx.queryEquals('f', 3)).toThrow(RangeError)
  })
})

// ── queryRange ───────────────────────────────────────────────────────────────

describe('queryRange', () => {
  it('returns indices matching a range of values', () => {
    const idx = new BitmapIndex(10)
    idx.addField('score', 5)
    idx.set('score', 0, 0)
    idx.set('score', 1, 2)
    idx.set('score', 2, 4)
    idx.set('score', 3, 1)
    expect(idx.queryRange('score', 1, 3).sort((a, b) => a - b)).toEqual([1, 3])
  })

  it('returns empty array when no values in range', () => {
    const idx = new BitmapIndex(10)
    idx.addField('score', 5)
    idx.set('score', 0, 0)
    expect(idx.queryRange('score', 3, 4)).toEqual([])
  })

  it('throws when min > max', () => {
    const idx = new BitmapIndex(10)
    idx.addField('f', 5)
    expect(() => idx.queryRange('f', 3, 1)).toThrow(/must be <=/)
  })

  it('throws when range out of bounds', () => {
    const idx = new BitmapIndex(10)
    idx.addField('f', 3)
    expect(() => idx.queryRange('f', -1, 2)).toThrow(RangeError)
    expect(() => idx.queryRange('f', 0, 3)).toThrow(RangeError)
  })

  it('throws on non-integer min or max', () => {
    const idx = new BitmapIndex(10)
    idx.addField('f', 5)
    expect(() => idx.queryRange('f', 1.5, 3)).toThrow(TypeError)
    expect(() => idx.queryRange('f', 1, 3.5)).toThrow(TypeError)
  })
})

// ── queryAnd ─────────────────────────────────────────────────────────────────

describe('queryAnd', () => {
  it('returns intersection of two sets', () => {
    const idx = new BitmapIndex(10)
    expect(idx.queryAnd([[0, 2, 4], [2, 4, 6]])).toEqual([2, 4])
  })

  it('returns intersection of three sets', () => {
    const idx = new BitmapIndex(20)
    expect(idx.queryAnd([[0, 1, 2, 3], [1, 2, 3, 4], [2, 3, 5]])).toEqual([2, 3])
  })

  it('returns empty array when intersection is empty', () => {
    const idx = new BitmapIndex(10)
    expect(idx.queryAnd([[0, 1], [2, 3]])).toEqual([])
  })

  it('returns empty array for empty input', () => {
    const idx = new BitmapIndex(10)
    expect(idx.queryAnd([])).toEqual([])
  })

  it('returns copy of single set', () => {
    const idx = new BitmapIndex(10)
    const result = idx.queryAnd([[1, 3, 5]])
    expect(result).toEqual([1, 3, 5])
  })
})

// ── queryOr ──────────────────────────────────────────────────────────────────

describe('queryOr', () => {
  it('returns union of two sets', () => {
    const idx = new BitmapIndex(10)
    expect(idx.queryOr([[0, 2], [2, 4]]).sort((a, b) => a - b)).toEqual([0, 2, 4])
  })

  it('returns union of three sets deduplicated', () => {
    const idx = new BitmapIndex(20)
    expect(idx.queryOr([[0, 1], [1, 2], [2, 3]]).sort((a, b) => a - b)).toEqual([0, 1, 2, 3])
  })

  it('returns empty array for empty input', () => {
    const idx = new BitmapIndex(10)
    expect(idx.queryOr([])).toEqual([])
  })

  it('returns copy of single set', () => {
    const idx = new BitmapIndex(10)
    const result = idx.queryOr([[1, 3, 5]])
    expect(result).toEqual([1, 3, 5])
  })

  it('filters out-of-range indices with multiple sets', () => {
    const idx = new BitmapIndex(5)
    expect(idx.queryOr([[0, 1, 10, 99], [2]]).sort((a, b) => a - b)).toEqual([0, 1, 2])
  })

  it('returns single set as-is without filtering', () => {
    const idx = new BitmapIndex(5)
    const result = idx.queryOr([[0, 1, 10]])
    expect(result).toEqual([0, 1, 10])
  })
})

// ── countResults ─────────────────────────────────────────────────────────────

describe('countResults', () => {
  it('returns the length of the results array', () => {
    const idx = new BitmapIndex(10)
    expect(idx.countResults([1, 2, 3])).toBe(3)
  })

  it('returns 0 for empty array', () => {
    const idx = new BitmapIndex(10)
    expect(idx.countResults([])).toBe(0)
  })
})

// ── getNumRecords ────────────────────────────────────────────────────────────

describe('getNumRecords', () => {
  it('returns the configured number of records', () => {
    expect(new BitmapIndex(42).getNumRecords()).toBe(42)
  })
})

// ── getFields ────────────────────────────────────────────────────────────────

describe('getFields', () => {
  it('returns empty array when no fields added', () => {
    expect(new BitmapIndex(10).getFields()).toEqual([])
  })

  it('returns all field names in insertion order', () => {
    const idx = new BitmapIndex(10)
    idx.addField('b', 2)
    idx.addField('a', 2)
    expect(idx.getFields()).toEqual(['b', 'a'])
  })
})

// ── getCardinality ───────────────────────────────────────────────────────────

describe('getCardinality', () => {
  it('returns the cardinality of a field', () => {
    const idx = new BitmapIndex(10)
    idx.addField('status', 5)
    expect(idx.getCardinality('status')).toBe(5)
  })

  it('throws for unknown field', () => {
    const idx = new BitmapIndex(10)
    expect(() => idx.getCardinality('nope')).toThrow(/not found/)
  })
})

// ── clear ────────────────────────────────────────────────────────────────────

describe('clear', () => {
  it('clears all bitmaps so get returns -1', () => {
    const idx = new BitmapIndex(10)
    idx.addField('f', 3)
    idx.set('f', 0, 1)
    idx.set('f', 5, 2)
    idx.clear()
    expect(idx.get('f', 0)).toBe(-1)
    expect(idx.get('f', 5)).toBe(-1)
  })

  it('clear preserves fields so set works after clear', () => {
    const idx = new BitmapIndex(10)
    idx.addField('f', 3)
    idx.set('f', 0, 2)
    idx.clear()
    idx.set('f', 0, 1)
    expect(idx.get('f', 0)).toBe(1)
  })
})

// ── getStats ─────────────────────────────────────────────────────────────────

describe('getStats', () => {
  it('returns correct stats for an empty index', () => {
    const idx = new BitmapIndex(0)
    const stats = idx.getStats()
    expect(stats.numRecords).toBe(0)
    expect(stats.fields).toEqual([])
    expect(stats.cardinalities).toEqual({})
    expect(stats.memoryUsage).toBe(0)
  })

  it('returns correct stats with fields', () => {
    const idx = new BitmapIndex(64)
    idx.addField('color', 3)
    idx.addField('size', 5)
    const stats = idx.getStats()
    expect(stats.numRecords).toBe(64)
    expect(stats.fields).toEqual(['color', 'size'])
    expect(stats.cardinalities).toEqual({ color: 3, size: 5 })
    expect(stats.memoryUsage).toBe(64)
  })

  it('calculates memory correctly for larger indices', () => {
    const idx = new BitmapIndex(100)
    idx.addField('tag', 2)
    const stats = idx.getStats()
    expect(stats.memoryUsage).toBe(32)
  })
})

// ── toJSON / fromJSON roundtrip ──────────────────────────────────────────────

describe('toJSON / fromJSON', () => {
  it('serializes an empty index', () => {
    const idx = new BitmapIndex(0)
    const json = idx.toJSON()
    expect(json.numRecords).toBe(0)
    expect(json.fields).toEqual({})
  })

  it('round-trips data through JSON', () => {
    const idx = new BitmapIndex(64)
    idx.addField('color', 3)
    idx.set('color', 0, 0)
    idx.set('color', 1, 1)
    idx.set('color', 10, 2)
    idx.set('color', 63, 0)

    const json = idx.toJSON()
    const restored = BitmapIndex.fromJSON(json)

    expect(restored.getNumRecords()).toBe(64)
    expect(restored.get('color', 0)).toBe(0)
    expect(restored.get('color', 1)).toBe(1)
    expect(restored.get('color', 10)).toBe(2)
    expect(restored.get('color', 63)).toBe(0)
  })

  it('round-trips query results match', () => {
    const idx = new BitmapIndex(50)
    idx.addField('x', 4)
    for (let i = 0; i < 50; i++) idx.set('x', i, i % 4)

    const json = idx.toJSON()
    const restored = BitmapIndex.fromJSON(json)

    expect(restored.queryEquals('x', 0).sort((a, b) => a - b)).toEqual(
      idx.queryEquals('x', 0).sort((a, b) => a - b),
    )
  })
})

// ── Integration: multi-field queries ─────────────────────────────────────────

describe('integration: combining queryEquals with set operations', () => {
  it('AND of two field queries', () => {
    const idx = new BitmapIndex(20)
    idx.addField('color', 3)
    idx.addField('size', 3)

    for (let i = 0; i < 20; i++) idx.set('color', i, i % 3)
    for (let i = 0; i < 20; i++) idx.set('size', i, (i + 1) % 3)

    const color0 = idx.queryEquals('color', 0)
    const size1 = idx.queryEquals('size', 1)
    const both = idx.queryAnd([color0, size1])
    expect(both.sort((a, b) => a - b)).toEqual([0, 3, 6, 9, 12, 15, 18])
  })

  it('OR of two field queries', () => {
    const idx = new BitmapIndex(10)
    idx.addField('a', 2)
    idx.addField('b', 2)
    idx.set('a', 0, 0)
    idx.set('a', 1, 0)
    idx.set('b', 2, 0)
    idx.set('b', 3, 0)

    const a0 = idx.queryEquals('a', 0)
    const b0 = idx.queryEquals('b', 0)
    const union = idx.queryOr([a0, b0])
    expect(union.sort((a, b) => a - b)).toEqual([0, 1, 2, 3])
  })
})

// ── Edge cases ───────────────────────────────────────────────────────────────

describe('edge cases', () => {
  it('handles record index at exact word boundary (index 32)', () => {
    const idx = new BitmapIndex(64)
    idx.addField('f', 2)
    idx.set('f', 31, 1)
    idx.set('f', 32, 0)
    expect(idx.get('f', 31)).toBe(1)
    expect(idx.get('f', 32)).toBe(0)
  })

  it('handles single-record index', () => {
    const idx = new BitmapIndex(1)
    idx.addField('f', 2)
    idx.set('f', 0, 1)
    expect(idx.get('f', 0)).toBe(1)
    expect(idx.queryEquals('f', 1)).toEqual([0])
  })

  it('handles zero-record index with field', () => {
    const idx = new BitmapIndex(0)
    idx.addField('f', 2)
    expect(idx.queryEquals('f', 0)).toEqual([])
  })

  it('queryRange with single-value range (min == max)', () => {
    const idx = new BitmapIndex(10)
    idx.addField('f', 3)
    idx.set('f', 5, 1)
    expect(idx.queryRange('f', 1, 1)).toEqual([5])
  })

  it('queryAnd with all indices present across word boundary', () => {
    const idx = new BitmapIndex(64)
    const set1 = Array.from({ length: 64 }, (_, i) => i)
    const set2 = [31, 32, 63]
    expect(idx.queryAnd([set1, set2]).sort((a, b) => a - b)).toEqual([31, 32, 63])
  })

  it('queryOr with indices spanning word boundaries', () => {
    const idx = new BitmapIndex(64)
    expect(idx.queryOr([[0, 31, 32, 63]]).sort((a, b) => a - b)).toEqual([0, 31, 32, 63])
  })

  it('get returns -1 after clear for all records', () => {
    const idx = new BitmapIndex(10)
    idx.addField('f', 2)
    for (let i = 0; i < 10; i++) idx.set('f', i, 1)
    idx.clear()
    for (let i = 0; i < 10; i++) {
      expect(idx.get('f', i)).toBe(-1)
    }
  })
})
