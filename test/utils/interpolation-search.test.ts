import { describe, expect, it } from 'vitest'
import { InterpolationSearch } from '../../src/utils/interpolation-search.js'

describe('InterpolationSearch', () => {
  const sorted = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19]

  it('finds existing element', () => {
    expect(InterpolationSearch.search(sorted, 7)).toBe(3)
    expect(InterpolationSearch.search(sorted, 1)).toBe(0)
    expect(InterpolationSearch.search(sorted, 19)).toBe(9)
  })

  it('returns -1 for missing element', () => {
    expect(InterpolationSearch.search(sorted, 8)).toBe(-1)
    expect(InterpolationSearch.search(sorted, 0)).toBe(-1)
    expect(InterpolationSearch.search(sorted, 20)).toBe(-1)
  })

  it('handles empty array', () => {
    expect(InterpolationSearch.search([], 5)).toBe(-1)
  })

  it('handles single element', () => {
    expect(InterpolationSearch.search([5], 5)).toBe(0)
    expect(InterpolationSearch.search([5], 3)).toBe(-1)
  })

  it('handles two elements', () => {
    expect(InterpolationSearch.search([1, 10], 1)).toBe(0)
    expect(InterpolationSearch.search([1, 10], 10)).toBe(1)
    expect(InterpolationSearch.search([1, 10], 5)).toBe(-1)
  })

  it('contains works', () => {
    expect(InterpolationSearch.contains(sorted, 7)).toBe(true)
    expect(InterpolationSearch.contains(sorted, 8)).toBe(false)
  })

  it('findFirst finds first occurrence', () => {
    const arr = [1, 2, 2, 2, 3, 4]
    expect(InterpolationSearch.findFirst(arr, 2)).toBe(1)
  })

  it('findLast finds last occurrence', () => {
    const arr = [1, 2, 2, 2, 3, 4]
    expect(InterpolationSearch.findLast(arr, 2)).toBe(3)
  })

  it('rangeSearch returns range', () => {
    const arr = [1, 2, 2, 2, 3, 4]
    expect(InterpolationSearch.rangeSearch(arr, 2)).toEqual([1, 3])
  })

  it('rangeSearch returns null for missing', () => {
    expect(InterpolationSearch.rangeSearch(sorted, 8)).toBeNull()
  })

  it('closest returns nearest index', () => {
    expect(InterpolationSearch.closest(sorted, 8)).toBe(3)
    expect(InterpolationSearch.closest(sorted, 0)).toBe(0)
    expect(InterpolationSearch.closest(sorted, 20)).toBe(9)
  })

  it('closest returns exact match index', () => {
    expect(InterpolationSearch.closest(sorted, 9)).toBe(4)
  })

  it('handles uniform array', () => {
    const arr = [5, 5, 5, 5, 5]
    expect(InterpolationSearch.search(arr, 5)).toBe(0)
    expect(InterpolationSearch.search(arr, 3)).toBe(-1)
  })

  it('handles negative numbers', () => {
    const arr = [-10, -5, 0, 5, 10]
    expect(InterpolationSearch.search(arr, -5)).toBe(1)
    expect(InterpolationSearch.search(arr, 0)).toBe(2)
  })

  it('handles large array', () => {
    const arr = Array.from({ length: 1000 }, (_, i) => i * 2)
    expect(InterpolationSearch.search(arr, 500)).toBe(250)
    expect(InterpolationSearch.search(arr, 501)).toBe(-1)
  })
})
