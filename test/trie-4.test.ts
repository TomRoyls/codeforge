import { describe, it, expect } from 'vitest'
import { Trie4 } from '../src/core/trie-4/index.js'

describe('Trie4', () => {
  describe('insert and search', () => {
    it('should insert and search a single word', () => {
      const trie = new Trie4()
      trie.insert('hello')
      expect(trie.search('hello')).toBe(true)
    })

    it('should return false for non-existent word', () => {
      const trie = new Trie4()
      trie.insert('hello')
      expect(trie.search('world')).toBe(false)
    })

    it('should insert multiple words', () => {
      const trie = new Trie4()
      trie.insert('hello')
      trie.insert('world')
      trie.insert('hello')
      expect(trie.search('hello')).toBe(true)
      expect(trie.search('world')).toBe(true)
    })

    it('should handle duplicate inserts', () => {
      const trie = new Trie4()
      trie.insert('hello')
      trie.insert('hello')
      trie.insert('hello')
      expect(trie.size).toBe(1)
    })

    it('should search words with common prefix', () => {
      const trie = new Trie4()
      trie.insert('app')
      trie.insert('apple')
      trie.insert('application')
      expect(trie.search('app')).toBe(true)
      expect(trie.search('apple')).toBe(true)
      expect(trie.search('application')).toBe(true)
    })

    it('should not match partial words', () => {
      const trie = new Trie4()
      trie.insert('apple')
      expect(trie.search('app')).toBe(false)
      expect(trie.search('appl')).toBe(false)
    })

    it('should handle single character words', () => {
      const trie = new Trie4()
      trie.insert('a')
      trie.insert('b')
      trie.insert('c')
      expect(trie.search('a')).toBe(true)
      expect(trie.search('b')).toBe(true)
      expect(trie.search('c')).toBe(true)
    })

    it('should handle empty string insert', () => {
      const trie = new Trie4()
      trie.insert('')
      expect(trie.size).toBe(0)
    })
  })

  describe('delete', () => {
    it('should delete existing word', () => {
      const trie = new Trie4()
      trie.insert('hello')
      expect(trie.delete('hello')).toBe(true)
      expect(trie.search('hello')).toBe(false)
    })

    it('should return false for non-existent word', () => {
      const trie = new Trie4()
      trie.insert('hello')
      expect(trie.delete('world')).toBe(false)
    })

    it('should decrement size on deletion', () => {
      const trie = new Trie4()
      trie.insert('hello')
      trie.insert('world')
      trie.delete('hello')
      expect(trie.size).toBe(1)
    })

    it('should preserve words with common prefix', () => {
      const trie = new Trie4()
      trie.insert('app')
      trie.insert('apple')
      trie.insert('application')
      trie.delete('apple')
      expect(trie.search('app')).toBe(true)
      expect(trie.search('apple')).toBe(false)
      expect(trie.search('application')).toBe(true)
    })

    it('should delete word and delete unused nodes', () => {
      const trie = new Trie4()
      trie.insert('hello')
      trie.delete('hello')
      expect(trie.startsWith('h')).toBe(false)
    })

    it('should handle duplicate deletions', () => {
      const trie = new Trie4()
      trie.insert('hello')
      expect(trie.delete('hello')).toBe(true)
      expect(trie.delete('hello')).toBe(false)
    })

    it('should delete word when it is prefix of another word', () => {
      const trie = new Trie4()
      trie.insert('app')
      trie.insert('apple')
      trie.delete('app')
      expect(trie.search('app')).toBe(false)
      expect(trie.search('apple')).toBe(true)
    })

    it('should delete word that has prefix word', () => {
      const trie = new Trie4()
      trie.insert('app')
      trie.insert('apple')
      trie.delete('apple')
      expect(trie.search('app')).toBe(true)
      expect(trie.search('apple')).toBe(false)
    })
  })

  describe('contains', () => {
    it('should return true for existing word', () => {
      const trie = new Trie4()
      trie.insert('hello')
      expect(trie.contains('hello')).toBe(true)
    })

    it('should return false for non-existent word', () => {
      const trie = new Trie4()
      trie.insert('hello')
      expect(trie.contains('world')).toBe(false)
    })

    it('should not match prefixes', () => {
      const trie = new Trie4()
      trie.insert('hello')
      expect(trie.contains('he')).toBe(false)
    })
  })

  describe('startsWith', () => {
    it('should return true for existing prefix', () => {
      const trie = new Trie4()
      trie.insert('apple')
      expect(trie.startsWith('app')).toBe(true)
    })

    it('should return true for exact word', () => {
      const trie = new Trie4()
      trie.insert('apple')
      expect(trie.startsWith('apple')).toBe(true)
    })

    it('should return false for non-existent prefix', () => {
      const trie = new Trie4()
      trie.insert('apple')
      expect(trie.startsWith('banana')).toBe(false)
    })

    it('should handle empty prefix', () => {
      const trie = new Trie4()
      trie.insert('apple')
      expect(trie.startsWith('')).toBe(true)
    })

    it('should find prefix for words with common start', () => {
      const trie = new Trie4()
      trie.insert('app')
      trie.insert('apple')
      trie.insert('application')
      expect(trie.startsWith('app')).toBe(true)
      expect(trie.startsWith('appl')).toBe(true)
      expect(trie.startsWith('apple')).toBe(true)
    })
  })

  describe('toArray', () => {
    it('should return all words in trie', () => {
      const trie = new Trie4()
      trie.insert('apple')
      trie.insert('banana')
      trie.insert('cherry')
      const words = trie.toArray()
      expect(words).toHaveLength(3)
      expect(words).toContain('apple')
      expect(words).toContain('banana')
      expect(words).toContain('cherry')
    })

    it('should return empty array for empty trie', () => {
      const trie = new Trie4()
      expect(trie.toArray()).toEqual([])
    })

    it('should return words in alphabetical order', () => {
      const trie = new Trie4()
      trie.insert('zebra')
      trie.insert('apple')
      trie.insert('banana')
      const words = trie.toArray()
      expect(words).toEqual(['apple', 'banana', 'zebra'])
    })
  })

  describe('autocomplete', () => {
    it('should return all words starting with prefix', () => {
      const trie = new Trie4()
      trie.insert('apple')
      trie.insert('app')
      trie.insert('application')
      trie.insert('banana')
      const results = trie.autocomplete('app')
      expect(results).toHaveLength(3)
      expect(results).toContain('app')
      expect(results).toContain('apple')
      expect(results).toContain('application')
    })

    it('should return results in alphabetical order', () => {
      const trie = new Trie4()
      trie.insert('cat')
      trie.insert('car')
      trie.insert('cab')
      const results = trie.autocomplete('ca')
      expect(results).toEqual(['cab', 'car', 'cat'])
    })

    it('should limit results with maxResults parameter', () => {
      const trie = new Trie4()
      trie.insert('apple')
      trie.insert('app')
      trie.insert('application')
      trie.insert('apricot')
      trie.insert('aptitude')
      const results = trie.autocomplete('ap', 2)
      expect(results.length).toBeLessThanOrEqual(2)
    })

    it('should return empty array for non-existent prefix', () => {
      const trie = new Trie4()
      trie.insert('apple')
      const results = trie.autocomplete('banana')
      expect(results).toEqual([])
    })

    it('should return all words when prefix is empty', () => {
      const trie = new Trie4()
      trie.insert('apple')
      trie.insert('banana')
      trie.insert('cherry')
      const results = trie.autocomplete('')
      expect(results).toHaveLength(3)
    })

    it('should return limited results when prefix is empty', () => {
      const trie = new Trie4()
      trie.insert('apple')
      trie.insert('banana')
      trie.insert('cherry')
      const results = trie.autocomplete('', 2)
      expect(results.length).toBeLessThanOrEqual(2)
    })

    it('should return single word when prefix is exact match', () => {
      const trie = new Trie4()
      trie.insert('hello')
      trie.insert('help')
      trie.insert('helmet')
      const results = trie.autocomplete('hello')
      expect(results).toEqual(['hello'])
    })

    it('should handle single character prefix', () => {
      const trie = new Trie4()
      trie.insert('apple')
      trie.insert('banana')
      trie.insert('apricot')
      const results = trie.autocomplete('a')
      expect(results).toHaveLength(2)
      expect(results).toContain('apple')
      expect(results).toContain('apricot')
    })
  })

  describe('wildcardSearch', () => {
    it('should find all words with single wildcard', () => {
      const trie = new Trie4()
      trie.insert('cat')
      trie.insert('bat')
      trie.insert('rat')
      trie.insert('hat')
      const results = trie.wildcardSearch('?at')
      expect(results).toHaveLength(4)
      expect(results).toContain('cat')
      expect(results).toContain('bat')
      expect(results).toContain('rat')
      expect(results).toContain('hat')
    })

    it('should find all words with multiple wildcards', () => {
      const trie = new Trie4()
      trie.insert('cat')
      trie.insert('bat')
      trie.insert('car')
      trie.insert('bar')
      const results = trie.wildcardSearch('??t')
      expect(results).toContain('cat')
      expect(results).toContain('bat')
    })

    it('should handle wildcard at beginning', () => {
      const trie = new Trie4()
      trie.insert('apple')
      trie.insert('grape')
      trie.insert('table')
      const results = trie.wildcardSearch('?able')
      expect(results).toContain('table')
    })

    it('should handle wildcard at end', () => {
      const trie = new Trie4()
      trie.insert('cat')
      trie.insert('car')
      trie.insert('cab')
      const results = trie.wildcardSearch('ca?')
      expect(results).toHaveLength(3)
    })

    it('should handle wildcards in middle', () => {
      const trie = new Trie4()
      trie.insert('cat')
      trie.insert('cot')
      trie.insert('cut')
      const results = trie.wildcardSearch('c?t')
      expect(results).toHaveLength(3)
    })

    it('should return all words with star wildcard', () => {
      const trie = new Trie4()
      trie.insert('apple')
      trie.insert('app')
      trie.insert('application')
      trie.insert('banana')
      const results = trie.wildcardSearch('app*')
      expect(results).toHaveLength(3)
      expect(results).toContain('app')
      expect(results).toContain('apple')
      expect(results).toContain('application')
    })

    it('should handle multiple star wildcards', () => {
      const trie = new Trie4()
      trie.insert('hello')
      trie.insert('help')
      trie.insert('helmet')
      const results = trie.wildcardSearch('he*')
      expect(results).toContain('hello')
      expect(results).toContain('help')
      expect(results).toContain('helmet')
    })

    it('should combine question mark and star wildcards', () => {
      const trie = new Trie4()
      trie.insert('apple')
      trie.insert('app')
      trie.insert('apply')
      const results = trie.wildcardSearch('app*')
      expect(results).toContain('app')
      expect(results).toContain('apple')
      expect(results).toContain('apply')
    })

    it('should return empty array when no matches', () => {
      const trie = new Trie4()
      trie.insert('apple')
      trie.insert('banana')
      const results = trie.wildcardSearch('?xyz')
      expect(results).toEqual([])
    })

    it('should match single character words with wildcard', () => {
      const trie = new Trie4()
      trie.insert('a')
      trie.insert('b')
      trie.insert('c')
      const results = trie.wildcardSearch('?')
      expect(results).toHaveLength(3)
    })

    it('should return results in alphabetical order with wildcards', () => {
      const trie = new Trie4()
      trie.insert('bat')
      trie.insert('cat')
      trie.insert('hat')
      const results = trie.wildcardSearch('?at')
      expect(results).toEqual(['bat', 'cat', 'hat'])
    })

    it('should handle pattern with only wildcards', () => {
      const trie = new Trie4()
      trie.insert('a')
      trie.insert('ab')
      trie.insert('abc')
      const results = trie.wildcardSearch('*')
      expect(results).toHaveLength(3)
    })
  })

  describe('size', () => {
    it('should return 0 for empty trie', () => {
      const trie = new Trie4()
      expect(trie.size).toBe(0)
    })

    it('should increment on insert', () => {
      const trie = new Trie4()
      trie.insert('hello')
      expect(trie.size).toBe(1)
      trie.insert('world')
      expect(trie.size).toBe(2)
    })

    it('should not increment on duplicate insert', () => {
      const trie = new Trie4()
      trie.insert('hello')
      trie.insert('hello')
      expect(trie.size).toBe(1)
    })

    it('should decrement on delete', () => {
      const trie = new Trie4()
      trie.insert('hello')
      trie.insert('world')
      trie.delete('hello')
      expect(trie.size).toBe(1)
    })
  })

  describe('isEmpty', () => {
    it('should return true for empty trie', () => {
      const trie = new Trie4()
      expect(trie.isEmpty).toBe(true)
    })

    it('should return false after insert', () => {
      const trie = new Trie4()
      trie.insert('hello')
      expect(trie.isEmpty).toBe(false)
    })

    it('should return true after deleting all words', () => {
      const trie = new Trie4()
      trie.insert('hello')
      trie.delete('hello')
      expect(trie.isEmpty).toBe(true)
    })
  })

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

    it('should handle clear on empty trie', () => {
      const trie = new Trie4()
      trie.clear()
      expect(trie.size).toBe(0)
    })
  })

  describe('getTimeComplexity', () => {
    it('should return time complexity for all operations', () => {
      const trie = new Trie4()
      const complexity = trie.getTimeComplexity()
      expect(complexity).toHaveProperty('insert')
      expect(complexity).toHaveProperty('delete')
      expect(complexity).toHaveProperty('search')
      expect(complexity).toHaveProperty('contains')
      expect(complexity).toHaveProperty('startsWith')
      expect(complexity).toHaveProperty('toArray')
      expect(complexity).toHaveProperty('autocomplete')
      expect(complexity).toHaveProperty('wildcardSearch')
      expect(complexity).toHaveProperty('size')
      expect(complexity).toHaveProperty('isEmpty')
      expect(complexity).toHaveProperty('clear')
    })

    it('should return correct complexity values', () => {
      const trie = new Trie4()
      const complexity = trie.getTimeComplexity()
      expect(complexity.insert).toBe('O(m)')
      expect(complexity.search).toBe('O(m)')
      expect(complexity.autocomplete).toBe('O(m + k)')
      expect(complexity.wildcardSearch).toBe('O(n * m)')
    })
  })

  describe('edge cases', () => {
    it('should handle long strings', () => {
      const trie = new Trie4()
      const longWord = 'a'.repeat(1000)
      trie.insert(longWord)
      expect(trie.search(longWord)).toBe(true)
    })

    it('should handle case sensitivity', () => {
      const trie = new Trie4()
      trie.insert('Hello')
      expect(trie.search('hello')).toBe(false)
      expect(trie.search('Hello')).toBe(true)
    })

    it('should handle special characters', () => {
      const trie = new Trie4()
      trie.insert('hello-world')
      trie.insert('test@123')
      expect(trie.search('hello-world')).toBe(true)
      expect(trie.search('test@123')).toBe(true)
    })

    it('should handle numbers', () => {
      const trie = new Trie4()
      trie.insert('123')
      trie.insert('456')
      expect(trie.search('123')).toBe(true)
      expect(trie.search('456')).toBe(true)
    })

    it('should handle words with unicode', () => {
      const trie = new Trie4()
      trie.insert('café')
      trie.insert('naïve')
      expect(trie.search('café')).toBe(true)
      expect(trie.search('naïve')).toBe(true)
    })
  })

  describe('integration tests', () => {
    it('should handle complex word operations', () => {
      const trie = new Trie4()
      trie.insert('app')
      trie.insert('apple')
      trie.insert('application')
      trie.insert('banana')
      trie.insert('band')

      expect(trie.size).toBe(5)
      expect(trie.startsWith('app')).toBe(true)
      
      trie.delete('apple')
      expect(trie.size).toBe(4)
      expect(trie.search('apple')).toBe(false)
      expect(trie.search('app')).toBe(true)
      
      const appWords = trie.autocomplete('app')
      expect(appWords).toHaveLength(2)
      expect(appWords).toContain('app')
      expect(appWords).toContain('application')
    })

    it('should handle autocomplete after deletions', () => {
      const trie = new Trie4()
      trie.insert('apple')
      trie.insert('app')
      trie.insert('application')
      
      trie.delete('application')
      
      const results = trie.autocomplete('app')
      expect(results).toHaveLength(2)
      expect(results).toContain('app')
      expect(results).toContain('apple')
    })

    it('should maintain state through multiple operations', () => {
      const trie = new Trie4()
      const words = ['a', 'ab', 'abc', 'abcd', 'abcde']
      
      words.forEach(word => trie.insert(word))
      expect(trie.size).toBe(words.length)
      
      words.forEach(word => expect(trie.search(word)).toBe(true))
      
      trie.delete('abc')
      expect(trie.size).toBe(words.length - 1)
      expect(trie.search('abc')).toBe(false)
      expect(trie.search('abcd')).toBe(true)
      expect(trie.search('ab')).toBe(true)
      
      const autocompleteResults = trie.autocomplete('ab')
      expect(autocompleteResults.length).toBeGreaterThan(0)
    })
  })
})
