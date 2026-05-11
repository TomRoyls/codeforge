import { describe, it, expect, beforeEach } from 'vitest'
import { YFastTrie } from '../../src/core/y-fast-trie/index.js'
import { DEFAULT_UNIVERSE_SIZE } from '../../src/core/y-fast-trie/index.js'
import type { YFastTrieOptions } from '../../src/core/y-fast-trie/index.js'

describe('YFastTrie', () => {
  describe('constructor', () => {
    it('creates empty trie with default universe size', () => {
      const trie = new YFastTrie()
      expect(trie.size()).toBe(0)
      expect(trie.isEmpty()).toBe(true)
    })

    it('creates empty trie with custom universe size', () => {
      const trie = new YFastTrie({ universeSize: 16 })
      expect(trie.size()).toBe(0)
      expect(trie.isEmpty()).toBe(true)
    })

    it('creates empty trie with universe size 2', () => {
      const trie = new YFastTrie({ universeSize: 2 })
      expect(trie.isEmpty()).toBe(true)
    })

    it('creates empty trie with universe size 4', () => {
      const trie = new YFastTrie({ universeSize: 4 })
      expect(trie.isEmpty()).toBe(true)
    })

    it('creates empty trie with large universe size', () => {
      const trie = new YFastTrie({ universeSize: 1 << 20 })
      expect(trie.isEmpty()).toBe(true)
      expect(trie.size()).toBe(0)
    })

    it('creates empty trie with universe size 65536', () => {
      const trie = new YFastTrie({ universeSize: 65536 })
      expect(trie.isEmpty()).toBe(true)
    })

    it('throws for universe size less than 2', () => {
      expect(() => new YFastTrie({ universeSize: 1 })).toThrow(RangeError)
    })

    it('throws for universe size 0', () => {
      expect(() => new YFastTrie({ universeSize: 0 })).toThrow(RangeError)
    })

    it('creates trie with non-power-of-2 universe size', () => {
      const trie = new YFastTrie({ universeSize: 100 })
      expect(trie.isEmpty()).toBe(true)
    })

    it('creates trie with universe size 3', () => {
      const trie = new YFastTrie({ universeSize: 3 })
      expect(trie.isEmpty()).toBe(true)
    })
  })

  describe('DEFAULT_UNIVERSE_SIZE', () => {
    it('is 256', () => {
      expect(DEFAULT_UNIVERSE_SIZE).toBe(256)
    })
  })

  describe('insert and has', () => {
    let trie: YFastTrie

    beforeEach(() => {
      trie = new YFastTrie({ universeSize: 256 })
    })

    it('inserts a single value and reports it present', () => {
      trie.insert(5)
      expect(trie.has(5)).toBe(true)
      expect(trie.size()).toBe(1)
    })

    it('inserts value 0', () => {
      trie.insert(0)
      expect(trie.has(0)).toBe(true)
    })

    it('inserts max value in universe', () => {
      trie.insert(255)
      expect(trie.has(255)).toBe(true)
    })

    it('does not duplicate insert', () => {
      trie.insert(5)
      trie.insert(5)
      expect(trie.size()).toBe(1)
    })

    it('inserts multiple values', () => {
      trie.insert(3)
      trie.insert(7)
      trie.insert(11)
      expect(trie.size()).toBe(3)
      expect(trie.has(3)).toBe(true)
      expect(trie.has(7)).toBe(true)
      expect(trie.has(11)).toBe(true)
    })

    it('reports non-inserted value as absent', () => {
      trie.insert(5)
      expect(trie.has(3)).toBe(false)
    })

    it('throws on negative value', () => {
      expect(() => trie.insert(-1)).toThrow(RangeError)
    })

    it('throws on value >= universeSize', () => {
      expect(() => trie.insert(256)).toThrow(RangeError)
    })

    it('has returns false for negative value', () => {
      expect(trie.has(-1)).toBe(false)
    })

    it('has returns false for value >= universeSize', () => {
      expect(trie.has(256)).toBe(false)
    })

    it('inserts values in reverse order', () => {
      for (let i = 255; i >= 0; i--) trie.insert(i)
      expect(trie.size()).toBe(256)
      expect(trie.min()).toBe(0)
      expect(trie.max()).toBe(255)
    })

    it('inserts values across multiple buckets', () => {
      const big = new YFastTrie({ universeSize: 1024 })
      big.insert(0)
      big.insert(100)
      big.insert(500)
      big.insert(1000)
      expect(big.size()).toBe(4)
      expect(big.toArray()).toEqual([0, 100, 500, 1000])
    })
  })

  describe('contains', () => {
    it('returns true for inserted value', () => {
      const trie = new YFastTrie({ universeSize: 256 })
      trie.insert(42)
      expect(trie.contains(42)).toBe(true)
    })

    it('returns false for non-inserted value', () => {
      const trie = new YFastTrie({ universeSize: 256 })
      trie.insert(42)
      expect(trie.contains(10)).toBe(false)
    })

    it('returns false for out of range', () => {
      const trie = new YFastTrie({ universeSize: 256 })
      expect(trie.contains(-1)).toBe(false)
      expect(trie.contains(256)).toBe(false)
    })
  })

  describe('delete', () => {
    let trie: YFastTrie

    beforeEach(() => {
      trie = new YFastTrie({ universeSize: 256 })
    })

    it('deletes a single value', () => {
      trie.insert(5)
      expect(trie.delete(5)).toBe(true)
      expect(trie.has(5)).toBe(false)
      expect(trie.size()).toBe(0)
      expect(trie.isEmpty()).toBe(true)
    })

    it('returns false when deleting from empty trie', () => {
      expect(trie.delete(5)).toBe(false)
    })

    it('returns false when deleting non-existent value', () => {
      trie.insert(5)
      expect(trie.delete(3)).toBe(false)
    })

    it('returns false for out-of-range value', () => {
      expect(trie.delete(-1)).toBe(false)
      expect(trie.delete(256)).toBe(false)
    })

    it('deletes min and updates min', () => {
      trie.insert(3)
      trie.insert(7)
      trie.insert(10)
      trie.delete(3)
      expect(trie.min()).toBe(7)
      expect(trie.size()).toBe(2)
    })

    it('deletes max and updates max', () => {
      trie.insert(3)
      trie.insert(7)
      trie.insert(10)
      trie.delete(10)
      expect(trie.max()).toBe(7)
      expect(trie.size()).toBe(2)
    })

    it('deletes all values leaving empty trie', () => {
      trie.insert(3)
      trie.insert(7)
      trie.delete(3)
      trie.delete(7)
      expect(trie.isEmpty()).toBe(true)
      expect(trie.min()).toBeUndefined()
      expect(trie.max()).toBeUndefined()
    })

    it('deletes middle value preserving others', () => {
      trie.insert(1)
      trie.insert(5)
      trie.insert(10)
      trie.delete(5)
      expect(trie.has(1)).toBe(true)
      expect(trie.has(5)).toBe(false)
      expect(trie.has(10)).toBe(true)
      expect(trie.min()).toBe(1)
      expect(trie.max()).toBe(10)
    })

    it('does not delete same element twice', () => {
      trie.insert(5)
      expect(trie.delete(5)).toBe(true)
      expect(trie.delete(5)).toBe(false)
    })

    it('re-inserts deleted value', () => {
      trie.insert(7)
      trie.delete(7)
      expect(trie.has(7)).toBe(false)
      trie.insert(7)
      expect(trie.has(7)).toBe(true)
      expect(trie.size()).toBe(1)
    })
  })

  describe('min and max', () => {
    it('returns undefined for empty trie', () => {
      const trie = new YFastTrie({ universeSize: 256 })
      expect(trie.min()).toBeUndefined()
      expect(trie.max()).toBeUndefined()
    })

    it('returns same value for single element', () => {
      const trie = new YFastTrie({ universeSize: 256 })
      trie.insert(7)
      expect(trie.min()).toBe(7)
      expect(trie.max()).toBe(7)
    })

    it('tracks min correctly across inserts', () => {
      const trie = new YFastTrie({ universeSize: 256 })
      trie.insert(10)
      trie.insert(3)
      trie.insert(15)
      expect(trie.min()).toBe(3)
    })

    it('tracks max correctly across inserts', () => {
      const trie = new YFastTrie({ universeSize: 256 })
      trie.insert(10)
      trie.insert(3)
      trie.insert(15)
      expect(trie.max()).toBe(15)
    })

    it('tracks min as 0', () => {
      const trie = new YFastTrie({ universeSize: 256 })
      trie.insert(0)
      trie.insert(5)
      expect(trie.min()).toBe(0)
    })

    it('tracks max as universeSize - 1', () => {
      const trie = new YFastTrie({ universeSize: 256 })
      trie.insert(5)
      trie.insert(255)
      expect(trie.max()).toBe(255)
    })

    it('updates min after deleting min', () => {
      const trie = new YFastTrie({ universeSize: 256 })
      trie.insert(5)
      trie.insert(10)
      trie.insert(15)
      trie.delete(5)
      expect(trie.min()).toBe(10)
    })

    it('updates max after deleting max', () => {
      const trie = new YFastTrie({ universeSize: 256 })
      trie.insert(5)
      trie.insert(10)
      trie.insert(15)
      trie.delete(15)
      expect(trie.max()).toBe(10)
    })

    it('returns undefined after deleting all', () => {
      const trie = new YFastTrie({ universeSize: 256 })
      trie.insert(1)
      trie.delete(1)
      expect(trie.min()).toBeUndefined()
      expect(trie.max()).toBeUndefined()
    })
  })

  describe('successor', () => {
    it('returns undefined for empty trie', () => {
      const trie = new YFastTrie({ universeSize: 256 })
      expect(trie.successor(5)).toBeUndefined()
    })

    it('returns the next larger value', () => {
      const trie = new YFastTrie({ universeSize: 256 })
      trie.insert(3)
      trie.insert(7)
      expect(trie.successor(3)).toBe(7)
    })

    it('returns undefined when no successor exists', () => {
      const trie = new YFastTrie({ universeSize: 256 })
      trie.insert(5)
      expect(trie.successor(5)).toBeUndefined()
    })

    it('returns successor of value not in trie', () => {
      const trie = new YFastTrie({ universeSize: 256 })
      trie.insert(3)
      trie.insert(7)
      expect(trie.successor(4)).toBe(7)
    })

    it('returns min when querying below min', () => {
      const trie = new YFastTrie({ universeSize: 256 })
      trie.insert(5)
      trie.insert(10)
      expect(trie.successor(0)).toBe(5)
    })

    it('returns undefined when successor would exceed all values', () => {
      const trie = new YFastTrie({ universeSize: 256 })
      trie.insert(5)
      trie.insert(10)
      expect(trie.successor(15)).toBeUndefined()
    })

    it('returns successor across bucket boundary', () => {
      const trie = new YFastTrie({ universeSize: 1024 })
      trie.insert(3)
      trie.insert(10)
      expect(trie.successor(3)).toBe(10)
    })

    it('returns next for value at gap', () => {
      const trie = new YFastTrie({ universeSize: 256 })
      trie.insert(10)
      trie.insert(20)
      trie.insert(30)
      expect(trie.successor(21)).toBe(30)
    })

    it('returns successor of 0 when 0 is inserted', () => {
      const trie = new YFastTrie({ universeSize: 256 })
      trie.insert(0)
      trie.insert(5)
      expect(trie.successor(0)).toBe(5)
    })

    it('successor of single element returns undefined', () => {
      const trie = new YFastTrie({ universeSize: 256 })
      trie.insert(42)
      expect(trie.successor(42)).toBeUndefined()
    })

    it('successor of value less than single element', () => {
      const trie = new YFastTrie({ universeSize: 256 })
      trie.insert(42)
      expect(trie.successor(0)).toBe(42)
    })
  })

  describe('predecessor', () => {
    it('returns undefined for empty trie', () => {
      const trie = new YFastTrie({ universeSize: 256 })
      expect(trie.predecessor(5)).toBeUndefined()
    })

    it('returns the next smaller value', () => {
      const trie = new YFastTrie({ universeSize: 256 })
      trie.insert(3)
      trie.insert(7)
      expect(trie.predecessor(7)).toBe(3)
    })

    it('returns undefined when no predecessor exists', () => {
      const trie = new YFastTrie({ universeSize: 256 })
      trie.insert(5)
      expect(trie.predecessor(5)).toBeUndefined()
    })

    it('returns predecessor of value not in trie', () => {
      const trie = new YFastTrie({ universeSize: 256 })
      trie.insert(3)
      trie.insert(7)
      expect(trie.predecessor(6)).toBe(3)
    })

    it('returns max when querying above max', () => {
      const trie = new YFastTrie({ universeSize: 256 })
      trie.insert(5)
      trie.insert(10)
      expect(trie.predecessor(12)).toBe(10)
    })

    it('returns undefined when predecessor would be below all values', () => {
      const trie = new YFastTrie({ universeSize: 256 })
      trie.insert(5)
      trie.insert(10)
      expect(trie.predecessor(3)).toBeUndefined()
    })

    it('returns predecessor across bucket boundary', () => {
      const trie = new YFastTrie({ universeSize: 1024 })
      trie.insert(3)
      trie.insert(10)
      expect(trie.predecessor(10)).toBe(3)
    })

    it('returns predecessor at gap', () => {
      const trie = new YFastTrie({ universeSize: 256 })
      trie.insert(10)
      trie.insert(20)
      trie.insert(30)
      expect(trie.predecessor(25)).toBe(20)
    })

    it('predecessor of single element returns undefined', () => {
      const trie = new YFastTrie({ universeSize: 256 })
      trie.insert(42)
      expect(trie.predecessor(42)).toBeUndefined()
    })

    it('predecessor of value greater than single element', () => {
      const trie = new YFastTrie({ universeSize: 256 })
      trie.insert(42)
      expect(trie.predecessor(100)).toBe(42)
    })
  })

  describe('size and isEmpty', () => {
    it('size is 0 for empty trie', () => {
      const trie = new YFastTrie({ universeSize: 256 })
      expect(trie.size()).toBe(0)
    })

    it('size increments on insert', () => {
      const trie = new YFastTrie({ universeSize: 256 })
      trie.insert(1)
      expect(trie.size()).toBe(1)
      trie.insert(2)
      expect(trie.size()).toBe(2)
    })

    it('size decrements on delete', () => {
      const trie = new YFastTrie({ universeSize: 256 })
      trie.insert(1)
      trie.insert(2)
      trie.delete(1)
      expect(trie.size()).toBe(1)
    })

    it('isEmpty returns true after all deletes', () => {
      const trie = new YFastTrie({ universeSize: 256 })
      trie.insert(5)
      trie.delete(5)
      expect(trie.isEmpty()).toBe(true)
    })

    it('isEmpty returns false after insert', () => {
      const trie = new YFastTrie({ universeSize: 256 })
      trie.insert(1)
      expect(trie.isEmpty()).toBe(false)
    })
  })

  describe('clear', () => {
    it('clears all elements', () => {
      const trie = new YFastTrie({ universeSize: 256 })
      trie.insert(3)
      trie.insert(7)
      trie.insert(10)
      trie.clear()
      expect(trie.size()).toBe(0)
      expect(trie.isEmpty()).toBe(true)
      expect(trie.min()).toBeUndefined()
      expect(trie.max()).toBeUndefined()
    })

    it('allows insert after clear', () => {
      const trie = new YFastTrie({ universeSize: 256 })
      trie.insert(5)
      trie.clear()
      trie.insert(3)
      expect(trie.has(3)).toBe(true)
      expect(trie.has(5)).toBe(false)
      expect(trie.size()).toBe(1)
    })

    it('clear on empty trie is no-op', () => {
      const trie = new YFastTrie({ universeSize: 256 })
      trie.clear()
      expect(trie.isEmpty()).toBe(true)
    })

    it('can reuse trie after clear', () => {
      const trie = new YFastTrie({ universeSize: 256 })
      trie.insert(1)
      trie.insert(2)
      trie.insert(3)
      trie.clear()
      trie.insert(100)
      trie.insert(200)
      expect(trie.size()).toBe(2)
      expect(trie.has(100)).toBe(true)
      expect(trie.has(1)).toBe(false)
      expect(trie.min()).toBe(100)
      expect(trie.max()).toBe(200)
    })
  })

  describe('toArray', () => {
    it('returns empty array for empty trie', () => {
      const trie = new YFastTrie({ universeSize: 256 })
      expect(trie.toArray()).toEqual([])
    })

    it('returns single element array', () => {
      const trie = new YFastTrie({ universeSize: 256 })
      trie.insert(5)
      expect(trie.toArray()).toEqual([5])
    })

    it('returns sorted elements', () => {
      const trie = new YFastTrie({ universeSize: 256 })
      trie.insert(10)
      trie.insert(3)
      trie.insert(7)
      expect(trie.toArray()).toEqual([3, 7, 10])
    })

    it('returns all elements for full small universe', () => {
      const trie = new YFastTrie({ universeSize: 8 })
      for (let i = 0; i < 8; i++) trie.insert(i)
      expect(trie.toArray()).toEqual([0, 1, 2, 3, 4, 5, 6, 7])
    })

    it('returns sorted after random insert order', () => {
      const trie = new YFastTrie({ universeSize: 256 })
      const order = [13, 2, 8, 15, 1, 6, 11, 4]
      for (const v of order) trie.insert(v)
      expect(trie.toArray()).toEqual([1, 2, 4, 6, 8, 11, 13, 15])
    })

    it('reflects mutations after delete', () => {
      const trie = new YFastTrie({ universeSize: 256 })
      trie.insert(10)
      trie.insert(20)
      trie.insert(30)
      trie.delete(20)
      expect(trie.toArray()).toEqual([10, 30])
    })
  })

  describe('forEach', () => {
    it('does not call callback on empty trie', () => {
      const trie = new YFastTrie({ universeSize: 256 })
      let called = false
      trie.forEach(() => { called = true })
      expect(called).toBe(false)
    })

    it('iterates all values in order', () => {
      const trie = new YFastTrie({ universeSize: 256 })
      trie.insert(10)
      trie.insert(3)
      trie.insert(7)
      const result: number[] = []
      trie.forEach((v) => result.push(v))
      expect(result).toEqual([3, 7, 10])
    })

    it('provides correct index', () => {
      const trie = new YFastTrie({ universeSize: 256 })
      trie.insert(10)
      trie.insert(3)
      trie.insert(7)
      const indices: number[] = []
      trie.forEach((_v, i) => indices.push(i))
      expect(indices).toEqual([0, 1, 2])
    })

    it('iterates elements across buckets', () => {
      const trie = new YFastTrie({ universeSize: 1024 })
      trie.insert(0)
      trie.insert(500)
      trie.insert(1000)
      const result: number[] = []
      trie.forEach((v) => result.push(v))
      expect(result).toEqual([0, 500, 1000])
    })
  })

  describe('keys and values', () => {
    it('keys returns sorted array', () => {
      const trie = new YFastTrie({ universeSize: 256 })
      trie.insert(10)
      trie.insert(3)
      trie.insert(7)
      expect(trie.keys()).toEqual([3, 7, 10])
    })

    it('values returns same as keys', () => {
      const trie = new YFastTrie({ universeSize: 256 })
      trie.insert(10)
      trie.insert(3)
      trie.insert(7)
      expect(trie.values()).toEqual(trie.keys())
    })

    it('keys returns empty for empty trie', () => {
      const trie = new YFastTrie({ universeSize: 256 })
      expect(trie.keys()).toEqual([])
    })
  })

  describe('range', () => {
    it('returns empty for empty trie', () => {
      const trie = new YFastTrie({ universeSize: 256 })
      expect(trie.range(0, 10)).toEqual([])
    })

    it('returns elements in range', () => {
      const trie = new YFastTrie({ universeSize: 256 })
      trie.insert(3)
      trie.insert(7)
      trie.insert(10)
      trie.insert(15)
      expect(trie.range(5, 12)).toEqual([7, 10])
    })

    it('returns single element', () => {
      const trie = new YFastTrie({ universeSize: 256 })
      trie.insert(5)
      trie.insert(10)
      expect(trie.range(5, 5)).toEqual([5])
    })

    it('returns empty when range has no elements', () => {
      const trie = new YFastTrie({ universeSize: 256 })
      trie.insert(1)
      trie.insert(10)
      expect(trie.range(3, 7)).toEqual([])
    })

    it('returns all elements when range covers all', () => {
      const trie = new YFastTrie({ universeSize: 256 })
      trie.insert(3)
      trie.insert(7)
      trie.insert(10)
      expect(trie.range(0, 255)).toEqual([3, 7, 10])
    })

    it('returns empty when lo > hi', () => {
      const trie = new YFastTrie({ universeSize: 256 })
      trie.insert(5)
      expect(trie.range(10, 3)).toEqual([])
    })

    it('handles range across buckets', () => {
      const trie = new YFastTrie({ universeSize: 1024 })
      trie.insert(0)
      trie.insert(100)
      trie.insert(500)
      trie.insert(1000)
      expect(trie.range(50, 600)).toEqual([100, 500])
    })

    it('returns elements from lo inclusive', () => {
      const trie = new YFastTrie({ universeSize: 256 })
      trie.insert(5)
      trie.insert(10)
      trie.insert(15)
      expect(trie.range(5, 15)).toEqual([5, 10, 15])
    })

    it('returns elements up to hi inclusive', () => {
      const trie = new YFastTrie({ universeSize: 256 })
      trie.insert(5)
      trie.insert(10)
      trie.insert(15)
      expect(trie.range(0, 10)).toEqual([5, 10])
    })

    it('returns all matching elements for wide range', () => {
      const trie = new YFastTrie({ universeSize: 64 })
      for (let i = 0; i < 64; i += 2) trie.insert(i)
      expect(trie.range(10, 20)).toEqual([10, 12, 14, 16, 18, 20])
    })
  })

  describe('rank', () => {
    it('returns 0 for empty trie', () => {
      const trie = new YFastTrie({ universeSize: 256 })
      expect(trie.rank(5)).toBe(0)
    })

    it('returns 0 for value before all elements', () => {
      const trie = new YFastTrie({ universeSize: 256 })
      trie.insert(5)
      trie.insert(10)
      trie.insert(15)
      expect(trie.rank(3)).toBe(0)
    })

    it('returns correct count for value between elements', () => {
      const trie = new YFastTrie({ universeSize: 256 })
      trie.insert(5)
      trie.insert(10)
      trie.insert(15)
      expect(trie.rank(12)).toBe(2)
    })

    it('returns correct count for value at element', () => {
      const trie = new YFastTrie({ universeSize: 256 })
      trie.insert(5)
      trie.insert(10)
      trie.insert(15)
      expect(trie.rank(10)).toBe(1)
    })

    it('returns size for value after all elements', () => {
      const trie = new YFastTrie({ universeSize: 256 })
      trie.insert(5)
      trie.insert(10)
      trie.insert(15)
      expect(trie.rank(100)).toBe(3)
    })

    it('returns 0 for value <= 0', () => {
      const trie = new YFastTrie({ universeSize: 256 })
      trie.insert(5)
      expect(trie.rank(0)).toBe(0)
      expect(trie.rank(-1)).toBe(0)
    })

    it('handles rank across buckets', () => {
      const trie = new YFastTrie({ universeSize: 1024 })
      trie.insert(0)
      trie.insert(100)
      trie.insert(500)
      trie.insert(1000)
      expect(trie.rank(500)).toBe(2)
      expect(trie.rank(1000)).toBe(3)
      expect(trie.rank(1001)).toBe(4)
    })

    it('handles rank for all inserted values', () => {
      const trie = new YFastTrie({ universeSize: 64 })
      for (let i = 0; i < 10; i++) trie.insert(i)
      for (let i = 0; i < 10; i++) {
        expect(trie.rank(i)).toBe(i)
      }
    })

    it('returns correct count for sequential values', () => {
      const trie = new YFastTrie({ universeSize: 256 })
      trie.insert(1)
      trie.insert(3)
      trie.insert(5)
      trie.insert(7)
      trie.insert(9)
      expect(trie.rank(6)).toBe(3)
    })
  })

  describe('select', () => {
    it('returns undefined for empty trie', () => {
      const trie = new YFastTrie({ universeSize: 256 })
      expect(trie.select(0)).toBeUndefined()
    })

    it('returns undefined for negative index', () => {
      const trie = new YFastTrie({ universeSize: 256 })
      trie.insert(5)
      expect(trie.select(-1)).toBeUndefined()
    })

    it('returns undefined for index >= size', () => {
      const trie = new YFastTrie({ universeSize: 256 })
      trie.insert(5)
      expect(trie.select(1)).toBeUndefined()
    })

    it('returns element at index 0', () => {
      const trie = new YFastTrie({ universeSize: 256 })
      trie.insert(3)
      trie.insert(7)
      trie.insert(10)
      expect(trie.select(0)).toBe(3)
    })

    it('returns element at last index', () => {
      const trie = new YFastTrie({ universeSize: 256 })
      trie.insert(3)
      trie.insert(7)
      trie.insert(10)
      expect(trie.select(2)).toBe(10)
    })

    it('returns element at middle index', () => {
      const trie = new YFastTrie({ universeSize: 256 })
      trie.insert(3)
      trie.insert(7)
      trie.insert(10)
      expect(trie.select(1)).toBe(7)
    })

    it('returns correct elements across buckets', () => {
      const trie = new YFastTrie({ universeSize: 1024 })
      trie.insert(0)
      trie.insert(100)
      trie.insert(500)
      trie.insert(1000)
      expect(trie.select(0)).toBe(0)
      expect(trie.select(1)).toBe(100)
      expect(trie.select(2)).toBe(500)
      expect(trie.select(3)).toBe(1000)
    })

    it('select is inverse of rank', () => {
      const trie = new YFastTrie({ universeSize: 256 })
      trie.insert(3)
      trie.insert(7)
      trie.insert(10)
      trie.insert(15)
      for (let i = 0; i < 4; i++) {
        const val = trie.select(i)
        expect(val).not.toBeUndefined()
        expect(trie.rank(val!)).toBe(i)
      }
    })

    it('handles select for sequential values', () => {
      const trie = new YFastTrie({ universeSize: 64 })
      for (let i = 0; i < 10; i++) trie.insert(i)
      for (let i = 0; i < 10; i++) {
        expect(trie.select(i)).toBe(i)
      }
    })
  })

  describe('Symbol.iterator', () => {
    it('returns empty iterator for empty trie', () => {
      const trie = new YFastTrie({ universeSize: 256 })
      expect([...trie]).toEqual([])
    })

    it('iterates single element', () => {
      const trie = new YFastTrie({ universeSize: 256 })
      trie.insert(42)
      expect([...trie]).toEqual([42])
    })

    it('iterates in sorted order', () => {
      const trie = new YFastTrie({ universeSize: 256 })
      trie.insert(10)
      trie.insert(3)
      trie.insert(7)
      expect([...trie]).toEqual([3, 7, 10])
    })

    it('works with destructuring', () => {
      const trie = new YFastTrie({ universeSize: 256 })
      trie.insert(1)
      trie.insert(2)
      trie.insert(3)
      const [a, b, c] = trie
      expect(a).toBe(1)
      expect(b).toBe(2)
      expect(c).toBe(3)
    })

    it('works with Array.from', () => {
      const trie = new YFastTrie({ universeSize: 256 })
      trie.insert(5)
      trie.insert(10)
      expect(Array.from(trie)).toEqual([5, 10])
    })
  })

  describe('clone', () => {
    it('clones an empty trie', () => {
      const trie = new YFastTrie({ universeSize: 256 })
      const cloned = trie.clone()
      expect(cloned.size()).toBe(0)
      expect(cloned.isEmpty()).toBe(true)
    })

    it('clones a trie with elements', () => {
      const trie = new YFastTrie({ universeSize: 256 })
      trie.insert(10)
      trie.insert(20)
      trie.insert(30)
      const cloned = trie.clone()
      expect(cloned.size()).toBe(3)
      expect(cloned.toArray()).toEqual([10, 20, 30])
    })

    it('clone is independent from original', () => {
      const trie = new YFastTrie({ universeSize: 256 })
      trie.insert(10)
      trie.insert(20)
      const cloned = trie.clone()
      cloned.delete(10)
      expect(trie.has(10)).toBe(true)
      expect(cloned.has(10)).toBe(false)
    })

    it('modifying original does not affect clone', () => {
      const trie = new YFastTrie({ universeSize: 256 })
      trie.insert(10)
      const cloned = trie.clone()
      trie.insert(20)
      expect(trie.size()).toBe(2)
      expect(cloned.size()).toBe(1)
    })

    it('clone preserves min and max', () => {
      const trie = new YFastTrie({ universeSize: 256 })
      trie.insert(5)
      trie.insert(100)
      trie.insert(50)
      const cloned = trie.clone()
      expect(cloned.min()).toBe(5)
      expect(cloned.max()).toBe(100)
    })
  })

  describe('static from', () => {
    it('creates trie from empty array', () => {
      const trie = YFastTrie.from([], 256)
      expect(trie.size()).toBe(0)
      expect(trie.isEmpty()).toBe(true)
    })

    it('creates trie from single element', () => {
      const trie = YFastTrie.from([42], 256)
      expect(trie.size()).toBe(1)
      expect(trie.has(42)).toBe(true)
    })

    it('creates trie from multiple elements', () => {
      const trie = YFastTrie.from([30, 10, 20], 256)
      expect(trie.size()).toBe(3)
      expect(trie.toArray()).toEqual([10, 20, 30])
    })

    it('deduplicates elements', () => {
      const trie = YFastTrie.from([5, 5, 5], 256)
      expect(trie.size()).toBe(1)
    })

    it('ignores out-of-range values', () => {
      const trie = YFastTrie.from([-1, 10, 300], 256)
      expect(trie.size()).toBe(1)
      expect(trie.has(10)).toBe(true)
    })
  })

  describe('stats', () => {
    it('returns zero stats for empty trie', () => {
      const trie = new YFastTrie({ universeSize: 256 })
      const s = trie.stats()
      expect(s.size).toBe(0)
      expect(s.bucketCount).toBe(0)
      expect(s.minBucketSize).toBe(0)
      expect(s.maxBucketSize).toBe(0)
    })

    it('returns stats for single element', () => {
      const trie = new YFastTrie({ universeSize: 256 })
      trie.insert(10)
      const s = trie.stats()
      expect(s.size).toBe(1)
      expect(s.bucketCount).toBe(1)
      expect(s.minBucketSize).toBe(1)
      expect(s.maxBucketSize).toBe(1)
    })

    it('updates stats after deletion', () => {
      const trie = new YFastTrie({ universeSize: 256 })
      trie.insert(10)
      trie.insert(20)
      trie.delete(10)
      const s = trie.stats()
      expect(s.size).toBe(1)
      expect(s.bucketCount).toBe(1)
    })
  })

  describe('successor and predecessor consistency', () => {
    it('successor then predecessor returns original', () => {
      const trie = new YFastTrie({ universeSize: 256 })
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
      const trie = new YFastTrie({ universeSize: 256 })
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
      const trie = new YFastTrie({ universeSize: 256 })
      const values = [5, 15, 25, 35, 45]
      for (const v of values) trie.insert(v)
      let current = trie.min()
      const traversed: number[] = []
      while (current !== undefined) {
        traversed.push(current)
        current = trie.successor(current)
      }
      expect(traversed).toEqual(values)
    })

    it('predecessor chain from max to min', () => {
      const trie = new YFastTrie({ universeSize: 256 })
      const values = [5, 15, 25, 35, 45]
      for (const v of values) trie.insert(v)
      let current = trie.max()
      const traversed: number[] = []
      while (current !== undefined) {
        traversed.push(current)
        current = trie.predecessor(current)
      }
      expect(traversed).toEqual([45, 35, 25, 15, 5])
    })
  })

  describe('interleaved operations', () => {
    it('insert, delete, insert again', () => {
      const trie = new YFastTrie({ universeSize: 256 })
      trie.insert(5)
      trie.insert(10)
      trie.delete(5)
      trie.insert(5)
      expect(trie.has(5)).toBe(true)
      expect(trie.size()).toBe(2)
    })

    it('insert-delete cycles', () => {
      const trie = new YFastTrie({ universeSize: 256 })
      for (let i = 0; i < 10; i++) trie.insert(i)
      for (let i = 0; i < 10; i += 2) trie.delete(i)
      expect(trie.toArray()).toEqual([1, 3, 5, 7, 9])
      for (let i = 0; i < 10; i += 2) trie.insert(i)
      expect(trie.toArray()).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
    })

    it('delete every other element and verify traversal', () => {
      const trie = new YFastTrie({ universeSize: 32 })
      for (let i = 0; i < 32; i++) trie.insert(i)
      for (let i = 0; i < 32; i += 2) trie.delete(i)
      const arr = trie.toArray()
      expect(arr.length).toBe(16)
      for (const v of arr) {
        expect(v % 2).toBe(1)
      }
    })

    it('successor and predecessor with gap values', () => {
      const trie = new YFastTrie({ universeSize: 64 })
      trie.insert(0)
      trie.insert(31)
      trie.insert(63)
      expect(trie.successor(0)).toBe(31)
      expect(trie.successor(31)).toBe(63)
      expect(trie.predecessor(63)).toBe(31)
      expect(trie.predecessor(31)).toBe(0)
      expect(trie.successor(15)).toBe(31)
      expect(trie.predecessor(45)).toBe(31)
    })
  })

  describe('stress tests', () => {
    it('inserts and finds all values 0..255', () => {
      const trie = new YFastTrie({ universeSize: 256 })
      for (let i = 0; i < 256; i++) trie.insert(i)
      expect(trie.size()).toBe(256)
      for (let i = 0; i < 256; i++) expect(trie.has(i)).toBe(true)
    })

    it('successor chain covers all values', () => {
      const trie = new YFastTrie({ universeSize: 256 })
      for (let i = 0; i < 256; i += 2) trie.insert(i)
      let cur = trie.min()
      const values: number[] = []
      while (cur !== undefined) {
        values.push(cur)
        cur = trie.successor(cur)
      }
      expect(values.length).toBe(128)
      for (let i = 0; i < values.length - 1; i++) {
        expect(values[i + 1]!).toBeGreaterThan(values[i]!)
      }
    })

    it('predecessor chain covers all values in reverse', () => {
      const trie = new YFastTrie({ universeSize: 256 })
      for (let i = 0; i < 256; i += 3) trie.insert(i)
      let cur = trie.max()
      const values: number[] = []
      while (cur !== undefined) {
        values.push(cur)
        cur = trie.predecessor(cur)
      }
      for (let i = 0; i < values.length - 1; i++) {
        expect(values[i + 1]!).toBeLessThan(values[i]!)
      }
    })

    it('delete all even values from full universe', () => {
      const trie = new YFastTrie({ universeSize: 64 })
      for (let i = 0; i < 64; i++) trie.insert(i)
      for (let i = 0; i < 64; i += 2) trie.delete(i)
      expect(trie.size()).toBe(32)
      for (let i = 0; i < 64; i++) {
        expect(trie.has(i)).toBe(i % 2 === 1)
      }
    })

    it('insert random values and verify toArray is sorted', () => {
      const trie = new YFastTrie({ universeSize: 256 })
      const rng = (seed: number) => {
        let s = seed
        return () => {
          s = (s * 1664525 + 1013904223) & 0xffffffff
          return (s >>> 0) % 256
        }
      }
      const rand = rng(42)
      const inserted = new Set<number>()
      for (let i = 0; i < 100; i++) {
        const v = rand()
        if (!inserted.has(v)) {
          trie.insert(v)
          inserted.add(v)
        }
      }
      const arr = trie.toArray()
      expect(arr.length).toBe(inserted.size)
      for (let i = 0; i < arr.length - 1; i++) {
        expect(arr[i + 1]!).toBeGreaterThan(arr[i]!)
      }
    })

    it('insert 500 sequential values', () => {
      const trie = new YFastTrie({ universeSize: 1024 })
      for (let i = 0; i < 500; i++) trie.insert(i)
      expect(trie.size()).toBe(500)
      expect(trie.min()).toBe(0)
      expect(trie.max()).toBe(499)
      for (let i = 0; i < 500; i++) {
        expect(trie.has(i)).toBe(true)
      }
    })

    it('insert 200 values in reverse order', () => {
      const trie = new YFastTrie({ universeSize: 1024 })
      for (let i = 199; i >= 0; i--) trie.insert(i)
      expect(trie.size()).toBe(200)
      expect(trie.min()).toBe(0)
      expect(trie.max()).toBe(199)
    })
  })

  describe('min/max maintenance during deletions', () => {
    it('tracks min through sequential deletion', () => {
      const trie = new YFastTrie({ universeSize: 256 })
      for (let i = 0; i < 10; i++) trie.insert(i)
      for (let i = 0; i < 10; i++) {
        expect(trie.min()).toBe(i)
        trie.delete(i)
      }
      expect(trie.min()).toBeUndefined()
    })

    it('tracks max through reverse deletion', () => {
      const trie = new YFastTrie({ universeSize: 256 })
      for (let i = 0; i < 10; i++) trie.insert(i)
      for (let i = 9; i >= 0; i--) {
        expect(trie.max()).toBe(i)
        trie.delete(i)
      }
      expect(trie.max()).toBeUndefined()
    })

    it('tracks min when deleting non-min elements', () => {
      const trie = new YFastTrie({ universeSize: 256 })
      trie.insert(5)
      trie.insert(10)
      trie.insert(15)
      trie.delete(10)
      expect(trie.min()).toBe(5)
      trie.delete(15)
      expect(trie.min()).toBe(5)
    })

    it('tracks max when deleting non-max elements', () => {
      const trie = new YFastTrie({ universeSize: 256 })
      trie.insert(5)
      trie.insert(10)
      trie.insert(15)
      trie.delete(5)
      expect(trie.max()).toBe(15)
      trie.delete(10)
      expect(trie.max()).toBe(15)
    })
  })

  describe('universe size 2 edge cases', () => {
    it('inserts and deletes all values', () => {
      const trie = new YFastTrie({ universeSize: 2 })
      trie.insert(0)
      trie.insert(1)
      expect(trie.size()).toBe(2)
      expect(trie.min()).toBe(0)
      expect(trie.max()).toBe(1)
      expect(trie.successor(0)).toBe(1)
      expect(trie.predecessor(1)).toBe(0)
    })

    it('handles delete in universe size 2', () => {
      const trie = new YFastTrie({ universeSize: 2 })
      trie.insert(0)
      trie.insert(1)
      trie.delete(0)
      expect(trie.has(0)).toBe(false)
      expect(trie.has(1)).toBe(true)
      expect(trie.min()).toBe(1)
      expect(trie.max()).toBe(1)
    })
  })

  describe('universe size 4 edge cases', () => {
    it('inserts and deletes all values', () => {
      const trie = new YFastTrie({ universeSize: 4 })
      trie.insert(0)
      trie.insert(1)
      trie.insert(2)
      trie.insert(3)
      expect(trie.size()).toBe(4)
      trie.delete(2)
      expect(trie.size()).toBe(3)
      expect(trie.has(2)).toBe(false)
      expect(trie.toArray()).toEqual([0, 1, 3])
    })

    it('successor and predecessor work at boundaries', () => {
      const trie = new YFastTrie({ universeSize: 4 })
      trie.insert(1)
      trie.insert(2)
      expect(trie.successor(0)).toBe(1)
      expect(trie.successor(1)).toBe(2)
      expect(trie.successor(2)).toBeUndefined()
      expect(trie.predecessor(3)).toBe(2)
      expect(trie.predecessor(2)).toBe(1)
      expect(trie.predecessor(1)).toBeUndefined()
    })
  })

  describe('rank and select consistency', () => {
    it('rank of select(i) equals i', () => {
      const trie = new YFastTrie({ universeSize: 256 })
      const values = [5, 15, 25, 35, 45, 55, 65, 75, 85, 95]
      for (const v of values) trie.insert(v)
      for (let i = 0; i < values.length; i++) {
        const val = trie.select(i)
        expect(val).not.toBeUndefined()
        expect(trie.rank(val!)).toBe(i)
      }
    })

    it('select of rank(v) equals v for present values', () => {
      const trie = new YFastTrie({ universeSize: 256 })
      const values = [5, 15, 25, 35, 45]
      for (const v of values) trie.insert(v)
      for (const v of values) {
        const r = trie.rank(v)
        expect(trie.select(r)).toBe(v)
      }
    })
  })
})
