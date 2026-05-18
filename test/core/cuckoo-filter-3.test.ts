import { describe, it, expect } from 'vitest'
import { CuckooFilter3 } from '../../src/core/cuckoo-filter-3/index.js'

// ─── Constructor ───

describe('CuckooFilter3', () => {
  describe('constructor', () => {
    it('should create a filter with default parameters', () => {
      const filter = new CuckooFilter3(16)
      expect(filter.size).toBe(0)
      expect(filter.isEmpty).toBe(true)
    })

    it('should create a filter with capacity 1', () => {
      const filter = new CuckooFilter3(1)
      expect(filter.size).toBe(0)
    })
  })

  // ─── Properties ───

  describe('properties', () => {
    it('isEmpty should be true when no items inserted', () => {
      const filter = new CuckooFilter3(16)
      expect(filter.isEmpty).toBe(true)
    })

    it('isEmpty should be false after insertion', () => {
      const filter = new CuckooFilter3(16)
      filter.insert('hello')
      expect(filter.isEmpty).toBe(false)
    })

    it('size should track inserted items', () => {
      const filter = new CuckooFilter3(16)
      filter.insert('a')
      filter.insert('b')
      expect(filter.size).toBe(2)
    })

    it('loadFactor should be 0 when empty', () => {
      const filter = new CuckooFilter3(16)
      expect(filter.loadFactor).toBe(0)
    })

    it('loadFactor should increase with insertions', () => {
      const filter = new CuckooFilter3(8)
      filter.insert('x')
      expect(filter.loadFactor).toBeGreaterThan(0)
    })

    it('falsePositiveRate should be 0 when empty', () => {
      const filter = new CuckooFilter3(16)
      expect(filter.falsePositiveRate).toBe(0)
    })

    it('falsePositiveRate should be between 0 and 1 with items', () => {
      const filter = new CuckooFilter3(8)
      filter.insert('item1')
      const rate = filter.falsePositiveRate
      expect(rate).toBeGreaterThan(0)
      expect(rate).toBeLessThan(1)
    })
  })

  // ─── insert / contains ───

  describe('insert and contains', () => {
    it('should insert and find an item', () => {
      const filter = new CuckooFilter3(16)
      expect(filter.insert('hello')).toBe(true)
      expect(filter.contains('hello')).toBe(true)
    })

    it('should not find items that were never inserted', () => {
      const filter = new CuckooFilter3(16)
      filter.insert('hello')
      expect(filter.contains('world')).toBe(false)
    })

    it('should handle multiple insertions', () => {
      const filter = new CuckooFilter3(32)
      const items = ['a', 'b', 'c', 'd', 'e']
      for (const item of items) {
        filter.insert(item)
      }
      for (const item of items) {
        expect(filter.contains(item)).toBe(true)
      }
    })

    it('should allow duplicate insertions', () => {
      const filter = new CuckooFilter3(16)
      filter.insert('dup')
      filter.insert('dup')
      expect(filter.size).toBe(2)
      expect(filter.contains('dup')).toBe(true)
    })

    it('should handle empty string', () => {
      const filter = new CuckooFilter3(16)
      filter.insert('')
      expect(filter.contains('')).toBe(true)
    })

    it('should handle numeric strings', () => {
      const filter = new CuckooFilter3(16)
      filter.insert('123')
      expect(filter.contains('123')).toBe(true)
      expect(filter.contains('124')).toBe(false)
    })
  })

  // ─── remove ───

  describe('remove', () => {
    it('should remove an inserted item', () => {
      const filter = new CuckooFilter3(16)
      filter.insert('hello')
      expect(filter.remove('hello')).toBe(true)
      expect(filter.size).toBe(0)
    })

    it('should return false when removing non-existent item', () => {
      const filter = new CuckooFilter3(16)
      expect(filter.remove('nothing')).toBe(false)
    })

    it('should handle remove after multiple inserts of same item', () => {
      const filter = new CuckooFilter3(16)
      filter.insert('dup')
      filter.insert('dup')
      filter.remove('dup')
      expect(filter.size).toBe(1)
    })

    it('should track size correctly after remove', () => {
      const filter = new CuckooFilter3(32)
      filter.insert('a')
      filter.insert('b')
      filter.insert('c')
      filter.remove('b')
      expect(filter.size).toBe(2)
    })
  })

  // ─── clear ───

  describe('clear', () => {
    it('should reset the filter to empty', () => {
      const filter = new CuckooFilter3(16)
      filter.insert('a')
      filter.insert('b')
      filter.clear()
      expect(filter.isEmpty).toBe(true)
      expect(filter.size).toBe(0)
    })

    it('should not contain items after clear', () => {
      const filter = new CuckooFilter3(16)
      filter.insert('test')
      filter.clear()
      expect(filter.contains('test')).toBe(false)
    })

    it('should allow insertions after clear', () => {
      const filter = new CuckooFilter3(16)
      filter.insert('first')
      filter.clear()
      filter.insert('second')
      expect(filter.contains('second')).toBe(true)
      expect(filter.size).toBe(1)
    })
  })

  // ─── Edge Cases ───

  describe('edge cases', () => {
    it('should handle special characters in strings', () => {
      const filter = new CuckooFilter3(16)
      filter.insert('hello world!')
      filter.insert('\n\t')
      expect(filter.contains('hello world!')).toBe(true)
      expect(filter.contains('\n\t')).toBe(true)
    })

    it('should handle long strings', () => {
      const filter = new CuckooFilter3(16)
      const longStr = 'a'.repeat(1000)
      filter.insert(longStr)
      expect(filter.contains(longStr)).toBe(true)
    })

    it('should insert many items without failure', () => {
      const filter = new CuckooFilter3(100)
      let inserted = 0
      for (let i = 0; i < 20; i++) {
        if (filter.insert(`item-${i}`)) {
          inserted++
        }
      }
      expect(inserted).toBeGreaterThan(0)
    })
  })
})
