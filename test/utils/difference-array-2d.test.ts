import { describe, it, expect } from 'vitest'
import { DifferenceArray2D } from '../../src/utils/difference-array-2d.js'

describe('DifferenceArray2D', () => {
  it('creates with correct dimensions', () => {
    const da = new DifferenceArray2D(3, 4)
    expect(da.rowCount).toBe(3)
    expect(da.colCount).toBe(4)
  })

  it('build returns zero-filled grid without adds', () => {
    const da = new DifferenceArray2D(2, 2)
    const grid = da.buildGrid()
    expect(grid).toEqual([[0, 0], [0, 0]])
  })

  it('addPoint sets single cell', () => {
    const da = new DifferenceArray2D(3, 3)
    da.addPoint(1, 1, 5)
    const grid = da.buildGrid()
    expect(grid[1]![1]).toBe(5)
    expect(grid[0]![0]).toBe(0)
  })

  it('add to full grid', () => {
    const da = new DifferenceArray2D(2, 2)
    da.add(0, 0, 1, 1, 3)
    const grid = da.buildGrid()
    expect(grid).toEqual([[3, 3], [3, 3]])
  })

  it('add to sub-rectangle', () => {
    const da = new DifferenceArray2D(4, 4)
    da.add(1, 1, 2, 2, 7)
    const grid = da.buildGrid()
    expect(grid[0]![0]).toBe(0)
    expect(grid[1]![1]).toBe(7)
    expect(grid[1]![2]).toBe(7)
    expect(grid[2]![1]).toBe(7)
    expect(grid[2]![2]).toBe(7)
    expect(grid[0]![1]).toBe(0)
    expect(grid[3]![3]).toBe(0)
  })

  it('overlapping adds accumulate', () => {
    const da = new DifferenceArray2D(3, 3)
    da.add(0, 0, 2, 2, 1)
    da.add(1, 1, 2, 2, 2)
    const grid = da.buildGrid()
    expect(grid[0]![0]).toBe(1)
    expect(grid[1]![1]).toBe(3)
    expect(grid[2]![2]).toBe(3)
    expect(grid[0]![2]).toBe(1)
  })

  it('negative values work', () => {
    const da = new DifferenceArray2D(2, 2)
    da.add(0, 0, 1, 1, -5)
    const grid = da.buildGrid()
    expect(grid[0]![0]).toBe(-5)
    expect(grid[1]![1]).toBe(-5)
  })

  it('ignores out of bounds', () => {
    const da = new DifferenceArray2D(2, 2)
    da.add(-1, -1, 3, 3, 10)
    const grid = da.buildGrid()
    expect(grid).toEqual([[0, 0], [0, 0]])
  })

  it('build returns flat array', () => {
    const da = new DifferenceArray2D(2, 3)
    da.addPoint(0, 0, 1)
    const flat = da.build()
    expect(flat.length).toBe(6)
    expect(flat[0]).toBe(1)
    expect(flat[5]).toBe(0)
  })

  it('handles single row', () => {
    const da = new DifferenceArray2D(1, 4)
    da.add(0, 1, 0, 2, 10)
    const grid = da.buildGrid()
    expect(grid).toEqual([[0, 10, 10, 0]])
  })

  it('handles single column', () => {
    const da = new DifferenceArray2D(3, 1)
    da.add(0, 0, 1, 0, 5)
    const grid = da.buildGrid()
    expect(grid).toEqual([[5], [5], [0]])
  })

  it('handles single cell grid', () => {
    const da = new DifferenceArray2D(1, 1)
    da.addPoint(0, 0, 42)
    const grid = da.buildGrid()
    expect(grid).toEqual([[42]])
  })

  it('multiple adds to same cell accumulate', () => {
    const da = new DifferenceArray2D(2, 2)
    da.addPoint(0, 0, 1)
    da.addPoint(0, 0, 2)
    da.addPoint(0, 0, 3)
    const grid = da.buildGrid()
    expect(grid[0]![0]).toBe(6)
  })

  it('handles large grid', () => {
    const da = new DifferenceArray2D(50, 50)
    da.add(10, 10, 20, 20, 5)
    const grid = da.buildGrid()
    expect(grid[15]![15]).toBe(5)
    expect(grid[0]![0]).toBe(0)
    expect(grid[30]![30]).toBe(0)
  })

  it('add at boundary edges', () => {
    const da = new DifferenceArray2D(3, 3)
    da.add(0, 0, 0, 0, 1)
    da.add(2, 2, 2, 2, 2)
    const grid = da.buildGrid()
    expect(grid[0]![0]).toBe(1)
    expect(grid[2]![2]).toBe(2)
    expect(grid[1]![1]).toBe(0)
  })

  it('multiple overlapping rectangles', () => {
    const da = new DifferenceArray2D(5, 5)
    da.add(0, 0, 4, 4, 1)
    da.add(1, 1, 3, 3, 2)
    da.add(2, 2, 2, 2, 3)
    const grid = da.buildGrid()
    expect(grid[0]![0]).toBe(1)
    expect(grid[1]![1]).toBe(3)
    expect(grid[2]![2]).toBe(6)
  })

  it('addPoint is equivalent to 1x1 add', () => {
    const da1 = new DifferenceArray2D(3, 3)
    da1.addPoint(1, 1, 7)
    const da2 = new DifferenceArray2D(3, 3)
    da2.add(1, 1, 1, 1, 7)
    expect(da1.buildGrid()).toEqual(da2.buildGrid())
  })

  it('buildGrid with no updates returns zeros', () => {
    const da = new DifferenceArray2D(3, 3)
    const grid = da.buildGrid()
    expect(grid[0]![0]).toBe(0)
    expect(grid[2]![2]).toBe(0)
  })

  it('overlapping ranges accumulate', () => {
    const da = new DifferenceArray2D(3, 3)
    da.add(0, 0, 1, 1, 5)
    da.add(0, 0, 1, 1, 3)
    const grid = da.buildGrid()
    expect(grid[0]![0]).toBe(8)
  })

  it('add single cell increments value', () => {
    const da = new DifferenceArray2D(2, 2)
    da.add(0, 0, 0, 0, 5)
    const grid = da.buildGrid()
    expect(grid[0]![0]).toBe(5)
  })

  it('single cell range add', () => {
    const da = new DifferenceArray2D(2, 2)
    da.addPoint(0, 0, 5)
    const grid = da.build()
    expect(grid[0]).toBe(5)
  })

  it('toString returns correct format', () => {
    const da = new DifferenceArray2D(3, 4)
    expect(da.toString()).toBe('DifferenceArray2D(3x4)')
  })

  it('toJSON returns correct structure', () => {
    const da = new DifferenceArray2D(2, 3)
    da.addPoint(0, 0, 5)
    const json = da.toJSON()
    expect(json.rows).toBe(2)
    expect(json.cols).toBe(3)
    expect(json.diff).toBeInstanceOf(Array)
    expect(json.diff.length).toBe(12)
  })

  it('clone creates independent copy', () => {
    const da1 = new DifferenceArray2D(2, 2)
    da1.addPoint(0, 0, 5)
    const da2 = da1.clone()
    da2.addPoint(1, 1, 10)
    expect(da1.buildGrid()[0]![0]).toBe(5)
    expect(da1.buildGrid()[1]![1]).toBe(0)
    expect(da2.buildGrid()[1]![1]).toBe(10)
  })

  it('equals returns true for identical arrays', () => {
    const da1 = new DifferenceArray2D(2, 2)
    da1.addPoint(0, 0, 5)
    const da2 = new DifferenceArray2D(2, 2)
    da2.addPoint(0, 0, 5)
    expect(da1.equals(da2)).toBe(true)
  })

  it('equals returns false for different dimensions', () => {
    const da1 = new DifferenceArray2D(2, 2)
    const da2 = new DifferenceArray2D(3, 3)
    expect(da1.equals(da2)).toBe(false)
  })

  it('equals returns false for different values', () => {
    const da1 = new DifferenceArray2D(2, 2)
    da1.addPoint(0, 0, 5)
    const da2 = new DifferenceArray2D(2, 2)
    da2.addPoint(0, 0, 10)
    expect(da1.equals(da2)).toBe(false)
  })

  it('equals returns false for non-DifferenceArray2D', () => {
    const da = new DifferenceArray2D(2, 2)
    expect(da.equals({})).toBe(false)
    expect(da.equals(null)).toBe(false)
    expect(da.equals(undefined)).toBe(false)
  })

  it('handles zero value updates', () => {
    const da = new DifferenceArray2D(2, 2)
    da.addPoint(0, 0, 5)
    da.addPoint(0, 0, 0)
    const grid = da.buildGrid()
    expect(grid[0]![0]).toBe(5)
  })

  it('updates entire grid multiple times', () => {
    const da = new DifferenceArray2D(3, 3)
    da.add(0, 0, 2, 2, 5)
    da.add(0, 0, 2, 2, 3)
    const grid = da.buildGrid()
    grid.forEach(row => row.forEach(cell => expect(cell).toBe(8)))
  })

  it('handles very small values', () => {
    const da = new DifferenceArray2D(2, 2)
    da.addPoint(0, 0, 0.0001)
    const grid = da.buildGrid()
    expect(grid[0]![0]).toBe(0.0001)
  })

  it('handles very large values', () => {
    const da = new DifferenceArray2D(2, 2)
    da.addPoint(0, 0, Number.MAX_SAFE_INTEGER)
    const grid = da.buildGrid()
    expect(grid[0]![0]).toBe(Number.MAX_SAFE_INTEGER)
  })

  it('update first row only', () => {
    const da = new DifferenceArray2D(3, 3)
    da.add(0, 0, 0, 2, 5)
    const grid = da.buildGrid()
    expect(grid[0]).toEqual([5, 5, 5])
    expect(grid[1]).toEqual([0, 0, 0])
    expect(grid[2]).toEqual([0, 0, 0])
  })

  it('update first column only', () => {
    const da = new DifferenceArray2D(3, 3)
    da.add(0, 0, 2, 0, 5)
    const grid = da.buildGrid()
    expect(grid[0]![0]).toBe(5)
    expect(grid[1]![0]).toBe(5)
    expect(grid[2]![0]).toBe(5)
    expect(grid[0]![1]).toBe(0)
  })

  it('update last row only', () => {
    const da = new DifferenceArray2D(3, 3)
    da.add(2, 0, 2, 2, 5)
    const grid = da.buildGrid()
    expect(grid[0]).toEqual([0, 0, 0])
    expect(grid[1]).toEqual([0, 0, 0])
    expect(grid[2]).toEqual([5, 5, 5])
  })

  it('update last column only', () => {
    const da = new DifferenceArray2D(3, 3)
    da.add(0, 2, 2, 2, 5)
    const grid = da.buildGrid()
    grid.forEach(row => {
      expect(row[0]).toBe(0)
      expect(row[1]).toBe(0)
      expect(row[2]).toBe(5)
    })
  })

  it('ignores invalid range with negative start', () => {
    const da = new DifferenceArray2D(3, 3)
    da.add(-1, 0, 2, 2, 5)
    const grid = da.buildGrid()
    grid.forEach(row => row.forEach(cell => expect(cell).toBe(0)))
  })

  it('ignores invalid range with start after end', () => {
    const da = new DifferenceArray2D(3, 3)
    da.add(2, 2, 1, 1, 5)
    const grid = da.buildGrid()
    grid.forEach(row => row.forEach(cell => expect(cell).toBe(0)))
  })

  it('ignores range beyond grid', () => {
    const da = new DifferenceArray2D(3, 3)
    da.add(3, 3, 4, 4, 5)
    const grid = da.buildGrid()
    grid.forEach(row => row.forEach(cell => expect(cell).toBe(0)))
  })

  it('buildGrid returns correct dimensions', () => {
    const da = new DifferenceArray2D(4, 5)
    const grid = da.buildGrid()
    expect(grid.length).toBe(4)
    grid.forEach(row => expect(row.length).toBe(5))
  })

  it('build returns correct flat length', () => {
    const da = new DifferenceArray2D(4, 5)
    const flat = da.build()
    expect(flat.length).toBe(20)
  })

  it('handles decimal values correctly', () => {
    const da = new DifferenceArray2D(2, 2)
    da.addPoint(0, 0, 3.14159)
    da.addPoint(1, 1, 2.71828)
    const grid = da.buildGrid()
    expect(grid[0]![0]).toBeCloseTo(3.14159, 5)
    expect(grid[1]![1]).toBeCloseTo(2.71828, 5)
  })

  it('updates with negative and positive values', () => {
    const da = new DifferenceArray2D(2, 2)
    da.add(0, 0, 1, 1, 10)
    da.add(0, 0, 0, 0, -5)
    const grid = da.buildGrid()
    expect(grid[0]![0]).toBe(5)
    expect(grid[0]![1]).toBe(10)
  })

  it('clone preserves all updates', () => {
    const da1 = new DifferenceArray2D(2, 2)
    da1.addPoint(0, 0, 1)
    da1.addPoint(1, 1, 2)
    da1.add(0, 1, 1, 1, 3)
    const da2 = da1.clone()
    expect(da1.buildGrid()).toEqual(da2.buildGrid())
  })

  it('multiple builds return same result', () => {
    const da = new DifferenceArray2D(2, 2)
    da.addPoint(0, 0, 5)
    const grid1 = da.buildGrid()
    const grid2 = da.buildGrid()
    expect(grid1).toEqual(grid2)
  })

  it('ignores out of bounds column', () => {
    const da = new DifferenceArray2D(2, 2)
    da.add(0, -1, 1, 1, 5)
    const grid = da.buildGrid()
    grid.forEach(row => row.forEach(cell => expect(cell).toBe(0)))
  })

  it('ignores out of bounds row', () => {
    const da = new DifferenceArray2D(2, 2)
    da.add(-1, 0, 1, 1, 5)
    const grid = da.buildGrid()
    grid.forEach(row => row.forEach(cell => expect(cell).toBe(0)))
  })

  it('buildGrid after multiple updates', () => {
    const da = new DifferenceArray2D(3, 3)
    da.addPoint(0, 0, 1)
    da.addPoint(1, 1, 2)
    da.addPoint(2, 2, 3)
    const grid = da.buildGrid()
    expect(grid[0]![0]).toBe(1)
    expect(grid[1]![1]).toBe(2)
    expect(grid[2]![2]).toBe(3)
  })

  it('equals after clone and modification', () => {
    const da1 = new DifferenceArray2D(2, 2)
    da1.addPoint(0, 0, 5)
    const da2 = da1.clone()
    expect(da1.equals(da2)).toBe(true)
    da2.addPoint(1, 1, 10)
    expect(da1.equals(da2)).toBe(false)
  })

  it('handles sequential cell updates', () => {
    const da = new DifferenceArray2D(3, 3)
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        da.addPoint(i, j, 1)
      }
    }
    const grid = da.buildGrid()
    grid.forEach(row => row.forEach(cell => expect(cell).toBe(1)))
  })

  it('addPoint on boundary', () => {
    const da = new DifferenceArray2D(3, 3)
    da.addPoint(0, 0, 1)
    da.addPoint(0, 2, 2)
    da.addPoint(2, 0, 3)
    da.addPoint(2, 2, 4)
    const grid = da.buildGrid()
    expect(grid[0]![0]).toBe(1)
    expect(grid[0]![2]).toBe(2)
    expect(grid[2]![0]).toBe(3)
    expect(grid[2]![2]).toBe(4)
  })

  it('flat array index mapping', () => {
    const da = new DifferenceArray2D(2, 3)
    da.addPoint(0, 1, 5)
    da.addPoint(1, 2, 10)
    const flat = da.build()
    expect(flat[1]).toBe(5)
    expect(flat[5]).toBe(10)
  })

  it('addPoint adds to single cell', () => {
    const da = new DifferenceArray2D(3, 3)
    da.addPoint(1, 1, 7)
    const grid = da.buildGrid()
    expect(grid[1]![1]).toBe(7)
  })

  it('clone produces equal object', () => {
    const da = new DifferenceArray2D(2, 2)
    da.add(0, 0, 1, 1, 5)
    const c = da.clone()
    expect(c.buildGrid()).toEqual(da.buildGrid())
  })

  it('buildGrid returns correct dimensions', () => {
    const da = new DifferenceArray2D(3, 4)
    const grid = da.buildGrid()
    expect(grid.length).toBe(3)
    expect(grid[0]!.length).toBe(4)
  })
})
  it('build empty returns zeros', () => {
    const da = new DifferenceArray2D(2, 2)
    expect(da.build()).toEqual(new Float64Array([0, 0, 0, 0]))
  })

  it('addPoint adds value', () => {
    const da = new DifferenceArray2D(2, 2)
    da.addPoint(0, 0, 5)
    const result = da.build()
    expect(result[0]).toBe(5)
  })

  it('add range', () => {
    const da = new DifferenceArray2D(3, 3)
    da.add(0, 0, 2, 2, 1)
    const result = da.build()
    expect(result[0]).toBe(1)
  })
