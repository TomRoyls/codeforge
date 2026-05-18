import { describe, it, expect, beforeEach } from 'vitest'
import { RTree3 } from '../../src/core/r-tree-3/index.js'

// ─── Constructor ───

describe('RTree3', () => {
  describe('constructor', () => {
    it('should create an empty tree with default maxEntries', () => {
      const tree = new RTree3<string>()
      expect(tree.size).toBe(0)
      expect(tree.isEmpty()).toBe(true)
      expect(tree.root).toBeNull()
    })

    it('should create an empty tree with custom maxEntries', () => {
      const tree = new RTree3<string>(4)
      expect(tree.size).toBe(0)
      expect(tree.isEmpty()).toBe(true)
    })

    it('should calculate minEntries as ceil(maxEntries/2)', () => {
      const tree = new RTree3<string>(9)
      expect(tree.minEntries).toBe(5)
    })

    it('should calculate minEntries for even maxEntries', () => {
      const tree = new RTree3<string>(4)
      expect(tree.minEntries).toBe(2)
    })
  })

  // ─── Insert ───

  describe('insert', () => {
    let tree: RTree3<string>

    beforeEach(() => {
      tree = new RTree3<string>(4)
    })

    it('should insert a single item', () => {
      tree.insert({ minX: 0, minY: 0, maxX: 10, maxY: 10 }, 'a')
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
      const rect = { minX: 0, minY: 0, maxX: 10, maxY: 10 }
      tree.insert(rect, 'dup')
      tree.insert(rect, 'dup')
      expect(tree.size).toBe(2)
    })

    it('should handle zero-area rectangles (points)', () => {
      tree.insert({ minX: 5, minY: 5, maxX: 5, maxY: 5 }, 'point')
      expect(tree.size).toBe(1)
    })

    it('should handle negative coordinates', () => {
      tree.insert({ minX: -10, minY: -10, maxX: -1, maxY: -1 }, 'neg')
      expect(tree.size).toBe(1)
    })

    it('should create root on first insert', () => {
      expect(tree.root).toBeNull()
      tree.insert({ minX: 0, minY: 0, maxX: 1, maxY: 1 }, 'first')
      expect(tree.root).not.toBeNull()
    })

    it('should trigger leaf splits beyond maxEntries', () => {
      for (let i = 0; i < 20; i++) {
        tree.insert({ minX: i * 10, minY: i * 10, maxX: i * 10 + 5, maxY: i * 10 + 5 }, `v${i}`)
      }
      expect(tree.size).toBe(20)
    })
  })

  // ─── Search ───

  describe('search', () => {
    let tree: RTree3<string>

    beforeEach(() => {
      tree = new RTree3<string>(4)
    })

    it('should return empty for empty tree', () => {
      expect(tree.search({ minX: 0, minY: 0, maxX: 10, maxY: 10 })).toEqual([])
    })

    it('should find an overlapping item', () => {
      tree.insert({ minX: 0, minY: 0, maxX: 10, maxY: 10 }, 'found')
      const results = tree.search({ minX: 5, minY: 5, maxX: 15, maxY: 15 })
      expect(results).toEqual(['found'])
    })

    it('should not find non-overlapping items', () => {
      tree.insert({ minX: 20, minY: 20, maxX: 30, maxY: 30 }, 'far')
      expect(tree.search({ minX: 0, minY: 0, maxX: 10, maxY: 10 })).toEqual([])
    })

    it('should find multiple overlapping items', () => {
      tree.insert({ minX: 0, minY: 0, maxX: 10, maxY: 10 }, 'a')
      tree.insert({ minX: 5, minY: 5, maxX: 15, maxY: 15 }, 'b')
      tree.insert({ minX: 0, minY: 0, maxX: 20, maxY: 20 }, 'c')
      const results = tree.search({ minX: 3, minY: 3, maxX: 7, maxY: 7 }).sort()
      expect(results).toEqual(['a', 'b', 'c'])
    })

    it('should find items with edge overlap', () => {
      tree.insert({ minX: 0, minY: 0, maxX: 10, maxY: 10 }, 'edge')
      expect(tree.search({ minX: 10, minY: 10, maxX: 20, maxY: 20 })).toEqual(['edge'])
    })

    it('should work with many items', () => {
      for (let i = 0; i < 30; i++) {
        tree.insert({ minX: i, minY: i, maxX: i + 1, maxY: i + 1 }, `v${i}`)
      }
      const results = tree.search({ minX: 15.1, minY: 15.1, maxX: 15.9, maxY: 15.9 })
      expect(results).toContain('v15')
    })
  })

  // ─── Remove ───

  describe('remove', () => {
    let tree: RTree3<string>

    beforeEach(() => {
      tree = new RTree3<string>(4)
    })

    it('should return false for empty tree', () => {
      expect(tree.remove({ minX: 0, minY: 0, maxX: 10, maxY: 10 }, 'a')).toBe(false)
    })

    it('should remove an existing item', () => {
      const rect = { minX: 0, minY: 0, maxX: 10, maxY: 10 }
      tree.insert(rect, 'a')
      expect(tree.remove(rect, 'a')).toBe(true)
      expect(tree.size).toBe(0)
      expect(tree.isEmpty()).toBe(true)
    })

    it('should return false for non-existent value', () => {
      const rect = { minX: 0, minY: 0, maxX: 10, maxY: 10 }
      tree.insert(rect, 'a')
      expect(tree.remove(rect, 'b')).toBe(false)
      expect(tree.size).toBe(1)
    })

    it('should remove and leave other items intact', () => {
      const rect1 = { minX: 0, minY: 0, maxX: 10, maxY: 10 }
      const rect2 = { minX: 5, minY: 5, maxX: 15, maxY: 15 }
      tree.insert(rect1, 'a')
      tree.insert(rect2, 'b')
      expect(tree.remove(rect1, 'a')).toBe(true)
      expect(tree.size).toBe(1)
      expect(tree.search({ minX: 5, minY: 5, maxX: 15, maxY: 15 })).toEqual(['b'])
    })

    it('should handle removing last item (root becomes null)', () => {
      const rect = { minX: 0, minY: 0, maxX: 10, maxY: 10 }
      tree.insert(rect, 'only')
      expect(tree.remove(rect, 'only')).toBe(true)
      expect(tree.root).toBeNull()
      expect(tree.isEmpty()).toBe(true)
    })

    it('should handle removal from many items', () => {
      for (let i = 0; i < 20; i++) {
        tree.insert({ minX: i, minY: i, maxX: i + 1, maxY: i + 1 }, `v${i}`)
      }
      expect(tree.remove({ minX: 5, minY: 5, maxX: 6, maxY: 6 }, 'v5')).toBe(true)
      expect(tree.size).toBe(19)
    })

    it('should not match on different rect', () => {
      tree.insert({ minX: 0, minY: 0, maxX: 10, maxY: 10 }, 'a')
      expect(tree.remove({ minX: 0, minY: 0, maxX: 5, maxY: 5 }, 'a')).toBe(false)
    })
  })

  // ─── ToArray ───

  describe('toArray', () => {
    it('should return empty for empty tree', () => {
      const tree = new RTree3<string>()
      expect(tree.toArray()).toEqual([])
    })

    it('should return all entries with rect and data', () => {
      const tree = new RTree3<string>(4)
      tree.insert({ minX: 0, minY: 0, maxX: 1, maxY: 1 }, 'a')
      tree.insert({ minX: 2, minY: 2, maxX: 3, maxY: 3 }, 'b')
      const arr = tree.toArray()
      expect(arr.length).toBe(2)
      const datas = arr.map(e => e.data).sort()
      expect(datas).toEqual(['a', 'b'])
    })

    it('should preserve rect info', () => {
      const tree = new RTree3<string>(4)
      tree.insert({ minX: 0, minY: 0, maxX: 10, maxY: 10 }, 'a')
      const entry = tree.toArray()[0]!
      expect(entry.rect).toEqual({ minX: 0, minY: 0, maxX: 10, maxY: 10 })
      expect(entry.data).toBe('a')
    })
  })

  // ─── Clear ───

  describe('clear', () => {
    it('should clear all items', () => {
      const tree = new RTree3<string>(4)
      tree.insert({ minX: 0, minY: 0, maxX: 10, maxY: 10 }, 'a')
      tree.insert({ minX: 5, minY: 5, maxX: 15, maxY: 15 }, 'b')
      tree.clear()
      expect(tree.size).toBe(0)
      expect(tree.isEmpty()).toBe(true)
      expect(tree.root).toBeNull()
      expect(tree.toArray()).toEqual([])
    })

    it('should allow insertions after clear', () => {
      const tree = new RTree3<string>(4)
      tree.insert({ minX: 0, minY: 0, maxX: 10, maxY: 10 }, 'old')
      tree.clear()
      tree.insert({ minX: 0, minY: 0, maxX: 10, maxY: 10 }, 'new')
      expect(tree.size).toBe(1)
      expect(tree.search({ minX: 0, minY: 0, maxX: 10, maxY: 10 })).toEqual(['new'])
    })
  })

  // ─── Edge Cases ───

  describe('edge cases', () => {
    it('should handle large number of inserts', () => {
      const tree = new RTree3<number>(4)
      for (let i = 0; i < 100; i++) {
        tree.insert({ minX: i, minY: i, maxX: i + 1, maxY: i + 1 }, i)
      }
      expect(tree.size).toBe(100)
    })

    it('should handle inserts and removals interleaved', () => {
      const tree = new RTree3<string>(4)
      for (let i = 0; i < 10; i++) {
        tree.insert({ minX: i, minY: i, maxX: i + 1, maxY: i + 1 }, `v${i}`)
      }
      const removed = tree.remove({ minX: 3, minY: 3, maxX: 4, maxY: 4 }, 'v3')
      tree.insert({ minX: 100, minY: 100, maxX: 101, maxY: 101 }, 'new')
      expect(tree.size).toBe(removed ? 10 : 11)
    })

    it('should handle same-rectangle inserts', () => {
      const tree = new RTree3<string>(4)
      const rect = { minX: 0, minY: 0, maxX: 10, maxY: 10 }
      tree.insert(rect, 'a')
      tree.insert(rect, 'b')
      tree.insert(rect, 'c')
      const results = tree.search(rect).sort()
      expect(results).toEqual(['a', 'b', 'c'])
    })
  })
})
