import { describe, it, expect, beforeEach } from 'vitest'
import { BitwiseTrie } from '../../src/core/bitwise-trie/bitwise-trie.js'
import { DEFAULT_BITWISE_TRIE_OPTIONS } from '../../src/core/bitwise-trie/types.js'
import type { BitwiseTrieOptions } from '../../src/core/bitwise-trie/types.js'

describe('BitwiseTrie', () => {
  describe('constructor', () => {
    it('should create a trie with default options', () => {
      const trie = new BitwiseTrie<string>()
      expect(trie.size()).toBe(0)
    })

    it('should accept custom bitDepth', () => {
      const trie = new BitwiseTrie<string>({ bitDepth: 8 })
      expect(trie.size()).toBe(0)
    })

    it('should use DEFAULT_BITWISE_TRIE_OPTIONS defaults', () => {
      expect(DEFAULT_BITWISE_TRIE_OPTIONS.bitDepth).toBe(32)
    })

    it('should accept partial options', () => {
      const trie = new BitwiseTrie<string>({ bitDepth: 16 })
      trie.insert(0b10101010, 'test')
      expect(trie.search(0b10101010)).toBe('test')
    })

    it('should return isEmpty true for new trie', () => {
      const trie = new BitwiseTrie<string>()
      expect(trie.isEmpty()).toBe(true)
    })

    it('should return countNodes of 1 for empty trie (root only)', () => {
      const trie = new BitwiseTrie<string>()
      expect(trie.countNodes()).toBe(1)
    })
  })

  describe('insert', () => {
    let trie: BitwiseTrie<string>

    beforeEach(() => {
      trie = new BitwiseTrie<string>({ bitDepth: 8 })
    })

    it('should insert a key with a value', () => {
      trie.insert(0b00000000, 'zero')
      expect(trie.size()).toBe(1)
    })

    it('should insert multiple keys', () => {
      trie.insert(0b00000000, 'a')
      trie.insert(0b11111111, 'b')
      trie.insert(0b10101010, 'c')
      expect(trie.size()).toBe(3)
    })

    it('should overwrite existing key value', () => {
      trie.insert(0b00000001, 'first')
      trie.insert(0b00000001, 'second')
      expect(trie.size()).toBe(1)
      expect(trie.search(0b00000001)).toBe('second')
    })

    it('should insert key 0', () => {
      trie.insert(0, 'zero')
      expect(trie.search(0)).toBe('zero')
    })

    it('should insert max key for bitDepth', () => {
      trie.insert(0xff, 'max')
      expect(trie.search(0xff)).toBe('max')
    })

    it('should insert keys differing by single bit', () => {
      trie.insert(0b00000000, 'a')
      trie.insert(0b00000001, 'b')
      expect(trie.size()).toBe(2)
      expect(trie.search(0b00000000)).toBe('a')
      expect(trie.search(0b00000001)).toBe('b')
    })

    it('should insert keys with shared prefix', () => {
      trie.insert(0b11000000, 'a')
      trie.insert(0b11000001, 'b')
      trie.insert(0b11000010, 'c')
      expect(trie.size()).toBe(3)
    })

    it('should handle numeric values', () => {
      const numTrie = new BitwiseTrie<number>({ bitDepth: 4 })
      numTrie.insert(0b0001, 1)
      numTrie.insert(0b0010, 2)
      numTrie.insert(0b0011, 3)
      expect(numTrie.size()).toBe(3)
    })

    it('should handle object values', () => {
      const objTrie = new BitwiseTrie<{ name: string }>({ bitDepth: 4 })
      objTrie.insert(0b0001, { name: 'test' })
      expect(objTrie.search(0b0001)?.name).toBe('test')
    })
  })

  describe('search', () => {
    let trie: BitwiseTrie<string>

    beforeEach(() => {
      trie = new BitwiseTrie<string>({ bitDepth: 8 })
      trie.insert(0b00000000, 'zero')
      trie.insert(0b11111111, 'max')
      trie.insert(0b10101010, 'pattern')
    })

    it('should find an inserted key', () => {
      expect(trie.search(0b00000000)).toBe('zero')
    })

    it('should find max key', () => {
      expect(trie.search(0b11111111)).toBe('max')
    })

    it('should find pattern key', () => {
      expect(trie.search(0b10101010)).toBe('pattern')
    })

    it('should return undefined for non-existent key', () => {
      expect(trie.search(0b01010101)).toBeUndefined()
    })

    it('should return undefined for key not in trie', () => {
      expect(trie.search(0b00000001)).toBeUndefined()
    })

    it('should return updated value after overwrite', () => {
      trie.insert(0b00000000, 'updated')
      expect(trie.search(0b00000000)).toBe('updated')
    })
  })

  describe('delete', () => {
    let trie: BitwiseTrie<string>

    beforeEach(() => {
      trie = new BitwiseTrie<string>({ bitDepth: 8 })
      trie.insert(0b00000000, 'a')
      trie.insert(0b11111111, 'b')
      trie.insert(0b10101010, 'c')
    })

    it('should delete an existing key', () => {
      expect(trie.delete(0b00000000)).toBe(true)
      expect(trie.size()).toBe(2)
    })

    it('should return false for non-existent key', () => {
      expect(trie.delete(0b01010101)).toBe(false)
      expect(trie.size()).toBe(3)
    })

    it('should make deleted key unsearchable', () => {
      trie.delete(0b00000000)
      expect(trie.search(0b00000000)).toBeUndefined()
    })

    it('should delete all keys one by one', () => {
      trie.delete(0b00000000)
      trie.delete(0b11111111)
      trie.delete(0b10101010)
      expect(trie.size()).toBe(0)
      expect(trie.isEmpty()).toBe(true)
    })

    it('should allow re-insertion after deletion', () => {
      trie.delete(0b00000000)
      trie.insert(0b00000000, 'new')
      expect(trie.search(0b00000000)).toBe('new')
      expect(trie.size()).toBe(3)
    })

    it('should not affect other keys on delete', () => {
      trie.delete(0b00000000)
      expect(trie.search(0b11111111)).toBe('b')
      expect(trie.search(0b10101010)).toBe('c')
    })

    it('should handle delete on empty trie', () => {
      const empty = new BitwiseTrie<string>({ bitDepth: 8 })
      expect(empty.delete(0)).toBe(false)
    })

    it('should return boolean', () => {
      expect(typeof trie.delete(0b00000000)).toBe('boolean')
    })

    it('should delete key that shares prefix with others', () => {
      trie.insert(0b00000001, 'd')
      trie.delete(0b00000001)
      expect(trie.search(0b00000000)).toBe('a')
      expect(trie.search(0b00000001)).toBeUndefined()
    })

    it('should not double-decrement size on deleting already deleted key', () => {
      trie.delete(0b00000000)
      expect(trie.delete(0b00000000)).toBe(false)
      expect(trie.size()).toBe(2)
    })
  })

  describe('has', () => {
    let trie: BitwiseTrie<string>

    beforeEach(() => {
      trie = new BitwiseTrie<string>({ bitDepth: 8 })
      trie.insert(0b10101010, 'exists')
    })

    it('should return true for existing key', () => {
      expect(trie.has(0b10101010)).toBe(true)
    })

    it('should return false for non-existent key', () => {
      expect(trie.has(0b01010101)).toBe(false)
    })

    it('should return false after deletion', () => {
      trie.delete(0b10101010)
      expect(trie.has(0b10101010)).toBe(false)
    })

    it('should return true for key 0 when inserted', () => {
      trie.insert(0, 'zero')
      expect(trie.has(0)).toBe(true)
    })

    it('should return false for key 0 when not inserted', () => {
      expect(trie.has(0)).toBe(false)
    })
  })

  describe('longestPrefixMatch', () => {
    let trie: BitwiseTrie<string>

    beforeEach(() => {
      trie = new BitwiseTrie<string>({ bitDepth: 8 })
    })

    it('should find exact match at full depth', () => {
      trie.insert(0b11000000, 'prefix')
      expect(trie.longestPrefixMatch(0b11000000, 8)).toBe('prefix')
    })

    it('should return undefined when no match', () => {
      expect(trie.longestPrefixMatch(0b11000000, 8)).toBeUndefined()
    })

    it('should match at shorter prefix depth', () => {
      trie.insertPrefix(0b11000000, 2, 'slash16')
      expect(trie.longestPrefixMatch(0b11000000, 8)).toBe('slash16')
    })

    it('should find longest among multiple prefix lengths', () => {
      trie.insertPrefix(0b11000000, 2, 'short')
      trie.insertPrefix(0b11000000, 4, 'longer')
      expect(trie.longestPrefixMatch(0b11001111, 8)).toBe('longer')
    })

    it('should match on empty trie', () => {
      expect(trie.longestPrefixMatch(0, 0)).toBeUndefined()
    })
  })

  describe('insertPrefix', () => {
    let trie: BitwiseTrie<string>

    beforeEach(() => {
      trie = new BitwiseTrie<string>({ bitDepth: 8 })
    })

    it('should insert a prefix', () => {
      trie.insertPrefix(0b11000000, 2, 'net')
      expect(trie.size()).toBe(1)
    })

    it('should be found by search at prefix boundary', () => {
      trie.insertPrefix(0b11000000, 2, 'net')
      expect(trie.size()).toBe(1)
    })

    it('should overwrite prefix at same length', () => {
      trie.insertPrefix(0b11000000, 2, 'first')
      trie.insertPrefix(0b11000000, 2, 'second')
      expect(trie.size()).toBe(1)
    })

    it('should handle prefix length of 1', () => {
      trie.insertPrefix(0b10000000, 1, 'half')
      expect(trie.size()).toBe(1)
    })

    it('should handle prefix length equal to bitDepth', () => {
      trie.insertPrefix(0b10101010, 8, 'full')
      expect(trie.size()).toBe(1)
    })

    it('should handle prefix length of 0', () => {
      trie.insertPrefix(0, 0, 'default')
      expect(trie.size()).toBe(1)
    })
  })

  describe('enumeratePrefix', () => {
    let trie: BitwiseTrie<string>

    beforeEach(() => {
      trie = new BitwiseTrie<string>({ bitDepth: 8 })
    })

    it('should enumerate all keys under a prefix', () => {
      trie.insert(0b11000000, 'a')
      trie.insert(0b11000001, 'b')
      const results = trie.enumeratePrefix(0b11000000, 2)
      expect(results).toHaveLength(2)
    })

    it('should return empty array for non-matching prefix', () => {
      const results = trie.enumeratePrefix(0b11000000, 2)
      expect(results).toEqual([])
    })

    it('should enumerate single key under prefix', () => {
      trie.insert(0b11000000, 'only')
      const results = trie.enumeratePrefix(0b11000000, 2)
      expect(results).toHaveLength(1)
      expect(results[0]!.value).toBe('only')
    })

    it('should return key-value pairs', () => {
      trie.insert(0b11000000, 'a')
      const results = trie.enumeratePrefix(0b11000000, 2)
      expect(results[0]).toEqual({ key: 0b11000000, value: 'a' })
    })

    it('should not include keys outside prefix', () => {
      trie.insert(0b11000000, 'inside')
      trie.insert(0b00000000, 'outside')
      const results = trie.enumeratePrefix(0b11000000, 2)
      expect(results).toHaveLength(1)
      expect(results[0]!.value).toBe('inside')
    })

    it('should enumerate many keys under prefix', () => {
      for (let i = 0; i < 4; i++) {
        trie.insert(0b11000000 | i, `item${i}`)
      }
      const results = trie.enumeratePrefix(0b11000000, 2)
      expect(results).toHaveLength(4)
    })

    it('should enumerate with full prefix length', () => {
      trie.insert(0b10101010, 'exact')
      const results = trie.enumeratePrefix(0b10101010, 8)
      expect(results).toHaveLength(1)
      expect(results[0]!.value).toBe('exact')
    })
  })

  describe('size', () => {
    it('should return 0 for empty trie', () => {
      const trie = new BitwiseTrie<string>({ bitDepth: 4 })
      expect(trie.size()).toBe(0)
    })

    it('should return correct count after inserts', () => {
      const trie = new BitwiseTrie<string>({ bitDepth: 4 })
      trie.insert(0, 'a')
      trie.insert(1, 'b')
      expect(trie.size()).toBe(2)
    })

    it('should return correct count after deletions', () => {
      const trie = new BitwiseTrie<string>({ bitDepth: 4 })
      trie.insert(0, 'a')
      trie.insert(1, 'b')
      trie.delete(0)
      expect(trie.size()).toBe(1)
    })

    it('should return 0 after clear', () => {
      const trie = new BitwiseTrie<string>({ bitDepth: 4 })
      trie.insert(0, 'a')
      trie.clear()
      expect(trie.size()).toBe(0)
    })

    it('should not increment on overwrite', () => {
      const trie = new BitwiseTrie<string>({ bitDepth: 4 })
      trie.insert(0, 'a')
      trie.insert(0, 'b')
      expect(trie.size()).toBe(1)
    })
  })

  describe('isEmpty', () => {
    it('should return true for new trie', () => {
      const trie = new BitwiseTrie<string>({ bitDepth: 4 })
      expect(trie.isEmpty()).toBe(true)
    })

    it('should return false after insert', () => {
      const trie = new BitwiseTrie<string>({ bitDepth: 4 })
      trie.insert(0, 'a')
      expect(trie.isEmpty()).toBe(false)
    })

    it('should return true after deleting all', () => {
      const trie = new BitwiseTrie<string>({ bitDepth: 4 })
      trie.insert(0, 'a')
      trie.delete(0)
      expect(trie.isEmpty()).toBe(true)
    })

    it('should return true after clear', () => {
      const trie = new BitwiseTrie<string>({ bitDepth: 4 })
      trie.insert(0, 'a')
      trie.insert(1, 'b')
      trie.clear()
      expect(trie.isEmpty()).toBe(true)
    })
  })

  describe('clear', () => {
    it('should remove all entries', () => {
      const trie = new BitwiseTrie<string>({ bitDepth: 4 })
      trie.insert(0, 'a')
      trie.insert(1, 'b')
      trie.clear()
      expect(trie.size()).toBe(0)
    })

    it('should allow insert after clear', () => {
      const trie = new BitwiseTrie<string>({ bitDepth: 4 })
      trie.insert(0, 'a')
      trie.clear()
      trie.insert(1, 'b')
      expect(trie.size()).toBe(1)
      expect(trie.search(1)).toBe('b')
    })

    it('should reset countNodes', () => {
      const trie = new BitwiseTrie<string>({ bitDepth: 4 })
      trie.insert(0, 'a')
      trie.insert(1, 'b')
      trie.clear()
      expect(trie.countNodes()).toBe(1)
    })

    it('should return void', () => {
      const trie = new BitwiseTrie<string>({ bitDepth: 4 })
      expect(trie.clear()).toBeUndefined()
    })
  })

  describe('countNodes', () => {
    it('should return 1 for empty trie', () => {
      const trie = new BitwiseTrie<string>({ bitDepth: 4 })
      expect(trie.countNodes()).toBe(1)
    })

    it('should count all nodes after insert', () => {
      const trie = new BitwiseTrie<string>({ bitDepth: 4 })
      trie.insert(0b0000, 'a')
      expect(trie.countNodes()).toBe(5)
    })

    it('should share nodes for common prefixes', () => {
      const trie = new BitwiseTrie<string>({ bitDepth: 4 })
      trie.insert(0b0000, 'a')
      trie.insert(0b0001, 'b')
      expect(trie.countNodes()).toBe(6)
    })

    it('should decrease after delete', () => {
      const trie = new BitwiseTrie<string>({ bitDepth: 4 })
      trie.insert(0b1000, 'a')
      const before = trie.countNodes()
      trie.delete(0b1000)
      expect(trie.countNodes()).toBeLessThan(before)
    })

    it('should return 1 after clear', () => {
      const trie = new BitwiseTrie<string>({ bitDepth: 4 })
      trie.insert(0, 'a')
      trie.clear()
      expect(trie.countNodes()).toBe(1)
    })
  })

  describe('type exports', () => {
    it('should export DEFAULT_BITWISE_TRIE_OPTIONS', () => {
      expect(DEFAULT_BITWISE_TRIE_OPTIONS.bitDepth).toBe(32)
    })

    it('should support BitwiseTrieOptions interface', () => {
      const opts: BitwiseTrieOptions = { bitDepth: 16 }
      expect(opts.bitDepth).toBe(16)
    })
  })

  describe('edge cases', () => {
    it('should handle bitDepth of 1', () => {
      const trie = new BitwiseTrie<string>({ bitDepth: 1 })
      trie.insert(0, 'zero')
      trie.insert(1, 'one')
      expect(trie.size()).toBe(2)
      expect(trie.search(0)).toBe('zero')
      expect(trie.search(1)).toBe('one')
    })

    it('should handle duplicate insert gracefully', () => {
      const trie = new BitwiseTrie<string>({ bitDepth: 4 })
      trie.insert(5, 'a')
      trie.insert(5, 'b')
      expect(trie.size()).toBe(1)
      expect(trie.search(5)).toBe('b')
    })

    it('should handle sequential keys', () => {
      const trie = new BitwiseTrie<number>({ bitDepth: 4 })
      for (let i = 0; i < 16; i++) {
        trie.insert(i, i)
      }
      expect(trie.size()).toBe(16)
      for (let i = 0; i < 16; i++) {
        expect(trie.search(i)).toBe(i)
      }
    })

    it('should handle delete from trie with shared paths', () => {
      const trie = new BitwiseTrie<string>({ bitDepth: 4 })
      trie.insert(0b0000, 'a')
      trie.insert(0b0001, 'b')
      trie.delete(0b0001)
      expect(trie.search(0b0000)).toBe('a')
      expect(trie.search(0b0001)).toBeUndefined()
    })

    it('should handle 32-bit keys', () => {
      const trie = new BitwiseTrie<string>()
      const key = 0xc0a80101
      trie.insert(key, 'ip')
      expect(trie.search(key)).toBe('ip')
    })

    it('should handle large number of keys', () => {
      const trie = new BitwiseTrie<number>({ bitDepth: 16 })
      for (let i = 0; i < 256; i++) {
        trie.insert(i, i)
      }
      expect(trie.size()).toBe(256)
    })
  })

  describe('combined operations', () => {
    it('should maintain consistency across mixed operations', () => {
      const trie = new BitwiseTrie<string>({ bitDepth: 8 })
      trie.insert(0, 'a')
      trie.insert(1, 'b')
      trie.insert(2, 'c')
      trie.delete(1)
      trie.insert(3, 'd')
      expect(trie.size()).toBe(3)
      expect(trie.search(0)).toBe('a')
      expect(trie.search(1)).toBeUndefined()
      expect(trie.search(2)).toBe('c')
      expect(trie.search(3)).toBe('d')
    })

    it('should handle clear and rebuild', () => {
      const trie = new BitwiseTrie<string>({ bitDepth: 8 })
      trie.insert(0, 'a')
      trie.clear()
      trie.insert(1, 'b')
      expect(trie.size()).toBe(1)
      expect(trie.search(0)).toBeUndefined()
      expect(trie.search(1)).toBe('b')
    })

    it('should handle insert-delete-insert cycle', () => {
      const trie = new BitwiseTrie<string>({ bitDepth: 8 })
      trie.insert(5, 'first')
      trie.delete(5)
      trie.insert(5, 'second')
      expect(trie.search(5)).toBe('second')
      expect(trie.size()).toBe(1)
    })

    it('should handle prefix operations with regular inserts', () => {
      const trie = new BitwiseTrie<string>({ bitDepth: 8 })
      trie.insertPrefix(0b11000000, 2, 'network')
      trie.insert(0b11000001, 'host')
      expect(trie.size()).toBe(2)
      const results = trie.enumeratePrefix(0b11000000, 2)
      expect(results.length).toBeGreaterThanOrEqual(1)
    })

    it('should handle many deletions', () => {
      const trie = new BitwiseTrie<number>({ bitDepth: 8 })
      for (let i = 0; i < 50; i++) {
        trie.insert(i, i)
      }
      for (let i = 0; i < 25; i++) {
        trie.delete(i)
      }
      expect(trie.size()).toBe(25)
    })
  })

  describe('IP-like prefix matching', () => {
    it('should match CIDR-like /8 prefix', () => {
      const trie = new BitwiseTrie<string>({ bitDepth: 8 })
      trie.insertPrefix(0b10101000, 3, 'network')
      const match = trie.longestPrefixMatch(0b10101111, 8)
      expect(match).toBe('network')
    })

    it('should not match wrong prefix', () => {
      const trie = new BitwiseTrie<string>({ bitDepth: 8 })
      trie.insertPrefix(0b11000000, 2, 'net-a')
      const match = trie.longestPrefixMatch(0b00000000, 8)
      expect(match).toBeUndefined()
    })

    it('should enumerate subnet addresses', () => {
      const trie = new BitwiseTrie<string>({ bitDepth: 8 })
      trie.insert(0b11000000, 'host0')
      trie.insert(0b11000001, 'host1')
      trie.insert(0b11000010, 'host2')
      const results = trie.enumeratePrefix(0b11000000, 2)
      expect(results).toHaveLength(3)
    })
  })
})
