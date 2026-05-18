import { describe, it, expect } from 'vitest'
import { RadixTree } from '../../src/core/radix-tree/index.js'

describe('RadixTree', () => {
  describe('constructor', () => {
    it('creates empty tree', () => {
      const rt = new RadixTree()
      expect(rt.size).toBe(0)
      expect(rt.isEmpty()).toBe(true)
    })
  })

  // ─── insert / search / hasWord ───

  describe('insert / search / hasWord', () => {
    it('inserts and searches a single word', () => {
      const rt = new RadixTree()
      rt.insert('hello')
      expect(rt.search('hello')).toBe(true)
      expect(rt.hasWord('hello')).toBe(true)
    })

    it('does not find uninserted word', () => {
      const rt = new RadixTree()
      rt.insert('hello')
      expect(rt.search('world')).toBe(false)
    })

    it('handles empty string (no-op)', () => {
      const rt = new RadixTree()
      rt.insert('')
      expect(rt.size).toBe(0)
      expect(rt.search('')).toBe(false)
    })

    it('inserts words with common prefix', () => {
      const rt = new RadixTree()
      rt.insert('car')
      rt.insert('card')
      rt.insert('care')
      expect(rt.search('car')).toBe(true)
      expect(rt.search('card')).toBe(true)
      expect(rt.search('care')).toBe(true)
      expect(rt.search('cart')).toBe(false)
    })

    it('does not duplicate insert', () => {
      const rt = new RadixTree()
      rt.insert('abc')
      rt.insert('abc')
      expect(rt.size).toBe(1)
    })

    it('handles single character words', () => {
      const rt = new RadixTree()
      rt.insert('a')
      rt.insert('b')
      expect(rt.search('a')).toBe(true)
      expect(rt.search('b')).toBe(true)
      expect(rt.search('c')).toBe(false)
    })

    it('handles words where one is prefix of another', () => {
      const rt = new RadixTree()
      rt.insert('ab')
      rt.insert('abc')
      rt.insert('abcd')
      expect(rt.search('ab')).toBe(true)
      expect(rt.search('abc')).toBe(true)
      expect(rt.search('abcd')).toBe(true)
      expect(rt.search('a')).toBe(false)
    })

    it('handles branching words', () => {
      const rt = new RadixTree()
      rt.insert('abc')
      rt.insert('abd')
      rt.insert('abe')
      expect(rt.search('abc')).toBe(true)
      expect(rt.search('abd')).toBe(true)
      expect(rt.search('abe')).toBe(true)
      expect(rt.search('ab')).toBe(false)
    })
  })

  // ─── remove ───

  describe('remove', () => {
    it('removes existing word', () => {
      const rt = new RadixTree()
      rt.insert('hello')
      expect(rt.remove('hello')).toBe(true)
      expect(rt.search('hello')).toBe(false)
      expect(rt.size).toBe(0)
    })

    it('returns false for non-existent word', () => {
      const rt = new RadixTree()
      expect(rt.remove('missing')).toBe(false)
    })

    it('returns false for empty string', () => {
      const rt = new RadixTree()
      expect(rt.remove('')).toBe(false)
    })

    it('removes prefix word without affecting longer words', () => {
      const rt = new RadixTree()
      rt.insert('car')
      rt.insert('card')
      rt.remove('car')
      expect(rt.search('car')).toBe(false)
      expect(rt.search('card')).toBe(true)
    })

    it('removes longer word without affecting prefix', () => {
      const rt = new RadixTree()
      rt.insert('car')
      rt.insert('card')
      rt.remove('card')
      expect(rt.search('car')).toBe(true)
      expect(rt.search('card')).toBe(false)
    })

    it('removes from branch without affecting siblings', () => {
      const rt = new RadixTree()
      rt.insert('abc')
      rt.insert('abd')
      rt.remove('abc')
      expect(rt.search('abc')).toBe(false)
      expect(rt.search('abd')).toBe(true)
    })

    it('removes multiple words sequentially', () => {
      const rt = new RadixTree()
      rt.insert('a')
      rt.insert('ab')
      rt.insert('abc')
      rt.remove('abc')
      rt.remove('ab')
      rt.remove('a')
      expect(rt.size).toBe(0)
      expect(rt.isEmpty()).toBe(true)
    })
  })

  // ─── startsWith ───

  describe('startsWith', () => {
    it('returns true for empty prefix', () => {
      const rt = new RadixTree()
      expect(rt.startsWith('')).toBe(true)
    })

    it('returns true for existing prefix', () => {
      const rt = new RadixTree()
      rt.insert('hello')
      expect(rt.startsWith('hel')).toBe(true)
      expect(rt.startsWith('he')).toBe(true)
      expect(rt.startsWith('h')).toBe(true)
    })

    it('returns false for non-existing prefix', () => {
      const rt = new RadixTree()
      rt.insert('hello')
      expect(rt.startsWith('wor')).toBe(false)
    })

    it('returns true for exact word as prefix', () => {
      const rt = new RadixTree()
      rt.insert('hello')
      expect(rt.startsWith('hello')).toBe(true)
    })

    it('returns false for empty tree with non-empty prefix', () => {
      const rt = new RadixTree()
      expect(rt.startsWith('a')).toBe(false)
    })
  })

  // ─── getAllWords ───

  describe('getAllWords', () => {
    it('returns empty array for empty tree', () => {
      const rt = new RadixTree()
      expect(rt.getAllWords()).toEqual([])
    })

    it('returns all inserted words', () => {
      const rt = new RadixTree()
      rt.insert('car')
      rt.insert('card')
      rt.insert('care')
      rt.insert('dog')
      const words = rt.getAllWords().sort()
      expect(words).toEqual(['car', 'card', 'care', 'dog'])
    })

    it('returns words with prefix filter', () => {
      const rt = new RadixTree()
      rt.insert('car')
      rt.insert('card')
      rt.insert('care')
      rt.insert('dog')
      const words = rt.getAllWords('car').sort()
      expect(words).toEqual(['car', 'card', 'care'])
    })

    it('returns empty for non-matching prefix', () => {
      const rt = new RadixTree()
      rt.insert('car')
      expect(rt.getAllWords('dog')).toEqual([])
    })
  })

  // ─── longestCommonPrefix ───

  describe('longestCommonPrefix', () => {
    it('returns empty for empty tree', () => {
      const rt = new RadixTree()
      expect(rt.longestCommonPrefix()).toBe('')
    })

    it('returns the word itself for single word', () => {
      const rt = new RadixTree()
      rt.insert('hello')
      expect(rt.longestCommonPrefix()).toBe('hello')
    })

    it('returns common prefix for multiple words', () => {
      const rt = new RadixTree()
      rt.insert('car')
      rt.insert('card')
      rt.insert('careful')
      expect(rt.longestCommonPrefix()).toBe('car')
    })

    it('returns empty when no common prefix', () => {
      const rt = new RadixTree()
      rt.insert('abc')
      rt.insert('xyz')
      expect(rt.longestCommonPrefix()).toBe('')
    })
  })

  // ─── size / isEmpty / clear ───

  describe('size / isEmpty / clear', () => {
    it('tracks size correctly', () => {
      const rt = new RadixTree()
      rt.insert('a')
      expect(rt.size).toBe(1)
      rt.insert('b')
      expect(rt.size).toBe(2)
      rt.remove('a')
      expect(rt.size).toBe(1)
    })

    it('isEmpty returns correct state', () => {
      const rt = new RadixTree()
      expect(rt.isEmpty()).toBe(true)
      rt.insert('x')
      expect(rt.isEmpty()).toBe(false)
    })

    it('clear removes everything', () => {
      const rt = new RadixTree()
      rt.insert('a')
      rt.insert('b')
      rt.clear()
      expect(rt.size).toBe(0)
      expect(rt.isEmpty()).toBe(true)
      expect(rt.search('a')).toBe(false)
    })
  })

  // ─── forEach ───

  describe('forEach', () => {
    it('iterates over all words', () => {
      const rt = new RadixTree()
      rt.insert('car')
      rt.insert('dog')
      const collected: string[] = []
      rt.forEach((w) => collected.push(w))
      expect(collected.sort()).toEqual(['car', 'dog'])
    })

    it('does not call callback for empty tree', () => {
      const rt = new RadixTree()
      const collected: string[] = []
      rt.forEach((w) => collected.push(w))
      expect(collected).toEqual([])
    })
  })
})
