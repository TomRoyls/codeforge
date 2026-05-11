import { describe, it, expect } from 'vitest'
import { QuadTree } from '../../src/core/quad-tree-2/index.js'
import type { Point, Rect } from '../../src/core/quad-tree-2/types.js'

function makeRect(x: number, y: number, w: number, h: number): Rect {
  return { x, y, width: w, height: h }
}

function pt(x: number, y: number): Point {
  return { x, y }
}

function pointsEqual(a: Point[], b: Point[]): boolean {
  if (a.length !== b.length) return false
  const as = [...a].sort((p, q) => p.x - q.x || p.y - q.y)
  const bs = [...b].sort((p, q) => p.x - q.x || p.y - q.y)
  for (let i = 0; i < as.length; i++) {
    if (as[i]!.x !== bs[i]!.x || as[i]!.y !== bs[i]!.y) return false
  }
  return true
}

describe('QuadTree', () => {
  describe('constructor', () => {
    it('creates a quad tree with default options', () => {
      const qt = new QuadTree(makeRect(0, 0, 100, 100))
      expect(qt.size).toBe(0)
      expect(qt.isEmpty()).toBe(true)
    })

    it('creates a quad tree with custom capacity', () => {
      const qt = new QuadTree(makeRect(0, 0, 100, 100), { capacity: 1 })
      expect(qt.size).toBe(0)
    })

    it('creates a quad tree with custom maxDepth', () => {
      const qt = new QuadTree(makeRect(0, 0, 100, 100), { maxDepth: 4 })
      expect(qt.isEmpty()).toBe(true)
    })

    it('creates a quad tree with both custom options', () => {
      const qt = new QuadTree(makeRect(0, 0, 100, 100), { capacity: 2, maxDepth: 6 })
      expect(qt.size).toBe(0)
    })

    it('accepts non-origin boundaries', () => {
      const qt = new QuadTree(makeRect(-50, -50, 100, 100))
      expect(qt.boundary).toEqual(makeRect(-50, -50, 100, 100))
    })

    it('accepts large boundaries', () => {
      const qt = new QuadTree(makeRect(0, 0, 10000, 10000))
      expect(qt.boundary.width).toBe(10000)
    })
  })

  describe('boundary', () => {
    it('returns the boundary', () => {
      const qt = new QuadTree(makeRect(0, 0, 100, 100))
      expect(qt.boundary).toEqual(makeRect(0, 0, 100, 100))
    })

    it('returns correct boundary after operations', () => {
      const qt = new QuadTree(makeRect(10, 20, 200, 300))
      qt.insert(pt(50, 60))
      expect(qt.boundary).toEqual(makeRect(10, 20, 200, 300))
    })
  })

  describe('insert', () => {
    it('inserts a point within bounds', () => {
      const qt = new QuadTree(makeRect(0, 0, 100, 100))
      expect(qt.insert(pt(50, 50))).toBe(true)
      expect(qt.size).toBe(1)
    })

    it('inserts at origin corner', () => {
      const qt = new QuadTree(makeRect(0, 0, 100, 100))
      expect(qt.insert(pt(0, 0))).toBe(true)
      expect(qt.size).toBe(1)
    })

    it('rejects point outside x bounds (right)', () => {
      const qt = new QuadTree(makeRect(0, 0, 100, 100))
      expect(qt.insert(pt(100, 50))).toBe(false)
      expect(qt.size).toBe(0)
    })

    it('rejects point outside x bounds (left)', () => {
      const qt = new QuadTree(makeRect(0, 0, 100, 100))
      expect(qt.insert(pt(-1, 50))).toBe(false)
    })

    it('rejects point outside y bounds (bottom)', () => {
      const qt = new QuadTree(makeRect(0, 0, 100, 100))
      expect(qt.insert(pt(50, 100))).toBe(false)
    })

    it('rejects point outside y bounds (top)', () => {
      const qt = new QuadTree(makeRect(0, 0, 100, 100))
      expect(qt.insert(pt(50, -1))).toBe(false)
    })

    it('inserts multiple points', () => {
      const qt = new QuadTree(makeRect(0, 0, 100, 100))
      qt.insert(pt(10, 10))
      qt.insert(pt(20, 20))
      qt.insert(pt(30, 30))
      expect(qt.size).toBe(3)
    })

    it('handles inserting duplicate points', () => {
      const qt = new QuadTree(makeRect(0, 0, 100, 100))
      qt.insert(pt(10, 10))
      qt.insert(pt(10, 10))
      expect(qt.size).toBe(2)
    })

    it('triggers subdivision when capacity exceeded', () => {
      const qt = new QuadTree(makeRect(0, 0, 100, 100), { capacity: 2 })
      qt.insert(pt(10, 10))
      qt.insert(pt(20, 20))
      qt.insert(pt(30, 30))
      expect(qt.size).toBe(3)
    })

    it('handles many inserts in same quadrant', () => {
      const qt = new QuadTree(makeRect(0, 0, 100, 100), { capacity: 1 })
      for (let i = 0; i < 10; i++) {
        qt.insert(pt(i, i))
      }
      expect(qt.size).toBe(10)
    })

    it('handles inserts across all quadrants', () => {
      const qt = new QuadTree(makeRect(0, 0, 100, 100), { capacity: 1 })
      qt.insert(pt(10, 10))
      qt.insert(pt(60, 10))
      qt.insert(pt(10, 60))
      qt.insert(pt(60, 60))
      expect(qt.size).toBe(4)
    })

    it('inserts at exact center of boundary', () => {
      const qt = new QuadTree(makeRect(0, 0, 100, 100))
      expect(qt.insert(pt(50, 50))).toBe(true)
    })

    it('inserts near edges', () => {
      const qt = new QuadTree(makeRect(0, 0, 100, 100))
      expect(qt.insert(pt(0, 0))).toBe(true)
      expect(qt.insert(pt(99.99, 0))).toBe(true)
      expect(qt.insert(pt(0, 99.99))).toBe(true)
      expect(qt.insert(pt(99.99, 99.99))).toBe(true)
      expect(qt.size).toBe(4)
    })
  })

  describe('remove', () => {
    it('removes an existing point', () => {
      const qt = new QuadTree(makeRect(0, 0, 100, 100))
      qt.insert(pt(50, 50))
      expect(qt.remove(pt(50, 50))).toBe(true)
      expect(qt.size).toBe(0)
    })

    it('returns false for non-existing point', () => {
      const qt = new QuadTree(makeRect(0, 0, 100, 100))
      qt.insert(pt(50, 50))
      expect(qt.remove(pt(25, 25))).toBe(false)
      expect(qt.size).toBe(1)
    })

    it('returns false when tree is empty', () => {
      const qt = new QuadTree(makeRect(0, 0, 100, 100))
      expect(qt.remove(pt(50, 50))).toBe(false)
    })

    it('removes from subdivided tree', () => {
      const qt = new QuadTree(makeRect(0, 0, 100, 100), { capacity: 1 })
      qt.insert(pt(10, 10))
      qt.insert(pt(60, 60))
      expect(qt.remove(pt(10, 10))).toBe(true)
      expect(qt.size).toBe(1)
    })

    it('removes and re-inserts', () => {
      const qt = new QuadTree(makeRect(0, 0, 100, 100))
      qt.insert(pt(50, 50))
      qt.remove(pt(50, 50))
      qt.insert(pt(50, 50))
      expect(qt.size).toBe(1)
      expect(qt.contains(pt(50, 50))).toBe(true)
    })

    it('removes multiple points one at a time', () => {
      const qt = new QuadTree(makeRect(0, 0, 100, 100))
      qt.insert(pt(10, 10))
      qt.insert(pt(20, 20))
      qt.insert(pt(30, 30))
      qt.remove(pt(20, 20))
      expect(qt.size).toBe(2)
      qt.remove(pt(10, 10))
      expect(qt.size).toBe(1)
      qt.remove(pt(30, 30))
      expect(qt.size).toBe(0)
    })

    it('handles removing from tree with many points', () => {
      const qt = new QuadTree(makeRect(0, 0, 100, 100), { capacity: 2 })
      for (let i = 0; i < 20; i++) {
        qt.insert(pt(i * 4, i * 4))
      }
      expect(qt.remove(pt(0, 0))).toBe(true)
      expect(qt.size).toBe(19)
    })
  })

  describe('contains', () => {
    it('returns true for inserted point', () => {
      const qt = new QuadTree(makeRect(0, 0, 100, 100))
      qt.insert(pt(50, 50))
      expect(qt.contains(pt(50, 50))).toBe(true)
    })

    it('returns false for non-inserted point', () => {
      const qt = new QuadTree(makeRect(0, 0, 100, 100))
      qt.insert(pt(50, 50))
      expect(qt.contains(pt(25, 25))).toBe(false)
    })

    it('returns false on empty tree', () => {
      const qt = new QuadTree(makeRect(0, 0, 100, 100))
      expect(qt.contains(pt(50, 50))).toBe(false)
    })

    it('finds points after subdivision', () => {
      const qt = new QuadTree(makeRect(0, 0, 100, 100), { capacity: 1 })
      qt.insert(pt(10, 10))
      qt.insert(pt(60, 60))
      expect(qt.contains(pt(10, 10))).toBe(true)
      expect(qt.contains(pt(60, 60))).toBe(true)
    })

    it('finds points after removal', () => {
      const qt = new QuadTree(makeRect(0, 0, 100, 100))
      qt.insert(pt(50, 50))
      qt.remove(pt(50, 50))
      expect(qt.contains(pt(50, 50))).toBe(false)
    })
  })

  describe('queryRange', () => {
    it('returns points in range', () => {
      const qt = new QuadTree(makeRect(0, 0, 100, 100))
      qt.insert(pt(10, 10))
      qt.insert(pt(50, 50))
      qt.insert(pt(90, 90))
      const result = qt.queryRange(makeRect(0, 0, 30, 30))
      expect(result).toHaveLength(1)
      expect(result[0]!.x).toBe(10)
      expect(result[0]!.y).toBe(10)
    })

    it('returns empty for empty tree', () => {
      const qt = new QuadTree(makeRect(0, 0, 100, 100))
      const result = qt.queryRange(makeRect(0, 0, 50, 50))
      expect(result).toHaveLength(0)
    })

    it('returns all points with full boundary query', () => {
      const qt = new QuadTree(makeRect(0, 0, 100, 100))
      qt.insert(pt(10, 10))
      qt.insert(pt(50, 50))
      qt.insert(pt(90, 90))
      const result = qt.queryRange(makeRect(0, 0, 100, 100))
      expect(result).toHaveLength(3)
    })

    it('returns empty for non-overlapping range', () => {
      const qt = new QuadTree(makeRect(0, 0, 100, 100))
      qt.insert(pt(10, 10))
      const result = qt.queryRange(makeRect(50, 50, 50, 50))
      expect(result).toHaveLength(0)
    })

    it('finds points at range boundary edges', () => {
      const qt = new QuadTree(makeRect(0, 0, 100, 100))
      qt.insert(pt(50, 50))
      const result = qt.queryRange(makeRect(50, 50, 10, 10))
      expect(result).toHaveLength(1)
    })

    it('excludes point just outside range', () => {
      const qt = new QuadTree(makeRect(0, 0, 100, 100))
      qt.insert(pt(50, 50))
      const result = qt.queryRange(makeRect(0, 0, 50, 50))
      expect(result).toHaveLength(0)
    })

    it('handles query with many points', () => {
      const qt = new QuadTree(makeRect(0, 0, 100, 100), { capacity: 4 })
      for (let x = 0; x < 10; x++) {
        for (let y = 0; y < 10; y++) {
          qt.insert(pt(x * 10, y * 10))
        }
      }
      const result = qt.queryRange(makeRect(0, 0, 50, 50))
      expect(result.length).toBeGreaterThan(0)
    })

    it('returns points from subdivided quadrants', () => {
      const qt = new QuadTree(makeRect(0, 0, 100, 100), { capacity: 1 })
      qt.insert(pt(10, 10))
      qt.insert(pt(60, 10))
      qt.insert(pt(10, 60))
      qt.insert(pt(60, 60))
      qt.insert(pt(25, 25))
      const result = qt.queryRange(makeRect(0, 0, 100, 100))
      expect(result).toHaveLength(5)
    })
  })

  describe('nearest', () => {
    it('returns the nearest point', () => {
      const qt = new QuadTree(makeRect(0, 0, 100, 100))
      qt.insert(pt(10, 10))
      qt.insert(pt(50, 50))
      qt.insert(pt(90, 90))
      const result = qt.nearest(pt(12, 12))
      expect(result).toBeDefined()
      expect(result!.x).toBe(10)
      expect(result!.y).toBe(10)
    })

    it('returns undefined for empty tree', () => {
      const qt = new QuadTree(makeRect(0, 0, 100, 100))
      expect(qt.nearest(pt(50, 50))).toBeUndefined()
    })

    it('returns the only point', () => {
      const qt = new QuadTree(makeRect(0, 0, 100, 100))
      qt.insert(pt(50, 50))
      expect(qt.nearest(pt(0, 0))).toEqual(pt(50, 50))
    })

    it('finds nearest from opposite corner', () => {
      const qt = new QuadTree(makeRect(0, 0, 100, 100))
      qt.insert(pt(90, 90))
      qt.insert(pt(10, 10))
      const result = qt.nearest(pt(0, 0))
      expect(result!.x).toBe(10)
      expect(result!.y).toBe(10)
    })

    it('handles nearest with many points', () => {
      const qt = new QuadTree(makeRect(0, 0, 100, 100))
      for (let i = 0; i < 50; i++) {
        qt.insert(pt(i * 2, i * 2))
      }
      const result = qt.nearest(pt(1, 1))
      expect(result).toBeDefined()
      expect(result!.x).toBe(0)
      expect(result!.y).toBe(0)
    })

    it('handles query point inside tree', () => {
      const qt = new QuadTree(makeRect(0, 0, 100, 100))
      qt.insert(pt(50, 50))
      qt.insert(pt(10, 10))
      const result = qt.nearest(pt(49, 49))
      expect(result!.x).toBe(50)
      expect(result!.y).toBe(50)
    })
  })

  describe('kNearest', () => {
    it('returns k nearest points', () => {
      const qt = new QuadTree(makeRect(0, 0, 100, 100))
      qt.insert(pt(10, 10))
      qt.insert(pt(20, 20))
      qt.insert(pt(30, 30))
      const result = qt.kNearest(pt(15, 15), 2)
      expect(result).toHaveLength(2)
      expect(result[0]!.x).toBe(10)
      expect(result[0]!.y).toBe(10)
      expect(result[1]!.x).toBe(20)
      expect(result[1]!.y).toBe(20)
    })

    it('returns empty for empty tree', () => {
      const qt = new QuadTree(makeRect(0, 0, 100, 100))
      expect(qt.kNearest(pt(50, 50), 3)).toHaveLength(0)
    })

    it('returns all points if k > size', () => {
      const qt = new QuadTree(makeRect(0, 0, 100, 100))
      qt.insert(pt(10, 10))
      qt.insert(pt(20, 20))
      const result = qt.kNearest(pt(50, 50), 10)
      expect(result).toHaveLength(2)
    })

    it('returns single nearest for k=1', () => {
      const qt = new QuadTree(makeRect(0, 0, 100, 100))
      qt.insert(pt(10, 10))
      qt.insert(pt(50, 50))
      qt.insert(pt(90, 90))
      const result = qt.kNearest(pt(12, 12), 1)
      expect(result).toHaveLength(1)
      expect(result[0]!.x).toBe(10)
    })

    it('returns results sorted by distance', () => {
      const qt = new QuadTree(makeRect(0, 0, 100, 100))
      qt.insert(pt(10, 10))
      qt.insert(pt(20, 20))
      qt.insert(pt(30, 30))
      qt.insert(pt(40, 40))
      const result = qt.kNearest(pt(0, 0), 4)
      expect(result[0]!.x).toBe(10)
      expect(result[1]!.x).toBe(20)
      expect(result[2]!.x).toBe(30)
      expect(result[3]!.x).toBe(40)
    })

    it('handles k=0', () => {
      const qt = new QuadTree(makeRect(0, 0, 100, 100))
      qt.insert(pt(50, 50))
      expect(qt.kNearest(pt(50, 50), 0)).toHaveLength(0)
    })

    it('handles many points with small k', () => {
      const qt = new QuadTree(makeRect(0, 0, 100, 100))
      for (let i = 0; i < 50; i++) {
        qt.insert(pt(i * 2, i * 2))
      }
      const result = qt.kNearest(pt(0, 0), 3)
      expect(result).toHaveLength(3)
      expect(result[0]!.x).toBe(0)
    })
  })

  describe('size and isEmpty', () => {
    it('size is 0 on new tree', () => {
      const qt = new QuadTree(makeRect(0, 0, 100, 100))
      expect(qt.size).toBe(0)
    })

    it('isEmpty returns true on new tree', () => {
      const qt = new QuadTree(makeRect(0, 0, 100, 100))
      expect(qt.isEmpty()).toBe(true)
    })

    it('size increments on insert', () => {
      const qt = new QuadTree(makeRect(0, 0, 100, 100))
      qt.insert(pt(50, 50))
      expect(qt.size).toBe(1)
      qt.insert(pt(60, 60))
      expect(qt.size).toBe(2)
    })

    it('isEmpty returns false after insert', () => {
      const qt = new QuadTree(makeRect(0, 0, 100, 100))
      qt.insert(pt(50, 50))
      expect(qt.isEmpty()).toBe(false)
    })

    it('size decrements on remove', () => {
      const qt = new QuadTree(makeRect(0, 0, 100, 100))
      qt.insert(pt(50, 50))
      qt.remove(pt(50, 50))
      expect(qt.size).toBe(0)
    })

    it('isEmpty returns true after removing all', () => {
      const qt = new QuadTree(makeRect(0, 0, 100, 100))
      qt.insert(pt(50, 50))
      qt.remove(pt(50, 50))
      expect(qt.isEmpty()).toBe(true)
    })
  })

  describe('clear', () => {
    it('clears the tree', () => {
      const qt = new QuadTree(makeRect(0, 0, 100, 100))
      qt.insert(pt(10, 10))
      qt.insert(pt(50, 50))
      qt.clear()
      expect(qt.size).toBe(0)
      expect(qt.isEmpty()).toBe(true)
    })

    it('allows insertions after clear', () => {
      const qt = new QuadTree(makeRect(0, 0, 100, 100))
      qt.insert(pt(50, 50))
      qt.clear()
      qt.insert(pt(25, 25))
      expect(qt.size).toBe(1)
      expect(qt.contains(pt(25, 25))).toBe(true)
    })

    it('preserves boundary after clear', () => {
      const qt = new QuadTree(makeRect(0, 0, 100, 100))
      qt.insert(pt(50, 50))
      qt.clear()
      expect(qt.boundary).toEqual(makeRect(0, 0, 100, 100))
    })

    it('clear already empty tree', () => {
      const qt = new QuadTree(makeRect(0, 0, 100, 100))
      qt.clear()
      expect(qt.size).toBe(0)
    })
  })

  describe('toArray', () => {
    it('returns empty array for empty tree', () => {
      const qt = new QuadTree(makeRect(0, 0, 100, 100))
      expect(qt.toArray()).toEqual([])
    })

    it('returns all inserted points', () => {
      const qt = new QuadTree(makeRect(0, 0, 100, 100))
      qt.insert(pt(10, 10))
      qt.insert(pt(50, 50))
      qt.insert(pt(90, 90))
      const arr = qt.toArray()
      expect(arr).toHaveLength(3)
    })

    it('returns points after subdivision', () => {
      const qt = new QuadTree(makeRect(0, 0, 100, 100), { capacity: 1 })
      qt.insert(pt(10, 10))
      qt.insert(pt(60, 10))
      qt.insert(pt(10, 60))
      qt.insert(pt(60, 60))
      expect(qt.toArray()).toHaveLength(4)
    })

    it('reflects removals', () => {
      const qt = new QuadTree(makeRect(0, 0, 100, 100))
      qt.insert(pt(10, 10))
      qt.insert(pt(50, 50))
      qt.remove(pt(10, 10))
      const arr = qt.toArray()
      expect(arr).toHaveLength(1)
      expect(arr[0]!.x).toBe(50)
    })
  })

  describe('forEach', () => {
    it('iterates over all points', () => {
      const qt = new QuadTree(makeRect(0, 0, 100, 100))
      qt.insert(pt(10, 10))
      qt.insert(pt(50, 50))
      qt.insert(pt(90, 90))
      const collected: Point[] = []
      qt.forEach((p) => collected.push(p))
      expect(collected).toHaveLength(3)
    })

    it('provides correct indices', () => {
      const qt = new QuadTree(makeRect(0, 0, 100, 100))
      qt.insert(pt(10, 10))
      qt.insert(pt(50, 50))
      const indices: number[] = []
      qt.forEach((_p, i) => indices.push(i))
      expect(indices).toEqual([0, 1])
    })

    it('does nothing on empty tree', () => {
      const qt = new QuadTree(makeRect(0, 0, 100, 100))
      let count = 0
      qt.forEach(() => count++)
      expect(count).toBe(0)
    })
  })

  describe('allPoints', () => {
    it('returns all points via getter', () => {
      const qt = new QuadTree(makeRect(0, 0, 100, 100))
      qt.insert(pt(10, 10))
      qt.insert(pt(50, 50))
      expect(qt.allPoints).toHaveLength(2)
    })

    it('returns empty array for empty tree', () => {
      const qt = new QuadTree(makeRect(0, 0, 100, 100))
      expect(qt.allPoints).toEqual([])
    })
  })

  describe('subdivision behavior', () => {
    it('subdivides when capacity is exceeded', () => {
      const qt = new QuadTree(makeRect(0, 0, 100, 100), { capacity: 2 })
      qt.insert(pt(10, 10))
      qt.insert(pt(20, 20))
      qt.insert(pt(30, 30))
      const all = qt.toArray()
      expect(all).toHaveLength(3)
    })

    it('handles deep subdivision with small capacity', () => {
      const qt = new QuadTree(makeRect(0, 0, 100, 100), { capacity: 1, maxDepth: 6 })
      for (let i = 0; i < 20; i++) {
        qt.insert(pt(i, i))
      }
      expect(qt.size).toBe(20)
    })

    it('respects maxDepth by storing at leaf', () => {
      const qt = new QuadTree(makeRect(0, 0, 10, 10), { capacity: 1, maxDepth: 2 })
      for (let i = 0; i < 10; i++) {
        qt.insert(pt(i * 0.5, i * 0.5))
      }
      expect(qt.size).toBe(10)
    })

    it('distributes points to correct quadrants', () => {
      const qt = new QuadTree(makeRect(0, 0, 100, 100), { capacity: 1 })
      qt.insert(pt(10, 10))
      qt.insert(pt(60, 10))
      qt.insert(pt(10, 60))
      qt.insert(pt(60, 60))
      expect(qt.contains(pt(10, 10))).toBe(true)
      expect(qt.contains(pt(60, 10))).toBe(true)
      expect(qt.contains(pt(10, 60))).toBe(true)
      expect(qt.contains(pt(60, 60))).toBe(true)
    })

    it('handles many points in same small area', () => {
      const qt = new QuadTree(makeRect(0, 0, 100, 100), { capacity: 1 })
      for (let i = 0; i < 20; i++) {
        qt.insert(pt(50 + i * 0.01, 50 + i * 0.01))
      }
      expect(qt.size).toBe(20)
    })
  })

  describe('queryRange after subdivision', () => {
    it('finds points in specific quadrant', () => {
      const qt = new QuadTree(makeRect(0, 0, 100, 100), { capacity: 1 })
      qt.insert(pt(10, 10))
      qt.insert(pt(60, 10))
      qt.insert(pt(10, 60))
      qt.insert(pt(60, 60))
      const nw = qt.queryRange(makeRect(0, 0, 50, 50))
      expect(nw).toHaveLength(1)
      expect(nw[0]!.x).toBe(10)
      expect(nw[0]!.y).toBe(10)
    })

    it('finds points spanning quadrants', () => {
      const qt = new QuadTree(makeRect(0, 0, 100, 100), { capacity: 1 })
      qt.insert(pt(10, 10))
      qt.insert(pt(60, 10))
      qt.insert(pt(10, 60))
      qt.insert(pt(60, 60))
      const result = qt.queryRange(makeRect(0, 0, 61, 61))
      expect(result.length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('edge cases', () => {
    it('handles floating point coordinates', () => {
      const qt = new QuadTree(makeRect(0, 0, 1, 1))
      qt.insert(pt(0.1, 0.1))
      qt.insert(pt(0.5, 0.5))
      qt.insert(pt(0.9, 0.9))
      expect(qt.size).toBe(3)
    })

    it('handles negative coordinates', () => {
      const qt = new QuadTree(makeRect(-100, -100, 200, 200))
      qt.insert(pt(-50, -50))
      qt.insert(pt(50, 50))
      expect(qt.size).toBe(2)
      expect(qt.contains(pt(-50, -50))).toBe(true)
    })

    it('handles very small boundaries', () => {
      const qt = new QuadTree(makeRect(0, 0, 0.001, 0.001))
      qt.insert(pt(0.0001, 0.0001))
      expect(qt.size).toBe(1)
    })

    it('handles single point at origin', () => {
      const qt = new QuadTree(makeRect(0, 0, 1, 1))
      qt.insert(pt(0, 0))
      expect(qt.size).toBe(1)
      expect(qt.contains(pt(0, 0))).toBe(true)
    })

    it('handles boundary with non-zero origin', () => {
      const qt = new QuadTree(makeRect(100, 100, 200, 200))
      qt.insert(pt(150, 150))
      qt.insert(pt(200, 200))
      expect(qt.size).toBe(2)
      expect(qt.contains(pt(150, 150))).toBe(true)
    })

    it('handles remove from empty subdivided tree area', () => {
      const qt = new QuadTree(makeRect(0, 0, 100, 100), { capacity: 1 })
      qt.insert(pt(10, 10))
      qt.insert(pt(60, 60))
      qt.remove(pt(10, 10))
      qt.remove(pt(60, 60))
      expect(qt.remove(pt(25, 25))).toBe(false)
    })
  })

  describe('static from', () => {
    it('creates quad tree from array of points', () => {
      const points = [pt(10, 10), pt(50, 50), pt(90, 90)]
      const qt = QuadTree.from(points, makeRect(0, 0, 100, 100))
      expect(qt.size).toBe(3)
    })

    it('creates quad tree with options', () => {
      const points = [pt(10, 10), pt(50, 50)]
      const qt = QuadTree.from(points, makeRect(0, 0, 100, 100), { capacity: 1 })
      expect(qt.size).toBe(2)
    })

    it('creates empty tree from empty array', () => {
      const qt = QuadTree.from([], makeRect(0, 0, 100, 100))
      expect(qt.size).toBe(0)
      expect(qt.isEmpty()).toBe(true)
    })

    it('handles large point arrays', () => {
      const points: Point[] = []
      for (let i = 0; i < 100; i++) {
        points.push(pt(i, i))
      }
      const qt = QuadTree.from(points, makeRect(0, 0, 100, 100))
      expect(qt.size).toBe(100)
    })

    it('filters out-of-bounds points', () => {
      const points = [pt(10, 10), pt(200, 200)]
      const qt = QuadTree.from(points, makeRect(0, 0, 100, 100))
      expect(qt.size).toBe(1)
    })
  })

  describe('stress tests', () => {
    it('handles 1000 inserts', () => {
      const qt = new QuadTree(makeRect(0, 0, 1000, 1000), { capacity: 4 })
      for (let i = 0; i < 1000; i++) {
        qt.insert(pt(i, i))
      }
      expect(qt.size).toBe(1000)
    })

    it('handles 1000 inserts and queryRange', () => {
      const qt = new QuadTree(makeRect(0, 0, 1000, 1000), { capacity: 4 })
      for (let i = 0; i < 1000; i++) {
        qt.insert(pt(i % 100, Math.floor(i / 100)))
      }
      const result = qt.queryRange(makeRect(0, 0, 50, 50))
      expect(result.length).toBeGreaterThan(0)
    })

    it('handles insert-remove cycles', () => {
      const qt = new QuadTree(makeRect(0, 0, 100, 100))
      for (let i = 0; i < 50; i++) {
        qt.insert(pt(i, i))
      }
      for (let i = 0; i < 50; i++) {
        qt.remove(pt(i, i))
      }
      expect(qt.size).toBe(0)
      expect(qt.isEmpty()).toBe(true)
    })

    it('handles random point distribution', () => {
      const qt = new QuadTree(makeRect(0, 0, 100, 100), { capacity: 4 })
      const points: Point[] = []
      for (let i = 0; i < 200; i++) {
        const p = pt(Math.random() * 99, Math.random() * 99)
        points.push(p)
        qt.insert(p)
      }
      expect(qt.size).toBe(200)
      const all = qt.toArray()
      expect(all).toHaveLength(200)
    })
  })

  describe('nearest with subdivision', () => {
    it('finds nearest across quadrants', () => {
      const qt = new QuadTree(makeRect(0, 0, 100, 100), { capacity: 1 })
      qt.insert(pt(10, 10))
      qt.insert(pt(60, 60))
      const result = qt.nearest(pt(55, 55))
      expect(result!.x).toBe(60)
      expect(result!.y).toBe(60)
    })

    it('finds nearest with many subdivided nodes', () => {
      const qt = new QuadTree(makeRect(0, 0, 100, 100), { capacity: 1 })
      for (let i = 0; i < 10; i++) {
        qt.insert(pt(i * 10, i * 10))
      }
      const result = qt.nearest(pt(45, 45))
      expect(result).toBeDefined()
      const dx = result!.x - 45
      const dy = result!.y - 45
      const dist = Math.sqrt(dx * dx + dy * dy)
      expect(dist).toBeLessThanOrEqual(Math.sqrt(50))
    })
  })

  describe('kNearest with subdivision', () => {
    it('finds k nearest across subdivisions', () => {
      const qt = new QuadTree(makeRect(0, 0, 100, 100), { capacity: 1 })
      qt.insert(pt(10, 10))
      qt.insert(pt(20, 20))
      qt.insert(pt(80, 80))
      qt.insert(pt(90, 90))
      const result = qt.kNearest(pt(15, 15), 2)
      expect(result).toHaveLength(2)
      expect(pointsEqual(result, [pt(10, 10), pt(20, 20)])).toBe(true)
    })

    it('finds k nearest with many points', () => {
      const qt = new QuadTree(makeRect(0, 0, 100, 100), { capacity: 3 })
      for (let i = 0; i < 20; i++) {
        qt.insert(pt(i * 5, i * 5))
      }
      const result = qt.kNearest(pt(25, 25), 5)
      expect(result).toHaveLength(5)
      expect(result[0]!.x).toBe(25)
      expect(result[0]!.y).toBe(25)
    })
  })

  describe('re-insert after remove', () => {
    it('allows re-inserting removed point', () => {
      const qt = new QuadTree(makeRect(0, 0, 100, 100))
      qt.insert(pt(50, 50))
      qt.remove(pt(50, 50))
      qt.insert(pt(50, 50))
      expect(qt.contains(pt(50, 50))).toBe(true)
      expect(qt.size).toBe(1)
    })

    it('handles many remove-reinsert cycles', () => {
      const qt = new QuadTree(makeRect(0, 0, 100, 100))
      for (let cycle = 0; cycle < 5; cycle++) {
        for (let i = 0; i < 10; i++) {
          qt.insert(pt(i * 10, i * 10))
        }
        expect(qt.size).toBe(10)
        for (let i = 0; i < 10; i++) {
          qt.remove(pt(i * 10, i * 10))
        }
        expect(qt.size).toBe(0)
      }
    })
  })

  describe('contains after various operations', () => {
    it('contains returns false after clear', () => {
      const qt = new QuadTree(makeRect(0, 0, 100, 100))
      qt.insert(pt(50, 50))
      qt.clear()
      expect(qt.contains(pt(50, 50))).toBe(false)
    })

    it('contains finds all after bulk insert', () => {
      const qt = new QuadTree(makeRect(0, 0, 100, 100))
      for (let i = 0; i < 20; i++) {
        qt.insert(pt(i * 5, i * 5))
      }
      for (let i = 0; i < 20; i++) {
        expect(qt.contains(pt(i * 5, i * 5))).toBe(true)
      }
    })
  })

  describe('queryRange precision', () => {
    it('does not include points exactly at right edge of range', () => {
      const qt = new QuadTree(makeRect(0, 0, 100, 100))
      qt.insert(pt(50, 50))
      const result = qt.queryRange(makeRect(0, 0, 50, 50))
      expect(result).toHaveLength(0)
    })

    it('includes point at left edge of range', () => {
      const qt = new QuadTree(makeRect(0, 0, 100, 100))
      qt.insert(pt(50, 50))
      const result = qt.queryRange(makeRect(50, 50, 10, 10))
      expect(result).toHaveLength(1)
    })

    it('includes point at top-left of range', () => {
      const qt = new QuadTree(makeRect(0, 0, 100, 100))
      qt.insert(pt(10, 10))
      const result = qt.queryRange(makeRect(10, 10, 50, 50))
      expect(result).toHaveLength(1)
    })

    it('handles zero-width range', () => {
      const qt = new QuadTree(makeRect(0, 0, 100, 100))
      qt.insert(pt(50, 50))
      const result = qt.queryRange(makeRect(50, 50, 0, 0))
      expect(result).toHaveLength(0)
    })
  })
})
