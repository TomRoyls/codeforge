import { describe, it, expect, beforeEach } from 'vitest'
import { TrieSearch } from '../../src/core/trie-search/trie-search.js'
import { DEFAULT_TRIE_SEARCH_OPTIONS } from '../../src/core/trie-search/types.js'
import type { TrieNode, TrieSearchOptions, TrieSearchResult } from '../../src/core/trie-search/types.js'

describe('TrieSearch', () => {
  let trie: TrieSearch<string>

  beforeEach(() => {
    trie = new TrieSearch<string>()
  })

  describe('constructor', () => {
    it('should create a trie with default options', () => {
      const t = new TrieSearch()
      expect(t.getCount()).toBe(0)
    })

    it('should accept caseSensitive option', () => {
      const t = new TrieSearch({ caseSensitive: true })
      t.insert('Hello')
      expect(t.has('Hello')).toBe(true)
      expect(t.has('hello')).toBe(false)
    })

    it('should accept maxSuggestions option', () => {
      const t = new TrieSearch({ maxSuggestions: 2 })
      t.insert('apple')
      t.insert('application')
      t.insert('apply')
      expect(t.autocomplete('app').length).toBeLessThanOrEqual(2)
    })

    it('should accept fuzzyThreshold option', () => {
      const t = new TrieSearch({ fuzzyThreshold: 0.8 })
      expect(t.getCount()).toBe(0)
    })
  })

  describe('insert', () => {
    it('should insert a single key', () => {
      trie.insert('hello')
      expect(trie.has('hello')).toBe(true)
    })

    it('should insert multiple keys', () => {
      trie.insert('hello')
      trie.insert('world')
      trie.insert('help')
      expect(trie.getCount()).toBe(3)
    })

    it('should not increase count when overwriting existing key', () => {
      trie.insert('hello', 'v1')
      trie.insert('hello', 'v2')
      expect(trie.getCount()).toBe(1)
    })

    it('should store a value', () => {
      trie.insert('key1', 'value1')
      const results = trie.search('key1')
      expect(results[0]?.value).toBe('value1')
    })

    it('should handle empty string key', () => {
      trie.insert('')
      expect(trie.has('')).toBe(true)
      expect(trie.getCount()).toBe(1)
    })

    it('should handle single character key', () => {
      trie.insert('a')
      expect(trie.has('a')).toBe(true)
    })

    it('should handle unicode keys', () => {
      trie.insert('café')
      trie.insert('日本語')
      expect(trie.has('café')).toBe(true)
      expect(trie.has('日本語')).toBe(true)
    })

    it('should handle long keys', () => {
      const longKey = 'a'.repeat(1000)
      trie.insert(longKey)
      expect(trie.has(longKey)).toBe(true)
    })
  })

  describe('search', () => {
    it('should return empty array for empty trie', () => {
      expect(trie.search('hello')).toEqual([])
    })

    it('should return exact match', () => {
      trie.insert('hello')
      const results = trie.search('hello')
      expect(results.length).toBe(1)
      expect(results[0]?.key).toBe('hello')
    })

    it('should return prefix matches', () => {
      trie.insert('hello')
      trie.insert('help')
      trie.insert('helium')
      const results = trie.search('hel')
      expect(results.length).toBe(3)
      const keys = results.map(r => r.key)
      expect(keys).toContain('hello')
      expect(keys).toContain('help')
      expect(keys).toContain('helium')
    })

    it('should return empty for no matches', () => {
      trie.insert('hello')
      expect(trie.search('world')).toEqual([])
    })

    it('should assign score of 1 for exact prefix match', () => {
      trie.insert('hello')
      const results = trie.search('hello')
      expect(results[0]?.score).toBe(1)
    })

    it('should assign lower score for longer matches', () => {
      trie.insert('hel')
      trie.insert('hello')
      const results = trie.search('hel')
      const exact = results.find(r => r.key === 'hel')
      const longer = results.find(r => r.key === 'hello')
      expect(exact?.score).toBeGreaterThan(longer!.score)
    })

    it('should return all words for empty prefix', () => {
      trie.insert('a')
      trie.insert('b')
      trie.insert('c')
      expect(trie.search('').length).toBe(3)
    })

    it('should return results with values', () => {
      trie.insert('hello', 'greeting')
      const results = trie.search('hello')
      expect(results[0]?.value).toBe('greeting')
    })
  })

  describe('has', () => {
    it('should return false for empty trie', () => {
      expect(trie.has('anything')).toBe(false)
    })

    it('should return true for existing key', () => {
      trie.insert('hello')
      expect(trie.has('hello')).toBe(true)
    })

    it('should return false for non-existing key', () => {
      trie.insert('hello')
      expect(trie.has('world')).toBe(false)
    })

    it('should return false for prefix only', () => {
      trie.insert('hello')
      expect(trie.has('hel')).toBe(false)
    })

    it('should return false after delete', () => {
      trie.insert('hello')
      trie.delete('hello')
      expect(trie.has('hello')).toBe(false)
    })

    it('should be case insensitive by default', () => {
      trie.insert('Hello')
      expect(trie.has('hello')).toBe(true)
      expect(trie.has('HELLO')).toBe(true)
    })
  })

  describe('startsWith', () => {
    it('should return empty for no matches', () => {
      trie.insert('hello')
      expect(trie.startsWith('world')).toEqual([])
    })

    it('should return single match', () => {
      trie.insert('hello')
      expect(trie.startsWith('hel')).toEqual(['hello'])
    })

    it('should return multiple matches', () => {
      trie.insert('hello')
      trie.insert('help')
      trie.insert('helium')
      const results = trie.startsWith('hel')
      expect(results.length).toBe(3)
      expect(results).toContain('hello')
      expect(results).toContain('help')
      expect(results).toContain('helium')
    })

    it('should return all words for empty prefix', () => {
      trie.insert('a')
      trie.insert('b')
      trie.insert('c')
      expect(trie.startsWith('').length).toBe(3)
    })

    it('should handle case insensitive matching', () => {
      trie.insert('Hello')
      expect(trie.startsWith('hel')).toEqual(['hello'])
    })

    it('should not include deleted keys', () => {
      trie.insert('hello')
      trie.insert('help')
      trie.delete('hello')
      expect(trie.startsWith('hel')).toEqual(['help'])
    })
  })

  describe('delete', () => {
    it('should return true for existing key', () => {
      trie.insert('hello')
      expect(trie.delete('hello')).toBe(true)
    })

    it('should return false for non-existing key', () => {
      expect(trie.delete('nonexistent')).toBe(false)
    })

    it('should decrease count', () => {
      trie.insert('hello')
      trie.insert('world')
      trie.delete('hello')
      expect(trie.getCount()).toBe(1)
    })

    it('should allow re-insertion after delete', () => {
      trie.insert('hello', 'v1')
      trie.delete('hello')
      trie.insert('hello', 'v2')
      expect(trie.has('hello')).toBe(true)
      expect(trie.getCount()).toBe(1)
      const results = trie.search('hello')
      expect(results[0]?.value).toBe('v2')
    })

    it('should remove unnecessary nodes', () => {
      trie.insert('hello')
      trie.delete('hello')
      expect(trie.startsWith('h')).toEqual([])
    })

    it('should not affect shared prefixes', () => {
      trie.insert('hello')
      trie.insert('help')
      trie.delete('hello')
      expect(trie.has('help')).toBe(true)
      expect(trie.has('hello')).toBe(false)
    })

    it('should return false for prefix that is not a word', () => {
      trie.insert('hello')
      expect(trie.delete('hel')).toBe(false)
    })
  })

  describe('autocomplete', () => {
    it('should return suggestions for prefix', () => {
      trie.insert('apple')
      trie.insert('application')
      trie.insert('apply')
      const suggestions = trie.autocomplete('app')
      expect(suggestions.length).toBe(3)
    })

    it('should respect maxResults parameter', () => {
      trie.insert('apple')
      trie.insert('application')
      trie.insert('apply')
      const suggestions = trie.autocomplete('app', 2)
      expect(suggestions.length).toBe(2)
    })

    it('should use default maxSuggestions', () => {
      const t = new TrieSearch({ maxSuggestions: 2 })
      t.insert('apple')
      t.insert('application')
      t.insert('apply')
      const suggestions = t.autocomplete('app')
      expect(suggestions.length).toBeLessThanOrEqual(2)
    })

    it('should return empty for no matches', () => {
      trie.insert('hello')
      expect(trie.autocomplete('world')).toEqual([])
    })

    it('should handle empty prefix', () => {
      trie.insert('a')
      trie.insert('b')
      trie.insert('c')
      expect(trie.autocomplete('').length).toBe(3)
    })

    it('should handle single character prefix', () => {
      trie.insert('a')
      trie.insert('ab')
      trie.insert('abc')
      const suggestions = trie.autocomplete('a')
      expect(suggestions.length).toBe(3)
    })

    it('should include exact match in suggestions', () => {
      trie.insert('app')
      trie.insert('apple')
      const suggestions = trie.autocomplete('app')
      expect(suggestions).toContain('app')
      expect(suggestions).toContain('apple')
    })
  })

  describe('fuzzySearch', () => {
    it('should find exact match with distance 0', () => {
      trie.insert('hello')
      const results = trie.fuzzySearch('hello')
      expect(results.length).toBeGreaterThan(0)
      expect(results[0]?.key).toBe('hello')
      expect(results[0]?.score).toBe(1)
    })

    it('should find matches with distance 1', () => {
      trie.insert('hello')
      const results = trie.fuzzySearch('helo')
      expect(results.length).toBeGreaterThan(0)
      const keys = results.map(r => r.key)
      expect(keys).toContain('hello')
    })

    it('should find matches with distance 2', () => {
      trie.insert('hello')
      const results = trie.fuzzySearch('helo', 2)
      expect(results.length).toBeGreaterThan(0)
      const keys = results.map(r => r.key)
      expect(keys).toContain('hello')
    })

    it('should return empty for no matches within distance', () => {
      trie.insert('hello')
      const results = trie.fuzzySearch('world', 1)
      expect(results).toEqual([])
    })

    it('should handle custom maxDistance', () => {
      trie.insert('hello')
      const results1 = trie.fuzzySearch('hllo', 1)
      const results2 = trie.fuzzySearch('hllo', 2)
      expect(results2.length).toBeGreaterThanOrEqual(results1.length)
    })

    it('should return results sorted by score', () => {
      trie.insert('hello')
      trie.insert('hallo')
      const results = trie.fuzzySearch('hello', 2)
      for (let i = 1; i < results.length; i++) {
        expect(results[i - 1]!.score).toBeGreaterThanOrEqual(results[i]!.score)
      }
    })

    it('should handle empty query', () => {
      trie.insert('a')
      trie.insert('ab')
      const results = trie.fuzzySearch('', 1)
      expect(results.length).toBeGreaterThan(0)
    })

    it('should handle single character query', () => {
      trie.insert('a')
      trie.insert('b')
      const results = trie.fuzzySearch('a', 0)
      expect(results.length).toBeGreaterThan(0)
      expect(results[0]?.key).toBe('a')
    })
  })

  describe('getCount', () => {
    it('should return 0 for empty trie', () => {
      expect(trie.getCount()).toBe(0)
    })

    it('should return correct count after inserts', () => {
      trie.insert('a')
      trie.insert('b')
      trie.insert('c')
      expect(trie.getCount()).toBe(3)
    })

    it('should return correct count after deletes', () => {
      trie.insert('a')
      trie.insert('b')
      trie.delete('a')
      expect(trie.getCount()).toBe(1)
    })

    it('should return 0 after clear', () => {
      trie.insert('a')
      trie.insert('b')
      trie.clear()
      expect(trie.getCount()).toBe(0)
    })
  })

  describe('clear', () => {
    it('should remove all entries', () => {
      trie.insert('a')
      trie.insert('b')
      trie.insert('c')
      trie.clear()
      expect(trie.getCount()).toBe(0)
    })

    it('should reset count to 0', () => {
      trie.insert('hello')
      trie.clear()
      expect(trie.getCount()).toBe(0)
    })

    it('should allow insert after clear', () => {
      trie.insert('hello')
      trie.clear()
      trie.insert('world')
      expect(trie.has('world')).toBe(true)
      expect(trie.getCount()).toBe(1)
    })

    it('should return empty results after clear', () => {
      trie.insert('hello')
      trie.clear()
      expect(trie.search('')).toEqual([])
      expect(trie.startsWith('')).toEqual([])
    })
  })

  describe('getNode', () => {
    it('should return node for existing key', () => {
      trie.insert('hello')
      const node = trie.getNode('hello')
      expect(node).toBeDefined()
      expect(node?.isEnd).toBe(true)
    })

    it('should return undefined for non-existing key', () => {
      expect(trie.getNode('nonexistent')).toBeUndefined()
    })

    it('should return node with correct char', () => {
      trie.insert('abc')
      const node = trie.getNode('ab')
      expect(node).toBeDefined()
      expect(node?.char).toBe('b')
    })

    it('should return node for prefix that is not a word', () => {
      trie.insert('hello')
      const node = trie.getNode('hel')
      expect(node).toBeDefined()
      expect(node?.isEnd).toBe(false)
    })
  })

  describe('toJSON', () => {
    it('should return serializable object', () => {
      trie.insert('hi')
      const json = trie.toJSON()
      expect(typeof json).toBe('object')
      expect(json).not.toBeNull()
    })

    it('should represent trie structure', () => {
      trie.insert('ab')
      const json = trie.toJSON()
      const children = json.children as Record<string, unknown>
      expect(children).toHaveProperty('a')
    })

    it('should handle empty trie', () => {
      const json = trie.toJSON()
      expect(json.char).toBe('')
      expect(json.count).toBe(0)
    })

    it('should include node properties', () => {
      trie.insert('hello', 'value')
      const json = trie.toJSON()
      expect(json).toHaveProperty('char')
      expect(json).toHaveProperty('children')
      expect(json).toHaveProperty('isEnd')
      expect(json).toHaveProperty('count')
    })
  })

  describe('edge cases', () => {
    it('should handle unicode characters', () => {
      trie.insert('🎉emoji')
      trie.insert('日本語')
      expect(trie.has('🎉emoji')).toBe(true)
      expect(trie.has('日本語')).toBe(true)
    })

    it('should handle very long keys', () => {
      const longKey = 'abcdefghij'.repeat(100)
      trie.insert(longKey)
      expect(trie.has(longKey)).toBe(true)
      expect(trie.getCount()).toBe(1)
    })

    it('should handle special characters', () => {
      trie.insert('key-with-dashes')
      trie.insert('key_with_underscores')
      trie.insert('key.with.dots')
      expect(trie.has('key-with-dashes')).toBe(true)
      expect(trie.has('key_with_underscores')).toBe(true)
      expect(trie.has('key.with.dots')).toBe(true)
    })

    it('should handle case sensitivity toggle', () => {
      const cs = new TrieSearch<string>({ caseSensitive: true })
      cs.insert('Hello')
      cs.insert('hello')
      expect(cs.getCount()).toBe(2)
      expect(cs.has('Hello')).toBe(true)
      expect(cs.has('hello')).toBe(true)
    })

    it('should handle rapid insert delete cycles', () => {
      for (let i = 0; i < 10; i++) {
        trie.insert('key')
        trie.delete('key')
      }
      expect(trie.getCount()).toBe(0)
      expect(trie.has('key')).toBe(false)
    })

    it('should handle empty string operations', () => {
      trie.insert('')
      expect(trie.has('')).toBe(true)
      expect(trie.search('').length).toBe(1)
      trie.delete('')
      expect(trie.has('')).toBe(false)
    })
  })

  describe('bulk insert', () => {
    it('should handle inserting many keys', () => {
      for (let i = 0; i < 100; i++) {
        trie.insert(`key${i}`, `value${i}`)
      }
      expect(trie.getCount()).toBe(100)
      expect(trie.has('key50')).toBe(true)
    })

    it('should maintain count accuracy with duplicates', () => {
      for (let i = 0; i < 10; i++) {
        trie.insert('duplicate')
      }
      expect(trie.getCount()).toBe(1)
    })

    it('should handle shared prefix bulk insert', () => {
      trie.insert('compute')
      trie.insert('computer')
      trie.insert('computing')
      trie.insert('computed')
      expect(trie.getCount()).toBe(4)
      expect(trie.startsWith('comput').length).toBe(4)
    })
  })

  describe('type exports', () => {
    it('should export DEFAULT_TRIE_SEARCH_OPTIONS', () => {
      expect(DEFAULT_TRIE_SEARCH_OPTIONS.caseSensitive).toBe(false)
      expect(DEFAULT_TRIE_SEARCH_OPTIONS.maxSuggestions).toBe(10)
      expect(DEFAULT_TRIE_SEARCH_OPTIONS.fuzzyThreshold).toBe(0.6)
    })

    it('should allow creating TrieNode typed variable', () => {
      const node: TrieNode<string> = {
        char: 'a',
        children: new Map<string, TrieNode<string>>(),
        isEnd: true,
        value: 'test',
        count: 1,
      }
      expect(node.char).toBe('a')
      expect(node.isEnd).toBe(true)
    })

    it('should allow creating TrieSearchOptions typed variable', () => {
      const opts: TrieSearchOptions = {
        caseSensitive: true,
        maxSuggestions: 5,
        fuzzyThreshold: 0.8,
      }
      expect(opts.caseSensitive).toBe(true)
      expect(opts.maxSuggestions).toBe(5)
    })

    it('should allow creating TrieSearchResult typed variable', () => {
      const result: TrieSearchResult<string> = {
        key: 'test',
        value: 'val',
        score: 1,
        depth: 4,
      }
      expect(result.key).toBe('test')
      expect(result.score).toBe(1)
    })
  })

  describe('node count tracking', () => {
    it('should track count on root node', () => {
      trie.insert('hello')
      trie.insert('help')
      const root = trie.getNode('')
      expect(root?.count).toBe(2)
    })

    it('should update count after delete', () => {
      trie.insert('hello')
      trie.insert('help')
      trie.delete('hello')
      const root = trie.getNode('')
      expect(root?.count).toBe(1)
    })

    it('should reset count after clear', () => {
      trie.insert('hello')
      trie.insert('help')
      trie.clear()
      const root = trie.getNode('')
      expect(root?.count).toBe(0)
    })

    it('should track subtree count correctly', () => {
      trie.insert('car')
      trie.insert('cat')
      trie.insert('dog')
      const cNode = trie.getNode('c')
      expect(cNode?.count).toBe(2)
      const dNode = trie.getNode('d')
      expect(dNode?.count).toBe(1)
    })
  })
})
