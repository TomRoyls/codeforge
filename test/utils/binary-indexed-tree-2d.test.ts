import { describe, it, expect } from 'vitest'
import { BinaryIndexedTree2D } from '../../src/utils/binary-indexed-tree-2d.js'

describe('BinaryIndexedTree2D', () => {
  it('constructor initializes with correct dimensions', () => {
    const bit = new BinaryIndexedTree2D(3, 4)
    expect(bit.rowCount).toBe(3)
    expect(bit.colCount).toBe(4)
  })

  it('constructor handles zero dimensions', () => {
    const bit = new BinaryIndexedTree2D(0, 0)
    expect(bit.rowCount).toBe(0)
    expect(bit.colCount).toBe(0)
  })

  it('update adds delta to cell', () => {
    const bit = new BinaryIndexedTree2D(3, 3)
    bit.update(0, 0, 5)
    expect(bit.query(0, 0)).toBe(5)
  })

  it('update handles multiple updates to same cell', () => {
    const bit = new BinaryIndexedTree2D(3, 3)
    bit.update(1, 1, 3)
    bit.update(1, 1, 2)
    expect(bit.query(1, 1)).toBe(5)
  })

  it('update ignores out of bounds coordinates', () => {
    const bit = new BinaryIndexedTree2D(3, 3)
    bit.update(-1, 0, 5)
    bit.update(0, -1, 5)
    bit.update(3, 0, 5)
    bit.update(0, 3, 5)
    expect(bit.query(0, 0)).toBe(0)
  })

  it('query returns sum from origin', () => {
    const bit = new BinaryIndexedTree2D(3, 3)
    bit.update(0, 0, 1)
    bit.update(0, 1, 2)
    bit.update(1, 0, 3)
    expect(bit.query(1, 1)).toBe(6)
  })

  it('query handles negative coordinates', () => {
    const bit = new BinaryIndexedTree2D(3, 3)
    bit.update(0, 0, 5)
    expect(bit.query(-1, -1)).toBe(0)
  })

  it('query handles coordinates beyond bounds', () => {
    const bit = new BinaryIndexedTree2D(3, 3)
    bit.update(0, 0, 1)
    bit.update(1, 1, 2)
    expect(bit.query(5, 5)).toBe(3)
  })

  it('rangeQuery calculates submatrix sum correctly', () => {
    const bit = new BinaryIndexedTree2D(3, 3)
    bit.update(0, 0, 1)
    bit.update(0, 1, 2)
    bit.update(1, 0, 3)
    bit.update(1, 1, 4)
    expect(bit.rangeQuery(0, 0, 1, 1)).toBe(10)
  })

  it('rangeQuery returns 0 for invalid range', () => {
    const bit = new BinaryIndexedTree2D(3, 3)
    bit.update(0, 0, 5)
    expect(bit.rangeQuery(2, 2, 1, 1)).toBe(0)
    expect(bit.rangeQuery(0, 2, 1, 1)).toBe(0)
  })

  it('rangeQuery handles origin range', () => {
    const bit = new BinaryIndexedTree2D(3, 3)
    bit.update(0, 0, 1)
    bit.update(0, 1, 2)
    bit.update(1, 0, 3)
    expect(bit.rangeQuery(0, 0, 1, 1)).toBe(6)
  })

  it('fromGrid creates BIT from 2D array', () => {
    const grid = [
      [1, 2, 3],
      [4, 5, 6],
    ]
    const bit = BinaryIndexedTree2D.fromGrid(grid)
    expect(bit.rowCount).toBe(2)
    expect(bit.colCount).toBe(3)
    expect(bit.query(1, 2)).toBe(21)
  })

  it('fromGrid handles empty grid', () => {
    const bit = BinaryIndexedTree2D.fromGrid([])
    expect(bit.rowCount).toBe(0)
    expect(bit.colCount).toBe(0)
  })

  it('complex update and query operations', () => {
    const bit = new BinaryIndexedTree2D(4, 4)
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        bit.update(i, j, i + j)
      }
    }
    expect(bit.query(2, 2)).toBe(18)
    expect(bit.rangeQuery(1, 1, 2, 2)).toBe(12)
  })

  it('query single cell via rangeQuery', () => {
    const bit = new BinaryIndexedTree2D(3, 3)
    bit.update(1, 1, 7)
    expect(bit.rangeQuery(1, 1, 1, 1)).toBe(7)
  })

  it('handles negative deltas', () => {
    const bit = new BinaryIndexedTree2D(3, 3)
    bit.update(0, 0, 10)
    bit.update(0, 0, -3)
    expect(bit.query(0, 0)).toBe(7)
  })

  it('handles large grid', () => {
    const bit = new BinaryIndexedTree2D(10, 10)
    bit.update(5, 5, 100)
    expect(bit.query(5, 5)).toBe(100)
    expect(bit.query(4, 5)).toBe(0)
  })

  it('rangeQuery full grid', () => {
    const bit = new BinaryIndexedTree2D(3, 3)
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        bit.update(i, j, 1)
      }
    }
    expect(bit.rangeQuery(0, 0, 2, 2)).toBe(9)
  })

  it('multiple updates accumulate', () => {
    const bit = new BinaryIndexedTree2D(3, 3)
    bit.update(1, 1, 5)
    bit.update(1, 1, 3)
    expect(bit.query(1, 1)).toBe(8)
  })

  it('query on empty tree returns 0', () => {
    const bit = new BinaryIndexedTree2D(3, 3)
    expect(bit.query(2, 2)).toBe(0)
  })

  it('update then query returns updated value', () => {
    const bit = new BinaryIndexedTree2D(3, 3)
    bit.update(1, 1, 5)
    expect(bit.query(1, 1)).toBe(5)
  })
})