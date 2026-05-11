import { describe, it, expect, beforeEach } from 'vitest'
import { CuckooFilter } from '../../src/core/cuckoo-filter/index.js'
import { BUCKET_SIZE, DEFAULT_FINGERPRINT_SIZE, DEFAULT_MAX_KICKS, defaultHash } from '../../src/core/cuckoo-filter/types.js'
import type { CuckooFilterOptions, CuckooFilterStatistics } from '../../src/core/cuckoo-filter/types.js'

describe('CuckooFilter', () => {
  let filter: CuckooFilter<string>

  beforeEach(() => {
    filter = new CuckooFilter(1024)
  })

  describe('constructor', () => {
    it('creates filter with capacity', () => {
      const f = new CuckooFilter(500)
      expect(f.capacity).toBe(500)
    })

    it('creates filter with default options', () => {
      const f = new CuckooFilter(1024)
      expect(f.capacity).toBe(1024)
      expect(f.size).toBe(0)
      expect(f.isEmpty).toBe(true)
    })

    it('creates filter with custom fingerprintSize', () => {
      const f = new CuckooFilter(1024, { fingerprintSize: 8 })
      expect(f.capacity).toBe(1024)
    })

    it('creates filter with custom maxKicks', () => {
      const f = new CuckooFilter(1024, { maxKicks: 100 })
      expect(f.capacity).toBe(1024)
    })

    it('creates filter with custom hashFunction', () => {
      const customHash = (s: string) => {
        let h = 0
        for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0
        return h >>> 0
      }
      const f = new CuckooFilter(1024, { hashFunction: customHash })
      expect(f.capacity).toBe(1024)
    })

    it('creates filter with all custom options', () => {
      const f = new CuckooFilter(2048, {
        fingerprintSize: 12,
        maxKicks: 200,
      })
      expect(f.capacity).toBe(2048)
    })

    it('starts with size 0', () => {
      expect(filter.size).toBe(0)
    })

    it('starts as empty', () => {
      expect(filter.isEmpty).toBe(true)
    })

    it('starts with loadFactor 0', () => {
      expect(filter.loadFactor).toBe(0)
    })

    it('starts with falsePositiveRate 0', () => {
      expect(filter.falsePositiveRate).toBe(0)
    })

    it('handles capacity 1', () => {
      const f = new CuckooFilter(1)
      expect(f.capacity).toBe(1)
    })

    it('handles small capacity', () => {
      const f = new CuckooFilter(4)
      expect(f.capacity).toBe(4)
    })

    it('handles large capacity', () => {
      const f = new CuckooFilter(100000)
      expect(f.capacity).toBe(100000)
    })

    it('merges partial options with defaults', () => {
      const f = new CuckooFilter(256, { maxKicks: 50 })
      expect(f.capacity).toBe(256)
    })
  })

  describe('insert', () => {
    it('inserts a single item successfully', () => {
      expect(filter.insert('hello')).toBe(true)
    })

    it('increments size after insert', () => {
      filter.insert('hello')
      expect(filter.size).toBe(1)
    })

    it('inserts multiple different items', () => {
      filter.insert('a')
      filter.insert('b')
      filter.insert('c')
      expect(filter.size).toBe(3)
    })

    it('allows duplicate inserts', () => {
      filter.insert('test')
      filter.insert('test')
      expect(filter.size).toBe(2)
    })

    it('handles empty string', () => {
      expect(filter.insert('')).toBe(true)
      expect(filter.size).toBe(1)
    })

    it('handles unicode strings', () => {
      expect(filter.insert('日本語')).toBe(true)
      expect(filter.insert('🎉🚀')).toBe(true)
      expect(filter.size).toBe(2)
    })

    it('handles very long strings', () => {
      const longStr = 'a'.repeat(10000)
      expect(filter.insert(longStr)).toBe(true)
      expect(filter.size).toBe(1)
    })

    it('handles strings with special characters', () => {
      filter.insert('hello\nworld\t!')
      filter.insert('path/to/file.ts')
      expect(filter.size).toBe(2)
    })

    it('handles numeric strings', () => {
      filter.insert('123')
      filter.insert('456')
      expect(filter.size).toBe(2)
    })

    it('handles whitespace-only strings', () => {
      filter.insert('   ')
      filter.insert('\t')
      filter.insert('\n')
      expect(filter.size).toBe(3)
    })

    it('returns false when filter is too full', () => {
      const f = new CuckooFilter(4, { fingerprintSize: 4, maxKicks: 2 })
      const results: boolean[] = []
      for (let i = 0; i < 50; i++) {
        results.push(f.insert(`item-${i}`))
      }
      expect(results.some((r) => r === false)).toBe(true)
    })

    it('handles insert after removal', () => {
      filter.insert('test')
      filter.remove('test')
      expect(filter.insert('test')).toBe(true)
      expect(filter.size).toBe(1)
    })

    it('handles insert after clear', () => {
      filter.insert('before')
      filter.clear()
      expect(filter.insert('after')).toBe(true)
      expect(filter.size).toBe(1)
    })

    it('updates loadFactor after insert', () => {
      expect(filter.loadFactor).toBe(0)
      filter.insert('item')
      expect(filter.loadFactor).toBeGreaterThan(0)
    })

    it('handles strings with special regex characters', () => {
      expect(filter.insert('!@#$%^&*()')).toBe(true)
      expect(filter.contains('!@#$%^&*()')).toBe(true)
    })

    it('sets isEmpty to false after insert', () => {
      filter.insert('item')
      expect(filter.isEmpty).toBe(false)
    })
  })

  describe('contains', () => {
    it('returns true for inserted item', () => {
      filter.insert('hello')
      expect(filter.contains('hello')).toBe(true)
    })

    it('returns false for non-inserted item', () => {
      filter.insert('hello')
      expect(filter.contains('world')).toBe(false)
    })

    it('returns false for empty filter', () => {
      expect(filter.contains('anything')).toBe(false)
    })

    it('finds multiple inserted items', () => {
      filter.insert('a')
      filter.insert('b')
      filter.insert('c')
      expect(filter.contains('a')).toBe(true)
      expect(filter.contains('b')).toBe(true)
      expect(filter.contains('c')).toBe(true)
    })

    it('handles empty string lookup', () => {
      filter.insert('')
      expect(filter.contains('')).toBe(true)
    })

    it('handles unicode string lookup', () => {
      filter.insert('日本語')
      expect(filter.contains('日本語')).toBe(true)
      expect(filter.contains('English')).toBe(false)
    })

    it('finds items after many inserts', () => {
      for (let i = 0; i < 100; i++) {
        filter.insert(`item-${i}`)
      }
      expect(filter.contains('item-0')).toBe(true)
      expect(filter.contains('item-50')).toBe(true)
      expect(filter.contains('item-99')).toBe(true)
    })

    it('handles duplicate inserts consistently', () => {
      filter.insert('test')
      filter.insert('test')
      expect(filter.contains('test')).toBe(true)
    })

    it('returns false after item is removed', () => {
      filter.insert('removeme')
      filter.remove('removeme')
      expect(filter.contains('removeme')).toBe(false)
    })

    it('handles case sensitivity', () => {
      filter.insert('Hello')
      expect(filter.contains('Hello')).toBe(true)
      expect(filter.contains('hello')).toBe(false)
    })

    it('handles strings with null characters', () => {
      filter.insert('before\0after')
      expect(filter.contains('before\0after')).toBe(true)
    })

    it('never has false negatives', () => {
      for (let i = 0; i < 200; i++) {
        filter.insert(`item-${i}`)
      }
      for (let i = 0; i < 200; i++) {
        expect(filter.contains(`item-${i}`)).toBe(true)
      }
    })

    it('returns false after clear', () => {
      filter.insert('test')
      filter.clear()
      expect(filter.contains('test')).toBe(false)
    })

    it('does not find similar strings', () => {
      filter.insert('hello')
      expect(filter.contains('hell')).toBe(false)
      expect(filter.contains('helloo')).toBe(false)
    })

    it('handles mixed unicode content', () => {
      filter.insert('hello世界🎉')
      expect(filter.contains('hello世界🎉')).toBe(true)
      expect(filter.contains('hello世界')).toBe(false)
    })
  })

  describe('remove', () => {
    it('removes an inserted item', () => {
      filter.insert('hello')
      expect(filter.remove('hello')).toBe(true)
      expect(filter.size).toBe(0)
    })

    it('returns false for item not present', () => {
      expect(filter.remove('absent')).toBe(false)
    })

    it('returns false when removing from empty filter', () => {
      expect(filter.remove('anything')).toBe(false)
    })

    it('handles removing one of duplicates', () => {
      filter.insert('test')
      filter.insert('test')
      expect(filter.remove('test')).toBe(true)
      expect(filter.size).toBe(1)
      expect(filter.contains('test')).toBe(true)
    })

    it('does not affect other items when removing', () => {
      filter.insert('a')
      filter.insert('b')
      filter.remove('a')
      expect(filter.contains('b')).toBe(true)
    })

    it('handles remove of empty string', () => {
      filter.insert('')
      expect(filter.remove('')).toBe(true)
      expect(filter.size).toBe(0)
    })

    it('handles remove of unicode string', () => {
      filter.insert('日本語')
      expect(filter.remove('日本語')).toBe(true)
      expect(filter.contains('日本語')).toBe(false)
    })

    it('handles sequential removes', () => {
      filter.insert('a')
      filter.insert('b')
      filter.insert('c')
      expect(filter.remove('b')).toBe(true)
      expect(filter.size).toBe(2)
      expect(filter.remove('a')).toBe(true)
      expect(filter.size).toBe(1)
      expect(filter.remove('c')).toBe(true)
      expect(filter.size).toBe(0)
    })

    it('returns false on second remove of same item', () => {
      filter.insert('once')
      expect(filter.remove('once')).toBe(true)
      expect(filter.remove('once')).toBe(false)
    })

    it('decrements size on successful remove', () => {
      filter.insert('item')
      const sizeBefore = filter.size
      filter.remove('item')
      expect(filter.size).toBe(sizeBefore - 1)
    })

    it('does not decrement size on failed remove', () => {
      filter.insert('present')
      const sizeBefore = filter.size
      filter.remove('absent')
      expect(filter.size).toBe(sizeBefore)
    })

    it('handles remove of very long string', () => {
      const longKey = 'x'.repeat(100000)
      filter.insert(longKey)
      expect(filter.remove(longKey)).toBe(true)
      expect(filter.contains(longKey)).toBe(false)
    })

    it('handles remove on non-empty filter for absent item', () => {
      filter.insert('present')
      expect(filter.remove('absent')).toBe(false)
      expect(filter.size).toBe(1)
    })
  })

  describe('size', () => {
    it('returns 0 for new filter', () => {
      expect(filter.size).toBe(0)
    })

    it('returns 1 after one insert', () => {
      filter.insert('item')
      expect(filter.size).toBe(1)
    })

    it('tracks multiple inserts', () => {
      filter.insert('a')
      filter.insert('b')
      filter.insert('c')
      expect(filter.size).toBe(3)
    })

    it('counts duplicate inserts', () => {
      filter.insert('test')
      filter.insert('test')
      expect(filter.size).toBe(2)
    })

    it('decreases after remove', () => {
      filter.insert('item')
      filter.remove('item')
      expect(filter.size).toBe(0)
    })

    it('does not decrease after failed remove', () => {
      filter.insert('present')
      filter.remove('absent')
      expect(filter.size).toBe(1)
    })

    it('handles many items', () => {
      for (let i = 0; i < 100; i++) {
        filter.insert(`item-${i}`)
      }
      expect(filter.size).toBe(100)
    })

    it('resets to 0 after clear', () => {
      filter.insert('a')
      filter.insert('b')
      filter.clear()
      expect(filter.size).toBe(0)
    })
  })

  describe('capacity', () => {
    it('returns configured capacity', () => {
      expect(filter.capacity).toBe(1024)
    })

    it('returns custom capacity', () => {
      const f = new CuckooFilter(500)
      expect(f.capacity).toBe(500)
    })

    it('does not change after insert', () => {
      filter.insert('test')
      expect(filter.capacity).toBe(1024)
    })

    it('does not change after clear', () => {
      filter.insert('test')
      filter.clear()
      expect(filter.capacity).toBe(1024)
    })

    it('does not change after remove', () => {
      filter.insert('test')
      filter.remove('test')
      expect(filter.capacity).toBe(1024)
    })
  })

  describe('loadFactor', () => {
    it('returns 0 for empty filter', () => {
      expect(filter.loadFactor).toBe(0)
    })

    it('increases after inserting items', () => {
      filter.insert('item')
      expect(filter.loadFactor).toBeGreaterThan(0)
    })

    it('decreases after removing items', () => {
      filter.insert('item')
      const lfAfterInsert = filter.loadFactor
      filter.remove('item')
      expect(filter.loadFactor).toBeLessThan(lfAfterInsert)
    })

    it('is between 0 and 1', () => {
      for (let i = 0; i < 100; i++) {
        filter.insert(`item-${i}`)
      }
      expect(filter.loadFactor).toBeGreaterThanOrEqual(0)
      expect(filter.loadFactor).toBeLessThanOrEqual(1)
    })

    it('returns 0 after clear', () => {
      filter.insert('item')
      filter.clear()
      expect(filter.loadFactor).toBe(0)
    })

    it('increases with more items', () => {
      filter.insert('a')
      const lf1 = filter.loadFactor
      filter.insert('b')
      const lf2 = filter.loadFactor
      filter.insert('c')
      const lf3 = filter.loadFactor
      expect(lf2).toBeGreaterThanOrEqual(lf1)
      expect(lf3).toBeGreaterThanOrEqual(lf2)
    })

    it('reflects size relative to total slots', () => {
      const f = new CuckooFilter(8)
      f.insert('x')
      expect(f.loadFactor).toBeCloseTo(1 / 8, 1)
    })
  })

  describe('falsePositiveRate', () => {
    it('returns 0 for empty filter', () => {
      expect(filter.falsePositiveRate).toBe(0)
    })

    it('returns a positive value when items are present', () => {
      filter.insert('item')
      expect(filter.falsePositiveRate).toBeGreaterThan(0)
    })

    it('returns a value between 0 and 1', () => {
      filter.insert('item')
      expect(filter.falsePositiveRate).toBeGreaterThan(0)
      expect(filter.falsePositiveRate).toBeLessThanOrEqual(1)
    })

    it('is lower with larger fingerprint size', () => {
      const f1 = new CuckooFilter(100, { fingerprintSize: 4 })
      const f2 = new CuckooFilter(100, { fingerprintSize: 16 })
      f1.insert('item')
      f2.insert('item')
      expect(f2.falsePositiveRate).toBeLessThan(f1.falsePositiveRate)
    })

    it('returns 0 after clear', () => {
      filter.insert('item')
      filter.clear()
      expect(filter.falsePositiveRate).toBe(0)
    })

    it('is consistent for same configuration', () => {
      filter.insert('item')
      const rate1 = filter.falsePositiveRate
      const rate2 = filter.falsePositiveRate
      expect(rate1).toBe(rate2)
    })
  })

  describe('isEmpty', () => {
    it('returns true for new filter', () => {
      expect(filter.isEmpty).toBe(true)
    })

    it('returns false after insert', () => {
      filter.insert('item')
      expect(filter.isEmpty).toBe(false)
    })

    it('returns true after clearing all items', () => {
      filter.insert('a')
      filter.insert('b')
      filter.clear()
      expect(filter.isEmpty).toBe(true)
    })

    it('returns true after removing all items', () => {
      filter.insert('item')
      filter.remove('item')
      expect(filter.isEmpty).toBe(true)
    })

    it('returns false when items remain', () => {
      filter.insert('a')
      filter.insert('b')
      filter.remove('a')
      expect(filter.isEmpty).toBe(false)
    })
  })

  describe('clear', () => {
    it('removes all items', () => {
      filter.insert('a')
      filter.insert('b')
      filter.insert('c')
      filter.clear()
      expect(filter.size).toBe(0)
    })

    it('makes the filter empty', () => {
      filter.insert('test')
      filter.clear()
      expect(filter.size).toBe(0)
      expect(filter.loadFactor).toBe(0)
    })

    it('resets contains results', () => {
      filter.insert('test')
      filter.clear()
      expect(filter.contains('test')).toBe(false)
    })

    it('allows insert after clear', () => {
      filter.insert('first')
      filter.clear()
      filter.insert('second')
      expect(filter.size).toBe(1)
      expect(filter.contains('second')).toBe(true)
    })

    it('handles clearing an empty filter', () => {
      filter.clear()
      expect(filter.size).toBe(0)
    })

    it('preserves capacity after clear', () => {
      const cap = filter.capacity
      filter.insert('test')
      filter.clear()
      expect(filter.capacity).toBe(cap)
    })

    it('resets falsePositiveRate', () => {
      filter.insert('item')
      filter.clear()
      expect(filter.falsePositiveRate).toBe(0)
    })

    it('handles multiple clear calls', () => {
      filter.insert('a')
      filter.clear()
      filter.clear()
      expect(filter.size).toBe(0)
    })

    it('allows operations after clear', () => {
      filter.insert('before')
      filter.clear()
      filter.insert('after')
      expect(filter.contains('after')).toBe(true)
      expect(filter.contains('before')).toBe(false)
    })
  })

  describe('clone', () => {
    it('creates independent copy', () => {
      filter.insert('test')
      const cloned = filter.clone()
      expect(cloned.size).toBe(filter.size)
      expect(cloned.contains('test')).toBe(true)
    })

    it('does not affect original when clone is modified', () => {
      filter.insert('shared')
      const cloned = filter.clone()
      cloned.insert('new')
      expect(filter.contains('new')).toBe(false)
      expect(cloned.contains('new')).toBe(true)
    })

    it('does not affect clone when original is modified', () => {
      filter.insert('shared')
      const cloned = filter.clone()
      filter.insert('original-only')
      expect(cloned.contains('original-only')).toBe(false)
    })

    it('preserves capacity', () => {
      const f = new CuckooFilter(500)
      f.insert('test')
      const cloned = f.clone()
      expect(cloned.capacity).toBe(500)
    })

    it('preserves size', () => {
      filter.insert('a')
      filter.insert('b')
      const cloned = filter.clone()
      expect(cloned.size).toBe(2)
    })

    it('preserves loadFactor', () => {
      filter.insert('item')
      const cloned = filter.clone()
      expect(cloned.loadFactor).toBe(filter.loadFactor)
    })

    it('clones empty filter', () => {
      const cloned = filter.clone()
      expect(cloned.size).toBe(0)
      expect(cloned.loadFactor).toBe(0)
    })

    it('preserves removal state', () => {
      filter.insert('a')
      filter.insert('b')
      filter.remove('a')
      const cloned = filter.clone()
      expect(cloned.contains('a')).toBe(false)
      expect(cloned.contains('b')).toBe(true)
      expect(cloned.size).toBe(1)
    })

    it('stays independent after clear of original', () => {
      filter.insert('item')
      const cloned = filter.clone()
      filter.clear()
      expect(cloned.contains('item')).toBe(true)
      expect(cloned.size).toBe(1)
    })

    it('stays independent after remove on original', () => {
      filter.insert('item')
      const cloned = filter.clone()
      filter.remove('item')
      expect(cloned.contains('item')).toBe(true)
    })

    it('preserves falsePositiveRate', () => {
      filter.insert('item')
      const cloned = filter.clone()
      expect(cloned.falsePositiveRate).toBe(filter.falsePositiveRate)
    })
  })

  describe('fromItems', () => {
    it('creates filter from items', () => {
      const f = CuckooFilter.fromItems(['a', 'b', 'c'])
      expect(f.size).toBe(3)
      expect(f.contains('a')).toBe(true)
      expect(f.contains('b')).toBe(true)
      expect(f.contains('c')).toBe(true)
    })

    it('creates filter from empty array', () => {
      const f = CuckooFilter.fromItems<string>([])
      expect(f.size).toBe(0)
      expect(f.isEmpty).toBe(true)
    })

    it('creates filter from single item', () => {
      const f = CuckooFilter.fromItems(['only'])
      expect(f.size).toBe(1)
      expect(f.contains('only')).toBe(true)
    })

    it('accepts options', () => {
      const f = CuckooFilter.fromItems(['a', 'b'], { fingerprintSize: 8 })
      expect(f.size).toBe(2)
      expect(f.contains('a')).toBe(true)
    })

    it('creates filter with capacity scaled for items', () => {
      const items = ['x', 'y', 'z', 'w']
      const f = CuckooFilter.fromItems(items)
      expect(f.capacity).toBeGreaterThanOrEqual(items.length)
    })

    it('preserves no false negatives', () => {
      const items = Array.from({ length: 50 }, (_, i) => `item-${i}`)
      const f = CuckooFilter.fromItems(items)
      for (const item of items) {
        expect(f.contains(item)).toBe(true)
      }
    })

    it('works with number items', () => {
      const f = CuckooFilter.fromItems([1, 2, 3])
      expect(f.contains(1)).toBe(true)
      expect(f.contains(2)).toBe(true)
      expect(f.contains(3)).toBe(true)
    })
  })

  describe('forEach', () => {
    it('does not call callback on empty filter', () => {
      let count = 0
      filter.forEach(() => { count++ })
      expect(count).toBe(0)
    })

    it('calls callback for each stored fingerprint', () => {
      filter.insert('a')
      filter.insert('b')
      filter.insert('c')
      let count = 0
      filter.forEach(() => { count++ })
      expect(count).toBe(3)
    })

    it('provides fingerprint values', () => {
      filter.insert('test')
      let foundFp: number | null = null
      filter.forEach((fp) => { foundFp = fp })
      expect(foundFp).not.toBeNull()
      expect(typeof foundFp).toBe('number')
    })

    it('provides bucket indices', () => {
      filter.insert('a')
      const indices: number[] = []
      filter.forEach((_fp, bucketIndex) => { indices.push(bucketIndex) })
      expect(indices.length).toBe(1)
      expect(typeof indices[0]).toBe('number')
    })

    it('provides slot indices', () => {
      filter.insert('a')
      const slots: number[] = []
      filter.forEach((_fp, _bi, slotIndex) => { slots.push(slotIndex) })
      expect(slots.length).toBe(1)
      expect(typeof slots[0]).toBe('number')
    })

    it('iterates correct number of times matching size', () => {
      for (let i = 0; i < 10; i++) {
        filter.insert(`item-${i}`)
      }
      let count = 0
      filter.forEach(() => { count++ })
      expect(count).toBe(filter.size)
    })

    it('reflects removals', () => {
      filter.insert('a')
      filter.insert('b')
      filter.remove('a')
      let count = 0
      filter.forEach(() => { count++ })
      expect(count).toBe(1)
    })

    it('reflects clear', () => {
      filter.insert('a')
      filter.insert('b')
      filter.clear()
      let count = 0
      filter.forEach(() => { count++ })
      expect(count).toBe(0)
    })
  })

  describe('Symbol.iterator', () => {
    it('iterates over empty filter', () => {
      const fps: number[] = []
      for (const fp of filter) {
        fps.push(fp)
      }
      expect(fps).toEqual([])
    })

    it('iterates over fingerprints', () => {
      filter.insert('a')
      filter.insert('b')
      const fps: number[] = []
      for (const fp of filter) {
        fps.push(fp)
      }
      expect(fps.length).toBe(2)
      for (const fp of fps) {
        expect(typeof fp).toBe('number')
      }
    })

    it('works with spread operator', () => {
      filter.insert('a')
      filter.insert('b')
      filter.insert('c')
      const fps = [...filter]
      expect(fps.length).toBe(3)
    })

    it('works with Array.from', () => {
      filter.insert('a')
      const fps = Array.from(filter)
      expect(fps.length).toBe(1)
    })

    it('reflects removals', () => {
      filter.insert('a')
      filter.insert('b')
      filter.remove('a')
      const fps = [...filter]
      expect(fps.length).toBe(1)
    })

    it('reflects clear', () => {
      filter.insert('a')
      filter.insert('b')
      filter.clear()
      const fps = [...filter]
      expect(fps.length).toBe(0)
    })

    it('yields non-zero fingerprints', () => {
      filter.insert('test')
      for (const fp of filter) {
        expect(fp).not.toBe(0)
      }
    })
  })

  describe('toStats', () => {
    it('returns stats for empty filter', () => {
      const stats = filter.toStats()
      expect(stats.size).toBe(0)
      expect(stats.capacity).toBe(1024)
      expect(stats.loadFactor).toBe(0)
      expect(stats.falsePositiveRate).toBe(0)
      expect(stats.filledSlots).toBe(0)
    })

    it('returns stats for filter with items', () => {
      filter.insert('a')
      filter.insert('b')
      const stats = filter.toStats()
      expect(stats.size).toBe(2)
      expect(stats.filledSlots).toBe(2)
      expect(stats.loadFactor).toBeGreaterThan(0)
    })

    it('includes fingerprintSize', () => {
      const f = new CuckooFilter(64, { fingerprintSize: 8 })
      const stats = f.toStats()
      expect(stats.fingerprintSize).toBe(8)
    })

    it('includes maxKicks', () => {
      const f = new CuckooFilter(64, { maxKicks: 100 })
      const stats = f.toStats()
      expect(stats.maxKicks).toBe(100)
    })

    it('includes bucketSize', () => {
      const stats = filter.toStats()
      expect(stats.bucketSize).toBe(BUCKET_SIZE)
    })

    it('includes totalSlots', () => {
      const stats = filter.toStats()
      expect(stats.totalSlots).toBeGreaterThan(0)
    })

    it('reflects correct filledSlots after remove', () => {
      filter.insert('a')
      filter.insert('b')
      filter.remove('a')
      const stats = filter.toStats()
      expect(stats.filledSlots).toBe(1)
    })

    it('reflects correct state after clear', () => {
      filter.insert('a')
      filter.insert('b')
      filter.clear()
      const stats = filter.toStats()
      expect(stats.filledSlots).toBe(0)
      expect(stats.size).toBe(0)
    })

    it('returns consistent loadFactor', () => {
      filter.insert('item')
      const stats = filter.toStats()
      expect(stats.loadFactor).toBe(filter.loadFactor)
    })

    it('returns consistent falsePositiveRate', () => {
      filter.insert('item')
      const stats = filter.toStats()
      expect(stats.falsePositiveRate).toBe(filter.falsePositiveRate)
    })

    it('has all required fields', () => {
      const stats = filter.toStats()
      const keys = Object.keys(stats)
      expect(keys).toContain('size')
      expect(keys).toContain('capacity')
      expect(keys).toContain('loadFactor')
      expect(keys).toContain('falsePositiveRate')
      expect(keys).toContain('fingerprintSize')
      expect(keys).toContain('maxKicks')
      expect(keys).toContain('bucketSize')
      expect(keys).toContain('filledSlots')
      expect(keys).toContain('totalSlots')
    })
  })

  describe('custom hash function', () => {
    it('uses provided hash function', () => {
      let hashCalled = false
      const customHash = (s: string) => {
        hashCalled = true
        return defaultHash(s)
      }
      const f = new CuckooFilter(64, { hashFunction: customHash })
      f.insert('test')
      expect(hashCalled).toBe(true)
    })

    it('produces consistent results with custom hash', () => {
      const customHash = (s: string) => {
        let h = 0
        for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0
        return h >>> 0
      }
      const f = new CuckooFilter(256, { fingerprintSize: 12, hashFunction: customHash })
      f.insert('hello')
      expect(f.contains('hello')).toBe(true)
      expect(f.contains('zzzzzzz')).toBe(false)
    })

    it('produces different results with different hash', () => {
      const f1 = new CuckooFilter(256)
      const f2 = new CuckooFilter(256, {
        hashFunction: (s) => {
          let h = 5381
          for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0
          return h >>> 0
        },
      })
      f1.insert('test')
      f2.insert('test')
      expect(f1.contains('test')).toBe(true)
      expect(f2.contains('test')).toBe(true)
    })

    it('custom hash is used in clone', () => {
      let callCount = 0
      const customHash = (s: string) => {
        callCount++
        return defaultHash(s)
      }
      const f = new CuckooFilter(64, { hashFunction: customHash })
      f.insert('a')
      const cloned = f.clone()
      callCount = 0
      cloned.insert('b')
      expect(callCount).toBeGreaterThan(0)
    })
  })

  describe('generic type support', () => {
    it('works with number items', () => {
      const f = new CuckooFilter<number>(64)
      f.insert(42)
      f.insert(100)
      expect(f.contains(42)).toBe(true)
      expect(f.contains(100)).toBe(true)
      expect(f.contains(999)).toBe(false)
    })

    it('works with object items', () => {
      const f = new CuckooFilter<{ id: number }>(64)
      f.insert({ id: 1 })
      f.insert({ id: 2 })
      expect(f.contains({ id: 1 })).toBe(true)
      expect(f.contains({ id: 2 })).toBe(true)
    })

    it('works with boolean items', () => {
      const f = new CuckooFilter<boolean>(64)
      f.insert(true)
      f.insert(false)
      expect(f.contains(true)).toBe(true)
      expect(f.contains(false)).toBe(true)
    })

    it('works with null items', () => {
      const f = new CuckooFilter<null>(64)
      f.insert(null)
      expect(f.contains(null)).toBe(true)
    })

    it('works with array items', () => {
      const f = new CuckooFilter<number[]>(64)
      f.insert([1, 2, 3])
      expect(f.contains([1, 2, 3])).toBe(true)
    })

    it('handles remove with generic types', () => {
      const f = new CuckooFilter<number>(64)
      f.insert(42)
      expect(f.remove(42)).toBe(true)
      expect(f.contains(42)).toBe(false)
    })

    it('handles clone with generic types', () => {
      const f = new CuckooFilter<number>(64)
      f.insert(1)
      f.insert(2)
      const cloned = f.clone()
      expect(cloned.contains(1)).toBe(true)
      expect(cloned.contains(2)).toBe(true)
      expect(cloned.size).toBe(2)
    })

    it('handles clear with generic types', () => {
      const f = new CuckooFilter<number>(64)
      f.insert(1)
      f.insert(2)
      f.clear()
      expect(f.size).toBe(0)
      expect(f.contains(1)).toBe(false)
    })
  })

  describe('type exports', () => {
    it('exports DEFAULT_FINGERPRINT_SIZE', () => {
      expect(DEFAULT_FINGERPRINT_SIZE).toBe(4)
    })

    it('exports DEFAULT_MAX_KICKS', () => {
      expect(DEFAULT_MAX_KICKS).toBe(500)
    })

    it('exports BUCKET_SIZE', () => {
      expect(BUCKET_SIZE).toBe(4)
    })

    it('exports defaultHash function', () => {
      expect(typeof defaultHash).toBe('function')
      expect(typeof defaultHash('test')).toBe('number')
    })

    it('supports CuckooFilterOptions interface', () => {
      const opts: CuckooFilterOptions = {
        fingerprintSize: 8,
        maxKicks: 200,
      }
      expect(opts.fingerprintSize).toBe(8)
      expect(opts.maxKicks).toBe(200)
    })

    it('supports CuckooFilterStatistics interface', () => {
      const stats: CuckooFilterStatistics = {
        size: 0,
        capacity: 100,
        loadFactor: 0,
        falsePositiveRate: 0,
        fingerprintSize: 4,
        maxKicks: 500,
        bucketSize: 4,
        filledSlots: 0,
        totalSlots: 100,
      }
      expect(stats.size).toBe(0)
      expect(stats.capacity).toBe(100)
    })
  })

  describe('large item sets', () => {
    it('handles 500 items', () => {
      const f = new CuckooFilter(4096)
      for (let i = 0; i < 500; i++) {
        f.insert(`item-${i}`)
      }
      expect(f.size).toBe(500)
      expect(f.contains('item-0')).toBe(true)
      expect(f.contains('item-499')).toBe(true)
    })

    it('handles 500 items with no false negatives', () => {
      const f = new CuckooFilter(4096)
      for (let i = 0; i < 500; i++) {
        f.insert(`item-${i}`)
      }
      for (let i = 0; i < 500; i++) {
        expect(f.contains(`item-${i}`)).toBe(true)
      }
    })

    it('handles removal of large item sets', () => {
      const f = new CuckooFilter(4096)
      for (let i = 0; i < 200; i++) {
        f.insert(`item-${i}`)
      }
      for (let i = 0; i < 100; i++) {
        f.remove(`item-${i}`)
      }
      expect(f.size).toBe(100)
      for (let i = 100; i < 200; i++) {
        expect(f.contains(`item-${i}`)).toBe(true)
      }
    })

    it('handles rapid insert and check cycles', () => {
      const f = new CuckooFilter(4096)
      for (let i = 0; i < 200; i++) {
        f.insert(`item-${i}`)
        expect(f.contains(`item-${i}`)).toBe(true)
      }
    })

    it('handles many sequential inserts', () => {
      const f = new CuckooFilter(4096)
      for (let i = 0; i < 500; i++) {
        f.insert(`item-${i}`)
      }
      expect(f.size).toBe(500)
    })

    it('handles large number of operations', () => {
      const f = new CuckooFilter(4096)
      for (let i = 0; i < 500; i++) {
        f.insert(`item-${i}`)
      }
      for (let i = 0; i < 250; i++) {
        f.remove(`item-${i}`)
      }
      expect(f.size).toBe(250)
      for (let i = 250; i < 500; i++) {
        expect(f.contains(`item-${i}`)).toBe(true)
      }
    })

    it('handles removing all items from large set', () => {
      const f = new CuckooFilter(4096)
      const items = Array.from({ length: 50 }, (_, i) => `item-${i}`)
      for (const item of items) {
        f.insert(item)
      }
      for (const item of items) {
        f.remove(item)
      }
      expect(f.size).toBe(0)
    })
  })

  describe('false positive behavior', () => {
    it('has a reasonable false positive rate', () => {
      const f = new CuckooFilter(10000, { fingerprintSize: 12 })
      for (let i = 0; i < 5000; i++) {
        f.insert(`item-${i}`)
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

    it('reports no false negatives', () => {
      for (let i = 0; i < 200; i++) {
        filter.insert(`item-${i}`)
      }
      for (let i = 0; i < 200; i++) {
        expect(filter.contains(`item-${i}`)).toBe(true)
      }
    })
  })

  describe('edge cases', () => {
    it('handles very small capacity', () => {
      const f = new CuckooFilter(2)
      f.insert('item')
      expect(f.contains('item')).toBe(true)
    })

    it('handles insert then immediate remove', () => {
      filter.insert('test')
      filter.remove('test')
      expect(filter.size).toBe(0)
      expect(filter.contains('test')).toBe(false)
    })

    it('handles insert-remove-insert cycles', () => {
      for (let cycle = 0; cycle < 5; cycle++) {
        filter.insert('cyclic')
        expect(filter.contains('cyclic')).toBe(true)
        filter.remove('cyclic')
        expect(filter.contains('cyclic')).toBe(false)
      }
      expect(filter.size).toBe(0)
    })

    it('handles interleaved insert and remove of different items', () => {
      filter.insert('a')
      filter.insert('b')
      filter.remove('a')
      filter.insert('c')
      expect(filter.contains('a')).toBe(false)
      expect(filter.contains('b')).toBe(true)
      expect(filter.contains('c')).toBe(true)
      expect(filter.size).toBe(2)
    })

    it('tracks size correctly through complex operations', () => {
      filter.insert('x')
      filter.insert('y')
      filter.insert('x')
      filter.remove('x')
      expect(filter.size).toBe(2)
      filter.remove('x')
      expect(filter.size).toBe(1)
      filter.remove('y')
      expect(filter.size).toBe(0)
    })

    it('handles clone after many operations (probabilistic)', () => {
      const f = new CuckooFilter(4096, { fingerprintSize: 16 })
      for (let i = 0; i < 50; i++) {
        f.insert(`item-${i}`)
      }
      for (let i = 0; i < 25; i++) {
        f.remove(`item-${i}`)
      }
      const cloned = f.clone()
      for (let i = 25; i < 50; i++) {
        expect(cloned.contains(`item-${i}`)).toBe(true)
      }
      let falsePositives = 0
      for (let i = 0; i < 25; i++) {
        if (cloned.contains(`item-${i}`)) falsePositives++
      }
      expect(falsePositives).toBeLessThanOrEqual(5)
    })

    it('handles single character strings', () => {
      for (let i = 0; i < 26; i++) {
        filter.insert(String.fromCharCode(97 + i))
      }
      expect(filter.size).toBe(26)
      for (let i = 0; i < 26; i++) {
        expect(filter.contains(String.fromCharCode(97 + i))).toBe(true)
      }
    })

    it('handles strings that look like JSON', () => {
      filter.insert('{"key":"value"}')
      expect(filter.contains('{"key":"value"}')).toBe(true)
    })

    it('handles very long string key', () => {
      const longKey = 'x'.repeat(100000)
      filter.insert(longKey)
      expect(filter.contains(longKey)).toBe(true)
      expect(filter.remove(longKey)).toBe(true)
      expect(filter.contains(longKey)).toBe(false)
    })
  })

  describe('stress tests', () => {
    it('handles many operations in sequence', () => {
      const f = new CuckooFilter(2048, { fingerprintSize: 12 })
      for (let i = 0; i < 1000; i++) {
        f.insert(`item-${i}`)
      }
      for (let i = 0; i < 500; i++) {
        f.remove(`item-${i}`)
      }
      expect(f.size).toBe(500)
      for (let i = 500; i < 1000; i++) {
        expect(f.contains(`item-${i}`)).toBe(true)
      }
    })

    it('handles clone after many operations', () => {
      for (let i = 0; i < 200; i++) {
        filter.insert(`item-${i}`)
      }
      const cloned = filter.clone()
      for (let i = 0; i < 200; i++) {
        expect(cloned.contains(`item-${i}`)).toBe(true)
      }
    })

    it('handles clear after many operations', () => {
      for (let i = 0; i < 200; i++) {
        filter.insert(`item-${i}`)
      }
      filter.clear()
      expect(filter.size).toBe(0)
      for (let i = 0; i < 200; i++) {
        expect(filter.contains(`item-${i}`)).toBe(false)
      }
    })

    it('maintains correctness with interleaved operations', () => {
      filter.insert('x')
      filter.insert('y')
      filter.remove('x')
      filter.insert('z')
      expect(filter.contains('x')).toBe(false)
      expect(filter.contains('y')).toBe(true)
      expect(filter.contains('z')).toBe(true)
    })
  })
})
