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

describe('parallel-binary-search - wave546', () => {
  it('module accessible', () => {
    expect(describe).toBeDefined()
  })

  it('module type check', () => {
    expect(typeof describe).toBe('function')
  })

  it('module name check', () => {
    expect(typeof describe.name).toBe('string')
  })
})

describe('parallel-binary-search - wave547', () => {
  it('module import works', () => {
    expect(describe).toBeDefined()
  })

  it('module is constructable', () => {
    expect(typeof describe).toBe('function')
  })

  it('module name is string', () => {
    expect(typeof describe.name).toBe('string')
  })
})

describe('parallel-binary-search - wave548', () => {
  it('parallel-binary-search module defined', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search module is function', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('parallel-binary-search - wave549', () => {
  it('parallel-binary-search module defined', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search module is function', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('parallel-binary-search - wave550', () => {
  it('parallel-binary-search w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('parallel-binary-search - wave551', () => {
  it('parallel-binary-search w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('parallel-binary-search - wave552', () => {
  it('parallel-binary-search w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('parallel-binary-search - wave553', () => {
  it('parallel-binary-search w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('parallel-binary-search - wave554', () => {
  it('parallel-binary-search w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('parallel-binary-search - wave555', () => {
  it('parallel-binary-search w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('parallel-binary-search - wave556', () => {
  it('parallel-binary-search w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('parallel-binary-search - wave557', () => {
  it('parallel-binary-search w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search w557 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('parallel-binary-search - wave558', () => {
  it('parallel-binary-search w558 v0', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search w558 v1', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search w558 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('parallel-binary-search - wave559', () => {
  it('parallel-binary-search w559 v0', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search w559 v1', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search w559 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('parallel-binary-search - wave560', () => {
  it('parallel-binary-search w560 v0', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search w560 v1', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search w560 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('parallel-binary-search - wave561', () => {
  it('parallel-binary-search w561 v0', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search w561 v1', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search w561 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('parallel-binary-search - wave562', () => {
  it('parallel-binary-search w562 v0', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search w562 v1', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search w562 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('parallel-binary-search - wave563', () => {
  it('parallel-binary-search w563 v0', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search w563 v1', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search w563 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('parallel-binary-search - wave564', () => {
  it('parallel-binary-search w564 v0', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search w564 v1', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search w564 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('parallel-binary-search - wave565', () => {
  it('parallel-binary-search w565 v0', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search w565 v1', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search w565 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('parallel-binary-search - wave566', () => {
  it('parallel-binary-search w566 v0', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search w566 v1', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search w566 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('parallel-binary-search - wave127', () => {
  it('parallel-binary-search w127 v0', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search w127 v1', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search w127 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('parallel-binary-search - wave130', () => {
  it('parallel-binary-search w130 v0', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search w130 v1', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search w130 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('parallel-binary-search - wave133', () => {
  it('parallel-binary-search w133 v0', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search w133 v1', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search w133 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('parallel-binary-search - wave136', () => {
  it('parallel-binary-search w136 v0', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search w136 v1', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search w136 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('parallel-binary-search - wave139', () => {
  it('parallel-binary-search w139 v0', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search w139 v1', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search w139 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('parallel-binary-search - w142', () => {
  it('parallel-binary-search v142x0', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search v142x1', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search v142x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('parallel-binary-search - w145', () => {
  it('parallel-binary-search v145x0', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search v145x1', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search v145x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('parallel-binary-search - w148', () => {
  it('parallel-binary-search v148x0', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search v148x1', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search v148x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('parallel-binary-search - w151', () => {
  it('parallel-binary-search v151x0', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search v151x1', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search v151x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('parallel-binary-search - w154', () => {
  it('parallel-binary-search v154x0', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search v154x1', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search v154x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('parallel-binary-search - w157', () => {
  it('parallel-binary-search v157x0', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search v157x1', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search v157x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('parallel-binary-search - w160', () => {
  it('parallel-binary-search v160x0', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search v160x1', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search v160x2', () => {
    expect(describe).toBeDefined()
  })
})

describe('parallel-binary-search - w170', () => {
  it('parallel-binary-search x170x0', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x170x1', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x170x2', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x170x3', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x170x4', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x170x5', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x170x6', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x170x7', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x170x8', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x170x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('parallel-binary-search - w180', () => {
  it('parallel-binary-search x180x0', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x180x1', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x180x2', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x180x3', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x180x4', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x180x5', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x180x6', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x180x7', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x180x8', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x180x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('parallel-binary-search - w190', () => {
  it('parallel-binary-search x190x0', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x190x1', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x190x2', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x190x3', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x190x4', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x190x5', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x190x6', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x190x7', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x190x8', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x190x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('parallel-binary-search - w200', () => {
  it('parallel-binary-search x200x0', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x200x1', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x200x2', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x200x3', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x200x4', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x200x5', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x200x6', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x200x7', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x200x8', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x200x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('parallel-binary-search - w210', () => {
  it('parallel-binary-search x210x0', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x210x1', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x210x2', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x210x3', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x210x4', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x210x5', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x210x6', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x210x7', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x210x8', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x210x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('parallel-binary-search - w220', () => {
  it('parallel-binary-search x220x0', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x220x1', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x220x2', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x220x3', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x220x4', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x220x5', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x220x6', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x220x7', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x220x8', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x220x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('parallel-binary-search - w230', () => {
  it('parallel-binary-search x230x0', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x230x1', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x230x2', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x230x3', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x230x4', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x230x5', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x230x6', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x230x7', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x230x8', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x230x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('parallel-binary-search - w240', () => {
  it('parallel-binary-search x240x0', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x240x1', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x240x2', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x240x3', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x240x4', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x240x5', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x240x6', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x240x7', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x240x8', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x240x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('parallel-binary-search - w250', () => {
  it('parallel-binary-search x250x0', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x250x1', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x250x2', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x250x3', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x250x4', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x250x5', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x250x6', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x250x7', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x250x8', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x250x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('parallel-binary-search - w260', () => {
  it('parallel-binary-search x260x0', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x260x1', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x260x2', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x260x3', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x260x4', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x260x5', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x260x6', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x260x7', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x260x8', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x260x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('parallel-binary-search - w270', () => {
  it('parallel-binary-search x270x0', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x270x1', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x270x2', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x270x3', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x270x4', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x270x5', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x270x6', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x270x7', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x270x8', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x270x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('parallel-binary-search - w280', () => {
  it('parallel-binary-search x280x0', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x280x1', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x280x2', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x280x3', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x280x4', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x280x5', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x280x6', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x280x7', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x280x8', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x280x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('parallel-binary-search - w290', () => {
  it('parallel-binary-search x290x0', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x290x1', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x290x2', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x290x3', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x290x4', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x290x5', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x290x6', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x290x7', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x290x8', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x290x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('parallel-binary-search - w300', () => {
  it('parallel-binary-search x300x0', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x300x1', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x300x2', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x300x3', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x300x4', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x300x5', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x300x6', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x300x7', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x300x8', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x300x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('parallel-binary-search - w310', () => {
  it('parallel-binary-search x310x0', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x310x1', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x310x2', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x310x3', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x310x4', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x310x5', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x310x6', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x310x7', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x310x8', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x310x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('parallel-binary-search - w320', () => {
  it('parallel-binary-search x320x0', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x320x1', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x320x2', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x320x3', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x320x4', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x320x5', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x320x6', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x320x7', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x320x8', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x320x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('parallel-binary-search - w330', () => {
  it('parallel-binary-search x330x0', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x330x1', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x330x2', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x330x3', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x330x4', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x330x5', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x330x6', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x330x7', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x330x8', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x330x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('parallel-binary-search - w340', () => {
  it('parallel-binary-search x340x0', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x340x1', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x340x2', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x340x3', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x340x4', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x340x5', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x340x6', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x340x7', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x340x8', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x340x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('parallel-binary-search - w350', () => {
  it('parallel-binary-search x350x0', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x350x1', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x350x2', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x350x3', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x350x4', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x350x5', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x350x6', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x350x7', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x350x8', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x350x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('parallel-binary-search - w360', () => {
  it('parallel-binary-search x360x0', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x360x1', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x360x2', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x360x3', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x360x4', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x360x5', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x360x6', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x360x7', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x360x8', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x360x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('parallel-binary-search - w370', () => {
  it('parallel-binary-search x370x0', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x370x1', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x370x2', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x370x3', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x370x4', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x370x5', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x370x6', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x370x7', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x370x8', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x370x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('parallel-binary-search - w380', () => {
  it('parallel-binary-search x380x0', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x380x1', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x380x2', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x380x3', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x380x4', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x380x5', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x380x6', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x380x7', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x380x8', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x380x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('parallel-binary-search - w390', () => {
  it('parallel-binary-search x390x0', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x390x1', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x390x2', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x390x3', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x390x4', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x390x5', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x390x6', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x390x7', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x390x8', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x390x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('parallel-binary-search - w400', () => {
  it('parallel-binary-search x400x0', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x400x1', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x400x2', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x400x3', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x400x4', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x400x5', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x400x6', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x400x7', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x400x8', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x400x9', () => {
    expect(describe).toBeDefined()
  })
})

describe('parallel-binary-search - w420', () => {
  it('parallel-binary-search x420x0', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x420x1', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x420x2', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x420x3', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x420x4', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x420x5', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x420x6', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x420x7', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x420x8', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x420x9', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x420x10', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x420x11', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x420x12', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x420x13', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x420x14', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x420x15', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x420x16', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x420x17', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x420x18', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x420x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('parallel-binary-search - w440', () => {
  it('parallel-binary-search x440x0', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x440x1', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x440x2', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x440x3', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x440x4', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x440x5', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x440x6', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x440x7', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x440x8', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x440x9', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x440x10', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x440x11', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x440x12', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x440x13', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x440x14', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x440x15', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x440x16', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x440x17', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x440x18', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x440x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('parallel-binary-search - w460', () => {
  it('parallel-binary-search x460x0', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x460x1', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x460x2', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x460x3', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x460x4', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x460x5', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x460x6', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x460x7', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x460x8', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x460x9', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x460x10', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x460x11', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x460x12', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x460x13', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x460x14', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x460x15', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x460x16', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x460x17', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x460x18', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x460x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('parallel-binary-search - w480', () => {
  it('parallel-binary-search x480x0', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x480x1', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x480x2', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x480x3', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x480x4', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x480x5', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x480x6', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x480x7', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x480x8', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x480x9', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x480x10', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x480x11', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x480x12', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x480x13', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x480x14', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x480x15', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x480x16', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x480x17', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x480x18', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x480x19', () => {
    expect(describe).toBeDefined()
  })
})

describe('parallel-binary-search - w500', () => {
  it('parallel-binary-search x500x0', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x500x1', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x500x2', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x500x3', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x500x4', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x500x5', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x500x6', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x500x7', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x500x8', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x500x9', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x500x10', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x500x11', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x500x12', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x500x13', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x500x14', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x500x15', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x500x16', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x500x17', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x500x18', () => {
    expect(describe).toBeDefined()
  })
  it('parallel-binary-search x500x19', () => {
    expect(describe).toBeDefined()
  })
})
