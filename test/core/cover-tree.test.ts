import { describe, it, expect, beforeEach } from 'vitest'
import { CoverTree } from '../../src/core/cover-tree/index.js'
import { numberDistance, euclideanDistance2D, manhattanDistance2D } from '../../src/core/cover-tree/index.js'
import type { CoverTreeDistance, CoverTreeOptions, Point2D } from '../../src/core/cover-tree/index.js'
import { DEFAULT_COVERTREE_BASE, DEFAULT_COVERTREE_OPTIONS } from '../../src/core/cover-tree/types.js'

describe('CoverTree', () => {
  describe('constructor', () => {
    it('should create an empty tree with no arguments', () => {
      const tree = new CoverTree()
      expect(tree.size).toBe(0)
      expect(tree.isEmpty).toBe(true)
    })

    it('should create a tree with custom distance function', () => {
      const dist: CoverTreeDistance<number> = (a, b) => Math.abs(a - b)
      const tree = new CoverTree({ distance: dist })
      expect(tree.size).toBe(0)
    })

    it('should create a tree with custom base', () => {
      const tree = new CoverTree({ base: 3 })
      expect(tree.size).toBe(0)
    })

    it('should create a tree with options object', () => {
      const tree = new CoverTree<number>({ distance: numberDistance, base: 2 })
      expect(tree.size).toBe(0)
      expect(tree.isEmpty).toBe(true)
    })

    it('should use default base when not specified', () => {
      const tree = new CoverTree()
      tree.insert(1)
      tree.insert(10)
      expect(tree.size).toBe(2)
    })
  })

  describe('insert', () => {
    let tree: CoverTree<number>

    beforeEach(() => {
      tree = new CoverTree<number>()
    })

    it('should insert into empty tree', () => {
      tree.insert(5)
      expect(tree.size).toBe(1)
      expect(tree.isEmpty).toBe(false)
    })

    it('should insert multiple points', () => {
      tree.insert(1)
      tree.insert(2)
      tree.insert(3)
      expect(tree.size).toBe(3)
    })

    it('should handle duplicate points', () => {
      tree.insert(5)
      tree.insert(5)
      expect(tree.size).toBe(2)
    })

    it('should handle negative numbers', () => {
      tree.insert(-5)
      tree.insert(-10)
      tree.insert(-1)
      expect(tree.size).toBe(3)
    })

    it('should handle zero', () => {
      tree.insert(0)
      expect(tree.size).toBe(1)
      expect(tree.contains(0)).toBe(true)
    })

    it('should handle floating point numbers', () => {
      tree.insert(1.5)
      tree.insert(2.7)
      tree.insert(3.14)
      expect(tree.size).toBe(3)
    })

    it('should handle very large numbers', () => {
      tree.insert(1e10)
      tree.insert(1e10 + 1)
      expect(tree.size).toBe(2)
    })

    it('should handle very small numbers', () => {
      tree.insert(1e-10)
      tree.insert(2e-10)
      expect(tree.size).toBe(2)
    })

    it('should handle insertion of many points', () => {
      for (let i = 0; i < 100; i++) {
        tree.insert(i)
      }
      expect(tree.size).toBe(100)
    })

    it('should handle insertion in reverse order', () => {
      for (let i = 100; i >= 0; i--) {
        tree.insert(i)
      }
      expect(tree.size).toBe(101)
    })

    it('should handle insertion of same value many times', () => {
      for (let i = 0; i < 10; i++) {
        tree.insert(42)
      }
      expect(tree.size).toBe(10)
    })

    it('should handle scattered insertions', () => {
      const values = [50, 10, 90, 30, 70, 20, 80, 40, 60]
      for (const v of values) {
        tree.insert(v)
      }
      expect(tree.size).toBe(9)
    })
  })

  describe('findNearest', () => {
    it('should return undefined for empty tree', () => {
      const tree = new CoverTree<number>()
      expect(tree.findNearest(5)).toBeUndefined()
    })

    it('should return the only point in single-point tree', () => {
      const tree = new CoverTree<number>()
      tree.insert(10)
      expect(tree.findNearest(5)).toBe(10)
    })

    it('should find exact match', () => {
      const tree = new CoverTree<number>()
      tree.insert(1)
      tree.insert(5)
      tree.insert(10)
      expect(tree.findNearest(5)).toBe(5)
    })

    it('should find nearest when query is between points', () => {
      const tree = new CoverTree<number>()
      tree.insert(1)
      tree.insert(10)
      expect(tree.findNearest(3)).toBe(1)
    })

    it('should find nearest for negative numbers', () => {
      const tree = new CoverTree<number>()
      tree.insert(-10)
      tree.insert(-5)
      tree.insert(5)
      expect(tree.findNearest(-4)).toBe(-5)
    })

    it('should find nearest with many points', () => {
      const tree = new CoverTree<number>()
      for (let i = 0; i < 100; i++) {
        tree.insert(i)
      }
      expect(tree.findNearest(50.1)).toBe(50)
    })

    it('should handle query at extremes', () => {
      const tree = new CoverTree<number>()
      tree.insert(0)
      tree.insert(100)
      expect(tree.findNearest(-10)).toBe(0)
      expect(tree.findNearest(110)).toBe(100)
    })

    it('should work with floating point query', () => {
      const tree = new CoverTree<number>()
      tree.insert(1)
      tree.insert(2)
      expect(tree.findNearest(1.4)).toBe(1)
    })

    it('should work after many insertions', () => {
      const tree = new CoverTree<number>()
      for (let i = 0; i < 50; i += 2) {
        tree.insert(i)
      }
      expect(tree.findNearest(21)).toBe(20)
    })
  })

  describe('findNearest with 2D points', () => {
    let tree: CoverTree<Point2D>

    beforeEach(() => {
      tree = new CoverTree<Point2D>({ distance: euclideanDistance2D })
    })

    it('should find nearest 2D point', () => {
      tree.insert({ x: 0, y: 0 })
      tree.insert({ x: 10, y: 10 })
      tree.insert({ x: 5, y: 5 })
      const result = tree.findNearest({ x: 1, y: 1 })
      expect(result).toEqual({ x: 0, y: 0 })
    })

    it('should find exact match in 2D', () => {
      tree.insert({ x: 3, y: 4 })
      tree.insert({ x: 7, y: 8 })
      expect(tree.findNearest({ x: 3, y: 4 })).toEqual({ x: 3, y: 4 })
    })

    it('should handle single 2D point', () => {
      tree.insert({ x: 5, y: 5 })
      expect(tree.findNearest({ x: 0, y: 0 })).toEqual({ x: 5, y: 5 })
    })

    it('should find nearest with many 2D points', () => {
      for (let i = 0; i < 20; i++) {
        tree.insert({ x: i, y: i })
      }
      const result = tree.findNearest({ x: 10.1, y: 10.1 })
      expect(result).toEqual({ x: 10, y: 10 })
    })

    it('should handle negative 2D coordinates', () => {
      tree.insert({ x: -10, y: -10 })
      tree.insert({ x: 0, y: 0 })
      tree.insert({ x: 10, y: 10 })
      expect(tree.findNearest({ x: -9, y: -9 })).toEqual({ x: -10, y: -10 })
    })

    it('should work with manhattan distance', () => {
      const mTree = new CoverTree<Point2D>({ distance: manhattanDistance2D })
      mTree.insert({ x: 0, y: 0 })
      mTree.insert({ x: 3, y: 4 })
      mTree.insert({ x: 10, y: 1 })
      const result = mTree.findNearest({ x: 2, y: 2 })
      expect(result).toBeDefined()
    })
  })

  describe('findKNearest', () => {
    it('should return empty for k=0', () => {
      const tree = new CoverTree<number>()
      tree.insert(1)
      expect(tree.findKNearest(1, 0)).toEqual([])
    })

    it('should return empty for empty tree', () => {
      const tree = new CoverTree<number>()
      expect(tree.findKNearest(5, 3)).toEqual([])
    })

    it('should return single result for k=1', () => {
      const tree = new CoverTree<number>()
      tree.insert(1)
      tree.insert(5)
      tree.insert(10)
      const result = tree.findKNearest(4, 1)
      expect(result).toHaveLength(1)
      expect(result[0]).toBe(5)
    })

    it('should return k results when available', () => {
      const tree = new CoverTree<number>()
      tree.insert(0)
      tree.insert(1)
      tree.insert(2)
      tree.insert(3)
      tree.insert(4)
      const result = tree.findKNearest(2.5, 3)
      expect(result).toHaveLength(3)
    })

    it('should handle k larger than tree size', () => {
      const tree = new CoverTree<number>()
      tree.insert(1)
      tree.insert(2)
      const result = tree.findKNearest(1.5, 10)
      expect(result).toHaveLength(2)
    })

    it('should work with 2D points', () => {
      const tree = new CoverTree<Point2D>({ distance: euclideanDistance2D })
      tree.insert({ x: 0, y: 0 })
      tree.insert({ x: 1, y: 1 })
      tree.insert({ x: 2, y: 2 })
      tree.insert({ x: 3, y: 3 })
      const result = tree.findKNearest({ x: 1.5, y: 1.5 }, 2)
      expect(result).toHaveLength(2)
    })

    it('should include exact match', () => {
      const tree = new CoverTree<number>()
      tree.insert(5)
      tree.insert(10)
      tree.insert(15)
      const result = tree.findKNearest(10, 1)
      expect(result).toHaveLength(1)
      expect(result[0]).toBe(10)
    })
  })

  describe('contains', () => {
    let tree: CoverTree<number>

    beforeEach(() => {
      tree = new CoverTree<number>()
      tree.insert(1)
      tree.insert(5)
      tree.insert(10)
    })

    it('should find existing point', () => {
      expect(tree.contains(5)).toBe(true)
    })

    it('should find first point', () => {
      expect(tree.contains(1)).toBe(true)
    })

    it('should find last point', () => {
      expect(tree.contains(10)).toBe(true)
    })

    it('should not find non-existing point', () => {
      expect(tree.contains(7)).toBe(false)
    })

    it('should return false for empty tree', () => {
      const empty = new CoverTree<number>()
      expect(empty.contains(1)).toBe(false)
    })

    it('should work after clear and re-insert', () => {
      tree.clear()
      expect(tree.contains(5)).toBe(false)
      tree.insert(5)
      expect(tree.contains(5)).toBe(true)
    })

    it('should find negative numbers', () => {
      tree.insert(-5)
      expect(tree.contains(-5)).toBe(true)
      expect(tree.contains(-3)).toBe(false)
    })

    it('should find floating point', () => {
      tree.insert(3.14)
      expect(tree.contains(3.14)).toBe(true)
    })
  })

  describe('contains with 2D', () => {
    it('should find 2D points', () => {
      const tree = new CoverTree<Point2D>({ distance: euclideanDistance2D })
      tree.insert({ x: 1, y: 2 })
      tree.insert({ x: 3, y: 4 })
      expect(tree.contains({ x: 1, y: 2 })).toBe(true)
      expect(tree.contains({ x: 3, y: 4 })).toBe(true)
      expect(tree.contains({ x: 5, y: 6 })).toBe(false)
    })
  })

  describe('remove', () => {
    let tree: CoverTree<number>

    beforeEach(() => {
      tree = new CoverTree<number>()
      tree.insert(1)
      tree.insert(5)
      tree.insert(10)
    })

    it('should remove existing point', () => {
      expect(tree.remove(5)).toBe(true)
      expect(tree.size).toBe(2)
      expect(tree.contains(5)).toBe(false)
    })

    it('should return false for non-existing point', () => {
      expect(tree.remove(7)).toBe(false)
      expect(tree.size).toBe(3)
    })

    it('should remove first point', () => {
      expect(tree.remove(1)).toBe(true)
      expect(tree.size).toBe(2)
    })

    it('should remove last point', () => {
      expect(tree.remove(10)).toBe(true)
      expect(tree.size).toBe(2)
    })

    it('should remove all points one by one', () => {
      tree.remove(1)
      tree.remove(5)
      tree.remove(10)
      expect(tree.size).toBe(0)
      expect(tree.isEmpty).toBe(true)
    })

    it('should handle remove from empty tree', () => {
      const empty = new CoverTree<number>()
      expect(empty.remove(1)).toBe(false)
    })

    it('should handle remove from single element tree', () => {
      const single = new CoverTree<number>()
      single.insert(42)
      expect(single.remove(42)).toBe(true)
      expect(single.size).toBe(0)
      expect(single.isEmpty).toBe(true)
    })

    it('should allow re-insertion after remove', () => {
      tree.remove(5)
      tree.insert(5)
      expect(tree.size).toBe(3)
      expect(tree.contains(5)).toBe(true)
    })

    it('should maintain other points after remove', () => {
      tree.remove(5)
      expect(tree.contains(1)).toBe(true)
      expect(tree.contains(10)).toBe(true)
    })

    it('should handle remove with many points', () => {
      for (let i = 20; i < 30; i++) {
        tree.insert(i)
      }
      expect(tree.remove(25)).toBe(true)
      expect(tree.size).toBe(12)
    })
  })

  describe('size', () => {
    it('should return 0 for empty tree', () => {
      const tree = new CoverTree<number>()
      expect(tree.size).toBe(0)
    })

    it('should return 1 after single insert', () => {
      const tree = new CoverTree<number>()
      tree.insert(1)
      expect(tree.size).toBe(1)
    })

    it('should increment with each insert', () => {
      const tree = new CoverTree<number>()
      tree.insert(1)
      expect(tree.size).toBe(1)
      tree.insert(2)
      expect(tree.size).toBe(2)
      tree.insert(3)
      expect(tree.size).toBe(3)
    })

    it('should decrement on remove', () => {
      const tree = new CoverTree<number>()
      tree.insert(1)
      tree.insert(2)
      tree.remove(1)
      expect(tree.size).toBe(1)
    })

    it('should reflect duplicates', () => {
      const tree = new CoverTree<number>()
      tree.insert(5)
      tree.insert(5)
      expect(tree.size).toBe(2)
    })
  })

  describe('isEmpty', () => {
    it('should return true for new tree', () => {
      expect(new CoverTree().isEmpty).toBe(true)
    })

    it('should return false after insert', () => {
      const tree = new CoverTree<number>()
      tree.insert(1)
      expect(tree.isEmpty).toBe(false)
    })

    it('should return true after removing all', () => {
      const tree = new CoverTree<number>()
      tree.insert(1)
      tree.remove(1)
      expect(tree.isEmpty).toBe(true)
    })

    it('should return true after clear', () => {
      const tree = new CoverTree<number>()
      tree.insert(1)
      tree.insert(2)
      tree.clear()
      expect(tree.isEmpty).toBe(true)
    })
  })

  describe('clear', () => {
    it('should clear the tree', () => {
      const tree = new CoverTree<number>()
      tree.insert(1)
      tree.insert(2)
      tree.insert(3)
      tree.clear()
      expect(tree.size).toBe(0)
      expect(tree.isEmpty).toBe(true)
    })

    it('should work on empty tree', () => {
      const tree = new CoverTree<number>()
      tree.clear()
      expect(tree.size).toBe(0)
    })

    it('should allow insertions after clear', () => {
      const tree = new CoverTree<number>()
      tree.insert(1)
      tree.clear()
      tree.insert(5)
      expect(tree.size).toBe(1)
      expect(tree.contains(5)).toBe(true)
    })

    it('should clear findNearest results', () => {
      const tree = new CoverTree<number>()
      tree.insert(10)
      tree.clear()
      expect(tree.findNearest(5)).toBeUndefined()
    })
  })

  describe('toArray', () => {
    it('should return empty array for empty tree', () => {
      const tree = new CoverTree<number>()
      expect(tree.toArray()).toEqual([])
    })

    it('should return single element', () => {
      const tree = new CoverTree<number>()
      tree.insert(5)
      expect(tree.toArray()).toEqual([5])
    })

    it('should return all elements', () => {
      const tree = new CoverTree<number>()
      tree.insert(1)
      tree.insert(2)
      tree.insert(3)
      const arr = tree.toArray()
      expect(arr).toHaveLength(3)
      expect(arr).toContain(1)
      expect(arr).toContain(2)
      expect(arr).toContain(3)
    })

    it('should reflect removals', () => {
      const tree = new CoverTree<number>()
      tree.insert(1)
      tree.insert(2)
      tree.insert(3)
      tree.remove(2)
      const arr = tree.toArray()
      expect(arr).toHaveLength(2)
      expect(arr).not.toContain(2)
    })

    it('should reflect clear', () => {
      const tree = new CoverTree<number>()
      tree.insert(1)
      tree.insert(2)
      tree.clear()
      expect(tree.toArray()).toEqual([])
    })

    it('should return all with many points', () => {
      const tree = new CoverTree<number>()
      for (let i = 0; i < 50; i++) {
        tree.insert(i)
      }
      expect(tree.toArray()).toHaveLength(50)
    })
  })

  describe('[Symbol.iterator]', () => {
    it('should be iterable', () => {
      const tree = new CoverTree<number>()
      tree.insert(1)
      tree.insert(2)
      const result = [...tree]
      expect(result).toHaveLength(2)
    })

    it('should work with for...of', () => {
      const tree = new CoverTree<number>()
      tree.insert(10)
      tree.insert(20)
      tree.insert(30)
      const collected: number[] = []
      for (const p of tree) {
        collected.push(p)
      }
      expect(collected).toHaveLength(3)
    })

    it('should handle empty tree', () => {
      const tree = new CoverTree<number>()
      const result = [...tree]
      expect(result).toEqual([])
    })

    it('should iterate all inserted values', () => {
      const tree = new CoverTree<number>()
      tree.insert(5)
      tree.insert(10)
      tree.insert(15)
      const result = [...tree]
      expect(result).toContain(5)
      expect(result).toContain(10)
      expect(result).toContain(15)
    })
  })

  describe('static fromPoints', () => {
    it('should create tree from number points', () => {
      const tree = CoverTree.fromPoints([1, 2, 3, 4, 5])
      expect(tree.size).toBe(5)
    })

    it('should create empty tree from empty array', () => {
      const tree = CoverTree.fromPoints([])
      expect(tree.isEmpty).toBe(true)
    })

    it('should create tree with custom options', () => {
      const tree = CoverTree.fromPoints([1, 2, 3], { base: 3 })
      expect(tree.size).toBe(3)
    })

    it('should create tree with 2D points', () => {
      const points: Point2D[] = [{ x: 0, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 2 }]
      const tree = CoverTree.fromPoints(points, { distance: euclideanDistance2D })
      expect(tree.size).toBe(3)
    })

    it('should work with single point', () => {
      const tree = CoverTree.fromPoints([42])
      expect(tree.size).toBe(1)
      expect(tree.contains(42)).toBe(true)
    })
  })

  describe('custom distance function', () => {
    it('should work with custom distance', () => {
      const customDist: CoverTreeDistance<number> = (a, b) => Math.abs(a - b) * 2
      const tree = new CoverTree<number>({ distance: customDist })
      tree.insert(1)
      tree.insert(5)
      tree.insert(10)
      expect(tree.findNearest(4)).toBe(5)
    })

    it('should work with squared distance', () => {
      const squaredDist: CoverTreeDistance<number> = (a, b) => (a - b) * (a - b)
      const tree = new CoverTree<number>({ distance: squaredDist })
      tree.insert(1)
      tree.insert(5)
      tree.insert(10)
      expect(tree.findNearest(3)).toBe(1)
    })

    it('should work with string distance', () => {
      const stringDist: CoverTreeDistance<string> = (a, b) => {
        if (a === b) return 0
        return a < b ? b.charCodeAt(0) - a.charCodeAt(0) : a.charCodeAt(0) - b.charCodeAt(0)
      }
      const tree = new CoverTree<string>({ distance: stringDist })
      tree.insert('a')
      tree.insert('c')
      tree.insert('e')
      expect(tree.findNearest('b')).toBe('a')
    })

    it('should work with custom base', () => {
      const tree = new CoverTree<number>({ base: 3 })
      for (let i = 0; i < 20; i++) {
        tree.insert(i)
      }
      expect(tree.size).toBe(20)
      expect(tree.findNearest(10)).toBe(10)
    })

    it('should work with base 10', () => {
      const tree = new CoverTree<number>({ base: 10 })
      tree.insert(1)
      tree.insert(50)
      tree.insert(100)
      expect(tree.findNearest(45)).toBe(50)
    })
  })

  describe('edge cases', () => {
    it('should handle single point tree', () => {
      const tree = new CoverTree<number>()
      tree.insert(42)
      expect(tree.findNearest(0)).toBe(42)
      expect(tree.findNearest(100)).toBe(42)
      expect(tree.contains(42)).toBe(true)
      expect(tree.contains(43)).toBe(false)
    })

    it('should handle duplicate insertions', () => {
      const tree = new CoverTree<number>()
      tree.insert(5)
      tree.insert(5)
      tree.insert(5)
      expect(tree.size).toBe(3)
      expect(tree.contains(5)).toBe(true)
    })

    it('should handle large dataset', () => {
      const tree = new CoverTree<number>()
      for (let i = 0; i < 1000; i++) {
        tree.insert(i)
      }
      expect(tree.size).toBe(1000)
      expect(tree.findNearest(500)).toBe(500)
      expect(tree.contains(999)).toBe(true)
      expect(tree.contains(1000)).toBe(false)
    })

    it('should handle alternating insertions', () => {
      const tree = new CoverTree<number>()
      tree.insert(0)
      tree.insert(100)
      tree.insert(50)
      tree.insert(25)
      tree.insert(75)
      expect(tree.size).toBe(5)
      expect(tree.findNearest(26)).toBe(25)
    })

    it('should handle very close points', () => {
      const tree = new CoverTree<number>()
      tree.insert(1)
      tree.insert(1.0001)
      tree.insert(1.0002)
      expect(tree.size).toBe(3)
      expect(tree.contains(1)).toBe(true)
      expect(tree.contains(1.0001)).toBe(true)
    })

    it('should handle all same points', () => {
      const tree = new CoverTree<number>()
      for (let i = 0; i < 5; i++) {
        tree.insert(7)
      }
      expect(tree.size).toBe(5)
      expect(tree.findNearest(7)).toBe(7)
    })

    it('should handle negative range', () => {
      const tree = new CoverTree<number>()
      for (let i = -50; i <= 50; i++) {
        tree.insert(i)
      }
      expect(tree.size).toBe(101)
      expect(tree.findNearest(-1)).toBe(-1)
      expect(tree.findNearest(-2)).toBe(-2)
    })

    it('should handle sparse points', () => {
      const tree = new CoverTree<number>()
      tree.insert(0)
      tree.insert(1000)
      tree.insert(1)
      const result = tree.findNearest(750)
      expect(result).toBe(1000)
    })

    it('should handle reverse insertion order', () => {
      const tree = new CoverTree<number>()
      for (let i = 100; i >= 0; i--) {
        tree.insert(i)
      }
      expect(tree.size).toBe(101)
      expect(tree.contains(50)).toBe(true)
    })
  })

  describe('2D comprehensive', () => {
    let tree: CoverTree<Point2D>

    beforeEach(() => {
      tree = new CoverTree<Point2D>({ distance: euclideanDistance2D })
      tree.insert({ x: 0, y: 0 })
      tree.insert({ x: 10, y: 10 })
      tree.insert({ x: 5, y: 5 })
      tree.insert({ x: -5, y: -5 })
      tree.insert({ x: 15, y: 0 })
    })

    it('should find nearest in grid', () => {
      expect(tree.findNearest({ x: 1, y: 1 })).toEqual({ x: 0, y: 0 })
    })

    it('should find nearest at negative coords', () => {
      expect(tree.findNearest({ x: -4, y: -4 })).toEqual({ x: -5, y: -5 })
    })

    it('should find nearest at edge', () => {
      expect(tree.findNearest({ x: 14, y: 0 })).toEqual({ x: 15, y: 0 })
    })

    it('should handle contains for 2D', () => {
      expect(tree.contains({ x: 5, y: 5 })).toBe(true)
      expect(tree.contains({ x: 6, y: 6 })).toBe(false)
    })

    it('should remove 2D point', () => {
      expect(tree.remove({ x: 5, y: 5 })).toBe(true)
      expect(tree.size).toBe(4)
      expect(tree.contains({ x: 5, y: 5 })).toBe(false)
    })

    it('should toArray all 2D points', () => {
      const arr = tree.toArray()
      expect(arr).toHaveLength(5)
    })

    it('should find k nearest in 2D', () => {
      const result = tree.findKNearest({ x: 4, y: 4 }, 3)
      expect(result).toHaveLength(3)
    })

    it('should iterate 2D points', () => {
      const result = [...tree]
      expect(result).toHaveLength(5)
    })
  })

  describe('immutability', () => {
    it('findNearest should not modify tree', () => {
      const tree = new CoverTree<number>()
      tree.insert(5)
      tree.findNearest(3)
      expect(tree.contains(5)).toBe(true)
    })

    it('toArray should return snapshot', () => {
      const tree = new CoverTree<number>()
      tree.insert(1)
      const arr = tree.toArray()
      tree.insert(2)
      expect(arr).toHaveLength(1)
    })

    it('iterator should not be affected by later mutations', () => {
      const tree = new CoverTree<number>()
      tree.insert(1)
      const result = [...tree]
      tree.insert(2)
      expect(result).toHaveLength(1)
    })
  })

  describe('remove comprehensive', () => {
    it('should handle removing root', () => {
      const tree = new CoverTree<number>()
      tree.insert(5)
      tree.insert(3)
      tree.insert(7)
      const first = tree.toArray()[0]!
      tree.remove(first)
      expect(tree.size).toBe(2)
    })

    it('should handle remove and re-find', () => {
      const tree = new CoverTree<number>()
      tree.insert(1)
      tree.insert(5)
      tree.insert(10)
      tree.remove(5)
      expect(tree.findNearest(4)).toBe(1)
    })

    it('should handle remove with only one element', () => {
      const tree = new CoverTree<number>()
      tree.insert(42)
      tree.remove(42)
      expect(tree.findNearest(1)).toBeUndefined()
      expect(tree.toArray()).toEqual([])
    })

    it('should handle remove with 2D points', () => {
      const tree = new CoverTree<Point2D>({ distance: euclideanDistance2D })
      tree.insert({ x: 1, y: 1 })
      tree.insert({ x: 2, y: 2 })
      tree.remove({ x: 1, y: 1 })
      expect(tree.size).toBe(1)
      expect(tree.contains({ x: 2, y: 2 })).toBe(true)
    })
  })

  describe('findKNearest comprehensive', () => {
    it('should return sorted results for numbers', () => {
      const tree = new CoverTree<number>()
      tree.insert(0)
      tree.insert(5)
      tree.insert(10)
      tree.insert(15)
      tree.insert(20)
      const result = tree.findKNearest(10, 3)
      expect(result).toContain(10)
    })

    it('should handle k=1', () => {
      const tree = new CoverTree<number>()
      tree.insert(1)
      tree.insert(2)
      tree.insert(3)
      const result = tree.findKNearest(2.5, 1)
      expect(result).toHaveLength(1)
      expect([2, 3]).toContain(result[0])
    })

    it('should handle negative k', () => {
      const tree = new CoverTree<number>()
      tree.insert(1)
      expect(tree.findKNearest(1, -1)).toEqual([])
    })

    it('should handle k equal to size', () => {
      const tree = new CoverTree<number>()
      tree.insert(1)
      tree.insert(2)
      tree.insert(3)
      const result = tree.findKNearest(2, 3)
      expect(result).toHaveLength(3)
    })
  })
})

