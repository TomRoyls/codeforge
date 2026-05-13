import { describe, it, expect } from 'vitest'
import { RadixTree2 } from '../src/core/radix-tree-2/index.js'

describe('RadixTree2', () => {
  describe('empty tree', () => {
    it('should have size 0', () => {
      const tree = new RadixTree2()
      expect(tree.size).toBe(0)
    })

    it('should be empty', () => {
      const tree = new RadixTree2()
      expect(tree.isEmpty).toBe(true)
    })

    it('should return false for search', () => {
      const tree = new RadixTree2()
      expect(tree.search('test')).toBe(false)
    })

    it('should return false for contains', () => {
      const tree = new RadixTree2()
      expect(tree.contains('test')).toBe(false)
    })

    it('should return true for startsWith empty prefix', () => {
      const tree = new RadixTree2()
      expect(tree.startsWith('')).toBe(true)
    })

    it('should return false for startsWith non-empty prefix', () => {
      const tree = new RadixTree2()
      expect(tree.startsWith('a')).toBe(false)
    })

    it('should return empty array for toArray', () => {
      const tree = new RadixTree2()
      expect(tree.toArray()).toEqual([])
    })

    it('should return empty string for longestCommonPrefix', () => {
      const tree = new RadixTree2()
      expect(tree.longestCommonPrefix()).toBe('')
    })

    it('should return empty array for fuzzySearch', () => {
      const tree = new RadixTree2()
      expect(tree.fuzzySearch('test', 2)).toEqual([])
    })

    it('should not throw on clear', () => {
      const tree = new RadixTree2()
      tree.clear()
      expect(tree.size).toBe(0)
    })
  })

  describe('insert and search', () => {
    it('should insert and find a single word', () => {
      const tree = new RadixTree2()
      tree.insert('hello')
      expect(tree.search('hello')).toBe(true)
    })

    it('should not find non-existent word', () => {
      const tree = new RadixTree2()
      tree.insert('hello')
      expect(tree.search('world')).toBe(false)
    })

    it('should insert multiple words', () => {
      const tree = new RadixTree2()
      tree.insert('hello')
      tree.insert('world')
      tree.insert('test')
      expect(tree.search('hello')).toBe(true)
      expect(tree.search('world')).toBe(true)
      expect(tree.search('test')).toBe(true)
    })

    it('should handle duplicate insertions', () => {
      const tree = new RadixTree2()
      tree.insert('hello')
      tree.insert('hello')
      expect(tree.size).toBe(1)
      expect(tree.search('hello')).toBe(true)
    })

    it('should handle words with common prefix', () => {
      const tree = new RadixTree2()
      tree.insert('apple')
      tree.insert('app')
      tree.insert('application')
      expect(tree.search('apple')).toBe(true)
      expect(tree.search('app')).toBe(true)
      expect(tree.search('application')).toBe(true)
    })

    it('should handle single character words', () => {
      const tree = new RadixTree2()
      tree.insert('a')
      tree.insert('b')
      tree.insert('c')
      expect(tree.search('a')).toBe(true)
      expect(tree.search('b')).toBe(true)
      expect(tree.search('c')).toBe(true)
    })

    it('should handle long words', () => {
      const tree = new RadixTree2()
      const longWord = 'a'.repeat(1000)
      tree.insert(longWord)
      expect(tree.search(longWord)).toBe(true)
    })

    it('should handle empty string insertion', () => {
      const tree = new RadixTree2()
      tree.insert('')
      expect(tree.search('')).toBe(false)
    })

    it('should handle case sensitivity', () => {
      const tree = new RadixTree2()
      tree.insert('Hello')
      expect(tree.search('hello')).toBe(false)
      expect(tree.search('Hello')).toBe(true)
    })

    it('should handle special characters', () => {
      const tree = new RadixTree2()
      tree.insert('hello-world')
      tree.insert('test_case')
      tree.insert('user.name')
      expect(tree.search('hello-world')).toBe(true)
      expect(tree.search('test_case')).toBe(true)
      expect(tree.search('user.name')).toBe(true)
    })
  })

  describe('delete', () => {
    it('should remove existing word', () => {
      const tree = new RadixTree2()
      tree.insert('hello')
      expect(tree.delete('hello')).toBe(true)
      expect(tree.search('hello')).toBe(false)
      expect(tree.size).toBe(0)
    })

    it('should return false for non-existent word', () => {
      const tree = new RadixTree2()
      tree.insert('hello')
      expect(tree.delete('world')).toBe(false)
      expect(tree.size).toBe(1)
    })

    it('should remove word with common prefix', () => {
      const tree = new RadixTree2()
      tree.insert('app')
      tree.insert('apple')
      tree.insert('application')
      tree.delete('app')
      expect(tree.search('app')).toBe(false)
      expect(tree.search('apple')).toBe(true)
      expect(tree.search('application')).toBe(true)
    })

    it('should remove longest word first', () => {
      const tree = new RadixTree2()
      tree.insert('app')
      tree.insert('apple')
      tree.delete('apple')
      expect(tree.search('apple')).toBe(false)
      expect(tree.search('app')).toBe(true)
    })

    it('should handle removing from empty tree', () => {
      const tree = new RadixTree2()
      expect(tree.delete('test')).toBe(false)
    })

    it('should handle removing empty string', () => {
      const tree = new RadixTree2()
      tree.insert('hello')
      expect(tree.delete('')).toBe(false)
    })

    it('should maintain size after removal', () => {
      const tree = new RadixTree2()
      tree.insert('hello')
      tree.insert('world')
      tree.delete('hello')
      expect(tree.size).toBe(1)
    })

    it('should handle multiple removals', () => {
      const tree = new RadixTree2()
      tree.insert('a')
      tree.insert('b')
      tree.insert('c')
      tree.delete('a')
      tree.delete('b')
      tree.delete('c')
      expect(tree.size).toBe(0)
      expect(tree.isEmpty).toBe(true)
    })
  })

  describe('startsWith', () => {
    it('should return true for exact prefix match', () => {
      const tree = new RadixTree2()
      tree.insert('hello')
      expect(tree.startsWith('hel')).toBe(true)
    })

    it('should return true for empty prefix', () => {
      const tree = new RadixTree2()
      tree.insert('hello')
      expect(tree.startsWith('')).toBe(true)
    })

    it('should return false for non-existent prefix', () => {
      const tree = new RadixTree2()
      tree.insert('hello')
      expect(tree.startsWith('world')).toBe(false)
    })

    it('should return true for word prefix', () => {
      const tree = new RadixTree2()
      tree.insert('hello')
      expect(tree.startsWith('hello')).toBe(true)
    })

    it('should return false for partial word', () => {
      const tree = new RadixTree2()
      tree.insert('hello')
      expect(tree.startsWith('helloo')).toBe(false)
    })
  })

  describe('toArray', () => {
    it('should return all words in tree', () => {
      const tree = new RadixTree2()
      tree.insert('hello')
      tree.insert('world')
      tree.insert('test')
      const words = tree.toArray()
      expect(words).toContain('hello')
      expect(words).toContain('world')
      expect(words).toContain('test')
      expect(words.length).toBe(3)
    })

    it('should return empty array for empty tree', () => {
      const tree = new RadixTree2()
      const words = tree.toArray()
      expect(words).toEqual([])
    })

    it('should return single word from tree', () => {
      const tree = new RadixTree2()
      tree.insert('hello')
      const words = tree.toArray()
      expect(words).toContain('hello')
    })
  })

  describe('size', () => {
    it('should return 0 for empty tree', () => {
      const tree = new RadixTree2()
      expect(tree.size).toBe(0)
    })

    it('should increment on insert', () => {
      const tree = new RadixTree2()
      tree.insert('hello')
      expect(tree.size).toBe(1)
      tree.insert('world')
      expect(tree.size).toBe(2)
    })

    it('should not increment on duplicate insert', () => {
      const tree = new RadixTree2()
      tree.insert('hello')
      tree.insert('hello')
      expect(tree.size).toBe(1)
    })

    it('should decrement on delete', () => {
      const tree = new RadixTree2()
      tree.insert('hello')
      tree.insert('world')
      tree.delete('hello')
      expect(tree.size).toBe(1)
    })

    it('should not decrement on failed delete', () => {
      const tree = new RadixTree2()
      tree.insert('hello')
      tree.delete('world')
      expect(tree.size).toBe(1)
    })
  })

  describe('isEmpty', () => {
    it('should return true for empty tree', () => {
      const tree = new RadixTree2()
      expect(tree.isEmpty).toBe(true)
    })

    it('should return false after insert', () => {
      const tree = new RadixTree2()
      tree.insert('hello')
      expect(tree.isEmpty).toBe(false)
    })

    it('should return true after removing all words', () => {
      const tree = new RadixTree2()
      tree.insert('hello')
      tree.delete('hello')
      expect(tree.isEmpty).toBe(true)
    })
  })

  describe('clear', () => {
    it('should empty tree', () => {
      const tree = new RadixTree2()
      tree.insert('hello')
      tree.insert('world')
      tree.insert('test')
      tree.clear()
      expect(tree.size).toBe(0)
      expect(tree.isEmpty).toBe(true)
      expect(tree.search('hello')).toBe(false)
      expect(tree.search('world')).toBe(false)
      expect(tree.search('test')).toBe(false)
    })

    it('should handle clearing empty tree', () => {
      const tree = new RadixTree2()
      tree.clear()
      expect(tree.size).toBe(0)
      expect(tree.isEmpty).toBe(true)
    })

    it('should allow reuse after clear', () => {
      const tree = new RadixTree2()
      tree.insert('hello')
      tree.clear()
      tree.insert('world')
      expect(tree.search('world')).toBe(true)
      expect(tree.size).toBe(1)
    })
  })

  describe('longestCommonPrefix', () => {
    it('should return empty string for empty tree', () => {
      const tree = new RadixTree2()
      expect(tree.longestCommonPrefix()).toBe('')
    })

    it('should return word for single word', () => {
      const tree = new RadixTree2()
      tree.insert('hello')
      expect(tree.longestCommonPrefix()).toBe('hello')
    })

    it('should find common prefix', () => {
      const tree = new RadixTree2()
      tree.insert('hello')
      tree.insert('help')
      tree.insert('helmet')
      expect(tree.longestCommonPrefix()).toBe('hel')
    })

    it('should return empty string when no common prefix', () => {
      const tree = new RadixTree2()
      tree.insert('hello')
      tree.insert('world')
      expect(tree.longestCommonPrefix()).toBe('')
    })

    it('should find single character common prefix', () => {
      const tree = new RadixTree2()
      tree.insert('apple')
      tree.insert('apricot')
      expect(tree.longestCommonPrefix()).toBe('ap')
    })

    it('should return entire word when all words are same', () => {
      const tree = new RadixTree2()
      tree.insert('hello')
      tree.insert('hello')
      expect(tree.longestCommonPrefix()).toBe('hello')
    })
  })

  describe('fuzzySearch', () => {
    it('should find exact match with distance 0', () => {
      const tree = new RadixTree2()
      tree.insert('hello')
      const results = tree.fuzzySearch('hello', 0)
      expect(results).toContain('hello')
    })

    it('should find word with 1 edit distance', () => {
      const tree = new RadixTree2()
      tree.insert('hello')
      const results = tree.fuzzySearch('helo', 1)
      expect(results.length).toBeGreaterThan(0)
    })

    it('should find word with 2 edit distance', () => {
      const tree = new RadixTree2()
      tree.insert('hello')
      const results = tree.fuzzySearch('helo', 2)
      expect(results.length).toBeGreaterThan(0)
    })

    it('should return empty array for no matches', () => {
      const tree = new RadixTree2()
      tree.insert('hello')
      const results = tree.fuzzySearch('xyz', 2)
      expect(results.length).toBe(0)
    })

    it('should find multiple matches', () => {
      const tree = new RadixTree2()
      tree.insert('hello')
      tree.insert('hell')
      tree.insert('helmet')
      const results = tree.fuzzySearch('helo', 2)
      expect(results.length).toBeGreaterThan(0)
    })

    it('should handle empty pattern', () => {
      const tree = new RadixTree2()
      tree.insert('hello')
      tree.insert('world')
      const results = tree.fuzzySearch('', 2)
      expect(results.length).toBe(2)
    })

    it('should handle Infinity maxDistance', () => {
      const tree = new RadixTree2()
      tree.insert('hello')
      const results = tree.fuzzySearch('helo', Infinity)
      expect(results.length).toBeGreaterThan(0)
    })
  })

  describe('bulkInsert', () => {
    it('should insert multiple words', () => {
      const tree = new RadixTree2()
      tree.bulkInsert(['hello', 'world', 'test'])
      expect(tree.search('hello')).toBe(true)
      expect(tree.search('world')).toBe(true)
      expect(tree.search('test')).toBe(true)
      expect(tree.size).toBe(3)
    })

    it('should handle empty array', () => {
      const tree = new RadixTree2()
      tree.bulkInsert([])
      expect(tree.size).toBe(0)
    })

    it('should handle single word array', () => {
      const tree = new RadixTree2()
      tree.bulkInsert(['hello'])
      expect(tree.search('hello')).toBe(true)
      expect(tree.size).toBe(1)
    })

    it('should handle duplicates in array', () => {
      const tree = new RadixTree2()
      tree.bulkInsert(['hello', 'hello', 'hello'])
      expect(tree.search('hello')).toBe(true)
      expect(tree.size).toBe(1)
    })

    it('should handle large array', () => {
      const tree = new RadixTree2()
      const words = Array.from({ length: 100 }, (_, i) => `word${i}`)
      tree.bulkInsert(words)
      expect(tree.size).toBe(100)
    })
  })

  describe('getTimeComplexity', () => {
    it('should return complexity object', () => {
      const tree = new RadixTree2()
      const complexities = tree.getTimeComplexity()
      expect(complexities).toHaveProperty('insert')
      expect(complexities).toHaveProperty('delete')
      expect(complexities).toHaveProperty('search')
      expect(complexities).toHaveProperty('contains')
      expect(complexities).toHaveProperty('startsWith')
      expect(complexities).toHaveProperty('toArray')
      expect(complexities).toHaveProperty('longestCommonPrefix')
      expect(complexities).toHaveProperty('fuzzySearch')
      expect(complexities).toHaveProperty('bulkInsert')
      expect(complexities).toHaveProperty('size')
      expect(complexities).toHaveProperty('isEmpty')
      expect(complexities).toHaveProperty('clear')
    })

    it('should return correct complexities', () => {
      const tree = new RadixTree2()
      const complexities = tree.getTimeComplexity()
      expect(complexities.insert).toBe('O(m)')
      expect(complexities.delete).toBe('O(m)')
      expect(complexities.search).toBe('O(m)')
      expect(complexities.contains).toBe('O(m)')
      expect(complexities.startsWith).toBe('O(m)')
      expect(complexities.toArray).toBe('O(n)')
      expect(complexities.longestCommonPrefix).toBe('O(n * m)')
      expect(complexities.fuzzySearch).toBe('O(n * m^2)')
      expect(complexities.bulkInsert).toBe('O(k * m)')
      expect(complexities.size).toBe('O(1)')
      expect(complexities.isEmpty).toBe('O(1)')
      expect(complexities.clear).toBe('O(1)')
    })
  })

  describe('edge cases', () => {
    it('should handle inserting word that is prefix of existing word', () => {
      const tree = new RadixTree2()
      tree.insert('hello')
      tree.insert('hel')
      expect(tree.search('hello')).toBe(true)
      expect(tree.search('hel')).toBe(true)
    })

    it('should handle removing word that leaves multiple children', () => {
      const tree = new RadixTree2()
      tree.insert('app')
      tree.insert('apple')
      tree.insert('application')
      tree.delete('app')
      expect(tree.search('apple')).toBe(true)
      expect(tree.search('application')).toBe(true)
    })

    it('should handle words with numbers', () => {
      const tree = new RadixTree2()
      tree.insert('test123')
      tree.insert('test456')
      tree.insert('test789')
      expect(tree.search('test123')).toBe(true)
      expect(tree.search('test456')).toBe(true)
      expect(tree.search('test789')).toBe(true)
    })

    it('should handle unicode characters', () => {
      const tree = new RadixTree2()
      tree.insert('café')
      tree.insert('caféine')
      expect(tree.search('café')).toBe(true)
      expect(tree.search('caféine')).toBe(true)
    })

    it('should handle very long strings', () => {
      const tree = new RadixTree2()
      const prefix = 'x'.repeat(100)
      tree.insert(prefix + 'aaa')
      tree.insert(prefix + 'bbb')
      tree.insert(prefix + 'ccc')
      expect(tree.longestCommonPrefix()).toBe(prefix)
    })
  })
})
