import { CountingTrie } from '../src/core/counting-trie/counting-trie.js'

// ─── Constructor ────────────────────────────────────────────────────────

describe('CountingTrie', () => {
  describe('constructor', () => {
    it('creates an empty trie with default case-sensitive options', () => {
      const trie = new CountingTrie()
      expect(trie.isEmpty).toBe(true)
      expect(trie.size).toBe(0)
    })

    it('creates a trie with case-insensitive option', () => {
      const trie = new CountingTrie({ caseSensitive: false })
      trie.insert('Hello')
      expect(trie.contains('hello')).toBe(true)
      expect(trie.contains('HELLO')).toBe(true)
    })

    it('creates a trie with case-sensitive option explicitly', () => {
      const trie = new CountingTrie({ caseSensitive: true })
      trie.insert('Hello')
      expect(trie.contains('Hello')).toBe(true)
      expect(trie.contains('hello')).toBe(false)
    })

    it('defaults to case-sensitive when no options provided', () => {
      const trie = new CountingTrie()
      trie.insert('Test')
      expect(trie.contains('Test')).toBe(true)
      expect(trie.contains('test')).toBe(false)
    })
  })

  // ─── insert ────────────────────────────────────────────────────────────

  describe('insert', () => {
    it('inserts a single word', () => {
      const trie = new CountingTrie()
      trie.insert('hello')
      expect(trie.contains('hello')).toBe(true)
      expect(trie.size).toBe(1)
    })

    it('inserts multiple different words', () => {
      const trie = new CountingTrie()
      trie.insert('cat')
      trie.insert('car')
      trie.insert('dog')
      expect(trie.contains('cat')).toBe(true)
      expect(trie.contains('car')).toBe(true)
      expect(trie.contains('dog')).toBe(true)
      expect(trie.size).toBe(3)
    })

    it('inserts duplicate words and increments count', () => {
      const trie = new CountingTrie()
      trie.insert('hello')
      trie.insert('hello')
      trie.insert('hello')
      expect(trie.count('hello')).toBe(3)
      expect(trie.size).toBe(3)
    })

    it('inserts a word that is a prefix of another', () => {
      const trie = new CountingTrie()
      trie.insert('car')
      trie.insert('cart')
      expect(trie.contains('car')).toBe(true)
      expect(trie.contains('cart')).toBe(true)
    })

    it('inserts a word that has an existing prefix', () => {
      const trie = new CountingTrie()
      trie.insert('cart')
      trie.insert('car')
      expect(trie.contains('car')).toBe(true)
      expect(trie.contains('cart')).toBe(true)
    })

    it('inserts an empty string', () => {
      const trie = new CountingTrie()
      trie.insert('')
      expect(trie.contains('')).toBe(true)
      expect(trie.size).toBe(1)
    })

    it('inserts duplicate empty strings', () => {
      const trie = new CountingTrie()
      trie.insert('')
      trie.insert('')
      expect(trie.count('')).toBe(2)
    })
  })

  // ─── remove ────────────────────────────────────────────────────────────

  describe('remove', () => {
    it('removes an existing word and returns true', () => {
      const trie = new CountingTrie()
      trie.insert('hello')
      expect(trie.remove('hello')).toBe(true)
      expect(trie.contains('hello')).toBe(false)
    })

    it('returns false for non-existent word', () => {
      const trie = new CountingTrie()
      expect(trie.remove('hello')).toBe(false)
    })

    it('removes one instance of a duplicated word', () => {
      const trie = new CountingTrie()
      trie.insert('hello')
      trie.insert('hello')
      trie.insert('hello')
      expect(trie.remove('hello')).toBe(true)
      expect(trie.count('hello')).toBe(2)
    })

    it('removes all instances of a duplicated word', () => {
      const trie = new CountingTrie()
      trie.insert('hello')
      trie.insert('hello')
      expect(trie.remove('hello')).toBe(true)
      expect(trie.remove('hello')).toBe(true)
      expect(trie.contains('hello')).toBe(false)
      expect(trie.remove('hello')).toBe(false)
    })

    it('returns false when removing a prefix that is not a complete word', () => {
      const trie = new CountingTrie()
      trie.insert('cart')
      expect(trie.remove('car')).toBe(false)
      expect(trie.contains('cart')).toBe(true)
    })

    it('removes a word without affecting its prefix', () => {
      const trie = new CountingTrie()
      trie.insert('car')
      trie.insert('cart')
      expect(trie.remove('cart')).toBe(true)
      expect(trie.contains('car')).toBe(true)
      expect(trie.contains('cart')).toBe(false)
    })

    it('removes a word without affecting words that extend it', () => {
      const trie = new CountingTrie()
      trie.insert('car')
      trie.insert('cart')
      expect(trie.remove('car')).toBe(true)
      expect(trie.contains('car')).toBe(false)
      expect(trie.contains('cart')).toBe(true)
    })

    it('removes the last word leaving the trie empty', () => {
      const trie = new CountingTrie()
      trie.insert('hello')
      trie.remove('hello')
      expect(trie.isEmpty).toBe(true)
    })

    it('returns false for removing empty string when not inserted', () => {
      const trie = new CountingTrie()
      expect(trie.remove('')).toBe(false)
    })

    it('removes an inserted empty string', () => {
      const trie = new CountingTrie()
      trie.insert('')
      expect(trie.remove('')).toBe(true)
      expect(trie.contains('')).toBe(false)
    })

    it('respects case sensitivity when removing', () => {
      const trie = new CountingTrie({ caseSensitive: true })
      trie.insert('Hello')
      expect(trie.remove('hello')).toBe(false)
      expect(trie.remove('Hello')).toBe(true)
    })
  })

  // ─── contains ──────────────────────────────────────────────────────────

  describe('contains', () => {
    it('returns true for an inserted word', () => {
      const trie = new CountingTrie()
      trie.insert('hello')
      expect(trie.contains('hello')).toBe(true)
    })

    it('returns false for a non-existent word', () => {
      const trie = new CountingTrie()
      expect(trie.contains('hello')).toBe(false)
    })

    it('returns false for a prefix that is not a complete word', () => {
      const trie = new CountingTrie()
      trie.insert('hello')
      expect(trie.contains('hel')).toBe(false)
    })

    it('returns true for a prefix that is also a complete word', () => {
      const trie = new CountingTrie()
      trie.insert('he')
      trie.insert('hello')
      expect(trie.contains('he')).toBe(true)
      expect(trie.contains('hello')).toBe(true)
    })

    it('returns false after a word is removed', () => {
      const trie = new CountingTrie()
      trie.insert('hello')
      trie.remove('hello')
      expect(trie.contains('hello')).toBe(false)
    })

    it('is case-sensitive by default', () => {
      const trie = new CountingTrie()
      trie.insert('Hello')
      expect(trie.contains('Hello')).toBe(true)
      expect(trie.contains('hello')).toBe(false)
    })

    it('is case-insensitive when configured', () => {
      const trie = new CountingTrie({ caseSensitive: false })
      trie.insert('Hello')
      expect(trie.contains('hello')).toBe(true)
      expect(trie.contains('HELLO')).toBe(true)
      expect(trie.contains('hElLo')).toBe(true)
    })

    it('returns true for empty string if inserted', () => {
      const trie = new CountingTrie()
      trie.insert('')
      expect(trie.contains('')).toBe(true)
    })
  })

  // ─── count ─────────────────────────────────────────────────────────────

  describe('count', () => {
    it('returns 0 for a non-existent word', () => {
      const trie = new CountingTrie()
      expect(trie.count('hello')).toBe(0)
    })

    it('returns 1 for a single-inserted word', () => {
      const trie = new CountingTrie()
      trie.insert('hello')
      expect(trie.count('hello')).toBe(1)
    })

    it('returns the correct count for duplicated inserts', () => {
      const trie = new CountingTrie()
      trie.insert('hello')
      trie.insert('hello')
      trie.insert('hello')
      expect(trie.count('hello')).toBe(3)
    })

    it('returns 0 for a prefix that is not a complete word', () => {
      const trie = new CountingTrie()
      trie.insert('hello')
      expect(trie.count('hel')).toBe(0)
    })

    it('decrements after a remove', () => {
      const trie = new CountingTrie()
      trie.insert('hello')
      trie.insert('hello')
      trie.remove('hello')
      expect(trie.count('hello')).toBe(1)
    })

    it('returns 0 on empty trie', () => {
      const trie = new CountingTrie()
      expect(trie.count('anything')).toBe(0)
    })
  })

  // ─── prefixCount ───────────────────────────────────────────────────────

  describe('prefixCount', () => {
    it('returns total words for empty prefix', () => {
      const trie = new CountingTrie()
      trie.insert('cat')
      trie.insert('car')
      trie.insert('dog')
      expect(trie.prefixCount('')).toBe(3)
    })

    it('returns count of words sharing a prefix', () => {
      const trie = new CountingTrie()
      trie.insert('cat')
      trie.insert('car')
      trie.insert('dog')
      expect(trie.prefixCount('ca')).toBe(2)
    })

    it('returns 0 for a non-existent prefix', () => {
      const trie = new CountingTrie()
      trie.insert('cat')
      expect(trie.prefixCount('dog')).toBe(0)
    })

    it('counts a single word matching the prefix', () => {
      const trie = new CountingTrie()
      trie.insert('hello')
      expect(trie.prefixCount('he')).toBe(1)
    })

    it('includes duplicate insertions in prefix count', () => {
      const trie = new CountingTrie()
      trie.insert('cat')
      trie.insert('cat')
      trie.insert('car')
      expect(trie.prefixCount('ca')).toBe(3)
    })

    it('returns 0 for empty trie', () => {
      const trie = new CountingTrie()
      expect(trie.prefixCount('a')).toBe(0)
    })

    it('returns 0 for empty trie with empty prefix', () => {
      const trie = new CountingTrie()
      expect(trie.prefixCount('')).toBe(0)
    })
  })

  // ─── charFrequency ─────────────────────────────────────────────────────

  describe('charFrequency', () => {
    it('returns total words when called with no arguments', () => {
      const trie = new CountingTrie()
      trie.insert('cat')
      trie.insert('car')
      expect(trie.charFrequency()).toBe(2)
    })

    it('returns global char frequency when only char is provided', () => {
      const trie = new CountingTrie()
      trie.insert('cat')
      trie.insert('car')
      trie.insert('dog')
      expect(trie.charFrequency(undefined, 'c')).toBe(2)
    })

    it('returns total at a position when only position is provided', () => {
      const trie = new CountingTrie()
      trie.insert('cat')
      trie.insert('car')
      trie.insert('dog')
      expect(trie.charFrequency(0)).toBe(3)
    })

    it('returns frequency of a specific char at a specific position', () => {
      const trie = new CountingTrie()
      trie.insert('cat')
      trie.insert('car')
      trie.insert('dog')
      expect(trie.charFrequency(0, 'c')).toBe(2)
      expect(trie.charFrequency(0, 'd')).toBe(1)
    })

    it('returns 0 for a char not at the given position', () => {
      const trie = new CountingTrie()
      trie.insert('cat')
      expect(trie.charFrequency(0, 'd')).toBe(0)
    })

    it('returns 0 for an out-of-range position', () => {
      const trie = new CountingTrie()
      trie.insert('cat')
      expect(trie.charFrequency(10, 'c')).toBe(0)
    })

    it('respects case sensitivity for char frequency', () => {
      const trie = new CountingTrie({ caseSensitive: false })
      trie.insert('Cat')
      trie.insert('car')
      expect(trie.charFrequency(0, 'c')).toBe(2)
    })

    it('returns 0 for empty trie', () => {
      const trie = new CountingTrie()
      expect(trie.charFrequency(0, 'a')).toBe(0)
    })

    it('counts duplicates in char frequency', () => {
      const trie = new CountingTrie()
      trie.insert('cat')
      trie.insert('cat')
      expect(trie.charFrequency(0, 'c')).toBe(2)
    })
  })

  // ─── charFrequencies ───────────────────────────────────────────────────

  describe('charFrequencies', () => {
    it('returns global frequencies when called with no arguments', () => {
      const trie = new CountingTrie()
      trie.insert('ab')
      trie.insert('ac')
      const freq = trie.charFrequencies()
      expect(freq.get('a')).toBe(2)
      expect(freq.get('b')).toBe(1)
      expect(freq.get('c')).toBe(1)
    })

    it('returns frequencies at a specific position', () => {
      const trie = new CountingTrie()
      trie.insert('cat')
      trie.insert('car')
      trie.insert('dog')
      const freq = trie.charFrequencies(0)
      expect(freq.get('c')).toBe(2)
      expect(freq.get('d')).toBe(1)
      expect(freq.has('a')).toBe(false)
    })

    it('returns empty map for empty trie', () => {
      const trie = new CountingTrie()
      const freq = trie.charFrequencies()
      expect(freq.size).toBe(0)
    })

    it('returns empty map for out-of-range position', () => {
      const trie = new CountingTrie()
      trie.insert('cat')
      const freq = trie.charFrequencies(10)
      expect(freq.size).toBe(0)
    })

    it('returns correct frequencies at position 1', () => {
      const trie = new CountingTrie()
      trie.insert('cat')
      trie.insert('car')
      trie.insert('dog')
      const freq = trie.charFrequencies(1)
      expect(freq.get('a')).toBe(2)
      expect(freq.get('o')).toBe(1)
    })
  })

  // ─── totalWords ────────────────────────────────────────────────────────

  describe('totalWords', () => {
    it('returns 0 for an empty trie', () => {
      const trie = new CountingTrie()
      expect(trie.totalWords).toBe(0)
    })

    it('counts all inserted words including duplicates', () => {
      const trie = new CountingTrie()
      trie.insert('cat')
      trie.insert('cat')
      trie.insert('dog')
      expect(trie.totalWords).toBe(3)
    })

    it('decreases after remove', () => {
      const trie = new CountingTrie()
      trie.insert('cat')
      trie.insert('dog')
      trie.remove('cat')
      expect(trie.totalWords).toBe(1)
    })

    it('counts empty string as a word', () => {
      const trie = new CountingTrie()
      trie.insert('')
      expect(trie.totalWords).toBe(1)
    })
  })

  // ─── totalNodes ────────────────────────────────────────────────────────

  describe('totalNodes', () => {
    it('returns 0 for an empty trie', () => {
      const trie = new CountingTrie()
      expect(trie.totalNodes).toBe(0)
    })

    it('returns correct count for a single word', () => {
      const trie = new CountingTrie()
      trie.insert('cat')
      expect(trie.totalNodes).toBe(3)
    })

    it('shares nodes for common prefixes', () => {
      const trie = new CountingTrie()
      trie.insert('cat')
      trie.insert('car')
      expect(trie.totalNodes).toBe(4)
    })

    it('does not double-count duplicate insertions', () => {
      const trie = new CountingTrie()
      trie.insert('cat')
      trie.insert('cat')
      expect(trie.totalNodes).toBe(3)
    })

    it('decreases after removing last word with unique path', () => {
      const trie = new CountingTrie()
      trie.insert('cat')
      trie.insert('dog')
      trie.remove('dog')
      expect(trie.totalNodes).toBe(3)
    })
  })

  // ─── autocomplete ──────────────────────────────────────────────────────

  describe('autocomplete', () => {
    it('returns all words with a common prefix', () => {
      const trie = new CountingTrie()
      trie.insert('cat')
      trie.insert('car')
      trie.insert('dog')
      const results = trie.autocomplete('ca')
      expect(results).toEqual(expect.arrayContaining(['cat', 'car']))
      expect(results).toHaveLength(2)
    })

    it('returns empty array for non-existent prefix', () => {
      const trie = new CountingTrie()
      trie.insert('cat')
      expect(trie.autocomplete('dog')).toEqual([])
    })

    it('returns all words with empty prefix', () => {
      const trie = new CountingTrie()
      trie.insert('cat')
      trie.insert('dog')
      const results = trie.autocomplete('')
      expect(results).toEqual(expect.arrayContaining(['cat', 'dog']))
      expect(results).toHaveLength(2)
    })

    it('respects the limit parameter', () => {
      const trie = new CountingTrie()
      trie.insert('cat')
      trie.insert('car')
      trie.insert('cart')
      trie.insert('card')
      const results = trie.autocomplete('ca', 2)
      expect(results.length).toBeLessThanOrEqual(2)
    })

    it('returns exact match as one of the results', () => {
      const trie = new CountingTrie()
      trie.insert('cat')
      trie.insert('catnap')
      const results = trie.autocomplete('cat')
      expect(results).toEqual(expect.arrayContaining(['cat', 'catnap']))
    })

    it('returns empty array on empty trie', () => {
      const trie = new CountingTrie()
      expect(trie.autocomplete('')).toEqual([])
    })

    it('returns single word matching prefix exactly', () => {
      const trie = new CountingTrie()
      trie.insert('cat')
      expect(trie.autocomplete('cat')).toEqual(['cat'])
    })

    it('handles limit of 0', () => {
      const trie = new CountingTrie()
      trie.insert('cat')
      trie.insert('car')
      expect(trie.autocomplete('ca', 0)).toEqual([])
    })
  })

  // ─── longestCommonPrefix ───────────────────────────────────────────────

  describe('longestCommonPrefix', () => {
    it('returns empty string for empty trie', () => {
      const trie = new CountingTrie()
      expect(trie.longestCommonPrefix).toBe('')
    })

    it('returns the single word when only one is inserted', () => {
      const trie = new CountingTrie()
      trie.insert('hello')
      expect(trie.longestCommonPrefix).toBe('hello')
    })

    it('returns common prefix of two words', () => {
      const trie = new CountingTrie()
      trie.insert('cat')
      trie.insert('car')
      expect(trie.longestCommonPrefix).toBe('ca')
    })

    it('returns empty string when no common prefix', () => {
      const trie = new CountingTrie()
      trie.insert('cat')
      trie.insert('dog')
      expect(trie.longestCommonPrefix).toBe('')
    })

    it('returns full common prefix even when one word is a prefix of another', () => {
      const trie = new CountingTrie()
      trie.insert('car')
      trie.insert('cart')
      expect(trie.longestCommonPrefix).toBe('car')
    })

    it('handles three words with shared prefix', () => {
      const trie = new CountingTrie()
      trie.insert('catalog')
      trie.insert('catnap')
      trie.insert('category')
      expect(trie.longestCommonPrefix).toBe('cat')
    })
  })

  // ─── clear ─────────────────────────────────────────────────────────────

  describe('clear', () => {
    it('removes all words from the trie', () => {
      const trie = new CountingTrie()
      trie.insert('cat')
      trie.insert('dog')
      trie.clear()
      expect(trie.isEmpty).toBe(true)
      expect(trie.size).toBe(0)
      expect(trie.contains('cat')).toBe(false)
      expect(trie.contains('dog')).toBe(false)
    })

    it('allows inserting after clear', () => {
      const trie = new CountingTrie()
      trie.insert('cat')
      trie.clear()
      trie.insert('dog')
      expect(trie.contains('dog')).toBe(true)
      expect(trie.size).toBe(1)
    })

    it('clear on empty trie is a no-op', () => {
      const trie = new CountingTrie()
      trie.clear()
      expect(trie.isEmpty).toBe(true)
    })
  })

  // ─── isEmpty ───────────────────────────────────────────────────────────

  describe('isEmpty', () => {
    it('returns true for new trie', () => {
      const trie = new CountingTrie()
      expect(trie.isEmpty).toBe(true)
    })

    it('returns false after inserting a word', () => {
      const trie = new CountingTrie()
      trie.insert('hello')
      expect(trie.isEmpty).toBe(false)
    })

    it('returns true after removing all words', () => {
      const trie = new CountingTrie()
      trie.insert('hello')
      trie.remove('hello')
      expect(trie.isEmpty).toBe(true)
    })

    it('returns false when only an empty string is inserted', () => {
      const trie = new CountingTrie()
      trie.insert('')
      expect(trie.isEmpty).toBe(false)
    })

    it('returns true after clear', () => {
      const trie = new CountingTrie()
      trie.insert('hello')
      trie.clear()
      expect(trie.isEmpty).toBe(true)
    })
  })

  // ─── size ──────────────────────────────────────────────────────────────

  describe('size', () => {
    it('returns 0 for empty trie', () => {
      const trie = new CountingTrie()
      expect(trie.size).toBe(0)
    })

    it('returns the number of total insertions', () => {
      const trie = new CountingTrie()
      trie.insert('cat')
      trie.insert('dog')
      trie.insert('cat')
      expect(trie.size).toBe(3)
    })

    it('decreases after remove', () => {
      const trie = new CountingTrie()
      trie.insert('cat')
      trie.insert('dog')
      trie.remove('cat')
      expect(trie.size).toBe(1)
    })

    it('returns 0 after clear', () => {
      const trie = new CountingTrie()
      trie.insert('cat')
      trie.clear()
      expect(trie.size).toBe(0)
    })
  })

  // ─── stats ─────────────────────────────────────────────────────────────

  describe('stats', () => {
    it('returns zeroed stats for empty trie', () => {
      const trie = new CountingTrie()
      const s = trie.stats
      expect(s.totalWords).toBe(0)
      expect(s.totalNodes).toBe(0)
      expect(s.avgDepth).toBe(0)
      expect(s.maxDepth).toBe(0)
    })

    it('returns correct stats for a single word', () => {
      const trie = new CountingTrie()
      trie.insert('cat')
      const s = trie.stats
      expect(s.totalWords).toBe(1)
      expect(s.totalNodes).toBe(3)
      expect(s.avgDepth).toBe(3)
      expect(s.maxDepth).toBe(3)
    })

    it('returns correct stats for multiple words', () => {
      const trie = new CountingTrie()
      trie.insert('cat')
      trie.insert('car')
      const s = trie.stats
      expect(s.totalWords).toBe(2)
      expect(s.totalNodes).toBe(4)
      expect(s.avgDepth).toBe(3)
      expect(s.maxDepth).toBe(3)
    })

    it('returns correct maxDepth for words of different lengths', () => {
      const trie = new CountingTrie()
      trie.insert('a')
      trie.insert('abc')
      const s = trie.stats
      expect(s.maxDepth).toBe(3)
      expect(s.avgDepth).toBe(2)
    })

    it('accounts for duplicate insertions in stats', () => {
      const trie = new CountingTrie()
      trie.insert('cat')
      trie.insert('cat')
      const s = trie.stats
      expect(s.totalWords).toBe(2)
      expect(s.avgDepth).toBe(3)
    })
  })

  // ─── Edge Cases ────────────────────────────────────────────────────────

  describe('edge cases', () => {
    it('handles single character words', () => {
      const trie = new CountingTrie()
      trie.insert('a')
      trie.insert('b')
      trie.insert('c')
      expect(trie.contains('a')).toBe(true)
      expect(trie.contains('b')).toBe(true)
      expect(trie.contains('c')).toBe(true)
      expect(trie.size).toBe(3)
      expect(trie.totalNodes).toBe(3)
    })

    it('handles unicode characters', () => {
      const trie = new CountingTrie()
      trie.insert('café')
      trie.insert('naïve')
      expect(trie.contains('café')).toBe(true)
      expect(trie.contains('naïve')).toBe(true)
    })

    it('handles very long words', () => {
      const trie = new CountingTrie()
      const longWord = 'a'.repeat(1000)
      trie.insert(longWord)
      expect(trie.contains(longWord)).toBe(true)
      expect(trie.size).toBe(1)
      expect(trie.totalNodes).toBe(1000)
    })

    it('handles insert-remove-insert cycle', () => {
      const trie = new CountingTrie()
      trie.insert('hello')
      trie.remove('hello')
      trie.insert('hello')
      expect(trie.contains('hello')).toBe(true)
      expect(trie.count('hello')).toBe(1)
    })

    it('handles numeric strings', () => {
      const trie = new CountingTrie()
      trie.insert('123')
      trie.insert('124')
      trie.insert('125')
      expect(trie.autocomplete('12')).toEqual(expect.arrayContaining(['123', '124', '125']))
      expect(trie.prefixCount('12')).toBe(3)
    })

    it('handles special characters', () => {
      const trie = new CountingTrie()
      trie.insert('hello-world')
      trie.insert('hello_world')
      trie.insert('hello.world')
      expect(trie.contains('hello-world')).toBe(true)
      expect(trie.contains('hello_world')).toBe(true)
      expect(trie.contains('hello.world')).toBe(true)
    })

    it('handles spaces in words', () => {
      const trie = new CountingTrie()
      trie.insert('hello world')
      trie.insert('hello there')
      expect(trie.autocomplete('hello ')).toEqual(
        expect.arrayContaining(['hello world', 'hello there']),
      )
    })

    it('case-insensitive removes correctly', () => {
      const trie = new CountingTrie({ caseSensitive: false })
      trie.insert('Hello')
      expect(trie.remove('HELLO')).toBe(true)
      expect(trie.contains('hello')).toBe(false)
    })

    it('case-insensitive count works correctly', () => {
      const trie = new CountingTrie({ caseSensitive: false })
      trie.insert('Hello')
      trie.insert('HELLO')
      expect(trie.count('hello')).toBe(2)
    })

    it('case-insensitive prefixCount works correctly', () => {
      const trie = new CountingTrie({ caseSensitive: false })
      trie.insert('Hello')
      trie.insert('HELium')
      expect(trie.prefixCount('he')).toBe(2)
    })

    it('case-insensitive autocomplete works correctly', () => {
      const trie = new CountingTrie({ caseSensitive: false })
      trie.insert('Hello')
      trie.insert('HELium')
      const results = trie.autocomplete('he')
      expect(results).toEqual(expect.arrayContaining(['hello', 'helium']))
    })

    it('case-insensitive charFrequency works correctly', () => {
      const trie = new CountingTrie({ caseSensitive: false })
      trie.insert('Hello')
      expect(trie.charFrequency(0, 'h')).toBe(1)
    })

    it('multiple removes on non-existent word return false each time', () => {
      const trie = new CountingTrie()
      expect(trie.remove('foo')).toBe(false)
      expect(trie.remove('foo')).toBe(false)
    })

    it('autocomplete with limit equal to total words', () => {
      const trie = new CountingTrie()
      trie.insert('cat')
      trie.insert('car')
      const results = trie.autocomplete('ca', 2)
      expect(results).toHaveLength(2)
    })

    it('autocomplete with limit greater than total words', () => {
      const trie = new CountingTrie()
      trie.insert('cat')
      trie.insert('car')
      const results = trie.autocomplete('ca', 100)
      expect(results).toHaveLength(2)
    })

    it('insert many words then clear then insert again', () => {
      const trie = new CountingTrie()
      for (let i = 0; i < 50; i++) {
        trie.insert(`word${i}`)
      }
      expect(trie.size).toBe(50)
      trie.clear()
      expect(trie.isEmpty).toBe(true)
      trie.insert('new')
      expect(trie.contains('new')).toBe(true)
      expect(trie.size).toBe(1)
    })

    it('remove from middle of shared prefix chain', () => {
      const trie = new CountingTrie()
      trie.insert('ab')
      trie.insert('abc')
      trie.insert('abcd')
      trie.remove('abc')
      expect(trie.contains('ab')).toBe(true)
      expect(trie.contains('abc')).toBe(false)
      expect(trie.contains('abcd')).toBe(true)
    })

    it('charFrequencies at last position of words', () => {
      const trie = new CountingTrie()
      trie.insert('cat')
      trie.insert('bat')
      trie.insert('rat')
      const freq = trie.charFrequencies(2)
      expect(freq.get('t')).toBe(3)
    })
  })
})
