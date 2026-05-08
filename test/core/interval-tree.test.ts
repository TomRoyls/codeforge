import { describe, it, expect, beforeEach } from 'vitest'
import { IntervalTree } from '../../src/core/interval-tree/interval-tree.js'
import type { Interval, IntervalEntry, IntervalNode, IntervalTreeStats } from '../../src/core/interval-tree/types.js'

describe('IntervalTree', () => {
  let tree: IntervalTree<string>

  beforeEach(() => {
    tree = new IntervalTree<string>()
  })

  describe('constructor', () => {
    it('should create an empty interval tree', () => {
      const t = new IntervalTree<number>()
      expect(t.size()).toBe(0)
      expect(t.isEmpty()).toBe(true)
    })
  })

  describe('insert', () => {
    it('should insert a single interval', () => {
      tree.insert(0, 10, 'a')
      expect(tree.size()).toBe(1)
      expect(tree.isEmpty()).toBe(false)
    })

    it('should insert multiple intervals', () => {
      tree.insert(0, 10, 'a')
      tree.insert(5, 15, 'b')
      tree.insert(20, 30, 'c')
      expect(tree.size()).toBe(3)
    })

    it('should allow zero-length intervals', () => {
      tree.insert(5, 5, 'point')
      expect(tree.size()).toBe(1)
      expect(tree.search(5)).toHaveLength(1)
    })

    it('should allow negative intervals', () => {
      tree.insert(-10, -5, 'neg')
      expect(tree.size()).toBe(1)
      expect(tree.search(-7)).toHaveLength(1)
    })

    it('should throw for invalid interval start > end', () => {
      expect(() => tree.insert(10, 5, 'bad')).toThrow('Invalid interval: start (10) > end (5)')
    })

    it('should allow duplicate intervals', () => {
      tree.insert(0, 10, 'a')
      tree.insert(0, 10, 'b')
      expect(tree.size()).toBe(2)
    })

    it('should handle large numbers', () => {
      tree.insert(Number.MAX_SAFE_INTEGER - 10, Number.MAX_SAFE_INTEGER, 'big')
      expect(tree.size()).toBe(1)
    })

    it('should handle fractional numbers', () => {
      tree.insert(1.5, 3.7, 'frac')
      expect(tree.size()).toBe(1)
      expect(tree.search(2.5)).toHaveLength(1)
    })

    it('should return void', () => {
      const result = tree.insert(0, 10, 'a')
      expect(result).toBeUndefined()
    })
  })

  describe('search (point query)', () => {
    beforeEach(() => {
      tree.insert(5, 15, 'a')
      tree.insert(10, 20, 'b')
      tree.insert(25, 35, 'c')
      tree.insert(0, 5, 'd')
    })

    it('should find intervals containing a point', () => {
      const results = tree.search(10)
      expect(results.length).toBeGreaterThanOrEqual(2)
    })

    it('should return empty array for point not in any interval', () => {
      const results = tree.search(100)
      expect(results).toEqual([])
    })

    it('should find interval at exact start boundary', () => {
      const results = tree.search(5)
      const values = results.map((r) => r.value)
      expect(values).toContain('a')
      expect(values).toContain('d')
    })

    it('should find interval at exact end boundary', () => {
      const results = tree.search(15)
      const values = results.map((r) => r.value)
      expect(values).toContain('a')
      expect(values).toContain('b')
    })

    it('should find single interval', () => {
      const results = tree.search(30)
      expect(results).toHaveLength(1)
      expect(results[0]!.value).toBe('c')
    })

    it('should return IntervalEntry objects', () => {
      tree.clear()
      tree.insert(0, 10, 'x')
      const results = tree.search(5)
      expect(results[0]).toHaveProperty('interval')
      expect(results[0]).toHaveProperty('value')
      expect(results[0]!.interval.start).toBe(0)
      expect(results[0]!.interval.end).toBe(10)
    })

    it('should handle search on empty tree', () => {
      tree.clear()
      expect(tree.search(5)).toEqual([])
    })

    it('should find point in zero-length interval', () => {
      tree.clear()
      tree.insert(7, 7, 'point')
      expect(tree.search(7)).toHaveLength(1)
    })
  })

  describe('searchInterval', () => {
    beforeEach(() => {
      tree.insert(5, 15, 'a')
      tree.insert(10, 20, 'b')
      tree.insert(25, 35, 'c')
      tree.insert(0, 3, 'd')
    })

    it('should find overlapping intervals', () => {
      const results = tree.searchInterval(12, 18)
      const values = results.map((r) => r.value)
      expect(values).toContain('a')
      expect(values).toContain('b')
    })

    it('should return empty array when no overlaps', () => {
      const results = tree.searchInterval(100, 200)
      expect(results).toEqual([])
    })

    it('should throw for invalid interval', () => {
      expect(() => tree.searchInterval(20, 10)).toThrow('Invalid interval')
    })

    it('should find exact match interval', () => {
      const results = tree.searchInterval(5, 15)
      const values = results.map((r) => r.value)
      expect(values).toContain('a')
    })

    it('should find intervals that fully contain the query', () => {
      const results = tree.searchInterval(7, 12)
      const values = results.map((r) => r.value)
      expect(values).toContain('a')
    })

    it('should find intervals fully contained in the query', () => {
      const results = tree.searchInterval(0, 100)
      expect(results.length).toBe(4)
    })

    it('should handle touching intervals', () => {
      const results = tree.searchInterval(3, 5)
      const values = results.map((r) => r.value)
      expect(values).toContain('a')
      expect(values).toContain('d')
    })

    it('should handle search on empty tree', () => {
      tree.clear()
      expect(tree.searchInterval(0, 10)).toEqual([])
    })
  })

  describe('overlaps', () => {
    beforeEach(() => {
      tree.insert(5, 15, 'a')
      tree.insert(20, 30, 'b')
    })

    it('should return true when intervals overlap', () => {
      expect(tree.overlaps(10, 25)).toBe(true)
    })

    it('should return true for exact match', () => {
      expect(tree.overlaps(5, 15)).toBe(true)
    })

    it('should return true for interval containing an existing interval', () => {
      expect(tree.overlaps(0, 100)).toBe(true)
    })

    it('should return true for interval contained in an existing interval', () => {
      expect(tree.overlaps(7, 12)).toBe(true)
    })

    it('should return false when no overlap', () => {
      expect(tree.overlaps(16, 19)).toBe(false)
    })

    it('should return false on empty tree', () => {
      tree.clear()
      expect(tree.overlaps(0, 10)).toBe(false)
    })

    it('should throw for invalid interval', () => {
      expect(() => tree.overlaps(20, 10)).toThrow('Invalid interval')
    })

    it('should detect touching boundary overlap', () => {
      expect(tree.overlaps(15, 20)).toBe(true)
    })
  })

  describe('has', () => {
    beforeEach(() => {
      tree.insert(5, 15, 'a')
      tree.insert(20, 30, 'b')
    })

    it('should return true for exact existing interval', () => {
      expect(tree.has(5, 15)).toBe(true)
    })

    it('should return false for non-existing interval', () => {
      expect(tree.has(6, 14)).toBe(false)
    })

    it('should return false on empty tree', () => {
      tree.clear()
      expect(tree.has(5, 15)).toBe(false)
    })

    it('should return false for partial match start only', () => {
      expect(tree.has(5, 16)).toBe(false)
    })

    it('should return false for partial match end only', () => {
      expect(tree.has(4, 15)).toBe(false)
    })

    it('should find second interval', () => {
      expect(tree.has(20, 30)).toBe(true)
    })
  })

  describe('delete', () => {
    beforeEach(() => {
      tree.insert(5, 15, 'a')
      tree.insert(0, 10, 'b')
      tree.insert(20, 30, 'c')
    })

    it('should delete an existing interval', () => {
      expect(tree.delete(5, 15)).toBe(true)
      expect(tree.size()).toBe(2)
    })

    it('should return false for non-existing interval', () => {
      expect(tree.delete(100, 200)).toBe(false)
      expect(tree.size()).toBe(3)
    })

    it('should throw for invalid interval', () => {
      expect(() => tree.delete(20, 10)).toThrow('Invalid interval')
    })

    it('should handle deleting from empty tree', () => {
      tree.clear()
      expect(tree.delete(0, 10)).toBe(false)
    })

    it('should allow re-insertion after delete', () => {
      tree.delete(5, 15)
      tree.insert(5, 15, 'new')
      expect(tree.size()).toBe(3)
      expect(tree.has(5, 15)).toBe(true)
    })

    it('should delete root node', () => {
      expect(tree.delete(5, 15)).toBe(true)
      expect(tree.has(5, 15)).toBe(false)
    })

    it('should delete all and leave empty tree', () => {
      tree.delete(5, 15)
      tree.delete(0, 10)
      tree.delete(20, 30)
      expect(tree.isEmpty()).toBe(true)
      expect(tree.size()).toBe(0)
    })

    it('should maintain search after delete', () => {
      tree.delete(5, 15)
      const results = tree.search(7)
      const values = results.map((r) => r.value)
      expect(values).toContain('b')
      expect(values).not.toContain('a')
    })
  })

  describe('getAll', () => {
    it('should return empty array for empty tree', () => {
      expect(tree.getAll()).toEqual([])
    })

    it('should return all entries', () => {
      tree.insert(5, 15, 'a')
      tree.insert(0, 10, 'b')
      tree.insert(20, 30, 'c')
      const all = tree.getAll()
      expect(all).toHaveLength(3)
    })

    it('should return entries sorted by start', () => {
      tree.insert(5, 15, 'a')
      tree.insert(0, 10, 'b')
      tree.insert(20, 30, 'c')
      const all = tree.getAll()
      expect(all[0]!.interval.start).toBeLessThanOrEqual(all[1]!.interval.start)
      expect(all[1]!.interval.start).toBeLessThanOrEqual(all[2]!.interval.start)
    })

    it('should preserve values', () => {
      tree.insert(0, 10, 'x')
      tree.insert(20, 30, 'y')
      const all = tree.getAll()
      const values = all.map((e) => e.value)
      expect(values).toContain('x')
      expect(values).toContain('y')
    })

    it('should return IntervalEntry objects with correct structure', () => {
      tree.insert(1, 5, 'test')
      const all = tree.getAll()
      expect(all[0]!.interval).toEqual({ start: 1, end: 5 })
      expect(all[0]!.value).toBe('test')
    })
  })

  describe('size', () => {
    it('should return 0 for empty tree', () => {
      expect(tree.size()).toBe(0)
    })

    it('should return correct count after inserts', () => {
      tree.insert(0, 10, 'a')
      expect(tree.size()).toBe(1)
      tree.insert(5, 15, 'b')
      expect(tree.size()).toBe(2)
    })

    it('should decrease after delete', () => {
      tree.insert(0, 10, 'a')
      tree.insert(5, 15, 'b')
      tree.delete(0, 10)
      expect(tree.size()).toBe(1)
    })

    it('should reset after clear', () => {
      tree.insert(0, 10, 'a')
      tree.clear()
      expect(tree.size()).toBe(0)
    })
  })

  describe('isEmpty', () => {
    it('should return true for new tree', () => {
      expect(tree.isEmpty()).toBe(true)
    })

    it('should return false after insert', () => {
      tree.insert(0, 10, 'a')
      expect(tree.isEmpty()).toBe(false)
    })

    it('should return true after clear', () => {
      tree.insert(0, 10, 'a')
      tree.clear()
      expect(tree.isEmpty()).toBe(true)
    })

    it('should return true after deleting all', () => {
      tree.insert(0, 10, 'a')
      tree.delete(0, 10)
      expect(tree.isEmpty()).toBe(true)
    })
  })

  describe('clear', () => {
    it('should clear all entries', () => {
      tree.insert(0, 10, 'a')
      tree.insert(5, 15, 'b')
      tree.clear()
      expect(tree.size()).toBe(0)
      expect(tree.isEmpty()).toBe(true)
    })

    it('should handle clearing empty tree', () => {
      tree.clear()
      expect(tree.size()).toBe(0)
    })

    it('should allow operations after clear', () => {
      tree.insert(0, 10, 'a')
      tree.clear()
      tree.insert(5, 15, 'b')
      expect(tree.size()).toBe(1)
      expect(tree.search(10)).toHaveLength(1)
    })

    it('should return void', () => {
      expect(tree.clear()).toBeUndefined()
    })
  })

  describe('getStats', () => {
    it('should return zeros for empty tree', () => {
      const stats = tree.getStats()
      expect(stats.nodeCount).toBe(0)
      expect(stats.height).toBe(0)
      expect(stats.maxRange).toBe(0)
    })

    it('should return correct stats for single node', () => {
      tree.insert(0, 10, 'a')
      const stats = tree.getStats()
      expect(stats.nodeCount).toBe(1)
      expect(stats.height).toBe(1)
      expect(stats.maxRange).toBe(10)
    })

    it('should return correct stats for multiple nodes', () => {
      tree.insert(0, 10, 'a')
      tree.insert(5, 20, 'b')
      tree.insert(25, 50, 'c')
      const stats = tree.getStats()
      expect(stats.nodeCount).toBe(3)
      expect(stats.maxRange).toBe(50)
    })

    it('should have height >= 1 for non-empty tree', () => {
      tree.insert(0, 10, 'a')
      const stats = tree.getStats()
      expect(stats.height).toBeGreaterThanOrEqual(1)
    })

    it('should return IntervalTreeStats object', () => {
      tree.insert(0, 10, 'a')
      const stats = tree.getStats()
      expect(stats).toHaveProperty('nodeCount')
      expect(stats).toHaveProperty('height')
      expect(stats).toHaveProperty('maxRange')
    })

    it('should update after delete', () => {
      tree.insert(0, 10, 'a')
      tree.insert(20, 30, 'b')
      tree.delete(0, 10)
      const stats = tree.getStats()
      expect(stats.nodeCount).toBe(1)
    })
  })

  describe('augmented tree max tracking', () => {
    it('should track max endpoint correctly', () => {
      tree.insert(0, 5, 'small')
      tree.insert(0, 100, 'large')
      tree.insert(0, 10, 'medium')
      const results = tree.search(50)
      expect(results).toHaveLength(1)
      expect(results[0]!.value).toBe('large')
    })

    it('should update max after deletion', () => {
      tree.insert(0, 100, 'large')
      tree.insert(0, 5, 'small')
      tree.delete(0, 100)
      const results = tree.search(50)
      expect(results).toHaveLength(0)
    })

    it('should handle right-skewed inserts', () => {
      for (let i = 0; i < 10; i++) {
        tree.insert(i * 10, i * 10 + 5, `n${i}`)
      }
      expect(tree.size()).toBe(10)
      expect(tree.search(85)).toHaveLength(1)
    })

    it('should handle left-skewed inserts', () => {
      for (let i = 9; i >= 0; i--) {
        tree.insert(i * 10, i * 10 + 5, `n${i}`)
      }
      expect(tree.size()).toBe(10)
      expect(tree.search(85)).toHaveLength(1)
    })
  })

  describe('edge cases', () => {
    it('should handle negative intervals', () => {
      tree.insert(-20, -10, 'neg')
      expect(tree.search(-15)).toHaveLength(1)
      expect(tree.search(0)).toHaveLength(0)
    })

    it('should handle intervals spanning negative to positive', () => {
      tree.insert(-10, 10, 'span')
      expect(tree.search(-5)).toHaveLength(1)
      expect(tree.search(5)).toHaveLength(1)
      expect(tree.search(0)).toHaveLength(1)
    })

    it('should handle very large tree', () => {
      for (let i = 0; i < 500; i++) {
        tree.insert(i, i + 1, `n${i}`)
      }
      expect(tree.size()).toBe(500)
      expect(tree.search(250)).toHaveLength(2)
    })

    it('should handle point intervals at boundaries', () => {
      tree.insert(0, 0, 'origin')
      tree.insert(1, 1, 'one')
      expect(tree.search(0)).toHaveLength(1)
      expect(tree.search(1)).toHaveLength(1)
    })

    it('should handle overlapping duplicate intervals', () => {
      tree.insert(0, 10, 'first')
      tree.insert(0, 10, 'second')
      const results = tree.search(5)
      expect(results).toHaveLength(2)
    })

    it('should handle delete of duplicate interval', () => {
      tree.insert(0, 10, 'first')
      tree.insert(0, 10, 'second')
      tree.delete(0, 10)
      expect(tree.size()).toBe(1)
      expect(tree.search(5)).toHaveLength(1)
    })

    it('should handle search with no left child pruning', () => {
      tree.insert(10, 20, 'a')
      tree.insert(5, 8, 'b')
      expect(tree.search(15)).toHaveLength(1)
    })

    it('should handle insert with same start different end', () => {
      tree.insert(5, 10, 'a')
      tree.insert(5, 20, 'b')
      tree.insert(5, 15, 'c')
      expect(tree.size()).toBe(3)
      expect(tree.search(12)).toHaveLength(2)
    })
  })

  describe('type exports', () => {
    it('should support Interval interface', () => {
      const interval: Interval = { start: 0, end: 10 }
      expect(interval.start).toBe(0)
      expect(interval.end).toBe(10)
    })

    it('should support IntervalEntry interface', () => {
      const entry: IntervalEntry<string> = { interval: { start: 0, end: 10 }, value: 'test' }
      expect(entry.interval.start).toBe(0)
      expect(entry.value).toBe('test')
    })

    it('should support IntervalNode interface', () => {
      const node: IntervalNode<string> = {
        interval: { start: 0, end: 10 },
        value: 'test',
        max: 10,
        left: null,
        right: null,
      }
      expect(node.max).toBe(10)
      expect(node.left).toBeNull()
      expect(node.right).toBeNull()
    })

    it('should support IntervalTreeStats interface', () => {
      const stats: IntervalTreeStats = { nodeCount: 5, height: 3, maxRange: 100 }
      expect(stats.nodeCount).toBe(5)
      expect(stats.height).toBe(3)
      expect(stats.maxRange).toBe(100)
    })

    it('should support number value type', () => {
      const numTree = new IntervalTree<number>()
      numTree.insert(0, 10, 42)
      expect(numTree.search(5)[0]!.value).toBe(42)
    })

    it('should support object value type', () => {
      interface Data {
        name: string
        priority: number
      }
      const objTree = new IntervalTree<Data>()
      objTree.insert(0, 10, { name: 'test', priority: 1 })
      const results = objTree.search(5)
      expect(results[0]!.value.name).toBe('test')
      expect(results[0]!.value.priority).toBe(1)
    })

    it('should support null value type', () => {
      const nullTree = new IntervalTree<null>()
      nullTree.insert(0, 10, null)
      expect(nullTree.search(5)[0]!.value).toBeNull()
    })

    it('should support array value type', () => {
      const arrTree = new IntervalTree<number[]>()
      arrTree.insert(0, 10, [1, 2, 3])
      expect(arrTree.search(5)[0]!.value).toEqual([1, 2, 3])
    })
  })

  describe('complex operations', () => {
    it('should handle interleaved inserts and deletes', () => {
      tree.insert(0, 10, 'a')
      tree.insert(20, 30, 'b')
      tree.delete(0, 10)
      tree.insert(5, 15, 'c')
      tree.delete(20, 30)
      expect(tree.size()).toBe(1)
      expect(tree.has(5, 15)).toBe(true)
    })

    it('should handle clearing and rebuilding', () => {
      tree.insert(0, 10, 'a')
      tree.clear()
      tree.insert(5, 15, 'b')
      expect(tree.size()).toBe(1)
      expect(tree.has(0, 10)).toBe(false)
      expect(tree.has(5, 15)).toBe(true)
    })

    it('should handle multiple point queries', () => {
      tree.insert(0, 10, 'a')
      tree.insert(5, 15, 'b')
      tree.insert(10, 20, 'c')
      expect(tree.search(5).length).toBeGreaterThanOrEqual(2)
      expect(tree.search(10).length).toBeGreaterThanOrEqual(2)
      expect(tree.search(15).length).toBeGreaterThanOrEqual(2)
    })

    it('should handle interval query returning multiple results', () => {
      tree.insert(0, 10, 'a')
      tree.insert(3, 7, 'b')
      tree.insert(5, 15, 'c')
      const results = tree.searchInterval(4, 8)
      expect(results.length).toBe(3)
    })

    it('should handle sequential non-overlapping intervals', () => {
      for (let i = 0; i < 10; i++) {
        tree.insert(i * 10, i * 10 + 9, `seg${i}`)
      }
      expect(tree.search(5)).toHaveLength(1)
      expect(tree.search(15)).toHaveLength(1)
      expect(tree.search(95)).toHaveLength(1)
      expect(tree.search(99)).toHaveLength(1)
    })

    it('should handle nested intervals', () => {
      tree.insert(0, 100, 'outer')
      tree.insert(25, 75, 'middle')
      tree.insert(40, 60, 'inner')
      const results = tree.search(50)
      expect(results).toHaveLength(3)
    })
  })
})
