import { describe, expect, it } from 'vitest'
import { IntervalTree } from '../../../src/core/interval-tree/interval-tree.js'

describe('IntervalTree', () => {
  describe('insert', () => {
    it('inserts single interval', () => {
      const tree = new IntervalTree<string>()
      tree.insert(1, 5, 'test')
      expect(tree.size()).toBe(1)
      expect(tree.isEmpty()).toBe(false)
    })

    it('inserts multiple intervals', () => {
      const tree = new IntervalTree<string>()
      tree.insert(1, 5, 'a')
      tree.insert(10, 15, 'b')
      tree.insert(20, 25, 'c')
      expect(tree.size()).toBe(3)
    })

    it('throws for invalid interval (start > end)', () => {
      const tree = new IntervalTree<string>()
      expect(() => tree.insert(5, 1, 'test')).toThrow('Invalid interval')
    })

    it('handles zero-length interval', () => {
      const tree = new IntervalTree<string>()
      tree.insert(5, 5, 'point')
      expect(tree.size()).toBe(1)
    })

    it('handles negative start', () => {
      const tree = new IntervalTree<string>()
      tree.insert(-10, -5, 'negative')
      expect(tree.size()).toBe(1)
    })

    it('stores value with interval', () => {
      const tree = new IntervalTree<number>()
      tree.insert(1, 5, 42)
      const results = tree.searchInterval(1, 5)
      expect(results[0]?.value).toBe(42)
    })

    it('handles overlapping intervals', () => {
      const tree = new IntervalTree<string>()
      tree.insert(1, 10, 'a')
      tree.insert(5, 15, 'b')
      tree.insert(8, 20, 'c')
      expect(tree.size()).toBe(3)
    })

    it('handles contained intervals', () => {
      const tree = new IntervalTree<string>()
      tree.insert(1, 20, 'outer')
      tree.insert(5, 10, 'inner')
      expect(tree.size()).toBe(2)
    })
  })

  describe('delete', () => {
    it('deletes existing interval', () => {
      const tree = new IntervalTree<string>()
      tree.insert(1, 5, 'test')
      const deleted = tree.delete(1, 5)
      expect(deleted).toBe(true)
      expect(tree.size()).toBe(0)
    })

    it('returns false for non-existent interval', () => {
      const tree = new IntervalTree<string>()
      tree.insert(1, 5, 'test')
      const deleted = tree.delete(10, 15)
      expect(deleted).toBe(false)
      expect(tree.size()).toBe(1)
    })

    it('throws for invalid interval (start > end)', () => {
      const tree = new IntervalTree<string>()
      expect(() => tree.delete(5, 1)).toThrow('Invalid interval')
    })

    it('handles deletion from empty tree', () => {
      const tree = new IntervalTree<string>()
      const deleted = tree.delete(1, 5)
      expect(deleted).toBe(false)
    })

    it('deletes one of multiple intervals', () => {
      const tree = new IntervalTree<string>()
      tree.insert(1, 5, 'a')
      tree.insert(10, 15, 'b')
      tree.insert(20, 25, 'c')
      const deleted = tree.delete(10, 15)
      expect(deleted).toBe(true)
      expect(tree.size()).toBe(2)
    })

    it('does not delete overlapping interval with different boundaries', () => {
      const tree = new IntervalTree<string>()
      tree.insert(1, 10, 'test')
      const deleted = tree.delete(2, 8)
      expect(deleted).toBe(false)
      expect(tree.size()).toBe(1)
    })

    it('handles zero-length interval deletion', () => {
      const tree = new IntervalTree<string>()
      tree.insert(5, 5, 'point')
      const deleted = tree.delete(5, 5)
      expect(deleted).toBe(true)
      expect(tree.size()).toBe(0)
    })
  })

  describe('search', () => {
    it('finds interval containing point', () => {
      const tree = new IntervalTree<string>()
      tree.insert(1, 5, 'test')
      const results = tree.search(3)
      expect(results.length).toBe(1)
      expect(results[0]?.value).toBe('test')
    })

    it('returns empty for no matches', () => {
      const tree = new IntervalTree<string>()
      tree.insert(1, 5, 'test')
      const results = tree.search(10)
      expect(results).toEqual([])
    })

    it('finds multiple intervals containing point', () => {
      const tree = new IntervalTree<string>()
      tree.insert(1, 10, 'a')
      tree.insert(5, 15, 'b')
      tree.insert(8, 20, 'c')
      const results = tree.search(8)
      expect(results.length).toBe(3)
    })

    it('handles point at interval start', () => {
      const tree = new IntervalTree<string>()
      tree.insert(5, 10, 'test')
      const results = tree.search(5)
      expect(results.length).toBe(1)
    })

    it('handles point at interval end', () => {
      const tree = new IntervalTree<string>()
      tree.insert(1, 10, 'test')
      const results = tree.search(10)
      expect(results.length).toBe(1)
    })

    it('returns empty for point outside all intervals', () => {
      const tree = new IntervalTree<string>()
      tree.insert(10, 20, 'test')
      const results = tree.search(5)
      expect(results).toEqual([])
    })

    it('finds zero-length intervals at point', () => {
      const tree = new IntervalTree<string>()
      tree.insert(5, 5, 'point')
      const results = tree.search(5)
      expect(results.length).toBe(1)
    })

    it('handles negative point', () => {
      const tree = new IntervalTree<string>()
      tree.insert(-10, -5, 'negative')
      const results = tree.search(-8)
      expect(results.length).toBe(1)
    })

    it('returns empty for empty tree', () => {
      const tree = new IntervalTree<string>()
      const results = tree.search(5)
      expect(results).toEqual([])
    })
  })

  describe('searchInterval', () => {
    it('finds overlapping intervals', () => {
      const tree = new IntervalTree<string>()
      tree.insert(1, 5, 'a')
      tree.insert(3, 7, 'b')
      const results = tree.searchInterval(2, 6)
      expect(results.length).toBe(2)
    })

    it('throws for invalid interval (start > end)', () => {
      const tree = new IntervalTree<string>()
      expect(() => tree.searchInterval(5, 1)).toThrow('Invalid interval')
    })

    it('returns empty for no overlaps', () => {
      const tree = new IntervalTree<string>()
      tree.insert(1, 5, 'test')
      const results = tree.searchInterval(10, 15)
      expect(results).toEqual([])
    })

    it('finds interval completely contained in search range', () => {
      const tree = new IntervalTree<string>()
      tree.insert(3, 7, 'inner')
      const results = tree.searchInterval(1, 10)
      expect(results.length).toBe(1)
    })

    it('finds intervals that contain search range', () => {
      const tree = new IntervalTree<string>()
      tree.insert(1, 10, 'outer')
      const results = tree.searchInterval(3, 7)
      expect(results.length).toBe(1)
    })

    it('handles exact match', () => {
      const tree = new IntervalTree<string>()
      tree.insert(5, 10, 'test')
      const results = tree.searchInterval(5, 10)
      expect(results.length).toBe(1)
    })

    it('handles zero-length search interval', () => {
      const tree = new IntervalTree<string>()
      tree.insert(1, 10, 'test')
      tree.insert(5, 5, 'point')
      const results = tree.searchInterval(5, 5)
      expect(results.length).toBe(2)
    })

    it('returns empty for empty tree', () => {
      const tree = new IntervalTree<string>()
      const results = tree.searchInterval(1, 5)
      expect(results).toEqual([])
    })
  })

  describe('overlaps', () => {
    it('returns true for overlapping interval', () => {
      const tree = new IntervalTree<string>()
      tree.insert(1, 5, 'test')
      expect(tree.overlaps(3, 7)).toBe(true)
    })

    it('throws for invalid interval (start > end)', () => {
      const tree = new IntervalTree<string>()
      expect(() => tree.overlaps(5, 1)).toThrow('Invalid interval')
    })

    it('returns false for non-overlapping interval', () => {
      const tree = new IntervalTree<string>()
      tree.insert(1, 5, 'test')
      expect(tree.overlaps(10, 15)).toBe(false)
    })

    it('returns true for exact match', () => {
      const tree = new IntervalTree<string>()
      tree.insert(1, 5, 'test')
      expect(tree.overlaps(1, 5)).toBe(true)
    })

    it('returns true for touching intervals', () => {
      const tree = new IntervalTree<string>()
      tree.insert(1, 5, 'test')
      expect(tree.overlaps(5, 10)).toBe(true)
    })

    it('returns false for empty tree', () => {
      const tree = new IntervalTree<string>()
      expect(tree.overlaps(1, 5)).toBe(false)
    })

    it('returns true for contained search interval', () => {
      const tree = new IntervalTree<string>()
      tree.insert(1, 10, 'outer')
      expect(tree.overlaps(3, 7)).toBe(true)
    })

    it('returns true when search interval contains tree interval', () => {
      const tree = new IntervalTree<string>()
      tree.insert(3, 7, 'inner')
      expect(tree.overlaps(1, 10)).toBe(true)
    })
  })

  describe('has', () => {
    it('returns true for exact interval', () => {
      const tree = new IntervalTree<string>()
      tree.insert(1, 5, 'test')
      expect(tree.has(1, 5)).toBe(true)
    })

    it('returns false for non-existent interval', () => {
      const tree = new IntervalTree<string>()
      tree.insert(1, 5, 'test')
      expect(tree.has(2, 6)).toBe(false)
    })

    it('returns false for overlapping interval', () => {
      const tree = new IntervalTree<string>()
      tree.insert(1, 5, 'test')
      expect(tree.has(3, 7)).toBe(false)
    })

    it('returns false for empty tree', () => {
      const tree = new IntervalTree<string>()
      expect(tree.has(1, 5)).toBe(false)
    })

    it('handles zero-length interval', () => {
      const tree = new IntervalTree<string>()
      tree.insert(5, 5, 'point')
      expect(tree.has(5, 5)).toBe(true)
    })

    it('distinguishes between intervals with same start different end', () => {
      const tree = new IntervalTree<string>()
      tree.insert(1, 5, 'a')
      expect(tree.has(1, 6)).toBe(false)
    })
  })

  describe('getAll', () => {
    it('returns all intervals', () => {
      const tree = new IntervalTree<string>()
      tree.insert(1, 5, 'a')
      tree.insert(10, 15, 'b')
      tree.insert(20, 25, 'c')
      const all = tree.getAll()
      expect(all.length).toBe(3)
    })

    it('returns empty array for empty tree', () => {
      const tree = new IntervalTree<string>()
      expect(tree.getAll()).toEqual([])
    })

    it('returns intervals with values', () => {
      const tree = new IntervalTree<number>()
      tree.insert(1, 5, 42)
      const all = tree.getAll()
      expect(all[0]?.value).toBe(42)
    })

    it('returns intervals in sorted order', () => {
      const tree = new IntervalTree<string>()
      tree.insert(20, 25, 'c')
      tree.insert(1, 5, 'a')
      tree.insert(10, 15, 'b')
      const all = tree.getAll()
      expect(all[0]?.interval.start).toBe(1)
      expect(all[1]?.interval.start).toBe(10)
      expect(all[2]?.interval.start).toBe(20)
    })
  })

  describe('size', () => {
    it('returns 0 for empty tree', () => {
      const tree = new IntervalTree<string>()
      expect(tree.size()).toBe(0)
    })

    it('returns correct size after insertions', () => {
      const tree = new IntervalTree<string>()
      tree.insert(1, 5, 'a')
      expect(tree.size()).toBe(1)
      tree.insert(10, 15, 'b')
      expect(tree.size()).toBe(2)
    })

    it('updates size after deletion', () => {
      const tree = new IntervalTree<string>()
      tree.insert(1, 5, 'a')
      tree.insert(10, 15, 'b')
      tree.delete(1, 5)
      expect(tree.size()).toBe(1)
    })

    it('handles multiple operations', () => {
      const tree = new IntervalTree<string>()
      tree.insert(1, 5, 'a')
      tree.insert(10, 15, 'b')
      tree.insert(20, 25, 'c')
      tree.delete(10, 15)
      tree.insert(30, 35, 'd')
      expect(tree.size()).toBe(3)
    })
  })

  describe('isEmpty', () => {
    it('returns true for empty tree', () => {
      const tree = new IntervalTree<string>()
      expect(tree.isEmpty()).toBe(true)
    })

    it('returns false after insertion', () => {
      const tree = new IntervalTree<string>()
      tree.insert(1, 5, 'test')
      expect(tree.isEmpty()).toBe(false)
    })

    it('returns true after clearing', () => {
      const tree = new IntervalTree<string>()
      tree.insert(1, 5, 'test')
      tree.clear()
      expect(tree.isEmpty()).toBe(true)
    })

    it('returns true after deleting all intervals', () => {
      const tree = new IntervalTree<string>()
      tree.insert(1, 5, 'test')
      tree.delete(1, 5)
      expect(tree.isEmpty()).toBe(true)
    })
  })

  describe('clear', () => {
    it('clears all intervals', () => {
      const tree = new IntervalTree<string>()
      tree.insert(1, 5, 'a')
      tree.insert(10, 15, 'b')
      tree.insert(20, 25, 'c')
      tree.clear()
      expect(tree.size()).toBe(0)
      expect(tree.isEmpty()).toBe(true)
    })

    it('allows reinsertion after clear', () => {
      const tree = new IntervalTree<string>()
      tree.insert(1, 5, 'a')
      tree.clear()
      tree.insert(10, 15, 'b')
      expect(tree.size()).toBe(1)
      expect(tree.getAll().length).toBe(1)
    })

    it('clears empty tree safely', () => {
      const tree = new IntervalTree<string>()
      tree.clear()
      expect(tree.size()).toBe(0)
      expect(tree.isEmpty()).toBe(true)
    })
  })

  describe('getStats', () => {
    it('returns correct stats for empty tree', () => {
      const tree = new IntervalTree<string>()
      const stats = tree.getStats()
      expect(stats.nodeCount).toBe(0)
      expect(stats.height).toBe(0)
      expect(stats.maxRange).toBe(0)
    })

    it('returns correct stats for single node', () => {
      const tree = new IntervalTree<string>()
      tree.insert(1, 5, 'test')
      const stats = tree.getStats()
      expect(stats.nodeCount).toBe(1)
      expect(stats.height).toBe(1)
      expect(stats.maxRange).toBe(5)
    })

    it('returns correct node count', () => {
      const tree = new IntervalTree<string>()
      tree.insert(1, 5, 'a')
      tree.insert(10, 15, 'b')
      tree.insert(20, 25, 'c')
      const stats = tree.getStats()
      expect(stats.nodeCount).toBe(3)
    })

    it('returns correct max range', () => {
      const tree = new IntervalTree<string>()
      tree.insert(1, 5, 'a')
      tree.insert(10, 25, 'b')
      tree.insert(20, 30, 'c')
      const stats = tree.getStats()
      expect(stats.maxRange).toBe(30)
    })

    it('returns height > 1 for multiple nodes', () => {
      const tree = new IntervalTree<string>()
      tree.insert(1, 5, 'a')
      tree.insert(10, 15, 'b')
      tree.insert(20, 25, 'c')
      const stats = tree.getStats()
      expect(stats.height).toBeGreaterThan(1)
    })

    it('updates stats after deletion', () => {
      const tree = new IntervalTree<string>()
      tree.insert(1, 5, 'a')
      tree.insert(10, 25, 'b')
      tree.insert(20, 30, 'c')
      tree.delete(20, 30)
      const stats = tree.getStats()
      expect(stats.nodeCount).toBe(2)
      expect(stats.maxRange).toBe(25)
    })
  })
})