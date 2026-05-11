import { describe, it, expect } from 'vitest'
import { KDTree } from '../../src/core/kd-tree-2/index.js'
import type { KDPoint, KDRect } from '../../src/core/kd-tree-2/types.js'

function pt(...coords: number[]): KDPoint {
  return coords
}

function rect(min: number[], max: number[]): KDRect {
  return { min, max }
}

function pointsEqual(a: KDPoint[], b: KDPoint[]): boolean {
  if (a.length !== b.length) return false
  const as = [...a].sort((p, q) => p[0]! - q[0]! || p[1]! - q[1]!)
  const bs = [...b].sort((p, q) => p[0]! - q[0]! || p[1]! - q[1]!)
  for (let i = 0; i < as.length; i++) {
    for (let j = 0; j < as[i]!.length; j++) {
      if (as[i]![j] !== bs[i]![j]) return false
    }
  }
  return true
}

describe('KDTree', () => {
  describe('constructor', () => {
    it('creates a KDTree with default 2 dimensions', () => {
      const tree = new KDTree()
      expect(tree.dimensions).toBe(2)
      expect(tree.size).toBe(0)
      expect(tree.isEmpty()).toBe(true)
    })

    it('creates a KDTree with custom dimensions', () => {
      const tree = new KDTree({ dimensions: 3 })
      expect(tree.dimensions).toBe(3)
    })

    it('creates a KDTree with 1 dimension', () => {
      const tree = new KDTree({ dimensions: 1 })
      expect(tree.dimensions).toBe(1)
    })

    it('creates a KDTree with 4 dimensions', () => {
      const tree = new KDTree({ dimensions: 4 })
      expect(tree.dimensions).toBe(4)
    })
  })

  describe('insert', () => {
    it('inserts a 2D point', () => {
      const tree = new KDTree()
      expect(tree.insert(pt(5, 5))).toBe(true)
      expect(tree.size).toBe(1)
    })

    it('inserts a 3D point', () => {
      const tree = new KDTree({ dimensions: 3 })
      expect(tree.insert(pt(1, 2, 3))).toBe(true)
      expect(tree.size).toBe(1)
    })

    it('rejects point with wrong dimensions', () => {
      const tree = new KDTree()
      expect(tree.insert(pt(1, 2, 3))).toBe(false)
      expect(tree.size).toBe(0)
    })

    it('inserts multiple points', () => {
      const tree = new KDTree()
      tree.insert(pt(3, 6))
      tree.insert(pt(17, 15))
      tree.insert(pt(13, 15))
      tree.insert(pt(6, 12))
      tree.insert(pt(9, 1))
      tree.insert(pt(2, 7))
      tree.insert(pt(10, 19))
      expect(tree.size).toBe(7)
    })

    it('inserts duplicate points', () => {
      const tree = new KDTree()
      tree.insert(pt(5, 5))
      tree.insert(pt(5, 5))
      expect(tree.size).toBe(2)
    })

    it('inserts points with negative coordinates', () => {
      const tree = new KDTree()
      expect(tree.insert(pt(-5, -5))).toBe(true)
      expect(tree.insert(pt(-10, 3))).toBe(true)
      expect(tree.size).toBe(2)
    })

    it('inserts point with zero coordinates', () => {
      const tree = new KDTree()
      expect(tree.insert(pt(0, 0))).toBe(true)
      expect(tree.size).toBe(1)
    })

    it('inserts floating point coordinates', () => {
      const tree = new KDTree()
      expect(tree.insert(pt(1.5, 2.7))).toBe(true)
      expect(tree.size).toBe(1)
    })

    it('inserts many points', () => {
      const tree = new KDTree()
      for (let i = 0; i < 100; i++) {
        tree.insert(pt(i, i * 2))
      }
      expect(tree.size).toBe(100)
    })
  })

  describe('remove', () => {
    it('removes an existing point', () => {
      const tree = new KDTree()
      tree.insert(pt(5, 5))
      expect(tree.remove(pt(5, 5))).toBe(true)
      expect(tree.size).toBe(0)
    })

    it('returns false for non-existing point', () => {
      const tree = new KDTree()
      tree.insert(pt(5, 5))
      expect(tree.remove(pt(1, 1))).toBe(false)
      expect(tree.size).toBe(1)
    })

    it('returns false for empty tree', () => {
      const tree = new KDTree()
      expect(tree.remove(pt(5, 5))).toBe(false)
    })

    it('returns false for wrong dimensions', () => {
      const tree = new KDTree()
      tree.insert(pt(5, 5))
      expect(tree.remove(pt(1, 2, 3))).toBe(false)
    })

    it('removes from tree with multiple points', () => {
      const tree = new KDTree()
      tree.insert(pt(3, 6))
      tree.insert(pt(17, 15))
      tree.insert(pt(13, 15))
      expect(tree.remove(pt(17, 15))).toBe(true)
      expect(tree.size).toBe(2)
      expect(tree.contains(pt(3, 6))).toBe(true)
      expect(tree.contains(pt(13, 15))).toBe(true)
      expect(tree.contains(pt(17, 15))).toBe(false)
    })

    it('removes root node with right subtree', () => {
      const tree = new KDTree()
      tree.insert(pt(5, 5))
      tree.insert(pt(10, 10))
      tree.insert(pt(3, 3))
      expect(tree.remove(pt(5, 5))).toBe(true)
      expect(tree.size).toBe(2)
    })

    it('removes root node with left subtree only', () => {
      const tree = new KDTree()
      tree.insert(pt(5, 5))
      tree.insert(pt(3, 3))
      expect(tree.remove(pt(5, 5))).toBe(true)
      expect(tree.size).toBe(1)
      expect(tree.contains(pt(3, 3))).toBe(true)
    })

    it('removes leaf node', () => {
      const tree = new KDTree()
      tree.insert(pt(5, 5))
      tree.insert(pt(10, 10))
      expect(tree.remove(pt(10, 10))).toBe(true)
      expect(tree.size).toBe(1)
    })

    it('removes all points one by one', () => {
      const tree = new KDTree()
      tree.insert(pt(5, 5))
      tree.insert(pt(10, 10))
      tree.insert(pt(3, 3))
      tree.remove(pt(3, 3))
      tree.remove(pt(10, 10))
      tree.remove(pt(5, 5))
      expect(tree.size).toBe(0)
      expect(tree.isEmpty()).toBe(true)
    })

    it('handles remove and re-insert', () => {
      const tree = new KDTree()
      tree.insert(pt(5, 5))
      tree.remove(pt(5, 5))
      tree.insert(pt(5, 5))
      expect(tree.size).toBe(1)
      expect(tree.contains(pt(5, 5))).toBe(true)
    })

    it('removes from 3D tree', () => {
      const tree = new KDTree({ dimensions: 3 })
      tree.insert(pt(1, 2, 3))
      tree.insert(pt(4, 5, 6))
      expect(tree.remove(pt(1, 2, 3))).toBe(true)
      expect(tree.size).toBe(1)
    })
  })

  describe('contains', () => {
    it('returns true for inserted point', () => {
      const tree = new KDTree()
      tree.insert(pt(5, 5))
      expect(tree.contains(pt(5, 5))).toBe(true)
    })

    it('returns false for non-inserted point', () => {
      const tree = new KDTree()
      tree.insert(pt(5, 5))
      expect(tree.contains(pt(1, 1))).toBe(false)
    })

    it('returns false on empty tree', () => {
      const tree = new KDTree()
      expect(tree.contains(pt(5, 5))).toBe(false)
    })

    it('returns false for wrong dimensions', () => {
      const tree = new KDTree()
      tree.insert(pt(5, 5))
      expect(tree.contains(pt(1, 2, 3))).toBe(false)
    })

    it('finds points after multiple inserts', () => {
      const tree = new KDTree()
      tree.insert(pt(3, 6))
      tree.insert(pt(17, 15))
      tree.insert(pt(13, 15))
      expect(tree.contains(pt(3, 6))).toBe(true)
      expect(tree.contains(pt(17, 15))).toBe(true)
      expect(tree.contains(pt(13, 15))).toBe(true)
    })

    it('finds points after removal', () => {
      const tree = new KDTree()
      tree.insert(pt(5, 5))
      tree.insert(pt(10, 10))
      tree.remove(pt(5, 5))
      expect(tree.contains(pt(5, 5))).toBe(false)
      expect(tree.contains(pt(10, 10))).toBe(true)
    })
  })

  describe('nearest', () => {
    it('returns the nearest point', () => {
      const tree = new KDTree()
      tree.insert(pt(2, 3))
      tree.insert(pt(5, 4))
      tree.insert(pt(9, 6))
      tree.insert(pt(4, 7))
      tree.insert(pt(8, 1))
      tree.insert(pt(7, 2))
      const result = tree.nearest(pt(6, 3))
      expect(result).toBeDefined()
      expect(result![0]).toBe(5)
      expect(result![1]).toBe(4)
    })

    it('returns undefined for empty tree', () => {
      const tree = new KDTree()
      expect(tree.nearest(pt(5, 5))).toBeUndefined()
    })

    it('returns the only point', () => {
      const tree = new KDTree()
      tree.insert(pt(5, 5))
      expect(tree.nearest(pt(0, 0))).toEqual([5, 5])
    })

    it('returns undefined for wrong dimensions', () => {
      const tree = new KDTree()
      tree.insert(pt(5, 5))
      expect(tree.nearest(pt(1, 2, 3))).toBeUndefined()
    })

    it('finds nearest when query equals a point', () => {
      const tree = new KDTree()
      tree.insert(pt(1, 1))
      tree.insert(pt(10, 10))
      const result = tree.nearest(pt(1, 1))
      expect(result).toEqual([1, 1])
    })

    it('finds nearest from many points', () => {
      const tree = new KDTree()
      for (let i = 0; i < 50; i++) {
        tree.insert(pt(i * 2, i * 2))
      }
      const result = tree.nearest(pt(1, 1))
      expect(result).toBeDefined()
      expect(result![0]).toBe(0)
      expect(result![1]).toBe(0)
    })

    it('handles negative coordinates nearest', () => {
      const tree = new KDTree()
      tree.insert(pt(-10, -10))
      tree.insert(pt(10, 10))
      const result = tree.nearest(pt(-9, -9))
      expect(result).toEqual([-10, -10])
    })

    it('finds nearest in 3D', () => {
      const tree = new KDTree({ dimensions: 3 })
      tree.insert(pt(1, 2, 3))
      tree.insert(pt(10, 20, 30))
      tree.insert(pt(5, 5, 5))
      const result = tree.nearest(pt(4, 4, 4))
      expect(result).toEqual([5, 5, 5])
    })
  })

  describe('kNearest', () => {
    it('returns k nearest points sorted by distance', () => {
      const tree = new KDTree()
      tree.insert(pt(0, 0))
      tree.insert(pt(1, 1))
      tree.insert(pt(5, 5))
      tree.insert(pt(10, 10))
      const result = tree.kNearest(pt(2, 2), 2)
      expect(result).toHaveLength(2)
      expect(result[0]).toEqual([1, 1])
      expect(result[1]).toEqual([0, 0])
    })

    it('returns empty for empty tree', () => {
      const tree = new KDTree()
      expect(tree.kNearest(pt(5, 5), 3)).toHaveLength(0)
    })

    it('returns all points if k > size', () => {
      const tree = new KDTree()
      tree.insert(pt(1, 1))
      tree.insert(pt(2, 2))
      const result = tree.kNearest(pt(0, 0), 10)
      expect(result).toHaveLength(2)
    })

    it('returns single nearest for k=1', () => {
      const tree = new KDTree()
      tree.insert(pt(1, 1))
      tree.insert(pt(10, 10))
      const result = tree.kNearest(pt(0, 0), 1)
      expect(result).toHaveLength(1)
      expect(result[0]).toEqual([1, 1])
    })

    it('handles k=0', () => {
      const tree = new KDTree()
      tree.insert(pt(5, 5))
      expect(tree.kNearest(pt(5, 5), 0)).toHaveLength(0)
    })

    it('returns empty for wrong dimensions', () => {
      const tree = new KDTree()
      tree.insert(pt(5, 5))
      expect(tree.kNearest(pt(1, 2, 3), 2)).toHaveLength(0)
    })

    it('handles many points with small k', () => {
      const tree = new KDTree()
      for (let i = 0; i < 50; i++) {
        tree.insert(pt(i * 2, i * 2))
      }
      const result = tree.kNearest(pt(0, 0), 3)
      expect(result).toHaveLength(3)
      expect(result[0]).toEqual([0, 0])
    })

    it('returns results sorted by distance', () => {
      const tree = new KDTree()
      tree.insert(pt(10, 10))
      tree.insert(pt(20, 20))
      tree.insert(pt(30, 30))
      tree.insert(pt(40, 40))
      const result = tree.kNearest(pt(0, 0), 4)
      expect(result[0]).toEqual([10, 10])
      expect(result[1]).toEqual([20, 20])
      expect(result[2]).toEqual([30, 30])
      expect(result[3]).toEqual([40, 40])
    })

    it('handles kNearest in 3D', () => {
      const tree = new KDTree({ dimensions: 3 })
      tree.insert(pt(1, 1, 1))
      tree.insert(pt(5, 5, 5))
      tree.insert(pt(10, 10, 10))
      const result = tree.kNearest(pt(2, 2, 2), 2)
      expect(result).toHaveLength(2)
      expect(result[0]).toEqual([1, 1, 1])
    })
  })

  describe('rangeSearch', () => {
    it('returns points within range', () => {
      const tree = new KDTree()
      tree.insert(pt(5, 5))
      tree.insert(pt(10, 10))
      tree.insert(pt(15, 15))
      tree.insert(pt(20, 20))
      const result = tree.rangeSearch(rect([0, 0], [12, 12]))
      expect(result).toHaveLength(2)
      expect(pointsEqual(result, [pt(5, 5), pt(10, 10)])).toBe(true)
    })

    it('returns empty for empty tree', () => {
      const tree = new KDTree()
      const result = tree.rangeSearch(rect([0, 0], [10, 10]))
      expect(result).toHaveLength(0)
    })

    it('returns all points with wide range', () => {
      const tree = new KDTree()
      tree.insert(pt(5, 5))
      tree.insert(pt(10, 10))
      tree.insert(pt(15, 15))
      const result = tree.rangeSearch(rect([0, 0], [100, 100]))
      expect(result).toHaveLength(3)
    })

    it('returns empty for non-overlapping range', () => {
      const tree = new KDTree()
      tree.insert(pt(50, 50))
      const result = tree.rangeSearch(rect([0, 0], [10, 10]))
      expect(result).toHaveLength(0)
    })

    it('includes points at boundary', () => {
      const tree = new KDTree()
      tree.insert(pt(5, 5))
      tree.insert(pt(10, 10))
      const result = tree.rangeSearch(rect([5, 5], [10, 10]))
      expect(result).toHaveLength(2)
    })

    it('handles single point range', () => {
      const tree = new KDTree()
      tree.insert(pt(5, 5))
      tree.insert(pt(10, 10))
      const result = tree.rangeSearch(rect([5, 5], [5, 5]))
      expect(result).toHaveLength(1)
      expect(result[0]).toEqual([5, 5])
    })

    it('works with 3D tree', () => {
      const tree = new KDTree({ dimensions: 3 })
      tree.insert(pt(1, 2, 3))
      tree.insert(pt(10, 20, 30))
      tree.insert(pt(5, 5, 5))
      const result = tree.rangeSearch(rect([0, 0, 0], [6, 6, 6]))
      expect(result).toHaveLength(2)
    })

    it('handles range with many points', () => {
      const tree = new KDTree()
      for (let i = 0; i < 100; i++) {
        tree.insert(pt(i, i))
      }
      const result = tree.rangeSearch(rect([0, 0], [50, 50]))
      expect(result).toHaveLength(51)
    })

    it('handles negative range', () => {
      const tree = new KDTree()
      tree.insert(pt(-5, -5))
      tree.insert(pt(5, 5))
      const result = tree.rangeSearch(rect([-10, -10], [0, 0]))
      expect(result).toHaveLength(1)
      expect(result[0]).toEqual([-5, -5])
    })
  })

  describe('findAll', () => {
    it('finds points matching predicate', () => {
      const tree = new KDTree()
      tree.insert(pt(1, 1))
      tree.insert(pt(5, 5))
      tree.insert(pt(10, 10))
      const result = tree.findAll((p) => p[0]! < 6)
      expect(result).toHaveLength(2)
    })

    it('returns empty for no matches', () => {
      const tree = new KDTree()
      tree.insert(pt(10, 10))
      const result = tree.findAll((p) => p[0]! < 5)
      expect(result).toHaveLength(0)
    })

    it('returns empty for empty tree', () => {
      const tree = new KDTree()
      const result = tree.findAll(() => true)
      expect(result).toHaveLength(0)
    })

    it('returns all points with always-true predicate', () => {
      const tree = new KDTree()
      tree.insert(pt(1, 1))
      tree.insert(pt(2, 2))
      tree.insert(pt(3, 3))
      const result = tree.findAll(() => true)
      expect(result).toHaveLength(3)
    })

    it('finds points by y coordinate', () => {
      const tree = new KDTree()
      tree.insert(pt(1, 10))
      tree.insert(pt(2, 20))
      tree.insert(pt(3, 30))
      const result = tree.findAll((p) => p[1]! === 20)
      expect(result).toHaveLength(1)
      expect(result[0]).toEqual([2, 20])
    })
  })

  describe('size and isEmpty', () => {
    it('size is 0 on new tree', () => {
      const tree = new KDTree()
      expect(tree.size).toBe(0)
    })

    it('isEmpty returns true on new tree', () => {
      const tree = new KDTree()
      expect(tree.isEmpty()).toBe(true)
    })

    it('size increments on insert', () => {
      const tree = new KDTree()
      tree.insert(pt(5, 5))
      expect(tree.size).toBe(1)
      tree.insert(pt(10, 10))
      expect(tree.size).toBe(2)
    })

    it('isEmpty returns false after insert', () => {
      const tree = new KDTree()
      tree.insert(pt(5, 5))
      expect(tree.isEmpty()).toBe(false)
    })

    it('size decrements on remove', () => {
      const tree = new KDTree()
      tree.insert(pt(5, 5))
      tree.remove(pt(5, 5))
      expect(tree.size).toBe(0)
    })

    it('isEmpty returns true after removing all', () => {
      const tree = new KDTree()
      tree.insert(pt(5, 5))
      tree.remove(pt(5, 5))
      expect(tree.isEmpty()).toBe(true)
    })
  })

  describe('clear', () => {
    it('clears the tree', () => {
      const tree = new KDTree()
      tree.insert(pt(5, 5))
      tree.insert(pt(10, 10))
      tree.clear()
      expect(tree.size).toBe(0)
      expect(tree.isEmpty()).toBe(true)
    })

    it('allows insertions after clear', () => {
      const tree = new KDTree()
      tree.insert(pt(5, 5))
      tree.clear()
      tree.insert(pt(1, 1))
      expect(tree.size).toBe(1)
      expect(tree.contains(pt(1, 1))).toBe(true)
    })

    it('clear already empty tree', () => {
      const tree = new KDTree()
      tree.clear()
      expect(tree.size).toBe(0)
    })

    it('clear preserves dimensions', () => {
      const tree = new KDTree({ dimensions: 3 })
      tree.clear()
      expect(tree.dimensions).toBe(3)
    })
  })

  describe('toArray', () => {
    it('returns empty array for empty tree', () => {
      const tree = new KDTree()
      expect(tree.toArray()).toEqual([])
    })

    it('returns all inserted points', () => {
      const tree = new KDTree()
      tree.insert(pt(5, 5))
      tree.insert(pt(10, 10))
      tree.insert(pt(15, 15))
      expect(tree.toArray()).toHaveLength(3)
    })

    it('reflects removals', () => {
      const tree = new KDTree()
      tree.insert(pt(5, 5))
      tree.insert(pt(10, 10))
      tree.remove(pt(5, 5))
      const arr = tree.toArray()
      expect(arr).toHaveLength(1)
      expect(arr[0]).toEqual([10, 10])
    })

    it('returns points in order after balance', () => {
      const tree = new KDTree()
      tree.insert(pt(10, 10))
      tree.insert(pt(5, 5))
      tree.insert(pt(15, 15))
      tree.balance()
      const arr = tree.toArray()
      expect(arr).toHaveLength(3)
    })
  })

  describe('forEach', () => {
    it('iterates over all points', () => {
      const tree = new KDTree()
      tree.insert(pt(1, 1))
      tree.insert(pt(2, 2))
      tree.insert(pt(3, 3))
      const collected: KDPoint[] = []
      tree.forEach((p) => collected.push(p))
      expect(collected).toHaveLength(3)
    })

    it('provides correct indices', () => {
      const tree = new KDTree()
      tree.insert(pt(1, 1))
      tree.insert(pt(2, 2))
      const indices: number[] = []
      tree.forEach((_p, i) => indices.push(i))
      expect(indices).toEqual([0, 1])
    })

    it('does nothing on empty tree', () => {
      const tree = new KDTree()
      let count = 0
      tree.forEach(() => count++)
      expect(count).toBe(0)
    })
  })

  describe('dimensions', () => {
    it('returns 2 by default', () => {
      const tree = new KDTree()
      expect(tree.dimensions).toBe(2)
    })

    it('returns configured dimensions', () => {
      const tree = new KDTree({ dimensions: 5 })
      expect(tree.dimensions).toBe(5)
    })
  })

  describe('balance', () => {
    it('balances an unbalanced tree', () => {
      const tree = new KDTree()
      for (let i = 0; i < 10; i++) {
        tree.insert(pt(i, i))
      }
      tree.balance()
      expect(tree.size).toBe(10)
      for (let i = 0; i < 10; i++) {
        expect(tree.contains(pt(i, i))).toBe(true)
      }
    })

    it('balances empty tree', () => {
      const tree = new KDTree()
      tree.balance()
      expect(tree.size).toBe(0)
    })

    it('balances single element tree', () => {
      const tree = new KDTree()
      tree.insert(pt(5, 5))
      tree.balance()
      expect(tree.size).toBe(1)
      expect(tree.contains(pt(5, 5))).toBe(true)
    })

    it('balances 3D tree', () => {
      const tree = new KDTree({ dimensions: 3 })
      tree.insert(pt(1, 2, 3))
      tree.insert(pt(4, 5, 6))
      tree.insert(pt(7, 8, 9))
      tree.balance()
      expect(tree.size).toBe(3)
      expect(tree.contains(pt(1, 2, 3))).toBe(true)
      expect(tree.contains(pt(4, 5, 6))).toBe(true)
      expect(tree.contains(pt(7, 8, 9))).toBe(true)
    })

    it('maintains all points after balance', () => {
      const tree = new KDTree()
      const points: KDPoint[] = []
      for (let i = 0; i < 20; i++) {
        const p = pt(i * 3, i * 7)
        points.push(p)
        tree.insert(p)
      }
      tree.balance()
      const arr = tree.toArray()
      expect(arr).toHaveLength(20)
      for (const p of points) {
        expect(tree.contains(p)).toBe(true)
      }
    })
  })

  describe('min', () => {
    it('returns minimum on dimension 0', () => {
      const tree = new KDTree()
      tree.insert(pt(5, 10))
      tree.insert(pt(3, 20))
      tree.insert(pt(7, 5))
      const result = tree.min(0)
      expect(result).toBeDefined()
      expect(result![0]).toBe(3)
    })

    it('returns minimum on dimension 1', () => {
      const tree = new KDTree()
      tree.insert(pt(5, 10))
      tree.insert(pt(3, 20))
      tree.insert(pt(7, 5))
      const result = tree.min(1)
      expect(result).toBeDefined()
      expect(result![1]).toBe(5)
    })

    it('returns undefined for empty tree', () => {
      const tree = new KDTree()
      expect(tree.min(0)).toBeUndefined()
    })

    it('returns undefined for invalid dimension', () => {
      const tree = new KDTree()
      tree.insert(pt(5, 5))
      expect(tree.min(-1)).toBeUndefined()
      expect(tree.min(2)).toBeUndefined()
    })

    it('returns minimum in 3D tree', () => {
      const tree = new KDTree({ dimensions: 3 })
      tree.insert(pt(5, 10, 15))
      tree.insert(pt(3, 20, 8))
      tree.insert(pt(7, 5, 25))
      const result = tree.min(2)
      expect(result).toBeDefined()
      expect(result![2]).toBe(8)
    })

    it('returns single point as min', () => {
      const tree = new KDTree()
      tree.insert(pt(5, 5))
      const result = tree.min(0)
      expect(result).toEqual([5, 5])
    })
  })

  describe('max', () => {
    it('returns maximum on dimension 0', () => {
      const tree = new KDTree()
      tree.insert(pt(5, 10))
      tree.insert(pt(3, 20))
      tree.insert(pt(7, 5))
      const result = tree.max(0)
      expect(result).toBeDefined()
      expect(result![0]).toBe(7)
    })

    it('returns maximum on dimension 1', () => {
      const tree = new KDTree()
      tree.insert(pt(5, 10))
      tree.insert(pt(3, 20))
      tree.insert(pt(7, 5))
      const result = tree.max(1)
      expect(result).toBeDefined()
      expect(result![1]).toBe(20)
    })

    it('returns undefined for empty tree', () => {
      const tree = new KDTree()
      expect(tree.max(0)).toBeUndefined()
    })

    it('returns undefined for invalid dimension', () => {
      const tree = new KDTree()
      tree.insert(pt(5, 5))
      expect(tree.max(-1)).toBeUndefined()
      expect(tree.max(2)).toBeUndefined()
    })

    it('returns maximum in 3D tree', () => {
      const tree = new KDTree({ dimensions: 3 })
      tree.insert(pt(5, 10, 15))
      tree.insert(pt(3, 20, 8))
      tree.insert(pt(7, 5, 25))
      const result = tree.max(2)
      expect(result).toBeDefined()
      expect(result![2]).toBe(25)
    })

    it('returns single point as max', () => {
      const tree = new KDTree()
      tree.insert(pt(5, 5))
      const result = tree.max(0)
      expect(result).toEqual([5, 5])
    })
  })

  describe('static from', () => {
    it('creates KDTree from array of points', () => {
      const points = [pt(1, 1), pt(2, 2), pt(3, 3)]
      const tree = KDTree.from(points)
      expect(tree.size).toBe(3)
    })

    it('creates KDTree with options', () => {
      const points = [pt(1, 2, 3), pt(4, 5, 6)]
      const tree = KDTree.from(points, { dimensions: 3 })
      expect(tree.size).toBe(2)
      expect(tree.dimensions).toBe(3)
    })

    it('creates empty tree from empty array', () => {
      const tree = KDTree.from([])
      expect(tree.size).toBe(0)
      expect(tree.isEmpty()).toBe(true)
    })

    it('filters out points with wrong dimensions', () => {
      const points = [pt(1, 1), pt(2, 2, 3)]
      const tree = KDTree.from(points)
      expect(tree.size).toBe(1)
    })

    it('handles large arrays', () => {
      const points: KDPoint[] = []
      for (let i = 0; i < 100; i++) {
        points.push(pt(i, i * 2))
      }
      const tree = KDTree.from(points)
      expect(tree.size).toBe(100)
    })
  })

  describe('1D tree', () => {
    it('works with single dimension', () => {
      const tree = new KDTree({ dimensions: 1 })
      tree.insert(pt(5))
      tree.insert(pt(3))
      tree.insert(pt(7))
      expect(tree.size).toBe(3)
      expect(tree.contains(pt(5))).toBe(true)
      expect(tree.contains(pt(3))).toBe(true)
      expect(tree.contains(pt(7))).toBe(true)
    })

    it('nearest in 1D', () => {
      const tree = new KDTree({ dimensions: 1 })
      tree.insert(pt(1))
      tree.insert(pt(5))
      tree.insert(pt(10))
      const result = tree.nearest(pt(4))
      expect(result).toEqual([5])
    })

    it('min/max in 1D', () => {
      const tree = new KDTree({ dimensions: 1 })
      tree.insert(pt(5))
      tree.insert(pt(3))
      tree.insert(pt(7))
      expect(tree.min(0)).toEqual([3])
      expect(tree.max(0)).toEqual([7])
    })

    it('rangeSearch in 1D', () => {
      const tree = new KDTree({ dimensions: 1 })
      tree.insert(pt(1))
      tree.insert(pt(5))
      tree.insert(pt(10))
      const result = tree.rangeSearch(rect([0], [6]))
      expect(result).toHaveLength(2)
    })
  })

  describe('stress tests', () => {
    it('handles 1000 inserts', () => {
      const tree = new KDTree()
      for (let i = 0; i < 1000; i++) {
        tree.insert(pt(i % 100, Math.floor(i / 100)))
      }
      expect(tree.size).toBe(1000)
    })

    it('handles 1000 inserts and queryRange', () => {
      const tree = new KDTree()
      for (let i = 0; i < 1000; i++) {
        tree.insert(pt(i % 100, Math.floor(i / 100)))
      }
      const result = tree.rangeSearch(rect([0, 0], [50, 50]))
      expect(result.length).toBeGreaterThan(0)
    })

    it('handles insert-remove cycles', () => {
      const tree = new KDTree()
      for (let i = 0; i < 50; i++) {
        tree.insert(pt(i, i))
      }
      for (let i = 0; i < 50; i++) {
        tree.remove(pt(i, i))
      }
      expect(tree.size).toBe(0)
      expect(tree.isEmpty()).toBe(true)
    })

    it('handles random point distribution', () => {
      const tree = new KDTree()
      const points: KDPoint[] = []
      for (let i = 0; i < 200; i++) {
        const p = pt(Math.random() * 100, Math.random() * 100)
        points.push(p)
        tree.insert(p)
      }
      expect(tree.size).toBe(200)
      const all = tree.toArray()
      expect(all).toHaveLength(200)
    })

    it('handles balance with many points', () => {
      const tree = new KDTree()
      for (let i = 0; i < 100; i++) {
        tree.insert(pt(i, i))
      }
      tree.balance()
      expect(tree.size).toBe(100)
    })
  })

  describe('edge cases', () => {
    it('handles floating point coordinates', () => {
      const tree = new KDTree()
      tree.insert(pt(0.1, 0.2))
      tree.insert(pt(0.5, 0.5))
      tree.insert(pt(0.9, 0.9))
      expect(tree.size).toBe(3)
    })

    it('handles very large coordinates', () => {
      const tree = new KDTree()
      tree.insert(pt(1e10, 1e10))
      tree.insert(pt(1e15, 1e15))
      expect(tree.size).toBe(2)
      expect(tree.contains(pt(1e10, 1e10))).toBe(true)
    })

    it('handles very small coordinates', () => {
      const tree = new KDTree()
      tree.insert(pt(1e-10, 1e-10))
      tree.insert(pt(1e-15, 1e-15))
      expect(tree.size).toBe(2)
    })

    it('handles single point at origin', () => {
      const tree = new KDTree()
      tree.insert(pt(0, 0))
      expect(tree.size).toBe(1)
      expect(tree.contains(pt(0, 0))).toBe(true)
      expect(tree.nearest(pt(0, 0))).toEqual([0, 0])
    })

    it('handles remove from tree with single point', () => {
      const tree = new KDTree()
      tree.insert(pt(5, 5))
      expect(tree.remove(pt(5, 5))).toBe(true)
      expect(tree.isEmpty()).toBe(true)
      expect(tree.nearest(pt(5, 5))).toBeUndefined()
    })

    it('handles duplicate nearest distances', () => {
      const tree = new KDTree()
      tree.insert(pt(1, 0))
      tree.insert(pt(0, 1))
      const result = tree.nearest(pt(0, 0))
      expect(result).toBeDefined()
      const d = result![0]! * result![0]! + result![1]! * result![1]!
      expect(d).toBe(1)
    })
  })

  describe('nearest after operations', () => {
    it('finds nearest after removal', () => {
      const tree = new KDTree()
      tree.insert(pt(1, 1))
      tree.insert(pt(5, 5))
      tree.insert(pt(10, 10))
      tree.remove(pt(5, 5))
      const result = tree.nearest(pt(4, 4))
      expect(result).toBeDefined()
      expect(result![0]).toBe(1)
    })

    it('finds nearest after balance', () => {
      const tree = new KDTree()
      tree.insert(pt(10, 10))
      tree.insert(pt(1, 1))
      tree.insert(pt(20, 20))
      tree.balance()
      const result = tree.nearest(pt(2, 2))
      expect(result).toEqual([1, 1])
    })

    it('finds nearest after clear and re-insert', () => {
      const tree = new KDTree()
      tree.insert(pt(10, 10))
      tree.clear()
      tree.insert(pt(1, 1))
      tree.insert(pt(5, 5))
      const result = tree.nearest(pt(0, 0))
      expect(result).toEqual([1, 1])
    })
  })

  describe('kNearest edge cases', () => {
    it('handles kNearest after removal', () => {
      const tree = new KDTree()
      tree.insert(pt(1, 1))
      tree.insert(pt(5, 5))
      tree.insert(pt(10, 10))
      tree.remove(pt(5, 5))
      const result = tree.kNearest(pt(4, 4), 2)
      expect(result).toHaveLength(2)
    })

    it('handles kNearest with all points equidistant', () => {
      const tree = new KDTree()
      tree.insert(pt(1, 0))
      tree.insert(pt(0, 1))
      tree.insert(pt(-1, 0))
      tree.insert(pt(0, -1))
      const result = tree.kNearest(pt(0, 0), 4)
      expect(result).toHaveLength(4)
    })
  })

  describe('rangeSearch edge cases', () => {
    it('handles rangeSearch on single point tree', () => {
      const tree = new KDTree()
      tree.insert(pt(5, 5))
      expect(tree.rangeSearch(rect([5, 5], [5, 5]))).toHaveLength(1)
      expect(tree.rangeSearch(rect([0, 0], [4, 4]))).toHaveLength(0)
    })

    it('handles rangeSearch after removal', () => {
      const tree = new KDTree()
      tree.insert(pt(5, 5))
      tree.insert(pt(10, 10))
      tree.remove(pt(5, 5))
      const result = tree.rangeSearch(rect([0, 0], [15, 15]))
      expect(result).toHaveLength(1)
    })
  })

  describe('remove edge cases', () => {
    it('removes duplicate points one at a time', () => {
      const tree = new KDTree()
      tree.insert(pt(5, 5))
      tree.insert(pt(5, 5))
      expect(tree.size).toBe(2)
      expect(tree.remove(pt(5, 5))).toBe(true)
      expect(tree.size).toBe(1)
      expect(tree.remove(pt(5, 5))).toBe(true)
      expect(tree.size).toBe(0)
    })

    it('handles many remove-reinsert cycles', () => {
      const tree = new KDTree()
      for (let cycle = 0; cycle < 5; cycle++) {
        for (let i = 0; i < 10; i++) {
          tree.insert(pt(i * 10, i * 10))
        }
        expect(tree.size).toBe(10)
        for (let i = 0; i < 10; i++) {
          tree.remove(pt(i * 10, i * 10))
        }
        expect(tree.size).toBe(0)
      }
    })

    it('handles removing root repeatedly', () => {
      const tree = new KDTree()
      tree.insert(pt(5, 5))
      tree.insert(pt(10, 10))
      tree.insert(pt(3, 3))
      expect(tree.remove(pt(5, 5))).toBe(true)
      expect(tree.size).toBe(2)
      const arr = tree.toArray()
      expect(arr).toHaveLength(2)
    })
  })

  describe('4D tree', () => {
    it('inserts and queries 4D points', () => {
      const tree = new KDTree({ dimensions: 4 })
      tree.insert(pt(1, 2, 3, 4))
      tree.insert(pt(5, 6, 7, 8))
      tree.insert(pt(9, 10, 11, 12))
      expect(tree.size).toBe(3)
      expect(tree.contains(pt(5, 6, 7, 8))).toBe(true)
    })

    it('nearest in 4D', () => {
      const tree = new KDTree({ dimensions: 4 })
      tree.insert(pt(1, 1, 1, 1))
      tree.insert(pt(10, 10, 10, 10))
      const result = tree.nearest(pt(2, 2, 2, 2))
      expect(result).toEqual([1, 1, 1, 1])
    })

    it('rangeSearch in 4D', () => {
      const tree = new KDTree({ dimensions: 4 })
      tree.insert(pt(1, 2, 3, 4))
      tree.insert(pt(10, 20, 30, 40))
      tree.insert(pt(5, 6, 7, 8))
      const result = tree.rangeSearch(rect([0, 0, 0, 0], [6, 7, 8, 9]))
      expect(result).toHaveLength(2)
    })
  })

  describe('contains after various operations', () => {
    it('contains returns false after clear', () => {
      const tree = new KDTree()
      tree.insert(pt(5, 5))
      tree.clear()
      expect(tree.contains(pt(5, 5))).toBe(false)
    })

    it('contains finds all after bulk insert', () => {
      const tree = new KDTree()
      for (let i = 0; i < 20; i++) {
        tree.insert(pt(i * 5, i * 5))
      }
      for (let i = 0; i < 20; i++) {
        expect(tree.contains(pt(i * 5, i * 5))).toBe(true)
      }
    })
  })

  describe('min/max after operations', () => {
    it('min updates after removal', () => {
      const tree = new KDTree()
      tree.insert(pt(1, 1))
      tree.insert(pt(5, 5))
      tree.insert(pt(10, 10))
      tree.remove(pt(1, 1))
      expect(tree.min(0)![0]).toBe(5)
    })

    it('max updates after removal', () => {
      const tree = new KDTree()
      tree.insert(pt(1, 1))
      tree.insert(pt(5, 5))
      tree.insert(pt(10, 10))
      tree.remove(pt(10, 10))
      expect(tree.max(0)![0]).toBe(5)
    })

    it('min/max after balance', () => {
      const tree = new KDTree()
      tree.insert(pt(10, 10))
      tree.insert(pt(1, 1))
      tree.insert(pt(5, 5))
      tree.balance()
      expect(tree.min(0)![0]).toBe(1)
      expect(tree.max(0)![0]).toBe(10)
    })
  })
})
