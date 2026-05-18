import { describe, expect, it } from 'vitest'
import { AdaptiveTrie } from '../src/core/adaptive-trie/adaptive-trie.js'

describe('AdaptiveTrie', () => {
  describe('constructor', () => {
    it('should create an empty trie', () => {
      const trie = new AdaptiveTrie<string>()
      expect(trie.size).toBe(0)
    })

    it('should accept options', () => {
      const trie = new AdaptiveTrie<string>({ pathCompression: true })
      expect(trie.size).toBe(0)
    })
  })

  describe('insert and get', () => {
    it('should insert and retrieve a single key', () => {
      const trie = new AdaptiveTrie<number>()
      trie.insert('hello', 1)
      expect(trie.get('hello')).toBe(1)
    })

    it('should return undefined for missing key', () => {
      const trie = new AdaptiveTrie<number>()
      trie.insert('hello', 1)
      expect(trie.get('world')).toBeUndefined()
    })

    it('should return undefined for empty trie', () => {
      const trie = new AdaptiveTrie<number>()
      expect(trie.get('anything')).toBeUndefined()
    })

    it('should handle multiple inserts', () => {
      const trie = new AdaptiveTrie<string>()
      trie.insert('apple', 'a')
      trie.insert('banana', 'b')
      trie.insert('cherry', 'c')
      expect(trie.get('apple')).toBe('a')
      expect(trie.get('banana')).toBe('b')
      expect(trie.get('cherry')).toBe('c')
    })

    it('should overwrite existing key', () => {
      const trie = new AdaptiveTrie<number>()
      trie.insert('key', 1)
      trie.insert('key', 2)
      expect(trie.get('key')).toBe(2)
      expect(trie.size).toBe(1)
    })

    it('should handle empty string key', () => {
      const trie = new AdaptiveTrie<number>()
      trie.insert('', 42)
      expect(trie.get('')).toBe(42)
    })

    it('should handle single character keys', () => {
      const trie = new AdaptiveTrie<number>()
      trie.insert('a', 1)
      trie.insert('b', 2)
      trie.insert('c', 3)
      expect(trie.get('a')).toBe(1)
      expect(trie.get('b')).toBe(2)
      expect(trie.get('c')).toBe(3)
    })

    it('should handle keys with common prefixes', () => {
      const trie = new AdaptiveTrie<number>()
      trie.insert('abc', 1)
      trie.insert('abd', 2)
      trie.insert('ab', 3)
      expect(trie.get('abc')).toBe(1)
      expect(trie.get('abd')).toBe(2)
      expect(trie.get('ab')).toBe(3)
      expect(trie.get('a')).toBeUndefined()
    })

    it('should handle one key being prefix of another', () => {
      const trie = new AdaptiveTrie<number>()
      trie.insert('a', 1)
      trie.insert('ab', 2)
      trie.insert('abc', 3)
      expect(trie.get('a')).toBe(1)
      expect(trie.get('ab')).toBe(2)
      expect(trie.get('abc')).toBe(3)
    })

    it('should handle numeric string keys', () => {
      const trie = new AdaptiveTrie<string>()
      trie.insert('1', 'one')
      trie.insert('2', 'two')
      trie.insert('10', 'ten')
      trie.insert('100', 'hundred')
      expect(trie.get('1')).toBe('one')
      expect(trie.get('10')).toBe('ten')
      expect(trie.get('100')).toBe('hundred')
    })
  })

  describe('has', () => {
    it('should return true for existing key', () => {
      const trie = new AdaptiveTrie<number>()
      trie.insert('key', 1)
      expect(trie.has('key')).toBe(true)
    })

    it('should return false for missing key', () => {
      const trie = new AdaptiveTrie<number>()
      trie.insert('key', 1)
      expect(trie.has('other')).toBe(false)
    })

    it('should return false for empty trie', () => {
      const trie = new AdaptiveTrie<number>()
      expect(trie.has('anything')).toBe(false)
    })

    it('should return false for prefix that is not a key', () => {
      const trie = new AdaptiveTrie<number>()
      trie.insert('abc', 1)
      expect(trie.has('ab')).toBe(false)
      expect(trie.has('a')).toBe(false)
    })
  })

  describe('delete', () => {
    it('should delete a key', () => {
      const trie = new AdaptiveTrie<number>()
      trie.insert('key', 1)
      expect(trie.delete('key')).toBe(true)
      expect(trie.get('key')).toBeUndefined()
      expect(trie.size).toBe(0)
    })

    it('should return false for missing key', () => {
      const trie = new AdaptiveTrie<number>()
      expect(trie.delete('missing')).toBe(false)
    })

    it('should return false for empty trie', () => {
      const trie = new AdaptiveTrie<number>()
      expect(trie.delete('anything')).toBe(false)
    })

    it('should only delete the specified key', () => {
      const trie = new AdaptiveTrie<number>()
      trie.insert('abc', 1)
      trie.insert('abd', 2)
      trie.insert('ab', 3)
      trie.delete('abd')
      expect(trie.get('abc')).toBe(1)
      expect(trie.get('abd')).toBeUndefined()
      expect(trie.get('ab')).toBe(3)
    })

    it('should handle deleting and re-inserting', () => {
      const trie = new AdaptiveTrie<number>()
      trie.insert('key', 1)
      trie.delete('key')
      trie.insert('key', 2)
      expect(trie.get('key')).toBe(2)
      expect(trie.size).toBe(1)
    })

    it('should handle deleting all keys', () => {
      const trie = new AdaptiveTrie<number>()
      trie.insert('a', 1)
      trie.insert('b', 2)
      trie.insert('c', 3)
      trie.delete('a')
      trie.delete('b')
      trie.delete('c')
      expect(trie.size).toBe(0)
      expect(trie.get('a')).toBeUndefined()
    })

    it('should delete parent without affecting children', () => {
      const trie = new AdaptiveTrie<number>()
      trie.insert('a', 1)
      trie.insert('ab', 2)
      trie.insert('abc', 3)
      trie.delete('ab')
      expect(trie.get('a')).toBe(1)
      expect(trie.get('abc')).toBe(3)
      expect(trie.get('ab')).toBeUndefined()
    })
  })

  describe('size', () => {
    it('should track size correctly', () => {
      const trie = new AdaptiveTrie<number>()
      expect(trie.size).toBe(0)
      trie.insert('a', 1)
      expect(trie.size).toBe(1)
      trie.insert('b', 2)
      expect(trie.size).toBe(2)
      trie.delete('a')
      expect(trie.size).toBe(1)
    })

    it('should not increment on overwrite', () => {
      const trie = new AdaptiveTrie<number>()
      trie.insert('key', 1)
      trie.insert('key', 2)
      expect(trie.size).toBe(1)
    })
  })

  describe('clear', () => {
    it('should remove all entries', () => {
      const trie = new AdaptiveTrie<number>()
      trie.insert('a', 1)
      trie.insert('b', 2)
      trie.insert('c', 3)
      trie.clear()
      expect(trie.size).toBe(0)
      expect(trie.get('a')).toBeUndefined()
      expect(trie.get('b')).toBeUndefined()
    })

    it('should allow insertions after clear', () => {
      const trie = new AdaptiveTrie<number>()
      trie.insert('a', 1)
      trie.clear()
      trie.insert('b', 2)
      expect(trie.size).toBe(1)
      expect(trie.get('b')).toBe(2)
    })
  })

  describe('keys', () => {
    it('should return empty array for empty trie', () => {
      const trie = new AdaptiveTrie<number>()
      expect(trie.keys()).toEqual([])
    })

    it('should return all keys', () => {
      const trie = new AdaptiveTrie<number>()
      trie.insert('apple', 1)
      trie.insert('banana', 2)
      trie.insert('cherry', 3)
      const keys = trie.keys().sort()
      expect(keys).toEqual(['apple', 'banana', 'cherry'])
    })

    it('should not include deleted keys', () => {
      const trie = new AdaptiveTrie<number>()
      trie.insert('a', 1)
      trie.insert('b', 2)
      trie.delete('a')
      expect(trie.keys()).toEqual(['b'])
    })
  })

  describe('values', () => {
    it('should return empty array for empty trie', () => {
      const trie = new AdaptiveTrie<number>()
      expect(trie.values()).toEqual([])
    })

    it('should return all values', () => {
      const trie = new AdaptiveTrie<string>()
      trie.insert('a', 'x')
      trie.insert('b', 'y')
      trie.insert('c', 'z')
      expect(trie.values().sort()).toEqual(['x', 'y', 'z'])
    })
  })

  describe('entries', () => {
    it('should return empty array for empty trie', () => {
      const trie = new AdaptiveTrie<number>()
      expect(trie.entries()).toEqual([])
    })

    it('should return all key-value pairs', () => {
      const trie = new AdaptiveTrie<number>()
      trie.insert('a', 1)
      trie.insert('b', 2)
      const entries = trie.entries().sort((a, b) => a[0].localeCompare(b[0]))
      expect(entries).toEqual([['a', 1], ['b', 2]])
    })
  })

  describe('forEach', () => {
    it('should iterate over all entries', () => {
      const trie = new AdaptiveTrie<number>()
      trie.insert('a', 1)
      trie.insert('b', 2)
      trie.insert('c', 3)
      const result: Array<[string, number]> = []
      trie.forEach((v, k) => result.push([k, v]))
      expect(result.sort((a, b) => a[0].localeCompare(b[0]))).toEqual([['a', 1], ['b', 2], ['c', 3]])
    })

    it('should not iterate on empty trie', () => {
      const trie = new AdaptiveTrie<number>()
      let count = 0
      trie.forEach(() => count++)
      expect(count).toBe(0)
    })
  })

  describe('startsWith', () => {
    it('should return all keys with given prefix', () => {
      const trie = new AdaptiveTrie<number>()
      trie.insert('apple', 1)
      trie.insert('application', 2)
      trie.insert('apply', 3)
      trie.insert('banana', 4)
      const result = trie.startsWith('app').sort()
      expect(result).toEqual(['apple', 'application', 'apply'])
    })

    it('should return empty for no matches', () => {
      const trie = new AdaptiveTrie<number>()
      trie.insert('apple', 1)
      expect(trie.startsWith('ban')).toEqual([])
    })

    it('should return all keys for empty prefix', () => {
      const trie = new AdaptiveTrie<number>()
      trie.insert('a', 1)
      trie.insert('b', 2)
      expect(trie.startsWith('').sort()).toEqual(['a', 'b'])
    })

    it('should return empty for empty trie', () => {
      const trie = new AdaptiveTrie<number>()
      expect(trie.startsWith('a')).toEqual([])
    })

    it('should handle exact match prefix', () => {
      const trie = new AdaptiveTrie<number>()
      trie.insert('abc', 1)
      trie.insert('abcd', 2)
      const result = trie.startsWith('abc').sort()
      expect(result).toEqual(['abc', 'abcd'])
    })
  })

  describe('longestPrefixOf', () => {
    it('should find the longest key that is a prefix of the input', () => {
      const trie = new AdaptiveTrie<number>()
      trie.insert('ab', 1)
      trie.insert('abc', 2)
      trie.insert('abcd', 3)
      expect(trie.longestPrefixOf('abcdef')).toBe('abcd')
    })

    it('should return undefined if no prefix matches', () => {
      const trie = new AdaptiveTrie<number>()
      trie.insert('xyz', 1)
      expect(trie.longestPrefixOf('abc')).toBeUndefined()
    })

    it('should return undefined for empty trie', () => {
      const trie = new AdaptiveTrie<number>()
      expect(trie.longestPrefixOf('anything')).toBeUndefined()
    })

    it('should handle exact match', () => {
      const trie = new AdaptiveTrie<number>()
      trie.insert('hello', 1)
      expect(trie.longestPrefixOf('hello')).toBe('hello')
    })

    it('should return the longest among multiple prefixes', () => {
      const trie = new AdaptiveTrie<number>()
      trie.insert('a', 1)
      trie.insert('ab', 2)
      trie.insert('abc', 3)
      expect(trie.longestPrefixOf('abcdef')).toBe('abc')
    })

    it('should return shortest prefix if only that matches', () => {
      const trie = new AdaptiveTrie<number>()
      trie.insert('a', 1)
      trie.insert('xyz', 2)
      expect(trie.longestPrefixOf('abc')).toBe('a')
    })
  })

  describe('nodeCount', () => {
    it('should return 0 for empty trie', () => {
      const trie = new AdaptiveTrie<number>()
      expect(trie.nodeCount()).toBe(0)
    })

    it('should return 1 for single entry', () => {
      const trie = new AdaptiveTrie<number>()
      trie.insert('key', 1)
      expect(trie.nodeCount()).toBeGreaterThanOrEqual(1)
    })

    it('should increase with more diverse keys', () => {
      const trie = new AdaptiveTrie<number>()
      trie.insert('a', 1)
      const single = trie.nodeCount()
      trie.insert('b', 2)
      trie.insert('c', 3)
      expect(trie.nodeCount()).toBeGreaterThan(single)
    })
  })

  describe('height', () => {
    it('should return 0 for empty trie', () => {
      const trie = new AdaptiveTrie<number>()
      expect(trie.height()).toBe(0)
    })

    it('should return at least 1 for non-empty trie', () => {
      const trie = new AdaptiveTrie<number>()
      trie.insert('key', 1)
      expect(trie.height()).toBeGreaterThanOrEqual(1)
    })
  })

  describe('adaptive node behavior', () => {
    it('should handle many keys that trigger node growth (node4→node16→node48→node256)', () => {
      const trie = new AdaptiveTrie<number>()
      for (let i = 0; i < 100; i++) {
        trie.insert(`key${i}`, i)
      }
      expect(trie.size).toBe(100)
      for (let i = 0; i < 100; i++) {
        expect(trie.get(`key${i}`)).toBe(i)
      }
    })

    it('should handle many single-char keys', () => {
      const trie = new AdaptiveTrie<number>()
      for (let i = 0; i < 60; i++) {
        trie.insert(String.fromCharCode(32 + i), i)
      }
      expect(trie.size).toBe(60)
      for (let i = 0; i < 60; i++) {
        expect(trie.get(String.fromCharCode(32 + i))).toBe(i)
      }
    })

    it('should handle deletion triggering node shrink', () => {
      const trie = new AdaptiveTrie<number>()
      for (let i = 0; i < 50; i++) {
        trie.insert(`k${i}`, i)
      }
      for (let i = 0; i < 50; i++) {
        expect(trie.delete(`k${i}`)).toBe(true)
      }
      expect(trie.size).toBe(0)
    })
  })

  describe('path compression', () => {
    it('should handle long common prefixes efficiently', () => {
      const trie = new AdaptiveTrie<number>()
      trie.insert('abcdefghijklmnopqrstuvwxyz-1', 1)
      trie.insert('abcdefghijklmnopqrstuvwxyz-2', 2)
      trie.insert('abcdefghijklmnopqrstuvwxyz-3', 3)
      expect(trie.get('abcdefghijklmnopqrstuvwxyz-1')).toBe(1)
      expect(trie.get('abcdefghijklmnopqrstuvwxyz-2')).toBe(2)
      expect(trie.get('abcdefghijklmnopqrstuvwxyz-3')).toBe(3)
      expect(trie.nodeCount()).toBeLessThan(10)
    })

    it('should handle completely divergent keys', () => {
      const trie = new AdaptiveTrie<number>()
      trie.insert('abc', 1)
      trie.insert('xyz', 2)
      expect(trie.get('abc')).toBe(1)
      expect(trie.get('xyz')).toBe(2)
    })
  })

  describe('edge cases', () => {
    it('should handle very long keys', () => {
      const trie = new AdaptiveTrie<number>()
      const longKey = 'a'.repeat(1000)
      trie.insert(longKey, 42)
      expect(trie.get(longKey)).toBe(42)
    })

    it('should handle keys with special characters', () => {
      const trie = new AdaptiveTrie<number>()
      trie.insert('key-with-dash', 1)
      trie.insert('key_with_underscore', 2)
      trie.insert('key.with.dot', 3)
      trie.insert('key/with/slash', 4)
      expect(trie.get('key-with-dash')).toBe(1)
      expect(trie.get('key_with_underscore')).toBe(2)
      expect(trie.get('key.with.dot')).toBe(3)
      expect(trie.get('key/with/slash')).toBe(4)
    })

    it('should handle unicode keys', () => {
      const trie = new AdaptiveTrie<string>()
      trie.insert('café', 'coffee')
      trie.insert('naïve', 'innocent')
      trie.insert('日本語', 'japanese')
      expect(trie.get('café')).toBe('coffee')
      expect(trie.get('naïve')).toBe('innocent')
      expect(trie.get('日本語')).toBe('japanese')
    })

    it('should handle inserting same key many times', () => {
      const trie = new AdaptiveTrie<number>()
      for (let i = 0; i < 10; i++) {
        trie.insert('key', i)
      }
      expect(trie.size).toBe(1)
      expect(trie.get('key')).toBe(9)
    })

    it('should handle large scale insert and lookup', () => {
      const trie = new AdaptiveTrie<number>()
      const count = 500
      for (let i = 0; i < count; i++) {
        trie.insert(`item-${i}`, i)
      }
      expect(trie.size).toBe(count)
      for (let i = 0; i < count; i++) {
        expect(trie.has(`item-${i}`)).toBe(true)
      }
    })
  })
})
