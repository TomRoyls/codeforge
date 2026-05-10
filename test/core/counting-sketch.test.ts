import { describe, it, expect, beforeEach } from 'vitest'
import { CountingSketch } from '../../src/core/counting-sketch/counting-sketch.js'
import { DEFAULT_COUNTING_SKETCH_OPTIONS } from '../../src/core/counting-sketch/types.js'
import type { CountingSketchOptions } from '../../src/core/counting-sketch/types.js'

describe('CountingSketch', () => {
  let sketch: CountingSketch<string>

  beforeEach(() => {
    sketch = new CountingSketch()
  })

  describe('constructor', () => {
    it('should create with default options', () => {
      const s = new CountingSketch()
      expect(s.width).toBe(DEFAULT_COUNTING_SKETCH_OPTIONS.width)
      expect(s.depth).toBe(DEFAULT_COUNTING_SKETCH_OPTIONS.depth)
    })

    it('should create with empty options', () => {
      const s = new CountingSketch({})
      expect(s.width).toBe(DEFAULT_COUNTING_SKETCH_OPTIONS.width)
      expect(s.depth).toBe(DEFAULT_COUNTING_SKETCH_OPTIONS.depth)
    })

    it('should create with custom width', () => {
      const s = new CountingSketch({ width: 500 })
      expect(s.width).toBe(500)
    })

    it('should create with custom depth', () => {
      const s = new CountingSketch({ depth: 10 })
      expect(s.depth).toBe(10)
    })

    it('should create with custom width and depth', () => {
      const s = new CountingSketch({ width: 200, depth: 3 })
      expect(s.width).toBe(200)
      expect(s.depth).toBe(3)
    })

    it('should create with custom hashFunctions', () => {
      const s = new CountingSketch({ hashFunctions: 7 })
      expect(s.hashFunctionCount).toBe(7)
    })

    it('should create with all options', () => {
      const s = new CountingSketch({ width: 100, depth: 4, hashFunctions: 4 })
      expect(s.width).toBe(100)
      expect(s.depth).toBe(4)
      expect(s.hashFunctionCount).toBe(4)
    })

    it('should default hashFunctions to depth when not specified', () => {
      const s = new CountingSketch({ depth: 8 })
      expect(s.hashFunctionCount).toBe(8)
    })

    it('should enforce minimum width of 1', () => {
      const s = new CountingSketch({ width: 0 })
      expect(s.width).toBe(1)
    })

    it('should enforce minimum depth of 1', () => {
      const s = new CountingSketch({ depth: 0 })
      expect(s.depth).toBe(1)
    })

    it('should enforce minimum hashFunctions of 1', () => {
      const s = new CountingSketch({ hashFunctions: 0 })
      expect(s.hashFunctionCount).toBe(1)
    })

    it('should create a new empty sketch', () => {
      expect(sketch.isEmpty()).toBe(true)
    })

    it('should handle negative width gracefully', () => {
      const s = new CountingSketch({ width: -10 })
      expect(s.width).toBe(1)
    })

    it('should handle negative depth gracefully', () => {
      const s = new CountingSketch({ depth: -5 })
      expect(s.depth).toBe(1)
    })
  })

  describe('update', () => {
    it('should update with default count of 1', () => {
      sketch.update('item')
      expect(sketch.isEmpty()).toBe(false)
    })

    it('should update with explicit count', () => {
      sketch.update('item', 5)
      expect(sketch.isEmpty()).toBe(false)
    })

    it('should update with count of 0', () => {
      sketch.update('item', 0)
      expect(sketch.isEmpty()).toBe(false)
    })

    it('should handle multiple updates to same item', () => {
      sketch.update('item')
      sketch.update('item')
      sketch.update('item')
      expect(sketch.estimate('item')).toBeGreaterThanOrEqual(3)
    })

    it('should handle update with large count', () => {
      sketch.update('item', 1000)
      expect(sketch.estimate('item')).toBeGreaterThanOrEqual(1000)
    })

    it('should handle update with negative count', () => {
      sketch.update('item', 10)
      sketch.update('item', -3)
      const est = sketch.estimate('item')
      expect(est).toBeGreaterThanOrEqual(7)
    })

    it('should track statistics after update', () => {
      sketch.update('a', 3)
      const stats = sketch.getStatistics()
      expect(stats.updates).toBe(1)
      expect(stats.totalItemCount).toBe(3)
    })

    it('should track multiple updates in statistics', () => {
      sketch.update('a', 2)
      sketch.update('b', 5)
      sketch.update('c', 1)
      const stats = sketch.getStatistics()
      expect(stats.updates).toBe(3)
      expect(stats.totalItemCount).toBe(8)
    })

    it('should handle numeric items', () => {
      const numSketch = new CountingSketch<number>()
      numSketch.update(42)
      expect(numSketch.isEmpty()).toBe(false)
    })

    it('should handle object items', () => {
      const objSketch = new CountingSketch<{ id: number }>()
      objSketch.update({ id: 1 })
      expect(objSketch.isEmpty()).toBe(false)
    })

    it('should distinguish between different string items', () => {
      sketch.update('a', 10)
      sketch.update('b', 5)
      const estA = sketch.estimate('a')
      const estB = sketch.estimate('b')
      expect(estA).toBeGreaterThanOrEqual(10)
      expect(estB).toBeGreaterThanOrEqual(5)
    })
  })

  describe('estimate', () => {
    it('should return 0 for unknown item on empty sketch', () => {
      expect(sketch.estimate('unknown')).toBe(0)
    })

    it('should return 0 for unknown item after updates', () => {
      sketch.update('a', 10)
      expect(sketch.estimate('b')).toBe(0)
    })

    it('should estimate frequency after single update', () => {
      sketch.update('item', 7)
      const est = sketch.estimate('item')
      expect(est).toBeGreaterThanOrEqual(7)
    })

    it('should estimate frequency after multiple updates', () => {
      sketch.update('item', 3)
      sketch.update('item', 4)
      const est = sketch.estimate('item')
      expect(est).toBeGreaterThanOrEqual(7)
    })

    it('should estimate with over-estimate tendency (upper bound)', () => {
      sketch.update('item', 5)
      const est = sketch.estimate('item')
      expect(est).toBeGreaterThanOrEqual(5)
    })

    it('should track queries in statistics', () => {
      sketch.estimate('a')
      sketch.estimate('b')
      sketch.estimate('c')
      const stats = sketch.getStatistics()
      expect(stats.queries).toBe(3)
    })

    it('should return 0 for item never updated', () => {
      sketch.update('a', 100)
      expect(sketch.estimate('never-seen')).toBe(0)
    })

    it('should estimate correctly for single update of 1', () => {
      sketch.update('x')
      expect(sketch.estimate('x')).toBeGreaterThanOrEqual(1)
    })

    it('should handle estimate on item with zero-count update', () => {
      sketch.update('item', 0)
      const est = sketch.estimate('item')
      expect(est).toBeGreaterThanOrEqual(0)
    })
  })

  describe('multiple items', () => {
    it('should track different items independently', () => {
      sketch.update('a', 10)
      sketch.update('b', 20)
      const estA = sketch.estimate('a')
      const estB = sketch.estimate('b')
      expect(estA).toBeGreaterThanOrEqual(10)
      expect(estB).toBeGreaterThanOrEqual(20)
    })

    it('should handle many distinct items', () => {
      for (let i = 0; i < 100; i++) {
        sketch.update(`item-${i}`, 1)
      }
      for (let i = 0; i < 100; i++) {
        expect(sketch.estimate(`item-${i}`)).toBeGreaterThanOrEqual(1)
      }
    })

    it('should handle interleaved updates', () => {
      sketch.update('a', 1)
      sketch.update('b', 1)
      sketch.update('a', 1)
      sketch.update('c', 1)
      sketch.update('a', 1)
      expect(sketch.estimate('a')).toBeGreaterThanOrEqual(3)
      expect(sketch.estimate('b')).toBeGreaterThanOrEqual(1)
      expect(sketch.estimate('c')).toBeGreaterThanOrEqual(1)
    })

    it('should estimate correctly for items with different frequencies', () => {
      sketch.update('rare', 1)
      sketch.update('common', 50)
      sketch.update('medium', 10)
      expect(sketch.estimate('rare')).toBeGreaterThanOrEqual(1)
      expect(sketch.estimate('common')).toBeGreaterThanOrEqual(50)
      expect(sketch.estimate('medium')).toBeGreaterThanOrEqual(10)
    })
  })

  describe('hash distribution', () => {
    it('should produce different estimates for different items in general', () => {
      sketch.update('apple', 100)
      sketch.update('orange', 1)
      expect(sketch.estimate('apple')).toBeGreaterThan(sketch.estimate('orange'))
    })

    it('should handle items that are very similar strings', () => {
      sketch.update('item1', 10)
      sketch.update('item2', 20)
      expect(sketch.estimate('item1')).toBeGreaterThanOrEqual(10)
      expect(sketch.estimate('item2')).toBeGreaterThanOrEqual(20)
    })

    it('should handle single-character items', () => {
      sketch.update('a', 5)
      sketch.update('b', 10)
      expect(sketch.estimate('a')).toBeGreaterThanOrEqual(5)
      expect(sketch.estimate('b')).toBeGreaterThanOrEqual(10)
    })

    it('should handle empty string item', () => {
      sketch.update('', 3)
      expect(sketch.estimate('')).toBeGreaterThanOrEqual(3)
    })

    it('should handle unicode items', () => {
      sketch.update('日本語', 7)
      expect(sketch.estimate('日本語')).toBeGreaterThanOrEqual(7)
    })

    it('should handle emoji items', () => {
      sketch.update('🎉', 4)
      expect(sketch.estimate('🎉')).toBeGreaterThanOrEqual(4)
    })

    it('should produce consistent estimates for same item', () => {
      sketch.update('consistent', 10)
      const est1 = sketch.estimate('consistent')
      const est2 = sketch.estimate('consistent')
      expect(est1).toBe(est2)
    })
  })

  describe('merge', () => {
    it('should merge two sketches with same dimensions', () => {
      const s1 = new CountingSketch<string>({ width: 100, depth: 3 })
      const s2 = new CountingSketch<string>({ width: 100, depth: 3 })
      s1.update('a', 5)
      s2.update('a', 10)
      const merged = s1.merge(s2)
      expect(merged.estimate('a')).toBeGreaterThanOrEqual(15)
    })

    it('should merge and preserve both sketches data', () => {
      const s1 = new CountingSketch<string>({ width: 100, depth: 3 })
      const s2 = new CountingSketch<string>({ width: 100, depth: 3 })
      s1.update('x', 3)
      s2.update('y', 7)
      const merged = s1.merge(s2)
      expect(merged.estimate('x')).toBeGreaterThanOrEqual(3)
      expect(merged.estimate('y')).toBeGreaterThanOrEqual(7)
    })

    it('should return new sketch without modifying originals', () => {
      const s1 = new CountingSketch<string>({ width: 100, depth: 3 })
      const s2 = new CountingSketch<string>({ width: 100, depth: 3 })
      s1.update('a', 5)
      s2.update('b', 10)
      const merged = s1.merge(s2)
      expect(merged).not.toBe(s1)
      expect(merged).not.toBe(s2)
    })

    it('should throw when merging different widths', () => {
      const s1 = new CountingSketch<string>({ width: 100 })
      const s2 = new CountingSketch<string>({ width: 200 })
      expect(() => s1.merge(s2)).toThrow('Cannot merge sketches with different widths')
    })

    it('should throw when merging different depths', () => {
      const s1 = new CountingSketch<string>({ depth: 3 })
      const s2 = new CountingSketch<string>({ depth: 7 })
      expect(() => s1.merge(s2)).toThrow('Cannot merge sketches with different depths')
    })

    it('should throw when merging different hash function counts', () => {
      const s1 = new CountingSketch<string>({ depth: 3, hashFunctions: 3 })
      const s2 = new CountingSketch<string>({ depth: 3, hashFunctions: 5 })
      expect(() => s1.merge(s2)).toThrow('Cannot merge sketches with different hash function counts')
    })

    it('should merge two empty sketches', () => {
      const s1 = new CountingSketch<string>({ width: 100, depth: 3 })
      const s2 = new CountingSketch<string>({ width: 100, depth: 3 })
      const merged = s1.merge(s2)
      expect(merged.isEmpty()).toBe(true)
    })

    it('should merge one empty and one non-empty sketch', () => {
      const s1 = new CountingSketch<string>({ width: 100, depth: 3 })
      const s2 = new CountingSketch<string>({ width: 100, depth: 3 })
      s2.update('a', 5)
      const merged = s1.merge(s2)
      expect(merged.isEmpty()).toBe(false)
      expect(merged.estimate('a')).toBeGreaterThanOrEqual(5)
    })

    it('should update merge statistics', () => {
      const s1 = new CountingSketch<string>({ width: 100, depth: 3 })
      const s2 = new CountingSketch<string>({ width: 100, depth: 3 })
      s1.update('a', 5)
      s2.update('b', 3)
      const merged = s1.merge(s2)
      const stats = merged.getStatistics()
      expect(stats.merges).toBeGreaterThanOrEqual(1)
    })

    it('should merge sketches with accumulated counts', () => {
      const s1 = new CountingSketch<string>({ width: 100, depth: 3 })
      const s2 = new CountingSketch<string>({ width: 100, depth: 3 })
      s1.update('a', 1)
      s1.update('a', 1)
      s1.update('a', 1)
      s2.update('a', 2)
      s2.update('a', 3)
      const merged = s1.merge(s2)
      expect(merged.estimate('a')).toBeGreaterThanOrEqual(8)
    })

    it('should handle merging with negative counts', () => {
      const s1 = new CountingSketch<string>({ width: 100, depth: 3 })
      const s2 = new CountingSketch<string>({ width: 100, depth: 3 })
      s1.update('a', 10)
      s2.update('a', -3)
      const merged = s1.merge(s2)
      expect(merged.estimate('a')).toBeGreaterThanOrEqual(7)
    })
  })

  describe('clear', () => {
    it('should clear the sketch', () => {
      sketch.update('item', 10)
      sketch.clear()
      expect(sketch.isEmpty()).toBe(true)
    })

    it('should reset estimate to 0 after clear', () => {
      sketch.update('item', 100)
      sketch.clear()
      expect(sketch.estimate('item')).toBe(0)
    })

    it('should allow updates after clear', () => {
      sketch.update('item', 5)
      sketch.clear()
      sketch.update('item', 10)
      expect(sketch.estimate('item')).toBeGreaterThanOrEqual(10)
    })

    it('should reset statistics after clear', () => {
      sketch.update('a', 5)
      sketch.update('b', 3)
      sketch.clear()
      const stats = sketch.getStatistics()
      expect(stats.updates).toBe(0)
      expect(stats.totalItemCount).toBe(0)
    })

    it('should preserve dimensions after clear', () => {
      const s = new CountingSketch({ width: 500, depth: 7 })
      s.update('item', 5)
      s.clear()
      expect(s.width).toBe(500)
      expect(s.depth).toBe(7)
    })

    it('should handle double clear', () => {
      sketch.update('item', 5)
      sketch.clear()
      sketch.clear()
      expect(sketch.isEmpty()).toBe(true)
    })

    it('should clear and allow different item type updates', () => {
      sketch.update('a', 10)
      sketch.clear()
      sketch.update('b', 20)
      expect(sketch.estimate('b')).toBeGreaterThanOrEqual(20)
    })
  })

  describe('isEmpty', () => {
    it('should return true for new sketch', () => {
      expect(sketch.isEmpty()).toBe(true)
    })

    it('should return false after update', () => {
      sketch.update('item')
      expect(sketch.isEmpty()).toBe(false)
    })

    it('should return true after clear', () => {
      sketch.update('item')
      sketch.clear()
      expect(sketch.isEmpty()).toBe(true)
    })

    it('should return false after update with count 0', () => {
      sketch.update('item', 0)
      expect(sketch.isEmpty()).toBe(false)
    })

    it('should return false after multiple updates', () => {
      sketch.update('a')
      sketch.update('b')
      sketch.update('c')
      expect(sketch.isEmpty()).toBe(false)
    })

    it('should still be false after negative update', () => {
      sketch.update('item', 5)
      sketch.update('item', -3)
      expect(sketch.isEmpty()).toBe(false)
    })
  })

  describe('accessors', () => {
    it('should return correct width', () => {
      const s = new CountingSketch({ width: 250 })
      expect(s.width).toBe(250)
    })

    it('should return correct depth', () => {
      const s = new CountingSketch({ depth: 4 })
      expect(s.depth).toBe(4)
    })

    it('should return correct hashFunctionCount', () => {
      const s = new CountingSketch({ hashFunctions: 6 })
      expect(s.hashFunctionCount).toBe(6)
    })

    it('should return default width', () => {
      expect(sketch.width).toBe(1000)
    })

    it('should return default depth', () => {
      expect(sketch.depth).toBe(5)
    })

    it('should return default hashFunctionCount matching depth', () => {
      expect(sketch.hashFunctionCount).toBe(5)
    })
  })

  describe('edge cases', () => {
    it('should handle update with very large count', () => {
      sketch.update('item', 1000000)
      expect(sketch.estimate('item')).toBeGreaterThanOrEqual(1000000)
    })

    it('should handle update with count of 1', () => {
      sketch.update('item', 1)
      expect(sketch.estimate('item')).toBeGreaterThanOrEqual(1)
    })

    it('should handle negative counts bringing estimate below zero', () => {
      sketch.update('item', 5)
      sketch.update('item', -10)
      const est = sketch.estimate('item')
      expect(typeof est).toBe('number')
    })

    it('should handle very long string items', () => {
      const longStr = 'a'.repeat(10000)
      sketch.update(longStr, 3)
      expect(sketch.estimate(longStr)).toBeGreaterThanOrEqual(3)
    })

    it('should handle whitespace-only items', () => {
      sketch.update('   ', 2)
      expect(sketch.estimate('   ')).toBeGreaterThanOrEqual(2)
    })

    it('should handle special character items', () => {
      sketch.update('!@#$%^&*()', 1)
      expect(sketch.estimate('!@#$%^&*()')).toBeGreaterThanOrEqual(1)
    })

    it('should handle null-like string items', () => {
      sketch.update('null', 1)
      expect(sketch.estimate('null')).toBeGreaterThanOrEqual(1)
    })

    it('should handle items with newlines', () => {
      sketch.update('line1\nline2', 3)
      expect(sketch.estimate('line1\nline2')).toBeGreaterThanOrEqual(3)
    })

    it('should handle items with tabs', () => {
      sketch.update('tab\there', 2)
      expect(sketch.estimate('tab\there')).toBeGreaterThanOrEqual(2)
    })

    it('should handle update then estimate repeatedly', () => {
      for (let i = 0; i < 10; i++) {
        sketch.update('item', 1)
        expect(sketch.estimate('item')).toBeGreaterThanOrEqual(i + 1)
      }
    })

    it('should handle width of 1', () => {
      const s = new CountingSketch({ width: 1, depth: 1 })
      s.update('item', 5)
      expect(s.estimate('item')).toBeGreaterThanOrEqual(5)
    })

    it('should handle depth of 1', () => {
      const s = new CountingSketch({ width: 100, depth: 1 })
      s.update('item', 5)
      expect(s.estimate('item')).toBeGreaterThanOrEqual(5)
    })

    it('should handle small sketch with many items', () => {
      const s = new CountingSketch({ width: 10, depth: 2 })
      for (let i = 0; i < 1000; i++) {
        s.update(`item-${i % 10}`, 1)
      }
      expect(s.isEmpty()).toBe(false)
    })
  })

  describe('large datasets', () => {
    it('should handle 10000 updates to single item', () => {
      for (let i = 0; i < 10000; i++) {
        sketch.update('item')
      }
      expect(sketch.estimate('item')).toBeGreaterThanOrEqual(10000)
    })

    it('should handle 1000 distinct items', () => {
      for (let i = 0; i < 1000; i++) {
        sketch.update(`item-${i}`, 1)
      }
      let correct = 0
      for (let i = 0; i < 1000; i++) {
        if (sketch.estimate(`item-${i}`) >= 1) correct++
      }
      expect(correct).toBeGreaterThan(900)
    })

    it('should handle 10000 distinct items', () => {
      const s = new CountingSketch({ width: 5000, depth: 5 })
      for (let i = 0; i < 10000; i++) {
        s.update(`item-${i}`, 1)
      }
      expect(s.isEmpty()).toBe(false)
    })

    it('should handle mixed high and low frequency items', () => {
      sketch.update('heavy', 1000)
      for (let i = 0; i < 100; i++) {
        sketch.update(`light-${i}`, 1)
      }
      expect(sketch.estimate('heavy')).toBeGreaterThanOrEqual(1000)
    })

    it('should handle batch updates to multiple items', () => {
      const items = ['a', 'b', 'c', 'd', 'e']
      for (let round = 0; round < 100; round++) {
        for (const item of items) {
          sketch.update(item, 1)
        }
      }
      for (const item of items) {
        expect(sketch.estimate(item)).toBeGreaterThanOrEqual(100)
      }
    })

    it('should maintain reasonable accuracy with many collisions', () => {
      const s = new CountingSketch({ width: 10, depth: 3 })
      s.update('target', 50)
      let targetEstimate = s.estimate('target')
      expect(targetEstimate).toBeGreaterThanOrEqual(50)
    })

    it('should handle rapid sequential updates', () => {
      const s = new CountingSketch({ width: 100 })
      for (let i = 0; i < 5000; i++) {
        s.update(`item-${i % 50}`, 1)
      }
      expect(s.isEmpty()).toBe(false)
    })
  })

  describe('negative counts', () => {
    it('should handle single negative count', () => {
      sketch.update('item', -5)
      const est = sketch.estimate('item')
      expect(typeof est).toBe('number')
    })

    it('should handle mixed positive and negative counts', () => {
      sketch.update('item', 20)
      sketch.update('item', -5)
      const est = sketch.estimate('item')
      expect(est).toBeGreaterThanOrEqual(15)
    })

    it('should handle negative count making estimate negative', () => {
      sketch.update('item', -10)
      const est = sketch.estimate('item')
      expect(typeof est).toBe('number')
    })

    it('should handle positive then large negative count', () => {
      sketch.update('item', 5)
      sketch.update('item', -100)
      const est = sketch.estimate('item')
      expect(typeof est).toBe('number')
    })

    it('should handle alternating positive and negative counts', () => {
      sketch.update('item', 10)
      sketch.update('item', -3)
      sketch.update('item', 5)
      sketch.update('item', -2)
      const est = sketch.estimate('item')
      expect(est).toBeGreaterThanOrEqual(10)
    })

    it('should track totalItemCount with negative counts', () => {
      sketch.update('item', 10)
      sketch.update('item', -3)
      const stats = sketch.getStatistics()
      expect(stats.totalItemCount).toBe(13)
    })
  })

  describe('statistics', () => {
    it('should return initial statistics', () => {
      const stats = sketch.getStatistics()
      expect(stats.updates).toBe(0)
      expect(stats.queries).toBe(0)
      expect(stats.merges).toBe(0)
      expect(stats.totalItemCount).toBe(0)
    })

    it('should track updates', () => {
      sketch.update('a', 1)
      sketch.update('b', 2)
      expect(sketch.getStatistics().updates).toBe(2)
    })

    it('should track queries', () => {
      sketch.estimate('a')
      sketch.estimate('b')
      sketch.estimate('c')
      expect(sketch.getStatistics().queries).toBe(3)
    })

    it('should track totalItemCount', () => {
      sketch.update('a', 5)
      sketch.update('b', 3)
      expect(sketch.getStatistics().totalItemCount).toBe(8)
    })

    it('should return a copy of statistics', () => {
      const stats1 = sketch.getStatistics()
      sketch.update('a', 5)
      const stats2 = sketch.getStatistics()
      expect(stats1.updates).toBe(0)
      expect(stats2.updates).toBe(1)
    })
  })

  describe('serialization', () => {
    it('should serialize to JSON', () => {
      sketch.update('item', 5)
      const json = sketch.toJSON()
      expect(json.width).toBe(sketch.width)
      expect(json.depth).toBe(sketch.depth)
      expect(json.hashFunctions).toBe(sketch.hashFunctionCount)
      expect(json.table).toHaveLength(sketch.depth)
    })

    it('should serialize empty sketch', () => {
      const json = sketch.toJSON()
      expect(json.statistics.totalItemCount).toBe(0)
      for (const row of json.table) {
        for (const val of row) {
          expect(val).toBe(0)
        }
      }
    })

    it('should serialize with correct table dimensions', () => {
      const s = new CountingSketch({ width: 50, depth: 3 })
      const json = s.toJSON()
      expect(json.table).toHaveLength(3)
      for (const row of json.table) {
        expect(row).toHaveLength(50)
      }
    })

    it('should restore from JSON', () => {
      sketch.update('item', 5)
      const json = sketch.toJSON()
      const restored = CountingSketch.fromJSON<string>(json)
      expect(restored.width).toBe(sketch.width)
      expect(restored.depth).toBe(sketch.depth)
      expect(restored.estimate('item')).toBeGreaterThanOrEqual(5)
    })

    it('should restore empty sketch from JSON', () => {
      const json = sketch.toJSON()
      const restored = CountingSketch.fromJSON<string>(json)
      expect(restored.isEmpty()).toBe(true)
    })

    it('should preserve estimates through round-trip', () => {
      sketch.update('a', 10)
      sketch.update('b', 20)
      const estA = sketch.estimate('a')
      const estB = sketch.estimate('b')
      const json = sketch.toJSON()
      const restored = CountingSketch.fromJSON<string>(json)
      expect(restored.estimate('a')).toBe(estA)
      expect(restored.estimate('b')).toBe(estB)
    })

    it('should preserve statistics through round-trip', () => {
      sketch.update('a', 5)
      sketch.update('b', 3)
      const stats = sketch.getStatistics()
      const json = sketch.toJSON()
      const restored = CountingSketch.fromJSON<string>(json)
      const restoredStats = restored.getStatistics()
      expect(restoredStats.updates).toBe(stats.updates)
      expect(restoredStats.totalItemCount).toBe(stats.totalItemCount)
    })

    it('should handle fromJSON with number type', () => {
      const numSketch = new CountingSketch<number>({ width: 50, depth: 3 })
      numSketch.update(42, 10)
      const json = numSketch.toJSON()
      const restored = CountingSketch.fromJSON<number>(json)
      expect(restored.estimate(42)).toBeGreaterThanOrEqual(10)
    })
  })

  describe('type safety', () => {
    it('should work with number type', () => {
      const s = new CountingSketch<number>()
      s.update(42, 5)
      expect(s.estimate(42)).toBeGreaterThanOrEqual(5)
    })

    it('should work with object type', () => {
      const s = new CountingSketch<{ id: number; name: string }>()
      const obj = { id: 1, name: 'test' }
      s.update(obj, 3)
      expect(s.estimate(obj)).toBeGreaterThanOrEqual(3)
    })

    it('should distinguish different object instances with same value', () => {
      const s = new CountingSketch<{ id: number }>()
      s.update({ id: 1 }, 5)
      expect(s.estimate({ id: 1 })).toBeGreaterThanOrEqual(5)
    })

    it('should work with boolean type', () => {
      const s = new CountingSketch<boolean>()
      s.update(true, 10)
      s.update(false, 5)
      expect(s.estimate(true)).toBeGreaterThanOrEqual(10)
      expect(s.estimate(false)).toBeGreaterThanOrEqual(5)
    })

    it('should work with array type', () => {
      const s = new CountingSketch<number[]>()
      s.update([1, 2, 3], 7)
      expect(s.estimate([1, 2, 3])).toBeGreaterThanOrEqual(7)
    })
  })

  describe('accuracy', () => {
    it('should estimate within reasonable bounds for single item', () => {
      sketch.update('item', 100)
      const est = sketch.estimate('item')
      expect(est).toBeGreaterThanOrEqual(100)
      expect(est).toBeLessThanOrEqual(100 * 10)
    })

    it('should be more accurate with larger width', () => {
      const narrow = new CountingSketch({ width: 10, depth: 5 })
      const wide = new CountingSketch({ width: 10000, depth: 5 })
      narrow.update('item', 10)
      wide.update('item', 10)
      expect(wide.estimate('item')).toBeLessThanOrEqual(narrow.estimate('item') + 5)
    })

    it('should be more accurate with more hash functions', () => {
      const shallow = new CountingSketch({ width: 100, depth: 1, hashFunctions: 1 })
      const deep = new CountingSketch({ width: 100, depth: 7, hashFunctions: 7 })
      shallow.update('item', 10)
      deep.update('item', 10)
      expect(deep.estimate('item')).toBeLessThanOrEqual(shallow.estimate('item'))
    })

    it('should never under-estimate', () => {
      sketch.update('item', 42)
      expect(sketch.estimate('item')).toBeGreaterThanOrEqual(42)
    })

    it('should give exact count with single row', () => {
      const s = new CountingSketch({ width: 10000, depth: 1, hashFunctions: 1 })
      s.update('item', 50)
      expect(s.estimate('item')).toBe(50)
    })
  })

  describe('exports', () => {
    it('should export DEFAULT_COUNTING_SKETCH_OPTIONS', () => {
      expect(DEFAULT_COUNTING_SKETCH_OPTIONS.width).toBe(1000)
      expect(DEFAULT_COUNTING_SKETCH_OPTIONS.depth).toBe(5)
    })

    it('should use CountingSketchOptions type', () => {
      const opts: CountingSketchOptions = { width: 100, depth: 3 }
      const s = new CountingSketch(opts)
      expect(s.width).toBe(100)
      expect(s.depth).toBe(3)
    })
  })
})
