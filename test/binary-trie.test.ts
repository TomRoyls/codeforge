import { BinaryTrie } from '../src/core/binary-trie/binary-trie.js'
import { DEFAULT_BINARY_TRIE_OPTIONS } from '../src/core/binary-trie/types.js'
import type { BinaryTrieStats } from '../src/core/binary-trie/types.js'

describe('BinaryTrie', () => {
  describe('constructor', () => {
    it('should create trie with default 32-bit depth', () => {
      const trie = new BinaryTrie()
      expect(trie.size).toBe(0)
      expect(trie.isEmpty).toBe(true)
    })

    it('should accept custom bitDepth option', () => {
      const trie = new BinaryTrie({ bitDepth: 8 })
      trie.insert(42)
      expect(trie.has(42)).toBe(true)
    })

    it('should accept undefined options', () => {
      const trie = new BinaryTrie(undefined)
      expect(trie.size).toBe(0)
    })

    it('should use DEFAULT_BINARY_TRIE_OPTIONS with bitDepth 32', () => {
      expect(DEFAULT_BINARY_TRIE_OPTIONS.bitDepth).toBe(32)
    })

    it('should work with bitDepth of 1', () => {
      const trie = new BinaryTrie<string>({ bitDepth: 1 })
      trie.insert(0, 'zero')
      trie.insert(1, 'one')
      expect(trie.size).toBe(2)
      expect(trie.keys()).toEqual([0, 1])
    })
  })

  describe('insert and has', () => {
    it('should insert and detect a single key', () => {
      const trie = new BinaryTrie<string>({ bitDepth: 8 })
      trie.insert(5, 'five')
      expect(trie.has(5)).toBe(true)
      expect(trie.has(4)).toBe(false)
    })

    it('should insert key with no value and still find it', () => {
      const trie = new BinaryTrie({ bitDepth: 4 })
      trie.insert(7)
      expect(trie.has(7)).toBe(true)
      expect(trie.get(7)).toBeUndefined()
    })

    it('should not double-count on duplicate insert', () => {
      const trie = new BinaryTrie<string>({ bitDepth: 4 })
      trie.insert(3, 'a')
      trie.insert(3, 'b')
      expect(trie.size).toBe(1)
      expect(trie.get(3)).toBe('b')
    })

    it('should insert zero correctly', () => {
      const trie = new BinaryTrie<string>({ bitDepth: 4 })
      trie.insert(0, 'zero')
      expect(trie.has(0)).toBe(true)
      expect(trie.get(0)).toBe('zero')
    })

    it('should insert max value for bitDepth', () => {
      const trie = new BinaryTrie<string>({ bitDepth: 4 })
      trie.insert(15, 'max')
      expect(trie.has(15)).toBe(true)
    })

    it('should handle many sequential insertions', () => {
      const trie = new BinaryTrie<number>({ bitDepth: 8 })
      for (let i = 0; i < 256; i++) {
        trie.insert(i, i)
      }
      expect(trie.size).toBe(256)
      for (let i = 0; i < 256; i++) {
        expect(trie.has(i)).toBe(true)
      }
    })

    it('should handle negative numbers via unsigned representation', () => {
      const trie = new BinaryTrie<string>({ bitDepth: 8 })
      trie.insert(-1, 'neg1')
      trie.insert(-128, 'neg128')
      expect(trie.has(-1)).toBe(true)
      expect(trie.has(-128)).toBe(true)
    })

    it('should store object values', () => {
      const trie = new BinaryTrie<{ id: number }>({ bitDepth: 4 })
      trie.insert(5, { id: 42 })
      expect(trie.get(5)?.id).toBe(42)
    })
  })

  describe('delete', () => {
    it('should remove an existing key and return true', () => {
      const trie = new BinaryTrie<string>({ bitDepth: 4 })
      trie.insert(5, 'val')
      expect(trie.delete(5)).toBe(true)
      expect(trie.has(5)).toBe(false)
    })

    it('should return false for non-existent key', () => {
      const trie = new BinaryTrie<string>({ bitDepth: 4 })
      expect(trie.delete(99)).toBe(false)
    })

    it('should decrement size on deletion', () => {
      const trie = new BinaryTrie<string>({ bitDepth: 4 })
      trie.insert(1, 'a')
      trie.insert(2, 'b')
      trie.delete(1)
      expect(trie.size).toBe(1)
    })

    it('should not double-decrement on deleting same key twice', () => {
      const trie = new BinaryTrie<string>({ bitDepth: 4 })
      trie.insert(5, 'val')
      trie.delete(5)
      expect(trie.delete(5)).toBe(false)
      expect(trie.size).toBe(0)
    })

    it('should allow re-insertion after deletion', () => {
      const trie = new BinaryTrie<string>({ bitDepth: 4 })
      trie.insert(3, 'first')
      trie.delete(3)
      trie.insert(3, 'second')
      expect(trie.get(3)).toBe('second')
    })

    it('should prune unused internal nodes', () => {
      const trie = new BinaryTrie<string>({ bitDepth: 4 })
      trie.insert(8, 'solo')
      const before = trie.stats().nodeCount
      trie.delete(8)
      expect(trie.stats().nodeCount).toBeLessThan(before)
    })

    it('should handle deleting all keys leaving empty trie', () => {
      const trie = new BinaryTrie<string>({ bitDepth: 4 })
      trie.insert(0, 'a')
      trie.insert(15, 'b')
      trie.delete(0)
      trie.delete(15)
      expect(trie.isEmpty).toBe(true)
      expect(trie.min()).toBeUndefined()
      expect(trie.max()).toBeUndefined()
    })

    it('should not affect sibling keys when deleting', () => {
      const trie = new BinaryTrie<string>({ bitDepth: 4 })
      trie.insert(0, 'a')
      trie.insert(1, 'b')
      trie.delete(0)
      expect(trie.get(1)).toBe('b')
    })
  })

  describe('get', () => {
    it('should return value for existing key', () => {
      const trie = new BinaryTrie<number>({ bitDepth: 4 })
      trie.insert(5, 42)
      expect(trie.get(5)).toBe(42)
    })

    it('should return undefined for missing key', () => {
      const trie = new BinaryTrie<string>({ bitDepth: 4 })
      expect(trie.get(7)).toBeUndefined()
    })

    it('should return undefined for key inserted without value', () => {
      const trie = new BinaryTrie<string>({ bitDepth: 4 })
      trie.insert(3)
      expect(trie.get(3)).toBeUndefined()
    })

    it('should return updated value after overwrite', () => {
      const trie = new BinaryTrie<string>({ bitDepth: 4 })
      trie.insert(5, 'old')
      trie.insert(5, 'new')
      expect(trie.get(5)).toBe('new')
    })

    it('should return undefined after key is deleted', () => {
      const trie = new BinaryTrie<string>({ bitDepth: 4 })
      trie.insert(5, 'val')
      trie.delete(5)
      expect(trie.get(5)).toBeUndefined()
    })

    it('should handle null as stored value', () => {
      const trie = new BinaryTrie<string | null>({ bitDepth: 4 })
      trie.insert(3, null)
      expect(trie.get(3)).toBeNull()
    })
  })

  describe('min and max', () => {
    it('should return undefined for empty trie', () => {
      const trie = new BinaryTrie<string>({ bitDepth: 4 })
      expect(trie.min()).toBeUndefined()
      expect(trie.max()).toBeUndefined()
    })

    it('should return the same key for single-element trie', () => {
      const trie = new BinaryTrie<string>({ bitDepth: 4 })
      trie.insert(7, 'val')
      expect(trie.min()).toBe(7)
      expect(trie.max()).toBe(7)
    })

    it('should find min and max across multiple keys', () => {
      const trie = new BinaryTrie<string>({ bitDepth: 8 })
      trie.insert(10, 'a')
      trie.insert(200, 'b')
      trie.insert(50, 'c')
      trie.insert(5, 'd')
      expect(trie.min()).toBe(5)
      expect(trie.max()).toBe(200)
    })

    it('should update min/max after deletions', () => {
      const trie = new BinaryTrie<string>({ bitDepth: 4 })
      trie.insert(0, 'a')
      trie.insert(5, 'b')
      trie.insert(15, 'c')
      trie.delete(0)
      expect(trie.min()).toBe(5)
      trie.delete(15)
      expect(trie.max()).toBe(5)
    })

    it('should treat negative numbers as unsigned (negatives > positives)', () => {
      const trie = new BinaryTrie<string>({ bitDepth: 8 })
      trie.insert(0, 'zero')
      trie.insert(127, 'max_pos')
      trie.insert(-1, 'neg1')
      trie.insert(-128, 'neg128')
      // In unsigned 8-bit: 0 < 127 < 128(-128) < 255(-1)
      expect(trie.min()).toBe(0)
      expect(trie.max()).toBe(-1)
    })
  })

  describe('successor', () => {
    it('should find next larger key for existing key', () => {
      const trie = new BinaryTrie<string>({ bitDepth: 4 })
      trie.insert(3, 'a')
      trie.insert(7, 'b')
      trie.insert(12, 'c')
      expect(trie.successor(3)).toBe(7)
      expect(trie.successor(7)).toBe(12)
    })

    it('should return undefined when no larger key exists', () => {
      const trie = new BinaryTrie<string>({ bitDepth: 4 })
      trie.insert(15, 'max')
      expect(trie.successor(15)).toBeUndefined()
    })

    it('should find successor for non-existent key', () => {
      const trie = new BinaryTrie<string>({ bitDepth: 4 })
      trie.insert(3, 'a')
      trie.insert(10, 'b')
      expect(trie.successor(5)).toBe(10)
    })

    it('should return undefined on empty trie', () => {
      const trie = new BinaryTrie<string>({ bitDepth: 4 })
      expect(trie.successor(0)).toBeUndefined()
    })

    it('should chain successors through all keys', () => {
      const trie = new BinaryTrie<string>({ bitDepth: 4 })
      for (let i = 0; i < 16; i++) {
        trie.insert(i)
      }
      let key = trie.min()
      const order: number[] = [key!]
      while (order.length < 16) {
        key = trie.successor(key!)
        order.push(key!)
      }
      expect(order).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15])
    })
  })

  describe('predecessor', () => {
    it('should find next smaller key for existing key', () => {
      const trie = new BinaryTrie<string>({ bitDepth: 4 })
      trie.insert(3, 'a')
      trie.insert(7, 'b')
      trie.insert(12, 'c')
      expect(trie.predecessor(7)).toBe(3)
      expect(trie.predecessor(12)).toBe(7)
    })

    it('should return undefined when no smaller key exists', () => {
      const trie = new BinaryTrie<string>({ bitDepth: 4 })
      trie.insert(0, 'min')
      expect(trie.predecessor(0)).toBeUndefined()
    })

    it('should find predecessor for non-existent key', () => {
      const trie = new BinaryTrie<string>({ bitDepth: 4 })
      trie.insert(3, 'a')
      trie.insert(10, 'b')
      expect(trie.predecessor(8)).toBe(3)
    })

    it('should return undefined on empty trie', () => {
      const trie = new BinaryTrie<string>({ bitDepth: 4 })
      expect(trie.predecessor(0)).toBeUndefined()
    })

    it('should chain predecessors in reverse through all keys', () => {
      const trie = new BinaryTrie<string>({ bitDepth: 4 })
      for (let i = 0; i < 16; i++) {
        trie.insert(i)
      }
      let key = trie.max()
      const order: number[] = [key!]
      while (order.length < 16) {
        key = trie.predecessor(key!)
        order.push(key!)
      }
      expect(order).toEqual([15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0])
    })
  })

  describe('clear', () => {
    it('should remove all entries', () => {
      const trie = new BinaryTrie<string>({ bitDepth: 4 })
      for (let i = 0; i < 8; i++) trie.insert(i, `v${i}`)
      trie.clear()
      expect(trie.size).toBe(0)
      expect(trie.isEmpty).toBe(true)
    })

    it('should allow reuse after clear', () => {
      const trie = new BinaryTrie<string>({ bitDepth: 4 })
      trie.insert(5, 'old')
      trie.clear()
      trie.insert(3, 'new')
      expect(trie.get(3)).toBe('new')
      expect(trie.get(5)).toBeUndefined()
      expect(trie.size).toBe(1)
    })

    it('should reset stats to empty', () => {
      const trie = new BinaryTrie<string>({ bitDepth: 4 })
      trie.insert(5, 'a')
      trie.clear()
      const s = trie.stats()
      expect(s.size).toBe(0)
      expect(s.nodeCount).toBe(1)
      expect(s.height).toBe(0)
    })
  })

  describe('forEach', () => {
    it('should iterate in ascending key order', () => {
      const trie = new BinaryTrie<string>({ bitDepth: 4 })
      trie.insert(10, 'c')
      trie.insert(2, 'a')
      trie.insert(5, 'b')
      const collected: string[] = []
      trie.forEach((v) => collected.push(v!))
      expect(collected).toEqual(['a', 'b', 'c'])
    })

    it('should pass correct arguments to callback', () => {
      const trie = new BinaryTrie<string>({ bitDepth: 4 })
      trie.insert(7, 'val')
      let receivedKey: number | undefined
      let receivedTrie: BinaryTrie<string> | undefined
      trie.forEach((_v, k, t) => {
        receivedKey = k
        receivedTrie = t
      })
      expect(receivedKey).toBe(7)
      expect(receivedTrie).toBe(trie)
    })

    it('should not call callback for empty trie', () => {
      const trie = new BinaryTrie<string>({ bitDepth: 4 })
      let count = 0
      trie.forEach(() => count++)
      expect(count).toBe(0)
    })
  })

  describe('keys, values, entries', () => {
    it('keys() should return sorted key array', () => {
      const trie = new BinaryTrie<string>({ bitDepth: 4 })
      trie.insert(5, 'e')
      trie.insert(2, 'b')
      trie.insert(9, 'i')
      expect(trie.keys()).toEqual([2, 5, 9])
    })

    it('values() should return values in key order', () => {
      const trie = new BinaryTrie<string>({ bitDepth: 4 })
      trie.insert(5, 'e')
      trie.insert(2, 'b')
      trie.insert(9, 'i')
      expect(trie.values()).toEqual(['b', 'e', 'i'])
    })

    it('entries() should return [key, value] pairs in order', () => {
      const trie = new BinaryTrie<string>({ bitDepth: 4 })
      trie.insert(5, 'e')
      trie.insert(2, 'b')
      expect(trie.entries()).toEqual([[2, 'b'], [5, 'e']])
    })

    it('should return empty arrays for empty trie', () => {
      const trie = new BinaryTrie<string>({ bitDepth: 4 })
      expect(trie.keys()).toEqual([])
      expect(trie.values()).toEqual([])
      expect(trie.entries()).toEqual([])
    })

    it('should reflect deletions in keys/values/entries', () => {
      const trie = new BinaryTrie<string>({ bitDepth: 4 })
      trie.insert(1, 'a')
      trie.insert(2, 'b')
      trie.insert(3, 'c')
      trie.delete(2)
      expect(trie.keys()).toEqual([1, 3])
      expect(trie.values()).toEqual(['a', 'c'])
      expect(trie.entries()).toEqual([[1, 'a'], [3, 'c']])
    })

    it('should include undefined in values for keys without value', () => {
      const trie = new BinaryTrie<string>({ bitDepth: 4 })
      trie.insert(3, 'val')
      trie.insert(7)
      expect(trie.values()).toEqual(['val', undefined])
    })
  })

  describe('Symbol.iterator', () => {
    it('should be usable with spread operator', () => {
      const trie = new BinaryTrie<string>({ bitDepth: 4 })
      trie.insert(1, 'a')
      trie.insert(3, 'b')
      expect([...trie]).toEqual([[1, 'a'], [3, 'b']])
    })

    it('should work with for-of loop', () => {
      const trie = new BinaryTrie<number>({ bitDepth: 4 })
      trie.insert(2, 20)
      trie.insert(4, 40)
      const result: number[] = []
      for (const [key, value] of trie) {
        result.push(key + value!)
      }
      expect(result).toEqual([22, 44])
    })

    it('should produce empty iterator for empty trie', () => {
      const trie = new BinaryTrie<string>({ bitDepth: 4 })
      expect([...trie]).toEqual([])
    })
  })

  describe('stats', () => {
    it('should report stats for empty trie', () => {
      const trie = new BinaryTrie<string>({ bitDepth: 4 })
      const s: BinaryTrieStats = trie.stats()
      expect(s.size).toBe(0)
      expect(s.nodeCount).toBe(1) // root only
      expect(s.height).toBe(0)
    })

    it('should report correct stats after insertions', () => {
      const trie = new BinaryTrie<string>({ bitDepth: 4 })
      trie.insert(0, 'a')
      trie.insert(15, 'b')
      const s = trie.stats()
      expect(s.size).toBe(2)
      expect(s.height).toBe(4)
      expect(s.nodeCount).toBeGreaterThan(2)
    })

    it('should reflect shared prefixes in node count', () => {
      const trie = new BinaryTrie<string>({ bitDepth: 4 })
      // 0 = 0000, 1 = 0001 share first 3 bits
      trie.insert(0, 'a')
      trie.insert(1, 'b')
      const s = trie.stats()
      expect(s.size).toBe(2)
      // Should share some nodes, so less than 2 * 5 = 10
      expect(s.nodeCount).toBe(6)
    })

    it('should decrease node count after deletion prunes', () => {
      const trie = new BinaryTrie<string>({ bitDepth: 4 })
      trie.insert(8, 'only')
      const before = trie.stats().nodeCount
      trie.delete(8)
      expect(trie.stats().nodeCount).toBeLessThan(before)
    })
  })

  describe('negative numbers and 32-bit keys', () => {
    it('should store and retrieve INT32_MIN', () => {
      const trie = new BinaryTrie<string>()
      trie.insert(-2147483648, 'min')
      expect(trie.get(-2147483648)).toBe('min')
    })

    it('should store and retrieve INT32_MAX', () => {
      const trie = new BinaryTrie<string>()
      trie.insert(2147483647, 'max')
      expect(trie.get(2147483647)).toBe('max')
    })

    it('should order mixed positive and negative by unsigned value', () => {
      const trie = new BinaryTrie<string>()
      trie.insert(-2147483648, 'int_min')
      trie.insert(0, 'zero')
      trie.insert(2147483647, 'int_max')
      // Unsigned: 0 < 2147483647 < 2147483648(-2147483648)
      expect(trie.min()).toBe(0)
      expect(trie.max()).toBe(-2147483648)
      expect(trie.successor(0)).toBe(2147483647)
      expect(trie.successor(2147483647)).toBe(-2147483648)
    })

    it('should iterate negative keys in unsigned order', () => {
      const trie = new BinaryTrie<string>({ bitDepth: 8 })
      trie.insert(-1, 'neg1')
      trie.insert(0, 'zero')
      trie.insert(1, 'pos1')
      trie.insert(-128, 'neg128')
      // Unsigned 8-bit order: 0(0) < 1(1) < 128(-128) < 255(-1)
      expect(trie.keys()).toEqual([0, 1, -128, -1])
    })

    it('should handle deletion of negative keys', () => {
      const trie = new BinaryTrie<string>({ bitDepth: 8 })
      trie.insert(-1, 'neg')
      expect(trie.delete(-1)).toBe(true)
      expect(trie.has(-1)).toBe(false)
    })
  })

  describe('stress and combined operations', () => {
    it('should survive many inserts and deletes', () => {
      const trie = new BinaryTrie<number>({ bitDepth: 10 })
      for (let i = 0; i < 500; i++) {
        trie.insert(i, i)
      }
      expect(trie.size).toBe(500)
      for (let i = 0; i < 250; i++) {
        trie.delete(i)
      }
      expect(trie.size).toBe(250)
      expect(trie.min()).toBe(250)
      expect(trie.max()).toBe(499)
    })

    it('should maintain consistency across mixed operations', () => {
      const trie = new BinaryTrie<string>({ bitDepth: 4 })
      trie.insert(2, 'a')
      trie.insert(6, 'b')
      trie.insert(10, 'c')
      trie.delete(6)
      trie.insert(6, 'new_b')
      expect(trie.size).toBe(3)
      expect(trie.successor(2)).toBe(6)
      expect(trie.successor(6)).toBe(10)
      expect(trie.predecessor(10)).toBe(6)
    })

    it('should handle full range insert and delete cycle', () => {
      const trie = new BinaryTrie<string>({ bitDepth: 4 })
      for (let i = 0; i < 16; i++) trie.insert(i, `v${i}`)
      expect(trie.size).toBe(16)
      for (let i = 0; i < 16; i++) trie.delete(i)
      expect(trie.isEmpty).toBe(true)
      expect(trie.keys()).toEqual([])
    })
  })
})
