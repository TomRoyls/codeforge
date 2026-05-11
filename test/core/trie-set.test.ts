import { describe, it, expect } from 'vitest'
import { TrieSet } from '../../src/core/trie-set/index.js'
import type { TrieNode } from '../../src/core/trie-set/index.js'

describe('TrieSet', () => {
  describe('constructor', () => {
    it('should create an empty trie set', () => {
      const trie = new TrieSet()
      expect(trie.size).toBe(0)
      expect(trie.isEmpty).toBe(true)
    })

    it('should have a root node', () => {
      const trie = new TrieSet()
      expect(trie.isEmpty).toBe(true)
    })
  })

  describe('add', () => {
    it('should add a single word', () => {
      const trie = new TrieSet()
      expect(trie.add('hello')).toBe(true)
      expect(trie.size).toBe(1)
      expect(trie.has('hello')).toBe(true)
    })

    it('should return false when adding duplicate word', () => {
      const trie = new TrieSet()
      trie.add('hello')
      expect(trie.add('hello')).toBe(false)
      expect(trie.size).toBe(1)
    })

    it('should add empty string', () => {
      const trie = new TrieSet()
      expect(trie.add('')).toBe(true)
      expect(trie.size).toBe(1)
      expect(trie.has('')).toBe(true)
    })

    it('should return false for duplicate empty string', () => {
      const trie = new TrieSet()
      trie.add('')
      expect(trie.add('')).toBe(false)
    })

    it('should add multiple different words', () => {
      const trie = new TrieSet()
      expect(trie.add('apple')).toBe(true)
      expect(trie.add('banana')).toBe(true)
      expect(trie.add('cherry')).toBe(true)
      expect(trie.size).toBe(3)
    })

    it('should add words that are prefixes of each other', () => {
      const trie = new TrieSet()
      trie.add('a')
      trie.add('ab')
      trie.add('abc')
      expect(trie.size).toBe(3)
      expect(trie.has('a')).toBe(true)
      expect(trie.has('ab')).toBe(true)
      expect(trie.has('abc')).toBe(true)
    })

    it('should add words with shared prefixes', () => {
      const trie = new TrieSet()
      trie.add('cat')
      trie.add('car')
      trie.add('cap')
      expect(trie.size).toBe(3)
    })

    it('should add single character words', () => {
      const trie = new TrieSet()
      trie.add('a')
      trie.add('b')
      trie.add('z')
      expect(trie.size).toBe(3)
    })

    it('should handle words with unicode characters', () => {
      const trie = new TrieSet()
      expect(trie.add('café')).toBe(true)
      expect(trie.has('café')).toBe(true)
    })

    it('should handle long words', () => {
      const trie = new TrieSet()
      const longWord = 'a'.repeat(1000)
      expect(trie.add(longWord)).toBe(true)
      expect(trie.has(longWord)).toBe(true)
      expect(trie.size).toBe(1)
    })

    it('should handle mixed case words as distinct', () => {
      const trie = new TrieSet()
      trie.add('Hello')
      trie.add('hello')
      trie.add('HELLO')
      expect(trie.size).toBe(3)
    })
  })

  describe('has', () => {
    it('should return true for existing word', () => {
      const trie = new TrieSet()
      trie.add('hello')
      expect(trie.has('hello')).toBe(true)
    })

    it('should return false for non-existing word', () => {
      const trie = new TrieSet()
      trie.add('hello')
      expect(trie.has('world')).toBe(false)
    })

    it('should return false for prefix that is not a word', () => {
      const trie = new TrieSet()
      trie.add('hello')
      expect(trie.has('hel')).toBe(false)
    })

    it('should return false for word that extends existing word', () => {
      const trie = new TrieSet()
      trie.add('hello')
      expect(trie.has('helloworld')).toBe(false)
    })

    it('should return false for empty trie', () => {
      const trie = new TrieSet()
      expect(trie.has('anything')).toBe(false)
    })

    it('should return false for empty string in empty trie', () => {
      const trie = new TrieSet()
      expect(trie.has('')).toBe(false)
    })

    it('should find word after multiple additions and deletions', () => {
      const trie = new TrieSet()
      trie.add('a')
      trie.add('b')
      trie.delete('a')
      expect(trie.has('a')).toBe(false)
      expect(trie.has('b')).toBe(true)
    })
  })

  describe('delete', () => {
    it('should delete an existing word', () => {
      const trie = new TrieSet()
      trie.add('hello')
      expect(trie.delete('hello')).toBe(true)
      expect(trie.has('hello')).toBe(false)
      expect(trie.size).toBe(0)
    })

    it('should return false for non-existing word', () => {
      const trie = new TrieSet()
      expect(trie.delete('hello')).toBe(false)
    })

    it('should not affect other words when deleting', () => {
      const trie = new TrieSet()
      trie.add('hello')
      trie.add('help')
      trie.delete('hello')
      expect(trie.has('hello')).toBe(false)
      expect(trie.has('help')).toBe(true)
      expect(trie.size).toBe(1)
    })

    it('should handle deleting prefix word while keeping longer word', () => {
      const trie = new TrieSet()
      trie.add('a')
      trie.add('ab')
      trie.add('abc')
      trie.delete('a')
      expect(trie.has('a')).toBe(false)
      expect(trie.has('ab')).toBe(true)
      expect(trie.has('abc')).toBe(true)
    })

    it('should handle deleting longer word while keeping prefix', () => {
      const trie = new TrieSet()
      trie.add('a')
      trie.add('ab')
      trie.add('abc')
      trie.delete('abc')
      expect(trie.has('a')).toBe(true)
      expect(trie.has('ab')).toBe(true)
      expect(trie.has('abc')).toBe(false)
    })

    it('should delete empty string', () => {
      const trie = new TrieSet()
      trie.add('')
      expect(trie.delete('')).toBe(true)
      expect(trie.has('')).toBe(false)
    })

    it('should return false for deleting non-existent empty string', () => {
      const trie = new TrieSet()
      expect(trie.delete('')).toBe(false)
    })

    it('should handle deleting all words', () => {
      const trie = new TrieSet()
      trie.add('a')
      trie.add('b')
      trie.add('c')
      trie.delete('a')
      trie.delete('b')
      trie.delete('c')
      expect(trie.size).toBe(0)
      expect(trie.isEmpty).toBe(true)
    })

    it('should handle deleting word not in trie that shares prefix', () => {
      const trie = new TrieSet()
      trie.add('hello')
      expect(trie.delete('hel')).toBe(false)
      expect(trie.size).toBe(1)
    })
  })

  describe('startsWith', () => {
    it('should return true for existing prefix', () => {
      const trie = new TrieSet()
      trie.add('hello')
      expect(trie.startsWith('hel')).toBe(true)
    })

    it('should return true for exact word as prefix', () => {
      const trie = new TrieSet()
      trie.add('hello')
      expect(trie.startsWith('hello')).toBe(true)
    })

    it('should return false for non-existing prefix', () => {
      const trie = new TrieSet()
      trie.add('hello')
      expect(trie.startsWith('xyz')).toBe(false)
    })

    it('should return true for empty string prefix', () => {
      const trie = new TrieSet()
      trie.add('hello')
      expect(trie.startsWith('')).toBe(true)
    })

    it('should return false for empty string prefix on empty trie', () => {
      const trie = new TrieSet()
      expect(trie.startsWith('')).toBe(false)
    })

    it('should return true for single character prefix', () => {
      const trie = new TrieSet()
      trie.add('hello')
      expect(trie.startsWith('h')).toBe(true)
    })
  })

  describe('wordsWithPrefix', () => {
    it('should return all words with given prefix', () => {
      const trie = new TrieSet()
      trie.add('car')
      trie.add('cat')
      trie.add('cap')
      trie.add('dog')
      const result = trie.wordsWithPrefix('ca')
      expect(result).toContain('car')
      expect(result).toContain('cat')
      expect(result).toContain('cap')
      expect(result).toHaveLength(3)
    })

    it('should return empty array for non-existing prefix', () => {
      const trie = new TrieSet()
      trie.add('hello')
      expect(trie.wordsWithPrefix('xyz')).toEqual([])
    })

    it('should return all words for empty prefix', () => {
      const trie = new TrieSet()
      trie.add('a')
      trie.add('b')
      trie.add('c')
      expect(trie.wordsWithPrefix('')).toHaveLength(3)
    })

    it('should include the prefix itself if it is a word', () => {
      const trie = new TrieSet()
      trie.add('car')
      trie.add('carpet')
      const result = trie.wordsWithPrefix('car')
      expect(result).toContain('car')
      expect(result).toContain('carpet')
    })

    it('should return empty array for empty trie', () => {
      const trie = new TrieSet()
      expect(trie.wordsWithPrefix('a')).toEqual([])
    })
  })

  describe('size', () => {
    it('should return 0 for empty trie', () => {
      const trie = new TrieSet()
      expect(trie.size).toBe(0)
    })

    it('should return correct size after additions', () => {
      const trie = new TrieSet()
      trie.add('a')
      trie.add('b')
      trie.add('c')
      expect(trie.size).toBe(3)
    })

    it('should update size after deletions', () => {
      const trie = new TrieSet()
      trie.add('a')
      trie.add('b')
      trie.delete('a')
      expect(trie.size).toBe(1)
    })
  })

  describe('isEmpty', () => {
    it('should be true for new trie', () => {
      const trie = new TrieSet()
      expect(trie.isEmpty).toBe(true)
    })

    it('should be false after adding word', () => {
      const trie = new TrieSet()
      trie.add('hello')
      expect(trie.isEmpty).toBe(false)
    })

    it('should be true after deleting all words', () => {
      const trie = new TrieSet()
      trie.add('hello')
      trie.delete('hello')
      expect(trie.isEmpty).toBe(true)
    })

    it('should be true after clear', () => {
      const trie = new TrieSet()
      trie.add('hello')
      trie.clear()
      expect(trie.isEmpty).toBe(true)
    })
  })

  describe('clear', () => {
    it('should remove all words', () => {
      const trie = new TrieSet()
      trie.add('a')
      trie.add('b')
      trie.add('c')
      trie.clear()
      expect(trie.size).toBe(0)
      expect(trie.isEmpty).toBe(true)
    })

    it('should work on empty trie', () => {
      const trie = new TrieSet()
      trie.clear()
      expect(trie.size).toBe(0)
    })

    it('should allow adding after clear', () => {
      const trie = new TrieSet()
      trie.add('hello')
      trie.clear()
      trie.add('world')
      expect(trie.has('world')).toBe(true)
      expect(trie.size).toBe(1)
    })
  })

  describe('toArray', () => {
    it('should return empty array for empty trie', () => {
      const trie = new TrieSet()
      expect(trie.toArray()).toEqual([])
    })

    it('should return all words', () => {
      const trie = new TrieSet()
      trie.add('apple')
      trie.add('banana')
      trie.add('cherry')
      const arr = trie.toArray()
      expect(arr).toHaveLength(3)
      expect(arr).toContain('apple')
      expect(arr).toContain('banana')
      expect(arr).toContain('cherry')
    })

    it('should return new array each time', () => {
      const trie = new TrieSet()
      trie.add('a')
      const arr1 = trie.toArray()
      const arr2 = trie.toArray()
      expect(arr1).not.toBe(arr2)
    })
  })

  describe('forEach', () => {
    it('should iterate over all words', () => {
      const trie = new TrieSet()
      trie.add('a')
      trie.add('b')
      trie.add('c')
      const collected: string[] = []
      trie.forEach((word) => collected.push(word))
      expect(collected).toHaveLength(3)
      expect(collected).toContain('a')
      expect(collected).toContain('b')
      expect(collected).toContain('c')
    })

    it('should not call callback for empty trie', () => {
      const trie = new TrieSet()
      let called = false
      trie.forEach(() => { called = true })
      expect(called).toBe(false)
    })
  })

  describe('Symbol.iterator', () => {
    it('should be iterable', () => {
      const trie = new TrieSet()
      trie.add('a')
      trie.add('b')
      const result = [...trie]
      expect(result).toHaveLength(2)
      expect(result).toContain('a')
      expect(result).toContain('b')
    })

    it('should work with for...of', () => {
      const trie = new TrieSet()
      trie.add('x')
      trie.add('y')
      const collected: string[] = []
      for (const word of trie) {
        collected.push(word)
      }
      expect(collected).toHaveLength(2)
    })

    it('should produce empty iteration for empty trie', () => {
      const trie = new TrieSet()
      const result = [...trie]
      expect(result).toEqual([])
    })
  })

  describe('clone', () => {
    it('should create an independent copy', () => {
      const trie = new TrieSet()
      trie.add('hello')
      trie.add('world')
      const cloned = trie.clone()
      expect(cloned.size).toBe(2)
      expect(cloned.has('hello')).toBe(true)
      expect(cloned.has('world')).toBe(true)
    })

    it('should not affect original when modified', () => {
      const trie = new TrieSet()
      trie.add('hello')
      const cloned = trie.clone()
      cloned.add('world')
      expect(trie.has('world')).toBe(false)
      expect(cloned.has('world')).toBe(true)
      expect(trie.size).toBe(1)
      expect(cloned.size).toBe(2)
    })

    it('should not affect clone when original is modified', () => {
      const trie = new TrieSet()
      trie.add('hello')
      const cloned = trie.clone()
      trie.add('world')
      expect(cloned.has('world')).toBe(false)
    })

    it('should clone empty trie', () => {
      const trie = new TrieSet()
      const cloned = trie.clone()
      expect(cloned.size).toBe(0)
      expect(cloned.isEmpty).toBe(true)
    })
  })

  describe('static fromArray', () => {
    it('should create trie from array of words', () => {
      const trie = TrieSet.fromArray(['apple', 'banana', 'cherry'])
      expect(trie.size).toBe(3)
      expect(trie.has('apple')).toBe(true)
      expect(trie.has('banana')).toBe(true)
      expect(trie.has('cherry')).toBe(true)
    })

    it('should handle empty array', () => {
      const trie = TrieSet.fromArray([])
      expect(trie.size).toBe(0)
    })

    it('should handle array with duplicates', () => {
      const trie = TrieSet.fromArray(['a', 'a', 'b'])
      expect(trie.size).toBe(2)
    })

    it('should handle array with empty string', () => {
      const trie = TrieSet.fromArray(['', 'a'])
      expect(trie.size).toBe(2)
      expect(trie.has('')).toBe(true)
    })
  })

  describe('longestCommonPrefix', () => {
    it('should return longest common prefix', () => {
      const trie = TrieSet.fromArray(['apple', 'app', 'application'])
      expect(trie.longestCommonPrefix()).toBe('app')
    })

    it('should return empty string when no common prefix', () => {
      const trie = TrieSet.fromArray(['cat', 'dog', 'bird'])
      expect(trie.longestCommonPrefix()).toBe('')
    })

    it('should return empty string for empty trie', () => {
      const trie = new TrieSet()
      expect(trie.longestCommonPrefix()).toBe('')
    })

    it('should return the single word when only one word', () => {
      const trie = TrieSet.fromArray(['hello'])
      expect(trie.longestCommonPrefix()).toBe('hello')
    })

    it('should stop at word boundary', () => {
      const trie = TrieSet.fromArray(['a', 'ab', 'abc'])
      expect(trie.longestCommonPrefix()).toBe('a')
    })

    it('should handle two words with same prefix', () => {
      const trie = TrieSet.fromArray(['interspecies', 'interstellar'])
      expect(trie.longestCommonPrefix()).toBe('inters')
    })
  })

  describe('longestPrefixOf', () => {
    it('should return the longest word that is a prefix of the query', () => {
      const trie = TrieSet.fromArray(['app', 'apple'])
      expect(trie.longestPrefixOf('applepie')).toBe('apple')
    })

    it('should return exact match if it is the longest', () => {
      const trie = TrieSet.fromArray(['hello'])
      expect(trie.longestPrefixOf('hello')).toBe('hello')
    })

    it('should return empty string if no prefix matches', () => {
      const trie = TrieSet.fromArray(['cat'])
      expect(trie.longestPrefixOf('dog')).toBe('')
    })

    it('should return empty string for empty query', () => {
      const trie = TrieSet.fromArray(['hello'])
      expect(trie.longestPrefixOf('')).toBe('')
    })

    it('should handle multiple prefix matches', () => {
      const trie = TrieSet.fromArray(['a', 'ab', 'abc'])
      expect(trie.longestPrefixOf('abcdef')).toBe('abc')
    })

    it('should return empty string for empty trie', () => {
      const trie = new TrieSet()
      expect(trie.longestPrefixOf('anything')).toBe('')
    })

    it('should match shorter prefix when longer does not exist', () => {
      const trie = TrieSet.fromArray(['he'])
      expect(trie.longestPrefixOf('hello')).toBe('he')
    })
  })

  describe('autocomplete', () => {
    it('should return all words with prefix', () => {
      const trie = TrieSet.fromArray(['car', 'cat', 'cap', 'dog'])
      const result = trie.autocomplete('ca')
      expect(result).toHaveLength(3)
      expect(result).toContain('car')
      expect(result).toContain('cat')
      expect(result).toContain('cap')
    })

    it('should respect limit parameter', () => {
      const trie = TrieSet.fromArray(['car', 'cat', 'cap', 'cab', 'can'])
      const result = trie.autocomplete('ca', 2)
      expect(result).toHaveLength(2)
    })

    it('should return all matches if limit exceeds count', () => {
      const trie = TrieSet.fromArray(['car', 'cat'])
      const result = trie.autocomplete('ca', 10)
      expect(result).toHaveLength(2)
    })

    it('should return empty array for non-matching prefix', () => {
      const trie = TrieSet.fromArray(['car', 'cat'])
      expect(trie.autocomplete('dog')).toEqual([])
    })

    it('should handle zero limit', () => {
      const trie = TrieSet.fromArray(['car', 'cat'])
      expect(trie.autocomplete('ca', 0)).toEqual([])
    })

    it('should work without limit parameter', () => {
      const trie = TrieSet.fromArray(['a', 'ab', 'abc'])
      expect(trie.autocomplete('a')).toHaveLength(3)
    })
  })

  describe('removePrefix', () => {
    it('should remove all words with given prefix', () => {
      const trie = TrieSet.fromArray(['car', 'cat', 'cap', 'dog'])
      const count = trie.removePrefix('ca')
      expect(count).toBe(3)
      expect(trie.size).toBe(1)
      expect(trie.has('dog')).toBe(true)
    })

    it('should return 0 for non-existing prefix', () => {
      const trie = TrieSet.fromArray(['car', 'cat'])
      const count = trie.removePrefix('xyz')
      expect(count).toBe(0)
      expect(trie.size).toBe(2)
    })

    it('should remove the prefix word itself', () => {
      const trie = TrieSet.fromArray(['car', 'carpet'])
      const count = trie.removePrefix('car')
      expect(count).toBe(2)
      expect(trie.size).toBe(0)
    })

    it('should remove single word', () => {
      const trie = TrieSet.fromArray(['hello', 'world'])
      const count = trie.removePrefix('hello')
      expect(count).toBe(1)
      expect(trie.has('world')).toBe(true)
    })

    it('should remove all words when empty prefix used', () => {
      const trie = TrieSet.fromArray(['a', 'b', 'c'])
      const count = trie.removePrefix('')
      expect(count).toBe(3)
      expect(trie.isEmpty).toBe(true)
    })
  })

  describe('containsPrefix', () => {
    it('should return true for existing prefix', () => {
      const trie = TrieSet.fromArray(['hello', 'help'])
      expect(trie.containsPrefix('hel')).toBe(true)
    })

    it('should return true for exact word', () => {
      const trie = TrieSet.fromArray(['hello'])
      expect(trie.containsPrefix('hello')).toBe(true)
    })

    it('should return false for non-existing prefix', () => {
      const trie = TrieSet.fromArray(['hello'])
      expect(trie.containsPrefix('xyz')).toBe(false)
    })

    it('should return true for empty string when trie has words', () => {
      const trie = TrieSet.fromArray(['hello'])
      expect(trie.containsPrefix('')).toBe(true)
    })

    it('should return false for empty string when trie is empty', () => {
      const trie = new TrieSet()
      expect(trie.containsPrefix('')).toBe(false)
    })

    it('should match single character prefix', () => {
      const trie = TrieSet.fromArray(['hello'])
      expect(trie.containsPrefix('h')).toBe(true)
      expect(trie.containsPrefix('e')).toBe(false)
    })
  })

  describe('countWordsWithPrefix', () => {
    it('should count words with given prefix', () => {
      const trie = TrieSet.fromArray(['car', 'cat', 'cap', 'dog'])
      expect(trie.countWordsWithPrefix('ca')).toBe(3)
    })

    it('should return 0 for non-existing prefix', () => {
      const trie = TrieSet.fromArray(['car', 'cat'])
      expect(trie.countWordsWithPrefix('xyz')).toBe(0)
    })

    it('should count all words for empty prefix', () => {
      const trie = TrieSet.fromArray(['a', 'b', 'c'])
      expect(trie.countWordsWithPrefix('')).toBe(3)
    })

    it('should count single word', () => {
      const trie = TrieSet.fromArray(['hello'])
      expect(trie.countWordsWithPrefix('hello')).toBe(1)
    })

    it('should count prefix word plus extensions', () => {
      const trie = TrieSet.fromArray(['car', 'carpet', 'cars'])
      expect(trie.countWordsWithPrefix('car')).toBe(3)
    })

    it('should return 0 for empty trie', () => {
      const trie = new TrieSet()
      expect(trie.countWordsWithPrefix('a')).toBe(0)
    })
  })

  describe('forEachPrefix', () => {
    it('should iterate over all words with prefix', () => {
      const trie = TrieSet.fromArray(['car', 'cat', 'cap', 'dog'])
      const collected: string[] = []
      trie.forEachPrefix('ca', (word) => collected.push(word))
      expect(collected).toHaveLength(3)
      expect(collected).toContain('car')
      expect(collected).toContain('cat')
      expect(collected).toContain('cap')
    })

    it('should not call callback for non-existing prefix', () => {
      const trie = TrieSet.fromArray(['hello'])
      let called = false
      trie.forEachPrefix('xyz', () => { called = true })
      expect(called).toBe(false)
    })

    it('should iterate over all words for empty prefix', () => {
      const trie = TrieSet.fromArray(['a', 'b'])
      const collected: string[] = []
      trie.forEachPrefix('', (word) => collected.push(word))
      expect(collected).toHaveLength(2)
    })
  })

  describe('words', () => {
    it('should return generator of all words', () => {
      const trie = TrieSet.fromArray(['a', 'b', 'c'])
      const result = [...trie.words()]
      expect(result).toHaveLength(3)
      expect(result).toContain('a')
      expect(result).toContain('b')
      expect(result).toContain('c')
    })

    it('should return empty generator for empty trie', () => {
      const trie = new TrieSet()
      const result = [...trie.words()]
      expect(result).toEqual([])
    })

    it('should support lazy iteration', () => {
      const trie = TrieSet.fromArray(['a', 'b', 'c'])
      const gen = trie.words()
      expect(gen.next().value).toBe('a')
      expect(gen.next().value).toBe('b')
      expect(gen.next().value).toBe('c')
      expect(gen.next().done).toBe(true)
    })
  })

  describe('sizeBytes', () => {
    it('should return positive number for empty trie', () => {
      const trie = new TrieSet()
      expect(trie.sizeBytes).toBeGreaterThan(0)
    })

    it('should increase when words are added', () => {
      const trie = new TrieSet()
      const initial = trie.sizeBytes
      trie.add('hello')
      expect(trie.sizeBytes).toBeGreaterThan(initial)
    })

    it('should be a number', () => {
      const trie = TrieSet.fromArray(['a', 'b'])
      expect(typeof trie.sizeBytes).toBe('number')
    })
  })

  describe('integration tests', () => {
    it('should handle a large set of words', () => {
      const trie = new TrieSet()
      const words = []
      for (let i = 0; i < 100; i++) {
        words.push(`word${i}`)
      }
      for (const w of words) {
        trie.add(w)
      }
      expect(trie.size).toBe(100)
      for (const w of words) {
        expect(trie.has(w)).toBe(true)
      }
    })

    it('should handle add-delete-add cycle', () => {
      const trie = new TrieSet()
      trie.add('hello')
      trie.delete('hello')
      trie.add('hello')
      expect(trie.has('hello')).toBe(true)
      expect(trie.size).toBe(1)
    })

    it('should handle complex prefix operations', () => {
      const trie = TrieSet.fromArray([
        'application', 'apple', 'app', 'apply', 'appetite',
        'banana', 'band', 'bandana',
      ])
      expect(trie.countWordsWithPrefix('app')).toBe(5)
      expect(trie.countWordsWithPrefix('ban')).toBe(3)
      expect(trie.longestPrefixOf('application form')).toBe('application')
      expect(trie.longestPrefixOf('appetizer')).toBe('app')
    })

    it('should handle cloning after modifications', () => {
      const trie = new TrieSet()
      trie.add('a')
      trie.add('b')
      trie.delete('a')
      const cloned = trie.clone()
      expect(cloned.has('a')).toBe(false)
      expect(cloned.has('b')).toBe(true)
    })

    it('should work with fromArray and then modifications', () => {
      const trie = TrieSet.fromArray(['a', 'b', 'c'])
      trie.delete('b')
      trie.add('d')
      expect(trie.toArray()).toHaveLength(3)
      expect(trie.has('a')).toBe(true)
      expect(trie.has('b')).toBe(false)
      expect(trie.has('c')).toBe(true)
      expect(trie.has('d')).toBe(true)
    })

    it('should correctly handle words sharing all but last char', () => {
      const trie = TrieSet.fromArray(['bat', 'bad', 'bag', 'ban'])
      expect(trie.size).toBe(4)
      expect(trie.has('bat')).toBe(true)
      expect(trie.has('bad')).toBe(true)
      expect(trie.has('bag')).toBe(true)
      expect(trie.has('ban')).toBe(true)
      expect(trie.has('bay')).toBe(false)
    })

    it('should handle sequential deletions of all words', () => {
      const trie = TrieSet.fromArray(['abc', 'abd', 'abe'])
      trie.delete('abc')
      trie.delete('abd')
      trie.delete('abe')
      expect(trie.isEmpty).toBe(true)
      expect(trie.startsWith('a')).toBe(false)
    })

    it('should handle deletion that leaves branch nodes', () => {
      const trie = TrieSet.fromArray(['ab', 'ac', 'ad'])
      trie.delete('ac')
      expect(trie.has('ab')).toBe(true)
      expect(trie.has('ac')).toBe(false)
      expect(trie.has('ad')).toBe(true)
      expect(trie.startsWith('a')).toBe(true)
    })

    it('should handle fromArray with single element', () => {
      const trie = TrieSet.fromArray(['hello'])
      expect(trie.size).toBe(1)
      expect(trie.isEmpty).toBe(false)
      expect(trie.has('hello')).toBe(true)
    })

    it('should handle removePrefix on empty trie', () => {
      const trie = new TrieSet()
      expect(trie.removePrefix('a')).toBe(0)
    })

    it('should verify no leftover nodes after full deletion', () => {
      const trie = new TrieSet()
      trie.add('abc')
      trie.delete('abc')
      expect(trie.wordsWithPrefix('')).toEqual([])
      expect(trie.wordsWithPrefix('a')).toEqual([])
    })

    it('should maintain correct size through complex operations', () => {
      const trie = new TrieSet()
      trie.add('x')
      trie.add('xy')
      trie.add('xyz')
      trie.add('a')
      trie.delete('xy')
      trie.add('xz')
      trie.delete('a')
      trie.delete('nonexistent')
      expect(trie.size).toBe(3)
      expect(trie.has('x')).toBe(true)
      expect(trie.has('xyz')).toBe(true)
      expect(trie.has('xz')).toBe(true)
    })

    it('should handle autocomplete after deletions', () => {
      const trie = TrieSet.fromArray(['car', 'cat', 'cap', 'can'])
      trie.delete('cap')
      const result = trie.autocomplete('ca')
      expect(result).toHaveLength(3)
      expect(result).toContain('car')
      expect(result).toContain('cat')
      expect(result).toContain('can')
    })

    it('should handle longestCommonPrefix with shared first char', () => {
      const trie = TrieSet.fromArray(['same', 'sample', 'sand'])
      expect(trie.longestCommonPrefix()).toBe('sa')
    })

    it('should handle clone independence with deletions', () => {
      const trie = TrieSet.fromArray(['a', 'b', 'c'])
      const clone = trie.clone()
      trie.delete('a')
      clone.delete('b')
      expect(trie.has('a')).toBe(false)
      expect(trie.has('b')).toBe(true)
      expect(clone.has('a')).toBe(true)
      expect(clone.has('b')).toBe(false)
    })

    it('should handle forEach with single word', () => {
      const trie = TrieSet.fromArray(['hello'])
      const collected: string[] = []
      trie.forEach((w) => collected.push(w))
      expect(collected).toEqual(['hello'])
    })

    it('should handle toArray after removePrefix', () => {
      const trie = TrieSet.fromArray(['car', 'cat', 'dog'])
      trie.removePrefix('ca')
      expect(trie.toArray()).toEqual(['dog'])
    })

    it('should handle empty string in complex scenarios', () => {
      const trie = TrieSet.fromArray(['', 'a', 'ab'])
      expect(trie.has('')).toBe(true)
      expect(trie.longestPrefixOf('abc')).toBe('ab')
      trie.delete('')
      expect(trie.has('')).toBe(false)
      expect(trie.has('a')).toBe(true)
    })

    it('should handle words iterator lazily', () => {
      const trie = TrieSet.fromArray(['first', 'second'])
      const gen = trie.words()
      const first = gen.next()
      expect(first.done).toBe(false)
      expect(typeof first.value).toBe('string')
    })

    it('should correctly count after removePrefix', () => {
      const trie = TrieSet.fromArray(['aa', 'ab', 'ac', 'ba', 'bb'])
      trie.removePrefix('a')
      expect(trie.size).toBe(2)
      expect(trie.has('ba')).toBe(true)
      expect(trie.has('bb')).toBe(true)
    })
  })
})
