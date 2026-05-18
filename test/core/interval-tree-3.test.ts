import { describe, it, expect, beforeEach } from 'vitest'
import { IntervalTree3 } from '../../src/core/interval-tree-3/index.js'

describe('IntervalTree3', () => {
  let tree: IntervalTree3

  beforeEach(() => {
    tree = new IntervalTree3()
  })

  // ─── Constructor ───
  describe('constructor', () => {
    it('should create an empty tree', () => {
      const t = new IntervalTree3()
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
      expect(tree.search(5, 5)).toBe(true)
    })

    it('should allow negative intervals', () => {
      tree.insert(-10, -5)
      expect(tree.size).toBe(1)
      expect(tree.search(-10, -5)).toBe(true)
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

  // ─── remove ───
  describe('remove', () => {
    it('should return false for non-existent interval', () => {
      expect(tree.remove(0, 10)).toBe(false)
    })

    it('should remove an existing interval', () => {
      tree.insert(0, 10)
      expect(tree.remove(0, 10)).toBe(true)
      expect(tree.size).toBe(0)
    })

    it('should remove only the matching interval', () => {
      tree.insert(0, 10)
      tree.insert(5, 15)
      tree.insert(20, 30)
      expect(tree.remove(5, 15)).toBe(true)
      expect(tree.size).toBe(2)
      expect(tree.search(5, 15)).toBe(false)
    })

    it('should throw when low > high', () => {
      expect(() => tree.remove(10, 5)).toThrow(RangeError)
    })

    it('should handle removing from tree with duplicates', () => {
      tree.insert(0, 10)
      tree.insert(0, 10)
      expect(tree.remove(0, 10)).toBe(true)
      expect(tree.size).toBe(1)
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

    it('should find intervals regardless of insertion order', () => {
      tree.insert(20, 30)
      tree.insert(0, 10)
      tree.insert(10, 20)
      expect(tree.search(10, 20)).toBe(true)
      expect(tree.search(0, 10)).toBe(true)
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

  // ─── searchPoint ───
  describe('searchPoint', () => {
    it('should return empty for empty tree', () => {
      expect(tree.searchPoint(5)).toEqual([])
    })

    it('should find intervals containing a point', () => {
      tree.insert(0, 10)
      tree.insert(5, 15)
      tree.insert(20, 30)
      const result = tree.searchPoint(7)
      expect(result).toContainEqual([0, 10])
      expect(result).toContainEqual([5, 15])
    })

    it('should not find intervals not containing a point', () => {
      tree.insert(0, 10)
      tree.insert(20, 30)
      expect(tree.searchPoint(15)).toEqual([])
    })

    it('should find interval at boundary points', () => {
      tree.insert(0, 10)
      expect(tree.searchPoint(0)).toContainEqual([0, 10])
      expect(tree.searchPoint(10)).toContainEqual([0, 10])
    })

    it('should find zero-length interval at point', () => {
      tree.insert(5, 5)
      expect(tree.searchPoint(5)).toContainEqual([5, 5])
    })
  })

  // ─── searchAll ───
  describe('searchAll', () => {
    it('should return empty for empty tree', () => {
      expect(tree.searchAll(0, 10)).toEqual([])
    })

    it('should find all overlapping intervals', () => {
      tree.insert(0, 10)
      tree.insert(5, 15)
      tree.insert(20, 30)
      const result = tree.searchAll(5, 10)
      expect(result).toContainEqual([0, 10])
      expect(result).toContainEqual([5, 15])
      expect(result).not.toContainEqual([20, 30])
    })

    it('should find no overlaps for disjoint intervals', () => {
      tree.insert(0, 5)
      tree.insert(10, 15)
      expect(tree.searchAll(6, 9)).toEqual([])
    })
  })

  // ─── overlaps ───
  describe('overlaps', () => {
    it('should return false for empty tree', () => {
      expect(tree.overlaps(0, 10)).toBe(false)
    })

    it('should return true when overlap exists', () => {
      tree.insert(5, 15)
      expect(tree.overlaps(0, 10)).toBe(true)
    })

    it('should return false when no overlap exists', () => {
      tree.insert(0, 5)
      expect(tree.overlaps(10, 15)).toBe(false)
    })

    it('should detect touching at boundary', () => {
      tree.insert(0, 10)
      expect(tree.overlaps(10, 20)).toBe(true)
    })
  })

  // ─── size and isEmpty ───
  describe('size and isEmpty', () => {
    it('should track size correctly', () => {
      expect(tree.size).toBe(0)
      tree.insert(0, 10)
      expect(tree.size).toBe(1)
      tree.insert(5, 15)
      expect(tree.size).toBe(2)
    })

    it('should update size on remove', () => {
      tree.insert(0, 10)
      tree.insert(5, 15)
      tree.remove(0, 10)
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
})
