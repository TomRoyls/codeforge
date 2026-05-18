import { describe, it, expect, beforeEach } from 'vitest'
import { Treap6 } from '../../src/core/treap-6/index.js'

describe('Treap6', () => {
  let treap: Treap6<number>

  beforeEach(() => {
    treap = new Treap6<number>()
  })

  // ─── Constructor ───

  describe('constructor', () => {
    it('should create an empty treap with defaults', () => {
      const t = new Treap6<number>()
      expect(t.size).toBe(0)
      expect(t.isEmpty).toBe(true)
    })

    it('should accept a custom comparator', () => {
      const reverseCmp = (a: number, b: number) => b - a
      const t = new Treap6<number>(reverseCmp)
      t.insert(1)
      t.insert(2)
      t.insert(3)
      expect(t.toArray()).toEqual([3, 2, 1])
    })
  })

  // ─── Insert ───

  describe('insert', () => {
    it('should insert a single element', () => {
      treap.insert(42)
      expect(treap.size).toBe(1)
      expect(treap.isEmpty).toBe(false)
    })

    it('should insert multiple elements', () => {
      treap.insert(5)
      treap.insert(3)
      treap.insert(8)
      treap.insert(1)
      treap.insert(10)
      expect(treap.size).toBe(5)
    })

    it('should handle negative numbers', () => {
      treap.insert(-5)
      treap.insert(-10)
      treap.insert(0)
      treap.insert(3)
      expect(treap.size).toBe(4)
      expect(treap.min()).toBe(-10)
      expect(treap.max()).toBe(3)
    })

    it('should ignore duplicate values', () => {
      treap.insert(5)
      treap.insert(5)
      treap.insert(5)
      expect(treap.size).toBe(1)
    })
  })

  // ─── Search / Contains ───

  describe('search', () => {
    beforeEach(() => {
      treap.insert(10)
      treap.insert(20)
      treap.insert(30)
      treap.insert(5)
      treap.insert(15)
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
    it('should return undefined for empty treap', () => {
      expect(treap.min()).toBeUndefined()
    })

    it('should return the only element', () => {
      treap.insert(7)
      expect(treap.min()).toBe(7)
    })

    it('should return the smallest element', () => {
      treap.insert(10)
      treap.insert(5)
      treap.insert(20)
      treap.insert(1)
      treap.insert(15)
      expect(treap.min()).toBe(1)
    })
  })

  describe('max', () => {
    it('should return undefined for empty treap', () => {
      expect(treap.max()).toBeUndefined()
    })

    it('should return the only element', () => {
      treap.insert(7)
      expect(treap.max()).toBe(7)
    })

    it('should return the largest element', () => {
      treap.insert(10)
      treap.insert(5)
      treap.insert(20)
      treap.insert(1)
      treap.insert(15)
      expect(treap.max()).toBe(20)
    })
  })

  // ─── ToArray ───

  describe('toArray', () => {
    it('should return empty array for empty treap', () => {
      expect(treap.toArray()).toEqual([])
    })

    it('should return sorted elements', () => {
      treap.insert(30)
      treap.insert(10)
      treap.insert(20)
      expect(treap.toArray()).toEqual([10, 20, 30])
    })

    it('should handle single element', () => {
      treap.insert(5)
      expect(treap.toArray()).toEqual([5])
    })

    it('should handle negatives', () => {
      treap.insert(-3)
      treap.insert(0)
      treap.insert(-7)
      treap.insert(2)
      expect(treap.toArray()).toEqual([-7, -3, 0, 2])
    })
  })

  // ─── Size / IsEmpty ───

  describe('size', () => {
    it('should return 0 for empty treap', () => {
      expect(treap.size).toBe(0)
    })

    it('should track insertions', () => {
      treap.insert(1)
      treap.insert(2)
      treap.insert(3)
      expect(treap.size).toBe(3)
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
      treap.insert(1)
      treap.insert(2)
      treap.clear()
      expect(treap.isEmpty).toBe(true)
    })
  })

  // ─── Clear ───

  describe('clear', () => {
    it('should empty the treap', () => {
      treap.insert(1)
      treap.insert(2)
      treap.insert(3)
      treap.clear()
      expect(treap.size).toBe(0)
      expect(treap.isEmpty).toBe(true)
      expect(treap.toArray()).toEqual([])
    })
  })

  // ─── GetTimeComplexity ───

  describe('getTimeComplexity', () => {
    it('should return the expected complexity string', () => {
      expect(treap.getTimeComplexity()).toBe('Average: O(log n), Worst: O(n)')
    })
  })

  // ─── Delete ───

  describe('delete', () => {
    beforeEach(() => {
      treap.insert(10)
      treap.insert(20)
      treap.insert(5)
      treap.insert(15)
      treap.insert(30)
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
      treap.insert(10)
      treap.insert(20)
      treap.insert(30)
      treap.insert(5)
      treap.insert(15)
      const [left, right] = treap.split(18)
      expect(left.toArray().sort((a, b) => a - b)).toEqual([5, 10, 15])
      expect(right.toArray().sort((a, b) => a - b)).toEqual([20, 30])
    })

    it('should split where all elements go left', () => {
      treap.insert(1)
      treap.insert(2)
      treap.insert(3)
      const [left, right] = treap.split(100)
      expect(left.size).toBe(3)
      expect(right.size).toBe(0)
    })

    it('should split where all elements go right', () => {
      treap.insert(10)
      treap.insert(20)
      treap.insert(30)
      const [left, right] = treap.split(0)
      expect(left.size).toBe(0)
      expect(right.size).toBe(3)
    })
  })

  // ─── Merge ───

  describe('merge', () => {
    it('should merge two treaps', () => {
      const other = new Treap6<number>()
      treap.insert(1)
      treap.insert(3)
      treap.insert(5)
      other.insert(2)
      other.insert(4)
      other.insert(6)
      treap.merge(other)
      expect(treap.size).toBe(6)
      expect(treap.toArray().sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5, 6])
    })

    it('should merge with empty treap', () => {
      treap.insert(1)
      treap.insert(2)
      const empty = new Treap6<number>()
      treap.merge(empty)
      expect(treap.size).toBe(2)
    })

    it('should return this for chaining', () => {
      treap.insert(1)
      const other = new Treap6<number>()
      other.insert(2)
      const result = treap.merge(other)
      expect(result).toBe(treap)
    })
  })

  // ─── RangeSearch ───

  describe('rangeSearch', () => {
    beforeEach(() => {
      treap.insert(10)
      treap.insert(20)
      treap.insert(30)
      treap.insert(5)
      treap.insert(15)
      treap.insert(25)
      treap.insert(35)
    })

    it('should return empty array for empty treap', () => {
      const empty = new Treap6<number>()
      expect(empty.rangeSearch(0, 100)).toEqual([])
    })

    it('should return values within range inclusive', () => {
      const result = treap.rangeSearch(15, 25)
      expect(result.sort((a, b) => a - b)).toEqual([15, 20, 25])
    })

    it('should return single element for tight range', () => {
      expect(treap.rangeSearch(10, 10)).toEqual([10])
    })

    it('should return empty for range with no matches', () => {
      expect(treap.rangeSearch(100, 200)).toEqual([])
    })

    it('should return all elements for full range', () => {
      const result = treap.rangeSearch(0, 100)
      expect(result.sort((a, b) => a - b)).toEqual([5, 10, 15, 20, 25, 30, 35])
    })

    it('should handle range with negatives', () => {
      const t = new Treap6<number>()
      t.insert(-10)
      t.insert(-5)
      t.insert(0)
      t.insert(5)
      t.insert(10)
      expect(t.rangeSearch(-5, 5).sort((a, b) => a - b)).toEqual([-5, 0, 5])
    })
  })

  // ─── Rank ───

  describe('rank', () => {
    beforeEach(() => {
      treap.insert(10)
      treap.insert(20)
      treap.insert(30)
      treap.insert(5)
      treap.insert(15)
    })

    it('should return 0 for rank of min element', () => {
      expect(treap.rank(5)).toBe(0)
    })

    it('should return correct rank for middle element', () => {
      expect(treap.rank(15)).toBe(2)
    })

    it('should return last index for max element', () => {
      expect(treap.rank(30)).toBe(4)
    })

    it('should return 0 for empty treap', () => {
      const empty = new Treap6<number>()
      expect(empty.rank(5)).toBe(0)
    })

    it('should return rank based on insertion position for missing value', () => {
      expect(treap.rank(12)).toBe(2)
      expect(treap.rank(1)).toBe(0)
      expect(treap.rank(100)).toBe(5)
    })
  })

  // ─── Select ───

  describe('select', () => {
    beforeEach(() => {
      treap.insert(10)
      treap.insert(20)
      treap.insert(30)
      treap.insert(5)
      treap.insert(15)
    })

    it('should return the k-th smallest element', () => {
      expect(treap.select(0)).toBe(5)
      expect(treap.select(1)).toBe(10)
      expect(treap.select(2)).toBe(15)
      expect(treap.select(3)).toBe(20)
      expect(treap.select(4)).toBe(30)
    })

    it('should return undefined for out of bounds', () => {
      expect(treap.select(-1)).toBeUndefined()
      expect(treap.select(5)).toBeUndefined()
      expect(treap.select(100)).toBeUndefined()
    })

    it('should return undefined for empty treap', () => {
      const empty = new Treap6<number>()
      expect(empty.select(0)).toBeUndefined()
    })
  })

  // ─── Edge Cases ───

  describe('edge cases', () => {
    it('should handle string values', () => {
      const t = new Treap6<string>()
      t.insert('banana')
      t.insert('apple')
      t.insert('cherry')
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
