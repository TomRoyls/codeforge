import { describe, it, expect, beforeEach } from 'vitest'
import { Trie } from '../src/utils/trie.js'

describe('Trie', () => {
  let trie: Trie<number>

  beforeEach(() => {
    trie = new Trie<number>()
  })

  describe('insert', () => {
    it('should insert a key-value pair', () => {
      trie.insert('hello', 1)
      expect(trie.get('hello')).toBe(1)
      expect(trie.size).toBe(1)
    })

    it('should overwrite existing value but not double-count size', () => {
      trie.insert('hello', 1)
      expect(trie.size).toBe(1)
      trie.insert('hello', 2)
      expect(trie.get('hello')).toBe(2)
      expect(trie.size).toBe(1)
    })

    it('should insert multiple keys', () => {
      trie.insert('cat', 1)
      trie.insert('car', 2)
      trie.insert('dog', 3)
      expect(trie.size).toBe(3)
    })

    it('should handle empty string key', () => {
      trie.insert('', 42)
      expect(trie.get('')).toBe(42)
      expect(trie.size).toBe(1)
    })

    it('should insert keys with common prefixes', () => {
      trie.insert('app', 1)
      trie.insert('apple', 2)
      trie.insert('application', 3)
      expect(trie.size).toBe(3)
      expect(trie.get('app')).toBe(1)
      expect(trie.get('apple')).toBe(2)
      expect(trie.get('application')).toBe(3)
    })
  })

  describe('get', () => {
    it('should return undefined for non-existent key', () => {
      expect(trie.get('nonexistent')).toBeUndefined()
    })

    it('should return value for existing key', () => {
      trie.insert('test', 123)
      expect(trie.get('test')).toBe(123)
    })

    it('should return undefined for non-terminal prefix', () => {
      trie.insert('testing', 456)
      expect(trie.get('test')).toBeUndefined()
    })

    it('should handle empty trie', () => {
      expect(trie.get('anything')).toBeUndefined()
    })
  })

  describe('has', () => {
    it('should return false for non-existent key', () => {
      expect(trie.has('nonexistent')).toBe(false)
    })

    it('should return true for existing key', () => {
      trie.insert('exists', 1)
      expect(trie.has('exists')).toBe(true)
    })

    it('should return false for non-terminal prefix', () => {
      trie.insert('prefix', 1)
      expect(trie.has('pre')).toBe(false)
    })

    it('should return false for empty trie', () => {
      expect(trie.has('anything')).toBe(false)
    })
  })

  describe('delete', () => {
    it('should return false for non-existent key', () => {
      expect(trie.delete('nonexistent')).toBe(false)
    })

    it('should delete existing key and return true', () => {
      trie.insert('delete', 1)
      expect(trie.delete('delete')).toBe(true)
      expect(trie.has('delete')).toBe(false)
      expect(trie.size).toBe(0)
    })

    it('should clean up unused path nodes', () => {
      trie.insert('path', 1)
      trie.delete('path')
      expect(trie.containsPrefix('p')).toBe(false)
    })

    it('should not delete shared prefix', () => {
      trie.insert('shared', 1)
      trie.insert('sharing', 2)
      trie.delete('sharing')
      expect(trie.has('shared')).toBe(true)
      expect(trie.size).toBe(1)
    })

    it('should handle deleting from empty trie', () => {
      expect(trie.delete('nothing')).toBe(false)
      expect(trie.size).toBe(0)
    })
  })

  describe('startsWith', () => {
    it('should return empty array for non-existent prefix', () => {
      expect(trie.startsWith('nonexistent')).toEqual([])
    })

    it('should return all keys with given prefix', () => {
      trie.insert('app', 1)
      trie.insert('apple', 2)
      trie.insert('application', 3)
      trie.insert('banana', 4)
      const results = trie.startsWith('app')
      expect(results).toHaveLength(3)
      expect(results).toContainEqual(['app', 1])
      expect(results).toContainEqual(['apple', 2])
      expect(results).toContainEqual(['application', 3])
    })

    it('should handle exact prefix match', () => {
      trie.insert('exact', 1)
      const results = trie.startsWith('exact')
      expect(results).toEqual([['exact', 1]])
    })

    it('should return empty array for empty prefix in empty trie', () => {
      expect(trie.startsWith('')).toEqual([])
    })
  })

  describe('containsPrefix', () => {
    it('should return false for non-existent prefix', () => {
      expect(trie.containsPrefix('nonexistent')).toBe(false)
    })

    it('should return true for existing prefix', () => {
      trie.insert('prefix', 1)
      expect(trie.containsPrefix('pre')).toBe(true)
    })

    it('should return true for exact key match', () => {
      trie.insert('exact', 1)
      expect(trie.containsPrefix('exact')).toBe(true)
    })

    it('should return false for empty trie', () => {
      expect(trie.containsPrefix('anything')).toBe(false)
    })
  })

  describe('longestCommonPrefix', () => {
    it('should return empty string for empty trie', () => {
      expect(trie.longestCommonPrefix()).toBe('')
    })

    it('should return empty string for single key', () => {
      trie.insert('single', 1)
      expect(trie.longestCommonPrefix()).toBe('single')
    })

    it('should return shared prefix for multiple keys', () => {
      trie.insert('apple', 1)
      trie.insert('application', 2)
      trie.insert('app', 3)
      expect(trie.longestCommonPrefix()).toBe('app')
    })

    it('should return empty string for keys with no shared prefix', () => {
      trie.insert('apple', 1)
      trie.insert('banana', 2)
      trie.insert('cherry', 3)
      expect(trie.longestCommonPrefix()).toBe('')
    })

    it('should handle case when one key is prefix of another', () => {
      trie.insert('app', 1)
      trie.insert('apple', 2)
      expect(trie.longestCommonPrefix()).toBe('app')
    })
  })

  describe('keys', () => {
    it('should return empty array for empty trie', () => {
      expect(trie.keys()).toEqual([])
    })

    it('should return all keys', () => {
      trie.insert('key1', 1)
      trie.insert('key2', 2)
      trie.insert('key3', 3)
      const keys = trie.keys()
      expect(keys).toHaveLength(3)
      expect(keys).toContain('key1')
      expect(keys).toContain('key2')
      expect(keys).toContain('key3')
    })

    it('should return keys in insertion order', () => {
      trie.insert('a', 1)
      trie.insert('b', 2)
      trie.insert('c', 3)
      expect(trie.keys()).toEqual(['a', 'b', 'c'])
    })
  })

  describe('values', () => {
    it('should return empty array for empty trie', () => {
      expect(trie.values()).toEqual([])
    })

    it('should return all values', () => {
      trie.insert('key1', 10)
      trie.insert('key2', 20)
      trie.insert('key3', 30)
      const values = trie.values()
      expect(values).toHaveLength(3)
      expect(values).toContain(10)
      expect(values).toContain(20)
      expect(values).toContain(30)
    })

    it('should return values in insertion order', () => {
      trie.insert('a', 1)
      trie.insert('b', 2)
      trie.insert('c', 3)
      expect(trie.values()).toEqual([1, 2, 3])
    })
  })

  describe('entries', () => {
    it('should return empty array for empty trie', () => {
      expect(trie.entries()).toEqual([])
    })

    it('should return all key-value pairs', () => {
      trie.insert('key1', 10)
      trie.insert('key2', 20)
      trie.insert('key3', 30)
      const entries = trie.entries()
      expect(entries).toHaveLength(3)
      expect(entries).toContainEqual(['key1', 10])
      expect(entries).toContainEqual(['key2', 20])
      expect(entries).toContainEqual(['key3', 30])
    })

    it('should return entries in insertion order', () => {
      trie.insert('a', 1)
      trie.insert('b', 2)
      trie.insert('c', 3)
      expect(trie.entries()).toEqual([
        ['a', 1],
        ['b', 2],
        ['c', 3],
      ])
    })
  })

  describe('size', () => {
    it('should return 0 for empty trie', () => {
      expect(trie.size).toBe(0)
    })

    it('should increment with insert', () => {
      trie.insert('a', 1)
      expect(trie.size).toBe(1)
      trie.insert('b', 2)
      expect(trie.size).toBe(2)
    })

    it('should not increment when overwriting existing key', () => {
      trie.insert('a', 1)
      expect(trie.size).toBe(1)
      trie.insert('a', 2)
      expect(trie.size).toBe(1)
    })

    it('should decrement with delete', () => {
      trie.insert('a', 1)
      trie.insert('b', 2)
      expect(trie.size).toBe(2)
      trie.delete('a')
      expect(trie.size).toBe(1)
    })

    it('should reset to 0 with clear', () => {
      trie.insert('a', 1)
      trie.insert('b', 2)
      trie.clear()
      expect(trie.size).toBe(0)
    })
  })

  describe('isEmpty', () => {
    it('should return true for empty trie', () => {
      expect(trie.isEmpty()).toBe(true)
    })

    it('should return false when keys are present', () => {
      trie.insert('key', 1)
      expect(trie.isEmpty()).toBe(false)
    })

    it('should return true after clear', () => {
      trie.insert('key', 1)
      trie.clear()
      expect(trie.isEmpty()).toBe(true)
    })

    it('should return true after deleting all keys', () => {
      trie.insert('key', 1)
      trie.delete('key')
      expect(trie.isEmpty()).toBe(true)
    })
  })

  describe('clear', () => {
    it('should remove all entries', () => {
      trie.insert('a', 1)
      trie.insert('b', 2)
      trie.insert('c', 3)
      trie.clear()
      expect(trie.size).toBe(0)
      expect(trie.keys()).toEqual([])
      expect(trie.values()).toEqual([])
    })

    it('should allow reuse after clear', () => {
      trie.insert('a', 1)
      trie.clear()
      trie.insert('new', 2)
      expect(trie.size).toBe(1)
      expect(trie.get('new')).toBe(2)
    })

    it('should handle clear on empty trie', () => {
      trie.clear()
      expect(trie.size).toBe(0)
      expect(trie.isEmpty()).toBe(true)
    })
  })

  describe('autocomplete', () => {
    it('should return empty array for non-existent prefix', () => {
      expect(trie.autocomplete('nonexistent')).toEqual([])
    })

    it('should return all keys matching prefix', () => {
      trie.insert('app', 1)
      trie.insert('apple', 2)
      trie.insert('application', 3)
      trie.insert('banana', 4)
      const results = trie.autocomplete('app')
      expect(results).toHaveLength(3)
      expect(results).toContainEqual(['app', 1])
      expect(results).toContainEqual(['apple', 2])
      expect(results).toContainEqual(['application', 3])
    })

    it('should limit results with maxResults parameter', () => {
      trie.insert('app', 1)
      trie.insert('apple', 2)
      trie.insert('application', 3)
      trie.insert('ape', 4)
      trie.insert('apt', 5)
      const results = trie.autocomplete('ap', 2)
      expect(results.length).toBeLessThanOrEqual(2)
    })

    it('should return results in insertion order when limited', () => {
      trie.insert('a1', 1)
      trie.insert('a2', 2)
      trie.insert('a3', 3)
      const results = trie.autocomplete('a', 2)
      expect(results).toEqual([
        ['a1', 1],
        ['a2', 2],
      ])
    })

    it('should handle maxResults larger than available results', () => {
      trie.insert('app', 1)
      trie.insert('apple', 2)
      const results = trie.autocomplete('app', 100)
      expect(results).toHaveLength(2)
    })

    it('should handle empty prefix', () => {
      trie.insert('a', 1)
      trie.insert('b', 2)
      trie.insert('c', 3)
      const results = trie.autocomplete('')
      expect(results).toHaveLength(3)
    })

    it('should return empty array for empty prefix in empty trie', () => {
      expect(trie.autocomplete('')).toEqual([])
    })

    it('should handle undefined maxResults', () => {
      trie.insert('app', 1)
      trie.insert('apple', 2)
      const results = trie.autocomplete('app')
      expect(results).toHaveLength(2)
    })
  })

  describe('integration tests', () => {
    it('should handle complex operations', () => {
      trie.insert('hello', 1)
      trie.insert('help', 2)
      trie.insert('helicopter', 3)
      trie.insert('world', 4)

      expect(trie.size).toBe(4)
      expect(trie.containsPrefix('hel')).toBe(true)
      expect(trie.startsWith('hel')).toHaveLength(3)
      expect(trie.longestCommonPrefix()).toBe('')

      trie.delete('help')
      expect(trie.size).toBe(3)
      expect(trie.startsWith('hel')).toHaveLength(2)

      trie.clear()
      expect(trie.isEmpty()).toBe(true)
    })

    it('should handle generic types correctly', () => {
      const stringTrie = new Trie<string>()
      stringTrie.insert('test', 'value')
      expect(stringTrie.get('test')).toBe('value')

      const objectTrie = new Trie<{ id: number }>()
      objectTrie.insert('obj', { id: 42 })
      expect(objectTrie.get('obj')).toEqual({ id: 42 })
    })
  })
})