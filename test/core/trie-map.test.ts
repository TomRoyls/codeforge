import { describe, it, expect, beforeEach } from 'vitest'
import { TrieMap } from '../../src/core/trie-map/trie-map.js'
import { DEFAULT_TRIEMAP_OPTIONS } from '../../src/core/trie-map/types.js'
import type { TrieMapNode, TrieMapOptions } from '../../src/core/trie-map/types.js'

describe('TrieMap', () => {
  let trie: TrieMap<number>

  beforeEach(() => {
    trie = new TrieMap<number>()
  })

  describe('constructor', () => {
    it('should create an empty trie map', () => {
      const t = new TrieMap<string>()
      expect(t.size()).toBe(0)
    })

    it('should create a trie map with default options', () => {
      const t = new TrieMap()
      expect(t.isEmpty()).toBe(true)
    })

    it('should accept options parameter', () => {
      const t = new TrieMap<string>({})
      expect(t.size()).toBe(0)
    })
  })

  describe('set and get', () => {
    it('should set and get a value for a key', () => {
      trie.set('hello', 1)
      expect(trie.get('hello')).toBe(1)
    })

    it('should return undefined for non-existent key', () => {
      expect(trie.get('hello')).toBeUndefined()
    })

    it('should set and get multiple key-value pairs', () => {
      trie.set('hello', 1)
      trie.set('world', 2)
      trie.set('help', 3)
      expect(trie.get('hello')).toBe(1)
      expect(trie.get('world')).toBe(2)
      expect(trie.get('help')).toBe(3)
    })

    it('should overwrite existing value', () => {
      trie.set('hello', 1)
      trie.set('hello', 2)
      expect(trie.get('hello')).toBe(2)
    })

    it('should not increase size when overwriting', () => {
      trie.set('hello', 1)
      expect(trie.size()).toBe(1)
      trie.set('hello', 2)
      expect(trie.size()).toBe(1)
    })

    it('should handle empty string key', () => {
      trie.set('', 42)
      expect(trie.get('')).toBe(42)
    })

    it('should handle single character keys', () => {
      trie.set('a', 1)
      trie.set('b', 2)
      expect(trie.get('a')).toBe(1)
      expect(trie.get('b')).toBe(2)
    })

    it('should handle keys that are prefixes of each other', () => {
      trie.set('app', 1)
      trie.set('apple', 2)
      trie.set('applet', 3)
      expect(trie.get('app')).toBe(1)
      expect(trie.get('apple')).toBe(2)
      expect(trie.get('applet')).toBe(3)
    })

    it('should handle unicode keys', () => {
      trie.set('café', 1)
      trie.set('naïve', 2)
      expect(trie.get('café')).toBe(1)
      expect(trie.get('naïve')).toBe(2)
    })

    it('should handle numeric string keys', () => {
      trie.set('123', 1)
      trie.set('12345', 2)
      expect(trie.get('123')).toBe(1)
      expect(trie.get('12345')).toBe(2)
    })

    it('should get undefined for key that is prefix but not inserted', () => {
      trie.set('apple', 1)
      expect(trie.get('app')).toBeUndefined()
    })

    it('should get undefined for key that extends past inserted key', () => {
      trie.set('app', 1)
      expect(trie.get('apple')).toBeUndefined()
    })
  })

  describe('has', () => {
    it('should return true for existing key', () => {
      trie.set('hello', 1)
      expect(trie.has('hello')).toBe(true)
    })

    it('should return false for non-existent key', () => {
      expect(trie.has('hello')).toBe(false)
    })

    it('should return false for prefix that was not inserted', () => {
      trie.set('apple', 1)
      expect(trie.has('app')).toBe(false)
    })

    it('should return false for extension of inserted key', () => {
      trie.set('app', 1)
      expect(trie.has('apple')).toBe(false)
    })

    it('should return true after set and false after delete', () => {
      trie.set('hello', 1)
      expect(trie.has('hello')).toBe(true)
      trie.delete('hello')
      expect(trie.has('hello')).toBe(false)
    })

    it('should handle empty string key', () => {
      expect(trie.has('')).toBe(false)
      trie.set('', 1)
      expect(trie.has('')).toBe(true)
    })
  })

  describe('delete', () => {
    it('should delete an existing key', () => {
      trie.set('hello', 1)
      expect(trie.delete('hello')).toBe(true)
      expect(trie.has('hello')).toBe(false)
    })

    it('should return false for non-existent key', () => {
      expect(trie.delete('hello')).toBe(false)
    })

    it('should decrease size on delete', () => {
      trie.set('hello', 1)
      trie.set('world', 2)
      expect(trie.size()).toBe(2)
      trie.delete('hello')
      expect(trie.size()).toBe(1)
    })

    it('should not affect sibling keys', () => {
      trie.set('hello', 1)
      trie.set('help', 2)
      trie.delete('hello')
      expect(trie.has('hello')).toBe(false)
      expect(trie.has('help')).toBe(true)
    })

    it('should not affect parent prefix keys', () => {
      trie.set('app', 1)
      trie.set('apple', 2)
      trie.delete('apple')
      expect(trie.has('app')).toBe(true)
      expect(trie.has('apple')).toBe(false)
    })

    it('should not affect child keys', () => {
      trie.set('app', 1)
      trie.set('apple', 2)
      trie.delete('app')
      expect(trie.has('apple')).toBe(true)
      expect(trie.has('app')).toBe(false)
    })

    it('should handle deleting the only key', () => {
      trie.set('hello', 1)
      trie.delete('hello')
      expect(trie.isEmpty()).toBe(true)
    })

    it('should handle deleting a prefix key', () => {
      trie.set('app', 1)
      trie.set('apple', 2)
      trie.set('application', 3)
      trie.delete('app')
      expect(trie.has('app')).toBe(false)
      expect(trie.has('apple')).toBe(true)
      expect(trie.has('application')).toBe(true)
    })

    it('should handle deleting a leaf key', () => {
      trie.set('app', 1)
      trie.set('apple', 2)
      trie.delete('apple')
      expect(trie.has('app')).toBe(true)
      expect(trie.has('apple')).toBe(false)
    })

    it('should allow re-adding a deleted key', () => {
      trie.set('hello', 1)
      trie.delete('hello')
      trie.set('hello', 2)
      expect(trie.get('hello')).toBe(2)
      expect(trie.size()).toBe(1)
    })

    it('should handle deleting empty string key', () => {
      trie.set('', 1)
      expect(trie.delete('')).toBe(true)
      expect(trie.has('')).toBe(false)
    })
  })

  describe('size', () => {
    it('should return 0 for empty trie', () => {
      expect(trie.size()).toBe(0)
    })

    it('should return correct size after insertions', () => {
      trie.set('a', 1)
      trie.set('ab', 2)
      trie.set('abc', 3)
      expect(trie.size()).toBe(3)
    })

    it('should return correct size after deletions', () => {
      trie.set('a', 1)
      trie.set('b', 2)
      trie.set('c', 3)
      trie.delete('b')
      expect(trie.size()).toBe(2)
    })

    it('should return correct size after overwrite', () => {
      trie.set('a', 1)
      trie.set('a', 2)
      expect(trie.size()).toBe(1)
    })

    it('should return correct size after clear and re-insert', () => {
      trie.set('a', 1)
      trie.set('b', 2)
      trie.clear()
      trie.set('c', 3)
      expect(trie.size()).toBe(1)
    })
  })

  describe('isEmpty', () => {
    it('should return true for new trie', () => {
      expect(trie.isEmpty()).toBe(true)
    })

    it('should return false after insertion', () => {
      trie.set('hello', 1)
      expect(trie.isEmpty()).toBe(false)
    })

    it('should return true after deleting all keys', () => {
      trie.set('hello', 1)
      trie.delete('hello')
      expect(trie.isEmpty()).toBe(true)
    })

    it('should return true after clear', () => {
      trie.set('hello', 1)
      trie.clear()
      expect(trie.isEmpty()).toBe(true)
    })

    it('should return false when some keys remain', () => {
      trie.set('a', 1)
      trie.set('b', 2)
      trie.delete('a')
      expect(trie.isEmpty()).toBe(false)
    })
  })

  describe('clear', () => {
    it('should clear all entries', () => {
      trie.set('a', 1)
      trie.set('b', 2)
      trie.set('c', 3)
      trie.clear()
      expect(trie.size()).toBe(0)
      expect(trie.isEmpty()).toBe(true)
    })

    it('should allow insertions after clear', () => {
      trie.set('a', 1)
      trie.clear()
      trie.set('b', 2)
      expect(trie.get('b')).toBe(2)
      expect(trie.has('a')).toBe(false)
    })

    it('should handle clearing empty trie', () => {
      trie.clear()
      expect(trie.size()).toBe(0)
    })
  })

  describe('keys', () => {
    it('should return empty array for empty trie', () => {
      expect(trie.keys()).toEqual([])
    })

    it('should return all keys', () => {
      trie.set('hello', 1)
      trie.set('world', 2)
      const keys = trie.keys()
      expect(keys).toContain('hello')
      expect(keys).toContain('world')
      expect(keys.length).toBe(2)
    })

    it('should return keys in DFS order', () => {
      trie.set('a', 1)
      trie.set('ab', 2)
      trie.set('ac', 3)
      const keys = trie.keys()
      expect(keys).toEqual(['a', 'ab', 'ac'])
    })

    it('should not include deleted keys', () => {
      trie.set('a', 1)
      trie.set('b', 2)
      trie.delete('a')
      expect(trie.keys()).toEqual(['b'])
    })

    it('should include empty string key', () => {
      trie.set('', 1)
      trie.set('a', 2)
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
      trie.set('a', 1)
      trie.set('b', 2)
      trie.set('c', 3)
      const values = trie.values()
      expect(values).toContain(1)
      expect(values).toContain(2)
      expect(values).toContain(3)
      expect(values.length).toBe(3)
    })

    it('should reflect overwritten values', () => {
      trie.set('a', 1)
      trie.set('a', 99)
      expect(trie.values()).toEqual([99])
    })

    it('should not include deleted values', () => {
      trie.set('a', 1)
      trie.set('b', 2)
      trie.delete('a')
      expect(trie.values()).toEqual([2])
    })
  })

  describe('entries', () => {
    it('should return empty array for empty trie', () => {
      expect(trie.entries()).toEqual([])
    })

    it('should return all key-value pairs', () => {
      trie.set('a', 1)
      trie.set('b', 2)
      const entries = trie.entries()
      expect(entries).toEqual([
        ['a', 1],
        ['b', 2],
      ])
    })

    it('should reflect current values after overwrite', () => {
      trie.set('a', 1)
      trie.set('a', 10)
      const entries = trie.entries()
      expect(entries).toEqual([['a', 10]])
    })

    it('should not include deleted entries', () => {
      trie.set('a', 1)
      trie.set('b', 2)
      trie.delete('a')
      expect(trie.entries()).toEqual([['b', 2]])
    })

    it('should return entries in key order', () => {
      trie.set('ab', 1)
      trie.set('a', 2)
      trie.set('ac', 3)
      const entries = trie.entries()
      expect(entries).toEqual([
        ['a', 2],
        ['ab', 1],
        ['ac', 3],
      ])
    })
  })

  describe('forEach', () => {
    it('should iterate over all entries', () => {
      trie.set('a', 1)
      trie.set('b', 2)
      trie.set('c', 3)
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
      trie.set('hello', 42)
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
      trie.set('apple', 1)
      trie.set('application', 2)
      trie.set('apply', 3)
      trie.set('banana', 4)
      const result = trie.startsWith('app')
      expect(result).toContain('apple')
      expect(result).toContain('application')
      expect(result).toContain('apply')
      expect(result).not.toContain('banana')
    })

    it('should return empty array for non-matching prefix', () => {
      trie.set('apple', 1)
      expect(trie.startsWith('ban')).toEqual([])
    })

    it('should return empty array for empty trie', () => {
      expect(trie.startsWith('a')).toEqual([])
    })

    it('should return the prefix itself if it is a key', () => {
      trie.set('app', 1)
      trie.set('apple', 2)
      const result = trie.startsWith('app')
      expect(result).toContain('app')
      expect(result).toContain('apple')
    })

    it('should handle empty string prefix returning all keys', () => {
      trie.set('a', 1)
      trie.set('b', 2)
      expect(trie.startsWith('')).toEqual(['a', 'b'])
    })

    it('should handle single character prefix', () => {
      trie.set('a', 1)
      trie.set('ab', 2)
      trie.set('ac', 3)
      trie.set('b', 4)
      const result = trie.startsWith('a')
      expect(result).toEqual(['a', 'ab', 'ac'])
    })

    it('should handle prefix longer than any key', () => {
      trie.set('a', 1)
      expect(trie.startsWith('abcdefghijkl')).toEqual([])
    })

    it('should work after deletion', () => {
      trie.set('apple', 1)
      trie.set('application', 2)
      trie.delete('apple')
      const result = trie.startsWith('app')
      expect(result).toEqual(['application'])
    })
  })

  describe('longestCommonPrefix', () => {
    it('should return empty string for empty trie', () => {
      expect(trie.longestCommonPrefix()).toBe('')
    })

    it('should return the key itself for single key', () => {
      trie.set('hello', 1)
      expect(trie.longestCommonPrefix()).toBe('hello')
    })

    it('should return common prefix of multiple keys', () => {
      trie.set('apple', 1)
      trie.set('application', 2)
      trie.set('apply', 3)
      expect(trie.longestCommonPrefix()).toBe('appl')
    })

    it('should return empty string when no common prefix', () => {
      trie.set('abc', 1)
      trie.set('xyz', 2)
      expect(trie.longestCommonPrefix()).toBe('')
    })

    it('should handle keys with full overlap', () => {
      trie.set('app', 1)
      trie.set('apple', 2)
      expect(trie.longestCommonPrefix()).toBe('app')
    })

    it('should handle single character common prefix', () => {
      trie.set('abc', 1)
      trie.set('ade', 2)
      trie.set('afg', 3)
      expect(trie.longestCommonPrefix()).toBe('a')
    })

    it('should handle all identical keys (after overwrite)', () => {
      trie.set('hello', 1)
      trie.set('hello', 2)
      expect(trie.longestCommonPrefix()).toBe('hello')
    })

    it('should work after deletion', () => {
      trie.set('abc', 1)
      trie.set('abd', 2)
      trie.set('xyz', 3)
      trie.delete('xyz')
      expect(trie.longestCommonPrefix()).toBe('ab')
    })
  })

  describe('longestPrefixOf', () => {
    it('should return empty string for no matching prefix', () => {
      trie.set('abc', 1)
      expect(trie.longestPrefixOf('xyz')).toBe('')
    })

    it('should return the key if it matches exactly', () => {
      trie.set('hello', 1)
      expect(trie.longestPrefixOf('hello')).toBe('hello')
    })

    it('should return longest matching prefix', () => {
      trie.set('app', 1)
      trie.set('apple', 2)
      expect(trie.longestPrefixOf('appletree')).toBe('apple')
    })

    it('should return empty string for empty trie', () => {
      expect(trie.longestPrefixOf('hello')).toBe('')
    })

    it('should handle empty string query', () => {
      trie.set('', 1)
      expect(trie.longestPrefixOf('')).toBe('')
    })

    it('should handle empty string query with empty key', () => {
      trie.set('', 42)
      expect(trie.longestPrefixOf('')).toBe('')
    })

    it('should return shorter prefix when longer is not a key', () => {
      trie.set('a', 1)
      trie.set('abc', 2)
      expect(trie.longestPrefixOf('abcdef')).toBe('abc')
    })

    it('should handle single character matches', () => {
      trie.set('a', 1)
      expect(trie.longestPrefixOf('abc')).toBe('a')
    })

    it('should return empty when query is shorter than any key', () => {
      trie.set('abc', 1)
      trie.set('abcd', 2)
      expect(trie.longestPrefixOf('ab')).toBe('')
    })

    it('should choose the longest among multiple prefix matches', () => {
      trie.set('a', 1)
      trie.set('ab', 2)
      trie.set('abc', 3)
      trie.set('abcd', 4)
      expect(trie.longestPrefixOf('abcdefg')).toBe('abcd')
    })

    it('should stop at first non-matching character', () => {
      trie.set('abc', 1)
      trie.set('xyz', 2)
      expect(trie.longestPrefixOf('abxyz')).toBe('')
    })
  })

  describe('generic value types', () => {
    it('should work with string values', () => {
      const t = new TrieMap<string>()
      t.set('key', 'value')
      expect(t.get('key')).toBe('value')
    })

    it('should work with object values', () => {
      const t = new TrieMap<{ name: string }>()
      t.set('key', { name: 'test' })
      expect(t.get('key')!.name).toBe('test')
    })

    it('should work with null values', () => {
      const t = new TrieMap<null>()
      t.set('key', null)
      expect(t.get('key')).toBeNull()
    })

    it('should work with boolean values', () => {
      const t = new TrieMap<boolean>()
      t.set('true', true)
      t.set('false', false)
      expect(t.get('true')).toBe(true)
      expect(t.get('false')).toBe(false)
    })

    it('should work with array values', () => {
      const t = new TrieMap<number[]>()
      t.set('list', [1, 2, 3])
      expect(t.get('list')).toEqual([1, 2, 3])
    })
  })

  describe('edge cases', () => {
    it('should handle setting the same key multiple times', () => {
      trie.set('key', 1)
      trie.set('key', 2)
      trie.set('key', 3)
      expect(trie.size()).toBe(1)
      expect(trie.get('key')).toBe(3)
    })

    it('should handle deleting same key twice', () => {
      trie.set('a', 1)
      expect(trie.delete('a')).toBe(true)
      expect(trie.delete('a')).toBe(false)
    })

    it('should handle clear followed by operations', () => {
      trie.set('a', 1)
      trie.clear()
      expect(trie.size()).toBe(0)
      trie.set('b', 2)
      expect(trie.get('b')).toBe(2)
      expect(trie.keys()).toEqual(['b'])
    })

    it('should handle deeply nested keys', () => {
      const deep = 'a'.repeat(1000)
      trie.set(deep, 42)
      expect(trie.get(deep)).toBe(42)
      expect(trie.has(deep)).toBe(true)
    })

    it('should handle mixed operations', () => {
      trie.set('abc', 1)
      trie.set('ab', 2)
      trie.set('abcd', 3)
      trie.delete('ab')
      expect(trie.has('abc')).toBe(true)
      expect(trie.has('ab')).toBe(false)
      expect(trie.has('abcd')).toBe(true)
      trie.set('ab', 4)
      expect(trie.get('ab')).toBe(4)
      expect(trie.size()).toBe(3)
    })

    it('should handle keys with special regex characters', () => {
      trie.set('a.b', 1)
      trie.set('a*b', 2)
      trie.set('a+b', 3)
      expect(trie.get('a.b')).toBe(1)
      expect(trie.get('a*b')).toBe(2)
      expect(trie.get('a+b')).toBe(3)
    })

    it('should handle whitespace keys', () => {
      trie.set(' ', 1)
      trie.set('  ', 2)
      trie.set(' a ', 3)
      expect(trie.get(' ')).toBe(1)
      expect(trie.get('  ')).toBe(2)
      expect(trie.get(' a ')).toBe(3)
    })

    it('should handle large number of keys', () => {
      for (let i = 0; i < 1000; i++) {
        trie.set(`key${i}`, i)
      }
      expect(trie.size()).toBe(1000)
      expect(trie.get('key500')).toBe(500)
      expect(trie.has('key999')).toBe(true)
      expect(trie.has('key1000')).toBe(false)
    })
  })

  describe('types and exports', () => {
    it('should export DEFAULT_TRIEMAP_OPTIONS', () => {
      expect(DEFAULT_TRIEMAP_OPTIONS).toEqual({})
    })

    it('should work with TrieMapNode type', () => {
      const node: TrieMapNode<string> = {
        children: new Map(),
        value: undefined,
        isEnd: false,
      }
      expect(node.children).toBeInstanceOf(Map)
      expect(node.value).toBeUndefined()
      expect(node.isEnd).toBe(false)
    })

    it('should work with TrieMapOptions type', () => {
      const opts: TrieMapOptions = {}
      const t = new TrieMap(opts)
      expect(t.size()).toBe(0)
    })
  })

  describe('startsWith after complex operations', () => {
    it('should work correctly after set and delete cycles', () => {
      trie.set('car', 1)
      trie.set('card', 2)
      trie.set('care', 3)
      trie.delete('card')
      const result = trie.startsWith('car')
      expect(result).toContain('car')
      expect(result).toContain('care')
      expect(result).not.toContain('card')
    })

    it('should find all keys when prefix matches everything', () => {
      trie.set('test1', 1)
      trie.set('test2', 2)
      trie.set('test3', 3)
      expect(trie.startsWith('test').length).toBe(3)
    })
  })

  describe('longestCommonPrefix after operations', () => {
    it('should return empty after clear', () => {
      trie.set('abc', 1)
      trie.set('abd', 2)
      trie.clear()
      expect(trie.longestCommonPrefix()).toBe('')
    })

    it('should update after new key breaks common prefix', () => {
      trie.set('abc', 1)
      trie.set('abd', 2)
      expect(trie.longestCommonPrefix()).toBe('ab')
      trie.set('xyz', 3)
      expect(trie.longestCommonPrefix()).toBe('')
    })
  })

  describe('forEach iteration order', () => {
    it('should iterate in insertion-character order', () => {
      trie.set('b', 2)
      trie.set('a', 1)
      trie.set('c', 3)
      const keys: string[] = []
      trie.forEach((key) => {
        keys.push(key)
      })
      expect(keys).toEqual(['b', 'a', 'c'])
    })

    it('should iterate nested keys correctly', () => {
      trie.set('a', 1)
      trie.set('ab', 2)
      trie.set('ac', 3)
      const keys: string[] = []
      trie.forEach((key) => {
        keys.push(key)
      })
      expect(keys).toEqual(['a', 'ab', 'ac'])
    })
  })

  describe('autocomplete', () => {
    it('should return all keys with given prefix', () => {
      trie.set('apple', 1)
      trie.set('application', 2)
      trie.set('apply', 3)
      trie.set('banana', 4)
      const result = trie.autocomplete('app')
      expect(result).toContain('apple')
      expect(result).toContain('application')
      expect(result).toContain('apply')
      expect(result).not.toContain('banana')
    })

    it('should respect limit parameter', () => {
      trie.set('apple', 1)
      trie.set('application', 2)
      trie.set('apply', 3)
      const result = trie.autocomplete('app', 2)
      expect(result.length).toBe(2)
    })

    it('should return empty array for non-matching prefix', () => {
      trie.set('apple', 1)
      expect(trie.autocomplete('ban')).toEqual([])
    })

    it('should return empty array for empty trie', () => {
      expect(trie.autocomplete('a')).toEqual([])
    })

    it('should handle empty string prefix returning all keys', () => {
      trie.set('a', 1)
      trie.set('b', 2)
      expect(trie.autocomplete('')).toEqual(['a', 'b'])
    })

    it('should handle limit larger than results', () => {
      trie.set('a', 1)
      trie.set('ab', 2)
      const result = trie.autocomplete('a', 100)
      expect(result.length).toBe(2)
    })

    it('should handle limit of 0', () => {
      trie.set('apple', 1)
      trie.set('application', 2)
      expect(trie.autocomplete('app', 0)).toEqual([])
    })

    it('should handle limit of 1', () => {
      trie.set('apple', 1)
      trie.set('application', 2)
      trie.set('apply', 3)
      const result = trie.autocomplete('app', 1)
      expect(result.length).toBe(1)
    })

    it('should work with Unicode prefixes', () => {
      trie.set('café', 1)
      trie.set('cafétière', 2)
      const result = trie.autocomplete('café')
      expect(result).toContain('café')
      expect(result).toContain('cafétière')
    })
  })

  describe('clone', () => {
    it('should create an independent copy', () => {
      trie.set('a', 1)
      trie.set('b', 2)
      const cloned = trie.clone()
      expect(cloned.size()).toBe(2)
      expect(cloned.get('a')).toBe(1)
      expect(cloned.get('b')).toBe(2)
    })

    it('should not affect original when modified', () => {
      trie.set('hello', 1)
      const cloned = trie.clone()
      cloned.set('world', 2)
      expect(cloned.has('world')).toBe(true)
      expect(trie.has('world')).toBe(false)
    })

    it('should not affect clone when original is modified', () => {
      trie.set('hello', 1)
      const cloned = trie.clone()
      trie.set('world', 2)
      expect(cloned.has('world')).toBe(false)
      expect(trie.has('world')).toBe(true)
    })

    it('should clone an empty trie', () => {
      const cloned = trie.clone()
      expect(cloned.size()).toBe(0)
      expect(cloned.isEmpty()).toBe(true)
    })

    it('should handle deletion independence', () => {
      trie.set('a', 1)
      trie.set('b', 2)
      const cloned = trie.clone()
      cloned.delete('a')
      expect(cloned.has('a')).toBe(false)
      expect(trie.has('a')).toBe(true)
    })

    it('should handle clear independence', () => {
      trie.set('a', 1)
      const cloned = trie.clone()
      cloned.clear()
      expect(cloned.isEmpty()).toBe(true)
      expect(trie.isEmpty()).toBe(false)
    })
  })

  describe('Symbol.iterator', () => {
    it('should iterate over all entries', () => {
      trie.set('a', 1)
      trie.set('b', 2)
      trie.set('c', 3)
      const result: Array<[string, number]> = []
      for (const entry of trie) {
        result.push(entry)
      }
      expect(result.length).toBe(3)
    })

    it('should yield correct key-value pairs', () => {
      trie.set('hello', 42)
      for (const [key, value] of trie) {
        expect(key).toBe('hello')
        expect(value).toBe(42)
      }
    })

    it('should not iterate for empty trie', () => {
      const result: Array<[string, number]> = []
      for (const entry of trie) {
        result.push(entry)
      }
      expect(result).toEqual([])
    })

    it('should work with spread operator', () => {
      trie.set('a', 1)
      trie.set('b', 2)
      const entries = [...trie]
      expect(entries.length).toBe(2)
    })

    it('should work with Array.from', () => {
      trie.set('x', 10)
      trie.set('y', 20)
      const entries = Array.from(trie)
      expect(entries.length).toBe(2)
    })
  })
})
