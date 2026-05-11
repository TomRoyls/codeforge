import { describe, it, expect } from 'vitest'
import { RectangularGrid } from '../../src/core/rectangular-grid/index.js'

describe('RectangularGrid', () => {
  describe('constructor', () => {
    it('creates a grid with specified dimensions', () => {
      const grid = new RectangularGrid(3, 4)
      expect(grid.rows).toBe(3)
      expect(grid.cols).toBe(4)
      expect(grid.cellCount).toBe(12)
    })

    it('creates a grid with undefined values by default', () => {
      const grid = new RectangularGrid(2, 3)
      for (let r = 0; r < 2; r++) {
        for (let c = 0; c < 3; c++) {
          expect(grid.get(r, c)).toBeUndefined()
        }
      }
    })

    it('creates a grid with initial value', () => {
      const grid = new RectangularGrid(2, 3, 0)
      for (let r = 0; r < 2; r++) {
        for (let c = 0; c < 3; c++) {
          expect(grid.get(r, c)).toBe(0)
        }
      }
    })

    it('creates a grid with string initial value', () => {
      const grid = new RectangularGrid(2, 2, 'hello')
      expect(grid.get(0, 0)).toBe('hello')
      expect(grid.get(1, 1)).toBe('hello')
    })

    it('creates a grid with null initial value', () => {
      const grid = new RectangularGrid(1, 1, null)
      expect(grid.get(0, 0)).toBeNull()
    })

    it('creates a grid with false initial value', () => {
      const grid = new RectangularGrid(1, 1, false)
      expect(grid.get(0, 0)).toBe(false)
    })

    it('creates a 1x1 grid', () => {
      const grid = new RectangularGrid(1, 1)
      expect(grid.rows).toBe(1)
      expect(grid.cols).toBe(1)
      expect(grid.cellCount).toBe(1)
    })

    it('creates a single-row grid', () => {
      const grid = new RectangularGrid(1, 5)
      expect(grid.rows).toBe(1)
      expect(grid.cols).toBe(5)
    })

    it('creates a single-column grid', () => {
      const grid = new RectangularGrid(5, 1)
      expect(grid.rows).toBe(5)
      expect(grid.cols).toBe(1)
    })

    it('creates a large grid', () => {
      const grid = new RectangularGrid(100, 100, 0)
      expect(grid.cellCount).toBe(10000)
      expect(grid.get(99, 99)).toBe(0)
    })

    it('creates a rectangular grid wider than tall', () => {
      const grid = new RectangularGrid(2, 10)
      expect(grid.rows).toBe(2)
      expect(grid.cols).toBe(10)
    })

    it('creates a rectangular grid taller than wide', () => {
      const grid = new RectangularGrid(10, 2)
      expect(grid.rows).toBe(10)
      expect(grid.cols).toBe(2)
    })
  })

  describe('get and set', () => {
    it('sets and gets a value', () => {
      const grid = new RectangularGrid(3, 3)
      grid.set(1, 2, 42)
      expect(grid.get(1, 2)).toBe(42)
    })

    it('overwrites a value', () => {
      const grid = new RectangularGrid(2, 2, 0)
      grid.set(0, 0, 99)
      expect(grid.get(0, 0)).toBe(99)
    })

    it('sets and gets at corner positions', () => {
      const grid = new RectangularGrid(3, 3)
      grid.set(0, 0, 'top-left')
      grid.set(0, 2, 'top-right')
      grid.set(2, 0, 'bottom-left')
      grid.set(2, 2, 'bottom-right')
      expect(grid.get(0, 0)).toBe('top-left')
      expect(grid.get(0, 2)).toBe('top-right')
      expect(grid.get(2, 0)).toBe('bottom-left')
      expect(grid.get(2, 2)).toBe('bottom-right')
    })

    it('handles object values', () => {
      const grid = new RectangularGrid<{ x: number }>(2, 2)
      const obj = { x: 10 }
      grid.set(0, 0, obj)
      expect(grid.get(0, 0)).toBe(obj)
    })

    it('handles undefined set explicitly', () => {
      const grid = new RectangularGrid(2, 2, 5)
      grid.set(0, 0, undefined)
      expect(grid.get(0, 0)).toBeUndefined()
    })

    it('sets all cells independently', () => {
      const grid = new RectangularGrid(2, 3)
      let val = 0
      for (let r = 0; r < 2; r++) {
        for (let c = 0; c < 3; c++) {
          grid.set(r, c, val++)
        }
      }
      expect(grid.get(0, 0)).toBe(0)
      expect(grid.get(0, 1)).toBe(1)
      expect(grid.get(0, 2)).toBe(2)
      expect(grid.get(1, 0)).toBe(3)
      expect(grid.get(1, 1)).toBe(4)
      expect(grid.get(1, 2)).toBe(5)
    })
  })

  describe('getRow', () => {
    it('returns a row of values', () => {
      const grid = new RectangularGrid(3, 3, 0)
      grid.set(1, 0, 10)
      grid.set(1, 1, 20)
      grid.set(1, 2, 30)
      expect(grid.getRow(1)).toEqual([10, 20, 30])
    })

    it('returns first row', () => {
      const grid = new RectangularGrid(2, 3)
      grid.set(0, 0, 'a')
      grid.set(0, 1, 'b')
      grid.set(0, 2, 'c')
      expect(grid.getRow(0)).toEqual(['a', 'b', 'c'])
    })

    it('returns last row', () => {
      const grid = new RectangularGrid(2, 3)
      grid.set(1, 0, 'd')
      grid.set(1, 1, 'e')
      grid.set(1, 2, 'f')
      expect(grid.getRow(1)).toEqual(['d', 'e', 'f'])
    })

    it('returns row from single-row grid', () => {
      const grid = new RectangularGrid(1, 4, 7)
      expect(grid.getRow(0)).toEqual([7, 7, 7, 7])
    })

    it('returns row from rectangular grid', () => {
      const grid = new RectangularGrid(2, 5, 0)
      grid.setRow(0, [1, 2, 3, 4, 5])
      expect(grid.getRow(0)).toEqual([1, 2, 3, 4, 5])
    })
  })

  describe('getCol', () => {
    it('returns a column of values', () => {
      const grid = new RectangularGrid(3, 3, 0)
      grid.set(0, 1, 10)
      grid.set(1, 1, 20)
      grid.set(2, 1, 30)
      expect(grid.getCol(1)).toEqual([10, 20, 30])
    })

    it('returns first column', () => {
      const grid = new RectangularGrid(3, 2)
      grid.set(0, 0, 'a')
      grid.set(1, 0, 'b')
      grid.set(2, 0, 'c')
      expect(grid.getCol(0)).toEqual(['a', 'b', 'c'])
    })

    it('returns last column', () => {
      const grid = new RectangularGrid(3, 2)
      grid.set(0, 1, 'd')
      grid.set(1, 1, 'e')
      grid.set(2, 1, 'f')
      expect(grid.getCol(1)).toEqual(['d', 'e', 'f'])
    })

    it('returns column from single-column grid', () => {
      const grid = new RectangularGrid(4, 1, 3)
      expect(grid.getCol(0)).toEqual([3, 3, 3, 3])
    })

    it('returns column from rectangular grid', () => {
      const grid = new RectangularGrid(3, 2)
      grid.setCol(1, [10, 20, 30])
      expect(grid.getCol(1)).toEqual([10, 20, 30])
    })
  })

  describe('setRow', () => {
    it('sets all values in a row', () => {
      const grid = new RectangularGrid(2, 3, 0)
      grid.setRow(1, [10, 20, 30])
      expect(grid.getRow(1)).toEqual([10, 20, 30])
    })

    it('overwrites existing values', () => {
      const grid = new RectangularGrid(2, 2, 5)
      grid.setRow(0, [1, 2])
      expect(grid.get(0, 0)).toBe(1)
      expect(grid.get(0, 1)).toBe(2)
    })

    it('does not affect other rows', () => {
      const grid = new RectangularGrid(2, 2, 5)
      grid.setRow(0, [1, 2])
      expect(grid.getRow(1)).toEqual([5, 5])
    })
  })

  describe('setCol', () => {
    it('sets all values in a column', () => {
      const grid = new RectangularGrid(3, 2, 0)
      grid.setCol(1, [10, 20, 30])
      expect(grid.getCol(1)).toEqual([10, 20, 30])
    })

    it('overwrites existing values', () => {
      const grid = new RectangularGrid(2, 2, 5)
      grid.setCol(0, [1, 2])
      expect(grid.get(0, 0)).toBe(1)
      expect(grid.get(1, 0)).toBe(2)
    })

    it('does not affect other columns', () => {
      const grid = new RectangularGrid(2, 2, 5)
      grid.setCol(0, [1, 2])
      expect(grid.getCol(1)).toEqual([5, 5])
    })
  })

  describe('fill', () => {
    it('fills all cells with a value', () => {
      const grid = new RectangularGrid(2, 3)
      grid.fill(7)
      expect(grid.get(0, 0)).toBe(7)
      expect(grid.get(0, 1)).toBe(7)
      expect(grid.get(0, 2)).toBe(7)
      expect(grid.get(1, 0)).toBe(7)
      expect(grid.get(1, 1)).toBe(7)
      expect(grid.get(1, 2)).toBe(7)
    })

    it('overwrites all existing values', () => {
      const grid = new RectangularGrid(2, 2, 5)
      grid.fill(99)
      expect(grid.get(0, 0)).toBe(99)
      expect(grid.get(1, 1)).toBe(99)
    })

    it('fills with string value', () => {
      const grid = new RectangularGrid(1, 1)
      grid.fill('test')
      expect(grid.get(0, 0)).toBe('test')
    })

    it('fills with null', () => {
      const grid = new RectangularGrid(2, 2)
      grid.fill(null)
      expect(grid.get(0, 0)).toBeNull()
      expect(grid.get(1, 1)).toBeNull()
    })
  })

  describe('subgrid', () => {
    it('returns a subgrid region', () => {
      const grid = new RectangularGrid(4, 4, 0)
      let v = 0
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          grid.set(r, c, v++)
        }
      }
      const sub = grid.subgrid(1, 1, 2, 3)
      expect(sub).toEqual([
        [5, 6, 7],
        [9, 10, 11],
      ])
    })

    it('returns single cell subgrid', () => {
      const grid = new RectangularGrid(3, 3, 0)
      grid.set(1, 1, 42)
      expect(grid.subgrid(1, 1, 1, 1)).toEqual([[42]])
    })

    it('returns full grid as subgrid', () => {
      const grid = new RectangularGrid(2, 2)
      grid.set(0, 0, 1)
      grid.set(0, 1, 2)
      grid.set(1, 0, 3)
      grid.set(1, 1, 4)
      expect(grid.subgrid(0, 0, 1, 1)).toEqual([
        [1, 2],
        [3, 4],
      ])
    })

    it('returns single row subgrid', () => {
      const grid = new RectangularGrid(3, 3)
      grid.setRow(1, [10, 20, 30])
      expect(grid.subgrid(1, 0, 1, 2)).toEqual([[10, 20, 30]])
    })

    it('returns single column subgrid', () => {
      const grid = new RectangularGrid(3, 3)
      grid.setCol(1, [10, 20, 30])
      expect(grid.subgrid(0, 1, 2, 1)).toEqual([[10], [20], [30]])
    })
  })

  describe('flatten', () => {
    it('returns row-major flattened array', () => {
      const grid = new RectangularGrid(2, 3)
      grid.set(0, 0, 1)
      grid.set(0, 1, 2)
      grid.set(0, 2, 3)
      grid.set(1, 0, 4)
      grid.set(1, 1, 5)
      grid.set(1, 2, 6)
      expect(grid.flatten()).toEqual([1, 2, 3, 4, 5, 6])
    })

    it('returns correct order for rectangular grid', () => {
      const grid = new RectangularGrid(3, 2)
      let v = 0
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 2; c++) {
          grid.set(r, c, v++)
        }
      }
      expect(grid.flatten()).toEqual([0, 1, 2, 3, 4, 5])
    })

    it('returns single element for 1x1 grid', () => {
      const grid = new RectangularGrid(1, 1, 42)
      expect(grid.flatten()).toEqual([42])
    })

    it('returns single row correctly', () => {
      const grid = new RectangularGrid(1, 4)
      grid.setRow(0, [1, 2, 3, 4])
      expect(grid.flatten()).toEqual([1, 2, 3, 4])
    })
  })

  describe('flattenColMajor', () => {
    it('returns column-major flattened array', () => {
      const grid = new RectangularGrid(2, 3)
      grid.set(0, 0, 1)
      grid.set(0, 1, 2)
      grid.set(0, 2, 3)
      grid.set(1, 0, 4)
      grid.set(1, 1, 5)
      grid.set(1, 2, 6)
      expect(grid.flattenColMajor()).toEqual([1, 4, 2, 5, 3, 6])
    })

    it('returns correct order for rectangular grid', () => {
      const grid = new RectangularGrid(3, 2)
      let v = 0
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 2; c++) {
          grid.set(r, c, v++)
        }
      }
      expect(grid.flattenColMajor()).toEqual([0, 2, 4, 1, 3, 5])
    })

    it('returns single element for 1x1 grid', () => {
      const grid = new RectangularGrid(1, 1, 42)
      expect(grid.flattenColMajor()).toEqual([42])
    })

    it('returns single column correctly', () => {
      const grid = new RectangularGrid(4, 1)
      grid.setCol(0, [1, 2, 3, 4])
      expect(grid.flattenColMajor()).toEqual([1, 2, 3, 4])
    })
  })

  describe('rows, cols, cellCount', () => {
    it('returns correct dimensions for square grid', () => {
      const grid = new RectangularGrid(4, 4)
      expect(grid.rows).toBe(4)
      expect(grid.cols).toBe(4)
      expect(grid.cellCount).toBe(16)
    })

    it('returns correct dimensions for rectangular grid', () => {
      const grid = new RectangularGrid(3, 7)
      expect(grid.rows).toBe(3)
      expect(grid.cols).toBe(7)
      expect(grid.cellCount).toBe(21)
    })

    it('returns correct dimensions for 1x1 grid', () => {
      const grid = new RectangularGrid(1, 1)
      expect(grid.rows).toBe(1)
      expect(grid.cols).toBe(1)
      expect(grid.cellCount).toBe(1)
    })

    it('returns correct dimensions for single row', () => {
      const grid = new RectangularGrid(1, 10)
      expect(grid.rows).toBe(1)
      expect(grid.cols).toBe(10)
      expect(grid.cellCount).toBe(10)
    })

    it('returns correct dimensions for single column', () => {
      const grid = new RectangularGrid(10, 1)
      expect(grid.rows).toBe(10)
      expect(grid.cols).toBe(1)
      expect(grid.cellCount).toBe(10)
    })
  })

  describe('has', () => {
    it('returns true for valid position', () => {
      const grid = new RectangularGrid(3, 4)
      expect(grid.has(0, 0)).toBe(true)
      expect(grid.has(2, 3)).toBe(true)
      expect(grid.has(1, 1)).toBe(true)
    })

    it('returns false for out-of-bounds row', () => {
      const grid = new RectangularGrid(3, 4)
      expect(grid.has(-1, 0)).toBe(false)
      expect(grid.has(3, 0)).toBe(false)
      expect(grid.has(100, 0)).toBe(false)
    })

    it('returns false for out-of-bounds column', () => {
      const grid = new RectangularGrid(3, 4)
      expect(grid.has(0, -1)).toBe(false)
      expect(grid.has(0, 4)).toBe(false)
      expect(grid.has(0, 100)).toBe(false)
    })

    it('returns false for both out of bounds', () => {
      const grid = new RectangularGrid(3, 4)
      expect(grid.has(-1, -1)).toBe(false)
      expect(grid.has(3, 4)).toBe(false)
    })

    it('returns correct for 1x1 grid', () => {
      const grid = new RectangularGrid(1, 1)
      expect(grid.has(0, 0)).toBe(true)
      expect(grid.has(0, 1)).toBe(false)
      expect(grid.has(1, 0)).toBe(false)
    })
  })

  describe('indexOf', () => {
    it('finds first occurrence of value', () => {
      const grid = new RectangularGrid(3, 3, 0)
      grid.set(1, 2, 42)
      expect(grid.indexOf(42)).toEqual([1, 2])
    })

    it('finds first occurrence when multiple exist', () => {
      const grid = new RectangularGrid(3, 3, 0)
      grid.set(0, 1, 5)
      grid.set(2, 0, 5)
      expect(grid.indexOf(5)).toEqual([0, 1])
    })

    it('returns undefined when not found', () => {
      const grid = new RectangularGrid(2, 2, 0)
      expect(grid.indexOf(99)).toBeUndefined()
    })

    it('finds value at origin', () => {
      const grid = new RectangularGrid(3, 3, 0)
      grid.set(0, 0, 99)
      expect(grid.indexOf(99)).toEqual([0, 0])
    })

    it('finds string value', () => {
      const grid = new RectangularGrid<string>(2, 2)
      grid.set(1, 0, 'hello')
      expect(grid.indexOf('hello')).toEqual([1, 0])
    })

    it('finds undefined when present', () => {
      const grid = new RectangularGrid(2, 2, 0)
      grid.set(0, 0, undefined)
      expect(grid.indexOf(undefined)).toEqual([0, 0])
    })
  })

  describe('indicesOf', () => {
    it('returns all occurrences', () => {
      const grid = new RectangularGrid(3, 3, 0)
      grid.set(0, 0, 5)
      grid.set(1, 1, 5)
      grid.set(2, 2, 5)
      expect(grid.indicesOf(5)).toEqual([
        [0, 0],
        [1, 1],
        [2, 2],
      ])
    })

    it('returns empty array when no occurrences', () => {
      const grid = new RectangularGrid(2, 2, 0)
      expect(grid.indicesOf(99)).toEqual([])
    })

    it('returns single occurrence', () => {
      const grid = new RectangularGrid(2, 2, 0)
      grid.set(0, 1, 7)
      expect(grid.indicesOf(7)).toEqual([[0, 1]])
    })

    it('finds all when all cells match', () => {
      const grid = new RectangularGrid(2, 2, 5)
      expect(grid.indicesOf(5)).toEqual([
        [0, 0],
        [0, 1],
        [1, 0],
        [1, 1],
      ])
    })
  })

  describe('count', () => {
    it('counts occurrences of a value', () => {
      const grid = new RectangularGrid(3, 3, 0)
      grid.set(0, 0, 1)
      grid.set(1, 1, 1)
      grid.set(2, 2, 1)
      expect(grid.count(1)).toBe(3)
    })

    it('returns 0 when value not present', () => {
      const grid = new RectangularGrid(2, 2, 0)
      expect(grid.count(99)).toBe(0)
    })

    it('counts all when all match', () => {
      const grid = new RectangularGrid(3, 4, 7)
      expect(grid.count(7)).toBe(12)
    })

    it('counts undefined', () => {
      const grid = new RectangularGrid(2, 3)
      expect(grid.count(undefined)).toBe(6)
    })

    it('counts after fill', () => {
      const grid = new RectangularGrid(2, 2)
      grid.fill('x')
      expect(grid.count('x')).toBe(4)
    })
  })

  describe('forEach', () => {
    it('iterates over all cells', () => {
      const grid = new RectangularGrid(2, 3, 0)
      const visited: Array<[number, number]> = []
      grid.forEach((_v, r, c) => {
        visited.push([r, c])
      })
      expect(visited).toEqual([
        [0, 0],
        [0, 1],
        [0, 2],
        [1, 0],
        [1, 1],
        [1, 2],
      ])
    })

    it('provides correct values', () => {
      const grid = new RectangularGrid(2, 2)
      grid.set(0, 0, 1)
      grid.set(0, 1, 2)
      grid.set(1, 0, 3)
      grid.set(1, 1, 4)
      const values: number[] = []
      grid.forEach((v) => {
        values.push(v)
      })
      expect(values).toEqual([1, 2, 3, 4])
    })

    it('iterates over 1x1 grid', () => {
      const grid = new RectangularGrid(1, 1, 42)
      const results: Array<{ val: number; r: number; c: number }> = []
      grid.forEach((val, r, c) => {
        results.push({ val, r, c })
      })
      expect(results).toEqual([{ val: 42, r: 0, c: 0 }])
    })
  })

  describe('map', () => {
    it('maps values to new grid', () => {
      const grid = new RectangularGrid(2, 2, 3)
      const mapped = grid.map((v) => v * 2)
      expect(mapped.get(0, 0)).toBe(6)
      expect(mapped.get(0, 1)).toBe(6)
      expect(mapped.get(1, 0)).toBe(6)
      expect(mapped.get(1, 1)).toBe(6)
    })

    it('maps to different type', () => {
      const grid = new RectangularGrid(2, 2, 5)
      const mapped = grid.map((v) => `val:${v}`)
      expect(mapped.get(0, 0)).toBe('val:5')
      expect(mapped.get(1, 1)).toBe('val:5')
    })

    it('preserves dimensions', () => {
      const grid = new RectangularGrid(3, 5, 0)
      const mapped = grid.map((v) => v + 1)
      expect(mapped.rows).toBe(3)
      expect(mapped.cols).toBe(5)
    })

    it('provides correct indices', () => {
      const grid = new RectangularGrid(2, 2, 0)
      const mapped = grid.map((_v, r, c) => r * 10 + c)
      expect(mapped.get(0, 0)).toBe(0)
      expect(mapped.get(0, 1)).toBe(1)
      expect(mapped.get(1, 0)).toBe(10)
      expect(mapped.get(1, 1)).toBe(11)
    })

    it('does not modify original', () => {
      const grid = new RectangularGrid(2, 2, 5)
      grid.map((v) => v * 2)
      expect(grid.get(0, 0)).toBe(5)
      expect(grid.get(1, 1)).toBe(5)
    })
  })

  describe('clone', () => {
    it('creates an independent copy', () => {
      const grid = new RectangularGrid(2, 2, 5)
      const cloned = grid.clone()
      grid.set(0, 0, 99)
      expect(cloned.get(0, 0)).toBe(5)
    })

    it('preserves all values', () => {
      const grid = new RectangularGrid(2, 3)
      grid.set(0, 0, 1)
      grid.set(0, 1, 2)
      grid.set(0, 2, 3)
      grid.set(1, 0, 4)
      grid.set(1, 1, 5)
      grid.set(1, 2, 6)
      const cloned = grid.clone()
      expect(cloned.toArray()).toEqual(grid.toArray())
    })

    it('preserves dimensions', () => {
      const grid = new RectangularGrid(4, 7, 0)
      const cloned = grid.clone()
      expect(cloned.rows).toBe(4)
      expect(cloned.cols).toBe(7)
    })

    it('creates separate copy for 1x1', () => {
      const grid = new RectangularGrid(1, 1, 42)
      const cloned = grid.clone()
      grid.set(0, 0, 99)
      expect(cloned.get(0, 0)).toBe(42)
    })
  })

  describe('toArray', () => {
    it('returns 2D array representation', () => {
      const grid = new RectangularGrid(2, 3)
      grid.set(0, 0, 1)
      grid.set(0, 1, 2)
      grid.set(0, 2, 3)
      grid.set(1, 0, 4)
      grid.set(1, 1, 5)
      grid.set(1, 2, 6)
      expect(grid.toArray()).toEqual([
        [1, 2, 3],
        [4, 5, 6],
      ])
    })

    it('returns correct array for 1x1 grid', () => {
      const grid = new RectangularGrid(1, 1, 42)
      expect(grid.toArray()).toEqual([[42]])
    })

    it('returns correct array for single row', () => {
      const grid = new RectangularGrid(1, 3)
      grid.setRow(0, [10, 20, 30])
      expect(grid.toArray()).toEqual([[10, 20, 30]])
    })

    it('returns correct array for single column', () => {
      const grid = new RectangularGrid(3, 1)
      grid.setCol(0, [10, 20, 30])
      expect(grid.toArray()).toEqual([[10], [20], [30]])
    })

    it('returns correct array for rectangular grid', () => {
      const grid = new RectangularGrid(2, 4, 0)
      let v = 0
      for (let r = 0; r < 2; r++) {
        for (let c = 0; c < 4; c++) {
          grid.set(r, c, v++)
        }
      }
      expect(grid.toArray()).toEqual([
        [0, 1, 2, 3],
        [4, 5, 6, 7],
      ])
    })
  })

  describe('transpose', () => {
    it('transposes a square grid', () => {
      const grid = new RectangularGrid(2, 2)
      grid.set(0, 0, 1)
      grid.set(0, 1, 2)
      grid.set(1, 0, 3)
      grid.set(1, 1, 4)
      const t = grid.transpose()
      expect(t.rows).toBe(2)
      expect(t.cols).toBe(2)
      expect(t.toArray()).toEqual([
        [1, 3],
        [2, 4],
      ])
    })

    it('transposes a rectangular grid', () => {
      const grid = new RectangularGrid(2, 3)
      grid.set(0, 0, 1)
      grid.set(0, 1, 2)
      grid.set(0, 2, 3)
      grid.set(1, 0, 4)
      grid.set(1, 1, 5)
      grid.set(1, 2, 6)
      const t = grid.transpose()
      expect(t.rows).toBe(3)
      expect(t.cols).toBe(2)
      expect(t.toArray()).toEqual([
        [1, 4],
        [2, 5],
        [3, 6],
      ])
    })

    it('transposes 1x1 grid', () => {
      const grid = new RectangularGrid(1, 1, 42)
      const t = grid.transpose()
      expect(t.rows).toBe(1)
      expect(t.cols).toBe(1)
      expect(t.get(0, 0)).toBe(42)
    })

    it('transposes single-row to single-column', () => {
      const grid = new RectangularGrid(1, 4)
      grid.setRow(0, [1, 2, 3, 4])
      const t = grid.transpose()
      expect(t.rows).toBe(4)
      expect(t.cols).toBe(1)
      expect(t.getCol(0)).toEqual([1, 2, 3, 4])
    })

    it('transposes single-column to single-row', () => {
      const grid = new RectangularGrid(4, 1)
      grid.setCol(0, [1, 2, 3, 4])
      const t = grid.transpose()
      expect(t.rows).toBe(1)
      expect(t.cols).toBe(4)
      expect(t.getRow(0)).toEqual([1, 2, 3, 4])
    })

    it('does not modify original', () => {
      const grid = new RectangularGrid(2, 3)
      grid.set(0, 0, 1)
      grid.set(0, 1, 2)
      grid.set(0, 2, 3)
      grid.set(1, 0, 4)
      grid.set(1, 1, 5)
      grid.set(1, 2, 6)
      grid.transpose()
      expect(grid.rows).toBe(2)
      expect(grid.cols).toBe(3)
    })

    it('double transpose equals original', () => {
      const grid = new RectangularGrid(2, 3)
      let v = 0
      for (let r = 0; r < 2; r++) {
        for (let c = 0; c < 3; c++) {
          grid.set(r, c, v++)
        }
      }
      const tt = grid.transpose().transpose()
      expect(tt.rows).toBe(2)
      expect(tt.cols).toBe(3)
      expect(tt.toArray()).toEqual(grid.toArray())
    })
  })

  describe('rotate90', () => {
    it('rotates a 2x2 grid 90 degrees clockwise', () => {
      const grid = new RectangularGrid(2, 2)
      grid.set(0, 0, 1)
      grid.set(0, 1, 2)
      grid.set(1, 0, 3)
      grid.set(1, 1, 4)
      const r = grid.rotate90()
      expect(r.toArray()).toEqual([
        [3, 1],
        [4, 2],
      ])
    })

    it('rotates a 3x3 grid 90 degrees clockwise', () => {
      const grid = new RectangularGrid(3, 3)
      grid.set(0, 0, 1)
      grid.set(0, 1, 2)
      grid.set(0, 2, 3)
      grid.set(1, 0, 4)
      grid.set(1, 1, 5)
      grid.set(1, 2, 6)
      grid.set(2, 0, 7)
      grid.set(2, 1, 8)
      grid.set(2, 2, 9)
      const r = grid.rotate90()
      expect(r.toArray()).toEqual([
        [7, 4, 1],
        [8, 5, 2],
        [9, 6, 3],
      ])
    })

    it('rotates a rectangular grid', () => {
      const grid = new RectangularGrid(2, 3)
      grid.set(0, 0, 1)
      grid.set(0, 1, 2)
      grid.set(0, 2, 3)
      grid.set(1, 0, 4)
      grid.set(1, 1, 5)
      grid.set(1, 2, 6)
      const r = grid.rotate90()
      expect(r.rows).toBe(3)
      expect(r.cols).toBe(2)
      expect(r.toArray()).toEqual([
        [4, 1],
        [5, 2],
        [6, 3],
      ])
    })

    it('rotates 1x1 grid', () => {
      const grid = new RectangularGrid(1, 1, 42)
      const r = grid.rotate90()
      expect(r.rows).toBe(1)
      expect(r.cols).toBe(1)
      expect(r.get(0, 0)).toBe(42)
    })

    it('does not modify original', () => {
      const grid = new RectangularGrid(2, 2)
      grid.set(0, 0, 1)
      grid.set(0, 1, 2)
      grid.set(1, 0, 3)
      grid.set(1, 1, 4)
      grid.rotate90()
      expect(grid.toArray()).toEqual([
        [1, 2],
        [3, 4],
      ])
    })

    it('four rotations equal original', () => {
      const grid = new RectangularGrid(2, 3)
      let v = 0
      for (let r = 0; r < 2; r++) {
        for (let c = 0; c < 3; c++) {
          grid.set(r, c, v++)
        }
      }
      let current = grid
      for (let i = 0; i < 4; i++) {
        current = current.rotate90()
      }
      expect(current.rows).toBe(2)
      expect(current.cols).toBe(3)
      expect(current.toArray()).toEqual(grid.toArray())
    })
  })

  describe('mirrorHorizontal', () => {
    it('mirrors a grid horizontally', () => {
      const grid = new RectangularGrid(2, 3)
      grid.set(0, 0, 1)
      grid.set(0, 1, 2)
      grid.set(0, 2, 3)
      grid.set(1, 0, 4)
      grid.set(1, 1, 5)
      grid.set(1, 2, 6)
      const m = grid.mirrorHorizontal()
      expect(m.toArray()).toEqual([
        [3, 2, 1],
        [6, 5, 4],
      ])
    })

    it('mirrors a square grid', () => {
      const grid = new RectangularGrid(3, 3)
      grid.set(0, 0, 1)
      grid.set(0, 1, 2)
      grid.set(0, 2, 3)
      grid.set(1, 0, 4)
      grid.set(1, 1, 5)
      grid.set(1, 2, 6)
      grid.set(2, 0, 7)
      grid.set(2, 1, 8)
      grid.set(2, 2, 9)
      const m = grid.mirrorHorizontal()
      expect(m.toArray()).toEqual([
        [3, 2, 1],
        [6, 5, 4],
        [9, 8, 7],
      ])
    })

    it('mirrors 1x1 grid to itself', () => {
      const grid = new RectangularGrid(1, 1, 42)
      const m = grid.mirrorHorizontal()
      expect(m.get(0, 0)).toBe(42)
    })

    it('mirrors single-row grid', () => {
      const grid = new RectangularGrid(1, 4)
      grid.setRow(0, [1, 2, 3, 4])
      const m = grid.mirrorHorizontal()
      expect(m.getRow(0)).toEqual([4, 3, 2, 1])
    })

    it('mirrors single-column grid (no change)', () => {
      const grid = new RectangularGrid(4, 1)
      grid.setCol(0, [1, 2, 3, 4])
      const m = grid.mirrorHorizontal()
      expect(m.getCol(0)).toEqual([1, 2, 3, 4])
    })

    it('does not modify original', () => {
      const grid = new RectangularGrid(2, 2)
      grid.set(0, 0, 1)
      grid.set(0, 1, 2)
      grid.set(1, 0, 3)
      grid.set(1, 1, 4)
      grid.mirrorHorizontal()
      expect(grid.toArray()).toEqual([
        [1, 2],
        [3, 4],
      ])
    })

    it('double mirror equals original', () => {
      const grid = new RectangularGrid(3, 4)
      let v = 0
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 4; c++) {
          grid.set(r, c, v++)
        }
      }
      const mm = grid.mirrorHorizontal().mirrorHorizontal()
      expect(mm.toArray()).toEqual(grid.toArray())
    })
  })

  describe('mirrorVertical', () => {
    it('mirrors a grid vertically', () => {
      const grid = new RectangularGrid(2, 3)
      grid.set(0, 0, 1)
      grid.set(0, 1, 2)
      grid.set(0, 2, 3)
      grid.set(1, 0, 4)
      grid.set(1, 1, 5)
      grid.set(1, 2, 6)
      const m = grid.mirrorVertical()
      expect(m.toArray()).toEqual([
        [4, 5, 6],
        [1, 2, 3],
      ])
    })

    it('mirrors a square grid', () => {
      const grid = new RectangularGrid(3, 3)
      grid.set(0, 0, 1)
      grid.set(0, 1, 2)
      grid.set(0, 2, 3)
      grid.set(1, 0, 4)
      grid.set(1, 1, 5)
      grid.set(1, 2, 6)
      grid.set(2, 0, 7)
      grid.set(2, 1, 8)
      grid.set(2, 2, 9)
      const m = grid.mirrorVertical()
      expect(m.toArray()).toEqual([
        [7, 8, 9],
        [4, 5, 6],
        [1, 2, 3],
      ])
    })

    it('mirrors 1x1 grid to itself', () => {
      const grid = new RectangularGrid(1, 1, 42)
      const m = grid.mirrorVertical()
      expect(m.get(0, 0)).toBe(42)
    })

    it('mirrors single-column grid', () => {
      const grid = new RectangularGrid(4, 1)
      grid.setCol(0, [1, 2, 3, 4])
      const m = grid.mirrorVertical()
      expect(m.getCol(0)).toEqual([4, 3, 2, 1])
    })

    it('mirrors single-row grid (no change)', () => {
      const grid = new RectangularGrid(1, 4)
      grid.setRow(0, [1, 2, 3, 4])
      const m = grid.mirrorVertical()
      expect(m.getRow(0)).toEqual([1, 2, 3, 4])
    })

    it('does not modify original', () => {
      const grid = new RectangularGrid(2, 2)
      grid.set(0, 0, 1)
      grid.set(0, 1, 2)
      grid.set(1, 0, 3)
      grid.set(1, 1, 4)
      grid.mirrorVertical()
      expect(grid.toArray()).toEqual([
        [1, 2],
        [3, 4],
      ])
    })

    it('double mirror equals original', () => {
      const grid = new RectangularGrid(3, 4)
      let v = 0
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 4; c++) {
          grid.set(r, c, v++)
        }
      }
      const mm = grid.mirrorVertical().mirrorVertical()
      expect(mm.toArray()).toEqual(grid.toArray())
    })
  })

  describe('edge cases', () => {
    it('1x1 grid operations work correctly', () => {
      const grid = new RectangularGrid(1, 1, 'x')
      expect(grid.get(0, 0)).toBe('x')
      grid.set(0, 0, 'y')
      expect(grid.get(0, 0)).toBe('y')
      expect(grid.getRow(0)).toEqual(['y'])
      expect(grid.getCol(0)).toEqual(['y'])
      expect(grid.flatten()).toEqual(['y'])
      expect(grid.flattenColMajor()).toEqual(['y'])
      expect(grid.toArray()).toEqual([['y']])
      expect(grid.subgrid(0, 0, 0, 0)).toEqual([['y']])
    })

    it('single row grid operations', () => {
      const grid = new RectangularGrid(1, 5)
      grid.setRow(0, [10, 20, 30, 40, 50])
      expect(grid.getRow(0)).toEqual([10, 20, 30, 40, 50])
      expect(grid.flatten()).toEqual([10, 20, 30, 40, 50])
      expect(grid.transpose().rows).toBe(5)
      expect(grid.transpose().cols).toBe(1)
    })

    it('single column grid operations', () => {
      const grid = new RectangularGrid(5, 1)
      grid.setCol(0, [10, 20, 30, 40, 50])
      expect(grid.getCol(0)).toEqual([10, 20, 30, 40, 50])
      expect(grid.flattenColMajor()).toEqual([10, 20, 30, 40, 50])
      expect(grid.transpose().rows).toBe(1)
      expect(grid.transpose().cols).toBe(5)
    })

    it('large rectangular grid', () => {
      const grid = new RectangularGrid(50, 30, 0)
      expect(grid.cellCount).toBe(1500)
      grid.set(49, 29, 999)
      expect(grid.get(49, 29)).toBe(999)
    })

    it('grid with undefined values', () => {
      const grid = new RectangularGrid<number>(2, 2)
      expect(grid.count(undefined)).toBe(4)
      expect(grid.indexOf(undefined)).toEqual([0, 0])
      expect(grid.indicesOf(undefined).length).toBe(4)
    })

    it('grid with null values', () => {
      const grid = new RectangularGrid<null>(2, 2, null)
      expect(grid.count(null)).toBe(4)
    })

    it('grid with boolean values', () => {
      const grid = new RectangularGrid(2, 2, false)
      grid.set(0, 1, true)
      expect(grid.count(false)).toBe(3)
      expect(grid.count(true)).toBe(1)
    })

    it('transform combinations on rectangular grid', () => {
      const grid = new RectangularGrid(2, 3)
      grid.set(0, 0, 1)
      grid.set(0, 1, 2)
      grid.set(0, 2, 3)
      grid.set(1, 0, 4)
      grid.set(1, 1, 5)
      grid.set(1, 2, 6)
      const rotated = grid.rotate90()
      const mirrored = rotated.mirrorHorizontal()
      expect(mirrored.rows).toBe(3)
      expect(mirrored.cols).toBe(2)
    })

    it('forEach on empty values', () => {
      const grid = new RectangularGrid(2, 2)
      const values: (string | undefined)[] = []
      grid.forEach((v) => {
        values.push(v)
      })
      expect(values).toEqual([undefined, undefined, undefined, undefined])
    })

    it('map with complex transform', () => {
      const grid = new RectangularGrid(3, 3, 0)
      const mapped = grid.map((_v, r, c) => `${r},${c}`)
      expect(mapped.get(0, 0)).toBe('0,0')
      expect(mapped.get(2, 2)).toBe('2,2')
    })

    it('setRow followed by getRow matches', () => {
      const grid = new RectangularGrid(3, 4, 0)
      grid.setRow(2, [10, 20, 30, 40])
      expect(grid.getRow(2)).toEqual([10, 20, 30, 40])
      expect(grid.getRow(0)).toEqual([0, 0, 0, 0])
    })

    it('setCol followed by getCol matches', () => {
      const grid = new RectangularGrid(4, 3, 0)
      grid.setCol(2, [10, 20, 30, 40])
      expect(grid.getCol(2)).toEqual([10, 20, 30, 40])
      expect(grid.getCol(0)).toEqual([0, 0, 0, 0])
    })

    it('clone of modified grid', () => {
      const grid = new RectangularGrid(2, 2, 0)
      grid.set(0, 0, 1)
      grid.set(1, 1, 2)
      const cloned = grid.clone()
      grid.set(0, 0, 99)
      expect(cloned.get(0, 0)).toBe(1)
      expect(cloned.get(1, 1)).toBe(2)
    })

    it('subgrid of rectangular grid', () => {
      const grid = new RectangularGrid(4, 6, 0)
      let v = 0
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 6; c++) {
          grid.set(r, c, v++)
        }
      }
      const sub = grid.subgrid(1, 2, 3, 5)
      expect(sub).toEqual([
        [8, 9, 10, 11],
        [14, 15, 16, 17],
        [20, 21, 22, 23],
      ])
    })

    it('has returns false for negative indices', () => {
      const grid = new RectangularGrid(3, 3)
      expect(grid.has(-1, -1)).toBe(false)
    })

    it('constructor with zero initial value', () => {
      const grid = new RectangularGrid(2, 2, 0)
      expect(grid.get(0, 0)).toBe(0)
      expect(grid.get(1, 1)).toBe(0)
    })

    it('constructor with empty string initial value', () => {
      const grid = new RectangularGrid(2, 2, '')
      expect(grid.get(0, 0)).toBe('')
    })

    it('fill then count after partial set', () => {
      const grid = new RectangularGrid(3, 3, 0)
      grid.set(1, 1, 1)
      expect(grid.count(0)).toBe(8)
      expect(grid.count(1)).toBe(1)
    })

    it('getRow returns new array each time', () => {
      const grid = new RectangularGrid(1, 3, 0)
      const row1 = grid.getRow(0)
      const row2 = grid.getRow(0)
      expect(row1).not.toBe(row2)
      expect(row1).toEqual(row2)
    })

    it('getCol returns new array each time', () => {
      const grid = new RectangularGrid(3, 1, 0)
      const col1 = grid.getCol(0)
      const col2 = grid.getCol(0)
      expect(col1).not.toBe(col2)
      expect(col1).toEqual(col2)
    })

    it('map returns new grid instance', () => {
      const grid = new RectangularGrid(2, 2, 1)
      const mapped = grid.map((v) => v)
      expect(mapped).not.toBe(grid)
    })

    it('clone returns new grid instance', () => {
      const grid = new RectangularGrid(2, 2, 1)
      const cloned = grid.clone()
      expect(cloned).not.toBe(grid)
    })

    it('rotate90 single row grid', () => {
      const grid = new RectangularGrid(1, 4)
      grid.setRow(0, [1, 2, 3, 4])
      const r = grid.rotate90()
      expect(r.rows).toBe(4)
      expect(r.cols).toBe(1)
      expect(r.toArray()).toEqual([[1], [2], [3], [4]])
    })

    it('rotate90 single column grid', () => {
      const grid = new RectangularGrid(4, 1)
      grid.setCol(0, [1, 2, 3, 4])
      const r = grid.rotate90()
      expect(r.rows).toBe(1)
      expect(r.cols).toBe(4)
      expect(r.getRow(0)).toEqual([4, 3, 2, 1])
    })

    it('mirrorHorizontal followed by mirrorVertical equals rotate180', () => {
      const grid = new RectangularGrid(2, 3)
      grid.set(0, 0, 1)
      grid.set(0, 1, 2)
      grid.set(0, 2, 3)
      grid.set(1, 0, 4)
      grid.set(1, 1, 5)
      grid.set(1, 2, 6)
      const rotate180a = grid.mirrorHorizontal().mirrorVertical()
      const rotate180b = grid.rotate90().rotate90()
      expect(rotate180a.toArray()).toEqual(rotate180b.toArray())
    })
  })
})
