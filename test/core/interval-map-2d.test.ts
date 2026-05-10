import { describe, it, expect, beforeEach } from 'vitest'
import { IntervalMap2D } from '../../src/core/interval-map-2d/interval-map-2d.js'
import type { Rect, Entry } from '../../src/core/interval-map-2d/types.js'

describe('IntervalMap2D', () => {
  let map: IntervalMap2D<string>

  beforeEach(() => {
    map = new IntervalMap2D<string>()
  })

  describe('constructor', () => {
    it('should create an empty map', () => {
      const m = new IntervalMap2D<string>()
      expect(m.size).toBe(0)
    })

    it('should accept no options', () => {
      const m = new IntervalMap2D<number>()
      expect(m.size).toBe(0)
    })

    it('should accept empty options object', () => {
      const m = new IntervalMap2D<number>({})
      expect(m.size).toBe(0)
    })

    it('should accept options with normalizeBounds true', () => {
      const m = new IntervalMap2D<number>({ normalizeBounds: true })
      expect(m.size).toBe(0)
    })

    it('should accept options with normalizeBounds false', () => {
      const m = new IntervalMap2D<number>({ normalizeBounds: false })
      expect(m.size).toBe(0)
    })
  })

  describe('set and get basic', () => {
    it('should set and get a single region', () => {
      map.set(0, 0, 10, 10, 'A')
      const result = map.get(5, 5)
      expect(result).toEqual(['A'])
    })

    it('should return empty array for point outside region', () => {
      map.set(0, 0, 10, 10, 'A')
      expect(map.get(15, 15)).toEqual([])
    })

    it('should return value at region corner (0,0)', () => {
      map.set(0, 0, 10, 10, 'A')
      expect(map.get(0, 0)).toEqual(['A'])
    })

    it('should return value at region corner (10,10)', () => {
      map.set(0, 0, 10, 10, 'A')
      expect(map.get(10, 10)).toEqual(['A'])
    })

    it('should overwrite value for same bounds', () => {
      map.set(0, 0, 10, 10, 'A')
      map.set(0, 0, 10, 10, 'B')
      expect(map.get(5, 5)).toEqual(['B'])
      expect(map.size).toBe(1)
    })

    it('should handle multiple non-overlapping regions', () => {
      map.set(0, 0, 5, 5, 'A')
      map.set(10, 10, 15, 15, 'B')
      map.set(20, 20, 25, 25, 'C')
      expect(map.get(2, 2)).toEqual(['A'])
      expect(map.get(12, 12)).toEqual(['B'])
      expect(map.get(22, 22)).toEqual(['C'])
      expect(map.size).toBe(3)
    })

    it('should return multiple values for point in overlapping regions', () => {
      map.set(0, 0, 10, 10, 'A')
      map.set(5, 5, 15, 15, 'B')
      const result = map.get(7, 7)
      expect(result).toContain('A')
      expect(result).toContain('B')
      expect(result.length).toBe(2)
    })

    it('should handle region at a single point', () => {
      map.set(5, 5, 5, 5, 'point')
      expect(map.get(5, 5)).toEqual(['point'])
      expect(map.get(4, 5)).toEqual([])
      expect(map.get(5, 4)).toEqual([])
    })

    it('should handle negative coordinates in regions', () => {
      map.set(-10, -10, -1, -1, 'negative')
      expect(map.get(-5, -5)).toEqual(['negative'])
    })

    it('should handle mixed positive and negative bounds', () => {
      map.set(-5, -5, 5, 5, 'cross-origin')
      expect(map.get(0, 0)).toEqual(['cross-origin'])
      expect(map.get(-3, 3)).toEqual(['cross-origin'])
    })

    it('should normalize swapped bounds (x1 > x2)', () => {
      map.set(10, 0, 0, 10, 'swapped')
      expect(map.get(5, 5)).toEqual(['swapped'])
    })

    it('should normalize swapped bounds (y1 > y2)', () => {
      map.set(0, 10, 10, 0, 'swapped')
      expect(map.get(5, 5)).toEqual(['swapped'])
    })
  })

  describe('point queries inside/outside regions', () => {
    beforeEach(() => {
      map.set(0, 0, 100, 100, 'region')
    })

    it('should find point at center of region', () => {
      expect(map.get(50, 50)).toEqual(['region'])
    })

    it('should find point at top-left corner', () => {
      expect(map.get(0, 0)).toEqual(['region'])
    })

    it('should find point at bottom-right corner', () => {
      expect(map.get(100, 100)).toEqual(['region'])
    })

    it('should find point at top-right corner', () => {
      expect(map.get(100, 0)).toEqual(['region'])
    })

    it('should find point at bottom-left corner', () => {
      expect(map.get(0, 100)).toEqual(['region'])
    })

    it('should not find point at x-1', () => {
      expect(map.get(-1, 50)).toEqual([])
    })

    it('should not find point at x+101', () => {
      expect(map.get(101, 50)).toEqual([])
    })

    it('should not find point at y-1', () => {
      expect(map.get(50, -1)).toEqual([])
    })

    it('should not find point at y+101', () => {
      expect(map.get(50, 101)).toEqual([])
    })

    it('should find point on left edge', () => {
      expect(map.get(0, 50)).toEqual(['region'])
    })

    it('should find point on right edge', () => {
      expect(map.get(100, 50)).toEqual(['region'])
    })

    it('should find point on top edge', () => {
      expect(map.get(50, 0)).toEqual(['region'])
    })

    it('should find point on bottom edge', () => {
      expect(map.get(50, 100)).toEqual(['region'])
    })
  })

  describe('overlapping regions', () => {
    beforeEach(() => {
      map.set(0, 0, 10, 10, 'A')
      map.set(5, 5, 15, 15, 'B')
      map.set(8, 8, 20, 20, 'C')
    })

    it('should return only A for point in A only', () => {
      expect(map.get(2, 2)).toEqual(['A'])
    })

    it('should return only C for point in C only', () => {
      expect(map.get(18, 18)).toEqual(['C'])
    })

    it('should return A and B for point in overlap A-B', () => {
      const result = map.get(6, 6)
      expect(result).toContain('A')
      expect(result).toContain('B')
      expect(result.length).toBe(2)
    })

    it('should return A, B, C for point in triple overlap', () => {
      const result = map.get(9, 9)
      expect(result).toContain('A')
      expect(result).toContain('B')
      expect(result).toContain('C')
      expect(result.length).toBe(3)
    })

    it('should return B and C for point in overlap B-C only', () => {
      const result = map.get(12, 12)
      expect(result).toContain('B')
      expect(result).toContain('C')
      expect(result.length).toBe(2)
    })

    it('should return empty for point outside all', () => {
      expect(map.get(25, 25)).toEqual([])
    })

    it('should handle completely overlapping regions', () => {
      map.clear()
      map.set(0, 0, 10, 10, 'outer')
      map.set(2, 2, 8, 8, 'inner')
      const result = map.get(5, 5)
      expect(result).toContain('outer')
      expect(result).toContain('inner')
      expect(result.length).toBe(2)
    })

    it('should handle identical overlapping regions', () => {
      map.clear()
      map.set(0, 0, 10, 10, 'first')
      map.set(0, 0, 10, 10, 'second')
      expect(map.get(5, 5)).toEqual(['second'])
      expect(map.size).toBe(1)
    })
  })

  describe('contained regions', () => {
    it('should detect point in inner contained region', () => {
      map.set(0, 0, 20, 20, 'outer')
      map.set(5, 5, 10, 10, 'inner')
      expect(map.get(7, 7)).toContain('outer')
      expect(map.get(7, 7)).toContain('inner')
    })

    it('should detect point only in outer region', () => {
      map.set(0, 0, 20, 20, 'outer')
      map.set(5, 5, 10, 10, 'inner')
      expect(map.get(2, 2)).toEqual(['outer'])
    })

    it('should handle deeply nested regions', () => {
      map.set(0, 0, 100, 100, 'L1')
      map.set(25, 25, 75, 75, 'L2')
      map.set(40, 40, 60, 60, 'L3')
      map.set(48, 48, 52, 52, 'L4')
      const result = map.get(50, 50)
      expect(result.length).toBe(4)
      expect(result).toContain('L1')
      expect(result).toContain('L2')
      expect(result).toContain('L3')
      expect(result).toContain('L4')
    })

    it('should find correct values at each nesting level edge', () => {
      map.set(0, 0, 100, 100, 'L1')
      map.set(25, 25, 75, 75, 'L2')
      expect(map.get(1, 1)).toEqual(['L1'])
      expect(map.get(30, 30)).toContain('L1')
      expect(map.get(30, 30)).toContain('L2')
    })

    it('should handle multiple non-contained inner regions', () => {
      map.set(0, 0, 100, 100, 'outer')
      map.set(10, 10, 20, 20, 'inner1')
      map.set(30, 30, 40, 40, 'inner2')
      expect(map.get(15, 15)).toContain('outer')
      expect(map.get(15, 15)).toContain('inner1')
      expect(map.get(15, 15)).not.toContain('inner2')
      expect(map.get(35, 35)).toContain('outer')
      expect(map.get(35, 35)).toContain('inner2')
      expect(map.get(35, 35)).not.toContain('inner1')
    })
  })

  describe('getArea', () => {
    beforeEach(() => {
      map.set(0, 0, 10, 10, 'A')
      map.set(20, 20, 30, 30, 'B')
      map.set(5, 5, 25, 25, 'C')
    })

    it('should find regions intersecting query area', () => {
      const result = map.getArea(0, 0, 10, 10)
      expect(result.length).toBe(2)
      const values = result.map((r) => r.value)
      expect(values).toContain('A')
      expect(values).toContain('C')
    })

    it('should find all intersecting regions for large query', () => {
      const result = map.getArea(0, 0, 30, 30)
      expect(result.length).toBe(3)
    })

    it('should return empty for non-intersecting query', () => {
      const result = map.getArea(50, 50, 60, 60)
      expect(result).toEqual([])
    })

    it('should return region touching query at edge', () => {
      const result = map.getArea(10, 10, 15, 15)
      expect(result.length).toBeGreaterThanOrEqual(1)
      const values = result.map((r) => r.value)
      expect(values).toContain('C')
    })

    it('should include bounds in result', () => {
      map.clear()
      map.set(1, 2, 3, 4, 'test')
      const result = map.getArea(0, 0, 5, 5)
      expect(result.length).toBe(1)
      expect(result[0]!.bounds).toEqual({ x1: 1, y1: 2, x2: 3, y2: 4 })
      expect(result[0]!.value).toBe('test')
    })

    it('should find region that fully contains query area', () => {
      map.clear()
      map.set(0, 0, 100, 100, 'big')
      const result = map.getArea(10, 10, 20, 20)
      expect(result.length).toBe(1)
      expect(result[0]!.value).toBe('big')
    })

    it('should find region fully contained by query area', () => {
      map.clear()
      map.set(10, 10, 20, 20, 'small')
      const result = map.getArea(0, 0, 100, 100)
      expect(result.length).toBe(1)
      expect(result[0]!.value).toBe('small')
    })

    it('should handle query at exact region boundary', () => {
      map.clear()
      map.set(0, 0, 10, 10, 'exact')
      const result = map.getArea(0, 0, 10, 10)
      expect(result.length).toBe(1)
      expect(result[0]!.value).toBe('exact')
    })

    it('should handle swapped query bounds', () => {
      map.clear()
      map.set(0, 0, 10, 10, 'A')
      const result = map.getArea(10, 10, 0, 0)
      expect(result.length).toBe(1)
      expect(result[0]!.value).toBe('A')
    })
  })

  describe('delete', () => {
    it('should delete an existing region', () => {
      map.set(0, 0, 10, 10, 'A')
      expect(map.delete(0, 0, 10, 10)).toBe(true)
      expect(map.size).toBe(0)
      expect(map.get(5, 5)).toEqual([])
    })

    it('should return false for non-existent region', () => {
      expect(map.delete(0, 0, 10, 10)).toBe(false)
    })

    it('should not affect other regions when deleting', () => {
      map.set(0, 0, 10, 10, 'A')
      map.set(20, 20, 30, 30, 'B')
      map.delete(0, 0, 10, 10)
      expect(map.size).toBe(1)
      expect(map.get(25, 25)).toEqual(['B'])
    })

    it('should delete with swapped bounds (normalized)', () => {
      map.set(0, 0, 10, 10, 'A')
      expect(map.delete(10, 10, 0, 0)).toBe(true)
      expect(map.size).toBe(0)
    })

    it('should handle deleting from empty map', () => {
      expect(map.delete(0, 0, 1, 1)).toBe(false)
    })

    it('should allow re-adding after delete', () => {
      map.set(0, 0, 10, 10, 'A')
      map.delete(0, 0, 10, 10)
      map.set(0, 0, 10, 10, 'B')
      expect(map.get(5, 5)).toEqual(['B'])
      expect(map.size).toBe(1)
    })

    it('should only delete exact bounds match', () => {
      map.set(0, 0, 10, 10, 'A')
      expect(map.delete(0, 0, 9, 9)).toBe(false)
      expect(map.size).toBe(1)
    })

    it('should delete multiple regions sequentially', () => {
      map.set(0, 0, 5, 5, 'A')
      map.set(10, 10, 15, 15, 'B')
      map.set(20, 20, 25, 25, 'C')
      expect(map.delete(10, 10, 15, 15)).toBe(true)
      expect(map.size).toBe(2)
      expect(map.delete(0, 0, 5, 5)).toBe(true)
      expect(map.size).toBe(1)
      expect(map.delete(20, 20, 25, 25)).toBe(true)
      expect(map.size).toBe(0)
    })
  })

  describe('size', () => {
    it('should return 0 for empty map', () => {
      expect(map.size).toBe(0)
    })

    it('should return 1 after adding one region', () => {
      map.set(0, 0, 10, 10, 'A')
      expect(map.size).toBe(1)
    })

    it('should increment for each unique region', () => {
      map.set(0, 0, 5, 5, 'A')
      map.set(10, 10, 15, 15, 'B')
      map.set(20, 20, 25, 25, 'C')
      expect(map.size).toBe(3)
    })

    it('should not increment when overwriting same bounds', () => {
      map.set(0, 0, 10, 10, 'A')
      map.set(0, 0, 10, 10, 'B')
      expect(map.size).toBe(1)
    })

    it('should decrement after delete', () => {
      map.set(0, 0, 10, 10, 'A')
      map.delete(0, 0, 10, 10)
      expect(map.size).toBe(0)
    })

    it('should reset to 0 after clear', () => {
      map.set(0, 0, 10, 10, 'A')
      map.set(20, 20, 30, 30, 'B')
      map.clear()
      expect(map.size).toBe(0)
    })
  })

  describe('has', () => {
    it('should return true for point inside region', () => {
      map.set(0, 0, 10, 10, 'A')
      expect(map.has(5, 5)).toBe(true)
    })

    it('should return false for point outside region', () => {
      map.set(0, 0, 10, 10, 'A')
      expect(map.has(15, 15)).toBe(false)
    })

    it('should return false for empty map', () => {
      expect(map.has(0, 0)).toBe(false)
    })

    it('should return true for point on region boundary', () => {
      map.set(0, 0, 10, 10, 'A')
      expect(map.has(0, 0)).toBe(true)
      expect(map.has(10, 10)).toBe(true)
    })

    it('should return true for point in any overlapping region', () => {
      map.set(0, 0, 10, 10, 'A')
      map.set(5, 5, 15, 15, 'B')
      expect(map.has(7, 7)).toBe(true)
    })
  })

  describe('containsPoint', () => {
    it('should behave same as has for point inside', () => {
      map.set(0, 0, 10, 10, 'A')
      expect(map.containsPoint(5, 5)).toBe(true)
    })

    it('should behave same as has for point outside', () => {
      map.set(0, 0, 10, 10, 'A')
      expect(map.containsPoint(15, 15)).toBe(false)
    })

    it('should return false for empty map', () => {
      expect(map.containsPoint(0, 0)).toBe(false)
    })

    it('should return true for point on edge', () => {
      map.set(0, 0, 10, 10, 'A')
      expect(map.containsPoint(0, 5)).toBe(true)
    })

    it('should work with negative coordinates', () => {
      map.set(-10, -10, -1, -1, 'neg')
      expect(map.containsPoint(-5, -5)).toBe(true)
      expect(map.containsPoint(0, 0)).toBe(false)
    })
  })

  describe('intersects', () => {
    it('should return true when regions overlap', () => {
      map.set(0, 0, 10, 10, 'A')
      expect(map.intersects(5, 5, 15, 15)).toBe(true)
    })

    it('should return false when regions do not overlap', () => {
      map.set(0, 0, 10, 10, 'A')
      expect(map.intersects(20, 20, 30, 30)).toBe(false)
    })

    it('should return true when query fully contains region', () => {
      map.set(5, 5, 10, 10, 'A')
      expect(map.intersects(0, 0, 20, 20)).toBe(true)
    })

    it('should return true when region fully contains query', () => {
      map.set(0, 0, 20, 20, 'A')
      expect(map.intersects(5, 5, 10, 10)).toBe(true)
    })

    it('should return true for edge-touching regions', () => {
      map.set(0, 0, 10, 10, 'A')
      expect(map.intersects(10, 0, 20, 10)).toBe(true)
    })

    it('should return false for empty map', () => {
      expect(map.intersects(0, 0, 10, 10)).toBe(false)
    })

    it('should return true for corner-touching regions', () => {
      map.set(0, 0, 10, 10, 'A')
      expect(map.intersects(10, 10, 20, 20)).toBe(true)
    })

    it('should handle negative coordinate intersection', () => {
      map.set(-10, -10, 0, 0, 'A')
      expect(map.intersects(-5, -5, 5, 5)).toBe(true)
    })

    it('should handle adjacent non-overlapping regions', () => {
      map.set(0, 0, 10, 10, 'A')
      expect(map.intersects(10.001, 0, 20, 10)).toBe(false)
    })

    it('should check against any region in map', () => {
      map.set(0, 0, 5, 5, 'A')
      map.set(100, 100, 110, 110, 'B')
      expect(map.intersects(1, 1, 2, 2)).toBe(true)
      expect(map.intersects(101, 101, 102, 102)).toBe(true)
      expect(map.intersects(50, 50, 60, 60)).toBe(false)
    })
  })

  describe('clear', () => {
    it('should remove all entries', () => {
      map.set(0, 0, 10, 10, 'A')
      map.set(20, 20, 30, 30, 'B')
      map.clear()
      expect(map.size).toBe(0)
    })

    it('should make get return empty', () => {
      map.set(0, 0, 10, 10, 'A')
      map.clear()
      expect(map.get(5, 5)).toEqual([])
    })

    it('should make has return false', () => {
      map.set(0, 0, 10, 10, 'A')
      map.clear()
      expect(map.has(5, 5)).toBe(false)
    })

    it('should be safe to call on empty map', () => {
      map.clear()
      expect(map.size).toBe(0)
    })

    it('should allow adding after clear', () => {
      map.set(0, 0, 10, 10, 'A')
      map.clear()
      map.set(20, 20, 30, 30, 'B')
      expect(map.size).toBe(1)
      expect(map.get(25, 25)).toEqual(['B'])
    })
  })

  describe('keys', () => {
    it('should return empty array for empty map', () => {
      expect(map.keys()).toEqual([])
    })

    it('should return all bounds', () => {
      map.set(0, 0, 10, 10, 'A')
      map.set(20, 20, 30, 30, 'B')
      const keys = map.keys()
      expect(keys.length).toBe(2)
      expect(keys).toContainEqual({ x1: 0, y1: 0, x2: 10, y2: 10 })
      expect(keys).toContainEqual({ x1: 20, y1: 20, x2: 30, y2: 30 })
    })

    it('should return normalized bounds', () => {
      map.set(10, 10, 0, 0, 'A')
      const keys = map.keys()
      expect(keys).toContainEqual({ x1: 0, y1: 0, x2: 10, y2: 10 })
    })
  })

  describe('values', () => {
    it('should return empty array for empty map', () => {
      expect(map.values()).toEqual([])
    })

    it('should return all values', () => {
      map.set(0, 0, 10, 10, 'A')
      map.set(20, 20, 30, 30, 'B')
      const vals = map.values()
      expect(vals.length).toBe(2)
      expect(vals).toContain('A')
      expect(vals).toContain('B')
    })

    it('should work with number values', () => {
      const numMap = new IntervalMap2D<number>()
      numMap.set(0, 0, 5, 5, 42)
      numMap.set(10, 10, 15, 15, 99)
      expect(numMap.values()).toContain(42)
      expect(numMap.values()).toContain(99)
    })

    it('should work with object values', () => {
      const objMap = new IntervalMap2D<{ name: string }>()
      objMap.set(0, 0, 5, 5, { name: 'test' })
      const vals = objMap.values()
      expect(vals.length).toBe(1)
      expect(vals[0]!.name).toBe('test')
    })
  })

  describe('entries', () => {
    it('should return empty array for empty map', () => {
      expect(map.entries()).toEqual([])
    })

    it('should return all entries as [bounds, value] tuples', () => {
      map.set(0, 0, 10, 10, 'A')
      map.set(20, 20, 30, 30, 'B')
      const entries = map.entries()
      expect(entries.length).toBe(2)
      const aEntry = entries.find(
        (e) => e[0].x1 === 0 && e[0].y1 === 0 && e[0].x2 === 10 && e[0].y2 === 10,
      )
      const bEntry = entries.find(
        (e) => e[0].x1 === 20 && e[0].y1 === 20 && e[0].x2 === 30 && e[0].y2 === 30,
      )
      expect(aEntry).toBeDefined()
      expect(aEntry![1]).toBe('A')
      expect(bEntry).toBeDefined()
      expect(bEntry![1]).toBe('B')
    })
  })

  describe('forEach', () => {
    it('should not call callback for empty map', () => {
      let count = 0
      map.forEach(() => { count++ })
      expect(count).toBe(0)
    })

    it('should iterate all entries', () => {
      map.set(0, 0, 10, 10, 'A')
      map.set(20, 20, 30, 30, 'B')
      const seen: string[] = []
      map.forEach((value, bounds) => {
        seen.push(value)
        expect(bounds).toHaveProperty('x1')
        expect(bounds).toHaveProperty('y1')
        expect(bounds).toHaveProperty('x2')
        expect(bounds).toHaveProperty('y2')
      })
      expect(seen.length).toBe(2)
      expect(seen).toContain('A')
      expect(seen).toContain('B')
    })

    it('should receive correct bounds for each entry', () => {
      map.set(1, 2, 3, 4, 'test')
      map.forEach((value, bounds) => {
        expect(value).toBe('test')
        expect(bounds).toEqual({ x1: 1, y1: 2, x2: 3, y2: 4 })
      })
    })
  })

  describe('empty map operations', () => {
    it('should return empty array from get on empty map', () => {
      expect(map.get(0, 0)).toEqual([])
    })

    it('should return empty array from getArea on empty map', () => {
      expect(map.getArea(0, 0, 10, 10)).toEqual([])
    })

    it('should return false from has on empty map', () => {
      expect(map.has(0, 0)).toBe(false)
    })

    it('should return false from containsPoint on empty map', () => {
      expect(map.containsPoint(0, 0)).toBe(false)
    })

    it('should return false from intersects on empty map', () => {
      expect(map.intersects(0, 0, 10, 10)).toBe(false)
    })

    it('should return false from delete on empty map', () => {
      expect(map.delete(0, 0, 10, 10)).toBe(false)
    })

    it('should return 0 from size on empty map', () => {
      expect(map.size).toBe(0)
    })

    it('should return empty from keys on empty map', () => {
      expect(map.keys()).toEqual([])
    })

    it('should return empty from values on empty map', () => {
      expect(map.values()).toEqual([])
    })

    it('should return empty from entries on empty map', () => {
      expect(map.entries()).toEqual([])
    })
  })

  describe('single region', () => {
    it('should find point inside single region', () => {
      map.set(5, 5, 15, 15, 'only')
      expect(map.get(10, 10)).toEqual(['only'])
    })

    it('should not find point outside single region', () => {
      map.set(5, 5, 15, 15, 'only')
      expect(map.get(0, 0)).toEqual([])
    })

    it('should find point at corner of single region', () => {
      map.set(5, 5, 15, 15, 'only')
      expect(map.get(5, 5)).toEqual(['only'])
      expect(map.get(15, 15)).toEqual(['only'])
    })

    it('should detect intersection with single region', () => {
      map.set(5, 5, 15, 15, 'only')
      expect(map.intersects(10, 10, 20, 20)).toBe(true)
    })

    it('should detect no intersection away from single region', () => {
      map.set(5, 5, 15, 15, 'only')
      expect(map.intersects(20, 20, 30, 30)).toBe(false)
    })

    it('should report size 1', () => {
      map.set(5, 5, 15, 15, 'only')
      expect(map.size).toBe(1)
    })

    it('should delete single region', () => {
      map.set(5, 5, 15, 15, 'only')
      expect(map.delete(5, 5, 15, 15)).toBe(true)
      expect(map.size).toBe(0)
    })
  })

  describe('many regions (1000+)', () => {
    it('should handle 1000 regions with point queries', () => {
      for (let i = 0; i < 1000; i++) {
        map.set(i * 10, 0, i * 10 + 5, 5, `region-${i}`)
      }
      expect(map.size).toBe(1000)
      expect(map.get(2, 2)).toEqual(['region-0'])
      expect(map.get(502, 2)).toEqual(['region-50'])
      expect(map.get(9992, 2)).toEqual(['region-999'])
      expect(map.get(7, 2)).toEqual([])
    })

    it('should handle 1000 regions with has', () => {
      for (let i = 0; i < 1000; i++) {
        map.set(i * 10, 0, i * 10 + 5, 5, `region-${i}`)
      }
      expect(map.has(2, 2)).toBe(true)
      expect(map.has(7, 2)).toBe(false)
    })

    it('should handle 1000 overlapping regions', () => {
      for (let i = 0; i < 1000; i++) {
        map.set(0, 0, i + 1, i + 1, `region-${i}`)
      }
      expect(map.size).toBe(1000)
      const result = map.get(500, 500)
      expect(result.length).toBe(501)
    })

    it('should handle deleting from 1000 regions', () => {
      for (let i = 0; i < 1000; i++) {
        map.set(i * 10, 0, i * 10 + 5, 5, `region-${i}`)
      }
      expect(map.delete(500, 0, 505, 5)).toBe(true)
      expect(map.size).toBe(999)
    })

    it('should handle area query with 1000 regions', () => {
      for (let i = 0; i < 1000; i++) {
        map.set(i * 10, 0, i * 10 + 5, 5, `region-${i}`)
      }
      const result = map.getArea(0, 0, 25, 5)
      expect(result.length).toBe(3)
    })

    it('should handle clear with 1000 regions', () => {
      for (let i = 0; i < 1000; i++) {
        map.set(i, i, i + 1, i + 1, `r${i}`)
      }
      map.clear()
      expect(map.size).toBe(0)
    })
  })

  describe('regions at origin', () => {
    it('should handle region starting at origin', () => {
      map.set(0, 0, 10, 10, 'origin')
      expect(map.get(0, 0)).toEqual(['origin'])
    })

    it('should handle region at single point origin', () => {
      map.set(0, 0, 0, 0, 'point')
      expect(map.get(0, 0)).toEqual(['point'])
      expect(map.get(0, 1)).toEqual([])
    })

    it('should handle multiple regions at origin', () => {
      map.set(0, 0, 5, 5, 'A')
      map.set(0, 0, 10, 10, 'B')
      const result = map.get(0, 0)
      expect(result).toContain('A')
      expect(result).toContain('B')
    })

    it('should handle negative region touching origin', () => {
      map.set(-5, -5, 0, 0, 'neg')
      expect(map.get(0, 0)).toEqual(['neg'])
      expect(map.get(-3, -3)).toEqual(['neg'])
    })

    it('should handle origin intersection query', () => {
      map.set(0, 0, 5, 5, 'A')
      expect(map.intersects(-1, -1, 1, 1)).toBe(true)
    })
  })

  describe('negative coordinates', () => {
    it('should handle all-negative region', () => {
      map.set(-20, -20, -10, -10, 'neg')
      expect(map.get(-15, -15)).toEqual(['neg'])
      expect(map.get(-5, -5)).toEqual([])
    })

    it('should handle mixed sign region', () => {
      map.set(-10, -10, 10, 10, 'cross')
      expect(map.get(-5, -5)).toEqual(['cross'])
      expect(map.get(5, 5)).toEqual(['cross'])
      expect(map.get(0, 0)).toEqual(['cross'])
    })

    it('should handle negative-to-negative area query', () => {
      map.set(-20, -20, -10, -10, 'neg')
      const result = map.getArea(-25, -25, -5, -5)
      expect(result.length).toBe(1)
      expect(result[0]!.value).toBe('neg')
    })

    it('should handle delete with negative bounds', () => {
      map.set(-10, -10, -5, -5, 'neg')
      expect(map.delete(-10, -10, -5, -5)).toBe(true)
      expect(map.size).toBe(0)
    })

    it('should find intersections with negative regions', () => {
      map.set(-10, -10, -1, -1, 'neg')
      expect(map.intersects(-5, -5, 5, 5)).toBe(true)
      expect(map.intersects(-20, -20, -15, -15)).toBe(false)
    })

    it('should handle large negative coordinates', () => {
      map.set(-1000000, -1000000, -999999, -999999, 'far')
      expect(map.get(-1000000, -1000000)).toEqual(['far'])
      expect(map.has(-999999, -999999)).toBe(true)
    })
  })

  describe('large regions', () => {
    it('should handle very large region', () => {
      map.set(0, 0, 1000000, 1000000, 'huge')
      expect(map.get(500000, 500000)).toEqual(['huge'])
      expect(map.size).toBe(1)
    })

    it('should handle region spanning entire coordinate space', () => {
      map.set(-1000000, -1000000, 1000000, 1000000, 'all')
      expect(map.get(0, 0)).toEqual(['all'])
      expect(map.get(-999999, 999999)).toEqual(['all'])
    })

    it('should find intersection with large region', () => {
      map.set(0, 0, 1000000, 1000000, 'huge')
      expect(map.intersects(500, 500, 600, 600)).toBe(true)
    })

    it('should handle area query with large region', () => {
      map.set(0, 0, 1000000, 1000000, 'huge')
      const result = map.getArea(10, 10, 20, 20)
      expect(result.length).toBe(1)
      expect(result[0]!.value).toBe('huge')
    })

    it('should delete large region', () => {
      map.set(0, 0, 1000000, 1000000, 'huge')
      expect(map.delete(0, 0, 1000000, 1000000)).toBe(true)
      expect(map.size).toBe(0)
    })
  })

  describe('adjacent non-overlapping regions', () => {
    it('should find correct region in adjacent horizontal pair', () => {
      map.set(0, 0, 10, 10, 'left')
      map.set(10, 0, 20, 10, 'right')
      expect(map.get(5, 5)).toEqual(['left'])
      expect(map.get(15, 5)).toEqual(['right'])
    })

    it('should find both values at shared edge', () => {
      map.set(0, 0, 10, 10, 'left')
      map.set(10, 0, 20, 10, 'right')
      const result = map.get(10, 5)
      expect(result).toContain('left')
      expect(result).toContain('right')
    })

    it('should find correct region in adjacent vertical pair', () => {
      map.set(0, 0, 10, 10, 'top')
      map.set(0, 10, 10, 20, 'bottom')
      expect(map.get(5, 5)).toEqual(['top'])
      expect(map.get(5, 15)).toEqual(['bottom'])
    })

    it('should handle grid of adjacent regions', () => {
      for (let x = 0; x < 3; x++) {
        for (let y = 0; y < 3; y++) {
          map.set(x * 10, y * 10, x * 10 + 10, y * 10 + 10, `${x}-${y}`)
        }
      }
      expect(map.size).toBe(9)
      expect(map.get(5, 5)).toEqual(['0-0'])
      expect(map.get(15, 5)).toEqual(['1-0'])
      expect(map.get(5, 15)).toEqual(['0-1'])
      expect(map.get(15, 15)).toEqual(['1-1'])
    })

    it('should detect no intersection between truly separate regions', () => {
      map.set(0, 0, 10, 10, 'A')
      map.set(11, 0, 20, 10, 'B')
      expect(map.intersects(0, 0, 10, 10)).toBe(true)
      expect(map.getArea(0, 0, 10, 10).length).toBe(1)
    })

    it('should handle four regions meeting at a point', () => {
      map.set(-10, -10, 0, 0, 'TL')
      map.set(0, -10, 10, 0, 'TR')
      map.set(-10, 0, 0, 10, 'BL')
      map.set(0, 0, 10, 10, 'BR')
      expect(map.get(-5, -5)).toEqual(['TL'])
      expect(map.get(5, -5)).toEqual(['TR'])
      expect(map.get(-5, 5)).toEqual(['BL'])
      expect(map.get(5, 5)).toEqual(['BR'])
      const center = map.get(0, 0)
      expect(center.length).toBe(4)
      expect(center).toContain('TL')
      expect(center).toContain('TR')
      expect(center).toContain('BL')
      expect(center).toContain('BR')
    })
  })

  describe('with number values', () => {
    it('should store and retrieve number values', () => {
      const numMap = new IntervalMap2D<number>()
      numMap.set(0, 0, 10, 10, 42)
      expect(numMap.get(5, 5)).toEqual([42])
    })
  })

  describe('with object values', () => {
    it('should store and retrieve object values', () => {
      interface Data { id: number; label: string }
      const objMap = new IntervalMap2D<Data>()
      objMap.set(0, 0, 10, 10, { id: 1, label: 'first' })
      objMap.set(20, 20, 30, 30, { id: 2, label: 'second' })
      const result = objMap.get(5, 5)
      expect(result.length).toBe(1)
      expect(result[0]!.id).toBe(1)
      expect(result[0]!.label).toBe('first')
    })
  })

  describe('with null values', () => {
    it('should store null values', () => {
      const nullMap = new IntervalMap2D<null>()
      nullMap.set(0, 0, 10, 10, null)
      expect(nullMap.get(5, 5)).toEqual([null])
    })
  })

  describe('with undefined values', () => {
    it('should store undefined values', () => {
      const undefMap = new IntervalMap2D<undefined>()
      undefMap.set(0, 0, 10, 10, undefined)
      expect(undefMap.get(5, 5)).toEqual([undefined])
    })
  })

  describe('getArea with empty map', () => {
    it('should return empty for any query on empty map', () => {
      expect(map.getArea(-100, -100, 100, 100)).toEqual([])
    })
  })

  describe('floating point coordinates', () => {
    it('should handle floating point region bounds', () => {
      map.set(0.5, 0.5, 10.5, 10.5, 'fp')
      expect(map.get(5.5, 5.5)).toEqual(['fp'])
    })

    it('should handle floating point point queries', () => {
      map.set(0, 0, 10, 10, 'A')
      expect(map.get(5.5, 5.5)).toEqual(['A'])
    })

    it('should handle floating point area queries', () => {
      map.set(0, 0, 10, 10, 'A')
      const result = map.getArea(0.1, 0.1, 9.9, 9.9)
      expect(result.length).toBe(1)
    })
  })

  describe('overwriting regions', () => {
    it('should replace value when setting same bounds', () => {
      map.set(0, 0, 10, 10, 'first')
      map.set(0, 0, 10, 10, 'second')
      expect(map.get(5, 5)).toEqual(['second'])
      expect(map.size).toBe(1)
    })

    it('should replace with different value type', () => {
      const anyMap = new IntervalMap2D<string | number>()
      anyMap.set(0, 0, 10, 10, 'string')
      anyMap.set(0, 0, 10, 10, 42)
      expect(anyMap.get(5, 5)).toEqual([42])
    })

    it('should replace and allow delete', () => {
      map.set(0, 0, 10, 10, 'A')
      map.set(0, 0, 10, 10, 'B')
      map.delete(0, 0, 10, 10)
      expect(map.size).toBe(0)
    })
  })

  describe('intersects edge cases', () => {
    it('should return true when query area exactly matches region', () => {
      map.set(5, 5, 15, 15, 'A')
      expect(map.intersects(5, 5, 15, 15)).toBe(true)
    })

    it('should return true for partially overlapping regions', () => {
      map.set(0, 0, 10, 10, 'A')
      expect(map.intersects(5, 5, 15, 5)).toBe(true)
    })

    it('should handle single-point query area', () => {
      map.set(0, 0, 10, 10, 'A')
      expect(map.intersects(5, 5, 5, 5)).toBe(true)
      expect(map.intersects(15, 15, 15, 15)).toBe(false)
    })
  })

  describe('getArea returning correct bounds', () => {
    it('should return normalized bounds for each entry', () => {
      map.set(10, 10, 0, 0, 'A')
      const result = map.getArea(-5, -5, 15, 15)
      expect(result.length).toBe(1)
      expect(result[0]!.bounds).toEqual({ x1: 0, y1: 0, x2: 10, y2: 10 })
    })

    it('should preserve original value reference', () => {
      const data = { x: 1 }
      const objMap = new IntervalMap2D<{ x: number }>()
      objMap.set(0, 0, 5, 5, data)
      const result = objMap.getArea(0, 0, 10, 10)
      expect(result[0]!.value).toBe(data)
    })
  })

  describe('stress: sequential operations', () => {
    it('should handle set-delete-set cycle', () => {
      for (let i = 0; i < 100; i++) {
        map.set(i, i, i + 1, i + 1, `val-${i}`)
      }
      for (let i = 0; i < 100; i += 2) {
        map.delete(i, i, i + 1, i + 1)
      }
      expect(map.size).toBe(50)
      expect(map.has(0.5, 0.5)).toBe(false)
      expect(map.has(1.5, 1.5)).toBe(true)
    })
  })
})
