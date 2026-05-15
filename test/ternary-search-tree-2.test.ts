import { describe, it, expect } from 'vitest'
import { TernarySearchTree2 } from '../src/core/ternary-search-tree-2/index.js'

describe('TernarySearchTree2', () => {
  describe('insert and search', () => {
    it('should insert and search a single word', () => {
      const tst = new TernarySearchTree2()
      tst.insert('hello')
      expect(tst.search('hello')).toBe(true)
    })

    it('should return false for non-existent word', () => {
      const tst = new TernarySearchTree2()
      tst.insert('hello')
      expect(tst.search('world')).toBe(false)
    })

    it('should insert multiple words', () => {
      const tst = new TernarySearchTree2()
      tst.insert('hello')
      tst.insert('world')
      tst.insert('hello')
      expect(tst.search('hello')).toBe(true)
      expect(tst.search('world')).toBe(true)
    })

    it('should handle duplicate inserts', () => {
      const tst = new TernarySearchTree2()
      tst.insert('hello')
      tst.insert('hello')
      tst.insert('hello')
      expect(tst.size).toBe(1)
    })

    it('should search words with common prefix', () => {
      const tst = new TernarySearchTree2()
      tst.insert('app')
      tst.insert('apple')
      tst.insert('application')
      expect(tst.search('app')).toBe(true)
      expect(tst.search('apple')).toBe(true)
      expect(tst.search('application')).toBe(true)
    })

    it('should not match partial words', () => {
      const tst = new TernarySearchTree2()
      tst.insert('apple')
      expect(tst.search('app')).toBe(false)
      expect(tst.search('appl')).toBe(false)
    })

    it('should handle single character words', () => {
      const tst = new TernarySearchTree2()
      tst.insert('a')
      tst.insert('b')
      tst.insert('c')
      expect(tst.search('a')).toBe(true)
      expect(tst.search('b')).toBe(true)
      expect(tst.search('c')).toBe(true)
    })

    it('should handle empty string insert', () => {
      const tst = new TernarySearchTree2()
      tst.insert('')
      expect(tst.size).toBe(0)
    })
  })

  describe('delete', () => {
    it('should delete existing word', () => {
      const tst = new TernarySearchTree2()
      tst.insert('hello')
      expect(tst.delete('hello')).toBe(true)
      expect(tst.search('hello')).toBe(false)
    })

    it('should return false for non-existent word', () => {
      const tst = new TernarySearchTree2()
      tst.insert('hello')
      expect(tst.delete('world')).toBe(false)
    })

    it('should decrement size on deletion', () => {
      const tst = new TernarySearchTree2()
      tst.insert('hello')
      tst.insert('world')
      tst.delete('hello')
      expect(tst.size).toBe(1)
    })

    it('should preserve words with common prefix', () => {
      const tst = new TernarySearchTree2()
      tst.insert('app')
      tst.insert('apple')
      tst.insert('application')
      tst.delete('apple')
      expect(tst.search('app')).toBe(true)
      expect(tst.search('apple')).toBe(false)
      expect(tst.search('application')).toBe(true)
    })

    it('should delete word and delete unused nodes', () => {
      const tst = new TernarySearchTree2()
      tst.insert('hello')
      tst.delete('hello')
      expect(tst.startsWith('h')).toBe(false)
    })

    it('should handle duplicate deletions', () => {
      const tst = new TernarySearchTree2()
      tst.insert('hello')
      expect(tst.delete('hello')).toBe(true)
      expect(tst.delete('hello')).toBe(false)
    })

    it('should delete word when it is prefix of another word', () => {
      const tst = new TernarySearchTree2()
      tst.insert('app')
      tst.insert('apple')
      tst.delete('app')
      expect(tst.search('app')).toBe(false)
      expect(tst.search('apple')).toBe(true)
    })

    it('should delete word that has prefix word', () => {
      const tst = new TernarySearchTree2()
      tst.insert('app')
      tst.insert('apple')
      tst.delete('apple')
      expect(tst.search('app')).toBe(true)
      expect(tst.search('apple')).toBe(false)
    })
  })

  describe('startsWith', () => {
    it('should return true for existing prefix', () => {
      const tst = new TernarySearchTree2()
      tst.insert('apple')
      expect(tst.startsWith('app')).toBe(true)
    })

    it('should return true for exact word', () => {
      const tst = new TernarySearchTree2()
      tst.insert('apple')
      expect(tst.startsWith('apple')).toBe(true)
    })

    it('should return false for non-existent prefix', () => {
      const tst = new TernarySearchTree2()
      tst.insert('apple')
      expect(tst.startsWith('banana')).toBe(false)
    })

    it('should handle empty prefix', () => {
      const tst = new TernarySearchTree2()
      tst.insert('apple')
      expect(tst.startsWith('')).toBe(true)
    })

    it('should find prefix for words with common start', () => {
      const tst = new TernarySearchTree2()
      tst.insert('app')
      tst.insert('apple')
      tst.insert('application')
      expect(tst.startsWith('app')).toBe(true)
      expect(tst.startsWith('appl')).toBe(true)
      expect(tst.startsWith('apple')).toBe(true)
    })
  })

  describe('getAllWords', () => {
    it('should return all words in tree', () => {
      const tst = new TernarySearchTree2()
      tst.insert('apple')
      tst.insert('banana')
      tst.insert('cherry')
      const words = tst.getAllWords()
      expect(words).toHaveLength(3)
      expect(words).toContain('apple')
      expect(words).toContain('banana')
      expect(words).toContain('cherry')
    })

    it('should return empty array for empty tree', () => {
      const tst = new TernarySearchTree2()
      expect(tst.getAllWords()).toEqual([])
    })

    it('should return words with common prefix', () => {
      const tst = new TernarySearchTree2()
      tst.insert('app')
      tst.insert('apple')
      tst.insert('application')
      const words = tst.getAllWords()
      expect(words).toHaveLength(3)
      expect(words).toContain('app')
      expect(words).toContain('apple')
      expect(words).toContain('application')
    })

    it('should handle words in alphabetical order insertion', () => {
      const tst = new TernarySearchTree2()
      tst.insert('a')
      tst.insert('b')
      tst.insert('c')
      const words = tst.getAllWords()
      expect(words).toHaveLength(3)
      expect(words).toContain('a')
      expect(words).toContain('b')
      expect(words).toContain('c')
    })

    it('should handle words in reverse alphabetical order insertion', () => {
      const tst = new TernarySearchTree2()
      tst.insert('c')
      tst.insert('b')
      tst.insert('a')
      const words = tst.getAllWords()
      expect(words).toHaveLength(3)
      expect(words).toContain('a')
      expect(words).toContain('b')
      expect(words).toContain('c')
    })
  })

  describe('autoComplete', () => {
    it('should return all words starting with prefix', () => {
      const tst = new TernarySearchTree2()
      tst.insert('apple')
      tst.insert('app')
      tst.insert('application')
      tst.insert('banana')
      const results = tst.autoComplete('app')
      expect(results).toHaveLength(3)
      expect(results).toContain('app')
      expect(results).toContain('apple')
      expect(results).toContain('application')
    })

    it('should return results in alphabetical order', () => {
      const tst = new TernarySearchTree2()
      tst.insert('cat')
      tst.insert('car')
      tst.insert('cab')
      const results = tst.autoComplete('ca')
      expect(results).toEqual(['cab', 'car', 'cat'])
    })

    it('should return empty array for non-existent prefix', () => {
      const tst = new TernarySearchTree2()
      tst.insert('apple')
      const results = tst.autoComplete('banana')
      expect(results).toEqual([])
    })

    it('should return all words when prefix is empty', () => {
      const tst = new TernarySearchTree2()
      tst.insert('apple')
      tst.insert('banana')
      tst.insert('cherry')
      const results = tst.autoComplete('')
      expect(results).toHaveLength(3)
    })

    it('should return single word when prefix is exact match', () => {
      const tst = new TernarySearchTree2()
      tst.insert('hello')
      tst.insert('help')
      tst.insert('helmet')
      const results = tst.autoComplete('hello')
      expect(results).toEqual(['hello'])
    })

    it('should handle single character prefix', () => {
      const tst = new TernarySearchTree2()
      tst.insert('apple')
      tst.insert('banana')
      tst.insert('apricot')
      const results = tst.autoComplete('a')
      expect(results).toHaveLength(2)
      expect(results).toContain('apple')
      expect(results).toContain('apricot')
    })

    it('should include the prefix if it is a word', () => {
      const tst = new TernarySearchTree2()
      tst.insert('app')
      tst.insert('apple')
      tst.insert('application')
      const results = tst.autoComplete('app')
      expect(results).toContain('app')
    })
  })

  describe('size', () => {
    it('should return 0 for empty tree', () => {
      const tst = new TernarySearchTree2()
      expect(tst.size).toBe(0)
    })

    it('should increment on insert', () => {
      const tst = new TernarySearchTree2()
      tst.insert('hello')
      expect(tst.size).toBe(1)
      tst.insert('world')
      expect(tst.size).toBe(2)
    })

    it('should not increment on duplicate insert', () => {
      const tst = new TernarySearchTree2()
      tst.insert('hello')
      tst.insert('hello')
      expect(tst.size).toBe(1)
    })

    it('should decrement on delete', () => {
      const tst = new TernarySearchTree2()
      tst.insert('hello')
      tst.insert('world')
      tst.delete('hello')
      expect(tst.size).toBe(1)
    })
  })

  describe('isEmpty', () => {
    it('should return true for empty tree', () => {
      const tst = new TernarySearchTree2()
      expect(tst.isEmpty).toBe(true)
    })

    it('should return false after insert', () => {
      const tst = new TernarySearchTree2()
      tst.insert('hello')
      expect(tst.isEmpty).toBe(false)
    })

    it('should return true after deleting all words', () => {
      const tst = new TernarySearchTree2()
      tst.insert('hello')
      tst.delete('hello')
      expect(tst.isEmpty).toBe(true)
    })
  })

  describe('clear', () => {
    it('should clear all words', () => {
      const tst = new TernarySearchTree2()
      tst.insert('hello')
      tst.insert('world')
      tst.clear()
      expect(tst.size).toBe(0)
      expect(tst.isEmpty).toBe(true)
      expect(tst.search('hello')).toBe(false)
      expect(tst.search('world')).toBe(false)
    })

    it('should handle clear on empty tree', () => {
      const tst = new TernarySearchTree2()
      tst.clear()
      expect(tst.size).toBe(0)
    })
  })

  describe('getTimeComplexity', () => {
    it('should return time complexity for all operations', () => {
      const tst = new TernarySearchTree2()
      const complexity = tst.getTimeComplexity()
      expect(complexity).toHaveProperty('insert')
      expect(complexity).toHaveProperty('delete')
      expect(complexity).toHaveProperty('search')
      expect(complexity).toHaveProperty('startsWith')
      expect(complexity).toHaveProperty('getAllWords')
      expect(complexity).toHaveProperty('autoComplete')
      expect(complexity).toHaveProperty('size')
      expect(complexity).toHaveProperty('isEmpty')
      expect(complexity).toHaveProperty('clear')
    })

    it('should return correct complexity values', () => {
      const tst = new TernarySearchTree2()
      const complexity = tst.getTimeComplexity()
      expect(complexity.insert).toBe('O(m)')
      expect(complexity.search).toBe('O(m)')
      expect(complexity.autoComplete).toBe('O(m + k)')
      expect(complexity.getAllWords).toBe('O(n)')
    })
  })

  describe('edge cases', () => {
    it('should handle long strings', () => {
      const tst = new TernarySearchTree2()
      const longWord = 'a'.repeat(1000)
      tst.insert(longWord)
      expect(tst.search(longWord)).toBe(true)
    })

    it('should handle case sensitivity', () => {
      const tst = new TernarySearchTree2()
      tst.insert('Hello')
      expect(tst.search('hello')).toBe(false)
      expect(tst.search('Hello')).toBe(true)
    })

    it('should handle special characters', () => {
      const tst = new TernarySearchTree2()
      tst.insert('hello-world')
      tst.insert('test@123')
      expect(tst.search('hello-world')).toBe(true)
      expect(tst.search('test@123')).toBe(true)
    })

    it('should handle numbers', () => {
      const tst = new TernarySearchTree2()
      tst.insert('123')
      tst.insert('456')
      expect(tst.search('123')).toBe(true)
      expect(tst.search('456')).toBe(true)
    })

    it('should handle words with unicode', () => {
      const tst = new TernarySearchTree2()
      tst.insert('café')
      tst.insert('naïve')
      expect(tst.search('café')).toBe(true)
      expect(tst.search('naïve')).toBe(true)
    })
  })

  describe('integration tests', () => {
    it('should handle complex word operations', () => {
      const tst = new TernarySearchTree2()
      tst.insert('app')
      tst.insert('apple')
      tst.insert('application')
      tst.insert('banana')
      tst.insert('band')

      expect(tst.size).toBe(5)
      expect(tst.startsWith('app')).toBe(true)
      
      tst.delete('apple')
      expect(tst.size).toBe(4)
      expect(tst.search('apple')).toBe(false)
      expect(tst.search('app')).toBe(true)
      
      const appWords = tst.autoComplete('app')
      expect(appWords).toHaveLength(2)
      expect(appWords).toContain('app')
      expect(appWords).toContain('application')
    })

    it('should handle autocomplete after deletions', () => {
      const tst = new TernarySearchTree2()
      tst.insert('apple')
      tst.insert('app')
      tst.insert('application')
      
      tst.delete('application')
      
      const results = tst.autoComplete('app')
      expect(results).toHaveLength(2)
      expect(results).toContain('app')
      expect(results).toContain('apple')
    })

    it('should maintain state through multiple operations', () => {
      const tst = new TernarySearchTree2()
      const words = ['a', 'ab', 'abc', 'abcd', 'abcde']
      
      words.forEach(word => tst.insert(word))
      expect(tst.size).toBe(words.length)
      
      words.forEach(word => expect(tst.search(word)).toBe(true))
      
      tst.delete('abc')
      expect(tst.size).toBe(words.length - 1)
      expect(tst.search('abc')).toBe(false)
      expect(tst.search('abcd')).toBe(true)
      expect(tst.search('ab')).toBe(true)
      
      const autocompleteResults = tst.autoComplete('ab')
      expect(autocompleteResults.length).toBeGreaterThan(0)
    })

    it('should handle mixed character order insertion', () => {
      const tst = new TernarySearchTree2()
      tst.insert('cat')
      tst.insert('bat')
      tst.insert('rat')
      tst.insert('hat')
      
      expect(tst.search('cat')).toBe(true)
      expect(tst.search('bat')).toBe(true)
      expect(tst.search('rat')).toBe(true)
      expect(tst.search('hat')).toBe(true)
      
      const allWords = tst.getAllWords()
      expect(allWords).toHaveLength(4)
    })
  })
})
