import { describe, it, expect } from 'vitest'
import { HyperLogLog3 } from '../src/core/hyperloglog-3/index.js'

describe('HyperLogLog3', () => {
  describe('empty count', () => {
    it('returns 0 for empty structure', () => {
      const hll = new HyperLogLog3()
      expect(hll.count()).toBe(0)
    })

    it('isEmpty returns true for empty structure', () => {
      const hll = new HyperLogLog3()
      expect(hll.isEmpty()).toBe(true)
    })
  })

  describe('single add', () => {
    it('counts 1 after adding one element', () => {
      const hll = new HyperLogLog3()
      hll.add('test')
      expect(hll.count()).toBeCloseTo(1, 0.2)
    })

    it('isEmpty returns false after adding one element', () => {
      const hll = new HyperLogLog3()
      hll.add('test')
      expect(hll.isEmpty()).toBe(false)
    })
  })

  describe('multiple adds', () => {
    it('estimates cardinality correctly for small sets', () => {
      const hll = new HyperLogLog3()
      for (let i = 0; i < 100; i++) {
        hll.add(`item-${i}`)
      }
      const estimate = hll.count()
      expect(estimate).toBeGreaterThanOrEqual(90)
      expect(estimate).toBeLessThanOrEqual(110)
    })

    it('estimates cardinality correctly for medium sets', () => {
      const hll = new HyperLogLog3()
      for (let i = 0; i < 1000; i++) {
        hll.add(`item-${i}`)
      }
      const estimate = hll.count()
      expect(estimate).toBeGreaterThanOrEqual(950)
      expect(estimate).toBeLessThanOrEqual(1050)
    })

    it('estimates cardinality correctly for large sets', () => {
      const hll = new HyperLogLog3(12)
      for (let i = 0; i < 10000; i++) {
        hll.add(`item-${i}`)
      }
      const estimate = hll.count()
      expect(estimate).toBeGreaterThanOrEqual(9500)
      expect(estimate).toBeLessThanOrEqual(10500)
    })

    it('handles duplicate values', () => {
      const hll = new HyperLogLog3()
      for (let i = 0; i < 10; i++) {
        hll.add('duplicate')
      }
      const estimate = hll.count()
      expect(estimate).toBeCloseTo(1, 0.2)
    })
  })

  describe('merge', () => {
    it('merges two structures', () => {
      const hll1 = new HyperLogLog3()
      const hll2 = new HyperLogLog3()
      for (let i = 0; i < 500; i++) {
        hll1.add(`item-${i}`)
      }
      for (let i = 500; i < 1000; i++) {
        hll2.add(`item-${i}`)
      }
      hll1.merge(hll2)
      const estimate = hll1.count()
      expect(estimate).toBeGreaterThanOrEqual(950)
      expect(estimate).toBeLessThanOrEqual(1050)
    })

    it('throws error for different precisions', () => {
      const hll1 = new HyperLogLog3(10)
      const hll2 = new HyperLogLog3(12)
      expect(() => hll1.merge(hll2)).toThrow('Cannot merge HyperLogLog3 structures with different precisions')
    })
  })

  describe('reset', () => {
    it('resets to empty state', () => {
      const hll = new HyperLogLog3()
      for (let i = 0; i < 100; i++) {
        hll.add(`item-${i}`)
      }
      hll.reset()
      expect(hll.count()).toBe(0)
      expect(hll.isEmpty()).toBe(true)
    })
  })

  describe('uniqueness estimation', () => {
    it('estimates correctly for string values', () => {
      const hll = new HyperLogLog3()
      const uniqueStrings = new Set()
      for (let i = 0; i < 500; i++) {
        const str = `unique-string-${Math.random()}`
        uniqueStrings.add(str)
        hll.add(str)
      }
      const estimate = hll.count()
      const actual = uniqueStrings.size
      const relativeError = Math.abs(estimate - actual) / actual
      expect(relativeError).toBeLessThan(0.05)
    })

    it('estimates correctly for numeric string values', () => {
      const hll = new HyperLogLog3()
      for (let i = 0; i < 500; i++) {
        hll.add(i.toString())
      }
      const estimate = hll.count()
      expect(estimate).toBeGreaterThanOrEqual(475)
      expect(estimate).toBeLessThanOrEqual(525)
    })

    it('handles long strings', () => {
      const hll = new HyperLogLog3()
      for (let i = 0; i < 100; i++) {
        hll.add('a'.repeat(1000) + i)
      }
      const estimate = hll.count()
      expect(estimate).toBeGreaterThanOrEqual(90)
      expect(estimate).toBeLessThanOrEqual(110)
    })
  })

  describe('precision', () => {
    it('accepts valid precision values', () => {
      const hll1 = new HyperLogLog3(4)
      const hll2 = new HyperLogLog3(10)
      const hll3 = new HyperLogLog3(16)
      expect(hll1.count()).toBe(0)
      expect(hll2.count()).toBe(0)
      expect(hll3.count()).toBe(0)
    })

    it('throws error for precision too low', () => {
      expect(() => new HyperLogLog3(3)).toThrow('precision must be between 4 and 16')
    })

    it('throws error for precision too high', () => {
      expect(() => new HyperLogLog3(17)).toThrow('precision must be between 4 and 16')
    })

    it('higher precision gives more accurate estimates', () => {
      const hllLow = new HyperLogLog3(4)
      const hllHigh = new HyperLogLog3(14)
      for (let i = 0; i < 1000; i++) {
        hllLow.add(`item-${i}`)
        hllHigh.add(`item-${i}`)
      }
      const errorLow = Math.abs(hllLow.count() - 1000) / 1000
      const errorHigh = Math.abs(hllHigh.count() - 1000) / 1000
      expect(errorHigh).toBeLessThanOrEqual(errorLow + 0.1)
    })
  })

  describe('merge edge cases', () => {
    it('merge with empty structure preserves count', () => {
      const hll = new HyperLogLog3()
      for (let i = 0; i < 100; i++) {
        hll.add(`item-${i}`)
      }
      const empty = new HyperLogLog3()
      hll.merge(empty)
      expect(hll.count()).toBeGreaterThanOrEqual(90)
    })

    it('merge empty with non-empty preserves count', () => {
      const empty = new HyperLogLog3()
      const hll = new HyperLogLog3()
      for (let i = 0; i < 100; i++) {
        hll.add(`item-${i}`)
      }
      empty.merge(hll)
      expect(empty.count()).toBeGreaterThanOrEqual(90)
    })

    it('merge with overlapping values deduplicates', () => {
      const hll1 = new HyperLogLog3()
      const hll2 = new HyperLogLog3()
      for (let i = 0; i < 100; i++) {
        hll1.add(`item-${i}`)
        hll2.add(`item-${i}`)
      }
      hll1.merge(hll2)
      expect(hll1.count()).toBeLessThanOrEqual(120)
      expect(hll1.count()).toBeGreaterThanOrEqual(80)
    })
  })

  describe('reset and reuse', () => {
    it('can add items after reset', () => {
      const hll = new HyperLogLog3()
      for (let i = 0; i < 100; i++) {
        hll.add(`old-${i}`)
      }
      hll.reset()
      for (let i = 0; i < 50; i++) {
        hll.add(`new-${i}`)
      }
      expect(hll.count()).toBeGreaterThanOrEqual(45)
      expect(hll.count()).toBeLessThanOrEqual(55)
    })
  })

  describe('unicode and special characters', () => {
    it('handles unicode strings', () => {
      const hll = new HyperLogLog3()
      hll.add('こんにちは')
      hll.add('Привет')
      hll.add('🎉')
      expect(hll.count()).toBeGreaterThanOrEqual(3)
      expect(hll.count()).toBeLessThanOrEqual(5)
    })

    it('handles empty string', () => {
      const hll = new HyperLogLog3()
      hll.add('')
      expect(hll.count()).toBeGreaterThanOrEqual(1)
    })
  })

  describe('isEmpty', () => {
    it('returns true for new instance', () => {
      const hll = new HyperLogLog3()
      expect(hll.isEmpty()).toBe(true)
    })

    it('returns false after add', () => {
      const hll = new HyperLogLog3()
      hll.add('test')
      expect(hll.isEmpty()).toBe(false)
    })

    it('returns true after reset', () => {
      const hll = new HyperLogLog3()
      hll.add('test')
      hll.reset()
      expect(hll.isEmpty()).toBe(true)
    })
  })

  describe('precision validation', () => {
    it('throws for precision below 4', () => {
      expect(() => new HyperLogLog3(3)).toThrow()
    })

    it('throws for precision above 16', () => {
      expect(() => new HyperLogLog3(17)).toThrow()
    })

    it('accepts precision 4', () => {
      const hll = new HyperLogLog3(4)
      hll.add('test')
      expect(hll.count()).toBeGreaterThanOrEqual(1)
    })

    it('accepts precision 16', () => {
      const hll = new HyperLogLog3(16)
      hll.add('test')
      expect(hll.count()).toBeGreaterThanOrEqual(1)
    })
  })

  describe('merge validation', () => {
    it('throws when merging different precisions', () => {
      const hll1 = new HyperLogLog3(4)
      const hll2 = new HyperLogLog3(8)
      expect(() => hll1.merge(hll2)).toThrow()
    })
  })

  describe('reset', () => {
    it('resets to empty state', () => {
      const hll = new HyperLogLog3(8)
      hll.add('a')
      hll.add('b')
      hll.reset()
      expect(hll.isEmpty()).toBe(true)
    })
  })

  describe('merge same precision', () => {
    it('merges two sketches', () => {
      const hll1 = new HyperLogLog3(8)
      const hll2 = new HyperLogLog3(8)
      hll1.add('a')
      hll2.add('b')
      hll1.merge(hll2)
      expect(hll1.count()).toBeGreaterThanOrEqual(1)
    })
  })

  describe('count accuracy', () => {
    it('estimates within reasonable range for small sets', () => {
      const hll = new HyperLogLog3(12)
      for (let i = 0; i < 100; i++) hll.add(`item-${i}`)
      const estimate = hll.count()
      expect(estimate).toBeGreaterThan(50)
      expect(estimate).toBeLessThan(200)
    })
  })
})
