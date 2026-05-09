import { describe, it, expect, beforeEach } from 'vitest'
import { IntervalTree2D } from '../../src/core/interval-tree-2d/interval-tree-2d.js'
import type { RectEntry, TreeNode } from '../../src/core/interval-tree-2d/types.js'

describe('IntervalTree2D', () => {
  let tree: IntervalTree2D<string>

  beforeEach(() => {
    tree = new IntervalTree2D<string>()
  })

  describe('constructor', () => {
    it('should create an empty tree', () => {
      const t = new IntervalTree2D<number>()
      expect(t.size()).toBe(0)
      expect(t.isEmpty()).toBe(true)
    })

    it('should have empty getAll', () => {
      expect(tree.getAll()).toEqual([])
    })

    it('should support generic value types', () => {
      const t = new IntervalTree2D<{ name: string }>()
      expect(t.size()).toBe(0)
    })
  })

  describe('insert', () => {
    it('should insert a single rectangle', () => {
      tree.insert(0, 0, 10, 10, 'a')
      expect(tree.size()).toBe(1)
      expect(tree.isEmpty()).toBe(false)
    })

    it('should insert multiple rectangles', () => {
      tree.insert(0, 0, 10, 10, 'a')
      tree.insert(5, 5, 15, 15, 'b')
      tree.insert(20, 20, 30, 30, 'c')
      expect(tree.size()).toBe(3)
    })

    it('should throw for x1 > x2', () => {
      expect(() => tree.insert(10, 0, 5, 10, 'bad')).toThrow(
        'Invalid rectangle: x1 (10) > x2 (5)',
      )
    })

    it('should throw for y1 > y2', () => {
      expect(() => tree.insert(0, 10, 10, 5, 'bad')).toThrow(
        'Invalid rectangle: y1 (10) > y2 (5)',
      )
    })

    it('should allow zero-area rectangles', () => {
      tree.insert(5, 5, 5, 5, 'point')
      expect(tree.size()).toBe(1)
      expect(tree.queryPoint(5, 5)).toEqual(['point'])
    })

    it('should allow negative coordinates', () => {
      tree.insert(-10, -10, -5, -5, 'neg')
      expect(tree.size()).toBe(1)
      expect(tree.queryPoint(-7, -7)).toEqual(['neg'])
    })

    it('should allow duplicate rectangles with different values', () => {
      tree.insert(0, 0, 10, 10, 'a')
      tree.insert(0, 0, 10, 10, 'b')
      expect(tree.size()).toBe(2)
    })

    it('should allow duplicate rectangles with same value', () => {
      tree.insert(0, 0, 10, 10, 'a')
      tree.insert(0, 0, 10, 10, 'a')
      expect(tree.size()).toBe(2)
    })

    it('should handle fractional coordinates', () => {
      tree.insert(1.5, 2.5, 3.7, 4.8, 'frac')
      expect(tree.size()).toBe(1)
      expect(tree.queryPoint(2.5, 3.5)).toEqual(['frac'])
    })

    it('should return void', () => {
      const result = tree.insert(0, 0, 10, 10, 'a')
      expect(result).toBeUndefined()
    })

    it('should handle large numbers', () => {
      tree.insert(Number.MAX_SAFE_INTEGER - 10, 0, Number.MAX_SAFE_INTEGER, 10, 'big')
      expect(tree.size()).toBe(1)
    })

    it('should handle rectangles spanning negative to positive', () => {
      tree.insert(-10, -10, 10, 10, 'span')
      expect(tree.size()).toBe(1)
      expect(tree.queryPoint(0, 0)).toEqual(['span'])
    })
  })

  describe('remove', () => {
    beforeEach(() => {
      tree.insert(0, 0, 10, 10, 'a')
      tree.insert(5, 5, 15, 15, 'b')
      tree.insert(20, 20, 30, 30, 'c')
    })

    it('should remove an existing rectangle', () => {
      expect(tree.remove(0, 0, 10, 10, 'a')).toBe(true)
      expect(tree.size()).toBe(2)
    })

    it('should return false for non-existing rectangle', () => {
      expect(tree.remove(100, 100, 200, 200, 'd')).toBe(false)
      expect(tree.size()).toBe(3)
    })

    it('should return false for matching rect but wrong value', () => {
      expect(tree.remove(0, 0, 10, 10, 'wrong')).toBe(false)
      expect(tree.size()).toBe(3)
    })

    it('should throw for x1 > x2', () => {
      expect(() => tree.remove(10, 0, 5, 10, 'a')).toThrow('Invalid rectangle')
    })

    it('should throw for y1 > y2', () => {
      expect(() => tree.remove(0, 10, 10, 5, 'a')).toThrow('Invalid rectangle')
    })

    it('should handle removing from empty tree', () => {
      tree.clear()
      expect(tree.remove(0, 0, 10, 10, 'a')).toBe(false)
    })

    it('should allow re-insertion after remove', () => {
      tree.remove(0, 0, 10, 10, 'a')
      tree.insert(0, 0, 10, 10, 'new')
      expect(tree.size()).toBe(3)
      expect(tree.contains(0, 0, 10, 10, 'new')).toBe(true)
    })

    it('should remove all entries and leave empty tree', () => {
      tree.remove(0, 0, 10, 10, 'a')
      tree.remove(5, 5, 15, 15, 'b')
      tree.remove(20, 20, 30, 30, 'c')
      expect(tree.isEmpty()).toBe(true)
      expect(tree.size()).toBe(0)
    })

    it('should maintain queries after remove', () => {
      tree.remove(0, 0, 10, 10, 'a')
      expect(tree.queryPoint(7, 7)).not.toContain('a')
      expect(tree.queryPoint(7, 7)).toContain('b')
    })

    it('should handle removing one of duplicate rectangles', () => {
      tree.insert(0, 0, 10, 10, 'dup')
      expect(tree.remove(0, 0, 10, 10, 'dup')).toBe(true)
      expect(tree.size()).toBe(3)
      expect(tree.contains(0, 0, 10, 10, 'a')).toBe(true)
    })

    it('should remove duplicate with same value correctly', () => {
      tree.insert(0, 0, 10, 10, 'a')
      expect(tree.size()).toBe(4)
      expect(tree.remove(0, 0, 10, 10, 'a')).toBe(true)
      expect(tree.size()).toBe(3)
      expect(tree.contains(0, 0, 10, 10, 'a')).toBe(true)
    })

    it('should handle removing root node', () => {
      expect(tree.remove(0, 0, 10, 10, 'a')).toBe(true)
      expect(tree.contains(0, 0, 10, 10, 'a')).toBe(false)
    })

    it('should handle sequential removes', () => {
      expect(tree.remove(0, 0, 10, 10, 'a')).toBe(true)
      expect(tree.remove(5, 5, 15, 15, 'b')).toBe(true)
      expect(tree.size()).toBe(1)
      expect(tree.contains(20, 20, 30, 30, 'c')).toBe(true)
    })

    it('should handle remove then clear', () => {
      tree.remove(0, 0, 10, 10, 'a')
      tree.clear()
      expect(tree.size()).toBe(0)
    })
  })

  describe('queryPoint', () => {
    beforeEach(() => {
      tree.insert(0, 0, 10, 10, 'a')
      tree.insert(5, 5, 15, 15, 'b')
      tree.insert(0, 5, 10, 15, 'c')
      tree.insert(20, 20, 30, 30, 'd')
    })

    it('should find rectangles containing a point', () => {
      const results = tree.queryPoint(7, 7)
      expect(results).toContain('a')
      expect(results).toContain('b')
      expect(results).toContain('c')
    })

    it('should return empty array for point outside all rectangles', () => {
      expect(tree.queryPoint(100, 100)).toEqual([])
    })

    it('should find rectangle at exact corner', () => {
      const results = tree.queryPoint(0, 0)
      expect(results).toContain('a')
    })

    it('should find rectangles at boundary', () => {
      const results = tree.queryPoint(10, 10)
      expect(results).toContain('a')
      expect(results).toContain('b')
      expect(results).toContain('c')
    })

    it('should find single rectangle', () => {
      const results = tree.queryPoint(25, 25)
      expect(results).toEqual(['d'])
    })

    it('should handle query on empty tree', () => {
      tree.clear()
      expect(tree.queryPoint(5, 5)).toEqual([])
    })

    it('should not find rectangles outside y-range', () => {
      const results = tree.queryPoint(7, 20)
      expect(results).not.toContain('a')
    })

    it('should not find rectangles outside x-range', () => {
      const results = tree.queryPoint(15, 7)
      expect(results).not.toContain('a')
    })

    it('should find point in zero-area rectangle', () => {
      tree.clear()
      tree.insert(5, 5, 5, 5, 'point')
      expect(tree.queryPoint(5, 5)).toEqual(['point'])
    })

    it('should not find point near zero-area rectangle', () => {
      tree.clear()
      tree.insert(5, 5, 5, 5, 'point')
      expect(tree.queryPoint(5.001, 5)).toEqual([])
    })

    it('should find nested rectangles', () => {
      tree.clear()
      tree.insert(0, 0, 100, 100, 'outer')
      tree.insert(25, 25, 75, 75, 'middle')
      tree.insert(40, 40, 60, 60, 'inner')
      const results = tree.queryPoint(50, 50)
      expect(results).toHaveLength(3)
    })

    it('should find rectangles with negative coordinates', () => {
      tree.clear()
      tree.insert(-10, -10, 10, 10, 'neg')
      expect(tree.queryPoint(-5, -5)).toEqual(['neg'])
    })

    it('should find rectangles at exact x1,y1 boundary', () => {
      const results = tree.queryPoint(5, 5)
      expect(results).toContain('b')
      expect(results).toContain('c')
    })

    it('should find rectangles at exact x2,y2 boundary', () => {
      const results = tree.queryPoint(15, 15)
      expect(results).toContain('b')
    })

    it('should handle fractional point queries', () => {
      const results = tree.queryPoint(2.5, 7.5)
      expect(results).toContain('a')
      expect(results).toContain('c')
    })
  })

  describe('queryRange', () => {
    beforeEach(() => {
      tree.insert(0, 0, 10, 10, 'a')
      tree.insert(5, 5, 15, 15, 'b')
      tree.insert(20, 20, 30, 30, 'c')
      tree.insert(0, 15, 10, 25, 'd')
    })

    it('should find overlapping rectangles', () => {
      const results = tree.queryRange(3, 3, 12, 12)
      expect(results).toContain('a')
      expect(results).toContain('b')
    })

    it('should return empty array when no overlap', () => {
      expect(tree.queryRange(100, 100, 200, 200)).toEqual([])
    })

    it('should throw for invalid x range', () => {
      expect(() => tree.queryRange(20, 0, 10, 10)).toThrow('Invalid range')
    })

    it('should throw for invalid y range', () => {
      expect(() => tree.queryRange(0, 20, 10, 10)).toThrow('Invalid range')
    })

    it('should find exact match rectangle', () => {
      const results = tree.queryRange(0, 0, 10, 10)
      expect(results).toContain('a')
    })

    it('should find rectangles fully contained in query', () => {
      const results = tree.queryRange(-10, -10, 50, 50)
      expect(results).toHaveLength(4)
    })

    it('should find rectangles that fully contain the query', () => {
      const results = tree.queryRange(7, 7, 8, 8)
      expect(results).toContain('a')
      expect(results).toContain('b')
    })

    it('should handle touching boundaries', () => {
      const results = tree.queryRange(10, 10, 15, 15)
      expect(results).toContain('a')
      expect(results).toContain('b')
      expect(results).toContain('d')
    })

    it('should handle query on empty tree', () => {
      tree.clear()
      expect(tree.queryRange(0, 0, 10, 10)).toEqual([])
    })

    it('should find rectangles overlapping only in x', () => {
      const results = tree.queryRange(0, 0, 10, 30)
      expect(results).toContain('a')
      expect(results).toContain('d')
    })

    it('should find rectangles overlapping only in y', () => {
      const results = tree.queryRange(0, 0, 30, 10)
      expect(results).toContain('a')
    })

    it('should handle zero-area query range', () => {
      tree.clear()
      tree.insert(5, 5, 15, 15, 'x')
      const results = tree.queryRange(5, 5, 5, 5)
      expect(results).toContain('x')
    })

    it('should handle non-overlapping adjacent range', () => {
      const results = tree.queryRange(16, 16, 19, 19)
      expect(results).toHaveLength(0)
    })

    it('should find overlapping at edge only', () => {
      const results = tree.queryRange(10, 15, 20, 25)
      expect(results).toContain('d')
    })

    it('should handle large query range', () => {
      tree.clear()
      for (let i = 0; i < 10; i++) {
        tree.insert(i * 10, i * 10, i * 10 + 5, i * 10 + 5, `r${i}`)
      }
      const results = tree.queryRange(0, 0, 95, 95)
      expect(results).toHaveLength(10)
    })
  })

  describe('queryX', () => {
    beforeEach(() => {
      tree.insert(0, 0, 10, 10, 'a')
      tree.insert(5, 0, 15, 10, 'b')
      tree.insert(20, 0, 30, 10, 'c')
      tree.insert(0, 20, 10, 30, 'd')
    })

    it('should find rectangles overlapping x coordinate', () => {
      const results = tree.queryX(7)
      expect(results).toContain('a')
      expect(results).toContain('b')
    })

    it('should return empty array for x not in any rectangle', () => {
      expect(tree.queryX(17)).toEqual([])
    })

    it('should find rectangle at exact x1 boundary', () => {
      const results = tree.queryX(0)
      expect(results).toContain('a')
      expect(results).toContain('d')
    })

    it('should find rectangle at exact x2 boundary', () => {
      const results = tree.queryX(10)
      expect(results).toContain('a')
      expect(results).toContain('b')
    })

    it('should find single rectangle by x', () => {
      const results = tree.queryX(25)
      expect(results).toEqual(['c'])
    })

    it('should handle query on empty tree', () => {
      tree.clear()
      expect(tree.queryX(5)).toEqual([])
    })

    it('should find rectangles regardless of y-range', () => {
      const results = tree.queryX(5)
      expect(results).toContain('a')
      expect(results).toContain('b')
      expect(results).toContain('d')
    })

    it('should not find rectangles that do not span x', () => {
      const results = tree.queryX(16)
      expect(results).not.toContain('a')
      expect(results).not.toContain('b')
    })

    it('should handle fractional x', () => {
      const results = tree.queryX(2.5)
      expect(results).toContain('a')
      expect(results).toContain('d')
    })

    it('should handle negative x', () => {
      tree.clear()
      tree.insert(-10, 0, -5, 5, 'neg')
      expect(tree.queryX(-7)).toEqual(['neg'])
    })
  })

  describe('queryY', () => {
    beforeEach(() => {
      tree.insert(0, 0, 10, 10, 'a')
      tree.insert(0, 5, 10, 15, 'b')
      tree.insert(0, 20, 10, 30, 'c')
      tree.insert(20, 0, 30, 10, 'd')
    })

    it('should find rectangles overlapping y coordinate', () => {
      const results = tree.queryY(7)
      expect(results).toContain('a')
      expect(results).toContain('b')
    })

    it('should return empty array for y not in any rectangle', () => {
      expect(tree.queryY(17)).toEqual([])
    })

    it('should find rectangle at exact y1 boundary', () => {
      const results = tree.queryY(0)
      expect(results).toContain('a')
      expect(results).toContain('d')
    })

    it('should find rectangle at exact y2 boundary', () => {
      const results = tree.queryY(10)
      expect(results).toContain('a')
      expect(results).toContain('b')
      expect(results).toContain('d')
    })

    it('should find single rectangle by y', () => {
      const results = tree.queryY(25)
      expect(results).toEqual(['c'])
    })

    it('should handle query on empty tree', () => {
      tree.clear()
      expect(tree.queryY(5)).toEqual([])
    })

    it('should find rectangles regardless of x-range', () => {
      const results = tree.queryY(5)
      expect(results).toContain('a')
      expect(results).toContain('b')
      expect(results).toContain('d')
    })

    it('should not find rectangles that do not span y', () => {
      const results = tree.queryY(16)
      expect(results).not.toContain('a')
      expect(results).not.toContain('b')
    })

    it('should handle fractional y', () => {
      const results = tree.queryY(2.5)
      expect(results).toContain('a')
      expect(results).toContain('d')
    })

    it('should handle negative y', () => {
      tree.clear()
      tree.insert(0, -10, 5, -5, 'neg')
      expect(tree.queryY(-7)).toEqual(['neg'])
    })
  })

  describe('contains', () => {
    beforeEach(() => {
      tree.insert(0, 0, 10, 10, 'a')
      tree.insert(5, 5, 15, 15, 'b')
    })

    it('should return true for exact existing entry', () => {
      expect(tree.contains(0, 0, 10, 10, 'a')).toBe(true)
    })

    it('should return true for second entry', () => {
      expect(tree.contains(5, 5, 15, 15, 'b')).toBe(true)
    })

    it('should return false for matching rect wrong value', () => {
      expect(tree.contains(0, 0, 10, 10, 'wrong')).toBe(false)
    })

    it('should return false for non-existing rect', () => {
      expect(tree.contains(1, 1, 5, 5, 'a')).toBe(false)
    })

    it('should return false on empty tree', () => {
      tree.clear()
      expect(tree.contains(0, 0, 10, 10, 'a')).toBe(false)
    })

    it('should return false for invalid x range', () => {
      expect(tree.contains(10, 0, 5, 10, 'a')).toBe(false)
    })

    it('should return false for invalid y range', () => {
      expect(tree.contains(0, 10, 10, 5, 'a')).toBe(false)
    })

    it('should find duplicate entries individually', () => {
      tree.insert(0, 0, 10, 10, 'dup')
      expect(tree.contains(0, 0, 10, 10, 'a')).toBe(true)
      expect(tree.contains(0, 0, 10, 10, 'dup')).toBe(true)
    })

    it('should handle partial rect match', () => {
      expect(tree.contains(0, 0, 10, 5, 'a')).toBe(false)
    })

    it('should handle partial rect match on x', () => {
      expect(tree.contains(0, 0, 5, 10, 'a')).toBe(false)
    })
  })

  describe('size', () => {
    it('should return 0 for empty tree', () => {
      expect(tree.size()).toBe(0)
    })

    it('should return correct count after inserts', () => {
      tree.insert(0, 0, 10, 10, 'a')
      expect(tree.size()).toBe(1)
      tree.insert(5, 5, 15, 15, 'b')
      expect(tree.size()).toBe(2)
    })

    it('should decrease after remove', () => {
      tree.insert(0, 0, 10, 10, 'a')
      tree.insert(5, 5, 15, 15, 'b')
      tree.remove(0, 0, 10, 10, 'a')
      expect(tree.size()).toBe(1)
    })

    it('should reset after clear', () => {
      tree.insert(0, 0, 10, 10, 'a')
      tree.clear()
      expect(tree.size()).toBe(0)
    })

    it('should not decrease on failed remove', () => {
      tree.insert(0, 0, 10, 10, 'a')
      tree.remove(1, 1, 5, 5, 'x')
      expect(tree.size()).toBe(1)
    })
  })

  describe('isEmpty', () => {
    it('should return true for new tree', () => {
      expect(tree.isEmpty()).toBe(true)
    })

    it('should return false after insert', () => {
      tree.insert(0, 0, 10, 10, 'a')
      expect(tree.isEmpty()).toBe(false)
    })

    it('should return true after clear', () => {
      tree.insert(0, 0, 10, 10, 'a')
      tree.clear()
      expect(tree.isEmpty()).toBe(true)
    })

    it('should return true after removing all', () => {
      tree.insert(0, 0, 10, 10, 'a')
      tree.remove(0, 0, 10, 10, 'a')
      expect(tree.isEmpty()).toBe(true)
    })
  })

  describe('clear', () => {
    it('should clear all entries', () => {
      tree.insert(0, 0, 10, 10, 'a')
      tree.insert(5, 5, 15, 15, 'b')
      tree.clear()
      expect(tree.size()).toBe(0)
      expect(tree.isEmpty()).toBe(true)
    })

    it('should handle clearing empty tree', () => {
      tree.clear()
      expect(tree.size()).toBe(0)
    })

    it('should allow operations after clear', () => {
      tree.insert(0, 0, 10, 10, 'a')
      tree.clear()
      tree.insert(5, 5, 15, 15, 'b')
      expect(tree.size()).toBe(1)
      expect(tree.queryPoint(10, 10)).toEqual(['b'])
    })

    it('should return void', () => {
      expect(tree.clear()).toBeUndefined()
    })
  })

  describe('getAll', () => {
    it('should return empty array for empty tree', () => {
      expect(tree.getAll()).toEqual([])
    })

    it('should return all entries', () => {
      tree.insert(5, 5, 15, 15, 'a')
      tree.insert(0, 0, 10, 10, 'b')
      tree.insert(20, 20, 30, 30, 'c')
      expect(tree.getAll()).toHaveLength(3)
    })

    it('should return entries sorted by x1', () => {
      tree.insert(5, 5, 15, 15, 'a')
      tree.insert(0, 0, 10, 10, 'b')
      tree.insert(20, 20, 30, 30, 'c')
      const all = tree.getAll()
      expect(all[0]!.x1).toBeLessThanOrEqual(all[1]!.x1)
      expect(all[1]!.x1).toBeLessThanOrEqual(all[2]!.x1)
    })

    it('should preserve all fields', () => {
      tree.insert(1, 2, 3, 4, 'x')
      const all = tree.getAll()
      expect(all[0]).toEqual({ x1: 1, y1: 2, x2: 3, y2: 4, value: 'x' })
    })

    it('should include duplicate entries', () => {
      tree.insert(0, 0, 10, 10, 'a')
      tree.insert(0, 0, 10, 10, 'b')
      expect(tree.getAll()).toHaveLength(2)
    })

    it('should reflect removals', () => {
      tree.insert(0, 0, 10, 10, 'a')
      tree.insert(5, 5, 15, 15, 'b')
      tree.remove(0, 0, 10, 10, 'a')
      const all = tree.getAll()
      expect(all).toHaveLength(1)
      expect(all[0]!.value).toBe('b')
    })
  })

  describe('forEach', () => {
    it('should not call callback on empty tree', () => {
      let callCount = 0
      tree.forEach(() => { callCount++ })
      expect(callCount).toBe(0)
    })

    it('should call callback for each entry', () => {
      tree.insert(0, 0, 10, 10, 'a')
      tree.insert(5, 5, 15, 15, 'b')
      tree.insert(20, 20, 30, 30, 'c')
      let callCount = 0
      tree.forEach(() => { callCount++ })
      expect(callCount).toBe(3)
    })

    it('should provide correct rect objects', () => {
      tree.insert(1, 2, 3, 4, 'x')
      const rects: string[] = []
      tree.forEach((rect) => {
        rects.push(`${rect.x1},${rect.y1},${rect.x2},${rect.y2},${rect.value}`)
      })
      expect(rects).toEqual(['1,2,3,4,x'])
    })

    it('should iterate in order by x1', () => {
      tree.insert(5, 5, 15, 15, 'b')
      tree.insert(0, 0, 10, 10, 'a')
      tree.insert(20, 20, 30, 30, 'c')
      const values: string[] = []
      tree.forEach((rect) => { values.push(rect.value) })
      expect(values[0]!).toBe('a')
      expect(values[1]!).toBe('b')
      expect(values[2]!).toBe('c')
    })

    it('should handle single entry', () => {
      tree.insert(0, 0, 10, 10, 'only')
      const values: string[] = []
      tree.forEach((rect) => { values.push(rect.value) })
      expect(values).toEqual(['only'])
    })

    it('should return void', () => {
      tree.insert(0, 0, 10, 10, 'a')
      expect(tree.forEach(() => {})).toBeUndefined()
    })
  })

  describe('clone', () => {
    beforeEach(() => {
      tree.insert(0, 0, 10, 10, 'a')
      tree.insert(5, 5, 15, 15, 'b')
      tree.insert(20, 20, 30, 30, 'c')
    })

    it('should create an independent copy', () => {
      const cloned = tree.clone()
      expect(cloned.size()).toBe(3)
      expect(cloned).not.toBe(tree)
    })

    it('should have same data as original', () => {
      const cloned = tree.clone()
      const origEntries = tree.getAll()
      const cloneEntries = cloned.getAll()
      expect(cloneEntries).toHaveLength(origEntries.length)
    })

    it('should not affect original when modified', () => {
      const cloned = tree.clone()
      cloned.remove(0, 0, 10, 10, 'a')
      expect(tree.size()).toBe(3)
      expect(cloned.size()).toBe(2)
    })

    it('should not affect clone when original is modified', () => {
      const cloned = tree.clone()
      tree.remove(0, 0, 10, 10, 'a')
      expect(cloned.size()).toBe(3)
      expect(tree.size()).toBe(2)
    })

    it('should handle cloning empty tree', () => {
      tree.clear()
      const cloned = tree.clone()
      expect(cloned.size()).toBe(0)
      expect(cloned.isEmpty()).toBe(true)
    })

    it('should support queries on clone', () => {
      const cloned = tree.clone()
      expect(cloned.queryPoint(7, 7)).toContain('a')
      expect(cloned.queryPoint(7, 7)).toContain('b')
    })

    it('should produce correct getAll on clone', () => {
      const cloned = tree.clone()
      const all = cloned.getAll()
      const values = all.map((e) => e.value)
      expect(values).toContain('a')
      expect(values).toContain('b')
      expect(values).toContain('c')
    })

    it('should handle cloning single entry', () => {
      tree.clear()
      tree.insert(5, 5, 15, 15, 'only')
      const cloned = tree.clone()
      expect(cloned.size()).toBe(1)
      expect(cloned.contains(5, 5, 15, 15, 'only')).toBe(true)
    })
  })

  describe('edge cases', () => {
    it('should handle negative coordinates', () => {
      tree.insert(-20, -20, -10, -10, 'neg')
      expect(tree.queryPoint(-15, -15)).toEqual(['neg'])
      expect(tree.queryPoint(0, 0)).toEqual([])
    })

    it('should handle very large tree', () => {
      for (let i = 0; i < 500; i++) {
        tree.insert(i, i, i + 10, i + 10, `r${i}`)
      }
      expect(tree.size()).toBe(500)
      const results = tree.queryPoint(250, 250)
      expect(results.length).toBeGreaterThan(0)
    })

    it('should handle overlapping duplicate rectangles', () => {
      tree.insert(0, 0, 10, 10, 'first')
      tree.insert(0, 0, 10, 10, 'second')
      expect(tree.queryPoint(5, 5)).toHaveLength(2)
    })

    it('should handle sequential non-overlapping rectangles', () => {
      for (let i = 0; i < 10; i++) {
        tree.insert(i * 10, i * 10, i * 10 + 9, i * 10 + 9, `seg${i}`)
      }
      expect(tree.queryPoint(5, 5)).toEqual(['seg0'])
      expect(tree.queryPoint(15, 15)).toEqual(['seg1'])
      expect(tree.queryPoint(95, 95)).toEqual(['seg9'])
    })

    it('should handle nested rectangles', () => {
      tree.insert(0, 0, 100, 100, 'outer')
      tree.insert(25, 25, 75, 75, 'middle')
      tree.insert(40, 40, 60, 60, 'inner')
      expect(tree.queryPoint(50, 50)).toHaveLength(3)
      expect(tree.queryPoint(10, 10)).toHaveLength(1)
    })

    it('should handle rectangles with same x1 different y1', () => {
      tree.insert(0, 0, 10, 5, 'a')
      tree.insert(0, 5, 10, 10, 'b')
      tree.insert(0, 10, 10, 15, 'c')
      expect(tree.size()).toBe(3)
      expect(tree.queryPoint(5, 2.5)).toEqual(['a'])
      expect(tree.queryPoint(5, 7.5)).toEqual(['b'])
    })

    it('should handle rectangles with same y1 different x1', () => {
      tree.insert(0, 0, 5, 10, 'a')
      tree.insert(5, 0, 10, 10, 'b')
      tree.insert(10, 0, 15, 10, 'c')
      expect(tree.size()).toBe(3)
      expect(tree.queryPoint(2.5, 5)).toEqual(['a'])
      expect(tree.queryPoint(7.5, 5)).toEqual(['b'])
    })

    it('should handle right-skewed inserts', () => {
      for (let i = 0; i < 10; i++) {
        tree.insert(i * 10, 0, i * 10 + 5, 5, `r${i}`)
      }
      expect(tree.size()).toBe(10)
      expect(tree.queryPoint(85, 2)).toEqual(['r8'])
    })

    it('should handle left-skewed inserts', () => {
      for (let i = 9; i >= 0; i--) {
        tree.insert(i * 10, 0, i * 10 + 5, 5, `r${i}`)
      }
      expect(tree.size()).toBe(10)
      expect(tree.queryPoint(85, 2)).toEqual(['r8'])
    })

    it('should handle clearing and rebuilding', () => {
      tree.insert(0, 0, 10, 10, 'a')
      tree.clear()
      tree.insert(5, 5, 15, 15, 'b')
      expect(tree.size()).toBe(1)
      expect(tree.contains(0, 0, 10, 10, 'a')).toBe(false)
      expect(tree.contains(5, 5, 15, 15, 'b')).toBe(true)
    })
  })

  describe('type exports', () => {
    it('should support RectEntry interface', () => {
      const entry: RectEntry<string> = { x1: 0, y1: 0, x2: 10, y2: 10, value: 'test' }
      expect(entry.x1).toBe(0)
      expect(entry.value).toBe('test')
    })

    it('should support TreeNode interface', () => {
      const node: TreeNode<string> = {
        key: 5,
        entries: [{ x1: 5, y1: 5, x2: 15, y2: 15, value: 'test' }],
        max: 15,
        left: null,
        right: null,
      }
      expect(node.key).toBe(5)
      expect(node.entries).toHaveLength(1)
      expect(node.left).toBeNull()
    })

    it('should support number value type', () => {
      const numTree = new IntervalTree2D<number>()
      numTree.insert(0, 0, 10, 10, 42)
      expect(numTree.queryPoint(5, 5)).toEqual([42])
    })

    it('should support object value type', () => {
      interface Data {
        name: string
        priority: number
      }
      const objTree = new IntervalTree2D<Data>()
      objTree.insert(0, 0, 10, 10, { name: 'test', priority: 1 })
      const results = objTree.queryPoint(5, 5)
      expect(results[0]!.name).toBe('test')
      expect(results[0]!.priority).toBe(1)
    })

    it('should support null value type', () => {
      const nullTree = new IntervalTree2D<null>()
      nullTree.insert(0, 0, 10, 10, null)
      expect(nullTree.queryPoint(5, 5)).toEqual([null])
    })

    it('should support array value type', () => {
      const arrTree = new IntervalTree2D<number[]>()
      arrTree.insert(0, 0, 10, 10, [1, 2, 3])
      expect(arrTree.queryPoint(5, 5)).toEqual([[1, 2, 3]])
    })
  })

  describe('complex operations', () => {
    it('should handle interleaved inserts and removes', () => {
      tree.insert(0, 0, 10, 10, 'a')
      tree.insert(20, 20, 30, 30, 'b')
      tree.remove(0, 0, 10, 10, 'a')
      tree.insert(5, 5, 15, 15, 'c')
      tree.remove(20, 20, 30, 30, 'b')
      expect(tree.size()).toBe(1)
      expect(tree.contains(5, 5, 15, 15, 'c')).toBe(true)
    })

    it('should handle multiple point queries', () => {
      tree.insert(0, 0, 10, 10, 'a')
      tree.insert(5, 5, 15, 15, 'b')
      tree.insert(10, 10, 20, 20, 'c')
      expect(tree.queryPoint(5, 5).length).toBeGreaterThanOrEqual(2)
      expect(tree.queryPoint(10, 10).length).toBeGreaterThanOrEqual(2)
      expect(tree.queryPoint(15, 15).length).toBeGreaterThanOrEqual(2)
    })

    it('should handle range query returning multiple results', () => {
      tree.insert(0, 0, 10, 10, 'a')
      tree.insert(3, 3, 7, 7, 'b')
      tree.insert(5, 5, 15, 15, 'c')
      const results = tree.queryRange(4, 4, 8, 8)
      expect(results.length).toBe(3)
    })

    it('should handle remove with re-insertion maintaining consistency', () => {
      tree.insert(0, 0, 10, 10, 'a')
      tree.insert(5, 5, 15, 15, 'b')
      tree.remove(0, 0, 10, 10, 'a')
      tree.insert(0, 0, 10, 10, 'a2')
      expect(tree.queryPoint(5, 5)).toContain('a2')
      expect(tree.queryPoint(5, 5)).toContain('b')
    })

    it('should handle cross-axis queries correctly', () => {
      tree.insert(0, 0, 10, 100, 'wide-y')
      tree.insert(0, 0, 100, 10, 'wide-x')
      expect(tree.queryX(5)).toContain('wide-y')
      expect(tree.queryX(5)).toContain('wide-x')
      expect(tree.queryY(5)).toContain('wide-y')
      expect(tree.queryY(5)).toContain('wide-x')
      expect(tree.queryX(50)).toContain('wide-x')
      expect(tree.queryX(50)).not.toContain('wide-y')
      expect(tree.queryY(50)).toContain('wide-y')
      expect(tree.queryY(50)).not.toContain('wide-x')
    })

    it('should handle remove then query consistency', () => {
      tree.insert(0, 0, 10, 10, 'a')
      tree.insert(0, 0, 10, 10, 'b')
      tree.remove(0, 0, 10, 10, 'a')
      expect(tree.queryPoint(5, 5)).toEqual(['b'])
      expect(tree.queryX(5)).toEqual(['b'])
      expect(tree.queryY(5)).toEqual(['b'])
    })

    it('should handle getAll after complex modifications', () => {
      tree.insert(0, 0, 10, 10, 'a')
      tree.insert(5, 5, 15, 15, 'b')
      tree.remove(0, 0, 10, 10, 'a')
      tree.insert(20, 20, 30, 30, 'c')
      const all = tree.getAll()
      expect(all).toHaveLength(2)
      const values = all.map((e) => e.value)
      expect(values).toContain('b')
      expect(values).toContain('c')
    })

    it('should handle forEach after modifications', () => {
      tree.insert(0, 0, 10, 10, 'a')
      tree.insert(5, 5, 15, 15, 'b')
      tree.remove(0, 0, 10, 10, 'a')
      const values: string[] = []
      tree.forEach((rect) => { values.push(rect.value) })
      expect(values).toEqual(['b'])
    })
  })
})
