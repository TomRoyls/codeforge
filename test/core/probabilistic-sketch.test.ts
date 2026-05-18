import { describe, it, expect } from 'vitest'
import { ProbabilisticSketch } from '../../src/core/probabilistic-sketch/index.js'

describe('ProbabilisticSketch', () => {
  // ─── Constructor ───

  describe('constructor', () => {
    it('creates sketch with default parameters', () => {
      const sketch = new ProbabilisticSketch()
      expect(sketch.itemCount).toBe(0)
    })

    it('creates sketch with custom width and depth', () => {
      const sketch = new ProbabilisticSketch(500, 3)
      expect(sketch.itemCount).toBe(0)
    })

    it('creates sketch with small dimensions', () => {
      const sketch = new ProbabilisticSketch(10, 2)
      expect(sketch.itemCount).toBe(0)
    })

    it('creates sketch with large dimensions', () => {
      const sketch = new ProbabilisticSketch(10000, 20)
      expect(sketch.itemCount).toBe(0)
    })
  })

  // ─── Add ───

  describe('add', () => {
    it('adds a single string item', () => {
      const sketch = new ProbabilisticSketch()
      sketch.add('hello')
      expect(sketch.itemCount).toBe(1)
    })

    it('adds a single numeric item', () => {
      const sketch = new ProbabilisticSketch()
      sketch.add(42)
      expect(sketch.itemCount).toBe(1)
    })

    it('adds with custom count', () => {
      const sketch = new ProbabilisticSketch()
      sketch.add('item', 5)
      expect(sketch.itemCount).toBe(5)
    })

    it('accumulates item count on repeated adds', () => {
      const sketch = new ProbabilisticSketch()
      sketch.add('a', 3)
      sketch.add('b', 7)
      expect(sketch.itemCount).toBe(10)
    })

    it('handles empty string', () => {
      const sketch = new ProbabilisticSketch()
      sketch.add('')
      expect(sketch.itemCount).toBe(1)
    })

    it('handles zero as numeric input', () => {
      const sketch = new ProbabilisticSketch()
      sketch.add(0)
      expect(sketch.itemCount).toBe(1)
    })

    it('handles negative numbers', () => {
      const sketch = new ProbabilisticSketch()
      sketch.add(-5)
      expect(sketch.itemCount).toBe(1)
    })
  })

  // ─── Estimate ───

  describe('estimate', () => {
    it('returns 0 for item never added', () => {
      const sketch = new ProbabilisticSketch()
      expect(sketch.estimate('never_added')).toBe(0)
    })

    it('estimate is at least the true count for string', () => {
      const sketch = new ProbabilisticSketch(5000, 10)
      sketch.add('target', 10)
      expect(sketch.estimate('target')).toBeGreaterThanOrEqual(10)
    })

    it('estimate is at least the true count for number', () => {
      const sketch = new ProbabilisticSketch(5000, 10)
      sketch.add(42, 5)
      expect(sketch.estimate(42)).toBeGreaterThanOrEqual(5)
    })

    it('estimate after many adds is approximately correct', () => {
      const sketch = new ProbabilisticSketch(2000, 8)
      for (let i = 0; i < 100; i++) {
        sketch.add('frequent', 1)
      }
      const est = sketch.estimate('frequent')
      expect(est).toBeGreaterThanOrEqual(100)
      expect(est).toBeLessThanOrEqual(300)
    })

    it('estimates for different items are independent', () => {
      const sketch = new ProbabilisticSketch(5000, 10)
      sketch.add('alpha', 1)
      sketch.add('beta', 100)
      expect(sketch.estimate('alpha')).toBeGreaterThanOrEqual(1)
      expect(sketch.estimate('beta')).toBeGreaterThanOrEqual(100)
    })

    it('estimate does not exceed true count by too much', () => {
      const sketch = new ProbabilisticSketch(5000, 10)
      sketch.add('precise', 10)
      expect(sketch.estimate('precise')).toBeLessThanOrEqual(200)
    })
  })

  // ─── Merge ───

  describe('merge', () => {
    it('merges two sketches of same dimensions', () => {
      const sketch1 = new ProbabilisticSketch(1000, 5)
      const sketch2 = new ProbabilisticSketch(1000, 5)
      sketch1.add('a', 3)
      sketch2.add('a', 7)
      sketch1.merge(sketch2)
      expect(sketch1.estimate('a')).toBeGreaterThanOrEqual(10)
      expect(sketch1.itemCount).toBe(10)
    })

    it('merges sketches with disjoint items', () => {
      const sketch1 = new ProbabilisticSketch(1000, 5)
      const sketch2 = new ProbabilisticSketch(1000, 5)
      sketch1.add('x', 5)
      sketch2.add('y', 10)
      sketch1.merge(sketch2)
      expect(sketch1.estimate('x')).toBeGreaterThanOrEqual(5)
      expect(sketch1.estimate('y')).toBeGreaterThanOrEqual(10)
      expect(sketch1.itemCount).toBe(15)
    })

    it('throws on width mismatch', () => {
      const sketch1 = new ProbabilisticSketch(1000, 5)
      const sketch2 = new ProbabilisticSketch(500, 5)
      expect(() => sketch1.merge(sketch2)).toThrow('Cannot merge sketches with different dimensions')
    })

    it('throws on depth mismatch', () => {
      const sketch1 = new ProbabilisticSketch(1000, 5)
      const sketch2 = new ProbabilisticSketch(1000, 3)
      expect(() => sketch1.merge(sketch2)).toThrow('Cannot merge sketches with different dimensions')
    })

    it('merge of empty sketches does nothing harmful', () => {
      const sketch1 = new ProbabilisticSketch(100, 3)
      const sketch2 = new ProbabilisticSketch(100, 3)
      sketch1.merge(sketch2)
      expect(sketch1.itemCount).toBe(0)
      expect(sketch1.estimate('anything')).toBe(0)
    })
  })

  // ─── Reset ───

  describe('reset', () => {
    it('resets all counts to zero', () => {
      const sketch = new ProbabilisticSketch()
      sketch.add('a', 10)
      sketch.add('b', 20)
      sketch.reset()
      expect(sketch.estimate('a')).toBe(0)
      expect(sketch.estimate('b')).toBe(0)
    })

    it('resets itemCount to zero', () => {
      const sketch = new ProbabilisticSketch()
      sketch.add('x', 100)
      sketch.reset()
      expect(sketch.itemCount).toBe(0)
    })

    it('allows adds after reset', () => {
      const sketch = new ProbabilisticSketch()
      sketch.add('before', 100)
      sketch.reset()
      sketch.add('after', 5)
      expect(sketch.estimate('before')).toBe(0)
      expect(sketch.estimate('after')).toBeGreaterThanOrEqual(5)
    })

    it('reset on fresh sketch does nothing harmful', () => {
      const sketch = new ProbabilisticSketch()
      sketch.reset()
      expect(sketch.itemCount).toBe(0)
    })
  })

  // ─── ItemCount ───

  describe('itemCount', () => {
    it('returns 0 for fresh sketch', () => {
      const sketch = new ProbabilisticSketch()
      expect(sketch.itemCount).toBe(0)
    })

    it('tracks total count including duplicates', () => {
      const sketch = new ProbabilisticSketch()
      sketch.add('a', 3)
      sketch.add('a', 2)
      expect(sketch.itemCount).toBe(5)
    })
  })

  // ─── GetErrorRate ───

  describe('getErrorRate', () => {
    it('returns error rate based on width', () => {
      const sketch = new ProbabilisticSketch(1000, 5)
      expect(sketch.getErrorRate()).toBe(2 / 1000)
    })

    it('decreases with larger width', () => {
      const sketch1 = new ProbabilisticSketch(100, 5)
      const sketch2 = new ProbabilisticSketch(1000, 5)
      expect(sketch2.getErrorRate()).toBeLessThan(sketch1.getErrorRate())
    })

    it('is always positive', () => {
      const sketch = new ProbabilisticSketch(10, 2)
      expect(sketch.getErrorRate()).toBeGreaterThan(0)
    })
  })

  // ─── GetConfidence ───

  describe('getConfidence', () => {
    it('returns confidence based on depth', () => {
      const sketch = new ProbabilisticSketch(1000, 5)
      const expected = 1 - Math.exp(-5)
      expect(sketch.getConfidence()).toBeCloseTo(expected, 5)
    })

    it('increases with larger depth', () => {
      const sketch1 = new ProbabilisticSketch(1000, 3)
      const sketch2 = new ProbabilisticSketch(1000, 10)
      expect(sketch2.getConfidence()).toBeGreaterThan(sketch1.getConfidence())
    })

    it('confidence is between 0 and 1', () => {
      const sketch = new ProbabilisticSketch(100, 5)
      expect(sketch.getConfidence()).toBeGreaterThan(0)
      expect(sketch.getConfidence()).toBeLessThanOrEqual(1)
    })
  })

  // ─── Edge Cases ───

  describe('edge cases', () => {
    it('handles long strings', () => {
      const sketch = new ProbabilisticSketch()
      const longStr = 'a'.repeat(10000)
      sketch.add(longStr)
      expect(sketch.estimate(longStr)).toBeGreaterThanOrEqual(1)
    })

    it('handles very large count values', () => {
      const sketch = new ProbabilisticSketch()
      sketch.add('big', 1000000)
      expect(sketch.estimate('big')).toBeGreaterThanOrEqual(1000000)
    })

    it('stress test with many items', () => {
      const sketch = new ProbabilisticSketch(5000, 10)
      for (let i = 0; i < 1000; i++) {
        sketch.add(`item_${i}`, 1)
      }
      expect(sketch.itemCount).toBe(1000)
      for (let i = 0; i < 1000; i++) {
        expect(sketch.estimate(`item_${i}`)).toBeGreaterThanOrEqual(1)
      }
    })

    it('handles unicode strings', () => {
      const sketch = new ProbabilisticSketch()
      sketch.add('你好世界')
      sketch.add('🎉🎊')
      expect(sketch.estimate('你好世界')).toBeGreaterThanOrEqual(1)
      expect(sketch.estimate('🎉🎊')).toBeGreaterThanOrEqual(1)
    })
  })
})
