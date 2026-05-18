import { describe, it, expect } from 'vitest'
import { YFastTrie } from '../src/core/y-fast-trie/index.js'

// ─── Constructor ────────────────────────────────────────────────────────

describe('YFastTrie', () => {
  describe('constructor', () => {
    it('creates with default universeSize', () => {
      const t = new YFastTrie()
      expect(t.size()).toBe(0)
      expect(t.isEmpty()).toBe(true)
    })

    it('creates with custom universeSize', () => {
      const t = new YFastTrie({ universeSize: 1024 })
      expect(t.size()).toBe(0)
    })

    it('throws for universeSize < 2', () => {
      expect(() => new YFastTrie({ universeSize: 1 })).toThrow(RangeError)
    })
  })

  // ─── insert / has / contains ──────────────────────────────────────────

  describe('insert and has', () => {
    it('inserts values and reports membership', () => {
      const t = new YFastTrie({ universeSize: 256 })
      t.insert(10)
      t.insert(50)
      t.insert(100)
      expect(t.has(10)).toBe(true)
      expect(t.has(50)).toBe(true)
      expect(t.has(100)).toBe(true)
      expect(t.has(99)).toBe(false)
    })

    it('ignores duplicate inserts', () => {
      const t = new YFastTrie({ universeSize: 256 })
      t.insert(42)
      t.insert(42)
      expect(t.size()).toBe(1)
    })

    it('throws for values outside universe', () => {
      const t = new YFastTrie({ universeSize: 100 })
      expect(() => t.insert(-1)).toThrow(RangeError)
      expect(() => t.insert(100)).toThrow(RangeError)
    })

    it('contains is an alias for has', () => {
      const t = new YFastTrie({ universeSize: 256 })
      t.insert(5)
      expect(t.contains(5)).toBe(true)
      expect(t.contains(6)).toBe(false)
    })

    it('has returns false for out-of-range values', () => {
      const t = new YFastTrie({ universeSize: 50 })
      expect(t.has(-1)).toBe(false)
      expect(t.has(50)).toBe(false)
    })
  })

  // ─── delete ───────────────────────────────────────────────────────────

  describe('delete', () => {
    it('deletes existing values', () => {
      const t = new YFastTrie({ universeSize: 256 })
      t.insert(10)
      t.insert(20)
      expect(t.delete(10)).toBe(true)
      expect(t.has(10)).toBe(false)
      expect(t.size()).toBe(1)
    })

    it('returns false for non-existent values', () => {
      const t = new YFastTrie({ universeSize: 256 })
      expect(t.delete(42)).toBe(false)
    })

    it('returns false for out-of-range values', () => {
      const t = new YFastTrie({ universeSize: 100 })
      expect(t.delete(-1)).toBe(false)
      expect(t.delete(100)).toBe(false)
    })

    it('updates min and max after deletion', () => {
      const t = new YFastTrie({ universeSize: 256 })
      t.insert(5)
      t.insert(15)
      t.insert(25)
      t.delete(5)
      expect(t.min()).toBe(15)
      t.delete(25)
      expect(t.max()).toBe(15)
    })

    it('clears min and max when empty', () => {
      const t = new YFastTrie({ universeSize: 256 })
      t.insert(10)
      t.delete(10)
      expect(t.min()).toBeUndefined()
      expect(t.max()).toBeUndefined()
    })
  })

  // ─── min / max ────────────────────────────────────────────────────────

  describe('min and max', () => {
    it('returns undefined when empty', () => {
      const t = new YFastTrie({ universeSize: 256 })
      expect(t.min()).toBeUndefined()
      expect(t.max()).toBeUndefined()
    })

    it('tracks min and max correctly', () => {
      const t = new YFastTrie({ universeSize: 1000 })
      t.insert(100)
      t.insert(500)
      t.insert(250)
      expect(t.min()).toBe(100)
      expect(t.max()).toBe(500)
    })
  })

  // ─── successor / predecessor ──────────────────────────────────────────

  describe('successor', () => {
    it('returns the next greater value', () => {
      const t = new YFastTrie({ universeSize: 256 })
      t.insert(10)
      t.insert(20)
      t.insert(30)
      expect(t.successor(10)).toBe(20)
      expect(t.successor(20)).toBe(30)
    })

    it('returns undefined if no successor exists', () => {
      const t = new YFastTrie({ universeSize: 256 })
      t.insert(10)
      expect(t.successor(10)).toBeUndefined()
    })

    it('returns undefined when empty', () => {
      const t = new YFastTrie({ universeSize: 256 })
      expect(t.successor(5)).toBeUndefined()
    })

    it('finds successor across buckets', () => {
      const t = new YFastTrie({ universeSize: 256 })
      t.insert(0)
      t.insert(255)
      expect(t.successor(0)).toBe(255)
    })
  })

  describe('predecessor', () => {
    it('returns the next smaller value', () => {
      const t = new YFastTrie({ universeSize: 256 })
      t.insert(10)
      t.insert(20)
      t.insert(30)
      expect(t.predecessor(20)).toBe(10)
      expect(t.predecessor(30)).toBe(20)
    })

    it('returns undefined if no predecessor exists', () => {
      const t = new YFastTrie({ universeSize: 256 })
      t.insert(10)
      expect(t.predecessor(10)).toBeUndefined()
    })
  })

  // ─── clear / toArray ──────────────────────────────────────────────────

  describe('clear', () => {
    it('removes all elements', () => {
      const t = new YFastTrie({ universeSize: 256 })
      t.insert(10)
      t.insert(20)
      t.clear()
      expect(t.size()).toBe(0)
      expect(t.isEmpty()).toBe(true)
    })
  })

  describe('toArray', () => {
    it('returns sorted array of all values', () => {
      const t = new YFastTrie({ universeSize: 256 })
      t.insert(50)
      t.insert(10)
      t.insert(30)
      expect(t.toArray()).toEqual([10, 30, 50])
    })
  })

  // ─── range ────────────────────────────────────────────────────────────

  describe('range', () => {
    it('returns values in the given range', () => {
      const t = new YFastTrie({ universeSize: 256 })
      t.insert(10)
      t.insert(20)
      t.insert(30)
      t.insert(40)
      expect(t.range(15, 35)).toEqual([20, 30])
    })

    it('returns empty for invalid range', () => {
      const t = new YFastTrie({ universeSize: 256 })
      t.insert(10)
      expect(t.range(20, 5)).toEqual([])
    })
  })

  // ─── clone ────────────────────────────────────────────────────────────

  describe('clone', () => {
    it('creates independent copy', () => {
      const t = new YFastTrie({ universeSize: 256 })
      t.insert(10)
      t.insert(20)
      const c = t.clone()
      expect(c.size()).toBe(2)
      t.delete(10)
      expect(c.has(10)).toBe(true)
    })
  })

  // ─── static from ──────────────────────────────────────────────────────

  describe('static from', () => {
    it('creates trie from number array', () => {
      const t = YFastTrie.from([5, 10, 15, 20], 256)
      expect(t.size()).toBe(4)
      expect(t.has(10)).toBe(true)
    })

    it('ignores out-of-range values', () => {
      const t = YFastTrie.from([1, 300, -1, 5], 256)
      expect(t.size()).toBe(2)
    })
  })
})
