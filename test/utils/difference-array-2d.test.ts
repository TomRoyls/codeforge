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

  it('handles negative values', () => {
    const da = new DifferenceArray2D(3, 3)
    da.add(0, 0, 2, 2, 10)
    da.add(1, 1, 2, 2, -5)
    const grid = da.buildGrid()
    expect(grid[0]![0]).toBe(10)
    expect(grid[1]![1]).toBe(5)
  })

  it('addPoint is equivalent to 1x1 add', () => {
    const da1 = new DifferenceArray2D(3, 3)
    da1.addPoint(1, 1, 7)
    const da2 = new DifferenceArray2D(3, 3)
    da2.add(1, 1, 1, 1, 7)
    expect(da1.buildGrid()).toEqual(da2.buildGrid())
  })

  it('single cell add', () => {
    const da = new DifferenceArray2D(2, 2)
    da.add(0, 0, 0, 0, 5)
    const grid = da.buildGrid()
    expect(grid[0]![0]).toBe(5)
    expect(grid[1]![1]).toBe(0)
  })

  it('buildGrid with no updates returns zeros', () => {
    const da = new DifferenceArray2D(3, 3)
    const grid = da.buildGrid()
    expect(grid[0]![0]).toBe(0)
    expect(grid[2]![2]).toBe(0)
  })

  it('single cell add', () => {
    const da = new DifferenceArray2D(2, 2)
    da.add(0, 0, 0, 0, 5)
    const grid = da.buildGrid()
    expect(grid[0]![0]).toBe(5)
    expect(grid[1]![1]).toBe(0)
  })

  it('overlapping ranges accumulate', () => {
    const da = new DifferenceArray2D(3, 3)
    da.add(0, 0, 1, 1, 5)
    da.add(0, 0, 1, 1, 3)
    const grid = da.buildGrid()
    expect(grid[0]![0]).toBe(8)
  })
})
