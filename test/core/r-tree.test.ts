import { describe, it, expect, beforeEach } from 'vitest'
import { RTree } from '../../src/core/r-tree/r-tree.js'
import { DEFAULT_RTREE_OPTIONS } from '../../src/core/r-tree/types.js'
import type { Rectangle, RTreeOptions } from '../../src/core/r-tree/types.js'

describe('RTree', () => {
  let tree: RTree<string>

  beforeEach(() => {
    tree = new RTree<string>()
  })

  describe('constructor', () => {
    it('should create an empty tree with default options', () => {
      const t = new RTree<string>()
      expect(t.size()).toBe(0)
      expect(t.isEmpty()).toBe(true)
    })

    it('should accept custom options', () => {
      const t = new RTree<string>({ maxEntries: 4, minEntries: 2 })
      expect(t.size()).toBe(0)
    })

    it('should use default maxEntries of 9', () => {
      expect(DEFAULT_RTREE_OPTIONS.maxEntries).toBe(9)
    })

    it('should use default minEntries of 4', () => {
      expect(DEFAULT_RTREE_OPTIONS.minEntries).toBe(4)
    })

    it('should throw for maxEntries less than 2', () => {
      expect(() => new RTree<string>({ maxEntries: 1 })).toThrow()
    })

    it('should accept maxEntries of 2', () => {
      const t = new RTree<string>({ maxEntries: 2, minEntries: 1 })
      expect(t.isEmpty()).toBe(true)
    })

    it('should throw for minEntries less than 1', () => {
      expect(() => new RTree<string>({ minEntries: 0 })).toThrow()
    })

    it('should throw when minEntries exceeds maxEntries', () => {
      expect(() => new RTree<string>({ maxEntries: 4, minEntries: 5 })).toThrow()
    })

    it('should accept partial options', () => {
      const t = new RTree<string>({})
      expect(t.size()).toBe(0)
    })
  })

  describe('insert', () => {
    it('should insert a single rectangle', () => {
      tree.insert({ x: 0, y: 0, width: 10, height: 10 }, 'a')
      expect(tree.size()).toBe(1)
      expect(tree.isEmpty()).toBe(false)
    })

    it('should insert multiple rectangles', () => {
      tree.insert({ x: 0, y: 0, width: 10, height: 10 }, 'a')
      tree.insert({ x: 5, y: 5, width: 10, height: 10 }, 'b')
      tree.insert({ x: 20, y: 20, width: 5, height: 5 }, 'c')
      expect(tree.size()).toBe(3)
    })

    it('should insert rectangles with zero dimensions', () => {
      tree.insert({ x: 0, y: 0, width: 0, height: 0 }, 'point')
      expect(tree.size()).toBe(1)
    })

    it('should throw for negative width', () => {
      expect(() => tree.insert({ x: 0, y: 0, width: -1, height: 10 }, 'a')).toThrow()
    })

    it('should throw for negative height', () => {
      expect(() => tree.insert({ x: 0, y: 0, width: 10, height: -1 }, 'a')).toThrow()
    })

    it('should handle overlapping rectangles', () => {
      tree.insert({ x: 0, y: 0, width: 10, height: 10 }, 'a')
      tree.insert({ x: 0, y: 0, width: 10, height: 10 }, 'b')
      expect(tree.size()).toBe(2)
    })

    it('should handle many insertions causing splits', () => {
      for (let i = 0; i < 100; i++) {
        tree.insert({ x: i * 10, y: i * 10, width: 5, height: 5 }, `item-${i}`)
      }
      expect(tree.size()).toBe(100)
    })

    it('should handle insertions with negative coordinates', () => {
      tree.insert({ x: -10, y: -10, width: 5, height: 5 }, 'a')
      expect(tree.size()).toBe(1)
    })

    it('should handle large coordinates', () => {
      tree.insert({ x: 1e10, y: 1e10, width: 100, height: 100 }, 'a')
      expect(tree.size()).toBe(1)
    })

    it('should handle many overlapping insertions', () => {
      for (let i = 0; i < 50; i++) {
        tree.insert({ x: 0, y: 0, width: 10, height: 10 }, `item-${i}`)
      }
      expect(tree.size()).toBe(50)
    })
  })

  describe('search (point)', () => {
    it('should return empty for empty tree', () => {
      expect(tree.search({ x: 5, y: 5 })).toEqual([])
    })

    it('should find a rectangle containing the point', () => {
      tree.insert({ x: 0, y: 0, width: 10, height: 10 }, 'a')
      const results = tree.search({ x: 5, y: 5 })
      expect(results).toHaveLength(1)
      expect(results[0]!.value).toBe('a')
    })

    it('should not find a rectangle not containing the point', () => {
      tree.insert({ x: 0, y: 0, width: 10, height: 10 }, 'a')
      const results = tree.search({ x: 15, y: 15 })
      expect(results).toHaveLength(0)
    })

    it('should find multiple overlapping rectangles', () => {
      tree.insert({ x: 0, y: 0, width: 10, height: 10 }, 'a')
      tree.insert({ x: 5, y: 5, width: 10, height: 10 }, 'b')
      const results = tree.search({ x: 7, y: 7 })
      expect(results).toHaveLength(2)
    })

    it('should find rectangle at boundary (min corner)', () => {
      tree.insert({ x: 0, y: 0, width: 10, height: 10 }, 'a')
      const results = tree.search({ x: 0, y: 0 })
      expect(results).toHaveLength(1)
    })

    it('should find rectangle at boundary (max corner)', () => {
      tree.insert({ x: 0, y: 0, width: 10, height: 10 }, 'a')
      const results = tree.search({ x: 10, y: 10 })
      expect(results).toHaveLength(1)
    })

    it('should find point rectangles (zero size)', () => {
      tree.insert({ x: 5, y: 5, width: 0, height: 0 }, 'point')
      const results = tree.search({ x: 5, y: 5 })
      expect(results).toHaveLength(1)
      expect(results[0]!.value).toBe('point')
    })

    it('should not find point rectangle at wrong coordinates', () => {
      tree.insert({ x: 5, y: 5, width: 0, height: 0 }, 'point')
      const results = tree.search({ x: 6, y: 6 })
      expect(results).toHaveLength(0)
    })

    it('should handle search after many insertions', () => {
      for (let i = 0; i < 50; i++) {
        tree.insert({ x: i * 10, y: 0, width: 10, height: 10 }, `item-${i}`)
      }
      const results = tree.search({ x: 25, y: 5 })
      expect(results).toHaveLength(1)
      expect(results[0]!.value).toBe('item-2')
    })

    it('should return correct rect in results', () => {
      const rect: Rectangle = { x: 1, y: 2, width: 3, height: 4 }
      tree.insert(rect, 'a')
      const results = tree.search({ x: 2, y: 3 })
      expect(results[0]!.rect).toEqual(rect)
    })
  })

  describe('searchRange', () => {
    it('should return empty for empty tree', () => {
      expect(tree.searchRange({ x: 0, y: 0, width: 10, height: 10 })).toEqual([])
    })

    it('should find intersecting rectangles', () => {
      tree.insert({ x: 0, y: 0, width: 10, height: 10 }, 'a')
      const results = tree.searchRange({ x: 5, y: 5, width: 10, height: 10 })
      expect(results).toHaveLength(1)
    })

    it('should not find non-intersecting rectangles', () => {
      tree.insert({ x: 0, y: 0, width: 10, height: 10 }, 'a')
      const results = tree.searchRange({ x: 20, y: 20, width: 5, height: 5 })
      expect(results).toHaveLength(0)
    })

    it('should find fully contained rectangles', () => {
      tree.insert({ x: 2, y: 2, width: 3, height: 3 }, 'a')
      const results = tree.searchRange({ x: 0, y: 0, width: 10, height: 10 })
      expect(results).toHaveLength(1)
    })

    it('should find rectangles that overlap at edge', () => {
      tree.insert({ x: 0, y: 0, width: 10, height: 10 }, 'a')
      const results = tree.searchRange({ x: 10, y: 0, width: 10, height: 10 })
      expect(results).toHaveLength(1)
    })

    it('should find multiple intersecting rectangles', () => {
      tree.insert({ x: 0, y: 0, width: 10, height: 10 }, 'a')
      tree.insert({ x: 5, y: 5, width: 10, height: 10 }, 'b')
      tree.insert({ x: 20, y: 20, width: 5, height: 5 }, 'c')
      const results = tree.searchRange({ x: 0, y: 0, width: 15, height: 15 })
      expect(results).toHaveLength(2)
    })

    it('should handle range covering everything', () => {
      tree.insert({ x: 0, y: 0, width: 10, height: 10 }, 'a')
      tree.insert({ x: 100, y: 100, width: 10, height: 10 }, 'b')
      const results = tree.searchRange({ x: -1000, y: -1000, width: 2000, height: 2000 })
      expect(results).toHaveLength(2)
    })

    it('should handle range covering nothing', () => {
      tree.insert({ x: 50, y: 50, width: 10, height: 10 }, 'a')
      const results = tree.searchRange({ x: 0, y: 0, width: 10, height: 10 })
      expect(results).toHaveLength(0)
    })

    it('should handle range with zero size at intersection', () => {
      tree.insert({ x: 0, y: 0, width: 10, height: 10 }, 'a')
      const results = tree.searchRange({ x: 5, y: 5, width: 0, height: 0 })
      expect(results).toHaveLength(1)
    })

    it('should handle range with zero size outside', () => {
      tree.insert({ x: 0, y: 0, width: 10, height: 10 }, 'a')
      const results = tree.searchRange({ x: 20, y: 20, width: 0, height: 0 })
      expect(results).toHaveLength(0)
    })
  })

  describe('remove', () => {
    it('should return false for empty tree', () => {
      expect(tree.remove({ x: 0, y: 0, width: 10, height: 10 })).toBe(false)
    })

    it('should remove an existing rectangle', () => {
      tree.insert({ x: 0, y: 0, width: 10, height: 10 }, 'a')
      expect(tree.remove({ x: 0, y: 0, width: 10, height: 10 })).toBe(true)
      expect(tree.size()).toBe(0)
    })

    it('should return false for non-existing rectangle', () => {
      tree.insert({ x: 0, y: 0, width: 10, height: 10 }, 'a')
      expect(tree.remove({ x: 5, y: 5, width: 10, height: 10 })).toBe(false)
    })

    it('should only remove exact match', () => {
      tree.insert({ x: 0, y: 0, width: 10, height: 10 }, 'a')
      tree.insert({ x: 0, y: 0, width: 10, height: 10 }, 'b')
      expect(tree.remove({ x: 0, y: 0, width: 10, height: 10 })).toBe(true)
      expect(tree.size()).toBe(1)
    })

    it('should remove and leave others intact', () => {
      tree.insert({ x: 0, y: 0, width: 10, height: 10 }, 'a')
      tree.insert({ x: 20, y: 20, width: 10, height: 10 }, 'b')
      tree.insert({ x: 40, y: 40, width: 10, height: 10 }, 'c')
      expect(tree.remove({ x: 20, y: 20, width: 10, height: 10 })).toBe(true)
      expect(tree.size()).toBe(2)
      expect(tree.search({ x: 5, y: 5 })).toHaveLength(1)
      expect(tree.search({ x: 45, y: 45 })).toHaveLength(1)
    })

    it('should handle removing all entries one by one', () => {
      tree.insert({ x: 0, y: 0, width: 10, height: 10 }, 'a')
      tree.insert({ x: 20, y: 20, width: 10, height: 10 }, 'b')
      tree.insert({ x: 40, y: 40, width: 10, height: 10 }, 'c')
      expect(tree.remove({ x: 0, y: 0, width: 10, height: 10 })).toBe(true)
      expect(tree.remove({ x: 20, y: 20, width: 10, height: 10 })).toBe(true)
      expect(tree.remove({ x: 40, y: 40, width: 10, height: 10 })).toBe(true)
      expect(tree.isEmpty()).toBe(true)
    })

    it('should return false for rect with wrong dimensions', () => {
      tree.insert({ x: 0, y: 0, width: 10, height: 10 }, 'a')
      expect(tree.remove({ x: 0, y: 0, width: 10, height: 5 })).toBe(false)
    })

    it('should handle remove after many insertions', () => {
      for (let i = 0; i < 50; i++) {
        tree.insert({ x: i * 10, y: 0, width: 5, height: 5 }, `item-${i}`)
      }
      expect(tree.remove({ x: 20, y: 0, width: 5, height: 5 })).toBe(true)
      expect(tree.size()).toBe(49)
    })

    it('should handle removing one of duplicate rects', () => {
      tree.insert({ x: 0, y: 0, width: 10, height: 10 }, 'a')
      tree.insert({ x: 0, y: 0, width: 10, height: 10 }, 'b')
      tree.insert({ x: 0, y: 0, width: 10, height: 10 }, 'c')
      expect(tree.remove({ x: 0, y: 0, width: 10, height: 10 })).toBe(true)
      expect(tree.size()).toBe(2)
    })
  })

  describe('size', () => {
    it('should return 0 for empty tree', () => {
      expect(tree.size()).toBe(0)
    })

    it('should return correct size after insertions', () => {
      tree.insert({ x: 0, y: 0, width: 10, height: 10 }, 'a')
      expect(tree.size()).toBe(1)
      tree.insert({ x: 5, y: 5, width: 10, height: 10 }, 'b')
      expect(tree.size()).toBe(2)
    })

    it('should return correct size after removal', () => {
      tree.insert({ x: 0, y: 0, width: 10, height: 10 }, 'a')
      tree.insert({ x: 5, y: 5, width: 10, height: 10 }, 'b')
      tree.remove({ x: 0, y: 0, width: 10, height: 10 })
      expect(tree.size()).toBe(1)
    })

    it('should return correct size after clear', () => {
      tree.insert({ x: 0, y: 0, width: 10, height: 10 }, 'a')
      tree.clear()
      expect(tree.size()).toBe(0)
    })
  })

  describe('isEmpty', () => {
    it('should return true for new tree', () => {
      expect(tree.isEmpty()).toBe(true)
    })

    it('should return false after insertion', () => {
      tree.insert({ x: 0, y: 0, width: 10, height: 10 }, 'a')
      expect(tree.isEmpty()).toBe(false)
    })

    it('should return true after removing all', () => {
      tree.insert({ x: 0, y: 0, width: 10, height: 10 }, 'a')
      tree.remove({ x: 0, y: 0, width: 10, height: 10 })
      expect(tree.isEmpty()).toBe(true)
    })

    it('should return true after clear', () => {
      tree.insert({ x: 0, y: 0, width: 10, height: 10 }, 'a')
      tree.insert({ x: 5, y: 5, width: 10, height: 10 }, 'b')
      tree.clear()
      expect(tree.isEmpty()).toBe(true)
    })
  })

  describe('clear', () => {
    it('should clear an empty tree', () => {
      tree.clear()
      expect(tree.isEmpty()).toBe(true)
      expect(tree.size()).toBe(0)
    })

    it('should clear a populated tree', () => {
      tree.insert({ x: 0, y: 0, width: 10, height: 10 }, 'a')
      tree.insert({ x: 5, y: 5, width: 10, height: 10 }, 'b')
      tree.clear()
      expect(tree.size()).toBe(0)
      expect(tree.isEmpty()).toBe(true)
    })

    it('should allow insertions after clear', () => {
      tree.insert({ x: 0, y: 0, width: 10, height: 10 }, 'a')
      tree.clear()
      tree.insert({ x: 5, y: 5, width: 10, height: 10 }, 'b')
      expect(tree.size()).toBe(1)
    })
  })

  describe('forEach', () => {
    it('should not call callback for empty tree', () => {
      let count = 0
      tree.forEach(() => { count++ })
      expect(count).toBe(0)
    })

    it('should iterate over all entries', () => {
      tree.insert({ x: 0, y: 0, width: 10, height: 10 }, 'a')
      tree.insert({ x: 5, y: 5, width: 10, height: 10 }, 'b')
      tree.insert({ x: 20, y: 20, width: 5, height: 5 }, 'c')
      const values: string[] = []
      tree.forEach((_rect, value) => { values.push(value) })
      expect(values).toHaveLength(3)
      expect(values.sort()).toEqual(['a', 'b', 'c'])
    })

    it('should provide correct rectangles', () => {
      const rect: Rectangle = { x: 1, y: 2, width: 3, height: 4 }
      tree.insert(rect, 'a')
      let found = false
      tree.forEach((r, _v) => {
        expect(r.x).toBe(1)
        expect(r.y).toBe(2)
        expect(r.width).toBe(3)
        expect(r.height).toBe(4)
        found = true
      })
      expect(found).toBe(true)
    })
  })

  describe('toArray', () => {
    it('should return empty array for empty tree', () => {
      expect(tree.toArray()).toEqual([])
    })

    it('should return all entries', () => {
      tree.insert({ x: 0, y: 0, width: 10, height: 10 }, 'a')
      tree.insert({ x: 5, y: 5, width: 10, height: 10 }, 'b')
      const arr = tree.toArray()
      expect(arr).toHaveLength(2)
    })

    it('should return entries with correct structure', () => {
      tree.insert({ x: 0, y: 0, width: 10, height: 10 }, 'a')
      const arr = tree.toArray()
      expect(arr[0]!.rect).toEqual({ x: 0, y: 0, width: 10, height: 10 })
      expect(arr[0]!.value).toBe('a')
    })

    it('should return all entries after many insertions', () => {
      for (let i = 0; i < 30; i++) {
        tree.insert({ x: i, y: i, width: 1, height: 1 }, `item-${i}`)
      }
      expect(tree.toArray()).toHaveLength(30)
    })
  })

  describe('split behavior', () => {
    it('should handle tree with low maxEntries', () => {
      const t = new RTree<string>({ maxEntries: 4, minEntries: 2 })
      for (let i = 0; i < 20; i++) {
        t.insert({ x: i * 5, y: i * 5, width: 2, height: 2 }, `item-${i}`)
      }
      expect(t.size()).toBe(20)
    })

    it('should maintain searchability after splits', () => {
      const t = new RTree<string>({ maxEntries: 4, minEntries: 2 })
      for (let i = 0; i < 20; i++) {
        t.insert({ x: i * 5, y: 0, width: 3, height: 3 }, `item-${i}`)
      }
      for (let i = 0; i < 20; i++) {
        const results = t.search({ x: i * 5 + 1, y: 1 })
        expect(results).toHaveLength(1)
        expect(results[0]!.value).toBe(`item-${i}`)
      }
    })

    it('should handle minimum config (maxEntries=2)', () => {
      const t = new RTree<string>({ maxEntries: 2, minEntries: 1 })
      for (let i = 0; i < 10; i++) {
        t.insert({ x: i, y: i, width: 1, height: 1 }, `item-${i}`)
      }
      expect(t.size()).toBe(10)
      expect(t.search({ x: 5, y: 5 })).toHaveLength(2)
    })

    it('should handle clustered data causing many splits', () => {
      const t = new RTree<number>({ maxEntries: 4, minEntries: 2 })
      for (let i = 0; i < 30; i++) {
        t.insert({ x: 0, y: 0, width: 1, height: 1 }, i)
      }
      expect(t.size()).toBe(30)
      expect(t.search({ x: 0, y: 0 })).toHaveLength(30)
    })
  })

  describe('type exports', () => {
    it('should export Rectangle type', () => {
      const rect: Rectangle = { x: 0, y: 0, width: 10, height: 10 }
      expect(rect.x).toBe(0)
    })

    it('should export RTreeOptions type', () => {
      const opts: RTreeOptions = { maxEntries: 5, minEntries: 2 }
      expect(opts.maxEntries).toBe(5)
    })

    it('should export DEFAULT_RTREE_OPTIONS', () => {
      expect(DEFAULT_RTREE_OPTIONS.maxEntries).toBe(9)
      expect(DEFAULT_RTREE_OPTIONS.minEntries).toBe(4)
    })
  })

  describe('complex scenarios', () => {
    it('should handle insert-remove-insert cycles', () => {
      tree.insert({ x: 0, y: 0, width: 10, height: 10 }, 'a')
      tree.remove({ x: 0, y: 0, width: 10, height: 10 })
      tree.insert({ x: 0, y: 0, width: 10, height: 10 }, 'b')
      expect(tree.size()).toBe(1)
      const results = tree.search({ x: 5, y: 5 })
      expect(results[0]!.value).toBe('b')
    })

    it('should handle mixed search types', () => {
      tree.insert({ x: 0, y: 0, width: 10, height: 10 }, 'a')
      tree.insert({ x: 5, y: 5, width: 10, height: 10 }, 'b')
      tree.insert({ x: 20, y: 20, width: 5, height: 5 }, 'c')
      const pointResults = tree.search({ x: 7, y: 7 })
      expect(pointResults).toHaveLength(2)
      const rangeResults = tree.searchRange({ x: 0, y: 0, width: 50, height: 50 })
      expect(rangeResults).toHaveLength(3)
    })

    it('should handle negative coordinate rectangles', () => {
      tree.insert({ x: -10, y: -10, width: 20, height: 20 }, 'a')
      expect(tree.search({ x: 0, y: 0 })).toHaveLength(1)
      expect(tree.search({ x: -5, y: -5 })).toHaveLength(1)
      expect(tree.search({ x: -15, y: -15 })).toHaveLength(0)
    })

    it('should handle very thin rectangles', () => {
      tree.insert({ x: 0, y: 0, width: 100, height: 0 }, 'line')
      expect(tree.search({ x: 50, y: 0 })).toHaveLength(1)
      expect(tree.search({ x: 50, y: 1 })).toHaveLength(0)
    })

    it('should handle very tall rectangles', () => {
      tree.insert({ x: 0, y: 0, width: 0, height: 100 }, 'line')
      expect(tree.search({ x: 0, y: 50 })).toHaveLength(1)
      expect(tree.search({ x: 1, y: 50 })).toHaveLength(0)
    })

    it('should handle boundary search correctly', () => {
      tree.insert({ x: 0, y: 0, width: 10, height: 10 }, 'a')
      tree.insert({ x: 10, y: 10, width: 10, height: 10 }, 'b')
      const cornerResults = tree.search({ x: 10, y: 10 })
      expect(cornerResults).toHaveLength(2)
    })

    it('should handle range search with adjacent rectangles', () => {
      tree.insert({ x: 0, y: 0, width: 10, height: 10 }, 'a')
      tree.insert({ x: 10, y: 0, width: 10, height: 10 }, 'b')
      const results = tree.searchRange({ x: 5, y: 0, width: 10, height: 10 })
      expect(results).toHaveLength(2)
    })

    it('should handle large dataset with varied data', () => {
      const t = new RTree<number>({ maxEntries: 4, minEntries: 2 })
      for (let i = 0; i < 200; i++) {
        const x = (i % 20) * 10
        const y = Math.floor(i / 20) * 10
        t.insert({ x, y, width: 5, height: 5 }, i)
      }
      expect(t.size()).toBe(200)
      const arr = t.toArray()
      expect(arr).toHaveLength(200)
    })

    it('should maintain consistency after removing from split tree', () => {
      const t = new RTree<string>({ maxEntries: 4, minEntries: 2 })
      for (let i = 0; i < 10; i++) {
        t.insert({ x: i * 10, y: 0, width: 5, height: 5 }, `item-${i}`)
      }
      t.remove({ x: 0, y: 0, width: 5, height: 5 })
      t.remove({ x: 90, y: 0, width: 5, height: 5 })
      expect(t.size()).toBe(8)
      expect(t.search({ x: 0, y: 0 })).toHaveLength(0)
      expect(t.search({ x: 91, y: 0 })).toHaveLength(0)
      expect(t.search({ x: 11, y: 1 })).toHaveLength(1)
    })
  })

  describe('generic types', () => {
    it('should work with number values', () => {
      const t = new RTree<number>()
      t.insert({ x: 0, y: 0, width: 10, height: 10 }, 42)
      const results = t.search({ x: 5, y: 5 })
      expect(results[0]!.value).toBe(42)
    })

    it('should work with object values', () => {
      const t = new RTree<{ name: string }>()
      t.insert({ x: 0, y: 0, width: 10, height: 10 }, { name: 'test' })
      const results = t.search({ x: 5, y: 5 })
      expect(results[0]!.value.name).toBe('test')
    })

    it('should work with null values', () => {
      const t = new RTree<null>()
      t.insert({ x: 0, y: 0, width: 10, height: 10 }, null)
      const results = t.search({ x: 5, y: 5 })
      expect(results[0]!.value).toBeNull()
    })
  })
})
