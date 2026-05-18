import { describe, it, expect } from 'vitest'
import { HyperLogLog3 } from '../../src/core/hyperloglog-3/index.js'

describe('HyperLogLog3', () => {
  // ─── Constructor ───
  describe('constructor', () => {
    it('should create with default precision 14', () => {
      const hll = new HyperLogLog3()
      expect(hll.isEmpty()).toBe(true)
      expect(hll.count()).toBe(0)
    })

    it('should create with minimum precision 4', () => {
      const hll = new HyperLogLog3(4)
      expect(hll.count()).toBe(0)
    })

    it('should create with maximum precision 16', () => {
      const hll = new HyperLogLog3(16)
      expect(hll.count()).toBe(0)
    })

    it('should throw for precision below 4', () => {
      expect(() => new HyperLogLog3(3)).toThrow(RangeError)
    })

    it('should throw for precision above 16', () => {
      expect(() => new HyperLogLog3(17)).toThrow(RangeError)
    })

    it('should throw for precision 0', () => {
      expect(() => new HyperLogLog3(0)).toThrow(RangeError)
    })
  })

  // ─── add and count ───
  describe('add and count', () => {
    it('should return 0 for empty structure', () => {
      const hll = new HyperLogLog3()
      expect(hll.count()).toBe(0)
    })

    it('should count a single element', () => {
      const hll = new HyperLogLog3()
      hll.add('hello')
      expect(hll.count()).toBeGreaterThan(0)
    })

    it('should handle duplicate adds (count same element)', () => {
      const hll = new HyperLogLog3()
      hll.add('hello')
      hll.add('hello')
      hll.add('hello')
      expect(hll.count()).toBeGreaterThanOrEqual(1)
    })

    it('should estimate cardinality for multiple distinct elements', () => {
      const hll = new HyperLogLog3()
      for (let i = 0; i < 100; i++) {
        hll.add(`item-${i}`)
      }
      const estimate = hll.count()
      expect(estimate).toBeGreaterThan(50)
      expect(estimate).toBeLessThan(200)
    })

    it('should estimate cardinality for many distinct elements', () => {
      const hll = new HyperLogLog3(12)
      for (let i = 0; i < 1000; i++) {
        hll.add(`element-${i}`)
      }
      const estimate = hll.count()
      expect(estimate).toBeGreaterThan(500)
      expect(estimate).toBeLessThan(2000)
    })

    it('should handle empty string', () => {
      const hll = new HyperLogLog3()
      hll.add('')
      expect(hll.count()).toBeGreaterThan(0)
    })

    it('should handle unicode strings', () => {
      const hll = new HyperLogLog3()
      hll.add('hello')
      hll.add('héllo')
      hll.add('你好')
      hll.add('🌍')
      expect(hll.count()).toBeGreaterThanOrEqual(3)
    })
  })

  // ─── isEmpty ───
  describe('isEmpty', () => {
    it('should return true for new instance', () => {
      const hll = new HyperLogLog3()
      expect(hll.isEmpty()).toBe(true)
    })

    it('should return false after adding an element', () => {
      const hll = new HyperLogLog3()
      hll.add('test')
      expect(hll.isEmpty()).toBe(false)
    })
  })

  // ─── reset ───
  describe('reset', () => {
    it('should clear all data', () => {
      const hll = new HyperLogLog3()
      hll.add('a')
      hll.add('b')
      hll.add('c')
      hll.reset()
      expect(hll.isEmpty()).toBe(true)
      expect(hll.count()).toBe(0)
    })

    it('should allow adding elements after reset', () => {
      const hll = new HyperLogLog3()
      hll.add('a')
      hll.reset()
      hll.add('b')
      expect(hll.isEmpty()).toBe(false)
      expect(hll.count()).toBeGreaterThan(0)
    })
  })

  // ─── merge ───
  describe('merge', () => {
    it('should merge two structures with same precision', () => {
      const hll1 = new HyperLogLog3(10)
      const hll2 = new HyperLogLog3(10)
      for (let i = 0; i < 50; i++) hll1.add(`a-${i}`)
      for (let i = 0; i < 50; i++) hll2.add(`b-${i}`)
      hll1.merge(hll2)
      const estimate = hll1.count()
      expect(estimate).toBeGreaterThan(50)
    })

    it('should throw when merging different precisions', () => {
      const hll1 = new HyperLogLog3(10)
      const hll2 = new HyperLogLog3(12)
      expect(() => hll1.merge(hll2)).toThrow('Cannot merge HyperLogLog3 structures with different precisions')
    })

    it('should merge overlapping sets correctly', () => {
      const hll1 = new HyperLogLog3(10)
      const hll2 = new HyperLogLog3(10)
      for (let i = 0; i < 100; i++) hll1.add(`item-${i}`)
      for (let i = 50; i < 150; i++) hll2.add(`item-${i}`)
      hll1.merge(hll2)
      const estimate = hll1.count()
      expect(estimate).toBeGreaterThan(100)
      expect(estimate).toBeLessThan(200)
    })

    it('should handle merging empty structure', () => {
      const hll1 = new HyperLogLog3(10)
      const hll2 = new HyperLogLog3(10)
      for (let i = 0; i < 10; i++) hll1.add(`item-${i}`)
      const beforeMerge = hll1.count()
      hll1.merge(hll2)
      expect(hll1.count()).toBeGreaterThanOrEqual(beforeMerge)
    })
  })

  // ─── Precision levels ───
  describe('precision levels', () => {
    it('should work with precision 4', () => {
      const hll = new HyperLogLog3(4)
      for (let i = 0; i < 20; i++) hll.add(`item-${i}`)
      expect(hll.count()).toBeGreaterThan(0)
    })

    it('should work with precision 8', () => {
      const hll = new HyperLogLog3(8)
      for (let i = 0; i < 50; i++) hll.add(`item-${i}`)
      expect(hll.count()).toBeGreaterThan(0)
    })

    it('should work with precision 16', () => {
      const hll = new HyperLogLog3(16)
      for (let i = 0; i < 50; i++) hll.add(`item-${i}`)
      expect(hll.count()).toBeGreaterThan(0)
    })
  })
})
