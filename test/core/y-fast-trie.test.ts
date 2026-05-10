import { describe, it, expect, beforeEach } from 'vitest'
import { YFastTrie } from '../../src/core/y-fast-trie/y-fast-trie.js'
import type { YFastTrieStats } from '../../src/core/y-fast-trie/y-fast-trie.js'

describe('YFastTrie', () => {
  describe('constructor', () => {
    it('creates empty trie with small universe size', () => {
      const trie = new YFastTrie(16)
      expect(trie.size).toBe(0)
      expect(trie.isEmpty).toBe(true)
      expect(trie.min).toBeUndefined()
      expect(trie.max).toBeUndefined()
    })

    it('creates empty trie with universe size 2', () => {
      const trie = new YFastTrie(2)
      expect(trie.isEmpty).toBe(true)
    })

    it('creates empty trie with universe size 1', () => {
      const trie = new YFastTrie(1)
      expect(trie.isEmpty).toBe(true)
    })

    it('creates empty trie with large universe size', () => {
      const trie = new YFastTrie(1 << 20)
      expect(trie.isEmpty).toBe(true)
      expect(trie.size).toBe(0)
    })

    it('creates empty trie with universe size 1024', () => {
      const trie = new YFastTrie(1024)
      expect(trie.isEmpty).toBe(true)
    })

    it('creates empty trie with universe size 65536', () => {
      const trie = new YFastTrie(65536)
      expect(trie.isEmpty).toBe(true)
    })

    it('creates empty trie with non-power-of-2 universe size', () => {
      const trie = new YFastTrie(100)
      expect(trie.isEmpty).toBe(true)
    })

    it('creates trie with universe size 3 (odd)', () => {
      const trie = new YFastTrie(3)
      expect(trie.isEmpty).toBe(true)
    })
  })

  describe('insert', () => {
    let trie: YFastTrie

    beforeEach(() => {
      trie = new YFastTrie(256)
    })

    it('inserts a single value', () => {
      trie.insert(5)
      expect(trie.size).toBe(1)
      expect(trie.has(5)).toBe(true)
    })

    it('inserts multiple values', () => {
      trie.insert(10)
      trie.insert(20)
      trie.insert(30)
      expect(trie.size).toBe(3)
    })

    it('ignores duplicate inserts', () => {
      trie.insert(5)
      trie.insert(5)
      expect(trie.size).toBe(1)
    })

    it('ignores negative values', () => {
      trie.insert(-1)
      expect(trie.size).toBe(0)
    })

    it('ignores value equal to universe size', () => {
      trie.insert(256)
      expect(trie.size).toBe(0)
    })

    it('ignores value greater than universe size', () => {
      trie.insert(300)
      expect(trie.size).toBe(0)
    })

    it('inserts zero', () => {
      trie.insert(0)
      expect(trie.has(0)).toBe(true)
      expect(trie.size).toBe(1)
    })

    it('inserts value at universe size boundary minus one', () => {
      trie.insert(255)
      expect(trie.has(255)).toBe(true)
      expect(trie.size).toBe(1)
    })

    it('updates min on insert', () => {
      trie.insert(10)
      expect(trie.min).toBe(10)
      trie.insert(5)
      expect(trie.min).toBe(5)
    })

    it('updates max on insert', () => {
      trie.insert(10)
      expect(trie.max).toBe(10)
      trie.insert(20)
      expect(trie.max).toBe(20)
    })

    it('maintains sorted order in toArray after inserts', () => {
      trie.insert(30)
      trie.insert(10)
      trie.insert(20)
      expect(trie.toArray()).toEqual([10, 20, 30])
    })

    it('inserts values across multiple buckets', () => {
      const bigTrie = new YFastTrie(1024)
      bigTrie.insert(0)
      bigTrie.insert(100)
      bigTrie.insert(500)
      bigTrie.insert(1000)
      expect(bigTrie.size).toBe(4)
      expect(bigTrie.toArray()).toEqual([0, 100, 500, 1000])
    })

    it('inserts many values in reverse order', () => {
      for (let i = 50; i >= 0; i--) {
        trie.insert(i)
      }
      expect(trie.size).toBe(51)
      expect(trie.min).toBe(0)
      expect(trie.max).toBe(50)
    })
  })

  describe('delete', () => {
    let trie: YFastTrie

    beforeEach(() => {
      trie = new YFastTrie(256)
    })

    it('deletes an existing value', () => {
      trie.insert(5)
      expect(trie.delete(5)).toBe(true)
      expect(trie.has(5)).toBe(false)
      expect(trie.size).toBe(0)
    })

    it('returns false for non-existent value', () => {
      expect(trie.delete(5)).toBe(false)
    })

    it('returns false for negative value', () => {
      expect(trie.delete(-1)).toBe(false)
    })

    it('returns false for value >= universeSize', () => {
      expect(trie.delete(256)).toBe(false)
      expect(trie.delete(300)).toBe(false)
    })

    it('deletes from middle and maintains order', () => {
      trie.insert(10)
      trie.insert(20)
      trie.insert(30)
      trie.delete(20)
      expect(trie.toArray()).toEqual([10, 30])
      expect(trie.size).toBe(2)
    })

    it('deletes min and updates', () => {
      trie.insert(5)
      trie.insert(10)
      trie.insert(15)
      trie.delete(5)
      expect(trie.min).toBe(10)
    })

    it('deletes max and updates', () => {
      trie.insert(5)
      trie.insert(10)
      trie.insert(15)
      trie.delete(15)
      expect(trie.max).toBe(10)
    })

    it('deletes the only element and clears min/max', () => {
      trie.insert(42)
      trie.delete(42)
      expect(trie.min).toBeUndefined()
      expect(trie.max).toBeUndefined()
      expect(trie.isEmpty).toBe(true)
    })

    it('deletes all elements one by one', () => {
      trie.insert(1)
      trie.insert(2)
      trie.insert(3)
      trie.delete(2)
      expect(trie.size).toBe(2)
      trie.delete(1)
      expect(trie.size).toBe(1)
      trie.delete(3)
      expect(trie.size).toBe(0)
      expect(trie.isEmpty).toBe(true)
    })

    it('does not delete same element twice', () => {
      trie.insert(5)
      expect(trie.delete(5)).toBe(true)
      expect(trie.delete(5)).toBe(false)
    })

    it('handles deleting from empty trie', () => {
      expect(trie.delete(0)).toBe(false)
    })

    it('deletes bucket when it becomes empty', () => {
      const bigTrie = new YFastTrie(1024)
      bigTrie.insert(0)
      bigTrie.delete(0)
      expect(bigTrie.stats().bucketCount).toBe(0)
    })
  })

  describe('has (contains)', () => {
    let trie: YFastTrie

    beforeEach(() => {
      trie = new YFastTrie(256)
      trie.insert(10)
      trie.insert(20)
      trie.insert(30)
    })

    it('returns true for existing values', () => {
      expect(trie.has(10)).toBe(true)
      expect(trie.has(20)).toBe(true)
      expect(trie.has(30)).toBe(true)
    })

    it('returns false for non-existing values', () => {
      expect(trie.has(5)).toBe(false)
      expect(trie.has(15)).toBe(false)
      expect(trie.has(25)).toBe(false)
    })

    it('returns false for negative values', () => {
      expect(trie.has(-1)).toBe(false)
      expect(trie.has(-100)).toBe(false)
    })

    it('returns false for values >= universeSize', () => {
      expect(trie.has(256)).toBe(false)
      expect(trie.has(1000)).toBe(false)
    })

    it('returns false for value just outside range', () => {
      const small = new YFastTrie(3)
      small.insert(0)
      small.insert(1)
      small.insert(2)
      expect(small.has(3)).toBe(false)
    })

    it('returns true for zero when inserted', () => {
      const t = new YFastTrie(10)
      t.insert(0)
      expect(t.has(0)).toBe(true)
    })

    it('returns false after deletion', () => {
      trie.delete(20)
      expect(trie.has(20)).toBe(false)
    })
  })

  describe('min', () => {
    it('returns undefined for empty trie', () => {
      const trie = new YFastTrie(256)
      expect(trie.min).toBeUndefined()
    })

    it('returns the only element', () => {
      const trie = new YFastTrie(256)
      trie.insert(42)
      expect(trie.min).toBe(42)
    })

    it('returns smallest after multiple inserts', () => {
      const trie = new YFastTrie(256)
      trie.insert(50)
      trie.insert(10)
      trie.insert(30)
      expect(trie.min).toBe(10)
    })

    it('updates after deleting the min', () => {
      const trie = new YFastTrie(256)
      trie.insert(5)
      trie.insert(10)
      trie.insert(15)
      trie.delete(5)
      expect(trie.min).toBe(10)
    })

    it('returns undefined after deleting all', () => {
      const trie = new YFastTrie(256)
      trie.insert(1)
      trie.delete(1)
      expect(trie.min).toBeUndefined()
    })

    it('returns zero when zero is min', () => {
      const trie = new YFastTrie(256)
      trie.insert(0)
      trie.insert(5)
      expect(trie.min).toBe(0)
    })
  })

  describe('max', () => {
    it('returns undefined for empty trie', () => {
      const trie = new YFastTrie(256)
      expect(trie.max).toBeUndefined()
    })

    it('returns the only element', () => {
      const trie = new YFastTrie(256)
      trie.insert(42)
      expect(trie.max).toBe(42)
    })

    it('returns largest after multiple inserts', () => {
      const trie = new YFastTrie(256)
      trie.insert(10)
      trie.insert(50)
      trie.insert(30)
      expect(trie.max).toBe(50)
    })

    it('updates after deleting the max', () => {
      const trie = new YFastTrie(256)
      trie.insert(5)
      trie.insert(10)
      trie.insert(15)
      trie.delete(15)
      expect(trie.max).toBe(10)
    })

    it('returns undefined after deleting all', () => {
      const trie = new YFastTrie(256)
      trie.insert(1)
      trie.delete(1)
      expect(trie.max).toBeUndefined()
    })

    it('returns universeSize-1 when that is max', () => {
      const trie = new YFastTrie(256)
      trie.insert(255)
      trie.insert(100)
      expect(trie.max).toBe(255)
    })
  })

  describe('successor', () => {
    let trie: YFastTrie

    beforeEach(() => {
      trie = new YFastTrie(256)
      trie.insert(10)
      trie.insert(20)
      trie.insert(30)
      trie.insert(50)
      trie.insert(80)
    })

    it('returns undefined for empty trie', () => {
      const empty = new YFastTrie(256)
      expect(empty.successor(5)).toBeUndefined()
    })

    it('returns next element in same bucket', () => {
      expect(trie.successor(10)).toBe(20)
    })

    it('returns next element across buckets', () => {
      const bigTrie = new YFastTrie(1024)
      bigTrie.insert(0)
      bigTrie.insert(100)
      bigTrie.insert(500)
      expect(bigTrie.successor(0)).toBe(100)
    })

    it('returns undefined if x is the maximum', () => {
      expect(trie.successor(80)).toBeUndefined()
    })

    it('returns undefined if all values <= x', () => {
      expect(trie.successor(100)).toBeUndefined()
    })

    it('returns the smallest element greater than x when x not present', () => {
      expect(trie.successor(15)).toBe(20)
    })

    it('returns the smallest element greater than x at bucket boundary', () => {
      expect(trie.successor(35)).toBe(50)
    })

    it('returns next for value before first element', () => {
      expect(trie.successor(0)).toBe(10)
    })

    it('returns element for x at gap between elements', () => {
      expect(trie.successor(21)).toBe(30)
    })

    it('returns successor of 0 when 0 is inserted', () => {
      const t = new YFastTrie(256)
      t.insert(0)
      t.insert(5)
      expect(t.successor(0)).toBe(5)
    })
  })

  describe('predecessor', () => {
    let trie: YFastTrie

    beforeEach(() => {
      trie = new YFastTrie(256)
      trie.insert(10)
      trie.insert(20)
      trie.insert(30)
      trie.insert(50)
      trie.insert(80)
    })

    it('returns undefined for empty trie', () => {
      const empty = new YFastTrie(256)
      expect(empty.predecessor(5)).toBeUndefined()
    })

    it('returns previous element in same bucket', () => {
      expect(trie.predecessor(20)).toBe(10)
    })

    it('returns previous element across buckets', () => {
      const bigTrie = new YFastTrie(1024)
      bigTrie.insert(0)
      bigTrie.insert(100)
      bigTrie.insert(500)
      expect(bigTrie.predecessor(500)).toBe(100)
    })

    it('returns undefined if x is the minimum', () => {
      expect(trie.predecessor(10)).toBeUndefined()
    })

    it('returns undefined if all values >= x and x <= min', () => {
      expect(trie.predecessor(0)).toBeUndefined()
    })

    it('returns largest element smaller than x when x not present', () => {
      expect(trie.predecessor(15)).toBe(10)
    })

    it('returns largest element smaller than x at gap', () => {
      expect(trie.predecessor(25)).toBe(20)
    })

    it('returns predecessor for value after last element', () => {
      expect(trie.predecessor(100)).toBe(80)
    })

    it('returns predecessor at boundary gap', () => {
      expect(trie.predecessor(45)).toBe(30)
    })
  })

  describe('size', () => {
    it('returns 0 for empty trie', () => {
      const trie = new YFastTrie(256)
      expect(trie.size).toBe(0)
    })

    it('increments on insert', () => {
      const trie = new YFastTrie(256)
      trie.insert(1)
      expect(trie.size).toBe(1)
      trie.insert(2)
      expect(trie.size).toBe(2)
      trie.insert(3)
      expect(trie.size).toBe(3)
    })

    it('does not increment on duplicate insert', () => {
      const trie = new YFastTrie(256)
      trie.insert(1)
      trie.insert(1)
      expect(trie.size).toBe(1)
    })

    it('decrements on delete', () => {
      const trie = new YFastTrie(256)
      trie.insert(1)
      trie.insert(2)
      trie.delete(1)
      expect(trie.size).toBe(1)
    })
  })

  describe('isEmpty', () => {
    it('returns true for new trie', () => {
      expect(new YFastTrie(256).isEmpty).toBe(true)
    })

    it('returns false after insert', () => {
      const trie = new YFastTrie(256)
      trie.insert(1)
      expect(trie.isEmpty).toBe(false)
    })

    it('returns true after deleting all elements', () => {
      const trie = new YFastTrie(256)
      trie.insert(1)
      trie.delete(1)
      expect(trie.isEmpty).toBe(true)
    })

    it('returns true after clear', () => {
      const trie = new YFastTrie(256)
      trie.insert(1)
      trie.insert(2)
      trie.clear()
      expect(trie.isEmpty).toBe(true)
    })
  })

  describe('clear', () => {
    it('clears all elements', () => {
      const trie = new YFastTrie(256)
      trie.insert(10)
      trie.insert(20)
      trie.insert(30)
      trie.clear()
      expect(trie.size).toBe(0)
      expect(trie.isEmpty).toBe(true)
      expect(trie.min).toBeUndefined()
      expect(trie.max).toBeUndefined()
    })

    it('clears empty trie without error', () => {
      const trie = new YFastTrie(256)
      trie.clear()
      expect(trie.isEmpty).toBe(true)
    })

    it('allows inserts after clear', () => {
      const trie = new YFastTrie(256)
      trie.insert(10)
      trie.clear()
      trie.insert(20)
      expect(trie.size).toBe(1)
      expect(trie.has(20)).toBe(true)
      expect(trie.has(10)).toBe(false)
    })

    it('can clear and reuse multiple times', () => {
      const trie = new YFastTrie(256)
      for (let round = 0; round < 5; round++) {
        trie.insert(round * 10)
        trie.insert(round * 10 + 5)
        expect(trie.size).toBe(2)
        trie.clear()
        expect(trie.size).toBe(0)
      }
    })
  })

  describe('toArray', () => {
    it('returns empty array for empty trie', () => {
      const trie = new YFastTrie(256)
      expect(trie.toArray()).toEqual([])
    })

    it('returns single element', () => {
      const trie = new YFastTrie(256)
      trie.insert(42)
      expect(trie.toArray()).toEqual([42])
    })

    it('returns sorted elements', () => {
      const trie = new YFastTrie(256)
      trie.insert(30)
      trie.insert(10)
      trie.insert(20)
      expect(trie.toArray()).toEqual([10, 20, 30])
    })

    it('returns sorted elements across buckets', () => {
      const trie = new YFastTrie(1024)
      trie.insert(500)
      trie.insert(100)
      trie.insert(0)
      trie.insert(999)
      expect(trie.toArray()).toEqual([0, 100, 500, 999])
    })

    it('reflects mutations', () => {
      const trie = new YFastTrie(256)
      trie.insert(10)
      trie.insert(20)
      trie.insert(30)
      trie.delete(20)
      expect(trie.toArray()).toEqual([10, 30])
    })

    it('returns correct order for sequential values', () => {
      const trie = new YFastTrie(64)
      for (let i = 0; i < 10; i++) {
        trie.insert(i)
      }
      const arr = trie.toArray()
      expect(arr).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
    })
  })

  describe('clone', () => {
    it('clones an empty trie', () => {
      const trie = new YFastTrie(256)
      const cloned = trie.clone()
      expect(cloned.size).toBe(0)
      expect(cloned.isEmpty).toBe(true)
    })

    it('clones a trie with elements', () => {
      const trie = new YFastTrie(256)
      trie.insert(10)
      trie.insert(20)
      trie.insert(30)
      const cloned = trie.clone()
      expect(cloned.size).toBe(3)
      expect(cloned.toArray()).toEqual([10, 20, 30])
    })

    it('clone is independent from original', () => {
      const trie = new YFastTrie(256)
      trie.insert(10)
      trie.insert(20)
      const cloned = trie.clone()
      cloned.delete(10)
      expect(trie.has(10)).toBe(true)
      expect(cloned.has(10)).toBe(false)
    })

    it('modifying original does not affect clone', () => {
      const trie = new YFastTrie(256)
      trie.insert(10)
      const cloned = trie.clone()
      trie.insert(20)
      expect(trie.size).toBe(2)
      expect(cloned.size).toBe(1)
    })

    it('clone preserves min and max', () => {
      const trie = new YFastTrie(256)
      trie.insert(5)
      trie.insert(100)
      trie.insert(50)
      const cloned = trie.clone()
      expect(cloned.min).toBe(5)
      expect(cloned.max).toBe(100)
    })

    it('clone preserves universe size', () => {
      const trie = new YFastTrie(1024)
      trie.insert(500)
      const cloned = trie.clone()
      cloned.insert(1000)
      expect(cloned.has(1000)).toBe(true)
    })
  })

  describe('static from', () => {
    it('creates trie from empty array', () => {
      const trie = YFastTrie.from([], 256)
      expect(trie.size).toBe(0)
      expect(trie.isEmpty).toBe(true)
    })

    it('creates trie from single element array', () => {
      const trie = YFastTrie.from([42], 256)
      expect(trie.size).toBe(1)
      expect(trie.has(42)).toBe(true)
    })

    it('creates trie from multiple elements', () => {
      const trie = YFastTrie.from([30, 10, 20], 256)
      expect(trie.size).toBe(3)
      expect(trie.toArray()).toEqual([10, 20, 30])
    })

    it('deduplicates when creating from array with duplicates', () => {
      const trie = YFastTrie.from([5, 5, 5], 256)
      expect(trie.size).toBe(1)
    })

    it('ignores out-of-range values in array', () => {
      const trie = YFastTrie.from([-1, 10, 300], 256)
      expect(trie.size).toBe(1)
      expect(trie.has(10)).toBe(true)
    })

    it('creates trie with correct universe size', () => {
      const trie = YFastTrie.from([0, 100], 1024)
      expect(trie.size).toBe(2)
    })
  })

  describe('stats', () => {
    it('returns zero stats for empty trie', () => {
      const trie = new YFastTrie(256)
      const s = trie.stats()
      expect(s.size).toBe(0)
      expect(s.bucketCount).toBe(0)
      expect(s.minBucketSize).toBe(0)
      expect(s.maxBucketSize).toBe(0)
    })

    it('returns stats for single element', () => {
      const trie = new YFastTrie(256)
      trie.insert(10)
      const s = trie.stats()
      expect(s.size).toBe(1)
      expect(s.bucketCount).toBe(1)
      expect(s.minBucketSize).toBe(1)
      expect(s.maxBucketSize).toBe(1)
    })

    it('returns stats for elements in multiple buckets', () => {
      const trie = new YFastTrie(1024)
      trie.insert(0)
      trie.insert(100)
      trie.insert(500)
      trie.insert(501)
      trie.insert(502)
      const s = trie.stats()
      expect(s.size).toBe(5)
      expect(s.bucketCount).toBe(3)
      expect(s.maxBucketSize).toBe(3)
    })

    it('updates stats after deletion', () => {
      const trie = new YFastTrie(256)
      trie.insert(10)
      trie.insert(20)
      trie.delete(10)
      const s = trie.stats()
      expect(s.size).toBe(1)
      expect(s.bucketCount).toBe(1)
    })
  })

  describe('edge cases - single element', () => {
    it('successor of single element returns undefined', () => {
      const trie = new YFastTrie(256)
      trie.insert(42)
      expect(trie.successor(42)).toBeUndefined()
    })

    it('predecessor of single element returns undefined', () => {
      const trie = new YFastTrie(256)
      trie.insert(42)
      expect(trie.predecessor(42)).toBeUndefined()
    })

    it('successor of value less than single element', () => {
      const trie = new YFastTrie(256)
      trie.insert(42)
      expect(trie.successor(0)).toBe(42)
    })

    it('predecessor of value greater than single element', () => {
      const trie = new YFastTrie(256)
      trie.insert(42)
      expect(trie.predecessor(100)).toBe(42)
    })

    it('min equals max for single element', () => {
      const trie = new YFastTrie(256)
      trie.insert(42)
      expect(trie.min).toBe(42)
      expect(trie.max).toBe(42)
    })
  })

  describe('edge cases - boundaries', () => {
    it('inserts 0 as min', () => {
      const trie = new YFastTrie(256)
      trie.insert(0)
      trie.insert(100)
      expect(trie.min).toBe(0)
    })

    it('inserts universeSize-1 as max', () => {
      const trie = new YFastTrie(256)
      trie.insert(100)
      trie.insert(255)
      expect(trie.max).toBe(255)
    })

    it('successor across bucket boundary', () => {
      const trie = new YFastTrie(1024)
      trie.insert(3)
      trie.insert(10)
      expect(trie.successor(3)).toBe(10)
    })

    it('predecessor across bucket boundary', () => {
      const trie = new YFastTrie(1024)
      trie.insert(3)
      trie.insert(10)
      expect(trie.predecessor(10)).toBe(3)
    })

    it('handles universe size 2 with values 0 and 1', () => {
      const trie = new YFastTrie(2)
      trie.insert(0)
      trie.insert(1)
      expect(trie.size).toBe(2)
      expect(trie.min).toBe(0)
      expect(trie.max).toBe(1)
      expect(trie.successor(0)).toBe(1)
      expect(trie.predecessor(1)).toBe(0)
    })

    it('handles universe size 4 completely filled', () => {
      const trie = new YFastTrie(4)
      trie.insert(0)
      trie.insert(1)
      trie.insert(2)
      trie.insert(3)
      expect(trie.size).toBe(4)
      expect(trie.min).toBe(0)
      expect(trie.max).toBe(3)
    })
  })

  describe('edge cases - all same values', () => {
    it('ignores duplicate inserts of same value', () => {
      const trie = new YFastTrie(256)
      for (let i = 0; i < 100; i++) {
        trie.insert(42)
      }
      expect(trie.size).toBe(1)
      expect(trie.has(42)).toBe(true)
    })
  })

  describe('successor and predecessor consistency', () => {
    it('successor then predecessor returns original', () => {
      const trie = new YFastTrie(256)
      trie.insert(10)
      trie.insert(20)
      trie.insert(30)
      const succ = trie.successor(10)
      expect(succ).toBe(20)
      if (succ !== undefined) {
        expect(trie.predecessor(succ)).toBe(10)
      }
    })

    it('predecessor then successor returns original', () => {
      const trie = new YFastTrie(256)
      trie.insert(10)
      trie.insert(20)
      trie.insert(30)
      const pred = trie.predecessor(30)
      expect(pred).toBe(20)
      if (pred !== undefined) {
        expect(trie.successor(pred)).toBe(30)
      }
    })

    it('successor chain from min to max', () => {
      const trie = new YFastTrie(256)
      const values = [5, 15, 25, 35, 45]
      for (const v of values) {
        trie.insert(v)
      }
      let current = trie.min
      const traversed: number[] = []
      while (current !== undefined) {
        traversed.push(current)
        current = trie.successor(current)
      }
      expect(traversed).toEqual(values)
    })

    it('predecessor chain from max to min', () => {
      const trie = new YFastTrie(256)
      const values = [5, 15, 25, 35, 45]
      for (const v of values) {
        trie.insert(v)
      }
      let current = trie.max
      const traversed: number[] = []
      while (current !== undefined) {
        traversed.push(current)
        current = trie.predecessor(current)
      }
      expect(traversed).toEqual([45, 35, 25, 15, 5])
    })
  })

  describe('stress test - sequential insertions', () => {
    it('inserts 500 sequential values', () => {
      const trie = new YFastTrie(1024)
      for (let i = 0; i < 500; i++) {
        trie.insert(i)
      }
      expect(trie.size).toBe(500)
      expect(trie.min).toBe(0)
      expect(trie.max).toBe(499)
      for (let i = 0; i < 500; i++) {
        expect(trie.has(i)).toBe(true)
      }
    })

    it('inserts 200 values in reverse order', () => {
      const trie = new YFastTrie(1024)
      for (let i = 199; i >= 0; i--) {
        trie.insert(i)
      }
      expect(trie.size).toBe(200)
      expect(trie.min).toBe(0)
      expect(trie.max).toBe(199)
    })
  })

  describe('stress test - random operations', () => {
    it('insert then delete all', () => {
      const trie = new YFastTrie(1024)
      const values = [23, 45, 12, 89, 67, 34, 56, 78, 90, 1]
      for (const v of values) {
        trie.insert(v)
      }
      expect(trie.size).toBe(values.length)
      for (const v of values) {
        expect(trie.delete(v)).toBe(true)
      }
      expect(trie.isEmpty).toBe(true)
    })

    it('interleaved insert and delete', () => {
      const trie = new YFastTrie(256)
      trie.insert(10)
      trie.insert(20)
      trie.delete(10)
      trie.insert(30)
      trie.insert(10)
      trie.delete(20)
      expect(trie.size).toBe(2)
      expect(trie.has(10)).toBe(true)
      expect(trie.has(20)).toBe(false)
      expect(trie.has(30)).toBe(true)
    })

    it('insert many spread values', () => {
      const trie = new YFastTrie(1 << 16)
      const spread = [0, 1000, 5000, 10000, 30000, 50000, 60000]
      for (const v of spread) {
        trie.insert(v)
      }
      expect(trie.size).toBe(spread.length)
      expect(trie.min).toBe(0)
      expect(trie.max).toBe(60000)
      const arr = trie.toArray()
      expect(arr).toEqual([...spread].sort((a, b) => a - b))
    })
  })

  describe('successor/predecessor with non-present query values', () => {
    let trie: YFastTrie

    beforeEach(() => {
      trie = new YFastTrie(1024)
      trie.insert(10)
      trie.insert(50)
      trie.insert(100)
      trie.insert(500)
      trie.insert(900)
    })

    it('successor of value between elements', () => {
      expect(trie.successor(11)).toBe(50)
      expect(trie.successor(55)).toBe(100)
      expect(trie.successor(200)).toBe(500)
      expect(trie.successor(501)).toBe(900)
    })

    it('predecessor of value between elements', () => {
      expect(trie.predecessor(9)).toBeUndefined()
      expect(trie.predecessor(49)).toBe(10)
      expect(trie.predecessor(99)).toBe(50)
      expect(trie.predecessor(499)).toBe(100)
      expect(trie.predecessor(899)).toBe(500)
    })

    it('successor of value before min returns min', () => {
      expect(trie.successor(0)).toBe(10)
    })

    it('successor of value after max returns undefined', () => {
      expect(trie.successor(1000)).toBeUndefined()
    })

    it('predecessor of value before min returns undefined', () => {
      expect(trie.predecessor(5)).toBeUndefined()
      expect(trie.predecessor(9)).toBeUndefined()
    })

    it('predecessor of value after max returns max', () => {
      expect(trie.predecessor(999)).toBe(900)
    })

    it('predecessor of exact min returns undefined', () => {
      expect(trie.predecessor(10)).toBeUndefined()
    })

    it('successor of exact max returns undefined', () => {
      expect(trie.successor(900)).toBeUndefined()
    })
  })

  describe('clear and reuse', () => {
    it('can reuse trie after clear', () => {
      const trie = new YFastTrie(256)
      trie.insert(1)
      trie.insert(2)
      trie.insert(3)
      trie.clear()
      trie.insert(100)
      trie.insert(200)
      expect(trie.size).toBe(2)
      expect(trie.has(100)).toBe(true)
      expect(trie.has(1)).toBe(false)
      expect(trie.min).toBe(100)
      expect(trie.max).toBe(200)
    })
  })

  describe('insert-delete-insert pattern', () => {
    it('can reinsert deleted value', () => {
      const trie = new YFastTrie(256)
      trie.insert(42)
      trie.delete(42)
      expect(trie.has(42)).toBe(false)
      trie.insert(42)
      expect(trie.has(42)).toBe(true)
      expect(trie.size).toBe(1)
    })

    it('maintains correctness with insert-delete cycles', () => {
      const trie = new YFastTrie(256)
      for (let i = 0; i < 10; i++) {
        trie.insert(i)
      }
      for (let i = 0; i < 10; i += 2) {
        trie.delete(i)
      }
      expect(trie.toArray()).toEqual([1, 3, 5, 7, 9])
      for (let i = 0; i < 10; i += 2) {
        trie.insert(i)
      }
      expect(trie.toArray()).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
    })
  })

  describe('min/max maintenance during deletions', () => {
    it('tracks min correctly through multiple deletions', () => {
      const trie = new YFastTrie(256)
      for (let i = 0; i < 10; i++) {
        trie.insert(i)
      }
      for (let i = 0; i < 10; i++) {
        expect(trie.min).toBe(i)
        trie.delete(i)
      }
      expect(trie.min).toBeUndefined()
    })

    it('tracks max correctly through multiple deletions', () => {
      const trie = new YFastTrie(256)
      for (let i = 0; i < 10; i++) {
        trie.insert(i)
      }
      for (let i = 9; i >= 0; i--) {
        expect(trie.max).toBe(i)
        trie.delete(i)
      }
      expect(trie.max).toBeUndefined()
    })

    it('tracks min when deleting non-min elements', () => {
      const trie = new YFastTrie(256)
      trie.insert(5)
      trie.insert(10)
      trie.insert(15)
      trie.delete(10)
      expect(trie.min).toBe(5)
      trie.delete(15)
      expect(trie.min).toBe(5)
    })

    it('tracks max when deleting non-max elements', () => {
      const trie = new YFastTrie(256)
      trie.insert(5)
      trie.insert(10)
      trie.insert(15)
      trie.delete(5)
      expect(trie.max).toBe(15)
      trie.delete(10)
      expect(trie.max).toBe(15)
    })
  })
})
