import { describe, it, expect, beforeEach } from 'vitest'
import { CountMinSketch } from '../../src/core/count-min-sketch/count-min-sketch.js'
import { DEFAULT_COUNTMINSKETCH_OPTIONS } from '../../src/core/count-min-sketch/types.js'
import type { CountMinSketchOptions } from '../../src/core/count-min-sketch/types.js'

describe('CountMinSketch', () => {
  let sketch: CountMinSketch

  beforeEach(() => {
    sketch = new CountMinSketch()
  })

  describe('constructor', () => {
    it('should create a sketch with default options', () => {
      const s = new CountMinSketch()
      expect(s.width()).toBe(DEFAULT_COUNTMINSKETCH_OPTIONS.width)
      expect(s.depth()).toBe(DEFAULT_COUNTMINSKETCH_OPTIONS.depth)
    })

    it('should create an empty sketch', () => {
      const s = new CountMinSketch()
      expect(s.isEmpty()).toBe(true)
    })

    it('should have zero total initially', () => {
      const s = new CountMinSketch()
      expect(s.total()).toBe(0)
    })

    it('should accept custom width', () => {
      const s = new CountMinSketch({ width: 500 })
      expect(s.width()).toBe(500)
    })

    it('should accept custom depth', () => {
      const s = new CountMinSketch({ depth: 10 })
      expect(s.depth()).toBe(10)
    })

    it('should accept partial options with defaults', () => {
      const s = new CountMinSketch({ width: 200 })
      expect(s.width()).toBe(200)
      expect(s.depth()).toBe(DEFAULT_COUNTMINSKETCH_OPTIONS.depth)
    })

    it('should accept both width and depth', () => {
      const s = new CountMinSketch({ width: 300, depth: 7 })
      expect(s.width()).toBe(300)
      expect(s.depth()).toBe(7)
    })

    it('should initialize table with correct dimensions', () => {
      const s = new CountMinSketch({ width: 50, depth: 3 })
      const t = s.table()
      expect(t.length).toBe(3)
      expect(t[0]!.length).toBe(50)
    })

    it('should initialize all table cells to zero', () => {
      const s = new CountMinSketch({ width: 10, depth: 3 })
      const t = s.table()
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 10; j++) {
          expect(t[i]![j]).toBe(0)
        }
      }
    })

    it('should work with undefined options', () => {
      const s = new CountMinSketch(undefined)
      expect(s.width()).toBe(DEFAULT_COUNTMINSKETCH_OPTIONS.width)
      expect(s.depth()).toBe(DEFAULT_COUNTMINSKETCH_OPTIONS.depth)
    })
  })

  describe('add', () => {
    it('should add a single item', () => {
      sketch.add('hello')
      expect(sketch.isEmpty()).toBe(false)
    })

    it('should increment total by 1 for single add', () => {
      sketch.add('hello')
      expect(sketch.total()).toBe(1)
    })

    it('should add same item multiple times', () => {
      sketch.add('hello')
      sketch.add('hello')
      sketch.add('hello')
      expect(sketch.total()).toBe(3)
    })

    it('should add different items', () => {
      sketch.add('a')
      sketch.add('b')
      sketch.add('c')
      expect(sketch.total()).toBe(3)
    })

    it('should support custom count', () => {
      sketch.add('hello', 5)
      expect(sketch.total()).toBe(5)
    })

    it('should support adding with count greater than 1', () => {
      sketch.add('item', 100)
      expect(sketch.estimateFrequency('item')).toBeGreaterThanOrEqual(100)
    })

    it('should not add with zero count', () => {
      sketch.add('hello', 0)
      expect(sketch.total()).toBe(0)
      expect(sketch.isEmpty()).toBe(true)
    })

    it('should not add with negative count', () => {
      sketch.add('hello', -5)
      expect(sketch.total()).toBe(0)
      expect(sketch.isEmpty()).toBe(true)
    })

    it('should handle empty string key', () => {
      sketch.add('')
      expect(sketch.total()).toBe(1)
      expect(sketch.isEmpty()).toBe(false)
    })

    it('should handle special characters in key', () => {
      sketch.add('!@#$%^&*()')
      expect(sketch.total()).toBe(1)
    })

    it('should handle unicode strings', () => {
      sketch.add('你好世界')
      expect(sketch.total()).toBe(1)
    })

    it('should handle very long strings', () => {
      const longStr = 'a'.repeat(10000)
      sketch.add(longStr)
      expect(sketch.total()).toBe(1)
    })
  })

  describe('count / estimateFrequency', () => {
    it('should return 0 for unseen item', () => {
      expect(sketch.count('unseen')).toBe(0)
    })

    it('should return 1 for item added once', () => {
      sketch.add('item')
      expect(sketch.count('item')).toBe(1)
    })

    it('should return correct count for item added multiple times', () => {
      sketch.add('item')
      sketch.add('item')
      sketch.add('item')
      expect(sketch.count('item')).toBe(3)
    })

    it('estimateFrequency should match count', () => {
      sketch.add('item', 7)
      expect(sketch.estimateFrequency('item')).toBe(sketch.count('item'))
    })

    it('should return at least the true count (over-estimation property)', () => {
      const s = new CountMinSketch({ width: 100, depth: 5 })
      for (let i = 0; i < 200; i++) {
        s.add(`item-${i}`)
      }
      s.add('target', 10)
      expect(s.count('target')).toBeGreaterThanOrEqual(10)
    })

    it('should handle frequency with custom count', () => {
      sketch.add('item', 42)
      expect(sketch.estimateFrequency('item')).toBe(42)
    })

    it('should handle cumulative counts', () => {
      sketch.add('item', 3)
      sketch.add('item', 4)
      expect(sketch.estimateFrequency('item')).toBe(7)
    })

    it('should return 0 for items never added', () => {
      sketch.add('a')
      sketch.add('b')
      expect(sketch.count('c')).toBe(0)
    })

    it('should distinguish between different items', () => {
      sketch.add('apple', 10)
      sketch.add('orange', 20)
      expect(sketch.count('apple')).toBeGreaterThanOrEqual(10)
      expect(sketch.count('orange')).toBeGreaterThanOrEqual(20)
    })
  })

  describe('merge', () => {
    it('should merge two sketches of same dimensions', () => {
      const s1 = new CountMinSketch({ width: 100, depth: 5 })
      const s2 = new CountMinSketch({ width: 100, depth: 5 })
      s1.add('item', 3)
      s2.add('item', 4)
      s1.merge(s2)
      expect(s1.estimateFrequency('item')).toBeGreaterThanOrEqual(7)
    })

    it('should add totals after merge', () => {
      const s1 = new CountMinSketch({ width: 100, depth: 5 })
      const s2 = new CountMinSketch({ width: 100, depth: 5 })
      s1.add('a', 5)
      s2.add('b', 10)
      s1.merge(s2)
      expect(s1.total()).toBe(15)
    })

    it('should throw when merging sketches with different width', () => {
      const s1 = new CountMinSketch({ width: 100, depth: 5 })
      const s2 = new CountMinSketch({ width: 200, depth: 5 })
      expect(() => s1.merge(s2)).toThrow('Cannot merge sketches with different dimensions')
    })

    it('should throw when merging sketches with different depth', () => {
      const s1 = new CountMinSketch({ width: 100, depth: 5 })
      const s2 = new CountMinSketch({ width: 100, depth: 10 })
      expect(() => s1.merge(s2)).toThrow('Cannot merge sketches with different dimensions')
    })

    it('should merge with empty sketch', () => {
      const s1 = new CountMinSketch({ width: 100, depth: 5 })
      const s2 = new CountMinSketch({ width: 100, depth: 5 })
      s1.add('item', 10)
      s1.merge(s2)
      expect(s1.estimateFrequency('item')).toBeGreaterThanOrEqual(10)
      expect(s1.total()).toBe(10)
    })

    it('should merge into empty sketch', () => {
      const s1 = new CountMinSketch({ width: 100, depth: 5 })
      const s2 = new CountMinSketch({ width: 100, depth: 5 })
      s2.add('item', 10)
      s1.merge(s2)
      expect(s1.estimateFrequency('item')).toBeGreaterThanOrEqual(10)
      expect(s1.total()).toBe(10)
    })

    it('should accumulate counts in table after merge', () => {
      const s1 = new CountMinSketch({ width: 50, depth: 3 })
      const s2 = new CountMinSketch({ width: 50, depth: 3 })
      s1.add('x')
      s2.add('x')
      s1.merge(s2)
      expect(s1.estimateFrequency('x')).toBeGreaterThanOrEqual(2)
    })

    it('should handle merge with multiple different items', () => {
      const s1 = new CountMinSketch({ width: 100, depth: 5 })
      const s2 = new CountMinSketch({ width: 100, depth: 5 })
      s1.add('a', 5)
      s1.add('b', 3)
      s2.add('c', 7)
      s2.add('d', 2)
      s1.merge(s2)
      expect(s1.total()).toBe(17)
    })
  })

  describe('reset', () => {
    it('should reset sketch to empty state', () => {
      sketch.add('item', 10)
      sketch.reset()
      expect(sketch.isEmpty()).toBe(true)
    })

    it('should reset total to zero', () => {
      sketch.add('item', 10)
      sketch.reset()
      expect(sketch.total()).toBe(0)
    })

    it('should reset frequency estimates', () => {
      sketch.add('item', 10)
      sketch.reset()
      expect(sketch.estimateFrequency('item')).toBe(0)
    })

    it('should allow adding after reset', () => {
      sketch.add('item', 10)
      sketch.reset()
      sketch.add('item', 5)
      expect(sketch.estimateFrequency('item')).toBeGreaterThanOrEqual(5)
      expect(sketch.total()).toBe(5)
    })

    it('should reset all table cells to zero', () => {
      const s = new CountMinSketch({ width: 10, depth: 3 })
      s.add('x', 100)
      s.reset()
      const t = s.table()
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 10; j++) {
          expect(t[i]![j]).toBe(0)
        }
      }
    })

    it('should handle multiple resets', () => {
      sketch.add('item')
      sketch.reset()
      sketch.reset()
      expect(sketch.isEmpty()).toBe(true)
      expect(sketch.total()).toBe(0)
    })
  })

  describe('isEmpty', () => {
    it('should return true for new sketch', () => {
      expect(sketch.isEmpty()).toBe(true)
    })

    it('should return false after adding an item', () => {
      sketch.add('item')
      expect(sketch.isEmpty()).toBe(false)
    })

    it('should return true after reset', () => {
      sketch.add('item')
      sketch.reset()
      expect(sketch.isEmpty()).toBe(true)
    })

    it('should return true for sketch with only zero-count adds', () => {
      sketch.add('item', 0)
      expect(sketch.isEmpty()).toBe(true)
    })
  })

  describe('total', () => {
    it('should return 0 for new sketch', () => {
      expect(sketch.total()).toBe(0)
    })

    it('should return count of all added items', () => {
      sketch.add('a')
      sketch.add('b')
      sketch.add('c')
      expect(sketch.total()).toBe(3)
    })

    it('should include custom counts in total', () => {
      sketch.add('a', 10)
      sketch.add('b', 20)
      expect(sketch.total()).toBe(30)
    })

    it('should handle mixed default and custom counts', () => {
      sketch.add('a')
      sketch.add('b', 5)
      expect(sketch.total()).toBe(6)
    })

    it('should reset to 0 after clear', () => {
      sketch.add('a', 100)
      sketch.reset()
      expect(sketch.total()).toBe(0)
    })
  })

  describe('width', () => {
    it('should return default width', () => {
      expect(sketch.width()).toBe(DEFAULT_COUNTMINSKETCH_OPTIONS.width)
    })

    it('should return custom width', () => {
      const s = new CountMinSketch({ width: 500 })
      expect(s.width()).toBe(500)
    })
  })

  describe('depth', () => {
    it('should return default depth', () => {
      expect(sketch.depth()).toBe(DEFAULT_COUNTMINSKETCH_OPTIONS.depth)
    })

    it('should return custom depth', () => {
      const s = new CountMinSketch({ depth: 8 })
      expect(s.depth()).toBe(8)
    })
  })

  describe('table', () => {
    it('should return a copy of the internal table', () => {
      sketch.add('item')
      const t = sketch.table()
      expect(t).not.toBe((sketch as unknown as { matrix: number[][] }).matrix)
    })

    it('should return correct dimensions', () => {
      const s = new CountMinSketch({ width: 50, depth: 3 })
      const t = s.table()
      expect(t.length).toBe(3)
      expect(t[0]!.length).toBe(50)
    })

    it('should return a deep copy (modifying result does not affect sketch)', () => {
      sketch.add('item', 10)
      const t = sketch.table()
      const originalValue = t[0]![0]!
      t[0]![0] = 9999
      const t2 = sketch.table()
      expect(t2[0]![0]).toBe(originalValue)
    })

    it('should reflect added values', () => {
      const s = new CountMinSketch({ width: 10, depth: 3 })
      s.add('test', 5)
      const t = s.table()
      let foundNonZero = false
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 10; j++) {
          if (t[i]![j]! > 0) {
            foundNonZero = true
          }
        }
      }
      expect(foundNonZero).toBe(true)
    })
  })

  describe('re-exports', () => {
    it('should export DEFAULT_COUNTMINSKETCH_OPTIONS from types', () => {
      expect(DEFAULT_COUNTMINSKETCH_OPTIONS).toBeDefined()
      expect(DEFAULT_COUNTMINSKETCH_OPTIONS.width).toBe(1000)
      expect(DEFAULT_COUNTMINSKETCH_OPTIONS.depth).toBe(5)
    })
  })

  describe('probabilistic behavior', () => {
    it('should estimate frequencies within acceptable error bounds', () => {
      const s = new CountMinSketch({ width: 1000, depth: 5 })
      const trueCounts: Record<string, number> = {}
      for (let i = 0; i < 100; i++) {
        const key = `item-${i}`
        const count = Math.floor(Math.random() * 100) + 1
        trueCounts[key] = count
        s.add(key, count)
      }
      for (const [key, trueCount] of Object.entries(trueCounts)) {
        expect(s.estimateFrequency(key)).toBeGreaterThanOrEqual(trueCount)
      }
    })

    it('should provide consistent results for same input', () => {
      sketch.add('consistent', 5)
      const r1 = sketch.estimateFrequency('consistent')
      const r2 = sketch.estimateFrequency('consistent')
      expect(r1).toBe(r2)
    })

    it('should handle large number of distinct items', () => {
      const s = new CountMinSketch({ width: 2000, depth: 7 })
      for (let i = 0; i < 1000; i++) {
        s.add(`item-${i}`)
      }
      expect(s.total()).toBe(1000)
      for (let i = 0; i < 1000; i++) {
        expect(s.estimateFrequency(`item-${i}`)).toBeGreaterThanOrEqual(1)
      }
    })

    it('should handle heavy hitter pattern', () => {
      const s = new CountMinSketch({ width: 500, depth: 5 })
      s.add('heavy', 1000)
      for (let i = 0; i < 100; i++) {
        s.add(`light-${i}`)
      }
      expect(s.estimateFrequency('heavy')).toBeGreaterThanOrEqual(1000)
    })

    it('should handle stream-like workload', () => {
      const s = new CountMinSketch({ width: 1000, depth: 5 })
      const items = ['a', 'b', 'c', 'd', 'e']
      for (let round = 0; round < 100; round++) {
        for (const item of items) {
          s.add(item)
        }
      }
      expect(s.total()).toBe(500)
      for (const item of items) {
        expect(s.estimateFrequency(item)).toBeGreaterThanOrEqual(100)
      }
    })

    it('should handle single item added many times', () => {
      const s = new CountMinSketch({ width: 100, depth: 5 })
      for (let i = 0; i < 10000; i++) {
        s.add('single')
      }
      expect(s.total()).toBe(10000)
      expect(s.estimateFrequency('single')).toBeGreaterThanOrEqual(10000)
    })
  })

  describe('edge cases', () => {
    it('should handle sketch with width 1', () => {
      const s = new CountMinSketch({ width: 1, depth: 3 })
      s.add('a')
      s.add('b')
      expect(s.total()).toBe(2)
      expect(s.estimateFrequency('a')).toBeGreaterThanOrEqual(1)
    })

    it('should handle sketch with depth 1', () => {
      const s = new CountMinSketch({ width: 100, depth: 1 })
      s.add('item', 5)
      expect(s.estimateFrequency('item')).toBeGreaterThanOrEqual(5)
    })

    it('should handle very large count values', () => {
      sketch.add('big', Number.MAX_SAFE_INTEGER)
      expect(sketch.total()).toBe(Number.MAX_SAFE_INTEGER)
      expect(sketch.estimateFrequency('big')).toBeGreaterThanOrEqual(Number.MAX_SAFE_INTEGER)
    })

    it('should handle adding after querying', () => {
      expect(sketch.count('item')).toBe(0)
      sketch.add('item', 3)
      expect(sketch.count('item')).toBeGreaterThanOrEqual(3)
    })

    it('should handle mixed add and query pattern', () => {
      sketch.add('a', 1)
      expect(sketch.count('a')).toBeGreaterThanOrEqual(1)
      sketch.add('a', 2)
      expect(sketch.count('a')).toBeGreaterThanOrEqual(3)
      sketch.add('a', 3)
      expect(sketch.count('a')).toBeGreaterThanOrEqual(6)
      expect(sketch.total()).toBe(6)
    })

    it('should handle querying before any adds', () => {
      expect(sketch.estimateFrequency('anything')).toBe(0)
      expect(sketch.count('anything')).toBe(0)
    })

    it('should handle keys that differ by case', () => {
      sketch.add('Hello')
      sketch.add('hello')
      sketch.add('HELLO')
      expect(sketch.total()).toBe(3)
      expect(sketch.estimateFrequency('Hello')).toBeGreaterThanOrEqual(1)
      expect(sketch.estimateFrequency('hello')).toBeGreaterThanOrEqual(1)
      expect(sketch.estimateFrequency('HELLO')).toBeGreaterThanOrEqual(1)
    })

    it('should handle keys with whitespace', () => {
      sketch.add(' ')
      sketch.add('\t')
      sketch.add('\n')
      expect(sketch.total()).toBe(3)
    })

    it('should handle numeric-like string keys', () => {
      sketch.add('123')
      sketch.add('456')
      sketch.add('0')
      expect(sketch.total()).toBe(3)
      expect(sketch.estimateFrequency('123')).toBeGreaterThanOrEqual(1)
    })

    it('should handle very wide sketch', () => {
      const s = new CountMinSketch({ width: 10000, depth: 3 })
      s.add('item', 10)
      expect(s.estimateFrequency('item')).toBeGreaterThanOrEqual(10)
      expect(s.width()).toBe(10000)
    })

    it('should handle very deep sketch', () => {
      const s = new CountMinSketch({ width: 100, depth: 20 })
      s.add('item', 10)
      expect(s.estimateFrequency('item')).toBeGreaterThanOrEqual(10)
      expect(s.depth()).toBe(20)
    })

    it('should handle sequential add-reset-add pattern', () => {
      sketch.add('a', 5)
      expect(sketch.total()).toBe(5)
      sketch.reset()
      expect(sketch.total()).toBe(0)
      sketch.add('b', 3)
      expect(sketch.total()).toBe(3)
      expect(sketch.estimateFrequency('a')).toBe(0)
      expect(sketch.estimateFrequency('b')).toBeGreaterThanOrEqual(3)
    })

    it('should handle merge then add', () => {
      const s1 = new CountMinSketch({ width: 100, depth: 3 })
      const s2 = new CountMinSketch({ width: 100, depth: 3 })
      s1.add('x', 5)
      s2.add('x', 3)
      s1.merge(s2)
      s1.add('x', 2)
      expect(s1.total()).toBe(10)
      expect(s1.estimateFrequency('x')).toBeGreaterThanOrEqual(10)
    })
  })
})
