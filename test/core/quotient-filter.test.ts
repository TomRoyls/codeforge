import { describe, it, expect } from 'vitest'
import { QuotientFilter } from '../../src/core/quotient-filter/quotient-filter.js'

describe('QuotientFilter', () => {
  describe('constructor', () => {
    it('should create with default options', () => {
      const qf = new QuotientFilter()
      expect(qf.size).toBe(0)
      expect(qf.capacity).toBeGreaterThan(0)
      expect(qf.isEmpty()).toBe(true)
    })

    it('should create with custom expectedItems', () => {
      const qf = new QuotientFilter({ expectedItems: 100 })
      expect(qf.size).toBe(0)
      expect(qf.capacity).toBeGreaterThanOrEqual(100)
    })

    it('should create with custom falsePositiveRate', () => {
      const qf = new QuotientFilter({ falsePositiveRate: 0.001 })
      expect(qf.size).toBe(0)
    })

    it('should create with both options', () => {
      const qf = new QuotientFilter({ expectedItems: 500, falsePositiveRate: 0.05 })
      expect(qf.size).toBe(0)
    })

    it('should create with expectedItems of 1', () => {
      const qf = new QuotientFilter({ expectedItems: 1 })
      expect(qf.capacity).toBeGreaterThanOrEqual(2)
    })

    it('should create with expectedItems of 2', () => {
      const qf = new QuotientFilter({ expectedItems: 2 })
      expect(qf.capacity).toBeGreaterThanOrEqual(2)
    })

    it('should create with very large expectedItems', () => {
      const qf = new QuotientFilter({ expectedItems: 1000000 })
      expect(qf.capacity).toBeGreaterThanOrEqual(1000000)
    })

    it('should create with very small falsePositiveRate', () => {
      const qf = new QuotientFilter({ falsePositiveRate: 0.0001 })
      expect(qf.falsePositiveRate).toBeLessThanOrEqual(0.0001)
    })

    it('should create with falsePositiveRate of 0.5', () => {
      const qf = new QuotientFilter({ falsePositiveRate: 0.5 })
      expect(qf.size).toBe(0)
    })

    it('should have capacity that is a power of 2', () => {
      const qf = new QuotientFilter({ expectedItems: 100 })
      const cap = qf.capacity
      expect((cap & (cap - 1)) === 0).toBe(true)
    })
  })

  describe('insert', () => {
    it('should insert a single item', () => {
      const qf = new QuotientFilter()
      qf.insert('hello')
      expect(qf.size).toBe(1)
    })

    it('should insert multiple items', () => {
      const qf = new QuotientFilter()
      qf.insert('a')
      qf.insert('b')
      qf.insert('c')
      expect(qf.size).toBe(3)
    })

    it('should insert duplicate items (increases size)', () => {
      const qf = new QuotientFilter()
      qf.insert('hello')
      qf.insert('hello')
      expect(qf.size).toBe(2)
    })

    it('should insert numbers', () => {
      const qf = new QuotientFilter<number>()
      qf.insert(1)
      qf.insert(2)
      qf.insert(3)
      expect(qf.size).toBe(3)
    })

    it('should insert objects', () => {
      const qf = new QuotientFilter<{ id: number }>()
      qf.insert({ id: 1 })
      qf.insert({ id: 2 })
      expect(qf.size).toBe(2)
    })

    it('should insert many items', () => {
      const qf = new QuotientFilter({ expectedItems: 200 })
      for (let i = 0; i < 100; i++) {
        qf.insert(`item-${i}`)
      }
      expect(qf.size).toBe(100)
    })

    it('should handle inserting into empty filter', () => {
      const qf = new QuotientFilter()
      expect(qf.isEmpty()).toBe(true)
      qf.insert('first')
      expect(qf.isEmpty()).toBe(false)
      expect(qf.size).toBe(1)
    })

    it('should insert empty string', () => {
      const qf = new QuotientFilter()
      qf.insert('')
      expect(qf.size).toBe(1)
    })

    it('should insert boolean values', () => {
      const qf = new QuotientFilter<boolean>()
      qf.insert(true)
      qf.insert(false)
      expect(qf.size).toBe(2)
    })

    it('should insert null', () => {
      const qf = new QuotientFilter<null>()
      qf.insert(null)
      expect(qf.size).toBe(1)
    })
  })

  describe('mayContain', () => {
    it('should return false for empty filter', () => {
      const qf = new QuotientFilter()
      expect(qf.mayContain('anything')).toBe(false)
    })

    it('should find inserted item', () => {
      const qf = new QuotientFilter()
      qf.insert('hello')
      expect(qf.mayContain('hello')).toBe(true)
    })

    it('should find multiple inserted items', () => {
      const qf = new QuotientFilter()
      qf.insert('a')
      qf.insert('b')
      qf.insert('c')
      expect(qf.mayContain('a')).toBe(true)
      expect(qf.mayContain('b')).toBe(true)
      expect(qf.mayContain('c')).toBe(true)
    })

    it('should not find non-inserted items (no false positives in small sets)', () => {
      const qf = new QuotientFilter({ expectedItems: 100, falsePositiveRate: 0.001 })
      qf.insert('a')
      qf.insert('b')
      expect(qf.mayContain('z')).toBe(false)
    })

    it('should handle numbers', () => {
      const qf = new QuotientFilter<number>()
      qf.insert(42)
      expect(qf.mayContain(42)).toBe(true)
      expect(qf.mayContain(99)).toBe(false)
    })

    it('should handle objects', () => {
      const qf = new QuotientFilter<{ x: number }>()
      const obj = { x: 1 }
      qf.insert(obj)
      expect(qf.mayContain({ x: 1 })).toBe(true)
    })

    it('should handle duplicates in mayContain', () => {
      const qf = new QuotientFilter()
      qf.insert('hello')
      qf.insert('hello')
      expect(qf.mayContain('hello')).toBe(true)
    })

    it('should return false for items not in filter', () => {
      const qf = new QuotientFilter()
      qf.insert('hello')
      expect(qf.mayContain('world')).toBe(false)
    })

    it('should handle mayContain after clear', () => {
      const qf = new QuotientFilter()
      qf.insert('hello')
      qf.clear()
      expect(qf.mayContain('hello')).toBe(false)
    })
  })

  describe('remove', () => {
    it('should remove inserted item', () => {
      const qf = new QuotientFilter()
      qf.insert('hello')
      const removed = qf.remove('hello')
      expect(removed).toBe(true)
      expect(qf.size).toBe(0)
    })

    it('should return false when removing from empty filter', () => {
      const qf = new QuotientFilter()
      expect(qf.remove('anything')).toBe(false)
    })

    it('should return false when removing non-existent item', () => {
      const qf = new QuotientFilter()
      qf.insert('hello')
      expect(qf.remove('world')).toBe(false)
      expect(qf.size).toBe(1)
    })

    it('should remove one of multiple items', () => {
      const qf = new QuotientFilter()
      qf.insert('a')
      qf.insert('b')
      qf.insert('c')
      qf.remove('b')
      expect(qf.size).toBe(2)
      expect(qf.mayContain('a')).toBe(true)
      expect(qf.mayContain('c')).toBe(true)
    })

    it('should handle removing and re-adding', () => {
      const qf = new QuotientFilter()
      qf.insert('hello')
      qf.remove('hello')
      expect(qf.mayContain('hello')).toBe(false)
      qf.insert('hello')
      expect(qf.mayContain('hello')).toBe(true)
      expect(qf.size).toBe(1)
    })

    it('should handle remove with numbers', () => {
      const qf = new QuotientFilter<number>()
      qf.insert(42)
      expect(qf.remove(42)).toBe(true)
      expect(qf.size).toBe(0)
    })

    it('should handle remove of all items', () => {
      const qf = new QuotientFilter()
      qf.insert('a')
      qf.insert('b')
      qf.remove('a')
      qf.remove('b')
      expect(qf.size).toBe(0)
      expect(qf.isEmpty()).toBe(true)
    })

    it('should only remove one copy of duplicates', () => {
      const qf = new QuotientFilter()
      qf.insert('hello')
      qf.insert('hello')
      qf.remove('hello')
      expect(qf.size).toBe(1)
    })
  })

  describe('size', () => {
    it('should return 0 for new filter', () => {
      const qf = new QuotientFilter()
      expect(qf.size).toBe(0)
    })

    it('should track size after inserts', () => {
      const qf = new QuotientFilter()
      qf.insert('a')
      expect(qf.size).toBe(1)
      qf.insert('b')
      expect(qf.size).toBe(2)
    })

    it('should track size after removes', () => {
      const qf = new QuotientFilter()
      qf.insert('a')
      qf.insert('b')
      qf.remove('a')
      expect(qf.size).toBe(1)
    })

    it('should track size after clear', () => {
      const qf = new QuotientFilter()
      qf.insert('a')
      qf.insert('b')
      qf.clear()
      expect(qf.size).toBe(0)
    })
  })

  describe('capacity', () => {
    it('should return power of 2 capacity', () => {
      const qf = new QuotientFilter({ expectedItems: 100 })
      expect(qf.capacity).toBeGreaterThanOrEqual(100)
    })

    it('should have capacity of at least expectedItems', () => {
      const qf = new QuotientFilter({ expectedItems: 50 })
      expect(qf.capacity).toBeGreaterThanOrEqual(50)
    })

    it('should have capacity based on quotient bits', () => {
      const qf = new QuotientFilter({ expectedItems: 1000 })
      expect(qf.capacity).toBeGreaterThanOrEqual(1000)
    })

    it('should not change after inserts', () => {
      const qf = new QuotientFilter()
      const cap = qf.capacity
      qf.insert('a')
      expect(qf.capacity).toBe(cap)
    })
  })

  describe('falsePositiveRate', () => {
    it('should return 0 for empty filter', () => {
      const qf = new QuotientFilter()
      expect(qf.falsePositiveRate).toBe(0)
    })

    it('should return value based on remainder bits', () => {
      const qf = new QuotientFilter({ falsePositiveRate: 0.01 })
      qf.insert('a')
      expect(qf.falsePositiveRate).toBeGreaterThan(0)
      expect(qf.falsePositiveRate).toBeLessThanOrEqual(0.01)
    })

    it('should decrease with lower target rate', () => {
      const qf1 = new QuotientFilter({ falsePositiveRate: 0.1 })
      qf1.insert('a')
      const qf2 = new QuotientFilter({ falsePositiveRate: 0.001 })
      qf2.insert('a')
      expect(qf2.falsePositiveRate).toBeLessThan(qf1.falsePositiveRate)
    })

    it('should be a valid probability', () => {
      const qf = new QuotientFilter()
      qf.insert('test')
      expect(qf.falsePositiveRate).toBeGreaterThanOrEqual(0)
      expect(qf.falsePositiveRate).toBeLessThanOrEqual(1)
    })
  })

  describe('isEmpty', () => {
    it('should return true for new filter', () => {
      const qf = new QuotientFilter()
      expect(qf.isEmpty()).toBe(true)
    })

    it('should return false after insert', () => {
      const qf = new QuotientFilter()
      qf.insert('a')
      expect(qf.isEmpty()).toBe(false)
    })

    it('should return true after removing all items', () => {
      const qf = new QuotientFilter()
      qf.insert('a')
      qf.remove('a')
      expect(qf.isEmpty()).toBe(true)
    })

    it('should return true after clear', () => {
      const qf = new QuotientFilter()
      qf.insert('a')
      qf.insert('b')
      qf.clear()
      expect(qf.isEmpty()).toBe(true)
    })
  })

  describe('clear', () => {
    it('should clear the filter', () => {
      const qf = new QuotientFilter()
      qf.insert('a')
      qf.insert('b')
      qf.clear()
      expect(qf.size).toBe(0)
      expect(qf.isEmpty()).toBe(true)
    })

    it('should allow inserts after clear', () => {
      const qf = new QuotientFilter()
      qf.insert('a')
      qf.clear()
      qf.insert('b')
      expect(qf.size).toBe(1)
      expect(qf.mayContain('b')).toBe(true)
    })

    it('should not find old items after clear', () => {
      const qf = new QuotientFilter()
      qf.insert('hello')
      qf.clear()
      expect(qf.mayContain('hello')).toBe(false)
    })

    it('should be safe to call clear on empty filter', () => {
      const qf = new QuotientFilter()
      qf.clear()
      expect(qf.size).toBe(0)
    })

    it('should preserve capacity after clear', () => {
      const qf = new QuotientFilter()
      const cap = qf.capacity
      qf.insert('a')
      qf.clear()
      expect(qf.capacity).toBe(cap)
    })
  })

  describe('clone', () => {
    it('should create an independent copy', () => {
      const qf = new QuotientFilter()
      qf.insert('a')
      qf.insert('b')
      const cloned = qf.clone()
      expect(cloned.size).toBe(2)
      expect(cloned.mayContain('a')).toBe(true)
      expect(cloned.mayContain('b')).toBe(true)
    })

    it('should not affect original when modified', () => {
      const qf = new QuotientFilter()
      qf.insert('a')
      const cloned = qf.clone()
      cloned.insert('b')
      expect(qf.size).toBe(1)
      expect(cloned.size).toBe(2)
    })

    it('should not affect clone when original is modified', () => {
      const qf = new QuotientFilter()
      qf.insert('a')
      const cloned = qf.clone()
      qf.insert('c')
      expect(cloned.size).toBe(1)
      expect(qf.size).toBe(2)
    })

    it('should preserve capacity', () => {
      const qf = new QuotientFilter({ expectedItems: 500 })
      const cloned = qf.clone()
      expect(cloned.capacity).toBe(qf.capacity)
    })

    it('should preserve falsePositiveRate', () => {
      const qf = new QuotientFilter({ falsePositiveRate: 0.01 })
      qf.insert('a')
      const cloned = qf.clone()
      expect(cloned.falsePositiveRate).toBe(qf.falsePositiveRate)
    })

    it('should clone empty filter', () => {
      const qf = new QuotientFilter()
      const cloned = qf.clone()
      expect(cloned.size).toBe(0)
      expect(cloned.isEmpty()).toBe(true)
    })

    it('should not affect original on clear', () => {
      const qf = new QuotientFilter()
      qf.insert('a')
      const cloned = qf.clone()
      cloned.clear()
      expect(qf.size).toBe(1)
      expect(cloned.size).toBe(0)
    })
  })

  describe('static from', () => {
    it('should create filter from array', () => {
      const qf = QuotientFilter.from(['a', 'b', 'c'])
      expect(qf.size).toBe(3)
      expect(qf.mayContain('a')).toBe(true)
      expect(qf.mayContain('b')).toBe(true)
      expect(qf.mayContain('c')).toBe(true)
    })

    it('should create filter from Set', () => {
      const qf = QuotientFilter.from(new Set(['x', 'y']))
      expect(qf.size).toBe(2)
      expect(qf.mayContain('x')).toBe(true)
      expect(qf.mayContain('y')).toBe(true)
    })

    it('should create filter with options', () => {
      const qf = QuotientFilter.from(['a', 'b'], { expectedItems: 100, falsePositiveRate: 0.01 })
      expect(qf.size).toBe(2)
      expect(qf.capacity).toBeGreaterThanOrEqual(100)
    })

    it('should create filter from empty iterable', () => {
      const qf = QuotientFilter.from([])
      expect(qf.size).toBe(0)
      expect(qf.isEmpty()).toBe(true)
    })

    it('should create filter from numbers', () => {
      const qf = QuotientFilter.from([1, 2, 3])
      expect(qf.size).toBe(3)
      expect(qf.mayContain(2)).toBe(true)
    })

    it('should create filter from generator', () => {
      function* gen() {
        yield 'a'
        yield 'b'
      }
      const qf = QuotientFilter.from(gen())
      expect(qf.size).toBe(2)
    })

    it('should create filter from single item array', () => {
      const qf = QuotientFilter.from(['only'])
      expect(qf.size).toBe(1)
      expect(qf.mayContain('only')).toBe(true)
    })
  })

  describe('stats', () => {
    it('should return stats for empty filter', () => {
      const qf = new QuotientFilter({ expectedItems: 100, falsePositiveRate: 0.01 })
      const stats = qf.stats()
      expect(stats.size).toBe(0)
      expect(stats.capacity).toBeGreaterThan(0)
      expect(stats.loadFactor).toBe(0)
      expect(stats.falsePositiveRate).toBe(0)
      expect(stats.quotientBits).toBeGreaterThan(0)
      expect(stats.remainderBits).toBeGreaterThan(0)
    })

    it('should return correct stats after inserts', () => {
      const qf = new QuotientFilter({ expectedItems: 100, falsePositiveRate: 0.01 })
      qf.insert('a')
      qf.insert('b')
      const stats = qf.stats()
      expect(stats.size).toBe(2)
      expect(stats.loadFactor).toBeGreaterThan(0)
      expect(stats.falsePositiveRate).toBeGreaterThan(0)
    })

    it('should have loadFactor between 0 and 1', () => {
      const qf = new QuotientFilter({ expectedItems: 100 })
      qf.insert('a')
      const stats = qf.stats()
      expect(stats.loadFactor).toBeGreaterThanOrEqual(0)
      expect(stats.loadFactor).toBeLessThanOrEqual(1)
    })

    it('should have quotientBits consistent with capacity', () => {
      const qf = new QuotientFilter({ expectedItems: 100 })
      const stats = qf.stats()
      expect(1 << stats.quotientBits).toBe(qf.capacity)
    })

    it('should have correct fields', () => {
      const qf = new QuotientFilter()
      const stats = qf.stats()
      expect(stats).toHaveProperty('size')
      expect(stats).toHaveProperty('capacity')
      expect(stats).toHaveProperty('loadFactor')
      expect(stats).toHaveProperty('falsePositiveRate')
      expect(stats).toHaveProperty('quotientBits')
      expect(stats).toHaveProperty('remainderBits')
    })

    it('should update stats after insert', () => {
      const qf = new QuotientFilter({ expectedItems: 100 })
      const before = qf.stats()
      qf.insert('test')
      const after = qf.stats()
      expect(after.size).toBe(before.size + 1)
      expect(after.loadFactor).toBeGreaterThan(before.loadFactor)
    })

    it('should update stats after remove', () => {
      const qf = new QuotientFilter({ expectedItems: 100 })
      qf.insert('a')
      const before = qf.stats()
      qf.remove('a')
      const after = qf.stats()
      expect(after.size).toBe(before.size - 1)
    })

    it('should have quotientBits > 0', () => {
      const qf = new QuotientFilter({ expectedItems: 10 })
      expect(qf.stats().quotientBits).toBeGreaterThan(0)
    })

    it('should have remainderBits > 0', () => {
      const qf = new QuotientFilter({ falsePositiveRate: 0.01 })
      expect(qf.stats().remainderBits).toBeGreaterThan(0)
    })
  })

  describe('edge cases', () => {
    it('should handle single item lifecycle', () => {
      const qf = new QuotientFilter()
      qf.insert('test')
      expect(qf.mayContain('test')).toBe(true)
      expect(qf.remove('test')).toBe(true)
      expect(qf.mayContain('test')).toBe(false)
      expect(qf.size).toBe(0)
    })

    it('should handle inserting same item many times', () => {
      const qf = new QuotientFilter({ expectedItems: 100 })
      for (let i = 0; i < 50; i++) {
        qf.insert('same')
      }
      expect(qf.size).toBe(50)
      expect(qf.mayContain('same')).toBe(true)
    })

    it('should handle many unique items', () => {
      const qf = new QuotientFilter({ expectedItems: 500, falsePositiveRate: 0.01 })
      const items: string[] = []
      for (let i = 0; i < 200; i++) {
        const item = `item-${i}`
        items.push(item)
        qf.insert(item)
      }
      expect(qf.size).toBe(200)
      for (const item of items) {
        expect(qf.mayContain(item)).toBe(true)
      }
    })

    it('should handle remove non-existent from non-empty filter', () => {
      const qf = new QuotientFilter()
      qf.insert('a')
      expect(qf.remove('z')).toBe(false)
      expect(qf.size).toBe(1)
    })

    it('should handle sequential insert and remove', () => {
      const qf = new QuotientFilter({ expectedItems: 100 })
      for (let i = 0; i < 50; i++) {
        qf.insert(`item-${i}`)
      }
      expect(qf.size).toBe(50)
      for (let i = 0; i < 25; i++) {
        qf.remove(`item-${i}`)
      }
      expect(qf.size).toBe(25)
      for (let i = 25; i < 50; i++) {
        expect(qf.mayContain(`item-${i}`)).toBe(true)
      }
    })

    it('should handle cloning after many operations', () => {
      const qf = new QuotientFilter({ expectedItems: 200 })
      for (let i = 0; i < 100; i++) {
        qf.insert(`item-${i}`)
      }
      const cloned = qf.clone()
      expect(cloned.size).toBe(qf.size)
      for (let i = 0; i < 100; i++) {
        expect(cloned.mayContain(`item-${i}`)).toBe(true)
      }
    })

    it('should handle special characters in strings', () => {
      const qf = new QuotientFilter()
      qf.insert('hello\nworld')
      qf.insert('tab\there')
      qf.insert('emoji 🎉')
      expect(qf.mayContain('hello\nworld')).toBe(true)
      expect(qf.mayContain('tab\there')).toBe(true)
      expect(qf.mayContain('emoji 🎉')).toBe(true)
    })

    it('should handle very long strings', () => {
      const qf = new QuotientFilter()
      const longStr = 'a'.repeat(10000)
      qf.insert(longStr)
      expect(qf.mayContain(longStr)).toBe(true)
    })

    it('should handle mixed type operations', () => {
      const qf = new QuotientFilter<number>()
      for (let i = 0; i < 50; i++) {
        qf.insert(i)
      }
      expect(qf.size).toBe(50)
      expect(qf.mayContain(25)).toBe(true)
      expect(qf.remove(25)).toBe(true)
      expect(qf.size).toBe(49)
    })

    it('should handle insert after remove', () => {
      const qf = new QuotientFilter()
      qf.insert('a')
      qf.insert('b')
      qf.remove('a')
      qf.insert('c')
      expect(qf.size).toBe(2)
      expect(qf.mayContain('b')).toBe(true)
      expect(qf.mayContain('c')).toBe(true)
    })

    it('should handle clear and reuse', () => {
      const qf = new QuotientFilter()
      qf.insert('a')
      qf.insert('b')
      qf.clear()
      expect(qf.isEmpty()).toBe(true)
      qf.insert('c')
      expect(qf.size).toBe(1)
      expect(qf.mayContain('c')).toBe(true)
    })

    it('should handle remove from filter with one item', () => {
      const qf = new QuotientFilter()
      qf.insert('only')
      expect(qf.remove('only')).toBe(true)
      expect(qf.size).toBe(0)
      expect(qf.isEmpty()).toBe(true)
    })
  })

  describe('false positive rate measurement', () => {
    it('should have low FP rate for sparse filter', () => {
      const qf = new QuotientFilter({ expectedItems: 1000, falsePositiveRate: 0.01 })
      for (let i = 0; i < 50; i++) {
        qf.insert(`item-${i}`)
      }
      let falsePositives = 0
      const trials = 1000
      for (let i = 0; i < trials; i++) {
        if (qf.mayContain(`nonexistent-${i}`)) falsePositives++
      }
      const measuredRate = falsePositives / trials
      expect(measuredRate).toBeLessThan(0.1)
    })

    it('should have no false negatives', () => {
      const qf = new QuotientFilter({ expectedItems: 500, falsePositiveRate: 0.01 })
      const items: string[] = []
      for (let i = 0; i < 100; i++) {
        items.push(`item-${i}`)
        qf.insert(`item-${i}`)
      }
      for (const item of items) {
        expect(qf.mayContain(item)).toBe(true)
      }
    })

    it('should have theoretical FP rate close to 2^-r', () => {
      const qf = new QuotientFilter({ expectedItems: 100, falsePositiveRate: 0.01 })
      qf.insert('a')
      const fp = qf.falsePositiveRate
      expect(fp).toBeGreaterThan(0)
      expect(fp).toBeLessThanOrEqual(0.01)
    })

    it('should measure FP rate with larger filter', () => {
      const qf = new QuotientFilter({ expectedItems: 500, falsePositiveRate: 0.01 })
      for (let i = 0; i < 100; i++) {
        qf.insert(`item-${i}`)
      }
      let fp = 0
      const trials = 500
      for (let i = 0; i < trials; i++) {
        if (qf.mayContain(`miss-${i}`)) fp++
      }
      const rate = fp / trials
      expect(rate).toBeLessThan(0.15)
    })
  })

  describe('large filters', () => {
    it('should handle 1000 inserts', () => {
      const qf = new QuotientFilter({ expectedItems: 2000, falsePositiveRate: 0.01 })
      for (let i = 0; i < 1000; i++) {
        qf.insert(`item-${i}`)
      }
      expect(qf.size).toBe(1000)
    })

    it('should handle 1000 lookups', () => {
      const qf = new QuotientFilter({ expectedItems: 2000, falsePositiveRate: 0.01 })
      for (let i = 0; i < 500; i++) {
        qf.insert(`item-${i}`)
      }
      for (let i = 0; i < 500; i++) {
        expect(qf.mayContain(`item-${i}`)).toBe(true)
      }
    })

    it('should handle 500 inserts and 250 removes', () => {
      const qf = new QuotientFilter({ expectedItems: 1000, falsePositiveRate: 0.01 })
      for (let i = 0; i < 500; i++) {
        qf.insert(`item-${i}`)
      }
      for (let i = 0; i < 250; i++) {
        qf.remove(`item-${i}`)
      }
      expect(qf.size).toBe(250)
      for (let i = 250; i < 500; i++) {
        expect(qf.mayContain(`item-${i}`)).toBe(true)
      }
    })

    it('should handle large number of clones', () => {
      const qf = new QuotientFilter({ expectedItems: 200 })
      for (let i = 0; i < 100; i++) {
        qf.insert(`item-${i}`)
      }
      const clones: QuotientFilter[] = []
      for (let i = 0; i < 10; i++) {
        clones.push(qf.clone())
      }
      for (const clone of clones) {
        expect(clone.size).toBe(100)
      }
    })

    it('should handle many clear and refill cycles', () => {
      const qf = new QuotientFilter({ expectedItems: 100 })
      for (let cycle = 0; cycle < 5; cycle++) {
        for (let i = 0; i < 50; i++) {
          qf.insert(`cycle-${cycle}-item-${i}`)
        }
        expect(qf.size).toBe(50)
        qf.clear()
        expect(qf.size).toBe(0)
      }
    })
  })

  describe('integration', () => {
    it('should work as a set-like structure', () => {
      const qf = new QuotientFilter({ expectedItems: 100, falsePositiveRate: 0.01 })
      const added: string[] = []
      for (let i = 0; i < 50; i++) {
        const item = `item-${Math.floor(Math.random() * 100)}`
        added.push(item)
        qf.insert(item)
      }
      for (const item of added) {
        expect(qf.mayContain(item)).toBe(true)
      }
    })

    it('should work with from and subsequent operations', () => {
      const qf = QuotientFilter.from(['a', 'b', 'c'], { expectedItems: 100 })
      expect(qf.size).toBe(3)
      qf.insert('d')
      expect(qf.size).toBe(4)
      expect(qf.remove('a')).toBe(true)
      expect(qf.size).toBe(3)
      const cloned = qf.clone()
      expect(cloned.size).toBe(3)
    })

    it('should handle from with empty array and then insert', () => {
      const qf = QuotientFilter.from([])
      qf.insert('a')
      expect(qf.size).toBe(1)
      expect(qf.mayContain('a')).toBe(true)
    })

    it('should maintain consistency across operations', () => {
      const qf = new QuotientFilter({ expectedItems: 200, falsePositiveRate: 0.01 })
      const items: string[] = []
      for (let i = 0; i < 100; i++) {
        items.push(`item-${i}`)
        qf.insert(`item-${i}`)
      }
      expect(qf.size).toBe(100)
      for (let i = 0; i < 50; i++) {
        qf.remove(`item-${i}`)
      }
      expect(qf.size).toBe(50)
      for (let i = 50; i < 100; i++) {
        expect(qf.mayContain(`item-${i}`)).toBe(true)
      }
      const cloned = qf.clone()
      expect(cloned.size).toBe(50)
      qf.clear()
      expect(qf.size).toBe(0)
      expect(cloned.size).toBe(50)
    })

    it('should handle alternating insert and remove', () => {
      const qf = new QuotientFilter({ expectedItems: 100 })
      for (let i = 0; i < 20; i++) {
        qf.insert(`item-${i}`)
        if (i % 2 === 0) {
          qf.remove(`item-${i}`)
        }
      }
      expect(qf.size).toBe(10)
    })
  })

  describe('quotient and remainder bit calculations', () => {
    it('should calculate quotient bits correctly for small sets', () => {
      const qf = new QuotientFilter({ expectedItems: 2 })
      expect(qf.capacity).toBeGreaterThanOrEqual(2)
    })

    it('should calculate quotient bits correctly for medium sets', () => {
      const qf = new QuotientFilter({ expectedItems: 1024 })
      expect(qf.capacity).toBeGreaterThanOrEqual(1024)
    })

    it('should calculate remainder bits correctly for tight FP', () => {
      const qf = new QuotientFilter({ expectedItems: 100, falsePositiveRate: 0.001 })
      qf.insert('a')
      expect(qf.falsePositiveRate).toBeLessThanOrEqual(0.001)
    })

    it('should calculate remainder bits correctly for loose FP', () => {
      const qf = new QuotientFilter({ expectedItems: 100, falsePositiveRate: 0.1 })
      qf.insert('a')
      expect(qf.falsePositiveRate).toBeGreaterThan(0)
    })
  })

  describe('type safety', () => {
    it('should work with string type', () => {
      const qf = new QuotientFilter<string>()
      qf.insert('hello')
      expect(qf.mayContain('hello')).toBe(true)
    })

    it('should work with number type', () => {
      const qf = new QuotientFilter<number>()
      qf.insert(42)
      expect(qf.mayContain(42)).toBe(true)
    })

    it('should work with object type', () => {
      const qf = new QuotientFilter<{ name: string }>()
      qf.insert({ name: 'test' })
      expect(qf.mayContain({ name: 'test' })).toBe(true)
    })

    it('should work with from and generic type', () => {
      const qf = QuotientFilter.from<number>([1, 2, 3])
      expect(qf.size).toBe(3)
      expect(qf.mayContain(2)).toBe(true)
    })
  })

  describe('stress tests', () => {
    it('should handle burst of inserts', () => {
      const qf = new QuotientFilter({ expectedItems: 1000, falsePositiveRate: 0.01 })
      for (let i = 0; i < 500; i++) {
        qf.insert(`burst-${i}`)
      }
      expect(qf.size).toBe(500)
    })

    it('should handle burst of lookups', () => {
      const qf = new QuotientFilter({ expectedItems: 1000, falsePositiveRate: 0.01 })
      for (let i = 0; i < 200; i++) {
        qf.insert(`item-${i}`)
      }
      for (let i = 0; i < 200; i++) {
        qf.mayContain(`item-${i}`)
        qf.mayContain(`miss-${i}`)
      }
      expect(qf.size).toBe(200)
    })

    it('should handle interleaved operations', () => {
      const qf = new QuotientFilter({ expectedItems: 500, falsePositiveRate: 0.01 })
      for (let i = 0; i < 100; i++) {
        qf.insert(`a-${i}`)
        qf.insert(`b-${i}`)
        qf.remove(`a-${i}`)
      }
      expect(qf.size).toBe(100)
      for (let i = 0; i < 100; i++) {
        expect(qf.mayContain(`b-${i}`)).toBe(true)
      }
    })
  })

  describe('from with various iterables', () => {
    it('should work with array of strings', () => {
      const qf = QuotientFilter.from(['x', 'y', 'z'])
      expect(qf.size).toBe(3)
    })

    it('should work with custom iterable', () => {
      const custom = {
        *[Symbol.iterator]() {
          yield 'a'
          yield 'b'
          yield 'c'
        },
      }
      const qf = QuotientFilter.from(custom)
      expect(qf.size).toBe(3)
    })

    it('should work with string array and options', () => {
      const qf = QuotientFilter.from(['1', '2', '3'], {
        expectedItems: 500,
        falsePositiveRate: 0.001,
      })
      expect(qf.size).toBe(3)
      expect(qf.capacity).toBeGreaterThanOrEqual(500)
    })
  })

  describe('remove edge cases', () => {
    it('should handle removing first inserted item', () => {
      const qf = new QuotientFilter({ expectedItems: 100 })
      qf.insert('first')
      qf.insert('second')
      qf.insert('third')
      expect(qf.remove('first')).toBe(true)
      expect(qf.size).toBe(2)
      expect(qf.mayContain('second')).toBe(true)
      expect(qf.mayContain('third')).toBe(true)
    })

    it('should handle removing last inserted item', () => {
      const qf = new QuotientFilter({ expectedItems: 100 })
      qf.insert('first')
      qf.insert('second')
      qf.insert('third')
      expect(qf.remove('third')).toBe(true)
      expect(qf.size).toBe(2)
      expect(qf.mayContain('first')).toBe(true)
      expect(qf.mayContain('second')).toBe(true)
    })

    it('should handle removing middle item', () => {
      const qf = new QuotientFilter({ expectedItems: 100 })
      qf.insert('first')
      qf.insert('second')
      qf.insert('third')
      expect(qf.remove('second')).toBe(true)
      expect(qf.size).toBe(2)
      expect(qf.mayContain('first')).toBe(true)
      expect(qf.mayContain('third')).toBe(true)
    })

    it('should handle removing and re-inserting same item', () => {
      const qf = new QuotientFilter()
      qf.insert('test')
      qf.remove('test')
      qf.insert('test')
      expect(qf.size).toBe(1)
      expect(qf.mayContain('test')).toBe(true)
    })

    it('should handle removing item that was never added', () => {
      const qf = new QuotientFilter({ expectedItems: 100 })
      qf.insert('a')
      qf.insert('b')
      expect(qf.remove('c')).toBe(false)
      expect(qf.size).toBe(2)
    })
  })

  describe('clone edge cases', () => {
    it('should deep copy data', () => {
      const qf = new QuotientFilter({ expectedItems: 100 })
      qf.insert('x')
      const c = qf.clone()
      c.remove('x')
      expect(qf.mayContain('x')).toBe(true)
      expect(qf.size).toBe(1)
    })

    it('should clone filter with many items', () => {
      const qf = new QuotientFilter({ expectedItems: 500 })
      for (let i = 0; i < 200; i++) {
        qf.insert(`item-${i}`)
      }
      const c = qf.clone()
      expect(c.size).toBe(200)
      c.clear()
      expect(qf.size).toBe(200)
    })

    it('should clone after remove operations', () => {
      const qf = new QuotientFilter({ expectedItems: 100 })
      qf.insert('a')
      qf.insert('b')
      qf.insert('c')
      qf.remove('b')
      const c = qf.clone()
      expect(c.size).toBe(2)
      expect(c.mayContain('a')).toBe(true)
      expect(c.mayContain('c')).toBe(true)
    })
  })

  describe('stats edge cases', () => {
    it('should show 0 load factor for empty filter', () => {
      const qf = new QuotientFilter()
      expect(qf.stats().loadFactor).toBe(0)
    })

    it('should show load factor increasing with inserts', () => {
      const qf = new QuotientFilter({ expectedItems: 100 })
      const lf1 = qf.stats().loadFactor
      qf.insert('a')
      const lf2 = qf.stats().loadFactor
      expect(lf2).toBeGreaterThan(lf1)
    })

    it('should show correct capacity in stats', () => {
      const qf = new QuotientFilter({ expectedItems: 100 })
      expect(qf.stats().capacity).toBe(qf.capacity)
    })

    it('should show size 0 after clear in stats', () => {
      const qf = new QuotientFilter()
      qf.insert('a')
      qf.clear()
      expect(qf.stats().size).toBe(0)
    })
  })

  describe('empty string and boundary values', () => {
    it('should handle empty string insert and lookup', () => {
      const qf = new QuotientFilter()
      qf.insert('')
      expect(qf.mayContain('')).toBe(true)
    })

    it('should handle empty string remove', () => {
      const qf = new QuotientFilter()
      qf.insert('')
      expect(qf.remove('')).toBe(true)
      expect(qf.size).toBe(0)
    })

    it('should handle zero as number', () => {
      const qf = new QuotientFilter<number>()
      qf.insert(0)
      expect(qf.mayContain(0)).toBe(true)
    })

    it('should handle negative numbers', () => {
      const qf = new QuotientFilter<number>()
      qf.insert(-1)
      qf.insert(-42)
      expect(qf.mayContain(-1)).toBe(true)
      expect(qf.mayContain(-42)).toBe(true)
    })
  })
})
