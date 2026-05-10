import { describe, it, expect, beforeEach } from 'vitest'
import { BitmapTrie } from '../../src/core/bitmap-trie/bitmap-trie.js'
import { DEFAULT_BITMAP_TRIE_OPTIONS } from '../../src/core/bitmap-trie/types.js'
import type { BitmapTrieNode, BitmapTrieOptions } from '../../src/core/bitmap-trie/types.js'

describe('BitmapTrie', () => {
  let trie: BitmapTrie<number>

  beforeEach(() => {
    trie = new BitmapTrie<number>()
  })

  describe('constructor', () => {
    it('should create an empty trie', () => {
      const t = new BitmapTrie<string>()
      expect(t.size).toBe(0)
    })

    it('should accept options parameter', () => {
      const t = new BitmapTrie<string>({})
      expect(t.isEmpty).toBe(true)
    })

    it('should work with default options', () => {
      const t = new BitmapTrie()
      expect(t.size).toBe(0)
    })
  })

  describe('insert and get', () => {
    it('should insert and get a value', () => {
      trie.insert('hello', 1)
      expect(trie.get('hello')).toBe(1)
    })

    it('should return undefined for non-existent key', () => {
      expect(trie.get('hello')).toBeUndefined()
    })

    it('should handle multiple keys', () => {
      trie.insert('hello', 1)
      trie.insert('world', 2)
      trie.insert('help', 3)
      expect(trie.get('hello')).toBe(1)
      expect(trie.get('world')).toBe(2)
      expect(trie.get('help')).toBe(3)
    })

    it('should overwrite existing value', () => {
      trie.insert('hello', 1)
      trie.insert('hello', 2)
      expect(trie.get('hello')).toBe(2)
    })

    it('should not increase size when overwriting', () => {
      trie.insert('hello', 1)
      expect(trie.size).toBe(1)
      trie.insert('hello', 2)
      expect(trie.size).toBe(1)
    })

    it('should handle empty string key', () => {
      trie.insert('', 42)
      expect(trie.get('')).toBe(42)
    })

    it('should handle single character keys', () => {
      trie.insert('a', 1)
      trie.insert('b', 2)
      trie.insert('z', 3)
      expect(trie.get('a')).toBe(1)
      expect(trie.get('b')).toBe(2)
      expect(trie.get('z')).toBe(3)
    })

    it('should handle keys that are prefixes of each other', () => {
      trie.insert('app', 1)
      trie.insert('apple', 2)
      trie.insert('applet', 3)
      expect(trie.get('app')).toBe(1)
      expect(trie.get('apple')).toBe(2)
      expect(trie.get('applet')).toBe(3)
    })

    it('should return undefined for prefix not inserted', () => {
      trie.insert('apple', 1)
      expect(trie.get('app')).toBeUndefined()
    })

    it('should return undefined for extension past inserted key', () => {
      trie.insert('app', 1)
      expect(trie.get('apple')).toBeUndefined()
    })
  })

  describe('has', () => {
    it('should return true for existing key', () => {
      trie.insert('hello', 1)
      expect(trie.has('hello')).toBe(true)
    })

    it('should return false for non-existent key', () => {
      expect(trie.has('hello')).toBe(false)
    })

    it('should return false for prefix not inserted', () => {
      trie.insert('apple', 1)
      expect(trie.has('app')).toBe(false)
    })

    it('should return false for extension of inserted key', () => {
      trie.insert('app', 1)
      expect(trie.has('apple')).toBe(false)
    })

    it('should return true after insert and false after delete', () => {
      trie.insert('hello', 1)
      expect(trie.has('hello')).toBe(true)
      trie.delete('hello')
      expect(trie.has('hello')).toBe(false)
    })

    it('should handle empty string key', () => {
      expect(trie.has('')).toBe(false)
      trie.insert('', 1)
      expect(trie.has('')).toBe(true)
    })
  })

  describe('delete', () => {
    it('should delete an existing key', () => {
      trie.insert('hello', 1)
      expect(trie.delete('hello')).toBe(true)
      expect(trie.has('hello')).toBe(false)
    })

    it('should return false for non-existent key', () => {
      expect(trie.delete('hello')).toBe(false)
    })

    it('should decrease size on delete', () => {
      trie.insert('hello', 1)
      trie.insert('world', 2)
      expect(trie.size).toBe(2)
      trie.delete('hello')
      expect(trie.size).toBe(1)
    })

    it('should not affect sibling keys', () => {
      trie.insert('hello', 1)
      trie.insert('help', 2)
      trie.delete('hello')
      expect(trie.has('hello')).toBe(false)
      expect(trie.has('help')).toBe(true)
    })

    it('should not affect parent prefix keys', () => {
      trie.insert('app', 1)
      trie.insert('apple', 2)
      trie.delete('apple')
      expect(trie.has('app')).toBe(true)
      expect(trie.has('apple')).toBe(false)
    })

    it('should not affect child keys', () => {
      trie.insert('app', 1)
      trie.insert('apple', 2)
      trie.delete('app')
      expect(trie.has('apple')).toBe(true)
      expect(trie.has('app')).toBe(false)
    })

    it('should handle deleting the only key', () => {
      trie.insert('hello', 1)
      trie.delete('hello')
      expect(trie.isEmpty).toBe(true)
    })

    it('should handle deleting a prefix key', () => {
      trie.insert('app', 1)
      trie.insert('apple', 2)
      trie.insert('application', 3)
      trie.delete('app')
      expect(trie.has('app')).toBe(false)
      expect(trie.has('apple')).toBe(true)
      expect(trie.has('application')).toBe(true)
    })

    it('should handle deleting a leaf key', () => {
      trie.insert('app', 1)
      trie.insert('apple', 2)
      trie.delete('apple')
      expect(trie.has('app')).toBe(true)
      expect(trie.has('apple')).toBe(false)
    })

    it('should allow re-adding a deleted key', () => {
      trie.insert('hello', 1)
      trie.delete('hello')
      trie.insert('hello', 2)
      expect(trie.get('hello')).toBe(2)
      expect(trie.size).toBe(1)
    })

    it('should handle deleting empty string key', () => {
      trie.insert('', 1)
      expect(trie.delete('')).toBe(true)
      expect(trie.has('')).toBe(false)
    })
  })

  describe('size', () => {
    it('should return 0 for empty trie', () => {
      expect(trie.size).toBe(0)
    })

    it('should return correct size after insertions', () => {
      trie.insert('a', 1)
      trie.insert('ab', 2)
      trie.insert('abc', 3)
      expect(trie.size).toBe(3)
    })

    it('should return correct size after deletions', () => {
      trie.insert('a', 1)
      trie.insert('b', 2)
      trie.insert('c', 3)
      trie.delete('b')
      expect(trie.size).toBe(2)
    })

    it('should return correct size after overwrite', () => {
      trie.insert('a', 1)
      trie.insert('a', 2)
      expect(trie.size).toBe(1)
    })

    it('should return correct size after clear and re-insert', () => {
      trie.insert('a', 1)
      trie.insert('b', 2)
      trie.clear()
      trie.insert('c', 3)
      expect(trie.size).toBe(1)
    })
  })

  describe('isEmpty', () => {
    it('should return true for new trie', () => {
      expect(trie.isEmpty).toBe(true)
    })

    it('should return false after insertion', () => {
      trie.insert('hello', 1)
      expect(trie.isEmpty).toBe(false)
    })

    it('should return true after deleting all keys', () => {
      trie.insert('hello', 1)
      trie.delete('hello')
      expect(trie.isEmpty).toBe(true)
    })

    it('should return true after clear', () => {
      trie.insert('hello', 1)
      trie.clear()
      expect(trie.isEmpty).toBe(true)
    })

    it('should return false when some keys remain', () => {
      trie.insert('a', 1)
      trie.insert('b', 2)
      trie.delete('a')
      expect(trie.isEmpty).toBe(false)
    })
  })

  describe('clear', () => {
    it('should clear all entries', () => {
      trie.insert('a', 1)
      trie.insert('b', 2)
      trie.insert('c', 3)
      trie.clear()
      expect(trie.size).toBe(0)
      expect(trie.isEmpty).toBe(true)
    })

    it('should allow insertions after clear', () => {
      trie.insert('a', 1)
      trie.clear()
      trie.insert('b', 2)
      expect(trie.get('b')).toBe(2)
      expect(trie.has('a')).toBe(false)
    })

    it('should handle clearing empty trie', () => {
      trie.clear()
      expect(trie.size).toBe(0)
    })
  })

  describe('keys', () => {
    it('should return empty array for empty trie', () => {
      expect(trie.keys()).toEqual([])
    })

    it('should return all keys', () => {
      trie.insert('hello', 1)
      trie.insert('world', 2)
      const keys = trie.keys()
      expect(keys).toContain('hello')
      expect(keys).toContain('world')
      expect(keys.length).toBe(2)
    })

    it('should return keys in alphabetical order', () => {
      trie.insert('cat', 1)
      trie.insert('apple', 2)
      trie.insert('bat', 3)
      expect(trie.keys()).toEqual(['apple', 'bat', 'cat'])
    })

    it('should not include deleted keys', () => {
      trie.insert('a', 1)
      trie.insert('b', 2)
      trie.delete('a')
      expect(trie.keys()).toEqual(['b'])
    })

    it('should include empty string key', () => {
      trie.insert('', 1)
      trie.insert('a', 2)
      const keys = trie.keys()
      expect(keys).toContain('')
      expect(keys).toContain('a')
    })
  })

  describe('values', () => {
    it('should return empty array for empty trie', () => {
      expect(trie.values()).toEqual([])
    })

    it('should return all values', () => {
      trie.insert('a', 1)
      trie.insert('b', 2)
      trie.insert('c', 3)
      const vals = trie.values()
      expect(vals).toContain(1)
      expect(vals).toContain(2)
      expect(vals).toContain(3)
      expect(vals.length).toBe(3)
    })

    it('should reflect overwritten values', () => {
      trie.insert('a', 1)
      trie.insert('a', 99)
      expect(trie.values()).toEqual([99])
    })

    it('should not include deleted values', () => {
      trie.insert('a', 1)
      trie.insert('b', 2)
      trie.delete('a')
      expect(trie.values()).toEqual([2])
    })
  })

  describe('entries', () => {
    it('should return empty array for empty trie', () => {
      expect(trie.entries()).toEqual([])
    })

    it('should return all key-value pairs', () => {
      trie.insert('a', 1)
      trie.insert('b', 2)
      expect(trie.entries()).toEqual([
        ['a', 1],
        ['b', 2],
      ])
    })

    it('should reflect current values after overwrite', () => {
      trie.insert('a', 1)
      trie.insert('a', 10)
      expect(trie.entries()).toEqual([['a', 10]])
    })

    it('should not include deleted entries', () => {
      trie.insert('a', 1)
      trie.insert('b', 2)
      trie.delete('a')
      expect(trie.entries()).toEqual([['b', 2]])
    })

    it('should return entries in alphabetical order', () => {
      trie.insert('cat', 1)
      trie.insert('apple', 2)
      trie.insert('bat', 3)
      expect(trie.entries()).toEqual([
        ['apple', 2],
        ['bat', 3],
        ['cat', 1],
      ])
    })
  })

  describe('forEach', () => {
    it('should iterate over all entries', () => {
      trie.insert('a', 1)
      trie.insert('b', 2)
      trie.insert('c', 3)
      const result: Array<[string, number]> = []
      trie.forEach((key, value) => {
        result.push([key, value])
      })
      expect(result.length).toBe(3)
    })

    it('should not iterate for empty trie', () => {
      let count = 0
      trie.forEach(() => {
        count++
      })
      expect(count).toBe(0)
    })

    it('should pass correct key-value pairs', () => {
      trie.insert('hello', 42)
      let receivedKey = ''
      let receivedValue = 0
      trie.forEach((key, value) => {
        receivedKey = key
        receivedValue = value
      })
      expect(receivedKey).toBe('hello')
      expect(receivedValue).toBe(42)
    })
  })

  describe('startsWith', () => {
    it('should return all keys with given prefix', () => {
      trie.insert('apple', 1)
      trie.insert('application', 2)
      trie.insert('apply', 3)
      trie.insert('banana', 4)
      const result = trie.startsWith('app')
      expect(result).toContain('apple')
      expect(result).toContain('application')
      expect(result).toContain('apply')
      expect(result).not.toContain('banana')
    })

    it('should return empty array for non-matching prefix', () => {
      trie.insert('apple', 1)
      expect(trie.startsWith('ban')).toEqual([])
    })

    it('should return empty array for empty trie', () => {
      expect(trie.startsWith('a')).toEqual([])
    })

    it('should return the prefix itself if it is a key', () => {
      trie.insert('app', 1)
      trie.insert('apple', 2)
      const result = trie.startsWith('app')
      expect(result).toContain('app')
      expect(result).toContain('apple')
    })

    it('should handle empty string prefix returning all keys', () => {
      trie.insert('a', 1)
      trie.insert('b', 2)
      expect(trie.startsWith('')).toEqual(['a', 'b'])
    })

    it('should handle single character prefix', () => {
      trie.insert('a', 1)
      trie.insert('ab', 2)
      trie.insert('ac', 3)
      trie.insert('b', 4)
      const result = trie.startsWith('a')
      expect(result).toEqual(['a', 'ab', 'ac'])
    })

    it('should handle prefix longer than any key', () => {
      trie.insert('a', 1)
      expect(trie.startsWith('abcdefghijkl')).toEqual([])
    })

    it('should work after deletion', () => {
      trie.insert('apple', 1)
      trie.insert('application', 2)
      trie.delete('apple')
      const result = trie.startsWith('app')
      expect(result).toEqual(['application'])
    })
  })

  describe('keysWithPrefix', () => {
    it('should return all keys with given prefix', () => {
      trie.insert('car', 1)
      trie.insert('card', 2)
      trie.insert('care', 3)
      const result = trie.keysWithPrefix('car')
      expect(result).toContain('car')
      expect(result).toContain('card')
      expect(result).toContain('care')
    })

    it('should return empty array for non-matching prefix', () => {
      trie.insert('apple', 1)
      expect(trie.keysWithPrefix('ban')).toEqual([])
    })

    it('should return empty array for empty trie', () => {
      expect(trie.keysWithPrefix('a')).toEqual([])
    })

    it('should match startsWith behavior', () => {
      trie.insert('test', 1)
      trie.insert('testing', 2)
      trie.insert('tester', 3)
      expect(trie.keysWithPrefix('test')).toEqual(trie.startsWith('test'))
    })

    it('should handle empty string prefix', () => {
      trie.insert('a', 1)
      trie.insert('b', 2)
      trie.insert('c', 3)
      expect(trie.keysWithPrefix('')).toEqual(['a', 'b', 'c'])
    })
  })

  describe('longestPrefixOf', () => {
    it('should return empty string for no matching prefix', () => {
      trie.insert('abc', 1)
      expect(trie.longestPrefixOf('xyz')).toBe('')
    })

    it('should return the key if it matches exactly', () => {
      trie.insert('hello', 1)
      expect(trie.longestPrefixOf('hello')).toBe('hello')
    })

    it('should return longest matching prefix', () => {
      trie.insert('app', 1)
      trie.insert('apple', 2)
      expect(trie.longestPrefixOf('appletree')).toBe('apple')
    })

    it('should return empty string for empty trie', () => {
      expect(trie.longestPrefixOf('hello')).toBe('')
    })

    it('should handle empty string query', () => {
      trie.insert('', 1)
      expect(trie.longestPrefixOf('')).toBe('')
    })

    it('should return shorter prefix when longer is not a key', () => {
      trie.insert('a', 1)
      trie.insert('abc', 2)
      expect(trie.longestPrefixOf('abcdef')).toBe('abc')
    })

    it('should handle single character matches', () => {
      trie.insert('a', 1)
      expect(trie.longestPrefixOf('abc')).toBe('a')
    })

    it('should return empty when query is shorter than any key', () => {
      trie.insert('abc', 1)
      trie.insert('abcd', 2)
      expect(trie.longestPrefixOf('ab')).toBe('')
    })

    it('should choose the longest among multiple prefix matches', () => {
      trie.insert('a', 1)
      trie.insert('ab', 2)
      trie.insert('abc', 3)
      trie.insert('abcd', 4)
      expect(trie.longestPrefixOf('abcdefg')).toBe('abcd')
    })

    it('should stop at first non-matching character', () => {
      trie.insert('abc', 1)
      trie.insert('xyz', 2)
      expect(trie.longestPrefixOf('abxyz')).toBe('')
    })
  })

  describe('shortestPrefixOf', () => {
    it('should return empty string for no matching prefix', () => {
      trie.insert('abc', 1)
      expect(trie.shortestPrefixOf('xyz')).toBe('')
    })

    it('should return the key if it matches exactly', () => {
      trie.insert('hello', 1)
      expect(trie.shortestPrefixOf('hello')).toBe('hello')
    })

    it('should return shortest matching prefix', () => {
      trie.insert('a', 1)
      trie.insert('ab', 2)
      trie.insert('abc', 3)
      expect(trie.shortestPrefixOf('abcdef')).toBe('a')
    })

    it('should return empty string for empty trie', () => {
      expect(trie.shortestPrefixOf('hello')).toBe('')
    })

    it('should handle empty string query', () => {
      expect(trie.shortestPrefixOf('')).toBe('')
    })

    it('should return empty string when only longer prefixes match', () => {
      trie.insert('abc', 1)
      expect(trie.shortestPrefixOf('ab')).toBe('')
    })

    it('should return first match in single character', () => {
      trie.insert('a', 1)
      trie.insert('ab', 2)
      expect(trie.shortestPrefixOf('abcd')).toBe('a')
    })

    it('should handle multiple prefix matches at different depths', () => {
      trie.insert('test', 1)
      trie.insert('testing', 2)
      trie.insert('testcase', 3)
      expect(trie.shortestPrefixOf('testingxyz')).toBe('test')
    })
  })

  describe('containsPrefix', () => {
    it('should return true for existing prefix', () => {
      trie.insert('apple', 1)
      trie.insert('application', 2)
      expect(trie.containsPrefix('app')).toBe(true)
    })

    it('should return false for non-existing prefix', () => {
      trie.insert('apple', 1)
      expect(trie.containsPrefix('ban')).toBe(false)
    })

    it('should return false for empty trie', () => {
      expect(trie.containsPrefix('a')).toBe(false)
    })

    it('should return true for exact key match', () => {
      trie.insert('hello', 1)
      expect(trie.containsPrefix('hello')).toBe(true)
    })

    it('should return true for prefix that is also a key', () => {
      trie.insert('app', 1)
      trie.insert('apple', 2)
      expect(trie.containsPrefix('app')).toBe(true)
    })

    it('should return false after deleting all keys with prefix', () => {
      trie.insert('abc', 1)
      trie.delete('abc')
      expect(trie.containsPrefix('a')).toBe(false)
    })

    it('should return true for empty string on non-empty trie', () => {
      trie.insert('a', 1)
      expect(trie.containsPrefix('')).toBe(true)
    })

    it('should return false for empty string on empty trie', () => {
      expect(trie.containsPrefix('')).toBe(false)
    })
  })

  describe('generic value types', () => {
    it('should work with string values', () => {
      const t = new BitmapTrie<string>()
      t.insert('key', 'value')
      expect(t.get('key')).toBe('value')
    })

    it('should work with object values', () => {
      const t = new BitmapTrie<{ name: string }>()
      t.insert('key', { name: 'test' })
      expect(t.get('key')!.name).toBe('test')
    })

    it('should work with null values', () => {
      const t = new BitmapTrie<null>()
      t.insert('key', null)
      expect(t.get('key')).toBeNull()
    })

    it('should work with boolean values', () => {
      const t = new BitmapTrie<boolean>()
      t.insert('true', true)
      t.insert('false', false)
      expect(t.get('true')).toBe(true)
      expect(t.get('false')).toBe(false)
    })

    it('should work with array values', () => {
      const t = new BitmapTrie<number[]>()
      t.insert('list', [1, 2, 3])
      expect(t.get('list')).toEqual([1, 2, 3])
    })
  })

  describe('edge cases', () => {
    it('should handle setting the same key multiple times', () => {
      trie.insert('key', 1)
      trie.insert('key', 2)
      trie.insert('key', 3)
      expect(trie.size).toBe(1)
      expect(trie.get('key')).toBe(3)
    })

    it('should handle deleting same key twice', () => {
      trie.insert('a', 1)
      expect(trie.delete('a')).toBe(true)
      expect(trie.delete('a')).toBe(false)
    })

    it('should handle clear followed by operations', () => {
      trie.insert('a', 1)
      trie.clear()
      expect(trie.size).toBe(0)
      trie.insert('b', 2)
      expect(trie.get('b')).toBe(2)
      expect(trie.keys()).toEqual(['b'])
    })

    it('should handle deeply nested keys', () => {
      const deep = 'a'.repeat(1000)
      trie.insert(deep, 42)
      expect(trie.get(deep)).toBe(42)
      expect(trie.has(deep)).toBe(true)
    })

    it('should handle mixed operations', () => {
      trie.insert('abc', 1)
      trie.insert('ab', 2)
      trie.insert('abcd', 3)
      trie.delete('ab')
      expect(trie.has('abc')).toBe(true)
      expect(trie.has('ab')).toBe(false)
      expect(trie.has('abcd')).toBe(true)
      trie.insert('ab', 4)
      expect(trie.get('ab')).toBe(4)
      expect(trie.size).toBe(3)
    })

    it('should handle large number of keys', () => {
      for (let i = 0; i < 1000; i++) {
        trie.insert(`key${i}`, i)
      }
      expect(trie.size).toBe(1000)
      expect(trie.get('key500')).toBe(500)
      expect(trie.has('key999')).toBe(true)
      expect(trie.has('key1000')).toBe(false)
    })

    it('should handle all 26 first-level characters', () => {
      for (let i = 0; i < 26; i++) {
        trie.insert(String.fromCharCode(97 + i), i)
      }
      expect(trie.size).toBe(26)
      expect(trie.get('a')).toBe(0)
      expect(trie.get('z')).toBe(25)
      expect(trie.keys().length).toBe(26)
    })

    it('should handle single branch deep tree', () => {
      trie.insert('a', 1)
      trie.insert('ab', 2)
      trie.insert('abc', 3)
      trie.insert('abcd', 4)
      trie.insert('abcde', 5)
      expect(trie.size).toBe(5)
      expect(trie.get('abcde')).toBe(5)
      trie.delete('abcd')
      expect(trie.get('abcd')).toBeUndefined()
      expect(trie.get('abcde')).toBe(5)
    })

    it('should handle wide tree with many branches', () => {
      const branches = ['ab', 'ac', 'ad', 'ae', 'af', 'ag', 'ah']
      for (const key of branches) {
        trie.insert(key, key.charCodeAt(1))
      }
      expect(trie.size).toBe(branches.length)
      for (const key of branches) {
        expect(trie.has(key)).toBe(true)
      }
    })

    it('should handle inserting keys in reverse alphabetical order', () => {
      trie.insert('zoo', 1)
      trie.insert('yellow', 2)
      trie.insert('apple', 3)
      expect(trie.keys()).toEqual(['apple', 'yellow', 'zoo'])
      expect(trie.size).toBe(3)
    })
  })

  describe('types and exports', () => {
    it('should export DEFAULT_BITMAP_TRIE_OPTIONS', () => {
      expect(DEFAULT_BITMAP_TRIE_OPTIONS).toEqual({})
    })

    it('should work with BitmapTrieNode type', () => {
      const node: BitmapTrieNode<string> = {
        bitmap: 0,
        children: [],
        value: undefined,
        isEnd: false,
      }
      expect(node.bitmap).toBe(0)
      expect(node.children).toEqual([])
      expect(node.value).toBeUndefined()
      expect(node.isEnd).toBe(false)
    })

    it('should work with BitmapTrieOptions type', () => {
      const opts: BitmapTrieOptions = {}
      const t = new BitmapTrie(opts)
      expect(t.size).toBe(0)
    })
  })

  describe('stress', () => {
    it('should handle many insertions and lookups', () => {
      const words: string[] = []
      for (let i = 0; i < 500; i++) {
        const word = `word${i}`
        words.push(word)
        trie.insert(word, i)
      }
      for (let i = 0; i < 500; i++) {
        expect(trie.get(words[i]!)).toBe(i)
      }
      expect(trie.size).toBe(500)
    })

    it('should handle mixed bulk operations', () => {
      for (let i = 0; i < 200; i++) {
        trie.insert(`key${i}`, i)
      }
      for (let i = 0; i < 100; i++) {
        trie.delete(`key${i}`)
      }
      expect(trie.size).toBe(100)
      for (let i = 100; i < 200; i++) {
        expect(trie.has(`key${i}`)).toBe(true)
      }
      for (let i = 0; i < 100; i++) {
        expect(trie.has(`key${i}`)).toBe(false)
      }
    })

    it('should handle delete all keys', () => {
      for (let i = 0; i < 100; i++) {
        trie.insert(`key${i}`, i)
      }
      for (let i = 0; i < 100; i++) {
        expect(trie.delete(`key${i}`)).toBe(true)
      }
      expect(trie.isEmpty).toBe(true)
      expect(trie.size).toBe(0)
      expect(trie.keys()).toEqual([])
    })
  })

  describe('bitmap-specific behavior', () => {
    it('should correctly manage dense children array on insert', () => {
      trie.insert('b', 2)
      trie.insert('a', 1)
      trie.insert('d', 4)
      trie.insert('c', 3)
      expect(trie.keys()).toEqual(['a', 'b', 'c', 'd'])
    })

    it('should correctly manage dense children array on delete', () => {
      trie.insert('a', 1)
      trie.insert('b', 2)
      trie.insert('c', 3)
      trie.delete('b')
      expect(trie.keys()).toEqual(['a', 'c'])
      trie.insert('b', 20)
      expect(trie.get('b')).toBe(20)
    })

    it('should handle interleaved insert and delete of siblings', () => {
      trie.insert('ab', 1)
      trie.insert('ac', 2)
      trie.insert('ad', 3)
      trie.delete('ac')
      expect(trie.keys()).toEqual(['ab', 'ad'])
      trie.insert('ae', 4)
      expect(trie.keys()).toEqual(['ab', 'ad', 'ae'])
      trie.delete('ab')
      expect(trie.keys()).toEqual(['ad', 'ae'])
    })

    it('should handle reinserting into deleted slot', () => {
      trie.insert('a', 1)
      trie.delete('a')
      expect(trie.has('a')).toBe(false)
      trie.insert('a', 10)
      expect(trie.get('a')).toBe(10)
    })

    it('should handle complex prefix operations after deletes', () => {
      trie.insert('car', 1)
      trie.insert('card', 2)
      trie.insert('care', 3)
      trie.delete('card')
      expect(trie.startsWith('car')).toEqual(['car', 'care'])
      expect(trie.containsPrefix('car')).toBe(true)
      expect(trie.longestPrefixOf('cardinal')).toBe('car')
    })
  })
})
