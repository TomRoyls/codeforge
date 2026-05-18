import { describe, it, expect, beforeEach } from 'vitest'
import { Treap4 } from '../../src/core/treap-4/index.js'

describe('Treap4', () => {
  let treap: Treap4<number>

  beforeEach(() => {
    treap = new Treap4<number>()
  })

  // ─── Constructor ───

  describe('constructor', () => {
    it('should create an empty treap with defaults', () => {
      const t = new Treap4<number>()
      expect(t.size).toBe(0)
      expect(t.isEmpty).toBe(true)
    })

    it('should accept a custom comparator', () => {
      const reverseCmp = (a: number, b: number) => b - a
      const t = new Treap4<number>(reverseCmp)
      t.insert(1).insert(2).insert(3)
      expect(t.toArray()).toEqual([3, 2, 1])
    })

    it('should accept a seed for deterministic priorities', () => {
      const t = new Treap4<number>(undefined, 42)
      t.insert(5)
      expect(t.size).toBe(1)
      expect(t.search(5)).toBe(true)
    })
  })

  // ─── Insert ───

  describe('insert', () => {
    it('should insert a single element', () => {
      treap.insert(42)
      expect(treap.size).toBe(1)
      expect(treap.isEmpty).toBe(false)
    })

    it('should return this for chaining', () => {
      const result = treap.insert(1)
      expect(result).toBe(treap)
      treap.insert(2).insert(3).insert(4)
      expect(treap.size).toBe(4)
    })

    it('should insert multiple elements', () => {
      treap.insert(5).insert(3).insert(8).insert(1).insert(10)
      expect(treap.size).toBe(5)
    })

    it('should handle negative numbers', () => {
      treap.insert(-5).insert(-10).insert(0).insert(3)
      expect(treap.size).toBe(4)
      expect(treap.min()).toBe(-10)
      expect(treap.max()).toBe(3)
    })

    it('should ignore duplicate values (same comparator result = 0)', () => {
      treap.insert(5).insert(5).insert(5)
      expect(treap.size).toBe(1)
    })
  })

  // ─── Search / Contains ───

  describe('search', () => {
    beforeEach(() => {
      treap.insert(10).insert(20).insert(30).insert(5).insert(15)
    })

    it('should find existing elements', () => {
      expect(treap.search(10)).toBe(true)
      expect(treap.search(20)).toBe(true)
      expect(treap.search(30)).toBe(true)
      expect(treap.search(5)).toBe(true)
      expect(treap.search(15)).toBe(true)
    })

    it('should return false for missing elements', () => {
      expect(treap.search(99)).toBe(false)
      expect(treap.search(0)).toBe(false)
      expect(treap.search(-1)).toBe(false)
    })
  })

  describe('contains', () => {
    it('should be an alias for search', () => {
      treap.insert(42)
      expect(treap.contains(42)).toBe(true)
      expect(treap.contains(99)).toBe(false)
    })
  })

  // ─── Min / Max ───

  describe('min', () => {
    it('should return null for empty treap', () => {
      expect(treap.min()).toBeNull()
    })

    it('should return the only element', () => {
      treap.insert(7)
      expect(treap.min()).toBe(7)
    })

    it('should return the smallest element', () => {
      treap.insert(10).insert(5).insert(20).insert(1).insert(15)
      expect(treap.min()).toBe(1)
    })
  })

  describe('max', () => {
    it('should return null for empty treap', () => {
      expect(treap.max()).toBeNull()
    })

    it('should return the only element', () => {
      treap.insert(7)
      expect(treap.max()).toBe(7)
    })

    it('should return the largest element', () => {
      treap.insert(10).insert(5).insert(20).insert(1).insert(15)
      expect(treap.max()).toBe(20)
    })
  })

  // ─── Size / IsEmpty ───

  describe('size', () => {
    it('should return 0 for empty treap', () => {
      expect(treap.size).toBe(0)
    })

    it('should track insertions', () => {
      treap.insert(1).insert(2).insert(3)
      expect(treap.size).toBe(3)
    })

    it('should not count duplicates', () => {
      treap.insert(1).insert(1)
      expect(treap.size).toBe(1)
    })
  })

  describe('isEmpty', () => {
    it('should be true for new treap', () => {
      expect(treap.isEmpty).toBe(true)
    })

    it('should be false after insert', () => {
      treap.insert(1)
      expect(treap.isEmpty).toBe(false)
    })

    it('should be true after clear', () => {
      treap.insert(1).insert(2)
      treap.clear()
      expect(treap.isEmpty).toBe(true)
    })
  })

  // ─── Clear ───

  describe('clear', () => {
    it('should empty the treap', () => {
      treap.insert(1).insert(2).insert(3)
      treap.clear()
      expect(treap.size).toBe(0)
      expect(treap.isEmpty).toBe(true)
      expect(treap.toArray()).toEqual([])
    })
  })

  // ─── ToArray ───

  describe('toArray', () => {
    it('should return empty array for empty treap', () => {
      expect(treap.toArray()).toEqual([])
    })

    it('should return sorted elements', () => {
      treap.insert(30).insert(10).insert(20)
      expect(treap.toArray()).toEqual([10, 20, 30])
    })

    it('should handle single element', () => {
      treap.insert(5)
      expect(treap.toArray()).toEqual([5])
    })

    it('should handle negatives', () => {
      treap.insert(-3).insert(0).insert(-7).insert(2)
      expect(treap.toArray()).toEqual([-7, -3, 0, 2])
    })
  })

  // ─── ForEach ───

  describe('forEach', () => {
    it('should iterate in sorted order with correct indices', () => {
      treap.insert(30).insert(10).insert(20)
      const collected: Array<{ value: number; index: number }> = []
      treap.forEach((value, index) => collected.push({ value, index }))
      expect(collected).toEqual([
        { value: 10, index: 0 },
        { value: 20, index: 1 },
        { value: 30, index: 2 },
      ])
    })

    it('should not call callback for empty treap', () => {
      let calls = 0
      treap.forEach(() => { calls++ })
      expect(calls).toBe(0)
    })
  })

  // ─── Delete ───

  describe('delete', () => {
    beforeEach(() => {
      treap.insert(10).insert(20).insert(5).insert(15).insert(30)
    })

    it('should delete an existing element', () => {
      expect(treap.delete(20)).toBe(true)
      expect(treap.size).toBe(4)
      expect(treap.search(20)).toBe(false)
    })

    it('should return false for missing element', () => {
      expect(treap.delete(99)).toBe(false)
      expect(treap.size).toBe(5)
    })

    it('should maintain sorted order after delete', () => {
      treap.delete(15)
      expect(treap.toArray()).toEqual([5, 10, 20, 30])
    })

    it('should handle deleting all elements', () => {
      treap.delete(10)
      treap.delete(20)
      treap.delete(5)
      treap.delete(15)
      treap.delete(30)
      expect(treap.size).toBe(0)
      expect(treap.isEmpty).toBe(true)
    })

    it('should delete min element', () => {
      treap.delete(5)
      expect(treap.min()).toBe(10)
    })

    it('should delete max element', () => {
      treap.delete(30)
      expect(treap.max()).toBe(20)
    })
  })

  // ─── Split ───

  describe('split', () => {
    it('should split empty treap into two empty treaps', () => {
      const [left, right] = treap.split(10)
      expect(left.size).toBe(0)
      expect(right.size).toBe(0)
    })

    it('should split correctly around a value', () => {
      treap.insert(10).insert(20).insert(30).insert(5).insert(15)
      const [left, right] = treap.split(18)
      expect(left.toArray().sort((a, b) => a - b)).toEqual([5, 10, 15])
      expect(right.toArray().sort((a, b) => a - b)).toEqual([20, 30])
    })

    it('should split where all elements go left', () => {
      treap.insert(1).insert(2).insert(3)
      const [left, right] = treap.split(100)
      expect(left.size).toBe(3)
      expect(right.size).toBe(0)
    })

    it('should split where all elements go right', () => {
      treap.insert(10).insert(20).insert(30)
      const [left, right] = treap.split(0)
      expect(left.size).toBe(0)
      expect(right.size).toBe(3)
    })
  })

  // ─── Merge ───

  describe('merge', () => {
    it('should merge two treaps', () => {
      const other = new Treap4<number>()
      treap.insert(1).insert(3).insert(5)
      other.insert(2).insert(4).insert(6)
      treap.merge(other)
      expect(treap.size).toBe(6)
      expect(treap.toArray().sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5, 6])
    })

    it('should merge with empty treap', () => {
      treap.insert(1).insert(2)
      const empty = new Treap4<number>()
      treap.merge(empty)
      expect(treap.size).toBe(2)
    })

    it('should return this for chaining', () => {
      treap.insert(1)
      const other = new Treap4<number>()
      other.insert(2)
      const result = treap.merge(other)
      expect(result).toBe(treap)
    })
  })

  // ─── Edge Cases ───

  describe('edge cases', () => {
    it('should handle string values', () => {
      const t = new Treap4<string>()
      t.insert('banana').insert('apple').insert('cherry')
      expect(t.toArray()).toEqual(['apple', 'banana', 'cherry'])
      expect(t.min()).toBe('apple')
      expect(t.max()).toBe('cherry')
    })

    it('should handle many insertions and maintain sorted order', () => {
      const values = [50, 30, 70, 10, 40, 60, 80, 5, 25, 35]
      values.forEach(v => treap.insert(v))
      expect(treap.toArray()).toEqual(values.slice().sort((a, b) => a - b))
    })
  })
}, 60000)
