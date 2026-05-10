import { describe, it, expect } from 'vitest'
import { PathCompressedTrie } from '../../src/core/path-compressed-trie/path-compressed-trie.js'
import type { PathCompressedTrieOptions, PathCompressedTrieStatistics, TrieNode } from '../../src/core/path-compressed-trie/types.js'
import { DEFAULT_PATH_COMPRESSED_TRIE_OPTIONS } from '../../src/core/path-compressed-trie/types.js'

describe('PathCompressedTrie', () => {
  describe('construction', () => {
    it('creates empty trie with default options', () => {
      const trie = new PathCompressedTrie()
      expect(trie.isEmpty).toBe(true)
      expect(trie.size).toBe(0)
    })

    it('creates trie with caseSensitive: true by default', () => {
      const trie = new PathCompressedTrie()
      trie.insert('Hello')
      expect(trie.search('Hello')).toBe(true)
      expect(trie.search('hello')).toBe(false)
    })

    it('creates trie with caseSensitive: false', () => {
      const trie = new PathCompressedTrie({ caseSensitive: false })
      trie.insert('Hello')
      expect(trie.search('hello')).toBe(true)
      expect(trie.search('HELLO')).toBe(true)
      expect(trie.search('Hello')).toBe(true)
    })

    it('accepts empty options object', () => {
      const trie = new PathCompressedTrie({})
      expect(trie.isEmpty).toBe(true)
    })

    it('accepts partial options', () => {
      const trie = new PathCompressedTrie({ caseSensitive: false })
      trie.insert('ABC')
      expect(trie.search('abc')).toBe(true)
    })

    it('has correct default options', () => {
      expect(DEFAULT_PATH_COMPRESSED_TRIE_OPTIONS.caseSensitive).toBe(true)
    })
  })

  describe('insert', () => {
    it('inserts a single word', () => {
      const trie = new PathCompressedTrie()
      trie.insert('hello')
      expect(trie.search('hello')).toBe(true)
    })

    it('inserts multiple words', () => {
      const trie = new PathCompressedTrie()
      trie.insert('hello')
      trie.insert('help')
      trie.insert('helium')
      expect(trie.search('hello')).toBe(true)
      expect(trie.search('help')).toBe(true)
      expect(trie.search('helium')).toBe(true)
    })

    it('inserts words with shared prefixes', () => {
      const trie = new PathCompressedTrie()
      trie.insert('car')
      trie.insert('card')
      trie.insert('care')
      trie.insert('careful')
      expect(trie.size).toBe(4)
    })

    it('inserts word that is prefix of another', () => {
      const trie = new PathCompressedTrie()
      trie.insert('a')
      trie.insert('ab')
      trie.insert('abc')
      expect(trie.search('a')).toBe(true)
      expect(trie.search('ab')).toBe(true)
      expect(trie.search('abc')).toBe(true)
    })

    it('inserts word that extends an existing word', () => {
      const trie = new PathCompressedTrie()
      trie.insert('abc')
      trie.insert('abcd')
      expect(trie.search('abc')).toBe(true)
      expect(trie.search('abcd')).toBe(true)
      expect(trie.size).toBe(2)
    })

    it('inserts empty string', () => {
      const trie = new PathCompressedTrie()
      trie.insert('')
      expect(trie.search('')).toBe(true)
      expect(trie.size).toBe(1)
    })

    it('inserts single character words', () => {
      const trie = new PathCompressedTrie()
      trie.insert('a')
      trie.insert('b')
      trie.insert('c')
      expect(trie.size).toBe(3)
    })

    it('inserts duplicate word does not increase size', () => {
      const trie = new PathCompressedTrie()
      trie.insert('hello')
      trie.insert('hello')
      trie.insert('hello')
      expect(trie.size).toBe(1)
      expect(trie.search('hello')).toBe(true)
    })

    it('inserts words with no common prefix', () => {
      const trie = new PathCompressedTrie()
      trie.insert('apple')
      trie.insert('banana')
      trie.insert('cherry')
      expect(trie.size).toBe(3)
      expect(trie.search('apple')).toBe(true)
      expect(trie.search('banana')).toBe(true)
      expect(trie.search('cherry')).toBe(true)
    })

    it('inserts very long word', () => {
      const trie = new PathCompressedTrie()
      const longWord = 'a'.repeat(1000)
      trie.insert(longWord)
      expect(trie.search(longWord)).toBe(true)
    })

    it('inserts words that cause node splitting', () => {
      const trie = new PathCompressedTrie()
      trie.insert('romane')
      trie.insert('romanus')
      trie.insert('romulus')
      expect(trie.search('romane')).toBe(true)
      expect(trie.search('romanus')).toBe(true)
      expect(trie.search('romulus')).toBe(true)
    })

    it('updates size correctly after multiple inserts', () => {
      const trie = new PathCompressedTrie()
      expect(trie.size).toBe(0)
      trie.insert('a')
      expect(trie.size).toBe(1)
      trie.insert('b')
      expect(trie.size).toBe(2)
      trie.insert('c')
      expect(trie.size).toBe(3)
    })
  })

  describe('search', () => {
    it('finds an exact match', () => {
      const trie = new PathCompressedTrie()
      trie.insert('hello')
      expect(trie.search('hello')).toBe(true)
    })

    it('returns false for non-existent word', () => {
      const trie = new PathCompressedTrie()
      trie.insert('hello')
      expect(trie.search('world')).toBe(false)
    })

    it('returns false for partial match', () => {
      const trie = new PathCompressedTrie()
      trie.insert('hello')
      expect(trie.search('hel')).toBe(false)
    })

    it('returns false for prefix that is not a word', () => {
      const trie = new PathCompressedTrie()
      trie.insert('hello')
      trie.insert('help')
      expect(trie.search('hel')).toBe(false)
    })

    it('returns false for word that is longer prefix', () => {
      const trie = new PathCompressedTrie()
      trie.insert('he')
      expect(trie.search('hello')).toBe(false)
    })

    it('returns false in empty trie', () => {
      const trie = new PathCompressedTrie()
      expect(trie.search('anything')).toBe(false)
    })

    it('finds empty string', () => {
      const trie = new PathCompressedTrie()
      trie.insert('')
      expect(trie.search('')).toBe(true)
    })

    it('does not find empty string if not inserted', () => {
      const trie = new PathCompressedTrie()
      trie.insert('hello')
      expect(trie.search('')).toBe(false)
    })

    it('handles case sensitivity', () => {
      const trie = new PathCompressedTrie()
      trie.insert('Hello')
      expect(trie.search('Hello')).toBe(true)
      expect(trie.search('hello')).toBe(false)
    })

    it('handles case insensitive search', () => {
      const trie = new PathCompressedTrie({ caseSensitive: false })
      trie.insert('Hello')
      expect(trie.search('hello')).toBe(true)
      expect(trie.search('HELLO')).toBe(true)
    })
  })

  describe('delete', () => {
    it('deletes a word', () => {
      const trie = new PathCompressedTrie()
      trie.insert('hello')
      expect(trie.delete('hello')).toBe(true)
      expect(trie.search('hello')).toBe(false)
      expect(trie.size).toBe(0)
    })

    it('returns false for non-existent word', () => {
      const trie = new PathCompressedTrie()
      expect(trie.delete('hello')).toBe(false)
    })

    it('returns false for partial match', () => {
      const trie = new PathCompressedTrie()
      trie.insert('hello')
      expect(trie.delete('hel')).toBe(false)
      expect(trie.size).toBe(1)
    })

    it('deletes word but keeps prefix word', () => {
      const trie = new PathCompressedTrie()
      trie.insert('car')
      trie.insert('card')
      expect(trie.delete('card')).toBe(true)
      expect(trie.search('car')).toBe(true)
      expect(trie.search('card')).toBe(false)
    })

    it('deletes prefix word but keeps extension', () => {
      const trie = new PathCompressedTrie()
      trie.insert('car')
      trie.insert('card')
      expect(trie.delete('car')).toBe(true)
      expect(trie.search('car')).toBe(false)
      expect(trie.search('card')).toBe(true)
    })

    it('deletes multiple words', () => {
      const trie = new PathCompressedTrie()
      trie.insert('a')
      trie.insert('b')
      trie.insert('c')
      expect(trie.delete('a')).toBe(true)
      expect(trie.delete('b')).toBe(true)
      expect(trie.size).toBe(1)
      expect(trie.search('c')).toBe(true)
    })

    it('handles deleting same word twice', () => {
      const trie = new PathCompressedTrie()
      trie.insert('hello')
      expect(trie.delete('hello')).toBe(true)
      expect(trie.delete('hello')).toBe(false)
    })

    it('deletes empty string', () => {
      const trie = new PathCompressedTrie()
      trie.insert('')
      expect(trie.delete('')).toBe(true)
      expect(trie.search('')).toBe(false)
    })

    it('deletes from split nodes correctly', () => {
      const trie = new PathCompressedTrie()
      trie.insert('romane')
      trie.insert('romanus')
      expect(trie.delete('romanus')).toBe(true)
      expect(trie.search('romane')).toBe(true)
      expect(trie.search('romanus')).toBe(false)
    })

    it('deletes all words results in empty trie', () => {
      const trie = new PathCompressedTrie()
      trie.insert('hello')
      trie.insert('help')
      trie.delete('hello')
      trie.delete('help')
      expect(trie.isEmpty).toBe(true)
    })
  })

  describe('startsWith', () => {
    it('returns true for existing prefix', () => {
      const trie = new PathCompressedTrie()
      trie.insert('hello')
      expect(trie.startsWith('hel')).toBe(true)
    })

    it('returns true for exact word as prefix', () => {
      const trie = new PathCompressedTrie()
      trie.insert('hello')
      expect(trie.startsWith('hello')).toBe(true)
    })

    it('returns false for non-existent prefix', () => {
      const trie = new PathCompressedTrie()
      trie.insert('hello')
      expect(trie.startsWith('xyz')).toBe(false)
    })

    it('returns true for empty prefix in non-empty trie', () => {
      const trie = new PathCompressedTrie()
      trie.insert('hello')
      expect(trie.startsWith('')).toBe(true)
    })

    it('returns true for empty prefix in empty trie', () => {
      const trie = new PathCompressedTrie()
      expect(trie.startsWith('')).toBe(true)
    })

    it('handles prefix across compressed edges', () => {
      const trie = new PathCompressedTrie()
      trie.insert('abc')
      trie.insert('abcd')
      expect(trie.startsWith('ab')).toBe(true)
      expect(trie.startsWith('abc')).toBe(true)
      expect(trie.startsWith('abcd')).toBe(true)
    })

    it('handles partial edge prefix', () => {
      const trie = new PathCompressedTrie()
      trie.insert('hello')
      expect(trie.startsWith('he')).toBe(true)
      expect(trie.startsWith('hel')).toBe(true)
    })
  })

  describe('wordsWithPrefix', () => {
    it('returns all words with given prefix', () => {
      const trie = new PathCompressedTrie()
      trie.insert('car')
      trie.insert('card')
      trie.insert('care')
      trie.insert('careful')
      const words = trie.wordsWithPrefix('car')
      expect(words).toHaveLength(4)
      expect(words).toContain('car')
      expect(words).toContain('card')
      expect(words).toContain('care')
      expect(words).toContain('careful')
    })

    it('returns empty array for non-existent prefix', () => {
      const trie = new PathCompressedTrie()
      trie.insert('hello')
      expect(trie.wordsWithPrefix('xyz')).toEqual([])
    })

    it('returns all words for empty prefix', () => {
      const trie = new PathCompressedTrie()
      trie.insert('a')
      trie.insert('b')
      trie.insert('c')
      const words = trie.wordsWithPrefix('')
      expect(words).toHaveLength(3)
    })

    it('returns single word matching prefix exactly', () => {
      const trie = new PathCompressedTrie()
      trie.insert('hello')
      trie.insert('world')
      expect(trie.wordsWithPrefix('hello')).toEqual(['hello'])
    })

    it('handles empty trie', () => {
      const trie = new PathCompressedTrie()
      expect(trie.wordsWithPrefix('a')).toEqual([])
    })

    it('handles prefix in compressed path', () => {
      const trie = new PathCompressedTrie()
      trie.insert('ab')
      trie.insert('abc')
      trie.insert('abcd')
      const words = trie.wordsWithPrefix('ab')
      expect(words).toHaveLength(3)
    })
  })

  describe('longestCommonPrefix', () => {
    it('returns LCP of all words', () => {
      const trie = new PathCompressedTrie()
      trie.insert('flower')
      trie.insert('flow')
      trie.insert('flight')
      expect(trie.longestCommonPrefix()).toBe('fl')
    })

    it('returns empty string for empty trie', () => {
      const trie = new PathCompressedTrie()
      expect(trie.longestCommonPrefix()).toBe('')
    })

    it('returns full word when only one word', () => {
      const trie = new PathCompressedTrie()
      trie.insert('hello')
      expect(trie.longestCommonPrefix()).toBe('hello')
    })

    it('returns empty string when words have no common prefix', () => {
      const trie = new PathCompressedTrie()
      trie.insert('apple')
      trie.insert('banana')
      expect(trie.longestCommonPrefix()).toBe('')
    })

    it('handles common prefix that is also a word', () => {
      const trie = new PathCompressedTrie()
      trie.insert('car')
      trie.insert('card')
      trie.insert('care')
      expect(trie.longestCommonPrefix()).toBe('car')
    })

    it('handles single character words', () => {
      const trie = new PathCompressedTrie()
      trie.insert('ab')
      trie.insert('ac')
      expect(trie.longestCommonPrefix()).toBe('a')
    })

    it('returns full common prefix for deeply nested words', () => {
      const trie = new PathCompressedTrie()
      trie.insert('international')
      trie.insert('internet')
      trie.insert('internal')
      expect(trie.longestCommonPrefix()).toBe('intern')
    })
  })

  describe('autocomplete', () => {
    it('returns completions for prefix', () => {
      const trie = new PathCompressedTrie()
      trie.insert('car')
      trie.insert('card')
      trie.insert('care')
      trie.insert('careful')
      const results = trie.autocomplete('car')
      expect(results).toHaveLength(4)
    })

    it('respects max parameter', () => {
      const trie = new PathCompressedTrie()
      trie.insert('car')
      trie.insert('card')
      trie.insert('care')
      trie.insert('careful')
      const results = trie.autocomplete('car', 2)
      expect(results.length).toBeLessThanOrEqual(2)
    })

    it('returns empty for non-existent prefix', () => {
      const trie = new PathCompressedTrie()
      trie.insert('hello')
      expect(trie.autocomplete('xyz')).toEqual([])
    })

    it('returns all words for empty prefix', () => {
      const trie = new PathCompressedTrie()
      trie.insert('a')
      trie.insert('b')
      trie.insert('c')
      expect(trie.autocomplete('')).toHaveLength(3)
    })

    it('returns single result for exact match', () => {
      const trie = new PathCompressedTrie()
      trie.insert('hello')
      trie.insert('world')
      expect(trie.autocomplete('hello')).toEqual(['hello'])
    })

    it('handles max of 0', () => {
      const trie = new PathCompressedTrie()
      trie.insert('car')
      trie.insert('card')
      expect(trie.autocomplete('car', 0)).toEqual([])
    })

    it('handles max greater than results', () => {
      const trie = new PathCompressedTrie()
      trie.insert('car')
      trie.insert('card')
      const results = trie.autocomplete('car', 100)
      expect(results).toHaveLength(2)
    })
  })

  describe('size and isEmpty', () => {
    it('returns correct size', () => {
      const trie = new PathCompressedTrie()
      expect(trie.size).toBe(0)
      trie.insert('a')
      expect(trie.size).toBe(1)
      trie.insert('b')
      expect(trie.size).toBe(2)
    })

    it('isEmpty is true for new trie', () => {
      const trie = new PathCompressedTrie()
      expect(trie.isEmpty).toBe(true)
    })

    it('isEmpty is false after insert', () => {
      const trie = new PathCompressedTrie()
      trie.insert('a')
      expect(trie.isEmpty).toBe(false)
    })

    it('isEmpty is true after deleting all', () => {
      const trie = new PathCompressedTrie()
      trie.insert('a')
      trie.delete('a')
      expect(trie.isEmpty).toBe(true)
    })
  })

  describe('clear', () => {
    it('clears all words', () => {
      const trie = new PathCompressedTrie()
      trie.insert('a')
      trie.insert('b')
      trie.insert('c')
      trie.clear()
      expect(trie.isEmpty).toBe(true)
      expect(trie.size).toBe(0)
    })

    it('clears and allows new inserts', () => {
      const trie = new PathCompressedTrie()
      trie.insert('old')
      trie.clear()
      trie.insert('new')
      expect(trie.search('old')).toBe(false)
      expect(trie.search('new')).toBe(true)
    })
  })

  describe('toArray', () => {
    it('returns empty array for empty trie', () => {
      const trie = new PathCompressedTrie()
      expect(trie.toArray()).toEqual([])
    })

    it('returns all words', () => {
      const trie = new PathCompressedTrie()
      trie.insert('car')
      trie.insert('card')
      trie.insert('care')
      const arr = trie.toArray()
      expect(arr).toHaveLength(3)
      expect(arr).toContain('car')
      expect(arr).toContain('card')
      expect(arr).toContain('care')
    })

    it('returns correct words after delete', () => {
      const trie = new PathCompressedTrie()
      trie.insert('a')
      trie.insert('b')
      trie.delete('a')
      expect(trie.toArray()).toEqual(['b'])
    })
  })

  describe('forEach', () => {
    it('iterates over all words', () => {
      const trie = new PathCompressedTrie()
      trie.insert('a')
      trie.insert('b')
      trie.insert('c')
      const collected: string[] = []
      trie.forEach((word) => collected.push(word))
      expect(collected).toHaveLength(3)
    })

    it('provides correct index', () => {
      const trie = new PathCompressedTrie()
      trie.insert('a')
      trie.insert('b')
      const indices: number[] = []
      trie.forEach((_word, index) => indices.push(index))
      expect(indices).toEqual([0, 1])
    })

    it('does nothing on empty trie', () => {
      const trie = new PathCompressedTrie()
      let count = 0
      trie.forEach(() => count++)
      expect(count).toBe(0)
    })
  })

  describe('Symbol.iterator', () => {
    it('is iterable', () => {
      const trie = new PathCompressedTrie()
      trie.insert('a')
      trie.insert('b')
      const words = [...trie]
      expect(words).toHaveLength(2)
    })

    it('works with for-of', () => {
      const trie = new PathCompressedTrie()
      trie.insert('x')
      trie.insert('y')
      const collected: string[] = []
      for (const word of trie) {
        collected.push(word)
      }
      expect(collected).toHaveLength(2)
    })

    it('works with spread operator', () => {
      const trie = new PathCompressedTrie()
      trie.insert('a')
      trie.insert('b')
      trie.insert('c')
      const arr = [...trie]
      expect(arr).toHaveLength(3)
    })
  })

  describe('getHeight', () => {
    it('returns 0 for empty trie', () => {
      const trie = new PathCompressedTrie()
      expect(trie.getHeight()).toBe(0)
    })

    it('returns 1 for single word', () => {
      const trie = new PathCompressedTrie()
      trie.insert('hello')
      expect(trie.getHeight()).toBe(1)
    })

    it('returns correct height for branching trie', () => {
      const trie = new PathCompressedTrie()
      trie.insert('a')
      trie.insert('ab')
      trie.insert('abc')
      expect(trie.getHeight()).toBeGreaterThanOrEqual(1)
    })

    it('height increases with deeper words', () => {
      const trie = new PathCompressedTrie()
      trie.insert('a')
      const h1 = trie.getHeight()
      trie.insert('ab')
      const h2 = trie.getHeight()
      expect(h2).toBeGreaterThanOrEqual(h1)
    })
  })

  describe('getNodeCount', () => {
    it('returns 1 for empty trie (root only)', () => {
      const trie = new PathCompressedTrie()
      expect(trie.getNodeCount()).toBe(1)
    })

    it('returns correct count after inserts', () => {
      const trie = new PathCompressedTrie()
      trie.insert('a')
      expect(trie.getNodeCount()).toBeGreaterThanOrEqual(2)
    })

    it('path compression reduces node count', () => {
      const trie = new PathCompressedTrie()
      trie.insert('hello')
      const nodes = trie.getNodeCount()
      expect(nodes).toBeLessThanOrEqual(2)
    })

    it('branching increases node count', () => {
      const trie = new PathCompressedTrie()
      trie.insert('ab')
      trie.insert('cd')
      const nodes = trie.getNodeCount()
      expect(nodes).toBeGreaterThanOrEqual(3)
    })
  })

  describe('getStatistics', () => {
    it('returns initial statistics', () => {
      const trie = new PathCompressedTrie()
      const stats = trie.getStatistics()
      expect(stats.inserts).toBe(0)
      expect(stats.deletes).toBe(0)
      expect(stats.searches).toBe(0)
      expect(stats.nodesCreated).toBe(1)
      expect(stats.pathCompressions).toBe(0)
    })

    it('tracks inserts', () => {
      const trie = new PathCompressedTrie()
      trie.insert('a')
      trie.insert('b')
      expect(trie.getStatistics().inserts).toBe(2)
    })

    it('tracks deletes', () => {
      const trie = new PathCompressedTrie()
      trie.insert('a')
      trie.delete('a')
      trie.delete('b')
      expect(trie.getStatistics().deletes).toBe(2)
    })

    it('tracks searches', () => {
      const trie = new PathCompressedTrie()
      trie.search('a')
      trie.search('b')
      trie.search('c')
      expect(trie.getStatistics().searches).toBe(3)
    })

    it('tracks nodes created', () => {
      const trie = new PathCompressedTrie()
      trie.insert('hello')
      expect(trie.getStatistics().nodesCreated).toBeGreaterThan(1)
    })

    it('returns a copy of statistics', () => {
      const trie = new PathCompressedTrie()
      trie.insert('a')
      const stats1 = trie.getStatistics()
      trie.insert('b')
      const stats2 = trie.getStatistics()
      expect(stats2.inserts).not.toBe(stats1.inserts)
    })
  })

  describe('path compression behavior', () => {
    it('compresses single chain into one edge', () => {
      const trie = new PathCompressedTrie()
      trie.insert('hello')
      expect(trie.getNodeCount()).toBe(2)
    })

    it('splits compressed edge when inserting divergent word', () => {
      const trie = new PathCompressedTrie()
      trie.insert('abcd')
      trie.insert('abef')
      expect(trie.search('abcd')).toBe(true)
      expect(trie.search('abef')).toBe(true)
    })

    it('handles multiple splits', () => {
      const trie = new PathCompressedTrie()
      trie.insert('abc')
      trie.insert('abd')
      trie.insert('abx')
      expect(trie.search('abc')).toBe(true)
      expect(trie.search('abd')).toBe(true)
      expect(trie.search('abx')).toBe(true)
    })

    it('compresses after deletion merges', () => {
      const trie = new PathCompressedTrie()
      trie.insert('abcd')
      trie.insert('abef')
      trie.delete('abef')
      expect(trie.search('abcd')).toBe(true)
      expect(trie.search('abef')).toBe(false)
    })
  })

  describe('edge cases', () => {
    it('handles special characters', () => {
      const trie = new PathCompressedTrie()
      trie.insert('hello-world')
      trie.insert('hello_world')
      trie.insert('hello.world')
      expect(trie.search('hello-world')).toBe(true)
      expect(trie.search('hello_world')).toBe(true)
      expect(trie.search('hello.world')).toBe(true)
    })

    it('handles unicode characters', () => {
      const trie = new PathCompressedTrie()
      trie.insert('café')
      trie.insert('naïve')
      expect(trie.search('café')).toBe(true)
      expect(trie.search('naïve')).toBe(true)
    })

    it('handles numeric strings', () => {
      const trie = new PathCompressedTrie()
      trie.insert('123')
      trie.insert('12345')
      trie.insert('124')
      expect(trie.search('123')).toBe(true)
      expect(trie.search('12345')).toBe(true)
      expect(trie.search('124')).toBe(true)
    })

    it('handles very similar words', () => {
      const trie = new PathCompressedTrie()
      trie.insert('abc')
      trie.insert('abd')
      expect(trie.search('abc')).toBe(true)
      expect(trie.search('abd')).toBe(true)
      expect(trie.search('abe')).toBe(false)
    })

    it('handles insert delete insert cycle', () => {
      const trie = new PathCompressedTrie()
      trie.insert('hello')
      trie.delete('hello')
      trie.insert('hello')
      expect(trie.search('hello')).toBe(true)
    })

    it('handles overlapping prefixes deeply', () => {
      const trie = new PathCompressedTrie()
      trie.insert('a')
      trie.insert('ab')
      trie.insert('abc')
      trie.insert('abcd')
      trie.insert('abcde')
      expect(trie.size).toBe(5)
      expect(trie.search('a')).toBe(true)
      expect(trie.search('abcde')).toBe(true)
    })

    it('handles words that are reverse of each other', () => {
      const trie = new PathCompressedTrie()
      trie.insert('abc')
      trie.insert('cba')
      expect(trie.search('abc')).toBe(true)
      expect(trie.search('cba')).toBe(true)
    })

    it('handles single character insert and delete', () => {
      const trie = new PathCompressedTrie()
      trie.insert('x')
      expect(trie.search('x')).toBe(true)
      trie.delete('x')
      expect(trie.search('x')).toBe(false)
      expect(trie.isEmpty).toBe(true)
    })
  })

  describe('integration', () => {
    it('handles large dataset', () => {
      const trie = new PathCompressedTrie()
      const words: string[] = []
      for (let i = 0; i < 100; i++) {
        const word = `word${i.toString().padStart(3, '0')}`
        words.push(word)
        trie.insert(word)
      }
      expect(trie.size).toBe(100)
      for (const word of words) {
        expect(trie.search(word)).toBe(true)
      }
    })

    it('handles large dataset with autocomplete', () => {
      const trie = new PathCompressedTrie()
      for (let i = 0; i < 50; i++) {
        trie.insert(`prefix${i.toString().padStart(3, '0')}`)
      }
      const completions = trie.autocomplete('prefix')
      expect(completions.length).toBe(50)
    })

    it('handles mixed operations', () => {
      const trie = new PathCompressedTrie()
      trie.insert('apple')
      trie.insert('application')
      trie.insert('apply')
      trie.delete('application')
      expect(trie.search('apple')).toBe(true)
      expect(trie.search('application')).toBe(false)
      expect(trie.search('apply')).toBe(true)
      expect(trie.size).toBe(2)
      expect(trie.startsWith('app')).toBe(true)
      expect(trie.startsWith('appl')).toBe(true)
    })

    it('handles dictionary-like usage', () => {
      const trie = new PathCompressedTrie()
      const dictionary = ['the', 'quick', 'brown', 'fox', 'jumps', 'over', 'lazy', 'dog']
      for (const word of dictionary) {
        trie.insert(word)
      }
      expect(trie.size).toBe(dictionary.length)
      for (const word of dictionary) {
        expect(trie.search(word)).toBe(true)
      }
      expect(trie.autocomplete('').length).toBe(dictionary.length)
    })

    it('handles url-like strings', () => {
      const trie = new PathCompressedTrie()
      trie.insert('/api/users')
      trie.insert('/api/users/:id')
      trie.insert('/api/posts')
      trie.insert('/api/posts/:id')
      expect(trie.startsWith('/api')).toBe(true)
      expect(trie.wordsWithPrefix('/api/users')).toHaveLength(2)
    })
  })

  describe('type exports', () => {
    it('PathCompressedTrieOptions type is usable', () => {
      const options: PathCompressedTrieOptions = { caseSensitive: true }
      const trie = new PathCompressedTrie(options)
      expect(trie).toBeDefined()
    })

    it('PathCompressedTrieStatistics type is usable', () => {
      const trie = new PathCompressedTrie()
      const stats: PathCompressedTrieStatistics = trie.getStatistics()
      expect(typeof stats.inserts).toBe('number')
      expect(typeof stats.deletes).toBe('number')
      expect(typeof stats.searches).toBe('number')
      expect(typeof stats.nodesCreated).toBe('number')
      expect(typeof stats.pathCompressions).toBe('number')
    })

    it('TrieNode type is usable', () => {
      const node: TrieNode = {
        key: 'test',
        value: undefined,
        children: new Map<string, TrieNode>(),
        isEnd: false,
      }
      expect(node.key).toBe('test')
      expect(node.isEnd).toBe(false)
    })
  })

  describe('longestCommonPrefix edge cases', () => {
    it('handles words where one is prefix of all', () => {
      const trie = new PathCompressedTrie()
      trie.insert('test')
      trie.insert('testing')
      trie.insert('tested')
      trie.insert('tester')
      expect(trie.longestCommonPrefix()).toBe('test')
    })

    it('handles identical words', () => {
      const trie = new PathCompressedTrie()
      trie.insert('hello')
      trie.insert('hello')
      expect(trie.longestCommonPrefix()).toBe('hello')
    })

    it('handles words differing at first character', () => {
      const trie = new PathCompressedTrie()
      trie.insert('abc')
      trie.insert('xyz')
      expect(trie.longestCommonPrefix()).toBe('')
    })
  })

  describe('wordsWithPrefix advanced', () => {
    it('handles prefix that partially matches edge', () => {
      const trie = new PathCompressedTrie()
      trie.insert('abcde')
      trie.insert('abcdf')
      const words = trie.wordsWithPrefix('abc')
      expect(words).toHaveLength(2)
    })

    it('handles prefix ending at compressed node boundary', () => {
      const trie = new PathCompressedTrie()
      trie.insert('hello')
      trie.insert('help')
      const words = trie.wordsWithPrefix('hel')
      expect(words).toHaveLength(2)
    })
  })

  describe('autocomplete advanced', () => {
    it('autocompletes with max = 1', () => {
      const trie = new PathCompressedTrie()
      trie.insert('car')
      trie.insert('card')
      trie.insert('care')
      const results = trie.autocomplete('car', 1)
      expect(results.length).toBeLessThanOrEqual(1)
    })

    it('autocompletes from compressed edge', () => {
      const trie = new PathCompressedTrie()
      trie.insert('abcdef')
      trie.insert('abcxyz')
      const results = trie.autocomplete('abc')
      expect(results).toHaveLength(2)
    })

    it('autocompletes with partial prefix match', () => {
      const trie = new PathCompressedTrie()
      trie.insert('testing')
      trie.insert('test')
      trie.insert('tested')
      const results = trie.autocomplete('te')
      expect(results).toHaveLength(3)
    })
  })

  describe('getHeight and getNodeCount advanced', () => {
    it('node count reflects path compression', () => {
      const trie = new PathCompressedTrie()
      trie.insert('abcdefghijklmnopqrstuvwxyz')
      expect(trie.getNodeCount()).toBe(2)
    })

    it('height reflects compressed structure', () => {
      const trie = new PathCompressedTrie()
      trie.insert('abcdefghijklmnopqrstuvwxyz')
      expect(trie.getHeight()).toBe(1)
    })

    it('node count increases with branching', () => {
      const trie = new PathCompressedTrie()
      trie.insert('ab')
      trie.insert('cd')
      trie.insert('ef')
      expect(trie.getNodeCount()).toBeGreaterThanOrEqual(4)
    })
  })

  describe('case sensitivity in all operations', () => {
    it('case insensitive delete', () => {
      const trie = new PathCompressedTrie({ caseSensitive: false })
      trie.insert('Hello')
      expect(trie.delete('HELLO')).toBe(true)
      expect(trie.search('hello')).toBe(false)
    })

    it('case insensitive startsWith', () => {
      const trie = new PathCompressedTrie({ caseSensitive: false })
      trie.insert('Hello')
      expect(trie.startsWith('HEL')).toBe(true)
      expect(trie.startsWith('hel')).toBe(true)
    })

    it('case insensitive wordsWithPrefix', () => {
      const trie = new PathCompressedTrie({ caseSensitive: false })
      trie.insert('Hello')
      trie.insert('Help')
      expect(trie.wordsWithPrefix('HEL')).toHaveLength(2)
    })

    it('case insensitive autocomplete', () => {
      const trie = new PathCompressedTrie({ caseSensitive: false })
      trie.insert('Hello')
      trie.insert('Help')
      expect(trie.autocomplete('hel')).toHaveLength(2)
    })

    it('case insensitive longestCommonPrefix', () => {
      const trie = new PathCompressedTrie({ caseSensitive: false })
      trie.insert('Hello')
      trie.insert('Help')
      expect(trie.longestCommonPrefix()).toBe('hel')
    })
  })
})
