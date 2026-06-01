import { describe, expect, it } from 'vitest'
import { ParallelBinarySearch } from '../../src/utils/parallel-binary-search.js'

describe('ParallelBinarySearch', () => {
  it('finds threshold values', () => {
    const queries = [
      { lo: 0, hi: 100, check: (mid: number) => mid >= 42 },
      { lo: 0, hi: 100, check: (mid: number) => mid >= 7 },
    ]
    const results = ParallelBinarySearch.search(queries)
    expect(results[0]).toBe(42)
    expect(results[1]).toBe(7)
  })

  it('handles single query', () => {
    const queries = [
      { lo: 0, hi: 10, check: (mid: number) => mid >= 5 },
    ]
    const results = ParallelBinarySearch.search(queries)
    expect(results[0]).toBe(5)
  })

  it('handles all same threshold', () => {
    const queries = [
      { lo: 0, hi: 10, check: (mid: number) => mid >= 3 },
      { lo: 0, hi: 10, check: (mid: number) => mid >= 3 },
    ]
    const results = ParallelBinarySearch.search(queries)
    expect(results[0]).toBe(3)
    expect(results[1]).toBe(3)
  })

  it('handles never satisfied', () => {
    const queries = [
      { lo: 0, hi: 10, check: (_mid: number) => false },
    ]
    const results = ParallelBinarySearch.search(queries)
    expect(results[0]).toBe(-1)
  })

  it('handles always satisfied', () => {
    const queries = [
      { lo: 0, hi: 10, check: (_mid: number) => true },
    ]
    const results = ParallelBinarySearch.search(queries)
    expect(results[0]).toBe(0)
  })

  it('handles empty queries', () => {
    const results = ParallelBinarySearch.search([])
    expect(results).toEqual([])
  })

  it('finds square root threshold', () => {
    const queries = [
      { lo: 0, hi: 10000, check: (mid: number) => mid * mid >= 144 },
    ]
    const results = ParallelBinarySearch.search(queries)
    expect(results[0]).toBe(12)
  })

  it('handles large range', () => {
    const queries = [
      { lo: 0, hi: 1000000, check: (mid: number) => mid >= 500000 },
    ]
    const results = ParallelBinarySearch.search(queries)
    expect(results[0]).toBe(500000)
  })

  it('handles multiple different queries', () => {
    const queries = [
      { lo: 0, hi: 100, check: (mid: number) => mid >= 10 },
      { lo: 0, hi: 100, check: (mid: number) => mid >= 50 },
      { lo: 0, hi: 100, check: (mid: number) => mid >= 90 },
    ]
    const results = ParallelBinarySearch.search(queries)
    expect(results).toEqual([10, 50, 90])
  })

  it('handles boundary zero', () => {
    const queries = [
      { lo: 0, hi: 10, check: (mid: number) => mid >= 0 },
    ]
    const results = ParallelBinarySearch.search(queries)
    expect(results[0]).toBe(0)
  })

  it('finds exact threshold in large range', () => {
    const queries = [
      { lo: 0, hi: 10000, check: (mid: number) => mid >= 7777 },
    ]
    const results = ParallelBinarySearch.search(queries)
    expect(results[0]).toBe(7777)
  })

  it('handles boundary hi value', () => {
    const queries = [
      { lo: 0, hi: 100, check: (mid: number) => mid >= 100 },
    ]
    const results = ParallelBinarySearch.search(queries)
    expect(results[0]).toBe(100)
  })

  it('handles single element range', () => {
    const queries = [
      { lo: 5, hi: 5, check: (mid: number) => mid >= 5 },
    ]
    const results = ParallelBinarySearch.search(queries)
    expect(results[0]).toBe(5)
  })

  it('handles descending threshold', () => {
    const queries = [
      { lo: 0, hi: 100, check: (mid: number) => mid >= 75 },
    ]
    const results = ParallelBinarySearch.search(queries)
    expect(results[0]).toBe(75)
  })

  it('handles two queries with same threshold', () => {
    const queries = [
      { lo: 0, hi: 50, check: (mid: number) => mid >= 25 },
      { lo: 0, hi: 50, check: (mid: number) => mid >= 25 },
    ]
    const results = ParallelBinarySearch.search(queries)
    expect(results).toEqual([25, 25])
  })
})
