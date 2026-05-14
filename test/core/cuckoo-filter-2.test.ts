import { describe, it, expect } from 'vitest'
import { CuckooFilter } from '../../src/core/cuckoo-filter-2/index.js'

describe('CuckooFilter', () => {
  describe('constructor', () => {
    it.skip('creates empty filter with defaults', () => {
      const cf = new CuckooFilter()
      expect(cf.size).toBe(0)
      expect(cf.capacity).toBe(1024)
    })

    it.skip('creates with custom capacity', () => {
      const cf = new CuckooFilter({ capacity: 512 })
      expect(cf.capacity).toBe(512)
    })

    it.skip('creates with custom bucketSize', () => {
      const cf = new CuckooFilter({ capacity: 64, bucketSize: 2 })
      cf.insert('a')
      cf.insert('b')
      expect(cf.size).toBe(2)
    })

    it.skip('creates with custom maxKicks', () => {
      const cf = new CuckooFilter({ capacity: 64, maxKicks: 100 })
      expect(cf.size).toBe(0)
    })

    it.skip('rounds capacity up to power of 2', () => {
      const cf = new CuckooFilter({ capacity: 100 })
      expect(cf.capacity).toBe(128)
    })

    it.skip('creates with all options', () => {
      const cf = new CuckooFilter({ capacity: 256, bucketSize: 2, maxKicks: 200 })
      expect(cf.capacity).toBe(256)
      expect(cf.size).toBe(0)
    })
  })

  describe('insert', () => {
    it.skip('inserts a single item', () => {
      const cf = new CuckooFilter({ capacity: 64 })
      expect(cf.insert('hello')).toBe(true)
      expect(cf.size).toBe(1)
    })

    it.skip('inserts multiple items', () => {
      const cf = new CuckooFilter({ capacity: 64 })
      cf.insert('a')
      cf.insert('b')
      cf.insert('c')
      expect(cf.size).toBe(3)
    })

    it.skip('returns true on successful insert', () => {
      const cf = new CuckooFilter({ capacity: 64 })
      expect(cf.insert('x')).toBe(true)
    })

    it.skip('handles duplicate inserts', () => {
      const cf = new CuckooFilter({ capacity: 64 })
      cf.insert('dup')
      cf.insert('dup')
      expect(cf.size).toBe(2)
    })

    it.skip('handles string items', () => {
      const cf = new CuckooFilter({ capacity: 64 })
      expect(cf.insert('hello world')).toBe(true)
      expect(cf.contains('hello world')).toBe(true)
    })

    it.skip('handles numeric items', () => {
      const cf = new CuckooFilter({ capacity: 64 })
      expect(cf.insert(42)).toBe(true)
      expect(cf.contains(42)).toBe(true)
    })

    it.skip('handles negative numbers', () => {
      const cf = new CuckooFilter({ capacity: 64 })
      expect(cf.insert(-100)).toBe(true)
      expect(cf.contains(-100)).toBe(true)
    })

    it.skip('handles zero', () => {
      const cf = new CuckooFilter({ capacity: 64 })
      expect(cf.insert(0)).toBe(true)
      expect(cf.contains(0)).toBe(true)
    })
  })

  describe('contains', () => {
    it.skip('returns false on empty filter', () => {
      const cf = new CuckooFilter({ capacity: 64 })
      expect(cf.contains('anything')).toBe(false)
    })

    it.skip('returns true for inserted item', () => {
      const cf = new CuckooFilter({ capacity: 64 })
      cf.insert('hello')
      expect(cf.contains('hello')).toBe(true)
    })

    it.skip('returns false for non-inserted item', () => {
      const cf = new CuckooFilter({ capacity: 64 })
      cf.insert('hello')
      expect(cf.contains('world')).toBe(false)
    })

    it.skip('returns true for multiple inserted items', () => {
      const cf = new CuckooFilter({ capacity: 64 })
      cf.insert('a')
      cf.insert('b')
      cf.insert('c')
      expect(cf.contains('a')).toBe(true)
      expect(cf.contains('b')).toBe(true)
      expect(cf.contains('c')).toBe(true)
    })

    it.skip('returns true after duplicate inserts', () => {
      const cf = new CuckooFilter({ capacity: 64 })
      cf.insert('x')
      cf.insert('x')
      expect(cf.contains('x')).toBe(true)
    })

    it.skip('handles string items', () => {
      const cf = new CuckooFilter({ capacity: 64 })
      cf.insert('test')
      expect(cf.contains('test')).toBe(true)
      expect(cf.contains('TEST')).toBe(false)
    })

    it.skip('handles numeric items', () => {
      const cf = new CuckooFilter({ capacity: 64 })
      cf.insert(42)
      expect(cf.contains(42)).toBe(true)
      expect(cf.contains(43)).toBe(false)
    })

    it.skip('handles boolean items', () => {
      const cf = new CuckooFilter({ capacity: 64 })
      cf.insert(true)
      expect(cf.contains(true)).toBe(true)
      expect(cf.contains(false)).toBe(false)
    })

    it.skip('handles null', () => {
      const cf = new CuckooFilter({ capacity: 64 })
      cf.insert(null)
      expect(cf.contains(null)).toBe(true)
    })

    it.skip('handles undefined', () => {
      const cf = new CuckooFilter({ capacity: 64 })
      cf.insert(undefined)
      expect(cf.contains(undefined)).toBe(true)
    })
  })

  describe('delete', () => {
    it.skip('returns false on empty filter', () => {
      const cf = new CuckooFilter({ capacity: 64 })
      expect(cf.delete('anything')).toBe(false)
    })

    it.skip('deletes an inserted item', () => {
      const cf = new CuckooFilter({ capacity: 64 })
      cf.insert('hello')
      expect(cf.delete('hello')).toBe(true)
    })

    it.skip('returns true on successful delete', () => {
      const cf = new CuckooFilter({ capacity: 64 })
      cf.insert('x')
      expect(cf.delete('x')).toBe(true)
    })

    it.skip('returns false for non-inserted item', () => {
      const cf = new CuckooFilter({ capacity: 64 })
      cf.insert('hello')
      expect(cf.delete('world')).toBe(false)
    })

    it.skip('decreases size after delete', () => {
      const cf = new CuckooFilter({ capacity: 64 })
      cf.insert('a')
      cf.insert('b')
      cf.delete('a')
      expect(cf.size).toBe(1)
    })

    it.skip('item not contained after delete', () => {
      const cf = new CuckooFilter({ capacity: 64 })
      cf.insert('target')
      cf.delete('target')
      expect(cf.contains('target')).toBe(false)
    })

    it.skip('handles deleting one of duplicates', () => {
      const cf = new CuckooFilter({ capacity: 64 })
      cf.insert('dup')
      cf.insert('dup')
      cf.delete('dup')
      expect(cf.size).toBe(1)
      expect(cf.contains('dup')).toBe(true)
    })

    it.skip('handles delete then re-insert', () => {
      const cf = new CuckooFilter({ capacity: 64 })
      cf.insert('x')
      cf.delete('x')
      expect(cf.contains('x')).toBe(false)
      cf.insert('x')
      expect(cf.contains('x')).toBe(true)
    })

    it.skip('handles delete on filter with many items', () => {
      const cf = new CuckooFilter({ capacity: 128 })
      for (let i = 0; i < 50; i++) {
        cf.insert(`item-${i}`)
      }
      expect(cf.delete('item-25')).toBe(true)
      expect(cf.contains('item-25')).toBe(false)
      expect(cf.size).toBe(49)
    })

    it.skip('handles deleting all items', () => {
      const cf = new CuckooFilter({ capacity: 64 })
      cf.insert('a')
      cf.insert('b')
      cf.insert('c')
      cf.delete('a')
      cf.delete('b')
      cf.delete('c')
      expect(cf.size).toBe(0)
    })
  })

  describe('size', () => {
    it.skip('starts at 0', () => {
      const cf = new CuckooFilter({ capacity: 64 })
      expect(cf.size).toBe(0)
    })

    it.skip('increments on insert', () => {
      const cf = new CuckooFilter({ capacity: 64 })
      cf.insert('a')
      expect(cf.size).toBe(1)
      cf.insert('b')
      expect(cf.size).toBe(2)
    })

    it.skip('decrements on delete', () => {
      const cf = new CuckooFilter({ capacity: 64 })
      cf.insert('a')
      cf.insert('b')
      cf.delete('a')
      expect(cf.size).toBe(1)
    })

    it.skip('resets on clear', () => {
      const cf = new CuckooFilter({ capacity: 64 })
      cf.insert('a')
      cf.insert('b')
      cf.clear()
      expect(cf.size).toBe(0)
    })

    it.skip('reflects multiple operations', () => {
      const cf = new CuckooFilter({ capacity: 64 })
      cf.insert('a')
      cf.insert('b')
      cf.insert('c')
      cf.delete('b')
      cf.insert('d')
      expect(cf.size).toBe(3)
    })

    it.skip('reflects duplicate inserts', () => {
      const cf = new CuckooFilter({ capacity: 64 })
      cf.insert('x')
      cf.insert('x')
      cf.insert('x')
      expect(cf.size).toBe(3)
    })
  })

  describe('capacity', () => {
    it.skip('returns configured capacity', () => {
      const cf = new CuckooFilter({ capacity: 256 })
      expect(cf.capacity).toBe(256)
    })

    it.skip('rounds to power of 2', () => {
      const cf = new CuckooFilter({ capacity: 100 })
      expect(cf.capacity).toBe(128)
    })

    it.skip('rounds capacity 3 to 4', () => {
      const cf = new CuckooFilter({ capacity: 3 })
      expect(cf.capacity).toBe(4)
    })

    it.skip('rounds capacity 1 to 1', () => {
      const cf = new CuckooFilter({ capacity: 1 })
      expect(cf.capacity).toBe(1)
    })

    it.skip('rounds capacity 0 to 1', () => {
      const cf = new CuckooFilter({ capacity: 0 })
      expect(cf.capacity).toBe(1)
    })
  })

  describe('falsePositiveRate', () => {
    it.skip('returns 0 for empty filter', () => {
      const cf = new CuckooFilter({ capacity: 64 })
      expect(cf.falsePositiveRate()).toBe(0)
    })

    it.skip('increases with more items', () => {
      const cf = new CuckooFilter({ capacity: 64 })
      cf.insert('a')
      const rate1 = cf.falsePositiveRate()
      for (let i = 0; i < 20; i++) {
        cf.insert(`item-${i}`)
      }
      const rate2 = cf.falsePositiveRate()
      expect(rate2).toBeGreaterThan(rate1)
    })

    it.skip('returns number between 0 and 1', () => {
      const cf = new CuckooFilter({ capacity: 64 })
      for (let i = 0; i < 10; i++) {
        cf.insert(`item-${i}`)
      }
      const rate = cf.falsePositiveRate()
      expect(rate).toBeGreaterThan(0)
      expect(rate).toBeLessThanOrEqual(1)
    })

    it.skip('reflects current load', () => {
      const cf = new CuckooFilter({ capacity: 64 })
      cf.insert('a')
      const rateBefore = cf.falsePositiveRate()
      cf.delete('a')
      expect(cf.falsePositiveRate()).toBeLessThan(rateBefore)
    })

    it.skip('changes after clear', () => {
      const cf = new CuckooFilter({ capacity: 64 })
      for (let i = 0; i < 10; i++) {
        cf.insert(`item-${i}`)
      }
      expect(cf.falsePositiveRate()).toBeGreaterThan(0)
      cf.clear()
      expect(cf.falsePositiveRate()).toBe(0)
    })

    it.skip('is low for sparse filter', () => {
      const cf = new CuckooFilter({ capacity: 1024 })
      cf.insert('a')
      expect(cf.falsePositiveRate()).toBeLessThan(0.01)
    })
  })

  describe('clear', () => {
    it.skip('clears empty filter', () => {
      const cf = new CuckooFilter({ capacity: 64 })
      cf.clear()
      expect(cf.size).toBe(0)
    })

    it.skip('clears populated filter', () => {
      const cf = new CuckooFilter({ capacity: 64 })
      cf.insert('a')
      cf.insert('b')
      cf.insert('c')
      cf.clear()
      expect(cf.size).toBe(0)
    })

    it.skip('resets size to 0', () => {
      const cf = new CuckooFilter({ capacity: 64 })
      for (let i = 0; i < 20; i++) {
        cf.insert(`item-${i}`)
      }
      cf.clear()
      expect(cf.size).toBe(0)
    })

    it.skip('filter empty after clear', () => {
      const cf = new CuckooFilter({ capacity: 64 })
      cf.insert('a')
      cf.clear()
      expect(cf.contains('a')).toBe(false)
    })

    it.skip('allows reuse after clear', () => {
      const cf = new CuckooFilter({ capacity: 64 })
      cf.insert('a')
      cf.clear()
      cf.insert('b')
      expect(cf.size).toBe(1)
      expect(cf.contains('b')).toBe(true)
    })

    it.skip('toArray empty after clear', () => {
      const cf = new CuckooFilter({ capacity: 64 })
      cf.insert('a')
      cf.clear()
      expect(cf.toArray()).toEqual([])
    })
  })

  describe('toArray', () => {
    it.skip('returns empty array for empty filter', () => {
      const cf = new CuckooFilter({ capacity: 64 })
      expect(cf.toArray()).toEqual([])
    })

    it.skip('returns fingerprints after insert', () => {
      const cf = new CuckooFilter({ capacity: 64 })
      cf.insert('a')
      const arr = cf.toArray()
      expect(arr.length).toBe(1)
      expect(typeof arr[0]).toBe('number')
    })

    it.skip('length equals size', () => {
      const cf = new CuckooFilter({ capacity: 64 })
      cf.insert('a')
      cf.insert('b')
      cf.insert('c')
      expect(cf.toArray().length).toBe(cf.size)
    })

    it.skip('returns copy of internal data', () => {
      const cf = new CuckooFilter({ capacity: 64 })
      cf.insert('a')
      const arr = cf.toArray()
      arr.push(999)
      expect(cf.size).toBe(1)
    })

    it.skip('contains valid fingerprint values', () => {
      const cf = new CuckooFilter({ capacity: 64 })
      cf.insert('a')
      cf.insert('b')
      const arr = cf.toArray()
      for (const fp of arr) {
        expect(fp).toBeGreaterThanOrEqual(1)
        expect(fp).toBeLessThanOrEqual(255)
      }
    })

    it.skip('changes after delete', () => {
      const cf = new CuckooFilter({ capacity: 64 })
      cf.insert('a')
      cf.insert('b')
      const before = cf.toArray().length
      cf.delete('a')
      const after = cf.toArray().length
      expect(after).toBe(before - 1)
    })
  })

  describe('edge cases', () => {
    it.skip('single item insert and delete cycle', () => {
      const cf = new CuckooFilter({ capacity: 64 })
      cf.insert('only')
      expect(cf.contains('only')).toBe(true)
      cf.delete('only')
      expect(cf.contains('only')).toBe(false)
      expect(cf.size).toBe(0)
    })

    it.skip('insert and delete same item repeatedly', () => {
      const cf = new CuckooFilter({ capacity: 64 })
      for (let i = 0; i < 10; i++) {
        cf.insert('cycle')
        expect(cf.contains('cycle')).toBe(true)
        cf.delete('cycle')
        expect(cf.contains('cycle')).toBe(false)
      }
      expect(cf.size).toBe(0)
    })

    it.skip('filter with capacity 1', () => {
      const cf = new CuckooFilter({ capacity: 1, bucketSize: 4 })
      cf.insert('a')
      expect(cf.contains('a')).toBe(true)
      expect(cf.size).toBe(1)
    })

    it.skip('filter with bucketSize 1', () => {
      const cf = new CuckooFilter({ capacity: 64, bucketSize: 1 })
      cf.insert('a')
      expect(cf.contains('a')).toBe(true)
    })

    it.skip('filter with maxKicks 0', () => {
      const cf = new CuckooFilter({ capacity: 64, maxKicks: 0 })
      cf.insert('a')
      expect(cf.contains('a')).toBe(true)
    })

    it.skip('contains returns false for non-inserted items', () => {
      const cf = new CuckooFilter({ capacity: 64 })
      expect(cf.contains('nope')).toBe(false)
      expect(cf.contains(999)).toBe(false)
      expect(cf.contains(null)).toBe(false)
    })

    it.skip('delete returns false for non-inserted items', () => {
      const cf = new CuckooFilter({ capacity: 64 })
      expect(cf.delete('nope')).toBe(false)
      expect(cf.delete(999)).toBe(false)
    })

    it.skip('many unique items', () => {
      const cf = new CuckooFilter({ capacity: 512 })
      for (let i = 0; i < 100; i++) {
        cf.insert(`item-${i}`)
      }
      expect(cf.size).toBe(100)
      for (let i = 0; i < 100; i++) {
        expect(cf.contains(`item-${i}`)).toBe(true)
      }
    })

    it.skip('alternating insert and delete', () => {
      const cf = new CuckooFilter({ capacity: 64 })
      cf.insert('a')
      cf.delete('a')
      cf.insert('b')
      expect(cf.contains('a')).toBe(false)
      expect(cf.contains('b')).toBe(true)
    })

    it.skip('insert returns boolean', () => {
      const cf = new CuckooFilter({ capacity: 64 })
      const result = cf.insert('x')
      expect(typeof result).toBe('boolean')
      expect(result).toBe(true)
    })
  })

  describe('different data types', () => {
    it.skip('string items', () => {
      const cf = new CuckooFilter({ capacity: 64 })
      cf.insert('hello')
      expect(cf.contains('hello')).toBe(true)
      expect(cf.contains('world')).toBe(false)
    })

    it.skip('number items', () => {
      const cf = new CuckooFilter({ capacity: 64 })
      cf.insert(42)
      cf.insert(3.14)
      cf.insert(-7)
      expect(cf.contains(42)).toBe(true)
      expect(cf.contains(3.14)).toBe(true)
      expect(cf.contains(-7)).toBe(true)
    })

    it.skip('boolean items', () => {
      const cf = new CuckooFilter({ capacity: 64 })
      cf.insert(true)
      cf.insert(false)
      expect(cf.contains(true)).toBe(true)
      expect(cf.contains(false)).toBe(true)
    })

    it.skip('null items', () => {
      const cf = new CuckooFilter({ capacity: 64 })
      cf.insert(null)
      expect(cf.contains(null)).toBe(true)
    })

    it.skip('undefined items', () => {
      const cf = new CuckooFilter({ capacity: 64 })
      cf.insert(undefined)
      expect(cf.contains(undefined)).toBe(true)
    })

    it.skip('distinguishes different types', () => {
      const cf = new CuckooFilter({ capacity: 64 })
      cf.insert('1')
      cf.insert(1)
      expect(cf.contains('1')).toBe(true)
      expect(cf.contains(1)).toBe(true)
    })
  })

  describe('false positive behavior', () => {
    it.skip('false positive rate is low for sparse filter', () => {
      const cf = new CuckooFilter({ capacity: 4096 })
      cf.insert('a')
      let falsePositives = 0
      for (let i = 0; i < 1000; i++) {
        if (cf.contains(`nonexistent-${i}`)) falsePositives++
      }
      expect(falsePositives).toBeLessThan(100)
    })

    it.skip('no false negatives', () => {
      const cf = new CuckooFilter({ capacity: 512 })
      for (let i = 0; i < 100; i++) {
        cf.insert(`item-${i}`)
      }
      for (let i = 0; i < 100; i++) {
        expect(cf.contains(`item-${i}`)).toBe(true)
      }
    })

    it.skip('true positives always detected', () => {
      const cf = new CuckooFilter({ capacity: 256 })
      const items = ['alpha', 'beta', 'gamma', 'delta', 'epsilon']
      for (const item of items) {
        cf.insert(item)
      }
      for (const item of items) {
        expect(cf.contains(item)).toBe(true)
      }
    })

    it.skip('false positive rate bounded by theoretical limit', () => {
      const cf = new CuckooFilter({ capacity: 256 })
      for (let i = 0; i < 50; i++) {
        cf.insert(`item-${i}`)
      }
      expect(cf.falsePositiveRate()).toBeLessThanOrEqual(1)
    })

    it.skip('contains returns boolean for non-member', () => {
      const cf = new CuckooFilter({ capacity: 64 })
      cf.insert('member')
      const result = cf.contains('nonmember')
      expect(typeof result).toBe('boolean')
    })

    it.skip('empty filter has zero false positive rate', () => {
      const cf = new CuckooFilter({ capacity: 64 })
      for (let i = 0; i < 100; i++) {
        expect(cf.contains(`item-${i}`)).toBe(false)
      }
    })
  })

  describe('load factor', () => {
    it.skip('increases with inserts', () => {
      const cf = new CuckooFilter({ capacity: 64 })
      const rate0 = cf.falsePositiveRate()
      cf.insert('a')
      const rate1 = cf.falsePositiveRate()
      expect(rate1).toBeGreaterThan(rate0)
    })

    it.skip('decreases with deletes', () => {
      const cf = new CuckooFilter({ capacity: 64 })
      cf.insert('a')
      cf.insert('b')
      const rate2 = cf.falsePositiveRate()
      cf.delete('a')
      const rate1 = cf.falsePositiveRate()
      expect(rate1).toBeLessThan(rate2)
    })

    it.skip('is 0 when empty', () => {
      const cf = new CuckooFilter({ capacity: 64 })
      expect(cf.falsePositiveRate()).toBe(0)
    })

    it.skip('resets on clear', () => {
      const cf = new CuckooFilter({ capacity: 64 })
      for (let i = 0; i < 20; i++) {
        cf.insert(`item-${i}`)
      }
      expect(cf.falsePositiveRate()).toBeGreaterThan(0)
      cf.clear()
      expect(cf.falsePositiveRate()).toBe(0)
    })

    it.skip('increases with more items relative to capacity', () => {
      const cf1 = new CuckooFilter({ capacity: 256 })
      const cf2 = new CuckooFilter({ capacity: 256 })
      cf1.insert('a')
      for (let i = 0; i < 50; i++) {
        cf2.insert(`item-${i}`)
      }
      expect(cf2.falsePositiveRate()).toBeGreaterThan(cf1.falsePositiveRate())
    })
  })

  describe('interleaved operations', () => {
    it.skip('insert-contains-delete sequence', () => {
      const cf = new CuckooFilter({ capacity: 64 })
      cf.insert('test')
      expect(cf.contains('test')).toBe(true)
      cf.delete('test')
      expect(cf.contains('test')).toBe(false)
    })

    it.skip('multiple inserts then contains checks', () => {
      const cf = new CuckooFilter({ capacity: 128 })
      const items = ['a', 'b', 'c', 'd', 'e']
      for (const item of items) {
        cf.insert(item)
      }
      for (const item of items) {
        expect(cf.contains(item)).toBe(true)
      }
    })

    it.skip('insert-delete-reinsert cycle', () => {
      const cf = new CuckooFilter({ capacity: 64 })
      cf.insert('x')
      expect(cf.size).toBe(1)
      cf.delete('x')
      expect(cf.size).toBe(0)
      cf.insert('x')
      expect(cf.size).toBe(1)
      expect(cf.contains('x')).toBe(true)
    })

    it.skip('clear and reuse multiple times', () => {
      const cf = new CuckooFilter({ capacity: 64 })
      for (let round = 0; round < 3; round++) {
        for (let i = 0; i < 5; i++) {
          cf.insert(`round${round}-item${i}`)
        }
        expect(cf.size).toBe(5)
        cf.clear()
        expect(cf.size).toBe(0)
      }
    })

    it.skip('mixed type operations', () => {
      const cf = new CuckooFilter({ capacity: 64 })
      cf.insert('string')
      cf.insert(42)
      cf.insert(true)
      cf.insert(null)
      expect(cf.contains('string')).toBe(true)
      expect(cf.contains(42)).toBe(true)
      expect(cf.contains(true)).toBe(true)
      expect(cf.contains(null)).toBe(true)
    })

    it.skip('insert many delete some', () => {
      const cf = new CuckooFilter({ capacity: 256 })
      for (let i = 0; i < 50; i++) {
        cf.insert(`item-${i}`)
      }
      for (let i = 0; i < 25; i++) {
        cf.delete(`item-${i}`)
      }
      expect(cf.size).toBe(25)
      for (let i = 25; i < 50; i++) {
        expect(cf.contains(`item-${i}`)).toBe(true)
      }
    })
  })

  describe('duplicate items', () => {
    it.skip('insert same item twice', () => {
      const cf = new CuckooFilter({ capacity: 64 })
      cf.insert('dup')
      cf.insert('dup')
      expect(cf.size).toBe(2)
    })

    it.skip('contains returns true after duplicate insert', () => {
      const cf = new CuckooFilter({ capacity: 64 })
      cf.insert('dup')
      cf.insert('dup')
      expect(cf.contains('dup')).toBe(true)
    })

    it.skip('delete removes one occurrence', () => {
      const cf = new CuckooFilter({ capacity: 64 })
      cf.insert('dup')
      cf.insert('dup')
      cf.delete('dup')
      expect(cf.size).toBe(1)
      expect(cf.contains('dup')).toBe(true)
    })

    it.skip('size reflects duplicates', () => {
      const cf = new CuckooFilter({ capacity: 64 })
      cf.insert('x')
      expect(cf.size).toBe(1)
      cf.insert('x')
      expect(cf.size).toBe(2)
      cf.insert('x')
      expect(cf.size).toBe(3)
    })

    it.skip('can delete all occurrences', () => {
      const cf = new CuckooFilter({ capacity: 64 })
      cf.insert('x')
      cf.insert('x')
      cf.insert('x')
      cf.delete('x')
      cf.delete('x')
      cf.delete('x')
      expect(cf.size).toBe(0)
      expect(cf.contains('x')).toBe(false)
    })

    it.skip('re-insert after full deletion', () => {
      const cf = new CuckooFilter({ capacity: 64 })
      cf.insert('y')
      cf.delete('y')
      expect(cf.contains('y')).toBe(false)
      cf.insert('y')
      expect(cf.contains('y')).toBe(true)
      expect(cf.size).toBe(1)
    })
  })

  describe('bucket displacement', () => {
    it.skip('handles displacement with small capacity', () => {
      const cf = new CuckooFilter({ capacity: 4, bucketSize: 2, maxKicks: 100 })
      const results: boolean[] = []
      for (let i = 0; i < 6; i++) {
        results.push(cf.insert(`item-${i}`))
      }
      expect(results.every((r) => r)).toBe(true)
    })

    it.skip('may fail when filter is near full', () => {
      const cf = new CuckooFilter({ capacity: 2, bucketSize: 2, maxKicks: 10 })
      for (let i = 0; i < 4; i++) {
        cf.insert(`item-${i}`)
      }
      const result = cf.insert('overflow')
      expect(typeof result).toBe('boolean')
    })

    it.skip('insert succeeds at moderate load', () => {
      const cf = new CuckooFilter({ capacity: 64 })
      for (let i = 0; i < 50; i++) {
        expect(cf.insert(`item-${i}`)).toBe(true)
      }
    })

    it.skip('contains works after displacement', () => {
      const cf = new CuckooFilter({ capacity: 4, bucketSize: 2, maxKicks: 100 })
      for (let i = 0; i < 5; i++) {
        cf.insert(`item-${i}`)
      }
      let foundCount = 0
      for (let i = 0; i < 5; i++) {
        if (cf.contains(`item-${i}`)) foundCount++
      }
      expect(foundCount).toBe(5)
    })

    it.skip('delete works after displacement', () => {
      const cf = new CuckooFilter({ capacity: 4, bucketSize: 2, maxKicks: 100 })
      for (let i = 0; i < 4; i++) {
        cf.insert(`item-${i}`)
      }
      expect(cf.delete('item-0')).toBe(true)
      expect(cf.contains('item-0')).toBe(false)
    })

    it.skip('toArray includes displaced fingerprints', () => {
      const cf = new CuckooFilter({ capacity: 4, bucketSize: 2, maxKicks: 100 })
      for (let i = 0; i < 4; i++) {
        cf.insert(`item-${i}`)
      }
      const arr = cf.toArray()
      expect(arr.length).toBe(4)
    })
  })

  describe('stress tests', () => {
    it.skip('handles 500 inserts', () => {
      const cf = new CuckooFilter({ capacity: 2048 })
      let success = 0
      for (let i = 0; i < 500; i++) {
        if (cf.insert(`item-${i}`)) success++
      }
      expect(success).toBe(500)
      expect(cf.size).toBe(500)
    })

    it.skip('handles 500 contains checks', () => {
      const cf = new CuckooFilter({ capacity: 2048 })
      for (let i = 0; i < 200; i++) {
        cf.insert(`item-${i}`)
      }
      for (let i = 0; i < 200; i++) {
        expect(cf.contains(`item-${i}`)).toBe(true)
      }
    })

    it.skip('handles 200 deletes', () => {
      const cf = new CuckooFilter({ capacity: 2048 })
      for (let i = 0; i < 200; i++) {
        cf.insert(`item-${i}`)
      }
      for (let i = 0; i < 200; i++) {
        expect(cf.delete(`item-${i}`)).toBe(true)
      }
      expect(cf.size).toBe(0)
    })

    it.skip('handles insert-delete-reinsert pattern', () => {
      const cf = new CuckooFilter({ capacity: 256 })
      for (let i = 0; i < 50; i++) {
        cf.insert(`item-${i}`)
      }
      for (let i = 0; i < 25; i++) {
        cf.delete(`item-${i}`)
      }
      for (let i = 0; i < 25; i++) {
        cf.insert(`item-${i}`)
      }
      expect(cf.size).toBe(50)
    })

    it.skip('handles sequential numeric items', () => {
      const cf = new CuckooFilter({ capacity: 1024 })
      for (let i = 0; i < 300; i++) {
        cf.insert(i)
      }
      for (let i = 0; i < 300; i++) {
        expect(cf.contains(i)).toBe(true)
      }
    })
  })
})
