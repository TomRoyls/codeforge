import { CountingSketch } from '../src/core/counting-sketch/counting-sketch.js'
import {
  DEFAULT_COUNTING_SKETCH_OPTIONS,
} from '../src/core/counting-sketch/types.js'
import type {
  CountingSketchOptions,
} from '../src/core/counting-sketch/types.js'

// ─── Constructor ────────────────────────────────────────────────────────

describe('CountingSketch', () => {
  describe('constructor', () => {
    it('creates sketch with default options', () => {
      const sketch = new CountingSketch()
      expect(sketch.width).toBe(DEFAULT_COUNTING_SKETCH_OPTIONS.width)
      expect(sketch.depth).toBe(DEFAULT_COUNTING_SKETCH_OPTIONS.depth)
      expect(sketch.hashFunctionCount).toBe(DEFAULT_COUNTING_SKETCH_OPTIONS.hashFunctions)
    })

    it('creates sketch with custom width', () => {
      const sketch = new CountingSketch({ width: 500 })
      expect(sketch.width).toBe(500)
    })

    it('creates sketch with custom depth', () => {
      const sketch = new CountingSketch({ depth: 3 })
      expect(sketch.depth).toBe(3)
    })

    it('creates sketch with custom hashFunctions', () => {
      const sketch = new CountingSketch({ hashFunctions: 7 })
      expect(sketch.hashFunctionCount).toBe(7)
    })

    it('creates sketch with all custom options', () => {
      const sketch = new CountingSketch({ width: 100, depth: 3, hashFunctions: 4 })
      expect(sketch.width).toBe(100)
      expect(sketch.depth).toBe(3)
      expect(sketch.hashFunctionCount).toBe(4)
    })

    it('defaults hashFunctions to depth when not specified', () => {
      const sketch = new CountingSketch({ depth: 8 })
      expect(sketch.hashFunctionCount).toBe(8)
    })

    it('clamps width to minimum of 1', () => {
      const sketch = new CountingSketch({ width: 0 })
      expect(sketch.width).toBe(1)
    })

    it('clamps negative width to 1', () => {
      const sketch = new CountingSketch({ width: -10 })
      expect(sketch.width).toBe(1)
    })

    it('clamps depth to minimum of 1', () => {
      const sketch = new CountingSketch({ depth: 0 })
      expect(sketch.depth).toBe(1)
    })

    it('clamps negative depth to 1', () => {
      const sketch = new CountingSketch({ depth: -5 })
      expect(sketch.depth).toBe(1)
    })

    it('clamps hashFunctions to minimum of 1', () => {
      const sketch = new CountingSketch({ hashFunctions: 0, depth: 3 })
      expect(sketch.hashFunctionCount).toBe(1)
    })

    it('creates an empty sketch', () => {
      const sketch = new CountingSketch()
      expect(sketch.isEmpty()).toBe(true)
    })

    it('initializes statistics to zeros', () => {
      const sketch = new CountingSketch()
      const stats = sketch.getStatistics()
      expect(stats.updates).toBe(0)
      expect(stats.queries).toBe(0)
      expect(stats.merges).toBe(0)
      expect(stats.totalItemCount).toBe(0)
    })
  })

  // ─── Default Options ──────────────────────────────────────────────────

  describe('DEFAULT_COUNTING_SKETCH_OPTIONS', () => {
    it('has width 1000', () => {
      expect(DEFAULT_COUNTING_SKETCH_OPTIONS.width).toBe(1000)
    })

    it('has depth 5', () => {
      expect(DEFAULT_COUNTING_SKETCH_OPTIONS.depth).toBe(5)
    })

    it('has hashFunctions 5', () => {
      expect(DEFAULT_COUNTING_SKETCH_OPTIONS.hashFunctions).toBe(5)
    })
  })

  // ─── update ───────────────────────────────────────────────────────────

  describe('update', () => {
    it('adds a single item with default count of 1', () => {
      const sketch = new CountingSketch()
      sketch.update('hello')
      expect(sketch.isEmpty()).toBe(false)
      expect(sketch.estimate('hello')).toBeGreaterThanOrEqual(1)
    })

    it('adds item with explicit count', () => {
      const sketch = new CountingSketch()
      sketch.update('x', 5)
      expect(sketch.estimate('x')).toBeGreaterThanOrEqual(5)
    })

    it('updates the same item multiple times', () => {
      const sketch = new CountingSketch()
      sketch.update('a')
      sketch.update('a')
      sketch.update('a')
      expect(sketch.estimate('a')).toBeGreaterThanOrEqual(3)
    })

    it('handles negative counts', () => {
      const sketch = new CountingSketch()
      sketch.update('b', 10)
      sketch.update('b', -3)
      expect(sketch.estimate('b')).toBeGreaterThanOrEqual(7)
    })

    it('handles zero count', () => {
      const sketch = new CountingSketch()
      sketch.update('z', 0)
      // Table should still have data flag set
      expect(sketch.isEmpty()).toBe(false)
    })

    it('increments updates statistic', () => {
      const sketch = new CountingSketch()
      sketch.update('a')
      sketch.update('b')
      sketch.update('c')
      expect(sketch.getStatistics().updates).toBe(3)
    })

    it('increments totalItemCount by absolute value of count', () => {
      const sketch = new CountingSketch()
      sketch.update('a', 5)
      sketch.update('b', -3)
      expect(sketch.getStatistics().totalItemCount).toBe(8)
    })

    it('sets hasData to true after first update', () => {
      const sketch = new CountingSketch()
      expect(sketch.isEmpty()).toBe(true)
      sketch.update('x')
      expect(sketch.isEmpty()).toBe(false)
    })

    it('handles numeric items', () => {
      const sketch = new CountingSketch<number>()
      sketch.update(42, 1)
      expect(sketch.estimate(42)).toBeGreaterThanOrEqual(1)
    })

    it('handles object items', () => {
      const sketch = new CountingSketch<{ id: number }>()
      const item = { id: 1 }
      sketch.update(item)
      expect(sketch.estimate(item)).toBeGreaterThanOrEqual(1)
    })
  })

  // ─── estimate ─────────────────────────────────────────────────────────

  describe('estimate', () => {
    it('returns 0 for item never added to empty sketch', () => {
      const sketch = new CountingSketch()
      expect(sketch.estimate('never-added')).toBe(0)
    })

    it('returns approximate count for a single item', () => {
      const sketch = new CountingSketch()
      sketch.update('hello', 100)
      const est = sketch.estimate('hello')
      expect(est).toBeGreaterThanOrEqual(100)
      // Count-Min Sketch can overestimate but not underestimate
    })

    it('does not underestimate for repeated updates', () => {
      const sketch = new CountingSketch({ width: 1000, depth: 5 })
      for (let i = 0; i < 50; i++) {
        sketch.update('target')
      }
      expect(sketch.estimate('target')).toBeGreaterThanOrEqual(50)
    })

    it('returns higher estimate for item added more times', () => {
      const sketch = new CountingSketch()
      sketch.update('a', 10)
      sketch.update('b', 50)
      // 'a' should have a lower or equal estimate than 'b'
      // This is a probabilistic check but with high width it should hold
      expect(sketch.estimate('b')).toBeGreaterThanOrEqual(sketch.estimate('a'))
    })

    it('increments queries statistic', () => {
      const sketch = new CountingSketch()
      sketch.estimate('x')
      sketch.estimate('y')
      sketch.estimate('z')
      expect(sketch.getStatistics().queries).toBe(3)
    })

    it('returns 0 for estimate on empty sketch', () => {
      const sketch = new CountingSketch()
      expect(sketch.estimate('anything')).toBe(0)
    })

    it('handles estimate after negative updates bringing count to zero', () => {
      const sketch = new CountingSketch()
      sketch.update('neg', 5)
      sketch.update('neg', -5)
      // estimate should be near 0 but could be positive due to hash collisions
      // it should definitely be <= 5 + some small error
      expect(sketch.estimate('neg')).toBeLessThanOrEqual(10)
    })
  })

  // ─── merge ────────────────────────────────────────────────────────────

  describe('merge', () => {
    it('merges two sketches with same dimensions', () => {
      const a = new CountingSketch({ width: 100, depth: 3 })
      const b = new CountingSketch({ width: 100, depth: 3 })
      a.update('x', 5)
      b.update('x', 10)
      const merged = a.merge(b)
      expect(merged.estimate('x')).toBeGreaterThanOrEqual(15)
    })

    it('returns a new sketch without modifying originals', () => {
      const a = new CountingSketch({ width: 100, depth: 3 })
      const b = new CountingSketch({ width: 100, depth: 3 })
      a.update('x', 5)
      b.update('x', 10)
      const merged = a.merge(b)
      expect(merged).not.toBe(a)
      expect(merged).not.toBe(b)
      // Original estimates should be unchanged
      expect(a.estimate('x')).toBeGreaterThanOrEqual(5)
      expect(b.estimate('x')).toBeGreaterThanOrEqual(10)
    })

    it('throws when merging sketches with different widths', () => {
      const a = new CountingSketch({ width: 100 })
      const b = new CountingSketch({ width: 200 })
      expect(() => a.merge(b)).toThrow('Cannot merge sketches with different widths')
    })

    it('throws when merging sketches with different depths', () => {
      const a = new CountingSketch({ depth: 3 })
      const b = new CountingSketch({ depth: 5 })
      expect(() => a.merge(b)).toThrow('Cannot merge sketches with different depths')
    })

    it('throws when merging sketches with different hashFunction counts', () => {
      const a = new CountingSketch({ depth: 5, hashFunctions: 3 })
      const b = new CountingSketch({ depth: 5, hashFunctions: 7 })
      expect(() => a.merge(b)).toThrow('Cannot merge sketches with different hash function counts')
    })

    it('merges empty sketches', () => {
      const a = new CountingSketch({ width: 50, depth: 2 })
      const b = new CountingSketch({ width: 50, depth: 2 })
      const merged = a.merge(b)
      expect(merged.isEmpty()).toBe(true)
    })

    it('merges sketch with data into empty sketch', () => {
      const a = new CountingSketch({ width: 100, depth: 3 })
      const b = new CountingSketch({ width: 100, depth: 3 })
      b.update('y', 20)
      const merged = a.merge(b)
      expect(merged.isEmpty()).toBe(false)
      expect(merged.estimate('y')).toBeGreaterThanOrEqual(20)
    })

    it('combines statistics from both sketches', () => {
      const a = new CountingSketch({ width: 100, depth: 3 })
      const b = new CountingSketch({ width: 100, depth: 3 })
      a.update('a', 1)
      a.update('b', 2)
      b.update('c', 3)
      const merged = a.merge(b)
      expect(merged.getStatistics().updates).toBe(3)
      expect(merged.getStatistics().totalItemCount).toBe(6)
    })

    it('increments merges count on both result and source', () => {
      const a = new CountingSketch({ width: 100, depth: 3 })
      const b = new CountingSketch({ width: 100, depth: 3 })
      a.update('x')
      const merged = a.merge(b)
      expect(merged.getStatistics().merges).toBe(1)
      expect(a.getStatistics().merges).toBe(1)
    })

    it('preserves dimensions in merged sketch', () => {
      const a = new CountingSketch({ width: 100, depth: 3, hashFunctions: 3 })
      const b = new CountingSketch({ width: 100, depth: 3, hashFunctions: 3 })
      const merged = a.merge(b)
      expect(merged.width).toBe(100)
      expect(merged.depth).toBe(3)
      expect(merged.hashFunctionCount).toBe(3)
    })

    it('handles chained merges', () => {
      const a = new CountingSketch({ width: 100, depth: 3, hashFunctions: 3 })
      const b = new CountingSketch({ width: 100, depth: 3, hashFunctions: 3 })
      const c = new CountingSketch({ width: 100, depth: 3, hashFunctions: 3 })
      a.update('x', 5)
      b.update('x', 10)
      c.update('x', 15)
      const merged = a.merge(b).merge(c)
      expect(merged.estimate('x')).toBeGreaterThanOrEqual(30)
    })
  })

  // ─── clear ────────────────────────────────────────────────────────────

  describe('clear', () => {
    it('resets sketch to empty state', () => {
      const sketch = new CountingSketch()
      sketch.update('a', 100)
      expect(sketch.isEmpty()).toBe(false)
      sketch.clear()
      expect(sketch.isEmpty()).toBe(true)
    })

    it('resets estimate to 0 after clear', () => {
      const sketch = new CountingSketch()
      sketch.update('a', 100)
      sketch.clear()
      expect(sketch.estimate('a')).toBe(0)
    })

    it('resets statistics to zeros', () => {
      const sketch = new CountingSketch()
      sketch.update('a')
      sketch.estimate('a')
      sketch.clear()
      const stats = sketch.getStatistics()
      expect(stats.updates).toBe(0)
      expect(stats.queries).toBe(0)
      expect(stats.merges).toBe(0)
      expect(stats.totalItemCount).toBe(0)
    })

    it('allows updates after clearing', () => {
      const sketch = new CountingSketch()
      sketch.update('a', 100)
      sketch.clear()
      sketch.update('a', 50)
      expect(sketch.estimate('a')).toBeGreaterThanOrEqual(50)
    })

    it('preserves dimensions after clearing', () => {
      const sketch = new CountingSketch({ width: 100, depth: 3, hashFunctions: 2 })
      sketch.update('x')
      sketch.clear()
      expect(sketch.width).toBe(100)
      expect(sketch.depth).toBe(3)
      expect(sketch.hashFunctionCount).toBe(2)
    })
  })

  // ─── isEmpty ──────────────────────────────────────────────────────────

  describe('isEmpty', () => {
    it('returns true for new sketch', () => {
      expect(new CountingSketch().isEmpty()).toBe(true)
    })

    it('returns false after update', () => {
      const sketch = new CountingSketch()
      sketch.update('x')
      expect(sketch.isEmpty()).toBe(false)
    })

    it('returns true after clear', () => {
      const sketch = new CountingSketch()
      sketch.update('x')
      sketch.clear()
      expect(sketch.isEmpty()).toBe(true)
    })

    it('returns true after estimate on empty (no side effect)', () => {
      const sketch = new CountingSketch()
      sketch.estimate('never')
      expect(sketch.isEmpty()).toBe(true)
    })
  })

  // ─── Properties (width, depth, hashFunctionCount) ─────────────────────

  describe('properties', () => {
    it('width returns configured value', () => {
      const sketch = new CountingSketch({ width: 42 })
      expect(sketch.width).toBe(42)
    })

    it('depth returns configured value', () => {
      const sketch = new CountingSketch({ depth: 7 })
      expect(sketch.depth).toBe(7)
    })

    it('hashFunctionCount returns configured value', () => {
      const sketch = new CountingSketch({ hashFunctions: 9, depth: 10 })
      expect(sketch.hashFunctionCount).toBe(9)
    })

    it('properties are read-only (not settable)', () => {
      const sketch = new CountingSketch({ width: 100, depth: 3, hashFunctions: 3 })
      // TypeScript will prevent assignment at compile time
      // but we verify they remain constant
      expect(sketch.width).toBe(100)
      expect(sketch.depth).toBe(3)
      expect(sketch.hashFunctionCount).toBe(3)
    })
  })

  // ─── getStatistics ────────────────────────────────────────────────────

  describe('getStatistics', () => {
    it('returns a copy of statistics', () => {
      const sketch = new CountingSketch()
      const stats1 = sketch.getStatistics()
      const stats2 = sketch.getStatistics()
      expect(stats1).toEqual(stats2)
      expect(stats1).not.toBe(stats2)
    })

    it('tracks updates count accurately', () => {
      const sketch = new CountingSketch()
      for (let i = 0; i < 10; i++) {
        sketch.update(`item-${i}`)
      }
      expect(sketch.getStatistics().updates).toBe(10)
    })

    it('tracks queries count accurately', () => {
      const sketch = new CountingSketch()
      for (let i = 0; i < 5; i++) {
        sketch.estimate(`item-${i}`)
      }
      expect(sketch.getStatistics().queries).toBe(5)
    })

    it('tracks totalItemCount with positive counts', () => {
      const sketch = new CountingSketch()
      sketch.update('a', 3)
      sketch.update('b', 7)
      expect(sketch.getStatistics().totalItemCount).toBe(10)
    })

    it('tracks totalItemCount with negative counts using absolute value', () => {
      const sketch = new CountingSketch()
      sketch.update('a', -5)
      expect(sketch.getStatistics().totalItemCount).toBe(5)
    })

    it('tracks merges count', () => {
      const a = new CountingSketch({ width: 50, depth: 2, hashFunctions: 2 })
      const b = new CountingSketch({ width: 50, depth: 2, hashFunctions: 2 })
      a.update('x')
      a.merge(b)
      expect(a.getStatistics().merges).toBe(1)
    })
  })

  // ─── toJSON / fromJSON ────────────────────────────────────────────────

  describe('toJSON', () => {
    it('serializes empty sketch', () => {
      const sketch = new CountingSketch({ width: 10, depth: 2, hashFunctions: 2 })
      const json = sketch.toJSON()
      expect(json.width).toBe(10)
      expect(json.depth).toBe(2)
      expect(json.hashFunctions).toBe(2)
      expect(json.table).toHaveLength(2)
      expect(json.table[0]).toHaveLength(10)
      expect(json.statistics.updates).toBe(0)
    })

    it('serializes sketch with data', () => {
      const sketch = new CountingSketch({ width: 10, depth: 2, hashFunctions: 2 })
      sketch.update('hello', 5)
      const json = sketch.toJSON()
      expect(json.statistics.updates).toBe(1)
      expect(json.statistics.totalItemCount).toBe(5)
    })

    it('table contains number arrays (not Int32Arrays)', () => {
      const sketch = new CountingSketch({ width: 10, depth: 2, hashFunctions: 2 })
      const json = sketch.toJSON()
      expect(Array.isArray(json.table[0])).toBe(true)
      expect(Array.isArray(json.table[1])).toBe(true)
    })

    it('includes a copy of statistics', () => {
      const sketch = new CountingSketch({ width: 10, depth: 2, hashFunctions: 2 })
      sketch.update('x')
      const json = sketch.toJSON()
      expect(json.statistics).toEqual(sketch.getStatistics())
      expect(json.statistics).not.toBe(sketch.getStatistics())
    })
  })

  describe('fromJSON', () => {
    it('reconstructs a sketch from JSON', () => {
      const original = new CountingSketch({ width: 10, depth: 2, hashFunctions: 2 })
      original.update('test', 7)
      const json = original.toJSON()
      const restored = CountingSketch.fromJSON<string>(json)
      expect(restored.width).toBe(10)
      expect(restored.depth).toBe(2)
      expect(restored.hashFunctionCount).toBe(2)
      expect(restored.estimate('test')).toBeGreaterThanOrEqual(7)
    })

    it('preserves table data exactly', () => {
      const original = new CountingSketch({ width: 10, depth: 2, hashFunctions: 2 })
      original.update('a', 3)
      original.update('b', 8)
      const json = original.toJSON()
      const restored = CountingSketch.fromJSON<string>(json)
      // Same estimates because same table data
      expect(restored.estimate('a')).toBe(original.estimate('a'))
      expect(restored.estimate('b')).toBe(original.estimate('b'))
    })

    it('preserves statistics', () => {
      const original = new CountingSketch({ width: 10, depth: 2, hashFunctions: 2 })
      original.update('x', 5)
      original.estimate('x')
      const json = original.toJSON()
      const restored = CountingSketch.fromJSON<string>(json)
      expect(restored.getStatistics().updates).toBe(1)
      expect(restored.getStatistics().queries).toBe(1)
      expect(restored.getStatistics().totalItemCount).toBe(5)
    })

    it('round-trip preserves data fidelity', () => {
      const original = new CountingSketch({ width: 100, depth: 3, hashFunctions: 3 })
      for (let i = 0; i < 20; i++) {
        original.update(`item-${i}`, i + 1)
      }
      const json = original.toJSON()
      const restored = CountingSketch.fromJSON<string>(json)
      for (let i = 0; i < 20; i++) {
        expect(restored.estimate(`item-${i}`)).toBe(original.estimate(`item-${i}`))
      }
    })

    it('sets hasData based on totalItemCount', () => {
      const original = new CountingSketch({ width: 10, depth: 2, hashFunctions: 2 })
      original.update('x', 1)
      const json = original.toJSON()
      const restored = CountingSketch.fromJSON<string>(json)
      expect(restored.isEmpty()).toBe(false)
    })

    it('restores empty sketch correctly', () => {
      const original = new CountingSketch({ width: 10, depth: 2, hashFunctions: 2 })
      const json = original.toJSON()
      const restored = CountingSketch.fromJSON<string>(json)
      expect(restored.isEmpty()).toBe(true)
    })
  })

  // ─── Type Parameterization ────────────────────────────────────────────

  describe('type parameterization', () => {
    it('works with string items', () => {
      const sketch = new CountingSketch<string>()
      sketch.update('hello')
      sketch.update('world')
      expect(sketch.estimate('hello')).toBeGreaterThanOrEqual(1)
      expect(sketch.estimate('world')).toBeGreaterThanOrEqual(1)
    })

    it('works with number items', () => {
      const sketch = new CountingSketch<number>()
      sketch.update(42)
      sketch.update(100)
      expect(sketch.estimate(42)).toBeGreaterThanOrEqual(1)
      expect(sketch.estimate(100)).toBeGreaterThanOrEqual(1)
    })

    it('works with boolean items', () => {
      const sketch = new CountingSketch<boolean>()
      sketch.update(true)
      sketch.update(false)
      expect(sketch.estimate(true)).toBeGreaterThanOrEqual(1)
      expect(sketch.estimate(false)).toBeGreaterThanOrEqual(1)
    })

    it('works with object items using same reference', () => {
      interface Point { x: number; y: number }
      const sketch = new CountingSketch<Point>()
      const p1: Point = { x: 1, y: 2 }
      sketch.update(p1, 10)
      expect(sketch.estimate(p1)).toBeGreaterThanOrEqual(10)
    })

    it('works with null items', () => {
      const sketch = new CountingSketch<null>()
      sketch.update(null)
      expect(sketch.estimate(null)).toBeGreaterThanOrEqual(1)
    })

    it('distinct objects with same values serialize identically', () => {
      const sketch = new CountingSketch<{ id: number }>()
      sketch.update({ id: 1 }, 5)
      // Since JSON.stringify is used, { id: 1 } objects should hash the same
      expect(sketch.estimate({ id: 1 })).toBeGreaterThanOrEqual(5)
    })
  })

  // ─── Accuracy ─────────────────────────────────────────────────────────

  describe('accuracy', () => {
    it('does not underestimate single item count', () => {
      const sketch = new CountingSketch({ width: 1000, depth: 5 })
      sketch.update('target', 500)
      expect(sketch.estimate('target')).toBeGreaterThanOrEqual(500)
    })

    it('maintains accuracy with many distinct items', () => {
      const sketch = new CountingSketch({ width: 2000, depth: 7 })
      // Add many distinct items
      for (let i = 0; i < 100; i++) {
        sketch.update(`item-${i}`, 1)
      }
      // Check a specific item
      expect(sketch.estimate('item-50')).toBeGreaterThanOrEqual(1)
      // The estimate should not be wildly off
      expect(sketch.estimate('item-50')).toBeLessThanOrEqual(50)
    })

    it('estimate is at least the true count (no underestimation)', () => {
      const sketch = new CountingSketch({ width: 500, depth: 5 })
      const count = 42
      sketch.update('precise', count)
      expect(sketch.estimate('precise')).toBeGreaterThanOrEqual(count)
    })

    it('handles large counts without overflow in Int32Array', () => {
      const sketch = new CountingSketch({ width: 100, depth: 3 })
      sketch.update('big', 100000)
      expect(sketch.estimate('big')).toBeGreaterThanOrEqual(100000)
    })

    it('provides better accuracy with larger width', () => {
      const narrow = new CountingSketch({ width: 10, depth: 3 })
      const wide = new CountingSketch({ width: 10000, depth: 3 })
      // Add many items to both
      for (let i = 0; i < 1000; i++) {
        narrow.update(`item-${i}`)
        wide.update(`item-${i}`)
      }
      // Wide sketch should estimate 'item-0' more accurately
      const narrowEst = narrow.estimate('item-0')
      const wideEst = wide.estimate('item-0')
      // Both should be >= 1 (true count)
      expect(narrowEst).toBeGreaterThanOrEqual(1)
      expect(wideEst).toBeGreaterThanOrEqual(1)
      // Wide should be closer to 1 (less overestimation)
      expect(wideEst).toBeLessThanOrEqual(narrowEst)
    })
  })

  // ─── Edge Cases ───────────────────────────────────────────────────────

  describe('edge cases', () => {
    it('handles update with count of 0', () => {
      const sketch = new CountingSketch()
      sketch.update('zero', 0)
      expect(sketch.isEmpty()).toBe(false)
      // Count should be ~0 but table was touched
    })

    it('handles very long string keys', () => {
      const sketch = new CountingSketch()
      const longKey = 'a'.repeat(10000)
      sketch.update(longKey)
      expect(sketch.estimate(longKey)).toBeGreaterThanOrEqual(1)
    })

    it('handles empty string key', () => {
      const sketch = new CountingSketch()
      sketch.update('')
      expect(sketch.estimate('')).toBeGreaterThanOrEqual(1)
    })

    it('handles update then clear then update', () => {
      const sketch = new CountingSketch()
      sketch.update('a', 100)
      sketch.clear()
      sketch.update('a', 50)
      expect(sketch.estimate('a')).toBeGreaterThanOrEqual(50)
      expect(sketch.getStatistics().updates).toBe(1)
      expect(sketch.getStatistics().totalItemCount).toBe(50)
    })

    it('handles merge of two sketches with overlapping items', () => {
      const opts: CountingSketchOptions = { width: 100, depth: 3, hashFunctions: 3 }
      const a = new CountingSketch(opts)
      const b = new CountingSketch(opts)
      a.update('shared', 10)
      b.update('shared', 20)
      a.update('only-a', 5)
      b.update('only-b', 15)
      const merged = a.merge(b)
      expect(merged.estimate('shared')).toBeGreaterThanOrEqual(30)
      expect(merged.estimate('only-a')).toBeGreaterThanOrEqual(5)
      expect(merged.estimate('only-b')).toBeGreaterThanOrEqual(15)
    })

    it('handles sketch with width=1', () => {
      const sketch = new CountingSketch({ width: 1, depth: 1, hashFunctions: 1 })
      sketch.update('x', 10)
      expect(sketch.estimate('x')).toBeGreaterThanOrEqual(10)
    })

    it('handles sketch with depth=1', () => {
      const sketch = new CountingSketch({ width: 100, depth: 1, hashFunctions: 1 })
      sketch.update('x', 10)
      expect(sketch.estimate('x')).toBeGreaterThanOrEqual(10)
    })

    it('handles sketch with hashFunctions=1', () => {
      const sketch = new CountingSketch({ width: 100, depth: 5, hashFunctions: 1 })
      sketch.update('x', 10)
      expect(sketch.estimate('x')).toBeGreaterThanOrEqual(10)
    })

    it('handles hashFunctions greater than depth (clamped to depth rows)', () => {
      const sketch = new CountingSketch({ width: 100, depth: 3, hashFunctions: 10 })
      sketch.update('x', 5)
      expect(sketch.estimate('x')).toBeGreaterThanOrEqual(5)
    })

    it('handles large dataset of 10000 items', () => {
      const sketch = new CountingSketch({ width: 5000, depth: 5 })
      for (let i = 0; i < 10000; i++) {
        sketch.update(`item-${i % 100}`, 1)
      }
      // Each of the 100 unique items should have count ~100
      expect(sketch.estimate('item-0')).toBeGreaterThanOrEqual(100)
      expect(sketch.getStatistics().updates).toBe(10000)
    })

    it('handles array items via JSON.stringify serialization', () => {
      const sketch = new CountingSketch<number[]>()
      sketch.update([1, 2, 3])
      expect(sketch.estimate([1, 2, 3])).toBeGreaterThanOrEqual(1)
    })

    it('multiple clear operations are safe', () => {
      const sketch = new CountingSketch()
      sketch.update('x')
      sketch.clear()
      sketch.clear()
      sketch.clear()
      expect(sketch.isEmpty()).toBe(true)
      expect(sketch.getStatistics().updates).toBe(0)
    })

    it('estimate on sketch that was updated then cleared returns 0', () => {
      const sketch = new CountingSketch()
      sketch.update('item', 999)
      sketch.clear()
      expect(sketch.estimate('item')).toBe(0)
    })

    it('toJSON and fromJSON round-trip with negative table values', () => {
      const sketch = new CountingSketch({ width: 10, depth: 2, hashFunctions: 2 })
      sketch.update('x', 10)
      sketch.update('x', -20)
      const json = sketch.toJSON()
      const restored = CountingSketch.fromJSON<string>(json)
      expect(restored.estimate('x')).toBe(sketch.estimate('x'))
    })
  })

  // ─── Statistics Tracking ──────────────────────────────────────────────

  describe('statistics tracking', () => {
    it('tracks interleaved updates and queries', () => {
      const sketch = new CountingSketch()
      sketch.update('a')
      sketch.estimate('a')
      sketch.update('b')
      sketch.estimate('b')
      sketch.estimate('a')
      const stats = sketch.getStatistics()
      expect(stats.updates).toBe(2)
      expect(stats.queries).toBe(3)
    })

    it('statistics are independent after clear', () => {
      const sketch = new CountingSketch()
      sketch.update('a', 10)
      sketch.estimate('a')
      sketch.clear()
      sketch.update('b', 5)
      const stats = sketch.getStatistics()
      expect(stats.updates).toBe(1)
      expect(stats.queries).toBe(0)
      expect(stats.totalItemCount).toBe(5)
    })

    it('merge statistics accumulate correctly across multiple merges', () => {
      const opts: CountingSketchOptions = { width: 50, depth: 2, hashFunctions: 2 }
      const a = new CountingSketch(opts)
      const b = new CountingSketch(opts)
      const c = new CountingSketch(opts)
      a.update('x', 1)
      b.update('y', 2)
      c.update('z', 3)
      const ab = a.merge(b)
      const abc = ab.merge(c)
      expect(abc.getStatistics().merges).toBe(2)
      expect(abc.getStatistics().updates).toBe(3)
      expect(abc.getStatistics().totalItemCount).toBe(6)
    })
  })
})
