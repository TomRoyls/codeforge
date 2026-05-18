import { describe, it, expect } from 'vitest'
import { CountMinSketch3 } from '../../src/core/count-min-sketch-3/index.js'

describe('CountMinSketch3', () => {
  // ─── Constructor ───

  describe('constructor', () => {
    it('creates sketch with default parameters', () => {
      const sketch = new CountMinSketch3()
      expect(sketch.estimate('anything')).toBe(0)
    })

    it('creates sketch with custom width and depth', () => {
      const sketch = new CountMinSketch3(500, 3)
      expect(sketch.estimate('test')).toBe(0)
    })

    it('creates sketch with small dimensions', () => {
      const sketch = new CountMinSketch3(10, 2)
      expect(sketch.estimate('x')).toBe(0)
    })

    it('creates sketch with large dimensions', () => {
      const sketch = new CountMinSketch3(10000, 20)
      expect(sketch.estimate('y')).toBe(0)
    })
  })

  // ─── Update ───

  describe('update', () => {
    it('updates a single item with default count', () => {
      const sketch = new CountMinSketch3()
      sketch.update('hello')
      expect(sketch.estimate('hello')).toBeGreaterThanOrEqual(1)
    })

    it('updates an item with custom count', () => {
      const sketch = new CountMinSketch3()
      sketch.update('hello', 5)
      expect(sketch.estimate('hello')).toBeGreaterThanOrEqual(5)
    })

    it('accumulates counts on repeated updates', () => {
      const sketch = new CountMinSketch3()
      sketch.update('item', 3)
      sketch.update('item', 7)
      expect(sketch.estimate('item')).toBeGreaterThanOrEqual(10)
    })

    it('handles multiple different items', () => {
      const sketch = new CountMinSketch3()
      sketch.update('a')
      sketch.update('b')
      sketch.update('c')
      expect(sketch.estimate('a')).toBeGreaterThanOrEqual(1)
      expect(sketch.estimate('b')).toBeGreaterThanOrEqual(1)
      expect(sketch.estimate('c')).toBeGreaterThanOrEqual(1)
    })

    it('handles empty string', () => {
      const sketch = new CountMinSketch3()
      sketch.update('')
      expect(sketch.estimate('')).toBeGreaterThanOrEqual(1)
    })

    it('handles unicode strings', () => {
      const sketch = new CountMinSketch3()
      sketch.update('你好世界')
      sketch.update('🎉')
      expect(sketch.estimate('你好世界')).toBeGreaterThanOrEqual(1)
      expect(sketch.estimate('🎉')).toBeGreaterThanOrEqual(1)
    })

    it('handles update with zero count', () => {
      const sketch = new CountMinSketch3()
      sketch.update('item', 0)
      expect(sketch.estimate('item')).toBeGreaterThanOrEqual(0)
    })
  })

  // ─── Estimate ───

  describe('estimate', () => {
    it('returns 0 for item never updated', () => {
      const sketch = new CountMinSketch3()
      expect(sketch.estimate('never_added')).toBe(0)
    })

    it('estimate is at least the true count', () => {
      const sketch = new CountMinSketch3(5000, 10)
      sketch.update('exact', 1)
      expect(sketch.estimate('exact')).toBeGreaterThanOrEqual(1)
    })

    it('estimate does not exceed true count plus error bound', () => {
      const sketch = new CountMinSketch3(5000, 10)
      sketch.update('target', 10)
      const est = sketch.estimate('target')
      expect(est).toBeGreaterThanOrEqual(10)
      expect(est).toBeLessThanOrEqual(10 + 100)
    })

    it('estimate for different items are independent', () => {
      const sketch = new CountMinSketch3(5000, 10)
      sketch.update('alpha', 1)
      sketch.update('beta', 100)
      expect(sketch.estimate('alpha')).toBeGreaterThanOrEqual(1)
      expect(sketch.estimate('beta')).toBeGreaterThanOrEqual(100)
    })

    it('estimate after many updates is approximately correct', () => {
      const sketch = new CountMinSketch3(2000, 8)
      for (let i = 0; i < 100; i++) {
        sketch.update('frequent', 1)
      }
      const est = sketch.estimate('frequent')
      expect(est).toBeGreaterThanOrEqual(100)
      expect(est).toBeLessThanOrEqual(200)
    })
  })

  // ─── Merge ───

  describe('merge', () => {
    it('merges two sketches of same dimensions', () => {
      const sketch1 = new CountMinSketch3(1000, 5)
      const sketch2 = new CountMinSketch3(1000, 5)
      sketch1.update('a', 3)
      sketch2.update('a', 7)
      sketch1.merge(sketch2)
      expect(sketch1.estimate('a')).toBeGreaterThanOrEqual(10)
    })

    it('merges sketches with disjoint items', () => {
      const sketch1 = new CountMinSketch3(1000, 5)
      const sketch2 = new CountMinSketch3(1000, 5)
      sketch1.update('x', 5)
      sketch2.update('y', 10)
      sketch1.merge(sketch2)
      expect(sketch1.estimate('x')).toBeGreaterThanOrEqual(5)
      expect(sketch1.estimate('y')).toBeGreaterThanOrEqual(10)
    })

    it('throws on width mismatch', () => {
      const sketch1 = new CountMinSketch3(1000, 5)
      const sketch2 = new CountMinSketch3(500, 5)
      expect(() => sketch1.merge(sketch2)).toThrow('Sketch dimensions must match for merge')
    })

    it('throws on depth mismatch', () => {
      const sketch1 = new CountMinSketch3(1000, 5)
      const sketch2 = new CountMinSketch3(1000, 3)
      expect(() => sketch1.merge(sketch2)).toThrow('Sketch dimensions must match for merge')
    })

    it('merge of empty sketches does nothing harmful', () => {
      const sketch1 = new CountMinSketch3(100, 3)
      const sketch2 = new CountMinSketch3(100, 3)
      sketch1.merge(sketch2)
      expect(sketch1.estimate('anything')).toBe(0)
    })
  })

  // ─── Reset ───

  describe('reset', () => {
    it('resets all counts to zero', () => {
      const sketch = new CountMinSketch3()
      sketch.update('a', 10)
      sketch.update('b', 20)
      sketch.reset()
      expect(sketch.estimate('a')).toBe(0)
      expect(sketch.estimate('b')).toBe(0)
    })

    it('allows updates after reset', () => {
      const sketch = new CountMinSketch3()
      sketch.update('before', 100)
      sketch.reset()
      sketch.update('after', 5)
      expect(sketch.estimate('before')).toBe(0)
      expect(sketch.estimate('after')).toBeGreaterThanOrEqual(5)
    })

    it('reset on fresh sketch does nothing harmful', () => {
      const sketch = new CountMinSketch3()
      sketch.reset()
      expect(sketch.estimate('x')).toBe(0)
    })
  })

  // ─── Edge Cases ───

  describe('edge cases', () => {
    it('handles long strings', () => {
      const sketch = new CountMinSketch3()
      const longStr = 'a'.repeat(10000)
      sketch.update(longStr)
      expect(sketch.estimate(longStr)).toBeGreaterThanOrEqual(1)
    })

    it('handles special characters', () => {
      const sketch = new CountMinSketch3()
      sketch.update('!@#$%^&*()')
      sketch.update('\n\t\r')
      expect(sketch.estimate('!@#$%^&*()')).toBeGreaterThanOrEqual(1)
    })

    it('handles very large count values', () => {
      const sketch = new CountMinSketch3()
      sketch.update('big', 1000000)
      expect(sketch.estimate('big')).toBeGreaterThanOrEqual(1000000)
    })

    it('stress test with many items', () => {
      const sketch = new CountMinSketch3(5000, 10)
      for (let i = 0; i < 1000; i++) {
        sketch.update(`item_${i}`, 1)
      }
      for (let i = 0; i < 1000; i++) {
        expect(sketch.estimate(`item_${i}`)).toBeGreaterThanOrEqual(1)
      }
    })
  })
})
