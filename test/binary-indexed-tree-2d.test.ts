import { BinaryIndexedTree2D } from '../src/core/binary-indexed-tree-2d/binary-indexed-tree-2d.js'

// ─── Constructor ────────────────────────────────────────────────────────

describe('BinaryIndexedTree2D', () => {
  describe('constructor', () => {
    it('creates a grid with specified rows and cols', () => {
      const bit = new BinaryIndexedTree2D({ rows: 3, cols: 4 })
      const dims = bit.dimensions()
      expect(dims.rows).toBe(3)
      expect(dims.cols).toBe(4)
    })

    it('initializes all cells to 0 by default', () => {
      const bit = new BinaryIndexedTree2D({ rows: 3, cols: 3 })
      const arr = bit.toArray()
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          expect(arr[i][j]).toBe(0)
        }
      }
    })

    it('initializes all cells to defaultValue when provided', () => {
      const bit = new BinaryIndexedTree2D({ rows: 2, cols: 3, defaultValue: 5 })
      const arr = bit.toArray()
      for (let i = 0; i < 2; i++) {
        for (let j = 0; j < 3; j++) {
          expect(arr[i][j]).toBe(5)
        }
      }
    })

    it('initializes cells to negative defaultValue', () => {
      const bit = new BinaryIndexedTree2D({ rows: 2, cols: 2, defaultValue: -3 })
      const arr = bit.toArray()
      for (let i = 0; i < 2; i++) {
        for (let j = 0; j < 2; j++) {
          expect(arr[i][j]).toBe(-3)
        }
      }
    })

    it('initializes cells to 0 when defaultValue is explicitly 0', () => {
      const bit = new BinaryIndexedTree2D({ rows: 2, cols: 2, defaultValue: 0 })
      const arr = bit.toArray()
      for (let i = 0; i < 2; i++) {
        for (let j = 0; j < 2; j++) {
          expect(arr[i][j]).toBe(0)
        }
      }
    })

    it('handles defaultValue with floating point numbers', () => {
      const bit = new BinaryIndexedTree2D({ rows: 2, cols: 2, defaultValue: 1.5 })
      expect(bit.get(0, 0)).toBe(1.5)
      expect(bit.get(1, 1)).toBe(1.5)
    })

    it('creates a 1x1 grid', () => {
      const bit = new BinaryIndexedTree2D({ rows: 1, cols: 1 })
      expect(bit.dimensions()).toEqual({ rows: 1, cols: 1 })
    })

    it('creates a single-row grid', () => {
      const bit = new BinaryIndexedTree2D({ rows: 1, cols: 5 })
      expect(bit.dimensions()).toEqual({ rows: 1, cols: 5 })
    })

    it('creates a single-column grid', () => {
      const bit = new BinaryIndexedTree2D({ rows: 5, cols: 1 })
      expect(bit.dimensions()).toEqual({ rows: 5, cols: 1 })
    })

    it('creates a large grid', () => {
      const bit = new BinaryIndexedTree2D({ rows: 100, cols: 100 })
      expect(bit.dimensions()).toEqual({ rows: 100, cols: 100 })
    })
  })

  // ─── update ──────────────────────────────────────────────────────────

  describe('update', () => {
    it('adds a delta to a cell', () => {
      const bit = new BinaryIndexedTree2D({ rows: 3, cols: 3 })
      bit.update(0, 0, 5)
      expect(bit.get(0, 0)).toBe(5)
    })

    it('accumulates multiple updates to the same cell', () => {
      const bit = new BinaryIndexedTree2D({ rows: 3, cols: 3 })
      bit.update(1, 1, 10)
      bit.update(1, 1, 7)
      bit.update(1, 1, 3)
      expect(bit.get(1, 1)).toBe(20)
    })

    it('supports negative deltas', () => {
      const bit = new BinaryIndexedTree2D({ rows: 3, cols: 3 })
      bit.update(0, 0, 10)
      bit.update(0, 0, -3)
      expect(bit.get(0, 0)).toBe(7)
    })

    it('allows a cell to go negative via updates', () => {
      const bit = new BinaryIndexedTree2D({ rows: 3, cols: 3 })
      bit.update(2, 2, -5)
      expect(bit.get(2, 2)).toBe(-5)
    })

    it('supports zero delta (no change)', () => {
      const bit = new BinaryIndexedTree2D({ rows: 3, cols: 3 })
      bit.update(0, 0, 5)
      bit.update(0, 0, 0)
      expect(bit.get(0, 0)).toBe(5)
    })

    it('updates affect prefix sums correctly', () => {
      const bit = new BinaryIndexedTree2D({ rows: 3, cols: 3 })
      bit.update(0, 0, 1)
      bit.update(0, 1, 2)
      bit.update(1, 0, 3)
      bit.update(1, 1, 4)
      // query(1,1) = sum of all cells from (0,0) to (1,1) = 1+2+3+4 = 10
      expect(bit.query(1, 1)).toBe(10)
    })

    it('throws RangeError for negative row', () => {
      const bit = new BinaryIndexedTree2D({ rows: 3, cols: 3 })
      expect(() => bit.update(-1, 0, 5)).toThrow(RangeError)
    })

    it('throws RangeError for negative col', () => {
      const bit = new BinaryIndexedTree2D({ rows: 3, cols: 3 })
      expect(() => bit.update(0, -1, 5)).toThrow(RangeError)
    })

    it('throws RangeError for row >= rows', () => {
      const bit = new BinaryIndexedTree2D({ rows: 3, cols: 3 })
      expect(() => bit.update(3, 0, 5)).toThrow(RangeError)
    })

    it('throws RangeError for col >= cols', () => {
      const bit = new BinaryIndexedTree2D({ rows: 3, cols: 3 })
      expect(() => bit.update(0, 3, 5)).toThrow(RangeError)
    })

    it('throws RangeError with correct message for out of bounds', () => {
      const bit = new BinaryIndexedTree2D({ rows: 2, cols: 3 })
      expect(() => bit.update(5, 0, 1)).toThrow('Index out of bounds: (5, 0) for grid of size (2, 3)')
    })
  })

  // ─── query (prefix sum) ────────────────────────────────────────────

  describe('query', () => {
    it('returns 0 for an empty grid at origin', () => {
      const bit = new BinaryIndexedTree2D({ rows: 3, cols: 3 })
      expect(bit.query(0, 0)).toBe(0)
    })

    it('returns the value at (0,0) after a single update', () => {
      const bit = new BinaryIndexedTree2D({ rows: 3, cols: 3 })
      bit.update(0, 0, 7)
      expect(bit.query(0, 0)).toBe(7)
    })

    it('computes prefix sum for a single row', () => {
      const bit = new BinaryIndexedTree2D({ rows: 1, cols: 5 })
      bit.update(0, 0, 1)
      bit.update(0, 1, 2)
      bit.update(0, 2, 3)
      bit.update(0, 3, 4)
      bit.update(0, 4, 5)
      expect(bit.query(0, 4)).toBe(15)
    })

    it('computes prefix sum for a single column', () => {
      const bit = new BinaryIndexedTree2D({ rows: 5, cols: 1 })
      bit.update(0, 0, 10)
      bit.update(1, 0, 20)
      bit.update(2, 0, 30)
      expect(bit.query(2, 0)).toBe(60)
    })

    it('computes 2D prefix sum correctly', () => {
      const bit = new BinaryIndexedTree2D({ rows: 4, cols: 4 })
      // Fill grid:
      // 1 2 3 4
      // 5 6 7 8
      // 9 10 11 12
      // 13 14 15 16
      let val = 1
      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
          bit.update(i, j, val++)
        }
      }
      // Sum of all = 136
      expect(bit.query(3, 3)).toBe(136)
      // Sum of first 2x2 = 1+2+5+6 = 14
      expect(bit.query(1, 1)).toBe(14)
      // Sum of first 3x3 = 1+2+3+5+6+7+9+10+11 = 54
      expect(bit.query(2, 2)).toBe(54)
    })

    it('computes prefix sum with negative values', () => {
      const bit = new BinaryIndexedTree2D({ rows: 3, cols: 3 })
      bit.update(0, 0, 10)
      bit.update(1, 1, -3)
      bit.update(2, 2, -7)
      expect(bit.query(2, 2)).toBe(0)
    })

    it('computes prefix sum with floating point values', () => {
      const bit = new BinaryIndexedTree2D({ rows: 2, cols: 2 })
      bit.update(0, 0, 1.5)
      bit.update(0, 1, 2.5)
      bit.update(1, 0, 3.5)
      bit.update(1, 1, 4.5)
      expect(bit.query(1, 1)).toBeCloseTo(12)
    })

    it('throws RangeError for out of bounds query', () => {
      const bit = new BinaryIndexedTree2D({ rows: 3, cols: 3 })
      expect(() => bit.query(-1, 0)).toThrow(RangeError)
      expect(() => bit.query(0, -1)).toThrow(RangeError)
      expect(() => bit.query(3, 0)).toThrow(RangeError)
      expect(() => bit.query(0, 3)).toThrow(RangeError)
    })

    it('returns correct prefix sum after defaultValue construction', () => {
      const bit = new BinaryIndexedTree2D({ rows: 2, cols: 3, defaultValue: 2 })
      // Grid: 2 2 2
      //       2 2 2
      expect(bit.query(0, 0)).toBe(2)
      expect(bit.query(0, 1)).toBe(4)
      expect(bit.query(1, 0)).toBe(4)
      expect(bit.query(1, 2)).toBe(12)
    })
  })

  // ─── rangeQuery ────────────────────────────────────────────────────

  describe('rangeQuery', () => {
    it('returns cell value for a 1x1 range', () => {
      const bit = new BinaryIndexedTree2D({ rows: 3, cols: 3 })
      bit.update(1, 1, 42)
      expect(bit.rangeQuery(1, 1, 1, 1)).toBe(42)
    })

    it('returns 0 for an empty 1x1 range', () => {
      const bit = new BinaryIndexedTree2D({ rows: 3, cols: 3 })
      expect(bit.rangeQuery(0, 0, 0, 0)).toBe(0)
    })

    it('computes range sum for a full grid', () => {
      const bit = new BinaryIndexedTree2D({ rows: 3, cols: 3 })
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          bit.update(i, j, 1)
        }
      }
      expect(bit.rangeQuery(0, 0, 2, 2)).toBe(9)
    })

    it('computes range sum for a sub-rectangle', () => {
      const bit = new BinaryIndexedTree2D({ rows: 4, cols: 4 })
      let val = 1
      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
          bit.update(i, j, val++)
        }
      }
      // Sub-rectangle (1,1) to (2,3) = 6+7+8+10+11+12 = 54
      expect(bit.rangeQuery(1, 1, 2, 3)).toBe(54)
    })

    it('computes range sum for a single row range', () => {
      const bit = new BinaryIndexedTree2D({ rows: 3, cols: 5 })
      bit.update(1, 0, 10)
      bit.update(1, 1, 20)
      bit.update(1, 2, 30)
      expect(bit.rangeQuery(1, 0, 1, 2)).toBe(60)
    })

    it('computes range sum for a single column range', () => {
      const bit = new BinaryIndexedTree2D({ rows: 5, cols: 3 })
      bit.update(0, 1, 5)
      bit.update(1, 1, 10)
      bit.update(2, 1, 15)
      expect(bit.rangeQuery(0, 1, 2, 1)).toBe(30)
    })

    it('handles range query with negative values', () => {
      const bit = new BinaryIndexedTree2D({ rows: 3, cols: 3 })
      bit.update(0, 0, 10)
      bit.update(1, 1, -3)
      bit.update(2, 2, -5)
      expect(bit.rangeQuery(0, 0, 2, 2)).toBe(2)
    })

    it('handles range query starting at origin', () => {
      const bit = new BinaryIndexedTree2D({ rows: 3, cols: 3 })
      bit.update(0, 0, 1)
      bit.update(0, 1, 2)
      bit.update(1, 0, 3)
      expect(bit.rangeQuery(0, 0, 1, 1)).toBe(6)
    })

    it('handles range query ending at bottom-right', () => {
      const bit = new BinaryIndexedTree2D({ rows: 4, cols: 4 })
      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
          bit.update(i, j, i * 4 + j + 1)
        }
      }
      // Total sum = 136
      expect(bit.rangeQuery(0, 0, 3, 3)).toBe(136)
    })

    it('throws RangeError when r1 is out of bounds', () => {
      const bit = new BinaryIndexedTree2D({ rows: 3, cols: 3 })
      expect(() => bit.rangeQuery(-1, 0, 2, 2)).toThrow(RangeError)
      expect(() => bit.rangeQuery(3, 0, 2, 2)).toThrow(RangeError)
    })

    it('throws RangeError when c1 is out of bounds', () => {
      const bit = new BinaryIndexedTree2D({ rows: 3, cols: 3 })
      expect(() => bit.rangeQuery(0, -1, 2, 2)).toThrow(RangeError)
      expect(() => bit.rangeQuery(0, 3, 2, 2)).toThrow(RangeError)
    })

    it('throws RangeError when r2 is out of bounds', () => {
      const bit = new BinaryIndexedTree2D({ rows: 3, cols: 3 })
      expect(() => bit.rangeQuery(0, 0, 3, 2)).toThrow(RangeError)
    })

    it('throws RangeError when c2 is out of bounds', () => {
      const bit = new BinaryIndexedTree2D({ rows: 3, cols: 3 })
      expect(() => bit.rangeQuery(0, 0, 2, 3)).toThrow(RangeError)
    })

    it('throws RangeError when r1 > r2', () => {
      const bit = new BinaryIndexedTree2D({ rows: 3, cols: 3 })
      expect(() => bit.rangeQuery(2, 0, 1, 2)).toThrow(RangeError)
    })

    it('throws RangeError when c1 > c2', () => {
      const bit = new BinaryIndexedTree2D({ rows: 3, cols: 3 })
      expect(() => bit.rangeQuery(0, 2, 2, 1)).toThrow(RangeError)
    })

    it('throws RangeError with message for invalid range', () => {
      const bit = new BinaryIndexedTree2D({ rows: 3, cols: 3 })
      expect(() => bit.rangeQuery(2, 0, 1, 2)).toThrow('Invalid range')
    })

    it('handles range query on grid with defaultValue', () => {
      const bit = new BinaryIndexedTree2D({ rows: 3, cols: 3, defaultValue: 5 })
      expect(bit.rangeQuery(0, 0, 2, 2)).toBe(45) // 9 cells * 5
    })
  })

  // ─── set ────────────────────────────────────────────────────────────

  describe('set', () => {
    it('sets a cell to a specific value', () => {
      const bit = new BinaryIndexedTree2D({ rows: 3, cols: 3 })
      bit.set(0, 0, 42)
      expect(bit.get(0, 0)).toBe(42)
    })

    it('overwrites a previous value', () => {
      const bit = new BinaryIndexedTree2D({ rows: 3, cols: 3 })
      bit.set(1, 1, 10)
      bit.set(1, 1, 20)
      expect(bit.get(1, 1)).toBe(20)
    })

    it('can set to 0 from a non-zero value', () => {
      const bit = new BinaryIndexedTree2D({ rows: 3, cols: 3 })
      bit.set(0, 0, 100)
      bit.set(0, 0, 0)
      expect(bit.get(0, 0)).toBe(0)
    })

    it('can set to a negative value', () => {
      const bit = new BinaryIndexedTree2D({ rows: 3, cols: 3 })
      bit.set(2, 2, -10)
      expect(bit.get(2, 2)).toBe(-10)
    })

    it('can set to a floating point value', () => {
      const bit = new BinaryIndexedTree2D({ rows: 3, cols: 3 })
      bit.set(0, 0, 3.14)
      expect(bit.get(0, 0)).toBeCloseTo(3.14)
    })

    it('no-ops when setting the same value', () => {
      const bit = new BinaryIndexedTree2D({ rows: 3, cols: 3 })
      bit.set(0, 0, 5)
      bit.set(0, 0, 5)
      expect(bit.get(0, 0)).toBe(5)
      // Verify prefix sum is still correct
      expect(bit.query(2, 2)).toBe(5)
    })

    it('updates prefix sums correctly after set', () => {
      const bit = new BinaryIndexedTree2D({ rows: 2, cols: 2 })
      bit.update(0, 0, 1)
      bit.update(0, 1, 2)
      bit.update(1, 0, 3)
      bit.update(1, 1, 4)
      // sum = 10
      expect(bit.query(1, 1)).toBe(10)
      bit.set(1, 1, 10)
      // sum should be 1+2+3+10 = 16
      expect(bit.query(1, 1)).toBe(16)
    })

    it('overwrites defaultValue correctly', () => {
      const bit = new BinaryIndexedTree2D({ rows: 2, cols: 2, defaultValue: 5 })
      bit.set(0, 0, 0)
      expect(bit.get(0, 0)).toBe(0)
      expect(bit.query(1, 1)).toBe(15) // 5+5+5+0 = 15
    })

    it('throws RangeError for out of bounds', () => {
      const bit = new BinaryIndexedTree2D({ rows: 3, cols: 3 })
      expect(() => bit.set(-1, 0, 5)).toThrow(RangeError)
      expect(() => bit.set(0, -1, 5)).toThrow(RangeError)
      expect(() => bit.set(3, 0, 5)).toThrow(RangeError)
      expect(() => bit.set(0, 3, 5)).toThrow(RangeError)
    })
  })

  // ─── get ────────────────────────────────────────────────────────────

  describe('get', () => {
    it('returns 0 for uninitialized cell', () => {
      const bit = new BinaryIndexedTree2D({ rows: 3, cols: 3 })
      expect(bit.get(0, 0)).toBe(0)
      expect(bit.get(2, 2)).toBe(0)
    })

    it('returns the current value after update', () => {
      const bit = new BinaryIndexedTree2D({ rows: 3, cols: 3 })
      bit.update(1, 1, 7)
      expect(bit.get(1, 1)).toBe(7)
    })

    it('returns the current value after set', () => {
      const bit = new BinaryIndexedTree2D({ rows: 3, cols: 3 })
      bit.set(0, 0, 99)
      expect(bit.get(0, 0)).toBe(99)
    })

    it('returns defaultValue for untouched cells', () => {
      const bit = new BinaryIndexedTree2D({ rows: 3, cols: 3, defaultValue: 7 })
      expect(bit.get(0, 0)).toBe(7)
      expect(bit.get(1, 2)).toBe(7)
    })

    it('returns updated value even when defaultValue was set', () => {
      const bit = new BinaryIndexedTree2D({ rows: 3, cols: 3, defaultValue: 5 })
      bit.update(1, 1, 3)
      expect(bit.get(1, 1)).toBe(8) // 5 + 3
    })

    it('throws RangeError for out of bounds', () => {
      const bit = new BinaryIndexedTree2D({ rows: 3, cols: 3 })
      expect(() => bit.get(-1, 0)).toThrow(RangeError)
      expect(() => bit.get(3, 0)).toThrow(RangeError)
      expect(() => bit.get(0, 3)).toThrow(RangeError)
    })
  })

  // ─── dimensions ────────────────────────────────────────────────────

  describe('dimensions', () => {
    it('returns correct dimensions', () => {
      const bit = new BinaryIndexedTree2D({ rows: 5, cols: 7 })
      const dims = bit.dimensions()
      expect(dims).toEqual({ rows: 5, cols: 7 })
    })

    it('returns 1x1 for minimal grid', () => {
      const bit = new BinaryIndexedTree2D({ rows: 1, cols: 1 })
      expect(bit.dimensions()).toEqual({ rows: 1, cols: 1 })
    })

    it('returns correct dimensions for non-square grid', () => {
      const bit = new BinaryIndexedTree2D({ rows: 3, cols: 10 })
      expect(bit.dimensions()).toEqual({ rows: 3, cols: 10 })
    })
  })

  // ─── toArray ────────────────────────────────────────────────────────

  describe('toArray', () => {
    it('returns a 2D array of zeros for a new grid', () => {
      const bit = new BinaryIndexedTree2D({ rows: 2, cols: 3 })
      const arr = bit.toArray()
      expect(arr).toEqual([
        [0, 0, 0],
        [0, 0, 0],
      ])
    })

    it('returns the current state after updates', () => {
      const bit = new BinaryIndexedTree2D({ rows: 2, cols: 2 })
      bit.update(0, 0, 1)
      bit.update(0, 1, 2)
      bit.update(1, 0, 3)
      bit.update(1, 1, 4)
      expect(bit.toArray()).toEqual([
        [1, 2],
        [3, 4],
      ])
    })

    it('returns defaultValue grid when constructed with defaultValue', () => {
      const bit = new BinaryIndexedTree2D({ rows: 2, cols: 2, defaultValue: 3 })
      expect(bit.toArray()).toEqual([
        [3, 3],
        [3, 3],
      ])
    })

    it('reflects changes after set', () => {
      const bit = new BinaryIndexedTree2D({ rows: 2, cols: 2 })
      bit.set(0, 0, 10)
      bit.set(1, 1, 20)
      expect(bit.toArray()).toEqual([
        [10, 0],
        [0, 20],
      ])
    })

    it('reflects all zeros after clear', () => {
      const bit = new BinaryIndexedTree2D({ rows: 2, cols: 2 })
      bit.update(0, 0, 5)
      bit.update(1, 1, 10)
      bit.clear()
      expect(bit.toArray()).toEqual([
        [0, 0],
        [0, 0],
      ])
    })

    it('returns independent copy (not a reference)', () => {
      const bit = new BinaryIndexedTree2D({ rows: 2, cols: 2 })
      const arr = bit.toArray()
      arr[0][0] = 999
      expect(bit.get(0, 0)).toBe(0)
    })
  })

  // ─── clear ──────────────────────────────────────────────────────────

  describe('clear', () => {
    it('resets all cells to 0', () => {
      const bit = new BinaryIndexedTree2D({ rows: 3, cols: 3 })
      bit.update(0, 0, 10)
      bit.update(1, 1, 20)
      bit.update(2, 2, 30)
      bit.clear()
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          expect(bit.get(i, j)).toBe(0)
        }
      }
    })

    it('resets prefix sums to 0', () => {
      const bit = new BinaryIndexedTree2D({ rows: 3, cols: 3 })
      bit.update(0, 0, 100)
      bit.update(2, 2, 200)
      bit.clear()
      expect(bit.query(2, 2)).toBe(0)
      expect(bit.query(0, 0)).toBe(0)
    })

    it('resets range queries to 0', () => {
      const bit = new BinaryIndexedTree2D({ rows: 3, cols: 3 })
      bit.update(0, 0, 5)
      bit.update(1, 1, 10)
      bit.clear()
      expect(bit.rangeQuery(0, 0, 2, 2)).toBe(0)
    })

    it('allows reuse after clearing', () => {
      const bit = new BinaryIndexedTree2D({ rows: 2, cols: 2 })
      bit.update(0, 0, 10)
      bit.clear()
      bit.update(0, 0, 5)
      expect(bit.get(0, 0)).toBe(5)
      expect(bit.query(1, 1)).toBe(5)
    })

    it('clears grid constructed with defaultValue', () => {
      const bit = new BinaryIndexedTree2D({ rows: 2, cols: 2, defaultValue: 7 })
      bit.clear()
      expect(bit.toArray()).toEqual([
        [0, 0],
        [0, 0],
      ])
      expect(bit.query(1, 1)).toBe(0)
    })

    it('clear is idempotent', () => {
      const bit = new BinaryIndexedTree2D({ rows: 2, cols: 2 })
      bit.update(0, 0, 5)
      bit.clear()
      bit.clear()
      expect(bit.get(0, 0)).toBe(0)
    })
  })

  // ─── Edge cases ────────────────────────────────────────────────────

  describe('edge cases', () => {
    it('handles 1x1 grid correctly', () => {
      const bit = new BinaryIndexedTree2D({ rows: 1, cols: 1 })
      expect(bit.query(0, 0)).toBe(0)
      bit.update(0, 0, 42)
      expect(bit.query(0, 0)).toBe(42)
      expect(bit.rangeQuery(0, 0, 0, 0)).toBe(42)
      expect(bit.get(0, 0)).toBe(42)
      bit.set(0, 0, 100)
      expect(bit.get(0, 0)).toBe(100)
      expect(bit.query(0, 0)).toBe(100)
    })

    it('handles single row grid correctly', () => {
      const bit = new BinaryIndexedTree2D({ rows: 1, cols: 5 })
      for (let j = 0; j < 5; j++) {
        bit.update(0, j, j + 1)
      }
      expect(bit.query(0, 4)).toBe(15)
      expect(bit.rangeQuery(0, 1, 0, 3)).toBe(9) // 2+3+4
    })

    it('handles single column grid correctly', () => {
      const bit = new BinaryIndexedTree2D({ rows: 5, cols: 1 })
      for (let i = 0; i < 5; i++) {
        bit.update(i, 0, (i + 1) * 10)
      }
      expect(bit.query(4, 0)).toBe(150) // 10+20+30+40+50
      expect(bit.rangeQuery(1, 0, 3, 0)).toBe(90) // 20+30+40
    })

    it('handles large grid operations', () => {
      const bit = new BinaryIndexedTree2D({ rows: 50, cols: 50 })
      for (let i = 0; i < 50; i++) {
        for (let j = 0; j < 50; j++) {
          bit.update(i, j, 1)
        }
      }
      expect(bit.query(49, 49)).toBe(2500)
      expect(bit.rangeQuery(0, 0, 49, 49)).toBe(2500)
      expect(bit.rangeQuery(10, 10, 19, 19)).toBe(100)
    })

    it('handles large floating point sums', () => {
      const bit = new BinaryIndexedTree2D({ rows: 10, cols: 10 })
      for (let i = 0; i < 10; i++) {
        for (let j = 0; j < 10; j++) {
          bit.update(i, j, 0.1)
        }
      }
      // 100 * 0.1 = 10, but floating point may not be exact
      const sum = bit.query(9, 9)
      expect(sum).toBeCloseTo(10, 5)
    })

    it('handles alternating positive and negative values', () => {
      const bit = new BinaryIndexedTree2D({ rows: 4, cols: 4 })
      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
          bit.update(i, j, (i + j) % 2 === 0 ? 1 : -1)
        }
      }
      // 4x4 grid alternating 1 and -1 = 0
      expect(bit.query(3, 3)).toBe(0)
    })

    it('handles zero updates on all cells', () => {
      const bit = new BinaryIndexedTree2D({ rows: 3, cols: 3 })
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          bit.update(i, j, 0)
        }
      }
      expect(bit.query(2, 2)).toBe(0)
      const arr = bit.toArray()
      for (const row of arr) {
        for (const val of row) {
          expect(val).toBe(0)
        }
      }
    })

    it('handles setting all cells to the same value', () => {
      const bit = new BinaryIndexedTree2D({ rows: 3, cols: 3 })
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          bit.set(i, j, 7)
        }
      }
      expect(bit.query(2, 2)).toBe(63) // 9 * 7
      expect(bit.rangeQuery(1, 1, 2, 2)).toBe(28) // 4 * 7
    })

    it('handles set followed by update', () => {
      const bit = new BinaryIndexedTree2D({ rows: 2, cols: 2 })
      bit.set(0, 0, 10)
      bit.update(0, 0, 5)
      expect(bit.get(0, 0)).toBe(15)
      expect(bit.query(1, 1)).toBe(15)
    })

    it('handles update followed by set', () => {
      const bit = new BinaryIndexedTree2D({ rows: 2, cols: 2 })
      bit.update(0, 0, 10)
      bit.set(0, 0, 5)
      expect(bit.get(0, 0)).toBe(5)
      expect(bit.query(1, 1)).toBe(5)
    })

    it('handles constructing with defaultValue and then modifying', () => {
      const bit = new BinaryIndexedTree2D({ rows: 3, cols: 3, defaultValue: 5 })
      // All cells are 5, sum = 45
      expect(bit.query(2, 2)).toBe(45)
      bit.update(1, 1, 10) // cell (1,1) becomes 15
      expect(bit.get(1, 1)).toBe(15)
      expect(bit.query(2, 2)).toBe(55) // 45 + 10
      bit.set(2, 2, 0) // cell (2,2) goes from 5 to 0
      expect(bit.get(2, 2)).toBe(0)
      expect(bit.query(2, 2)).toBe(50) // 55 - 5
    })

    it('handles clearing and rebuilding', () => {
      const bit = new BinaryIndexedTree2D({ rows: 3, cols: 3 })
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          bit.update(i, j, 100)
        }
      }
      bit.clear()
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          bit.update(i, j, i * 3 + j + 1)
        }
      }
      // Grid: 1 2 3 / 4 5 6 / 7 8 9, sum = 45
      expect(bit.query(2, 2)).toBe(45)
      expect(bit.rangeQuery(0, 0, 1, 1)).toBe(12) // 1+2+4+5
    })

    it('handles very large delta values', () => {
      const bit = new BinaryIndexedTree2D({ rows: 2, cols: 2 })
      bit.update(0, 0, Number.MAX_SAFE_INTEGER)
      expect(bit.get(0, 0)).toBe(Number.MAX_SAFE_INTEGER)
      expect(bit.query(1, 1)).toBe(Number.MAX_SAFE_INTEGER)
    })

    it('handles very small floating point values', () => {
      const bit = new BinaryIndexedTree2D({ rows: 2, cols: 2 })
      bit.update(0, 0, Number.MIN_VALUE)
      expect(bit.get(0, 0)).toBe(Number.MIN_VALUE)
    })

    it('correctly handles non-square grids', () => {
      const bit = new BinaryIndexedTree2D({ rows: 2, cols: 5 })
      for (let j = 0; j < 5; j++) {
        bit.update(0, j, j + 1)
        bit.update(1, j, (j + 1) * 10)
      }
      // Row 0: 1,2,3,4,5 = 15
      // Row 1: 10,20,30,40,50 = 150
      expect(bit.query(0, 4)).toBe(15)
      expect(bit.query(1, 4)).toBe(165) // 15 + 150
      expect(bit.rangeQuery(0, 2, 1, 4)).toBe(3 + 4 + 5 + 30 + 40 + 50) // = 132
    })
  })
})
