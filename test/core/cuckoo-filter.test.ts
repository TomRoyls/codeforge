import { describe, it, expect, beforeEach } from 'vitest'
import { CuckooFilter } from '../../src/core/cuckoo-filter/cuckoo-filter.js'
import { DEFAULT_CUCKOOFILTER_OPTIONS } from '../../src/core/cuckoo-filter/types.js'
import type { CuckooFilterOptions } from '../../src/core/cuckoo-filter/types.js'

describe('CuckooFilter', () => {
  let filter: CuckooFilter

  beforeEach(() => {
    filter = new CuckooFilter()
  })

  describe('constructor', () => {
    it('should create a filter with default options', () => {
      const f = new CuckooFilter()
      expect(f.isEmpty()).toBe(true)
      expect(f.size()).toBe(0)
    })

    it('should accept custom capacity', () => {
      const f = new CuckooFilter({ capacity: 2048 })
      expect(f.capacity()).toBe(2048)
    })

    it('should accept custom bucketSize', () => {
      const f = new CuckooFilter({ bucketSize: 8 })
      expect(f.isEmpty()).toBe(true)
    })

    it('should accept custom maxKicks', () => {
      const f = new CuckooFilter({ maxKicks: 100 })
      expect(f.isEmpty()).toBe(true)
    })

    it('should accept custom fingerprintSize', () => {
      const f = new CuckooFilter({ fingerprintSize: 12 })
      expect(f.isEmpty()).toBe(true)
    })

    it('should accept partial options with defaults', () => {
      const f = new CuckooFilter({ capacity: 500 })
      expect(f.capacity()).toBe(500)
    })

    it('should accept all options combined', () => {
      const f = new CuckooFilter({ capacity: 512, bucketSize: 2, maxKicks: 200, fingerprintSize: 4 })
      expect(f.capacity()).toBe(512)
    })

    it('should create with empty options object', () => {
      const f = new CuckooFilter({})
      expect(f.capacity()).toBe(DEFAULT_CUCKOOFILTER_OPTIONS.capacity)
    })

    it('should have zero fill ratio when empty', () => {
      const f = new CuckooFilter()
      expect(f.fillRatio()).toBe(0)
    })
  })

  describe('add', () => {
    it('should add an item and return true', () => {
      expect(filter.add('hello')).toBe(true)
    })

    it('should increment size after add', () => {
      filter.add('hello')
      expect(filter.size()).toBe(1)
    })

    it('should add multiple different items', () => {
      filter.add('a')
      filter.add('b')
      filter.add('c')
      expect(filter.size()).toBe(3)
    })

    it('should add duplicate items', () => {
      filter.add('test')
      filter.add('test')
      expect(filter.size()).toBe(2)
    })

    it('should handle empty string', () => {
      expect(filter.add('')).toBe(true)
      expect(filter.size()).toBe(1)
    })

    it('should handle unicode strings', () => {
      expect(filter.add('日本語テスト')).toBe(true)
      expect(filter.size()).toBe(1)
    })

    it('should handle special characters', () => {
      expect(filter.add('!@#$%^&*()')).toBe(true)
      expect(filter.contains('!@#$%^&*()')).toBe(true)
    })

    it('should handle long strings', () => {
      const longStr = 'a'.repeat(10000)
      expect(filter.add(longStr)).toBe(true)
      expect(filter.contains(longStr)).toBe(true)
    })

    it('should handle strings with spaces', () => {
      expect(filter.add('hello world')).toBe(true)
      expect(filter.contains('hello world')).toBe(true)
    })

    it('should handle strings with newlines', () => {
      expect(filter.add('line1\nline2')).toBe(true)
      expect(filter.contains('line1\nline2')).toBe(true)
    })

    it('should handle strings with tabs', () => {
      expect(filter.add('tab\there')).toBe(true)
      expect(filter.contains('tab\there')).toBe(true)
    })
  })

  describe('contains', () => {
    it('should return false for empty filter', () => {
      expect(filter.contains('anything')).toBe(false)
    })

    it('should return true for added item', () => {
      filter.add('hello')
      expect(filter.contains('hello')).toBe(true)
    })

    it('should return false for non-added item', () => {
      filter.add('hello')
      expect(filter.contains('world')).toBe(false)
    })

    it('should find items after multiple adds', () => {
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

    it('should handle unicode lookup', () => {
      filter.add('日本語')
      expect(filter.contains('日本語')).toBe(true)
    })

    it('should not find similar strings', () => {
      filter.add('hello')
      expect(filter.contains('hell')).toBe(false)
      expect(filter.contains('helloo')).toBe(false)
    })

    it('should be case-sensitive', () => {
      filter.add('Hello')
      expect(filter.contains('Hello')).toBe(true)
      expect(filter.contains('hello')).toBe(false)
    })

    it('should handle numeric strings', () => {
      filter.add('123')
      expect(filter.contains('123')).toBe(true)
      expect(filter.contains('124')).toBe(false)
    })

    it('should handle many items', () => {
      const items: string[] = []
      for (let i = 0; i < 100; i++) {
        items.push(`item-${i}`)
        filter.add(`item-${i}`)
      }
      for (const item of items) {
        expect(filter.contains(item)).toBe(true)
      }
    })
  })

  describe('remove', () => {
    it('should remove an existing item and return true', () => {
      filter.add('hello')
      expect(filter.remove('hello')).toBe(true)
      expect(filter.size()).toBe(0)
    })

    it('should return false for non-existent item', () => {
      expect(filter.remove('nonexistent')).toBe(false)
    })

    it('should make item not containable after removal', () => {
      filter.add('hello')
      filter.remove('hello')
      expect(filter.contains('hello')).toBe(false)
    })

    it('should decrement size on removal', () => {
      filter.add('a')
      filter.add('b')
      expect(filter.size()).toBe(2)
      filter.remove('a')
      expect(filter.size()).toBe(1)
    })

    it('should handle removing from empty filter', () => {
      expect(filter.remove('nothing')).toBe(false)
      expect(filter.size()).toBe(0)
    })

    it('should only remove one occurrence of duplicates', () => {
      filter.add('test')
      filter.add('test')
      expect(filter.size()).toBe(2)
      filter.remove('test')
      expect(filter.size()).toBe(1)
      expect(filter.contains('test')).toBe(true)
    })

    it('should handle remove after multiple adds', () => {
      filter.add('a')
      filter.add('b')
      filter.add('c')
      filter.remove('b')
      expect(filter.contains('a')).toBe(true)
      expect(filter.contains('b')).toBe(false)
      expect(filter.contains('c')).toBe(true)
    })

    it('should handle re-adding after removal', () => {
      filter.add('hello')
      filter.remove('hello')
      filter.add('hello')
      expect(filter.contains('hello')).toBe(true)
      expect(filter.size()).toBe(1)
    })

    it('should handle removing empty string', () => {
      filter.add('')
      expect(filter.remove('')).toBe(true)
      expect(filter.contains('')).toBe(false)
    })

    it('should handle removing unicode strings', () => {
      filter.add('日本語')
      expect(filter.remove('日本語')).toBe(true)
      expect(filter.contains('日本語')).toBe(false)
    })
  })

  describe('size', () => {
    it('should return 0 for empty filter', () => {
      expect(filter.size()).toBe(0)
    })

    it('should return correct count after adds', () => {
      filter.add('a')
      filter.add('b')
      filter.add('c')
      expect(filter.size()).toBe(3)
    })

    it('should return correct count after removal', () => {
      filter.add('a')
      filter.add('b')
      filter.remove('a')
      expect(filter.size()).toBe(1)
    })

    it('should reflect reset', () => {
      filter.add('a')
      filter.add('b')
      filter.reset()
      expect(filter.size()).toBe(0)
    })
  })

  describe('capacity', () => {
    it('should return default capacity', () => {
      expect(filter.capacity()).toBe(DEFAULT_CUCKOOFILTER_OPTIONS.capacity)
    })

    it('should return custom capacity', () => {
      const f = new CuckooFilter({ capacity: 2048 })
      expect(f.capacity()).toBe(2048)
    })

    it('should not change after adds', () => {
      filter.add('test')
      expect(filter.capacity()).toBe(DEFAULT_CUCKOOFILTER_OPTIONS.capacity)
    })

    it('should not change after reset', () => {
      filter.add('test')
      filter.reset()
      expect(filter.capacity()).toBe(DEFAULT_CUCKOOFILTER_OPTIONS.capacity)
    })
  })

  describe('isEmpty', () => {
    it('should return true for new filter', () => {
      expect(filter.isEmpty()).toBe(true)
    })

    it('should return false after add', () => {
      filter.add('test')
      expect(filter.isEmpty()).toBe(false)
    })

    it('should return true after removing all items', () => {
      filter.add('test')
      filter.remove('test')
      expect(filter.isEmpty()).toBe(true)
    })

    it('should return true after reset', () => {
      filter.add('test')
      filter.reset()
      expect(filter.isEmpty()).toBe(true)
    })
  })

  describe('fillRatio', () => {
    it('should return 0 for empty filter', () => {
      expect(filter.fillRatio()).toBe(0)
    })

    it('should increase after adds', () => {
      filter.add('test')
      expect(filter.fillRatio()).toBeGreaterThan(0)
    })

    it('should decrease after removal', () => {
      filter.add('a')
      const ratioAfterAdd = filter.fillRatio()
      filter.remove('a')
      expect(filter.fillRatio()).toBeLessThan(ratioAfterAdd)
    })

    it('should return 0 after reset', () => {
      filter.add('test')
      filter.reset()
      expect(filter.fillRatio()).toBe(0)
    })

    it('should be between 0 and 1', () => {
      for (let i = 0; i < 50; i++) {
        filter.add(`item-${i}`)
      }
      const ratio = filter.fillRatio()
      expect(ratio).toBeGreaterThanOrEqual(0)
      expect(ratio).toBeLessThanOrEqual(1)
    })
  })

  describe('reset', () => {
    it('should clear all items', () => {
      filter.add('a')
      filter.add('b')
      filter.add('c')
      filter.reset()
      expect(filter.size()).toBe(0)
      expect(filter.isEmpty()).toBe(true)
    })

    it('should make all items not containable', () => {
      filter.add('hello')
      filter.reset()
      expect(filter.contains('hello')).toBe(false)
    })

    it('should allow adding after reset', () => {
      filter.add('before')
      filter.reset()
      filter.add('after')
      expect(filter.contains('after')).toBe(true)
      expect(filter.size()).toBe(1)
    })

    it('should be safe to call multiple times', () => {
      filter.add('test')
      filter.reset()
      filter.reset()
      filter.reset()
      expect(filter.size()).toBe(0)
    })

    it('should reset fill ratio', () => {
      filter.add('test')
      filter.reset()
      expect(filter.fillRatio()).toBe(0)
    })
  })

  describe('merge', () => {
    it('should merge items from another filter', () => {
      const other = new CuckooFilter()
      other.add('x')
      other.add('y')
      filter.merge(other)
      expect(filter.size()).toBeGreaterThanOrEqual(0)
    })

    it('should merge into empty filter', () => {
      const other = new CuckooFilter()
      other.add('a')
      filter.merge(other)
      expect(filter.size()).toBeGreaterThan(0)
    })

    it('should handle merging empty filter', () => {
      const other = new CuckooFilter()
      filter.add('existing')
      const sizeBefore = filter.size()
      filter.merge(other)
      expect(filter.size()).toBe(sizeBefore)
    })

    it('should preserve existing items after merge', () => {
      filter.add('original')
      const other = new CuckooFilter()
      other.add('new')
      filter.merge(other)
      expect(filter.contains('original')).toBe(true)
    })

    it('should handle merge with same capacity filters', () => {
      const f1 = new CuckooFilter({ capacity: 512 })
      const f2 = new CuckooFilter({ capacity: 512 })
      f1.add('a')
      f2.add('b')
      f1.merge(f2)
      expect(f1.size()).toBeGreaterThan(0)
    })
  })

  describe('stress and edge cases', () => {
    it('should handle many sequential adds', () => {
      for (let i = 0; i < 200; i++) {
        filter.add(`item-${i}`)
      }
      expect(filter.size()).toBe(200)
    })

    it('should handle add-remove-add cycles', () => {
      filter.add('test')
      filter.remove('test')
      filter.add('test')
      expect(filter.contains('test')).toBe(true)
      expect(filter.size()).toBe(1)
    })

    it('should handle different fingerprints', () => {
      const items = ['alpha', 'beta', 'gamma', 'delta', 'epsilon']
      for (const item of items) {
        filter.add(item)
      }
      for (const item of items) {
        expect(filter.contains(item)).toBe(true)
      }
    })

    it('should handle strings with only numbers', () => {
      for (let i = 0; i < 50; i++) {
        filter.add(String(i))
      }
      for (let i = 0; i < 50; i++) {
        expect(filter.contains(String(i))).toBe(true)
      }
    })

    it('should handle single character strings', () => {
      for (let i = 0; i < 26; i++) {
        filter.add(String.fromCharCode(97 + i))
      }
      expect(filter.size()).toBe(26)
    })

    it('should work with small capacity', () => {
      const f = new CuckooFilter({ capacity: 16, bucketSize: 2, maxKicks: 50 })
      expect(f.add('a')).toBe(true)
      expect(f.add('b')).toBe(true)
      expect(f.contains('a')).toBe(true)
      expect(f.contains('b')).toBe(true)
    })

    it('should handle very long item strings', () => {
      const longItem = 'x'.repeat(100000)
      expect(filter.add(longItem)).toBe(true)
      expect(filter.contains(longItem)).toBe(true)
    })

    it('should handle removing all items', () => {
      const items = ['a', 'b', 'c', 'd', 'e']
      for (const item of items) {
        filter.add(item)
      }
      for (const item of items) {
        filter.remove(item)
      }
      expect(filter.isEmpty()).toBe(true)
    })

    it('should handle mixed add and remove', () => {
      filter.add('keep')
      filter.add('remove')
      filter.remove('remove')
      expect(filter.contains('keep')).toBe(true)
      expect(filter.contains('remove')).toBe(false)
    })

    it('should handle large number of operations', () => {
      for (let i = 0; i < 500; i++) {
        filter.add(`item-${i}`)
      }
      for (let i = 0; i < 250; i++) {
        filter.remove(`item-${i}`)
      }
      expect(filter.size()).toBe(250)
      for (let i = 250; i < 500; i++) {
        expect(filter.contains(`item-${i}`)).toBe(true)
      }
    })
  })

  describe('exported types', () => {
    it('should export DEFAULT_CUCKOOFILTER_OPTIONS', () => {
      expect(DEFAULT_CUCKOOFILTER_OPTIONS).toBeDefined()
      expect(DEFAULT_CUCKOOFILTER_OPTIONS.capacity).toBe(1024)
      expect(DEFAULT_CUCKOOFILTER_OPTIONS.bucketSize).toBe(4)
      expect(DEFAULT_CUCKOOFILTER_OPTIONS.maxKicks).toBe(500)
      expect(DEFAULT_CUCKOOFILTER_OPTIONS.fingerprintSize).toBe(8)
    })

    it('should have correct default capacity value', () => {
      expect(DEFAULT_CUCKOOFILTER_OPTIONS.capacity).toBeTypeOf('number')
    })

    it('should have correct default bucketSize value', () => {
      expect(DEFAULT_CUCKOOFILTER_OPTIONS.bucketSize).toBeTypeOf('number')
    })

    it('should have correct default maxKicks value', () => {
      expect(DEFAULT_CUCKOOFILTER_OPTIONS.maxKicks).toBeTypeOf('number')
    })

    it('should have correct default fingerprintSize value', () => {
      expect(DEFAULT_CUCKOOFILTER_OPTIONS.fingerprintSize).toBeTypeOf('number')
    })

    it('should allow type import of CuckooFilterOptions', () => {
      const opts: CuckooFilterOptions = {
        capacity: 100,
        bucketSize: 2,
        maxKicks: 50,
        fingerprintSize: 4,
      }
      expect(opts.capacity).toBe(100)
    })
  })

  describe('deletion correctness', () => {
    it('should allow adding back after removal', () => {
      filter.add('alpha')
      filter.remove('alpha')
      expect(filter.contains('alpha')).toBe(false)
      filter.add('alpha')
      expect(filter.contains('alpha')).toBe(true)
    })

    it('should handle remove on non-empty filter for absent item', () => {
      filter.add('present')
      expect(filter.remove('absent')).toBe(false)
      expect(filter.size()).toBe(1)
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

    it('should handle capacity edge case', () => {
      const f = new CuckooFilter({ capacity: 4, bucketSize: 2, maxKicks: 10, fingerprintSize: 4 })
      f.add('one')
      f.add('two')
      expect(f.contains('one')).toBe(true)
      expect(f.contains('two')).toBe(true)
      f.remove('one')
      expect(f.contains('one')).toBe(false)
      expect(f.contains('two')).toBe(true)
    })
  })
})
