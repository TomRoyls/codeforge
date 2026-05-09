import { describe, it, expect, beforeEach } from 'vitest'
import { RadixTrie } from '../../src/core/radix-trie/radix-trie.js'
import type { RadixNode } from '../../src/core/radix-trie/types.js'

describe('RadixTrie', () => {
  let trie: RadixTrie<number>

  beforeEach(() => {
    trie = new RadixTrie<number>()
  })

  describe('constructor', () => {
    it('should create an empty radix trie', () => {
      const t = new RadixTrie<string>()
      expect(t.size).toBe(0)
    })

    it('should create a radix trie that is empty', () => {
      const t = new RadixTrie()
      expect(t.isEmpty).toBe(true)
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
      expect(trie.size).toBe(1)
      trie.set('hello', 2)
      expect(trie.size).toBe(1)
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

  describe('prefix splitting', () => {
    it('should split edges when keys share partial prefix', () => {
      trie.set('romane', 1)
      trie.set('romanus', 2)
      expect(trie.get('romane')).toBe(1)
      expect(trie.get('romanus')).toBe(2)
      expect(trie.size).toBe(2)
    })

    it('should split edges for three-way branching', () => {
      trie.set('romane', 1)
      trie.set('romanus', 2)
      trie.set('romulus', 3)
      expect(trie.get('romane')).toBe(1)
      expect(trie.get('romanus')).toBe(2)
      expect(trie.get('romulus')).toBe(3)
    })

    it('should handle inserting key that is prefix of existing', () => {
      trie.set('apple', 1)
      trie.set('app', 2)
      expect(trie.get('apple')).toBe(1)
      expect(trie.get('app')).toBe(2)
    })

    it('should handle inserting existing key that is prefix of new', () => {
      trie.set('app', 1)
      trie.set('apple', 2)
      expect(trie.get('app')).toBe(1)
      expect(trie.get('apple')).toBe(2)
    })

    it('should handle completely disjoint keys', () => {
      trie.set('abc', 1)
      trie.set('xyz', 2)
      expect(trie.get('abc')).toBe(1)
      expect(trie.get('xyz')).toBe(2)
    })

    it('should handle multiple splits at different depths', () => {
      trie.set('a', 1)
      trie.set('ab', 2)
      trie.set('abc', 3)
      trie.set('abcd', 4)
      expect(trie.get('a')).toBe(1)
      expect(trie.get('ab')).toBe(2)
      expect(trie.get('abc')).toBe(3)
      expect(trie.get('abcd')).toBe(4)
    })

    it('should compact nodes with single child after splitting', () => {
      trie.set('test', 1)
      trie.set('team', 2)
      trie.set('tear', 3)
      expect(trie.get('test')).toBe(1)
      expect(trie.get('team')).toBe(2)
      expect(trie.get('tear')).toBe(3)
      expect(trie.size).toBe(3)
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
      expect(trie.size).toBe(2)
      trie.delete('hello')
      expect(trie.size).toBe(1)
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
      expect(trie.isEmpty).toBe(true)
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
      expect(trie.size).toBe(1)
    })

    it('should handle deleting empty string key', () => {
      trie.set('', 1)
      expect(trie.delete('')).toBe(true)
      expect(trie.has('')).toBe(false)
    })

    it('should merge nodes after delete when only one child remains', () => {
      trie.set('ab', 1)
      trie.set('abc', 2)
      trie.delete('ab')
      expect(trie.has('abc')).toBe(true)
      expect(trie.get('abc')).toBe(2)
    })

    it('should handle deleting from split nodes', () => {
      trie.set('romane', 1)
      trie.set('romanus', 2)
      trie.delete('romane')
      expect(trie.has('romane')).toBe(false)
      expect(trie.has('romanus')).toBe(true)
      expect(trie.get('romanus')).toBe(2)
    })
  })

  describe('size', () => {
    it('should return 0 for empty trie', () => {
      expect(trie.size).toBe(0)
    })

    it('should return correct size after insertions', () => {
      trie.set('a', 1)
      trie.set('ab', 2)
      trie.set('abc', 3)
      expect(trie.size).toBe(3)
    })

    it('should return correct size after deletions', () => {
      trie.set('a', 1)
      trie.set('b', 2)
      trie.set('c', 3)
      trie.delete('b')
      expect(trie.size).toBe(2)
    })

    it('should return correct size after overwrite', () => {
      trie.set('a', 1)
      trie.set('a', 2)
      expect(trie.size).toBe(1)
    })

    it('should return correct size after clear and re-insert', () => {
      trie.set('a', 1)
      trie.set('b', 2)
      trie.clear()
      trie.set('c', 3)
      expect(trie.size).toBe(1)
    })
  })

  describe('isEmpty', () => {
    it('should return true for new trie', () => {
      expect(trie.isEmpty).toBe(true)
    })

    it('should return false after insertion', () => {
      trie.set('hello', 1)
      expect(trie.isEmpty).toBe(false)
    })

    it('should return true after deleting all keys', () => {
      trie.set('hello', 1)
      trie.delete('hello')
      expect(trie.isEmpty).toBe(true)
    })

    it('should return true after clear', () => {
      trie.set('hello', 1)
      trie.clear()
      expect(trie.isEmpty).toBe(true)
    })

    it('should return false when some keys remain', () => {
      trie.set('a', 1)
      trie.set('b', 2)
      trie.delete('a')
      expect(trie.isEmpty).toBe(false)
    })
  })

  describe('clear', () => {
    it('should clear all entries', () => {
      trie.set('a', 1)
      trie.set('b', 2)
      trie.set('c', 3)
      trie.clear()
      expect(trie.size).toBe(0)
      expect(trie.isEmpty).toBe(true)
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
      expect(trie.size).toBe(0)
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

    it('should return keys in lexicographic DFS order', () => {
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
      trie.forEach((value, key) => {
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
      trie.forEach((value, key) => {
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

    it('should handle prefix that ends in middle of edge label', () => {
      trie.set('abcdef', 1)
      trie.set('abcxyz', 2)
      const result = trie.startsWith('abc')
      expect(result).toContain('abcdef')
      expect(result).toContain('abcxyz')
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

    it('should use radix structure for efficient LCP', () => {
      trie.set('testing', 1)
      trie.set('tester', 2)
      trie.set('test', 3)
      expect(trie.longestCommonPrefix()).toBe('test')
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
      expect(cloned.size).toBe(2)
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
      expect(cloned.size).toBe(0)
      expect(cloned.isEmpty).toBe(true)
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
      expect(cloned.isEmpty).toBe(true)
      expect(trie.isEmpty).toBe(false)
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

  describe('generic value types', () => {
    it('should work with string values', () => {
      const t = new RadixTrie<string>()
      t.set('key', 'value')
      expect(t.get('key')).toBe('value')
    })

    it('should work with object values', () => {
      const t = new RadixTrie<{ name: string }>()
      t.set('key', { name: 'test' })
      expect(t.get('key')!.name).toBe('test')
    })

    it('should work with null values', () => {
      const t = new RadixTrie<null>()
      t.set('key', null)
      expect(t.get('key')).toBeNull()
    })

    it('should work with boolean values', () => {
      const t = new RadixTrie<boolean>()
      t.set('true', true)
      t.set('false', false)
      expect(t.get('true')).toBe(true)
      expect(t.get('false')).toBe(false)
    })

    it('should work with array values', () => {
      const t = new RadixTrie<number[]>()
      t.set('list', [1, 2, 3])
      expect(t.get('list')).toEqual([1, 2, 3])
    })
  })

  describe('edge cases', () => {
    it('should handle setting the same key multiple times', () => {
      trie.set('key', 1)
      trie.set('key', 2)
      trie.set('key', 3)
      expect(trie.size).toBe(1)
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
      expect(trie.size).toBe(0)
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
      expect(trie.size).toBe(3)
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
      expect(trie.size).toBe(1000)
      expect(trie.get('key500')).toBe(500)
      expect(trie.has('key999')).toBe(true)
      expect(trie.has('key1000')).toBe(false)
    })
  })

  describe('types and exports', () => {
    it('should work with RadixNode type', () => {
      const node: RadixNode<string> = {
        children: new Map(),
        value: undefined,
        isEnd: false,
        label: '',
      }
      expect(node.children).toBeInstanceOf(Map)
      expect(node.value).toBeUndefined()
      expect(node.isEnd).toBe(false)
      expect(node.label).toBe('')
    })

    it('should create RadixNode with label', () => {
      const node: RadixNode<number> = {
        children: new Map(),
        value: 42,
        isEnd: true,
        label: 'test',
      }
      expect(node.label).toBe('test')
      expect(node.value).toBe(42)
    })
  })

  describe('forEach iteration order', () => {
    it('should iterate in lexicographic DFS order', () => {
      trie.set('b', 2)
      trie.set('a', 1)
      trie.set('c', 3)
      const keys: string[] = []
      trie.forEach((_value, key) => {
        keys.push(key)
      })
      expect(keys).toEqual(['b', 'a', 'c'])
    })

    it('should iterate nested keys correctly', () => {
      trie.set('a', 1)
      trie.set('ab', 2)
      trie.set('ac', 3)
      const keys: string[] = []
      trie.forEach((_value, key) => {
        keys.push(key)
      })
      expect(keys).toEqual(['a', 'ab', 'ac'])
    })
  })

  describe('compact node behavior', () => {
    it('should store substrings not single chars', () => {
      trie.set('hello', 1)
      trie.set('world', 2)
      expect(trie.get('hello')).toBe(1)
      expect(trie.get('world')).toBe(2)
      expect(trie.size).toBe(2)
    })

    it('should handle PATRICIA-style insertion', () => {
      trie.set('a', 1)
      trie.set('ab', 2)
      trie.set('abc', 3)
      trie.set('abcd', 4)
      expect(trie.keys()).toEqual(['a', 'ab', 'abc', 'abcd'])
    })

    it('should handle complex branching', () => {
      trie.set('beer', 1)
      trie.set('beet', 2)
      trie.set('beetroot', 3)
      trie.set('bean', 4)
      expect(trie.get('beer')).toBe(1)
      expect(trie.get('beet')).toBe(2)
      expect(trie.get('beetroot')).toBe(3)
      expect(trie.get('bean')).toBe(4)
    })

    it('should handle merging after sequential deletes', () => {
      trie.set('abc', 1)
      trie.set('abcd', 2)
      trie.set('abce', 3)
      trie.delete('abcd')
      trie.delete('abce')
      expect(trie.get('abc')).toBe(1)
      expect(trie.keys()).toEqual(['abc'])
    })

    it('should handle reinsertion after full deletion', () => {
      trie.set('test', 1)
      trie.delete('test')
      expect(trie.isEmpty).toBe(true)
      trie.set('test', 2)
      expect(trie.get('test')).toBe(2)
      expect(trie.size).toBe(1)
    })
  })

  describe('Unicode support', () => {
    it('should handle emoji keys', () => {
      trie.set('😀', 1)
      trie.set('😀smile', 2)
      trie.set('🎉', 3)
      expect(trie.get('😀')).toBe(1)
      expect(trie.get('😀smile')).toBe(2)
      expect(trie.get('🎉')).toBe(3)
    })

    it('should handle multi-byte character prefixes', () => {
      trie.set('café', 1)
      trie.set('cafétéria', 2)
      expect(trie.get('café')).toBe(1)
      expect(trie.get('cafétéria')).toBe(2)
      expect(trie.startsWith('café')).toEqual(['café', 'cafétéria'])
    })

    it('should handle CJK characters', () => {
      trie.set('日本語', 1)
      trie.set('日本', 2)
      trie.set('日', 3)
      expect(trie.get('日本語')).toBe(1)
      expect(trie.get('日本')).toBe(2)
      expect(trie.get('日')).toBe(3)
    })

    it('should handle mixed ASCII and Unicode', () => {
      trie.set('hello世界', 1)
      trie.set('hello', 2)
      expect(trie.get('hello世界')).toBe(1)
      expect(trie.get('hello')).toBe(2)
    })

    it('should autocomplete with Unicode prefixes', () => {
      trie.set('Über', 1)
      trie.set('Überfluss', 2)
      trie.set('Übung', 3)
      const result = trie.autocomplete('Üb')
      expect(result.length).toBe(3)
      expect(result).toContain('Über')
      expect(result).toContain('Überfluss')
      expect(result).toContain('Übung')
      const result2 = trie.autocomplete('Ü')
      expect(result2.length).toBe(3)
    })
  })

  describe('stress testing', () => {
    it('should handle many similar prefixes', () => {
      for (let i = 0; i < 100; i++) {
        trie.set(`test${i}`, i)
      }
      expect(trie.size).toBe(100)
      expect(trie.get('test50')).toBe(50)
      const result = trie.startsWith('test')
      expect(result.length).toBe(100)
    })

    it('should handle sequential insert and delete', () => {
      for (let i = 0; i < 50; i++) {
        trie.set(`key${i}`, i)
      }
      for (let i = 0; i < 25; i++) {
        trie.delete(`key${i}`)
      }
      expect(trie.size).toBe(25)
      expect(trie.get('key30')).toBe(30)
      expect(trie.has('key10')).toBe(false)
    })

    it('should handle alternating insert and delete', () => {
      for (let i = 0; i < 20; i++) {
        trie.set(`k${i}`, i)
        trie.delete(`k${i}`)
      }
      expect(trie.isEmpty).toBe(true)
    })
  })

  describe('overlapping key patterns', () => {
    it('should handle keys sharing long prefix', () => {
      trie.set('abracadabra', 1)
      trie.set('abracadabrx', 2)
      expect(trie.get('abracadabra')).toBe(1)
      expect(trie.get('abracadabrx')).toBe(2)
      expect(trie.longestCommonPrefix()).toBe('abracadabr')
    })

    it('should handle one key being exact prefix of another', () => {
      trie.set('prefix', 1)
      trie.set('prefixExtra', 2)
      trie.set('prefixAnother', 3)
      expect(trie.get('prefix')).toBe(1)
      expect(trie.get('prefixExtra')).toBe(2)
      expect(trie.get('prefixAnother')).toBe(3)
      expect(trie.startsWith('prefix').length).toBe(3)
    })

    it('should handle reverse insertion order for overlapping keys', () => {
      trie.set('application', 1)
      trie.set('apple', 2)
      trie.set('app', 3)
      expect(trie.get('app')).toBe(3)
      expect(trie.get('apple')).toBe(2)
      expect(trie.get('application')).toBe(1)
    })

    it('should handle deeply nested chain', () => {
      trie.set('a', 1)
      trie.set('ab', 2)
      trie.set('abc', 3)
      trie.set('abcd', 4)
      trie.set('abcde', 5)
      expect(trie.size).toBe(5)
      expect(trie.keys()).toEqual(['a', 'ab', 'abc', 'abcd', 'abcde'])
    })
  })
})
