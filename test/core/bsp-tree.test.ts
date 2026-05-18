import { describe, it, expect } from 'vitest'
import { BSPTree } from '../../src/core/bsp-tree/index.js'
import type { LineSegment, Rectangle } from '../../src/core/bsp-tree/index.js'

describe('BSPTree', () => {

  // ─── Constructor ───

  describe('constructor', () => {
    it('should create an empty tree', () => {
      const tree = new BSPTree()
      expect(tree.size).toBe(0)
      expect(tree.isEmpty()).toBe(true)
    })
  })

  // ─── Insert ───

  describe('insert', () => {
    it('should insert a valid segment', () => {
      const tree = new BSPTree()
      const seg: LineSegment = { x1: 0, y1: 0, x2: 1, y2: 1 }
      expect(tree.insert(seg)).toBe(true)
      expect(tree.size).toBe(1)
    })

    it('should reject degenerate segment (zero length)', () => {
      const tree = new BSPTree()
      const seg: LineSegment = { x1: 0, y1: 0, x2: 0, y2: 0 }
      expect(tree.insert(seg)).toBe(false)
      expect(tree.size).toBe(0)
    })

    it('should reject segment with NaN values', () => {
      const tree = new BSPTree()
      const seg: LineSegment = { x1: NaN, y1: 0, x2: 1, y2: 1 }
      expect(tree.insert(seg)).toBe(false)
    })

    it('should insert multiple segments', () => {
      const tree = new BSPTree()
      tree.insert({ x1: 0, y1: 0, x2: 1, y2: 1 })
      tree.insert({ x1: 0, y1: 1, x2: 1, y2: 0 })
      tree.insert({ x1: 2, y1: 2, x2: 3, y2: 3 })
      expect(tree.size).toBe(3)
    })

    it('should handle horizontal segment', () => {
      const tree = new BSPTree()
      expect(tree.insert({ x1: 0, y1: 5, x2: 10, y2: 5 })).toBe(true)
      expect(tree.size).toBe(1)
    })

    it('should handle vertical segment', () => {
      const tree = new BSPTree()
      expect(tree.insert({ x1: 5, y1: 0, x2: 5, y2: 10 })).toBe(true)
      expect(tree.size).toBe(1)
    })

    it('should handle negative coordinates', () => {
      const tree = new BSPTree()
      expect(tree.insert({ x1: -5, y1: -5, x2: 5, y2: 5 })).toBe(true)
      expect(tree.size).toBe(1)
    })
  })

  // ─── Remove ───

  describe('remove', () => {
    it('should remove an existing segment', () => {
      const tree = new BSPTree()
      const seg: LineSegment = { x1: 0, y1: 0, x2: 1, y2: 1 }
      tree.insert(seg)
      expect(tree.remove(seg)).toBe(true)
      expect(tree.size).toBe(0)
    })

    it('should return false when removing from empty tree', () => {
      const tree = new BSPTree()
      expect(tree.remove({ x1: 0, y1: 0, x2: 1, y2: 1 })).toBe(false)
    })

    it('should return false when removing non-existent segment', () => {
      const tree = new BSPTree()
      tree.insert({ x1: 0, y1: 0, x2: 1, y2: 1 })
      expect(tree.remove({ x1: 5, y1: 5, x2: 6, y2: 6 })).toBe(false)
    })

    it('should remove only the specified segment', () => {
      const tree = new BSPTree()
      const seg1: LineSegment = { x1: 0, y1: 0, x2: 1, y2: 1 }
      const seg2: LineSegment = { x1: 0, y1: 1, x2: 1, y2: 0 }
      tree.insert(seg1)
      tree.insert(seg2)
      tree.remove(seg1)
      expect(tree.size).toBe(1)
    })
  })

  // ─── QueryPoint ───

  describe('queryPoint', () => {
    it('should find segment containing a point', () => {
      const tree = new BSPTree()
      const seg: LineSegment = { x1: 0, y1: 0, x2: 2, y2: 0 }
      tree.insert(seg)
      const results = tree.queryPoint(1, 0)
      expect(results.length).toBeGreaterThanOrEqual(1)
      expect(results.some(s => s.x1 === 0 && s.y1 === 0 && s.x2 === 2 && s.y2 === 0)).toBe(true)
    })

    it('should return empty for point on no segment', () => {
      const tree = new BSPTree()
      tree.insert({ x1: 0, y1: 0, x2: 1, y2: 1 })
      expect(tree.queryPoint(50, 50)).toEqual([])
    })

    it('should return empty for empty tree', () => {
      const tree = new BSPTree()
      expect(tree.queryPoint(0, 0)).toEqual([])
    })
  })

  // ─── QueryRegion ───

  describe('queryRegion', () => {
    it('should find segments intersecting a region', () => {
      const tree = new BSPTree()
      tree.insert({ x1: 0, y1: 0, x2: 2, y2: 2 })
      tree.insert({ x1: 5, y1: 5, x2: 7, y2: 7 })
      const rect: Rectangle = { minX: -1, minY: -1, maxX: 1, maxY: 1 }
      const results = tree.queryRegion(rect)
      expect(results.length).toBeGreaterThanOrEqual(1)
    })

    it('should return empty for non-intersecting region', () => {
      const tree = new BSPTree()
      tree.insert({ x1: 0, y1: 0, x2: 1, y2: 1 })
      const rect: Rectangle = { minX: 10, minY: 10, maxX: 20, maxY: 20 }
      expect(tree.queryRegion(rect)).toEqual([])
    })

    it('should return empty for empty tree', () => {
      const tree = new BSPTree()
      const rect: Rectangle = { minX: 0, minY: 0, maxX: 10, maxY: 10 }
      expect(tree.queryRegion(rect)).toEqual([])
    })
  })

  // ─── Traversal ───

  describe('traversal', () => {
    it('should traverse in order', () => {
      const tree = new BSPTree()
      tree.insert({ x1: 0, y1: 0, x2: 1, y2: 1 })
      tree.insert({ x1: 2, y1: 2, x2: 3, y2: 3 })
      const segments: LineSegment[] = []
      tree.traverseInOrder(s => segments.push(s))
      expect(segments.length).toBe(2)
    })

    it('should traverse pre order', () => {
      const tree = new BSPTree()
      tree.insert({ x1: 0, y1: 0, x2: 1, y2: 1 })
      tree.insert({ x1: 2, y1: 2, x2: 3, y2: 3 })
      const segments: LineSegment[] = []
      tree.traversePreOrder(s => segments.push(s))
      expect(segments.length).toBe(2)
    })

    it('should not call callback on empty tree', () => {
      const tree = new BSPTree()
      let called = false
      tree.traverseInOrder(() => { called = true })
      expect(called).toBe(false)
    })
  })

  // ─── Clear ───

  describe('clear', () => {
    it('should clear the tree', () => {
      const tree = new BSPTree()
      tree.insert({ x1: 0, y1: 0, x2: 1, y2: 1 })
      tree.clear()
      expect(tree.size).toBe(0)
      expect(tree.isEmpty()).toBe(true)
    })

    it('should be usable after clear', () => {
      const tree = new BSPTree()
      tree.insert({ x1: 0, y1: 0, x2: 1, y2: 1 })
      tree.clear()
      tree.insert({ x1: 2, y1: 2, x2: 3, y2: 3 })
      expect(tree.size).toBe(1)
    })
  })

  // ─── ToArray ───

  describe('toArray', () => {
    it('should return all segments', () => {
      const tree = new BSPTree()
      tree.insert({ x1: 0, y1: 0, x2: 1, y2: 1 })
      tree.insert({ x1: 2, y1: 2, x2: 3, y2: 3 })
      expect(tree.toArray().length).toBe(2)
    })

    it('should return empty array for empty tree', () => {
      const tree = new BSPTree()
      expect(tree.toArray()).toEqual([])
    })
  })
})
