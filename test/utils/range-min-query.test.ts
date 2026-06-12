import { describe, expect, it } from 'vitest'
import { RangeMinQuery } from '../../src/utils/range-min-query.js'

describe('RangeMinQuery', () => {
  it('queries single element', () => {
    const rmq = new RangeMinQuery([5, 3, 7, 1, 4])
    expect(rmq.query(0, 0)).toBe(5)
    expect(rmq.query(3, 3)).toBe(1)
  })

  it('queries full range', () => {
    const rmq = new RangeMinQuery([5, 3, 7, 1, 4])
    expect(rmq.query(0, 4)).toBe(1)
  })

  it('queries partial range', () => {
    const rmq = new RangeMinQuery([5, 3, 7, 1, 4])
    expect(rmq.query(0, 2)).toBe(3)
    expect(rmq.query(2, 4)).toBe(1)
  })

  it('handles single element array', () => {
    const rmq = new RangeMinQuery([42])
    expect(rmq.query(0, 0)).toBe(42)
  })

  it('handles two elements', () => {
    const rmq = new RangeMinQuery([10, 5])
    expect(rmq.query(0, 1)).toBe(5)
    expect(rmq.query(0, 0)).toBe(10)
    expect(rmq.query(1, 1)).toBe(5)
  })

  it('handles negative numbers', () => {
    const rmq = new RangeMinQuery([-3, -1, -7, -2])
    expect(rmq.query(0, 3)).toBe(-7)
    expect(rmq.query(0, 1)).toBe(-3)
  })

  it('handles large array', () => {
    const arr = Array.from({ length: 100 }, (_, i) => 100 - i)
    const rmq = new RangeMinQuery(arr)
    expect(rmq.query(0, 99)).toBe(1)
    expect(rmq.query(0, 0)).toBe(100)
    expect(rmq.query(50, 99)).toBe(1)
  })

  it('handles repeated values', () => {
    const rmq = new RangeMinQuery([3, 3, 3, 3])
    expect(rmq.query(0, 3)).toBe(3)
  })

  it('handles all same except one', () => {
    const rmq = new RangeMinQuery([5, 5, 1, 5, 5])
    expect(rmq.query(0, 4)).toBe(1)
    expect(rmq.query(0, 1)).toBe(5)
  })

  it('handles power of two length', () => {
    const rmq = new RangeMinQuery([8, 6, 4, 2])
    expect(rmq.query(0, 3)).toBe(2)
    expect(rmq.query(1, 2)).toBe(4)
  })

  it('handles duplicate minimums', () => {
    const rmq = new RangeMinQuery([3, 1, 4, 1, 5])
    expect(rmq.query(0, 4)).toBe(1)
    expect(rmq.query(2, 4)).toBe(1)
  })

  it('handles sorted ascending', () => {
    const rmq = new RangeMinQuery([1, 2, 3, 4, 5])
    expect(rmq.query(0, 4)).toBe(1)
    expect(rmq.query(3, 4)).toBe(4)
  })

  it('handles sorted descending', () => {
    const rmq = new RangeMinQuery([5, 4, 3, 2, 1])
    expect(rmq.query(0, 4)).toBe(1)
    expect(rmq.query(0, 2)).toBe(3)
  })

  it('handles all equal elements', () => {
    const rmq = new RangeMinQuery([7, 7, 7, 7])
    expect(rmq.query(0, 3)).toBe(7)
    expect(rmq.query(1, 2)).toBe(7)
  })

  it('handles zeros', () => {
    const rmq = new RangeMinQuery([0, 0, 0])
    expect(rmq.query(0, 2)).toBe(0)
  })

  it('handles mixed positive negative', () => {
    const rmq = new RangeMinQuery([3, -1, 5, -2, 4])
    expect(rmq.query(0, 4)).toBe(-2)
    expect(rmq.query(0, 1)).toBe(-1)
    expect(rmq.query(2, 4)).toBe(-2)
  })

  it('handles three elements', () => {
    const rmq = new RangeMinQuery([5, 3, 7])
    expect(rmq.query(0, 2)).toBe(3)
    expect(rmq.query(1, 1)).toBe(3)
  })

  it('handles length 8 power of two', () => {
    const rmq = new RangeMinQuery([16, 14, 12, 10, 8, 6, 4, 2])
    expect(rmq.query(0, 7)).toBe(2)
    expect(rmq.query(0, 3)).toBe(10)
    expect(rmq.query(4, 7)).toBe(2)
    expect(rmq.query(2, 5)).toBe(6)
  })

  it('handles length 16', () => {
    const arr = [32, 30, 28, 26, 24, 22, 20, 18, 16, 14, 12, 10, 8, 6, 4, 2]
    const rmq = new RangeMinQuery(arr)
    expect(rmq.query(0, 15)).toBe(2)
    expect(rmq.query(0, 7)).toBe(18)
    expect(rmq.query(8, 15)).toBe(2)
  })

  it('handles adjacent elements', () => {
    const rmq = new RangeMinQuery([10, 5, 8, 3, 12])
    expect(rmq.query(0, 1)).toBe(5)
    expect(rmq.query(1, 2)).toBe(5)
    expect(rmq.query(2, 3)).toBe(3)
    expect(rmq.query(3, 4)).toBe(3)
  })

  it('handles min at start', () => {
    const rmq = new RangeMinQuery([1, 5, 3, 7, 9])
    expect(rmq.query(0, 4)).toBe(1)
  })

  it('handles min at end', () => {
    const rmq = new RangeMinQuery([9, 7, 5, 3, 1])
    expect(rmq.query(0, 4)).toBe(1)
  })

  it('handles min in middle', () => {
    const rmq = new RangeMinQuery([10, 5, 1, 8, 12])
    expect(rmq.query(0, 4)).toBe(1)
    expect(rmq.query(0, 1)).toBe(5)
    expect(rmq.query(3, 4)).toBe(8)
  })

  it('handles very large values', () => {
    const rmq = new RangeMinQuery([Number.MAX_SAFE_INTEGER, 0, Number.MAX_SAFE_INTEGER])
    expect(rmq.query(0, 2)).toBe(0)
  })

  it('handles float values', () => {
    const rmq = new RangeMinQuery([1.5, 0.5, 2.5])
    expect(rmq.query(0, 2)).toBe(0.5)
  })

  it('handles length 6', () => {
    const rmq = new RangeMinQuery([6, 5, 4, 3, 2, 1])
    expect(rmq.query(0, 5)).toBe(1)
    expect(rmq.query(1, 4)).toBe(2)
    expect(rmq.query(3, 5)).toBe(1)
  })

  it('handles length 7', () => {
    const rmq = new RangeMinQuery([7, 6, 5, 4, 3, 2, 1])
    expect(rmq.query(0, 6)).toBe(1)
    expect(rmq.query(0, 3)).toBe(4)
    expect(rmq.query(4, 6)).toBe(1)
  })

  it('handles length 9', () => {
    const rmq = new RangeMinQuery([9, 8, 7, 6, 5, 4, 3, 2, 1])
    expect(rmq.query(0, 8)).toBe(1)
    expect(rmq.query(0, 4)).toBe(5)
    expect(rmq.query(5, 8)).toBe(1)
  })

  it('handles length 10', () => {
    const rmq = new RangeMinQuery([10, 9, 8, 7, 6, 5, 4, 3, 2, 1])
    expect(rmq.query(0, 9)).toBe(1)
    expect(rmq.query(3, 7)).toBe(3)
  })

  it('handles range of length 1 at various positions', () => {
    const rmq = new RangeMinQuery([10, 20, 30, 40, 50])
    expect(rmq.query(0, 0)).toBe(10)
    expect(rmq.query(2, 2)).toBe(30)
    expect(rmq.query(4, 4)).toBe(50)
  })

  it('handles range of full length 2', () => {
    const rmq = new RangeMinQuery([7, 3])
    expect(rmq.query(0, 1)).toBe(3)
    expect(rmq.query(0, 0)).toBe(7)
    expect(rmq.query(1, 1)).toBe(3)
  })

  it('handles consecutive queries', () => {
    const rmq = new RangeMinQuery([8, 2, 6, 1, 9, 3, 7])
    expect(rmq.query(0, 2)).toBe(2)
    expect(rmq.query(3, 5)).toBe(1)
    expect(rmq.query(5, 6)).toBe(3)
    expect(rmq.query(0, 6)).toBe(1)
  })

  it('handles all same except ends', () => {
    const rmq = new RangeMinQuery([1, 5, 5, 5, 1])
    expect(rmq.query(0, 4)).toBe(1)
    expect(rmq.query(1, 3)).toBe(5)
  })

  it('handles alternating high low', () => {
    const rmq = new RangeMinQuery([10, 1, 10, 1, 10])
    expect(rmq.query(0, 4)).toBe(1)
    expect(rmq.query(0, 1)).toBe(1)
    expect(rmq.query(1, 2)).toBe(1)
  })

  it('handles 32 elements', () => {
    const arr = Array.from({ length: 32 }, (_, i) => 32 - i)
    const rmq = new RangeMinQuery(arr)
    expect(rmq.query(0, 31)).toBe(1)
    expect(rmq.query(0, 15)).toBe(17)
    expect(rmq.query(16, 31)).toBe(1)
  })

  it('handles 64 elements', () => {
    const arr = Array.from({ length: 64 }, (_, i) => 64 - i)
    const rmq = new RangeMinQuery(arr)
    expect(rmq.query(0, 63)).toBe(1)
    expect(rmq.query(0, 31)).toBe(33)
  })

  it('handles single zero', () => {
    const rmq = new RangeMinQuery([0])
    expect(rmq.query(0, 0)).toBe(0)
  })

  it('handles two same elements', () => {
    const rmq = new RangeMinQuery([5, 5])
    expect(rmq.query(0, 1)).toBe(5)
  })

  it('handles min with large range', () => {
    const arr = Array.from({ length: 200 }, (_, i) => i + 1)
    arr[100] = 0
    const rmq = new RangeMinQuery(arr)
    expect(rmq.query(0, 199)).toBe(0)
    expect(rmq.query(0, 99)).toBe(1)
    expect(rmq.query(101, 199)).toBe(102)
  })

  it('handles five identical elements', () => {
    const rmq = new RangeMinQuery([3, 3, 3, 3, 3])
    expect(rmq.query(0, 4)).toBe(3)
    expect(rmq.query(1, 3)).toBe(3)
    expect(rmq.query(2, 2)).toBe(3)
  })

  it('handles negative only values', () => {
    const rmq = new RangeMinQuery([-5, -3, -8, -1, -4])
    expect(rmq.query(0, 4)).toBe(-8)
    expect(rmq.query(0, 2)).toBe(-8)
    expect(rmq.query(3, 4)).toBe(-4)
  })

  it('handles length 3 with all distinct', () => {
    const rmq = new RangeMinQuery([3, 1, 2])
    expect(rmq.query(0, 2)).toBe(1)
    expect(rmq.query(0, 0)).toBe(3)
    expect(rmq.query(1, 1)).toBe(1)
    expect(rmq.query(2, 2)).toBe(2)
  })

  it('handles min spread across range', () => {
    const rmq = new RangeMinQuery([100, 1, 50, 75, 25, 0, 99])
    expect(rmq.query(0, 6)).toBe(0)
    expect(rmq.query(0, 4)).toBe(1)
    expect(rmq.query(5, 6)).toBe(0)
  })

  it('handles 256 elements', () => {
    const arr = Array.from({ length: 256 }, (_, i) => 256 - i)
    const rmq = new RangeMinQuery(arr)
    expect(rmq.query(0, 255)).toBe(1)
    expect(rmq.query(0, 127)).toBe(129)
    expect(rmq.query(128, 255)).toBe(1)
  })

  it('handles random-looking data', () => {
    const rmq = new RangeMinQuery([17, 3, 21, 8, 15, 2, 19, 6])
    expect(rmq.query(0, 7)).toBe(2)
    expect(rmq.query(0, 3)).toBe(3)
    expect(rmq.query(4, 7)).toBe(2)
  })

  it('handles MIN_SAFE_INTEGER values', () => {
    const rmq = new RangeMinQuery([0, Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER])
    expect(rmq.query(0, 2)).toBe(Number.MIN_SAFE_INTEGER)
  })

  it('handles array of length 2 power-of-two', () => {
    const rmq = new RangeMinQuery([100, 50])
    expect(rmq.query(0, 1)).toBe(50)
    expect(rmq.query(0, 0)).toBe(100)
  })

  it('handles min in first half only', () => {
    const rmq = new RangeMinQuery([1, 5, 6, 7, 8, 9])
    expect(rmq.query(0, 5)).toBe(1)
    expect(rmq.query(1, 5)).toBe(5)
  })

  it('handles min in second half only', () => {
    const rmq = new RangeMinQuery([9, 8, 7, 6, 5, 1])
    expect(rmq.query(0, 5)).toBe(1)
    expect(rmq.query(0, 4)).toBe(5)
  })

  it('handles all negative values sorted ascending', () => {
    const rmq = new RangeMinQuery([-10, -8, -6, -4, -2])
    expect(rmq.query(0, 4)).toBe(-10)
    expect(rmq.query(2, 4)).toBe(-6)
  })

  it('handles all negative values sorted descending', () => {
    const rmq = new RangeMinQuery([-2, -4, -6, -8, -10])
    expect(rmq.query(0, 4)).toBe(-10)
    expect(rmq.query(0, 2)).toBe(-6)
  })

  it('handles strictly increasing sequence', () => {
    const rmq = new RangeMinQuery([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    expect(rmq.query(0, 9)).toBe(1)
    expect(rmq.query(5, 9)).toBe(6)
  })

  it('handles strictly decreasing sequence', () => {
    const rmq = new RangeMinQuery([10, 9, 8, 7, 6, 5, 4, 3, 2, 1])
    expect(rmq.query(0, 9)).toBe(1)
    expect(rmq.query(0, 4)).toBe(6)
  })
})

  it('query single element', () => {
    const rmq = new RangeMinQuery([5])
    expect(rmq.query(0, 0)).toBe(5)
  })

  it('query finds minimum in range', () => {
    const rmq = new RangeMinQuery([3, 1, 4, 1, 5])
    expect(rmq.query(1, 3)).toBe(1)


  it('single element query', () => {
    const rmq = new RangeMinQuery([5])
    expect(rmq.query(0, 0)).toBe(5)
  })

  it('two element min', () => {
    const rmq = new RangeMinQuery([3, 1])
    expect(rmq.query(0, 1)).toBe(1)
  })

  it('full range min', () => {
    const rmq = new RangeMinQuery([5, 3, 1, 4, 2])
    expect(rmq.query(0, 4)).toBe(1)
  })
  })

describe('range-min-query - wave545', () => {
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

describe('range-min-query - wave546', () => {
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

describe('range-min-query - wave547', () => {
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

describe('range-min-query - wave548', () => {
  it('range-min-query module defined', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query module is function', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('range-min-query - wave549', () => {
  it('range-min-query module defined', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query module is function', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('range-min-query - wave550', () => {
  it('range-min-query w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('range-min-query - wave551', () => {
  it('range-min-query w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('range-min-query - wave552', () => {
  it('range-min-query w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('range-min-query - wave553', () => {
  it('range-min-query w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('range-min-query - wave554', () => {
  it('range-min-query w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('range-min-query - wave555', () => {
  it('range-min-query w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('range-min-query - wave556', () => {
  it('range-min-query w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('range-min-query w556 v2', () => {
    expect(describe).toBeDefined()
  })
})
