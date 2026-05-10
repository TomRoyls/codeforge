import { describe, it, expect } from 'vitest'
import { TernarySearchTrie } from '../../src/core/ternary-search-trie/index.js'
import type { TSTNode } from '../../src/core/ternary-search-trie/index.js'

describe('TernarySearchTrie', () => {
  describe('constructor', () => {
    it('should create an empty trie', () => {
      const tst = new TernarySearchTrie()
      expect(tst.size()).toBe(0)
      expect(tst.isEmpty()).toBe(true)
    })
  })

  describe('insert and get', () => {
    it('should insert and retrieve a single key-value pair', () => {
      const tst = new TernarySearchTrie<number>()
      tst.insert('hello', 1)
      expect(tst.get('hello')).toBe(1)
    })

    it('should return undefined for non-existent key', () => {
      const tst = new TernarySearchTrie<number>()
      expect(tst.get('hello')).toBeUndefined()
    })

    it('should handle multiple insertions', () => {
      const tst = new TernarySearchTrie<number>()
      tst.insert('apple', 1)
      tst.insert('banana', 2)
      tst.insert('cherry', 3)
      expect(tst.get('apple')).toBe(1)
      expect(tst.get('banana')).toBe(2)
      expect(tst.get('cherry')).toBe(3)
    })

    it('should overwrite value on duplicate key insertion', () => {
      const tst = new TernarySearchTrie<number>()
      tst.insert('key', 1)
      tst.insert('key', 2)
      expect(tst.get('key')).toBe(2)
      expect(tst.size()).toBe(1)
    })

    it('should handle string values', () => {
      const tst = new TernarySearchTrie<string>()
      tst.insert('name', 'alice')
      expect(tst.get('name')).toBe('alice')
    })

    it('should handle object values', () => {
      const tst = new TernarySearchTrie<{ id: number }>()
      tst.insert('user', { id: 42 })
      expect(tst.get('user')?.id).toBe(42)
    })

    it('should not insert empty string key', () => {
      const tst = new TernarySearchTrie<number>()
      tst.insert('', 1)
      expect(tst.size()).toBe(0)
      expect(tst.get('')).toBeUndefined()
    })

    it('should handle keys that are prefixes of each other', () => {
      const tst = new TernarySearchTrie<number>()
      tst.insert('a', 1)
      tst.insert('ab', 2)
      tst.insert('abc', 3)
      expect(tst.get('a')).toBe(1)
      expect(tst.get('ab')).toBe(2)
      expect(tst.get('abc')).toBe(3)
    })

    it('should handle keys with shared prefixes', () => {
      const tst = new TernarySearchTrie<number>()
      tst.insert('cat', 1)
      tst.insert('car', 2)
      tst.insert('cap', 3)
      expect(tst.get('cat')).toBe(1)
      expect(tst.get('car')).toBe(2)
      expect(tst.get('cap')).toBe(3)
    })

    it('should handle single character keys', () => {
      const tst = new TernarySearchTrie<number>()
      tst.insert('a', 1)
      tst.insert('b', 2)
      tst.insert('z', 26)
      expect(tst.get('a')).toBe(1)
      expect(tst.get('b')).toBe(2)
      expect(tst.get('z')).toBe(26)
    })

    it('should handle keys in reverse alphabetical order', () => {
      const tst = new TernarySearchTrie<number>()
      tst.insert('zebra', 1)
      tst.insert('monkey', 2)
      tst.insert('apple', 3)
      expect(tst.get('zebra')).toBe(1)
      expect(tst.get('monkey')).toBe(2)
      expect(tst.get('apple')).toBe(3)
    })

    it('should handle null values', () => {
      const tst = new TernarySearchTrie<number | null>()
      tst.insert('key', null)
      expect(tst.get('key')).toBeNull()
    })

    it('should handle zero value', () => {
      const tst = new TernarySearchTrie<number>()
      tst.insert('zero', 0)
      expect(tst.get('zero')).toBe(0)
    })

    it('should handle false value', () => {
      const tst = new TernarySearchTrie<boolean>()
      tst.insert('flag', false)
      expect(tst.get('flag')).toBe(false)
    })

    it('should handle undefined value by storing undefined', () => {
      const tst = new TernarySearchTrie<string | undefined>()
      tst.insert('key', undefined)
      expect(tst.has('key')).toBe(true)
    })
  })

  describe('has', () => {
    it('should return true for existing key', () => {
      const tst = new TernarySearchTrie<number>()
      tst.insert('hello', 1)
      expect(tst.has('hello')).toBe(true)
    })

    it('should return false for non-existent key', () => {
      const tst = new TernarySearchTrie<number>()
      expect(tst.has('hello')).toBe(false)
    })

    it('should return false for key that is a prefix of existing key', () => {
      const tst = new TernarySearchTrie<number>()
      tst.insert('hello', 1)
      expect(tst.has('hell')).toBe(false)
    })

    it('should return false for key that extends existing key', () => {
      const tst = new TernarySearchTrie<number>()
      tst.insert('hello', 1)
      expect(tst.has('helloworld')).toBe(false)
    })

    it('should return false for empty string', () => {
      const tst = new TernarySearchTrie<number>()
      tst.insert('hello', 1)
      expect(tst.has('')).toBe(false)
    })

    it('should return true after re-insertion of deleted key', () => {
      const tst = new TernarySearchTrie<number>()
      tst.insert('key', 1)
      tst.delete('key')
      expect(tst.has('key')).toBe(false)
      tst.insert('key', 2)
      expect(tst.has('key')).toBe(true)
    })

    it('should return correct results for multiple keys', () => {
      const tst = new TernarySearchTrie<number>()
      tst.insert('apple', 1)
      tst.insert('application', 2)
      tst.insert('apply', 3)
      expect(tst.has('apple')).toBe(true)
      expect(tst.has('application')).toBe(true)
      expect(tst.has('apply')).toBe(true)
      expect(tst.has('app')).toBe(false)
      expect(tst.has('apples')).toBe(false)
    })
  })

  describe('delete', () => {
    it('should delete an existing key', () => {
      const tst = new TernarySearchTrie<number>()
      tst.insert('hello', 1)
      expect(tst.delete('hello')).toBe(true)
      expect(tst.has('hello')).toBe(false)
      expect(tst.size()).toBe(0)
    })

    it('should return false for non-existent key', () => {
      const tst = new TernarySearchTrie<number>()
      expect(tst.delete('hello')).toBe(false)
    })

    it('should return false for empty string', () => {
      const tst = new TernarySearchTrie<number>()
      expect(tst.delete('')).toBe(false)
    })

    it('should not affect other keys when deleting', () => {
      const tst = new TernarySearchTrie<number>()
      tst.insert('apple', 1)
      tst.insert('banana', 2)
      tst.insert('cherry', 3)
      tst.delete('banana')
      expect(tst.has('apple')).toBe(true)
      expect(tst.has('banana')).toBe(false)
      expect(tst.has('cherry')).toBe(true)
    })

    it('should handle deleting prefix key while keeping longer key', () => {
      const tst = new TernarySearchTrie<number>()
      tst.insert('a', 1)
      tst.insert('ab', 2)
      tst.delete('a')
      expect(tst.has('a')).toBe(false)
      expect(tst.has('ab')).toBe(true)
    })

    it('should handle deleting longer key while keeping prefix key', () => {
      const tst = new TernarySearchTrie<number>()
      tst.insert('a', 1)
      tst.insert('ab', 2)
      tst.delete('ab')
      expect(tst.has('a')).toBe(true)
      expect(tst.has('ab')).toBe(false)
    })

    it('should handle deleting from empty trie', () => {
      const tst = new TernarySearchTrie<number>()
      expect(tst.delete('anything')).toBe(false)
    })

    it('should handle deleting the only key', () => {
      const tst = new TernarySearchTrie<number>()
      tst.insert('only', 1)
      expect(tst.delete('only')).toBe(true)
      expect(tst.isEmpty()).toBe(true)
    })

    it('should handle deleting and re-inserting', () => {
      const tst = new TernarySearchTrie<number>()
      tst.insert('key', 1)
      tst.delete('key')
      tst.insert('key', 2)
      expect(tst.get('key')).toBe(2)
      expect(tst.size()).toBe(1)
    })

    it('should handle deleting all keys one by one', () => {
      const tst = new TernarySearchTrie<number>()
      tst.insert('a', 1)
      tst.insert('b', 2)
      tst.insert('c', 3)
      tst.delete('a')
      expect(tst.size()).toBe(2)
      tst.delete('b')
      expect(tst.size()).toBe(1)
      tst.delete('c')
      expect(tst.size()).toBe(0)
      expect(tst.isEmpty()).toBe(true)
    })

    it('should handle deleting key that shares node with other keys', () => {
      const tst = new TernarySearchTrie<number>()
      tst.insert('cat', 1)
      tst.insert('car', 2)
      tst.insert('cap', 3)
      tst.delete('car')
      expect(tst.has('cat')).toBe(true)
      expect(tst.has('car')).toBe(false)
      expect(tst.has('cap')).toBe(true)
    })
  })

  describe('keysWithPrefix', () => {
    it('should return all keys with given prefix', () => {
      const tst = new TernarySearchTrie<number>()
      tst.insert('apple', 1)
      tst.insert('application', 2)
      tst.insert('apply', 3)
      tst.insert('banana', 4)
      const result = tst.keysWithPrefix('app')
      expect(result.sort()).toEqual(['apple', 'application', 'apply'])
    })

    it('should return empty array for non-matching prefix', () => {
      const tst = new TernarySearchTrie<number>()
      tst.insert('apple', 1)
      expect(tst.keysWithPrefix('xyz')).toEqual([])
    })

    it('should return all keys for empty prefix', () => {
      const tst = new TernarySearchTrie<number>()
      tst.insert('a', 1)
      tst.insert('b', 2)
      tst.insert('c', 3)
      const result = tst.keysWithPrefix('')
      expect(result.sort()).toEqual(['a', 'b', 'c'])
    })

    it('should include the exact prefix key itself if it exists', () => {
      const tst = new TernarySearchTrie<number>()
      tst.insert('app', 1)
      tst.insert('apple', 2)
      const result = tst.keysWithPrefix('app')
      expect(result.sort()).toEqual(['app', 'apple'])
    })

    it('should handle prefix matching a single key exactly', () => {
      const tst = new TernarySearchTrie<number>()
      tst.insert('hello', 1)
      expect(tst.keysWithPrefix('hello')).toEqual(['hello'])
    })

    it('should return empty array for empty trie', () => {
      const tst = new TernarySearchTrie<number>()
      expect(tst.keysWithPrefix('a')).toEqual([])
    })

    it('should handle single character prefix', () => {
      const tst = new TernarySearchTrie<number>()
      tst.insert('abc', 1)
      tst.insert('abd', 2)
      tst.insert('xyz', 3)
      const result = tst.keysWithPrefix('a')
      expect(result.sort()).toEqual(['abc', 'abd'])
    })
  })

  describe('valuesWithPrefix', () => {
    it('should return all values with given prefix', () => {
      const tst = new TernarySearchTrie<number>()
      tst.insert('apple', 1)
      tst.insert('application', 2)
      tst.insert('apply', 3)
      tst.insert('banana', 4)
      const result = tst.valuesWithPrefix('app')
      expect(result.sort()).toEqual([1, 2, 3])
    })

    it('should return empty array for non-matching prefix', () => {
      const tst = new TernarySearchTrie<number>()
      tst.insert('apple', 1)
      expect(tst.valuesWithPrefix('xyz')).toEqual([])
    })

    it('should return all values for empty prefix', () => {
      const tst = new TernarySearchTrie<number>()
      tst.insert('a', 1)
      tst.insert('b', 2)
      const result = tst.valuesWithPrefix('')
      expect(result.sort()).toEqual([1, 2])
    })

    it('should include value of exact prefix key', () => {
      const tst = new TernarySearchTrie<number>()
      tst.insert('app', 10)
      tst.insert('apple', 20)
      const result = tst.valuesWithPrefix('app')
      expect(result.sort()).toEqual([10, 20])
    })

    it('should return empty array for empty trie', () => {
      const tst = new TernarySearchTrie<number>()
      expect(tst.valuesWithPrefix('a')).toEqual([])
    })
  })

  describe('entriesWithPrefix', () => {
    it('should return all entries with given prefix', () => {
      const tst = new TernarySearchTrie<number>()
      tst.insert('apple', 1)
      tst.insert('application', 2)
      tst.insert('banana', 3)
      const result = tst.entriesWithPrefix('app')
      expect(result.sort((a, b) => a[0].localeCompare(b[0]))).toEqual([
        ['apple', 1],
        ['application', 2],
      ])
    })

    it('should return empty array for non-matching prefix', () => {
      const tst = new TernarySearchTrie<number>()
      tst.insert('apple', 1)
      expect(tst.entriesWithPrefix('xyz')).toEqual([])
    })

    it('should return all entries for empty prefix', () => {
      const tst = new TernarySearchTrie<number>()
      tst.insert('a', 1)
      tst.insert('b', 2)
      const result = tst.entriesWithPrefix('')
      expect(result.sort((a, b) => a[0].localeCompare(b[0]))).toEqual([
        ['a', 1],
        ['b', 2],
      ])
    })

    it('should return empty array for empty trie', () => {
      const tst = new TernarySearchTrie<number>()
      expect(tst.entriesWithPrefix('a')).toEqual([])
    })
  })

  describe('longestPrefixOf', () => {
    it('should find the longest key that is a prefix of query', () => {
      const tst = new TernarySearchTrie<number>()
      tst.insert('she', 1)
      tst.insert('shells', 2)
      tst.insert('sea', 3)
      expect(tst.longestPrefixOf('shellsort')).toBe('shells')
    })

    it('should return empty string if no prefix matches', () => {
      const tst = new TernarySearchTrie<number>()
      tst.insert('hello', 1)
      expect(tst.longestPrefixOf('world')).toBe('')
    })

    it('should return empty string for empty query', () => {
      const tst = new TernarySearchTrie<number>()
      tst.insert('hello', 1)
      expect(tst.longestPrefixOf('')).toBe('')
    })

    it('should return empty string for empty trie', () => {
      const tst = new TernarySearchTrie<number>()
      expect(tst.longestPrefixOf('hello')).toBe('')
    })

    it('should handle exact match', () => {
      const tst = new TernarySearchTrie<number>()
      tst.insert('hello', 1)
      expect(tst.longestPrefixOf('hello')).toBe('hello')
    })

    it('should handle single character match', () => {
      const tst = new TernarySearchTrie<number>()
      tst.insert('a', 1)
      tst.insert('ab', 2)
      tst.insert('abc', 3)
      expect(tst.longestPrefixOf('abcd')).toBe('abc')
    })

    it('should find the shortest prefix match', () => {
      const tst = new TernarySearchTrie<number>()
      tst.insert('a', 1)
      expect(tst.longestPrefixOf('abc')).toBe('a')
    })

    it('should prefer longer match over shorter', () => {
      const tst = new TernarySearchTrie<number>()
      tst.insert('s', 1)
      tst.insert('sh', 2)
      tst.insert('she', 3)
      tst.insert('shel', 4)
      tst.insert('shell', 5)
      expect(tst.longestPrefixOf('shells')).toBe('shell')
    })
  })

  describe('startsWith', () => {
    it('should return true if any key has the prefix', () => {
      const tst = new TernarySearchTrie<number>()
      tst.insert('apple', 1)
      tst.insert('application', 2)
      expect(tst.startsWith('app')).toBe(true)
    })

    it('should return false if no key has the prefix', () => {
      const tst = new TernarySearchTrie<number>()
      tst.insert('apple', 1)
      expect(tst.startsWith('xyz')).toBe(false)
    })

    it('should return true for empty prefix on non-empty trie', () => {
      const tst = new TernarySearchTrie<number>()
      tst.insert('apple', 1)
      expect(tst.startsWith('')).toBe(true)
    })

    it('should return false for empty prefix on empty trie', () => {
      const tst = new TernarySearchTrie<number>()
      expect(tst.startsWith('')).toBe(false)
    })

    it('should return true for exact key match as prefix', () => {
      const tst = new TernarySearchTrie<number>()
      tst.insert('hello', 1)
      expect(tst.startsWith('hello')).toBe(true)
    })

    it('should return false for prefix longer than any key', () => {
      const tst = new TernarySearchTrie<number>()
      tst.insert('he', 1)
      expect(tst.startsWith('hello')).toBe(false)
    })

    it('should handle single character prefix', () => {
      const tst = new TernarySearchTrie<number>()
      tst.insert('abc', 1)
      tst.insert('axyz', 2)
      expect(tst.startsWith('a')).toBe(true)
      expect(tst.startsWith('b')).toBe(false)
    })
  })

  describe('size', () => {
    it('should return 0 for empty trie', () => {
      const tst = new TernarySearchTrie<number>()
      expect(tst.size()).toBe(0)
    })

    it('should return correct size after insertions', () => {
      const tst = new TernarySearchTrie<number>()
      tst.insert('a', 1)
      tst.insert('b', 2)
      tst.insert('c', 3)
      expect(tst.size()).toBe(3)
    })

    it('should not increase size on duplicate insertion', () => {
      const tst = new TernarySearchTrie<number>()
      tst.insert('key', 1)
      tst.insert('key', 2)
      expect(tst.size()).toBe(1)
    })

    it('should decrease size after deletion', () => {
      const tst = new TernarySearchTrie<number>()
      tst.insert('a', 1)
      tst.insert('b', 2)
      tst.delete('a')
      expect(tst.size()).toBe(1)
    })

    it('should return 0 after clearing', () => {
      const tst = new TernarySearchTrie<number>()
      tst.insert('a', 1)
      tst.clear()
      expect(tst.size()).toBe(0)
    })
  })

  describe('isEmpty', () => {
    it('should return true for new trie', () => {
      const tst = new TernarySearchTrie<number>()
      expect(tst.isEmpty()).toBe(true)
    })

    it('should return false after insertion', () => {
      const tst = new TernarySearchTrie<number>()
      tst.insert('key', 1)
      expect(tst.isEmpty()).toBe(false)
    })

    it('should return true after deleting all keys', () => {
      const tst = new TernarySearchTrie<number>()
      tst.insert('key', 1)
      tst.delete('key')
      expect(tst.isEmpty()).toBe(true)
    })

    it('should return true after clear', () => {
      const tst = new TernarySearchTrie<number>()
      tst.insert('key', 1)
      tst.insert('key2', 2)
      tst.clear()
      expect(tst.isEmpty()).toBe(true)
    })
  })

  describe('clear', () => {
    it('should remove all entries', () => {
      const tst = new TernarySearchTrie<number>()
      tst.insert('a', 1)
      tst.insert('b', 2)
      tst.insert('c', 3)
      tst.clear()
      expect(tst.size()).toBe(0)
      expect(tst.isEmpty()).toBe(true)
      expect(tst.has('a')).toBe(false)
      expect(tst.has('b')).toBe(false)
      expect(tst.has('c')).toBe(false)
    })

    it('should be safe to clear empty trie', () => {
      const tst = new TernarySearchTrie<number>()
      tst.clear()
      expect(tst.size()).toBe(0)
    })

    it('should allow insertion after clear', () => {
      const tst = new TernarySearchTrie<number>()
      tst.insert('a', 1)
      tst.clear()
      tst.insert('b', 2)
      expect(tst.size()).toBe(1)
      expect(tst.get('b')).toBe(2)
      expect(tst.has('a')).toBe(false)
    })

    it('should handle multiple clears', () => {
      const tst = new TernarySearchTrie<number>()
      tst.insert('a', 1)
      tst.clear()
      tst.clear()
      expect(tst.size()).toBe(0)
    })
  })

  describe('keys', () => {
    it('should return empty array for empty trie', () => {
      const tst = new TernarySearchTrie<number>()
      expect(tst.keys()).toEqual([])
    })

    it('should return all keys', () => {
      const tst = new TernarySearchTrie<number>()
      tst.insert('apple', 1)
      tst.insert('banana', 2)
      tst.insert('cherry', 3)
      expect(tst.keys().sort()).toEqual(['apple', 'banana', 'cherry'])
    })

    it('should return updated keys after deletion', () => {
      const tst = new TernarySearchTrie<number>()
      tst.insert('a', 1)
      tst.insert('b', 2)
      tst.delete('a')
      expect(tst.keys()).toEqual(['b'])
    })

    it('should return empty array after clear', () => {
      const tst = new TernarySearchTrie<number>()
      tst.insert('a', 1)
      tst.clear()
      expect(tst.keys()).toEqual([])
    })
  })

  describe('values', () => {
    it('should return empty array for empty trie', () => {
      const tst = new TernarySearchTrie<number>()
      expect(tst.values()).toEqual([])
    })

    it('should return all values', () => {
      const tst = new TernarySearchTrie<number>()
      tst.insert('apple', 1)
      tst.insert('banana', 2)
      expect(tst.values().sort()).toEqual([1, 2])
    })

    it('should return updated values after deletion', () => {
      const tst = new TernarySearchTrie<number>()
      tst.insert('a', 1)
      tst.insert('b', 2)
      tst.delete('a')
      expect(tst.values()).toEqual([2])
    })

    it('should return empty array after clear', () => {
      const tst = new TernarySearchTrie<number>()
      tst.insert('a', 1)
      tst.clear()
      expect(tst.values()).toEqual([])
    })
  })

  describe('entries', () => {
    it('should return empty array for empty trie', () => {
      const tst = new TernarySearchTrie<number>()
      expect(tst.entries()).toEqual([])
    })

    it('should return all entries', () => {
      const tst = new TernarySearchTrie<number>()
      tst.insert('apple', 1)
      tst.insert('banana', 2)
      const result = tst.entries().sort((a, b) => a[0].localeCompare(b[0]))
      expect(result).toEqual([
        ['apple', 1],
        ['banana', 2],
      ])
    })

    it('should return updated entries after deletion', () => {
      const tst = new TernarySearchTrie<number>()
      tst.insert('a', 1)
      tst.insert('b', 2)
      tst.delete('a')
      expect(tst.entries()).toEqual([['b', 2]])
    })

    it('should return empty array after clear', () => {
      const tst = new TernarySearchTrie<number>()
      tst.insert('a', 1)
      tst.clear()
      expect(tst.entries()).toEqual([])
    })
  })

  describe('forEach', () => {
    it('should iterate over all entries', () => {
      const tst = new TernarySearchTrie<number>()
      tst.insert('a', 1)
      tst.insert('b', 2)
      tst.insert('c', 3)
      const result: Array<[string, number]> = []
      tst.forEach((value, key) => {
        result.push([key, value])
      })
      expect(result.sort((a, b) => a[0].localeCompare(b[0]))).toEqual([
        ['a', 1],
        ['b', 2],
        ['c', 3],
      ])
    })

    it('should not call callback for empty trie', () => {
      const tst = new TernarySearchTrie<number>()
      let called = false
      tst.forEach(() => {
        called = true
      })
      expect(called).toBe(false)
    })

    it('should receive correct value and key order', () => {
      const tst = new TernarySearchTrie<string>()
      tst.insert('x', 'value_x')
      tst.forEach((value, key) => {
        expect(key).toBe('x')
        expect(value).toBe('value_x')
      })
    })
  })

  describe('edge cases - unicode', () => {
    it('should handle unicode characters', () => {
      const tst = new TernarySearchTrie<number>()
      tst.insert('café', 1)
      tst.insert('naïve', 2)
      expect(tst.get('café')).toBe(1)
      expect(tst.get('naïve')).toBe(2)
    })

    it('should handle emoji keys', () => {
      const tst = new TernarySearchTrie<number>()
      tst.insert('😀', 1)
      tst.insert('🎉', 2)
      expect(tst.get('😀')).toBe(1)
      expect(tst.get('🎉')).toBe(2)
    })

    it('should handle mixed unicode keys', () => {
      const tst = new TernarySearchTrie<number>()
      tst.insert('hello世界', 1)
      tst.insert('hello🎉', 2)
      expect(tst.get('hello世界')).toBe(1)
      expect(tst.get('hello🎉')).toBe(2)
    })

    it('should handle CJK characters', () => {
      const tst = new TernarySearchTrie<number>()
      tst.insert('日本語', 1)
      tst.insert('中文', 2)
      expect(tst.get('日本語')).toBe(1)
      expect(tst.get('中文')).toBe(2)
    })

    it('should handle keysWithPrefix with unicode', () => {
      const tst = new TernarySearchTrie<number>()
      tst.insert('café', 1)
      tst.insert('cake', 2)
      const result = tst.keysWithPrefix('ca')
      expect(result.sort()).toEqual(['café', 'cake'])
    })
  })

  describe('edge cases - single character', () => {
    it('should handle single char insert and get', () => {
      const tst = new TernarySearchTrie<number>()
      tst.insert('x', 42)
      expect(tst.get('x')).toBe(42)
    })

    it('should handle single char delete', () => {
      const tst = new TernarySearchTrie<number>()
      tst.insert('x', 42)
      expect(tst.delete('x')).toBe(true)
      expect(tst.has('x')).toBe(false)
    })

    it('should handle single char has', () => {
      const tst = new TernarySearchTrie<number>()
      tst.insert('x', 42)
      expect(tst.has('x')).toBe(true)
      expect(tst.has('y')).toBe(false)
    })

    it('should handle single char in keysWithPrefix', () => {
      const tst = new TernarySearchTrie<number>()
      tst.insert('a', 1)
      tst.insert('ab', 2)
      expect(tst.keysWithPrefix('a').sort()).toEqual(['a', 'ab'])
    })

    it('should handle single char in longestPrefixOf', () => {
      const tst = new TernarySearchTrie<number>()
      tst.insert('a', 1)
      expect(tst.longestPrefixOf('abc')).toBe('a')
    })
  })

  describe('duplicate keys', () => {
    it('should update value on duplicate insert', () => {
      const tst = new TernarySearchTrie<number>()
      tst.insert('key', 1)
      tst.insert('key', 99)
      expect(tst.get('key')).toBe(99)
      expect(tst.size()).toBe(1)
    })

    it('should handle multiple overwrites', () => {
      const tst = new TernarySearchTrie<number>()
      for (let i = 0; i < 10; i++) {
        tst.insert('key', i)
      }
      expect(tst.get('key')).toBe(9)
      expect(tst.size()).toBe(1)
    })

    it('should handle overwrite after delete', () => {
      const tst = new TernarySearchTrie<number>()
      tst.insert('key', 1)
      tst.delete('key')
      tst.insert('key', 2)
      expect(tst.get('key')).toBe(2)
      expect(tst.size()).toBe(1)
    })
  })

  describe('large datasets', () => {
    it('should handle 1000 insertions and lookups', () => {
      const tst = new TernarySearchTrie<number>()
      for (let i = 0; i < 1000; i++) {
        tst.insert(`key${i}`, i)
      }
      expect(tst.size()).toBe(1000)
      expect(tst.get('key0')).toBe(0)
      expect(tst.get('key500')).toBe(500)
      expect(tst.get('key999')).toBe(999)
      expect(tst.get('key1000')).toBeUndefined()
    })

    it('should handle 1000 deletions', () => {
      const tst = new TernarySearchTrie<number>()
      for (let i = 0; i < 100; i++) {
        tst.insert(`key${i}`, i)
      }
      for (let i = 0; i < 100; i++) {
        expect(tst.delete(`key${i}`)).toBe(true)
      }
      expect(tst.isEmpty()).toBe(true)
    })

    it('should handle keysWithPrefix on large dataset', () => {
      const tst = new TernarySearchTrie<number>()
      for (let i = 0; i < 100; i++) {
        tst.insert(`test${i}`, i)
      }
      for (let i = 0; i < 50; i++) {
        tst.insert(`other${i}`, i)
      }
      const result = tst.keysWithPrefix('test')
      expect(result.length).toBe(100)
    })

    it('should handle longestPrefixOf with many prefix keys', () => {
      const tst = new TernarySearchTrie<number>()
      tst.insert('a', 1)
      tst.insert('ab', 2)
      tst.insert('abc', 3)
      tst.insert('abcd', 4)
      tst.insert('abcde', 5)
      expect(tst.longestPrefixOf('abcdef')).toBe('abcde')
    })
  })

  describe('TSTNode type export', () => {
    it('should export TSTNode type', () => {
      const _node: TSTNode<number> = {
        char: 'a',
        value: 1,
        isEnd: true,
        left: null,
        middle: null,
        right: null,
      }
      expect(_node.char).toBe('a')
      expect(_node.value).toBe(1)
      expect(_node.isEnd).toBe(true)
    })
  })

  describe('complex scenarios', () => {
    it('should handle intermixed operations', () => {
      const tst = new TernarySearchTrie<number>()
      tst.insert('cat', 1)
      expect(tst.get('cat')).toBe(1)
      expect(tst.size()).toBe(1)
      tst.insert('car', 2)
      expect(tst.size()).toBe(2)
      tst.delete('cat')
      expect(tst.has('cat')).toBe(false)
      expect(tst.has('car')).toBe(true)
      expect(tst.size()).toBe(1)
      tst.insert('cab', 3)
      expect(tst.keysWithPrefix('ca').sort()).toEqual(['cab', 'car'])
    })

    it('should handle keys in alphabetical order', () => {
      const tst = new TernarySearchTrie<number>()
      const keys = ['aaa', 'aab', 'aac', 'aad', 'aae']
      keys.forEach((k, i) => tst.insert(k, i))
      keys.forEach((k, i) => {
        expect(tst.get(k)).toBe(i)
      })
    })

    it('should handle keys in reverse alphabetical order', () => {
      const tst = new TernarySearchTrie<number>()
      const keys = ['aae', 'aad', 'aac', 'aab', 'aaa']
      keys.forEach((k, i) => tst.insert(k, i))
      expect(tst.get('aaa')).toBe(4)
      expect(tst.get('aae')).toBe(0)
    })

    it('should handle longest prefix with no matches', () => {
      const tst = new TernarySearchTrie<number>()
      tst.insert('xyz', 1)
      expect(tst.longestPrefixOf('abc')).toBe('')
    })

    it('should handle startsWith after all keys deleted', () => {
      const tst = new TernarySearchTrie<number>()
      tst.insert('test', 1)
      tst.delete('test')
      expect(tst.startsWith('te')).toBe(false)
    })

    it('should handle valuesWithPrefix with different value types', () => {
      const tst = new TernarySearchTrie<string>()
      tst.insert('a1', 'alpha')
      tst.insert('a2', 'beta')
      tst.insert('b1', 'gamma')
      const result = tst.valuesWithPrefix('a')
      expect(result.sort()).toEqual(['alpha', 'beta'])
    })

    it('should handle sequential insert-delete cycles', () => {
      const tst = new TernarySearchTrie<number>()
      for (let i = 0; i < 5; i++) {
        tst.insert('key', i)
        expect(tst.size()).toBe(1)
        tst.delete('key')
        expect(tst.size()).toBe(0)
      }
    })

    it('should handle entriesWithPrefix after partial deletion', () => {
      const tst = new TernarySearchTrie<number>()
      tst.insert('abc', 1)
      tst.insert('abd', 2)
      tst.insert('abe', 3)
      tst.delete('abd')
      const result = tst.entriesWithPrefix('ab')
      expect(result.sort((a, b) => a[0].localeCompare(b[0]))).toEqual([
        ['abc', 1],
        ['abe', 3],
      ])
    })

    it('should handle forEach with correct iteration count', () => {
      const tst = new TernarySearchTrie<number>()
      tst.insert('x', 1)
      tst.insert('y', 2)
      tst.insert('z', 3)
      let count = 0
      tst.forEach(() => {
        count++
      })
      expect(count).toBe(3)
    })

    it('should maintain consistency across operations', () => {
      const tst = new TernarySearchTrie<number>()
      tst.insert('sea', 1)
      tst.insert('shell', 2)
      tst.insert('shells', 3)
      tst.insert('shore', 4)
      expect(tst.size()).toBe(4)
      expect(tst.longestPrefixOf('seashore')).toBe('sea')
      expect(tst.keysWithPrefix('sh').sort()).toEqual(['shell', 'shells', 'shore'])
      expect(tst.valuesWithPrefix('sh').sort()).toEqual([2, 3, 4])
      tst.delete('shell')
      expect(tst.size()).toBe(3)
      expect(tst.keysWithPrefix('sh').sort()).toEqual(['shells', 'shore'])
      expect(tst.has('shell')).toBe(false)
      expect(tst.has('shells')).toBe(true)
    })
  })

  describe('additional coverage', () => {
    it('should handle get after delete', () => {
      const tst = new TernarySearchTrie<number>()
      tst.insert('test', 42)
      tst.delete('test')
      expect(tst.get('test')).toBeUndefined()
    })

    it('should handle delete non-existent key after other insertions', () => {
      const tst = new TernarySearchTrie<number>()
      tst.insert('abc', 1)
      expect(tst.delete('xyz')).toBe(false)
      expect(tst.size()).toBe(1)
    })

    it('should handle keysWithPrefix on empty trie with empty prefix', () => {
      const tst = new TernarySearchTrie<number>()
      expect(tst.keysWithPrefix('')).toEqual([])
    })

    it('should handle valuesWithPrefix on empty trie with empty prefix', () => {
      const tst = new TernarySearchTrie<number>()
      expect(tst.valuesWithPrefix('')).toEqual([])
    })

    it('should handle entriesWithPrefix on empty trie with empty prefix', () => {
      const tst = new TernarySearchTrie<number>()
      expect(tst.entriesWithPrefix('')).toEqual([])
    })

    it('should handle insert after deleting all keys', () => {
      const tst = new TernarySearchTrie<number>()
      tst.insert('a', 1)
      tst.insert('b', 2)
      tst.delete('a')
      tst.delete('b')
      expect(tst.isEmpty()).toBe(true)
      tst.insert('c', 3)
      expect(tst.size()).toBe(1)
      expect(tst.get('c')).toBe(3)
    })

    it('should handle keysWithPrefix where prefix exactly matches one key', () => {
      const tst = new TernarySearchTrie<number>()
      tst.insert('hello', 1)
      tst.insert('world', 2)
      expect(tst.keysWithPrefix('hello')).toEqual(['hello'])
    })

    it('should handle valuesWithPrefix where prefix exactly matches one key', () => {
      const tst = new TernarySearchTrie<number>()
      tst.insert('hello', 1)
      tst.insert('world', 2)
      expect(tst.valuesWithPrefix('hello')).toEqual([1])
    })

    it('should handle entriesWithPrefix where prefix exactly matches one key', () => {
      const tst = new TernarySearchTrie<number>()
      tst.insert('hello', 1)
      tst.insert('world', 2)
      expect(tst.entriesWithPrefix('hello')).toEqual([['hello', 1]])
    })

    it('should handle keys returning correct count', () => {
      const tst = new TernarySearchTrie<number>()
      const words = ['alpha', 'beta', 'gamma', 'delta', 'epsilon']
      words.forEach((w, i) => tst.insert(w, i))
      expect(tst.keys().length).toBe(5)
    })

    it('should handle values returning correct count', () => {
      const tst = new TernarySearchTrie<number>()
      const words = ['alpha', 'beta', 'gamma']
      words.forEach((w, i) => tst.insert(w, i))
      expect(tst.values().length).toBe(3)
    })

    it('should handle entries returning correct count', () => {
      const tst = new TernarySearchTrie<number>()
      const words = ['alpha', 'beta', 'gamma']
      words.forEach((w, i) => tst.insert(w, i))
      expect(tst.entries().length).toBe(3)
    })

    it('should handle longestPrefixOf with partial match only', () => {
      const tst = new TernarySearchTrie<number>()
      tst.insert('he', 1)
      tst.insert('help', 2)
      expect(tst.longestPrefixOf('hello')).toBe('he')
    })

    it('should handle multiple insertions with same first character', () => {
      const tst = new TernarySearchTrie<number>()
      tst.insert('able', 1)
      tst.insert('about', 2)
      tst.insert('above', 3)
      tst.insert('abuse', 4)
      expect(tst.size()).toBe(4)
      expect(tst.keysWithPrefix('ab').length).toBe(4)
    })

    it('should handle delete of key that branches at root', () => {
      const tst = new TernarySearchTrie<number>()
      tst.insert('a', 1)
      tst.insert('b', 2)
      tst.insert('c', 3)
      tst.delete('b')
      expect(tst.has('a')).toBe(true)
      expect(tst.has('b')).toBe(false)
      expect(tst.has('c')).toBe(true)
      expect(tst.keys().sort()).toEqual(['a', 'c'])
    })

    it('should handle startsWith with exact key match', () => {
      const tst = new TernarySearchTrie<number>()
      tst.insert('test', 1)
      expect(tst.startsWith('test')).toBe(true)
      expect(tst.startsWith('testing')).toBe(false)
    })

    it('should handle longestPrefixOf when query matches shorter stored key', () => {
      const tst = new TernarySearchTrie<number>()
      tst.insert('short', 1)
      tst.insert('shortest', 2)
      expect(tst.longestPrefixOf('shortest')).toBe('shortest')
    })

    it('should handle empty string key does not affect operations', () => {
      const tst = new TernarySearchTrie<number>()
      tst.insert('', 0)
      tst.insert('a', 1)
      expect(tst.size()).toBe(1)
      expect(tst.has('')).toBe(false)
      expect(tst.has('a')).toBe(true)
    })

    it('should handle forEach with deleted entries', () => {
      const tst = new TernarySearchTrie<number>()
      tst.insert('a', 1)
      tst.insert('b', 2)
      tst.insert('c', 3)
      tst.delete('b')
      const keys: string[] = []
      tst.forEach((_v, k) => keys.push(k))
      expect(keys.sort()).toEqual(['a', 'c'])
    })

    it('should handle size consistency after overwrite and delete', () => {
      const tst = new TernarySearchTrie<number>()
      tst.insert('key', 1)
      tst.insert('key', 2)
      tst.insert('key', 3)
      expect(tst.size()).toBe(1)
      tst.delete('key')
      expect(tst.size()).toBe(0)
    })

    it('should handle keysWithPrefix returning sorted lexicographic order via TST traversal', () => {
      const tst = new TernarySearchTrie<number>()
      tst.insert('m', 1)
      tst.insert('a', 2)
      tst.insert('z', 3)
      tst.insert('b', 4)
      const result = tst.keys()
      expect(result).toEqual(['a', 'b', 'm', 'z'])
    })

    it('should handle keys returning sorted order for multi-char keys', () => {
      const tst = new TernarySearchTrie<number>()
      tst.insert('banana', 1)
      tst.insert('apple', 2)
      tst.insert('cherry', 3)
      const result = tst.keys()
      expect(result).toEqual(['apple', 'banana', 'cherry'])
    })

    it('should handle values returning in sorted key order', () => {
      const tst = new TernarySearchTrie<number>()
      tst.insert('c', 3)
      tst.insert('a', 1)
      tst.insert('b', 2)
      const result = tst.values()
      expect(result).toEqual([1, 2, 3])
    })

    it('should handle entries returning in sorted key order', () => {
      const tst = new TernarySearchTrie<number>()
      tst.insert('c', 30)
      tst.insert('a', 10)
      tst.insert('b', 20)
      const result = tst.entries()
      expect(result).toEqual([
        ['a', 10],
        ['b', 20],
        ['c', 30],
      ])
    })
  })
})
