import { describe, it, expect } from 'vitest'
import { SpatialGrid } from '../../src/core/spatial-grid/index.js'
import type { SpatialGridOptions } from '../../src/core/spatial-grid/index.js'

describe('SpatialGrid', () => {
  describe('constructor', () => {
    it('creates a grid with given options', () => {
      const grid = new SpatialGrid({ width: 100, height: 100, cellSize: 10 })
      expect(grid.size()).toBe(0)
      expect(grid.isEmpty()).toBe(true)
    })

    it('calculates correct number of cells when evenly divisible', () => {
      const grid = new SpatialGrid({ width: 100, height: 100, cellSize: 10 })
      expect(grid.cells()).toBe(100)
    })

    it('calculates correct number of cells with rounding up', () => {
      const grid = new SpatialGrid({ width: 101, height: 101, cellSize: 10 })
      expect(grid.cells()).toBe(121)
    })

    it('handles cellSize equal to width and height', () => {
      const grid = new SpatialGrid({ width: 50, height: 50, cellSize: 50 })
      expect(grid.cells()).toBe(1)
    })

    it('handles cellSize larger than width and height', () => {
      const grid = new SpatialGrid({ width: 10, height: 10, cellSize: 100 })
      expect(grid.cells()).toBe(1)
    })

    it('returns correct cellSize', () => {
      const grid = new SpatialGrid({ width: 100, height: 100, cellSize: 25 })
      expect(grid.cellSize()).toBe(25)
    })
  })

  describe('getCell', () => {
    it('returns correct cell for origin', () => {
      const grid = new SpatialGrid({ width: 100, height: 100, cellSize: 10 })
      expect(grid.getCell(0, 0)).toEqual([0, 0])
    })

    it('returns correct cell for position within first cell', () => {
      const grid = new SpatialGrid({ width: 100, height: 100, cellSize: 10 })
      expect(grid.getCell(5, 5)).toEqual([0, 0])
    })

    it('returns correct cell for position on cell boundary', () => {
      const grid = new SpatialGrid({ width: 100, height: 100, cellSize: 10 })
      expect(grid.getCell(10, 10)).toEqual([1, 1])
    })

    it('returns correct cell for position in second cell', () => {
      const grid = new SpatialGrid({ width: 100, height: 100, cellSize: 10 })
      expect(grid.getCell(15, 15)).toEqual([1, 1])
    })

    it('returns correct cell for position in last cell', () => {
      const grid = new SpatialGrid({ width: 100, height: 100, cellSize: 10 })
      expect(grid.getCell(99, 99)).toEqual([9, 9])
    })

    it('handles negative coordinates', () => {
      const grid = new SpatialGrid({ width: 100, height: 100, cellSize: 10 })
      expect(grid.getCell(-5, -5)).toEqual([-1, -1])
    })

    it('handles negative coordinates on boundary', () => {
      const grid = new SpatialGrid({ width: 100, height: 100, cellSize: 10 })
      expect(grid.getCell(-10, -10)).toEqual([-1, -1])
    })

    it('handles large negative coordinates', () => {
      const grid = new SpatialGrid({ width: 100, height: 100, cellSize: 10 })
      expect(grid.getCell(-25, -25)).toEqual([-3, -3])
    })

    it('handles mixed positive and negative coordinates', () => {
      const grid = new SpatialGrid({ width: 100, height: 100, cellSize: 10 })
      expect(grid.getCell(15, -15)).toEqual([1, -2])
    })
  })

  describe('insert', () => {
    it('inserts an item at a position', () => {
      const grid = new SpatialGrid<number>({ width: 100, height: 100, cellSize: 10 })
      grid.insert(1, 5, 5)
      expect(grid.size()).toBe(1)
      expect(grid.has(1)).toBe(true)
    })

    it('inserts multiple items', () => {
      const grid = new SpatialGrid<number>({ width: 100, height: 100, cellSize: 10 })
      grid.insert(1, 5, 5)
      grid.insert(2, 15, 15)
      grid.insert(3, 25, 25)
      expect(grid.size()).toBe(3)
    })

    it('inserts items in the same cell', () => {
      const grid = new SpatialGrid<number>({ width: 100, height: 100, cellSize: 10 })
      grid.insert(1, 1, 1)
      grid.insert(2, 2, 2)
      grid.insert(3, 3, 3)
      expect(grid.size()).toBe(3)
      expect(grid.queryCell(0, 0)).toEqual([1, 2, 3])
    })

    it('re-inserting same item moves it to new position', () => {
      const grid = new SpatialGrid<number>({ width: 100, height: 100, cellSize: 10 })
      grid.insert(1, 5, 5)
      grid.insert(1, 25, 25)
      expect(grid.size()).toBe(1)
      expect(grid.get(1)).toEqual({ x: 25, y: 25 })
      expect(grid.queryCell(0, 0)).toEqual([])
      expect(grid.queryCell(2, 2)).toEqual([1])
    })

    it('inserts items at exact cell boundaries', () => {
      const grid = new SpatialGrid<number>({ width: 100, height: 100, cellSize: 10 })
      grid.insert(1, 10, 10)
      grid.insert(2, 20, 20)
      expect(grid.getCell(10, 10)).toEqual([1, 1])
      expect(grid.getCell(20, 20)).toEqual([2, 2])
    })

    it('inserts items with object references', () => {
      const grid = new SpatialGrid<{ id: number }>({ width: 100, height: 100, cellSize: 10 })
      const obj = { id: 42 }
      grid.insert(obj, 5, 5)
      expect(grid.has(obj)).toBe(true)
      expect(grid.get(obj)).toEqual({ x: 5, y: 5 })
    })

    it('inserts items with string values', () => {
      const grid = new SpatialGrid<string>({ width: 100, height: 100, cellSize: 10 })
      grid.insert('hello', 5, 5)
      grid.insert('world', 15, 15)
      expect(grid.size()).toBe(2)
    })

    it('inserts items at negative coordinates', () => {
      const grid = new SpatialGrid<number>({ width: 100, height: 100, cellSize: 10 })
      grid.insert(1, -5, -5)
      expect(grid.has(1)).toBe(true)
      expect(grid.get(1)).toEqual({ x: -5, y: -5 })
    })
  })

  describe('remove', () => {
    it('removes an existing item', () => {
      const grid = new SpatialGrid<number>({ width: 100, height: 100, cellSize: 10 })
      grid.insert(1, 5, 5)
      expect(grid.remove(1)).toBe(true)
      expect(grid.size()).toBe(0)
      expect(grid.has(1)).toBe(false)
    })

    it('returns false for non-existent item', () => {
      const grid = new SpatialGrid<number>({ width: 100, height: 100, cellSize: 10 })
      expect(grid.remove(999)).toBe(false)
    })

    it('removes item from correct cell', () => {
      const grid = new SpatialGrid<number>({ width: 100, height: 100, cellSize: 10 })
      grid.insert(1, 5, 5)
      grid.insert(2, 6, 6)
      grid.remove(1)
      expect(grid.queryCell(0, 0)).toEqual([2])
    })

    it('removes the last item in a cell', () => {
      const grid = new SpatialGrid<number>({ width: 100, height: 100, cellSize: 10 })
      grid.insert(1, 5, 5)
      grid.remove(1)
      expect(grid.queryCell(0, 0)).toEqual([])
    })

    it('removes from correct cell after re-insert', () => {
      const grid = new SpatialGrid<number>({ width: 100, height: 100, cellSize: 10 })
      grid.insert(1, 5, 5)
      grid.insert(1, 25, 25)
      grid.remove(1)
      expect(grid.has(1)).toBe(false)
      expect(grid.queryCell(0, 0)).toEqual([])
      expect(grid.queryCell(2, 2)).toEqual([])
    })

    it('does not affect other items', () => {
      const grid = new SpatialGrid<number>({ width: 100, height: 100, cellSize: 10 })
      grid.insert(1, 5, 5)
      grid.insert(2, 15, 15)
      grid.insert(3, 25, 25)
      grid.remove(2)
      expect(grid.has(1)).toBe(true)
      expect(grid.has(3)).toBe(true)
      expect(grid.size()).toBe(2)
    })

    it('handles remove on empty grid', () => {
      const grid = new SpatialGrid<number>({ width: 100, height: 100, cellSize: 10 })
      expect(grid.remove(1)).toBe(false)
    })
  })

  describe('update', () => {
    it('updates position of an existing item', () => {
      const grid = new SpatialGrid<number>({ width: 100, height: 100, cellSize: 10 })
      grid.insert(1, 5, 5)
      expect(grid.update(1, 25, 25)).toBe(true)
      expect(grid.get(1)).toEqual({ x: 25, y: 25 })
    })

    it('returns false for non-existent item', () => {
      const grid = new SpatialGrid<number>({ width: 100, height: 100, cellSize: 10 })
      expect(grid.update(999, 25, 25)).toBe(false)
    })

    it('moves item between cells', () => {
      const grid = new SpatialGrid<number>({ width: 100, height: 100, cellSize: 10 })
      grid.insert(1, 5, 5)
      grid.update(1, 25, 25)
      expect(grid.queryCell(0, 0)).toEqual([])
      expect(grid.queryCell(2, 2)).toEqual([1])
    })

    it('updates to same position', () => {
      const grid = new SpatialGrid<number>({ width: 100, height: 100, cellSize: 10 })
      grid.insert(1, 5, 5)
      grid.update(1, 5, 5)
      expect(grid.get(1)).toEqual({ x: 5, y: 5 })
      expect(grid.size()).toBe(1)
    })

    it('updates multiple times', () => {
      const grid = new SpatialGrid<number>({ width: 100, height: 100, cellSize: 10 })
      grid.insert(1, 5, 5)
      grid.update(1, 15, 15)
      grid.update(1, 25, 25)
      grid.update(1, 35, 35)
      expect(grid.get(1)).toEqual({ x: 35, y: 35 })
      expect(grid.size()).toBe(1)
    })

    it('maintains size after update', () => {
      const grid = new SpatialGrid<number>({ width: 100, height: 100, cellSize: 10 })
      grid.insert(1, 5, 5)
      grid.insert(2, 15, 15)
      grid.update(1, 25, 25)
      expect(grid.size()).toBe(2)
    })
  })

  describe('query', () => {
    it('returns items within a rectangular region', () => {
      const grid = new SpatialGrid<number>({ width: 100, height: 100, cellSize: 10 })
      grid.insert(1, 5, 5)
      grid.insert(2, 15, 15)
      grid.insert(3, 25, 25)
      expect(grid.query(0, 0, 20, 20)).toEqual([1, 2])
    })

    it('returns empty array for empty region', () => {
      const grid = new SpatialGrid<number>({ width: 100, height: 100, cellSize: 10 })
      grid.insert(1, 5, 5)
      expect(grid.query(50, 50, 10, 10)).toEqual([])
    })

    it('returns empty array on empty grid', () => {
      const grid = new SpatialGrid<number>({ width: 100, height: 100, cellSize: 10 })
      expect(grid.query(0, 0, 50, 50)).toEqual([])
    })

    it('returns items at exact boundaries', () => {
      const grid = new SpatialGrid<number>({ width: 100, height: 100, cellSize: 10 })
      grid.insert(1, 5, 5)
      const result = grid.query(5, 5, 10, 10)
      expect(result).toContain(1)
    })

    it('excludes items at upper boundary (exclusive)', () => {
      const grid = new SpatialGrid<number>({ width: 100, height: 100, cellSize: 10 })
      grid.insert(1, 5, 5)
      grid.insert(2, 15, 5)
      const result = grid.query(0, 0, 10, 10)
      expect(result).toContain(1)
      expect(result).not.toContain(2)
    })

    it('queries across multiple cells', () => {
      const grid = new SpatialGrid<number>({ width: 100, height: 100, cellSize: 10 })
      grid.insert(1, 5, 5)
      grid.insert(2, 15, 5)
      grid.insert(3, 25, 5)
      const result = grid.query(0, 0, 30, 10)
      expect(result).toEqual([1, 2, 3])
    })

    it('queries a large region', () => {
      const grid = new SpatialGrid<number>({ width: 100, height: 100, cellSize: 10 })
      grid.insert(1, 5, 5)
      grid.insert(2, 55, 55)
      grid.insert(3, 95, 95)
      expect(grid.query(0, 0, 100, 100)).toEqual([1, 2, 3])
    })

    it('queries with zero width and height', () => {
      const grid = new SpatialGrid<number>({ width: 100, height: 100, cellSize: 10 })
      grid.insert(1, 5, 5)
      expect(grid.query(0, 0, 0, 0)).toEqual([])
    })

    it('queries region with negative coordinates', () => {
      const grid = new SpatialGrid<number>({ width: 100, height: 100, cellSize: 10 })
      grid.insert(1, -5, -5)
      const result = grid.query(-10, -10, 10, 10)
      expect(result).toContain(1)
    })

    it('does not return duplicates', () => {
      const grid = new SpatialGrid<number>({ width: 100, height: 100, cellSize: 10 })
      grid.insert(1, 5, 5)
      const result = grid.query(0, 0, 20, 20)
      expect(result.filter((x) => x === 1).length).toBe(1)
    })
  })

  describe('queryRadius', () => {
    it('returns items within radius', () => {
      const grid = new SpatialGrid<number>({ width: 100, height: 100, cellSize: 10 })
      grid.insert(1, 5, 5)
      grid.insert(2, 8, 5)
      grid.insert(3, 50, 50)
      const result = grid.queryRadius(5, 5, 5)
      expect(result).toContain(1)
      expect(result).toContain(2)
      expect(result).not.toContain(3)
    })

    it('returns empty array for empty grid', () => {
      const grid = new SpatialGrid<number>({ width: 100, height: 100, cellSize: 10 })
      expect(grid.queryRadius(5, 5, 10)).toEqual([])
    })

    it('returns item at exact center', () => {
      const grid = new SpatialGrid<number>({ width: 100, height: 100, cellSize: 10 })
      grid.insert(1, 10, 10)
      const result = grid.queryRadius(10, 10, 0)
      expect(result).toContain(1)
    })

    it('returns item at exact radius boundary', () => {
      const grid = new SpatialGrid<number>({ width: 100, height: 100, cellSize: 10 })
      grid.insert(1, 10, 10)
      const result = grid.queryRadius(5, 10, 5)
      expect(result).toContain(1)
    })

    it('excludes item just outside radius', () => {
      const grid = new SpatialGrid<number>({ width: 100, height: 100, cellSize: 10 })
      grid.insert(1, 15.01, 10)
      const result = grid.queryRadius(10, 10, 5)
      expect(result).not.toContain(1)
    })

    it('queries with large radius', () => {
      const grid = new SpatialGrid<number>({ width: 100, height: 100, cellSize: 10 })
      grid.insert(1, 5, 5)
      grid.insert(2, 95, 95)
      const result = grid.queryRadius(50, 50, 64)
      expect(result).toContain(1)
      expect(result).toContain(2)
    })

    it('queries with zero radius', () => {
      const grid = new SpatialGrid<number>({ width: 100, height: 100, cellSize: 10 })
      grid.insert(1, 10, 10)
      grid.insert(2, 10.01, 10)
      const result = grid.queryRadius(10, 10, 0)
      expect(result).toContain(1)
      expect(result).not.toContain(2)
    })

    it('does not return duplicates', () => {
      const grid = new SpatialGrid<number>({ width: 100, height: 100, cellSize: 10 })
      grid.insert(1, 5, 5)
      const result = grid.queryRadius(5, 5, 10)
      expect(result.filter((x) => x === 1).length).toBe(1)
    })
  })

  describe('queryCell', () => {
    it('returns items in specified cell', () => {
      const grid = new SpatialGrid<number>({ width: 100, height: 100, cellSize: 10 })
      grid.insert(1, 5, 5)
      grid.insert(2, 8, 8)
      grid.insert(3, 15, 15)
      expect(grid.queryCell(0, 0)).toEqual([1, 2])
    })

    it('returns empty array for empty cell', () => {
      const grid = new SpatialGrid<number>({ width: 100, height: 100, cellSize: 10 })
      expect(grid.queryCell(5, 5)).toEqual([])
    })

    it('returns empty array for negative cell coordinates', () => {
      const grid = new SpatialGrid<number>({ width: 100, height: 100, cellSize: 10 })
      expect(grid.queryCell(-1, -1)).toEqual([])
    })

    it('returns items after insertions and removals', () => {
      const grid = new SpatialGrid<number>({ width: 100, height: 100, cellSize: 10 })
      grid.insert(1, 5, 5)
      grid.insert(2, 8, 8)
      grid.remove(1)
      expect(grid.queryCell(0, 0)).toEqual([2])
    })

    it('returns all items in a cell', () => {
      const grid = new SpatialGrid<number>({ width: 100, height: 100, cellSize: 10 })
      for (let i = 0; i < 10; i++) {
        grid.insert(i, i, i)
      }
      expect(grid.queryCell(0, 0).length).toBe(10)
    })
  })

  describe('get', () => {
    it('returns position of existing item', () => {
      const grid = new SpatialGrid<number>({ width: 100, height: 100, cellSize: 10 })
      grid.insert(1, 5, 5)
      expect(grid.get(1)).toEqual({ x: 5, y: 5 })
    })

    it('returns undefined for non-existent item', () => {
      const grid = new SpatialGrid<number>({ width: 100, height: 100, cellSize: 10 })
      expect(grid.get(999)).toBeUndefined()
    })

    it('returns updated position', () => {
      const grid = new SpatialGrid<number>({ width: 100, height: 100, cellSize: 10 })
      grid.insert(1, 5, 5)
      grid.update(1, 25, 25)
      expect(grid.get(1)).toEqual({ x: 25, y: 25 })
    })

    it('returns undefined after removal', () => {
      const grid = new SpatialGrid<number>({ width: 100, height: 100, cellSize: 10 })
      grid.insert(1, 5, 5)
      grid.remove(1)
      expect(grid.get(1)).toBeUndefined()
    })

    it('returns position after re-insertion', () => {
      const grid = new SpatialGrid<number>({ width: 100, height: 100, cellSize: 10 })
      grid.insert(1, 5, 5)
      grid.insert(1, 50, 50)
      expect(grid.get(1)).toEqual({ x: 50, y: 50 })
    })
  })

  describe('has', () => {
    it('returns true for existing item', () => {
      const grid = new SpatialGrid<number>({ width: 100, height: 100, cellSize: 10 })
      grid.insert(1, 5, 5)
      expect(grid.has(1)).toBe(true)
    })

    it('returns false for non-existent item', () => {
      const grid = new SpatialGrid<number>({ width: 100, height: 100, cellSize: 10 })
      expect(grid.has(1)).toBe(false)
    })

    it('returns false after removal', () => {
      const grid = new SpatialGrid<number>({ width: 100, height: 100, cellSize: 10 })
      grid.insert(1, 5, 5)
      grid.remove(1)
      expect(grid.has(1)).toBe(false)
    })

    it('returns true after update', () => {
      const grid = new SpatialGrid<number>({ width: 100, height: 100, cellSize: 10 })
      grid.insert(1, 5, 5)
      grid.update(1, 25, 25)
      expect(grid.has(1)).toBe(true)
    })

    it('works with object references', () => {
      const grid = new SpatialGrid<object>({ width: 100, height: 100, cellSize: 10 })
      const obj = { id: 1 }
      grid.insert(obj, 5, 5)
      expect(grid.has(obj)).toBe(true)
      expect(grid.has({ id: 1 })).toBe(false)
    })
  })

  describe('size / isEmpty / clear', () => {
    it('size returns 0 on empty grid', () => {
      const grid = new SpatialGrid<number>({ width: 100, height: 100, cellSize: 10 })
      expect(grid.size()).toBe(0)
    })

    it('isEmpty returns true on empty grid', () => {
      const grid = new SpatialGrid<number>({ width: 100, height: 100, cellSize: 10 })
      expect(grid.isEmpty()).toBe(true)
    })

    it('size increments on insert', () => {
      const grid = new SpatialGrid<number>({ width: 100, height: 100, cellSize: 10 })
      grid.insert(1, 5, 5)
      expect(grid.size()).toBe(1)
      grid.insert(2, 15, 15)
      expect(grid.size()).toBe(2)
    })

    it('isEmpty returns false after insert', () => {
      const grid = new SpatialGrid<number>({ width: 100, height: 100, cellSize: 10 })
      grid.insert(1, 5, 5)
      expect(grid.isEmpty()).toBe(false)
    })

    it('size decrements on remove', () => {
      const grid = new SpatialGrid<number>({ width: 100, height: 100, cellSize: 10 })
      grid.insert(1, 5, 5)
      grid.insert(2, 15, 15)
      grid.remove(1)
      expect(grid.size()).toBe(1)
    })

    it('size does not change on failed remove', () => {
      const grid = new SpatialGrid<number>({ width: 100, height: 100, cellSize: 10 })
      grid.insert(1, 5, 5)
      grid.remove(999)
      expect(grid.size()).toBe(1)
    })

    it('clear empties the grid', () => {
      const grid = new SpatialGrid<number>({ width: 100, height: 100, cellSize: 10 })
      grid.insert(1, 5, 5)
      grid.insert(2, 15, 15)
      grid.insert(3, 25, 25)
      grid.clear()
      expect(grid.size()).toBe(0)
      expect(grid.isEmpty()).toBe(true)
    })

    it('clear allows re-insertion', () => {
      const grid = new SpatialGrid<number>({ width: 100, height: 100, cellSize: 10 })
      grid.insert(1, 5, 5)
      grid.clear()
      grid.insert(1, 10, 10)
      expect(grid.size()).toBe(1)
      expect(grid.get(1)).toEqual({ x: 10, y: 10 })
    })

    it('clear on empty grid does nothing', () => {
      const grid = new SpatialGrid<number>({ width: 100, height: 100, cellSize: 10 })
      grid.clear()
      expect(grid.size()).toBe(0)
    })

    it('size accounts for re-insertion', () => {
      const grid = new SpatialGrid<number>({ width: 100, height: 100, cellSize: 10 })
      grid.insert(1, 5, 5)
      grid.insert(1, 25, 25)
      expect(grid.size()).toBe(1)
    })
  })

  describe('toArray', () => {
    it('returns empty array for empty grid', () => {
      const grid = new SpatialGrid<number>({ width: 100, height: 100, cellSize: 10 })
      expect(grid.toArray()).toEqual([])
    })

    it('returns all items with positions', () => {
      const grid = new SpatialGrid<number>({ width: 100, height: 100, cellSize: 10 })
      grid.insert(1, 5, 5)
      grid.insert(2, 15, 15)
      const arr = grid.toArray()
      expect(arr.length).toBe(2)
      expect(arr).toContainEqual({ item: 1, x: 5, y: 5 })
      expect(arr).toContainEqual({ item: 2, x: 15, y: 15 })
    })

    it('reflects updates', () => {
      const grid = new SpatialGrid<number>({ width: 100, height: 100, cellSize: 10 })
      grid.insert(1, 5, 5)
      grid.update(1, 25, 25)
      const arr = grid.toArray()
      expect(arr).toContainEqual({ item: 1, x: 25, y: 25 })
    })

    it('reflects removals', () => {
      const grid = new SpatialGrid<number>({ width: 100, height: 100, cellSize: 10 })
      grid.insert(1, 5, 5)
      grid.insert(2, 15, 15)
      grid.remove(1)
      expect(grid.toArray().length).toBe(1)
    })

    it('reflects clear', () => {
      const grid = new SpatialGrid<number>({ width: 100, height: 100, cellSize: 10 })
      grid.insert(1, 5, 5)
      grid.clear()
      expect(grid.toArray()).toEqual([])
    })
  })

  describe('cells / cellSize', () => {
    it('cells returns total cell count', () => {
      const grid = new SpatialGrid<number>({ width: 100, height: 100, cellSize: 10 })
      expect(grid.cells()).toBe(100)
    })

    it('cellSize returns configured cell size', () => {
      const grid = new SpatialGrid<number>({ width: 100, height: 100, cellSize: 10 })
      expect(grid.cellSize()).toBe(10)
    })

    it('cells rounds up for non-divisible sizes', () => {
      const grid = new SpatialGrid<number>({ width: 95, height: 95, cellSize: 10 })
      expect(grid.cells()).toBe(100)
    })

    it('cells handles small grid', () => {
      const grid = new SpatialGrid<number>({ width: 1, height: 1, cellSize: 10 })
      expect(grid.cells()).toBe(1)
    })

    it('cells handles large cellSize', () => {
      const grid = new SpatialGrid<number>({ width: 1000, height: 1000, cellSize: 500 })
      expect(grid.cells()).toBe(4)
    })
  })

  describe('forEach', () => {
    it('iterates over all items', () => {
      const grid = new SpatialGrid<number>({ width: 100, height: 100, cellSize: 10 })
      grid.insert(1, 5, 5)
      grid.insert(2, 15, 15)
      grid.insert(3, 25, 25)
      const results: Array<{ item: number; x: number; y: number }> = []
      grid.forEach((item, x, y) => {
        results.push({ item, x, y })
      })
      expect(results.length).toBe(3)
      expect(results).toContainEqual({ item: 1, x: 5, y: 5 })
      expect(results).toContainEqual({ item: 2, x: 15, y: 15 })
      expect(results).toContainEqual({ item: 3, x: 25, y: 25 })
    })

    it('does not iterate on empty grid', () => {
      const grid = new SpatialGrid<number>({ width: 100, height: 100, cellSize: 10 })
      let count = 0
      grid.forEach(() => {
        count++
      })
      expect(count).toBe(0)
    })

    it('iterates items in correct cells', () => {
      const grid = new SpatialGrid<number>({ width: 100, height: 100, cellSize: 10 })
      grid.insert(1, 5, 5)
      grid.insert(2, 15, 15)
      const items: number[] = []
      grid.forEach((item) => {
        items.push(item)
      })
      expect(items.sort()).toEqual([1, 2])
    })
  })

  describe('clone', () => {
    it('creates a shallow clone', () => {
      const grid = new SpatialGrid<number>({ width: 100, height: 100, cellSize: 10 })
      grid.insert(1, 5, 5)
      grid.insert(2, 15, 15)
      const cloned = grid.clone()
      expect(cloned.size()).toBe(2)
      expect(cloned.has(1)).toBe(true)
      expect(cloned.has(2)).toBe(true)
      expect(cloned.get(1)).toEqual({ x: 5, y: 5 })
      expect(cloned.get(2)).toEqual({ x: 15, y: 15 })
    })

    it('clone is independent of original', () => {
      const grid = new SpatialGrid<number>({ width: 100, height: 100, cellSize: 10 })
      grid.insert(1, 5, 5)
      const cloned = grid.clone()
      cloned.remove(1)
      expect(grid.has(1)).toBe(true)
      expect(cloned.has(1)).toBe(false)
    })

    it('clone preserves grid dimensions', () => {
      const grid = new SpatialGrid<number>({ width: 200, height: 300, cellSize: 25 })
      const cloned = grid.clone()
      expect(cloned.cells()).toBe(grid.cells())
      expect(cloned.cellSize()).toBe(grid.cellSize())
    })

    it('clone of empty grid is empty', () => {
      const grid = new SpatialGrid<number>({ width: 100, height: 100, cellSize: 10 })
      const cloned = grid.clone()
      expect(cloned.size()).toBe(0)
      expect(cloned.isEmpty()).toBe(true)
    })

    it('modifying original does not affect clone', () => {
      const grid = new SpatialGrid<number>({ width: 100, height: 100, cellSize: 10 })
      grid.insert(1, 5, 5)
      const cloned = grid.clone()
      grid.insert(2, 15, 15)
      expect(grid.size()).toBe(2)
      expect(cloned.size()).toBe(1)
    })

    it('clone shares object references (shallow)', () => {
      const grid = new SpatialGrid<{ id: number }>({ width: 100, height: 100, cellSize: 10 })
      const obj = { id: 1 }
      grid.insert(obj, 5, 5)
      const cloned = grid.clone()
      expect(cloned.has(obj)).toBe(true)
    })
  })

  describe('edge cases', () => {
    it('handles boundary position at grid edge', () => {
      const grid = new SpatialGrid<number>({ width: 100, height: 100, cellSize: 10 })
      grid.insert(1, 99, 99)
      expect(grid.query(90, 90, 10, 10)).toContain(1)
    })

    it('handles position at exact grid corner', () => {
      const grid = new SpatialGrid<number>({ width: 100, height: 100, cellSize: 10 })
      grid.insert(1, 0, 0)
      expect(grid.get(1)).toEqual({ x: 0, y: 0 })
    })

    it('handles many items in one cell', () => {
      const grid = new SpatialGrid<number>({ width: 100, height: 100, cellSize: 10 })
      for (let i = 0; i < 100; i++) {
        grid.insert(i, i % 10, i % 10)
      }
      expect(grid.size()).toBe(100)
      expect(grid.queryCell(0, 0).length).toBe(100)
    })

    it('handles large grid with many items', () => {
      const grid = new SpatialGrid<number>({ width: 1000, height: 1000, cellSize: 10 })
      for (let i = 0; i < 500; i++) {
        grid.insert(i, i, i)
      }
      expect(grid.size()).toBe(500)
      const result = grid.query(0, 0, 100, 100)
      expect(result.length).toBeGreaterThan(0)
    })

    it('handles insert and remove cycles', () => {
      const grid = new SpatialGrid<number>({ width: 100, height: 100, cellSize: 10 })
      for (let cycle = 0; cycle < 10; cycle++) {
        grid.insert(1, cycle * 5, cycle * 5)
        grid.remove(1)
      }
      expect(grid.size()).toBe(0)
      expect(grid.has(1)).toBe(false)
    })

    it('handles query on grid with one item', () => {
      const grid = new SpatialGrid<number>({ width: 100, height: 100, cellSize: 10 })
      grid.insert(42, 50, 50)
      expect(grid.query(45, 45, 10, 10)).toEqual([42])
      expect(grid.queryRadius(50, 50, 5)).toEqual([42])
    })

    it('handles negative coordinate queries', () => {
      const grid = new SpatialGrid<number>({ width: 100, height: 100, cellSize: 10 })
      grid.insert(1, -50, -50)
      expect(grid.query(-60, -60, 20, 20)).toContain(1)
    })

    it('handles queryRadius with negative coordinates', () => {
      const grid = new SpatialGrid<number>({ width: 100, height: 100, cellSize: 10 })
      grid.insert(1, -5, -5)
      const result = grid.queryRadius(-5, -5, 3)
      expect(result).toContain(1)
    })

    it('handles very small cellSize', () => {
      const grid = new SpatialGrid<number>({ width: 10, height: 10, cellSize: 1 })
      grid.insert(1, 5.5, 5.5)
      expect(grid.size()).toBe(1)
      expect(grid.getCell(5.5, 5.5)).toEqual([5, 5])
    })

    it('handles query that spans entire grid', () => {
      const grid = new SpatialGrid<number>({ width: 100, height: 100, cellSize: 10 })
      for (let i = 0; i < 10; i++) {
        grid.insert(i, i * 10 + 5, i * 10 + 5)
      }
      const result = grid.query(0, 0, 100, 100)
      expect(result.length).toBe(10)
    })

    it('handles query that partially overlaps cells', () => {
      const grid = new SpatialGrid<number>({ width: 100, height: 100, cellSize: 10 })
      grid.insert(1, 9, 9)
      grid.insert(2, 11, 11)
      const result = grid.query(8, 8, 5, 5)
      expect(result).toContain(1)
      expect(result).toContain(2)
    })

    it('handles single cell grid', () => {
      const grid = new SpatialGrid<number>({ width: 10, height: 10, cellSize: 100 })
      grid.insert(1, 3, 3)
      grid.insert(2, 7, 7)
      expect(grid.cells()).toBe(1)
      expect(grid.queryCell(0, 0)).toEqual([1, 2])
    })

    it('handles items with decimal coordinates', () => {
      const grid = new SpatialGrid<number>({ width: 100, height: 100, cellSize: 10 })
      grid.insert(1, 5.5, 5.5)
      grid.insert(2, 5.7, 5.3)
      expect(grid.queryCell(0, 0)).toEqual([1, 2])
    })

    it('handles update to negative coordinates', () => {
      const grid = new SpatialGrid<number>({ width: 100, height: 100, cellSize: 10 })
      grid.insert(1, 5, 5)
      grid.update(1, -10, -10)
      expect(grid.get(1)).toEqual({ x: -10, y: -10 })
      expect(grid.queryCell(0, 0)).toEqual([])
    })
  })

  describe('performance', () => {
    it('handles many insertions efficiently', () => {
      const grid = new SpatialGrid<number>({ width: 1000, height: 1000, cellSize: 10 })
      const start = performance.now()
      for (let i = 0; i < 10000; i++) {
        grid.insert(i, (i * 7) % 1000, (i * 13) % 1000)
      }
      const elapsed = performance.now() - start
      expect(grid.size()).toBe(10000)
      expect(elapsed).toBeLessThan(1000)
    })

    it('handles many queries efficiently', () => {
      const grid = new SpatialGrid<number>({ width: 1000, height: 1000, cellSize: 10 })
      for (let i = 0; i < 5000; i++) {
        grid.insert(i, (i * 7) % 1000, (i * 13) % 1000)
      }
      const start = performance.now()
      for (let i = 0; i < 1000; i++) {
        grid.query(i, i, 50, 50)
      }
      const elapsed = performance.now() - start
      expect(elapsed).toBeLessThan(1000)
    })

    it('handles many queryRadius efficiently', () => {
      const grid = new SpatialGrid<number>({ width: 1000, height: 1000, cellSize: 10 })
      for (let i = 0; i < 5000; i++) {
        grid.insert(i, (i * 7) % 1000, (i * 13) % 1000)
      }
      const start = performance.now()
      for (let i = 0; i < 1000; i++) {
        grid.queryRadius(i, i, 50)
      }
      const elapsed = performance.now() - start
      expect(elapsed).toBeLessThan(1000)
    })

    it('handles many removals efficiently', () => {
      const grid = new SpatialGrid<number>({ width: 1000, height: 1000, cellSize: 10 })
      for (let i = 0; i < 5000; i++) {
        grid.insert(i, (i * 7) % 1000, (i * 13) % 1000)
      }
      const start = performance.now()
      for (let i = 0; i < 5000; i++) {
        grid.remove(i)
      }
      const elapsed = performance.now() - start
      expect(grid.size()).toBe(0)
      expect(elapsed).toBeLessThan(1000)
    })

    it('handles clone of large grid efficiently', () => {
      const grid = new SpatialGrid<number>({ width: 1000, height: 1000, cellSize: 10 })
      for (let i = 0; i < 5000; i++) {
        grid.insert(i, (i * 7) % 1000, (i * 13) % 1000)
      }
      const start = performance.now()
      const cloned = grid.clone()
      const elapsed = performance.now() - start
      expect(cloned.size()).toBe(5000)
      expect(elapsed).toBeLessThan(1000)
    })
  })
})
