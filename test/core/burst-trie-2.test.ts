import { describe, it, expect } from 'vitest'
import { BurstTrie2 } from '../../src/core/burst-trie-2/index.js'

describe('BurstTrie2', () => {

  // ─── Constructor ───

  describe('constructor', () => {
    it('should create an empty trie with default bucket limit', () => {
      const trie = new BurstTrie2()
      expect(trie.size()).toBe(0)
      expect(trie.isEmpty()).toBe(true)
    })

    it('should accept a custom bucket limit', () => {
      const trie = new BurstTrie2(4)
      expect(trie.size()).toBe(0)
      expect(trie.isEmpty()).toBe(true)
    })
  })

  // ─── Insert & Contains ───

  describe('insert and contains', () => {
    it('should insert a single word and find it', () => {
      const trie = new BurstTrie2()
      trie.insert('hello')
      expect(trie.contains('hello')).toBe(true)
    })

    it('should return false for a word not inserted', () => {
      const trie = new BurstTrie2()
      trie.insert('hello')
      expect(trie.contains('world')).toBe(false)
    })

    it('should handle empty string', () => {
      const trie = new BurstTrie2()
      trie.insert('')
      expect(trie.contains('')).toBe(true)
      expect(trie.size()).toBe(1)
    })

    it('should handle duplicate insertions', () => {
      const trie = new BurstTrie2()
      trie.insert('abc')
      trie.insert('abc')
      expect(trie.contains('abc')).toBe(true)
      expect(trie.size()).toBe(2)
    })

    it('should handle multiple distinct words', () => {
      const trie = new BurstTrie2()
      const words = ['apple', 'banana', 'cherry', 'date', 'elderberry']
      for (const w of words) trie.insert(w)
      expect(trie.size()).toBe(5)
      for (const w of words) {
        expect(trie.contains(w)).toBe(true)
      }
    })

    it('should handle words with common prefixes', () => {
      const trie = new BurstTrie2()
      trie.insert('car')
      trie.insert('cart')
      trie.insert('carton')
      expect(trie.contains('car')).toBe(true)
      expect(trie.contains('cart')).toBe(true)
      expect(trie.contains('carton')).toBe(true)
      expect(trie.contains('cartoo')).toBe(false)
    })
  })

  // ─── Bursting ───

  describe('bursting behavior', () => {
    it('should handle many inserts without crashing', () => {
      const trie = new BurstTrie2(2)
      const words = ['cat', 'car', 'cap', 'can', 'cab']
      for (const w of words) trie.insert(w)
      expect(trie.size()).toBe(words.length)
      for (const w of words) {
        expect(trie.contains(w)).toBe(true)
      }
    })

    it('should return all words sorted via getAll', () => {
      const trie = new BurstTrie2(2)
      const words = ['cat', 'car', 'cap', 'can', 'cab']
      for (const w of words) trie.insert(w)
      expect(trie.getAll()).toEqual([...words].sort())
    })
  })

  // ─── Remove ───

  describe('remove', () => {
    it('should remove an existing word', () => {
      const trie = new BurstTrie2()
      trie.insert('hello')
      expect(trie.remove('hello')).toBe(true)
      expect(trie.contains('hello')).toBe(false)
      expect(trie.size()).toBe(0)
    })

    it('should return false for non-existent word', () => {
      const trie = new BurstTrie2()
      expect(trie.remove('missing')).toBe(false)
    })

    it('should handle removing one of duplicates', () => {
      const trie = new BurstTrie2()
      trie.insert('abc')
      trie.insert('abc')
      expect(trie.remove('abc')).toBe(true)
      expect(trie.contains('abc')).toBe(true)
      expect(trie.size()).toBe(1)
    })

    it('should handle removing from empty trie', () => {
      const trie = new BurstTrie2()
      expect(trie.remove('anything')).toBe(false)
    })

    it('should remove and leave other words intact', () => {
      const trie = new BurstTrie2()
      trie.insert('apple')
      trie.insert('apply')
      trie.insert('apt')
      expect(trie.remove('apply')).toBe(true)
      expect(trie.contains('apple')).toBe(true)
      expect(trie.contains('apt')).toBe(true)
      expect(trie.contains('apply')).toBe(false)
    })
  })

  // ─── GetAll ───

  describe('getAll', () => {
    it('should return empty array for empty trie', () => {
      const trie = new BurstTrie2()
      expect(trie.getAll()).toEqual([])
    })

    it('should return all inserted words sorted', () => {
      const trie = new BurstTrie2()
      trie.insert('cherry')
      trie.insert('apple')
      trie.insert('banana')
      expect(trie.getAll()).toEqual(['apple', 'banana', 'cherry'])
    })

    it('should include duplicates', () => {
      const trie = new BurstTrie2()
      trie.insert('x')
      trie.insert('x')
      trie.insert('y')
      expect(trie.getAll()).toEqual(['x', 'x', 'y'])
    })
  })

  // ─── StartsWith ───

  describe('startsWith', () => {
    it('should return words with given prefix', () => {
      const trie = new BurstTrie2()
      trie.insert('apple')
      trie.insert('application')
      trie.insert('apply')
      trie.insert('banana')
      const result = trie.startsWith('app')
      expect(result).toEqual(['apple', 'application', 'apply'])
    })

    it('should return empty array for non-matching prefix', () => {
      const trie = new BurstTrie2()
      trie.insert('hello')
      expect(trie.startsWith('xyz')).toEqual([])
    })

    it('should return empty array for empty trie', () => {
      const trie = new BurstTrie2()
      expect(trie.startsWith('a')).toEqual([])
    })

    it('should handle empty prefix returning all words', () => {
      const trie = new BurstTrie2()
      trie.insert('cat')
      trie.insert('dog')
      const result = trie.startsWith('')
      expect(result).toEqual(['cat', 'dog'])
    })

    it('should match exact word as prefix of itself', () => {
      const trie = new BurstTrie2()
      trie.insert('car')
      trie.insert('cart')
      const result = trie.startsWith('car')
      expect(result).toEqual(['car', 'cart'])
    })
  })

  // ─── Clear ───

  describe('clear', () => {
    it('should clear all entries', () => {
      const trie = new BurstTrie2()
      trie.insert('a')
      trie.insert('b')
      trie.clear()
      expect(trie.size()).toBe(0)
      expect(trie.isEmpty()).toBe(true)
      expect(trie.getAll()).toEqual([])
    })

    it('should allow inserts after clearing', () => {
      const trie = new BurstTrie2()
      trie.insert('old')
      trie.clear()
      trie.insert('new')
      expect(trie.contains('new')).toBe(true)
      expect(trie.contains('old')).toBe(false)
      expect(trie.size()).toBe(1)
    })
  })

  // ─── GetNodeCount ───

  describe('getNodeCount', () => {
    it('should return 1 for empty trie (root only)', () => {
      const trie = new BurstTrie2()
      expect(trie.getNodeCount()).toBe(1)
    })

    it('should increase as words are inserted', () => {
      const trie = new BurstTrie2()
      trie.insert('ab')
      const countAfterOne = trie.getNodeCount()
      trie.insert('ac')
      const countAfterTwo = trie.getNodeCount()
      expect(countAfterTwo).toBeGreaterThanOrEqual(countAfterOne)
    })
  })

  // ─── Size & IsEmpty ───

  describe('size and isEmpty', () => {
    it('should track size correctly', () => {
      const trie = new BurstTrie2()
      expect(trie.size()).toBe(0)
      trie.insert('a')
      expect(trie.size()).toBe(1)
      trie.insert('b')
      expect(trie.size()).toBe(2)
      trie.remove('a')
      expect(trie.size()).toBe(1)
    })

    it('should track empty state correctly', () => {
      const trie = new BurstTrie2()
      expect(trie.isEmpty()).toBe(true)
      trie.insert('x')
      expect(trie.isEmpty()).toBe(false)
      trie.remove('x')
      expect(trie.isEmpty()).toBe(true)
    })
  })
})
