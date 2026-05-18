import { describe, it, expect } from 'vitest'
import { CountMinSketch3 } from '../../src/core/count-min-sketch-3/index.js'

// ─── Constructor ───

describe('CountMinSketch3', () => {
  describe('constructor', () => {
    it('should create a sketch with default parameters', () => {
      const sketch = new CountMinSketch3()
      expect(sketch.estimate('anything')).toBe(0)
    })

    it('should create a sketch with custom width and depth', () => {
      const sketch = new CountMinSketch3(100, 3)
      expect(sketch.estimate('test')).toBe(0)
    })

    it('should create independent sketches', () => {
      const a = new CountMinSketch3(50, 3)
      const b = new CountMinSketch3(50, 3)
      a.update('x')
      expect(a.estimate('x')).toBe(1)
      expect(b.estimate('x')).toBe(0)
    })
  })

  // ─── update / estimate ───

  describe('update and estimate', () => {
    it('should track a single item', () => {
      const sketch = new CountMinSketch3(100, 5)
      sketch.update('item')
      expect(sketch.estimate('item')).toBe(1)
    })

    it('should track multiple updates to same item', () => {
      const sketch = new CountMinSketch3(100, 5)
      sketch.update('item')
      sketch.update('item')
      sketch.update('item')
      expect(sketch.estimate('item')).toBe(3)
    })

    it('should track different items independently', () => {
      const sketch = new CountMinSketch3(100, 5)
      sketch.update('a', 5)
      sketch.update('b', 3)
      expect(sketch.estimate('a')).toBe(5)
      expect(sketch.estimate('b')).toBe(3)
    })

    it('should return 0 for untracked items', () => {
      const sketch = new CountMinSketch3(100, 5)
      sketch.update('tracked')
      expect(sketch.estimate('untracked')).toBe(0)
    })

    it('should handle update with count 0', () => {
      const sketch = new CountMinSketch3(100, 5)
      sketch.update('item', 0)
      expect(sketch.estimate('item')).toBe(0)
    })

    it('should use default count of 1', () => {
      const sketch = new CountMinSketch3(100, 5)
      sketch.update('item')
      expect(sketch.estimate('item')).toBe(1)
    })

    it('should handle large counts', () => {
      const sketch = new CountMinSketch3(100, 5)
      sketch.update('item', 1000)
      expect(sketch.estimate('item')).toBe(1000)
    })

    it('should never underestimate true count', () => {
      const sketch = new CountMinSketch3(100, 5)
      sketch.update('x', 10)
      sketch.update('y', 5)
      expect(sketch.estimate('x')).toBeGreaterThanOrEqual(10)
    })
  })

  // ─── reset ───

  describe('reset', () => {
    it('should clear all counts', () => {
      const sketch = new CountMinSketch3(100, 5)
      sketch.update('a', 10)
      sketch.update('b', 20)
      sketch.reset()
      expect(sketch.estimate('a')).toBe(0)
      expect(sketch.estimate('b')).toBe(0)
    })

    it('should allow updates after reset', () => {
      const sketch = new CountMinSketch3(100, 5)
      sketch.update('x', 5)
      sketch.reset()
      sketch.update('x', 3)
      expect(sketch.estimate('x')).toBe(3)
    })
  })

  // ─── merge ───

  describe('merge', () => {
    it('should merge two sketches', () => {
      const a = new CountMinSketch3(100, 5)
      const b = new CountMinSketch3(100, 5)
      a.update('item', 3)
      b.update('item', 7)
      a.merge(b)
      expect(a.estimate('item')).toBe(10)
    })

    it('should throw when merging sketches with different dimensions', () => {
      const a = new CountMinSketch3(100, 5)
      const b = new CountMinSketch3(200, 5)
      expect(() => a.merge(b)).toThrow('Sketch dimensions must match for merge')
    })

    it('should throw when merging with different depth', () => {
      const a = new CountMinSketch3(100, 5)
      const b = new CountMinSketch3(100, 3)
      expect(() => a.merge(b)).toThrow('Sketch dimensions must match for merge')
    })

    it('should merge sketches with disjoint items', () => {
      const a = new CountMinSketch3(100, 5)
      const b = new CountMinSketch3(100, 5)
      a.update('x', 5)
      b.update('y', 3)
      a.merge(b)
      expect(a.estimate('x')).toBe(5)
      expect(a.estimate('y')).toBe(3)
    })
  })

  // ─── Edge Cases ───

  describe('edge cases', () => {
    it('should handle empty string key', () => {
      const sketch = new CountMinSketch3(100, 5)
      sketch.update('', 1)
      expect(sketch.estimate('')).toBe(1)
    })

    it('should handle special characters', () => {
      const sketch = new CountMinSketch3(100, 5)
      sketch.update('hello world! 🌍', 5)
      expect(sketch.estimate('hello world! 🌍')).toBe(5)
    })

    it('should handle many distinct items', () => {
      const sketch = new CountMinSketch3(1000, 5)
      for (let i = 0; i < 100; i++) {
        sketch.update(`item-${i}`)
      }
      expect(sketch.estimate('item-0')).toBeGreaterThanOrEqual(1)
      expect(sketch.estimate('item-99')).toBeGreaterThanOrEqual(1)
    })

    it('should handle single width and depth', () => {
      const sketch = new CountMinSketch3(1, 1)
      sketch.update('a', 5)
      sketch.update('b', 3)
      expect(sketch.estimate('a')).toBeGreaterThanOrEqual(5)
      expect(sketch.estimate('b')).toBeGreaterThanOrEqual(3)
    })
  })
})
