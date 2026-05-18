import { describe, it, expect } from 'vitest'
import { CoverTree, numberDistance, euclideanDistance2D, manhattanDistance2D } from '../../src/core/cover-tree/index.js'
import type { Point2D } from '../../src/core/cover-tree/types.js'

// ─── Constructor ───

describe('CoverTree', () => {
  describe('constructor', () => {
    it('should create an empty tree', () => {
      const tree = new CoverTree<number>()
      expect(tree.size).toBe(0)
      expect(tree.isEmpty).toBe(true)
    })

    it('should accept custom distance function', () => {
      const tree = new CoverTree<string>({
        distance: (a, b) => Math.abs(a.length - b.length),
      })
      tree.insert('hi')
      tree.insert('hello')
      expect(tree.size).toBe(2)
    })

    it('should accept custom base', () => {
      const tree = new CoverTree<number>({ base: 3 })
      tree.insert(1)
      expect(tree.size).toBe(1)
    })
  })

  // ─── insert ───

  describe('insert', () => {
    it('should insert a single point', () => {
      const tree = new CoverTree<number>()
      tree.insert(5)
      expect(tree.size).toBe(1)
      expect(tree.isEmpty).toBe(false)
    })

    it('should insert multiple points', () => {
      const tree = new CoverTree<number>()
      tree.insert(1)
      tree.insert(5)
      tree.insert(10)
      expect(tree.size).toBe(3)
    })

    it('should handle duplicate points', () => {
      const tree = new CoverTree<number>()
      tree.insert(5)
      tree.insert(5)
      expect(tree.size).toBe(2)
    })
  })

  // ─── findNearest ───

  describe('findNearest', () => {
    it('should return undefined for empty tree', () => {
      const tree = new CoverTree<number>()
      expect(tree.findNearest(1)).toBeUndefined()
    })

    it('should return the only point in single-point tree', () => {
      const tree = new CoverTree<number>()
      tree.insert(5)
      expect(tree.findNearest(3)).toBe(5)
    })

    it('should find the exact nearest neighbor', () => {
      const tree = new CoverTree<number>()
      tree.insert(1)
      tree.insert(5)
      tree.insert(10)
      tree.insert(20)
      expect(tree.findNearest(6)).toBe(5)
    })

    it('should return exact point when it exists', () => {
      const tree = new CoverTree<number>()
      tree.insert(1)
      tree.insert(5)
      tree.insert(10)
      expect(tree.findNearest(5)).toBe(5)
    })
  })

  // ─── findKNearest ───

  describe('findKNearest', () => {
    it('should return empty array for empty tree', () => {
      const tree = new CoverTree<number>()
      expect(tree.findKNearest(1, 3)).toEqual([])
    })

    it('should return empty array for k <= 0', () => {
      const tree = new CoverTree<number>()
      tree.insert(5)
      expect(tree.findKNearest(1, 0)).toEqual([])
      expect(tree.findKNearest(1, -1)).toEqual([])
    })

    it('should find k nearest neighbors', () => {
      const tree = new CoverTree<number>()
      const points = [1, 5, 10, 20, 50]
      for (const p of points) tree.insert(p)
      const nearest = tree.findKNearest(8, 3)
      expect(nearest.length).toBe(3)
      expect(nearest).toContain(5)
      expect(nearest).toContain(10)
      expect(nearest).toContain(1)
    })

    it('should return all points if k exceeds tree size', () => {
      const tree = new CoverTree<number>()
      tree.insert(1)
      tree.insert(5)
      const result = tree.findKNearest(3, 10)
      expect(result.length).toBe(2)
    })
  })

  // ─── contains ───

  describe('contains', () => {
    it('should return false for empty tree', () => {
      const tree = new CoverTree<number>()
      expect(tree.contains(1)).toBe(false)
    })

    it('should find an existing point', () => {
      const tree = new CoverTree<number>()
      tree.insert(42)
      expect(tree.contains(42)).toBe(true)
    })

    it('should return false for non-existing point', () => {
      const tree = new CoverTree<number>()
      tree.insert(1)
      tree.insert(5)
      tree.insert(10)
      expect(tree.contains(7)).toBe(false)
    })

    it('should handle duplicate points', () => {
      const tree = new CoverTree<number>()
      tree.insert(5)
      tree.insert(5)
      expect(tree.contains(5)).toBe(true)
    })
  })

  // ─── remove ───

  describe('remove', () => {
    it('should return false for empty tree', () => {
      const tree = new CoverTree<number>()
      expect(tree.remove(1)).toBe(false)
    })

    it('should remove an existing point', () => {
      const tree = new CoverTree<number>()
      tree.insert(5)
      expect(tree.remove(5)).toBe(true)
      expect(tree.size).toBe(0)
      expect(tree.contains(5)).toBe(false)
    })

    it('should return false for non-existing point', () => {
      const tree = new CoverTree<number>()
      tree.insert(1)
      tree.insert(5)
      expect(tree.remove(3)).toBe(false)
    })

    it('should maintain tree integrity after removal', () => {
      const tree = new CoverTree<number>()
      tree.insert(1)
      tree.insert(5)
      tree.insert(10)
      tree.remove(5)
      expect(tree.contains(1)).toBe(true)
      expect(tree.contains(10)).toBe(true)
      expect(tree.size).toBe(2)
    })
  })

  // ─── clear ───

  describe('clear', () => {
    it('should remove all points', () => {
      const tree = new CoverTree<number>()
      tree.insert(1)
      tree.insert(2)
      tree.insert(3)
      tree.clear()
      expect(tree.size).toBe(0)
      expect(tree.isEmpty).toBe(true)
    })

    it('should allow insertions after clear', () => {
      const tree = new CoverTree<number>()
      tree.insert(1)
      tree.clear()
      tree.insert(2)
      expect(tree.size).toBe(1)
      expect(tree.contains(2)).toBe(true)
    })
  })

  // ─── toArray ───

  describe('toArray', () => {
    it('should return empty array for empty tree', () => {
      const tree = new CoverTree<number>()
      expect(tree.toArray()).toEqual([])
    })

    it('should return all inserted points', () => {
      const tree = new CoverTree<number>()
      tree.insert(1)
      tree.insert(5)
      tree.insert(10)
      const arr = tree.toArray()
      expect(arr).toHaveLength(3)
      expect(arr).toContain(1)
      expect(arr).toContain(5)
      expect(arr).toContain(10)
    })
  })

  // ─── iterator ───

  describe('iterator', () => {
    it('should iterate over all points', () => {
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

    it('should not iterate on empty tree', () => {
      const tree = new CoverTree<number>()
      const collected: number[] = []
      for (const p of tree) {
        collected.push(p)
      }
      expect(collected).toHaveLength(0)
    })
  })

  // ─── fromPoints ───

  describe('fromPoints', () => {
    it('should create a tree from an array of points', () => {
      const tree = CoverTree.fromPoints([1, 5, 10, 20])
      expect(tree.size).toBe(4)
    })

    it('should handle empty array', () => {
      const tree = CoverTree.fromPoints([])
      expect(tree.size).toBe(0)
    })

    it('should accept options', () => {
      const tree = CoverTree.fromPoints([1, 5], { base: 3 })
      expect(tree.size).toBe(2)
    })
  })

  // ─── Custom Distance Functions ───

  describe('custom distance functions', () => {
    it('should work with euclideanDistance2D', () => {
      const tree = new CoverTree<Point2D>({ distance: euclideanDistance2D })
      tree.insert({ x: 0, y: 0 })
      tree.insert({ x: 10, y: 10 })
      tree.insert({ x: 3, y: 4 })
      const nearest = tree.findNearest({ x: 2, y: 2 })
      expect(nearest).toEqual({ x: 3, y: 4 })
    })

    it('should work with manhattanDistance2D', () => {
      const tree = new CoverTree<Point2D>({ distance: manhattanDistance2D })
      tree.insert({ x: 0, y: 0 })
      tree.insert({ x: 5, y: 5 })
      const nearest = tree.findNearest({ x: 1, y: 1 })
      expect(nearest).toEqual({ x: 0, y: 0 })
    })

    it('should export numberDistance utility', () => {
      expect(numberDistance(3, 7)).toBe(4)
      expect(numberDistance(7, 3)).toBe(4)
      expect(numberDistance(5, 5)).toBe(0)
    })
  })

  // ─── Edge Cases ───

  describe('edge cases', () => {
    it('should handle negative numbers', () => {
      const tree = new CoverTree<number>()
      tree.insert(-10)
      tree.insert(-5)
      tree.insert(0)
      tree.insert(5)
      expect(tree.findNearest(-3)).toBe(-5)
    })

    it('should handle single element nearest search after many operations', () => {
      const tree = new CoverTree<number>()
      tree.insert(1)
      tree.insert(100)
      tree.insert(50)
      tree.remove(100)
      expect(tree.findNearest(90)).toBe(50)
    })
  })
})
