import { describe, it, expect } from 'vitest'
import { StreamingQuantile } from '../../src/core/streaming-quantile/index.js'

describe('StreamingQuantile', () => {
  describe('constructor', () => {
    it('creates instance with default options', () => {
      const sq = new StreamingQuantile()
      expect(sq.count).toBe(0)
      expect(sq.error).toBe(0.01)
      expect(sq.isEmpty()).toBe(true)
    })

    it('creates instance with custom error', () => {
      const sq = new StreamingQuantile({ error: 0.05 })
      expect(sq.error).toBe(0.05)
    })

    it('creates instance with custom comparator', () => {
      const sq = new StreamingQuantile<string>({
        comparator: (a, b) => a.localeCompare(b),
      })
      sq.insert('banana')
      sq.insert('apple')
      expect(sq.min()).toBe('apple')
      expect(sq.max()).toBe('banana')
    })

    it('creates instance with both error and comparator', () => {
      const sq = new StreamingQuantile<number>({
        error: 0.001,
        comparator: (a, b) => a - b,
      })
      expect(sq.error).toBe(0.001)
    })

    it('uses default comparator for numbers', () => {
      const sq = new StreamingQuantile<number>()
      sq.insert(5)
      sq.insert(3)
      sq.insert(7)
      expect(sq.min()).toBe(3)
      expect(sq.max()).toBe(7)
    })
  })

  describe('insert', () => {
    it('inserts a single item', () => {
      const sq = new StreamingQuantile<number>()
      sq.insert(42)
      expect(sq.count).toBe(1)
      expect(sq.isEmpty()).toBe(false)
    })

    it('inserts multiple items', () => {
      const sq = new StreamingQuantile<number>()
      for (let i = 0; i < 100; i++) {
        sq.insert(i)
      }
      expect(sq.count).toBe(100)
    })

    it('inserts items in random order', () => {
      const sq = new StreamingQuantile<number>()
      const items = [5, 2, 8, 1, 9, 3, 7, 4, 6, 0]
      for (const item of items) {
        sq.insert(item)
      }
      expect(sq.count).toBe(10)
      expect(sq.min()).toBe(0)
      expect(sq.max()).toBe(9)
    })

    it('handles duplicate values', () => {
      const sq = new StreamingQuantile<number>()
      sq.insert(5)
      sq.insert(5)
      sq.insert(5)
      expect(sq.count).toBe(3)
      expect(sq.min()).toBe(5)
      expect(sq.max()).toBe(5)
    })

    it('handles negative numbers', () => {
      const sq = new StreamingQuantile<number>()
      sq.insert(-10)
      sq.insert(-5)
      sq.insert(0)
      sq.insert(5)
      sq.insert(10)
      expect(sq.min()).toBe(-10)
      expect(sq.max()).toBe(10)
    })

    it('handles floating point numbers', () => {
      const sq = new StreamingQuantile<number>()
      sq.insert(1.5)
      sq.insert(2.7)
      sq.insert(0.3)
      expect(sq.min()).toBe(0.3)
      expect(sq.max()).toBe(2.7)
    })

    it('handles string values', () => {
      const sq = new StreamingQuantile<string>()
      sq.insert('cherry')
      sq.insert('apple')
      sq.insert('banana')
      expect(sq.min()).toBe('apple')
      expect(sq.max()).toBe('cherry')
    })

    it('handles inserting values that become new minimum', () => {
      const sq = new StreamingQuantile<number>()
      sq.insert(10)
      sq.insert(5)
      sq.insert(1)
      expect(sq.min()).toBe(1)
    })

    it('handles inserting values that become new maximum', () => {
      const sq = new StreamingQuantile<number>()
      sq.insert(1)
      sq.insert(5)
      sq.insert(10)
      expect(sq.max()).toBe(10)
    })
  })

  describe('query', () => {
    it('throws on empty stream', () => {
      const sq = new StreamingQuantile<number>()
      expect(() => sq.query(0.5)).toThrow('Cannot query empty stream')
    })

    it('returns single item for any quantile with one element', () => {
      const sq = new StreamingQuantile<number>()
      sq.insert(42)
      expect(sq.query(0)).toBe(42)
      expect(sq.query(0.5)).toBe(42)
      expect(sq.query(1)).toBe(42)
    })

    it('returns min for quantile 0', () => {
      const sq = new StreamingQuantile<number>()
      for (let i = 0; i < 100; i++) sq.insert(i)
      expect(sq.query(0)).toBe(0)
    })

    it('returns max for quantile 1', () => {
      const sq = new StreamingQuantile<number>()
      for (let i = 0; i < 100; i++) sq.insert(i)
      expect(sq.query(1)).toBe(99)
    })

    it('approximates median', () => {
      const sq = new StreamingQuantile<number>()
      for (let i = 0; i < 1000; i++) sq.insert(i)
      const median = sq.query(0.5)
      expect(median).toBeGreaterThanOrEqual(450)
      expect(median).toBeLessThanOrEqual(550)
    })

    it('approximates first quartile', () => {
      const sq = new StreamingQuantile<number>()
      for (let i = 0; i < 1000; i++) sq.insert(i)
      const q1 = sq.query(0.25)
      expect(q1).toBeGreaterThanOrEqual(200)
      expect(q1).toBeLessThanOrEqual(300)
    })

    it('approximates third quartile', () => {
      const sq = new StreamingQuantile<number>()
      for (let i = 0; i < 1000; i++) sq.insert(i)
      const q3 = sq.query(0.75)
      expect(q3).toBeGreaterThanOrEqual(700)
      expect(q3).toBeLessThanOrEqual(800)
    })

    it('approximates 90th percentile', () => {
      const sq = new StreamingQuantile<number>()
      for (let i = 0; i < 1000; i++) sq.insert(i)
      const p90 = sq.query(0.9)
      expect(p90).toBeGreaterThanOrEqual(870)
      expect(p90).toBeLessThanOrEqual(930)
    })

    it('approximates 10th percentile', () => {
      const sq = new StreamingQuantile<number>()
      for (let i = 0; i < 1000; i++) sq.insert(i)
      const p10 = sq.query(0.1)
      expect(p10).toBeGreaterThanOrEqual(70)
      expect(p10).toBeLessThanOrEqual(130)
    })

    it('handles two elements', () => {
      const sq = new StreamingQuantile<number>()
      sq.insert(1)
      sq.insert(2)
      expect(sq.query(0)).toBe(1)
      expect(sq.query(1)).toBe(2)
    })

    it('handles three elements', () => {
      const sq = new StreamingQuantile<number>()
      sq.insert(1)
      sq.insert(2)
      sq.insert(3)
      const median = sq.query(0.5)
      expect(median).toBeGreaterThanOrEqual(1)
      expect(median).toBeLessThanOrEqual(3)
    })

    it('works with reverse-sorted input', () => {
      const sq = new StreamingQuantile<number>()
      for (let i = 999; i >= 0; i--) sq.insert(i)
      const median = sq.query(0.5)
      expect(median).toBeGreaterThanOrEqual(450)
      expect(median).toBeLessThanOrEqual(550)
    })

    it('works with pre-sorted input', () => {
      const sq = new StreamingQuantile<number>()
      for (let i = 0; i < 1000; i++) sq.insert(i)
      const median = sq.query(0.5)
      expect(median).toBeGreaterThanOrEqual(450)
      expect(median).toBeLessThanOrEqual(550)
    })

    it('handles all same values', () => {
      const sq = new StreamingQuantile<number>()
      for (let i = 0; i < 100; i++) sq.insert(42)
      expect(sq.query(0)).toBe(42)
      expect(sq.query(0.5)).toBe(42)
      expect(sq.query(1)).toBe(42)
    })

    it('handles negative quantile by returning min', () => {
      const sq = new StreamingQuantile<number>()
      for (let i = 0; i < 10; i++) sq.insert(i)
      expect(sq.query(-0.5)).toBe(0)
    })

    it('handles quantile > 1 by returning max', () => {
      const sq = new StreamingQuantile<number>()
      for (let i = 0; i < 10; i++) sq.insert(i)
      expect(sq.query(1.5)).toBe(9)
    })
  })

  describe('queryMultiple', () => {
    it('returns empty array for empty input', () => {
      const sq = new StreamingQuantile<number>()
      for (let i = 0; i < 100; i++) sq.insert(i)
      expect(sq.queryMultiple([])).toEqual([])
    })

    it('queries multiple quantiles', () => {
      const sq = new StreamingQuantile<number>()
      for (let i = 0; i < 1000; i++) sq.insert(i)
      const [q0, q25, q50, q75, q100] = sq.queryMultiple([
        0, 0.25, 0.5, 0.75, 1,
      ])
      expect(q0).toBe(0)
      expect(q25).toBeGreaterThanOrEqual(200)
      expect(q50).toBeGreaterThanOrEqual(450)
      expect(q75).toBeGreaterThanOrEqual(700)
      expect(q100).toBe(999)
    })

    it('queries same quantile twice', () => {
      const sq = new StreamingQuantile<number>()
      for (let i = 0; i < 100; i++) sq.insert(i)
      const [m1, m2] = sq.queryMultiple([0.5, 0.5])
      expect(m1).toBe(m2)
    })

    it('throws if stream is empty', () => {
      const sq = new StreamingQuantile<number>()
      expect(() => sq.queryMultiple([0.5])).toThrow('Cannot query empty stream')
    })
  })

  describe('count', () => {
    it('returns 0 for new instance', () => {
      const sq = new StreamingQuantile<number>()
      expect(sq.count).toBe(0)
    })

    it('returns correct count after inserts', () => {
      const sq = new StreamingQuantile<number>()
      for (let i = 0; i < 50; i++) sq.insert(i)
      expect(sq.count).toBe(50)
    })

    it('returns 0 after clear', () => {
      const sq = new StreamingQuantile<number>()
      sq.insert(1)
      sq.insert(2)
      sq.clear()
      expect(sq.count).toBe(0)
    })
  })

  describe('error', () => {
    it('returns configured error', () => {
      const sq = new StreamingQuantile<number>({ error: 0.05 })
      expect(sq.error).toBe(0.05)
    })

    it('returns default error when not specified', () => {
      const sq = new StreamingQuantile<number>()
      expect(sq.error).toBe(0.01)
    })
  })

  describe('isEmpty', () => {
    it('returns true for new instance', () => {
      const sq = new StreamingQuantile<number>()
      expect(sq.isEmpty()).toBe(true)
    })

    it('returns false after insert', () => {
      const sq = new StreamingQuantile<number>()
      sq.insert(1)
      expect(sq.isEmpty()).toBe(false)
    })

    it('returns true after clear', () => {
      const sq = new StreamingQuantile<number>()
      sq.insert(1)
      sq.clear()
      expect(sq.isEmpty()).toBe(true)
    })
  })

  describe('clear', () => {
    it('resets the stream', () => {
      const sq = new StreamingQuantile<number>()
      for (let i = 0; i < 100; i++) sq.insert(i)
      sq.clear()
      expect(sq.count).toBe(0)
      expect(sq.isEmpty()).toBe(true)
    })

    it('allows inserts after clear', () => {
      const sq = new StreamingQuantile<number>()
      sq.insert(1)
      sq.clear()
      sq.insert(2)
      expect(sq.count).toBe(1)
      expect(sq.query(0.5)).toBe(2)
    })

    it('throws on min/max after clear', () => {
      const sq = new StreamingQuantile<number>()
      sq.insert(1)
      sq.clear()
      expect(() => sq.min()).toThrow('Cannot get min of empty stream')
      expect(() => sq.max()).toThrow('Cannot get max of empty stream')
    })

    it('throws on mean after clear', () => {
      const sq = new StreamingQuantile<number>()
      sq.insert(1)
      sq.clear()
      expect(() => sq.mean()).toThrow('Cannot get mean of empty stream')
    })

    it('throws on query after clear', () => {
      const sq = new StreamingQuantile<number>()
      sq.insert(1)
      sq.clear()
      expect(() => sq.query(0.5)).toThrow('Cannot query empty stream')
    })
  })

  describe('min', () => {
    it('throws on empty stream', () => {
      const sq = new StreamingQuantile<number>()
      expect(() => sq.min()).toThrow('Cannot get min of empty stream')
    })

    it('returns the minimum value', () => {
      const sq = new StreamingQuantile<number>()
      sq.insert(5)
      sq.insert(3)
      sq.insert(8)
      sq.insert(1)
      sq.insert(9)
      expect(sq.min()).toBe(1)
    })

    it('returns value for single item', () => {
      const sq = new StreamingQuantile<number>()
      sq.insert(42)
      expect(sq.min()).toBe(42)
    })

    it('handles negative numbers', () => {
      const sq = new StreamingQuantile<number>()
      sq.insert(5)
      sq.insert(-3)
      sq.insert(8)
      expect(sq.min()).toBe(-3)
    })
  })

  describe('max', () => {
    it('throws on empty stream', () => {
      const sq = new StreamingQuantile<number>()
      expect(() => sq.max()).toThrow('Cannot get max of empty stream')
    })

    it('returns the maximum value', () => {
      const sq = new StreamingQuantile<number>()
      sq.insert(5)
      sq.insert(3)
      sq.insert(8)
      sq.insert(1)
      sq.insert(9)
      expect(sq.max()).toBe(9)
    })

    it('returns value for single item', () => {
      const sq = new StreamingQuantile<number>()
      sq.insert(42)
      expect(sq.max()).toBe(42)
    })

    it('handles negative numbers', () => {
      const sq = new StreamingQuantile<number>()
      sq.insert(-5)
      sq.insert(-3)
      sq.insert(-8)
      expect(sq.max()).toBe(-3)
    })
  })

  describe('mean', () => {
    it('throws on empty stream', () => {
      const sq = new StreamingQuantile<number>()
      expect(() => sq.mean()).toThrow('Cannot get mean of empty stream')
    })

    it('returns mean for numeric stream', () => {
      const sq = new StreamingQuantile<number>()
      sq.insert(1)
      sq.insert(2)
      sq.insert(3)
      sq.insert(4)
      sq.insert(5)
      expect(sq.mean()).toBe(3)
    })

    it('returns value for single item', () => {
      const sq = new StreamingQuantile<number>()
      sq.insert(42)
      expect(sq.mean()).toBe(42)
    })

    it('handles negative numbers', () => {
      const sq = new StreamingQuantile<number>()
      sq.insert(-2)
      sq.insert(2)
      expect(sq.mean()).toBe(0)
    })

    it('throws for non-numeric stream', () => {
      const sq = new StreamingQuantile<string>()
      sq.insert('a')
      expect(() => sq.mean()).toThrow(
        'Mean is only available for numeric streams',
      )
    })

    it('computes mean with floating point', () => {
      const sq = new StreamingQuantile<number>()
      sq.insert(1.5)
      sq.insert(2.5)
      expect(sq.mean()).toBe(2)
    })
  })

  describe('clone', () => {
    it('creates an independent copy', () => {
      const sq = new StreamingQuantile<number>()
      for (let i = 0; i < 100; i++) sq.insert(i)
      const cloned = sq.clone()
      expect(cloned.count).toBe(sq.count)
      expect(cloned.error).toBe(sq.error)
      expect(cloned.min()).toBe(sq.min())
      expect(cloned.max()).toBe(sq.max())
    })

    it('clone is independent from original', () => {
      const sq = new StreamingQuantile<number>()
      for (let i = 0; i < 50; i++) sq.insert(i)
      const cloned = sq.clone()
      cloned.insert(999)
      expect(sq.count).toBe(50)
      expect(cloned.count).toBe(51)
    })

    it('preserves error setting', () => {
      const sq = new StreamingQuantile<number>({ error: 0.05 })
      const cloned = sq.clone()
      expect(cloned.error).toBe(0.05)
    })

    it('preserves comparator', () => {
      const cmp = (a: number, b: number) => b - a
      const sq = new StreamingQuantile<number>({ comparator: cmp })
      sq.insert(1)
      sq.insert(2)
      const cloned = sq.clone()
      cloned.insert(3)
      expect(cloned.count).toBe(3)
    })

    it('clone of empty stream works', () => {
      const sq = new StreamingQuantile<number>()
      const cloned = sq.clone()
      expect(cloned.isEmpty()).toBe(true)
      expect(cloned.count).toBe(0)
    })

    it('clone preserves mean', () => {
      const sq = new StreamingQuantile<number>()
      sq.insert(10)
      sq.insert(20)
      const cloned = sq.clone()
      expect(cloned.mean()).toBe(sq.mean())
    })
  })

  describe('merge', () => {
    it('merges two empty streams', () => {
      const sq1 = new StreamingQuantile<number>()
      const sq2 = new StreamingQuantile<number>()
      const merged = sq1.merge(sq2)
      expect(merged.count).toBe(0)
      expect(merged.isEmpty()).toBe(true)
    })

    it('merges empty with non-empty', () => {
      const sq1 = new StreamingQuantile<number>()
      const sq2 = new StreamingQuantile<number>()
      for (let i = 0; i < 10; i++) sq2.insert(i)
      const merged = sq1.merge(sq2)
      expect(merged.count).toBe(10)
    })

    it('merges non-empty with empty', () => {
      const sq1 = new StreamingQuantile<number>()
      for (let i = 0; i < 10; i++) sq1.insert(i)
      const sq2 = new StreamingQuantile<number>()
      const merged = sq1.merge(sq2)
      expect(merged.count).toBe(10)
    })

    it('merges two non-empty streams', () => {
      const sq1 = new StreamingQuantile<number>()
      const sq2 = new StreamingQuantile<number>()
      for (let i = 0; i < 50; i++) sq1.insert(i)
      for (let i = 50; i < 100; i++) sq2.insert(i)
      const merged = sq1.merge(sq2)
      expect(merged.count).toBe(100)
      expect(merged.min()).toBe(0)
      expect(merged.max()).toBe(99)
    })

    it('merged stream has correct median', () => {
      const sq1 = new StreamingQuantile<number>()
      const sq2 = new StreamingQuantile<number>()
      for (let i = 0; i < 500; i++) sq1.insert(i)
      for (let i = 500; i < 1000; i++) sq2.insert(i)
      const merged = sq1.merge(sq2)
      const median = merged.query(0.5)
      expect(median).toBeGreaterThanOrEqual(450)
      expect(median).toBeLessThanOrEqual(550)
    })

    it('uses the larger error bound', () => {
      const sq1 = new StreamingQuantile<number>({ error: 0.01 })
      const sq2 = new StreamingQuantile<number>({ error: 0.05 })
      const merged = sq1.merge(sq2)
      expect(merged.error).toBe(0.05)
    })

    it('does not modify original streams', () => {
      const sq1 = new StreamingQuantile<number>()
      const sq2 = new StreamingQuantile<number>()
      for (let i = 0; i < 10; i++) sq1.insert(i)
      for (let i = 10; i < 20; i++) sq2.insert(i)
      sq1.merge(sq2)
      expect(sq1.count).toBe(10)
      expect(sq2.count).toBe(10)
    })

    it('handles overlapping ranges', () => {
      const sq1 = new StreamingQuantile<number>()
      const sq2 = new StreamingQuantile<number>()
      for (let i = 0; i < 100; i++) sq1.insert(i)
      for (let i = 50; i < 150; i++) sq2.insert(i)
      const merged = sq1.merge(sq2)
      expect(merged.count).toBe(200)
      expect(merged.min()).toBe(0)
      expect(merged.max()).toBe(149)
    })

    it('handles same values in both streams', () => {
      const sq1 = new StreamingQuantile<number>()
      const sq2 = new StreamingQuantile<number>()
      for (let i = 0; i < 100; i++) sq1.insert(i)
      for (let i = 0; i < 100; i++) sq2.insert(i)
      const merged = sq1.merge(sq2)
      expect(merged.count).toBe(200)
      expect(merged.min()).toBe(0)
      expect(merged.max()).toBe(99)
    })
  })

  describe('edge cases', () => {
    it('handles single item for all operations', () => {
      const sq = new StreamingQuantile<number>()
      sq.insert(42)
      expect(sq.count).toBe(1)
      expect(sq.isEmpty()).toBe(false)
      expect(sq.min()).toBe(42)
      expect(sq.max()).toBe(42)
      expect(sq.mean()).toBe(42)
      expect(sq.query(0)).toBe(42)
      expect(sq.query(0.5)).toBe(42)
      expect(sq.query(1)).toBe(42)
    })

    it('handles all same values', () => {
      const sq = new StreamingQuantile<number>()
      for (let i = 0; i < 1000; i++) sq.insert(7)
      expect(sq.min()).toBe(7)
      expect(sq.max()).toBe(7)
      expect(sq.query(0.25)).toBe(7)
      expect(sq.query(0.5)).toBe(7)
      expect(sq.query(0.75)).toBe(7)
      expect(sq.mean()).toBe(7)
    })

    it('handles sorted input', () => {
      const sq = new StreamingQuantile<number>()
      for (let i = 0; i < 1000; i++) sq.insert(i)
      const median = sq.query(0.5)
      expect(median).toBeGreaterThanOrEqual(450)
      expect(median).toBeLessThanOrEqual(550)
    })

    it('handles reverse sorted input', () => {
      const sq = new StreamingQuantile<number>()
      for (let i = 999; i >= 0; i--) sq.insert(i)
      const median = sq.query(0.5)
      expect(median).toBeGreaterThanOrEqual(450)
      expect(median).toBeLessThanOrEqual(550)
    })

    it('handles alternating high-low input', () => {
      const sq = new StreamingQuantile<number>()
      for (let i = 0; i < 500; i++) {
        sq.insert(i)
        sq.insert(999 - i)
      }
      expect(sq.min()).toBe(0)
      expect(sq.max()).toBe(999)
    })

    it('handles two items', () => {
      const sq = new StreamingQuantile<number>()
      sq.insert(1)
      sq.insert(2)
      expect(sq.query(0)).toBe(1)
      expect(sq.query(1)).toBe(2)
    })

    it('handles zero values', () => {
      const sq = new StreamingQuantile<number>()
      sq.insert(0)
      sq.insert(0)
      sq.insert(1)
      expect(sq.min()).toBe(0)
      expect(sq.max()).toBe(1)
      expect(sq.mean()).toBeCloseTo(1 / 3)
    })

    it('handles very small error bound', () => {
      const sq = new StreamingQuantile<number>({ error: 0.001 })
      for (let i = 0; i < 1000; i++) sq.insert(i)
      const median = sq.query(0.5)
      expect(median).toBeGreaterThanOrEqual(490)
      expect(median).toBeLessThanOrEqual(510)
    })

    it('handles larger error bound', () => {
      const sq = new StreamingQuantile<number>({ error: 0.1 })
      for (let i = 0; i < 1000; i++) sq.insert(i)
      const median = sq.query(0.5)
      expect(median).toBeGreaterThanOrEqual(300)
      expect(median).toBeLessThanOrEqual(700)
    })
  })

  describe('quantile accuracy', () => {
    it('median within error bound for uniform distribution', () => {
      const sq = new StreamingQuantile<number>({ error: 0.01 })
      for (let i = 0; i < 10000; i++) sq.insert(i)
      const median = sq.query(0.5)
      const tolerance = 2 * 0.01 * 10000
      expect(median).toBeGreaterThanOrEqual(5000 - tolerance)
      expect(median).toBeLessThanOrEqual(5000 + tolerance)
    })

    it('quartiles within error bound', () => {
      const sq = new StreamingQuantile<number>({ error: 0.01 })
      for (let i = 0; i < 10000; i++) sq.insert(i)
      const q1 = sq.query(0.25)
      const q3 = sq.query(0.75)
      const tolerance = 2 * 0.01 * 10000
      expect(q1).toBeGreaterThanOrEqual(2500 - tolerance)
      expect(q1).toBeLessThanOrEqual(2500 + tolerance)
      expect(q3).toBeGreaterThanOrEqual(7500 - tolerance)
      expect(q3).toBeLessThanOrEqual(7500 + tolerance)
    })

    it('percentiles within error bound for random data', () => {
      const sq = new StreamingQuantile<number>({ error: 0.01 })
      const seed = 42
      let rng = seed
      const data: number[] = []
      for (let i = 0; i < 5000; i++) {
        rng = (rng * 1103515245 + 12345) & 0x7fffffff
        const val = rng % 10000
        data.push(val)
        sq.insert(val)
      }
      data.sort((a, b) => a - b)
      const exactMedian = data[Math.floor(data.length * 0.5)]!
      const approxMedian = sq.query(0.5)
      expect(Math.abs(approxMedian - exactMedian)).toBeLessThanOrEqual(
        3 * 0.01 * 10000,
      )
    })

    it('accuracy improves with smaller error bound', () => {
      const sq1 = new StreamingQuantile<number>({ error: 0.1 })
      const sq2 = new StreamingQuantile<number>({ error: 0.001 })
      for (let i = 0; i < 10000; i++) {
        sq1.insert(i)
        sq2.insert(i)
      }
      const m1 = sq1.query(0.5)
      const m2 = sq2.query(0.5)
      expect(Math.abs(m2 - 5000)).toBeLessThanOrEqual(Math.abs(m1 - 5000) + 100)
    })
  })

  describe('large datasets', () => {
    it('handles 10000 inserts', () => {
      const sq = new StreamingQuantile<number>()
      for (let i = 0; i < 10000; i++) sq.insert(i)
      expect(sq.count).toBe(10000)
      expect(sq.min()).toBe(0)
      expect(sq.max()).toBe(9999)
    })

    it('handles 50000 inserts', () => {
      const sq = new StreamingQuantile<number>()
      for (let i = 0; i < 50000; i++) sq.insert(i)
      expect(sq.count).toBe(50000)
      const median = sq.query(0.5)
      expect(median).toBeGreaterThanOrEqual(20000)
      expect(median).toBeLessThanOrEqual(30000)
    })

    it('handles random large dataset', () => {
      const sq = new StreamingQuantile<number>()
      let seed = 123
      for (let i = 0; i < 10000; i++) {
        seed = (seed * 1103515245 + 12345) & 0x7fffffff
        sq.insert(seed % 1000)
      }
      expect(sq.count).toBe(10000)
      expect(sq.min()).toBeGreaterThanOrEqual(0)
      expect(sq.max()).toBeLessThanOrEqual(999)
    })

    it('compresses tuples during large inserts', () => {
      const sq = new StreamingQuantile<number>()
      for (let i = 0; i < 10000; i++) sq.insert(i)
      const median = sq.query(0.5)
      expect(typeof median).toBe('number')
      expect(median).toBeGreaterThan(4000)
      expect(median).toBeLessThan(6000)
    })
  })

  describe('custom comparator', () => {
    it('works with descending comparator', () => {
      const sq = new StreamingQuantile<number>({
        comparator: (a, b) => b - a,
      })
      sq.insert(1)
      sq.insert(5)
      sq.insert(3)
      expect(sq.min()).toBe(5)
      expect(sq.max()).toBe(1)
    })

    it('works with objects using key extractor', () => {
      interface Item {
        priority: number
        name: string
      }
      const sq = new StreamingQuantile<Item>({
        comparator: (a, b) => a.priority - b.priority,
      })
      sq.insert({ priority: 3, name: 'c' })
      sq.insert({ priority: 1, name: 'a' })
      sq.insert({ priority: 2, name: 'b' })
      expect(sq.min().name).toBe('a')
      expect(sq.max().name).toBe('c')
    })

    it('works with string length comparator', () => {
      const sq = new StreamingQuantile<string>({
        comparator: (a, b) => a.length - b.length,
      })
      sq.insert('a')
      sq.insert('bbb')
      sq.insert('cc')
      expect(sq.min()).toBe('a')
      expect(sq.max()).toBe('bbb')
    })
  })

  describe('query consistency', () => {
    it('query is stable across multiple calls', () => {
      const sq = new StreamingQuantile<number>()
      for (let i = 0; i < 100; i++) sq.insert(i)
      const r1 = sq.query(0.5)
      const r2 = sq.query(0.5)
      const r3 = sq.query(0.5)
      expect(r1).toBe(r2)
      expect(r2).toBe(r3)
    })

    it('queryMultiple matches individual queries', () => {
      const sq = new StreamingQuantile<number>()
      for (let i = 0; i < 500; i++) sq.insert(i)
      const individual = [
        sq.query(0.1),
        sq.query(0.25),
        sq.query(0.5),
        sq.query(0.75),
        sq.query(0.9),
      ]
      const batch = sq.queryMultiple([0.1, 0.25, 0.5, 0.75, 0.9])
      expect(batch).toEqual(individual)
    })

    it('min <= median <= max', () => {
      const sq = new StreamingQuantile<number>()
      let seed = 777
      for (let i = 0; i < 1000; i++) {
        seed = (seed * 1103515245 + 12345) & 0x7fffffff
        sq.insert(seed % 1000)
      }
      const min = sq.min()
      const median = sq.query(0.5)
      const max = sq.max()
      expect(min).toBeLessThanOrEqual(median)
      expect(median).toBeLessThanOrEqual(max)
    })
  })

  describe('error edge cases', () => {
    it('handles very large values', () => {
      const sq = new StreamingQuantile<number>()
      sq.insert(Number.MAX_SAFE_INTEGER)
      sq.insert(Number.MAX_SAFE_INTEGER - 1)
      sq.insert(Number.MAX_SAFE_INTEGER - 2)
      expect(sq.max()).toBe(Number.MAX_SAFE_INTEGER)
      expect(sq.min()).toBe(Number.MAX_SAFE_INTEGER - 2)
    })

    it('handles very small positive values', () => {
      const sq = new StreamingQuantile<number>()
      sq.insert(Number.EPSILON)
      sq.insert(Number.EPSILON * 2)
      sq.insert(Number.EPSILON * 3)
      expect(sq.min()).toBe(Number.EPSILON)
      expect(sq.max()).toBe(Number.EPSILON * 3)
    })

    it('handles Infinity', () => {
      const sq = new StreamingQuantile<number>()
      sq.insert(1)
      sq.insert(Infinity)
      sq.insert(-Infinity)
      expect(sq.min()).toBe(-Infinity)
      expect(sq.max()).toBe(Infinity)
    })

    it('handles insertion after many operations', () => {
      const sq = new StreamingQuantile<number>()
      for (let i = 0; i < 1000; i++) sq.insert(i)
      sq.clear()
      for (let i = 0; i < 1000; i++) sq.insert(999 - i)
      expect(sq.count).toBe(1000)
      expect(sq.min()).toBe(0)
      expect(sq.max()).toBe(999)
    })
  })

  describe('merge edge cases', () => {
    it('merges three streams sequentially', () => {
      const sq1 = new StreamingQuantile<number>()
      const sq2 = new StreamingQuantile<number>()
      const sq3 = new StreamingQuantile<number>()
      for (let i = 0; i < 333; i++) sq1.insert(i)
      for (let i = 333; i < 666; i++) sq2.insert(i)
      for (let i = 666; i < 1000; i++) sq3.insert(i)
      const merged = sq1.merge(sq2).merge(sq3)
      expect(merged.count).toBe(1000)
      expect(merged.min()).toBe(0)
      expect(merged.max()).toBe(999)
    })

    it('merge after clear on one side', () => {
      const sq1 = new StreamingQuantile<number>()
      const sq2 = new StreamingQuantile<number>()
      for (let i = 0; i < 50; i++) sq1.insert(i)
      sq2.insert(100)
      sq2.clear()
      for (let i = 50; i < 100; i++) sq2.insert(i)
      const merged = sq1.merge(sq2)
      expect(merged.count).toBe(100)
    })
  })

  describe('clone and merge interaction', () => {
    it('clone then merge', () => {
      const sq = new StreamingQuantile<number>()
      for (let i = 0; i < 100; i++) sq.insert(i)
      const cloned = sq.clone()
      const merged = sq.merge(cloned)
      expect(merged.count).toBe(200)
    })

    it('merge then clone', () => {
      const sq1 = new StreamingQuantile<number>()
      const sq2 = new StreamingQuantile<number>()
      for (let i = 0; i < 50; i++) sq1.insert(i)
      for (let i = 50; i < 100; i++) sq2.insert(i)
      const merged = sq1.merge(sq2)
      const cloned = merged.clone()
      expect(cloned.count).toBe(100)
      expect(cloned.min()).toBe(0)
      expect(cloned.max()).toBe(99)
    })
  })

  describe('type safety', () => {
    it('works with number type by default', () => {
      const sq = new StreamingQuantile<number>()
      sq.insert(1)
      const val: number = sq.query(0.5)
      expect(typeof val).toBe('number')
    })

    it('works with explicit string type', () => {
      const sq = new StreamingQuantile<string>()
      sq.insert('a')
      sq.insert('b')
      const val: string = sq.query(0.5)
      expect(typeof val).toBe('string')
    })

    it('works with custom object type', () => {
      interface Score {
        value: number
      }
      const sq = new StreamingQuantile<Score>({
        comparator: (a, b) => a.value - b.value,
      })
      sq.insert({ value: 10 })
      sq.insert({ value: 20 })
      sq.insert({ value: 30 })
      expect(sq.min().value).toBe(10)
      expect(sq.max().value).toBe(30)
    })
  })
})