describe('types exports', () => {
  it('should export numberDistance', () => {
    expect(numberDistance(0, 5)).toBe(5)
  })

  it('should export euclideanDistance2D', () => {
    expect(euclideanDistance2D({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5)
  })

  it('should export manhattanDistance2D', () => {
    expect(manhattanDistance2D({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(7)
  })

  it('should export DEFAULT_COVERTREE_BASE', () => {
    expect(DEFAULT_COVERTREE_BASE).toBe(2)
  })

  it('should export DEFAULT_COVERTREE_OPTIONS', () => {
    expect(DEFAULT_COVERTREE_OPTIONS.base).toBe(2)
    expect(typeof DEFAULT_COVERTREE_OPTIONS.distance).toBe('function')
  })
})

describe('distance functions', () => {
  describe('numberDistance', () => {
    it('should return 0 for same point', () => {
      expect(numberDistance(5, 5)).toBe(0)
    })

    it('should return absolute difference', () => {
      expect(numberDistance(3, 7)).toBe(4)
    })

    it('should handle negative numbers', () => {
      expect(numberDistance(-3, 2)).toBe(5)
    })

    it('should handle zero', () => {
      expect(numberDistance(0, 0)).toBe(0)
    })
  })

  describe('euclideanDistance2D', () => {
    it('should return 0 for same point', () => {
      expect(euclideanDistance2D({ x: 3, y: 4 }, { x: 3, y: 4 })).toBe(0)
    })

    it('should compute 3-4-5 triangle', () => {
      expect(euclideanDistance2D({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5)
    })

    it('should handle negative coordinates', () => {
      expect(euclideanDistance2D({ x: -3, y: -4 }, { x: 0, y: 0 })).toBe(5)
    })
  })

  describe('manhattanDistance2D', () => {
    it('should return 0 for same point', () => {
      expect(manhattanDistance2D({ x: 1, y: 2 }, { x: 1, y: 2 })).toBe(0)
    })

    it('should compute manhattan distance', () => {
      expect(manhattanDistance2D({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(7)
    })

    it('should handle negative coordinates', () => {
      expect(manhattanDistance2D({ x: -1, y: -1 }, { x: 2, y: 3 })).toBe(7)
    })
  })
})

describe('CoverTree type safety', () => {
  it('should work with default number type', () => {
    const tree = new CoverTree()
    tree.insert(5)
    expect(tree.findNearest(3)).toBe(5)
  })

  it('should work with explicit number type', () => {
    const tree = new CoverTree<number>()
    tree.insert(5)
    expect(tree.findNearest(3)).toBe(5)
  })

  it('should work with Point2D type', () => {
    const tree = new CoverTree<Point2D>({ distance: euclideanDistance2D })
    tree.insert({ x: 1, y: 2 })
    expect(tree.findNearest({ x: 0, y: 0 })).toEqual({ x: 1, y: 2 })
  })

  it('should work with object type', () => {
    type Vec3 = { x: number; y: number; z: number }
    const dist3d: CoverTreeDistance<Vec3> = (a, b) => {
      const dx = a.x - b.x
      const dy = a.y - b.y
      const dz = a.z - b.z
      return Math.sqrt(dx * dx + dy * dy + dz * dz)
    }
    const tree = new CoverTree<Vec3>({ distance: dist3d })
    tree.insert({ x: 0, y: 0, z: 0 })
    tree.insert({ x: 1, y: 1, z: 1 })
    tree.insert({ x: 10, y: 10, z: 10 })
    expect(tree.findNearest({ x: 0.5, y: 0.5, z: 0.5 })).toEqual({ x: 0, y: 0, z: 0 })
  })

  it('should work with custom type', () => {
    type NamedPoint = { name: string; value: number }
    const dist: CoverTreeDistance<NamedPoint> = (a, b) => Math.abs(a.value - b.value)
    const tree = new CoverTree<NamedPoint>({ distance: dist })
    tree.insert({ name: 'a', value: 1 })
    tree.insert({ name: 'b', value: 5 })
    tree.insert({ name: 'c', value: 10 })
    const result = tree.findNearest({ name: 'query', value: 4 })
    expect(result?.name).toBe('b')
  })

  it('should handle fromPoints with distance function', () => {
    const tree = CoverTree.fromPoints([1, 5, 10, 15, 20])
    expect(tree.size).toBe(5)
    expect(tree.findNearest(12)).toBe(10)
  })

  it('should handle fromPoints with custom options', () => {
    const tree = CoverTree.fromPoints<number>([1, 2, 3], { base: 3 })
    expect(tree.size).toBe(3)
  })

  it('should handle iterator on large tree', () => {
    const tree = new CoverTree<number>()
    for (let i = 0; i < 50; i++) tree.insert(i)
    let count = 0
    for (const _p of tree) count++
    expect(count).toBe(50)
  })

  it('should handle spread operator', () => {
    const tree = new CoverTree<number>()
    tree.insert(1)
    tree.insert(2)
    tree.insert(3)
    const arr = [...tree]
    expect(arr).toHaveLength(3)
    expect(arr).toContain(1)
    expect(arr).toContain(2)
    expect(arr).toContain(3)
  })

  it('should handle findNearest with many equidistant points', () => {
    const tree = new CoverTree<number>()
    tree.insert(0)
    tree.insert(10)
    tree.insert(20)
    const nearest = tree.findNearest(10)!
    expect(Math.abs(nearest - 10)).toBe(0)
  })

  it('should handle findKNearest with all equidistant', () => {
    const tree = new CoverTree<number>()
    tree.insert(0)
    tree.insert(10)
    tree.insert(20)
    const results = tree.findKNearest(10, 3)
    expect(results).toHaveLength(3)
    expect(results[0]).toBe(10)
  })

  it('should handle insert after removing all from large tree', () => {
    const tree = new CoverTree<number>()
    for (let i = 0; i < 50; i++) tree.insert(i)
    for (let i = 0; i < 50; i++) tree.remove(i)
    expect(tree.size).toBe(0)
    tree.insert(999)
    expect(tree.size).toBe(1)
    expect(tree.findNearest(0)).toBe(999)
  })

  it('should handle 2D remove preserving remaining points', () => {
    const tree = new CoverTree<Point2D>({ distance: euclideanDistance2D })
    tree.insert({ x: 0, y: 0 })
    tree.insert({ x: 5, y: 5 })
    tree.insert({ x: 10, y: 10 })
    tree.remove({ x: 5, y: 5 })
    const arr = tree.toArray()
    expect(arr).toHaveLength(2)
    expect(tree.contains({ x: 0, y: 0 })).toBe(true)
    expect(tree.contains({ x: 10, y: 10 })).toBe(true)
  })

  it('should handle findKNearest with k equal to size', () => {
    const tree = new CoverTree<number>()
    tree.insert(10)
    tree.insert(20)
    tree.insert(30)
    const results = tree.findKNearest(20, 3)
    expect(results).toHaveLength(3)
  })

  it('should handle DEFAULT_COVERTREE_BASE export', () => {
    expect(DEFAULT_COVERTREE_BASE).toBe(2)
  })

  it('should handle DEFAULT_COVERTREE_OPTIONS export', () => {
    expect(DEFAULT_COVERTREE_OPTIONS.base).toBe(2)
    expect(typeof DEFAULT_COVERTREE_OPTIONS.distance).toBe('function')
  })
})
