import { describe, it, expect, beforeEach } from 'vitest'
import { CuckooFilter } from '../../src/core/cuckoo-filter/cuckoo-filter.js'
import { DEFAULT_CUCKOO_FILTER_OPTIONS } from '../../src/core/cuckoo-filter/types.js'
import type { CuckooFilterOptions } from '../../src/core/cuckoo-filter/types.js'

describe('CuckooFilter', () => {
  let filter: CuckooFilter<string>

  beforeEach(() => {
    filter = new CuckooFilter(1024)
  })

  describe('constructor', () => {
    it('should create a filter with default capacity', () => {
      const f = new CuckooFilter()
      expect(f.capacity).toBe(DEFAULT_CUCKOO_FILTER_OPTIONS.capacity)
    })

    it('should create a filter with custom capacity', () => {
      const f = new CuckooFilter(500)
      expect(f.capacity).toBe(500)
    })

    it('should create a filter with custom bucket size', () => {
      const f = new CuckooFilter(1024, 8)
      expect(f.capacity).toBe(1024)
    })

    it('should create a filter with custom fingerprint size', () => {
      const f = new CuckooFilter(1024, 4, 12)
      expect(f.capacity).toBe(1024)
    })

    it('should create a filter with custom max kicks', () => {
      const f = new CuckooFilter(1024, 4, 8, 100)
      expect(f.capacity).toBe(1024)
    })

    it('should create a filter with all custom parameters', () => {
      const f = new CuckooFilter(2048, 6, 10, 200)
      expect(f.capacity).toBe(2048)
    })

    it('should start with size 0', () => {
      expect(filter.size).toBe(0)
    })

    it('should start with loadFactor 0', () => {
      expect(filter.loadFactor).toBe(0)
    })

    it('should have 0 falsePositiveRate when empty', () => {
      expect(filter.falsePositiveRate).toBe(0)
    })

    it('should create with small capacity', () => {
      const f = new CuckooFilter(16)
      expect(f.capacity).toBe(16)
    })

    it('should create with capacity 1', () => {
      const f = new CuckooFilter(1)
      expect(f.capacity).toBe(1)
    })

    it('should create with large capacity', () => {
      const f = new CuckooFilter(100000)
      expect(f.capacity).toBe(100000)
    })
  })

  describe('add', () => {
    it('should add a single item and return true', () => {
      expect(filter.add('hello')).toBe(true)
    })

    it('should increment size after adding', () => {
      filter.add('hello')
      expect(filter.size).toBe(1)
    })

    it('should add multiple different items', () => {
      filter.add('a')
      filter.add('b')
      filter.add('c')
      expect(filter.size).toBe(3)
    })

    it('should allow duplicate items', () => {
      filter.add('test')
      filter.add('test')
      expect(filter.size).toBe(2)
    })

    it('should handle empty string', () => {
      expect(filter.add('')).toBe(true)
      expect(filter.size).toBe(1)
    })

    it('should handle unicode strings', () => {
      expect(filter.add('日本語')).toBe(true)
      expect(filter.add('🎉🚀')).toBe(true)
      expect(filter.size).toBe(2)
    })

    it('should handle very long strings', () => {
      const longStr = 'a'.repeat(10000)
      expect(filter.add(longStr)).toBe(true)
      expect(filter.size).toBe(1)
    })

    it('should handle strings with special characters', () => {
      filter.add('hello\nworld\t!')
      filter.add('path/to/file.ts')
      expect(filter.size).toBe(2)
    })

    it('should handle numeric strings', () => {
      filter.add('123')
      filter.add('456')
      expect(filter.size).toBe(2)
    })

    it('should handle whitespace-only strings', () => {
      filter.add('   ')
      filter.add('\t')
      filter.add('\n')
      expect(filter.size).toBe(3)
    })

    it('should return false when filter is full', () => {
      const f = new CuckooFilter(8, 2, 4, 10)
      const added: boolean[] = []
      for (let i = 0; i < 20; i++) {
        added.push(f.add(`item-${i}`))
      }
      expect(added.some((r) => r === false)).toBe(true)
    })

    it('should handle adding after removal', () => {
      filter.add('test')
      filter.remove('test')
      expect(filter.add('test')).toBe(true)
      expect(filter.size).toBe(1)
    })

    it('should handle adding after clear', () => {
      filter.add('before')
      filter.clear()
      expect(filter.add('after')).toBe(true)
      expect(filter.size).toBe(1)
    })

    it('should update loadFactor after adding', () => {
      expect(filter.loadFactor).toBe(0)
      filter.add('item')
      expect(filter.loadFactor).toBeGreaterThan(0)
    })

    it('should handle strings with special regex characters', () => {
      expect(filter.add('!@#$%^&*()')).toBe(true)
      expect(filter.contains('!@#$%^&*()')).toBe(true)
    })
  })

  describe('contains', () => {
    it('should return true for an added item', () => {
      filter.add('hello')
      expect(filter.contains('hello')).toBe(true)
    })

    it('should return false for an item not added', () => {
      filter.add('hello')
      expect(filter.contains('world')).toBe(false)
    })

    it('should return false for empty filter', () => {
      expect(filter.contains('anything')).toBe(false)
    })

    it('should find multiple added items', () => {
      filter.add('a')
      filter.add('b')
      filter.add('c')
      expect(filter.contains('a')).toBe(true)
      expect(filter.contains('b')).toBe(true)
      expect(filter.contains('c')).toBe(true)
    })

    it('should handle empty string lookup', () => {
      filter.add('')
      expect(filter.contains('')).toBe(true)
    })

    it('should handle unicode string lookup', () => {
      filter.add('日本語')
      expect(filter.contains('日本語')).toBe(true)
      expect(filter.contains('English')).toBe(false)
    })

    it('should find items after many adds', () => {
      for (let i = 0; i < 100; i++) {
        filter.add(`item-${i}`)
      }
      expect(filter.contains('item-0')).toBe(true)
      expect(filter.contains('item-50')).toBe(true)
      expect(filter.contains('item-99')).toBe(true)
    })

    it('should handle duplicate adds consistently', () => {
      filter.add('test')
      filter.add('test')
      expect(filter.contains('test')).toBe(true)
    })

    it('should return false after item is removed', () => {
      filter.add('removeme')
      filter.remove('removeme')
      expect(filter.contains('removeme')).toBe(false)
    })

    it('should handle case sensitivity', () => {
      filter.add('Hello')
      expect(filter.contains('Hello')).toBe(true)
      expect(filter.contains('hello')).toBe(false)
    })

    it('should handle strings with null characters', () => {
      filter.add('before\0after')
      expect(filter.contains('before\0after')).toBe(true)
    })

    it('should handle mixed unicode content', () => {
      filter.add('hello世界🎉')
      expect(filter.contains('hello世界🎉')).toBe(true)
      expect(filter.contains('hello世界')).toBe(false)
    })

    it('should never have false negatives', () => {
      for (let i = 0; i < 200; i++) {
        filter.add(`item-${i}`)
      }
      for (let i = 0; i < 200; i++) {
        expect(filter.contains(`item-${i}`)).toBe(true)
      }
    })

    it('should return false after clear', () => {
      filter.add('test')
      filter.clear()
      expect(filter.contains('test')).toBe(false)
    })

    it('should not find similar strings', () => {
      filter.add('hello')
      expect(filter.contains('hell')).toBe(false)
      expect(filter.contains('helloo')).toBe(false)
    })
  })

  describe('remove', () => {
    it('should remove an added item', () => {
      filter.add('hello')
      expect(filter.remove('hello')).toBe(true)
      expect(filter.size).toBe(0)
    })

    it('should return false for item not present', () => {
      expect(filter.remove('absent')).toBe(false)
    })

    it('should return false when removing from empty filter', () => {
      expect(filter.remove('anything')).toBe(false)
    })

    it('should handle removing one of duplicates', () => {
      filter.add('test')
      filter.add('test')
      expect(filter.remove('test')).toBe(true)
      expect(filter.size).toBe(1)
      expect(filter.contains('test')).toBe(true)
    })

    it('should not affect other items when removing', () => {
      filter.add('a')
      filter.add('b')
      filter.remove('a')
      expect(filter.contains('b')).toBe(true)
    })

    it('should handle remove of empty string', () => {
      filter.add('')
      expect(filter.remove('')).toBe(true)
      expect(filter.size).toBe(0)
    })

    it('should handle remove of unicode string', () => {
      filter.add('日本語')
      expect(filter.remove('日本語')).toBe(true)
      expect(filter.contains('日本語')).toBe(false)
    })

    it('should handle sequential remove operations', () => {
      filter.add('a')
      filter.add('b')
      filter.add('c')
      expect(filter.remove('b')).toBe(true)
      expect(filter.size).toBe(2)
      expect(filter.remove('a')).toBe(true)
      expect(filter.size).toBe(1)
      expect(filter.remove('c')).toBe(true)
      expect(filter.size).toBe(0)
    })

    it('should return false on second remove of same item', () => {
      filter.add('once')
      expect(filter.remove('once')).toBe(true)
      expect(filter.remove('once')).toBe(false)
    })

    it('should decrement size on successful remove', () => {
      filter.add('item')
      const sizeBefore = filter.size
      filter.remove('item')
      expect(filter.size).toBe(sizeBefore - 1)
    })

    it('should not decrement size on failed remove', () => {
      filter.add('present')
      const sizeBefore = filter.size
      filter.remove('absent')
      expect(filter.size).toBe(sizeBefore)
    })

    it('should handle remove of very long string', () => {
      const longKey = 'x'.repeat(100000)
      filter.add(longKey)
      expect(filter.remove(longKey)).toBe(true)
      expect(filter.contains(longKey)).toBe(false)
    })

    it('should handle remove on non-empty filter for absent item', () => {
      filter.add('present')
      expect(filter.remove('absent')).toBe(false)
      expect(filter.size).toBe(1)
    })
  })

  describe('capacity', () => {
    it('should return the configured capacity', () => {
      expect(filter.capacity).toBe(1024)
    })

    it('should return custom capacity', () => {
      const f = new CuckooFilter(500)
      expect(f.capacity).toBe(500)
    })

    it('should not change after operations', () => {
      filter.add('test')
      expect(filter.capacity).toBe(1024)
    })

    it('should not change after clear', () => {
      filter.add('test')
      filter.clear()
      expect(filter.capacity).toBe(1024)
    })

    it('should not change after remove', () => {
      filter.add('test')
      filter.remove('test')
      expect(filter.capacity).toBe(1024)
    })
  })

  describe('size', () => {
    it('should return 0 for new filter', () => {
      expect(filter.size).toBe(0)
    })

    it('should return 1 after one add', () => {
      filter.add('item')
      expect(filter.size).toBe(1)
    })

    it('should track multiple adds', () => {
      filter.add('a')
      filter.add('b')
      filter.add('c')
      expect(filter.size).toBe(3)
    })

    it('should count duplicate adds', () => {
      filter.add('test')
      filter.add('test')
      expect(filter.size).toBe(2)
    })

    it('should decrease after remove', () => {
      filter.add('item')
      filter.remove('item')
      expect(filter.size).toBe(0)
    })

    it('should not decrease after failed remove', () => {
      filter.add('present')
      filter.remove('absent')
      expect(filter.size).toBe(1)
    })

    it('should handle many items', () => {
      for (let i = 0; i < 100; i++) {
        filter.add(`item-${i}`)
      }
      expect(filter.size).toBe(100)
    })

    it('should reset to 0 after clear', () => {
      filter.add('a')
      filter.add('b')
      filter.clear()
      expect(filter.size).toBe(0)
    })
  })

  describe('loadFactor', () => {
    it('should return 0 for empty filter', () => {
      expect(filter.loadFactor).toBe(0)
    })

    it('should increase after adding items', () => {
      filter.add('item')
      expect(filter.loadFactor).toBeGreaterThan(0)
    })

    it('should decrease after removing items', () => {
      filter.add('item')
      const lfAfterAdd = filter.loadFactor
      filter.remove('item')
      expect(filter.loadFactor).toBeLessThan(lfAfterAdd)
    })

    it('should be between 0 and 1', () => {
      for (let i = 0; i < 100; i++) {
        filter.add(`item-${i}`)
      }
      expect(filter.loadFactor).toBeGreaterThanOrEqual(0)
      expect(filter.loadFactor).toBeLessThanOrEqual(1)
    })

    it('should return 0 after clear', () => {
      filter.add('item')
      filter.clear()
      expect(filter.loadFactor).toBe(0)
    })

    it('should increase with more items', () => {
      filter.add('a')
      const lf1 = filter.loadFactor
      filter.add('b')
      const lf2 = filter.loadFactor
      filter.add('c')
      const lf3 = filter.loadFactor
      expect(lf2).toBeGreaterThanOrEqual(lf1)
      expect(lf3).toBeGreaterThanOrEqual(lf2)
    })

    it('should reflect size relative to total slots', () => {
      const f = new CuckooFilter(8, 4)
      f.add('x')
      expect(f.loadFactor).toBeCloseTo(1 / 8, 1)
    })
  })

  describe('falsePositiveRate', () => {
    it('should return 0 for empty filter', () => {
      expect(filter.falsePositiveRate).toBe(0)
    })

    it('should return a positive value when items are present', () => {
      filter.add('item')
      expect(filter.falsePositiveRate).toBeGreaterThan(0)
    })

    it('should return a value between 0 and 1', () => {
      filter.add('item')
      expect(filter.falsePositiveRate).toBeGreaterThan(0)
      expect(filter.falsePositiveRate).toBeLessThanOrEqual(1)
    })

    it('should be lower with larger fingerprint size', () => {
      const f1 = new CuckooFilter(100, 4, 4)
      const f2 = new CuckooFilter(100, 4, 16)
      f1.add('item')
      f2.add('item')
      expect(f2.falsePositiveRate).toBeLessThan(f1.falsePositiveRate)
    })

    it('should return 0 after clear', () => {
      filter.add('item')
      filter.clear()
      expect(filter.falsePositiveRate).toBe(0)
    })

    it('should be consistent for same configuration', () => {
      filter.add('item')
      const rate1 = filter.falsePositiveRate
      const rate2 = filter.falsePositiveRate
      expect(rate1).toBe(rate2)
    })
  })

  describe('clone', () => {
    it('should create an independent copy', () => {
      filter.add('test')
      const cloned = filter.clone()
      expect(cloned.size).toBe(filter.size)
      expect(cloned.contains('test')).toBe(true)
    })

    it('should not affect original when modified', () => {
      filter.add('shared')
      const cloned = filter.clone()
      cloned.add('new')
      expect(filter.contains('new')).toBe(false)
      expect(cloned.contains('new')).toBe(true)
    })

    it('should not affect clone when original is modified', () => {
      filter.add('shared')
      const cloned = filter.clone()
      filter.add('original-only')
      expect(cloned.contains('original-only')).toBe(false)
    })

    it('should preserve capacity', () => {
      const f = new CuckooFilter(500)
      f.add('test')
      const cloned = f.clone()
      expect(cloned.capacity).toBe(500)
    })

    it('should preserve size', () => {
      filter.add('a')
      filter.add('b')
      const cloned = filter.clone()
      expect(cloned.size).toBe(2)
    })

    it('should preserve loadFactor', () => {
      filter.add('item')
      const cloned = filter.clone()
      expect(cloned.loadFactor).toBe(filter.loadFactor)
    })

    it('should clone an empty filter', () => {
      const cloned = filter.clone()
      expect(cloned.size).toBe(0)
      expect(cloned.loadFactor).toBe(0)
    })

    it('should preserve removal state', () => {
      filter.add('a')
      filter.add('b')
      filter.remove('a')
      const cloned = filter.clone()
      expect(cloned.contains('a')).toBe(false)
      expect(cloned.contains('b')).toBe(true)
      expect(cloned.size).toBe(1)
    })

    it('should be independent after clear of original', () => {
      filter.add('item')
      const cloned = filter.clone()
      filter.clear()
      expect(cloned.contains('item')).toBe(true)
      expect(cloned.size).toBe(1)
    })

    it('should be independent after remove on original', () => {
      filter.add('item')
      const cloned = filter.clone()
      filter.remove('item')
      expect(cloned.contains('item')).toBe(true)
    })
  })

  describe('clear', () => {
    it('should remove all items', () => {
      filter.add('a')
      filter.add('b')
      filter.add('c')
      filter.clear()
      expect(filter.size).toBe(0)
    })

    it('should make the filter empty', () => {
      filter.add('test')
      filter.clear()
      expect(filter.size).toBe(0)
      expect(filter.loadFactor).toBe(0)
    })

    it('should reset contains results', () => {
      filter.add('test')
      filter.clear()
      expect(filter.contains('test')).toBe(false)
    })

    it('should allow adding after clear', () => {
      filter.add('first')
      filter.clear()
      filter.add('second')
      expect(filter.size).toBe(1)
      expect(filter.contains('second')).toBe(true)
    })

    it('should handle clearing an empty filter', () => {
      filter.clear()
      expect(filter.size).toBe(0)
    })

    it('should preserve capacity after clear', () => {
      const cap = filter.capacity
      filter.add('test')
      filter.clear()
      expect(filter.capacity).toBe(cap)
    })

    it('should reset falsePositiveRate', () => {
      filter.add('item')
      filter.clear()
      expect(filter.falsePositiveRate).toBe(0)
    })

    it('should handle multiple clear calls', () => {
      filter.add('a')
      filter.clear()
      filter.clear()
      expect(filter.size).toBe(0)
    })

    it('should allow operations after clear', () => {
      filter.add('before')
      filter.clear()
      filter.add('after')
      expect(filter.contains('after')).toBe(true)
      expect(filter.contains('before')).toBe(false)
    })
  })

  describe('toString', () => {
    it('should return a string representation', () => {
      expect(typeof filter.toString()).toBe('string')
    })

    it('should include capacity', () => {
      const str = filter.toString()
      expect(str).toContain('capacity')
      expect(str).toContain('1024')
    })

    it('should include size', () => {
      filter.add('item')
      const str = filter.toString()
      expect(str).toContain('size')
      expect(str).toContain('1')
    })

    it('should include loadFactor', () => {
      const str = filter.toString()
      expect(str).toContain('loadFactor')
    })

    it('should include falsePositiveRate', () => {
      const str = filter.toString()
      expect(str).toContain('falsePositiveRate')
    })

    it('should show 0 size for empty filter', () => {
      const str = filter.toString()
      expect(str).toContain('size: 0')
    })

    it('should show correct size after adding items', () => {
      filter.add('a')
      filter.add('b')
      filter.add('c')
      const str = filter.toString()
      expect(str).toContain('size: 3')
    })

    it('should start with CuckooFilter', () => {
      const str = filter.toString()
      expect(str).toMatch(/^CuckooFilter/)
    })

    it('should reflect state after clear', () => {
      filter.add('item')
      filter.clear()
      const str = filter.toString()
      expect(str).toContain('size: 0')
    })

    it('should reflect correct capacity', () => {
      const f = new CuckooFilter(500)
      const str = f.toString()
      expect(str).toContain('500')
    })
  })

  describe('edge cases', () => {
    it('should handle very small capacity', () => {
      const f = new CuckooFilter(2)
      f.add('item')
      expect(f.contains('item')).toBe(true)
    })

    it('should handle bucket size of 1', () => {
      const f = new CuckooFilter(16, 1)
      f.add('item')
      expect(f.contains('item')).toBe(true)
    })

    it('should handle large bucket size', () => {
      const f = new CuckooFilter(1024, 16)
      for (let i = 0; i < 100; i++) {
        f.add(`item-${i}`)
      }
      expect(f.size).toBe(100)
    })

    it('should handle fingerprint size of 1', () => {
      const f = new CuckooFilter(64, 4, 1)
      f.add('item')
      expect(f.contains('item')).toBe(true)
    })

    it('should handle maxKicks of 1', () => {
      const f = new CuckooFilter(64, 2, 4, 1)
      f.add('item')
      expect(f.contains('item')).toBe(true)
    })

    it('should handle adding then immediately removing', () => {
      filter.add('test')
      filter.remove('test')
      expect(filter.size).toBe(0)
      expect(filter.contains('test')).toBe(false)
    })

    it('should handle add-remove-add cycles', () => {
      for (let cycle = 0; cycle < 5; cycle++) {
        filter.add('cyclic')
        expect(filter.contains('cyclic')).toBe(true)
        filter.remove('cyclic')
        expect(filter.contains('cyclic')).toBe(false)
      }
      expect(filter.size).toBe(0)
    })

    it('should handle interleaved add and remove of different items', () => {
      filter.add('a')
      filter.add('b')
      filter.remove('a')
      filter.add('c')
      expect(filter.contains('a')).toBe(false)
      expect(filter.contains('b')).toBe(true)
      expect(filter.contains('c')).toBe(true)
      expect(filter.size).toBe(2)
    })

    it('should track size correctly through complex operations', () => {
      filter.add('x')
      filter.add('y')
      filter.add('x')
      filter.remove('x')
      expect(filter.size).toBe(2)
      filter.remove('x')
      expect(filter.size).toBe(1)
      filter.remove('y')
      expect(filter.size).toBe(0)
    })

    it('should handle clone of filter with many operations', () => {
      for (let i = 0; i < 50; i++) {
        filter.add(`item-${i}`)
      }
      for (let i = 0; i < 25; i++) {
        filter.remove(`item-${i}`)
      }
      const cloned = filter.clone()
      for (let i = 25; i < 50; i++) {
        expect(cloned.contains(`item-${i}`)).toBe(true)
      }
      for (let i = 0; i < 25; i++) {
        expect(cloned.contains(`item-${i}`)).toBe(false)
      }
    })

    it('should handle clear followed by immediate operations', () => {
      filter.add('before')
      filter.clear()
      filter.add('after')
      expect(filter.contains('after')).toBe(true)
      expect(filter.contains('before')).toBe(false)
    })

    it('should handle very long string key', () => {
      const longKey = 'x'.repeat(100000)
      filter.add(longKey)
      expect(filter.contains(longKey)).toBe(true)
      expect(filter.remove(longKey)).toBe(true)
      expect(filter.contains(longKey)).toBe(false)
    })

    it('should handle numeric strings', () => {
      filter.add('0')
      filter.add('1')
      filter.add('42')
      expect(filter.contains('0')).toBe(true)
      expect(filter.contains('1')).toBe(true)
      expect(filter.contains('42')).toBe(true)
    })

    it('should handle strings that look like JSON', () => {
      filter.add('{"key":"value"}')
      expect(filter.contains('{"key":"value"}')).toBe(true)
    })

    it('should handle small capacity edge case', () => {
      const f = new CuckooFilter(4, 2, 4, 10)
      f.add('one')
      f.add('two')
      expect(f.contains('one')).toBe(true)
      expect(f.contains('two')).toBe(true)
      f.remove('one')
      expect(f.contains('one')).toBe(false)
      expect(f.contains('two')).toBe(true)
    })

    it('should handle single character strings', () => {
      for (let i = 0; i < 26; i++) {
        filter.add(String.fromCharCode(97 + i))
      }
      expect(filter.size).toBe(26)
      for (let i = 0; i < 26; i++) {
        expect(filter.contains(String.fromCharCode(97 + i))).toBe(true)
      }
    })
  })

  describe('large item sets', () => {
    it('should handle 500 items', () => {
      for (let i = 0; i < 500; i++) {
        filter.add(`item-${i}`)
      }
      expect(filter.size).toBe(500)
      expect(filter.contains('item-0')).toBe(true)
      expect(filter.contains('item-499')).toBe(true)
    })

    it('should handle 500 items with no false negatives', () => {
      for (let i = 0; i < 500; i++) {
        filter.add(`item-${i}`)
      }
      for (let i = 0; i < 500; i++) {
        expect(filter.contains(`item-${i}`)).toBe(true)
      }
    })

    it('should handle removal of large item sets', () => {
      for (let i = 0; i < 200; i++) {
        filter.add(`item-${i}`)
      }
      for (let i = 0; i < 100; i++) {
        filter.remove(`item-${i}`)
      }
      expect(filter.size).toBe(100)
      for (let i = 100; i < 200; i++) {
        expect(filter.contains(`item-${i}`)).toBe(true)
      }
    })

    it('should handle rapid add and check cycles', () => {
      for (let i = 0; i < 200; i++) {
        filter.add(`item-${i}`)
        expect(filter.contains(`item-${i}`)).toBe(true)
      }
    })

    it('should handle many sequential adds', () => {
      for (let i = 0; i < 500; i++) {
        filter.add(`item-${i}`)
      }
      expect(filter.size).toBe(500)
    })

    it('should handle large number of operations', () => {
      for (let i = 0; i < 500; i++) {
        filter.add(`item-${i}`)
      }
      for (let i = 0; i < 250; i++) {
        filter.remove(`item-${i}`)
      }
      expect(filter.size).toBe(250)
      for (let i = 250; i < 500; i++) {
        expect(filter.contains(`item-${i}`)).toBe(true)
      }
    })

    it('should handle removing all items from large set', () => {
      const items = Array.from({ length: 50 }, (_, i) => `item-${i}`)
      for (const item of items) {
        filter.add(item)
      }
      for (const item of items) {
        filter.remove(item)
      }
      expect(filter.size).toBe(0)
    })
  })

  describe('false positive behavior', () => {
    it('should have a reasonable false positive rate', () => {
      const f = new CuckooFilter(10000, 4, 12)
      for (let i = 0; i < 5000; i++) {
        f.add(`item-${i}`)
      }
      let falsePositives = 0
      const trials = 5000
      for (let i = 0; i < trials; i++) {
        if (f.contains(`not-added-${i}`)) {
          falsePositives++
        }
      }
      const observedRate = falsePositives / trials
      expect(observedRate).toBeLessThan(0.15)
    })

    it('should report no false negatives', () => {
      for (let i = 0; i < 200; i++) {
        filter.add(`item-${i}`)
      }
      for (let i = 0; i < 200; i++) {
        expect(filter.contains(`item-${i}`)).toBe(true)
      }
    })
  })

  describe('hash distribution', () => {
    it('should produce consistent results for same string', () => {
      filter.add('consistent')
      const r1 = filter.contains('consistent')
      const r2 = filter.contains('consistent')
      expect(r1).toBe(r2)
      expect(r1).toBe(true)
    })

    it('should handle items with similar content differently', () => {
      filter.add('aaa')
      filter.add('aab')
      filter.add('aba')
      expect(filter.contains('aaa')).toBe(true)
      expect(filter.contains('aab')).toBe(true)
      expect(filter.contains('aba')).toBe(true)
    })

    it('should produce different internal state for different strings', () => {
      filter.add('aaa')
      expect(filter.size).toBe(1)
      filter.add('bbb')
      expect(filter.size).toBe(2)
    })
  })

  describe('add and remove cycles', () => {
    it('should support adding after removal', () => {
      filter.add('test')
      filter.remove('test')
      filter.add('test')
      expect(filter.contains('test')).toBe(true)
      expect(filter.size).toBe(1)
    })

    it('should support multiple add-remove cycles', () => {
      for (let cycle = 0; cycle < 10; cycle++) {
        filter.add(`cyclic-${cycle}`)
        expect(filter.contains(`cyclic-${cycle}`)).toBe(true)
        filter.remove(`cyclic-${cycle}`)
        expect(filter.contains(`cyclic-${cycle}`)).toBe(false)
      }
    })

    it('should handle mixed add and remove', () => {
      filter.add('keep')
      filter.add('remove')
      filter.remove('remove')
      expect(filter.contains('keep')).toBe(true)
      expect(filter.contains('remove')).toBe(false)
    })
  })

  describe('generic type support', () => {
    it('should work with number items', () => {
      const f = new CuckooFilter<number>(64)
      f.add(42)
      f.add(100)
      expect(f.contains(42)).toBe(true)
      expect(f.contains(100)).toBe(true)
      expect(f.contains(999)).toBe(false)
    })

    it('should work with object items', () => {
      const f = new CuckooFilter<{ id: number }>(64)
      f.add({ id: 1 })
      f.add({ id: 2 })
      expect(f.contains({ id: 1 })).toBe(true)
      expect(f.contains({ id: 2 })).toBe(true)
    })

    it('should work with boolean items', () => {
      const f = new CuckooFilter<boolean>(64)
      f.add(true)
      f.add(false)
      expect(f.contains(true)).toBe(true)
      expect(f.contains(false)).toBe(true)
    })

    it('should work with null items', () => {
      const f = new CuckooFilter<null>(64)
      f.add(null)
      expect(f.contains(null)).toBe(true)
    })

    it('should work with array items', () => {
      const f = new CuckooFilter<number[]>(64)
      f.add([1, 2, 3])
      expect(f.contains([1, 2, 3])).toBe(true)
    })

    it('should handle remove with generic types', () => {
      const f = new CuckooFilter<number>(64)
      f.add(42)
      expect(f.remove(42)).toBe(true)
      expect(f.contains(42)).toBe(false)
    })

    it('should handle clone with generic types', () => {
      const f = new CuckooFilter<number>(64)
      f.add(1)
      f.add(2)
      const cloned = f.clone()
      expect(cloned.contains(1)).toBe(true)
      expect(cloned.contains(2)).toBe(true)
      expect(cloned.size).toBe(2)
    })

    it('should handle clear with generic types', () => {
      const f = new CuckooFilter<number>(64)
      f.add(1)
      f.add(2)
      f.clear()
      expect(f.size).toBe(0)
      expect(f.contains(1)).toBe(false)
    })

    it('should handle toString with generic types', () => {
      const f = new CuckooFilter<number>(64)
      f.add(42)
      expect(typeof f.toString()).toBe('string')
      expect(f.toString()).toContain('size: 1')
    })
  })

  describe('type exports', () => {
    it('should export DEFAULT_CUCKOO_FILTER_OPTIONS', () => {
      expect(DEFAULT_CUCKOO_FILTER_OPTIONS.capacity).toBe(1024)
      expect(DEFAULT_CUCKOO_FILTER_OPTIONS.bucketSize).toBe(4)
      expect(DEFAULT_CUCKOO_FILTER_OPTIONS.fingerprintSize).toBe(8)
      expect(DEFAULT_CUCKOO_FILTER_OPTIONS.maxKicks).toBe(500)
    })

    it('should support CuckooFilterOptions interface', () => {
      const opts: CuckooFilterOptions = {
        capacity: 500,
        bucketSize: 4,
        fingerprintSize: 8,
        maxKicks: 200,
      }
      expect(opts.capacity).toBe(500)
      expect(opts.bucketSize).toBe(4)
      expect(opts.fingerprintSize).toBe(8)
      expect(opts.maxKicks).toBe(200)
    })

    it('should have number type for all option fields', () => {
      expect(typeof DEFAULT_CUCKOO_FILTER_OPTIONS.capacity).toBe('number')
      expect(typeof DEFAULT_CUCKOO_FILTER_OPTIONS.bucketSize).toBe('number')
      expect(typeof DEFAULT_CUCKOO_FILTER_OPTIONS.fingerprintSize).toBe('number')
      expect(typeof DEFAULT_CUCKOO_FILTER_OPTIONS.maxKicks).toBe('number')
    })
  })

  describe('stress tests', () => {
    it('should handle many operations in sequence', () => {
      const f = new CuckooFilter(2048, 4, 12)
      for (let i = 0; i < 1000; i++) {
        f.add(`item-${i}`)
      }
      for (let i = 0; i < 500; i++) {
        f.remove(`item-${i}`)
      }
      expect(f.size).toBe(500)
      for (let i = 500; i < 1000; i++) {
        expect(f.contains(`item-${i}`)).toBe(true)
      }
    })

    it('should handle clone after many operations', () => {
      for (let i = 0; i < 200; i++) {
        filter.add(`item-${i}`)
      }
      const cloned = filter.clone()
      for (let i = 0; i < 200; i++) {
        expect(cloned.contains(`item-${i}`)).toBe(true)
      }
    })

    it('should handle clear after many operations', () => {
      for (let i = 0; i < 200; i++) {
        filter.add(`item-${i}`)
      }
      filter.clear()
      expect(filter.size).toBe(0)
      for (let i = 0; i < 200; i++) {
        expect(filter.contains(`item-${i}`)).toBe(false)
      }
    })

    it('should maintain correctness with interleaved operations', () => {
      filter.add('x')
      filter.add('y')
      filter.remove('x')
      filter.add('z')
      expect(filter.contains('x')).toBe(false)
      expect(filter.contains('y')).toBe(true)
      expect(filter.contains('z')).toBe(true)
    })
  })
})
