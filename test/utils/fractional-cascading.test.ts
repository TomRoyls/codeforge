import { describe, it, expect } from 'vitest'
import { FractionalCascading } from '../../src/utils/fractional-cascading.js'

describe('FractionalCascading', () => {
  it('returns empty array for no lists', () => {
    const fc = new FractionalCascading([])
    expect(fc.listCount).toBe(0)
    expect(fc.search(5)).toEqual([])
  })

  it('returns -1 for missing value in single list', () => {
    const fc = new FractionalCascading([[1, 3, 5]])
    const result = fc.search(4)
    expect(result).toEqual([-1])
  })

  it('finds value in single list', () => {
    const fc = new FractionalCascading([[1, 3, 5]])
    const result = fc.search(3)
    expect(result).toEqual([1])
  })

  it('finds value in first of multiple lists', () => {
    const fc = new FractionalCascading([
      [1, 3, 5],
      [2, 4, 6],
      [0, 2, 4, 6, 8]
    ])
    const result = fc.search(3)
    expect(result[0]).toBe(1)
  })

  it('finds value in all lists', () => {
    const fc = new FractionalCascading([
      [1, 3, 5, 7],
      [2, 4, 6, 8],
      [0, 2, 4, 6, 8, 10]
    ])
    const result = fc.search(4)
    expect(result).toEqual([-1, 1, 2])
  })

  it('handles unsorted input by sorting', () => {
    const fc = new FractionalCascading([[5, 1, 3], [6, 2, 4]])
    expect(fc.getList(0)).toEqual([1, 3, 5])
    expect(fc.getList(1)).toEqual([2, 4, 6])
  })

  it('returns -1 for all when value not found', () => {
    const fc = new FractionalCascading([
      [1, 3, 5],
      [2, 4, 6],
      [0, 2, 4, 6, 8]
    ])
    const result = fc.search(99)
    expect(result).toEqual([-1, -1, -1])
  })

  it('gets list count', () => {
    const fc = new FractionalCascading([
      [1, 2],
      [3, 4],
      [5, 6]
    ])
    expect(fc.listCount).toBe(3)
  })

  it('gets list by index', () => {
    const fc = new FractionalCascading([[1, 2, 3], [4, 5, 6]])
    expect(fc.getList(0)).toEqual([1, 2, 3])
    expect(fc.getList(1)).toEqual([4, 5, 6])
  })

  it('returns empty array for invalid list index', () => {
    const fc = new FractionalCascading([[1, 2, 3]])
    expect(fc.getList(99)).toEqual([])
  })

  it('finds first element in list', () => {
    const fc = new FractionalCascading([[1, 2, 3], [0, 1, 2]])
    const result = fc.search(1)
    expect(result[0]).toBe(0)
    expect(result[1]).toBe(1)
  })

  it('finds last element in list', () => {
    const fc = new FractionalCascading([[1, 2, 3], [2, 4, 6]])
    const result = fc.search(3)
    expect(result[0]).toBe(2)
    expect(result[1]).toBe(-1)
  })

  it('handles empty list in input', () => {
    const fc = new FractionalCascading([[], [1, 2, 3], []])
    expect(fc.search(2)).toEqual([-1, 1, -1])
  })

  it('handles duplicate values in lists', () => {
    const fc = new FractionalCascading([[1, 2, 2, 3], [2, 2, 4]])
    const result = fc.search(2)
    expect(result[0]).toBeGreaterThanOrEqual(1)
    expect(result[1]).toBeGreaterThanOrEqual(0)
  })

  it('searches negative numbers', () => {
    const fc = new FractionalCascading([[-5, -3, -1], [-4, -2, 0]])
    const result = fc.search(-3)
    expect(result[0]).toBe(1)
    expect(result[1]).toBe(-1)
  })

  it('handles single-element lists', () => {
    const fc = new FractionalCascading([[5], [5], [5]])
    expect(fc.search(5)).toEqual([0, 0, 0])
    expect(fc.search(3)).toEqual([-1, -1, -1])
  })

  it('handles large lists', () => {
    const list = Array.from({ length: 1000 }, (_, i) => i * 2)
    const fc = new FractionalCascading([list])
    expect(fc.search(100)).toEqual([50])
    expect(fc.search(99)).toEqual([-1])
  })

  it('search returns correct index for first element', () => {
    const fc = new FractionalCascading([[10, 20, 30]])
    expect(fc.search(10)).toEqual([0])
  })

  it('search for value not in lists', () => {
    const fc = new FractionalCascading([[10, 20, 30]])
    expect(fc.search(15)).toEqual([-1])
  })

  it('search for exact match', () => {
    const fc = new FractionalCascading([[5, 10, 15]])
    expect(fc.search(10)).toEqual([1])
  })
})