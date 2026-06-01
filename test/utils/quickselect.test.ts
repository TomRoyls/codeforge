import { describe, expect, it } from 'vitest'
import { QuickSelect } from '../../src/utils/quickselect.js'

describe('QuickSelect', () => {
  it('finds minimum (k=0)', () => {
    expect(QuickSelect.select([3, 1, 4, 1, 5, 9], 0)).toBe(1)
  })

  it('finds maximum (k=n-1)', () => {
    expect(QuickSelect.select([3, 1, 4, 1, 5, 9], 5)).toBe(9)
  })

  it('finds median of odd-length array', () => {
    expect(QuickSelect.select([3, 1, 2], 1)).toBe(2)
  })

  it('finds kth element in sorted order', () => {
    const arr = [9, 8, 7, 6, 5, 4, 3, 2, 1]
    expect(QuickSelect.select(arr, 0)).toBe(1)
    expect(QuickSelect.select(arr, 4)).toBe(5)
    expect(QuickSelect.select(arr, 8)).toBe(9)
  })

  it('median of odd-length array', () => {
    expect(QuickSelect.median([3, 1, 2])).toBe(2)
  })

  it('median of even-length array', () => {
    expect(QuickSelect.median([4, 1, 3, 2])).toBe(2.5)
  })

  it('median throws for empty', () => {
    expect(() => QuickSelect.median([])).toThrow(RangeError)
  })

  it('kthSmallest is same as select', () => {
    const arr = [5, 3, 1, 4, 2]
    expect(QuickSelect.kthSmallest(arr, 2)).toBe(3)
  })

  it('kthLargest finds from end', () => {
    const arr = [5, 3, 1, 4, 2]
    expect(QuickSelect.kthLargest(arr, 0)).toBe(5)
    expect(QuickSelect.kthLargest(arr, 1)).toBe(4)
  })

  it('does not modify original array', () => {
    const arr = [3, 1, 2]
    QuickSelect.select(arr, 1)
    expect(arr).toEqual([3, 1, 2])
  })

  it('handles single element', () => {
    expect(QuickSelect.select([42], 0)).toBe(42)
  })

  it('handles two elements', () => {
    expect(QuickSelect.select([2, 1], 0)).toBe(1)
    expect(QuickSelect.select([2, 1], 1)).toBe(2)
  })

  it('throws for out of range k', () => {
    expect(() => QuickSelect.select([1, 2], -1)).toThrow(RangeError)
    expect(() => QuickSelect.select([1, 2], 2)).toThrow(RangeError)
  })

  it('handles duplicates', () => {
    expect(QuickSelect.select([3, 3, 3], 1)).toBe(3)
  })

  it('handles negative numbers', () => {
    expect(QuickSelect.select([-3, -1, -2], 0)).toBe(-3)
    expect(QuickSelect.select([-3, -1, -2], 2)).toBe(-1)
  })

  it('partitionAround splits around pivot', () => {
    const result = QuickSelect.partitionAround([5, 3, 1, 4, 2], 2)
    expect(result.left.every(x => x <= 3)).toBe(true)
  })

  it('select handles single element', () => {
    expect(QuickSelect.select([42], 0)).toBe(42)
  })

  it('select finds median', () => {
    expect(QuickSelect.select([3, 1, 4, 1, 5], 2)).toBe(3)
  })
})
