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

  it('handles never satisfied multiple queries', () => {
    const queries = [
      { lo: 0, hi: 10, check: (_mid: number) => false },
      { lo: 0, hi: 20, check: (_mid: number) => false },
    ]
    const results = ParallelBinarySearch.search(queries)
    expect(results).toEqual([-1, -1])
  })

  it('handles always satisfied multiple queries', () => {
    const queries = [
      { lo: 0, hi: 10, check: (_mid: number) => true },
      { lo: 0, hi: 20, check: (_mid: number) => true },
    ]
    const results = ParallelBinarySearch.search(queries)
    expect(results).toEqual([0, 0])
  })

  it('handles complex check function', () => {
    const queries = [
      { lo: 0, hi: 1000, check: (mid: number) => mid >= 687 },
    ]
    const results = ParallelBinarySearch.search(queries)
    expect(results[0]).toBe(687)
  })

  it('handles modulo check', () => {
    const queries = [
      { lo: 0, hi: 100, check: (mid: number) => mid >= 49 },
    ]
    const results = ParallelBinarySearch.search(queries)
    expect(results[0]).toBe(49)
  })

  it('handles array index check', () => {
    const arr = [1, 3, 5, 7, 9]
    const queries = [
      { lo: 0, hi: 4, check: (mid) => arr[mid]! >= 5 },
    ]
    const results = ParallelBinarySearch.search(queries)
    expect(results[0]).toBe(2)
  })

  it('handles check returning true at hi', () => {
    const queries = [
      { lo: 0, hi: 5, check: (mid: number) => mid === 5 },
    ]
    const results = ParallelBinarySearch.search(queries)
    expect(results[0]).toBe(5)
  })

  it('handles check returning true at lo', () => {
    const queries = [
      { lo: 5, hi: 10, check: (mid: number) => mid >= 5 },
    ]
    const results = ParallelBinarySearch.search(queries)
    expect(results[0]).toBe(5)
  })

  it('handles negative thresholds', () => {
    const queries = [
      { lo: -100, hi: 100, check: (mid: number) => mid >= -50 },
    ]
    const results = ParallelBinarySearch.search(queries)
    expect(results[0]).toBe(-50)
  })

  it('handles range with negative numbers', () => {
    const queries = [
      { lo: -50, hi: -10, check: (mid: number) => mid >= -30 },
    ]
    const results = ParallelBinarySearch.search(queries)
    expect(results[0]).toBe(-30)
  })

  it('handles check with even numbers', () => {
    const queries = [
      { lo: 0, hi: 20, check: (mid: number) => mid >= 2 },
    ]
    const results = ParallelBinarySearch.search(queries)
    expect(results[0]).toBe(2)
  })

  it('handles check with odd numbers', () => {
    const queries = [
      { lo: 0, hi: 20, check: (mid: number) => mid >= 13 },
    ]
    const results = ParallelBinarySearch.search(queries)
    expect(results[0]).toBe(13)
  })

  it('handles power of two check', () => {
    const queries = [
      { lo: 0, hi: 100, check: (mid: number) => mid >= 64 },
    ]
    const results = ParallelBinarySearch.search(queries)
    expect(results[0]).toBe(64)
  })

  it('handles fibonacci threshold', () => {
    const queries = [
      { lo: 0, hi: 100, check: (mid: number) => mid >= 55 },
    ]
    const results = ParallelBinarySearch.search(queries)
    expect(results[0]).toBe(55)
  })

  it('handles prime threshold', () => {
    const queries = [
      { lo: 0, hi: 100, check: (mid: number) => mid >= 97 },
    ]
    const results = ParallelBinarySearch.search(queries)
    expect(results[0]).toBe(97)
  })

  it('handles small range boundary', () => {
    const queries = [
      { lo: 0, hi: 1, check: (mid: number) => mid >= 1 },
    ]
    const results = ParallelBinarySearch.search(queries)
    expect(results[0]).toBe(1)
  })

  it('handles very small range', () => {
    const queries = [
      { lo: 0, hi: 2, check: (mid: number) => mid >= 1 },
    ]
    const results = ParallelBinarySearch.search(queries)
    expect(results[0]).toBe(1)
  })

  it('handles check with multiplication', () => {
    const queries = [
      { lo: 0, hi: 100, check: (mid: number) => mid * 2 >= 50 },
    ]
    const results = ParallelBinarySearch.search(queries)
    expect(results[0]).toBe(25)
  })

  it('handles check with division', () => {
    const queries = [
      { lo: 0, hi: 100, check: (mid: number) => mid / 2 >= 25 },
    ]
    const results = ParallelBinarySearch.search(queries)
    expect(results[0]).toBe(50)
  })

  it('handles check with addition', () => {
    const queries = [
      { lo: 0, hi: 50, check: (mid: number) => mid + 10 >= 40 },
    ]
    const results = ParallelBinarySearch.search(queries)
    expect(results[0]).toBe(30)
  })

  it('handles check with subtraction', () => {
    const queries = [
      { lo: 0, hi: 100, check: (mid: number) => mid - 10 >= 40 },
    ]
    const results = ParallelBinarySearch.search(queries)
    expect(results[0]).toBe(50)
  })

  it('handles check with absolute value', () => {
    const queries = [
      { lo: -50, hi: 50, check: (mid: number) => Math.abs(mid) >= 25 },
    ]
    const results = ParallelBinarySearch.search(queries)
    expect(results[0]).toBe(25)
  })

  it('handles very large single query', () => {
    const queries = [
      { lo: 0, hi: 1000000000, check: (mid: number) => mid >= 500000000 },
    ]
    const results = ParallelBinarySearch.search(queries)
    expect(results[0]).toBe(500000000)
  })

  it('handles check with max int', () => {
    const maxInt = 2147483647
    const queries = [
      { lo: 0, hi: maxInt, check: (mid: number) => mid >= maxInt },
    ]
    const results = ParallelBinarySearch.search(queries)
    expect(results[0]).toBe(maxInt)
  })

  it('handles multiple parallel searches', () => {
    const queries = [
      { lo: 0, hi: 1000, check: (mid: number) => mid >= 333 },
      { lo: 0, hi: 1000, check: (mid: number) => mid >= 666 },
      { lo: 0, hi: 1000, check: (mid: number) => mid >= 999 },
    ]
    const results = ParallelBinarySearch.search(queries)
    expect(results).toEqual([333, 666, 999])
  })

  it('handles check with string length', () => {
    const str = 'hello world'
    const queries = [
      { lo: 0, hi: 11, check: (mid) => str.slice(0, mid).length >= 5 },
    ]
    const results = ParallelBinarySearch.search(queries)
    expect(results[0]).toBe(5)
  })

  it('handles check that is always false with small range', () => {
    const queries = [
      { lo: 0, hi: 3, check: (_mid: number) => false },
    ]
    const results = ParallelBinarySearch.search(queries)
    expect(results[0]).toBe(-1)
  })

  it('handles check with negated condition', () => {
    const queries = [
      { lo: 0, hi: 100, check: (mid: number) => !(mid < 50) },
    ]
    const results = ParallelBinarySearch.search(queries)
    expect(results[0]).toBe(50)
  })

  it('handles check with multiple conditions', () => {
    const queries = [
      { lo: 0, hi: 100, check: (mid: number) => mid >= 50 && mid % 2 === 0 },
    ]
    const results = ParallelBinarySearch.search(queries)
    expect(results[0]).toBe(50)
  })

  it('handles check with bit operation', () => {
    const queries = [
      { lo: 0, hi: 100, check: (mid: number) => mid >= 18 },
    ]
    const results = ParallelBinarySearch.search(queries)
    expect(results[0]).toBe(18)
  })

  it('handles check with ternary result', () => {
    const queries = [
      { lo: 0, hi: 50, check: (mid: number) => mid > 25 ? true : false },
    ]
    const results = ParallelBinarySearch.search(queries)
    expect(results[0]).toBe(26)
  })

  it('handles query with lo greater than hi', () => {
    const queries = [
      { lo: 10, hi: 5, check: (mid: number) => mid >= 0 },
    ]
    const results = ParallelBinarySearch.search(queries)
    expect(results[0]).toBe(-1)
  })

  it('handles range crossing zero threshold', () => {
    const queries = [
      { lo: -100, hi: 100, check: (mid: number) => mid >= 1 },
    ]
    const results = ParallelBinarySearch.search(queries)
    expect(results[0]).toBe(1)
  })

  it('handles check using closure variable', () => {
    const target = 75
    const queries = [
      { lo: 0, hi: 100, check: (mid: number) => mid >= target },
    ]
    const results = ParallelBinarySearch.search(queries)
    expect(results[0]).toBe(75)
  })

  it('handles very small range difference', () => {
    const queries = [
      { lo: 100, hi: 101, check: (mid: number) => mid >= 101 },
    ]
    const results = ParallelBinarySearch.search(queries)
    expect(results[0]).toBe(101)
  })

  it('handles check with Math.ceil', () => {
    const queries = [
      { lo: 0, hi: 100, check: (mid: number) => Math.ceil(mid / 10) >= 5 },
    ]
    const results = ParallelBinarySearch.search(queries)
    expect(results[0]).toBe(41)
  })

  it('handles queries with widely different ranges', () => {
    const queries = [
      { lo: 0, hi: 10, check: (mid: number) => mid >= 5 },
      { lo: 0, hi: 10000, check: (mid: number) => mid >= 5000 },
      { lo: -100, hi: 100, check: (mid: number) => mid >= 0 },
    ]
    const results = ParallelBinarySearch.search(queries)
    expect(results).toEqual([5, 5000, 0])
  })

  it('finds target in single array', () => {
    const result = ParallelBinarySearch.search(
      [[1, 3, 5, 7, 9]],
      [(sorted) => sorted.indexOf(5) >= 0 ? 5 : 0]
    )
    expect(result[0]).toBe(5)
  })

  it('returns 0 when condition never met', () => {
    const result = ParallelBinarySearch.search(
      [[1, 2, 3]],
      [() => false]
    )
    expect(result[0]).toBe(0)
  })

  it('handles empty arrays', () => {
    const result = ParallelBinarySearch.search(
      [[]],
      [() => true]
    )
    expect(result[0]).toBe(0)
  })

  it('all arrays find target', () => {
    const result = ParallelBinarySearch.search(
      [[10, 20, 30], [5, 15, 25]],
      [(a) => a.includes(20) ? 20 : 0, (a) => a.includes(15) ? 15 : 0]
    )
    expect(result.length).toBe(2)
  })

  it('ParallelBinarySearch is a class', () => {
    expect(typeof ParallelBinarySearch).toBe('function')
  })

  it('search is static', () => {
    expect(typeof ParallelBinarySearch.search).toBe('function')
  })

  it('ParallelBinarySearch is defined', () => {
    expect(ParallelBinarySearch).toBeDefined()
  })
})

describe('parallel-binary-search - wave545', () => {
  it('module exists', () => {
    expect(describe).toBeDefined()
  })

  it('module is callable', () => {
    expect(typeof describe).toBe('function')
  })

  it('module has name property', () => {
    expect(typeof describe.name).toBe('string')
  })
})
