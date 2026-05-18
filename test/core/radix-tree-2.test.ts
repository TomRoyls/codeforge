import { describe, it, expect } from 'vitest'
import { RadixTree2 } from '../../src/core/radix-tree-2/index.js'

describe('RadixTree2', () => {
  describe('constructor', () => {
    it('creates empty tree', () => {
      const rt = new RadixTree2()
      expect(rt.size).toBe(0)
      expect(rt.isEmpty).toBe(true)
    })
  })

  // ─── insert / search / contains ───

  describe('insert / search / contains', () => {
    it('inserts and searches a single word', () => {
      const rt = new RadixTree2()
      rt.insert('hello')
      expect(rt.search('hello')).toBe(true)
      expect(rt.contains('hello')).toBe(true)
    })

    it('does not find uninserted word', () => {
      const rt = new RadixTree2()
      rt.insert('hello')
      expect(rt.search('world')).toBe(false)
    })

    it('handles empty string (no-op)', () => {
      const rt = new RadixTree2()
      rt.insert('')
      expect(rt.size).toBe(0)
      expect(rt.search('')).toBe(false)
    })

    it('inserts words with common prefix', () => {
      const rt = new RadixTree2()
      rt.insert('car')
      rt.insert('card')
      rt.insert('care')
      expect(rt.search('car')).toBe(true)
      expect(rt.search('card')).toBe(true)
      expect(rt.search('care')).toBe(true)
      expect(rt.search('cart')).toBe(false)
    })

    it('does not duplicate insert', () => {
      const rt = new RadixTree2()
      rt.insert('abc')
      rt.insert('abc')
      expect(rt.size).toBe(1)
    })

    it('handles branching words', () => {
      const rt = new RadixTree2()
      rt.insert('abc')
      rt.insert('abd')
      rt.insert('abe')
      expect(rt.search('abc')).toBe(true)
      expect(rt.search('abd')).toBe(true)
      expect(rt.search('abe')).toBe(true)
      expect(rt.search('ab')).toBe(false)
    })

    it('handles words where one is prefix of another', () => {
      const rt = new RadixTree2()
      rt.insert('ab')
      rt.insert('abc')
      rt.insert('abcd')
      expect(rt.search('ab')).toBe(true)
      expect(rt.search('abc')).toBe(true)
      expect(rt.search('abcd')).toBe(true)
    })
  })

  // ─── delete ───

  describe('delete', () => {
    it('deletes existing word', () => {
      const rt = new RadixTree2()
      rt.insert('hello')
      expect(rt.delete('hello')).toBe(true)
      expect(rt.search('hello')).toBe(false)
      expect(rt.size).toBe(0)
    })

    it('returns false for non-existent word', () => {
      const rt = new RadixTree2()
      expect(rt.delete('missing')).toBe(false)
    })

    it('returns false for empty string', () => {
      const rt = new RadixTree2()
      expect(rt.delete('')).toBe(false)
    })

    it('removes prefix word without affecting longer words', () => {
      const rt = new RadixTree2()
      rt.insert('car')
      rt.insert('card')
      rt.delete('car')
      expect(rt.search('car')).toBe(false)
      expect(rt.search('card')).toBe(true)
    })

    it('removes longer word without affecting prefix', () => {
      const rt = new RadixTree2()
      rt.insert('car')
      rt.insert('card')
      rt.delete('card')
      expect(rt.search('car')).toBe(true)
      expect(rt.search('card')).toBe(false)
    })

    it('removes from branch without affecting siblings', () => {
      const rt = new RadixTree2()
      rt.insert('abc')
      rt.insert('abd')
      rt.delete('abc')
      expect(rt.search('abc')).toBe(false)
      expect(rt.search('abd')).toBe(true)
    })

    it('removes all words sequentially', () => {
      const rt = new RadixTree2()
      rt.insert('a')
      rt.insert('ab')
      rt.insert('abc')
      rt.delete('abc')
      rt.delete('ab')
      rt.delete('a')
      expect(rt.size).toBe(0)
      expect(rt.isEmpty).toBe(true)
    })
  })

  // ─── startsWith ───

  describe('startsWith', () => {
    it('returns true for empty prefix', () => {
      const rt = new RadixTree2()
      expect(rt.startsWith('')).toBe(true)
    })

    it('returns true for existing prefix', () => {
      const rt = new RadixTree2()
      rt.insert('hello')
      expect(rt.startsWith('hel')).toBe(true)
      expect(rt.startsWith('he')).toBe(true)
      expect(rt.startsWith('h')).toBe(true)
    })

    it('returns false for non-existing prefix', () => {
      const rt = new RadixTree2()
      rt.insert('hello')
      expect(rt.startsWith('wor')).toBe(false)
    })

    it('returns true for exact word as prefix', () => {
      const rt = new RadixTree2()
      rt.insert('hello')
      expect(rt.startsWith('hello')).toBe(true)
    })

    it('returns false for empty tree with non-empty prefix', () => {
      const rt = new RadixTree2()
      expect(rt.startsWith('a')).toBe(false)
    })
  })

  // ─── toArray ───

  describe('toArray', () => {
    it('returns empty for empty tree', () => {
      const rt = new RadixTree2()
      expect(rt.toArray()).toEqual([])
    })

    it('returns all words', () => {
      const rt = new RadixTree2()
      rt.insert('car')
      rt.insert('card')
      rt.insert('dog')
      const arr = rt.toArray().sort()
      expect(arr).toEqual(['car', 'card', 'dog'])
    })
  })

  // ─── longestCommonPrefix ───

  describe('longestCommonPrefix', () => {
    it('returns empty for empty tree', () => {
      const rt = new RadixTree2()
      expect(rt.longestCommonPrefix()).toBe('')
    })

    it('returns the word itself for single word', () => {
      const rt = new RadixTree2()
      rt.insert('hello')
      expect(rt.longestCommonPrefix()).toBe('hello')
    })

    it('returns common prefix for multiple words', () => {
      const rt = new RadixTree2()
      rt.insert('car')
      rt.insert('card')
      rt.insert('careful')
      expect(rt.longestCommonPrefix()).toBe('car')
    })

    it('returns empty when no common prefix', () => {
      const rt = new RadixTree2()
      rt.insert('abc')
      rt.insert('xyz')
      expect(rt.longestCommonPrefix()).toBe('')
    })
  })

  // ─── fuzzySearch ───

  describe('fuzzySearch', () => {
    it('returns all words for empty pattern', () => {
      const rt = new RadixTree2()
      rt.insert('cat')
      rt.insert('dog')
      const result = rt.fuzzySearch('', 1).sort()
      expect(result).toEqual(['cat', 'dog'])
    })

    it('returns exact match with distance 0', () => {
      const rt = new RadixTree2()
      rt.insert('cat')
      rt.insert('dog')
      const result = rt.fuzzySearch('cat', 0)
      expect(result).toEqual(['cat'])
    })

    it('returns close matches within distance', () => {
      const rt = new RadixTree2()
      rt.insert('cat')
      rt.insert('bat')
      rt.insert('dog')
      const result = rt.fuzzySearch('cat', 1).sort()
      expect(result).toContain('cat')
      expect(result).toContain('bat')
    })

    it('does not return distant matches', () => {
      const rt = new RadixTree2()
      rt.insert('cat')
      rt.insert('dog')
      const result = rt.fuzzySearch('cat', 0)
      expect(result).not.toContain('dog')
    })

    it('handles Infinity maxDistance', () => {
      const rt = new RadixTree2()
      rt.insert('abc')
      const result = rt.fuzzySearch('xyz', Infinity)
      expect(result.length).toBeGreaterThanOrEqual(0)
    })
  })

  // ─── bulkInsert ───

  describe('bulkInsert', () => {
    it('inserts multiple words', () => {
      const rt = new RadixTree2()
      rt.bulkInsert(['car', 'card', 'care', 'dog'])
      expect(rt.size).toBe(4)
      expect(rt.search('car')).toBe(true)
      expect(rt.search('dog')).toBe(true)
    })

    it('handles empty array', () => {
      const rt = new RadixTree2()
      rt.bulkInsert([])
      expect(rt.size).toBe(0)
    })

    it('handles duplicates in bulk', () => {
      const rt = new RadixTree2()
      rt.bulkInsert(['abc', 'abc', 'abc'])
      expect(rt.size).toBe(1)
    })
  })

  // ─── size / isEmpty / clear ───

  describe('size / isEmpty / clear', () => {
    it('tracks size correctly', () => {
      const rt = new RadixTree2()
      rt.insert('a')
      expect(rt.size).toBe(1)
      rt.insert('b')
      expect(rt.size).toBe(2)
      rt.delete('a')
      expect(rt.size).toBe(1)
    })

    it('isEmpty returns correct state', () => {
      const rt = new RadixTree2()
      expect(rt.isEmpty).toBe(true)
      rt.insert('x')
      expect(rt.isEmpty).toBe(false)
    })

    it('clear removes everything', () => {
      const rt = new RadixTree2()
      rt.insert('a')
      rt.insert('b')
      rt.clear()
      expect(rt.size).toBe(0)
      expect(rt.isEmpty).toBe(true)
      expect(rt.search('a')).toBe(false)
    })
  })

  // ─── getTimeComplexity ───

  describe('getTimeComplexity', () => {
    it('returns complexity record', () => {
      const rt = new RadixTree2()
      const c = rt.getTimeComplexity()
      expect(c.insert).toBe('O(m)')
      expect(c.search).toBe('O(m)')
      expect(c.size).toBe('O(1)')
    })
  })
})
