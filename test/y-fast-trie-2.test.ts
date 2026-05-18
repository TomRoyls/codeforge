import { describe, it, expect } from 'vitest'
import { YFastTrie } from '../src/core/y-fast-trie-2/index.js'

// ─── Constructor ────────────────────────────────────────────────────────

describe('YFastTrie (y-fast-trie-2)', () => {
  describe('constructor', () => {
    it('creates with default options', () => {
      const t = new YFastTrie()
      expect(t.size()).toBe(0)
      expect(t.isEmpty()).toBe(true)
    })

    it('creates with custom universeSize', () => {
      const t = new YFastTrie({ universeSize: 1024 })
      expect(t.size()).toBe(0)
    })

    it('creates with custom groupSize', () => {
      const t = new YFastTrie({ universeSize: 256, groupSize: 16 })
      expect(t.size()).toBe(0)
    })
  })

  // ─── insert / has ─────────────────────────────────────────────────────

  describe('insert and has', () => {
    it('inserts and checks membership', () => {
      const t = new YFastTrie({ universeSize: 256 })
      t.insert(10)
      t.insert(50)
      t.insert(100)
      expect(t.has(10)).toBe(true)
      expect(t.has(50)).toBe(true)
      expect(t.has(100)).toBe(true)
      expect(t.has(75)).toBe(false)
    })

    it('ignores duplicate inserts', () => {
      const t = new YFastTrie({ universeSize: 256 })
      t.insert(42)
      t.insert(42)
      expect(t.size()).toBe(1)
    })

    it('inserts many values', () => {
      const t = new YFastTrie({ universeSize: 1000 })
      for (let i = 0; i < 100; i++) t.insert(i)
      expect(t.size()).toBe(100)
      expect(t.has(0)).toBe(true)
      expect(t.has(99)).toBe(true)
      expect(t.has(100)).toBe(false)
    })
  })

  // ─── delete ───────────────────────────────────────────────────────────

  describe('delete', () => {
    it('deletes existing values', () => {
      const t = new YFastTrie({ universeSize: 256 })
      t.insert(10)
      t.insert(20)
      t.delete(10)
      expect(t.has(10)).toBe(false)
      expect(t.size()).toBe(1)
    })

    it('does nothing for non-existent values', () => {
      const t = new YFastTrie({ universeSize: 256 })
      t.insert(10)
      t.delete(99)
      expect(t.size()).toBe(1)
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

    it('resets min and max when all deleted', () => {
      const t = new YFastTrie({ universeSize: 256 })
      t.insert(10)
      t.delete(10)
      expect(t.min()).toBeNull()
      expect(t.max()).toBeNull()
      expect(t.isEmpty()).toBe(true)
    })
  })

  // ─── min / max ────────────────────────────────────────────────────────

  describe('min and max', () => {
    it('returns null when empty', () => {
      const t = new YFastTrie({ universeSize: 256 })
      expect(t.min()).toBeNull()
      expect(t.max()).toBeNull()
    })

    it('returns correct min and max', () => {
      const t = new YFastTrie({ universeSize: 256 })
      t.insert(100)
      t.insert(50)
      t.insert(200)
      expect(t.min()).toBe(50)
      expect(t.max()).toBe(200)
    })
  })

  // ─── predecessor / successor ──────────────────────────────────────────

  describe('predecessor', () => {
    it('returns the next smaller value', () => {
      const t = new YFastTrie({ universeSize: 256 })
      t.insert(10)
      t.insert(20)
      t.insert(30)
      expect(t.predecessor(20)).toBe(10)
      expect(t.predecessor(30)).toBe(20)
    })

    it('returns null when no predecessor', () => {
      const t = new YFastTrie({ universeSize: 256 })
      t.insert(10)
      expect(t.predecessor(10)).toBeNull()
    })

    it('returns null when empty', () => {
      const t = new YFastTrie({ universeSize: 256 })
      expect(t.predecessor(5)).toBeNull()
    })

    it('finds predecessor of non-member value', () => {
      const t = new YFastTrie({ universeSize: 256 })
      t.insert(10)
      t.insert(30)
      expect(t.predecessor(25)).toBe(10)
    })
  })

  describe('successor', () => {
    it('returns the next greater value', () => {
      const t = new YFastTrie({ universeSize: 256 })
      t.insert(10)
      t.insert(20)
      t.insert(30)
      expect(t.successor(10)).toBe(20)
      expect(t.successor(20)).toBe(30)
    })

    it('returns null when no successor', () => {
      const t = new YFastTrie({ universeSize: 256 })
      t.insert(10)
      expect(t.successor(10)).toBeNull()
    })

    it('returns null when empty', () => {
      const t = new YFastTrie({ universeSize: 256 })
      expect(t.successor(5)).toBeNull()
    })

    it('finds successor of value less than min', () => {
      const t = new YFastTrie({ universeSize: 256 })
      t.insert(10)
      t.insert(20)
      expect(t.successor(0)).toBe(10)
    })
  })

  // ─── clear ────────────────────────────────────────────────────────────

  describe('clear', () => {
    it('removes all elements', () => {
      const t = new YFastTrie({ universeSize: 256 })
      t.insert(10)
      t.insert(20)
      t.clear()
      expect(t.size()).toBe(0)
      expect(t.isEmpty()).toBe(true)
      expect(t.min()).toBeNull()
    })
  })

  // ─── toArray / forEach ────────────────────────────────────────────────

  describe('toArray', () => {
    it('returns sorted values', () => {
      const t = new YFastTrie({ universeSize: 256 })
      t.insert(50)
      t.insert(10)
      t.insert(30)
      expect(t.toArray()).toEqual([10, 30, 50])
    })

    it('returns empty array when empty', () => {
      const t = new YFastTrie({ universeSize: 256 })
      expect(t.toArray()).toEqual([])
    })
  })

  describe('forEach', () => {
    it('iterates over all values in order', () => {
      const t = new YFastTrie({ universeSize: 256 })
      t.insert(30)
      t.insert(10)
      t.insert(20)
      const values: number[] = []
      t.forEach((v) => values.push(v))
      expect(values).toEqual([10, 20, 30])
    })
  })
})
