import { describe, it, expect, beforeEach } from 'vitest'
import { TrieMap3 } from '../../src/core/trie-map-3/index.js'

describe('TrieMap3', () => {
  let trie: TrieMap3<number>

  beforeEach(() => {
    trie = new TrieMap3<number>()
  })

  // ─── Constructor ───

  describe('constructor', () => {
    it('should create an empty trie map', () => {
      const t = new TrieMap3<string>()
      expect(t.size).toBe(0)
    })

    it('should report isEmpty as true for new instance', () => {
      expect(trie.isEmpty()).toBe(true)
    })
  })

  // ─── set and get ───

  describe('set and get', () => {
    it('should set and get a value', () => {
      trie.set('abc', 42)
      expect(trie.get('abc')).toBe(42)
    })

    it('should return undefined for missing key', () => {
      expect(trie.get('missing')).toBeUndefined()
    })

    it('should return undefined for partial key match', () => {
      trie.set('abc', 1)
      expect(trie.get('ab')).toBeUndefined()
    })

    it('should handle empty string key', () => {
      trie.set('', 99)
      expect(trie.get('')).toBe(99)
    })

    it('should overwrite existing value', () => {
      trie.set('key', 1)
      trie.set('key', 2)
      expect(trie.get('key')).toBe(2)
    })

    it('should not increment size on overwrite', () => {
      trie.set('key', 1)
      expect(trie.size).toBe(1)
      trie.set('key', 2)
      expect(trie.size).toBe(1)
    })

    it('should handle single character keys', () => {
      trie.set('a', 1)
      trie.set('b', 2)
      expect(trie.get('a')).toBe(1)
      expect(trie.get('b')).toBe(2)
    })

    it('should handle unicode keys', () => {
      trie.set('café', 1)
      trie.set('日本語', 2)
      expect(trie.get('café')).toBe(1)
      expect(trie.get('日本語')).toBe(2)
    })
  })

  // ─── has ───

  describe('has', () => {
    it('should return true for existing key', () => {
      trie.set('abc', 1)
      expect(trie.has('abc')).toBe(true)
    })

    it('should return false for missing key', () => {
      expect(trie.has('abc')).toBe(false)
    })

    it('should return false for prefix that is not a key', () => {
      trie.set('abc', 1)
      expect(trie.has('ab')).toBe(false)
    })

    it('should return true for empty string key if set', () => {
      trie.set('', 1)
      expect(trie.has('')).toBe(true)
    })
  })

  // ─── delete ───

  describe('delete', () => {
    it('should delete an existing key and return true', () => {
      trie.set('abc', 1)
      expect(trie.delete('abc')).toBe(true)
      expect(trie.get('abc')).toBeUndefined()
    })

    it('should return false for missing key', () => {
      expect(trie.delete('abc')).toBe(false)
    })

    it('should decrement size on delete', () => {
      trie.set('a', 1)
      trie.set('b', 2)
      expect(trie.size).toBe(2)
      trie.delete('a')
      expect(trie.size).toBe(1)
    })

    it('should not affect sibling keys', () => {
      trie.set('ab', 1)
      trie.set('ac', 2)
      trie.delete('ab')
      expect(trie.get('ab')).toBeUndefined()
      expect(trie.get('ac')).toBe(2)
    })

    it('should not affect parent prefix', () => {
      trie.set('a', 1)
      trie.set('ab', 2)
      trie.delete('ab')
      expect(trie.get('a')).toBe(1)
      expect(trie.get('ab')).toBeUndefined()
    })

    it('should handle delete of all keys', () => {
      trie.set('a', 1)
      trie.delete('a')
      expect(trie.size).toBe(0)
      expect(trie.isEmpty()).toBe(true)
    })

    it('should allow re-insert after delete', () => {
      trie.set('abc', 1)
      trie.delete('abc')
      trie.set('abc', 2)
      expect(trie.get('abc')).toBe(2)
      expect(trie.size).toBe(1)
    })

    it('should handle delete of empty string key', () => {
      trie.set('', 1)
      expect(trie.delete('')).toBe(true)
      expect(trie.get('')).toBeUndefined()
    })
  })

  // ─── size and isEmpty ───

  describe('size and isEmpty', () => {
    it('should track size correctly across operations', () => {
      expect(trie.size).toBe(0)
      trie.set('a', 1)
      expect(trie.size).toBe(1)
      trie.set('b', 2)
      expect(trie.size).toBe(2)
      trie.delete('a')
      expect(trie.size).toBe(1)
    })

    it('should report isEmpty correctly', () => {
      expect(trie.isEmpty()).toBe(true)
      trie.set('x', 1)
      expect(trie.isEmpty()).toBe(false)
      trie.delete('x')
      expect(trie.isEmpty()).toBe(true)
    })
  })

  // ─── clear ───

  describe('clear', () => {
    it('should clear all entries', () => {
      trie.set('a', 1)
      trie.set('b', 2)
      trie.set('c', 3)
      trie.clear()
      expect(trie.size).toBe(0)
      expect(trie.isEmpty()).toBe(true)
    })

    it('should allow insertions after clear', () => {
      trie.set('a', 1)
      trie.clear()
      trie.set('b', 2)
      expect(trie.get('b')).toBe(2)
      expect(trie.size).toBe(1)
    })
  })

  // ─── keysWithPrefix ───

  describe('keysWithPrefix', () => {
    it('should return keys with given prefix', () => {
      trie.set('apple', 1)
      trie.set('application', 2)
      trie.set('banana', 3)
      const keys = trie.keysWithPrefix('app')
      expect(keys).toContain('apple')
      expect(keys).toContain('application')
      expect(keys).not.toContain('banana')
    })

    it('should return empty array for non-existent prefix', () => {
      expect(trie.keysWithPrefix('xyz')).toEqual([])
    })

    it('should return all keys for empty prefix', () => {
      trie.set('a', 1)
      trie.set('b', 2)
      const keys = trie.keysWithPrefix('')
      expect(keys).toHaveLength(2)
      expect(keys).toContain('a')
      expect(keys).toContain('b')
    })

    it('should return key that exactly matches prefix', () => {
      trie.set('app', 0)
      trie.set('apple', 1)
      const keys = trie.keysWithPrefix('app')
      expect(keys).toContain('app')
      expect(keys).toContain('apple')
    })
  })

  // ─── valuesWithPrefix ───

  describe('valuesWithPrefix', () => {
    it('should return values for keys with given prefix', () => {
      trie.set('apple', 1)
      trie.set('application', 2)
      trie.set('banana', 3)
      const values = trie.valuesWithPrefix('app')
      expect(values).toContain(1)
      expect(values).toContain(2)
      expect(values).not.toContain(3)
    })

    it('should return empty array for non-existent prefix', () => {
      expect(trie.valuesWithPrefix('xyz')).toEqual([])
    })

    it('should return all values for empty prefix', () => {
      trie.set('a', 10)
      trie.set('b', 20)
      const values = trie.valuesWithPrefix('')
      expect(values).toHaveLength(2)
      expect(values).toContain(10)
      expect(values).toContain(20)
    })
  })

  // ─── entriesWithPrefix ───

  describe('entriesWithPrefix', () => {
    it('should return entries with given prefix', () => {
      trie.set('apple', 1)
      trie.set('application', 2)
      trie.set('banana', 3)
      const entries = trie.entriesWithPrefix('app')
      expect(entries).toContainEqual(['apple', 1])
      expect(entries).toContainEqual(['application', 2])
    })

    it('should return empty array for non-existent prefix', () => {
      expect(trie.entriesWithPrefix('xyz')).toEqual([])
    })

    it('should return all entries for empty prefix', () => {
      trie.set('x', 100)
      trie.set('y', 200)
      const entries = trie.entriesWithPrefix('')
      expect(entries).toHaveLength(2)
    })
  })

  // ─── startsWith ───

  describe('startsWith', () => {
    it('should return true for existing prefix', () => {
      trie.set('apple', 1)
      expect(trie.startsWith('app')).toBe(true)
      expect(trie.startsWith('apple')).toBe(true)
    })

    it('should return false for non-existent prefix', () => {
      trie.set('apple', 1)
      expect(trie.startsWith('ban')).toBe(false)
    })

    it('should return true for empty prefix when trie has entries', () => {
      trie.set('a', 1)
      expect(trie.startsWith('')).toBe(true)
    })

    it('should return true for empty prefix even on empty trie (root always exists)', () => {
      expect(trie.startsWith('')).toBe(true)
    })
  })

  // ─── longestPrefixOf ───

  describe('longestPrefixOf', () => {
    it('should return longest matching prefix key', () => {
      trie.set('a', 1)
      trie.set('ab', 2)
      trie.set('abc', 3)
      expect(trie.longestPrefixOf('abcd')).toBe('abc')
    })

    it('should return empty string if root has value', () => {
      trie.set('', 0)
      trie.set('a', 1)
      expect(trie.longestPrefixOf('bcd')).toBe('')
    })

    it('should return undefined when no prefix matches', () => {
      trie.set('xyz', 1)
      expect(trie.longestPrefixOf('abc')).toBeUndefined()
    })

    it('should return exact match', () => {
      trie.set('hello', 1)
      expect(trie.longestPrefixOf('hello')).toBe('hello')
    })

    it('should return undefined for empty trie', () => {
      expect(trie.longestPrefixOf('anything')).toBeUndefined()
    })

    it('should handle single character match', () => {
      trie.set('a', 1)
      trie.set('abc', 3)
      expect(trie.longestPrefixOf('ab')).toBe('a')
    })
  })

  // ─── Edge cases ───

  describe('edge cases', () => {
    it('should handle many keys with shared prefix', () => {
      const keys = ['a', 'ab', 'abc', 'abcd', 'abcde']
      keys.forEach((k, i) => trie.set(k, i))
      expect(trie.size).toBe(5)
      keys.forEach((k, i) => expect(trie.get(k)).toBe(i))
    })

    it('should handle keys that are prefixes of each other', () => {
      trie.set('a', 1)
      trie.set('ab', 2)
      trie.set('abc', 3)
      trie.delete('ab')
      expect(trie.get('a')).toBe(1)
      expect(trie.get('ab')).toBeUndefined()
      expect(trie.get('abc')).toBe(3)
    })

    it('should handle negative numbers as values', () => {
      trie.set('neg', -42)
      expect(trie.get('neg')).toBe(-42)
    })

    it('should handle zero as a value', () => {
      trie.set('zero', 0)
      expect(trie.has('zero')).toBe(true)
      expect(trie.get('zero')).toBe(0)
    })

    it('should handle duplicate set operations', () => {
      trie.set('key', 1)
      trie.set('key', 1)
      expect(trie.size).toBe(1)
    })
  })
})
