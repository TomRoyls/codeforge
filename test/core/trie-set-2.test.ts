import { describe, it, expect, beforeEach } from 'vitest'
import { TrieSet2 } from '../../src/core/trie-set-2/index.js'

describe('TrieSet2', () => {
  // ─── Constructor ───
  describe('constructor', () => {
    it('creates empty trie', () => {
      const trie = new TrieSet2()
      expect(trie.size()).toBe(0)
      expect(trie.isEmpty()).toBe(true)
    })
  })

  // ─── add ───
  describe('add', () => {
    it('adds a word', () => {
      const trie = new TrieSet2()
      trie.add('hello')
      expect(trie.has('hello')).toBe(true)
      expect(trie.size()).toBe(1)
    })

    it('does not increase size for duplicate word', () => {
      const trie = new TrieSet2()
      trie.add('hello')
      trie.add('hello')
      expect(trie.size()).toBe(1)
    })

    it('adds multiple words', () => {
      const trie = new TrieSet2()
      trie.add('a')
      trie.add('ab')
      trie.add('abc')
      expect(trie.size()).toBe(3)
    })

    it('adds empty string', () => {
      const trie = new TrieSet2()
      trie.add('')
      expect(trie.has('')).toBe(true)
      expect(trie.size()).toBe(1)
    })
  })

  // ─── has ───
  describe('has', () => {
    it('returns true for existing word', () => {
      const trie = new TrieSet2()
      trie.add('hello')
      expect(trie.has('hello')).toBe(true)
    })

    it('returns false for missing word', () => {
      const trie = new TrieSet2()
      expect(trie.has('hello')).toBe(false)
    })

    it('returns false for prefix that is not a word', () => {
      const trie = new TrieSet2()
      trie.add('hello')
      expect(trie.has('hel')).toBe(false)
    })

    it('returns false for word that extends beyond existing', () => {
      const trie = new TrieSet2()
      trie.add('he')
      expect(trie.has('hello')).toBe(false)
    })

    it('returns false on empty trie', () => {
      const trie = new TrieSet2()
      expect(trie.has('')).toBe(false)
    })
  })

  // ─── delete ───
  describe('delete', () => {
    it('deletes existing word and returns true', () => {
      const trie = new TrieSet2()
      trie.add('hello')
      expect(trie.delete('hello')).toBe(true)
      expect(trie.has('hello')).toBe(false)
      expect(trie.size()).toBe(0)
    })

    it('returns false for missing word', () => {
      const trie = new TrieSet2()
      expect(trie.delete('missing')).toBe(false)
    })

    it('returns false for prefix not stored as word', () => {
      const trie = new TrieSet2()
      trie.add('hello')
      expect(trie.delete('hel')).toBe(false)
      expect(trie.has('hello')).toBe(true)
    })

    it('deleting word preserves other words', () => {
      const trie = new TrieSet2()
      trie.add('a')
      trie.add('ab')
      trie.add('abc')
      trie.delete('ab')
      expect(trie.has('a')).toBe(true)
      expect(trie.has('ab')).toBe(false)
      expect(trie.has('abc')).toBe(true)
      expect(trie.size()).toBe(2)
    })

    it('deleting leaf word cleans up unused nodes', () => {
      const trie = new TrieSet2()
      trie.add('abc')
      trie.delete('abc')
      expect(trie.startsWith('a')).toBe(false)
    })

    it('deleting non-leaf word preserves children', () => {
      const trie = new TrieSet2()
      trie.add('a')
      trie.add('ab')
      trie.delete('a')
      expect(trie.has('a')).toBe(false)
      expect(trie.has('ab')).toBe(true)
      expect(trie.startsWith('a')).toBe(true)
    })
  })

  // ─── startsWith ───
  describe('startsWith', () => {
    it('returns true for existing prefix', () => {
      const trie = new TrieSet2()
      trie.add('hello')
      expect(trie.startsWith('hel')).toBe(true)
    })

    it('returns true for exact word as prefix', () => {
      const trie = new TrieSet2()
      trie.add('hello')
      expect(trie.startsWith('hello')).toBe(true)
    })

    it('returns false for non-existing prefix', () => {
      const trie = new TrieSet2()
      trie.add('hello')
      expect(trie.startsWith('xyz')).toBe(false)
    })

    it('returns true for empty prefix', () => {
      const trie = new TrieSet2()
      trie.add('hello')
      expect(trie.startsWith('')).toBe(true)
    })

    it('returns true for empty prefix on empty trie (root exists)', () => {
      const trie = new TrieSet2()
      expect(trie.startsWith('')).toBe(true)
    })
  })

  // ─── wordsWithPrefix ───
  describe('wordsWithPrefix', () => {
    it('returns words matching prefix', () => {
      const trie = new TrieSet2()
      trie.add('car')
      trie.add('cat')
      trie.add('dog')
      const words = trie.wordsWithPrefix('ca')
      expect(words.sort()).toEqual(['car', 'cat'])
    })

    it('returns empty array for non-existing prefix', () => {
      const trie = new TrieSet2()
      trie.add('hello')
      expect(trie.wordsWithPrefix('xyz')).toEqual([])
    })

    it('includes the prefix itself if it is a word', () => {
      const trie = new TrieSet2()
      trie.add('car')
      trie.add('carbon')
      const words = trie.wordsWithPrefix('car')
      expect(words.sort()).toEqual(['car', 'carbon'])
    })

    it('returns all words for empty prefix', () => {
      const trie = new TrieSet2()
      trie.add('a')
      trie.add('b')
      trie.add('c')
      expect(trie.wordsWithPrefix('').sort()).toEqual(['a', 'b', 'c'])
    })
  })

  // ─── size / isEmpty ───
  describe('size and isEmpty', () => {
    it('size returns correct count', () => {
      const trie = new TrieSet2()
      trie.add('a')
      trie.add('b')
      trie.add('c')
      expect(trie.size()).toBe(3)
    })

    it('isEmpty returns false after adding', () => {
      const trie = new TrieSet2()
      trie.add('a')
      expect(trie.isEmpty()).toBe(false)
    })

    it('isEmpty returns true after removing all', () => {
      const trie = new TrieSet2()
      trie.add('a')
      trie.delete('a')
      expect(trie.isEmpty()).toBe(true)
    })
  })

  // ─── toArray ───
  describe('toArray', () => {
    it('returns sorted array of all words', () => {
      const trie = new TrieSet2()
      trie.add('banana')
      trie.add('apple')
      trie.add('cherry')
      expect(trie.toArray()).toEqual(['apple', 'banana', 'cherry'])
    })

    it('returns empty array for empty trie', () => {
      const trie = new TrieSet2()
      expect(trie.toArray()).toEqual([])
    })
  })

  // ─── clear ───
  describe('clear', () => {
    it('removes all words', () => {
      const trie = new TrieSet2()
      trie.add('a')
      trie.add('b')
      trie.clear()
      expect(trie.size()).toBe(0)
      expect(trie.isEmpty()).toBe(true)
      expect(trie.has('a')).toBe(false)
    })

    it('allows reuse after clear', () => {
      const trie = new TrieSet2()
      trie.add('old')
      trie.clear()
      trie.add('new')
      expect(trie.has('new')).toBe(true)
      expect(trie.has('old')).toBe(false)
    })
  })

  // ─── Edge cases ───
  describe('edge cases', () => {
    it('handles single character words', () => {
      const trie = new TrieSet2()
      trie.add('a')
      trie.add('b')
      expect(trie.has('a')).toBe(true)
      expect(trie.has('c')).toBe(false)
    })

    it('handles unicode strings', () => {
      const trie = new TrieSet2()
      trie.add('café')
      trie.add('日本語')
      expect(trie.has('café')).toBe(true)
      expect(trie.has('日本語')).toBe(true)
      expect(trie.has('caf')).toBe(false)
    })

    it('handles very long word', () => {
      const trie = new TrieSet2()
      const long = 'a'.repeat(1000)
      trie.add(long)
      expect(trie.has(long)).toBe(true)
      expect(trie.size()).toBe(1)
    })
  })
})
