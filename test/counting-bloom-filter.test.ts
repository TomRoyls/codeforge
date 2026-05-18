import { beforeEach, describe, expect, it } from 'vitest'
import { CountingBloomFilter } from '../src/utils/counting-bloom-filter.js'

describe('CountingBloomFilter', () => {
  let bf: CountingBloomFilter

  beforeEach(() => {
    bf = new CountingBloomFilter(100)
  })

  // ─── Constructor ───

  describe('constructor', () => {
    it('creates with default false positive rate', () => {
      const filter = new CountingBloomFilter(1000)
      expect(filter.capacity).toBe(1000)
      expect(filter.size).toBe(0)
      expect(filter.isEmpty).toBe(true)
    })

    it('creates with custom false positive rate', () => {
      const filter = new CountingBloomFilter(1000, 0.001)
      expect(filter.capacity).toBe(1000)
    })

    it('throws for capacity < 1', () => {
      expect(() => new CountingBloomFilter(0)).toThrow(RangeError)
      expect(() => new CountingBloomFilter(-1)).toThrow(RangeError)
    })

    it('throws for invalid false positive rate', () => {
      expect(() => new CountingBloomFilter(100, 0)).toThrow(RangeError)
      expect(() => new CountingBloomFilter(100, 1)).toThrow(RangeError)
      expect(() => new CountingBloomFilter(100, -0.1)).toThrow(RangeError)
    })
  })

  // ─── Add ───

  describe('add', () => {
    it('increments size', () => {
      bf.add('hello')
      expect(bf.size).toBe(1)
    })

    it('can add multiple items', () => {
      bf.add('a')
      bf.add('b')
      bf.add('c')
      expect(bf.size).toBe(3)
    })
  })

  // ─── Has ───

  describe('has', () => {
    it('returns true for added items', () => {
      bf.add('hello')
      expect(bf.has('hello')).toBe(true)
    })

    it('returns false for not-added items', () => {
      bf.add('hello')
      expect(bf.has('world')).toBe(false)
    })

    it('returns false on empty filter', () => {
      expect(bf.has('anything')).toBe(false)
    })

    it('never produces false negatives', () => {
      const filter = new CountingBloomFilter(100, 0.01)
      for (let i = 0; i < 100; i++) filter.add(`item-${i}`)
      for (let i = 0; i < 100; i++) {
        expect(filter.has(`item-${i}`)).toBe(true)
      }
    })
  })

  // ─── Remove ───

  describe('remove', () => {
    it('returns true for existing item', () => {
      bf.add('hello')
      expect(bf.remove('hello')).toBe(true)
    })

    it('returns false for non-existing item', () => {
      expect(bf.remove('nothing')).toBe(false)
    })

    it('returns false when removing from empty filter', () => {
      expect(bf.remove('anything')).toBe(false)
    })

    it('decrements size on successful remove', () => {
      bf.add('hello')
      bf.remove('hello')
      expect(bf.size).toBe(0)
    })

    it('size does not change on failed remove', () => {
      bf.add('a')
      bf.remove('nonexistent')
      expect(bf.size).toBe(1)
    })

    it('removing one item does not affect another', () => {
      bf.add('a')
      bf.add('b')
      bf.remove('a')
      expect(bf.has('a')).toBe(false)
      expect(bf.has('b')).toBe(true)
    })
  })

  // ─── Add-Remove-Add ───

  describe('add-remove-add cycle', () => {
    it('add item, remove it, add again still works', () => {
      bf.add('test')
      expect(bf.has('test')).toBe(true)
      bf.remove('test')
      expect(bf.has('test')).toBe(false)
      bf.add('test')
      expect(bf.has('test')).toBe(true)
      expect(bf.size).toBe(1)
    })
  })

  // ─── Clear ───

  describe('clear', () => {
    it('resets everything', () => {
      bf.add('a')
      bf.add('b')
      bf.clear()
      expect(bf.size).toBe(0)
      expect(bf.isEmpty).toBe(true)
      expect(bf.has('a')).toBe(false)
      expect(bf.has('b')).toBe(false)
    })

    it('filter usable after clear', () => {
      bf.add('old')
      bf.clear()
      bf.add('new')
      expect(bf.has('new')).toBe(true)
      expect(bf.has('old')).toBe(false)
    })
  })

  // ─── IsEmpty ───

  describe('isEmpty', () => {
    it('is true when empty', () => {
      expect(bf.isEmpty).toBe(true)
    })

    it('is false when items added', () => {
      bf.add('item')
      expect(bf.isEmpty).toBe(false)
    })

    it('becomes true again after removing all', () => {
      bf.add('x')
      bf.remove('x')
      expect(bf.isEmpty).toBe(true)
    })
  })

  // ─── Distribution ───

  describe('distribution', () => {
    it('false positive rate is reasonable', () => {
      const filter = new CountingBloomFilter(100, 0.01)
      for (let i = 0; i < 100; i++) filter.add(`item-${i}`)
      let falsePositives = 0
      const trials = 1000
      for (let i = 0; i < trials; i++) {
        if (filter.has(`absent-${i}`)) falsePositives++
      }
      const empiricalFPR = falsePositives / trials
      expect(empiricalFPR).toBeLessThan(0.05)
    })
  })

  // ─── Capacity and Stats ───

  describe('capacity and stats', () => {
    it('capacity returns configured value', () => {
      const filter = new CountingBloomFilter(500)
      expect(filter.capacity).toBe(500)
    })

    it('stats returns correct shape', () => {
      bf.add('a')
      bf.add('b')
      const stats = bf.stats()
      expect(stats.capacity).toBe(100)
      expect(stats.size).toBe(2)
      expect(stats.counterCount).toBeGreaterThan(0)
      expect(stats.hashCount).toBe(4)
      expect(stats.falsePositiveRate).toBeGreaterThanOrEqual(0)
    })

    it('falsePositiveRate is 0 when empty', () => {
      expect(bf.falsePositiveRate).toBe(0)
    })
  })
})
