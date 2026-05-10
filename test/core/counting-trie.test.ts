import { describe, it, expect } from 'vitest'
import { CountingTrie } from '../../src/core/counting-trie/counting-trie.js'

describe('CountingTrie', () => {
  describe('construction', () => {
    it('creates empty trie with default options', () => {
      const trie = new CountingTrie()
      expect(trie.isEmpty).toBe(true)
      expect(trie.size).toBe(0)
    })

    it('creates trie with caseSensitive: true by default', () => {
      const trie = new CountingTrie()
      trie.insert('Hello')
      expect(trie.contains('Hello')).toBe(true)
      expect(trie.contains('hello')).toBe(false)
    })

    it('creates trie with caseSensitive: false', () => {
      const trie = new CountingTrie({ caseSensitive: false })
      trie.insert('Hello')
      expect(trie.contains('hello')).toBe(true)
      expect(trie.contains('HELLO')).toBe(true)
      expect(trie.contains('Hello')).toBe(true)
    })

    it('accepts empty options object', () => {
      const trie = new CountingTrie({})
      expect(trie.isEmpty).toBe(true)
    })

    it('accepts partial options', () => {
      const trie = new CountingTrie({ caseSensitive: false })
      trie.insert('ABC')
      expect(trie.contains('abc')).toBe(true)
    })
  })

  describe('insert', () => {
    it('inserts a single word', () => {
      const trie = new CountingTrie()
      trie.insert('hello')
      expect(trie.contains('hello')).toBe(true)
    })

    it('inserts multiple words', () => {
      const trie = new CountingTrie()
      trie.insert('hello')
      trie.insert('help')
      trie.insert('helium')
      expect(trie.contains('hello')).toBe(true)
      expect(trie.contains('help')).toBe(true)
      expect(trie.contains('helium')).toBe(true)
    })

    it('inserts duplicate words incrementing count', () => {
      const trie = new CountingTrie()
      trie.insert('hello')
      trie.insert('hello')
      trie.insert('hello')
      expect(trie.count('hello')).toBe(3)
    })

    it('inserts empty string', () => {
      const trie = new CountingTrie()
      trie.insert('')
      expect(trie.contains('')).toBe(true)
      expect(trie.count('')).toBe(1)
    })

    it('inserts single character words', () => {
      const trie = new CountingTrie()
      trie.insert('a')
      trie.insert('b')
      trie.insert('c')
      expect(trie.size).toBe(3)
    })

    it('inserts words with shared prefixes', () => {
      const trie = new CountingTrie()
      trie.insert('car')
      trie.insert('card')
      trie.insert('care')
      trie.insert('careful')
      expect(trie.size).toBe(4)
      expect(trie.contains('car')).toBe(true)
      expect(trie.contains('card')).toBe(true)
      expect(trie.contains('care')).toBe(true)
      expect(trie.contains('careful')).toBe(true)
    })

    it('inserts word that is prefix of another', () => {
      const trie = new CountingTrie()
      trie.insert('a')
      trie.insert('ab')
      trie.insert('abc')
      expect(trie.contains('a')).toBe(true)
      expect(trie.contains('ab')).toBe(true)
      expect(trie.contains('abc')).toBe(true)
    })

    it('inserts case-sensitive different words', () => {
      const trie = new CountingTrie()
      trie.insert('Hello')
      trie.insert('hello')
      expect(trie.contains('Hello')).toBe(true)
      expect(trie.contains('hello')).toBe(true)
      expect(trie.size).toBe(2)
    })

    it('inserts words with special characters', () => {
      const trie = new CountingTrie()
      trie.insert('hello-world')
      trie.insert('hello_world')
      trie.insert('hello.world')
      expect(trie.size).toBe(3)
    })

    it('inserts unicode words', () => {
      const trie = new CountingTrie()
      trie.insert('café')
      trie.insert('naïve')
      trie.insert('日本語')
      expect(trie.contains('café')).toBe(true)
      expect(trie.contains('日本語')).toBe(true)
    })
  })

  describe('remove', () => {
    it('removes an inserted word', () => {
      const trie = new CountingTrie()
      trie.insert('hello')
      expect(trie.remove('hello')).toBe(true)
      expect(trie.contains('hello')).toBe(false)
    })

    it('returns false for non-existent word', () => {
      const trie = new CountingTrie()
      expect(trie.remove('hello')).toBe(false)
    })

    it('removes duplicate insertion one at a time', () => {
      const trie = new CountingTrie()
      trie.insert('hello')
      trie.insert('hello')
      expect(trie.remove('hello')).toBe(true)
      expect(trie.count('hello')).toBe(1)
      expect(trie.remove('hello')).toBe(true)
      expect(trie.count('hello')).toBe(0)
      expect(trie.contains('hello')).toBe(false)
    })

    it('returns false when removing from empty trie', () => {
      const trie = new CountingTrie()
      expect(trie.remove('')).toBe(false)
      expect(trie.remove('a')).toBe(false)
    })

    it('removes word that is prefix of another without affecting the other', () => {
      const trie = new CountingTrie()
      trie.insert('car')
      trie.insert('card')
      expect(trie.remove('car')).toBe(true)
      expect(trie.contains('car')).toBe(false)
      expect(trie.contains('card')).toBe(true)
    })

    it('removes longer word without affecting shorter prefix', () => {
      const trie = new CountingTrie()
      trie.insert('car')
      trie.insert('card')
      expect(trie.remove('card')).toBe(true)
      expect(trie.contains('car')).toBe(true)
      expect(trie.contains('card')).toBe(false)
    })

    it('removes word and cleans up unused nodes', () => {
      const trie = new CountingTrie()
      trie.insert('xyz')
      expect(trie.remove('xyz')).toBe(true)
      expect(trie.isEmpty).toBe(true)
    })

    it('returns false for word that was never inserted', () => {
      const trie = new CountingTrie()
      trie.insert('hello')
      expect(trie.remove('world')).toBe(false)
    })

    it('removes empty string', () => {
      const trie = new CountingTrie()
      trie.insert('')
      expect(trie.remove('')).toBe(true)
      expect(trie.contains('')).toBe(false)
    })

    it('handles remove with case sensitivity off', () => {
      const trie = new CountingTrie({ caseSensitive: false })
      trie.insert('Hello')
      expect(trie.remove('hello')).toBe(true)
      expect(trie.contains('Hello')).toBe(false)
    })
  })

  describe('contains', () => {
    it('returns true for inserted word', () => {
      const trie = new CountingTrie()
      trie.insert('hello')
      expect(trie.contains('hello')).toBe(true)
    })

    it('returns false for non-inserted word', () => {
      const trie = new CountingTrie()
      expect(trie.contains('hello')).toBe(false)
    })

    it('returns false for prefix that is not a complete word', () => {
      const trie = new CountingTrie()
      trie.insert('hello')
      expect(trie.contains('hel')).toBe(false)
    })

    it('returns false for extension of inserted word', () => {
      const trie = new CountingTrie()
      trie.insert('hello')
      expect(trie.contains('helloworld')).toBe(false)
    })

    it('returns false for empty trie', () => {
      const trie = new CountingTrie()
      expect(trie.contains('')).toBe(false)
      expect(trie.contains('a')).toBe(false)
    })

    it('handles contains after removal', () => {
      const trie = new CountingTrie()
      trie.insert('test')
      trie.remove('test')
      expect(trie.contains('test')).toBe(false)
    })
  })

  describe('count', () => {
    it('returns 0 for non-existent word', () => {
      const trie = new CountingTrie()
      expect(trie.count('hello')).toBe(0)
    })

    it('returns 1 for single insertion', () => {
      const trie = new CountingTrie()
      trie.insert('hello')
      expect(trie.count('hello')).toBe(1)
    })

    it('returns correct count for multiple insertions', () => {
      const trie = new CountingTrie()
      trie.insert('hello')
      trie.insert('hello')
      trie.insert('hello')
      expect(trie.count('hello')).toBe(3)
    })

    it('returns 0 for prefix of inserted word', () => {
      const trie = new CountingTrie()
      trie.insert('hello')
      expect(trie.count('hel')).toBe(0)
    })

    it('returns correct count after partial removal', () => {
      const trie = new CountingTrie()
      trie.insert('hello')
      trie.insert('hello')
      trie.insert('hello')
      trie.remove('hello')
      expect(trie.count('hello')).toBe(2)
    })

    it('returns 0 after complete removal', () => {
      const trie = new CountingTrie()
      trie.insert('hello')
      trie.remove('hello')
      expect(trie.count('hello')).toBe(0)
    })

    it('counts different words independently', () => {
      const trie = new CountingTrie()
      trie.insert('a')
      trie.insert('a')
      trie.insert('b')
      expect(trie.count('a')).toBe(2)
      expect(trie.count('b')).toBe(1)
    })
  })

  describe('prefixCount', () => {
    it('returns total words for empty prefix', () => {
      const trie = new CountingTrie()
      trie.insert('hello')
      trie.insert('help')
      trie.insert('world')
      expect(trie.prefixCount('')).toBe(3)
    })

    it('returns 0 for non-existent prefix', () => {
      const trie = new CountingTrie()
      trie.insert('hello')
      expect(trie.prefixCount('xyz')).toBe(0)
    })

    it('returns count of words sharing prefix', () => {
      const trie = new CountingTrie()
      trie.insert('hello')
      trie.insert('help')
      trie.insert('helium')
      trie.insert('world')
      expect(trie.prefixCount('hel')).toBe(3)
    })

    it('counts duplicate insertions', () => {
      const trie = new CountingTrie()
      trie.insert('hello')
      trie.insert('hello')
      trie.insert('help')
      expect(trie.prefixCount('hel')).toBe(3)
    })

    it('returns 1 for prefix matching single word', () => {
      const trie = new CountingTrie()
      trie.insert('hello')
      expect(trie.prefixCount('hello')).toBe(1)
    })

    it('returns 0 for empty trie', () => {
      const trie = new CountingTrie()
      expect(trie.prefixCount('')).toBe(0)
      expect(trie.prefixCount('a')).toBe(0)
    })

    it('updates after removal', () => {
      const trie = new CountingTrie()
      trie.insert('hello')
      trie.insert('help')
      trie.remove('hello')
      expect(trie.prefixCount('hel')).toBe(1)
    })
  })

  describe('charFrequency', () => {
    it('returns total words when no args', () => {
      const trie = new CountingTrie()
      trie.insert('abc')
      trie.insert('abd')
      expect(trie.charFrequency()).toBe(2)
    })

    it('returns frequency of char at position', () => {
      const trie = new CountingTrie()
      trie.insert('cat')
      trie.insert('car')
      trie.insert('bat')
      expect(trie.charFrequency(0, 'c')).toBe(2)
      expect(trie.charFrequency(0, 'b')).toBe(1)
    })

    it('returns 0 for char not at position', () => {
      const trie = new CountingTrie()
      trie.insert('cat')
      expect(trie.charFrequency(0, 'z')).toBe(0)
    })

    it('returns 0 for out of range position', () => {
      const trie = new CountingTrie()
      trie.insert('cat')
      expect(trie.charFrequency(10, 'a')).toBe(0)
    })

    it('returns global frequency when only char given', () => {
      const trie = new CountingTrie()
      trie.insert('aba')
      trie.insert('aca')
      trie.insert('ada')
      expect(trie.charFrequency(undefined, 'a')).toBe(6)
    })

    it('returns total at position when only position given', () => {
      const trie = new CountingTrie()
      trie.insert('ab')
      trie.insert('ac')
      trie.insert('ad')
      expect(trie.charFrequency(0)).toBe(3)
      expect(trie.charFrequency(1)).toBe(3)
    })

    it('counts duplicates correctly', () => {
      const trie = new CountingTrie()
      trie.insert('aa')
      trie.insert('aa')
      expect(trie.charFrequency(0, 'a')).toBe(2)
      expect(trie.charFrequency(1, 'a')).toBe(2)
    })

    it('returns 0 for empty trie', () => {
      const trie = new CountingTrie()
      expect(trie.charFrequency(0, 'a')).toBe(0)
      expect(trie.charFrequency(0)).toBe(0)
      expect(trie.charFrequency(undefined, 'a')).toBe(0)
    })

    it('handles case insensitive mode', () => {
      const trie = new CountingTrie({ caseSensitive: false })
      trie.insert('ABC')
      trie.insert('abc')
      expect(trie.charFrequency(0, 'a')).toBe(2)
      expect(trie.charFrequency(0, 'A')).toBe(2)
    })
  })

  describe('charFrequencies', () => {
    it('returns global frequencies when no position', () => {
      const trie = new CountingTrie()
      trie.insert('ab')
      trie.insert('ac')
      const freqs = trie.charFrequencies()
      expect(freqs.get('a')).toBe(2)
      expect(freqs.get('b')).toBe(1)
      expect(freqs.get('c')).toBe(1)
    })

    it('returns frequencies at specific position', () => {
      const trie = new CountingTrie()
      trie.insert('cat')
      trie.insert('car')
      trie.insert('bat')
      const freqs = trie.charFrequencies(0)
      expect(freqs.get('c')).toBe(2)
      expect(freqs.get('b')).toBe(1)
    })

    it('returns empty map for empty trie', () => {
      const trie = new CountingTrie()
      expect(trie.charFrequencies().size).toBe(0)
      expect(trie.charFrequencies(0).size).toBe(0)
    })

    it('returns empty map for out of range position', () => {
      const trie = new CountingTrie()
      trie.insert('ab')
      expect(trie.charFrequencies(10).size).toBe(0)
    })

    it('counts character appearances across all positions', () => {
      const trie = new CountingTrie()
      trie.insert('aaa')
      const freqs = trie.charFrequencies()
      expect(freqs.get('a')).toBe(3)
    })

    it('counts multiple words at a position', () => {
      const trie = new CountingTrie()
      trie.insert('abc')
      trie.insert('ade')
      trie.insert('afg')
      const freqs = trie.charFrequencies(0)
      expect(freqs.get('a')).toBe(3)
      expect(freqs.size).toBe(1)
    })

    it('counts position 1 across multiple words', () => {
      const trie = new CountingTrie()
      trie.insert('abc')
      trie.insert('ade')
      const freqs = trie.charFrequencies(1)
      expect(freqs.get('b')).toBe(1)
      expect(freqs.get('d')).toBe(1)
    })
  })

  describe('totalWords', () => {
    it('returns 0 for empty trie', () => {
      const trie = new CountingTrie()
      expect(trie.totalWords).toBe(0)
    })

    it('returns correct count', () => {
      const trie = new CountingTrie()
      trie.insert('a')
      trie.insert('b')
      trie.insert('c')
      expect(trie.totalWords).toBe(3)
    })

    it('counts duplicates', () => {
      const trie = new CountingTrie()
      trie.insert('a')
      trie.insert('a')
      trie.insert('b')
      expect(trie.totalWords).toBe(3)
    })

    it('updates after removal', () => {
      const trie = new CountingTrie()
      trie.insert('a')
      trie.insert('b')
      trie.remove('a')
      expect(trie.totalWords).toBe(1)
    })
  })

  describe('totalNodes', () => {
    it('returns 0 for empty trie', () => {
      const trie = new CountingTrie()
      expect(trie.totalNodes).toBe(0)
    })

    it('returns correct node count', () => {
      const trie = new CountingTrie()
      trie.insert('abc')
      expect(trie.totalNodes).toBe(3)
    })

    it('shares nodes for common prefixes', () => {
      const trie = new CountingTrie()
      trie.insert('ab')
      trie.insert('ac')
      expect(trie.totalNodes).toBe(3)
    })

    it('counts separate branches separately', () => {
      const trie = new CountingTrie()
      trie.insert('abc')
      trie.insert('xyz')
      expect(trie.totalNodes).toBe(6)
    })
  })

  describe('autocomplete', () => {
    it('returns all words for empty prefix', () => {
      const trie = new CountingTrie()
      trie.insert('hello')
      trie.insert('help')
      trie.insert('world')
      const results = trie.autocomplete('')
      expect(results.sort()).toEqual(['hello', 'help', 'world'])
    })

    it('returns words matching prefix', () => {
      const trie = new CountingTrie()
      trie.insert('hello')
      trie.insert('help')
      trie.insert('helium')
      trie.insert('world')
      const results = trie.autocomplete('hel')
      expect(results.sort()).toEqual(['helium', 'hello', 'help'])
    })

    it('respects limit parameter', () => {
      const trie = new CountingTrie()
      trie.insert('hello')
      trie.insert('help')
      trie.insert('helium')
      const results = trie.autocomplete('hel', 2)
      expect(results.length).toBe(2)
    })

    it('returns empty array for non-existent prefix', () => {
      const trie = new CountingTrie()
      trie.insert('hello')
      expect(trie.autocomplete('xyz')).toEqual([])
    })

    it('returns empty array for empty trie', () => {
      const trie = new CountingTrie()
      expect(trie.autocomplete('')).toEqual([])
      expect(trie.autocomplete('a')).toEqual([])
    })

    it('returns exact word match for prefix', () => {
      const trie = new CountingTrie()
      trie.insert('hello')
      expect(trie.autocomplete('hello')).toEqual(['hello'])
    })

    it('does not return duplicates for duplicate insertions', () => {
      const trie = new CountingTrie()
      trie.insert('hello')
      trie.insert('hello')
      expect(trie.autocomplete('')).toEqual(['hello'])
    })

    it('returns all words with empty prefix no limit', () => {
      const trie = new CountingTrie()
      trie.insert('a')
      trie.insert('b')
      trie.insert('c')
      trie.insert('d')
      expect(trie.autocomplete('').length).toBe(4)
    })
  })

  describe('longestCommonPrefix', () => {
    it('returns empty string for empty trie', () => {
      const trie = new CountingTrie()
      expect(trie.longestCommonPrefix).toBe('')
    })

    it('returns the word itself for single word', () => {
      const trie = new CountingTrie()
      trie.insert('hello')
      expect(trie.longestCommonPrefix).toBe('hello')
    })

    it('returns common prefix for multiple words', () => {
      const trie = new CountingTrie()
      trie.insert('hello')
      trie.insert('help')
      expect(trie.longestCommonPrefix).toBe('hel')
    })

    it('returns empty when no common prefix', () => {
      const trie = new CountingTrie()
      trie.insert('abc')
      trie.insert('xyz')
      expect(trie.longestCommonPrefix).toBe('')
    })

    it('returns common prefix with three words', () => {
      const trie = new CountingTrie()
      trie.insert('car')
      trie.insert('card')
      trie.insert('careful')
      expect(trie.longestCommonPrefix).toBe('car')
    })

    it('stops at word boundary', () => {
      const trie = new CountingTrie()
      trie.insert('a')
      trie.insert('ab')
      expect(trie.longestCommonPrefix).toBe('a')
    })
  })

  describe('clear', () => {
    it('clears all words', () => {
      const trie = new CountingTrie()
      trie.insert('hello')
      trie.insert('world')
      trie.clear()
      expect(trie.isEmpty).toBe(true)
      expect(trie.size).toBe(0)
    })

    it('allows insertion after clear', () => {
      const trie = new CountingTrie()
      trie.insert('hello')
      trie.clear()
      trie.insert('world')
      expect(trie.contains('world')).toBe(true)
      expect(trie.contains('hello')).toBe(false)
    })

    it('clears empty trie without error', () => {
      const trie = new CountingTrie()
      trie.clear()
      expect(trie.isEmpty).toBe(true)
    })
  })

  describe('isEmpty', () => {
    it('returns true for new trie', () => {
      const trie = new CountingTrie()
      expect(trie.isEmpty).toBe(true)
    })

    it('returns false after insertion', () => {
      const trie = new CountingTrie()
      trie.insert('a')
      expect(trie.isEmpty).toBe(false)
    })

    it('returns true after removing all', () => {
      const trie = new CountingTrie()
      trie.insert('a')
      trie.remove('a')
      expect(trie.isEmpty).toBe(true)
    })

    it('returns true after clear', () => {
      const trie = new CountingTrie()
      trie.insert('a')
      trie.insert('b')
      trie.clear()
      expect(trie.isEmpty).toBe(true)
    })
  })

  describe('size', () => {
    it('returns 0 for empty trie', () => {
      const trie = new CountingTrie()
      expect(trie.size).toBe(0)
    })

    it('returns total word count including duplicates', () => {
      const trie = new CountingTrie()
      trie.insert('a')
      trie.insert('a')
      trie.insert('b')
      expect(trie.size).toBe(3)
    })

    it('is same as totalWords', () => {
      const trie = new CountingTrie()
      trie.insert('a')
      trie.insert('b')
      expect(trie.size).toBe(trie.totalWords)
    })
  })

  describe('stats', () => {
    it('returns correct stats for empty trie', () => {
      const trie = new CountingTrie()
      const s = trie.stats
      expect(s.totalWords).toBe(0)
      expect(s.totalNodes).toBe(0)
      expect(s.avgDepth).toBe(0)
      expect(s.maxDepth).toBe(0)
    })

    it('returns correct stats for single word', () => {
      const trie = new CountingTrie()
      trie.insert('abc')
      const s = trie.stats
      expect(s.totalWords).toBe(1)
      expect(s.totalNodes).toBe(3)
      expect(s.avgDepth).toBe(3)
      expect(s.maxDepth).toBe(3)
    })

    it('computes maxDepth correctly', () => {
      const trie = new CountingTrie()
      trie.insert('ab')
      trie.insert('abcde')
      const s = trie.stats
      expect(s.maxDepth).toBe(5)
    })

    it('computes avgDepth correctly', () => {
      const trie = new CountingTrie()
      trie.insert('ab')
      trie.insert('abcd')
      const s = trie.stats
      expect(s.avgDepth).toBe(3)
    })

    it('computes avgDepth with duplicates', () => {
      const trie = new CountingTrie()
      trie.insert('ab')
      trie.insert('ab')
      trie.insert('abcd')
      const s = trie.stats
      expect(s.avgDepth).toBeCloseTo(8 / 3)
    })

    it('counts totalNodes for shared prefixes', () => {
      const trie = new CountingTrie()
      trie.insert('ab')
      trie.insert('ac')
      const s = trie.stats
      expect(s.totalNodes).toBe(3)
    })

    it('updates after removal', () => {
      const trie = new CountingTrie()
      trie.insert('abc')
      trie.insert('ab')
      trie.remove('abc')
      const s = trie.stats
      expect(s.totalWords).toBe(1)
      expect(s.totalNodes).toBe(2)
    })
  })

  describe('edge cases', () => {
    it('handles single character words', () => {
      const trie = new CountingTrie()
      trie.insert('a')
      trie.insert('b')
      expect(trie.contains('a')).toBe(true)
      expect(trie.contains('b')).toBe(true)
      expect(trie.size).toBe(2)
    })

    it('handles very long words', () => {
      const trie = new CountingTrie()
      const longWord = 'a'.repeat(1000)
      trie.insert(longWord)
      expect(trie.contains(longWord)).toBe(true)
      expect(trie.count(longWord)).toBe(1)
    })

    it('handles mix of empty and non-empty strings', () => {
      const trie = new CountingTrie()
      trie.insert('')
      trie.insert('a')
      trie.insert('ab')
      expect(trie.contains('')).toBe(true)
      expect(trie.contains('a')).toBe(true)
      expect(trie.contains('ab')).toBe(true)
      expect(trie.size).toBe(3)
    })

    it('handles remove on word inserted many times', () => {
      const trie = new CountingTrie()
      for (let i = 0; i < 100; i++) {
        trie.insert('test')
      }
      expect(trie.count('test')).toBe(100)
      for (let i = 0; i < 99; i++) {
        trie.remove('test')
      }
      expect(trie.count('test')).toBe(1)
      expect(trie.contains('test')).toBe(true)
      trie.remove('test')
      expect(trie.contains('test')).toBe(false)
    })

    it('handles alternating insert and remove', () => {
      const trie = new CountingTrie()
      trie.insert('word')
      trie.remove('word')
      trie.insert('word')
      expect(trie.contains('word')).toBe(true)
      expect(trie.count('word')).toBe(1)
    })

    it('handles prefix operations on empty trie', () => {
      const trie = new CountingTrie()
      expect(trie.prefixCount('')).toBe(0)
      expect(trie.prefixCount('a')).toBe(0)
      expect(trie.autocomplete('')).toEqual([])
      expect(trie.longestCommonPrefix).toBe('')
    })

    it('handles charFrequency on empty trie', () => {
      const trie = new CountingTrie()
      expect(trie.charFrequency()).toBe(0)
      expect(trie.charFrequency(0, 'a')).toBe(0)
      expect(trie.charFrequency(0)).toBe(0)
      expect(trie.charFrequency(undefined, 'a')).toBe(0)
      expect(trie.charFrequencies().size).toBe(0)
      expect(trie.charFrequencies(0).size).toBe(0)
    })
  })

  describe('case insensitive mode', () => {
    it('inserts and finds case insensitively', () => {
      const trie = new CountingTrie({ caseSensitive: false })
      trie.insert('Hello')
      expect(trie.contains('hello')).toBe(true)
      expect(trie.contains('HELLO')).toBe(true)
      expect(trie.contains('HeLLo')).toBe(true)
    })

    it('prefixCount works case insensitively', () => {
      const trie = new CountingTrie({ caseSensitive: false })
      trie.insert('Hello')
      trie.insert('Help')
      expect(trie.prefixCount('HEL')).toBe(2)
    })

    it('autocomplete works case insensitively', () => {
      const trie = new CountingTrie({ caseSensitive: false })
      trie.insert('Hello')
      trie.insert('Help')
      const results = trie.autocomplete('HEL')
      expect(results.sort()).toEqual(['hello', 'help'])
    })

    it('count works case insensitively', () => {
      const trie = new CountingTrie({ caseSensitive: false })
      trie.insert('Hello')
      expect(trie.count('hello')).toBe(1)
      expect(trie.count('HELLO')).toBe(1)
    })

    it('remove works case insensitively', () => {
      const trie = new CountingTrie({ caseSensitive: false })
      trie.insert('Hello')
      expect(trie.remove('hello')).toBe(true)
      expect(trie.contains('Hello')).toBe(false)
    })
  })

  describe('stress', () => {
    it('handles large number of words', () => {
      const trie = new CountingTrie()
      const words: string[] = []
      for (let i = 0; i < 1000; i++) {
        const word = `word${i}`
        words.push(word)
        trie.insert(word)
      }
      expect(trie.size).toBe(1000)
      for (const word of words) {
        expect(trie.contains(word)).toBe(true)
      }
    })

    it('handles large number of insertions of same word', () => {
      const trie = new CountingTrie()
      for (let i = 0; i < 1000; i++) {
        trie.insert('test')
      }
      expect(trie.count('test')).toBe(1000)
      expect(trie.size).toBe(1000)
    })

    it('handles mixed operations', () => {
      const trie = new CountingTrie()
      for (let i = 0; i < 500; i++) {
        trie.insert(`word${i % 50}`)
      }
      expect(trie.size).toBe(500)
      for (let i = 0; i < 50; i++) {
        expect(trie.count(`word${i}`)).toBe(10)
      }
      for (let i = 0; i < 25; i++) {
        for (let j = 0; j < 10; j++) {
          trie.remove(`word${i}`)
        }
      }
      expect(trie.size).toBe(250)
      for (let i = 0; i < 25; i++) {
        expect(trie.contains(`word${i}`)).toBe(false)
      }
      for (let i = 25; i < 50; i++) {
        expect(trie.contains(`word${i}`)).toBe(true)
      }
    })
  })
})
