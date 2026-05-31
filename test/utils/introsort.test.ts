import { describe, expect, it } from 'vitest'
import { Introsort } from '../../src/utils/introsort.js'

describe('Introsort', () => {
  it('sorts numbers ascending', () => {
    expect(Introsort.sort([3, 1, 2])).toEqual([1, 2, 3])
  })

  it('sorts empty array', () => {
    expect(Introsort.sort([])).toEqual([])
  })

  it('sorts single element', () => {
    expect(Introsort.sort([5])).toEqual([5])
  })

  it('sorts already sorted', () => {
    expect(Introsort.sort([1, 2, 3])).toEqual([1, 2, 3])
  })

  it('sorts reverse sorted', () => {
    expect(Introsort.sort([3, 2, 1])).toEqual([1, 2, 3])
  })

  it('sorts with duplicates', () => {
    expect(Introsort.sort([2, 1, 2, 1])).toEqual([1, 1, 2, 2])
  })

  it('sorts large array', () => {
    const arr = Array.from({ length: 1000 }, () => Math.random())
    const sorted = Introsort.sort([...arr], (a, b) => a - b)
    for (let i = 1; i < sorted.length; i++) expect(sorted[i]!).toBeGreaterThanOrEqual(sorted[i - 1]!)
  })

  it('uses custom comparator', () => {
    const arr = [3, 1, 2]
    expect(Introsort.sort(arr, (a, b) => b - a)).toEqual([3, 2, 1])
  })

  it('sorts strings', () => {
    expect(Introsort.sort(['c', 'a', 'b'])).toEqual(['a', 'b', 'c'])
  })

  it('handles all same elements', () => {
    expect(Introsort.sort([5, 5, 5, 5])).toEqual([5, 5, 5, 5])
  })

  it('sorts negative numbers', () => {
    expect(Introsort.sort([-3, -1, -2, 0], (a, b) => a - b)).toEqual([-3, -2, -1, 0])
  })

  it('handles two elements', () => {
    expect(Introsort.sort([2, 1])).toEqual([1, 2])
  })

  it('returns new array', () => {
    const arr = [3, 1, 2]
    const result = Introsort.sort(arr)
    expect(result).toEqual([1, 2, 3])
  })

  it('handles already sorted array', () => {
    const arr = [1, 2, 3, 4, 5]
    const result = Introsort.sort(arr)
    expect(result).toEqual([1, 2, 3, 4, 5])
  })
})
