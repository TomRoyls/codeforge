import { describe, it, expect, beforeEach } from 'vitest'
import { BinaryTrie } from '../../src/core/binary-trie/binary-trie.js'
import { DEFAULT_BINARY_TRIE_OPTIONS } from '../../src/core/binary-trie/types.js'
import type { BinaryTrieOptions, BinaryTrieStats } from '../../src/core/binary-trie/types.js'

describe('BinaryTrie', () => {
  describe('constructor', () => {
    it('should create a trie with default options', () => {
      const trie = new BinaryTrie<string>()
      expect(trie.size).toBe(0)
    })

    it('should accept custom bitDepth', () => {
      const trie = new BinaryTrie<string>({ bitDepth: 8 })
      expect(trie.size).toBe(0)
    })

    it('should use DEFAULT_BINARY_TRIE_OPTIONS defaults', () => {
      expect(DEFAULT_BINARY_TRIE_OPTIONS.bitDepth).toBe(32)
    })

    it('should accept partial options', () => {
      const trie = new BinaryTrie<string>({ bitDepth: 4 })
      trie.insert(5, 'test')
      expect(trie.get(5)).toBe('test')
    })

    it('should return isEmpty true for new trie', () => {
      const trie = new BinaryTrie<string>()
      expect(trie.isEmpty).toBe(true)
    })

    it('should create an empty trie with no keys', () => {
      const trie = new BinaryTrie<string>()
      expect(trie.keys()).toEqual([])
    })

    it('should accept undefined options', () => {
      const trie = new BinaryTrie<string>(undefined)
      expect(trie.size).toBe(0)
    })

    it('should have size 0 for new trie', () => {
      const trie = new BinaryTrie<number>()
      expect(trie.size).toBe(0)
    })
  })

  describe('insert', () => {
    let trie: BinaryTrie<string>

    beforeEach(() => {
      trie = new BinaryTrie<string>({ bitDepth: 4 })
    })

    it('should insert a key with a value', () => {
      trie.insert(0, 'zero')
      expect(trie.size).toBe(1)
    })

    it('should insert a key without a value', () => {
      trie.insert(5)
      expect(trie.has(5)).toBe(true)
      expect(trie.get(5)).toBeUndefined()
    })

    it('should insert multiple keys', () => {
      trie.insert(0, 'a')
      trie.insert(15, 'b')
      trie.insert(10, 'c')
      expect(trie.size).toBe(3)
    })

    it('should overwrite existing key value', () => {
      trie.insert(1, 'first')
      trie.insert(1, 'second')
      expect(trie.size).toBe(1)
      expect(trie.get(1)).toBe('second')
    })

    it('should insert key 0', () => {
      trie.insert(0, 'zero')
      expect(trie.get(0)).toBe('zero')
    })

    it('should insert max key for bitDepth', () => {
      trie.insert(15, 'max')
      expect(trie.get(15)).toBe('max')
    })

    it('should insert keys differing by single bit', () => {
      trie.insert(0, 'a')
      trie.insert(1, 'b')
      expect(trie.size).toBe(2)
      expect(trie.get(0)).toBe('a')
      expect(trie.get(1)).toBe('b')
    })

    it('should insert keys with shared prefix', () => {
      trie.insert(12, 'a')
      trie.insert(13, 'b')
      trie.insert(14, 'c')
      expect(trie.size).toBe(3)
    })

    it('should handle numeric values', () => {
      const numTrie = new BinaryTrie<number>({ bitDepth: 4 })
      numTrie.insert(1, 1)
      numTrie.insert(2, 2)
      numTrie.insert(3, 3)
      expect(numTrie.size).toBe(3)
    })

    it('should handle object values', () => {
      const objTrie = new BinaryTrie<{ name: string }>({ bitDepth: 4 })
      objTrie.insert(1, { name: 'test' })
      expect(objTrie.get(1)?.name).toBe('test')
    })

    it('should not increment size on duplicate insert', () => {
      trie.insert(5, 'a')
      trie.insert(5, 'b')
      expect(trie.size).toBe(1)
    })

    it('should update value on duplicate insert', () => {
      trie.insert(5, 'a')
      trie.insert(5, 'b')
      expect(trie.get(5)).toBe('b')
    })

    it('should insert all 16 keys for 4-bit depth', () => {
      for (let i = 0; i < 16; i++) {
        trie.insert(i, `val${i}`)
      }
      expect(trie.size).toBe(16)
    })

    it('should handle sequential insertions', () => {
      for (let i = 0; i < 8; i++) {
        trie.insert(i, `v${i}`)
      }
      expect(trie.size).toBe(8)
      for (let i = 0; i < 8; i++) {
        expect(trie.get(i)).toBe(`v${i}`)
      }
    })

    it('should insert negative numbers with 8-bit depth', () => {
      const t = new BinaryTrie<string>({ bitDepth: 8 })
      t.insert(-1, 'neg1')
      t.insert(-128, 'neg128')
      expect(t.size).toBe(2)
      expect(t.get(-1)).toBe('neg1')
      expect(t.get(-128)).toBe('neg128')
    })
  })

  describe('delete', () => {
    let trie: BinaryTrie<string>

    beforeEach(() => {
      trie = new BinaryTrie<string>({ bitDepth: 4 })
      trie.insert(0, 'a')
      trie.insert(15, 'b')
      trie.insert(10, 'c')
    })

    it('should delete an existing key', () => {
      expect(trie.delete(0)).toBe(true)
      expect(trie.size).toBe(2)
    })

    it('should return false for non-existent key', () => {
      expect(trie.delete(5)).toBe(false)
      expect(trie.size).toBe(3)
    })

    it('should make deleted key unfindable via has', () => {
      trie.delete(0)
      expect(trie.has(0)).toBe(false)
    })

    it('should make deleted key return undefined from get', () => {
      trie.delete(0)
      expect(trie.get(0)).toBeUndefined()
    })

    it('should delete all keys one by one', () => {
      trie.delete(0)
      trie.delete(15)
      trie.delete(10)
      expect(trie.size).toBe(0)
      expect(trie.isEmpty).toBe(true)
    })

    it('should allow re-insertion after deletion', () => {
      trie.delete(0)
      trie.insert(0, 'new')
      expect(trie.get(0)).toBe('new')
      expect(trie.size).toBe(3)
    })

    it('should not affect other keys on delete', () => {
      trie.delete(0)
      expect(trie.get(15)).toBe('b')
      expect(trie.get(10)).toBe('c')
    })

    it('should handle delete on empty trie', () => {
      const empty = new BinaryTrie<string>({ bitDepth: 4 })
      expect(empty.delete(0)).toBe(false)
    })

    it('should return boolean', () => {
      expect(typeof trie.delete(0)).toBe('boolean')
    })

    it('should delete key that shares prefix with others', () => {
      trie.insert(1, 'd')
      trie.delete(1)
      expect(trie.get(0)).toBe('a')
      expect(trie.get(1)).toBeUndefined()
    })

    it('should not double-decrement size on deleting already deleted key', () => {
      trie.delete(0)
      expect(trie.delete(0)).toBe(false)
      expect(trie.size).toBe(2)
    })

    it('should prune unused nodes after delete', () => {
      trie.insert(8, 'solo')
      trie.delete(8)
      const stats = trie.stats()
      expect(stats.nodeCount).toBeLessThan(50)
    })

    it('should handle deleting the only key', () => {
      const solo = new BinaryTrie<string>({ bitDepth: 4 })
      solo.insert(5, 'only')
      solo.delete(5)
      expect(solo.size).toBe(0)
      expect(solo.isEmpty).toBe(true)
    })

    it('should delete keys with shared path', () => {
      trie.insert(1, 'd')
      trie.insert(2, 'e')
      trie.delete(1)
      trie.delete(2)
      expect(trie.has(0)).toBe(true)
      expect(trie.has(1)).toBe(false)
      expect(trie.has(2)).toBe(false)
    })

    it('should handle delete and re-insert cycle', () => {
      trie.delete(0)
      trie.insert(0, 'x')
      trie.delete(0)
      trie.insert(0, 'y')
      expect(trie.get(0)).toBe('y')
      expect(trie.size).toBe(3)
    })
  })

  describe('has', () => {
    let trie: BinaryTrie<string>

    beforeEach(() => {
      trie = new BinaryTrie<string>({ bitDepth: 4 })
      trie.insert(10, 'exists')
    })

    it('should return true for existing key', () => {
      expect(trie.has(10)).toBe(true)
    })

    it('should return false for non-existent key', () => {
      expect(trie.has(5)).toBe(false)
    })

    it('should return false after deletion', () => {
      trie.delete(10)
      expect(trie.has(10)).toBe(false)
    })

    it('should return true for key 0 when inserted', () => {
      trie.insert(0, 'zero')
      expect(trie.has(0)).toBe(true)
    })

    it('should return false for key 0 when not inserted', () => {
      expect(trie.has(0)).toBe(false)
    })

    it('should return true for max key when inserted', () => {
      trie.insert(15, 'max')
      expect(trie.has(15)).toBe(true)
    })

    it('should return correct result after overwrite', () => {
      trie.insert(10, 'new')
      expect(trie.has(10)).toBe(true)
    })

    it('should return false for all keys in empty trie', () => {
      const empty = new BinaryTrie<string>({ bitDepth: 4 })
      expect(empty.has(0)).toBe(false)
      expect(empty.has(5)).toBe(false)
      expect(empty.has(15)).toBe(false)
    })

    it('should handle multiple keys', () => {
      trie.insert(0, 'a')
      trie.insert(5, 'b')
      trie.insert(15, 'c')
      expect(trie.has(0)).toBe(true)
      expect(trie.has(5)).toBe(true)
      expect(trie.has(15)).toBe(true)
      expect(trie.has(3)).toBe(false)
    })

    it('should return false for key not in range of bitDepth', () => {
      expect(trie.has(16)).toBe(false)
    })
  })

  describe('get', () => {
    let trie: BinaryTrie<string>

    beforeEach(() => {
      trie = new BinaryTrie<string>({ bitDepth: 4 })
      trie.insert(0, 'zero')
      trie.insert(15, 'max')
      trie.insert(10, 'pattern')
    })

    it('should find an inserted key', () => {
      expect(trie.get(0)).toBe('zero')
    })

    it('should find max key', () => {
      expect(trie.get(15)).toBe('max')
    })

    it('should find pattern key', () => {
      expect(trie.get(10)).toBe('pattern')
    })

    it('should return undefined for non-existent key', () => {
      expect(trie.get(5)).toBeUndefined()
    })

    it('should return updated value after overwrite', () => {
      trie.insert(0, 'updated')
      expect(trie.get(0)).toBe('updated')
    })

    it('should return undefined after deletion', () => {
      trie.delete(0)
      expect(trie.get(0)).toBeUndefined()
    })

    it('should return undefined for key inserted without value', () => {
      trie.insert(7)
      expect(trie.get(7)).toBeUndefined()
      expect(trie.has(7)).toBe(true)
    })

    it('should handle numeric values', () => {
      const numTrie = new BinaryTrie<number>({ bitDepth: 4 })
      numTrie.insert(5, 42)
      expect(numTrie.get(5)).toBe(42)
    })

    it('should return undefined on empty trie', () => {
      const empty = new BinaryTrie<string>({ bitDepth: 4 })
      expect(empty.get(0)).toBeUndefined()
    })

    it('should handle null-like values', () => {
      const t = new BinaryTrie<number | null>({ bitDepth: 4 })
      t.insert(3, null)
      expect(t.get(3)).toBeNull()
    })
  })

  describe('min', () => {
    it('should return undefined for empty trie', () => {
      const trie = new BinaryTrie<string>({ bitDepth: 4 })
      expect(trie.min()).toBeUndefined()
    })

    it('should return the single key', () => {
      const trie = new BinaryTrie<string>({ bitDepth: 4 })
      trie.insert(5, 'val')
      expect(trie.min()).toBe(5)
    })

    it('should return the smallest of multiple keys', () => {
      const trie = new BinaryTrie<string>({ bitDepth: 4 })
      trie.insert(10, 'a')
      trie.insert(3, 'b')
      trie.insert(7, 'c')
      expect(trie.min()).toBe(3)
    })

    it('should return 0 when 0 is the smallest', () => {
      const trie = new BinaryTrie<string>({ bitDepth: 4 })
      trie.insert(0, 'zero')
      trie.insert(5, 'five')
      expect(trie.min()).toBe(0)
    })

    it('should update after deletion', () => {
      const trie = new BinaryTrie<string>({ bitDepth: 4 })
      trie.insert(3, 'a')
      trie.insert(7, 'b')
      trie.delete(3)
      expect(trie.min()).toBe(7)
    })

    it('should update after insertion of smaller key', () => {
      const trie = new BinaryTrie<string>({ bitDepth: 4 })
      trie.insert(10, 'a')
      expect(trie.min()).toBe(10)
      trie.insert(2, 'b')
      expect(trie.min()).toBe(2)
    })

    it('should handle negative numbers with unsigned ordering', () => {
      const trie = new BinaryTrie<string>({ bitDepth: 8 })
      trie.insert(-5, 'neg')
      trie.insert(5, 'pos')
      expect(trie.min()).toBe(5)
      expect(trie.max()).toBe(-5)
    })

    it('should find min among all 16 keys', () => {
      const trie = new BinaryTrie<string>({ bitDepth: 4 })
      for (let i = 0; i < 16; i++) {
        trie.insert(i, `v${i}`)
      }
      expect(trie.min()).toBe(0)
    })

    it('should return undefined after clear', () => {
      const trie = new BinaryTrie<string>({ bitDepth: 4 })
      trie.insert(5, 'a')
      trie.clear()
      expect(trie.min()).toBeUndefined()
    })

    it('should work after all but one deleted', () => {
      const trie = new BinaryTrie<string>({ bitDepth: 4 })
      trie.insert(1, 'a')
      trie.insert(2, 'b')
      trie.insert(3, 'c')
      trie.delete(1)
      trie.delete(3)
      expect(trie.min()).toBe(2)
    })
  })

  describe('max', () => {
    it('should return undefined for empty trie', () => {
      const trie = new BinaryTrie<string>({ bitDepth: 4 })
      expect(trie.max()).toBeUndefined()
    })

    it('should return the single key', () => {
      const trie = new BinaryTrie<string>({ bitDepth: 4 })
      trie.insert(5, 'val')
      expect(trie.max()).toBe(5)
    })

    it('should return the largest of multiple keys', () => {
      const trie = new BinaryTrie<string>({ bitDepth: 4 })
      trie.insert(3, 'a')
      trie.insert(10, 'b')
      trie.insert(7, 'c')
      expect(trie.max()).toBe(10)
    })

    it('should return 15 when 15 is the largest', () => {
      const trie = new BinaryTrie<string>({ bitDepth: 4 })
      trie.insert(15, 'max')
      trie.insert(5, 'five')
      expect(trie.max()).toBe(15)
    })

    it('should update after deletion', () => {
      const trie = new BinaryTrie<string>({ bitDepth: 4 })
      trie.insert(3, 'a')
      trie.insert(7, 'b')
      trie.delete(7)
      expect(trie.max()).toBe(3)
    })

    it('should update after insertion of larger key', () => {
      const trie = new BinaryTrie<string>({ bitDepth: 4 })
      trie.insert(5, 'a')
      expect(trie.max()).toBe(5)
      trie.insert(12, 'b')
      expect(trie.max()).toBe(12)
    })

    it('should handle negative numbers with unsigned ordering', () => {
      const trie = new BinaryTrie<string>({ bitDepth: 8 })
      trie.insert(-5, 'neg')
      trie.insert(5, 'pos')
      expect(trie.max()).toBe(-5)
      expect(trie.min()).toBe(5)
    })

    it('should find max among all 16 keys', () => {
      const trie = new BinaryTrie<string>({ bitDepth: 4 })
      for (let i = 0; i < 16; i++) {
        trie.insert(i, `v${i}`)
      }
      expect(trie.max()).toBe(15)
    })

    it('should return undefined after clear', () => {
      const trie = new BinaryTrie<string>({ bitDepth: 4 })
      trie.insert(5, 'a')
      trie.clear()
      expect(trie.max()).toBeUndefined()
    })

    it('should work after all but one deleted', () => {
      const trie = new BinaryTrie<string>({ bitDepth: 4 })
      trie.insert(1, 'a')
      trie.insert(2, 'b')
      trie.insert(3, 'c')
      trie.delete(2)
      trie.delete(3)
      expect(trie.max()).toBe(1)
    })
  })

  describe('successor', () => {
    let trie: BinaryTrie<string>

    beforeEach(() => {
      trie = new BinaryTrie<string>({ bitDepth: 4 })
      trie.insert(3, 'a')
      trie.insert(7, 'b')
      trie.insert(10, 'c')
      trie.insert(15, 'd')
    })

    it('should return next larger key', () => {
      expect(trie.successor(3)).toBe(7)
    })

    it('should return next key after middle element', () => {
      expect(trie.successor(7)).toBe(10)
    })

    it('should return undefined for max key', () => {
      expect(trie.successor(15)).toBeUndefined()
    })

    it('should return smallest key larger than non-existent key', () => {
      expect(trie.successor(5)).toBe(7)
    })

    it('should return smallest key for query below all keys', () => {
      expect(trie.successor(0)).toBe(3)
    })

    it('should return undefined for query at max key', () => {
      expect(trie.successor(15)).toBeUndefined()
    })

    it('should work with adjacent keys', () => {
      const t = new BinaryTrie<string>({ bitDepth: 4 })
      t.insert(5, 'a')
      t.insert(6, 'b')
      expect(t.successor(5)).toBe(6)
    })

    it('should handle single element trie', () => {
      const t = new BinaryTrie<string>({ bitDepth: 4 })
      t.insert(5, 'only')
      expect(t.successor(5)).toBeUndefined()
      expect(t.successor(4)).toBe(5)
    })

    it('should handle empty trie', () => {
      const t = new BinaryTrie<string>({ bitDepth: 4 })
      expect(t.successor(5)).toBeUndefined()
    })

    it('should return successor for key just below existing', () => {
      expect(trie.successor(9)).toBe(10)
    })

    it('should return successor for key between two elements', () => {
      expect(trie.successor(8)).toBe(10)
    })

    it('should handle successor of deleted key', () => {
      trie.delete(7)
      expect(trie.successor(3)).toBe(10)
    })

    it('should work with negative numbers unsigned ordering', () => {
      const t = new BinaryTrie<string>({ bitDepth: 8 })
      t.insert(-10, 'a')
      t.insert(-5, 'b')
      t.insert(0, 'c')
      t.insert(5, 'd')
      expect(t.successor(-10)).toBe(-5)
      expect(t.successor(0)).toBe(5)
      expect(t.successor(5)).toBe(-10)
    })

    it('should handle all 16 keys', () => {
      const t = new BinaryTrie<string>({ bitDepth: 4 })
      for (let i = 0; i < 16; i++) {
        t.insert(i, `v${i}`)
      }
      for (let i = 0; i < 15; i++) {
        expect(t.successor(i)).toBe(i + 1)
      }
      expect(t.successor(15)).toBeUndefined()
    })

    it('should find successor with keys sharing prefix', () => {
      const t = new BinaryTrie<string>({ bitDepth: 4 })
      t.insert(0b1100, 'a')
      t.insert(0b1101, 'b')
      t.insert(0b1110, 'c')
      expect(t.successor(0b1100)).toBe(0b1101)
      expect(t.successor(0b1101)).toBe(0b1110)
    })
  })

  describe('predecessor', () => {
    let trie: BinaryTrie<string>

    beforeEach(() => {
      trie = new BinaryTrie<string>({ bitDepth: 4 })
      trie.insert(3, 'a')
      trie.insert(7, 'b')
      trie.insert(10, 'c')
      trie.insert(15, 'd')
    })

    it('should return next smaller key', () => {
      expect(trie.predecessor(7)).toBe(3)
    })

    it('should return previous key before middle element', () => {
      expect(trie.predecessor(10)).toBe(7)
    })

    it('should return undefined for min key', () => {
      expect(trie.predecessor(3)).toBeUndefined()
    })

    it('should return largest key smaller than non-existent key', () => {
      expect(trie.predecessor(5)).toBe(3)
    })

    it('should return largest key for query above all keys', () => {
      expect(trie.predecessor(14)).toBe(10)
    })

    it('should work with adjacent keys', () => {
      const t = new BinaryTrie<string>({ bitDepth: 4 })
      t.insert(5, 'a')
      t.insert(6, 'b')
      expect(t.predecessor(6)).toBe(5)
    })

    it('should handle single element trie', () => {
      const t = new BinaryTrie<string>({ bitDepth: 4 })
      t.insert(5, 'only')
      expect(t.predecessor(5)).toBeUndefined()
      expect(t.predecessor(6)).toBe(5)
    })

    it('should handle empty trie', () => {
      const t = new BinaryTrie<string>({ bitDepth: 4 })
      expect(t.predecessor(5)).toBeUndefined()
    })

    it('should return predecessor for key just above existing', () => {
      expect(trie.predecessor(11)).toBe(10)
    })

    it('should return predecessor for key between two elements', () => {
      expect(trie.predecessor(8)).toBe(7)
    })

    it('should handle predecessor of deleted key', () => {
      trie.delete(7)
      expect(trie.predecessor(10)).toBe(3)
    })

    it('should work with negative numbers unsigned ordering', () => {
      const t = new BinaryTrie<string>({ bitDepth: 8 })
      t.insert(-10, 'a')
      t.insert(-5, 'b')
      t.insert(0, 'c')
      t.insert(5, 'd')
      expect(t.predecessor(5)).toBe(0)
      expect(t.predecessor(-10)).toBe(5)
      expect(t.predecessor(-5)).toBe(-10)
    })

    it('should handle all 16 keys', () => {
      const t = new BinaryTrie<string>({ bitDepth: 4 })
      for (let i = 0; i < 16; i++) {
        t.insert(i, `v${i}`)
      }
      for (let i = 1; i < 16; i++) {
        expect(t.predecessor(i)).toBe(i - 1)
      }
      expect(t.predecessor(0)).toBeUndefined()
    })

    it('should find predecessor with keys sharing prefix', () => {
      const t = new BinaryTrie<string>({ bitDepth: 4 })
      t.insert(0b1100, 'a')
      t.insert(0b1101, 'b')
      t.insert(0b1110, 'c')
      expect(t.predecessor(0b1110)).toBe(0b1101)
      expect(t.predecessor(0b1101)).toBe(0b1100)
    })
  })

  describe('size and isEmpty', () => {
    it('should return 0 for empty trie', () => {
      const trie = new BinaryTrie<string>({ bitDepth: 4 })
      expect(trie.size).toBe(0)
    })

    it('should return correct count after inserts', () => {
      const trie = new BinaryTrie<string>({ bitDepth: 4 })
      trie.insert(0, 'a')
      trie.insert(1, 'b')
      expect(trie.size).toBe(2)
    })

    it('should return correct count after deletions', () => {
      const trie = new BinaryTrie<string>({ bitDepth: 4 })
      trie.insert(0, 'a')
      trie.insert(1, 'b')
      trie.delete(0)
      expect(trie.size).toBe(1)
    })

    it('should return 0 after clear', () => {
      const trie = new BinaryTrie<string>({ bitDepth: 4 })
      trie.insert(0, 'a')
      trie.clear()
      expect(trie.size).toBe(0)
    })

    it('should not increment on overwrite', () => {
      const trie = new BinaryTrie<string>({ bitDepth: 4 })
      trie.insert(0, 'a')
      trie.insert(0, 'b')
      expect(trie.size).toBe(1)
    })

    it('should return true for isEmpty on new trie', () => {
      const trie = new BinaryTrie<string>({ bitDepth: 4 })
      expect(trie.isEmpty).toBe(true)
    })

    it('should return false for isEmpty after insert', () => {
      const trie = new BinaryTrie<string>({ bitDepth: 4 })
      trie.insert(0, 'a')
      expect(trie.isEmpty).toBe(false)
    })

    it('should return true for isEmpty after deleting all', () => {
      const trie = new BinaryTrie<string>({ bitDepth: 4 })
      trie.insert(0, 'a')
      trie.delete(0)
      expect(trie.isEmpty).toBe(true)
    })
  })

  describe('clear', () => {
    it('should remove all entries', () => {
      const trie = new BinaryTrie<string>({ bitDepth: 4 })
      trie.insert(0, 'a')
      trie.insert(1, 'b')
      trie.clear()
      expect(trie.size).toBe(0)
    })

    it('should allow insert after clear', () => {
      const trie = new BinaryTrie<string>({ bitDepth: 4 })
      trie.insert(0, 'a')
      trie.clear()
      trie.insert(1, 'b')
      expect(trie.size).toBe(1)
      expect(trie.get(1)).toBe('b')
    })

    it('should result in empty trie', () => {
      const trie = new BinaryTrie<string>({ bitDepth: 4 })
      trie.insert(0, 'a')
      trie.clear()
      expect(trie.isEmpty).toBe(true)
      expect(trie.min()).toBeUndefined()
      expect(trie.max()).toBeUndefined()
    })

    it('should return void', () => {
      const trie = new BinaryTrie<string>({ bitDepth: 4 })
      expect(trie.clear()).toBeUndefined()
    })

    it('should handle clear on already empty trie', () => {
      const trie = new BinaryTrie<string>({ bitDepth: 4 })
      trie.clear()
      expect(trie.size).toBe(0)
    })
  })

  describe('forEach', () => {
    it('should iterate over all entries in order', () => {
      const trie = new BinaryTrie<string>({ bitDepth: 4 })
      trie.insert(5, 'e')
      trie.insert(3, 'c')
      trie.insert(1, 'a')
      trie.insert(7, 'g')
      const result: Array<[number, string]> = []
      trie.forEach((value, key) => {
        result.push([key, value!])
      })
      expect(result).toEqual([
        [1, 'a'],
        [3, 'c'],
        [5, 'e'],
        [7, 'g'],
      ])
    })

    it('should not call callback for empty trie', () => {
      const trie = new BinaryTrie<string>({ bitDepth: 4 })
      let count = 0
      trie.forEach(() => { count++ })
      expect(count).toBe(0)
    })

    it('should call callback with correct trie instance', () => {
      const trie = new BinaryTrie<string>({ bitDepth: 4 })
      trie.insert(5, 'a')
      let received: BinaryTrie<string> | undefined
      trie.forEach((_v, _k, t) => { received = t })
      expect(received).toBe(trie)
    })

    it('should iterate in ascending key order', () => {
      const trie = new BinaryTrie<string>({ bitDepth: 4 })
      trie.insert(10, 'a')
      trie.insert(0, 'b')
      trie.insert(5, 'c')
      const keys: number[] = []
      trie.forEach((_v, key) => { keys.push(key) })
      expect(keys).toEqual([0, 5, 10])
    })

    it('should handle single element', () => {
      const trie = new BinaryTrie<string>({ bitDepth: 4 })
      trie.insert(5, 'only')
      const result: Array<[number, string]> = []
      trie.forEach((value, key) => { result.push([key, value!]) })
      expect(result).toEqual([[5, 'only']])
    })

    it('should iterate in unsigned order for negative numbers', () => {
      const trie = new BinaryTrie<string>({ bitDepth: 8 })
      trie.insert(-5, 'neg')
      trie.insert(0, 'zero')
      trie.insert(5, 'pos')
      const keys: number[] = []
      trie.forEach((_v, key) => { keys.push(key) })
      expect(keys).toEqual([0, 5, -5])
    })

    it('should pass undefined for keys without values', () => {
      const trie = new BinaryTrie<string>({ bitDepth: 4 })
      trie.insert(5)
      let receivedValue: string | undefined = 'initial'
      trie.forEach((value) => { receivedValue = value })
      expect(receivedValue).toBeUndefined()
    })

    it('should iterate all 16 keys', () => {
      const trie = new BinaryTrie<string>({ bitDepth: 4 })
      for (let i = 0; i < 16; i++) {
        trie.insert(i, `v${i}`)
      }
      const keys: number[] = []
      trie.forEach((_v, key) => { keys.push(key) })
      expect(keys).toHaveLength(16)
      for (let i = 0; i < 16; i++) {
        expect(keys[i]).toBe(i)
      }
    })
  })

  describe('keys', () => {
    it('should return empty array for empty trie', () => {
      const trie = new BinaryTrie<string>({ bitDepth: 4 })
      expect(trie.keys()).toEqual([])
    })

    it('should return keys in ascending order', () => {
      const trie = new BinaryTrie<string>({ bitDepth: 4 })
      trie.insert(5, 'a')
      trie.insert(3, 'b')
      trie.insert(7, 'c')
      expect(trie.keys()).toEqual([3, 5, 7])
    })

    it('should reflect deletions', () => {
      const trie = new BinaryTrie<string>({ bitDepth: 4 })
      trie.insert(1, 'a')
      trie.insert(2, 'b')
      trie.insert(3, 'c')
      trie.delete(2)
      expect(trie.keys()).toEqual([1, 3])
    })

    it('should return single key', () => {
      const trie = new BinaryTrie<string>({ bitDepth: 4 })
      trie.insert(5, 'a')
      expect(trie.keys()).toEqual([5])
    })

    it('should return all inserted keys', () => {
      const trie = new BinaryTrie<string>({ bitDepth: 4 })
      for (let i = 0; i < 8; i++) {
        trie.insert(i, `v${i}`)
      }
      expect(trie.keys()).toHaveLength(8)
    })
  })

  describe('values', () => {
    it('should return empty array for empty trie', () => {
      const trie = new BinaryTrie<string>({ bitDepth: 4 })
      expect(trie.values()).toEqual([])
    })

    it('should return values in key ascending order', () => {
      const trie = new BinaryTrie<string>({ bitDepth: 4 })
      trie.insert(5, 'e')
      trie.insert(3, 'c')
      trie.insert(7, 'g')
      expect(trie.values()).toEqual(['c', 'e', 'g'])
    })

    it('should reflect deletions', () => {
      const trie = new BinaryTrie<string>({ bitDepth: 4 })
      trie.insert(1, 'a')
      trie.insert(2, 'b')
      trie.insert(3, 'c')
      trie.delete(2)
      expect(trie.values()).toEqual(['a', 'c'])
    })

    it('should include undefined for keys without values', () => {
      const trie = new BinaryTrie<string>({ bitDepth: 4 })
      trie.insert(5)
      trie.insert(3, 'val')
      expect(trie.values()).toEqual(['val', undefined])
    })

    it('should return single value', () => {
      const trie = new BinaryTrie<string>({ bitDepth: 4 })
      trie.insert(5, 'a')
      expect(trie.values()).toEqual(['a'])
    })
  })

  describe('entries', () => {
    it('should return empty array for empty trie', () => {
      const trie = new BinaryTrie<string>({ bitDepth: 4 })
      expect(trie.entries()).toEqual([])
    })

    it('should return key-value pairs in order', () => {
      const trie = new BinaryTrie<string>({ bitDepth: 4 })
      trie.insert(3, 'c')
      trie.insert(5, 'e')
      trie.insert(7, 'g')
      expect(trie.entries()).toEqual([
        [3, 'c'],
        [5, 'e'],
        [7, 'g'],
      ])
    })

    it('should reflect deletions', () => {
      const trie = new BinaryTrie<string>({ bitDepth: 4 })
      trie.insert(1, 'a')
      trie.insert(2, 'b')
      trie.delete(2)
      expect(trie.entries()).toEqual([[1, 'a']])
    })

    it('should return entries with undefined values', () => {
      const trie = new BinaryTrie<string>({ bitDepth: 4 })
      trie.insert(5)
      expect(trie.entries()).toEqual([[5, undefined]])
    })

    it('should return all entries', () => {
      const trie = new BinaryTrie<string>({ bitDepth: 4 })
      for (let i = 0; i < 4; i++) {
        trie.insert(i, `v${i}`)
      }
      expect(trie.entries()).toHaveLength(4)
    })
  })

  describe('Symbol.iterator', () => {
    it('should be iterable', () => {
      const trie = new BinaryTrie<string>({ bitDepth: 4 })
      trie.insert(3, 'a')
      trie.insert(5, 'b')
      const result = [...trie]
      expect(result).toEqual([
        [3, 'a'],
        [5, 'b'],
      ])
    })

    it('should return empty for empty trie', () => {
      const trie = new BinaryTrie<string>({ bitDepth: 4 })
      expect([...trie]).toEqual([])
    })

    it('should work with for-of loop', () => {
      const trie = new BinaryTrie<string>({ bitDepth: 4 })
      trie.insert(1, 'a')
      trie.insert(2, 'b')
      const result: Array<[number, string | undefined]> = []
      for (const entry of trie) {
        result.push(entry)
      }
      expect(result).toEqual([
        [1, 'a'],
        [2, 'b'],
      ])
    })

    it('should work with destructuring', () => {
      const trie = new BinaryTrie<string>({ bitDepth: 4 })
      trie.insert(1, 'a')
      trie.insert(2, 'b')
      const [[k1, v1], [k2, v2]] = trie
      expect(k1).toBe(1)
      expect(v1).toBe('a')
      expect(k2).toBe(2)
      expect(v2).toBe('b')
    })

    it('should use same order as entries', () => {
      const trie = new BinaryTrie<string>({ bitDepth: 4 })
      trie.insert(5, 'e')
      trie.insert(3, 'c')
      trie.insert(7, 'g')
      expect([...trie]).toEqual(trie.entries())
    })
  })

  describe('stats', () => {
    it('should return stats for empty trie', () => {
      const trie = new BinaryTrie<string>({ bitDepth: 4 })
      const s = trie.stats()
      expect(s.size).toBe(0)
      expect(s.nodeCount).toBe(1)
      expect(s.height).toBe(0)
    })

    it('should return correct stats after insert', () => {
      const trie = new BinaryTrie<string>({ bitDepth: 4 })
      trie.insert(0, 'a')
      const s = trie.stats()
      expect(s.size).toBe(1)
      expect(s.nodeCount).toBe(5)
      expect(s.height).toBe(4)
    })

    it('should share nodes for common prefixes', () => {
      const trie = new BinaryTrie<string>({ bitDepth: 4 })
      trie.insert(0, 'a')
      trie.insert(1, 'b')
      const s = trie.stats()
      expect(s.size).toBe(2)
      expect(s.nodeCount).toBe(6)
    })

    it('should decrease nodeCount after delete', () => {
      const trie = new BinaryTrie<string>({ bitDepth: 4 })
      trie.insert(8, 'a')
      const before = trie.stats().nodeCount
      trie.delete(8)
      const after = trie.stats().nodeCount
      expect(after).toBeLessThan(before)
    })

    it('should reset after clear', () => {
      const trie = new BinaryTrie<string>({ bitDepth: 4 })
      trie.insert(0, 'a')
      trie.clear()
      const s = trie.stats()
      expect(s.size).toBe(0)
      expect(s.nodeCount).toBe(1)
      expect(s.height).toBe(0)
    })

    it('should return BinaryTrieStats type', () => {
      const trie = new BinaryTrie<string>({ bitDepth: 4 })
      const s: BinaryTrieStats = trie.stats()
      expect(typeof s.size).toBe('number')
      expect(typeof s.nodeCount).toBe('number')
      expect(typeof s.height).toBe('number')
    })
  })

  describe('edge cases', () => {
    it('should handle bitDepth of 1', () => {
      const trie = new BinaryTrie<string>({ bitDepth: 1 })
      trie.insert(0, 'zero')
      trie.insert(1, 'one')
      expect(trie.size).toBe(2)
      expect(trie.get(0)).toBe('zero')
      expect(trie.get(1)).toBe('one')
    })

    it('should handle duplicate insert gracefully', () => {
      const trie = new BinaryTrie<string>({ bitDepth: 4 })
      trie.insert(5, 'a')
      trie.insert(5, 'b')
      expect(trie.size).toBe(1)
      expect(trie.get(5)).toBe('b')
    })

    it('should handle sequential keys', () => {
      const trie = new BinaryTrie<number>({ bitDepth: 4 })
      for (let i = 0; i < 16; i++) {
        trie.insert(i, i)
      }
      expect(trie.size).toBe(16)
      for (let i = 0; i < 16; i++) {
        expect(trie.get(i)).toBe(i)
      }
    })

    it('should handle delete from trie with shared paths', () => {
      const trie = new BinaryTrie<string>({ bitDepth: 4 })
      trie.insert(0, 'a')
      trie.insert(1, 'b')
      trie.delete(1)
      expect(trie.get(0)).toBe('a')
      expect(trie.get(1)).toBeUndefined()
    })

    it('should handle negative numbers', () => {
      const trie = new BinaryTrie<string>({ bitDepth: 8 })
      trie.insert(-128, 'min')
      trie.insert(-1, 'neg1')
      trie.insert(0, 'zero')
      trie.insert(127, 'max')
      expect(trie.size).toBe(4)
      expect(trie.get(-128)).toBe('min')
      expect(trie.get(-1)).toBe('neg1')
      expect(trie.get(0)).toBe('zero')
      expect(trie.get(127)).toBe('max')
    })

    it('should order negative after positive in unsigned ordering', () => {
      const trie = new BinaryTrie<string>({ bitDepth: 8 })
      trie.insert(-1, 'neg')
      trie.insert(0, 'zero')
      trie.insert(1, 'pos')
      expect(trie.min()).toBe(0)
      expect(trie.max()).toBe(-1)
      expect(trie.successor(0)).toBe(1)
      expect(trie.successor(1)).toBe(-1)
    })

    it('should handle large positive 32-bit numbers', () => {
      const trie = new BinaryTrie<string>()
      trie.insert(2147483647, 'max')
      expect(trie.get(2147483647)).toBe('max')
      expect(trie.max()).toBe(2147483647)
    })

    it('should handle large negative 32-bit numbers', () => {
      const trie = new BinaryTrie<string>()
      trie.insert(-2147483648, 'min')
      expect(trie.get(-2147483648)).toBe('min')
      expect(trie.min()).toBe(-2147483648)
    })

    it('should handle mix of large positive and negative', () => {
      const trie = new BinaryTrie<string>()
      trie.insert(-2147483648, 'min')
      trie.insert(0, 'zero')
      trie.insert(2147483647, 'max')
      expect(trie.min()).toBe(0)
      expect(trie.max()).toBe(-2147483648)
      expect(trie.successor(0)).toBe(2147483647)
      expect(trie.successor(2147483647)).toBe(-2147483648)
    })

    it('should handle single element operations', () => {
      const trie = new BinaryTrie<string>({ bitDepth: 4 })
      trie.insert(5, 'only')
      expect(trie.min()).toBe(5)
      expect(trie.max()).toBe(5)
      expect(trie.successor(5)).toBeUndefined()
      expect(trie.predecessor(5)).toBeUndefined()
      expect(trie.successor(4)).toBe(5)
      expect(trie.predecessor(6)).toBe(5)
    })

    it('should handle insert-delete-insert cycle', () => {
      const trie = new BinaryTrie<string>({ bitDepth: 8 })
      trie.insert(5, 'first')
      trie.delete(5)
      trie.insert(5, 'second')
      expect(trie.get(5)).toBe('second')
      expect(trie.size).toBe(1)
    })

    it('should handle clear and rebuild', () => {
      const trie = new BinaryTrie<string>({ bitDepth: 4 })
      trie.insert(0, 'a')
      trie.clear()
      trie.insert(1, 'b')
      expect(trie.size).toBe(1)
      expect(trie.get(0)).toBeUndefined()
      expect(trie.get(1)).toBe('b')
    })

    it('should handle many insertions and deletions', () => {
      const trie = new BinaryTrie<number>({ bitDepth: 8 })
      for (let i = 0; i < 128; i++) {
        trie.insert(i, i)
      }
      for (let i = 0; i < 64; i++) {
        trie.delete(i)
      }
      expect(trie.size).toBe(64)
      expect(trie.min()).toBe(64)
      expect(trie.max()).toBe(127)
    })

    it('should handle large number of sequential keys', () => {
      const trie = new BinaryTrie<number>({ bitDepth: 10 })
      for (let i = 0; i < 256; i++) {
        trie.insert(i, i)
      }
      expect(trie.size).toBe(256)
      expect(trie.min()).toBe(0)
      expect(trie.max()).toBe(255)
    })

    it('should handle 32-bit keys', () => {
      const trie = new BinaryTrie<string>()
      const key = 0xc0a80101
      trie.insert(key, 'ip')
      expect(trie.get(key)).toBe('ip')
    })
  })

  describe('type exports', () => {
    it('should export DEFAULT_BINARY_TRIE_OPTIONS', () => {
      expect(DEFAULT_BINARY_TRIE_OPTIONS.bitDepth).toBe(32)
    })

    it('should support BinaryTrieOptions interface', () => {
      const opts: BinaryTrieOptions = { bitDepth: 16 }
      expect(opts.bitDepth).toBe(16)
    })

    it('should support BinaryTrieStats interface', () => {
      const s: BinaryTrieStats = { size: 0, nodeCount: 1, height: 0 }
      expect(s.size).toBe(0)
    })
  })

  describe('combined operations', () => {
    it('should maintain consistency across mixed operations', () => {
      const trie = new BinaryTrie<string>({ bitDepth: 4 })
      trie.insert(0, 'a')
      trie.insert(1, 'b')
      trie.insert(2, 'c')
      trie.delete(1)
      trie.insert(3, 'd')
      expect(trie.size).toBe(3)
      expect(trie.get(0)).toBe('a')
      expect(trie.get(1)).toBeUndefined()
      expect(trie.get(2)).toBe('c')
      expect(trie.get(3)).toBe('d')
    })

    it('should handle successor and predecessor after modifications', () => {
      const trie = new BinaryTrie<string>({ bitDepth: 4 })
      trie.insert(2, 'a')
      trie.insert(5, 'b')
      trie.insert(8, 'c')
      trie.delete(5)
      expect(trie.successor(2)).toBe(8)
      expect(trie.predecessor(8)).toBe(2)
    })

    it('should handle forEach after modifications', () => {
      const trie = new BinaryTrie<string>({ bitDepth: 4 })
      trie.insert(1, 'a')
      trie.insert(2, 'b')
      trie.insert(3, 'c')
      trie.delete(2)
      const keys: number[] = []
      trie.forEach((_v, key) => { keys.push(key) })
      expect(keys).toEqual([1, 3])
    })

    it('should maintain correct min/max through operations', () => {
      const trie = new BinaryTrie<string>({ bitDepth: 4 })
      trie.insert(10, 'a')
      expect(trie.min()).toBe(10)
      expect(trie.max()).toBe(10)
      trie.insert(5, 'b')
      expect(trie.min()).toBe(5)
      trie.insert(15, 'c')
      expect(trie.max()).toBe(15)
      trie.delete(5)
      expect(trie.min()).toBe(10)
      trie.delete(15)
      expect(trie.max()).toBe(10)
    })
  })
})
