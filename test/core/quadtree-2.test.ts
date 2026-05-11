import { describe, it, expect } from 'vitest'
import { QuadTree2 } from '../../src/core/quadtree-2/index.js'
import type { Point2D, Rect2D, QuadTree2Options } from '../../src/core/quadtree-2/index.js'

describe('QuadTree2', () => {
  describe('constructor', () => {
    it('should create a tree with default options', () => {
      const qt = new QuadTree2()
      expect(qt.size).toBe(0)
      expect(qt.isEmpty).toBe(true)
      expect(qt.depth).toBe(0)
    })

    it('should create a tree with custom bounds', () => {
      const qt = new QuadTree2({ bounds: { x: -100, y: -100, width: 200, height: 200 } })
      expect(qt.bounds).toEqual({ x: -100, y: -100, width: 200, height: 200 })
    })

    it('should create a tree with custom capacity', () => {
      const qt = new QuadTree2({ capacity: 2 })
      expect(qt.size).toBe(0)
    })

    it('should create a tree with custom maxDepth', () => {
      const qt = new QuadTree2({ maxDepth: 4 })
      expect(qt.size).toBe(0)
    })

    it('should create a tree with all custom options', () => {
      const qt = new QuadTree2({
        bounds: { x: 0, y: 0, width: 500, height: 500 },
        capacity: 8,
        maxDepth: 10,
      })
      expect(qt.bounds).toEqual({ x: 0, y: 0, width: 500, height: 500 })
    })

    it('should create a tree with partial options', () => {
      const qt = new QuadTree2({ capacity: 2 })
      expect(qt.bounds.width).toBe(1000)
      expect(qt.bounds.height).toBe(1000)
    })

    it('should have correct default bounds', () => {
      const qt = new QuadTree2()
      expect(qt.bounds).toEqual({ x: 0, y: 0, width: 1000, height: 1000 })
    })
  })

  describe('insert', () => {
    it('should insert a single point', () => {
      const qt = new QuadTree2()
      qt.insert({ x: 5, y: 5 })
      expect(qt.size).toBe(1)
      expect(qt.isEmpty).toBe(false)
    })

    it('should insert multiple points', () => {
      const qt = new QuadTree2()
      qt.insert({ x: 1, y: 1 })
      qt.insert({ x: 2, y: 2 })
      qt.insert({ x: 3, y: 3 })
      expect(qt.size).toBe(3)
    })

    it('should insert points with data', () => {
      const qt = new QuadTree2<string>()
      qt.insert({ x: 1, y: 1, data: 'hello' })
      qt.insert({ x: 2, y: 2, data: 'world' })
      expect(qt.size).toBe(2)
      const all = qt.toArray()
      expect(all.find((p) => p.x === 1 && p.y === 1)?.data).toBe('hello')
      expect(all.find((p) => p.x === 2 && p.y === 2)?.data).toBe('world')
    })

    it('should insert points with numeric data', () => {
      const qt = new QuadTree2<number>()
      qt.insert({ x: 10, y: 10, data: 42 })
      const all = qt.toArray()
      expect(all[0]?.data).toBe(42)
    })

    it('should insert points with object data', () => {
      const qt = new QuadTree2<{ name: string }>()
      qt.insert({ x: 5, y: 5, data: { name: 'test' } })
      const all = qt.toArray()
      expect(all[0]?.data).toEqual({ name: 'test' })
    })

    it('should handle inserting points at same location', () => {
      const qt = new QuadTree2()
      qt.insert({ x: 5, y: 5 })
      qt.insert({ x: 5, y: 5 })
      expect(qt.size).toBe(2)
    })

    it('should trigger subdivision when capacity exceeded', () => {
      const qt = new QuadTree2({ capacity: 2, bounds: { x: 0, y: 0, width: 100, height: 100 } })
      qt.insert({ x: 10, y: 10 })
      qt.insert({ x: 80, y: 80 })
      expect(qt.depth).toBe(0)
      qt.insert({ x: 20, y: 20 })
      expect(qt.depth).toBe(1)
    })

    it('should insert many points', () => {
      const qt = new QuadTree2()
      for (let i = 0; i < 100; i++) {
        qt.insert({ x: i, y: i })
      }
      expect(qt.size).toBe(100)
    })

    it('should handle inserting at boundary coordinates', () => {
      const qt = new QuadTree2({ bounds: { x: 0, y: 0, width: 100, height: 100 } })
      qt.insert({ x: 0, y: 0 })
      qt.insert({ x: 100, y: 100 })
      expect(qt.size).toBe(2)
    })

    it('should handle inserting at exact midpoints', () => {
      const qt = new QuadTree2({ capacity: 1, bounds: { x: 0, y: 0, width: 100, height: 100 } })
      qt.insert({ x: 50, y: 50 })
      qt.insert({ x: 50, y: 50 })
      expect(qt.size).toBe(2)
    })
  })

  describe('remove', () => {
    it('should remove an existing point', () => {
      const qt = new QuadTree2()
      qt.insert({ x: 5, y: 5 })
      expect(qt.remove({ x: 5, y: 5 })).toBe(true)
      expect(qt.size).toBe(0)
    })

    it('should return false for non-existent point', () => {
      const qt = new QuadTree2()
      qt.insert({ x: 5, y: 5 })
      expect(qt.remove({ x: 10, y: 10 })).toBe(false)
      expect(qt.size).toBe(1)
    })

    it('should return false on empty tree', () => {
      const qt = new QuadTree2()
      expect(qt.remove({ x: 5, y: 5 })).toBe(false)
    })

    it('should remove correct point among many', () => {
      const qt = new QuadTree2()
      qt.insert({ x: 1, y: 1 })
      qt.insert({ x: 2, y: 2 })
      qt.insert({ x: 3, y: 3 })
      qt.remove({ x: 2, y: 2 })
      expect(qt.size).toBe(2)
      expect(qt.contains({ x: 2, y: 2 })).toBe(false)
      expect(qt.contains({ x: 1, y: 1 })).toBe(true)
      expect(qt.contains({ x: 3, y: 3 })).toBe(true)
    })

    it('should handle remove from subdivided tree', () => {
      const qt = new QuadTree2({ capacity: 2, bounds: { x: 0, y: 0, width: 100, height: 100 } })
      qt.insert({ x: 10, y: 10 })
      qt.insert({ x: 20, y: 20 })
      qt.insert({ x: 80, y: 80 })
      expect(qt.remove({ x: 10, y: 10 })).toBe(true)
      expect(qt.size).toBe(2)
    })

    it('should remove and re-insert', () => {
      const qt = new QuadTree2()
      qt.insert({ x: 5, y: 5 })
      qt.remove({ x: 5, y: 5 })
      qt.insert({ x: 5, y: 5 })
      expect(qt.size).toBe(1)
    })

    it('should only remove first match at duplicate coordinates', () => {
      const qt = new QuadTree2()
      qt.insert({ x: 5, y: 5 })
      qt.insert({ x: 5, y: 5 })
      qt.remove({ x: 5, y: 5 })
      expect(qt.size).toBe(1)
    })
  })

  describe('contains', () => {
    it('should find an existing point', () => {
      const qt = new QuadTree2()
      qt.insert({ x: 5, y: 5 })
      expect(qt.contains({ x: 5, y: 5 })).toBe(true)
    })

    it('should return false for non-existent point', () => {
      const qt = new QuadTree2()
      qt.insert({ x: 5, y: 5 })
      expect(qt.contains({ x: 10, y: 10 })).toBe(false)
    })

    it('should return false on empty tree', () => {
      const qt = new QuadTree2()
      expect(qt.contains({ x: 5, y: 5 })).toBe(false)
    })

    it('should find points after subdivision', () => {
      const qt = new QuadTree2({ capacity: 1, bounds: { x: 0, y: 0, width: 100, height: 100 } })
      qt.insert({ x: 10, y: 10 })
      qt.insert({ x: 80, y: 80 })
      expect(qt.contains({ x: 10, y: 10 })).toBe(true)
      expect(qt.contains({ x: 80, y: 80 })).toBe(true)
    })

    it('should not find removed points', () => {
      const qt = new QuadTree2()
      qt.insert({ x: 5, y: 5 })
      qt.remove({ x: 5, y: 5 })
      expect(qt.contains({ x: 5, y: 5 })).toBe(false)
    })
  })

  describe('query (rectangle)', () => {
    it('should find points within a rectangle', () => {
      const qt = new QuadTree2()
      qt.insert({ x: 5, y: 5 })
      qt.insert({ x: 50, y: 50 })
      qt.insert({ x: 900, y: 900 })
      const result = qt.query({ x: 0, y: 0, width: 100, height: 100 })
      expect(result).toHaveLength(2)
    })

    it('should return empty for no matching points', () => {
      const qt = new QuadTree2()
      qt.insert({ x: 900, y: 900 })
      const result = qt.query({ x: 0, y: 0, width: 10, height: 10 })
      expect(result).toHaveLength(0)
    })

    it('should return empty for empty tree', () => {
      const qt = new QuadTree2()
      const result = qt.query({ x: 0, y: 0, width: 100, height: 100 })
      expect(result).toHaveLength(0)
    })

    it('should find points on boundary of query region', () => {
      const qt = new QuadTree2()
      qt.insert({ x: 10, y: 10 })
      const result = qt.query({ x: 0, y: 0, width: 10, height: 10 })
      expect(result).toHaveLength(1)
    })

    it('should find all points with full bounds query', () => {
      const qt = new QuadTree2()
      qt.insert({ x: 100, y: 100 })
      qt.insert({ x: 500, y: 500 })
      qt.insert({ x: 900, y: 900 })
      const result = qt.query({ x: 0, y: 0, width: 1000, height: 1000 })
      expect(result).toHaveLength(3)
    })

    it('should preserve data in query results', () => {
      const qt = new QuadTree2<string>()
      qt.insert({ x: 5, y: 5, data: 'found' })
      const result = qt.query({ x: 0, y: 0, width: 100, height: 100 })
      expect(result[0]?.data).toBe('found')
    })

    it('should work correctly after subdivision', () => {
      const qt = new QuadTree2({ capacity: 2, bounds: { x: 0, y: 0, width: 100, height: 100 } })
      qt.insert({ x: 10, y: 10 })
      qt.insert({ x: 20, y: 20 })
      qt.insert({ x: 80, y: 80 })
      qt.insert({ x: 90, y: 90 })
      const result = qt.query({ x: 0, y: 0, width: 50, height: 50 })
      expect(result).toHaveLength(2)
    })

    it('should handle query region outside tree bounds', () => {
      const qt = new QuadTree2()
      qt.insert({ x: 5, y: 5 })
      const result = qt.query({ x: 5000, y: 5000, width: 100, height: 100 })
      expect(result).toHaveLength(0)
    })
  })

  describe('queryRadius', () => {
    it('should find points within radius', () => {
      const qt = new QuadTree2()
      qt.insert({ x: 5, y: 5 })
      qt.insert({ x: 6, y: 6 })
      qt.insert({ x: 100, y: 100 })
      const result = qt.queryRadius(5, 5, 2)
      expect(result).toHaveLength(2)
    })

    it('should return empty for no points in radius', () => {
      const qt = new QuadTree2()
      qt.insert({ x: 100, y: 100 })
      const result = qt.queryRadius(0, 0, 5)
      expect(result).toHaveLength(0)
    })

    it('should return empty for empty tree', () => {
      const qt = new QuadTree2()
      const result = qt.queryRadius(5, 5, 10)
      expect(result).toHaveLength(0)
    })

    it('should find point at exact radius distance', () => {
      const qt = new QuadTree2()
      qt.insert({ x: 10, y: 0 })
      const result = qt.queryRadius(0, 0, 10)
      expect(result).toHaveLength(1)
    })

    it('should find points with zero radius if at same location', () => {
      const qt = new QuadTree2()
      qt.insert({ x: 5, y: 5 })
      const result = qt.queryRadius(5, 5, 0)
      expect(result).toHaveLength(1)
    })

    it('should preserve data in radius results', () => {
      const qt = new QuadTree2<number>()
      qt.insert({ x: 5, y: 5, data: 42 })
      const result = qt.queryRadius(5, 5, 1)
      expect(result[0]?.data).toBe(42)
    })

    it('should work with large radius', () => {
      const qt = new QuadTree2()
      qt.insert({ x: 10, y: 10 })
      qt.insert({ x: 500, y: 500 })
      const result = qt.queryRadius(250, 250, 500)
      expect(result).toHaveLength(2)
    })

    it('should work after subdivision', () => {
      const qt = new QuadTree2({ capacity: 1, bounds: { x: 0, y: 0, width: 100, height: 100 } })
      qt.insert({ x: 10, y: 10 })
      qt.insert({ x: 90, y: 90 })
      const result = qt.queryRadius(10, 10, 5)
      expect(result).toHaveLength(1)
    })
  })

  describe('queryNearest', () => {
    it('should find single nearest neighbor', () => {
      const qt = new QuadTree2()
      qt.insert({ x: 1, y: 1 })
      qt.insert({ x: 100, y: 100 })
      const result = qt.queryNearest({ x: 2, y: 2 }, 1)
      expect(result).toHaveLength(1)
      expect(result[0]?.x).toBe(1)
      expect(result[0]?.y).toBe(1)
    })

    it('should find k nearest neighbors', () => {
      const qt = new QuadTree2()
      qt.insert({ x: 1, y: 1 })
      qt.insert({ x: 2, y: 2 })
      qt.insert({ x: 3, y: 3 })
      qt.insert({ x: 100, y: 100 })
      const result = qt.queryNearest({ x: 0, y: 0 }, 3)
      expect(result).toHaveLength(3)
      expect(result[0]?.x).toBe(1)
      expect(result[1]?.x).toBe(2)
      expect(result[2]?.x).toBe(3)
    })

    it('should return fewer results if not enough points', () => {
      const qt = new QuadTree2()
      qt.insert({ x: 5, y: 5 })
      const result = qt.queryNearest({ x: 0, y: 0 }, 5)
      expect(result).toHaveLength(1)
    })

    it('should return empty for empty tree', () => {
      const qt = new QuadTree2()
      const result = qt.queryNearest({ x: 0, y: 0 }, 1)
      expect(result).toHaveLength(0)
    })

    it('should return empty for k=0', () => {
      const qt = new QuadTree2()
      qt.insert({ x: 5, y: 5 })
      const result = qt.queryNearest({ x: 0, y: 0 }, 0)
      expect(result).toHaveLength(0)
    })

    it('should preserve data in nearest results', () => {
      const qt = new QuadTree2<string>()
      qt.insert({ x: 1, y: 1, data: 'closest' })
      qt.insert({ x: 100, y: 100, data: 'far' })
      const result = qt.queryNearest({ x: 0, y: 0 }, 1)
      expect(result[0]?.data).toBe('closest')
    })

    it('should work after subdivision', () => {
      const qt = new QuadTree2({ capacity: 1, bounds: { x: 0, y: 0, width: 100, height: 100 } })
      qt.insert({ x: 5, y: 5 })
      qt.insert({ x: 95, y: 95 })
      qt.insert({ x: 10, y: 10 })
      const result = qt.queryNearest({ x: 6, y: 6 }, 2)
      expect(result).toHaveLength(2)
      expect(result[0]?.x).toBe(5)
      expect(result[1]?.x).toBe(10)
    })

    it('should handle k larger than tree size', () => {
      const qt = new QuadTree2()
      qt.insert({ x: 1, y: 1 })
      qt.insert({ x: 2, y: 2 })
      const result = qt.queryNearest({ x: 0, y: 0 }, 100)
      expect(result).toHaveLength(2)
    })
  })

  describe('nearest', () => {
    it('should find single nearest neighbor', () => {
      const qt = new QuadTree2()
      qt.insert({ x: 1, y: 1 })
      qt.insert({ x: 50, y: 50 })
      const result = qt.nearest({ x: 2, y: 2 })
      expect(result).toBeDefined()
      expect(result?.x).toBe(1)
      expect(result?.y).toBe(1)
    })

    it('should return undefined for empty tree', () => {
      const qt = new QuadTree2()
      expect(qt.nearest({ x: 0, y: 0 })).toBeUndefined()
    })

    it('should return the only point', () => {
      const qt = new QuadTree2()
      qt.insert({ x: 10, y: 10 })
      const result = qt.nearest({ x: 0, y: 0 })
      expect(result?.x).toBe(10)
    })
  })

  describe('within', () => {
    it('should be alias for queryRadius', () => {
      const qt = new QuadTree2()
      qt.insert({ x: 5, y: 5 })
      qt.insert({ x: 100, y: 100 })
      const result = qt.within({ x: 5, y: 5 }, 10)
      expect(result).toHaveLength(1)
      expect(result[0]?.x).toBe(5)
    })

    it('should return empty for no matches', () => {
      const qt = new QuadTree2()
      qt.insert({ x: 100, y: 100 })
      const result = qt.within({ x: 0, y: 0 }, 1)
      expect(result).toHaveLength(0)
    })
  })

  describe('size / count / isEmpty', () => {
    it('size should return 0 for empty tree', () => {
      const qt = new QuadTree2()
      expect(qt.size).toBe(0)
    })

    it('isEmpty should be true for empty tree', () => {
      const qt = new QuadTree2()
      expect(qt.isEmpty).toBe(true)
    })

    it('count should equal size', () => {
      const qt = new QuadTree2()
      qt.insert({ x: 1, y: 1 })
      qt.insert({ x: 2, y: 2 })
      expect(qt.count()).toBe(qt.size)
      expect(qt.count()).toBe(2)
    })

    it('isEmpty should be false after insert', () => {
      const qt = new QuadTree2()
      qt.insert({ x: 1, y: 1 })
      expect(qt.isEmpty).toBe(false)
    })
  })

  describe('clear', () => {
    it('should clear all points', () => {
      const qt = new QuadTree2()
      qt.insert({ x: 1, y: 1 })
      qt.insert({ x: 2, y: 2 })
      qt.clear()
      expect(qt.size).toBe(0)
      expect(qt.isEmpty).toBe(true)
    })

    it('should preserve bounds after clear', () => {
      const qt = new QuadTree2({ bounds: { x: 0, y: 0, width: 100, height: 100 } })
      qt.insert({ x: 1, y: 1 })
      qt.clear()
      expect(qt.bounds).toEqual({ x: 0, y: 0, width: 100, height: 100 })
    })

    it('should reset depth after clear', () => {
      const qt = new QuadTree2({ capacity: 1, bounds: { x: 0, y: 0, width: 100, height: 100 } })
      qt.insert({ x: 10, y: 10 })
      qt.insert({ x: 90, y: 90 })
      expect(qt.depth).toBeGreaterThan(0)
      qt.clear()
      expect(qt.depth).toBe(0)
    })

    it('should allow insert after clear', () => {
      const qt = new QuadTree2()
      qt.insert({ x: 1, y: 1 })
      qt.clear()
      qt.insert({ x: 2, y: 2 })
      expect(qt.size).toBe(1)
      expect(qt.contains({ x: 2, y: 2 })).toBe(true)
    })
  })

  describe('toArray / all', () => {
    it('should return all points as array', () => {
      const qt = new QuadTree2()
      qt.insert({ x: 1, y: 1 })
      qt.insert({ x: 2, y: 2 })
      const arr = qt.toArray()
      expect(arr).toHaveLength(2)
    })

    it('all should be alias for toArray', () => {
      const qt = new QuadTree2()
      qt.insert({ x: 1, y: 1 })
      expect(qt.all()).toEqual(qt.toArray())
    })

    it('should return empty array for empty tree', () => {
      const qt = new QuadTree2()
      expect(qt.toArray()).toEqual([])
    })

    it('should preserve data in toArray', () => {
      const qt = new QuadTree2<string>()
      qt.insert({ x: 1, y: 1, data: 'a' })
      qt.insert({ x: 2, y: 2, data: 'b' })
      const arr = qt.toArray()
      expect(arr.map((p) => p.data)).toContain('a')
      expect(arr.map((p) => p.data)).toContain('b')
    })
  })

  describe('forEach', () => {
    it('should iterate all points', () => {
      const qt = new QuadTree2()
      qt.insert({ x: 1, y: 1 })
      qt.insert({ x: 2, y: 2 })
      qt.insert({ x: 3, y: 3 })
      const collected: Array<{ x: number; y: number }> = []
      qt.forEach((p) => collected.push({ x: p.x, y: p.y }))
      expect(collected).toHaveLength(3)
    })

    it('should provide correct index', () => {
      const qt = new QuadTree2()
      qt.insert({ x: 1, y: 1 })
      qt.insert({ x: 2, y: 2 })
      const indices: number[] = []
      qt.forEach((_p, i) => indices.push(i))
      expect(indices).toEqual([0, 1])
    })

    it('should not iterate on empty tree', () => {
      const qt = new QuadTree2()
      let count = 0
      qt.forEach(() => count++)
      expect(count).toBe(0)
    })
  })

  describe('Symbol.iterator', () => {
    it('should be iterable', () => {
      const qt = new QuadTree2()
      qt.insert({ x: 1, y: 1 })
      qt.insert({ x: 2, y: 2 })
      const arr = [...qt]
      expect(arr).toHaveLength(2)
    })

    it('should work with for...of', () => {
      const qt = new QuadTree2()
      qt.insert({ x: 1, y: 1 })
      qt.insert({ x: 2, y: 2 })
      qt.insert({ x: 3, y: 3 })
      let count = 0
      for (const _p of qt) {
        count++
      }
      expect(count).toBe(3)
    })

    it('should work with spread on empty tree', () => {
      const qt = new QuadTree2()
      expect([...qt]).toEqual([])
    })
  })

  describe('clone', () => {
    it('should create independent copy', () => {
      const qt = new QuadTree2()
      qt.insert({ x: 1, y: 1 })
      qt.insert({ x: 2, y: 2 })
      const cloned = qt.clone()
      expect(cloned.size).toBe(2)
      expect(cloned.contains({ x: 1, y: 1 })).toBe(true)
    })

    it('should be independent from original', () => {
      const qt = new QuadTree2()
      qt.insert({ x: 1, y: 1 })
      const cloned = qt.clone()
      cloned.insert({ x: 2, y: 2 })
      expect(qt.size).toBe(1)
      expect(cloned.size).toBe(2)
    })

    it('should preserve bounds', () => {
      const qt = new QuadTree2({ bounds: { x: 0, y: 0, width: 100, height: 100 } })
      const cloned = qt.clone()
      expect(cloned.bounds).toEqual({ x: 0, y: 0, width: 100, height: 100 })
    })

    it('should preserve data', () => {
      const qt = new QuadTree2<string>()
      qt.insert({ x: 1, y: 1, data: 'hello' })
      const cloned = qt.clone()
      const arr = cloned.toArray()
      expect(arr[0]?.data).toBe('hello')
    })

    it('should clone empty tree', () => {
      const qt = new QuadTree2()
      const cloned = qt.clone()
      expect(cloned.size).toBe(0)
      expect(cloned.isEmpty).toBe(true)
    })
  })

  describe('static fromArray', () => {
    it('should create tree from array of points', () => {
      const qt = QuadTree2.fromArray([
        { x: 1, y: 1 },
        { x: 2, y: 2 },
        { x: 3, y: 3 },
      ])
      expect(qt.size).toBe(3)
    })

    it('should create tree from array with data', () => {
      const qt = QuadTree2.fromArray<number>([
        { x: 1, y: 1, data: 10 },
        { x: 2, y: 2, data: 20 },
      ])
      const arr = qt.toArray()
      expect(arr).toHaveLength(2)
    })

    it('should create tree with options', () => {
      const qt = QuadTree2.fromArray(
        [{ x: 1, y: 1 }],
        { bounds: { x: 0, y: 0, width: 50, height: 50 }, capacity: 2 },
      )
      expect(qt.size).toBe(1)
      expect(qt.bounds.width).toBe(50)
    })

    it('should create empty tree from empty array', () => {
      const qt = QuadTree2.fromArray([])
      expect(qt.size).toBe(0)
      expect(qt.isEmpty).toBe(true)
    })

    it('should create tree with data from array', () => {
      interface Item {
        id: number
      }
      const qt = QuadTree2.fromArray<Item>([
        { x: 10, y: 10, data: { id: 1 } },
        { x: 20, y: 20, data: { id: 2 } },
      ])
      const all = qt.toArray()
      expect(all).toHaveLength(2)
    })
  })

  describe('bounds getter', () => {
    it('should return the tree bounds', () => {
      const qt = new QuadTree2({ bounds: { x: 0, y: 0, width: 200, height: 200 } })
      expect(qt.bounds).toEqual({ x: 0, y: 0, width: 200, height: 200 })
    })

    it('should return copy of bounds', () => {
      const qt = new QuadTree2()
      const b = qt.bounds
      b.x = 999
      expect(qt.bounds.x).toBe(0)
    })
  })

  describe('depth getter', () => {
    it('should return 0 for empty tree', () => {
      const qt = new QuadTree2()
      expect(qt.depth).toBe(0)
    })

    it('should return 0 when below capacity', () => {
      const qt = new QuadTree2({ capacity: 10 })
      qt.insert({ x: 1, y: 1 })
      qt.insert({ x: 2, y: 2 })
      expect(qt.depth).toBe(0)
    })

    it('should increase after subdivision', () => {
      const qt = new QuadTree2({ capacity: 1, bounds: { x: 0, y: 0, width: 100, height: 100 } })
      qt.insert({ x: 10, y: 10 })
      expect(qt.depth).toBe(0)
      qt.insert({ x: 90, y: 90 })
      expect(qt.depth).toBe(1)
    })

    it('should increase with deeper subdivision', () => {
      const qt = new QuadTree2({ capacity: 1, bounds: { x: 0, y: 0, width: 100, height: 100 } })
      qt.insert({ x: 10, y: 10 })
      qt.insert({ x: 11, y: 11 })
      qt.insert({ x: 12, y: 12 })
      expect(qt.depth).toBeGreaterThan(0)
    })
  })

  describe('subdivision behavior', () => {
    it('should respect capacity setting', () => {
      const qt = new QuadTree2({ capacity: 3, bounds: { x: 0, y: 0, width: 100, height: 100 } })
      qt.insert({ x: 10, y: 10 })
      qt.insert({ x: 20, y: 20 })
      qt.insert({ x: 80, y: 80 })
      expect(qt.depth).toBe(0)
      qt.insert({ x: 90, y: 90 })
      expect(qt.depth).toBe(1)
    })

    it('should respect maxDepth setting', () => {
      const qt = new QuadTree2({ capacity: 1, maxDepth: 1, bounds: { x: 0, y: 0, width: 100, height: 100 } })
      qt.insert({ x: 10, y: 10 })
      qt.insert({ x: 11, y: 11 })
      qt.insert({ x: 12, y: 12 })
      qt.insert({ x: 13, y: 13 })
      expect(qt.depth).toBe(1)
      expect(qt.size).toBe(4)
    })

    it('should distribute points to correct quadrants', () => {
      const qt = new QuadTree2({ capacity: 1, bounds: { x: 0, y: 0, width: 100, height: 100 } })
      qt.insert({ x: 10, y: 10 })
      qt.insert({ x: 90, y: 10 })
      qt.insert({ x: 10, y: 90 })
      qt.insert({ x: 90, y: 90 })
      expect(qt.contains({ x: 10, y: 10 })).toBe(true)
      expect(qt.contains({ x: 90, y: 10 })).toBe(true)
      expect(qt.contains({ x: 10, y: 90 })).toBe(true)
      expect(qt.contains({ x: 90, y: 90 })).toBe(true)
    })
  })

  describe('edge cases', () => {
    it('should handle negative coordinates', () => {
      const qt = new QuadTree2({ bounds: { x: -100, y: -100, width: 200, height: 200 } })
      qt.insert({ x: -50, y: -50 })
      expect(qt.contains({ x: -50, y: -50 })).toBe(true)
    })

    it('should handle point at origin', () => {
      const qt = new QuadTree2({ bounds: { x: -50, y: -50, width: 100, height: 100 } })
      qt.insert({ x: 0, y: 0 })
      expect(qt.contains({ x: 0, y: 0 })).toBe(true)
    })

    it('should handle query with zero-size region', () => {
      const qt = new QuadTree2()
      qt.insert({ x: 5, y: 5 })
      const result = qt.query({ x: 5, y: 5, width: 0, height: 0 })
      expect(result).toHaveLength(1)
    })

    it('should handle duplicate insertions at same coordinates', () => {
      const qt = new QuadTree2()
      for (let i = 0; i < 10; i++) {
        qt.insert({ x: 5, y: 5 })
      }
      expect(qt.size).toBe(10)
      expect(qt.toArray()).toHaveLength(10)
    })

    it('should handle query radius of 0', () => {
      const qt = new QuadTree2()
      qt.insert({ x: 5, y: 5 })
      expect(qt.queryRadius(5, 5, 0)).toHaveLength(1)
      expect(qt.queryRadius(5.001, 5, 0)).toHaveLength(0)
    })

    it('should handle single point tree operations', () => {
      const qt = new QuadTree2()
      qt.insert({ x: 5, y: 5 })
      expect(qt.size).toBe(1)
      expect(qt.isEmpty).toBe(false)
      expect(qt.contains({ x: 5, y: 5 })).toBe(true)
      expect(qt.nearest({ x: 0, y: 0 })?.x).toBe(5)
      expect(qt.toArray()).toHaveLength(1)
    })

    it('should handle type exports', () => {
      const pt: Point2D = { x: 1, y: 2 }
      const rect: Rect2D = { x: 0, y: 0, width: 100, height: 100 }
      const opts: QuadTree2Options = { bounds: rect, capacity: 4, maxDepth: 8 }
      expect(pt.x).toBe(1)
      expect(rect.width).toBe(100)
      expect(opts.capacity).toBe(4)
    })
  })

  describe('large inputs', () => {
    it('should handle 1000 inserts and queries', () => {
      const qt = new QuadTree2({ bounds: { x: 0, y: 0, width: 1000, height: 1000 } })
      for (let i = 0; i < 1000; i++) {
        qt.insert({ x: i % 1000, y: Math.floor(i / 10) % 1000 })
      }
      expect(qt.size).toBe(1000)
      const result = qt.query({ x: 0, y: 0, width: 100, height: 100 })
      expect(result.length).toBeGreaterThan(0)
    })

    it('should handle 1000 inserts and queryRadius', () => {
      const qt = new QuadTree2({ bounds: { x: 0, y: 0, width: 1000, height: 1000 } })
      for (let i = 0; i < 500; i++) {
        qt.insert({ x: i * 2, y: i * 2 })
      }
      const result = qt.queryRadius(0, 0, 100)
      expect(result.length).toBeGreaterThan(0)
    })

    it('should handle 500 inserts and queryNearest', () => {
      const qt = new QuadTree2({ bounds: { x: 0, y: 0, width: 1000, height: 1000 } })
      for (let i = 0; i < 500; i++) {
        qt.insert({ x: i, y: i })
      }
      const result = qt.queryNearest({ x: 250, y: 250 }, 5)
      expect(result).toHaveLength(5)
    })

    it('should handle 1000 inserts and toArray', () => {
      const qt = new QuadTree2({ bounds: { x: 0, y: 0, width: 1000, height: 1000 } })
      for (let i = 0; i < 1000; i++) {
        qt.insert({ x: i % 100, y: Math.floor(i / 100) * 10 })
      }
      const arr = qt.toArray()
      expect(arr).toHaveLength(1000)
    })

    it('should handle 500 inserts and clear', () => {
      const qt = new QuadTree2()
      for (let i = 0; i < 500; i++) {
        qt.insert({ x: i, y: i })
      }
      expect(qt.size).toBe(500)
      qt.clear()
      expect(qt.size).toBe(0)
      expect(qt.isEmpty).toBe(true)
    })

    it('should handle 200 inserts and forEach', () => {
      const qt = new QuadTree2()
      for (let i = 0; i < 200; i++) {
        qt.insert({ x: i, y: i })
      }
      let count = 0
      qt.forEach(() => count++)
      expect(count).toBe(200)
    })

    it('should handle 200 inserts and iterator', () => {
      const qt = new QuadTree2()
      for (let i = 0; i < 200; i++) {
        qt.insert({ x: i, y: i })
      }
      let count = 0
      for (const _p of qt) {
        count++
      }
      expect(count).toBe(200)
    })

    it('should handle 100 inserts and clone', () => {
      const qt = new QuadTree2()
      for (let i = 0; i < 100; i++) {
        qt.insert({ x: i, y: i })
      }
      const cloned = qt.clone()
      expect(cloned.size).toBe(100)
    })

    it('should handle 100 inserts and remove', () => {
      const qt = new QuadTree2()
      for (let i = 0; i < 100; i++) {
        qt.insert({ x: i, y: i })
      }
      for (let i = 0; i < 50; i++) {
        qt.remove({ x: i, y: i })
      }
      expect(qt.size).toBe(50)
    })

    it('should handle fromArray with 500 points', () => {
      const points = Array.from({ length: 500 }, (_, i) => ({ x: i, y: i }))
      const qt = QuadTree2.fromArray(points)
      expect(qt.size).toBe(500)
    })
  })
})
