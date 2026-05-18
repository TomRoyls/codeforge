import { describe, it, expect } from 'vitest'
import { PartitionTree } from '../src/core/partition-tree/index.js'
import type { PartitionPoint, Rectangle } from '../src/core/partition-tree/index.js'

describe('PartitionTree', () => {
  // ─── Construction & Empty State ───
  describe('construction and empty state', () => {
    it('creates an empty tree', () => {
      const tree = new PartitionTree()
      expect(tree.size).toBe(0)
      expect(tree.isEmpty).toBe(true)
    })

    it('creates a tree with initial points', () => {
      const tree = new PartitionTree([
        { x: 1, y: 2, data: 'a' },
        { x: 3, y: 4, data: 'b' },
      ])
      expect(tree.size).toBe(2)
      expect(tree.isEmpty).toBe(false)
    })

    it('fromArray creates a tree from points', () => {
      const tree = PartitionTree.fromArray([
        { x: 0, y: 0 },
        { x: 5, y: 5 },
      ])
      expect(tree.size).toBe(2)
    })

    it('clone produces an independent copy', () => {
      const tree = new PartitionTree([{ x: 1, y: 2 }])
      const cloned = tree.clone()
      expect(cloned.size).toBe(1)
      tree.addPoint({ x: 3, y: 4 })
      expect(tree.size).toBe(2)
      expect(cloned.size).toBe(1)
    })
  })

  // ─── Query Range ───
  describe('queryRange', () => {
    it('returns empty for empty tree', () => {
      const tree = new PartitionTree()
      expect(tree.queryRange({ minX: 0, maxX: 10, minY: 0, maxY: 10 })).toEqual([])
    })

    it('returns points within rectangular range', () => {
      const tree = new PartitionTree([
        { x: 1, y: 1 },
        { x: 5, y: 5 },
        { x: 10, y: 10 },
      ])
      const result = tree.queryRange({ minX: 0, maxX: 6, minY: 0, maxY: 6 })
      expect(result).toHaveLength(2)
      expect(result.some(p => p.x === 1 && p.y === 1)).toBe(true)
      expect(result.some(p => p.x === 5 && p.y === 5)).toBe(true)
    })

    it('returns empty when no points in range', () => {
      const tree = new PartitionTree([{ x: 100, y: 100 }])
      expect(tree.queryRange({ minX: 0, maxX: 10, minY: 0, maxY: 10 })).toEqual([])
    })

    it('handles single point range query', () => {
      const tree = new PartitionTree([{ x: 5, y: 5 }])
      const result = tree.queryRange({ minX: 5, maxX: 5, minY: 5, maxY: 5 })
      expect(result).toHaveLength(1)
    })
  })

  // ─── Count Range ───
  describe('countRange', () => {
    it('returns 0 for empty tree', () => {
      const tree = new PartitionTree()
      expect(tree.countRange({ minX: 0, maxX: 10, minY: 0, maxY: 10 })).toBe(0)
    })

    it('counts points in range', () => {
      const tree = new PartitionTree([
        { x: 1, y: 1 },
        { x: 2, y: 2 },
        { x: 8, y: 8 },
      ])
      expect(tree.countRange({ minX: 0, maxX: 5, minY: 0, maxY: 5 })).toBe(2)
    })

    it('counts all points in full range', () => {
      const tree = new PartitionTree([
        { x: 1, y: 1 },
        { x: 5, y: 5 },
      ])
      expect(tree.countRange({ minX: 0, maxX: 10, minY: 0, maxY: 10 })).toBe(2)
    })
  })

  // ─── Contains & Nearest ───
  describe('contains', () => {
    it('returns true for existing point', () => {
      const tree = new PartitionTree([{ x: 3, y: 4 }])
      expect(tree.contains(3, 4)).toBe(true)
    })

    it('returns false for non-existing point', () => {
      const tree = new PartitionTree([{ x: 3, y: 4 }])
      expect(tree.contains(5, 5)).toBe(false)
    })
  })

  describe('nearest', () => {
    it('returns undefined for empty tree', () => {
      const tree = new PartitionTree()
      expect(tree.nearest(0, 0)).toBeUndefined()
    })

    it('returns closest point', () => {
      const tree = new PartitionTree([
        { x: 1, y: 1 },
        { x: 10, y: 10 },
      ])
      const result = tree.nearest(2, 2)
      expect(result).toBeDefined()
      expect(result!.x).toBe(1)
      expect(result!.y).toBe(1)
    })
  })

  describe('kNearest', () => {
    it('returns empty for k <= 0', () => {
      const tree = new PartitionTree([{ x: 0, y: 0 }])
      expect(tree.kNearest(0, 0, 0)).toEqual([])
      expect(tree.kNearest(0, 0, -1)).toEqual([])
    })

    it('returns k nearest points sorted by distance', () => {
      const tree = new PartitionTree([
        { x: 1, y: 0 },
        { x: 5, y: 0 },
        { x: 10, y: 0 },
      ])
      const result = tree.kNearest(0, 0, 2)
      expect(result).toHaveLength(2)
      expect(result[0]!.x).toBe(1)
      expect(result[1]!.x).toBe(5)
    })
  })

  // ─── Mutation ───
  describe('addPoint and removePoint', () => {
    it('adds a point', () => {
      const tree = new PartitionTree()
      tree.addPoint({ x: 1, y: 2 })
      expect(tree.size).toBe(1)
      expect(tree.contains(1, 2)).toBe(true)
    })

    it('removes a point and returns true', () => {
      const tree = new PartitionTree([{ x: 1, y: 2 }])
      expect(tree.removePoint(1, 2)).toBe(true)
      expect(tree.size).toBe(0)
    })

    it('returns false when removing non-existing point', () => {
      const tree = new PartitionTree([{ x: 1, y: 2 }])
      expect(tree.removePoint(3, 4)).toBe(false)
      expect(tree.size).toBe(1)
    })
  })

  // ─── Utilities ───
  describe('utilities', () => {
    it('clear removes all points', () => {
      const tree = new PartitionTree([{ x: 1, y: 1 }, { x: 2, y: 2 }])
      tree.clear()
      expect(tree.size).toBe(0)
      expect(tree.isEmpty).toBe(true)
    })

    it('toArray returns all points', () => {
      const tree = new PartitionTree([{ x: 1, y: 2 }])
      const arr = tree.toArray()
      expect(arr).toHaveLength(1)
      expect(arr[0]!.x).toBe(1)
    })

    it('forEach iterates all points', () => {
      const tree = new PartitionTree([{ x: 1, y: 2 }, { x: 3, y: 4 }])
      const collected: PartitionPoint<undefined>[] = []
      tree.forEach((p) => collected.push(p))
      expect(collected).toHaveLength(2)
    })

    it('is iterable', () => {
      const tree = new PartitionTree([{ x: 1, y: 2 }])
      const points = [...tree]
      expect(points).toHaveLength(1)
    })

    it('bounds returns undefined for empty tree', () => {
      const tree = new PartitionTree()
      expect(tree.bounds()).toBeUndefined()
    })

    it('bounds returns correct bounding rectangle', () => {
      const tree = new PartitionTree([{ x: 1, y: 2 }, { x: 5, y: 8 }])
      const b = tree.bounds()!
      expect(b.minX).toBe(1)
      expect(b.maxX).toBe(5)
      expect(b.minY).toBe(2)
      expect(b.maxY).toBe(8)
    })
  })
})
