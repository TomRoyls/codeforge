import { describe, it, expect, beforeEach } from 'vitest'
import { IntervalTree4 } from '../../src/core/interval-tree-4/index.js'

describe('IntervalTree4', () => {
  let tree: IntervalTree4

  beforeEach(() => {
    tree = new IntervalTree4()
  })

  // ─── Constructor ───
  describe('constructor', () => {
    it('should create an empty tree', () => {
      const t = new IntervalTree4()
      expect(t.size).toBe(0)
      expect(t.isEmpty()).toBe(true)
    })
  })

  // ─── insert ───
  describe('insert', () => {
    it('should insert a single interval', () => {
      tree.insert(0, 10)
      expect(tree.size).toBe(1)
      expect(tree.isEmpty()).toBe(false)
    })

    it('should insert multiple intervals', () => {
      tree.insert(0, 10)
      tree.insert(5, 15)
      tree.insert(20, 30)
      expect(tree.size).toBe(3)
    })

    it('should allow zero-length intervals', () => {
      tree.insert(5, 5)
      expect(tree.size).toBe(1)
    })

    it('should allow negative intervals', () => {
      tree.insert(-10, -5)
      expect(tree.size).toBe(1)
    })

    it('should throw when low > high', () => {
      expect(() => tree.insert(10, 5)).toThrow(RangeError)
    })

    it('should allow duplicate intervals', () => {
      tree.insert(0, 10)
      tree.insert(0, 10)
      expect(tree.size).toBe(2)
    })
  })

  // ─── delete ───
  describe('delete', () => {
    it('should return false for non-existent interval', () => {
      expect(tree.delete(0, 10)).toBe(false)
    })

    it('should delete an existing interval', () => {
      tree.insert(0, 10)
      expect(tree.delete(0, 10)).toBe(true)
      expect(tree.size).toBe(0)
    })

    it('should delete only the matching interval', () => {
      tree.insert(0, 10)
      tree.insert(5, 15)
      tree.insert(20, 30)
      expect(tree.delete(5, 15)).toBe(true)
      expect(tree.size).toBe(2)
      expect(tree.search(5, 15)).toBe(false)
    })

    it('should throw when low > high', () => {
      expect(() => tree.delete(10, 5)).toThrow(RangeError)
    })
  })

  // ─── search ───
  describe('search', () => {
    it('should return false for empty tree', () => {
      expect(tree.search(0, 10)).toBe(false)
    })

    it('should find an existing interval', () => {
      tree.insert(0, 10)
      expect(tree.search(0, 10)).toBe(true)
    })

    it('should not find a non-existing interval', () => {
      tree.insert(0, 10)
      expect(tree.search(0, 20)).toBe(false)
    })
  })

  // ─── contains ───
  describe('contains', () => {
    it('should return false for empty tree', () => {
      expect(tree.contains(0, 10)).toBe(false)
    })

    it('should return true for existing interval', () => {
      tree.insert(5, 15)
      expect(tree.contains(5, 15)).toBe(true)
    })

    it('should return false for non-existing interval', () => {
      tree.insert(5, 15)
      expect(tree.contains(5, 10)).toBe(false)
    })
  })

  // ─── min ───
  describe('min', () => {
    it('should return undefined for empty tree', () => {
      expect(tree.min()).toBeUndefined()
    })

    it('should return the minimum low value', () => {
      tree.insert(20, 30)
      tree.insert(0, 10)
      tree.insert(10, 20)
      expect(tree.min()).toBe(0)
    })

    it('should handle negative intervals', () => {
      tree.insert(-10, -5)
      tree.insert(0, 10)
      expect(tree.min()).toBe(-10)
    })
  })

  // ─── max ───
  describe('max', () => {
    it('should return undefined for empty tree', () => {
      expect(tree.max()).toBeUndefined()
    })

    it('should return the maximum endpoint', () => {
      tree.insert(0, 10)
      tree.insert(5, 25)
      tree.insert(20, 30)
      expect(tree.max()).toBe(30)
    })

    it('should track max correctly after deletion', () => {
      tree.insert(0, 10)
      tree.insert(20, 50)
      tree.delete(20, 50)
      expect(tree.max()).toBe(10)
    })
  })

  // ─── toArray ───
  describe('toArray', () => {
    it('should return empty for empty tree', () => {
      expect(tree.toArray()).toEqual([])
    })

    it('should return all intervals in order', () => {
      tree.insert(20, 30)
      tree.insert(0, 10)
      tree.insert(10, 20)
      expect(tree.toArray()).toEqual([[0, 10], [10, 20], [20, 30]])
    })
  })

  // ─── size and isEmpty ───
  describe('size and isEmpty', () => {
    it('should track size correctly', () => {
      expect(tree.size).toBe(0)
      tree.insert(0, 10)
      expect(tree.size).toBe(1)
    })

    it('should update size on delete', () => {
      tree.insert(0, 10)
      tree.insert(5, 15)
      tree.delete(0, 10)
      expect(tree.size).toBe(1)
    })
  })

  // ─── clear ───
  describe('clear', () => {
    it('should remove all intervals', () => {
      tree.insert(0, 10)
      tree.insert(5, 15)
      tree.clear()
      expect(tree.size).toBe(0)
      expect(tree.isEmpty()).toBe(true)
    })
  })

  // ─── forEach ───
  describe('forEach', () => {
    it('should not call callback for empty tree', () => {
      const intervals: [number, number][] = []
      tree.forEach((interval) => intervals.push(interval))
      expect(intervals).toEqual([])
    })

    it('should iterate all intervals in order', () => {
      tree.insert(20, 30)
      tree.insert(0, 10)
      tree.insert(10, 20)
      const intervals: [number, number][] = []
      tree.forEach((interval) => intervals.push(interval))
      expect(intervals).toEqual([[0, 10], [10, 20], [20, 30]])
    })

    it('should provide correct indices', () => {
      tree.insert(0, 10)
      tree.insert(20, 30)
      tree.insert(40, 50)
      const indices: number[] = []
      tree.forEach((_interval, index) => indices.push(index))
      expect(indices).toEqual([0, 1, 2])
    })
  })

  // ─── getTimeComplexity ───
  describe('getTimeComplexity', () => {
    it('should return complexity for all operations', () => {
      const complexity = tree.getTimeComplexity()
      expect(complexity.insert).toBeDefined()
      expect(complexity.delete).toBeDefined()
      expect(complexity.search).toBeDefined()
      expect(complexity.min).toBeDefined()
      expect(complexity.max).toBeDefined()
      expect(complexity.toArray).toBeDefined()
      expect(complexity.forEach).toBeDefined()
      expect(complexity.bulkInsert).toBeDefined()
      expect(complexity.mergeOverlapping).toBeDefined()
      expect(complexity.splitAt).toBeDefined()
    })
  })

  // ─── bulkInsert ───
  describe('bulkInsert', () => {
    it('should insert multiple intervals', () => {
      tree.bulkInsert([[0, 10], [5, 15], [20, 30]])
      expect(tree.size).toBe(3)
    })

    it('should handle empty array', () => {
      tree.bulkInsert([])
      expect(tree.size).toBe(0)
    })
  })

  // ─── mergeOverlapping ───
  describe('mergeOverlapping', () => {
    it('should return empty tree for empty input', () => {
      const merged = tree.mergeOverlapping()
      expect(merged.size).toBe(0)
    })

    it('should merge overlapping intervals', () => {
      tree.insert(0, 10)
      tree.insert(5, 15)
      tree.insert(20, 30)
      tree.insert(25, 35)
      const merged = tree.mergeOverlapping()
      const result = merged.toArray()
      expect(result).toEqual([[0, 15], [20, 35]])
    })

    it('should not merge non-overlapping intervals', () => {
      tree.insert(0, 5)
      tree.insert(10, 15)
      const merged = tree.mergeOverlapping()
      expect(merged.toArray()).toEqual([[0, 5], [10, 15]])
    })

    it('should merge touching intervals', () => {
      tree.insert(0, 10)
      tree.insert(10, 20)
      const merged = tree.mergeOverlapping()
      expect(merged.toArray()).toEqual([[0, 20]])
    })

    it('should not modify the original tree', () => {
      tree.insert(0, 10)
      tree.insert(5, 15)
      tree.mergeOverlapping()
      expect(tree.size).toBe(2)
    })
  })

  // ─── splitAt ───
  describe('splitAt', () => {
    it('should split into two empty trees for empty input', () => {
      const { left, right } = tree.splitAt(10)
      expect(left.size).toBe(0)
      expect(right.size).toBe(0)
    })

    it('should split intervals at a point', () => {
      tree.insert(0, 20)
      const { left, right } = tree.splitAt(10)
      expect(left.toArray()).toEqual([[0, 10]])
      expect(right.toArray()).toEqual([[10, 20]])
    })

    it('should put intervals fully left of split in left tree', () => {
      tree.insert(0, 5)
      tree.insert(10, 20)
      const { left, right } = tree.splitAt(7)
      expect(left.toArray()).toEqual([[0, 5]])
      expect(right.toArray()).toEqual([[10, 20]])
    })

    it('should put intervals fully right of split in right tree', () => {
      tree.insert(20, 30)
      tree.insert(0, 5)
      const { left, right } = tree.splitAt(10)
      expect(left.toArray()).toEqual([[0, 5]])
      expect(right.toArray()).toEqual([[20, 30]])
    })

    it('should handle interval ending at split point', () => {
      tree.insert(0, 10)
      const { left, right } = tree.splitAt(10)
      expect(left.toArray()).toEqual([[0, 10]])
      expect(right.size).toBe(0)
    })

    it('should handle interval starting at split point', () => {
      tree.insert(10, 20)
      const { left, right } = tree.splitAt(10)
      expect(left.toArray()).toEqual([[10, 10]])
      expect(right.toArray()).toEqual([[10, 20]])
    })
  })
})
