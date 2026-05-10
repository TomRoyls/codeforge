import { describe, it, expect, beforeEach } from 'vitest'
import { TimestampIndex, DEFAULT_TIMESTAMP_INDEX_OPTIONS } from '../../src/core/timestamp-index/timestamp-index.js'
import type { TimestampIndexOptions, TimestampIndexStatistics } from '../../src/core/timestamp-index/timestamp-index.js'

describe('TimestampIndex', () => {
  describe('constructor', () => {
    it('creates empty index with no options', () => {
      const idx = new TimestampIndex<number>()
      expect(idx.size).toBe(0)
      expect(idx.isEmpty()).toBe(true)
    })

    it('creates index with empty options', () => {
      const idx = new TimestampIndex<number>({})
      expect(idx.size).toBe(0)
    })

    it('creates index with allowOverwrite true', () => {
      const idx = new TimestampIndex<number>({ allowOverwrite: true })
      expect(idx.size).toBe(0)
    })

    it('creates index with allowOverwrite false', () => {
      const idx = new TimestampIndex<number>({ allowOverwrite: false })
      expect(idx.size).toBe(0)
    })

    it('creates index with partial options', () => {
      const opts: Partial<TimestampIndexOptions> = {}
      const idx = new TimestampIndex<string>(opts)
      expect(idx.size).toBe(0)
    })

    it('has default allowOverwrite as true', () => {
      expect(DEFAULT_TIMESTAMP_INDEX_OPTIONS.allowOverwrite).toBe(true)
    })
  })

  describe('insert', () => {
    let idx: TimestampIndex<string>

    beforeEach(() => {
      idx = new TimestampIndex<string>()
    })

    it('inserts a single entry', () => {
      idx.insert(1000, 'a')
      expect(idx.size).toBe(1)
      expect(idx.get(1000)).toBe('a')
    })

    it('inserts entries in sorted order', () => {
      idx.insert(3000, 'c')
      idx.insert(1000, 'a')
      idx.insert(2000, 'b')
      expect(idx.toArray()).toEqual(['a', 'b', 'c'])
    })

    it('overwrites existing timestamp by default', () => {
      idx.insert(1000, 'a')
      idx.insert(1000, 'b')
      expect(idx.size).toBe(1)
      expect(idx.get(1000)).toBe('b')
    })

    it('does not overwrite when allowOverwrite is false', () => {
      const noOverwrite = new TimestampIndex<string>({ allowOverwrite: false })
      noOverwrite.insert(1000, 'a')
      const result = noOverwrite.insert(1000, 'b')
      expect(result).toBe(false)
      expect(noOverwrite.get(1000)).toBe('a')
    })

    it('returns true on successful insert', () => {
      expect(idx.insert(1000, 'a')).toBe(true)
    })

    it('returns true on successful overwrite', () => {
      idx.insert(1000, 'a')
      expect(idx.insert(1000, 'b')).toBe(true)
    })

    it('increments inserts statistic', () => {
      idx.insert(1000, 'a')
      idx.insert(2000, 'b')
      expect(idx.getStatistics().inserts).toBe(2)
    })

    it('increments inserts on overwrite', () => {
      idx.insert(1000, 'a')
      idx.insert(1000, 'b')
      expect(idx.getStatistics().inserts).toBe(2)
    })

    it('inserts at the beginning', () => {
      idx.insert(2000, 'b')
      idx.insert(1000, 'a')
      expect(idx.min()).toBe(1000)
      expect(idx.max()).toBe(2000)
    })

    it('inserts at the end', () => {
      idx.insert(1000, 'a')
      idx.insert(3000, 'c')
      expect(idx.toArray()).toEqual(['a', 'c'])
    })

    it('inserts many entries maintaining order', () => {
      for (let i = 100; i >= 0; i--) {
        idx.insert(i, `v${i}`)
      }
      expect(idx.size).toBe(101)
      const arr = idx.toArray()
      for (let i = 0; i < arr.length - 1; i++) {
        expect(arr[i]).toBe(`v${i}`)
      }
    })

    it('handles negative timestamps', () => {
      idx.insert(-1000, 'neg')
      idx.insert(0, 'zero')
      idx.insert(1000, 'pos')
      expect(idx.toArray()).toEqual(['neg', 'zero', 'pos'])
    })

    it('handles floating point timestamps', () => {
      idx.insert(1.5, 'a')
      idx.insert(2.5, 'b')
      idx.insert(0.5, 'c')
      expect(idx.toArray()).toEqual(['c', 'a', 'b'])
    })

    it('handles string values', () => {
      const si = new TimestampIndex<string>()
      si.insert(1, 'hello')
      si.insert(2, 'world')
      expect(si.get(1)).toBe('hello')
    })

    it('handles object values', () => {
      const oi = new TimestampIndex<{ name: string }>()
      oi.insert(1, { name: 'test' })
      expect(oi.get(1)?.name).toBe('test')
    })

    it('handles null values', () => {
      const ni = new TimestampIndex<null>()
      ni.insert(1, null)
      expect(ni.get(1)).toBeNull()
    })

    it('handles undefined values', () => {
      const ui = new TimestampIndex<string | undefined>()
      ui.insert(1, undefined)
      expect(ui.get(1)).toBeUndefined()
    })

    it('inserts after deletion', () => {
      idx.insert(1000, 'a')
      idx.delete(1000)
      idx.insert(1000, 'b')
      expect(idx.get(1000)).toBe('b')
      expect(idx.size).toBe(1)
    })
  })

  describe('get', () => {
    let idx: TimestampIndex<string>

    beforeEach(() => {
      idx = new TimestampIndex<string>()
      idx.insert(1000, 'a')
      idx.insert(2000, 'b')
      idx.insert(3000, 'c')
    })

    it('returns value for existing timestamp', () => {
      expect(idx.get(1000)).toBe('a')
    })

    it('returns value for middle timestamp', () => {
      expect(idx.get(2000)).toBe('b')
    })

    it('returns value for last timestamp', () => {
      expect(idx.get(3000)).toBe('c')
    })

    it('returns undefined for non-existing timestamp', () => {
      expect(idx.get(1500)).toBeUndefined()
    })

    it('returns undefined for timestamp below min', () => {
      expect(idx.get(500)).toBeUndefined()
    })

    it('returns undefined for timestamp above max', () => {
      expect(idx.get(4000)).toBeUndefined()
    })

    it('returns undefined on empty index', () => {
      const empty = new TimestampIndex<string>()
      expect(empty.get(1000)).toBeUndefined()
    })

    it('increments lookups statistic', () => {
      idx.get(1000)
      idx.get(2000)
      idx.get(9999)
      expect(idx.getStatistics().lookups).toBe(3)
    })
  })

  describe('getByRange', () => {
    let idx: TimestampIndex<string>

    beforeEach(() => {
      idx = new TimestampIndex<string>()
      idx.insert(1000, 'a')
      idx.insert(2000, 'b')
      idx.insert(3000, 'c')
      idx.insert(4000, 'd')
      idx.insert(5000, 'e')
    })

    it('returns values in inclusive range', () => {
      expect(idx.getByRange(2000, 4000)).toEqual(['b', 'c', 'd'])
    })

    it('returns all values for full range', () => {
      expect(idx.getByRange(1000, 5000)).toEqual(['a', 'b', 'c', 'd', 'e'])
    })

    it('returns single value for exact match range', () => {
      expect(idx.getByRange(2000, 2000)).toEqual(['b'])
    })

    it('returns empty for range outside data', () => {
      expect(idx.getByRange(6000, 7000)).toEqual([])
    })

    it('returns empty for empty index', () => {
      const empty = new TimestampIndex<string>()
      expect(empty.getByRange(1000, 2000)).toEqual([])
    })

    it('returns values from the start', () => {
      expect(idx.getByRange(0, 3000)).toEqual(['a', 'b', 'c'])
    })

    it('returns values to the end', () => {
      expect(idx.getByRange(3000, 9999)).toEqual(['c', 'd', 'e'])
    })

    it('returns empty for inverted range', () => {
      expect(idx.getByRange(4000, 2000)).toEqual([])
    })

    it('increments rangeQueries statistic', () => {
      idx.getByRange(1000, 3000)
      expect(idx.getStatistics().rangeQueries).toBe(1)
    })

    it('returns values with partial overlap at start', () => {
      expect(idx.getByRange(500, 1500)).toEqual(['a'])
    })

    it('returns values with partial overlap at end', () => {
      expect(idx.getByRange(4500, 5500)).toEqual(['e'])
    })
  })

  describe('delete', () => {
    let idx: TimestampIndex<string>

    beforeEach(() => {
      idx = new TimestampIndex<string>()
      idx.insert(1000, 'a')
      idx.insert(2000, 'b')
      idx.insert(3000, 'c')
    })

    it('deletes existing entry', () => {
      expect(idx.delete(2000)).toBe(true)
      expect(idx.size).toBe(2)
      expect(idx.get(2000)).toBeUndefined()
    })

    it('deletes first entry', () => {
      expect(idx.delete(1000)).toBe(true)
      expect(idx.toArray()).toEqual(['b', 'c'])
    })

    it('deletes last entry', () => {
      expect(idx.delete(3000)).toBe(true)
      expect(idx.toArray()).toEqual(['a', 'b'])
    })

    it('returns false for non-existing timestamp', () => {
      expect(idx.delete(1500)).toBe(false)
    })

    it('returns false on empty index', () => {
      const empty = new TimestampIndex<string>()
      expect(empty.delete(1000)).toBe(false)
    })

    it('increments deletes statistic', () => {
      idx.delete(1000)
      idx.delete(2000)
      expect(idx.getStatistics().deletes).toBe(2)
    })

    it('does not increment deletes on failed delete', () => {
      idx.delete(9999)
      expect(idx.getStatistics().deletes).toBe(0)
    })

    it('maintains order after deletion', () => {
      idx.delete(2000)
      expect(idx.toArray()).toEqual(['a', 'c'])
    })
  })

  describe('deleteByRange', () => {
    let idx: TimestampIndex<string>

    beforeEach(() => {
      idx = new TimestampIndex<string>()
      idx.insert(1000, 'a')
      idx.insert(2000, 'b')
      idx.insert(3000, 'c')
      idx.insert(4000, 'd')
      idx.insert(5000, 'e')
    })

    it('deletes entries in range', () => {
      const count = idx.deleteByRange(2000, 4000)
      expect(count).toBe(3)
      expect(idx.toArray()).toEqual(['a', 'e'])
    })

    it('deletes single entry', () => {
      const count = idx.deleteByRange(2000, 2000)
      expect(count).toBe(1)
      expect(idx.toArray()).toEqual(['a', 'c', 'd', 'e'])
    })

    it('returns 0 for empty range', () => {
      const count = idx.deleteByRange(6000, 7000)
      expect(count).toBe(0)
      expect(idx.size).toBe(5)
    })

    it('returns 0 for inverted range', () => {
      const count = idx.deleteByRange(4000, 2000)
      expect(count).toBe(0)
    })

    it('deletes all entries', () => {
      idx.deleteByRange(1000, 5000)
      expect(idx.isEmpty()).toBe(true)
    })

    it('deletes from start', () => {
      const count = idx.deleteByRange(0, 2000)
      expect(count).toBe(2)
      expect(idx.toArray()).toEqual(['c', 'd', 'e'])
    })

    it('deletes to end', () => {
      const count = idx.deleteByRange(3000, 9999)
      expect(count).toBe(3)
      expect(idx.toArray()).toEqual(['a', 'b'])
    })

    it('increments deletes and rangeQueries stats', () => {
      idx.deleteByRange(1000, 3000)
      const stats = idx.getStatistics()
      expect(stats.deletes).toBe(3)
      expect(stats.rangeQueries).toBe(1)
    })
  })

  describe('expire', () => {
    let idx: TimestampIndex<string>

    beforeEach(() => {
      idx = new TimestampIndex<string>()
      idx.insert(1000, 'a')
      idx.insert(2000, 'b')
      idx.insert(3000, 'c')
      idx.insert(4000, 'd')
    })

    it('expires entries older than threshold', () => {
      const count = idx.expire(2500)
      expect(count).toBe(2)
      expect(idx.toArray()).toEqual(['c', 'd'])
    })

    it('expires all entries with high threshold', () => {
      const count = idx.expire(5000)
      expect(count).toBe(4)
      expect(idx.isEmpty()).toBe(true)
    })

    it('expires no entries with low threshold', () => {
      const count = idx.expire(500)
      expect(count).toBe(0)
      expect(idx.size).toBe(4)
    })

    it('expires entries up to exact timestamp', () => {
      const count = idx.expire(2000)
      expect(count).toBe(1)
      expect(idx.toArray()).toEqual(['b', 'c', 'd'])
    })

    it('increments expirations statistic', () => {
      idx.expire(3000)
      expect(idx.getStatistics().expirations).toBe(2)
    })

    it('increments deletes statistic', () => {
      idx.expire(2000)
      expect(idx.getStatistics().deletes).toBe(1)
    })

    it('works on empty index', () => {
      const empty = new TimestampIndex<string>()
      expect(empty.expire(1000)).toBe(0)
    })

    it('can expire all then insert new', () => {
      idx.expire(5000)
      idx.insert(6000, 'f')
      expect(idx.size).toBe(1)
      expect(idx.get(6000)).toBe('f')
    })
  })

  describe('has', () => {
    let idx: TimestampIndex<string>

    beforeEach(() => {
      idx = new TimestampIndex<string>()
      idx.insert(1000, 'a')
      idx.insert(2000, 'b')
    })

    it('returns true for existing timestamp', () => {
      expect(idx.has(1000)).toBe(true)
    })

    it('returns true for second entry', () => {
      expect(idx.has(2000)).toBe(true)
    })

    it('returns false for non-existing timestamp', () => {
      expect(idx.has(1500)).toBe(false)
    })

    it('returns false on empty index', () => {
      const empty = new TimestampIndex<string>()
      expect(empty.has(1000)).toBe(false)
    })

    it('increments lookups statistic', () => {
      idx.has(1000)
      idx.has(9999)
      expect(idx.getStatistics().lookups).toBe(2)
    })

    it('returns false after deletion', () => {
      idx.delete(1000)
      expect(idx.has(1000)).toBe(false)
    })
  })

  describe('size', () => {
    it('returns 0 for new index', () => {
      const idx = new TimestampIndex<number>()
      expect(idx.size).toBe(0)
    })

    it('returns count after inserts', () => {
      const idx = new TimestampIndex<number>()
      idx.insert(1, 10)
      idx.insert(2, 20)
      idx.insert(3, 30)
      expect(idx.size).toBe(3)
    })

    it('does not increment on overwrite', () => {
      const idx = new TimestampIndex<number>()
      idx.insert(1, 10)
      idx.insert(1, 20)
      expect(idx.size).toBe(1)
    })

    it('decreases after delete', () => {
      const idx = new TimestampIndex<number>()
      idx.insert(1, 10)
      idx.insert(2, 20)
      idx.delete(1)
      expect(idx.size).toBe(1)
    })

    it('returns 0 after clear', () => {
      const idx = new TimestampIndex<number>()
      idx.insert(1, 10)
      idx.clear()
      expect(idx.size).toBe(0)
    })
  })

  describe('isEmpty', () => {
    it('returns true for new index', () => {
      const idx = new TimestampIndex<number>()
      expect(idx.isEmpty()).toBe(true)
    })

    it('returns false after insert', () => {
      const idx = new TimestampIndex<number>()
      idx.insert(1, 10)
      expect(idx.isEmpty()).toBe(false)
    })

    it('returns true after deleting all', () => {
      const idx = new TimestampIndex<number>()
      idx.insert(1, 10)
      idx.delete(1)
      expect(idx.isEmpty()).toBe(true)
    })

    it('returns true after clear', () => {
      const idx = new TimestampIndex<number>()
      idx.insert(1, 10)
      idx.insert(2, 20)
      idx.clear()
      expect(idx.isEmpty()).toBe(true)
    })

    it('returns true after expiring all', () => {
      const idx = new TimestampIndex<number>()
      idx.insert(1, 10)
      idx.expire(100)
      expect(idx.isEmpty()).toBe(true)
    })
  })

  describe('clear', () => {
    it('clears empty index without error', () => {
      const idx = new TimestampIndex<number>()
      idx.clear()
      expect(idx.size).toBe(0)
    })

    it('clears all entries', () => {
      const idx = new TimestampIndex<number>()
      idx.insert(1, 10)
      idx.insert(2, 20)
      idx.clear()
      expect(idx.size).toBe(0)
      expect(idx.isEmpty()).toBe(true)
    })

    it('allows inserts after clear', () => {
      const idx = new TimestampIndex<number>()
      idx.insert(1, 10)
      idx.clear()
      idx.insert(2, 20)
      expect(idx.size).toBe(1)
      expect(idx.get(2)).toBe(20)
    })

    it('does not reset statistics', () => {
      const idx = new TimestampIndex<number>()
      idx.insert(1, 10)
      idx.clear()
      expect(idx.getStatistics().inserts).toBe(1)
    })
  })

  describe('toArray', () => {
    it('returns empty array for empty index', () => {
      const idx = new TimestampIndex<number>()
      expect(idx.toArray()).toEqual([])
    })

    it('returns all values in order', () => {
      const idx = new TimestampIndex<string>()
      idx.insert(3000, 'c')
      idx.insert(1000, 'a')
      idx.insert(2000, 'b')
      expect(idx.toArray()).toEqual(['a', 'b', 'c'])
    })

    it('returns copy not internal reference', () => {
      const idx = new TimestampIndex<number>()
      idx.insert(1, 10)
      const arr = idx.toArray()
      arr.push(999)
      expect(idx.size).toBe(1)
    })

    it('returns single element', () => {
      const idx = new TimestampIndex<number>()
      idx.insert(1, 42)
      expect(idx.toArray()).toEqual([42])
    })
  })

  describe('forEach', () => {
    it('iterates over all entries', () => {
      const idx = new TimestampIndex<string>()
      idx.insert(1000, 'a')
      idx.insert(2000, 'b')
      idx.insert(3000, 'c')
      const results: [string, number][] = []
      idx.forEach((v, t) => results.push([v, t]))
      expect(results).toEqual([
        ['a', 1000],
        ['b', 2000],
        ['c', 3000],
      ])
    })

    it('does not call callback on empty index', () => {
      const idx = new TimestampIndex<number>()
      let called = false
      idx.forEach(() => {
        called = true
      })
      expect(called).toBe(false)
    })

    it('iterates in timestamp order', () => {
      const idx = new TimestampIndex<number>()
      idx.insert(3000, 3)
      idx.insert(1000, 1)
      idx.insert(2000, 2)
      const values: number[] = []
      idx.forEach((v) => values.push(v))
      expect(values).toEqual([1, 2, 3])
    })

    it('provides correct timestamps', () => {
      const idx = new TimestampIndex<string>()
      idx.insert(42, 'x')
      idx.insert(99, 'y')
      const timestamps: number[] = []
      idx.forEach((_v, t) => timestamps.push(t))
      expect(timestamps).toEqual([42, 99])
    })
  })

  describe('min', () => {
    it('returns undefined on empty index', () => {
      const idx = new TimestampIndex<number>()
      expect(idx.min()).toBeUndefined()
    })

    it('returns single timestamp', () => {
      const idx = new TimestampIndex<number>()
      idx.insert(1000, 10)
      expect(idx.min()).toBe(1000)
    })

    it('returns minimum timestamp', () => {
      const idx = new TimestampIndex<number>()
      idx.insert(3000, 30)
      idx.insert(1000, 10)
      idx.insert(2000, 20)
      expect(idx.min()).toBe(1000)
    })

    it('returns negative timestamp', () => {
      const idx = new TimestampIndex<number>()
      idx.insert(-100, 1)
      idx.insert(100, 2)
      expect(idx.min()).toBe(-100)
    })

    it('updates after deletion', () => {
      const idx = new TimestampIndex<number>()
      idx.insert(1000, 10)
      idx.insert(2000, 20)
      idx.delete(1000)
      expect(idx.min()).toBe(2000)
    })

    it('returns undefined after clear', () => {
      const idx = new TimestampIndex<number>()
      idx.insert(1000, 10)
      idx.clear()
      expect(idx.min()).toBeUndefined()
    })
  })

  describe('max', () => {
    it('returns undefined on empty index', () => {
      const idx = new TimestampIndex<number>()
      expect(idx.max()).toBeUndefined()
    })

    it('returns single timestamp', () => {
      const idx = new TimestampIndex<number>()
      idx.insert(1000, 10)
      expect(idx.max()).toBe(1000)
    })

    it('returns maximum timestamp', () => {
      const idx = new TimestampIndex<number>()
      idx.insert(1000, 10)
      idx.insert(3000, 30)
      idx.insert(2000, 20)
      expect(idx.max()).toBe(3000)
    })

    it('updates after deletion', () => {
      const idx = new TimestampIndex<number>()
      idx.insert(1000, 10)
      idx.insert(2000, 20)
      idx.delete(2000)
      expect(idx.max()).toBe(1000)
    })

    it('returns undefined after clear', () => {
      const idx = new TimestampIndex<number>()
      idx.insert(1000, 10)
      idx.clear()
      expect(idx.max()).toBeUndefined()
    })
  })

  describe('floor', () => {
    let idx: TimestampIndex<string>

    beforeEach(() => {
      idx = new TimestampIndex<string>()
      idx.insert(1000, 'a')
      idx.insert(2000, 'b')
      idx.insert(3000, 'c')
    })

    it('returns exact match', () => {
      expect(idx.floor(2000)).toBe('b')
    })

    it('returns previous entry', () => {
      expect(idx.floor(2500)).toBe('b')
    })

    it('returns undefined when below all', () => {
      expect(idx.floor(500)).toBeUndefined()
    })

    it('returns last entry for large timestamp', () => {
      expect(idx.floor(9999)).toBe('c')
    })

    it('returns undefined on empty index', () => {
      const empty = new TimestampIndex<string>()
      expect(empty.floor(1000)).toBeUndefined()
    })

    it('returns first entry for timestamp between first and second', () => {
      expect(idx.floor(1500)).toBe('a')
    })

    it('increments lookups statistic', () => {
      idx.floor(2000)
      expect(idx.getStatistics().lookups).toBe(1)
    })
  })

  describe('ceil', () => {
    let idx: TimestampIndex<string>

    beforeEach(() => {
      idx = new TimestampIndex<string>()
      idx.insert(1000, 'a')
      idx.insert(2000, 'b')
      idx.insert(3000, 'c')
    })

    it('returns exact match', () => {
      expect(idx.ceil(2000)).toBe('b')
    })

    it('returns next entry', () => {
      expect(idx.ceil(1500)).toBe('b')
    })

    it('returns undefined when above all', () => {
      expect(idx.ceil(9999)).toBeUndefined()
    })

    it('returns first entry for low timestamp', () => {
      expect(idx.ceil(500)).toBe('a')
    })

    it('returns undefined on empty index', () => {
      const empty = new TimestampIndex<string>()
      expect(empty.ceil(1000)).toBeUndefined()
    })

    it('returns last entry for timestamp at end', () => {
      expect(idx.ceil(3000)).toBe('c')
    })

    it('increments lookups statistic', () => {
      idx.ceil(2000)
      expect(idx.getStatistics().lookups).toBe(1)
    })
  })

  describe('countInRange', () => {
    let idx: TimestampIndex<string>

    beforeEach(() => {
      idx = new TimestampIndex<string>()
      idx.insert(1000, 'a')
      idx.insert(2000, 'b')
      idx.insert(3000, 'c')
      idx.insert(4000, 'd')
      idx.insert(5000, 'e')
    })

    it('counts entries in range', () => {
      expect(idx.countInRange(2000, 4000)).toBe(3)
    })

    it('counts all entries', () => {
      expect(idx.countInRange(1000, 5000)).toBe(5)
    })

    it('counts single entry', () => {
      expect(idx.countInRange(2000, 2000)).toBe(1)
    })

    it('returns 0 for empty range', () => {
      expect(idx.countInRange(6000, 7000)).toBe(0)
    })

    it('returns 0 for inverted range', () => {
      expect(idx.countInRange(4000, 2000)).toBe(0)
    })

    it('returns 0 for empty index', () => {
      const empty = new TimestampIndex<string>()
      expect(empty.countInRange(1000, 2000)).toBe(0)
    })

    it('increments rangeQueries statistic', () => {
      idx.countInRange(1000, 3000)
      expect(idx.getStatistics().rangeQueries).toBe(1)
    })

    it('counts partial range at start', () => {
      expect(idx.countInRange(0, 1500)).toBe(1)
    })

    it('counts partial range at end', () => {
      expect(idx.countInRange(4500, 9999)).toBe(1)
    })
  })

  describe('getStatistics', () => {
    it('returns initial statistics', () => {
      const idx = new TimestampIndex<number>()
      const stats = idx.getStatistics()
      expect(stats).toEqual({
        inserts: 0,
        deletes: 0,
        rangeQueries: 0,
        expirations: 0,
        lookups: 0,
      })
    })

    it('tracks inserts', () => {
      const idx = new TimestampIndex<number>()
      idx.insert(1, 10)
      idx.insert(2, 20)
      expect(idx.getStatistics().inserts).toBe(2)
    })

    it('tracks deletes', () => {
      const idx = new TimestampIndex<number>()
      idx.insert(1, 10)
      idx.delete(1)
      expect(idx.getStatistics().deletes).toBe(1)
    })

    it('tracks rangeQueries from getByRange', () => {
      const idx = new TimestampIndex<number>()
      idx.insert(1, 10)
      idx.getByRange(0, 10)
      expect(idx.getStatistics().rangeQueries).toBe(1)
    })

    it('tracks rangeQueries from countInRange', () => {
      const idx = new TimestampIndex<number>()
      idx.insert(1, 10)
      idx.countInRange(0, 10)
      expect(idx.getStatistics().rangeQueries).toBe(1)
    })

    it('tracks rangeQueries from deleteByRange', () => {
      const idx = new TimestampIndex<number>()
      idx.insert(1, 10)
      idx.deleteByRange(0, 10)
      expect(idx.getStatistics().rangeQueries).toBe(1)
    })

    it('tracks expirations', () => {
      const idx = new TimestampIndex<number>()
      idx.insert(1, 10)
      idx.insert(2, 20)
      idx.expire(2)
      expect(idx.getStatistics().expirations).toBe(1)
    })

    it('tracks lookups from get', () => {
      const idx = new TimestampIndex<number>()
      idx.insert(1, 10)
      idx.get(1)
      expect(idx.getStatistics().lookups).toBe(1)
    })

    it('tracks lookups from has', () => {
      const idx = new TimestampIndex<number>()
      idx.insert(1, 10)
      idx.has(1)
      expect(idx.getStatistics().lookups).toBe(1)
    })

    it('tracks lookups from floor', () => {
      const idx = new TimestampIndex<number>()
      idx.insert(1, 10)
      idx.floor(1)
      expect(idx.getStatistics().lookups).toBe(1)
    })

    it('tracks lookups from ceil', () => {
      const idx = new TimestampIndex<number>()
      idx.insert(1, 10)
      idx.ceil(1)
      expect(idx.getStatistics().lookups).toBe(1)
    })

    it('returns a copy', () => {
      const idx = new TimestampIndex<number>()
      const stats1 = idx.getStatistics()
      stats1.inserts = 999
      const stats2 = idx.getStatistics()
      expect(stats2.inserts).toBe(0)
    })

    it('correctly types statistics as TimestampIndexStatistics', () => {
      const idx = new TimestampIndex<number>()
      const stats: TimestampIndexStatistics = idx.getStatistics()
      expect(typeof stats.inserts).toBe('number')
      expect(typeof stats.deletes).toBe('number')
      expect(typeof stats.rangeQueries).toBe('number')
      expect(typeof stats.expirations).toBe('number')
      expect(typeof stats.lookups).toBe('number')
    })
  })

  describe('Symbol.iterator', () => {
    it('iterates over empty index', () => {
      const idx = new TimestampIndex<number>()
      const result = [...idx]
      expect(result).toEqual([])
    })

    it('iterates over single entry', () => {
      const idx = new TimestampIndex<number>()
      idx.insert(1, 42)
      expect([...idx]).toEqual([42])
    })

    it('iterates in timestamp order', () => {
      const idx = new TimestampIndex<string>()
      idx.insert(3000, 'c')
      idx.insert(1000, 'a')
      idx.insert(2000, 'b')
      expect([...idx]).toEqual(['a', 'b', 'c'])
    })

    it('works with for...of', () => {
      const idx = new TimestampIndex<number>()
      idx.insert(1, 10)
      idx.insert(2, 20)
      idx.insert(3, 30)
      const values: number[] = []
      for (const v of idx) {
        values.push(v)
      }
      expect(values).toEqual([10, 20, 30])
    })

    it('works with Array.from', () => {
      const idx = new TimestampIndex<number>()
      idx.insert(1, 10)
      idx.insert(2, 20)
      expect(Array.from(idx)).toEqual([10, 20])
    })

    it('works with destructuring', () => {
      const idx = new TimestampIndex<number>()
      idx.insert(1, 10)
      idx.insert(2, 20)
      idx.insert(3, 30)
      const [first, second, third] = idx
      expect(first).toBe(10)
      expect(second).toBe(20)
      expect(third).toBe(30)
    })
  })

  describe('integration', () => {
    it('supports insert-get-delete lifecycle', () => {
      const idx = new TimestampIndex<string>()
      idx.insert(1000, 'a')
      expect(idx.get(1000)).toBe('a')
      idx.delete(1000)
      expect(idx.get(1000)).toBeUndefined()
    })

    it('supports range operations after many inserts', () => {
      const idx = new TimestampIndex<number>()
      for (let i = 0; i < 100; i++) {
        idx.insert(i * 100, i)
      }
      expect(idx.size).toBe(100)
      expect(idx.getByRange(0, 9900).length).toBe(100)
      expect(idx.getByRange(1000, 2000)).toEqual([10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20])
    })

    it('supports expire after insert', () => {
      const idx = new TimestampIndex<string>()
      for (let i = 0; i < 10; i++) {
        idx.insert(i * 1000, `v${i}`)
      }
      const expired = idx.expire(5000)
      expect(expired).toBe(5)
      expect(idx.size).toBe(5)
      expect(idx.min()).toBe(5000)
    })

    it('supports deleteByRange preserving order', () => {
      const idx = new TimestampIndex<string>()
      for (let i = 0; i < 10; i++) {
        idx.insert(i, `v${i}`)
      }
      idx.deleteByRange(3, 7)
      expect(idx.toArray()).toEqual(['v0', 'v1', 'v2', 'v8', 'v9'])
    })

    it('supports mixed operations', () => {
      const idx = new TimestampIndex<number>()
      idx.insert(1, 10)
      idx.insert(2, 20)
      idx.insert(3, 30)
      idx.delete(2)
      idx.insert(4, 40)
      idx.insert(0, 5)
      expect(idx.toArray()).toEqual([5, 10, 30, 40])
      expect(idx.size).toBe(4)
    })

    it('floor and ceil work together', () => {
      const idx = new TimestampIndex<number>()
      idx.insert(100, 1)
      idx.insert(200, 2)
      idx.insert(300, 3)
      expect(idx.floor(150)).toBe(1)
      expect(idx.ceil(150)).toBe(2)
    })

    it('supports TTL-like pattern', () => {
      const idx = new TimestampIndex<string>()
      const now = Date.now()
      idx.insert(now - 3000, 'old1')
      idx.insert(now - 2000, 'old2')
      idx.insert(now - 1000, 'recent')
      idx.insert(now, 'current')
      const expired = idx.expire(now - 1500)
      expect(expired).toBe(2)
      expect(idx.size).toBe(2)
      expect(idx.toArray()).toEqual(['recent', 'current'])
    })

    it('handles large number of entries', () => {
      const idx = new TimestampIndex<number>()
      for (let i = 0; i < 1000; i++) {
        idx.insert(i, i * 10)
      }
      expect(idx.size).toBe(1000)
      expect(idx.get(500)).toBe(5000)
      expect(idx.getByRange(400, 600).length).toBe(201)
      expect(idx.floor(550)).toBe(5500)
      expect(idx.ceil(550)).toBe(5500)
    })

    it('statistics accumulate correctly', () => {
      const idx = new TimestampIndex<number>()
      idx.insert(1, 10)
      idx.insert(2, 20)
      idx.get(1)
      idx.has(2)
      idx.floor(1)
      idx.ceil(2)
      idx.getByRange(0, 10)
      idx.countInRange(0, 10)
      idx.deleteByRange(0, 10)
      const stats = idx.getStatistics()
      expect(stats.inserts).toBe(2)
      expect(stats.lookups).toBe(4)
      expect(stats.rangeQueries).toBe(3)
    })

    it('handles overwrite with statistics', () => {
      const idx = new TimestampIndex<number>()
      idx.insert(1, 10)
      idx.insert(1, 20)
      const stats = idx.getStatistics()
      expect(stats.inserts).toBe(2)
      expect(idx.size).toBe(1)
      expect(idx.get(1)).toBe(20)
    })

    it('forEach after mixed operations', () => {
      const idx = new TimestampIndex<number>()
      idx.insert(5, 50)
      idx.insert(1, 10)
      idx.insert(3, 30)
      idx.insert(2, 20)
      idx.delete(3)
      const values: number[] = []
      idx.forEach((v) => values.push(v))
      expect(values).toEqual([10, 20, 50])
    })

    it('iterator reflects current state', () => {
      const idx = new TimestampIndex<number>()
      idx.insert(1, 10)
      idx.insert(2, 20)
      idx.insert(3, 30)
      idx.delete(2)
      expect([...idx]).toEqual([10, 30])
    })
  })
})
