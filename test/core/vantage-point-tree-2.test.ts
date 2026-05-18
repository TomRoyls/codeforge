import { describe, it, expect } from 'vitest'
import { VantagePointTree2 } from '../../src/core/vantage-point-tree-2/index.js'

const euclidean = (a: number[], b: number[]): number => {
  let sum = 0
  for (let i = 0; i < a.length; i++) {
    sum += (a[i]! - b[i]!) ** 2
  }
  return Math.sqrt(sum)
}

const absDiff = (a: number, b: number): number => Math.abs(a - b)

describe('VantagePointTree2', () => {
  // ─── Constructor ───
  describe('constructor', () => {
    it('should create a tree from an empty array', () => {
      const tree = new VantagePointTree2<number>([], absDiff)
      expect(tree.size()).toBe(0)
      expect(tree.isEmpty()).toBe(true)
    })

    it('should create a tree from a single-element array', () => {
      const tree = new VantagePointTree2<number>([42], absDiff)
      expect(tree.size()).toBe(1)
      expect(tree.isEmpty()).toBe(false)
    })

    it('should create a tree from multiple elements', () => {
      const tree = new VantagePointTree2<number>([1, 2, 3, 4, 5], absDiff)
      expect(tree.size()).toBe(5)
    })

    it('should handle duplicate items', () => {
      const tree = new VantagePointTree2<number>([5, 5, 5], absDiff)
      expect(tree.size()).toBe(3)
    })
  })

  // ─── size ───
  describe('size', () => {
    it('should return 0 for empty tree', () => {
      const tree = new VantagePointTree2<number>([], absDiff)
      expect(tree.size()).toBe(0)
    })

    it('should return correct count for populated tree', () => {
      const items = [10, 20, 30, 40, 50]
      const tree = new VantagePointTree2<number>(items, absDiff)
      expect(tree.size()).toBe(5)
    })
  })

  // ─── isEmpty ───
  describe('isEmpty', () => {
    it('should return true for empty tree', () => {
      const tree = new VantagePointTree2<number>([], absDiff)
      expect(tree.isEmpty()).toBe(true)
    })

    it('should return false for non-empty tree', () => {
      const tree = new VantagePointTree2<number>([1], absDiff)
      expect(tree.isEmpty()).toBe(false)
    })
  })

  // ─── contains ───
  describe('contains', () => {
    it('should return false for empty tree', () => {
      const tree = new VantagePointTree2<number>([], absDiff)
      expect(tree.contains(1)).toBe(false)
    })

    it('should return true for items that exist', () => {
      const items = [10, 20, 30]
      const tree = new VantagePointTree2<number>(items, absDiff)
      expect(tree.contains(10)).toBe(true)
      expect(tree.contains(20)).toBe(true)
      expect(tree.contains(30)).toBe(true)
    })

    it('should return false for items that do not exist', () => {
      const items = [10, 20, 30]
      const tree = new VantagePointTree2<number>(items, absDiff)
      expect(tree.contains(99)).toBe(false)
      expect(tree.contains(0)).toBe(false)
    })

    it('should find duplicate items', () => {
      const tree = new VantagePointTree2<number>([5, 5], absDiff)
      expect(tree.contains(5)).toBe(true)
    })
  })

  // ─── toArray ───
  describe('toArray', () => {
    it('should return empty array for empty tree', () => {
      const tree = new VantagePointTree2<number>([], absDiff)
      expect(tree.toArray()).toEqual([])
    })

    it('should return all inserted elements', () => {
      const items = [1, 2, 3, 4, 5]
      const tree = new VantagePointTree2<number>(items, absDiff)
      const result = tree.toArray()
      expect(result.sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5])
    })

    it('should preserve duplicates', () => {
      const items = [3, 3, 3]
      const tree = new VantagePointTree2<number>(items, absDiff)
      expect(tree.toArray().sort((a, b) => a - b)).toEqual([3, 3, 3])
    })
  })

  // ─── nearest ───
  describe('nearest', () => {
    it('should return undefined for empty tree', () => {
      const tree = new VantagePointTree2<number>([], absDiff)
      expect(tree.nearest(5)).toBeUndefined()
    })

    it('should return the only element for single-element tree', () => {
      const tree = new VantagePointTree2<number>([42], absDiff)
      expect(tree.nearest(0)).toBe(42)
    })

    it('should return the exact match when present', () => {
      const items = [1, 5, 10, 15, 20]
      const tree = new VantagePointTree2<number>(items, absDiff)
      expect(tree.nearest(10)).toBe(10)
    })

    it('should return the closest element', () => {
      const items = [0, 10, 20, 30]
      const tree = new VantagePointTree2<number>(items, absDiff)
      const result = tree.nearest(14)
      expect(result).toBe(10)
    })

    it('should work with 2D points using euclidean distance', () => {
      const points: number[][] = [
        [0, 0],
        [10, 0],
        [0, 10],
        [10, 10],
      ]
      const tree = new VantagePointTree2<number[]>(points, euclidean)
      const result = tree.nearest([9, 1])
      expect(result).toEqual([10, 0])
    })

    it('should handle query at boundary', () => {
      const items = [0, 100]
      const tree = new VantagePointTree2<number>(items, absDiff)
      const result = tree.nearest(50)
      expect(result === 0 || result === 100).toBe(true)
    })
  })

  // ─── kNearest ───
  describe('kNearest', () => {
    it('should return empty array for empty tree', () => {
      const tree = new VantagePointTree2<number>([], absDiff)
      expect(tree.kNearest(5, 3)).toEqual([])
    })

    it('should return all elements when k exceeds size', () => {
      const items = [1, 5, 10]
      const tree = new VantagePointTree2<number>(items, absDiff)
      const result = tree.kNearest(0, 10)
      expect(result.sort((a, b) => a - b)).toEqual([1, 5, 10])
    })

    it('should return k closest elements', () => {
      const items = [1, 2, 3, 4, 5]
      const tree = new VantagePointTree2<number>(items, absDiff)
      const result = tree.kNearest(3, 3)
      expect(result.sort((a, b) => a - b)).toEqual([2, 3, 4])
    })

    it('should return single element for k=1', () => {
      const items = [1, 10, 20, 30]
      const tree = new VantagePointTree2<number>(items, absDiff)
      const result = tree.kNearest(8, 1)
      expect(result).toHaveLength(1)
      expect([1, 10]).toContain(result[0])
    })

    it('should handle k equal to tree size', () => {
      const items = [1, 2, 3]
      const tree = new VantagePointTree2<number>(items, absDiff)
      const result = tree.kNearest(0, 3)
      expect(result.sort((a, b) => a - b)).toEqual([1, 2, 3])
    })
  })

  // ─── searchRadius ───
  describe('searchRadius', () => {
    it('should return empty array for empty tree', () => {
      const tree = new VantagePointTree2<number>([], absDiff)
      expect(tree.searchRadius(5, 10)).toEqual([])
    })

    it('should find elements within radius', () => {
      const items = [0, 5, 10, 15, 20]
      const tree = new VantagePointTree2<number>(items, absDiff)
      const result = tree.searchRadius(10, 5.5)
      expect(result.sort((a, b) => a - b)).toEqual([5, 10, 15])
    })

    it('should return empty when no elements within radius', () => {
      const items = [0, 100]
      const tree = new VantagePointTree2<number>(items, absDiff)
      expect(tree.searchRadius(50, 10)).toEqual([])
    })

    it('should return all elements when radius is large', () => {
      const items = [1, 2, 3]
      const tree = new VantagePointTree2<number>(items, absDiff)
      const result = tree.searchRadius(2, 100)
      expect(result.sort((a, b) => a - b)).toEqual([1, 2, 3])
    })

    it('should find exact match with radius 0', () => {
      const items = [1, 5, 10]
      const tree = new VantagePointTree2<number>(items, absDiff)
      const result = tree.searchRadius(5, 0)
      expect(result).toEqual([5])
    })

    it('should work with 2D points', () => {
      const points: number[][] = [
        [0, 0],
        [3, 4],
        [10, 0],
        [6, 8],
      ]
      const tree = new VantagePointTree2<number[]>(points, euclidean)
      const result = tree.searchRadius([0, 0], 5.1)
      expect(result.sort((a, b) => a[0] - b[0])).toEqual([
        [0, 0],
        [3, 4],
      ])
    })
  })

  // ─── Edge Cases ───
  describe('edge cases', () => {
    it('should handle string distance function', () => {
      const hamming = (a: string, b: string): number => {
        let d = 0
        for (let i = 0; i < Math.max(a.length, b.length); i++) {
          if (a[i] !== b[i]) d++
        }
        return d
      }
      const items = ['abc', 'abd', 'xyz']
      const tree = new VantagePointTree2<string>(items, hamming)
      expect(tree.size()).toBe(3)
      expect(tree.contains('abc')).toBe(true)
      expect(tree.contains('xyz')).toBe(true)
      const result = tree.nearest('abe')
      expect(result === 'abc' || result === 'abd').toBe(true)
    })

    it('should handle negative values', () => {
      const items = [-10, -5, 0, 5, 10]
      const tree = new VantagePointTree2<number>(items, absDiff)
      expect(tree.nearest(-3)).toBe(-5)
      expect(tree.contains(-10)).toBe(true)
    })

    it('should handle single-element nearest search', () => {
      const tree = new VantagePointTree2<number>([7], absDiff)
      expect(tree.nearest(0)).toBe(7)
      expect(tree.nearest(100)).toBe(7)
    })
  })
})
