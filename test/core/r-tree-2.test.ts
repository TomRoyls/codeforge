import { describe, it, expect, beforeEach } from 'vitest'
import { RTree2 } from '../../src/core/r-tree-2/index.js'
import type { Rectangle } from '../../src/core/r-tree-2/index.js'

// ─── Constructor ───

describe('RTree2', () => {
  describe('constructor', () => {
    it('should create an empty tree with default parameters', () => {
      const tree = new RTree2<string>()
      expect(tree.size).toBe(0)
      expect(tree.isEmpty()).toBe(true)
    })

    it('should accept custom min/max entries', () => {
      const tree = new RTree2<string>(2, 4)
      expect(tree.size).toBe(0)
      expect(tree.isEmpty()).toBe(true)
    })

    it('should throw for minEntries < 2', () => {
      expect(() => new RTree2<string>(1, 9)).toThrow('Invalid min/max entries')
    })

    it('should throw for maxEntries < minEntries', () => {
      expect(() => new RTree2<string>(10, 5)).toThrow('Invalid min/max entries')
    })

    it('should accept minEntries = 2', () => {
      const tree = new RTree2<string>(2, 4)
      expect(tree.isEmpty()).toBe(true)
    })
  })

  // ─── Insert and Size ───

  describe('insert', () => {
    let tree: RTree2<string>

    beforeEach(() => {
      tree = new RTree2<string>(2, 4)
    })

    it('should insert a single item', () => {
      const rect: Rectangle = { minX: 0, minY: 0, maxX: 10, maxY: 10 }
      tree.insert(rect, 'a')
      expect(tree.size).toBe(1)
      expect(tree.isEmpty()).toBe(false)
    })

    it('should insert multiple items', () => {
      for (let i = 0; i < 10; i++) {
        tree.insert({ minX: i, minY: i, maxX: i + 1, maxY: i + 1 }, `item-${i}`)
      }
      expect(tree.size).toBe(10)
    })

    it('should handle duplicate values', () => {
      const rect: Rectangle = { minX: 0, minY: 0, maxX: 10, maxY: 10 }
      tree.insert(rect, 'dup')
      tree.insert(rect, 'dup')
      expect(tree.size).toBe(2)
    })

    it('should handle zero-area rectangles', () => {
      const rect: Rectangle = { minX: 5, minY: 5, maxX: 5, maxY: 5 }
      tree.insert(rect, 'point')
      expect(tree.size).toBe(1)
    })

    it('should handle negative coordinates', () => {
      const rect: Rectangle = { minX: -10, minY: -10, maxX: -1, maxY: -1 }
      tree.insert(rect, 'neg')
      expect(tree.size).toBe(1)
    })
  })

  // ─── Search (point query) ───

  describe('search', () => {
    let tree: RTree2<string>

    beforeEach(() => {
      tree = new RTree2<string>(2, 4)
    })

    it('should return empty for empty tree', () => {
      expect(tree.search({ x: 5, y: 5 })).toEqual([])
    })

    it('should find a single item containing the point', () => {
      tree.insert({ minX: 0, minY: 0, maxX: 10, maxY: 10 }, 'found')
      expect(tree.search({ x: 5, y: 5 })).toEqual(['found'])
    })

    it('should not find items not containing the point', () => {
      tree.insert({ minX: 20, minY: 20, maxX: 30, maxY: 30 }, 'far')
      expect(tree.search({ x: 5, y: 5 })).toEqual([])
    })

    it('should find multiple overlapping items', () => {
      tree.insert({ minX: 0, minY: 0, maxX: 10, maxY: 10 }, 'a')
      tree.insert({ minX: 5, minY: 5, maxX: 15, maxY: 15 }, 'b')
      tree.insert({ minX: 0, minY: 0, maxX: 20, maxY: 20 }, 'c')
      const results = tree.search({ x: 7, y: 7 })
      expect(results.sort()).toEqual(['a', 'b', 'c'])
    })

    it('should find items at rectangle boundary (inclusive)', () => {
      tree.insert({ minX: 0, minY: 0, maxX: 10, maxY: 10 }, 'edge')
      expect(tree.search({ x: 0, y: 0 })).toEqual(['edge'])
      expect(tree.search({ x: 10, y: 10 })).toEqual(['edge'])
    })

    it('should not find items just outside boundary', () => {
      tree.insert({ minX: 0, minY: 0, maxX: 10, maxY: 10 }, 'inside')
      expect(tree.search({ x: 10.1, y: 5 })).toEqual([])
    })
  })

  // ─── SearchArea (rectangle overlap query) ───

  describe('searchArea', () => {
    let tree: RTree2<string>

    beforeEach(() => {
      tree = new RTree2<string>(2, 4)
    })

    it('should return empty for empty tree', () => {
      expect(tree.searchArea({ minX: 0, minY: 0, maxX: 10, maxY: 10 })).toEqual([])
    })

    it('should find items overlapping the search rectangle', () => {
      tree.insert({ minX: 0, minY: 0, maxX: 10, maxY: 10 }, 'a')
      tree.insert({ minX: 5, minY: 5, maxX: 15, maxY: 15 }, 'b')
      const results = tree.searchArea({ minX: 3, minY: 3, maxX: 7, maxY: 7 })
      expect(results.sort()).toEqual(['a', 'b'])
    })

    it('should not find non-overlapping items', () => {
      tree.insert({ minX: 0, minY: 0, maxX: 5, maxY: 5 }, 'left')
      tree.insert({ minX: 10, minY: 10, maxX: 20, maxY: 20 }, 'right')
      const results = tree.searchArea({ minX: 6, minY: 6, maxX: 9, maxY: 9 })
      expect(results).toEqual([])
    })

    it('should find items with edge overlap', () => {
      tree.insert({ minX: 0, minY: 0, maxX: 10, maxY: 10 }, 'edge')
      expect(tree.searchArea({ minX: 10, minY: 10, maxX: 20, maxY: 20 })).toEqual(['edge'])
    })
  })

  // ─── Remove ───

  describe('remove', () => {
    let tree: RTree2<string>

    beforeEach(() => {
      tree = new RTree2<string>(2, 4)
    })

    it('should return false for empty tree', () => {
      expect(tree.remove({ minX: 0, minY: 0, maxX: 10, maxY: 10 }, 'a')).toBe(false)
    })

    it('should remove an existing item', () => {
      const rect: Rectangle = { minX: 0, minY: 0, maxX: 10, maxY: 10 }
      tree.insert(rect, 'a')
      expect(tree.remove(rect, 'a')).toBe(true)
      expect(tree.size).toBe(0)
      expect(tree.isEmpty()).toBe(true)
    })

    it('should return false for non-existent value', () => {
      const rect: Rectangle = { minX: 0, minY: 0, maxX: 10, maxY: 10 }
      tree.insert(rect, 'a')
      expect(tree.remove(rect, 'b')).toBe(false)
      expect(tree.size).toBe(1)
    })

    it('should remove and leave other items intact', () => {
      const rect1: Rectangle = { minX: 0, minY: 0, maxX: 10, maxY: 10 }
      const rect2: Rectangle = { minX: 5, minY: 5, maxX: 15, maxY: 15 }
      tree.insert(rect1, 'a')
      tree.insert(rect2, 'b')
      expect(tree.remove(rect1, 'a')).toBe(true)
      expect(tree.size).toBe(1)
      expect(tree.search({ x: 7, y: 7 })).toEqual(['b'])
    })

    it('should handle removing from many items', () => {
      for (let i = 0; i < 20; i++) {
        tree.insert({ minX: i, minY: i, maxX: i + 1, maxY: i + 1 }, `item-${i}`)
      }
      expect(tree.remove({ minX: 5, minY: 5, maxX: 6, maxY: 6 }, 'item-5')).toBe(true)
      expect(tree.size).toBe(19)
    })
  })

  // ─── Contains ───

  describe('contains', () => {
    let tree: RTree2<string>

    beforeEach(() => {
      tree = new RTree2<string>(2, 4)
    })

    it('should return false for empty tree', () => {
      expect(tree.contains('a')).toBe(false)
    })

    it('should return true for existing value', () => {
      tree.insert({ minX: 0, minY: 0, maxX: 10, maxY: 10 }, 'a')
      expect(tree.contains('a')).toBe(true)
    })

    it('should return false for non-existing value', () => {
      tree.insert({ minX: 0, minY: 0, maxX: 10, maxY: 10 }, 'a')
      expect(tree.contains('b')).toBe(false)
    })

    it('should work with numeric values', () => {
      const numTree = new RTree2<number>(2, 4)
      numTree.insert({ minX: 0, minY: 0, maxX: 10, maxY: 10 }, 42)
      expect(numTree.contains(42)).toBe(true)
      expect(numTree.contains(99)).toBe(false)
    })
  })

  // ─── ToArray ───

  describe('toArray', () => {
    it('should return empty for empty tree', () => {
      const tree = new RTree2<string>()
      expect(tree.toArray()).toEqual([])
    })

    it('should return all inserted values', () => {
      const tree = new RTree2<string>(2, 4)
      tree.insert({ minX: 0, minY: 0, maxX: 1, maxY: 1 }, 'a')
      tree.insert({ minX: 2, minY: 2, maxX: 3, maxY: 3 }, 'b')
      tree.insert({ minX: 4, minY: 4, maxX: 5, maxY: 5 }, 'c')
      const arr = tree.toArray().sort()
      expect(arr).toEqual(['a', 'b', 'c'])
    })
  })

  // ─── Clear ───

  describe('clear', () => {
    it('should clear all items', () => {
      const tree = new RTree2<string>(2, 4)
      tree.insert({ minX: 0, minY: 0, maxX: 10, maxY: 10 }, 'a')
      tree.insert({ minX: 5, minY: 5, maxX: 15, maxY: 15 }, 'b')
      tree.clear()
      expect(tree.size).toBe(0)
      expect(tree.isEmpty()).toBe(true)
      expect(tree.toArray()).toEqual([])
    })

    it('should allow insertions after clear', () => {
      const tree = new RTree2<string>(2, 4)
      tree.insert({ minX: 0, minY: 0, maxX: 10, maxY: 10 }, 'old')
      tree.clear()
      tree.insert({ minX: 0, minY: 0, maxX: 10, maxY: 10 }, 'new')
      expect(tree.size).toBe(1)
      expect(tree.search({ x: 5, y: 5 })).toEqual(['new'])
    })
  })

  // ─── Edge Cases and Stress ───

  describe('edge cases', () => {
    it('should handle many inserts causing tree splits', () => {
      const tree = new RTree2<number>(2, 4)
      for (let i = 0; i < 50; i++) {
        tree.insert({ minX: i * 2, minY: i * 2, maxX: i * 2 + 1, maxY: i * 2 + 1 }, i)
      }
      expect(tree.size).toBe(50)
    })

    it('should find items after many inserts', () => {
      const tree = new RTree2<number>(2, 4)
      for (let i = 0; i < 30; i++) {
        tree.insert({ minX: i, minY: i, maxX: i + 1, maxY: i + 1 }, i)
      }
      expect(tree.search({ x: 15.5, y: 15.5 })).toEqual([15])
      expect(tree.search({ x: 0.5, y: 0.5 })).toEqual([0])
    })

    it('should handle same-rectangle inserts', () => {
      const tree = new RTree2<string>(2, 4)
      const rect: Rectangle = { minX: 0, minY: 0, maxX: 10, maxY: 10 }
      tree.insert(rect, 'a')
      tree.insert(rect, 'b')
      tree.insert(rect, 'c')
      const results = tree.search({ x: 5, y: 5 }).sort()
      expect(results).toEqual(['a', 'b', 'c'])
    })
  })
})
