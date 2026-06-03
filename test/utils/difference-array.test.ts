import { describe, it, expect } from 'vitest'
import { DifferenceArray } from '../../src/utils/difference-array.js'

describe('DifferenceArray', () => {
  it('creates array with size', () => {
    const diff = new DifferenceArray(10)
    expect(diff.length).toBe(10)
    expect(diff.toArray()).toEqual(new Array(10).fill(0))
  })

  it('pointAdd adds value at index', () => {
    const diff = new DifferenceArray(5)
    diff.pointAdd(2, 10)
    const result = diff.toArray()
    expect(result[2]).toBe(10)
    expect(result[0]).toBe(0)
    expect(result[4]).toBe(0)
  })

  it('pointAdd accumulates at same index', () => {
    const diff = new DifferenceArray(5)
    diff.pointAdd(2, 10)
    diff.pointAdd(2, 5)
    const result = diff.toArray()
    expect(result[2]).toBe(15)
  })

  it('rangeAdd adds value to range', () => {
    const diff = new DifferenceArray(10)
    diff.rangeAdd(2, 5, 10)
    const result = diff.toArray()
    expect(result[0]).toBe(0)
    expect(result[1]).toBe(0)
    expect(result[2]).toBe(10)
    expect(result[3]).toBe(10)
    expect(result[4]).toBe(10)
    expect(result[5]).toBe(10)
    expect(result[6]).toBe(0)
  })

  it('rangeAdd handles single element range', () => {
    const diff = new DifferenceArray(10)
    diff.rangeAdd(3, 3, 7)
    const result = diff.toArray()
    expect(result[3]).toBe(7)
    expect(result[2]).toBe(0)
    expect(result[4]).toBe(0)
  })

  it('rangeAdd handles entire array', () => {
    const diff = new DifferenceArray(5)
    diff.rangeAdd(0, 4, 100)
    const result = diff.toArray()
    expect(result).toEqual([100, 100, 100, 100, 100])
  })

  it('rangeAdd accumulates overlapping ranges', () => {
    const diff = new DifferenceArray(10)
    diff.rangeAdd(1, 4, 5)
    diff.rangeAdd(3, 6, 10)
    const result = diff.toArray()
    expect(result[0]).toBe(0)
    expect(result[1]).toBe(5)
    expect(result[2]).toBe(5)
    expect(result[3]).toBe(15)
    expect(result[4]).toBe(15)
    expect(result[5]).toBe(10)
    expect(result[6]).toBe(10)
    expect(result[7]).toBe(0)
  })

  it('rangeAdd with negative value subtracts', () => {
    const diff = new DifferenceArray(10)
    diff.rangeAdd(2, 5, 10)
    diff.rangeAdd(3, 4, -5)
    const result = diff.toArray()
    expect(result[2]).toBe(10)
    expect(result[3]).toBe(5)
    expect(result[4]).toBe(5)
    expect(result[5]).toBe(10)
  })

  it('rangeAdd ignores invalid range with l > r', () => {
    const diff = new DifferenceArray(10)
    diff.rangeAdd(5, 3, 10)
    const result = diff.toArray()
    expect(result).toEqual(new Array(10).fill(0))
  })

  it('rangeAdd ignores out of bounds left', () => {
    const diff = new DifferenceArray(5)
    diff.rangeAdd(-2, 3, 10)
    const result = diff.toArray()
    expect(result).toEqual(new Array(5).fill(0))
  })

  it('rangeAdd ignores out of bounds right', () => {
    const diff = new DifferenceArray(5)
    diff.rangeAdd(1, 10, 10)
    const result = diff.toArray()
    expect(result).toEqual(new Array(5).fill(0))
  })

  it('get returns prefix sum at index', () => {
    const diff = new DifferenceArray(10)
    diff.rangeAdd(2, 5, 10)
    expect(diff.get(1)).toBe(0)
    expect(diff.get(2)).toBe(10)
    expect(diff.get(5)).toBe(10)
    expect(diff.get(6)).toBe(0)
  })

  it('get accumulates all changes', () => {
    const diff = new DifferenceArray(10)
    diff.rangeAdd(0, 2, 5)
    diff.rangeAdd(2, 4, 10)
    diff.rangeAdd(4, 6, 15)
    expect(diff.get(0)).toBe(5)
    expect(diff.get(1)).toBe(5)
    expect(diff.get(2)).toBe(15)
    expect(diff.get(3)).toBe(10)
    expect(diff.get(4)).toBe(25)
    expect(diff.get(5)).toBe(15)
    expect(diff.get(6)).toBe(15)
  })

  it('toArray returns accumulated array', () => {
    const diff = new DifferenceArray(5)
    diff.rangeAdd(1, 3, 5)
    diff.rangeAdd(2, 4, 10)
    const result = diff.toArray()
    expect(result).toEqual([0, 5, 15, 15, 10])
  })

  it('toArray returns new array each time', () => {
    const diff = new DifferenceArray(5)
    diff.pointAdd(0, 10)
    const result1 = diff.toArray()
    const result2 = diff.toArray()
    expect(result1).toEqual(result2)
    expect(result1).not.toBe(result2)
  })

  it('length returns array size', () => {
    const diff = new DifferenceArray(20)
    expect(diff.length).toBe(20)
  })

  it('handles multiple pointAdds', () => {
    const diff = new DifferenceArray(10)
    diff.pointAdd(0, 1)
    diff.pointAdd(5, 2)
    diff.pointAdd(9, 3)
    const result = diff.toArray()
    expect(result).toEqual([1, 0, 0, 0, 0, 2, 0, 0, 0, 3])
  })

  it('handles negative values in range', () => {
    const diff = new DifferenceArray(10)
    diff.rangeAdd(2, 5, 100)
    diff.rangeAdd(3, 4, -200)
    const result = diff.toArray()
    expect(result[2]).toBe(100)
    expect(result[3]).toBe(-100)
    expect(result[4]).toBe(-100)
    expect(result[5]).toBe(100)
  })

  it('handles zero value range', () => {
    const diff = new DifferenceArray(10)
    diff.rangeAdd(1, 4, 10)
    diff.rangeAdd(1, 4, 0)
    const result = diff.toArray()
    expect(result[1]).toBe(10)
    expect(result[2]).toBe(10)
    expect(result[3]).toBe(10)
    expect(result[4]).toBe(10)
  })

  it('single update on full range', () => {
    const da = new DifferenceArray(5)
    da.rangeAdd(0, 4, 7)
    const result = da.toArray()
    expect(result).toEqual([7, 7, 7, 7, 7])
  })

  it('rangeAdd 0 length does nothing', () => {
    const da = new DifferenceArray(5)
    da.rangeAdd(2, 1, 10)
    const result = da.toArray()
    expect(result).toEqual([0, 0, 0, 0, 0])
  })

  it('range add at start', () => {
    const da = new DifferenceArray(5)
    da.rangeAdd(0, 2, 7)
    const result = da.toArray()
    expect(result[0]).toBe(7)
    expect(result[2]).toBe(7)
    expect(result[3]).toBe(0)
  })

  it('rangeAdd with zero does nothing', () => {
    const da = new DifferenceArray(3)
    da.rangeAdd(0, 2, 0)
    expect(da.get(0)).toBe(0)
  })
})