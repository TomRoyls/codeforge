import { describe, it, expect } from 'vitest'
import { XorTrie } from '../../src/core/xor-trie/index.js'

describe('XorTrie', () => {
  // ─── Constructor ───
  describe('constructor', () => {
    it('creates empty trie with default bitWidth 32', () => {
      const t = new XorTrie()
      expect(t.size).toBe(0)
      expect(t.isEmpty).toBe(true)
    })

    it('accepts custom bitWidth', () => {
      const t = new XorTrie(8)
      t.insert(42)
      expect(t.size).toBe(1)
      expect(t.contains(42)).toBe(true)
    })
  })

  // ─── Insert ───
  describe('insert', () => {
    it('inserts a single value', () => {
      const t = new XorTrie()
      t.insert(5)
      expect(t.size).toBe(1)
      expect(t.isEmpty).toBe(false)
    })

    it('inserts multiple values', () => {
      const t = new XorTrie()
      t.insert(1)
      t.insert(2)
      t.insert(3)
      expect(t.size).toBe(3)
    })

    it('inserts zero', () => {
      const t = new XorTrie()
      t.insert(0)
      expect(t.contains(0)).toBe(true)
      expect(t.size).toBe(1)
    })

    it('inserts max unsigned 32-bit value', () => {
      const t = new XorTrie()
      t.insert(0xFFFFFFFF)
      expect(t.contains(0xFFFFFFFF)).toBe(true)
    })

    it('inserts duplicate values (increases size)', () => {
      const t = new XorTrie()
      t.insert(5)
      t.insert(5)
      expect(t.size).toBe(2)
      expect(t.contains(5)).toBe(true)
    })
  })

  // ─── Contains ───
  describe('contains', () => {
    it('returns true for inserted value', () => {
      const t = new XorTrie()
      t.insert(42)
      expect(t.contains(42)).toBe(true)
    })

    it('returns false for non-inserted value', () => {
      const t = new XorTrie()
      t.insert(42)
      expect(t.contains(43)).toBe(false)
    })

    it('returns false on empty trie', () => {
      const t = new XorTrie()
      expect(t.contains(0)).toBe(false)
    })
  })

  // ─── Remove ───
  describe('remove', () => {
    it('removes an existing value', () => {
      const t = new XorTrie()
      t.insert(10)
      expect(t.remove(10)).toBe(true)
      expect(t.contains(10)).toBe(false)
      expect(t.size).toBe(0)
    })

    it('returns false for non-existent value', () => {
      const t = new XorTrie()
      expect(t.remove(99)).toBe(false)
    })

    it('returns false on empty trie', () => {
      const t = new XorTrie()
      expect(t.remove(0)).toBe(false)
    })

    it('removes one of duplicate values', () => {
      const t = new XorTrie()
      t.insert(5)
      t.insert(5)
      t.remove(5)
      expect(t.size).toBe(1)
      expect(t.contains(5)).toBe(true)
    })

    it('removes all values one by one', () => {
      const t = new XorTrie()
      const values = [5, 10, 15, 20]
      for (const v of values) t.insert(v)
      for (const v of values) expect(t.remove(v)).toBe(true)
      expect(t.isEmpty).toBe(true)
    })
  })

  // ─── Max XOR ───
  describe('maxXor', () => {
    it('throws on empty trie', () => {
      const t = new XorTrie()
      expect(() => t.maxXor(0)).toThrow('Cannot find max xor from empty trie')
    })

    it('returns the value itself when only one element', () => {
      const t = new XorTrie()
      t.insert(5)
      expect(t.maxXor(5)).toBe(0)
    })

    it('finds max xor pair', () => {
      const t = new XorTrie()
      t.insert(3)
      t.insert(10)
      t.insert(5)
      t.insert(25)
      t.insert(2)
      t.insert(8)
      const result = t.maxXor(5)
      expect(result).toBe(28)
    })

    it('returns correct max xor for simple case', () => {
      const t = new XorTrie()
      t.insert(1)
      t.insert(2)
      const result = t.maxXor(1)
      expect(result).toBe(3)
    })
  })

  // ─── Min XOR ───
  describe('minXor', () => {
    it('throws on empty trie', () => {
      const t = new XorTrie()
      expect(() => t.minXor(0)).toThrow('Cannot find min xor from empty trie')
    })

    it('returns 0 when same value exists', () => {
      const t = new XorTrie()
      t.insert(5)
      expect(t.minXor(5)).toBe(0)
    })

    it('finds min xor value', () => {
      const t = new XorTrie()
      t.insert(3)
      t.insert(10)
      t.insert(5)
      const result = t.minXor(4)
      expect(result).toBe(1)
    })
  })

  // ─── Count XOR Pairs ───
  describe('countXorPairs', () => {
    it('returns 0 when no pair matches target', () => {
      const t = new XorTrie()
      t.insert(1)
      t.insert(2)
      expect(t.countXorPairs(1, 99)).toBe(0)
    })

    it('counts pairs with target xor', () => {
      const t = new XorTrie()
      t.insert(1)
      t.insert(2)
      t.insert(3)
      expect(t.countXorPairs(1, 3)).toBe(1)
    })

    it('counts duplicate values as separate pairs', () => {
      const t = new XorTrie()
      t.insert(5)
      t.insert(5)
      expect(t.countXorPairs(5, 0)).toBe(2)
    })

    it('returns 0 on empty trie', () => {
      const t = new XorTrie()
      expect(t.countXorPairs(1, 2)).toBe(0)
    })
  })

  // ─── Size / isEmpty / Clear ───
  describe('size and isEmpty', () => {
    it('tracks size correctly', () => {
      const t = new XorTrie()
      expect(t.size).toBe(0)
      t.insert(1)
      expect(t.size).toBe(1)
      t.insert(2)
      expect(t.size).toBe(2)
    })

    it('isEmpty reflects state', () => {
      const t = new XorTrie()
      expect(t.isEmpty).toBe(true)
      t.insert(1)
      expect(t.isEmpty).toBe(false)
    })
  })

  describe('clear', () => {
    it('clears all values', () => {
      const t = new XorTrie()
      t.insert(1)
      t.insert(2)
      t.insert(3)
      t.clear()
      expect(t.size).toBe(0)
      expect(t.isEmpty).toBe(true)
      expect(t.contains(1)).toBe(false)
    })

    it('clear on empty trie is safe', () => {
      const t = new XorTrie()
      t.clear()
      expect(t.size).toBe(0)
    })
  })

  // ─── ToArray / ForEach ───
  describe('toArray', () => {
    it('returns empty array for empty trie', () => {
      const t = new XorTrie()
      expect(t.toArray()).toEqual([])
    })

    it('returns inserted values', () => {
      const t = new XorTrie(4)
      t.insert(3)
      t.insert(1)
      t.insert(2)
      const arr = t.toArray()
      expect(arr.sort((a, b) => a - b)).toEqual([1, 2, 3])
    })
  })

  describe('forEach', () => {
    it('visits all values', () => {
      const t = new XorTrie(4)
      t.insert(1)
      t.insert(2)
      t.insert(3)
      const collected: number[] = []
      t.forEach(v => collected.push(v))
      expect(collected.sort((a, b) => a - b)).toEqual([1, 2, 3])
    })

    it('does nothing on empty trie', () => {
      const t = new XorTrie()
      const collected: number[] = []
      t.forEach(v => collected.push(v))
      expect(collected).toEqual([])
    })
  })

  // ─── Small BitWidth ───
  describe('small bitWidth (4-bit)', () => {
    it('handles values 0-15', () => {
      const t = new XorTrie(4)
      for (let i = 0; i < 16; i++) t.insert(i)
      expect(t.size).toBe(16)
      for (let i = 0; i < 16; i++) expect(t.contains(i)).toBe(true)
    })

    it('maxXor with limited range', () => {
      const t = new XorTrie(4)
      t.insert(0)
      t.insert(15)
      expect(t.maxXor(0)).toBe(15)
    })

    it('distinguishes values within bit range', () => {
      const t = new XorTrie(4)
      t.insert(3)
      t.insert(7)
      expect(t.contains(3)).toBe(true)
      expect(t.contains(7)).toBe(true)
      expect(t.contains(1)).toBe(false)
      expect(t.contains(5)).toBe(false)
    })
  })
})
