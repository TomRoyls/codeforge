import { describe, it, expect } from 'vitest'
import { Trie3 } from './src/core/trie-3/index.js'

describe('Trie3', () => {
  describe('insert and search', () => {
    it('should insert and search a single word', () => {
      const trie = new Trie3()
      trie.insert('hello')
      expect(trie.search('hello')).toBe(true)
    })

    it('should return false for non-existent word', () => {
      const trie = new Trie3()
      trie.insert('hello')
      expect(trie.search('world')).toBe(false)
    })

    it('should insert multiple words', () => {
      const trie = new Trie3()
      trie.insert('hello')
      trie.insert('world')
      trie.insert('hello')
      expect(trie.search('hello')).toBe(true)
      expect(trie.search('world')).toBe(true)
    })

    it('should handle duplicate inserts', () => {
      const trie = new Trie3()
      trie.insert('hello')
      trie.insert('hello')
      trie.insert('hello')
      expect(trie.size).toBe(1)
    })

    it('should search words with common prefix', () => {
      const trie = new Trie3()
      trie.insert('app')
      trie.insert('apple')
      trie.insert('application')
      expect(trie.search('app')).toBe(true)
      expect(trie.search('apple')).toBe(true)
      expect(trie.search('application')).toBe(true)
    })

    it('should not match partial words', () => {
      const trie = new Trie3()
      trie.insert('apple')
      expect(trie.search('app')).toBe(false)
      expect(trie.search('appl')).toBe(false)
    })

    it('should handle single character words', () => {
      const trie = new Trie3()
      trie.insert('a')
      trie.insert('b')
      trie.insert('c')
      expect(trie.search('a')).toBe(true)
      expect(trie.search('b')).toBe(true)
      expect(trie.search('c')).toBe(true)
    })

    it('should handle empty string insert', () => {
      const trie = new Trie3()
      trie.insert('')
      expect(trie.size).toBe(0)
    })
  })

  describe('startsWith', () => {
    it('should return true for existing prefix', () => {
      const trie = new Trie3()
      trie.insert('apple')
      expect(trie.startsWith('app')).toBe(true)
    })

    it('should return true for exact word', () => {
      const trie = new Trie3()
      trie.insert('apple')
      expect(trie.startsWith('apple')).toBe(true)
    })

    it('should return false for non-existent prefix', () => {
      const trie = new Trie3()
      trie.insert('apple')
      expect(trie.startsWith('banana')).toBe(false)
    })

    it('should handle empty prefix', () => {
      const trie = new Trie3()
      trie.insert('apple')
      expect(trie.startsWith('')).toBe(true)
    })

    it('should find prefix for words with common start', () => {
      const trie = new Trie3()
      trie.insert('app')
      trie.insert('apple')
      trie.insert('application')
      expect(trie.startsWith('app')).toBe(true)
      expect(trie.startsWith('appl')).toBe(true)
      expect(trie.startsWith('apple')).toBe(true)
    })
  })

  describe('remove', () => {
    it('should remove existing word', () => {
      const trie = new Trie3()
      trie.insert('hello')
      expect(trie.remove('hello')).toBe(true)
      expect(trie.search('hello')).toBe(false)
    })

    it('should return false for non-existent word', () => {
      const trie = new Trie3()
      trie.insert('hello')
      expect(trie.remove('world')).toBe(false)
    })

    it('should decrement size on removal', () => {
      const trie = new Trie3()
      trie.insert('hello')
      trie.insert('world')
      trie.remove('hello')
      expect(trie.size).toBe(1)
    })

    it('should preserve words with common prefix', () => {
      const trie = new Trie3()
      trie.insert('app')
      trie.insert('apple')
      trie.insert('application')
      trie.remove('apple')
      expect(trie.search('app')).toBe(true)
      expect(trie.search('apple')).toBe(false)
      expect(trie.search('application')).toBe(true)
    })

    it('should remove word and delete unused nodes', () => {
      const trie = new Trie3()
      trie.insert('hello')
      trie.remove('hello')
      expect(trie.startsWith('h')).toBe(false)
    })

    it('should handle duplicate removals', () => {
      const trie = new Trie3()
      trie.insert('hello')
      expect(trie.remove('hello')).toBe(true)
      expect(trie.remove('hello')).toBe(false)
    })

    it('should remove word when it is prefix of another word', () => {
      const trie = new Trie3()
      trie.insert('app')
      trie.insert('apple')
      trie.remove('app')
      expect(trie.search('app')).toBe(false)
      expect(trie.search('apple')).toBe(true)
    })

    it('should remove word that has prefix word', () => {
      const trie = new Trie3()
      trie.insert('app')
      trie.insert('apple')
      trie.remove('apple')
      expect(trie.search('app')).toBe(true)
      expect(trie.search('apple')).toBe(false)
    })
  })

  describe('contains', () => {
    it('should return true for existing word', () => {
      const trie = new Trie3()
      trie.insert('hello')
      expect(trie.contains('hello')).toBe(true)
    })

    it('should return false for non-existent word', () => {
      const trie = new Trie3()
      trie.insert('hello')
      expect(trie.contains('world')).toBe(false)
    })

    it('should not match prefixes', () => {
      const trie = new Trie3()
      trie.insert('hello')
      expect(trie.contains('he')).toBe(false)
    })
  })

  describe('countWordsStartingWith', () => {
    it('should count words with common prefix', () => {
      const trie = new Trie3()
      trie.insert('app')
      trie.insert('apple')
      trie.insert('application')
      trie.insert('banana')
      expect(trie.countWordsStartingWith('app')).toBe(3)
    })

    it('should return 0 for non-existent prefix', () => {
      const trie = new Trie3()
      trie.insert('apple')
      expect(trie.countWordsStartingWith('banana')).toBe(0)
    })

    it('should count all words with empty prefix', () => {
      const trie = new Trie3()
      trie.insert('apple')
      trie.insert('banana')
      trie.insert('cherry')
      expect(trie.countWordsStartingWith('')).toBe(3)
    })

    it('should count exact word match', () => {
      const trie = new Trie3()
      trie.insert('apple')
      trie.insert('applepie')
      expect(trie.countWordsStartingWith('apple')).toBe(2)
    })
  })

  describe('getAllWords', () => {
    it('should return all words in trie', () => {
      const trie = new Trie3()
      trie.insert('apple')
      trie.insert('banana')
      trie.insert('cherry')
      const words = trie.getAllWords()
      expect(words).toHaveLength(3)
      expect(words).toContain('apple')
      expect(words).toContain('banana')
      expect(words).toContain('cherry')
    })

    it('should return words with given prefix', () => {
      const trie = new Trie3()
      trie.insert('apple')
      trie.insert('app')
      trie.insert('application')
      trie.insert('banana')
      const words = trie.getAllWords('app')
      expect(words).toHaveLength(3)
      expect(words).toContain('app')
      expect(words).toContain('apple')
      expect(words).toContain('application')
    })

    it('should return empty array for non-existent prefix', () => {
      const trie = new Trie3()
      trie.insert('apple')
      const words = trie.getAllWords('banana')
      expect(words).toEqual([])
    })

    it('should return all words without prefix', () => {
      const trie = new Trie3()
      trie.insert('a')
      trie.insert('ab')
      trie.insert('abc')
      const words = trie.getAllWords()
      expect(words).toHaveLength(3)
    })
  })

  describe('size', () => {
    it('should return 0 for empty trie', () => {
      const trie = new Trie3()
      expect(trie.size).toBe(0)
    })

    it('should increment on insert', () => {
      const trie = new Trie3()
      trie.insert('hello')
      expect(trie.size).toBe(1)
      trie.insert('world')
      expect(trie.size).toBe(2)
    })

    it('should not increment on duplicate insert', () => {
      const trie = new Trie3()
      trie.insert('hello')
      trie.insert('hello')
      expect(trie.size).toBe(1)
    })

    it('should decrement on remove', () => {
      const trie = new Trie3()
      trie.insert('hello')
      trie.insert('world')
      trie.remove('hello')
      expect(trie.size).toBe(1)
    })
  })

  describe('isEmpty', () => {
    it('should return true for empty trie', () => {
      const trie = new Trie3()
      expect(trie.isEmpty).toBe(true)
    })

    it('should return false after insert', () => {
      const trie = new Trie3()
      trie.insert('hello')
      expect(trie.isEmpty).toBe(false)
    })

    it('should return true after removing all words', () => {
      const trie = new Trie3()
      trie.insert('hello')
      trie.remove('hello')
      expect(trie.isEmpty).toBe(true)
    })
  })

  describe('clear', () => {
    it('should clear all words', () => {
      const trie = new Trie3()
      trie.insert('hello')
      trie.insert('world')
      trie.clear()
      expect(trie.size).toBe(0)
      expect(trie.isEmpty).toBe(true)
      expect(trie.search('hello')).toBe(false)
      expect(trie.search('world')).toBe(false)
    })

    it('should handle clear on empty trie', () => {
      const trie = new Trie3()
      trie.clear()
      expect(trie.size).toBe(0)
    })
  })

  describe('forEach', () => {
    it('should iterate over all words', () => {
      const trie = new Trie3()
      trie.insert('apple')
      trie.insert('banana')
      trie.insert('cherry')
      const words: string[] = []
      trie.forEach(word => words.push(word))
      expect(words).toHaveLength(3)
      expect(words).toContain('apple')
      expect(words).toContain('banana')
      expect(words).toContain('cherry')
    })

    it('should not iterate over empty trie', () => {
      const trie = new Trie3()
      let count = 0
      trie.forEach(() => count++)
      expect(count).toBe(0)
    })
  })

  describe('longestCommonPrefix', () => {
    it('should return empty string for empty trie', () => {
      const trie = new Trie3()
      expect(trie.longestCommonPrefix()).toBe('')
    })

    it('should return single word', () => {
      const trie = new Trie3()
      trie.insert('hello')
      expect(trie.longestCommonPrefix()).toBe('hello')
    })

    it('should return common prefix of two words', () => {
      const trie = new Trie3()
      trie.insert('apple')
      trie.insert('appetizer')
      expect(trie.longestCommonPrefix()).toBe('app')
    })

    it('should return common prefix of multiple words', () => {
      const trie = new Trie3()
      trie.insert('app')
      trie.insert('apple')
      trie.insert('application')
      expect(trie.longestCommonPrefix()).toBe('app')
    })

    it('should stop at word boundary', () => {
      const trie = new Trie3()
      trie.insert('app')
      trie.insert('apple')
      expect(trie.longestCommonPrefix()).toBe('app')
    })

    it('should return empty string for words with different starts', () => {
      const trie = new Trie3()
      trie.insert('apple')
      trie.insert('banana')
      expect(trie.longestCommonPrefix()).toBe('')
    })
  })

  describe('longestPrefixOf', () => {
    it('should return empty string for empty input', () => {
      const trie = new Trie3()
      expect(trie.longestPrefixOf('')).toBe('')
    })

    it('should return longest matching prefix', () => {
      const trie = new Trie3()
      trie.insert('app')
      trie.insert('apple')
      trie.insert('application')
      expect(trie.longestPrefixOf('applepie')).toBe('apple')
    })

    it('should return exact word match', () => {
      const trie = new Trie3()
      trie.insert('hello')
      expect(trie.longestPrefixOf('hello')).toBe('hello')
    })

    it('should return empty string for no match', () => {
      const trie = new Trie3()
      trie.insert('apple')
      expect(trie.longestPrefixOf('banana')).toBe('')
    })

    it('should handle partial matches', () => {
      const trie = new Trie3()
      trie.insert('app')
      trie.insert('apple')
      expect(trie.longestPrefixOf('ap')).toBe('')
    })

    it('should return first word if multiple matches', () => {
      const trie = new Trie3()
      trie.insert('a')
      trie.insert('an')
      trie.insert('and')
      expect(trie.longestPrefixOf('ant')).toBe('an')
    })
  })

  describe('hasWord', () => {
    it('should return true for existing word', () => {
      const trie = new Trie3()
      trie.insert('hello')
      expect(trie.hasWord('hello')).toBe(true)
    })

    it('should return false for non-existent word', () => {
      const trie = new Trie3()
      trie.insert('hello')
      expect(trie.hasWord('world')).toBe(false)
    })

    it('should not match prefixes', () => {
      const trie = new Trie3()
      trie.insert('hello')
      expect(trie.hasWord('he')).toBe(false)
    })
  })

  describe('edge cases', () => {
    it('should handle long strings', () => {
      const trie = new Trie3()
      const longWord = 'a'.repeat(1000)
      trie.insert(longWord)
      expect(trie.search(longWord)).toBe(true)
    })

    it('should handle case sensitivity', () => {
      const trie = new Trie3()
      trie.insert('Hello')
      expect(trie.search('hello')).toBe(false)
      expect(trie.search('Hello')).toBe(true)
    })

    it('should handle special characters', () => {
      const trie = new Trie3()
      trie.insert('hello-world')
      trie.insert('test@123')
      expect(trie.search('hello-world')).toBe(true)
      expect(trie.search('test@123')).toBe(true)
    })

    it('should handle numbers', () => {
      const trie = new Trie3()
      trie.insert('123')
      trie.insert('456')
      expect(trie.search('123')).toBe(true)
      expect(trie.search('456')).toBe(true)
    })

    it('should handle words with unicode', () => {
      const trie = new Trie3()
      trie.insert('café')
      trie.insert('naïve')
      expect(trie.search('café')).toBe(true)
      expect(trie.search('naïve')).toBe(true)
    })
  })

  describe('integration tests', () => {
    it('should handle complex word operations', () => {
      const trie = new Trie3()
      trie.insert('app')
      trie.insert('apple')
      trie.insert('application')
      trie.insert('banana')
      trie.insert('band')

      expect(trie.size).toBe(5)
      expect(trie.startsWith('app')).toBe(true)
      expect(trie.countWordsStartingWith('app')).toBe(3)
      expect(trie.countWordsStartingWith('ban')).toBe(2)
      
      trie.remove('apple')
      expect(trie.size).toBe(4)
      expect(trie.search('apple')).toBe(false)
      expect(trie.search('app')).toBe(true)
      
      const appWords = trie.getAllWords('app')
      expect(appWords).toHaveLength(2)
      expect(appWords).toContain('app')
      expect(appWords).toContain('application')
    })

    it('should maintain state through multiple operations', () => {
      const trie = new Trie3()
      const words = ['a', 'ab', 'abc', 'abcd', 'abcde']
      
      words.forEach(word => trie.insert(word))
      expect(trie.size).toBe(words.length)
      
      words.forEach(word => expect(trie.search(word)).toBe(true))
      
      trie.remove('abc')
      expect(trie.size).toBe(words.length - 1)
      expect(trie.search('abc')).toBe(false)
      expect(trie.search('abcd')).toBe(true)
      expect(trie.search('ab')).toBe(true)
      
      expect(trie.longestCommonPrefix()).toBe('a')
    })
  })
})
