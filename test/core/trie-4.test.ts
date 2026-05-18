import { describe, it, expect } from 'vitest'
import { Trie4 } from '../../src/core/trie-4/index.js'

describe('Trie4', () => {
  describe('constructor', () => {
    it('should create an empty trie', () => {
      const trie = new Trie4()
      expect(trie.size).toBe(0)
      expect(trie.isEmpty).toBe(true)
    })
  })

  // ─── Insert ───

  describe('insert', () => {
    it('should insert a single word', () => {
      const trie = new Trie4()
      trie.insert('hello')
      expect(trie.size).toBe(1)
      expect(trie.isEmpty).toBe(false)
    })

    it('should insert multiple words', () => {
      const trie = new Trie4()
      trie.insert('apple')
      trie.insert('banana')
      trie.insert('cherry')
      expect(trie.size).toBe(3)
    })

    it('should handle duplicate insert gracefully', () => {
      const trie = new Trie4()
      trie.insert('hello')
      trie.insert('hello')
      expect(trie.size).toBe(1)
    })

    it('should ignore empty string insert', () => {
      const trie = new Trie4()
      trie.insert('')
      expect(trie.size).toBe(0)
      expect(trie.isEmpty).toBe(true)
    })

    it('should insert words that are prefixes of each other', () => {
      const trie = new Trie4()
      trie.insert('a')
      trie.insert('ab')
      trie.insert('abc')
      expect(trie.size).toBe(3)
    })
  })

  // ─── Search ───

  describe('search', () => {
    it('should find an inserted word', () => {
      const trie = new Trie4()
      trie.insert('hello')
      expect(trie.search('hello')).toBe(true)
    })

    it('should return false for non-existent word', () => {
      const trie = new Trie4()
      trie.insert('hello')
      expect(trie.search('world')).toBe(false)
    })

    it('should return false for prefix that is not a word', () => {
      const trie = new Trie4()
      trie.insert('hello')
      expect(trie.search('hel')).toBe(false)
    })

    it('should return false for empty string', () => {
      const trie = new Trie4()
      trie.insert('hello')
      expect(trie.search('')).toBe(false)
    })

    it('should return false for empty trie', () => {
      const trie = new Trie4()
      expect(trie.search('anything')).toBe(false)
    })
  })

  // ─── Contains ───

  describe('contains', () => {
    it('should behave the same as search', () => {
      const trie = new Trie4()
      trie.insert('test')
      expect(trie.contains('test')).toBe(true)
      expect(trie.contains('tes')).toBe(false)
      expect(trie.contains('')).toBe(false)
    })
  })

  // ─── Delete ───

  describe('delete', () => {
    it('should delete an existing word', () => {
      const trie = new Trie4()
      trie.insert('hello')
      expect(trie.delete('hello')).toBe(true)
      expect(trie.size).toBe(0)
      expect(trie.search('hello')).toBe(false)
    })

    it('should return false for non-existent word', () => {
      const trie = new Trie4()
      expect(trie.delete('hello')).toBe(false)
    })

    it('should return false for empty string', () => {
      const trie = new Trie4()
      trie.insert('hello')
      expect(trie.delete('')).toBe(false)
    })

    it('should return false for prefix that is not a word', () => {
      const trie = new Trie4()
      trie.insert('hello')
      expect(trie.delete('hel')).toBe(false)
    })

    it('should not affect other words when deleting', () => {
      const trie = new Trie4()
      trie.insert('apple')
      trie.insert('app')
      expect(trie.delete('apple')).toBe(true)
      expect(trie.search('app')).toBe(true)
      expect(trie.size).toBe(1)
    })

    it('should handle deleting then re-inserting', () => {
      const trie = new Trie4()
      trie.insert('hello')
      trie.delete('hello')
      trie.insert('hello')
      expect(trie.size).toBe(1)
      expect(trie.search('hello')).toBe(true)
    })

    it('should delete word that is a prefix of another', () => {
      const trie = new Trie4()
      trie.insert('app')
      trie.insert('apple')
      expect(trie.delete('app')).toBe(true)
      expect(trie.search('app')).toBe(false)
      expect(trie.search('apple')).toBe(true)
    })

    it('should prune empty branches after delete', () => {
      const trie = new Trie4()
      trie.insert('xyz')
      trie.delete('xyz')
      expect(trie.startsWith('x')).toBe(false)
    })
  })

  // ─── StartsWith ───

  describe('startsWith', () => {
    it('should return true for existing prefix', () => {
      const trie = new Trie4()
      trie.insert('hello')
      expect(trie.startsWith('hel')).toBe(true)
    })

    it('should return true for exact word as prefix', () => {
      const trie = new Trie4()
      trie.insert('hello')
      expect(trie.startsWith('hello')).toBe(true)
    })

    it('should return false for non-existent prefix', () => {
      const trie = new Trie4()
      trie.insert('hello')
      expect(trie.startsWith('xyz')).toBe(false)
    })

    it('should return true for empty prefix', () => {
      const trie = new Trie4()
      trie.insert('hello')
      expect(trie.startsWith('')).toBe(true)
    })

    it('should return true for empty trie with empty prefix', () => {
      const trie = new Trie4()
      expect(trie.startsWith('')).toBe(true)
    })
  })

  // ─── ToArray ───

  describe('toArray', () => {
    it('should return sorted array of all words', () => {
      const trie = new Trie4()
      trie.insert('cherry')
      trie.insert('apple')
      trie.insert('banana')
      expect(trie.toArray()).toEqual(['apple', 'banana', 'cherry'])
    })

    it('should return empty array for empty trie', () => {
      const trie = new Trie4()
      expect(trie.toArray()).toEqual([])
    })

    it('should return single word array', () => {
      const trie = new Trie4()
      trie.insert('hello')
      expect(trie.toArray()).toEqual(['hello'])
    })
  })

  // ─── Autocomplete ───

  describe('autocomplete', () => {
    it('should return all words matching prefix sorted', () => {
      const trie = new Trie4()
      trie.insert('apple')
      trie.insert('app')
      trie.insert('application')
      trie.insert('banana')
      const result = trie.autocomplete('app')
      expect(result).toEqual(['app', 'apple', 'application'])
    })

    it('should respect maxResults', () => {
      const trie = new Trie4()
      trie.insert('aa')
      trie.insert('ab')
      trie.insert('ac')
      trie.insert('ad')
      const result = trie.autocomplete('a', 2)
      expect(result.length).toBe(2)
    })

    it('should return all words for empty prefix when maxResults allows', () => {
      const trie = new Trie4()
      trie.insert('apple')
      trie.insert('banana')
      const result = trie.autocomplete('')
      expect(result).toEqual(['apple', 'banana'])
    })

    it('should respect maxResults for empty prefix', () => {
      const trie = new Trie4()
      trie.insert('a')
      trie.insert('b')
      trie.insert('c')
      const result = trie.autocomplete('', 2)
      expect(result.length).toBe(2)
    })

    it('should return empty array for non-existent prefix', () => {
      const trie = new Trie4()
      trie.insert('hello')
      expect(trie.autocomplete('xyz')).toEqual([])
    })

    it('should return empty array for empty trie', () => {
      const trie = new Trie4()
      expect(trie.autocomplete('a')).toEqual([])
    })
  })

  // ─── WildcardSearch ───

  describe('wildcardSearch', () => {
    it('should match single character wildcard ?', () => {
      const trie = new Trie4()
      trie.insert('cat')
      trie.insert('bat')
      trie.insert('cut')
      const result = trie.wildcardSearch('?at')
      expect(result).toContain('cat')
      expect(result).toContain('bat')
      expect(result).not.toContain('cut')
    })

    it('should match multiple ? wildcards', () => {
      const trie = new Trie4()
      trie.insert('cat')
      trie.insert('bat')
      trie.insert('car')
      const result = trie.wildcardSearch('??t')
      expect(result).toContain('cat')
      expect(result).toContain('bat')
      expect(result).not.toContain('car')
    })

    it('should match * wildcard for all remaining characters', () => {
      const trie = new Trie4()
      trie.insert('cat')
      trie.insert('car')
      trie.insert('cab')
      trie.insert('dog')
      const result = trie.wildcardSearch('ca*')
      expect(result).toContain('cat')
      expect(result).toContain('car')
      expect(result).toContain('cab')
      expect(result).not.toContain('dog')
    })

    it('should match * at the beginning', () => {
      const trie = new Trie4()
      trie.insert('cat')
      trie.insert('bat')
      trie.insert('hat')
      const result = trie.wildcardSearch('*')
      expect(result.length).toBe(3)
      expect(result).toContain('cat')
      expect(result).toContain('bat')
      expect(result).toContain('hat')
    })

    it('should return empty for no matches', () => {
      const trie = new Trie4()
      trie.insert('hello')
      expect(trie.wildcardSearch('x?')).toEqual([])
    })

    it('should match exact pattern without wildcards', () => {
      const trie = new Trie4()
      trie.insert('cat')
      trie.insert('car')
      expect(trie.wildcardSearch('cat')).toEqual(['cat'])
    })

    it('should return sorted results', () => {
      const trie = new Trie4()
      trie.insert('zebra')
      trie.insert('alpha')
      trie.insert('mid')
      const result = trie.wildcardSearch('*')
      expect(result).toEqual(['alpha', 'mid', 'zebra'])
    })
  })

  // ─── Clear ───

  describe('clear', () => {
    it('should clear all words', () => {
      const trie = new Trie4()
      trie.insert('hello')
      trie.insert('world')
      trie.clear()
      expect(trie.size).toBe(0)
      expect(trie.isEmpty).toBe(true)
      expect(trie.search('hello')).toBe(false)
      expect(trie.search('world')).toBe(false)
    })

    it('should allow inserts after clear', () => {
      const trie = new Trie4()
      trie.insert('old')
      trie.clear()
      trie.insert('new')
      expect(trie.size).toBe(1)
      expect(trie.search('new')).toBe(true)
      expect(trie.search('old')).toBe(false)
    })
  })

  // ─── GetTimeComplexity ───

  describe('getTimeComplexity', () => {
    it('should return complexity object with expected keys', () => {
      const trie = new Trie4()
      const complexities = trie.getTimeComplexity()
      expect(complexities.insert).toBe('O(m)')
      expect(complexities.delete).toBe('O(m)')
      expect(complexities.search).toBe('O(m)')
      expect(complexities.contains).toBe('O(m)')
      expect(complexities.startsWith).toBe('O(m)')
      expect(complexities.toArray).toBe('O(n)')
      expect(complexities.autocomplete).toBe('O(m + k)')
      expect(complexities.wildcardSearch).toBe('O(n * m)')
      expect(complexities.size).toBe('O(1)')
      expect(complexities.isEmpty).toBe('O(1)')
      expect(complexities.clear).toBe('O(1)')
    })
  })

  // ─── Size / IsEmpty ───

  describe('size and isEmpty', () => {
    it('should track size correctly through inserts and deletes', () => {
      const trie = new Trie4()
      expect(trie.size).toBe(0)
      expect(trie.isEmpty).toBe(true)
      trie.insert('a')
      expect(trie.size).toBe(1)
      expect(trie.isEmpty).toBe(false)
      trie.insert('b')
      expect(trie.size).toBe(2)
      trie.delete('a')
      expect(trie.size).toBe(1)
      trie.delete('b')
      expect(trie.size).toBe(0)
      expect(trie.isEmpty).toBe(true)
    })
  })

  // ─── Edge Cases ───

  describe('edge cases', () => {
    it('should handle unicode characters', () => {
      const trie = new Trie4()
      trie.insert('こんにちは')
      trie.insert('你好')
      expect(trie.search('こんにちは')).toBe(true)
      expect(trie.search('你好')).toBe(true)
      expect(trie.search('你好世界')).toBe(false)
    })

    it('should handle numeric strings', () => {
      const trie = new Trie4()
      trie.insert('123')
      trie.insert('12345')
      expect(trie.search('123')).toBe(true)
      expect(trie.startsWith('12')).toBe(true)
    })

    it('should handle single character operations', () => {
      const trie = new Trie4()
      trie.insert('x')
      expect(trie.search('x')).toBe(true)
      expect(trie.delete('x')).toBe(true)
      expect(trie.search('x')).toBe(false)
      expect(trie.size).toBe(0)
    })

    it('should handle delete from empty trie', () => {
      const trie = new Trie4()
      expect(trie.delete('anything')).toBe(false)
    })
  })
})
